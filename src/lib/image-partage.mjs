/**
 * Image de partage des articles du blog (MIGRATION.md § 9.fl) : 1 200 × 630 px, en JPEG,
 * fabriquée à la construction par `src/pages/blog/partage/[slug].jpg.ts`. Un nouvel article
 * a la sienne sans rien faire. C'est l'`og:image`, la `twitter:image` et la première image
 * du JSON-LD `Article` (les recadrages de l'affiche suivent).
 *
 * Dans la DA 2026 : fond de la série (ciel pour les Fiches Fiscalité, sable pour les Fiches
 * Pratiques, eau profonde pour les Guides & Conseils), pastille de série, titre de l'article,
 * mascotte de l'accueil entière sur un halo, marque, vagues. Aucun jaune (il est réservé au
 * bouton d'essai). Quatre poses de la mascotte tournent dans une série, dans l'ordre des
 * épisodes ; celle qui montre du doigt est retournée vers le titre.
 *
 * sharp seul (déjà installé avec Astro, qui s'en sert pour ses images) ; le texte est
 * composé par Pango avec la police du site en TTF, deux graisses fixes (560 et 720), dans
 * `src/assets/fonts/partage/` (licence : `src/assets/fonts/OFL.txt`). Ces fichiers ne sont
 * jamais servis : ils sont lus par chemin depuis la racine du projet, pas importés (un
 * import les copierait dans le build).
 *
 * Le titre est composé ligne à ligne : le moins de lignes possible dans la colonne, puis
 * les lignes les plus égales ; un mot court (la, du, les, à, ton…) reste avec le mot qui le
 * suit, un nombre avec son unité, une ponctuation haute avec son mot ; jamais un mot seul
 * sur la dernière ligne quand le titre en a trois ou plus ; jamais de coupure à un trait
 * d'union. Deux tailles (72 px jusqu'à quatre lignes, 60 px au-delà). Un caractère que la
 * police n'a pas (émoji) est retiré du titre : sans police de secours sur la machine de
 * construction, il sortirait en carré vide.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export const LARGEUR = 1200;
export const HAUTEUR = 630;

const RACINE = process.cwd();
const police = (poids) => path.join(RACINE, 'src/assets/fonts/partage', `gsf-${poids}.ttf`);
const mascotteFichier = (nom) => path.join(RACINE, 'src/assets/accueil', `mascotte-${nom}.webp`);
for (const f of [police(560), police(720)]) {
  if (!fs.existsSync(f)) throw new Error(`image de partage : police introuvable (${f})`);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const N = ' ';
/** Typographie de l'image seulement (le titre de la page ne change pas). */
const typo = (s) =>
  s
    .replace(/\p{Extended_Pictographic}️?/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/'/g, '’')
    .replace(/"([^"]*)"/g, `«${N}$1${N}»`)
    .replace(/ ([:?!;»])/g, `${N}$1`)
    .replace(/« /g, `«${N}`)
    .replace(/(\d) (\d{3})/g, `$1${N}$2`)
    .replace(/ (€|%)/g, `${N}$1`)
    .replace(/ (\S{1,3})$/u, `${N}$1`);

/* Jetons de la DA (src/styles/da.css) : --sky-1, --sky-2, --sky, --sand, --deep, --deep-2,
   --ink, --ink-2, --brand, --brand-2. Les vagues sont celles du pied de page. */
