/**
 * « Inclus dans toutes les offres » : les lignes de FeaturesListModal.tsx de la
 * SPA source, mot pour mot, rangées en quatre familles (MIGRATION.md § 9.gs ;
 * seuls les titres des familles sont nouveaux). « Abonnement 100 % déductible »
 * n'y est plus : la règle entière est dans les garanties de /tarifs et dans la
 * mention du bas des tarifs de l'accueil.
 *
 * Une seule source pour /tarifs (feuille « Inclus dans toutes les offres ») et
 * pour le pli « Détail des offres » des tarifs de l'accueil (§ 9.hh) : un libellé
 * se change ici, et les deux pages le disent pareil. Google Agenda reçoit un
 * export .ics de l'application : jamais « synchro » (§ 9.hg).
 */
export interface FamilleInclus {
  titre: string;
  lignes: string[];
}

export const FAMILLES_INCLUS: FamilleInclus[] = [
  {
    titre: 'Revenus et cotisations',
    lignes: [
      'Super-Net calculé en temps réel',
      'Calcul URSSAF, CARMF et impôts en temps réel',
      'RSPM et PAMC pris en charge',
      'Gestion activité mixte libéral et salariat',
      'PDSA et revenus exonérés intégrés',
    ],
  },
  {
    titre: 'Déclarations et compta',
    lignes: [
      'Déclarations fiscales guidées',
      'Micro-BNC et régime réel intégrés',
      'Suivi des charges et amortissements',
      'Statistiques et exports comptables instantanés',
    ],
  },
  {
    titre: 'Quotidien du remplaçant',
    lignes: [
      'Dashboard clair et intuitif',
      'Planning centralisé, export Google Agenda',
      'Génération rapide de contrats',
      'Génération rapide de factures avec notes',
    ],
  },
  {
    titre: 'Entraide, support et données',
    lignes: [
      "Forum privé d'entraide entre médecins",
      'Support réactif et humain',
      "Données sécurisées et hébergées dans l'Union européenne",
    ],
  },
];
