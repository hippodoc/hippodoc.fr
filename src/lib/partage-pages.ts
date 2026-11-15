/**
 * Images de partage des pages (MIGRATION.md § 9.ha) : l'aperçu d'un lien vers une page du site
 * (Facebook, LinkedIn, WhatsApp, iMessage, X), 1 200 × 630 px en JPEG.
 *
 * Avant : toutes les pages sauf trois partageaient une capture de l'ancienne app (illisible en
 * vignette), `/simulateur` une capture de l'ancien site, `/guide` un visuel de l'ancienne charte.
 *
 * - L'accueil a une image à part, faite avec le gabarit « bannière » de la DA (ciel, soleil, eau,
 *   le buste de la mascotte) : `public/partage/accueil-<empreinte>.jpg`. C'est aussi l'image des
 *   pages qui n'en déclarent pas (404).
 * - Chaque autre page a la sienne, fabriquée à la construction par le générateur des articles
 *   (`src/lib/image-partage.mjs`, `src/pages/partage/[nom].jpg.ts`) : pastille, titre, mascotte,
 *   marque, vagues. Le fond dit le propos, comme sur le site : ciel pour une annonce, sable pour une
 *   explication, eau profonde pour ce qu'Hippodoc calcule ; une page de thème du blog prend le fond
 *   de ses articles. La pose dit la page ; lui et elle alternent ; aucune n'est retournée.
 * - Textes : ceux de la page (son `<h1>`, ou son nom dans le menu pour la pastille), raccourcis
 *   quand le `<h1>` est trop long pour une vignette. Écarts listés en § 9.ha.
 *
 * Une page qui n'est pas ici prend l'image de l'accueil : `verify-site.mjs` (« 4 octodecies ») échoue
 * si une page du sitemap n'a pas d'image à elle (hors accueil). Une page ajoutée au site s'ajoute ici.
 * L'adresse porte une empreinte (texte, fond, pose, code du générateur) : un aperçu déjà vu par
 * Facebook ou WhatsApp ne garde pas l'ancienne image.
 */
import { nomImagePartage } from './image-partage.mjs';
import { BLOG_THEMES, themePath } from './blog-themes';
import { GUIDE_REMPLACANT } from './guide-remplacant';
import { SITE_URL } from './site';

export interface PartagePage {
  /** La pastille, au-dessus du titre. */
  libelle: string;
  titre: string;
  fond: 'ciel' | 'sable' | 'eau' | 'nuit' | 'vert';
  /** La mascotte : `src/assets/accueil/mascotte-<pose>.webp` ou `src/assets/partage/mascotte-<pose>.webp`.
      Une pose qui regarde ou désigne la droite n'y va pas (elle est à droite du titre, jamais retournée). */
  pose: string;
  /** Hauteur de la mascotte, en part de l'image (0,8 par défaut ; moins pour une pose large, qui
      prendrait la place du titre : 0,66 pour « par ici » et la lecture). */
  hauteur?: number;
  /** Pose en pied ou assise : la part du haut gardée (son bas passe sous les vagues, § 9.ha). */
  garde?: number;
  /** Texte alternatif, quand « titre (pastille, Hippodoc) » se lit mal. */
  alt?: string;
}

/** L'image de l'accueil (gabarit « bannière » de la DA, rendu une fois : § 9.ha). */
export const IMAGE_ACCUEIL = {
  url: `${SITE_URL}/partage/accueil-f5111c3b.jpg`,
  width: 1200,
  height: 630,
  alt: "Hippodoc, logiciel de gestion pour médecin remplaçant : « Sors la tête de l'eau »",
};

const DECLARATIONS = 'Guide des déclarations';
const LEGAL = 'Informations légales';
/** En pied : coupée aux genoux par les vagues, comme par le bord du cadre (`en-pied` de la DA). */
const EN_PIED = { garde: 0.7 };

/** La pose de chaque page de thème du blog : ce dont parle le thème. */
const POSE_THEME: Record<string, Pick<PartagePage, 'pose' | 'garde'>> = {
  'debuter-organiser': { pose: 'f-marche', ...EN_PIED }, // un parcours, une étape
  'statut-contrats-revenus': { pose: 'bras-croises' }, // une affirmation, « on s'en occupe »
  'cotisations-protection': { pose: 'f-reflexion' }, // une question
  'impots-declarations': { pose: 'calcul' }, // un calcul
  'budget-patrimoine': { pose: 'f-pouce' }, // ce qu'il te reste
};

