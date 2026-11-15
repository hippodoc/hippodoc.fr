import { Heart, Briefcase, Landmark, Lightbulb, ExternalLink } from "lucide-react";
import { impotDuMedecin } from "@/lib/simulateur/impotMedecin";
import type { SimulationResult } from "@/lib/simulation-types";
import { formatNombre, nombreFr } from "@/lib/simulateur/nombres";

/**
 * Le pli « Quand et comment tu paies » (MIGRATION.md § 9.gn ; avant : « Comment l'impôt sera
 * prélevé », l'impôt seul). Pour l'Urssaf, la CARMF et l'impôt : quand ça part, sur quel revenu,
 * et comment ça se régularise. La surprise des jeunes remplaçants, c'est la régularisation : on
 * paie d'abord sur les revenus d'il y a deux ans.
 * Sources (vérifiées le 15 novembre 2026) :
 * - Urssaf (PAMC) : CSS L131-6-2 (provisionnelles sur l'avant-dernière année, recalculées sur la
 *   dernière connue, régularisées sur l'année ; sur demande, sur le revenu estimé) et R133-26
 *   (douze versements égaux, le 5 ou le 20) ; trimestre sur demande (5 février, mai, août,
 *   novembre) ; complément étalé sur les échéances suivantes (urssaf.fr).
 * - RSPM : déclaration et paiement chaque mois ou trimestre sur les recettes (CSS L642-4-2) ;
 *   invalidité-décès ajoutée à la première déclaration de l'année (urssaf.fr, offre simplifiée).
 * - CARMF : acompte appelé en janvier (avant fin février), solde en mai, juin ou juillet après la
 *   déclaration (avant fin août), ou prélèvement le 5 du mois sur douze mois ; base sur l'avant-
 *   dernière année, recalculée sur la dernière au solde et régularisée ; complémentaire et ASV
 *   sans régularisation (carmf.fr, « Cotisations 2026 », « Aide à la lecture de l'appel 2026 »).
 * - Impôt : acomptes le 15 du mois (ou du trimestre) ; janvier à août sur l'avant-dernière année,
 *   septembre à décembre sur la dernière ; solde de septembre à décembre au-delà de 300 €,
 *   remboursement l'été (impots.gouv.fr).
 * Les acomptes viennent de `impotDuMedecin`, le calcul de la conclusion et des fiches.
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
  /** Dispensé de la CARMF : pas de ligne CARMF. */
  carmfDispense?: boolean;
  /** 1re ou 2e année d'activité : cotisations sur base forfaitaire, puis régularisées. */
  debutActivite?: 'non' | 'premiere' | 'deuxieme';
}

