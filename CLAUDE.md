# CLAUDE.md — hippodoc.fr (site public)

Site marketing public d'Hippodoc (SaaS français pour médecins remplaçants), reconstruit en
**Astro 7 statique** depuis une SPA React/Vite Lovable pour le SEO (HTML complet servi aux
crawlers). L'application privée vit sur **app.hippodoc.fr** (dépôt séparé, SPA Lovable
`roshangbd/hippodocfinary` — lecture seule, ne jamais y pousser). Historique complet de la
migration, table des redirections et TODO(owner) : voir **MIGRATION.md**.

## Commandes

```bash
npm run dev                      # dev server http://localhost:4321
npm run build                    # build statique → dist/ (+ .vercel/output)
npm run preview                  # sert le build
node scripts/verify-site.mjs     # APRÈS build : crawl du sitemap, assertions SEO par page
```

`verify-site.mjs` échoue si une page n'a pas : titre unique, description unique, exactement
un `<h1>`, canonique exacte sans slash final, `lang="fr"`, ≥150 mots de texte dans le HTML
brut, JSON-LD parsable. Le lancer avant tout commit qui touche aux pages.

## Invariants (ne pas casser)

- **URLs publiques figées** — jamais renommer/supprimer une route existante (équité
  d'indexation). Politique : **pas de slash final** (`trailingSlash: 'never'`,
  `"trailingSlash": false` dans vercel.json). Les redirections 301 vivent dans
  `vercel.json` et ne s'appliquent QUE sur Vercel (404 locaux attendus sur /dashboard etc.).
- **Contenu français verbatim** — le wording produit/articles ne se « réécrit » pas.
  Tout ajout/modification de contenu doit être flaggé dans MIGRATION.md §9.
- **Zéro JS client hors** : îlots des outils (simulateur, calculette, boussole, carrousel
  blog), PostHog, `ThirdPartyScripts.astro`, le micro-script inline du tiroir mobile
  (fermeture au clic d'une ancre — voir MIGRATION.md §9 ; dans `Header.astro` sur toutes
  les pages sauf l'accueil, où le même script, au caractère près, est rendu après le pied
  par `src/components/da/ScriptTiroirDA.astro`), le script inline du lecteur du film de
  l'accueil (`src/components/accueil/Fondateur.astro`, bouton de lecture — MIGRATION.md
  § 9.t), le script inline de tête de `BaseLayout.astro` (jetons de connexion Supabase
  renvoyés vers l'app — MIGRATION.md § 9.ea ; à garder en premier dans `<head>`), et la
  recherche de `/blog` (script de page ~1 Ko ; module `src/lib/blog-search.ts` et index
  `/blog/recherche.json` chargés au premier focus — MIGRATION.md § 9.db). Les interactions
  des pages statiques sont CSS-only (radios/checkbox, `:has()`) ou natives
  (`<details>/<summary>`) : onglets, profils, plis et pause du décor de l'accueil compris.
- **Radix ne SSR pas le contenu fermé** — un Accordion/Collapsible Radix fermé ne livre
  PAS son texte dans le HTML statique. Pour tout contenu porteur de SEO : `<details>` natif.
- **Lighthouse ≥ 95** (perf/SEO/a11y/BP) sur `/`, `/simulateur` et un article. Contraste :
  `text-hippo-500` interdit sur fond blanc en petit texte (utiliser `hippo-600`).

## Accueil — DA 2026

L'accueil est la seule page dans la nouvelle direction artistique (MIGRATION.md § 9,
entrée « DA 2026 »). Les autres pages gardent Tailwind, `Header.astro` et `Footer.astro`
jusqu'à la phase 5a.

- **Feuille** : `src/styles/da.css` (police, jetons, `.btn`, `.wrap`, feuilles `.band`,
  plis `.qa`, en-tête `hd-*`, pied `ft-*`). Importée par les composants `da/` et
  `accueil/` seulement, ni par BaseLayout ni par `global.css`. Tout vit sous `.da`, posée
  sur `<body>` par la prop `bodyClass="da"` de BaseLayout : jetons et fond de page. La
  typographie, les règles de titres et l'anneau de focus sont portés par `.da-bloc`, à
  poser sur chaque bloc (en-tête, pied, section).
