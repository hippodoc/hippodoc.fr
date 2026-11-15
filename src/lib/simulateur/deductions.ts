/**
 * Ce que chaque régime fiscal retire des recettes avant l'impôt, tiré des résultats du
 * moteur (pas recalculé à côté) : la phrase « pourquoi » de la conclusion et le pli
 * « Comprendre la différence » disent donc les mêmes montants que les fiches (§ 9.ft).
 *
 * Déductions d'un régime = recettes imposables (PDSA exonérée retirée) − bénéfice imposable,
 * en remettant ce qui joue dans les DEUX régimes et ne départage donc pas : le PER (revenu
 * global, CGI art. 163 quatervicies) et l'exonération de zone, quand elle s'applique aussi au
 * Micro-BNC. Restent : en micro, l'abattement de 34 % (305 € au moins) ; au réel, charges,
 * cotisations déductibles, forfaits du secteur 1, Madelin (CGI art. 154 bis, réel seulement)
 * et chèques-vacances.
 */
import type { SimulationResult } from '@/lib/simulation-types';

export interface DeductionsComparees {
  /** Recettes imposables (PDSA exonérée retirée). */
  recettesImposables: number;
  micro: number;
  reel: number;
  /** Abattement minimal de 305 € appliqué (recettes sous 897 €). */
  microMinimum: boolean;
  /** Exonération de zone qui ne joue qu'au réel (France ruralités revitalisation « socle »). */
  zoneReelSeul: number;
  /** PER déduit ensuite, dans les deux régimes. */
  perEnsuite: boolean;
  /** Exonération de zone appliquée ensuite, dans les deux régimes. */
  zoneEnsuite: boolean;
}

function deduit(r: SimulationResult, recettesImposables: number, perCommun: boolean, zoneCommune: boolean): number {
  const o = r.optimisationsAppliquees;
  const per = perCommun ? (o?.cotisationsVolontaires ?? 0) : 0;
  const zone = zoneCommune ? (o?.exonerationZone ?? 0) : 0;
  const benefice = (r.impotDetails?.revenuImposableLiberal ?? 0) + per + zone;
  return Math.max(0, recettesImposables - benefice);
}

export function deductionsComparees(
  reel: SimulationResult,
  micro: SimulationResult,
  recettesImposables: number,
  typeCotisationsVolontaires: 'per' | 'madelin' = 'per',
): DeductionsComparees {
  const perCommun = typeCotisationsVolontaires !== 'madelin';
  const zoneMicro = micro.optimisationsAppliquees?.exonerationZone ?? 0;
  const zoneReel = reel.optimisationsAppliquees?.exonerationZone ?? 0;
  const zoneCommune = zoneMicro > 0;
  const microDeduit = deduit(micro, recettesImposables, perCommun, zoneCommune);
  return {
    recettesImposables,
    micro: microDeduit,
    reel: deduit(reel, recettesImposables, perCommun, zoneCommune),
    microMinimum: recettesImposables > 0 && microDeduit > recettesImposables * 0.34 + 1,
    zoneReelSeul: zoneCommune ? 0 : zoneReel,
    perEnsuite: perCommun && (reel.optimisationsAppliquees?.cotisationsVolontaires ?? 0) > 0,
    zoneEnsuite: zoneCommune,
  };
}
