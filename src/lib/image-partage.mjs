/**
 * Image de partage des articles du blog (MIGRATION.md § 9.fl) : 1 200 × 630 px, en JPEG,
 * fabriquée à la construction par `src/pages/blog/partage/[slug].jpg.ts`. Un nouvel article
 * a la sienne sans rien faire. C'est l'`og:image`, la `twitter:image` et la première image
 * du JSON-LD `Article` (les recadrages de l'affiche suivent).
 *
 * Dans la DA 2026 : fond du thème de l'article (§ 9.fp ; de la série avant), pastille du
 * thème, titre de l'article, mascotte de l'accueil entière sur un halo, marque, vagues. Cinq
 * fonds, un par thème, pris dans les jetons de la DA (`partage` dans src/lib/blog-themes.ts) :
 * sable (Débuter et s'organiser), ciel (Statut, contrats et revenus), nuit (Cotisations et
 * protection), eau profonde (Impôts et déclarations), vert (Budget et patrimoine). Aucun
 * jaune (il est réservé au bouton d'essai). Quatre poses de la mascotte tournent dans un
 * thème, dans l'ordre de sa page (le plus récent d'abord) : deux voisins n'ont pas la même ;
 * celle qui montre du doigt est retournée vers le titre.
 *
 * sharp seul (déjà installé avec Astro, qui s'en sert pour ses images) ; le texte est
 * composé par Pango avec la police du site en TTF, deux graisses fixes (560 et 720), dans
 * `src/assets/fonts/partage/` (licence : `src/assets/fonts/OFL.txt`). Ces fichiers ne sont
 * jamais servis : ils sont lus par chemin depuis la racine du projet, pas importés (un
 * import les copierait dans le build).
 *
 * Le titre est coupé en lignes ici (Pango ne fait que les poser, sur des lignes de base
 * régulières) : le moins de lignes possible dans la colonne, puis les lignes les plus égales ;
 * un mot court (la, du, les, à, ton…) reste avec le mot qui le suit, un nombre avec son unité,
 * une ponctuation haute avec son mot ; jamais un mot seul sur la dernière ligne quand le titre
 * en a trois ou plus ; jamais de coupure à un trait d'union. Trois tailles (72, 60 et 50 px) :
 * la plus grande qui tient en trois lignes sans défaut, sinon en quatre ; la hauteur du titre
 * est bornée (il ne descend jamais sur les vagues ni sur la marque). Un titre qui ne tient pas,
 * même en 50 px, est coupé à un mot, suivi de « … », avec un avertissement à la construction
 * (l'og:title garde le titre entier). Un caractère que la police n'a pas (émoji) est retiré du
 * titre : sans police de secours sur la machine de construction, il sortirait en carré vide.
 *
 * L'adresse de l'image porte une empreinte (`nomImagePartage`) : de son texte, de la pose et
 * de ce fichier. Un aperçu de lien (LinkedIn, Facebook, WhatsApp) garde l'image d'une adresse des
 * jours durant ; un titre retouché, ou un dessin changé ici, donne une nouvelle adresse.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { BLOG_THEMES } from './blog-themes.ts';
import { byNewest } from './blog-sort.ts';

export const LARGEUR = 1200;
export const HAUTEUR = 630;

const RACINE = process.cwd();
const police = (poids) => path.join(RACINE, 'src/assets/fonts/partage', `gsf-${poids}.ttf`);
const mascotteFichier = (nom) => path.join(RACINE, 'src/assets/accueil', `mascotte-${nom}.webp`);
for (const f of [police(560), police(720)]) {
  if (!fs.existsSync(f)) throw new Error(`image de partage : police introuvable (${f})`);
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const N = '\u00A0';
/** Typographie de l'image seulement (le titre de la page ne change pas). */
const typo = (s) =>
  s
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
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
   --ink, --ink-2, --brand, --brand-2, --on-deep-3, --ok-bg (le vert pâle des coches), --w1 à --w4.
   Les vagues sont celles du pied de page, ou leurs teintes sur un fond sable, nuit ou vert. */
