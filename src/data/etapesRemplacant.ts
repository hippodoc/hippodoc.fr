/**
 * Les 7 étapes du parcours du médecin remplaçant, MOT POUR MOT telles qu'elles
 * étaient sur l'ancienne accueil, dans src/components/home/JourneySection.astro
 * (profil « remplacant » ; composant supprimé en phase 4a, à lire dans
 * l'historique git). Ne rien y réécrire : tout changement de texte se déclare dans
 * MIGRATION.md § 9.
 *
 * Un seul bloc de l'accueil s'en sert depuis l'épure de novembre 2026 :
 * « Pour qui » (PourQui.astro, par parcoursAccueil.ts), où le profil Remplaçant
 * affiche les sept étapes entières (titre, phrase d'accroche, ligne de détail)
 * et le profil Vacataire les quatre dernières. Jusque-là, les trois cases de
 * « Sous la surface » en portaient le titre et l'accroche, et l'onglet
 * Remplaçant le titre et le détail : les mêmes étapes étaient dites deux fois.
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
