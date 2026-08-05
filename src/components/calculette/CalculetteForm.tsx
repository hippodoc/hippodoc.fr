import React, { useMemo } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight, HelpCircle, Wand2, Info, AlertTriangle, AlertOctagon, CheckCircle2, Users, BookOpen, ArrowLeftRight } from 'lucide-react';

type NoticeTone = 'info' | 'warning' | 'success' | 'danger' | 'neutral';
const NOTICE_STYLES: Record<NoticeTone, string> = {
  info: 'border-blue-200/70 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200',
  warning: 'border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200',
  success: 'border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive',
  neutral: 'border-violet-200/70 dark:border-violet-900/40 bg-violet-50/50 dark:bg-violet-950/20 text-violet-900 dark:text-violet-200',
};
function Notice({
  tone, icon: Icon, children,
}: { tone: NoticeTone; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border ${NOTICE_STYLES[tone]} px-4 py-3 text-xs flex items-start gap-2.5`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
import { calculerForfaitsSecteur1, sommeSousPostesDansAF } from './forfaitsSecteur1';
import { getMicroBncCeiling } from '@/lib/baremes-ir';
import { trackEvent } from '@/lib/analytics';
import { toast } from 'sonner';
import type { CalculetteFormValues, ProfilCalculette } from './calculetteSchema';
import { PROFIL_LABELS, PROFILS_VISIBLES, PROFIL_FICHE_ANCRE, resolveEffectiveProfil } from './calculetteSchema';
import { getCode } from '@/lib/declarantMapping';

interface FieldConfig {
  name: keyof CalculetteFormValues;
  label: string;
  case: string;
  hint: string;
  allowNegative?: boolean;
}

const BLOC_2035: FieldConfig[] = [
  { name: 'AA', label: 'Recettes conventionnelles encaissées', case: 'AA', hint: 'Ligne 1 de la 2035-A : honoraires conventionnels nets encaissés. Inclut tes rétrocessions perçues si tu es remplaçant ou en mode mixte. Pour S2/OPTAM : recettes hors dépassements (les dépassements vont en DSAW).' },
  { name: 'AF', label: 'Gains divers', case: 'AF', hint: 'Recettes hors conventionnel uniquement : IJ Madelin, EHPAD non opposable, expertises, MSU, études cliniques, etc. Ne JAMAIS y mettre des rétrocessions conventionnelles perçues.' },
  { name: 'CE', label: 'Total Excédent (col. 4)', case: 'CE', hint: 'Total de la colonne « Excédent » du cadre 4 de la 2035-B.' },
  { name: 'CN', label: 'Total Insuffisance (col. 5)', case: 'CN', hint: 'Total de la colonne « Insuffisance » du cadre 4 de la 2035-B.' },
  { name: 'BK', label: 'Charges sociales personnelles', case: 'BK', hint: 'URSSAF + CARMF déduites au BNC. À réintégrer dans le RBS.' },
  { name: 'BV', label: 'CSG déductible', case: 'BV', hint: 'CSG/CRDS déductible. À réintégrer dans le RBS.' },
  { name: 'CP', label: 'Résultat BNC (ligne 46)', case: 'CP', hint: 'Bénéfice ou déficit BNC final. Peut être négatif.', allowNegative: true },
];

const BLOC_EXOS: FieldConfig[] = [
  { name: 'CS', label: 'Exo ZFU', case: 'CS', hint: 'Zone Franche Urbaine — Territoires Entrepreneurs (régime réel uniquement). Reporte ici le montant exonéré tel qu\'il figure cadre 5 de ta 2035-B. En Micro-BNC, utilise le mini-bloc « Exonération zonée » dédié plus haut — la calculette dérive 5HP/5HQ à partir des recettes brutes réalisées en zone. Plafond ZFU : 50 000 €/an de bénéfice exonéré, dégressif sur 8 ans (5 ans à 100 %, puis 60 %/40 %/20 %). ⚠️ Plafond proratisé l\'année d\'installation et de basculement de palier (cf. QT-049).' },
  { name: 'AW', label: 'Exo entreprise nouvelle', case: 'AW', hint: 'Art. 44 sexies CGI.' },
  { name: 'CU', label: 'Exo entreprise innovante', case: 'CU', hint: 'JEI / JEU.' },
  { name: 'CI', label: 'Exo zones déficitaires', case: 'CI', hint: 'Zones de revitalisation rurale médicale.' },
  { name: 'CO', label: 'Exo jeunes artistes', case: 'CO', hint: 'Rare chez les médecins (héritage de la nomenclature).' },
  { name: 'DG', label: 'Exo Forfait 3 %', case: 'DG', hint: 'Forfait 3 % des honoraires conventionnels — secteur 1. Cumulable avec DH (Groupe III) depuis l\'imposition des revenus 2023 (BOI-BNC-SECT-40 ; UNASA §391).' },
  { name: 'CJ', label: 'Exo ZFRR', case: 'CJ', hint: 'Zone France Ruralités Revitalisation (ex-ZRR — CGI Art. 44 quindecies / 44 quindecies A). Réservée aux médecins installés et collaborateurs (les remplaçants ne sont pas éligibles). Plafond : 300 000 € de bénéfice exonéré sur 3 années glissantes (année courante + 2 précédentes). Dégressivité : 100 % (5 ans) puis 75 % / 50 % / 25 %. Reporte le montant exonéré tel qu\'il figure cadre 5 de ta 2035-B. ⚠️ Plafond proratisé l\'année d\'installation et de basculement de palier (cf. QT-049).' },
  { name: 'DH', label: 'Exo Groupe III', case: 'DH', hint: 'Forfait Groupe III — secteur 1. Cumulable avec DG depuis l\'imposition des revenus 2023 (BOI-BNC-SECT-40).' },
];

const BLOC_EXTRAS: FieldConfig[] = [
  { name: 'ijCpam', label: 'IJ CPAM hors ALD', case: 'IJ CPAM', hint: 'Maladie hors ALD, maternité, paternité, AFRM. **JAMAIS en 1AJ** (pré-tolérance CPAM supprimée). En réel : à inclure dans AF (gains divers) → 5QC, avec miroir en ligne DB du Cadre 8. En micro-BNC : exonérées d\'IR (PAS dans 5HQ — Brochure DGFiP 2026 p. 180), uniquement en DSDX (volet social, brut).' },
  { name: 'ijMadelin', label: 'IJ Madelin (+ AJPA proche aidant)', case: 'IJ Mad.', hint: 'Déjà comptées en gains divers — réintégrées en DSCZ.' },
  { name: 'ijCarmf', label: 'Pension de retraite CARMF (RB/RC/ASV)', case: 'Pension', hint: 'Réservée aux VRAIES pensions de retraite CARMF (régime de base RB, complémentaire RC, ASV) — déclarées en case 1AS (pensions/rentes). ⚠️ Ne PAS saisir ici tes IJ CARMF temporaires (médecin actif en arrêt court) : elles relèvent du BNC (ligne AF en réel, recettes 5HQ en micro), JAMAIS de 1AS. L\'invalidité permanente CARMF va en 1AZ.' },
  { name: 'chequesVacances', label: 'Chèques-vacances ANCV', case: 'CV', hint: 'Deux plafonds indépendants. Plafond fiscal (max déductible du bénéfice) — Plafond 2024 : 1 766 € · 2025 : 1 802 € · 2026 : 1 823 €. Plafond social (exo cotisations URSSAF + CARMF, = 30 % SMIC mensuel) — 2024 : 530 € · 2025 : 541 € · 2026 : 547 €. DSCN reçoit le total commandé. 💡 **Frais d\'ouverture / d\'envoi ANCV** : à comptabiliser en **frais divers (poste BP / cadre 4 de la 2035-A)**, **PAS dans DSCN** (qui ne reçoit que le montant facial des chèques commandés).' },
  { name: 'depassements', label: 'Dépassements d\'honoraires', case: 'DSAW', hint: 'Secteur 2 / OPTAM. En réel : impacte le taux ASV. En Micro-BNC : utilisé pour calculer dynamiquement le ratio conventionné DSAU et la part DSAV.' },
  { name: 'ehpadHadSsiadCmpp', label: 'EHPAD non opposable / HAD / SSIAD / CMPP', case: 'DSAT', hint: 'Recettes nettes de ces structures, déclarables séparément.' },
];

function FieldRow({ field }: { field: FieldConfig }) {
  const { control, formState: { errors } } = useFormContext<CalculetteFormValues>();
  const declarantRaw = useWatch({ control, name: 'declarant' });
  const declarant: 1 | 2 = declarantRaw === 2 ? 2 : 1;
  const error = errors[field.name];
  // V15 — B1 : buffer string local pour permettre la saisie clavier d'un déficit
  // BNC négatif (ex: CP). Sans ce buffer, taper "-" déclenchait rhf.onChange(0)
  // → display revenait à '' → le "-" disparaissait avant que l'utilisateur puisse
  // taper le chiffre suivant.
  const [buf, setBuf] = React.useState<string | null>(null);
  // Phase 3 : badge dynamique D1/D2 (fallback sur la valeur brute si pas de mapping).
  const displayCase = getCode(field.case, declarant);

  // Affiche la chip mono-code uniquement pour les vrais codes officiels (AA, AF,
  // CE, DSAT, IJ Mad., PDSA…). Pour les labels pédagogiques type "Brut total" ou
  // "Pré-déduit", on bascule sur un tag sobre non-mono pour éviter de laisser
  // croire à un code DGFiP.
  const codeIsOfficial =
    /^[A-Z]{2,5}$/.test(field.case) ||
    /^IJ [A-Z][a-zA-Z.]+$/.test(field.case) ||
    /^DS[A-Z]{2,3}$/.test(field.case) ||
    field.case === 'PDSA' ||
    field.case === 'CV';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={field.name} className="text-sm font-medium flex items-center gap-1.5">
          {codeIsOfficial ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 dark:bg-muted/40 text-slate-500 dark:text-muted-foreground text-[10px] font-mono font-bold">
              {displayCase}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-hippo-50/60 dark:bg-hippo-900/20 text-hippo-700/80 dark:text-hippo-300/80 text-[10px] uppercase tracking-wide font-medium">
              {displayCase}
            </span>
          )}
          <span>{field.label}</span>
        </Label>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger type="button" aria-label={`Aide pour ${field.label}`}>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{field.hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Controller
        control={control}
        name={field.name}
        render={({ field: rhf }) => {
          const v = rhf.value as number;
          // P4 — n'affiche pas "0" en placeholder (force à effacer avant de taper).
          // P6 — accepte la virgule française.
          // V13 — P2 : affichage avec virgule FR pour cohérence locale.
          // V15 — B1 : buffer prioritaire pendant la frappe (gère "-" intermédiaire).
          const display = buf !== null ? buf : (v === 0 ? '' : String(v).replace('.', ','));
          return (
            <Input
              id={field.name}
              type="text"
              inputMode="decimal"
              value={display}
              aria-invalid={!!error}
              aria-describedby={error ? `${field.name}-error` : undefined}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = raw.replace(/\s/g, '').replace(',', '.');
                // V16 — B1 : rejette silencieusement les caractères invalides
                // (lettres, symboles), au lieu de figer le buffer sur "abc". Le buf
                // n'est mis à jour QUE si le contenu est numériquement acceptable.
                if (cleaned === '') {
                  setBuf('');
                  rhf.onChange(0);
                  return;
                }
                if (cleaned === '-') {
                  if (!field.allowNegative) return; // rejet si champ ≥ 0
                  setBuf(raw);
                  rhf.onChange(0);
                  return;
                }
                const n = parseFloat(cleaned);
                if (Number.isNaN(n)) return; // ne pas polluer le buffer
                if (!field.allowNegative && n < 0) return;
                setBuf(raw);
                rhf.onChange(n);
              }}
              onBlur={() => { setBuf(null); rhf.onBlur(); }}
              className="h-10"
              placeholder="0"
            />
          );
        }}
      />
      {error && <p id={`${field.name}-error`} className="text-xs text-destructive">{String(error.message)}</p>}
    </div>
  );
}

export function CalculetteForm() {
  const { control, setValue, getValues } = useFormContext<CalculetteFormValues>();
  const regime = useWatch({ control, name: 'regimeFiscal' });
  const regimeSocial = useWatch({ control, name: 'regimeSocial' });
  const profil = useWatch({ control, name: 'profil' });
  const depassementsAutorises = useWatch({ control, name: 'depassementsAutorises' }) || false;
  const effectiveProfil = resolveEffectiveProfil(profil, depassementsAutorises);
  const annee = useWatch({ control, name: 'annee' });
  const recettesMicroBnc = useWatch({ control, name: 'recettesMicroBnc' }) || 0;
  const depassements = useWatch({ control, name: 'depassements' }) || 0;
  const chequesVacances = useWatch({ control, name: 'chequesVacances' }) || 0;
  const aaValue = useWatch({ control, name: 'AA' }) || 0;
  const afValue = useWatch({ control, name: 'AF' }) || 0;
  const isMicro = regime === 'micro_bnc';
  const isSecteur1 = profil === 'installe_s1';
  const isRemplacant = profil === 'remplacant';
  const isMixte = effectiveProfil === 'mixte';
  const isS2 = profil === 'installe_s2';
  const isRspm = regimeSocial === 'rspm' && isRemplacant;
  // Doctrine URSSAF DRI-PAMC : seuil RSPM→PAMC = recettes CONVENTIONNÉES (AA seul
  // en réel, recettesMicroBnc en micro). AF (gains divers) hors conventionnel exclu.
  const recettesConv = isMicro ? recettesMicroBnc : aaValue;
  const showRspmCeilingWarning = isRspm && recettesConv > 38_000;
  // B11 — Cohérence profil ↔ dépassements (réel + micro)
  // Refonte mai 2026 : DP coché sous S1 = cas légitime → pas de banner S2.
  const showSecteur2Banner = depassements > 0 && !isS2 && !isMixte;
  // V15 — U2 : en micro-BNC, les dépassements sont inclus dans recettesMicroBnc
  // (cf. hint V14-U3) → ne pas alerter sur leur absence du champ dédié.
  const showS2NoDepassementsBanner = isS2 && depassements === 0 && !isMicro;
  const showExonerations = !isMicro && !isRemplacant;
  const showCadre8 = !isMicro && !isRemplacant && annee >= 2025;
  const microBncCeiling = getMicroBncCeiling(annee);
  const showMicroBncCeilingWarning = isMicro && recettesMicroBnc > microBncCeiling;

  // Force PAMC si le profil n'est pas remplaçant (RSPM strictement réservé aux remplaçants purs).
  React.useEffect(() => {
    if (!isRemplacant && regimeSocial !== 'pamc') {
      setValue('regimeSocial', 'pamc', { shouldDirty: true });
      toast.info('Régime social repassé en PAMC : le RSPM est réservé aux remplaçants non-titulaires.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemplacant]);

  // V8 — B16 / V11 — M1 / V12 — R2 :
  // Lecture via getValues() au moment où l'effet tire (pas de stale closure sur useWatch).
  React.useEffect(() => {
    if (!isMicro) {
      // V17 — B2 : symétrique. En basculant en réel, on purge les champs micro-BNC
      // (sinon ils ressortent à la prochaine bascule en micro depuis localStorage).
      const recettesNow = getValues('recettesMicroBnc') || 0;
      const retrosNow = getValues('retrocessionsVerseesMicroBnc') || 0;
      if (recettesNow !== 0) setValue('recettesMicroBnc', 0, { shouldDirty: true });
      if (retrosNow !== 0) setValue('retrocessionsVerseesMicroBnc', 0, { shouldDirty: true });
      // Phase 14.8 — symétrique : on purge la saisie ZFU/ZFRR Micro-BNC en revenant en réel
      // (les exos zonées en réel utilisent les cases CS/CJ du BLOC_EXOS).
      const zoneNow = getValues('recettesZoneExo') || 0;
      if (zoneNow !== 0) setValue('recettesZoneExo', 0, { shouldDirty: true });
      if (getValues('zoneExoneree') !== 'aucune') setValue('zoneExoneree', 'aucune', { shouldDirty: true });
      if (getValues('anneeInstallationZone') !== undefined) setValue('anneeInstallationZone', undefined, { shouldDirty: true });
      if (getValues('moisInstallation') !== undefined) setValue('moisInstallation', undefined, { shouldDirty: true });
      return;
    }
    const lostFields: string[] = [];
    const ehpadNow = getValues('ehpadHadSsiadCmpp') || 0;
    if (ehpadNow > 0) {
      setValue('ehpadHadSsiadCmpp', 0, { shouldDirty: true });
      lostFields.push('EHPAD/HAD/SSIAD/CMPP');
    }
    // En bascule réel → micro, on purge aussi les cases CS/CJ de l'ancien bloc Exos
    // (le mini-bloc Micro-BNC zone utilise zoneExoneree/anneeInstallationZone, pas CS/CJ).
    const csNow = getValues('CS') || 0;
    const cjNow = getValues('CJ') || 0;
    const awNow = getValues('AW') || 0;
    const cuNow = getValues('CU') || 0;
    const ciNow = getValues('CI') || 0;
    const coNow = getValues('CO') || 0;
    const dgNow = getValues('DG') || 0;
    const dhNow = getValues('DH') || 0;
    if (csNow !== 0) { setValue('CS', 0, { shouldDirty: true }); lostFields.push('Exo ZFU (CS)'); }
    if (cjNow !== 0) { setValue('CJ', 0, { shouldDirty: true }); lostFields.push('Exo ZFRR (CJ)'); }
    if (awNow !== 0) setValue('AW', 0, { shouldDirty: true });
    if (cuNow !== 0) setValue('CU', 0, { shouldDirty: true });
    if (ciNow !== 0) setValue('CI', 0, { shouldDirty: true });
    if (coNow !== 0) setValue('CO', 0, { shouldDirty: true });
    if (dgNow !== 0) setValue('DG', 0, { shouldDirty: true });
    if (dhNow !== 0) setValue('DH', 0, { shouldDirty: true });
    // V19 — CV désormais supportés en micro-BNC (RO-005, mécanique × 1,515).
    // Plus de reset : les CV restent saisis lors des bascules micro ↔ réel.
    if (lostFields.length > 0) {
      toast.info(`Champ${lostFields.length > 1 ? 's' : ''} réinitialisé${lostFields.length > 1 ? 's' : ''} : ${lostFields.join(', ')}`, {
        description: 'Champs 2035-B masqués en Micro-BNC. Si tu es en zone ZFU/ZFRR, utilise le sélecteur dédié ci-dessous.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicro]);


  // V17 — B1 : reset depassements + EHPAD si profil = remplaçant pur.
  // Ces champs sont masqués (cf. filter L449), mais leur valeur RHF reste lue
  // par useCalculetteResults → fuite DSAW/DSAT depuis un profil S2 ou installé.
  React.useEffect(() => {
    if (!isRemplacant) return;
    const lostFields: string[] = [];
    const depNow = getValues('depassements') || 0;
    const ehpadNow = getValues('ehpadHadSsiadCmpp') || 0;
    // Phase 14.8 B1 — Le bloc ZoneExoMicroBlock est masqué pour les remplaçants
    // (L511 `{!isRemplacant && …}`) — sans ce reset, `recettesZoneExo` resterait en
    // mémoire RHF et continuerait d'impacter 5HP/5HQ silencieusement.
    const zoneNow = getValues('recettesZoneExo') || 0;
    // Audit post-Phase 14.13 (juin 2026) — F1 : purger aussi Cadre 8 (DE/DB).
    // En branche réel `useCalculetteResults` L381 passe `cadre8DE/cadre8DB` au
    // moteur QUEL QUE SOIT le profil. Un remplaçant qui a précédemment simulé un
    // profil installé S1/S2 et basculé en remplaçant héritait silencieusement
    // des valeurs Cadre 8 → fuite fiscale (RBS faussement majoré/minoré).
    const cadre8DeNow = getValues('cadre8DE') || 0;
    const cadre8DbNow = getValues('cadre8DB') || 0;
    if (depNow > 0) {
      setValue('depassements', 0, { shouldDirty: true });
      lostFields.push('Dépassements');
    }
    if (ehpadNow > 0) {
      setValue('ehpadHadSsiadCmpp', 0, { shouldDirty: true });
      lostFields.push('EHPAD/HAD/SSIAD/CMPP');
    }
    if (zoneNow > 0) {
      setValue('recettesZoneExo', 0, { shouldDirty: true });
      lostFields.push('Recettes en zone ZFU/ZFRR');
    }
    if (cadre8DeNow !== 0) {
      setValue('cadre8DE', 0, { shouldDirty: true });
      lostFields.push('Cadre 8 DE');
    }
    if (cadre8DbNow !== 0) {
      setValue('cadre8DB', 0, { shouldDirty: true });
      lostFields.push('Cadre 8 DB');
    }
    if (getValues('zoneExoneree') !== 'aucune') setValue('zoneExoneree', 'aucune', { shouldDirty: true });
    if (getValues('anneeInstallationZone') !== undefined) setValue('anneeInstallationZone', undefined, { shouldDirty: true });
    if (getValues('moisInstallation') !== undefined) setValue('moisInstallation', undefined, { shouldDirty: true });
    if (lostFields.length > 0) {
      toast.info(`Champ${lostFields.length > 1 ? 's' : ''} réinitialisé${lostFields.length > 1 ? 's' : ''} : ${lostFields.join(', ')}`, {
        description: 'Un remplaçant pur n\'a ni dépassements d\'honoraires, ni recettes EHPAD/HAD, ni exonération zonée (ZFU/ZFRR réservées aux installés et collaborateurs), ni Cadre 8 (réservé installés/mixtes).',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemplacant]);


  // V9 — F4 : reset CV "déjà inclus" quand CV repasse à 0 (état booléen orphelin).
  React.useEffect(() => {
    if (chequesVacances === 0) {
      setValue('chequesVacancesDejaInclus', false, { shouldDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chequesVacances]);

  // V13 — P1 : reset cadre 8 (DE/DB) quand l'année passe sous 2025 (bloc UI masqué,
  // mais valeurs persistées en localStorage : on évite des saisies fantômes ignorées).
  React.useEffect(() => {
    if (annee < 2025) {
      const de = getValues('cadre8DE') || 0;
      const db = getValues('cadre8DB') || 0;
      if (de !== 0) setValue('cadre8DE', 0, { shouldDirty: true });
      if (db !== 0) setValue('cadre8DB', 0, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annee]);

  // V14 — B1 : reset DG/DH/Assistance secteur 1 quand le bloc Assistance n'est plus
  // visible (régime micro OU profil ≠ S1). Sans ça, des forfaits appliqués alors que
  // l'utilisateur était en S1 restent dans le RBS calculé après bascule, sans aucun
  // champ visible — saisies fantômes silencieuses.
  React.useEffect(() => {
    if (!(isMicro || !isSecteur1)) return;
    const lostFields: string[] = [];
    const dg = getValues('DG') || 0;
    const dh = getValues('DH') || 0;
    const assist = getValues('assistanceActive');
    const choix = getValues('choixAssistance');
    const sp = getValues('sousPostes');
    const spSum = sp ? (sp.DE + sp.HN + sp.MSU + sp.expertises + sp.etudes + sp.ijMadelinDansAF + sp.pdsaExonere) : 0;
    if (dg !== 0) { setValue('DG', 0, { shouldDirty: true }); lostFields.push('DG'); }
    if (dh !== 0) { setValue('DH', 0, { shouldDirty: true }); lostFields.push('DH'); }
    if (assist) setValue('assistanceActive', false, { shouldDirty: true });
    if (choix !== 'cumul') setValue('choixAssistance', 'cumul', { shouldDirty: true });
    if (spSum > 0) {
      setValue('sousPostes', { DE: 0, HN: 0, MSU: 0, expertises: 0, etudes: 0, ijMadelinDansAF: 0, pdsaExonere: 0 }, { shouldDirty: true });
    }
    if (lostFields.length > 0) {
      toast.info(`Champ${lostFields.length > 1 ? 's' : ''} réinitialisé${lostFields.length > 1 ? 's' : ''} : ${lostFields.join(', ')}`, {
        description: 'Les forfaits secteur 1 ne s\'appliquent qu\'au profil Installé S1 en régime réel.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicro, isSecteur1]);

  // Refonte UX mai 2026 — Reset `depassementsAutorises` quand le profil n'est plus S1
  // (la case n'a aucun sens hors S1, et `effectiveProfil` doit retomber sur `profil`).
  React.useEffect(() => {
    if (!isSecteur1 && depassementsAutorises) {
      setValue('depassementsAutorises', false, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSecteur1]);

  return (
    <div className="space-y-5">
      {/* Profil & régime */}
      <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold tracking-tight">Ton profil</CardTitle>
          <CardDescription className="text-xs">On adapte les blocs à ta situation.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">Profil d'exercice</Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger type="button" aria-label="Aide profil">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm text-xs space-y-1.5">
                    <p>• <strong>Remplaçant, interne ou vacataire</strong> — libéral non-installé, sans patientèle propre. Inclut PH/assistant/attaché qui fait du libéral à côté (le salaire CHU va en 1AJ de la 2042).</p>
                    <p>• <strong>Cabinet installé — secteur 1 conventionné</strong> — tarifs opposables. Donne accès aux forfaits S1 (2 %, 3 %, Groupe III). Coche « dépassements autorisés » si tu factures aussi des DP / actes hors nomenclature.</p>
                    <p>• <strong>Installé secteur 2</strong> (avec ou sans OPTAM) — dépassements autorisés, DSAU recalculée dynamiquement.</p>
                    <p className="text-muted-foreground pt-1.5 border-t border-border/40">Collaborateur libéral : choisis le secteur du titulaire. En BNC réel, déduis la redevance L16/BG manuellement dans ta 2035 ; en micro-BNC, saisis-la dans le champ « Rétrocessions versées / redevance » ci-dessous (même mécanique de pré-déduction CGI Art. 102 ter). SELARL/SELAS ou EI à l'IS non couvertes (régime IS).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              control={control}
              name="profil"
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v as ProfilCalculette)}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROFILS_VISIBLES.map((p) => (
                      <SelectItem key={p} value={p}>{PROFIL_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Régime fiscal</Label>
            <Controller
              control={control}
              name="regimeFiscal"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reel">Réel — Déclaration contrôlée (2035)</SelectItem>
                    <SelectItem value="micro_bnc">Micro-BNC (abattement 34 %)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Année des revenus</Label>
            <Controller
              control={control}
              name="annee"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v, 10))}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">Revenus 2024 (déclaration 2025)</SelectItem>
                    <SelectItem value="2025">Revenus 2025 (déclaration 2026)</SelectItem>
                    <SelectItem value="2026">Revenus 2026 (déclaration 2027)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Refonte mai 2026 — Checkbox dépassements autorisés, visible uniquement sous S1 (cas rare ~2 %). */}
          {isSecteur1 && (
            <div className="sm:col-span-3 -mt-1">
              <Controller
                control={control}
                name="depassementsAutorises"
                render={({ field }) => (
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                      id="depassements-autorises"
                    />
                    <span className="leading-relaxed">
                      <strong className="text-foreground font-medium">J'ai aussi des dépassements autorisés</strong> (DP, actes hors nomenclature, NPC).{' '}
                      <span className="text-muted-foreground">Cas rare — active la DSAU dynamique en plus des forfaits S1.</span>
                    </span>
                  </label>
                )}
              />
            </div>
          )}

          {/* V22 — Toggle Déclarant 1 / Déclarant 2 */}
          <div className="sm:col-span-3 flex flex-wrap items-center gap-3 pt-1 border-t border-border/40 -mt-1">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Tu remplis pour</Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger type="button" aria-label="Aide déclarant">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs space-y-1">
                    <p><strong>Déclarant 1</strong> : la personne dont le nom apparaît en premier sur la déclaration commune.</p>
                    <p><strong>Déclarant 2</strong> : conjoint(e) ou partenaire de PACS.</p>
                    <p className="text-muted-foreground">Seul le report sur la 2042 et la DSFU change (5HQ→5IQ, DSCS→DSDS, etc.). La liasse 2035 reste identique.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              control={control}
              name="declarant"
              render={({ field }) => (
                <RadioGroup
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(parseInt(v, 10) as 1 | 2)}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="1" id="declarant-1" />
                    <Label htmlFor="declarant-1" className="text-sm cursor-pointer">Déclarant 1 (toi)</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="2" id="declarant-2" />
                    <Label htmlFor="declarant-2" className="text-sm cursor-pointer">Déclarant 2 (conjoint·e)</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {/* Régime social URSSAF — badge informatif. Pour les installés : PAMC obligatoire.
              Pour les remplaçants : badge auto (RSPM si recettes < 38 k€, PAMC sinon) + bouton de bascule manuelle. */}
          <div className="sm:col-span-3 flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Régime social URSSAF</Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger type="button" aria-label="Aide régime social">
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm text-xs space-y-1.5">
                    <p><strong>PAMC</strong> (Praticien Auxiliaire Médical Conventionné) : régime par défaut. Tu remplis la <strong>DSFU (ex DS-PAMC)</strong>. Obligatoire pour les installés (S1/S2) et collaborateurs.</p>
                    <p><strong>RSPM</strong> (Régime Simplifié des Professions Médicales) : sur option, réservé aux <strong>remplaçants</strong> &lt; 38 000 € de recettes conventionnées. Pas de DSFU : cotisations via <strong>DRI-PAMC</strong> (13,5 % ≤ 19 k€, 21,2 % au-delà) + CARMF RID.</p>
                    <p className="text-muted-foreground pt-1 border-t border-border/40">Bascule en PAMC l'année <strong>suivant</strong> le dépassement (CSS Art. L646-1) — d'où le bouton « Forcer » pour la 1<sup>re</sup> année titulaire restée en RSPM transitoire.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {isRemplacant ? (
              <Controller
                control={control}
                name="regimeSocial"
                render={({ field }) => {
                  const current = field.value ?? 'pamc';
                  const other = current === 'rspm' ? 'pamc' : 'rspm';
                  return (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        current === 'rspm'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {current === 'rspm' ? 'RSPM (DRI simplifiée)' : 'PAMC (DSFU)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => field.onChange(other)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition"
                      >
                        <ArrowLeftRight className="h-3 w-3" />
                        Forcer {other === 'rspm' ? 'RSPM' : 'PAMC'}
                      </button>
                    </div>
                  );
                }}
              />
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-medium">
                PAMC (obligatoire)
              </span>
            )}
          </div>
          {/* V9 — F5 : lien + auto-expand fiches via cross-links Phase 5 */}
          <a
            href={`/guide-declarations#${PROFIL_FICHE_ANCRE[effectiveProfil]}`}
            className="sm:col-span-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            Voir la fiche {PROFIL_FICHE_ANCRE[effectiveProfil]} — {PROFIL_LABELS[effectiveProfil]}
          </a>
        </CardContent>
      </Card>


      {/* PM-005 — Cumul salarié + libéral : rappel compacté en 1 ligne (Phase 3 refonte mai 2026).
          Le détail PH/assistant/attaché + frais réels migré en tooltip. */}
      <Notice tone="info" icon={Info}>
        <span><strong className="font-semibold">Salaire en plus&nbsp;?</strong> Il se déclare en case <strong>1AJ</strong> de la 2042, hors de cette calculette.</span>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ml-1 inline-flex align-middle text-blue-700/70 dark:text-blue-300/70 hover:text-blue-700 dark:hover:text-blue-300" aria-label="Détail cumul salarié">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              Concerne tous les salaires : hospitalier, centre de santé, gardes aux urgences salariées, attaché, PH, assistant, interne CHU… Tes <em>frais réels salariés</em> vs abattement 10&nbsp;% se gèrent séparément.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Notice>

      {/* Audit pré-prod mai 2026 (A3) : Notice "seuil RSPM 38k€ dépassé" supprimée
          ici — doublon avec l'Alert affichée dans CalculetteResults (panel résultats)
          via `rspmWarnings` poussé par useCalculetteResults.ts L70-73. L'Alert
          contextuelle dans le panel résultats est plus pertinente UX. */}

      {/* RSPM : info pédagogique compactée (Phase 3 refonte — le détail DSFU/cases est dans le pill sticky résultats) */}
      {isRspm && !showRspmCeilingWarning && (
        <Notice tone="info" icon={Info}>
          <strong className="font-semibold">Mode RSPM.</strong> Pas de DSFU à remplir. Cotisations URSSAF en direct (DRI-PAMC&nbsp;: 13,5&nbsp;%&nbsp;≤&nbsp;19&nbsp;k€, puis 21,2&nbsp;%) + CARMF&nbsp;RID. Les champs sociaux ci-dessous restent affichés mais ne sont pas envoyés.
        </Notice>
      )}

      {/* B11 — Banner cohérence : dépassements > 0 mais profil ≠ S2 */}
      {showSecteur2Banner && (
        <Notice tone="info" icon={Info}>
          <strong className="font-semibold">Dépassements saisis</strong> — ton profil ({PROFIL_LABELS[profil]}) ne les prévoit pas. Bascule en <em>Installé S2 / OPTAM</em> pour un ratio DSAU correct.
        </Notice>
      )}

      {/* B11 — Banner cohérence : profil S2 mais aucun dépassement. Mutex avec showSecteur2Banner (jamais simultané : DP=0 vs DP>0). */}
      {showS2NoDepassementsBanner && !showSecteur2Banner && (
        <Notice tone="warning" icon={AlertTriangle}>
          <strong className="font-semibold">Profil S2 / OPTAM sans dépassement saisi.</strong> Vérifie que tu as bien des recettes hors convention à déclarer.
        </Notice>
      )}

      {/* U1 + V9-F3 — Banner pédagogique remplaçant pur fusionné réel ↔ micro-BNC (Phase 3 refonte) */}
      {isRemplacant && (
        <Notice tone="success" icon={CheckCircle2}>
          <strong className="font-semibold">Mode remplaçant pur.</strong>{' '}
          {isMicro
            ? <>Reporte tes recettes brutes en <em>5HQ</em>. Pas d'exonération zonée&nbsp;: ZFU-TE et ZFRR sont réservées aux installés et collaborateurs.</>
            : <>Saisis tes rétrocessions perçues dans <em>AA</em>. <em>AF</em> = IJ Madelin et gains hors conventionnel uniquement.</>}
        </Notice>
      )}

      {/* C2 + V9-F8 — Banner pédagogique mixte fusionné réel ↔ micro-BNC (Phase 3 refonte) */}
      {isMixte && (
        <Notice tone="neutral" icon={Users}>
          <strong className="font-semibold">Mode mixte (installé + remplacements).</strong> Cumule dans <em>{isMicro ? '5HQ' : 'AA'}</em> ton CA conventionnel personnel <strong>et</strong> tes rétrocessions perçues.
        </Notice>
      )}



      {/* C3 — Garde-fou plafond Micro-BNC dépassé (tolérance 1 an, CGI Art. 102 ter)
          Phase 14.16 — Header visible + détail des 2 règles repliable par défaut. */}
      {showMicroBncCeilingWarning && (
        <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 overflow-hidden text-xs text-amber-900 dark:text-amber-200">
          {/* Header — toujours visible (titre + chiffre clé) */}
          <div className="px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold leading-tight">Plafond Micro-BNC dépassé</div>
              <div className="text-[11px] text-amber-800/80 dark:text-amber-200/70 mt-0.5 font-mono tabular-nums">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(recettesMicroBnc)}
                {' > '}
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(microBncCeiling)}
                {' '}<span className="font-sans text-amber-700/70 dark:text-amber-300/60">(plafond {annee})</span>
              </div>
            </div>
          </div>
          {/* Détail — replié par défaut */}
          <details className="group border-t border-amber-200/60 dark:border-amber-900/30">
            <summary className="cursor-pointer px-4 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100/40 dark:hover:bg-amber-900/20 inline-flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full">
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              Que se passe-t-il ?
            </summary>
            <div className="px-4 pb-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 px-2.5 py-2">
                  <div className="text-emerald-700 dark:text-emerald-400 text-[10.5px] font-semibold uppercase tracking-wide">Si 1ʳᵉ année</div>
                  <div className="text-[11px] mt-0.5 leading-snug">Le micro-BNC reste applicable — tolérance 1 an.</div>
                </div>
                <div className="rounded-lg bg-white/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 px-2.5 py-2">
                  <div className="text-amber-800 dark:text-amber-300 text-[10.5px] font-semibold uppercase tracking-wide">Si déjà dépassé en {annee - 1}</div>
                  <div className="text-[11px] mt-0.5 leading-snug">Bascule auto au régime réel (2035) au 1ᵉʳ janvier {annee + 1}.</div>
                </div>
              </div>
              <div className="text-[10px] text-amber-700/70 dark:text-amber-300/60 font-mono">CGI Art. 102 ter</div>
            </div>
          </details>
        </div>
      )}

      {isMicro && (
        <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">M</span>
              Recettes Micro-BNC
            </CardTitle>
            <CardDescription>
              Déclare tes recettes brutes en <strong>5HQ</strong> — l'abattement 34 % est appliqué par le fisc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Sous-section 1 — Recettes */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldRow field={{ name: 'recettesMicroBnc', label: 'Recettes brutes encaissées', case: 'Brut total', hint: 'Total des honoraires encaissés sur l\'année (cash-basis), TOUS secteurs confondus. ⚠️ Saisis le BRUT TOTAL même si tu es en zone ZFU/ZFRR : la part exonérée sera dérivée plus bas. Pour S2/OPTAM : inclure les dépassements ici. Plafond Micro-BNC : 77 700 € (2024 et 2025) / 83 600 € (2026+). Les cases 5HQ/5IQ finales (recettes imposables) sont calculées dans la colonne résultats à droite.' }} />
              <FieldRow field={{ name: 'retrocessionsVerseesMicroBnc', label: 'Rétrocessions versées ou redevance de collaboration', case: 'Pré-déduit', hint: 'Titulaire avec remplaçants : rétrocessions versées (L21/BG en réel). Collaborateur libéral : redevance versée au titulaire (L16/BG en réel). Même mécanique en micro-BNC (CGI Art. 102 ter) : pré-déduites AVANT l\'abattement de 34 %, jamais en case séparée. ⚠️ Côté social, la DSCS reste le CA brut total (avant déduction) — voir RO-012.' }} />
            </div>

            {/* Phase 14.1 — Sous-section 2 — PDSA (indépendante de ZFU/ZFRR) */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-foreground">PDSA exonérée — Art. 151 ter</h4>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted/40 rounded px-1.5 py-0.5">Indépendant de ZFU/ZFRR</span>
              </div>
              <FieldRow field={{ name: 'pdsaExonereBrut', label: 'PDSA exonérée — montant BRUT', case: 'PDSA', hint: 'Majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN d\'astreinte en zone déficitaire. Exonérées d\'IR mais soumises aux cotisations sociales. Pré-déduites de 5HQ et reportées en NET (×0,66) en case DSFA de la DSFU. ⚠️ Ne JAMAIS reporter en 5HP (réservée ZFU/ZRR/JEI).' }} />
            </div>

            {/* Phase 14.1 — Sous-section 3 — Exonération zonée ZFU/ZFRR */}
            {!isRemplacant && (
              <div className="border-t border-border/60 pt-5">
                <ZoneExoMicroBlock />
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* === BRANCHE RÉEL === */}
      {!isMicro && (
        <>
          <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold">1</span>
                Issu de ta 2035-B
              </CardTitle>
              <CardDescription>Reporte les cases telles qu'elles apparaissent sur ton imprimé fiscal.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {BLOC_2035.map((f) => <FieldRow key={f.name} field={f} />)}
            </CardContent>
          </Card>

          {showExonerations && (
            <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold">E</span>
                  Exonérations (cadre 5 de la 2035-B)
                </CardTitle>
                <CardDescription>Si aucune ne s'applique, laisse à 0. La plupart des médecins n'en ont aucune.</CardDescription>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                {BLOC_EXOS.map((f) => <FieldRow key={f.name} field={f} />)}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Bloc 2 — Données complémentaires (commun) */}
      <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground text-xs font-semibold">2</span>
            Données complémentaires
          </CardTitle>
          <CardDescription>IJ, dépassements, chèques-vacances, EHPAD/HAD.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {BLOC_EXTRAS
            .filter((f) => {
              // Remplaçant pur : pas de dépassements ni EHPAD/HAD
              if (isRemplacant && (f.name === 'depassements' || f.name === 'ehpadHadSsiadCmpp')) return false;
              // V19 — En micro-BNC, masquer EHPAD (rare en micro). CV reste visible :
              // mécanique RO-005 supportée (× 1,515 sur 5HQ + DSCN = total commandé).
              if (isMicro && f.name === 'ehpadHadSsiadCmpp') return false;
              return true;
            })
            .map((f) => <FieldRow key={f.name} field={f} />)}
          {/* V18 — PDSA exonérée (Art. 151 ter) en régime réel */}
          {!isMicro && (
            <div className="sm:col-span-2">
              <FieldRow field={{ name: 'pdsaExonereBrut', label: 'PDSA exonérée (Art. 151 ter) — montant BRUT', case: 'PDSA', hint: 'Majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN d\'astreinte. Exonérée d\'IR — à déduire via la ligne CI (cadre 7 « Divers à déduire ») de ta 2035. Côté social : la ligne CI figure dans la formule du RBS → réintégration AUTOMATIQUE en DSDE/DSDG. ⚠️ Ne JAMAIS reporter en DSFA (réservée au micro-BNC) ni en 5QB (réservée ZFU/ZRR/JEI).' }} />
            </div>
          )}
          {/* B3 — Checkbox anti-double-déduction CV (réel uniquement, si CV saisis) */}
          {!isMicro && chequesVacances > 0 && (
            <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3">
              <Controller
                control={control}
                name="chequesVacancesDejaInclus"
                render={({ field }) => (
                  <Switch
                    id="cvDejaInclus"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                )}
              />
              <Label htmlFor="cvDejaInclus" className="text-xs leading-snug cursor-pointer">
                <strong className="font-semibold">Mes chèques-vacances sont déjà déduits dans mon résultat BNC (CP).</strong>
                <span className="block text-muted-foreground mt-0.5">
                  Active si tu les as passés en charges dans ta 2035 (case BG ou ligne dédiée). Évite une double déduction en case 5QC/5RC.
                </span>
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bloc 3 — Cadre 8 (réel uniquement, masqué pour remplaçants, replié) */}
      {showCadre8 && (
        <Collapsible>
          <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
            <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 group">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">3</span>
                    Cadre 8 — Réforme LFSS 2024 (millésime 2026)
                  </CardTitle>
                  <CardDescription>Optionnel · concerne les revenus 2025+ avec réintégrations/déductions sociales spécifiques.</CardDescription>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <FieldRow field={{ name: 'cadre8DE', label: 'DE — Réintégrations sociales', case: 'DE', hint: 'Plus-values CT exonérées, intéressement, abondement PEE, brevets…' }} />
                <FieldRow field={{ name: 'cadre8DB', label: 'DB — Déductions sociales', case: 'DB', hint: 'IJ CPAM/CARMF/Madelin déjà comptées en gains divers — pour éviter une double imposition sociale.' }} />
                <SuggererDBButton />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Bloc 4 — Assistance secteur 1 (réel + secteur 1) */}
      {!isMicro && isSecteur1 && <AssistanceSecteur1Card />}
    </div>
  );
}

// Phase 14.10 — Saisie intuitive : zone + année d'installation + recettes brutes en zone.
// Le moteur dérive 5HP (= recettes × 0,66 × taux dégressif, plafonné) et 5HQ (recettes
// brutes restantes — surplus brut réinjecté si plafond saturé).
function ZoneExoMicroBlock() {
  const { control, formState: { errors } } = useFormContext<CalculetteFormValues>();
  const zone = useWatch({ control, name: 'zoneExoneree' }) ?? 'aucune';
  const annee = useWatch({ control, name: 'annee' });
  const anneeInstall = useWatch({ control, name: 'anneeInstallationZone' });
  const moisInstall = useWatch({ control, name: 'moisInstallation' });
  const recettesZone = useWatch({ control, name: 'recettesZoneExo' }) ?? 0;
  // NB collaborateur ZFU/ZFRR : la **redevance** versée au titulaire reste déductible
  // en charge fiscale (5HQ). Saisir ici uniquement la part NETTE de redevance.
  const profil = useWatch({ control, name: 'profil' });

  // Prévisualisation pédagogique du taux appliqué.
  let tauxPreview: { taux: number; anneeDispositif: number } | null = null;
  if (zone !== 'aucune' && anneeInstall && annee >= anneeInstall) {
    const anciennete = annee - anneeInstall + 1;
    let taux = 0;
    if (zone === 'zfu') {
      if (anciennete <= 5) taux = 1.0;
      else if (anciennete === 6) taux = 0.60;
      else if (anciennete === 7) taux = 0.40;
      else if (anciennete === 8) taux = 0.20;
    } else if (zone === 'zfrr') {
      if (anciennete <= 5) taux = 1.0;
      else if (anciennete === 6) taux = 0.75;
      else if (anciennete === 7) taux = 0.50;
      else if (anciennete === 8) taux = 0.25;
    }
    tauxPreview = { taux, anneeDispositif: anciennete };
  }

  // Phase 14.12 — Champ « mois d'installation » visible UNIQUEMENT l'année 1 du dispositif (ZFU).
  const isAnnee1 = !!anneeInstall && anneeInstall === annee;
  const isZfuAnnee1 = isAnnee1 && zone === 'zfu';
  // Prévisualisation du plafond ajusté (mois entiers, BOFiP §80).
  let prorataPreview: { moisActifs: number; plafondAjuste: number } | null = null;
  if (isZfuAnnee1 && moisInstall !== undefined) {
    const m = Math.max(1, Math.min(12, moisInstall));
    const moisActifs = 13 - m;
    prorataPreview = {
      moisActifs,
      plafondAjuste: Math.round((50_000 * moisActifs) / 12),
    };
  }
  const MOIS_FR: { v: number; label: string }[] = [
    { v: 1, label: 'Janvier' }, { v: 2, label: 'Février' }, { v: 3, label: 'Mars' },
    { v: 4, label: 'Avril' }, { v: 5, label: 'Mai' }, { v: 6, label: 'Juin' },
    { v: 7, label: 'Juillet' }, { v: 8, label: 'Août' }, { v: 9, label: 'Septembre' },
    { v: 10, label: 'Octobre' }, { v: 11, label: 'Novembre' }, { v: 12, label: 'Décembre' },
  ];

  return (
    <div className="space-y-3 border-l-2 border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/30 dark:bg-emerald-950/15 pl-4 pr-2 py-3 rounded-r-md">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Exonération zonée — ZFU-TE / ZFRR</h4>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger type="button" aria-label="Aide ZFU/ZFRR">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-700/70 dark:text-emerald-300/70 hover:text-emerald-900 dark:hover:text-emerald-100 transition" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-xs space-y-1.5">
                <p><strong>5HP / 5IP</strong> = recettes en zone × 0,66 × <strong>taux dégressif</strong>, plafonné.</p>
                <p><strong>5HQ / 5IQ</strong> = recettes brutes restantes (le fisc applique le 34 %).</p>
                <p><strong>Plafonds</strong> : 50 000 €/an ZFU-TE · 300 000 €/3 ans glissants ZFRR.</p>
                <p><strong>Dégressivité</strong> ZFU : 5×100 % puis 60/40/20 %. ZFRR : 5×100 % puis 75/50/25 %.</p>
                <p className="text-amber-700 dark:text-amber-300">⚠️ ZFU année 1 : le <strong>plafond</strong> (pas le bénéfice) est proratisé en mois entiers (BOFiP §80) — cf. QT-049.</p>
                <p className="text-muted-foreground">Si le plafond est saturé, le surplus brut équivalent retourne automatiquement en 5HQ.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 rounded px-1.5 py-0.5">Auto · dérivé</span>
      </div>
      <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
        Sélectionne ta zone + ton année d'installation, puis saisis les <strong>recettes brutes</strong> encaissées en zone.
        Hippodoc applique le <strong>taux dégressif</strong> et le <strong>plafond</strong> automatiquement.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Zone d'exonération</Label>
          <Controller
            control={control}
            name="zoneExoneree"
            render={({ field }) => (
              <Select value={field.value ?? 'aucune'} onValueChange={(v) => field.onChange(v as 'aucune' | 'zfu' | 'zfrr')}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aucune">Aucune</SelectItem>
                  <SelectItem value="zfu">🏙️ ZFU-TE (Art. 44 octies A) — clos au 31/12/2025</SelectItem>
                  <SelectItem value="zfrr" disabled={profil === 'remplacant'}>
                    🌾 ZFRR (Art. 44 quindecies){profil === 'remplacant' ? ' — réservé aux installés' : ''}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.zoneExoneree && (
            <p className="text-[11px] text-destructive">{String(errors.zoneExoneree.message)}</p>
          )}
        </div>

        {zone !== 'aucune' && (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Année d'installation en zone</Label>
            <Controller
              control={control}
              name="anneeInstallationZone"
              render={({ field }) => (
                <Input
                  type="number"
                  min={2000}
                  max={2030}
                  step={1}
                  placeholder="Ex : 2022"
                  className="h-9 text-sm"
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? undefined : parseInt(v, 10));
                  }}
                />
              )}
            />
            {errors.anneeInstallationZone && (
              <p className="text-[11px] text-destructive">{String(errors.anneeInstallationZone.message)}</p>
            )}
            {tauxPreview && (
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Année {tauxPreview.anneeDispositif} du dispositif → taux <strong>{Math.round(tauxPreview.taux * 100)} %</strong>
                {tauxPreview.taux === 0 && ' (dispositif terminé)'}
              </p>
            )}
          </div>
        )}

        {/* Phase 14.12 — Mois d'installation : visible UNIQUEMENT en ZFU année 1
            (anneeInstallationZone === annee && zone === 'zfu'). Sert à ajuster le
            PLAFOND annuel (50 000 €) en mois entiers (BOFiP BOI-BIC-CHAMP-80-10-20-20 §80).
            Le bénéfice exonéré lui-même n'est PAS proratisé.
            Optionnel : si non saisi ⇒ janvier ⇒ plafond plein. */}
        {isZfuAnnee1 && (
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm font-medium">Mois d'installation <span className="text-muted-foreground font-normal">(optionnel — année 1)</span></Label>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger type="button" aria-label="Aide mois d'installation">
                    <HelpCircle className="h-3.5 w-3.5 text-emerald-700/70 dark:text-emerald-300/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm text-xs space-y-1.5">
                    <p>L'année 1 du dispositif ZFU, le <strong>plafond annuel</strong> (50 000 €) est ajusté <strong>en mois entiers</strong> (BOFiP BOI-BIC-CHAMP-80-10-20-20 §80) — toute fraction de mois compte pour un mois entier.</p>
                    <p>Exemple : installation en <strong>septembre</strong> ⇒ plafond ajusté = 50 000 × 4/12 ≈ <strong>16 667 €</strong>.</p>
                    <p className="text-amber-700 dark:text-amber-300">⚠️ Le bénéfice exonéré lui-même n'est pas prorata-isé : seul le plafond l'est.</p>
                    <p className="text-muted-foreground">Si non renseigné, la calculette suppose janvier (plafond plein 50 000 €).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              control={control}
              name="moisInstallation"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(v) => field.onChange(v ? parseInt(v, 10) : undefined)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Janvier (plafond plein 50 000 €)" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOIS_FR.map((m) => (
                      <SelectItem key={m.v} value={String(m.v)}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {prorataPreview && (
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Plafond ZFU ajusté : 50 000 € × <strong>{prorataPreview.moisActifs}/12</strong> ≈ <strong>{prorataPreview.plafondAjuste.toLocaleString('fr-FR')} €</strong>. Au-delà : surplus auto-réinjecté en 5HQ.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <FieldRow field={{ name: 'recettesZoneExo', label: 'Recettes brutes réalisées en zone', case: 'Zone exo', hint: 'Part de tes recettes brutes encaissées en zone (collaborateur : déjà NETTES de redevance versée — la redevance reste déductible en 5HQ). La calculette applique : 5HP = recettes × 0,66 × taux dégressif (plafonné à 50 000 €/an ZFU ou 300 000 €/3 ans ZFRR). Si le plafond est saturé, le surplus brut équivalent retourne automatiquement en 5HQ (le fisc applique alors le 34 %).' }} />
      </div>
    </div>
  );
}




function SuggererDBButton() {
  const { control, setValue } = useFormContext<CalculetteFormValues>();
  const ijMadelin = useWatch({ control, name: 'ijMadelin' }) || 0;
  const ijCpam = useWatch({ control, name: 'ijCpam' }) || 0;
  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

  // Doctrine 2026 : DB neutralise toutes les IJ comptées en AF (gains divers).
  // → IJ Madelin (toujours en AF) + IJ CPAM (en AF en réel depuis la suppression de
  //   la tolérance 1AJ — Brochure DGFiP 2026 p. 180).
  const total = ijMadelin + ijCpam;
  if (total <= 0) return null;
  const parts: string[] = [];
  if (ijCpam > 0) parts.push(`IJ CPAM ${fmt(ijCpam)}`);
  if (ijMadelin > 0) parts.push(`IJ Madelin ${fmt(ijMadelin)}`);
  return (
    <div className="sm:col-span-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue('cadre8DB', total, { shouldDirty: true, shouldValidate: true });
          toast.success(`Case DB pré-remplie : ${fmt(total)} (${parts.join(' + ')}).`);
        }}
        className="w-full text-xs border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900/30"
      >
        <Wand2 className="h-3.5 w-3.5 mr-1.5" />
        Suggérer DB = {parts.join(' + ')} ({fmt(total)})
      </Button>
      <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
        Pré-requis : ces IJ doivent être incluses dans tes Gains divers AF. Sinon, laisse DB à 0.
      </p>
    </div>
  );
}

// =============================================================================
// V2 — Assistance secteur 1 (auto-calcul Forfait 2 % / 3 % / Groupe III)
// =============================================================================

interface SousPosteConfig {
  name: keyof CalculetteFormValues['sousPostes'];
  label: string;
  hint: string;
}

const SOUS_POSTES: SousPosteConfig[] = [
  { name: 'DE', label: 'DE — Forfaits MT, ROSP, AN-DPC', hint: 'Forfaits Médecin Traitant, Rémunération sur Objectifs de Santé Publique, indemnités DPC.' },
  { name: 'HN', label: 'HN — Honoraires non conventionnés', hint: 'Activité hors convention (clientèle privée déconventionnée).' },
  { name: 'MSU', label: 'MSU — Maître de Stage Universitaire', hint: 'Indemnités MSU versées par l\'université ou l\'ARS.' },
  { name: 'expertises', label: 'Expertises / Chorus', hint: 'Expertises judiciaires, missions Chorus pour la Justice/État.' },
  { name: 'etudes', label: 'Études et enquêtes en ligne', hint: 'Rémunérations pour études cliniques, enquêtes Carenity, Click&Care, etc.' },
  { name: 'ijMadelinDansAF', label: 'IJ Madelin (déjà dans AF)', hint: 'IJ Madelin hors ALD comptées dans tes Gains divers AF.' },
];

function NestedFieldRow({ name, label, hint }: SousPosteConfig) {
  const { control, formState: { errors } } = useFormContext<CalculetteFormValues>();
  const sousPostesError = (errors.sousPostes as { message?: string } | undefined)?.message;
  // V17 — U1 : buffer string local (parité FieldRow V15-B1) pour conserver la
  // virgule en cours de frappe. Sans ça, "1,5" repassait à "1" après le ",".
  const [buf, setBuf] = React.useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger type="button" aria-label={`Aide pour ${label}`}>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Controller
        control={control}
        name={`sousPostes.${name}` as const}
        render={({ field }) => {
          const v = field.value as number;
          // V13 — P2 : affichage virgule FR.
          const display = buf !== null ? buf : (v === 0 ? '' : String(v).replace('.', ','));
          return (
            <Input
              type="text"
              inputMode="decimal"
              value={display}
              onChange={(e) => {
                const raw = e.target.value;
                const cleaned = raw.replace(/\s/g, '').replace(',', '.');
                // V17 — U1 : même pattern que FieldRow (V16-B1) : rejet silencieux,
                // setBuf APRÈS validation pour ne jamais polluer le buffer.
                if (cleaned === '') {
                  setBuf('');
                  field.onChange(0);
                  return;
                }
                if (cleaned === '-') return; // sous-postes ≥ 0
                const n = parseFloat(cleaned);
                if (Number.isNaN(n) || n < 0) return;
                setBuf(raw);
                field.onChange(n);
              }}
              onBlur={() => { setBuf(null); field.onBlur(); }}
              className="h-10"
              placeholder="0"
            />
          );
        }}
      />
      {name === 'ijMadelinDansAF' && sousPostesError && (
        <p className="text-xs text-destructive">{sousPostesError}</p>
      )}
    </div>
  );
}

function AssistanceSecteur1Card() {
  const { control, setValue, getValues } = useFormContext<CalculetteFormValues>();
  const active = useWatch({ control, name: 'assistanceActive' });
  const AA = useWatch({ control, name: 'AA' }) || 0;
  const AF = useWatch({ control, name: 'AF' }) || 0;
  const choix = useWatch({ control, name: 'choixAssistance' });
  const dgActuel = useWatch({ control, name: 'DG' }) || 0;
  const dhActuel = useWatch({ control, name: 'DH' }) || 0;
  // Audit pré-prod 31/05/2026 R1 — détecte divergence PDSA top-level vs sous-poste nesté.
  const pdsaTopLevel = useWatch({ control, name: 'pdsaExonereBrut' }) || 0;
  const sousPostes = useWatch({ control, name: 'sousPostes' }) || {
    DE: 0, HN: 0, MSU: 0, expertises: 0, etudes: 0, ijMadelinDansAF: 0, pdsaExonere: 0,
  };

  const forfaits = useMemo(
    () => calculerForfaitsSecteur1(AA, AF, sousPostes),
    [AA, AF, sousPostes]
  );
  const sumDansAF = useMemo(() => sommeSousPostesDansAF(sousPostes), [sousPostes]);
  const overflow = sumDansAF > AF + 1;

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);

  // R1 — Divergence : PDSA saisie top-level mais sous-poste à 0 → la base 3 % n'est
  // PAS réduite des majorations PDSA, ce qui sur-évalue le Forfait 3 % (case DG).
  // Seuil 1 € pour tolérer les arrondis.
  const pdsaDivergence =
    pdsaTopLevel > 0 && (sousPostes.pdsaExonere ?? 0) < pdsaTopLevel - 1;
  const handleSyncPdsa = () => {
    setValue('sousPostes.pdsaExonere', pdsaTopLevel, { shouldDirty: true, shouldValidate: true });
    toast.success(`Sous-poste PDSA synchronisé : ${fmt(pdsaTopLevel)}.`);
  };

  // Détecte un écrasement DG/DH manuel selon les cases cochées.
  // Doctrine cumul : DG + DH cumulables depuis revenus 2023 (BOI-BNC-SECT-40).
  const wantDG = choix === 'forfait3' || choix === 'cumul';
  const wantDH = choix === 'groupeIII' || choix === 'cumul';
  const ecraseraDG =
    (wantDG && dgActuel > 0 && Math.abs(dgActuel - forfaits.forfait3pct) > 0.01) ||
    (!wantDG && dgActuel > 0);
  const ecraseraDH =
    (wantDH && dhActuel > 0 && Math.abs(dhActuel - forfaits.groupeIII) > 0.01) ||
    (!wantDH && dhActuel > 0);

  const handleApply = () => {
    const nextDG = wantDG ? forfaits.forfait3pct : 0;
    const nextDH = wantDH ? forfaits.groupeIII : 0;
    setValue('DG', nextDG, { shouldDirty: true, shouldValidate: true });
    setValue('DH', nextDH, { shouldDirty: true, shouldValidate: true });
    if (wantDG && wantDH) {
      toast.success(`Forfait 3 % + Groupe III appliqués : ${fmt(nextDG)} en DG, ${fmt(nextDH)} en DH.`);
    } else if (wantDG) {
      toast.success(`Forfait 3 % appliqué : ${fmt(nextDG)} en case DG.`);
    } else if (wantDH) {
      toast.success(`Groupe III appliqué : ${fmt(nextDH)} en case DH.`);
    } else {
      toast.success('Cases DG et DH remises à 0.');
    }
    trackEvent('calculette_2042_dspamc_forfaits_applied', { choix });
  };

  return (
    <Collapsible>
      <Card className="bg-white dark:bg-card border border-[#e8ecf1] dark:border-border/60 rounded-xl shadow-sm shadow-slate-100/50 dark:shadow-none">
        <CollapsibleTrigger className="w-full text-left">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 group">
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  <Wand2 className="h-3.5 w-3.5" />
                </span>
                Assistance secteur 1 — auto-calcul Forfaits 2 %, 3 % et Groupe III
              </CardTitle>
              <CardDescription>
                Optionnel · réservé aux médecins conventionnés <strong>secteur 1</strong>. Décompose tes Gains divers AF pour calculer automatiquement les forfaits déductibles.
              </CardDescription>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-5">
            {/* Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
              <Label htmlFor="assistanceActive" className="text-sm font-medium cursor-pointer">
                Activer le mode assistance
              </Label>
              <Controller
                control={control}
                name="assistanceActive"
                render={({ field }) => (
                  <Switch
                    id="assistanceActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {active && (
              <>
                <Notice tone="info" icon={AlertTriangle}>
                  <strong className="font-semibold">Réservé secteur 1 conventionné.</strong> Le Forfait 3 % (DG) et le Groupe III (DH) sont <strong>cumulables</strong> depuis l'imposition des revenus 2023 (BOI-BNC-SECT-40 ; UNASA Guide 2035-2026 §391). Coche les forfaits que tu veux appliquer.
                </Notice>

                {/* Sous-postes */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">
                    Décomposition des Gains divers (AF) — somme : {fmt(sumDansAF)} / {fmt(AF)}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {SOUS_POSTES.map((sp) => <NestedFieldRow key={sp.name} {...sp} />)}
                  </div>
                  {overflow && (
                    <p className="text-xs text-destructive mt-2 inline-flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      La somme dépasse ton AF de {fmt(sumDansAF - AF)}. Ajuste avant d'appliquer.
                    </p>
                  )}
                </div>

                {/* PDSA hors AF */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">
                    Hors Gains divers
                  </p>
                  <NestedFieldRow
                    name="pdsaExonere"
                    label="PDSA exonéré (Art. 151 ter)"
                    hint="Majorations / forfaits PDSA exonérés d'IR — sortis du BNC, à exclure aussi de la base 3 %."
                  />
                </div>

                {/* Résultats live */}
                <div className="rounded-lg border border-border/60 bg-muted/40 p-4 space-y-1.5 text-sm font-mono tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forfait 2 % (case DF) — 2 % × (AA + AF) <span className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 ml-1">informatif</span></span>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">{fmt(forfaits.forfait2pct)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Base 3 % = AA − sous-postes (AF exclu)</span>
                    <span>{fmt(forfaits.base3pct)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forfait 3 % (case DG) — 3 % × base</span>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">{fmt(forfaits.forfait3pct)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Groupe III (case DH) — fixe</span>
                    <span className="font-semibold text-violet-700 dark:text-violet-300">{fmt(forfaits.groupeIII)}</span>
                  </div>
                </div>

                {/* Choix — persisté via RHF. Doctrine cumul DG + DH (revenus 2023, BOI-BNC-SECT-40). */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Forfaits à appliquer aux cases DG / DH</Label>
                  <Controller
                    control={control}
                    name="choixAssistance"
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                          <RadioGroupItem value="aucun" id="choix-aucun" />
                          <Label htmlFor="choix-aucun" className="text-sm cursor-pointer flex-1">Aucun (DG = 0, DH = 0)</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                          <RadioGroupItem value="forfait3" id="choix-f3" />
                          <Label htmlFor="choix-f3" className="text-sm cursor-pointer flex-1">
                            Forfait 3 % seul (DG = {fmt(forfaits.forfait3pct)}, DH = 0)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
                          <RadioGroupItem value="groupeIII" id="choix-g3" />
                          <Label htmlFor="choix-g3" className="text-sm cursor-pointer flex-1">
                            Groupe III seul (DH = {fmt(forfaits.groupeIII)}, DG = 0)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-950/30 px-3 py-2.5">
                          <RadioGroupItem value="cumul" id="choix-cumul" />
                          <Label htmlFor="choix-cumul" className="text-sm cursor-pointer flex-1">
                            <strong>Cumul</strong> 3 % + Groupe III (DG = {fmt(forfaits.forfait3pct)}, DH = {fmt(forfaits.groupeIII)}) — recommandé S1
                          </Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {(ecraseraDG || ecraseraDH) && (
                    <Notice tone="warning" icon={AlertTriangle}>
                      <strong className="font-semibold">Appliquer écrasera tes saisies manuelles :</strong>
                      {ecraseraDG && <span className="block">· DG : {fmt(dgActuel)} → {fmt(wantDG ? forfaits.forfait3pct : 0)}</span>}
                      {ecraseraDH && <span className="block">· DH : {fmt(dhActuel)} → {fmt(wantDH ? forfaits.groupeIII : 0)}</span>}
                    </Notice>
                  )}
                  {/* Audit pré-prod 31/05/2026 R1 — divergence PDSA top-level vs sous-poste nesté.
                      Sans sync, la base 3 % n'est PAS réduite des majorations PDSA → DG sur-évalué. */}
                  {pdsaDivergence && (
                    <Notice tone="warning" icon={AlertTriangle}>
                      <div className="space-y-2">
                        <p>
                          <strong className="font-semibold">PDSA exonérée non répercutée dans la base 3 %.</strong>{' '}
                          Tu as saisi {fmt(pdsaTopLevel)} de PDSA en haut du formulaire, mais le sous-poste « PDSA exonéré » ci-dessus est à 0 — ton Forfait 3 % (case DG) sera <strong>sur-évalué</strong>.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSyncPdsa}
                          className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-200 dark:border-amber-800 dark:hover:bg-amber-900/30"
                        >
                          <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                          Synchroniser : sous-poste PDSA = {fmt(pdsaTopLevel)}
                        </Button>
                      </div>
                    </Notice>
                  )}
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleApply}
                    disabled={overflow}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                    Appliquer aux cases DG / DH
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
