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
 *
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : seul l'habillage change, ici et dans
 * les trois autres .tsx de la calculette. `.calc` est posée sur la racine de
 * l'îlot et sur ce que Radix rend dans <body> (bulles, listes, menu, boîtes de
 * confirmation) ; src/styles/calculette.css y donne les couleurs et les formes
 * de la DA, par les jetons des composants partagés, par leur rôle, et en
 * recouvrant les utilitaires de couleur. États, effets, gestionnaires, schéma,
 * moteur, sauvegarde locale : pas une ligne.
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
        <section className="calc calc-ile grid lg:grid-cols-[1fr_420px] gap-6 lg:items-start overflow-x-clip print:block print:gap-0 print:px-0 print:overflow-visible">
          <div className="space-y-3 min-w-0 print:hidden">
            <div className="calc-barre sticky z-10 flex items-center justify-between gap-2 flex-wrap print:hidden">
              <span className="calc-sur">
                {values.regimeFiscal === 'micro_bnc' ? 'Recettes Micro-BNC' : 'Cases 2035'}
              </span>
              <div className="flex items-center gap-1">
                {results.hasInputs && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="calc-outil fort lg:hidden"
                    onClick={() => {
                      document.getElementById('calculette-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Voir mes résultats ↓
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="calc-outil">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      Charger un exemple
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="calc calc-pop calc-menu w-72">
                    {CALCULETTE_EXAMPLES.map((ex) => (
                      <DropdownMenuItem
                        key={ex.id}
                        onClick={() => onExampleClick(ex)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="text-sm font-medium">{ex.label}</span>
                        <span className="calc-menu-desc">{ex.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Separator orientation="vertical" className="h-5 mx-1" />
                <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="calc-outil">
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
                  className="calc-btn calc-btn-soleil w-full"
                >
                  Voir mes résultats
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}
            <div className="calc-separe lg:hidden">
              <div />
              <p className="calc-sur">
                <span>Résultats</span>
              </p>
            </div>
          </div>
          <div id="calculette-results" className="calc-colonne lg:sticky min-w-0 print:static print:top-0 print:bg-transparent">
            <div className="calc-resultats relative overflow-hidden p-5 sm:p-7 print:shadow-none print:border-0 print:ring-0 print:p-0 print:rounded-none">
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
        <AlertDialogContent className="calc calc-dialogue">
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
        <AlertDialogContent className="calc calc-dialogue">
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
              className="calc-danger"
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