const THEMES = {
  ciel: { fond: ['#C9DEFF', '#E4EEFF'], encre: '#14254F', pastille: '#FFFFFF', pastilleTexte: '#14254F', halo: '#FFFFFF', haloOp: [0.35, 0.6], vagues: ['#A9CBF8', '#7FAEF0', '#4F88DE'], marque: ['#0059B3', '#1A8CFF'] },
  sable: { fond: ['#FBF6EA', '#F6EEDB'], encre: '#14254F', pastille: '#DCE9FF', pastilleTexte: '#14254F', halo: '#DCE9FF', haloOp: [0.5, 1], vagues: ['#E9DDC0', '#DCCBA5', '#C9B488'], marque: ['#0059B3', '#1A8CFF'] },
  eau: { fond: ['#2A60C4', '#163A88'], encre: '#FFFFFF', pastille: 'rgba(255,255,255,0.16)', pastilleTexte: '#FFFFFF', halo: '#FFFFFF', haloOp: [0.06, 0.1], vagues: ['#3D75D2', '#2A60C4', '#1F4FAF'], marque: ['#FFFFFF', '#B9CCF0'] },
};
const THEME_DE_SERIE = { 'fiche-fiscalite': 'ciel', 'fiche-pratique': 'sable', divers: 'eau' };
/* Poses en pied (le buste de l'accueil, coupé à la poitrine, n'est pas repris : la
   mascotte est toujours entière). `retourner` : elle désigne la gauche, où est le titre. */
const POSES = [
  { nom: 'f-pointe', retourner: true, hauteur: 0.76 },
  { nom: 'f-presente', retourner: false, hauteur: 0.82 }, // en pied, jambes comprises : un peu plus grande
  { nom: 'f-tablette', retourner: false, hauteur: 0.76 },
  { nom: 'f-pouce', retourner: false, hauteur: 0.76 },
];
/** Mots qui ne finissent pas une ligne : ils restent avec le mot suivant. */
const LIANTS = new Set(['le', 'la', 'les', 'l’', 'de', 'des', 'du', 'd’', 'un', 'une', 'à', 'au', 'aux', 'et', 'ou', 'en', 'ton', 'ta', 'tes', 'ce', 'ces', 'son', 'sa', 'ses', 'par', 'pour', 'sur', 'dans', 'avec', 'sans', 'vs', 'ni', 'te', 'se', 'me', 'ne', 'il', 'on', 'tu', 'qu’il', 'qu’on']);

