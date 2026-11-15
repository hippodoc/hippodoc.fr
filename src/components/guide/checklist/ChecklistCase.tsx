import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { WizardCase } from '@/data/boussoleData';
import { scrollToCase } from './scrollToCase';

interface Props {
  caseItem: WizardCase;
}

export const ChecklistCase: React.FC<Props> = ({ caseItem }) => {
  const handleClick = () => scrollToCase(caseItem.code);

  return (
    <button
      onClick={handleClick}
      className="gd-cl-case"
    >
      <span className="gd-code">
        {caseItem.code}
      </span>
      <span className="gd-cl-case-nom">{caseItem.nom}</span>
      <span className="gd-cl-case-form">{caseItem.formulaire}</span>
      <ChevronRight className="gd-ic" />
    </button>
  );
};
