/**
 * Intégration Astro : précharge les fichiers JS des îlots d'une page d'outil.
 *
 * Le problème (MIGRATION.md § 9.er). Un îlot React ne répond qu'une fois hydraté, et
 * il ne s'hydrate qu'après avoir reçu tous ses fichiers. Sans aide, le navigateur les
 * découvre par vagues : le HTML nomme l'entrée de l'îlot, qui nomme ses imports, qui
 * nomment les leurs. Chaque vague coûte un aller-retour ; en 4G lente, plus d'une
 * demi-seconde. Avec un `<link rel="modulepreload">` par fichier dans le `<head>`, tous
 * partent dès la première ligne du HTML.
 *
 * Pourquoi après le build. Les noms portent une empreinte (`SimulateurApp.C0aBMWk0.js`)
 * qui change à chaque modification : aucun nom ne s'écrit à la main. À la fin du build,
 * on lit dans le HTML produit les `component-url` et `renderer-url` de chaque
 * `<astro-island>`, on suit les imports statiques des fichiers de `_astro/`, et on écrit
 * les liens. Les imports dynamiques (`import()`) ne sont pas suivis : ils restent
 * chargés à la demande (le bloc des résultats du simulateur, par exemple).
 *
 * Une page le demande elle-même, par une balise vide posée là où les liens doivent sortir :
 *   <template data-precharge-ilots="*"></template>                      tous les îlots de la page
 *   <template data-precharge-ilots="BoussoleSearchIsland"></template>   seulement ceux nommés (virgules)
 * que cette intégration remplace par les liens. Pas de balise, pas de lien : un article de
 * blog ne précharge pas son carrousel, qui est sous la ligne de flottaison.
 *
 * ⚠️ Où la poser : dans le `<body>`, pas dans le `<head>` (mesuré, § 9.er). Dans le `<head>`,
 * les fichiers partent en même temps que les feuilles de style et leur prennent du débit :
 * en 4G lente la première peinture reculait de 0,35 à 0,6 s. Plus bas dans le HTML, les
 * feuilles ont pris leur avance quand le navigateur lit les liens, et la première peinture
 * ne bouge presque plus. `fetchpriority="low"` protège la peinture aussi, mais le navigateur
 * ne charge alors les fichiers qu'un par un tant qu'elle n'a pas eu lieu : le gain fond.
 * `verify-site.mjs` échoue si la balise est restée dans le build, si un lien pointe sur un
 * fichier absent ou si une page d'outil n'a pas ses liens.
 *
 * Elle passe avant la copie vers `.vercel/output/static` : l'adaptateur Vercel ajoute
 * la sienne après celles de `astro.config.mjs`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Astro peut ajouter son attribut de portée (`data-astro-cid-…`) à la balise. */
const REPERE = /<template\b[^>]*\bdata-precharge-ilots="([^"]*)"[^>]*>\s*<\/template>/g;
/* `import … from "./x.js"`, `import "./x.js"`, `export … from "./x.js"` ; pas `import("./x.js")`. */
const IMPORT_STATIQUE = /(?:\bimport|\bexport)\s*(?:[\w$*{},\s]+?\s*from\s*)?["'](\.{1,2}\/[^"']+?\.js)["']/g;

function pagesHtml(dossier) {
  const pages = [];
  for (const e of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) pages.push(...pagesHtml(chemin));
    else if (e.name.endsWith('.html')) pages.push(chemin);
  }
  return pages;
}

export function prechargeIlots() {
  return {
    name: 'hippodoc:precharge-ilots',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const racine = fileURLToPath(dir);
        const imports = new Map();
        /** Imports statiques d'un fichier du build, en adresses absolues (`/_astro/x.js`). */
        const importsDe = (url) => {
          if (imports.has(url)) return imports.get(url);
          const fichier = join(racine, url);
          if (!existsSync(fichier)) throw new Error(`precharge-ilots : ${url} est nommé par le build mais n'existe pas`);
          const source = readFileSync(fichier, 'utf8');
          const trouves = [...source.matchAll(IMPORT_STATIQUE)].map((m) => new URL(m[1], `http://x${url}`).pathname);
          imports.set(url, [...new Set(trouves)]);
          return imports.get(url);
        };

        for (const page of pagesHtml(racine)) {
          const html = readFileSync(page, 'utf8');
          if (!html.includes('precharge-ilots')) continue;
          const ilots = [...html.matchAll(/<astro-island\b[^>]*>/g)].map(([balise]) => ({
            nom: /opts="[^"]*?&quot;name&quot;:&quot;([^&]+)&quot;/.exec(balise)?.[1] ?? '',
            entrees: [/component-url="([^"]+)"/.exec(balise)?.[1], /renderer-url="([^"]+)"/.exec(balise)?.[1]].filter(Boolean),
          }));
          /* Une page peut porter plusieurs balises : un fichier n'y est nommé qu'une fois. */
          const dejaPoses = new Set();
          const sortie = html.replace(REPERE, (_, liste) => {
            const voulus = liste.trim() === '*' ? null : liste.split(',').map((n) => n.trim()).filter(Boolean);
            const retenus = ilots.filter((i) => !voulus || voulus.includes(i.nom));
            const absents = (voulus ?? []).filter((n) => !ilots.some((i) => i.nom === n));
            if (absents.length || !retenus.length) {
              throw new Error(`precharge-ilots : ${page} demande ${absents.join(', ') || 'ses îlots'}, absent(s) de la page`);
            }
            /* Un îlot après l'autre, dans l'ordre de la page (celui du haut est servi
               d'abord) ; pour chacun, parcours en largeur : son entrée, puis ce qu'elle
               importe. */
            const fichiers = [];
            for (const ilot of retenus) {
              const aVoir = [...ilot.entrees];
              while (aVoir.length) {
                const url = aVoir.shift();
                if (fichiers.includes(url)) continue;
                fichiers.push(url);
                aVoir.push(...importsDe(url));
              }
            }
            const nouveaux = fichiers.filter((url) => !dejaPoses.has(url));
            for (const url of nouveaux) dejaPoses.add(url);
            return nouveaux.map((url) => `<link rel="modulepreload" href="${url}">`).join('');
          });
          writeFileSync(page, sortie);
          logger.info(`${page.slice(racine.length)} : ${dejaPoses.size} fichiers préchargés`);
        }
      },
    },
  };
}
