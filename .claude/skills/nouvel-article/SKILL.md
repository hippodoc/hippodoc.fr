---
name: nouvel-article
description: >
  Publie un ou plusieurs nouveaux articles sur le blog d'hippodoc.fr, de l'affiche et du texte
  fournis par le propriétaire jusqu'à la mise en ligne vérifiée ; modifie aussi un article déjà en
  ligne. TOUJOURS utiliser quand le propriétaire écrit « nouvel article », envoie une affiche et un
  texte d'article, colle le blog produit par le kit de fiche Hippodoc, ou demande d'ajouter ou de
  modifier un article du blog.
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

- **L'affiche** : une image jointe à la conversation.
  - Les pièces jointes arrivent en fichier, à leur taille d'origine, dans
    `~/.claude/uploads/<session>/` (`<id>-image.png`, `.jpg`… ; la liste est dans
    `.saved-uploads.jsonl`).
  - Si rien n'y est, demander au propriétaire de déposer l'affiche dans Google Drive et de donner
    le lien. La télécharger par l'outil Google Drive de la session.
- **Le texte de l'article** : collé, en Markdown ou en texte brut, ou le blog produit par le kit
  de fiche Hippodoc (voir « Texte venu du kit », étape 5).
- **Le diaporama**, s'il y en a un : les images du carrousel Instagram, dans l'ordre (champ
  `slides`, étape 3).
- **Facultatif** (sinon, les valeurs par défaut ci-dessous) :
  - la date de publication. Défaut : aujourd'hui, heure de Paris. Une date passée a un coût,
    voir l'étape 4 ;
  - le thème ;
  - s'il s'agit d'une fiche Instagram numérotée (série et numéro) ;
  - « à la une ».

Ne poser une question que si la réponse change le résultat et ne se déduit pas du texte.
Sinon, choisir, et le dire dans le résumé de la PR, où le propriétaire peut corriger avant le
« go ».

## 1. Les règles qui ne se discutent pas

- **Le texte est verbatim.** On ne réécrit pas les mots du propriétaire. On ne fait que mettre en
  forme :
  - titres `##` et `###`, en texte simple, sans gras ni lien. Un émoji en tête de `##` est
    l'usage du blog : le garder s'il est dans le texte, ne pas en ajouter. Le rendu le masque ;
  - listes, avec une ligne vide avant et après (sinon « \ » s'affiche, § 9.fj) ;
  - tableaux et gras ;
  - encadrés `:::essentiel`, `:::warning` et `:::tip` (`src/lib/remark-callouts.mjs`). Un encadré
    s'ouvre par `:::warning` seul sur sa ligne et se ferme par `:::` seul sur la sienne.

  Les émojis restent dans le texte : le rendu s'en charge.
- **Une erreur se signale, elle ne se corrige pas en silence.** Cela vaut pour :
  - un chiffre réglementaire douteux (barème, plafond, taux, date limite) ;
  - une contradiction avec un autre article du blog ;
  - un titre trop long ;
  - un code promo (de la forme `INTERNE2026`), que `verify-site.mjs` refuse : c'est une décision
    de contenu.

  Le vérifier, le signaler au propriétaire avec la source, et ne le changer qu'avec son accord.
  Une correction acceptée se consigne (§ 9.as : « Correction factuelle »).
- **Tout ajout se consigne** dans MIGRATION.md : « L'essentiel », FAQ, accroche, description,
  liens, titre raccourci.
- **L'adresse est figée dès la mise en ligne.** Le slug se choisit bien la première fois.
- Ne jamais relancer `scripts/generate-blog-content.mjs`, qui écraserait le blog.
- **Git** :
  - travailler sur la branche de travail que la session donne, partie de `main` à jour ;
  - commits en français, terminés par les lignes d'attribution que demande la session ;
  - aucune fusion sans le « go » du propriétaire.

## 2. L'adresse (slug) et le sujet

- Écriture : minuscules, sans accents, mots séparés par des tirets, 3 à 6 mots porteurs (le
  sujet, puis « medecin-remplacant » si cela tient).
- Le nom de fichier est le slug : `src/content/blog/<slug>.md`.
- Vérifier qu'il n'existe ni comme article, ni dans les redirections de `vercel.json`.
- **Un sujet déjà traité ?** Chercher, dans tous les articles (titres, descriptions,
  intertitres), ceux qui visent la même requête. Deux pages sur la même question se font
  concurrence sur Google. Le cas échéant, le signaler et proposer de différencier le titre ou de
  lier les deux articles. Le propriétaire décide.
- Si le corpus d'audience `hippodoc-corpus/` est fourni, lire `carte-de-la-demande.md` avant de
  choisir l'adresse, le titre et la description (CLAUDE.md, « Recherche d'audience »).

