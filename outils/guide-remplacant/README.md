# Le guide du remplaçant (PDF)

Le PDF offert sur [/guide](https://hippodoc.fr/guide), envoyé en message privé par ManyChat après
les publications Instagram. C'est la vitrine d'Hippodoc : celui qui l'a lu doit avoir envie des
kits du dimanche, du simulateur et de l'essai. Historique et décisions : MIGRATION.md, § 9.ha.

## Fabriquer

```bash
node outils/guide-remplacant/construire.mjs          # PDF, aperçus, contrôles
node outils/guide-remplacant/construire.mjs --decor  # refait aussi les décors de couverture et de fin
python3 outils/guide-remplacant/planche.py           # planche contact des aperçus
```

Sorties dans `outils/guide-remplacant/sortie/` (non versionné) : `guide-du-remplacant.pdf`,
`guide.html`, `apercu/page-NN.png`, `planche.png`. Le PDF publié se copie ensuite dans
`public/guide/` sous le nom de l'édition (voir `src/lib/guide-remplacant.ts`).

Le script échoue si une page déborde, si un renvoi « p. N » vise une page absente, ou si un
caractère n'est pas dans la police. Il signale « À REVOIR » les mots seuls en fin de ligne, les
vides de plus de 120 px et les textes sous 22 px : regarder chaque aperçu en grand avant de livrer.

## Les choix, et pourquoi

- **Format 4:5, 1080 × 1350 px par page** (810 × 1012,5 pt) : celui des carrousels. 64 % des
  téléchargements viennent d'un téléphone (PostHog, septembre à novembre 2026) : à cette taille, le
  texte courant (28,5 px) se lit sans zoomer sur un écran de 390 px. Le PDF s'imprime aussi sur A4.
- **DA 2026** (skill `hippodoc-da`) : jetons seulement (`jetons.css`), pas `hippodoc.css` dans le
  PDF (collisions de classes). Ciel en ouverture, sable pour expliquer, eau profonde pour les deux
  pièges et « Ta journée à 600 € », jaune réservé au Super-Net et au bouton d'essai.
- **Ni ombre floue ni transparence** : Aperçu et l'iPhone les rendent en blocs gris. Les cartes ont
  une tranche nette et opaque. Les décors (soleil, vagues, mascotte) sont rendus en JPEG opaque
  par le script : une pose détourée embarquée telle quelle pèse 900 Ko.
- **Navigation** : sommaire et renvois « p. N » cliquables, signets du PDF tirés des titres, liens
  vers le site avec `utm_source=guide-pdf`.
- **Les montants** viennent du moteur du simulateur (`src/lib/simulateur/`), avec le modèle de
  l'URSSAF : mêmes calculs que /simulateur, mêmes profils types. Les règles, des sources citées en
  avant-dernière page.

## Fichiers

| Fichier | Rôle |
|---|---|
| `pages.mjs` | Le contenu, page par page. Les renvois s'écrivent `[[p:id]]`. |
| `guide.css` | La feuille du PDF (échelle de texte et composants). |
| `jetons.css` | Les jetons de la DA (copie de `hippodoc-da/assets/tokens.css`). |
| `construire.mjs` | Le générateur et ses contrôles. |
| `typo.mjs` | Typographie française (insécables, apostrophes, signe moins). |
| `assets/da/` | La police, les feuilles et les décors de la DA, pour refaire couverture et fin. |
| `assets/mascotte/` | Les poses utilisées par les ouvertures de partie. |
