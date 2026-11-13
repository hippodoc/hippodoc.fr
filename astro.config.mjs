// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import { remarkCallouts } from './src/lib/remark-callouts.mjs';
import { rehypeArticle } from './src/lib/rehype-article.mjs';
import { OPTIONS_ARTICLE } from './src/lib/article-options.mjs';
import { createHash } from 'node:crypto';
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

/* Empreinte du rendu des articles (MIGRATION.md § 9.fj). Astro garde en cache le HTML rendu
   de chaque article (node_modules/.astro, que Vercel garde aussi entre deux constructions)
   tant que le fichier Markdown et la configuration ne changent pas : une retouche des seuls
   plugins ne referait donc rien, et le site servirait l'ancien balisage. L'empreinte de leurs
   fichiers est passée dans les options du plugin, donc dans la configuration : toute retouche
   de l'un d'eux vide ce cache. Un fichier ajouté aux plugins s'ajoute à cette liste. */
const EMPREINTE_ARTICLE = createHash('sha1')
  .update(
    ['rehype-article.mjs', 'article-emojis.mjs', 'article-options.mjs', 'remark-callouts.mjs']
      .map((f) => readFileSync(`./src/lib/${f}`, 'utf8'))
      .join('\n')
  )
  .digest('hex')
  .slice(0, 12);

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
    processor: unified({
      remarkPlugins: [remarkDirective, remarkCallouts],
      /* Balisage du corps des articles posé au rendu (émojis, fausses listes, lignes,
         titres, encadrés, tableaux, sources, nombres) : src/lib/rehype-article.mjs,
         options dans src/lib/article-options.mjs. Le Markdown n'est pas touché. */
      rehypePlugins: [[rehypeArticle, { ...OPTIONS_ARTICLE, empreinte: EMPREINTE_ARTICLE }]],
    }),
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      /* Navigateurs visés par le minificateur CSS. Astro construit en « esnext » :
         sans cible, lightningcss retirait `-webkit-backdrop-filter` (le flou de la
         pastille manquait à Safari avant 18) et fusionnait les soulignements en
         `text-decoration: underline 2px`, que Safari ne lit que depuis 26.2 (le
         lien perdait son soulignement). Avec ces cibles, il garde les préfixes et
         les propriétés longues (MIGRATION.md § 9.ep). Ne vaut que pour le CSS.
         Firefox 121 et non plus ancien : c'est la première version qui lit
         `:has()` ; en dessous, le minificateur réécrit les listes de sélecteurs
         qui en contiennent (`:is(…)`), ce qui change leur poids. */
      cssTarget: ['safari16.4', 'ios16.4', 'chrome111', 'edge111', 'firefox121'],
    },
    define: {
      // Injecté au build et joint à chaque événement `landing_*` (propriété
      // `app_version` de l'historique PostHog). Passe par `define` plutôt qu'un
      // import de package.json : seule la chaîne de version entre dans le bundle
      // client, pas la liste des dépendances.
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: [
        // Rendu des îlots React au build : version « browser » du serveur React
        // (renderToReadableStream) au lieu de la version Node. Celle de React
        // 18.3 (writeStringChunk) envoie son tampon entier quand un caractère
        // accentué n'y tient plus, octets vides compris : des U+0000 se glissaient
        // dans le HTML des îlots du guide (« mat\0ériel ») — § 9.cp. La version
        // browser encode chaque morceau à part et n'a pas ce défaut ; le préfixe
        // des useId (lu à l'hydratation) est conservé, contrairement à un rendu
        // non streamé.
        { find: /^react-dom\/server$/, replacement: 'react-dom/server.browser' },
      ],
    },
  },
});
