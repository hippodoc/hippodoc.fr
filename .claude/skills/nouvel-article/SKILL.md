---
name: nouvel-article
description: >
  Publie un ou plusieurs nouveaux articles sur le blog d'hippodoc.fr, de l'affiche et du texte
  fournis par le propriétaire jusqu'à la mise en ligne vérifiée. TOUJOURS utiliser quand le
  propriétaire écrit « nouvel article », envoie une affiche et un texte d'article, colle le
  blog produit par le kit de fiche Hippodoc, ou demande d'ajouter un article au blog.
argument-hint: "[slug souhaité, optionnel]"
---

# Nouvel article sur le blog

Le propriétaire est médecin, pas développeur : il fournit l'affiche et le texte, et il répond
« go ». Tout le reste se fait ici, à chaque fois de la même façon. Le blog vient d'être refait
(MIGRATION.md § 9.fj à 9.fq) : un nouvel article doit y entrer sans rien casser.

Lire d'abord, dans `CLAUDE.md`, la section « Blog » en entier, puis les sections « SEO — contrat
par page », « Invariants » et « Vérification avant push ». Pour le format maison, regarder deux ou
trois articles récents du même thème. MIGRATION.md § 9.as est un précédent complet de nouvel
article.

## 0. Ce qu'il faut avoir

- **L'affiche** : une image jointe. Si elle ne se lit pas comme un fichier dans la session,
  demander de la joindre à nouveau.
- **Le texte de l'article** : collé, en Markdown ou en texte brut, ou le blog produit par le kit
  de fiche Hippodoc.
