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
  d'indexation). Une seule exception, décidée par le propriétaire : les trois pages de série
  (`/blog/serie/*`), retirées et redirigées en 301 vers un thème ou `/blog` (§ 9.fq) ;
  `verify-site.mjs` (« 4 septdecies ») garde ces trois redirections. Politique : **pas de slash final** (`trailingSlash: 'never'`,
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
  (`<details>/<summary>`, `popover`) : onglets, profils, plis et pause du décor de l'accueil
  compris, et l'affiche d'un article ouverte en grand (§ 9.fo).
- **Radix ne SSR pas le contenu fermé** — un Accordion/Collapsible Radix fermé ne livre
  PAS son texte dans le HTML statique. Pour tout contenu porteur de SEO : `<details>` natif.
- **Lighthouse ≥ 95** (perf/SEO/a11y/BP) sur `/`, `/simulateur` et un article. Contraste :
  `text-hippo-500` interdit sur fond blanc en petit texte (utiliser `hippo-600`).

## DA 2026 — accueil, en-tête, pied et police

**Toutes les pages sont dans la nouvelle direction artistique** depuis la phase 5d :
l'accueil (MIGRATION.md § 9.eb), l'en-tête, le pied, la police, la bannière cookies et la
bulle de chat (phase 5a, § 9.ed), `/tarifs`, `/faq`, `/qui-sommes-nous` et `/essai`
(5b, § 9.ee), `/blog`, les pages de série (retirées en § 9.fq) et les 48 articles
(5c, § 9.ej ; refaits en § 9.fj à 9.fl), `/simulateur` (§ 9.ek), le guide des déclarations
et la calculette (§ 9.el), `/guide`, `/comparatif`, les quatre pages légales et la 404 (§ 9.em). Une nouvelle page se fait dans la DA, sans
classe utilitaire (voir « Ce qui reste de Tailwind », plus bas).

- **Feuille** : `src/styles/da.css` (police, jetons, `.btn`, `.wrap`, feuilles `.band`,
  plis `.qa`, en-tête `hd-*`, pied `ft-*`, bannière cookies, bulle de chat). Importée par
  BaseLayout après `global.css` : elle sort dans la feuille commune à toutes les pages.
  Tout vit sous `.da`, que BaseLayout pose sur le `<body>` de toutes les pages (jetons
  seulement). Le fond de page de la DA demande en plus `bodyClass="da-fond"` : toutes les
  pages le passent. La typographie de la DA, ses règles de titres et son anneau de focus
  sont portés par `.da-bloc`, à poser sur chaque bloc (en-tête, pied, section).
- **Un seul en-tête, un seul pied** : `src/components/Header.astro` (sans prop, une seule
  forme : la pastille survole le premier bloc de la page, un ciel qui lui réserve le
  haut) et `Footer.astro` (prop `soutiens`), qui rend aussi `ScriptTiroir.astro`. Une page
  rend les deux ou aucun. `verify-site.mjs` (contrôle
  « 4 quater bis ») fige les `data-ph` et `data-track` de l'en-tête et du pied
  (`MESURE_ENTETE_PIED`), vérifie sur chaque page du build les mêmes liens que sur
  l'accueil et le micro-script du tiroir une seule fois après le pied ; une page sans
  en-tête se déclare dans `PAGES_SANS_ENTETE`.
  ⚠️ À l'écran, l'en-tête est tenu à la fenêtre (`position: fixed` sous `@media screen`,
  § 9.ev), pas collé dans le flux : ne pas le remettre en `sticky`. Un élément collé dont
  un contrôle se trouve dans la bande de `scroll-padding-top` fait remonter la page à
  chaque focus qui ne vient pas d'un appui direct (le `<label>` du menu qui donne le focus
  à sa case, Tab) : le navigateur fait défiler pour sortir le contrôle de la bande, et il
  n'en sort jamais. Les barres collantes du guide et de la calculette avaient ce défaut :
  elles restent collantes, et leur bande se réduit tant que le focus est dedans (§ 9.ey).
  Son bord droit est `var(--removed-body-scroll-bar-size, 0px)`, pas `0`
  (§ 9.ex) : quand une liste de Radix verrouille le défilement (simulateur, calculette),
  `<body>` reçoit une marge de la largeur de la barre retirée, et un élément tenu à la
  fenêtre qui ne la suit pas saute de 7,5 px. Un nouvel élément `fixed` qui touche le bord
  droit fait de même, et se vérifie barres de défilement affichées (Playwright les masque :
  `ignoreDefaultArgs: ['--hide-scrollbars']`). Tiroir ouvert, `<html>` passe en `overflow: hidden` sous 960 px et au doigt
  seulement (`pointer: coarse`) : à la souris, retirer la barre de défilement refait la
  mise en page, et `scrollbar-gutter: stable` change la largeur de référence des `vw`.
- **Bulle de chat sur téléphone** (`da.css`, § 9.ew). Sous 640 px elle n'arrive qu'après
  le haut de page (invisible à 0, pleine à 144 px de défilement ou au bout de la page,
  par une animation liée au défilement ; sans elle, bulle dès l'arrivée) ; sous 960 px
  elle s'efface tant qu'un champ de texte a le focus (`:read-write:focus`). Ces deux
  règles d'arrivée ont un poids nul (`:where`) : une page qui veut sa propre plage
  l'écrit avec `#crisp-launcher` seul, comme `/essai` (380 à 420 px) et les articles du
  blog (après la carte d'essai, § 9.fm) ; `/guide` cache la bulle sous 768 px, `/blog` et
  les thèmes sous 640 px. Un premier écran de téléphone n'a donc plus à compter avec elle.
  Elle passe toujours sur le bord droit des contenus pendant le défilement : rien
  d'important ne se cale à moins de 72 px du bord droit dans un élément fixe ou collant
  en bas d'écran.
- **Premier bloc d'une page** : un ciel (`linear-gradient(var(--sky-1) 0, var(--sky) 460px)`)
  qui passe sous la pastille de l'en-tête et lui réserve le haut par son remplissage
  (100 à 148 px selon la largeur, voir `.tete` de `/tarifs`). L'ancienne forme de
  l'en-tête pour les pages sans ciel (prop `variante`, bande `.hd-ciel`, classe
  `da-sous-entete`) a été retirée en phase 6 (MIGRATION.md § 9.eo).
- **Composants de l'accueil** : `src/components/accueil/` (un par section, styles dans son
  `<style>` scopé ; données dans `src/data/`). Aucune classe Tailwind dans ce dossier, ni
  dans `Header.astro` et `Footer.astro`.
