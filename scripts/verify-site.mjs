/**
 * Vérification post-build (spec migration, étape 4) :
 * pour CHAQUE URL du sitemap — fichier présent (équivalent HTTP 200),
 * <title> unique, meta description unique, exactement un <h1>, canonique
 * exacte sans slash final, texte présent dans le HTML brut (sans JS),
 * blocs JSON-LD parsables, balises sociales complètes.
 *
 * Puis, sur l'ensemble du build : aucun lien interne mort, et aucune page
 * construite hors sitemap qui serait indexable ou sans aperçu de partage.
 * Ces trois derniers contrôles ont été ajoutés après un audit manuel qui a
 * trouvé, en une passe, ce que ce script ne voyait pas : des liens morts, des
 * balises Open Graph absentes, et une page entière déposée dans public/ qui
 * échappait au pipeline Astro. Sort avec un code d'erreur si un point échoue.
 *
 * Usage : node scripts/verify-site.mjs   (après astro build)
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const SITE = 'https://www.hippodoc.fr';

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

/* 1. URLs du sitemap */
const indexXml = readFileSync(resolve(dist, 'sitemap-index.xml'), 'utf8');
const sitemapFiles = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
  m[1].replace(`${SITE}/`, '')
);
let urls = [];
for (const sf of sitemapFiles) {
  const xml = readFileSync(resolve(dist, sf), 'utf8');
  urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}
urls = [...new Set(urls)];
console.log(`Sitemap : ${urls.length} URLs`);

/* Slash final interdit dans le sitemap (politique no-trailing-slash) */
for (const u of urls) {
  if (u !== `${SITE}/` && u.endsWith('/')) fail(`URL sitemap avec slash final : ${u}`);
}

const titles = new Map();
const descriptions = new Map();

for (const url of urls) {
  const path = url.replace(SITE, '').replace(/^\//, '');
  const file = path === '' ? resolve(dist, 'index.html') : resolve(dist, path, 'index.html');
  if (!existsSync(file)) {
    fail(`${url} : fichier construit manquant (${file})`);
    continue;
  }
  const html = readFileSync(file, 'utf8');

  // <title>
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) fail(`${url} : <title> absent`);
  else {
    // Contrat SEO : < 60 caractères affichés (entités décodées), au-delà Google
    // tronque le titre dans les résultats (§ 9.cq).
    const affiche = title.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
      .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (affiche.length > 60) fail(`${url} : titre trop long (${affiche.length} car. > 60) : ${affiche}`);
    if (titles.has(title)) fail(`${url} : titre dupliqué avec ${titles.get(title)} : "${title}"`);
    titles.set(title, url);
  }

  // meta description
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!desc) fail(`${url} : meta description absente`);
  else {
    if (descriptions.has(desc)) fail(`${url} : description dupliquée avec ${descriptions.get(desc)}`);
    descriptions.set(desc, url);
  }

  // Les commentaires HTML sont émis tels quels dans la page : un commentaire qui
  // cite « <h3> » serait compté comme un vrai titre. Cas rencontré pour de bon
  // sur /guide-declarations/calculette, où un commentaire expliquant un correctif
  // de hiérarchie créait lui-même un faux saut de niveau.
  const sansCommentaires = html.replace(/<!--[\s\S]*?-->/g, ' ');

  // exactement un H1
  const h1Count = (sansCommentaires.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) fail(`${url} : ${h1Count} balises <h1> (attendu : 1)`);

  // canonique exacte
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const expected = url === `${SITE}/` ? SITE : url;
  if (!canonical) fail(`${url} : canonique absente`);
  else if (canonical !== expected && canonical !== `${expected}/` && !(url === `${SITE}/` && canonical === `${SITE}`)) {
    if (canonical !== url) fail(`${url} : canonique inattendue "${canonical}"`);
  }
  if (canonical && canonical !== SITE && canonical.endsWith('/')) fail(`${url} : canonique avec slash final "${canonical}"`);

  // lang fr
  if (!/<html[^>]+lang="fr"/.test(html)) fail(`${url} : lang="fr" absent de <html>`);

  // texte réel sans exécution JS
  const noScript = html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ' ').replace(/<style[^>]*>[\s\S]*?<\/style>/g, ' ');
  const text = noScript.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const wordCount = text.split(' ').filter(Boolean).length;
  if (wordCount < 150) fail(`${url} : seulement ${wordCount} mots dans le HTML brut (< 150)`);

  // JSON-LD parsable
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (ldBlocks.length === 0) warn(`${url} : aucun bloc JSON-LD`);
  for (const [, block] of ldBlocks) {
    try {
      const parsed = JSON.parse(block);
      const t = parsed['@type'];
      if (!t) fail(`${url} : JSON-LD sans @type`);
    } catch (e) {
      fail(`${url} : JSON-LD invalide (${e.message})`);
    }
  }

  // hiérarchie des titres : un saut (h1 → h3) casse la navigation par titres
  // des lecteurs d'écran. En avertissement, car le footer partagé ouvre sur des
  // <h3> et rend le défaut facile à réintroduire sur une page peu structurée.
  const niveaux = [...sansCommentaires.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < niveaux.length; i++) {
    if (niveaux[i] > niveaux[i - 1] + 1) {
      warn(`${url} : saut de niveau de titre h${niveaux[i - 1]} → h${niveaux[i]}`);
      break;
    }
  }

  // lorem / placeholder
  if (/lorem ipsum/i.test(text)) fail(`${url} : texte placeholder « lorem ipsum » détecté`);
  if (/TODO\(owner\)/.test(text)) warn(`${url} : TODO(owner) visible dans la page`);

  // balises sociales — une page indexable est une page partageable : sans elles,
  // aucun aperçu n'apparaît en messagerie ou sur les réseaux.
  for (const tag of ['og:title', 'og:description', 'og:image', 'og:url']) {
    if (!html.includes(`property="${tag}"`)) fail(`${url} : balise ${tag} absente`);
  }
  if (!html.includes('name="twitter:card"')) fail(`${url} : balise twitter:card absente`);
}

/* 1 bis. Inventaire réel de dist/ — sert aux deux contrôles suivants.
   Un audit manuel avait révélé trois angles morts que ce script ne voyait pas :
   des liens internes cassés, des balises sociales manquantes, et une page
   entièrement hors du pipeline Astro. Ces contrôles les rendent automatiques. */
const fichiersDist = readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile())
  .map((d) => resolve(d.parentPath ?? d.path, d.name).replace(dist, '').replace(/\\/g, '/'));

/** Chemins d'URL réellement servis : /a/b pour dist/a/b/index.html. */
const cheminsServis = new Set(
  fichiersDist
    .filter((f) => f.endsWith('/index.html'))
    .map((f) => f.replace(/\/index\.html$/, '') || '/')
);
/** Fichiers atteignables tels quels (assets, sitemap, robots…). */
const fichiersServis = new Set(fichiersDist);

/* 2. Liens internes : chaque href interne doit aboutir quelque part.
   Un lien mort ne casse pas le build et passe donc totalement inaperçu. */
let liensAnalyses = 0;
const liensCasses = new Map(); // cible -> pages qui la référencent
for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8');
  const source = f.replace(/\/index\.html$/, '') || '/';
  // Octet nul : invisible à l'œil, mais le texte servi diffère de celui que
  // l'îlot rend au client (hydratation ratée) et « mat\0ériel » n'est plus le
  // mot « matériel » pour un moteur (§ 9.cp).
  const nuls = html.split('\u0000').length - 1;
  if (nuls) fail(`${source} : ${nuls} octet(s) nul(s) U+0000 dans le HTML construit`);
  // Hébergement : « Union européenne » sur TOUT le site (décision du propriétaire,
  // comme les pages légales ; MIGRATION.md § 9, DA 2026). « en France » était faux.
  if (/hébergées? en France/i.test(html)) fail(`${source} : « hébergées en France » — la mention validée est « Union européenne »`);
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const cible = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    if (cible.startsWith('//')) continue; // protocole-relatif : externe
    liensAnalyses++;
    if (cheminsServis.has(cible) || fichiersServis.has(cible)) continue;
    if (!liensCasses.has(cible)) liensCasses.set(cible, new Set());
    liensCasses.get(cible).add(source);
  }
}
for (const [cible, sources] of liensCasses) {
  const ou = [...sources].slice(0, 3).join(', ');
  fail(`Lien interne mort : ${cible} (référencé par ${sources.size} page(s) : ${ou}${sources.size > 3 ? '…' : ''})`);
}

/* 3. Pages hors sitemap — typiquement du HTML déposé dans public/, qui échappe
   au pipeline Astro et donc à tous les contrôles ci-dessus. Volontaire ou non,
   il faut au moins le SAVOIR. */
const cheminsSitemap = new Set(urls.map((u) => u.replace(SITE, '').replace(/\/$/, '') || '/'));
for (const chemin of [...cheminsServis].sort()) {
  if (cheminsSitemap.has(chemin)) continue;
  const html = readFileSync(resolve(dist, chemin === '/' ? 'index.html' : `${chemin.replace(/^\//, '')}/index.html`), 'utf8');
  const noindex = /<meta name="robots"[^>]+noindex/.test(html);
  if (!noindex) {
    fail(`${chemin} : page construite absente du sitemap ET indexable (ajoute-la au sitemap ou mets-la en noindex)`);
  } else {
    warn(`${chemin} : hors sitemap (noindex) — non couverte par les contrôles ci-dessus`);
    // en noindex mais partageable : l'aperçu en messagerie compte quand même
    if (!html.includes('property="og:title"')) fail(`${chemin} : hors sitemap et sans og:title (aucun aperçu au partage)`);
  }
}

/* 4. vercel.json : parse + collisions avec les routes publiques */
const vercelJson = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
const publicPaths = urls.map((u) => u.replace(SITE, '') || '/');
for (const r of vercelJson.redirects ?? []) {
  if (r.has) continue; // règles host (www) — pas des chemins
  const src = r.source;
  const exact = publicPaths.find((p) => p === src);
  if (exact) fail(`Redirection ${src} entre en collision avec une page publique construite`);
  if (!r.permanent) warn(`Redirection non permanente (302) : ${src}`);
}

/* 4 bis. Page 404 — l'adaptateur Vercel génère la route
   {"src":"^/.*$","dest":"/404.html","status":404} quoi qu'il arrive. Si le
   fichier n'existe pas, Vercel sert sa page brute (79 octets, sans <title> ni
   lien de retour) : le visiteur arrivé par un lien mort est dans une impasse.
   C'était le cas jusqu'en août 2026. */
const page404 = resolve(dist, '404.html');
if (!existsSync(page404)) {
  fail('404.html absent de dist/ — Vercel servira sa page d’erreur brute (src/pages/404.astro)');
} else {
  const html404 = readFileSync(page404, 'utf8');
  // servie sous des URL arbitraires : indexable, elle dupliquerait le site
  if (!/<meta name="robots"[^>]+noindex/.test(html404)) {
    fail('404.html : doit être en noindex (elle est servie sous n’importe quelle URL)');
  }
  if (!/href="\/"/.test(html404)) fail('404.html : aucun lien de retour vers l’accueil');
}

/* 4 ter. En-têtes de cache : l'invariant qui les rend sûrs.
   « immutable » promet au navigateur que le fichier ne changera JAMAIS sous
   cette URL. Ce n'est vrai que parce que Vite préfixe chaque fichier de /_astro/
   d'une empreinte de son contenu. Le jour où un fichier à nom stable y atterrit,
   la promesse devient fausse et le fichier est gelé un an chez tous les
   visiteurs — sans le moindre signal. D'où ce contrôle. */
