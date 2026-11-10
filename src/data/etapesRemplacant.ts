/**
 * Les 7 étapes du parcours du médecin remplaçant, MOT POUR MOT telles qu'elles
 * étaient sur l'ancienne accueil, dans src/components/home/JourneySection.astro
 * (profil « remplacant » ; composant supprimé en phase 4a, à lire dans
 * l'historique git). Ne rien y réécrire : tout changement de texte se déclare dans
 * MIGRATION.md § 9.
 *
 * Deux blocs de la nouvelle accueil (DA 2026) s'en servent :
 *  - « Sous la surface » (TroisCases.astro) : `titre` et `accroche`, en trois
 *    cases (étapes 1 à 3, 4 à 6, puis 7) ;
 *  - « Pour qui », onglet Remplaçant : `titre` et `detail`.
 */
export interface EtapeRemplacant {
  titre: string;
  accroche: string;
  detail: string;
}

export const ETAPES_REMPLACANT: EtapeRemplacant[] = [
  {
    titre: 'Tu centralises tes journées',
    accroche: 'Tous tes cabinets dans un calendrier, synchronisé avec Google Agenda.',
    detail: "Codes d'accès, consignes et taux notés par lieu, fiche de passation prête.",
  },
  {
    titre: 'Tu suis tes rétrocessions au centime',
    accroche: 'Payée, en attente, planifiée : plus jamais un virement oublié.',
    detail: 'Vacations en centre de santé et PDSA suivies de la même façon.',
  },
  {
    titre: 'Tes factures et tes contrats, prêts en 2 clics',
    accroche: 'Honoraires conformes, IBAN pré-rempli, contrat de remplacement généré.',
    detail: 'Archivage horodaté, envoi par email, suivi CDOM — depuis ton téléphone.',
  },
  {
    titre: 'Tes charges déductibles ne se perdent plus',
    accroche: 'Kilomètres, matériel, formation, RCP : catégorisés et prêts pour la déclaration.',
    detail: 'Justificatifs stockés, barème kilométrique officiel intégré.',
  },
  {
    titre: 'URSSAF et CARMF anticipées',
    accroche: 'Cotisations calculées via le serveur officiel URSSAF, échéancier à jour après chaque journée.',
    detail: 'Le montant à mettre de côté chaque mois, et les échéances rappelées à temps.',
  },
  {
    titre: 'Ta déclaration, case par case',
    accroche: '2035 ou 2042-C PRO pré-remplies avec tes chiffres, aide DSFU URSSAF incluse.',
    detail: 'Exports Excel / PDF à transmettre à ton comptable si tu en as un.',
  },
  {
    titre: 'Ton Super-Net, le seul chiffre qui compte',
    accroche: 'Brut → cotisations → impôt → ce qui te reste vraiment dans la poche.',
    detail: 'Objectif annuel, stats N vs N-1 et simulateur « et si… » inclus.',
  },
];
