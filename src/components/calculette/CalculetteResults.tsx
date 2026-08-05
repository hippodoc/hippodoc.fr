import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Check, AlertTriangle, AlertCircle, FileText, Eye, EyeOff, ClipboardCopy, Printer, ChevronRight, Circle, Wallet, Shield, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { trackEvent } from '@/lib/analytics';
import { getDeclarationParams } from '@/lib/taxParams/declarationParams';
import { APP_URL } from '@/lib/site';
import type { CalculetteResults } from './useCalculetteResults';
import type { ProfilCalculette } from './calculetteSchema';
import { PROFIL_LABELS, resolveEffectiveProfil } from './calculetteSchema';
import { IrEstimateCard } from './IrEstimateCard';
import { getCode, type Declarant } from '@/lib/declarantMapping';

const fmt = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

const fmtRatio = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n);

interface CaseRowProps {
  code: string;
  label: string;
  value: number;
  hint: string;
  isRatio?: boolean;
  highlight?: boolean;
  badge?: string;
}

function CaseRow({ code, label, value, hint, isRatio, highlight, badge }: CaseRowProps) {
  const [copied, setCopied] = useState(false);
  const display = isRatio ? fmtRatio(value) : fmt(value);
  const raw = isRatio ? value.toFixed(4).replace('.', ',') : String(value).replace('.', ',');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      trackEvent('calculette_2042_dspamc_case_copied', { code });
      setTimeout(() => setCopied(false), 1500);
    } catch {/* silencieux */}
  };

  return (
    <div className={`flex items-center justify-between gap-3 py-2 px-3 rounded-md transition ${highlight ? 'bg-hippo-50 dark:bg-hippo-950/30 ring-1 ring-hippo-200 dark:ring-hippo-800' : 'hover:bg-muted/40'}`}>
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-hippo-100 dark:bg-hippo-900/50 text-hippo-700 dark:text-hippo-300 text-[10px] font-mono font-bold shrink-0">
          {code}
        </span>
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-foreground truncate cursor-help">{label}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{hint}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {badge && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono font-semibold text-sm tabular-nums">{display}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCopy}
          aria-label={`Copier ${code}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

// ── Helper : carte résultat pliable avec hero condensé toujours visible ──
interface ResultCardCollapsibleProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant: 'fiscal' | 'fiscal-micro' | 'social';
  icon: React.ReactNode;
  title: string;
  tagLabel: string;
  heroLabel: string;
  heroValue: string;
  heroValueClass?: string;
  heroBadge?: React.ReactNode;
  children: React.ReactNode;
}

function ResultCardCollapsible({
  open, onOpenChange, variant, icon, title, tagLabel,
  heroLabel, heroValue, heroValueClass, heroBadge, children,
}: ResultCardCollapsibleProps) {
  const styles = {
    fiscal: {
      strip: 'bg-hippo-500',
      border: 'border-hippo-200/70 dark:border-hippo-800/50 bg-white dark:bg-slate-900/60',
      tag: 'text-hippo-700 dark:text-hippo-300 bg-hippo-50 dark:bg-hippo-950/50',
      iconWrap: 'bg-hippo-50 dark:bg-hippo-950/50',
      title: 'text-hippo-900 dark:text-hippo-200',
      heroLabel: 'text-hippo-700 dark:text-hippo-300',
    },
    'fiscal-micro': {
      strip: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-slate-900/60',
      tag: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50',
      iconWrap: 'bg-emerald-50 dark:bg-emerald-950/50',
      title: 'text-emerald-900 dark:text-emerald-200',
      heroLabel: 'text-emerald-700 dark:text-emerald-300',
    },
    social: {
      strip: 'bg-slate-400',
      border: 'border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md print:bg-white print:backdrop-blur-none',
      tag: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 italic',
      iconWrap: 'bg-slate-100 dark:bg-slate-800/60',
      title: 'text-slate-900 dark:text-slate-200',
      heroLabel: 'text-slate-600 dark:text-slate-400',
    },
  }[variant];

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className={`relative overflow-hidden rounded-2xl border shadow-sm print:shadow-none ${styles.border}`}>
        <div className={`absolute top-0 left-0 w-full h-1 ${styles.strip}`} />
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full text-left p-4 md:p-5 hover:bg-muted/30 transition-colors group"
            aria-expanded={open}
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg ${styles.iconWrap}`}>{icon}</div>
                <h3 className={`text-sm font-semibold ${styles.title}`}>{title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded ${styles.tag}`}>
                  {tagLabel}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className={`text-xs font-medium ${styles.heroLabel}`}>{heroLabel}</p>
              <div className="flex items-center gap-3">
                <div className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums ${heroValueClass ?? ''}`}>
                  {heroValue}
                </div>
                {heroBadge}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 md:px-5 pb-5 md:pb-6 space-y-4 border-t border-border/40 pt-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}




interface CalculetteResultsViewProps {
  results: CalculetteResults;
  annee: number;
  chequesVacancesSaisis: number;
  profil: ProfilCalculette;
  /** Refonte mai 2026 — `true` si l'utilisateur a coché « dépassements autorisés » sous S1.
   *  Permet d'afficher un libellé clair "S1 + dépassements" plutôt que juste "S1". */
  depassementsAutorises?: boolean;
  showZeros: boolean;
  onShowZerosChange: (v: boolean) => void;
  /** B8 — Valeur CP saisie, pour l'encart pédagogique « RBS ne se calcule pas depuis CP seul ». */
  cpValue?: number;
  /** U2 — Saisies minimales attendues côté formulaire pour activer la checklist */
  minimalChecklist?: { ok: boolean; label: string }[];
  /** V22 — Déclarant 1 (défaut) ou 2 : renomme l'affichage des codes (5HQ→5IQ, DSCS→DSDS…). N'impacte aucun calcul. */
  declarant?: Declarant;
  /** Audit pré-prod mai 2026 v2 — Mode connecté (utilisateur déjà logué dans Hippodoc).
   *  Adapte le footer pour éviter la phrase « Utilisateur Hippodoc ? » qui sonne faux
   *  quand on est déjà dans l'app. */
  connectedMode?: boolean;
}

/**
 * Phase 14.14 — Carte premium structurée pour le warning ZFU/ZFRR consolidé.
 *
 * Remplace le wall-of-text par un mini-calcul scannable qui rend visible d'où
 * sortent les chiffres (plafond ajusté, surplus, équivalent brut), avec lien
 * visuel direct sur les badges 5HP/5HQ affichés à droite dans la colonne
 * résultats.
 *
 * Le moteur (`useCalculetteResults.ts`) continue de pousser le même string
 * `resume\n---\ndoctrine` — on parse le résumé côté UI uniquement (regex
 * défensif avec fallback), zéro impact sur les tests scellés (mots-clés
 * `Plafond ZFU|ZFRR`, `saturé`, `prorat`, `mois entiers`, `44 octies A`, etc.
 * restent dans le payload moteur).
 *
 * Responsive : sur mobile (<640 px), chaque ligne se stacke en 2 rows
 * (label/badge en haut, calcul/valeur en bas) — aucun chiffre jamais tronqué.
 *
 * Le markdown léger `**texte**` du doctrine est rendu en `<strong>`.
 */
