import { Scale } from "lucide-react";
import { SEUIL_EQUIVALENCE_ANNUEL, type RegimeComparison } from "@/lib/simulateur/usePublicodesSimulation";
import { superNetDuMedecin } from "@/lib/simulateur/impotMedecin";
import type { SimulateurFormData } from "./simulateurSchema";

/**
 * « RSPM ou PAMC ? » (MIGRATION.md § 9.gh) : sous la conclusion d'une simulation au RSPM, le
 * meilleur Super-Net de la même saisie en PAMC, calculé après l'affichage
 * (`calculerAlternativePamc`). La question des remplaçants sous 19 000 € de recettes, que le
 * simulateur tranchait seul (mode Auto) sans la montrer. Les montants comparés sont ceux des
 * fiches (`superNetDuMedecin`) ; « se valent » sous `SEUIL_EQUIVALENCE_ANNUEL`, comme la conclusion.
 * Taux du RSPM : CSS D642-4-2 et D642-4-3 (§ 9.fw).
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
  if (!comparison.isRSPMUsed || !retenu || alternativePamc === undefined) return null;
  const euros = (v: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v));
  const rspm = superNetDuMedecin(retenu, {
    revenusSalariesAnnuels: comparison.revenusSalariesAnnuels ?? 0,
    revenusConjointAnnuels: comparison.revenusConjointAnnuels ?? 0,
    situationFamiliale: formData.situationFamiliale,
  });
  const enAttente = alternativePamc === 'attente';

  let comparaison: JSX.Element;
  if (alternativePamc === null) {
    comparaison = <p>La comparaison avec le PAMC n'a pas pu être calculée{' '}: relance la simulation dans un instant.</p>;
  } else {
    const pamc = enAttente ? null : alternativePamc.superNet;
    // Écart entre les deux montants affichés, arrondis à l'euro : la phrase se vérifie de tête.
    const ecart = pamc === null ? 0 : Math.round(pamc) - Math.round(rspm);
    const verdict = pamc === null ? null
      : Math.abs(ecart) < SEUIL_EQUIVALENCE_ANNUEL ? <>Les deux se valent, à {euros(Math.abs(ecart))} près.</>
      : ecart < 0 ? <>Le RSPM te laisse {euros(-ecart)} de plus par an.</>
      : <>Le PAMC te laisserait {euros(ecart)} de plus par an.</>;
    comparaison = (
      <p>
        En PAMC, avec des cotisations Urssaf et CARMF calculées sur ton bénéfice, tu garderais{' '}
        <strong>{pamc === null ? '… €' : euros(pamc)}</strong> par an, contre {euros(rspm)} au RSPM.
        {verdict && <> <strong>{verdict}</strong></>}
      </p>
    );
  }

  return (
    <section className="sim-fiche sim-rspm" aria-labelledby="sim-rspm-titre">
      <p className="sim-surtitre"><Scale className="h-4 w-4" aria-hidden="true" /> Ton régime social</p>
      <h3 id="sim-rspm-titre" className="sim-fiche-titre">RSPM ou PAMC{' '}?</h3>
      <div className="sim-rspm-texte" aria-live="polite" aria-busy={enAttente}>
        <p>
          Tu es au RSPM, l'offre simplifiée des remplaçants{' '}: un taux global sur tes recettes (13,5{' '}% jusqu'à 19{' '}000{' '}€, 21,2{' '}% au-delà), et tout se déclare et se paie à l'Urssaf.
        </p>
        {comparaison}
      </div>
    </section>
  );
}