export function PaymentExplanation({
  annee,
  resultat,
  revenusSalariesAnnuels = 0,
  revenusConjointAnnuels = 0,
  situationFamiliale = 'celibataire',
  isRSPM = false,
  carmfDispense = false,
  debutActivite = 'non',
}: PaymentExplanationProps) {
  const hasRevenusSalaries = revenusSalariesAnnuels > 0;
  const hasRevenusConjoint = revenusConjointAnnuels > 0;
  const impot = impotDuMedecin(resultat, { revenusSalariesAnnuels, revenusConjointAnnuels, situationFamiliale });
  const { tauxMedecin, tauxConjoint, tauxFoyer, acomptesLiberaux, creditsImpot, impotLiberal } = impot;
  const typeConjoint = resultat.impotDetails?.typeRevenuConjoint ?? 'salarie';

  const impotEstimeMedecin = impot.impotMedecin;
  const impotEstimeConjoint = impot.impotConjoint;
  const safeImpotEstime = resultat.impot ?? 0;
  const mensuelMedecin = Math.round(impotEstimeMedecin / 12);
  const mensuelConjoint = Math.round(impotEstimeConjoint / 12);
  const mensuelTotal = Math.round(safeImpotEstime / 12);
  const acompteMensuel = Math.round(acomptesLiberaux / 12);
  const pourcent = (t: number) => `${nombreFr(t, { maximumFractionDigits: 1 })}\u00a0%`;
  const euros = (v: number) => formatNombre('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v));

  const debut = debutActivite !== 'non';
  const avecCarmf = !isRSPM && !carmfDispense;
  const [a2, a1, a0, aSuivante] = [annee - 2, annee - 1, annee, annee + 1];

  const principe = isRSPM
    ? `Au RSPM, tes cotisations suivent tes recettes\u00a0: rien à rattraper. Seul l'impôt se calcule d'abord sur tes revenus passés, puis se régularise.`
    : debut
      ? `Tes premières années, tu paies d'abord sur une base forfaitaire, puis tout se régularise sur tes revenus réels. Mets de côté chaque mois le montant indiqué en tête des résultats\u00a0: le rattrapage arrive ensuite.`
      : `Tu paies d'abord sur tes revenus d'il y a deux ans, puis tout se régularise. Quand tes revenus montent, le rattrapage suit\u00a0: mets de côté chaque mois le montant indiqué en tête des résultats.`;

  const lignes: { qui: string; quand: string; calcul?: string }[] = [];
  if (isRSPM) {
    lignes.push({
      qui: 'Urssaf',
      quand: 'Chaque mois ou chaque trimestre, quand tu déclares tes recettes\u00a0: tu paies au même rythme, sur ces recettes.',
      calcul: "Rien à régulariser. L'invalidité-décès de la CARMF s'ajoute à ta première déclaration de l'année.",
    });
  } else {
    lignes.push({
      qui: 'Urssaf',
      quand: 'Le 5 ou le 20 de chaque mois, en douze prélèvements égaux (chaque trimestre, sur demande).',
      calcul: debut
        ? `Tes deux premières années, elles se calculent sur une base forfaitaire, puis se régularisent sur ton revenu réel une fois déclaré\u00a0: plus tu gagnes, plus le rattrapage est fort.`
        : `Elles se calculent d'abord sur ton revenu de ${a2}, puis sur celui de ${a1} dès que tu l'as déclaré, et se régularisent sur celui de ${a0} après ta déclaration de ${aSuivante}\u00a0: un complément s'étale sur les prélèvements suivants, un trop-versé vient en déduction.`,
    });
    if (avecCarmf) {
      lignes.push({
        qui: 'CARMF',
        quand: "Un acompte appelé en janvier, à payer avant fin février, et le solde appelé en mai, juin ou juillet, après ta déclaration de revenus, à payer avant fin août. Ou douze prélèvements le 5 du mois, sur demande.",
        calcul: debut
          ? `Tes deux premières années, elles se calculent sur une base forfaitaire, sans complémentaire\u00a0; la retraite de base se régularise ensuite sur ton revenu réel.`
          : `Elles se calculent sur ton revenu de ${a2}. La retraite de base se régularise\u00a0: recalculée sur ton revenu de ${a1} au moment du solde, puis ajustée sur celui de ${a0} l'année suivante. La complémentaire et l'ASV, non.`,
      });
    }
  }
  // L'impôt : la première année, aucun acompte (sauf demande) et l'impôt de l'année arrive
  // l'année suivante avec les premiers acomptes ; ensuite, les acomptes du 15.
  if (debutActivite === 'premiere') {
    lignes.push({
      qui: 'Impôt',
      quand: `Aucun acompte en ${a0}, sauf si tu en demandes un sur impots.gouv.fr.`,
      calcul: impotLiberal > 0
        ? `L'impôt de ${a0}, environ ${euros(impotLiberal)}, est prélevé ${impotLiberal > 300 ? 'de septembre à décembre' : 'en septembre'} ${aSuivante}, en même temps que tes premiers acomptes (environ ${euros(acompteMensuel)} par mois, le 15).`
        : `À ces revenus, ton impôt de ${a0} est nul.`,
    });
  } else if (acomptesLiberaux > 0) {
    lignes.push({
      qui: 'Impôt',
      quand: `Environ ${euros(acompteMensuel)} le 15 de chaque mois (${euros(acomptesLiberaux)} par an), ou chaque trimestre sur option.`,
      calcul: `De janvier à août ${a0}, tes acomptes suivent ton revenu de ${a2}\u00a0; de septembre à décembre, celui de ${a1}. Ton impôt de ${a0} se régularise à l'été ${aSuivante}, après ta déclaration\u00a0: un trop-payé te revient fin juillet ou début août, un reste à payer est prélevé à partir de septembre (en quatre fois, jusqu'en décembre, au-delà de 300\u00a0€).`,
    });
  } else {
    lignes.push({ qui: 'Impôt', quand: 'Aucun acompte\u00a0: à ces revenus, ton impôt estimé est nul.' });
  }

  return (
    <div className="sim-paie">
      <p className="sim-paie-principe">{principe}</p>

      <dl className="sim-paie-liste">
        {lignes.map((l) => (
          <div key={l.qui}>
            <dt>{l.qui}</dt>
            <dd>
              <p className="sim-paie-quand">{l.quand}</p>
              {l.calcul && <p>{l.calcul}</p>}
            </dd>
          </div>
        ))}
      </dl>

      {(hasRevenusSalaries || creditsImpot > 0) && (
        <ul className="sim-paie-notes">
          {hasRevenusSalaries && <li>L'impôt de tes salaires est retenu par ton employeur, à part de ces acomptes.</li>}
          {creditsImpot > 0 && (
            <li>
              Tes crédits d'impôt ({euros(creditsImpot)}) ne baissent pas tes acomptes{'\u00a0'}: ils te sont remboursés après ta
              déclaration, avec une avance en début d'année si tu en avais déjà déclaré l'année précédente.
            </li>
          )}
        </ul>
      )}

      {/* Impôt du couple : la part de chacun, au taux individualisé (conditionnel) */}
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
                    ~{nombreFr(impotEstimeMedecin)} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{nombreFr(mensuelMedecin)} €
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
                    ~{nombreFr(impotEstimeConjoint)} €
                  </td>
                  <td className="sim-fort text-right">
                    ~{nombreFr(mensuelConjoint)} €
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
                    {nombreFr(safeImpotEstime)} €
                  </td>
                  <td className="sim-fort text-right">
                    {nombreFr(mensuelTotal)} €
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


      {/* Revenus qui changent : provisionnelles sur le revenu estimé (CSS L131-6-2 ; CARMF, retraite
          de base), modulation des acomptes d'impôt. */}
      <p className="sim-paie-astuce">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        <span>
          {isRSPM
            ? <>Revenus qui changent beaucoup{'\u00a0'}? Tu peux </>
            : <>Revenus qui changent beaucoup{'\u00a0'}? L'Urssaf {avecCarmf ? 'et la CARMF (retraite de base) calculent' : 'calcule'} tes cotisations sur ton revenu estimé de l'année, si tu le demandes (une estimation trop basse peut être majorée), et tu peux </>}
          <a
            href="https://www.impots.gouv.fr/particulier/le-prelevement-la-source"
            target="_blank" rel="noopener noreferrer"
            className="sim-lien inline-flex items-center gap-1"
          >
            moduler tes acomptes d'impôt
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          .
        </span>
      </p>
    </div>
  );
}
