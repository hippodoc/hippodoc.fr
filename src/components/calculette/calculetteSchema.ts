import { z } from 'zod';
import { capChequesVacances } from '@/lib/taxParams/declarationParams';

/**
 * Schéma Zod de la calculette publique 2042-C PRO + DSFU (ex DS-PAMC).
 *
 * V1 — 22 inputs scellés (2035-B + extras + cadre 8 millésime 2026).
 * V2 — Mode "Assistance secteur 1" optionnel pour auto-calculer Forfait 2 % / 3 % / Groupe III.
 * V3 — Profil utilisateur + régime fiscal (réel / micro-BNC) + recettes brutes micro.
 *
 * Le moteur (`calculerDSPAMC`) applique les garde-fous métier :
 * cap chèques-vacances dynamique, cumul DG + DH (doctrine BOI-BNC-SECT-40), routage RBS<0 vers DSDG, etc.
 */
// Pas de multipleOf(0.01) : trop fragile avec les flottants IEEE-754.
// L'arrondi 2 décimales est garanti côté moteur (`round2`).
const money = z
  .number({ invalid_type_error: 'Saisis un nombre' })
  .min(0, { message: 'Le montant doit être ≥ 0' })
  .default(0);

const sousPostesSchema = z
  .object({
    DE: money,
    HN: money,
    MSU: money,
    expertises: money,
    etudes: money,
    ijMadelinDansAF: money,
    pdsaExonere: money,
  })
  .default({
    DE: 0,
    HN: 0,
    MSU: 0,
    expertises: 0,
    etudes: 0,
    ijMadelinDansAF: 0,
    pdsaExonere: 0,
  });

export const REGIMES = ['reel', 'micro_bnc'] as const;
export type RegimeFiscal = typeof REGIMES[number];

export const PROFILS = ['remplacant', 'installe_s1', 'installe_s2', 'mixte'] as const;
export type ProfilCalculette = typeof PROFILS[number];

/**
 * Régime social URSSAF.
 *  - `rspm` : Régime Simplifié des Praticiens Médicaux. Réservé aux remplaçants
 *    conventionnés non-titulaires. AUCUNE DSFU à remplir : cotisations
 *    forfaitaires progressives calculées par l'URSSAF via la DRI
 *    (13,5 % ≤ 19 k€ / 21,2 % > 19 k€). CARMF : RID seul.
 *    Sources : Notice URSSAF DRI-PAMC, CSS Art. L646-1.
 *  - `pamc` : Praticiens et Auxiliaires Médicaux Conventionnés. Régime classique
 *    pour tout médecin installé, mixte, collaborateur, cabinet propre, ou
 *    remplaçant ≥ 38 000 € de recettes conventionnées. DSFU complète.
 *
 * **Choix manuel, jamais auto-bascule** : un remplaçant peut rester en RSPM
 * la première année au-delà de 38 k€ (bascule URSSAF à N+1). On suit la
 * doctrine app : pas de bascule mécanique au seuil (cf. mem
 * `dashboard-impots-ytd-regime-profil`).
 */
export const REGIMES_SOCIAUX = ['rspm', 'pamc'] as const;
export type RegimeSocial = typeof REGIMES_SOCIAUX[number];

/** Seuil pédagogique RSPM → PAMC (recettes conventionnées). Warning UI, pas blocage. */
export const SEUIL_RSPM = 38_000;

