import React from 'react';
import type { CaseInfo } from '@/data/boussoleData';
import { AlertTriangle, Lightbulb, ChevronDown } from 'lucide-react';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { caseAnchor } from '@/lib/guide/anchors';

/**
 * Carte d'une case de formulaire, extraite telle quelle de `CaseopediaSection`
 * pour être partagée entre le hub (/guide-declarations) et les pages filles par
 * formulaire (/guide-declarations/dsfu-pamc, /2042-c-pro…).
 *
 * ⚠️ Le balisage est repris à l'identique : le HTML du hub ne doit pas changer
 * d'un octet à l'extraction. Vérifié par empreinte SHA-256 avant/après dans
 * MIGRATION.md § 9.ap. Toute retouche de style ici se répercute sur les deux
 * surfaces — c'est le but, mais ça se vérifie sur le hub aussi.
 */

export const catColors: Record<CaseInfo['categorie'], string> = {
  fiscal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  social: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  administratif: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export const CaseCard: React.FC<{ c: CaseInfo }> = ({ c }) => (
  <details id={caseAnchor(c.code)} className="group rounded-xl bg-white/90 backdrop-blur border border-slate-200/60 shadow-sm overflow-hidden scroll-mt-24 dark:bg-slate-800/60 dark:border-slate-700/60">
    <summary className="w-full p-4 text-left flex items-start justify-between gap-2 cursor-pointer list-none">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-mono font-bold text-hippo-600 dark:text-hippo-400 text-sm">{c.code}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${catColors[c.categorie]}`}>{c.categorie}</span>
        </div>
        <p className="text-sm font-medium text-foreground leading-snug">{c.nom}</p>
      </div>
      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1 group-open:rotate-180" />
    </summary>
    <div className="px-4 pb-4 space-y-3">
      <div><p className="text-xs font-medium text-muted-foreground mb-1">Formulaire</p><p className="text-sm text-foreground">{c.formulaire}</p></div>
      <div><p className="text-xs font-medium text-muted-foreground mb-1">Description</p><FormattedText text={c.description} /></div>
      <div><p className="text-xs font-medium text-muted-foreground mb-1">Qui remplit ?</p><FormattedText text={c.quiRemplit} /></div>
      <div className="p-3 rounded-lg bg-red-50/60 border border-red-100 dark:bg-red-950/20 dark:border-red-900/40">
        <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Erreur fréquente</p>
        <FormattedText text={c.erreurFrequente} />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Conseil</p>
        <FormattedText text={c.conseil} />
      </div>
      <CertitudeBadge level={c.certitude} />
      <CrossLinks
        relatedFiches={c.relatedFiches}
        relatedQuestions={c.relatedQuestions}
        relatedTerms={c.relatedTerms}
      />
    </div>
  </details>
);
