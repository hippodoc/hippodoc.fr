import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { ConclusionCard } from "./ConclusionCard";
import { PremiereAnneeCard } from "./PremiereAnneeCard";
import { RspmOuPamc } from "./RspmOuPamc";
import { debutActiviteDe } from "@/lib/simulateur/usePublicodesSimulation";
import { PaymentExplanation } from "./PaymentExplanation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, RotateCcw, Scale, Lightbulb, CalendarClock, Receipt, FileText, ArrowRight } from "lucide-react";
import { APP_URL } from "@/lib/site";
import { insertPublicEvent } from "@/lib/supabase-public";
import { trackEvent } from "@/lib/analytics";
import { superNetDuMedecin } from "@/lib/simulateur/impotMedecin";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";
import { formatNombre } from "@/lib/simulateur/nombres";
import type { RegimeComparisonCards } from "./RegimeComparisonCards";

/**
 * Chargement différé — `RegimeComparisonCards` n'apparaît qu'APRÈS soumission du
 * formulaire. Il portait recharts (un camembert de 100x100 px par fiche, retiré en
 * § 9.ft) : importé statiquement, il pesait sur le chunk initial de /simulateur.
 *
 * § 9.gm : le chargement part au clic sur « Simuler » (`SimulateurApp`), en même temps que le
 * calcul, et les résultats ne s'affichent qu'avec ce bloc. Chargé par `lazy` une fois les
 * résultats affichés, il arrivait après eux : sa place d'attente (220 px) devenait 650 à 820 px,
 * et tout ce qui suit (« À savoir », les plis) descendait d'autant sous les yeux.
 */
export type CartesDesRegimes = typeof RegimeComparisonCards;
let chargementDesCartes: Promise<CartesDesRegimes> | null = null;
export function chargerCartesDesRegimes(): Promise<CartesDesRegimes> {
  chargementDesCartes ??= import("./RegimeComparisonCards").then((m) => m.RegimeComparisonCards);
  return chargementDesCartes;
}


/** Ce qu'on garde d'un essai pour le comparer au suivant (§ 9.gg). */
export interface Essai {
  /** Super-Net du médecin dans le régime recommandé : celui de sa fiche. */
  superNet: number;
  recommande: 'micro-bnc' | 'reel';
  /** Recettes et charges annuelles saisies. */
  recettes: number;
  charges: number;
  /** Toute la saisie : deux essais identiques ne se comparent pas. */
  signature: string;
}

export function essaiDe(comparison: RegimeComparison, formData: SimulateurFormData): Essai | null {
  const retenu = comparison.recommande === 'micro-bnc' ? comparison.microBnc : comparison.reel;
  if (!retenu || !comparison.recommande) return null;
  const annuel = (v: number | undefined) => (formData.periode === 'mensuel' ? (v || 0) * 12 : (v || 0));
  return {
    superNet: superNetDuMedecin(retenu, {
      revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? 0,
      revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? 0,
      situationFamiliale: formData.situationFamiliale,
    }),
    recommande: comparison.recommande,
    recettes: annuel(formData.recettesBrutes),
    charges: annuel(formData.chargesHorsCotisations),
    signature: JSON.stringify(formData),
  };
}

