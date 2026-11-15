import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfilsTypesPublic } from "./ProfilsTypesPublic";
import { SimulateurForm } from "./SimulateurForm";
import { SimulateurResults, essaiDe, chargerCartesDesRegimes, type Essai, type CartesDesRegimes } from "./SimulateurResults";
import { usePublicodesSimulation, type RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
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
 *
 * Habillage (phase 5d, MIGRATION.md § 9.ek) : la racine porte `sim` (jetons et
 * règles de `src/styles/simulateur.css`) et `da-bloc` (typographie de la DA).
 * Les couleurs des composants du dossier passent par des classes `sim-*` ; les
 * utilitaires Tailwind qui restent ne règlent que la mise en page.
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

/**
 * L'attente du calcul (MIGRATION.md § 9.gl) : une fiche au moins aussi haute que l'écran
 * (`.sim-attente-fiche`), que le résultat remplace à la même place. Tant qu'elle est là, rien de ce
 * qui suit l'îlot (la prise de rendez-vous, les repères) n'est à l'écran : rien ne saute quand le
 * calcul arrive. Plus courte, elle laissait voir la prise de rendez-vous, que le résultat poussait
 * de 2 000 px vers le bas 1 à 3 s après le clic (un décalage de 0,41 relevé à 390 × 844).
 */
function CarteAttente() {
  return (
    <Card className="sim-fiche sim-attente-fiche">
      <CardContent className="sim-attente space-y-4">
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
  );
}

/** Haut d'un élément dans la page (et non dans la fenêtre). */
const hautDansLaPage = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

export default function SimulateurApp() {
  const { loading, error, results, bascule, marge, alternativePamc, simulate, reset } = usePublicodesSimulation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const formulaireRef = useRef<HTMLDivElement>(null);
  const formDataRef = useRef<SimulateurFormData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formRef = useRef<any>(null);
  const selectedProfilIdRef = useRef<string | null>(null);
  /** Haut du formulaire dans la page au moment du clic sur « Simuler » (§ 9.gl, plus bas). */
  const hautFormulaireAuCalcul = useRef<number | null>(null);
  /** Le bloc des deux régimes, chargé au premier calcul : `undefined` tant qu'il ne l'est pas,
   *  `null` si son fichier n'a pas pu être chargé (§ 9.gl). */
  const [cartes, setCartes] = useState<{ Cartes: CartesDesRegimes | null } | undefined>(undefined);
  // § 9.gg : l'essai en cours et le précédent, pour dire l'écart de Super-Net entre les deux.
  // § 9.gl : tenus à jour PENDANT le rendu où arrivent les résultats (un état dérivé, que React
  // recalcule avant d'afficher). Posés par un effet, ils arrivaient un rendu plus tard : la phrase
  // de l'écart s'ajoutait sous le titre déjà affiché et poussait la conclusion de 22 à 44 px.
  const [essais, setEssais] = useState<{ pour: RegimeComparison; courant: Essai | null; precedent: Essai | null }>(() => ({ pour: results, courant: null, precedent: null }));
  if (essais.pour !== results) {
    const essai = results.recommande && formDataRef.current ? essaiDe(results, formDataRef.current) : null;
    setEssais(essai ? { pour: results, courant: essai, precedent: essais.courant } : { ...essais, pour: results });
  }

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

  /**
   * Lance un calcul (« Simuler », « Réessayer »). § 9.gl : relève d'abord où est le formulaire dans
   * la page (voir l'effet de mise en page plus bas), et charge le bloc des deux régimes en même temps
   * que le calcul (une seule fois ; les calculs suivants le trouvent prêt).
   */
  const lancer = useCallback(
    (data: SimulateurFormData) => {
      if (formulaireRef.current) hautFormulaireAuCalcul.current = hautDansLaPage(formulaireRef.current);
      chargerCartesDesRegimes().then(
        (Cartes) => setCartes((c) => c ?? { Cartes }),
        () => setCartes((c) => c ?? { Cartes: null }),
      );
      simulate(data);
    },
    [simulate]
  );

  const handleSubmit = useCallback(
    (data: SimulateurFormData) => {
      formDataRef.current = data;
      trackEvent("public_simulator_used", { input_amount: data.recettesBrutes });
      lancer(data);

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
    [lancer]
  );

  // § 9.gl : à l'arrivée des résultats, le bloc des profils types disparaît au-dessus du formulaire
  // (84 px replié ; jusqu'à 700 px au téléphone quand sa grille est restée ouverte après le choix
  // d'un profil). La page remonte d'autant, dans la même image (effet de mise en page : avant que le
  // navigateur ne peigne) : le formulaire reste où il était à l'écran. Quand le bloc était au-dessus
  // de l'écran, rien ne bouge ; sur un très grand écran où il se voyait encore, c'est le haut de page,
  // au-dessus de lui, qui descend à sa place, moins grand que le formulaire. Pas de compensation
  // quand le formulaire commence dans la moitié basse de la fenêtre : le visiteur regarde alors le
  // haut de page, qui ne bouge pas. Avant, le formulaire remontait sous les yeux 1 à 3 s après le
  // clic, un décalage compté (0,04 replié, 0,43 grille ouverte à 411 × 753). Chromium n'ancre pas le
  // défilement ici : essayé, le bloc retiré à la main, la page ne bouge pas et le décalage est
  // compté ; retiré puis compensé dans la même tâche, aucun décalage n'est compté.
  useLayoutEffect(() => {
    const avant = hautFormulaireAuCalcul.current;
    const formulaire = formulaireRef.current;
    if (!results.recommande || avant === null || !formulaire) return;
    hautFormulaireAuCalcul.current = null;
    const ecart = hautDansLaPage(formulaire) - avant;
    if (ecart !== 0 && avant <= window.scrollY + window.innerHeight / 2) window.scrollBy({ top: ecart, behavior: "instant" });
  }, [results]);

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
    <div ref={topRef} className="sim sim-ile da-bloc space-y-6">
      {/* Profils types collapsibles */}
      {!results.recommande && <ProfilsTypesPublic onSelectProfil={handleSelectProfil} />}

      {/* Formulaire */}
      <div id="simulateur-form" ref={formulaireRef}>
        <SimulateurForm
          ref={formRef}
          onSubmit={handleSubmit}
          loading={loading}
          defaultValues={defaultValues}
          hasProfileData={false}
        />
      </div>

      {/* Loading */}
      {loading && <CarteAttente />}

      {/* Error. § 9.gl : sans résultat dessous, l'alerte garde la place de l'attente
          (`.sim-place-erreur`) : sinon, la prise de rendez-vous remontait d'un écran sous les yeux. */}
      {error && !loading && (
        <div className={results.recommande ? undefined : "sim-place-erreur"}>
        <Alert variant="destructive" className="sim-alerte">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur lors du calcul</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="sim-btn sim-btn-ligne"
              onClick={() => formDataRef.current && lancer(formDataRef.current)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
        </div>
      )}

      {/* Results. `scroll-mt-20` (§ 9.ed) : après le calcul, la page défile jusqu'ici.
          Sans marge, le bouton « Simuler » s'arrêtait juste derrière la pastille de
          l'en-tête et se lisait au travers ; il reste maintenant entier dessous. */}
      {results.recommande && !loading && formDataRef.current && (
        <div ref={resultsRef} className="scroll-mt-20">
          {/* § 9.gl : tant que le bloc des deux régimes n'est pas chargé, l'attente reste à sa
              place ; le résultat s'affiche en une fois. */}
          {cartes ? (
            <SimulateurResults
              comparison={results}
              bascule={bascule}
              marge={marge}
              formData={formDataRef.current}
              periode={formDataRef.current.periode}
              onNewSimulation={handleReset}
              isPublic={true}
              essaiPrecedent={essais.precedent}
              alternativePamc={alternativePamc}
              Cartes={cartes.Cartes}
            />
          ) : (
            <CarteAttente />
          )}
        </div>
      )}
    </div>
  );
}