## 3. L'affiche

1. Lire ses dimensions avec `sharp`, déjà dans le dépôt.
   - **Portrait obligatoire** : largeur ÷ hauteur de 0,81 au plus. Une affiche carrée ou paysage
     déborde des cases des listes et recouvre le texte (mesuré : § 9.gl). Dans ce cas, demander
     une autre affiche et ne pas publier.
   - Format idéal : 4:5, **1 080 × 1 350 px**, le format des fiches Instagram.
   - En dessous de **900 px de large**, elle sera floue en grand. Le signaler (les affiches de
     450 px du blog le sont déjà).
2. Comparer son empreinte (md5) à celles des fichiers de `src/assets/blog/`. Deux articles qui
   partagent une affiche, c'est déjà arrivé (§ 9.fo). Le signaler.
3. **La regarder** : texte lisible, pas de faute, pas de bord noir. Signaler ce qui ne va pas,
   sans jamais retoucher l'image.
4. L'enregistrer sous `src/assets/blog/<slug>-cover.<jpg|png|webp>`, **sans ses métadonnées**
   (EXIF, position GPS, logiciel). Le fichier est copié tel quel dans le site (vérifié : même md5
   dans `dist/_astro`). Avec `sharp` : `.rotate()` (pour appliquer l'orientation), sans
   `withMetadata()`, mêmes dimensions, et une qualité explicite (`jpeg({ quality: 90 })`, sinon
   `sharp` réencode à 80). Un fichier de plus de 2 Mo peut descendre à 85. Le dire.
5. **Diaporama** :
   - chaque image va sous `src/assets/blog/<slug>-slide-01.png`, `-02`…, avec les mêmes contrôles
     et sans métadonnées ;
   - dans le frontmatter, `slides`, avec pour chaque image un `src` (`"/blog/<slug>-slide-01.png"`)
     et un `alt` qui dit ce que l'image montre ;
   - exemple : `frais-pros-medecins-salaries-internes-2026.md`.

La règle des affiches (`CLAUDE.md`, « Les affiches ») s'applique d'elle-même. Rien à régler.

## 4. Le frontmatter

Schéma : `src/content.config.ts`. Recopier l'ordre des champs d'un article récent. Valeurs entre
guillemets doubles, comme dans les autres articles.

| Champ | Règle |
|---|---|
| `title` | Le titre du propriétaire. Le `<title>` de la page fait 60 signes au plus : jusqu'à 44 signes, « \| Blog Hippodoc » s'ajoute ; de 45 à 49, « \| Hippodoc » ; au-delà, le titre seul, qui doit faire 60 signes au plus. S'il est trop long, proposer une version courte, mot-clé d'abord, et la consigner. |
| `description` | 140 à 160 signes, unique, le mot-clé dans les premiers mots, tutoiement comme le blog. Écrite ici : la consigner. |
| `pubDate` | `"AAAA-MM-JJ"`. Pas d'`updatedDate` pour un nouvel article. Si la date est antérieure au dernier article du même thème, les images de partage des articles plus récents de ce thème changent d'adresse (`src/lib/image-partage.mjs`, rang par date) : le dire au propriétaire, ou prendre la date du jour. |
| `author` | `"Dr. Ryan Goburdhun"` (table `AUTEURS` de `src/lib/site.ts`). |
| `authorRole` | `"Médecin remplaçant & fondateur d'Hippodoc"`, la valeur des autres articles. |
| `theme` | Un des cinq slugs de `src/lib/blog-themes.ts`. Choisir d'après le sujet principal, en comparant avec les articles du thème. Dire pourquoi. |
| `seriesId`, `category`, `tags` | Les séries ne s'affichent plus (§ 9.fq) mais restent pour les statistiques. Par défaut : `seriesId: "divers"`, `category: "Guide et Conseil"`, `tags: ["Guide et Conseil"]`. Pour une fiche Instagram numérotée : `fiche-fiscalite` (« Fiche Fiscalité ») ou `fiche-pratique` (« Fiche Pratique »), avec `categoryNumber: "#<n>"` (avec le dièse, comme les autres fiches) et `episodeNumber: <n>`, en continuant la numérotation existante (lire le plus grand numéro de la série). |
| `readTime` | `"<n> min"` : nombre de mots du corps divisé par 160, arrondi, 3 au minimum (médiane du blog : 161 mots par minute). |
| `cover` | `"/blog/<slug>-cover.<ext>"`, avec l'extension EXACTE du fichier enregistré. Une erreur ne casse pas la construction, mais l'article perd son affiche partout (étape 7 : contrôle). |
| `cta` | Une accroche courte au-dessus du bouton d'essai, dans le ton du blog. Les autres articles en ont tous une ; sans elle, le titre est générique. Écrite ici : la consigner. |
| `ctaHref` | Sans lui, le bouton mène à l'inscription sur l'application. Si l'article parle du Super-Net ou du simulateur, `ctaHref: "/simulateur"`, avec une accroche qui annonce le simulateur. |
| `faq` | Celle du propriétaire si elle existe. Sinon, 3 à 6 questions dont chaque réponse reprend des phrases de l'article, sans aucun fait nouveau. Seuls `**gras**`, `*italique*` et les retours à la ligne sont rendus (`src/lib/blog-format.ts`) : aucun lien `[x](url)`, qui s'afficherait tel quel. La consigner. |
| `relatedArticles` | 4 à 6 slugs existants, du même thème ou du plus proche, qui prolongent la lecture. Un par ligne, entre guillemets doubles : sinon le contrôle de `verify-site.mjs` ne les lit pas, et un slug faux disparaît sans bruit. Seuls les 6 premiers s'affichent. |
| `featured` | La une de `/blog` est l'article qui porte `featured: true` (aujourd'hui `conge-maternite-paternite`), sinon le plus récent. Un nouvel article n'est donc PAS à la une. Le dire dans le résumé et demander si le propriétaire veut l'y mettre. Si oui, déplacer `featured: true` : un seul article le porte. |

