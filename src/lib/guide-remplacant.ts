/**
 * « Le guide du remplaçant » — PDF offert, distribué depuis /guide (MIGRATION.md § 9.di).
 *
 * Source unique : lue par la page, par `pages-lastmod.ts` (sitemap) et par la mesure
 * (`edition` part avec chaque `guide_remplacant_*`, pour séparer les éditions dans
 * PostHog).
 *
 * Nouvelle édition : déposer le PDF dans `public/guide/` sous un NOUVEAU nom, mettre
 * à jour ces valeurs, les visuels de `src/assets/guide/` + `public/guide/partage.jpg`, et
 * le nom de fichier du header `Content-Disposition` (vercel.json).
 * L'URL de la page, /guide, ne change jamais : c'est elle que ManyChat envoie.
 */
import { GUIDE_REMPLACANT_LAST_UPDATED_ISO } from './pages-lastmod';

export const GUIDE_REMPLACANT = {
  pdf: '/guide/guide-du-remplacant-2026-2027.pdf',
  edition: '2026-2027',
  pages: 26,
  poidsKo: 742,
  /** Date « À jour au » imprimée dans le PDF (p. 2 et 26) — définie dans pages-lastmod.ts. */
  misAJourIso: GUIDE_REMPLACANT_LAST_UPDATED_ISO,
  misAJourTexte: '26 septembre 2026',
} as const;
