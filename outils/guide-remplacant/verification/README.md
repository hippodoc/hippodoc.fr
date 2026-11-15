# Le guide du remplaçant : rapport de vérification (édition du 15 novembre 2026)

Standard `hippodoc-exigence` : chaque affirmation a sa citation exacte et deux sources, dont une
officielle. Les tableaux complets, par domaine, sont dans ce dossier :

| Fichier | Domaine |
|---|---|
| `ordre.md` | Licence, autorisation, inscription, contrat, non-réinstallation, RCP, CPAM, carte, rétrocession, intérim |
| `urssaf.md` | RSPM, PAMC, réforme de l'assiette, volet social, prise en charge, revenus estimés |
| `carmf.md` | Taux 2026, début d'activité, réductions et dispenses, calendrier, indemnités journalières |
| `impots.md` | Micro-BNC, réel, barème, prélèvement à la source, CFE, TVA, facturation électronique |
| `protection.md` | Indemnités journalières, première année, prévoyance, maternité, chômage, accident du travail |

## Les montants

Tous calculés le 15 novembre 2026 avec le moteur du simulateur du site
(`simulerRegime`, `calculerProvisionnelPremiereAnnee`, `src/lib/simulateur/`), cotisations PAMC
par le modèle de l'URSSAF (API publique), barème de l'impôt 2026, célibataire, secteur 1,
micro-BNC, métropole. Arrondis à 10 € dans le guide.

| Où | Profil | Résultat du moteur |
|---|---|---|
| Ta journée à 600 € | 60 000 €, 3 000 € de frais, PAMC, à partir de la 3e année | cotisations 15 211 €, impôt 4 984 €, Super-Net 36 805 € ; par jour : 152 €, 50 €, 30 €, 368 € |
| RSPM ou PAMC : combien | 15 000 €, 500 € de frais, sans autre revenu | RSPM 2 183 € (invalidité-décès à 25 %) ou 2 656 € (à 100 %) ; PAMC 1re et 2e années 4 649 € ; PAMC dès la 3e 5 827 € |
| Pourquoi l'année 2 pique | 40 000 €, 2 000 € de frais, 1re année PAMC | prélevé (provisionnel) : URSSAF 1 073 € + CARMF 3 437 € = 4 510 € ; dû pour l'année : 7 683 € ; impôt 1 468 € |
| Combien il te reste | Interne : 12 500 € de rétros, 28 000 € de salaire, RSPM, 1 300 € de frais | cotisations 1 846 € ; impôt en plus 1 863 € (3 139 € avec, 1 276 € sans les remplas) ; Super-Net 7 491 € |
| Combien il te reste | Jeune remplaçant, 40 000 €, 1re année PAMC | cotisations 7 683 €, impôt 1 468 €, Super-Net 28 849 € ; même revenu dès la 3e année : 25 504 € |
| Combien il te reste | Remplaçant régulier, 70 000 €, 5 000 € de frais | cotisations 17 302 €, impôt 6 964 €, Super-Net 40 734 € (réel : 39 448 €) |
| Ton impôt, en une formule | Interne, 10 000 € de remplas, RSPM | salaire imposable 22 000 € : 1 055 € d'impôt en plus ; 36 000 € : 1 980 € |
| RSPM ou PAMC : combien, avec la dispense d'ASV | 15 000 €, PAMC, ASV dispensée (revenu net d'il y a deux ans sous 15 000 €) | 1re et 2e années : vers 2 610 € ; dès la 3e : vers 3 780 € (l'ASV pèse 2 040 € dans les montants PAMC) |
| La règle des 35 % | Cotisations + impôt / recettes | interne au RSPM, 15 000 € : 25 % (tranche à 11 %) à 34 % (tranche à 30 %) ; PAMC 60 000 € : 34 % ; PAMC 15 000 € dès la 3e année : 39 % |

Note : pour l'interne, « l'impôt en plus » est la différence d'impôt du foyer avec et sans les
remplas (le simulateur, lui, répartit l'impôt au prorata : 714 €). C'est la grandeur que le guide
enseigne (« ta tranche marginale »).

## Ce que la vérification a changé (avant → après)

- **Facture de rétrocession** : présentée comme obligatoire avec des « mentions » → le code des
  impôts ne l'exige pas pour des soins exonérés (CGI art. 289, I-1-a ; BOFiP
  BOI-TVA-DECLA-30-20-10-10 § 10), mais elle fixe la dette du remplacé et prouve les recettes.
- **Seuil du micro-BNC** : 77 700 € (revenus 2025) → 83 600 € pour les revenus 2026 à 2028.
- **CFE** : due dans la commune du cabinet où le remplaçant a exercé le plus longtemps
  (BOI-IF-CFE-20-40-20) ; un interne n'y est soumis que si son activité est habituelle ; base
  réduite de moitié l'année qui suit la création.
- **Acompte d'impôt** : le chemin exact (« Prélèvement à la source », « Gérer vos acomptes »,
  « Créer un acompte ») et la saisie d'un bénéfice, pas de recettes.
