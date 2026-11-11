import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Info, Wallet, Landmark, Shield, Briefcase, Trophy, ChevronDown, Calculator, FileText, AlertTriangle, MapPin, Heart, Users, Percent, Building, GraduationCap, Leaf, Home, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SimulationResult } from "@/lib/simulation-types";
import { PremiumTooltip } from "@/components/simulateur/PremiumTooltip";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { calculateIndividualizedTax, type IndividualizedTaxResult } from "@/lib/individualizedTax";
import { getDeclarationParams } from "@/lib/declarationParams";
import { abattement10Salaire, getBaremeIR } from "@/lib/baremes-ir";

import type { LieuExercice } from "@/lib/dom-tom";

interface DomTomResultInfo {
  territoire: string;
  tauxAbattement: number;
  plafond: number;
  abattementApplique?: number;
}

interface RegimeComparisonCardsProps {
  reel: SimulationResult;
  microBnc: SimulationResult | null;
  recommande: 'reel' | 'micro-bnc';
  economie: number;
  periode: 'annuel' | 'mensuel';
  recettesAnnuelles?: number;
  revenusSalariesAnnuels?: number;
  revenusConjointAnnuels?: number;  // ✅ Revenu du conjoint (pour affichage)
  liberalExonereAnnuel?: number;  // ✅ Revenus PDSA exonérés IR
  domTomInfo?: DomTomResultInfo | null;
  lieuExercice?: LieuExercice;
  isRSPMUsed?: boolean;  // ✅ Indique si RSPM a été utilisé
  situationFamiliale?: string;  // ✅ Pour le calcul du taux individualisé
  annee?: number;  // ✅ Année fiscale sélectionnée (pour tooltip ANCV dynamique)
}

// Palette de la DA : trois bleus de l'eau pour ce qui part (du plus clair au
// plus profond, comme la jauge de l'accueil), le jaune pour ce qu'il reste.
const HIPPO_COLORS = {
  charges: '#8DB9F2',
  cotisations: '#4F88DE',
  impots: '#1F4FA8',
  superNet: '#FFD84A',
};


