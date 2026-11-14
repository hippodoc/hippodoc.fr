import { Badge } from "@/components/ui/badge";
import { Trophy, Scale, AlertTriangle, FileQuestion, Briefcase, Heart } from "lucide-react";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";
import type { LucideIcon } from "lucide-react";

// ============ SEUILS ============
/**
 * En dessous de 50 €/mois (600 €/an) d'écart, les deux régimes « se valent » : c'est
 * l'ordre de grandeur de ce que le simulateur ne voit pas (arrondis de l'administration,
 * charges approchées, cotisations régularisées). Le montant est TOUJOURS affiché, même
 * dans ce cas (audit de novembre 2026 : « écart négligeable » s'affichait sans montant,
 * y compris pour 1 000 €/mois d'écart au-delà du plafond du Micro-BNC).
 */
const SEUIL_EQUIVALENCE_ANNUEL = 600;
/** Au-delà de 85 % du plafond du Micro-BNC, on prévient qu'il approche. */
const RATIO_APPROCHE_PLAFOND = 0.85;
const SEUIL_CHARGES_FAIBLES_RATIO = 0.05;

// ============ TYPES ============
interface ConclusionCardProps {
  comparison: RegimeComparison;
  formData: SimulateurFormData;
  /** Charges annuelles où les deux régimes se valent ; `null` : le réel l'emporte même sans
   *  charge ; `'attente'` : en cours de calcul ; `undefined` : pas de phrase. */
  bascule?: number | null | 'attente';
}

interface ContextAlert {
  type: 'warning' | 'info' | 'danger';
  icon: LucideIcon;
  message: string;
}

// ============ HELPERS ============
const euros = (montant: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.abs(montant));

