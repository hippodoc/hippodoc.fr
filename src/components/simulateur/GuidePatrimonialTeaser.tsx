import { Lock, Wallet, Shield, TrendingUp, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { insertPublicEvent } from "@/lib/supabase-public";
import { APP_URL } from "@/lib/site";

const piliers = [
  { icon: Wallet, label: "Budget", description: "Règle 50/30/20 adaptée", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  { icon: Shield, label: "Sécurité", description: "Matelas d'urgence médecin", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
  { icon: TrendingUp, label: "Investir", description: "PEA, assurance-vie, PER…", color: "from-violet-500 to-purple-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
  { icon: Settings, label: "Optimiser", description: "Stratégies fiscales BNC", color: "from-amber-500 to-orange-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
];

export function GuidePatrimonialTeaser() {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white/60 dark:bg-slate-900/60",
        "backdrop-blur-xl",
        "border border-white/30 dark:border-slate-700/30",
        "shadow-xl"
      )}
    >
      {/* Header */}
      <div className="p-6 pb-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-hippo-400 to-hippo-600 flex items-center justify-center shadow-lg shadow-hippo-400/20">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Guide Patrimonial Personnalisé</h3>
            <p className="text-sm text-muted-foreground">
              Conseils épargne et patrimoine adaptés à ta situation
            </p>
          </div>
        </div>
      </div>

      {/* 4 piliers visibles */}
      <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {piliers.map((p) => (
          <div key={p.label} className={cn("rounded-xl p-3 text-center space-y-1.5", p.bg)}>
            <div className={cn("mx-auto h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center", p.color)}>
              <p.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-foreground">{p.label}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Zone floutée + CTA overlay */}
      <div className="relative mt-4">
        {/* Faux contenu flouté */}
        <div className="px-6 pb-6 space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        </div>

        {/* Overlay gradient + CTA */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90">
          <Button
            variant="gradient"
            size="lg"
            className="shadow-xl shadow-hippo-400/30"
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
          <p className="mt-3 text-xs text-muted-foreground">
            ✨ Inclus dans l'essai gratuit de 30 jours
          </p>
        </div>
      </div>
    </div>
  );
}
