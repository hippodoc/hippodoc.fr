import { Scale } from "lucide-react";
import { SEUIL_EQUIVALENCE_ANNUEL, type RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import { superNetDuMedecin } from "@/lib/simulateur/impotMedecin";
import type { SimulateurFormData } from "./simulateurSchema";
import { formatNombre } from "@/lib/simulateur/nombres";
import { PlaceGardee, montantLePlusLarge } from "./PlaceGardee";

/**
 * « RSPM ou PAMC ? » (MIGRATION.md § 9.gh) : sous la conclusion d'une simulation au RSPM, le
 * meilleur Super-Net de la même saisie en PAMC, calculé après l'affichage
 * (`calculerAlternativePamc`). La question des remplaçants sous 19 000 € de recettes, que le
 * simulateur tranchait seul (mode Auto) sans la montrer. Les montants comparés sont ceux des
 * fiches (`superNetDuMedecin`) ; « se valent » sous `SEUIL_EQUIVALENCE_ANNUEL`, comme la conclusion.
 * Taux du RSPM : CSS D642-4-2 et D642-4-3 (§ 9.fw). Le RSPM est une option (CSS L642-4-2 et
 * D642-4-1, « peuvent opter ») : sans elle, un remplaçant est en PAMC. La fiche le dit (§ 9.gi) ;
 * en mode Auto, c'est le simulateur qui le retient, pas forcément le médecin.
 *
 * § 9.go, la règle entière. On entre au RSPM jusqu'à 19 000 € de rétrocessions par an (CSS
 * D642-4-1) ; on en sort l'année qui suit un dépassement de 38 000 €, ou de 19 000 € une seconde
 * année de suite, et l'on y reste jusqu'au 31 décembre de l'année du dépassement (urssaf.fr, « Le
 * service simplifié pour les médecins »). D'où la fiche miroir, « PAMC ou RSPM ? » : un remplaçant
 * en mode Auto au-dessus de 19 000 € voit ce que la même saisie lui laisserait au RSPM, s'il y est
 * déjà (`comparison.alternativeRspm`, calculé avec le résultat : rien n'arrive après coup).
 */
export function RspmOuPamc({
  comparison,
  formData,
  alternativePamc,
}: {
  comparison: RegimeComparison;
  formData: SimulateurFormData;
  alternativePamc?: { superNet: number; recommande: 'micro-bnc' | 'reel' } | null | 'attente';
}) {
  const retenu = comparison.recommande === 'micro-bnc' ? comparison.microBnc : comparison.reel;
  const euros = (v: number) =>
    formatNombre('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v));
  const sortie = <>On en sort au 1er{'\u00a0'}janvier qui suit une année au-dessus de 38{'\u00a0'}000{'\u00a0'}€, ou la deuxième de suite au-dessus de 19{'\u00a0'}000{'\u00a0'}€.</>;

  // La fiche miroir : PAMC retenu, RSPM encore possible pour celui qui y est déjà.
  if (!comparison.isRSPMUsed && retenu && comparison.alternativeRspm) {
    const pamc = superNetDuMedecin(retenu, {
      revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? 0,
      revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? 0,
      situationFamiliale: formData.situationFamiliale,
    });
    const rspm = comparison.alternativeRspm.superNet;
    const ecart = Math.round(rspm) - Math.round(pamc);
    const verdict = Math.abs(ecart) < SEUIL_EQUIVALENCE_ANNUEL ? <>Les deux se valent, à {euros(Math.abs(ecart))} près.</>
      : ecart > 0 ? <>Le RSPM te laisserait {euros(ecart)} de plus par an.</>
      : <>Le PAMC te laisse {euros(-ecart)} de plus par an.</>;
    return (
      <section className="sim-fiche sim-rspm" aria-labelledby="sim-rspm-titre">
        <p className="sim-surtitre"><Scale className="h-4 w-4" aria-hidden="true" /> Ton régime social</p>
        <h3 id="sim-rspm-titre" className="sim-fiche-titre">PAMC ou RSPM{'\u00a0'}?</h3>
        <div className="sim-rspm-texte">
          <p>
            Au-dessus de 19{'\u00a0'}000{'\u00a0'}€ de recettes, le simulateur retient le PAMC. Si tu es déjà au RSPM, tu y restes pourtant cette année, jusqu'au 31{'\u00a0'}décembre. {sortie}
          </p>
          <p>
            Au RSPM (13,5{'\u00a0'}% jusqu'à 19{'\u00a0'}000{'\u00a0'}€, 21,2{'\u00a0'}% au-delà), tu garderais{' '}
            <strong>{euros(rspm)}</strong> par an, contre {euros(pamc)} en PAMC. <strong>{verdict}</strong>{' '}
            Pour voir ce calcul en détail, choisis RSPM avec «{'\u00a0'}Modifier{'\u00a0'}».
          </p>
        </div>
      </section>
    );
  }

  if (!comparison.isRSPMUsed || !retenu || alternativePamc === undefined) return null;
  const rspm = superNetDuMedecin(retenu, {
    revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? 0,
    revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? 0,
    situationFamiliale: formData.situationFamiliale,
  });
  const enAttente = alternativePamc === 'attente';

  // § 9.gm : la phrase arrive en deux temps (« … € » pendant le calcul, puis le montant et le
  // verdict, qui ajoutait une ligne et poussait de 22 px tout ce qui suit, le bloc des deux régimes
  // compris). Elle garde la place de sa forme la plus longue : le verdict du PAMC, avec le montant le
  // plus large possible (un Super-Net ne dépasse pas les recettes et les salaires).
  const plusLarge = euros(montantLePlusLarge(Math.max(rspm, (comparison.recettesAnnuelles ?? 0) + (comparison.revenusSalariesAnnuels ?? 0))));
  const gabarit = (
    <>
      En PAMC, avec des cotisations Urssaf et CARMF calculées sur ton bénéfice, tu garderais{' '}
      <strong>{plusLarge}</strong> par an, contre {euros(rspm)} au RSPM.
      {' '}<strong>Le PAMC te laisserait {plusLarge} de plus par an.</strong>
    </>
  );
  let texte: JSX.Element;
  if (alternativePamc === null) {
    texte = <>La comparaison avec le PAMC n'a pas pu être calculée{' '}: relance la simulation dans un instant.</>;
  } else {
    const pamc = enAttente ? null : alternativePamc.superNet;
    // Écart entre les deux montants affichés, arrondis à l'euro : la phrase se vérifie de tête.
    const ecart = pamc === null ? 0 : Math.round(pamc) - Math.round(rspm);
    const verdict = pamc === null ? null
      : Math.abs(ecart) < SEUIL_EQUIVALENCE_ANNUEL ? <>Les deux se valent, à {euros(Math.abs(ecart))} près.</>
      : ecart < 0 ? <>Le RSPM te laisse {euros(-ecart)} de plus par an.</>
      : <>Le PAMC te laisserait {euros(ecart)} de plus par an.</>;
    texte = (
      <>
        En PAMC, avec des cotisations Urssaf et CARMF calculées sur ton bénéfice, tu garderais{' '}
        <strong>{pamc === null ? '… €' : euros(pamc)}</strong> par an, contre {euros(rspm)} au RSPM.
        {verdict && <> <strong>{verdict}</strong></>}
      </>
    );
  }
  const comparaison = <p><PlaceGardee gabarit={gabarit}>{texte}</PlaceGardee></p>;

  return (
    <section className="sim-fiche sim-rspm" aria-labelledby="sim-rspm-titre">
      <p className="sim-surtitre"><Scale className="h-4 w-4" aria-hidden="true" /> Ton régime social</p>
      <h3 id="sim-rspm-titre" className="sim-fiche-titre">RSPM ou PAMC{' '}?</h3>
      <div className="sim-rspm-texte" aria-live="polite" aria-busy={enAttente}>
        <p>
          {formData.regimeSocial === 'rspm' ? 'Tu as choisi le RSPM' : 'Le simulateur retient le RSPM'}, l'offre simplifiée des remplaçants{' '}: un taux global sur tes recettes (13,5{' '}% jusqu'à 19{' '}000{' '}€, 21,2{' '}% au-delà), et tout se déclare et se paie à l'Urssaf. C'est une option à demander à l'Urssaf{' '}: sans elle, tu es en PAMC. {sortie}
        </p>
        {comparaison}
      </div>
    </section>
  );
}
