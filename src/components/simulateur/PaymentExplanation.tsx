import {
  Landmark,
  Briefcase,
  Heart,
  Calendar,
  Clock,
  Lightbulb,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { impotDuMedecin } from "@/lib/simulateur/impotMedecin";
import type { SimulationResult } from "@/lib/simulation-types";

/**
 * Le pli « Comment l'impôt sera prélevé » (rendu seul dans un pli de SimulateurResults ; la
 * variante en carte repliable, inemployée, est retirée en § 9.ft). Les acomptes viennent de
 * `impotDuMedecin`, le calcul de la conclusion et des fiches : avant novembre 2026, ce pli
 * prenait l'impôt du foyer entier (salaires compris) et disait qu'une première année n'a
 * aucune cotisation à payer, ce qui est faux (MIGRATION.md § 9.ft).
 */
interface PaymentExplanationProps {
  annee: number;
  /** Résultat du régime retenu par la conclusion. */
  resultat: SimulationResult;
  revenusSalariesAnnuels?: number;
  revenusConjointAnnuels?: number;
  situationFamiliale?: string;
  /** Cotisations au RSPM (déclarées et payées chaque mois ou trimestre). */
  isRSPM?: boolean;
}

export function PaymentExplanation({
  annee,
  resultat,
  revenusSalariesAnnuels = 0,
  revenusConjointAnnuels = 0,
  situationFamiliale = 'celibataire',
  isRSPM = false,
}: PaymentExplanationProps) {
  const hasRevenusSalaries = revenusSalariesAnnuels > 0;
  const hasRevenusConjoint = revenusConjointAnnuels > 0;
  const impot = impotDuMedecin(resultat, { revenusSalariesAnnuels, revenusConjointAnnuels, situationFamiliale });
  const { tauxMedecin, tauxConjoint, tauxFoyer, acomptesLiberaux, creditsImpot } = impot;
  const typeConjoint = resultat.impotDetails?.typeRevenuConjoint ?? 'salarie';

  const impotEstimeMedecin = impot.impotMedecin;
  const impotEstimeConjoint = impot.impotConjoint;
  const safeImpotEstime = resultat.impot ?? 0;
  const mensuelMedecin = Math.round(impotEstimeMedecin / 12);
  const mensuelConjoint = Math.round(impotEstimeConjoint / 12);
  const mensuelTotal = Math.round(safeImpotEstime / 12);
  const acompteMensuel = Math.round(acomptesLiberaux / 12);
  const pourcent = (t: number) => `${t.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}\u00a0%`;

  return (
    <div className="space-y-5">
      {/* Section 1: Tes acomptes libéraux */}
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Tes acomptes libéraux
          </span>
        </div>
        <div className="sim-texte space-y-2">
          <div className="flex items-center gap-2">
            <span className="sim-encre3">→</span>
            <span>Prélevés le <strong className="sim-encre">15 de chaque mois</strong> sur ton compte bancaire</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="sim-encre3">→</span>
            {acomptesLiberaux > 0 ? (
              <span>
                Pour ces revenus : <strong className="sim-encre">~{acompteMensuel.toLocaleString('fr-FR')} €/mois</strong>
                <span className="sim-encre3 ml-1">({acomptesLiberaux.toLocaleString('fr-FR')} €/an)</span>
              </span>
            ) : (
              <span>Pour ces revenus : aucun acompte, ton impôt estimé est nul.</span>
            )}
          </div>
          {hasRevenusSalaries && (
            <div className="flex items-center gap-2">
              <span className="sim-encre3">→</span>
              <span>L'impôt de tes salaires est retenu par ton employeur, à part.</span>
            </div>
          )}
          {creditsImpot > 0 && (
            <div className="flex items-center gap-2">
              <span className="sim-encre3">→</span>
              <span>
                Tes crédits d'impôt ({creditsImpot.toLocaleString('fr-FR')} €) ne baissent pas tes acomptes : ils te sont
                remboursés après ta déclaration, avec une avance en début d'année si tu en avais déjà déclaré l'année précédente.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Répartition couple (conditionnel) */}
      {hasRevenusConjoint && (
        <div className="sim-panneau space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="sim-marque h-4 w-4" />
            <span className="sim-panneau-titre">
              Répartition au sein du couple
            </span>
          </div>
          
          <div className="sim-tableau">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Qui</th>
                  <th className="text-right">Taux</th>
                  <th className="text-right hidden sm:table-cell">Annuel</th>
                  <th className="text-right">Mensuel</th>
                  <th className="text-right hidden sm:table-cell">Mode</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <Landmark className="sim-marque h-3.5 w-3.5" />
                      <span className="sim-fort">Toi</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span>~{pourcent(tauxMedecin)}</span>
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    ~{impotEstimeMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{mensuelMedecin.toLocaleString('fr-FR')} €
                  </td>
                  <td className="mode text-right hidden sm:table-cell">
                    {hasRevenusSalaries ? 'acomptes et salaire' : 'acomptes'}
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <Briefcase className="sim-marque h-3.5 w-3.5" />
                      <span className="sim-fort">Conjoint</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <span>~{pourcent(tauxConjoint)}</span>
                  </td>
                  <td className="text-right hidden sm:table-cell">
                    ~{impotEstimeConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{mensuelConjoint.toLocaleString('fr-FR')} €
                  </td>
                  <td className="mode text-right hidden sm:table-cell">
                    {typeConjoint === 'salarie' ? 'sur salaire' : typeConjoint === 'autre' ? '' : 'acomptes'}
                  </td>
                </tr>
                <tr className="total">
                  <td>
                    <span className="sim-fort">Total foyer</span>
                  </td>
                  <td className="text-right">
                    <span>~{pourcent(tauxFoyer)}</span>
                  </td>
                  <td className="sim-fort text-right hidden sm:table-cell">
                    {safeImpotEstime.toLocaleString('fr-FR')} €
                  </td>
                  <td className="sim-fort text-right">
                    {mensuelTotal.toLocaleString('fr-FR')} €
                  </td>
                  <td className="hidden sm:table-cell"></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="sim-note info flex items-start gap-2.5">
            <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="sim-note-in">
              <strong>Pourquoi deux taux différents ?</strong>
              <p className="mt-1">
                Depuis septembre 2025, la DGFiP applique automatiquement un taux individualisé pour chaque conjoint. 
                L'impôt total du foyer reste identique, seule la répartition change.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Régularisation annuelle */}
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Régularisation annuelle
          </span>
        </div>
        
        <p className="sim-texte mb-3">
          L'impôt ci-dessus est une <strong>estimation</strong>. Après ta déclaration, la DGFiP régularise :
        </p>
        
        <div className="grid gap-2">
          <div className="sim-note ok flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span className="sim-note-in">
              <strong>Trop payé</strong> → Remboursement en juillet/août
            </span>
          </div>
          <div className="sim-note attn flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="sim-note-in">
              <strong>Pas assez</strong> → Solde en 4 fois (sept → déc) si &gt; 300€
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Décalage des acomptes */}
      <div className="sim-panneau">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="sim-marque h-4 w-4" />
          <span className="sim-panneau-titre">
            Mise à jour de tes acomptes
          </span>
        </div>
        
        <div className="sim-texte space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="sim-encre3">•</span>
            <span><strong>Janv → Août {annee}</strong> : basés sur tes revenus {annee - 2}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="sim-encre3">•</span>
            <span><strong>Sept → Déc {annee}</strong> : mis à jour avec {annee - 1}</span>
          </div>
          <p>Tes revenus {annee} ne changent tes acomptes qu'à partir de septembre {annee + 1}, après ta déclaration.</p>
        </div>

        <div className="sim-note attn flex items-start gap-2 mb-2">
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="sim-note-in">
            <strong>Première année d'activité ?</strong>{' '}
            {isRSPM
              ? "Au RSPM, tes cotisations suivent tes recettes, déclarées chaque mois ou chaque trimestre : pas de rattrapage. "
              : "Pendant tes deux premières années, l'Urssaf et la CARMF appellent des cotisations provisionnelles sur une base forfaitaire, puis les régularisent quand ton revenu réel est connu : plus tu gagnes, plus le rattrapage est fort. Une estimation de ton revenu, déclarée à l'Urssaf, le réduit. "}
            Côté impôt, aucun acompte tant que tu n'as pas déclaré de revenu libéral, sauf si tu en demandes un dans ton espace
            impots.gouv.fr. Sinon, de septembre à décembre de l'année suivante, tu paies le solde de cette première année et
            tes premiers acomptes en même temps. Mets de côté chaque mois le montant indiqué en tête des résultats.
          </p>
        </div>
        
        <div className="sim-note info flex items-start gap-2">
          <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="sim-note-in">
            Revenus très différents ? Tu peux demander une{' '}
            <a 
              href="https://www.impots.gouv.fr/particulier/le-prelevement-la-source" 
              target="_blank" rel="noopener noreferrer" 
              className="sim-lien inline-flex items-center gap-1"
            >
              modulation
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
