import { lazy, Suspense } from "react";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { ConclusionCard } from "./ConclusionCard";
import { PaymentExplanation } from "./PaymentExplanation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Info, RotateCcw, Scale, Lightbulb, CalendarClock, Receipt, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_URL } from "@/lib/site";
import { insertPublicEvent } from "@/lib/supabase-public";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulateurFormData } from "./simulateurSchema";

/**
 * Chargement différé — `RegimeComparisonCards` n'apparaît qu'APRÈS soumission du
 * formulaire. Il portait recharts (un camembert de 100x100 px par fiche, retiré en
 * § 9.ft) : importé statiquement, il pesait sur le chunk initial de /simulateur.
 *
 * Sans risque au rendu serveur : à ce moment `results.recommande` est faux, donc
 * SimulateurResults n'est pas rendu et le `lazy` n'est jamais évalué.
 */
const RegimeComparisonCards = lazy(() =>
  import("./RegimeComparisonCards").then((m) => ({ default: m.RegimeComparisonCards }))
);


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
}

export function SimulateurResults({ comparison, bascule, marge, formData, periode, onNewSimulation }: SimulateurResultsProps) {
  const { reel, microBnc, recommande, economie } = comparison;

  if (!reel || !recommande) {
    return null;
  }

  return (
    <div
      className="sim-resultats space-y-6 md:space-y-8"
    >
      {/* Titre de la section */}
      <div className="sim-resultats-tete">
        <h2 className="sim-titre">Comparaison des régimes fiscaux</h2>
        <p className="sim-chapo">
          Analyse détaillée pour t'aider à choisir le meilleur régime.{' '}
          {comparison.isRSPMUsed
            ? "Cotisations au RSPM, l'offre simplifiée des remplaçants."
            : "Cotisations au régime des praticiens conventionnés (PAMC), selon le modèle de l'Urssaf."}
        </p>
      </div>

      {/* Le verdict d'abord (MIGRATION.md § 9.ft) : le régime qui l'emporte et de combien, ce qui
          est à prévoir chaque mois, puis le détail des deux régimes. Il était sous les fiches. */}
      <ConclusionCard comparison={comparison} formData={formData} bascule={bascule} marge={marge} />

      {/* Cartes de comparaison */}
      <Suspense fallback={<div className="min-h-[220px]" aria-hidden="true" />}>
      <RegimeComparisonCards
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
      </Suspense>


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
                  <span className="sim-pli-nom">Comment l'impôt sera prélevé</span>
                  <p className="sim-pli-sous">Prélèvement à la source et régularisation</p>
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
        <p className="sim-surtitre">Et toute l'année ?</p>
        <h3 id="sim-suite-titre" className="sim-fiche-titre grand">
          Ce calcul, Hippodoc le tient à jour après chaque journée de remplacement
        </h3>
        <ul className="sim-suite-liste">
          <li>
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
            <span><strong>URSSAF et CARMF anticipées.</strong> Cotisations calculées via le serveur officiel URSSAF, échéancier à jour après chaque journée.</span>
          </li>
          <li>
            <Receipt className="h-5 w-5" aria-hidden="true" />
            <span><strong>Tes charges déductibles ne se perdent plus.</strong> Kilomètres, matériel, formation, RCP : catégorisés et prêts pour la déclaration.</span>
          </li>
          <li>
            <FileText className="h-5 w-5" aria-hidden="true" />
            <span><strong>Ta déclaration, case par case.</strong> 2035 ou 2042-C PRO pré-remplies avec tes chiffres, aide DSFU URSSAF incluse.</span>
          </li>
        </ul>
        <a
          href={`${APP_URL}/auth?tab=signup`}
          data-track="cta_signup_simulateur_resultat"
          className="sim-btn sim-btn-soleil sim-suite-btn"
          onClick={() => {
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

      {/* Disclaimer global unifié */}
      <div className={cn('sim-fiche sim-limites')}>
        <div className="sim-limites-filet" />
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Info className="sim-marque h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h4 className="sim-limites-titre">
                Limites de cette simulation
              </h4>
              <p className="sim-texte">
                Cette simulation est fournie à titre indicatif. Elle ne prend pas en compte 
                tes spécificités fiscales individuelles, les évolutions réglementaires, 
                ou les optimisations spécifiques à ta situation.
              </p>
              <p className="sim-texte sim-fort">
                Pour une analyse personnalisée, consulte :
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="sim-puce neutre grande">
                  Expert-comptable
                </span>
                <span className="sim-puce neutre grande">
                  Avocat fiscaliste
                </span>
                <span className="sim-puce neutre grande">
                  CGP indépendant
                </span>
                <a 
                  href="https://mon-entreprise.urssaf.fr" 
                  target="_blank" rel="noopener noreferrer" 
                  className="sim-puce info grande lien"
                >
                  Simulateur URSSAF ↗
                </a>
              </div>
              <p className="sim-petit pt-1">
                Hippodoc t'aide à y voir plus clair, mais seul un professionnel 
                pourra te conseiller de manière définitive.
              </p>
            </div>
          </div>
        </div>
      </div>

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
