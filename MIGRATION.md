# MIGRATION — hippodoc.fr : SPA Lovable → Astro SSR/statique

Migration du site public d'Hippodoc depuis la SPA React/Vite (`roshangbd/hippodocfinary`,
miroir lu : `tpayet/hippodocfinary`) vers ce dépôt Astro, déployé sur Vercel.
L'application privée reste sur la SPA et sera servie sur `app.hippodoc.fr`.

## 1. Inventaire des routes publiques (source : `src/App.tsx` + `public/sitemap.xml`)

Toutes conservées à l'IDENTIQUE (aucun changement d'URL).

| Route | Composant source | Statut migration |
|---|---|---|
| `/` | `src/pages/landing/` (LandingPage + `src/components/landing/*`) | ✅ migré |
| `/blog` | `src/pages/blog/` (index) | ✅ migré |
| `/blog/<slug>` ×38 | `src/pages/blog/*.tsx` (une page par article) | ✅ migré |
| `/faq` | `src/pages/faq.tsx` | ✅ migré |
| `/simulateur` | `src/pages/simulateur-public.tsx` | ✅ migré (île React) |
| `/guide-declarations` | `src/pages/guide-declarations/` | ✅ migré (île React) |
| `/guide-declarations/calculette` | `src/pages/guide-declarations/` | ✅ migré (île React) |
| `/comparatif` | `src/pages/comparatif.tsx` | ✅ migré |
| `/qui-sommes-nous` | `src/pages/qui-sommes-nous.tsx` | ✅ migré |
| `/conditions-utilisations` | `src/pages/conditions-utilisations.tsx` | ✅ migré |
| `/politique-confidentialite` | `src/pages/politique-confidentialite.tsx` | ✅ migré |
| `/rgpd` | `src/pages/rgpd.tsx` | ✅ migré |
| `/mentions-legales` | `src/pages/mentions-legales.tsx` | ✅ migré |
| `/tarifs` | — (NOUVELLE page, n'existe pas dans la source) | ✅ créé |
| `/essai` | `src/pages/instagram/` (landing link-in-bio Instagram) | ✅ migré, `noindex` |
| `/transmissions` | `public/transmissions.html` (page newsletter autonome, noindex) | ✅ portée verbatim (`public/transmissions/index.html`) |

Remarques :
- La source compte **38 articles de blog** (la commande initiale en estimait 35) — les 38 sont migrés.
- `/landing`, `/instagram`, `/i`, `/hippo-wall-street` ne sont que des redirections dans la source → reproduites en 301 (voir §5).
- `/remplacements` : indexé historiquement comme page campagne, mais c'est aujourd'hui une route PRIVÉE de l'app → 301 vers `/` (plus proche équivalent public), et `/remplacements/*` → app.

## 2. Contenu du blog

- Aucune donnée en base : `blog_posts` (Supabase) ne contient qu'1 ligne de test. Tout le contenu
  est codé en dur, un composant TSX par article (`src/pages/blog/*.tsx`).
- Cible : content collection Astro (`src/content/blog/*.md`), frontmatter
  `title, description, slug, pubDate, updatedDate, author, tags` — dates d'origine conservées.
- Les 38 articles, avec leurs dates d'origine :

| URL (inchangée) | Fichier | Publication |
|---|---|---|
| `/blog/obtenir-sa-licence-de-remplacement` | `src/content/blog/obtenir-sa-licence-de-remplacement.md` | 2025-10-06 |
| `/blog/trouver-facilement-tes-remplacements-medicaux` | `src/content/blog/trouver-facilement-tes-remplacements-medicaux.md` | 2025-10-06 |
| `/blog/checklist-administrative-medecin-remplacant` | `src/content/blog/checklist-administrative-medecin-remplacant.md` | 2025-10-06 |
| `/blog/checklist-premier-jour-remplacement` | `src/content/blog/checklist-premier-jour-remplacement.md` | 2025-10-06 |
| `/blog/signer-contrat-remplacement` | `src/content/blog/signer-contrat-remplacement.md` | 2025-10-06 |
| `/blog/maitrise-ton-logiciel-metier-en-30-min` | `src/content/blog/maitrise-ton-logiciel-metier-en-30-min.md` | 2025-10-06 |
| `/blog/outils-numeriques-indispensables-cabinet` | `src/content/blog/outils-numeriques-indispensables-cabinet.md` | 2025-10-06 |
| `/blog/checklist-ultime-medecin-remplacant` | `src/content/blog/checklist-ultime-medecin-remplacant.md` | 2025-10-06 |
| `/blog/choix-mode-exercice` | `src/content/blog/choix-mode-exercice.md` | 2025-10-21 |
| `/blog/regime-fiscal-micro-bnc-vs-reel` | `src/content/blog/regime-fiscal-micro-bnc-vs-reel.md` | 2025-10-21 |
| `/blog/cotisations-sociales-vs-impots` | `src/content/blog/cotisations-sociales-vs-impots.md` | 2025-10-21 |
| `/blog/tout-comprendre-urssaf` | `src/content/blog/tout-comprendre-urssaf.md` | 2025-10-21 |
| `/blog/tout-comprendre-carmf` | `src/content/blog/tout-comprendre-carmf.md` | 2025-10-21 |
| `/blog/frais-professionnels-deductibles` | `src/content/blog/frais-professionnels-deductibles.md` | 2025-10-21 |
| `/blog/remplir-declaration-2035` | `src/content/blog/remplir-declaration-2035.md` | 2025-10-21 |
| `/blog/calendrier-fiscal-remplacant` | `src/content/blog/calendrier-fiscal-remplacant.md` | 2025-10-21 |
| `/blog/generer-facture-remplacement` | `src/content/blog/generer-facture-remplacement.md` | 2025-11-28 |
| `/blog/salariat-vs-liberal` | `src/content/blog/salariat-vs-liberal.md` | 2025-11-28 |
| `/blog/remplacement-salarie-guide-complet` | `src/content/blog/remplacement-salarie-guide-complet.md` | 2025-11-28 |
| `/blog/realites-remplacement-medical` | `src/content/blog/realites-remplacement-medical.md` | 2025-11-28 |
| `/blog/syndrome-imposteur-5-astuces` | `src/content/blog/syndrome-imposteur-5-astuces.md` | 2025-11-28 |
| `/blog/micro-bnc-exemples-concrets` | `src/content/blog/micro-bnc-exemples-concrets.md` | 2025-11-28 |
| `/blog/rspm-exemples-concrets` | `src/content/blog/rspm-exemples-concrets.md` | 2025-11-28 |
| `/blog/salaires-medecins-remplacants` | `src/content/blog/salaires-medecins-remplacants.md` | 2025-11-28 |
| `/blog/salariat-10-pourcent-ou-frais-reels` | `src/content/blog/salariat-10-pourcent-ou-frais-reels.md` | 2025-12-25 |
| `/blog/pieges-debut-carriere-remplacant` | `src/content/blog/pieges-debut-carriere-remplacant.md` | 2025-12-25 |
| `/blog/base-financiere-rempla` | `src/content/blog/base-financiere-rempla.md` | 2025-12-25 |
| `/blog/pdsa-exoneration-gardes-regulees` | `src/content/blog/pdsa-exoneration-gardes-regulees.md` | 2026-01-28 |
| `/blog/super-net-budget` | `src/content/blog/super-net-budget.md` | 2026-01-31 |
| `/blog/conge-maternite-paternite` | `src/content/blog/conge-maternite-paternite.md` | 2026-02-11 |
| `/blog/simulateur-super-net-combien-reste` | `src/content/blog/simulateur-super-net-combien-reste.md` | 2026-03-18 |
| `/blog/inbox-zero-remplacant` | `src/content/blog/inbox-zero-remplacant.md` | 2026-03-18 |
| `/blog/enveloppes-investissement-pea-assurance-vie-per-cto` | `src/content/blog/enveloppes-investissement-pea-assurance-vie-per-cto.md` | 2026-03-18 |
| `/blog/medecin-outre-mer-avantages-fiscaux` | `src/content/blog/medecin-outre-mer-avantages-fiscaux.md` | 2026-04-18 (maj 2026-04-21) |
| `/blog/interets-composes-meilleur-remplacement` | `src/content/blog/interets-composes-meilleur-remplacement.md` | 2026-04-21 |
| `/blog/guide-impots-internes-remplacants` | `src/content/blog/guide-impots-internes-remplacants.md` | 2026-05-01 |
| `/blog/frais-pros-medecins-salaries-internes-2026` | `src/content/blog/frais-pros-medecins-salaries-internes-2026.md` | 2026-05-09 |
| `/blog/frais-pros-medecin-liberal-2026` | `src/content/blog/frais-pros-medecin-liberal-2026.md` | 2026-05-24 |

## 3. Routes privées (NON migrées — servent uniquement à la table de redirections)

`/dashboard`, `/auth`, `/auth/reset-password`, `/auth/update-password`, `/subscription-required`,
`/payment-success`, `/activite/*`, `/revenus/*`, `/depenses/*`, `/analyses/*`, `/compte/*`,
`/calendrier`, `/calendrier/*`, `/remplacements/*`, `/statistiques`, `/statistiques/*`,
`/mon-espace`, `/mon-espace/*`, `/documents`, `/documents/*`, `/paiements/*`,
`/montants-en-attente`, `/previsionnel`, `/forum`, `/forum/*`, `/ressources/*`,
`/dashboard-blog`, `/dashboard-blog/*`, `/admin`, `/admin/*`.

## 4. Design tokens & marque

- Palette `hippo` (bleu primaire `#1A8CFF`, hover WCAG `#006BD6`), tokens shadcn HSL,
  vars « landing glass », couleurs séries blog — `tailwind.config.ts` + `src/styles/global.css`
  portés verbatim de la source.
- Polices : la SPA n'importe AUCUNE police (les packages @fontsource sont installés mais jamais
  importés) → pile système, conservée telle quelle (0 requête police).
- Logo : `/lovable-uploads/1a136973-2c47-426b-a1ce-70d29cdabb35.png` ; og-image :
  `/lovable-uploads/og-image.png` ; héros AVIF/WebP copiés dans `public/lovable-uploads/`.
- Covers du blog copiées dans `src/assets/blog/` (optimisées via astro:assets).
- Photos fondateurs : `src/assets/founders/{ryan-goburdhun,thomas-payet}.jpeg`.

## 5. Redirections (vercel.json, toutes 301 sauf normalisation de slash en 308 Vercel)

| Source | Destination |
|---|---|
| `www.hippodoc.fr/*` | `https://hippodoc.fr/*` (aussi à configurer au niveau domaine Vercel) |
| `/landing` | `/` |
| `/hippo-wall-street` | `/transmissions` |
| `/instagram`, `/i` | `/essai` |
| `/remplacements` (exact) | `/` |
| `/dashboard`, `/auth(/*)`, `/reset-password`, `/subscription-required`, `/payment-success`, `/montants-en-attente`, `/previsionnel` | `https://app.hippodoc.fr/<même chemin>` |
| `/activite/*`, `/revenus/*`, `/depenses/*`, `/analyses/*`, `/compte/*`, `/calendrier(/*)`, `/remplacements/*`, `/statistiques(/*)`, `/mon-espace(/*)`, `/documents(/*)`, `/paiements/*`, `/forum(/*)`, `/ressources/*`, `/dashboard-blog(/*)`, `/admin(/*)` | `https://app.hippodoc.fr/<même chemin>` |
| `/simulateur/` et tout slash final | `/simulateur` (`"trailingSlash": false`) |

## 6. Analytics & scripts tiers

- **PostHog** : même token projet `phc_x3JYWa7EjhuuwVVBLyks74ud58ZmUppaC666QkmTUXox`,
  même proxy first-party `https://t.hippodoc.fr`, `ui_host` eu.posthog.com. Chargé en module
  différé (non bloquant). Mode cookieless (`persistence: 'memory'`, pas de session recording)
  → pas de bannière cookie nécessaire sur le site public.
- **GA4, Meta Pixel, Crisp, Calendly — restaurés en différé** (`ThirdPartyScripts.astro`),
  sans impact Lighthouse (0 ms de blocking tiers mesuré : rien ne se charge dans la fenêtre
  d'audit) :
  - **GA4** `G-T8TFWPPW3M` : Consent Mode v2 par défaut DENIED (bootstrap inline ~2 Ko, avec
    le caviardage d'URL anti-jetons porté de la source), gtag.js injecté à la première
    interaction OU 6 s après `load` ; page_view manuel caviardé (ping cookieless si refus).
  - **Meta Pixel** `3299991043509379` : chargé UNIQUEMENT si consentement « accepted »
    (comme la source), après le différé.
  - **Crisp** `3e4f14e5-…` : à la première interaction uniquement (pointer/clavier/scroll) —
    jamais sur timer, donc jamais dans la trace Lighthouse.
  - **Calendly** : liens directs vers `calendly.com/hippodoc/decouverte-d-hippodoc`
    (CTA démo accueil + simulateur), zéro script — le widget flottant n'est pas reproduit.
  - **Bannière cookies** portée de `CookieConsent.tsx` (wording verbatim, clé
    `localStorage['cookie-consent']` identique, choix accepted/essential-only, bouton
    « Préférences cookies » au footer). À l'acceptation : consent update GA4 + Pixel +
    upgrade PostHog en `localStorage+cookie` cross-sous-domaine (event
    `hippodoc:consent-changed`, events `cookie_consent_granted/denied` comme la source).
    NB : localStorage n'étant pas partagé entre hippodoc.fr et app.hippodoc.fr, chaque
    surface gère son propre consentement (déjà le cas fonctionnellement dans la source).
- Vérification Search Console conservée : meta `google-site-verification` dans le layout.

## 7. Outils interactifs (îlots React)

| Outil | Verdict | Détails |
|---|---|---|
| `/simulateur` | Hybride | Branche RSPM (< 38 k€ de recettes) : calcul 100 % client (~2 700 LOC pures portées). Branche PAMC (≥ 38 k€) : appel à l'Edge Function Supabase publique `calculate-urssaf` (clé anon, CORS `*`) conservé tel quel pour ne pas dégrader la précision (l'API mon-entreprise/URSSAF reste la référence). |
| `/guide-declarations` (boussole 12 profils) | 100 % client | Piloté par `src/data/boussoleData.ts` (~2 800 LOC de données statiques). |
| `/guide-declarations/calculette` (PAMC/DSFU) | 100 % client | Moteur `src/lib/calc/dsPamc.ts` « 100 % pur », localStorage uniquement. |

Chaque page outil sert aussi une section explicative complète rendue côté serveur
(définitions rétrocession/URSSAF/Super-Net, exemple chiffré) pour les crawlers sans JS.

## 8. SEO

- robots.txt réécrit : tous crawlers autorisés, y compris IA (GPTBot, ChatGPT-User,
  OAI-SearchBot, ClaudeBot, Claude-User, anthropic-ai, PerplexityBot, Perplexity-User, CCBot,
  Google-Extended, Applebot-Extended, meta-externalagent). Aucun Disallow d'app (app sur
  sous-domaine). `Sitemap: https://hippodoc.fr/sitemap-index.xml`.
- Canoniques sans slash final, hreflang fr + x-default par page.
- JSON-LD : Organization (site-wide), SoftwareApplication (accueil + /tarifs, 2 offres 29/19 €),
  FAQPage (/faq + bloc FAQ tarifs), Article + BreadcrumbList (blog), BreadcrumbList (guides).
- llms.txt porté et étendu (définition produit, tarifs, URLs clés, contact).

## 9. Modifications de contenu (toutes flaggées, conformément à la consigne)

- **Blocs « L'essentiel »** (ajout autorisé par la spec, rédigés à partir du seul contenu de
  chaque article) ajoutés en tête des 8 articles > 1000 mots :
  `simulateur-super-net-combien-reste`, `inbox-zero-remplacant`,
  `enveloppes-investissement-pea-assurance-vie-per-cto`, `medecin-outre-mer-avantages-fiscaux`,
  `interets-composes-meilleur-remplacement`, `guide-impots-internes-remplacants`,
  `frais-pros-medecins-salaries-internes-2026`, `frais-pros-medecin-liberal-2026`.
- **Bloc « Pour aller plus loin »** (liens internes simulateur / guide / tarifs) rendu par le
  template sur CHAQUE article — la source n'avait aucun lien vers ces pages depuis le blog.
- **/essai** : le formulaire d'inscription client-side de la source (Supabase signup) ne peut
  pas fonctionner en statique → remplacé par un CTA visuellement équivalent vers
  `app.hippodoc.fr/auth?tab=signup` ; le bouton « Voir toutes les fonctionnalités » (accordéon
  JS) pointe désormais vers `/tarifs`.
- **Index du blog** : H1 « Le blog des médecins remplaçants » (source : « Le Blog Hippodoc »)
  — enrichi mot-clé, autorisé par « visually identical or better ».
- **FAQ articles** : les données FAQ orphelines de la source (émises en JSON-LD mais jamais
  affichées, ex. `choix-mode-exercice`) sont désormais AFFICHÉES sur la page — corrige le
  risque « rich results » de décalage schéma/contenu visible.
- **readTime** normalisé (« 6 » → « 6 min ») sur `remplacement-salarie-guide-complet`.
- **Lien corps d'article** `[Découvre Hippodoc ici !](/landing)` → `](/)`
  (dans `signer-contrat-remplacement` ; /landing n'existe plus, 301 vers /).
- **Auteurs (schéma Article)** : « Équipe Hippodoc »/« Hippodoc » → auteur `Organization`
  Hippodoc ; « Dr. Hippodoc » et « Dr. Sophie Martin » → `Person` avec url
  `/qui-sommes-nous`. Noms visibles inchangés.
- **Auteurs — attribution réelle** (août 2026, décision owner) : les 38 articles sont
  désormais signés « Dr. Ryan Goburdhun » (`authorRole` unifié « Médecin remplaçant &
  fondateur d'Hippodoc ») — remplace les placeholders « Équipe Hippodoc », « Hippodoc »,
  « Dr. Hippodoc » et « Dr. Sophie Martin ». Schéma Article : `Person` → `/qui-sommes-nous`
  partout (branche `Organization` supprimée de `[slug].astro`). Mention « écrites par
  l'équipe Hippodoc » de `/blog` mise à jour en conséquence.
- **/simulateur** (rédigé, exigence spec « section explicative SSR ») : bloc de définitions
  « Trois mots à connaître » (Rétrocession / URSSAF / Super-Net) et « Exemple chiffré »
  30 000 € de recettes — chiffres dérivés exclusivement des constantes du moteur porté
  (seuil RSPM 38 000 €, tranches 13,5 %/21,2 % à 19 000 €, abattement micro-BNC 34 %).
- **/qui-sommes-nous** : phrase PRODUCT_DEFINITION ajoutée sous l'intro (verbatim site.ts).
- **Accueil** : PRODUCT_DEFINITION sous le sous-titre du héros ; démo Calendly → lien
  mailto:contact@hippodoc.fr.
- **Accueil / film de présentation** (août 2026) : la vignette-lien temporaire (vidéo dans
  un nouvel onglet) est remplacée par un lecteur natif `<video controls preload="none">`
  inline, comme la source. Vidéo auto-hébergée sur Supabase Storage (bucket public
  `public-assets` du projet `zlqlijendlquvwnodeqq`), poster de la source rapatrié dans
  `public/`. Le tracking JS `useVideoAnalytics` de la source (play/progress/erreurs)
  n'est pas reproduit (invariant zéro JS).
- **Accueil / VideoObject** (août 2026) : `uploadDate` passé de la date seule `2026-08-04`
  au format ISO 8601 complet `2026-08-04T09:00:00+02:00` (heure de Paris) — corrige les
  deux avertissements Search Console « Il manque le fuseau horaire » / « Valeur de date et
  heure incorrecte » sur les données structurées Vidéos.
- **Passe de simplification landing** (août 2026, demande owner) :
  - **Hero allégé** : la phrase PRODUCT_DEFINITION est retirée du Hero et déplacée
    verbatim (site.ts, contrat GEO intact) dans la section « film de présentation » ;
    le bloc « Quel que soit ton mode d'exercice » + 7 chips profils est supprimé du
    Hero (contenu redondant avec la section #parcours, conservée telle quelle).
    CTA principal restylé : dégradé → aplat `hippo-600` arrondi plein (cohérent avec
    le CTA header), libellé et tracking `cta_signup_hero` inchangés.
  - **Section « En chiffres »** : 3 → 6 tuiles. Ajouts : « 900+ Médecins inscrits »
    (chiffre déjà annoncé Hero/CtaBanner/Parcours), « 38 Articles pédagogiques au
    blog » (nombre réel d'articles migrés), « 100 % Données hébergées en France »
    (fait repris de la liste « Inclus dans toutes les offres »). Aucun chiffre inventé.
  - **Header simplifié** : nav desktop réduite à 3 ancres (« Découvrir » → /#film-presentation,
    « Pour qui » → /#parcours, « Tarifs » → /#pricing) + dropdown « Ressources »
    (Simulateur, Guide déclarations, Blog, FAQ, Qui sommes-nous). Les liens restent
    dans le HTML statique (dropdown CSS). `/comparatif` sort du header mais reste lié
    au footer (« Comparatif outils ») — route et indexation intactes. Le lien direct
    header vers `/tarifs` devient une ancre ; `/tarifs` reste liée depuis le footer,
    le tableau « Détail des offres » et le blog. Menu mobile aligné sur la même
    structure. Événements PostHog `landing_resource_*` et `cta_signup_header*`
    conservés ; nouveaux : `landing_nav_decouvrir`, `landing_nav_pour_qui`
    (`landing_nav_pricing` conservé, désormais sur l'ancre).
  - **Exception zéro-JS (assumée)** : micro-script inline (~4 lignes, aucun asset)
    dans Header.astro pour décocher la checkbox du tiroir mobile au clic sur un lien —
    indispensable car une ancre de la même page ne déclenche aucune navigation et le
    CSS seul ne peut pas refermer le tiroir. Aucun impact Lighthouse.
  - **Partenaires / écosystème** : badge « Partenaires · Écosystème » → « Syndicats
    d'internes · Écosystème médical » ; h3 « Ils font confiance à Hippodoc » →
    « Syndicats d'internes & partenaires de l'écosystème médical » ; sous-titre
    mentionne explicitement les syndicats d'internes.
  - **« Détail des offres »** : le lien isolé « Voir le détail des tarifs » (→ /tarifs)
    sous les cartes est supprimé ; le `<details>` inline est renommé « 📊 Détail des
    offres » et contient désormais le lien « Voir la page tarifs complète » (→ /tarifs).
    La page SEO /tarifs n'est PAS supprimée (invariant URLs figées) et garde des liens
    internes (footer, blog, tableau).

### 9.c Refonte du blog — phases 1 à 4 (août 2026)

Audit préalable, mesuré sur les 38 articles : 0 H3, 0 tableau, 0 image dans le corps,
**1 seul lien markdown au total** (vers `/`), ligne de texte à 88 caractères, article
le plus long à 47 H2 / 31 127 px en mobile. **Aucun texte d'article n'a été modifié
dans ces quatre phases** — elles ne touchent que les gabarits.

  - **Largeur de lecture** (`blog/[slug].astro`) : le corps passe à `max-w-[68ch]`,
    soit **88 → 70 caractères par ligne** (37 en mobile).
  - **`white-space: pre-wrap` CONSERVÉ** dans `global.css`. Ce n'est pas un vestige
    de la SPA : **29 des 38 articles** contiennent des paragraphes à sauts de ligne
    volontaires, que sa suppression aplatirait. À ne pas « nettoyer ».
  - **Sommaire conditionnel** (`blog/[slug].astro`). ⚠️ Le seuil décrit ici
    (« à partir de 8 sections », 21 articles sur 38) s'est révélé **faux** et a été
    corrigé — voir **§9.g**.
    Colonne `sticky` au-delà de 1280 px, replié en dessous. Un seul `<nav>` dans le
    DOM, donc aucune duplication d'ancres. Zéro JS : les `id` des H2 sont générés au
    build. **Pas de surlignage de la section courante** — un scrollspy imposerait du JS.
    ⚠️ Le repli est piloté par une **checkbox**, pas par un `<details>` : Chrome
    applique `content-visibility: hidden` au contenu d'un `<details>` fermé, si bien
    qu'un `display: block` en media query ne le remet plus en flux (la colonne sticky
    restait vide, hauteur 0). Même motif que le tiroir mobile du Header.
  - **Focus clavier** (`blog/index.astro` — depuis remplacé — et
    `home/JourneySection.astro`) : les labels pilotés par des radios `sr-only`
    n'avaient aucun style de focus. Le focus atterrissait sur un élément invisible,
    sans retour visuel : **échec WCAG 2.4.7**. Règles `:focus-visible` ajoutées.
  - **Pages de série** (nouveau `blog/serie/[series].astro`) : le filtre 100 % CSS de
    `/blog` ne laissait aucune trace dans l'URL — impossible à partager, à mettre en
    favori, à retrouver au bouton Retour, et **aucune page indexable par catégorie**.
    Trois URLs **ajoutées** (aucune renommée) : `/blog/serie/fiches-pratiques`,
    `/blog/serie/fiches-fiscalite`, `/blog/serie/guides-conseils`. Deux segments →
    aucune collision avec `/blog/[slug]`. JSON-LD `CollectionPage` + `BreadcrumbList`.
    Les pastilles de `/blog` deviennent de vrais liens : les radios `sr-only`
    disparaissent, et avec elles le défaut de focus.
    Slugs d'URL dans `src/lib/blog-series-slugs.ts` — **pas** dans `blog-series.ts`,
    qui est généré et porte la mention « ne pas éditer à la main ».
  - **Factorisation** : `src/components/BlogCard.astro` et `src/lib/blog-covers.ts`
    extraits de `blog/index.astro` pour être partagés avec les pages de série.
  - **Ajouts de contenu** (les seuls de ces phases) :
    - *Bloc auteur* en fin d'article (E-E-A-T) : nom et rôle proviennent du
      frontmatter existant ; une phrase de présentation est ajoutée —
      « Il partage ici ce qu'il applique au quotidien : fiscalité, cotisations et
      gestion de l'activité libérale. » + lien vers `/qui-sommes-nous`.
    - *Partage* : liens WhatsApp / LinkedIn / e-mail (URLs simples, aucun script tiers).
    - *« Retour en haut »* : lien d'ancre `#top`. ⚠️ Toujours visible et non
      déclenché par le scroll — l'apparition au défilement exigerait du JS.
    - *« À la une »* sur `/blog` : le dernier article passe en carte pleine largeur.
      ⚠️ **Piège de performance** : servie en 1200 px, chargée en `eager` +
      `fetchpriority="high"` et placée avant le texte, sa cover devenait l'élément
      **LCP** du viewport mobile et faisait tomber la page de **97 à 87**
      (LCP 4,1 s). Correctif : `srcset` 640/1024 px + `sizes`, `loading="lazy"`,
      et surtout **l'image passe après le texte dans le DOM** (elle reprend la
      colonne de gauche en desktop via `md:order-first`). Le titre redevient le
      LCP → **96, LCP 2,7 s**. Ne pas remettre cette image en tête du DOM.

  - **Corrections d'accessibilité globales** (déclenchées par Lighthouse sur le blog,
    mais qui bénéficient à tout le site) :
    - `--muted-foreground` : `215 16% 47%` → **45%**. À 47 % le ratio tombait à
      **4,48:1** sur le fond `--background` (#f7fafc), sous le seuil AA de 4,5:1 —
      fils d'Ariane, dates, durées de lecture. À 45 % : 4,82:1 (5,06:1 sur blanc),
      assombrissement imperceptible.
    - `Header.astro` : `aria-label` retiré des deux `<label>` du menu mobile
      (**attribut ARIA interdit** sur un label sans rôle — signalé sur *toutes* les
      pages). Le nom accessible porte désormais sur la checkbox `#mobile-menu-toggle`,
      qui est le vrai contrôle focusable ; son état coché traduit l'ouverture.
      Règle `:focus-visible` ajoutée (les labels ne sont pas frères de l'input, donc
      `peer-*` de Tailwind ne pouvait pas les cibler).
    - Résultat : accessibilité **93 → 100** sur un article, 96 sur `/blog`, 97 sur `/`.

### 9.d Maillage interne du blog — phase 5 (août 2026)

**Seule modification de contenu des articles à ce jour.** Le blog comptait
**1 seul lien markdown pour 38 articles** (vers `/`) : 38 culs-de-sac, aucune
transmission d'autorité, aucun rebond pour le lecteur.

  - **113 liens contextuels ajoutés**, dans **36 des 38 articles** (moyenne 3,0).
    Chaque ancre est une **expression déjà présente dans le texte** : aucune phrase
    n'a été réécrite, aucun mot ajouté ou retiré. Seuls des `[...](...)` entourent
    des expressions existantes.
  - **Structure moyeu-rayons.** Liens entrants : `tout-comprendre-urssaf` 20,
    `tout-comprendre-carmf` 18, `simulateur-super-net-combien-reste` 16,
    `salaires-medecins-remplacants` et `regime-fiscal-micro-bnc-vs-reel` 7 chacun,
    puis 19 autres cibles de 1 à 6. 24 articles cibles au total.
  - **Règles appliquées** (script `carte.py`, sélection unique partagée entre le
    rapport et l'application, pour qu'ils ne puissent pas diverger) : ancres exclues
    du frontmatter, des titres, des encadrés `:::`, des listes, des blocs de code et
    des liens existants ; jamais d'auto-lien ; **aucun chevauchement d'ancres sur une
    même ligne** ; **aucune ancre ne coupe un `**gras**`** ; plafond de 5 par article
    (20 opportunités écartées de ce fait).
  - **24 ancres d'un seul mot** (`rétrocession`, `2035`, `salariat`, `internat`…)
    ont été posées sur décision explicite. Quelques rapprochements restent ténus —
    par exemple `internat` dans une phrase sur le Livret A pointant vers les impôts
    des internes : à réexaminer à l'occasion.
  - **2 articles sans lien sortant** : `conge-maternite-paternite` et
    `generer-facture-remplacement`. Leur vocabulaire ne croise aucune cible ; un
    lien forcé aurait desservi le texte.
  - **3 cibles sans lien entrant** : `medecin-outre-mer-avantages-fiscaux`,
    `trouver-facilement-tes-remplacements-medicaux`,
    `frais-pros-medecins-salaries-internes-2026`. Elles resteront isolées tant
    qu'aucun article n'emploiera leur vocabulaire — cela relève de l'écriture.

**Correctif de contraste induit** : `.prose a` utilisait `--primary`, c'est-à-dire
**hippo-500 (#1A8CFF) → 3,37:1 sur blanc**, sous le seuil AA de 4,5:1 — exactement le
cas interdit par CLAUDE.md, et cette règle l'emportait sur le `prose-a:text-hippo-600`
du gabarit. Le problème préexistait mais **les 113 nouveaux liens l'auraient multiplié
d'autant**. Passé à **hippo-600 (5,15:1)**, survol en hippo-800 (assombrit au lieu
d'éclaircir).

### 9.e Hiérarchie et tableaux des longs guides — phase 6 (août 2026)

Les 38 articles n'utilisaient **aucun H3** : toute la structure était aplatie en H2
(jusqu'à **47 H2 de même niveau** dans un seul guide, ce qui rendait le sommaire de
la phase 2 illisible).

**6a — Hiérarchie (aucun texte modifié).** Sur les 5 plus longs guides,
`##` → `###` sur les sous-parties : **119 titres → 71 H2 + 48 H3**. Le *texte* des
titres est resté **strictement identique** (vérifié par empreinte md5 des titres
triés, avant/après, sur les 5 fichiers) : seul le nombre de `#` change.

Règle volontairement **conservatrice** (script `titres2.py`), limitée aux deux cas
certains : titre d'aparté (`⚠️ 💡 ⛔ 📌 ➕ 💎`) n'ouvrant pas l'article, et titre
purement descriptif (ni numéro, ni « Étape/Poste N », ni emoji) suivant une section
déjà identifiée. **Tout titre marqué d'un autre emoji reste H2** : distinguer un
emoji de section (`🎯 La règle-mère`) d'un emoji de sous-partie (`🚲 Vélo`, sous
« déplacements ») est un arbitrage éditorial, pas une règle mécanique. Un premier
jet plus agressif enfouissait à tort `🎯 La règle-mère` et `📋 La méthode en 6 étapes`
sous « Pour qui ce guide ? ».

⚠️ **Limite connue** : dans `frais-pros-medecin-liberal-2026`, les sections `4.x`,
`5.x` et `7.x` n'ont **pas de parent** `4.`, `5.`, `7.` dans le texte. Les passer en
H3 créerait des H3 orphelins ; leur donner un parent supposerait d'**inventer des
intitulés de section**. Elles restent donc H2. À trancher éditorialement.

**Sommaire mis à jour** : il liste désormais H2 **et** H3, les H3 en retrait avec un
filet à gauche. Le seuil de déclenchement porte sur les **sections de 1er niveau**
(≥ 8), pour qu'un guide très subdivisé mais court ne l'active pas : toujours
21 articles sur 38.

**6b — Tableaux.** Deux blocs déjà tabulaires, écrits en prose, sont devenus des
tableaux markdown dans `frais-pros-medecin-liberal-2026` :
le **barème kilométrique 2026** (5 puissances × 3 tranches) et les **exemples de
déduction repas**. Les valeurs ont été **extraites du texte par script**, jamais
ressaisies — contrôle : **287 nombres avant, 287 après, aucun perdu ni ajouté**.
Seuls ajouts de texte : les en-têtes de colonnes (`Puissance fiscale`, `Ticket`,
`Calcul`, `Déduction`), un tableau markdown exigeant une ligne d'en-tête.

Aucun autre bloc du même type n'existe dans les 5 guides ; les tableaux restants
(seuils micro-BNC, taux RSPM, plafonds mission FPH) demanderaient une réécriture
éditoriale et n'ont **pas** été engagés.

**Correctif induit** : `.prose table` comprimé dans 358 px cassait les montants en
deux (« 1 065 » sur deux lignes, « Au-delà » césuré) — inacceptable sur des chiffres
fiscaux. Les tableaux d'articles défilent désormais **horizontalement dans leur
propre conteneur** (`display:block; overflow-x:auto`, cellules en `white-space:nowrap`,
chiffres en `tabular-nums`) : vérifié, le corps de page ne défile jamais latéralement.

### 9.f Fraîcheur : `lastmod` du sitemap — phase 6 bis (août 2026)

`updatedDate` alimente **deux choses indépendantes**, qui n'appellent pas la même
réponse :
  - le **`lastmod` du sitemap**, via `src/generated/blog-meta.json` (cf. `astro.config.mjs`) ;
  - la mention **« Mis à jour le… » affichée au lecteur**, via le frontmatter de l'article.

Après les phases 5 et 6, **36 des 38 articles ont réellement changé** (liens internes,
hiérarchie, tableaux) alors que leur `lastmod` restait figé à leur date de publication,
parfois dix mois plus tôt.

**Ce qui a été fait** — `blog-meta.json` : `updatedDate` porté à **2026-08-10** pour
ces 36 articles. Le sitemap déclare désormais une date de dernière modification
**exacte**. Les 2 articles non modifiés (`conge-maternite-paternite`,
`generer-facture-remplacement`) conservent la leur.

**Ce qui n'a délibérément PAS été fait** — le frontmatter n'a pas été touché : seuls
3 articles affichent toujours « Mis à jour le ». Sur un blog fiscal, écrire « Mis à
jour le 10 août 2026 » sur un article CARMF dont **seuls des liens** ont été ajoutés
laisserait croire au lecteur que les chiffres ont été revérifiés. Le signal technique
(lastmod) doit être exact ; la promesse faite au lecteur doit rester réservée aux
vraies remises à jour de contenu.

⚠️ **Conséquence à connaître** : pour 33 articles, `blog-meta.json` et le frontmatter
divergent volontairement. Relancer `scripts/generate-blog-content.mjs` régénérerait
`blog-meta.json` depuis le frontmatter et **effacerait ces lastmod** (le script est
de toute façon déconseillé, cf. avertissement de CLAUDE.md sur l'écrasement des
éditions). En cas d'édition manuelle du frontmatter, tenir les deux cohérents.

### 9.g Correction du seuil de sommaire — audit (août 2026)

Le seuil de la phase 2 (« ≥ 8 sections ») mesurait la **structure** et non la
**longueur**. Or le style rédactionnel du blog découpe même les articles courts en
nombreuses micro-sections : **14 des 21 sommaires déclenchés couvraient des articles
de moins de 900 mots**. Cas extrême : `frais-professionnels-deductibles`, **367 mots
pour 19 entrées** — soit 19 mots par section, et un sommaire occupant **25 % de la
hauteur de l'article**. Médiane du corpus : 59 mots par entrée de sommaire.

**Correction** : seuil porté à **≥ 1 200 mots ET ≥ 8 sections de 1er niveau**
(`post.body` fournit le compte). Le corpus présente une rupture nette entre 1 245 et
536 mots, ce qui rend le seuil peu sensible à sa valeur exacte (900 et 1 200 donnent
le même résultat). **21 → 7 articles.** Le sommaire retombe à 7-12 % de la hauteur
de l'article là où il subsiste, contre 25 % dans le pire cas.

**Sur la valeur SEO d'un sommaire** — elle est quasi nulle, et c'était une erreur de
la présenter autrement : les liens d'ancre d'une page vers elle-même ne transmettent
pas d'autorité, et les `id` des titres — seuls nécessaires pour que Google propose
des liens de saut — existent de toute façon dans le HTML, sommaire ou pas. Le
sommaire est un **outil de lecture**, pas un levier de référencement. Il se justifie
uniquement quand l'article dépasse largement la hauteur d'écran.

⚠️ **Point résiduel non traité** : la colonne sticky précède l'`<article>` dans le
DOM. Sur le plus long guide, un utilisateur au clavier traverse **72 liens avant
d'atteindre le contenu** (46 sur le suivant). Le repère ARIA `<nav aria-label="Sommaire
de l'article">` permet aux lecteurs d'écran de sauter le bloc, mais pas à la
navigation clavier seule. Inverser l'ordre DOM réglerait le desktop et casserait le
mobile (le sommaire se retrouverait après l'article). Solution possible : un lien
« aller au contenu » en tête du sommaire, visible au clavier uniquement.

### 9.h Audit mobile d'avant-production (août 2026)

Audit mené **sur le build** (`npx serve dist`) et non sur le serveur de dev, dont les
dépendances Vite périmées produisaient des 504/500 trompeurs.

**Couverture** : 54 URLs à 320 px ; 10 pages représentatives sur 6 viewports
(320 / 360 / 390 / 430 / 768 px + téléphone en paysage 844×390) ; états interactifs
au toucher ; zoom texte 200 % ; `prefers-reduced-motion` ; images indisponibles.

**Résultats sans défaut** : aucun défilement horizontal réel nulle part (vérifié via
`window.scrollX` après tentative de défilement, et non via `scrollWidth` qui produit
des faux positifs) ; CLS 0 partout ; 0 image sans `width`/`height` ; zoom 200 % sans
perte de contenu ; animations et défilement doux correctement désactivés en
`reduced-motion` ; mise en page tenue sans images ; tiroir mobile, sommaire,
accordéons, onglets et défilement de tableau tous fonctionnels au toucher.

**Défauts corrigés** :
  - **Cibles tactiles des fils d'Ariane** : 17 px de haut, sous le minimum de 24 px
    (WCAG 2.5.8) et non couverts par l'exception « lien en pleine phrase ». Corrigés
    sur `blog/[slug]`, `blog/serie/[series]`, `faq`, `qui-sommes-nous`, `comparatif`.
  - **Contrastes sous AA** — tous de même racine (blanc ou blanc translucide sur
    `hippo-500`/`emerald-500`, trop clairs) :
    - compteur `text-white/80` de la pastille active de `/blog` : 3,85 → **5,15**
      (blanc plein ; la nuance passe par la graisse, pas l'opacité) ;
    - bloc CTA de fin d'article, sur **30 articles** : dégradé `hippo-500→600` où
      même du blanc plein ne donnait que 3,37 → passé à `hippo-600→700` (**5,15
      à 6,82**), sous-titre en blanc plein ;
    - badges FLEXIBLE (2,54) et POPULAIRE (3,37) de `PricingSection` → **5,48** et
      **5,15** ;
    - onglet actif du « Parcours » : blanc sur `hippo-500` à 13 px, 3,36 → **5,15** ;
    - pastille « −34 % » de `/tarifs` : `emerald-600` sur `emerald-50`, 3,58 → **5,21**.

**Résultat Lighthouse mobile** : **accessibilité 100** sur `/`, `/blog`, les pages de
série, les articles, `/tarifs` et `/faq` ; SEO 100 et Best Practices 100 partout ;
performance 92-100.

**Signalés, non corrigés (décisions à prendre)** :
  - `/comparatif` — accessibilité 97 : trois noms de marque concurrents affichés dans
    leur couleur propre (#E72E77, #6366F1, #F43F5E), entre 3,67 et 4,46. **WCAG 1.4.3
    exempte explicitement les noms de marque** ; les assombrir trahirait l'identité
    des marques citées. Faux positif d'axe, laissé tel quel.
  - **Overlay du tiroir mobile** : le tiroir occupe 360 px sur 390, ne laissant
    qu'une bande de **18 px** pour « toucher à côté pour fermer ». Le bouton × du
    tiroir fonctionne, donc rien n'est bloqué, mais le geste attendu est hors de
    portée. Réduire la largeur du tiroir le réglerait.
  - **`/simulateur` : erreurs React #418 et #423** (échec d'hydratation) dans le
    build. **Vérifié comme antérieur à ces travaux** — présent à l'identique au
    commit `1d1be89`. Non investigué ici, mais à traiter : c'est la page outil la
    plus stratégique du site.
  - Textes à **11 px** sur `/` et `/guide-declarations` (mentions secondaires). Pas
    un échec WCAG, mais peu lisible sur mobile.

### 9.i Pages de série — texte propre à chaque page (août 2026)

Créées en §9.c, les trois pages `/blog/serie/*` n'avaient qu'**une seule phrase**
à elles (la `description` de la série) pour ~280 mots au total : tout le reste —
cartes, navigation, en-tête — est commun aux trois. C'est le profil type de la
page « mince » que Google traite comme à faible valeur. C'était la dernière
faiblesse SEO connue du blog, et elle avait été introduite par cette refonte.

Chaque page reçoit une introduction décrivant le **contenu réel** de sa série
(sujets, formats, durées de lecture) et renvoyant vers les deux autres. Celle
des Fiches Pratiques ajoute un ordre de lecture calé sur l'ordre des démarches.

| page | mots avant | après | liens internes distincts |
|---|---|---|---|
| `fiches-pratiques` | 280 | **411** | 11 |
| `fiches-fiscalite` | 341 | **445** | 12 |
| `guides-conseils` | 788 | **891** | 24 |

Les textes vivent dans `src/lib/blog-series-slugs.ts`, **pas** dans
`blog-series.ts` qui est généré et porte la mention « ne pas éditer à la main ».
Rendus via `set:html` — HTML de confiance écrit à la main, aucune saisie
utilisateur. Les `<strong>` y sont volontairement en encre neutre et non en bleu :
en bleu foncé ils imitaient des liens sans en être.

### 9.j Serveur de dev et hydratation de /simulateur (août 2026)

**Le serveur de dev renvoyait 500 sur toute page à îlot React**, ce qui rendait
tout diagnostic impossible — et masquait le point suivant. Chaîne complète :

```
ui/dialog.tsx importe @/components/tracking/ScreenTracker  (absent du dépôt)
   → le scan de dépendances Vite échoue
   → le pré-bundling est désactivé
   → react est servi en CommonJS brut
   → PremiumTooltip.tsx : import { ReactNode } from "react"  (ReactNode est un TYPE)
   → 500
```

Le **build de production tolérait les deux** (esbuild élimine l'import de type,
`dialog.tsx` n'est importé par personne) : défaut invisible en CI. Correctifs :
`import type` d'un côté, retrait de l'import mort de l'autre. `dialog.tsx` a depuis été
supprimé (§9.k). ⚠️ Un premier comptage annonçait « 23 composants `ui/*`
orphelins » : il était **faux**, la recherche excluant `ui/` de son propre champ,
si bien qu'un composant utilisé uniquement par un autre composant `ui/` paraissait
mort. Le chiffre réel est **3** (§9.k).

**Échec d'hydratation de `/simulateur`** — « Hydration failed because the initial
UI does not match what was rendered on the server », suivi de « the entire root
will switch to client rendering » : React jetait le HTML serveur et re-rendait
l'îlot entier, sur la page de conversion, sur **tout téléphone**. Défaut
antérieur à la refonte du blog (vérifié en rebâtissant le commit `1d1be89`).

⚠️ Cause : `useIsMobile()` lisait `window.innerWidth` **pendant le rendu** tant
que son état valait `undefined`. Serveur → `false` ; premier rendu client sur
mobile → `true`. `PremiumTooltip` branche là-dessus et ajoute un `<div>`
d'enrobage en variante mobile : React attendait un `<div>` dans un `<label>`
absent du HTML serveur. **Le premier rendu client doit toujours être identique
au rendu serveur** — l'état part désormais de `false`, la vraie valeur arrivant
après montage.

Hypothèses écartées en chemin, à ne pas reprendre : formatage `Intl.NumberFormat`
(aucun nombre formaté n'est rendu côté serveur) et imbrication HTML invalide
(0 cas dans l'îlot SSR).

Résultat : 0 `pageerror` à 320, 390 et 1440 px ; accessibilité, bonnes pratiques
et SEO à 100. La performance reste à 88-89 (LCP 3,8 s) — c'est le bundle
`SimulateurApp.js` de **552 Ko**, pas l'hydratation.

### 9.k Poids du bundle et code réellement mort (août 2026)

**recharts sorti du chemin critique.** `/simulateur` chargeait un bundle de
**552 Ko** dont ~388 Ko de recharts — utilisé à un **seul** endroit du site, pour
un camembert de 100×100 px à trois parts, affiché **uniquement après soumission**
du formulaire. `RegimeComparisonCards` passe donc en `React.lazy` + `Suspense`.

Sans risque au rendu serveur : à ce moment `results.recommande` est faux, donc
`SimulateurResults` n'est pas rendu et le `lazy` n'est jamais évalué.

| | avant | après |
|---|---|---|
| chunk `SimulateurApp.js` | 552 Ko | **135 Ko** |
| JS transféré au chargement | — | **290 Ko** |
| performance mobile | 88-89 | **89-94** (médiane 93) |
| LCP | 3,8 s | **3,0 s** |

Vérifié fonctionnellement à 390 et 1440 px : recharts absent au chargement,
chargé à la soumission, camembert rendu avec ses parts, 0 erreur. Un premier test
avait échoué à soumettre le formulaire — cela ne prouvait rien, il fallait piloter
les champs réels (`recettesBrutes`, `chargesHorsCotisations`).

**Code mort — le chiffre réel est 3, pas 23.** Une analyse d'atteignabilité depuis
les pages Astro (parcours du graphe d'imports) montre que **20 des 23 composants
`ui/*` sont bien atteints**, souvent via un autre composant `ui/`. Seuls
`dialog`, `popover` et `scroll-area` sont inatteignables : supprimés, avec leurs
trois dépendances `@radix-ui/react-{dialog,popover,scroll-area}` — les seules du
`package.json` qui n'étaient importées par rien.

Restent inatteignables mais **conservés délibérément**, car ils ressemblent à des
fonctionnalités désactivées plutôt qu'à des résidus :
`simulateur/SimulateurGuide.tsx`, `simulateur/CotisationsDetailChart.tsx`,
`lib/calc/declaration2035Inputs.ts`. À trancher éditorialement.

### 9.l Finitions (août 2026)

**Tiroir mobile — zone de fermeture.** Le tiroir occupait presque tout l'écran
(296 px sur 320, 360 sur 390), ne laissant que **12 à 18 px d'overlay** : le geste
« toucher à côté pour fermer » était hors de portée, très en dessous des 44 px
usuels. Largeur ramenée à `w-[calc(100%-4.5rem)] max-w-[340px]`, ce qui garantit
**au moins 60 px** de 320 à 430 px. Vérifié aux quatre largeurs : fermeture par
l'overlay fonctionnelle, 10 liens, aucun débordement, CTA lisibles, 0 erreur.

**Maillage — 6 ancres retirées sur 113 (reste 107).** Relecture des 24 ancres
d'un seul mot signalées en §9.d. Six étaient trompeuses ou hors-sujet :
  - « Assurance **Maladie-Maternité** » ×3 (`cotisations-sociales-vs-impots`,
    `simulateur-super-net-combien-reste`, `tout-comprendre-urssaf`) — c'est le nom
    d'une **branche de cotisation**, pas le congé maternité vers lequel le lien
    pointait. L'occurrence conservée dans `remplir-declaration-2035` est d'une
    autre nature : elle désigne les **indemnités journalières** maternité, que
    l'article cible traite bien.
  - « **internat** » ×2 — dans un contexte de Livret A (`interets-composes`) et
    d'éligibilité à la licence (`obtenir-sa-licence`), pointant vers un article
    d'impôts. Rapprochement trop lâche.
  - « **échéance** » ×1 (`inbox-zero-remplacant`) — il s'agit de gestion de
    tâches, pas d'échéances fiscales.

Les 18 autres sont conservées : « 2035 », « rétrocession(s) », « salariat »,
« Urssaf », « facturer », « budget » sont chacune le sujet même de leur cible.

**Textes à 11 px — volontairement NON modifiés.** L'audit mobile les signalait sur
2 pages, mais `text-[11px]` compte **plus de 60 occurrences** dans le dépôt,
surtout dans les outils (calculette, simulateur, guide) : c'est une convention de
design établie, et aucun critère WCAG n'impose de taille minimale. Les modifier
serait une décision de design, pas une finition.

**Deux derniers défauts d'accessibilité sur `/guide-declarations`** (page non
touchée par la refonte, relevée par le balayage final) :
  - `FiscalSocialPrimer.astro` — 4 `<dt>` en `text-hippo-700/70` : l'opacité
    ramenait le contraste à **3,50:1** sur fond `#f6faff`, à 10 px. Opacité
    retirée (**6,4:1**). Même racine que les six contrastes de §9.h : la nuance
    passait par l'opacité au lieu de la couleur.
  - `PremiumCtaSection.astro` — le bouton portait `aria-label="Démarrer mon essai
    gratuit **Hippodoc** 30 jours"` alors que son texte visible est « Démarrer mon
    essai gratuit 30 jours ». Le nom accessible ne **contenait** donc pas le texte
    visible : échec **WCAG 2.5.3 (Label in Name)**, qui empêche un utilisateur de
    commande vocale de cibler le bouton en prononçant ce qu'il lit. `aria-label`
    retiré — le texte visible suffit comme nom accessible.

**⚠️ `/guide-declarations` reste à 97 en accessibilité — 20 nœuds non corrigés.**
Dix instances ont été corrigées (`text-emerald-700/70` ×4, `text-blue-600/70` ×3,
`text-emerald-500/60` ×3), mais le diagnostic final montre que le problème est
**systématique sur cette page** et suit six motifs :

| motif | nœuds | ratio | correction |
|---|---|---|---|
| `opacity-60` sur gris | 6 | 2,37 | retirer l'opacité |
| `text-red-600` sur `bg-red-50` | 7 | 4,41 | `text-red-700` |
| `text-emerald-600` sur vert pâle | 3 | 3,67 | `text-emerald-700` |
| `opacity-70` sur bleu | 2 | 2,94 | retirer l'opacité |
| blanc sur `bg-hippo-500` | 1 | 3,36 | `bg-hippo-600` |
| `text-hippo-600` sur `bg-hippo-100` | 1 | 4,40 | `text-hippo-700` |

Dispersés dans au moins cinq composants (`CaseopediaSection`, `CrossLinks`,
`FlowChartSection`, `FiscalSocialPrimer`, `BoussoleWizard`). C'est une **passe
dédiée à cette page**, hors du périmètre de la refonte du blog, qui demande une
vérification visuelle de chaque composant touché — non engagée ici pour ne pas
restyler à moitié une page non demandée.

La racine est identique à celle des contrastes de §9.h : la nuance passe par
l'**opacité** ou par une couleur **mi-ton** au lieu d'une couleur assez foncée.
À traiter comme une règle de design, pas comme des cas isolés.

### 9.m Audit de code et extension de verify-site.mjs (août 2026)

**28 erreurs de typage éliminées** (`npx tsc --noEmit` en signalait 28, désormais 0),
analysées une par une plutôt que corrigées en bloc :
  - 17 dans du code de calcul fiscal (`forfaitsSecteur1.ts`, `dsPamc.ts`) —
    **les calculs étaient justes** : `Number.isFinite(undefined)` vaut `false`, la
    garde `safe()` renvoyait bien 0. Seule la signature était trop stricte, et ce
    bruit masquait de vrais problèmes. Élargie à `number | undefined`.
  - 8 sur les profils types du simulateur — un profil ne renseigne qu'une douzaine
    de champs sur vingt-six, mais était typé comme complet. Surtout, `form.reset()`
    REMPLACE tout l'état : les champs absents devenaient `undefined`. Les valeurs
    par défaut sont extraites en `SIMULATEUR_DEFAULTS` et réinjectées au reset.
    ⚠️ Mon diagnostic initial annonçait « deux listes déroulantes restent vides » :
    **c'était faux** — la sonde lisait les `<select>` natifs cachés que Radix garde
    pour l'accessibilité. Le défaut était latent, sans impact visible.
  - 1 sur `RegimeComparisonCards` — `recettes && recettes > X` vaut `0` et non
    `false` quand les recettes sont nulles : JSX aurait affiché littéralement
    « 0 ». Encadré dans `Boolean()`.
  - 2 sur `SimulateurGuide.tsx` — fichier mort rendu non compilable par la
    suppression de `ui/dialog` en §9.k. Supprimé (son contenu vit en statique dans
    `simulateur.astro`).

**Cibles tactiles** — 8 éléments sous le minimum de 24 px (WCAG 2.5.8) agrandis :
« ← Retour au blog » (38 pages), 5 ancres et 3 liens « Source » de `/comparatif`,
lien `/tarifs` de la landing, « Voir les tarifs » du simulateur, `<summary>` RSPM.
Les liens **en pleine phrase** sont exemptés par le critère et laissés tels quels.

**`verify-site.mjs` étendu** — l'audit manuel avait trouvé en une passe trois
défauts que le script ne voyait pas. Ils sont désormais automatiques :
  1. **liens internes morts** — 3 332 liens vérifiés à chaque build ;
  2. **balises sociales** (`og:title/description/image/url`, `twitter:card`) sur
     chaque page du sitemap ;
  3. **pages construites hors sitemap** — erreur si indexable, avertissement si
     `noindex`, et erreur si elle n'a pas d'`og:title` (une page en noindex reste
     partageable).

Les trois contrôles ont été **validés en injectant volontairement chaque défaut**
dans le build : chacun se déclenche, aucun n'est décoratif.

⚠️ Non traité, délibérément : les 3 vulnérabilités `npm audit` (chaîne
`path-to-regexp` → `@astrojs/vercel`, active **au build seulement**, sur les
36 routes de `vercel.json` — `npm audit fix --force` casserait l'adaptateur), et
les ~940 cibles tactiles de `/guide-declarations`, réparties sur deux composants
répétés : même chantier dédié que ses 20 contrastes (§9.l).

### 9.n Page 404 et en-têtes de cache (août 2026)

Deux défauts trouvés par un audit de la **production** (et non du build) après
la mise en ligne. Aucun des deux n'était une régression : ils préexistaient.

**a. Aucune page 404.** L'adaptateur Vercel génère systématiquement la route
`{"src":"^/.*$","dest":"/404.html","status":404}`, mais `src/pages/404.astro`
n'existait pas. Vercel servait donc sa page brute : **79 octets, sans `<title>`,
sans logo, sans lien de retour**. Tout visiteur arrivant par un lien mort — vieux
partage, faute de frappe, URL tronquée — se retrouvait dans une impasse.
Créer la page a suffi : la route existait déjà.
Elle est en **`noindex`** (elle est servie sous des URL arbitraires ; indexable,
elle dupliquerait le site autant de fois qu'il existe d'URL erronées) et le code
HTTP reste **404**, porté par la route et non par le document — ce qui évite le
« soft 404 » que Google pénalise.

⚠️ Piège rencontré à l'écriture : un retour à la ligne entre du texte et un
`<span>` est absorbé à la compilation. `Cette page est\n<span>introuvable</span>`
rendait littéralement « estintrouvable ». Le fragment doit rester sur **une seule
ligne** (c'est pourquoi le H1 de `blog/index.astro` est écrit ainsi), ou utiliser
`{' '}`. Défaut invisible à la relecture du source, visible à l'écran.

**b. Aucun cache sur les assets.** Tout partait en
`public, max-age=0, must-revalidate`, y compris les fichiers de `/_astro/` dont le
nom **contient déjà l'empreinte de leur contenu**. Cause exacte : l'adaptateur
écrit bien une règle `immutable`, mais **après** `{"handle":"filesystem"}` —
or tout ce qui suit cette étape ne s'exécute que si aucun fichier n'a été trouvé.
Pour un fichier qui existe, la règle n'est jamais atteinte.

Le correctif passe par `vercel.json`, dont les `headers` s'appliquent **avant**
l'étape `filesystem`. Vérifié au préalable que `vercel.json` est bien honoré à
côté du Build Output API de l'adaptateur (les 36 redirections répondent en 308).

| Cible | Cache | Pourquoi |
|---|---|---|
| `/_astro/(.*)` | `max-age=31536000, immutable` | 188/188 fichiers hachés — vérifié |
| `/lovable-uploads/(.*)` | `max-age=86400` | noms **stables** : jamais `immutable` |
| 4 icônes racine | `max-age=86400` | noms stables également |
| HTML, `robots.txt`, sitemaps | *inchangé* | un déploiement doit être visible **immédiatement** |

Coût évité : 20 allers-retours réseau sur `/`, 17 sur `/blog`, à chaque visite.
Les réponses étaient déjà des **304** (l'ETag fonctionnait) : ce qui était perdu
n'était donc pas de la bande passante mais **une latence par ressource**, payée
surtout en mobile.

⚠️ Contrepartie assumée sur `/lovable-uploads/` : remplacer une image **sans
changer son nom** la laisse périmée jusqu'à 24 h chez les visiteurs déjà venus.
**Renommer le fichier** lors d'un remplacement contourne entièrement le problème.
C'est aussi pourquoi `immutable` y est exclu.

**Trois contrôles ajoutés à `verify-site.mjs`**, tous validés par injection du
défaut correspondant :
  1. `404.html` présent, en `noindex`, avec un lien vers l'accueil ;
  2. **aucun fichier sans empreinte dans `/_astro/`** tant que `vercel.json` le
     sert en `immutable` — c'est l'invariant qui rend la promesse vraie. Le jour
     où un nom stable y atterrit, il serait figé un an chez tous les visiteurs,
     sans le moindre signal ;
  3. aucune règle de cache ne vise du HTML — sinon un déploiement resterait
     invisible pour les visiteurs déjà venus.

⚠️ Non corrigé (hors de notre code) : l'ordre des routes de `@astrojs/vercel`
v11.0.5, qui place sa règle de cache après `handle: filesystem` et la rend donc
inopérante. Contourné par `vercel.json`.

### 9.o Audit mobile de bout en bout avant mise en production (août 2026)

Audit de la 404 et des en-têtes sur **7 largeurs** (280 → 844 px, paysage inclus)
croisées avec le **zoom texte 200 %**, plus une simulation des règles de cache.

**Les règles de cache, prouvées et non supposées.** Les motifs de `vercel.json`
ont été compilés avec `path-to-regexp` — la bibliothèque qu'utilise Vercel — puis
appliqués aux **356 URL** du build : 243 assets couverts, **0 page HTML attrapée**,
aucun chevauchement entre règles. Les 113 pages restent en revalidation immédiate,
ce qui garantit qu'un déploiement est visible tout de suite ; `robots.txt`,
`llms.txt` et les deux sitemaps restent volontairement hors règle.

**Débordement horizontal à 200 % de zoom (WCAG 1.4.10 « Reflow »).** « introuvable »
est un mot de onze lettres insécable : à 200 % sur 320 px il débordait la page de
63 px, **103 px sur un Galaxy Fold (280 px)**. Corrigé par `break-words` sur le H1
et `min-w-0 break-words` sur les cartes — un élément de grille a `min-width:auto`
et refuse de rétrécir sous son mot le plus long.

⚠️ `hyphens-auto` a été essayé puis **retiré** : la césure automatique optimise le
remplissage des lignes même quand rien ne déborde, et coupait « intro-uvable » à
taille normale. `break-words` ne se déclenche que si le mot ne tient réellement pas.

⚠️ **Défaut systémique NON corrigé** — à 200 % de zoom sur ≤ 360 px, *toutes* les
pages débordent encore, indépendamment de la 404 : le tiroir de menu et son voile
(`fixed`, `max-w-[340px]`) et le logo du footer (5 px) dépassent. Mesuré : 219 px
sur un article, 179 px sur `/qui-sommes-nous`, 160 px sur `/tarifs`. Préexistant,
partagé par tout le site, à traiter dans une passe dédiée sur `Header`/`Footer`.

**Hiérarchie des titres.** Le footer partagé ouvre sur des `<h3>` : toute page peu
structurée enchaîne donc h1 → h3. Trois corrections, aucune visuelle :
  - 404 : ajout du `<h2>` « Où aller maintenant ? » (visible, utile à la lecture) ;
  - `CtaBanner.astro` : `<h4>` → `<h3>` (saut h2 → h4 sur l'**accueil**) ;
  - `calculette.astro` : `<h2 class="sr-only">` avant l'îlot. `CardTitle` rend un
    `<h3>` et sert partout — on ne touche pas au composant, on rétablit le niveau
    manquant sur la page. `sr-only` est en position absolue : mise en page intacte.

⚠️ Piège découvert à cette occasion : **les commentaires HTML sont émis dans la
page**. Le commentaire qui expliquait ce correctif citait « `<h3>` » et était
compté comme un vrai titre — il créait lui-même le saut qu'il documentait.
D'où deux changements : commentaire Astro `{/* */}` (non émis) sur les pages, et
`verify-site.mjs` qui **retire les commentaires avant toute analyse de titres**.

**Deux contrôles ajoutés à `verify-site.mjs`** : saut de niveau de titre
(avertissement — le défaut est facile à réintroduire) et exclusion des
commentaires du comptage des `<h1>`. Le contrôle a immédiatement révélé les deux
défauts préexistants ci-dessus, invisibles jusque-là.

**Résultats** : 404 en Lighthouse mobile **accessibilité 100/100**, aucun audit
échoué ; 0 débordement de 280 à 844 px, à 100 % comme à 200 % ; contrastes de
5,06:1 à 10,72:1 (seuil 4,5) ; focus visible sur les 5 liens ; tiroir mobile
fonctionnel ; 9 formes d'URL testées (chemin profond, accents encodés, query,
majuscules, 200 caractères, `%2e%2e`) rendent toutes la page complète.

### 9.p Rétablissement des événements `landing_*` (août 2026)

**Le diagnostic d'abord, parce qu'il était contre-intuitif.** Depuis la bascule du
07/08/2026, PostHog ne recevait plus aucun `landing_viewed`, `landing_scroll_depth`
ni `landing_section_viewed`. Un rapport externe attribuait cela à un crash de la
landing en WebView Instagram (`crypto.randomUUID()` levant une exception, gate
Supabase bloquant le montage). **Ce diagnostic ne s'applique pas à ce dépôt** :
`crypto.randomUUID` n'apparaît que dans `SimulateurApp.tsx`, aucun `supabase.auth`
n'existe sur le site public, et la landing est en Astro pur — il n'y a pas de
composant React à faire tomber.

La cause réelle, vérifiée en base : le trafic est passé de `hippodoc.fr` (ancienne
SPA Lovable) à `www.hippodoc.fr` (ce dépôt) **le jour même du lancement de la
campagne Meta**. L'ancien site émettait 15 à 59 `landing_viewed` par jour ; le
nouveau, zéro, parce que §6 et §11 avaient porté les *attributs* d'instrumentation
sans l'émission d'événements, écartée au nom du zéro JS. Ce n'était pas un oubli,
c'était une décision — mais **31 insights sauvegardés**, créés le 05/08, sont
restés vides pendant cinq semaines.

**Ce qui marchait déjà et n'a PAS été retouché.** Les clics sont captés depuis le
début via `$autocapture` : les `data-ph` (28 sur l'accueil) et les `data-track`
des CTA apparaissent dans `elements_chain`. Mesuré sur 7 jours : 736 événements
portant `data-ph`, dont **28 clics sur `cta_signup*`**. Aucun balisage n'a donc été
ajouté ; `landing_cta_clicked` est reconstruit à partir des `data-track` existants.

**Ce qui a été ajouté** — uniquement ce qu'aucune capture automatique ne peut
déduire : `src/lib/landing-analytics.ts` (4,4 Ko bruts, **1,9 Ko gzip**), chargé en
import dynamique depuis `PostHog.astro` **après** `init()` (ordre garanti, instance
unique), et seulement sur `/`.

⚠️ **Exception zéro-JS assumée**, au même titre que le micro-script du tiroir mobile.
Justification : sans elle, la profondeur de lecture, le parcours des sections et
l'engagement vidéo sont structurellement immesurables.

**Fidélité à l'historique.** Noms, propriétés et valeurs sont repris tels quels d'un
relevé PostHog sur 45 jours, pour que les données d'avant et d'après vivent dans les
mêmes insights : `depth` ∈ {25,50,75,100} ; les 11 sections dans leur ordre exact
(`hero` → `footer`) ; `profile` ∈ {remplacant, interne, mixte, collaborateur,
installe} ; contexte commun `device_type` / `referrer_source` / `deployment_env` /
`app_version` / `session_pageview_count` / `initial_*` / `utm_*`.

⚠️ Deux pièges rencontrés, tous deux invisibles à la relecture :
  - les radios du sélecteur « Pour qui » n'ont pas d'attribut `value` : `radio.value`
    renvoie `"on"` pour toutes. Le profil est lu depuis `data-profile` (déjà présent).
  - `remplacant` étant coché par défaut, écouter `change` ne l'aurait **jamais**
    émis — alors que c'est le profil le plus fréquent de l'historique (62 sur 108).
    On écoute donc le clic sur les libellés.

**Aucun identifiant fabriqué.** `crypto.randomUUID()` n'est pas utilisé : PostHog
fournit déjà `$session_id`. La classe de panne décrite par le rapport externe est
donc écartée par construction, sans `safeUuid()` ni repli.

**Robustesse WebView** (97 % du trafic payant) : tout accès à une API du navigateur
passe par `safe()`. Vérifié en simulant un contexte hostile — `sessionStorage`
levant une exception, `crypto.randomUUID` supprimé, `IntersectionObserver` absent :
`landing_viewed` part quand même, aucune erreur de page.

**Bilan de poids** : `disable_surveys: true` supprime **98 Ko** de `surveys.js`
chargés sur chaque page alors qu'aucune enquête n'est configurée (table `surveys`
vide). Net sur tout le site : **−96 Ko**. TBT mesuré à 0 sur les 20 exécutions
Lighthouse, quelle que soit la configuration.
⚠️ `dead-clicks-autocapture.js` (17 Ko) continue d'être chargé : il suit la
configuration distante (`heatmaps: true`), pas une option client — `capture_dead_clicks`
a été essayé sans effet, et retiré plutôt que de laisser un commentaire faux.
⚠️ Le LCP local n'a pas permis de conclure (dispersion 6,0–7,0 s sur un serveur de
test sans compression) ; à confirmer sur les web vitals de production.

**Trois garde-fous dans `verify-site.mjs`**, validés par injection : les 10 sections
doivent porter leur `data-landing-section`, aucun identifiant inconnu ne doit
apparaître (sinon son `section_order` serait faux), et tout lien vers
`auth?tab=signup` doit garder son `data-track`.

⚠️ Piège de mesure à retenir : `posthog-js` **filtre les navigateurs automatisés**
(`navigator.webdriver`, UA « HeadlessChrome »). Toute vérification via Playwright
observe donc zéro événement, y compris en production. Le module se teste en lui
injectant un faux `posthog` — pas en écoutant le réseau.

### 9.q Instrumentation complète des pages marketing (août 2026)

Suite de §9.p. La landing rétablie, restait à savoir ce que « complet » veut dire.
La seule définition objective : **les 31 insights sauvegardés affichent-ils des
données ?** Les événements qu'ils réclament ont donc été extraits, puis confrontés
à ce qui existe réellement.

**Rétablis ici** — tous existaient avant le 07/08/2026, tous à zéro depuis :

| Événement | Volume historique | Propriétés |
|---|---|---|
| `pricing_viewed` | 133 | `instagram_10k_active` (toujours `false`) |
| `blog_scroll_depth` | 58 | `slug`, `category`, `series_id`, `episode_number`, `depth` |
| `guide_declarations_section_viewed` | 53 | `section` (8 valeurs) |
| `guide_declarations_viewed` | 38 | `context: 'public'` |
| `faq_question_opened` | 36 | `section_id`, `question_key` (`<rubrique>-<index>`) |
| `blog_article_viewed` | 27 | métadonnées d'article |
| `blog_index_viewed` | 26 | `total_articles` |
| `blog_read_completed` | 14 | métadonnées d'article |
| `faq_viewed` | 9 | — |
| `comparatif_viewed` | 1 | — |

Ajoutés aussi : `landing_video_error` (3 insights l'attendaient) et
`landing_journey_cta_clicked` (2 insights) — ceux-là n'avaient **jamais** été émis,
même par l'ancienne SPA.

**Fidélité.** Les métadonnées d'article (`slug`, `category`, `series_id`,
`episode_number`) sont injectées au build depuis le frontmatter sur `<article>` :
aucun calcul côté client, et les valeurs sont exactement celles de l'historique
(`Fiche Fiscalité` / `fiche-fiscalite`…). Les clés de FAQ reproduisent le format
`<rubrique>-<index>` : les 10 rubriques de `/faq` portent déjà les identifiants
attendus (`tarifs`, `paiements`, `revenus`…), et les clés émises en test
(`tarifs-4`, `paiements-2`, `securite-2`…) figurent telles quelles dans les
données d'avant la bascule.

⚠️ **Piège corrigé — `IntersectionObserver` et les sections hautes.** Le seuil
proportionnel (`threshold: 0.3`) exige qu'une fraction de l'ÉLÉMENT soit visible.
Sur `/guide-declarations`, la section « glossaire » fait **12 658 px** : en exiger
30 % réclamerait 3 797 px dans une fenêtre de 844 — **5 sections sur 8 ne se
déclenchaient jamais**. Remplacé par une bande de déclenchement
(`threshold: 0, rootMargin: '0px 0px -25% 0px'`), indépendante de la hauteur.
La landing, dont les sections sont plus courtes, ne montrait pas le défaut :
l'ordre de ses 11 sections a été revérifié après le changement.

⚠️ **`blog_read_completed` ne suit pas le bas de page** mais un repère
`data-blog-fin` placé après le texte : le partage, le bloc auteur et le pied de
page viennent ensuite. C'est ce qui explique qu'historiquement il soit plus
fréquent que `depth: 100`.

**Un seul chunk, une seule requête.** Le code commun était d'abord extrait dans un
module partagé, ce qui faisait DEUX requêtes par page mesurée. Tout passe désormais
par `analytics-init.ts`. Coût mesuré sur un article (5 exécutions stables) :
**+47 ms de LCP, score Lighthouse identique (83), TBT nul**. ~2,6 Ko gzip, contre
98 Ko économisés en §9.p sur toutes les pages.

⚠️ **Erreur commise et corrigée** : `src/lib/analytics.ts` (le shim `trackEvent()`
des îlots React) a été écrasé par mégarde en créant le point d'entrée. Restauré
depuis git ; le nouveau module s'appelle `analytics-init.ts` précisément pour que
la confusion ne se reproduise pas.

**Cinq garde-fous ajoutés à `verify-site.mjs`**, tous validés par injection : les
8 sections du guide, les 10 rubriques de FAQ, `data-blog-total` sur l'index, et
sur **chacun des 38 articles** les métadonnées et le repère de fin. Le contrôle a
d'ailleurs attrapé son propre défaut à l'écriture — il comptait `/blog/index.html`
parmi les articles.

⚠️ **Non implémentés, délibérément** :
  - `landing_calendly_scheduled` (1 insight) — le widget Calendly a été retiré à la
    migration. Décision produit en attente : l'événement viendra avec le widget.
  - `landing_video_fallback_opened` (1 insight) — suppose une UI de repli qui
    n'existe pas ; la vidéo est un lecteur natif. Fabriquer l'événement sans le
    produit n'aurait aucun sens.

⚠️ `/guide-declarations/calculette` et `/blog/serie/*` téléchargent le module sans
rien émettre : le filtre de chargement est volontairement plus large que la liste
des pages mesurées, pour ne pas dupliquer la logique d'aiguillage à deux endroits.
2,6 Ko en cache immuable.

### 9.r Prise de rendez-vous : replacée là où le doute naît (août 2026)

⚠️ **Contrairement à ce que laissait entendre §9.p, Calendly n'avait jamais été
retiré.** Seul le *badge flottant* de la SPA source l'avait été. Deux liens
existaient toujours : dans `CtaBanner` (sous le bouton d'inscription du bandeau
milieu de page) et en bas de `/simulateur`, tous deux libellés « Réserve une démo
(10 min) ». Résultat mesuré : **`cta_demo_calendly`, zéro clic en 150 jours** — il
n'apparaît même pas dans la liste des CTA cliqués.

**Diagnostic.** Trois causes, aucune liée au produit :
  - **Position de repli.** Les deux liens étaient sous un bouton principal, à
    l'endroit que l'œil saute une fois le choix fait. Celui du bandeau était en
    plus dans la section la moins performante de la page (`cta_signup_cta_banner` :
    1 clic sur 126 visiteurs, contre 20 pour `cta_simulator`).
  - **Vocabulaire.** « Démo » appartient au langage éditeur. Les questions de FAQ
    les plus ouvertes ne demandent pas comment le produit marche mais s'il est
    *adapté à leur situation* (« adapté aux internes ? », 7 et 6 ouvertures).
  - **Promesse fausse.** Les liens annonçaient 10 minutes ; l'événement Calendly
    en dure **15**.

**Principe retenu** : une proposition d'appel s'affiche là où une question naît et
reste sans réponse — pas à côté d'un bouton d'achat. Le tunnel en désigne trois :

| Emplacement | Forme | La question |
|---|---|---|
| `pour_qui` (JourneySection) | une **ligne**, pas un bouton | « je ne suis dans aucun des 5 profils » |
| `simulateur_resultat` | carte, sous le résultat | « ce chiffre est-il juste pour moi ? » |
| `faq_accueil` | carte, fin de FAQ | « concrètement, ça donne quoi ? » |

La prominence suit le rôle : une phrase là où le doute naît, une vraie carte là où
le lecteur a épuisé l'auto-service. La section « Pour qui » garde donc **un seul**
bouton.

**Le message a changé de nature.** Il ne s'agit pas de montrer un produit mais
d'ouvrir le compte d'un confrère : « Ryan est médecin remplaçant […] en 15 minutes,
il t'ouvre son propre compte — son planning, ses contrats, ce qu'il lui reste
vraiment à la fin du mois ».

⚠️ Les exemples cités ont été choisis pour ne PAS exclure. Une première version
parlait de « rétrocessions » et de « 2035 » : un interne ne remplit pas de 2035
— il est salarié — et c'est précisément lui qui hésite le plus (« Hippodoc est-il
adapté aux internes ? » figure parmi les questions les plus ouvertes de la FAQ,
avec deux formulations quasi identiques). Le jargon fiscal disait « ce n'est pas
pour toi » à la personne même que la carte doit rassurer. Planning, contrats et
« ce qu'il lui reste à la fin du mois » couvrent l'interne comme l'installé, et
relèvent de trois registres différents : le quotidien, l'administratif, l'argent.

⚠️ Même logique pour la fin du message. Une version intermédiaire disait « puis il
regarde ta situation avec toi » — incohérence structurelle : la première moitié
promet de regarder par-dessus l'épaule d'un confrère (passif, sans enjeu), la
seconde demandait d'exposer la sienne (examiné, jugé). Pour un médecin en retard
sur ses déclarations, « ta situation » sonne comme un contrôle, et sous-entend
qu'il faut préparer un dossier avant un appel de 15 minutes. Remplacé par « et tu
lui poses tes questions. Rien à préparer. » : le visiteur redevient l'acteur.
La carte du simulateur portait le même défaut, en pire — la personne vient d'y
saisir ses vrais chiffres. Le bouton dit « Prendre 15 min avec Ryan » : on ne
réserve pas une démo à un confrère. Mention « en visio, ou il t'appelle » —
**la moitié des rendez-vous passés se sont faits par appel sortant**, pas en visio.

**Attribution.** Tous les liens portent `data-calendly="<emplacement>"`, ce qui leur
donne automatiquement la propagation des `utm_*` de la PREMIÈRE page vue de la
session (un rendez-vous pris par un visiteur venu de Meta reste rattaché à sa
campagne après plusieurs navigations) et l'émission de `calendly_clicked`.
`utm_content` porte l'emplacement : les trois seront comparables entre eux.

⚠️ `calendly_clicked` mesure l'**intention**, pas la réservation : celle-ci a lieu
sur calendly.com. Elle se réconcilie via l'API Calendly ou un webhook.

**Trois garde-fous** dans `verify-site.mjs`, validés par injection : tout lien
Calendly doit porter `data-calendly` (sans quoi il est muet), aucune durée annoncée
ne doit contredire l'événement réel, et un emplacement ne peut pas apparaître deux
fois sur une page — un doublon a bel et bien été introduit sur `/simulateur`
pendant ce chantier.

⚠️ Bug corrigé dans le contrôle lui-même : `matchAll` rend la correspondance
complète en position 0. Déstructurer `[balise, texte]` au lieu de `[, balise,
texte]` donnait à `texte` les attributs du lien — le contrôle de durée était muet
alors que les deux autres passaient par accident.

### 9.s Audit et refonte de la FAQ d'accueil (août 2026)

**Source unique.** Les questions vivaient en DOUBLE : une copie dans
`FaqSection.astro` pour l'affichage, une autre recopiée à la main dans
`index.astro` pour le JSON-LD `FAQPage`. Rien ne garantissait qu'elles restent
identiques — or Google exige que le schéma corresponde au texte visible. Les deux
dérivent désormais de `src/data/faqAccueil.ts`.

**Doublon interne, et une offre commerciale enterrée.** Deux questions se lisaient
presque pareil (« adapté aux internes et aux médecins qui débutent ? » / « adapté
aux internes en médecine ? ») alors que leurs réponses étaient *différentes* : la
première parlait RSPM et tarif, la seconde de gardes hospitalières, de frais réels
de stage — et se terminait par **le code promo INTERNE2026, 90 jours offerts**. Les
mesures montrent que les visiteurs ouvraient les deux (6 et 7 fois) : ils
cherchaient la même chose et lisaient deux fois. Les libellés ont été différenciés
pour que chacun annonce ce qu'il contient.

**Ordre revu selon la demande réelle.** La position pèse lourd sur le taux
d'ouverture (les trois premières récoltent 10, 8 et 8 ouvertures) ; or la question
« internes » était en 9ᵉ position alors qu'elle est la 4ᵉ la plus ouverte — les
gens descendaient la chercher. Elle passe en 4ᵉ.

**Question tarifs ajoutée.** Sur `/faq`, « tarifs » est la rubrique la plus ouverte
(7 fois). La FAQ d'accueil n'avait aucune question sur le prix.

**Maillage interne : 0 → 11 liens.** Dix réponses parlaient d'URSSAF, de CARMF, de
régime fiscal, de 2035, de RSPM, sans un seul lien vers les 38 articles du blog qui
traitent exactement ces sujets. C'était le principal gisement SEO de la page.

**Doublons avec `/faq` supprimés.** Deux questions y étaient reprises mot pour mot,
chaque page portant son `FAQPage`. Réécrites côté `/faq` dans le registre parlé qui
est le sien (« Je cumule libéral et salariat, Hippodoc suit les deux ? ») — la
formulation en langage de requête reste sur l'accueil, qui est la page de capture.

⚠️ **Identifiants d'instrumentation.** `data-ph` passe de `landing_faq_<n>` à
`landing_faq_<slug>`. La numérotation positionnelle rendait tout réordonnancement
destructeur : `landing_faq_9` aurait silencieusement changé de sens. Les événements
historiques gardent leur signification, la comparaison avant/après est rompue par
construction.

⚠️ **Sur la valeur SEO du schéma, une précision.** Google a supprimé les résultats
enrichis FAQ en août 2023, sauf pour les sites gouvernementaux et de santé faisant
autorité : le `FAQPage` ne produit donc probablement plus d'affichage enrichi ici.
La valeur restante est ailleurs — contenu de page, maillage interne, et moteurs de
réponse (le `robots.txt` accueille explicitement GPTBot, ClaudeBot et
PerplexityBot, et le site publie un `llms.txt`).

⚠️ **Aucun code promo n'est affiché sur le site public** (décision owner, août
2026). La réponse « internes » annonçait « INTERNE2026 : 90 jours offerts » alors
que la section tarifs de la MÊME page annonce un tarif interne réduit assorti de
30 jours d'essai : deux promesses différentes au même public, à quelques
centimètres l'une de l'autre. Le code est retiré ; la réponse renvoie désormais à
la section tarifs sans répéter le montant, qui n'y vit qu'à un seul endroit.
Un contrôle empêche qu'un code réapparaisse dans le contenu.

**Garde-fou ajouté** : toute question déclarée dans un `FAQPage` doit exister dans
le texte visible de la page.
⚠️ Ce contrôle a produit **16 faux positifs** sur `/guide-declarations` avant
d'être juste, en deux temps : d'abord parce que remplacer les balises par une
espace coupe les mots contenant du balisage interne, ensuite parce qu'Astro échappe
l'apostrophe en `&#x27;` (hexadécimal) et non `&#39;`. J'avais conclu à tort à une
violation Google sur cette page : **les 49 questions y sont bien toutes rendues**.

### 9.t Invitation à lire le film de présentation (août 2026)

**Le constat.** Sur 120 jours : **96 personnes voient la section vidéo, 9 lancent la
lecture — 9,4 %**, et 3 vont au bout. Ce n'est pas un problème de promesse : la
section annonce déjà « Hippodoc en 90 secondes », « Tu factures, Hippodoc calcule le
reste », et liste URSSAF/CARMF/impôts/Super-Net. Ce qui manquait, c'est
l'**invitation** : le lecteur natif dessine un bouton discret — un petit cercle gris
sur Safari mobile, majoritaire dans le trafic payant.

**Ajouté** : un vrai `<button>` de 80 px en dégradé hippo par-dessus le poster, avec
un badge **« 90 s »**. La durée figurait dans le titre mais pas là où la décision se
prend.

⚠️ **`preload="none"` est conservé** : aucun octet du mp4 (hébergé chez Supabase) ne
part avant le clic — vérifié, 0 requête. La contrepartie est un délai au démarrage,
d'où l'**état de chargement** : sans lui, le visiteur clique, ne voit rien, et croit
que c'est cassé. C'est peut-être là le vrai gain, plus que dans l'esthétique.

⚠️ **Les contrôles natifs sont retirés tant que l'invitation est affichée**, sinon
deux boutons de lecture coexistent et la barre de contrôle passe sous le badge. Ils
sont dans le HTML (le lecteur reste pleinement utilisable sans script) et rendus dès
que la lecture démarre — ou si elle échoue, pour ne laisser personne sans solution.

**Exception zéro-JS assumée**, au même titre que le micro-script du tiroir mobile :
aucun sélecteur CSS ne permet de savoir qu'une vidéo joue, donc « clic sur le bouton
→ lecture » est impossible sans script. Aucune dépendance, aucun asset, script
inline sous le kilooctet.

⚠️ **Deux pièges de la même famille, et le second est passé en production.**
`hidden` ne masque rien quand une classe déclare `display`. Le bouton porte la
classe Tailwind `flex` : son `display: flex` vient de la feuille de l'AUTEUR et
l'emporte sur le `display: none` que le navigateur applique à `[hidden]`. La
propriété passait bien à `true`, et le spinner restait à l'écran par-dessus la
vidéo en train de jouer. On masque donc par **style en ligne**, qui l'emporte sur
la classe.
Le test disait « invitation masquée : true » — il lisait la PROPRIÉTÉ, pas le
pixel. Les contrôles visuels vérifient désormais `getComputedStyle().display` et
la boîte englobante.

⚠️ Piège rencontré : **`hidden` est une propriété de `HTMLElement`, pas de
`SVGElement`**. Écrire `svg.hidden = false` crée une propriété fantôme sans retirer
l'attribut, et l'icône reste masquée par `[hidden] { display: none }`. On passe par
`setAttribute`/`removeAttribute`, qui fonctionnent sur les deux.

**Mesure inchangée** : l'instrumentation écoute les événements de l'élément `<video>`
(`play`, `pause`, `timeupdate`, `ended`, `error`), qui se déclenchent quelle que soit
la façon dont la lecture démarre. Vérifié : `landing_video_play` part bien via le
bouton maison. ⚠️ Ce qui casserait tout serait de remplacer le `<video>` par une
iframe YouTube ou Vimeo — les événements disparaîtraient.

**Budget** : LCP 6 179 ms, TBT 0, CLS 0, perf 67 — dans la fourchette des mesures
précédentes sur le même serveur de test, aucune régression.

**Pause au toucher.** Taper la vidéo ne la mettait pas en pause sur mobile — le
navigateur se contente d'y afficher la barre de contrôle (vérifié sur iPhone 14 et
Pixel 7). ⚠️ Un gestionnaire de clic naïf aurait cassé le desktop : le navigateur
y bascule DÉJÀ lecture/pause au clic sur l'image, si bien qu'un second
basculement l'aurait annulé. On ne prend donc en charge que les pointeurs
tactiles (`pointerup` avec `pointerType !== 'mouse'`), et le bas de l'image est
exclu — c'est là que vit la barre de contrôle, et un tap sur « pause » y aurait
été annulé par notre propre bascule.
Vérifié : tap → pause → tap → reprise sur les deux mobiles, un seul basculement à
la souris, aucun double effet sur la barre de contrôle.

**Garde-fou** : `preload="none"` sur le film de l'accueil, validé par injection.
La référence à battre est **9,4 %** (`landing_video_play` ÷
`landing_video_section_viewed`).

### 9.u Chiffres rafraîchis depuis la base et compteur animé (août 2026)

**Les chiffres viennent désormais de la base**, pas d'une reprise d'affichages
existants. Relevé le 15/08/2026 sur le projet Supabase « Hippodoc - SAAS FINANCE »
(`count(*)`, donc reproductible) :

| Tuile | Affiché | Réel | Table |
|---|---|---|---|
| Journées enregistrées | 17 756 | **19 400** | `remplacements` |
| Lieux d'exercice référencés | 1 437 | **2 379** | `medecins_remplaces` |
| Documents générés | 352 | **623** | `documents` + `factures` + `contrats` |

Soit **+9 %, +66 % et +77 %** — l'activité réelle dépassait largement ce qui était
affiché. Aucun chiffre n'est inventé : chacun se revérifie d'un `count(*)`.

⚠️ **« 900+ médecins inscrits » reste au-dessus du réel** (789 profils). Ce chiffre
est repris tel quel du Hero et du CtaBanner ; le corriger demande une décision de
l'owner, qui ne l'a pas tranchée. C'est le seul écart connu de cette section.

⚠️ **« 100 % · Données hébergées en France »** — vérification faite, les trois
projets Supabase sont en `eu-west-3` (**Paris**), sauf `hippobi` en `eu-west-1`
(Irlande) ; PostHog annonce des serveurs UE et Royaume-Uni dans la politique de
confidentialité. La mention est donc juste pour les données opérationnelles, mais
le « 100 % » ne l'est pas. Les pages `/rgpd` et `/politique-confidentialite`
disent d'ailleurs « Union européenne », pas « France » : les pages marketing les
contredisent en quatre endroits. Non tranché, signalé à l'owner.

**Compteur animé.** ⚠️ Le nombre FINAL est écrit dans le HTML ; le script ne fait
qu'animer l'affichage puis **restaure la chaîne exacte** rendue au build. Une
implémentation partant de zéro dans le HTML aurait fait lire « 0 » à tous les
robots qui n'exécutent pas le JS — GPTBot, ClaudeBot et PerplexityBot, que le
`robots.txt` accueille explicitement.

Trois précautions, mesurées et non supposées :
  - `prefers-reduced-motion` : aucune animation, valeurs finales d'emblée ;
  - `tabular-nums` + grille à colonnes fixes : **CLS 0,0016**, largeurs de tuiles
    identiques pendant toute l'animation ;
  - `IntersectionObserver` : l'animation ne part qu'à l'entrée dans l'écran.

**Exception zéro-JS assumée — la troisième, et la seule DÉCORATIVE.** Les deux
autres (tiroir mobile, bouton de lecture) réglaient un problème mesuré. Celle-ci
est esthétique, et le rendu sans JS reste correct puisque les valeurs finales sont
déjà dans le HTML. Budget : TBT 0, CLS 0, perf 69, accessibilité 100.

**Garde-fou** : la valeur rendue et `data-compteur` doivent porter les mêmes
chiffres, sinon le compteur monte vers un nombre puis saute sur un autre. Validé
par injection.

### 9.v Espacement perdu autour d'un îlot Astro (août 2026)

Sur `/simulateur`, le sélecteur « Partir d'un profil type » **collait à la carte du
titre** — 0 px d'écart, mesuré sur desktop comme sur mobile.

**La cause n'est pas une marge oubliée, mais une marge qui tombe dans le vide.** Le
conteneur espace ses enfants avec `space-y-8`, qui pose une `margin-top` sur chacun
sauf le premier. Or ses deux enfants suivants ne peuvent pas la porter :
  - le `<h2 class="sr-only">` est en **position absolue** — hors du flux ;
  - l'`<astro-island>` est en **`display: contents`** — il n'a aucune boîte, donc
    aucune marge n'est rendue.

L'espacement était bien déclaré ; il n'avait simplement aucun support. Corrigé en
enveloppant le titre et l'îlot dans un `<div>` — un enfant normal, qui reçoit la
marge et la restitue. 0 → **32 px**, conforme au rythme de la page.

⚠️ Piège à retenir : **un îlot Astro ne peut pas recevoir d'espacement de son
parent**. Tout `space-y-*` / `gap` appliqué à un conteneur dont un enfant direct
est un îlot perdra cet espacement en silence. Vérifié sur les autres pages à
îlots (`/guide-declarations`, `/guide-declarations/calculette`, articles de blog) :
aucune n'a d'îlot en enfant direct d'un conteneur `space-y-*`, le défaut était
isolé.

### 9.w Bandeau cookies compacté (août 2026)

**Le défaut, mesuré.** Sur un iPhone 14, l'ancien bandeau faisait **266 px de haut,
soit 40 % du premier écran**, et **recouvrait le CTA principal du hero** — le bouton
« Commencer l'essai gratuit » était physiquement masqué, et l'élément le plus
visible de tout le premier écran était « Accepter tous ». Sur du trafic payant, la
première action demandée était donc un choix de cookies posé par-dessus l'offre.

**Trois décisions pour compacter sans rien perdre :**
  - texte ramené de **40 à 12 mots**, les FINALITÉS restant nommées (mesure
    d'audience, publicité Google/Meta) comme l'exige la CNIL — et **ajout d'un lien
    vers la politique de confidentialité, qui n'existait pas** ;
  - les deux boutons passent **côte à côte** au lieu d'être empilés ;
  - **la croix de fermeture est retirée** : elle portait déjà
    `data-cookie-action="essential"`, donc elle faisait exactement la même chose que
    « Tout refuser », en moins explicite, et coûtait une ligne entière.

Libellés passés à « Tout refuser » / « Tout accepter » — symétriques, sans
ambiguïté. **Refuser reste aussi simple qu'accepter** : mêmes dimensions mesurées
(168×44 px), même forme, un seul appui.

**Résultat : 266 → 115 px** (40 % → 14-17 % de l'écran).

⚠️ **Validé contre les largeurs RÉELLEMENT observées** chez les visiteurs, et non
contre des tailles théoriques : 402 (174 personnes), 393 (136), 390 (122), 360 (94),
430 (68), 384 et 375 (52 chacune). **Le CTA principal est dégagé sur les sept.**
Aucun visiteur en 320 px sur 60 jours — inutile d'y sacrifier le design.

⚠️ Sur le seul écran de 640 px de haut (360×640, 94 personnes), le **lien secondaire**
vers le simulateur reste couvert de 59 px. Le hero y est simplement plus haut que
l'espace disponible ; aucun bandeau bas ne peut le dégager sans disparaître. Le CTA
principal, lui, est visible.

⚠️ Piège rencontré **pour la troisième fois** dans ce chantier : un retour à la ligne
entre du texte et une balise est absorbé à la compilation. « fonctionne sans.En
savoir plus » — corrigé par `{' '}`. Vu à l'écran, pas à la relecture.

⚠️ **Conflit avec le tiroir de menu mobile, corrigé au passage.** Les deux sont en
`z-50` : le bandeau recouvrait le bas du menu ouvert — « Qui sommes-nous ? »,
« Connexion » et « Essai gratuit » disparaissaient derrière. Défaut préexistant, et
pire avant (l'ancien bandeau faisait 266 px). Le bandeau s'efface désormais tant que
le tiroir est ouvert : quelqu'un qui ouvre le menu navigue, il ne décide pas de ses
cookies. `:has()` est nécessaire car la case du tiroir vit dans le `<header>` et le
bandeau plus loin dans le `<body>` — aucun sélecteur de voisinage ne les relie. Sur
un navigateur sans `:has()`, la règle est ignorée et le comportement reste celui
d'avant : dégradation propre.

Mécanique de consentement inchangée et revérifiée : l'événement
`hippodoc:consent-changed` part avec la bonne valeur, `localStorage` est écrit, le
bandeau se masque, et le choix est mémorisé d'une page à l'autre.

**Audit mobile de bout en bout** — situations éprouvées, toutes mesurées :
  - **paysage** (844×390, 667×375, 640×360) : bandeau 93 px, aucun débordement ;
  - **zoom texte 200 %** : aucun débordement, aucun texte tronqué, boutons à 88 px ;
  - **`localStorage` bloqué** (navigation privée, WebView verrouillée) : le bandeau
    s'affiche, le refus fonctionne, **aucune erreur de page** ;
  - **clavier** : 3 éléments atteignables dans l'ordre logique, `aria-modal="false"`
    donc pas de piège au focus ;
  - **contrastes** : texte 5,06:1 · lien 5,15:1 · bouton refuser 17,87:1 (seuil 4,5) ;
  - **autres pages** : `/simulateur`, `/tarifs` et les articles restent dégagés ;
    sur `/faq` la première question est recouverte de 27 px sur 80 — le libellé
    reste lisible, et un bandeau bas recouvre par nature les 115 derniers pixels ;
  - **parcours complet de la landing** : 0 débordement à toutes les hauteurs,
    10 sections, compteurs corrects, vidéo et liens Calendly intacts, aucune erreur.

⚠️ **En paysage sur les écrans courts** (375 et 360 de haut), le CTA reste masqué :
le hero y occupe toute la hauteur disponible. Non corrigeable par le bandeau.

### 9.x Consentement partagé entre www et app (août 2026)

**Le défaut, structurel.** Le choix n'était écrit que dans
`localStorage['cookie-consent']`, or **`localStorage` est cloisonné par origine** :
`app.hippodoc.fr` ne pouvait pas le lire. Depuis la séparation des domaines, un
visiteur qui acceptait sur le site public revoyait donc la bannière de l'app.
Aucun réglage ne corrige cela — c'est une propriété du stockage.

Ironie révélatrice, mesurée : **PostHog posait déjà son cookie sur `.hippodoc.fr`**
(`cross_subdomain_cookie: true`), partagé entre les deux sous-domaines. Le traceur
était partagé, la permission qui le gouverne ne l'était pas.

**Correctif** — le choix est désormais aussi écrit dans un cookie sur le domaine
parent, seul support lisible des deux côtés :

| | |
|---|---|
| Nom | `hippodoc-consent` |
| Domaine | `.hippodoc.fr` |
| Valeurs | `accepted` \| `essential-only` |
| Durée | 182 jours (~6 mois) |
| Attributs | `path=/`, `SameSite=Lax`, `Secure` en HTTPS |

À la lecture, **le cookie fait foi** ; `localStorage` reste en repli pour les
visiteurs ayant choisi avant cette version. Ce cookie n'exige pas de consentement :
il sert précisément à respecter celui de l'utilisateur.

⚠️ **Le domaine est DÉRIVÉ de l'hôte, jamais codé en dur.** Première version avec
`domain=.hippodoc.fr` en dur : le navigateur **rejette** un cookie dont le domaine
ne correspond pas à l'hôte courant, si bien qu'aucun cookie n'était posé en local
NI sur les previews Vercel — le choix n'y était jamais mémorisé. Sur `hippodoc.fr`
on vise le domaine parent ; ailleurs, cookie d'hôte.

⚠️ **Le site public ne peut faire que la moitié du chemin.** Pour que la bannière
de l'app disparaisse, il faut que `app.hippodoc.fr` lise ce cookie au démarrage et
court-circuite sa propre bannière — et, idéalement, l'écrive aussi pour que le
partage fonctionne dans les deux sens. Ce partage n'est légitime que si les
FINALITÉS sont identiques des deux côtés ; si l'app dépose des cookies pour
d'autres usages, sa bannière doit continuer à les demander.

**Texte du bandeau.** Repris sur la formulation attendue par les utilisateurs
(« En acceptant, vous autorisez… ») plutôt que sur l'étiquette technique
précédente. ⚠️ « améliorer la navigation sur le site » a été écarté : cela décrit
des cookies fonctionnels, or il n'y a ici que de la mesure et du marketing —
annoncer une finalité inexistante est précisément ce que la CNIL sanctionne.
Les noms des régies (Google, Meta) descendent au second niveau, dans la politique
de confidentialité : la CNIL exige les finalités en premier niveau, l'identité des
tiers peut suivre. Mesuré : les nommer dans le bandeau ajoutait une troisième ligne
et **remasquait le CTA sur les écrans de 640 px** (94 visiteurs). Le vouvoiement est
conservé, comme l'ancien titre « Nous respectons votre vie privée ».

### 9.y Consentement : lecture unique et retrait effectif (août 2026)

Contrôle demandé après §9.x — « Tout refuser » n'a-t-il pas cassé la mesure ?
**Non** : le libellé seul a changé. « Essentiels uniquement » et « Tout refuser »
portent le même `data-cookie-action="essential"` et écrivent la même valeur
`essential-only`. Mesuré, en refus : **16 événements PostHog envoyés**, dont les
cinq `landing_*`, `$pageview`, `$autocapture`, `$$heatmap` et `$web_vitals` —
autant qu'en acceptation. Seule différence : pas de cookie `ph_…`, donc pas
d'identité persistée d'une page à l'autre. C'est le comportement voulu.

La vérification a en revanche exposé **trois défauts réels**, dont deux
antérieurs.

**1. Deux lecteurs du consentement en désaccord** (introduit par §9.x).
`ThirdPartyScripts` lisait le cookie ; `PostHog.astro` lisait le seul
`localStorage`. Un visiteur ayant accepté sur `app.hippodoc.fr` arrivait donc ici
sans bannière (cookie lu), GA4 et le Pixel actifs — mais PostHog en mode mémoire,
`localStorage` étant vide côté www. Consentement donné, identité jamais persistée,
chaque page comptée comme un nouveau visiteur, et **aucun moyen de le rattraper**
puisque la bannière ne réapparaissait plus.
⚠️ Le défaut était invisible à la lecture : les deux fichiers étaient corrects
séparément, c'est leur DÉSACCORD qui cassait la mesure. `ThirdPartyScripts` expose
désormais `window.hippodocConsent`, seule fonction de lecture (l'ordre est garanti :
il est `is:inline`, PostHog est un module donc différé). Garde-fou `verify-site`
§4 undecies, validé par injection du défaut.

**2. Le retrait du consentement ne retirait rien** (antérieur).
Après « Tout accepter » puis retour arrière via « Préférences cookies », `_ga`,
`_ga_<ID>` et `_fbp` survivaient au choix ET au rechargement : l'identifiant
publicitaire Meta restait sur l'appareil pour trois mois. Un consentement qu'on ne
peut pas retirer dans les faits n'en est pas un. Les cookies sont maintenant
effacés au retrait.
⚠️ **Révoquer AVANT d'effacer.** `consent update` n'était envoyé que vers
« granted » : GA4 restait autorisé dans la page en cours et réécrivait `_ga_<ID>`
juste après l'effacement — le cookie semblait parti, puis réapparaissait au
rechargement. Vérifié à côté : sous `essential-only`, GA4 ne pose spontanément
aucun cookie, même après 15 s. Seule la mesure a montré cet aller-retour.
⚠️ Un cookie ne s'efface qu'en rejouant **exactement** son couple domaine/chemin ;
GA4 posant `_ga` sur le domaine parent, l'effacement boucle sur les variantes.

**3. Crisp posait un cookie sans consentement** (antérieur, corrigé).
`crisp-client/session/<id>` était écrit dès la première interaction — défilement
compris — quel que soit le choix, y compris avant tout choix. Aucun consentement ne
le couvrait, et aucune exemption non plus : le visiteur n'avait rien demandé.

Le chargement automatique est remplacé par une **bulle statique que nous
possédons** (`#crisp-launcher`). Crisp n'est injecté qu'au clic : le chat devient
alors un « service explicitement demandé par l'utilisateur », que la CNIL dispense
de consentement. `$crisp.push(['do','chat:open'])` est empilé AVANT l'injection —
la file étant rejouée au chargement, un seul clic ouvre la conversation, là où deux
seraient sinon nécessaires. Notre bulle s'efface à l'ouverture, Crisp affichant la
sienne.

Mesuré : **0 requête et 0 cookie Crisp** dans les trois états de consentement tant
qu'on ne clique pas ; au clic, 21 requêtes, widget monté, `chat:opened` vrai.
Effet de bord bienvenu avant la campagne payante : `l.js` ne part plus pour la
quasi-totalité des visiteurs.

⚠️ **`hidden` seul ne masque pas la bulle** : sa classe `.flex` vient de la feuille
d'auteur et bat le `[hidden] { display: none }` du navigateur. Sans la règle d'ID
`#crisp-launcher[hidden]` (spécificité 1,1,0 contre 0,1,0), un visiteur sans
JavaScript voyait une bulle parfaitement visible et parfaitement morte. **Le même
piège avait déjà atteint la production sur le bouton de lecture du film** — d'où un
garde-fou dédié dans `verify-site`.

La bulle s'efface tant que la bannière cookies est affichée (sur 390 px la bannière
occupe 366 px : la bulle se posait dessus) et tant que le tiroir de menu est ouvert.
Vérifié : aucun CTA du premier écran recouvert, 56×56 px, focusable en dernier dans
l'ordre de tabulation, contraste 3,37:1 au pire point du dégradé (seuil 3:1 pour un
élément graphique).

### 9.z Contexte des événements de consentement, et cibles tactiles (août 2026)

**Contexte manquant, mesuré en production.** Les `cookie_consent_granted` /
`cookie_consent_denied` arrivaient depuis `www` **sans aucune propriété de
contexte** — 188 événements vérifiés ligne à ligne : ni `deployment_env`, ni
`device_type`, ni `app_version`, ni `utm_*`. Cause : ils étaient émis par
`posthog.capture()` en direct, hors de `creerEmetteur`. Régression née à la
migration — l'ancienne SPA posait ce contexte en propriétés globales, le portage
l'a rattaché à chaque événement, et ces deux-là sont passés à travers.

Deux conséquences concrètes, l'une et l'autre vérifiées : le trafic de test local
ne pouvait pas en être écarté (c'est `deployment_env` qui sert à cela), et le taux
de refus n'était comparable ni par appareil ni par campagne — or il **borne tout ce
que l'on mesure en aval**. Le défaut a été trouvé pendant que la campagne Meta
tournait déjà.

⚠️ `creerEmetteur` est désormais **mémoïsé**, et ce n'est pas une optimisation :
`contexteSession()` INCRÉMENTE `session_pageview_count` à chaque appel. Avec deux
appelants par page (PostHog.astro et analytics-init) et aucun ordre garanti entre
eux, sans mémoïsation une seule page en aurait compté deux. Vérifié : le compteur
vaut 1 sur tous les événements, y compris sur les pages non mesurées.
Garde-fou `verify-site` §4 terdecies.

**Audit mobile.** 56 pages × 4 largeurs réellement observées (360/375/390/430) :
**0 débordement horizontal, 0 erreur console**. Toutes les pages mesurées émettent
leurs événements sur iPhone, y compris en WebView Instagram, sur Android, à 360 px,
**stockage bloqué (navigation privée)** et avec les UTM de campagne. Sans
`IntersectionObserver`, la mesure se dégrade proprement : `landing_viewed` et
`landing_scroll_depth` continuent, les événements de section sont perdus, aucune
erreur.

⚠️ Deux pièges de méthode rencontrés, notés parce qu'ils font conclure à l'envers :
posthog-js poste `{api_key, batch:[…]}` — un parseur qui ne descend pas dans
`batch` retombe sur une regex, rend des propriétés VIDES, et fait passer chaque
page pour cassée ; et le contrôle de contexte ne vaut que pour NOS événements,
`$pageview` / `$autocapture` / `$$heatmap` / `$web_vitals` étant produits par
posthog-js lui-même et n'ayant jamais porté ce contexte.

**Cibles tactiles (WCAG 2.5.8).** Les déclencheurs d'aide de la calculette (14×14)
et les icônes LinkedIn (20×20) passent à ≥24 px via `p-1.5 -m-1.5` : la marge
négative compense exactement le rembourrage, donc **aucun déplacement**.
Les cases `sr-only` qui pilotent le tiroir et les radios ne sont PAS des cibles —
le label l'est ; les compter noyait le signal sur 50 pages.

Reste à faire : liens de texte à 16–21 px de haut sur `/essai` (7, pied de page),
`/guide-declarations` (~995, glossaire et FAQ) et le lien de retour de la
calculette. Antérieurs, hors landing, et corriger le guide reviendrait à changer
son interlignage — décision de design non prise.

### 9.aa Mesure d'audience sous exemption CNIL (août 2026)

**Le manque, chiffré.** PostHog n'était persisté qu'après acceptation du bandeau.
Mesuré sur 14 jours de production : **42 % acceptent**. Les 58 % restants
tournaient donc en `memory`, où chaque page rechargée crée une nouvelle personne
anonyme — ni tunnel multi-pages, ni visiteur récurrent, ni conversion rattachable
à sa campagne au-delà de la première page. Sur 7 jours : 31 « personnes » pour
35 sessions, des identités en miettes.

**La réponse est légale, et plus large que le problème.** L'article 82 de la loi
Informatique et Libertés dispense de consentement les traceurs de MESURE
D'AUDIENCE, à conditions strictes. PostHog les remplit :

| Condition CNIL | État |
|---|---|
| Finalité limitée à la mesure d'audience | ✓ jamais utilisée pour la publicité |
| Pas de suivi inter-sites | ✓ first-party via `t.hippodoc.fr` |
| Aucune transmission à un tiers | ✓ PostHog sous-traitant, hébergement UE |
| Pas d'enregistrement de session | ✓ client ET projet |
| Pas de heatmap ni dead-click | ✓ client ET projet |
| IP non conservée | ✓ `anonymize_ips` (réglage projet) |
| Cookie ≤ 13 mois | ✓ `cookie_expiration: 395` |
| Information et droit d'opposition | ✓ `/politique-confidentialite` §8.3 |

⚠️ **Les réglages PROJET l'emportent sur la configuration client.** Régler
`capture_heatmaps` et `capture_dead_clicks` dans `posthog.init()` ne suffit pas —
c'était déjà noté pour `capture_dead_clicks`, « essayé, sans effet ». Il faut
couper `heatmaps_opt_in` et `capture_dead_clicks` côté projet. Idem pour
`session_recording_opt_in`, qui était **encore activé** : seul le drapeau client
l'empêchait, un oubli en aurait suffi à relancer l'enregistrement d'écran.

⚠️ **Le bandeau ne gouverne plus que la publicité** (GA4, Meta Pixel), qu'aucune
exemption ne couvre. Texte adapté en conséquence : « En acceptant, vous autorisez
des cookies publicitaires (Google, Meta). » — 115 px, CTA dégagé de 360 à 390 px.
Ne JAMAIS refaire dépendre la mesure du choix publicitaire : c'est exactement ce
qui coûtait 58 % de la mesure. Garde-fou `verify-site` §4 quaterdecies.

⚠️ **`opt_out_capturing_by_default` ne suffit pas à l'opposition.** Vérifié : il
empêche bien tout envoi (0 événement sur contexte vierge), mais posthog-js écrit
QUAND MÊME son cookie d'identité. La page aurait annoncé « plus aucune donnée
collectée » en laissant un identifiant persistant sur l'appareil. D'où
`persistence: 'memory'` en cas d'opposition, plus un effacement explicite du
cookie `ph_<clé>_posthog` — dont le nom dépend de la clé projet, et qui est posé
sur le domaine parent : il faut rejouer ce domaine pour l'effacer.

Reste à faire : `event_retention_months` vaut **84** (7 ans) sur le projet. Les
lignes directrices CNIL plafonnent à 25 mois les statistiques issues de la mesure
d'audience exemptée. Non modifié — abaisser la rétention SUPPRIME des données de
façon irréversible, ce n'est pas une décision à prendre sans arbitrage explicite.

### 9.ab Attribution de premier contact (août 2026)

**Le trou, mesuré.** Sur 164 personnes identifiées, **zéro** portait sa campagne
d'origine (`$initial_utm_source` vide pour toutes). Impossible de répondre à
« quelle publicité a produit ce client ».

Cause : avec `person_profiles: 'identified_only'`, PostHog ne crée le profil qu'à
l'inscription et y écrit les `$initial_*` de CE moment-là — donc ceux de
`app.hippodoc.fr`. La campagne Meta se perdait entre la landing et la création de
compte. Le recollage anonyme → client fonctionnait pourtant : 22 personnes
identifiées ont `app.hippodoc.fr` en première page avec `www.hippodoc.fr` en
référent. C'est l'ORIGINE de l'acquisition qui manquait, pas le lien.

**Correctif** : `register_once` au chargement, sur toutes les pages publiques.
Les propriétés super sont stockées dans la persistance de PostHog — donc, avec
`cross_subdomain_cookie`, sur `.hippodoc.fr` — et rattachées à tous les
événements suivants, **y compris ceux émis par l'app après l'inscription**.

> ⚠️ **Corrigé au § 9.bf (23 septembre 2026)** : la phrase ci-dessus était
> inexacte jusque-là. Le cookie `.hippodoc.fr` ne recevait que 7 clés internes de
> posthog-js ; les `hd_*` restaient dans le localStorage de www et n'atteignaient
> jamais l'app. Elles y passent désormais via `cookie_persisted_properties`.

| Propriété | Contenu |
|---|---|
| `hd_premiere_source` | `utm_source`, sinon `meta` si `fbclid`, `google` si `gclid`, sinon le référent externe, sinon `direct` |
| `hd_premiere_campagne` / `_contenu` / `_support` / `_terme` | les `utm_*` correspondants |
| `hd_premiere_page`, `hd_premier_referent`, `hd_premier_appareil` | contexte d'arrivée |

⚠️ Préfixe `hd_` volontaire : ne JAMAIS réutiliser les noms `$initial_*` que
PostHog gère lui-même — deux sources de vérité homonymes seraient pires que pas
de donnée.

⚠️ `register_once` et non `register` : un second passage ne doit pas écraser le
premier contact, c'est la définition même de l'attribution d'acquisition.
Vérifié : arrivée via Meta, puis `/tarifs` sans UTM, puis retour via
`google/AUTRE` → la source reste `meta / HIPPODOC-PROSPECTION`.

⚠️ Un référent interne (`hippodoc.fr`) est une navigation, pas une acquisition :
il est écarté, sans quoi tout le monde finirait attribué à son propre site.

⚠️ Sans effet en cas d'opposition à la mesure : la persistance est alors en
mémoire et rien n'est écrit sur l'appareil. C'est voulu.

### 9.ac Balises de recherche des pages qui reçoivent des impressions (août 2026)

Audit croisé de l'export Search Console « Performances » (3 mois : 1 034 clics,
9 068 impressions) et du build. Constat : **96 % des clics viennent de requêtes
de marque** ; les articles cumulent 3 171 impressions pour 59 clics, soit un CTR
de **1,9 %** là où 5 à 8 % serait banal aux positions occupées. Le site est vu et
n'est pas cliqué.

Diagnostic du mécanisme, par comparaison interne : les titres qui convertissent
contiennent le terme exact recherché et annoncent un livrable
(`remplir-declaration-2035` → 9,9 % de CTR ; `medecin-outre-mer-avantages-fiscaux`,
dont la description énumère LODEOM, ZFANG, abattement IR → 15,4 %). Ceux qui ne
convertissent pas sont écrits comme de la communication de marque, au tutoiement
promotionnel, sans le terme recherché.

⚠️ **Seuls `title` et `description` changent. Aucune ligne du corps des articles
n'est touchée.** Les descriptions ci-dessous ne promettent que du contenu déjà
présent dans la page — chaque article a été relu avant rédaction, une description
qui sur-promet dégraderait le rebond puis le classement.

⚠️ **Budget de 44 caractères pour un `title` d'article**, et non 60 :
`src/pages/blog/[slug].astro` construit `<title>` avec `${title} | Blog Hippodoc`,
soit 16 caractères de suffixe. Le `title` du frontmatter sert aussi de `h1`, donc
il doit se lire comme un intertitre autant que comme un résultat de recherche.

| Page | Avant | Après | Mesure d'origine |
| --- | --- | --- | --- |
| `obtenir-sa-licence-de-remplacement` | Obtenir ta licence de remplacement | Licence de remplacement pour interne | 850 impr, 6 clics, 0,7 %, pos. 6,5 |
| `regime-fiscal-micro-bnc-vs-reel` | Le Régime Fiscal : Micro-BNC vs Régime Réel | Micro-BNC ou réel : le choix du remplaçant | 490 impr, 2 clics, 0,4 % |
| `outils-numeriques-indispensables-cabinet` | Le kit numérique du cabinet médical | 15 outils numériques du médecin généraliste | 458 impr, 3 clics, 0,7 % |
| `checklist-administrative-medecin-remplacant` | Checklist Administrative du médecin remplaçant | Checklist administrative du remplaçant | 433 impr, 5 clics, 1,2 % |

Descriptions d'origine, pour révocation éventuelle :

- licence : « Interne en médecine ? Toutes les infos indispensables pour obtenir
  facilement ta licence de remplacement et te lancer. »
- micro-BNC : « Découvre comment choisir facilement le régime fiscal qui convient
  à ta situation de médecin remplaçant : Micro-BNC simplifié ou Régime Réel optimisé. »
- outils : « Tu démarres en médecine générale ? La sélection d'outils numériques
  préférés chez Hippodoc pour exercer avec confiance. »
- checklist : « Tu as enfin trouvé ton remplacement idéal ! Découvre la checklist
  administrative complète pour démarrer sereinement ton activité de médecin remplaçant. »

⚠️ « interne » entre dans le titre de la fiche licence parce que c'est la
variante de requête qui porte le plus d'impressions — *licence de remplacement
interne*, 72 impressions en position 12,1 et **zéro clic**. Le mot n'était présent
ni dans le titre ni dans le `h1`. La grappe complète (4 variantes, 146 impressions,
0 clic) est couverte par ce seul ajout.

⚠️ « 15 outils » est un décompte vérifié dans l'article (hors Hippodoc), pas une
approximation : un chiffre faux dans un titre est une promesse non tenue. Les 15
sont Notaview, Ordotype, Medg, KitMédical, RecoMédicales, Antibioclic, Posos,
Synapse Medicine, BioMG, ThyroCheck, Psychiaclic, Sporticlic, Pap-Pediatrie,
Lecrat, Omnidoc.

⚠️ **Défaut trouvé à la relecture, corrigé avant publication.** La première
version de cette description annonçait « 15 outils *testés en consultation* ».
L'article ne revendique nulle part un test : il parle de « la sélection
incontournable des outils numériques *préférés chez Hippodoc* ». Le mot « testés »
n'existait que dans ma description. Corrigé en « la sélection d'outils préférée
chez Hippodoc ». C'est exactement le sur-engagement que cette passe s'interdit :
une description qui promet plus que la page dégrade le rebond, donc le classement.

Deux ajustements annexes, même passe :

- `/comparatif` — titre ramené de **73 à 51 caractères**. Au-delà de ~60, Google
  tronque et « Médecin libéral 2026 », qui porte la requête, disparaissait de
  l'aperçu. Hiway Care sort du titre, reste dans la description et dans la page.
  Supprime le dernier avertissement de `verify-site.mjs`.
- `/blog` — description portée de **103 à 159 caractères**. Sous ~120, Google
  complète l'aperçu par un extrait de son choix. Les thèmes cités correspondent à
  la couverture réelle des 38 articles.

Vérifié : `npm run build` (56 pages) puis `node scripts/verify-site.mjs` — titres
et descriptions uniques, 1 `h1` par page, 3 449 liens internes sans lien mort, plus
aucun avertissement de titre long. Aucune référence en dur aux anciens titres
ailleurs dans le dépôt.

**À mesurer** : CTR de ces pages dans Search Console à 3 et 6 semaines. C'est la
seule façon de savoir si l'hypothèse tient. Un changement de titre peut faire
osciller le classement deux à trois semaines ; sur des pages à 0,4-1,2 % de CTR,
il n'y a presque rien à perdre. Réversible par `git revert`, valeurs d'origine
ci-dessus.

### 9.ad Maillage contextuel vers /comparatif (août 2026)

Suite de l'audit § 9.ac. `/comparatif` était la seule page indexable du site à
n'avoir **aucun lien contextuel entrant** — atteignable uniquement par la
navigation, que Google pondère nettement moins qu'un lien dans le corps d'un
texte — et **zéro impression sur trois mois**, alors que c'est la page la plus
proche de l'achat. Pour comparaison : `/simulateur` et `/tarifs` reçoivent
41 liens éditoriaux entrants chacune.

Quatre liens ajoutés, un par article, placés là où la question se pose vraiment
et non en fin de texte :

| Article hôte | Ancrage | Ancre |
| --- | --- | --- |
| `outils-numeriques-indispensables-cabinet` | après la dernière section clinique : l'article couvre les outils de soin, aucun de gestion | comparatif des outils de gestion pour médecin libéral |
| `maitrise-ton-logiciel-metier-en-30-min` | l'article traite du logiciel **du cabinet**, pas de l'outil du remplaçant — la distinction méritait d'être faite | comparatif des outils de gestion |
| `choix-mode-exercice` | le passage sur l'exercice mixte, où deux sources se déclarent | comparatif des outils de gestion pour médecin libéral |
| `regime-fiscal-micro-bnc-vs-reel` | la section conseils, qui recommande déjà l'expert-comptable | comparatif Indy, Pennylane et Hippodoc |

⚠️ **Ancres volontairement variées** : quatre liens portant exactement la même
ancre vers une page commerciale est un motif de sur-optimisation. Chaque ancre
reste descriptive, aucune n'est un « cliquez ici ».

⚠️ **Une seule occurrence par article.** Le maillage général était déjà sain
(médiane de 6 liens entrants par article, aucun lien mort sur 3 449). Multiplier
les liens aurait dilué le signal au lieu de le renforcer.

⚠️ Chaque insertion crée un `h2`. Vérifié que cela ne déclenche aucun sommaire :
le seuil de `[slug].astro` est `nbMots >= 1200 && h2 >= 8`, et les quatre articles
plafonnent à 576 mots après ajout. Aucun changement de mise en page.

Vérifié : build 56 pages ; `verify-site.mjs` — 3 453 liens internes (contre 3 449),
aucun mort ; `/comparatif` sort de la liste des orphelines éditoriales, où ne
restent que `/mentions-legales` et `/conditions-utilisations`, ce qui est normal.

**À mesurer** : apparition de `/comparatif` dans les impressions Search Console.
Elle est aujourd'hui à zéro ; tout ce qui dépasse zéro valide le geste.

### 9.ae Données structurées de /simulateur (août 2026)

Suite de l'audit § 9.ac / § 9.ad. `/simulateur` reçoit **41 liens internes** — à
égalité avec `/tarifs` pour la page la mieux maillée du site — et **zéro
impression de recherche sur trois mois**. Elle ne déclarait que le schéma
`Organization` injecté globalement par `BaseLayout`, alors que l'outil jumeau
`/guide-declarations/calculette` porte `WebApplication + FAQPage + BreadcrumbList`.

⚠️ **Écart assumé à la parité de migration.** L'en-tête du fichier documentait le
choix inverse : « Pas de JSON-LD sur cette page (parité avec la SPA source) ».
Ce n'était donc pas un oubli. L'audit l'avait d'abord qualifié d'incohérence, à
tort. La parité avec une SPA qui ne se référençait pas ne justifie plus de priver
la page de balisage ; le commentaire d'en-tête est mis à jour en conséquence.

Ajoutés : `WebApplication` (catégorie `FinanceApplication`, offre à 0 €),
`FAQPage` (5 questions) et `BreadcrumbList` (Accueil → Simulateur).

⚠️ **Un `FAQPage` dont les questions ne sont pas visibles enfreint les consignes
Google.** Les 5 questions sont donc rendues sur la page, en `<details>/<summary>`
natifs — jamais Radix, qui ne livre pas le contenu fermé au HTML statique. Motif
et classes repris à l'identique de `calculette.astro`, dont la conformité a été
vérifiée au préalable (7 questions balisées, 7 visibles).

⚠️ **Aucune réponse n'invente de contenu.** Les 5 réponses reformulent du texte
déjà présent sur la page : le glossaire « Trois mots à connaître » pour le
Super-Net, le guide d'utilisation pour la CARMF, le seuil RSPM/PAMC à 38 000 € et
l'abattement Micro-BNC de 34 %, le disclaimer verbatim pour l'expert-comptable.

`h1` : « Simulateur Super-Net Hippodoc » → « Simulateur Super-Net : ton revenu net
de médecin ». Le terme de marque « Super-Net » est conservé en tête — c'est un
concept produit employé 18 fois sur la page et porteur d'un article dédié — mais
il est désormais suivi des mots réellement recherchés. Le `<title>` était déjà
correct et n'a pas bougé.

Vérifié : build 56 pages ; `verify-site.mjs` OK ; JSON-LD parsable et complet
(`Organization + WebApplication + FAQPage + BreadcrumbList`) ; les 5 questions ET
les 5 réponses présentes dans le HTML servi.

⚠️ **Lighthouse : l'invariant ≥ 95 n'est PAS tenu sur cette page, avant comme
après.** Mesures locales (`serve dist`, 3 runs chacune) : référence 92/92/92,
avec les modifications 92/94/91 — même médiane, LCP 3,1 s inchangé, TBT et CLS à
zéro. **Aucune régression introduite ici.** En revanche la production mesure
**86** (LCP 3,4 s) : l'invariant de `CLAUDE.md` est déjà violé indépendamment de
cette passe. Le facteur limitant est le LCP, pas le poids du HTML. À traiter
séparément.

### 9.af Sourçage des pages à impressions — et deux erreurs factuelles corrigées (août 2026)

Suite de l'audit § 9.ac à § 9.ae. 37 articles sur 38 ne citaient aucune source
externe dans leur corps ; sur de la fiscalité appliquée à des professionnels de
santé — du YMYL au sens strict — c'est l'absence de tout point d'ancrage
vérifiable. Cette passe traite les pages qui reçoivent déjà des impressions,
là où le signal sera lu.

⚠️ **La vérification a trouvé deux affirmations fausses, pas seulement des liens
manquants.** C'était le risque identifié en amont, et il s'est matérialisé.

**Erreur 1 — seuil de dispense CARMF.** Le site annonçait « ~12 800 € en 2026,
indexé sur le PASS ». Le seuil réel est **15 000 € de revenu net d'activité
indépendante**, il n'est **pas indexé sur le PASS** (48 060 € en 2026), et il
s'accompagne d'une seconde condition qui n'était mentionnée nulle part : le
**non-assujettissement à la CET**. Source : page d'affiliation de la CARMF.
Le ~12 800 € semble venir d'une confusion avec l'équivalent net des 19 000 €
bruts du RSPM, qui est un tout autre dispositif.

**Erreur 2 — déclenchement de l'affiliation CARMF.** Le site indiquait
« dès que tu dépasses 30 jours par an de remplacement ». Il n'existe pas de
durée minimale : l'affiliation est obligatoire pour tout médecin rémunéré à
l'honoraire, remplacements compris. Les « 30 jours » de la CARMF sont le délai
pour lui signaler un changement de situation, pas un seuil d'assujettissement.

Ces deux erreurs vivaient en **cinq endroits** : corps et `faq` de
`checklist-administrative-medecin-remplacant`, corps et `faq` de
`tout-comprendre-carmf`, et — introduite par la passe § 9.ac — la `description`
de la checklist, qui reprenait « CARMF au-delà de 30 jours ». Toutes corrigées ;
`grep` de contrôle sur `src/` ne trouve plus aucune trace de `12 800`,
`30 jours/an` ni `indexé sur le PASS`.

⚠️ **Leçon de méthode** : la passe § 9.ac a recopié dans une balise un chiffre
faux du corps de l'article. Vérifier que la description reflète la page ne suffit
pas — encore faut-il que la page soit exacte.

**Vérifié et confirmé exact** (aucune modification nécessaire) :

| Affirmation | Source |
| --- | --- |
| Plafond micro-BNC 83 600 € | service-public — revalorisé par la LF 2026, applicable aux revenus 2026-2028 |
| Abattement micro-BNC 34 % | idem |
| Sortie du micro-BNC après 2 années consécutives de dépassement | idem |
| Déclaration URSSAF sous 8 jours | service-public F36740, PAMC, remplaçants compris |
| RSPM plafonné à 19 000 € d'honoraires rétrocédés | service-public R63763 |
| Licence : 2ᵉ cycle validé, semestres selon spécialité, CDOM, 1 an, formation + 3 ans | Conseil national de l'Ordre |
| PASS 2026 à 48 060 € | CARMF |

Corrigé au passage : la FAQ de `regime-fiscal-micro-bnc-vs-reel` demandait
« Quel est le plafond du Micro-BNC en **2025** ? » en répondant 83 600 €, qui est
le seuil **2026**. Question redatée et réponse précisée.

⚠️ **Toutes les URL de source ont été vérifiées** : chacune répond 200 et son
contenu a été lu pour confirmer qu'elle dit bien ce qu'on lui fait dire. Les
URL `urssaf.fr` bloquent les requêtes automatisées ; les pages
`entreprendre.service-public.gouv.fr` équivalentes, vérifiables, leur ont été
préférées.

`updatedDate` renseigné au 2026-08-18 sur les 4 articles modifiés, et
`src/generated/blog-meta.json` mis à jour à la main en conséquence — c'est lui qui
alimente le `lastmod` du sitemap, et il n'est pas régénéré automatiquement.

Vérifié : build 56 pages, `verify-site.mjs` OK, 3 453 liens internes sans lien mort.

**À valider par un médecin.** Ces corrections reposent sur les sources officielles
citées, pas sur une expertise métier. Le seuil de 15 000 € et l'absence de durée
minimale d'affiliation méritent une relecture par quelqu'un qui pratique.

### 9.ag Sourçage fiscal, passe 2 — barèmes IR remis à l'année courante (août 2026)

Seconde passe de § 9.af, sur les articles fiscaux restants. Puisque la première
avait trouvé deux erreurs sur quatre articles, supposer les autres indemnes aurait
été imprudent.

**Vérifié exact, aucune modification** : taux RSPM 13,5 % jusqu'à 19 000 € puis
21,2 % entre 19 000 et 38 000 € ; seuil de sortie à 38 000 € sur une année OU
19 000 € sur deux années consécutives ; déclaration URSSAF sous 8 jours ;
abattement micro-BNC de 34 % ; plafond 83 600 €.

⚠️ **Défaut trouvé : barème IR mal étiqueté.** `rspm-exemples-concrets` annonçait
« Barème 2026 » en calculant avec les valeurs du barème **LF 2025** (première
tranche à 11 497 € au lieu de 11 600 €). Les montants publiés correspondaient
exactement au barème applicable aux revenus 2024 — soit une année de retard.
`micro-bnc-exemples-concrets` était dans le même cas, mais avec une étiquette
honnête (« Barème 2025 ») tout en citant par ailleurs le plafond micro-BNC 2026.

Les quatre exemples ont été **recalculés avec `BAREME_2026`**, en lisant les
tranches et les paramètres de décote directement dans `src/lib/baremes-ir.ts`,
seule source de vérité du dépôt — pas en refaisant l'arithmétique à la main.

| Exemple | IR avant | IR après | Super-Net avant | Super-Net après |
| --- | --- | --- | --- | --- |
| RSPM 19 000 € | 0 € | 0 € | 16 278 € | 16 278 € |
| RSPM 38 000 € | 1 281 € | **1 257 €** | 29 969 € | **29 993 €** |
| micro-BNC 50 000 € | 3 065 € | **3 004 €** | 33 728 € | **33 789 €** |
| micro-BNC 75 000 € | 8 015 € | **7 954 €** | 48 798 € | **48 859 €** |

Les pourcentages de répartition et les réponses de `faq` qui reprenaient ces
montants ont été mis à jour en conséquence. Deux dérives d'un euro entre le corps
et la `faq` de `rspm-exemples-concrets` (2 723 vs 2 722, 16 277 vs 16 278) ont été
alignées au passage.

⚠️ Le bloc de répartition de l'exemple micro-BNC 1 somme à 100,1 % : artefact
d'arrondi à 0,1 près, déjà présent avant cette passe. Les valeurs exactes somment
à 100,0 — fausser un arrondi correct pour faire tomber la colonne juste serait pire.

Précision ajoutée à `tout-comprendre-urssaf` : la bascule RSPM → PAMC prend effet
au **1er janvier de l'année suivante**, on reste en RSPM jusqu'au 31 décembre de
l'année du dépassement. C'était déjà correctement énoncé dans la FAQ de
`calculette.astro`, mais pas dans l'article.

⚠️ **À vérifier hors de cette passe — concerne le simulateur, pas le blog.**
`src/lib/baremes-ir.ts` documente lui-même ses valeurs de décote 2026 comme une
estimation : `{ plafondSeul: 897 } // LF 2026 (estimation +1%)`, avec le
commentaire « valeurs reconduites pour 2026 dans l'attente de la publication
officielle des valeurs LF 2026 finales ». Tant que ce n'est pas confirmé, chaque
simulation servie aux utilisateurs porte cette approximation — et désormais deux
articles aussi. À rapprocher du texte publié de la LF 2026.

`updatedDate` au 2026-08-18 sur les 3 articles, `blog-meta.json` synchronisé.
Vérifié : build 56 pages, `verify-site.mjs` OK, cohérence arithmétique de chaque
exemple recontrôlée ligne à ligne.

### 9.ah Barème IR 2026 : cinq seuils faux dans le moteur de calcul (août 2026)

Découvert en sourçant les articles fiscaux (§ 9.ag) : `src/lib/baremes-ir.ts`
documentait ses valeurs 2026 comme provisoires — `// LF 2026 (estimation +1%)`,
« en attente de la publication officielle ». La LF 2026 étant promulguée depuis le
**19 février 2026** (loi n° 2026-103), ces valeurs ont été confrontées au BOFiP.

⚠️ **Seules les tranches avaient été mises à jour pour 2026.** Les quatre seuils
associés avaient été recopiés du barème 2025 avec la mention « inchangé », qui
était fausse : le BOFiP les indexe comme les tranches (+0,9 % au titre des revenus
2025, LF 2026 art. 4).

| Paramètre | Codé | Réel (revenus 2025) | Source |
| --- | ---: | ---: | --- |
| `plafondQfParDemiPart` | 1 791 € | **1 807 €** | BOI-IR-LIQ-20-20-20 |
| `plafondQfCaseT` (parent isolé) | 4 149 € | **4 262 €** | BOI-IR-LIQ-20-20-20 |
| `plafondAbattement10Salaire` | 14 426 € | **14 555 €** | brochure IR 2026 |
| `plancherAbattement10Salaire` | 504 € | **509 €** | brochure IR 2026 |
| décote `plafondCouple` | 1 486 € | **1 483 €** | BOI-IR-LIQ-20-20-30 |

**Vérifié exact, non modifié** : les cinq tranches (11 600 / 29 579 / 84 577 /
181 917), la décote individuelle (897 €) et son taux (45,25 %), le PASS 2026
(48 060 €), les plafonds micro-BNC (77 700 € jusqu'aux revenus 2025, 83 600 € à
partir de 2026). L'estimation « +1 % » était donc juste pour la décote
individuelle, et fausse partout ailleurs.

Portée : aucune de ces constantes n'est dupliquée dans le dépôt — tous les
consommateurs lisent `baremes-ir.ts`. La correction se propage donc d'un coup au
simulateur (branche RSPM), à la calculette et à `individualizedTax.ts`.

Ordre de grandeur de l'écart corrigé, par simulation :

- couple avec 2 enfants au plafonnement du QF : **32 € d'impôt en trop** annoncés
- salarié au plafond de l'abattement de 10 % : **38 à 58 € en trop** selon la TMI
- couple dans la zone de décote : **jusqu'à 3 € en moins** — le code surestimait
  la décote, donc sous-estimait l'impôt

⚠️ Les exemples chiffrés du blog (§ 9.ag) ne changent pas : ils portent sur 1 part
fiscale sans revenu salarié, donc ni le plafonnement du QF ni l'abattement de 10 %
ne s'y appliquent, et la décote individuelle était déjà juste.

⚠️ **Reste à vérifier hors de ce dépôt.** La branche PAMC du simulateur (CA ≥
38 000 €) appelle l'Edge Function Supabase `calculate-urssaf`. Si elle embarque sa
propre copie de ces seuils, elle porte encore les valeurs fausses — ce dépôt ne
peut pas le savoir. À contrôler côté Supabase.

Vérifié : build 56 pages, `verify-site.mjs` OK.

### 9.ai Fraîcheur : des `lastmod` qui disent la vérité (août 2026)

Plan 05 de l'audit SEO. En l'ouvrant, deux constats ont renversé ce qui était prévu.

**Ce qui était déjà fait** : `[slug].astro` affiche déjà « Mis à jour le … » quand
`updatedDate` existe (ligne 240) et alimente déjà `dateModified` du JSON-LD
`Article` (ligne 103). Le plan prévoyait de les ajouter : c'était inutile.

⚠️ **Le vrai défaut était ailleurs, et il jouait contre nous.** Le sitemap
annonçait `lastmod: 2026-08-10` pour **29 URL sur 54** — dont des articles
inchangés depuis octobre 2025. Origine : l'import initial depuis `blogArticles.ts`
de la SPA avait posé un `updatedAt` de build identique sur tout le lot, et la
ligne 157 de `generate-blog-content.mjs` (`updatedAt ?? publishedAt`, logique
pourtant saine) l'a fidèlement recopié dans `blog-meta.json`.

C'est contre-productif : Google ignore le signal `lastmod` d'un site entier dès
qu'il le juge peu fiable, et 29 articles datés du même jour en est l'archétype.
Le site ne se contentait pas de manquer de fraîcheur, il détruisait sa crédibilité
sur ce signal.

**Corrigé** : 29 `lastmod` ramenés à la date réelle — l'`updatedDate` du
frontmatter, ou à défaut la `pubDate`. Le sitemap présente désormais **13 dates
distinctes** au lieu de 4 dont une à 29 URL.

⚠️ **Aucune date n'a été inventée.** Seuls trois articles ont reçu une
`updatedDate` : `choix-mode-exercice`, `maitrise-ton-logiciel-metier-en-30-min` et
`outils-numeriques-indispensables-cabinet`, qui ont réellement été modifiés par
les passes § 9.ac et § 9.ad sans avoir été datés. Les 25 autres retrouvent leur
`pubDate`. Antidater une révision qui n'a pas eu lieu se recoupe avec le contenu
servi et ruinerait le signal une seconde fois.

**Garde-fou ajouté à `verify-site.mjs`** (contrôle 6) : chaque `lastmod` du
sitemap doit correspondre à l'`updatedDate` du frontmatter, ou à défaut à sa
`pubDate` ; et un avertissement se déclenche si plus de 12 URL partagent la même
date, motif typique d'une date de génération. Testé en désynchronisant volontairement
`blog-meta.json` : le contrôle échoue avec le nom de l'article et les deux dates.

Rappel : `blog-meta.json` n'est PAS régénéré au build. Toute édition manuelle
d'une date de frontmatter doit y être répercutée — c'est précisément ce que le
nouveau contrôle rend impossible à oublier.

### 9.aj Guide des déclarations : exactitude et signature (août 2026)

Plan 01 de l'audit dédié à `/guide-declarations`, page qui n'a reçu **aucune
impression de recherche en trois mois**. Deux défauts se cumulaient sur une page
YMYL : des chiffres périmés, et aucun auteur.

**a. Trois chiffres du glossaire.** `src/data/glossaireDeclarationsData.ts`
servait, sous l'étiquette « Barème 2026 (revenus 2025) », les valeurs du barème
applicable aux **revenus 2024** :

| Entrée | Avant | Après |
| --- | --- | --- |
| IR — tranches | 11 497 · 29 315 · 83 823 · 180 294 | **11 600 · 29 579 · 84 577 · 181 917** |
| Quotient familial | 1 791 €/demi-part | **1 807 €** |
| Quotient familial — case T | 4 149 € | **4 262 €** |
| Frais réels salarié | plancher 504 € / plafond 14 426 € | **509 € / 14 555 €** |

Mêmes valeurs que celles déjà corrigées dans `baremes-ir.ts` (§ 9.ah) et dans deux
articles (§ 9.ag) : le glossaire était le dernier endroit du site où elles
survivaient. La page affichait par ailleurs correctement le PASS 2026 à 48 060 €,
donc elle se contredisait elle-même.

**b. Aucun auteur déclaré — le manque le plus lourd.** Le JSON-LD se limitait à
`WebPage`, sans `author` ni `datePublished`, et l'écran annonçait « Guide pratique
créé par des médecins, pour des médecins » : anonyme. Chaque article de blog
déclare pourtant `Person: Dr. Ryan Goburdhun` avec un lien vers
`/qui-sommes-nous`. Sur un contenu fiscal destiné à des professionnels de santé,
« qui répond de ce qui est écrit » est le signal E-E-A-T le plus directement
lisible — et c'était la seule page experte du site à ne pas le dire.

Ajoutés : `author`, `reviewedBy` et `lastReviewed` — les propriétés que
schema.org prévoit exactement pour une page relue par un professionnel — plus une
signature visible sous le sous-titre, pendant à l'écran du balisage.

⚠️ `@type` reste `WebPage` et ne passe pas à `Article` : la page est un hub, pas
un article, et deux schémas concurrents sur une même URL se nuiraient.

**c. Espace manquant dans le `h1`.** Le saut de ligne entre `sociales,` et le
`<span>` était supprimé au build : le titre principal se lisait
« sociales,enfin claires ». Corrigé par un `{' '}` explicite.

Vérifié : build 56 pages, `verify-site.mjs` OK, 3 454 liens internes sans lien
mort. Contrôle en sortie : plus aucune occurrence de `11 497`, `1 791`, `4 149`
ni `14 426` dans `src/data/`.

⚠️ Rappel de périmètre : seul le contenu éditorial est touché. Aucun moteur de
calcul, aucune Edge Function.

### 9.ak `lastmod` des pages statiques (août 2026)

Plan 02 de l'audit `/guide-declarations`. La table de fraîcheur du sitemap ne
couvrait que les articles : **aucune page statique ne déclarait de `lastmod`**,
alors que `/guide-declarations` affiche « Mis à jour le 31 mai 2026 » et porte
`dateModified` dans son JSON-LD. La page la plus vivante du site — révisée à
chaque loi de finances — était la seule à taire sa fraîcheur.

Nouvelle source unique : `src/lib/pages-lastmod.ts`, lue **à la fois** par les
pages (affichage + JSON-LD) et par `astro.config.mjs` (sitemap). Deux entrées
aujourd'hui : `/guide-declarations` (31 mai 2026, importée de
`guide/lastUpdated.ts` pour ne pas créer une troisième copie) et `/comparatif`
(24 juin 2026). `comparatif.astro` lit désormais sa date depuis cette table au
lieu de la déclarer en dur.

⚠️ Les pages sans date de revue éditoriale — `/simulateur`, `/tarifs`, les pages
légales — restent **volontairement sans `lastmod`**. Mieux vaut pas de signal
qu'un signal inventé : c'est la leçon de § 9.ai, où 29 URL annonçaient une date de
build.

⚠️ L'import d'un module TypeScript depuis `astro.config.mjs` fonctionne (Vite le
transforme) : vérifié au build, pas supposé.

Garde-fou étendu au contrôle 6 de `verify-site.mjs` : chaque page listée dans
`pages-lastmod.ts` doit porter ce `lastmod` exact dans le sitemap, et son absence
est une erreur. Testé en faussant le sitemap après build — le contrôle échoue en
nommant la page et les deux dates. Le premier essai, qui modifiait la source, ne
prouvait rien : la régénération alignait les deux côtés.

Vérifié : build 56 pages, `verify-site.mjs` OK, `/guide-declarations` → 2026-05-31
et `/comparatif` → 2026-06-24 dans le sitemap servi.

### 9.al Maillage éditorial du guide, vers les ancres (août 2026)

Plan 03 de l'audit `/guide-declarations`, et la cause la plus directe de ses zéro
impression : la page ne recevait **qu'un seul lien éditorial**. Les 38 autres
venaient du bloc « Pour aller plus loin » du gabarit d'article — même ancre
répétée 38 fois, donc de la navigation, que Google pondère très peu.

**1 → 13 liens éditoriaux.** Douze insertions contextuelles, placées à l'endroit
où la question se pose, et pointant chacune vers une **ancre précise** plutôt que
vers la page entière. La page compte 258 `id` : autant s'en servir.

| Article | Ancre visée | Contenu réel de l'ancre |
| --- | --- | --- |
| `remplir-declaration-2035` | `#case-2035` | Liasse fiscale 2035 |
| `regime-fiscal-micro-bnc-vs-reel` | `#case-5HQ` | Revenus imposables micro-BNC (2042-C-PRO) |
| `frais-professionnels-deductibles` | `#case-5QC` | Bénéfice net BNC |
| `tout-comprendre-urssaf` | `#case-DSCS` | Total recettes brutes non salariées (DSFU) |
| `rspm-exemples-concrets` | `#cases` | Caseopedia, 35 cases |
| `cotisations-sociales-vs-impots` | `#flux` | Parcours déclaratif complet |
| `calendrier-fiscal-remplacant` | `#calendrier` | Calendrier annuel |
| `conge-maternite-paternite` | `#case-DSDX` | IJ versées par la CPAM |
| `pdsa-exoneration-gardes-regulees` | `#glossaire-term-pdsa` | Définition PDSA |
| `guide-impots-internes-remplacants` | `#profils` | Boussole des profils |
| `salariat-10-pourcent-ou-frais-reels` | `#glossaire-term-frais-reels` | Frais réels salarié |
| `tout-comprendre-carmf` | `#glossaire-term-asv` | ASV |

⚠️ **Le contenu de chaque ancre a été lu avant d'écrire le lien.** Un lien qui
pointe à côté est pire que pas de lien : `#case-5HQ` est bien le micro-BNC,
`#case-5QC` bien le bénéfice net au réel, `#case-DSDX` bien les IJ CPAM.

⚠️ **Douze ancres distinctes, douze ancres textuelles distinctes.** Répéter la même
formule douze fois vers une page commerciale est un motif de sur-optimisation —
c'est déjà le défaut du bloc de gabarit, inutile de le reproduire.

**Nouveau contrôle dans `verify-site.mjs` (4 quindecies)** : tout lien vers
`/page#ancre` doit viser un `id` existant. Le maillage repose désormais sur des
ancres ; une ancre renommée casserait le lien en silence, aucun contrôle d'URL ne
le verrait.

⚠️ **Le contrôle a trouvé une ancre morte préexistante dès son premier passage.**
`CalculetteForm.tsx` construisait `/guide-declarations#PM-001`, `#PM-002`… à partir
de `PROFIL_FICHE_ANCRE`. Ces ancres n'ont **jamais** été rendues : les fiches du
guide portent des `id` de type `regle-RO-001`, pas les codes profil de la SPA
source. Les quatre profils de la calculette renvoyaient donc en haut de page.
Corrigé vers `#profils` — la boussole, qui identifie précisément le profil — et
le libellé ne cite plus un code inexistant.

⚠️ Périmètre : cette correction porte sur un `href` et son libellé, pas sur une
règle de calcul. Aucun moteur n'est touché.

Vérifié : build 56 pages, `verify-site.mjs` OK, 3 466 liens internes sans lien
mort, 12 ancres visées et 0 morte.

### 9.am Guide : du texte ouvert sous les quatre sections d'index (août 2026)

Plan 04 de l'audit `/guide-declarations`.

⚠️ **Le plan reposait sur une mesure fausse, corrigée avant d'agir.** J'avais
annoncé « 13 `h2` sur 15 sans aucun texte d'introduction ». Une regex qui
décrochait : plusieurs sections en ont beaucoup — « Fiscal ≠ social » 142 mots,
« Trouve ta situation » 121, « Le parcours de ta déclaration » 193, le calendrier
707. Et les sections à 6-10 mots sont les **séparateurs de zone**, dont c'est le
rôle : ce sont des étiquettes, pas des chapitres.

Le vrai défaut, une fois mesuré correctement, est plus précis : **les quatre
sections qui portent l'essentiel du contenu étaient introduites par une seule
ligne**.

| Section | Contenu | Intro avant | Après |
| --- | --- | ---: | ---: |
| Caseopedia | 35 cases | 17 mots | **125** |
| Fiches pratiques | 39 fiches | 17 mots | **109** |
| Questions fréquentes | 49 questions | 15 mots | **111** |
| Problèmes connus & recours | 7 bugs + 6 courriers | 17 mots | **125** |

Texte visible de la page : 1 760 → **1 974 mots**. Le contenu replié (47 635 mots)
n'a pas bougé d'une ligne.

⚠️ **Aucune règle fiscale nouvelle n'a été écrite.** Ces introductions résument ce
que la section contient déjà, en nommant les formulaires et les situations avec le
vocabulaire que les gens tapent : 2042-C-PRO, 2035, DSFU, micro-BNC, SNIR,
forfait structure, indemnités journalières, RSPM vers PAMC. Le fond reste celui de
la bible ; seule la porte d'entrée change.

⚠️ Rappel, pour ne pas reprendre un réflexe SEO daté : le contenu des
`<details>` est indexé normalement depuis l'indexation mobile-first, et
`<details>` natif reste le bon élément — c'est ce qu'impose `CLAUDE.md`. On
n'ouvre rien de force. Ce qui change, c'est que le sujet de chaque section est
désormais lisible sans interaction, pour un moteur comme pour un lecteur qui
arrive de recherche.

Vérifié : build 56 pages, `verify-site.mjs` OK, 3 466 liens internes sans lien mort.

### 9.an Guide : sources officielles élargies au social (août 2026)

Plan 05 de l'audit `/guide-declarations`. **Le plan a été revu en cours de route,
après mesure — je le note parce que la version initiale était fondée sur un
constat inexact.**

⚠️ **Rectification.** L'audit annonçait « une seule source officielle citée dans
49 395 mots ». C'était vrai des **hyperliens**, pas des **références** : la page
cite en texte **17 références légales distinctes, 69 occurrences** — CGI Art. 102
ter (12×), Art. 151 ter (25×), BOI-BNC-SECT-40 (7×), BOI-BIC-CHAMP-80-10-20-20,
CGI Art. 1417, CGI Art. 49 K annexe III… Le contenu était donc déjà sourcé ; ce
qui manquait, c'est qu'on puisse cliquer.

⚠️ **Et transformer ces 69 occurrences en liens n'est pas faisable proprement.**
Testé : le BOFiP n'expose pas d'URL stable par identifiant. `bofip.impots.gouv.fr/bofip/lien?identifiant=BOI-…`,
`/bofip/BOI-…`, `/bofip/recherche?q=…` renvoient tous **404**. Seule fonctionne la
forme complète `…/2495-PGP.html/identifiant=BOI-IR-LIQ-20-20-30-20260407`, qui
embarque un identifiant numérique **et une date de publication** propres au
document — donc appelés à changer à chaque republication. Sur une page fiscale,
69 liens voués à pourrir valent moins que zéro.

**Ce qui a été fait à la place** : la liste « Sources officielles » du hero, qui
existait déjà, passe de **3 à 8 entrées**. Les trois d'origine ne couvraient que le
fiscal (brochure IR, notice 2035, guide PAMC), alors que le guide traite autant de
social sans qu'aucune source ne soit atteignable.

Ajoutées, toutes vérifiées 200 avant insertion :

| Source | Couvre |
| --- | --- |
| service-public F32105 | régime micro-BNC et son plafond |
| service-public F36740 | déclarations du PAMC, délai de 8 jours |
| service-public R63763 | dispositif simplifié remplaçants (RSPM) |
| carmf.fr — affiliation | affiliation et conditions de dispense |
| impots.gouv.fr | déduction forfaitaire de 10 % |

⚠️ Choix assumé : des **pages de référence durables** plutôt que des permaliens
BOFiP. Une page service-public ou CARMF survit aux republications ; un permalien
BOFiP non.

Vérifié : build 56 pages, `verify-site.mjs` OK, 8 liens officiels servis sur la page.

**Reste ouvert** : la vérification ligne à ligne des 35 cases contre leur
référence citée. Elle demande une relecture métier, pas un script — et sort du
périmètre d'un audit SEO.

### ⚠️ Erreur à ne pas refaire : les réglages PROJET valent pour l'APP aussi

`app.hippodoc.fr` partage le projet PostHog `164270` avec le site public. En
coupant `session_recording_opt_in` au niveau projet « par précaution », le session
replay de l'APP a été désactivé — alors qu'il enregistrait activement (5 replays
le jour même, sur `/dashboard`, `/depenses/cotisations`). Le site public, lui,
n'a JAMAIS enregistré de replay : son drapeau client `disable_session_recording`
suffisait déjà. Le changement projet n'apportait donc rien et cassait l'app.

**Règle** : ce qui concerne le site public se règle dans SON `posthog.init()`.
Les réglages projet ne se touchent qu'en sachant ce que l'app en fait.

Reste à faire : les sections `4.x`, `5.x`, `7.x` sans parent dans
`frais-pros-medecin-liberal-2026` (§9.e) — le seul arbitrage éditorial encore
ouvert, car il suppose d'inventer des intitulés de section.

### 9.ao Licence de remplacement — travail de position (23 août 2026)

Première action issue de l'audit Search Console du 23 août. La famille de
requêtes « licence de remplacement » cumule **≈ 165 impressions en positions
8,5 à 12,6 pour zéro clic** ; la page qui les capte
(`/blog/obtenir-sa-licence-de-remplacement`) était à 519 impressions, 4 clics,
position moyenne 6,8. Contenu modifié en conséquence — d'où ce flag.

**Fichier `src/content/blog/obtenir-sa-licence-de-remplacement.md`**

| Élément | Avant | Après |
|---|---|---|
| `title` | Licence de remplacement pour interne | Licence de remplacement interne : dossier et délais |
| `updatedDate` | 2026-08-18 | 2026-08-23 |
| `readTime` | 5 min | 6 min |
| Mots rendus | 993 | 1 583 |
| Questions FAQ | 4 | 7 |

- **Titres de section passés en voix de requête.** Les H2 numérotés
  (« 1. Conditions préalables à respecter ») sont devenus les questions
  réellement tapées (« Qui peut demander une licence de remplacement ? »,
  « Où envoyer ta demande de licence de remplacement ? »…). L'expression exacte
  « licence de remplacement interne » — 76 impressions à elle seule — n'était
  dans aucune balise ; elle est désormais dans le `title` et le H1.
- **Ajouts** : un bloc `:::essentiel` en tête (convention de §9.c), deux sections
  neuves — « Comment renouveler ta licence de remplacement ? » et « Et une fois
  ta thèse soutenue ? » — et trois précisions courtes (seuil de semestres
  variable selon le DES, délai d'obtention de l'attestation universitaire, les
  trois pièces à réunir avant le premier jour).
- **Aucune phrase existante n'a été réécrite** : le corps d'origine est conservé
  mot pour mot, seuls les intitulés de section ont changé.
- **Prudence factuelle assumée** : rien n'a été ajouté sur le coût de la demande
  ni sur la liste des pièces de renouvellement — ces points varient par CDOM et
  n'étaient pas sourcés. Le renouvellement renvoie donc au conseil départemental
  plutôt que d'énoncer une procédure inventée.

**Maillage interne entrant** — la page n'avait que 2 liens contextuels :

| Fichier | Ancrage ajouté |
|---|---|
| `guide-impots-internes-remplacants.md` | « sous couvert de ta licence de remplacement » |
| `checklist-administrative-medecin-remplacant.md` | ligne « Si tu es encore interne » sous Inscription à l'Ordre |

`guide-impots-internes-remplacants` ajouté aux `relatedArticles` ; deux liens
sortants contextuels posés vers `signer-contrat-remplacement` et
`checklist-administrative-medecin-remplacant`.

Mesuré sur le build : **6 → 7 pages** liant vers l'article. Le gain paraît
faible parce que `checklist-administrative` le référençait déjà via ses
`relatedArticles` — elle porte désormais en plus un lien *dans le corps du
texte*, qui est le seul à transmettre un vrai signal. Liens contextuels en
corps de texte : **2 → 4**.

⚠️ `src/generated/blog-meta.json` mis à jour en même temps que le frontmatter
(`updatedDate` 2026-08-23) — `verify-site.mjs` échoue si les deux divergent
(cf. §9.ai).

Vérifié : build 56 pages, `verify-site.mjs` OK (54 URLs, 3 473 liens internes,
aucun mort), 2 avertissements préexistants (`/essai` et `/transmissions`,
noindex hors sitemap). `lastmod` du sitemap = 2026-08-23 pour cette seule URL.

**À mesurer** : les positions des 7 requêtes du bloc « licence » dans Search
Console d'ici 4 à 6 semaines. C'est le test de la méthode avant de l'appliquer
aux 37 autres articles.

### 9.ap Guide des déclarations : trois pages filles additives (23 août 2026)

Deuxième action de l'audit Search Console. `/guide-declarations` porte **49 845
mots et 122 titres H2/H3 sur une seule URL** (2,3 Mo de HTML, 245 Ko transférés,
15 × un article de blog) et ne capte que 4 visiteurs organiques en 14 jours : une
URL ne peut pas être simultanément la meilleure réponse à trente requêtes.

#### L'axe de découpe, et pourquoi ce n'est pas le sujet

Découper le guide **par sujet** aurait créé neuf doublons frontaux avec le blog —
2035, micro-BNC/réel, URSSAF, CARMF, PDSA, frais pros, calendrier fiscal, RSPM,
IJ/maternité — dont plusieurs se positionnent déjà (`remplir-declaration-2035` en
position 11,4 ; `tout-comprendre-carmf` sur « carmf » en 12,4 ;
`rspm-exemples-concrets` sur « rspm » en 19,2). Deux pages faibles à la place
d'une correcte.

Les deux axes retenus n'entrent en concurrence avec aucun article :

- **par formulaire administratif** — `/dsfu-pamc` (15 cases, contenu le plus
  singulier du site), `/2042-c-pro` (5 cases) ;
- **par profil** — `/medecin-remplacant` (profil PM-002), premier des 13.

La 2035 est **volontairement laissée au blog** : c'est écrit en tête de
`2042-c-pro.astro` pour que personne ne « corrige » l'omission plus tard.

#### Le hub n'a rien perdu — et c'est vérifié

Décision d'architecture : les pages filles sont **additives**. Rien n'est retiré
de `/guide-declarations`, les 18 liens entrants vers ses ancres (§ 9.al)
continuent de fonctionner à l'identique.

Vérification par empreinte, à chaque étape du chantier :

| Étape | HTML du hub |
|---|---|
| Extraction de `CaseCard` et `QuestionCard` | identique à l'octet près |
| Branchement du résolveur d'ancres | identique à l'octet près |
| Ajout de `SousPagesNav` | **0 ligne supprimée**, 30 ajoutées |

(Comparaison après neutralisation des empreintes d'assets : les bundles changent
forcément puisque `CrossLinks` importe désormais le module de contexte.)

#### Le piège technique : les ancres nues

`CrossLinks` et `InlineRef` rendaient `href="#case-DSCS"`. Correct sur une page
unique, **mort dès qu'on en sort**. `InlineRef` étant appelé au fond de
`FormattedText`, lui-même au fond des cartes, passer la résolution en prop aurait
supposé de la faire descendre sur toute la chaîne : d'où
`src/lib/guide/anchors.ts`, un contexte React dont **la valeur par défaut est le
comportement historique**. Le hub ne change donc pas ; les pages filles
fournissent `hubResolver()` — ancre locale si l'item est sur la page, sinon lien
vers le hub.

Résultat mesuré sur le build : **71 ancres locales, 337 liens vers le hub, zéro
ancre morte** sur les trois pages.

#### Recouvrement de contenu — le point à surveiller

C'est le revers assumé de l'option additive. Mesuré en 8-grammes :

| Page | Mots | Contenu inédit vs hub |
|---|---|---|
| `/dsfu-pamc` | 7 374 | 10 % |
| `/2042-c-pro` | 3 844 | 16 % |
| `/medecin-remplacant` | 4 723 | 17 % |

Les blocs de référence (cases, questions) sont partagés **par construction** : ils
sont la matière. Chaque page porte en plus 600 à 800 mots de prose qui n'existent
nulle part ailleurs — ordre de remplissage de la DSFU, les trois confusions qui
coûtent le plus, l'erreur PDSA en 5HP, les trois chiffres du remplaçant — écrits
à partir des `erreurFrequente` déjà documentées, sans avancer de règle nouvelle.

⚠️ **Si Search Console montre que Google retient le hub et filtre les filles**,
le levier suivant est l'option écartée ici : hub réduit à un index + extraits, le
contenu long ne vivant plus que sur les filles. Elle n'a pas été prise d'emblée
parce qu'elle déplace 50 000 mots et réécrit 18 liens d'ancre — à ne faire que sur
preuve, pas par précaution.

#### Fichiers

| Fichier | Rôle |
|---|---|
| `src/lib/guide/anchors.ts` | contexte + fabriques d'ancres (nouveau) |
| `src/components/guide/CaseCard.tsx` | carte de case extraite (nouveau) |
| `src/components/guide/QuestionCard.tsx` | carte de question extraite (nouveau) |
| `src/components/guide/GuideSubset.tsx` | rendu d'un sous-ensemble + Provider (nouveau) |
| `src/components/guide/SousPagesNav.astro` | aiguillage depuis le hub (nouveau) |
| `src/layouts/GuideSousPage.astro` | gabarit commun, fil d'Ariane, JSON-LD (nouveau) |
| `CrossLinks.tsx`, `GlossaireSection.tsx`, `CaseopediaSection.tsx`, `TopQuestionsSection.tsx` | branchés sur le résolveur / cartes extraites |
| `src/lib/pages-lastmod.ts` | `lastmod` des 3 pages |

Zéro `client:` sur les pages filles : **0 îlot hydraté**, rendu au build comme le
hub. Poids : 369 / 215 / 273 Ko contre 2 380 Ko pour le hub.

Vérifié : build 59 pages, `verify-site.mjs` OK (57 URLs, 3 975 liens internes,
aucun mort), 2 avertissements préexistants. JSON-LD par page : BreadcrumbList +
WebPage + FAQPage, fil d'Ariane visible doublé du balisage.

**À mesurer** : indexation des 3 URL et évolution des impressions du hub d'ici 6
semaines. Si le signal est bon, dérouler les 12 autres profils. Si le hub perd
des impressions au profit des filles sans gain net, revoir l'architecture avant
d'en créer d'autres.

### 9.aq Croisement recherche d'audience × site : corrections et quatre contenus (23 août 2026)

Première action éditoriale issue du croisement entre la carte de la demande
(`hippodoc-corpus/`, voir CLAUDE.md — corpus utilisé comme boussole, jamais comme
source de texte) et l'inventaire des 59 pages du site. Chaque affirmation ajoutée
a été vérifiée sur source primaire (BOFiP, Légifrance, impots.gouv.fr,
service-public, jurisprudence citée) avant écriture.

#### Corrections factuelles — `src/data/boussoleData.ts` (3 entrées)

Le site portait une contradiction interne sur la facturation électronique, sur le
sujet à l'échéance la plus proche (1er septembre 2026) :

- **Calendrier, item de septembre** : citait le « Portail Public de Facturation
  (PPF) de l'État » comme solution gratuite. Faux depuis le **15 octobre 2024**
  (communiqué DGFiP) : le PPF n'est plus une plateforme d'échange, il ne reste
  que l'annuaire central et le concentrateur de données. Réécrit : plateformes
  agréées (PA, ex-PDP), liste officielle impots.gouv.fr, offres de réception
  gratuites existantes.
- **QT-015** (« la réforme concerne-t-elle les factures aux particuliers ? ») :
  la réponse « ne s'applique pas aux particuliers » occultait le cadre réel.
  Réécrite : e-invoicing = B2B domestique uniquement ; actes de soins exonérés
  (art. 261, 4-1° CGI) **totalement hors champ, e-reporting compris**
  (impots.gouv.fr) ; l'obligation réelle du médecin = réception dès le
  1er septembre 2026 ; activité accessoire taxable = émission TPE au
  1er septembre 2027.
- **PC-009** (négocier les plateformes) : même clarification de cadrage, conseil
  de négociation conservé tel quel.

#### Deux nouveaux articles de blog

- **`facturation-electronique-medecin-remplacant`** (Fiche Fiscalité #10) —
  réponse dans les 100 premiers mots (soins hors champ, seule la réception est
  obligatoire), calendrier officiel, cas du remplaçant, abandon du PPF, achats
  compte perso/pro, activité taxable accessoire, sanctions LF 2026 (50 €/facture,
  500 €/transmission, plafonds 15 000 €/an, art. 1737 et 1788 D CGI). Tranche la
  « règle des 150 € » qui circule : le seul 150 € des textes est la dispense de
  certaines mentions (n° TVA) sur factures ≤ 150 € HT (art. 242 nonies A,
  ann. II CGI) — ni dispense de facture, ni seuil de la réforme.
- **`remplacement-regulier-requalification`** (Guide et Conseil) — sujet n°1 de
  la demande, sans concurrence sérieuse. Cadre déontologique (R.4127-65,
  R.4127-89), les 4 scénarios de requalification, jurisprudence (CA Paris
  27/09/2012 n° 11/14734 ; CA Versailles 18/05/2020 n° 18/08007 confirmé
  Cass. 20/10/2021 n° 20-18.261 ; Cass. soc. 29/01/2014 n° 12-26.940 pour la
  subordination), le vrai risque TVA chez le remplacé (rescrit
  BOI-RES-TVA-000056 : part conservée = redevance taxable sauf remplacement
  occasionnel), franchise 2026 (37 500 €/41 250 €, seuil 25 000 € abrogé par la
  loi 2025-1044), appréciation **par assujetti** et non par remplaçant, passage
  en collaboration, checklist anti-requalification.
- ⚠️ **Covers réutilisées** en attendant des visuels dédiés :
  `facture-generation-cover.png` et `signer-contrat-remplacement-cover.png`
  (TODO(owner) ci-dessous).

#### Deux articles enrichis (sections additives, texte existant intact)

- **`tout-comprendre-urssaf`** : + « CA ou bénéfice : sur quoi cotises-tu
  vraiment ? » (démenti explicite de l'erreur répandue « URSSAF/CARMF sur le
  CA » ; nuance RSPM = forfait sur CA, micro-BNC = 66 % des recettes),
  + « La réforme de l'assiette 2026 » (LFSS 2024 art. 18 : assiette unique dès
  revenus 2025 régularisés en 2026, formule, abattement 26 % plancher 1,76 %
  PASS / plafond 130 % PASS, pas de 26 % en micro), + « Moduler tes cotisations
  provisionnelles » (revenu estimé **avant** abattement — l'Urssaf applique le
  26 % elle-même ; suppression de la majoration pour sous-estimation vérifiée
  sur la version en vigueur de l'art. L131-6-2 CSS, Légifrance). + 2 FAQ.
  readTime 5 → 8 min.
- **`regime-fiscal-micro-bnc-vs-reel`** : + « Création d'activité : le micro-BNC
  est garanti les deux premières années » (art. 102 ter CGI ; BOFiP
  BOI-BNC-DECLA-20-10 § 100/134 : micro **de plein droit** en N et N+1 même en
  cas de dépassement — l'inverse est parfois affirmé à tort par
  l'administration elle-même), piège du prorata temporis (§ 132) avec exemple
  chiffré. + 1 FAQ. readTime 4 → 6 min.

`src/generated/blog-meta.json` mis à jour à la main pour les 4 slugs (le script
de génération n'a pas été relancé, conformément à la consigne).

#### Passe « niveau jeune remplaçant » (même jour, retour du fondateur)

Premier jet retoqué : trop de vocabulaire de la réforme (B2B/B2C, assujetti,
e-invoicing, redevance, franchise en base, de plein droit, PASS) illisible pour
un interne qui débute, et la question n°1 du remplaçant — « ma facture de
rétrocession doit-elle passer par une plateforme ? » — traitée en une ligne au
lieu d'être un bloc à part entière. Corrigé sur les quatre contenus : chaque
terme de jargon est remplacé ou expliqué en français courant à la première
occurrence (gardé une fois entre guillemets pour la reconnaissance/SEO), et
l'article facturation gagne une section « Et ta facture de rétrocession, alors ? »
— hors réforme car les rétrocessions rémunèrent des soins exonérés (art. 261,
4-1° CGI), l'envoi par mail de la facture générée avec Hippodoc reste la bonne
façon de faire — plus une FAQ dédiée. Règle éditoriale à retenir pour tous les
contenus futurs : partir du geste concret du lecteur, zéro jargon non expliqué.

### 9.ar Blog : covers affichées en portrait 4:5 (20 septembre 2026)

Constat : les 38 covers sont toutes en portrait (29 en 2:3, 4 en 3:4, 5 en 4:5 —
le format cible des nouvelles fiches, 1080×1350), titre dessiné en haut. Le cadre
16:9 des cartes n'en montrait que ~40 % et coupait ce titre ; le bandeau de 128 px
des « Articles connexes » faisait pire. Aucun contenu modifié, mise en page seule :

- `BlogCard.astro` : cadre `aspect-[4/5]` + `object-top` (une 4:5 s'affiche
  entière, une 2:3 ne perd que les ~17 % du bas). En mobile la carte passe à
  l'horizontale (vignette 112 px à gauche) — une cover 4:5 pleine largeur aurait
  fait ~430 px par carte. `srcset` 320w/640w ajouté (`resolveCovers`).
- `/blog` et `/blog/serie/*` : grille 2 → 4 colonnes (cartes portrait plus
  étroites) ; 8 « derniers articles » au lieu de 9 pour remplir 2 et 4 colonnes.
  Les 38 restent dans l'index de bas de page.
- « À la une » : image portrait 4:5 sur une colonne de 340 px (srcset 480w/720w
  au lieu de 640w/1024w). Toujours après le texte dans le DOM et en `lazy` :
  le titre reste le LCP (voir le commentaire dans `index.astro`).
- `[slug].astro`, « Articles connexes » : cartes horizontales, vignette 4:5 de 96 px.

### 9.as Nouvel article : négocier sa rétrocession (20 septembre 2026)

`src/content/blog/retrocession-honoraires-medecin-remplacant.md` — texte fourni par
le fondateur, repris tel quel et mis au format maison (H2 à emoji, leviers en H3,
tableau pour l'exemple chiffré, encadrés `:::essentiel` / `:::warning` / `:::tip`).
Cover 4:5 : `src/assets/blog/retrocession-honoraires-cover.jpg`.

**Écarts par rapport au texte fourni (à connaître) :**

- ⚠️ **Correction factuelle** : le texte donnait la consultation de psychiatre ou
  de neurologue à 50 €. Tarif en vigueur au 1er janvier 2026 : **57 €** en
  consultation coordonnée (CNP 52 € + MCS 5 €, ameli.fr, page du 17 mars 2026).
  L'exemple « 15 consultations à 50 € » devient « environ 13 consultations à
  57 € » (741 € ≈ la journée à 750 € de l'exemple). G à 30 € et APC à 60 € : exacts.
- Titre raccourci pour la balise `<title>` (« Rétrocession d'honoraires : 70, 80 ou
  90 % ? ») ; le titre long d'origine dépassait 100 caractères.
- Le lien final vers hippodoc.fr pointe sur `/simulateur` (c'est de lui qu'on parle).
- **Ajouts** : bloc « L'essentiel » (reprend le « En résumé », mot pour mot), 6 FAQ
  (chaque réponse reprend des phrases de l'article, aucun fait nouveau), section
  Sources, 9 liens internes. Aucune autre phrase ajoutée ou réécrite.
- Non sourcé sur texte officiel, et présenté comme tel dans l'article : les
  fourchettes (70-90 %, 60-70 %, 100 % en garde) sont des **usages**.

**Maillage entrant** : un lien ajouté dans `signer-contrat-remplacement` et dans
`trouver-facilement-tes-remplacements-medicaux` ; les deux reçoivent une
`updatedDate` au 20 septembre 2026 (modification réelle, cf. § 9.ai), répercutée
dans `blog-meta.json` avec l'entrée du nouvel article.

**Deux défauts préexistants trouvés en contrôlant le rendu, corrigés au passage :**

- 🐛 **Encadrés sans style sur tout le blog.** Les classes `callout callout-<type>`
  ne sont écrites que dans `remark-callouts.mjs` (chaîne interpolée, fichier hors du
  glob `content` de Tailwind) : Tailwind purgeait les règles `.callout*` de
  `global.css`. Ni fond ni bordure, en local comme en prod, depuis la migration.
  Corrigé par une `safelist` dans `tailwind.config.ts`.
- ⚡ **Cover d'en-tête des articles** : servie en 1200 px uniques et en `lazy`
  (défaut de `getImage`, que `fetchpriority="high"` ne compensait pas) alors que
  c'est l'élément LCP. Ajout d'un `srcset` 800w/1200w + `sizes`, et `loading="eager"`
  (en retirant `loading` des attributs étalés : Astro ne dédoublonne pas).
  Lighthouse mobile local : nouvel article 90-93 → **96** ; a11y/BP/SEO 100.

### 9.at Nouvel article : bosser 6 mois, vivre 12 (20 septembre 2026)

`src/content/blog/medecin-remplacant-travailler-6-mois-par-an.md` — texte du
fondateur repris tel quel et mis au format maison (H2 à emoji, deux tableaux,
encadrés). Cover 4:5 : `src/assets/blog/bosser-6-mois-vivre-12-cover.jpg`.

**Méthode de vérification des chiffres** : tous les cas-types ont été recalculés
avec le moteur du simulateur du site (Edge Function `calculate-urssaf`, mêmes
valeurs par défaut que le formulaire : célibataire, secteur 1, métropole, affilié
CARMF 3 ans et plus, aucune charge), pour que l'article et l'outil disent la même
chose. Résultats : 72 000 € micro-BNC → cotisations 18 124 €, IR 7 360 €, net
46 516 € ; 144 000 € réel → cotisations 34 927 €, IR 24 318 €, net 84 755 €.

**Écarts par rapport au texte fourni :**

- ⚠️ **Second semestre : ~38 000 € et non ~31 000 €.** 84 755 − 46 516 = 38 239 €.
  La chute « un tiers de moins » devient « près d'un cinquième de moins » (−18 %).
  Le raisonnement tient, l'ampleur était surestimée.
- Cas central réaligné sur le moteur et rendu cohérent : cotisations « environ
  18 100 € » (au lieu de 18 500), impôt « autour de 7 400 € » (au lieu de 7 500),
  net « ≈ 46 500 € » (au lieu de 46 000 — qui donnait 3 833 €/mois, pas 3 900).
  Le « ≈ 3 900 € par mois » du texte était juste ; c'est lui qui est conservé.
- Tableau des jours : 2 000 €/mois → **~60 jours** (55 dans le texte : en régime
  classique les cotisations pèsent ~30 % des recettes à ce niveau, pas 25 %) ;
  5 000 €/mois → **~165 jours** (175 dans le texte). 90 et 120 jours : confirmés.
  La phrase sur la courbe est ajustée en conséquence.
- Salaire net médian du privé : **2 190 €** (INSEE Première n° 2079, données 2024)
  au lieu de 2 180 €.
- Barème : « 30 % à partir de 29 580 € » / « 41 % à partir de 84 578 € » au lieu de
  « au-delà de » (la tranche commence à ce montant).
- Source du tarif de consultation : ameli.fr plutôt que FMF / info.gouv.fr.
- **Ajouts** : bloc « L'essentiel », 6 FAQ (reprennent l'article, aucun fait
  nouveau hormis le seuil de ~140 jours = 83 600 € / 600 €), section Sources,
  hypothèses complétées dans la mention finale, 8 liens internes, et un encadré de
  deux phrases sur le RSPM (sous 38 000 € d'honoraires, l'objectif de 2 000 €/mois
  descend vers 50 jours — calcul local 13,5 % / 21,2 % + décote).
- La mention « (et tu sors du micro-BNC) » sort du tableau et passe dans la phrase
  qui suit : la cellule faisait déborder le tableau à 659 px en mobile.

**Maillage entrant** : une phrase avec lien ajoutée dans
`salaires-medecins-remplacants` (`updatedDate` au 20 septembre 2026, répercutée
dans `blog-meta.json`).

⚠️ **À regarder côté app (dépôt de l'Edge Function, hors de ce dépôt)** : pour
33 000 € et 36 000 € de recettes en micro-BNC, `calculate-urssaf` renvoie un impôt
de 1 120 € et 1 338 €, soit l'impôt brut **sans décote** (attendu : 730 € et
1 046 €, plafond 897 € − 45,25 %). Les chiffres de l'article sur ces paliers
intègrent la décote, calculée à la main avec `src/lib/baremes-ir.ts`.

### 9.au Nouvel article : zones FRR (20 septembre 2026)

`src/content/blog/zones-frr-exoneration-impot-medecin.md` — texte du fondateur
repris tel quel et mis au format maison. Rangé en **Fiche Fiscalité #11**
(`episodeNumber: 11`, à la suite de la facturation électronique #10). Cover 4:5 :
`src/assets/blog/zones-frr-cover.jpg`.

**Tout le fond a été confirmé sur source primaire — aucun chiffre corrigé :**

- Durée et taux (5 ans à 100 %, puis 75 / 50 / 25 %), fenêtre 1er juillet 2024 →
  31 décembre 2029, régime réel (micro exclu du socle, admis en FRR+), moins de
  11 salariés, règle des 25 % et prorata, de minimis 300 000 € sur trois
  exercices, option dans les six mois et irrévocable, exclusion après un autre
  régime zoné dans les cinq ans : fiche entreprendre.service-public.gouv.fr
  (vérifiée le 21 février 2026) et BOFiP, série BOI-BIC-CHAMP-80-10-75.
- ~17 800 communes, 13 départements entièrement zonés (communes de moins de
  30 000 habitants) ; les six départements cités en font bien partie
  (collectivites-locales.gouv.fr, juillet 2025).
- Montants d'impôt recalculés au barème 2026 : 11 104 / 24 801 / 45 301 /
  89 024 € ; 5 ans = 55 520 → 445 120 € ; 3 exercices à 250 000 € = 267 072 €.
- Aides ameli au 1er janvier 2026 (10 000 / 5 000 / 3 000 €) et les six
  spécialités exclues du cabinet secondaire : ameli.fr (17 mars 2026).
- Fin des ZFU-TE au 31 décembre 2025, régime QPV 2026-2030 : LF 2026.

**Écarts par rapport au texte fourni (précisions, pas corrections) :**

- Le rescrit « remplaçant → collaborateur » (BOI-RES-BIC-000030) a été rendu pour
  les **ZRR** (art. 44 quindecies). Le BOFiP FRR ne le reprend pas nommément ; une
  phrase entre parenthèses le dit dans l'article, et la section Sources aussi.
  C'est le seul point où la doctrine citée n'est pas strictement « FRR ».
- Condition 2 : « reprise dans le cercle familial » précisée par « (hors première
  transmission) », conformément à la fiche service-public.
- « à jour en août 2026 » → « à jour en septembre 2026 ».
- Les quatre montants du paragraphe chiffré sont aussi présentés en tableau (avec
  le total sur cinq ans) ; le paragraphe d'origine est conservé.
- La check-list « Avant de signer » passe d'une phrase à quatre puces ☑️ (mêmes mots).
- Le passage sur le Super-Net et celui sur le non-cumul sont mis en encadré `:::warning`.
- **Ajouts** : bloc « L'essentiel », 7 FAQ (reprennent l'article, aucun fait
  nouveau), section Sources, 8 liens internes, lien final vers `/simulateur`
  (qui gère déjà l'option ZFRR).

**Maillage entrant** : lien ajouté sur la ligne ZFRR de
`frais-pros-medecin-liberal-2026` (`updatedDate` au 20 septembre 2026, répercutée
dans `blog-meta.json`).

Lighthouse mobile local : perf 97-98, a11y / BP / SEO 100, CLS 0.

### 9.av Nouvel article : la CFE du médecin remplaçant (20 septembre 2026)

`src/content/blog/cfe-medecin-remplacant.md` — texte du fondateur repris tel quel
et mis au format maison. **Fiche Fiscalité #12**. Cover 4:5 :
`src/assets/blog/cfe-medecin-remplacant-cover.jpg`.

**Confirmé sur source primaire, sans changement :** redevabilité sans local ;
exonération l'année de création, base réduite de moitié l'année suivante, seuil
de 5 000 € ; barème 2026 de la base minimum (250-597 / 250-1 194 / 250-2 509 /
250-4 183 €) ; recettes N-2 ramenées à douze mois ; 1447-C avant le 31 décembre ;
avis uniquement en ligne, 15 décembre, paiement dématérialisé, acompte de 50 % ;
majoration de 5 % ; lieu d'imposition au cabinet prépondérant (CE 24 nov. 2017
n° 412505, BOFiP BOI-IF-CFE-20-40-20 du 24 août 2022) ; dégrèvement prorata
temporis en cas de cessation ; taux de Paris (16,52 %) et de Saint-Denis (38,49 %).
Sources : entreprendre.service-public.gouv.fr (vérifiée le 2 avril 2026), BOFiP, CGI.

**Écarts par rapport au texte fourni :**

- ⚠️ **Le « dégrèvement pour diminution des bases » (art. 1647 bis) ne s'applique
  pas utilement au remplaçant.** Le texte le présentait comme un levier à demander
  quand les recettes baissent. Or (1) les « bases » visées sont la valeur locative
  foncière (BOI-IF-CFE-40-30-20-20), qu'un remplaçant sans local n'a pas ; (2) le
  dégrèvement ne peut pas ramener la CFE sous la cotisation minimum de l'art.
  1647 D (BOI-IF-CFE-40-30-20-30, § 230) — qui est précisément ce que paie le
  remplaçant. Le paragraphe est réécrit : la base minimum suit d'elle-même les
  recettes N-2 (on redescend de tranche sans rien demander), et le 1647 bis est
  présenté comme ne concernant pas le remplaçant sans local. Le titre de section
  passe de « Les deux dégrèvements que presque personne ne demande » à « Activité
  en baisse, arrêt du libéral : ce que tu peux récupérer ». La phrase « Personne ne
  te le proposera : c'est une réclamation… » est déplacée sur le dégrèvement de
  cessation, le seul des deux qui se demande.
- Check-list, exonération rurale : « zone de revitalisation rurale » → « zone
  France ruralités revitalisation (FRR, ex-ZRR) » (l'art. 1464 D vise désormais les
  FRR), avec lien vers la fiche #11. Une phrase ajoutée : le texte vise les
  praticiens qui **s'établissent** dans la commune ; en remplacement pur, cas à
  faire confirmer par le SIE.
- **Ajouts** : bloc « L'essentiel », tableau du barème 2026 de la base minimum,
  7 FAQ (reprennent l'article ; seul fait nouveau : les bornes 2026 du barème),
  section Sources au format maison (celles du texte, complétées), 8 liens internes.
- Titre raccourci pour la balise `<title>` : « CFE médecin remplaçant : la taxe de
  décembre ».

**Maillage entrant** : lien sur la ligne CFE de décembre dans
`calendrier-fiscal-remplacant` (`updatedDate` au 20 septembre 2026, répercutée dans
`blog-meta.json`) et une phrase avec lien dans `frais-pros-medecin-liberal-2026`
(déjà daté du jour).

Lighthouse mobile local : perf 98, a11y / SEO 100, CLS 0 ; bonnes pratiques 100
sur deux passages, 96 sur un (non reproduit).

### 9.aw Nouvel article : l'effet ciseaux (20 septembre 2026)

`src/content/blog/effet-ciseaux-regularisation-urssaf-medecin.md` — texte du
fondateur repris tel quel et mis au format maison. **Fiche Fiscalité #13**.
Cover 4:5 : `src/assets/blog/effet-ciseaux-cover.jpg`.

**Confirmé sur source primaire — aucun chiffre ni mécanisme corrigé :**

- Provisionnel sur N−2 puis N−1, régularisation à la déclaration, modulation sur
  revenu estimé, délais de paiement : urssaf.fr, CSS art. L131-6-2 (cohérent avec
  `tout-comprendre-urssaf`, § 9.aq).
- CARMF (carmf.fr, cotisations 2026) : complémentaire à 11,80 % sur les revenus
  2024 « sans régularisation ultérieure » ; ASV (part forfaitaire + ajustement sur
  les revenus 2024, deux tiers pris en charge en secteur 1) ; régime de base
  provisionnel puis régularisé (8,73 % / 1,87 %). Le taux complémentaire est bien
  en hausse (10,2 % → 11,8 %), ce qui fonde « les taux CARMF ont augmenté ».
- Réforme d'assiette : abattement de 26 %, plancher 1,76 % × 48 060 = 845,86 €
  (« environ 846 € »), plafond 130 % × 48 060 = 62 478 € ; PASS 2026 = 48 060 €.
- « De l'ordre de 10 % du bénéfice » côté URSSAF en secteur 1 : cohérent avec le
  détail (CSG-CRDS 9,7 % sur l'assiette abattue ≈ 8,8 % du bénéfice, + CURPS, CFP,
  maladie et AF résiduelles après prise en charge). Les trois exemples
  (3 000 / 3 000 / 5 000 €) sont arithmétiquement justes.
- « Les mensualités peuvent quasiment doubler » : vérifié sur l'exemple 3
  (750 → ~1 580 €/mois avec six échéances restantes, soit × 2,1) ; sur l'exemple 1
  la hausse est plutôt de 60 à 70 %. Formulation conservée (« peuvent »).

**Écarts par rapport au texte fourni :**

- Graphie « Urssaf » → « URSSAF », convention du reste du site.
- Titre raccourci et centré sur la requête : « Régularisation URSSAF : l'effet
  ciseaux expliqué » (le titre d'origine faisait 72 caractères).
- **Ajouts** : bloc « L'essentiel », 7 FAQ (reprennent l'article, aucun fait
  nouveau), section Sources au format maison (taux CARMF 2026 inclus), 8 liens
  internes, et un encadré de deux phrases sur le **RSPM** : seul cas qui échappe
  aux ciseaux, puisqu'on y cotise directement sur les honoraires déclarés
  (13,5 % / 21,2 %), sans provisionnel.
- Les trois temps de « l'onde de trois ans » passent en liste à puces (mêmes mots).

**Maillage entrant** : parenthèse avec lien dans la section « Moduler » de
`tout-comprendre-urssaf` (`updatedDate` 23 août → 20 septembre 2026, répercutée
dans `blog-meta.json`).

⚠️ **À regarder côté app (Edge Function `calculate-urssaf`, hors de ce dépôt)**,
en plus de la décote signalée au § 9.at : en micro-BNC, la CSG-CRDS renvoyée pour
72 000 € de recettes est 5 773 €, soit 9,7 % de 59 515 € (= 47 520 € + cotisations
obligatoires, l'ancienne assiette). Or `tout-comprendre-urssaf` (sourcé) dit qu'en
micro-BNC l'assiette reste les recettes après abattement de 34 %, soit 47 520 € →
4 609 €. Écart d'environ 1 160 € à confirmer ; s'il est avéré, les cotisations du
cas-type de § 9.at passeraient de ~18 100 à ~17 000 € (net ≈ 3 970 €/mois au lieu
de ≈ 3 900). Non corrigé dans l'article tant que ce n'est pas tranché.

Lighthouse mobile local : perf 98 (3 passages), a11y / BP / SEO 100, CLS 0.

### 9.ax Nouvel article : voiture, barème kilométrique ou frais réels (20 septembre 2026)

`src/content/blog/voiture-bareme-kilometrique-ou-frais-reels-medecin.md` — texte du
fondateur repris tel quel et mis au format maison. **Fiche Fiscalité #14**.
Cover 4:5 : `src/assets/blog/voiture-bareme-frais-reels-cover.jpg`.

**Confirmé sur source primaire — aucun chiffre ni règle corrigé :**

- Barème kilométrique 5 CV (0,636 / 0,357 + 1 395 / 0,427), non revalorisé depuis
  l'arrêté du 27 mars 2023 ; majoration de 20 % pour l'électrique ; péages,
  stationnement et intérêts d'emprunt en sus (service-public.gouv.fr, 15 avril 2026).
- BOFiP BOI-BNC-BASE-40-60-40-20 : option a priori au 1er janvier, annuelle, pour
  l'ensemble des véhicules (§ 130-160) ; barème admis pour un véhicule conservé
  dans le patrimoine privé (§ 410) ; intérêts d'emprunt déductibles seulement si le
  véhicule est inscrit au registre des immobilisations (§ 510).
- Plafonds de l'art. 39-4 : 30 000 / 20 300 / 18 300 / 9 900 € aux seuils de 20,
  50 et 160 g/km.
- Art. 151 septies (90 000 / 126 000 €, cinq ans) et réintégration sociale des
  plus-values à court terme exonérées (CSS, art. L131-6).
- Micro-BNC : 83 600 €, 34 %, option pour le réel par simple dépôt de la 2035.
- Les deux cas chiffrés sont arithmétiquement justes (5 679 / 5 745 € ; 3 816 /
  5 850 € ; écarts de 66 € et 2 034 €), ainsi que la plus-value de 6 000 €.

**Écarts par rapport au texte fourni (mise en forme uniquement) :**

- Apostrophes typographiques (’) → droites ('), convention du reste du site.
- Titre : « Médecin libéral : barème kilométrique ou frais réels ? » (requête
  d'abord ; 70 caractères avec le suffixe, au ras du seuil d'avertissement).
- Les trois formules du barème et les quatre plafonds d'amortissement passent en
  tableau ; la précision « (électrique) » / « (la plupart des thermiques) », qui
  faisait déborder le tableau en mobile, est reprise dans la phrase qui suit.
- Un tableau récapitulatif des deux cas (barème / réel / écart) est ajouté sous
  le match ; les calculs détaillés d'origine sont conservés.
- La « subtilité » (actif + barème) et la « réserve de taille » (exonération
  purement fiscale) sont mises en encadré `:::warning`.
- **Ajouts** : bloc « L'essentiel », 7 FAQ (reprennent l'article, aucun fait
  nouveau), section Sources, 9 liens internes.

**Corrigé au passage dans `frais-pros-medecin-liberal-2026`** (déjà daté du jour) :
la note sous le barème disait que « le barème 2025 — légèrement différent —
s'applique » à la déclaration 2026 des revenus 2025. C'est faux : le barème n'a
pas été revalorisé depuis 2023. Remplacé par « Ce barème est inchangé depuis
l'arrêté du 27 mars 2023 : c'est aussi celui de la déclaration 2026 des revenus
2025. » Un lien vers le nouvel article est ajouté en fin de paragraphe
« Option 2 — Frais réels ».

Lighthouse mobile local : perf 97-98 (3 passages), a11y / BP / SEO 100, CLS 0.
Mobile 375 px : les trois tableaux tiennent dans l'écran.

### 9.ay Requalification : nouveau texte FUSIONNÉ dans l'article existant (20 septembre 2026)

Le fondateur a fourni un nouveau texte, « Remplacements réguliers : le risque de
requalification en collaboration ». **Pas de nouvelle URL** : le sujet avait déjà sa
page (`remplacement-regulier-requalification`, 23 août 2026, § 9.aq), au titre
quasi identique. Deux pages sur la même requête se seraient concurrencées, et
l'ancienne contredisait la nouvelle. Décision du fondateur : **fusion dans l'URL
existante**, `updatedDate` au 20 septembre 2026 (répercutée dans `blog-meta.json`).
Titre inchangé. Nouvelle cover 4:5 : `src/assets/blog/requalification-remplacement-cover.jpg`
(l'article empruntait jusque-là celle de `signer-contrat-remplacement`).

**Ce qui vient de l'ancien article et reste** : la jurisprudence (CA Paris 2012, CA
Versailles 2020, Cass. 2021, Cass. soc. 2014), les quatre scénarios de
requalification, l'encadré sur le seuil de TVA cumulé chez le remplacé, la section
« passer en collaboration », la checklist.

**Ce qui vient du nouveau texte** : les trois conditions de l'Ordre et le critère
propre au fisc (caractère occasionnel) ; « le remplacement régulier n'est pas
interdit » et les quatre signaux ; **le volet remplaçant en micro-BNC** (redevance
non déductible → imposé sur 100 % des honoraires) ; la simulation ; les trois
gestes ; « si le courrier arrive » ; le résumé. 3 FAQ ajoutées (8 au total).

**Corrigé dans l'ancien article** : il disait au remplaçant « respire : tes
rétrocessions perçues ne sont pas concernées » et présentait le risque fiscal comme
pesant sur le seul remplacé. C'est vrai pour la **TVA**, faux pour **l'impôt** en
micro-BNC. Intro, FAQ n° 1 et n° 2 et ce passage sont réécrits en conséquence ;
l'ancien encadré « L'essentiel » (« la régularité seule ne requalifie pas »)
devient un encadré « côté juge civil », avec un nouveau « L'essentiel » en tête.

**Écarts par rapport au texte fourni :**

- ⚠️ **Le témoignage d'ouverture est devenu un cas-type reconstruit, annoncé comme
  tel.** Le texte le présentait comme un message reçu d'un confrère (« histoire
  vraie, anonymisée »), citation entre guillemets à l'appui. Il recoupe la
  publication n° 10 du corpus (contrôle du cabinet d'abord, fréquence invoquée,
  rétrocession à 75 %, micro-BNC, proposition de rectification, conseil de l'Ordre
  pris de court), avec des détails modifiés (jours, durée, montant). Les règles de
  `hippodoc-corpus/CLAUDE.md` interdisent de citer un membre même anonymement et
  imposent qu'un redressement reconnaissable soit un cas-type explicitement
  présenté comme tel. Retirés : la citation, « histoire vraie », « un confrère nous
  l'a envoyé », « le cas du DM », « 156 mardis », la réaction du conseil de l'Ordre,
  « les montants dépassaient les virements reçus » (devenu un conseil général :
  vérifier que les montants retenus correspondent aux virements).
- **Simulation, généraliste** : « un jour par semaine » → « deux jours fixes par
  semaine ». 70 000 € d'honoraires sur un seul jour hebdomadaire = ~50 actes par
  jour ; sur deux jours c'est crédible. Le calcul est inchangé et juste : 17 500 €
  de redevance, 11 550 € imposables en plus, 3 465 €/an à 30 % → 10 395 € sur trois
  ans, 11 435 € avec la majoration de 10 %, ≈ 12 000 € avec les intérêts de retard.
- **Simulation, spécialiste** : ≈ 43 000 € sur trois ans → **≈ 30 000 € sur deux
  ans**. Avec 120 000 € d'honoraires requalifiés, le plafond du micro-BNC (83 600 €)
  est dépassé deux années de suite : la troisième année relève d'office du réel, où
  la redevance se déduit. 12 989 €/an à 41 % → 25 978 € sur deux ans, 28 575 € avec
  majoration, ≈ 30 000 € avec intérêts. Une phrase l'explique dans l'article.
- La mention d'en-tête de la simulation devient « majoration de 10 % **et intérêts
  de retard** inclus », pour que les arrondis soient exacts.
- Repère des demi-journées : le texte disait « certains conseils ont retenu environ
  trois demi-journées au-delà desquelles ils ne parlent plus de remplacement ».
  Reformulé d'après les sources : des contrats types plafonnent à deux
  demi-journées par semaine ; le conseil de Loire-Atlantique rappelait les articles
  65 et 89 au-delà de trois demi-journées fixes (page du 28 mai 2025).
- « Le CNOM admet des remplacements réguliers » → formulation neutre (« sont
  admis », « des conseils départementaux diffusent un contrat type ») : seuls des
  contrats types départementaux ont été retrouvés.
- Piste du régime réel rétroactif : ajout d'une phrase de prudence (l'option se
  prend normalement dans les délais de déclaration).

⚠️ `verify-site.mjs` émet désormais un avertissement : **13 URL partagent le
`lastmod` 2026-09-20**. Ce n'est pas une date de génération : ce sont les six
nouveaux articles du jour et les sept articles réellement modifiés (maillage,
corrections, cette fusion). Avertissement attendu, sans action.

Lighthouse mobile local : perf 97 (3 passages), a11y / BP / SEO 100, CLS 0.
Mobile 375 px : pas de débordement, le tableau tient dans l'écran.

### 9.az Audit du blog, lot 1 — corrections de fond vérifiées (21 septembre 2026)

Audit complet du blog mené le 21 septembre 2026 (42 articles lus sur 46, 8 audits
transverses ; rapport dans `Claude outputs/audit-blog-2026-09-21.md`, hors dépôt).
La contre-vérification automatique n'a pas abouti (limite de dépense) : les
constats critiques ont été vérifiés à la main sur source primaire. Ce lot ne
contient que des corrections vérifiées.

**`facturation-electronique-medecin-remplacant`** — mise en ligne de la correction
du fondateur, restée locale depuis le 20 septembre : le défaut de plateforme agréée
est bien sanctionné (mise en demeure, 3 mois, 500 € puis 1 000 € par trimestre ;
droit à l'erreur — loi n° 2026-103 du 19 février 2026, art. 123). La prod disait
« pas d'amende dédiée », y compris dans le JSON-LD FAQPage. Ajout : la RCP et la
banque ne sont plus citées comme fournisseurs qui factureront par plateforme —
assurance et opérations bancaires sont exonérées de TVA (CGI, art. 261 C), donc
hors réforme selon la règle que l'article énonce lui-même. Remplacées par
téléphonie, comptable, matériel, avec une phrase qui l'explique.

**`medecin-remplacant-travailler-6-mois-par-an`** — (1) encadré RSPM faux :
« sous 38 000 € » ; le RSPM ne s'ouvre que jusqu'à 19 000 €, on peut y rester
jusqu'à 38 000 €, et deux années de suite au-dessus de 19 000 € font basculer au
PAMC : ce n'est donc pas un cadre pour un mi-temps durable. Réécrit. (2) La sortie
du micro-BNC n'est pas automatique au premier dépassement : précisé à trois
endroits (tableau, FAQ 3 et 6). (3) Hypothèses du « + 38 000 € » écrites : le
moteur applique au réel les déductions forfaitaires du secteur 1 (2 %, groupe III,
3 %) ; sans le seul forfait 2 %, le second semestre donne 37 058 € au lieu de
38 239 € — le chiffre tient. La mention finale disait à tort « sans frais
professionnels pris en compte ».

**`effet-ciseaux-regularisation-urssaf-medecin`** — encadré RSPM (même erreur de
seuil) ; « l'automne suivant » → « quelques semaines après ta déclaration de
printemps » (la régularisation est lissée sur les échéances restantes dès la
déclaration) ; ajout : l'abattement de 26 % ne s'applique pas au micro-BNC
(cohérent avec `tout-comprendre-urssaf`) ; l'exemple de l'ASV forfaitaire, qui
n'explique pas le surcoût du secteur 2, est remplacé par la maladie et les
allocations familiales ; « comme tout indépendant au réel » → « comme tout
indépendant » ; nom exact du service ajouté (« Moduler mes revenus », urssaf.fr).
⚠️ L'audit proposait de bannir le mot « modulation » : **réfuté** — c'est bien le
nom que l'URSSAF donne au service pour les praticiens.

**`remplacement-regulier-requalification`** — (1) **décret n° 2026-691 du 27 juillet
2026** (JO du 29, en vigueur le 30) : le mot « libérale » a disparu de
l'art. R.4127-65, le remplacé doit cesser *toute* activité médicale. « Activité
hospitalière » et « activité extérieure » retirées des motifs d'absence (trois
endroits), règle nouvelle expliquée, source ajoutée. (2) Simulation du
spécialiste : la tranche à 41 % était impossible (120 000 € × 66 % = 79 200 €,
sous le seuil de 84 577 €). Recalcul à 30 % : 9 504 €/an, 19 008 € sur deux ans,
20 909 € avec majoration, **≈ 22 000 €** avec intérêts (au lieu de ≈ 30 000 €).

**`cfe-medecin-remplacant`** — deux précisions : pour les deux premières CFE, les
recettes de référence sont celles de l'année de création ramenées à douze mois ;
le seuil de 5 000 € s'apprécie lui aussi sur douze mois (corps et FAQ).

**`src/data/boussoleData.ts`** — dates limites 2026 de la déclaration de revenus :
jeudi 21 mai (01-19 et non-résidents), jeudi 28 mai (20-54), jeudi 4 juin (55+),
au lieu des vendredis 22, 29 mai et 5 juin. Ces libellés n'alimentent que l'index
de recherche du guide (îlot), pas le HTML statique : pas de changement de
`lastmod` du guide.

`updatedDate` au 21 septembre 2026 sur les cinq articles, répercutée dans
`blog-meta.json`.

**Restent ouverts (lots suivants de l'audit)** : décret de déontologie dans
`signer-contrat-remplacement` (règle des 90 jours supprimée) ; option pour le réel
« avant le 1er février » ; CARMF 2026 à 11,80 % ; ACRE 2026 ; exemple « Léa » ;
Livret A et LEP ; phrases de référence (RSPM, rétrocession, poids des
cotisations) ; gabarits ; maillage.

### 9.ba Audit du blog, lot 2a — erreurs de fond dans douze anciens articles (21 septembre 2026)

Corrections issues de l'audit du 21 septembre. Chaque constat a été vérifié sur
source primaire par l'auditeur (URL citée), puis relu par moi avant application.
Retouches minimales : seul le passage fautif est réécrit. `updatedDate` au
21 septembre 2026 sur les douze articles, répercutée dans `blog-meta.json`.

| Article | Avant | Après | Source |
|---|---|---|---|
| `signer-contrat-remplacement` | « Plus de 90 jours → clause de non-installation de 2 ans » | Plus de règle automatique depuis le 30 juillet 2026 : tout dépend du contrat ; accord du remplacé ou autorisation du CDOM pour s'installer malgré la clause. H2 renommé « non-réinstallation » (terme du texte) | CSP, art. R.4127-86, décret n° 2026-691 |
| idem | « Durée illimitée pour les médecins thésés » | Aucun texte ne chiffre de durée, mais le remplacement doit rester temporaire ; les 3 mois des non-thésés sont la durée de l'autorisation du CDOM | CSP, art. R.4127-65 ; CNOM |
| idem | Le remplacé arrête « toute activité libérale » | « Toute activité médicale », y compris hospitalière ou salariée, sauf dérogation | CSP, art. R.4127-65 (30 juillet 2026) |
| `regime-fiscal-micro-bnc-vs-reel` | « Opter pour le réel avant le 1er février » (FAQ 5) | Option par simple dépôt de la 2035 dans le délai légal, au printemps suivant ; un an, reconduction tacite | BOFiP BOI-BNC-DECLA-10-10, § 130-140 |
| idem | Encadré prorata : « deux demi-années » peuvent faire sortir du micro | Seule l'année de création est proratisée ; l'année N+1, complète, doit dépasser réellement le seuil | BOFiP BOI-BNC-DECLA-20-10, § 135 |
| idem | Règle « charges > 34 % » sans les cotisations (cinq endroits) | « Cotisations URSSAF et CARMF comprises » + lien vers `/simulateur` | CGI, art. 102 ter ; `BreakEvenAnalysis.tsx` |
| `calendrier-fiscal-remplacant` | « En 3e année, l'URSSAF régularise » ; trimestriel « le 5 ou 20 » ; « T4 N-1, T1, T2, T3 » ; 2035 « avant début mai » ; « réception » de l'avis de CFE | Régularisation dès la déclaration de l'année suivante ; trimestriel les 5 février, mai, août, novembre (quatre parts égales de l'année) ; dates 2026 ; 2035 télétransmise jusqu'au 20 mai ; avis de CFE mis en ligne | CSS, art. R613-3 ; service-public F39739 ; impots.gouv.fr |
| `tout-comprendre-urssaf` | Inscription « sur autoentrepreneur.urssaf.fr » ; « régularisation en 3e année » | Portail des médecins remplaçants (RSPM) ou guichet unique ; régularisation dès l'année suivante, lien vers l'effet ciseaux | service-public F36740 |
| `tout-comprendre-carmf` | Complémentaire « ~10,20 % en 2026, 11,80 % à partir de 2027 » ; plafond ~17 000 € ; ASV 1 850 € + 1,27 % / 5 550 € + 3,80 % ; base « entre 1 et 5 PASS » | **11,80 % en 2026** sur les revenus N-2, sans régularisation, assiette plafonnée à 168 210 €, cotisation maximale 19 849 € ; ASV 1 917 € + 1,33 % (S1) / 5 751 € + 4 % (S2) ; 1,87 % sur l'ensemble des revenus jusqu'à 5 PASS | carmf.fr, cotisations 2026 |
| idem | Exemples à 40 000 € et 90 000 € | Recalculés par application directe des taux 2026 : ~12 000 € (30 %) et ~17 000 € (42 %) ; ~20 000 € (22 %) et ~26 500 € (29 %) | Recalcul |
| `cotisations-sociales-vs-impots` | Cotisations « 35 à 45 % », URSSAF « 20-25 % », CARMF « 10-15 % » ; « il te reste 450 à 600 € sur 1 000 € » | Environ un quart des rétrocessions (URSSAF ≈ 8 %, CARMF ≈ 16 %) ; ≈ 250 € de cotisations, ≈ 100 € d'impôt, reste ≈ 650 € | Moteur du simulateur (72 000 € : 18 124 € + 7 360 €) |
| `frais-professionnels-deductibles` | « L'abonnement Hippodoc est 100 % déductible » sans condition (FAQ, donc JSON-LD) ; « si tes frais dépassent 34 % » | Déductible au régime réel seulement ; cotisations comprises dans les 34 % | CGI, art. 102 ter |
| `generer-facture-remplacement` | « Conserver 10 ans (obligation fiscale) » | 6 ans au minimum ; 10 ans par prudence | LPF, art. L.102 B ; BOFiP BOI-CF-COM-10-10-30-10 |
| `checklist-administrative-medecin-remplacant` | « Demander ta carte Vitale professionnelle » | La CPS (ou CPF) est envoyée par l'Agence du numérique en santé | ameli.fr |
| `simulateur-super-net-combien-reste` | Micro-BNC accessible si 2024 **et** 2025 sous le seuil ; RSPM « plafonne à 19 000 € » | 2024 **ou** 2025 ; seuil d'entrée de 19 000 €, maintien jusqu'à 38 000 € | service-public F32105 ; urssaf.fr |
| `salariat-10-pourcent-ou-frais-reels` | « 10 % de ton salaire brut » ; « revenu imposable » | 10 % du salaire net imposable (case 1AJ) | BOFiP BOI-RSA-BASE-30-50-20 |
| `rspm-exemples-concrets` | « Pour les médecins avec CA < 38 000 € » ; sortie « si dépassement > 2 ans » ; « 13,5-21,2 % vs ~35-45 % » | Remplacements exclusifs, 19 000 € à l'entrée, maintien jusqu'à 38 000 € ; sortie après deux années de suite au-dessus de 19 000 € ou une seule au-dessus de 38 000 €, au 1er janvier suivant ; comparaison ramenée à la même base (14-18 % contre environ un quart des honoraires) | CSS, art. D. 642-4-1 et R. 642-6 |

**Réserves.** `tout-comprendre-carmf` et `tout-comprendre-urssaf` n'ont pas été lus
par l'audit (lecture interrompue) : seuls les points signalés depuis d'autres
articles y sont corrigés. Les exemples CARMF sont un calcul direct sur les taux
publiés, non rapproché du moteur du simulateur.

**Rectificatif au § 9.aw.** J'y signalais un possible écart d'assiette de la
CSG-CRDS en micro-BNC dans `calculate-urssaf`. L'audit a reproduit le cas-type
(72 000 € → 18 124 € de cotisations, 7 360 € d'impôt) **à l'euro près avec le
simulateur public de l'URSSAF** : l'alerte est sans objet. Celle sur la décote
(§ 9.at) reste ouverte.

**Non traité dans ce lot** (constats « importants » des mêmes articles) : sections
Sources, mentions d'information générale, maillage, marqueurs de nouveauté périmés.

**Lot 2b, à suivre** : `frais-pros-medecin-liberal-2026` (PER, ACRE 2026),
`frais-pros-medecins-salaries-internes-2026` (exemple « Léa », réclamation,
amortissement — slides à refaire), `interets-composes…` (Livret A, LEP — slides),
`conge-maternite-paternite` (IJ en micro-BNC, congé de naissance),
`micro-bnc-exemples-concrets` (recalcul 2026), `remplir-declaration-2035`,
`remplacement-salarie-guide-complet`, `choix-mode-exercice` (intérim).

### 9.bb Audit du blog, lot 2b — six articles, corrections vérifiées à la main (21 septembre 2026)

La vérification par agents a échoué (plus de crédits d'usage) : ce lot ne contient
que des corrections **vérifiées par moi** sur source primaire ou par recalcul.
`updatedDate` au 21 septembre 2026, répercutée dans `blog-meta.json`.

| Article | Avant | Après | Source |
|---|---|---|---|
| `interets-composes-meilleur-remplacement` | « Livret A 2,4 % en 2026 » → 30 ans pour doubler ; « LEP 3,5 % » → 21 ans ; 10 000 € → 20 000 € contre 80 000 € | Livret A **1,7 %** depuis le 1er août 2026 → 42 ans ; LEP **2,5 %** → 29 ans ; 10 000 € → ≈ 16 600 € contre ≈ 76 000 € (« plus de ×4 ») | Ministère de l'Économie, 15 juillet 2026 ; règle des 72 |
| `frais-pros-medecin-liberal-2026` | « Le PER se déduit du revenu global, pas du BNC » (FAQ, essentiel, encadré) | Deux voies au choix : bénéfice BNC (2035, art. 154 bis) ou revenu global (2042, art. 163 quatervicies), jamais les deux | CGI |
| idem | ACRE décrite comme avant 2026 | Réservée à certains profils depuis le 1er janvier 2026, plafonnée à 25 %, dégressive | Loi n° 2025-1403 (LFSS 2026) |
| `frais-pros-medecins-salaries-internes-2026` | « Déclaration corrective sur 3 ans (revenus 2022, 2023, 2024) » — FAQ, essentiel, corps | Réclamation : revenus 2023 jusqu'au 31/12/2026, 2024 jusqu'au 31/12/2027 ; 2022 n'est plus rattrapable | LPF, art. R*196-1 |
| idem | Matériel > 500 € : « étalement recommandé sur 2-3 ans » | Étalement obligatoire au-delà de 500 € HT, 3 ans pour l'informatique | Doctrine frais réels |
| `remplacement-salarie-guide-complet` | « Tu ne peux pas amortir ton ordi, bureau ou voiture » | Ordinateur et bureau déductibles (une fois jusqu'à 500 € HT, sinon étalés) ; voiture par le barème | idem |
| `conge-maternite-paternite` | « Allocation + IJ = imposables, à intégrer aux recettes BNC » | Vrai au réel ; en micro-BNC elles ne s'ajoutent pas aux recettes | Position DGFiP 2022 ; guide du site |
| idem | « À venir (LFSS 2026) … décrets attendus » | En vigueur depuis le 1er juillet 2026 (décrets du 31 mai) : ≈ 1 380 € puis ≈ 1 190 € par mois, conditions | ameli.fr ; ministère |
| `remplir-declaration-2035` | Dépôt « avant début mai » (FAQ et corps) | Télétransmission jusqu'au 20 mai 2026 (2e jour ouvré après le 1er mai + 15 jours) | impots.gouv.fr |

**⚠️ Laissé en l'état, décision du fondateur attendue — `frais-pros-medecins-salaries-internes-2026`, exemple « Léa ».**
Le gain annoncé (≈ 1 435 €, « TMI 30 % ») est faux pour son profil : à 30 000 € de
salaire elle est dans la tranche à 11 %. Recalcul (barème et décote 2026) : 1 564 €
d'impôt au forfait, 799 € aux frais réels, soit **≈ 765 €**. Mais la promesse
« ≈ 1 500 € d'impôt en moins, trois semaines de salaire net » porte la description,
l'accroche, « L'essentiel » et très probablement les 19 slides (images). La corriger
revient à re-cadrer l'article : à trancher (changer le profil, ou assumer ≈ 765 €) et
slides à refaire.

**Slides à refaire (images non modifiables ici)** : `interets-composes/` — au moins
les slides qui affichent « Livret A 2,4 % », « 30 ans », « LEP 3,5 % » ; série
`frais-pros-medecins-salaries-internes-2026-slide-*.png` selon la décision sur Léa.

**Non traités, faute de vérification indépendante** : `medecin-outre-mer-avantages-fiscaux`
(exonération outre-mer et CARMF ; indemnité hospitalière 40 %), `salaires-medecins-remplacants`
(plafond légal de l'intérim, titre « 2025 »), `obtenir-sa-licence-de-remplacement`
(date de validité), `guide-impots-internes-remplacants` (ordre des démarches RSPM),
`choix-mode-exercice` (intérim : deux ans d'exercice), `micro-bnc-exemples-concrets`
(recalcul des deux exemples), lignes 22 / 25 / 6 de `remplir-declaration-2035`.

### 9.bc Audit du blog, lot 3a — gabarits : tri, compteurs, contrastes, focus, lignes vides (23 septembre 2026)

Aucun contenu d'article modifié : uniquement les gabarits de `/blog`, des pages de
série et de la page d'article.

- **Tri** (`src/lib/blog-sort.ts`, nouveau) : 38 articles sur 46 partagent leur date
  avec un autre, et le départage retombait sur l'ordre alphabétique des fichiers —
  la « une » de /blog dépendait de la première lettre du slug. Désormais : date
  décroissante, puis numéro d'épisode décroissant, puis slug. Les pages de série
  numérotées (Fiches Pratiques, Fiches Fiscalité) et leurs listes dans l'index
  s'affichent dans l'ordre de lecture #1 → #N ; Guides & Conseils reste du plus
  récent au plus ancien.
- **« À la une »** : nouveau champ de frontmatter optionnel `featured: true`
  (`content.config.ts`). Sans lui, la une est le premier article du tri — aujourd'hui
  « barème kilométrique ou frais réels » (fiche #14). Aucun article n'est marqué :
  choix éditorial laissé au fondateur.
- **Compteurs** : « 14 articles sur 9 prévus » (Fiches Fiscalité) et « sur 8 prévus »
  supprimés — `totalEpisodes` date de la SPA ; « 46 fiches pratiques » → « 46 articles »
  dans l'en-tête de /blog (une série s'appelle « Fiches Pratiques »), même correction
  dans l'index.
- **Pastilles de série** (`blog-series.ts`) : dégradés -500 → -700. Le texte blanc de
  12 px passait de 2,4-4,0:1 à 5,2-7,0:1 (AA). Lighthouse ne le détectait pas (fond en
  dégradé). Fichier marqué « généré », mais le générateur ne doit plus être relancé
  (CLAUDE.md).
- **Focus clavier des cartes** (`BlogCard.astro`) : l'anneau natif était rogné par
  l'`overflow-hidden` de la carte (WCAG 2.4.7). Contour intérieur
  (`-outline-offset-2`), peint par-dessus l'image. Vérifié au clavier.
- **Hiérarchie des titres** : les cartes de « Derniers articles » passent en `h3`
  sous leur `h2` de section (prop `headingLevel`) ; inchangé sur les pages de série.
- **Lignes vides parasites** : `.prose p { white-space: pre-wrap }` doublait chaque
  retour à la ligne forcé (765 `<br>` sur les 46 articles). Contrôle préalable :
  aucun retour à la ligne « doux » (sans `<br>`) dans les paragraphes, donc rien ne
  dépendait de cette règle. Retirée.
- **FAQ** : le marqueur d'ouverture était masqué sans remplacement ; chevron ajouté
  (pivote à l'ouverture), zone cliquable portée par le `<summary>` (44 px minimum).
- **Cases à cocher invisibles** (tiroir mobile du Header, sommaire) : elles restaient
  focusables sur ordinateur, où leur libellé est masqué — premier Tab de chaque
  page sur une case invisible. `lg:hidden` / `xl:hidden` les retire de l'ordre de
  tabulation. Sommaire de niveau 3 : `text-muted-foreground/85` (3,6:1) →
  `text-muted-foreground`.

Lighthouse mobile local, `main` contre cette branche (3 passages) : `/blog` 96 / 95-96 ;
`/blog/serie/fiches-fiscalite` 94-95 / 94 — pas de régression. La page de série est
**sous 95 sur `main` aussi** : à traiter avec le lot images (cover de la première
carte). Accessibilité, bonnes pratiques et SEO à 100, CLS 0.

**Reste pour le lot 3b (images)** : image de partage paysage 1200×630, images du
JSON-LD Article, hauteur de la cover sur ordinateur, 11 covers de 450 px, cover
partagée de la facturation électronique, préchargement de la une sur ordinateur.

### 9.bd Audit du blog, lot 3b — images : partage social, JSON-LD, hauteur de la cover (23 septembre 2026)

Aucun contenu d'article modifié. Fichiers : `src/pages/blog/[slug].astro`,
`src/layouts/BaseLayout.astro`.

- **Image de partage** : les 46 articles envoyaient la cover PORTRAIT en WebP tout
  en déclarant `og:image` 1200×630. LinkedIn, WhatsApp, Facebook et X recadraient
  au centre et coupaient le titre dessiné en haut. Désormais : recadrage paysage
  1,91:1 calé sur le **haut** de la cover (`fit: 'cover', position: 'top'`), en
  JPEG ; `og:image:width/height` = dimensions réelles du fichier (nouvelles props
  `ogImageWidth` / `ogImageHeight` de BaseLayout, défaut 1200×630 pour les autres
  pages). Contrôlé visuellement : titre entier sur CFE et rétrocession.
- **JSON-LD Article** : `image` passe d'une URL portrait à trois recadrages 16:9,
  4:3 et 1:1 (recommandation Google). `<meta name="robots" content="max-image-preview:large">`
  ajouté sur toutes les pages indexables (condition des grandes vignettes Discover).
- **Cover d'en-tête** : affichée en pleine largeur (832 × 1 251 px), elle repoussait
  le premier mot à ~1 600 px sur ordinateur. Plafonnée à 448 px à partir de `sm`
  (`sm:max-w-md`, centrée) : le texte commence à ~930 px. Mobile inchangé.
- **srcset honnête** : la largeur demandée à `getImage` est bornée à celle de la
  source et les candidats sont dédoublonnés — onze covers de ~450 px étaient
  annoncées « 800w » et « 1200w ». Candidats : 480 / 800 / 900 px.

Lighthouse mobile local : CFE 98, URSSAF 98, frais pros salariés 94-95 (identique à
`main` sur trois passages : le carrousel de 19 slides pèse, sans lien avec ce lot) ;
desktop CFE 100. A11y / BP / SEO 100, CLS 0.

**⚠️ Action fondateur — covers à ré-exporter** : l'image de partage ne peut pas être
plus large que la source. Onze covers font ~450 px, donc des aperçus de 450 × 236 px
(flous sur LinkedIn) et une cover floue sur ordinateur : `calendrier-fiscal-remplacant`,
`checklist-ultime-medecin-remplacant`, `choix-mode-exercice`,
`cotisations-sociales-vs-impots`, `frais-professionnels-deductibles`,
`maitrise-ton-logiciel-metier-en-30-min`, `outils-numeriques-indispensables-cabinet`,
`regime-fiscal-micro-bnc-vs-reel`, `remplir-declaration-2035`, `tout-comprendre-carmf`,
`tout-comprendre-urssaf`. Format cible : 1611 × 2000 comme les fiches récentes, même
nom de fichier dans `src/assets/blog/`. Aussi : une cover propre pour
`facturation-electronique-medecin-remplacant` (elle partage celle de
`generer-facture-remplacement`, titrée « T'as remplacé, t'as facturé »).

### 9.be Audit du blog, lot 4 — maillage interne et phrases de référence (23 septembre 2026)

**Liens posés sur des mots existants** (53 liens dans 30 articles, corps uniquement,
aucune phrase réécrite ; chaque ancre vérifiée unique avant remplacement) :
- **Ancres « rétrocession »** : les 5 qui pointaient vers `salaires-medecins-remplacants`
  pointent vers le pilier `retrocession-honoraires-medecin-remplacant` ; le lien de
  `signer-contrat-remplacement` (« rétrocession à définir ultérieurement ») est retiré,
  l'article liant déjà le pilier ; l'ancre vague « À négocier » (trouver) est retirée
  au profit de « Rétrocession » ; deux nouveaux liens (requalification, facturation
  électronique).
- **Orphelins** : facturation électronique (3 liens entrants), inbox zéro (3 + 2
  sortants), intérêts composés (3 + 2 sortants).
- **Renvois en texte brut** liés : « fiche pratique #6 / #7 », « Fiche fiscalité
  #1 / #3 ». Retirés (sans objet sur le site) : « (cf. prochaine fiche) » et
  « (cf. fiche précédente) » dans `micro-bnc-exemples-concrets`.
- **Quasi-orphelins** : outre-mer, salariat 10 %, guide frais pros des salariés,
  syndrome de l'imposteur, base financière, checklists.
- **Articles du 20 septembre** : liens entrants vers CFE (4), voiture (3, dont une
  ancre « Barème kilométrique » re-ciblée), effet ciseaux (3), 6 mois / 12 mois (2),
  zones FRR (1).
- **/simulateur** : « simulateur SuperNet Hippodoc », « simulateur intégré »,
  « simuler ton vrai revenu net ».
- Finitions : « Découvre Hippodoc ici ! » → « Découvre Hippodoc » ; « www.carmf.fr »
  en HTTPS ; « 34 % » dans l'ancre.
- **Une seule phrase ajoutée** : `salariat-10-pourcent-ou-frais-reels`, section
  « Les frais réels » : « — le guide poste par poste des frais réels détaille
  chacune » (seul article resté sans lien entrant).

**`relatedArticles`** : 23 articles mis à jour (aucun texte touché) — les anciens
articles citent désormais les articles d'août-septembre ; `conge-maternite-paternite`
reçoit des connexes pertinents (URSSAF, 2035, salariat) au lieu de budget / base
financière / calendrier ; `super-net-budget` et `generer-facture-remplacement`
remplacent un connexe hors sujet. Plus aucun article n'est absent des connexes.

**Gabarit** : la pastille de série de chaque article devient un lien vers sa page de
série, et la série entre dans le fil d'Ariane visible et le `BreadcrumbList`
(Accueil › Blog › série › article) — les trois pages de série ne recevaient aucun
lien depuis les articles. Liens de partage WhatsApp / LinkedIn en `nofollow`.

**Pages de série** : intro Fiches Fiscalité liée (URSSAF, CARMF, micro-BNC, 2035,
PDSA, calendrier) et complétée des cinq nouvelles fiches, « 4 à 7 minutes » → « de
4 à 15 minutes » ; intro Guides & Conseils liée (maternité, organisation, syndrome de
l'imposteur, enveloppes) + rétrocession et requalification. **404** : « 38 fiches
pratiques » → « Nos fiches pratiques ».

**Phrases de référence — rétrocession** : fourchettes « 60-80 % » / « 70-80 % »
alignées sur l'article de référence (70-90 % en médecine générale, repère 80 % ;
60-70 % avec plateau technique) dans `choix-mode-exercice` (3), `pieges-debut-carriere`,
`salaires-medecins-remplacants`, `trouver-facilement` (2), `signer-contrat`.
**RSPM** : dernière mention « CA < 38 000 € » (`tout-comprendre-urssaf`, FAQ) alignée.

**Dates** : les ajouts de liens ne relèvent **pas** `updatedDate` — un « Mis à jour
le… » sur 35 articles dont le contenu n'a pas changé serait trompeur (constat de
l'audit). Règle retenue : `updatedDate` seulement pour une modification du fond.

**Garde-fou** (`verify-site.mjs`) : échec si un `relatedArticles` cite un slug
inexistant (testé en injectant un faux slug) ; avertissement si un article n'a aucun
lien entrant depuis le texte d'un autre article, ou n'est cité dans aucun
`relatedArticles`. État actuel : aucun avertissement.

**Non traités (à suivre)** : liens depuis `/faq`, `/simulateur`, le glossaire du guide
et ses sous-pages ; liens vers les sources officielles dans les sections Sources ;
`llms.txt` ; footer. ⚠️ `/simulateur` décrit encore le RSPM comme applicable « en
dessous de 38 000 € » (texte de page + mode Auto du moteur) : à revoir côté produit.

### 9.bf Audit du blog, lot 5 — conversion et mesure (23 septembre 2026)

**Position de l'appel à l'action.** Le bloc d'inscription fermait la page, derrière
la FAQ, le bloc auteur, le partage, « Pour aller plus loin » et 3 à 6 articles
connexes : 2,4 à 2,9 écrans mobiles après la fin du texte. Il vient désormais
**juste après le texte**, avant la FAQ. Son titre passe de `<h3>` (rattaché à tort au
`<h2>` « Articles connexes ») à `<p>`. Il est rendu sur **tous** les articles.

**Contenu du bloc** (ajouts de wording, repris de textes existants du site) :
- `PRODUCT_DEFINITION` de `site.ts`, mot pour mot : le bloc ne nommait jamais le
  produit, et 5 articles ne le citent nulle part.
- Lien direct Calendly « Prendre 15 min avec Ryan » (libellé repris de `/simulateur`
  et de la FAQ d'accueil), `data-calendly="blog_article"` : UTM de session et
  `calendly_clicked` gérés par `brancherCalendly()`. Jamais le widget.
- Quand `ctaHref: "/simulateur"` : bouton « Simule ton Super-Net » (libellé de
  « Pour aller plus loin »), `data-track="cta_simulateur_blog"`, et lien secondaire
  « Ou commence l'essai gratuit · 30 jours · Sans engagement » (`cta_signup_blog`).

**Destination par article** — nouveau champ `ctaHref` (`src/content.config.ts`,
seule valeur admise : `/simulateur`). Les boutons qui promettaient une simulation
ouvraient le formulaire d'inscription. Renseigné sur 8 articles : Super-Net,
outre-mer, enveloppes, intérêts composés, base financière, 6 mois / 12 mois,
rétrocession, zones FRR (le simulateur gère ZFU / ZFRR). L'article voiture garde
l'inscription : le simulateur ne traite pas les frais de véhicule.

**Accroches ajoutées** (champ `cta`, 8 articles qui n'en avaient pas) :
| Article | `cta` |
|---|---|
| checklist-ultime | « Prêt(e) à garder toute ta gestion au même endroit ? » |
| choix-mode-exercice | « Prêt à suivre ce que te rapporte vraiment chaque mode d'exercice ? » |
| maitrise-ton-logiciel-metier | « Le logiciel métier maîtrisé ? Simplifie aussi ta gestion » |
| obtenir-sa-licence | « Licence en poche ? Prépare tes premiers remplas » |
| outils-numeriques | « Prêt à ajouter Hippodoc à ta boîte à outils ? » |
| remplacement-salarie | « Prêt à suivre salaires et remplas au même endroit ? » |
| signer-contrat | « Génère ton contrat de remplacement en quelques clics » |
| trouver-facilement | « Prêt à organiser tes remplas dès le premier ? » |

**Promesses corrigées** (texte modifié) :
- « Télécharge Hippodoc » ×2 (Hippodoc est une application web, rien à
  télécharger) → « Crée ton compte Hippodoc » (checklist premier jour, `cta`) et
  « Essaie Hippodoc gratuitement pendant 30 jours » (trouver-facilement).
- 6 mois / 12 mois : « …et automatise ta gestion de remplaçant, de la déclaration
  URSSAF au suivi de tes jours. Ton comptable de poche, pour décider… » →
  « …, centralise tes rétrocessions et ton planning, et prépare tes déclarations —
  pour décider… ». L'ancienne phrase contredisait `PRODUCT_DEFINITION` et
  `/comparatif` (Hippodoc ne dépose pas la déclaration et ne remplace pas le
  comptable).
- « hippodoc.fr » en gras sans lien (reliquats de légende Instagram) → liens :
  intérêts composés (→ `/simulateur`, la phrase parle de « ce qu'il te reste
  vraiment »), guide impôts internes, frais pros salariés, outils numériques (→ `/`).
- « Abonnement 100 % déductible » : déjà nuancé au lot 1, rien à faire.

**Pages de liste.** `/blog` et les pages de série n'avaient aucun appel à l'action.
Nouveau `BlogCtaBand.astro` (statique) : « Et tes chiffres à toi ? » + « Simule ton
Super-Net » + « Essai gratuit 30 jours » — texte nouveau.
`data-track="cta_simulateur_blog_index|blog_serie"`, `cta_signup_blog_index|blog_serie`.
Sur `/blog`, entre « Derniers articles » et l'index ; sur les séries, après les cartes.

**Mesure.**
- ⚠️ **Attribution vers l'app — le § 9.ab était inexact.** En `localStorage+cookie`,
  posthog-js 1.413.1 n'écrit dans le cookie `.hippodoc.fr` que 7 clés internes ; les
  `hd_premiere_*` restaient dans le localStorage de www, cloisonné par origine, et
  n'atteignaient **jamais** l'app. Correctif : `cookie_persisted_properties` liste les
  clés `hd_*` (vérifié en navigateur : cookie de 739 octets portant `hd_premiere_page`,
  `hd_dernier_article`…). Code lu : l'app fusionne le cookie SOUS son localStorage au
  chargement, donc les récupère à sa première visite.
- **Dernier article lu** : `register({ hd_dernier_article, hd_derniere_serie })` à
  chaque vue d'article, dans le cookie lui aussi. Pas d'UTM sur le lien
  d'inscription : ils écraseraient la vraie source dans GA4 et PostHog.
- **Événements nommés** (un écouteur délégué, zone lue sur `data-blog-zone`) :
  `blog_cta_clicked {slug, category, series_id, episode_number, cta_id, destination, zone}`
  (liens `data-track` ou vers `/simulateur`, `/tarifs`, `/essai`, `/guide-declarations`,
  `/comparatif`, app) ; `blog_related_clicked {…, to_slug, rank}` ;
  `blog_shared {…, network}` ; `blog_faq_opened {…, question_index}` ;
  `blog_series_viewed {series_id, total_articles}` sur les pages de série. Calendly
  exclu (déjà `calendly_clicked`). Tous vérifiés en navigateur (mode debug PostHog).
- Autocapture : `data-ph` sur partage (`blog_share_*`), connexes (`blog_related` +
  `data-ph-rank`), carte à la une (`blog_index_featured`), cartes (`blog_card`) ;
  `data-track` sur « Pour aller plus loin » (`cta_*_blog_more`).

**Garde-fous** (`verify-site.mjs`) : échec si un article n'a pas de bloc d'appel à
l'action avec `data-track="cta_…"`. Le contrôle des liens entrants ne lit plus que
le TEXTE (jusqu'à `data-blog-fin`) : il comptait jusque-là les cartes « Articles
connexes » comme des liens du texte. Aucun orphelin après correction.

**Vérification** : build 67 pages, verify-site sans erreur (4 814 liens internes).
Lighthouse mobile (build local) : zones FRR 97, micro-BNC vs réel 98, `/blog` 95,
série 94 (inchangé) ; a11y / BP / SEO 100 partout.

**Décisions produit en attente (non faites)** :
- **App** (dépôt séparé) : déclarer la même `cookie_persisted_properties`, sinon
  l'app réécrit le cookie sans les `hd_*`. Et `hd_dernier_article` n'y est à jour
  qu'à la PREMIÈRE visite de l'app (son localStorage l'emporte ensuite) — suffisant
  pour l'inscription, pas pour un visiteur déjà venu. Option :
  `__preview_cookie_wins_on_conflict`.
- Pastille « Essai gratuit » dans le header mobile (tout le site).
- Liens vers la newsletter `/transmissions` depuis les articles d'investissement.
- `ctaHref: "/essai"` pour les sujets froids (syndrome de l'imposteur, inbox zéro).

### 9.bg Audit du blog, lot 6 — les sept points « à vérifier », vérifiés puis corrigés (23 septembre 2026)

Chaque point a été vérifié sur source primaire (Légifrance, URSSAF, conseils de
l'Ordre) ou par recalcul avec le moteur du simulateur, AVANT correction.
`updatedDate` au 23 septembre 2026 sur les 7 articles (changement de fond),
répercutée dans `blog-meta.json`.

| Article | Avant | Après | Source |
|---|---|---|---|
| `choix-mode-exercice` | Intérim présenté sans condition | Ajout : deux ans d'exercice (ETP, hors intérim) avant une première mission en établissement de santé, depuis le 1er décembre 2025 | Décret n° 2025-1147 du 28 novembre 2025 (JO du 30), étendant aux médecins l'art. 29 de la loi Valletoux ; FHF |
| `obtenir-sa-licence-de-remplacement` | « Valable jusqu'au 15 novembre » comme règle nationale (description, essentiel, 2 FAQ, corps) | Date fixée par le CDOM : 15 novembre dans de nombreux départements, 30 novembre dans d'autres ; « la date figure sur ta licence » ; rappels « un mois avant » | Sites des CDOM : 15/11 (63, 44, 78), 30/11 (69), « 31 novembre » [sic] (87) |
| `guide-impots-internes-remplacants` | Guichet unique d'abord, RSPM ensuite | Au RSPM, tout se fait sur medecins-remplacants.urssaf.fr, y compris la déclaration de début d'activité (étudiants éligibles) ; guichet unique sinon | urssaf.fr, « L'offre simplifiée médecins remplaçants » |
| `medecin-outre-mer-avantages-fiscaux` | « La CARMF complémentaire reste due » (FAQ, essentiel, encadré) ; « exonération » de 75 % / 50 % ; art. « L. 751-1 » | Pour un médecin (profession libérale réglementée), exonération limitée à maladie-maternité, IJ, allocations familiales, CSG-CRDS : **toute la CARMF reste due** (base, complémentaire, invalidité-décès) + CFP ; 75 % / 50 % = abattements d'assiette ; art. L. 756-5 | Bpifrance Création (régime social outre-mer) ; URSSAF outre-mer (seuil 110 % du PASS confirmé) |
| idem | Hospitalier public : « +25 % » dans les DROM, « +40 % » à Mayotte | Indemnité spéciale de **40 %** dans les cinq DROM depuis 2023 | Décret n° 2023-242 du 31 mars 2023 ; FHF |
| `salaires-medecins-remplacants` | Fourchettes d'intérim sans plafond | Encadré : 2 681 € HT pour 24 h à l'hôpital public, coût total (salaire brut, frais, marge d'agence) ; annulation partielle par le Conseil d'État le 15 juillet 2026 ; condition des deux ans | Arrêté du 5 septembre 2025 ; CE n° 509381 du 15 juillet 2026 ; décret 2025-1147 |
| `remplir-declaration-2035` | IJ en ligne 1 ; lignes « 5-6 » intérêts et remboursements ; prévoyance et mutuelle en ligne 22 | IJ (CPAM, CARMF, Madelin) en ligne 6, gains divers ; ligne 5 produits financiers ; ligne 22 = primes d'assurance professionnelles ; Madelin prévoyance/mutuelle en ligne 25 | Notice 2035-NOT-SD 2026 (via trois guides concordants, le PDF n'ayant pu être lu directement) ; brochure DGFiP 2026 citée par le glossaire du site |
| `micro-bnc-exemples-concrets` | Cotisations au barème 2025 : 13 207 € / 18 187 € ; Super-Net 33 789 € / 48 859 € | 13 474 € / 18 623 € ; Super-Net **33 522 € / 48 423 €** (67,0 % / 64,6 %) ; impôt inchangé (3 004 € / 7 954 €) | Moteur `calculate-urssaf`, valeurs par défaut du formulaire ; contrôle : 72 000 € redonne 46 516 € |
| idem | « RSPM (< 38k€) », « PAMC (> 38k€) », « < 38k€ de CA → RSPM » | Phrase de référence : ouvert jusqu'à 19 000 €, maintien possible jusqu'à 38 000 € | § 9.ba |

Le découpage URSSAF / CARMF du recalcul suit la méthode du § 9.ba : CARMF = poste
« retraite » du moteur, URSSAF = le reste.

**Non corrigé, signalé :**
- `salaires-medecins-remplacants` : le titre et la FAQ disent encore « 2025 ». Les
  fourchettes n'ayant pas été réactualisées, passer à « 2026 » serait trompeur :
  décision du fondateur (mettre les chiffres à jour, ou retirer l'année du titre).
- `medecin-outre-mer-avantages-fiscaux` : la slide 3 (image) affiche
  vraisemblablement « 100/75/50 % » d'exonération — à refaire si elle parle
  d'exonération des cotisations CARMF. Le régime de Mayotte (ordonnance de 1996)
  n'a pas été revérifié.
- Hors blog : le glossaire du guide (`src/data/glossaireDeclarationsData.ts`) écrit
  encore « RSPM (remplaçants < 38 000 €) », comme `/simulateur` (§ 9.be).

### 9.bh Règle de sortie du RSPM, titre « Salaires » (23 septembre 2026)

**Règle de référence du RSPM, complétée** à la demande du fondateur et vérifiée :
le RSPM s'ouvre jusqu'à 19 000 € d'honoraires ; on le **perd au 1er janvier
suivant** après **deux années civiles de suite au-dessus de 19 000 €**, ou **une
seule au-dessus de 38 000 €**. L'année du dépassement, on reste au RSPM quel que
soit le montant : le taux de 21,2 % s'applique à toute la fraction au-dessus de
19 000 €, sans limite haute (CSS, art. D. 642-4-3 ; règle de perte : CSS, section
des art. D. 642-4-x, reprise par la presse professionnelle et les syndicats).

La phrase du § 9.ba (« maintien possible jusqu'à 38 000 € ») laissait croire qu'on
pouvait rester indéfiniment entre 19 000 € et 38 000 €. Remplacée partout :
- **Blog** : effet ciseaux, 6 mois / 12 mois, Super-Net, URSSAF (FAQ + deux
  « Pour qui ? » : RSPM « CA < 38 000 € » et PAMC « CA > 38 000 € » étaient faux),
  RSPM en exemples (FAQ), micro-BNC exemples, impôts des internes.
  `updatedDate` au 23 septembre sur les articles touchés.
- **`/simulateur`** : FAQ « au-delà de 38 000 € » (le moteur retient toujours le RSPM
  sous 38 000 € « pour une année type », c'est désormais dit) ; liste des champs ;
  aide du formulaire (`SimulateurForm.tsx`) « Réservé aux revenus < 38 000 € ».
- **Guide** : glossaire (PAMC, RSPM court et long) ; boussole (quiRemplit 2035,
  alerte de bascule, deux pièges, « dans la limite de ~38 000 €/an » retiré).
- Inchangés, justes : `rspm-exemples-concrets` (FAQ dépassement, encadré),
  `tout-comprendre-urssaf` (encadré « Important »), « 21,2 % entre 19 000 et
  38 000 € » pour qui reste sous 38 000 €.

**Titre « Salaires des médecins remplaçants 2025 »** → « Salaire du médecin
remplaçant : intérim, libéral, salariat » (URL inchangée). Les fourchettes n'ont
pas été réactualisées : aucune source vérifiable ne permet de les passer en 2026
(annonces, retours terrain). Retirer l'année évite un titre périmé sans affirmer
une actualisation qui n'a pas eu lieu ; le corps garde « ordres de grandeur en
2025 », et la FAQ « Combien gagne… » le précise.

### 9.bi Audit du blog, lot 7 — SEO technique et garde-fous (24 septembre 2026)

**Découverte et agents IA**
- **Flux RSS** `/rss.xml` (nouveau, `src/pages/rss.xml.ts`, écrit à la main, sans
  dépendance) : 46 articles, titre + description du frontmatter, liens sans slash
  final, `lastBuildDate` = dernière publication (jamais la date de build).
  `<link rel="alternate" type="application/rss+xml">` dans `BaseLayout`.
  Description du canal = sous-titre de `/blog`, mot pour mot.
- **`/llms.txt` généré** (`src/pages/llms.txt.ts`, `public/llms.txt` supprimé) : il ne
  citait aucun article. En-tête, « Pages » et « Optional » repris mot pour mot ;
  ajout des 3 sous-pages du guide (titre et description de leurs balises) et d'une
  section par série (titre + description du frontmatter). Seul texte nouveau :
  « Toute la série : <url> ».

**Sitemap**
- `lastmod` sur `/blog` et les 3 pages de série = publication la plus récente de
  leurs articles (`pubDate`, pas `updatedDate` : corriger un article ne change pas
  la liste). Elles n'en avaient aucun.
- Filtre `/essai` en égalité stricte (la sous-chaîne aurait exclu tout futur
  `/blog/essai-…`).

**Balises**
- Suffixe de `<title>` adaptatif : « | Blog Hippodoc » si le titre fait ≤ 44 car.,
  « | Hippodoc » si ≤ 49, rien au-delà. Le titre de l'article n'est jamais coupé.
- Canonique rendue seulement sur les pages indexables (la 404, servie sous toute
  URL, déclarait `/404`). `hreflang` fr / x-default retirés (site monolingue).
- `/simulateur` : `og:image` déclarée 1200×630 alors que le fichier fait 1964×1287
  (trouvé par le nouveau contrôle) → dimensions réelles.
- « Mis à jour le » affiché seulement si `updatedDate` > `pubDate`.
- 3 `pubDate` avec heure sans fuseau → `Z` ajouté (valeur identique à la prod,
  bâtie en UTC ; le build local donnait une heure de moins).

**Images**
- `blog-covers.ts` (cartes et « À la une » de `/blog`) : largeur demandée bornée à
  la source, comme `[slug].astro` au § 9.bd. Les onze covers de 450 px étaient
  annoncées « 720w » ; le `srcset` de la carte « À la une » porte les vraies largeurs.
- `/blog` desktop : préchargement de la cover « À la une » (élément LCP) à partir de
  768 px seulement ; elle reste en lazy en mobile. Lighthouse `/blog` : mobile 95,
  desktop 100 (LCP 0,63 s).

**Vercel**
- En-têtes sur toutes les routes : `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`. Pas de CSP (il
  faudrait inventorier PostHog, GA4, Pixel, Crisp, Supabase : chantier à part).
- Redirections 308 : `/index.html` → `/`, `/:path*/index.html` → `/:path*` (chaque page
  était aussi servie en 200 sous `…/index.html`), `/blog/serie` → `/blog` (répondait 404).
- Non fait : la chaîne de 3 sauts `http://hippodoc.fr/x/` (sans gravité, aucun lien
  interne ne la produit) ; les URL en majuscules (à traiter si la Search Console
  remonte des 404).

**`verify-site.mjs`**, nouveaux contrôles : page du sitemap en noindex (échec) ;
lien interne à slash final ou lien `http://` (échec) ; `<title>` > 60 car.
(avertissement) ; `og:image` locale introuvable ou dimensions déclarées ≠ fichier
(échec, lecture par sharp) ; `pubDate`/`updatedDate` avec heure sans fuseau (échec) ;
`lastmod` de `/blog` et des séries (échec) ; article absent de `llms.txt` ou de
`rss.xml` (échec). Le contrôle des dates des pages statiques lit enfin les 5 entrées
de `pages-lastmod.ts` (le motif en sautait 3) et compare le chemin exact.
Avertissements restants, hors blog : `<title>` de 62-64 car. sur la calculette,
la politique de confidentialité et la page RGPD.

### 9.bj Chantier de fond, article 1 — CARMF, vérifié et enrichi (24 septembre 2026)

Premier des articles minces de l'audit (priorité n° 1). Méthode : chaque chiffre
revérifié sur carmf.fr ; le texte juste est gardé tel quel, le faux corrigé, les
manques comblés. Le corpus d'audience a servi de boussole (l'erreur « la CARMF se
calcule sur le CA » y est la plus répandue), jamais de source de texte.
`updatedDate` au 24 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé (faux ou périmé)**
- Invalidité-décès : « 157 € (25 %) ou 626 € (100 %) » présenté comme le régime
  général → au régime classique 434 € + 0,4 % des revenus (626 € sous 1 PASS,
  jusqu'à 1 010 €) ; le forfait 157 € / 626 € est l'option du RSPM.
- Exemples recalculés avec le barème CARMF 2026, méthode validée en reproduisant
  l'exemple officiel à 60 000 € (14 499 € en secteur 1) : 40 000 € → S1 ≈ 11 200 €
  (était ~12 000), S2 ≈ 16 900 € ; 90 000 € → S1 ≈ 19 000 € (était ~20 000),
  S2 ≈ 26 600 € (était ~26 500). L'ancien calcul oubliait la participation de
  l'Assurance Maladie à la retraite de base en secteur 1.
- ACRE « réduction la 1re année si revenus < 47 100 € » → réservée à certains
  profils depuis 2026, plafonnée à 25 % (renvoi vers le guide des frais pros, § 9.bb).
- « Cotisations CARMF déductibles de tes impôts » → au réel seulement (ligne 25 de
  la 2035) ; en micro-BNC, couvertes par l'abattement de 34 %.
- « En cas d'oubli, affiliation automatique avec pénalités » (introuvable sur
  carmf.fr) → date d'effet de l'affiliation et perte des droits pour une période
  non déclarée (carmf.fr).

**Ajouté (texte nouveau)**
- Bloc « L'essentiel » (réponse dans les 100 premiers mots).
- Section « Affiliation obligatoire… » qui était VIDE : champ de l'obligation,
  étudiants sous licence compris.
- « Sur quoi la CARMF se calcule-t-elle ? » : revenu et non chiffre d'affaires
  (micro-BNC : recettes − 34 % ; réel : résultat de la 2035) ; décalage de deux ans,
  lien vers l'effet ciseaux.
- « Tes deux premières années » : tableau CARMF 2026 (3 437 € S1 / 7 710 € S2),
  complémentaire non due avant 40 ans, revenu forfaitaire de 9 131 € et régularisation.
- Participation de l'Assurance Maladie (2,15 %) en secteur 1 ; appels payables sous
  30 jours ; dispense partielle de complémentaire (barème 2026) ; section Sources
  avec liens vers carmf.fr.
- FAQ : deux questions ajoutées (CA ou revenu ? coût de la première année), deux
  réponses précisées (affiliation, invalidité-décès).

**Titre et description** : « Tout comprendre sur la CARMF » (aucun mot-clé
exploitable) → « CARMF : cotisations 2026 du médecin remplaçant » ; description
réécrite. URL inchangée.

**Reste de la liste des articles minces** (ordre de l'audit) : salaires, RSPM en
exemples, congé maternité / paternité, signer son contrat, puis le reste.

### 9.bk Chantier de fond, article 2 — Salaires, enrichi (25 septembre 2026)

Même méthode qu'au § 9.bj. Les fourchettes existantes (annonces et retours
terrain 2025) sont **gardées telles quelles** : aucune source publique ne permet
de les réactualiser. L'enrichissement porte sur ce qui est vérifiable, et sur le
défaut de fond de l'article : il annonçait des montants « nets » sans dire de quoi.
`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)**
- Bloc « L'essentiel ».
- « Avant de lire les chiffres : encaissé, net, super-net » : les trois niveaux, et
  un tableau mensuel tiré du cas-type du simulateur (72 000 €/an : 6 000 € encaissés
  → ≈ 1 510 € de cotisations, ≈ 613 € d'impôt, ≈ 3 880 € de super-net).
- Intérim : indemnités de fin de mission et de congés payés (au moins 10 % chacune,
  ministère du Travail), avec le conseil de vérifier si le tarif annoncé les inclut.
- Libéral : rappel de vérifier si un chiffre est encaissé ou restant, lien simulateur.
- Salariat : praticien contractuel à l'hôpital public, 41 386 € à 71 163 € brut par
  an à temps plein hors primes et gardes (arrêté du 8 juillet 2022, annexe III,
  montants en vigueur depuis le 1er juillet 2023 d'après la version consolidée).
- FAQ « Quelle différence entre ce que j'encaisse et ce qu'il me reste ? ».
- Section Sources avec liens (Légifrance, ministère du Travail), les fourchettes
  étant explicitement présentées comme indicatives.

**Description** réécrite (plus précise, 155 car.). Titre inchangé (§ 9.bh).

**Non vérifié, laissé en l'état** : les fourchettes elles-mêmes et le sens exact de
« nets » dans les intertitres d'origine (encaissé ou après cotisations) — à préciser
par le fondateur s'il connaît la source.

### 9.bl Chantier de fond, article 3 — RSPM en exemples, enrichi (25 septembre 2026)

Même méthode (§ 9.bj). Les deux exemples de l'article ont été recalculés à la main
et sont **justes** (décote de 226,03 €, impôt de 1 257 € à 38 000 €) : gardés tels
quels. `updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé** : FAQ 1 et rappel « 21,2 % … jusqu'à 38 000 € » / « le plafond à ne pas
dépasser pour y rester » → 21,2 % sur toute la part au-delà de 19 000 € (CSS,
art. D. 642-4-3, sans limite haute) et règle de sortie du § 9.bh.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Qui peut en profiter ? » (les trois
conditions de l'URSSAF, salariés, étudiants, retraités et régulateurs compris) ;
« Comment ça marche au quotidien ? » (portail, début d'activité, déclaration mensuelle
ou trimestrielle, rien à déclarer sans remplacement, interlocuteur unique) ;
« RSPM ou régime classique : l'écart en euros » (tableau) ; FAQ « Comment adhérer
au RSPM ? » ; section Sources liée.

**Comparaison au régime classique** : cotisations PAMC tirées du moteur
`calculate-urssaf` (secteur 1, hors deux premières années) : 19 000 € → ≈ 6 946 €,
38 000 € → ≈ 10 937 €, soit un gain RSPM d'environ 4 200 € par an dans les deux cas.
⚠️ Le moteur renvoie un impôt SANS décote (103 € et 1 483 € au lieu de 0 € et
1 257 €) : confirmation de l'écart signalé au § 9.at, côté app. L'impôt étant le même
dans les deux régimes, le tableau ne compare que les cotisations.

**Titre** : « RSPM : 2 exemples concrets - Du CA au Super-Net » → « RSPM médecin
remplaçant : exemples chiffrés 2026 » ; description réécrite. URL inchangée.

### 9.bm Chantier de fond, article 4 — congé maternité et paternité, enrichi (25 septembre 2026)

Même méthode (§ 9.bj). Conditions, durées, allocation (4 005 €) et plafond d'IJ
(65,84 €) vérifiés sur ameli.fr : gardés. `updatedDate` au 25 septembre 2026,
répercutée dans `blog-meta.json`.

**Corrigé**
- FAQ « imposables ? » : « à intégrer aux recettes BNC » sans distinction → réel /
  micro-BNC, aligné sur le corps de l'article (§ 9.bb).
- IJ présentées comme un montant fixe → maximum de 65,84 €, calculé sur les revenus
  cotisés (ameli.fr).
- Congé supplémentaire de naissance : « ≈ 70 % puis 60 % du plafond, 1 380 € puis
  1 190 € par mois » (valeurs brutes non propres aux indépendants) → montants
  ameli.fr pour les indépendants : 43 € puis 36,85 € nets par jour (≈ 1 290 € puis
  1 105 € par mois), 6,14 € si le revenu annuel moyen est sous 4 582 €.

**Ajouté (texte nouveau)**
- « L'essentiel ».
- « L'aide de 3 100 € par mois : pas pour les remplaçantes » : aide financière
  conventionnelle (3 100 €/mois en S1 temps plein, 3 mois max, 2 232 € paternité)
  réservée aux installés et collaborateurs ; remplaçants exclus du champ de la
  convention de 2024 (art. 6), recours devant le Conseil d'État fin 2024 dont
  l'issue n'est pas connue ici. Sujet repéré par le corpus (découverte tardive,
  forte charge émotionnelle). Conseil de vérifier sa prévoyance, sans affirmation
  générale sur les contrats (non vérifiable).
- FAQ « Une remplaçante a-t-elle droit à l'aide de 3 100 € ? » ; section Sources liée.

**Titre** : « Maternité & paternité du remplaçant » → « Congé maternité et paternité
du médecin remplaçant » ; description réécrite. URL inchangée.

### 9.bn Chantier de fond, article 5 — contrat de remplacement, enrichi (25 septembre 2026)

Même méthode (§ 9.bj). Le contenu existant (corrigé aux lots 1 et 2) est conforme :
gardé tel quel. `updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Contre-vérification de R.4127-65.** Un résumé automatique de Légifrance citait
encore « toute activité médicale libérale ». Le texte en vigueur affiché par le
CNOM (avec la précision géographique ajoutée en 2026, cf. note du CDOM 62) dit bien
« cesser toute activité médicale » : le mot « libérale » a disparu, comme retenu au
§ 9.ba. Seul le commentaire du CNOM, antérieur, le cite encore. Rien à corriger.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Qui prévient l'Ordre, et quand ? »
(information préalable par le remplacé, autorisation pour les non-thésés,
communication du contrat dans le mois, remplacement strictement personnel) ; ligne
de checklist sur l'assiette de la rétrocession ; FAQ « Qui doit prévenir l'Ordre
d'un remplacement ? » ; section Sources (R.4127-65, R.4127-86 et décret 2026-691,
L.4113-9, L.1142-2).

**Titre** : « Contrat de remplacement : checklist » → « Contrat de remplacement
médecin : la checklist » ; description réécrite. URL inchangée.

### 9.bo Chantier de fond, article 6 — facture de remplacement, enrichi (25 septembre 2026)

Article le plus court du blog (142 mots) : une annonce de fonctionnalité qui ne
disait pas ce que doit contenir la facture. Texte d'annonce gardé tel quel
(vouvoiement d'origine compris). `updatedDate` au 25 septembre 2026,
répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Que doit contenir ta facture de
rétrocession ? » (mentions de service-public : date, numéro continu, nom suivi de
« EI », SIREN, client, prestation, montant, date de paiement ; mention
d'exonération « TVA non applicable, art. 261-4-1° du CGI » exigée par l'art. 242
nonies A de l'annexe II ; mise en garde contre la mention de franchise « art. 293 B »,
qui n'est pas le bon fondement pour des soins) ; « Comment l'envoyer, combien de
temps la garder ? » (hors facturation électronique, 6 ans) ; section Sources.

**Corrigé** : FAQ « mentions obligatoires » — « numéro SIRET » → SIREN, ajout de
« EI », du médecin remplacé, de la date de paiement et de la mention d'exonération.

**Titre** : « T'as remplacé, t'as facturé » (accroche Instagram, aucun mot-clé) →
« Facture de remplacement : mentions et envoi » ; description réécrite. URL inchangée.

### 9.bp Chantier de fond, article 7 — budget Super-Net, enrichi (25 septembre 2026)

Annonce de fonctionnalité (222 mots) : texte d'origine gardé tel quel. Le corpus
classe « trésorerie et placements » parmi les sujets à forte demande mais demande
de rester sur le cadre, jamais sur la recommandation de produit : aucune
allocation ni aucun produit conseillé. `updatedDate` ajoutée (25 septembre 2026),
répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Ton budget en 4 étapes » (partir du
super-net — cas-type du simulateur, 6 000 € encaissés ≈ 3 880 € ; lisser sur 12 mois ;
provisionner les régularisations URSSAF / CARMF, lien effet ciseaux ; répartir) ;
« L'épargne de précaution : le cadre » (Livret A : plafond 22 950 €, 1,7 % au
1er août 2026 ; LEP : plafond 10 000 €, revenu fiscal de référence ≤ 23 028 € pour une
part en 2026 — taux du LEP non cité, service-public n'affichant pas encore celui
d'août) ; FAQ « Comment faire un budget avec des revenus irréguliers ? » ; Sources.

**Titre** : « Du Super-Net au budget : pilote ta vie » → « Budget du médecin
remplaçant : partir du Super-Net » ; description réécrite. URL inchangée.

### 9.bq Chantier de fond, article 8 — base financière (50/30/20), enrichi (25 septembre 2026)

Texte d'origine (méthode 50/30/20) gardé tel quel. `updatedDate` ajoutée
(25 septembre 2026), répercutée dans `blog-meta.json`.

**Corrigé** : FAQ « 6 000 € → 3 500 € » (contredit le cas-type du site, relevé par
l'audit) → ≈ 3 880 € (moteur du simulateur, 72 000 €/an).

**Ajouté (texte nouveau)** : « L'essentiel » ; « Un exemple chiffré » (tableau
3 880 € → ≈ 1 940 / 1 165 / 775 €, et l'erreur d'appliquer la règle aux montants
encaissés) ; « Et les régularisations ? » (provision avant le découpage si l'activité
augmente, liens effet ciseaux et budget) ; « D'où vient la règle 50/30/20 ? »
(popularisée par E. Warren et A. Warren Tyagi, *All Your Worth*, 2005 ; un repère,
pas une obligation) ; FAQ chiffrée.

**Titre** : « Rempla : ce qui te reste vraiment » → « Règle 50/30/20 du médecin
remplaçant » (évite aussi la proximité avec l'article Super-Net) ; description
réécrite. URL inchangée.

### 9.br Chantier de fond, article 9 — trouver ses remplacements, enrichi (25 septembre 2026)

Liste des plateformes, agences et critères gardée telle quelle (non revérifiée
une à une : ce sont des noms commerciaux, pas des règles). `updatedDate` au
25 septembre 2026, répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)**, tout renvoyant à des règles déjà vérifiées dans les
articles précédents : « L'essentiel » ; mise en garde intérim (deux ans d'exercice,
décret 2025-1147) dans le paragraphe des agences et en FAQ ; « Étape 3 : Avant de
dire oui » (licence à jour et date variable selon le CDOM, contrat écrit, information
de l'Ordre par le remplacé, RCP) ; « Étape 4 : Après ton premier remplacement »
(CARMF dans le mois, URSSAF selon RSPM ou guichet unique, renvoi vers la checklist
administrative) ; section Sources. Six liens internes ajoutés vers les articles de
référence (licence, contrat, CARMF, RSPM, checklist administrative).

**Titre** : « Trouver facilement tes remplacements » → « Trouver un remplacement
médical : où chercher » ; description réécrite. URL inchangée.

### 9.bs Chantier de fond, article 10 — salariat ou libéral, enrichi (25 septembre 2026)

Comparatif d'origine gardé tel quel. `updatedDate` ajoutée (25 septembre 2026),
répercutée dans `blog-meta.json`.

**Corrigé** : FAQ « en libéral, tu … n'as pas droit au chômage » → pas d'assurance
chômage classique, mais l'allocation des travailleurs indépendants existe sous
conditions strictes (France Travail).

**Ajouté (texte nouveau)** : « L'essentiel » ; « Ta protection sociale en libéral,
concrètement » (IJ maladie CPAM du 4e au 90e jour après 12 mois d'affiliation, 1/730
du revenu moyen, 197,51 € max en 2026 — ameli.fr ; CARMF à partir du 91e jour —
carmf.fr ; ATI : 2 ans d'activité, cessation involontaire, 10 000 € de revenus,
≈ 600-800 €/mois pendant 6 mois — France Travail ; conséquence : première année de
libéral sans IJ CPAM) ; précision « net avant impôt » avec lien simulateur ; FAQ
« Un médecin libéral est-il indemnisé en arrêt maladie ? » ; Sources.

**Non revérifié** : grille des praticiens hospitaliers (« échelon 1 ~ 4 600 € brut,
échelon 13 ~ 9 400 € ») — Légifrance inaccessible en lecture directe ; laissée telle
quelle, datée 2025 dans l'article.

**Titre** : « Salariat vs Libéral » → « Médecin salarié ou libéral : la vraie
différence » ; description réécrite. URL inchangée.

### 9.bt Chantier de fond, article 11 — remplacement salarié, enrichi (25 septembre 2026)

Contenu d'origine gardé (le passage frais réels / matériel a été corrigé au § 9.bb).
`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé**
- Retraite complémentaire : « Collectivités (type PMI) → IRCANTEC » → « Hôpital public
  et collectivités (praticien contractuel, PMI…) → IRCANTEC » (les agents non
  titulaires du public, dont les praticiens contractuels, relèvent de l'IRCANTEC).
- Futur périmé : « tu pourras enregistrer tes revenus salariés dès mi-juillet 2025 »
  → présent (fonction disponible : « revenus salariés » figure dans le suivi des
  revenus décrit par le guide des impôts des internes).

**Ajouté (texte nouveau)** : « L'essentiel » ; « Combien, et à quelles conditions ? »
(praticien contractuel 41 386 € – 71 163 € brut, § 9.bk ; intérim : deux ans
d'exercice et indemnités de fin de mission / congés payés, § 9.bg et 9.bk) ; FAQ
« Combien gagne un médecin qui remplace à l'hôpital public ? » ; Sources.

**Titre** : « Remplacement salarié : guide complet » → « Médecin remplaçant salarié :
le guide complet ». URL inchangée.

### 9.bu Chantier de fond, article 12 — syndrome de l'imposteur, enrichi (25 septembre 2026)

Texte d'origine (5 clés) gardé tel quel. `updatedDate` ajoutée (25 septembre 2026),
répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : paragraphe d'origine du concept (Clance et Imes, 1978) ;
« Pour tes premiers remplas, en pratique » (liens vers la checklist du premier jour et
le logiciel métier, numéros utiles à demander au remplacé) ; « Quand le doute devient
trop lourd » : deux lignes d'écoute **vérifiées sur source officielle** —
0800 288 038 (entraide de l'Ordre, médecins et médecins en formation, 24 h/24 ;
page CNOM « L'entraide ») et 0805 23 23 36 (association SPS, professionnels de santé
et étudiants, 24 h/24 ; portail ARS Bretagne) ; FAQ « À qui parler si je ne vais
vraiment pas bien ? » ; Sources.

⚠️ Numéros de téléphone publiés : à revérifier à chaque revue annuelle de l'article.

**Titre** : « 5 astuces contre le syndrome d'imposteur » → « Syndrome de l'imposteur du
jeune médecin : 5 clés ». URL inchangée.

### 9.bv Chantier de fond, article 13 — réalités du remplacement, enrichi (25 septembre 2026)

Les 7 réalités d'origine gardées telles quelles. `updatedDate` ajoutée
(25 septembre 2026), répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)**, uniquement des règles déjà vérifiées ailleurs : « L'essentiel » ;
un « 💡 » d'action sous quatre réalités (logiciel métier ; solitude → 0800 288 038,
§ 9.bu ; mini-entreprise → calendrier de la première année : CARMF dans le mois,
URSSAF / RSPM, déclaration au printemps, CFE nulle l'année de création puis 15 décembre ;
paiement → date au contrat et facture, § 9.bn et 9.bo) ; une 8e réalité « Ta première
année n'est pas couverte en cas d'arrêt maladie » (IJ CPAM après 12 mois d'affiliation,
§ 9.bs) ; FAQ correspondante ; Sources. Dix liens internes ajoutés.

**Titre** : « Ce qu'on ne te dit pas sur le rempla » → « Médecin remplaçant : ce qu'on
ne te dit pas » ; description réécrite. URL inchangée.

### 9.bw Chantier de fond, article 14 — PDSA, enrichi (25 septembre 2026)

Contenu d'origine conforme au BOFiP (astreinte + majorations spécifiques, 60 jours,
zone déficitaire, pas d'exonération sociale) : gardé tel quel. `updatedDate` ajoutée
(25 septembre 2026), répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Et si tu es remplaçant ? » — le
BOFiP (BOI-BNC-CHAMP-10-40-20) reprend l'art. 151 ter : « les médecins **ou leurs
remplaçants** installés dans une zone… », rémunérations perçues **à titre personnel** ;
« Comment la déclarer (sans double peine) » — micro-BNC : 5HQ hors part exonérée +
DSFA ; réel : ligne CI de la 2035-B ; jamais en 5HP (repris du guide 2042-C-PRO du
site) ; exclusion de la base du groupe III et des 3 % (BOFiP) ; deux FAQ ; Sources.

**Incohérence relevée, non corrigée** : l'article liste les majorations CRD / CRN /
CRM / CRS et VRD / VRN / VRM / VRS ; le glossaire du guide (`glossaireDeclarationsData.ts`,
entrée PDSA) ne cite que CRD, CRS, CRN, VRN, VRS. Le BOFiP renvoie au tableau des
majorations de régulation de la convention, sans lister les codes : à trancher sur la
NGAP en vigueur avant d'aligner l'un sur l'autre.

**Titre** : « PDSA : l'exonération sans se tromper » → « PDSA : exonération d'impôt
des gardes régulées » ; description réécrite. URL inchangée.

### 9.bx Chantier de fond, article 15 — checklist du premier jour, enrichie (25 septembre 2026)

Checklist d'origine gardée telle quelle. `updatedDate` ajoutée (25 septembre 2026),
répercutée dans `blog-meta.json`.

**Corrigé** : caractère d'usage privé (U+F0A53, rendu en carré vide) après « Ta
responsabilité : ton rythme ! » — supprimé.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Avant le jour J : l'administratif »
(licence, contrat, information de l'Ordre par le remplacé, RCP, carte CPS) ; mise en
garde CPS dans « Facturation fluide » — ameli.fr : le remplaçant ne doit pas facturer
avec la carte du remplacé, carte CPS propre à demander à l'Ordre (remplaçants et
non-thésés autorisés), configuration du poste ; ligne « Dernier jour » (facture de
rétrocession) ; FAQ « Puis-je facturer avec la carte CPS du remplacé ? » ; Sources.

**Titre** : « Checklist avant ton 1er remplacement » → « Premier remplacement médical :
la checklist du jour J » ; description réécrite. URL inchangée.

### 9.by Chantier de fond, article 16 — frais professionnels déductibles, enrichi (25 septembre 2026)

`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé**
- Repas : « jusqu'à environ 15 € par repas » → règle des frais supplémentaires de
  repas, valeurs BOFiP 2026 : part au-delà de 5,50 € dans la limite de 21,40 €, soit
  15,90 € au maximum (corps et FAQ ; ACTU-2026-00008, BOI-BNC-BASE-40-60-60).
- Assurances : « prévoyance » rangée avec la RCP → RCP / local / matériel en ligne 22 ;
  prévoyance et mutuelle déductibles seulement en contrat Madelin, dans ses plafonds,
  ligne 25 (cohérent avec le § 9.bg).
- Section « Charges professionnelles déductibles (Régime réel) » vide → phrase de
  cadrage (dépense engagée pour l'activité, payée, justifiée).

**Ajouté** : « L'essentiel » ; renvoi explicite vers le guide long
`frais-pros-medecin-liberal-2026` (cette fiche = la liste rapide, pour éviter la
cannibalisation) ; Sources.

**Titre** : « Déductions fiscales : payer moins d'impôt » → « Frais déductibles au
régime réel : la liste du médecin » (distinct de « Frais pros du médecin libéral
2026 ») ; description réécrite. URL inchangée.

### 9.bz Chantier de fond, article 17 — modes d'exercice, enrichi (25 septembre 2026)

Les 8 fiches d'origine gardées telles quelles (intérim corrigé au § 9.bg).
`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé** : « Partage ton expérience en commentaire ! » (reliquat Instagram, le blog
n'a pas de commentaires) → « Raconte-nous ton parcours à contact@hippodoc.fr ! ».

**Ajouté (texte nouveau)**, règles déjà vérifiées ailleurs : « L'essentiel » ;
tableau « En un coup d'œil » (mode, statut, cotisations — vérifié en mobile) ; trois
« 💡 » : remplacement (autorisation de 3 mois pour les non-thésés ; pas d'IJ CPAM la
première année, § 9.bs), salariat (praticien contractuel, § 9.bk), collaboration
(exercice simultané, patientèle propre, accès à l'aide maternité conventionnelle,
§ 9.bm) ; FAQ « Quelle différence entre remplaçant et collaborateur libéral ? ».

**Titre** : « Médecin remplaçant : les 8 statuts clés » → « Modes d'exercice du
médecin : les 8 statuts ». URL inchangée.

### 9.ca Chantier de fond, article 18 — cotisations sociales vs impôt, enrichi (25 septembre 2026)

Chiffres d'origine (corrigés au § 9.ba : ≈ 250 € de cotisations et ≈ 100 € d'impôt
pour 1 000 € encaissés) gardés. `updatedDate` au 25 septembre 2026, répercutée
dans `blog-meta.json`.

**Corrigé**
- Deux marqueurs de nouveauté périmés relevés par l'audit : « Nous détaillerons ce point
  très prochainement » (exonérations de début d'activité) → complémentaire CARMF non
  due deux ans avant 40 ans (§ 9.bj) et ACRE restreinte en 2026 (§ 9.bb), avec liens ;
  section « 🔜 À venir prochainement : décryptage URSSAF & CARMF » → « Pour aller plus
  loin » vers les deux articles existants.
- Deux intertitres vides (« Impôts sur le revenu », « Cotisations sociales ») → une
  phrase de cadrage chacun.

**Ajouté (texte nouveau)** : « L'essentiel » ; mise au point « calculées sur ton
revenu, pas sur ce que tu encaisses » (erreur n° 1 du corpus ; exception RSPM) ;
justification des 40 % mis de côté (régularisations, lien effet ciseaux) ; FAQ « Les
cotisations se calculent-elles sur mon chiffre d'affaires ? » ; source des chiffres
(cas-type du simulateur).

Titre inchangé ; description réécrite. URL inchangée.

### 9.cb Chantier de fond, article 19 — outils numériques, enrichi (25 septembre 2026)

Liste des 15 outils commerciaux gardée telle quelle (tarifs et fonctionnalités non
revérifiés : noms commerciaux, qui changent vite). `updatedDate` au 25 septembre 2026,
répercutée dans `blog-meta.json`.

**Corrigé**
- Encadré Hippodoc : « factures électroniques » (lien vers la réforme) → « factures
  d'honoraires », qui s'envoient par mail et ne sont pas concernées par la facturation
  électronique (cohérent avec § 9.bo) : l'ancienne formule laissait croire l'inverse.
- FAQ Ordotype : « version gratuite limitée » contredisait le corps (« Payant ») →
  outil payant, offres via les associations d'internes (reprend la note de l'article).

**Ajouté (texte nouveau)** : « L'essentiel » ; « Bonus : les outils officiels et
gratuits » (amelipro — cité en FAQ mais absent du corps ; base de données publique des
médicaments ; HAS ; messagerie sécurisée de santé, dont Mailiz ; application e-CPS de
l'ANS), sites vérifiés en ligne ; FAQ correspondante.

Titre inchangé. URL inchangée.

### 9.cc Chantier de fond, article 20 — checklist ultime, enrichie (25 septembre 2026)

Checklist d'origine gardée. `updatedDate` ajoutée (25 septembre 2026), répercutée
dans `blog-meta.json`.

**Corrigé**
- Conclusion « Reste connecté(e) : les prochains articles te guideront… » (annonce
  périmée) → liens vers les fiches fiscales publiées.
- Présentation « je suis le Dr X » : nuance ajoutée pour les non-thésés (le titre de
  docteur vient avec la thèse ; « médecin remplaçant(e) du Dr Y »). Formulée sans
  affirmation de sanction : les pages de l'Ordre consultées ne la détaillent pas.

**Ajouté (texte nouveau)** : « L'essentiel » ; carte CPS propre (§ 9.bx) ; ligne
« Facture de rétrocession » (mentions, 6 ans, § 9.bo) ; FAQ « non thésé et titre de
docteur », « Que faire à la fin d'un remplacement ? ».

**Titre** : « Checklist ultime du remplaçant » → « Réussir son remplacement : avant,
pendant, après » (distinct de « Premier remplacement médical : la checklist du jour J »,
pour éviter la cannibalisation) ; description réécrite. URL inchangée.

### 9.cd Chantier de fond, article 21 — déclaration 2035, enrichie (25 septembre 2026)

Lignes et date déjà corrigées (§ 9.bb, § 9.bg). `updatedDate` au 25 septembre 2026,
répercutée dans `blog-meta.json`.

**Corrigé** : FAQ « Adhérer à une AGA te permet de bénéficier d'avantages fiscaux » →
plus aucun avantage fiscal : majoration des non-adhérents supprimée à partir des
revenus 2023 (déjà dans le guide du site, `boussoleData`), puis loi de finances pour
2025, art. 11 : abrogation de l'agrément et des missions légales des OGA et de la
réduction d'impôt pour frais de comptabilité (CGI 199 quater B) — impots.gouv.fr.
« par ton AGA/comptable » → « par ton comptable ». La contradiction avec le guide du
site et avec `frais-pros-medecin-liberal-2026` (« Réduction OGA : supprimée ») est levée.

**Ajouté** : « L'essentiel » ; phrase sous l'intertitre vide « Guide étape par
étape » ; Sources (page du formulaire 2035-SD sur impots.gouv.fr, actualité OGA).

**Contrôle des liens externes du blog** (40 liens) : tous répondent 200, sauf les 9
liens Légifrance (403 = blocage anti-robot du site, adresses issues des résultats
officiels). Un lien vers la page du formulaire 2035 (404) corrigé avant publication.

### 9.ce Chantier de fond, article 22 — pièges du début, enrichi (25 septembre 2026)

Les 7 pièges d'origine gardés. `updatedDate` ajoutée (25 septembre 2026),
répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)**, uniquement des règles déjà vérifiées : « L'essentiel » ;
8e piège « Oublier l'administratif » (CARMF dans le mois § 9.bj ; avis de CFE en ligne
et majoration de 5 % § 9.av ; régularisations / effet ciseaux § 9.aw ; pas d'IJ CPAM
la première année § 9.bs ; requalification § 9.ay) avec un réflexe « point
administratif mensuel » ; FAQ « Quels pièges administratifs coûtent le plus cher ? ».
Intertitre « 8. Le tips Hippodoc » dénuméroté. Six liens internes ajoutés.

**Titre** : « Les 7 pièges du début en remplacement » → « Remplaçant débutant : 8 pièges
à éviter » ; description réécrite. URL inchangée.

### 9.cf Chantier de fond, article 23 — calendrier fiscal, enrichi (25 septembre 2026)

Calendrier d'origine gardé (URSSAF et dates 2026 corrigées aux lots 1 et 2).
`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé** : « CARMF : paiement solde retraite avant le 31 août » → paiement dans les
30 jours de l'appel du solde, reçu entre mai et juillet (carmf.fr, « Vos cotisations
en cours d'activité », § 9.bj).

**Ajouté (texte nouveau)**, dates déjà vérifiées ailleurs : « L'essentiel » ; « Ta
première année : trois dates en plus » (CARMF dans le mois, URSSAF / RSPM, déclaration
initiale de CFE 1447-C avant le 31 décembre — § 9.av) ; en septembre, réception des
factures électroniques depuis le 1er septembre 2026 (§ 9.ar–9.az) ; en décembre, rappel
1447-C ; FAQ « Quelles démarches faire la première année ? » ; Sources.

**Titre** : « Calendrier fiscal du remplaçant » → « Calendrier fiscal du médecin
remplaçant, mois par mois » ; description réécrite. URL inchangée.
⚠️ Article daté 2026 : dates à revoir chaque année (déclaration de revenus, 2035).

### 9.cg Chantier de fond, article 24 — salariat : 10 % ou frais réels, enrichi (25 septembre 2026)

Contenu et exemples d'origine gardés (base corrigée au § 9.ba : net imposable).
`updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : « L'essentiel » ; « Les règles qui changent le calcul » —
trajets limités à 40 km sauf circonstances justifiées (impots.gouv.fr) ; repas : part
au-delà de 5,45 € avec justificatif, 5,45 € par repas sans (impots.gouv.fr, revenus
2025 — à ne pas confondre avec les 5,50 € des BNC 2026 du § 9.by) ; justificatifs
conservés 3 ans ; plancher 509 € et plafond 14 555 € de l'abattement (service-public,
cohérent avec le glossaire du guide) ; FAQ « trajets de plus de 40 km » ; Sources.

**Titre** : « Salariat : 10 % ou frais réels ? » → « Médecin salarié : 10 % ou frais
réels ? » ; description réécrite. URL inchangée.
⚠️ Montants des revenus 2025 : à revoir chaque année.

### 9.ch Chantier de fond, article 25 — micro-BNC en exemples, enrichi (25 septembre 2026)

Exemples recalculés au § 9.bg : gardés. `updatedDate` au 25 septembre 2026,
répercutée dans `blog-meta.json`.

**Ajouté (texte nouveau)** : « L'essentiel » ; mise au point « les cotisations ne se
calculent pas sur ton CA » (recettes − 34 %, erreur n° 1 du corpus) ; « Et si tu
démarres ? » — micro-BNC de plein droit les deux premières années (erreur n° 2 du
corpus, déjà sourcée dans `regime-fiscal-micro-bnc-vs-reel` : art. 102 ter CGI,
BOI-BNC-DECLA-20-10 § 134) et cotisations de départ puis régularisées (§ 9.bj) ; FAQ
« Puis-je rester en micro-BNC si je dépasse 83 600 € dès ma première année ? » ;
Sources (hypothèses du simulateur explicitées).

**Titre** : « 2 exemples concrets de revenus en micro-BNC » → « Micro-BNC : 2 exemples
chiffrés du CA au Super-Net ». URL inchangée.

### 9.ci Chantier de fond, article 26 — logiciel métier, enrichi (25 septembre 2026)

Checklist d'origine gardée. `updatedDate` au 25 septembre 2026, répercutée dans
`blog-meta.json`.

**Corrigé** : « statuts CMU » → ALD et complémentaire santé solidaire (C2S), qui a
remplacé la CMU-C en 2019.

**Ajouté (texte nouveau)** : « L'essentiel » ; carte CPS propre (ameli.fr, § 9.bx) ;
arrêts de travail : formulaire Cerfa sécurisé obligatoire depuis le 1er septembre 2025,
ancien formulaire rejeté, arrêt en ligne privilégié (communiqué de l'Assurance Maladie
du 2 juillet 2025) ; FAQ « Puis-je encore faire un arrêt de travail sur papier ? » ;
Sources. Description réécrite ; titre et URL inchangés.

**Bilan du chantier « articles minces »** : les 26 articles de moins de 600 mots de
l'audit sont traités (§ 9.bj à 9.ci). Seul `generer-facture-remplacement` reste sous
600 mots (540), suffisant pour son sujet. Restent sans « L'essentiel » : URSSAF,
micro-BNC ou réel, checklist administrative, syndrome de l'imposteur ; 17 articles
sans section Sources.

### 9.cj « L'essentiel » sur les quatre derniers articles (25 septembre 2026)

Bloc « L'essentiel » ajouté à `tout-comprendre-urssaf`, `regime-fiscal-micro-bnc-vs-reel`,
`checklist-administrative-medecin-remplacant` et `syndrome-imposteur-5-astuces` : chaque
ligne résume le contenu déjà vérifié de l'article (aucun fait nouveau). Les 46 articles
en ont désormais un. `updatedDate` au 25 septembre 2026, répercutée dans `blog-meta.json`.

**Corrigé au passage**
- `tout-comprendre-urssaf` : « 🧓 Retraite (régime général) » et « Invalidité-Décès »
  listés parmi ce que finance l'URSSAF → pour un médecin, retraite et invalidité-décès
  relèvent de la CARMF (au RSPM, l'URSSAF les encaisse pour son compte, CSS
  art. D. 642-4-2) ; liste recentrée sur maladie, allocations familiales, CSG-CRDS,
  formation, URPS.
- `checklist-administrative` : CARMF « dès le début » → « dans le mois » (carmf.fr) ;
  « gère ta retraite complémentaire » → retraite (base, complémentaire, ASV) et
  invalidité-décès ; rappel « pas d'IJ CPAM la première année » dans Prévoyance (§ 9.bs).

### 9.ck Sections Sources, première vague (25 septembre 2026)

Section « 📚 Sources » ajoutée à 9 articles dont tous les faits ont été vérifiés au fil
du chantier : checklist administrative, réussir son remplacement, cotisations vs impôt,
modes d'exercice, pièges du début, outils numériques, licence de remplacement,
micro-BNC ou réel, URSSAF. Chaque ligne renvoie à la source primaire déjà consultée
(carmf.fr, urssaf.fr, ameli.fr, CNOM, service-public, Légifrance, BOFiP). Aucune date
relevée à tort : ces articles portaient déjà la mise à jour du 25 septembre.

**Vérifié au passage (`tout-comprendre-urssaf`)** : le numéro 0 806 804 209 (précisé
« choix 3, du lundi au vendredi de 9 h à 17 h ») et l'adresse
offre.medecin.remplacant@urssaf.fr figurent sur la page contact officielle ; la page
urssaf.fr de la réforme confirme l'assiette unique « revenu brut abattu de 26 % ».

**Seconde vague (à faire, avec vérification)** : `enveloppes-investissement…` (dont le
prélèvement forfaitaire à 31,4 %), `frais-pros-medecin-liberal-2026`,
`guide-impots-internes-remplacants`, `inbox-zero-remplacant`,
`interets-composes-meilleur-remplacement`, `medecin-outre-mer-avantages-fiscaux`,
`simulateur-super-net-combien-reste` (abattements DOM, « 1er septembre 2025 »).
`base-financiere-rempla` a déjà l'équivalent (« D'où vient la règle 50/30/20 ? »).

### 9.cl Sections Sources, seconde vague (1/3) : enveloppes et intérêts composés (25 septembre 2026)

**`enveloppes-investissement-pea-assurance-vie-per-cto`** — tous les chiffres vérifiés,
aucune correction, `updatedDate` inchangée (ajout de sources seulement) :
PEA 150 000 € et date d'ouverture au premier versement (service-public F2385) ;
assurance-vie 4 600 / 9 200 €, 7,5 % jusqu'à 150 000 € de primes, 12,8 % au-delà
(F22414) ; transmission 152 500 € / 30 500 € (impots.gouv.fr) ; PER : transfert gratuit
après 5 ans, 1 % avant (F34982) ; prélèvements sociaux 2026 à 18,6 % en général (PFU
31,4 %), 17,2 % maintenus pour l'assurance-vie, les PEL/CEL et les revenus fonciers
(F2329). L'écart 17,2 % / 18,6 % entre assurance-vie et CTO, qui semblait une
contradiction, est exact.

**`interets-composes-meilleur-remplacement`** — calculs refaits (taux nominaux
capitalisés mensuellement : 366 k€, 788 k€, 381 / 555 / 820 / 1 234 / 1 920 / 3 155 €
par mois pour 1 M€ — conformes). Corrigé : MSCI World « environ 1 500 entreprises »
→ « environ 1 300 » (fiche MSCI : 1 280 constituants, 23 pays), 4 occurrences ; fonds
euros 162 k€ → 165 k€ (recalcul à 2,65 %). Taux Livret A 1,7 % et LEP 2,5 % au 1er août
2026 confirmés (communiqué du ministère de l'Économie). Sources et hypothèses
explicitées (inflation ~3 % pour le compte courant, rendements supposés).
`updatedDate` au 25 septembre 2026. ⚠️ Les slides (images) peuvent encore afficher
« 1 500 entreprises » : à vérifier lors de leur refonte.

### 9.cm Sections Sources, seconde vague (2/3) : Super-Net et outre-mer (25 septembre 2026)

Ajout de sources seulement, aucune correction nécessaire : `updatedDate` inchangée.

**`simulateur-super-net-combien-reste`** — vérifié : taux individualisé par défaut depuis
le 1er septembre 2025 (service-public A18226, ministère de l'Économie ; LF 2024,
art. 19) ; acomptes le 15 du mois ou trimestriels les 15 février, mai, août, novembre
(impots.gouv.fr) ; abattement DOM 30 % / 2 450 € et 40 % / 4 050 € (CGI 197 I-3, BOFiP
BOI-IR-LIQ-20-30-10) ; micro-BNC 83 600 € ; RSPM.

**`medecin-outre-mer-avantages-fiscaux`** — vérifié : abattement DOM ; exonération
sociale 24 mois et CARMF due (Bpifrance, § 9.bg) ; indemnité hospitalière 40 %
(décret 2023-242, § 9.bg) ; Lodéom : exonération totale jusqu'à **1,3 Smic** pour les
moins de 11 salariés en Guadeloupe, Guyane, Martinique, Réunion — conforme (le barème à
1,4 Smic de la page urssaf.fr concerne Saint-Barthélemy et Saint-Martin) ; zone franche
globale de Mayotte (loi n° 2025-797 du 11 août 2025, art. 38 : abattement de 100 % des
bénéfices 2025-2029, BNC compris, CFE et TFPB 2026-2030, plafond de 300 000 € — BOFiP
ACTU-2025-00136).
**Non revérifié** : régime social propre à Mayotte (ordonnance de 1996, art. 28-8),
« régime employeur transitoire 2026 / CICE mahorais », exclusion des libéraux de la
ZFANG hors Mayotte, classement des DROM en ZIP. Ces points ne figurent pas dans les
Sources.

### 9.cn Sections Sources, seconde vague (3/3) : frais pros 2026, internes, inbox zéro (25 septembre 2026)

**`frais-pros-medecin-liberal-2026`** — vérifié : micro-BNC 83 600 € ; repas 2026 ;
réduction OGA supprimée ; crédit d'impôt formation des dirigeants supprimé pour les
formations depuis le 1er janvier 2025 (BOFiP ACTU-2026-00044) ; ZFU-TE fermées aux
nouvelles implantations depuis 2026 et nouveau dispositif QPV 2026-2030 (BOFiP,
service-public A18806) ; PDSA ; **DAS2 au-delà de 2 400 €** (relevé depuis les revenus
2024, BOFiP ACTU-2024-00154 — l'article avait raison) ; CESU préfinancé 2 591 €
(cesu.urssaf.fr).
**Corrigé** : SMIC figé à 1 823 € (« à actualiser ») alors qu'il a été revalorisé au
1er juin 2026 → 1 823,03 € au 1er janvier puis 1 867,02 € (service-public A18916) ;
plafonds ANCV recalculés en conséquence (≈ 547 € puis ≈ 560 € côté social), 4 endroits.
`updatedDate` au 25 septembre 2026. **Non revérifié** : les règles propres au
chèque-vacances des TNS (plafond fiscal d'un SMIC, plafond social de 30 %) — seuls les
montants du SMIC ont été actualisés.

**`guide-impots-internes-remplacants`** — vérifié : seuil 77 700 € des revenus 2025,
abattement 10 %, 40 km, RSPM, invalidité-décès, PDSA ; exemple recalculé (28 000 € +
12 000 € → 33 120 € imposables, ≈ 3 040 € d'impôt, sans décote). Sources seulement.

**`inbox-zero-remplacant`** — vérifié : guide HAS-CNIL 2026 sur l'IA en contexte de
soins (cnil.fr, mars 2026) ; la méthode de tri est présentée comme méthode maison.
Non sourcé : la recommandation du CNOM sur le téléphone personnel (non retrouvée).

**Bilan** : les 46 articles ont une section Sources (celle de `base-financiere-rempla`
s'intitule « D'où vient la règle 50/30/20 ? »).

### 9.co Maillage des pages du site vers le blog (25 septembre 2026)

Point laissé ouvert au § 9.be : la FAQ, le simulateur et le guide des déclarations ne
liaient le blog que par le pied de page (et le guide, pas du tout).

**FAQ (`src/pages/faq.astro`)** — liens posés dans 6 réponses (frais réels, PDSA,
rétrocessions, cotisations URSSAF/CARMF/RSPM, micro-BNC ou réel, Super-Net) ; style
de lien ajouté au conteneur des réponses. Liens distincts vers le blog : 3 → 10.
**Corrigé au passage** : « RSPM (revenus < 38 000 €) » / « PAMC (revenus ≥ 38 000 €) »
→ « RSPM (régime simplifié des remplaçants, ouvert jusqu'à 19 000 € d'honoraires) » /
« PAMC (régime classique) », dans le HTML et dans le texte du JSON-LD (§ 9.bh) ;
règle des 34 % : « cotisations URSSAF et CARMF comprises » (§ 9.az), idem.

**Composant `BlogReadMore.astro`** — encadré « Sur le blog » : titres lus dans la
collection (jamais recopiés), échec du build si un slug n'existe pas,
`data-ph="blog_readmore_<emplacement>"`. Posé sur :
- `/simulateur` (« Comprendre ton résultat », 5 articles) ;
- `/guide-declarations` (« Pour aller plus loin, sur le blog », 6 articles) ;
- les 3 sous-pages du guide, via une prop `articles` de `GuideSousPage.astro`
  (DSFU : URSSAF, effet ciseaux, CARMF, maternité ; 2042-C-PRO : micro-BNC ou réel,
  2035, PDSA, zones FRR ; médecin remplaçant : internes, RSPM, micro-BNC, calendrier).

**Vérifié** : build, verify-site (4 936 liens internes, aucun mort), rendu mobile sans
débordement. Lighthouse : FAQ 96, 2042-C-PRO 99-100 ; `/simulateur` 93 en local mais
**86 en production avant ce lot** — sous l'objectif de 95, préexistant (tâche séparée
proposée). 2042-C-PRO : accessibilité 96, également préexistante.

**Trouvé en route, préexistant** : octets nuls (U+0000) dans le HTML du guide
(6 sur le hub, 1 sur 2042-C-PRO), introduits au rendu — les données sources sont
propres. Ignorés par les navigateurs (norme HTML), mais à corriger : tâche séparée.

### 9.cp Octets nuls dans le HTML des îlots React (25 septembre 2026)

Suite du « trouvé en route » du § 9.co. Aucun changement de texte.

**Cause** — défaut de React 18.3 dans son serveur Node (`writeStringChunk` de
`react-dom-server.node`) : quand un caractère accentué ne tient plus en fin de tampon,
React envoie le tampon **entier**, octets restés vides compris. D'où « mat\0ériel »
(1 octet manquant pour « é ») ou « \0\0— » (2 pour le tiret cadratin). Seules les pages
à gros îlots étaient touchées (/guide-declarations : 6, /guide-declarations/2042-c-pro : 1),
en production aussi. Conséquences : le texte servi différait de celui rendu au client
(hydratation en échec, îlot re-rendu en entier) et le mot coupé n'était plus lu comme tel.

**Correctif (`astro.config.mjs`)** — alias Vite `react-dom/server` →
`react-dom/server.browser` : Astro rend alors les îlots par `renderToReadableStream`,
qui encode chaque morceau séparément et n'a pas ce défaut. Écarté : le rendu non streamé
(`experimentalDisableStreaming`), qui perd le préfixe des `useId` (`:r1R1:` → `:R1:`)
alors que le client hydrate avec ce préfixe — les `for`/`aria-*` des formulaires
auraient divergé. À retirer au passage à React 19 (défaut corrigé en amont).

**Garde (`scripts/verify-site.mjs`)** — échec si un HTML construit contient U+0000.

**Vérifié** : 0 octet nul sur les 67 pages ; hors octets nuls, HTML **identique à
l'octet près** à celui d'avant (identifiants `useId` compris) ; contre-épreuve : sans
l'alias, les 2 pages retrouvent leurs octets nuls et la garde échoue. Navigateur :
recherche du guide, simulateur et calculette hydratés, console sans erreur.

### 9.cq Titres trop longs, liens et formulaires accessibles (25 septembre 2026)

**Titres ramenés sous 60 caractères** (contrat SEO, tronqués par Google au-delà) :
- `/guide-declarations/calculette` : « HippoCalc 2026 — Calculette fiscale médecin libéral »
  → « Calculette fiscale médecin libéral 2026 » (mot-clé d'abord) ;
- `/politique-confidentialite` : « Politique de Confidentialité - Protection des Données »
  → « Politique de confidentialité » ;
- `/rgpd` : « Conformité RGPD - Protection des Données Personnelles »
  → « Conformité RGPD et données personnelles ».
Garde : `verify-site.mjs` échoue désormais au-delà de 60 caractères (entités décodées) ;
c'était un simple avertissement au-delà de 70.

**Accessibilité** (préexistant) :
- 2042-C-PRO (96 → 100) et médecin remplaçant : liens dans le texte soulignés (ils ne se
  distinguaient du texte que par la couleur, contraste 1,01:1 entre les deux).
- Calculette (92 → 100) : les listes déroulantes et le champ « Année d'installation en
  zone » sont reliés à leur libellé (`htmlFor`/`id`) — elles n'avaient pas de nom pour un
  lecteur d'écran ; badge « case » en `hippo-700` plein (contraste 4,31 → conforme).

**Correction du § 9.co** — `/simulateur` n'est pas sous l'objectif : 4 passes Lighthouse
en production après § 9.cp donnent 97–100 en performance (TBT 0, CLS 0). Le 86 relevé
était une variance de la simulation réseau de Lighthouse (même élément LCP, même
décomposition dans toutes les passes). Rien à corriger.

### 9.cr Seuil du RSPM : dernières mentions « < 38 000 € » hors blog (25 septembre 2026)

Suite du § 9.bh (harmonisation RSPM) : plusieurs textes visibles décrivaient encore le
RSPM comme « < 38 000 € ». Règle retenue (fondateur + urssaf.fr, « L'offre simplifiée
médecins remplaçants », relu le 25 septembre 2026 : remplaçant — salarié, étudiant,
retraité ou régulateur —, exclusivement des remplacements, honoraires ≤ 19 000 € par
année civile ; déclaration « au choix chaque mois ou chaque trimestre ») : ouvert jusqu'à
19 000 € ; perdu au 1er janvier suivant après deux années de suite au-dessus de 19 000 €
ou une seule au-dessus de 38 000 € ; l'année du dépassement, on y reste.

Corrigé :
- **Accueil** — encadré « Mode RSPM intégré » (`CtaBanner.astro`) : paliers « < 19 000 € /
  19-38 k€ / > 38 000 € → PAMC » → « jusqu'à 19 000 € → 13,5 % / au-delà → 21,2 % sur la
  part au-dessus / sortie → PAMC au 1er janvier, après 2 ans de suite > 19 000 € ou 1 an
  > 38 000 € » ; FAQ « Je débute… » (`faqAccueil.ts`) : « Tu bénéficies automatiquement
  du RSPM tant que tes revenus restent sous 38 000 € » → « Si tu es remplaçant, tu peux
  opter pour le RSPM, ouvert jusqu'à 19 000 € d'honoraires par an » (c'est une option).
- **Guide** — encadré « Régime ? » (`FiscalSocialPrimer.astro`) : « PAMC (≥ 38 k€) ou
  RSPM (< 38 k€) » → « PAMC (cas général) ou RSPM (option des remplaçants, jusqu'à
  19 k€) » ; boussole (`BoussoleWizard.tsx`) : infobulle « Par défaut tu démarres au
  RSPM… ~38 000 € » réécrite, options RSPM/PAMC réécrites (« cotisations trimestrielles »
  → « mensuelles ou trimestrielles ») ; glossaire (IJ CPAM, DSCZ) et pépite 2035
  (`boussoleData.ts`) : « RSPM (< 38 000 €) », « PAMC (> 38 000 € …) », « PAMC (recettes
  ≥ 38 000 €) » → formulations sans seuil faux ; alerte Hippodoc à ~38 k€ : « (sortie du
  RSPM au 1er janvier suivant) ».
- **Calculette** — infobulle « Régime social URSSAF » ; descriptions de 3 exemples.
- **Simulateur** — exemple chiffré : « sous le seuil RSPM de 38 000 € » → le remplaçant
  reste au RSPM cette année et la suivante (première année au-dessus de 19 000 €, sous
  38 000 €). Chiffres inchangés.
- **Comparatif** — « RSPM < 38 k€ vs PAMC » → « RSPM ou PAMC » (2×) ; persona Karim :
  « seuil RSPM 38 k€ » → « seuils du RSPM (19 000 € et 38 000 €) » (les régulateurs sont
  bien éligibles, d'après urssaf.fr).

**Non modifié, à trancher (fondateur)** :
- Le **moteur** du simulateur (mode Auto : RSPM sous 38 000 €) et de la calculette
  (alerte seulement au-delà de 38 000 €) : approximation « première année au-dessus de
  19 000 € » ; aucune alerte sur la règle des deux ans. Logique de calcul, hors lot texte.
- **Sortie du RSPM automatique ou à déclarer ?** Le glossaire et la boussole disent
  « l'URSSAF te radie d'office / tu bascules automatiquement » ; la calculette et une
  pépite disent « déclaration à faire auprès de l'URSSAF / acte que toi seul peux
  déclencher ». La page urssaf.fr ne le dit pas : à vérifier avant d'harmoniser.
- `getCarmfLabel` (`src/lib/carmfStatus.ts`, « Dispensé·e (remplaçant·e < 38 000 €) ») :
  non affiché sur le site (seul `normalizeCarmfStatus` est utilisé).

### 9.cs Codes des majorations PDSA : CRS n'existe pas (25 septembre 2026)

Point laissé ouvert : le glossaire et la boussole citaient « CRD, CRS, CRN, VRN, VRS »,
l'article PDSA « CRD / CRN / CRM / CRS, VRD / VRN / VRM / VRS ». Vérifié sur ameli.fr
(« Tarifs conventionnels des médecins généralistes et spécialistes », tableau 2026) et
recoupé avec la fiche SML « Quelles sont les règles de défiscalisation de la PDSA ? » :
- majorations de permanence des soins régulée : **CRN, CRM, CRD** (cabinet) et
  **VRN, VRM, VRD, VRS** (visite). **CRS n'existe pas** (le samedi n'a de majoration
  régulée qu'en visite, VRS) ; CRM, VRM et VRD manquaient au guide ;
- rémunération d'astreinte (montant fixé par le cahier des charges de l'ARS) : **PRN**
  (nuit), **PRD** (dimanche et fériés), **RSP** (samedi après-midi) — RSP manquait.

Corrigé : 14 listes de codes (boussole, glossaire PDSA, infobulles de la calculette,
un exemple de la calculette « CRD/CRS » → « CRD/VRD ») ; article PDSA (liste de codes
+ source ameli ajoutée ; `updatedDate` inchangée : correction ponctuelle). ZG-009
(position B) : « le BOFIP liste limitativement les majorations NGAP (…) » → le BOFiP
vise la rémunération d'astreinte et les majorations spécifiques du tableau
conventionnel (il ne nomme aucun code).

**À trancher (fondateur)** — ZG-009 conclut que l'« indemnité forfaitaire CPAM de
régulation » est imposable faute d'être « listée nommément ». Or le BOFiP (§ 60) parle
d'une « rémunération forfaitaire de régulation et d'astreinte » dans la partie
« Rémunération de l'astreinte », donc exonérable. Conseil fiscal non modifié ici.

**Erratum (4 octobre 2026)** : « CRS n'existe pas » est faux, la CRS a été rétablie — voir § 9.ds.

### 9.ct Chèques-vacances (ANCV) des indépendants : plafond de DSCN, SMIC de référence (25 septembre 2026)

Point laissé ouvert (« règles ANCV TNS non vérifiées »). Sources primaires :
- **ANCV** (ancv.com, et flyer « Offre ANCV TNS ») : ouvert aux travailleurs non salariés,
  « profession libérale » comprise ; exonération de charges sociales jusqu'à 30 % du SMIC
  mensuel brut par an (hors CSG-CRDS) ; exonération d'IR jusqu'à 1 SMIC mensuel brut par an.
- **Notice officielle 2041 DRI** (n° 52348#06, déclaration des revenus 2025 des
  indépendants, § 6.10) : « quel que soit le régime d'imposition (y compris micro-fiscal),
  déclarez le montant des chèques-vacances versés au travailleur indépendant, déductible
  fiscalement, **dans la limite d'un SMIC brut mensuel (1802 € au 01.01.2025)** » ; montant
  ajouté à la base CSG-CRDS, seule la part au-delà de 30 % du SMIC (541 € en 2025) soumise
  à cotisations.

Corrigé :
- **DSCN/DSDN** : le guide disait « montant **total** commandé, sans plafonner » ; c'est le
  montant **dans la limite d'un SMIC mensuel brut** (le « ne pas ramener soi-même à 547 € »
  reste juste). Glossaire ANCV, règle RO-005, fiche DSCN (description, erreur fréquente,
  conseil), infobulles et alertes de la calculette.
- **Calculette — moteur** : `DSCN` recevait le montant saisi sans plafond ; il reçoit
  désormais `cv.capped` (plafond fiscal de l'année, déjà utilisé pour 5HQ/5QC), en réel
  (`dsPamc.ts`) comme en micro (`useCalculetteResults.ts`). Vérifié : 690 € → 690 ;
  1 823 € → 1 823 ; 2 500 € → 1 823 + alerte.
- **Article frais pros** (FAQ, « L'essentiel », § 7.1) : « 1 867 € / ≈ 560 € depuis le
  1er juin 2026 » → SMIC du 1er janvier retenu par la notice : **1 823 € / ≈ 547 €** pour
  2026 ; déclaration « dans la limite d'un SMIC mensuel brut, micro-BNC compris » ; sources
  ajoutées (notice § 6.10, ANCV). `updatedDate` déjà au 25 septembre 2026.

**Non vérifié, laissé en l'état (à trancher)** : la mécanique micro-BNC « retirer de 5HQ
le montant × 1,515 » (la notice confirme la déductibilité en micro, pas la méthode) ; la
condition « activité libérale depuis plus d'un an » (absente des pages ANCV consultées) ;
la ligne de la 2035-A des frais ANCV (L30 dans le guide, « BP / cadre 4 » dans la
calculette).

### 9.cu Chèques-vacances, suite : ligne 2035-A des frais ANCV (25 septembre 2026)

Suite des points ouverts au § 9.ct.
- **Ligne des frais ANCV** : formulaire officiel 2035-A-SD 2026 (revenus 2025) — les lignes
  26 à 30 (réception, fournitures, actes et contentieux, cotisations syndicales, « Autres
  frais divers de gestion ») se totalisent en **BM** ; **BP** est la ligne 32 « Pertes
  diverses ». Le guide (« ligne L30 ») était juste ; l'infobulle de la calculette (« poste
  BP / cadre 4 ») → « Autres frais divers de gestion » (ligne 30, total BM).
- **DSCN plafonné à un SMIC** : reconfirmé par le guide officiel « Déclaration de revenus
  des travailleurs indépendants » (Urssaf, mars 2026) : « Ce montant ne peut excéder la
  valeur d'un SMIC brut mensuel ».
- **Toujours non vérifié sur source primaire** : la méthode micro-BNC « × 1,515 sur 5HQ »
  (reprise partout par les cabinets comptables, absente des notices officielles
  consultées) et la mécanique « L30 + L36 » de RO-011 en BNC réel.

### 9.cv Décisions du fondateur : sortie du RSPM d'office, forfait de régulation PDSA, alerte 19 000 € (26 septembre 2026)

Points laissés « à trancher » aux § 9.cr et 9.cs, tranchés par le fondateur.

**1. La sortie du RSPM est automatique.** L'URSSAF radie d'office au 1er janvier
suivant (deux années de suite au-dessus de 19 000 €, ou une au-dessus de 38 000 €) ;
l'année du dépassement, on reste au RSPM, cotisé à 21,2 % sur la part au-dessus de
19 000 €. Alignés sur le glossaire et la boussole (déjà justes) :
- calculette, alerte au-delà de 38 000 € : « (déclaration à faire auprès de l'URSSAF —
  CSS Art. L646-1) » → « l'URSSAF te fait sortir du RSPM d'office (aucune démarche) » ;
- FAQ de `/guide-declarations/calculette` : idem, + 21,2 % sur la part au-dessus ;
- pépite de la boussole : « acte administratif que toi seul(e) peux déclencher » →
  « la sortie du RSPM se fait d'office ».

**2. Forfait de régulation PDSA exonérable** (ZG-009) : le BOFiP (§ 60) range la
« rémunération forfaitaire de régulation et d'astreinte » dans la rémunération
d'astreinte. Position B et conclusion réécrites ; la phrase « Hippodoc la traite par
défaut comme imposable » est retirée (à aligner dans l'application si elle le fait
encore). Précision ajoutée : une régulation hors PDSA (ex. SAS en journée) reste
imposable. Constats de décès, réquisitions, SNP : inchangés (imposables).

**3. Calculette — nouvelle alerte** (`buildRspmWarnings`) : en RSPM, recettes entre
19 000 € et 38 000 € → « tu restes au RSPM cette année (21,2 % au-dessus de 19 000 €) ;
si tu avais déjà dépassé 19 000 € l'an dernier, sortie d'office au 1er janvier ; sinon,
tu y restes ». Aucun montant calculé ne change. Testé : 15 000 € (rien), 25 000 €
(alerte 19 k), 45 000 € (alerte 38 k).

Le simulateur (mode Auto, RSPM sous 38 000 €) reste inchangé, par décision du fondateur.

### 9.cw Balayage Lighthouse des 65 pages : derniers contrastes (26 septembre 2026)

Lighthouse (accessibilité, SEO, bonnes pratiques) lancé en local sur les 65 pages du
sitemap : 62 à 100/100/100. Trois pages à 96-97, toutes pour du contraste de couleur
(aucun texte modifié) :
- `/comparatif` : noms des outils écrits dans leur couleur de marque (Indy 4,15:1,
  Pennylane 4,46, Hiway Care 3,67, Hippodoc 3,21 sur fond bleuté). Nouveau champ
  `textColor` (couleur de marque assombrie : #C8215F, #4F46E5, #BE123C, #006BD6), la
  couleur de marque reste sur les barres et pastilles.
- `/guide-declarations` : compteurs « (17) » en `opacity-60` (Caseopédie, questions,
  fiches), précisions « (réel L21/BG…) » en `opacity-70`, étiquettes « Micro-BNC /
  Réel BNC » en `emerald-600` 10 px → `emerald-700`, statuts des problèmes (Actif /
  Résolu / Intermittent) en `-600` → `-700`, calendrier (mois courant `hippo-500` →
  `hippo-600`, « Ce mois » `hippo-600` → `hippo-700`).
- `/qui-sommes-nous` : badges blancs sur `amber-500`, `emerald-600`, `fuchsia-500` →
  `-700`.
Après correction : 100 en accessibilité sur les trois pages.

### 9.cx RSPM : quatre textes oubliés (résultats de la boussole, exemple de calculette) (26 septembre 2026)

Trouvés en portant les correctifs vers l'app : ces textes ne sont affichés que dans les
résultats interactifs de la boussole (profils « interne » et « structure »), donc absents
du HTML statique que le contrôle du § 9.cr avait balayé.
- `boussoleData.ts`, profil interne : « Tu es au RSPM tant que tes revenus libéraux
  restent < ~38 000 €/an » → option ouverte jusqu'à 19 000 €, 13,5 % / 21,2 %, sortie
  au 1er janvier (deux ans > 19 000 € ou un an > 38 000 €).
- `boussoleData.ts`, transition RSPM → PAMC, cas (B) : « dépassement du plafond
  ~38 000 € » → les deux déclencheurs.
- `boussoleData.ts`, profil structure : « En RSPM (< 38 000 €/an) … prélevées
  trimestriellement » → option jusqu'à 19 000 €, déclaration mensuelle ou trimestrielle.
- `calculetteExamples.ts` : « tant que tes recettes restent < 38 k€ » → « tant que tu y
  restes ».
Balayage complet des sources (hors commentaires) : plus aucune mention fausse du seuil.
### 9.cy Exemple « Léa » : le vrai gain, ≈ 765 € (26 septembre 2026)

Décision du fondateur (point ouvert du § 9.bf) : assumer le vrai chiffre.
`frais-pros-medecins-salaries-internes-2026` annonçait ≈ 1 435 € « à TMI 30 % » (et
≈ 1 500 €, « trois semaines de salaire net » en description et en accroche). À 30 000 € de
salaire, Léa est dans la tranche à 11 %. Recalcul (barème et décote des revenus 2025) :
impôt 1 564 € au forfait 10 % (27 000 € imposables), 799 € aux frais réels (22 216 €),
**gain ≈ 765 €**.
Modifié : description, « L'essentiel » (2 puces), accroche, règle d'or (11 % : 110 à
160 € pour 1 000 € de frais, la décote amplifiant l'effet ; 30 % : 300 €), tableau du
calcul (impôt forfait / réel / gain), encadré de conclusion (« une garde supplémentaire
par mois » → « un peu plus de 60 € par mois »). **Slide 18** (« TMI 30 % ≈ 1 435 € »)
retirée du carrousel en attendant sa refonte ; les 18 autres slides sont générales et
justes. `updatedDate` → 26 septembre 2026 (et `blog-meta.json`).
Non modifié : « 90 % des internes l'ignorent » (chiffre non sourcé, à étayer ou retirer).
### 9.cz Pastille « Essai gratuit » du header mobile, CTA `/essai` des sujets froids (26 septembre 2026)

Décisions produit du fondateur (points en attente du § 9.bf).
- **Pastille « Essai gratuit »** (`Header.astro`) : sous 1024 px, l'essai n'était
  accessible qu'en ouvrant le tiroir. Pastille visible à côté du menu, même lien que le
  bouton desktop (`APP_URL/auth?tab=signup`), `data-track="cta_signup_header_pill"`,
  40 px de haut. Zéro JS. Vérifié : logo + pastille + menu tiennent en 320 px sans
  débordement ; masquée à partir de 1024 px (bouton desktop inchangé). Texte nouveau :
  « Essai gratuit ».
- **CTA `/essai`** : `ctaHref` accepte `/essai` (`content.config.ts`) ; le bloc d'appel à
  l'action affiche alors « Découvrir Hippodoc » (`data-track="cta_essai_blog"`), avec le
  lien secondaire « Ou commence l'essai gratuit » comme pour le simulateur. Appliqué à
  `syndrome-imposteur-5-astuces` et `inbox-zero-remplacant`. Texte nouveau : « Découvrir
  Hippodoc ».
Lighthouse local : accessibilité / bonnes pratiques / SEO 100 (accueil, article,
simulateur), CLS 0, TBT 0.
### 9.da Chèques-vacances en micro-BNC : le « × 1,515 » passe en zone grise (26 septembre 2026)

Décision du fondateur. Le guide présentait comme **confirmée** la minoration de 5HQ du
montant × 1,515. Sources : la notice officielle (n° 52348#06, § 6.10) vise le micro-fiscal
et parle d'un montant « déductible fiscalement », mais ne décrit aucune méthode ; un
article de praticien (non officiel) affirme qu'aucune déduction n'est possible en
micro-BNC et que certains SIE refusent le coefficient. Aucune source primaire ne tranche.
- Nouvelle fiche **ZG-017** (zones grises) : les deux positions, et la conclusion (ce qui
  est sûr / ce qui ne l'est pas, demander au SIE par la messagerie impots.gouv.fr).
- RO-005 : puce micro-BNC réécrite (renvoi ZG-017), exemple micro étiqueté « zone
  grise ». Reste « confirmée » pour les plafonds, DSCN et le réel. ZG-017 est citée
  depuis les cases 5HQ et DSCN et la question QT-026 (convention des tests de l'app :
  une règle ne lie que des règles, toute fiche est citée au moins une fois).
- Case 5HQ (description, conseil), piège ANCV micro, glossaire ANCV : même prudence.
- Calculette : elle applique toujours le × 1,515 (déductibilité prévue par la notice),
  mais affiche désormais une alerte « zone grise » dès qu'il y a des chèques-vacances en
  micro-BNC ; libellé « − Chèques-vacances (× 1,515, IR seul, zone grise) ».
- FAQ de la page calculette : idem, et « La case DSCN reçoit le montant TOTAL commandé »
  (oubli du § 9.ct) → « dans la limite du plafond fiscal (1 SMIC mensuel brut) ».

### 9.db Recherche dans le blog (26 septembre 2026)

Décision du fondateur. `/blog` ne permettait de trouver un sujet qu'en faisant défiler
(46 articles rangés par série), alors que les lecteurs arrivent avec une question précise.
- **Champ « Rechercher un article »** sous le titre de `/blog` (`role="search"`, libellé,
  ligne d'état `aria-live` à hauteur réservée : aucun décalage de mise en page).
  Filtre instantané, 10 résultats au plus (titre + temps de lecture), Entrée ouvre le
  premier, Échap vide. Sans résultat : renvoi vers le guide des déclarations et
  « Prendre 15 min avec Ryan » (`data-calendly="blog_search"`). Textes nouveaux :
  placeholder, ligne d'état, bloc « Pas encore d'article sur ce sujet ».
- **Index** `/blog/recherche.json` (généré au build, ~70 Ko, ~20 Ko compressé) : titre,
  description, série, catégorie, mots-clés, questions de FAQ, intertitres et bloc
  « L'essentiel » de chaque article, normalisés (minuscules, sans accents).
- **Moteur** `src/lib/blog-search.ts` : mots vides ignorés (une question tapée en entier
  marche), synonymes du métier (DS PAMC → DSFU, impôt ↔ IR, retraite ↔ CARMF,
  chèques-vacances ↔ ANCV, garde ↔ PDSA…), termes courts cherchés comme mots entiers,
  titre pondéré ; si aucun article ne contient tous les mots, résultats « approchants ».
- **Chargement** : script de page ~1 Ko compressé (uniquement sur /blog) ; module et
  index au premier focus. Sans JavaScript, bloc masqué (`<noscript>`), page identique.
  Exception ajoutée à la règle « zéro JS » dans CLAUDE.md.
- **Mesure** : `blog_search { query (60 car.), results_count, approximate }`, émis 1,5 s
  après la fin de la frappe via `page-analytics.ts` (contexte commun) ; clics sur les
  résultats en autocapture (`data-ph="blog_search_result"`, `data-ph-rank`). Les
  recherches à 0 résultat disent ce qui manque au blog.
Vérifié : build, verify-site ; navigateur (chargement au focus, résultats, cas vide,
Échap, Entrée, événement) ; mobile 375 px sans débordement ; Lighthouse `/blog` :
a11y / BP / SEO 100, CLS 0, TBT 0.

### 9.dc Chèques-vacances : conditions et multiples de 10 € ; « 90 % des internes » retiré (26 septembre 2026)

- **Condition « activité depuis plus d'un an »** (RO-005, glossaire ANCV) : absente de la
  page officielle de l'ANCV (« Un chef d'entreprise peut-il bénéficier des
  Chèques-Vacances ? », cheque-vacances.com), qui ne pose que le seuil de moins de 50
  salariés et renvoie à l'art. L.411-1 du Code du tourisme ; seuls des sites secondaires
  l'évoquent. Reformulé au conditionnel (« l'ANCV ne mentionne pas d'ancienneté
  minimale ; certains sites évoquent un an d'activité, vérifie-le en créant ton compte »).
- **Multiples de 10 €** (même page ANCV : « commandés par multiples de 10 € ») : les
  exemples « ex : 1 823 € » (montant inscrit en DSCN) → « ex : 1 820 € » avec la raison.
  La même page confirme le plafond social 2026 : 546,90 € (30 % du SMIC du 1er janvier).
- **« 90 % des internes l'ignorent »** (`frais-pros-medecins-salaries-internes-2026`,
  L'essentiel et accroche) : aucune source trouvée. Remplacé par un fait vérifiable : le
  forfait de 10 % s'applique par défaut. `updatedDate` inchangée (déjà au 26 septembre).
Côté app : ces trois textes existent aussi dans ses copies du guide ; à reprendre lors
d'une prochaine synchronisation (hors du patch déjà transmis).

### 9.dd Micro-BNC : la case DSDE (revenu brut social) doit rester vide (26 septembre 2026)

Trouvé en vérifiant la question « faut-il remplir DSDF en micro-BNC ? » de la carte de la
demande. **Source primaire** : guide Urssaf « Déclaration sociale et fiscale de revenus
2025 — Praticiens et Auxiliaires Médicaux Conventionnés », partie micro-BNC : « Vous
n'êtes pas concerné par la nouvelle rubrique « revenu brut social ». Le chiffre d'affaires
micro-BNC doit être déclaré uniquement en 5HQ/5IQ et ne doit pas figurer en revenu brut
social. » Même règle dans la notice 52348#06 (§ 4 et 6.1 : revenu brut social = régime réel).
- **Le guide disait juste** (fiche DSDE : « En micro-BNC, ne PAS remplir DSDE »), mais la
  **calculette** affichait en micro-BNC une valeur à reporter en DSDE (« Recettes nettes
  URSSAF »), avec la mention « certains cabinets laissent DSDE vide — les deux pratiques
  sont acceptées ». Faux : la remplir fait compter les recettes deux fois.
- **Corrigé** : moteur `dsPamc.ts` (DSDE/DSDG = 0 en micro-BNC ; l'app s'en sert pour son
  Aide DSFU) ; calculette : `DSDE = 0` en micro, ligne « Revenu brut social : laisser vide
  en micro-BNC » avec la citation Urssaf, « DSDE= # laisser vide » dans la liste à
  recopier, ligne « Détail technique » réécrite ; la décomposition de 5HQ s'appuie sur la
  base reconstituée (`rbs.rbs`), inchangée. Fiche DSDE : l'abattement de 34 % s'applique
  aux recettes de **5HQ**, pas « au CA déclaré en DSCS ».
- Vérifié : micro 60 000 € → DSDE 0 (base interne 60 000 €) ; réel (CP 70 000 €, BK
  15 000 €) → DSDE 85 000 €, inchangé.

### 9.de Compléments issus de la carte de la demande : zones FRR, CFE, primes CPAM (26 septembre 2026)

Trois questions du corpus sans réponse sur le site, vérifiées sur source primaire (le corpus
n'a servi qu'à choisir les sujets).
- **`zones-frr-exoneration-impot-medecin`** — nouvelle section « Et si tu pars avant la
  fin ? » : remboursement de l'impôt exonéré (avec intérêt de retard) seulement en cas de
  délocalisation hors zone FRR dans les cinq ans suivant le dernier exercice exonéré
  (donc jusqu'à la 13e année) ; pas de remboursement en cas de simple cessation (exemple
  BOFiP du généraliste devenu médecin du travail salarié), de transfert vers une autre
  commune FRR (exonération maintenue) ou de déclassement de la commune (droits acquis) ;
  perte d'une condition = perte pour l'avenir seulement. Source : BOI-BIC-CHAMP-80-10-75-40
  (29/07/2026), § 150, 170, 200-220.
- **`cfe-medecin-remplacant`** — bureau à domicile / téléconsultation : une seule
  cotisation minimum, au principal établissement (CGI art. 1647 D ; BOI-IF-CFE-20-20-40-10)
  ; pièce retenue seulement si affectée à l'activité, locaux d'habitation exclus
  (BOI-IF-CFE-20-20-10-10, § 80) ; un bureau dédié en plus d'un cabinet s'ajoute sur sa
  propre valeur locative.
- **`remplir-declaration-2035`** — prime OPTAM, ROSP, forfaits CPAM : recettes imposables
  (BOI-BNC-BASE-20-20, § 10 ; ameli : OPTAM « rémunération spécifique annuelle »),
  imposées l'année d'encaissement.
`updatedDate` des trois articles → 26 septembre 2026 (et `blog-meta.json`).
**Non traité, faute de source officielle qui tranche** : « faut-il une cessation
d'activité pour passer d'installé à remplaçant ? » (CNOM et ameli ne couvrent que
l'information du conseil départemental et les obligations envers les patients ; rien sur
la qualification URSSAF/fiscale). À traiter avec une réponse écrite du CDOM ou de l'URSSAF.

### 9.df IJ CARMF d'incapacité temporaire : hors DSCZ, à retirer de l'assiette sociale (26 septembre 2026)

Trouvé en préparant l'article « Prévoyance : tes IJ sont-elles imposables ? ».
**Sources** : notice 52348#06 (revenus 2025) — § 6.5 : DSCZ/DSDZ = AJPA + IJ « Madelin »
(hors ALD), rien d'autre ; § 5.4 : en micro-BNC, les « indemnités et allocations
journalières d'invalidité servies par les régimes complémentaires obligatoires
d'invalidité-décès en cas d'incapacité temporaire » se déclarent en DSCI/DSCJ, montant
« déduit de l'assiette des cotisations et de la CSG-CRDS » ; en réel, elles figurent dans
les sommes à déduire du revenu brut social (ligne DB). Brochure IR 2026 (p. 193, 209) : même
liste pour DSCZ.
- **Moteur `dsPamc.ts`** (utilisé par l'Aide DSFU de l'app) : `DSCZ` additionnait les IJ
  CARMF temporaires aux IJ Madelin (« doctrine Phase 9H »), les soumettant à cotisations.
  → `DSCZ = IJ Madelin` ; alerte quand des IJ CARMF sont saisies (imposables en BNC, à
  retirer en DSCI en micro ou en ligne DB en réel). Même correction dans la calculette
  (sans effet visible sur le site : le champ n'y est pas proposé).
- **Guide** : fiche PC-014 et glossaire (DSCZ) — IJ CARMF : ajout du retrait de l'assiette
  (DSCI / ligne DB) ; « IJ non Madelin … soumises aux cotisations si versées sur le compte
  pro » (sans source) → présenté comme la zone la moins tranchée (absentes de la liste
  DSCZ ; exclues pour les salariés, brochure p. 93 ; rien d'exprès pour les BNC).

### 9.dh Accueil : le compteur d'articles est calculé au build (26 septembre 2026)

La tuile « Articles pédagogiques au blog » de `SocialProofSection.astro` affichait **38**
(valeur écrite en dur lors de la migration) alors que le blog en compte 46. Elle lit
désormais `getCollection('blog').length` au build : le chiffre suit chaque nouvel article.
Seul le nombre change, pas le libellé.

### 9.di Nouvelle page /guide : le « Guide du remplaçant » en PDF offert (26 septembre 2026)

**Contenu ajouté** (à relire) : page `/guide`, porte d'entrée du lien envoyé en DM
Instagram par ManyChat. Le PDF (`public/guide/guide-du-remplacant-2026-2027.pdf`,
26 pages, fourni par le fondateur) se télécharge sans inscription. Le texte de la page
reprend le guide : sommaire (p. 2) et « L'essentiel en 6 règles » (p. 3), mot pour mot.
Rédigés pour la page : le chapô du sommaire (« Neuf chapitres, dans l'ordre où tu en
auras besoin »), les sous-titres de chapitres, l'encart auteur, l'aide « Le PDF ne
s'ouvre pas depuis Instagram ? » et le second bouton.

Choix :
- **Pas de formulaire.** ManyChat a déjà le contact ; redemander un email dans le
  navigateur intégré d'Instagram coûte des téléchargements pour une donnée déjà acquise.
- **Page indexable, PDF non indexable** : `X-Robots-Tag: noindex` sur `/guide/*.pdf`
  (vercel.json), pour que Google positionne la page (mesurée, reliée au site) et non le
  fichier nu. `Content-Disposition` donne au fichier enregistré un nom lisible.
- **Bouton en `target="_blank"`**, dans le premier écran mobile (avant la couverture).
  Dans le navigateur intégré, le PDF s'ouvre souvent dans le même onglet : vérifié en
  local, `guide_remplacant_downloaded` part quand même avant la navigation.
- **Image de partage dédiée** `public/guide/partage.jpg` (1200×630), pour l'aperçu du
  lien dans le DM. Couverture et aperçus de pages rendus depuis le PDF
  (`src/assets/guide/`, optimisés en webp au build).
- Lien ajouté au footer (« Guide du remplaçant (PDF) ») et à `llms.txt`.

Mesure (PostHog, `page-analytics.ts`, route ajoutée dans `PostHog.astro`) :
`guide_remplacant_viewed` et `guide_remplacant_downloaded` (`placement` : hero /
couverture / bas), avec le contexte commun (`utm_*`, `referrer_source`, `device_type`)
plus `edition` et `in_app_browser` (instagram / facebook / null). Vérifié dans PostHog
avec `?utm_source=instagram&utm_medium=dm&utm_campaign=guide-remplacant`.

Données d'édition centralisées dans `src/lib/guide-remplacant.ts` ; la date « À jour
au » est un littéral de `pages-lastmod.ts` (lu par regex dans verify-site.mjs).
Nouvelle édition : nouveau nom de fichier PDF, mêmes constantes, visuels et
`Content-Disposition` à mettre à jour ; l'URL `/guide` ne change jamais.

Lighthouse mobile /guide : perf 97, a11y 100, BP 100, SEO 100.

### 9.dj /guide : audit après mise en ligne (27 septembre 2026)

Premières données (26-27/09) : aucune vraie visite Instagram encore, hormis le test du
fondateur (iPhone, Chrome). Cinq « vues » à 22 h 21 le 26/09 sont un robot Bing
(référent bing.com, États-Unis, écrans factices, 5 visites en 4 s) : **pour le taux de
téléchargement, filtrer `$geoip_country_code = FR`**, sinon chaque passage de robot le
fait baisser.

Changements :
- **Premier écran allégé** : « Gratuit » en double et le poids du fichier (742 Ko)
  retirés ; l'aide Instagram tient en une phrase (« Rien ne s'ouvre ? Touche ⋯ puis
  « Ouvrir dans le navigateur ». »). Corrige aussi l'espace manquant après « ⋯ ».
- **Bouton plus visible** : texte en 20 px gras (« grand texte » WCAG, seuil 3:1), ce
  qui permet l'emerald-600 (3,76:1) au lieu du 700, plus terne sur le fond bleu.
- **Les 6 règles passent avant le sommaire** : c'est la partie qui apporte quelque
  chose tout de suite ; la phrase de remplissage qui les suivait devient une relance
  « Télécharger le guide → » (`placement: regles`).
- **Partage WhatsApp** (lien `wa.me`, zéro JS) dans le bloc du bas, avec
  `utm_source=whatsapp&utm_medium=partage` ; événement `guide_remplacant_shared`.
- Encadré auteur : le lien vers l'équipe porte sur « Ryan », la ligne « Qui sommes-nous »
  séparée disparaît.

Décidé de ne PAS ajouter la vidéo de présentation : elle présente l'app, pas le guide ;
sur l'accueil, 9,4 % seulement de ceux qui voient sa section la lancent (§ commentaire de
`PresentationVideoSection.astro`) ; le visiteur venu d'un DM veut le PDF, et la page 25
du guide présente déjà Hippodoc. À réévaluer si les données montrent beaucoup de
téléchargements et peu de visites vers le simulateur ou l'essai.

Lighthouse mobile /guide : perf 98, a11y 100, BP 100, SEO 100.

### 9.dk /guide : contrôle mobile 320 → 414 px et paysage (27 septembre 2026)

Mesuré en production à 320×568, 360×640, 390×660, 414×736 et 740×360 (paysage) : aucun
débordement horizontal, aucune cible tactile < 24 px, aucun texte < 12 px, bouton de
téléchargement dans le premier écran partout sauf en paysage (à moitié visible, cas
marginal depuis Instagram). Deux corrections :
- **« 2026-2027 » ne se coupe plus au tiret** (titre et badge, `whitespace-nowrap`) ;
  le badge passe en `inline-block` pour revenir à la ligne entre ses segments — en
  `inline-flex`, les segments insécables l'élargissaient au-delà de 320 px, et le bouton
  avec lui.
- **Pas de bulle de chat sous 768 px sur /guide** : à 320 px, ses 56 px masquaient la
  droite des cartes pendant toute la lecture. Ces visiteurs arrivent d'un DM Instagram,
  où la conversation a déjà lieu (le guide y renvoie p. 25). Règle CSS dans la page,
  vérifiée absente de la feuille partagée ; la bulle reste sur ordinateur.

### 9.dl Menu « Ressources » : « Guide du remplaçant (PDF) » (27 septembre 2026)

Ajouté au menu déroulant « Ressources » (ordinateur) et à la liste Ressources du tiroir
mobile, en 2e position après le Simulateur. **Pas en onglet de premier niveau** : la nav
a été volontairement réduite à 3 ancres produit + Ressources (passe d'août 2026), et le
guide est une ressource, pas une section de l'offre.

Pourquoi l'ajouter : /guide n'était lié que depuis le footer ; le header le relie
désormais depuis toutes les pages (signal d'importance pour Google), et le PDF offert
donne une porte d'entrée au visiteur de l'accueil qui n'est pas prêt pour l'essai.
Menu élargi de `w-56` à `w-64` : le libellé passait sur deux lignes.
Clics : `landing_resource_guide-remplacant` et `landing_mobile_resource_guide-remplacant`
(autocapture, convention existante).

### 9.dm /guide : le bleu du hero passe sous la pilule du menu (27 septembre 2026)

Seule page du site dont le premier bloc est sombre et collé au header : la pilule du menu
(sticky, fond « glass ») laissait une bande blanche au-dessus du bleu, effet « collé »
remarqué sur iPhone. Le hero remonte de la hauteur du header (`-mt-[72px]`,
`sm:-mt-[76px]`) et son padding haut compense exactement : le contenu ne bouge pas
(badge à 104 px sur mobile, bouton inchangé), la pilule flotte sur le bleu.

### 9.dn Menu mobile : ouverture fluide, sans flou d'arrière-plan (27 septembre 2026)

Ouverture du tiroir jugée saccadée, « avec de la latence », sur téléphone. Le calcul de
style au clic est négligeable (~1 ms mesuré) : le coût est côté GPU. L'overlay plein
écran portait un `backdrop-blur-sm` animé en opacité, et le tiroir un `backdrop-blur-xl
backdrop-saturate-150` qui devait refloutir, à chaque image de son glissement, ce qui
était déjà flouté — le tout au-dessus d'une landing qui compte ~95 surfaces en
`backdrop-filter` (mesuré). Les deux flous du menu sont retirés ; le tiroir passe d'un
fond « glass » à 92 % à un fond plein de la même teinte (sur un voile noir à 60 %, le
flou était de toute façon quasi invisible). Ajouts : `touch-manipulation` sur le bouton
hamburger (aucun délai de double-tap possible), `overscroll-contain` sur la liste du
tiroir (le défilement n'entraîne plus la page derrière). Pas de verrouillage du scroll
de la page : basculer `overflow` sur `<html>` relancerait une mise en page complète
pile au démarrage de l'animation.
Aucun contenu ni lien modifié.

**Deuxième passe, même jour — la vraie cause.** Après déploiement, le menu restait peu
fluide sur iPhone. Mesure avec Playwright (moteur WebKit, viewport 390 × 844, DPR 3) :
sur l'accueil, chaque ouverture ne produisait que ~8 images en 700 ms (images de
150–190 ms) et ~120 ms entre l'appui et l'affichage, alors que `/faq` était fluide
(46 images, 16 ms). JS et recalcul de style ≈ 1 ms : tout le coût était au dessin.
Bissection par CSS injecté : couper les `backdrop-filter` n'aidait qu'à moitié ; couper
les **halos décoratifs en `filter: blur`** (`blur-3xl`, `blur-xl`… — 5 dans le hero,
le pire étant le rectangle incliné derrière la capture du tableau de bord) rendait
l'ouverture parfaite. Mécanisme : sans calque propre, WebKit recalcule le flou à chaque
image où sa zone est redessinée, et les reflets `shimmer` en boucle des boutons voisins
la redessinent en continu.
Correctif : `will-change: transform` sur toute classe de flou Tailwind (règle unique en
fin de `global.css`, sélecteurs `[class~='blur']`, `[class^='blur-']`,
`[class*=' blur-']` — n'atteint pas `backdrop-blur-*`). 44 halos concernés sur
l'accueil. Résultats WebKit avant → après : accueil 8 → 46 images/ouverture, pire
image 187 → 20 ms, appui → affichage 112 → 16 ms ; `/simulateur` pire image 86 → 20 ms ;
`/guide` 55 → 20 ms. Chrome (CPU ×6) : première ouverture sur l'accueil 150 → 33 ms.
Rendu vérifié au pixel (pixelmatch, WebKit + Chrome, 390 et 1280 px, accueil, /guide,
/simulateur, /qui-sommes-nous) : 0 pixel différent.

### 9.do Menu mobile : réponse immédiate à l'appui, mouvement « natif iOS » (27 septembre 2026)

Après § 9.dn, le menu restait perçu comme en retard sur iPhone 16 Pro : « le bouton
s'allume en blanc, puis un temps mort avant que le menu apparaisse ». Ce n'est pas un
problème de puissance mais de **courbe** : la transition utilisait la courbe par défaut
de Tailwind `cubic-bezier(0.4, 0, 0.2, 1)`, qui démarre lentement (1 % de la course à
16 ms, 9 % à 50 ms), et le tiroir partait 20 px hors écran (`translate-x-[110%]`) :
rien de visible pendant ~70 ms, alors que le bouton, lui, changeait de fond aussitôt
(`hover:bg-hippo-50`, appliqué au toucher par iOS et resté « collé » ensuite).
Changements (`Header.astro`, aucun contenu ni lien modifié) :
- tiroir : courbe des panneaux iOS `cubic-bezier(0.32, 0.72, 0, 1)`, 420 ms à
  l'ouverture, 300 ms à la fermeture ; départ au ras du bord (`100% + 1rem`) : 40 px
  visibles dès ~30 ms. Réglés dans le `<style>` du composant : avec le plugin
  `tailwindcss-animate`, les classes arbitraires `ease-[…]`/`duration-[…]` sont
  ambiguës et Tailwind les ignore sans erreur visible (seulement un warn en CLI) ;
- overlay : fondu `ease-out` (départ rapide), 300 ms / 200 ms ;
- liens du tiroir en cascade : glissement de 12 px + fondu, décalage 30 ms + 15 ms par
  rang (`--i`), effacement groupé à la fermeture ; désactivé en `prefers-reduced-motion` ;
- retour tactile : `active:scale-90 active:bg-hippo-100` sur le hamburger et la croix,
  `active:bg-hippo-50` sur les liens ; les `hover:` du menu passent sous
  `@media (hover: hover)` (plus de fond collé après un toucher) ; voile gris natif
  supprimé (`-webkit-tap-highlight-color: transparent` sur le header) ; écouteur
  `touchstart` passif vide dans le script inline, sans quoi Safari iOS n'applique pas
  `:active`.
Mesures WebKit (390 × 844) : 46 images par ouverture, pire image 19 ms, appui →
affichage 16 ms ; Chrome CPU ×6 : pire image 17–33 ms. Fermeture par ancre, par
l'overlay et par la croix vérifiées.

### 9.dp Scripts tiers : jamais chargés pendant un geste (27 septembre 2026)

Après § 9.do, le menu était fluide sur l'accueil mais gardait « une latence étrange »
sur `/guide`. Cause : GA4 (et le pixel Meta si consentement) se chargeait **au premier
geste** — souvent l'appui sur le menu quand on arrive sur une page. gtag.js
s'exécutait alors en plein démarrage de l'animation ; dès la 2e page vue, il sort du
cache HTTP et s'exécute presque aussitôt, d'où un effet pire sur `/guide` que sur
l'accueil. Mesuré (Chrome, CPU ×6, 1re ouverture) : 51 images / 17 ms tiers bloqués,
38 images / 217 ms avec GA, 12 images / 250 ms avec GA + pixel.
Nouvelle règle (`ThirdPartyScripts.astro`) : mêmes déclencheurs (1er geste ou 6 s après
`load`), mais le chargement n'a lieu qu'après **1 s sans aucun geste**, puis via
`requestIdleCallback`. Résultat : 1re ouverture 51–54 images, pire image 50–67 ms
(identique au cas « tiers bloqués »), ouvertures suivantes 17 ms. Chargement vérifié :
sans geste à 6,1 s ; un appui à 1 s → GA et pixel à 2,1 s ; gestes continus 5 s → 5,8 s.
Effet de bord accepté : un visiteur qui quitte la page moins d'1 s après son premier
geste n'envoie pas de page_view GA4 (PostHog, lui, est inchangé).

### 9.dq /qui-sommes-nous : refonte éditoriale (27 septembre 2026)

Demande owner (« carte blanche ») : rendre la page plus intéressante, retirer les
coquilles, mettre en avant les soutiens, les syndicats d'internes et The Pitch by Deel.
La page est aussi la **page auteur** des 46 articles (le JSON-LD `author` de chaque
article pointe ici) : elle doit dire qui écrit, avec quelles sources, soutenu par qui.

**Nouvelle structure** : héros (la question « combien je gagne vraiment ? » + photo
de Ryan) → récit à la première personne (repris du pitch de Ryan, juin 2026, et du
texte « Le constat » de l'ancienne page) → équipe (Ryan, Thomas) → 4 engagements →
soutiens (cartes datées, pas seulement des logos) → syndicats d'internes avec leur
ville → parcours → chiffres → contact direct (mail, Calendly `qui_sommes_nous`,
Instagram) → CTA (`cta_signup_qui_sommes_nous` inchangé).

**Retiré** :
- jalon 2025 « Ouverture aux médecins installés, salariés et en activité mixte » —
  contredit le positionnement « remplaçants » du reste du site ;
- chiffres « 350+ documents générés » (dessert face à 900+ inscrits) et « 4.9/5
  Satisfaction » (aucune source) ;
- les trois témoignages hérités de la SPA (« Dr Sophie M. », « Dr Julien R. »,
  « Dr Amina K. ») : invérifiables. Emplacement conservé dans le code (tableau
  `testimonials` vide → section non rendue) pour de **vrais** avis, publiés avec
  l'accord des personnes ;
- badge « Made with ❤️ by doctors » (anglais, et « doctors » au pluriel inexact) ;
- mention « levé 22M€ » (Meilisearch) dans la carte de Thomas : chiffre d'une autre
  entreprise, non vérifié.

**Ajouté (faits vérifiés sur pièces)** :
- Innov'Up : subvention de la Région Île-de-France instruite par Bpifrance, accord
  notifié le 26 novembre 2025. Remplace les deux logos « BPI France » + « Région IDF »
  présentés comme deux soutiens distincts ;
- La French Care : membre (réseau d'innovation en santé associé à Bpifrance) ;
- The Pitch by Deel : candidature classée dans le top 3 % par des investisseurs,
  finale régionale de Paris à Station F le 13 avril 2026, pitch sur scène en anglais.
  Pas de victoire : rien ne le laisse entendre ;
- syndicats : SILR (Montpellier, convention mars 2026, listé sur silr.fr), CRP-IMG
  (Poitiers, convention juin 2026), SIOI (La Réunion, convention juin 2026), AIMGL
  (Limoges — **le libellé de l'accueil disait « Association des Internes de Médecine
  Générale » sans ville ; corrigé aussi dans `HeroSection`/`PartnersSection`**),
  Doctripper ;
- chiffre « 10 000+ abonnés sur Instagram » ; nombre d'articles calculé depuis la
  collection `blog` (plus de chiffre figé à maintenir).

**SEO** : H2 au lieu de H3 pour les sections ; JSON-LD `Person` pour Ryan (`@id`
`/qui-sommes-nous#ryan-goburdhun`, `jobTitle`, `knowsAbout`, `sameAs` LinkedIn, image)
et Thomas ; `AboutPage.mainEntity` → Organization. Schéma Organization global
(`site.ts`) : `funder` (Bpifrance, Région Île-de-France) et `memberOf` (La French Care).
Titre : « Hippodoc, créé par un médecin remplaçant — Qui sommes-nous ».

**Coquilles hors page** : « BPI France » → « Bpifrance » (alt et libellés du footer,
du héros et des partenaires de l'accueil).

Lighthouse (build local, `/qui-sommes-nous`) : 99 / 100 / 100 / 100.

**2e passe, même jour (retours owner : « trop dense, redondant ? », HomeDoc oublié,
photo du pitch)** — chaque information n'apparaît plus qu'une fois :
- héros réduit à une question + une phrase + la photo ; `PRODUCT_DEFINITION` déplacée
  sous le H2 « Hippodoc aujourd'hui » (toujours visible, pour le GEO) ;
- frise « Notre parcours » supprimée : elle redisait les soutiens et le « 900+ ».
  Les dates 2023 (premières lignes) et 2024 (ouverture aux remplaçants, arrivée de
  Thomas) sont passées dans le récit et la carte de Thomas ;
- récit : la question du H1 n'y est plus répétée ; « captures d'écran » → « notes
  iPhone » (demande owner) ; phrase de conclusion redondante avec la citation retirée ;
- équipe : sous-titre retiré (redisait le héros), carte de Ryan réduite à 2 lignes,
  citation de Thomas en un seul paragraphe ;
- engagements : 3 au lieu de 4 (« Pensé par quelqu'un qui remplace » redisait le récit) ;
- soutiens : **photo de Ryan sur scène** (fournie par l'owner,
  `src/assets/about/ryan-the-pitch-deel-station-f.jpg`) en carte principale Deel,
  Innov'Up et La French Care en deux cartes compactes. Innov'Up au passé (« a
  financé ») : programme clos en mars 2026 ;
- partenaires : syndicats (4) séparés des partenaires non syndicaux ; **HomeDoc
  ajouté** (logement des internes, Dr Olivier Dosseh, collaboration Instagram d'avril
  2026) — logo fourni par l'owner, recadré en `public/lovable-uploads/homedoc-logo-160.webp` ;
- bloc contact fusionné dans le CTA final (plus de section à part), « 900+ » retiré
  du CTA (il reste dans les chiffres).

### 9.dr Liens Calendly : suivi chargé sur toute page qui en porte un (27 septembre 2026)

Constaté en production juste après § 9.dq : le lien « 15 min avec Ryan » de
`/qui-sommes-nous` partait **sans UTM** et sans `calendly_clicked`. Cause : le module
`analytics-init` (qui branche les `a[data-calendly]`) n'était importé que sur une liste
de chemins (`/`, `/tarifs`, `/faq`, `/comparatif`, `/guide-declarations`, `/guide`,
`/blog`, `/simulateur`) et `/qui-sommes-nous` n'y figurait pas. `verify-site.mjs`
contrôlait bien la présence de `data-calendly`, mais pas que le module soit chargé.
Correctif (`PostHog.astro`) : import aussi dès qu'un `a[data-calendly]` est présent
dans la page (le script est un module, donc exécuté après l'analyse du DOM). Les
pages sans lien Calendly ne téléchargent toujours rien. Vérifié sur le build local :
`/qui-sommes-nous?utm_source=instagram&utm_medium=bio&utm_campaign=test_qsn` →
lien réécrit avec ces UTM et `utm_content=qui_sommes_nous` ; `/mentions-legales` →
aucun module d'analytics chargé.

### 9.ds Codes des majorations PDSA : CRS existe (4 octobre 2026)

Corrige le § 9.cs. Son affirmation « **CRS n'existe pas** (le samedi n'a de majoration
régulée qu'en visite, VRS) » était **fausse** (signalé par le fondateur). Elle reposait
sur le tableau ameli.fr des tarifs conventionnels, qui liste CRN, CRM, CRD, VRN, VRM,
VRD et VRS mais pas la CRS : l'absence d'un code de ce tableau ne prouve pas qu'il
n'existe pas.

Source : MG France, « Cotation en permanence de soins »
(https://mgfrance.org/index.php?Itemid=861&catid=107%3Anomenclature&id=272%3Acotation-en-permanence-de-soins&option=com_content&view=article,
mise à jour du 4 mai 2022), rubrique « PDS au Cabinet » : majoration de samedi
après-midi de 12 h à 20 h, **CRS**, 26,50 € ; créée par la CNAM pour distinguer le
samedi des jours fériés, elle « n'est pas appliquée dans tous les départements » —
là où elle ne l'est pas, on cote la **CRD**. Recoupé avec MG France, « Les majorations
nuits et jours fériés en garde régulée »
(https://www.mgfrance.org/cotation/publication/je-fais-un-acte-regule/les-majorations-nuits-et-jours-feries,
mise à jour du 9 janvier 2026) : CRS listée, G 30 + CRS 26,50 = 56,50 €.

Liste juste (8 majorations spécifiques de permanence des soins régulée) :
- au cabinet : **CRN** (nuit 20 h-0 h / 6 h-8 h), **CRM** (milieu de nuit 0 h-6 h),
  **CRD** (dimanche et fériés), **CRS** (samedi après-midi ; CRD à la place dans les
  départements qui ne l'appliquent pas) ;
- en visite : **VRN**, **VRM**, **VRD**, **VRS**.
Le reste du § 9.cs tient : CRM, VRM, VRD et l'astreinte RSP manquaient bien ; la
reformulation de ZG-009 (position B) est conservée (CRS ajoutée à sa liste) ; la ligne
ameli des sources de l'article reste telle quelle (ameli ne liste que les 7 autres codes).

Corrigé (ordre local conservé : CRS après CRD, symétrique de VRS après VRD) :
- `src/data/boussoleData.ts` : 9 listes (RO-006, RO-015, cases DSFA et CI, QT-048,
  PC-003, ZG-006 position A, ZG-009 positions A et B) ;
- `src/data/glossaireDeclarationsData.ts` : entrée PDSA ;
- `src/components/calculette/CalculetteForm.tsx` : 2 infobulles (micro et réel) ;
  `calculetteSchema.ts` : commentaire ; `calculetteExamples.ts` : exemple
  « pdsa-zone-rurale », « CRD/VRD » → « CRD/CRS » (texte d'avant le 25/09 : deux
  majorations de cabinet du week-end, se lit naturellement) ;
- article `pdsa-exoneration-gardes-regulees.md` : liste « au cabinet : CRN / CRM / CRD /
  CRS » ; ligne Sources complétée par la page MG France 2026 pour la CRS (le titre
  « vérifiées au 25 septembre 2026 » n'a pas été touché). `updatedDate` inchangée
  (2026-09-25, `blog-meta.json` intact) : correction ponctuelle, comme le 25/09 ;
  l'article retrouve un code qu'il citait jusqu'au 25/09.

Réserve sur les départements non ajoutée au contenu du site : aucune phrase du site ne
disait que la CRS n'existe pas ni que le samedi n'avait qu'une majoration de visite
(c'était le seul § 9.cs) ; c'est une règle de cotation, pas de déclaration, et la CRD
qui la remplace figure déjà dans toutes les listes.

### 9.dt /blog : « Voir les N autres articles » sous les 8 cartes (5 octobre 2026)

Retour du fondateur : sur l'onglet « Tous les articles (46) », on ne voyait que la une +
8 cartes, sans moyen d'afficher la suite (l'index en bas de page ne liste que les titres).

- `src/pages/blog/index.astro` : les articles au-delà des 8 premiers sont rendus en cartes
  dans un `<details>` natif, sous un bouton « Voir les N autres articles » (N calculé au
  build). Zéro JS (conforme à l'invariant) ; contenu présent dans le HTML statique ; covers
  en `loading="lazy"`, donc non téléchargées tant que le bloc est fermé (pas d'impact sur
  le LCP). À l'ouverture, le bouton disparaît et la grille continue sous les 8 premières.
- Suivi : `data-ph="blog_index_show_all"` sur le bouton (autocapture PostHog).
- Libellé ajouté : « Voir les N autres articles » (flag § 9). Index par série inchangé.

### 9.du Nouvel article : « Prévoyance : Madelin ou pas Madelin ? », fusionné avec l'article IJ (5 octobre 2026)

Texte du fondateur (fiche du 27 septembre) repris tel quel et mis au format maison :
`src/content/blog/prevoyance-madelin-medecin.md`, **Fiche Fiscalité #15**, cover 4:5
`src/assets/blog/prevoyance-madelin-cover.jpg` (illustration du fondateur). Il absorbe
l'article IJ resté en brouillon (§ 9.dg, PR #110, `ij-prevoyance-imposables-medecin`,
jamais publié) : une seule page sur le sujet, comme prévu le 26 septembre. PR #110 est
fermée sans fusion.

**Vérifié sur source primaire (rapport de vérification du 5 octobre 2026)** : plafond
3,75 % + 7 % PASS limité à 3 % de 8 PASS (3 364 € / 11 534 € avec le PASS 2026 de
48 060 €), commun prévoyance + santé (BOI-BIC-CHG-40-50-40-20 § 90, BOI-BNC-BASE-40-60-50-10
§ 410) ; prestations Madelin imposables, déduction plafonnée « sans incidence », soins
exonérés (BOI-BNC-BASE-40-60-50-30 § 10 et 70) ; imposables en ALD (RM n° 27956, JO AN
1er sept. 2020 ; art. 154 bis A ne vise que la sécurité sociale) ; IJ Madelin hors ALD
soumises à cotisations y compris en micro-BNC, abattement de 26 %, cotisations Madelin
non déduites de l'assiette (guide Urssaf PAMC, notice 2041-DRI PAMC revenus 2025) ;
Madelin retraite fermé au 1er octobre 2020 (ordonnance n° 2019-766, art. 8) ; IJ CPAM
et CARMF 2026 (ameli.fr, carmf.fr) ; exemples chiffrés exacts (1 800 € × 5 ; 30 % →
2 700 € ; 41 % → 3 690 €).

**Écarts par rapport au texte fourni :**

- ⚠️ **Contrat hors Madelin, côté impôt** : le texte disait « en principe exonérées, mais
  sans garantie absolue ». Aucune doctrine ne l'exonère pour un BNC : l'exclusion ne vise
  que les salariés (BOI-RSA-CHAMP-20-30-20 § 230), BOI-BNC-CHAMP-10-10-20-30 § 200 range
  les IJ dans les résultats imposables, et la CAA Nantes (19 mars 2024, n° 23NT02189) a
  refusé d'étendre la règle des salariés à un indépendant. Réécrit : thèse répandue,
  sans texte pour un libéral ; zone la plus floue ; attestation et avis du comptable.
  L'arrêt ne dit rien de la déduction des cotisations : rien ne lui est prêté à ce sujet.
- « Hors Madelin, il arrive net » → « net de cotisations sociales (côté impôt, voir plus
  haut) », par cohérence avec le point précédent.
- CARMF : « à partir du 91ᵉ jour » → « du 91ᵉ jour d'arrêt total » (condition carmf.fr).
- Sources corrigées : remboursements de soins → BOI-BNC-BASE-40-60-50-30 § 70 (et non
  BOI-BIC-CHG-40-50-40-20, qui porte le plafond) ; ALD → art. 154 bis A ; fermeture du
  Madelin retraite → ordonnance 2019-766. Liens ajoutés. Date de mise à jour au 5 octobre.

**Ajouté (flag § 9)** : bloc « L'essentiel » ; FAQ (7 questions, FAQPage JSON-LD) ;
tableau de l'exemple chiffré ; section « Le jour où tu touches des indemnités : où les
déclarer », reprise de l'article IJ déjà vérifié (§ 9.dg : CPAM micro/réel, DSDX, ligne
DB, DSCZ, CARMF en DSCI, ALD), complétée d'une ligne « Madelin en ALD » (imposable, hors
cotisations).

**Maillage entrant** (repris de la PR #110, cible renommée) : phrase + `relatedArticles`
dans `conge-maternite-paternite` et `tout-comprendre-carmf` ; phrase dans
`frais-pros-medecin-liberal-2026` (« déduire ou non ta prévoyance Madelin ne change rien à
l'imposition des IJ »). `updatedDate` inchangés : ajout de maillage.

À signaler, non modifié : la FAQ du guide (`boussoleData.ts`) place les IJ Madelin « en
recettes 5HQ en micro-BNC » comme une certitude, alors que les textes ne le disent pas.

### 9.dv Nouvel article : chèques-vacances du médecin libéral (5 octobre 2026)

Texte du fondateur (mis à jour le 4 octobre) repris tel quel et mis au format maison :
`src/content/blog/cheques-vacances-medecin-liberal.md`, **Fiche Fiscalité #16** (le
comparatif EI/IS/SELARL, toujours en brouillon PR #111, passe en #17). Cover 4:5
`src/assets/blog/cheques-vacances-cover.jpg` (illustration du fondateur). Pas de doublon :
le sujet n'existait qu'en section 7.1 de `frais-pros-medecin-liberal-2026`, cohérente.
Témoignage d'ouverture (« 89 € de frais, 0 € d'économie ») : absent du corpus (seule une
question générique sur l'ANCV y figure), conservé comme message reçu par le fondateur.

**Vérifié sur source primaire** : L411-1, L411-5, L411-9 du code du tourisme (Légifrance) ;
notice 2041-DRI PAMC § 5.6.1 et TI § 6.10 (DSCN « quel que soit votre régime », SMIC du
1er janvier, 1 802 € / 541 € en 2025, CSG-CRDS sur le tout) ; SMIC 2026 (12,02 €/h,
1 823,03 €, revalorisé au 1er juin à 1 867,02 €) ; ANCV : 89 € d'ouverture, 1 % de
commission, coupures, multiples de 10 €, validité « deux ans en plus de l'année
d'émission », échange au 31 mars, dirigeant avec salariés, 115 700 enseignes ; tableau
des gains exact (1 823 € × tranche − 89 € − 18 €) ; enseignes contrôlées sur
leguide.ancv.com et les sites des marques. Méthode × 1,515 : aucun texte (cohérent ZG-017).

**Écarts par rapport au texte fourni :**

- Air France : « vols en France et vers l'Union européenne » → « appli uniquement »
  (airfrance.fr : Connect seulement, toutes destinations).
- Bip&Go : « appli uniquement » → « appli » (sa fiche leguide affiche encore le papier).
- Disneyland Paris : « pas les boutiques » retiré (aucune source officielle).
- « Refusés : l'essence » → « Non acceptés : le carburant, les plats à emporter » (pas de
  phrase ANCV explicite sur le carburant ; L411-2 limite l'usage aux transports,
  hébergement, repas, loisirs).
- Papier : « ne rend pas la monnaie » → « le commerçant n'est pas obligé de rendre la
  monnaie » (FAQ ANCV).
- Center Parcs : la réservation centrale prend le papier seulement, mais les domaines
  acceptent les deux formats : astuce reformulée.
- Validité : « achetés en 2026 » → « émis en 2026 » (règle ANCV liée à l'émission).
- Ouverture de compte : « profil non salarié » → « en tant que travailleur non salarié »
  (aucun profil de ce nom trouvé). « Intersport Rent » → « Intersport » (référencé ainsi).
- L411-1 : « ce qui inclut les chefs d'entreprise non salariés » → « les chefs d'entreprise »
  (le texte ne dit pas « non salariés »).
- Micro : « Aucune case ne permet » → « Aucune case de la déclaration d'impôt » (la case
  DSCN, sociale, existe au micro ; le texte le disait déjà juste après).

**Ajouté (flag § 9)** : « L'essentiel » ; FAQ (7 questions) ; mention « commande maximale
1 820 € » (multiples de 10 €, § 9.dc) et note sous le tableau ; renvoi vers les frais pros
2026. Maillage entrant : une phrase en fin de section 7.1 de `frais-pros-medecin-liberal-2026`,
et ajout à ses `relatedArticles` (`updatedDate` inchangé).

### 9.dw Retrait de l'offre « Jeune Médecin » de l'accueil (17 octobre 2026)

Décision du fondateur : l'offre « Jeune Médecin » (19 €/mois au lieu de 29 €, fin
d'internat < 6 mois, 12 mois après validation, code promo par e-mail) est **retirée** de
la section tarifs de l'accueil (`src/components/home/PricingSection.astro`). Seule
l'offre « Interne » (10 €/mois) reste ; l'encart passe en une colonne
(`max-w-md`) et le libellé « Offres spéciales » devient « Offre spéciale ».

- Aucune autre page ne la mentionnait : `/tarifs`, FAQ (`/faq`, `faqAccueil.ts`),
  JSON-LD `SOFTWARE_APPLICATION_SCHEMA` (`site.ts`), `llms.txt`, CGU ne citent que les
  formules mensuelle (29 €) et annuelle (19 €/mois, 228 €/an), inchangées.
- Le « 19 €/mois » encore affiché partout est le prix de **l'annuel**, pas l'offre retirée.
- PostHog : l'événement autocapture `landing_special_offer_young_doctor` cesse d'être
  émis ; `landing_special_offer_intern` est conservé tel quel.
- Hors dépôt (non traité ici) : codes promo Jeune Médecin déjà distribués / coupons
  Stripe côté app, réponses-types du support à contact@hippodoc.fr.

**FAQ `/faq` « Il y a des tarifs pour les internes ? » réécrite (flag § 9)** : elle ne
parlait que d'un « essai prolongé grâce à des codes promo dédiés » et taisait le tarif
promis sur l'accueil. Confirmé par le fondateur le 17/10/2026 : 10 €/mois au lieu de
29 € pendant tout l'internat, sur justificatif, code promo par e-mail ; l'essai prolongé
existe aussi, via les syndicats d'internes partenaires. La réponse reprend les
justificatifs et le délai de 24 h de l'encart de l'accueil (FAQPage JSON-LD = texte visible).
La phrase « Hippodoc est pensé pour accompagner les médecins dès le début de leur
activité, sans pré-requis comptable » est retirée de cette réponse.

### 9.dx Maternité : nouveau texte FUSIONNÉ dans `conge-maternite-paternite` (18 octobre 2026)

Le fondateur a fourni « Remplaçante enceinte : tes droits et tes chiffres 2026 » (mis à jour
le 18 octobre) avec son illustration. **Pas de nouvelle URL** : le sujet avait sa page
(`conge-maternite-paternite`, février 2026), comme pour la requalification (§ 9.ay). Le
nouveau texte, bien plus complet, remplace le corps de l'article ; `updatedDate` au
18 octobre 2026 (répercutée dans `blog-meta.json`). Titre : « Congé maternité remplaçante :
droits et chiffres 2026 » (mot-clé d'abord, < 60 car.). Nouvelle cover 4:5
`src/assets/blog/remplacante-enceinte-cover.jpg` (l'ancienne png n'est plus utilisée).

**Gardé de l'ancien article** (vérifié sur ameli le 18 octobre) : report de trois semaines du
prénatal vers le postnatal, prématurité, bébé hospitalisé, versement total de l'allocation
si accouchement avant la fin du 7e mois, « zéro garde, zéro téléconsultation », le lien vers
la case DSDX du guide, les FAQ (réécrites, 8 au total). Abandonnés : l'aide conventionnelle
paternité (2 232 €, sans objet pour les remplaçants) et le congé paternité supplémentaire en
cas d'hospitalisation du bébé (non repris dans le nouveau texte).

**Vérifié sur source primaire (rapport du 18 octobre 2026)** : allocation 4 005 € et son
versement ; IJ plafonnées à 65,84 € (1/730 PASS, D. 623-2 via D. 646-1) ; seuil de 4 582 €
et réduction à 10 % (D. 623-3) ; six mois d'affiliation et périodes antérieures (ameli) ;
durées ; D. 623-4 (30 jours, 2 × 15, 15 en postnatal) ; micro-BNC : IJ maternité « ne doivent
pas être incluses dans 5HQ ou 5IQ, car elles ne sont pas imposables » (guide Urssaf PAMC et
guide TI) ; réel : BOI-BNC-BASE-20-20 § 460-470 ; DSDX préremplie, allocation comprise
(notice 2041-DRI PAMC) ; CSN (LFSS 2026 art. 99, décret 2026-426, 43 € / 36,85 € / 6,14 €,
délais, téléservice, divergence service-public/ameli) ; paternité (25/32 jours, 65,84 €) ;
convention 2024 art. 10-4 (citation exacte) et art. 97-98 (3 100 €, 75 %/50 %, 2 066 €) ;
contrat de début d'exercice art. 3.2.2 et 4 ; saisine ReAGJIR du 20 décembre 2024 ; CARMF
(dépliant octobre 2026 : 90 jours, 2 points, 6 mois → 4 points, certificat avant le 31 mars,
100 points, 582, cotisant@carmf.fr ; 11,80 % et 168 210 €) ; arrêt maladie CPAM/CARMF ;
MACSF 700 € ; CAF (198,16 €, plafonds 37 118 / 49 054 €, revenus N-2). Calculs exacts :
11 379 €, 3 687 €, 7 374 €, 1 646 €, 2 395 €, 9 300 €, 1 770 / 2 950 / 4 720 €, tableau du trou.

**Écarts par rapport au texte fourni :**

- IJ « calculées sur les revenus » : formulation d'ameli conservée, mais précisée — le texte
  fixe le montant à 65,84 € au-dessus du seuil (D. 623-2), d'où « forfaitaires ».
- Seuil des 10 % : « comme pour les travailleuses indépendantes » retiré (non vérifié) ;
  « applicable par renvoi » → « par un renvoi indirect » ; 400,50 € et 6,58 € présentés
  comme des calculs.
- Six mois : « article R. 313-3, auquel renvoie L. 646-4 » retiré (chaîne non vérifiée : le
  décret 2023-790 vise R. 313-3 et D. 623-8) → « ramenée de dix à six mois pour les
  non-salariés en 2023, et ameli l'applique aux praticiennes conventionnées ».
- Pluriactivité : L. 171-2-1 ne porte que sur l'affiliation et la cotisation ; le versement
  par chaque régime est attribué aux réponses des conseillers de l'Assurance maladie.
- Fiscalité : CSG-CRDS « 6,7 % » rattachée aux seules IJ ; au réel, « recettes imposables
  (§ 460 et 470), à inscrire en gains divers » ; cotisations : « Urssaf et CARMF » →
  cotisations (CARMF non vérifiée).
- CSN : ajout de l'exception de cumul avec le CMG pour les enfants nés au 1er semestre 2026.
- Paternité : « la CARMF ne verse rien et n'exonère rien » → « ne prend pas en charge le congé
  de paternité » (seule la première moitié est écrite par la CARMF) ; « bruts » retiré.
- ASM : « bruts » retiré (la convention ne le dit pas).
- Contrat de début d'exercice : « depuis 2024 » retiré (conditions déjà dans le texte de
  2021) ; « 80 % de leurs remplacements » → « 80 % de leur activité » ; le non-cumul attribué
  aux ARS Centre-Val de Loire et Auvergne-Rhône-Alpes est faux pour CVL (il vise l'aide
  maladie) et non vérifié pour ARA → reformulé en point à vérifier auprès de l'ARS.
- ReAGJIR : « Aucune décision n'est publiée » → « Aucune décision publiée n'a été trouvée ».
- CARMF : « statuts du régime complémentaire, article 10 » → décret n° 49-579, art. 4 (version
  du 1er juillet 2026 ; les statuts ont été remplacés par un règlement) ; « 77,14 € le point »
  → « environ 77 € » (valeur non trouvée telle quelle sur carmf.fr).
- Urssaf : libellé « rubrique Cotisations et paiements, puis Revenus, « réévaluer les
  cotisations » » non retrouvé → « déclarer un revenu estimé, depuis ton espace » ; eCARMF
  sur revenu estimé non vérifié → « demande si un recalcul est possible ».
- Prévoyance : GPM « Sérénité revenus » et la condition des quatre mois avant la conception,
  introuvables → « des allocations maternité soumises à un délai de carence spécifique ou à
  plusieurs années d'ancienneté chez d'autres ».
- Section 7 : « prestations brutes (après CSG et CRDS…) » → « (avant cotisations et impôt) » :
  les 11 379 € sont des montants avant CSG-CRDS.
- CAF : 99,09 € → 99,08 € ; sources : 1 093,08 € → 1 093,11 €.

**Ajouté (flag § 9)** : bloc « L'essentiel » ; FAQ (8) ; tableau du « vrai trou » ; liens
(case DSDX, effet ciseaux, Madelin) ; Tips Hippodoc (texte de fin du fondateur).

### 9.dy /blog : l'article maternité passe « À la une » (18 octobre 2026)

Demande du fondateur. `featured: true` dans le frontmatter de `conge-maternite-paternite`
(mécanisme existant de `src/pages/blog/index.astro` : la une est le premier article
`featured`, à défaut le plus récent). ⚠️ Tant que ce drapeau reste en place, un nouvel
article ne passe plus automatiquement à la une : le retirer (ou le déplacer) à la prochaine
publication.

### 9.dz /guide-declarations : encart HippoFisc retiré (1er novembre 2026)

Décision du fondateur du 01/11/2026 : HippoFisc (l'assistant fiscal de l'app) est masqué
dans l'app, donc le site ne le présente plus. L'encart « Une question fiscale précise ? »
(badge « Premium », lien vers `app.hippodoc.fr`), placé entre le CTA premium et « Pour
aller plus loin, sur le blog » en zone 4 de `/guide-declarations`, est **retiré** : import
et balise ôtés de `src/pages/guide-declarations/index.astro`, composant
`src/components/guide/AssistantBridgeCta.astro` supprimé (il n'était importé nulle part
ailleurs).

- **Aucun autre texte changé** : le CTA premium, la calculette, la boussole et le reste de
  la page sont intacts ; aucune route touchée (URL inchangée).
- C'était la seule mention de HippoFisc sur le site (recherche « HippoFisc », « assistant
  fiscal », « ressources/assistant-fiscal » dans `src/`, `public/` et ce fichier).
- Espacement : le CTA premium (`py-12 md:py-16`) est désormais suivi directement du bloc
  blog (`mt-12`), le même enchaînement que « Questions » → « Glossaire » plus haut.
- PostHog : l'encart ne portait ni `data-ph` ni `data-track-*` ; aucun événement nommé ne
  disparaît.

### 9.ea Jetons de connexion Supabase arrivés sur www : renvoi vers l'app et caviardage (4 novembre 2026)

Lot sécurité S6. Le Site URL du projet Supabase est `https://www.hippodoc.fr` : quand un
lien d'e-mail (confirmation d'inscription, connexion, réinitialisation du mot de passe)
n'a pas de destination autorisée, Supabase renvoie le médecin sur **le site**, avec ses
jetons dans le **fragment** de l'adresse (`#access_token=…&refresh_token=…`). Le site
n'en fait rien : le parcours de connexion s'arrête, et l'adresse complète pouvait partir
dans la mesure d'audience (`$current_url` de PostHog), car le caviardage de juillet 2026
ne regardait que la requête (`?…`), jamais le fragment.

- **Script inline en tête de `<head>`** (`src/layouts/BaseLayout.astro`, juste après
  `<meta charset>`, donc avant tout autre script, sur toutes les pages, 404 comprise) :
  si le fragment contient `access_token=`, `refresh_token=` ou `error_code=`, il l'efface
  de l'adresse (`history.replaceState`), puis `location.replace('https://app.hippodoc.fr/auth'
  + fragment)` : le parcours continue sur l'app (qui sait déjà traiter ces fragments sur
  `/auth`, dont le passage vers `/auth/update-password` pour une réinitialisation).
  Destination **fixe** ; seul le fragment est transmis, jamais la requête (pas de
  redirection ouverte). `replace` : l'adresse portant le jeton ne reste pas dans
  l'historique (le bouton retour ramène à la page d'avant). Les ancres ordinaires
  (`#resultats`…) ne sont pas touchées.
- **Caviardage du fragment** : `scrub()` de `ThirdPartyScripts.astro` (GA4) traite
  désormais requête ET fragment ; nouveau module `src/lib/caviardage-url.ts`
  (`caviarderUrl`, `caviarderEvenement`, même liste de clés) branché en `before_send` de
  PostHog : `$current_url`, `$referrer`, `$initial_*`, y compris dans `$set`/`$set_once`.
  Filet seulement : le script de tête part avant que la mesure ne lise l'adresse.
- **Vérifié** : build (70 pages) + `verify-site.mjs` verts ; essai navigateur sur le build
  local : `/#error=…&error_code=…` → `https://app.hippodoc.fr/auth#…`, retour arrière →
  page précédente ; `/simulateur#resultats` inchangé ; caviardage testé sur jetons en
  fragment, `code` en requête, URL illisible (tronquée avant `?`/`#`). Aucun vrai jeton
  utilisé (l'essai par `error_code` ne déclenche aucun appel à Supabase).
- **Aucun texte, aucune route, aucun événement nommé changé.** Coût : ~300 octets inline.
- **Suite (hors de ce dépôt)** : compter, sans contenu, les événements PostHog passés
  portant un jeton dans `$current_url` ; s'il y en a, purge et déconnexion des comptes
  concernés (fondateur). Changer le Site URL Supabase vers l'app : seulement après avoir
  relevé les modèles d'e-mail.

### 9.eb DA 2026 : nouvelle page d'accueil (10 novembre 2026)

Nouvelle direction artistique, « le monde d'Hippodoc » : un ciel du matin, une eau en
pâte à modeler, tout en rond, le jaune réservé à « ce qu'il te reste ». Elle s'applique
à **l'accueil seule**. Les autres pages gardent Tailwind, `Header.astro` et
`Footer.astro` jusqu'à la phase 5a (en-tête, pied et police sur tout le site, dans les
sept jours qui suivent la mise en ligne).

Travail fait sur une branche longue, en quatre phases (fondations, premier écran,
sections, bascule), relues à chaque étape. Cette entrée décrit l'état final ; le détail
des étapes est dans l'historique git (commits « DA 2026 »).

**Ce qui change, page par page**

- `/` : toute la page (habillage, structure, textes, H1). `title`, description et
  données structurées : voir « Ce qui ne change pas ».
- `/faq` : deux réponses (essai des syndicats, tarif interne). `/tarifs` : une réponse
  (essai et carte bancaire) et une ligne de la liste « Inclus dans toutes les offres »
  (hébergement). `/guide-declarations` : la ligne fine sous les boutons du bloc d'appel
  (hébergement). Textes plus bas.
- Les 66 autres pages : aucun texte, aucune balise. Leur HTML diffère de `main` par
  deux noms de fichiers à empreinte, la feuille de style globale (plus légère, voir
  « Nettoyage ») et le script PostHog (le tableau `SECTIONS` a trois lignes de plus).
  Rendu identique au pixel, vérifié.

**Ce qui ne change pas (prévu en phase 4c, après la fenêtre d'observation)**

- `title` (« Hippodoc — Cockpit financier des médecins | Super-Net »), description,
  schémas `WebSite`, `SoftwareApplication`, `VideoObject`, image de partage.
- ⚠️ Écart assumé d'ici là : le `title` et la description parlent de « cockpit
  financier » et de médecins « installés, collaborateurs », que la page ne vise plus ;
  le H1 dit « Logiciel de gestion pour médecin remplaçant ». Google peut réécrire le
  titre affiché. À surveiller dans la Search Console.
- Le schéma `FAQPage` suit le texte visible, comme avant : 10 questions au lieu de 11,
  deux réponses retouchées (voir « Textes de l'accueil »).

#### Architecture

- **Police** : Google Sans Flex, un seul fichier auto-hébergé,
  `src/assets/fonts/google-sans-flex-latin-wght400-800-rond100.woff2`, **41 936 octets**.
  Source : dépôt `google/fonts`, `ofl/googlesansflex/GoogleSansFlex[ROND,opsz,slnt,wdth,wght].ttf`
  (version 5.000, sha256 `a9ac7707…783a77ba`). **Licence SIL OFL 1.1**, sans nom réservé :
  `OFL.txt` joint, champs de copyright et de licence gardés dans le fichier. Fabriqué
  avec fonttools 4.68 : `varLib.instancer` (wght 400 à 800, `ROND=100`, `opsz=18`,
  `wdth=100`, `slnt=0`), puis `subset` sur la plage « latin » de Google Fonts (228
  caractères). Importé depuis `src/assets` (nom à empreinte), préchargé avec
  `crossorigin` : une seule requête woff2. Avec l'axe `opsz`, il pèserait 116 496 octets.
- **Sans taille optique**, les grands corps sortent 3 à 9 % plus larges que sur la
  maquette. Corrigé par l'interlettrage, calculé sur le corps : titre du premier écran,
  `h2`, classe `.aff` (grands montants), mot de la scène finale. Largeurs à 1 à 3 px de
  la maquette rendue avec sa police.
- **Repli à métriques ajustées** (`Google Sans Flex Fallback`), deux faces : graisses
  400 à 599 sur Arial (`size-adjust` 101,19 %), 600 à 800 sur Arial Bold (102,22 %).
  « Nunito », cité par la maquette, n'est pas repris.
- **`src/styles/da.css`** : `@font-face`, jetons, `.wrap`, `.btn`, `.chip`, `.sig`,
  feuilles `.band`, plis `.qa`, lien `.lien`, en-tête `hd-*`, pied `ft-*`, habillage de
  la bannière cookies et de la bulle de chat. Importée par les composants `da/` et
  `accueil/` seulement.
- **`.da` et `.da-bloc`** : `.da`, posée sur `<body>` (prop `bodyClass` de BaseLayout,
  vide par défaut, seule modification de ce fichier), ne porte que les jetons et le fond
  de page. La typographie, les règles `h2`/`h3`/`strong` et l'anneau de focus sont
  portés par les blocs marqués `.da-bloc`. Raison : posées sur `<body>`, ces règles
  changeaient par héritage tout ce qui n'était pas encore migré. La classe n'a pas été
  remontée sur `<body>` à la fin (rien à y gagner).
- **Composants** : `src/components/accueil/` (`Hero`, `SousLaSurface`,
  `FenetreProduit`, `TroisCases`, `PourQui`, `Fondateur`, `Partenaires`, `Temoignages`,
  `Tarifs`, `Questions`, `Guides`, `SceneFinale`, `Mascotte`, `buste.ts`), styles dans
  le `<style>` scopé de chacun, aucune classe Tailwind. Données : `src/data/demoAccueil.ts`
  (compte de démonstration), `etapesRemplacant.ts`, `parcoursAccueil.ts`, `faqAccueil.ts`.
  `src/lib/typo.ts` : espaces insécables devant la ponctuation haute, à l'affichage.
- **En-tête et pied** : `src/components/da/HeaderDA.astro` et `FooterDA.astro`, copies
  rhabillées de `Header.astro` et `Footer.astro` (pastille flottante, pied « eau
  profonde »). Mêmes liens, mêmes `data-ph`, même tiroir mobile (case
  `#mobile-menu-toggle`, dont dépend la bannière cookies). Bascule menu / tiroir à
  960 px (1 024 auparavant). ⚠️ **Double maintenance jusqu'à la phase 5a** : voir
  « Garde-fous ».
- **Micro-script du tiroir** : identique au caractère près à celui de `Header.astro`,
  mais rendu après le pied par `src/components/da/ScriptTiroirDA.astro`. Dans l'en-tête,
  ce script en ligne faisait peindre la page en deux temps (deux candidats LCP). Toute
  page qui utilise `HeaderDA` doit rendre `ScriptTiroirDA`.
- **Logo en lettres** (décision du propriétaire) : dans la pastille, le tiroir, le pied
  et la scène finale, le mot seul, « Hippo » (`#0059B3`) puis « doc » (`#1A8CFF`), sans
  l'icône au trait. Favicon, image de partage et application inchangés.
- **Images** : toutes par `astro:assets` (AVIF et WebP, plusieurs largeurs), sources
  dans `src/assets/accueil/`. Buste du premier écran préchargé (`imagesrcset`), les
  autres en chargement paresseux. Mascottes : la masculine au premier écran et à la
  scène finale, la féminine ailleurs (décision du propriétaire : alterner). Logos des
  partenaires : copies dans `src/assets/accueil/partenaires/`, rognées au ras du dessin ;
  celui du CRP-IMG est aplati sur blanc (il portait un voile semi-transparent). L'affiche
  du film est une image dans le bouton de lecture (plus d'attribut `poster`, qui
  téléchargeait 60 Ko à l'ouverture) ; `public/hippodoc-presentation-st-poster.jpg`
  reste pour le `thumbnailUrl` du `VideoObject`.
- **Zéro JS ajouté.** Deux scripts en ligne déplacés sans changer d'un caractère (tiroir,
  lecteur du film), un supprimé (compteur animé de « En chiffres »). Onglets, profils,
  plis, pause du décor : radios, cases à cocher, `:has()`, `<details>`.

#### La page, bloc par bloc

| Bloc | `id` | `data-landing-section` | Série PostHog |
|---|---|---|---|
| Premier écran | `hero` | `hero` | continue |
| « Sous la surface » : fenêtre produit, trois cases | `sous-la-surface` | `features` | continue |
| « Pour qui » | `parcours` | `practice-journeys` | continue |
| Fondateur | (aucun) | `founder` | nouvelle |
| Film, sous-bloc du fondateur | `film-presentation` | `presentation-video` | continue |
| Syndicats, partenaires, soutiens | (aucun) | `partners` | continue |
| Témoignages | `testimonials` | `testimonials` | continue |
| Tarifs | `pricing` | `pricing` | continue |
| Questions | `questions` | `faq` | continue |
| Guides | `guides` | `guides` | nouvelle |
| Scène finale | (aucun) | `final-cta` | nouvelle |

Onze blocs mesurés en remplacent dix. Disparaissent : « En chiffres » (`social-proof`), les
12 fonctionnalités, le bandeau du milieu de page (`mid-page-cta`).

- **Premier écran.** Une seule balise H1, deux lignes dessinées, un deux-points dans le
  texte mais pas à l'écran. Coupures de lignes écrites à des seuils fixes (titre,
  accroche, ligne fine) pour qu'elles soient les mêmes avec la police et avec son
  repli. Décor animé (soleil, eau, mascotte, fiches) sous
  `prefers-reduced-motion: no-preference`.
- **Pause du décor** (WCAG 2.2.2), absente de la maquette, validée par le propriétaire
  avec le premier écran : une case à cocher en bas à gauche de la scène, sans JS. Celle
  du premier écran arrête aussi les bulles de « Sous la surface » ; la scène finale a la
  sienne.
- **Bannière cookies**, sur l'accueil seulement (`da.css`), validée de la même façon :
  en bas à gauche à partir de 900 px (centrée, elle tombait sur le visage de la
  mascotte). `ThirdPartyScripts.astro` n'est pas touché.
- **Fenêtre produit** : trois vues en onglets (radios dans un `<fieldset>`), les trois
  toujours dans le HTML. Sans `:has()`, elles s'affichent l'une sous l'autre. Un seul
  jeu de chiffres, fictif, dans `src/data/demoAccueil.ts`, totaux calculés ; **une seule
  mention « Compte de démonstration »** sur la page (décision du propriétaire). L'état
  d'une journée ne tient pas à la seule couleur (coche, horloge, tilde).
- **« Pour qui »** : quatre profils au lieu de cinq (décision du propriétaire :
  remplaçant, interne, vacataire, mixte ; « collaborateur » et « installé » quittent
  l'accueil). Même mécanisme à radios, rhabillé ; les quatre parcours sont dans le HTML.
- **Fondateur et film** : portrait, paragraphe de l'ancienne carte de fin de FAQ, lien
  de rendez-vous, trois chiffres ; puis le lecteur du film, tel quel
  (`<video preload="none">`, mêmes identifiants, script identique à l'octet).
  `PRODUCT_DEFINITION` y figure mot pour mot.
- **Syndicats** : quatre grandes tuiles sous leur propre titre (décision du
  propriétaire : une vraie place). Seuls les partenariats signés : SILR, CRP-IMG, SIOI,
  AIMGL (Limoges), HomeDoc, Doctripper. ⚠️ AIMGL (Lille) et RAOUL (Nancy) sont en
  cours : ne pas les afficher avant signature. Soutiens : Région Île-de-France et
  Bpifrance sur une même plaque (une seule aide, Innov'Up, § 9.dq), La French Care.
- **Témoignages** : quatre des quinze de l'ancienne section, mot pour mot, sans
  étoiles (aucune note recueillie, § 9.dq). Défilement de côté sous 640 px.
- **Tarifs** : trois cartes (annuel, mensuel, interne). L'offre interne s'ouvre dans sa
  carte (`<details>`). « Détail des offres » (un vrai `<table>`, une fois dans le HTML)
  et le bloc RSPM sont des plis sous les cartes.
- **Questions** : 10 questions de `src/data/faqAccueil.ts`, un `<details>` chacune, puis
  la carte de rendez-vous.
- **Guides** : six liens internes, `/simulateur`, `/guide-declarations`, `/guide`,
  `/blog/remplacement-regulier-requalification`,
  `/blog/effet-ciseaux-regularisation-urssaf-medecin`,
  `/blog/obtenir-sa-licence-de-remplacement`. Les articles proposés par la maquette
  étaient déjà liés ailleurs sur la page.
- **Scène finale** : la phrase de l'ancien bandeau, un seul bouton. Pas de lien de
  rendez-vous (§ 9.r : zéro clic en 150 jours sous un bouton principal).
- **Menu** : « Comment ça marche » (`/#sous-la-surface`), « Pour qui », « Tarifs »,
  « Ressources ». « Découvrir » (le film) sort du menu de l'accueil ; il reste sur les
  autres pages jusqu'à la phase 5a, et l'ancre `#film-presentation` existe toujours.

#### Textes de l'accueil

**Nouveaux, mot pour mot**

- Premier écran. H1 : « Logiciel de gestion pour médecin remplaçant », espace,
  deux-points, espace, « Sors la tête de l’eau ». Paragraphe : « URSSAF, CARMF, impôts :
  Hippodoc calcule tout après chaque journée de remplacement, et te montre ce qu’il te
  reste vraiment » (sans point final). Boutons : « Essayer 30 jours gratuitement »,
  « Simuler mon Super-Net ». Ligne fine : « Rien n’est débité pendant l’essai. Créé par
  un médecin remplaçant. Déjà 900+ médecins inscrits. » Texte alternatif : « La mascotte
  Hippodoc, un hippopotame bleu à lunettes en blouse blanche, la tête et les épaules
  hors de l’eau ». Nom du bouton de pause : « Mettre le décor animé en pause ».
- Premier écran, décor masqué aux lecteurs d'écran (chiffres du compte de
  démonstration) : « Appel URSSAF », « Échéance CARMF », « Déclaration 2035 », « DSFU » ;
  « Super-Net », « 59 543 € » ; « Avril 2026 », « lun. 13 · Valérie J. », « 1 955 € »,
  « mer. 15 · Dujardin S. », « 2 625 € », « lun. 20 · Cabinet M. », « ~1 200 € » ;
  « Année 2025 », « Encaissé », « 90 005 € », « URSSAF, CARMF, impôts », « − 30 462 € ».
- Menu : « Comment ça marche ».
- « Sous la surface ». H2 : « Sous la surface, Hippodoc calcule URSSAF, CARMF et
  impôts ». Après « Tu factures. Hippodoc calcule le reste. » : « Voici ce qui tourne en
  dessous pendant que tu soignes. » Fin de la phrase des régimes : « Remplaçant, interne,
  vacataire ou activité mixte. »
- Fenêtre produit. Légende masquée : « Aperçu de l’application ». Onglets, sous 720 px
  puis au-delà : « Super-Net » / « Ce qu’il te reste », « Journées » / « Tes journées »,
  « À recevoir » / « Ce qu’on te doit ». Jauge : « Jauge : 66 % de l’encaissé reste
  au-dessus de la ligne d’eau, 34 % part en URSSAF, CARMF et impôts », « 66 % ». Vue 1 :
  « Année 2025 », « Encaissé », « 90 005 € », « URSSAF », « − 6 386 € », « CARMF »,
  « − 11 752 € », « Impôts », « − 12 324 € », « Super-Net », « 59 543 € », « 66 % de
  l’encaissé, une fois tout payé ». Vue 2 : « Avril 2026 », légende « Payé », « En
  attente », « Planifié », puis « mer. 1 », « Dujardin S. », « 2 250 € » ; « ven. 3 »,
  « Valérie J. », « 1 785 € » ; « lun. 6 », « Valérie J. », « 2 210 € » ; « mar. 7 »,
  « Dujardin S. », « 1 425 € » ; « mer. 8 », « Dujardin S. », « 2 550 € » ; « ven. 10 »,
  « DPC » ; « lun. 13 », « Valérie J. », « 1 955 € » ; « mer. 15 », « Dujardin S. »,
  « 2 625 € » ; « dim. 19 », « Cabinet M. », « 1 500 € » ; « lun. 20 », « Cabinet M. »,
  « ~1 200 € » ; « mer. 22 », « Cabinet M. », « ~1 200 € » ; « jeu. 23 », « au dim. 26 »,
  « WE prolongé » ; après chaque montant, pour les lecteurs d'écran, « , payé », « , en
  attente » ou « , planifié » ; calendrier masqué aux lecteurs d'écran (« lun. » à
  « dim. », du 30 mars au 3 mai). Vue 3 : « À recevoir », « 4 125 € », « 2 paiements en
  attente », puis les journées des 15, 19, 20 et 22 avec « En attente » ou « Planifié ».
  Pied : « Compte de démonstration · Recalculé après chaque journée enregistrée ».
- Trois cases : « 1 », « Ton activité » ; « 2 », « Tes obligations » ; « 3 », « Ce qu’il
  te reste ». Case 1, extrait masqué aux lecteurs d'écran (il répète la vue 2) : « Avril
  2026 » et les journées des 13, 15, 19 et 20. Case 2 : « Année 2025, à mettre de côté », « URSSAF », « 6 386 € »,
  « CARMF », « 11 752 € », « Impôts », « 12 324 € », « En tout », « 30 462 € ». Case 3 :
  « Super-Net 2025 », « 59 543 € », « 90 005 € encaissés, moins les cotisations, moins
  l’impôt ».
- « Pour qui », profil nouveau : « Vacataire », « centre / maison de santé ». Étape 1 :
  « Tes vacations dans le même calendrier » ; « Centre de santé, maison de santé,
  cabinet : autant de lieux que tu veux, chacun avec ses règles de calcul. » ;
  « Récurrences possibles, par exemple tous les mercredis au centre médical. » Étape 2 :
  « Tes honoraires suivis, structure par structure » ; « La structure te verse tes
  honoraires : payés, en attente, planifiés. » ; « PDSA suivie de la même façon. » Les
  quatre autres étapes du vacataire sont celles du remplaçant.
- Fondateur. H2 : « Un médecin remplaçant derrière Hippodoc ». Légende : « Ryan, médecin
  remplaçant ». Texte alternatif : « Ryan Goburdhun, médecin remplaçant et fondateur
  d’Hippodoc ». Sous les chiffres : « journées et lieux au 10 novembre 2026 ».
- Syndicats : « 6 mois d’essai gratuit au lieu de 30 jours, pour les adhérents de ces
  syndicats, grâce à un code fourni par leur syndicat. »
- Tarifs. H2 : « Tarifs : un outil pro, à un prix humain ». Dessous : « 30 jours
  gratuits. Ta carte bancaire est demandée à l’inscription, mais rien n’est débité
  pendant l’essai. » Cartes : « par mois », « 120 € de moins par an que le mensuel »,
  « Interne et docteur junior », « Jusqu’à la fin de l’internat », « Voir l’offre
  interne ». Pli de l'offre : « Internes et docteurs juniors, jusqu’à la fin de
  l’internat ». Mention du bas : « Abonnement 100 % déductible au régime réel. »
  Masqués à l'œil, dans le tableau : « Oui », « Aucune ».
- Questions. H2 : « Questions fréquentes ». Dessous : « Celles qu’on nous pose avant de
  se lancer. »
- Guides. H2 : « Guides et simulateurs pour médecins remplaçants ». Dessous : « Pour
  aller plus loin, en accès libre. » Cartes : « Simulateur Super-Net », « Ton revenu
  après URSSAF, CARMF et impôts » ; « Guide des déclarations », « 2035, 2042-C PRO,
  DSFU : quoi remplir, et où » ; « Guide du remplaçant », « Le PDF 2026-2027 ».

**Repris d'une autre page du site, mot pour mot**

- De `/qui-sommes-nous` : « Aux côtés des internes, partout en France » ; « Ces
  syndicats d'internes ont signé une convention avec Hippodoc pour accompagner leurs
  adhérents dans leurs premiers remplacements. » ; « Et des partenaires pensés pour les
  jeunes médecins » ; « Le logement des internes en médecine » ; « Plateforme de
  remplacements médicaux » ; noms, villes et liens des syndicats ; « Lauréat Innov'Up »,
  « Membre de La French Care ».
- Des trois articles des guides : leur `title` et le début de leur `description`
  (« Remplacer le même médecin chaque semaine peut être requalifié en collaboration. » ;
  « Bonne année, puis appel de cotisations qui double ? » ; « Conditions, pièces du
  dossier, envoi au CDOM »).

**Repris de l'ancienne accueil, mot pour mot** (comparés par script au HTML produit)

- Les 7 étapes du remplaçant, les 6 de l'interne, les 6 du mixte ; l'appel du bloc
  « Pour qui » ; le paragraphe sur Ryan et « Prendre 15 min avec Ryan » ; « Hippodoc en
  90 secondes » et sa phrase ; les libellés des chiffres ; quatre témoignages ; les
  offres, la liste « Inclus dans toutes les offres » (six lignes visibles, neuf dans le
  pli), le tableau, le texte de l'offre interne ; le bloc RSPM ; 10 questions et leurs
  réponses (deux réponses retouchées, voir plus bas) ; « Soutenu par » ; « On soigne
  mieux quand on comprend ce qu’on gagne ».

**Retouchés**

- Chiffres du fondateur : « 19 400 » devient « 24 200 », « 2 379 » devient « 2 714 »
  (voir « Nettoyage et bascule »).
- « Quel que soit ton mode d’exercice, Hippodoc te suit. », « Choisis ton mode
  d’exercice : tu verras exactement ce qu’Hippodoc fait pour toi. », « Ce qu’en disent
  nos utilisateurs », « ce qu’on gagne » : apostrophe typographique.
- « Ton cas n'est pas listé — interne en fin de cursus, exercice mixte, installation en
  cours ? Prends 15 min avec Ryan… » devient « Ton cas n'est pas listé ? Prends 15 min
  avec Ryan, médecin remplaçant : il te dira franchement si Hippodoc t'apporte quelque
  chose. » (coupe, aucun mot ajouté).
- « Sans engagement · Déjà 900+ médecins » devient « Sans engagement ».
- Témoignages : guillemets français autour des citations ; « Dr Anaïs V. » devient
  « Anaïs V. » (elle est interne). Les trois autres attributions sont celles du site
  (« Dr Sofiane B., Médecin (SOS Médecins + cabinet) », « Dr Sarah M., Urgentiste
  (activité mixte) », « Dr Émilien C., Médecin généraliste »). **Rien n'est inventé** :
  ni ville, ni spécialité.
- Textes alternatifs des logos de syndicats : le nom complet seul.
- Tarifs : « Données sécurisées et hébergées en France » devient « Données sécurisées
  et hébergées dans l’Union européenne » (décision du propriétaire, comme les pages
  légales) ; « Génération rapide de contrats » et « Génération rapide de factures avec
  notes » deviennent « Génération rapide de contrats et de factures » ; « Abonnement
  100 % déductible » devient la mention citée plus haut ; « Tous nos prix sont TTC ·
  Sans frais cachés » devient « Tous nos prix sont TTC, sans frais cachés. » ; « Interne »
  et « Encore en formation » deviennent « Interne et docteur junior » et « Jusqu’à la fin
  de l’internat » ; « 10€/mois », « 29€ » barré et « +30j gratuit » deviennent « 10 € par
  mois » et « 30 jours gratuits » ; « Annuel 💎 » et « 📊 Détail des offres » perdent leur
  émoji ; montants et taux écrits avec une espace insécable.
- Pli de l'offre interne : « Vous êtes encore en internat ? … Hippodoc vous accompagne
  avec un tarif adapté. » devient « Tu es encore en internat ? … Hippodoc t'accompagne
  avec un tarif adapté. » ; « Pendant toute la durée de votre internat » devient
  « Internes et docteurs juniors, jusqu’à la fin de l’internat » ; « réponse sous 24h
  avec ton code promo personnalisé ! » devient « on te répond très vite avec ton code
  promo personnalisé ! ».
- Question « Combien coûte Hippodoc ? » : « L'**essai est gratuit pendant 30 jours**,
  sans carte bancaire. » devient « L'**essai est gratuit pendant 30 jours** : ta carte
  bancaire est demandée à l'inscription, mais rien n'est débité pendant l'essai. » ;
  « Des **tarifs réduits** existent pour les internes et les médecins en fin
  d'internat : … » devient « Les **internes et les docteurs juniors** paient **10 € par
  mois** jusqu'à la fin de l'internat : le détail est dans la section tarifs juste
  au-dessus. »
- Question « Je suis interne… » : « Un **tarif réduit** s'applique pendant toute ta
  formation (voir les tarifs). » devient « Internes et docteurs juniors paient **10 € par
  mois** jusqu'à la fin de l'internat (voir les tarifs). »
- Pied de l'accueil : la flèche « → » de trois liens d'articles est dessinée (elle
  n'est pas dans la police) et sort du libellé.

**Retirés de l'accueil**

- Ancien premier écran : « Plus de 900 médecins nous font confiance » ; H1 « Ton
  activité médicale, sous contrôle. » ; « Le cockpit financier des médecins qui calcule
  tout pour toi. » ; « Commencer l'essai gratuit », « Simuler mes revenus gratuitement » ;
  les pastilles « Essai gratuit 30j », « Toutes les fonctionnalités », « Annulable à tout
  moment » ; cinq captures d'écran, leurs étiquettes et textes alternatifs ; le bandeau
  « Soutenu par » à huit logos ; « Votre vrai revenu », « clair · super-net · précis ».
- « En chiffres » : « Pensé pour le terrain. », « Hippodoc accompagne chaque jour des
  médecins dans leur activité. », les tuiles « 623 Documents générés », le nombre
  d'articles et « 100 % Données hébergées en France », le compteur animé.
- « Fonctionnalités » : « Gestion automatisée complète », « Le système nerveux de ton
  organisation. », les 12 fonctionnalités et leurs descriptions, le schéma en orbite.
- Parcours : les profils « Collaborateur » et « Installé » (14 étapes), la mention
  « Bêta », « Parcours · 5 profils », les trois réassurances (« Forum modéré par des
  médecins », « Blog fiscal mis à jour chaque mois », « Support réactif »), « Pensé par
  un médecin, pour tous les médecins — de l'internat à la retraite. ».
- Film : la pastille « Nouveau · Film de présentation ».
- Témoignages : 11 sur 15, « Découvre pourquoi plus de 900 médecins font confiance à
  Hippodoc », les étoiles.
- Partenaires : « Nos partenaires institutionnels », « Hippodoc est soutenu par des
  acteurs de référence de l'innovation et de la santé en France. », « Syndicats
  d'internes & partenaires de l'écosystème médical » et sa phrase, les textes
  alternatifs « … partenaire Hippodoc gestion médicale ».
- Tarifs : « Exercer, c'est bien. Savoir ce que ça te rapporte, c'est mieux. » ; « 30
  jours gratuits • Sans engagement • Résiliable à tout moment » (l'offre annuelle
  engage 12 mois : dans les tarifs, « Sans engagement » n'est plus écrit que sur la
  carte mensuelle ; il reste sous le bouton du bloc « Pour qui », voir « Reste
  ouvert ») ;
  « FLEXIBLE », « POPULAIRE », « Offre spéciale » ; « Économisez 120€/an (-34%) » ;
  « Meilleure offre : 19€/mois au lieu de 29€ (-34%) » ; la version téléphone du
  tableau (doublon).
- Bandeau du milieu de page : « Déjà 900+ médecins nous font confiance », « Des
  centaines de médecins ont retrouvé le pouvoir de décider… », les quatre garanties
  (dont « Données chiffrées : personne n'y a accès, pas même nous. »), l'image de la
  carte Super-Net, « Essai gratuit 30 jours ».
- Questions : « Questions fréquentes sur la gestion médicale », « Tout ce que tu dois
  savoir pour bien gérer ton activité de médecin », les numéros, et la question
  « Comment fonctionne la collaboration libérale sur Hippodoc ? » avec sa réponse
  (décision du propriétaire sur les profils ; elle disait « gère nativement » d'un
  module signalé « Bêta »). Pour la rétablir : remettre l'entrée dans
  `src/data/faqAccueil.ts` (historique git), le schéma suit.
- Toute mention « sans carte bancaire » : elle était fausse (la carte est demandée à
  l'inscription, rien n'est débité pendant l'essai). Cherché sur tout le site : les
  trois occurrences étaient sur l'accueil.
- Pied de l'accueil : « Ils soutiennent Hippodoc » et ses trois logos (ils sont dans le
  bloc des partenaires) ; les liens « LinkedIn », « Facebook », « Instagram » en toutes
  lettres (les trois pastilles rondes y mènent, avec leur `data-ph`).

#### Textes des autres pages

- **`/faq`, « Y a un essai gratuit ? »** (texte et `FAQPage`), ajout en fin de réponse :
  « Tu adhères à un syndicat d'internes partenaire (SILR, CRP-IMG, SIOI, AIMGL
  Limoges) ? Ton essai dure **6 mois**, gratuitement, grâce à un code fourni par ton
  syndicat. »
- **`/faq`, « Il y a des tarifs pour les internes ? »** (texte et `FAQPage`) : « Oui.
  Internes et docteurs juniors paient **10 € par mois au lieu de 29 €** jusqu'à la fin
  de l'internat, sur justificatif (carte d'étudiant, attestation d'inscription ou
  certificat de scolarité). » (auparavant « Oui. Pendant tout ton internat, Hippodoc te
  coûte **10 € par mois au lieu de 29 €**, sur justificatif (…). ») ; « on t'envoie ton
  code promo sous 24 h. » devient « on t'envoie ton code promo très vite. » ; « Certains
  syndicats d'internes partenaires donnent aussi droit à un **essai prolongé**. »
  devient « Les adhérents des syndicats d'internes partenaires (SILR, CRP-IMG, SIOI,
  AIMGL Limoges) ont aussi **6 mois d'essai gratuit** au lieu de 30 jours, grâce à un
  code fourni par leur syndicat. »
- **`/tarifs`, « Comment fonctionne l'essai gratuit de 30 jours ? »** (texte et
  `FAQPage`) : « Tu crées ton compte sur app.hippodoc.fr, tu choisis l'offre mensuelle
  ou annuelle à l'inscription, et tu profites de 30 jours d'essai gratuit avec toutes
  les fonctionnalités. Ta carte bancaire est demandée, mais rien n'est débité pendant
  l'essai. » (auparavant « …et tu profites de 30 jours d'essai gratuit avec toutes les
  fonctionnalités. À la fin de l'essai, tu choisis l'offre mensuelle ou annuelle pour
  continuer. »).
- **`/tarifs`, liste « Inclus dans toutes les offres »** : « Données sécurisées et
  hébergées en France » devient « Données sécurisées et hébergées dans l'Union
  européenne ».
- **`/guide-declarations`, ligne fine du bloc d'appel**
  (`src/components/guide/PremiumCtaSection.astro`) : « 30 jours offerts · Sans
  engagement · Données hébergées en France » devient « 30 jours offerts · Sans
  engagement · Données hébergées dans l'Union européenne ». La date « Mis à jour le »
  de la page n'est pas avancée : ce n'est pas une revue du guide.
- Ces deux lignes appliquent la décision du propriétaire (« Union européenne »
  partout, comme les pages légales, `/faq` et `/qui-sommes-nous`). « hébergées en
  France » n'est plus écrit nulle part : cherché dans `src/`, `public/`, `llms.txt` et
  le PDF du guide ; `verify-site.mjs` échoue s'il revient sur une page.
- Faits confirmés par le propriétaire, à redire tels quels ailleurs : la carte est
  demandée à l'inscription et rien n'est débité pendant l'essai ; internes et docteurs
  juniors paient 10 € par mois jusqu'à la fin de l'internat ; les adhérents de tous les
  syndicats d'internes partenaires ont 6 mois d'essai au lieu de 30 jours, par un code
  que fournit leur syndicat ; les données sont hébergées dans l'Union européenne ;
  908 comptes inscrits au 10 novembre 2026 (« 900+ » est exact).
- ⚠️ **Deux autres faits n'ont qu'une trace écrite**, à faire relire par le
  propriétaire avant la fusion. Ils viennent de ses réponses du 10 novembre 2026
  (nuit), consignées dans le brouillon de cette entrée par le commit « DA 2026,
  phase 3 : offre choisie à l'inscription, pli interne au tutoiement, réponse rapide »
  (`git show` de ce commit sur `MIGRATION.md`), en ces termes : « l'offre se choisit à
  l'inscription » ; « Confirmé aussi : pas de cumul de remises ; tout interne paie 10 €
  par mois, l'adhésion à un syndicat partenaire donne seulement 6 mois d'essai au lieu
  d'un. » Le premier est publié sur `/tarifs` (texte et `FAQPage`), où il remplace
  « À la fin de l'essai, tu choisis l'offre mensuelle ou annuelle pour continuer. » Le
  second répondait à la question posée au lot précédent sur les deux codes (tarif
  interne, essai de 6 mois) : « un adhérent interne cumule-t-il les deux ? » ; il n'est
  écrit nulle part sur le site.
- `/tarifs`, `/essai`, `/qui-sommes-nous`, `/comparatif`, `llms.txt` relus : rien n'y
  contredit ces faits. `/comparatif` dit « Carte requise. », `/faq` dit « On te demande
  ta CB (mais aucun prélèvement avant la fin de l'essai) » : justes, non touchés.

#### Mesure PostHog : ce qui continue, commence, s'arrête

- **Continue** : `hero`, `features`, `practice-journeys`, `presentation-video`,
  `partners`, `testimonials`, `pricing`, `faq` ; `cta_signup_hero`, `cta_simulator`,
  `cta_signup_journey_section`, `cta_signup_pricing` (plan, période, promo),
  `cta_signup_header*` ; `landing_journey_*` pour `remplacant`, `interne`, `mixte` ;
  `landing_video_*` ; `landing_special_offer_intern`,
  `landing_pricing_comparison_toggle` ; `landing_faq_<id>` (10), `landing_faq_all` ;
  `landing_partner_silr`, `_crp_img`, `_sioi`, `_aimgl`, `_doctripper` ;
  `data-calendly="pour_qui"` et `"faq_accueil"` ; tous les `landing_footer_*` et ceux
  de l'en-tête.
- **Commence** : sections `founder`, `guides`, `final-cta` ; `cta_signup_final` ;
  `data-calendly="fondateur"` (à réévaluer à 60 jours) ; profil `vacataire`
  (`landing_journey_profile_vacataire`) ; `landing_apercu_super_net`, `_journees`,
  `_a_recevoir` ; `landing_pricing_rspm_toggle` ; six `landing_guide_*` (`simulateur`,
  `declarations`, `remplacant`, `requalification`, `effet_ciseaux`, `licence`) ;
  `landing_nav_comment_ca_marche` et `landing_mobile_nav_comment_ca_marche` ;
  `landing_partner_homedoc` sur l'accueil.
- **S'arrête** : sections `social-proof` et `mid-page-cta` ; `cta_signup_cta_banner` ;
  `landing_journey_profile_collaborateur` et `_installe` ; `landing_faq_collaboration` ;
  sur l'accueil seulement, `landing_nav_decouvrir` et `landing_mobile_nav_decouvrir`
  (ils continuent sur les autres pages jusqu'à la phase 5a).
- **`SECTIONS`** (`src/lib/landing-analytics.ts`) garde ses onze lignes d'origine, dont
  `social-proof` et `mid-page-cta`, pour que le rang des autres ne glisse pas.
  `founder`, `guides` et `final-cta` s'ajoutent en fin : leur `section_order` (12, 13,
  14) dit qu'ils sont arrivés en dernier, pas leur place sur la page.
- ⚠️ **Séries qui continuent mais ne disent plus la même chose** (à annoter) :
  - `features` est maintenant le deuxième bloc : son taux de vue monte d'un coup ;
  - le film est le cinquième bloc (il était le troisième) : `presentation-video` et
    `landing_video_section_viewed` baissent d'un coup ;
  - les partenaires passent avant les témoignages ;
  - un choix de profil fait au clavier est maintenant compté
    (`landing_journey_profile_selected`) ;
  - **autocapture en double** : chaque choix de profil ou d'onglet à la souris envoie
    deux `$autocapture` porteurs du `data-ph` (un `click`, un `change`), contre un sur
    `main`. Un insight qui les compte doit filtrer `$event_type = click`. L'événement
    dédié `landing_journey_profile_selected` reste à un par choix ;
  - la page n'a plus la même longueur (4 % plus courte sur téléphone, 6 % plus longue
    sur tablette) ni les mêmes blocs aux mêmes endroits : `landing_scroll_depth` et le
    taux de vue des blocs du bas ne se comparent pas à l'avant.
- Vérifié dans le navigateur en décodant les envois (voir « Mesures »). L'autocapture
  des `data-ph` (onglets, plis, guides, menu) n'a pas été observée dans le navigateur
  de test : seuls les événements nommés l'ont été.

#### Garde-fous (`scripts/verify-site.mjs`)

- **`SECTIONS_LANDING`** : les onze valeurs du tableau ci-dessus ; chacune doit aussi
  figurer dans `SECTIONS` (le script lit `landing-analytics.ts`).
- **Par bloc** : `cta_signup_hero` et `cta_simulator` dans le premier écran,
  préchargement du buste égal au `srcset` AVIF ; `id="sous-la-surface"`, trois onglets
  dont un coché, trois panneaux, « Compte de démonstration » une seule fois ;
  `id="parcours"`, quatre radios, libellés `data-profile`, panneaux,
  `cta_signup_journey_section`, `data-calendly="pour_qui"` ; `data-calendly="fondateur"` ;
  `id="film-presentation"` et le `<video>` dans `presentation-video` ; `id="pricing"`,
  deux `cta_signup_pricing` avec leurs attributs, `<details>` de l'offre interne,
  « Engagement … 12 mois », « Union européenne » présent et « hébergées en France »
  absent ; autant de `<summary data-ph="landing_faq_…">` que de questions dans
  `FAQPage` ; `landing_faq_all`, `data-calendly="faq_accueil"` ; six liens internes dans
  les guides ; `cta_signup_final` sans lien de rendez-vous.
- **Plancher de mots** : 2 931 (90 % du relevé de fin de phase 3 ; la page en porte
  3 215).
- **Caractères hors police** (ajouté en phase 4a) : le texte dessiné de l'accueil ne
  contient aucun caractère hors de la plage `unicode-range` de `da.css` (flèches
  refusées : la plage en cite deux que la police n'a pas). Le texte masqué à l'œil
  (classe `sr`) est ignoré : c'est là que restent « → » et « ✓ », dessinés en SVG.
- **`lastmod` de l'accueil** (ajouté en phase 4a) : `pages-lastmod.ts` peut recevoir une
  entrée pour « / ». Avant, elle aurait été ignorée (le motif exigeait un caractère
  après le slash) et jamais comparée (le sitemap écrit l'accueil sans slash final).
- **Contrôle « 4 quater bis », en-tête et pied en double** : compare dans l'ordre,
  entre l'accueil et `/tarifs`, chaque lien, bouton ou `<label>` porteur d'un `href`,
  d'un `data-ph`, d'un `data-track` ou de `data-cookie-prefs`, libellé compris, et
  vérifie que le micro-script du tiroir est sur l'accueil après `</main>`, identique à
  celui de `Header.astro`, et absent de `<header>`. Les écarts voulus sont dans
  `ECARTS_ENTETE_PIED_DA` (13 lignes : « Découvrir » et « Comment ça marche », les trois
  flèches du pied, les trois liens de réseaux en toutes lettres). **À retirer en
  phase 5a.**
- **Hébergement, sur tout le site** : aucune page du build ne doit contenir
  « hébergées en France » (contrôle posé dans la boucle des liens internes, qui lit
  chaque fichier HTML de `dist`).
- Le contrôle « 4 decies » (compteurs animés) est retiré : il n'y a plus de compteur.
- Chaque garde a été essayée en cassant le HTML.

#### Écarts assumés par rapport à la maquette validée

- La maquette n'avait ni menu mobile, ni Connexion sur téléphone, ni menu Ressources,
  ni pied complet, ni attribut de mesure : repris de l'existant.
- Elle n'avait ni bloc « Pour qui », ni témoignages, ni bloc de partenaires, et 6
  questions : ces blocs sont dessinés dans son vocabulaire, sans modèle à comparer.
- **Longueur sur téléphone** : 15 797 px à 390 px, contre 11 163 px pour la maquette
  (et 16 494 px pour l'ancienne accueil). Décision du propriétaire : tout le contenu
  reste, les intervalles sont resserrés sur téléphone, rien n'est retiré.
- Anneau de focus en encre ou en blanc : celui de la maquette (`#1A8CFF`) ne fait que
  2,46:1 sur le ciel. Contrastes calculés pour chaque paire de jetons utilisée : tous
  au-dessus de 4,5:1 pour le texte (le plus bas : 4,73:1) et de 3:1 pour le focus.
- Vue « à recevoir » recalculée (celle de la maquette ne se recoupait pas avec les deux
  autres) ; calendrier sur cinq semaines ; fenêtre de hauteur constante.
- Pas de `nowrap` ni de points de suspension sur un texte lu : avec des espacements
  imposés par le visiteur (WCAG 1.4.12), un libellé passe à la ligne.
- Tarifs : offre interne en pli (le bouton de la maquette menait à `/tarifs`, qui n'en
  parle pas) ; une seule phrase sous le titre ; trois colonnes à partir de 1 024 px.
- Scène finale : un bouton au lieu de deux ; à partir de 900 px le mot « Hippodoc » est
  remonté (sur la maquette, la moitié basse des lettres était sous l'eau).
- Sous 360 px : corps et boutons du premier écran un cran en dessous, pour que les deux
  boutons restent au-dessus de la bannière cookies à la première visite.

#### Pièges rencontrés (à ne pas refaire)

- ⚠️ **Tailwind lit tout le fichier `.astro`**, `<style>` et commentaires compris. Le
  mot `backdrop-filter` dans un commentaire, le raccourci `text-wrap` et la courbe
  `ease-in-out` dans un `<style>` ont chacun ajouté une règle à la feuille globale :
  nouvelle empreinte, HTML des 70 pages modifié. Écrire `text-wrap-style`,
  `cubic-bezier(0.42, 0, 0.58, 1)`, et vérifier le nom de `BaseLayout.*.css` après
  chaque build. (Les fichiers `.css` ne sont pas lus.)
- ⚠️ **Minification** : `animation` et `animation-timeline: view()` dans la même règle
  sont fusionnés en une déclaration que les navigateurs refusent, sans erreur. La ligne
  de temps s'écrit dans une seconde règle, sous un autre sélecteur.
- ⚠️ **Script en ligne au milieu du flux** : il coupe le premier rendu en deux (voir
  « Micro-script du tiroir »).
- ⚠️ **Typographie posée sur `<body>`** : `:where()` laisse gagner les classes, pas
  l'héritage (voir « `.da` et `.da-bloc` »).
- ⚠️ **Après toute retouche d'un texte ou d'un corps du premier écran**, refaire le
  balayage repli contre police (woff2 bloqué, puis chargé, de 320 à 1 600 px) : une
  ligne de plus à l'arrivée de la police déplace toute la scène.
- ⚠️ **Capture pleine page** : les blocs animés à l'entrée dans l'écran et la scène
  finale (`content-visibility`) y sortent vides. Capturer écran par écran.

#### Nettoyage et bascule (phase 4a)

- **`src/components/home/` supprimé** (11 composants) : plus aucun n'était importé,
  vérifié nom par nom dans `src/` et `scripts/`. `/essai` et `/qui-sommes-nous` n'en
  utilisaient aucun.
- **Feuille globale** : Tailwind ne lit plus ces fichiers. `BaseLayout.*.css` passe de
  183 554 à **158 392 octets** (28,2 → 25,3 Ko gzip), 310 classes en moins. Preuve que
  les autres pages n'y perdent rien : aucune des 310 classes n'apparaît dans un
  attribut `class` du build ni dans un script ; les 69 pages hors accueil ne diffèrent
  du commit précédent que par le nom de la feuille ; rendu comparé au pixel à 390 et
  1 440 px, 139 captures sur 140 identiques au premier passage, la dernière
  (`/comparatif` à 1 440 px, 7 px) identique aux trois rejeux. L'accueil aussi est
  identique au pixel avant et après.
- **21 images supprimées** de `public/lovable-uploads/` (2,0 Mo) : les 19 `hero-*`,
  `super-net-card-salaire.png`, `6ddc3383-….png`. Seuls les composants supprimés les
  citaient. ⚠️ Ces adresses étaient publiques : un lien externe vers l'une d'elles
  renverrait une 404, ce que ce dépôt ne permet pas de vérifier. Commit séparé, qui se
  retire seul. `og-image.png` et l'affiche du film ne sont pas touchés.
- **Chiffres du bloc fondateur, relevés en base le 10 novembre 2026** (accord du
  propriétaire). Même définition qu'au 15 août (§ 9.u) : `count(*)` de `remplacements`
  (**24 252**, écrit « 24 200 », à la centaine inférieure comme « 19 400 ») et de
  `medecins_remplaces` (**2 714**, écrit tel quel comme « 2 379 »), projet Supabase
  « Hippodoc - SAAS FINANCE », lecture seule, aucune donnée personnelle lue. « 900+ » :
  908 comptes, confirmés par le propriétaire.
- **Image de partage : inchangée.** Le plan prévoyait une image propre à l'accueil ;
  la décision du propriétaire sur le logo dit « image de partage inchangée pour
  l'instant ». Essai fait : une capture 1 200 × 630 du premier écran coupe la mascotte
  aux oreilles et garde l'en-tête et la bulle de chat. Une image fidèle demande une
  composition à part, à faire avec le `title` en phase 4c.
- **CLAUDE.md** mis à jour : section « Accueil — DA 2026 », exceptions JS, version
  d'Astro, nombre de pages.

#### Mesures, `main` → branche

- **Build** : 70 pages, `verify-site.mjs` 68 URLs, 0 erreur, 3 avertissements (les
  mêmes que sur `main`), à chaque commit.
- **Accueil, fichiers** : HTML 339,0 → 140,8 Ko (46,4 → 31,0 Ko gzip). CSS bloquant :
  une feuille de 28,2 Ko gzip et 4,7 Ko de styles en ligne → deux feuilles, 25,3 et
  16,4 Ko gzip (**41,7 Ko**, le plan en attendait 33 après nettoyage). Balises
  `<script>` : 11 → 10. Mots dans le HTML brut : 4 134 → 3 215.
- **Autres pages** : feuille globale 28,2 → 25,3 Ko gzip, rien d'autre.
- **Longueur de l'accueil** (après défilement complet) : 18 067 → 17 290 px à 320 px ;
  16 494 → **15 797 px** à 390 px (−4,2 %) ; 13 292 → 14 085 px à 768 px (+6,0 %) ;
  12 717 → 12 635 px à 1 440 px. Aucun défilement horizontal.
- **Lighthouse mobile en local** (12.8.2, pages servies en gzip, 5 passages alternés
  `main` / branche, médianes) :

  | Page | Performance | LCP | TBT | CLS | Poids | Requêtes |
  |---|---|---|---|---|---|---|
  | `/` | 96 → **98** (90 à 97, puis 98 à 99) | 2,72 → 2,26 s | 52 → 27 ms | 0 → 0 | 445 → 223 Ko | 25 → 22 |
  | `/simulateur` | 93 → 92 (90 à 95, puis 87 à 98) | 2,33 → 2,08 s | 264 → 245 ms | 0 → 0 | 309 → 306 Ko | 26 → 26 |
  | `/blog/tout-comprendre-urssaf` | 99 → 99 | 2,04 → 2,03 s | 49 → 35 ms | 0 → 0 | 174 → 172 Ko | 12 → 12 |

  Accessibilité 100, bonnes pratiques 96, SEO 100 sur les trois pages, des deux côtés.
  ⚠️ `/simulateur` est sous les 95 de CLAUDE.md, sur `main` comme sur la branche
  (hydratation de l'îlot) : l'écart d'un point est dans le bruit, la page ne change que
  par le nom de sa feuille. Le FCP simulé oscille entre deux valeurs (1,1 ou 1,5 à
  1,9 s) sur les trois pages et des deux côtés : effet de seuil du modèle, pas du lot.
  Élément LCP de l'accueil : le titre du premier écran.
- **CLS de l'accueil** : 0 quand la police arrive à temps. Police retardée de 2 s :
  0,0003 à 0,0043 selon la taille d'écran (critère du plan : sous 0,02). En arrivant
  sur une ancre avec une police retardée, un bloc peut bouger de 24 à 30 px (0,03 au
  pire, sous 0,1). Mesures des phases 2 et 3, non refaites en phase 4a (le rendu de
  l'accueil y est resté identique au pixel).
- **Événements, sur le build final** (Chromium, 1 440 px, envois décodés, rien n'est
  parti vers PostHog) : chaque section vue une fois avec son rang (`hero` 1, `features`
  4, `practice-journeys` 6, `founder` 12, `presentation-video` 3, `partners` 8,
  `testimonials` 7, `pricing` 9, `faq` 10, `guides` 13, `final-cta` 14, `footer` 11) ;
  `landing_cta_clicked` pour `cta_signup_header`, `cta_signup_hero`, `cta_simulator`,
  `cta_signup_journey_section`, `cta_signup_pricing` (`yearly`, `monthly`),
  `cta_signup_final` ; un `landing_journey_profile_selected` par profil ;
  `calendly_clicked` pour `pour_qui`, `fondateur`, `faq_accueil` ; `landing_video_play`.
  Non rejoués ici : les deux CTA de l'en-tête mobile.
- **Captures regardées** après nettoyage, écran par écran, à 390 et 1 440 px : page
  complète, aucune image manquante, aucune erreur de script.

#### Non testé

- **Safari et Firefox** : aucun des deux moteurs n'était sur la machine. À regarder en
  priorité : `:has()` sur les radios (onglets, profils), la pastille floutée au-dessus
  de l'eau qui bouge (§ 9.dn), les animations liées au défilement (absentes de Firefox :
  l'indice de défilement des témoignages ne s'affiche pas et la mascotte des tarifs
  passe sous l'en-tête, prévu), `content-visibility`, le tableau en grille sous 560 px,
  `box-decoration-break`, `text-wrap-style`.
- **Android** : sans Arial, le repli de police est Roboto, sans ajustement ; les seuils
  de coupure du premier écran n'y garantissent rien tant que la police n'est pas là.
- **Lecteur d'écran réel** (VoiceOver, NVDA, TalkBack) : seul l'arbre d'accessibilité
  de Chromium a été relu. **Vrai téléphone** : aucun.
- Aperçu Vercel : Lighthouse n'y a pas été lancé (mesures locales seulement).

#### À faire le jour de la mise en ligne

1. Pousser la branche, puis attendre l'aperçu Vercel de son dernier commit. Les
   commits de la phase 4a n'étaient pas poussés quand cette entrée a été écrite : un
   aperçu plus ancien ne montre ni les chiffres du 10 novembre ni la feuille allégée.
2. Regarder cet aperçu-là sur Safari (iPhone et Mac), Firefox et un Android.
3. `git fetch origin`, puis comparer et rebaser contre `origin/main`, jamais contre le
   `main` local, qui peut être en retard (le 10 novembre, celui de la machine de
   travail avait trois commits de retard : 92 fichiers d'écart au lieu de 82). Si
   `origin/main` a avancé : rebaser, puis `npm run build` et
   `node scripts/verify-site.mjs` : 0 erreur.
4. Prendre la lettre de cette entrée (la première libre après § 9.ea) et remplacer
   « 9.eb » dans son titre (fait le 10 novembre 2026). Les commentaires du code citent « MIGRATION.md § 9 » sans
   lettre.
5. Dater les pages dont le texte change, dans `src/lib/pages-lastmod.ts`, à la date
   réelle de mise en ligne (note dans le fichier) : « / », et aussi `/faq` et
   `/tarifs`, qui n'avaient pas de `lastmod`. `/guide-declarations` garde sa date de
   revue. Si la mise en ligne n'est pas le 10 novembre, refaire les deux `count(*)` et
   corriger chiffres et date dans `accueil/Fondateur.astro`. Build et contrôle à
   nouveau.
6. Fusionner, puis annoter PostHog le jour même : « nouvelle accueil », avec les
   séries qui s'arrêtent, commencent ou changent de sens (liste plus haut).
7. Relever la Search Console de l'accueil (requêtes, impressions, positions sur 3
   mois) : c'est la référence de la fenêtre d'observation.
8. Sous sept jours : phase 5a (en-tête, pied et police sur tout le site). Puis trois à
   quatre semaines sans toucher `title`, description, H1, texte ni lien interne d'une
   page indexée.

#### Reste ouvert

- **Témoignages** : statut, ville et accord de Sofiane B., Anaïs V., Sarah M. et
  Émilien C. ; « Dr » devant les trois autres à confirmer ; « SOS Médecins » nomme une
  structure tierce.
- **À confirmer par le propriétaire** : « Abonnement 100 % déductible au régime réel. »
  (les trois derniers mots sont ajoutés : en micro-BNC rien ne se déduit) ; les deux
  étapes nouvelles du vacataire ; la liste des six guides (`/comparatif` n'a qu'un lien
  depuis l'accueil, dans le pied) ; le retrait de la question sur la collaboration ;
  les deux faits qui n'ont qu'une trace écrite (« l'offre se choisit à l'inscription »,
  « pas de cumul de remises » : voir « Textes des autres pages »).
- **H1 de l'accueil, à trancher avant la fusion** : il change dès la mise en ligne
  (« Ton activité médicale, sous contrôle. » devient « Logiciel de gestion pour médecin
  remplaçant : Sors la tête de l'eau »), comme le plan le prévoit depuis la phase 2 et
  comme le premier écran a été validé, alors que `title` et description attendent la
  phase 4c. Garder l'ancien H1 jusque-là voudrait dire changer le titre dessiné du
  premier écran.
- **« Sans engagement »** sous le bouton du bloc « Pour qui » (repris de l'ancienne
  accueil) : ce bouton mène à une inscription où l'on choisit aussi l'offre annuelle,
  qui engage 12 mois. Même formule sous des boutons d'essai de `/essai`,
  `/qui-sommes-nous`, `/comparatif`, `/guide-declarations`, de la calculette et des
  articles : non touchée, à faire confirmer ou préciser (« en mensuel »).
- **Phase 4c** : `title`, description, `WebSite.description`, `VideoObject.description`,
  première ligne de `llms.txt`, image de partage de l'accueil.
- **Phase 5a** : `HeaderDA` et `FooterDA` remplacent `Header` et `Footer`, le contrôle
  « 4 quater bis » part. À traiter alors, au clavier : le menu Ressources n'a ni
  `aria-expanded` ni fermeture par Échap, le tiroir ne retient pas le focus (comportement
  hérité de `Header.astro` ; c'est du JS en plus, à inscrire dans l'invariant « zéro JS »).
- **Ailleurs sur le site** : `/tarifs` ne parle ni du tarif interne ni des 6 mois ; le
  PDF du guide (page 25) dit « pendant tout ton internat », sans les docteurs juniors.
  À corriger avant la phase 5a ou après la fenêtre d'observation, pas pendant.
- **Images supprimées** : les 21 adresses de `public/lovable-uploads/` répondent 404.
  Si l'une d'elles sert ailleurs (signature d'e-mail, publication), restaurer ce
  fichier.
- **Compte de démonstration** : un calendrier « Avril 2026 » à côté d'un relevé « Année
  2025 », sur une page mise en ligne en novembre. Vraisemblance fiscale non recoupée
  avec le simulateur.
- **Images** : demander au CRP-IMG un logo propre et plus grand (source de 300 px) ; la
  mascotte de dos ne fait que 431 px de large. Trois fichiers de `src/assets/`
  (`cnom-logo.jpg`, `cnom-logo-adjoint.jpg`, `google-calendar-logo.png`) et quinze de
  `public/lovable-uploads/` n'étaient déjà cités nulle part sur `main` : non touchés.
- **Premier écran** : entre 906 et 1 026 px de large, le titre tient sur une ligne avec
  la police et sur deux avec le repli (la scène bouge si la police arrive tard). La
  bannière cookies, en bas à gauche, recouvre la fiche décorative « Avril 2026 » de
  1 180 à 1 700 px de large jusqu'au choix du visiteur.
- **Film** : quand la lecture démarre, le focus retombe sur `<body>` ; pas de piste
  `<track>` (script et balise non touchés).
- `hippodoc-corpus/`, que CLAUDE.md demande de lire, n'est pas dans le dépôt.

### 9.ec Accueil : cinq retouches le soir de la mise en ligne (10 novembre 2026)

Retouches décidées par le propriétaire quelques heures après la fusion de § 9.eb, donc
pendant la fenêtre d'observation (§ 9.eb, « À faire le jour de la mise en ligne »,
point 8) : du texte et des liens internes de l'accueil changent. `title`, description
et texte du H1 : inchangés. Un commit par retouche. Build et `verify-site.mjs` à
0 erreur à chaque commit, `BaseLayout.DakHsQiB.css` garde son nom.

**1. Premier écran : « l'eau » en bleu** (`accueil/Hero.astro`)

- Le dernier mot du grand titre, apostrophe comprise, passe de l'encre (`--ink`,
  `#14254F`) au bleu de la vague du premier plan (`--w4`, `#2A60C4`, même valeur que
  `--deep`). Texte du H1 inchangé, au caractère près : « Logiciel de gestion pour
  médecin remplaçant : Sors la tête de l'eau ». Pas de jaune (réservé à « ce qu'il te
  reste »).
- Contraste sur le ciel : 4,31:1 en haut (`--sky-1`), 5,04:1 au milieu (`--sky-2`),
  pour un texte de 44 à 116 px en graisse 720 (seuil des grands textes : 3:1).
  `--deep-2` (`#163A88`) ferait 7,71:1 mais ne se distingue presque plus de l'encre :
  non retenu.
- Coupes et interlettrage : le mot est dans un `<span>` qui ne porte que la couleur.
  Balayage de 320 à 1 600 px (651 largeurs, police chargée puis woff2 bloqué) comparé
  à `main` : mêmes lignes, mêmes hauteurs, largeur du titre à 0,02 px près. L'écart
  connu entre 906 et 1 026 px (§ 9.eb, « Reste ouvert ») n'a pas bougé.

**2. Premier écran : ligne fine sous les boutons** (`accueil/Hero.astro`)

- Avant : « Rien n'est débité pendant l'essai. Créé par un médecin remplaçant. Déjà
  900+ médecins inscrits. »
- Après : « Créé par un médecin remplaçant. Déjà 900+ médecins inscrits. »
- La mention de la carte bancaire reste dans les tarifs (« Ta carte bancaire est
  demandée à l'inscription, mais rien n'est débité pendant l'essai. ») et dans la FAQ :
  non touchées.
- Coupes : une seule espace écrite (`.f1`) au lieu de trois. Sous 480 px d'écran, une
  phrase par ligne (deux lignes, à 320 px aussi) ; une ligne à partir de 480 px (700
  auparavant). La ligne entière fait 413 px avec la police et 409 px avec le repli,
  pour 434 px de place à 480 px. Balayage refait de 320 à 1 600 px : la ligne fine
  coupe pareil avec la police et avec le repli à toutes les largeurs ; mot-clé, titre
  et accroche inchangés. La règle d'interligne resserré sous 360 px (faite pour trois
  lignes) est retirée : regardé à 320 × 568 px, la ligne reste à gauche de la bulle
  de chat.

**3. Bloc fondateur : la date du relevé n'est plus affichée** (`accueil/Fondateur.astro`)

- Avant, sous les trois chiffres : « journées et lieux au 10 novembre 2026 ». Après :
  rien (ligne retirée, avec sa règle de style). Les trois chiffres et leurs libellés
  restent : « 900+ Médecins inscrits », « 24 200 Journées enregistrées », « 2 714
  Lieux d'exercice référencés ».
- **Date du relevé, à tenir ici et dans l'en-tête de `Fondateur.astro`** : journées
  (24 252, écrit « 24 200 ») et lieux (2 714) relevés le **10 novembre 2026** par
  `count(*)` (§ 9.eb, § 9.u) ; « 900+ » : 908 comptes confirmés par le propriétaire
  le même jour. La règle ne change pas : à chaque mise à jour, refaire les relevés et
  corriger la date aux deux endroits.
- ⚠️ CLAUDE.md dit encore « datés sur la page » (section « Accueil — DA 2026 »,
  « Chiffres ») : faux depuis cette retouche. Non modifié ici (les consignes du dépôt
  ne se changent que sur demande du propriétaire). Ligne proposée : « datés dans
  l'en-tête de `Fondateur.astro` et dans MIGRATION.md § 9.ec, jamais écrits à la
  main ».

**4. Guides : la CARMF et les impôts des internes entrent, l'effet ciseaux et la licence
sortent** (`accueil/Guides.astro`)

- **Annoncé, puis livré.** La proposition faite au propriétaire le 10 novembre était :
  « [L'effet ciseaux,] je le remplacerais par la CARMF, et la licence par les impôts des
  internes ». Sa réponse : « go », « concernant les pages du 5 je te fais confiance ».
  Un premier commit (`68afac9`) faisait autre chose sans le dire : la CARMF à la place
  de la licence, l'effet ciseaux gardé comme « pari éditorial ». C'était choisir à sa
  place. Le commit suivant remet **la liste annoncée**, décrite ici.
- Ordre : Simulateur Super-Net (`/simulateur`), Guide des déclarations
  (`/guide-declarations`), Guide du remplaçant (`/guide`), « Remplacement régulier : le
  risque de requalification », **« CARMF : cotisations 2026 du médecin remplaçant »**
  (`/blog/tout-comprendre-carmf`), **« Impôts 2026 des internes qui remplacent »**
  (`/blog/guide-impots-internes-remplacants`).
- Sortent (par rapport à § 9.eb) : « Licence de remplacement interne : dossier et
  délais », « Conditions, pièces du dossier, envoi au CDOM »
  (`/blog/obtenir-sa-licence-de-remplacement`) ; « Régularisation URSSAF : l'effet
  ciseaux expliqué », « Bonne année, puis appel de cotisations qui double ? »
  (`/blog/effet-ciseaux-regularisation-urssaf-medecin`). Aucun des deux n'a plus de lien
  depuis l'accueil ; ils en gardent depuis d'autres pages (8 pour la licence, 15 pour
  l'effet ciseaux, comptées dans le build, hors page de l'article).
- Textes ajoutés : le titre de chaque article, tel quel, et le début de sa description,
  comme pour les autres articles du bloc : « Affiliation dès le premier rempla, calcul
  sur ton revenu et non sur ton CA » ; « Interne ayant fait des remplas en 2025 ?
  Salaire CHU + rétrocessions BNC ». Rien d'autre ne change dans le bloc.
- **Pourquoi** : visiteurs sur 90 jours (PostHog, relevé du 10 novembre) : simulateur
  385, requalification 293, guide des déclarations 256, guide 115, CARMF 48, impôts des
  internes 35, licence 28, effet ciseaux moins de 21.
- **Réserve du propriétaire**, à garder en tête : une faible audience peut aussi venir
  d'articles qui n'ont jamais été mis en avant. Elle vaut pour les deux articles qui
  sortent comme pour les deux qui entrent, et 90 jours de visites ne la tranchent pas.
  Ce bloc est la première mise en avant : les clics de `landing_guide_*` diront ce qui
  prend. Garder l'effet ciseaux à la place d'un des deux entrants tient en une ligne de
  `Guides.astro` : à lui de dire.
- **Mesure** : `landing_guide_licence` et `landing_guide_effet_ciseaux` **s'arrêtent**
  (séries ouvertes le jour même par § 9.eb, quelques heures de données) ;
  `landing_guide_carmf` et `landing_guide_impots_internes` **commencent**. Les quatre
  autres continuent, au même rang. À annoter dans PostHog.
- Les deux articles qui entrent étaient déjà liés depuis une réponse de la FAQ de
  l'accueil : deux liens vers chacun sur la page, assumé (l'ancien critère « pas déjà
  lié » cède à l'audience).
  La liste des six guides n'est plus « à confirmer » (§ 9.eb, « Reste ouvert »).

**5. Film : nouveau film vertical, servi par le site** (`accueil/Fondateur.astro`,
`src/pages/index.astro`, `public/`)

- ⚠️ **Périmètre, à confirmer par le propriétaire avant fusion.** Son « go » citait les
  points 1, 2, 3 et 5 de la liste du 10 novembre (l'eau, la ligne fine, la date, les
  guides). Le film en était le point 4 : c'est lui qui l'avait proposé (« mettre la
  vidéo au format 9:16 »), la réponse disait « j'y ajouterais la vidéo […] si tu me
  les envoies », et il a joint le fichier à son « go ». Le remplacement du film repose
  donc sur cet envoi. **N'ont pas été annoncés** : le film servi par le site plutôt que
  par Supabase (7 Mo par lecture complète servis par Vercel) et 7,1 Mo de binaires
  ajoutés à l'historique git.
- **Le film** (fichier du propriétaire, `hippodoc-film-v21-site.mp4`) : 1080 × 1920
  (9:16), 56,6 s, H.264 et AAC, 24,4 Mo. Animation sans prise de vue, sur fond bleu
  nuit, bleu ou blanc : la semaine du remplaçant (« T'enchaînes les remplas toute la
  semaine… et ton week-end ? »), puis le contrat, le planning, la saisie d'une journée,
  ce qu'il reste après URSSAF, CARMF et impôts, la facture de rétrocession, les
  paiements en attente, l'année, la déclaration de revenus, et la fin : « Toi, tu
  soignes. Hippodoc s'occupe du reste. » Le propos est écrit à l'écran, en grands
  titres qui s'affichent mot à mot ; pas de bandeau de sous-titres.
- **Bande son : une voix, sur de la musique.** Transcrite le 11 novembre par un modèle
  automatique lancé sur la machine (Whisper « small », rien n'est envoyé ailleurs),
  puis comparée aux textes relevés sur 71 images du film. **Transcription automatique,
  non écoutée par une personne** : à confirmer à l'oreille par le propriétaire. La
  voix dit presque partout ce qui s'écrit. Trois passages diffèrent : la voix dit
  « Encore en train de bidouiller ton Excel ? » quand l'écran affiche « Samedi :
  Excel. Dimanche : encore Excel. » ; « Maintenant, tes week-ends, t'as officiellement
  mieux à faire. » quand l'écran affiche « Samedi : enfin libre. Dimanche : aussi
  libre. » ; et la fin, « Allez, essaie-le 30 jours gratuits », n'est à l'écran que
  par le bouton « Essai gratuit 30 jours ». Le film se suit sans le son, mais ses
  textes ne sont pas des sous-titres au sens strict : la mention « sous-titré » est
  retirée (voir « Textes » et « Schéma »).
- **Version web** : `public/hippodoc-film-v21.mp4`, **7 057 291 octets**, 720 × 1280,
  H.264 High 3.1 à 30 i/s (890 kb/s), AAC stéréo 96 kb/s, `moov` en tête (lecture
  progressive). Commande : `ffmpeg -i <source> -vf scale=720:1280:flags=lanczos -c:v
  libx264 -preset slow -crf 21 -profile:v high -level 3.1 -pix_fmt yuv420p -c:a aac
  -b:a 96k -ac 2 -movflags +faststart -map_metadata -1`. SSIM 0,9955 contre la source
  ramenée à 720 px ; images comparées côte à côte sur les plans à petit texte (saisie
  de la journée, facture) : pas de différence visible.
- **Hébergement** : le film n'est plus lu chez Supabase mais sur le site (en-tête de
  cache d'un jour dans `vercel.json`, avec l'affiche). L'ancien film
  (`…/public-assets/hippodoc-presentation-st.mp4`, 16:9, 93 s) n'est plus cité par
  l'accueil ; **rien n'est supprimé chez Supabase**. `public/hippodoc-presentation-st-poster.jpg`
  reste en place (adresse déjà publiée dans le schéma), sans plus être cité.
- **Affiche** : le film à 8,5 s (« Hippodoc te rend tes soirées et tes week-ends. »,
  fond bleu), 1080 × 1920, 68 146 octets, en deux copies : `src/assets/accueil/film-affiche.jpg`
  (astro:assets, AVIF et WebP en 320, 640 et 960 px, chargement paresseux) et
  `public/hippodoc-film-v21-poster.jpg` (schéma).
- **Poids ajouté au dépôt** : 7 125 437 octets dans `public/` (film 7 057 291, affiche
  68 146) et 8 111 de plus pour l'affiche de `src/assets/` : **7,1 Mo**, binaires, que
  git ne compresse pas. Un prochain film ajoutera le sien à l'historique.
- **Cadre** : vertical, 9:16, coins de 30 px. Sous 700 px : centré sous le texte,
  300 px de large au plus (533 px de haut). De 700 à 899 px : 240 px, dans la colonne
  du portrait. À partir de 900 px : 320 × 569 px, centré dans la colonne du portrait
  (380 px), le texte du film dans la colonne du texte du fondateur, au même bord
  gauche. Dans le code, le texte reste avant le cadre.
- **Pastille de lecture sur téléphone** (correction du 11 novembre). La pastille jaune
  « 1 min », seul signe que le cadre est un film, était en bas à gauche d'un cadre de
  533 px de haut : sur un écran de 390 × 844 px, titre du film sous l'en-tête, elle
  tombait à 861 px, hors écran (890 px sur un écran de 320 × 568 px), et le haut du
  cadre ressemblait à une image. Sous 700 px, elle est maintenant **en haut du cadre,
  centrée**, dans le bleu vide de l'affiche (20 px sous le bord). CSS seul, le script
  n'est pas touché. Mesuré à 320, 360, 390, 560 et 699 px : la pastille est à l'écran
  dès que 70 px du cadre y sont. À partir de 700 px, rien ne change (le cadre tient
  entier à l'écran, pastille en bas à gauche).
- **Inchangé** : `<video preload="none">`, le bouton de lecture et son script (un mot
  d'un commentaire mis à jour), `id="film-presentation"`,
  `data-landing-section="presentation-video"`, les événements `landing_video_*`. Aucun
  JS ajouté. Vérifié au navigateur : aucune requête mp4 avant le clic, lecture, pause
  et reprise au toucher, `ended` à 56,6 s, aucune erreur de script.
- ⚠️ **Mesure** : `video_id` reste `hippodoc-presentation-st` dans
  `src/lib/landing-analytics.ts` (fichier non touché : son empreinte change le HTML de
  toutes les pages). **`landing_video_play` ne distingue les deux films que par la date** :
  rejoué en interceptant les envois, il part avec `duration_seconds` 0 et
  `percent_watched` 0 (`preload="none"` : la durée n'est pas connue au moment de la
  lecture ; pareil sur `main`). Seuls `landing_video_progress`, `landing_video_pause`
  et `landing_video_completed` portent 57 (93 pour l'ancien film). Les jalons en
  pourcentage ne sont pas comparables d'un film à l'autre. **Annotation PostHog
  obligatoire le jour de la mise en ligne.** Renommer `video_id` ouvrirait une série
  neuve, mais change le HTML des 70 pages : au propriétaire de trancher.
- **Textes** (avant → après) :
  - titre du bloc (`<h3>`) : « Hippodoc en 90 secondes » → « Hippodoc en une minute » ;
  - pastille du bouton : « 90 s » → « 1 min » ;
  - nom du bouton (`aria-label`) : « Lire le film de présentation, 90 secondes » →
    « Lire le film de présentation, une minute » ;
  - `title` du `<video>` : « Hippodoc en 90 secondes — film de présentation
    (sous-titré) » → « Hippodoc en une minute — film de présentation » (« (sous-titré) »
    retiré le 11 novembre : voir « Bande son ». Si le propriétaire, après écoute, tient
    les textes à l'écran pour des sous-titres, la mention se remet telle quelle).
- **Schéma `VideoObject`** : `name` « Hippodoc en 90 secondes » → « Hippodoc en une
  minute » (devenu faux, suit le titre visible) ; `contentUrl` →
  `https://www.hippodoc.fr/hippodoc-film-v21.mp4` ; `thumbnailUrl` →
  `https://www.hippodoc.fr/hippodoc-film-v21-poster.jpg` ; `duration` `PT1M33S` →
  `PT57S` ; `uploadDate` `2026-08-04T09:00:00+02:00` → `2026-11-11T00:00:00+01:00`
  (le jour seul compte ; rien n'était poussé le 10 à minuit, la mise en ligne tombe
  au plus tôt le 11 : **à remettre au jour réel de la fusion** si elle glisse encore) ;
  `width` 720 et `height` 1280 ajoutés. `description` : un seul mot retiré, « Film de
  présentation sous-titré d'Hippodoc : […] » → « Film de présentation d'Hippodoc :
  […] » (voir « Bande son »). Le reste n'est **pas touché** (phase 4c, § 9.eb) : « tu
  factures, Hippodoc calcule le reste » n'est pas une phrase du nouveau film, et
  « installés, collaborateurs ou salariés » n'y figurent pas. Une nouvelle description
  demande une formulation du propriétaire : rien n'est inventé ici.
- **`verify-site.mjs`** : le contrôle « 4 nonies » ne cite plus Supabase, et vérifie en
  plus que `VideoObject.contentUrl` est l'adresse du `<video>` et que `thumbnailUrl`
  est un fichier servi par le site (le contrôle des liens voit déjà le `src`).

**Vérifié** : build de 70 pages et `verify-site.mjs` à 0 erreur après chaque commit ;
`BaseLayout.DakHsQiB.css` inchangée ; captures regardées à 390 et 1 440 px (premier
écran, bloc fondateur avant et après le clic sur lecture, guides), et le cadre du film
à 320, 390, 699, 700, 768 et 1 024 px. Lecture lancée au toucher sur la pastille à 320
et 390 px, à la souris à 1 440 px : aucune requête mp4 avant, le film joue, aucune
erreur de script. Lighthouse local (serveur sans compression) : mêmes notes avant et
après, même poids de page (698 Ko), aucun octet du film au chargement.

**Relecture du 11 novembre** (trois commits de correction) : la liste des guides
remise à celle qui avait été annoncée (point 4) ; la pastille de lecture en haut du
cadre sur téléphone, « (sous-titré) » retiré, date du schéma et description de la
mesure corrigées (point 5).

**Au propriétaire, avant fusion** : confirmer le remplacement du film et son
hébergement par le site (point 5, « Périmètre ») ; écouter le film (« Bande son ») ;
lire le film sur un iPhone réel, dans Safari et dans le navigateur d'Instagram, sur
l'aperçu Vercel ; remettre `uploadDate` au jour de la fusion ; annoter PostHog ; dire
s'il veut la ligne proposée pour CLAUDE.md (point 3).

**Non fait, à savoir** : Safari, Firefox et vrai téléphone non testés (lecture en ligne
du mp4 sur iOS comprise) ; bande son transcrite par un modèle, non écoutée ; CLAUDE.md
non modifié ; `title` et description de la page inchangés.

### 9.ed Phase 5a : en-tête, pied et police de la DA sur tout le site (11 novembre 2026)

Suite de § 9.eb. Les 68 pages intérieures prennent l'en-tête en pastille, le pied « eau
profonde », la police, la bannière cookies et la bulle de chat de l'accueil. Leur contenu
garde ses classes Tailwind et ses couleurs (phases 5b à 5d). Contrôlé sur les 71 HTML du
build, comparés à `main` : hors en-tête et pied, texte, liens, `title`, description,
canonique, H1, JSON-LD, `data-ph` et `data-track` sont identiques, `/tarifs` exceptée
(point 5). L'accueil est identique au pixel près (six captures, 390 et 1 440 px). Aucun JS
ajouté. Build et `verify-site.mjs` à 0 erreur à chaque commit. Trois relectures (outils,
contenu, technique) ont suivi ; ce qu'elles ont fait corriger est signalé « relecture ».

**1. Un seul en-tête, un seul pied**

- `src/components/Header.astro` et `Footer.astro` SONT désormais les composants de la DA
  (ex-`da/HeaderDA.astro`, `da/FooterDA.astro`) ; le dossier `components/da/` disparaît.
  BaseLayout pose `da` sur le `<body>` de toutes les pages (jetons) et importe `da.css` ;
  le fond de page de la DA passe sous `da-fond` (accueil seule).
- Micro-script du tiroir : `src/components/ScriptTiroir.astro`, rendu par `Footer.astro`
  après `</footer>`, une fois par page. Inchangé au caractère près (même empreinte
  SHA-256, espaces réduits, que dans l'ancien `Header.astro` : `10a3011d…`).
- **Ce qui change dans le menu des pages intérieures** : « Découvrir »
  (`/#film-presentation`, `landing_nav_decouvrir`, `landing_mobile_nav_decouvrir`) devient
  « Comment ça marche » (`/#sous-la-surface`, `landing_nav_comment_ca_marche`,
  `landing_mobile_nav_comment_ca_marche`), comme sur l'accueil depuis § 9.eb. **Ces deux
  séries PostHog `…_decouvrir` s'arrêtent** ; l'ancre `#film-presentation` reste sur
  l'accueil. Tous les autres `data-ph` et `data-track` sont repris tels quels.
- **Ce qui change dans le pied des pages intérieures** : les liens en toutes lettres
  « LinkedIn », « Facebook », « Instagram » (sans `data-ph`) ne sont plus répétés (les
  trois pastilles rondes restent, avec leur `data-ph`) ; la flèche « → » des trois liens
  d'articles sort du libellé (dessin) ; logo en lettres, sans l'icône.
  `public/lovable-uploads/hippodoc-logo-96.webp` n'est plus référencé (laissé en place,
  phase 6).
- `verify-site.mjs`, contrôle « 4 quater bis » : la comparaison accueil / `/tarifs` devient
  une garde. Liste figée des `data-ph` et `data-track` de l'en-tête et du pied
  (`MESURE_ENTETE_PIED`, 30 repères) ; chaque page du build a l'en-tête et le pied avec les
  mêmes liens que l'accueil, ou se déclare dans `PAGES_SANS_ENTETE` (`/essai`,
  `/transmissions`) ; micro-script une seule fois, après le pied, à l'empreinte figée.
- Variables `--landing-glass*` de `global.css` retirées (seul l'ancien en-tête les lisait).

**2. Pages intérieures : la pastille sur une bande de ciel**

- Variante `flux` : l'en-tête garde 80 px en haut de la page (72 à 76 px avant), puis la
  pastille reste collée à 10 px du haut. Derrière elle, une bande de ciel de 80 px qui
  s'éteint vers le bas (`.hd-ciel`, élément décoratif rendu avant l'en-tête) : elle part
  avec la page, elle n'est pas collante. Le pied prend des coins ronds en haut.
- **Jonction avec la page (relecture).** La bande s'éteint sur le fond de `<body>`. Quand
  le premier bloc d'une page a son propre fond, ce fond commençait net à 80 px : une ligne
  sur toute la largeur (écart entre les lignes 79 et 80 : 27 niveaux sur `/comparatif`, 22
  sur `/qui-sommes-nous`, 10 sur `/simulateur`, 6 à 7 sur `/faq`, les quatre pages légales
  et la 404). Ces neuf blocs prennent la classe `da-sous-entete` (`da.css`) : le bloc
  remonte sous l'en-tête, rend les 80 px à son contenu et peint lui-même la bande
  par-dessus son fond. Après : plus aucune couture sur les 71 pages ; position du `h1`, du
  pied et hauteur de page identiques à 390, 768 et 1 440 px (seule la 404, plus courte que
  l'écran, perd 80 px de vide). La classe est aussi sur le héros de `/guide-declarations`,
  où elle n'agit que les mois sans bandeau saisonnier (vérifié en retirant le bandeau).
- **Pastille pleine sous 900 px (relecture)** sur les pages intérieures : à 94 % sans
  flou, on lisait au travers le texte des outils et du blog. L'accueil garde 94 %. Autour
  de la pastille (10 px au-dessus, 12 px de chaque côté), le contenu qui défile reste
  visible, y compris au-dessus de la barre de recherche de `/guide-declarations` : c'est
  le principe d'une pastille flottante.
- **`/simulateur` (relecture)** : après un calcul la page défile jusqu'aux résultats, et
  le bouton « Simuler » s'arrêtait exactement derrière la pastille. `scroll-mt-20` sur le
  bloc des résultats : bouton entier de 96 à 144 px, titre à 176 px, à 390, 768 et
  1 440 px.
- Recette (15 pages × 390, 768 et 1 440 px) : aucun `h1` sous la pastille ; ancres du menu
  testées depuis `/blog`, la calculette et une page légale (cible à 84 px, pastille à
  70 px) ; tiroir mobile ouvert et refermé sur `/faq` et `/guide-declarations`.
- `/guide` : le bandeau bleu remontait de 72 / 76 px sous l'ancien en-tête ; il remonte de
  80 px (`-mt-20`, `pt-28`, `md:pt-36`), mêmes distances sous l'en-tête.
- `/guide-declarations` : la barre de recherche collante passe de `top-16` à `top-[70px]`,
  au ras de la pastille. Avant : 8 à 12 px de la barre sous l'en-tête, dont 2 à 6 px du
  champ. Après : 0.
- Calculette : sa barre « Cases 2035 » (`sticky top-16`) ne colle pas, ni avant ni après
  (`<main>` a `overflow-hidden`). Non touché. Sommaire collant des articles (`xl:top-24`) :
  26 px sous la pastille.

**3. Police : Google Sans Flex partout**

- `fontFamily.sans` (`tailwind.config.ts`) : la police, son repli à métriques ajustées,
  puis la liste par défaut de Tailwind. Le woff2 (41 936 octets) est préchargé par
  BaseLayout sur toutes les pages. Les graisses Tailwind (400 à 800) tombent dans la plage
  du fichier ; l'italique est penché par le navigateur (pas de fichier italique).
- **Signes absents du fichier**, dans le contenu des pages (hors en-tête et pied) : → (546
  fois, 59 pages), ≈ (117, 22 pages), ← (49), ≠ (48, 8 pages), ᵉ et ʳ (37), ≥ et ≤ (19),
  ✓ et ✔ (38), ₂, Σ, ↓, et les émojis. Ils sortent dans la police suivante de la pile :
  Arial par la face de repli (Mac, Windows, iOS), sinon la police du système (Android).
  Le plus visible : « Essai gratuit 30 jours → » sur le bouton de `/essai`, flèche plus
  maigre que le texte. La police source n'a **aucune flèche** : impossible de les ajouter
  au fichier ; `unicode-range` déclarait à tort U+2191 et U+2193, retirés. ≈ ≠ ≤ ≥ ₂
  existent dans la source ; fichier non refait (il ne se régénère pas à l'octet près :
  41 880 octets contre 41 936, à contrôler au pixel avant de le remplacer).
- Balayage de 70 pages × 6 largeurs (320 à 1 440 px), simulateur calculé et exemple de
  calculette chargé, comparé à `main` : aucun nouveau défilement horizontal, aucun élément
  hors écran, aucun libellé tronqué en plus ; aucun bouton, onglet, en-tête de tableau ni
  libellé de champ sur une ligne de plus. 281 retours à la ligne en plus, tous dans des
  liens de texte courant et des titres. Rien à corriger du fait de la police.
- **Relecture, trois effets de la police.** (a) Tableaux d'articles (15 articles) : avec
  `tabular-nums`, la police élargit aussi l'espace (4,52 px en 14 px au lieu de 3,16) ;
  `word-spacing: -0.097em` sur `.prose table` (`global.css`) la ramène à sa largeur, les
  chiffres restent alignés. Les 86 milliers de ces tableaux sont saisis avec une espace
  ordinaire. (b) H1 de `/guide-declarations` à 1 440 px : « claires » partait seul à la
  ligne ; `whitespace-nowrap` sur « enfin claires » (tient sur une ligne jusqu'à 320 px).
  (c) Non touché : la colonne de texte des articles (`max-w-[68ch]`) passe de 688 à
  702 px à 1 440 px, le « 0 » de la police étant plus large ; à resserrer en phase 5c.
- **Corrigé au passage (existait avant)** : `/simulateur`, une fois le calcul affiché, un
  halo décoratif faisait défiler la page de côté sur téléphone (425 px pour 390) ;
  `overflow-x-clip` sur `<main>`.

**4. Bannière cookies et bulle de chat** : même habillage que sur l'accueil sur toutes les
pages, `/essai` comprise (règles `.da #cookie-banner`, `.da #crisp-launcher`, inchangées).
Relecture : à partir de 1 280 px la bannière, rangée en bas à gauche, recouvrait quatre
liens du sommaire collant des 19 articles qui en ont un. Tant qu'elle est affichée, le
sommaire s'arrête au-dessus d'elle (`max-height`, règle `:has()` dans `da.css`, sans JS) :
0 recouvrement à 1 280 × 720, 1 440 × 900 et 1 920 × 1 080.

**5. Trois corrections de contenu autorisées par le propriétaire, une quatrième à valider**

- **/tarifs**, nouveau bloc sous les deux offres, mot pour mot. Titre : « Internes et
  docteurs juniors ». Texte : « Tu paies **10 € par mois** jusqu'à la fin de l'internat,
  sur justificatif : écris-nous à contact@hippodoc.fr. » puis « Tu adhères à un syndicat
  d'internes partenaire ? Ton essai gratuit dure **6 mois** au lieu de 30 jours, grâce à un
  code fourni par ton syndicat. » « Sur justificatif » et l'adresse viennent de `/faq`
  (§ 9.eb). Rien sur le cumul (décision 15b, pas encore relue). FAQ de la page, JSON-LD,
  title et description inchangés. `lastmod` de `/tarifs` : 11 novembre 2026.
- **CLAUDE.md** : chiffres du bloc fondateur « datés dans l'en-tête de `Fondateur.astro`
  et dans MIGRATION.md § 9.ec » (ligne proposée en § 9.ec) ; section DA réécrite (un seul
  en-tête, police globale, `da-fond`) ; `hippodoc-corpus/` : « Il n'est pas dans ce
  dépôt ».
- **`src/lib/landing-analytics.ts`** : le commentaire disait le film « servi depuis
  Supabase Storage ». Il dit maintenant qu'il est servi par le site depuis § 9.ec.
  Commentaire seul, script inchangé.
- **À valider : `/tarifs`, deux espaces rendues (relecture).** Un retour à la ligne collé
  à une balise en ligne disparaît au build. La phrase sous le H1 se lisait « sans
  engagement, ou19 € par mois », le bandeau du bas « Consulte la FAQ ouécris-nous ». Les
  deux espaces reviennent ; le texte source n'a pas changé, seules les coupures de ligne
  de `tarifs.astro`. Commit séparé (`/tarifs : deux espaces avalées au rendu`), à retirer
  s'il ne convient pas.

**6. Mesures** (build de `main` avant la phase → cette branche)

- Feuille commune : 158 392 → 174 197 octets (25 361 → 29 633 gzip). Elle s'appelle
  désormais `_astro_assets.*.css` (`BaseLayout.*.css` avant). Feuille de l'accueil :
  94 251 → 74 615 (16 509 → 12 304 gzip).
- Par page, HTML + CSS, gzip : accueil 72 722 → 72 792 octets ; `/simulateur` 52 385 →
  55 561 ; article `frais-pros-medecin-liberal-2026` 59 893 → 62 609. HTML brut des pages
  intérieures : −11,6 Ko chacune. Plus la police à la première visite d'une page
  intérieure : 41 936 octets.
- Lighthouse 13.6 mobile, local, 5 passes alternées, refaites après les corrections de
  la relecture (performance, de la plus basse à la plus haute) : accueil 100 → 100 ;
  `/simulateur` 95 à 99 → 98 à 99 ; article 97 à 99 → 97 à 98. Ni gain ni perte au-delà du
  bruit. Accessibilité 100, SEO 100, bonnes pratiques 96 des deux côtés (le bac à sable
  bloque `t.hippodoc.fr`), CLS 0 partout. LCP : accueil 1,21 → 1,06 s ; `/simulateur`
  0,91 s des deux côtés (une passe de `main` à 1,88 s, aucune sur la branche) ; article
  2,24 à 2,36 s → 2,41 à 2,43 s.
- CLS à l'arrivée de la police (woff2 retardé de 1,5 s, repli Liberation Sans ajusté),
  sept pages intérieures : à 390 px, de 0,000 à 0,055 (`/guide-declarations` 0,055,
  `/simulateur` 0,036, `/tarifs` 0,008, article 0,000) ; à 1 440 px, 0,007 au plus.
  Chargement normal (police préchargée) : 0.

**Reste ouvert**

- Non testé : Safari, Firefox, un vrai téléphone. Sur Android (pas d'Arial), le repli
  n'est pas ajusté : le CLS réel à l'arrivée de la police n'y est pas mesuré, et les signes
  absents du fichier (point 3) y sortent dans la police du système.
- **Phase 5b, `/tarifs` en premier** : deux boutons principaux de styles différents dans
  le même écran (« Essai gratuit 30j » jaune en relief dans la pastille, « Commencer
  l'essai gratuit » bleu plat dans la carte Annuel), plus le bleu nuit de la bannière et de
  la bulle. C'est le seul endroit où le nouvel en-tête et l'ancien corps jurent.
- (corrigé le 11 novembre 2026, § 9.ef) **Boussole de `/guide-declarations`, à 390 px** (existait avant, aggravé de 6 px) : après
  le choix d'un profil, le titre de l'étape arrive à 96 px, sous la barre de recherche
  collante (70 à 115 px ; 64 à 109 avant, titre alors à moitié caché). Aucun défilement
  n'est demandé à ce moment-là (`handleSelectProfil`), c'est l'ancrage du navigateur qui
  place la page. À corriger dans l'îlot (`BoussoleWizard.tsx`), hors phase 5a.
- Vus pendant la recette, existaient avant, non touchés :
  - (corrigé le 11 novembre 2026, à la demande du propriétaire : les lignes sources sont
    recollées, onze espaces rétablies, aucun mot changé ; la onzième est « l'honoraire. Indemnités »
    sur `/guide-declarations/dsfu-pamc`) dix espaces avalées autour d'une balise en ligne, même cause que sur `/tarifs` :
    `/guide-declarations/2042-c-pro` (« auréel », « en5QC », « voirla déclaration »,
    « laDSFU », « auxrégimes zonés »), `/guide-declarations/dsfu-pamc`
    (« tescotisations », « tesrecettes brutes »), `/guide-declarations/medecin-remplacant`
    (« Lesimulateurle calcule », « lapage DSFU ») ;
  - `/simulateur` à 390 px, bloc « Exemple chiffré » : trois montants coupés en fin de
    ligne (« 30 / 000 € », « 19 000 / premiers euros », « 11 / 000 € restants »). Les
    espaces de milliers y sont sécables depuis toujours ; la nouvelle police a déplacé les
    coupures. Les rendre insécables est une modification de contenu ;
  - défilement horizontal sous 360 px sur deux articles (`conge-maternite-paternite`, une
    URL dans un `<code>` ; `frais-pros-medecin-liberal-2026` à 320 px).
- Le jour de la mise en ligne : annoter PostHog (fin des séries `…_nav_decouvrir`, début de
  `landing_nav_comment_ca_marche` sur toutes les pages) et vérifier qu'aucun insight ne
  filtre encore sur `landing_nav_decouvrir` ou `landing_mobile_nav_decouvrir`.

### 9.ee Phase 5b : les pages intérieures dans la DA (11 novembre 2026)

> **Avant fusion (11 novembre 2026), deux retouches sur `/essai` (page noindex, hors période d'observation).** (1) Retiré : la note « 4.9/5 » et ses cinq étoiles, qui n'étaient adossées à aucune source. « +900 médecins nous font confiance » reste. (2) Bannière cookies sur téléphone, cette page seulement : texte et boutons inchangés, boutons côte à côte, 96 px de haut au lieu de 113 ; sur un écran de moins de 780 px de haut, les trois vignettes d'atouts (« Super-Net », « Statistiques », « Planning ») s'effacent tant que la bannière est affichée, puis reviennent. Mesuré : bouton d'inscription entièrement visible au-dessus de la bannière à 390 × 664 et 360 × 740 ; à 320 × 568 il reste sous le premier écran.


Suite de § 9.ed. Période d'observation SEO : sur une page rhabillée, seul l'habillage
change. Un lot par page.

**`/tarifs`**

- **Ce qui ne change pas**, prouvé par script contre le build de `main` : `title`,
  description, canonique, robots, balises sociales, H1, les 10 titres (niveau et texte),
  les 6 liens du `<main>` et les 54 de la page (adresse et libellé, dans l'ordre), les
  3 ancres (`internes-title`, `inclus-title`, `faq-tarifs-title`), les 4 blocs JSON-LD,
  les 32 éléments de la page qui portent un attribut de mesure (dont `cta_signup_tarifs_mensuel`, `_annuel`,
  `_bottom`), les 4 scripts, et le texte du `<main>` : 506 mots, mêmes suites de texte
  entre balises de bloc, espaces comprises. Les 70 autres HTML du build sont identiques,
  au nom de la feuille commune près. Aucun JS ajouté. `lastmod` de `/tarifs` non touché.
- **Habillage** (`src/pages/tarifs.astro`, aucune classe Tailwind) : page entièrement dans
  la DA, comme l'accueil (`bodyClass="da-fond"`, en-tête `flottante`, `theme-color` du
  ciel). Un bloc « ciel » : titre, puis trois fiches en relief dans l'ordre du HTML
  (mensuel, annuel en bleu profond avec le bouton jaune, internes) ; une feuille sable :
  les 17 inclus sur une fiche blanche, en colonnes ; une feuille ciel : les 5 questions en
  plis `.qa` ; une fin : le soleil de l'accueil sur l'eau du pied de page, immobile.
  Mascotte « qui présente » derrière la fiche des internes à partir de 1 024 px : les
  fichiers de l'accueil, hors du flux, et elle plonge derrière la fiche quand l'en-tête
  approche (même mécanique CSS).
- **Dans le HTML, sans toucher au texte** : « ✓ » est dessiné en SVG, le caractère reste
  dans le texte, masqué à l'œil (`sr`) ; des `<span class="num">` gardent sur une ligne un
  prix ou un mot et le « : » ou le « ? » qui le suit ; « 10 € par mois » de la phrase des
  internes est écrit en grand, seul sur sa ligne (même `<strong>`, même phrase) ;
  `role="list"` sur les listes ; une image décorative (`alt=""`).
- **Feuilles** : commune 174 197 → 173 841 octets (trois utilitaires que seule `/tarifs`
  employait disparaissent, rien n'est ajouté ; son nom change, donc le `<link>` de toutes
  les pages) ; feuille de l'accueil inchangée à l'octet ; nouvelle `tarifs.*.css`,
  9 710 octets (2 433 gzip), servie à `/tarifs` seule. HTML de `/tarifs` : 13 975 →
  14 117 octets gzip. Aucune image de plus dans le build.
- **Contrôles** : captures à 320, 390, 768, 1 024 et 1 440 px contre `main` et contre
  l'accueil ; 25 largeurs de 320 à 1 920 px sans défilement horizontal, chaque bouton sur
  une ligne ; contrastes AA (le plus bas : 4,73:1, texte clair de l'offre annuelle) ;
  clavier, plis, tiroir, bannière cookies, contrastes forcés. Lighthouse mobile, quatre
  mesures : performance 96 à 100 (99 à 100 sur `main`, écart de mesure sur le temps de
  blocage), accessibilité 100, SEO 100.
- **Piège relevé** : rendre `accueil/Mascotte.astro` depuis `/tarifs` sortait son `<style>`
  de la feuille de l'accueil (elle changeait de nom, et le HTML de l'accueil gagnait un
  `<style>` en ligne). Le `<picture>` est écrit dans la page, par `getImage`, aux mêmes
  largeurs.
- **À valider** : l'ordre visuel des offres suit le HTML (mensuel, annuel, internes),
  alors que l'accueil montre l'annuel en premier ; l'inverser à l'écran sans toucher au
  HTML séparerait l'ordre de lecture de l'ordre affiché.

**`/faq`**

- **Ce qui ne change pas**, prouvé par script contre le build de `main` : `title`,
  description, canonique, robots, balises sociales, H1, les 11 titres du contenu (un H1,
  un H2 par rubrique ; les questions restent des libellés), les 13 liens du contenu et
  les 61 de la page (adresse et libellé, dans l'ordre), les 10 ancres de rubrique, les
  3 blocs JSON-LD (les 32 questions du `FAQPage`), les 29 éléments porteurs d'un attribut
  de mesure, les 4 scripts, et le texte : 1 625 mots, mêmes suites de texte entre balises
  de bloc. Chaque rubrique reste un `<section id>` qui contient ses `<details>` dans
  l'ordre (`faq_question_opened`). Les autres HTML du build sont identiques, au nom de la
  feuille commune près. Aucun JS ajouté. La page n'avait ni sommaire ni `data-ph`.
- **Habillage** (`src/pages/faq.astro`, aucune classe Tailwind, réponses comprises) : page
  entièrement dans la DA (`bodyClass="da-fond"`, en-tête `flottante`, `theme-color`). Un
  ciel : fil d'Ariane, pastille « FAQ », titre à gauche, mascotte à la tablette debout
  derrière la première feuille (les fichiers de l'accueil, à toutes les largeurs). Puis
  une feuille par rubrique, sable et ciel en alternance : son nom et son dessin à gauche
  (collant sur ordinateur, il suit la lecture d'une longue réponse), ses questions en
  plis `.qa` à droite ; l'un sous l'autre sous 900 px. La fin : la question en grand,
  le bouton jaune vers `/#pricing`, « Nous contacter », et le soleil sur l'eau du pied.
- **Dans le HTML, sans toucher au texte** : un `<main>` (la page n'en avait pas) ; les
  émojis sont dessinés en SVG, ou portés par les pastilles d'état de l'accueil pour les
  quatre couleurs du calendrier, et restent dans le texte, masqués à l'œil (`sr`) ; des
  `<span class="num">` gardent sur une ligne un mot et le « ? », le « : », le « ! » ou
  le « / » qui le suit ; l'adresse de « Comment te contacter ? » est un bouton blanc ;
  une image décorative (`alt=""`).
- **Feuilles** : commune 173 841 → 172 720 octets (13 utilitaires que seule `/faq`
  employait disparaissent, rien n'est ajouté ; son nom change) ; feuilles de l'accueil et
  de `/tarifs` inchangées à l'octet ; nouvelle `faq.*.css`, 9 493 octets (2 391 gzip).
  HTML de `/faq` : 21 688 → 21 367 octets gzip. Aucune image de plus dans le build.
- **Contrôles** : captures à 320, 390, 768 et 1 440 px contre `main`, contre l'accueil et
  contre `/tarifs`, plis fermés et ouverts ; 25 largeurs de 320 à 1 920 px, toutes
  réponses ouvertes : aucun défilement horizontal, aucune ponctuation seule en début de
  ligne, 14 px au moins entre le texte et la mascotte ; contrastes AA (le plus bas :
  4,99:1, « Hippodoc » du titre) ; clavier, ancre `#tarifs`, tiroir, bannière cookies,
  contrastes forcés. Lighthouse mobile, trois mesures : performance 99 à 100 (100 sur
  `main` ; LCP 1,1 s contre 0,9 s, la feuille de la page est une requête de plus),
  accessibilité 100, SEO 100.
- **Longueur** : la page est plus haute, plis fermés (5 373 px contre 4 024 à 1 440 px,
  6 434 contre 5 238 à 390 px) : chaque question est une fiche, chaque rubrique une
  feuille.

**`/qui-sommes-nous`**

- **Ce qui ne change pas**, prouvé par script contre le build de `main` : `title`,
  description, canonique, robots, balises sociales, H1, les 20 titres de la page (niveau
  et texte), les 16 liens du `<main>` et les 64 de la page (adresse et libellé, dans
  l'ordre), les 8 ancres (`histoire`, `equipe`, `ryan-goburdhun`, `thomas-payet`,
  `engagements`, `soutiens`, `internes`, `chiffres`), les 5 blocs JSON-LD, les 40 éléments
  porteurs d'un attribut de mesure (`landing_partner_*`, `landing_about_*`,
  `cta_signup_qui_sommes_nous`, `data-calendly="qui_sommes_nous"`), les 4 scripts, les
  textes alternatifs, et le texte : 713 mots, mêmes suites de texte entre balises de bloc.
  Les autres HTML du build sont identiques, au nom de la feuille commune près. Aucun JS
  ajouté. Les chiffres restent ceux de la page (« 17 000+ » journées, quand l'accueil
  dit « 24 200 »).
- **Habillage** (`src/pages/qui-sommes-nous.astro`, aucune classe Tailwind) : page
  entièrement dans la DA (`bodyClass="da-fond"`, en-tête `flottante`, `theme-color`).
  Huit blocs, dans l'ordre d'avant : un ciel (fil d'Ariane, pastille, titre, le portrait
  penché du bloc fondateur de l'accueil et sa légende sur une étiquette d'encre) ; une
  feuille sable (le récit, titre à gauche ; la citation sur une fiche bleu profond, sous
  les guillemets jaunes des témoignages) ; une feuille ciel (l'équipe, deux fiches) ; une
  feuille sable (les trois promesses, mascotte au pouce levé derrière les fiches) ; l'eau
  profonde de « Sous la surface » (les soutiens, sur des fiches blanches) ; une feuille
  ciel (syndicats et partenaires : les tuiles de `accueil/Partenaires.astro`) ; une feuille
  sable (la définition, les quatre chiffres sur une fiche) ; la fin de `/tarifs` et `/faq`
  (bouton jaune, trois portes de contact, soleil sur l'eau du pied).
- **Dans le HTML, sans toucher au texte** : logos des syndicats, des partenaires et des
  soutiens pris dans `src/assets/accueil/partenaires/` (fonds ramenés au blanc, rognés au
  ras du dessin, AVIF et WebP) aux largeurs de l'accueil, à la place des fichiers de
  `public/lovable-uploads/` ; leurs textes alternatifs restent ceux de la page. Portrait,
  vignettes de l'équipe et photo de The Pitch : mêmes fichiers qu'avant. Dessins au trait
  écrits dans la page (plus de `pages/Icon.astro` ici) ; la flèche du bouton de fin,
  décorative, disparaît ; deux `<span class="num">` ; `role="list"` ; une image
  décorative de plus (la mascotte, `alt=""`).
- **Feuilles** : commune 172 720 → 171 013 octets (les utilitaires que seule cette page
  employait disparaissent, rien n'est ajouté ; son nom change) ; feuilles de l'accueil,
  de `/tarifs` et de `/faq` inchangées à l'octet ; nouvelle `qui-sommes-nous.*.css`,
  20 214 octets (3 890 gzip). HTML : 17 569 → 17 488 octets gzip. Aucune image de plus
  dans le build.
- **Contrôles** : captures à 320, 390, 768, 1 024 et 1 440 px contre `main` et contre
  l'accueil ; 28 largeurs de 320 à 1 920 px sans défilement horizontal ; contrastes AA
  mesurés sur le rendu (le plus bas : 4,96:1, le chapeau des soutiens sur l'eau) ;
  clavier, ancre `#thomas-payet`, contrastes forcés. Lighthouse mobile : performance 98
  (99 sur `main`, LCP 2,3 s des deux côtés), accessibilité 100, SEO 100. Hauteur :
  7 039 px contre 6 259 à 1 440 px, 9 255 contre 9 223 à 390 px.

**`/essai`** (page de campagne, `noindex`, toujours sans l'en-tête ni le pied du site)

- **Ce qui ne change pas**, prouvé par script contre le build de `main` : `title`,
  description, `noindex, nofollow`, balises sociales, H1, les 3 titres, les 12 liens
  (adresse, libellé, `aria-label`, dans l'ordre), le bloc JSON-LD, `cta_signup_essai`,
  les 3 scripts, et les mots de la page dans l'ordre, textes alternatifs compris. Les
  autres HTML du build sont identiques, au nom de la feuille commune près. Aucun JS
  ajouté. Les chiffres restent ceux de la page (« +900 », « 4.9/5 »).
- **Un écart, voulu** : le logo est le mot seul, comme partout depuis la phase 5a. En
  haut de page, « Hippodoc » est donc du texte, là où une image (l'icône au trait)
  portait ce mot en texte alternatif ; en bas, c'est le buste de la mascotte qui porte
  le texte alternatif « Hippodoc », à la place de la seconde icône.
  `src/assets/hippodoc-logo.png` n'est plus employé (fichier laissé en place).
- **Habillage** (`src/pages/essai.astro`, aucune classe Tailwind) : le ciel du premier
  écran de l'accueil (`bodyClass="da-fond"`, `theme-color`) ; titre en grand, « vraiment »
  sur du jaune (le Super-Net) ; trois petites fiches, la preuve sociale en ligne fine,
  la fiche d'inscription et son bouton jaune épais ; puis la scène de l'accueil, immobile
  (soleil, quatre couches d'eau, le buste de la mascotte : les fichiers de l'accueil, par
  `accueil/buste.ts`), et le pied de la page dans l'eau profonde. Une colonne centrée ; à
  partir de 1 024 px, le texte à gauche et la fiche d'inscription à droite, dans l'ordre
  du HTML : le bouton d'inscription est à 464 px du haut à 1 440 px (770 avant), et à
  748 px à 390 px (747 avant).
- **Dans le HTML, sans toucher au texte** : un `<main>` (la page n'en avait pas) ; « 🎁 »
  et « → » dessinés en SVG, le caractère reste dans le texte, masqué à l'œil (`sr`) ; les
  points médians du pied aussi (il en restait un seul en bout de ligne) ; le « $ » du
  dessin Super-Net devient un « € » ; le retour à la ligne du titre est rendu par un bloc
  (derrière un `<br>`, le navigateur n'équilibre pas les lignes).
- **Feuilles** : commune 171 013 → 167 613 octets (rien n'est ajouté ; son nom change) ;
  autres feuilles inchangées à l'octet ; nouvelle `essai.*.css`, 13 368 octets (2 663
  gzip). HTML : 11 367 → 10 897 octets gzip. Une image de moins dans le build.
- **Contrôles** : captures à 320, 390, 768, 1 024 et 1 440 px contre `main` et contre
  le premier écran de l'accueil ; 28 largeurs sans défilement horizontal, boutons sur
  une ligne ; texte grossi à 200 % ; contrastes AA mesurés sur le rendu (le plus bas en
  texte courant : 5,09:1 ; « doc » du logo, 22 px en gras : 3,31:1 pour un seuil de
  3:1, comme dans l'en-tête du site) ; clavier, contrastes forcés. Lighthouse mobile : performance 100,
  accessibilité 100, comme sur `main`.
- **Vu, non traité** (déjà vrai sur `main`) : à la première visite sur téléphone, la
  bannière cookies recouvre le bouton d'inscription ; le lien Instagram a un
  `aria-label` qui ne reprend pas son libellé visible.

**Après les trois relectures (direction artistique, invariance SEO, accessibilité)**

Ce qui suit remplace, là où il diffère, ce qui est écrit plus haut pour chaque page.
Preuve refaite contre le build de `main` sur les quatre pages : texte, titres, liens,
ancres, JSON-LD, attributs de mesure et scripts identiques ; les 73 autres fichiers
texte du build ne diffèrent que par le nom de la feuille commune.

- **Deux écarts dans le HTML, tracés** : le `<head>` des quatre pages gagne
  `<meta name="theme-color" content="#C9DEFF">` (le seul ajout ; il vient avec le fond
  de la DA, l'accueil le portait déjà). Sur `/essai`, le logo du haut n'est plus du
  texte : le mot est dessiné par la feuille de style dans un élément `role="img"` nommé
  « Hippodoc », comme l'image qu'il remplace. Le texte de `/essai` est donc celui
  d'avant au mot près (125 mots), l'écart « voulu » noté plus haut n'existe plus.
- **Scène de fin** (`/tarifs`, `/faq`, `/qui-sommes-nous`) : le halo du soleil était
  peint par-dessus les derniers boutons. Le texte passe devant le décor et le halo
  commence 20 px après le dernier lien, à toutes les largeurs.
- **`/faq`** : quatre feuilles au lieu de dix (sable : activité, revenus, planning ;
  eau profonde : paiements, cotisations, documents ; ciel : mobile, sécurité ; sable :
  tarifs, aide), les rubriques se suivent dans leur feuille. Chaque rubrique reste un
  `<section id>` avec ses `<details>` ; la feuille est un `<div>` sans texte. Mascotte
  au pouce levé à « Besoin d'aide ? » (fichiers de l'accueil). Plis moins hauts sur
  téléphone. Hauteur, plis fermés : 5 725 px à 390 px (6 434 avant, 5 238 sur `main`),
  6 676 px à 320 px (7 229 avant). À 320 px le chapô prend toute la largeur, la
  mascotte se tient dessous. Le nom de rubrique collant existait déjà : le relevé
  inverse venait d'une capture pleine page, où rien ne colle.
- **`/tarifs`** : la mascotte sert aussi sous 1 024 px, à droite du titre « Inclus dans
  toutes les offres », derrière la liste (second `<picture>` décoratif, masqué au-delà).
  Plus de ligne réservée sous le prix (elle trouait l'offre annuelle) ; la note des
  internes suit son texte ; titre des questions collant ; à 320 px le titre finit sur
  « en annuel » (un `<span class="num">` de plus). Grille des offres bornée et prix des
  internes sécable : plus de défilement horizontal avec les espacements de WCAG 1.4.12.
  Contrastes forcés : les coches de l'offre annuelle reprennent la couleur du texte.
- **`/qui-sommes-nous`** : chiffres plus petits sur téléphone et à 1 024 px, fiche non
  rognée (« 17 000+ » était coupé avec les espacements 1.4.12) ; fiches de l'équipe à
  leur hauteur ; légende du portrait contenue dans la photo, sur deux lignes ; portrait
  centré sur téléphone ; lien « Meilisearch » avec une zone de toucher de 38 px (18 avant).
- **`/essai`** : sur téléphone, ce qui précède la fiche d'inscription est resserré. Le
  bouton est à 573–627 px du haut à 390 px de large (694–748 avant) : au-dessus de la
  bannière cookies de première visite sur un écran de 780 px de haut. À 320 px les trois
  atouts sont des pastilles d'une ligne ; coins de 24 px ; les fiches passent l'une sous
  l'autre quand le texte grossit. **À valider** : sur téléphone, la bulle de chat
  n'apparaît qu'après 380 px de défilement (animation CSS liée au défilement, sans
  script ; navigateur sans cette fonction : bulle dès le haut, comme avant). Elle ne
  touche plus ni le bouton ni le texte de la fiche, mais elle est absente du premier
  écran.
- **Titres** : deux jetons dans `da.css`, `--h1-page` (58 px au plus, les quatre pages)
  et `--h2-fin` (52 px au plus : le titre de fin ne dépasse plus le `<h1>`). Mots en
  couleur des `<h1>` : le bleu de « l'eau » de l'accueil (`--w4`, 4,3:1 sur le ciel, grand
  texte).
- **Texte en rem** sur les quatre pages (la DA pose ses corps en px : ils ne suivaient
  plus la taille de police du navigateur). Avec une taille doublée, le texte courant
  double et aucune page ne défile de côté de 320 à 1 280 px. L'accueil, l'en-tête et le
  pied restent en px : à reprendre à part si on le souhaite.
- **Feuilles** : commune 167 613 → 167 711 octets (les deux jetons, rien d'autre) ;
  feuille de l'accueil inchangée à l'octet ; `tarifs` 11 633, `faq` 11 603,
  `qui-sommes-nous` 20 972, `essai` 14 585 octets (2,7 à 4,1 Ko gzip). Cette seconde
  feuille est une requête bloquante de plus par page : laissée en l'état, Lighthouse
  mobile donne performance 98 à 100, accessibilité 100 sur les quatre pages.
- **Non traité** : l'accueil a le même halo par-dessus son bouton de fin (hors du lot) ;
  `/_astro/hippodoc-logo.*.webp` n'est plus produit (une copie en cache de l'ancienne
  `/essai` afficherait un logo cassé).

### 9.ef Boussole de `/guide-declarations` : le titre de l'étape reste sous la barre de recherche (11 novembre 2026)

Suite de § 9.ed, « Reste ouvert ». Aucun texte, titre, lien ni JSON-LD ne change : le
HTML de `/guide-declarations` est identique à celui de `main`, au nom du fichier JS de
l'îlot près ; la feuille de styles commune garde son empreinte.

- **Avant** : trois défilements différents selon le chemin. Choix d'un profil : aucun
  (l'ancrage du navigateur plaçait la page). « Continuer », « Retour », stepper,
  « Recommencer » : `#profils` en haut de l'écran, demandé avant le rendu de la nouvelle
  étape. Checklist : deux défilements en concurrence (`#profils` par `goToStep`, la racine
  de `ChecklistResult` 50 ms après).
- **Après** : un seul défilement, dans un effet de `BoussoleWizard.tsx` sur
  `[currentStep, scrollTick]`, donc après le rendu de la nouvelle étape, quel que soit le
  chemin. Cible : le haut de la carte du parcours (« Étape n / m » sur téléphone, puis le
  titre), placé 12 px sous la barre de recherche, dont le bas est mesuré sur place
  (`top` + hauteur de `[role=search]` : 115 px aujourd'hui ; 80 px si la barre est absente).
  La page ne bouge pas si le haut de la carte est déjà sous la barre et le titre dans les
  deux tiers hauts de l'écran. Le défilement n'impose plus `behavior: 'smooth'` : la règle
  `scroll-behavior` de `global.css` décide, donc pas d'animation sous
  `prefers-reduced-motion`. `ChecklistResult.tsx` ne défile plus au montage (sa classe
  `scroll-mt-32` reste, pour ne pas changer la feuille commune).
- **Mesuré** (Playwright, Chromium, build servi en local, les 12 profils cliqués l'un après
  l'autre, bouton centré à l'écran avant le clic ; barre de 70 à 115 px) :

| Écran | Avant : haut de « Étape n / m » le plus haut | Après |
|---|---|---|
| 390 × 844 | −156 px (titre de −27 à −3 px) ; 5 profils sur 12 sous 115 px | 140 px au moins, titre entre 238 et 547 px |
| 360 × 640 | −376 px ; 10 profils sur 12 sous 115 px | 140 px pour les 12, titre entre 238 et 317 px |
| 1 440 × 900 | page immobile, titre entre 308 et 518 px | identique, page immobile |

- Parcours complet (premier profil, « Voir ma checklist », « Retour », checklist,
  « Recommencer », « Aucun profil », choix d'un régime), à 390 × 844 avec et sans
  `prefers-reduced-motion` et à 1 440 × 900 : « Étape 3 / 3 » à 140 px sur téléphone
  (95 px avant, sous la barre), titre de la checklist à 269 px ; à 1 440 px, titre de la
  checklist à 250 px (224 avant). Aucune erreur de page ni de console.
- **Ce qui change sur grand écran** : « Retour », le stepper et « Recommencer » ne
  ramènent plus `#profils` en haut de l'écran quand l'étape est déjà bien placée ; quand
  ils défilent, c'est la carte qui vient sous la barre (le titre « Trouve ta situation »
  passe au-dessus).
- Non testé : Safari, Firefox, un vrai téléphone (clavier ouvert, barre d'adresse
  rétractable).

### 9.eg /guide-declarations : gras inversé et astérisques dans les textes du guide (11 novembre 2026)

Correction de rendu, dans `src/components/guide/FormattedText.tsx` seulement. Aucun texte
de `src/data/boussoleData.ts` n'est modifié.

- **Le défaut** : dans certains textes, le gras sortait inversé et des `**` restaient dans
  le HTML servi (« Cas particulier RSPM », périmètre de DSCN / chèques ANCV).
- **Trois causes**, toutes dans le composant :
  1. le texte est découpé (émoji marqueur ⚠️ ✅ 💡, fin de phrase, saut de ligne) avant la
     lecture du gras : un `**…**` qui enjambe la découpe (`**⚠️ Cas particulier RSPM**`)
     laissait un `**` seul de chaque côté, et toutes les paires suivantes se décalaient.
     Chaque morceau est maintenant refermé et le suivant rouvert (`equilibrerGras`) ;
  2. une seule expression lisait à la fois le balisage de l'auteur et les termes mis en
     gras d'office : une citation « … » contenant un `**gras**` ou un `*italique*`
     l'avalait avec ses astérisques. `formatInline` travaille en deux passes : balisage
     de l'auteur d'abord, termes ensuite sur le texte nu ;
  3. les bornes de mot (`\w`, `\b`) ignorent les lettres accentuées en JavaScript : un
     terme était reconnu au milieu d'un mot. Bornes en `\p{L}`.
- **Effet sur la page**, mesuré par script contre le build d'avant, balises retirées :
  le texte est identique à 10 astérisques près, tous disparus (87 → 77 ; les 77 restants
  ne passent pas par ce composant, voir plus bas). Hors balises de mise en avant, la seule
  différence de structure est un paragraphe `<p>**</p>` qui disparaît. Aucune autre page
  du build ne change (le fichier JS de l'îlot `BoussoleWizard` change de nom).
- **Gras déplacé** : « Cas particulier RSPM », « aucune régularisation URSSAF ni CARMF »,
  « tranches progressives », « Périmètre exact de DSCN », « uniquement la valeur faciale
  des chèques », « frais d'ouverture du compte ANCV », « frais d'envoi/port »,
  « commission ANCV », « L30 « Autres frais divers de gestion » » sont en gras comme écrit
  dans la source ; le texte entre eux ne l'est plus. La citation du guide UNASA (« Les
  médecins conventionnés du secteur 1… ») sort en italique, sans ses astérisques.
- **Mots coupés** : « TR » dans « TRÈS », « 6 an » dans « 6 années », « 3 an » dans
  « 3 années » ne sont plus en gras ; « Art. 163 quatervicies » (6 fois) garde
  « Art. 163 » en gras, sans « quater ».
- **Non traité ici** : 77 astérisques restent visibles sur la page, dans sept paragraphes
  que d'autres composants rendent tels quels, sans passer par `FormattedText` (six
  positions A et B des zones grises, `FichesPratiquesSection.tsx`, et une définition sur
  les rétrocessions), plus « Cerfa 15945*08 », légitime.
- Vérifié : `verify-site.mjs` à 0 erreur ; dans Chromium, les deux îlots s'hydratent sans
  erreur de console, le wizard va jusqu'à la checklist (57 gras, aucun astérisque).


### 9.eh /guide-declarations : gras des positions A/B et des définitions courtes (11 novembre 2026)

Suite de § 9.eg, correction de rendu. Sept paragraphes affichaient encore des `**` tels
quels, parce que leur texte sortait brut : les positions A et B des zones grises
(`FichesPratiquesSection.tsx`) et la définition courte des termes du glossaire
(`GlossaireSection.tsx`). Ils passent maintenant par `formatInline`. Aucun texte de
`src/data/boussoleData.ts` n'est modifié.

- **Texte de la page**, par script contre le build d'avant, balises retirées : identique à
  76 astérisques près, tous disparus (77 → 1 ; il reste « Cerfa 15945*08 », légitime).
  Structure hors `<strong>` / `<em>` identique. Aucune autre page ni aucun fichier JS ne
  change.
- **Gras d'office** : dans les positions A/B, `formatInline` met aussi en gras les sigles,
  cases et montants, comme partout ailleurs sur la page (« URSSAF », « 5HQ », « 34 % »…),
  y compris dans les positions qui n'avaient pas d'astérisques. Les définitions courtes
  du glossaire, elles, ne rendent que le balisage de l'auteur
  (`formatInline(texte, { auto: false })`) : sans cela, toutes recevaient du gras d'office
  (110 gras de plus). Bilan sur la page : 4 394 → 4 518 `<strong>`.
- `verify-site.mjs` à 0 erreur. Les deux composants sont statiques (hors îlot) ; le
  wizard, qui partage `formatInline`, revérifié dans Chromium (checklist, aucune erreur).

### 9.ei Espaces avalées autour d'une balise en ligne : correction de rendu et contrôle (11 novembre 2026)

Correction de rendu, pas de contenu : aucun mot n'a changé. Au build, Astro supprime un
retour à la ligne collé à une balise en ligne (`<strong>`, `<a>`, `<em>`), avant ou après
elle ; le mot et la balise sortent collés.

- **Onze espaces rétablies** (commit `0f91ecc`), en recollant les lignes sources :
  `/guide-declarations/2042-c-pro` (« au réel », « en 5QC », « voir la déclaration »,
  « la DSFU », « aux régimes zonés »), `/guide-declarations/dsfu-pamc` (« tes
  cotisations », « tes recettes brutes », « l'honoraire. Indemnités »),
  `/guide-declarations/medecin-remplacant` (« Le simulateur le calcule », des deux côtés
  du lien ; « la page DSFU »). Les deux de `/tarifs` l'étaient déjà (§ 9.ed, point 5).
- **`verify-site.mjs`, contrôle « 4 septies bis »** : échoue quand une lettre ou un chiffre
  est collé à l'extérieur d'une balise `<strong>`, `<a>`, `<em>` ou `<b>` dont l'intérieur
  ne commence pas (ou ne finit pas) par une espace, sur toutes les pages du build. Rejoué
  sur les sources d'avant `0f91ecc` : les onze sortent en erreur. Une balise qui coupe un
  mot exprès se déclare dans `MOTS_COUPES_EXPRES`.
- `src/lib/pages-lastmod.ts` non touché : `lastmod` des trois pages inchangé.
- Les mots coupés par un gras de `FormattedText` (« quater**vicies** », « TRÈS »,
  « 6 années », « 3 années ») ont été corrigés entre-temps (§ 9.eg) : ils n'ont plus
  d'exception. Il n'en reste qu'une, « impôt(s) » sur `/blog/tout-comprendre-carmf`.

### 9.ej Phase 5c : le blog dans la DA (11 novembre 2026)

> **Numérotation.** Cette entrée a été écrite sous le numéro § 9.ef ; elle a pris § 9.ej à la fusion de `main`, où § 9.ef à § 9.ei étaient déjà attribués (guide des déclarations).


Suite de § 9.ee. Période d'observation SEO, et le blog est la porte d'entrée depuis
Google : seul l'habillage change, sur `/blog`, les trois pages de série et les 48 articles
(`src/pages/blog/[slug].astro`, `index.astro`, `serie/[series].astro`, `BlogCard.astro`,
nouveau `BlogAppel.astro`, nouvelle feuille `src/styles/blog-liste.css`). Aucun `.md`
touché, aucun JS ajouté, `lastmod` non touchés.

- **Ce qui ne change pas**, prouvé par script contre le build de `main` sur les 71 HTML.
  Les 19 pages hors blog : identiques à l'octet, au nom de la feuille commune près. Les 48
  articles : `title`, description, canonique, robots, balises sociales, 192 blocs JSON-LD,
  H1, 919 titres (niveau, texte, `id`), 4 085 liens (adresse, libellé, `rel`, `target`,
  dans l'ordre), 986 `id`, 2 401 éléments de mesure (`data-blog-*`, `data-track`,
  `data-ph`, `data-calendly`), 463 images (`src`, `alt`, dimensions, `srcset`), scripts,
  îlot des slides, ordre des blocs, suites de texte (100 056 mots) ; le HTML du corps,
  issu du Markdown, est le même à l'octet (526 004 octets). `/blog` et les séries : mêmes
  clés (11 blocs JSON-LD, 117 titres, 395 liens, 108 images avec `sizes` et `loading`,
  5 129 mots), tous les attributs des éléments de `<main>` hors `class`, en-tête et pied.
  Recherche de `/blog` : mêmes fichiers JS, mêmes identifiants, rien ne se charge avant le
  focus (essayée à 390 et 1 440 px, avant et après).
- **Écarts dans le HTML, tracés** : `<meta name="theme-color" content="#C9DEFF">`,
  `da-fond` et en-tête `flottante` (comme en § 9.ee) ; une feuille de page en plus de la
  feuille commune ; `sizes` de la couverture des articles (sa largeur réelle : 200 à
  300 px à côté du titre) ; une clé de style scopé dans les `props` de l'îlot des slides ;
  `role="list"` sur les listes sans puce ; « ← » et « → » dessinés en SVG (le caractère
  reste dans le texte, classe `sr`) ; des `<span class="num">` (`nouer`) qui gardent sur
  une ligne un mot et le « ? », « : », « ! », « ; », « / » ou guillemet qui le touche, et
  les formes inversées (« a-t-elle ») : titres, fil d'Ariane, sommaire, questions, cartes,
  jamais le corps ; la croix des plis à la place du chevron ; la classe `longue` du
  sommaire de trois articles.
- **Habillage** (aucune classe utilitaire dans les gabarits). Articles : le ciel (fil
  d'Ariane, série en pastille, titre, couverture en carte à droite du titre dès 700 px),
  une feuille sable pour le texte, colonne de 36 rem (17 px et interligne 1,6 sur
  téléphone, 16 px sous 360 px, 18 px et 1,7 dès 700 px : 68 caractères par ligne en
  médiane à 1 440 px, 60 à 74 pour neuf lignes sur dix, 95 sur `main` ; 43 à 390 px),
  encadrés en fiches avec un signe par genre, tableaux en fiche (cellules insécables,
  défilement dans la fiche, ombre du côté où il reste des colonnes ; un tableau étroit à
  l'aplomb du texte, un tableau large centré sur la colonne), sommaire en pli sur
  téléphone et en fiche collante à gauche dès 1 280 px (le texte est alors à l'aplomb du
  titre), puis sur une feuille ciel l'appel à l'essai, les questions en plis `.qa`,
  l'auteur, le partage, les articles connexes, et deux vagues au-dessus du pied. Liste et
  séries : recherche et séries en pastilles, article à la une en grande fiche, cartes en
  fiches (vignette à gauche sur téléphone, quatre par ligne dès 1 024 px), index en une
  fiche par série. Les pastilles de série n'ont plus qu'une teinte.
- **Feuilles** : commune 167 711 → 147 529 octets (25,8 Ko gzip, son nom change) :
  `.prose`, `.callout*`, `.blog-*`, `.series-badge` quittent `global.css`. Articles :
  `_slug_.*.css`, 25 337 octets (5,0 Ko gzip). Liste et séries : 13 222 octets (3,4 Ko
  gzip). `verify-site.mjs` repère le corps par `data-blog-zone="corps"`.
- **Après trois relectures** (lecture, invariance SEO, accessibilité), corrigé : interligne
  et marges du téléphone (les 48 articles font +5,4 % de haut que sur `main` à 390 px, au
  lieu de +8,9 % ; +0,1 % à 320 px) ; plus d'équilibrage des intertitres, qui renvoyait
  « : » ou « ? » en début de ligne (0 cas dès 768 px, 6 à 390 px contre 8 sur `main`) ;
  cellules resserrées sur téléphone (6 tableaux sur 20 défilent à 390 px, comme sur
  `main` ; aucun dès 744 px) ; les deux liens de l'appel se recouvraient dès 560 px sur
  dix articles (15 % du lien d'inscription partait vers Calendly) ; compteur des slides à
  4,13:1 sur le ciel ; questions, partage et lien de l'auteur sur téléphone ; texte de la
  série resserré (la première carte remonte de 110 à 140 px) ; sommaire collant (ombre
  quand la liste dépasse, sous-sections masquées au-delà de vingt entrées, plancher sous
  la bannière cookies) ; cibles de 44 px (index, sommaire replié, flèches des slides) ;
  contrastes forcés (croix des plis, aussi sur `/faq` ; signe des encadrés) et impression
  des encadrés ; `/blog` à 320 px avec le texte à 200 %.
- **Contrôles** : les 52 pages à 22 largeurs de 320 à 1 920 px (aucun défilement
  horizontal, tableaux à leur place), texte à 200 %, contrastes AA sur tout le texte,
  captures à 390, 768 et 1 440 px. Lighthouse mobile, article le plus lu, médiane de
  trois : performance 97 avant et après ces corrections, accessibilité 100, SEO 100 ;
  `/blog` 100.
- **À décider** : la feuille de page est une requête bloquante de plus (FCP +0,15 s en
  local sur `/blog` et les articles, LCP des articles et scores inchangés) ; la mettre
  en ligne dans le HTML des 52 pages l'éviterait.
- **Vu, non traité** : le point médian de « Ou commence l'essai gratuit· 30 jours » est
  masqué à l'œil sous 560 px (dix articles, le lien y prend sa ligne). À 768 px, 40
  extraits de cartes sur 47 sont coupés par les trois lignes, contre 33 sur `main`. Les 6
  intertitres encore coupés avant un signe à 390 px sont dans le corps, que rien ne
  retouche. Pas de repère de la section en cours dans le sommaire : `:target-current`
  le ferait sans script dans Chrome, mais le minifieur du build ne le connaît pas
  (avertissement). Les pages restent plus hautes à 1 440 px (+21 % : colonne plus étroite,
  corps plus grand). Déjà sur `main` : 92 en performance sur l'article à slides
  `interets-composes-meilleur-remplacement`, `td-has-header` sur deux articles à
  tableaux. `CLAUDE.md` dit encore que les styles `.callout-*` sont dans `global.css` et
  que l'accueil est la seule page dans la DA. `blog-series.ts` (généré) garde ses classes
  de dégradé, que plus rien n'affiche.

### 9.ek Phase 5d : `/simulateur` dans la DA (11 novembre 2026)

Suite de § 9.ej. Période d'observation SEO : seul l'habillage change, sur la page
(`src/pages/simulateur.astro`) et sur l'îlot React (`src/components/simulateur/*.tsx`,
nouvelle feuille `src/styles/simulateur.css`). Aucun calcul n'est touché : `src/lib/` et
`src/components/ui/` n'ont pas une ligne de diff, aucun JS ajouté, `lastmod` non touché.

- **Ce qui ne change pas**, prouvé par script contre le build de `main`. Les 70 autres
  HTML : identiques à l'octet, au nom de la feuille commune près ; les 6 autres fichiers
  texte du build (sitemaps, RSS, `llms.txt`, `robots.txt`, index de recherche) aussi. `/simulateur` :
  `title`, description, canonique, robots, balises sociales, 4 blocs JSON-LD, H1,
  17 titres (niveau, texte, `id`), 57 liens dont 9 dans `<main>` (adresse, libellé, `rel`,
  `target`, dans l'ordre), 13 `id`, 45 éléments de mesure (`cta_signup_simulateur_bottom`,
  `cta_pricing_simulateur_bottom`, `data-calendly="simulateur_resultat"`,
  `blog_readmore_simulateur`), 11 scripts, l'îlot (même composant, `client:visible`), les
  13 plis, l'ordre des sections, et le texte : 2 259 mots (2 141 dans `<main>`, 57 dans
  l'îlot rendu côté serveur), mêmes 172 suites de texte entre balises de bloc ; mêmes
  28 champs et boutons dans l'îlot (`name`, `type`, `placeholder`, `role`).
- **Aucun calcul ne change**, prouvé par script (Playwright, écrit et lancé sur le build
  de `main` avant toute modification, rejoué après) : 12 jeux de valeurs, 7 en RSPM
  (calcul local : simple, mixte avec PDSA, couple et deux enfants, 2025 en secteur 2 à La
  Réunion avec RID à 100 % et PER, parent isolé au seuil avec ZFRR, foncier et crédits
  d'impôt, RSPM forcé au-dessus du plafond micro avec conjoint libéral, 12 000 € avec
  chèques-vacances et Madelin) et 5 en PAMC. Relevé par `textContent`, sans aucune classe :
  le texte de l'îlot, chaque pli ouvert à son tour, chaque bulle d'aide des résultats.
  1 679 nombres, 36 678 caractères, 89 plis, 201 bulles : identiques au caractère près.
  **Limite** : l'Edge Function `calculate-urssaf` est injoignable d'ici (le proxy refuse
  le tunnel). La branche PAMC est donc rejouée avec une réponse de la forme
  `SimulationResult` calculée à partir du corps de la requête, la même avant et après :
  cela prouve que les 10 corps de requête envoyés sont identiques et que l'affichage
  d'une même réponse l'est aussi, pas le calcul du serveur (qui n'est pas dans ce dépôt).
  Les 24 insertions d'analytics (`simulateur_public_events`) sont interceptées, donc
  rien n'est parti en base, et leur contenu est identique.
- **Dans les `.tsx`**, relu ligne à ligne après effacement des valeurs de `className` :
  il ne reste que des tables de classes (couleurs des lignes, des pastilles, des
  encarts), les quatre couleurs du camembert, le halo flou de la fiche recommandée
  (retiré : c'est lui qui faisait défiler la page de côté, § 9.ed), un `<span>` autour
  de l'icône de la conclusion, et des `className` ajoutés ou retirés. États, effets,
  gestionnaires, appels réseau, `localStorage` : aucune ligne.
- **Écarts dans le HTML, tracés** : `<meta name="theme-color" content="#C9DEFF">`,
  `da-fond` sur `<body>` et en-tête « flottante » (comme en § 9.ee) ; une feuille de page
  en plus de la feuille commune ; une clé de style scopé dans les `props` de l'îlot ; une
  image décorative (`alt=""`, la mascotte) ; l'icône du titre, la flèche du bouton de fin
  et deux halos, décoratifs, disparaissent ; « → », « ↗ », « 💡 » et le « + » des plis
  dessinés en SVG, le caractère reste dans le texte, masqué à l'œil (`sr`) ; des
  `<span class="num">` qui gardent sur une ligne « Super-Net : », « chiffre ? », un mot
  composé d'une question (« prend-il », « Micro-BNC »).
- **Habillage de la page** (aucune classe utilitaire). Le ciel : titre à gauche,
  « Super-Net » sur du jaune, trois gages en pastilles, puis l'îlot et la fiche du
  rendez-vous ; mascotte au pouce levé dès 1 024 px, debout derrière le haut de l'îlot
  (les fichiers de l'accueil). Une feuille sable : le mode d'emploi en huit plis `.qa`,
  titre collant à gauche. Une feuille ciel : les trois mots en fiches (le Super-Net sur
  une fiche jaune), l'exemple chiffré, les limites. Une feuille sable : les cinq
  questions en plis. La fin : l'appel à l'essai (bouton jaune), la fiche « Comprendre ton
  résultat », le soleil sur l'eau du pied. `BlogReadMore.astro`, partagé avec le guide
  des déclarations, n'est pas modifié : la page recouvre son habillage.
- **Habillage de l'îlot** (`simulateur.css`, classes `sim-*`). Les composants de `ui/`
  sont partagés avec la calculette et le guide : ils ne sont pas modifiés. Leurs jetons
  (`--border`, `--muted-foreground`, `--primary`, `--radius`…) reçoivent les couleurs de
  la DA sous `.sim` ; champs, listes et boutons radio sont habillés par leur rôle ; les
  bulles, le tiroir d'aide du téléphone et les listes déroulantes, que Radix rend dans
  `<body>`, portent `.sim` eux aussi. Formulaire : une fiche en relief par section, champs
  ciel doux de 50 px, plis à pastille, bouton « Simuler » jaune épais. Résultats : deux
  fiches, le Super-Net du régime recommandé sur du jaune (l'autre sur ciel doux),
  camembert aux bleus de l'eau et au jaune du soleil (les couleurs de la jauge de
  l'accueil), une ligne par poste ; la conclusion sur l'eau profonde avec le gain en
  pastille jaune ; tableau du couple, comparaison des déductions et prélèvement en fiches
  ciel doux ; états (favorable, attention, information) par les jetons `--ok`, `--wait`,
  `--plan`. Bulles d'aide sur fond blanc (elles étaient noires, à 10 px), tiroir blanc.
  Les utilitaires Tailwind qui restent dans les `.tsx` ne règlent que la mise en page.
- **Feuilles** : commune 147 529 → 129 500 octets (23,7 Ko gzip ; 204 règles en moins,
  aucune ajoutée ; son nom change, donc le `<link>` de toutes les pages) ; les sept autres
  feuilles identiques à l'octet ; nouvelle `simulateur.*.css`, 30 916 octets (6,1 Ko gzip). HTML de
  `/simulateur` : 25 878 → 25 184 octets gzip. JS : mêmes fichiers, `SimulateurApp`
  136,8 → 122,9 Ko, `RegimeComparisonCards` 395,8 → 389,6 Ko (chaînes de classes plus
  courtes). Aucune image de plus dans le build.
- **Contrôles** : captures à 320, 390, 768 et 1 440 px, côte à côte avec `main` et avec
  `/tarifs`, dans cinq états (page vierge, résultat RSPM, tous les plis du formulaire
  ouverts, résultat PAMC en couple avec plafond dépassé, bulle et liste ouvertes) ;
  24 largeurs de 320 à 1 920 px dans quatre états : aucun défilement horizontal, aucune
  erreur de console ; texte à 200 % : aucun défilement de 320 à 1 280 px (14 largeurs).
  Lighthouse mobile en local, mesures alternées avant et après : sur les trois premières,
  performance médiane 95 sur `main` (95, 89, 99) et 93 après (93, 97, 89) ; sur neuf, 92
  sur `main` (87 à 99) et 95 après (89 à 97). L'écart d'une mesure à l'autre vient du
  temps de blocage (hydratation de l'îlot : 120 à 500 ms des deux côtés, médiane 342 ms
  avant, 254 ms après) ; l'objectif de 95 n'est donc tenu qu'en médiane longue, sur
  `main` comme ici. Accessibilité 100, SEO 100, bonnes pratiques 96 avant et après.
- **À valider** : le jaune du Super-Net ne sert que dans la fiche du régime recommandé ;
  « Économie de … » reste en vert (état favorable) ; la conclusion passe en bleu profond.
  La page est plus haute (8 302 px contre 7 158 à 390 px, 6 125 contre 5 353 à 1 440 px).
- **À décider** : la feuille de page est une requête bloquante de plus (comme en
  § 9.ej) : FCP et LCP simulés passent de 0,9 à 1,2 s en local, à chaque mesure.
- **Vu, non traité** (déjà sur `main`, relève de la logique) : `SimulateurApp` passe au
  formulaire des valeurs par défaut partielles ; la liste « Régime » s'affiche donc vide
  (le choix de la RID n'apparaît qu'après avoir choisi « Auto » ou « RSPM ») et le pli
  « Fiscalité immobilière & zones » annonce « ZFRR · Foncier réel » sur un formulaire
  vierge. `CotisationsDetailChart.tsx` n'est rendu nulle part : laissé tel quel. Les
  émojis des textes de l'îlot et le « → » de `BlogReadMore` restent des caractères (ils
  sortent dans la police de repli). Les bonnes pratiques Lighthouse restent à 96, avant comme après : trois
  requêtes sortantes sont refusées par le bac à sable de mesure (erreurs de console).

### 9.el Phase 5d : le guide des déclarations et la calculette dans la DA (11 novembre 2026)

Suite de § 9.ek. Période d'observation SEO : seul l'habillage change, sur
`/guide-declarations` (le hub), ses trois pages filles (`2042-c-pro`, `dsfu-pamc`,
`medecin-remplacant`) et `/guide-declarations/calculette`. Aucun calcul n'est touché :
`src/lib/`, `src/data/` et `src/components/ui/` n'ont pas une ligne de diff, aucun JS
ajouté, `lastmod` non touché. Deux feuilles nouvelles : `src/styles/guide.css` (hub et
pages filles) et `src/styles/calculette.css` (la calculette seule).

- **Ce qui ne change pas**, prouvé par script contre le build du commit précédent (§ 9.ek).
  Les 66 autres HTML : identiques à l'octet, au nom de la feuille commune près ; les
  6 autres fichiers texte du build (sitemaps, RSS, `llms.txt`, `robots.txt`, index de
  recherche) aussi ; les huit autres feuilles identiques à l'octet. Sur les cinq pages du
  lot : `title`, description, canonique, robots, balises sociales, JSON-LD (4 blocs par
  page), H1, titres (niveau, texte, `id`), liens (adresse, libellé, `rel`, `target`,
  mesure, dans l'ordre), `id`, ancres internes, attributs `title`, éléments de mesure
  (`guide_declarations_cta_essai`, `guide_declarations_cta_simulateur`,
  `calculette_2042_dspamc_cta_click`, `blog_readmore_*`), scripts, îlots (même composant,
  `client:visible`), plis, ordre des sections, et le texte, suite par suite entre balises
  de bloc. Hub : 131 titres, 1 427 liens dont 1 379 dans `<main>`, 259 `id`, 229 ancres,
  220 plis, 46 943 mots, 3 555 suites de texte. Calculette : 14 titres, 54 liens, 39 `id`,
  7 plis, 1 085 mots, 94 champs, boutons et plis de l'îlot rendu côté serveur. 2042-C-PRO :
  11 titres, 161 liens, 3 491 mots. DSFU : 13 titres, 231 liens, 6 901 mots. Médecin
  remplaçant : 11 titres, 205 liens, 4 300 mots.
- **Sept espaces rétablies** (correction de rendu, comme en § 9.ei : aucun mot ne change,
  mêmes caractères hors espaces). Un retour à la ligne collé à une balise en ligne faisait
  disparaître l'espace, et le contrôle « 4 septies bis » ne voit que les lettres et les
  chiffres collés : « Goburdhun,médecin remplaçant » et « Autres pages du guide :DSFU
  (ex DS-PAMC) ·2042-C-PRO… » sur les trois pages filles (`GuideSousPage.astro`),
  « dépassements.DSAV » sur `/guide-declarations/dsfu-pamc`. Le compte de mots de ces
  pages monte de 5 ou 6 : des mots qui étaient collés.
- **Aucun calcul ne change** (calculette), prouvé par script Playwright, écrit et lancé sur
  le build de `main` avant toute modification, rejoué après sur le build final : 26 jeux de
  valeurs. Les 14 exemples du menu « Charger un exemple », 9 sauvegardes posées dans
  `localStorage` avant le chargement (réel secteur 1 avec exonérations, IJ, cadre 8 et
  assistance ; micro-BNC au RSPM à 37 999,99 € ; secteur 2 en ZFU ; dépassements
  autorisés et chèques-vacances déjà déduits ; RBS négatif et déficit ; ancien profil
  « mixte » migré ; plafond micro ; deux sauvegardes invalides, nettoyées), 3 saisies au
  clavier (virgule française, liste de profil, montant négatif). Relevé sans aucune
  classe (champs et listes par `id`, texte par `textContent`) : texte de l'îlot, panneau
  des résultats, valeurs des champs, tous les plis ouverts, « Tout afficher », déclarant 2,
  contenu de `localStorage`, puis rechargement de la page et nouveau relevé, et pour une
  saisie la boîte « Réinitialiser » jusqu'au bout. 3 678 nombres, 92 195 caractères, 88 plis,
  387 valeurs de champs, 24 sauvegardes : identiques au caractère près. **Persistance
  intacte** : même JSON écrit, mêmes valeurs restaurées, mêmes sauvegardes invalides
  supprimées.
- **La boussole** : 17 parcours complets, à 1 280 px et à 390 px (les 12 profils, dont deux
  avec deux chemins, et trois parcours « Aucun ne me correspond »), relevés avant et
  après : titre de l'étape, texte, fil d'étapes (libellé, étape en cours, verrouillage),
  boutons, bulle « Comment savoir ? », recherche de profil, checklist toutes sections et
  tous plis ouverts, puis Retour, fil d'étapes, « Modifier », « Effacer » ou
  « Recommencer ». 175 relevés et 4 190 boutons par largeur : identiques. Après chaque
  changement d'étape, le titre n'est jamais sous la barre de recherche.
- **Barre de recherche et bandeau d'échéance** : même comportement, relevé à 390 et
  1 280 px. Barre `sticky` à 70 px du haut, collée à 70 px au milieu comme en bas de page,
  même champ (libellé long, puis « Rechercher… » après 320 px de défilement), 8 requêtes et
  48 résultats identiques, clic sur un résultat : recherche vidée, cible atteinte, les trois
  classes posées puis retirées. Bandeau : même texte, dans le flux, il part avec la page.
  La variante d'avril à juin (lien vers la boussole, fin de phrase masquée sur
  téléphone) a été construite à part pour être regardée ; celle de décembre a le même
  habillage, elle n'a pas été construite.
- **Dans les `.tsx`**, relus après effacement des valeurs de `className` : il ne reste que
  des tables de classes (catégories, types, états), la croix des plis à la place du
  chevron (`Croix.tsx`, décor), un `<span>` autour de la flèche des actions, des
  `className` ajoutés ou retirés, et un liseré décoratif retiré dans `CalculetteApp`.
  États, effets, gestionnaires, schéma, moteur, sauvegarde : aucune ligne.
  `FormattedText.tsx` n'est pas modifié du tout (des corrections y sont en cours
  ailleurs) : `guide.css` recouvre ses utilitaires.
- **Écarts dans le HTML, tracés** : `<meta name="theme-color" content="#C9DEFF">`,
  `da-fond` sur `<body>` et en-tête « flottante » (comme en § 9.ee) ; une feuille en plus
  de la feuille commune ; une clé de style scopé dans les `props` de l'îlot de la
  calculette ; une image décorative sur le hub (`alt=""`, la mascotte, fichiers de
  l'accueil) ; trois halos décoratifs en moins sur la calculette ; « → », « ← », « ↓ » et
  le « + » des plis dessinés en SVG, le caractère reste dans le texte, masqué à l'œil ;
  des `<span>` qui gardent sur une ligne un mot et le « : » qui le suit (titres des pages
  filles, « Fiscal ≠ social : »). Le `prefix` des îlots (compteur interne d'Astro) change.
- **Habillage du hub.** `<main class="gd">` porte le ciel : le titre à gauche (« enfin
  claires » dans le bleu de l'eau), le bouton « Trouver ma situation » en jaune, la barre
  de recherche en pastille qui flotte (comme l'en-tête, même largeur), puis les quatre
  pages détaillées en fiches en relief. Le bandeau d'échéance reste entre l'en-tête et
  `<main>` : une pastille sur le ciel, ambre pour une échéance de paiement. Quatre
  feuilles, une par étape (sable, ciel, sable, ciel), le numéro dans une pastille encre :
  le rappel fiscal / social en pli `.qa` ouvert ; la boussole en grande fiche (fil d'étapes
  en pastilles, choix en fiches ciel doux cerclées d'encre une fois choisies, bouton vers
  la checklist en jaune) ; le parcours en trois fiches ; cases, fiches, questions, termes,
  bugs et courriers en plis `.qa` denses (la croix de la DA). États par les jetons de la
  DA : fiscal en bleu, social en vert, attention en ambre ; l'alerte, que la DA n'avait
  pas, est un rose foncé (`--stop`, 6,0:1). La fin : l'appel à l'essai sur l'eau profonde,
  le Super-Net sur du jaune, les articles, l'avertissement, le soleil sur l'eau du pied.
  Mascotte qui montre du doigt dès 1 024 px, derrière la barre de recherche ; elle se
  baisse quand la barre se resserre (`:has()` sur un état que l'îlot pose déjà).
- **Pages filles** (`GuideSousPage.astro`) : le ciel (fil d'Ariane, titre, signature,
  chapô), trois feuilles par page, la fin (articles, « Le guide complet » avec son bouton
  jaune, avertissement, soleil). Sur la page du remplaçant, « Le net : ce qui te reste »
  est la fiche jaune.
- **Calculette** : le ciel (« Hippo » en encre, « Calc » dans le bleu de l'eau, l'aperçu
  fictif en fiche penchée, l'îlot, l'appel à l'essai sur l'eau profonde avec son bouton
  jaune), une feuille sable (les sept questions en plis `.qa`), la fin (avertissement,
  soleil). Îlot : `.calc` sur la racine et sur ce que Radix rend dans `<body>` (bulles,
  listes, menu des exemples, boîtes de confirmation) ; une fiche en relief par section,
  champs ciel doux de 48 px, barre d'outils en pastille collée sous l'en-tête, résultats
  dans une fiche. Les `.tsx` gardent leurs utilitaires : `calculette.css` donne les jetons
  des composants partagés, habille par rôle, et recouvre les 108 utilitaires de couleur
  présents, par famille. Tout est sous `@media screen` : l'impression garde ses règles.
- **Feuilles et poids** : commune 129 500 → 103 136 octets (23,7 → 20,3 Ko gzip ; 361 règles
  en moins, aucune ajoutée ; son nom change, donc le `<link>` de toutes les pages) ;
  feuille du guide 48 260 octets (9,6 Ko gzip, nommée `QuestionCard.*.css` par le build :
  c'est le morceau partagé par les quatre pages) ; `calculette.*.css` 23 894 octets (5,5 Ko
  gzip). HTML du hub : 2 488 520 → 1 872 047 octets (238 → 213 Ko gzip) ; DSFU 375 → 297 Ko,
  remplaçant 278 → 217 Ko, 2042-C-PRO 220 → 175 Ko, calculette 112 → 110 Ko. JS :
  `BoussoleWizard` 44,0 → 34,4 Ko, `CalculetteApp` 200,5 → 199,1 Ko. Aucune image de plus.
- **Contrôles** : captures à 320, 390, 768 et 1 440 px, côte à côte avec `main` et avec
  `/tarifs` (pages entières, et par états : boussole à chaque étape, checklist, un pli
  ouvert de chaque sorte, recherche ouverte, barre collée ; calculette vide, réel, micro,
  tout ouvert, menu, bulle, liste, boîte de confirmation). 24 largeurs de 320 à 1 920 px ×
  5 pages, dans ces états : aucun défilement horizontal, aucune erreur de console ; texte à
  200 % (taille de la racine doublée) : aucun défilement de 320 à 1 280 px (11 largeurs).
  Lighthouse mobile en local, trois mesures alternées : hub 96 sur `main` (96, 88, 96) et
  98 après (95, 98, 98) ; calculette 96 (97, 96, 94) et 98 (98, 98, 99) ; 2042-C-PRO 100 et
  100. Accessibilité 100, SEO 100, bonnes pratiques 96 avant et après (trois requêtes
  sortantes refusées par le bac à sable de mesure).
- **À valider** : le jaune du hub (bouton « Trouver ma situation », bouton vers la
  checklist, Super-Net de l'appel à l'essai) ; la fiche jaune « Le net » ; l'alerte en
  rose foncé ; les références croisées toutes en ciel doux (l'icône seule dit le type) ;
  la mascotte du hub, retournée pour désigner le titre. Les pages sont plus hautes : le hub
  de 8 % à 1 440 px (24 375 → 26 329 px) et de 12 % à 390 px (40 598 → 45 372 px), la
  calculette de 9 à 11 %, les pages filles de 14 % sur téléphone et de 38 % à 1 440 px
  (corps plus grand, feuilles et scène de fin).
- **À décider** : la feuille de page est une requête bloquante de plus (comme en § 9.ej
  et § 9.ek) : FCP et LCP simulés passent de 1,5 à 1,8 s sur le hub, de 0,9 à 1,2 s sur la
  calculette et les pages filles, à chaque mesure.
- **Vu, non traité** (déjà sur `main`, relève de la logique). Boussole, « Aucun ne me
  correspond » puis « SELARL / SEL » : l'étape « régime social » s'affiche alors que le
  PAMC est forcé, et y répondre renvoie à l'étape 1 (le fil d'étapes est recalculé après
  le choix). Calculette, « Estimation indicative de l'impôt » : la tranche marginale
  s'affiche « 3000 % » (taux déjà en pour cent, multiplié par 100). Sur 320 px, le libellé
  d'une case des résultats est coupé après quelques lettres (« CA… »), comme avant. Les
  émojis et les signes ≠ ≥ → des données restent des caractères (police de repli). Les
  classes de couleur de `GLOSSAIRE_CATEGORIES` (`src/data/`) ne servent plus.

### 9.em Phase 5d : `/guide`, `/comparatif`, les pages légales et la 404 dans la DA ; ménage de Tailwind (11 novembre 2026)

Suite de § 9.ek et § 9.el : les sept dernières pages. **Toutes les pages du site sont
maintenant dans la DA.** Période d'observation SEO : seul l'habillage change, sur `/guide`
(le guide du remplaçant en PDF), `/comparatif`, `/mentions-legales`,
`/politique-confidentialite`, `/conditions-utilisations`, `/rgpd` et la 404. Aucun JS
ajouté, `src/lib/` et les îlots pas touchés, `lastmod` non touché.

- **Ce qui ne change pas**, prouvé par script. Les sept pages étaient identiques entre
  `main` et le commit précédent (§ 9.el) : le build de `main` sert de référence. Les
  64 autres HTML : identiques à l'octet au commit précédent, au nom de la feuille commune
  près ; les 6 autres fichiers texte du build (sitemaps, RSS, `llms.txt`, `robots.txt`,
  index de recherche) aussi ; les dix autres feuilles identiques à l'octet ; aucune image
  de plus. Sur chaque page du lot : `title`, description, canonique, robots, balises
  sociales, JSON-LD, H1, titres (niveau, texte, `id`), liens (adresse, libellé, `rel`,
  `target`, `type`, mesure, dans l'ordre), `id`, images (adresse, `alt`, dimensions,
  `srcset`), éléments de mesure (`data-ph`, `data-track`, `data-guide-download`,
  `data-guide-share`, `data-mesure`), scripts, plis, tableaux cellule par cellule, ordre
  des blocs, et le texte, suite par suite entre balises de bloc. `/guide` : 8 titres,
  56 liens, 8 images, 652 mots. `/comparatif` : 5 JSON-LD, 19 titres, 64 liens, 8 plis, le
  tableau, 1 713 mots. Mentions légales 772 mots, confidentialité 2 020, conditions 1 228,
  RGPD 1 355, 404 196.
- **Écarts dans le HTML, tracés** : `<meta name="theme-color" content="#C9DEFF">`,
  `da-fond` sur `<body>` et en-tête « flottante » (comme en § 9.ee) ; une feuille en plus
  de la feuille commune ; `role="list"` sur les listes dont la puce est retirée ; halos
  et liserés décoratifs en moins, le décor de la fin en plus (`aria-hidden`). Pages
  légales : un `<main>` en plus (elles n'avaient pas de région principale). `/guide` : la
  règle qui masque la bulle de chat sur téléphone (§ 9.dk) passe du `<style>` en ligne à
  la feuille de la page. Les flèches « → », les trois points « ⋯ » et la pastille « ● »
  sont dessinés, le caractère reste dans le texte, masqué à l'œil. Des `<span>` gardent
  sur une ligne un mot et le tiret qui le suit (titres des pages légales : la ligne
  commençait par « – »).
- **`/guide`** : le ciel (pastille « PDF gratuit · 26 pages · Édition », titre avec
  l'édition dans le bleu de l'eau, bouton de téléchargement jaune, la couverture en carte
  au bord blanc ; sur téléphone toujours titre, bouton, couverture, le bouton à 373 px
  du haut à 390 px de large, 386 avant) ; une feuille sable (les six règles en fiches, numéro en
  pastille encre) ; une feuille ciel (le sommaire : titre et chapô à gauche, les neuf
  chapitres sur une fiche) ; une feuille sable (l'aperçu : trois pages en cartes, rangée
  qui défile de côté sur téléphone) ; la fin (la fiche de l'auteur, le second bouton sur
  l'eau profonde, l'appel au simulateur, le soleil sur l'eau du pied).
  `BlogCtaBand.astro`, qui ne sert plus qu'ici, est rhabillé : bouton blanc, le jaune
  est pris par le téléchargement juste au-dessus.
- **`/comparatif`** : le ciel (fil d'Ariane, pastille, titre aux quatre noms dans leur
  couleur de marque, les cinq ancres en pastilles) ; six feuilles, sable et ciel en
  alternance (quatre verdicts, quatre solutions, le tableau, quatre profils, les tarifs,
  les questions en plis `.qa` avec le titre à gauche) ; la fin (appel à l'essai, bouton
  jaune, note « À propos de ce comparatif », soleil). La fiche et la colonne d'Hippodoc
  n'ont qu'un liseré et une teinte : le comparatif reste factuel. **Le tableau** reste un
  seul `<table>`, dans une fiche : sur téléphone il défile de côté dans sa fiche (la page
  jamais), la colonne des fonctionnalités reste en place (collante), le nom du groupe
  aussi, et une ombre à droite dit qu'il reste des colonnes ; on voit deux éditeurs à la
  fois à 390 px, un et demi à 320 px ; plus de défilement à partir de 740 px environ.
  `pages/Icon.astro` n'a plus de classe par défaut (il ne sert plus qu'ici).
- **Pages légales** : un gabarit, `src/layouts/PageLegale.astro`, et une feuille,
  `src/styles/legal.css`. Sobres : le titre sur le ciel, le texte sur une feuille sable
  dans une colonne de 40 rem, l'eau du pied. Le texte n'a plus aucune classe : il est
  habillé par élément, avec la typographie de lecture du gabarit d'article (§ 9.ej).
  Encarts en fiches rondes (ciel doux, ambre pour l'alerte HDS, bleu pour la
  recommandation) ; le tableau des finalités sur une fiche, une finalité par bloc sous
  560 px ; les deux boutons de la mesure d'audience en boutons de la DA, de même poids
  (`data-mesure` et `#mesure-etat` inchangés).
- **404** : le ciel, « introuvable » dans le bleu de l'eau, les quatre destinations en
  fiches en relief, l'eau du pied.
- **Ménage** (`global.css`, `tailwind.config.ts`), chaque retrait prouvé par script avant
  d'être fait : le nom cherché dans `src/` et dans tout le build (HTML, CSS, JS), puis la
  feuille commune comparée règle par règle avant et après. Retirés : les images clés
  `fadeIn`, `slideInLeft`, `pulseRing`, `bounceSubtle` et les six couleurs `--series-*` de
  `global.css` ; dans la config, le conteneur (`corePlugins.container` coupé : la classe
  n'est portée par aucun élément, mais le mot revient dans les sources et Tailwind en
  tirait la règle), quatorze animations dont aucune classe `animate-*` n'existe, le plugin
  typography (`prose` nulle part) et le plugin qui exposait chaque couleur de Tailwind en
  variable CSS : 263 variables dans la feuille commune, aucune lue (`var()`,
  `getPropertyValue`, nom composé en JS). Les 20 jetons shadcn gardent leur valeur.
  Deux pièges, vus à la comparaison des règles : les images clés `shimmer` de
  `global.css` étaient recouvertes par celles de la config, de même nom, que le squelette
  de chargement du simulateur emploie (`animate-[shimmer_…]`) : ce sont celles de la
  config qui restent ; et `fadeIn` est aussi le nom d'images clés que le tiroir d'aide du
  simulateur (vaul) apporte lui-même, dans une feuille injectée après celle du site : la
  nôtre ne servait à rien. Effet sur la feuille commune, exactement : 10 règles retirées
  (les quatre images clés, `.container`), `:root` de 283 à 20 variables, aucune règle
  ajoutée, aucune valeur changée. **Gardé** : la règle `will-change` des éléments floutés
  (elle vise encore le texte flouté du simulateur), `shimmer`, l'accordéon, les couleurs
  `hippo` et les jetons shadcn (îlots, `ui/`, bannière cookies). Les pages hors lot,
  capturées en entier à 1 440 et 390 px avant et après (64 pages, 128 comparaisons) : les
  mêmes au pixel.
- **Feuilles et poids** : commune 103 136 → 87 083 octets (20,3 → 16,7 Ko gzip ; 173 règles
  en moins depuis § 9.el, son nom change, donc le `<link>` de toutes les pages) ;
  `guide.*.css` 13,5 Ko (3,0 gzip), `comparatif.*.css` 18,0 Ko (3,6), `PageLegale.*.css`
  6,5 Ko (2,0), `404.*.css` 4,5 Ko (1,4). HTML : `/comparatif` 115,6 → 105,5 Ko, les six
  autres pages de 1 à 2,5 Ko de moins chacune.
- **Contrôles** : captures à 320, 390, 768 et 1 440 px, côte à côte avec `main` et avec
  `/tarifs` ; le tableau à trois positions de défilement ; 25 largeurs de 280 à 1 920 px
  × 7 pages, plis ouverts : aucun défilement horizontal, aucune erreur de console, y
  compris avec le texte à 200 % (taille de la racine doublée). Lighthouse mobile en local,
  trois mesures alternées : `/guide` 85 sur `main` et 89 après (LCP 4,2 → 3,7 s, la
  couverture), `/comparatif` 98 et 98, `/mentions-legales` 99 et 100. Accessibilité 100,
  SEO 100 (404 : noindex, voulu), bonnes pratiques 96 avant et après (requêtes sortantes
  refusées par le bac à sable de mesure).
- **À valider** : le jaune du bouton de téléchargement de `/guide` (deux fois : en haut
  et en bas) et le bouton blanc de « Simule ton Super-Net » à côté ; les noms des
  éditeurs en couleur de marque sur le ciel (3,8:1 pour Hippodoc, 4,0:1 pour Indy :
  conforme en grand texte seulement, ce qu'est le titre) ; le liseré bleu pour seule
  marque d'Hippodoc dans le comparatif ; le `<main>` ajouté aux pages légales. Les pages
  sont plus hautes : `/guide` de 9 % à 1 440 px et de 12 % à 390 px, `/comparatif` de 10
  et 12 %, les pages légales de 19 à 23 % sur téléphone et de 25 à 30 % à 1 440 px (corps
  de 17 px au lieu de 16, interligne de lecture, colonne de 40 rem).
- **À décider** : l'en-tête « flux », la bande `.hd-ciel`, `.da-sous-entete` et le pied
  arrondi des pages sans `da-fond` (`da.css`, `Header.astro`) ne servent plus à aucune
  page. Laissés en place : le ménage demandé portait sur `global.css` et la config.
  `@tailwindcss/typography` reste dans `package.json`. `src/pages/index.astro` garde
  trois classes utilitaires (lien d'évitement, conteneurs).
- **Vu, non traité** : sur téléphone, l'en-tête du tableau (les noms des éditeurs) part
  avec la page quand on descend, comme avant ; les précisions « i » du tableau sont des
  attributs `title` (survol), sans équivalent au toucher, comme avant, et la phrase
  « Survole les ⓘ » le dit ; les émojis ⚠️ et 💡 des mentions légales restent des
  caractères.

### 9.en Phase 5d : corrections après les trois relectures (11 novembre 2026)

Trois relecteurs ont repris § 9.ek à § 9.em : calculs et fonctionnement, invariance SEO,
direction artistique et accessibilité. Chaque point a été vérifié sur le build avant
d'être corrigé ou écarté. Période d'observation SEO : aucun mot de contenu, `title`,
description, H1, titre, lien, ancre, `id` d'ancre, `alt` ni JSON-LD ne change ; `src/lib/`
n'est pas touché ; aucun JS ajouté ; aucun état, gestionnaire, appel réseau ni accès à
`localStorage` nouveau dans les îlots.

- **Ancres de `/guide-declarations` sous la barre de recherche** (important). Les
  1 357 liens à ancre de la page arrivaient à 84 px du haut, sous la barre collante (70 à
  134 px). Cause : `html:has(.gd-rech) { scroll-padding-top: 146px }` ne s'appliquait
  jamais. Sur les pages d'outils, la feuille de la page est liée AVANT la feuille commune,
  où `html:has(.da-fond)` pose 84 px avec le même poids : la dernière gagnait. Sélecteur
  alourdi (`html:has(.da-fond):has(.gd-rech)`). Mesuré à 1 366 et 390 px : `#case-5HQ`,
  `#cases` et `#glossaire-lettre-C` arrivent à 146 px, la barre finit à 126 px.
- **Séparateur « Résultats » de la calculette affiché sur ordinateur** (important).
  `.calc .calc-separe { display: flex }` battait l'utilitaire `lg:hidden` du bloc : la
  règle est bornée à `max-width: 1023.98px`. `display` mesuré : `flex` à 320, 390 et
  700 px, `none` à 1 024 et 1 366 px. Balayage des utilitaires de masquage gardés dans les
  .tsx (simulateur, calculette, guide, comparatif, confidentialité ; 390, 700, 800, 1 100
  et 1 366 px) : aucun autre n'est battu par une classe de la DA.
- **Barre d'outils de la calculette** (important). Fond opaque (le formulaire se lisait au
  travers). Elle ne colle plus sur téléphone, où elle prenait avec l'en-tête jusqu'à un
  tiers de l'écran : collante à partir de 640 px seulement, comme une ligne de 52 px, et
  `<html>` lui réserve alors sa hauteur (`scroll-padding-top` de 140 px, même précaution
  de poids). Maj+Tab sur tout le formulaire à 320, 390, 700, 1 024 et 1 366 px, défilement
  posé avant chaque mesure : aucun contrôle ne prend le focus sous la barre ou sous
  l'en-tête. « Voir mes résultats » arrête la fiche à 172 px du haut, comme avant (la
  marge de défilement de la colonne compense : 88 px sur téléphone, 32 px au-delà).
  Ceci remplace, en § 9.el, « la barre d'outils colle sous l'en-tête ».
- **Libellés des cases de résultat coupés** (important). « CA t… », « BNC a… » à 320 px,
  sans `title` : le libellé passe à la ligne et se lit en entier à toutes les largeurs ;
  sous 480 px, le code et le libellé prennent la largeur, le montant et « Copier »
  passent dessous, à droite. Plus aucun libellé coupé à 320, 390 et 1 440 px (9 sur 9).
- **Notifications de la calculette** (important). Elles étaient restées dans l'habit de
  sonner (police du système, rayon de 8 px) : fiche blanche de la DA, Google Sans Flex,
  encre, rayon de 22 px, icône dans le bleu de la marque. Habillage seul, dans
  `calculette.css` (la feuille de sonner est écrite sous `:where()`).
- **Champs du simulateur sans nom accessible** (important, déjà sur `main`). Sur treize
  champs à suffixe (€, %), `FormControl` enveloppait le `<div>` du suffixe : l'`id`,
  `aria-invalid` et `aria-describedby` tombaient sur ce `<div>`, le `<label>` ne nommait
  rien. `FormControl` enveloppe maintenant le champ. Les 27 messages d'erreur portent
  `role="alert"`. Vérifié, tous plis du formulaire ouverts : 21 champs visibles, 0 sans
  nom ; soumission vide : champ `aria-invalid="true"`, décrit par le message, message
  annoncé.
- **Aides « i » du simulateur inatteignables** (important, déjà sur `main`). Le
  déclencheur était un `<svg>` (ordinateur) ou un `<div>` (téléphone). C'est un
  `<button type="button">` dans `PremiumTooltip.tsx`, pour ses 27 emplois : il prend le
  focus, la bulle s'ouvre au focus, il s'appelle « Aide : » suivi du titre de l'aide
  (`aria-label`, pas de texte visible ; la pastille « Vérifiez », qui a son texte, n'en
  reçoit pas). Il épouse son icône (rien ne bouge) et sa cible déborde : 24 px à la
  souris, 44 px au doigt. Dans le formulaire, les 22 aides sortent de leur `<label>`
  (un bouton n'a pas sa place dans le libellé d'un autre champ) : le libellé et l'aide
  sont côte à côte dans un `<div>`. Le bouton de fermeture du tiroir d'aide s'appelle
  « Fermer ». Aucun état ni gestionnaire nouveau : le `onClick` du `<div>` passe au
  bouton. Tabulation : l'aide précède son champ.
- **Précisions « i » du comparatif** (important). Elles ne s'affichaient ni au toucher ni
  au clavier, alors que la page dit « Survole les ⓘ ». Une fiche en CSS seul (`::after`,
  texte de l'attribut `title`) s'ouvre au focus et, sur écran tactile, au toucher ; elle
  se place par rapport à la cellule collante et reste dans la partie visible du tableau
  (5 précisions sur 5 à 320, 390 et 1 440 px, aucune hors du tableau). À la souris, le
  navigateur montre toujours `title`. Le conteneur qui défile reçoit `tabindex="0"`,
  `role="region"` et `aria-label="Tableau comparatif"` (les mots de la pastille de la
  section). Ceci remplace, en § 9.em, le « Vu, non traité » sur les précisions.
- **Mineurs corrigés**, en CSS sauf mention. Calculette : les chevrons des trois plis
  (5 à 10 px de large) ne se laissent plus écraser et prennent la pastille des plis de la
  DA (32 px) ; les deux liens du pied des résultats sont soulignés, en 14 px, 24 px de
  cible, et le « | » orphelin est masqué sous 480 px ; « Tout copier » et « Imprimer »
  44 px de haut, interrupteur et « Forcer PAMC » 44 px au doigt. Simulateur : un filet
  d'encre autour de chaque secteur de l'anneau (le jaune du reste à vivre faisait 1,4:1
  sur la fiche) et libellé central à 10 px au lieu de 7 ; à 320 px, le rappel d'une rangée
  d'options (« ZFRR · Foncier réel ») passe sous son nom, le chevron n'est plus rogné.
  Bloc d'essai bleu du guide et de la calculette : voile de la pastille de 14 à 8 %,
  contraste mesuré au pixel de 4,44 à 5,06:1 au moins (guide) et de 4,48 à 5,11:1
  (calculette). Comparatif : « Fonctionnalité » tient sur une ligne à 320 et 390 px.
  Guide : champ de recherche opaque (plus de texte en fantôme derrière « Rechercher… ») ;
  renvois `.gd-ref` 44 px au doigt (30 px à l'œil, rangées à 8 px), nœuds du parcours et
  barres d'étape de la boussole à 44 px ; `aria-pressed` sur les choix multiples de
  « Situations particulières » (`BoussoleWizard.tsx`, un attribut).
- **Tableau des finalités de `/politique-confidentialite`**. Sous 560 px, la ligne
  d'en-tête (« Finalité », « Base Légale ») n'était plus dessinée et le tableau, en
  `display: block`, perdait lignes et colonnes pour les lecteurs d'écran. Il reste un
  vrai tableau à toutes les largeurs, cellules resserrées sur téléphone (pas de
  défilement horizontal de 280 à 1 920 px). Ceci remplace, en § 9.em, « une finalité par
  bloc sous 560 px ».
- **Écartés, et pourquoi.** Le taux non arrondi de la bulle « Impôt sur ton activité »
  (« 0.8213716108452951% ») : identique sur `main`, et aucun affichage de nombre ne bouge
  pendant la période d'observation ; à traiter à part. Les boutons « Copier » de
  28 × 28 px et les outils de la barre : leur cible faisait déjà 44 px (un `::after`, que
  la mesure de la boîte ne voit pas). Le menu « Charger un exemple » plus haut que
  l'écran : mesuré à 390 px, il tient dans l'écran (223 à 814 px sur 844) et défile, sa
  hauteur est bornée depuis § 9.el, et la barre ne collant plus sur téléphone il ne
  recouvre plus l'en-tête ; ses descriptions ne sont pas coupées à deux lignes, c'est sur
  elles qu'on choisit un exemple. `role="status"` sur les résultats du simulateur : le
  bloc entier (2 500 à 4 100 caractères) serait lu d'une traite, ou rien, la région
  n'existant pas avant le calcul ; il faudrait un message court, donc du texte et de la
  logique. Boussole : le focus qui retombe sur `<body>` après un choix, la liste de
  recherche sans flèches, le champ « Trouve ton profil… » nommé par son seul
  `placeholder` relèvent de la logique de l'îlot (et d'autres corrections sont en cours
  sur `src/components/guide/`) : **dette d'accessibilité**, avec la région des résultats.
  L'intervalle de 8 px entre l'en-tête et la barre de recherche reste : ce sont deux
  pastilles flottantes, la page se lit autour comme autour de l'en-tête.
- **Notés, sans correction.** Lighthouse en local : `npx serve` sert en HTTP/1.1, et la
  deuxième feuille bloquante des pages du lot y coûte 0,15 à 0,3 s de FCP et de LCP
  (`/simulateur` 0,90 → 1,20 s) ; rejoué en HTTP/2, le protocole de Vercel, l'écart
  disparaît (consigné dans CLAUDE.md). La feuille du guide (48,4 Ko, 9,7 Ko gzip) est
  chargée en entier par ses trois pages filles, qui n'en lisent qu'une partie (CSS
  bloquante 21,9 → 23,6 Ko brotli, poids total de la page en baisse) : laissée d'un seul
  tenant. Les îlots du simulateur et de la calculette reçoivent une prop
  `data-astro-cid-*` (`props="{}"` devenait `{"data-astro-cid-…":[0,true]}` en § 9.ek et
  § 9.el) : Astro la passe à tout composant rendu dans une page à `<style>` scopé, les
  composants ne lisent aucune prop, leur HTML est le même. La mascotte de `/simulateur`
  et celle de `/guide-declarations` (`<picture>`, `alt=""`, `loading="lazy"`) sont les
  seuls éléments porteurs d'URL ajoutés à ces pages par la phase 5d ; la balise
  `theme-color` vient avec `da-fond` sur les 13 pages ; les quatre pages légales ont
  gagné leur `<main>` (§ 9.em).
- **Ce qui change dans le HTML**, build du commit précédent contre celui-ci, par script :
  878 fichiers des deux côtés, 11 HTML modifiés. Neuf ne changent que par le nom d'une
  feuille ou d'un script (guide et ses trois pages filles, calculette, quatre pages
  légales). `/comparatif` : les trois attributs du conteneur du tableau. `/simulateur`
  (HTML de l'îlot rendu au build) : 7 boutons d'aide et 7 `<div>` de rangée en plus,
  5 `<label>` déplacés, les attributs `id`, `aria-invalid` et `aria-describedby` de deux
  champs passés du `<div>` au champ. Sur ces deux pages : texte identique, mot à mot et
  collé, titres, liens, images, `alt`, balises du `<head>` et JSON-LD identiques. Les
  59 autres pages : identiques à l'octet, feuille commune comprise
  (`_astro_assets.CvdXYDEr.css`, nom inchangé).
- **Calculs rejoués**, nombres identiques au build de `main`. Simulateur : 12 jeux de
  valeurs, 1 812 nombres, 36 678 caractères de texte d'îlot, 89 plis, 197 bulles, les
  10 corps de requête PAMC et 24 événements : 0 écart. Calculette : 26 jeux (14 exemples,
  9 sauvegardes restaurées, 3 saisies au clavier), 3 678 nombres, 387 valeurs de champs,
  24 sauvegardes `localStorage` : 0 écart. Guide : 17 parcours de la boussole à 1 280 et
  390 px (175 relevés d'étape, 4 190 boutons) et la recherche : 0 écart, et le titre
  d'une étape ne passe jamais sous la barre. Le relevé des bulles du simulateur lit
  désormais la bulle qui vient de s'ouvrir : sur `main`, celle de la pastille
  « Vérifiez » reste ouverte après le survol et l'ancien relevé la relisait à la place
  des suivantes (4 jeux sur 12) ; `main` et la branche ont été relevés avec la même
  lecture.
- **Feuilles** : `simulateur.*.css` 30,9 → 31,7 Ko (6,1 → 6,3 gzip), `calculette.*.css`
  23,9 → 26,0 Ko (5,5 → 5,9), feuille du guide 48,3 → 48,4 Ko, `comparatif.*.css`
  18,0 → 19,3 Ko (3,6 → 3,8), `PageLegale.*.css` 6,5 → 5,9 Ko. `SimulateurApp.*.js`
  122,9 → 124,6 Ko (les 22 rangées et le bouton).
- **Contrôles** : `npm run build` (70 pages), `verify-site.mjs` à 0 erreur ; 6 pages ×
  13 largeurs de 280 à 1 920 px, plis ouverts et résultats affichés : aucun défilement
  horizontal, aucune erreur de page ; captures à 320, 390 et 1 440 px (barre, résultats,
  plis, menu, notification, formulaire, bulle au clavier, tiroir, anneau, tableau, ancre).
  Lighthouse mobile en local sur `/simulateur`, trois mesures alternées, même serveur
  sans compression : performance 94, 95 et 93 avant, 95, 95 et 95 après (TBT 190 à 230 ms
  avant, 170 à 200 ms après). Accessibilité 100 et SEO 100 sur `/simulateur`, la
  calculette et `/comparatif` ; bonnes pratiques 96, comme avant (requêtes sortantes
  refusées par le bac à sable de mesure).
- **À valider** : les noms « Aide : … » des boutons d'aide, « Fermer » et « Tableau
  comparatif » (des `aria-label`, lus mais pas affichés) ; le filet autour des secteurs
  de l'anneau ; la barre d'outils de la calculette qui ne colle plus sur téléphone.

## 10. TODO(owner) — faits manquants / décisions

- [x] ~~Réactiver GA4, Meta Pixel, Crisp et Calendly~~ — fait (voir §6) : chargement
      différé interaction/idle, pixel gaté par le consentement, Calendly en liens directs.
      Seul le badge Calendly flottant n'est pas reproduit (lien direct à la place).
- [x] ~~Attribuer ou non les articles signés « Équipe Hippodoc »/« Dr. Hippodoc » au
      fondateur médecin~~ — fait (août 2026) : les 38 articles signés Dr. Ryan Goburdhun
      (voir §9).
- [x] ~~« Dr. Sophie Martin » (1 article) — auteur à confirmer~~ — fait (août 2026) :
      placeholder remplacé par Dr. Ryan Goburdhun (voir §9).
- [x] ~~Héberger la **vidéo de présentation** proprement~~ — fait (août 2026) : mp4 (26,7 Mo)
      uploadé sur Supabase Storage (bucket public `public-assets`), lecteur natif inline
      restauré, VideoObject mis à jour (voir §9). L'URL `app.hippodoc.fr/__l5e/...`
      précédente ne résolvait pas en DNS.
- [ ] Créer une cover dédiée pour `facturation-electronique-medecin-remplacant`
      (actuellement `facture-generation-cover.png`) — voir §9.aq. (Celle de
      `remplacement-regulier-requalification` est faite : § 9.ay.)
- [ ] `/qui-sommes-nous` (§ 9.dq) : relire le récit écrit à la première personne ;
      fournir de vrais témoignages (avec accord) pour le tableau `testimonials` ;
      confirmer le chiffre « 900+ inscrits » (repris sur tout le site) et le
      partenariat AIMGL.
- (liste complétée en fin de migration)

### 9.eo Phase 6 : ménage du code mort (11 novembre 2026)

Le propriétaire a donné carte blanche pour retirer ce qui ne sert plus. Règle suivie : on ne
retire que ce dont on prouve qu'aucune source et aucun fichier du build ne le nomme, et on
prouve après coup que rien n'a bougé. Période d'observation SEO : aucun `title`, description,
titre, texte, lien, JSON-LD, `data-ph`, `data-track` ni `data-landing-section` ne change ;
`src/lib/` et `public/` ne sont pas touchés ; la logique des îlots non plus ; aucun JS ajouté.
Les scripts de preuve nommés plus bas sont des scripts de session, hors dépôt.

**Retiré**

- **L'ancienne forme de l'en-tête.** `Header.astro` n'a plus de prop `variante` : les quinze
  gabarits passaient tous `flottante`, ils rendent `<Header />`. Avec elle partent, dans
  `da.css` : `.hd--flux`, la bande `.hd-ciel`, le jeton `--ciel-bande`, `.da-sous-entete`, et
  les coins ronds du pied des pages sans `.da-fond`. Vérifié avant : aucun HTML, JS ni CSS
  du build ne nomme ces classes hors de la feuille commune, `verify-site.mjs` et
  `public/transmissions` non plus, et les 70 pages ont `<body class="da da-fond">`.
  9 règles et un jeton, 1 169 octets.
- **Les variantes du mode sombre.** Le site n'en a pas : aucune source ne nomme `dark` hors
  des préfixes de classes, aucun HTML du build ne porte la classe, et le seul JS qui parle
  de thème sombre est sonner (les avis de la calculette), qui pose un attribut
  `data-theme` et pas une classe. Les 99 règles `.dark\:…:is(.dark *)` de la feuille commune
  (7 911 octets) ne pouvaient donc s'appliquer à rien. Solution de configuration, sans
  toucher aux `.tsx` : `content.transform` de `tailwind.config.ts` retire du texte que lit
  Tailwind tout mot qui contient `dark:`. Les 259 classes `dark:…` restent dans les îlots
  et dans `src/components/ui/` (elles viennent de l'application), sans règle derrière.
  `darkMode: class` est gardé : si le filtre sautait, les règles reviendraient sous la
  classe (inerte) et non sous `prefers-color-scheme` (qui s'appliquerait).
- **Deux règles nées d'un mot de commentaire** (le piège décrit dans CLAUDE.md) : `.ring`
  (« poser un ring highlight », `BoussoleSearchIsland.tsx`) et `.overflow-x-auto`
  (`comparatif.astro`). Commentaires reformulés, 342 octets.
- **Un composant** : `src/components/simulateur/CotisationsDetailChart.tsx`, importé nulle
  part (signalé en § 9.ek). Sept utilitaires n'existaient que pour lui (507 octets).
  ⚠️ L'audit des fichiers inatteignables, plus haut dans ce document, l'avait gardé
  exprès (« ressemble à une fonctionnalité désactivée, à trancher ») : supprimé ici sur
  la carte blanche du propriétaire. Pour le reprendre :
  `git checkout c9b383b -- src/components/simulateur/CotisationsDetailChart.tsx`.
- **Sept images de `src/assets/`.** Quatre n'étaient importées par rien et n'entraient pas
  dans le build : `cnom-logo.jpg`, `cnom-logo-adjoint.jpg`, `google-calendar-logo.png`,
  `hippodoc-logo.png` (589 Ko). Trois étaient dans `src/assets/blog/`, donc atteintes par
  le glob du blog, mais citées par aucun frontmatter ni aucune donnée :
  `conge-maternite-paternite-cover.png` (ancienne cover, remplacée par
  `remplacante-enceinte-cover.jpg`), `frais-pros-medecins-salaries-internes-2026-slide-18.png`
  (la diapositive 18 n'est plus dans l'article) et `temp-contract.png`. Le build copiait
  leurs originaux dans `dist/_astro/` (3,3 Mo) sans qu'aucune page, aucun flux ni aucun JS
  les nomme. ⚠️ Ces trois adresses à empreinte (`/_astro/<nom>.<empreinte>.png`) répondaient
  200 sur le site en ligne et répondront 404 : aucune page ne les a jamais liées (les
  pages servent des dérivés webp et jpg, d'autres adresses).
- **Le paquet `@tailwindcss/typography`** (`devDependencies`) : le plugin n'était plus
  chargé depuis § 9.em. Build identique octet pour octet avant et après.

**Mesuré, laissé en place, et pourquoi**

- *Variables de couleurs en `:root` posées par un plugin* : il n'y en a plus (retirées en
  § 9.em). `:root` ne porte que les 20 jetons shadcn (511 octets).
- *Jetons shadcn* : les 20 sont lus par au moins une règle de la feuille commune, et chacune
  de ces règles est une classe de `src/components/ui/` nommée dans le JS du build. Rien à
  retirer.
- *Couleurs `hippo`* : les dix teintes ont chacune au moins une classe portée par le build
  (800 et 900 n'en ont plus qu'une, les autres étaient des `dark:`). Rien à retirer.
  `hippo-950`, que quatre classes `dark:` nomment, n'a jamais existé dans la configuration.
- *Images clés* : les sept de la feuille commune (`pulse`, `spin`, `enter`, `exit`,
  `shimmer`, `accordion-up`, `accordion-down`) et `da-pli` sont toutes nommées par une règle.
- *Règles de `global.css`* : toutes servent. `scroll-padding-top: 96px` sur `<html>` est
  recouvert partout par `html:has(.da-fond)` (84 px), mais reste la valeur des navigateurs
  sans `:has()`. Le fond de `<body>` (`bg-background`) est recouvert sur les 70 pages par
  `.da-fond` : 40 octets, gardés pour une page qui n'aurait pas `da-fond`. La règle
  `will-change` vise toujours `blur-[6px]` du simulateur.
- *Utilitaires que le build ne nomme nulle part* (ni attribut `class` d'un HTML, ni chaîne
  d'un JS) : il en reste 88, 6 263 octets sur 77 154.
  - 75 classes, 5 036 octets : les neuf squelettes de chargement de
    `src/components/ui/skeleton.tsx` que rien n'importe (`DashboardCardSkeleton`,
    `ChartSkeleton`, `ReplacementItemCardSkeleton`… venus de l'application ; seul `Skeleton`
    sert, au simulateur). La consigne de ce lot interdisait de modifier `ui/` au-delà des
    classes `dark:`. **À trancher par le propriétaire** : retirer ces neuf exports (240
    lignes) rendrait 5 Ko.
  - 6 classes, 810 octets : le champ `color` des séries (`from-blue-700 to-cyan-700`…) de
    `src/lib/blog-series.ts`, que plus aucun gabarit ne lit. `src/lib/` n'est pas touché
    dans cette phase.
  - `filter` (185 octets, la méthode `.filter(` du JS), `paused` (36, une valeur CSS de
    l'accueil), `flex-grow` (23, une propriété CSS), `bg-blue-100`, `tracking-widest`,
    `opacity-60`, `mt-auto` (173 à eux quatre, champs ou exports inutilisés de fichiers
    vivants) : 417 octets. Les faire taire demanderait une `blocklist`, qui empêcherait
    aussi de s'en servir un jour sans le savoir. Risque pour presque rien : laissés.
- *Module orphelin de `src/lib/`* : `src/lib/calc/declaration2035Inputs.ts` (4 187 octets)
  n'est importé par rien (gardé exprès par le même audit, avec le composant ci-dessus).
  Laissé : `src/lib/` n'est pas touché. **À trancher par le propriétaire.**
- *`public/`* : rien de supprimé (adresses publiques). 31 fichiers, 3,7 Mo sur 12,3, ne
  sont nommés par aucune source ni aucun fichier du build (`vercel.json`, qui règle leur
  cache, ne compte pas comme un usage) :
  - à la racine : `icon-192.png`, `icon-512.png` (le site n'a pas de `manifest`),
    `hippodoc-presentation-st-poster.jpg` (affiche de l'ancien film, quittée le 10 novembre) ;
  - `lovable-uploads/`, logos passés dans `src/assets/accueil/` : `aimgl-logo-160.webp`,
    `silr-logo-160.webp`, `sioi-logo.jpg`, `crp-img-logo.png`, `doctripper-logo.png`,
    `homedoc-logo-160.webp`, `bpi-112.webp`, `french-care-160.webp`, `region-idf-112.webp`,
    `hippodoc-logo-96.webp` (ces dix étaient encore dans le HTML d'une page le 11 novembre
    2026 : des pages en cache et Google les demandent encore), et leurs sources
    `aimgl-logo.png`, `silr-logo.jpg`, `logo-region-idf.png` ;
  - `lovable-uploads/`, images venues de la SPA que ce dépôt n'a jamais citées (regardées
    une à une) : `0de70a76-….png` (la mascotte, doublon du logo `1a136973-….png` qui sert),
    `c4df22cf-….png` (doublon de `icon-512.png`), quatre captures du tableau de bord de
    l'application (`0fd2c2a3`, `344502fe`, `d4ba736d`, `3575b114`), `4332de9f` et son
    doublon `ea61c5fb` (statistiques par médecin), `2bfc231b` (calendrier), les logos
    Bpifrance (`16d4c030`), Google Agenda (`68383614`), Ordre des médecins (`686e20c5`) et
    La French Care (`43467e81`), `fbacc978` (une icône d'image cassée de 60 px) et
    `super-net-card-preview.png` (carte Super-Net de l'application).
  Ce qui peut encore pointer dessus : l'application et ses courriels (ces adresses étaient
  celles de la SPA sur le même domaine), des aperçus de partage, des pages en cache. Non
  vérifiable depuis ce dépôt ; les journaux d'accès de Vercel le diraient.

**Poids** (build de `main` `c9b383b` → cette branche)

| | Avant | Après |
|---|---|---|
| Feuille commune (`_astro_assets.*.css`) | 87 083 octets, 16 748 gzip | 77 154 octets, 15 271 gzip |
| Les 14 autres feuilles | 321 845 octets | identiques octet pour octet |
| JS (29 fichiers) | 1 762 823 octets, 524 758 gzip | identiques octet pour octet |
| `dist/` | 878 fichiers, 107,2 Mo | 875 fichiers, 103,9 Mo |
| `src/assets/` | 127 fichiers, 46,3 Mo | 120 fichiers, 42,4 Mo |

Feuille commune, règle par règle (`compare-css.cjs`) : 118 règles retirées (99 `dark:`,
10 de l'ancien en-tête dont `.da` réécrite sans son jeton, 9 utilitaires), aucune autre
ajoutée, ordre des règles restantes conservé.

**Preuves** (11 novembre 2026)

- *HTML* (`compare-html.py`, contre `ref-dist-6`) : les 70 pages sont identiques à celles
  de `main` une fois remplacé le nom de la feuille commune (`_astro_assets.CvdXYDEr.css` →
  `_astro_assets.B7wEZqJv.css`), seul écart ; `/transmissions` est identique octet pour
  octet. Aucun attribut retiré : la classe `hd--flux` et l'élément `.hd-ciel` n'étaient
  rendus sur aucune page. Contrôle séparé de `title`, description, canonique, `robots`,
  balises `og:` et `twitter:`, H1 à H6, texte visible, liens (adresse, libellé, `rel`,
  `target`), JSON-LD, `data-ph`, `data-track*`, `data-landing-section`, `id` et images :
  0 écart sur 194 021 mots, 7 272 liens, 1 475 titres, 257 blocs JSON-LD, 2 327 `data-ph`.
  Sitemap, flux RSS, `llms.txt`, `robots.txt` et `recherche.json` identiques.
- *Captures* (`captures.cjs`, Chromium, animations coupées, réseau externe coupé, bannière
  cookies et bulle de chat visibles) : les 68 pages du sitemap, `/essai` et la 404, pleine
  page à 1 440 et 390 px, soit 314 tranches de 6 000 px au plus : toutes identiques au
  pixel à la référence. La méthode voit un écart d'un cran de couleur (essai : `--sun`
  passé de `#ffd84a` à `#ffd84b`, trois tranches sur trois signalées).
- *Îlots* (`etats.cjs`, mêmes largeurs) : résultats du simulateur pour 30 000 / 3 000, avec
  la liste déroulante de Radix ouverte ; calculette avec l'exemple « Remplaçant pur, 60 k€ »
  chargé, avec le menu des exemples ouvert et l'avis de sonner ; boussole à l'étape 3 sur 5.
  29 captures identiques au pixel, textes des îlots identiques, aucune erreur JS.
- `npm run build` : 70 pages ; `node scripts/verify-site.mjs` : 0 erreur (68 pages, 5 388
  liens internes), à chacun des trois commits.

**Non testé.** Le moteur de Safari : la passe WebKit prévue en appoint n'a pas pu être
lancée dans cette session. Ce que ce lot retire ne dépend pas du moteur (des règles dont le
sélecteur ne trouve aucun élément, des fichiers que rien ne charge), et les règles qui
restent sont les mêmes, dans le même ordre. Pas de Lighthouse : aucune page ne charge plus
qu'avant, la feuille commune perd 1,5 Ko une fois compressée. Firefox non plus.

### 9.ep Phase 6 : passage dans le moteur de Safari, corrections (12 novembre 2026)

Tout le site avait été conçu et vérifié dans Chromium seulement. Deux audits (pages
statiques, outils) l'ont passé dans WebKitGTK 2.52, le moteur de Safari, à côté de
Chromium. Cette entrée consigne ce qui a été corrigé, ce qui est proposé sans être fait et
ce qui reste. Règles de la période d'observation : habillage seul (CSS et configuration du
build), aucun mot, aucun lien, aucune ligne de logique des îlots, aucun JS client de plus.
Chaque défaut a été reproduit sur le build de la branche avant d'être corrigé ; les deux
défauts des vieux Safari, que le moteur installé ne montre pas, sont dits à part.

**Corrigé**

- **Mascottes deux fois trop hautes dans Safari** (`/faq` à toutes les largeurs, `/tarifs`
  et les offres de l'accueil à partir de 1 024 px). Le moteur de Safari donne à un cadre
  `aspect-ratio` posé hors du flux la hauteur de son contenu (l'image entière) au lieu de
  celle de son rapport : la mascotte du haut de `/faq` montait sur le titre, celle du bas
  recouvrait « Besoin d'aide ? », celle de `/tarifs` passait derrière la pastille dès le haut
  de page, celle de l'accueil débordait sur les témoignages. `min-height: 0` sur les quatre
  cadres (`tarifs.astro` `.guide.haut`, `accueil/Tarifs.astro` `.guide`, `faq.astro`
  `.guide` et `.pouce`). Mesuré dans WebKit, avant → après : 250 × 465 → 250 × 242
  (`/tarifs` 1 440), 215 × 400 → 215 × 208 (`/tarifs` 1 024), 250 × 425 → 250 × 331 et
  160 × 286 → 160 × 183 (`/faq` 1 440), 117 × 199 → 117 × 155 (`/faq` 390), 92 × 156 →
  92 × 122 (`/faq` 320), 242 × 451 → 242 × 235 (accueil 1 440) : les tailles de Chromium,
  au pixel. Rien ne change dans Chromium. Deux cadres du même genre avaient été oubliés
  (`/simulateur`, `/guide-declarations`) : corrigés en § 9.eq.
- **Mots collés dans les tableaux d'articles** (Safari, 15 articles). Le tableau demandait
  les chiffres tabulaires et retirait 0,097 em à chaque espace (§ 9.ed). La fonction `tnum`
  de la police remplace aussi l'espace par une espace plus large (645 unités au lieu de 450
  sur 2 000, lu dans le fichier) : Chromium l'applique, d'où la compensation ; le moteur de
  Safari garde l'espace ordinaire, et la compensation y collait les mots (« 3CVetmoins »).
  Le tableau ne demande plus les chiffres tabulaires : il prend une seconde face de la même
  police, « Google Sans Flex Chiffres » (`[slug].astro`), limitée par `unicode-range` aux
  caractères que `tnum` remplace, espace exceptée (chiffres, `. , : ;`, opérateurs, signes
  monétaires, `# % §`), et qui porte `font-feature-settings: "tnum"`. Les chiffres restent
  de même chasse, l'espace reste celle du texte, dans les deux moteurs, sans compensation.
  Même fichier woff2 : une seule requête, comme avant. Mesuré (premier tableau de
  `/blog/frais-pros-medecin-liberal-2026`, 1 440 px) : WebKit 565,3 → 581,3 px ; Chromium
  581,1 → 579,5 px. Dans Chromium, les 40 tableaux relevés (15 articles, 2 largeurs)
  perdent 0 à 2 px de large, aucune hauteur de page ne change.
- **Pastille de l'en-tête : le texte de la page se lisait au travers.** Sous 900 px (deux
  moteurs), elle n'a pas de flou (§ 9.dn) et son fond était à 94 % : un titre passait en
  lettres nettes derrière le logo. Le fond est plein (`#fff`). À partir de 900 px, le
  verre reste : flou inchangé, fond passé de 86 à 92 % (à 86 %, un titre gras laissait un
  nuage gris derrière le menu ; l'audit mesure 3 à 14 niveaux sur 255 à 86 %, 2 à 8 à
  92 %). Le verre est posé sous `@supports` : un navigateur sans flou d'arrière-plan garde
  le fond plein.
- **Safari avant 18 : la pastille sans flou** (iPad en paysage, Mac ; vu par émulation, le
  moteur lancé avec `--features=-CSSUnprefixedBackdropFilter`). La source écrivait bien
  `-webkit-backdrop-filter`, mais le build ne le contenait plus : Astro construit en
  « esnext » et le minificateur (lightningcss), sans navigateur cible, retirait le préfixe.
  `astro.config.mjs` lui donne ses cibles : `vite.build.cssTarget` = Safari et iOS 16.4,
  Chrome et Edge 111, Firefox 121. Le préfixe revient (12 occurrences dans le build).
- **Safari avant 26.2 : liens sans soulignement** (non vu : aucun vieux Safari ici ; établi
  sur le CSS du build et les tables de compatibilité de MDN). Le même minificateur
  fusionnait `text-decoration: underline` et `text-decoration-thickness` en
  `text-decoration: underline 2px`, forme que Safari ne lit que depuis 26.2 : la
  déclaration entière y est rejetée (liens `.lien`, corps des articles et des pages légales,
  fils d'Ariane…). Avec les cibles, les deux propriétés restent séparées et la forme à
  couleur est doublée de `-webkit-text-decoration`. Dans le WebKit installé, les
  soulignements calculés sont les mêmes avant et après sur `/faq`, un article,
  `/mentions-legales` et `/comparatif`.
- **Ce que les cibles changent d'autre dans le CSS du build** (feuilles comparées
  déclaration par déclaration) : des préfixes rendus (`-webkit-user-select`,
  `-webkit-mask` pour Chrome avant 120, `-webkit-box-decoration-break`,
  `-webkit-print-color-adjust`, `-webkit-text-decoration-color`,
  `-webkit-backdrop-filter` des utilitaires Tailwind) et deux variables internes du
  minificateur à côté de `color-scheme`. Aucun sélecteur ne change. Firefox est visé à 121
  et non 114 : en dessous (pas de `:has()`), le minificateur réécrivait six listes de
  sélecteurs en `:is(…)`. Un de ces préfixes se voit dans Safari, et deux effets de bord
  n'étaient pas dits : § 9.eq.
- **Super-Net du simulateur : « 24044 € » dans Safari.** Les milliers sont séparés par une
  espace fine insécable (U+202F). Chromium n'applique aucun interlettrage à une suite de
  chiffres qui en contient une ; le moteur de Safari applique celui de `.aff` (-2,2 px à
  48 px) à chaque caractère, espace comprise. `simulateur.css` : le montant est posé sans
  interlettrage, le signe « € » garde celui de `.aff`. Largeur de « 24 044 € » à 1 440 px :
  WebKit 177,6 → 190,7 px ; Chromium 189,5 → 189,5 px (capture identique au pixel). Seul
  effet dans Chromium : un Super-Net inférieur à 1 000 € perd son interlettrage négatif.
  Cherché ailleurs : aucun nombre à espace fine sous un interlettrage non nul dans le HTML
  des 70 pages, ni dans les résultats du simulateur (deux plis ouverts) et le guide des
  déclarations. La calculette en a deux, que cette recherche (une valeur saisie, plis
  fermés) n'avait pas vus : § 9.eq.
- **Flèches natives des champs de montant du simulateur** (mineur, deux moteurs) : dessinées
  en permanence dans WebKitGTK, au survol dans Chromium, avec un pas d'un centime. Retirées
  (`appearance: textfield`). Hauteur des champs (50 px), saisie et calcul inchangés.

**Proposé, non fait (décision du propriétaire)**

- *Îlot pas encore hydraté.* Entre l'affichage et l'hydratation (0,1 à 0,3 s en local ;
  0,8 → 2,5 s sur un réseau bridé, jusqu'à 4,5 s en « 4G lente », mesures de l'audit), les
  outils ont l'air prêts mais rien ne répond : clics perdus, montants tapés effacés à
  l'hydratation, « Simuler » qui recharge la page. C'est le candidat le plus sérieux pour
  le signalement « les listes ne s'ouvrent pas » retiré depuis. Un état d'attente en CSS
  seul existe, essayé par l'audit par injection dans les deux moteurs, sans script et sans
  décalage de mise en page : tant que `<astro-island>` porte l'attribut `ssr`, curseur
  d'attente, contrôles neutralisés (`pointer-events: none`), bouton atténué et une barre de
  progression qui n'apparaît qu'après 0,4 s. À reporter dans `simulateur.css`,
  `calculette.css` et `guide.css`. Restent hors habillage : la saisie au clavier, et la
  durée de la fenêtre elle-même. Rejoué en § 9.eq, avec deux réglages à faire avant de
  l'appliquer.
- *Un fichier JS de l'îlot qui ne charge pas* : l'îlot reste inerte toute la visite, sans
  message. `posthog-js` (30 % du JS de l'îlot) est une dépendance statique des trois
  outils par `src/lib/analytics.ts`. En habillage seul, on ne peut qu'afficher un message
  après 10 s (du texte en plus : à valider) ; la vraie correction change un import.
- *Aides « i » et « ? » au toucher* (simulateur à partir de 768 px, calculette partout) :
  les bulles Radix ne s'ouvrent qu'au survol ou au clavier. Il faut changer le composant.
- *Colonne des résultats de la calculette*, plus haute que l'écran alors qu'elle colle : une
  hauteur maximale avec défilement interne est une piste, non essayée (ombres, impression).

**Laissé, avec la raison**

- Les deux faces de repli de la police : Safari ne lit `size-adjust` que depuis 17 et pas
  les trois `*-override` ; le saut à l'arrivée du woff2 (préchargé) y est un peu plus grand.
- `/guide-declarations` : premier affichage plus tardif dans WebKit (0,9 à 1 s en local
  contre 0,2 à 0,3 s), le moteur ne peignant qu'une fois analysé le document de 1,8 Mo.
- Sans équivalent dans un Safari de deux ans, sans correction nécessaire : animations liées
  au défilement (Safari 26), toutes sous `@supports`, les éléments sont alors fixes et
  visibles ; `text-wrap-style` (coupures ordinaires) ; `content-visibility` et
  `scrollbar-width` (ignorés).

**Preuves** (12 novembre 2026 ; scripts de session, hors dépôt)

- *HTML* contre le build de `main` : 70 pages identiques au nom des feuilles près,
  `/transmissions` identique octet pour octet ; 0 écart sur `title`, description,
  canonique, `robots`, H1 à H6, texte, liens, JSON-LD, `data-ph`, `data-track`,
  `data-landing-section` (194 021 mots, 7 272 liens, 1 475 titres, 257 blocs JSON-LD).
  JS identique octet pour octet (29 fichiers). CSS : 398 999 → 401 921 octets, feuille
  commune 77 154 → 78 642 (gzip 15 241 → 15 334).
- *Chromium, avant / après* : les 68 pages du sitemap, `/essai` et la 404 à 1 440 et
  390 px, 314 tranches. 166 identiques au pixel ; 115 ne diffèrent que dans la pastille ;
  33 diffèrent aussi dans un tableau d'article ou son ombre, et nulle part ailleurs. Îlots
  (résultats du simulateur, exemple de la calculette, boussole, listes de Radix) : 29
  captures, écarts dans le seul rectangle de la pastille.
- *WebKit, avant / après* : chaque défaut corrigé a sa capture avant et après (mascottes,
  tableaux, pastille aux trois configurations, Super-Net, champs). Passe de mesure sur
  21 pages à 1 440 et 390 px (dont les outils au repos, le guide des déclarations et deux
  pages légales) : aucune hauteur de page ne change, aucun débordement ; seuls changent de
  taille les quatre cadres des mascottes et les cellules des tableaux de l'article long.
- `npm run build` : 70 pages ; `node scripts/verify-site.mjs` : 0 erreur (68 pages,
  5 388 liens internes). Lighthouse en local : `/` 99 / 100 / 96 / 100, `/simulateur`
  98 / 100 / 96 / 100, l'article aux tableaux 98 / 100 / 96 / 100 (performance,
  accessibilité, bonnes pratiques, SEO), décalage de mise en page 0 ; l'article donnait
  les mêmes notes avant.

**Non testé.** Safari réel, sur iPhone, iPad ou Mac : tout est mesuré dans WebKitGTK sous
Linux (même moteur, autres polices système, ni barres d'iOS ni toucher). Aucun vieux
Safari : le flou préfixé est vu par un drapeau d'émulation, les soulignements ne sont pas
vus. La face « Chiffres » repose sur le descripteur `font-feature-settings` de
`@font-face` (Safari 10 selon MDN) : s'il manquait, les chiffres des tableaux
reprendraient leur chasse ordinaire, sans autre effet. Firefox : non testé. La branche
PAMC du simulateur (appel Supabase) n'est pas joignable d'ici.

### 9.eq Phase 6 : corrections après les trois relectures (12 novembre 2026)

Trois relecteurs ont repris § 9.eo et § 9.ep : invariance du HTML, régression dans
Chromium, contre-visite dans WebKit. Chaque constat a été vérifié sur le code et le build
avant d'être corrigé ou écarté. Mêmes règles : habillage seul, aucun mot, aucune ligne de
logique, aucun JS de plus. Une seule correction de code ; le reste précise § 9.ep ou
attend une décision.

**Corrigé**

- **Mascottes de `/simulateur` et de `/guide-declarations` trop hautes dans Safari**
  (important, à partir de 1 024 px ; en dessous, elles ne sont pas affichées). § 9.ep
  avait corrigé quatre cadres `aspect-ratio` hors du flux sur six. Les deux oubliés
  gardaient le défaut : la mascotte du simulateur sortait entière au lieu d'être coupée à
  mi-corps par l'îlot, celle du guide des déclarations dépassait de 95 px. `min-height: 0`
  sur `.guide` (`simulateur.astro`) et `.gd .gd-guide` (`guide.css`). Reproduit dans
  WebKit avant correction, puis mesuré après, à 1 440, 1 180 et 1 024 px : 190 × 339,5 →
  190 × 177,5 et 264 × 288,6 → 264 × 193,8, les tailles de Chromium ; les hauteurs de page
  ne changent pas. Barre de recherche resserrée (page défilée) : la mascotte du guide reste
  cachée, comme avant. Dans Chromium, rien ne change (40 tranches identiques au pixel, voir
  les preuves). Relevé dans WebKit sur les 70 pages, à 1 440, 1 024 et 447 px : plus aucun
  cadre à rapport fixe dont la hauteur s'écarte de son rapport (108, 108 et 105 cadres
  affichés).

**Vérifié, laissé à la décision du propriétaire**

- *Îlot pas encore hydraté* (important, « proposé, non fait » de § 9.ep). Le défaut est
  toujours là, rejoué dans WebKit à 1 440 px, le JS retenu 3 s par fichier (hydratation
  après 9,4 s) : « 30000 » tapé dans le premier champ est effacé à l'hydratation, le clic
  sur une liste ne fait rien, le curseur reste une main. Non corrigé ici : la correction
  proposée ajoute un état visible que personne n'a validé, et le signalement qui l'avait
  motivée a été retiré. Elle a été rejouée par injection, même montage : le clic ne donne
  plus le focus au champ, rien ne se tape, curseur d'attente, bouton à 75 %, barre visible
  après 0,4 s ; à l'hydratation tout revient, champ et liste répondent ; la hauteur de page
  ne bouge pas. Le clavier passe toujours (trois Tab atteignent un champ), comme annoncé.
  Deux réglages à faire avant de l'appliquer : sur `/simulateur`, la barre (posée 10 px
  au-dessus de l'îlot, devant lui) traverse la mascotte, qui se tient juste derrière ce
  bord ; sur `/guide-declarations`, la boussole est à 1 900 px du haut (2 700 px à 447 px
  de large) et son îlot, hydraté seulement quand il arrive à l'écran, porte encore `ssr` à
  ce moment : le délai de 0,4 s étant écoulé depuis longtemps, la barre s'y afficherait
  d'emblée à chaque arrivée, le temps de charger le JS, même sur un bon réseau. Non
  rejoué : la calculette, Chromium, le toucher.
- *Trois adresses de `/_astro` qui passeront de 200 à 404* (originaux des trois images de
  blog retirées en § 9.eo) et *`CotisationsDetailChart.tsx` supprimé* contre la note qui
  le gardait « à trancher » : le relecteur confirme qu'aucun fichier du build ni de l'arbre
  de `main` ne les nomme, et que les 29 fichiers JS sont identiques octet pour octet. Rien
  n'a été restauré. Pour revenir en arrière : `git checkout c9b383b -- <chemin>`.
- *Pastille de l'en-tête à 92 %* à partir de 900 px : question de goût. Le relecteur la
  juge pareille au premier écran, un peu plus pâle sur du contenu. Pour un verre plus
  coloré : 88 à 90 % dans `da.css` (règle `.hd-bar` sous `@supports`).

**Précisions sur § 9.ep**

- *Noms des feuilles.* Les cibles du minificateur réécrivent toutes les feuilles : 14 sur
  15 changent de nom par rapport à `main` (seule celle de la 404 garde le sien), pas
  seulement la feuille commune. Les pages qu'aucune correction ne visait ont donc deux
  adresses de feuille qui changent au lieu d'une ; rien d'autre ne change dans leur HTML.
  Chaque visiteur retélécharge ces feuilles une fois.
- *Deux effets de bord inertes du minificateur* dans la feuille commune :
  `:where(.da .da-bloc)` reçoit deux variables que rien ne lit (`--lightningcss-light`,
  `--lightningcss-dark`), et `.sig.ok::before` / `.sig.wait::before` portent
  `-webkit-mask` deux fois de suite (le second n'était pas dit). Aucune valeur calculée ne
  change.
- *Un préfixe rendu qui se voit dans Safari* : avec `-webkit-box-decoration-break: clone`,
  l'étiquette jaune « 120 € de moins par an que le mensuel » de l'accueil garde ses coins
  ronds et ses marges sur chaque ligne quand elle passe sur deux lignes (320 px de large,
  ou texte grossi). Avant, elle était coupée net à la césure. Conforme à Chromium.
- *Nombres à espace fine sous un interlettrage.* La calculette en a deux, plis « Comprendre
  ton RBS » et « Estimation de ton assiette sociale » ouverts (exemple « Remplaçant pur,
  60 k€ ») : « 56 300 € » et « ≈ 41 662 € », 30 px, interlettrage de -0,75 px. Relevé
  refait dans WebKit : l'espace des milliers y fait 3 px, le nombre reste lisible. Sans
  rapport avec les -2,2 px du Super-Net ; laissé.
- *Super-Net et texte grossi dans Safari.* Avec le zoom du texte seul (réglage de Safari
  sur Mac, × 2) sur un écran étroit, le montant, plus large de 22 à 26 px depuis sa
  correction, pousse la fiche jaune hors de l'écran (bord droit à 403 px pour 390 ; 381
  avant ; mesures du relecteur). La page débordait déjà. Ce zoom multiplie la taille après
  le `clamp()` : un plafond en `vw` n'y peut rien. Laissé : réglage rare, et le montant se
  lit enfin.

**Relevé par les relecteurs, hors de ce lot** (déjà là sur `main`, dans les deux moteurs
sauf mention)

- La bulle « Impôt sur ton activité » du simulateur affiche un taux non arrondi (« Taux
  effectif : 3.7918173598553344% », `RegimeComparisonCards.tsx`). C'est du texte d'îlot :
  pas touché pendant la période d'observation. À corriger après.
- La calculette imprimée sort toute la page autour des résultats (en-tête, bloc d'essai,
  FAQ, scène de fin, pied, bulle de chat) : 4 pages A4. Le site n'a aucune règle
  d'impression qui masque l'en-tête ou le pied, sur aucune page : c'est un choix à faire,
  pas un oubli de ce lot.
- Texte grossi à 200 % par le zoom du texte seul de Safari : le menu de la pastille passe
  sur deux lignes et en sort, le titre « HippoCalc » passe sous la fiche inclinée. Le zoom
  ordinaire de la page n'est pas concerné.
- Safari ne donne pas le focus au clavier à un tableau d'article qui défile de côté (6
  tableaux sur 20 à 390 px) ; Chromium le fait de lui-même. Il faudrait un `tabindex` sur
  le tableau : un changement de HTML, après la période d'observation.

**Preuves** (12 novembre 2026 ; scripts de session, hors dépôt)

- *Build* : deux feuilles changent, d'une déclaration chacune (`min-height:0`) : celle de
  `/simulateur` (32 118 → 32 131 octets) et celle du guide des déclarations (48 469 →
  48 482). La feuille commune garde son nom. Cinq pages changent, de la seule adresse de
  leur feuille (`/simulateur`, `/guide-declarations` et ses trois pages filles). Tout le
  reste du build est identique octet pour octet à celui de § 9.ep (JS : 29 fichiers).
- *HTML* contre le build de `main` : 70 pages identiques au nom des feuilles près,
  `/transmissions` identique octet pour octet ; 0 écart sur `title`, description,
  canonique, `robots`, H1 à H6, texte, liens, JSON-LD, `data-ph`, `data-track`,
  `data-landing-section` (194 021 mots, 7 272 liens, 1 475 titres, 257 blocs JSON-LD).
- *Chromium, avant / après* : `/simulateur`, `/guide-declarations`, ses trois pages filles
  et la calculette à 1 440, 1 024 et 390 px, pleine page : 40 tranches sur 40 identiques au
  pixel, hauteurs de page égales, cadres à 190 × 177,5 et 264 × 193,8 avant comme après.
- `npm run build` : 70 pages ; `node scripts/verify-site.mjs` : 0 erreur (68 pages,
  5 388 liens internes).

**Non testé.** Safari réel (iPhone, iPad, Mac) : tout est mesuré dans WebKitGTK 2.52 sous
Linux. Lighthouse : non relancé (une déclaration de plus dans deux feuilles de page).
Firefox : non testé. Les mesures attribuées au relecteur (texte grossi, impression, focus
des tableaux, étiquette sur deux lignes) n'ont pas été refaites ici.

### 9.er Phase 7 : des outils qui répondent, la fenêtre morte avant l'hydratation (12 novembre 2026)

> **Corrigé par § 9.et, le même jour.** Après trois relectures, trois des quatre pas décrits
> ici ont été retirés : les préchargements (b), qui faisaient reculer la première peinture
> dès que le réseau est bridé ; la sortie de `posthog-js` du graphe des îlots (a), qui ne
> gagne rien sans eux ; le moteur de recherche chargé après l'hydratation (d), qui, sans
> eux, retardait la première liste de résultats. `interactivity: inert` est retiré de
> l'état d'attente (régression au clavier). Restent : la boussole hydratée un écran plus
> tôt (c) et l'état d'attente. Le texte ci-dessous est gardé comme trace de ce qui a été
> essayé et mesuré ; ses colonnes « après », ses noms de fichiers à empreinte, sa liste
> d'ajouts au HTML et son relevé de mesure sont ceux du build d'alors (commit `72254ed`),
> plus ceux du site : l'état réel est en § 9.et.

Le défaut, relevé par l'audit de la phase 6 (§ 9.ep, § 9.eq) et antérieur à la refonte : le
simulateur, la calculette et le guide des déclarations sont rendus au build puis hydratés.
Entre l'affichage et l'hydratation, tout a l'air prêt et rien ne répond : un clic est perdu,
un montant déjà tapé est effacé à l'hydratation, « Simuler » envoie le formulaire en natif et
recharge la page. Ce lot raccourcit ce moment, puis le rend visible. Aucun calcul n'est
touché, aucun mot n'est ajouté à une page, aucune dépendance n'entre.

**Mesure, avant**

Un script rejoué à l'identique à la fin (`mesure-cr.cjs`, Chromium par Playwright ;
`mesure-wk.py`, WebKitGTK ; scripts de travail, hors dépôt, comme les autres cités ici), sur le build de `main` (`771de40`) servi en local (HTTP/1.1,
gzip). Par page, par réseau (sans bridage, « 4G rapide » 9 Mbit/s et 165 ms, « 4G lente »
1,6 Mbit/s et 562 ms, réglages des outils de développement) : première peinture, instant où
`<astro-island>` perd `ssr`, instant où la page reçoit le premier clic (ou la première
frappe) qui a un effet, fichiers JS demandés avant, profondeur de la chaîne « demandé par ».
Médiane de cinq chargements à froid, un navigateur neuf à chaque fois, fenêtre de
1 440 × 900. En 4G lente : `/simulateur` peint à 1,54 s et répond à 3,94 s (2,4 s de
fenêtre morte) ; la calculette, 1,55 s et 4,01 s ; la recherche du guide, 1,63 s et 4,25 s.
Cause : 11 à 19 fichiers JS (234 à 271 Ko transférés) découverts en deux ou trois vagues, sans
préchargement, dont `posthog-js` (76,6 Ko gzip), que chaque îlot importait par
`src/lib/analytics.ts`.

**Ce qui a été fait, par ordre de rendement, chaque pas mesuré**

- **(a) Les îlots n'attendent plus `posthog-js`.** `src/lib/analytics.ts` ne l'importe
  plus : `trackEvent()` émet par l'instance que `PostHog.astro` lui donne
  (`brancherMesure(posthog)`, une fois, après `init()` et `register_once`), et met en
  file ce qui est émis avant (cent événements au plus). La file est rejouée dans l'ordre,
  un tour après `init()` : posthog-js émet sa page vue initiale par un minuteur d'une
  milliseconde, la file passe derrière. Pas de seconde instance : `posthog-js` n'est que
  dans `module.*.js`, identique à l'octet à celui de `main`. Le graphe d'un îlot passe de
  238 à 162 Ko gzip (simulateur), 250 à 174 (calculette). Seul, ce pas gagne peu (0,1 à
  0,3 s en 4G lente ; **faux**, § 9.et : rien de mesurable, 3 919 ms contre 3 938) : la
  bibliothèque part quand même, par le script de `PostHog.astro`, et prend sa part du débit. Il vaut par le pas suivant. Effet de bord corrigé : n'étant
  plus partagé, `posthog-js` était fondu par le bundler dans le script de
  `PostHog.astro` (3 Ko → 79 Ko), qui partait alors avant la première peinture, sur les
  70 pages (+30 à +40 ms de première peinture en 4G lente sur les deux pages mesurées).
  `astro.config.mjs` lui rend
  son fichier (`environments.client.build.rolldownOptions.output.codeSplitting`) : le
  script d'entrée reste à 3 Ko, la bibliothèque part après lui, comme sur `main`.
  Gain annexe : si `posthog-js` ne charge pas, les outils marchent (avant, l'îlot ne
  s'hydratait jamais).
- **(b) Les fichiers des îlots sont préchargés.** `src/lib/precharge-ilots.mjs`,
  intégration Astro : à la fin du build, elle lit dans le HTML produit les `component-url`
  et `renderer-url` de chaque `<astro-island>`, suit les imports statiques des fichiers de
  `_astro/` et remplace la balise `<template data-precharge-ilots="…"></template>` que la
  page a posée par un `<link rel="modulepreload">` par fichier. Aucun nom n'est écrit à la
  main : une empreinte qui change est relue au build suivant. Elle passe avant la copie
  vers `.vercel/output/static` (vérifié : mêmes liens des deux côtés). Trois placements
  essayés sur `/simulateur`, 4G lente, cinq chargements (première peinture / hydraté / clic
  pris, référence 1 540 / 3 867 / 3 961 ms) :
  - dans le `<head>` : 1 892 / 2 999 / 3 085. L'hydratation gagne 0,87 s, la première
    peinture en perd 0,35 (0,44 sur la calculette, 0,59 sur le guide) : les fichiers
    disputent le débit aux feuilles de style. Écarté ;
  - dans le `<head>` avec `fetchpriority="low"` : 1 616 / 3 618 / 3 689. La peinture est
    presque gardée, mais Chromium ne charge alors ces fichiers qu'un par un tant qu'elle
    n'a pas eu lieu : le gain fond à 0,25 s. Écarté ;
  - dans le `<body>`, après le pied de page : 1 632 / 3 081 / 3 183. Quand le navigateur
    lit les liens, les feuilles ont pris leur avance. **Retenu.**
  Sur `/guide-declarations`, dont le HTML pèse 215 Ko gzip, la fin de page arrive trop
  tard pour la recherche : ses fichiers sont préchargés juste après son îlot (25 Ko de
  HTML avant eux, comme sur les deux autres pages), ceux de la boussole en fin de page.
  Lighthouse ne voit aucune différence entre ces placements (première peinture et LCP à
  1,20 s partout) ; c'est la mesure en réseau bridé qui tranche.
- **(c) Directives d'hydratation.** Simulateur et calculette : `client:visible`,
  `client:load` et `client:idle` comparés sur les trois réseaux, cinq chargements chacun.
  En 4G lente : hydraté à 3 081, 3 081 et 3 073 ms (simulateur), 3 000, 3 006 et 2 994
  (calculette) ; sans bridage, `client:load` gagne 35 ms. Temps de blocage de Lighthouse :
  238, 214 et 301 ms (simulateur), 249, 335 et 250 (calculette), dans le bruit de la
  machine. Rien de mesurable : **`client:visible` est gardé**, le HTML ne change pas.
  Boussole du guide : avec ses fichiers préchargés, elle est hydratée 0,2 s avant que le
  visiteur y arrive à la molette (3 000 px/s), quel que soit le réseau ; sur un saut (le
  bouton « Trouver ma situation » du haut de page mène à `#profils`), il restait 0,2 s
  de processeur après l'arrivée (0,3 à 0,45 s, processeur ralenti quatre fois). `client:visible={{ rootMargin: "100%" }}`
  l'hydrate un écran avant qu'elle entre dans la fenêtre : prête à l'arrivée dans tous
  les cas mesurés, y compris processeur ralenti quatre fois. À 1 440 × 900, elle est à
  moins d'un écran du bas de la fenêtre : elle s'hydrate au chargement ; sur un
  téléphone, pas avant un écran de défilement.
- **(d) Un module lourd sorti du chemin.** La recherche du guide importait toutes les
  données du guide (100 Ko gzip) pour s'hydrater, alors qu'elle n'en a besoin qu'à la
  première frappe. Son moteur est déplacé tel quel dans
  `src/components/guide/rechercheGuide.ts` (mêmes champs, même ordre, dix résultats),
  que l'îlot charge par `import()` juste après s'être hydraté. Son graphe, rendu React
  compris, passe de 156 à 56 Ko gzip. Tant que le module n'est pas là, une frappe ne donne ni liste ni « Aucun
  résultat » ; la liste sort à son arrivée. Le bloc des résultats du simulateur
  (`RegimeComparisonCards`, 102 Ko) était déjà chargé à la demande. Non fait : le
  fichier partagé `site` (47 Ko : formulaires, validation, listes Radix) et `tooltip`
  (18 Ko) servent dès l'hydratation.

**L'état d'attente, en CSS seul**

Astro garde `ssr` sur `<astro-island>` jusqu'à l'hydratation. Tant qu'il y est, à la fin
de `simulateur.css`, `calculette.css` et `guide.css` :

- les contrôles de l'îlot (`button`, `input`, `select`, `textarea`, `summary`, `label`,
  `[role="button"]`, `[tabindex]`) ne prennent ni clic ni toucher (`pointer-events:
  none`) ; `interactivity: inert` les sort aussi du parcours clavier dans Chromium 135 et
  suivants. Les liens de l'îlot restent des liens ;
- le curseur attend (`progress`) ;
- après 0,5 s, un trait de 3 px qui glisse, au bleu de la marque : sur le bord haut de
  la première fiche du formulaire (simulateur), de la fiche « Ton profil » (calculette),
  sous le champ de recherche (guide). Le trait ne prend aucune place (posé dans le flux,
  marge basse de -3 px, ou hors flux dans le champ de recherche). Sans mouvement sous
  `prefers-reduced-motion`.

Les deux défauts connus de l'essai de l'audit sont réglés. Sur `/simulateur`, le trait
n'est plus au-dessus de l'îlot : il est 84 px sous son bord haut, la mascotte s'arrête
67 px au-dessus (photos à 1 440 et 1 024 px). Sur `/guide-declarations`, la boussole est
neutralisée sans trait ; avec (c), elle est de toute façon hydratée avant l'arrivée.

Vérifié dans Chromium (JS retenu par interception, puis relâché) sur les quatre îlots :
curseur, contrôles neutralisés, trait à 0 puis à 1 après le délai ; géométrie des fiches
et hauteur de page identiques à la référence dans le même état ; un clic puis « 30000 »
tapé : rien n'est saisi, le focus reste sur la page ; clic sur « Simuler » : pas d'envoi,
l'adresse ne bouge pas ; toucher à 390 px : rien ne s'ouvre ; Tab passe par-dessus les
contrôles de l'îlot et continue après lui, Maj+Tab revient ; après l'hydratation, plus
rien n'est neutralisé, la saisie est gardée, la liste s'ouvre. Le trait selon le réseau,
relevé à chaque image : jamais affiché sans bridage ni en 4G rapide, affiché 0,6 à 1 s en
4G lente. Dans WebKit : mêmes effets au pointeur, trait affiché ; `interactivity` n'y est
pas lu, Tab atteint donc les contrôles et en ressort (18 Tab pour traverser le
simulateur, 56 la calculette).

**Tableau avant / après** (médianes de cinq chargements à froid ; millisecondes)

| Page | Moteur, réseau | 1re peinture | Hydraté | Clic pris | Fenêtre morte | JS avant hydratation | Cascade |
|---|---|---|---|---|---|---|---|
| `/simulateur` | Chromium, sans bridage | 168 → 180 | 297 → 165 | 369 → 266 | 201 → 86 | 19 fichiers, 245 Ko → 17 fichiers, 168 Ko | 3 → 1 |
| `/simulateur` | Chromium, 4G rapide | 536 → 560 | 1144 → 836 | 1216 → 952 | 680 → 392 | 19 fichiers, 245 Ko → 17 fichiers, 168 Ko | 3 → 1 |
| `/simulateur` | Chromium, 4G lente | 1540 → 1596 | 3866 → 3079 | 3935 → 3169 | 2395 → 1573 | 19 fichiers, 245 Ko → 17 fichiers, 168 Ko | 3 → 1 |
| `/simulateur` | WebKit, sans bridage | 312 → 328 | 466 → 416 | 660 → 656 | 348 → 328 | 19 fichiers, 245 Ko → 18 fichiers, 242 Ko | — → — |
| calculette | Chromium, sans bridage | 192 → 192 | 279 → 156 | 417 → 346 | 225 → 154 | 17 fichiers, 257 Ko → 16 fichiers, 254 Ko | 2 → 2 |
| calculette | Chromium, 4G rapide | 548 → 572 | 1135 → 780 | 1271 → 913 | 723 → 341 | 17 fichiers, 257 Ko → 14 fichiers, 178 Ko | 2 → 1 |
| calculette | Chromium, 4G lente | 1552 → 1612 | 3875 → 2994 | 4006 → 3134 | 2454 → 1522 | 17 fichiers, 257 Ko → 14 fichiers, 178 Ko | 2 → 1 |
| calculette | WebKit, sans bridage | 350 → 326 | 467 → 412 | 784 → 788 | 434 → 462 | 17 fichiers, 257 Ko → 16 fichiers, 254 Ko | — → — |
| guide, recherche | Chromium, sans bridage | 204 → 240 | 340 → 273 | 487 → 564 | 283 → 324 | 11 fichiers, 234 Ko → 17 fichiers, 193 Ko | 2 → 1 |
| guide, recherche | Chromium, 4G rapide | 588 → 620 | 1171 → 790 | 1369 → 920 | 781 → 300 | 12 fichiers, 237 Ko → 17 fichiers, 193 Ko | 2 → 1 |
| guide, recherche | Chromium, 4G lente | 1632 → 1648 | 4015 → 2836 | 4254 → 4102 | 2622 → 2454 | 11 fichiers, 234 Ko → 17 fichiers, 193 Ko | 2 → 1 |
| guide, recherche | WebKit, sans bridage | 883 → 915 | 1022 → 1004 | 1250 → 1258 | 367 → 343 | 12 fichiers, 237 Ko → 17 fichiers, 193 Ko | — → — |
| guide, boussole (saut immédiat) | Chromium, sans bridage | 216 → 200 | 430 → 229 | 515 → 296 | 299 → 96 | 17 fichiers, 268 Ko → 17 fichiers, 193 Ko | 3 → 1 |
| guide, boussole (saut immédiat) | Chromium, 4G rapide | 584 → 580 | 1303 → 1045 | 1343 → 1060 | 759 → 480 | 18 fichiers, 271 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (saut immédiat) | Chromium, 4G lente | 1636 → 1648 | 4517 → 4086 | 4560 → 4132 | 2924 → 2484 | 17 fichiers, 268 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (saut immédiat) | WebKit, sans bridage | 887 → 930 | 1082 → 1044 | 1731 → 1712 | 844 → 782 | 18 fichiers, 271 Ko → 17 fichiers, 193 Ko | — → — |
| guide, boussole (saut après chargement) * | Chromium, sans bridage | 216 → 208 | 91 → -1600 | 120 → 9 | 120 → 9 | 18 fichiers, 271 Ko → 18 fichiers, 268 Ko | 2 → 2 |
| guide, boussole (saut après chargement) * | Chromium, 4G rapide | 608 → 592 | 411 → -1724 | 422 → 12 | 422 → 12 | 18 fichiers, 271 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (saut après chargement) * | Chromium, 4G lente | 1636 → 1648 | 1377 → -1993 | 1416 → 8 | 1416 → 8 | 18 fichiers, 271 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (saut après chargement) * | WebKit, sans bridage | 925 → 881 | 139 → 55 | 705 → 683 | 705 → 683 | 18 fichiers, 271 Ko → 20 fichiers, 272 Ko | — → — |
| guide, boussole (molette, 3 000 px/s) * | Chromium, sans bridage | 216 → 192 | -168 → -2497 | 4 → 4 | 4 → 4 | 18 fichiers, 271 Ko → 17 fichiers, 193 Ko | 2 → 1 |
| guide, boussole (molette, 3 000 px/s) * | Chromium, 4G rapide | 596 → 592 | 165 → -2542 | 205 → 6 | 205 → 6 | 18 fichiers, 271 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (molette, 3 000 px/s) * | Chromium, 4G lente | 1640 → 1656 | 1127 → -2852 | 1141 → 4 | 1141 → 4 | 18 fichiers, 271 Ko → 19 fichiers, 269 Ko | 2 → 2 |
| guide, boussole (molette, 3 000 px/s) * | WebKit, sans bridage | 912 → 942 | -461 → -1426 | 698 → 689 | 698 → 689 | 18 fichiers, 271 Ko → 20 fichiers, 272 Ko | — → — |

\* Boussole après chargement ou à la molette : « hydraté » et « clic pris » sont comptés depuis
l'arrivée du visiteur sur la boussole (négatif : prête avant qu'il arrive). « JS avant
hydratation » compte tous les fichiers de `_astro/` demandés avant, ceux de la mesure compris.

Lecture. « Fenêtre morte » : du premier affichage au premier clic pris. En 4G lente, les
trois outils répondent 0,8 à 1,2 s plus tôt (le champ de recherche du guide dès
« hydraté », 2,84 s au lieu de 4,02 ; une saisie n'y est plus effacée ensuite) ; la
boussole est prête quand le visiteur y arrive, dans les trois réseaux, au lieu de 0,1 à
1,4 s après. Ce qui recule :

- la première peinture, de 0,02 à 0,06 s en 4G bridée sur les trois pages (le
  préchargement prend un peu du débit des feuilles de style ; **incomplet**, § 9.et : ce
  chiffre vient d'un scénario qui clique pendant le chargement, en HTTP/1.1 ; en HTTP/2
  le recul est de 0,2 s, et la police arrive après l'affichage dans les deux cas) ; sans bridage, elle ne
  bouge pas (0 à 12 ms ; sur le guide, 188 à 244 ms des deux côtés dans les scénarios de
  la boussole, le scénario de la recherche tapant au clavier pendant le chargement) ;
- sur le guide sans bridage, la liste des résultats de la recherche sort 0,08 s plus
  tard (564 ms contre 487) : le module des données arrive après l'hydratation, et la
  boussole s'hydrate au même moment à cette taille de fenêtre. En 4G, elle sort plus tôt.

Dans WebKit (sans bridage seulement), le pilote met 0,25 à 0,6 s par clic : « clic pris »
y est grossier, « hydraté » est exact, et gagne 0,02 à 0,09 s. Le scénario de la molette
n'y est pas comparable à Chromium (le défilement piloté y est bien plus lent que
3 000 px/s).

Deux corrections du script en cours de route, appliquées des deux côtés. Le saut vers la
boussole est instantané (`behavior: 'instant'`) : la page a un défilement doux, et les
premiers clics partaient pendant l'animation. Dans le scénario de la recherche, le champ
est vidé par sa propre sélection, plus par Ctrl+A : le champ neutralisé ne prenant pas
le focus, Ctrl+A sélectionnait les 1,8 Mo de la page et retardait lui-même l'hydratation
de 0,3 s. La référence a été rejouée pour ce scénario dans Chromium et en entier dans
WebKit ; ses autres scénarios Chromium, que la correction ne touche pas, datent de la
passe précédente (même script pour eux, même serveur).

**Lighthouse mobile** (médiane de trois passes, deux séries en alternance référence /
build, même serveur)

| Page | Référence (performance, LCP, blocage) | Build (performance, LCP, blocage) |
|---|---|---|
| `/` | 100 et 100 · 1 052 et 1 052 ms · 24 et 2 ms | 100 et 100 · 1 052 et 1 054 ms · 32 et 39 ms |
| `/simulateur` | 98 et 98 · 1 202 et 1 204 ms · 147 et 152 ms | 98 et 98 · 1 203 et 1 202 ms · 144 et 175 ms |
| `/blog/frais-pros-medecin-liberal-2026` | 98 et 97 · 2 403 et 2 422 ms · 37 et 75 ms | 98 et 98 · 2 404 et 2 431 ms · 25 et 58 ms |

Accessibilité 100, bonnes pratiques 96, SEO 100 sur les trois pages, des deux côtés. Rien
ne recule au-delà du bruit d'une passe à l'autre.

Un premier état d'attente coûtait à `/simulateur` environ 40 ms de temps de blocage
(processeur ralenti quatre fois par Lighthouse) et un à deux points : 96 ou 97 contre 98,
sur quatre séries. Cherché par variantes, six passes chacune : le build sans l'état
d'attente rendait le temps de la référence (151 contre 157 ms), le build sans les
préchargements ne le rendait pas (230 ms). Les préchargements ne coûtent donc rien à
Lighthouse ; c'était le trait, dont le glissement (une animation de fond, calculée à
chaque image) tournait dès l'affichage, encore invisible. Il démarre maintenant avec le
trait, après 0,5 s : les chiffres ci-dessus sont ceux du build final. Le bruit de la
machine reste fort d'une passe à l'autre (100 à 290 ms de blocage sur la même page).

**Ajouts au HTML, un par un** (période d'observation SEO ; liste exacte par
`invariance7.py`, build contre `ref-dist-7`)

- **Sur les 70 pages** : le nom du script de `PostHog.astro` change
  (`PostHog.astro_astro_type_script_index_0_lang.D-OG_3oS.js` → `….DwdnB0sC.js`). Rien
  d'autre sur 64 d'entre elles.
- **Sur les quatre pages du guide des déclarations** (le hub et ses trois pages filles) :
  le nom de la feuille du guide (`QuestionCard.BitHE1NA.css` → `….0sFLbjMO.css`).
- **`/simulateur`** : nom de la feuille (`simulateur.DyZySLzp.css` → `….B_IDJn-V.css`),
  du fichier de l'îlot (`component-url` : `SimulateurApp.C0aBMWk0.js` → `….CeVPZew1.js`) et
  du script de page ; **15 `<link rel="modulepreload">`** ajoutés dans le `<body>`, après
  le pied de page.
- **`/guide-declarations/calculette`** : nom de la feuille (`calculette.B1_8-bMq.css` →
  `….Cuuglc0m.css`), du fichier de l'îlot (`CalculetteApp.Bee9n-an.js` → `….B33wKo7r.js`)
  et du script de page ; **12 `<link rel="modulepreload">`** dans le `<body>`, après le
  pied de page.
- **`/guide-declarations`** : nom des fichiers des deux îlots
  (`BoussoleSearchIsland.dVAs37l4.js` → `….CXUiv3KO.js`, `BoussoleWizard.IqDNcLdm.js` →
  `….BbvxH8SF.js`) ; **9 `<link rel="modulepreload">`** juste après la barre de recherche,
  **7** après le pied de page ; **attribut `opts` de l'`<astro-island>` de la boussole** :
  `{"name":"BoussoleWizard","value":true}` → `{"name":"BoussoleWizard","value":{"rootMargin":"100%"}}`.
- Aucun autre écart : sur les 71 fichiers HTML du build, `<title>`, metas, canonique,
  titres H1 à H6 (1 475), liens (7 272), JSON-LD (257 blocs), `data-ph` (2 327),
  `data-track` (436), images et texte (193 420 mots) sont identiques à la référence,
  page par page ; 1 fichier est identique à l'octet (`/transmissions`), 67 aux noms de
  fichiers près, 3 portent les ajouts ci-dessus. Le HTML rendu par les îlots est le même.
- Côté fichiers : deux fichiers JS de plus (`rechercheGuide`, et `search`, une icône que
  le bundler a séparée), 31 au lieu de 29 ; `module.D6cv-y7S.js` (posthog-js) identique à
  l'octet.

**Mesure (PostHog)**

Relevé des envois à `t.hippodoc.fr` (interceptés, décodés) sur un parcours complet de
chaque outil, référence deux fois puis build (`releve-mesure.cjs`, `compare-mesure.py` :
les propriétés qui changent entre deux relevés de la référence, identifiants et instants,
sont écartées ; toutes les autres sont comparées, événement par événement, dans l'ordre).
Simulateur (profil type, deux simulations, nouvelle simulation, appel à l'essai) :
17 événements ; calculette (exemple, copie d'une case, tout copier, imprimer, estimation
d'impôt, appel à l'essai, rechargement) : 18 ; guide (recherche, boussole, remise à
zéro) : 12. Même suite, mêmes noms, mêmes propriétés (2 837 comparées), une seule
page vue par chargement, `posthog-js` dans un seul fichier. Deux écarts, expliqués :

- l'événement d'arrivée d'un îlot (`public_simulator_started`,
  `calculette_2042_dspamc_view`) part maintenant juste après la page vue, donc parfois
  avant que posthog-js ait reçu sa configuration distante : il ne porte alors pas cinq
  propriétés d'état que la bibliothèque ajoute d'elle-même (`$active_feature_flags`,
  `$feature_flag_payloads`, `$autocapture_disabled_server_side`,
  `$dead_clicks_enabled_server_side`, `$web_vitals_enabled_server_side`), comme la page
  vue ne les porte pas. Ce n'est pas propre au build : la bibliothèque retenue 2,5 s, la
  référence les perd aussi, et les deux relevés sont identiques. Le nom, les propriétés
  passées par le code et les `hd_*` ne changent pas ;
- dans la chaîne d'éléments des clics capturés dans la boussole, l'attribut `opts` de
  `<astro-island>` porte la marge d'hydratation (voir la liste ci-dessus).

Ce qui est nouveau : un îlot peut répondre avant que posthog-js soit là. Ses événements
nommés sont alors mis en file et partent à son arrivée ; un clic fait dans ce court
moment n'a pas de capture automatique (avant, l'îlot était inerte : ce clic n'existait
pas). L'horodatage d'un événement rejoué est celui du rejeu, pas de l'émission : lui
donner l'instant d'origine ferait ajouter deux propriétés par posthog-js.

**Preuves**

- Calculs : trois cas du simulateur en calcul local (30 000 / 3 000, 900 / 100,
  37 500 / 12 000), un cas PAMC (80 000 / 10 000 : la fonction Supabase est injoignable
  d'ici, les deux builds affichent le même état d'erreur) et deux exemples de la
  calculette : texte de l'îlot, montants et champs identiques au caractère près
  (`calculs.cjs`).
- `npm run build` : 70 pages ; `node scripts/verify-site.mjs` : 0 erreur, 68 pages,
  5 431 liens (50 de plus : les préchargements, dont il vérifie la cible).
- `verify-site.mjs`, contrôle 5 (nouveau) : aucun îlot n'importe `posthog-js` ;
  `posthog-js` tient dans un fichier à part ; les trois pages d'outils préchargent tous
  les fichiers de leurs îlots, dans le `<body>` ; aucune balise `data-precharge-ilots`
  n'est restée. Le contrôle échoue comme attendu sur un build abîmé à la main (trois
  erreurs sur trois).
- Feuille commune inchangée (`_astro_assets.QWDU2rDT.css`) : seules les feuilles des
  trois outils changent de nom.
- Après l'hydratation, rien ne change à l'œil : huit vues (les quatre îlots, à 1 440 et
  390 px, Chromium) identiques au pixel à la référence.

**Si un fichier JS ne charge jamais**

Essayé en refusant `react-dom` (simulateur) et `CalculetteApp` (calculette). L'îlot garde
`ssr` : le visiteur voit le formulaire, le trait qui glisse sans fin, un curseur
d'attente ; rien ne se clique, rien ne se saisit. Avant ce lot, la page avait l'air
prête : il pouvait taper un montant, et « Simuler » rechargeait la page. L'outil est
inerte dans les deux cas ; maintenant cela se voit. Proposé, non fait (texte à valider
par le propriétaire) : après une dizaine de secondes, remplacer le trait par une phrase
et un lien pour recharger la page.

**Limites, non testé**

- Le clavier : hors Chromium 135 et suivants, Tab atteint encore les contrôles avant
  l'hydratation ; une saisie y est effacée, « Entrée » dans un champ envoie le formulaire
  en natif. Le CSS seul ne ferme pas ce chemin.
- Astro retire `ssr` juste avant que React ait fini d'hydrater (hydratation en
  transition) : il reste quelques dizaines de millisecondes, jusqu'à 0,2 s relevé sur
  cette machine, où un contrôle n'est plus neutralisé et ne répond pas encore.
- Les mesures sont faites en local, en HTTP/1.1 (six connexions), réseau bridé par les
  outils de développement de Chromium. Sur Vercel (HTTP/2), l'ordre et le partage du
  débit diffèrent : les gains devraient être du même ordre, ils n'y ont pas été mesurés.
  WebKit : sans bridage seulement, et WebKitGTK n'est ni Safari ni un iPhone ; son pilote
  ne simule pas le toucher (le toucher est essayé dans Chromium émulé).
- Non testé : Firefox ; un vrai téléphone ; `npm run dev` ; la branche PAMC du
  simulateur avec la fonction Supabase.

**Fichiers**

`src/lib/analytics.ts`, `src/components/PostHog.astro`, `astro.config.mjs`,
`src/lib/precharge-ilots.mjs` (nouveau), `src/pages/simulateur.astro`,
`src/pages/guide-declarations/calculette.astro`, `src/pages/guide-declarations/index.astro`,
`src/components/guide/BoussoleSearchIsland.tsx`, `src/components/guide/rechercheGuide.ts`
(nouveau), `src/styles/simulateur.css`, `src/styles/calculette.css`, `src/styles/guide.css`,
`scripts/verify-site.mjs`, `CLAUDE.md`.

### 9.es Phase 7 : des outils qui répondent, les aides au doigt, un taux, l'impression (12 novembre 2026)

> **Complété par § 9.et** : une bulle haute ne dépasse plus pendant son ouverture, une
> bulle ouverte ne s'imprime plus, et deux défauts antérieurs que ce lot n'a pas vus y
> sont consignés (deux aides hors de la fenêtre à 390 px, bulles refermées par le
> défilement au clavier). Les chiffres d'hydratation, de mesure et d'invariance « contre
> le build d'avant » ci-dessous valent pour le build d'alors (commit `0be0b5c`).

Suite de § 9.er. Trois défauts relevés par l'audit de la phase 6, tous antérieurs à la
refonte : les bulles d'aide ne s'ouvrent pas au doigt ; un taux sort non arrondi dans une
bulle du simulateur ; la calculette s'imprime sur quatre pages et plus, avec l'en-tête, la
FAQ et le pied. Aucun calcul n'est touché, aucune dépendance n'entre, le HTML du build ne
change pas (`origin/main` n'a pas avancé : `771de40`).

**A. Les aides s'ouvrent au doigt**

*Le défaut, reproduit.* Chromium piloté avec un écran tactile (`hasTouch`, appuis par
`touchscreen.tap`), sur le build d'avant : simulateur à 1 024 et 820 px, 83 aides « i »
sur 83 muettes ; calculette à 390, 820 et 1 024 px, 46 aides sur 46 muettes (34 « ? »,
11 libellés de cases des résultats, la pastille « RSPM · sans DSFU ») ; boussole du guide,
1 sur 1. Sous 768 px, le simulateur passait déjà par un tiroir (`PremiumTooltip.tsx`),
qui s'ouvre. Cause : la bulle de Radix écarte les pointeurs tactiles, s'ouvre au focus
que l'appui donne au bouton, et se referme au clic du même appui.

*La correction, en un seul endroit* : `src/components/ui/tooltip.tsx`, que seuls les
trois outils utilisent (`PremiumTooltip.tsx` pour le simulateur, `CalculetteForm.tsx`,
`CalculetteResults.tsx`, `BoussoleWizard.tsx` ; aucune autre page). Aucun appelant ne
change.

- À la souris et au clavier, rien d'autre que Radix : ouverture au survol et au focus,
  fermeture en quittant, au clic, à Échap.
- Au doigt, un appui ouvre la bulle et la retient (« épinglée ») : elle ne suit plus les
  fermetures de Radix (défilement, perte du survol, autre bulle). Elle se ferme à un
  second appui, à un appui ailleurs, à Échap, ou quand le focus part vers un autre
  contrôle. Un défilement au doigt n'est pas un appui (le navigateur annule le pointeur) :
  la bulle reste. Est « au doigt » : un appui dont le pointeur est un doigt ou un stylet
  (portable tactile compris), ou tout clic quand le pointeur principal ne survole pas
  (`(hover: none)` ou `(pointer: coarse)`, lu par `useSyncExternalStore` après le montage,
  jamais au rendu).
- Le tiroir du simulateur sous 768 px est gardé tel quel. Au-dessus, la tablette reçoit
  la bulle épinglée.
- Accessibilité. Le déclencheur est un bouton nommé. Les douze déclencheurs qui n'en
  étaient pas (un `<span>` : libellés de cases, pastille RSPM) reçoivent après le montage
  `role="button"`, `tabindex="0"`, et Entrée et Espace : ils n'étaient pas atteignables au
  clavier, ils le sont (douze arrêts de tabulation de plus dans les résultats de la
  calculette). Sur un appareil tactile, le déclencheur porte `aria-expanded` (faux, puis
  vrai) en plus du `aria-describedby` de Radix ; le texte d'une bulle épinglée est aussi
  posé dans une zone `role="status"` (`#aide-annonce`, une par page, ajoutée à `<body>`
  après le montage, vidée à la fermeture). Le focus reste sur le déclencheur.
- Trois bulles sortaient de la fenêtre, à la souris comme au doigt : « Zones exonérées »
  du simulateur (500 px de haut : 23 px coupés en haut d'une fenêtre de 900 px, davantage
  sur une tablette), « Aide profil » de la calculette à 390 px (14 px), la bulle de la
  boussole à 390 px (44 px à gauche). Les trois feuilles donnent à la bulle la place que
  Radix lui mesure (`--radix-tooltip-content-available-height`, et `-width` pour la
  boussole, qui s'ouvre sur le côté) ; au-delà, elle défile dedans.

*Vérifié sur le build final* (scripts de travail, hors dépôt : `tactile.cjs`,
`souris.cjs`, `divers.cjs`, `wk-aides.py`). Les aides sont comptées en parcourant tous
les états : simulateur, quatre jeux de saisies (dont un couple avec toutes les options,
un régime RSPM forcé à 90 000 €, un Micro-BNC plus avantageux), formulaire et résultats,
plis ouverts, soit 97 aides (22 du formulaire, 75 des résultats) ; calculette, les trois
profils, les deux régimes et les quatorze exemples, soit 46 ; boussole, 1.

| Outil, largeur | Aides | S'ouvrent à l'appui | Restent ouvertes | Second appui | Appui ailleurs | Échap | Dans la fenêtre |
|---|---|---|---|---|---|---|---|
| Simulateur, 1 024 px | 97 | 97 (bulle) | 97 | 97 | 97 | 97 | 97 |
| Simulateur, 820 px | 97 | 97 (bulle) | 97 | 97 | 97 | 97 | 97 |
| Simulateur, 390 px | 97 | 97 (tiroir) | 97 | bouton « Fermer » : 97 | 97 | 97 | tiroir |
| Calculette, 390 px | 46 | 46 | 46 | 46 | 46 | 46 | 46 |
| Calculette, 820 px | 46 | 46 | 46 | 46 | 46 | 46 | 46 |
| Calculette, 1 024 px | 46 | 46 | 46 | 46 | 46 | 46 | 46 |
| Boussole, 390 et 820 px | 1 | 1 | 1 | 1 | 1 | 1 | 1 |

Sur chaque bulle : `aria-expanded` vrai ouverte et faux fermée, zone d'annonce égale au
texte puis vidée. En plus (`divers.cjs`, 34 contrôles, aucun échec) : la page défile au
doigt bulle ouverte (376 px) et la bulle reste, encore ouverte six secondes plus tard ;
bulle ouverte, un appui sur une liste l'ouvre et un choix s'y fait, un pli bascule, le
menu « Charger un exemple » s'ouvre, un champ prend le focus, « Simuler » lance le
calcul, et la bulle se ferme à chaque fois ; un appui sur une seconde aide ferme la
première ; arbre d'accessibilité de Chromium : bouton nommé, déplié faux puis vrai,
description égale au texte de la bulle ; Tab quitte le déclencheur et ferme la bulle ;
clavier sur tablette : le focus ouvre, Entrée garde ouvert, Entrée ferme, Échap ferme ;
un doigt sur un appareil qui survole ouvre et retient ; une bulle plus haute que la place
défile sous le doigt et reste ouverte.

*À la souris et au clavier* (1 440 × 900, les 130 aides des trois premiers jeux, build
d'avant contre build final, même script) : survol ouvre 130 sur 130 des deux côtés, clic
ferme, quitter ferme, Échap ferme, Tab sort et ferme. Focus clavier : 118 aides avant, 130
après (les douze libellés). Photos de la fenêtre bulle ouverte, au survol et au focus,
260 paires : 114 identiques au pixel ; 95 à un écart d'au plus 7/255 sur 1 à 91 pixels
(deux passes du même build donnent 26 paires de ce genre, à 6/255 au plus) ; 21 à un écart
petit (moins de 400 pixels), dont le « 30 % » de la calculette visible derrière la
bulle (voir B) ; 30 nettes, toutes expliquées : les douze libellés au focus (la bulle s'y
ouvre maintenant), les huit clichés des bulles « Impôt sur le revenu » (le taux, voir B),
les deux de « Zones exonérées » (plus coupée), sept clichés où la page entière est
décalée de 1 à 5 px (quatre aides, la première essayée après un chargement ; trois
d'entre elles le sont aussi entre deux passes du même build), et la bulle de la boussole
au survol (fondu en cours, 20/255 au plus ; identique au focus).
WebKitGTK, souris et clavier : 34 aides (7, 26 et 1), survol, clic, sortie, focus, Échap,
toutes dans la fenêtre.

**B. Deux nombres mal affichés** (texte affiché seul, calcul intact)

- Simulateur, bulle « Impôt sur le revenu » (`RegimeComparisonCards.tsx`). Le calcul rend
  le taux effectif brut. Avant : « Taux effectif : 3.7918173598553344% ». Après :
  « Taux effectif : 3,8 % » (une décimale au plus, virgule, espace insécable avant %).
  Relevés sur trois jeux : 4.555555555555555% → 4,6 % ; 3.7918173598553344% → 3,8 % ;
  10.22517730496454% → 10,2 % ; 8.624507374151872% → 8,6 %. Quand le calcul ne rend pas
  de taux, la même ligne en affiche un arrondi à l'entier : « Taux effectif : 4% »
  devient « Taux effectif : 4 % » (même formule, non observé ici : c'est la branche PAMC,
  dont la fonction Supabase est injoignable).
  Recherche des autres nombres bruts : 71 textes lus sur trois jeux (résultats, chaque
  pli ouvert, les 61 bulles des résultats). Aucun autre nombre à plus de deux décimales.
  Laissés tels quels (arrondis, mais écrits avec un point) : « +13.0% Super-Net »,
  « (41.0%) », « +1.0 part(s) », « 1.5 parts fiscales ».
- Calculette, pli « Estimation indicative de l'impôt sur le revenu »
  (`IrEstimateCard.tsx`), trouvé en relisant les pages imprimées. `getTMI()` rend un
  pourcentage (30) et l'affichage le multipliait par cent. Avant : « Tranche marginale
  (TMI) 3000 % ». Après : « Tranche marginale (TMI) 30 % ». `src/lib/baremes-ir.ts`
  n'est pas touché.

**C. La calculette s'imprime sur une page**

`@media print` à la fin de `src/styles/calculette.css` (servie à cette page seule ; le
reste de la feuille est sous `@media screen`). Retirés de la feuille imprimée :
l'en-tête, le pied, la bannière cookies, la bulle de chat (`#crisp-launcher`, et
`.crisp-client`, que le script de Crisp pose), les avis éphémères, le lien de retour, les
pastilles, l'accroche et l'aperçu du haut de page, l'appel à l'essai, la FAQ, le décor de
fin ; les fonds et les ombres. Restent le titre, les résultats et l'avertissement de fin.
Le formulaire, la barre collante et les boutons d'action portaient déjà `print:hidden`.
Résultats sur deux colonnes, corps à 13,5 px pour 16, fiches jamais coupées
(`break-inside`), libellés jamais tronqués ; ne s'impriment pas les boutons de copie, les
flèches des plis et la ligne de liens « Pas sûr d'une case ? ».

Mesuré par `page.pdf()` de Chromium (A4, marges de 10 mm, sans puis avec les fonds) sur
29 cas : les quatorze exemples, plis de détail fermés puis ouverts (ce que fait le bouton
« Imprimer »), et la page sans saisie.

| | Avant | Après |
|---|---|---|
| Pages (A4, état par défaut ou plis de détail ouverts) | 4 (16 cas), 5 (10 cas), 6 (3 cas) | 1 (29 cas) |
| En-tête, pied, FAQ, appel à l'essai imprimés | 29 cas | 0 |
| Bannière cookies ou bulle de chat, répétée sur chaque page | 29 cas | 0 |
| Éléments collants ou fixes sous `@media print` | 2 par cas | 0 |

Hors de ces 29 cas (relevé de la relecture, § 9.et) : avec l'interrupteur « Tout
afficher », deux pages en A4 pour les exemples 11 et 12, deux en format Letter pour les
exemples 7 à 12 ; rien n'est coupé ni perdu, la feuille passe à la page suivante. Une
bulle d'aide restée ouverte s'imprimait par-dessus les résultats : corrigé en § 9.et.

Rien de coupé : les 965 nombres des résultats lus à l'écran sont dans le texte du PDF,
sauf le « (2042 » de la ligne de liens retirée ; sous `emulateMedia({ media: 'print' })`,
à la largeur utile d'un A4, aucun élément des résultats ne déborde et aucun n'est rogné.

**Preuves communes**

- Calculs : trois cas du simulateur en calcul local, un cas PAMC (même état d'erreur) et
  deux exemples de la calculette : texte de l'îlot identique au caractère près à celui du
  build de `main` (`ref-dist-7`). Les deux nombres de B sont dans une bulle et dans un pli
  fermés pendant ce relevé.
- Mesure : sur les trois parcours de § 9.er, 17, 18 et 12 événements, même suite, mêmes
  noms, 2 827 propriétés comparées, identiques au build d'avant ; contre `main`, les deux
  écarts de § 9.er et rien d'autre. Un écart nouveau, sur un appareil tactile seulement :
  dans la chaîne d'éléments du clic capturé sur une aide, le bouton porte
  `aria-expanded` (parcours au doigt relevé avant et après : 8 événements des deux côtés,
  394 propriétés comparées, seul `$elements_chain` diffère sur les quatre clics).
- HTML : contre le build d'avant, 65 fichiers identiques à l'octet, 6 aux noms de fichiers
  près (simulateur, calculette, le guide et ses trois pages filles), aucun autre écart :
  aucun attribut n'est ajouté au HTML du build (`aria-expanded`, `role` et `tabindex`
  arrivent après le montage). Contre `ref-dist-7` : titres, metas, liens, JSON-LD,
  `data-ph`, `data-track`, texte identiques sur 71 fichiers ; seuls écarts, ceux de
  § 9.er. Feuille commune inchangée (`_astro_assets.QWDU2rDT.css`). `tooltip.*.js` passe
  de 17,8 à 18,9 Ko gzip (50,1 à 53,3 Ko bruts).
- `npm run build` : 70 pages ; `verify-site.mjs` : 0 erreur (68 pages, 5 431 liens).
- Hydratation (scripts de § 9.er rejoués sur le build final, cinq chargements à froid) :
  rien ne recule. En 4G lente, hydraté puis clic pris : `/simulateur` 3 079 → 3 071 et
  3 169 → 3 154 ms ; calculette 2 994 → 2 998 et 3 134 → 3 137 ; recherche du guide
  2 836 → 2 814 et 4 102 → 4 051 ; boussole au saut immédiat 4 086 → 4 076 et
  4 132 → 4 110. Sans bridage, la boussole au saut immédiat prend le clic à 332 ms
  contre 296, les autres scénarios à 30 à 90 ms de moins : bruit de la machine, dans les
  deux sens. JS avant l'hydratation : 1 Ko de plus (`tooltip.*.js`).
- Lighthouse mobile, médiane de trois passes (performance, accessibilité, bonnes
  pratiques, SEO) : accueil 99, 100, 96, 100, LCP 1 053 ms ; `/simulateur` 99, 100, 96,
  100, LCP 1 202 ms, blocage 128 ms ; article 98, 100, 96, 100, LCP 2 402 ms ;
  calculette 96, 100, 96, 100, LCP 1 203 ms, blocage 210 ms.

**Limites, non testé**

- Un vrai téléphone, une vraie tablette, Safari sur iOS : le toucher est émulé dans
  Chromium (le pilote de WebKitGTK ne le simule pas). Safari ne donne pas le focus à un
  bouton touché : la bulle y est ouverte par le clic seul, chemin couvert par l'essai du
  portable tactile, pas par un essai dans Safari.
- Un lecteur d'écran : l'arbre d'accessibilité et la zone d'annonce sont lus par script,
  aucune synthèse vocale n'a été écoutée.
- La branche PAMC du simulateur (fonction Supabase injoignable d'ici) : ses bulles ne
  sont pas affichées, donc pas essayées.
- L'impression : PDF de Chromium seulement (pas Firefox, pas Safari, pas d'imprimante) ;
  la bulle de chat de Crisp une fois ouverte (script extérieur, injoignable d'ici) est
  visée par son nom de classe, sans essai.
- Firefox ; `npm run dev`.

**Fichiers**

`src/components/ui/tooltip.tsx`, `src/components/simulateur/RegimeComparisonCards.tsx`,
`src/components/calculette/IrEstimateCard.tsx`, `src/styles/simulateur.css`,
`src/styles/calculette.css`, `src/styles/guide.css`, `CLAUDE.md`.

### 9.et Phase 7 : corrections après les trois relectures (12 novembre 2026)

Trois relecteurs indépendants (fonctionnement ; invariance et performance ; attaque) ont
repris § 9.er et § 9.es : 25 constats. Chacun a été rejoué contre le code et le build
avant d'agir. Le résultat tient en trois lignes : une régression au clavier est corrigée ;
trois des quatre gains de chargement de § 9.er sont **retirés**, parce qu'ils se payaient
ailleurs (première peinture, police, première liste de résultats) ; restent l'état
d'attente, la boussole hydratée un écran plus tôt, et tout § 9.es, avec quelques
corrections.
`origin/main` n'a pas avancé (`771de40`). Aucun calcul touché, aucun mot ajouté, aucune
dépendance.

**1. Bloquant, corrigé : le clavier sautait les outils (`interactivity: inert`)**

Un îlot `client:visible` qui n'est pas encore entré dans la fenêtre garde `ssr` sans
limite de temps. La règle `interactivity: inert` de l'état d'attente s'y appliquait donc
aussi longtemps, page au repos, sans panne ni réseau lent : dans Chrome et Edge 135 et
suivants, Tab sautait tous ses contrôles, qui sortaient aussi de l'arbre d'accessibilité
et de la recherche dans la page. Sur `main`, Tab entrait dans l'îlot, ce qui le faisait
défiler et s'hydrater.

Rejoué (`tab.cjs`, Chromium 153, page chargée, 2,5 s d'attente, 70 Tab ; arrêts dans un
îlot, puis boutons, listes et champs de l'arbre d'accessibilité) :

| Page, fenêtre | `main` | Build d'avant (`0be0b5c`) | Corrigé |
|---|---|---|---|
| `/simulateur`, 683 × 316, 640 × 360 et 320 × 568 | 19 arrêts dès le 4e Tab ; 14 boutons, 5 listes, 3 champs | 14 arrêts, le premier au 57e Tab (après un tour de page) ; 3 boutons, 0 liste, 0 champ | 19 dès le 4e ; 14, 5, 3 |
| calculette, 640 × 360 | 58 arrêts ; 33, 3, 22 | 21 arrêts ; 3, 0, 0 | 58 ; 33, 3, 22 |
| `/guide-declarations`, 720 × 450 et 390 × 844 | 17 arrêts ; 23 boutons, 2 champs | 1 arrêt ; 3 boutons, 0 ou 1 champ | 17 ; 23, 2 |
| `/guide-declarations`, 1 366 × 633 | 17 arrêts dès le 18e Tab ; 24 boutons, 2 champs | 16 arrêts, le premier au 24e (champ de recherche sauté) ; 4 boutons, 0 champ | 17 dès le 18e ; 24, 2 |
| `/simulateur` et calculette, 1 440 × 900 | 19 et 54 arrêts | 19 et 54 | 19 et 54 |

Correction : la ligne `astro-island[ssr] … { interactivity: inert; }` est retirée des trois
feuilles. Le pointeur reste neutralisé (`pointer-events: none`). Le clavier redevient
celui de `main` pendant l'attente : Tab atteint les contrôles, une saisie y est effacée à
l'hydratation, « Entrée » dans un champ du simulateur envoie le formulaire en natif.
C'était déjà le cas dans Safari et Firefox, qui ne lisent pas cette propriété. La même
correction règle la boussole sautée quand Tab est tenu (autre constat).

**2. Les préchargements sont retirés**

Le brief le prévoyait : « un préchargement qui ferait reculer le LCP […] se retire ».
§ 9.er avait conclu, en HTTP/1.1 local et sur un scénario qui clique pendant le
chargement, à un recul de 0,02 à 0,06 s de la première peinture. Deux relecteurs ont
mesuré plus, et autrement ; rejoué ici.

*HTTP/2 local* (serveur Node sur TLS, même bridage de Chromium, chargement sans aucun
geste, trois chargements à froid par côté, en alternance ; `passif.cjs`). Première
peinture (le LCP lui est égal) / police reçue / îlot hydraté, en millisecondes :

| Page, réseau | `main` | Build d'avant | Build d'avant, liens retirés |
|---|---|---|---|
| `/simulateur`, 4G lente | 1 600 / 1 556 / 3 938 | 1 816 / 2 424 / 2 592 | 1 592 / 1 542 / 3 919 |
| `/simulateur`, 4G rapide | 500 / 424 / 1 093 | 688 / 598 / 681 | 500 / 425 / 1 091 |
| calculette, 4G lente | 1 604 / 1 549 / 3 681 | 1 800 / 2 399 / 2 602 | 1 612 / 1 550 / 3 735 |
| calculette, 4G rapide | 508 / 424 / 977 | 700 / 585 / 698 | 512 / 428 / 979 |

La première peinture et le LCP reculaient de 0,2 s sur les deux réseaux. En 4G rapide,
la première peinture tombait au moment exact de l'hydratation (688 et 681 ms, 700 et
698) : les fichiers arrivés tôt, React hydratait avant le premier affichage et le
retenait. Ce n'est pas une affaire de priorités du serveur. En 4G lente, la police
arrivait 0,6 s après l'affichage (texte affiché dans la police de repli, puis changé).
Limite de l'essai : le bridage de Chromium ne modélise pas les priorités qu'un serveur
HTTP/2 applique ; le comportement de Vercel n'a pas pu être mesuré d'ici.

*HTTP/1.1 local* (relevés de la relecture, cinq chargements par côté, non rejoués ici) :
en 4G lente la police finissait à 1 565 puis 1 724 ms sur `/simulateur`, soit 0,13 à
0,2 s après la première peinture au lieu d'avant ; la mascotte du premier écran à 2 307
puis 3 274 ms ; sur la calculette à 390 px, le changement de police déplaçait le
formulaire (décalage de 0,123, voir « antérieurs ») ; `posthog-js` arrivait 0,5 à 1,5 s
plus tard, donc la page vue aussi ; en 2G (250 kbit/s), la première peinture reculait de
0,3 à 0,65 s. Lighthouse à bridage appliqué, en HTTP/2 : performance 96 puis 90 sur
`/simulateur`, 94 puis 88 sur la calculette. Le Lighthouse habituel (bridage simulé) ne
voit rien de tout cela : 98 des deux côtés.

Les variantes essayées par la relecture ne sauvent rien : liens en fin de `<head>`,
même résultat que dans le `<body>` ; `fetchpriority="low"`, première peinture gardée en
HTTP/1.1 mais gain réduit à 0,25 s, et aucun effet en HTTP/2. Le gain ne vient que d'un
départ plus tôt, donc en même temps que les feuilles de style et la police : il n'est
pas gratuit. Piste non essayée, pour qui voudrait y revenir : ne lancer les fichiers
qu'une fois les feuilles reçues (une directive d'hydratation à soi, qui pose les liens
depuis le script de l'îlot), mesuré sur un aperçu Vercel ; le gain attendu est de
l'ordre de celui de `fetchpriority="low"` en HTTP/1.1 (0,25 s en 4G lente).

Retiré : `src/lib/precharge-ilots.mjs`, son appel dans `astro.config.mjs`, les balises
`<template data-precharge-ilots>` des trois pages, le contrôle 5 de `verify-site.mjs`.

**3. `posthog-js` revient dans le graphe des îlots**

Sans les liens, l'en avoir sorti ne gagne rien : hydraté à 3 919 ms contre 3 938 sur
`main`, 1 091 contre 1 093, 3 735 contre 3 681, 979 contre 977 (tableau ci-dessus,
troisième colonne). La bibliothèque part quand même, par le script de `PostHog.astro`,
et prend la même part du débit ; la profondeur de la cascade ne change pas. Restaient ses
coûts : une file d'attente dont le contenu se perd si le visiteur part avant l'arrivée
de la bibliothèque, cinq propriétés d'état absentes de l'événement d'arrivée, un fichier
de plus sur les 70 pages (`analytics.*.js`, 166 octets), le nom du script de mesure
changé sur les 70 pages, un réglage de découpe dans la configuration. Une relecture a
aussi relevé 35 à 85 ms de temps de blocage de plus sur la calculette dans Lighthouse,
sans que ce soient les liens ni l'état d'attente.

Retiré : `src/lib/analytics.ts`, `src/components/PostHog.astro` et `astro.config.mjs`
sont de nouveau ceux de `main`, à l'octet. Conséquence : 65 fichiers HTML sur 71 sont
identiques à `main` à l'octet (1 avant) ; le relevé de mesure du simulateur et de la
calculette est identique à celui de `main` sans aucun écart ; Lighthouse sur la
calculette : 96 sur `main`, 98 ici, blocage 210 puis 178 ms (quatre passes alternées).

**4. Le moteur de recherche du guide redevient un import statique**

Chargé par `import()` après l'hydratation (§ 9.er, d), il laissait le champ prendre la
saisie plus tôt, mais demandait ses données un aller-retour plus tard. Avec les liens,
elles arrivaient en parallèle ; sans eux, la première liste de résultats reculait.
Mesuré sur le build sans les liens (`mesure-cr.cjs`, cinq chargements, 1 440 × 900,
champ hydraté / première liste) : sans bridage 318 / 444 ms sur `main`, 288 / 492 ;
4G rapide 1 160 / 1 217, puis 1 142 / 1 392 ; 4G lente 4 023 / 4 083, puis
3 798 / 4 828. En 4G lente, le champ gagnait 0,2 s et la liste en perdait 0,75 ; la
boussole, sur un saut immédiat, était prête à 5 051 ms au lieu de 4 573.

Retiré : `BoussoleSearchIsland.tsx` est de nouveau celui de `main` (son fichier du build
a la même empreinte), `rechercheGuide.ts` est supprimé. Les deux constats sur ce module
(rien ne s'affiche pendant qu'il charge ; rien ne se passe s'il ne charge pas) tombent
avec lui. Essayé avant de retirer : relancer `import()` à la frappe suivante ne
redemande pas le fichier dans Chromium (une seule demande réseau, l'échec est gardé).

**5. Ce qui reste de § 9.er**

- *La boussole hydratée un écran avant d'entrer dans la fenêtre*
  (`client:visible={{ rootMargin: "100%" }}`). Deux cas, selon la hauteur de la fenêtre
  (la boussole est à 1 752 px du haut de la page à 1 366 et 1 440 px de large, à
  2 797 px à 390).
  - *Fenêtre de moins de 876 px de haut* (portables courants, téléphones) : elle ne
    s'hydrate pas au chargement, mais un écran plus tôt pendant le défilement. Mesuré sur
    le vrai bouton « Trouver ma situation » du haut de page (défilement doux de 0,75 à
    0,95 s), cliqué 1,5 s après le chargement, trois chargements par côté en alternance
    (`saut.cjs`) ; boussole hydratée par rapport à l'arrêt du défilement, `main` puis
    build : à 1 366 × 768, 0,40 puis 0,49 s avant sans bridage, 0,05 puis 0,13 s avant
    en 4G rapide, 0,93 puis 0,83 s après en 4G lente ; à 390 × 844, 0,50 puis 0,60 s
    avant, 0,14 puis 0,25 s avant, 0,84 puis 0,72 s après. Gain : 0,1 s. Au chargement,
    rien ne change (à 390 × 844 en 4G lente : champ hydraté à 4 029 puis 4 013 ms,
    `posthog-js` à 4 171 puis 4 155).
  - *Fenêtre de 876 px de haut et plus* (1 440 × 900) : la boussole est à moins d'un
    écran du bas de la fenêtre, elle s'hydrate au chargement. Clic pris, compté depuis
    l'arrivée sur la boussole (`mesure-cr.cjs`, saut instantané), `main` puis build :
    saut après chargement 96 puis 9 ms sans bridage, 425 puis 9 en 4G rapide, 1 410
    puis 11 en 4G lente ; à la molette 4 puis 6, 205 puis 6, 1 147 puis 5. Sur un saut
    immédiat (avant la fin du chargement), rien ne change : 414 puis 401, 1 334 puis
    1 406, 4 573 puis 4 589. Son prix, payé au chargement : six fichiers de plus (35 Ko) ;
    le champ de recherche hydraté 0,02 à 0,05 s plus tard sans bridage et en 4G rapide
    (318 puis 371 ms et 1 160 puis 1 185 en cliquant pendant le chargement, première
    liste 444 puis 538 et 1 217 puis 1 234 ; sans geste, 244 puis 263 et 1 100 puis
    1 151) ; en 4G lente, 0,25 s plus tôt en HTTP/1.1 (4 007 puis 3 747) et 0,13 s plus
    tard en HTTP/2 (3 615 puis 3 745) ; `posthog-js`, donc la page vue, 0,12 s plus tard
    en 4G rapide et 0,3 s en 4G lente en HTTP/1.1 (950 puis 1 070 ms, 4 156 puis 4 456),
    sans écart en HTTP/2 (881 puis 859, 2 822 puis 2 789) ni sans bridage (331 puis
    263).
  Première peinture, police, mascotte : identiques dans tous les cas (tableaux plus
  bas). § 9.er écrivait « à 1 440 × 900 elle s'hydrate au chargement » sans dire que
  cela tient à la hauteur de la fenêtre. À valider par le propriétaire : c'est le seul
  réglage de chargement gardé ; il vaut 0,1 s sur la plupart des écrans, davantage sur
  un grand écran, à ce prix.
- *L'état d'attente*, sans `interactivity`. Trois réglages :
  - le trait n'apparaît qu'après 0,8 s (0,5 avant), en 0,25 s : quand l'hydratation
    tombait 0,5 à 0,7 s après l'affichage, il clignotait le temps de trois à huit images
    (relevé de la relecture). Relevé sur le build, image par image, trois chargements par
    cas (`trait.cjs`) : jamais affiché sans bridage ni en 4G rapide (hydraté 0,05 à
    0,17 s et 0,5 à 0,7 s après la première peinture), affiché 1,3 à 1,5 s en 4G lente ;
  - le glissement s'arrête après 25 passages (30 s), le trait reste, fixe. Il tournait
    sans fin : aussi pour un îlot hors de l'écran, et pour toujours si un fichier manque
    (360 recalculs de style en 6 s, relevé de la relecture). Vérifié en avançant
    l'horloge des animations : plus aucune en cours, fond uni ;
  - en contrastes forcés, le navigateur retirait le dégradé : le trait ne se voyait
    pas. Il prend la couleur du texte (`CanvasText`, `forced-color-adjust: none`), fixe.

**6. Petites corrections dans § 9.es**

- *Bulle « Zones exonérées »* (`simulateur.css`). La bulle porte `duration-300` : sa
  hauteur maximale, que Radix ne donne qu'après mesure, était animée, et la bulle
  dépassait encore du haut de la fenêtre pendant 0,3 s. `transition: none` sur
  `.sim.sim-bulle` (son entrée est une animation, pas une transition). Relevé image par
  image à 1 440 × 900 : haut à 16 px dès la première image, jamais au-dessus (73 images
  dans Chromium, 146 dans WebKit).
- *Impression de la calculette* (`calculette.css`). Une bulle d'aide ouverte s'imprimait
  par-dessus les résultats ; au doigt elle reste ouverte tant qu'on ne touche pas la
  page. `[data-radix-popper-content-wrapper]` rejoint la liste de ce qui ne s'imprime
  pas. Essayé : tablette tactile, appui sur une aide, `emulateMedia('print')` : bulle
  en `display: none` ; de retour à l'écran, elle est là.
- *« Une page dans les 29 cas »* (§ 9.es) valait pour l'état par défaut et les plis de
  détail ouverts, en A4. Avec « Tout afficher », deux pages en A4 pour les exemples 11
  et 12, deux en Letter pour les exemples 7 à 12 (relevé de la relecture) : phrase
  corrigée en § 9.es et dans CLAUDE.md, pas de changement de code.

**7. Constats notés, non corrigés**

Antérieurs, identiques sur `main`, hors du périmètre du brief (relevés de la relecture,
non rejoués ici) :

- Calculette à 390 px, cases remplies : la fiche « Cadre 8 » déborde de la fenêtre, les
  deux aides « ? » de DE et DB sortent à droite (421 à 465 px dans une fenêtre de 390)
  et ne peuvent être ni touchées ni survolées ; la liste « Profil d'exercice » dépasse
  de 37 px. Le « 46 aides sur 46 à 390 px » de § 9.es vaut pour le parcours essayé
  (profils, régimes, exemples), pas pour cet état : 54 sur 56 au doigt.
- Au clavier, une bulle sur quatre environ s'ouvre au focus puis se referme aussitôt :
  Tab fait défiler la page, et Radix ferme la bulle au défilement (simulateur à
  1 024 px : 21 sur 73, sur `main` comme sur le build). Le « focus clavier : 130 sur
  130 » de § 9.es compte l'ouverture, pas la tenue.
- Calculette sous 412 px : la ligne de pastilles du haut de page ne passe pas à la ligne
  au même endroit dans la police de repli. Quand la police arrive après l'affichage, le
  formulaire se déplace (décalage de 0,123). Sur `main` comme ici, la police arrive
  avant ou avec la première peinture dans tous les cas mesurés (rejoué : décalage à
  1 614 puis 1 607 ms pour une première peinture à 1 612 puis 1 608) : le décalage est
  compté, pas vu.
- Avant l'hydratation, hors pointeur : Tab atteint le champ, la saisie est effacée,
  « Entrée » envoie le formulaire du simulateur en natif et recharge la page (tous
  navigateurs désormais, comme sur `main`). Piste sans script, non essayée :
  `method="dialog"` sur le `<form>` du simulateur (hors d'un `<dialog>`, l'envoi natif
  ne fait rien). Non retenue ici : attribut de plus dans le HTML et dans la chaîne
  d'éléments de chaque clic mesuré dans le formulaire, non essayable dans Firefox.

À valider par le propriétaire (texte à écrire) :

- JavaScript coupé, ou fichier JS qui ne charge jamais : le visiteur voit le formulaire,
  le trait (qui glisse 30 s, puis reste), un curseur d'attente, sans un mot. Proposé en
  § 9.er, toujours non fait : une phrase et un lien de rechargement après une dizaine de
  secondes, et une ligne `<noscript>`.

Sans objet depuis les retraits : `posthog-js` plus tardif sur les pages d'outils ; le
fichier `analytics.*.js` de plus sur les 70 pages ; les 37 Ko et 8 requêtes de
préchargement de la boussole pour tous (restent 35 Ko dans une fenêtre haute, voir 5) ; la
simulation non comptée si le visiteur part avant l'arrivée de `posthog-js` ; les 15
fichiers téléchargés pour rien sans JavaScript ; les noms de fichiers à empreinte
périmés de § 9.er (ils datent du commit `72254ed`, c'est dit en tête de § 9.er).

**Tableau avant / après, build final** (`mesure-cr.cjs`, médianes de cinq chargements à
froid, Chromium, 1 440 × 900, millisecondes ; référence puis build, non alternés)

| Page | Réseau | 1re peinture | Hydraté | Clic pris | Fenêtre morte |
|---|---|---|---|---|---|
| `/simulateur` | sans bridage | 132 → 156 | 197 → 190 | 266 → 280 | 134 → 124 |
| `/simulateur` | 4G rapide | 520 → 552 | 1 225 → 1 212 | 1 290 → 1 295 | 770 → 743 |
| `/simulateur` | 4G lente | 1 536 → 1 548 | 3 873 → 3 868 | 3 944 → 3 961 | 2 408 → 2 413 |
| calculette | sans bridage | 128 → 152 | 194 → 194 | 312 → 352 | 184 → 200 |
| calculette | 4G rapide | 540 → 548 | 1 102 → 1 113 | 1 222 → 1 269 | 682 → 721 |
| calculette | 4G lente | 1 560 → 1 564 | 3 875 → 3 858 | 4 011 → 4 007 | 2 451 → 2 443 |
| guide, recherche | sans bridage | 140 → 172 | 318 → 371 | 444 → 538 | 304 → 366 |
| guide, recherche | 4G rapide | 608 → 628 | 1 160 → 1 185 | 1 217 → 1 234 | 609 → 606 |
| guide, recherche | 4G lente | 1 636 → 1 648 | 4 023 → 3 782 | 4 083 → 3 892 | 2 447 → 2 244 |
| guide, boussole (saut immédiat) | sans bridage | 144 → 160 | 313 → 329 | 414 → 401 | 270 → 241 |
| guide, boussole (saut immédiat) | 4G rapide | 604 → 620 | 1 301 → 1 356 | 1 334 → 1 406 | 730 → 786 |
| guide, boussole (saut immédiat) | 4G lente | 1 636 → 1 648 | 4 532 → 4 561 | 4 573 → 4 589 | 2 937 → 2 941 |
| guide, boussole (saut après chargement) * | sans bridage | 140 → 160 | 50 → −1 596 | 96 → 9 | 96 → 9 |
| guide, boussole (saut après chargement) * | 4G rapide | 580 → 628 | 405 → −1 448 | 425 → 9 | 425 → 9 |
| guide, boussole (saut après chargement) * | 4G lente | 1 632 → 1 648 | 1 380 → −1 554 | 1 410 → 11 | 1 410 → 11 |
| guide, boussole (molette, 3 000 px/s) * | sans bridage | 136 → 176 | −205 → −2 437 | 4 → 6 | 4 → 6 |
| guide, boussole (molette, 3 000 px/s) * | 4G rapide | 596 → 624 | 161 → −2 265 | 205 → 6 | 205 → 6 |
| guide, boussole (molette, 3 000 px/s) * | 4G lente | 1 632 → 1 648 | 1 134 → −2 416 | 1 147 → 5 | 1 147 → 5 |

\* Comptés depuis l'arrivée du visiteur sur la boussole (négatif : prête avant).

Le simulateur et la calculette répondent quand ils répondaient sur `main` : la fenêtre
morte n'est pas raccourcie (0,1 à 0,2 s sans bridage, 0,7 s en 4G rapide, 2,4 s en 4G
lente), elle est signalée. Seule la boussole gagne.
La première peinture de ce tableau sort 0,01 à 0,04 s plus haute côté build : les deux
côtés y sont mesurés l'un après l'autre, à 25 minutes d'écart. En alternance et sans
geste, elle ne bouge pas : sans bridage 136 puis 132 ms (`/simulateur`), 148 puis 136
(calculette), 156 puis 144 (guide), cinq chargements par côté ; en 4G, tableau suivant.

**Chargement sans geste, build final contre `main`** (`passif.cjs`, trois chargements
par côté, en alternance ; première peinture / police / hydraté, millisecondes)

| Page, réseau | HTTP/1.1 | HTTP/2 |
|---|---|---|
| `/simulateur`, 4G lente | 1 624 / 1 565 / 3 876 → 1 624 / 1 566 / 3 879 | 1 600 / 1 548 / 3 926 → 1 604 / 1 548 / 3 920 |
| `/simulateur`, 4G rapide | 496 / 420 / 1 178 → 496 / 421 / 1 182 | 500 / 424 / 1 101 → 512 / 427 / 1 114 |
| calculette, 4G lente | 1 604 / 1 566 / 3 941 → 1 628 / 1 565 / 3 929 | 1 608 / 1 541 / 3 686 → 1 608 / 1 555 / 3 696 |
| calculette, 4G rapide | 516 / 423 / 1 083 → 516 / 421 / 1 095 | 520 / 424 / 984 → 524 / 428 / 983 |
| guide, 4G lente | 1 636 / 1 882 / 4 007 → 1 636 / 1 882 / 3 747 | 1 680 / 1 648 / 3 615 → 1 680 / 1 647 / 3 745 |
| guide, 4G rapide | 592 / 452 / 1 100 → 608 / 451 / 1 151 | 600 / 445 / 1 054 → 592 / 443 / 1 083 |

Mascotte du premier écran : 2 324 puis 2 323 ms (`/simulateur`, 4G lente, HTTP/1.1),
2 223 puis 2 214 (guide). Décalage de mise en page : le même des deux côtés, partout.

**Lighthouse mobile** (bridage simulé, médiane de quatre passes, côtés alternés ;
performance, LCP, temps de blocage ; `main` puis build)

| Page | `main` | Build |
|---|---|---|
| `/` | 100 · 1 052 ms · 50 ms | 100 · 1 054 ms · 20 ms |
| `/simulateur` | 98 · 1 202 ms · 134 ms | 98 · 1 202 ms · 154 ms |
| `/blog/frais-pros-medecin-liberal-2026` | 96 · 2 701 ms · 38 ms | 96 · 2 702 ms · 27 ms |
| `/guide-declarations/calculette` | 96 · 1 202 ms · 210 ms | 98 · 1 202 ms · 178 ms |
| `/guide-declarations` | 95 · 2 107 ms · 138 ms | 96 · 2 102 ms · 136 ms |

Accessibilité 100, bonnes pratiques 96, SEO 100 sur les cinq pages, des deux côtés ;
décalage de mise en page nul. Le temps de blocage varie de 125 à 230 ms d'une passe à
l'autre sur une même page : aucun écart au-delà de ce bruit. Poids et requêtes : ceux de
`main` à 2 Ko près.

**Ajouts au HTML, liste à jour** (remplace celle de § 9.er ; `invariance7.py`, build
contre `ref-dist-7`)

- **65 fichiers HTML sur 71 identiques à `main` à l'octet.**
- **5 aux noms de fichiers près** : `/simulateur` (feuille `simulateur.*.css`, fichier de
  l'îlot `SimulateurApp.*.js`), `/guide-declarations/calculette` (`calculette.*.css`,
  `CalculetteApp.*.js`), les trois pages filles du guide (feuille `QuestionCard.*.css`).
- **1 avec un autre écart**, `/guide-declarations` : la feuille, le fichier
  `BoussoleWizard.*.js`, et l'attribut `opts` de l'`<astro-island>` de la boussole,
  `{"name":"BoussoleWizard","value":true}` →
  `{"name":"BoussoleWizard","value":{"rootMargin":"100%"}}`.
- Aucun `<link rel="modulepreload">`, aucun autre attribut. `<title>`, metas, canonique,
  titres (1 475), liens (7 272), JSON-LD (257), `data-ph` (2 327), `data-track` (436),
  images et texte (193 420 mots) identiques page par page.
- Fichiers : 29 fichiers JS, comme sur `main` ; sept changent de nom (`SimulateurApp`,
  `CalculetteApp`, `BoussoleWizard`, `RegimeComparisonCards`, `individualizedTax`, `site`,
  `tooltip`), avec les trois feuilles ci-dessus ; les autres sont ceux de `main`, dont
  `BoussoleSearchIsland`, le script de mesure et `posthog-js`. Feuille commune inchangée (`_astro_assets.QWDU2rDT.css`).

**Mesure (PostHog)**, relevé de § 9.er rejoué (`releve-mesure.cjs`, `main` deux fois puis
build) : simulateur 17 événements, 1 232 propriétés comparées, identique ; calculette
18 événements, 812 propriétés, identique ; guide 12 événements, 578 propriétés, un seul
écart : dans la chaîne d'éléments de quatre clics capturés dans la boussole, l'attribut
`opts` de `<astro-island>` (ci-dessus). Les deux écarts de § 9.er sur l'événement
d'arrivée n'existent plus. Reste celui de § 9.es, sur un appareil tactile seulement
(`aria-expanded` dans la chaîne d'éléments du clic sur une aide).

**Preuves, build final**

- `npm run build` : 70 pages ; `node scripts/verify-site.mjs` : 0 erreur (68 pages,
  5 388 liens : les 43 liens de préchargement en moins). Le build final est identique à
  l'octet à celui qui a été mesuré.
- Calculs : trois cas du simulateur en calcul local, un cas PAMC (même état d'erreur des
  deux côtés) et deux exemples de la calculette, identiques au caractère près à
  `ref-dist-7`.
- Points touchés, Chromium (`points.cjs`, 20 contrôles, aucun échec) : bulle « Zones
  exonérées » image par image ; recherche du guide (« csg », 10 résultats) ; état
  d'attente sur les trois pages, JS de l'îlot retenu puis relâché (trait invisible à
  0,45 s, visible à 1,35 s, curseur d'attente, un clic ne donne pas le focus et rien
  n'est saisi, plus rien après l'hydratation) ; contrastes forcés ; moins de mouvement ;
  arrêt du glissement après 30 s ; impression avec une bulle épinglée au doigt.
- WebKitGTK (`wk-points.py`, 12 contrôles, aucun échec) : bulle « Zones exonérées »
  image par image ; état d'attente sur les trois pages (îlot privé de son fichier) :
  curseur, pointeur neutralisé, trait visible, un clic puis une frappe ne saisissent
  rien, Tab atteint les contrôles (17, 46 et 17 arrêts en 60 Tab) ; recherche du guide.
- Aides au doigt, scripts de § 9.es rejoués sur le build final (Chromium tactile) :
  simulateur à 1 024 px 83 aides sur 83, calculette à 390 px 46 sur 46, boussole à
  390 px 1 sur 1 ; chacune s'ouvre à l'appui, tient, se ferme au second appui, à l'appui
  ailleurs et à Échap, et reste dans la fenêtre. À la souris et au clavier, simulateur à 1 440 px : 83 sur 83
  (survol, clic, sortie, focus, Échap, Tab), comme en § 9.es.
- Clavier, les dix cas du tableau du point 1 : arrêts et arbre d'accessibilité égaux à
  ceux de `main`.
- Hydratation dans WebKitGTK (`mesure-wk.py`, sans bridage, cinq chargements, fenêtre de
  1 440 × 862 ; première peinture / hydraté / clic pris, `main` puis build) :
  `/simulateur` 358 / 498 / 700 → 346 / 473 / 705 ; calculette 326 / 443 / 806 →
  365 / 499 / 834 ; recherche du guide 1 004 / 1 129 / 1 365 → 904 / 1 042 / 1 250 ;
  boussole au saut immédiat, hydratée à 1 218 → 1 075 ms ; au saut après chargement,
  141 ms après l'arrivée contre 171 (fenêtre de 862 px : pas hydratée au chargement) ;
  à la molette, 1 417 ms avant l'arrivée contre 458. Le pilote met 0,25 à 0,6 s par
  clic : « clic pris » y est grossier. Écarts de 0,05 s dans les deux sens : bruit.

**Limites, non testé**

- Vercel : rien n'y a été mesuré. Les deux protocoles sont essayés en local, réseau
  bridé par Chromium, qui ne modélise pas les priorités d'un serveur HTTP/2.
- WebKit : sans bridage ; WebKitGTK n'est ni Safari ni un iPhone ; son pilote ne simule
  pas le toucher (essayé dans Chromium émulé) et n'imprime pas (l'impression est
  essayée dans Chromium seul).
- Firefox ; un vrai téléphone ; un lecteur d'écran (l'arbre d'accessibilité est lu par
  script) ; `npm run dev` ; la branche PAMC du simulateur avec la fonction Supabase.
- Les relevés repris des relecteurs et non rejoués ici sont dits tels dans le texte.
- Scripts et relevés : dossier de travail `phase7/corrections/`, hors dépôt.

**Fichiers**

Retirés ou rendus à `main` : `src/lib/precharge-ilots.mjs`,
`src/components/guide/rechercheGuide.ts`, `src/lib/analytics.ts`,
`src/components/PostHog.astro`, `astro.config.mjs`, `scripts/verify-site.mjs`,
`src/pages/simulateur.astro`, `src/pages/guide-declarations/calculette.astro`,
`src/components/guide/BoussoleSearchIsland.tsx`. Modifiés :
`src/pages/guide-declarations/index.astro`, `src/styles/simulateur.css`,
`src/styles/calculette.css`, `src/styles/guide.css`, `CLAUDE.md`.

**Dernier réglage avant la demande de fusion : la marge de la boussole est retirée.**
`<BoussoleWizard client:visible={{ rootMargin: "100%" }} />` redevient
`<BoussoleWizard client:visible />`, comme sur `main`. Raison : le gain n'existait que dans
une fenêtre de 876 px de haut et plus (boussole prête à l'arrivée, 1,4 s gagnée en 4G
lente), et le contrôle final a mesuré, sur un réseau à 1,6 Mbit/s et 150 ms de latence, un
champ de recherche prêt 0,55 s plus tard (1,49 s puis 2,04 s, cinq chargements sur cinq) ;
dans une fenêtre plus basse, ni gain ni perte. Un gain qui dépend de l'écran et coûte
ailleurs ne se garde pas. Conséquences : l'attribut `opts` de l'`<astro-island>` de la
boussole est celui de `main` (plus d'écart dans le HTML de `/guide-declarations` ni dans la
chaîne d'éléments des clics mesurés), les 35 Ko de la boussole ne se chargent plus qu'à
son approche, et tout ce que cette entrée et § 9.er disent de cette marge décrit un essai
retiré. La boussole reste neutralisée sans trait d'attente tant qu'elle n'est pas hydratée.

### 9.ew Barres collantes du guide et de la calculette : le focus ne fait plus remonter la page (13 novembre 2026)

Numéro : la demande renvoie à un § 9.ev (« Vu en passant, non corrigé ») et à un en-tête
tenu à la fenêtre (`position: fixed`). Ni l'un ni l'autre n'est sur cette branche ni sur
`main` (dernière entrée : § 9.et ; l'en-tête y est encore `position: sticky`). Les numéros
9.eu et 9.ev sont laissés à ce travail-là. Aucun contenu touché : deux feuilles de style.

**Le défaut**

La barre de recherche de `/guide-declarations` (`.gd-rech`, collée à 70 px) et la barre
d'outils de la calculette (`.calc-barre`, collée à 76 px à partir de 640 px) sont dans le
flux et suivent la fenêtre. Leurs contrôles sont dans la bande que `scroll-padding-top` de
`<html>` réserve en haut (146 px et 140 px). À tout focus qui fait défiler, le navigateur
cherche à sortir le contrôle de la bande ; la barre suit, il n'y arrive pas.

Relevé sur le build de `main`, page à mi-hauteur :

| | Chromium | WebKitGTK 2.52 |
|---|---|---|
| guide, `focus()`, Tab ou Maj+Tab sur le champ, 390 px | −393 px | −54 px |
| guide, même essai, 1440 px | −421 px | −54 px |
| guide, Tab ou `focus()` sur « Effacer la recherche » | −393 / −421 px | −66 px |
| guide, Tab vers le premier résultat (barre resserrée) | −4 px | −4 px |
| guide, **clic de souris dans le champ, puis saisie** | 0 puis −270 px | −270 px à la saisie |
| calculette, `focus()`, Tab ou Maj+Tab sur un bouton, 820 px | −558 px | −60 px |
| calculette, même essai, 1440 px | −418 px | −60 px |
| calculette, **exemple choisi dans le menu**, à la souris comme au clavier | −558 / −418 px | −60 px (clavier, barre tout juste collée) |

Les deux lignes en gras n'étaient pas dans la demande : le défaut ne demandait pas le
clavier. La saisie fait défiler pour montrer le curseur ; à la fermeture du menu « Charger
un exemple », Radix rend le focus au bouton par `focus()`. Chromium recentre le contrôle
(d'où 400 px), WebKit l'aligne au plus près (d'où 60 px). Avec `scroll-behavior: auto`
forcé par le script, Chromium fait deux sauts sur le champ (−786 et −842 px) ; avec le
défilement doux du site, un seul : les chiffres de la demande.

**Le correctif**

`src/styles/guide.css` :

```css
html:has(.da-fond):has(.gd-rech-champ > :focus) { scroll-padding-top: 70px; }
html:has(.da-fond):has(.gd-rech-liste :focus) { scroll-padding-top: 134px; }
```

`src/styles/calculette.css`, dans le `@media (min-width: 640px)` de la barre :

```css
html:has(.da-fond):has(.calc-barre :focus) { scroll-padding-top: 76px; }
html:has(.calc-barre :focus) .calc .calc-colonne { scroll-margin-top: 96px; }
```

Tant que le focus est dans la barre, la bande s'arrête au `top` de la barre (le bas de la
pastille de l'en-tête) : le contrôle n'y est plus, rien ne défile. Dès que le focus sort,
la règle ne s'applique plus et la bande entière revient avant le défilement suivant. Les
valeurs sont celles du `top` de chaque barre, sans `env(safe-area-inset-top)` puisque ces
`top` n'en ont pas : la bande ne peut pas repasser sur le contrôle. Poids : (0,3,1), plus
que la règle de la bande (0,2,1) et que celle de `da.css` (0,1,1), quel que soit l'ordre
des feuilles (CLAUDE.md, « Ordre des feuilles sur les pages d'outils »).

Deux défilements par script partent pendant que le focus est encore dans la barre, d'où
les deux autres règles :

- Calculette, « Voir mes résultats ↓ » (bouton de la barre, sous 1 024 px) appelle
  `scrollIntoView({ block: 'start' })` sur `#calculette-results`. Sans compensation, la
  fiche s'arrêtait à 108 px, sous la barre, au lieu de 172. La fiche reprend donc en marge
  les 64 px retirés à la bande (32 + 64) sous la même condition : 172 px, au clic comme à
  la touche Entrée, dans les deux moteurs.
- Guide, choix d'un résultat : `navigate()` appelle `scrollIntoView({ block: 'center' })`
  100 ms après le clic, alors que le bouton du résultat a encore le focus (la liste ne
  disparaît qu'après les 150 ms du délai de saisie). Avec une seule règle
  `:has(.gd-rech :focus)` à 70 px, premier essai, la cible se centrait 38 px plus haut.
  Sur un résultat, la bande s'arrête donc au bas de la barre resserrée (134 px = 70 + 8 +
  48 + 8), juste au-dessus de la liste : le premier résultat (à 142 px) n'y est plus, et
  la cible se centre 6 px plus haut qu'avant (centre à 493 px au lieu de 499 à 390 px de
  large, 521 au lieu de 527 à 1440). C'est le seul écart avec `main` sur le contenu.

Piste écartée : une marge de défilement sur les contrôles. Ils sont tout entiers dans la
bande ; une `scroll-margin-top` négative qui les en sortirait dépasse leur hauteur et
donne un rectangle retourné, dont le traitement n'est pas défini. Décaler le rectangle
(marge négative en haut, positive en bas) le garde entier, mais fait défiler la page
quand la barre, pas encore collée, est dans les 68 px du bas de la fenêtre, et décale
les résultats dans le défilement propre de leur liste. Non retenue.

**Relevé après correctif**

Chromium 390×844, 820×1180, 1440×900 ; WebKitGTK aux mêmes tailles (390 et 820 dans un
`<iframe>` de même origine, largeur réelle mesurée, `document.hasFocus()` vrai et `:focus`
appliqué). Page à mi-hauteur, barre collée ; calculette à 390 px : barre dans le flux,
placée dans la fenêtre.

- Les deux barres, chaque contrôle, `focus()`, Tab et Maj+Tab : **0 px** partout, dans les
  deux moteurs. Guide : champ, « Effacer la recherche », premier et deuxième résultats.
  Calculette : « Voir mes résultats ↓ », « Charger un exemple », « Réinitialiser ».
- Saisie dans le champ après un clic de souris : 0 px. Exemple choisi dans le menu, à la
  souris et au clavier : 0 px au retour du focus.
- Contenu, identique à `main` ligne pour ligne (29 essais sur 47 dans Chromium, 27 sur 41
  dans WebKit ; les autres sont les corrections ci-dessus, l'écart de 6 px et, dans
  WebKit, le retour légitime du bouton décrit plus bas, 32 px plus bas qu'avant) :
  ancres `#profils`, `#regle-RO-014`, `#case-5HQ` à 146 et 154 px ; clic sur un lien
  d'ancre, le focus étant dans le champ : 146 px ; Tab qui sort de la barre vers un
  contrôle placé à 100 px du haut, sous la barre : il est ramené à 146 px (guide) et
  140 px (calculette), de même par `focus()` ; Maj+Tab : positions identiques.
- Build : seules les deux feuilles changent (`QuestionCard.*.css`, 49 798 → 49 939
  octets, et `calculette.*.css`, 29 955 → 30 094), quatre règles ajoutées, le reste
  identique octet pour octet. La feuille commune garde son nom. Le HTML des cinq pages
  qui lient ces feuilles (hub, trois pages filles, calculette) est identique au nom de la
  feuille près ; les 65 autres pages sont identiques. `verify-site.mjs` : 0 erreur.

**Pour qui refait ces mesures**

- `locator.click()` de Playwright fait défiler lui-même l'élément hors de la bande avant
  de cliquer : sur un bouton de la barre il reproduit le saut à lui seul, correctif ou
  non. Cliquer par coordonnées (`page.mouse.click`).
- WebKit n'ancre pas le défilement. Charger un exemple raccourcit le formulaire de 580 à
  950 px : page à mi-hauteur, le bouton sort de l'écran (relevé à −265 et −376 px) et le
  retour du focus le ramène à sa place, à 80 px (la page s'arrête 32 px plus bas
  qu'avant : centrage sous une bande de 76 px au lieu de 140). Ce défilement-là est
  légitime ; le défaut se mesure barre tout juste collée (−60 px avant, 0 px après).
- Les voisins de tabulation se cherchent parmi les éléments qui prennent réellement le
  focus : les liens du menu de l'en-tête ont une boîte mais ne le prennent pas.

**Limites, non testé**

- Firefox, un vrai Safari, un iPhone. WebKitGTK n'est pas Safari : au clic de souris,
  Safari ne donne pas le focus à un bouton ; la bande y reste alors entière, ce qui est
  le comportement d'avant.
- Sans `:has()` (Safari avant 15.4, Firefox avant 121), ces règles sont ignorées comme
  l'était déjà la règle de la bande : rien ne change.
- Un futur défilement par script lancé depuis un contrôle d'une de ces barres part avec la
  bande réduite : sa cible reprend la différence en marge, comme `.calc-colonne`.
- L'en-tête n'est pas corrigé sur cette branche : ses liens, dans la bande de 84 px, ont
  le même défaut. Ces règles n'en dépendent pas.
- CLAUDE.md n'est pas modifié (demande : deux feuilles et cette entrée). Sa phrase « Une
  barre collante se double d'un `scroll-padding-top` sur `<html>` » gagnerait une suite :
  la bande se réduit au `top` de la barre tant que le focus est dedans. Il dit aussi
  WebKitGTK et Selenium installés : ils ne l'étaient pas dans ce conteneur
  (`apt-get install webkit2gtk-driver`, `pip install selenium`).
- Scripts et relevés : dossier de travail de la session, hors dépôt.

**Fichiers**

`src/styles/guide.css`, `src/styles/calculette.css`, `MIGRATION.md`.

## 10. Checklist go-live manuelle (à faire par un humain, pas par cette migration)

1. **DNS** : pointer `hippodoc.fr` (+ `www`) vers Vercel ; créer `app.hippodoc.fr` vers le
   déploiement Lovable ; vérifier l'app sur le sous-domaine : callbacks d'auth Supabase
   (Site URL + Redirect URLs), allowlist d'URL Supabase, URLs de redirection Stripe.
2. **Vercel** : forcer la redirection `www → apex` au niveau domaine ; vérifier que les
   redirections de `vercel.json` sont bien actives après le premier déploiement.
3. **App Lovable** : ajouter son propre `robots.txt` (Disallow: / global) ; rediriger les
   routes marketing encore présentes dans l'app vers `hippodoc.fr`.
4. **Google Search Console + Bing Webmaster Tools** : vérifier `hippodoc.fr`, soumettre
   `https://hippodoc.fr/sitemap-index.xml`, demander la réindexation des pages clés
   (`/`, `/simulateur`, `/tarifs`, `/blog`, top articles), contrôler le HTML rendu via
   l'inspection d'URL.
5. **Surveillance 2 semaines** : trafic PostHog (dip attendu court), couverture GSC,
   erreurs 404/redirections dans les logs Vercel.

## 11. Synchronisation post-migration (source mise à jour)

La source a reçu 33 commits après la migration initiale (snapshot `e024235` → `600f3c1`,
« Corrigé tracking & responsive »). Analyse du diff marketing :

- **Portés ici** : les attributs d'instrumentation PostHog `data-ph` / `data-track-plan|period|promo`
  (header, footer, FAQ accueil, tarifs accueil, offres spéciales, toggle comparatif, profils
  parcours, partenaires) + 2 retouches a11y (`aria-hidden` badge FAQ). Convention de nommage
  source conservée (`landing_nav_*`, `landing_resource_*`, `landing_footer_*`, `landing_faq_*`…).
- **Sans objet en statique** (non portés) : LandingSectionBoundary (error boundaries React),
  refactors Suspense/lazy + wrappers `data-landing-section`, garde `reduceMotion` framer-motion
  (aucune animation JS ici), timeout de buffering vidéo (pas de lecteur vidéo ici),
  try/catch du check parrainage Supabase (pas d'appel Supabase sur l'accueil statique),
  retouches CookieConsent (site public cookieless sans bannière).
- **Non instrumentables en statique** : `landing_testimonial_next/previous` (le carrousel est
  un défilement CSS sans boutons) et `landing_pricing_period_*` (les deux offres sont
  affichées côte à côte, sans toggle).

## 12. Résultats de vérification (build final)

- `astro build` : **52 pages**, zéro erreur.
- Crawl du sitemap (`scripts/verify-site.mjs`) : **51 URLs** (52 pages − `/essai` noindex) —
  titres uniques, descriptions uniques, exactement un `<h1>`, canonique exacte sans slash
  final, `lang="fr"`, texte réel dans le HTML brut sans exécution JS (≥150 mots), tous les
  blocs JSON-LD parsables, aucun lorem/placeholder. 1 avertissement : titre `/comparatif`
  à 73 caractères (titre source conservé volontairement).
- Diff d'inventaire : chaque route publique de la source existe à l'IDENTIQUE dans le build
  (`/`, `/blog` + 38 articles, `/faq`, `/simulateur`, `/guide-declarations`(+`/calculette`),
  `/comparatif`, `/qui-sommes-nous`, 4 pages légales, `/essai`, `/transmissions`) + `/tarifs`.
- Tests navigateur (Playwright/Chromium, zéro erreur console/page sur les 5 pages testées) :
  le simulateur s'hydrate et AFFICHE un résultat Super-Net (branche RSPM, calcul local) ;
  la calculette s'hydrate (23 champs) ; la boussole s'hydrate (wizard interactif) ;
  la page guide expose ~285 000 caractères de contenu statique dans le HTML.
- Lighthouse (build servi localement, headless) :

| Page | Perf | A11y | Best Practices | SEO |
|---|---|---|---|---|
| `/` | 100 | 96 | 96 | 100 |
| `/simulateur` | 99 | 100 | 96 | 100 |
| `/blog/tout-comprendre-urssaf` | 99 | 95 | 96 | 100 |

- JS client : uniquement PostHog (module différé) + les îlots des 3 outils + le carrousel
  des 4 articles à slides. Pages marketing/blog/légales : zéro JS applicatif.
