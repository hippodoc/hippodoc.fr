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

Reste à faire : les sections `4.x`, `5.x`, `7.x` sans parent dans
`frais-pros-medecin-liberal-2026` (§9.e) — le seul arbitrage éditorial encore
ouvert, car il suppose d'inventer des intitulés de section.

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
- (liste complétée en fin de migration)

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
