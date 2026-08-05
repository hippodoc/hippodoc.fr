/**
 * Exemples canoniques pré-remplis pour la calculette publique.
 * Onboarding U5 — un médecin peut visualiser un cas type en 1 clic.
 */
import { CALCULETTE_DEFAULTS, type CalculetteFormValues } from './calculetteSchema';

export interface CalculetteExample {
  id: string;
  label: string;
  description: string;
  values: CalculetteFormValues;
}

export const CALCULETTE_EXAMPLES: CalculetteExample[] = [
  {
    id: 'interne-precoce',
    label: 'Interne — début de stage, quelques remplas (4 k€, RSPM)',
    description:
      "Tu es interne et tu fais quelques gardes ou remplacements à côté de ton stage. Ton salaire CHU se déclare à part en case 1AJ de la 2042 (hors calculette). Ici, on traite uniquement tes revenus de remplacement libéraux : micro-BNC, RSPM (pas de DSFU à remplir tant que tes recettes restent < 38 k€).",
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'rspm',
      annee: 2025,
      recettesMicroBnc: 4000,
    },
  },
  {
    id: 'interne-avance',
    label: 'Interne — fin d\'internat, remplas réguliers (12 k€, RSPM)',
    description:
      "Tu es en fin d'internat et tu remplaces régulièrement (weekends, vacances, périodes sans stage). Ton salaire CHU reste à déclarer séparément en case 1AJ de la 2042 (hors calculette). Cette calculette ne traite que tes revenus de remplacement libéraux : micro-BNC, RSPM (cotisations URSSAF via la DRI, pas de DSFU à remplir).",
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'rspm',
      annee: 2025,
      recettesMicroBnc: 12000,
    },
  },
  {
    id: 'remplacant-rspm-micro',
    label: 'Remplaçant débutant — 25 k€ (RSPM)',
    description: 'Médecin remplaçant non-titulaire en RSPM (recettes < 38 k€). Pas de DSFU à remplir, cotisations URSSAF via la DRI.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'rspm',
      annee: 2025,
      recettesMicroBnc: 25000,
    },
  },
  {
    id: 'remplacant-reel',
    label: 'Remplaçant pur — 60 k€ (réel, PAMC)',
    description: 'Médecin remplaçant à plein temps, BNC réel, AGA, IJ Madelin. Au-delà de 38 k€ → PAMC.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2025,
      // Doctrine PM-002 : les rétrocessions perçues par un remplaçant S1
      // sont des honoraires conventionnels → AA (pas AF). AF reste réservé
      // aux gains hors conventionnel (IJ Madelin, expertises, MSU…).
      AA: 60000,
      AF: 1200,         // = IJ Madelin perçues, déjà comptées en gains divers
      CE: 42000,
      CN: 0,
      BK: 12500,
      BV: 1800,
      CP: 42000,
      ijMadelin: 1200,
      sousPostes: {
        ...CALCULETTE_DEFAULTS.sousPostes,
        ijMadelinDansAF: 1200,
      },
    },
  },
  {
    id: 'installe-s1-reel',
    label: 'Installé S1 — 110 k€ (réel)',
    description: 'Médecin généraliste installé secteur 1, BNC réel, ROSP/MT.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2025,
      AA: 95000,
      AF: 15000,
      CE: 75000,
      CN: 0,
      BK: 24500,
      BV: 3400,
      CP: 75000,
      ijCpam: 0,
      ijMadelin: 800,
    },
  },
  {
    id: 'installe-s2-reel',
    label: 'Installé S2 / OPTAM — 130 k€ (réel)',
    description: 'Médecin secteur 2 / OPTAM avec dépassements d\'honoraires : ratio DSAU < 1.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s2',
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2025,
      AA: 120000,        // recettes conventionnées (hors dépassements)
      AF: 8000,
      depassements: 18000,
      CE: 85000,
      CN: 0,
      BK: 27000,
      BV: 3800,
      CP: 85000,
      ijMadelin: 1500,
    },
  },
  {
    id: 'mixte-reel',
    label: 'Installé S1 + dépassements autorisés — 80 k€',
    description: 'Médecin S1 avec quelques actes en dépassement (DP, hors nomenclature). Cumule forfaits S1 + DSAU dynamique.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      depassementsAutorises: true,
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2025,
      AA: 80000,
      AF: 2500,
      CE: 58000,
      CN: 0,
      BK: 18000,
      BV: 2600,
      CP: 58000,
      ijMadelin: 2500,
      sousPostes: {
        ...CALCULETTE_DEFAULTS.sousPostes,
        ijMadelinDansAF: 2500,
      },
    },
  },
  {
    id: 'micro-bnc-50k',
    label: 'Remplaçant Micro-BNC — 50 k€ (PAMC)',
    description: 'Remplaçant Micro-BNC au-delà de 38 k€ : DSFU complète, régime PAMC.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'pamc',
      annee: 2025,
      recettesMicroBnc: 50000,
      retrocessionsVerseesMicroBnc: 0,
      ijMadelin: 600,
    },
  },
  // Refonte mai 2026 — Audit pré-prod final : 4 archétypes additionnels pour
  // couvrir S1 micro-BNC, millésime 2026 courant, PDSA exonérée Art. 151 ter,
  // exonération zonée ZFU/ZFRR Micro-BNC, et la régression revenus 2024.
  {
    id: 'installe-s1-micro-2026',
    label: 'Installé S1 Micro-BNC — 60 k€ (revenus 2026)',
    description: 'Médecin S1 en début d\'installation, sous le seuil Micro-BNC 83 600 € (2026+). Régime PAMC obligatoire dès le 1er € (DSFU à remplir intégralement — contrairement au remplaçant en RSPM).',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'pamc',
      annee: 2026,
      recettesMicroBnc: 60000,
      retrocessionsVerseesMicroBnc: 0,
      ijMadelin: 1100,
    },
  },
  {
    id: 'installe-s2-micro',
    label: 'Installé S2 / OPTAM Micro-BNC — 70 k€ (revenus 2026)',
    description: 'Médecin S2 sous le plafond Micro-BNC : DSAU dynamique calculée à partir des dépassements inclus dans les recettes brutes. PAMC obligatoire.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s2',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'pamc',
      annee: 2026,
      recettesMicroBnc: 70000,
      depassements: 9500,
    },
  },
  {
    id: 'pdsa-zone-rurale',
    label: 'Installé S1 réel — 95 k€ + PDSA exonérée 8 k€',
    description: 'Médecin S1 zone déficitaire avec PDSA Art. 151 ter : majorations CRD/CRS exonérées d\'IR. Déduction via ligne CI (cadre 7) de la 2035 → réintégration sociale automatique en DSDE.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2025,
      AA: 87000,
      AF: 8000,
      pdsaExonereBrut: 8000,
      CI: 8000,
      CE: 62000,
      BK: 19500,
      BV: 2800,
      CP: 62000,
    },
  },
  {
    id: 'zfu-installation-micro',
    label: 'Installé S1 Micro-BNC — ZFU-TE 25 k€, installé en septembre 2025 (plafond année 1)',
    description: 'Médecin installé en Zone Franche Urbaine — Territoires Entrepreneurs (CGI Art. 44 octies A) en septembre 2025. La calculette ajuste automatiquement le **plafond annuel** (50 000 € × 4/12 ≈ 16 667 €) en mois entiers (BOFiP BOI-BIC-CHAMP-80-10-20-20 §80). Le bénéfice (25 000 × 0,66 = 16 500 €) reste sous le plafond ajusté ⇒ tout exonéré, 5HP ≈ 16 500 €. Le bénéfice lui-même n\'est PAS prorata-isé : seul le plafond l\'est.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'pamc',
      annee: 2025,
      recettesMicroBnc: 70000,
      recettesZoneExo: 25000,
      zoneExoneree: 'zfu',
      anneeInstallationZone: 2025,
      moisInstallation: 9,
    },
  },
  {
    id: 'zfu-plafond-sature',
    label: 'Installé S1 Micro-BNC — ZFU plafond saturé 130 k€ (cas canonique)',
    description: 'Cas canonique : 130 000 € de recettes, intégralement en ZFU-TE année 1 (plafond plein 50 000 € accepté par le SIE, sans prorata). 5HP plafonné à 50 000 €, surplus brut équivalent (75 758 €) réinjecté en 5HQ ≈ 54 242 €. Bénéfice imposable final ≈ 35 800 €. URSSAF/CARMF dues sur la totalité (DSCS = 130 000 €).',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'installe_s1',
      regimeFiscal: 'micro_bnc',
      regimeSocial: 'pamc',
      annee: 2025,
      recettesMicroBnc: 130000,
      recettesZoneExo: 130000,
      zoneExoneree: 'zfu',
      anneeInstallationZone: 2025,
    },
  },
  {
    id: 'remplacant-reel-2024',
    label: 'Remplaçant réel — 55 k€ (revenus 2024, déclaration 2025)',
    description: 'Cas de régularisation : médecin remplaçant qui déclare ses revenus 2024 en retard (ex. relance fiscale, oubli). Barème IR 2025 sur revenus 2024.',
    values: {
      ...CALCULETTE_DEFAULTS,
      profil: 'remplacant',
      regimeFiscal: 'reel',
      regimeSocial: 'pamc',
      annee: 2024,
      AA: 55000,
      AF: 900,
      CE: 38000,
      BK: 11200,
      BV: 1650,
      CP: 38000,
      ijMadelin: 900,
      sousPostes: {
        ...CALCULETTE_DEFAULTS.sousPostes,
        ijMadelinDansAF: 900,
      },
    },
  },
];
