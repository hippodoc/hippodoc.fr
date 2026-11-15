import React from 'react';
import { BookA, Landmark, HeartPulse, Building2, Calculator } from 'lucide-react';
import { Croix } from './Croix';
import { Badge } from '@/components/ui/badge';
import { GLOSSAIRE_DECLARATIONS, GLOSSAIRE_CATEGORIES, type GlossaireCategory } from '@/data/glossaireDeclarationsData';
import { FormattedText, formatInline } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { useAnchorResolver, termAnchor } from '@/lib/guide/anchors';

/**
 * Portage statique de GlossaireSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Recherche + filtre catégorie (JS, useState) → retirés (couvert par la
 *    recherche globale, îlot `BoussoleSearchIsland`) ; tous les termes
 *    restent groupés par lettre comme dans la source.
 *  - Navigation alphabétique rapide → ancre `<a href="#glossaire-lettre-X">`
 *    (scroll natif) au lieu d'un `onClick` + `scrollIntoView`.
 *  - Carte dépliable (framer-motion) → `<details>/<summary>` natif.
 *  - "Voir aussi" (termes liés) fusionné dans le composant `CrossLinks`
 *    partagé (relatedTerms) plutôt que dupliqué localement.
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : des plis `.qa` compacts ; lettres de
 * l'alphabet en pastilles ; catégories dans les jetons d'état (fiscal en bleu,
 * social en vert, comptable en ambre, administratif en ciel doux), par la clé
 * de la catégorie et non plus par les classes de couleur des données.
 */

const CATEGORY_ICONS: Record<GlossaireCategory, React.ElementType> = {
  fiscal: Landmark,
  social: HeartPulse,
  administratif: Building2,
  comptable: Calculator,
};

export function GlossaireSection() {
  const resolve = useAnchorResolver();
  const letters = Array.from(new Set(GLOSSAIRE_DECLARATIONS.map(t => t.term[0].toUpperCase()))).sort();
  const groupedByLetter: Record<string, typeof GLOSSAIRE_DECLARATIONS> = {};
  for (const t of GLOSSAIRE_DECLARATIONS) {
    const l = t.term[0].toUpperCase();
    (groupedByLetter[l] ??= []).push(t);
  }
  const categories = Object.entries(GLOSSAIRE_CATEGORIES) as [GlossaireCategory, typeof GLOSSAIRE_CATEGORIES[GlossaireCategory]][];

  return (
    <section id="glossaire" className="gd-glossaire">
      <div className="gd-sec-tete">
        <h2 className="gd-h2">
          <BookA className="gd-ic" /> Glossaire fiscal & social
          <span className="gd-compte">({GLOSSAIRE_DECLARATIONS.length} définitions)</span>
        </h2>
        <p className="gd-sous">Tous les termes expliqués simplement</p>
      </div>

      {/* Légende catégories (informative, non filtrante) */}
      <div className="gd-legende">
        {categories.map(([key, cat]) => {
          const Icon = CATEGORY_ICONS[key];
          const count = GLOSSAIRE_DECLARATIONS.filter(t => t.category === key).length;
          return (
            <span key={key} className={`gd-puce grande cat-${key}`}>
              <Icon className="gd-ic" />
              {cat.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Navigation alphabétique */}
      <div className="gd-alphabet">
        {letters.map(l => (
          <a
            key={l}
            href={`#glossaire-lettre-${l}`}
            className="gd-lettre"
          >
            {l}
          </a>
        ))}
      </div>

      <div className="gd-groupes">
        {letters.map(letter => (
          <div key={letter} id={`glossaire-lettre-${letter}`} className="gd-lettre-groupe">
            <div className="gd-lettre-tete">
              <span className="gd-lettre-grande">{letter}</span>
              <div className="gd-filet" />
              <span className="gd-lettre-compte">{groupedByLetter[letter].length} terme{groupedByLetter[letter].length > 1 ? 's' : ''}</span>
            </div>
            <div className="gd-grille g3">
              {groupedByLetter[letter].map(term => {
                const cat = GLOSSAIRE_CATEGORIES[term.category];
                const Icon = CATEGORY_ICONS[term.category];
                return (
                  <details
                    key={term.id}
                    id={`glossaire-term-${term.id}`}
                    className="qa gd-pli gd-terme"
                  >
                    <summary className={term.longDef ? undefined : 'fixe'}>
                      <div className="gd-terme-tete">
                        <div className={`gd-rond petit cat-${term.category}`}>
                          <Icon className="gd-ic" />
                        </div>
                        <div className="gd-pli-tete">
                          <div className="gd-pli-puces">
                            <h3 className="gd-terme-nom">{term.term}</h3>
                            <Badge variant="outline" className={`gd-puce cat-${term.category}`}>
                              {cat.label}
                            </Badge>
                          </div>
                          <p className="gd-terme-def">{formatInline(term.shortDef, { auto: false })}</p>
                        </div>
                      </div>
                      {term.longDef && (
                        <Croix />
                      )}
                    </summary>

                    {term.longDef && (
                      <div className="gd-pli-in gd-terme-in">
                        <div className="gd-terme-long">
                          <FormattedText text={term.longDef} variant="glossary" />
                        </div>
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="gd-voir">
                            <span className="gd-voir-nom">Voir aussi :</span>
                            {term.relatedTerms.map(rt => {
                              const related = GLOSSAIRE_DECLARATIONS.find(t => t.id === rt);
                              return related ? (
                                <a
                                  key={rt}
                                  href={resolve(termAnchor(rt))}
                                  className="gd-ref"
                                >
                                  {related.term}
                                </a>
                              ) : null;
                            })}
                          </div>
                        )}
                        <CrossLinks
                          relatedFiches={term.relatedFiches}
                          relatedQuestions={term.relatedQuestions}
                          relatedCases={term.relatedCases}
                        />
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
