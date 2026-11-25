import { useEffect, useState } from "react";
import { Heart, Briefcase, Landmark, Lightbulb, ExternalLink } from "lucide-react";
import { impotDuMedecin } from "@/lib/simulateur/impotMedecin";
import { calculerExempleRattrapage, RATIO_EXEMPLE_RATTRAPAGE, type ExempleRattrapage } from "@/lib/simulateur/usePublicodesSimulation";
import type { SimulationResult } from "@/lib/simulation-types";
import { formatNombre, nombreFr } from "@/lib/simulateur/nombres";
import type { SimulateurFormData } from "./simulateurSchema";

/**
 * Le pli « Quand et comment tu paies » (MIGRATION.md § 9.gn ; avant : « Comment l'impôt sera
 * prélevé », l'impôt seul). Pour l'Urssaf, la CARMF et l'impôt : quand ça part, sur quel revenu,
 * et comment ça se régularise. La surprise des jeunes remplaçants, c'est la régularisation : on
 * paie d'abord sur les revenus d'il y a deux ans.
 * § 9.go : une frise des deux années (ce qui est gagné une année finit de se payer la suivante),
 * ce qui est dû à chaque organisme pour ces revenus, et un exemple de rattrapage calculé avec les
 * chiffres du médecin (`calculerExempleRattrapage`, à l'ouverture du pli).
 * Sources (vérifiées le 15 novembre 2026) :
 * - Urssaf (PAMC) : CSS L131-6-2 (provisionnelles sur l'avant-dernière année, recalculées sur la
 *   dernière connue, régularisées sur l'année ; sur demande, sur l'assiette estimée) et R133-26
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
  /** La saisie et le régime fiscal retenu, pour l'exemple de rattrapage. */
  formData?: SimulateurFormData;
  regime?: 'reel' | 'micro-bnc';
}

/** Une case de la frise : rien, un prélèvement habituel, un prélèvement avec le rattrapage. */
type Case = 0 | 1 | 2;
const annee12 = (valeur: (mois: number) => Case): Case[] => Array.from({ length: 12 }, (_, m) => valeur(m));
const MOIS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Exemples déjà calculés, par saisie : rouvrir le pli ne rappelle pas le modèle de l'Urssaf. */
const exemplesCalcules = new Map<string, ExempleRattrapage | null>();

