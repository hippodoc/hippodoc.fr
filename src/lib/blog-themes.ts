/**
 * Thèmes du blog (MIGRATION.md § 9.fp) : le classement des articles par sujet.
 *
 * Les trois séries (`seriesId`, `blog-series.ts`) classent par forme et par époque : les
 * fiches numérotées d'Instagram de l'automne 2025, et « divers » pour le reste (affiché
 * « Guides & Conseils »). Un article sur l'impôt pouvait être dans les trois. Les thèmes
 * classent par sujet, dans l'ordre d'une carrière ; chaque article en a un, et un seul
 * (champ `theme` du frontmatter, obligatoire : `src/content.config.ts` refuse un article
 * sans thème ou avec un thème inconnu). Les séries restent : leur numérotation (« Fiche
 * Fiscalité #4 ») est dessinée sur les affiches, et leurs pages restent en ligne.
 *
 * L'ordre du tableau est l'ordre d'affichage partout (/blog, pages de thème, llms.txt).
 *
 * ⚠️ URLs publiques figées : un slug ne se renomme plus une fois en ligne
 * (`/blog/theme/<slug>`, comme les pages de série).
 *
 * Les textes (titre et description de la page, ligne de contexte, introduction) sont les
 * seuls textes nouveaux de § 9.fp, recopiés dans MIGRATION.md pour relecture : sans
 * chiffre, taux, seuil ni date (les articles les portent, ces textes-ci ne vieillissent
 * pas), au tutoiement du blog, et ne nomment que ce que les articles du thème traitent.
 * Texte brut : il est échappé au rendu.
 *
 * `partage` : le fond de l'image de partage des articles du thème (palettes dans
 * `src/lib/image-partage.mjs`, prises dans les jetons de la DA ; aucun jaune).
 */

export const THEME_SLUGS = [
  'debuter-organiser',
  'statut-contrats-revenus',
  'cotisations-protection',
  'impots-declarations',
  'budget-patrimoine',
] as const;

export type ThemeSlug = (typeof THEME_SLUGS)[number];

export interface BlogTheme {
  slug: ThemeSlug;
  /** Le nom affiché (puces, fil d'Ariane, pastille de l'image de partage, `<h1>`). */
  nom: string;
  /** `<title>` de la page de thème (moins de 60 signes, le sujet d'abord). */
  titre: string;
  /** Meta description de la page de thème (150 signes environ). */
  description: string;
  /** La ligne sous le `<h1>`. */
  contexte: string;
  /** L'introduction de la page (deux à quatre phrases), reprise dans llms.txt. */
  introduction: string;
  /** Fond de l'image de partage (clé d'une palette de `image-partage.mjs`). */
  partage: 'sable' | 'ciel' | 'nuit' | 'eau' | 'vert';
}

