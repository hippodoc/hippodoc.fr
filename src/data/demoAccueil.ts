/**
 * Compte de démonstration de l'accueil (DA 2026, MIGRATION.md § 9).
 *
 * UN SEUL jeu de chiffres, FICTIF, pour tout ce que l'accueil montre de
 * l'application : les fiches du premier écran (Hero.astro), les quatre vues de la
 * fenêtre produit (FenetreProduit.astro) et les trois grandes cases
 * (TroisCases.astro). Les totaux sont CALCULÉS ici, jamais recopiés : deux blocs
 * ne peuvent plus afficher deux montants différents pour la même chose.
 *
 * Ce ne sont pas les chiffres d'un vrai compte. La page ne le dit plus (mention
 * « Compte de démonstration » retirée à la demande du propriétaire, MIGRATION.md
 * § 9.fj : un aperçu d'application se lit comme tel).
 * Seule l'arithmétique est contrôlée : la vraisemblance fiscale du jeu « année »
 * (cotisations et impôt pour ce niveau d'honoraires) n'a pas été recoupée avec
 * le simulateur.
 */

/** L'année du compte (2026 depuis § 9.fj, 2025 avant) : ce qui a été encaissé, et ce qui en part. */
export const DEMO_ANNEE = {
  an: 2026,
  encaisse: 90005,
  urssaf: 6386,
  carmf: 11752,
  impots: 12324,
} as const;

/** URSSAF + CARMF + impôts. */
export const DEMO_A_METTRE_DE_COTE = DEMO_ANNEE.urssaf + DEMO_ANNEE.carmf + DEMO_ANNEE.impots;
/** Ce qu'il reste : encaissé, moins tout le reste. */
export const DEMO_SUPER_NET = DEMO_ANNEE.encaisse - DEMO_A_METTRE_DE_COTE;
/** Part de l'encaissé qui reste, en pour cent entiers (un résultat, pas un taux de calcul). */
export const DEMO_PART_NETTE = Math.round((100 * DEMO_SUPER_NET) / DEMO_ANNEE.encaisse);

export type EtatJournee = 'paye' | 'attente' | 'planifie';

/** Libellé de chaque état, et variante de pastille (`.chip` de da.css). */
export const DEMO_ETATS: Record<EtatJournee, { libelle: string; chip: 'ok' | 'wait' | 'plan' }> = {
  paye: { libelle: 'Payé', chip: 'ok' },
  attente: { libelle: 'En attente', chip: 'wait' },
  planifie: { libelle: 'Planifié', chip: 'plan' },
};

/** Mois en cours du compte de démonstration. `mois` : 1 = janvier. */
export const DEMO_MOIS = { nom: 'Avril', an: 2026, mois: 4 } as const;

export interface JourneeDemo {
  jour: number;
  lieu: string;
  montant: number;
  etat: EtatJournee;
}

/** Journées travaillées du mois, dans l'ordre. Noms fictifs. */
export const DEMO_JOURNEES: JourneeDemo[] = [
  { jour: 1, lieu: 'Dujardin S.', montant: 2250, etat: 'paye' },
  { jour: 3, lieu: 'Valérie J.', montant: 1785, etat: 'paye' },
  { jour: 6, lieu: 'Valérie J.', montant: 2210, etat: 'paye' },
  { jour: 7, lieu: 'Dujardin S.', montant: 1425, etat: 'paye' },
  { jour: 8, lieu: 'Dujardin S.', montant: 2550, etat: 'paye' },
  { jour: 13, lieu: 'Valérie J.', montant: 1955, etat: 'paye' },
  { jour: 15, lieu: 'Dujardin S.', montant: 2625, etat: 'attente' },
  { jour: 19, lieu: 'Cabinet M.', montant: 1500, etat: 'attente' },
  { jour: 20, lieu: 'Cabinet M.', montant: 1200, etat: 'planifie' },
  { jour: 22, lieu: 'Cabinet M.', montant: 1200, etat: 'planifie' },
];

/** Jours sans remplacement notés au calendrier (du … au …, bornes comprises). */
export const DEMO_HORS_ACTIVITE = [
  { du: 10, au: 10, libelle: 'DPC' },
  { du: 23, au: 26, libelle: 'WE prolongé' },
] as const;

/** Les paiements attendus : journées faites, pas encore réglées. */
export const DEMO_EN_ATTENTE = DEMO_JOURNEES.filter((j) => j.etat === 'attente');
export const DEMO_A_RECEVOIR = DEMO_EN_ATTENTE.reduce((somme, j) => somme + j.montant, 0);

/** « 90 005 € » : milliers séparés par une espace. À poser dans un élément qui
    ne coupe pas la ligne (classe `num`), ou à passer par `insecable()`. */
export function euros(montant: number): string {
  return `${String(montant).replace(/\B(?=(\d{3})+$)/g, ' ')} €`;
}

/** Montant d'une journée : précédé d'un tilde tant qu'elle n'est que planifiée. */
export function montantJournee(j: JourneeDemo): string {
  return (j.etat === 'planifie' ? '~' : '') + euros(j.montant);
}

/** Pour un montant écrit au fil d'une phrase : espaces insécables. */
export function insecable(texte: string): string {
  return texte.replace(/ /g, ' ');
}

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
/** Jour de la semaine d'un jour du mois de démonstration : 0 = dimanche. */
export function rangDansLaSemaine(jour: number): number {
  return new Date(Date.UTC(DEMO_MOIS.an, DEMO_MOIS.mois - 1, jour)).getUTCDay();
}
/** « lun. 13 » : le jour de la semaine est calculé, pas recopié. */
export function jourCourt(jour: number): string {
  return `${JOURS[rangDansLaSemaine(jour)]} ${jour}`;
}

/** Journée du mois par son quantième (pour les extraits qui n'en montrent que quelques-unes). */
export function journee(jour: number): JourneeDemo {
  const trouvee = DEMO_JOURNEES.find((j) => j.jour === jour);
  if (!trouvee) throw new Error(`demoAccueil : aucune journée le ${jour}`);
  return trouvee;
}
