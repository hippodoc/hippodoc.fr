import React from 'react';

/**
 * La croix des plis de la DA 2026 (da.css, `.qa > summary > svg`) : elle tourne
 * de 45° et passe au jaune quand le pli s'ouvre. Décor : `aria-hidden`.
 * Même dessin que sur l'accueil, /tarifs, /faq et /simulateur.
 */
export const Croix: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M9 3v12M3 9h12" />
  </svg>
);
