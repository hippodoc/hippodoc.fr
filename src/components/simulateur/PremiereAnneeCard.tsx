import { CalendarClock } from "lucide-react";
import type { RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import { impotDuMedecin } from "@/lib/simulateur/impotMedecin";
import { baseForfaitaireDebut } from "@/lib/simulateur/urssaf";
import type { SimulateurFormData } from "./simulateurSchema";
import { formatNombre } from "@/lib/simulateur/nombres";

/**
 * Première année d'activité (MIGRATION.md § 9.fx) : ce qui part cette année, ce qui est dû pour
 * l'année, et ce qui reste à payer l'année suivante.
 * - Urssaf et CARMF (PAMC) appellent des cotisations provisionnelles sur une base forfaitaire
 *   (19 % du PASS), puis régularisent sur le revenu réel l'année suivante, après la déclaration
 *   (CARMF, « Vos cotisations en début d'activité » ; service-public.fr, F39739). Au RSPM, les
 *   cotisations suivent les recettes déclarées chaque mois ou trimestre : rien à rattraper.
 * - Impôt : pas d'acompte la première année (sauf demande) ; l'impôt de l'année est prélevé
 *   l'année suivante, de septembre à décembre, avec les premiers acomptes.
 * Les montants « dus » sont ceux de la conclusion (même calcul) : `impotDuMedecin`, et la CARMF
 * = la retraite du détail des cotisations en PAMC.
 */
export function PremiereAnneeCard({ comparison, formData }: { comparison: RegimeComparison; formData: SimulateurFormData }) {
  const { reel, microBnc, recommande } = comparison;
  if (!reel || !recommande) return null;
  const retenu = recommande === 'micro-bnc' && microBnc ? microBnc : reel;
  const rspm = Boolean(comparison.isRSPMUsed);
  const euros = (v: number) =>
    formatNombre('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v));

  const carmfDu = rspm ? 0 : Math.max(0, retenu.cotisationsDetail?.retraite ?? 0);
  const urssafDu = Math.max(0, retenu.cotisationsTotales) - carmfDu;
  const { impotLiberal } = impotDuMedecin(retenu, {
    revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? 0,
    revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? 0,
    situationFamiliale: formData.situationFamiliale,
  });

  // Cette année : au RSPM, les cotisations telles quelles ; en PAMC, les provisionnelles (la
  // CARMF à 0 si elle est dispensée, comme le dû).
  const prov = comparison.provisionnelPremiereAnnee;
  const provisionnelConnu = rspm || Boolean(prov);
  const urssafAn = rspm ? urssafDu : (prov?.urssaf ?? 0);
  const carmfAn = rspm || carmfDu === 0 ? 0 : (prov?.carmf ?? 0);
  const lignes = [
    { nom: 'Urssaf', an: urssafAn, du: urssafDu },
    ...(rspm ? [] : [{ nom: 'CARMF', an: carmfAn, du: carmfDu }]),
    { nom: 'Impôt', an: 0, du: impotLiberal },
  ].map((l) => ({ ...l, plusTard: l.du - l.an }));
  const total = lignes.reduce((t, l) => ({ an: t.an + l.an, du: t.du + l.du, plusTard: t.plusTard + l.plusTard }), { an: 0, du: 0, plusTard: 0 });
  const signe = (v: number) => (v < 0 ? `−${euros(-v)}` : euros(v));
  const regularisation = lignes.filter((l) => l.nom !== 'Impôt').reduce((t, l) => t + l.plusTard, 0);
  const annee = formData.annee || 2026;

  return (
    <section className="sim-fiche sim-premiere" aria-labelledby="sim-premiere-titre">
      <p className="sim-surtitre"><CalendarClock className="h-4 w-4" aria-hidden="true" /> Première année d'activité</p>
      <h3 id="sim-premiere-titre" className="sim-fiche-titre">Ce qui part cette année, et ce qui viendra ensuite</h3>

      {provisionnelConnu ? (
        <div className="sim-tableau sim-premiere-tableau">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left"><span className="sr-only">Destinataire</span></th>
                <th className="text-right">Prélevé en {annee}</th>
                <th className="text-right">Dû pour {annee}</th>
                <th className="text-right">À payer en {annee + 1}</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <tr key={l.nom}>
                  <td>{l.nom}</td>
                  <td className="text-right">{euros(l.an)}</td>
                  <td className="text-right">{euros(l.du)}</td>
                  <td className="text-right">{signe(l.plusTard)}</td>
                </tr>
              ))}
              <tr className="total">
                <td className="sim-fort">Total</td>
                <td className="text-right sim-fort">{euros(total.an)}</td>
                <td className="text-right sim-fort">{euros(total.du)}</td>
                <td className="text-right sim-fort">{signe(total.plusTard)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="sim-texte">Les cotisations provisionnelles n'ont pas pu être calculées{'\u00a0'}: relance la simulation dans un instant.</p>
      )}

      <div className="sim-premiere-texte">
        {rspm ? (
          <p>Au RSPM, tes cotisations suivent tes recettes, déclarées chaque mois ou chaque trimestre{'\u00a0'}: rien à rattraper.</p>
        ) : provisionnelConnu && (
          <p>
            {carmfDu > 0 ? "L'Urssaf et la CARMF appellent" : "L'Urssaf appelle"} d'abord des cotisations sur une base forfaitaire de {euros(baseForfaitaireDebut(annee))} (19{' '}% du plafond de la Sécurité sociale), puis {carmfDu > 0 ? 'les régularisent' : 'les régularise'} sur ton revenu réel l'année suivante, après ta déclaration de revenus{regularisation >= 0
              ? <>{'\u00a0'}: {euros(regularisation)} à payer à ce moment-là.</>
              : <>{'\u00a0'}: {euros(-regularisation)} te seront remboursés.</>} Une estimation de ton revenu, déclarée à l'Urssaf, réduit cet écart.
          </p>
        )}
        {impotLiberal > 0 ? (
          <p>
            Aucun acompte d'impôt cette année, sauf si tu en demandes un sur impots.gouv.fr{'\u00a0'}: l'impôt de {annee} ({euros(impotLiberal)}) sera prélevé l'an prochain, de septembre à décembre, en plus de tes premiers acomptes.
          </p>
        ) : (
          <p>À ces revenus, ton impôt de {annee} est nul{'\u00a0'}: rien à prévoir de ce côté l'an prochain.</p>
        )}
        {provisionnelConnu && total.plusTard > 0 && (
          <p className="sim-fort">Garde {euros(total.plusTard / 12)} de côté chaque mois sur un compte à part{'\u00a0'}: c'est ce qui sera appelé en {annee + 1}.</p>
        )}
      </div>
    </section>
  );
}
