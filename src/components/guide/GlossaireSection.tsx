import React from 'react';
import { BookA, ChevronDown, Landmark, HeartPulse, Building2, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GLOSSAIRE_DECLARATIONS, GLOSSAIRE_CATEGORIES, type GlossaireCategory } from '@/data/glossaireDeclarationsData';
import { FormattedText } from './FormattedText';
import { CrossLinks, termHref } from './CrossLinks';

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
 */

const CATEGORY_ICONS: Record<GlossaireCategory, React.ElementType> = {
  fiscal: Landmark,
  social: HeartPulse,
  administratif: Building2,
  comptable: Calculator,
};

export function GlossaireSection() {
  const letters = Array.from(new Set(GLOSSAIRE_DECLARATIONS.map(t => t.term[0].toUpperCase()))).sort();
  const groupedByLetter: Record<string, typeof GLOSSAIRE_DECLARATIONS> = {};
  for (const t of GLOSSAIRE_DECLARATIONS) {
    const l = t.term[0].toUpperCase();
    (groupedByLetter[l] ??= []).push(t);
  }
  const categories = Object.entries(GLOSSAIRE_CATEGORIES) as [GlossaireCategory, typeof GLOSSAIRE_CATEGORIES[GlossaireCategory]][];

  return (
    <section id="glossaire" className="scroll-mt-20">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <BookA className="h-7 w-7 text-hippo-500" /> Glossaire fiscal & social
          <span className="text-base font-normal text-muted-foreground">({GLOSSAIRE_DECLARATIONS.length} définitions)</span>
        </h2>
        <p className="text-muted-foreground mt-1">Tous les termes expliqués simplement</p>
      </div>

      {/* Légende catégories (informative, non filtrante) */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {categories.map(([key, cat]) => {
          const Icon = CATEGORY_ICONS[key];
          const count = GLOSSAIRE_DECLARATIONS.filter(t => t.category === key).length;
          return (
            <span key={key} className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 ${cat.bgColor} ${cat.color}`}>
              <Icon className="h-3 w-3" />
              {cat.label} ({count})
            </span>
          );
        })}
      </div>

      {/* Navigation alphabétique */}
      <div className="flex items-center gap-1 flex-wrap mb-6 pb-4 border-b border-border/40">
        {letters.map(l => (
          <a
            key={l}
            href={`#glossaire-lettre-${l}`}
            className="w-8 h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center no-underline"
          >
            {l}
          </a>
        ))}
      </div>

      <div className="space-y-8">
        {letters.map(letter => (
          <div key={letter} id={`glossaire-lettre-${letter}`} className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-black text-primary/80">{letter}</span>
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] text-muted-foreground">{groupedByLetter[letter].length} terme{groupedByLetter[letter].length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {groupedByLetter[letter].map(term => {
                const cat = GLOSSAIRE_CATEGORIES[term.category];
                const Icon = CATEGORY_ICONS[term.category];
                return (
                  <details
                    key={term.id}
                    id={`glossaire-term-${term.id}`}
                    className="group w-full rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 scroll-mt-24"
                  >
                    <summary className={`w-full text-left ${term.longDef ? 'cursor-pointer' : 'cursor-default'} list-none`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg ${cat.bgColor} shrink-0`}>
                          <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-sm text-foreground">{term.term}</h3>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-transparent ${cat.bgColor} ${cat.color}`}>
                              {cat.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{term.shortDef}</p>
                        </div>
                        {term.longDef && (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                        )}
                      </div>
                    </summary>

                    {term.longDef && (
                      <div className="overflow-hidden pl-10">
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <FormattedText text={term.longDef} variant="glossary" />
                        </div>
                        {term.relatedTerms && term.relatedTerms.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground">Voir aussi :</span>
                            {term.relatedTerms.map(rt => {
                              const related = GLOSSAIRE_DECLARATIONS.find(t => t.id === rt);
                              return related ? (
                                <a
                                  key={rt}
                                  href={termHref(rt)}
                                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors no-underline"
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
