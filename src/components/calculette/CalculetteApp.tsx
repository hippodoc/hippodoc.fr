import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Toaster, toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';
import { calculetteSchema, CALCULETTE_DEFAULTS, type CalculetteFormValues } from './calculetteSchema';
import { CALCULETTE_EXAMPLES } from './calculetteExamples';
import { CalculetteForm } from './CalculetteForm';
import { CalculetteResultsView } from './CalculetteResults';
import { useCalculetteResults } from './useCalculetteResults';
import { useCalculettePersistence, resetCalculettePersistence } from './useCalculettePersistence';

/**
 * Îlot public HippoCalc — orchestration portée de
 * src/pages/guide-declarations/calculette.tsx (branche `embedded=false`),
 * sans le Header/Footer/Hero/CTA marketing/FAQ/Disclaimer qui sont rendus en
 * HTML statique par la page Astro (src/pages/guide-declarations/calculette.astro).
 *
 * Toujours en contexte analytics 'public' (pas de variante « connectée » ici —
 * celle-ci reste dans l'app authentifiée, hors périmètre du site public).
 */
const ANALYTICS_CONTEXT = 'public' as const;

export default function CalculetteApp() {
  const methods = useForm<CalculetteFormValues>({
    resolver: zodResolver(calculetteSchema),
    defaultValues: CALCULETTE_DEFAULTS,
    mode: 'onChange',
  });

  useCalculettePersistence(methods);

  // Évite la re-création d'un nouvel objet à chaque render (vs methods.watch()).
  const watched = useWatch({ control: methods.control });
  const values = (watched && Object.keys(watched).length > 0
    ? watched
    : methods.getValues()) as CalculetteFormValues;
  const results = useCalculetteResults(values);
  const showZeros = !!values.showZeros;
  const setShowZeros = (v: boolean) => methods.setValue('showZeros', v, { shouldDirty: true });

  // Déclarant 1/2 : volatile (réinit à 1 au reload), non passé aux exemples.
  const declarant = (values.declarant ?? 1) as 1 | 2;

  // Confirmation avant écrasement par un exemple.
  const [pendingExample, setPendingExample] = useState<(typeof CALCULETTE_EXAMPLES)[number] | null>(null);
  const applyExample = (ex: (typeof CALCULETTE_EXAMPLES)[number]) => {
    methods.reset({ ...ex.values, showZeros: values.showZeros, declarant });
    trackEvent('calculette_2042_dspamc_example_loaded', { id: ex.id, context: ANALYTICS_CONTEXT });
    toast.success(`Exemple chargé : ${ex.label}`, { description: ex.description });
  };
  const onExampleClick = (ex: (typeof CALCULETTE_EXAMPLES)[number]) => {
    if (results.hasInputs) {
      setPendingExample(ex);
    } else {
      applyExample(ex);
    }
  };

  // Checklist saisies minimales par régime.
  const minimalChecklist = useMemo(() => {
    if (values.regimeFiscal === 'micro_bnc') {
      return [
        { ok: values.recettesMicroBnc > 0, label: 'Recettes brutes encaissées (5HQ)' },
      ];
    }
    return [
      { ok: values.AA > 0 || values.AF > 0, label: 'Recettes (AA conventionné ou AF gains divers)' },
      { ok: values.CE > 0 || values.CN > 0, label: 'Excédent (CE) ou Insuffisance (CN)' },
      { ok: values.CP !== 0, label: 'Résultat BNC (CP, ligne 46)' },
    ];
  }, [values.regimeFiscal, values.recettesMicroBnc, values.AA, values.AF, values.CE, values.CN, values.CP]);

  useEffect(() => {
    trackEvent('calculette_2042_dspamc_view', { context: ANALYTICS_CONTEXT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirmation avant reset si données saisies.
  const [confirmReset, setConfirmReset] = useState(false);
  const doReset = () => {
    resetCalculettePersistence(methods);
    toast.success('Calculette réinitialisée.');
  };
  const handleReset = () => {
    if (results.hasInputs) setConfirmReset(true);
    else doReset();
  };

  // Track du premier submit valide.
  const trackedSubmit = useRef(false);
  useEffect(() => {
    if (!trackedSubmit.current && results.hasInputs) {
      trackedSubmit.current = true;
      trackEvent('calculette_2042_dspamc_submit', { annee: values.annee, context: ANALYTICS_CONTEXT });
    }
  }, [results.hasInputs, values.annee]);

  return (
    <>
      <FormProvider {...methods}>
        <section className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1fr_420px] gap-6 lg:items-start overflow-x-clip print:block print:gap-0 print:px-0 print:overflow-visible">
          <div className="space-y-3 min-w-0 print:hidden">
            <div className="sticky top-16 sm:top-20 z-10 -mx-2 px-2 py-2 bg-[#fafbfc]/90 dark:bg-background/85 backdrop-blur-sm border-b border-[#e8ecf1] dark:border-border/40 flex items-center justify-between gap-2 flex-wrap print:hidden">
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-muted-foreground">
                {values.regimeFiscal === 'micro_bnc' ? 'Recettes Micro-BNC' : 'Cases 2035'}
              </span>
              <div className="flex items-center gap-1">
                {results.hasInputs && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-hippo-600 hover:text-hippo-700 text-xs"
                    onClick={() => {
                      document.getElementById('calculette-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Voir mes résultats ↓
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      Charger un exemple
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    {CALCULETTE_EXAMPLES.map((ex) => (
                      <DropdownMenuItem
                        key={ex.id}
                        onClick={() => onExampleClick(ex)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-sm font-medium">{ex.label}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">{ex.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-destructive text-xs">
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Réinitialiser
                </Button>
              </div>
            </div>
            <CalculetteForm />
            {results.hasInputs && (
              <div className="lg:hidden pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    document.getElementById('calculette-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full bg-hippo-500 hover:bg-hippo-600 text-white shadow-sm"
                >
                  Voir mes résultats
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}
            <div className="lg:hidden pt-8 pb-2">
              <div className="border-t border-[#e8ecf1] dark:border-border/60" />
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-muted-foreground text-center -mt-2">
                <span className="bg-[#fafbfc] dark:bg-background px-3">Résultats</span>
              </p>
            </div>
          </div>
          <div id="calculette-results" className="lg:sticky lg:top-24 min-w-0 scroll-mt-20 print:static print:top-0 print:bg-transparent">
            <div className="relative overflow-hidden bg-white dark:bg-card rounded-2xl border border-[#e8ecf1] dark:border-border/60 shadow-md shadow-slate-200/40 lg:shadow-xl lg:shadow-slate-200/50 dark:shadow-none ring-1 ring-inset ring-white/60 dark:ring-white/5 p-5 sm:p-7 print:shadow-none print:border-0 print:ring-0 print:p-0 print:rounded-none">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-hippo-500/20 via-hippo-500 to-hippo-500/20 print:hidden" />
              <CalculetteResultsView
                results={results}
                annee={values.annee}
                chequesVacancesSaisis={values.chequesVacances}
                profil={values.profil}
                depassementsAutorises={values.depassementsAutorises}
                showZeros={showZeros}
                onShowZerosChange={setShowZeros}
                cpValue={values.CP}
                minimalChecklist={minimalChecklist}
                declarant={declarant}
                connectedMode={false}
              />
            </div>
          </div>
        </section>
      </FormProvider>

      {/* Confirmation avant écrasement par un exemple */}
      <AlertDialog open={pendingExample !== null} onOpenChange={(o) => !o && setPendingExample(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer ta saisie en cours ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu as déjà des cases remplies. Charger l'exemple <strong>{pendingExample?.label}</strong> écrasera tes saisies actuelles. Tu pourras toujours réinitialiser ensuite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingExample) applyExample(pendingExample);
                setPendingExample(null);
              }}
            >
              Remplacer par l'exemple
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation avant réinitialisation */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser la calculette ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes tes cases saisies seront effacées et ta sauvegarde locale supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { doReset(); setConfirmReset(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toasts (sonner) — pas de wrapper next-themes côté Astro : suit le thème système. */}
      <Toaster />
    </>
  );
}
