import React from 'react';
import { reglesOr, pepitesCachees, zonesGrises, ficheThemeLabels, type FicheTheme, type CertitudeLevel } from '@/data/boussoleData';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText, formatInline } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { Lightbulb, Scale, Zap, Gem } from 'lucide-react';
import { Croix } from './Croix';

/**
 * Portage statique de FichesPratiquesSection.tsx (SPA source). Déviations
 * volontaires (page 100 % statique, zéro JS hors îlot boussole) :
 *  - Filtres thème + type (JS, useState) → remplacés par un regroupement
 *    statique par thème (`ficheThemeLabels`), badge de type conservé sur
 *    chaque carte. Tout le contenu reste visible dans le HTML.
 *  - Tri par pertinence profil (selectedProfil) : supprimé (îlot wizard
 *    autonome, ne filtre plus les sections statiques).
 *  - Accordéon (framer-motion) → `<details>/<summary>` natif.
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : des plis `.qa` ; types dans les jetons
 * d'état (règle d'or en ambre, astuce en bleu, débattu en ciel doux). Styles
 * dans src/styles/guide.css.
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
  regle: { icon: Zap, label: "Règle d'or", className: 'wait' },
  pepite: { icon: Gem, label: 'Astuce', className: 'plan' },
  'zone-grise': { icon: Scale, label: 'Débattu', className: 'off' },
};

const impactColors = { faible: 'faible', moyen: 'moyen', fort: 'fort' };

export function FichesPratiquesSection() {
  const allFiches = buildFiches();
  const themes = Object.keys(ficheThemeLabels) as FicheTheme[];
  const grouped = themes
    .map(theme => ({ theme, items: allFiches.filter(f => f.theme === theme) }))
    .filter(g => g.items.length > 0);

  return (
    <section id="fiches" className="gd-sec">
      <div className="wrap">
        <div className="gd-sec-tete">
          <h2 className="gd-h2">
            <Lightbulb className="gd-ic" /> Fiches pratiques
            <span className="gd-compte">({allFiches.length})</span>
          </h2>
          <p className="gd-sous">Règles essentielles, astuces d'optimisation et sujets débattus — tout en un seul endroit</p>
          {/* Introduction visible — cf. Caseopedia, même raison (MIGRATION.md § 9.am). */}
          <div className="gd-intro">
            <p>
              Trois natures de fiches, signalées par leur badge. Les <strong>règles</strong> sont
              les points sur lesquels l'administration ne transige pas : priorité du chiffre
              d'affaires réel sur le SNIR, déclaration sociale due même en micro-BNC, traitement
              des rétrocessions versées et reçues.
            </p>
            <p>
              Les <strong>pépites</strong> rassemblent ce qui se perd faute d'être connu —
              exonérations de permanence des soins, dispositifs zonés, plafonds d'épargne
              retraite reportables. Les <strong>zones grises</strong> assument l'incertitude :
              sujets où la doctrine hésite, où les caisses répondent différemment d'un
              département à l'autre, et où mieux vaut demander un écrit avant de trancher.
            </p>
          </div>
        </div>

        <div className="gd-groupes">
          {grouped.map(({ theme, items }) => (
            <div key={theme}>
              <h3 className="gd-sur">
                {ficheThemeLabels[theme]} <span>({items.length})</span>
              </h3>
              <div className="gd-grille g2">
                {items.map(f => {
                  const tc = typeConfig[f.type];
                  const TypeIcon = tc.icon;
                  return (
                    <details key={f.id} id={f.id} className="qa gd-pli">
                      <summary>
                        <div className="gd-pli-tete">
                          <div className="gd-pli-puces">
                            <span className={`gd-puce ${tc.className}`}>
                              <TypeIcon className="gd-ic" /> {tc.label}
                            </span>
                            {f.impact && (
                              <span className="gd-impact">
                                <span className={`gd-pastille ${impactColors[f.impact]}`} />
                                Impact {f.impact}
                              </span>
                            )}
                          </div>
                          <p className="gd-pli-nom">{f.titre}</p>
                        </div>
                        <Croix />
                      </summary>

                      <div className="gd-pli-in">
                        <FormattedText text={f.description} />

                        {f.type === 'zone-grise' && f.positionA && f.positionB && (
                          <div className="gd-positions">
                            <div className="gd-encart plan">
                              <p className="gd-champ">Position A</p>
                              <p className="gd-petit">{formatInline(f.positionA)}</p>
                            </div>
                            <div className="gd-encart wait">
                              <p className="gd-champ">Position B</p>
                              <p className="gd-petit">{formatInline(f.positionB)}</p>
                            </div>
                          </div>
                        )}

                        {f.exemple && (
                          <div className="gd-encart">
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