export const calculetteSchema = z
  .object({
    // V3 — Profil & régime
    profil: z.enum(PROFILS).default('installe_s1'),
    regimeFiscal: z.enum(REGIMES).default('reel'),
    /** Régime social URSSAF — défaut PAMC (cas dominant). RSPM réservé aux remplaçants purs. */
    regimeSocial: z.enum(REGIMES_SOCIAUX).default('pamc'),

    // Année des revenus (revenus N déclarés en N+1)
    annee: z.number().int().min(2024).max(2026).default(2025),

    // V3 — Micro-BNC (uniquement si regimeFiscal = 'micro_bnc')
    recettesMicroBnc: money,
    retrocessionsVerseesMicroBnc: money, // pré-déduites avant abatt. 34 % (CGI Art. 102 ter)

    // V18 — PDSA exonérée Art. 151 ter (majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN).
    // Exonérée d'IR mais SOUMISE aux cotisations sociales → sort de 5HQ/5QC.
    // Micro-BNC : reportée en NET (×0,66) sur DSFA. Réel : déduite via ligne CI (cadre 7) de la 2035-B → réintégrée automatiquement en DSDE/DSDG par le RBS (DSFA = 0 en réel).
    pdsaExonereBrut: money,

    // Bloc 1 — 2035-B principal (régime réel uniquement)
    AA: money, AF: money, CE: money, CN: money, BK: money, BV: money,
    CS: money, AW: money, CU: money, CI: money, CO: money, DG: money, CJ: money, DH: money,
    CP: z
      .number({ invalid_type_error: 'Saisis un nombre' })
      .default(0),

    // Bloc 2 — Données complémentaires (communes réel + micro)
    ijCpam: money, ijMadelin: money, ijCarmf: money,
    /** Phase 3B F5 : IJ CARMF temporaire (médecin actif) → DSCZ + AF/5HQ. Distinct de ijCarmf (pension 1AS) et ijCarmfInvalidite (1AZ). */
    ijCarmfTemporaire: money,
    /** Phase 3B F5 : IJ CARMF invalidité permanente → case 1AZ uniquement (depuis revenus 2024). */
    ijCarmfInvalidite: money,
    chequesVacances: money, depassements: money, ehpadHadSsiadCmpp: money,
    /** B3 — Si TRUE : les chèques-vacances sont déjà déduits dans CP (charges 2035) → ne pas re-soustraire en 5QC/5RC. */
    chequesVacancesDejaInclus: z.boolean().default(false),

    // Bloc 3 — Cadre 8 millésime 2026 (régime réel uniquement)
    cadre8DE: money,
    cadre8DB: money,

    // Bloc 4 — Assistance secteur 1 (V2, opt-in, régime réel + secteur 1 uniquement)
    assistanceActive: z.boolean().default(false),
    /** Choix utilisateur pour le pack à appliquer (persisté).
     *  Doctrine cumul DG + DH depuis revenus 2023 (BOI-BNC-SECT-40, UNASA §391). */
    choixAssistance: z.enum(['aucun', 'forfait3', 'groupeIII', 'cumul']).default('cumul'),
    sousPostes: sousPostesSchema,

    /**
     * Refonte UX mai 2026 — Le profil "mixte" (S1 + dépassements DP/hors nomenclature)
     * n'est plus exposé dans le menu (cas rare, ~2 % des médecins S1). Il devient un
     * état DÉRIVÉ : `effectiveProfil = (profil === 'installe_s1' && depassementsAutorises) ? 'mixte' : profil`.
     * La résolution est faite dans `useCalculetteResults`. L'enum interne `mixte` reste utilisé par le moteur.
     */
    depassementsAutorises: z.boolean().default(false),

    // V7 — U7 : préférence "afficher les cases à 0" persistée inter-sessions
    showZeros: z.boolean().default(false),

    // V22 — Toggle Déclarant 1 / Déclarant 2 (affichage uniquement, NON persisté).
    // Renomme les codes affichés (5HQ→5IQ, DSCS→DSDS, etc.) sans modifier les calculs.
    // Réinitialisé à 1 à chaque visite (cf. useCalculettePersistence).
    declarant: z.union([z.literal(1), z.literal(2)]).default(1),

    // Phase 14.10 — Exonération zonée Micro-BNC : SAISIE INTUITIVE + dégressivité + plafond.
    // Le médecin saisit (1) zone, (2) année d'installation en zone, (3) recettes brutes en zone.
    // La calculette dérive 5HP / 5HQ avec le bon taux dégressif et le bon plafond :
    //   • 5HP / 5IP = min(recettes_zone × 0,66 × taux, plafond)
    //   • 5HQ / 5IQ = recettes brutes totales − (5HP / 0,66)     ← surplus brut réinjecté si plafond saturé
    // Plafonds : ZFU 50 000 €/an (CGI Art. 44 octies A) · ZFRR 300 000 €/3 ans glissants (CGI Art. 44 quindecies).
    // Dégressivité : ZFU 5×100/60/40/20 — ZFRR 5×100/75/50/25.
    /** Recettes BRUTES réalisées en zone ZFU-TE / ZFRR (avant abattement 34 %). */
    recettesZoneExo: money,
    /** Zone d'exonération choisie. Requis si recettesZoneExo > 0. */
    zoneExoneree: z.enum(['aucune', 'zfu', 'zfrr']).default('aucune'),
    /** Année d'installation en zone (sert au calcul du taux dégressif). Requis si zone ≠ aucune. */
    anneeInstallationZone: z
      .number({ invalid_type_error: 'Saisis une année' })
      .int()
      .min(2000)
      .max(2030)
      .optional(),
    /**
     * Phase 14.12 — Mois d'installation en zone (1=janvier … 12=décembre).
     * Sert au prorata du PLAFOND ZFU année 1, EN MOIS ENTIERS
     * (BOFiP BOI-BIC-CHAMP-80-10-20-20 §80 — toute fraction de mois = 1 mois plein).
     * - Optionnel : si non saisi, fallback à 1 (janvier) ⇒ prorata = 1.0 (plafond plein).
     *   ⇒ comportement Phase 14.10 strictement préservé.
     * - Pertinent UNIQUEMENT si `anneeInstallationZone === annee` (année 1) ET zone === 'zfu'.
     *   Saisie ignorée silencieusement pour les années 2-5 et pour ZFRR (pas de prorata année 1).
     */
    moisInstallation: z
      .number({ invalid_type_error: 'Saisis un mois' })
      .int()
      .min(1)
      .max(12)
      .optional(),
  })
  .superRefine((v, ctx) => {
    if (v.assistanceActive) {
      const sumDansAF =
        v.sousPostes.DE + v.sousPostes.HN + v.sousPostes.MSU +
        v.sousPostes.expertises + v.sousPostes.etudes + v.sousPostes.ijMadelinDansAF;
      if (sumDansAF > v.AF + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sousPostes'],
          message: `La somme des sous-postes (${sumDansAF.toFixed(0)} €) dépasse les Gains divers AF (${v.AF.toFixed(0)} €). Ajuste tes saisies.`,
        });
      }
    }
    // V18 — refine PDSA exonérée : ne peut pas dépasser la base de recettes
    if (v.pdsaExonereBrut > 0) {
      const isMicro = v.regimeFiscal === 'micro_bnc';
      const baseRecettes = isMicro
        ? Math.max(0, v.recettesMicroBnc - v.retrocessionsVerseesMicroBnc)
        : v.AA + v.AF;
      if (baseRecettes > 0 && v.pdsaExonereBrut > baseRecettes + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pdsaExonereBrut'],
          message: `La PDSA exonérée (${v.pdsaExonereBrut.toFixed(0)} €) dépasse tes recettes ${isMicro ? 'nettes' : 'AA + AF'} (${baseRecettes.toFixed(0)} €). Saisie incohérente.`,
        });
      }
    }
    // Phase 14.8 — refine ZFU/ZFRR : recettes zonées ≤ base réellement utilisée par le moteur
    // (brutes − minoration CV RO-005 − rétrocessions versées − PDSA exonérée).
    // Alignement strict avec `useCalculetteResults` pour éviter un clamp silencieux côté moteur
    // (CV en micro-BNC retire `cv.capped × 1,515` des recettes brutes — CGI Art. 102 ter + RO-005).
    if (v.regimeFiscal === 'micro_bnc' && v.recettesZoneExo > 0) {
      const cv = capChequesVacances(v.chequesVacances, v.annee);
      const cvMinoration = cv.capped * 1.515;
      const baseNette = Math.max(
        0,
        v.recettesMicroBnc - cvMinoration - v.retrocessionsVerseesMicroBnc - v.pdsaExonereBrut,
      );
      if (v.recettesZoneExo > baseNette + 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recettesZoneExo'],
          message: `Les recettes en zone (${v.recettesZoneExo.toFixed(0)} €) dépassent tes recettes nettes disponibles (brutes − chèques-vacances × 1,515 − rétrocessions versées − PDSA exonérée = ${baseNette.toFixed(0)} €). Saisie incohérente.`,
        });
      }
    }
    // Phase 14.10 — refines zone exonérée : cohérence (zone, année) ↔ recettes en zone.
    if (v.recettesZoneExo > 0 && v.zoneExoneree === 'aucune') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['zoneExoneree'],
        message: 'Choisis la zone (ZFU-TE ou ZFRR) puisque tu déclares des recettes en zone.',
      });
    }
    if (v.zoneExoneree !== 'aucune' && !v.anneeInstallationZone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['anneeInstallationZone'],
        message: 'Renseigne ton année d\'installation en zone (sert au taux d\'exonération dégressif).',
      });
    }
    if (v.anneeInstallationZone && v.anneeInstallationZone > v.annee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['anneeInstallationZone'],
        message: `L'année d'installation (${v.anneeInstallationZone}) ne peut pas être postérieure à l'année des revenus (${v.annee}).`,
      });
    }
    // ZFU-TE : dispositif clos au 31/12/2025 (CGI Art. 44 octies A) — pas de nouvelle installation 2026+.
    if (v.zoneExoneree === 'zfu' && v.anneeInstallationZone && v.anneeInstallationZone > 2025) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['anneeInstallationZone'],
        message: 'Le dispositif ZFU-TE est clos depuis le 31/12/2025 — aucune nouvelle installation éligible à partir de 2026.',
      });
    }
    // ZFRR : remplaçants exclus (CGI Art. 44 quindecies — réservé installés/collaborateurs).
    if (v.zoneExoneree === 'zfrr' && v.profil === 'remplacant') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['zoneExoneree'],
        message: 'Le dispositif ZFRR est réservé aux installés et collaborateurs — les remplaçants ne sont pas éligibles (CGI Art. 44 quindecies).',
      });
    }
    // Régime social RSPM — réservé aux remplaçants purs.
    // Pour les installés (S1/S2), les mixtes et les collaborateurs, le régime PAMC
    // est obligatoire (CSS Art. L646-1 + Notice URSSAF DRI-PAMC).
    if (v.regimeSocial === 'rspm' && v.profil !== 'remplacant') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['regimeSocial'],
        message: `Le régime RSPM est réservé aux remplaçants non-titulaires. Pour un profil "${v.profil}", le régime PAMC est obligatoire.`,
      });
    }
  });