const FONDS = {
  ciel: { fond: ['#C9DEFF', '#E4EEFF'], encre: '#14254F', pastille: '#FFFFFF', pastilleTexte: '#14254F', halo: '#FFFFFF', haloOp: [0.35, 0.6], vagues: ['#A9CBF8', '#7FAEF0', '#4F88DE'], marque: ['#0059B3', '#1A8CFF'] },
  sable: { fond: ['#FBF6EA', '#F6EEDB'], encre: '#14254F', pastille: '#DCE9FF', pastilleTexte: '#14254F', halo: '#DCE9FF', haloOp: [0.5, 1], vagues: ['#E9DDC0', '#DCCBA5', '#C9B488'], marque: ['#0059B3', '#1A8CFF'] },
  eau: { fond: ['#2A60C4', '#163A88'], encre: '#FFFFFF', pastille: 'rgba(255,255,255,0.16)', pastilleTexte: '#FFFFFF', halo: '#FFFFFF', haloOp: [0.06, 0.1], vagues: ['#3D75D2', '#2A60C4', '#1F4FAF'], marque: ['#FFFFFF', '#B9CCF0'] },
  nuit: { fond: ['#14254F', '#1B3167'], encre: '#FFFFFF', pastille: 'rgba(255,255,255,0.14)', pastilleTexte: '#FFFFFF', halo: '#4F88DE', haloOp: [0.12, 0.2], vagues: ['#1F3A78', '#163A88', '#2A60C4'], marque: ['#FFFFFF', '#B9CCF0'] },
  vert: { fond: ['#DFF3E7', '#EEF8F2'], encre: '#14254F', pastille: '#FFFFFF', pastilleTexte: '#14254F', halo: '#FFFFFF', haloOp: [0.4, 0.7], vagues: ['#C5E7D2', '#A6D9BA', '#82C59E'], marque: ['#0059B3', '#1A8CFF'] },
};
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

/**
 * Ce que montre l'image de chaque article, et donc son empreinte : Map slug → { titre, theme, libelle, fond, rang }.
 * `libelle` est le nom du thème de l'article (« Impôts et déclarations », § 9.fp) ; `fond`, sa palette ; `rang`, le
 * rang de l'article dans la page de son thème (le plus récent d'abord) : deux articles voisins n'ont pas la même pose.
 * @param {Array<{ id: string, data: { title: string, theme: string, pubDate: Date, episodeNumber?: number } }>} posts
 */
export function donneesPartage(posts) {
  const out = new Map();
  for (const t of BLOG_THEMES) {
    posts
      .filter((p) => p.data.theme === t.slug)
      .sort(byNewest)
      .forEach((p, i) => out.set(p.id, { titre: p.data.title, theme: t.slug, libelle: t.nom, fond: t.partage, rang: i }));
  }
  return out;
}
const SOURCE = fs.readFileSync(path.join(RACINE, 'src/lib/image-partage.mjs'), 'utf8');
/** Le nom de l'image d'un article, sans extension : <slug>-<empreinte> (même calcul pour le point de terminaison et le gabarit). */
export const nomImagePartage = (slug, d) => `${slug}-${createHash('sha1').update(JSON.stringify(d) + SOURCE).digest('hex').slice(0, 8)}`;

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

/** La meilleure coupe des groupes en au plus `maxL` lignes de largeur ≤ L (null si rien ne tient).
    Critères, dans l'ordre : pas de mot seul sur la dernière ligne (titre de trois mots ou
    plus), le moins de lignes, pas de ligne de moins de 40 % de la plus longue, la plus
    longue ligne la plus courte (au pas de 8 px), puis les lignes les plus égales. Les coupes
    sont énumérées par leurs points de coupure (au plus maxL − 1 parmi n − 1) : quelques
    milliers d'essais pour un titre de 40 mots, au lieu de 2^(n−1). */
