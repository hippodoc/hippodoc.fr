import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Calculator, Info, Stethoscope, MapPin, Briefcase, Heart, Wallet, Users, Settings, ChevronDown, Plus, Shield, PiggyBank, GraduationCap, Home, Map } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PremiumTooltip } from "@/components/simulateur/PremiumTooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { simulateurSchema, isZoneExoneneeAvailable, type SimulateurFormData } from "./simulateurSchema";
import { DOM_TOM_CONFIG, getDomTomInfo, formatTauxAbattement, formatPlafond, type LieuExercice } from "@/lib/dom-tom";
import { getDeclarationParams } from "@/lib/declarationParams";
import { calculateCreditFormation, SMIC_HORAIRE_2025, getPerCap } from "@/lib/baremes-ir";
import { cn } from "@/lib/utils";

interface SimulateurFormProps {
  onSubmit: (data: SimulateurFormData) => void;
  loading?: boolean;
  defaultValues?: Partial<SimulateurFormData>;
  hasProfileData?: boolean;
}

// ─── Tooltip helper components ─────────────────────────────────────────────
const TipBox = ({ children, variant = "tip" }: { children: React.ReactNode; variant?: "tip" | "warning" | "info" }) => {
  const colors = {
    tip: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800",
    warning: "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    info: "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  };
  const textColors = {
    tip: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    info: "text-blue-700 dark:text-blue-300",
  };
  return (
    <div className={cn("rounded-lg border p-2", colors[variant])}>
      <div className={cn("text-[10px]", textColors[variant])}>{children}</div>
    </div>
  );
};

/**
 * Valeurs par défaut COMPLÈTES du formulaire.
 *
 * Extraites du `useForm` pour être réutilisables par `reset()`. Un profil type ne
 * renseigne qu'une douzaine de champs sur vingt-six, or `form.reset()` REMPLACE
 * tout l'état : les champs absents devenaient `undefined`, laissant des listes
 * déroulantes vides après le choix d'un profil.
 */
export const SIMULATEUR_DEFAULTS = {
    periode: 'annuel',
    annee: 2026,
    recettesBrutes: 0,
    chargesHorsCotisations: 0,
    revenusSalaries: 0,
    revenusConjoint: 0,
    typeRevenuConjoint: 'salarie',
    revenusExoneresPdsa: 0,
    lieuExercice: 'metropole',
    situationFamiliale: 'celibataire',
    enfants: 0,
    secteurConventionnel: 'secteur_1',
    regimeSocial: 'auto',
    forfait2pct: true,
    cotisationsVolontaires: 0,
    typeCotisationsVolontaires: 'per',
    // Phase 2
    zoneExoneree: 'aucune',
    regimeFoncier: 'aucun',
    revenusFonciersBruts: 0,
    revenuFoncierNet: 0,
    creditFormationDirigeant: false,
    heuresFormation: 0,
    creditImpotAutre: 0,
    fraisEmploiDomicile: 0,
    fraisGardeEnfants: 0,
    nombreEnfantsGarde: 0,
    chequesVacances: 0,
    // Phase 3
    tauxRid: '25%',
    situationCarmf: 'affilie_3ans_plus' as const,
    ratioNonConventionne: 0,
} satisfies Partial<SimulateurFormData>;

// Composant réutilisable pour les en-têtes de section
const SectionHeader = ({ 
  icon: Icon, 
  title, 
  colorClass,
  iconColorClass 
}: { 
  icon: React.ElementType; 
  title: string; 
  colorClass: string;
  iconColorClass: string;
}) => (
  <div className={cn("flex items-center gap-2.5 pb-3 mb-4 border-b", colorClass)}>
    <div className={cn("p-1.5 rounded-lg", iconColorClass)}>
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="font-semibold text-base">{title}</h3>
  </div>
);

