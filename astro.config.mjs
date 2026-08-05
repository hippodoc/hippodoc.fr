// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://hippodoc.fr',
  // Politique d'URL : pas de slash final (canonique unique par page).
  trailingSlash: 'never',
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({
      // Les styles de base sont portés depuis la SPA source dans src/styles/global.css
      applyBaseStyles: false,
    }),
    sitemap({
      // lastmod par défaut : surchargé page par page via serialize (dates réelles des articles)
      xslURL: undefined,
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
