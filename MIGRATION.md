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

Reste à faire : les arbitrages éditoriaux signalés en §9.d et §9.e.

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