export function PaymentExplanation({
  annee,
  resultat,
  revenusSalariesAnnuels = 0,
  revenusConjointAnnuels = 0,
  situationFamiliale = 'celibataire',
  isRSPM = false,
  carmfDispense = false,
  debutActivite = 'non',
  formData,
  regime,
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

  // Ce qui est dû à chacun pour ces revenus : les montants du détail des régimes et de la conclusion.
  const carmfDu = avecCarmf ? Math.round(Math.max(0, resultat.cotisationsDetail?.retraite ?? 0)) : 0;
  const urssafDu = Math.round(Math.max(0, resultat.cotisationsTotales)) - carmfDu;
  const impotNul = !(impotLiberal > 0) && !(acomptesLiberaux > 0);
  const pour = (montant: number) => `${euros(montant)} pour ${a0}`;

  const principe = isRSPM
    ? `Au RSPM, tes cotisations suivent tes recettes\u00a0: rien à rattraper. Seul l'impôt se calcule d'abord sur tes revenus passés, puis se régularise.`
    : debut
      ? `Tes premières années, tu paies d'abord sur une base forfaitaire, puis tout se régularise sur tes revenus réels. Mets de côté chaque mois le montant indiqué en tête des résultats\u00a0: le rattrapage arrive ensuite.`
      : `Tu paies d'abord sur tes revenus d'il y a deux ans, puis tout se régularise. Quand tes revenus montent, le rattrapage suit\u00a0: mets de côté chaque mois le montant indiqué en tête des résultats.`;

  // Chaque ligne : qui, combien pour l'année, quand ça part, sur quel revenu, et ses 24 cases de
  // frise (l'année simulée, puis la suivante).
  const lignes: { qui: string; du: string; quand: string; calcul?: string; cases: Case[] }[] = [];
  if (isRSPM) {
    lignes.push({
      qui: 'Urssaf',
      du: pour(urssafDu),
      quand: 'Chaque mois ou chaque trimestre, quand tu déclares tes recettes\u00a0: tu paies au même rythme, sur ces recettes.',
      calcul: "Rien à régulariser. L'invalidité-décès de la CARMF s'ajoute à ta première déclaration de l'année.",
      cases: [...annee12(() => 1), ...annee12(() => 1)],
    });
  } else {
    lignes.push({
      qui: 'Urssaf',
      du: pour(urssafDu),
      quand: 'Le 5 ou le 20 de chaque mois, en douze prélèvements égaux (chaque trimestre, sur demande).',
      calcul: debut
        ? `Tes deux premières années, elles se calculent sur une base forfaitaire, puis se régularisent sur ton revenu réel une fois déclaré\u00a0: plus tu gagnes, plus le rattrapage est fort.`
        : `Elles se calculent d'abord sur ton revenu de ${a2}, puis sur celui de ${a1} dès que tu l'as déclaré, et se régularisent sur celui de ${a0} après ta déclaration de ${aSuivante}\u00a0: un complément s'étale sur les prélèvements suivants, un trop-versé vient en déduction.`,
      // Régularisation après la déclaration du printemps : de juin à décembre de l'année suivante.
      cases: [...annee12(() => 1), ...annee12((m) => (m >= 5 ? 2 : 1))],
    });
    if (avecCarmf) {
      lignes.push({
        qui: 'CARMF',
        du: pour(carmfDu),
        quand: "Un acompte appelé en janvier, à payer avant fin février, et le solde appelé en mai, juin ou juillet, après ta déclaration de revenus, à payer avant fin août. Ou douze prélèvements le 5 du mois, sur demande.",
        calcul: debut
          ? `Tes deux premières années, elles se calculent sur une base forfaitaire, sans complémentaire\u00a0; la retraite de base se régularise ensuite sur ton revenu réel.`
          : `Elles se calculent sur ton revenu de ${a2}. La retraite de base se régularise\u00a0: recalculée sur ton revenu de ${a1} au moment du solde, puis ajustée sur celui de ${a0} l'année suivante. La complémentaire et l'ASV, non.`,
        // Deux échéances : février (acompte) et août (solde) ; le solde de l'année suivante porte
        // la régularisation de la retraite de base.
        cases: [...annee12((m) => (m === 1 || m === 7 ? 1 : 0)), ...annee12((m) => (m === 7 ? 2 : m === 1 ? 1 : 0))],
      });
    }
  }
  // L'impôt : la première année, aucun acompte (sauf demande) et l'impôt de l'année arrive
  // l'année suivante avec les premiers acomptes ; la deuxième, les acomptes démarrent en septembre
  // (aucun revenu libéral deux ans plus tôt) ; ensuite, les acomptes du 15.
  if (impotNul) {
    lignes.push({ qui: 'Impôt', du: pour(0), quand: 'Aucun acompte\u00a0: à ces revenus, ton impôt estimé est nul.', cases: [...annee12(() => 0), ...annee12(() => 0)] });
  } else if (debutActivite === 'premiere') {
    lignes.push({
      qui: 'Impôt',
      du: pour(impotLiberal),
      quand: `Aucun acompte en ${a0}, sauf si tu en demandes un sur impots.gouv.fr.`,
      calcul: `L'impôt de ${a0}, environ ${euros(impotLiberal)}, est prélevé ${impotLiberal > 300 ? 'de septembre à décembre' : 'en septembre'} ${aSuivante}, en même temps que tes premiers acomptes (environ ${euros(acompteMensuel)} par mois, le 15).`,
      cases: [...annee12(() => 0), ...annee12((m) => (m >= 8 ? 2 : 0))],
    });
  } else if (debutActivite === 'deuxieme') {
    lignes.push({
      qui: 'Impôt',
      du: pour(impotLiberal),
      quand: `Aucun acompte de janvier à août ${a0}\u00a0: tu n'avais pas de revenu libéral en ${a2}. Ils démarrent en septembre, le 15 de chaque mois.`,
      calcul: `De septembre à décembre ${a0}, tes acomptes suivent ton revenu de ${a1}, et le solde de ton impôt de ${a1} est prélevé en même temps. Ton impôt de ${a0} se régularise à l'été ${aSuivante}, après ta déclaration\u00a0: un reste à payer est prélevé à partir de septembre (en quatre fois, jusqu'en décembre, au-delà de 300\u00a0€).`,
      cases: [...annee12((m) => (m >= 8 ? 1 : 0)), ...annee12((m) => (m >= 8 ? 2 : 1))],
    });
  } else {
    lignes.push({
      qui: 'Impôt',
      du: pour(impotLiberal),
      quand: `Environ ${euros(acompteMensuel)} le 15 de chaque mois (${euros(acomptesLiberaux)} par an), ou chaque trimestre sur option.`,
      calcul: `De janvier à août ${a0}, tes acomptes suivent ton revenu de ${a2}\u00a0; de septembre à décembre, celui de ${a1}. Ton impôt de ${a0} se régularise à l'été ${aSuivante}, après ta déclaration\u00a0: un trop-payé te revient fin juillet ou début août, un reste à payer est prélevé à partir de septembre (en quatre fois, jusqu'en décembre, au-delà de 300\u00a0€).`,
      cases: [...annee12(() => 1), ...annee12((m) => (m >= 8 ? 2 : 1))],
    });
  }
  const avecRattrapage = lignes.some((l) => l.cases.includes(2));

  // L'exemple de rattrapage, avec les chiffres du médecin : en PAMC, hors premières années. Calculé
  // à l'ouverture du pli (un appel au modèle de l'Urssaf) ; les lignes gardent leur place en
  // attendant (« … € ») : rien ne bouge à l'arrivée des montants.
  const exemplePossible = Boolean(formData && regime) && !isRSPM && !debut;
  const cle = exemplePossible ? JSON.stringify([formData, regime]) : '';
  const [exemple, setExemple] = useState<ExempleRattrapage | null | 'attente'>(() => (exemplePossible && exemplesCalcules.has(cle) ? exemplesCalcules.get(cle)! : 'attente'));
  useEffect(() => {
    if (!exemplePossible || !formData || !regime) return;
    if (exemplesCalcules.has(cle)) { setExemple(exemplesCalcules.get(cle)!); return; }
    let actif = true;
    setExemple('attente');
    void calculerExempleRattrapage(formData, regime, resultat).then((e) => {
      exemplesCalcules.set(cle, e);
      if (actif) setExemple(e);
    });
    return () => { actif = false; };
    // `cle` résume la saisie et le régime ; `resultat` en découle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle]);
  const enAttente = exemple === 'attente';
  // Les lignes sont connues dès l'ouverture (pas de ligne d'impôt quand il est nul : il l'est aussi
  // à des revenus plus bas) ; seuls leurs montants arrivent ensuite.
  const calcule = exemple && exemple !== 'attente' ? exemple : null;
  const partsExemple: { nom: string; montant: number | null }[] = [
    { nom: 'Urssaf', montant: calcule ? calcule.urssaf : null },
    ...(avecCarmf ? [{ nom: 'CARMF, retraite de base', montant: calcule ? calcule.carmfBase : null }] : []),
    ...(impotNul ? [] : [{ nom: 'Impôt', montant: calcule ? calcule.impot : null }]),
  ];
  const totalExemple = partsExemple.reduce((t, l) => t + (l.montant ?? 0), 0);
  // Les recettes de l'exemple, connues dès l'ouverture (même arrondi que `calculerExempleRattrapage`).
  const recettesAvant = Math.round((formData?.recettesBrutes || 0) * RATIO_EXEMPLE_RATTRAPAGE) * (formData?.periode === 'mensuel' ? 12 : 1);
  const montrerExemple = exemplePossible && (enAttente || (exemple !== null && totalExemple > 0));

  return (
    <div className="sim-paie">
      <p className="sim-paie-principe">{principe}</p>

      {/* La frise : l'année simulée et la suivante, une rangée par destinataire. Elle redit en
          image ce que disent les lignes du dessous : masquée aux lecteurs d'écran. */}
      <div className="sim-paie-frise" aria-hidden="true">
        <p className="sim-paie-frise-titre">
          {avecRattrapage ? `Ce que tu gagnes en ${a0} finit de se payer en ${aSuivante}` : `Tes paiements, de ${a0} à ${aSuivante}`}
        </p>
        <div className="sim-paie-rang sim-paie-annees">
          <span />
          {[a0, aSuivante].map((a) => (
            <div key={a}>
              <span className="sim-paie-annee">{a}</span>
              <div className="sim-paie-mois sim-paie-initiales">{MOIS.map((m, i) => <span key={i}>{m}</span>)}</div>
            </div>
          ))}
        </div>
        {lignes.map((l) => (
          <div className="sim-paie-rang" key={l.qui}>
            <span className="sim-paie-rang-nom">{l.qui}</span>
            {[0, 1].map((an) => (
              <div className="sim-paie-mois" key={an}>
                {l.cases.slice(an * 12, an * 12 + 12).map((c, i) => <i key={i} className={c === 2 ? 'f' : c === 1 ? 'c' : undefined} />)}
              </div>
            ))}
          </div>
        ))}
        <p className="sim-paie-legende">
          <span><i className="c" />Prélèvement habituel</span>
          {avecRattrapage && <span><i className="f" />Avec le rattrapage de {a0}</span>}
        </p>
      </div>

      <dl className="sim-paie-liste">
        {lignes.map((l) => (
          <div key={l.qui}>
            <dt><span>{l.qui}</span><span className="sim-paie-du">{l.du}</span></dt>
            <dd>
              <p className="sim-paie-quand">{l.quand}</p>
              {l.calcul && <p>{l.calcul}</p>}
            </dd>
          </div>
        ))}
      </dl>

      {montrerExemple && (
        <div className="sim-paie-exemple" aria-live="polite" aria-busy={enAttente}>
          <p className="sim-paie-exemple-titre">Un exemple, avec tes chiffres</p>
          <p>
            Si tu gagnais 20{'\u00a0'}% de moins en {a2} et en {a1} ({euros(recettesAvant)} de recettes), tes prélèvements de {a0} partent de ces revenus-là. En {aSuivante}, il te reste à payer la différence{'\u00a0'}:
          </p>
          <ul className="sim-paie-calcul">
            {partsExemple.map((l) => (
              <li key={l.nom}><span>{l.nom}</span><b>{l.montant === null ? '…\u00a0€' : euros(l.montant)}</b></li>
            ))}
            <li className="total"><span>Rattrapage en {aSuivante}</span><b>{enAttente ? '…\u00a0€' : euros(totalExemple)}</b></li>
          </ul>
        </div>
      )}

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
                    {typeConjoint === 'salarie' ? 'sur salaire' : typeConjoint === 'retraite' ? 'sur pension' : typeConjoint === 'autre' ? '' : 'acomptes'}
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


      {/* Revenus qui changent : cotisations provisionnelles recalculées sur une estimation, sur
          demande (CSS L131-6-2, version en vigueur : « sur la base de l'assiette de cotisations
          estimée pour l'année en cours » ; plus de majoration en cas d'estimation trop basse,
          contrairement à ce que ce pli disait en § 9.gn). Chemin du formulaire (§ 9.gv, § 9.gz) : dans
          l'espace en ligne d'un médecin, « Nouvelle demande » (pas la messagerie), objet « Gérer mon
          moyen de paiement ou les informations relatives au paiement », puis « Réévaluer vos
          cotisations » (vu dans l'espace du propriétaire le 15 novembre 2026 ; le chemin
          « Documents et démarches » des pages de l'Urssaf est celui d'autres professions). Le
          montant à saisir n'est pas donné ici : le formulaire demande des « revenus estimés »
          sans dire s'ils s'entendent avant ou après l'abattement de 26 %. */}
      <p className="sim-paie-astuce">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        <span>
          {isRSPM
            ? <>Revenus qui changent beaucoup{'\u00a0'}? Tu peux </>
            : <>Revenus qui changent beaucoup{'\u00a0'}? L'Urssaf recalcule tes cotisations de l'année sur une estimation de tes revenus, si tu le demandes dans ton espace en ligne («{'\u00a0'}Nouvelle demande{'\u00a0'}», puis «{'\u00a0'}Réévaluer vos cotisations{'\u00a0'}»){avecCarmf ? <>{'\u00a0'}; la CARMF fait de même pour ta retraite de base, sur demande</> : null}. Et tu peux </>}
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