- **Accueil épurée** (novembre 2026, MIGRATION.md § 9.eu) : chaque chose est dite une fois.
  Ordre : premier écran, « Sous la surface », « Pour qui », fondateur et film,
  témoignages (ciel), syndicats et partenaires (sable), tarifs, questions, guides, scène
  finale. Ne pas remettre ce qui a été retiré sans le décider (textes archivés en § 9.eu).
  - Les étapes ne sont racontées que dans « Pour qui » : une seule forme pour les quatre
    profils (titre, phrase `acc`, précision `det` ; `verify-site.mjs` échoue si une étape
    n'a pas les trois). Sous 640 px, elles se feuillettent de côté comme les témoignages,
    et les quatre panneaux occupent la même case de grille (même hauteur de section pour
    tous les profils). Les trois cases de « Sous la surface » n'ont qu'une ligne chacune.
  - Feuilles à lignes (questions, guides, partenaires et soutiens) : une feuille blanche
    qui rogne (`overflow: hidden`), un filet entre deux lignes, la ligne teintée au
    survol, l'anneau de focus tracé à l'intérieur (`outline-offset` négatif, sinon la
    feuille le rogne). `.qa` (da.css) reste une fiche, partagée avec `/faq`, `/tarifs` et
    les plis des tarifs : les règles de la feuille des questions sont dans
    `Questions.astro`.
  - Les règles communes aux feuilles de l'accueil (remplissage 44 et 72 px sous 560 px,
    60 et 92 px de 560 à 899 px, 76 et 112 px à partir de 900 px, chapô en 17 px sur
    téléphone, marge sous l'en-tête 22, 30 et 36 px) sont répétées dans le `<style>` de
    chaque composant, jamais dans `da.css`. Sans le palier du milieu, `da.css` donne plus
    d'air à la tablette qu'à l'ordinateur (§ 9.ex).
  - Film : sous 700 px, le cadre est une vignette tant que le `<video>` n'a pas
    l'attribut `controls` ET que le sablier est masqué
    (`.film:not(:has(video[controls], #film-play-attente:not([hidden])))`). Le script du
    film, non modifié, retire `controls` au chargement, affiche le sablier à l'appui et
    rend `controls` à la lecture : le cadre grandit dès l'appui (à la lecture seulement,
    le saut comptait dans le CLS sur un réseau lent, § 9.ex). Toucher à ce que le script
    fait de `controls` ou de `hidden` sur le sablier change donc la mise en page. Sans
    `:has()` ou sans script, le cadre est grand d'emblée ; sans script, l'invitation à
    lire est retirée (`@media (scripting: none)`) pour laisser les contrôles natifs.
    De 560 à 699 px, le portrait et les chiffres gardent la grille du téléphone (même
    seuil que la vignette). Le film est en miroir du portrait (§ 9.fh) : le portrait à
    gauche, le film à droite, à toutes les largeurs (vignette à droite sur téléphone).
    Son invitation, « Voir la vidéo · 1 min », est centrée au pied de l'affiche ; sous
    700 px, « 1 min » seul. Le nom du bouton commence par « Voir la vidéo ».
  - Pause du décor : `body:has(.pause:checked)`, une seule pour les deux scènes et les
    bulles. Ne pas donner la classe `pause` à autre chose sur l'accueil. Une fois le
    décor arrêté par l'une des deux cases, l'autre est masquée
    (`body:has(.hero .pause:checked)`, `body:has(.end .pause:checked)`) : sans script, deux
    cases ne se suivent pas. Les classes `hero` et `end` des deux scènes ne se renomment
    donc pas sans ces règles.
  - Soutiens (`Partenaires.astro`) : chaque soutien est une colonne, ses logos au-dessus
    de sa légende. Ne pas ranger les logos sur une ligne et les légendes sur une autre :
    la légende de La French Care se lisait sous Bpifrance (§ 9.ex).
  - Un nombre et son signe, un mot et sa ponctuation tiennent ensemble sans changer un
    caractère du texte : `<span class="nb">` au rendu, ou `nouer()` de `src/lib/typo.ts`
    (définition du produit).
  - Questions : neuf (`src/data/faqAccueil.ts`), la dernière, « Qu'est-ce qu'Hippodoc ? »,
    porte `PRODUCT_DEFINITION` mot pour mot (§ 9.fh ; ce n'est plus le sous-titre du film).
    Les `id` `super-net` et `retrocessions` sont retirés et ne se réutilisent pas (séries
    PostHog arrêtées).
  - ⚠️ Astro ajoute son attribut de portée à chaque maillon d'un sélecteur : `.a .b + .b >
    x` pèse donc plus que `.a .b > x:hover`. Un raccourci (`background`) posé dans le
    premier efface la couleur de survol du second : y écrire les propriétés longues.
  - Sitemap : `/` a sa date, `ACCUEIL_LAST_UPDATED_ISO` (`src/lib/pages-lastmod.ts`), à
    mettre à jour à chaque retouche de texte de l'accueil.
- **Pages intérieures** (phases 5b à 5d) : `da-fond`, un bloc « ciel » puis des feuilles
  `.band`, aucune classe Tailwind ; styles dans le `<style>` de la page (une feuille à
  part, `tarifs.*.css`… : la feuille commune ne grossit pas), ou dans une feuille de
  `src/styles/` quand plusieurs pages ou un îlot la partagent (`blog-liste.css`,
  `blog-article.css`, `simulateur.css`, `guide.css`, `calculette.css`, `legal.css`). Les quatre pages légales
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
- ⚠️ **Ordre des feuilles sur les pages d'outils** (§ 9.en) : sur `/simulateur`, la
  calculette et les pages du guide des déclarations, la feuille de la page
  (`simulateur.css`, `calculette.css`, `guide.css`) est liée AVANT la feuille commune
  (ailleurs, après : regarder l'ordre des `<link>` dans le HTML du build). Deux effets.
  À poids égal, `da.css` l'emporte : une règle sur `<html>` s'écrit
  `html:has(.da-fond):has(.gd-rech)`, pas `html:has(.gd-rech)`. Et une règle
  `.calc .x { display: … }` bat un utilitaire Tailwind gardé dans le .tsx (`lg:hidden`,
  `sticky`) : la borner par `@media` à la plage où l'utilitaire ne s'applique pas.
  Une barre collante se double d'un `scroll-padding-top` sur `<html>` (sa hauteur),
  sinon ancres et focus au clavier arrivent dessous. Ses propres contrôles sont alors
  dans cette bande, et la barre suit la fenêtre : à tout focus qui fait défiler (Tab,
  `focus()`, saisie, retour du focus à la fermeture d'un menu Radix), la page remontait
  (§ 9.ey). Tant que le focus est dans la barre, la bande se réduit donc à son `top`
  (`html:has(.da-fond):has(.calc-barre :focus)`), et la cible d'un défilement par script
  lancé depuis la barre reprend la différence en `scroll-margin-top`, sous la même
  condition (`.calc-colonne`) : une nouvelle barre collante reçoit les deux. Pour le
  mesurer, cliquer par coordonnées (`page.mouse.click`) : `locator.click()` de Playwright
  fait défiler lui-même le bouton hors de la bande.
- ⚠️ **Pièges du moteur de Safari** (§ 9.ep, § 9.eq). Le site se conçoit dans Chromium : ces
  écarts ne s'y voient pas, ils se vérifient dans WebKit (« Vérification avant push »).
  Un cadre `aspect-ratio` posé hors du flux (`position: absolute`) y prend la hauteur de
  son contenu : lui donner `min-height: 0` (les six cadres de mascotte : `/faq` deux
  fois, `/tarifs`, accueil, `/simulateur`, `/guide-declarations` ; un nouveau cadre de ce
  genre le reçoit d'office).
  `font-variant-numeric: tabular-nums` élargit aussi l'espace dans Chromium (fonction
  `tnum` de la police), pas dans Safari : ne jamais compenser par `word-spacing` ; pour
  des chiffres alignés au milieu de mots, la face « Google Sans Flex Chiffres » de
  `src/styles/blog-article.css` (tableaux et chiffres des articles). Un interlettrage négatif (`.aff`,
  titres) sur un nombre à espace fine (U+202F, `Intl.NumberFormat`) : Chromium ne
  l'applique pas, Safari colle les milliers ; poser `letter-spacing: 0` sur le nombre
  (`.sim-supernet-montant`). Un fond translucide sans flou laisse lire le texte qui passe
  dessous : la pastille de l'en-tête a un fond plein sous 900 px, et son verre (flou, fond
  à 92 %) sous `@supports` à partir de 900 px.
- ⚠️ **Préfixes et vieux Safari** (§ 9.ep) : `astro.config.mjs` donne ses navigateurs cibles
  au minificateur CSS (`vite.build.cssTarget`). Sans elles, il retire les préfixes écrits
  dans les sources (`-webkit-backdrop-filter` : pas de flou avant Safari 18) et fusionne
  `text-decoration` et son épaisseur en une forme que Safari ne lit que depuis 26.2 (liens
  sans soulignement). Ne pas les retirer. Après un changement de cibles, comparer les
  feuilles du build déclaration par déclaration : une cible sans `:has()` (Firefox avant
  121) fait réécrire les listes de sélecteurs en `:is(…)`, ce qui change leur poids.
  Toucher aux cibles réécrit toutes les feuilles, pas seulement la commune : leurs noms
  changent sur toutes les pages (§ 9.eq).
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
  `corePlugins.container` est coupé. Le site n'a pas de mode sombre : les classes
  `dark:…` des `.tsx` (îlots, `ui/`) y restent, mais `content.transform` les cache à
  Tailwind, qui n'écrit plus leurs règles (§ 9.eo) ; ne pas poser de classe `dark` sur un
  élément sans retirer ce filtre. Ce qui reste d'inemployé dans la feuille commune, et
  pourquoi, est listé en § 9.eo (exports inutilisés de `ui/skeleton.tsx`, surtout). Avant de retirer une règle de `global.css` ou de la
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
  gabarits. Dans les textes des données (guide des déclarations, îlots), ces caractères
  restent tels quels (→ ↓ ≈ ≠ ≥ ᵉ, émojis…) et sortent dans la police suivante de la
  pile : Arial par la face de repli, sinon la police du système. Les émojis des articles du
  blog restent dans le Markdown et le HTML, masqués ou dessinés au rendu (« Blog », plus bas).
- **Mesure** : chaque section porte `data-landing-section`. `SECTIONS_LANDING`
  (verify-site) et `SECTIONS` (`src/lib/landing-analytics.ts`) changent dans le même
  commit quand une section apparaît ou disparaît ; `SECTIONS_LANDING` suit l'ordre de la
  page (vérifié), `SECTIONS` garde son rang historique. verify-site garde aussi les
  `data-track`, les ancres `#sous-la-surface`, `#parcours`, `#pricing` (les trois cibles
  du menu, sur toutes les pages) et `#film-presentation`, l'égalité FAQ visible /
  `FAQPage`, un plancher de mots (2 680 depuis l'épure, à abaisser sciemment seulement) et
  la présence des termes porteurs dans le texte rendu (« médecin remplaçant », URSSAF,
  CARMF, 2035, 2042-C PRO, DSFU, RSPM, PAMC, Micro-BNC, rétrocession, contrat et licence
  de remplacement), et, dans le panneau `data-panel="remplacant"` de « Pour qui », celle
  de « 2035 », « 2042-C PRO », « DSFU », « contrat de remplacement » et « serveur officiel
  URSSAF » (§ 9.ex). L'égalité FAQ visible / `FAQPage` (contrôle « 4 septies », § 9.ez,
  durci en § 9.fc) se prouve pli par pli, sur toutes les pages. Le contrôle EXIGE que
  chaque question du schéma soit le titre d'un `<details>` (le texte entier d'un élément
  de son premier `<summary>`, que rien ne précède dans le pli), et que le texte du
  conteneur de ce pli (`.qa-in` ; `.gd-reponse` dans le guide) soit ÉGAL à la réponse du
  schéma, du premier au dernier signe : ponctuation, puces du guide et séparation des
  mots comprises, pour la question comme pour la réponse (nombre d'espaces et retours à
  la ligne mis à part).
  Échouent : une réponse vide, échangée avec une autre, tronquée, allongée à l'écran ;
  une réponse ou une question masquée (attribut `hidden`, style en ligne `display:none`
  ou `visibility:hidden`, contenu d'un `<dialog>` fermé, d'un `<canvas>`…) ; un mot
  glissé entre la question et sa réponse, devant la question dans son `<summary>`, ou
  dans le pli avant le `<summary>` (seul un repère est admis autour de la question :
  trois signes au plus, sans lettre, ni chiffre après elle — le « + » d'un `<summary>`,
  le numéro de `/faq`) ; une question du schéma qui n'est le titre d'aucun pli, un pli
  sans conteneur reconnu (pas de repli : la réponse ne serait comparée à rien) ; un
  autre `<details>`, que le schéma n'a pas, dans l'élément qui contient les plis du
  schéma ; un second bloc `FAQPage` dans la page, une question deux fois dans le schéma,
  un `FAQPage` ailleurs qu'à la racine d'un JSON-LD (`@graph`, tableau) ou illisible ; un
  compte de pages ou de questions sous `PLANCHER_FAQ` (58 pages, 392 questions : une page
  qui perd son schéma, une rubrique retirée du schéma et restée à l'écran). Ce plancher
  se relève à chaque article ou question ajoutés (un avertissement le demande) et ne
  s'abaisse que si la disparition est voulue.
  Le contrôle ne voit pas : une réponse masquée par une feuille de style (classe) ou un
  autre style en ligne (`opacity`) ; ce qui s'affiche autour d'un pli sans être dedans
  (une phrase juste avant ou juste après le `<details>`, la même question reprise
  ailleurs hors d'un pli, une question hors de l'élément qui contient les plis du
  schéma) ; des mots dessinés dans un `<svg>` ou une image au milieu d'une réponse ; un
  repère qui dirait quelque chose (« ✗ », « ≠ ») ; la nature des espaces (insécable,
  retour à la ligne : hors du guide, rien ne dit où le schéma va à la ligne) ; dans le
  guide, une espace là où l'écran n'a qu'une balise en ligne (puce, renvoi), le texte des
  étiquettes et des « Voir aussi » d'un pli, et lequel des marqueurs ⚠️ ✅ 💡 le schéma
  porte, et où ; le balisage admis dans le schéma (une balise `<b>`, `<p>`… partout ;
  `**`, `*`, accents graves dans le guide).
  Il refuse, à texte égal, et c'est voulu : une FAQ sous un autre balisage (pli devenu
  `<div>`, conteneur renommé : déclarer d'abord le gabarit dans `CONTENEURS_DE_REPONSE`) ;
  une FAQ dans un élément `hidden` (panneau d'onglet inactif, `hidden="until-found"`),
  alors qu'un `<details>` fermé passe ; une entité nommée hors de sa table (Latin-1 et
  typographie).
  Une FAQ s'écrit donc dans ce gabarit (`<details class="qa">`, question dans `.qa-t`,
  réponse dans `.qa-in`). Un écart voulu se déclare dans `EXCEPTIONS_FAQ` (page, question,
  texte affiché à la suite de la réponse, raison) : il sort en avertissement à chaque
  passage, échoue dès qu'il ne correspond plus à rien, et c'est une décision de
  contenu, à lister pour le propriétaire (quatre aujourd'hui : les phrases à lien qui
  finissent quatre réponses de `/faq`). Ne pas assouplir la comparaison pour faire passer
  un écart. Le schéma a été aligné sur l'écran en § 9.fa, d'où deux règles. Sur `/faq`,
  `aPlain` s'écrit à la main et dit ce que `aHtml` affiche : une liste donne un élément
  par ligne, sans ponctuation ajoutée, émojis des éléments `sr` compris ; les deux se
  modifient ensemble. Dans le guide des déclarations, le schéma passe par
  `reponsePourSchema` (`src/lib/guide/reponse-schema.ts`), qui nomme les renvois
  (« QT-014 ») et met les énumérations en liste comme `FormattedText.tsx` ; le balisage de
  ce composant (`**`, `*`, accents graves, ⚠️ ✅ 💡) reste dans le schéma et le contrôle le
  retire avant de comparer, la puce de début de ligne (« - » ou « • ») vaut la puce
  affichée : une syntaxe ou une réécriture ajoutée au composant s'ajoute à
  `sansBalisageDuGuide` (verify-site) ou à `reponsePourSchema`.
