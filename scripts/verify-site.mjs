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
    if (title.length > 70) warn(`${url} : titre long (${title.length} car.) : ${title}`);
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
const SECTIONS_LANDING = [
  'hero', 'social-proof', 'presentation-video', 'features', 'mid-page-cta',
  'practice-journeys', 'testimonials', 'partners', 'pricing', 'faq',
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
// Tout lien d'inscription doit rester instrumenté : c'est la conversion elle-même.
for (const [balise] of accueil.matchAll(/<a\b[^>]*auth\?tab=signup[^>]*>/g)) {
  if (!/data-track="/.test(balise)) {
    fail(`accueil : un CTA d'inscription sans data-track — le clic ne sera pas attribué (${balise.slice(0, 80)})`);
  }
}

/* 5. robots.txt & llms.txt présents dans dist */
for (const f of ['robots.txt', 'llms.txt']) {
  if (!existsSync(resolve(dist, f))) fail(`${f} absent de dist/`);
}
const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8');
if (/Disallow: \//.test(robots)) fail('robots.txt contient un Disallow');
if (!robots.includes('Sitemap: https://www.hippodoc.fr/sitemap-index.xml')) fail('robots.txt : référence sitemap manquante');

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
