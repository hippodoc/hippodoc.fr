/**
 * Shim analytics du site public — remplace src/lib/analytics.ts de la SPA.
 * Seul PostHog est conservé (contrainte "zéro JS hors îlots + PostHog").
 * Même signature trackEvent() pour que les composants portés restent identiques.
 *
 * ⚠️ Ce module n'importe PAS `posthog-js` (MIGRATION.md § 9.er). Il le faisait, et les
 * trois outils attendaient donc ses 76 Ko (gzip) avant de s'hydrater : pendant ce
 * temps le formulaire avait l'air prêt et ne répondait pas. L'instance est celle,
 * unique, que `PostHog.astro` initialise ; elle arrive ici par `brancherMesure()`.
 * Un événement émis avant est gardé en file et rejoué dans l'ordre : même nom, mêmes
 * propriétés. Sans horodatage forcé : posthog-js y joindrait deux propriétés
 * (`$event_time_override_*`), l'événement ne serait plus celui d'avant.
 * Si `posthog-js` ne charge jamais (réseau, bloqueur), les outils marchent sans mesure.
 */

type EventProps = Record<string, unknown>;

interface Mesure {
  capture: (name: string, props?: EventProps) => unknown;
}

let instance: Mesure | null = null;
const file: Array<[string, EventProps | undefined]> = [];

export function trackEvent(name: string, props?: EventProps): void {
  try {
    if (instance) instance.capture(name, props);
    // Plafond de prudence : la file ne grossit pas sans fin si la mesure ne vient jamais.
    else if (file.length < 100) file.push([name, props]);
  } catch {
    // noop — l'analytics ne doit jamais casser l'UI
  }
}

/**
 * Appelée une fois par `PostHog.astro`, juste après `posthog.init()`.
 *
 * La file est vidée au tour suivant, pas tout de suite : posthog-js émet sa page vue
 * initiale par un `setTimeout(…, 1)` posé pendant `init()`. Un minuteur de même délai
 * posé après lui passe après lui : `$pageview` reste le premier événement de la page,
 * comme quand les îlots attendaient la bibliothèque. Tant que la file n'est pas vidée,
 * `trackEvent()` continue d'y écrire : l'ordre d'émission est conservé.
 */
export function brancherMesure(mesure: Mesure): void {
  setTimeout(() => {
    for (const [name, props] of file.splice(0)) {
      try {
        mesure.capture(name, props);
      } catch {
        // noop
      }
    }
    instance = mesure;
  }, 1);
}
