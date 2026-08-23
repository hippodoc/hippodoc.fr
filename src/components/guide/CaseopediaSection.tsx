import React from 'react';
import { caseopedia, type CaseInfo } from '@/data/boussoleData';
import { BookOpen } from 'lucide-react';
import { CaseCard } from './CaseCard';

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
          {/* Introduction visible : cette section porte 35 cases, toutes repliées dans
              des <details>. Sans texte ouvert, le sujet réel de la section n'apparaît
              nulle part pour un lecteur qui arrive de recherche. Résumé de ce qui est
              déjà là — aucune règle fiscale nouvelle n'est avancée ici.
              Voir MIGRATION.md § 9.am. */}
          <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Deux formulaires, deux logiques. Côté fiscal, la <strong>2042-C-PRO</strong> et
              la <strong>2035</strong> décident de ton impôt sur le revenu : recettes en
              micro-BNC, bénéfice net au réel, revenus exonérés en zone, plus-values,
              cotisations déductibles. Côté social, la <strong>DSFU</strong> — l'ancienne
              DS-PAMC — sert de base au calcul de tes cotisations URSSAF et CARMF : recettes
              brutes non salariées, indemnités journalières de la CPAM, revenus de gérance,
              épargne salariale.
            </p>
            <p>
              Chaque fiche ci-dessous indique le formulaire concerné, ce que l'administration
              attend exactement dans la case, qui doit la remplir selon son statut, et
              l'erreur qu'on y voit le plus souvent — y compris les pré-remplissages
              automatiques à corriger à la main.
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {grouped.map(({ cat, items }) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {CATEGORY_LABELS[cat]} <span className="opacity-60">({items.length})</span>
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map(c => (
                  <CaseCard key={c.id} c={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
