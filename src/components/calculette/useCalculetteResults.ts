import { useMemo } from 'react';
import {
  calculerDSPAMC,
  calculer2042Liberal,
  type Declaration2035Inputs,
  type ExtrasMedecin,
  type ResultatDSPAMC,
  type Resultat2042CPRO,
} from '@/lib/calc/dsPamc';
import { capChequesVacances, getDeclarationParams } from '@/lib/taxParams/declarationParams';
import { getTauxExonerationZone, getPlafondExonerationZone, getProrataPlafondZfuAnnee1 } from '@/lib/baremes-ir';
import type { CalculetteFormValues } from './calculetteSchema';
import { resolveEffectiveProfil } from './calculetteSchema';

/**
 * Mapping profil → ratio conventionné par défaut en micro-BNC.
 * - S1 / remplaçant / mixte : 100 % conventionné par hypothèse.
 * - S2 / OPTAM : on calcule (recettes − dépassements) / recettes pour DSAU.
 */

export interface PdsaSocialResult {
  /** Montant brut PDSA exonéré saisi par l'utilisateur (Art. 151 ter). */
  brut: number;
  /** Case DSFA (déclarant 1) — micro-BNC : brut × 0,66. Réel : 0 (PDSA passe par CI → RBS → DSDE/DSDG). */
  dsfa: number;
  /** True si les recettes/AA+AF étaient micro-BNC (DSFA = brut × 0,66). En réel, dsfa = 0. */
  isMicroBnc: boolean;
}

export interface CalculetteResults {
  /**
   * En RSPM, la DSFU n'a pas vocation à être remplie (le remplaçant cotise via la
   * DRI-PAMC). On conserve néanmoins l'objet calculé pour la typesafety, mais
   * l'UI masque entièrement le bloc DSFU et l'assiette sociale URSSAF.
   */
  dsPamc: ResultatDSPAMC;
  cases2042: Resultat2042CPRO;
  hasInputs: boolean;
  isMicroBnc: boolean;
  microBncRecettes: number;
  pdsaSocial: PdsaSocialResult;
  /** Régime social URSSAF résolu — pilote l'affichage du bloc DSFU dans `CalculetteResults`. */
  regimeSocial: 'rspm' | 'pamc';
  /** Warnings spécifiques au régime RSPM (champs sociaux saisis mais ignorés). */
  rspmWarnings: string[];
}

/**
 * Construit la liste des warnings RSPM (saisies sociales ignorées + dépassement
 * du seuil 38 k€). Pure function, exportée pour test direct sans renderHook.
 */
