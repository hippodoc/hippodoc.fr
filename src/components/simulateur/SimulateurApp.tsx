import { useEffect, useRef, useCallback } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfilsTypesPublic } from "./ProfilsTypesPublic";
import { SimulateurForm } from "./SimulateurForm";
import { SimulateurResults } from "./SimulateurResults";
import { usePublicodesSimulation } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";
import { trackEvent } from "@/lib/analytics";
import { insertPublicEvent } from "@/lib/supabase-public";

/**
 * Île React du simulateur public — reproduit l'orchestration de
 * `src/pages/simulateur-public.tsx` (SPA source) : wiring handleSubmit →
 * simulate(), analytics (public_simulator_started/used), funnel anonyme
 * (`simulateur_public_events`), scroll-to-results. Le hero, le "mode
 * d'emploi" (contenu de SimulateurGuide) et le bandeau CTA de bas de page
 * sont rendus à part, en HTML statique, par la page `simulateur.astro`.
 */

const SESSION_ID_KEY = "hippodoc-anon-session-id";

/** Session anonyme persistée en localStorage — lecture/écriture uniquement côté client (handler). */
function getOrCreateSessionId(): string {
  try {
    let id = window.localStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

/**
 * Détecte la source de trafic (UTM prioritaire, sinon referrer, sinon 'direct').
 * Mirroir de `getReferrerSource()` (src/lib/posthog.ts) de la SPA source —
 * réimplémenté ici car ce module n'existe pas côté site public.
 */
function getReferrerSource(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    if (utmSource) return utmSource.toLowerCase();
    const ref = document.referrer;
    if (!ref) return "direct";
    if (ref.includes("google")) return "google";
    if (ref.includes("instagram")) return "instagram";
    if (ref.includes("facebook") || ref.includes("fb.com")) return "facebook";
    if (ref.includes("twitter") || ref.includes("x.com")) return "twitter";
    if (ref.includes("linkedin")) return "linkedin";
    if (ref.includes("hippodoc")) return "hippodoc";
    return "other";
  } catch {
    return "direct";
  }
}

export default function SimulateurApp() {
  const { loading, error, results, simulate, reset } = usePublicodesSimulation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formDataRef = useRef<SimulateurFormData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null);
  const selectedProfilIdRef = useRef<string | null>(null);

  // Analytics : arrivée sur le simulateur public (une fois par mount)
  useEffect(() => {
    trackEvent("public_simulator_started", { referrer_source: getReferrerSource() });
  }, []);

  const defaultValues: Partial<SimulateurFormData> = {
    periode: "annuel" as const,
    annee: 2026,
    recettesBrutes: 0,
    chargesHorsCotisations: 0,
    situationFamiliale: "celibataire",
    enfants: 0,
    secteurConventionnel: "secteur_1",
    forfait2pct: true,
  };

  const handleSelectProfil = useCallback(
    (profilData: Partial<Omit<SimulateurFormData, "regimeFiscal">>, profilId?: string) => {
      selectedProfilIdRef.current = profilId || null;
      if (formRef.current) {
        formRef.current.reset({ ...profilData, forfait2pct: true });
      }
      setTimeout(() => {
        document.getElementById("simulateur-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    },
    []
  );

  const handleSubmit = useCallback(
    (data: SimulateurFormData) => {
      formDataRef.current = data;
      trackEvent("public_simulator_used", { input_amount: data.recettesBrutes });
      simulate(data);

      const sid = getOrCreateSessionId();
      const referrerSource = getReferrerSource();
      // Fire-and-forget tracking anonyme (funnel simulateur public)
      insertPublicEvent("simulateur_public_events", {
        recettes_brutes: data.recettesBrutes,
        session_id: sid,
        event_type: "simulation",
        referrer_source: referrerSource,
        charges_hors_cotisations: data.chargesHorsCotisations || null,
        situation_familiale: data.situationFamiliale || null,
        secteur_conventionnel: data.secteurConventionnel || null,
        profil_type_id: selectedProfilIdRef.current || null,
      });
      // Reset profil type after tracking (next manual submit = no profil)
      selectedProfilIdRef.current = null;
    },
    [simulate]
  );

  // Scroll vers résultats + track regime_recommande
  useEffect(() => {
    if (results.recommande && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      const sid = getOrCreateSessionId();
      insertPublicEvent("simulateur_public_events", {
        event_type: "simulation_result",
        session_id: sid,
        regime_recommande: results.recommande,
      });
    }
  }, [results]);

  const handleReset = () => {
    reset();
    formDataRef.current = null;
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div ref={topRef} className="space-y-8">
      {/* Profils types collapsibles */}
      {!results.recommande && <ProfilsTypesPublic onSelectProfil={handleSelectProfil} />}

      {/* Formulaire */}
      <div id="simulateur-form">
        <SimulateurForm
          ref={formRef}
          onSubmit={handleSubmit}
          loading={loading}
          defaultValues={defaultValues}
          hasProfileData={false}
        />
      </div>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="text-lg font-medium">Calcul en cours...</span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur lors du calcul</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => formDataRef.current && simulate(formDataRef.current)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results.recommande && !loading && formDataRef.current && (
        <div ref={resultsRef}>
          <SimulateurResults
            comparison={results}
            formData={formDataRef.current}
            periode={formDataRef.current.periode}
            onNewSimulation={handleReset}
            isPublic={true}
          />
        </div>
      )}
    </div>
  );
}