- **Facultatif** (sinon, les valeurs par défaut ci-dessous) :
  - la date de publication (défaut : aujourd'hui, heure de Paris) ;
  - le thème ;
  - s'il s'agit d'une fiche Instagram numérotée (série et numéro) ;
  - « à la une ».

Ne poser une question que si la réponse change le résultat et ne se déduit pas du texte.
Sinon, choisir, et le dire dans le résumé de la PR, où le propriétaire peut corriger avant le
« go ».

## 1. Les règles qui ne se discutent pas

- **Le texte est verbatim.** On ne réécrit pas les mots du propriétaire. On ne fait que mettre en
  forme : titres `##` et `###`, listes, tableaux, gras, encadrés `:::essentiel` / `:::warning` /
  `:::tip` (voir `src/lib/remark-callouts.mjs`). Pour les listes, une ligne vide avant et après,
  sinon « \ » s'affiche (§ 9.fj). Les émojis restent dans le texte : le rendu s'en charge.
- **Une erreur se signale, elle ne se corrige pas en silence.** Un chiffre réglementaire douteux
  (barème, plafond, taux, date limite), une contradiction avec un autre article du blog, un
  titre trop long : le vérifier, le signaler au propriétaire avec la source, et ne le changer
  qu'avec son accord. Une correction acceptée se consigne (§ 9.as : « Correction factuelle »).
- **Tout ajout se consigne** dans MIGRATION.md : FAQ, « L'essentiel », liens, titre raccourci.
- **L'adresse est figée dès la mise en ligne.** Le slug se choisit bien la première fois.
- Ne jamais relancer `scripts/generate-blog-content.mjs`, qui écraserait le blog.
- **Git** :
  - travailler sur la branche de travail que la session donne, partie de `main` à jour ;
  - commits en français, terminés par les lignes d'attribution que demande la session ;
  - aucune fusion sans le « go » du propriétaire.

## 2. L'adresse (slug)

- Écriture : minuscules, sans accents, mots séparés par des tirets, 3 à 6 mots porteurs (le
  sujet, puis « medecin-remplacant » si cela tient).
- Le nom de fichier est le slug : `src/content/blog/<slug>.md`.
- Vérifier qu'il n'existe ni comme article, ni dans les redirections de `vercel.json`.

## 3. L'affiche

1. Lire ses dimensions (`sharp`, déjà dans le dépôt).
   - Format idéal : portrait 4:5, **1 080 × 1 350 px**, le format des fiches Instagram.
   - En dessous de **900 px de large**, elle sera floue en grand : le signaler. Les affiches de
     450 px du blog le sont déjà.
   - Une affiche paysage ou carrée se signale aussi : les cases sont faites pour le portrait.
2. Comparer son empreinte (md5) aux fichiers de `src/assets/blog/`. Deux articles qui partagent
   une affiche, c'est déjà arrivé une fois (§ 9.fo). Le signaler.
3. **La regarder** : texte lisible, pas de faute, pas de bord noir. Signaler ce qui ne va pas, sans
   jamais retoucher l'image.
4. L'enregistrer sous `src/assets/blog/<slug>-cover.<jpg|png|webp>`. Un fichier de plus de 2 Mo
   peut être recompressé (même taille, qualité 85 à 90). Le dire.

La règle des affiches (`CLAUDE.md`, « Les affiches ») s'applique d'elle-même. Rien à régler.

## 4. Le frontmatter

Schéma : `src/content.config.ts`. Recopier l'ordre des champs d'un article récent.

| Champ | Règle |
|---|---|
| `title` | Le titre du propriétaire. Le `<title>` de la page fait 60 signes au plus : jusqu'à 44 signes, « \| Blog Hippodoc » s'ajoute ; de 45 à 49, « \| Hippodoc » ; au-delà, le titre seul, qui doit faire 60 signes au plus. S'il est trop long, proposer une version courte, mot-clé d'abord, et la consigner. |
| `description` | 140 à 160 signes, unique, le mot-clé dans les premiers mots, tutoiement comme le blog. Écrite ici : la consigner. |
| `pubDate` | `"AAAA-MM-JJ"`. Pas d'`updatedDate` pour un nouvel article. |
| `author`, `authorRole` | `"Dr. Ryan Goburdhun"` et le rôle des autres articles (table `AUTEURS` de `src/lib/site.ts`). |
| `theme` | Un des cinq slugs de `src/lib/blog-themes.ts`. Choisir d'après le sujet principal, en comparant avec les articles du thème. Dire pourquoi. |
| `seriesId`, `category`, `tags` | Les séries ne sont plus affichées (§ 9.fq) mais restent pour les statistiques. Par défaut : `seriesId: "divers"`, `category: "Guide et Conseil"`, `tags: ["Guide et Conseil"]`. Pour une fiche Instagram numérotée : la série (`fiche-fiscalite` / « Fiche Fiscalité », ou `fiche-pratique` / « Fiche Pratique »), `categoryNumber: "<n>"` et `episodeNumber: <n>`, en continuant la numérotation existante. |
| `readTime` | `"<n> min"`, n = mots du corps ÷ 160, arrondi, au moins 3 (médiane du blog : 161 mots par minute). |
| `cover` | `"/blog/<slug>-cover.<ext>"`. |
| `cta`, `ctaHref` | Par défaut, rien : le bouton mène à l'essai. Si l'article parle du Super-Net ou du simulateur, `ctaHref: "/simulateur"` et une accroche qui annonce le simulateur. |
| `faq` | Celle du propriétaire si elle existe. Sinon, 3 à 6 questions dont chaque réponse reprend des phrases de l'article, sans aucun fait nouveau ; `**gras**` permis. La consigner. |
| `relatedArticles` | 3 slugs existants, du même thème ou du plus proche, qui prolongent la lecture. |
| `featured` | Seulement si le propriétaire le demande. L'article le plus récent est déjà « à la une ». Retirer alors `featured` de l'article qui l'avait. |

## 5. Le corps

- **« L'essentiel »** : si le texte a un résumé (« En résumé », « À retenir »), le mettre en tête
  dans `:::essentiel`, mot pour mot. S'il n'en a pas, ne pas en inventer : le proposer.
- **Sources** : une partie « Sources » en fin d'article quand le texte cite des textes officiels.
  Des liens vers les pages officielles (URSSAF, CARMF, impots.gouv, ameli, Légifrance), jamais
  vers un concurrent.
- **Liens internes** : 2 à 5 liens posés sur des mots déjà là, vers d'autres articles,
  `/simulateur`, `/guide-declarations` ou la calculette. Aucun mot ajouté pour faire un lien. Les
  lister.
- **Maillage entrant** : ajouter le nouveau slug aux `relatedArticles` de 2 ou 3 articles du même
  thème. Leur texte ne change pas, donc pas d'`updatedDate`. Un lien ajouté DANS le texte d'un
  ancien article est une vraie modification : `updatedDate` du jour, à reporter dans
  `blog-meta.json` (§ 9.ai). Le faire seulement s'il est très pertinent, et le consigner.

## 6. Les fichiers à tenir à jour

- `src/generated/blog-meta.json` : l'entrée du slug (`pubDate`, et `updatedDate` des articles
  modifiés dans leur texte). `verify-site.mjs` échoue si une date diverge du frontmatter.
