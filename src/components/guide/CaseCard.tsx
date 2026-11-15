import React from 'react';
import type { CaseInfo } from '@/data/boussoleData';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import { Croix } from './Croix';
import { CertitudeBadge } from './CertitudeBadge';
import { FormattedText } from './FormattedText';
import { CrossLinks } from './CrossLinks';
import { caseAnchor } from '@/lib/guide/anchors';

/**
 * Carte d'une case de formulaire, extraite telle quelle de `CaseopediaSection`
 * pour être partagée entre le hub (/guide-declarations) et les pages filles par
 * formulaire (/guide-declarations/dsfu-pamc, /2042-c-pro…).
 *
 * ⚠️ Le balisage est repris à l'identique : le HTML du hub ne doit pas changer
 * d'un octet à l'extraction. Vérifié par empreinte SHA-256 avant/après dans
 * MIGRATION.md § 9.ap. Toute retouche de style ici se répercute sur les deux
 * surfaces — c'est le but, mais ça se vérifie sur le hub aussi.
 *
 * DA 2026 (phase 5d, MIGRATION.md § 9.el) : un pli `.qa` de la DA (fiche blanche,
 * croix qui tourne). Catégories dans les jetons d'état : fiscal en bleu
 * (`plan`), social en vert (`ok`), administratif en ciel doux (`off`).
 * Styles dans src/styles/guide.css.
 */

export const catColors: Record<CaseInfo['categorie'], string> = {
  fiscal: 'plan',
  social: 'ok',
  administratif: 'off',
};

export const CaseCard: React.FC<{ c: CaseInfo }> = ({ c }) => (
  <details id={caseAnchor(c.code)} className="qa gd-pli">
    <summary>
      <div className="gd-pli-tete">
        <div className="gd-pli-puces">
          <span className="gd-code">{c.code}</span>
          <span className={`gd-puce ${catColors[c.categorie]}`}>{c.categorie}</span>
        </div>
        <p className="gd-pli-nom">{c.nom}</p>
      </div>
      <Croix />
    </summary>
    <div className="gd-pli-in">
      <div><p className="gd-champ">Formulaire</p><p className="gd-valeur">{c.formulaire}</p></div>
      <div><p className="gd-champ">Description</p><FormattedText text={c.description} /></div>
      <div><p className="gd-champ">Qui remplit ?</p><FormattedText text={c.quiRemplit} /></div>
      <div className="gd-encart stop">
        <p className="gd-champ"><AlertTriangle className="gd-ic" /> Erreur fréquente</p>
        <FormattedText text={c.erreurFrequente} />
      </div>
      <div>
        <p className="gd-champ"><Lightbulb className="gd-ic" /> Conseil</p>
        <FormattedText text={c.conseil} />
      </div>
      <CertitudeBadge level={c.certitude} />
      <CrossLinks
        relatedFiches={c.relatedFiches}
        relatedQuestions={c.relatedQuestions}
        relatedTerms={c.relatedTerms}
      />
    </div>
  </details>
);