const regleImmutable = (vercelJson.headers ?? []).find(
  (h) => h.source?.startsWith('/_astro/') &&
    h.headers?.some((k) => /immutable/.test(k.value ?? ''))
);
if (!regleImmutable) {
  warn('vercel.json : aucune règle « immutable » sur /_astro/ — les assets hachés sont revalidés à chaque visite');
} else {
  const nonHaches = readdirSync(resolve(dist, '_astro'), { withFileTypes: true })
    .filter((d) => d.isFile() && !/\.[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(d.name))
    .map((d) => d.name);
  if (nonHaches.length) {
    fail(
      `/_astro/ contient ${nonHaches.length} fichier(s) SANS empreinte (${nonHaches.slice(0, 3).join(', ')}` +
      `${nonHaches.length > 3 ? '…' : ''}) alors que vercel.json les sert en « immutable » : ` +
      `ils seraient figés un an chez les visiteurs`
    );
  }
}
// Aucune règle de cache ne doit attraper du HTML : une page mise en cache
// rendrait un déploiement invisible pour les visiteurs déjà venus.
for (const h of vercelJson.headers ?? []) {
  const cache = h.headers?.find((k) => k.key?.toLowerCase() === 'cache-control')?.value ?? '';
  const duree = Number(cache.match(/max-age=(\d+)/)?.[1] ?? 0);
  if (duree > 0 && /\.html|^\/\(\.\*\)|^\/:path|^\/\(\.\+\)/.test(h.source ?? '')) {
    fail(`vercel.json : la règle de cache "${h.source}" peut viser du HTML — un déploiement resterait invisible`);
  }
}

/* 4 quater. Instrumentation de la landing.
   Les événements `landing_*` sont reconstruits à partir du DOM : les sections par
   `data-landing-section`, les conversions par les `data-track` déjà en place. Un
   composant renommé ou un CTA ajouté sans attribut casserait la mesure en silence
   — et ce silence a déjà coûté cinq semaines de données après la bascule du
   07/08/2026. On le rend bruyant. */
// DA 2026, phase 3 : « social-proof » (section « En chiffres ») a quitté la page.
// L'ordre suit celui de la page ; `features` est le bloc « Sous la surface »,
// `founder` (nouveau) contient le film (`presentation-video`).
// `mid-page-cta` (le bandeau du milieu de page) est parti avec les tarifs de la
// nouvelle DA ; `guides` et `final-cta` (la scène finale) sont nouveaux.
// Épure de novembre 2026 (MIGRATION.md § 9.eu) : mêmes onze identifiants, les
// témoignages passent avant les partenaires. L'ordre de ce tableau suit la page
// et il est vérifié plus bas ; `SECTIONS` (src/lib/landing-analytics.ts) ne
// change pas, son rang est historique (`section_order` des séries passées).
const SECTIONS_LANDING = [
  'hero', 'features', 'practice-journeys', 'founder', 'presentation-video',
  'testimonials', 'partners', 'pricing', 'faq', 'guides', 'final-cta',
];
const accueil = readFileSync(resolve(dist, 'index.html'), 'utf8');
const sectionsVues = [...accueil.matchAll(/data-landing-section="([^"]+)"/g)].map((m) => m[1]);
for (const attendue of SECTIONS_LANDING) {
  if (!sectionsVues.includes(attendue)) {
    fail(`accueil : section « ${attendue} » sans data-landing-section — landing_section_viewed ne partira plus pour elle`);
  }
}
for (const vue of sectionsVues) {
  if (!SECTIONS_LANDING.includes(vue)) {
    fail(`accueil : data-landing-section="${vue}" inconnu — ajoute-le ici ET dans src/lib/landing-analytics.ts, sinon son section_order sera faux`);
  }
}
// L'ordre de la page est celui du tableau : une section déplacée sans que le
// tableau suive (ou l'inverse) se voit ici, pas trois semaines plus tard dans un
// entonnoir par position.
if (sectionsVues.join(' ') !== SECTIONS_LANDING.join(' ')) {
  fail(`accueil : l'ordre des sections de la page (${sectionsVues.join(', ')}) n'est plus celui de SECTIONS_LANDING (${SECTIONS_LANDING.join(', ')})`);
}
// Les deux listes vont ensemble : une section connue ici mais absente de `SECTIONS`
// (src/lib/landing-analytics.ts) partirait avec `section_order: 0`, sans erreur.
{
  const source = readFileSync(resolve(root, 'src/lib/landing-analytics.ts'), 'utf8');
  const liste = source.match(/const SECTIONS = \[([\s\S]*?)\]/)?.[1];
  const connues = liste ? [...liste.matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  if (!connues.length) {
    fail('src/lib/landing-analytics.ts : tableau SECTIONS introuvable, le contrôle des identifiants de section est impossible');
  } else {
    for (const section of SECTIONS_LANDING) {
      if (!connues.includes(section)) {
        fail(`accueil : « ${section} » est dans SECTIONS_LANDING mais pas dans SECTIONS (src/lib/landing-analytics.ts) — son section_order vaudrait 0`);
      }
    }
  }
}
// Tout lien d'inscription doit rester instrumenté : c'est la conversion elle-même.
for (const [balise] of accueil.matchAll(/<a\b[^>]*auth\?tab=signup[^>]*>/g)) {
  if (!/data-track="/.test(balise)) {
    fail(`accueil : un CTA d'inscription sans data-track — le clic ne sera pas attribué (${balise.slice(0, 80)})`);
  }
}
// Premier écran (DA 2026, phase 2) : ses deux conversions gardent leur identifiant,
// sinon les séries PostHog `cta_signup_hero` et `cta_simulator` s'arrêtent sans bruit.
const premierEcran = accueil.match(/<section\b[^>]*data-landing-section="hero"[\s\S]*?<\/section>/)?.[0] ?? '';
for (const mesure of ['cta_signup_hero', 'cta_simulator']) {
  if (!premierEcran.includes(`data-track="${mesure}"`)) {
    fail(`accueil : data-track="${mesure}" absent du premier écran — sa série PostHog s'arrête`);
  }
}
// Le préchargement du buste et le <picture> doivent demander les mêmes fichiers :
// sinon le navigateur précharge une image puis en affiche une autre.
const srcsetPrecharge = accueil.match(/<link\b[^>]*rel="preload"[^>]*imagesrcset="([^"]+)"/)?.[1];
const srcsetAvif = premierEcran.match(/<source\b[^>]*type="image\/avif"[^>]*srcset="([^"]+)"/)?.[1];
if (!srcsetPrecharge || !srcsetAvif) {
  fail('accueil : préchargement du buste (imagesrcset) ou <source type="image/avif"> du premier écran introuvable');
} else if (srcsetPrecharge !== srcsetAvif) {
  fail('accueil : le préchargement du buste (imagesrcset) ne correspond plus au srcset AVIF du <picture>');
}
// « Sous la surface » (DA 2026, phase 3) : la fenêtre produit à onglets.
// - `id="sous-la-surface"` est la cible du lien « Comment ça marche » du menu ;
// - les trois vues doivent toutes être dans le HTML (trois radios, dont une seule
//   cochée, et trois panneaux) : une vue générée à la demande ne serait lue par
//   aucun moteur ;
// - les chiffres de la page sont ceux d'un compte fictif : la mention « Compte de
//   démonstration » doit y figurer, une seule fois (décision du propriétaire).
const sousLaSurface = accueil.match(/<section\b[^>]*data-landing-section="features"[\s\S]*?<\/section>/)?.[0] ?? '';
if (!/^<section\b[^>]*\sid="sous-la-surface"/.test(sousLaSurface)) {
  fail('accueil : la section data-landing-section="features" ne porte plus id="sous-la-surface"');
}
const radiosApercu = [...sousLaSurface.matchAll(/<input\b[^>]*type="radio"[^>]*name="apercu"[^>]*>/g)].map((m) => m[0]);
const panneauxApercu = sousLaSurface.match(/class="panel p\d"/g) ?? [];
if (radiosApercu.length !== 3 || panneauxApercu.length !== 3 || radiosApercu.filter((r) => /\schecked\b/.test(r)).length !== 1) {
  fail(`accueil : la fenêtre produit doit avoir 3 onglets (un seul coché) et 3 panneaux dans le HTML — trouvé ${radiosApercu.length} onglet(s), ${panneauxApercu.length} panneau(x)`);
}
const mentionsDemo = (accueil.match(/Compte de démonstration/g) ?? []).length;
if (mentionsDemo !== 1) {
  fail(`accueil : « Compte de démonstration » doit figurer une fois, dans le pied de la fenêtre produit — trouvé ${mentionsDemo} fois`);
}
// « Pour qui » (DA 2026, phase 3) : le sélecteur de profil, sans JS.
// - `id="parcours"` est la cible du lien « Pour qui » du menu, sur TOUT le site ;
// - quatre radios `parcours-<profil>` (une seule cochée) et quatre panneaux dans le
//   HTML : landing-analytics lit l'identifiant de la radio cochée, et chaque libellé
//   porte `data-profile` (sans lui, `landing_journey_profile_selected` ne part plus) ;
// - la conversion du bloc garde son identifiant.
const pourQui = accueil.match(/<section\b[^>]*data-landing-section="practice-journeys"[\s\S]*?<\/section>/)?.[0] ?? '';
if (!/^<section\b[^>]*\sid="parcours"/.test(pourQui)) {
  fail('accueil : la section data-landing-section="practice-journeys" ne porte plus id="parcours" (cible de /#parcours)');
}
const PROFILS_POUR_QUI = ['remplacant', 'interne', 'vacataire', 'mixte'];
const radiosProfil = [...pourQui.matchAll(/<input\b[^>]*type="radio"[^>]*name="parcours"[^>]*>/g)].map((m) => m[0]);
for (const profil of PROFILS_POUR_QUI) {
  if (!radiosProfil.some((r) => r.includes(`id="parcours-${profil}"`))) fail(`accueil, « Pour qui » : radio id="parcours-${profil}" absente — le profil ne serait plus mesuré`);
  if (!new RegExp(`<label\\b[^>]*data-profile="${profil}"`).test(pourQui)) fail(`accueil, « Pour qui » : libellé data-profile="${profil}" absent — landing_journey_profile_selected ne partirait plus pour lui`);
  if (!pourQui.includes(`data-panel="${profil}"`)) fail(`accueil, « Pour qui » : panneau data-panel="${profil}" absent du HTML`);
}
if (radiosProfil.length !== PROFILS_POUR_QUI.length || radiosProfil.filter((r) => /\schecked\b/.test(r)).length !== 1) {
  fail(`accueil, « Pour qui » : ${PROFILS_POUR_QUI.length} profils attendus, dont un seul coché — trouvé ${radiosProfil.length} radio(s)`);
}
// Une seule forme d'étape pour les quatre profils (épure de novembre 2026). Le
// profil Remplaçant n'avait ni phrase d'accroche ni précision sous son onglet : il
// sortait dans une autre forme que les trois autres (défaut signalé par le
// propriétaire). Chaque étape porte un titre, une phrase (`acc`) et une précision
// (`det`) ; chaque onglet, une précision sous son nom (`h`).
// Le découpage se fait sur `data-panel`, pas sur la classe du panneau : découpé sur
// la chaîne exacte `<div class="panel"`, le contrôle passait à vide dès qu'une classe
// s'ajoutait au panneau (essai par mutation, § 9.ex). Il échoue aussi s'il ne lit pas
// un panneau par profil.
const panneauxPourQui = {};
for (const morceau of pourQui.split(/(?=<div\b[^>]*\sdata-panel=")/).slice(1)) {
  const profil = morceau.match(/data-panel="([^"]+)"/)?.[1];
  // Le dernier panneau s'arrête avant l'appel (« Prêt·e à voir ton Super-Net ? »).
  panneauxPourQui[profil] = morceau.split(/<div class="go"/)[0];
}
if (Object.keys(panneauxPourQui).length !== PROFILS_POUR_QUI.length || PROFILS_POUR_QUI.some((p) => !panneauxPourQui[p])) {
  fail(`accueil, « Pour qui » : ${PROFILS_POUR_QUI.length} panneaux data-panel attendus (${PROFILS_POUR_QUI.join(', ')}) — lu ${Object.keys(panneauxPourQui).join(', ') || 'aucun'} ; le contrôle de la forme des étapes ne porterait sur rien`);
}
for (const [profil, panneau] of Object.entries(panneauxPourQui)) {
  const etapes = panneau.match(/<li\b[^>]*>[\s\S]*?<\/li>/g) ?? [];
  const entieres = etapes.filter((e) => /<h3\b[^>]*>[^<]+<\/h3>/.test(e) && /<p class="acc"[^>]*>\s*[^<\s]/.test(e) && /<p class="det"[^>]*>\s*[^<\s]/.test(e));
  if (etapes.length < 6 || entieres.length !== etapes.length) {
    fail(`accueil, « Pour qui », profil « ${profil} » : ${etapes.length} étape(s), dont ${entieres.length} avec titre, phrase et précision — les quatre profils ont la même forme, 6 étapes au moins`);
  }
}
const precisionsOnglets = [...pourQui.matchAll(/<span class="h"[^>]*>([^<]*)<\/span>/g)].filter((m) => m[1].trim());
if (precisionsOnglets.length !== PROFILS_POUR_QUI.length) {
  fail(`accueil, « Pour qui » : chaque onglet porte une précision sous son nom — trouvé ${precisionsOnglets.length} sur ${PROFILS_POUR_QUI.length}`);
}
// Les deux autres liens de rendez-vous de la page (arbitrage 7 du plan) : la série
// `pour_qui` continue, `fondateur` est neuve et sera réévaluée à 60 jours. Le
// contrôle générique plus bas vérifie qu'un lien Calendly porte l'attribut, pas
// qu'il est toujours là.
if (!pourQui.includes('data-calendly="pour_qui"')) {
  fail('accueil, « Pour qui » : le lien de rendez-vous data-calendly="pour_qui" a disparu du bloc — sa série PostHog s\'arrête');
}
const blocFondateur = accueil.match(/<section\b[^>]*data-landing-section="founder"[\s\S]*?<\/section>/)?.[0] ?? '';
if (!blocFondateur.includes('data-calendly="fondateur"')) {
  fail('accueil, bloc fondateur : le lien de rendez-vous data-calendly="fondateur" a disparu');
}
if (!pourQui.includes('data-track="cta_signup_journey_section"')) {
  fail('accueil : data-track="cta_signup_journey_section" absent du bloc « Pour qui » — sa série PostHog s\'arrête');
}
// Le film (DA 2026, phase 3) est un sous-bloc du bloc fondateur. landing-analytics
// cherche le <video> DANS l'élément `presentation-video` : ailleurs, tous les
// `landing_video_*` s'arrêtent sans erreur. Cet élément porte aussi l'ancre
// `#film-presentation` : plus aucune entrée du menu n'y mène depuis la phase 5a
// (§ 9.ed), mais l'ancre reste, pour les liens déjà partagés.
const blocFilm = accueil.match(/<(\w+)\b[^>]*data-landing-section="presentation-video"[^>]*>/);
const finFondateur = accueil.indexOf('</section>', blocFilm?.index ?? 0);
if (!blocFilm || !/\sid="film-presentation"/.test(blocFilm[0])) {
  fail('accueil : l\'élément data-landing-section="presentation-video" ne porte plus id="film-presentation"');
} else if (!/<video\b/.test(accueil.slice(blocFilm.index, finFondateur))) {
  fail('accueil : le <video> n\'est plus dans le bloc data-landing-section="presentation-video" — landing_video_* ne partirait plus');
}
// Tarifs (DA 2026, phase 3). `id="pricing"` est la cible du lien « Tarifs » du
// menu sur TOUT le site et de deux réponses de la FAQ. Les deux liens
// d'inscription gardent `cta_signup_pricing` et leurs trois attributs (le plan
// choisi part avec le clic), l'offre interne et le détail des offres restent des
// <details> natifs, avec leur identifiant d'autocapture.
const tarifsAccueil = accueil.match(/<section\b[^>]*data-landing-section="pricing"[\s\S]*?<\/section>/)?.[0] ?? '';
if (!/^<section\b[^>]*\sid="pricing"/.test(tarifsAccueil)) {
  fail('accueil : la section data-landing-section="pricing" ne porte plus id="pricing" (cible de /#pricing)');
}
const ctaTarifs = [...tarifsAccueil.matchAll(/<a\b[^>]*data-track="cta_signup_pricing"[^>]*>/g)].map((m) => m[0]);
for (const plan of ['yearly', 'monthly']) {
  const lien = ctaTarifs.find((b) => b.includes(`data-track-plan="${plan}"`));
  if (!lien) fail(`accueil, tarifs : lien cta_signup_pricing du plan « ${plan} » absent — landing_cta_clicked perdrait ce plan`);
  else if (!lien.includes(`data-track-period="${plan}"`) || !lien.includes('data-track-promo="false"') || !lien.includes(`plan=${plan}`)) {
    fail(`accueil, tarifs : le lien du plan « ${plan} » doit porter data-track-period="${plan}", data-track-promo="false" et mener à plan=${plan}`);
  }
}
if (ctaTarifs.length !== 2) fail(`accueil, tarifs : 2 liens cta_signup_pricing attendus (annuel, mensuel) — trouvé ${ctaTarifs.length}`);
if (!/<details\b[^>]*data-ph="landing_special_offer_intern"/.test(tarifsAccueil)) {
  fail('accueil, tarifs : le <details data-ph="landing_special_offer_intern"> de l\'offre interne a disparu');
}
if (!/<summary\b[^>]*data-ph="landing_pricing_comparison_toggle"/.test(tarifsAccueil)) {
  fail('accueil, tarifs : le <summary data-ph="landing_pricing_comparison_toggle"> du détail des offres a disparu');
}
// « Engagement : 12 mois » n'est écrit que dans le détail des offres : il doit rester dans le HTML.
if (!/Engagement<\/th>[\s\S]{0,200}12 mois/.test(tarifsAccueil)) {
  fail('accueil, tarifs : la ligne « Engagement : 12 mois » de l\'offre annuelle a disparu du détail des offres');
}
// Hébergement : « Union européenne » (décision du propriétaire, les pages légales
// disent la même chose). « hébergées en France » ne doit pas revenir sur l'accueil.
if (/hébergées? en France/i.test(accueil)) fail('accueil : « hébergées en France » — la mention validée est « Union européenne »');
if (!/Union européenne/.test(tarifsAccueil)) fail('accueil, tarifs : la mention de l\'hébergement (« Union européenne ») a disparu');
// Questions fréquentes (DA 2026, phase 3) : une question par <details>, chacune avec
// son identifiant d'autocapture, autant que dans le schéma FAQPage ; le lien vers /faq.
const questionsAccueil = accueil.match(/<section\b[^>]*data-landing-section="faq"[\s\S]*?<\/section>/)?.[0] ?? '';
const plisFaq = questionsAccueil.match(/<summary\b[^>]*data-ph="landing_faq_[a-z0-9-]+"/g) ?? [];
let questionsSchema = 0;
for (const [, bloc] of accueil.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
  try { const j = JSON.parse(bloc); if (j['@type'] === 'FAQPage') questionsSchema = (j.mainEntity ?? []).length; } catch { /* JSON-LD invalide : signalé plus haut */ }
}
if (!plisFaq.length || plisFaq.length !== questionsSchema || new Set(plisFaq).size !== plisFaq.length) {
  fail(`accueil, questions : ${questionsSchema} question(s) dans le schéma FAQPage, ${plisFaq.length} <summary data-ph="landing_faq_…"> dans la page (${new Set(plisFaq).size} distinct(s))`);
}
if ((questionsAccueil.match(/<details\b/g) ?? []).length !== plisFaq.length) {
  fail('accueil, questions : chaque question doit être un <details> natif (réponse dans le HTML), et rien d\'autre');
}
if (!/<a\b[^>]*href="\/faq"[^>]*data-ph="landing_faq_all"/.test(questionsAccueil)) {
  fail('accueil, questions : le lien data-ph="landing_faq_all" vers /faq a disparu');
}
if (!questionsAccueil.includes('data-calendly="faq_accueil"')) {
  fail('accueil, questions : le lien de rendez-vous data-calendly="faq_accueil" a disparu de la fin de la FAQ');
}
// Guides (DA 2026, phase 3) : six liens internes, en chemins relatifs.
const guidesAccueil = accueil.match(/<section\b[^>]*data-landing-section="guides"[\s\S]*?<\/section>/)?.[0] ?? '';
const liensGuides = [...guidesAccueil.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1]);
if (liensGuides.length !== 6 || liensGuides.some((h) => !h.startsWith('/')) || new Set(liensGuides).size !== 6) {
  fail(`accueil, guides : 6 liens internes distincts attendus, en chemins relatifs — trouvé ${liensGuides.join(', ') || 'aucun'}`);
}
// Scène finale (DA 2026, phase 3) : une seule demande, l'inscription. Pas de lien de
// rendez-vous sous un bouton principal (§ 9.r : zéro clic en 150 jours).
const sceneFinale = accueil.match(/<section\b[^>]*data-landing-section="final-cta"[\s\S]*?<\/section>/)?.[0] ?? '';
if (!sceneFinale.includes('data-track="cta_signup_final"')) {
  fail('accueil : data-track="cta_signup_final" absent de la scène finale — sa série PostHog s\'arrête');
}
if (sceneFinale.includes('calendly.com')) fail('accueil, scène finale : pas de lien de rendez-vous ici (§ 9.r)');
// Plancher de mots : 90 % du relevé (même comptage que le contrôle des 150 mots).
// Une section perdue ou un panneau généré à la demande ferait passer la page dessous.
// - Phase 3 (10 novembre 2026) : 3 257 mots, plancher 2 931 (4 134 mots sur
//   l'ancienne accueil).
// - Épure du 12 novembre 2026 (MIGRATION.md § 9.eu) : 2 978 mots, plancher 2 680.
//   Abaissé sciemment, à la demande du propriétaire (page trop chargée, trop
//   longue sur téléphone) : les sept étapes du remplaçant ne sont plus dites
//   deux fois, deux questions quittent la FAQ, trois sous-titres de guides et
//   quelques phrases redites sont coupés. Ce que la page ne doit pas perdre en
//   route est vérifié juste dessous, terme par terme.
const MOTS_ACCUEIL_MIN = 2680;
const texteAccueil = accueil
  .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ');