## 5. Le corps

- **« L'essentiel »** : tous les articles en ont un, en tête, dans un encadré :
  ```
  :::essentiel
  **L'essentiel**

  - …
  :::
  ```
  - Si le texte a un résumé (« En résumé », « À retenir »), le garder à sa place ET en reprendre
    les points en tête dans l'encadré. On peut couper en puces, sans ajouter de mot (§ 9.as).
  - S'il n'en a pas, le composer avec des phrases de l'article, sans aucun fait nouveau, et le
    signaler dans le résumé de la PR.
- **Sources** : une partie « Sources » en fin d'article quand le texte cite des textes officiels.
  - Elle s'écrit `## 📚 Sources (vérifiées au <date>)` et doit être le DERNIER titre `##` du corps.
    Seul ce titre déclenche le pli et la mise en forme des sources (`src/lib/rehype-article.mjs`).
  - Les liens vont vers les pages officielles (URSSAF, CARMF, impots.gouv, ameli, Légifrance),
    jamais vers un concurrent.
- **Liens internes** : 2 à 5 liens posés sur des mots déjà présents, vers d'autres articles,
  `/simulateur`, `/guide-declarations` ou la calculette.
  - Aucun mot ajouté pour faire un lien.
  - Adresses relatives, sans barre finale : `/blog/<slug>`, jamais `/blog/<slug>/`.
  - Jamais vers `/blog/serie/…` : ces pages sont redirigées (§ 9.fq), et `verify-site.mjs`
    échoue.
  - Les lister dans le résumé.