function couper(ws, larg, esp, L, maxL) {
  const n = larg.length;
  const nbMots = ws.join(' ').split(/[ \u00a0]/).length;
  const avant = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
  const largeurDe = (de, a) => { let t = esp * (a - de - 1); for (let i = de; i < a; i++) t += larg[i]; return t; };
  let meilleure = null;
  const essayer = (coupures) => {
    const bornes = [0, ...coupures, n];
    const lignes = [], w = [];
    for (let k = 0; k < bornes.length - 1; k++) {
      const l = largeurDe(bornes[k], bornes[k + 1]);
      if (l > L) return;
      w.push(l);
      lignes.push(Array.from({ length: bornes[k + 1] - bornes[k] }, (_, i) => bornes[k] + i));
    }
    const max = Math.max(...w), min = Math.min(...w);
    const derniere = lignes[lignes.length - 1];
    const orpheline = nbMots >= 3 && lignes.length > 1 && derniere.length === 1 && !ws[derniere[0]].includes(N);
    const courte = lignes.length > 1 && min < 0.4 * max;
    const inegal = w.reduce((t, x) => t + (max - x) ** 2, 0);
    const cout = [orpheline ? 1 : 0, lignes.length, courte ? 1 : 0, Math.ceil(max / 8), inegal];
    if (!meilleure || avant(cout, meilleure.cout)) meilleure = { cout, lignes, orpheline, courte };
  };
  // Toutes les suites croissantes de 0 à maxL − 1 coupures parmi les positions 1 … n − 1.
  const suite = (depuis, reste, prises) => {
    essayer(prises);
    if (!reste) return;
    for (let i = depuis; i < n; i++) suite(i + 1, reste - 1, [...prises, i]);
  };
  suite(1, Math.min(maxL, n) - 1, []);
  return meilleure;
}

const cacheLargeurs = new Map();
async function largeur(markup, poids, corps) {
  const k = `${markup}|${poids}|${corps}`;
  if (!cacheLargeurs.has(k)) cacheLargeurs.set(k, (await texte(markup, poids, corps, 8000)).w);
  return cacheLargeurs.get(k);
}

/** Le titre composé, d'un seul appel à Pango (lignes séparées par « \n », interligne fixe) : les lignes de base
    sont régulières, qu'une ligne ait ou non une lettre haute ou un accent. `hMax` : la hauteur disponible. */
