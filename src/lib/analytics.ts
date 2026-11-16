/**
 * Shim analytics du site public — remplace src/lib/analytics.ts de la SPA.
 * Seul PostHog est conservé (contrainte "zéro JS hors îlots + PostHog").
 * Même signature trackEvent() pour que les composants portés restent identiques.
 */
import posthog from 'posthog-js';

type EventProps = Record<string, unknown>;

export function trackEvent(name: string, props?: EventProps): void {
  try {
    posthog.capture(name, props);
  } catch {
    // noop — l'analytics ne doit jamais casser l'UI
  }
}

/**
 * Montant → tranche (« 40-60k »), jamais la valeur saisie (MIGRATION.md § 9.hi).
 * La politique de confidentialité promet qu'aucun montant ne part à PostHog : le
 * simulateur envoyait les recettes saisies au centime près (`input_amount`).
 */
export function tranche(montant: number, bornes: readonly number[]): string {
  if (!Number.isFinite(montant) || montant <= 0) return '0';
  for (let i = 0; i < bornes.length; i++) {
    if (montant < bornes[i]) return `${i === 0 ? 0 : bornes[i - 1] / 1000}-${bornes[i] / 1000}k`;
  }
  return `${bornes[bornes.length - 1] / 1000}k+`;
}

/** Recettes annuelles : tranches de 20 000 € jusqu'à 80 000 €, puis 120 000 €. */
export const TRANCHES_RECETTES = [20000, 40000, 60000, 80000, 120000] as const;
/** Charges annuelles. */
export const TRANCHES_CHARGES = [2000, 5000, 10000, 20000] as const;