- **Composants** : `src/components/accueil/` (un par section, styles dans son `<style>`
  scopé ; données dans `src/data/`), `src/components/da/` (`HeaderDA`, `FooterDA`,
  `ScriptTiroirDA`). Aucune classe Tailwind dans ces deux dossiers.
- ⚠️ **Pièges Tailwind dans les `<style>`** : Tailwind lit tout le fichier `.astro`,
  `<style>` et commentaires compris. Un mot qui est aussi un nom de classe
  (`backdrop-filter`, `text-wrap`, `ease-in-out`…) ajoute une règle à la feuille globale :
  son empreinte change, donc le HTML de toutes les pages. Écrire `text-wrap-style`,
  `cubic-bezier(…)`, et vérifier après build que `BaseLayout.*.css` n'a pas changé de nom.
  Autre piège, à la minification : `animation` et `animation-timeline` dans la même règle
  sont fusionnés en une déclaration invalide ; écrire la ligne de temps dans une seconde
  règle, sous un autre sélecteur.
- **Police** : un seul woff2 (`src/assets/fonts/`, sous-ensemble latin), préchargé par
  `index.astro`. Un caractère hors sous-ensemble (→, ✓, émoji) se dessine en SVG, et reste
  dans le texte dans un élément de classe `sr` (masqué à l'œil) : `verify-site.mjs`
  échoue sinon.
- ⚠️ **En-tête et pied en double jusqu'à la phase 5a** : `HeaderDA` et `FooterDA` sont
  des copies rhabillées de `Header` et `Footer`. Un lien, un libellé ou un `data-ph`
  modifié d'un côté se reporte de l'autre. `verify-site.mjs` (contrôle « 4 quater bis »)
  compare l'accueil à `/tarifs` et échoue au premier écart non déclaré dans
  `ECARTS_ENTETE_PIED_DA`. Une page qui utilise `HeaderDA` rend `ScriptTiroirDA` après
  son pied.
- **Mesure** : chaque section porte `data-landing-section`. `SECTIONS_LANDING`
  (verify-site) et `SECTIONS` (`src/lib/landing-analytics.ts`) changent dans le même
  commit ; verify-site garde aussi les `data-track`, les ancres `#parcours`, `#pricing` et
  `#film-presentation`, un plancher de mots et l'égalité FAQ visible / `FAQPage`.
- **Chiffres** : journées et lieux du bloc fondateur relevés en base par `count(*)`
  (MIGRATION.md § 9.u), datés sur la page, jamais écrits à la main. Le compte de la
  fenêtre produit est fictif (`src/data/demoAccueil.ts`, une seule mention « Compte de
  démonstration »).

## SEO — contrat par page

Chaque page passe par `src/layouts/BaseLayout.astro` : props `title` (<60 car., mot-clé
d'abord), `description` (~150 car.), `path` (canonique, sans slash ; `""` pour l'accueil),
`ogImage`, `jsonLd` (tableau — Organization est injecté partout automatiquement),
`noindex`. Constantes partagées (URLs, tarifs, schémas Organization/SoftwareApplication,
PRODUCT_DEFINITION réutilisée mot pour mot) : `src/lib/site.ts`.
`/essai` est noindex et exclu du sitemap (filtre dans `astro.config.mjs`).

## Blog

- **La source de vérité est CE dépôt** : `src/content/blog/*.md` (48 articles au 10 novembre 2026), schéma dans
  `src/content.config.ts`. Nouvel article = nouveau `.md` (nom de fichier = slug d'URL).
- ⚠️ `scripts/generate-blog-content.mjs` a servi à la migration initiale depuis
  `blogArticles.ts` de la SPA — le relancer ÉCRASERAIT les éditions faites ici
  (ex. les blocs « L'essentiel »). Ne le relancer que pour ré-importer sciemment.
- Encadrés : directives `:::warning` / `:::tip` / `:::essentiel` (plugin
  `src/lib/remark-callouts.mjs`, styles `.callout-*` dans global.css).
- Frontmatter `faq`/`relatedArticles`/`slides`/`cta` rendus par `src/pages/blog/[slug].astro`
  (FAQ visible + FAQPage JSON-LD ; slides = îlot embla `BlogSlides.tsx`).
- Dates : `pubDate`/`updatedDate` alimentent le `lastmod` du sitemap via
  `src/generated/blog-meta.json` (régénéré par le script ; à tenir à jour si édition
  manuelle — `verify-site.mjs` échoue désormais si une date y diverge du frontmatter).
  Ne jamais y mettre une date de build : un `lastmod` faux fait ignorer le signal
  sur tout le site (voir MIGRATION.md § 9.ai).
- Covers : chemins `/blog/...` du frontmatter résolus vers `src/assets/blog/` et optimisés
  (webp) via `import.meta.glob` + `getImage` dans les templates blog.

## Outils (îlots React, hydratés `client:visible`)

- `/simulateur` → `src/components/simulateur/SimulateurApp.tsx`. Branche RSPM (< 38 k€) :
  calcul 100 % local (`src/lib/simulateur/`, `src/lib/baremes-ir.ts`…). Branche PAMC :
  POST vers l'Edge Function Supabase publique `calculate-urssaf` via
  `src/lib/supabase-public.ts` (clé anon publique dans `.env`, RLS côté serveur).
- `/guide-declarations/calculette` → `src/components/calculette/CalculetteApp.tsx`,
  100 % local (moteur `src/lib/calc/dsPamc.ts`), persistance localStorage.
- `/guide-declarations` → îlot `BoussoleWizard` + sections statiques, données
  `src/data/boussoleData.ts`.
- Les îlots sont SSR-és au build (leur HTML est indexable) ; pas d'accès
  window/localStorage au rendu (uniquement useEffect/handlers). Pas de framer-motion.

## Analytics & scripts tiers

- **PostHog** (`src/components/PostHog.astro`) : clé projet
  `phc_x3JYWa7EjhuuwVVBLyks74ud58ZmUppaC666QkmTUXox`, proxy first-party
  `https://t.hippodoc.fr`, persistance `memory` → `localStorage+cookie` après consentement.
- **Instrumentation** : attributs `data-ph="landing_*"` (autocapture) et `data-track-*`
  sur les CTA — suivre la convention de nommage de la SPA source pour ne pas casser les
  insights PostHog existants.
- **GA4/Meta Pixel/Crisp** (`src/components/ThirdPartyScripts.astro`) : règle absolue —
  **rien ne se charge dans la fenêtre Lighthouse**. Crisp = première interaction
  uniquement ; gtag/pixel = première interaction OU load+6 s ; pixel gaté par le
  consentement (`localStorage['cookie-consent']`, valeurs `accepted`/`essential-only`,
  même clé que l'app). Bannière cookies incluse ; « Préférences cookies » au footer.
- **Calendly** : liens directs (`calendly.com/hippodoc/decouverte-d-hippodoc`), jamais le widget.

## Vérification avant push

1. `npm run build` (70 pages au 10 novembre 2026, dont 68 dans le sitemap : une de plus par
   nouvel article) puis `node scripts/verify-site.mjs`.
2. Si les îlots ont changé : test navigateur (le pattern Playwright est dans l'historique
   de session ; Chromium : `/opt/pw-browsers/chromium`).
3. Lighthouse local si perf touchée : `npx serve dist -l 4321` +
   `npx lighthouse http://localhost:4321/ --chrome-flags="--headless --no-sandbox"`.

## Recherche d'audience

Le dossier `hippodoc-corpus/` contient la demande réelle des médecins libéraux
(94 questions, 958 réponses). Lire `hippodoc-corpus/carte-de-la-demande.md` avant
toute décision éditoriale, et respecter `hippodoc-corpus/CLAUDE.md` — le corpus est
une boussole, jamais une source de texte.