- **Maillage entrant** : ajouter le nouveau slug aux `relatedArticles` de 2 ou 3 articles du même
  thème, **parmi leurs 6 premiers** (en tête, ou à la place du moins pertinent). Vérifier le lien
  dans `dist/blog/<cible>/index.html`. Le texte de ces articles ne change pas : pas
  d'`updatedDate`.
- **Un lien ajouté DANS le texte d'un ancien article** compte comme une vraie modification. Il
  demande une `updatedDate` du jour, reportée dans `blog-meta.json` (§ 9.ai, précédent § 9.as).
  Le faire seulement s'il est très pertinent, et le consigner.
- **Texte venu du kit de fiche Hippodoc.** Avant toute mise en forme :
  - la ligne de titre `#` devient le `title` et sort du corps. Sinon, la page a deux `<h1>` et
    `verify-site.mjs` échoue ;
  - la ligne « À jour au … » sous le titre sort du corps : la page affiche déjà sa date. Garder
    cette date pour le titre des sources ;
  - la ligne « Sources » en gras devient le titre `## 📚 Sources (vérifiées au <date>)`, dernier
    titre `##` ;
  - les liens vers `https://hippodoc.fr/…` ou `https://www.hippodoc.fr/…` deviennent relatifs ;
  - « En résumé » reste à sa place (voir « L'essentiel », plus haut).

## 6. Les fichiers à tenir à jour

- `src/generated/blog-meta.json` : ajouter `"<slug>": { "pubDate": "AAAA-MM-JJ", "updatedDate":
  "AAAA-MM-JJ" }`, les deux à la date de publication. Le `lastmod` du sitemap se lit dans
  `updatedDate` (`astro.config.mjs`) : sans elle, l'adresse sort sans date, et `verify-site.mjs`
  ne le voit pas. Y reporter aussi l'`updatedDate` des articles modifiés dans leur texte.
- `scripts/verify-site.mjs` : si l'article porte une FAQ, relever `PLANCHER_FAQ` en recopiant les
  nombres que donne l'avertissement.
- `CLAUDE.md` : les comptes, c'est-à-dire « (N articles au <date>) » dans la section « Blog », et
  « (N pages au <date>, dont M dans le sitemap) » dans « Vérification avant push ».
- `MIGRATION.md` : une section `### 9.<lettre suivante> Nouvel article : <sujet> (<date>)`, sur le
  modèle de § 9.as, placée après la dernière section 9 et avant « ## 10. Checklist go-live ». Elle
  dit :
  - le fichier et l'affiche (taille, défauts) ;
  - le thème choisi ;
  - les écarts au texte fourni : titre raccourci, ajouts, corrections acceptées ;
  - les liens et le maillage entrant ;
  - les points laissés au propriétaire.
- Rien d'autre à faire à la main. L'image de partage (`/blog/partage/<slug>-<empreinte>.jpg`), le
  sitemap, le flux RSS, `llms.txt`, l'index de recherche, la page du thème et le nombre d'articles
  de `/qui-sommes-nous` se font à la construction.

## 7. Vérifier

1. **Référence** : construire `main` avant tout changement (`npm run build`), noter le nom de la
   feuille commune (`dist/_astro/_astro_assets.*.css`) et garder ce `dist` de côté.
2. **Construction** : après les changements, `npm run build` puis `node scripts/verify-site.mjs`,
   qui doit passer.
   - Une page de plus construite, une adresse de plus dans le sitemap, AVEC son `lastmod` :
     `grep '<slug></loc><lastmod>' dist/sitemap-0.xml`.
   - Avertissements attendus : « aucun lien entrant depuis le texte d'un autre article », et
     `PLANCHER_FAQ` si l'article a une FAQ.
   - **Feuille commune** : Tailwind lit aussi les `.md`. Un mot du texte qui est aussi un nom de
     classe ajoute une règle, et la feuille change de nom sur toutes les pages. Si elle change :
     trouver le mot, le signaler dans la PR (c'est sans effet visible), et ne pas toucher au
     texte.
3. **L'affiche est là** : `grep -c 'class="couverture"' dist/blog/<slug>/index.html` vaut 1, et
   l'affiche du nouvel article est dans `dist/blog/index.html` et dans la page de son thème.
4. **Aucun mot perdu** : comparer, mot pour mot et dans l'ordre, le texte fourni au texte rendu
   dans `[data-blog-zone="corps"]`, après normalisation des deux côtés :
   - apostrophes droites et typographiques confondues ;
   - balises retirées SANS insérer d'espace (les `<span class="nb">` coupent les mots
     sinon) ;
   - « L'essentiel » comparé à part, puisque le rendu le remonte avant l'introduction.

   Seuls les ajouts consignés font une différence.
5. **Pages déjà en ligne** : contre la référence, seules doivent changer :
   - `/blog` et la page du thème ;
   - `/qui-sommes-nous` (le nombre d'articles) ;
   - les articles dont les `relatedArticles` ont reçu le nouveau slug, et ceux qui ont reçu un
     lien consigné ;
   - les articles plus récents du même thème, si la date est antérieure (image de partage).
6. **Regarder** (Playwright et Chromium sont installés) :
   - l'article à 393 × 692, le haut et un écran du milieu ;
   - l'affiche ouverte en grand ;
   - `/blog` et la page du thème à 393 × 692 ;
   - l'article à 1 512 × 800 ;
   - l'image de partage.

   Corriger ce qui ne va pas.
7. **Lighthouse mobile** de l'article : 95 ou plus, CLS 0.

## 8. La PR, puis la mise en ligne

1. Pousser et ouvrir la PR (base `main`). En tête, le résumé :
   - l'adresse ;
   - le `<title>` et la description ;
   - le thème, et pourquoi ;
   - « L'essentiel », la FAQ, l'accroche et les liens ajoutés ;
   - les corrections proposées, avec leurs sources ;
   - les remarques sur l'affiche ;
   - la une (inchangée, sauf demande).

   Puis les vérifications. Ajouter : « À ne pas fusionner sans le « go » du propriétaire. »
2. Envoyer au propriétaire, par l'outil d'envoi de fichiers de la session, les captures au
   téléphone : l'article, l'affiche en grand et `/blog`. Y joindre le même résumé, en français
   simple, et lui demander « go ».
3. Au « go » : fusionner, attendre le déploiement, puis vérifier en ligne :
   - `https://www.hippodoc.fr/blog/<slug>` répond 200 ;
   - son `og:image` répond 200, en 1 200 × 630 ;
   - l'article est dans `/sitemap-0.xml` et dans `/blog`.
4. Rappeler au propriétaire de faire, lui, deux gestes :
   - **Search Console** → « Inspection de l'URL » → coller l'adresse → « Demander une
     indexation » ;
   - coller le lien dans WhatsApp ou LinkedIn pour voir l'aperçu.

Plusieurs articles à la fois : une seule PR, une section MIGRATION.md par article, et les mêmes
vérifications pour chacun.

## Modifier un article déjà en ligne

Même chemin, en plus court :
- ne jamais changer l'adresse ;
- le texte nouveau est verbatim ;
- `updatedDate` du jour dès que le texte change, lien ajouté compris (§ 9.as), reportée dans
  `blog-meta.json` (§ 9.ai). Une coquille corrigée seule n'en demande pas ;
- une section MIGRATION.md « Contenu modifié » ;
- les mêmes vérifications, la PR et le « go ».

Une affiche remplacée garde son nom de fichier, ou le frontmatter suit le nouveau nom. Un titre
retouché change l'adresse de l'image de partage : les aperçus déjà partagés gardent l'ancienne
image quelques jours (§ 9.fl).
