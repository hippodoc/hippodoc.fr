/**
 * Slugs d'URL des pages de série du blog.
 *
 * Séparé de `blog-series.ts`, qui est GÉNÉRÉ depuis la SPA source et porte la
 * mention « ne pas éditer à la main » : y ajouter un champ le ferait écraser au
 * prochain import. Les identifiants internes (`fiche-pratique`…) restent la clé
 * de `seriesId` dans le frontmatter des articles ; seule l'URL publique change.
 *
 * ⚠️ URLs publiques figées : ces slugs ne doivent plus être renommés une fois en
 * ligne (une page de série indexée est une porte d'entrée SEO au même titre
 * qu'un article).
 */
import { blogSeries, type BlogSeries } from './blog-series';

export const SERIES_SLUGS: Record<string, string> = {
  'fiche-pratique': 'fiches-pratiques',
  'fiche-fiscalite': 'fiches-fiscalite',
  divers: 'guides-conseils',
};

/** Chemin public d'une série (sans slash final, cf. `trailingSlash: 'never'`). */
export const seriesPath = (seriesId: string) => `/blog/serie/${SERIES_SLUGS[seriesId]}`;

/**
 * Texte d'introduction propre à chaque page de série.
 *
 * Sans lui, ces pages n'avaient qu'UNE phrase à elles (la `description` de la
 * série) pour ~280 mots au total, le reste étant les cartes et la navigation :
 * Google traite ce type de page comme à faible valeur. Chaque texte décrit le
 * contenu réel de sa série et renvoie vers les deux autres — ce qui étoffe aussi
 * le maillage entre pages de catégorie.
 *
 * HTML de confiance, écrit à la main et rendu via `set:html` (aucune saisie
 * utilisateur n'entre ici).
 */
export const SERIES_INTROS: Record<string, string> = {
  'fiche-pratique': `Cette série couvre le concret du remplacement : obtenir sa
    <strong>licence de remplacement</strong>, signer un <strong>contrat conforme</strong>,
    préparer son premier jour, choisir ses outils et trouver des missions. Ce sont des
    fiches courtes — 2 à 6 minutes — pensées pour être lues juste avant d'en avoir
    besoin : la veille d'un premier remplacement, au moment de signer, ou en découvrant
    le logiciel d'un nouveau cabinet. Aucune notion comptable n'est requise.
    <br /><br />
    Si tu débutes, l'ordre le plus logique est celui des démarches : d'abord
    <a href="/blog/obtenir-sa-licence-de-remplacement">obtenir ta licence de
    remplacement</a>, ensuite <a href="/blog/trouver-facilement-tes-remplacements-medicaux">trouver
    tes premiers remplacements</a>, puis <a href="/blog/signer-contrat-remplacement">vérifier
    le contrat avant de signer</a>, et enfin la
    <a href="/blog/checklist-premier-jour-remplacement">checklist du premier jour</a>. Si tu
    cherches plutôt à comprendre tes cotisations ou ta déclaration, va voir les
    <a href="/blog/serie/fiches-fiscalite">Fiches Fiscalité</a>.`,

  'fiche-fiscalite': `Cette série explique, une notion à la fois, ce qui détermine ce
    qu'il te reste vraiment : l'<strong>URSSAF</strong> et la <strong>CARMF</strong>, le
    choix entre <strong>micro-BNC et régime réel</strong>, la <strong>déclaration
    2035</strong>, les charges déductibles, l'exonération <strong>PDSA</strong> et le
    calendrier des échéances. Chaque fiche traite un sujet et s'arrête là — 4 à
    7 minutes pour la plupart, davantage pour le guide des impôts des internes qui
    remplacent. L'objectif n'est pas de te transformer en comptable, mais de te
    permettre de vérifier ce qu'on te dit et d'anticiper au lieu de subir. Pour les
    démarches elles-mêmes, voir les
    <a href="/blog/serie/fiches-pratiques">Fiches Pratiques</a>.`,

  divers: `La série la plus large du blog : elle part des questions que personne ne pose
    à la fac. Quel <strong>statut</strong> choisir, ce que rapporte réellement un
    remplacement, comment se comparent <strong>salariat et libéral</strong>, quels
    <strong>frais professionnels</strong> sont déductibles, ce qu'il reste après
    cotisations et impôt — puis ce qu'on en fait : budget, épargne, enveloppes
    d'investissement. On y traite aussi la maternité et la paternité du remplaçant,
    l'organisation au quotidien et le syndrome de l'imposteur. Les formats vont de
    2 minutes à des guides de 22 minutes sur les frais professionnels. Les notions
    fiscales sont détaillées dans les
    <a href="/blog/serie/fiches-fiscalite">Fiches Fiscalité</a>.`,
};

/** Série correspondant à un slug d'URL, ou undefined si le slug est inconnu. */
export function seriesFromSlug(slug: string): BlogSeries | undefined {
  const id = Object.keys(SERIES_SLUGS).find((k) => SERIES_SLUGS[k] === slug);
  return id ? blogSeries.find((s) => s.id === id) : undefined;
}
