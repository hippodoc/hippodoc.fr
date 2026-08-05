import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulationResult } from "@/lib/simulation-types";
import { useIsMobile } from "@/lib/use-mobile";
import { ServerCrash } from "lucide-react";

interface CotisationsDetailChartProps {
  result: SimulationResult;
  title: string;
}

// Palette "Hippo Medical" harmonieuse pour les cotisations
const COTISATIONS_COLORS = {
  retraite: 'hsl(340, 75%, 55%)',         // Rose-rouge (CARMF)
  csgCrds: 'hsl(280, 65%, 55%)',          // Violet
  allocationsFamiliales: 'hsl(210, 80%, 55%)', // Bleu
  maladie: 'hsl(180, 70%, 45%)',          // Cyan
  formation: 'hsl(45, 90%, 50%)',         // Jaune doré
} as const;

export function CotisationsDetailChart({ result, title }: CotisationsDetailChartProps) {
  const isMobile = useIsMobile();

  // 🛡️ Guard: Données incomplètes
  if (!result?.cotisationsDetail) {
    return (
      <Card className="p-6 border-amber-200/50 bg-amber-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
            <ServerCrash className="h-8 w-8 text-amber-500" />
            <p className="text-sm text-amber-700 font-medium">Détail indisponible</p>
            <p className="text-xs text-muted-foreground">Serveurs URSSAF en maintenance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = [
    {
      name: "Retraite (CARMF)",
      value: result.cotisationsDetail.retraite,
      color: COTISATIONS_COLORS.retraite,
    },
    {
      name: "CSG-CRDS",
      value: result.cotisationsDetail.csgCrds,
      color: COTISATIONS_COLORS.csgCrds,
    },
    {
      name: "Allocations familiales",
      value: result.cotisationsDetail.allocationsFamiliales,
      color: COTISATIONS_COLORS.allocationsFamiliales,
    },
    {
      name: "Maladie-maternité",
      value: result.cotisationsDetail.maladie,
      color: COTISATIONS_COLORS.maladie,
    },
    {
      name: "Formation pro",
      value: result.cotisationsDetail.formation,
      color: COTISATIONS_COLORS.formation,
    },
  ]
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Tri décroissant par valeur

  const maxValue = Math.max(...data.map(d => d.value));
  const total = result.cotisationsTotales;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Barres horizontales */}
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            const shareOfTotal = ((item.value / total) * 100).toFixed(0);
            
            return (
              <div
                key={item.name}
                className="space-y-1.5 group"
              >
                {/* Label et montant */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors truncate pr-2">
                    {isMobile 
                      ? item.name.replace('Allocations familiales', 'Alloc. fam.')
                                 .replace('Formation pro', 'Formation')
                                 .replace('Maladie-maternité', 'Maladie')
                      : item.name
                    }
                  </span>
                  <span className="font-bold shrink-0">{formatCurrency(item.value)}</span>
                </div>
                
                {/* Barre de progression */}
                <div className="relative h-3 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all group-hover:brightness-110"
                    style={{ backgroundColor: item.color, width: `${percentage}%` }}
                  />
                  {/* Pourcentage dans la barre si assez large */}
                  {percentage > 25 && (
                    <span
                      className="absolute inset-y-0 left-2 flex items-center text-[10px] font-medium text-white/90"
                    >
                      {shareOfTotal}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Total */}
          <div
            className="flex items-center justify-between pt-3 border-t border-border/50"
          >
            <span className="font-semibold text-sm">Total cotisations</span>
            <span className="font-bold text-lg text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