const MOIS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** Parse les chiffres du résumé ZFU/ZFRR pour rendre une carte structurée. */
function parseZfuResume(resume: string): {
  zoneLabel: 'ZFU-TE' | 'ZFRR';
  plafondAffiche: string | null;
  tauxPct: string | null;
  isAnnee1: boolean;
  moisActifs: string | null;
  moisInstallation: number | null;
  anneeDispo: string | null;
  isSature: boolean;
  surplusBenefice: string | null;
  surplusBrut: string | null;
} {
  const zoneLabel: 'ZFU-TE' | 'ZFRR' = resume.includes('ZFRR') ? 'ZFRR' : 'ZFU-TE';
  const isSature = /Plafond saturé/i.test(resume);
  const isAnnee1 = /année 1 ajusté/i.test(resume);

  // « = 45 833 € » (cas année 1 prorata) OU « : 50 000 € » (cas années 2+/ZFRR)
  const plafondMatch =
    resume.match(/=\s*([\d\s]+?)\s*€/) ?? resume.match(/Plafond [^:]+:\s*([\d\s]+?)\s*€/);
  const tauxMatch = resume.match(/[Tt]aux\s+(\d+)\s*%/);
  const moisMatch = resume.match(/×\s*(\d+)\/12/);
  const installMatch = resume.match(/installation mois\s+(\d+)/i);
  const anneeMatch = resume.match(/année\s+(\d+)\s+du dispositif/i);
  const surplusBenefMatch = resume.match(/surplus de\s+([\d\s]+?)\s*€\s+de bénéfice/i);
  const surplusBrutMatch = resume.match(/≈\s+([\d\s]+?)\s*€\s+de recettes brutes/i);

  return {
    zoneLabel,
    plafondAffiche: plafondMatch?.[1].trim() ?? null,
    tauxPct: tauxMatch?.[1] ?? null,
    isAnnee1,
    moisActifs: moisMatch?.[1] ?? null,
    moisInstallation: installMatch ? parseInt(installMatch[1], 10) : null,
    anneeDispo: anneeMatch?.[1] ?? (isAnnee1 ? '1' : null),
    isSature,
    surplusBenefice: surplusBenefMatch?.[1].trim() ?? null,
    surplusBrut: surplusBrutMatch?.[1].trim() ?? null,
  };
}

/** Mini-chip de case (exo=vert / imposable=bleu / danger=rose neutre).
 *  Audit pré-prod juin 2026 — F1 : ajout du ton `danger` pour les cases citées
 *  dans un bloc « À éviter » (sinon un badge vert dans un encadré rose crée
 *  un contresens visuel "OK mais pas OK"). */