- **CARMF** : la complémentaire n'est à 0 € les deux premières années que si l'on démarre avant
  40 ans ; l'invalidité-décès n'a plus de classes depuis 2025 (626 € au minimum, 1 010 € au
  plus) ; dispense d'ASV possible en débutant (revenu libéral de l'avant-dernière année sous
  15 000 €) ; réduction de la complémentaire à demander dans les 3 mois qui suivent l'appel.
- **URSSAF** : depuis début novembre 2026, le RSPM se gère sur urssaf.fr (« Le service
  simplifié pour les médecins ») ; déclaration trimestrielle par défaut, mensuelle sur demande ;
  volet social PAMC : DSCS, DSAV (non préremplie), DSAW à zéro, DSDE au réel (notice PAMC 2026).
- **Ordre** : depuis le 30 juillet 2026 (décret n° 2026-691), le remplacé cesse toute activité
  médicale, et la non-réinstallation n'existe que si le contrat la prévoit ; l'échéance de la
  licence varie selon le conseil départemental ; inscription au tableau demandable 4 mois avant
  le diplôme ; gardes à 100 % = un usage, pas une règle (seule l'astreinte revient de droit à
  celui qui fait la garde).
- **CPAM** : inscription en ligne auprès de la caisse du lieu de résidence avant le premier
  jour, puis chaque remplacement signalé (la convention ne prévoit qu'un enregistrement ; ameli,
  l'ARS et des caisses demandent chaque période : formulation gardée).
- **Autorisation d'un interne** : « en attendant la décision », sans délai (D4131-2 : « jusqu'à
  ce qu'il soit statué » ; les 3 mois de L4112-3 ne courent que d'un dossier complet).

## Zones grises, formulations prudentes

- Règle de sortie du RSPM (38 000 €, ou 19 000 € deux ans de suite) : doctrine de l'URSSAF, dans
  aucun article du code. Écrite telle que l'URSSAF la publie.
- Projet de décret d'extension du RSPM à 80 000 € : non publié au 15/11/2026, signalé comme tel.
- Taux de rétrocession « souvent 70 à 80 % » : usage, d'après la presse médicale ; l'Ordre
  demande seulement un taux en rapport avec les charges du cabinet.
- ameli.fr refuse les lectures automatiques : les phrases sur l'inscription CPAM et la carte
  ont été recoupées par l'ARS, l'Ordre et la MACSF. **À relire à la main sur ameli.fr avant
  publication.**
- PLF et PLFSS 2027 : non votés. Le guide utilise le barème 2026 et les taux 2026.
- Mois de la régularisation URSSAF : aucune source officielle ne le fixe ; le guide dit « après
  ta déclaration ».

## Les relectures (standard `hippodoc-exigence`)

| Regard | Premier passage | Repasse ciblée |
|---|---|---|
| A. Interne novice | sigles non définis à leur première occurrence, deux mots pour une notion (« régularisation » et « rattrapage », « provisionnel » et « forfaits »), le calcul de « Ta journée à 600 € » à refaire de tête | 3 points nouveaux, tous corrigés : la note de l'ASV (p. 17), « si tu as commencé avant 40 ans » (p. 5, qui laissait croire que la complémentaire ne concernait qu'eux), « PASS » (p. 19) ; plus 12 gênes de formulation |
| B1. Juriste santé | 7 points (décret n° 2026-691, licence, inscription CPAM, intérim, gardes) | publiable après 3 pinaillages, corrigés : « Dès le 1er rempla » (URSSAF, p. 7), la parenthèse « 3 mois au plus » retirée (p. 8 : le délai ne court que d'un dossier complet), trois définitions du glossaire (PAMC, RPPS, invalidité-décès) ; point « signale-lui chaque rempla » retiré |
| B2. Fiscaliste santé | facture non obligatoire, seuil du micro-BNC, CFE, chemin de l'acompte, DSAW | publiable après la note de l'ASV (p. 17), corrigée |
| C. Directeur artistique | typographie, couleurs, ouverture de la partie 3, variété des mises en page | corrections faites, pas de repasse demandée |
| D. Correcteur-cohérence | contradiction RSPM entre p. 16 et p. 19, un « vous », sigles CPAM, CPS, DES, CGI | corrections faites |

Dans le guide, « rattrapage » et « forfaits » sont les seuls mots pour ces deux notions ; le
Super-Net est défini à sa première occurrence (« ce qui te reste vraiment après charges,
cotisations et impôt »).

## Ce qui reste à signaler au propriétaire

- Le blog (`generer-facture-remplacement`) parle de « mentions obligatoires » pour la facture de
  rétrocession, et `tout-comprendre-carmf` d'une « non-rétroactivité » de la dispense non
  trouvée ; deux articles se contredisent sur la carte CPS (demandée à l'Ordre ou envoyée
  automatiquement) et `checklist-administrative` dit « dès ton premier remplacement » pour la
  CPAM (les sources : « avant le premier jour »).