/** Chemin de la page (comme la prop `path` de BaseLayout) → ce que montre son image. */
export const PARTAGE_PAGES: Record<string, PartagePage> = {
  '/simulateur': { libelle: 'Simulateur gratuit', titre: 'Super-Net : ton revenu net de médecin', fond: 'eau', pose: 'f-pouce' },
  '/tarifs': { libelle: 'Tarifs', titre: 'Un outil pro, à un prix humain', fond: 'ciel', pose: 'f-presente', ...EN_PIED },
  '/faq': { libelle: 'FAQ', titre: 'Toutes tes questions sur Hippodoc', fond: 'sable', pose: 'f-reflexion' },
  '/qui-sommes-nous': { libelle: 'Qui sommes-nous', titre: "Hippodoc est né d'une question : « combien je gagne vraiment ? »", fond: 'ciel', pose: 'bras-croises' },
  // Le <h1> en deux : sa première phrase en pastille (en titre, il coupait « c'est / bien »).
  '/essai': { libelle: "Remplacer, c'est bien.", titre: "Savoir ce que ça te rapporte vraiment, c'est mieux.", fond: 'ciel', pose: 'salut', alt: "Remplacer, c'est bien. Savoir ce que ça te rapporte vraiment, c'est mieux. 30 jours gratuits sur Hippodoc" },
  '/comparatif': { libelle: 'Comparatif des logiciels', titre: 'Indy, Pennylane, Hiway Care ou Hippodoc ?', fond: 'sable', pose: 'reflexion' },
  '/guide': { libelle: `PDF gratuit · Édition ${GUIDE_REMPLACANT.edition}`, titre: 'Le guide du médecin remplaçant', fond: 'sable', pose: 'f-checklist' },
  '/guide-declarations': { libelle: DECLARATIONS, titre: 'Tes déclarations fiscales et sociales, enfin claires', fond: 'sable', pose: 'checklist' },
  '/guide-declarations/medecin-remplacant': { libelle: DECLARATIONS, titre: 'Déclarations du médecin remplaçant', fond: 'sable', pose: 'f-marche', ...EN_PIED },
  '/guide-declarations/dsfu-pamc': { libelle: DECLARATIONS, titre: 'DSFU (ex DS-PAMC) : les 15 cases décryptées', fond: 'sable', pose: 'par-ici', hauteur: 0.66, ...EN_PIED },
  '/guide-declarations/2042-c-pro': { libelle: DECLARATIONS, titre: '2042-C-PRO du médecin : les 5 cases qui comptent', fond: 'sable', pose: 'f-par-ici', hauteur: 0.66, ...EN_PIED },
  '/guide-declarations/calculette': { libelle: 'Calculette fiscale', titre: 'Ta 2042-C PRO et ta DSFU pré-remplies en 2 minutes', fond: 'eau', pose: 'calcul' },
  '/blog': { libelle: 'Blog', titre: 'Le blog des médecins remplaçants', fond: 'ciel', pose: 'lecture', hauteur: 0.66, garde: 0.78 },
  ...Object.fromEntries(
    BLOG_THEMES.map((t) => [themePath(t.slug), { libelle: 'Blog', titre: t.nom, fond: t.partage, ...POSE_THEME[t.slug] } satisfies PartagePage]),
  ),
  '/mentions-legales': { libelle: LEGAL, titre: 'Mentions légales', fond: 'sable', pose: 'f-bras-croises' },
  '/politique-confidentialite': { libelle: LEGAL, titre: 'Politique de confidentialité', fond: 'sable', pose: 'f-bras-croises' },
  '/rgpd': { libelle: LEGAL, titre: 'Charte de conformité RGPD', fond: 'sable', pose: 'f-bras-croises' },
  '/conditions-utilisations': { libelle: LEGAL, titre: "Conditions générales d'utilisation et de vente", fond: 'sable', pose: 'f-bras-croises' },
};

/** Le nom de fichier (sans extension) de l'image d'une page : <chemin à plat>-<empreinte>. */
export const nomPartagePage = (chemin: string, p: PartagePage) =>
  nomImagePartage(chemin.slice(1).replace(/\//g, '--'), p);

/** L'image de partage d'une page : la sienne, ou celle de l'accueil. */
export function imagePartagePage(chemin: string) {
  const p = PARTAGE_PAGES[chemin];
  if (!p) return IMAGE_ACCUEIL;
  return {
    url: `${SITE_URL}/partage/${nomPartagePage(chemin, p)}.jpg`,
    width: 1200,
    height: 630,
    alt: p.alt ?? `${p.titre} (${p.libelle}, Hippodoc)`,
  };
}
