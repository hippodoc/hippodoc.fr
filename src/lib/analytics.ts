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
