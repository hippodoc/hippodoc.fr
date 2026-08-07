/**
 * Vérification post-build (spec migration, étape 4) :
 * pour CHAQUE URL du sitemap — fichier présent (équivalent HTTP 200),
 * <title> unique, meta description unique, exactement un <h1>, canonique
 * exacte sans slash final, texte présent dans le HTML brut (sans JS),
 * blocs JSON-LD parsables. Sort avec un code d'erreur si un point échoue.
 *
 * Usage : node scripts/verify-site.mjs   (après astro build)
 */
import { readFileSync, existsSync } from 'node:fs';
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

  // exactement un H1
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
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

  // lorem / placeholder
  if (/lorem ipsum/i.test(text)) fail(`${url} : texte placeholder « lorem ipsum » détecté`);
  if (/TODO\(owner\)/.test(text)) warn(`${url} : TODO(owner) visible dans la page`);
}

/* 2. vercel.json : parse + collisions avec les routes publiques */
const vercelJson = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
const publicPaths = urls.map((u) => u.replace(SITE, '') || '/');
for (const r of vercelJson.redirects ?? []) {
  if (r.has) continue; // règles host (www) — pas des chemins
  const src = r.source;
  const exact = publicPaths.find((p) => p === src);
  if (exact) fail(`Redirection ${src} entre en collision avec une page publique construite`);
  if (!r.permanent) warn(`Redirection non permanente (302) : ${src}`);
}

/* 3. robots.txt & llms.txt présents dans dist */
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
console.log(`\n✓ ${urls.length} pages vérifiées : titres/descriptions uniques, 1 H1, canoniques, contenu SSR, JSON-LD valide.`);
