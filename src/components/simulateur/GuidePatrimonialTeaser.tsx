import { Lock, Wallet, Shield, TrendingUp, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { insertPublicEvent } from "@/lib/supabase-public";
import { APP_URL } from "@/lib/site";

const piliers = [
  { icon: Wallet, label: "Budget", description: "Règle 50/30/20 adaptée" },
  { icon: Shield, label: "Sécurité", description: "Matelas d'urgence médecin" },
  { icon: TrendingUp, label: "Investir", description: "PEA, assurance-vie, PER…" },
  { icon: Settings, label: "Optimiser", description: "Stratégies fiscales BNC" },
];

export function GuidePatrimonialTeaser() {
  return (
    <div
      className={cn("sim-fiche sim-guide relative overflow-hidden")}
    >
      {/* Header */}
      <div className="pb-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="sim-rond plein grand">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="sim-fiche-titre grand">Guide Patrimonial Personnalisé</h3>
            <p className="sim-texte">
              Conseils épargne et patrimoine adaptés à ta situation
            </p>
          </div>
        </div>
      </div>

      {/* 4 piliers visibles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {piliers.map((p) => (
          <div key={p.label} className={cn("sim-panneau text-center space-y-1.5")}>
            <div className={cn("sim-rond blanc mx-auto")}>
              <p.icon className="h-4 w-4" />
            </div>
            <p className="sim-porte-nom">{p.label}</p>
            <p className="sim-porte-sous">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Zone floutée + CTA overlay */}
      <div className="relative mt-4">
        {/* Faux contenu flouté */}
        <div className="sim-flou pb-2 space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
          <div className="sim-trait h-4 w-3/4" />
          <div className="sim-trait h-4 w-full" />
          <div className="sim-trait h-4 w-5/6" />
          <div className="sim-trait clair h-20" />
          <div className="sim-trait h-4 w-2/3" />
          <div className="sim-trait h-4 w-full" />
        </div>

        {/* Overlay gradient + CTA */}
        <div className="sim-voile absolute inset-0 flex flex-col items-center justify-center">
          <Button
            variant="gradient"
            size="lg"
            className="sim-btn sim-btn-soleil"
            onClick={() => {
              // Fire-and-forget tracking (anonyme, best-effort)
              insertPublicEvent('simulateur_public_events', {
                event_type: 'cta_patrimonial_guide',
                session_id: (typeof window !== 'undefined' && window.localStorage.getItem('hippodoc-anon-session-id')) || 'unknown',
              });
              window.location.href = `${APP_URL}/auth`;
            }}
          >
            Créer mon compte gratuit
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="sim-petit droit mt-3">
            Inclus dans l'essai gratuit de 30 jours
          </p>
        </div>
      </div>
    </div>
  );
}
