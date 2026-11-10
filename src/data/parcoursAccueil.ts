/**
 * Les quatre profils du bloc « Pour qui » de l'accueil (DA 2026, phase 3,
 * MIGRATION.md § 9) : remplaçant, interne, vacataire, activité mixte
 * (décision du propriétaire, 10 novembre 2026 ; « collaborateur » et
 * « installé » ne sont plus sur l'accueil).
 *
 * MOT POUR MOT : les étapes « interne » et « mixte » viennent de
 * src/components/home/JourneySection.astro (supprimé en phase 4a, à lire dans
 * l'historique git), celles du remplaçant de
 * etapesRemplacant.ts. Ne rien y réécrire : tout changement de texte se
 * déclare dans MIGRATION.md § 9.
 *
 * - Remplaçant : titre et ligne de détail seulement. Les phrases d'accroche
 *   sont déjà dans le bloc « Sous la surface », juste au-dessus.
 * - Vacataire : ce profil n'existait pas. Deux étapes NOUVELLES (les deux
 *   premières, listées en § 9), puis quatre étapes reprises du remplaçant.
 *   « Vacataire » s'entend comme ailleurs sur le site : un libéral payé à la
 *   vacation par une structure (src/data/boussoleData.ts, /faq).
 * - `id` : c'est la valeur `profile` des événements PostHog
 *   (`landing_journey_profile_selected`) et la fin de l'identifiant de la radio
 *   (`parcours-<id>`), que lit src/lib/landing-analytics.ts.
 */
import { ETAPES_REMPLACANT } from './etapesRemplacant';

export interface EtapeParcours {
  titre: string;
  /** Absente pour le remplaçant (déjà dans « Sous la surface »). */
  accroche?: string;
  detail: string;
}

export interface ProfilParcours {
  id: 'remplacant' | 'interne' | 'vacataire' | 'mixte';
  label: string;
  /** Précision affichée sous le libellé ; vide pour le remplaçant. */
  precision: string;
  etapes: EtapeParcours[];
}

export const PROFILS_PARCOURS: ProfilParcours[] = [
  {
    id: 'remplacant',
    label: 'Remplaçant',
    precision: '',
    etapes: ETAPES_REMPLACANT.map(({ titre, detail }) => ({ titre, detail })),
  },
  {
    id: 'interne',
    label: 'Interne',
    precision: 'hôpital + remplacements',
    etapes: [
      {
        titre: 'Hôpital et remplacements dans un seul calendrier',
        accroche: "Gardes, stages et journées en cabinet, distingués d'un coup d'œil.",
        detail: 'Export ICS, couleurs libéral / salarié, saisie depuis ton téléphone.',
      },
      {
        titre: 'Tes deux revenus au même endroit',
        accroche: 'Salaires hospitaliers et rétrocessions réunis, statuts de paiement suivis.',
        detail: 'PDSA et majorations exonérées gérées automatiquement.',
      },
      {
        titre: 'Tes premières factures et ton premier contrat',
        accroche: "Note d'honoraires conforme et contrat de remplacement générés pour toi.",
        detail: 'Modèles adaptés aux étudiants avec licence de remplacement.',
      },
      {
        titre: 'Tu comprends enfin tes cotisations',
        accroche: "RSPM, seuils, dispense CARMF : ce qui s'applique vraiment à toi, expliqué simplement.",
        detail: 'Le montant à mettre de côté chaque mois, dès ta 1re journée.',
      },
      {
        titre: 'Ta 1re déclaration sans panique',
        accroche: 'Quelles cases remplir, dans quel ordre, avec tes chiffres déjà dedans.',
        detail: 'Salaires + libéral réunis, échéances rappelées, rien à deviner.',
      },
      {
        titre: 'Ton Super-Net hôpital + libéral',
        accroche: "Ce qu'il te reste vraiment quand tu additionnes tes deux activités.",
        detail: 'Charges déductibles suivies dès maintenant, projections incluses.',
      },
    ],
  },
  {
    id: 'vacataire',
    label: 'Vacataire',
    precision: 'centre / maison de santé',
    etapes: [
      // Deux étapes nouvelles (faits déjà publiés sur /faq et dans la boussole).
      {
        titre: 'Tes vacations dans le même calendrier',
        accroche:
          'Centre de santé, maison de santé, cabinet : autant de lieux que tu veux, chacun avec ses règles de calcul.',
        detail: 'Récurrences possibles, par exemple tous les mercredis au centre médical.',
      },
      {
        titre: 'Tes honoraires suivis, structure par structure',
        accroche: 'La structure te verse tes honoraires : payés, en attente, planifiés.',
        detail: 'PDSA suivie de la même façon.',
      },
      // Quatre étapes reprises du remplaçant : charges, cotisations, déclaration, Super-Net.
      ...ETAPES_REMPLACANT.slice(3),
    ],
  },
  {
    id: 'mixte',
    label: 'Mixte',
    precision: 'libéral + salariat',
    etapes: [
      {
        titre: 'Un calendrier pour tes deux mondes',
        accroche: 'Journées libérales et vacations salariées côte à côte, clairement distinguées.',
        detail: 'Gardes, PDSA et remplacements inclus.',
      },
      {
        titre: 'Tes deux sources de revenus réunies',
        accroche: 'Libéral, salaires, PDSA : un seul tableau de bord, plus de calculs croisés.',
        detail: 'Factures libérales et contrats générés au même endroit.',
      },
      {
        titre: 'Tes charges des deux côtés',
        accroche: 'Charges libérales déductibles et frais réels salariés traités séparément, sans mélange.',
        detail: 'Comparaison frais réels vs abattement 10 % chiffrée pour toi.',
      },
      {
        titre: "Cotisations et impôt sur l'ensemble",
        accroche: "Abattement salarié et bénéfice BNC combinés dans un seul calcul d'IR.",
        detail: 'Quotient familial pris en compte, échéancier URSSAF / CARMF à jour.',
      },
      {
        titre: 'Une seule déclaration pour deux activités',
        accroche: '2042 et 2042-C PRO (ou 2035) pré-remplies, salaires et BNC à la bonne case.',
        detail: 'Aide DSFU URSSAF, échéances rappelées, exports pour ton comptable.',
      },
      {
        titre: 'Ton Super-Net global',
        accroche: "Ce qu'il te reste après cotisations et impôt, toutes activités confondues.",
        detail: 'Répartition transparente libéral / salarié, stats et projections.',
      },
    ],
  },
];