const motsAccueil = texteAccueil.split(/\s+/).filter(Boolean).length;
if (motsAccueil < MOTS_ACCUEIL_MIN) {
  fail(`accueil : ${motsAccueil} mots dans le HTML brut, sous le plancher de ${MOTS_ACCUEIL_MIN} (90 % du relevé de l'épure du 12 novembre 2026)`);
}
// Termes porteurs (épure de novembre 2026) : alléger la page ne doit pas lui
// retirer les mots par lesquels on la cherche. Chacun doit rester dans le texte
// rendu du <body> (balises retirées, scripts et JSON-LD exclus : un terme qui ne
// survivrait que dans un schéma ne compte pas). Sur la page entière, seul
// « licence de remplacement » ne vit qu'à un endroit (profil Interne de « Pour
// qui ») : les onze autres sont dits ailleurs aussi, et ce contrôle-ci ne verrait
// pas un profil vidé (essai par mutation, § 9.ex). D'où le second contrôle : les
// termes que l'épure a fait passer de « Sous la surface » au profil Remplaçant,
// affiché par défaut, doivent rester dans CE panneau.
{
  const lisible = (html) => html.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;|\u00a0|\u202f/g, ' ').replace(/&#39;|&#x27;|&apos;|’/g, "'").replace(/\s+/g, ' ');
  const rendu = lisible(texteAccueil.slice(texteAccueil.indexOf('Aller au contenu principal')));
  const TERMES_ACCUEIL = [
    'médecin remplaçant', 'URSSAF', 'CARMF', '2035', '2042-C PRO', 'DSFU', 'RSPM', 'PAMC',
    'Micro-BNC', 'rétrocession', 'contrat de remplacement', 'licence de remplacement',
  ];
  const perdus = TERMES_ACCUEIL.filter((t) => !rendu.includes(t));
  if (perdus.length) {
    fail(`accueil : terme(s) porteur(s) absent(s) du texte rendu : ${perdus.map((t) => `« ${t} »`).join(', ')} — une coupe a emporté un mot par lequel la page est cherchée (MIGRATION.md § 9.eu)`);
  }
  const TERMES_REMPLACANT = ['2035', '2042-C PRO', 'DSFU', 'contrat de remplacement', 'serveur officiel URSSAF'];
  const panneauRemplacant = lisible(panneauxPourQui.remplacant ?? '');
  const perdusRemplacant = TERMES_REMPLACANT.filter((t) => !panneauRemplacant.includes(t));
  if (perdusRemplacant.length) {
    fail(`accueil, « Pour qui », profil Remplaçant : terme(s) absent(s) de ses étapes : ${perdusRemplacant.map((t) => `« ${t} »`).join(', ')} — l'épure les a fait passer de « Sous la surface » à ce profil, le seul affiché sans choisir d'onglet (MIGRATION.md § 9.eu)`);
  }
}
// Police de la DA (phase 4a) : un seul fichier, sous-ensemble latin. Un caractère
// hors de ce sous-ensemble (une flèche, une coche, un émoji) sort dans la police de
// repli, au milieu d'un titre ou d'une phrase. On lit la plage `unicode-range` du
// @font-face de da.css et on y cherche chaque caractère du texte DESSINÉ de
// l'accueil. Le texte masqué à l'œil (classe `sr` : il garde le caractère pour les
// lecteurs d'écran, un dessin SVG le remplace à l'écran) est ignoré, comme les
// attributs (alt, aria-label).
// Limite : la plage dit ce que la feuille demande au fichier, pas ce qu'il contient.
// Les flèches U+2191 et U+2193 y figurent alors que la police n'en a aucune
// (MIGRATION.md § 9) : tout le bloc des flèches est donc refusé.
{
  const daCss = readFileSync(resolve(root, 'src/styles/da.css'), 'utf8');
  const plage = daCss.match(/@font-face\s*\{[^}]*font-family:\s*"Google Sans Flex";[^}]*unicode-range:\s*([^;]+);/)?.[1];
  if (!plage) {
    fail('da.css : unicode-range du @font-face « Google Sans Flex » introuvable, le contrôle des caractères de l\'accueil est impossible');
  } else {
    const bornes = plage.split(',').map((p) => p.trim().match(/^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i))
      .filter(Boolean).map((m) => [parseInt(m[1], 16), parseInt(m[2] ?? m[1], 16)]);
    const dansLaPolice = (code) => !(code >= 0x2190 && code <= 0x21ff) && bornes.some(([a, b]) => code >= a && code <= b);
    const dessine = accueil.slice(accueil.indexOf('<body'))
      .replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(\w+)\b[^>]*\sclass="(?:[^"]*\s)?sr(?:\s[^"]*)?"[^>]*>[\s\S]*?<\/\1>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g, ' ');
    const absents = new Map();
    for (const car of dessine) {
      const code = car.codePointAt(0);
      if (code > 0x20 && !dansLaPolice(code)) absents.set(car, (absents.get(car) ?? 0) + 1);
    }
    if (absents.size) {
      const liste = [...absents].map(([car, n]) => `« ${car} » (U+${car.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}, ${n} fois)`).join(', ');
      fail(`accueil : caractère(s) absent(s) de la police de la DA dans le texte dessiné : ${liste} — le dessiner en SVG et garder le caractère dans un élément de classe « sr », ou l'écrire autrement`);
    }
  }
}

/* 4 quater bis. Un seul en-tête, un seul pied (phase 5a, MIGRATION.md § 9.ed).
   Jusqu'à la phase 5a, l'accueil avait ses copies rhabillées de l'en-tête et du
   pied, et ce contrôle comparait les deux jeux. Il n'y a plus qu'un composant de
   chaque (src/components/Header.astro, Footer.astro) : la comparaison est
   devenue une garde.
   a. La mesure : chaque lien, bouton ou <label> de l'en-tête et du pied de
      l'accueil porteur d'un data-ph ou d'un data-track figure dans la liste
      figée ci-dessous, dans l'ordre. Un attribut retiré ou renommé arrêterait
      une série PostHog sans que rien n'échoue ; une entrée ajoutée s'ajoute ici.
   b. Toutes les pages : une page du build a l'en-tête ET le pied du site, avec
      les mêmes liens, libellés et attributs de mesure que l'accueil (aucune page
      ne se refait un en-tête à elle), ou n'a ni l'un ni l'autre et le déclare
      dans PAGES_SANS_ENTETE. `aria-current` n'entre pas dans la comparaison.
   c. Le micro-script du tiroir mobile (ScriptTiroir.astro) : une seule fois par
      page, après </footer>, jamais dans <header> (il y faisait peindre la page
      en deux temps, § 9.eb), jamais sur une page sans tiroir (il y lèverait une
      erreur), et au caractère près celui de l'ancien en-tête : son empreinte est
      figée ici. Le modifier demande de changer l'empreinte, donc de le décider. */
const MESURE_ENTETE_PIED = [
  'header : a | /#sous-la-surface | landing_nav_comment_ca_marche |  |  | Comment ça marche',
  'header : a | /#parcours | landing_nav_pour_qui |  |  | Pour qui',
  'header : a | /#pricing | landing_nav_pricing |  |  | Tarifs',
  'header : a | /simulateur | landing_resource_simulateur |  |  | Simulateur',
  'header : a | /guide | landing_resource_guide-remplacant |  |  | Guide du remplaçant (PDF)',
  'header : a | /guide-declarations | landing_resource_guide-declarations |  |  | Guide déclarations',
  'header : a | /blog | landing_resource_blog |  |  | Blog',
  'header : a | /faq | landing_resource_faq |  |  | FAQ',
  'header : a | /qui-sommes-nous | landing_resource_qui-sommes-nous |  |  | Qui sommes-nous ?',
  'header : a | https://app.hippodoc.fr/auth | landing_login_header |  |  | Connexion',
  'header : a | https://app.hippodoc.fr/auth?tab=signup |  | cta_signup_header |  | Essai gratuit 30j',
  'header : a | https://app.hippodoc.fr/auth?tab=signup |  | cta_signup_header_pill |  | Essai gratuit',
  'header : label |  | landing_mobile_menu_open |  |  |',
  'header : a | /#sous-la-surface | landing_mobile_nav_comment_ca_marche |  |  | Comment ça marche',
  'header : a | /#parcours | landing_mobile_nav_pour_qui |  |  | Pour qui',
  'header : a | /#pricing | landing_mobile_nav_pricing |  |  | Tarifs',
  'header : a | /simulateur | landing_mobile_resource_simulateur |  |  | Simulateur',
  'header : a | /guide | landing_mobile_resource_guide-remplacant |  |  | Guide du remplaçant (PDF)',
  'header : a | /guide-declarations | landing_mobile_resource_guide-declarations |  |  | Guide déclarations',
  'header : a | /blog | landing_mobile_resource_blog |  |  | Blog',
  'header : a | /faq | landing_mobile_resource_faq |  |  | FAQ',
  'header : a | /qui-sommes-nous | landing_mobile_resource_qui-sommes-nous |  |  | Qui sommes-nous ?',
  'header : a | https://app.hippodoc.fr/auth?tab=signup |  | cta_signup_header_mobile |  | Essai gratuit 30j',
  'footer : a | / | landing_footer_home |  |  | Hippodoc',
  'footer : a | tel:+33756898961 | landing_footer_phone |  |  | Téléphone',
  'footer : a | mailto:contact@hippodoc.fr | landing_footer_email |  |  | Email',
  'footer : a | https://www.linkedin.com/company/hippodoc/ | landing_footer_linkedin |  |  | LinkedIn',
  'footer : a | https://www.facebook.com/profile.php?id=61574895730373 | landing_footer_facebook |  |  | Facebook',
  'footer : a | https://www.instagram.com/hippodoc.fr/ | landing_footer_instagram |  |  | Instagram',
  'footer : button |  |  |  | data-cookie-prefs | Préférences cookies',
];
// Pages sans l'en-tête ni le pied du site, et pourquoi.
const PAGES_SANS_ENTETE = new Set([
  '/essai/index.html',         // page de campagne, noindex : son propre en-tête, sans menu
  '/transmissions/index.html', // page HTML déposée dans public/, hors Astro
]);
// SHA-256 du micro-script du tiroir, espaces réduits : le même que dans l'ancien
// Header.astro (relevé sur le build de main avant la phase 5a).
const EMPREINTE_SCRIPT_TIROIR = '10a3011d80ece8d8fd07d7623db4b6642c3f1aea2eb69c85ef2ab6f04277a547';

