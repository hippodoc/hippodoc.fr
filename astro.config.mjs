// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { remarkCallouts } from './src/lib/remark-callouts.mjs';
import blogMeta from './src/generated/blog-meta.json' with { type: 'json' };
import pkg from './package.json' with { type: 'json' };

/** lastmod par URL : articles = date réelle (pubDate/updatedDate). */
const BLOG_LASTMOD = new Map(
  Object.entries(blogMeta).map(([slug, m]) => [`/blog/${slug}`, m.updatedDate])
);

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
      // /essai est noindex (page campagne Instagram) : hors sitemap
      filter: (page) => !page.includes('/essai'),
      serialize(item) {
        const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
        const lastmod = BLOG_LASTMOD.get(path);
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