- **Chiffres** : journées et lieux du bloc fondateur relevés en base par `count(*)`
  (MIGRATION.md § 9.u), datés dans l'en-tête de `Fondateur.astro` et dans MIGRATION.md
  § 9.ec (la date n'est plus affichée sur la page), jamais écrits à la main. Le compte de la
  fenêtre produit est fictif (`src/data/demoAccueil.ts`, année 2026), sans mention
  « Compte de démonstration » depuis le § 9.fn (décision du propriétaire). La fenêtre a
  quatre onglets (le quatrième, « Tes déclarations » : cases 5HQ, DSCS, DSAV, DSDE
  pré-remplies) ; sous 720 px chacun prend la largeur de son libellé, sur une ligne dès
  320 px, et les quatre vues gardent la même hauteur (mesurée de 320 à 1 440 px).

## SEO — contrat par page

Chaque page passe par `src/layouts/BaseLayout.astro` : props `title` (<60 car., mot-clé
d'abord), `description` (~150 car.), `path` (canonique, sans slash ; `""` pour l'accueil),
`ogImage`, `jsonLd` (tableau — Organization est injecté partout automatiquement),
`noindex`. Constantes partagées (URLs, tarifs, schémas Organization/SoftwareApplication,
PRODUCT_DEFINITION réutilisée mot pour mot) : `src/lib/site.ts`.
`/essai` est noindex et exclu du sitemap (filtre dans `astro.config.mjs`).

## Blog

- **La source de vérité est CE dépôt** : `src/content/blog/*.md` (48 articles au 10 novembre 2026), schéma dans
  `src/content.config.ts`. Nouvel article = nouveau `.md` (nom de fichier = slug d'URL), avec
  son `theme` (obligatoire : sans lui, ou avec un thème inconnu, la construction s'arrête ;
  voir « Thèmes », plus bas). Un article qui porte une `faq` fait monter le compte des questions : `verify-site.mjs`
  demande alors, en avertissement, de relever `PLANCHER_FAQ` (§ 9.fc).
- ⚠️ `scripts/generate-blog-content.mjs` a servi à la migration initiale depuis
  `blogArticles.ts` de la SPA — le relancer ÉCRASERAIT les éditions faites ici
  (ex. les blocs « L'essentiel »). Ne le relancer que pour ré-importer sciemment.
- Encadrés : directives `:::warning` / `:::tip` / `:::essentiel` (plugin
  `src/lib/remark-callouts.mjs`), rendus en `<div class="callout …" role="note">`, jamais en
  `<aside>` : le mode lecture de Firefox et les extracteurs des IA jettent les `<aside>`
  (« L'essentiel » : 0 article sur 48 gardé, § 9.fj). Hors du corps, l'appel à l'essai (que
  `verify-site.mjs` lit), le bloc auteur et « Pour aller plus loin » restent des `<aside>`.
- **Page d'article** (§ 9.fj, corrections § 9.fm) : gabarit `src/pages/blog/[slug].astro`,
  feuille `src/styles/blog-article.css` (tout sous `.fiche`, le `<main>` ; aucun `<style>`
  scopé ; la petite feuille du repli du rail, écrite au rendu, va dans `<head>`). Le corps se
  repère par `data-blog-zone="corps"`, sa fin par `[data-blog-fin]`.
  - **Balisage au rendu** : `src/lib/rehype-article.mjs` (branché dans `astro.config.mjs`)
    enveloppe, reclasse et étiquette le HTML de l'article ; il n'ajoute ni ne retire aucun
    mot ni aucune espace, le Markdown n'est pas touché. Options : `src/lib/article-options.mjs`
    (`sourcesPli`, `essentielEnTete`, `decorMuet`, `stats`). Émojis (définition, rôles,
    pictogrammes) : `article-emojis.mjs`, que le gabarit importe (pas le plugin) ; plan du
    sommaire : `article-sommaire.ts`. Les attributs de travail du plugin sont retirés à la fin
    (liste `TRAVAIL`) : un attribut que la feuille doit lire n'y entre pas. Une ligne seule qui
    commence par « • » ou « → » devient une liste d'un élément ; toutes les listes du corps
    portent `role="list"` (la feuille retire leurs puces : sinon WebKit ne les annonce plus).
  - ⚠️ **Empreinte** : Astro garde le HTML rendu des articles dans `node_modules/.astro` (Vercel
    aussi) tant que Markdown et configuration ne changent pas. `astro.config.mjs` passe au
    plugin l'empreinte de tous les `rehype-*`, `remark-*` et `article-*` en `.mjs` de
    `src/lib` (lus dans le dossier) et de la version de `remark-directive` et
    `@astrojs/markdown-remark` : un module de plugin nommé autrement n'y entre pas.
  - **Émojis** (le caractère reste dans le HTML) : masqués dans les titres, le sommaire,
    l'appel à l'essai, en tête ou en fin de ligne et en cours de phrase ; un dessin
    seulement là où ils portent un sens, dans une liste : coche `--ok`, triangle `--wait`,
    croix `--ink-2` sur `--line` (pas de rouge), chiffre des touches, flèche (« → », 👉 :
    `data-m="fleche"`), légende du calendrier fiscal (`data-picto`, et ces émojis restent
    annoncés) ; autre émoji de liste : puce `--brand`. Masquage de la classe `sr` (rognage),
    **jamais `font-size: 0`** ; décor en `aria-hidden`. Un élément rogné rogne son `::before` :
    le dessin est porté par l'élément de liste ou le titre (`data-touche`). « L'essentiel » :
    des puces, pas des coches (un point sur cinq est une mise en garde ; la coche dit « oui »).
  - **Titres et sommaire** : filet et repère « 04 / 10 » par compteurs CSS (absent quand
    l'auteur a numéroté son plan), texte de remplacement vide (`content: … / ""`, après la
    même déclaration sans lui) : un mot écrit par la feuille n'entre pas dans le nom du titre.
    Sous-parties `t-sous` ; un titre posé sur une légende (`t-hors`) sort du compte. Sommaire
    = le plan seul : rail collant à partir de 1 040 px, partie en cours par `:target-current`
    (seul dans sa règle : un navigateur qui ne le connaît pas jette toute la liste de
    sélecteurs ; lightningcss avertit à la construction, c'est attendu) et repli par lignes de
    temps de vue (`som-debut`, `som-fin` : jamais `animation-timeline: none`, WebKit applique
    alors l'état final). Un rail qui défile : « Retour en haut » collé à son bas, un fondu lié à
    son propre défilement (`scroll(self)`, aucun s'il ne défile pas). Téléphone : pli, fil de
    lecture et pastille de 44 px en bas à droite (au-dessus de la bulle à partir de 640 px) ;
    la bulle n'arrive qu'après la carte d'essai (ligne de temps `--essai`).
  - ⚠️ Poids : une variante d'élément de liste s'écrit avec le même chemin que la règle de
    base (`.corps :is(ul, ol) > li[data-etat="non"]`), sinon la règle de base gagne.
  - ⚠️ `lh` dans un `::before` qui change de corps (chiffre d'une étape) vaut la ligne du
    `::before`, pas celle de l'élément : passer par `--lig` (propriété enregistrée, `1lh`
    calculé sur le `li`). Une liste qui reprend (`start`) reçoit son `counter-reset` du plugin.
  - **Couverture** (§ 9.fj, § 9.fo) : une vignette, l'affiche entière, à son format (règle des
    affiches, plus bas), à la hauteur d'une case 4:5 de 76 px au téléphone (95 px de haut), 88 px
    de 560 à 699 px, 120 et 132 px de 700 à 1 359 px, 144 px au-delà (180 px de haut) ; une 2:3 y
    est moins large que la case. Ces tailles sont les plus grandes qui ne font pas descendre la
    première ligne du texte de plus de 16 px, mesurées sur les 48 articles à chaque palier (méthode
    en § 9.fo ; la vignette à côté du titre a été essayée : +32 à +118 px) : on ne les agrandit pas
    sans refaire la mesure. Depuis § 9.fq (pastille de série retirée), de 700 à 1 359 px, son bas est
    sur celui de la ligne de confiance (même marge basse), comme au-delà : centrée, elle descendait et
    sa loupe mordait sur la feuille sable ; un titre d'une ligne laisse de l'air au-dessus de lui (la
    rangée vide de la pastille grandit). `srcset` 160, 264, 288, 400 px ; `sizes` = largeur dessinée de CETTE
    affiche à chaque palier ; le `src` reste celui d'avant (900 px, ou la largeur de l'affiche quand
    elle est plus petite).
    La vignette est un `<button popovertarget="affiche-grande">` (`aria-label` « Agrandir
    l'affiche », `data-ph="blog_cover_zoom"`) : d'un appui, l'affiche en grand dans un
    popover natif (`<div popover="auto" class="grande" role="dialog" aria-modal="true">`, aucun
    script), à la plus grande taille qui tient dans l'écran (rapport `--r` écrit au rendu), sous
    une bande de 52 px où se tient « Fermer » (`autofocus`) ; fenêtre basse (`max-height: 500px`,
    téléphone couché), « Fermer » à droite de l'image. L'image est dans un second bouton de
    fermeture (« Fermer l'affiche », curseur `zoom-out`) : la boîte du popover est ce bouton.
    Échap, un appui sur l'image, un appui à côté et « Fermer » ferment ; le focus revient à la
    vignette (pas après un appui à côté : c'est la règle du popover). Tant qu'elle est ouverte,
    `<body>` est en `visibility: hidden` (le popover en `visible`) et `<html>` en `overflow:
    hidden`, à toutes les largeurs : le clavier reste dans l'affiche (Tab : « Fermer », l'image,
    le navigateur), un lecteur d'écran n'y lit qu'elle, la page ne défile ni au doigt ni à la
    molette ; la barre de défilement qui disparaît change la mise en page d'une page qu'on ne voit
    pas (aucun saut mesuré à la fermeture). Le fond (`::backdrop`) est donc opaque : la page masquée,
    un fond translucide laissait voir celui du canevas (le ciel sur 520 px, puis l'eau profonde), avec
    une marche derrière l'image. Sa grande image est en `loading="lazy"` dans le popover
    fermé : elle n'est demandée qu'à l'ouverture (`srcset` 600, 900, 1 200 px et la source ;
    `sizes` en `min()` des deux bornes de la fenêtre, fenêtre basse en tête) ; d'ici là, un aplat
    clair. La loupe (pastille dessinée par `::after`) et le curseur ne s'affichent que sous
    `@supports selector(:popover-open)` ; sans popover (Safari avant 17, Firefox avant 125), le
    popover reste caché (`.grande { display: none }`), et la vignette reste un bouton nommé qui ne
    fait rien (au clavier et au lecteur d'écran ; aucune règle sans script ne le retire).
  - **Image de partage** (§ 9.fl) : `/blog/partage/<slug>-<empreinte>.jpg`, 1 200 × 630,
    fabriquée à la construction (`src/pages/blog/partage/[slug].jpg.ts`,
    `src/lib/image-partage.mjs`) : `og:image`, `twitter:image` et première image du JSON-LD
    `Article`. Rien à faire pour un nouvel article. L'empreinte suit le titre, la pastille, la
    pose et le code de l'image : un titre retouché donne une nouvelle adresse (les aperçus de
    lien gardent l'image d'une adresse des jours durant). Police TTF de construction dans
    `src/assets/fonts/partage/`, lue par chemin, jamais importée (elle serait copiée dans le
    build) ; une garde arrête la construction si Pango en prend une autre. Aucun jaune ;
    mascotte entière ; un titre trop long est réduit (50 px), puis coupé d'un « … ». Depuis
    § 9.fp, la pastille dit le thème et le fond est celui du thème (`partage` du registre :
    sable, ciel, nuit, eau, vert ; palettes dans `image-partage.mjs`). Les poses tournent dans
    le thème du plus ancien au plus récent : publier un article ne change ni la pose ni
    l'adresse de l'image des autres (il prend le dernier rang). Ne pas revenir au plus récent
    d'abord : chaque parution déplaçait toutes les images du thème.
  - Auteur : table `AUTEURS` de `src/lib/site.ts` (nom du frontmatter → fiche de
    `/qui-sommes-nous` et portrait) ; un auteur absent n'a ni lien ni `@id`.
- **Les affiches** (§ 9.fo ; le propriétaire : « pas trop grande mais pas trop petite ») : une
  affiche ne se rogne jamais, ni ne se déforme. Les 47 affiches (48 articles) ont quatre formats
  (2:3, 0,75, 0,79, 0,805) : aucun cadre commun ne les garde toutes en rognant. Dans les listes
  (`/blog`, thèmes, une, articles connexes) et la vignette d'article : une case 4:5, l'affiche
  entière, à son format, à la hauteur de la case (`height` écrite, `width: auto`, `max-width: none` :
  le socle de Tailwind borne les images à leur boîte), centrée ; le vide d'une affiche plus étroite
  (une 2:3 : 17 % de la largeur) est le blanc de la feuille. Des bandes aux couleurs des bords, essayées
  d'abord (`affiche-bords.mjs`, retiré), se voyaient comme des bords flous : ne pas y revenir. Une
  0,805 dépasse sa case d'environ un pixel. `sizes` dit la largeur dessinée de chaque affiche
  (`largeurDansCadre()`, `src/lib/blog-covers.ts`). Les dimensions déclarées sont celles du fichier
  `src` (le format juste dès le premier rendu : la largeur en découle). Un nouvel emplacement
  d'affiche reçoit la même règle.
  Une taille se mesure, jamais à l'œil : la plus grande qui tient les bornes (3 articles entiers
  visibles à tout moment sous l'en-tête à 360 × 640 et 393 × 692, titre en 4 lignes au plus, date et
  durée sur une ligne, `/blog` sous 7 880 px à 393) ; essais et chiffres en § 9.fo. Les images
  des listes ne se chargent pas en priorité. Élément LCP : un texte au téléphone (le titre de
  `/blog`, l'introduction d'une page de thème) ; à partir de 768 px, sur `/blog`, souvent l'affiche de la une
  (une 0,805 : 242 × 300 px), servie par son préchargement (`fetchpriority="high"`) ; PageSpeed
  signale son `loading="lazy"`, gardé pour le téléphone, sans effet sur la note.
  Deux articles ont la même affiche (`facturation-electronique-medecin-remplacant`,
  `generer-facture-remplacement`) : décision de contenu laissée au propriétaire.
- **`/blog` et les thèmes** (§ 9.fk, § 9.fo, § 9.fp, § 9.fq) : des lignes sur une feuille blanche (`BlogCard.astro`,
  `src/styles/blog-liste.css`), l'affiche à gauche, entière, dans une case de 26,5 % de la largeur
  de l'écran au téléphone (`clamp(88px, 26.5vw, 112px)` : 95 px à 360, 104 px à 393), 144 px à
  partir de 640 px ; une colonne de lignes jusqu'à 1 023 px, deux au-delà. La une : au téléphone,
  l'affiche à droite de la pastille et du titre (titre à 20 px), à la taille des lignes, dans le
  premier écran (393 × 692, 402 × 680) ; dessous, l'extrait (3 lignes) puis date et durée. À
  partir de 768 px, case de 240 px à gauche. `srcset` : 160, 200, 240, 320, 400 px et le fichier de
  640 px (une : 160 à 720 px) ; `sizes` et le préchargement de la une disent la largeur dessinée de
  chaque affiche ; `src` et dimensions déclarées sont ceux d'avant. Extrait masqué au téléphone
  (dans le HTML).
- **Articles connexes** (§ 9.fo, fin de la page d'article) : sous 700 px, une rangée de cartes qui
  défile, affiche de 140 px de haut à son format (112 px de large pour une 0,805, 93 pour une 2:3 :
  la colonne épouse l'affiche), texte centré sur sa hauteur, titre en 5 lignes au plus (aucun des 223
  titres coupé à 360 px) ; au-delà, la carte de `/blog` en feuille à deux colonnes, affiche de 120 px
  de haut centrée dans une case de 96 px ; avec 3 ou 5 articles, le dernier prend le rang entier.
  `srcset` 132, 240, 320 px ; dimensions déclarées : celles du fichier de 132 px (le format juste dès
  le premier rendu).
- **Thèmes** (§ 9.fp) : cinq, par sujet, dans l'ordre d'une carrière ; la navigation de
  `/blog`. Registre `src/lib/blog-themes.ts` (slug, nom, titre et description de page, ligne de
  contexte, introduction, fond de l'image de partage ; l'ordre du tableau est l'ordre
  d'affichage) ; champ `theme` obligatoire du frontmatter (`z.enum`). Pages
  `/blog/theme/<slug>` (`src/pages/blog/theme/[theme].astro`, `blog-liste.css`, `BlogCard.astro` ;
  adresses figées : deux pages de série y sont redirigées). Fil d'Ariane de l'article : Accueil ›
  Blog › Thème › Article (écran et `BreadcrumbList`) ; `articleSection` du schéma `Article` et
  `<category>` du flux RSS : le nom du thème (§ 9.fq). Lignes (`BlogCard`, prop `theme`) : le nom
  du thème sur `/blog`, aucune étiquette sur une page de thème (c'est celui de la page).
  Mesure : `blog_theme_viewed` (`theme_id`, `total_articles`), propriété `theme` sur les
  événements de l'article ; `data-blog-theme` sur `<main>` (page de thème) et sur `<article>`.
  `verify-site.mjs` (« 4 sexdecies ») échoue si un article n'a pas de thème valide, si son fil
  d'Ariane ne passe pas par la page de son thème en position 3, si une page de thème ne liste
  pas exactement ses articles (dans l'ordre de `/blog`), si son propre fil d'Ariane n'est pas
  Accueil › Blog › elle, si une autre puce que la sienne porte `aria-current`, si un article est
  listé par zéro ou deux pages de thème, si une ligne de `/blog` n'a pas pour étiquette le nom de
  son thème, et lui seul (§ 9.fq), si le sitemap n'a pas exactement `NB_THEMES` (5) pages de thème, si les puces de
  `/blog` ne les lient pas. Un sixième thème se décide : registre, `NB_THEMES`, textes à faire
  relire (MIGRATION.md). Textes du registre : aucun chiffre, et pas plus de trois mots de suite
  communs entre introduction et description (comptés sans la ponctuation).
  Les pages de thème suivent la règle des affiches de `/blog` (affiche entière, à son format, même
  case, mêmes `srcset` et `sizes`, aucune priorité). Sur `/blog` et les pages de thème, à partir de
  1 024 px (deux colonnes de lignes, § 9.fo), les deux lignes d'une rangée partagent quatre pistes
  (sous-grille : étiquette, titre, extrait, date ; § 9.fp) : sans elle, des étiquettes de hauteurs
  différentes décalaient les titres voisins. Le texte reste centré sur l'affiche (15 px d'écart au
  plus) par trois règles qui vont ensemble : un `::before` vide dans la piste de l'étiquette (une
  piste vide prenait toute la place libre), la date calée en haut de sa piste, l'affiche au milieu ;
  et chaque élément du texte a sa colonne écrite (un nouvel élément aussi : sans elle, le placement
  automatique ouvre une seconde colonne et les lignes grandissent). Au téléphone, le nom du thème
  prend deux lignes pour « Statut, contrats et revenus » et « Cotisations et protection » à 360 px
  (17 lignes sur 47 ; 11 à 393 px) : 3 articles entiers 98,7 % du temps à 360 × 640 pli ouvert,
  100 % pli fermé et à 393 × 692 (92 % avant § 9.fq, quand le numéro de fiche suivait le thème).
  Les six puces font trois rangées au téléphone : la une de `/blog` descend de 52 px et son affiche
  n'est plus entière dans le premier écran à 393 × 692 et 402 × 680 (§ 9.fp, « Rebase sur les
  affiches » : à décider ; son titre y tient depuis § 9.fq). Puces des thèmes : deux colonnes
  jusqu'à 699 px, trois au-delà (`.bl-series.bl-themes`, deux classes : elles passaient avant les
  règles des puces de séries, retirées en § 9.fq avec leurs pages).
- **Les séries ne s'affichent plus** (§ 9.fq, décision du propriétaire du 14 novembre 2026) : le
  thème est le seul classement à l'écran. Ni pastille de série ni « Épisode N » en tête d'article,
  ni pastille sur la une de `/blog`, ni numéro de fiche (« Fiche Fiscalité #4 ») sur les lignes ;
  les pages `/blog/serie/*` ne se construisent plus (`[series].astro` et `blog-series-slugs.ts`
  retirés) et sont redirigées dans `vercel.json` : `fiches-fiscalite` → `/blog/theme/impots-declarations`,
  `fiches-pratiques` → `/blog/theme/debuter-organiser`, `guides-conseils` → `/blog` (Vercel répond
  308, comme à toutes les règles `permanent`). Restent, invisibles : `seriesId`, `category`,
  `categoryNumber`, `episodeNumber` (frontmatter et schéma), `data-blog-series`,
  `data-blog-category` et `data-blog-episode` sur `<article>` (séries de PostHog), la classe
  `s-<seriesId>` des lignes, le nom de la série dans `/blog/recherche.json` (recherche), et le
  numéro dessiné sur les affiches. `blog_series_viewed` (`mesurerSerie` de `page-analytics.ts`) est du
  code mort, laissé : le retirer renomme le script de PostHog sur toutes les pages (plus bas).
  `verify-site.mjs` (« 4 septdecies ») échoue si un fichier du build (HTML, XML, texte, JSON) cite
  `/blog/serie…`, si le sitemap en contient une, si une des trois redirections manque, change de
  destination, n'est plus permanente ou est captée par une règle placée avant elle, si une page de
  série est encore construite, si la tête d'un article garde une marque de série (ou dit, hors du
  titre, sa catégorie ou « Épisode »), si `articleSection` n'est pas le nom du thème, si la une de
  `/blog` dit autre chose que « À la une », si une ligne d'une page de thème a une étiquette, si une
  `<category>` du flux RSS n'est pas le thème de l'article.
  ⚠️ Toute retouche de `src/lib/page-analytics.ts` renomme le script d'entrée de PostHog, donc
  change la balise `<script>` de toutes les pages (§ 9.fp) : prouver « pages inchangées » à ce
  nom près.
- Écarts au contenu d'un article : « Contenu modifié » dans MIGRATION.md (§ 9.fj pour les
  antislashs : une ligne vide avant et après une liste, sinon « \ » s'affiche).
- Frontmatter `faq`/`relatedArticles`/`slides`/`cta` rendus par `src/pages/blog/[slug].astro`
  (FAQ visible + FAQPage JSON-LD ; slides = îlot embla `BlogSlides.tsx`).
- Dates : `pubDate`/`updatedDate` alimentent le `lastmod` du sitemap via
  `src/generated/blog-meta.json` (régénéré par le script ; à tenir à jour si édition
  manuelle — `verify-site.mjs` échoue désormais si une date y diverge du frontmatter).
  Ne jamais y mettre une date de build : un `lastmod` faux fait ignorer le signal
  sur tout le site (voir MIGRATION.md § 9.ai).
- Covers : chemins `/blog/...` du frontmatter résolus vers `src/assets/blog/` et optimisés
  (webp) via `import.meta.glob` + `getImage` dans les templates blog. Le glob copie dans
  le build TOUTE image de ce dossier, citée ou non : une image que plus aucun frontmatter
  ne cite se supprime (§ 9.eo).

## Outils (îlots React, hydratés à la vue)

- ⚠️ **Un îlot ne répond qu'une fois hydraté** (§ 9.er, § 9.et). Entre l'affichage et
  l'hydratation, l'outil a l'air prêt et ne répond pas (0,1 à 0,2 s en local, 0,7 s en
  4G rapide, 2,4 s en 4G lente). Ce moment se montre ; il ne se raccourcit pas sans coût :
  - **Pas de `<link rel="modulepreload">` des fichiers des îlots**, dans le `<head>` comme
    dans le `<body>` : essayé, mesuré, retiré (§ 9.et). Les fichiers partent en même temps
    que les feuilles de style et la police, et l'hydratation passe avant le premier
    affichage : en HTTP/2 la première peinture et le LCP reculaient de 0,2 s, en 4G rapide
    comme en 4G lente ; en HTTP/1.1 la police arrivait après l'affichage.
    `fetchpriority="low"` n'y change rien en HTTP/2 et perd le gain en HTTP/1.1. Avant d'y
    revenir : mesurer sur un aperçu Vercel, en réseau réellement bridé (première peinture,
    LCP, arrivée de la police, décalage de mise en page), pas par le Lighthouse simulé,
    qui ne voit rien.
  - **`src/lib/analytics.ts` importe `posthog-js`, comme avant** : l'en sortir (file
    d'attente, instance donnée par `PostHog.astro`) ne gagne rien sans les préchargements
    (mesuré, § 9.et), et changeait la mesure à la marge. Une seule instance, celle que
    `PostHog.astro` initialise ; îlots et scripts de page émettent par `trackEvent()`.
  - **Un module ne se charge par `import()` que s'il ne sert pas au premier geste** : le
    bloc des résultats du simulateur (`RegimeComparisonCards`) l'est. Le moteur de la
    recherche du guide et ses données (100 Ko gzip) restent un import statique de
    `BoussoleSearchIsland.tsx` : chargés après l'hydratation, le champ prenait la saisie
    0,2 s plus tôt mais la première liste sortait 0,75 s plus tard en 4G lente (un
    aller-retour de plus, § 9.et).
  - **Tant que `<astro-island>` porte `ssr`, la feuille de l'outil le dit** (fin de
    `simulateur.css`, `calculette.css`, `guide.css`) : contrôles sans clic ni toucher
    (`pointer-events: none`), curseur d'attente, et après 0,8 s un trait qui glisse (bord
    haut de la première fiche, ou sous le champ de recherche), figé après 30 s, fixe sous
    `prefers-reduced-motion`, à la couleur du texte en contrastes forcés. Les sélecteurs
    visent des balises (`button`, `input`, `select`, `textarea`, `summary`, `label`,
    `[role="button"]`, `[tabindex]`) sous la racine de l'îlot (`.sim-ile`, `.calc-ile`,
    `.gd-rech-champ`, `.gd-boussole`) : un nouvel îlot d'outil reçoit le même bloc, avec
    ses propres noms d'images clés. La boussole est neutralisée sans trait (elle s'hydrate
    plus tard que la page : un trait s'y montrerait d'emblée).
    ⚠️ **Jamais `interactivity: inert` (ni `inert`, ni `visibility`) dans ce bloc** : un
    îlot `client:visible` qui n'est pas encore entré dans la fenêtre garde `ssr` sans
    limite de temps ; ses contrôles sortaient du parcours clavier, de l'arbre
    d'accessibilité et de la recherche dans la page (§ 9.et). Le clavier reste donc celui
    d'avant pendant l'attente : Tab atteint les contrôles, une saisie y est effacée à
    l'hydratation, « Entrée » envoie le formulaire en natif.
  Directives : les quatre îlots (simulateur, calculette, recherche et boussole du guide)
  en `client:visible` (`client:load` et `client:idle` ne gagnent rien de mesurable ; une
  marge `rootMargin` sur la boussole, essayée puis retirée, la rendait prête plus tôt
  dans une fenêtre haute mais retardait le champ de recherche sur certains réseaux,
  § 9.et). Pour mesurer un changement de
  chargement : trois réseaux, cinq chargements à froid, **et le chargement sans geste**
  (première peinture, LCP, arrivée de la police, décalage, page vue), en HTTP/1.1 et en
  HTTP/2, côtés alternés ; le Lighthouse simulé seul ne suffit pas (§ 9.et).
