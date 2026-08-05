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

// Palette harmonisée avec les charts
const HIPPO_COLORS = {
  charges: 'hsl(35, 95%, 50%)',
  cotisations: 'hsl(10, 85%, 55%)',
  impots: 'hsl(250, 60%, 55%)',
  superNet: 'hsl(150, 75%, 45%)',
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
  const depassePlafond = recettesAnnuelles && recettesAnnuelles > PLAFOND_MICRO_BNC;
  
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
      colorClass: "text-hippo-500",
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
        colorClass: "text-sky-500",
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
        colorClass: "text-pink-500",
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
        colorClass: "text-emerald-500",
        negative: false,
        badge: "Exonéré IR",
        tooltip: "Inclus dans tes honoraires. Exonéré d'IR (Art. 151 ter CGI) mais soumis aux cotisations sociales."
      });
    }

    // ✅ Helper TMI badge coloré
    const getTMIBadgeClass = (tmi: number): string => {
      if (tmi <= 0) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
      if (tmi <= 11) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      if (tmi <= 30) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      if (tmi <= 41) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
      return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
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
            <Wallet className="h-4 w-4 text-blue-400" />
            <span className="font-semibold text-sm">Composition du revenu imposable</span>
          </div>
          
          {/* Breakdown par source */}
          <div className="space-y-1.5 text-xs">
            {/* Libéral */}
            <div className="flex justify-between gap-4 items-start">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
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
              <div className="space-y-1 pl-3 border-l-2 border-emerald-200 dark:border-emerald-800 ml-1">
                {optim.forfait2pct && optim.forfait2pct > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Forfait 2% :</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{formatMontant(optim.forfait2pct)}</span>
                  </div>
                )}
                {optim.deductionsS1 && optim.deductionsS1 > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Déductions S1 :</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{formatMontant(optim.deductionsS1)}</span>
                  </div>
                )}
                {optim.cotisationsVolontaires && optim.cotisationsVolontaires > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− PER/Madelin :</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{formatMontant(optim.cotisationsVolontaires)}</span>
                  </div>
                )}
                {optim.chequesVacances && optim.chequesVacances > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Chèques-vacances :</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{formatMontant(optim.chequesVacances)}</span>
                  </div>
                )}
                {optim.exonerationZone && optim.exonerationZone > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground text-[10px]">− Zone exonérée ({Math.round((optim.tauxExonerationZone || 0) * 100)}%) :</span>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">−{formatMontant(optim.exonerationZone)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Salarié */}
            {hasRevenusSalaries && (
              <div className="flex justify-between gap-4 items-start">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
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
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
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
                  <div className={`w-2 h-2 rounded-full ${optim.revenuFoncier < 0 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-muted-foreground">
                    {optim.revenuFoncier < 0 
                      ? 'Déficit foncier :' 
                      : optim.revenuFoncierType === 'micro' ? 'Foncier micro (abatt. 30%) :' : optim.revenuFoncierType === 'reel' ? 'Foncier réel :' : 'Foncier :'}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${optim.revenuFoncier < 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                    {optim.revenuFoncier > 0 ? '+' : ''}{formatMontant(optim.revenuFoncier)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Total */}
          <div className="flex justify-between gap-4 pt-1.5 border-t border-border/40">
            <span className="text-xs font-medium">Total imposable :</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {formatMontant(result.revenuImposableTotal || (liberal + salarie + conjoint))}
            </span>
          </div>

          {/* Crédits d'impôt (post-impôt) */}
          {optim && ((optim.creditFormation && optim.creditFormation > 0) || (optim.creditImpotAutre && optim.creditImpotAutre > 0) || (optim.creditEmploiDomicile && optim.creditEmploiDomicile > 0) || (optim.creditGardeEnfants && optim.creditGardeEnfants > 0)) && (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
              <strong className="text-emerald-800 dark:text-emerald-200">💡 Crédits d'impôt appliqués</strong>
              <p className="text-emerald-700 dark:text-emerald-300 mt-1">
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
            <Landmark className="h-4 w-4 text-indigo-400" />
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
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${getTMIBadgeClass(tmi)}`}>
                TMI {tmi}%
              </div>
              <span className="text-[10px] text-muted-foreground">
                Taux effectif : {tauxEffectif ?? (revenuTotal > 0 ? Math.round((result.impot / revenuTotal) * 100) : 0)}%
              </span>
            </div>
          )}
          
          {/* ✅ Encart plafonnement QF si appliqué */}
          {plafonnementApplique && (
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-200">⚠️ Plafonnement appliqué</strong>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                L'avantage fiscal lié à tes enfants est limité à {formatMontant(plafondUtilise || 0)}.
                <br />
                Sans ce plafond, tu aurais économisé {formatMontant(avantageEnfantsInitial || 0)}.
              </p>
            </div>
          )}
          
          {/* Encart pédagogique */}
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-2 text-[10px] text-muted-foreground leading-relaxed">
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
            <Landmark className="h-4 w-4 text-indigo-400" />
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
                <div className="w-2 h-2 rounded-full bg-hippo-500" />
                <span className="text-muted-foreground">
                  Toi (~{tauxMedecin}%) :
                </span>
              </div>
              <span className="font-medium text-hippo-600 dark:text-hippo-400">{formatMontant(impotMedecin)}</span>
            </div>
            <div className="flex justify-between gap-4 items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-pink-500" />
                <span className="text-muted-foreground">
                  Conjoint (~{tauxConjoint}%) :
                </span>
              </div>
              <span className="font-medium text-pink-600 dark:text-pink-400">{formatMontant(impotConjoint)}</span>
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
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
            <strong className="text-amber-800 dark:text-amber-200">⚠️ Estimation indicative</strong>
            <p className="text-amber-700 dark:text-amber-300 mt-1">
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
            <Users className="h-4 w-4 text-violet-400" />
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
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700 text-[10px]">
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
            <Shield className="h-4 w-4 text-orange-400" />
            <span className="font-semibold text-sm">Cotisations sociales</span>
            <Badge variant="outline" className={cn(
              "text-[9px]",
              isRSPM 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700" 
                : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-600"
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
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {formatMontant(result.cotisationsTotales)}
            </span>
          </div>
          
          {/* ✅ Encart pédagogique sur la déductibilité du CA libéral */}
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
            <strong className="text-blue-800 dark:text-blue-200">💡 Déductibles du CA libéral</strong>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
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
            <Briefcase className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-sm">Charges professionnelles</span>
          </div>
          
          {/* Montant */}
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-muted-foreground">Montant déclaré :</span>
            <span className="font-medium">{formatMontant(chargesAmount)}</span>
          </div>
          
          {/* Explication contextuelle selon régime */}
          {type === 'micro-bnc' ? (
            <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-200">⚠️ Non déductibles en Micro-BNC</strong>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                L'abattement forfaitaire de 34 % (CGI Art. 102 ter) remplace tes charges réelles.
                Elles sont saisies à titre d'information mais n'impactent ni l'impôt ni le Super-Net.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2 text-[10px] leading-relaxed">
              <strong className="text-emerald-800 dark:text-emerald-200">✅ Déductibles en Régime Réel</strong>
              <p className="text-emerald-700 dark:text-emerald-300 mt-1">
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
        colorClass: "text-amber-500",
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
      colorClass: "text-orange-500",
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
          colorClass: "text-teal-500",
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
          colorClass: "text-teal-500",
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
          colorClass: "text-teal-500",
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
          colorClass: "text-teal-500",
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
          colorClass: "text-teal-500",
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
          colorClass: isDeficit ? "text-emerald-600" : "text-amber-600",
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
          colorClass: "text-emerald-600",
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
      colorClass: "text-blue-500",
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
      colorClass: "text-violet-500",
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
      colorClass: "text-indigo-500",
      negative: true,
      tooltipContent: hasRevenusConjoint ? getImpotMedecinTooltipContent() : getImpotTooltipContent()
    });

    const cardClassName = isRecommended
      ? "relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border-2 border-emerald-200/50 dark:border-emerald-500/30 shadow-xl shadow-emerald-500/10 rounded-2xl overflow-visible"
      : "relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden";

    return (
      <div
        className="relative"
      >
        {/* Badge recommandé flottant */}
        {isRecommended && (
          <div 
            className="absolute -top-3 -right-2 z-10"
          >
            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 px-3 py-1.5 text-xs font-semibold">
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
                className="border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 cursor-help text-xs"
              >
                ⚠️ Vérifiez
              </Badge>
            </PremiumTooltip>
          </div>
        )}

        <Card className={cardClassName}>
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center gap-3">
              {/* Icon badge */}
              <div className={`p-2.5 rounded-xl ${
                isRecommended 
                  ? 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50' 
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isRecommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
                  {/* Badge RSPM/PAMC - ✅ Utilise result.isRSPM (état réel) et non isRSPMUsed (intention) */}
                  {result.isRSPM !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={result.isRSPM 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px]" 
                        : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 text-[10px]"
                      }
                    >
                      {result.isRSPM ? '🎓 RSPM' : '🩺 PAMC'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Phase 5 Bug #17 — Avertissement marge conservatrice 20 % en Micro-BNC */}
            {type === 'micro-bnc' && !showWarning && (
              <div className="rounded-lg border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/70 dark:bg-amber-950/20 px-3 py-2 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-snug text-amber-800 dark:text-amber-200">
                  <strong>Estimation optimiste.</strong> En Micro-BNC, l'abattement forfaitaire 34 % suppose
                  que tes charges réelles ne dépassent pas ce seuil. Si tu as beaucoup de frais
                  (cabinet, matériel, déplacements), prévois <strong>~20 % de marge</strong> sur ce Super-Net.
                </p>
              </div>
            )}

            {/* Hero Section - Super-Net avec glow */}
            <div className="relative">
              {/* Glow effect */}
              {isRecommended && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-2xl rounded-full scale-150 -z-10" />
              )}
              
              <div className={`relative rounded-xl p-4 sm:p-5 ${
                isRecommended
                  ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-700/30'
                  : 'bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    {superNetLabel}
                    <PremiumTooltip
                      title="Super-Net"
                      content={
                        <div className="space-y-2">
                          <p className="font-medium">Calcul du Super-Net :</p>
                          <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
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
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </PremiumTooltip>
                  </span>
                  {revenusTotaux > 0 && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs bg-white/60 dark:bg-slate-800/60">
                      {Math.round(((superNetMedecinReel || 0) / revenusTotaux) * 100)}% {hasRevenusSalaries ? 'des revenus' : 'du CA'}
                    </Badge>
                  )}
                </div>
                
                <div
                  className="flex flex-col"
                >
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl sm:text-4xl font-bold ${
                      isRecommended 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' 
                        : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      <CountUp end={periode === 'mensuel' ? superNetMedecinReel / 12 : superNetMedecinReel} />
                      <span className="text-lg sm:text-xl ml-1">€</span>
                    </span>
                    <span className="text-sm text-muted-foreground">{periodeSuffix}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
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
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 ${item.colorClass}`} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    {item.badge && (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                        {item.badge}
                      </Badge>
                    )}
                    {/* Tooltip JSX structuré (premium) */}
                    {item.tooltipContent && (
                      <PremiumTooltip
                        title={item.label}
                        content={item.tooltipContent}
                      >
                        <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" />
                      </PremiumTooltip>
                    )}
                    {/* Tooltip texte simple (revenus salariés, conjoint, charges) */}
                    {!item.tooltipContent && item.tooltip && (
                      <PremiumTooltip
                        title={item.label}
                        content={<p className="text-sm">{item.tooltip}</p>}
                      >
                        <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-help" />
                      </PremiumTooltip>
                    )}
                  </div>
                  <span className={`font-semibold text-sm ${item.negative ? item.colorClass : ''}`}>
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
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-100">
                        Économie de {formatMontant(economie)}{periodeSuffix}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        par rapport au {type === 'reel' ? 'Micro-BNC' : 'Régime Réel'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isRecommended && economie > 100 && (
                <div
                  className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/30 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
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
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200/50 dark:border-emerald-700/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex-shrink-0">
              <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                  Avantage fiscal DOM : {domTomInfo.territoire}
                </h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px]">
                  🏝️ DOM-TOM
                </Badge>
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
                Tu bénéficies d'une réduction d'impôt de <strong>{Math.round(domTomInfo.tauxAbattement * 100)}%</strong> (plafonnée à{' '}
                <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(domTomInfo.plafond)}</strong>) sur tes revenus.
              </p>
              {domTomInfo.abattementApplique && domTomInfo.abattementApplique > 0 && (
                <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/40 rounded-lg px-3 py-2 mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                    Économie réalisée : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(domTomInfo.abattementApplique))}
                  </span>
                </div>
              )}
              {/* Phase 4C Bug #14 (Option A) — Disclaimer pédagogique cotisations DOM */}
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/70 mt-2 italic flex items-start gap-1">
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
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/40 rounded-xl overflow-hidden">
            <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-100/40 dark:hover:bg-amber-900/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-medium text-sm text-amber-900 dark:text-amber-100">
                  Plafond Micro-BNC dépassé
                </span>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-amber-500 transition-transform duration-200",
                isInfoOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-4 pb-3 pt-1 text-sm space-y-3">
                <p className="text-slate-700 dark:text-slate-300">
                  Le plafond Micro-BNC est de <strong>83 600 €/an</strong>. 
                  Si vous le dépassez <strong>2 années consécutives</strong>, vous passerez 
                  automatiquement en Régime Réel au <strong>1er janvier</strong> de l'année suivante.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 rounded-lg px-3 py-2">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">1ère année au-dessus</p>
                    <p className="text-emerald-700 dark:text-emerald-300">Micro-BNC maintenu</p>
                  </div>
                  <div className="bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/40 rounded-lg px-3 py-2">
                    <p className="font-semibold text-orange-800 dark:text-orange-200">2ème année au-dessus</p>
                    <p className="text-orange-700 dark:text-orange-300">Régime Réel au 1er janv.</p>
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
            <Card className="relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-lg border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <Calculator className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Micro-BNC</CardTitle>
                    <p className="text-sm text-muted-foreground">Erreur de calcul</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-4">
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
