/**
 * Recherche dans les articles du blog (§ 9.db).
 *
 * Logique pure, partagée entre le build (`/blog/recherche.json` y normalise les
 * textes une fois pour toutes) et le navigateur (champ de recherche de /blog,
 * chargé au premier focus). Aucune dépendance : 46 articles se filtrent en
 * mémoire en moins d'une milliseconde.
 */

export interface EntreeRecherche {
  /** Slug d'URL. */
  s: string;
  /** Titre affiché. */
  t: string;
  /** Série (nom affiché). */
  se: string;
  /** Temps de lecture. */
  r: string;
  /** Titre normalisé (pèse plus dans le classement). */
  nt: string;
  /** Reste du texte normalisé : description, série, catégorie, mots-clés, questions de FAQ,
   *  intertitres et bloc « L'essentiel » de l'article. */
  h: string;
}

export interface Resultat {
  entree: EntreeRecherche;
  score: number;
}

/** Minuscules, sans accents ni ponctuation : « Chèques-vacances » → « cheques vacances ». */
export function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9€%]+/g, ' ')
    .trim();
}

/** Mots vides : une question tapée en entier (« comment remplir la dsfu ») doit marcher. */
const MOTS_VIDES = new Set(
  ('a au aux avec ce ces comment dans de des du elle en est et faire faut il je la le les leur ma mes mon ne on ou par pas pour ' +
    'quand que quel quelle quels qui quoi sa se ses son sur ta tes ton tu un une vos votre')
    .split(' '),
);

/**
 * Synonymes du métier : chaque terme d'un groupe trouve les articles qui emploient
 * n'importe quel autre terme du groupe. Écrits sous forme normalisée.
 */
const SYNONYMES: string[][] = [
  ['dsfu', 'ds pamc', 'dspamc', 'declaration sociale'],
  ['ir', 'impot', 'impots', 'fiscal', 'fiscalite'],
  ['carmf', 'retraite'],
  ['urssaf', 'cotisation', 'cotisations'],
  ['ancv', 'cheques vacances', 'cheque vacances'],
  ['pdsa', 'garde', 'gardes', 'permanence des soins'],
  ['micro', 'micro bnc', 'microbnc'],
  ['2035', 'declaration controlee', 'bnc reel'],
  ['maternite', 'paternite', 'grossesse'],
  ['rspm', 'regime simplifie'],
  // « reunion » exclu : il trouvait aussi les réunions (rendez-vous).
  ['dom', 'outre mer', 'drom', 'guadeloupe', 'martinique', 'guyane', 'mayotte'],
  ['retrocession', 'retrocessions', 'redevance'],
  ['interne', 'internes', 'internat'],
  ['facture', 'factures', 'facturation'],
  ['epargne', 'investir', 'investissement', 'placement', 'placements'],
];
const GROUPE = new Map<string, string[]>();
for (const groupe of SYNONYMES) for (const terme of groupe) GROUPE.set(terme, groupe);

/** Termes courts : cherchés comme mots entiers, sinon « ir » trouverait « revenir ». */
function contient(texte: string, terme: string): boolean {
  if (terme.length <= 3) return ` ${texte} `.includes(` ${terme} `);
  return texte.includes(terme);
}

/** Expressions de plusieurs mots, reconnues avant le découpage (« ds pamc », « cheques vacances »). */
const EXPRESSIONS = [...GROUPE.keys()].filter((t) => t.includes(' ')).sort((a, b) => b.length - a.length);

/** Découpe la requête en termes utiles, chacun avec ses synonymes. */
export function termes(requete: string): string[][] {
  let reste = ` ${normaliser(requete)} `;
  const trouves: string[][] = [];
  for (const expr of EXPRESSIONS) {
    if (reste.includes(` ${expr} `)) {
      trouves.push(GROUPE.get(expr)!);
      reste = reste.replace(` ${expr} `, ' ');
    }
  }
  const mots = reste.split(' ').filter((m) => m && !MOTS_VIDES.has(m));
  return [...trouves, ...mots.map((m) => GROUPE.get(m) ?? [m])];
}

function scoreTerme(e: EntreeRecherche, alternatives: string[]): number {
  if (alternatives.some((a) => contient(e.nt, a))) return 3;
  if (alternatives.some((a) => contient(e.h, a))) return 1;
  return 0;
}

/**
 * Tous les termes doivent être trouvés (ET) ; à défaut, on se rabat sur les
 * articles qui en contiennent au moins un (OU), marqués `approchant`.
 * L'ordre d'entrée (du plus récent au plus ancien) départage les égalités.
 */
export function chercher(
  index: EntreeRecherche[],
  requete: string,
): { resultats: Resultat[]; approchant: boolean } {
  const ts = termes(requete);
  if (ts.length === 0) return { resultats: [], approchant: false };
  const notes = index.map((entree) => {
    const scores = ts.map((alt) => scoreTerme(entree, alt));
    return { entree, scores, score: scores.reduce((a, b) => a + b, 0) };
  });
  const tous = notes.filter((n) => n.scores.every((s) => s > 0));
  const trie = (l: typeof notes) => l.sort((a, b) => b.score - a.score).map(({ entree, score }) => ({ entree, score }));
  if (tous.length > 0) return { resultats: trie(tous), approchant: false };
  const partiels = trie(notes.filter((n) => n.score > 0));
  return { resultats: partiels, approchant: partiels.length > 0 };
}
