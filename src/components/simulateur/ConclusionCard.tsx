import { Badge } from "@/components/ui/badge";
import { Trophy, Scale, AlertTriangle, FileQuestion, Briefcase, Heart } from "lucide-react";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";
import type { LucideIcon } from "lucide-react";

// ============ CONSTANTES SEUILS ============
const PLAFOND_MICRO_BNC = 83600;
const SEUIL_APPROCHE_PLAFOND = 71000;
const SEUIL_ECART_FAIBLE = 1000;
const SEUIL_ECART_NEGLIGEABLE = 500;
const SEUIL_ECART_MODERE = 2000;
const SEUIL_CHARGES_FAIBLES_RATIO = 0.05;

// ============ TYPES ============
interface ConclusionCardProps {
  comparison: RegimeComparison;
  formData: SimulateurFormData;
}

interface ContextAlert {
  type: 'warning' | 'info' | 'danger';
  icon: LucideIcon;
  message: string;
}

// ============ HELPERS ============
const formatMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.abs(montant));
};

// ============ COMPOSANT PRINCIPAL ============
export function ConclusionCard({ comparison, formData }: ConclusionCardProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) return null;

  // ============ CALCULS ============
  const recettesAnnuelles = formData.periode === 'mensuel' 
    ? formData.recettesBrutes * 12 
    : formData.recettesBrutes;
  const chargesAnnuelles = formData.periode === 'mensuel'
    ? formData.chargesHorsCotisations * 12
    : formData.chargesHorsCotisations;
  const ratioCharges = recettesAnnuelles > 0 ? chargesAnnuelles / recettesAnnuelles : 0;

  const revenusSalariesAnnuels = (formData.revenusSalaries || 0) * (formData.periode === 'mensuel' ? 12 : 1);
  const revenusConjointAnnuels = (formData.revenusConjoint || 0) * (formData.periode === 'mensuel' ? 12 : 1);

  // ============ CONDITIONS ============
  const approchePlafond = recettesAnnuelles > SEUIL_APPROCHE_PLAFOND && recettesAnnuelles <= PLAFOND_MICRO_BNC;
  const depassePlafond = recettesAnnuelles > PLAFOND_MICRO_BNC;
  const ecartFaible = economie < SEUIL_ECART_FAIBLE;
  const ecartNegligeable = economie < SEUIL_ECART_NEGLIGEABLE;
  const ecartModere = economie >= SEUIL_ECART_FAIBLE && economie < SEUIL_ECART_MODERE;
  const chargesFaibles = recommande === 'reel' && ratioCharges < SEUIL_CHARGES_FAIBLES_RATIO;
  const aRevenusMixtes = revenusSalariesAnnuels > 0;
  const revenusSalariesMajoritaires = revenusSalariesAnnuels > recettesAnnuelles;
  const aRevenusConjoint = revenusConjointAnnuels > 0;
  const hasSignificantEconomie = economie >= SEUIL_ECART_FAIBLE;

  // ============ CALCUL POURCENTAGE ÉCONOMIE ============
  const calculatePercentage = (): number | null => {
    if (!microBnc || !reel) return null;
    const loserSuperNet = recommande === 'micro-bnc' ? reel.superNet : microBnc.superNet;
    if (loserSuperNet === 0) return null;
    return (economie / loserSuperNet) * 100;
  };
  const percentageEconomie = calculatePercentage();

  // ============ MESSAGE PRINCIPAL ============
  const getMessage = (): string => {
    if (ecartNegligeable) {
      return "Écart négligeable : choisis selon ta préférence de gestion.";
    }
    if (ecartFaible) {
      return "Les deux régimes sont quasi équivalents à ce niveau de charges.";
    }
    const regimeLabel = recommande === 'micro-bnc' ? 'Micro-BNC' : 'Régime Réel';
    return `Le ${regimeLabel} te fait garder ${formatMontant(economie)} de plus par an.`;
  };

  // ============ ALERTES CONTEXTUELLES ============
  const getAlerts = (): ContextAlert[] => {
    const alerts: ContextAlert[] = [];
    
    if (depassePlafond) {
      alerts.push({
        type: 'danger',
        icon: AlertTriangle,
        message: "Plafond Micro-BNC dépassé (83 600€) : passage automatique au Réel si 2ème année consécutive."
      });
    } else if (approchePlafond && recommande === 'micro-bnc') {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        message: "CA proche du plafond Micro-BNC (83 600€). Anticipe le passage au Réel."
      });
    }
    
    if (ecartModere) {
      alerts.push({
        type: 'info',
        icon: Scale,
        message: "Écart modéré : un expert-comptable pourra affiner."
      });
    }
    
    if (chargesFaibles) {
      alerts.push({
        type: 'info',
        icon: FileQuestion,
        message: "Charges faibles déclarées. Vérifie que tu n'as rien oublié."
      });
    }
    
    if (aRevenusMixtes) {
      const message = revenusSalariesMajoritaires
        ? "Revenus salariés majoritaires → impact TMI significatif."
        : "Revenus salariés pris en compte dans l'IR.";
      alerts.push({ type: 'info', icon: Briefcase, message });
    }
    
    if (aRevenusConjoint) {
      const montantFormate = new Intl.NumberFormat('fr-FR', { 
        style: 'currency', currency: 'EUR', maximumFractionDigits: 0 
      }).format(revenusConjointAnnuels);
      alerts.push({
        type: 'info',
        icon: Heart,
        message: `Conjoint (${montantFormate}) inclus dans le calcul IR.`
      });
    }
    
    return alerts.slice(0, 3);
  };

  const alerts = getAlerts();
  const hasWarnings = alerts.some(a => a.type === 'warning' || a.type === 'danger');

  // ============ STYLES ============
  const getMainIcon = () => {
    if (hasWarnings) return { Icon: AlertTriangle, color: "text-orange-500" };
    if (hasSignificantEconomie) return { Icon: Trophy, color: "text-emerald-500" };
    return { Icon: Scale, color: "text-amber-500" };
  };

  const getBgClass = () => {
    if (hasWarnings) return "bg-orange-50/80 border-orange-200/50 dark:bg-orange-950/20 dark:border-orange-800/30";
    if (hasSignificantEconomie) return "bg-emerald-50/80 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30";
    return "bg-amber-50/80 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30";
  };

  const getAlertPillStyle = (type: 'warning' | 'info' | 'danger') => {
    switch (type) {
      case 'danger': return "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      case 'warning': return "bg-orange-100/80 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      default: return "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    }
  };

  const { Icon: MainIcon, color: iconColor } = getMainIcon();

  // ============ RENDER ============
  return (
    <div
      className={`rounded-xl border p-4 ${getBgClass()}`}
    >
      {/* Ligne principale : icône + message + badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <MainIcon className={`h-5 w-5 shrink-0 ${iconColor}`} />
        <p className="text-sm sm:text-base font-semibold text-foreground flex-1 min-w-0">
          {getMessage()}
        </p>
        {percentageEconomie !== null && hasSignificantEconomie && (
          <Badge variant="outline" className="bg-emerald-100/80 text-emerald-700 border-emerald-200 font-semibold text-xs shrink-0">
            +{percentageEconomie.toFixed(1)}% Super-Net
          </Badge>
        )}
        {percentageEconomie !== null && !hasSignificantEconomie && !ecartNegligeable && (
          <Badge variant="outline" className="bg-amber-100/80 text-amber-700 border-amber-200 font-medium text-xs shrink-0">
            ~{percentageEconomie.toFixed(1)}%
          </Badge>
        )}
      </div>

      {/* Alertes en pills compacts */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {alerts.map((alert, index) => {
            const AlertIcon = alert.icon;
            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getAlertPillStyle(alert.type)}`}
              >
                <AlertIcon className="h-3 w-3 shrink-0" />
                {alert.message}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