export const SimulateurForm = forwardRef<any, SimulateurFormProps>(
  ({ onSubmit, loading = false, defaultValues, hasProfileData = false }, ref) => {
    const [isRevenusComplementairesOpen, setIsRevenusComplementairesOpen] = useState(false);
    const [isOptionsAvanceesOpen, setIsOptionsAvanceesOpen] = useState(false);
    
    const form = useForm<SimulateurFormData>({
      resolver: zodResolver(simulateurSchema),
      defaultValues: defaultValues || SIMULATEUR_DEFAULTS,
    });

    // Watch lieu d'exercice pour affichage DOM-TOM
    const lieuExercice = form.watch('lieuExercice');
    const domTomInfo = getDomTomInfo(lieuExercice);
    
    // Watch situation familiale pour affichage conditionnel du champ conjoint
    const situationFamiliale = form.watch('situationFamiliale');
    const showConjointField = situationFamiliale === 'marie_pacse';
    
    // Watch revenus conjoint pour affichage conditionnel du sélecteur type de revenu
    const revenusConjoint = form.watch('revenusConjoint');
    
    // Watch revenus complémentaires pour auto-expand si remplis
    const revenusSalaries = form.watch('revenusSalaries');
    const revenusExoneresPdsa = form.watch('revenusExoneresPdsa');
    
    // Watch secteur + régime pour affichage conditionnel forfait 2%
    const secteurConventionnel = form.watch('secteurConventionnel');
    const cotisationsVolontaires = form.watch('cotisationsVolontaires');
    const forfait2pct = form.watch('forfait2pct');
    // Phase 2 watches
    const zoneExoneree = form.watch('zoneExoneree');
    const regimeFoncier = form.watch('regimeFoncier');
    const creditFormationDirigeant = form.watch('creditFormationDirigeant');
    // Phase 3 watches
    const regimeSocial = form.watch('regimeSocial');
    const recettesBrutes = form.watch('recettesBrutes');
    const periode = form.watch('periode');
    const situationCarmf = form.watch('situationCarmf');
    // Le toggle RID s'affiche dès qu'on est en RSPM (effectif ou auto < 38k€).
    // La dispense CARMF n'a aucun effet en RSPM : la RID reste obligatoire et
    // doit pouvoir être paramétrée (157€ ou 626€ en 2026).
    const annualRecettes = periode === 'mensuel' ? (recettesBrutes || 0) * 12 : (recettesBrutes || 0);
    const isRspmEffectif = regimeSocial === 'rspm' || (regimeSocial === 'auto' && annualRecettes < 38000);
    const showRidToggle = isRspmEffectif;

    // Exposer la méthode reset via la ref - avec préservation des champs personnels
    useImperativeHandle(ref, () => ({
      reset: (values: Partial<SimulateurFormData>) => {
        // Récupérer les valeurs actuelles pour préserver les champs personnels
        const currentValues = form.getValues();
        
        // Préserver TOUS les champs personnels si modifiés par l'utilisateur
        // Ces champs représentent la situation du foyer fiscal, pas le profil professionnel
        const preservedPersonalFields: Partial<SimulateurFormData> = {};
        
        // Préserver situationFamiliale si modifié (différent du défaut 'celibataire')
        if (currentValues.situationFamiliale && currentValues.situationFamiliale !== 'celibataire') {
          preservedPersonalFields.situationFamiliale = currentValues.situationFamiliale;
        }
        
        // Préserver enfants si l'utilisateur a saisi une valeur > 0
        if (currentValues.enfants && currentValues.enfants > 0) {
          preservedPersonalFields.enfants = currentValues.enfants;
        }
        
        // Préserver revenusConjoint si l'utilisateur a saisi une valeur > 0
        if (currentValues.revenusConjoint && currentValues.revenusConjoint > 0) {
          preservedPersonalFields.revenusConjoint = currentValues.revenusConjoint;
        }
        
        // Préserver typeRevenuConjoint si modifié (différent de la valeur par défaut 'salarie')
        if (currentValues.typeRevenuConjoint && currentValues.typeRevenuConjoint !== 'salarie') {
          preservedPersonalFields.typeRevenuConjoint = currentValues.typeRevenuConjoint;
        }
        
        // Fusionner : profil type + champs personnels préservés
        // On repart des défauts COMPLETS : sans cela, tout champ absent du profil
      // type restait `undefined` après le reset (listes déroulantes vides).
      const mergedValues = {
          ...SIMULATEUR_DEFAULTS,
          ...values,
          ...preservedPersonalFields,
        };
        
        form.reset(mergedValues);
        
        // Auto-expand si revenus complémentaires pré-remplis
        if (mergedValues.revenusSalaries || mergedValues.revenusExoneresPdsa) {
          setIsRevenusComplementairesOpen(true);
        }
      }
    }));

    // Auto-expand au montage si revenus complémentaires pré-remplis (une seule fois)
    useEffect(() => {
      const values = form.getValues();
      const hasInitialRevenusComplementaires = 
        (values.revenusSalaries && values.revenusSalaries > 0) || 
        (values.revenusExoneresPdsa && values.revenusExoneresPdsa > 0);
      
      if (hasInitialRevenusComplementaires) {
        setIsRevenusComplementairesOpen(true);
      }
    }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 : TES REVENUS (Essentiel)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border-2 border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/20 p-4 sm:p-5 shadow-sm">
          <SectionHeader 
            icon={Wallet} 
            title="Tes revenus" 
            colorClass="border-emerald-200 dark:border-emerald-800"
            iconColorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
          />
          
          {/* Champs essentiels : Recettes + Charges (toujours visibles) */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Recettes brutes */}
            <FormField
              control={form.control}
              name="recettesBrutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Tes revenus libéraux
                    <PremiumTooltip
                      title="Revenus libéraux"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Tes recettes libérales brutes</p>
                          <p className="text-xs">
                            Total de tous tes honoraires encaissés en libéral sur l'année : consultations, actes techniques, dépassements, PDSA…
                          </p>
                          <TipBox variant="info">
                            <p className="font-medium">📝 Où trouver ce montant ?</p>
                            <p className="mt-0.5">Sur ton relevé SNIR (Sécu), ta comptabilité, ou le total de tes rétrocessions reçues.</p>
                          </TipBox>
                          <TipBox variant="tip">
                            <p>💡 Saisis ici le total de tes honoraires, y compris la part PDSA. Ensuite, indique le montant PDSA dans le champ ci-dessous → il sera automatiquement exonéré d'IR.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 80 000"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Montant {periode === 'mensuel' ? 'mensuel' : 'annuel'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Charges réelles */}
            <FormField
              control={form.control}
              name="chargesHorsCotisations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Tes charges réelles
                    <PremiumTooltip
                      title="Charges réelles"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Tes dépenses professionnelles</p>
                          <p className="text-xs">Loyer cabinet, matériel médical, véhicule, RCP, comptable, téléphone, formations…</p>
                          <div className="text-xs space-y-1 border-t border-border pt-2 mt-2">
                            <p><strong>Ne pas inclure ici :</strong></p>
                            <p>• Cotisations sociales (URSSAF, CARMF) → calculées automatiquement</p>
                            <p>• Déductions fiscales (forfait 2%, PER, Madelin) → Options avancées</p>
                            <p>• En Micro-BNC, un abattement de 34% remplace ces charges</p>
                          </div>
                        </div>
                      }
                    >
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15 000"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Dépenses pro (loyer, matériel, RCP…) · <span className="italic">hors cotisations sociales et déductions fiscales</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Collapsible : Revenus complémentaires (optionnel) */}
          <Collapsible 
            open={isRevenusComplementairesOpen} 
            onOpenChange={setIsRevenusComplementairesOpen}
          >
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-950/30 py-2 px-3 h-auto"
              >
                <span className="flex items-center gap-1.5 sm:gap-2 text-sm flex-wrap">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="sm:hidden">Revenus complémentaires</span>
                  <span className="hidden sm:inline">Revenus complémentaires (Salariat, PDSA...)</span>
                  <Badge variant="outline" className="text-[10px] font-normal">Optionnel</Badge>
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isRevenusComplementairesOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4 border-t border-dashed border-emerald-200 dark:border-emerald-800 mt-3">
              {/* Revenus salariés */}
              <FormField
                control={form.control}
                name="revenusSalaries"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm">
                      Revenus salariés (si cumul)
                      <PremiumTooltip
                        title="Revenus salariés"
                        content={
                          <div className="space-y-2">
                            <p className="font-semibold">Revenus salariés annuels</p>
                            <p className="text-xs">
                              Si tu cumules une activité salariée (gardes hospitalières, urgences, centre de santé, vacations…), saisis ici ton <strong>net imposable annuel</strong>.
                            </p>
                            <TipBox variant="warning">
                              <p className="font-medium">⚠️ Net imposable ≠ Net à payer</p>
                              <p className="mt-0.5">Le net à payer est APRÈS le prélèvement à la source. Ici, il faut le montant AVANT (plus élevé).</p>
                            </TipBox>
                            <TipBox variant="info">
                              <p className="font-medium">📝 Où le trouver ?</p>
                              <p className="mt-0.5">Fiche de paie → ligne "Net imposable" ou "Cumul net imposable" en décembre.</p>
                            </TipBox>
                            <TipBox variant="tip">
                              <p>💡 L'abattement de 10% pour frais professionnels est appliqué automatiquement par le simulateur.</p>
                            </TipBox>
                          </div>
                        }
                      >
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </PremiumTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 20 000"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Revenus PDSA exonérés */}
              <FormField
                control={form.control}
                name="revenusExoneresPdsa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm">
                      Revenus PDSA
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700">
                        Exonéré IR
                      </Badge>
                      <PremiumTooltip
                        title="Revenus PDSA"
                        content={
                          <div className="space-y-2">
                            <p className="font-semibold">Permanence Des Soins Ambulatoires</p>
                            <p className="text-xs">
                              Rémunérations de tes gardes de nuit, week-end et jours fériés dans le cadre de la PDSA (gardes régulées par l'ARS).
                            </p>
                            <TipBox variant="tip">
                              <p className="font-medium">✅ Exonéré d'impôt sur le revenu</p>
                              <p className="mt-0.5">Art. 151 ter du CGI — dans la limite de 60 jours de permanence par an.</p>
                            </TipBox>
                            <TipBox variant="warning">
                              <p>⚠️ Reste soumis aux cotisations sociales (URSSAF/CARMF). Seul l'IR est exonéré.</p>
                            </TipBox>
                          </div>
                        }
                      >
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </PremiumTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5 000"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 : TA SITUATION FISCALE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border-2 border-pink-200/60 dark:border-pink-800/40 bg-gradient-to-br from-white to-pink-50/30 dark:from-slate-900 dark:to-pink-950/20 p-4 sm:p-5 shadow-sm">
          <SectionHeader 
            icon={Users} 
            title="Ta situation fiscale" 
            colorClass="border-pink-200 dark:border-pink-800"
            iconColorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-400"
          />
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Situation familiale */}
            <FormField
              control={form.control}
              name="situationFamiliale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 flex-wrap">
                    Situation familiale
                    {hasProfileData && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        Pré-rempli
                      </Badge>
                    )}
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Célibataire" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie_pacse">Marié(e) ou Pacsé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf(ve)</SelectItem>
                      <SelectItem value="parent_isole">Parent isolé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Enfants */}
            <FormField
              control={form.control}
              name="enfants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 flex-wrap">
                    Enfants à charge
                    {hasProfileData && (
                      <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                        Pré-rempli
                      </Badge>
                    )}
                    <PremiumTooltip
                      title="Enfants à charge"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Parts fiscales pour enfants</p>
                          <p className="text-xs">
                            Chaque enfant à charge augmente ton quotient familial → baisse ton taux d'imposition.
                          </p>
                          <TipBox variant="info">
                            <p className="font-medium mb-1">📊 Parts par enfant :</p>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                              <span>1er enfant</span><span className="font-semibold">+0,5 part</span>
                              <span>2ème enfant</span><span className="font-semibold">+0,5 part</span>
                              <span>3ème et suivants</span><span className="font-semibold">+1 part chacun</span>
                            </div>
                          </TipBox>
                          <TipBox variant="tip">
                            <p>💡 Garde alternée ? Saisis des demi-parts (ex: 1 enfant en alternée = 0.5). Le plafonnement du QF est calculé automatiquement.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      {...field}
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Revenus du conjoint (visible uniquement si marié/pacsé) */}
          {showConjointField && (
            <div className="mt-4 pt-4 border-t border-dashed border-pink-200 dark:border-pink-800 space-y-4">
                <FormField
                control={form.control}
                name="revenusConjoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 flex-wrap">
                      <Heart className="h-4 w-4 text-pink-500 flex-shrink-0" />
                      <span className="sm:hidden">Revenus nets conjoint, si en couple (annuel)</span>
                      <span className="hidden sm:inline">Revenus nets avant impôt du conjoint, si en couple (par an)</span>
                      <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-700">
                        Optionnel
                      </Badge>
                      <PremiumTooltip
                        title="Revenus du conjoint"
                        content={
                          <div className="space-y-2">
                            <p className="font-semibold">Revenus nets imposables du conjoint</p>
                            <p className="text-xs">
                              En déclaration commune (mariage/PACS), l'impôt est calculé sur l'ensemble des revenus du foyer. Saisir les revenus de ton conjoint améliore la précision.
                            </p>
                            <TipBox variant="warning">
                              <p className="font-medium">⚠️ Net imposable, pas net à payer</p>
                              <p className="mt-0.5">Si salarié : cumul "Net imposable" sur la fiche de paie de décembre.</p>
                            </TipBox>
                            <TipBox variant="tip">
                              <p>💡 Affecte ton taux d'imposition via le quotient familial, mais PAS ton Super-Net (qui reste ton revenu à toi seul).</p>
                            </TipBox>
                          </div>
                        }
                      >
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </PremiumTooltip>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 35 000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === '' ? 0 : parseFloat(v) || 0);
                          }}
                          onFocus={(e) => e.target.select()}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Améliore la précision du calcul d'impôt pour ton foyer fiscal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sélecteur type de revenu du conjoint (conditionnel si montant > 0) */}
              {revenusConjoint > 0 && (
                <FormField
                  control={form.control}
                  name="typeRevenuConjoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Type de revenu du conjoint
                        <PremiumTooltip
                          title="Type de revenu du conjoint"
                          content={
                            <div className="space-y-2">
                              <p className="font-semibold">Pourquoi le type de revenu ?</p>
                              <p className="text-xs">
                                Le fisc applique un abattement différent selon la nature des revenus. Ça change le revenu imposable du foyer et donc ton taux d'imposition.
                              </p>
                              <TipBox variant="info">
                                <div className="space-y-1">
                                  <p><strong>Salarié/Retraite</strong> → abattement 10 % (max 14 426 € en 2025-2026)</p>
                                  <p><strong>Libéral Micro-BNC</strong> → abattement 34%</p>
                                  <p><strong>Libéral Réel</strong> → pas d'abattement (saisis le <strong>bénéfice fiscal</strong>, pas le CA — sinon impôt fortement surévalué)</p>
                                  <p><strong>Autre</strong> → pas d'abattement (montant déjà imposable, ex. revenus fonciers nets)</p>
                                </div>
                              </TipBox>
                            </div>
                          }
                        >
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </PremiumTooltip>
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de revenu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="salarie">
                            💼 Salarié / Retraite (abattement 10%)
                          </SelectItem>
                          <SelectItem value="liberal_micro">
                            📄 Libéral Micro-BNC (abattement 34%)
                          </SelectItem>
                          <SelectItem value="liberal_reel">
                            📊 Libéral Réel (bénéfice fiscal)
                          </SelectItem>
                          <SelectItem value="autre">
                            📋 Autre (revenus fonciers, etc.)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 : PARAMÈTRES DE CALCUL (Secondaire)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 shadow-sm">
          <SectionHeader 
            icon={Settings} 
            title="Paramètres de calcul" 
            colorClass="border-slate-200 dark:border-slate-700"
            iconColorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Année fiscale */}
            <FormField
              control={form.control}
              name="annee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Calculator className="h-3.5 w-3.5" />
                    Année
                    <PremiumTooltip
                      title="Année fiscale"
                      content={
                        <div className="space-y-2">
                          <p className="text-xs">
                            Saisis tes revenus de l'année concernée. Le barème IR appliqué correspond à celui de la déclaration N+1.
                          </p>
                          <TipBox variant="info">
                            <p>📅 Ex&nbsp;: revenus 2025 → barème déclaration 2026.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="2026" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Lieu d'exercice (DOM-TOM) */}
            <FormField
              control={form.control}
              name="lieuExercice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    Lieu d'exercice
                    <PremiumTooltip
                      title="Lieu d'exercice"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Abattement fiscal DOM-TOM</p>
                          <p className="text-xs">
                            Les médecins exerçant outre-mer bénéficient d'un abattement sur l'impôt sur le revenu (Art. 197 I-3 CGI).
                          </p>
                          <TipBox variant="tip">
                            <div className="space-y-1">
                              <p>🌴 <strong>Guadeloupe, Martinique, Réunion</strong> → 30% (max {formatPlafond(DOM_TOM_CONFIG.guadeloupe)})</p>
                              <p>🌴 <strong>Guyane, Mayotte</strong> → 40% (max {formatPlafond(DOM_TOM_CONFIG.guyane)})</p>
                            </div>
                          </TipBox>
                          <TipBox variant="info">
                            <p>💡 L'abattement s'applique automatiquement à l'impôt calculé.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="France métro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="metropole">
                        {DOM_TOM_CONFIG.metropole.emoji} France métro
                      </SelectItem>
                      <SelectItem value="guadeloupe">
                        {DOM_TOM_CONFIG.guadeloupe.emoji} Guadeloupe
                      </SelectItem>
                      <SelectItem value="martinique">
                        {DOM_TOM_CONFIG.martinique.emoji} Martinique
                      </SelectItem>
                      <SelectItem value="guyane">
                        {DOM_TOM_CONFIG.guyane.emoji} Guyane
                      </SelectItem>
                      <SelectItem value="reunion">
                        {DOM_TOM_CONFIG.reunion.emoji} Réunion
                      </SelectItem>
                      <SelectItem value="mayotte">
                        {DOM_TOM_CONFIG.mayotte.emoji} Mayotte
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Badge territoire DOM-TOM détecté */}
                  {domTomInfo && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-700/30">
                      <span className="text-sm">{domTomInfo.emoji}</span>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Abattement {formatTauxAbattement(domTomInfo)} (max {formatPlafond(domTomInfo)})
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Secteur conventionnel */}
            <FormField
              control={form.control}
              name="secteurConventionnel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Secteur
                    <PremiumTooltip
                      title="Secteur conventionnel"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Secteur 1 vs Secteur 2</p>
                          <p className="text-xs">
                            <strong>Secteur 1</strong> = tarifs Sécurité sociale (pas de dépassement, sauf DE).<br/>
                            <strong>Secteur 2</strong> = honoraires libres (dépassements autorisés).
                          </p>
                          <TipBox variant="tip">
                            <p className="font-medium">✅ Avantages Secteur 1</p>
                            <p className="mt-0.5">Participation CPAM aux cotisations (ASV, maladie) + déductions spécifiques : forfait 2%, déduction 3%, barème Groupe III.</p>
                          </TipBox>
                          <TipBox variant="warning">
                            <p>⚠️ Secteur 2 : pas de participation CPAM, pas de déductions S1.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="secteur_1">Secteur 1</SelectItem>
                      <SelectItem value="secteur_2">Secteur 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Régime social (RSPM / PAMC) */}
            <FormField
              control={form.control}
              name="regimeSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Briefcase className="h-3.5 w-3.5" />
                    Régime
                    <PremiumTooltip
                      title="Régime social"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">RSPM vs PAMC</p>
                          <p className="text-xs">
                            <strong>RSPM</strong> (Simplifié) : cotisations forfaitaires à taux fixe. Réservé aux revenus libéraux &lt; 38 000€/an.<br/>
                            <strong>PAMC</strong> (Classique) : cotisations proportionnelles réelles, régime standard des médecins libéraux.
                          </p>
                          <TipBox variant="info">
                            <div className="space-y-0.5">
                              <p><strong>RSPM</strong> : 13,5% (0-19k€) puis 21,2% (&gt;19k€) + RID CARMF</p>
                              <p><strong>PAMC</strong> : barème complet URSSAF + CARMF complète</p>
                            </div>
                          </TipBox>
                          <TipBox variant="tip">
                            <p>💡 <strong>Auto = recommandé</strong>. Le simulateur choisit le bon régime selon ton CA.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Régime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">🔄 Auto</SelectItem>
                      <SelectItem value="rspm">🎓 RSPM</SelectItem>
                      <SelectItem value="pamc">🩺 PAMC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 : OPTIONS AVANCÉES (Fusionnée CARMF + Optimisation)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/20 p-4 sm:p-5 shadow-sm">
          <Collapsible open={isOptionsAvanceesOpen} onOpenChange={setIsOptionsAvanceesOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground hover:bg-amber-50 dark:hover:bg-amber-950/30 py-2 px-3 h-auto">
                <span className="flex items-center gap-1.5 sm:gap-2 text-sm flex-wrap">
                  <Settings className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="font-semibold text-foreground">Options avancées</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px]">Optimisation</Badge>
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOptionsAvanceesOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 border-t border-dashed border-amber-200 dark:border-amber-800 mt-3">
              <Accordion type="multiple" className="space-y-2">

                {/* ─── ACCORDION 1 : Retraite & CARMF ─── */}
                <AccordionItem value="carmf" className="rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Retraite & CARMF</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {situationCarmf === 'dispense' && 'Dispensé'}
                        {situationCarmf === 'affilie_jeune' && 'Jeune affilié'}
                        {situationCarmf === 'affilie_3ans_plus' && 'Affilié (cas général)'}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <FormField control={form.control} name="situationCarmf" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">
                          Situation CARMF
                          <PremiumTooltip title="Situation CARMF" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Ta retraite obligatoire de médecin</p>
                              <p className="text-xs">La CARMF (Caisse Autonome de Retraite des Médecins de France) gère ta retraite de base, ta complémentaire et ton invalidité-décès.</p>
                              <TipBox variant="info">
                                <div className="space-y-1">
                                  <p><strong>Affilié</strong> : cotisations complètes (base + complémentaire + invalidité-décès)</p>
                                  <p><strong>&lt; 2 ans, &lt;40 ans</strong> : exonéré de complémentaire les 2 premières années</p>
                                  <p><strong>Dispensé</strong> : sur demande à la CARMF (revenus faibles, démarche non automatique)</p>
                                </div>
                              </TipBox>
                              <TipBox variant="tip">
                                <p>💡 La CARMF est calculée automatiquement par le simulateur.</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'affilie_3ans_plus'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Affilié (cas général)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="affilie_3ans_plus">Affilié (cas général)</SelectItem>
                            <SelectItem value="affilie_jeune">Jeune affilié (&lt; 2 ans, &lt; 40 ans)</SelectItem>
                            <SelectItem value="dispense">Dispensé (sur demande)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs mt-1.5 px-1">
                          {field.value === 'affilie_3ans_plus' && <p className="text-muted-foreground">Cotisations complètes : base + complémentaire + invalidité-décès</p>}
                          {field.value === 'affilie_jeune' && <p className="text-emerald-600 dark:text-emerald-400">✅ Exonéré de complémentaire les 2 premières années — cotisations réduites</p>}
                          {field.value === 'dispense' && !isRspmEffectif && <p className="text-muted-foreground">Aucune cotisation appelée par la CARMF (PAMC : dispense sur demande, revenus faibles).</p>}
                          {field.value === 'dispense' && isRspmEffectif && <p className="text-muted-foreground">En RSPM, la dispense ne s'applique pas à la RID : elle reste obligatoire (157€ ou 626€/an selon le taux ci-dessous).</p>}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {showRidToggle && (
                      <FormField control={form.control} name="tauxRid" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">
                            Cotisation RID CARMF
                            <PremiumTooltip title="Cotisation RID" content={
                              <div className="space-y-2">
                                <p className="font-semibold">Régime Invalidité-Décès CARMF</p>
                                <p className="text-xs">Assurance obligatoire dès que tu es affilié à la CARMF. Te couvre en cas d'invalidité ou de décès (capital versé aux ayants droit).</p>
                                <TipBox variant="info">
                                  <div className="space-y-0.5">
                                    <p><strong>25%</strong> = couverture minimale → 157€/an</p>
                                    <p><strong>100%</strong> = couverture complète → 626€/an</p>
                                  </div>
                                </TipBox>
                                <TipBox variant="tip">
                                  <p>💡 100% recommandé si tu as des enfants ou un emprunt immobilier.</p>
                                </TipBox>
                              </div>
                            }>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </PremiumTooltip>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value || '25%'} className="flex gap-4">
                              <div className="flex items-center gap-2"><RadioGroupItem value="25%" id="rid-25" /><label htmlFor="rid-25" className="text-sm cursor-pointer">25% (157€/an)</label></div>
                              <div className="flex items-center gap-2"><RadioGroupItem value="100%" id="rid-100" /><label htmlFor="rid-100" className="text-sm cursor-pointer">100% (626€/an)</label></div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {!showRidToggle && <p className="text-xs text-muted-foreground px-1">ℹ️ Les cotisations CARMF (dont la RID) sont intégrées automatiquement dans le calcul PAMC.</p>}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 2 : Déductions professionnelles ─── */}
                <AccordionItem value="deductions" className="rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <PiggyBank className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Déductions professionnelles</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const count = [
                            forfait2pct && secteurConventionnel === 'secteur_1',
                            cotisationsVolontaires > 0,
                            form.getValues('chequesVacances') > 0,
                            form.getValues('ratioNonConventionne') > 0 && secteurConventionnel === 'secteur_1',
                          ].filter(Boolean).length;
                          return count > 0 ? `${count} active${count > 1 ? 's' : ''}` : '';
                        })()}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <p className="text-xs text-muted-foreground px-1">Ces déductions <strong className="text-foreground/70">s'ajoutent</strong> à tes charges ci-dessus. Ne les inclus pas dans le champ « Charges réelles ».</p>
                    {secteurConventionnel === 'secteur_1' && (
                      <FormField control={form.control} name="forfait2pct" render={({ field }) => (
                        <FormItem className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                          <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" /></FormControl>
                          <div className="flex-1">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                              Forfait 2% (Secteur 1 - BNC réel)
                              <PremiumTooltip title="Forfait 2%" content={
                                <div className="space-y-2">
                                  <p className="font-semibold">Déduction forfaitaire de 2%</p>
                                  <p className="text-xs">Frais de représentation, réception et prospection. Réservée aux médecins <strong>Secteur 1</strong> en <strong>BNC réel</strong>.</p>
                                  <TipBox variant="info">
                                    <p>📊 Formule : 2% × CA conventionné × (1 - ratio non conv.)</p>
                                  </TipBox>
                                  <TipBox variant="tip">
                                    <p>💡 Alternative : tu peux déduire ces frais au réel s'ils dépassent 2% de ton CA.</p>
                                  </TipBox>
                                  <TipBox variant="warning">
                                    <p>⚠️ Sans effet en Micro-BNC (l'abattement de 34% couvre déjà tout).</p>
                                  </TipBox>
                                </div>
                              }>
                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                              </PremiumTooltip>
                            </FormLabel>
                            <FormDescription className="text-xs mt-0.5">Déduit 2% de ton CA (frais de représentation)</FormDescription>
                          </div>
                        </FormItem>
                      )} />
                    )}
                    {secteurConventionnel === 'secteur_1' && (
                      <FormField control={form.control} name="ratioNonConventionne" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm">% d'honoraires non conventionnés <Badge variant="outline" className="text-[10px] font-normal">Optionnel</Badge>
                            <PremiumTooltip title="Honoraires non conventionnés" content={
                              <div className="space-y-2">
                                <p className="font-semibold">Part d'activité hors convention</p>
                                <p className="text-xs">Si une partie de ton activité est hors nomenclature (esthétique, expertise, médecine du travail…), les déductions S1 ne s'appliquent que sur la part conventionnée.</p>
                                <TipBox variant="info">
                                  <p className="font-medium">📊 Exemple concret :</p>
                                  <p className="mt-0.5">CA = 80 000€, 20% non conv. → déductions S1 sur 64 000€ seulement.</p>
                                </TipBox>
                              </div>
                            }>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </PremiumTooltip>
                          </FormLabel>
                          <FormControl><div className="relative"><Input type="number" step="1" min={0} max={100} placeholder="0" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span></div></FormControl>
                          <FormDescription className="text-xs">Part du CA hors convention — Déductions S1 proratisées</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="cotisationsVolontaires" render={({ field }) => {
                      const yearlyCA = periode === 'mensuel' ? (recettesBrutes || 0) * 12 : (recettesBrutes || 0);
                      const yearlyCharges = (() => {
                        const c = form.watch('chargesHorsCotisations') || 0;
                        return periode === 'mensuel' ? c * 12 : c;
                      })();
                      const isMicroLikely = yearlyCA <= 83600;
                      const beneficeEstime = isMicroLikely
                        ? yearlyCA * 0.66
                        : Math.max(0, yearlyCA - yearlyCharges);
                      const anneeForm = form.watch('annee') || 2026;
                      const perPlafond = getPerCap(beneficeEstime, anneeForm).plafond;
                      const saisie = field.value || 0;
                      const depasseCap = saisie > perPlafond;
                      const typeCotisation = form.watch('typeCotisationsVolontaires') || 'per';
                      const madelinEnMicro = isMicroLikely && typeCotisation === 'madelin';
                      return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Cotisations volontaires (PER, Madelin...)
                          <PremiumTooltip title="Épargne retraite (PER / Madelin)" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Versements PER ou contrat Madelin</p>
                              <p className="text-xs">Tes versements d'épargne retraite sont déductibles de ton revenu imposable → moins d'impôt à payer.</p>
                              <TipBox variant="info">
                                <div className="space-y-0.5">
                                  <p><strong>PER</strong> : déductible du revenu global (micro ET réel)</p>
                                  <p><strong>Madelin</strong> : déductible du BNC réel uniquement</p>
                                  <p className="mt-1">Plafond PER 2026 : 10% du bénéfice (min ~4 637€, max ~37 094€)</p>
                                </div>
                              </TipBox>
                              <TipBox variant="warning">
                                <p>⚠️ En Micro-BNC, seul le PER est déductible (pas le Madelin).</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: 5 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                        {saisie > 0 && (
                          <FormField control={form.control} name="typeCotisationsVolontaires" render={({ field: typeField }) => (
                            <FormItem className="mt-2">
                              <FormControl>
                                <RadioGroup value={typeField.value || 'per'} onValueChange={typeField.onChange} className="flex gap-4">
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem value="per" id="cotvol-per" />
                                    <label htmlFor="cotvol-per" className="text-xs cursor-pointer">PER (micro & réel)</label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem value="madelin" id="cotvol-madelin" />
                                    <label htmlFor="cotvol-madelin" className="text-xs cursor-pointer">Madelin (réel uniquement)</label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )} />
                        )}
                        <FormDescription className="text-xs">
                          En plus de tes charges. Déduit du revenu imposable (PER) ou du BNC réel (Madelin).
                          {depasseCap && saisie > 0 && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400">
                              ⚠️ Plafond légal {perPlafond.toLocaleString('fr-FR')}€ atteint — seuls {perPlafond.toLocaleString('fr-FR')}€ seront déduits (CGI Art. 163 quatervicies).
                            </span>
                          )}
                          {madelinEnMicro && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400">
                              ⚠️ Madelin sélectionné — non déduit en Micro-BNC (Art. 154 bis CGI). Bascule sur PER ou passe en BNC réel.
                            </span>
                          )}
                          {!madelinEnMicro && !depasseCap && isMicroLikely && typeCotisation === 'per' && saisie > 0 && (
                            <span className="block mt-1 text-emerald-600 dark:text-emerald-400">✓ PER en Micro-BNC : déduction du revenu global appliquée.</span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                      );
                    }} />
                    <FormField control={form.control} name="chequesVacances" render={({ field }) => {
                      // Plafond annuel ANCV (1 SMIC mensuel) — source unique : declarationParams.ts
                      const annee = form.watch('annee') || 2026;
                      const plafondCV = getDeclarationParams(annee).plafondChequesVacances;
                      const plafondLabel = `${plafondCV.toLocaleString('fr-FR')}€/an`;
                      return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Chèques-vacances ANCV <Badge variant="outline" className="text-[10px] font-normal">Réel</Badge>
                          <PremiumTooltip title="Chèques-vacances ANCV" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Chèques-vacances pour indépendants</p>
                              <p className="text-xs">Tu achètes des chèques-vacances via l'ANCV → tu les déduis de ton BNC réel → tu les utilises pour tes vacances, restos, loisirs, culture.</p>
                              <TipBox variant="tip">
                                <p className="font-medium">✅ Double avantage</p>
                                <p className="mt-0.5">Déduction fiscale + pouvoir d'achat vacances. Plafond {annee} = 1 SMIC mensuel ({plafondLabel}).</p>
                                {annee >= 2026 && (
                                  <p className="mt-1 text-[11px] italic">ℹ️ Plafond 2026 = 1 823 € (projeté, à confirmer après publication officielle du SMIC 2026).</p>
                                )}
                              </TipBox>
                              <TipBox variant="warning">
                                <p>⚠️ BNC réel uniquement. Sans effet en Micro-BNC. Art. L411-5 Code du tourisme.</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <FormControl><div className="relative"><Input type="number" step="1" min={0} max={plafondCV} placeholder="Ex: 1 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                        <FormDescription className="text-xs">En plus de tes charges. Max {plafondLabel} ({annee}) — BNC réel uniquement. <span className="text-amber-600 dark:text-amber-400">⚠️ Sans effet en Micro-BNC.</span></FormDescription>
                        <FormMessage />
                      </FormItem>
                      );
                    }} />
                    {secteurConventionnel === 'secteur_1' && (
                      <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs text-emerald-700 dark:text-emerald-400"><strong>✅ Déductions Secteur 1 automatiques</strong> (BNC réel) : 3% + barème Groupe III appliquées automatiquement.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 3 : Revenus complémentaires ─── */}
                <AccordionItem value="revenus-complementaires" className="rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <Home className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Fiscalité immobilière & zones</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const parts = [];
                          if (zoneExoneree !== 'aucune') parts.push(zoneExoneree === 'zfu' ? 'ZFU' : 'ZFRR');
                          if (regimeFoncier !== 'aucun') parts.push(regimeFoncier === 'micro' ? 'Foncier micro' : 'Foncier réel');
                          return parts.length > 0 ? parts.join(' · ') : '';
                        })()}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <FormField control={form.control} name="zoneExoneree" render={({ field }) => {
                      const annee = form.watch('annee') || 2026;
                      const anneeInstallationZone = form.watch('anneeInstallationZone');
                      return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm"><Map className="h-4 w-4 text-amber-600" /> Zone exonérée
                          <PremiumTooltip title="Zones exonérées" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Exonération d'impôt en zone prioritaire</p>
                              <p className="text-xs">Si tu exerces en zone franche urbaine (ZFU-TE, CGI Art. 44 octies A) ou en zone France ruralités revitalisation (ZFRR, CGI Art. 44 quindecies), une partie de tes bénéfices est exonérée d'IR avec des taux de dégressivité différents.</p>
                              <TipBox variant="info">
                                <p className="font-medium mb-1">🏙️ ZFU-TE (dispositif clos au 31.12.2025) :</p>
                                <div className="space-y-0.5 mb-2">
                                  <p>Années 1 à 5 → <strong>100 %</strong> exonéré</p>
                                  <p>Année 6 → <strong>60 %</strong> · Année 7 → <strong>40 %</strong> · Année 8 → <strong>20 %</strong></p>
                                  <p>Plafond : 50 000 € de bénéfice exonéré/an</p>
                                </div>
                                <p className="font-medium mb-1">🌾 ZFRR :</p>
                                <div className="space-y-0.5 mb-2">
                                  <p>Années 1 à 5 → <strong>100 %</strong> exonéré</p>
                                  <p>Année 6 → <strong>75 %</strong> · Année 7 → <strong>50 %</strong> · Année 8 → <strong>25 %</strong></p>
                                  <p>Plafond : 50 000 € de bénéfice exonéré/an</p>
                                </div>
                                <p className="text-[11px] text-amber-700 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800/40 pt-1.5 mt-1.5">
                                  ⚠️ <strong>Prorata du plafond</strong> : l'année d'installation et l'année de basculement de palier (100 % → 60 %), le plafond annuel est proratisé au nombre de mois d'exonération effective (CGI Art. 44 octies A I + Art. 49 K annexe III CGI ; CE 18 juillet 2018, n° 412142). Sécurise auprès de ton SIE/AGA.
                                </p>
                              </TipBox>

                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'aucune'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Aucune" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="aucune">Aucune</SelectItem>
                            {/* ZFU-TE : dispositif clos au 31.12.2025 — caché pour les nouvelles installations 2026+.
                                Logique centralisée dans simulateurSchema.isZoneExoneneeAvailable (CGI Art. 44 octies A). */}
                            {(isZoneExoneneeAvailable('zfu', annee, anneeInstallationZone) || zoneExoneree === 'zfu') && (
                              <SelectItem value="zfu">🏙️ ZFU-TE{annee >= 2026 ? ' (installations ≤ 2025)' : ''}</SelectItem>
                            )}
                            <SelectItem value="zfrr">🌾 ZFRR</SelectItem>
                          </SelectContent>
                        </Select>
                        {annee >= 2026 && (
                          <FormDescription className="text-xs text-muted-foreground">
                            ℹ️ ZFU-TE : dispositif clos au 31.12.2025 (CGI Art. 44 octies A). Plus disponible pour les nouvelles installations à partir de 2026. Les installations antérieures conservent leur exonération dégressive jusqu'au terme.
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                    }} />
                    {zoneExoneree && zoneExoneree !== 'aucune' && (
                      <FormField control={form.control} name="anneeInstallationZone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Année d'installation dans la zone</FormLabel>
                          <FormControl><Input type="number" step="1" min={2000} max={2030} placeholder="Ex: 2022" {...field} value={field.value || ''} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} onFocus={(e) => e.target.select()} /></FormControl>
                          <FormDescription className="text-xs">Taux d'exonération dégressif selon l'ancienneté. ⚠️ L'année d'installation et l'année de basculement de palier (5 ans + 1) → plafond proratisé temporis (CGI Art. 49 K annexe III ; CE 18/07/2018 n° 412142) : notre calcul affiche le plafond plein par simplification, sécurise auprès de ton SIE/AGA.</FormDescription>
                          <FormMessage />
                        </FormItem>

                      )} />
                    )}
                    <FormField control={form.control} name="regimeFoncier" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm"><Home className="h-4 w-4 text-amber-600" /> Revenus fonciers
                          <PremiumTooltip title="Revenus fonciers" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Revenus de tes biens immobiliers</p>
                              <p className="text-xs">Si tu perçois des loyers, ils s'ajoutent à ton revenu imposable et modifient ton taux d'imposition.</p>
                              <TipBox variant="info">
                                <div className="space-y-1">
                                  <p><strong>Micro-foncier</strong> : loyers bruts ≤ 15 000€/an → abattement 30% automatique</p>
                                  <p><strong>Régime réel</strong> : résultat net (charges déduites). Peut être négatif (déficit).</p>
                                </div>
                              </TipBox>
                              <TipBox variant="tip">
                                <p>💡 Déficit foncier imputable sur le revenu global jusqu'à 10 700€/an → réduit ton impôt.</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || 'aucun'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Aucun" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="aucun">Aucun</SelectItem><SelectItem value="micro">Micro-foncier (abattement 30%)</SelectItem><SelectItem value="reel">Régime réel</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {regimeFoncier === 'micro' && (
                      <FormField control={form.control} name="revenusFonciersBruts" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Revenus fonciers bruts annuels</FormLabel>
                          <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: 12 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                          <FormDescription className="text-xs">Loyers bruts (≤ 15 000€ pour micro-foncier)</FormDescription>
                          {form.watch('revenusFonciersBruts') > 15000 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ Au-delà de 15 000€/an, le micro-foncier n'est plus applicable. Passe en régime réel.</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    {regimeFoncier === 'reel' && (
                      <FormField control={form.control} name="revenuFoncierNet" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Résultat foncier net annuel</FormLabel>
                          <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: -5000 ou 8000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                          <FormDescription className="text-xs">Négatif = déficit. Imputable sur ton revenu global jusqu'à -10 700€/an (CGI Art. 156-I-3°). L'excédent éventuel reste reportable 10 ans sur tes futurs revenus fonciers.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 4 : Crédits d'impôt ─── */}
                <AccordionItem value="credits" className="rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <GraduationCap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Crédits d'impôt</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const credForm = creditFormationDirigeant ? calculateCreditFormation(form.getValues('heuresFormation') || 0) : 0;
                          const credAutre = form.getValues('creditImpotAutre') || 0;
                          const fraisED = form.getValues('fraisEmploiDomicile') || 0;
                          const fraisGE = form.getValues('fraisGardeEnfants') || 0;
                          const nbGarde = form.getValues('nombreEnfantsGarde') || 0;
                          const credED = fraisED > 0 ? Math.round(Math.min(fraisED, Math.min(12000 + (form.getValues('enfants') || 0) * 1500, 15000)) * 0.5) : 0;
                          const credGE = fraisGE > 0 && nbGarde > 0 ? Math.round(Math.min(fraisGE, 3500 * nbGarde) * 0.5) : 0;
                          const total = credForm + credAutre + credED + credGE;
                          return total > 0 ? `${total.toLocaleString('fr-FR')}€` : '';
                        })()}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <FormField control={form.control} name="creditFormationDirigeant" render={({ field }) => (
                      <FormItem className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                        <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="mt-1 h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" /></FormControl>
                        <div className="flex-1">
                          <FormLabel className="flex items-center gap-2 text-sm font-medium cursor-pointer">Crédit formation dirigeant
                            <PremiumTooltip title="Crédit formation dirigeant" content={
                              <div className="space-y-2">
                                <p className="font-semibold">Crédit d'impôt pour formation</p>
                                <p className="text-xs">Tu suis une formation pro (DPC, congrès, DIU…) → tu récupères un crédit d'impôt calculé sur le nombre d'heures.</p>
                                <TipBox variant="info">
                                  <p>📊 Calcul : heures × SMIC horaire ({SMIC_HORAIRE_2025.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €) = crédit. Max 40h = {calculateCreditFormation(40)} €/an.</p>
                                </TipBox>
                                <TipBox variant="tip">
                                  <p>💡 ≠ déduction : un crédit d'impôt se soustrait directement de l'impôt dû. Si l'impôt est inférieur au crédit, le fisc te rembourse la différence !</p>
                                </TipBox>
                              </div>
                            }>
                              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                            </PremiumTooltip>
                          </FormLabel>
                          <FormDescription className="text-xs mt-0.5">Heures × SMIC (plafond 40h = ~475€)</FormDescription>
                        </div>
                      </FormItem>
                    )} />
                    {creditFormationDirigeant && (
                      <FormField control={form.control} name="heuresFormation" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Nombre d'heures de formation</FormLabel>
                          <FormControl><Input type="number" step="1" min={0} max={40} placeholder="Ex: 20" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} /></FormControl>
                          <FormDescription className="text-xs">Max 40h/an — Crédit = {calculateCreditFormation(field.value || 0)}€</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    {/* ─── Emploi à domicile ─── */}
                    <FormField control={form.control} name="fraisEmploiDomicile" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Emploi à domicile
                          <PremiumTooltip title="Emploi à domicile (Art. 199 sexdecies CGI)" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Crédit d'impôt = 50% des dépenses</p>
                              <p className="text-xs">Ménage, garde d'enfant à domicile, jardinage, aide aux personnes âgées… → crédit de 50% des sommes versées.</p>
                              <TipBox variant="info">
                                <div className="space-y-0.5">
                                  <p>Plafond : <strong>12 000€</strong> + 1 500€ par enfant à charge</p>
                                  <p>Maximum : <strong>15 000€</strong> (crédit max : 7 500€)</p>
                                </div>
                              </TipBox>
                              <TipBox variant="tip">
                                <p>💡 S'applique identiquement en Micro-BNC et Réel (crédit personnel, pas professionnel).</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: 6 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                        <FormDescription className="text-xs">
                          {(() => {
                            const enfants = form.getValues('enfants') || 0;
                            const plafond = Math.min(12000 + enfants * 1500, 15000);
                            const creditMax = Math.round(plafond * 0.5);
                            return `Dépenses annuelles. Plafond : ${plafond.toLocaleString('fr-FR')}€ → crédit max : ${creditMax.toLocaleString('fr-FR')}€`;
                          })()}
                          {(field.value || 0) > Math.min(12000 + (form.getValues('enfants') || 0) * 1500, 15000) && (
                            <span className="block mt-1 text-amber-600 dark:text-amber-400">⚠️ Montant supérieur au plafond — sera plafonné dans le calcul.</span>
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* ─── Garde d'enfant < 6 ans ─── */}
                    <FormField control={form.control} name="nombreEnfantsGarde" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Enfants en garde (&lt; 6 ans)
                          <PremiumTooltip title="Garde d'enfant < 6 ans (Art. 200 quater B CGI)" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Crédit d'impôt = 50% des frais de garde</p>
                              <p className="text-xs">Crèche, assistante maternelle, garderie… pour les enfants de moins de 6 ans au 1er janvier.</p>
                              <TipBox variant="info">
                                <p>Plafond : <strong>3 500€ par enfant</strong> (crédit max : 1 750€/enfant)</p>
                              </TipBox>
                              <TipBox variant="warning">
                                <p>⚠️ Non cumulable avec emploi à domicile pour le même enfant (garde à domicile = emploi à domicile).</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </FormLabel>
                        <FormControl><Input type="number" step="1" min={0} max={10} placeholder="0" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()} /></FormControl>
                        <FormDescription className="text-xs">Nombre d'enfants de moins de 6 ans gardés hors domicile</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {(form.watch('nombreEnfantsGarde') || 0) > 0 && (
                      <FormField control={form.control} name="fraisGardeEnfants" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Frais de garde annuels (total)</FormLabel>
                          <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: 5 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                          <FormDescription className="text-xs">
                            {(() => {
                              const nbEnfants = form.getValues('nombreEnfantsGarde') || 0;
                              const plafond = 3500 * nbEnfants;
                              const creditMax = Math.round(plafond * 0.5);
                              return `Plafond : ${plafond.toLocaleString('fr-FR')}€ (${nbEnfants} enfant${nbEnfants > 1 ? 's' : ''} × 3 500€) → crédit max : ${creditMax.toLocaleString('fr-FR')}€`;
                            })()}
                            {(field.value || 0) > 3500 * (form.getValues('nombreEnfantsGarde') || 0) && (
                              <span className="block mt-1 text-amber-600 dark:text-amber-400">⚠️ Montant supérieur au plafond — sera plafonné dans le calcul.</span>
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <FormField control={form.control} name="creditImpotAutre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Autres crédits d'impôt <Badge variant="outline" className="text-[10px] font-normal">Optionnel</Badge></FormLabel>
                        <FormControl><div className="relative"><Input type="number" step="0.01" placeholder="Ex: 1 500" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div></FormControl>
                        <FormDescription className="text-xs">Dons, investissements locatifs, etc.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-hippo-500 to-hippo-600 hover:from-hippo-600 hover:to-hippo-700 text-white shadow-lg shadow-hippo-500/25 h-12 text-base font-semibold rounded-xl"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5 animate-spin" />
              Calcul en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simuler
            </span>
          )}
        </Button>
      </form>
    </Form>
  );
});

SimulateurForm.displayName = 'SimulateurForm';