export type CalculetteFormValues = z.infer<typeof calculetteSchema>;

export const CALCULETTE_DEFAULTS: CalculetteFormValues = {
  profil: 'installe_s1',
  regimeFiscal: 'reel',
  regimeSocial: 'pamc',
  annee: 2025,
  recettesMicroBnc: 0,
  retrocessionsVerseesMicroBnc: 0,
  pdsaExonereBrut: 0,
  AA: 0, AF: 0, CE: 0, CN: 0, BK: 0, BV: 0,
  CS: 0, AW: 0, CU: 0, CI: 0, CO: 0, DG: 0, CJ: 0, DH: 0, CP: 0,
  ijCpam: 0, ijMadelin: 0, ijCarmf: 0, ijCarmfTemporaire: 0, ijCarmfInvalidite: 0,
  chequesVacances: 0, depassements: 0, ehpadHadSsiadCmpp: 0,
  chequesVacancesDejaInclus: false,
  cadre8DE: 0, cadre8DB: 0,
  assistanceActive: false,
  choixAssistance: 'cumul',
  sousPostes: { DE: 0, HN: 0, MSU: 0, expertises: 0, etudes: 0, ijMadelinDansAF: 0, pdsaExonere: 0 },
  depassementsAutorises: false,
  showZeros: false,
  declarant: 1,
  recettesZoneExo: 0,
  zoneExoneree: 'aucune',
  anneeInstallationZone: undefined,
  moisInstallation: undefined,
};