function reperesNavigation(html, balise, classe) {
  const bloc = html.match(new RegExp(`<${balise}\\b[^>]*\\sclass="${classe}\\b[^"]*"[\\s\\S]*?</${balise}>`))?.[0];
  if (!bloc) return null;
  const scripts = [...bloc.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const sansScript = bloc.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const reperes = [];
  for (const m of sansScript.matchAll(/<(a|button|label)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const attr = (nom) => m[2].match(new RegExp(`\\s${nom}="([^"]*)"`))?.[1] ?? '';
    const prefs = /\sdata-cookie-prefs\b/.test(m[2]) ? 'data-cookie-prefs' : '';
    const href = attr('href'), ph = attr('data-ph'), track = attr('data-track');
    if (!href && !ph && !track && !prefs) continue;
    const libelle = m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() || attr('aria-label');
    reperes.push(`${balise} : ${[m[1], href, ph, track, prefs, libelle].join(' | ').trim()}`);
  }
  return { reperes, scripts };
}
{
  const { createHash } = await import('node:crypto');
  const navAccueil = { header: reperesNavigation(accueil, 'header', 'hd'), footer: reperesNavigation(accueil, 'footer', 'ft') };
  if (!navAccueil.header || !navAccueil.footer) {
    fail('en-tête et pied : <header class="hd …"> ou <footer class="ft …"> introuvable sur l\'accueil');
  } else {
    // a. La mesure de l'en-tête et du pied.
    const mesures = [...navAccueil.header.reperes, ...navAccueil.footer.reperes]
      .filter((r) => { const c = r.split(' | '); return c[2] || c[3] || c[4]; });
    const rang = [...MESURE_ENTETE_PIED, ''].findIndex((r, i) => r !== mesures[i]);
    if (rang < MESURE_ENTETE_PIED.length || mesures.length !== MESURE_ENTETE_PIED.length) {
      fail(
        `en-tête et pied : la mesure diverge de MESURE_ENTETE_PIED au repère ${rang + 1} — ` +
        `attendu « ${MESURE_ENTETE_PIED[rang] ?? 'rien'} », rendu « ${mesures[rang] ?? 'rien'} ». ` +
        `Un data-ph ou un data-track retiré arrête sa série PostHog : le remettre, ou mettre la liste à jour si c'est voulu`
      );
    }
    // b et c. Toutes les pages du build.
    let pagesAvecEntete = 0;
    for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
      const html = readFileSync(resolve(dist, f.slice(1)), 'utf8');
      const page = f.replace(/\/index\.html$/, '') || '/';
      const scriptsTiroir = [...html.matchAll(/<script\b(?![^>]*\b(?:src|type)=)[^>]*>([\s\S]*?)<\/script>/g)]
        .filter((m) => m[1].includes("getElementById('mobile-menu-drawer')"));
      const entete = reperesNavigation(html, 'header', 'hd');
      const pied = reperesNavigation(html, 'footer', 'ft');
      if (!entete && !pied) {
        if (!PAGES_SANS_ENTETE.has(f)) fail(`${page} : ni l'en-tête ni le pied du site — rendre Header.astro et Footer.astro, ou déclarer la page dans PAGES_SANS_ENTETE`);
        if (scriptsTiroir.length) fail(`${page} : le micro-script du tiroir mobile est rendu sans l'en-tête — il lèverait une erreur (tiroir absent)`);
        if (html.includes('id="mobile-menu-drawer"')) fail(`${page} : un tiroir mobile sans l'en-tête du site`);
        continue;
      }
      if (PAGES_SANS_ENTETE.has(f)) fail(`${page} : déclarée dans PAGES_SANS_ENTETE, mais elle rend l'en-tête ou le pied du site`);
      if (!entete || !pied) {
        fail(`${page} : ${entete ? 'l\'en-tête du site sans son pied (le micro-script du tiroir, rendu par Footer.astro, manquerait)' : 'le pied du site sans son en-tête (le micro-script du tiroir lèverait une erreur)'}`);
        continue;
      }
      pagesAvecEntete++;
      for (const [balise, ici] of [['header', entete], ['footer', pied]]) {
        const a = navAccueil[balise].reperes, b = ici.reperes;
        const ecart = [...a, ''].findIndex((r, i) => r !== b[i]);
        if (ecart < a.length || a.length !== b.length) {
          fail(`${page} : <${balise}> diffère de celui de l'accueil au repère ${ecart + 1} — accueil « ${a[ecart] ?? 'rien'} », ici « ${b[ecart] ?? 'rien'} ». Il n'y a qu'un en-tête et qu'un pied : Header.astro et Footer.astro`);
        }
      }
      if ((html.match(/<header\b[^>]*\sclass="hd\b/g) ?? []).length !== 1 || (html.match(/\sid="mobile-menu-drawer"/g) ?? []).length !== 1) {
        fail(`${page} : l'en-tête du site (ou son tiroir mobile) est rendu plus d'une fois`);
      }
      if (entete.scripts.length) fail(`${page} : un script en ligne est revenu dans <header> — il doit rester dans ScriptTiroir.astro, après le pied`);
      if (scriptsTiroir.length !== 1) {
        fail(`${page} : le micro-script du tiroir mobile est rendu ${scriptsTiroir.length} fois (attendu : une seule, par Footer.astro)`);
        continue;
      }
      if (scriptsTiroir[0].index < html.indexOf('</footer>')) fail(`${page} : le micro-script du tiroir mobile est rendu avant la fin du pied`);
      const empreinte = createHash('sha256').update(scriptsTiroir[0][1].replace(/\s+/g, ' ').trim()).digest('hex');
      if (empreinte !== EMPREINTE_SCRIPT_TIROIR) {
        fail(`${page} : le micro-script du tiroir mobile a changé (empreinte ${empreinte.slice(0, 12)}…) — il ne se modifie pas sans décision ; mettre alors EMPREINTE_SCRIPT_TIROIR à jour`);
      }
    }
    console.log(`En-tête et pied : ${pagesAvecEntete} pages, mêmes liens et même mesure que l'accueil, micro-script du tiroir une fois par page`);
  }
}

/* 4 quinquies. Instrumentation des autres pages marketing.
   Même logique que la landing : les événements sont reconstruits depuis le DOM.
   Une rubrique de FAQ renommée, une section de guide disparue ou un article sans
   métadonnées casserait la mesure sans casser le build. */
const SECTIONS_GUIDE = ['profils', 'flux', 'cases', 'fiches', 'questions', 'glossaire', 'calendrier', 'problemes'];
const SECTIONS_FAQ = ['tarifs', 'paiements', 'revenus', 'cotisations', 'documents',
  'contact', 'planification', 'securite', 'mobile', 'activite'];

const guide = readFileSync(resolve(dist, 'guide-declarations/index.html'), 'utf8');
for (const s of SECTIONS_GUIDE) {
  if (!guide.includes(`id="${s}"`)) fail(`/guide-declarations : section « ${s} » absente — guide_declarations_section_viewed ne partira plus pour elle`);
}
const faq = readFileSync(resolve(dist, 'faq/index.html'), 'utf8');
for (const s of SECTIONS_FAQ) {
  if (!faq.includes(`id="${s}"`)) fail(`/faq : rubrique « ${s} » absente — faq_question_opened perdrait cette section`);
}
if (!readFileSync(resolve(dist, 'blog/index.html'), 'utf8').includes('data-blog-total=')) {
  fail('/blog : data-blog-total absent — blog_index_viewed perdrait total_articles');
}

// Chaque article doit porter ses métadonnées ET son repère de fin de texte.
const articles = fichiersDist.filter(
  (f) =>
    f.startsWith('/blog/') &&
    f.endsWith('/index.html') &&
    f !== '/blog/index.html' &&            // l'index du blog n'est pas un article
    !f.startsWith('/blog/serie/')          // ni les pages de série
);
let articlesSansMeta = 0, articlesSansFin = 0;
for (const f of articles) {
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8');
  const complet = ['data-blog-slug', 'data-blog-category', 'data-blog-series', 'data-blog-episode']
    .every((a) => html.includes(a));
  if (!complet) { articlesSansMeta++; if (articlesSansMeta <= 2) fail(`${f.replace('/index.html', '')} : métadonnées d'article incomplètes (blog_article_viewed / blog_scroll_depth)`); }
  if (!html.includes('data-blog-fin')) { articlesSansFin++; if (articlesSansFin <= 2) fail(`${f.replace('/index.html', '')} : repère data-blog-fin absent — blog_read_completed ne partira pas`); }
}
if (articlesSansMeta > 2) fail(`… et ${articlesSansMeta - 2} autre(s) article(s) sans métadonnées`);
if (articlesSansFin > 2) fail(`… et ${articlesSansFin - 2} autre(s) article(s) sans repère de fin`);

/* 4 sexies. Liens de prise de rendez-vous.
   Trois exigences, chacune apprise d'un défaut réel :
     - `data-calendly` conditionne À LA FOIS la propagation des UTM (donc
       l'attribution d'un rendez-vous à sa campagne) et la mesure du clic. Un lien
       ajouté sans cet attribut serait muet, sans que rien ne le signale.
     - la durée annoncée doit correspondre à l'événement Calendly réel (15 min).
       Le site a annoncé « 10 min » pendant des mois : une promesse fausse dès le
       premier contact.
     - un emplacement ne doit pas apparaître deux fois sur une même page (un
       doublon a bel et bien été introduit sur /simulateur pendant ce chantier). */
const DUREE_RDV = 15;
for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8');
  if (!html.includes('calendly.com')) continue;
  const page = f.replace(/\/index\.html$/, '') || '/';
  const vus = new Set();
  // `matchAll` rend la correspondance complète en position 0 : sans la virgule
  // initiale, `texte` recevrait les attributs et le contrôle de durée serait muet.
  for (const [, balise, texte] of html.matchAll(/<a\b([^>]*calendly\.com[^>]*)>([\s\S]*?)<\/a>/g)) {
    const emplacement = balise.match(/data-calendly="([^"]+)"/)?.[1];
    if (!emplacement) {
      fail(`${page} : lien Calendly sans data-calendly — ni attribution UTM ni mesure du clic`);
      continue;
    }
    if (vus.has(emplacement)) fail(`${page} : deux liens Calendly « ${emplacement} » sur la même page`);
    vus.add(emplacement);
    const minutes = texte.replace(/<[^>]*>/g, ' ').match(/(\d+)\s*min/);
    if (minutes && Number(minutes[1]) !== DUREE_RDV) {
      fail(`${page} : le lien Calendly « ${emplacement} » annonce ${minutes[1]} min alors que l'événement en dure ${DUREE_RDV}`);
    }
  }
}

/* 4 septies. Le schéma FAQPage doit refléter le texte VISIBLE.
   Google l'exige, et le défaut est silencieux : la page d'accueil portait deux
   copies manuscrites des mêmes questions — une pour l'affichage, une pour le
   JSON-LD — que rien ne forçait à rester identiques. Elles sont désormais dérivées
   d'une source unique ; ce contrôle empêche qu'on recommence.
   Questions et réponses, sur toutes les pages (§ 9.ez ; les réponses n'étaient
   comparées que sur l'accueil depuis § 9.ex).

   Depuis § 9.fc, la réponse n'est plus cherchée « quelque part dans la page » (une
   inclusion : deux réponses échangées, une réponse réduite à « Oui. » passaient). Sur le
   build du 13 novembre 2026, les 391 questions des 58 schémas sont chacune le texte entier
   d'un élément du <summary> d'un seul <details>, et leur réponse est dans un conteneur
   connu de ce pli (`.qa-in` 325 fois, `.gd-reponse` 66 fois). Le contrôle exige cette
   structure. Pour chaque question du schéma :
     1. la réponse existe : ni absente, ni vide ;
     2. la question est le titre d'un pli : le texte entier d'un élément du premier
        <summary> d'un <details>, que rien ne précède dans le pli. Entre elle et le
        conteneur de la réponse, et devant elle dans le <summary>, un repère au plus
        (SEUIL_REPERE signes, sans lettre : « + », un numéro). Une question qui n'est le
        titre d'aucun pli, un pli sans conteneur reconnu : une erreur, la réponse ne serait
        comparée à rien (il n'y a plus de repli sur « la réponse suit sa question ») ;
     3. le texte du conteneur est ÉGAL à la réponse du schéma, du premier au dernier
        signe (espaces mises à part), sauf exception déclarée dans EXCEPTIONS_FAQ ; le
        pli ne contient rien d'autre après lui, sauf, dans le guide, les blocs de
        HORS_REPONSE_DU_PLI ;
     4. les mots se séparent aux mêmes endroits des deux côtés, dans la question comme
        dans la réponse (et dans la phrase d'une exception) ;
     5. ni le conteneur, ni un ancêtre, ni un élément de la réponse ou de la question qui
        porte du texte n'est masqué : attribut `hidden`, style en ligne `display:none` /
        `visibility:hidden`, élément dont le navigateur n'affiche pas le contenu (<dialog>
        fermé, <canvas>, <datalist>…) ;
     6. sens inverse : dans l'élément qui contient un pli du schéma, tout autre <details>
        est lui aussi une question du schéma.
   Et pour l'ensemble : une page qui cite « FAQPage » en a un bloc, un seul, lisible à la
   racine d'un JSON-LD (quels que soient les attributs de sa balise <script>), sans
   question répétée ; le nombre de pages à FAQPage et de questions ne passe pas sous
   PLANCHER_FAQ.
   Ce que le contrôle ne voit pas (essais par mutation, § 9.fc) :
     - une réponse masquée par une règle de feuille de style (classe `sr`, `hidden` de
       Tailwind…) ou par un autre style en ligne (`opacity:0`, hauteur nulle). Un
       <details> fermé n'est pas masqué ;
     - le balisage admis dans le schéma, retiré avant de comparer : une balise de
       BALISE_DE_REPONSE (`<b>` ajouté dans une réponse) partout ; `**`, `*`, accents
       graves et ⚠️ ✅ 💡 dans le guide (sansBalisageDuGuide). Voulu. Pour les trois
       marqueurs, ni lequel c'est ni sa place ne sont comparés à l'icône affichée : un ⚠️
       devenu ✅ dans le schéma, ou déplacé d'une phrase, passe ;
     - dans le guide, une espace ajoutée ou retirée là où l'écran n'a qu'une balise en
       ligne entre deux signes (puce, renvoi) : les deux lectures y sont admises ;
       partout, le nombre et la nature des espaces (insécable, retour à la ligne) : hors
       du guide, rien ne dit donc où le schéma va à la ligne (dans le guide, la puce
       « • » est comparée comme un signe) ;
     - un repère qui dirait quelque chose : trois signes sans lettre entre la question et
       sa réponse (« ✗ », « ≠ », « ?! ») passent comme le « + » d'un <summary> ;
     - ce qui s'affiche autour d'un pli sans être dedans : une phrase juste avant ou juste
       après le <details> ; la même question reprise ailleurs dans la page hors d'un pli
       (un titre suivi d'une autre réponse) ; une question affichée hors de l'élément qui
       contient les plis du schéma ; un bloc entier de questions ou une page entière
       absents du schéma tant que le total reste au-dessus du plancher ;
     - ce qui n'est pas du texte : des mots dessinés dans un <svg> ou portés par une image
       au milieu d'une réponse ;
     - dans le guide, le texte des étiquettes et des renvois « Voir aussi » d'un pli.
   Ce qu'il refuse alors que le texte est le même, à savoir avant de changer un gabarit :
     - une FAQ sous un autre balisage que <details> + conteneur connu (pli devenu <div>,
       conteneur renommé) : le déclarer ici d'abord ;
     - une FAQ dans un élément `hidden` (panneau d'onglet inactif, `hidden="until-found"`),
       alors qu'un <details> fermé passe ;
     - dans le guide, une puce affichée que le schéma n'a pas, ou une puce passée en
       feuille de style : adapter `reponsePourSchema` ou `sansBalisageDuGuide` ;
     - une entité nommée hors de la table ENTITES_FAQ. */

// Entités, décodées en UNE passe : « &amp;lt; » est le texte « &lt; », pas « < ».
// ⚠️ Les numériques aussi : Astro échappe l'apostrophe en `&#x27;` (hexadécimal) et non
// `&#39;`. Deux versions de ce contrôle ont produit 16 faux positifs sur
// /guide-declarations avant que ce soit vu. Et `&lt;` / `&gt;` : un « < » de texte
// (« DSAU < 1 », « < 38 000 € ») sort échappé dans la page, tel quel dans le schéma.
// Entités nommées (§ 9.fc) : celles de Latin-1 (« &eacute; », « &laquo; », « &nbsp; »…, dans
// l'ordre des codes 160 à 255) et la typographie courante. La casse compte (« &Eacute; » est
// « É »), sauf pour les quatre que HTML admet aussi en capitales. Une entité hors de cette
// table (« &NotEqual; », une lettre grecque) n'est pas décodée : elle sort en écart de texte.
const ENTITES_FAQ = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", AMP: '&', LT: '<', GT: '>', QUOT: '"',
  OElig: 'Œ', oelig: 'œ', Scaron: 'Š', scaron: 'š', Yuml: 'Ÿ', circ: 'ˆ', tilde: '˜',
  ensp: '\u2002', emsp: '\u2003', thinsp: '\u2009', hairsp: '\u200a', zwnj: '\u200c', zwj: '\u200d', lrm: '\u200e', rlm: '\u200f',
  ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', sbquo: '‚', ldquo: '“', rdquo: '”', bdquo: '„',
  dagger: '†', Dagger: '‡', bull: '•', hellip: '…', permil: '‰', prime: '′', Prime: '″', lsaquo: '‹', rsaquo: '›',
  oline: '‾', frasl: '⁄', euro: '€', trade: '™', larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔',
  minus: '−', ne: '≠', le: '≤', ge: '≥', asymp: '≈', infin: '∞', radic: '√', sum: '∑',
};
('nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest ' +
  'Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig ' +
  'agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml')
  .split(' ').forEach((nom, i) => { ENTITES_FAQ[nom] = String.fromCodePoint(160 + i); });