export const BLOG_THEMES: BlogTheme[] = [
  {
    slug: 'debuter-organiser',
    nom: "Débuter et s'organiser",
    titre: "Débuter et s'organiser comme médecin remplaçant | Hippodoc",
    description:
      "Premier remplacement de médecin : inscriptions à faire avant, checklist du premier jour, où chercher des remplas, prise en main du logiciel du cabinet.",
    contexte: 'Les démarches, les outils et les réflexes de tes premiers remplacements.',
    introduction:
      "Ta licence ou ta thèse en poche, ton premier remplacement approche. Tu trouves ici les démarches à faire avant (Ordre, CPAM, URSSAF, CARMF, assurance RCP), la checklist du jour J, où trouver des remplacements et comment t'y retrouver dans le logiciel métier d'un nouveau cabinet. Puis le quotidien : tes outils, tes messages en attente, les pièges des débuts et le doute qui va avec.",
    partage: 'sable',
  },
  {
    slug: 'statut-contrats-revenus',
    nom: 'Statut, contrats et revenus',
    titre: 'Statut, contrats et revenus du médecin remplaçant',
    description:
      "Médecin remplaçant libéral ou salarié : licence et contrat de remplacement, rétrocession d'honoraires, facture au remplacé, revenus par mode d'exercice.",
    contexte: 'Sous quel statut tu remplaces, ce que tu signes et ce que tu gagnes.',
    introduction:
      "Libéral ou salarié, remplacement ou collaboration : tout part du cadre dans lequel tu exerces. Tu trouves ici la licence de remplacement, le contrat à relire avant de signer, la rétrocession et la façon de la négocier, la facture à envoyer au médecin remplacé et ce que change la facturation électronique. Et pour choisir : ce que rapporte chaque mode d'exercice, le nombre de jours qui te suffit, et le risque de requalification d'un remplacement trop régulier.",
    partage: 'ciel',
  },
  {
    slug: 'cotisations-protection',
    nom: 'Cotisations et protection',
    titre: 'Cotisations et protection du médecin remplaçant | Hippodoc',
    description:
      "Cotisations du médecin remplaçant : URSSAF, RSPM ou régime PAMC, CARMF, régularisation et modulation, prévoyance Madelin, congé maternité ou paternité.",
    contexte: "Ce que tu verses à l'URSSAF et à la CARMF, et ce qui te protège en retour.",
    introduction:
      "L'URSSAF et la CARMF appellent tes cotisations avant de connaître ton revenu, puis régularisent : c'est l'effet ciseaux, et il se prépare. Tu trouves ici le choix entre RSPM et régime PAMC avec des exemples chiffrés, l'affiliation à la CARMF, ce qui sépare les cotisations de l'impôt, la prévoyance (avec ou sans Madelin) et ton congé maternité ou paternité de remplaçant.",
    partage: 'nuit',
  },
  {
    slug: 'impots-declarations',
    nom: 'Impôts et déclarations',
    titre: 'Impôts et déclarations du médecin remplaçant | Hippodoc',
    description:
      "Impôts du médecin remplaçant : micro-BNC ou réel, déclarations 2035 et 2042-C PRO, frais réels déductibles, CFE, exonérations PDSA et FRR, calendrier.",
    contexte: 'Déclarer tes revenus, déduire tes frais, ne rater aucune échéance.',
    introduction:
      "Micro-BNC ou régime réel : ce choix décide de ce que tu déclares et de ce que tu peux déduire. Tu trouves ici la 2035 ligne à ligne et son report sur la 2042-C PRO, la déclaration de l'interne qui remplace, les frais réels du libéral comme du salarié (voiture, repas, chèques-vacances) et la CFE. Puis les allègements d'impôt (gardes de PDSA, zones FRR, outre-mer) et le calendrier de toutes tes échéances.",
    partage: 'eau',
  },
  {
    slug: 'budget-patrimoine',
    nom: 'Budget et patrimoine',
    titre: 'Budget et patrimoine du médecin remplaçant | Hippodoc',
    description:
      "Budget du médecin remplaçant : partir du Super-Net, épargne de précaution, régularisations à prévoir, puis investir en PEA, assurance vie, PER ou CTO.",
    contexte: "Ce qu'il te reste vraiment, et ce que tu en fais.",
    introduction:
      "Ton chiffre d'affaires n'est pas ce que tu peux dépenser : il faut d'abord en retirer les cotisations, l'impôt et les régularisations à venir. Ce qui reste, c'est ton Super-Net. Tu trouves ici comment bâtir ton budget à partir de lui, quelle épargne de précaution garder, puis où placer le reste (PEA, assurance vie, PER ou compte-titres) et pourquoi le temps compte autant que le montant.",
    partage: 'vert',
  },
];

/** Chemin public d'un thème (sans slash final, cf. `trailingSlash: 'never'`). */
export const themePath = (slug: string) => `/blog/theme/${slug}`;

/** Le thème d'un slug (undefined si le slug est inconnu). */
export const themeDe = (slug: string) => BLOG_THEMES.find((t) => t.slug === slug);
