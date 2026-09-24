// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { remarkCallouts } from './src/lib/remark-callouts.mjs';
import blogMeta from './src/generated/blog-meta.json' with { type: 'json' };
import { STATIC_LASTMOD } from './src/lib/pages-lastmod.ts';
import { seriesPath } from './src/lib/blog-series-slugs.ts';
import { readdirSync, readFileSync } from 'node:fs';
import pkg from './package.json' with { type: 'json' };

/** lastmod par URL : articles = date réelle (pubDate/updatedDate). */
const BLOG_LASTMOD = new Map(
  Object.entries(blogMeta).map(([slug, m]) => [`/blog/${slug}`, m.updatedDate])
);

/* Pages statiques : elles n'avaient aucun `lastmod`, alors que /guide-declarations
   affiche « Mis à jour le … » et porte `dateModified`. Table dans
   src/lib/pages-lastmod.ts, partagée avec les pages elles-mêmes. */
/* Pages de liste (§ 9.bi) : /blog et les pages de série changent à chaque
   PUBLICATION. Leur lastmod = date de publication la plus récente de leurs
   articles (pubDate, pas updatedDate : corriger un article ne change pas la liste). */
const LIST_LASTMOD = new Map();
const plusRecente = (a, b) => (!a || b > a ? b : a);
for (const fichier of readdirSync('./src/content/blog').filter((f) => f.endsWith('.md'))) {
  const slug = fichier.replace(/\.md$/, '');
  const pub = blogMeta[slug]?.pubDate;
  const serie = readFileSync(`./src/content/blog/${fichier}`, 'utf8').match(/^seriesId: "?([a-z-]+)"?$/m)?.[1];
  if (!pub) continue;
  LIST_LASTMOD.set('/blog', plusRecente(LIST_LASTMOD.get('/blog'), pub));
  if (serie) LIST_LASTMOD.set(seriesPath(serie), plusRecente(LIST_LASTMOD.get(seriesPath(serie)), pub));
}

const LASTMOD = new Map([...BLOG_LASTMOD, ...Object.entries(STATIC_LASTMOD), ...LIST_LASTMOD]);

// https://astro.build/config
export default defineConfig({
  site: 'https://www.hippodoc.fr',
  // Politique d'URL : pas de slash final (canonique unique par page).
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      // /essai est noindex (page campagne Instagram) : hors sitemap. Égalité
      // stricte : une sous-chaîne excluait aussi tout futur /blog/essai-… (§ 9.bi).
      filter: (page) => new URL(page).pathname.replace(/\/$/, '') !== '/essai',
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const lastmod = LASTMOD.get(path);
        if (lastmod) {
          item.lastmod = new Date(lastmod).toISOString();
        }
        return item;
      },
    }),
  ],
  markdown: {
    // Astro 7 : le processeur unified (remark) n'est plus celui par défaut ;
    // requis ici pour remark-directive + callouts (:::warning etc.).
    processor: unified({ remarkPlugins: [remarkDirective, remarkCallouts] }),
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    define: {
      // Injecté au build et joint à chaque événement `landing_*` (propriété
      // `app_version` de l'historique PostHog). Passe par `define` plutôt qu'un
      // import de package.json : seule la chaîne de version entre dans le bundle
      // client, pas la liste des dépendances.
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
  },
});