// Le trait d'union conditionnel (U+00AD, « &shy; ») ne s'affiche pas : une césure proposée
// au navigateur dans un mot long n'est pas un écart. Il est retiré des deux côtés.
const decoderEntites = (s) =>
  s.replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z][a-z0-9]*);/gi, (tout, e) => {
    if (e[0] !== '#') return Object.hasOwn(ENTITES_FAQ, e) ? ENTITES_FAQ[e] : tout;
    const code = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : Number(e.slice(1));
    return code <= 0x10ffff ? String.fromCodePoint(code) : tout;
  }).replace(/\u00ad/g, '');
// On compare sans AUCUNE espace, des deux côtés : un texte peut contenir du balisage
// interne (mise en gras via FormattedText), et remplacer une balise par une espace
// couperait un mot en deux. Première version de ce contrôle : 16 faux positifs sur
// /guide-declarations. Les frontières de mots sont vérifiées à part (point 4).
const compacterFaq = (s) => decoderEntites(s).replace(/\s+/g, '');

/* Lecture d'une page : son texte sans espaces (`compact`), ses éléments avec la plage
   de `compact` que chacun couvre, et ce qui sépare un signe du précédent (`ecart` :
   2 = une espace ou une balise de bloc, 1 = une balise en ligne seule, absent = rien).
   Sans le <head> ni les blocs qui ne s'affichent pas. Dans le HTML servi, tout « < » de
   texte est échappé : ce qui reste entre chevrons est une balise (valeurs d'attributs
   entre guillemets comprises, une valeur qui contient « > » ne coupe pas la balise).
   Une balise fermante sans ouvrante est ignorée ; un élément resté ouvert se ferme avec
   son parent. */
const BALISES_VIDES = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const BALISES_SANS_TEXTE = { head: /<\/head\s*>/gi, script: /<\/script\s*>/gi, style: /<\/style\s*>/gi, svg: /<\/svg\s*>/gi, template: /<\/template\s*>/gi, noscript: /<\/noscript\s*>/gi };
// Toute autre balise sépare deux mots (bloc, <br>, cellule, élément de liste). Les balises
// que le navigateur rend dans la ligne y sont toutes (§ 9.fc : `<ins>` et `<del>` manquaient,
// un mot corrigé devant une virgule sortait en écart de frontière).
const BALISES_EN_LIGNE = new Set([
  'a', 'abbr', 'acronym', 'audio', 'b', 'bdi', 'bdo', 'big', 'button', 'canvas', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'embed', 'font', 'i', 'iframe', 'img', 'input', 'ins',
  'kbd', 'label', 'map', 'mark', 'meter', 'nobr', 'object', 'output', 'picture', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'select', 'slot', 'small', 'source', 'span',
  'strike', 'strong', 'sub', 'sup', 'svg', 'textarea', 'time', 'track', 'tt', 'u', 'var', 'video', 'wbr',
]);
const JETON_HTML = /<!--[\s\S]*?-->|<!(?:"[^"]*"|'[^']*'|[^'">])*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
function lirePageFaq(html) {
  const els = []; // { nom, attrs, parent, d, f } — dans l'ordre du document
  const morceaux = [];
  const ecart = new Map();
  const pile = [];
  let n = 0;
  let attente = 0;
  let dernier = 0;
  const texte = (brut) => {
    const t = decoderEntites(brut);
    const mot = /\S+/g;
    let fin = 0;
    for (let m; (m = mot.exec(t)); fin = mot.lastIndex) {
      if (m.index > fin) attente = 2;
      if (attente) ecart.set(n, attente);
      attente = 0;
      morceaux.push(m[0]);
      n += m[0].length;
    }
    if (fin < t.length) attente = 2;
  };
  JETON_HTML.lastIndex = 0;
  for (let m; (m = JETON_HTML.exec(html)); ) {
    if (m.index > dernier) texte(html.slice(dernier, m.index));
    dernier = JETON_HTML.lastIndex;
    if (!m[2]) continue; // commentaire, doctype : ni texte ni séparation
    const nom = m[2].toLowerCase();
    attente = Math.max(attente, BALISES_EN_LIGNE.has(nom) ? 1 : 2);
    if (m[1]) {
      let k = pile.length - 1;
      while (k >= 0 && els[pile[k]].nom !== nom) k--;
      if (k >= 0) {
        for (let j = pile.length - 1; j >= k; j--) els[pile[j]].f = n;
        pile.length = k;
      }
      continue;
    }
    const autoFermante = /\/\s*$/.test(m[3]);
    const fermeture = BALISES_SANS_TEXTE[nom];
    if (fermeture) {
      if (autoFermante) continue;
      fermeture.lastIndex = dernier;
      if (!fermeture.exec(html)) { dernier = html.length; break; }
      JETON_HTML.lastIndex = dernier = fermeture.lastIndex;
      continue;
    }
    const vide = BALISES_VIDES.has(nom) || autoFermante;
    els.push({ nom, attrs: m[3], parent: pile.length ? pile[pile.length - 1] : -1, d: n, f: vide ? n : -1 });
    if (!vide) pile.push(els.length - 1);
  }
  if (dernier < html.length) texte(html.slice(dernier));
  for (const i of pile) els[i].f = n;
  return { els, compact: morceaux.join(''), ecart };
}
// Les descendants d'un élément le suivent dans `els`, d'un seul tenant : ce sont les
// suivants dont le parent n'est pas avant lui.
const finDeDescendance = (els, k) => {
  let j = k + 1;
  while (j < els.length && els[j].parent >= k) j++;
  return j;
};
// Les attributs d'une balise, comme le navigateur les lit : valeur entre guillemets doubles,
// simples ou sans guillemets, attribut collé au précédent, le premier d'un nom répété.
const attributsFaq = (e) => {
  const a = new Map();
  for (const m of e.attrs.matchAll(/([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+)))?/g)) {
    const nom = m[1].toLowerCase();
    if (!a.has(nom)) a.set(nom, m[2] ?? m[3] ?? m[4] ?? '');
  }
  return a;
};
const classesFaq = (e) => (attributsFaq(e).get('class') ?? '').split(/\s+/);
// Pour les messages : le texte d'une plage, une espace là où la page en a une.
// `des` = 1 : une espace aussi là où seule une balise en ligne sépare deux signes.
const texteLisibleFaq = (lu, d, f, des = 2) => {
  let s = '';
  for (let i = d; i < f; i++) s += (i > d && (lu.ecart.get(i) ?? 0) >= des ? ' ' : '') + lu.compact[i];
  return s;
};
// Ce qu'un contrôle statique voit d'un élément masqué : l'attribut `hidden` (pas la
// classe du même nom, ni `aria-hidden`), le style en ligne, et les éléments dont le
// navigateur n'affiche pas le contenu (un <dialog> sans `open`, le contenu de repli d'un
// <canvas>, un <datalist>…). Pas les feuilles de style.
// `(?<![\w-])` : `backface-visibility: hidden` ne masque rien ; `content-visibility: hidden`, si.
const CONTENU_NON_AFFICHE = new Set(['audio', 'canvas', 'datalist', 'iframe', 'noembed', 'noframes', 'object', 'video']);
const masqueFaq = (e) => {
  const a = attributsFaq(e);
  return a.has('hidden') ||
    /(?<![\w-])(?:display\s*:\s*none|(?:content-)?visibility\s*:\s*(?:hidden|collapse))/i.test(decoderEntites(a.get('style') ?? '')) ||
    CONTENU_NON_AFFICHE.has(e.nom) || (e.nom === 'dialog' && !a.has('open'));
};

// Réponse du schéma : du texte. Seules de vraies balises en sont retirées, celles que
// Google lit dans une réponse (aucune aujourd'hui). `/<[^>]+>/` y prenait un « < » de
// texte pour une balise et avalait la suite jusqu'au « > » suivant.
// Une balise de bloc sépare deux mots, elle laisse une espace ; une balise en ligne non
// (« <b>Totalement</b>. » se lit « Totalement. ») : depuis § 9.fc les frontières de mots
// sont comparées, une espace de trop devant le point y ferait un écart.
const BALISE_DE_REPONSE = /<\/?(h[1-6]|br|ol|ul|li|a|p|div|b|strong|i|em)(?:\s[^<>]*)?\/?>/gi;
const sansBalisesDeReponse = (s) => s.replace(BALISE_DE_REPONSE, (_, nom) => (/^(?:a|b|strong|i|em)$/i.test(nom) ? '' : ' '));
/* Le guide des déclarations écrit ses réponses dans le balisage que
   `src/components/guide/FormattedText.tsx` rend à l'écran, et son schéma reprend cette
   source telle quelle. Ce balisage n'est pas du texte, il est retiré de la réponse avant
   de comparer : `**gras**`, `*italique*`, `code` entre accents graves (MARKDOWN_PATTERN,
   même expression) et les marqueurs de bloc ⚠️ ✅ 💡 (splitOnMarkers : rendus en icône).
   La puce de début de ligne, « - » ou « • », devient « • », le signe que l'écran affiche
   (splitParagraphLines) : depuis § 9.fc elle reste dans la comparaison, des deux côtés
   (elle en était retirée, et une liste mise à plat dans le schéma passait). Rien
   d'autre : un renvoi interne (« QT-014 », rendu « Question · … ») ou une énumération que
   l'écran met en liste en lui ôtant ses virgules restent des écarts de texte. Ailleurs,
   aucun balisage n'est toléré dans une réponse. */
const SCHEMA_EN_SOURCE_DU_GUIDE = (page) =>
  page.startsWith('/guide-declarations') && page !== '/guide-declarations/calculette';
