/**
 * FAQ de la page d'accueil — SOURCE UNIQUE.
 *
 * Auparavant, les questions vivaient en double : une copie dans `FaqSection.astro`
 * pour l'affichage, une autre recopiée à la main dans `index.astro` pour le JSON-LD
 * `FAQPage`. Deux textes qui devaient rester identiques sans que rien ne le
 * garantisse — or Google exige que le schéma corresponde au contenu visible.
 * Les deux consomment désormais ce tableau ; la réponse du schéma est dérivée de
 * `answerHtml` en retirant le balisage.
 *
 * REGISTRE. Cette FAQ est délibérément écrite en langage de REQUÊTE (« Comment
 * calculer mes cotisations URSSAF en tant que médecin libéral ? ») alors que celle
 * de `/faq` est en langage parlé (« Combien ça coûte ? »). La première capte, la
 * seconde rassure. Ne pas uniformiser les deux.
 *
 * ⚠️ Les `id` sont des slugs STABLES, et non plus la position dans la liste.
 * L'instrumentation était `landing_faq_<n>` : réordonner la liste changeait donc
 * silencieusement le sens des données passées. Les événements historiques
 * `landing_faq_1`…`landing_faq_10` gardent leur ancienne signification.
 */

export interface FaqAccueilItem {
  /** Slug stable — sert à `data-ph="landing_faq_<id>"`. Ne jamais le renommer. */
  id: string;
  question: string;
  /** HTML autorisé : `<strong>` et liens internes vers le blog. */
  answerHtml: string;
}

/**
 * Ordre : les cinq premières suivent la demande réelle mesurée (ouvertures de
 * l'accordéon sur 150 jours), la position pesant beaucoup sur le taux d'ouverture.
 * La question « internes » était en 9ᵉ position alors qu'elle est la 4ᵉ la plus
 * ouverte — les gens descendaient la chercher.
 */