export const PROFIL_LABELS: Record<ProfilCalculette, string> = {
  remplacant: 'Remplaçant, interne ou vacataire (libéral non-installé)',
  installe_s1: 'Cabinet installé — secteur 1 conventionné',
  installe_s2: 'Installé secteur 2 (avec ou sans OPTAM)',
  mixte: 'Cabinet installé S1 + dépassements autorisés (DP, hors nomenclature)',
};

/**
 * Refonte mai 2026 — Profils exposés dans le menu déroulant.
 * `mixte` n'est plus une entrée du menu (cas rare, ~2 % S1) :
 * il est activé via la case à cocher « J'ai des dépassements autorisés » sous S1.
 */
export const PROFILS_VISIBLES: ProfilCalculette[] = ['remplacant', 'installe_s1', 'installe_s2'];

/**
 * Résout le profil effectif transmis au moteur fiscal.
 * Si l'utilisateur a coché « dépassements autorisés » sous S1, on bascule vers `mixte`
 * (DSAU dynamique + forfaits S1 cumulés).
 */
export function resolveEffectiveProfil(
  profil: ProfilCalculette,
  depassementsAutorises: boolean,
): ProfilCalculette {
  if (profil === 'installe_s1' && depassementsAutorises) return 'mixte';
  return profil;
}

/**
 * V7 — B14 : ancres PM-XXX des fiches pratiques du guide
 * (cf. `FichesPratiquesSection.tsx` L223 : `id={f.id}`).
 * Mapping vers la fiche la plus proche du profil sélectionné dans la calculette.
 */
export const PROFIL_FICHE_ANCRE: Record<ProfilCalculette, string> = {
  remplacant: 'PM-002',     // Médecin remplaçant
  installe_s1: 'PM-001',    // Médecin installé, secteur 1, BNC réel
  installe_s2: 'PM-003',    // Médecin installé, secteur 2 OPTAM
  mixte: 'PM-001',          // V15 — U1 : "Mixte (installé + remplacements)" → fiche installé S1 BNC réel (PM-005 = libéral + salariat hospit, doctrine inverse)
};
