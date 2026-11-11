import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle2, FileStack, UserCircle2 } from 'lucide-react';
import type { WizardResultGrouped, WizardCase } from '@/data/boussoleData';
import { reglesOr } from '@/data/boussoleData';
import { ChecklistSection } from './ChecklistSection';
import { scrollToCase } from './scrollToCase';
import { formatInline } from '../FormattedText';

interface Props {
  result: WizardResultGrouped;
}

const CHIPS_INITIAL = 8;

// Portage : framer-motion retiré (motion.div → div simple). Le reste de la
// logique (auto-scroll au montage, sections repliables, chips de cases…)
// est identique à la source.
export const ChecklistResult: React.FC<Props> = ({ result }) => {
  const { resume, sections, reglesPertinentes, conseilsProfil } = result;
  const sectionsCount = sections.length;
  // P4 : ne pas auto-ouvrir une section sans contenu visible immédiat (cases ou alertes)
  const hasVisibleContent = (i: number) => {
    const s = sections[i];
    if (!s) return false;
    const important = s.points.filter(p => p.type === 'critical' || p.type === 'warning').length;
    return s.cases.length > 0 || important > 0;
  };
  const isDefaultOpen = (i: number) => (sectionsCount <= 3 || i < 2) && hasVisibleContent(i);

  // Flatten all cases in display order (section order × case.ordre)
  const allCases: WizardCase[] = useMemo(
    () => sections.flatMap(s => [...s.cases].sort((a, b) => a.ordre - b.ordre)),
    [sections]
  );
  const [showAllChips, setShowAllChips] = useState(false);
  const visibleChips = showAllChips ? allCases : allCases.slice(0, CHIPS_INITIAL);
  const hiddenCount = allCases.length - visibleChips.length;

  // Pas de défilement au montage : c'est `BoussoleWizard` qui place la page à chaque
  // changement d'étape (un seul défilement, sous la barre de recherche). La marge de
  // défilement de la racine ne sert plus à ce défilement.
  // DA 2026 (phase 5d, MIGRATION.md § 9.el) : classes `gd-cl-*` de src/styles/guide.css.

  return (
    <div
      className="gd-cl"
      role="region"
      aria-live="polite"
      aria-label="Ta checklist personnalisée"
    >
      {/* Header */}
      <div className="gd-cl-haut">
        <h3 className="gd-etape-titre">
          <CheckCircle2 className="gd-ic ok" />
          Ta checklist personnalisée
        </h3>
      </div>

      {/* HERO — En bref (+ conseils profil repliés) */}
      <div className="gd-cl-bref">
        <div className="gd-cl-bref-tete">
          <p className="gd-sur">En bref</p>
          <div className="gd-cl-bref-compte">
            <FileStack className="gd-ic" />
            <span>
              <strong>{resume.cases}</strong> {resume.cases > 1 ? 'cases' : 'case'}
              {' '}sur <strong>{resume.formulaires}</strong> {resume.formulaires > 1 ? 'formulaires' : 'formulaire'}
            </span>
          </div>
        </div>

        {allCases.length > 0 && (
          <div className="gd-cl-codes">
            {visibleChips.map(c => (
              <button
                key={c.code}
                onClick={() => scrollToCase(c.code)}
                title={`${c.nom} — ${c.formulaire}`}
                className="gd-cl-code"
              >
                {c.code}
              </button>
            ))}
            {hiddenCount > 0 && !showAllChips && (
              <button
                onClick={() => setShowAllChips(true)}
                className="gd-cl-code plus"
              >
                +{hiddenCount}
              </button>
            )}
          </div>
        )}

        {conseilsProfil && (
          <details className="gd-cl-conseils">
            <summary>
              <span className="gd-cl-conseils-tete">
                <UserCircle2 className="gd-ic" />
                <span className="gd-cl-conseils-txt">
                  <span className="gd-cl-nom">Conseils pour ton profil</span>
                  <span className="gd-cl-conseils-profil">
                    <span className="gd-cl-conseils-sep">· </span>{conseilsProfil.nom}
                  </span>
                </span>
              </span>
              <ChevronRight className="gd-ic gd-chevron droite" />
            </summary>
            <ul className="gd-tirets large">
              {conseilsProfil.conseils.map((c, i) => (
                <li key={i}>
                  <span className="gd-tiret">•</span>
                  <span>{formatInline(c)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Sections */}
      <div className="gd-pile">
        {sections.map((s, i) => (
          <ChecklistSection key={s.id} section={s} index={i} defaultOpen={isDefaultOpen(i)} />
        ))}
      </div>

      {/* Règles d'or condensées */}
      {reglesPertinentes.length > 0 && (
        <details className="gd-cl-regles">
          <summary>
            <span>Règles d'or à retenir ({reglesPertinentes.length})</span>
            <ChevronRight className="gd-ic gd-chevron droite" />
          </summary>
          <ul className="gd-tirets">
            {reglesPertinentes.map(rId => {
              const r = reglesOr.find(x => x.id === rId);
              if (!r) return null;
              return (
                <li key={rId}>
                  <CheckCircle2 className="gd-ic ok" />
                  <span>{r.titre}</span>
                </li>
              );
            })}
          </ul>
        </details>
      )}

      {/* CTA */}
      <div className="gd-cl-suite">
        <Button
          size="sm"
          onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}
          className="gd-bouton encre"
        >
          <span className="gd-tel">Voir mes cases</span>
          <span className="gd-ordi">Voir mes cases en détail dans la page</span>
          <ChevronRight className="gd-ic" />
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="gd-cl-avis">
        Cette checklist est indicative et fondée sur les règles fiscales en vigueur. Elle ne remplace pas l'avis de ton AGA, expert-comptable ou des services fiscaux. En cas de doute, fais-toi accompagner.
      </p>
    </div>
  );
};
