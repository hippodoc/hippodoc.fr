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
