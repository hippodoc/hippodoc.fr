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
- [ ] Créer des covers dédiées pour `facturation-electronique-medecin-remplacant`
      (actuellement `facture-generation-cover.png`) et
      `remplacement-regulier-requalification` (actuellement
      `signer-contrat-remplacement-cover.png`) — voir §9.aq.
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