export const FAQ_ACCUEIL: FaqAccueilItem[] = [
  {
    id: 'activite-mixte',
    question: "Hippodoc gère-t-il l'activité mixte libéral et salariat ?",
    answerHtml: `Oui, Hippodoc est conçu pour les médecins qui combinent <strong>plusieurs types d'activité</strong>. Tu peux suivre tes revenus <strong>libéraux</strong> (remplacements, cabinet propre, vacations, <strong>collaborations libérales</strong>) et <strong>salariés</strong> (hôpital, gardes, centres de santé) dans un seul outil, avec un <strong>Super-Net global</strong> qui prend tout en compte. Pour comparer les deux statuts, lis <a href="/blog/salariat-vs-liberal">salariat ou libéral : ce que ça change vraiment</a>.`,
  },
  {
    id: 'urssaf',
    question: 'Comment calculer mes cotisations URSSAF en tant que médecin libéral ?',
    answerHtml: `Hippodoc calcule <strong>automatiquement</strong> tes cotisations sociales grâce à une connexion directe aux <strong>serveurs officiels de l'URSSAF</strong>. Selon ton régime (<strong>RSPM</strong> ou <strong>PAMC</strong>), tu obtiens une estimation <strong>précise</strong> de tes cotisations <strong>URSSAF</strong> et <strong>CARMF</strong>, mise à jour à chaque nouvelle journée enregistrée. Pour comprendre le détail : <a href="/blog/tout-comprendre-urssaf">tout comprendre sur l'URSSAF</a> et <a href="/blog/tout-comprendre-carmf">sur la CARMF</a>.`,
  },
  {
    id: 'regime-fiscal',
    question: 'Quel est le meilleur régime fiscal pour un médecin libéral ?',
    answerHtml: `Le choix entre <strong>Micro-BNC</strong> et <strong>régime réel</strong> dépend de tes charges réelles. Hippodoc intègre un <strong>simulateur fiscal</strong> qui compare les deux régimes avec tes données. En général, le Micro-BNC est avantageux si tes charges sont <strong>inférieures à 34 %</strong> de ton chiffre d'affaires. Le détail avec des cas chiffrés : <a href="/blog/regime-fiscal-micro-bnc-vs-reel">Micro-BNC ou réel, comment choisir</a>.`,
  },
  {
    id: 'internes',
    question: 'Je suis interne : à quoi Hippodoc me sert avant mes premiers remplacements ?',
    answerHtml: `Dès ton <strong>premier semestre</strong>. Tu suis tes <strong>gardes hospitalières</strong>, ton <strong>salaire d'interne</strong> et tes <strong>frais réels</strong> (logement de stage, déplacements CHU, congrès, livres médicaux) — ceux-là mêmes que tu déduiras de ta déclaration. Et tu prépares ton passage en <strong>remplacement libéral</strong> sans découvrir l'administratif le jour J. Un <strong>tarif réduit</strong> s'applique pendant toute ta formation (<a href="/#pricing">voir les tarifs</a>). Pour la partie impôts : <a href="/blog/guide-impots-internes-remplacants">le guide des impôts pour internes et remplaçants</a>.`,
  },
  {
    id: 'debutants',
    question: "Je débute et je n'y connais rien en comptabilité — c'est jouable ?",
    answerHtml: `Oui, aucune connaissance comptable n'est requise : l'application te guide <strong>pas à pas</strong>, et tu n'as jamais à savoir dans quelle case va quoi. Tu bénéficies automatiquement du <strong>régime RSPM</strong> tant que tes revenus restent sous <strong>38 000 €</strong>, ce qui simplifie fortement tes cotisations. Des exemples chiffrés : <a href="/blog/rspm-exemples-concrets">le RSPM en cas concrets</a>.`,
  },
  {
    id: 'tarifs',
    question: 'Combien coûte Hippodoc ?',
    answerHtml: `<strong>29 € par mois</strong>, ou <strong>19 € par mois</strong> en facturation annuelle. Tout est inclus : aucune option payante, aucune limite au nombre de journées ou de lieux d'exercice. L'<strong>essai est gratuit pendant 30 jours</strong>, sans carte bancaire. Des <strong>tarifs réduits</strong> existent pour les internes et les médecins en fin d'internat : le détail est dans la <a href="/#pricing">section tarifs</a> juste au-dessus. Le comparatif complet est sur la page <a href="/tarifs">tarifs</a>.`,
  },
  {
    id: 'revenus-remplacant',
    question: 'Comment gérer mes revenus de médecin remplaçant ?',
    answerHtml: `Hippodoc <strong>centralise</strong> toute ton activité en un seul endroit. Tu enregistres chaque journée avec le lieu d'exercice, le montant encaissé et la rétrocession. Le tableau de bord affiche <strong>en temps réel</strong> tes revenus <strong>encaissés</strong>, <strong>en attente</strong>, et ton <strong>Super-Net</strong> estimé après cotisations et impôts. Pour situer tes tarifs : <a href="/blog/salaires-medecins-remplacants">combien gagne un médecin remplaçant</a>.`,
  },
  {
    id: 'super-net',
    question: 'Comment estimer mon revenu net après impôts en tant que médecin ?',
    answerHtml: `Avec le <strong>Super-Net</strong> d'Hippodoc, tu vois ton <strong>vrai revenu</strong> après <strong>URSSAF</strong>, <strong>CARMF</strong> et <strong>impôts</strong>. Tout est calculé selon ta situation réelle (<strong>régime fiscal</strong>, <strong>famille</strong>, <strong>revenus salariés</strong>), sans mauvaise surprise en fin d'année. Tu peux l'essayer tout de suite, sans compte, avec le <a href="/simulateur">simulateur de revenus</a>.`,
  },
  {
    id: 'retrocessions',
    question: 'Comment suivre mes paiements en attente de rétrocession ?',
    answerHtml: `Hippodoc distingue automatiquement les journées <strong>payées</strong> de celles <strong>en attente</strong>. Tu visualises d'un coup d'œil les montants à percevoir, avec des <strong>alertes</strong> pour les <strong>paiements tardifs</strong>. Tu peux même envoyer des <strong>relances</strong> directement depuis l'application.`,
  },
  {
    id: 'collaboration',
    question: 'Comment fonctionne la collaboration libérale sur Hippodoc ?',
    answerHtml: `Hippodoc gère nativement la <strong>collaboration libérale</strong>. Tu enregistres ton lieu d'exercice avec ton <strong>taux de redevance</strong>, et chaque mois la redevance due est <strong>calculée automatiquement</strong> à partir de tes recettes encaissées. Le suivi <strong>payé/à verser</strong> est intégré, et la redevance est ventilée en <strong>ligne L16/BG</strong> de ta déclaration 2035, <strong>déductible</strong> de ton bénéfice imposable. Voir <a href="/blog/remplir-declaration-2035">comment remplir sa 2035</a>.`,
  },
  {
    id: 'contrats',
    question: 'Peut-on générer des contrats de remplacement médical ?',
    answerHtml: `Oui, Hippodoc permet de générer des <strong>contrats de remplacement</strong> conformes aux exigences de l'<strong>Ordre des médecins</strong>. Tu renseignes les informations (dates, lieu d'exercice, conditions) et le <strong>contrat PDF</strong> est généré avec <strong>signature électronique</strong> intégrée. Ce qu'il faut vérifier avant de signer : <a href="/blog/signer-contrat-remplacement">signer un contrat de remplacement</a>.`,
  },
];

/** Réponse en texte brut, pour le JSON-LD (le schéma n'accepte pas de balisage). */
export function reponseTexte(item: FaqAccueilItem): string {
  return item.answerHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
