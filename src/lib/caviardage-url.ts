/**
 * Caviardage des jetons de connexion Supabase dans une URL (MIGRATION.md § 9.ea).
 *
 * Supabase place les jetons d'un lien de connexion, de confirmation ou de
 * réinitialisation dans le FRAGMENT (`#access_token=…&refresh_token=…`), pas dans
 * la requête. Le premier caviardage (juillet 2026) ne regardait que la requête :
 * un jeton arrivé sur www dans le fragment partait tel quel dans `$current_url`.
 *
 * ⚠️ Gardée identique à `scrub()` de ThirdPartyScripts.astro (script inline,
 * qui ne peut pas importer ce module).
 */
export const CLES_SENSIBLES = [
  'access_token',
  'refresh_token',
  'provider_token',
  'provider_refresh_token',
  'id_token',
  'code',
  'token',
  'token_hash',
  'confirmation_token',
  'recovery_token',
  'invite_token',
] as const;

function caviarderParametres(params: URLSearchParams): boolean {
  let touche = false;
  for (const cle of CLES_SENSIBLES) {
    if (params.has(cle)) {
      params.set(cle, '<redacted>');
      touche = true;
    }
  }
  return touche;
}

export function caviarderUrl(brute: string): string {
  if (!brute) return brute;
  try {
    const u = new URL(brute);
    caviarderParametres(u.searchParams);
    if (u.hash.length > 1) {
      const fragment = new URLSearchParams(u.hash.slice(1));
      if (caviarderParametres(fragment)) u.hash = fragment.toString();
    }
    return u.toString();
  } catch {
    // URL illisible : on ne sait pas la caviarder proprement, on n'en garde
    // que ce qui précède le premier « ? » ou « # ».
    return brute.split(/[?#]/)[0];
  }
}

/** Propriétés PostHog qui portent une URL complète. */
const PROPRIETES_URL = ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer'];

type Proprietes = Record<string, unknown>;

function caviarderProprietes(props: Proprietes | undefined): void {
  if (!props) return;
  for (const cle of PROPRIETES_URL) {
    const v = props[cle];
    if (typeof v === 'string') props[cle] = caviarderUrl(v);
  }
}

/**
 * `before_send` de PostHog : caviarde les URL de l'événement, y compris dans
 * `$set` / `$set_once` (propriétés de personne). Ne rejette jamais l'événement.
 */
export function caviarderEvenement<T extends { properties?: Proprietes; $set?: Proprietes; $set_once?: Proprietes } | null>(
  evenement: T,
): T {
  if (!evenement) return evenement;
  try {
    caviarderProprietes(evenement.properties);
    caviarderProprietes(evenement.properties?.$set as Proprietes | undefined);
    caviarderProprietes(evenement.properties?.$set_once as Proprietes | undefined);
    caviarderProprietes(evenement.$set);
    caviarderProprietes(evenement.$set_once);
  } catch {
    /* la mesure peut échouer, jamais la page */
  }
  return evenement;
}
