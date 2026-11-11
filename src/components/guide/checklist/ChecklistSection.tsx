import React, { useState } from 'react';
import { ChevronDown, FileText, Shield, BadgePercent, Bell } from 'lucide-react';
import type { WizardSection } from '@/data/boussoleData';
import { ChecklistCase } from './ChecklistCase';
import { ChecklistPoint } from './ChecklistPoint';

const SECTION_ICONS = {
  fiscal: FileText,
  exonerations: BadgePercent,
  social: Shield,
  situations: Bell,
} as const;

// DA 2026 (§ 9.el) : la couleur de la pastille d'icône, dans les jetons d'état.
const SECTION_ACCENT = {
  fiscal: 'plan',
  exonerations: 'wait',
  social: 'ok',
  situations: '',
} as const;

interface Props {
  section: WizardSection;
  index: number;
  defaultOpen?: boolean;
}

// Portage : `motion.div` (fade/slide d'entrée) → `div` simple, `AnimatePresence`
// (hauteur animée à l'ouverture) → rendu conditionnel direct. Framer-motion est
// proscrit dans le code porté ; le confort visuel perdu est mineur (pas de
// transition de hauteur), le comportement (ouvrir/fermer) est intact.
export const ChecklistSection: React.FC<Props> = ({ section, index, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = SECTION_ICONS[section.id];
  const accent = SECTION_ACCENT[section.id];
  const important = section.points.filter(p => p.type === 'critical' || p.type === 'warning');
  const secondary = section.points.filter(p => p.type === 'tip' || p.type === 'info');
  // Badge : nombre de cases CERFA à remplir uniquement (pas les alertes)
  const casesCount = section.cases.length;
  const SECONDARY_INLINE_THRESHOLD = 2;
  const inlineSecondary = secondary.length > 0 && secondary.length <= SECONDARY_INLINE_THRESHOLD;

  return (
    <div className={`gd-cl-section ${open ? 'ouvert' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="gd-cl-tete"
      >
        <div className={`gd-rond ${accent}`}>
          <Icon className="gd-ic" />
        </div>
        <div className="gd-cl-titre">
          <div className="gd-cl-ligne">
            <span className="gd-cl-nom">{section.titre}</span>
            {casesCount > 0 && (
              <span
                title={`${casesCount} case${casesCount > 1 ? 's' : ''} à remplir`}
                className="gd-puce off"
              >
                {casesCount}
              </span>
            )}
          </div>
          <p className="gd-petit">{section.sousTitre}</p>
        </div>
        {section.formulairePrincipal && (
          <span className="gd-puce off gd-cl-form">
            {section.formulairePrincipal}
          </span>
        )}
        <ChevronDown
          className={`gd-ic gd-chevron ${open ? 'haut' : ''}`}
        />
      </button>

      {open && (
        <div className="gd-cl-corps">
          {section.cases.length > 0 && (
            <div className="gd-pile serre">
              {section.cases.map(c => (
                <ChecklistCase key={c.code} caseItem={c} />
              ))}
            </div>
          )}
          {important.length > 0 && (
            <div className="gd-pile serre">
              {important.map((p, i) => (
                <ChecklistPoint key={`imp-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
              ))}
            </div>
          )}
          {inlineSecondary && (
            <div className="gd-pile serre">
              {secondary.map((p, i) => (
                <ChecklistPoint key={`sec-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
              ))}
            </div>
          )}
          {!inlineSecondary && secondary.length > 0 && (
            <details className="gd-cl-plus">
              <summary>
                <ChevronDown className="gd-ic gd-chevron" />
                <span>Bon à savoir ({secondary.length})</span>
              </summary>
              <div className="gd-pile serre">
                {secondary.map((p, i) => (
                  <ChecklistPoint key={`sec-${i}`} type={p.type}>{p.texte}</ChecklistPoint>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
