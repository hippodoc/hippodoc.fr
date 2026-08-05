/**
 * Accès minimal à Supabase pour le site public — remplace le SDK complet.
 * Deux usages seulement, tous anonymes et fire-and-forget ou lecture simple :
 *  - POST vers l'Edge Function calculate-urssaf (branche PAMC du simulateur)
 *  - INSERT dans simulateur_public_events (funnel analytics anonyme)
 * Clé "publishable" (anon) identique à celle déjà embarquée dans le bundle
 * public de la SPA source — sécurisée par RLS côté Supabase.
 */

const SUPABASE_URL = 'https://zlqlijendlquvwnodeqq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function invokeCalculateUrssaf(body: unknown): Promise<{ data: unknown; error: Error | null }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/calculate-urssaf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { data: null, error: new Error(`calculate-urssaf HTTP ${res.status}: ${text.slice(0, 200)}`) };
    }
    return { data: await res.json(), error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error(String(e)) };
  }
}

/** Insert anonyme fire-and-forget dans une table publique (RLS insert-only). */
export function insertPublicEvent(table: string, row: Record<string, unknown>): void {
  try {
    void fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    }).catch(() => {});
  } catch {
    // noop
  }
}
