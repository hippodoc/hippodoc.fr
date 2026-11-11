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
  (fermeture au clic d'une ancre — voir MIGRATION.md §9 ; rendu une seule fois par page,
  après le pied, par `src/components/ScriptTiroir.astro`, que rend `Footer.astro` ; il ne
  se modifie pas : `verify-site.mjs` en fige l'empreinte), le script inline du lecteur du film de
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

## DA 2026 — accueil, en-tête, pied et police

**Toutes les pages sont dans la nouvelle direction artistique** depuis la phase 5d :
l'accueil (MIGRATION.md § 9.eb), l'en-tête, le pied, la police, la bannière cookies et la
bulle de chat (phase 5a, § 9.ed), `/tarifs`, `/faq`, `/qui-sommes-nous` et `/essai`
(5b, § 9.ee), `/blog`, les pages de série et les 48 articles (5c, § 9.ej), `/simulateur`
(§ 9.ek), le guide des déclarations et la calculette (§ 9.el), `/guide`, `/comparatif`,
les quatre pages légales et la 404 (§ 9.em). Une nouvelle page se fait dans la DA, sans
classe utilitaire (voir « Ce qui reste de Tailwind », plus bas).

- **Feuille** : `src/styles/da.css` (police, jetons, `.btn`, `.wrap`, feuilles `.band`,
  plis `.qa`, en-tête `hd-*`, pied `ft-*`, bannière cookies, bulle de chat). Importée par
  BaseLayout après `global.css` : elle sort dans la feuille commune à toutes les pages.
  Tout vit sous `.da`, que BaseLayout pose sur le `<body>` de toutes les pages (jetons
  seulement). Le fond de page de la DA demande en plus `bodyClass="da-fond"` : toutes les
  pages le passent. La typographie de la DA, ses règles de titres et son anneau de focus
  sont portés par `.da-bloc`, à poser sur chaque bloc (en-tête, pied, section).
- **Un seul en-tête, un seul pied** : `src/components/Header.astro` (prop `variante` :
  toutes les pages passent `flottante`, leur premier bloc est un ciel qui réserve le haut
  à la pastille ; `flux`, la valeur par défaut, où la pastille garde 80 px sur une bande
  de ciel, ne sert plus à aucune page depuis la phase 5d) et `Footer.astro` (prop
  `soutiens`), qui rend aussi `ScriptTiroir.astro`. Une page rend les deux ou aucun. `verify-site.mjs` (contrôle
  « 4 quater bis ») fige les `data-ph` et `data-track` de l'en-tête et du pied
  (`MESURE_ENTETE_PIED`), vérifie sur chaque page du build les mêmes liens que sur
  l'accueil et le micro-script du tiroir une seule fois après le pied ; une page sans
  en-tête se déclare dans `PAGES_SANS_ENTETE`.
- **Premier bloc d'une page** : un ciel (`linear-gradient(var(--sky-1) 0, var(--sky) 460px)`)
  qui passe sous la pastille de l'en-tête et lui réserve le haut par son remplissage
  (100 à 148 px selon la largeur, voir `.tete` de `/tarifs`). La classe `da-sous-entete`
  et la bande `.hd-ciel` (`da.css`), faites pour l'en-tête `flux` des pages d'avant la DA,
  ne servent plus à aucune page : restées dans `da.css` et `Header.astro`, à retirer ou à
  garder, décision du propriétaire (MIGRATION.md § 9.em).
- **Composants de l'accueil** : `src/components/accueil/` (un par section, styles dans son
  `<style>` scopé ; données dans `src/data/`). Aucune classe Tailwind dans ce dossier, ni
  dans `Header.astro` et `Footer.astro`.
