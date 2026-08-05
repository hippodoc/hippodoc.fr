import React from 'react';
import { reglesOr, pepitesCachees, zonesGrises, ficheThemeLabels, type FicheTheme, type CertitudeLevel } from '@/data/boussoleData';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { ChevronDown, Lightbulb, Scale, Zap, Gem } from 'lucide-react';

/**
 * Portage statique de FichesPratiquesSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Filtres thème + type (JS, useState) → remplacés par un regroupement
 *    statique par thème (`ficheThemeLabels`), badge de type conservé sur
 *    chaque carte. Tout le contenu reste visible dans le HTML.
 *  - Tri par pertinence profil (selectedProfil) : supprimé (îlot wizard
 *    autonome, ne filtre plus les sections statiques).
 *  - Accordéon (framer-motion) → `<details>/<summary>` natif.
 */

type FicheItem = {
  id: string;
  titre: string;
  description: string;
  certitude: CertitudeLevel;
  theme: FicheTheme;
  type: 'regle' | 'pepite' | 'zone-grise';
  impact?: 'faible' | 'moyen' | 'fort';
  exemple?: string;
  positionA?: string;
  positionB?: string;
  relatedFiches?: string[];
  relatedQuestions?: string[];
  relatedCases?: string[];
  relatedTerms?: string[];
};

function buildFiches(): FicheItem[] {
  const fiches: FicheItem[] = [];

  for (const r of reglesOr) {
    fiches.push({
      id: `regle-${r.id}`,
      titre: r.titre,
      description: r.description,
      certitude: r.certitude,
      theme: r.theme,
      type: 'regle',
      exemple: r.exemple,
      relatedFiches: r.relatedFiches,
      relatedQuestions: r.relatedQuestions,
      relatedCases: r.relatedCases,
      relatedTerms: r.relatedTerms,
    });
  }

  for (const p of pepitesCachees) {
    fiches.push({
      id: `pepite-${p.id}`,
      titre: p.titre,
      description: p.description,
      certitude: p.certitude,
      theme: p.theme,
      type: 'pepite',
      impact: p.impact,
      relatedFiches: p.relatedFiches,
      relatedQuestions: p.relatedQuestions,
      relatedCases: p.relatedCases,
      relatedTerms: p.relatedTerms,
    });
  }

  for (const z of zonesGrises) {
    fiches.push({
      id: `zone-${z.id}`,
      titre: z.sujet,
      description: z.conclusion,
      certitude: z.certitude,
      theme: z.theme,
      type: 'zone-grise',
      positionA: z.positionA,
      positionB: z.positionB,
      relatedFiches: z.relatedFiches,
      relatedQuestions: z.relatedQuestions,
      relatedCases: z.relatedCases,
      relatedTerms: z.relatedTerms,
    });
  }

  return fiches;
}

const typeConfig = {
  regle: { icon: Zap, label: "Règle d'or", className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  pepite: { icon: Gem, label: 'Astuce', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  'zone-grise': { icon: Scale, label: 'Débattu', className: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
};

const impactColors = { faible: 'bg-slate-200 dark:bg-slate-700', moyen: 'bg-amber-400', fort: 'bg-red-500' };

export function FichesPratiquesSection() {
  const allFiches = buildFiches();
  const themes = Object.keys(ficheThemeLabels) as FicheTheme[];
  const grouped = themes
    .map(theme => ({ theme, items: allFiches.filter(f => f.theme === theme) }))
    .filter(g => g.items.length > 0);

  return (
    <section id="fiches" className="py-12 md:py-16 scroll-mt-20 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-hippo-500" /> Fiches pratiques
            <span className="text-base font-normal text-muted-foreground">({allFiches.length})</span>
          </h2>
          <p className="text-muted-foreground mt-1">Règles essentielles, astuces d'optimisation et sujets débattus — tout en un seul endroit</p>
        </div>

        <div className="space-y-10">
          {grouped.map(({ theme, items }) => (
            <div key={theme}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {ficheThemeLabels[theme]} <span className="opacity-60">({items.length})</span>
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map(f => {
                  const tc = typeConfig[f.type];
                  const TypeIcon = tc.icon;
                  return (
                    <details key={f.id} id={f.id} className="group rounded-xl bg-white/90 backdrop-blur border border-slate-200/60 shadow-sm overflow-hidden scroll-mt-24 dark:bg-slate-800/60 dark:border-slate-700/60">
                      <summary className="w-full p-4 text-left flex items-start justify-between gap-2 cursor-pointer list-none">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${tc.className}`}>
                              <TypeIcon className="h-3 w-3" /> {tc.label}
                            </span>
                            {f.impact && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className={`w-2 h-2 rounded-full ${impactColors[f.impact]}`} />
                                Impact {f.impact}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground leading-snug">{f.titre}</p>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1 group-open:rotate-180" />
                      </summary>

                      <div className="px-4 pb-4 space-y-3">
                        <FormattedText text={f.description} />

                        {f.type === 'zone-grise' && f.positionA && f.positionB && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40">
                              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Position A</p>
                              <p className="text-xs text-muted-foreground">{f.positionA}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/40">
                              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">Position B</p>
                              <p className="text-xs text-muted-foreground">{f.positionB}</p>
                            </div>
                          </div>
                        )}

                        {f.exemple && (
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/50 dark:border-slate-700">
                            <FormattedText text={f.exemple} variant="example" />
                          </div>
                        )}

                        <CertitudeBadge level={f.certitude} />
                        <CrossLinks
                          relatedFiches={f.relatedFiches}
                          relatedQuestions={f.relatedQuestions}
                          relatedCases={f.relatedCases}
                          relatedTerms={f.relatedTerms}
                        />
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