async function titreCompose(titre, encre, tailles, L, hMax) {
  const ls = (c) => `letter_spacing="${Math.round(-0.03 * c * 1024)}"`;
  const essai = async (ws, c) => {
    const larg = [];
    for (const m of ws) larg.push(await largeur(`<span ${ls(c)}>${esc(m)}</span>`, 720, c));
    const esp = (await largeur(`<span ${ls(c)}>a a</span>`, 720, c)) - (await largeur(`<span ${ls(c)}>aa</span>`, 720, c));
    // Lignes qui tiennent dans la hauteur : la première et les jambages de la dernière comptent pour 1,45 c (accents
    // et lettres basses compris), chaque ligne de plus pour un pas ; quatre au plus.
    const pas = Math.round(c * 1.08);
    const maxL = Math.max(1, Math.min(4, Math.floor((hMax - 1.45 * c) / pas) + 1));
    const coupe = couper(ws, larg, esp, L, maxL);
    return coupe ? { c, pas, coupe, ws } : null;
  };
  const ws = groupes(titre);
  const essais = [];
  for (const c of tailles) { const e = await essai(ws, c); if (e) essais.push(e); }
  // La plus grande taille qui tient en trois lignes, sans mot seul ni ligne trop courte ;
  // sinon en trois lignes sans mot seul ; en quatre sans mot seul ; sinon la plus grande qui tient.
  // La plus petite taille (50 px) est un secours : seulement pour un titre qui ne tient en quatre
  // lignes ni en 72 ni en 60 px (un titre court ne descend jamais à 50 px).
  const secours = tailles[tailles.length - 1];
  const cascade = (es) =>
    es.find((e) => !e.coupe.orpheline && !e.coupe.courte && e.coupe.lignes.length <= 3) ??
    es.find((e) => !e.coupe.orpheline && e.coupe.lignes.length <= 3) ??
    es.find((e) => !e.coupe.orpheline) ??
    es[0];
  let choix = cascade(essais.filter((e) => e.c !== secours)) ?? cascade(essais.filter((e) => e.c === secours));
  if (!choix) {
    // Rien ne tient, même à la plus petite taille : le titre est coupé à un groupe de mots, suivi de « … ».
    const c = tailles[tailles.length - 1];
    for (let k = ws.length - 1; k > 0 && !choix; k--) choix = await essai([...ws.slice(0, k - 1), ws[k - 1] + N + '…'], c);
    if (!choix) throw new Error(`image de partage : titre impossible à composer (${titre})`);
    console.warn(`image de partage : titre trop long, coupé dans l'image (${titre})`);
  }
  const { c, pas, coupe } = choix;
  const lignes = coupe.lignes.map((l) => l.map((j) => choix.ws[j]).join(' '));
  const img = await texte(`<span foreground="${encre}" ${ls(c)} line_height="${pas * 1024}">${lignes.map(esc).join('\n')}</span>`, 720, c, 8000);
  return { img, h: img.h, n: lignes.length };
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
 * @param {{ titre: string, theme: string, libelle: string, fond: string, rang: number }} a  (voir `donneesPartage`)
 * @returns {Promise<Buffer>} le JPEG.
 */
/* Garde : la police est bien celle du site. Si Pango ne la lisait pas (fontconfig absent, fichier illisible), il
   prendrait sans rien dire une police du système : « Hippodoc » en 720 à 100 px mesure 471 px avec la nôtre, 446
   avec la police de secours de cette machine. Un écart de plus de 2,5 % arrête la construction. */
const LARGEUR_TEMOIN = 471;
let temoin = null;
async function verifierPolice() {
  temoin ??= texte('Hippodoc', 720, 100, 8000).then(({ w }) => {
    if (Math.abs(w - LARGEUR_TEMOIN) > LARGEUR_TEMOIN * 0.025) throw new Error(`image de partage : la police du site n'est pas celle que Pango emploie (« Hippodoc » mesure ${w} px au lieu de ${LARGEUR_TEMOIN})`);
  });
  return temoin;
}

export async function imagePartage(a) {
  await verifierPolice();
  const W = LARGEUR, H = HAUTEUR;
  const th = FONDS[a.fond] ?? FONDS.eau;
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

  const pt = await texte(`<span foreground="${th.pastilleTexte}">${esc(typo(a.libelle))}</span>`, 560, Math.round(H * 0.05), col);
  const ppx = Math.round(H * 0.034), ppy = Math.round(H * 0.018);
  const pw = pt.w + 2 * ppx, ph = pt.h + 2 * ppy;
  const ecart = Math.round(H * 0.05);
  const zoneHaut = H * 0.1, zoneBas = H * 0.78;
  // Le bloc (pastille, écart, titre) tient entre 8 % de la hauteur et le haut des vagues (78 %).
  const tt = await titreCompose(a.titre, th.encre, [0.115, 0.095, 0.08].map((x) => Math.round(H * x)), col, zoneBas - Math.round(H * 0.08) - ph - ecart);
  const bloc = ph + ecart + tt.h;
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
      { input: tt.img.buf, left: marge, top: yT },
      { input: marque.buf, left: marge, top: H - Math.round(H * 0.085) - marque.h },
    ])
    .flatten({ background: th.fond[1] })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