// Mini-donut intégré dans les cartes de comparaison
function MiniDonut({ charges, cotisations, impot, superNet, total }: {
  charges: number; cotisations: number; impot: number; superNet: number; total: number;
}) {
  const data = [
    { name: 'Charges', value: charges, color: HIPPO_COLORS.charges },
    { name: 'Cotisations', value: cotisations, color: HIPPO_COLORS.cotisations },
    { name: 'Impôt', value: impot, color: HIPPO_COLORS.impots },
    { name: 'Reste à vivre', value: superNet, color: HIPPO_COLORS.superNet },
  ].filter(d => d.value > 0);

  if (total <= 0) return null;

  const formatTotal = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <div className="relative w-[100px] h-[100px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={46}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Label central */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[7px] text-muted-foreground leading-tight">Revenus</p>
            <p className="text-[10px] font-bold text-foreground leading-tight">{formatTotal(total)}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-semibold">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Composant CountUp simple
function CountUp({ end, duration = 1.2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return <>{count.toLocaleString('fr-FR')}</>;
}

export function RegimeComparisonCards({ reel, microBnc, recommande, economie, periode, recettesAnnuelles, revenusSalariesAnnuels = 0, revenusConjointAnnuels = 0, liberalExonereAnnuel = 0, domTomInfo, lieuExercice, isRSPMUsed, situationFamiliale = 'marie_pacse', annee = 2026 }: RegimeComparisonCardsProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const formatMontant = (montant: number) => {
    const value = periode === 'mensuel' ? montant / 12 : montant;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const periodeSuffix = periode === 'mensuel' ? '/mois' : '/an';
  const PLAFOND_MICRO_BNC = 83600;
  // `recettesAnnuelles && ...` vaut 0 (et non false) quand les recettes sont
  // nulles : JSX afficherait alors littéralement « 0 » à la place du bloc.
  const depassePlafond = Boolean(recettesAnnuelles && recettesAnnuelles > PLAFOND_MICRO_BNC);
  
  // ✅ Détection revenus mixtes et conjoint
  const hasRevenusSalaries = revenusSalariesAnnuels > 0;
  const isCoupleFiscal = situationFamiliale === 'marie_pacse';
  const hasRevenusConjoint = revenusConjointAnnuels > 0;
  const revenusTotaux = (recettesAnnuelles || 0) + revenusSalariesAnnuels;

  const renderCard = (type: 'reel' | 'micro-bnc', result: SimulationResult, isRecommended: boolean, showWarning: boolean = false) => {
    const title = type === 'reel' ? 'Régime Réel' : 'Micro-BNC';
    const description = type === 'reel' 
      ? 'Charges réelles déductibles' 
      : 'Abattement forfaitaire 34%';
    const Icon = type === 'reel' ? FileText : Calculator;
    const superNetLabel = 'Super-Net';

    // ✅ Calcul de l'impôt individuel du médecin avec le vrai taux individualisé DGFiP
    const getImpotMedecin = (): IndividualizedTaxResult => {
      if (!hasRevenusConjoint) {
        return { 
          impotMedecin: result.impot, 
          impotConjoint: 0, 
          tauxMedecin: 0, 
          tauxConjoint: 0, 
          tauxFoyer: 0,
          medecinEstMoinsDisant: false 
        };
      }
      
      // Revenus imposables (après abattements fiscaux)
      const revenuImposableMedecin = (result.impotDetails?.revenuImposableLiberal || 0) + 
                                      (result.impotDetails?.revenuImposableSalarie || 0);
      const revenuImposableConjoint = result.impotDetails?.revenuImposableConjoint || 0;
      
      // Assiettes PAS (revenus bruts pour le prélèvement à la source)
      // Pour le médecin libéral : BNC net = CA - charges - cotisations (pas le revenu imposable après abattement)
      // Pour le médecin salarié : salaire brut (AVANT abattement 10%)
      // Pour le conjoint salarié : salaire brut (AVANT abattement 10%)
      const bncNet = (recettesAnnuelles || 0) - (result.chargesReelles || 0) - (result.cotisationsTotales ?? 0);
      const salaireBrutMedecin = revenusSalariesAnnuels || 0;
      const brutMedecin = bncNet + salaireBrutMedecin;
      const brutConjoint = revenusConjointAnnuels;
      
      const parts = result.impotDetails?.parts || 2;
      
      return calculateIndividualizedTax(
        revenuImposableMedecin,
        revenuImposableConjoint,
        brutMedecin,
        brutConjoint,
        result.impot ?? 0,
        parts,
        situationFamiliale
      );
    };

    const taxResult = getImpotMedecin();
    const { impotMedecin, impotConjoint, tauxMedecin, tauxConjoint, tauxFoyer, medecinEstMoinsDisant } = taxResult;

    // ✅ Calcul du Super-Net réel du médecin (avec son impôt individuel)
    // Inclut les revenus libéraux ET salariés du médecin (Bug 2 corrigé)
    const superNetMedecinReel = hasRevenusConjoint 
      ? (recettesAnnuelles || 0) + revenusSalariesAnnuels - (result.chargesReelles || 0) - (result.cotisationsTotales ?? 0) - impotMedecin
      : (result.superNet ?? 0);

    // Detail items with icons and JSX tooltip content
    const detailItems: Array<{
      icon: typeof Wallet;
      label: string;
      value: number;
      colorClass: string;
      negative: boolean;
      tooltip?: string;
      tooltipContent?: React.ReactNode;
      isInfoLine?: boolean;
      badge?: string;  // ✅ Badge optionnel (ex: "Exonéré IR")
    }> = [];

    // ✅ Ligne 1 : Revenus libéraux (toujours présente)
    detailItems.push({
      icon: Stethoscope,
      label: "Revenus libéraux",
      value: recettesAnnuelles || 0,
      colorClass: "sim-marque",
      negative: false,
      tooltip: "Vos recettes d'activité libérale avant toute déduction"
    });

    // ✅ Afficher les revenus salariés si présents
    if (hasRevenusSalaries) {
      // Calculer le détail pour la tooltip — abattement 10 % year-aware (plancher 504 € / plafond 14 426 € en 2025-2026, Art. 83 CGI)
      const abattementSalaries = abattement10Salaire(revenusSalariesAnnuels, annee || 2026);
      const imposableSalaries = Math.max(0, revenusSalariesAnnuels - abattementSalaries);
      
      detailItems.push({
        icon: Briefcase,
        label: "Revenus salariés",
        value: revenusSalariesAnnuels,
        colorClass: "sim-marque",
        negative: false,
        tooltip: `${formatMontant(revenusSalariesAnnuels)} brut − ${formatMontant(abattementSalaries)} (abattement 10%) = ${formatMontant(imposableSalaries)} imposable`
      });
    }

    // ✅ Afficher les revenus du conjoint si présents avec tooltip dynamique
    if (hasRevenusConjoint) {
      // Générer le tooltip selon le type de revenu du conjoint
      const typeConjoint = result.impotDetails?.typeRevenuConjoint || 'salarie';
      const revenuImposableConjoint = result.impotDetails?.revenuImposableConjoint || 0;
      
      const anneeFiscale = annee || 2026;
      const plafondConjoint = getBaremeIR(anneeFiscale).plafondAbattement10Salaire;
      const getConjointTooltip = (): string => {
        switch (typeConjoint) {
          case 'salarie':
            return `Revenus bruts ${formatMontant(revenusConjointAnnuels)} - Abattement 10% (max ${formatMontant(plafondConjoint)} en ${anneeFiscale}) = ${formatMontant(revenuImposableConjoint)} imposables`;
          case 'liberal_micro':
            return `CA brut ${formatMontant(revenusConjointAnnuels)} × 66% (abattement 34%) = ${formatMontant(revenuImposableConjoint)} imposables`;
          case 'liberal_reel':
            return `Bénéfice fiscal déclaré : ${formatMontant(revenusConjointAnnuels)} (pas d'abattement supplémentaire)`;
          case 'autre':
            return `Montant imposable : ${formatMontant(revenusConjointAnnuels)} (revenus fonciers, autres)`;
          default:
            return "Ajoutés à ton revenu imposable pour calculer l'impôt du foyer";
        }
      };

      detailItems.push({
        icon: Heart,
        label: "Revenus du conjoint",
        value: revenusConjointAnnuels,
        colorClass: "sim-marque",
        negative: false,
        tooltip: getConjointTooltip()
      });
    }

    // ✅ Afficher les revenus PDSA exonérés si présents
    if (liberalExonereAnnuel > 0) {
      detailItems.push({
        icon: Shield,
        label: "dont PDSA",
        value: liberalExonereAnnuel,
        colorClass: "sim-marque",
        negative: false,
        badge: "Exonéré IR",
        tooltip: "Inclus dans tes honoraires. Exonéré d'IR (Art. 151 ter CGI) mais soumis aux cotisations sociales."
      });
    }

    // ✅ Helper TMI badge coloré
    const getTMIBadgeClass = (tmi: number): string => {
      if (tmi <= 0) return 'ok';
      if (tmi <= 11) return 'info';
      if (tmi <= 30) return 'attn';
      if (tmi <= 41) return 'attn';
      return 'attn fort';
    };

    // ✅ Tooltip JSX "Revenu imposable" - Composition détaillée avec optimisations
    const getRevenuImposableTooltipContent = () => {
      const liberal = result.impotDetails?.revenuImposableLiberal || 0;
      const salarie = result.impotDetails?.revenuImposableSalarie || 0;
      const conjoint = result.impotDetails?.revenuImposableConjoint || 0;
      const optim = result.optimisationsAppliquees;

      return (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Wallet className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">Composition du revenu imposable</span>
          </div>
          
          {/* Breakdown par source */}
          <div className="space-y-1.5 text-xs">
            {/* Libéral */}
            <div className="flex justify-between gap-4 items-start">
              <div className="flex items-center gap-1.5">
                <div className="sim-point a" />
                <span className="text-muted-foreground">Libéral :</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatMontant(liberal)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {type === 'micro-bnc' 
                    ? `${formatMontant(recettesAnnuelles || 0)} × 66%`
                    : "CA − charges − cotis."
                  }
                </div>
              </div>
            </div>

            {/* Optimisations appliquées (visibles dans le tooltip) */}
            {optim && type === 'reel' && (
              <div className="sim-retrait space-y-1 pl-3 ml-1">
                {optim.forfait2pct && optim.forfait2pct > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Forfait 2% :</span>
                    <span className="sim-eau text-[10px] font-medium">−{formatMontant(optim.forfait2pct)}</span>
                  </div>
                )}
                {optim.deductionsS1 && optim.deductionsS1 > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Déductions S1 :</span>
                    <span className="sim-eau text-[10px] font-medium">−{formatMontant(optim.deductionsS1)}</span>
                  </div>
                )}
                {optim.cotisationsVolontaires && optim.cotisationsVolontaires > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− PER/Madelin :</span>
                    <span className="sim-eau text-[10px] font-medium">−{formatMontant(optim.cotisationsVolontaires)}</span>
                  </div>
                )}
                {optim.chequesVacances && optim.chequesVacances > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Chèques-vacances :</span>
                    <span className="sim-eau text-[10px] font-medium">−{formatMontant(optim.chequesVacances)}</span>
                  </div>
                )}
                {optim.exonerationZone && optim.exonerationZone > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Zone exonérée ({Math.round((optim.tauxExonerationZone || 0) * 100)}%) :</span>
                    <span className="sim-eau text-[10px] font-medium">−{formatMontant(optim.exonerationZone)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Salarié */}
            {hasRevenusSalaries && (
              <div className="flex justify-between gap-4 items-start">
                <div className="flex items-center gap-1.5">
                  <div className="sim-point b" />
                  <span className="text-muted-foreground">Salarié :</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatMontant(salarie)}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {formatMontant(revenusSalariesAnnuels)} − 10%
                  </div>
                </div>
              </div>
            )}
            
            {/* Conjoint */}
            {hasRevenusConjoint && (
              <div className="flex justify-between gap-4 items-start">
                <div className="flex items-center gap-1.5">
                  <div className="sim-point c" />
                  <span className="text-muted-foreground">Conjoint :</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatMontant(conjoint)}</div>
                </div>
              </div>
            )}

            {/* Revenus fonciers */}
            {optim?.revenuFoncier && optim.revenuFoncier !== 0 && (
              <div className="flex justify-between gap-4 items-start">
                <div className="flex items-center gap-1.5">
                  <div className="sim-point d" />
                  <span className="text-muted-foreground">
                    {optim.revenuFoncier < 0 
                      ? 'Déficit foncier :' 
                      : optim.revenuFoncierType === 'micro' ? 'Foncier micro (abatt. 30%) :' : optim.revenuFoncierType === 'reel' ? 'Foncier réel :' : 'Foncier :'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {optim.revenuFoncier > 0 ? '+' : ''}{formatMontant(optim.revenuFoncier)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Total */}
          <div className="flex justify-between gap-4 pt-1.5 border-t border-border/40">
            <span className="text-xs font-medium">Total imposable :</span>
            <span className="text-xs font-bold">
              {formatMontant(result.revenuImposableTotal || (liberal + salarie + conjoint))}
            </span>
          </div>

          {/* Crédits d'impôt (post-impôt) */}
          {optim && ((optim.creditFormation && optim.creditFormation > 0) || (optim.creditImpotAutre && optim.creditImpotAutre > 0) || (optim.creditEmploiDomicile && optim.creditEmploiDomicile > 0) || (optim.creditGardeEnfants && optim.creditGardeEnfants > 0)) && (
            <div className="sim-note ok">
              <strong>💡 Crédits d'impôt appliqués</strong>
              <p className="mt-1">
                {[
                  optim.creditFormation ? `Formation : −${formatMontant(optim.creditFormation)}` : '',
                  optim.creditEmploiDomicile ? `Emploi domicile : −${formatMontant(optim.creditEmploiDomicile)}` : '',
                  optim.creditGardeEnfants ? `Garde enfant : −${formatMontant(optim.creditGardeEnfants)}` : '',
                  optim.creditImpotAutre ? `Autres : −${formatMontant(optim.creditImpotAutre)}` : '',
                ].filter(Boolean).join(' · ')}
                {' '}(soustraits de l'impôt)
              </p>
            </div>
          )}
        </div>
      );
    };

    // ✅ Tooltip JSX "Impôt sur le revenu" - Foyer fiscal + quotient familial + plafonnement
    const getImpotTooltipContent = () => {
      const parts = result.impotDetails?.parts || 1;
      const tmi = result.impotDetails?.tmi;
      const tauxEffectif = result.impotDetails?.tauxEffectif;
      const revenuTotal = result.revenuImposableTotal || result.netAvantImpot;
      const qf = result.impotDetails?.quotientFamilial || Math.round(revenuTotal / parts);
      
      // ✅ Données de plafonnement QF
      const plafonnementApplique = result.impotDetails?.plafonnementApplique;
      const avantageEnfantsInitial = result.impotDetails?.avantageEnfantsInitial;
      const plafondUtilise = result.impotDetails?.plafondUtilise;

      return (
        <div className="space-y-2.5">
          {/* Header avec icône contextuelle */}
          <div className="flex items-center gap-2">
            <Landmark className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">
              {hasRevenusConjoint 
                ? "Impôt du foyer fiscal" 
                : hasRevenusSalaries 
                  ? "Impôt sur tes revenus" 
                  : "Impôt sur ton activité"
              }
            </span>
          </div>
          
          {/* Calcul principal */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Revenu imposable :</span>
              <span className="font-medium">{formatMontant(revenuTotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">÷ {parts} part{parts > 1 ? 's' : ''} :</span>
              <span className="font-medium">{formatMontant(qf)}/part</span>
            </div>
          </div>
          
          {/* Badge TMI + Taux effectif */}
          {tmi !== undefined && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-border/40">
              <div className={`sim-puce ${getTMIBadgeClass(tmi)}`}>
                TMI {tmi}%
              </div>
              <span className="text-[10px] text-muted-foreground">
                Taux effectif : {tauxEffectif ?? (revenuTotal > 0 ? Math.round((result.impot / revenuTotal) * 100) : 0)}%
              </span>
            </div>
          )}
          
          {/* ✅ Encart plafonnement QF si appliqué */}
          {plafonnementApplique && (
            <div className="sim-note attn">
              <strong>⚠️ Plafonnement appliqué</strong>
              <p className="mt-1">
                L'avantage fiscal lié à tes enfants est limité à {formatMontant(plafondUtilise || 0)}.
                <br />
                Sans ce plafond, tu aurais économisé {formatMontant(avantageEnfantsInitial || 0)}.
              </p>
            </div>
          )}
          
          {/* Encart pédagogique */}
          <div className="sim-note neutre">
            <strong className="text-foreground">Quotient familial</strong> : ton revenu est divisé par tes parts 
            avant d'appliquer le barème progressif, puis multiplié à nouveau.
          </div>
        </div>
      );
    };

    // ✅ Tooltip JSX "Mon impôt (estimé)" - Pour couples avec taux individualisé DGFiP
    const getImpotMedecinTooltipContent = () => {
      // Calcul du pourcentage réel basé sur l'impôt
      const pourcentageMedecin = result.impot > 0 
        ? Math.round((impotMedecin / result.impot) * 100) 
        : 0;
      
      return (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Landmark className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">Ma part d'impôt (taux individualisé)</span>
          </div>
          
          {/* Explication taux individualisé */}
          <p className="text-xs text-muted-foreground">
            Depuis septembre 2025, chaque conjoint a son taux individualisé calculé par la DGFiP.
          </p>
          
          {/* Répartition visuelle avec taux */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <div className="sim-point a" />
                <span className="text-muted-foreground">
                  Toi (~{tauxMedecin}%) :
                </span>
              </div>
              <span className="font-medium">{formatMontant(impotMedecin)}</span>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <div className="sim-point c" />
                <span className="text-muted-foreground">
                  Conjoint (~{tauxConjoint}%) :
                </span>
              </div>
              <span className="font-medium">{formatMontant(impotConjoint)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-border/40">
              <span className="font-medium">Total foyer :</span>
              <span className="font-bold">{formatMontant(result.impot)}</span>
            </div>
            {tauxFoyer > 0 && (
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span className="text-[10px]">Taux foyer unique :</span>
                <span className="text-[10px]">~{tauxFoyer}%</span>
              </div>
            )}
        </div>
          
          {/* Avertissement */}
          <div className="sim-note attn">
            <strong>⚠️ Estimation indicative</strong>
            <p className="mt-1">
              Les vrais taux sont calculés par la DGFiP avec des règles supplémentaires (revenus communs, arrondis officiels, etc.).
            </p>
          </div>
        </div>
      );
    };
    
    // ✅ Tooltip JSX "Parts fiscales"
    const getPartsTooltipContent = () => {
      const parts = result.impotDetails?.parts || 1;
      
      return (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Users className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">Parts fiscales</span>
          </div>
          
          {/* Composition */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {isCoupleFiscal ? "Couple marié/pacsé :" : "Célibataire :"}
              </span>
              <span className="font-medium">{isCoupleFiscal ? "2 parts" : "1 part"}</span>
            </div>
            
            {/* Enfants si applicable */}
            {(parts > 2 || (parts > 1 && !isCoupleFiscal)) && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Enfants à charge :</span>
                <span className="font-medium">
                  +{(parts - (isCoupleFiscal ? 2 : 1)).toFixed(1)} part(s)
                </span>
              </div>
            )}
          </div>
          
          {/* Total avec badge */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
            <span className="text-xs font-medium">Total :</span>
            <Badge variant="outline" className="sim-puce info">
              {parts} part{parts > 1 ? 's' : ''}
            </Badge>
          </div>
          
          {/* Note pédagogique courte */}
          <p className="text-[10px] text-muted-foreground italic">
            Plus tu as de parts, plus ton impôt est réduit grâce au quotient familial.
          </p>
        </div>
      );
    };

    // ✅ Tooltip JSX "Cotisations sociales" - Détail URSSAF + CARMF + déductibilité
    const getCotisationsTooltipContent = () => {
      const detail = result.cotisationsDetail;
      const isRSPM = result.isRSPM;

      return (
        <div className="space-y-2.5">
          {/* Header avec badge régime */}
          <div className="flex items-center gap-2 flex-wrap">
            <Shield className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">Cotisations sociales</span>
            <Badge variant="outline" className={cn(
              "sim-puce petite",
              isRSPM 
                ? "info" 
                : "neutre"
            )}>
              {isRSPM ? 'RSPM' : 'PAMC'}
            </Badge>
          </div>
          
          {/* Détail des cotisations */}
          {detail && (
            <div className="space-y-1 text-xs">
              {/* Affichage détaillé CARMF si on a le split RID/Complémentaire */}
              {(detail.retraiteRid !== undefined || detail.retraiteComplementaire !== undefined) ? (
                <>
                  {(detail.retraiteRid ?? 0) > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">CARMF RID :</span>
                      <span className="font-medium">{formatMontant(detail.retraiteRid || 0)}</span>
                    </div>
                  )}
                  {(detail.retraiteComplementaire ?? 0) > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">CARMF complémentaire :</span>
                      <span className="font-medium">{formatMontant(detail.retraiteComplementaire || 0)}</span>
                    </div>
                  )}
                  {(detail.retraiteRid ?? 0) === 0 && (detail.retraiteComplementaire ?? 0) === 0 && detail.retraite === 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">CARMF :</span>
                      <span className="font-medium">0 €</span>
                    </div>
                  )}
                </>
              ) : (
                detail.retraite > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">CARMF (retraite) :</span>
                    <span className="font-medium">{formatMontant(detail.retraite)}</span>
                  </div>
                )
              )}
              {detail.csgCrds > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">CSG-CRDS :</span>
                  <span className="font-medium">{formatMontant(detail.csgCrds)}</span>
                </div>
              )}
              {detail.maladie > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Maladie :</span>
                  <span className="font-medium">{formatMontant(detail.maladie)}</span>
                </div>
              )}
              {detail.allocationsFamiliales > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Alloc. familiales :</span>
                  <span className="font-medium">{formatMontant(detail.allocationsFamiliales)}</span>
                </div>
              )}
              {detail.formation > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Formation :</span>
                  <span className="font-medium">{formatMontant(detail.formation)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Total avec séparateur */}
          <div className="flex justify-between gap-4 pt-1.5 border-t border-border/40">
            <span className="text-xs font-medium">Total :</span>
            <span className="text-xs font-bold">
              {formatMontant(result.cotisationsTotales)}
            </span>
          </div>
          
          {/* ✅ Encart pédagogique sur la déductibilité du CA libéral */}
          <div className="sim-note info">
            <strong>💡 Déductibles du CA libéral</strong>
            <p className="mt-1">
              Ces cotisations réduisent ton revenu imposable, diminuant ainsi ton impôt final.
            </p>
          </div>
          
          {/* Note régime */}
          <p className="text-[10px] text-muted-foreground italic">
            {isRSPM 
              ? "Régime simplifié : taux forfaitaires appliqués selon ton CA"
              : "Cotisations calculées selon le barème URSSAF en vigueur"
            }
          </p>
        </div>
      );
    };

    // ========================================
    // Tooltip premium pour les charges professionnelles
    // ========================================
    const getChargesTooltipContent = () => {
      const chargesAmount = result.chargesReelles || 0;
      
      return (
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Briefcase className="sim-marque h-4 w-4" />
            <span className="font-semibold text-sm">Charges professionnelles</span>
          </div>
          
          {/* Montant */}
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Montant déclaré :</span>
            <span className="font-medium">{formatMontant(chargesAmount)}</span>
          </div>
          
          {/* Explication contextuelle selon régime */}
          {type === 'micro-bnc' ? (
            <div className="sim-note attn">
              <strong>⚠️ Non déductibles en Micro-BNC</strong>
              <p className="mt-1">
                L'abattement forfaitaire de 34 % (CGI Art. 102 ter) remplace tes charges réelles.
                Elles sont saisies à titre d'information mais n'impactent ni l'impôt ni le Super-Net.
              </p>
            </div>
          ) : (
            <div className="sim-note ok">
              <strong>✅ Déductibles en Régime Réel</strong>
              <p className="mt-1">
                Ces charges réduisent directement ton revenu imposable, diminuant ainsi ton impôt.
              </p>
            </div>
          )}
        </div>
      );
    };

    // ========================================
    // 1. CHARGES PROFESSIONNELLES (déduction #1 du CA)
    // ========================================
    if (result.chargesReelles && result.chargesReelles > 0) {
      detailItems.push({
        icon: Briefcase,
        label: "Charges professionnelles",
        value: result.chargesReelles,
        colorClass: "sim-eau",
        negative: true,
        tooltipContent: getChargesTooltipContent()
      });
    }

    // ========================================
    // 2. COTISATIONS SOCIALES (déduction #2 du CA) ← DÉPLACÉ ICI
    // ========================================
    detailItems.push({ 
      icon: Shield, 
      label: "Cotisations sociales", 
      value: result.cotisationsTotales, 
      colorClass: "sim-eau",
      negative: true,
      tooltipContent: getCotisationsTooltipContent()
    });

    // ========================================
    // 2.5. OPTIMISATIONS FISCALES (Phase 1/2/3) — lignes conditionnelles
    // ========================================
    const optim = result.optimisationsAppliquees;
    
    // Optimisations RÉEL ONLY (forfait 2%, déductions S1)
    if (optim && type === 'reel') {
      // Forfait 2%
      if (optim.forfait2pct && optim.forfait2pct > 0) {
        detailItems.push({
          icon: Percent,
          label: "Forfait 2% (représentation)",
          value: optim.forfait2pct,
          colorClass: "sim-eau",
          negative: true,
          tooltip: "Frais de représentation forfaitaires (2% du CA) déductibles pour les médecins conventionnés Secteur 1 en BNC réel."
        });
      }
      // Déductions S1
      if (optim.deductionsS1 && optim.deductionsS1 > 0) {
        detailItems.push({
          icon: Building,
          label: "Déductions S1 (3% + Grp III)",
          value: optim.deductionsS1,
          colorClass: "sim-eau",
          negative: true,
          tooltip: "Déduction conventionnelle de 3% sur les honoraires + barème Groupe III (770 € à 3 050 € selon le CA) pour les Secteur 1 en BNC réel."
        });
      }
      // Chèques-vacances ANCV — tooltip dynamique selon l'année sélectionnée
      if (optim.chequesVacances && optim.chequesVacances > 0) {
        const plafondCV = getDeclarationParams(annee).plafondChequesVacances;
        const plafondLabel = `${plafondCV.toLocaleString('fr-FR')} € pour ${annee}`;
        const mentionProjete = annee >= 2026
          ? ` (projeté, à confirmer après publication officielle du SMIC ${annee})`
          : '';
        detailItems.push({
          icon: Leaf,
          label: "Chèques-vacances ANCV",
          value: optim.chequesVacances,
          colorClass: "sim-eau",
          negative: true,
          tooltip: `Chèques-vacances ANCV déductibles du BNC réel (Art. L411-5 Code du tourisme). Plafond annuel = 1 SMIC mensuel : ${plafondLabel}${mentionProjete}.`
        });
      }
    }

    // Optimisations TOUS RÉGIMES (PER, zone, fonciers, crédits)
    if (optim) {
      // PER/Madelin
      if (optim.cotisationsVolontaires && optim.cotisationsVolontaires > 0) {
        detailItems.push({
          icon: Leaf,
          label: "PER / Madelin",
          value: optim.cotisationsVolontaires,
          colorClass: "sim-eau",
          negative: true,
          tooltip: type === 'reel'
            ? "Cotisations volontaires (PER individuel, contrat Madelin) déductibles du revenu imposable libéral."
            : "Versements PER déductibles du revenu imposable. En Micro-BNC, seul le PER est déductible (pas Madelin)."
        });
      }
      // Zone exonérée
      if (optim.exonerationZone && optim.exonerationZone > 0) {
        detailItems.push({
          icon: MapPin,
          label: `Zone exonérée (${Math.round((optim.tauxExonerationZone || 0) * 100)}%)`,
          value: optim.exonerationZone,
          colorClass: "sim-eau",
          negative: true,
          tooltip: `Exonération ZFU-TE ou ZFRR : ${Math.round((optim.tauxExonerationZone || 0) * 100)}% du bénéfice libéral est exonéré d'impôt.`
        });
      }
      // Revenus fonciers (positifs = ajoutés, négatifs = déficit)
      if (optim.revenuFoncier && optim.revenuFoncier !== 0) {
        const isDeficit = optim.revenuFoncier < 0;
        const foncierLabel = isDeficit
          ? "Déficit foncier"
          : optim.revenuFoncierType === 'micro' 
            ? "Foncier micro (abatt. 30%)" 
            : optim.revenuFoncierType === 'reel' 
              ? "Foncier régime réel" 
              : "Revenus fonciers";
        const foncierTooltip = isDeficit
          ? `Déficit foncier de ${formatMontant(Math.abs(optim.revenuFoncier))} déduit du revenu global (plafonné à −10 700 €/an).`
          : optim.revenuFoncierType === 'micro'
            ? `Revenus bruts ${formatMontant(optim.revenuFoncierBrut || 0)} − abattement 30% = ${formatMontant(optim.revenuFoncier)} imposable.`
            : optim.revenuFoncierType === 'reel'
              ? `Résultat foncier net : ${formatMontant(optim.revenuFoncier)} ajouté au revenu global.`
              : "Revenus fonciers imposables ajoutés au revenu global.";
        detailItems.push({
          icon: Home,
          label: foncierLabel,
          value: Math.abs(optim.revenuFoncier),
          colorClass: isDeficit ? "sim-eau" : "sim-marque",
          negative: isDeficit,
          tooltip: foncierTooltip
        });
      }
      // Crédits d'impôt (info line)
      const totalCredits = (optim.creditFormation || 0) + (optim.creditImpotAutre || 0);
      if (totalCredits > 0) {
        detailItems.push({
          icon: GraduationCap,
          label: "Crédits d'impôt",
          value: totalCredits,
          colorClass: "sim-eau",
          negative: true,
          tooltip: "Crédits d'impôt soustraits directement de l'impôt brut (formation dirigeant, autres). Ne réduisent pas le revenu imposable."
        });
      }
    }

    // ========================================
    // 3. REVENU IMPOSABLE (résultat après les 2 déductions)
    // ========================================
    detailItems.push({ 
      icon: Wallet, 
      label: "Revenu imposable", 
      value: result.revenuImposableTotal || result.netAvantImpot, 
      colorClass: "sim-marque",
      negative: false,
      tooltipContent: getRevenuImposableTooltipContent()
    });

    // ========================================
    // 4. PARTS FISCALES (contexte quotient familial)
    // ========================================
    detailItems.push({ 
      icon: Users, 
      label: `${result.impotDetails?.parts || 1} part${(result.impotDetails?.parts || 1) > 1 ? 's' : ''} fiscale${(result.impotDetails?.parts || 1) > 1 ? 's' : ''}`, 
      value: 0, 
      colorClass: "sim-marque",
      negative: false,
      tooltipContent: getPartsTooltipContent(),
      isInfoLine: true
    });

    // ========================================
    // 5. IMPÔT (individuel médecin si conjoint, sinon foyer)
    // ========================================
    detailItems.push({ 
      icon: Landmark, 
      label: hasRevenusConjoint ? "Mon impôt (estimé)" : "Impôt sur le revenu", 
      value: hasRevenusConjoint ? impotMedecin : result.impot, 
      colorClass: "sim-eau",
      negative: true,
      tooltipContent: hasRevenusConjoint ? getImpotMedecinTooltipContent() : getImpotTooltipContent()
    });

    const cardClassName = isRecommended
      ? "sim-fiche sim-regime recommande relative overflow-visible"
      : "sim-fiche sim-regime relative overflow-hidden";

    return (
      <div
        className="relative"
      >
        {/* Badge recommandé flottant */}
        {isRecommended && (
          <div 
            className="absolute -top-3 -right-2 z-10"
          >
            <Badge className="sim-puce encre grande">
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              Recommandé
            </Badge>
          </div>
        )}

        {/* Badge warning */}
        {showWarning && !isRecommended && (
          <div 
            className="absolute -top-3 -right-2 z-10"
          >
            <PremiumTooltip
              title="Plafond Micro-BNC"
              content={
                <p className="text-sm">
                  Vos recettes dépassent 83 600€. Vérifiez si vous avez aussi dépassé ce seuil l'année dernière.
                </p>
              }
            >
              <Badge 
                variant="outline" 
                className="sim-puce attn grande cursor-help"
              >
                ⚠️ Vérifiez
              </Badge>
            </PremiumTooltip>
          </div>
        )}

        <Card className={cardClassName}>
          <CardHeader className="sim-regime-tete">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div className={`sim-rond grand ${
                isRecommended 
                  ? 'plein' 
                  : ''
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="sim-regime-nom">{title}</CardTitle>
                  {/* Badge RSPM/PAMC - ✅ Utilise result.isRSPM (état réel) et non isRSPMUsed (intention) */}
                  {result.isRSPM !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={result.isRSPM 
                        ? "sim-puce info" 
                        : "sim-puce neutre"
                      }
                    >
                      {result.isRSPM ? '🎓 RSPM' : '🩺 PAMC'}
                    </Badge>
                  )}
                </div>
                <p className="sim-regime-desc">{description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="sim-regime-corps space-y-4">
            {/* Phase 5 Bug #17 — Avertissement marge conservatrice 20 % en Micro-BNC */}
            {type === 'micro-bnc' && !showWarning && (
              <div className="sim-note attn flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                <p className="sim-note-in">
                  <strong>Estimation optimiste.</strong> En Micro-BNC, l'abattement forfaitaire 34 % suppose
                  que tes charges réelles ne dépassent pas ce seuil. Si tu as beaucoup de frais
                  (cabinet, matériel, déplacements), prévois <strong>~20 % de marge</strong> sur ce Super-Net.
                </p>
              </div>
            )}

            {/* Le Super-Net : sur du jaune dans la fiche recommandée (le halo flou
                d'avant est retiré, il débordait de la fiche sur téléphone). */}
            <div className="relative">
              <div className={`sim-supernet relative ${
                isRecommended
                  ? 'soleil'
                  : ''
              }`}>
                <div className="flex items-center justify-between mb-2">
                <span className="sim-supernet-nom flex items-center gap-1.5">
                    {superNetLabel}
                    <PremiumTooltip
                      title="Super-Net"
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Calcul du Super-Net :</p>
                          <p className="sim-formule">
                            CA - Impôt{hasRevenusConjoint ? " (ta part)" : ""} - Cotisations - Charges
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {hasRevenusConjoint 
                              ? `L'impôt utilisé est ta part estimée (taux ~${tauxMedecin}%), basée sur le taux individualisé DGFiP (défaut depuis sept. 2025).`
                              : type === 'micro-bnc' 
                                ? "En Micro-BNC, l'abattement forfaitaire 34 % (CGI Art. 102 ter) remplace tes charges réelles : elles ne sont ni déduites du Super-Net ni affichées ici. C'est une comparaison fiscale stricte — pense à les soustraire mentalement de ton reste à vivre."
                                : "En Régime Réel, charges et cotisations sont déductibles du revenu imposable."
                            }
                          </p>
                        </div>
                      }
                    >
                      <Info className="sim-aide h-3.5 w-3.5 cursor-help" />
                    </PremiumTooltip>
                  </span>
                  {revenusTotaux > 0 && (
                    <Badge variant="secondary" className="sim-puce blanche grande">
                      {Math.round(((superNetMedecinReel || 0) / revenusTotaux) * 100)}% {hasRevenusSalaries ? 'des revenus' : 'du CA'}
                    </Badge>
                  )}
                </div>
                
                <div
                  className="flex flex-col"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="aff sim-supernet-montant">
                      <CountUp end={periode === 'mensuel' ? superNetMedecinReel / 12 : superNetMedecinReel} />
                      <span className="sim-supernet-euro">€</span>
                    </span>
                    <span className="sim-supernet-par">{periodeSuffix}</span>
                  </div>
                  <span className="sim-supernet-soit">
                    {periode === 'mensuel' 
                      ? `soit ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(superNetMedecinReel)} /an`
                      : `soit ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(superNetMedecinReel / 12))} /mois`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Mini-donut de répartition */}
            <MiniDonut
              charges={result.chargesReelles || 0}
              cotisations={result.cotisationsTotales}
              impot={hasRevenusConjoint ? impotMedecin : result.impot}
              superNet={superNetMedecinReel}
              total={revenusTotaux}
            />

            {/* Détails avec icônes et animations staggered */}
            <div className="space-y-1.5 pt-2">
              {detailItems.map((item, i) => (
                <div
                  key={item.label}
                  className="sim-ligne-detail flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.colorClass}`} />
                    <span className="sim-ligne-nom">{item.label}</span>
                    {item.badge && (
                      <Badge variant="outline" className="sim-puce ok petite">
                        {item.badge}
                      </Badge>
                    )}
                    {/* Tooltip JSX structuré (premium) */}
                    {item.tooltipContent && (
                      <PremiumTooltip
                        title={item.label}
                        content={item.tooltipContent}
                      >
                        <Info className="sim-aide h-3.5 w-3.5 cursor-help" />
                      </PremiumTooltip>
                    )}
                    {/* Tooltip texte simple (revenus salariés, conjoint, charges) */}
                    {!item.tooltipContent && item.tooltip && (
                      <PremiumTooltip
                        title={item.label}
                        content={<p className="text-sm">{item.tooltip}</p>}
                      >
                        <Info className="sim-aide h-3.5 w-3.5 cursor-help" />
                      </PremiumTooltip>
                    )}
                  </div>
                  <span className={`sim-ligne-valeur ${item.negative ? item.colorClass : ''}`}>
                    {item.isInfoLine 
                      ? '' 
                      : `${item.negative ? '-' : ''}${formatMontant(item.value)}`
                    }
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Économie */}
            {isRecommended && economie > 100 && (
                <div
                  className="sim-note ok grande"
                >
                  <div className="flex items-center gap-3">
                    <div className="sim-rond blanc flex-shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="sim-note-fort">
                        Économie de {formatMontant(economie)}{periodeSuffix}
                      </p>
                      <p className="sim-note-sous">
                        par rapport au {type === 'reel' ? 'Micro-BNC' : 'Régime Réel'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isRecommended && economie > 100 && (
                <div
                  className="sim-note neutre grande"
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-4 w-4 flex-shrink-0" />
                    <p className="sim-note-in">
                      Moins avantageux de <span className="font-semibold">{formatMontant(economie)}{periodeSuffix}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encart pédagogique DOM-TOM si applicable */}
      {domTomInfo && (
        <div
          className="sim-fiche sim-dom"
        >
          <div className="flex items-start gap-3">
            <div className="sim-rond grand flex-shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="sim-fiche-titre">
                  Avantage fiscal DOM : {domTomInfo.territoire}
                </h3>
                <Badge className="sim-puce ok">
                  🏝️ DOM-TOM
                </Badge>
              </div>
              <p className="sim-texte mb-2">
                Tu bénéficies d'une réduction d'impôt de <strong>{Math.round(domTomInfo.tauxAbattement * 100)}%</strong> (plafonnée à{' '}
                <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(domTomInfo.plafond)}</strong>) sur tes revenus.
              </p>
              {domTomInfo.abattementApplique && domTomInfo.abattementApplique > 0 && (
                <div className="sim-note ok flex items-center gap-2 mt-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="sim-note-in sim-fort">
                    Économie réalisée : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(domTomInfo.abattementApplique))}
                  </span>
                </div>
              )}
              {/* Phase 4C Bug #14 (Option A) — Disclaimer pédagogique cotisations DOM */}
              <p className="sim-petit mt-2 flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Cotisations URSSAF estimées au taux métropole. Écart réel &lt; 3 % pour les médecins PAMC en DOM.</span>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Encadré informatif si plafond dépassé - Version compacte */}
      {depassePlafond && (
        <Collapsible open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <div className="sim-plafond overflow-hidden">
            <CollapsibleTrigger className="sim-plafond-tete w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="sim-rond blanc">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <span className="sim-fort">
                  Plafond Micro-BNC dépassé
                </span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isInfoOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="sim-plafond-corps space-y-3">
                <p>
                  Le plafond Micro-BNC est de <strong>83 600 €/an</strong>. 
                  Si vous le dépassez <strong>2 années consécutives</strong>, vous passerez 
                  automatiquement en Régime Réel au <strong>1er janvier</strong> de l'année suivante.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="sim-plafond-cas">
                    <p className="sim-fort">1ère année au-dessus</p>
                    <p>Micro-BNC maintenu</p>
                  </div>
                  <div className="sim-plafond-cas">
                    <p className="sim-fort">2ème année au-dessus</p>
                    <p>Régime Réel au 1er janv.</p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Cartes de comparaison */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {microBnc ? (
          renderCard('micro-bnc', microBnc, recommande === 'micro-bnc', depassePlafond)
        ) : (
          <div
          >
            <Card className="sim-fiche sim-regime relative">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="sim-rond grand">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="sim-regime-nom">Micro-BNC</CardTitle>
                    <p className="text-sm text-muted-foreground">Erreur de calcul</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="sim-panneau">
                  <p className="text-sm text-muted-foreground">
                    Une erreur est survenue lors du calcul du régime Micro-BNC.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {renderCard('reel', reel, recommande === 'reel')}
      </div>
    </div>
  );
}
