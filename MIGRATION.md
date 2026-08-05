# MIGRATION — hippodoc.fr : SPA Lovable → Astro SSR/statique

Migration du site public d'Hippodoc depuis la SPA React/Vite (`roshangbd/hippodocfinary`,
miroir lu : `tpayet/hippodocfinary`) vers ce dépôt Astro, déployé sur Vercel.
L'application privée reste sur la SPA et sera servie sur `app.hippodoc.fr`.

## 1. Inventaire des routes publiques (source : `src/App.tsx` + `public/sitemap.xml`)

Toutes conservées à l'IDENTIQUE (aucun changement d'URL).

| Route | Composant source | Statut migration |
|---|---|---|
| `/` | `src/pages/landing/` (LandingPage + `src/components/landing/*`) | à migrer |
| `/blog` | `src/pages/blog/` (index) | à migrer |
| `/blog/<slug>` ×38 | `src/pages/blog/*.tsx` (une page par article) | à migrer |
| `/faq` | `src/pages/faq.tsx` | à migrer |
| `/simulateur` | `src/pages/simulateur-public.tsx` | à migrer (île React) |
| `/guide-declarations` | `src/pages/guide-declarations/` | à migrer (île React) |
| `/guide-declarations/calculette` | `src/pages/guide-declarations/` | à migrer (île React) |
| `/comparatif` | `src/pages/comparatif.tsx` | à migrer |
| `/qui-sommes-nous` | `src/pages/qui-sommes-nous.tsx` | à migrer |
| `/conditions-utilisations` | `src/pages/conditions-utilisations.tsx` | à migrer |
| `/politique-confidentialite` | `src/pages/politique-confidentialite.tsx` | à migrer |
| `/rgpd` | `src/pages/rgpd.tsx` | à migrer |
| `/mentions-legales` | `src/pages/mentions-legales.tsx` | à migrer |
| `/tarifs` | — (NOUVELLE page, n'existe pas dans la source) | à créer |
| `/essai` | `src/pages/instagram/` (landing link-in-bio Instagram) | à migrer, `noindex` (comme l'ancien robots.txt le voulait) |
| `/transmissions` | `public/transmissions.html` (page newsletter autonome, noindex) | ✅ portée verbatim (`public/transmissions/index.html`) |

Remarques :
- La source compte **38 articles de blog** (la commande initiale en estimait 35) — les 38 sont migrés.
- `/landing`, `/instagram`, `/i`, `/hippo-wall-street` ne sont que des redirections dans la source → reproduites en 301 (voir §5).
- `/remplacements` : indexé historiquement comme page campagne, mais c'est aujourd'hui une route PRIVÉE de l'app → 301 vers `/` (plus proche équivalent public), et `/remplacements/*` → app.

## 2. Contenu du blog

- Aucune donnée en base : `blog_posts` (Supabase) ne contient qu'1 ligne de test. Tout le contenu
  est codé en dur, un composant TSX par article (`src/pages/blog/*.tsx`).
- Cible : content collection Astro (`src/content/blog/*.mdx`), frontmatter
  `title, description, slug, pubDate, updatedDate, author, tags` — dates d'origine conservées.
- (Tableau slug → fichier → date complété en fin de migration.)

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
- **Non migrés volontairement** (contrainte « zéro JS hors îlots + PostHog ») — à re-décider
  par l'équipe si besoin : GA4 `G-T8TFWPPW3M` (+ Consent Mode v2), Meta Pixel, Crisp chat
  (`3e4f14e5-8e4e-40fd-b1f5-f0b940186f56`), Calendly. Voir TODO(owner) §9.
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
- **/simulateur** (rédigé, exigence spec « section explicative SSR ») : bloc de définitions
  « Trois mots à connaître » (Rétrocession / URSSAF / Super-Net) et « Exemple chiffré »
  30 000 € de recettes — chiffres dérivés exclusivement des constantes du moteur porté
  (seuil RSPM 38 000 €, tranches 13,5 %/21,2 % à 19 000 €, abattement micro-BNC 34 %).
- **/qui-sommes-nous** : phrase PRODUCT_DEFINITION ajoutée sous l'intro (verbatim site.ts).
- **Accueil** : PRODUCT_DEFINITION sous le sous-titre du héros ; démo Calendly → lien
  mailto:contact@hippodoc.fr ; libellés techniques mineurs (« La vidéo s'ouvre dans un
  nouvel onglet »).

## 10. TODO(owner) — faits manquants / décisions

- [ ] TODO(owner) : réactiver ou non GA4 `G-T8TFWPPW3M`, Meta Pixel, Crisp
      (`3e4f14e5-8e4e-40fd-b1f5-f0b940186f56`) et Calendly sur le site public
      (retirés pour la performance ; PostHog seul est conservé). Les snippets d'origine sont
      dans `index.html` de la source.
- [ ] TODO(owner) : attribuer ou non les articles signés « Équipe Hippodoc »/« Dr. Hippodoc »
      au fondateur médecin (Ryan Goburdhun) dans le schéma Article — non fait, pour ne pas
      inventer d'attribution.
- [ ] TODO(owner) : « Dr. Sophie Martin » (1 article) — auteur à confirmer/rattacher à une bio.
- [ ] TODO(owner) : la **vidéo de présentation** (26 Mo) n'existe que dans le stockage Lovable
      (`/__l5e/assets-v1/...`). Le site pointe temporairement vers
      `https://app.hippodoc.fr/__l5e/assets-v1/.../hippodoc-presentation-st.mp4` (valide tant
      que l'app reste sur Lovable). À terme : héberger la vidéo proprement (Vercel Blob,
      Cloudflare R2, YouTube/Vimeo) et mettre à jour PresentationVideoSection + VideoObject.
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