async function texte(markup, poids, corps, largeur) {
  const buf = await sharp({
    text: { text: markup, font: `GSF Hippodoc ${poids} ${corps}`, fontfile: police(poids), width: largeur, dpi: 72, rgba: true, wrap: 'word', align: 'left' },
  }).png().toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

/** Les groupes de mots du titre, qui ne se coupent pas : un mot court avec le mot qui le
    suit, un nombre avec le mot qui le suit (« 8 statuts », « 6 mois »), sauf un mot court
    (« 2026 du médecin » se coupe après « 2026 »). */
function groupes(titre) {
  const brut = typo(titre).split(' ').filter(Boolean);
  const lie = (m, suivant) => {
    const dernier = m.split(N).pop();
    return LIANTS.has(dernier.toLowerCase()) || (/\d$/.test(dernier) && /^\p{L}/u.test(suivant) && !LIANTS.has(suivant.split(N)[0].toLowerCase()));
  };
  const out = [];
  for (let i = 0; i < brut.length; i++) {
    let m = brut[i];
    while (i < brut.length - 1 && lie(m, brut[i + 1])) m += N + brut[++i];
    out.push(m);
  }
  return out;
}

/** La meilleure coupe des groupes en lignes de largeur ≤ L (null si un groupe ne tient pas).
    Critères, dans l'ordre : pas de mot seul sur la dernière ligne (titre de trois mots ou
    plus), le moins de lignes, pas de ligne de moins de 40 % de la plus longue, la plus
    longue ligne la plus courte (au pas de 8 px), puis les lignes les plus égales. */
function couper(ws, larg, esp, L) {
  const n = larg.length;
  const nbMots = ws.join(' ').split(/[ \u00a0]/).length;
  const avant = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
  let meilleure = null;
  for (let masque = 0; masque < 1 << (n - 1); masque++) {
    const lignes = [];
    let cur = [0];
    for (let i = 1; i < n; i++) {
      if (masque & (1 << (i - 1))) { lignes.push(cur); cur = [i]; } else cur.push(i);
    }
    lignes.push(cur);
    const w = lignes.map((l) => l.reduce((t, i) => t + larg[i], 0) + esp * (l.length - 1));
    const max = Math.max(...w), min = Math.min(...w);
    if (max > L) continue;
    const derniere = lignes[lignes.length - 1];
    const orpheline = nbMots >= 3 && lignes.length > 1 && derniere.length === 1 && !ws[derniere[0]].includes(N);
    const courte = lignes.length > 1 && min < 0.4 * max;
    const inegal = w.reduce((t, x) => t + (max - x) ** 2, 0);
    const cout = [orpheline ? 1 : 0, lignes.length, courte ? 1 : 0, Math.ceil(max / 8), inegal];
    if (!meilleure || avant(cout, meilleure.cout)) meilleure = { cout, lignes, orpheline, courte };
  }
  return meilleure;
}

const cacheLargeurs = new Map();
async function largeur(markup, poids, corps) {
  const k = `${markup}|${poids}|${corps}`;
  if (!cacheLargeurs.has(k)) cacheLargeurs.set(k, (await texte(markup, poids, corps, 8000)).w);
  return cacheLargeurs.get(k);
}

/** Le titre composé : une image par ligne, posées l'une sous l'autre. */
async function titreCompose(titre, encre, tailles, L) {
  const ws = groupes(titre);
  const ls = (c) => `letter_spacing="${Math.round(-0.03 * c * 1024)}"`;
  const essais = [];
  for (const c of tailles) {
    const larg = [];
    for (const m of ws) larg.push(await largeur(`<span ${ls(c)}>${esc(m)}</span>`, 720, c));
    const esp = (await largeur(`<span ${ls(c)}>a a</span>`, 720, c)) - (await largeur(`<span ${ls(c)}>aa</span>`, 720, c));
    const coupe = couper(ws, larg, esp, L);
    if (coupe) essais.push({ c, coupe });
  }
  // La plus grande taille qui tient en trois lignes, sans mot seul ni ligne trop courte ;
  // sinon en trois lignes sans mot seul ; en quatre ; sans mot seul ; sinon la plus grande.
  const choix =
    essais.find((e) => !e.coupe.orpheline && !e.coupe.courte && e.coupe.lignes.length <= 3) ??
    essais.find((e) => !e.coupe.orpheline && e.coupe.lignes.length <= 3) ??
    essais.find((e) => !e.coupe.orpheline && e.coupe.lignes.length <= 4) ??
    essais.find((e) => !e.coupe.orpheline) ??
    essais[0];
  if (!choix) throw new Error(`image de partage : titre trop long pour la colonne (${titre})`);
  const { c, coupe } = choix;
  const imgs = [];
  for (const l of coupe.lignes) imgs.push(await texte(`<span foreground="${encre}" ${ls(c)}>${esc(l.map((j) => ws[j]).join(' '))}</span>`, 720, c, 8000));
  const pas = Math.round(c * 1.08);
  return { imgs, pas, h: pas * (imgs.length - 1) + imgs[imgs.length - 1].h };
}

function vague(y, amp, couleur, W, phase = 0) {
  const n = 4, pas = W / n;
  let d = `M${-pas + phase} ${y}`;
  for (let i = -1; i <= n; i++) {
    const x0 = i * pas + phase;
    d += ` C${x0 + pas * 0.25} ${y - amp} ${x0 + pas * 0.75} ${y + amp} ${x0 + pas} ${y}`;
  }
  return `<path d="${d} V4000 H${-pas} Z" fill="${couleur}"/>`;
}

/** La mascotte entière, à la hauteur voulue (bornée en largeur), retournée au besoin. */
async function mascotte(pose, hauteur, largeurMax) {
  let img = sharp(mascotteFichier(pose.nom)).resize({ height: hauteur, width: largeurMax, fit: 'inside' });
  if (pose.retourner) img = img.flop();
  const buf = await img.toBuffer();
  const m = await sharp(buf).metadata();
  return { buf, w: m.width, h: m.height };
}

/**
 * @param {{ titre: string, serie: string, nomSerie: string, numero?: string | null, rang: number }} a
 *   `serie` : seriesId ; `nomSerie` : le nom affiché de la série ; `numero` : « #4 » ;
 *   `rang` : rang de l'article dans sa série (la pose en dépend).
 * @returns {Promise<Buffer>} le JPEG.
 */
export async function imagePartage(a) {
  const W = LARGEUR, H = HAUTEUR;
  const th = THEMES[THEME_DE_SERIE[a.serie] ?? 'eau'];
  const pose = POSES[a.rang % POSES.length];
  const marge = Math.round(W * 0.06);
  // La mascotte entière : 76 % de la hauteur (82 % en pied), les pieds posés sur la
  // première vague (au-dessus des deux vagues de devant), à 3,5 % du bord droit.
  const mas = await mascotte(pose, Math.round(H * pose.hauteur), Math.round(W * 0.4));
  const pied = Math.round(H * 0.875);
  const my = pied - mas.h;
  const mx = W - mas.w - Math.round(W * 0.035);
  const col = Math.min(mx - marge - Math.round(W * 0.025), Math.round(W * 0.6));
  const cx = mx + mas.w / 2, cy = my + mas.h * 0.36, r = Math.max(mas.w * 0.62, H * 0.36);

  const lib = a.nomSerie + (a.numero ? ` · ${a.numero}` : '');
  const pt = await texte(`<span foreground="${th.pastilleTexte}">${esc(lib)}</span>`, 560, Math.round(H * 0.05), col);
  const ppx = Math.round(H * 0.034), ppy = Math.round(H * 0.018);
  const pw = pt.w + 2 * ppx, ph = pt.h + 2 * ppy;
  const tt = await titreCompose(a.titre, th.encre, [0.115, 0.095].map((x) => Math.round(H * x)), col);
  const ecart = Math.round(H * 0.05);
  const bloc = ph + ecart + tt.h;
  const zoneHaut = H * 0.1, zoneBas = H * 0.78;
  const yP = Math.max(Math.round(H * 0.08), Math.round(zoneHaut + (zoneBas - zoneHaut - bloc) / 2));
  const yT = yP + ph + ecart;
  const marque = await texte(`<span foreground="${th.marque[0]}">Hippo</span><span foreground="${th.marque[1]}">doc</span>`, 720, Math.round(H * 0.06), col);

  const fond = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.fond[0]}"/><stop offset="1" stop-color="${th.fond[1]}"/></linearGradient>
<filter id="o" x="-20%" y="-40%" width="140%" height="200%"><feDropShadow dx="0" dy="${H * 0.008}" stdDeviation="${H * 0.01}" flood-color="#0D2869" flood-opacity="0.16"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<circle cx="${cx}" cy="${cy}" r="${r * 1.22}" fill="${th.halo}" opacity="${th.haloOp[0]}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.94}" fill="${th.halo}" opacity="${th.haloOp[1]}"/>
${vague(H - H * 0.13, H * 0.03, th.vagues[0], W, 0)}
<rect x="${marge}" y="${yP}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="${th.pastille}" ${th.pastille === '#FFFFFF' ? 'filter="url(#o)"' : ''}/>
</svg>`;
  const devant = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${vague(H - H * 0.085, H * 0.028, th.vagues[1], W, W * 0.11)}${vague(H - H * 0.04, H * 0.022, th.vagues[2], W, W * 0.2)}</svg>`;
  return sharp(Buffer.from(fond))
    .composite([
      { input: mas.buf, left: mx, top: my },
      { input: Buffer.from(devant), left: 0, top: 0 },
      { input: pt.buf, left: marge + ppx, top: yP + ppy },
      ...tt.imgs.map((im, i) => ({ input: im.buf, left: marge, top: yT + i * tt.pas })),
      { input: marque.buf, left: marge, top: H - Math.round(H * 0.085) - marque.h },
    ])
    .flatten({ background: th.fond[1] })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
