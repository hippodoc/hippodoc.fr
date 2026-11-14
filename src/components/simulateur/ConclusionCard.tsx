import { Badge } from "@/components/ui/badge";
import { Trophy, Scale, AlertTriangle, FileQuestion } from "lucide-react";
import { SEUIL_EQUIVALENCE_ANNUEL, type RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import { impotDuMedecin } from "@/lib/simulateur/impotMedecin";
import { deductionsComparees } from "@/lib/simulateur/deductions";
import { MARGE_RECETTES } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";
import type { LucideIcon } from "lucide-react";

// ============ SEUILS ============
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
  /** Ce qui resterait de 1 000 € de recettes en plus ; `'attente'` : en cours ; `undefined` : rien. */
  marge?: number | 'attente';
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
export function ConclusionCard({ comparison, formData, bascule, marge }: ConclusionCardProps) {
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
      ? "Les deux régimes te laissent la même somme."
      : equivalents
        ? `Les deux régimes se valent : ${euros(ecartMensuel)}/mois d'écart en faveur ${recommande === 'micro-bnc' ? 'du Micro-BNC' : 'du régime réel'} (${euros(ecartAnnuel)}/an).`
        : `${regimeLabel} te fait garder ${euros(ecartMensuel)}/mois de plus (${euros(ecartAnnuel)}/an).`;

  // ============ POURQUOI ============
  // Ce que chaque régime retire des recettes avant l'impôt (`deductionsComparees`, tiré du
  // moteur), puis, en PAMC, l'écart de cotisations : elles se calculent sur le bénéfice au réel
  // et sur les recettes après abattement en micro (au RSPM, elles sont les mêmes).
  const recettesImposables = Math.max(0, recettesAnnuelles - (comparison.liberalExonereAnnuel ?? 0));
  let pourquoi: string | null = null;
  if (microBnc && ecartAnnuel >= 1 && recettesImposables > 0) {
    const d = deductionsComparees(reel, microBnc, recettesImposables, formData.typeCotisationsVolontaires);
    const pct = (v: number) => `${Math.round((v / recettesImposables) * 100)}\u00a0%`;
    const zone = d.zoneReelSeul > 0 ? `, dont ${euros(d.zoneReelSeul)} d'exonération de zone, qui ne joue qu'au réel` : '';
    const impotNet = (r: typeof reel) => r.impot - (r.impotDetails?.restitutionCredits ?? 0);
    const memeImpot = Math.abs(impotNet(reel) - impotNet(microBnc)) < 1;
    const ecartCotisations = Math.round(microBnc.cotisationsTotales - reel.cotisationsTotales);
    const sens = ecartCotisations > 0 ? 'plus basses' : 'plus élevées';
    const cotisationsDiffèrent = !comparison.isRSPMUsed && Math.abs(ecartCotisations) >= 100;
    if (memeImpot) {
      // Impôt identique (nul des deux côtés, par exemple) : les déductions ne départagent rien.
      if (cotisationsDiffèrent) {
        pourquoi = `Ton impôt est le même dans les deux régimes : l'écart vient de tes cotisations, ${sens} de ${euros(ecartCotisations)} au réel, où elles se calculent sur ton bénéfice.`;
      }
    } else {
      pourquoi = `Au réel, tu déduis ${euros(d.reel)} de tes recettes avant l'impôt (${pct(d.reel)})${zone} ; le Micro-BNC en retire ${euros(d.micro)} d'office (${d.microMinimum ? 'le minimum de 305\u00a0€' : '34\u00a0%'}).`;
      if (cotisationsDiffèrent) pourquoi += ` Au réel, tes cotisations sont aussi ${sens} de ${euros(ecartCotisations)}.`;
    }
  }

  // ============ CE QUI CHANGE ============
  // Quand les deux régimes se valent, ce qui les départage est la gestion (CGI art. 102 ter, 4,
  // et art. 99). Quand le réel l'emporte et que le Micro-BNC reste ouvert, comment y passer :
  // l'option résulte du dépôt de la 2035 dans le délai, vaut un an et se reconduit tacitement
  // (BOI-BNC-DECLA-10-10, § 130 à 140).
  let gestion: { titre: string; texte: string } | null = null;
  if (microBnc && equivalents) {
    gestion = {
      titre: 'Ce qui change',
      texte: "Seulement la gestion. En micro, une case de ta déclaration de revenus (2042-C PRO) et le détail de tes recettes au jour le jour. Au réel, une déclaration 2035 et un livre-journal des recettes et des dépenses ; les honoraires d'un comptable sont une charge, ajoute-les pour comparer.",
    };
  } else if (microBnc && recommande === 'reel' && !depassePlafond) {
    gestion = {
      titre: 'Passer au réel',
      texte: "Il suffit de déposer ta déclaration 2035 dans les délais : l'option vaut un an et se renouvelle d'elle-même.",
    };
  }

  // ============ À PRÉVOIR CHAQUE MOIS ============
  // Cotisations et impôt de l'activité libérale du régime retenu, par destinataire : l'Urssaf
  // (au RSPM, retraite CARMF comprise), la CARMF (au RSPM, l'invalidité-décès seule) et
  // l'impôt de l'activité libérale (`impotDuMedecin` : sa part du foyer ; celle des salaires
  // est retenue par l'employeur). Le total est la somme des parts arrondies : rien à recompter.
  const retenu = recommande === 'micro-bnc' && microBnc ? microBnc : reel;
  const { impotLiberal } = impotDuMedecin(retenu, {
    revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? revenusSalariesAnnuels,
    revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? revenusConjointAnnuels,
    situationFamiliale: formData.situationFamiliale,
  });
  const carmfMois = Math.round(Math.max(0, retenu.cotisationsDetail?.retraite ?? 0) / 12);
  const urssafMois = Math.round(Math.max(0, retenu.cotisationsTotales) / 12) - carmfMois;
  const impotMois = Math.round(impotLiberal / 12);
  const totalMois = urssafMois + carmfMois + impotMois;
  const partRecettes = recettesAnnuelles > 0 ? Math.round((totalMois * 12 / recettesAnnuelles) * 100) : 0;
  // Les parts dans l'ordre de la barre ; une part nulle (CARMF dispensée, impôt nul) n'y est pas.
  const partsMois = [
    { nom: 'Urssaf', cle: 'u', mois: urssafMois },
    { nom: 'CARMF', cle: 'c', mois: carmfMois },
    { nom: 'Impôt', cle: 'i', mois: impotMois },
  ].filter((p) => p.mois > 0);

  // ============ POINT DE BASCULE ============
  const enMensuel = formData.periode === 'mensuel';
  const declare = enMensuel ? euros(chargesAnnuelles / 12) : euros(chargesAnnuelles);
  // En attente, la phrase a déjà sa forme finale, le montant en « … » : les fiches, dessous, ne
  // sautent pas à l'arrivée du calcul (22 à 44 px au téléphone avec une phrase d'attente).
  const charges = (montant: number | null) => {
    const m = montant === null ? '…\u00a0€' : euros(enMensuel ? montant / 12 : montant);
    return `${m} de charges par ${enMensuel ? 'mois' : 'an'}`;
  };
  let phraseBascule: string | null = null;
  const basculeEnAttente = bascule === 'attente';
  if (basculeEnAttente || typeof bascule === 'number') {
    const c = charges(typeof bascule === 'number' ? bascule : null);
    phraseBascule = recommande === 'micro-bnc'
      ? `Le régime réel passerait devant au-delà d'environ ${c} (tu en déclares ${declare}).`
      : `Le Micro-BNC ne passerait devant que sous environ ${c} (tu en déclares ${declare}).`;
  } else if (bascule === null) {
    phraseBascule = 'Même sans aucune charge, le régime réel resterait devant.';
  }

  // ============ 1 000 € DE PLUS ============
  let phraseMarge: string | null = null;
  if (marge === 'attente' || typeof marge === 'number') {
    const reste = typeof marge === 'number' ? euros(Math.round(marge / 10) * 10) : '…\u00a0€';
    phraseMarge = `${euros(MARGE_RECETTES)} de recettes en plus dans l'année t'en laisseraient environ ${reste}, après cotisations et impôt.`;
  }

  // ============ ALERTES CONTEXTUELLES ============
  const alerts: ContextAlert[] = [];
  const plafondTexte = euros(plafond);

  if (depassePlafond) {
    alerts.push({
      // Le réel l'emporte : le plafond ne change pas le conseil, c'est une information.
      type: recommande === 'reel' ? 'info' : !equivalents ? 'danger' : 'warning',
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

  // Les pastilles « Revenus salariés pris en compte dans l'IR » et « Conjoint inclus dans le
  // calcul IR » sont retirées (§ 9.ft) : elles redisaient la saisie, et les fiches portent ces
  // lignes (« Revenus salariés », « Mon impôt (estimé) »).

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

      {/* Le raisonnement, ligne par ligne sous une étiquette (§ 9.fu) : pourquoi, point de
          bascule des charges, ce qui change. */}
      {(pourquoi || phraseBascule || gestion) && (
        <dl className="sim-conclusion-detail sim-conclusion-raisons" aria-live="polite" aria-busy={basculeEnAttente}>
          {pourquoi && <div><dt>Pourquoi</dt><dd>{pourquoi}</dd></div>}
          {phraseBascule && <div><dt>Point de bascule</dt><dd>{phraseBascule}</dd></div>}
          {gestion && <div><dt>{gestion.titre}</dt><dd>{gestion.texte}</dd></div>}
        </dl>
      )}

      {/* Les chiffres du mois : le total à mettre de côté, sa répartition en barre, puis
          ce qu'il resterait de 1 000 € de plus. */}
      <div className="sim-conclusion-detail sim-conclusion-mois" aria-live="polite" aria-busy={marge === 'attente'}>
        <p className="sim-mois-tete">À mettre de côté chaque mois pour ton activité libérale</p>
        <p className="sim-mois-total">
          <strong>{euros(totalMois)}</strong> <span>{partRecettes}{'\u00a0'}% de tes recettes</span>
        </p>
        {partsMois.length > 0 && (
          <>
            <div className="sim-mois-barre" aria-hidden="true">
              {partsMois.map((p) => <span key={p.cle} className={p.cle} style={{ flexGrow: p.mois }} />)}
            </div>
            <ul className="sim-mois-parts">
              {partsMois.map((p) => (
                <li key={p.cle}><span className={`sim-mois-point ${p.cle}`} aria-hidden="true" />{p.nom} <strong>{euros(p.mois)}</strong></li>
              ))}
            </ul>
          </>
        )}
        {phraseMarge && <p className="sim-mois-marge">{phraseMarge}</p>}
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
