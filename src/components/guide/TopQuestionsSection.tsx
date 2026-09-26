import React from 'react';
import { questionsFAQ, questionThemeLabels, type QuestionTheme } from '@/data/boussoleData';
import { QuestionCard } from './QuestionCard';
import { HelpCircle } from 'lucide-react';

/**
 * Portage statique de TopQuestionsSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Recherche texte + filtre thème + filtre "questions hors profil" (JS,
 *    useState) → remplacés par un regroupement statique par thème
 *    (`questionThemeLabels`) ; toutes les questions restent visibles dans
 *    le HTML (couvert par la recherche globale — îlot `BoussoleSearchIsland`).
 *  - Accordéon Radix (`Accordion`) → `<details>/<summary>` natif.
 *  - Tags cliquables (filtrage par mot-clé) → badges statiques (texte
 *    conservé, plus de filtrage au clic puisque le filtre est retiré).
 */

export function TopQuestionsSection() {
  const themes = Object.keys(questionThemeLabels) as QuestionTheme[];
  const grouped = themes
    .map(theme => ({ theme, items: questionsFAQ.filter(q => q.theme === theme) }))
    .filter(g => g.items.length > 0);

  return (
    <section id="questions" className="py-12 md:py-16 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-hippo-500" /> Questions fréquentes
            <span className="text-base font-normal text-muted-foreground">({questionsFAQ.length})</span>
          </h2>
          <p className="text-muted-foreground mt-1">Les réponses aux questions les plus posées par les médecins libéraux</p>
          {/* Introduction visible — cf. Caseopedia, même raison (MIGRATION.md § 9.am). */}
          <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              Ce sont des questions réellement posées, pas des questions inventées pour faire
              nombre : première déclaration d'un interne qui cumule salaire hospitalier et
              remplacements, écart entre le SNIR reçu et le chiffre d'affaires encaissé, cases
              à remplir quand on passe du RSPM au régime PAMC en cours d'année, sort fiscal et
              social des indemnités journalières.
            </p>
            <p>
              Chaque réponse indique son degré de certitude : établie quand le texte est clair,
              consensuelle quand la pratique converge, débattue quand la doctrine n'a pas
              tranché. Sur un sujet où beaucoup affirment sans nuancer, cette distinction fait
              partie de la réponse.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {grouped.map(({ theme, items }) => (
            <div key={theme}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {questionThemeLabels[theme]} <span>({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map(q => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