- `scripts/verify-site.mjs` : si l'article porte une FAQ, relever `PLANCHER_FAQ` (pages + 1,
  questions + n). Un avertissement le demande.
- `CLAUDE.md` : les comptes, c'est-à-dire « (N articles au <date>) » dans la section « Blog », et
  « (N pages au <date>, dont M dans le sitemap) » dans « Vérification avant push ».
- `MIGRATION.md` : une section `### 9.<lettre suivante> Nouvel article : <sujet> (<date>)` sur le
  modèle de § 9.as. Elle dit le fichier, l'affiche (taille, défauts), le thème choisi, les écarts
  au texte fourni (titre raccourci, ajouts, corrections acceptées), les liens et le maillage
  entrant, et les points laissés au propriétaire.
- Rien d'autre à faire à la main : l'image de partage (`/blog/partage/<slug>-<empreinte>.jpg`), le
  sitemap, le flux RSS, `llms.txt`, l'index de recherche et la page du thème se font à la
  construction.

## 7. Vérifier

1. **Référence** : construire `main` avant de changer quoi que ce soit (`npm run build`), noter le
   nom de la feuille commune (`dist/_astro/_astro_assets.*.css`) et garder ce `dist` de côté.
2. **Construction** : après les changements, `npm run build`, puis `node scripts/verify-site.mjs`,
   qui doit passer. Une page de plus construite et une adresse de plus dans le sitemap. La
   feuille commune garde son nom.
3. **Aucun mot perdu** : comparer, mot pour mot et dans l'ordre, le texte fourni au texte rendu
   dans `[data-blog-zone="corps"]`. Seuls les ajouts consignés font une différence.
4. **Pages déjà en ligne** : contre la référence, seules ont changé `/blog`, la page du thème, les
   articles dont `relatedArticles` a reçu le nouveau slug, et ceux qui ont reçu un lien consigné.
5. **Regarder** (Playwright et Chromium sont installés) :
   - l'article à 393 × 692, le haut et un écran du milieu ;
   - l'affiche ouverte en grand ;
   - `/blog` et la page du thème à 393 × 692 ;
   - l'article à 1 512 × 800 ;
   - l'image de partage.

   Corriger ce qui ne va pas.
6. **Lighthouse mobile** de l'article : 95 ou plus, CLS 0.

## 8. La PR, puis la mise en ligne

1. Pousser et ouvrir la PR (base `main`). En tête :
   - l'adresse ;
   - le `<title>` et la description ;
   - le thème, et pourquoi ;
   - la FAQ et les liens ajoutés ;
   - les corrections proposées et leurs sources ;
   - les remarques sur l'affiche.

   Puis les vérifications. « À ne pas fusionner sans le « go » du propriétaire. »
2. Envoyer au propriétaire les captures au téléphone (article, affiche en grand, `/blog`) et le
   même résumé, en français simple. Lui demander « go ».
3. Au « go » : fusionner, attendre le déploiement, puis vérifier en ligne :
   - l'article répond 200 sur `https://www.hippodoc.fr/blog/<slug>` ;
   - son `og:image` répond 200 en 1 200 × 630 ;
   - il est dans `/sitemap-0.xml` et dans `/blog`.
4. Rappeler au propriétaire de faire, lui, deux gestes :
   - **Search Console** → « Inspection de l'URL » → coller l'adresse → « Demander une
     indexation » ;
   - coller le lien dans WhatsApp ou LinkedIn pour voir l'aperçu.

Plusieurs articles à la fois : une seule PR, une section MIGRATION.md par article, et les mêmes
vérifications pour chacun.