const eurosEntiers = (v: number) =>
  formatNombre('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v));
const nomRegime = (r: 'micro-bnc' | 'reel') => (r === 'micro-bnc' ? 'Micro-BNC' : 'régime réel');

/** Phrase de l'écart avec l'essai précédent, ou null (pas d'essai précédent, ou le même). */
function phraseEcart(avant: Essai | null | undefined, apres: Essai | null): string | null {
  if (!avant || !apres || avant.signature === apres.signature) return null;
  const changements: string[] = [];
  if (Math.round(avant.recettes) !== Math.round(apres.recettes)) changements.push(`recettes de ${eurosEntiers(avant.recettes)} à ${eurosEntiers(apres.recettes)}`);
  if (Math.round(avant.charges) !== Math.round(apres.charges)) changements.push(`charges de ${eurosEntiers(avant.charges)} à ${eurosEntiers(apres.charges)}`);
  const quoi = changements.length > 0 ? changements.join(', ') : 'autre situation';
  const delta = Math.round(apres.superNet - avant.superNet);
  const montant = delta === 0 ? 'même Super-Net' : `${delta > 0 ? '+' : '−'}${eurosEntiers(Math.abs(delta))} par an de Super-Net`;
  const regime = avant.recommande !== apres.recommande
    ? `, et le régime recommandé passe du ${nomRegime(avant.recommande)} au ${nomRegime(apres.recommande)}`
    : '';
  return `Par rapport à ton essai précédent (${quoi})\u00a0: ${montant}${regime}.`;
}

export interface SimulateurResultsProps {
  comparison: RegimeComparison;
  /** Point de bascule des charges (`calculerPointDeBascule`) : en attente tant qu'il vaut `undefined`. */
  bascule?: number | null | 'attente';
  /** Ce qui resterait de 1 000 € de recettes en plus (`calculerMarge`) : en attente tant qu'il vaut `'attente'`. */
  marge?: number | 'attente';
  formData: SimulateurFormData;
  periode: 'annuel' | 'mensuel';
  onNewSimulation?: () => void;
  /**
   * Toujours `true` sur le site public — le variant "connecté"
   * (ConseilsPersonnalises, app authentifiée) n'est pas porté ici.
   */
  isPublic?: boolean;
  /** L'essai d'avant, pour en dire l'écart (§ 9.gg). */
  essaiPrecedent?: Essai | null;
  /** Au RSPM, le meilleur Super-Net en PAMC (§ 9.gh) : en attente tant qu'il vaut `'attente'`. */
  alternativePamc?: { superNet: number; recommande: 'micro-bnc' | 'reel' } | null | 'attente';
  /** Le bloc des deux régimes, déjà chargé (`chargerCartesDesRegimes`) ; `null` si son fichier n'a
   *  pas pu être chargé : le reste du résultat s'affiche sans lui. */
  Cartes: CartesDesRegimes | null;
}

export function SimulateurResults({ comparison, bascule, marge, formData, periode, onNewSimulation, essaiPrecedent, alternativePamc, Cartes }: SimulateurResultsProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) {
    return null;
  }
  const essai = essaiDe(comparison, formData);
  const ecart = phraseEcart(essaiPrecedent, essai);

  return (
    <div
      className="sim-resultats space-y-6 md:space-y-8"
    >
      {/* Titre de la section (§ 9.gg) : le rappel de la saisie, utile quand on enchaîne les
          essais (3,8 calculs par visiteur), et l'écart avec l'essai d'avant. Remplace « Analyse
          détaillée pour t'aider à choisir le meilleur régime. » */}
      <div className="sim-resultats-tete">
        <h2 className="sim-titre">Ton résultat</h2>
        <p className="sim-rappel">
          Pour {eurosEntiers(essai?.recettes ?? 0)} de recettes et{' '}
          {(essai?.charges ?? 0) > 0 ? `${eurosEntiers(essai?.charges ?? 0)} de charges` : 'aucune charge'}
          {' · '}{formData.typeExercice === 'installe' ? 'installé' : 'remplaçant'}, secteur{'\u00a0'}{formData.secteurConventionnel === 'secteur_2' ? '2' : '1'}
        </p>
        {ecart && <p className="sim-ecart">{ecart}</p>}
        <p className="sim-chapo">
          {comparison.isRSPMUsed
            ? "Cotisations au RSPM, l'offre simplifiée des remplaçants."
            : (formData.annee || 2026) >= 2025
              ? "Cotisations PAMC, par le modèle de l'Urssaf, sur la nouvelle assiette sociale des revenus 2025 et suivants."
              : "Cotisations au régime des praticiens conventionnés (PAMC), selon le modèle de l'Urssaf."}
        </p>
      </div>

      {/* Le verdict d'abord (MIGRATION.md § 9.ft) : le régime qui l'emporte et de combien, ce qui
          est à prévoir chaque mois, puis le détail des deux régimes. Il était sous les fiches. */}
      <ConclusionCard comparison={comparison} formData={formData} bascule={bascule} marge={marge} />

      {/* RSPM ou PAMC ? (§ 9.gh) : au RSPM, la même saisie en PAMC */}
      <RspmOuPamc comparison={comparison} formData={formData} alternativePamc={alternativePamc} />

      {/* Première année d'activité (§ 9.fx) : ce qui part cette année, et ce qui viendra ensuite */}
      {debutActiviteDe(formData) === 'premiere' && <PremiereAnneeCard comparison={comparison} formData={formData} />}

      {/* Cartes de comparaison (chargées avant l'affichage des résultats, § 9.gm) */}
      {Cartes && (
      <Cartes
        reel={reel}
        microBnc={microBnc}
        recommande={recommande}
        economie={economie}
        periode={periode}
        recettesAnnuelles={comparison.recettesAnnuelles}
        revenusSalariesAnnuels={comparison.revenusSalariesAnnuels}
        revenusConjointAnnuels={comparison.revenusConjointAnnuels}
        liberalExonereAnnuel={comparison.liberalExonereAnnuel}
        domTomInfo={comparison.domTomInfo}
        lieuExercice={comparison.lieuExercice}
        isRSPMUsed={comparison.isRSPMUsed}
        situationFamiliale={formData.situationFamiliale}
        annee={formData.annee}
        plafondMicro={comparison.plafondMicro}
      />
      )}

      {/* À savoir pour ta situation (§ 9.gh) : la phrase des 1 000 € et les pistes (charges
          faibles, réductions de la CARMF, complémentaire de la 3e année), sorties de la conclusion */}
      <ConclusionCard comparison={comparison} formData={formData} bascule={bascule} marge={marge} partie="a-savoir" />


      {/* Approfondir : deux plis (le premier n'a de sens que si le Micro-BNC a été calculé) */}
      <Accordion type="single" collapsible className="space-y-0">
        <div className="sim-fiche sim-fiche-plis">
          {microBnc && (
          <AccordionItem value="comprendre" className="sim-pli-ligne">
            <AccordionTrigger className="sim-pli-titre hover:no-underline">
              <span className="flex items-center gap-3">
                <div className="sim-rond">
                  <Scale className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="sim-pli-nom">Comprendre la différence</span>
                  <p className="sim-pli-sous">Quel régime te fait déduire le plus ?</p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="sim-pli-corps">
              <BreakEvenAnalysis
                formData={formData}
                reelResult={reel}
                microBncResult={microBnc}
                recettesImposables={Math.max(0, (comparison.recettesAnnuelles ?? 0) - (comparison.liberalExonereAnnuel ?? 0))}
                isRSPM={comparison.isRSPMUsed}
              />
            </AccordionContent>
          </AccordionItem>
          )}

          <AccordionItem value="prelevement" className="sim-pli-ligne border-0">
            <AccordionTrigger className="sim-pli-titre hover:no-underline">
              <span className="flex items-center gap-3">
                <div className="sim-rond">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <span className="sim-pli-nom">Quand et comment tu paies</span>
                  <p className="sim-pli-sous">
                    {comparison.isRSPMUsed || formData.situationCarmf === 'dispense' ? 'Urssaf et impôt' : 'Urssaf, CARMF et impôt'}{'\u00a0'}: calendrier et régularisation
                  </p>
                </div>
              </span>
            </AccordionTrigger>
            <AccordionContent className="sim-pli-corps">
              <PaymentExplanation
                annee={formData.annee}
                resultat={recommande === 'micro-bnc' && microBnc ? microBnc : reel}
                revenusSalariesAnnuels={comparison.revenusSalariesAnnuels ?? 0}
                revenusConjointAnnuels={comparison.revenusConjointAnnuels ?? 0}
                situationFamiliale={formData.situationFamiliale}
                isRSPM={comparison.isRSPMUsed}
                carmfDispense={formData.situationCarmf === 'dispense'}
                debutActivite={debutActiviteDe(formData) ?? 'non'}
              />
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>

      {/* La suite du résultat (MIGRATION.md § 9.fs) : un seul appel, lié à ce que le médecin
          vient de voir (cotisations à prévoir, charges, régime), avec trois promesses reprises
          mot pour mot des étapes du remplaçant de l'accueil (src/data/etapesRemplacant.ts).
          Remplace « Et maintenant ? » (deux boutons : l'un descendait juste en dessous, l'autre
          envoyait vers une page de l'app réservée aux comptes) et l'aperçu flouté du guide
          patrimonial. L'événement anonyme garde son nom, `cta_patrimonial_guide`, pour la
          continuité de la table `simulateur_public_events`. */}
      <section className="sim-fiche sim-suite" aria-labelledby="sim-suite-titre">
        {/* § 9.gh : en bande. Le lien d'essai est aussi dans la conclusion ; les phrases des trois
            promesses (archivées au § 9.gh) sont retirées, leurs titres restent mot pour mot. */}
        <h3 id="sim-suite-titre" className="sim-fiche-titre">
          Ce calcul, Hippodoc le tient à jour après chaque journée de remplacement
        </h3>
        <ul className="sim-suite-liste">
          <li>
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
            <span><strong>URSSAF et CARMF anticipées.</strong></span>
          </li>
          <li>
            <Receipt className="h-5 w-5" aria-hidden="true" />
            <span><strong>Tes charges déductibles ne se perdent plus.</strong></span>
          </li>
          <li>
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span><strong>Ta déclaration, case par case.</strong></span>
          </li>
        </ul>
        <a
          href={`${APP_URL}/auth?tab=signup`}
          data-track="cta_signup_simulateur_resultat"
          className="sim-btn sim-btn-soleil sim-suite-btn"
          onClick={() => {
            trackEvent('public_simulator_cta_clicked', { cta_type: 'signup', emplacement: 'resultat' });
            insertPublicEvent('simulateur_public_events', {
              event_type: 'cta_patrimonial_guide',
              session_id: (typeof window !== 'undefined' && window.localStorage.getItem('hippodoc-anon-session-id')) || 'unknown',
            });
          }}
        >
          Essai gratuit 30 jours
          <ArrowRight aria-hidden="true" />
        </a>
      </section>

      {/* Limites (§ 9.gh) : une phrase au lieu d'une fiche de 411 px au téléphone. */}
      <p className="sim-limites-ligne">
        <Info className="h-4 w-4" aria-hidden="true" />
        <span>
          Simulation indicative{'\u00a0'}: elle ne remplace pas l'avis d'un expert-comptable ou de ton AGA. À comparer avec le{' '}
          <a href="https://mon-entreprise.urssaf.fr" target="_blank" rel="noopener noreferrer">simulateur de l'Urssaf</a>.
        </span>
      </p>

      {/* Action principale */}
      {onNewSimulation && (
        <div className="flex justify-center pt-6">
          <Button 
            variant="outline" 
            size="lg"
            className="sim-btn sim-btn-ligne"
            onClick={onNewSimulation}
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Nouvelle simulation
          </Button>
        </div>
      )}
    </div>
  );
}