function CaseBadge({ code, tone }: { code: string; tone: 'exo' | 'imposable' | 'danger' }) {
  const cls =
    tone === 'exo'
      ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
      : tone === 'danger'
        ? 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 line-through decoration-rose-500/60'
        : 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded ${cls} text-[9.5px] font-mono font-medium shrink-0`}>
      {code}
    </span>
  );
}

/**
 * Ligne du mini-calcul. Responsive :
 * - Mobile (<sm) : 2 rows — (label · badge) puis (calcul · valeur ml-auto)
 * - Desktop (≥sm) : 1 row — label / calcul flex-1 truncate / valeur / badge
 */
function ZfuCalcRow({
  label,
  calc,
  value,
  badge,
}: {
  label: React.ReactNode;
  calc: React.ReactNode;
  value: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2 text-[11.5px]">
      {/* Row 1 mobile (label + badge) / col 1 desktop (label) */}
      <div className="flex items-center gap-2 sm:gap-0 sm:w-[120px] sm:shrink-0">
        <span className="text-amber-900/80 dark:text-amber-200/80">{label}</span>
        {badge && <span className="sm:hidden ml-auto">{badge}</span>}
      </div>
      {/* Row 2 mobile (calc + valeur) / cols 2-4 desktop */}
      <div className="flex items-baseline gap-2 sm:flex-1 sm:gap-2 min-w-0">
        <span className="text-amber-700/70 dark:text-amber-300/60 font-mono text-[10.5px] sm:flex-1 sm:truncate">
          {calc}
        </span>
        <span className="font-semibold text-amber-900 dark:text-amber-100 tabular-nums ml-auto sm:ml-0">
          {value} €
        </span>
        {badge && <span className="hidden sm:inline-flex">{badge}</span>}
      </div>
    </div>
  );
}

function ZfuInfoAlert({ resume, doctrine, annee }: { resume: string; doctrine: string; annee: number }) {
  const renderBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{p}</React.Fragment>
    );
  };

  const parsed = parseZfuResume(resume);
  const { zoneLabel, plafondAffiche, tauxPct, isAnnee1, moisActifs, moisInstallation, anneeDispo, isSature, surplusBenefice, surplusBrut } = parsed;

  // Fallback : si le parsing échoue (format inattendu), on garde l'ancien rendu plain-text.
  // Garde-fou défensif — ne devrait jamais arriver vu que le moteur pousse un format fixe.
  if (!plafondAffiche || !tauxPct) {
    return (
      <Alert className="mb-3 border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs leading-relaxed">
          <div>{renderBold(resume)}</div>
          <details className="group mt-2">
            <summary className="cursor-pointer text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 text-[11px] font-medium inline-flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">
              <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
              Voir le cadre légal
            </summary>
            <div className="mt-2 pl-4 border-l-2 border-amber-300/60 dark:border-amber-700/40 text-amber-900/80 dark:text-amber-100/80 text-[11px]">
              {renderBold(doctrine)}
            </div>
          </details>
        </AlertDescription>
      </Alert>
    );
  }

  const headerTitle = isSature
    ? `Plafond ${zoneLabel} dépassé — surplus basculé en 5HQ`
    : `Plafond ${zoneLabel} appliqué`;

  // Phrase humanisée — privilégie « installé en {mois} {année} → N mois éligibles »
  // au lieu de l'expression brute « × 11/12 ». Mois extrait du résumé moteur.
  const moisNom = moisInstallation && moisInstallation >= 1 && moisInstallation <= 12
    ? MOIS_FR[moisInstallation - 1]
    : null;
  const headerLine: React.ReactNode = isAnnee1 && moisActifs && moisNom
    ? (
        <>
          Installation en <strong className="font-semibold">{moisNom} {annee}</strong>
          {' '}→ <strong className="font-semibold">{moisActifs} mois éligibles</strong> ·
          {' '}plafond ramené à <strong className="font-semibold">{plafondAffiche} €</strong>.
        </>
      )
    : isAnnee1
      ? <>Année 1 du dispositif · prorata en mois entiers (BOFiP §80) · plafond <strong className="font-semibold">{plafondAffiche} €</strong>.</>
      : anneeDispo
        ? <>Année {anneeDispo} du dispositif · plafond <strong className="font-semibold">{plafondAffiche} €</strong> (taux {tauxPct} %).</>
        : <>Plafond <strong className="font-semibold">{plafondAffiche} €</strong>.</>;

  return (
    <div
      className="mb-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/80 to-amber-50/40 dark:from-amber-950/30 dark:to-amber-950/10 overflow-hidden"
      role="status"
    >
      {/* Header — titre + phrase humanisée + redirection vers les cases du dessous */}
      <div className="px-3 sm:px-3.5 py-3 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="text-xs font-semibold text-amber-900 dark:text-amber-100 leading-tight">
            {headerTitle}
          </div>
          <div className="text-[11px] text-amber-800/85 dark:text-amber-200/80 leading-snug">
            {headerLine}
          </div>
          {isSature ? (
            <div className="text-[11px] text-amber-800/85 dark:text-amber-200/80 leading-snug">
              Le surplus passe automatiquement en case <CaseBadge code="5HQ" tone="imposable" /> ci-dessous.
            </div>
          ) : (
            <div className="text-[11px] text-amber-800/80 dark:text-amber-200/70 leading-snug">
              Tu es sous le plafond — l'intégralité du bénéfice en zone est exonérée.
            </div>
          )}
        </div>
      </div>

      {/* Détail du calcul — replié par défaut (uniquement si saturé : sinon rien à détailler) */}
      {isSature && surplusBenefice && surplusBrut && (
        <details className="group border-t border-amber-200/60 dark:border-amber-900/30">
          <summary className="cursor-pointer px-3 sm:px-3.5 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100/40 dark:hover:bg-amber-900/20 inline-flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full">
            <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
            Voir le détail du calcul
          </summary>
          <div className="px-3 sm:px-3.5 pb-3 space-y-2 sm:space-y-1.5">
            <ZfuCalcRow
              label="Plafond exonéré"
              calc={
                isAnnee1 && moisActifs
                  ? <>50 000 € × {moisActifs}/12</>
                  : <>{zoneLabel === 'ZFRR' ? '300 000 € · 3 ans glissants' : `Palier ${tauxPct} %`}</>
              }
              value={plafondAffiche}
              badge={<CaseBadge code="5HP" tone="exo" />}
            />
            <div className="pt-1.5 border-t border-amber-200/40 dark:border-amber-900/20">
              <ZfuCalcRow
                label="Surplus de bénéfice"
                calc="au-dessus du plafond"
                value={surplusBenefice}
              />
            </div>
            <ZfuCalcRow
              label="→ Réinjecté en 5HQ"
              calc="équivalent brut (÷ 0,66)"
              value={surplusBrut}
              badge={<CaseBadge code="5HQ" tone="imposable" />}
            />
            <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70 pt-2 leading-snug">
              Le fisc appliquera l'abattement 34 % sur les <strong className="font-semibold">{surplusBrut} €</strong> repassés en 5HQ — c'est déjà géré automatiquement ci-dessous.
            </p>
          </div>
        </details>
      )}

      {/* Footer — cadre légal repliable */}
      <details className="group border-t border-amber-200/60 dark:border-amber-900/30">
        <summary className="cursor-pointer px-3 sm:px-3.5 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100/40 dark:hover:bg-amber-900/20 inline-flex items-center gap-1 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full">
          <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
          Voir le cadre légal
        </summary>
        <div className="px-3 sm:px-3.5 pb-3 pl-8 sm:pl-9 text-[11px] text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
          {renderBold(doctrine)}
        </div>
      </details>
    </div>
  );
}


export function CalculetteResultsView({
  results,
  annee,
  chequesVacancesSaisis,
  profil,
  depassementsAutorises = false,
  showZeros,
  onShowZerosChange,
  cpValue = 0,
  minimalChecklist,
  declarant = 1,
  connectedMode = false,
}: CalculetteResultsViewProps) {

  const { dsPamc, cases2042, hasInputs, isMicroBnc, pdsaSocial, regimeSocial, rspmWarnings } = results;
  const { decomposition, rbs } = dsPamc.rbs;
  const [copiedAll, setCopiedAll] = useState(false);
  const [openFiscal, setOpenFiscal] = useState(false);
  const [openSocial, setOpenSocial] = useState(false);
  const [printForceOpen, setPrintForceOpen] = useState(false);
  const hasPdsa = pdsaSocial && pdsaSocial.brut > 0;
  const isRspm = regimeSocial === 'rspm';
  // Refonte mai 2026 — Libellé profil cohérent avec ce que le moteur calcule.
  // Si l'utilisateur est S1 + DP coché → on affiche "S1 + dépassements (mixte)".
  const effectiveProfil = resolveEffectiveProfil(profil, depassementsAutorises);
  const profilDisplayLabel = PROFIL_LABELS[effectiveProfil];

  // Helper local : applique le mapping D1/D2 sur un code (V22)
  const c = (code: string) => getCode(code, declarant);

  // Phase 14.16 — Métadonnée ZFU dérivée du warning consolidé moteur (resume\n---\ndoctrine).
  // Permet d'enrichir les badges des cases 5HP/5HQ ci-dessous avec le "pourquoi"
  // (mois éligibles, surplus) sans dupliquer les chiffres dans l'encart amber.
  const zfuMeta = useMemo(() => {
    const consolidated = dsPamc.warnings.find((w) => w.includes('\n---\n'));
    if (!consolidated) return null;
    const resume = consolidated.slice(0, consolidated.indexOf('\n---\n'));
    return parseZfuResume(resume);
  }, [dsPamc.warnings]);

  // U3 — Construit le bloc texte "tout copier" mémoïsé
  const allCasesText = useMemo(() => {
    const declarantSuffix = declarant === 2 ? ' (déclarant 2)' : '';
    const lines: string[] = [
      `# Calculette Hippodoc — Revenus ${annee}${declarantSuffix}`,
      `# Profil: ${profilDisplayLabel} · Régime: ${isMicroBnc ? 'Micro-BNC' : 'Réel'}`,
      '',
      '## 2042-C PRO',
      `${isMicroBnc ? getCode('5HQ', declarant) : getCode('5QC', declarant)}=${cases2042.case_5QC_5RC}`,
    ];
    // Phase 14.8 B2 — 5HP/5IP émis si zone ZFU/ZFRR détectée (sinon perdu au copy-all).
    if (isMicroBnc && (cases2042.case_5HP_5IP ?? 0) > 0) {
      lines.push(`${getCode('5HP', declarant)}=${cases2042.case_5HP_5IP}  # Bénéfice net exonéré ZFU-TE / ZFRR (recettes zone × 0,66)`);
    }
    if (cases2042.case_1AZ > 0) {
      lines.push(`${getCode('1AZ', declarant)}=${cases2042.case_1AZ}  # IJ CARMF invalidité permanente`);
    }
    lines.push(
      `${getCode('1AS', declarant)}=${cases2042.case_1AS}`,
      `${getCode('1AJ', declarant)}=${cases2042.case_1AJ}`,
    );
    if (isRspm) {
      lines.push(
        '',
        '# Régime social : RSPM — pas de DSFU à remplir.',
        '# Cotisations URSSAF via DRI-PAMC (13,5 % ≤ 19 000 €, 21,2 % au-delà) + CARMF RID.',
      );
    } else {
      lines.push(
        '',
        '## DSFU (ex DS-PAMC)',
        `${getCode('DSCS', declarant)}=${dsPamc.DSCS}`,
        `${getCode('DSAV', declarant)}=${dsPamc.DSAV}`,
        `${getCode('DSAW', declarant)}=${dsPamc.DSAW}`,
        `${getCode('DSAU', declarant)}=${dsPamc.DSAU.toFixed(4).replace('.', ',')}`,
        `${getCode('DSAT', declarant)}=${dsPamc.DSAT}`,
        `${getCode('DSDE', declarant)}=${dsPamc.DSDE}`,
        `${getCode('DSDG', declarant)}=${dsPamc.DSDG}`,
        `${getCode('DSDX', declarant)}=${dsPamc.DSDX}`,
        `${getCode('DSCZ', declarant)}=${dsPamc.DSCZ}`,
        `${getCode('DSCN', declarant)}=${dsPamc.DSCN}`,
      );
      if (hasPdsa && isMicroBnc) {
        lines.push(`${getCode('DSFA', declarant)}=${pdsaSocial.dsfa}  # PDSA exonérée Art. 151 ter (brut × 0,66)`);
      }
    }
    return lines.join('\n');
  }, [annee, profil, isMicroBnc, cases2042, dsPamc, hasPdsa, pdsaSocial, declarant, isRspm]);

  if (!hasInputs) {
    return (
      <div className="py-6 px-2 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-hippo-100 to-hippo-50 dark:from-hippo-900/40 dark:to-hippo-950/30 ring-1 ring-hippo-200/60 dark:ring-hippo-800/40">
          <FileText className="h-6 w-6 text-hippo-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Tes cases pré-remplies apparaîtront ici
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Commence par saisir tes cases 2035 à gauche.
        </p>
        {minimalChecklist && minimalChecklist.length > 0 && (
          <ul className="text-left max-w-xs mx-auto space-y-1.5">
            {minimalChecklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                {item.ok ? (
                  <Check className="h-3.5 w-3.5 text-hippo-500 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Helper : décide si une ligne doit être affichée
  const visible = (val: number, alwaysShow = false) => alwaysShow || showZeros || val !== 0;

  const plafondCv = getDeclarationParams(annee).plafondChequesVacances;
  const plafondCvSocial = getDeclarationParams(annee).plafondSocialChequesVacances;
  const cvCape = chequesVacancesSaisis > plafondCv;
  const cvBadge = cvCape ? `Excédent fiscal > ${fmt(plafondCv)}` : undefined;

  // Encart pédagogique RBS si l'utilisateur a saisi UNIQUEMENT CP (cas réel)
  // B8 — n'affiche l'encart « RBS ne se calcule pas depuis CP seul » que si CP est réellement saisi.
  const onlyCpFilled = !isMicroBnc && cpValue !== 0 && rbs === 0 &&
    decomposition.excedent === 0 && decomposition.chargesSociales === 0;

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(allCasesText);
      setCopiedAll(true);
      trackEvent('calculette_2042_dspamc_copy_all');
      setTimeout(() => setCopiedAll(false), 1800);
    } catch { /* silencieux */ }
  };

  const handlePrint = () => {
    trackEvent('calculette_2042_dspamc_print');
    setPrintForceOpen(true);
    // Laisse React commiter l'ouverture avant d'ouvrir la boîte de dialogue d'impression
    setTimeout(() => {
      window.print();
      setPrintForceOpen(false);
    }, 120);
  };

  return (
    <div className="space-y-4 min-w-0">
      {/* P2 — Badge régime + profil sticky (pills éditoriales) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider ${isMicroBnc ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-hippo-50 text-hippo-700 dark:bg-hippo-900/30 dark:text-hippo-300'}`}>
            {isMicroBnc ? 'Micro-BNC' : 'Réel'}
          </span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
            {profilDisplayLabel}
          </span>
          {isRspm ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 cursor-help">
                    RSPM · sans DSFU
                    <Info className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs">
                  Cotisations URSSAF en direct (DRI-PAMC : <strong>13,5&nbsp;%</strong> ≤ 19&nbsp;000&nbsp;€, puis <strong>21,2&nbsp;%</strong>) + CARMF&nbsp;RID. Pas de DSFU à remplir.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground">
            Revenus {annee}
          </span>
        </div>
      </div>

      {/* U2 — Checklist saisies minimales */}
      {minimalChecklist && minimalChecklist.length > 0 && minimalChecklist.some(c => !c.ok) && (
        <Card className="border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="py-3 px-4 text-xs space-y-1">
            <p className="font-semibold text-blue-900 dark:text-blue-200 mb-1.5">Saisies minimales pour un résultat fiable :</p>
            {minimalChecklist.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-blue-900/80 dark:text-blue-200/80">
                {c.ok
                  ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  : <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />}
                <span>{c.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Erreurs bloquantes (a11y V11 — U1 : aria-live assertive) */}
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {dsPamc.errors.map((err, i) => (
          <Alert key={`err-${i}`} variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription className="text-xs">{err}</AlertDescription>
          </Alert>
        ))}
      </div>

      {/* RSPM — bannière éducative consolidée dans le pill « RSPM · sans DSFU » (badge sticky)
          + Notice compacte côté formulaire. Pas de doublon ici (Phase 2 refonte mai 2026). */}


      {/* RSPM — warnings dédiés (champs sociaux saisis mais ignorés, dépassement 38 k€…) */}
      {isRspm && rspmWarnings.length > 0 && (
        <div role="status" aria-live="polite" aria-atomic="false">
          {rspmWarnings.map((w, i) => (
            <Alert key={`rspm-warn-${i}`} className="mb-3 border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs">{w}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* V18 — Alerte PDSA exonérée : ne JAMAIS reporter en 5HP/5QB
          Phase 14.14 — Refonte premium : règle "À éviter" puis "Bon mapping" avec chips. */}
      {hasPdsa && !isRspm && (
        <div className="mb-3 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 overflow-hidden">
          {/* Header */}
          <div className="px-3 sm:px-3.5 py-2.5 flex items-start gap-2.5 border-b border-amber-200/60 dark:border-amber-900/30">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-100 leading-tight">PDSA exonérée détectée</div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-0.5">
                Art. 151 ter CGI — déjà géré automatiquement ci-dessous
              </div>
            </div>
          </div>
          {/* Corps : 2 blocs (À éviter / Bon mapping) */}
          <div className="px-3 sm:px-3.5 py-3 space-y-2.5 text-xs">
            {/* À éviter */}
            <div className="rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 px-2.5 py-2">
              <div className="text-rose-700 dark:text-rose-400 text-[10.5px] font-semibold uppercase tracking-wide mb-1">À éviter</div>
              <div className="text-rose-900/90 dark:text-rose-200/90 leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-1">
                Ne jamais reporter en
                <CaseBadge code={isMicroBnc ? '5HP' : '5QB'} tone="danger" />
                <span className="text-rose-700/80 dark:text-rose-300/70 text-[11px]">(réservée ZFU/ZRR/JEI — double-comptage URSSAF sinon)</span>
              </div>
            </div>
            {/* Bon mapping */}
            <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 px-2.5 py-2">
              <div className="text-emerald-700 dark:text-emerald-400 text-[10.5px] font-semibold uppercase tracking-wide mb-1">Bon mapping</div>
              <div className="text-emerald-900/90 dark:text-emerald-200/90 leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-1">
                {isMicroBnc ? (
                  <>
                    Brut PDSA réduit de
                    <CaseBadge code="5HQ" tone="imposable" />
                    + ajouté à
                    <CaseBadge code="DSFA" tone="exo" />
                    <span className="text-emerald-700/80 dark:text-emerald-300/70 text-[11px]">(brut × 0,66 sur la DSFU)</span>
                  </>
                ) : (
                  <>
                    Déduit en
                    <CaseBadge code="CI" tone="exo" />
                    <span className="text-emerald-800/90 dark:text-emerald-200/90">(cadre 7 « Divers à déduire » 2035) → réintégration sociale auto via RBS →</span>
                    <CaseBadge code="DSDE" tone="imposable" />
                    <span className="text-emerald-700/80 dark:text-emerald-300/70 text-[11px]">(ou <strong>DSDG</strong> si RBS négatif)</span>
                  </>
                )}
              </div>
              {!isMicroBnc && (
                <div className="text-[10.5px] text-amber-700/80 dark:text-amber-300/70 mt-1.5 pt-1.5 border-t border-emerald-200/40 dark:border-emerald-900/30">
                  ⚠ Ne jamais reporter <strong>DSFA</strong> en régime réel (réservée au micro-BNC).
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warnings (a11y V11 — U1 : aria-live polite) */}
      {/* Warnings DSFU (masqués en RSPM, où la DSFU n'est pas remplie) */}
      {!isRspm && (
        <div role="status" aria-live="polite" aria-atomic="false">
          {dsPamc.warnings.map((w, i) => {
            // Phase 14.13 — Warning ZFU/ZFRR consolidé : format "<résumé>\n---\n<doctrine>"
            // → rendu en carte premium repliable au lieu de 3 Alerts empilés.
            const sepIdx = w.indexOf('\n---\n');
            if (sepIdx > -1) {
              const resume = w.slice(0, sepIdx);
              const doctrine = w.slice(sepIdx + 5);
              return <ZfuInfoAlert key={`warn-${i}`} resume={resume} doctrine={doctrine} annee={annee} />;
            }
            return (
              <Alert key={`warn-${i}`} className="mb-3 border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs">{w}</AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* U3 — Actions globales : copier tout / imprimer */}
      <div className="flex items-center justify-between gap-2 px-1 print:hidden">
        <div className="flex gap-1.5">
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={copyAll}>
            {copiedAll ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <ClipboardCopy className="h-3.5 w-3.5 mr-1.5" />}
            {copiedAll ? 'Copié' : 'Tout copier'}
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimer
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="show-zeros" className="text-xs cursor-pointer flex items-center gap-1.5">
            {showZeros ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Tout afficher
          </Label>
          <Switch id="show-zeros" checked={showZeros} onCheckedChange={onShowZerosChange} />
        </div>
      </div>

      {/* ============================================================
           BLOCS « À RECOPIER » — 2042-C PRO + DSFU en tête
           (déplacés au-dessus des blocs pédagogiques pliables)
         ============================================================ */}

      {/* 2042-C PRO */}
      <Card className="border-hippo-200 dark:border-hippo-800/50 bg-white/70 dark:bg-slate-900/40 backdrop-blur overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">2042-C PRO · Impôt sur le revenu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {isMicroBnc ? (
            <CaseRow
              code={c('5HQ')}
              label={declarant === 2 ? 'Recettes Micro-BNC imposables (déclarant 2 — conjoint·e)' : 'Recettes Micro-BNC imposables (déclarant 1)'}
              value={cases2042.case_5QC_5RC}
              hint="Recettes brutes encaissées − rétrocessions versées (titulaire) ou redevance de collaboration (collaborateur — L16/BG) − PDSA exonérée − recettes brutes réalisées en zone ZFU/ZFRR. Recopie en case 5HQ/5IQ de ta 2042-C PRO — le fisc applique l'abattement 34 %."
              badge={zfuMeta?.isSature ? 'Inclut le surplus ZFU au-dessus du plafond' : undefined}
              highlight
            />
          ) : (
            <CaseRow
              code={c('5QC')}
              label={declarant === 2 ? 'BNC adhérent OGA/AGA (déclarant 2 — conjoint·e)' : 'BNC adhérent OGA/AGA (déclarant 1)'}
              value={cases2042.case_5QC_5RC}
              hint="Régime de la déclaration contrôlée. 5QC pour le déclarant 1, 5RC pour le déclarant 2. À distinguer de 5QI/5RI utilisées hors OGA (majoration 25 %)."
              highlight
            />
          )}
          {isMicroBnc && (cases2042.case_5HP_5IP ?? 0) > 0 && (
            <CaseRow
              code={c('5HP')}
              label={declarant === 2 ? 'Recettes nettes exonérées zonées (déclarant 2)' : 'Recettes nettes exonérées zonées (ZFU-TE / ZFRR)'}
              value={cases2042.case_5HP_5IP ?? 0}
              hint="Bénéfice net exonéré = recettes brutes réalisées en zone × 0,66 (abattement 34 % déjà appliqué). Recopie en case 5HP/5IP de ta 2042-C PRO. Plafond : 50 000 €/an (ZFU-TE, CGI Art. 44 octies A) ou 300 000 €/3 ans glissants (ZFRR, CGI Art. 44 quindecies)."
              badge={
                zfuMeta?.isAnnee1 && zfuMeta?.isSature && zfuMeta?.moisActifs
                  ? `Plafond proraté · ${zfuMeta.moisActifs} mois éligibles`
                  : 'Auto · recettes zone × 0,66'
              }
              highlight
            />
          )}
          {visible(cases2042.case_1AS) && (
            <CaseRow code={c('1AS')} label="Pension de retraite CARMF" value={cases2042.case_1AS} hint="Réservée aux vraies pensions de retraite CARMF (RB/RC/ASV) et régimes complémentaires. Les IJ CARMF temporaires (médecin actif en arrêt) relèvent du BNC : ligne AF en réel ou recettes 5HQ en micro — jamais 1AS." />
          )}

          {/* Doctrine 2026 (Brochure DGFiP p. 180) : les IJ CPAM ne sont JAMAIS en 1AJ.
              En réel : à inclure par l'utilisateur dans AF (gains divers) → 5QC.
              En micro : exonérées d'IR → seulement DSDX (volet social). */}
        </CardContent>
      </Card>

      {/* DSFU (ex DS-PAMC) — masquée intégralement en RSPM */}
      {!isRspm && (
      <Card className="border-emerald-200 dark:border-emerald-900/40 bg-white/70 dark:bg-slate-900/40 backdrop-blur overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">DSFU · Déclaration sociale URSSAF <span className="text-xs font-normal text-muted-foreground">(ex DS-PAMC)</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {visible(dsPamc.DSCS, true) && (
            <CaseRow
              code={c('DSCS')}
              label={isMicroBnc ? 'Recettes brutes encaissées (PDSA + rétrocessions/redevance versées incluses)' : 'CA total avant rétrocessions versées / redevance de collaboration'}
              value={dsPamc.DSCS}
              hint={isMicroBnc
                ? 'Doctrine SNIR (notice URSSAF DRI-PAMC) : DSCS = totalité des recettes encaissées (PDSA exonérée incluse), AVANT déduction des rétrocessions versées (titulaire) ou de la redevance de collaboration (collaborateur — L16/BG). Cette part reversée n\'est PAS soustraite ici, sinon le ratio DSAU (DSAV/DSCS) se casse. Elle est en revanche pré-déduite côté fiscal (5HQ) et côté assiette sociale nette (DSDE). Ne pas confondre avec 5HQ — voir RO-012.'
                : 'Chiffre d\'affaires total tous secteurs confondus, AVANT déduction des rétrocessions versées (L21/BG) ou de la redevance de collaboration (L16/BG). Voir RO-012.'}
            />
          )}
          {visible(dsPamc.DSAV) && (
            <CaseRow code={c('DSAV')} label="Montant conventionné" value={dsPamc.DSAV} hint="Part conventionnée seule (case AA de la 2035)." />
          )}
          {visible(dsPamc.DSAW) && (
            <CaseRow code={c('DSAW')} label="Dépassements d'honoraires" value={dsPamc.DSAW} hint="Secteur 2 / OPTAM. Détermine le taux ASV applicable." />
          )}
          {visible(dsPamc.DSAU, true) && (
            <CaseRow code={c('DSAU')} label={`Ratio conventionné (${c('DSAV')}/${c('DSCS')})`} value={dsPamc.DSAU} hint="Clé de répartition conventionné / non conventionné. Plafonné entre 0 et 1." isRatio />
          )}
          {visible(dsPamc.DSAT) && (
            <CaseRow code={c('DSAT')} label="EHPAD non opposable / HAD / SSIAD / CMPP" value={dsPamc.DSAT} hint="Recettes nettes de ces structures." />
          )}
          {visible(dsPamc.DSDE, true) && (
            <CaseRow code={c('DSDE')} label={isMicroBnc ? 'Recettes nettes URSSAF (sans CV ni abatt. 34 %)' : 'Revenu Brut Social (si ≥ 0)'} value={dsPamc.DSDE} hint={isMicroBnc ? 'En Micro-BNC, DSDE = recettes brutes − rétrocessions versées (titulaire) ou redevance de collaboration (collaborateur — L16/BG) − PDSA exonérée. ⚠️ Les chèques-vacances NE sont PAS soustraits ici : l\'exo cotisations ANCV est gérée par l\'URSSAF via DSCN (montant facial, dans la limite du plafond social). L\'URSSAF applique elle-même son abattement forfaitaire de 34 % en interne pour calculer tes cotisations. Note : certains cabinets laissent DSDE vide en micro-BNC — les deux pratiques sont acceptées.' : 'Revenu Brut Social (Cadre 8 → case DD de la 2035-B). Réforme PAMC 2026 (revenus 2025+) : l\'URSSAF applique en interne un abattement forfaitaire de 26 % sur DSDE pour neutraliser les charges moyennes du métier (compense la réintégration de DG + DH dans le RBS). Source : réforme PAMC 2026.'} highlight />
          )}
          {visible(dsPamc.DSDG) && (
            <CaseRow code={c('DSDG')} label="RBS négatif (valeur absolue)" value={dsPamc.DSDG} hint={`Si ton RBS est négatif (cas rare, réel uniquement), il se déclare en ${c('DSDG')} et non en ${c('DSDE')}. Pas d'abattement 26 % appliqué sur un RBS négatif.`} />
          )}
          {visible(dsPamc.DSDX) && (
            <CaseRow code={c('DSDX')} label="IJ CPAM (maladie hors ALD, maternité, paternité, AFRM)" value={dsPamc.DSDX} hint="Réintégration sociale brut (avant CSG/CRDS précomptée par la CPAM). Normalement pré-rempli par l'administration — vérifie vs ton attestation Ameli et override le pré-rempli si écart. Source : Brochure DGFiP 2026 p. 180 + Guide PAMC URSSAF v1.0." />
          )}
          {visible(dsPamc.DSCZ) && (
            <CaseRow code={c('DSCZ')} label="IJ Madelin + AJPA" value={dsPamc.DSCZ} hint="Réintégration sociale des IJ Madelin et de l'allocation journalière proche aidant." />
          )}
          {visible(dsPamc.DSCN) && (
            <CaseRow code={c('DSCN')} label="Chèques-vacances ANCV" value={dsPamc.DSCN} hint={`${c('DSCN')} = montant total commandé. Exo cotisations URSSAF + CARMF dans la limite du plafond social ${fmt(plafondCvSocial)} (${annee}). Au-delà du plafond fiscal ${fmt(plafondCv)}, l'excédent n'est plus déductible du bénéfice. La CSG-CRDS reste due sur la part exonérée.`} badge={cvBadge} />
          )}
          {/* V20 — DSFA : micro-BNC uniquement. En réel, la réintégration sociale
              passe automatiquement par le RBS (la ligne CI figure dans la formule). */}
          {hasPdsa && isMicroBnc && (
            <CaseRow
              code={c('DSFA')}
              label={declarant === 2 ? 'PDSA exonérée — déclarant 2 (Art. 151 ter)' : 'PDSA exonérée — déclarant 1 (Art. 151 ter)'}
              value={pdsaSocial.dsfa}
              hint={`PDSA brute × 0,66 (l'URSSAF n'applique pas l'abatt. 34 % sur la PDSA — on envoie la valeur nette). Déclarant 1 : DSFA. Déclarant 2 (conjoint co-PDSA) : DSFB.`}
              highlight
            />
          )}
          {/* Audit pré-prod mai 2026 (A2) : note inline PDSA réel supprimée — le
              top-level Alert L414-430 couvre déjà la doctrine complète (PDSA en
              ligne CI → DSDE/DSDG, jamais DSFA/DSFB en réel). Le hint formulaire
              `pdsaExonereBrut` L737 répète la consigne côté saisie. */}
        </CardContent>
      </Card>
      )}

      {/* V13 — R1 : encart pédagogique déficit BNC en mode réel (5QC < 0). */}
      {!isMicroBnc && cases2042.case_5QC_5RC < 0 && (
        <Alert className="border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-sm">Déficit BNC déclaré</AlertTitle>
          <AlertDescription className="text-xs">
            Ta case <strong>{c('5QC')}</strong> est négative ({fmt(cases2042.case_5QC_5RC)}) — tu déclares un déficit BNC. C'est légitime fiscalement (déductible du revenu global ou reportable 6 ans), mais vérifie que c'est bien intentionnel.
          </AlertDescription>
        </Alert>
      )}

      {/* V21 — Estimation IR opt-in (additif, calc inchangé) */}
      <IrEstimateCard
        beneficeImposable={
          isMicroBnc
            ? Math.round(results.microBncRecettes * 0.66 * 100) / 100
            : Math.max(0, cases2042.case_5QC_5RC)
        }
        annee={annee}
      />

      {/* ============================================================
           BLOCS PÉDAGOGIQUES (pliés par défaut)
           « Comprendre ton RBS / 5HQ » + « Estimation assiette sociale »
         ============================================================ */}

      {/* Branche RÉEL : décomposition RBS — split en 2 sous-cartes (fiscal vs social) */}
      {/* Masquée en RSPM (pas de DSFU) */}
      {!isMicroBnc && !isRspm && (() => {
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const abattementUrssaf26 = annee >= 2025 && rbs > 0 ? round2(rbs * 0.26) : 0;
        const assietteNette = annee >= 2025 && rbs > 0 ? round2(rbs * 0.74) : 0;
        const heroCode = rbs >= 0 ? c('DSDE') : c('DSDG');
        return (
          <div className="flex flex-col gap-3">
            {/* ── Sous-carte 1 : Comprendre ton RBS (fiscal, pliable) ── */}
            <ResultCardCollapsible
              open={printForceOpen || openFiscal}
              onOpenChange={setOpenFiscal}
              variant="fiscal"
              icon={<FileText className="h-4 w-4 text-hippo-600 dark:text-hippo-400" />}
              title="Comprendre ton RBS"
              tagLabel="Fiscalité"
              heroLabel="Revenu Brut Social (RBS)"
              heroValue={fmt(rbs)}
              heroValueClass={rbs >= 0 ? 'text-hippo-900 dark:text-hippo-100' : 'text-destructive'}
              heroBadge={
                <span className="inline-flex items-center gap-1 bg-hippo-100 dark:bg-hippo-900/50 text-hippo-700 dark:text-hippo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {heroCode}
                </span>
              }
            >
              {onlyCpFilled && (
                <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg p-2.5 leading-snug">
                  💡 Le RBS ne se calcule pas depuis CP seul. Saisis CE / CN / BK / BV pour qu'il s'affiche. Si tu n'as que ton bénéfice final, va voir le{' '}
                  <a href="/guide-declarations#glossaire" className="underline font-medium">glossaire 2035</a>.
                </div>
              )}

              <div className="space-y-2.5 text-xs tabular-nums">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Excédent (CE)</span>
                  <span className="font-medium text-foreground">{fmt(decomposition.excedent)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">− Insuffisance (CN)</span>
                  <span className="font-medium text-muted-foreground">−{fmt(decomposition.insuffisance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">+ Charges sociales (BK)</span>
                  <span className="font-medium text-foreground">+{fmt(decomposition.chargesSociales)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">+ CSG déductible (BV)</span>
                  <span className="font-medium text-foreground">+{fmt(decomposition.csgDeductible)}</span>
                </div>
                {visible(decomposition.exonerations) && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">+ Σ Exonérations</span>
                    <span className="font-medium text-foreground">+{fmt(decomposition.exonerations)}</span>
                  </div>
                )}
                {decomposition.reintegrationsCadre8 > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">+ Cadre 8 DE</span>
                    <span className="font-medium text-foreground">+{fmt(decomposition.reintegrationsCadre8)}</span>
                  </div>
                )}
                {decomposition.deductionsCadre8 > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">− Cadre 8 DB</span>
                    <span className="font-medium text-muted-foreground">−{fmt(decomposition.deductionsCadre8)}</span>
                  </div>
                )}
                <div className="h-px bg-border my-1" />
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Tu retrouves ce montant et le code à recopier plus haut, dans le bloc <strong>DSFU</strong> ({c('DSDE')} / {c('DSDG')}).
                </p>
              </div>
            </ResultCardCollapsible>

            {/* ── Sous-carte 2 : Estimation de ton assiette sociale (pliable) ── */}
            <ResultCardCollapsible
              open={printForceOpen || openSocial}
              onOpenChange={setOpenSocial}
              variant="social"
              icon={<Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
              title="Estimation de ton assiette sociale"
              tagLabel="Base URSSAF"
              heroLabel={annee >= 2025 && rbs > 0 ? 'Assiette nette cotisable estimée' : 'Base de calcul URSSAF'}
              heroValue={annee >= 2025 && rbs > 0 ? `≈ ${fmt(assietteNette)}` : '—'}
              heroValueClass="text-slate-900 dark:text-slate-100"
            >
              {annee >= 2025 && rbs > 0 ? (
                <>
                  <div className="space-y-2.5 text-xs tabular-nums">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">RBS reporté ({c('DSDE')})</span>
                      <span className="font-medium text-foreground">{fmt(rbs)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">− Abattement URSSAF 26 %</span>
                      <span className="font-medium text-muted-foreground">−{fmt(abattementUrssaf26)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/70 dark:border-blue-900/40 rounded-xl p-3 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
                      Cette base sert au calcul de tes cotisations URSSAF + CARMF — <strong>pas le montant des cotisations elles-mêmes</strong>. Réforme PAMC 2026 : abattement forfaitaire de <strong>26 %</strong> appliqué en interne sur {c('DSDE')} pour compenser la réintégration de DG + DH dans le RBS.
                    </p>
                  </div>
                </>
              ) : annee >= 2025 && rbs < 0 ? (
                <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/70 dark:border-blue-900/40 rounded-xl p-3 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
                    RBS négatif → reporté en <strong>{c('DSDG')}</strong>, pas d'abattement 26 % applicable.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/70 dark:border-blue-900/40 rounded-xl p-3 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
                    L'URSSAF calcule tes cotisations sur la base de ton RBS (case {c('DSDE')} ou {c('DSDG')}). L'abattement 26 % s'applique sur les revenus 2025+ uniquement.
                  </p>
                </div>
              )}
            </ResultCardCollapsible>
          </div>
        );
      })()}



      {/* Branche MICRO-BNC : 2 sous-cartes côte à côte (fiscal vs social) */}
      {isMicroBnc && results.microBncRecettes > 0 && (() => {
        // V13 — A1 : arrondi 2 décimales pour éviter `17 000,0034 €` sur recettes float.
        const round2 = (n: number) => Math.round(n * 100) / 100;
        const abattement = round2(results.microBncRecettes * 0.34);
        const beneficeIR = round2(results.microBncRecettes * 0.66);
        // Phase finale (audit pré-prod mai 2026) — décomposition pédagogique 5HQ :
        // brut SNIR (= DSCS) → − rétros + PDSA → − CV × 1,515 (RO-005, IR seul)
        // → − recettes zone ZFU/ZFRR → 5HQ imposables. Côté social (DSDE), CV n'est
        // PAS soustraite — l'exo cotisations ANCV est gérée par URSSAF via DSCN.
        const recettesBrutes = round2(dsPamc.DSCS);
        // DSDE = brut − retros − PDSA (sans CV). Le bloc "retros + PDSA" se déduit
        // donc par différence DSCS − DSDE.
        const preDeductions = Math.max(0, round2(recettesBrutes - dsPamc.DSDE));
        // CV minoration appliquée uniquement côté IR : delta entre DSDE et 5HQ
        // (avant exo zonée). 5HP est en NET → on remonte au brut pour la ligne zone.
        const recettesZone = round2((cases2042.case_5HP_5IP ?? 0) / 0.66);
        const cvMinoration = Math.max(
          0,
          round2(dsPamc.DSDE - results.microBncRecettes - recettesZone),
        );
        const dsdeRound = round2(dsPamc.DSDE);
        // Audit mai 2026 — Revenu net social transmis URSSAF en micro-BNC :
        // = 5HQ × 0,66 (part imposable abattue)
        //   + 5HP (part exonérée zonée, déjà nette)
        //   + DSFA/DSFB (PDSA exonérée nette, ×0,66 — déjà calculé moteur)
        // Cf. bible HippoDoc §6 + glossaire 5HP. On expose la formule additive
        // pour rendre la part 5HP / DSFA visible (sinon utilisateur confus).
        const case5HP = round2(cases2042.case_5HP_5IP ?? 0);
        const dsfaNet = round2(dsPamc.DSFA + dsPamc.DSFB);
        const hqAbattu = round2(results.microBncRecettes * 0.66);
        const revenuNetSocial = round2(hqAbattu + case5HP + dsfaNet);
        return (
          <div className="flex flex-col gap-3">
            {/* ── Sous-carte 1 : Comprendre ton 5HQ (fiscal, pliable) ── */}
            <ResultCardCollapsible
              open={printForceOpen || openFiscal}
              onOpenChange={setOpenFiscal}
              variant="fiscal-micro"
              icon={<Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              title="Comprendre ton 5HQ"
              tagLabel="Fiscalité"
              heroLabel="Recettes à reporter"
              heroValue={fmt(results.microBncRecettes)}
              heroValueClass="text-emerald-950 dark:text-emerald-100"
              heroBadge={
                <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  {c('5HQ')}
                </span>
              }
            >
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {c('5HQ')} est une <strong>recette brute imposable</strong> : le fisc applique ensuite l'abattement automatique de 34 %. Recopie la case ci-dessous, ou retrouve-la dans le bloc <strong>2042-C PRO</strong> plus haut.
              </p>

              <div className="space-y-2.5 text-xs tabular-nums">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recettes brutes encaissées (SNIR)</span>
                  <span className="font-medium text-foreground">{fmt(recettesBrutes)}</span>
                </div>
                {preDeductions > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">− Rétrocessions versées + PDSA exonérée</span>
                    <span className="font-medium text-muted-foreground">−{fmt(preDeductions)}</span>
                  </div>
                )}
                {cvMinoration > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">− Chèques-vacances (× 1,515, IR seul)</span>
                    <span className="font-medium text-muted-foreground">−{fmt(cvMinoration)}</span>
                  </div>
                )}
                {recettesZone > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">− Recettes brutes en zone ZFU-TE / ZFRR</span>
                    <span className="font-medium text-muted-foreground">−{fmt(recettesZone)}</span>
                  </div>
                )}
                <div className="h-px bg-emerald-100 dark:bg-emerald-900/40 my-1" />
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-foreground">= À reporter en {c('5HQ')}</span>
                  <span className="text-foreground">{fmt(results.microBncRecettes)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">− Abattement automatique 34 %</span>
                  <span className="font-medium text-muted-foreground">−{fmt(abattement)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground italic">Bénéfice imposable IR estimé</span>
                  <span className="font-medium text-foreground italic">≈ {fmt(beneficeIR)}</span>
                </div>
              </div>

              {case5HP > 0 && (
                <div className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100/70 dark:border-emerald-900/30 rounded-xl p-3 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-200">
                    Reporte aussi <strong>{fmt(case5HP)}</strong> en {c('5HP')} (part exonérée zonée, déjà nette — abattement 34 % appliqué).
                  </p>
                </div>
              )}
            </ResultCardCollapsible>

            {/* ── Sous-carte 2 : Estimation de ton assiette sociale (pliable, masquée en RSPM) ── */}
            {!isRspm && (
              <ResultCardCollapsible
                open={printForceOpen || openSocial}
                onOpenChange={setOpenSocial}
                variant="social"
                icon={<Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />}
                title="Estimation de ton assiette sociale"
                tagLabel="Base URSSAF"
                heroLabel="Revenu net social estimé"
                heroValue={`≈ ${fmt(revenuNetSocial)}`}
                heroValueClass="text-slate-900 dark:text-slate-100"
              >
                <div className="space-y-2.5 text-xs tabular-nums">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{c('5HQ')} × 0,66 (recettes imposables abattues)</span>
                    <span className="font-medium text-foreground">{fmt(hqAbattu)}</span>
                  </div>
                  {case5HP > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">+ {c('5HP')} (part exonérée zonée, déjà nette)</span>
                      <span className="font-medium text-foreground">+{fmt(case5HP)}</span>
                    </div>
                  )}
                  {dsfaNet > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">+ {c(dsPamc.DSFB > 0 ? 'DSFB' : 'DSFA')} (PDSA exonérée nette)</span>
                      <span className="font-medium text-foreground">+{fmt(dsfaNet)}</span>
                    </div>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-800/60 my-1" />
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-foreground">= Revenu net social estimé</span>
                    <span className="text-foreground">≈ {fmt(revenuNetSocial)}</span>
                  </div>
                </div>

                <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/70 dark:border-blue-900/40 rounded-xl p-3 flex items-start gap-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
                    Cette base sert au calcul de tes cotisations URSSAF + CARMF — <strong>pas le montant des cotisations elles-mêmes</strong>. L'URSSAF reconstitue ton revenu net social en additionnant ces lignes : l'abattement 34 % n'est appliqué <strong>que sur {c('5HQ')}</strong>, jamais sur {c('5HP')} ou {c('DSFA')} (déjà nets).
                  </p>
                </div>

                {cvMinoration > 0 && (
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 rounded-xl p-3 flex items-start gap-2">
                    <Info className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
                      Les chèques-vacances ne sont pas déduits ici — l'exo de cotisations ANCV est gérée par l'URSSAF via {c('DSCN')}.
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground/80 italic">
                  Détail technique : assiette {c('DSDE')} transmise = {fmt(dsdeRound)} (recettes brutes − rétrocessions versées − PDSA, hors zone ZFU/ZFRR qui se reporte séparément en {c('5HP')}).
                </p>
              </ResultCardCollapsible>
            )}
          </div>
        );
      })()}





      {/* Footer global unifié — Audit pré-prod mai 2026 (A1) :
          les 2 anciens liens « Glossaire 2042-C PRO » + « Glossaire DSFU »
          pointaient sur la même ancre `#glossaire` → fusionnés en un seul.
          Audit pré-prod mai 2026 v2 (C1) : la phrase « Utilisateur Hippodoc ? »
          est masquée en mode connecté (l'utilisateur EST déjà sur Hippodoc) →
          remplacée par un raccourci direct vers Aide DSFU. */}
      <div className="text-[11px] text-muted-foreground px-2 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>Pas sûr d'une case ?</span>
        <a href="/guide-declarations#glossaire" className="text-hippo-600 hover:underline">Glossaire complet (2042 + DSFU)</a>
        <span aria-hidden className="text-muted-foreground/50">|</span>
        {connectedMode ? (
          <span>
            Tout est déjà pré-rempli sur{' '}
            <a href={`${APP_URL}/depenses/aide-pamc`} className="text-hippo-600 hover:underline">Aide DSFU</a>.
          </span>
        ) : (
          <span>
            Utilisateur Hippodoc ? Tout est pré-rempli sur{' '}
            <a href={`${APP_URL}/depenses/aide-pamc`} className="text-hippo-600 hover:underline">Aide DSFU</a>.
          </span>
        )}
      </div>
    </div>
  );
}