export function buildRspmWarnings(values: CalculetteFormValues, isMicroBnc: boolean): string[] {
  const rspmWarnings: string[] = [];
  const recettesConv = isMicroBnc ? values.recettesMicroBnc : values.AA;
  if (recettesConv > 38_000) {
    rspmWarnings.push(
      `Tes recettes conventionnées (${Math.round(recettesConv).toLocaleString('fr-FR')} €) dépassent 38 000 € en ${values.annee}. Tu restes en RSPM jusqu'au 31 décembre ${values.annee} : les calculs ci-dessous restent valides pour cette année. La bascule en PAMC prendra effet au 1er janvier ${values.annee + 1} (déclaration à faire auprès de l'URSSAF — CSS Art. L646-1).`,
    );
  }
  const ignored: string[] = [];
  if (values.ijMadelin > 0) ignored.push(`IJ Madelin (${values.ijMadelin} €)`);
  if (values.chequesVacances > 0) ignored.push(`chèques-vacances (${values.chequesVacances} €)`);
  if (values.depassements > 0) ignored.push(`dépassements (${values.depassements} €)`);
  if (values.ehpadHadSsiadCmpp > 0) ignored.push(`EHPAD/HAD/SSIAD/CMPP (${values.ehpadHadSsiadCmpp} €)`);
  if (values.cadre8DE > 0 || values.cadre8DB > 0) ignored.push(`Cadre 8 (DE/DB)`);
  if (values.pdsaExonereBrut > 0) ignored.push(`PDSA exonérée volet social (DSFA/DSFB)`);
  // Audit post-Phase 14.13 (juin 2026) — F2 : signaler `recettesZoneExo` si
  // saisi en RSPM (cas rare — UI masque le bloc pour les remplaçants mais une
  // valeur persistée en localStorage peut survivre une bascule profil).
  // ZFU/ZFRR sont réservés aux installés et collaborateurs (CGI Art. 44 octies A
  // & 44 quindecies), donc aucun impact fiscal en RSPM remplaçant.
  if (values.recettesZoneExo > 0) ignored.push(`Recettes en zone ZFU/ZFRR (${values.recettesZoneExo} €)`);
  if (ignored.length > 0) {
    rspmWarnings.push(
      `En RSPM, les saisies suivantes n'ont AUCUN impact DSFU (tu n'en remplis pas) : ${ignored.join(', ')}. Leur impact fiscal éventuel reste pris en compte côté 2042-C PRO (ex : IJ Madelin → 5QC en réel). La PDSA exonérée n'est pas déclarée dans une case sociale en RSPM (pas de DSFA) : elle est intégrée à l'assiette de tes cotisations CARMF/SSI. Vérifie ton statut URSSAF si tu pensais relever de la PAMC.`,
    );
  }
  return rspmWarnings;
}

