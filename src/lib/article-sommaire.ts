// Les entrées du sommaire d'un article, à partir des `headings` que rend Astro (gabarit src/pages/blog/[slug].astro).
//
//   const { Content, headings, remarkPluginFrontmatter } = await render(post);
//   const entrees = entreesSommaire(headings, remarkPluginFrontmatter?.balisage);
//
// `balisage` vient du plugin src/lib/rehype-article.mjs. Il sert pour `encadre` (un titre suivi d'un seul
// encadré ne se devine pas d'après le texte du titre), pour `sous` (rang 2) et pour les rangs `n` et `np`.
// Sans lui, le reste est recalculé ici d'après le texte, avec les mêmes critères que le plugin.
import { EMO_SRC, roleEmoji, pictoEmoji } from './article-emojis.mjs';

export interface TitreAstro { depth: number; slug: string; text: string }
export interface TitreBalise { slug: string; depth: number; numero: string | null; encadre: boolean; sources: boolean; hippo: boolean; horsCompte?: boolean; n: string | null; np: string | null; sous?: boolean }
export interface DonneesBalisage { titres: TitreBalise[] }
export interface EntreeSommaire {
  /** Ancre du titre, telle qu'Astro la calcule (inchangée). */
  slug: string;
  /** 2 ou 3. */
  depth: number;
  /** Le texte du titre sans son émoji du début ni celui de la fin (le numéro écrit y reste). */
  texte: string;
  /** Le même, sans le numéro écrit (« 1. », « 4.1 », « Étape 1 : »). */
  texteSansNumero: string;
  /** Émoji du début (le premier), ou null. */
  emoji: string | null;
  /** Émoji de la fin, ou null. */
  emojiFin: string | null;
  /** Nom lucide de l'émoji du début (table de src/lib/article-emojis.mjs), ou null. */
  picto: string | null;
  /** Rôle de l'émoji du début : etat, touche, main, note, mascotte, decor ; null sans émoji. */
  role: string | null;
  /** Pour une marque d'état : oui, non, attention. */
  etat: string | null;
  /** Le numéro ÉCRIT par l'auteur (« 1 », « 4.1 »), jamais recalculé ; null si le titre n'est pas numéroté. */
  numero: string | null;
  /** Le titre n'est suivi que d'un encart (R5) : c'est le titre de l'encart. */
  encadre: boolean;
  /** Le titre des sources (R7). */
  sources: boolean;
  /** Section au nom d'Hippodoc (« Le Tips Hippodoc »…). */
  hippo: boolean;
  /** Rang du h2 dans l'article (h3 : « 3.2 »), sources non comptées ; null pour les sources. */
  n: string | null;
  /** Rang du h2 dans le plan : ni les sources, ni les titres d'encart. */
  np: string | null;
  /** Sous-partie numérotée du plan (rang 2, classe t-sous) : en retrait, hors du compte des parties. */
  sous: boolean;
  /** Titre hors du compte du plan (classe t-hors : « Légende », posé sur une légende) : dans le sommaire, sans numéro. */
  horsCompte: boolean;
}

const RE_TETE = new RegExp('^(?:\\s*' + EMO_SRC + ')+\\s*', 'u');
const RE_QUEUE = new RegExp('\\s*(?:' + EMO_SRC + '\\s*)+[\\s.!?]*$', 'u');
const RE_UN = new RegExp(EMO_SRC, 'u');
const RE_NUMERO = /^(\d{1,2}\.\d{1,2}|\d{1,2}[.)])\s+/;
/** Titre des sources : le motif de RE_SOURCES du plugin (src/lib/rehype-article.mjs), qui ne le pose que sur le dernier h2. */
const RE_SOURCES = /^sources(?:\s*(?:\(|&|:|et\b)|$)/i;
const RE_ETAPE = /^[ÉE]tape\s+(\d{1,2})\s*(?:[:—–-]\s*)?/u;

export function entreesSommaire(headings: TitreAstro[], balisage?: DonneesBalisage | null): EntreeSommaire[] {
  const parSlug = new Map((balisage?.titres ?? []).map((t) => [t.slug, t]));
  // Avec le balisage, seuls les titres du corps que le plugin a vus : pas le titre caché des notes de bas de page
  // (« Footnotes », que GFM ajoute dans une <section>), qui serait entré dans le plan et dans son total.
  return headings
    .filter((h) => (h.depth === 2 || h.depth === 3) && (!balisage || parSlug.has(h.slug)))
    .map((h) => {
      const tete = h.text.match(RE_TETE)?.[0] ?? '';
      let reste = h.text.slice(tete.length);
      const queue = reste.match(RE_QUEUE);
      const fin = queue && queue.index ? queue[0] : '';
      if (fin) reste = reste.slice(0, reste.length - fin.length);
      const texte = reste.trim();
      const emoji = tete.match(RE_UN)?.[0] ?? null;
      const r = emoji ? roleEmoji(emoji) : null;
      const chiffre = texte.match(RE_NUMERO);
      const etape = texte.match(RE_ETAPE);
      const numeroEcrit = r?.role === 'touche' ? String(r.n) : chiffre ? chiffre[1].replace(/[.)]$/, '') : etape ? etape[1] : null;
      const s = parSlug.get(h.slug);
      return {
        slug: h.slug,
        depth: h.depth,
        texte,
        texteSansNumero: (chiffre ? texte.slice(chiffre[0].length) : etape ? texte.slice(etape[0].length) : texte).trim(),
        emoji,
        emojiFin: fin.match(RE_UN)?.[0] ?? null,
        picto: emoji ? pictoEmoji(emoji) : null,
        role: r?.role ?? null,
        etat: r?.etat ?? null,
        numero: s?.numero ?? numeroEcrit,
        encadre: s?.encadre ?? false,
        sources: s?.sources ?? RE_SOURCES.test(texte),
        hippo: s?.hippo ?? /hippodoc/i.test(texte),
        n: s?.n ?? null,
        np: s?.np ?? null,
        sous: s?.sous ?? false,
        horsCompte: s?.horsCompte ?? false,
      };
    });
}
