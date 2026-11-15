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
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : styles dans src/styles/guide.css.
 */

export function TopQuestionsSection() {
  const themes = Object.keys(questionThemeLabels) as QuestionTheme[];
  const grouped = themes
    .map(theme => ({ theme, items: questionsFAQ.filter(q => q.theme === theme) }))
    .filter(g => g.items.length > 0);

  return (
    <section id="questions" className="gd-sec">
      <div className="wrap">
        <div className="gd-sec-tete">
          <h2 className="gd-h2">
            <HelpCircle className="gd-ic" /> Questions fréquentes
            <span className="gd-compte">({questionsFAQ.length})</span>
          </h2>
          <p className="gd-sous">Les réponses aux questions les plus posées par les médecins libéraux</p>
          {/* Introduction visible — cf. Caseopedia, même raison (MIGRATION.md § 9.am). */}
          <div className="gd-intro">
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

        <div className="gd-groupes">
          {grouped.map(({ theme, items }) => (
            <div key={theme}>
              <h3 className="gd-sur">
                {questionThemeLabels[theme]} <span>({items.length})</span>
              </h3>
              <div className="gd-plis">
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