- **Poser une aide** (bulle « i » ou « ? », § 9.es) : `Tooltip`, `TooltipTrigger` et
  `TooltipContent` de `src/components/ui/tooltip.tsx`, ou `PremiumTooltip` dans le
  simulateur (tiroir sous 768 px, bulle au-dessus). Jamais `@radix-ui/react-tooltip` nu :
  au doigt il ne s'ouvre pas. Le composant garde le survol et le focus de Radix ; au
  doigt (pointeur tactile ou stylet, ou tout clic sous `(hover: none)` ou
  `(pointer: coarse)`, lu après le montage), un appui ouvre la bulle et la retient, un
  second appui, un appui ailleurs ou Échap la ferment, un défilement non. Il pose
  lui-même `aria-expanded` (appareil tactile) et remplit la zone `#aide-annonce`
  (`role="status"`) : ne pas les écrire à la main, ni piloter `open`.
  - Le déclencheur est un `<button type="button">` nommé (`aria-label` s'il ne porte
    qu'une icône), à côté du `<label>`, jamais dedans. Un `asChild` sur autre chose qu'un
    bouton reçoit `role="button"` et `tabindex="0"` après le montage : cela marche, un
    vrai bouton reste préférable.
  - La bulle porte la classe de son outil (`sim sim-bulle`, `calc calc-bulle`,
    `gd-bulle`) : sa feuille borne sa hauteur à
    `--radix-tooltip-content-available-height` (elle défile si la place manque, au lieu de
    sortir de la fenêtre) ; une nouvelle classe de bulle reprend cette règle. Une bulle
    ouverte sur le côté (`side="right"`) borne aussi sa largeur (`…-available-width`).
  - Le HTML du build n'y gagne aucun attribut : tout arrive après le montage.
  - Essai : Chromium avec `hasTouch` et `page.touchscreen.tap()` (un clic de souris ne
    reproduit pas le défaut), à 390, 820 et 1 024 px ; puis survol, focus, Échap à la
    souris, et dans WebKit.
- `/simulateur` → `src/components/simulateur/SimulateurApp.tsx`. Accessibilité (§ 9.en) :
  l'aide « i » d'un champ est un bouton nommé (`PremiumTooltip.tsx`), posé À CÔTÉ du
  `<label>`, jamais dedans ; `FormControl` enveloppe le champ lui-même, pas le `<div>` de
  son suffixe (le champ y perdait son nom, son état d'erreur et sa description).
  Habillage DA (§ 9.ek) :
  classes `sim-*` de `src/styles/simulateur.css` (page seule), posées aussi sur les bulles
  et listes que Radix rend hors de l'îlot ; `src/components/ui/` est partagé avec la
  calculette et le guide, ne pas le modifier pour le simulateur. Calcul (audit de novembre
  2026, § 9.fr) : impôt et Super-Net par le moteur local (`calculateRspmBreakdown`,
  `src/lib/baremes-ir.ts`) dans les deux régimes sociaux. Cotisations : RSPM local (mode Auto :
  remplaçant jusqu'à 19 000 €) ; PAMC par l'API publique du modèle Urssaf
  (`src/lib/simulateur/urssaf.ts`, appelée depuis le navigateur), repli seulement sur l'Edge
  Function Supabase `calculate-urssaf` (qui ignore secteur, année et statut de remplaçant).
  Le Super-Net retire les charges payées dans les deux régimes, Micro-BNC compris. Les règles
  se vérifient sur Légifrance, le BOFiP et la CARMF ; le revenu imposable d'un remplaçant doit
  rester égal au « net imposable » du modèle Urssaf (contrôle croisé, § 9.fr).
  Résultats (§ 9.ft) : la conclusion en tête, puis les fiches. L'impôt du médecin (sa part en
  couple, celle de son activité libérale, ses acomptes) vient de `src/lib/simulateur/impotMedecin.ts`,
  ce que chaque régime déduit de `src/lib/simulateur/deductions.ts` : conclusion, fiches et plis les
  lisent, ne recalculer aucun de ces montants dans un composant. « Recommandé » et la conclusion
  partagent `SEUIL_EQUIVALENCE_ANNUEL` (600 €/an). Marge sur 1 000 € (`calculerMarge`) et point de
  bascule se calculent après l'affichage, l'un après l'autre ; en attente, leur phrase a sa forme
  finale (« … € ») pour que rien ne saute.
- `/guide-declarations/calculette` → `src/components/calculette/CalculetteApp.tsx`,
  100 % local (moteur `src/lib/calc/dsPamc.ts`), persistance localStorage. Habillage DA
  (§ 9.el) : `.calc` de `src/styles/calculette.css` (page seule), posée sur la racine de
  l'îlot et sur ce que Radix rend dans `<body>`. Les `.tsx` gardent leurs utilitaires ;
  leurs couleurs sont recouvertes une par une dans cette feuille : une nouvelle classe de
  couleur dans un `.tsx` s'y ajoute, sinon elle sort dans l'ancienne palette.
  Impression (§ 9.es) : le dernier bloc de la feuille, `@media print`, le seul hors de
  `@media screen`. Il retire tout ce qui n'est ni le titre, ni les résultats, ni
  l'avertissement de fin, et met les résultats sur deux colonnes : les quatorze exemples
  tiennent sur une page A4 dans l'état par défaut, plis de détail ouverts compris (deux
  pages pour les plus longs avec « Tout afficher », ou en format Letter). Un nouveau bloc
  de la page (section, bandeau, élément fixe) s'ajoute à sa liste, sinon il s'imprime
  (une bulle d'aide ou une liste restée ouverte y est : `[data-radix-popper-content-wrapper]`) ;
  les règles de la page sont scopées, d'où ses `!important`. Vérifier par `page.pdf()` (nombre de pages) et
  `page.emulateMedia({ media: 'print' })`.
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

1. `npm run build` (72 pages au 14 novembre 2026, dont 70 dans le sitemap : une de plus par
   nouvel article) puis `node scripts/verify-site.mjs`.
2. Si les îlots ont changé : test navigateur (le pattern Playwright est dans l'historique
   de session ; Chromium : `/opt/pw-browsers/chromium`).
3. Lighthouse local si perf touchée : `npx serve dist -l 4321` +
   `npx lighthouse http://localhost:4321/ --chrome-flags="--headless --no-sandbox"`.
   `npx serve` sert en HTTP/1.1 : sur les pages à deux feuilles bloquantes (outils, guide,
   comparatif, pages légales), FCP et LCP y sortent 0,15 à 0,3 s plus hauts que sur Vercel
   (HTTP/2, où l'écart disparaît). Ne pas le lire comme une régression (§ 9.en).
4. Moteur de Safari (WebKitGTK 2.52 installé ; si Selenium manque, piloter
   `/usr/bin/WebKitWebDriver` par son protocole HTTP, mêmes capacités), dès qu'une feuille change :
   servir `dist` en local, puis
   `WEBKIT_DISABLE_COMPOSITING_MODE=1 xvfb-run -a -s "-screen 0 1600x1400x24" python3 -I script.py`.
   Dans le script : `Options().binary_location = '/usr/lib/x86_64-linux-gnu/webkit2gtk-4.1/MiniBrowser'`,
   `add_argument('--automation')`, `webdriver.WebKitGTK(options=…, service=Service('/usr/bin/WebKitWebDriver'))`.
   Sans `WEBKIT_DISABLE_COMPOSITING_MODE`, le flou d'arrière-plan est peint (pour regarder la
   pastille) ; `add_argument('--features=-CSSUnprefixedBackdropFilter')` émule un Safari d'avant
   18. La fenêtre ne descend pas sous 447 px : en dessous, charger la page dans un `<iframe>`
   de même origine à la largeur voulue. Ce n'est ni Safari ni un iPhone (polices, barres
   d'iOS, tactile) ; mesurer `innerWidth` réel. Comparer chaque page à Chromium (§ 9.ep).

## Recherche d'audience

Le corpus `hippodoc-corpus/` contient la demande réelle des médecins libéraux
(94 questions, 958 réponses). **Il n'est pas dans ce dépôt** : le propriétaire le
fournit à part. Quand il est fourni, lire `hippodoc-corpus/carte-de-la-demande.md`
avant toute décision éditoriale, et respecter `hippodoc-corpus/CLAUDE.md` — le corpus
est une boussole, jamais une source de texte.