// ============ COMPOSANT PRINCIPAL ============
export function ConclusionCard({ comparison, formData, bascule }: ConclusionCardProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) return null;

  // ============ CALCULS ============
  const annuel = (v: number | undefined) => (formData.periode === 'mensuel' ? (v || 0) * 12 : (v || 0));
  const recettesAnnuelles = annuel(formData.recettesBrutes);
  const chargesAnnuelles = annuel(formData.chargesHorsCotisations);
  const ratioCharges = recettesAnnuelles > 0 ? chargesAnnuelles / recettesAnnuelles : 0;
  const revenusSalariesAnnuels = annuel(formData.revenusSalaries);
  const revenusConjointAnnuels = annuel(formData.revenusConjoint);
  const plafond = comparison.plafondMicro ?? 83600;

  const ecartMensuel = Math.round(economie / 12);
  const ecartAnnuel = Math.round(economie);
  const equivalents = !microBnc || economie < SEUIL_EQUIVALENCE_ANNUEL;

  // ============ CONDITIONS ============
  const depassePlafond = recettesAnnuelles > plafond;
  const approchePlafond = !depassePlafond && recettesAnnuelles > plafond * RATIO_APPROCHE_PLAFOND;
  const chargesFaibles = recommande === 'reel' && !equivalents && ratioCharges < SEUIL_CHARGES_FAIBLES_RATIO;

  // Écart en % du Super-Net du régime le moins favorable (même base que les fiches).
  const perdant = recommande === 'micro-bnc' ? reel : microBnc;
  const pourcentage = perdant && perdant.superNet > 0 ? (economie / perdant.superNet) * 100 : null;

  // ============ MESSAGE PRINCIPAL ============
  const regimeLabel = recommande === 'micro-bnc' ? 'Le Micro-BNC' : 'Le régime réel';
  const message = !microBnc
    ? "Le Micro-BNC n'a pas pu être calculé : seul le régime réel est affiché."
    : ecartAnnuel < 1
      ? "Les deux régimes te laissent la même somme. Choisis selon ta préférence de gestion."
      : equivalents
        ? `Les deux régimes se valent : ${euros(ecartMensuel)}/mois d'écart en faveur ${recommande === 'micro-bnc' ? 'du Micro-BNC' : 'du régime réel'} (${euros(ecartAnnuel)}/an). Choisis selon ta préférence de gestion.`
        : `${regimeLabel} te fait garder ${euros(ecartMensuel)}/mois de plus (${euros(ecartAnnuel)}/an).`;

  // ============ À PRÉVOIR CHAQUE MOIS ============
  // Cotisations et impôt de l'activité libérale du régime retenu. L'impôt du foyer est réparti au
  // prorata des revenus imposables : la part des salaires (les tiens ou ceux du conjoint) est
  // prélevée à la source par l'employeur.
  const retenu = recommande === 'micro-bnc' && microBnc ? microBnc : reel;
  const imposableTotal = retenu.revenuImposableTotal || 0;
  const imposableLiberal = retenu.impotDetails?.revenuImposableLiberal || 0;
  const impotLiberal = imposableTotal > 0 ? retenu.impot * Math.min(1, imposableLiberal / imposableTotal) : 0;
  const aPrevoirAnnuel = retenu.cotisationsTotales + impotLiberal;
  const partRecettes = recettesAnnuelles > 0 ? Math.round((aPrevoirAnnuel / recettesAnnuelles) * 100) : 0;
  const aPrevoir = `À prévoir pour tes cotisations et l'impôt de ton activité libérale : ${euros(aPrevoirAnnuel / 12)}/mois (${partRecettes}\u00a0% de tes recettes).`;

  // ============ POINT DE BASCULE ============
  const enMensuel = formData.periode === 'mensuel';
  const charges = (montant: number) => enMensuel
    ? `${euros(montant / 12)} de charges par mois`
    : `${euros(montant)} de charges par an`;
  const declare = enMensuel ? euros(chargesAnnuelles / 12) : euros(chargesAnnuelles);
  let phraseBascule: string | null = null;
  if (bascule === 'attente') {
    phraseBascule = 'Calcul du point de bascule entre les deux régimes…';
  } else if (bascule === null) {
    phraseBascule = 'Même sans aucune charge, le régime réel resterait devant.';
  } else if (typeof bascule === 'number') {
    phraseBascule = recommande === 'micro-bnc'
      ? `Le régime réel passerait devant au-delà d'environ ${charges(bascule)} (tu en déclares ${declare}).`
      : `Le Micro-BNC ne passerait devant que sous environ ${charges(bascule)} (tu en déclares ${declare}).`;
  }

  // ============ ALERTES CONTEXTUELLES ============
  const alerts: ContextAlert[] = [];
  const plafondTexte = euros(plafond);

  if (depassePlafond) {
    alerts.push({
      type: recommande === 'micro-bnc' && !equivalents ? 'danger' : 'warning',
      icon: AlertTriangle,
      message: `Recettes au-dessus de ${plafondTexte} : le Micro-BNC ne reste ouvert que si tes recettes de l'une des deux années précédentes étaient sous ce seuil. Deux années de suite au-dessus, tu passes au réel.`,
    });
  } else if (approchePlafond && recommande === 'micro-bnc') {
    alerts.push({
      type: 'warning',
      icon: AlertTriangle,
      message: `Recettes proches du plafond du Micro-BNC (${plafondTexte}). Deux années de suite au-dessus, tu passes au réel.`,
    });
  }

  if (chargesFaibles) {
    alerts.push({
      type: 'info',
      icon: FileQuestion,
      message: "Charges faibles déclarées. Vérifie que tu n'as rien oublié.",
    });
  }

  if (revenusSalariesAnnuels > 0) {
    alerts.push({
      type: 'info',
      icon: Briefcase,
      message: revenusSalariesAnnuels > recettesAnnuelles
        ? "Revenus salariés majoritaires → impact TMI significatif."
        : "Revenus salariés pris en compte dans l'IR.",
    });
  }

  if (revenusConjointAnnuels > 0) {
    alerts.push({
      type: 'info',
      icon: Heart,
      message: `Conjoint (${euros(revenusConjointAnnuels)}) inclus dans le calcul IR.`,
    });
  }

  const shownAlerts = alerts.slice(0, 3);
  const hasWarnings = shownAlerts.some(a => a.type === 'warning' || a.type === 'danger');

  // ============ STYLES ============
  const { Icon: MainIcon, color: iconColor } = hasWarnings
    ? { Icon: AlertTriangle, color: "sim-attn" }
    : !equivalents
      ? { Icon: Trophy, color: "sim-encre" }
      : { Icon: Scale, color: "sim-marque" };
  const bgClass = hasWarnings ? "attn" : !equivalents ? "gain" : "egal";

  const getAlertPillStyle = (type: 'warning' | 'info' | 'danger') => {
    switch (type) {
      case 'danger': return "attn fort";
      case 'warning': return "attn";
      default: return "info";
    }
  };

  // ============ RENDER ============
  return (
    <div className={`sim-conclusion ${bgClass}`}>
      {/* Ligne principale : icône + message + badge */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="sim-conclusion-signe"><MainIcon className={`h-5 w-5 shrink-0 ${iconColor}`} /></span>
        <p className="sim-conclusion-texte flex-1 min-w-0">
          {message}
        </p>
        {pourcentage !== null && !equivalents && (
          <Badge variant="outline" className="sim-puce encre grande shrink-0">
            +{pourcentage.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}{' '}% Super-Net
          </Badge>
        )}
      </div>

      {/* À prévoir chaque mois, puis point de bascule des charges */}
      <div className="sim-conclusion-detail" aria-live="polite">
        <p>{aPrevoir}</p>
        {phraseBascule && <p>{phraseBascule}</p>}
      </div>

      {/* Alertes en pills compacts */}
      {shownAlerts.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {shownAlerts.map((alert, index) => {
            const AlertIcon = alert.icon;
            return (
              <span
                key={index}
                className={`sim-puce grande multi ${getAlertPillStyle(alert.type)}`}
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
