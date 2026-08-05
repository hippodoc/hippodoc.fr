import React from 'react';
import { caseopedia, type CaseInfo } from '@/data/boussoleData';
import { AlertTriangle, Lightbulb, BookOpen, ChevronDown } from 'lucide-react';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';

/**
 * Portage statique de CaseopediaSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Filtre "Toutes / Fiscal / Social" (JS, useState) → remplacé par un
 *    regroupement statique par `categorie` (fiscal/social/administratif),
 *    avec sous-titres — tout le contenu reste visible dans le HTML.
 *  - Surlignage "Prioritaire" selon le profil sélectionné dans le wizard
 *    (prop `selectedProfil`/`wizardCaseCodes`) : supprimé — le wizard est
 *    un îlot autonome qui ne peut plus filtrer cette section statique.
 *  - Accordéon (Radix + framer-motion) → `<details>/<summary>` natif :
 *    tout le texte est présent dans le HTML, le dépli fonctionne sans JS.
 */

const CATEGORY_ORDER: CaseInfo['categorie'][] = ['fiscal', 'social', 'administratif'];
const CATEGORY_LABELS: Record<CaseInfo['categorie'], string> = {
  fiscal: 'Fiscal',
  social: 'Social',
  administratif: 'Administratif',
};
const catColors: Record<CaseInfo['categorie'], string> = {
  fiscal: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  social: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  administratif: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export function CaseopediaSection() {
  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    items: caseopedia.filter(c => c.categorie === cat),
  })).filter(g => g.items.length > 0);

  return (
    <section id="cases" className="py-12 md:py-16 scroll-mt-20 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-hippo-500" /> Caseopedia <span className="text-base font-normal text-muted-foreground">({caseopedia.length} cases)</span>
          </h2>
          <p className="text-muted-foreground mt-1">Chaque case décryptée : à quoi elle sert, qui la remplit, piège fréquent</p>
        </div>

        <div className="space-y-10">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {CATEGORY_LABELS[cat]} <span className="opacity-60">({items.length})</span>
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map(c => (
                  <details key={c.id} id={`case-${c.code}`} className="group rounded-xl bg-white/90 backdrop-blur border border-slate-200/60 shadow-sm overflow-hidden scroll-mt-24 dark:bg-slate-800/60 dark:border-slate-700/60">
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
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