const sansBalisageDuGuide = (s) =>
  s
    .replace(/\*\*([^*]+?)\*\*|\*(?!\s)([^*\n]+?)(?<!\s)\*|`([^`]+?)`/g, (_, gras, italique, code) => gras ?? italique ?? code)
    .replace(/⚠️|✅|💡/g, ' ')
    .replace(/^[ \t]*[•-]\s+/gm, '• ');

/* Où la réponse se lit dans un pli : le premier élément du <details> qui porte une de ces
   classes. `.qa-in` : plis de la DA (`.qa` de da.css : accueil, /faq, /tarifs, /simulateur,
   /comparatif, calculette, articles). `.gd-reponse` : questions du guide des déclarations. */
const CONTENEURS_DE_REPONSE = ['qa-in', 'gd-reponse'];
/* Ce qu'un pli peut contenir après la réponse sans que le schéma le porte : dans le
   guide, et là seulement, les étiquettes de la question (statut, mots-clés) et ses
   renvois « Voir aussi » (66 plis sur 66 au relevé). Ce n'est pas la réponse. Tout autre
   texte échoue. */
const HORS_REPONSE_DU_PLI = ['gd-etiquettes', 'gd-croises'];
/* Ce que l'écran peut porter autour de la question sans que le schéma le dise : un
   repère, pas un mot. Relevé du 13 novembre 2026, 391 réponses.
   Entre la fin de la question et le début de sa réponse : rien 379 fois, 1 signe 12 fois
   (le « + » du <summary>, calculette et simulateur). Avant la question, dans le
   <summary> : rien 359 fois, le numéro de `/faq` 32 fois (1 ou 2 chiffres).
   D'où la règle : SEUIL_REPERE signes au plus (hors espaces), soit le plus long relevé
   (2) et un de marge (un numéro à trois chiffres, « 1. », « + − »), sans aucune lettre ;
   et sans chiffre après la question. Une longueur seule ne suffisait pas : « Oui »,
   « Non » et « Si » tiennent en trois signes, et glissés entre la question et la réponse
   ils la contredisent. */
const SEUIL_REPERE = 3;
const estRepereFaq = (signes, chiffresAdmis) =>
  signes.length <= SEUIL_REPERE && !(chiffresAdmis ? /\p{L}/u : /[\p{L}\p{N}]/u).test(signes);
/* Plancher : le nombre de pages qui portent un FAQPage et le nombre de leurs questions ne
   baissent pas sans qu'on le décide. Le reste du contrôle part du schéma : une page qui
   perd tout son FAQPage, ou un bloc entier de questions retiré du schéma et resté à
   l'écran (une rubrique de `/faq`, un groupe du guide), n'y laisse rien à comparer.
   Compte du 13 novembre 2026. Au-dessus (nouvel article, nouvelle question) : un
   avertissement, relever le plancher. En dessous : une erreur, ne l'abaisser que si la
   disparition est voulue. */
const PLANCHER_FAQ = { pages: 58, questions: 391 };
/* Écarts connus entre l'écran et le schéma, déclarés un par un. Chaque passage sort un
   avertissement par exception ; une exception qui ne correspond plus à rien (page ou
   question disparue, texte qui n'est plus à l'écran) fait échouer le contrôle : on la
   retire. Une exception ne couvre que son texte, mot pour mot, à sa place : à la suite de
   la réponse du schéma, dans son conteneur (les quatre écarts connus sont de cette forme).
   En ajouter une est une décision de contenu : elle se liste dans MIGRATION.md pour le
   propriétaire. */
const EXCEPTIONS_FAQ = [
  {
    page: '/faq',
    question: "C'est quoi les revenus PDSA / exonérés ?",
    texte: 'Le détail : ce qui est exonéré et comment le déclarer.',
    raison: 'phrase à lien vers /blog/pdsa-exoneration-gardes-regulees, à l\'écran seulement (§ 9.fa, § 9.fc)',
  },
  {
    page: '/faq',
    question: "Qu'est-ce que les rétrocessions versées ?",
    texte: 'Côté remplaçant, voir comment se négocie une rétrocession.',
    raison: 'phrase à lien vers /blog/retrocession-honoraires-medecin-remplacant, à l\'écran seulement (§ 9.fa, § 9.fc)',
  },
  {
    page: '/faq',
    question: 'Mes cotisations URSSAF, elles se calculent toutes seules ?',
    texte: "Pour comprendre chaque cotisation : l'URSSAF et la CARMF expliquées.",
    raison: 'phrase à liens vers /blog/tout-comprendre-urssaf et /blog/tout-comprendre-carmf, à l\'écran seulement (§ 9.fa, § 9.fc)',
  },
  {
    page: '/faq',
    question: 'Quel est le meilleur régime fiscal pour moi : Micro-BNC ou réel ?',
    texte: 'La règle complète : micro-BNC ou réel.',
    raison: 'phrase à lien vers /blog/regime-fiscal-micro-bnc-vs-reel, à l\'écran seulement (§ 9.fa, § 9.fc)',
  },
];

// Pour le message d'erreur : le premier endroit où la réponse du schéma quitte le texte
// affiché à partir de `debut` (derniers mots communs, suite dans le schéma, suite dans la
// page).
function premierEcartFaq(lu, reponse, debut, fin) {
  const mots = reponse.trim().split(/\s+/);
  const rep = mots.join('');
  let commun = 0;
  while (commun < rep.length && debut + commun < fin && rep[commun] === lu.compact[debut + commun]) commun++;
  let n = 0;
  let signes = 0; // les n premiers mots, entiers, sont communs
  while (n < mots.length && signes + mots[n].length <= commun) signes += mots[n++].length;
  const ici = debut + signes;
  const aLaPage = ici < fin ? `« ${texteLisibleFaq(lu, ici, Math.min(fin, ici + 70))} »` : null;
  const auSchema = n < mots.length ? `« ${mots.slice(n, n + 8).join(' ')} »` : null;
  if (n === 0) return `dès le premier mot : le schéma commence par ${auSchema}, la page par ${aLaPage ?? '« » (rien)'}`;
  return `après « …${mots.slice(Math.max(0, n - 5), n).join(' ')} » : ${auSchema ? `le schéma continue par ${auSchema}` : 'le schéma s\'arrête là'}, ${aLaPage ? `la page ${auSchema ? '' : 'continue '}par ${aLaPage}` : 'la réponse affichée s\'arrête là'}`;
}
// Point 4. Les signes sont les mêmes des deux côtés ; les mots se séparent-ils aux mêmes
// endroits ? `texte` (question ou réponse du schéma) se lit à l'écran à partir de `base`.
// Là où le schéma n'a pas d'espace, l'écran n'en a pas non plus (une balise en ligne au
// milieu d'un mot, ou collée à une ponctuation, n'en est pas une : 828 fois au relevé).
// Là où le schéma a une espace, l'écran a une espace ou une balise de bloc ; une balise
// en ligne seule (« mot<strong>suite ») ne sépare rien à l'écran, c'est un écart. Sauf
// dans le guide (`enLigneSepare`), où une puce et un renvoi sont des éléments en ligne
// que la feuille écarte de leur voisin (124 fois au relevé, toutes dans le guide).
// Relevé : aucun écart sur les 391 questions et les 391 réponses, ponctuation comprise.
function ecartDeFrontiereFaq(lu, texte, base, enLigneSepare) {
  const t = texte.trim();
  let k = 0;
  let espace = false;
  for (let i = 0; i < t.length; i++) {
    if (/\s/.test(t[i])) { espace = true; continue; }
    const g = k ? lu.ecart.get(base + k) ?? 0 : -1; // premier signe : rien à comparer
    if (g >= 0 && (espace ? g === 0 || (g === 1 && !enLigneSepare) : g === 2)) {
      const avant = t.slice(Math.max(0, i - 30), i).trimEnd().split(/\s+/).pop();
      const apres = t.slice(i, i + 30).split(/\s+/)[0];
      if (!espace) return `le schéma écrit « ${avant}${apres} » sans espace, la page « ${avant} ${apres} »`;
      return `le schéma écrit « ${avant} ${apres} », la page « ${avant}${apres} », ${g ? 'avec une balise en ligne pour toute séparation' : 'sans espace'}`;
    }
    espace = false;
    k++;
  }
  return null;
}
/* Examen d'un pli : la réponse `reponse` (texte du schéma, `rep` sans espaces) contre le
   <details> `det`, dont l'élément `el` du <summary> est la question `question`. Rend les
   défauts trouvés (phrases qui complètent « la réponse à « … » … »). `guide` : la page
   est du guide des déclarations (blocs admis après la réponse, puces et renvois). */
function examinerPliFaq(lu, { det, som, el }, question, reponse, rep, exception, guide) {
  const { els, compact } = lu;
  const finQuestion = els[el].f;
  const finDuPli = finDeDescendance(els, det);
  let cont = -1;
  for (let j = det + 1; j < finDuPli && cont < 0; j++) {
    if (classesFaq(els[j]).some((c) => CONTENEURS_DE_REPONSE.includes(c))) cont = j;
  }
  if (cont < 0) {
    // Pas de repli sur « la réponse suit sa question » : c'était une inclusion, une réponse
    // tronquée y passait (§ 9.fc). Un pli sans conteneur reconnu n'est comparé à rien.
    return { defauts: [`du JSON-LD FAQPage n'est comparée à rien : son pli n'a pas de conteneur ${CONTENEURS_DE_REPONSE.map((x) => `.${x}`).join(' ou ')}. Un nouveau gabarit de réponse se déclare dans CONTENEURS_DE_REPONSE (verify-site.mjs)`] };
  }
  const c = els[cont];
  const defauts = [];
  // Point 5 : masqué.
  const masques = [];
  for (let k = cont; k >= 0; k = els[k].parent) if (masqueFaq(els[k])) masques.push(els[k]);
  for (let k = el; k >= 0 && k !== det; k = els[k].parent) if (masqueFaq(els[k])) masques.push(els[k]);
  // Un élément masqué sans texte ne retire rien à la réponse (case à cocher d'une
  // interaction en CSS seul, image d'un pixel).
  for (const racine of [el, cont]) {
    for (let j = racine + 1, fin = finDeDescendance(els, racine); j < fin; j++) if (els[j].f > els[j].d && masqueFaq(els[j])) masques.push(els[j]);
  }
  if (masques.length) {
    defauts.push(`est dans le JSON-LD FAQPage mais masquée à l'écran, elle ou sa question, en tout ou partie : ${masques.map((e) => `<${e.nom}${e.attrs}>`.replace(/\s+/g, ' ').slice(0, 110)).join(', ')}`);
  }
  // Point 2 : la question est le titre du pli, la réponse commence juste après elle.
  // Le titre d'un <details> est son premier <summary> enfant ; tout ce qui le précède dans
  // le pli (du texte, un autre <summary>) s'affiche avec la réponse, pli ouvert.
  let premierSommaire = det + 1;
  while (premierSommaire < finDuPli && !(els[premierSommaire].parent === det && els[premierSommaire].nom === 'summary')) premierSommaire++;
  if (premierSommaire !== som || els[som].d !== els[det].d) {
    defauts.push(`du JSON-LD FAQPage répond à une question qui n'est pas le premier contenu de son <details> : ${premierSommaire !== som ? 'un autre <summary> la précède, c\'est lui que le navigateur prend pour titre' : `« ${texteLisibleFaq(lu, els[det].d, Math.min(els[som].d, els[det].d + 80))} » précède son <summary>, et s'affiche avec la réponse`}`);
  }
  if (!estRepereFaq(compact.slice(els[som].d, els[el].d), true)) {
    defauts.push(`du JSON-LD FAQPage répond à une question que l'écran fait précéder de « ${texteLisibleFaq(lu, els[som].d, Math.min(els[el].d, els[som].d + 80), 1)} » dans son <summary> : un repère seulement (${SEUIL_REPERE} signes au plus, sans lettre : un numéro)`);
  }
  if (!estRepereFaq(compact.slice(finQuestion, c.d), false)) {
    defauts.push(`du JSON-LD FAQPage ne suit pas sa question à l'écran : « ${texteLisibleFaq(lu, finQuestion, Math.min(c.d, finQuestion + 80), 1)} » les sépare, un repère seulement (${SEUIL_REPERE} signes au plus, ni lettre ni chiffre : le « + » d'un <summary>)`);
  }
  const frontiereDeQuestion = ecartDeFrontiereFaq(lu, question, els[el].d, guide);
  if (frontiereDeQuestion) defauts.push(`du JSON-LD FAQPage répond à une question qui ne sépare pas les mots comme l'écran : ${frontiereDeQuestion}`);
  // Point 3 : rien d'autre dans le pli après le conteneur…
  let admis = 0;
  for (let j = finDeDescendance(els, cont); j < finDuPli; ) {
    const hors = guide && classesFaq(els[j]).some((x) => HORS_REPONSE_DU_PLI.includes(x));
    if (hors) admis += els[j].f - els[j].d;
    j = hors ? finDeDescendance(els, j) : j + 1;
  }
  if (els[det].f - c.f !== admis) {
    defauts.push(`du JSON-LD FAQPage n'a pas tout ce que son pli affiche : du texte suit la réponse hors de son conteneur (« ${texteLisibleFaq(lu, c.f, Math.min(els[det].f, c.f + 80))} »)`);
  }
  // … et le conteneur dit la réponse, ni plus ni moins.
  const affiche = compact.slice(c.d, c.f);
  let exceptionVue = false;
  if (affiche === rep && exception) {
    defauts.push(`: exception périmée dans EXCEPTIONS_FAQ — « ${exception.texte} » n'est plus à l'écran après la réponse, qui est égale au schéma : retirer l'exception`);
  } else if (affiche !== rep + (exception ? compacterFaq(exception.texte) : '')) {
    defauts.push(`du JSON-LD FAQPage n'est pas, mot pour mot, la réponse affichée sous cette question${exception ? ` (l'exception déclarée, « ${exception.texte} » après la réponse, ne couvre pas cet écart)` : ''}. Premier écart ${premierEcartFaq(lu, reponse, c.d, c.f)}`);
  } else {
    exceptionVue = Boolean(exception);
    // Les mots de la phrase d'une exception se séparent eux aussi comme à l'écran, et elle
    // est séparée de la réponse.
    const frontiere = ecartDeFrontiereFaq(lu, exception ? `${reponse} ${exception.texte}` : reponse, c.d, guide);
    if (frontiere) defauts.push(`du JSON-LD FAQPage ne sépare pas les mots comme l'écran : ${frontiere}`);
  }
  return { defauts, exceptionVue };
}

// Tout bloc JSON-LD de la page, quels que soient les autres attributs de sa balise et ses
// guillemets : un second FAQPage rangé dans `<script type="application/ld+json" id="…">`
// n'était pas lu (§ 9.fc).
const SCRIPT_JSON_LD = /<script\b[^>]*?\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json(?=[\s>]))[^>]*>([\s\S]*?)<\/script\s*>/gi;
const exceptionsFaqRencontrees = new Set();
const compteFaq = { pages: 0, questions: 0 };
for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8');
  if (!html.includes('"FAQPage"') && !html.includes("'FAQPage'")) continue;
  const page = f.replace(/\/index\.html$/, '') || '/';
  const source = SCHEMA_EN_SOURCE_DU_GUIDE(page);
  const lu = lirePageFaq(html);
  const { els, compact } = lu;
  // Les plis de la page : texte de chaque élément d'un <summary> → son <details>.
  const plis = new Map();
  els.forEach((e, k) => {
    if (e.nom !== 'summary' || e.parent < 0 || els[e.parent].nom !== 'details') return;
    for (let j = k, fin = finDeDescendance(els, k); j < fin; j++) {
      const titre = compact.slice(els[j].d, els[j].f);
      if (!titre) continue;
      if (!plis.has(titre)) plis.set(titre, []);
      if (!plis.get(titre).some((p) => p.det === e.parent)) plis.get(titre).push({ det: e.parent, som: k, el: j });
    }
  });
  const plisDuSchema = new Set();
  const questionsVues = new Set();
  let schemas = 0;
  for (const [, bloc] of html.matchAll(SCRIPT_JSON_LD)) {
    let parsed;
    try { parsed = JSON.parse(bloc); } catch { parsed = null; }
    if (parsed?.['@type'] !== 'FAQPage') {
      // Seul un bloc dont FAQPage est le type, à la racine, est comparé. Rangé ailleurs
      // (`@graph`, tableau) ou illisible, il ne le serait à rien.
      if (/["']FAQPage["']/.test(bloc)) fail(`${page} : un bloc JSON-LD cite « FAQPage » sans que ce soit son type à la racine (rangé dans un @graph ou un tableau, ou JSON illisible) — ses questions ne sont comparées à rien`);
      continue;
    }
    schemas++;
    // `mainEntity` : un tableau de questions ; schema.org admet aussi une question seule.
    const questions = [].concat(parsed.mainEntity ?? []);
    if (!questions.length) fail(`${page} : le JSON-LD FAQPage n'a aucune question`);
    compteFaq.questions += questions.length;
    for (const q of questions) {
      if (!q || typeof q !== 'object') { fail(`${page} : une entrée de mainEntity du JSON-LD FAQPage n'est pas une question`); continue; }
      const question = String(q.name ?? '').trim();
      if (!question) { fail(`${page} : une question du JSON-LD FAQPage n'a pas de texte`); continue; }
      const nom = `« ${question.length > 60 ? `${question.slice(0, 60)}…` : question} »`;
      const exception = EXCEPTIONS_FAQ.find((x) => x.page === page && x.question === question);
      if (exception) exceptionsFaqRencontrees.add(exception);
      const titre = compacterFaq(question);
      if (questionsVues.has(titre)) fail(`${page} : la question ${nom} figure deux fois dans le JSON-LD FAQPage de la page`);
      questionsVues.add(titre);
      const candidats = plis.get(titre) ?? [];
      for (const p of candidats) plisDuSchema.add(p.det);
      // Point 1. La réponse existe.
      const brute = decoderEntites(sansBalisesDeReponse(String(q.acceptedAnswer?.text ?? '')));
      const reponse = source ? sansBalisageDuGuide(brute) : brute;
      const rep = reponse.replace(/\s+/g, '');
      if (!rep) fail(`${page} : la réponse à ${nom} est absente ou vide dans le JSON-LD FAQPage`);
      // Point 2. La question est le titre d'un pli. Sinon sa réponse n'est comparée à rien :
      // une erreur, pas un repli sur « la réponse suit sa question » (§ 9.fc — un titre
      // changé d'un seul côté sur tout un bloc y faisait passer des réponses tronquées).
      if (!candidats.length) {
        fail(`${page} : la question ${nom} du JSON-LD FAQPage ${compact.includes(titre) ? 'est affichée, mais pas comme titre d\'un <details> (le texte entier d\'un élément de son <summary>)' : 'est absente du texte visible'} — sa réponse n'est comparée à rien. Si le titre affiché a changé, aligner le schéma`);
        continue;
      }
      if (!rep) continue;
      // Chaque pli qui porte la question est examiné (un seul par question aujourd'hui) :
      // la même question affichée deux fois avec deux réponses, c'est un écart.
      for (const pli of candidats) {
        const examen = examinerPliFaq(lu, pli, decoderEntites(question), reponse, rep, exception, source);
        for (const d of examen.defauts) fail(`${page} : la réponse à ${nom} ${d}`);
        if (examen.exceptionVue) {
          warn(`${page} : exception déclarée (EXCEPTIONS_FAQ) — à l'écran, la réponse à « ${question} » se poursuit par « ${exception.texte} », que le schéma FAQPage n'a pas : ${exception.raison}`);
        }
      }
    }
  }
  // Un seul FAQPage par page : deux blocs, même identiques, sont deux déclarations des
  // mêmes questions (et le compte du plancher s'en trouverait gonflé).
  if (schemas > 1) fail(`${page} : ${schemas} blocs JSON-LD FAQPage dans la page, un seul attendu`);
  if (schemas) compteFaq.pages++;
  else fail(`${page} : la page cite « FAQPage » mais aucun bloc JSON-LD de ce type n'est lisible à la racine d'un <script type="application/ld+json"> — ses questions ne sont comparées à rien`);
  // Point 6, sens inverse : dans un bloc de plis du schéma (l'élément qui les contient),
  // tout <details> est au schéma, à quelque profondeur qu'il soit. Sauf dans un pli du
  // schéma : il fait alors partie de sa réponse, comparée avec elle.
  const blocsFaq = new Set([...plisDuSchema].map((d) => els[d].parent));
  els.forEach((e, k) => {
    if (e.nom !== 'details' || plisDuSchema.has(k)) return;
    let a = e.parent;
    while (a >= 0 && !blocsFaq.has(a) && !plisDuSchema.has(a)) a = els[a].parent;
    if (a < 0 || plisDuSchema.has(a)) return;
    const som = els.findIndex((x, j) => j > k && x.parent === k && x.nom === 'summary');
    fail(`${page} : « ${som < 0 ? '(pli sans <summary>)' : texteLisibleFaq(lu, els[som].d, els[som].f, 1).slice(0, 80)} » est une question affichée parmi celles du schéma FAQPage, mais absente du schéma`);
  });
}
for (const x of EXCEPTIONS_FAQ) {
  if (!exceptionsFaqRencontrees.has(x)) fail(`${x.page} : exception périmée dans EXCEPTIONS_FAQ — la question « ${x.question} » n'est plus dans le schéma FAQPage de cette page : retirer l'exception`);
}
{
  const compte = `${compteFaq.pages} pages portent un FAQPage, ${compteFaq.questions} questions en tout (plancher : ${PLANCHER_FAQ.pages} pages, ${PLANCHER_FAQ.questions} questions)`;
  if (compteFaq.pages < PLANCHER_FAQ.pages || compteFaq.questions < PLANCHER_FAQ.questions) {
    fail(`FAQPage : ${compte} — un schéma ou des questions ont disparu. Si c'est voulu, abaisser PLANCHER_FAQ (verify-site.mjs)`);
  } else if (compteFaq.pages > PLANCHER_FAQ.pages || compteFaq.questions > PLANCHER_FAQ.questions) {
    warn(`FAQPage : ${compte} — si ce sont bien de nouvelles pages ou de nouvelles questions, relever PLANCHER_FAQ (verify-site.mjs) à ces nombres`);
  }
}

/* 4 septies bis. Aucun mot collé à une balise en ligne.
   Au build, Astro supprime un retour à la ligne collé à une balise en ligne, avant
   ou après elle : « ou⏎<strong>19 € » sort « ou<strong>19 € », lu « ou19 € »
   (MIGRATION.md § 9.ed point 5, puis § 9.ei : treize espaces perdues sur quatre pages).
   On cherche, dans le HTML servi, une lettre ou un chiffre collé à l'extérieur d'une
   balise <strong>, <a>, <em> ou <b> dont l'intérieur ne commence pas (ou ne finit
   pas) par une espace. Correction côté source : garder la balise sur la ligne du mot
   voisin, ou écrire {' '}.
   Une balise qui coupe un mot exprès se déclare ici, par page, sous la forme
   « avant<balise>après » (balise sans attributs). */
const MOTS_COUPES_EXPRES = {
  // Lien posé sur « cotisations sociales et impôt », le « s » du pluriel dehors.
  '/blog/tout-comprendre-carmf': ['impôt</a>s'],
};
const COLLE_A_UNE_BALISE =
  /([\p{L}\p{N}]+)(<(strong|a|em|b)(?:\s[^>]*)?>)(?=([^\s<]+))|([^\s<>]*[^\s>])(<\/(?:strong|a|em|b)>)([\p{L}\p{N}]+)/gu;
for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
  const page = f.replace(/\/index\.html$/, '') || '/';
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8')
    .replace(/<(script|style|svg|template|noscript)\b[\s\S]*?<\/\1>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, '');
  const declares = MOTS_COUPES_EXPRES[page] ?? [];
  const vus = new Set();
  for (const m of html.matchAll(COLLE_A_UNE_BALISE)) {
    const colle = m[2] ? `${m[1]}<${m[3]}>${m[4]}` : `${m[5]}${m[6]}${m[7]}`;
    vus.add(colle);
    if (!declares.includes(colle)) {
      fail(`${page} : « ${colle} », mot collé à une balise en ligne (espace perdue au build ? sinon le déclarer dans MOTS_COUPES_EXPRES)`);
    }
  }
  for (const d of declares) {
    if (!vus.has(d)) warn(`${page} : « ${d} » est déclaré dans MOTS_COUPES_EXPRES mais n'est plus dans la page`);
  }
}

/* 4 octies. Aucun code promo affiché sur le site public.
   Décision de l'owner (août 2026). Le site annonçait « INTERNE2026 : 90 jours
   offerts » dans une réponse de FAQ, alors que la section tarifs de la MÊME page
   annonce un tarif interne réduit assorti de 30 jours d'essai : deux promesses
   différentes au même public, à quelques centimètres l'une de l'autre. Les offres
   passent par la section tarifs, pas par des codes disséminés dans le contenu. */
for (const f of fichiersDist.filter((x) => x.endsWith('.html'))) {
  const html = readFileSync(resolve(dist, f.replace(/^\//, '')), 'utf8');
  const code = html.match(/\b(INTERNE|PROMO|WELCOME|BIENVENUE)[0-9]{2,4}\b/);
  if (code) {
    fail(`${f.replace(/\/index\.html$/, '') || '/'} : code promo « ${code[0]} » affiché sur le site public — les offres passent par la section tarifs`);
  }
}

/* 4 nonies. Le film de présentation ne doit rien télécharger avant le clic.
   `preload="none"` est ce qui garantit qu'aucun octet du mp4 (7 Mo, servi par
   le site depuis public/, § 9.ec) ne part au chargement de la page — vérifié :
   0 requête mp4 avant interaction. Le passer à `metadata` ou `auto` déplacerait
   ce coût sur le LCP de la landing, qui est la page de la campagne payante. */
const accueilVideo = readFileSync(resolve(dist, 'index.html'), 'utf8');
const balise = accueilVideo.match(/<video\b[^>]*>/);
if (!balise) fail("accueil : le film de présentation a disparu de la page");
else if (!/preload="none"/.test(balise[0])) {
  fail(`accueil : le film n'est plus en preload="none" — la vidéo se téléchargerait avant le clic (${balise[0].slice(0, 90)})`);
}
/* Le film et son affiche sont des fichiers de public/ (§ 9.ec). Le contrôle des
   liens (2) voit le `src` du <video>, pas les adresses du schéma VideoObject :
   un fichier renommé d'un seul côté y laisserait une adresse en 404. */
{
  const srcFilm = balise?.[0].match(/\ssrc="([^"]+)"/)?.[1] ?? '';
  let schemaFilm = null;
  for (const [, bloc] of accueilVideo.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(bloc); if (j['@type'] === 'VideoObject') schemaFilm = j; } catch { /* JSON-LD invalide : signalé plus haut */ }
  }
  if (!schemaFilm) fail('accueil : schéma VideoObject absent');
  else {
    if (schemaFilm.contentUrl !== `${SITE}${srcFilm}`) {
      fail(`accueil : VideoObject.contentUrl (${schemaFilm.contentUrl}) n'est pas l'adresse du <video> (${SITE}${srcFilm})`);
    }
    for (const vignette of [schemaFilm.thumbnailUrl].flat()) {
      if (!String(vignette).startsWith(`${SITE}/`) || !fichiersServis.has(String(vignette).replace(SITE, ''))) {
        fail(`accueil : VideoObject.thumbnailUrl (${vignette}) n'est pas un fichier servi par le site`);
      }
    }
  }
}

/* 4 undecies. Le consentement se lit au MÊME endroit partout.
   Deux lecteurs coexistent : la bannière (ThirdPartyScripts) et PostHog. Quand
   seul le second lisait `localStorage`, un visiteur ayant accepté sur
   app.hippodoc.fr revenait ici avec le cookie de domaine parent : la bannière ne
   s'affichait plus, GA4 et le Pixel s'activaient, mais PostHog restait en mode
   mémoire — consentement donné, identité jamais persistée, chaque page comptée
   comme un nouveau visiteur, et plus aucune bannière pour rattraper le coup.
   Le défaut était invisible à la lecture : les deux fichiers étaient corrects
   séparément, c'est leur DÉSACCORD qui cassait la mesure. On vérifie donc que
   tout lecteur du consentement interroge bien le cookie. */
const LECTEURS_CONSENTEMENT = [
  'src/components/ThirdPartyScripts.astro',
  'src/components/PostHog.astro',
];
for (const f of LECTEURS_CONSENTEMENT) {
  const src = readFileSync(resolve(root, f), 'utf8');
  if (!/cookie-consent/.test(src) && !/hippodoc-consent/.test(src)) continue; // ne lit pas le consentement
  if (!/hippodoc-consent/.test(src)) {
    fail(`${f} : lit le consentement sans consulter le cookie « hippodoc-consent » — un choix fait sur app.hippodoc.fr y serait ignoré`);
  }
}

/* 4 terdecies. Les événements de consentement passent par l'émetteur commun.
   Mesuré en production : 188 `cookie_consent_*` reçus sans AUCUNE propriété de
   contexte, parce qu'ils étaient émis via `posthog.capture()` en direct au lieu de
   `creerEmetteur`. Sans `deployment_env` on ne peut pas écarter le trafic de test ;
   sans `device_type` ni `utm_*` le taux de refus n'est comparable ni par appareil
   ni par campagne — or il borne tout ce qu'on mesure en aval. Régression née à la
   migration : l'ancienne SPA posait ce contexte en propriétés globales. */
const srcPostHog = readFileSync(resolve(root, 'src/components/PostHog.astro'), 'utf8');
const captureDirecte = srcPostHog.match(/posthog\.capture\(\s*['"]cookie_consent_[a-z]+['"]/);
if (captureDirecte) {
  fail(`PostHog.astro : ${captureDirecte[0]}…) émis en direct — l'événement partirait sans contexte (env, device, utm). Passer par creerEmetteur.`);
}
if (!/creerEmetteur/.test(srcPostHog)) {
  fail('PostHog.astro : les événements de consentement n\'utilisent plus l\'émetteur commun — ils repartiraient sans contexte');
}

/* 4 quaterdecies. La mesure d'audience ne dépend PAS du bandeau publicitaire.
   Elle en dépendait : 42 % des visiteurs acceptaient, donc 58 % tournaient en
   `memory`, où chaque page rechargée crée une nouvelle personne anonyme — ni
   tunnel multi-pages, ni visiteur récurrent, ni conversion rattachable à sa
   campagne. L'article 82 dispense de consentement la mesure d'audience : PostHog
   persiste donc pour tout le monde, GA4 et le Pixel restent seuls sous le bandeau.
   Recâbler la persistance sur le consentement reperdrait 58 % de la mesure sans
   qu'aucun test de page ne s'en aperçoive. L'exemption exige en contrepartie un
   droit d'opposition : sans lui, elle tombe et tout le dispositif avec. */
if (/persistence:\s*accepted\s*\?/.test(srcPostHog) || /persistence:\s*\w*[Cc]onsent/.test(srcPostHog)) {
  fail('PostHog.astro : la persistance est de nouveau conditionnée au consentement publicitaire — 58 % des visiteurs reperdraient toute identité');
}
for (const [motif, message] of [
  [/opt_out_capturing_by_default/, "l'opposition à la mesure n'est plus prise en compte au démarrage"],
  [/cookie_expiration/, 'la durée de vie du cookie n\'est plus plafonnée (13 mois exigés)'],
  [/capture_heatmaps:\s*false/, 'les heatmaps ne sont plus coupées — hors mesure d\'audience, elles fragilisent l\'exemption'],
  [/data-mesure/, "le droit d'opposition a disparu — sans lui l'exemption tombe"],
]) {
  if (!motif.test(srcPostHog)) fail(`PostHog.astro : ${message}`);
}
const politique = readFileSync(resolve(dist, 'politique-confidentialite/index.html'), 'utf8');
if (!politique.includes('data-mesure="refuser"') || !politique.includes('mesure-etat')) {
  fail("politique-confidentialite : le bouton d'opposition à la mesure d'audience est absent de la page rendue — l'exemption CNIL exige qu'il soit accessible");
}

/* 4 duodecies. Crisp ne se charge qu'au clic.
   Il était autrefois injecté au premier geste du visiteur — `scroll` compris — et
   posait donc son cookie de session avant tout choix de cookies, et même après un
   refus (mesuré dans les deux cas). Aucun consentement ne le couvrait, aucune
   exemption non plus : le visiteur n'avait rien demandé. Déclenché par un clic sur
   notre propre bulle, le chat devient un service explicitement demandé, que la CNIL
   dispense de consentement. Recâbler le chargement sur un événement passif
   réintroduirait la fuite sans qu'aucun test de page ne s'en aperçoive. */
const srcTiers = readFileSync(resolve(root, 'src/components/ThirdPartyScripts.astro'), 'utf8');
const declencheurPassif = srcTiers.match(/^.*(?:scroll|touchstart|pointerdown|keydown|DOMContentLoaded)[^\n]*loadCrisp[^\n]*$/m)
  || srcTiers.match(/^.*loadCrisp[^\n]*(?:scroll|touchstart|DOMContentLoaded)[^\n]*$/m);
if (declencheurPassif) {
  fail(`ThirdPartyScripts : Crisp est de nouveau chargé sur un événement passif — son cookie repartirait sans consentement (${declencheurPassif[0].trim().slice(0, 80)})`);
}
if (!/id="crisp-launcher"/.test(srcTiers)) {
  fail('ThirdPartyScripts : la bulle de chat a disparu — plus aucun moyen d\'ouvrir le support');
}
/* ⚠️ L'attribut `hidden` ne masque PAS un élément portant une classe `display`
   de Tailwind : `.flex` vient de la feuille d'auteur et bat le `[hidden] {
   display: none }` du navigateur. Sans la règle d'ID, un visiteur sans JavaScript
   voit une bulle bien visible et totalement morte. Ce piège a déjà atteint la
   production sur le bouton de lecture du film — d'où ce contrôle. */
if (/id="crisp-launcher"[^>]*\bhidden\b/.test(srcTiers) && !/#crisp-launcher\[hidden\]/.test(srcTiers)) {
  fail("ThirdPartyScripts : #crisp-launcher est masqué par le seul attribut `hidden`, que la classe Tailwind `.flex` annule — bulle morte sans JavaScript");
}
for (const f of ['index.html', 'tarifs/index.html', 'blog/index.html']) {
  const html = readFileSync(resolve(dist, f), 'utf8');
  if (!html.includes('id="crisp-launcher"')) fail(`/${f.replace(/\/?index\.html$/, '') || ''} : bulle de chat absente du HTML rendu`);
  /* ⚠️ Chercher l'URL de Crisp tout court donnait un FAUX POSITIF sur du code sain :
     elle figure forcément dans le script en ligne, c'est par là qu'on l'injecte au
     clic. Ce qu'on interdit, c'est une BALISE `<script src>` — le seul cas où le
     navigateur irait la chercher tout seul, sans clic ni consentement. */
  if (/<script[^>]+src=["'][^"']*crisp\.chat/.test(html)) {
    fail(`/${f.replace(/\/?index\.html$/, '') || ''} : Crisp chargé par une balise <script src> — il partirait dès l'ouverture de la page`);
  }
}

/* 4 quindecies. Les liens vers une ancre pointent vers un `id` qui existe.
   Le maillage vers /guide-declarations vise des ancres précises (#case-5HQ,
   #glossaire-term-asv…) plutôt que la page entière : une ancre renommée casserait
   le lien en silence, sans qu'aucun contrôle d'URL ne le voie. Voir § 9.al. */
let ancresVerifiees = 0;
const pagesHtml = fichiersDist.filter((f) => f.endsWith('.html'));
const idsParPage = new Map();
for (const f of pagesHtml) {
  const html = readFileSync(resolve(dist, f.slice(1)), 'utf8');
  const chemin = f.replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/';
  idsParPage.set(chemin, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
for (const f of pagesHtml) {
  const html = readFileSync(resolve(dist, f.slice(1)), 'utf8');
  const source = f.replace(/\/index\.html$/, '').replace(/\.html$/, '') || '/';
  for (const [, cible, frag] of html.matchAll(/href="(\/[^"?#]*)#([^"]+)"/g)) {
    const page = cible.replace(/\/$/, '') || '/';
    const ids = idsParPage.get(page);
    if (!ids) continue; // page hors dist (redirection Vercel) : déjà couvert plus haut
    ancresVerifiees++;
    if (!ids.has(frag)) fail(`${source} : lien vers ${page}#${frag} — cette ancre n'existe pas`);
  }
}

/* 5. robots.txt & llms.txt présents dans dist */
for (const f of ['robots.txt', 'llms.txt']) {
  if (!existsSync(resolve(dist, f))) fail(`${f} absent de dist/`);
}
const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
if (/Disallow: \//.test(robots)) fail('robots.txt contient un Disallow');
if (!robots.includes('Sitemap: https://www.hippodoc.fr/sitemap-index.xml')) fail('robots.txt : référence sitemap manquante');

/* 6. Les `lastmod` du sitemap disent la vérité.
   Google ignore le signal `lastmod` d'un site entier s'il le juge peu fiable.
   L'import initial depuis la SPA avait posé un `updatedAt` de build identique
   sur 29 articles : le sitemap annonçait la même date pour les trois quarts du
   blog, dont des textes inchangés depuis octobre 2025. Ce contrôle vérifie que
   chaque `lastmod` correspond à l'`updatedDate` du frontmatter, ou à défaut à sa
   `pubDate` — jamais à une date de génération. Voir MIGRATION.md § 9.ai. */
const blogFiles = readdirSync(resolve(root, 'src/content/blog')).filter((f) => f.endsWith('.md'));
const datesAttendues = new Map();
for (const f of blogFiles) {
  const fm = readFileSync(resolve(root, 'src/content/blog', f), 'utf8').split('---')[1] ?? '';
  const pub = fm.match(/^pubDate:\s*"?([\d-]{10})/m);
  const upd = fm.match(/^updatedDate:\s*"?([\d-]{10})/m);
  if (pub) datesAttendues.set(f.replace(/\.md$/, ''), (upd ?? pub)[1]);
}
const sitemapXml = readFileSync(resolve(dist, 'sitemap-0.xml'), 'utf8');
const entrees = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([\d-]{10})/g)];
let lastmodVerifies = 0;
for (const [, loc, lastmod] of entrees) {
  const slug = loc.split('/blog/')[1];
  if (!slug || !datesAttendues.has(slug)) continue;
  lastmodVerifies++;
  const attendu = datesAttendues.get(slug);
  if (lastmod !== attendu) {
    fail(`sitemap : lastmod ${lastmod} pour /blog/${slug} alors que le frontmatter dit ${attendu} — src/generated/blog-meta.json est désynchronisé`);
  }
}
/* Pages statiques datées : même exigence de véracité que pour le blog. La table
   est dans src/lib/pages-lastmod.ts ; elle est lue ici par expression régulière
   plutôt qu'importée, pour que ce script reste sans dépendance de compilation. */
const srcLastmod = readFileSync(resolve(root, 'src/lib/pages-lastmod.ts'), 'utf8');
const statiquesAttendues = new Map(
  // Chemins à chiffres et à « / » internes compris (§ 9.bi) : l'ancien motif
  // [a-z-]+ sautait en silence les trois sous-pages du guide. L'accueil, '/',
  // est acceptée aussi (DA 2026, phase 4a) : le motif exigeait un caractère
  // après le slash et l'aurait sautée de la même façon.
  [...srcLastmod.matchAll(/'(\/[a-z0-9\/-]*)':\s*([A-Z_]+|'[\d-]{10}')/g)].map(([, chemin, val]) => {
    const litteral = val.match(/'([\d-]{10})'/);
    if (litteral) return [chemin, litteral[1]];
    const constante = srcLastmod.match(new RegExp(`${val}\\s*=\\s*'([\\d-]{10})'`))
      ?? readFileSync(resolve(root, 'src/lib/guide/lastUpdated.ts'), 'utf8').match(new RegExp(`${val}\\s*=\\s*'([\\d-]{10})'`));
    return [chemin, constante ? constante[1] : null];
  })
);
for (const [chemin, attendu] of statiquesAttendues) {
  if (!attendu) { fail(`pages-lastmod.ts : date illisible pour ${chemin}`); continue; }
  // Égalité exacte : endsWith('/guide-declarations') ne distinguait pas le hub.
  // Le sitemap écrit l'accueil sans slash final (`https://www.hippodoc.fr`).
  const entree = entrees.find(([, loc]) => loc === `${SITE}${chemin === '/' ? '' : chemin}`);
  if (!entree) { fail(`sitemap : ${chemin} devrait porter un lastmod (${attendu}) et n'en a pas`); continue; }
  lastmodVerifies++;
  if (entree[2] !== attendu) {
    fail(`sitemap : lastmod ${entree[2]} pour ${chemin} alors que pages-lastmod.ts dit ${attendu}`);
  }
}

const parDate = new Map();
for (const [, , lastmod] of entrees) parDate.set(lastmod, (parDate.get(lastmod) ?? 0) + 1);
for (const [date, n] of parDate) {
  if (n > 12) warn(`sitemap : ${n} URLs partagent le lastmod ${date} — vérifier qu'il ne s'agit pas d'une date de génération`);
}

/* Maillage du blog (MIGRATION.md § 9.be). Un slug erroné dans relatedArticles est
   filtré en silence au rendu : on le signale ici. Et un article que rien ne cite
   n'est atteignable que par l'index — trois articles l'étaient avant l'audit. */
const slugsBlog = new Set(blogFiles.map((f) => f.replace(/\.md$/, '')));
const citesEnConnexe = new Set();
for (const f of blogFiles) {
  const src = readFileSync(resolve(root, 'src/content/blog', f), 'utf8');
  const bloc = src.match(/relatedArticles:\n((?:\s+- "[^"]+"\n)+)/);
  for (const [, cible] of bloc ? bloc[1].matchAll(/"([^"]+)"/g) : []) {
    if (!slugsBlog.has(cible)) fail(`blog/${f} : relatedArticles cite « ${cible} », qui n'existe pas`);
    citesEnConnexe.add(cible);
  }
}
const liensEntrants = new Map([...slugsBlog].map((s) => [s, 0]));
for (const s of slugsBlog) {
  const html = readFileSync(resolve(dist, 'blog', s, 'index.html'), 'utf8');
  // Le TEXTE seul : jusqu'au repère de fin, pas jusqu'à </article> — sinon les
  // cartes « Articles connexes » comptaient comme des liens du texte (§ 9.bf).
  // Repéré par `data-blog-zone="corps"` (l'attribut de mesure), plus par une classe
  // d'habillage : le gabarit d'article n'en a plus depuis la phase 5c (§ 9.ej).
  const corps = (html.match(/<div[^>]*data-blog-zone="corps"[^>]*>([\s\S]*?)data-blog-fin/) ?? [, ''])[1];
  if (!corps) fail(`blog/${s} : corps d'article introuvable (repère data-blog-fin absent ?)`);
  // Appel à l'action (§ 9.bf) : 8 articles n'en avaient aucun.
  const blocCta = (html.match(/data-blog-zone="cta"[\s\S]*?<\/aside>/) ?? [''])[0];
  if (!/data-track="cta_/.test(blocCta)) fail(`blog/${s} : bloc d'appel à l'action absent ou sans data-track="cta_…"`);
  for (const cible of new Set([...corps.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map((m) => m[1]))) {
    if (cible !== s && liensEntrants.has(cible)) liensEntrants.set(cible, liensEntrants.get(cible) + 1);
  }
}
for (const [s, n] of liensEntrants) {
  if (n === 0) warn(`blog/${s} : aucun lien entrant depuis le texte d'un autre article`);
  if (!citesEnConnexe.has(s)) warn(`blog/${s} : cité dans aucun relatedArticles`);
}


/* 7. Garde-fous SEO techniques (MIGRATION.md § 9.bi) — angles morts relevés par
   l'audit du 21 septembre 2026, tous passés au vert jusque-là. */
const { default: sharp } = await import('sharp');
const lireHtml = (url) => {
  const chemin = url.replace(SITE, '').replace(/\/$/, '');
  const f = chemin ? resolve(dist, `${chemin.slice(1)}/index.html`) : resolve(dist, 'index.html');
  return existsSync(f) ? readFileSync(f, 'utf8') : '';
};
const ogVues = new Map();
for (const url of urls) {
  const html = lireHtml(url);
  if (!html) continue;
  // (a) une page du sitemap ne doit jamais être en noindex
  if (/<meta name="robots"[^>]+noindex/.test(html)) fail(`${url} : dans le sitemap mais en noindex`);
  // (b) liens internes à slash final (un 308 en prod) et liens http:// non sécurisés
  for (const [, href] of html.matchAll(/href="(\/[^"#?]+\/)(?:[#?][^"]*)?"/g)) fail(`${url} : lien interne à slash final ${href}`);
  for (const [, href] of html.matchAll(/href="(http:\/\/[^"]+)"/g)) fail(`${url} : lien non sécurisé ${href}`);
  // (c) titre : contrat < 60 caractères (balise complète, suffixe de marque inclus)
  const titre = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
  if (titre.length > 60) warn(`${url} : <title> de ${titre.length} caractères (> 60)`);
  // (d) image de partage : le fichier existe et ses dimensions sont celles déclarées
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  const ogL = Number(html.match(/<meta property="og:image:width" content="(\d+)"/)?.[1]);
  const ogH = Number(html.match(/<meta property="og:image:height" content="(\d+)"/)?.[1]);
  if (og?.startsWith(SITE)) {
    const fichier = resolve(dist, decodeURIComponent(new URL(og).pathname).slice(1));
    if (!existsSync(fichier)) { fail(`${url} : og:image introuvable dans dist (${og})`); continue; }
    if (!ogVues.has(fichier)) ogVues.set(fichier, await sharp(fichier).metadata());
    const { width, height } = ogVues.get(fichier);
    if (width !== ogL || height !== ogH) {
      fail(`${url} : og:image déclarée ${ogL}×${ogH}, fichier réel ${width}×${height}`);
    }
  }
}
// (e) pubDate / updatedDate avec heure mais sans fuseau : interprétées dans le
// fuseau de la machine de build, elles diffèrent entre Vercel (UTC) et un poste local.
for (const f of blogFiles) {
  const fm = readFileSync(resolve(root, 'src/content/blog', f), 'utf8').split('---')[1] ?? '';
  for (const [, cle, val] of fm.matchAll(/^(pubDate|updatedDate):\s*"?([^"\n]+)"?$/gm)) {
    if (/T\d/.test(val) && !/(Z|[+-]\d\d:?\d\d)$/.test(val)) fail(`blog/${f} : ${cle} « ${val} » a une heure sans fuseau (ajouter Z)`);
  }
}
// (f) pages de liste : lastmod = publication la plus récente de leurs articles
const listes = new Map();
for (const f of blogFiles) {
  const src = readFileSync(resolve(root, 'src/content/blog', f), 'utf8');
  const pub = src.match(/^pubDate:\s*"?([\d-]{10})/m)?.[1];
  const serie = src.match(/^seriesId:\s*"?([a-z-]+)"?$/m)?.[1];
  const slugSerie = serie && readFileSync(resolve(root, 'src/lib/blog-series-slugs.ts'), 'utf8')
    .match(new RegExp(`['"]?${serie}['"]?\\s*:\\s*['"]([a-z-]+)['"]`))?.[1];
  for (const cle of ['/blog', slugSerie && `/blog/serie/${slugSerie}`].filter(Boolean)) {
    if (pub && (!listes.get(cle) || pub > listes.get(cle))) listes.set(cle, pub);
  }
}
for (const [chemin, attendu] of listes) {
  const entree = entrees.find(([, loc]) => loc === `${SITE}${chemin}`);
  if (!entree) fail(`sitemap : ${chemin} devrait porter un lastmod (${attendu}) et n'en a pas`);
  else if (entree[2] !== attendu) fail(`sitemap : lastmod ${entree[2]} pour ${chemin}, attendu ${attendu}`);
}
// (g) llms.txt et rss.xml citent chaque article
const llms = existsSync(resolve(dist, 'llms.txt')) ? readFileSync(resolve(dist, 'llms.txt'), 'utf8') : '';
const rssXml = existsSync(resolve(dist, 'rss.xml')) ? readFileSync(resolve(dist, 'rss.xml'), 'utf8') : '';
if (!rssXml) fail('rss.xml absent de dist/');
for (const f of blogFiles) {
  const lien = `${SITE}/blog/${f.replace(/\.md$/, '')}`;
  if (!llms.includes(`(${lien})`)) fail(`llms.txt : l'article ${lien} n'y figure pas`);
  if (rssXml && !rssXml.includes(`<link>${lien}</link>`)) fail(`rss.xml : l'article ${lien} n'y figure pas`);
}

/* Rapport */
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} avertissement(s) :`);
  for (const w of warnings) console.log('  - ' + w);
}
if (errors.length) {
  console.log(`\n✗ ${errors.length} erreur(s) :`);
  for (const e of errors) console.log('  - ' + e);
  process.exit(1);
}
console.log(`\n✓ ${urls.length} pages vérifiées : titres/descriptions uniques, 1 H1, canoniques,`);
console.log(`  contenu SSR, JSON-LD valide, balises sociales complètes.`);
console.log(`✓ ${liensAnalyses} liens internes vérifiés, aucun mort.`);