- **Pages intérieures** (phases 5b à 5d) : `da-fond`, un bloc « ciel » puis des feuilles
  `.band`, aucune classe Tailwind ; styles dans le `<style>` de la page (une feuille à
  part, `tarifs.*.css`… : la feuille commune ne grossit pas), ou dans une feuille de
  `src/styles/` quand plusieurs pages ou un îlot la partagent (`blog-liste.css`,
  `simulateur.css`, `guide.css`, `calculette.css`, `legal.css`). Les quatre pages légales
  passent par `src/layouts/PageLegale.astro` (emplacement `tete` : le `<h1>` et sa
  ligne ; le texte sans classe, habillé par élément par `legal.css`, typographie de
  lecture du gabarit d'article). ⚠️ Dans un `<style>` scopé, une remise à zéro du genre
  `.bloc > * { margin: 0 }` pèse plus qu'une classe seule (`.titre`) : écrire la marge
  avec deux classes (`.bloc .titre`). Titres : `--h1-page` pour le
  `<h1>`, `--h2-fin` pour le titre de la scène de fin (jetons de `da.css`). Corps de
  texte en rem dans ces pages (la feuille de la DA les pose en px : chaque page les
  repose en tête de son `<style>`). Dans la scène de fin, le texte passe devant le décor
  (`z-index`) et le halo du soleil commence après le dernier lien. ⚠️ Une page intérieure ne rend pas un composant de `accueil/` qui a un
  `<style>` (`Mascotte.astro`) : partagé, ce style sort de la feuille de l'accueil et
  change son HTML. Période d'observation SEO : texte, titres, liens et JSON-LD d'une page
  rhabillée se prouvent identiques au build de `main`, par script.
- ⚠️ **Pièges Tailwind dans les `<style>`** : Tailwind lit tout le fichier `.astro`,
  `<style>` et commentaires compris. Un mot qui est aussi un nom de classe
  (`backdrop-filter`, `text-wrap`, `ease-in-out`…) ajoute une règle à la feuille commune :
  son empreinte change, donc le HTML de toutes les pages. Écrire `text-wrap-style`,
  `cubic-bezier(…)`, et vérifier après build que la feuille commune
  (`dist/_astro/_astro_assets.*.css`, la seule feuille de `/mentions-legales` ou d'un
  article) n'a pas changé de nom quand seule l'accueil a changé.
  Autre piège, à la minification : `animation` et `animation-timeline` dans la même règle
  sont fusionnés en une déclaration invalide ; écrire la ligne de temps dans une seconde
  règle, sous un autre sélecteur.
- **Ce qui reste de Tailwind, et pourquoi** (§ 9.em). Tailwind n'habille plus aucune
  page. Il reste dans le build pour : son socle (preflight, sur lequel la DA est écrite) ;
  `src/components/ui/` (shadcn, partagé par les trois outils) et ses jetons `--background`,
  `--primary`… de `global.css` ; les `.tsx` des îlots, où la logique et l'habillage sont
  mêlés (la calculette garde tous ses utilitaires, que `calculette.css` recouvre ; le
  simulateur et le guide des déclarations en gardent une partie à côté de leurs classes
  `sim-*` et `gd-*`) ; le carrousel du blog (`BlogSlides.tsx`), `BlogReadMore.astro` ; la
  bannière cookies et la bulle de chat de `ThirdPartyScripts.astro` (rhabillées par
  `da.css`) ; trois classes de `src/pages/index.astro` (lien d'évitement, conteneurs).
  `tailwind.config.ts` ne garde que les couleurs `hippo`, les jetons shadcn, les rayons,
  l'accordéon et les images clés `shimmer` (squelette du simulateur) ;
  `corePlugins.container` est coupé. Avant de retirer une règle de `global.css` ou de la
  config : prouver qu'aucune source ni aucun fichier du build ne la nomme, puis comparer
  la feuille commune règle par règle (une image clé peut en recouvrir une autre de même
  nom : `shimmer`, `fadeIn`).
- **Police** : Google Sans Flex sur tout le site. Un seul woff2 (`src/assets/fonts/`,
  sous-ensemble latin, graisses 400 à 800), préchargé par BaseLayout sur toutes les pages
  et donné à `<html>` par `fontFamily.sans` (`tailwind.config.ts`) ; les trois `@font-face`
  (la police, et deux faces de repli à métriques ajustées : graisses 400 à 599 et 600 à
  800) sont dans `da.css`. La police n'a aucune flèche. Dans un bloc de la DA (accueil,
  en-tête, pied), un caractère hors sous-ensemble (→, ✓, émoji) se dessine en SVG, et reste
  dans le texte dans un élément de classe `sr` (masqué à l'œil) : `verify-site.mjs` échoue
  sinon sur l'accueil. Les pages intérieures font de même pour les flèches de leurs
  gabarits. Dans les textes des données et des articles (guide des déclarations, îlots,
  Markdown), ces caractères restent tels quels (→ ↓ ≈ ≠ ≥ ᵉ, émojis…) et sortent dans la
  police suivante de la pile : Arial par la face de repli, sinon la police du système.
- **Mesure** : chaque section porte `data-landing-section`. `SECTIONS_LANDING`
  (verify-site) et `SECTIONS` (`src/lib/landing-analytics.ts`) changent dans le même
  commit ; verify-site garde aussi les `data-track`, les ancres `#sous-la-surface`,
  `#parcours`, `#pricing` (les trois cibles du menu, sur toutes les pages) et
  `#film-presentation`, un plancher de mots et l'égalité FAQ visible / `FAQPage`.
- **Chiffres** : journées et lieux du bloc fondateur relevés en base par `count(*)`
  (MIGRATION.md § 9.u), datés dans l'en-tête de `Fondateur.astro` et dans MIGRATION.md
  § 9.ec (la date n'est plus affichée sur la page), jamais écrits à la main. Le compte de la
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
  `src/lib/remark-callouts.mjs` ; depuis la phase 5c, les styles des encadrés et de tout le
  corps d'article sont dans le `<style>` scopé de `src/pages/blog/[slug].astro`, plus dans
  global.css ; le corps se repère par `data-blog-zone="corps"`).
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

- `/simulateur` → `src/components/simulateur/SimulateurApp.tsx`. Habillage DA (§ 9.ek) :
  classes `sim-*` de `src/styles/simulateur.css` (page seule), posées aussi sur les bulles
  et listes que Radix rend hors de l'îlot ; `src/components/ui/` est partagé avec la
  calculette et le guide, ne pas le modifier pour le simulateur. Branche RSPM (< 38 k€) :
  calcul 100 % local (`src/lib/simulateur/`, `src/lib/baremes-ir.ts`…). Branche PAMC :
  POST vers l'Edge Function Supabase publique `calculate-urssaf` via
  `src/lib/supabase-public.ts` (clé anon publique dans `.env`, RLS côté serveur).
- `/guide-declarations/calculette` → `src/components/calculette/CalculetteApp.tsx`,
  100 % local (moteur `src/lib/calc/dsPamc.ts`), persistance localStorage. Habillage DA
  (§ 9.el) : `.calc` de `src/styles/calculette.css` (page seule), posée sur la racine de
  l'îlot et sur ce que Radix rend dans `<body>`. Les `.tsx` gardent leurs utilitaires ;
  leurs couleurs sont recouvertes une par une dans cette feuille : une nouvelle classe de
  couleur dans un `.tsx` s'y ajoute, sinon elle sort dans l'ancienne palette.
- `/guide-declarations` → îlots `BoussoleWizard` et `BoussoleSearchIsland` + sections
  statiques, données `src/data/boussoleData.ts`. Habillage DA (§ 9.el) : classes `gd-*` de
  `src/styles/guide.css`, servie au hub et aux trois pages filles (`GuideSousPage.astro`) ;
  plus de classe utilitaire dans `src/components/guide/`, sauf `FormattedText.tsx`
  (recouvert par la feuille). La barre de recherche reste enfant direct de `<main>` : elle
  est collante sur toute la page ; la boussole se place d'après `[role="search"]` et le
  premier `<h3>` de sa fiche.
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

Le corpus `hippodoc-corpus/` contient la demande réelle des médecins libéraux
(94 questions, 958 réponses). **Il n'est pas dans ce dépôt** : le propriétaire le
fournit à part. Quand il est fourni, lire `hippodoc-corpus/carte-de-la-demande.md`
avant toute décision éditoriale, et respecter `hippodoc-corpus/CLAUDE.md` — le corpus
est une boussole, jamais une source de texte.
