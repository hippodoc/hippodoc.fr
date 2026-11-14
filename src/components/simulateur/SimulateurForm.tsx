import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from "react";
import { Calculator, Info, Stethoscope, UserCheck, MapPin, Briefcase, Heart, Wallet, Users, Settings, ChevronDown, Plus, Shield, PiggyBank, GraduationCap, Home, Map } from "lucide-react";
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
import { getPlafondEpargneRetraite } from "@/lib/baremes-ir";
import { cn } from "@/lib/utils";

interface SimulateurFormProps {
  onSubmit: (data: SimulateurFormData) => void;
  loading?: boolean;
  defaultValues?: Partial<SimulateurFormData>;
  hasProfileData?: boolean;
}

// ─── Tooltip helper components ─────────────────────────────────────────────
const TipBox = ({ children, variant = "tip" }: { children: React.ReactNode; variant?: "tip" | "warning" | "info" }) => {
  // États de la DA (jetons --ok, --wait, --plan) : voir src/styles/simulateur.css.
  const colors = {
    tip: "ok",
    warning: "attn",
    info: "info",
  };
  return (
    <div className={cn("sim-note", colors[variant])}>
      <div className="sim-note-in">{children}</div>
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
    // Exercice : remplaçant par défaut (le public du site) ; les profils d'installés le précisent.
    typeExercice: 'remplacant',
    // Phase 3
    tauxRid: '25%',
    situationCarmf: 'affilie_3ans_plus' as const,
    ratioNonConventionne: 0,
} satisfies Partial<SimulateurFormData>;

// Composant réutilisable pour les en-têtes de section
const SectionHeader = ({ 
  icon: Icon, 
  title, 
}: { 
  icon: React.ElementType; 
  title: string; 
}) => (
  <div className="sim-fiche-tete">
    <div className="sim-rond">
      <Icon className="h-4 w-4" />
    </div>
    <h3 className="sim-fiche-titre">{title}</h3>
  </div>
);

export const SimulateurForm = forwardRef<any, SimulateurFormProps>(
  ({ onSubmit, loading = false, defaultValues, hasProfileData = false }, ref) => {
    const [isRevenusComplementairesOpen, setIsRevenusComplementairesOpen] = useState(false);
    const [isOptionsAvanceesOpen, setIsOptionsAvanceesOpen] = useState(false);
    
    const form = useForm<SimulateurFormData>({
      resolver: zodResolver(simulateurSchema),
      // Défauts COMPLETS, complétés par ceux de l'appelant : un champ sans valeur laissait
      // sa liste déroulante sur l'intitulé (« Régime ») au lieu de « Auto ».
      defaultValues: { ...SIMULATEUR_DEFAULTS, ...(defaultValues || {}) },
    });
    // Valeurs posées par le dernier chargement (défauts, puis profil type) : un champ du
    // foyer qui en diffère a été modifié à la main.
    const valeursChargees = useRef<Partial<SimulateurFormData>>({ ...SIMULATEUR_DEFAULTS, ...(defaultValues || {}) });

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
    // Phase 3 watches
    const regimeSocial = form.watch('regimeSocial');
    const recettesBrutes = form.watch('recettesBrutes');
    const periode = form.watch('periode');
    const situationCarmf = form.watch('situationCarmf');
    // Le toggle RID s'affiche dès qu'on est en RSPM (effectif ou auto < 38k€).
    // La dispense CARMF n'a aucun effet en RSPM : la RID reste obligatoire et
    // doit pouvoir être paramétrée (157€ ou 626€ en 2026).
    const annualRecettes = periode === 'mensuel' ? (recettesBrutes || 0) * 12 : (recettesBrutes || 0);
    // Même règle que le moteur (usePublicodesSimulation) : en Auto, le RSPM est retenu pour
    // un remplaçant jusqu'à 19 000 € de recettes (seuil d'entrée du régime).
    const typeExercice = form.watch('typeExercice');
    // Forfait 2 %, 3 % et groupe III : médecins installés en secteur 1 seulement.
    const deductionsS1Ouvertes = secteurConventionnel === 'secteur_1' && typeExercice === 'installe';
    const isRspmEffectif = regimeSocial === 'rspm' || (regimeSocial === 'auto' && typeExercice !== 'installe' && annualRecettes <= 19000);
    const showRidToggle = isRspmEffectif;

    // Exposer la méthode reset via la ref - avec préservation des champs personnels
    useImperativeHandle(ref, () => ({
      reset: (values: Partial<SimulateurFormData>) => {
        // Récupérer les valeurs actuelles pour préserver les champs personnels
        const currentValues = form.getValues();
        
        // Préserver les champs du foyer que l'UTILISATEUR a modifiés à la main depuis le
        // dernier chargement (valeur différente de celle posée par ce chargement). La
        // situation d'un profil type n'est donc plus reportée sur le suivant (avant
        // novembre 2026, enchaîner « Remplaçant famille » puis « Parent isolé » donnait un
        // parent isolé marié, avec 35 000 € de revenus de conjoint).
        const preservedPersonalFields: Partial<SimulateurFormData> = {};
        const champsFoyer = ['situationFamiliale', 'enfants', 'revenusConjoint', 'typeRevenuConjoint'] as const;
        for (const champ of champsFoyer) {
          const actuelle = currentValues[champ];
          if (actuelle !== undefined && actuelle !== valeursChargees.current[champ]) {
            (preservedPersonalFields as Record<string, unknown>)[champ] = actuelle;
          }
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
        valeursChargees.current = mergedValues;
        
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="sim-form">
        
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 : TES REVENUS (Essentiel)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sim-fiche">
          <SectionHeader 
            icon={Wallet} 
            title="Tes revenus" 
          />
          
          {/* Champs essentiels : Recettes + Charges (toujours visibles) */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Recettes brutes */}
            <FormField
              control={form.control}
              name="recettesBrutes"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                  <FormLabel className="flex items-center gap-2">
                    Tes revenus libéraux
                  </FormLabel>
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
                  </div>
                  <div className="relative">
                      <FormControl><Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 80 000"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="pr-8"
                      /></FormControl>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  <FormDescription className="text-xs">
                    Montant {periode === 'mensuel' ? 'mensuel' : 'annuel'}
                  </FormDescription>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {/* Charges réelles */}
            <FormField
              control={form.control}
              name="chargesHorsCotisations"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                  <FormLabel className="flex items-center gap-2">
                    Tes charges réelles
                  </FormLabel>
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
                  </div>
                  <div className="relative">
                      <FormControl><Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 15 000"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        className="pr-8"
                      /></FormControl>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  <FormDescription className="text-xs text-muted-foreground">
                    Dépenses pro (loyer, matériel, RCP…) · <span className="italic">hors cotisations sociales et déductions fiscales</span>
                  </FormDescription>
                  <FormMessage role="alert" />
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
                className="sim-pli w-full justify-between h-auto"
              >
                <span className="flex items-center gap-1.5 sm:gap-2 text-sm flex-wrap">
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span className="sm:hidden">Revenus complémentaires</span>
                  <span className="hidden sm:inline">Revenus complémentaires (Salariat, PDSA...)</span>
                  <Badge variant="outline" className="sim-puce neutre">Optionnel</Badge>
                </span>
                <ChevronDown className={cn(
                  "sim-chevron h-5 w-5 transition-transform duration-200",
                  isRevenusComplementairesOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="sim-pli-in space-y-4 pt-4 mt-3">
              {/* Revenus salariés */}
              <FormField
                control={form.control}
                name="revenusSalaries"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center gap-2 text-sm">
                      Revenus salariés (si cumul)
                    </FormLabel>
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
                    </div>
                    <div className="relative">
                        <FormControl><Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 20 000"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="pr-8"
                        /></FormControl>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />

              {/* Revenus PDSA exonérés */}
              <FormField
                control={form.control}
                name="revenusExoneresPdsa"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center gap-2 text-sm">
                      Revenus PDSA
                      <Badge variant="outline" className="sim-puce ok">
                        Exonéré IR
                      </Badge>
                    </FormLabel>
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
                              <p className="mt-0.5">Art. 151 ter du CGI : les astreintes et majorations de la PDSA, en zone sous-dotée, dans la limite de 60 jours de permanence par an. Saisis ici cette part exonérée seulement.</p>
                            </TipBox>
                            <TipBox variant="warning">
                              <p>⚠️ Reste soumis aux cotisations sociales (URSSAF/CARMF). Seul l'IR est exonéré.</p>
                            </TipBox>
                          </div>
                        }
                      >
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </PremiumTooltip>
                    </div>
                    <div className="relative">
                        <FormControl><Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5 000"
                          {...field}
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="pr-8"
                        /></FormControl>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    <FormMessage role="alert" />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 : TA SITUATION FISCALE
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sim-fiche">
          <SectionHeader 
            icon={Users} 
            title="Ta situation fiscale" 
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
                      <Badge variant="outline" className="sim-puce ok">
                        Pré-rempli
                      </Badge>
                    )}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Célibataire" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
                      <SelectItem value="celibataire">Célibataire</SelectItem>
                      <SelectItem value="marie_pacse">Marié(e) ou Pacsé(e)</SelectItem>
                      <SelectItem value="veuf">Veuf(ve)</SelectItem>
                      <SelectItem value="parent_isole">Parent isolé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {/* Enfants */}
            <FormField
              control={form.control}
              name="enfants"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                  <FormLabel className="flex items-center gap-2 flex-wrap">
                    Enfants à charge
                    {hasProfileData && (
                      <Badge variant="outline" className="sim-puce ok">
                        Pré-rempli
                      </Badge>
                    )}
                  </FormLabel>
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
                  </div>
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
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          </div>

          {/* Revenus du conjoint (visible uniquement si marié/pacsé) */}
          {showConjointField && (
            <div className="sim-pli-in mt-4 pt-4 space-y-4">
                <FormField
                control={form.control}
                name="revenusConjoint"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                    <FormLabel className="flex items-center gap-2 flex-wrap">
                      <Heart className="sim-marque h-4 w-4 flex-shrink-0" />
                      <span className="sm:hidden">Revenus nets conjoint, si en couple (annuel)</span>
                      <span className="hidden sm:inline">Revenus nets avant impôt du conjoint, si en couple (par an)</span>
                      <Badge variant="outline" className="sim-puce neutre">
                        Optionnel
                      </Badge>
                    </FormLabel>
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
                    </div>
                    <div className="relative">
                        <FormControl><Input
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
                        /></FormControl>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          €
                        </span>
                      </div>
                    <FormDescription className="text-xs">
                      Améliore la précision du calcul d'impôt pour ton foyer fiscal
                    </FormDescription>
                    <FormMessage role="alert" />
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
                      <div className="flex items-center gap-2">
                      <FormLabel className="flex items-center gap-2">
                        Type de revenu du conjoint
                      </FormLabel>
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
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de revenu" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="sim sim-pop">
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
                      <FormMessage role="alert" />
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
        <div className="sim-fiche">
          <SectionHeader 
            icon={Settings} 
            title="Paramètres de calcul" 
          />
          
          {/* Cinq champs : trois colonnes à partir de 1 024 px (simulateur.css, `.sim-params`).
              `lg:grid-cols-4` reste dans la liste pour ne pas changer la feuille commune. */}
          <div className="sim-params grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Exercice : remplaçant ou installé (RSPM, CURPS, dispense CARMF, déductions S1) */}
            <FormField
              control={form.control}
              name="typeExercice"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <UserCheck className="h-3.5 w-3.5" />
                    Exercice
                  </FormLabel>
                  <PremiumTooltip
                      title="Remplaçant ou installé"
                      content={
                        <div className="space-y-2">
                          <p className="text-xs">
                            <strong>Remplaçant</strong> : tu exerces seulement en remplacement (rétrocessions). Tu peux opter pour le RSPM jusqu'à 19 000 € de recettes, tu ne paies pas la CURPS, et la CARMF peut te dispenser d'affiliation sous 15 000 € de revenu net.
                          </p>
                          <p className="text-xs">
                            <strong>Installé</strong> : tu exerces en ton nom (cabinet, collaboration). Le RSPM ne t'est pas ouvert.
                          </p>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value ?? 'remplacant'}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Exercice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
                      <SelectItem value="remplacant">Remplaçant</SelectItem>
                      <SelectItem value="installe">Installé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {/* Année fiscale */}
            <FormField
              control={form.control}
              name="annee"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Calculator className="h-3.5 w-3.5" />
                    Année
                  </FormLabel>
                  <PremiumTooltip
                      title="Année fiscale"
                      content={
                        <div className="space-y-2">
                          <p className="text-xs">
                            Saisis tes revenus de l'année concernée. Le barème IR appliqué correspond à celui de la déclaration N+1.
                          </p>
                          <TipBox variant="info">
                            <p>📅 Ex&nbsp;: revenus 2025 → barème déclaration 2026.</p>
                            <p className="mt-1">Revenus 2026 : la loi de finances 2027 n'étant pas encore votée, le simulateur applique le barème des revenus 2025.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </div>
                  <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="2026" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
            {/* Lieu d'exercice (DOM-TOM) */}
            <FormField
              control={form.control}
              name="lieuExercice"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    Lieu d'exercice
                  </FormLabel>
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
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="France métro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
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
                    <div className="sim-note ok flex items-center gap-2 mt-2">
                      <span className="text-sm">{domTomInfo.emoji}</span>
                      <p className="text-xs">
                        Abattement {formatTauxAbattement(domTomInfo)} (max {formatPlafond(domTomInfo)})
                      </p>
                    </div>
                  )}
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {/* Secteur conventionnel */}
            <FormField
              control={form.control}
              name="secteurConventionnel"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Secteur
                  </FormLabel>
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
                            <p className="mt-0.5">Participation CPAM aux cotisations (ASV, maladie) + déductions spécifiques pour les installés : forfait 2%, déduction 3%, barème Groupe III.</p>
                          </TipBox>
                          <TipBox variant="warning">
                            <p>⚠️ Secteur 2 : pas de participation CPAM, pas de déductions S1.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
                      <SelectItem value="secteur_1">Secteur 1</SelectItem>
                      <SelectItem value="secteur_2">Secteur 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />

            {/* Régime social (RSPM / PAMC) */}
            <FormField
              control={form.control}
              name="regimeSocial"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1">
                  <FormLabel className="flex items-center gap-1 text-sm">
                    <Briefcase className="h-3.5 w-3.5" />
                    Régime
                  </FormLabel>
                  <PremiumTooltip
                      title="Régime social"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">RSPM vs PAMC</p>
                          <p className="text-xs">
                            <strong>RSPM</strong> (Simplifié) : cotisations forfaitaires à taux fixe. Ouvert jusqu'à 19 000 €/an d'honoraires ; perdu après deux années de suite au-dessus de 19 000 € ou une seule au-dessus de 38 000 €.<br/>
                            <strong>PAMC</strong> (Classique) : cotisations proportionnelles réelles, régime standard des médecins libéraux.
                          </p>
                          <TipBox variant="info">
                            <div className="space-y-0.5">
                              <p><strong>RSPM</strong> : 13,5% (0-19k€) puis 21,2% (&gt;19k€) + RID CARMF</p>
                              <p><strong>PAMC</strong> : barème complet URSSAF + CARMF complète</p>
                            </div>
                          </TipBox>
                          <TipBox variant="tip">
                            <p>💡 <strong>Auto = recommandé</strong>. Le simulateur retient le RSPM pour un remplaçant jusqu'à 19 000 € de recettes, le PAMC au-delà. Déjà au RSPM entre 19 000 et 38 000 € ? Choisis RSPM.</p>
                          </TipBox>
                        </div>
                      }
                    >
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </PremiumTooltip>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Régime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="sim sim-pop">
                      <SelectItem value="auto">🔄 Auto</SelectItem>
                      <SelectItem value="rspm">🎓 RSPM</SelectItem>
                      <SelectItem value="pamc">🩺 PAMC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage role="alert" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 : OPTIONS AVANCÉES (Fusionnée CARMF + Optimisation)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="sim-fiche sim-fiche-options">
          <Collapsible open={isOptionsAvanceesOpen} onOpenChange={setIsOptionsAvanceesOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="sim-pli w-full justify-between h-auto">
                <span className="flex items-center gap-1.5 sm:gap-2 text-sm flex-wrap">
                  <Settings className="sim-marque h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold text-foreground">Options avancées</span>
                  <Badge variant="secondary" className="sim-puce info">Optimisation</Badge>
                </span>
                <ChevronDown className={cn("sim-chevron h-5 w-5 transition-transform duration-200", isOptionsAvanceesOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="sim-pli-in pt-4 mt-3">
              <Accordion type="multiple" className="space-y-2">

                {/* ─── ACCORDION 1 : Retraite & CARMF ─── */}
                <AccordionItem value="carmf" className="sim-rangee px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <Shield className="sim-marque h-4 w-4 flex-shrink-0" />
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
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm">
                          Situation CARMF
                        </FormLabel>
                        <PremiumTooltip title="Situation CARMF" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Ta retraite obligatoire de médecin</p>
                              <p className="text-xs">La CARMF (Caisse Autonome de Retraite des Médecins de France) gère ta retraite de base, ta complémentaire et ton invalidité-décès.</p>
                              <TipBox variant="info">
                                <div className="space-y-1">
                                  <p><strong>Affilié</strong> : cotisations complètes (base + complémentaire + invalidité-décès)</p>
                                  <p><strong>&lt; 2 ans, &lt;40 ans</strong> : exonéré de complémentaire les 2 premières années</p>
                                  <p><strong>Dispensé</strong> : remplaçant dont le revenu net reste sous 15 000 €, sur demande à la CARMF (ni trimestres de retraite, ni couverture invalidité-décès)</p>
                                </div>
                              </TipBox>
                              <TipBox variant="tip">
                                <p>💡 La CARMF est calculée automatiquement par le simulateur.</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value || 'affilie_3ans_plus'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Affilié (cas général)" /></SelectTrigger></FormControl>
                          <SelectContent className="sim sim-pop">
                            <SelectItem value="affilie_3ans_plus">Affilié (cas général)</SelectItem>
                            <SelectItem value="affilie_jeune">Jeune affilié (&lt; 2 ans, &lt; 40 ans)</SelectItem>
                            <SelectItem value="dispense">Dispensé (remplaçant, revenu net &lt; 15 000 €)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs mt-1.5 px-1">
                          {field.value === 'affilie_3ans_plus' && <p className="text-muted-foreground">Cotisations complètes : base + complémentaire + invalidité-décès</p>}
                          {field.value === 'affilie_jeune' && <p className="sim-ok">✅ Exonéré de complémentaire les 2 premières années — cotisations réduites</p>}
                          {field.value === 'dispense' && !isRspmEffectif && <p className="text-muted-foreground">Aucune cotisation CARMF (retraite de base, complémentaire, ASV, invalidité-décès). Possible seulement pour un remplaçant dont le revenu net reste sous 15 000 € : au-delà, le simulateur ne l'applique pas.</p>}
                          {field.value === 'dispense' && isRspmEffectif && <p className="text-muted-foreground">En RSPM, la dispense ne s'applique pas à la RID : elle reste obligatoire (157€ ou 626€/an selon le taux ci-dessous).</p>}
                        </div>
                        <FormMessage role="alert" />
                      </FormItem>
                    )} />
                    {showRidToggle && (
                      <FormField control={form.control} name="tauxRid" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                          <FormLabel className="flex items-center gap-2 text-sm">
                            Cotisation RID CARMF
                          </FormLabel>
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
                          </div>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value || '25%'} className="flex gap-4">
                              <div className="flex items-center gap-2"><RadioGroupItem value="25%" id="rid-25" /><label htmlFor="rid-25" className="text-sm cursor-pointer">25% (157€/an)</label></div>
                              <div className="flex items-center gap-2"><RadioGroupItem value="100%" id="rid-100" /><label htmlFor="rid-100" className="text-sm cursor-pointer">100% (626€/an)</label></div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage role="alert" />
                        </FormItem>
                      )} />
                    )}
                    {!showRidToggle && <p className="text-xs text-muted-foreground px-1">ℹ️ Les cotisations CARMF (dont la RID) sont intégrées automatiquement dans le calcul PAMC.</p>}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 2 : Déductions professionnelles ─── */}
                <AccordionItem value="deductions" className="sim-rangee px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <PiggyBank className="sim-marque h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Déductions professionnelles</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const count = [
                            forfait2pct && deductionsS1Ouvertes,
                            cotisationsVolontaires > 0,
                            form.getValues('chequesVacances') > 0,
                            form.getValues('ratioNonConventionne') > 0 && deductionsS1Ouvertes,
                          ].filter(Boolean).length;
                          return count > 0 ? `${count} active${count > 1 ? 's' : ''}` : '';
                        })()}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    <p className="text-xs text-muted-foreground px-1">Ces déductions <strong className="text-foreground/70">s'ajoutent</strong> à tes charges ci-dessus. Ne les inclus pas dans le champ « Charges réelles ».</p>
                    {!deductionsS1Ouvertes && secteurConventionnel === 'secteur_1' && (
                      <div className="sim-note neutre">
                        <p className="text-xs"><strong>Remplaçant : pas de forfait 2 %, de 3 % ni de groupe III.</strong> Ces déductions sont réservées aux médecins personnellement conventionnés en secteur 1, donc installés (BOFiP, BOI-BNC-SECT-40). Choisis « Installé » dans « Exercice » si c'est ton cas.</p>
                      </div>
                    )}
                    {deductionsS1Ouvertes && (
                      <FormField control={form.control} name="forfait2pct" render={({ field }) => (
                        <FormItem className="sim-coche flex items-start gap-3">
                          <FormControl><input type="checkbox" checked={field.value} onChange={field.onChange} className="sim-case" /></FormControl>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                            <FormLabel className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                              Forfait 2% (Secteur 1 - BNC réel)
                            </FormLabel>
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
                            </div>
                            <FormDescription className="text-xs mt-0.5">Déduit 2% de ton CA (frais de représentation)</FormDescription>
                          </div>
                        </FormItem>
                      )} />
                    )}
                    {deductionsS1Ouvertes && (
                      <FormField control={form.control} name="ratioNonConventionne" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                          <FormLabel className="flex items-center gap-2 text-sm">% d'honoraires non conventionnés <Badge variant="outline" className="sim-puce neutre">Optionnel</Badge>
                          </FormLabel>
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
                          </div>
                          <div className="relative"><FormControl><Input type="number" step="1" min={0} max={100} placeholder="0" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span></div>
                          <FormDescription className="text-xs">Part du CA hors convention — Déductions S1 proratisées</FormDescription>
                          <FormMessage role="alert" />
                        </FormItem>
                      )} />
                    )}
                    <FormField control={form.control} name="cotisationsVolontaires" render={({ field }) => {
                      const yearlyCA = periode === 'mensuel' ? (recettesBrutes || 0) * 12 : (recettesBrutes || 0);
                      const yearlyCharges = (() => {
                        const c = form.watch('chargesHorsCotisations') || 0;
                        return periode === 'mensuel' ? c * 12 : c;
                      })();
                      // Aperçu du plafond (le calcul exact, régime par régime, est fait par le moteur) :
                      // PER (163 quatervicies) sur le bénéfice micro (66 % des recettes) ; Madelin
                      // (154 bis, réel) sur un bénéfice réel estimé après cotisations (~75 %).
                      const anneeForm = form.watch('annee') || 2026;
                      const typeCotisation = form.watch('typeCotisationsVolontaires') || 'per';
                      const perPlafond = typeCotisation === 'madelin'
                        ? getPlafondEpargneRetraite('madelin', Math.max(0, yearlyCA - yearlyCharges) * 0.75, anneeForm)
                        : getPlafondEpargneRetraite('per', yearlyCA * 0.66, anneeForm);
                      const saisie = field.value || 0;
                      const depasseCap = saisie > perPlafond;
                      const madelinEnMicro = typeCotisation === 'madelin';
                      const isMicroLikely = typeCotisation === 'per';
                      return (
                      <FormItem>
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm">Cotisations volontaires (PER, Madelin...)
                        </FormLabel>
                        <PremiumTooltip title="Épargne retraite (PER / Madelin)" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Versements PER ou contrat Madelin</p>
                              <p className="text-xs">Tes versements d'épargne retraite sont déductibles de ton revenu imposable → moins d'impôt à payer.</p>
                              <TipBox variant="info">
                                <div className="space-y-0.5">
                                  <p><strong>PER</strong> : déductible du revenu global (micro ET réel)</p>
                                  <p><strong>Madelin</strong> : déductible du BNC réel uniquement</p>
                                  <p className="mt-1">Plafond PER : 10 % de tes revenus professionnels de l'année précédente (en 2026 : 4 710 € au moins, 37 680 € au plus).</p>
                                  <p>Plafond Madelin : 10 % du bénéfice, plus 15 % de la part entre 48 060 € et 384 480 € (2026).</p>
                                </div>
                              </TipBox>
                              <TipBox variant="warning">
                                <p>⚠️ En Micro-BNC, seul le PER est déductible (pas le Madelin).</p>
                              </TipBox>
                            </div>
                          }>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </div>
                        <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: 5 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
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
                            <span className="block mt-1 sim-attn">
                              ⚠️ Au-dessus du plafond estimé (environ {perPlafond.toLocaleString('fr-FR')}€, CGI art. {typeCotisation === 'madelin' ? '154 bis' : '163 quatervicies'}) : seul le plafond est déduit.
                            </span>
                          )}
                          {madelinEnMicro && (
                            <span className="block mt-1 sim-attn">
                              ℹ️ Madelin : déduit au Régime Réel seulement (CGI art. 154 bis). La fiche Micro-BNC ne le compte pas.
                            </span>
                          )}
                          {!madelinEnMicro && !depasseCap && isMicroLikely && typeCotisation === 'per' && saisie > 0 && (
                            <span className="block mt-1 sim-ok">✓ PER : déduit du revenu global, en Micro-BNC comme au Régime Réel.</span>
                          )}
                        </FormDescription>
                        <FormMessage role="alert" />
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
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm">Chèques-vacances ANCV <Badge variant="outline" className="sim-puce neutre">Réel</Badge>
                        </FormLabel>
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
                        </div>
                        <div className="relative"><FormControl><Input type="number" step="1" min={0} max={plafondCV} placeholder="Ex: 1 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                        <FormDescription className="text-xs">En plus de tes charges. Max {plafondLabel} ({annee}) — BNC réel uniquement. <span className="sim-attn">⚠️ Sans effet en Micro-BNC.</span></FormDescription>
                        <FormMessage role="alert" />
                      </FormItem>
                      );
                    }} />
                    {deductionsS1Ouvertes && (
                      <div className="sim-note ok">
                        <p className="text-xs"><strong>✅ Déductions Secteur 1 automatiques</strong> (BNC réel, installé) : 3 % des honoraires conventionnels + groupe III (barème des omnipraticiens, 3 050 € au-delà de 30 450 €).</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 3 : Revenus complémentaires ─── */}
                <AccordionItem value="revenus-complementaires" className="sim-rangee px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <Home className="sim-marque h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Fiscalité immobilière & zones</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const parts = [];
                          if (zoneExoneree !== 'aucune') parts.push({ zfu: 'ZFU', qpv: 'QPV', zfrr: 'FRR', zfrr_plus: 'FRR+' }[zoneExoneree] ?? 'Zone');
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
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm"><Map className="sim-marque h-4 w-4" /> Zone exonérée
                        </FormLabel>
                        <PremiumTooltip title="Zones exonérées" content={
                            <div className="space-y-2">
                              <p className="font-semibold">Exonération d'impôt en zone prioritaire</p>
                              <p className="text-xs">Si tu t'es installé dans une zone prioritaire, une partie de ton bénéfice est exonérée d'impôt sur le revenu, de façon dégressive (pas de cotisations en moins).</p>
                              <TipBox variant="info">
                                <p className="font-medium mb-1">🏙️ ZFU-TE (installations jusqu'en 2025) et QPV (installations 2026 à 2030) :</p>
                                <div className="space-y-0.5 mb-2">
                                  <p>Années 1 à 5 → <strong>100 %</strong> exonéré</p>
                                  <p>Année 6 → <strong>60 %</strong> · Année 7 → <strong>40 %</strong> · Année 8 → <strong>20 %</strong></p>
                                  <p>Micro-BNC et réel. ZFU-TE : 50 000 € de bénéfice exonéré par an au plus.</p>
                                </div>
                                <p className="font-medium mb-1">🌾 France ruralités revitalisation (FRR, ex-ZRR) :</p>
                                <div className="space-y-0.5 mb-2">
                                  <p>Années 1 à 5 → <strong>100 %</strong> exonéré</p>
                                  <p>Année 6 → <strong>75 %</strong> · Année 7 → <strong>50 %</strong> · Année 8 → <strong>25 %</strong></p>
                                  <p>FRR (socle) et ex-ZRR : régime réel seulement. FRR+ (communes les plus fragiles, installations depuis 2025) : micro-BNC ou réel.</p>
                                </div>
                                <p className="sim-filet text-[11px] pt-1.5 mt-1.5">
                                  CGI art. 44 octies A (ZFU-TE), 44 octies B (QPV), 44 quindecies et 44 quindecies A (FRR), dans la limite des aides de minimis. ⚠️ L'année d'installation, le plafond ZFU-TE est proratisé : sécurise auprès de ton SIE ou de ton AGA.
                                </p>
                              </TipBox>

                            </div>
                          }>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </PremiumTooltip>
                        </div>
                        <Select onValueChange={field.onChange} value={field.value || 'aucune'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Aucune" /></SelectTrigger></FormControl>
                          <SelectContent className="sim sim-pop">
                            <SelectItem value="aucune">Aucune</SelectItem>
                            {/* ZFU-TE : dispositif clos au 31.12.2025 — caché pour les nouvelles installations 2026+.
                                Logique centralisée dans simulateurSchema.isZoneExoneneeAvailable (CGI Art. 44 octies A). */}
                            {(isZoneExoneneeAvailable('zfu', annee, anneeInstallationZone) || zoneExoneree === 'zfu') && (
                              <SelectItem value="zfu">🏙️ ZFU-TE{annee >= 2026 ? ' (installations ≤ 2025)' : ''}</SelectItem>
                            )}
                            <SelectItem value="qpv">🏙️ QPV (installations 2026-2030)</SelectItem>
                            <SelectItem value="zfrr">🌾 FRR socle ou ex-ZRR (réel)</SelectItem>
                            <SelectItem value="zfrr_plus">🌾 FRR+ (micro ou réel)</SelectItem>
                          </SelectContent>
                        </Select>
                        {annee >= 2026 && (
                          <FormDescription className="text-xs text-muted-foreground">
                            ℹ️ ZFU-TE : dispositif clos au 31.12.2025 (CGI art. 44 octies A), remplacé pour les installations de 2026 à 2030 par le régime QPV (art. 44 octies B). Les installations antérieures conservent leur exonération dégressive jusqu'au terme.
                          </FormDescription>
                        )}
                        <FormMessage role="alert" />
                      </FormItem>
                    );
                    }} />
                    {zoneExoneree && zoneExoneree !== 'aucune' && (
                      <FormField control={form.control} name="anneeInstallationZone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Année d'installation dans la zone</FormLabel>
                          <FormControl><Input type="number" step="1" min={2000} max={2030} placeholder="Ex: 2022" {...field} value={field.value || ''} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} onFocus={(e) => e.target.select()} /></FormControl>
                          <FormDescription className="text-xs">Taux d'exonération dégressif selon l'ancienneté. ⚠️ L'année d'installation et l'année de basculement de palier (5 ans + 1) → plafond proratisé temporis (CGI Art. 49 K annexe III ; CE 18/07/2018 n° 412142) : notre calcul affiche le plafond plein par simplification, sécurise auprès de ton SIE/AGA.</FormDescription>
                          <FormMessage role="alert" />
                        </FormItem>

                      )} />
                    )}
                    <FormField control={form.control} name="regimeFoncier" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm"><Home className="sim-marque h-4 w-4" /> Revenus fonciers
                        </FormLabel>
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
                        </div>
                        <Select onValueChange={field.onChange} value={field.value || 'aucun'}>
                          <FormControl><SelectTrigger className="h-9"><SelectValue placeholder="Aucun" /></SelectTrigger></FormControl>
                          <SelectContent className="sim sim-pop"><SelectItem value="aucun">Aucun</SelectItem><SelectItem value="micro">Micro-foncier (abattement 30%)</SelectItem><SelectItem value="reel">Régime réel</SelectItem></SelectContent>
                        </Select>
                        <FormMessage role="alert" />
                      </FormItem>
                    )} />
                    {regimeFoncier === 'micro' && (
                      <FormField control={form.control} name="revenusFonciersBruts" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Revenus fonciers bruts annuels</FormLabel>
                          <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: 12 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                          <FormDescription className="text-xs">Loyers bruts (≤ 15 000€ pour micro-foncier)</FormDescription>
                          {form.watch('revenusFonciersBruts') > 15000 && (
                            <p className="text-xs sim-attn">⚠️ Au-delà de 15 000€/an, le micro-foncier n'est plus applicable. Passe en régime réel.</p>
                          )}
                          <FormMessage role="alert" />
                        </FormItem>
                      )} />
                    )}
                    {regimeFoncier === 'reel' && (
                      <FormField control={form.control} name="revenuFoncierNet" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Résultat foncier net annuel</FormLabel>
                          <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: -5000 ou 8000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                          <FormDescription className="text-xs">Négatif = déficit. Imputable sur ton revenu global jusqu'à -10 700€/an (CGI Art. 156-I-3°). L'excédent éventuel reste reportable 10 ans sur tes futurs revenus fonciers.</FormDescription>
                          <FormMessage role="alert" />
                        </FormItem>
                      )} />
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* ─── ACCORDION 4 : Crédits d'impôt ─── */}
                <AccordionItem value="credits" className="sim-rangee px-3 overflow-hidden">
                  <AccordionTrigger className="py-3 hover:no-underline gap-2 text-sm">
                    <span className="flex items-center gap-2 flex-1">
                      <GraduationCap className="sim-marque h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold text-foreground">Crédits d'impôt</span>
                      <span className="ml-auto mr-2 text-xs text-muted-foreground font-normal truncate">
                        {(() => {
                          const credAutre = form.getValues('creditImpotAutre') || 0;
                          const fraisED = form.getValues('fraisEmploiDomicile') || 0;
                          const fraisGE = form.getValues('fraisGardeEnfants') || 0;
                          const nbGarde = form.getValues('nombreEnfantsGarde') || 0;
                          const credED = fraisED > 0 ? Math.round(Math.min(fraisED, Math.min(12000 + (form.getValues('enfants') || 0) * 1500, 15000)) * 0.5) : 0;
                          const credGE = fraisGE > 0 && nbGarde > 0 ? Math.round(Math.min(fraisGE, 3500 * nbGarde) * 0.5) : 0;
                          const total = credAutre + credED + credGE;
                          return total > 0 ? `${total.toLocaleString('fr-FR')}€` : '';
                        })()}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-3">
                    {/* Crédit d'impôt formation des dirigeants retiré (novembre 2026) : il ne vaut que
                        pour les heures suivies jusqu'au 31/12/2024 (CGI art. 244 quater M, abrogé par
                        la loi de finances 2026). Le simulateur couvre 2025 et 2026. */}

                    {/* ─── Emploi à domicile ─── */}
                    <FormField control={form.control} name="fraisEmploiDomicile" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm">Emploi à domicile
                        </FormLabel>
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
                        </div>
                        <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: 6 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                        <FormDescription className="text-xs">
                          {(() => {
                            const enfants = form.getValues('enfants') || 0;
                            const plafond = Math.min(12000 + enfants * 1500, 15000);
                            const creditMax = Math.round(plafond * 0.5);
                            return `Dépenses annuelles. Plafond : ${plafond.toLocaleString('fr-FR')}€ → crédit max : ${creditMax.toLocaleString('fr-FR')}€`;
                          })()}
                          {(field.value || 0) > Math.min(12000 + (form.getValues('enfants') || 0) * 1500, 15000) && (
                            <span className="block mt-1 sim-attn">⚠️ Montant supérieur au plafond — sera plafonné dans le calcul.</span>
                          )}
                        </FormDescription>
                        <FormMessage role="alert" />
                      </FormItem>
                    )} />

                    {/* ─── Garde d'enfant < 6 ans ─── */}
                    <FormField control={form.control} name="nombreEnfantsGarde" render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                        <FormLabel className="flex items-center gap-2 text-sm">Enfants en garde (&lt; 6 ans)
                        </FormLabel>
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
                        </div>
                        <FormControl><Input type="number" step="1" min={0} max={10} placeholder="0" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()} /></FormControl>
                        <FormDescription className="text-xs">Nombre d'enfants de moins de 6 ans gardés hors domicile</FormDescription>
                        <FormMessage role="alert" />
                      </FormItem>
                    )} />
                    {(form.watch('nombreEnfantsGarde') || 0) > 0 && (
                      <FormField control={form.control} name="fraisGardeEnfants" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">Frais de garde annuels (total)</FormLabel>
                          <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: 5 000" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                          <FormDescription className="text-xs">
                            {(() => {
                              const nbEnfants = form.getValues('nombreEnfantsGarde') || 0;
                              const plafond = 3500 * nbEnfants;
                              const creditMax = Math.round(plafond * 0.5);
                              return `Plafond : ${plafond.toLocaleString('fr-FR')}€ (${nbEnfants} enfant${nbEnfants > 1 ? 's' : ''} × 3 500€) → crédit max : ${creditMax.toLocaleString('fr-FR')}€`;
                            })()}
                            {(field.value || 0) > 3500 * (form.getValues('nombreEnfantsGarde') || 0) && (
                              <span className="block mt-1 sim-attn">⚠️ Montant supérieur au plafond — sera plafonné dans le calcul.</span>
                            )}
                          </FormDescription>
                          <FormMessage role="alert" />
                        </FormItem>
                      )} />
                    )}

                    <FormField control={form.control} name="creditImpotAutre" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm">Autres crédits d'impôt <Badge variant="outline" className="sim-puce neutre">Optionnel</Badge></FormLabel>
                        <div className="relative"><FormControl><Input type="number" step="0.01" placeholder="Ex: 1 500" {...field} value={field.value === 0 ? '' : field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="pr-8" /></FormControl><span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span></div>
                        <FormDescription className="text-xs">Dons, investissements locatifs, etc.</FormDescription>
                        <FormMessage role="alert" />
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
          className="sim-btn sim-btn-soleil w-full"
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