export function useCalculetteResults(rawValues: CalculetteFormValues): CalculetteResults {
  // Refonte UX mai 2026 — Résolution `effectiveProfil` (S1 + DP → mixte) avant tout calcul.
  const effectiveProfil = resolveEffectiveProfil(rawValues.profil, rawValues.depassementsAutorises ?? false);
  const values: CalculetteFormValues = effectiveProfil === rawValues.profil
    ? rawValues
    : { ...rawValues, profil: effectiveProfil };
  const depKey = JSON.stringify(values);
  return useMemo(() => {
    const regimeSocial: 'rspm' | 'pamc' = values.regimeSocial ?? 'pamc';
    const isRspm = regimeSocial === 'rspm' && values.profil === 'remplacant';
    const base = computeBase(values);
    if (!isRspm) {
      return { ...base, regimeSocial: 'pamc' as const, rspmWarnings: [] };
    }
    const rspmWarnings = buildRspmWarnings(values, base.isMicroBnc);
    return {
      ...base,
      pdsaSocial: { ...base.pdsaSocial, dsfa: 0 },
      regimeSocial: 'rspm' as const,
      rspmWarnings,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depKey]);
}


type ComputedBase = {
  dsPamc: ResultatDSPAMC;
  cases2042: Resultat2042CPRO;
  hasInputs: boolean;
  isMicroBnc: boolean;
  microBncRecettes: number;
  pdsaSocial: PdsaSocialResult;
};

function computeBase(values: CalculetteFormValues): ComputedBase {
    const isMicroBnc = values.regimeFiscal === 'micro_bnc';

    const extras: ExtrasMedecin = {
      ijCpam: values.ijCpam,
      ijMadelin: values.ijMadelin,
      ijCarmf: values.ijCarmf,
      // Phase 3B F5 — Doctrine IJ CARMF Phase 9H sealing (mai 2026) :
      // temporaire (médecin actif) → DSCZ + AF/5HQ ; invalidité permanente → 1AZ.
      ijCarmfTemporaire: values.ijCarmfTemporaire,
      ijCarmfInvalidite: values.ijCarmfInvalidite,
      chequesVacances: values.chequesVacances,
      depassements: values.depassements,
      ehpadHadSsiadCmpp: values.ehpadHadSsiadCmpp,
    };

    // V18 — PDSA exonérée Art. 151 ter (commun aux 2 régimes).
    const pdsaBrut = Math.max(0, values.pdsaExonereBrut);

    if (isMicroBnc) {
      // Pré-déduction des retros versées + PDSA exonérée AVANT abattement 34 % (CGI Art. 102 ter).
      // La PDSA reste pleinement soumise aux cotisations sociales (DSFA = pdsa × 0,66).
      const cv = capChequesVacances(values.chequesVacances, values.annee);
      // Chèques-vacances en micro-BNC (RO-005) — la minoration CV × 1,515
      // s'applique UNIQUEMENT côté fiscal (5HQ) pour neutraliser l'abattement
      // 34 % et faire baisser le bénéfice final de exactement cv.capped €.
      // JAMAIS côté social : l'exo cotisations ANCV est gérée par l'URSSAF via
      // DSCN (montant facial, exo plafond social). Plafond fiscal appliqué
      // silencieusement (warning ci-dessous si excédent).
      const cvMinorationMicro = cv.capped * 1.515;
      // V21 — Doctrine SNIR (notice URSSAF DRI-PAMC) :
      // DSCS = totalité des recettes brutes encaissées (PDSA incluse), AVANT
      // toute déduction (ni retros versées, ni CV). Les rétrocessions versées
      // NE SONT PAS soustraites de DSCS/DSAV, sinon le ratio DSAU se casse et
      // l'URSSAF retire la prise en charge des cotisations conventionnées.
      // Les retros versées restent pré-déduites côté bénéfice fiscal (5HQ via
      // CGI Art. 102 ter) — c'est uniquement le volet social DSCS qui reste brut SNIR.
      const dscsBrut = Math.max(0, values.recettesMicroBnc);
      // Assiette sociale URSSAF DSDE = brut − retros − PDSA (les retros sont
      // pré-déduites par cohérence avec le fiscal ; la PDSA bascule en DSFA).
      // Aucun impact CV ici (géré par DSCN).
      const dsdeBase = Math.max(
        0,
        dscsBrut - values.retrocessionsVerseesMicroBnc - pdsaBrut,
      );
      // Recette imposable (5HQ post pré-déduction retros, post-PDSA exonérée,
      // post-minoration CV).
      const recettesNettes = Math.max(
        0,
        dscsBrut - values.retrocessionsVerseesMicroBnc - pdsaBrut - cvMinorationMicro,
      );

      // Phase 14.12 — Exonération zonée Micro-BNC : dégressivité + plafond + surplus brut + PRORATA MENSUEL DU PLAFOND année 1.
      // (CGI Art. 44 octies A pour ZFU-TE / Art. 44 quindecies pour ZFRR ;
      //  BOFiP BOI-BIC-CHAMP-80-10-20-20 §80 pour le prorata mensuel du plafond ZFU.)
      //
      // DOCTRINE CORRECTE :
      //   • bénéfice exonéré = recettes_zone × 0,66 × taux (PAS de prorata sur les recettes)
      //   • plafond annuel ajusté = plafond × (13 − mois_installation) / 12  [ZFU année 1 uniquement]
      //     ⇒ fraction de mois = mois entier (BOFiP §80)
      //     ⇒ ZFRR : pas de prorata (plafond glissant 3 ans)
      //     ⇒ années 2-8 : prorata = 1
      //     ⇒ moisInstallation undefined ⇒ prorata = 1 (assimile à janvier — rétro-compat)
      //   • 5HP = min(bénéfice, plafond ajusté)
      //   • surplus brut équivalent = surplus_bénéfice / 0,66 → reste en 5HQ
      //
      // Le volet SOCIAL (DSCS/DSAV/DSDE) n'est PAS impacté : URSSAF/CARMF restent dues sur la totalité.
      const recettesZone = Math.max(0, Math.min(values.recettesZoneExo, recettesNettes));
      const zoneRetenue = values.zoneExoneree ?? 'aucune';
      const anneeInstall = values.anneeInstallationZone ?? 0;
      const tauxZone = getTauxExonerationZone(zoneRetenue, anneeInstall, values.annee);
      const plafondZone = getPlafondExonerationZone(zoneRetenue);
      // Prorata du PLAFOND : appliqué UNIQUEMENT pour ZFU l'année 1 (année d'installation = année des revenus).
      const isAnnee1 = anneeInstall !== 0 && anneeInstall === values.annee;
      const prorataPlafond = (zoneRetenue === 'zfu' && isAnnee1)
        ? getProrataPlafondZfuAnnee1(values.moisInstallation)
        : 1;
      const plafondAjuste = plafondZone === Infinity ? Infinity : plafondZone * prorataPlafond;
      const beneficeZoneAvantPlafond = recettesZone * 0.66 * tauxZone;
      const beneficeNetZoneExonere = Math.min(beneficeZoneAvantPlafond, plafondAjuste);
      const case5HP = Math.round(beneficeNetZoneExonere * 100) / 100;
      // Surplus brut réinjecté en 5HQ : on retire SEULEMENT les recettes brutes effectivement exonérées.
      const recettesZoneExonereesEquivBrut = beneficeNetZoneExonere > 0
        ? beneficeNetZoneExonere / 0.66
        : 0;
      const recettesImposables = Math.max(0, recettesNettes - recettesZoneExonereesEquivBrut);
      const plafondSature = beneficeZoneAvantPlafond > plafondAjuste && plafondAjuste !== Infinity;




      // V11 — M3 : DSAU dynamique pour S2 ET pour mixte avec dépassements (cas rare).
      // V11 — M4 : la branche micro n'est exposée que si recettesMicroBnc > 0 (cf. hasInputs).
      const isS2 = values.profil === 'installe_s2';
      const isMixte = values.profil === 'mixte';
      const useDynamicDsau = (isS2 || (isMixte && values.depassements > 0)) && values.depassements > 0 && dscsBrut > 0;
      let DSAU_micro = dscsBrut > 0 ? 1 : 0;
      if (useDynamicDsau) {
        DSAU_micro = Math.max(0, Math.min(1,
          (dscsBrut - values.depassements) / dscsBrut
        ));
      }
      const DSAV_micro = useDynamicDsau
        ? Math.max(0, dscsBrut - values.depassements)
        : dscsBrut;

      const microWarnings: string[] = [];
      const microErrors: string[] = [];
      // Warning excédent CV en micro-BNC (parité avec moteur réel).
      if (cv.depasse) {
        const params = getDeclarationParams(values.annee);
        microWarnings.push(
          `Chèques-vacances saisis : ${values.chequesVacances} € — l'excédent de ${cv.excedent} € au-delà du plafond fiscal ${params.plafondChequesVacances} € (${values.annee}) n'est PAS déduit de tes recettes (5HQ minorée jusqu'au plafond seulement). DSCN reçoit le total commandé : l'URSSAF applique l'exo cotisations dans la limite du plafond social ${params.plafondSocialChequesVacances} € (= 30 % SMIC mensuel).`
        );
      }
      // V14 — U1 : doublon warning S2-sans-dépassements supprimé (déjà signalé en amont).
      void isS2;
      // V12 — R1 : retros > recettes = saisie INCOHÉRENTE → erreur bloquante (pas un simple warning).
      const retrosOverflow =
        values.retrocessionsVerseesMicroBnc > 0 &&
        values.recettesMicroBnc > 0 &&
        values.retrocessionsVerseesMicroBnc > values.recettesMicroBnc;
      if (retrosOverflow) {
        microErrors.push(
          `Tes rétrocessions versées ou redevance de collaboration (${values.retrocessionsVerseesMicroBnc} €) dépassent tes recettes brutes (${values.recettesMicroBnc} €). Saisie incohérente — la déclaration ne peut pas être générée tant que tu n'as pas corrigé tes montants.`
        );
      }

      // Doctrine 2026 (Brochure DGFiP p. 180) : les IJ CPAM hors ALD (maladie, maternité,
      // paternité, AFRM) ne sont PAS imposables en micro-BNC → JAMAIS dans 5HQ. Seules
      // dans DSDX (volet social, brut). Warning info pédagogique si saisies.
      if (values.ijCpam > 0) {
        microWarnings.push(
          `IJ CPAM hors ALD saisies (${values.ijCpam} €) : en micro-BNC elles ne sont PAS imposables IR (Brochure DGFiP 2026 p. 180) → exclues de 5HQ. Elles restent uniquement en DSDX (brut, volet social). Vérifie le pré-rempli DSDX vs ton attestation Ameli.`,
        );
      }

      // Phase G — DSFA/DSFB routage déclarant en micro-BNC (PDSA × 0,66).
      const dsfaMicro = Math.round(pdsaBrut * 0.66 * 100) / 100;
      const dsPamc: ResultatDSPAMC = {
        DSCS: dscsBrut,
        DSAV: DSAV_micro,
        DSAW: values.depassements,
        DSAU: DSAU_micro,
        DSAT: values.ehpadHadSsiadCmpp,
        DSDE: dsdeBase,
        DSDG: 0,
        DSDX: values.ijCpam,
        // Phase 9H parité moteur : DSCZ = IJ Madelin + IJ CARMF temporaire
        // (médecin actif, arrêt courte durée). L'invalidité permanente (1AZ) et la
        // retraite/pension (1AS) restent traitées en 2042-C PRO, jamais ici.
        DSCZ: values.ijMadelin + (values.ijCarmfTemporaire ?? 0),
        DSCN: values.chequesVacances,
        DSFA: values.declarant === 1 ? dsfaMicro : 0,
        DSFB: values.declarant === 2 ? dsfaMicro : 0,
        rbs: {
          rbs: dsdeBase,
          decomposition: {
            excedent: 0, insuffisance: 0, chargesSociales: 0, csgDeductible: 0,
            exonerations: 0, reintegrationsCadre8: 0, deductionsCadre8: 0,
          },
        },
        warnings: microWarnings,
        errors: microErrors,
      };

      const cases2042: Resultat2042CPRO = {
        case_5QC_5RC: recettesImposables,
        case_1AS: values.ijCarmf,
        // Phase 9H parité moteur : 1AZ = invalidité permanente CARMF (rare).
        // Champ non exposé en UI publique aujourd'hui mais propagé pour rester
        // cohérent avec `calculer2042Liberal` si la valeur arrive via storage/exemple.
        case_1AZ: values.ijCarmfInvalidite ?? 0,
        // Doctrine 2026 : IJ CPAM JAMAIS en 1AJ (cf. dsPamc.ts).
        case_1AJ: 0,
        case_5HP_5IP: Math.round(case5HP * 100) / 100,
      };

      // Phase 14.10 — Garde-fous pédagogiques zone exonérée.
      // (a) Warning info quand recettes saisies sans zone : aucune exonération appliquée.
      if (recettesZone > 0 && (values.zoneExoneree ?? 'aucune') === 'aucune') {
        microWarnings.push(
          `Tu as saisi ${Math.round(recettesZone).toLocaleString('fr-FR')} € de recettes en zone mais aucune zone d'exonération n'est sélectionnée — aucune exonération n'est appliquée (5HP = 0, recettes en zone intégrées à 5HQ). Choisis ZFU-TE ou ZFRR + ton année d'installation pour activer le calcul dégressif.`,
        );
      }
      // (b) — Phase 14.13 : warning "taux dégressif" supprimé (fusionné dans
      // le warning consolidé ZFU/ZFRR ci-dessous, qui affiche déjà `taux N %`).
      // (c) Taux 0 % (au-delà du dispositif) : aucune exonération possible.
      if (recettesZone > 0 && (values.zoneExoneree ?? 'aucune') !== 'aucune' && tauxZone === 0) {
        microWarnings.push(
          `Le dispositif ${values.zoneExoneree === 'zfu' ? 'ZFU-TE' : 'ZFRR'} est arrivé à son terme pour ton année d'installation (${values.anneeInstallationZone ?? '?'}) — taux d'exonération = 0 %. L'intégralité des recettes en zone est imposable (5HP = 0, recettes intégrées à 5HQ).`,
        );
      }
      // (d+e+f) Phase 14.13 — Consolidation en UN SEUL warning structuré "ZFU/ZFRR".
      // Format : "<résumé chiffré>\n---\n<doctrine légale>" — l'UI détecte ce
      // séparateur et rend une carte premium repliable (cf. CalculetteResults).
      // Tests scellés préservés : mots-clés `Plafond ZFU|ZFRR`, `saturé`, `prorat`,
      // `mois entiers`, `44 octies A`, `BOI-BIC-CHAMP-80-10-20-20`, `60 %`.
      if ((zoneRetenue === 'zfu' || zoneRetenue === 'zfrr') && recettesZone > 0 && tauxZone > 0) {
        const isZfu = zoneRetenue === 'zfu';
        const zoneLabel = isZfu ? 'ZFU-TE' : 'ZFRR';
        const plafondAffiche = Math.round(plafondAjuste).toLocaleString('fr-FR');
        const tauxPct = Math.round(tauxZone * 100);

        // Ligne 1 — résumé chiffré (priorité : prorata année 1 > saturation > info standard)
        let resume: string;
        if (isZfu && isAnnee1 && prorataPlafond < 1) {
          const moisActifs = Math.round(prorataPlafond * 12);
          const mois = values.moisInstallation ?? 1;
          resume = `Plafond ${zoneLabel} année 1 ajusté : 50 000 € × ${moisActifs}/12 = ${plafondAffiche} € (installation mois ${mois}, prorata en mois entiers, BOFiP §80). Taux ${tauxPct} %.`;
        } else {
          resume = `Plafond ${zoneLabel} : ${plafondAffiche} €, taux ${tauxPct} % (année ${values.annee - (values.anneeInstallationZone ?? values.annee) + 1} du dispositif).`;
        }

        // Surplus chiffré si saturé (additionné au résumé pour rester en ligne 1)
        if (plafondSature) {
          const surplusBeneficeNet = Math.round(beneficeZoneAvantPlafond - plafondAjuste);
          const surplusBrutEquiv = Math.round((beneficeZoneAvantPlafond - plafondAjuste) / 0.66);
          resume += ` Plafond saturé : surplus de ${surplusBeneficeNet.toLocaleString('fr-FR')} € de bénéfice (≈ ${surplusBrutEquiv.toLocaleString('fr-FR')} € de recettes brutes) auto-réinjecté en 5HQ — le fisc appliquera l'abattement 34 %.`;
        }

        // Ligne 2 — doctrine légale (repliable côté UI)
        const doctrine = isZfu
          ? `Prorata appliqué au **plafond uniquement**, en **mois entiers** (toute fraction de mois compte pour un mois entier, BOFiP BOI-BIC-CHAMP-80-10-20-20 §80). Le bénéfice exonéré n'est pas proratisé : seul le plafond l'est. Le passage de palier (ex. 100 % → 60 % au 60ᵉ mois d'activité) n'est pas géré automatiquement : sécurise auprès de ton SIE/AGA (CGI Art. 44 octies A I).`
          : `Plafond ZFRR 300 000 € apprécié sur 3 années glissantes (CGI Art. 44 quindecies). Pas de prorata année 1 : le plafond s'applique en année pleine quelle que soit la date d'installation.`;

        microWarnings.push(`${resume}\n---\n${doctrine}`);
      }







      // V11 — M4 : ne déclenche l'affichage des résultats que si l'utilisateur a saisi des recettes
      // (sinon affichage fantôme à 0 € pour les seules IJ).
      // V15 — B2 : on n'exclut PLUS retrosOverflow ici, sinon l'erreur bloquante
      // poussée dans `microErrors` était masquée par l'empty state — l'utilisateur
      // ne voyait aucun feedback. Le bloc d'erreur (role="alert") s'affiche
      // désormais avec les cases à 0, message rouge bien visible.
      const hasInputs = values.recettesMicroBnc > 0;

      const pdsaSocial: PdsaSocialResult = {
        brut: pdsaBrut,
        // V18 — micro-BNC : DSFA = brut × 0,66 (l'URSSAF n'applique PAS l'abatt. 34 %
        // sur la PDSA → on doit l'envoyer NETTE comme l'URSSAF l'attend).
        // Audit pré-prod 31/05/2026 R2 — réutilise `dsfaMicro` (source unique).
        dsfa: dsfaMicro,
        isMicroBnc: true,
      };
      return { dsPamc, cases2042, hasInputs, isMicroBnc: true, microBncRecettes: recettesImposables, pdsaSocial };
    }

    // V20 — Régime réel : la PDSA exonérée est déduite fiscalement via la ligne CI (cadre 7 « Divers à déduire ») de la 2035-B
    // (à la charge de l'utilisateur). Côté SOCIAL, la ligne CI figure dans la formule du
    // RBS (`calculerRBS`) → réintégrée AUTOMATIQUEMENT en DSDE (RBS positif) ou DSDG
    // (RBS négatif). DSFA / DSFB sont RÉSERVÉES au régime micro-BNC : les renseigner en
    // réel produirait une double cotisation. On force donc dsfa = 0 ici.
    const pdsaSocialReel: PdsaSocialResult = {
      brut: pdsaBrut,
      dsfa: 0,
      isMicroBnc: false,
    };

    // Régime réel — branche historique scellée
    const inputs2035: Declaration2035Inputs = {
      AA: values.AA, AF: values.AF, CE: values.CE, CN: values.CN,
      BK: values.BK, BV: values.BV,
      CS: values.CS, AW: values.AW, CU: values.CU, CI: values.CI,
      CO: values.CO, DG: values.DG, CJ: values.CJ, DH: values.DH,
      CP: values.CP,
    };

    const dsPamc = calculerDSPAMC(inputs2035, extras, values.annee, {
      cadre8DE: values.cadre8DE,
      cadre8DB: values.cadre8DB,
      pdsaExonere: pdsaBrut,
      regimeFiscal: 'reel',
      declarant: values.declarant,
    });
    const cases2042 = calculer2042Liberal(inputs2035, extras, values.annee, {
      chequesVacancesDejaInclus: values.chequesVacancesDejaInclus,
    });

    // Doctrine 2026 (Brochure DGFiP p. 180) : en BNC réel, les IJ CPAM hors ALD vont
    // en ligne AF (gains divers) → 5QC, ET un miroir DB du Cadre 8 neutralise le
    // double-comptage social. Warning si saisies sans miroir DB suffisant.
    if (values.ijCpam > 0) {
      const dbAttendu = values.ijCpam + values.ijMadelin;
      if (values.cadre8DB + 1 < dbAttendu) {
        dsPamc.warnings.push(
          `IJ CPAM hors ALD saisies (${values.ijCpam} €) : en BNC réel, pense à les inclure en ligne AF (gains divers) ET en miroir DB du Cadre 8 (= ${dbAttendu} € avec ijMadelin) pour éviter une double cotisation sociale. Ne JAMAIS les déclarer en 1AJ — la pré-tolérance CPAM en case salaire a été supprimée.`,
        );
      }
    }

    // V12 — R3 : exige une vraie base 2035 (recettes ou résultat BNC). Les IJ/CV seules
    // ne forment pas une déclaration valide → on n'affiche pas de résultats fantômes.
    const baseRecettes =
      values.AA + values.AF + Math.abs(values.CP) + values.CE + values.CN + values.BK + values.BV;
    const hasInputs = baseRecettes > 0;

    return { dsPamc, cases2042, hasInputs, isMicroBnc: false, microBncRecettes: 0, pdsaSocial: pdsaSocialReel };
}
