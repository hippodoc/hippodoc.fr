/**
 * Source unique de vérité pour la valeur `situation_carmf`.
 *
 * Le moteur fiscal (`useRspmCalculation`, `useMarginalSuperNet`, etc.) reconnaît
 * STRICTEMENT ces 3 valeurs. Toute autre valeur en BDD (legacy, vide, libellés
 * français, faute de frappe) doit être normalisée AVANT d'arriver au moteur,
 * sinon les calculs CARMF tombent silencieusement sur le fallback "cas général".
 *
 * Historique : un précédent passage avait introduit `affilie_moins_3ans` côté
 * UI sans l'aligner sur le moteur — la migration BDD a backfillé en
 * `affilie_jeune` et cet helper garantit qu'aucune valeur invalide ne remonte.
 *
 * ───────────────────────────────────────────────────────────────────────────────
 * 🎯 V13 — POINTS DE NORMALISATION CANONIQUES (audit pré-prod final, juin 2026)
 * ───────────────────────────────────────────────────────────────────────────────
 * Toute lecture de `situation_carmf` côté front DOIT passer par
 * `normalizeCarmfStatus(...)`. Les 3 SOURCES racines déjà scellées sont :
 *
 *   1. `src/hooks/useProfile.ts`            → normalise à la lecture DB (V11).
 *   2. `supabase/functions/_shared/types.ts` → `normalizeSituationCarmf` côté
 *      edge functions (calculate-urssaf v26, send-deadline-reminder).
 *   3. `src/hooks/usePublicodesSimulation.ts` → sanitise les valeurs Zod du
 *      simulateur public avant upsert et avant moteur.
 *
 * RÈGLE D'OR : si tu ajoutes un nouveau consommateur, ne JAMAIS écrire
 * `situation_carmf as 'dispense' | ...` ni comparaison stricte
 * `=== 'dispense'` sur une valeur DB non-normalisée. Le test
 * `carmfStatus.surfaces.test.ts` (S44/S45/S46) bloque ces patterns en CI.
 *
 * Fuzz exhaustif (11 valeurs × 3 invariants) : `carmfStatus.fuzz.test.ts`.
 */

export const CARMF_STATUSES = ['dispense', 'affilie_jeune', 'affilie_3ans_plus'] as const;
export type CarmfStatus = (typeof CARMF_STATUSES)[number];

const LEGACY_MAP: Record<string, CarmfStatus> = {
  // valeur écrite par l'ancien FiscalHistoryModal (jamais reconnue par le moteur)
  affilie_moins_3ans: 'affilie_jeune',
  // libellés français qu'on a pu voir passer en export/import
  'jeune affilié': 'affilie_jeune',
  'jeune_affilie': 'affilie_jeune',
  'affilie': 'affilie_3ans_plus',
  'affilié': 'affilie_3ans_plus',
  'dispensé': 'dispense',
  'dispensée': 'dispense',
};

/**
 * Normalise n'importe quelle valeur d'entrée en CarmfStatus valide.
 * Par défaut : `affilie_3ans_plus` (cas général, le plus conservateur côté charges).
 *
 * ⚠️ Ne JAMAIS dévier de cette fonction pour fabriquer une valeur CARMF
 * passée au moteur fiscal. Tout appel direct à `as 'dispense' | ...` est suspect.
 */
export function normalizeCarmfStatus(raw: unknown): CarmfStatus {
  if (typeof raw !== 'string') return 'affilie_3ans_plus';
  const trimmed = raw.trim();
  if (!trimmed) return 'affilie_3ans_plus';
  if ((CARMF_STATUSES as readonly string[]).includes(trimmed)) {
    return trimmed as CarmfStatus;
  }
  const mapped = LEGACY_MAP[trimmed.toLowerCase()];
  if (mapped) return mapped;
  return 'affilie_3ans_plus';
}

/** Libellé pédagogique unifié (utilisé par modal/profil/dashboard). */
export function getCarmfLabel(status: CarmfStatus): string {
  switch (status) {
    case 'dispense':
      return 'Dispensé·e (remplaçant·e < 38 000 €)';
    case 'affilie_jeune':
      return 'Jeune affilié·e (< 2 ans d\'installation)';
    case 'affilie_3ans_plus':
      return 'Affilié·e (cas général)';
  }
}

/** Libellé court (badges). */
export function getCarmfShortLabel(status: CarmfStatus): string {
  switch (status) {
    case 'dispense':
      return 'Dispensé·e';
    case 'affilie_jeune':
      return 'Jeune affilié·e';
    case 'affilie_3ans_plus':
      return 'Affilié·e';
  }
}
