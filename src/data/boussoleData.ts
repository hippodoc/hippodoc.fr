// =====================================================================
// Convention cross-links (Guide Déclarations)
// ---------------------------------------------------------------------
// Les fiches/questions "hub" (ex : QT-014, QT-023, regle-RO-014, micro-bnc,
// bnc-reel) AGRÈGENT de nombreux liens entrants mais pointent uniquement
// vers les 3-5 références les plus utiles pour préserver la lisibilité du
// panneau "Voir aussi". Les asymétries qui en résultent (~92 cas constatés
// à l'audit pré-prod) sont volontaires.
//
// IDs réservés / historiques (volontairement absents) :
//   • PM-007 : profil retiré (absorbé par PM-001/PM-008)
//   • PC-004, PC-005 : pépites fusionnées dans PC-006/PC-007
//   • ZG-011 → ZG-015 : zones grises réservées (consolidations futures)
// IDs renumérotés en Phase 9J (mai 2026) pour garantir l'unicité :
//   • CASE-029 (CI) + CASE-030 (DSDG) — d'origine
//   • CASE-031 (BT) + CASE-032 (1AZ) — ex-doublons CASE-029/030
// =====================================================================

export type CertitudeLevel = "confirmed" | "consensus" | "to_verify" | "grey_zone" | "bug" | "trap";

export type FicheTheme = "declarations" | "ij-prevoyance" | "optimisation" | "regime-transition" | "vie-pratique";
export type QuestionTheme = "declarations" | "ij-prevoyance" | "regime-fiscal" | "comptabilite" | "cotations" | "optimisation" | "regime-transition" | "vie-pratique";

export const ficheThemeLabels: Record<FicheTheme, string> = {
  declarations: "Déclarations",
  "ij-prevoyance": "IJ & Prévoyance",
  optimisation: "Optimisation",
  "regime-transition": "Régime & Transition",
  "vie-pratique": "Vie pratique",
};

export const questionThemeLabels: Record<QuestionTheme, string> = {
  declarations: "Déclarations",
  "ij-prevoyance": "IJ & Prévoyance",
  "regime-fiscal": "Régime fiscal",
  comptabilite: "Comptabilité",
  cotations: "Cotations & Facturation",
  optimisation: "Optimisation",
  "regime-transition": "Régime & Transition",
  "vie-pratique": "Vie pratique",
};

export interface RegleOr {
  id: string;
  numero: number;
  titre: string;
  description: string;
  exemple: string;
  certitude: CertitudeLevel;
  icon: string;
  theme: FicheTheme;
  profilsConcernes: string[];
  /** Cases Caseopedia liées (codes : `5HQ`, `DSCS`…). */
  relatedCases?: string[];
  /** Termes du glossaire liés (ids : `bnc-reel`, `pdsa`…). */
  relatedTerms?: string[];
  /** Questions FAQ liées (`QT-XXX`). */
  relatedQuestions?: string[];
  /** Autres fiches pratiques liées (`regle-RO-XXX`, `pepite-PC-XXX`, `zone-ZG-XXX`). */
  relatedFiches?: string[];
}

export interface CaseInfo {
  id: string;
  code: string;
  nom: string;
  formulaire: string;
  description: string;
  quiRemplit: string;
  erreurFrequente: string;
  certitude: CertitudeLevel;
  categorie: "fiscal" | "social" | "administratif";
  conseil: string;
  /** Fiches pratiques liées (`regle-RO-XXX`, `pepite-PC-XXX`, `zone-ZG-XXX`). */
  relatedFiches?: string[];
  /** Questions FAQ liées (`QT-XXX`). */
  relatedQuestions?: string[];
  /** Termes du glossaire liés. */
  relatedTerms?: string[];
  /** Autres cases Caseopedia liées (codes). */
  relatedCases?: string[];
}

export interface ProfilMedecin {
  id: string;
  label: string;
  description: string;
  icon: string;
  casePrioritaires: string[];
  conseilsCles: string[];
  /** Phase 9O — FAQ recommandées pour ce profil (IDs `QT-XXX`). Optionnel : alimente la pertinence pédagogique. */
  faqPertinentes?: string[];
}

export interface QuestionReformule {
  id: string;
  question: string;
  reponse: string;
  certitude: CertitudeLevel;
  tags: string[];
  theme: QuestionTheme;
  /** Fiches pratiques liées : `regle-RO-XXX`, `pepite-PC-XXX`, `zone-ZG-XXX`. */
  relatedFiches?: string[];
  /** Autres questions FAQ liées : `QT-XXX`. */
  relatedQuestions?: string[];
  /** Cases Caseopedia liées (codes : `5HQ`, `DSCS`…). */
  relatedCases?: string[];
  /** Termes du glossaire liés (ids). */
  relatedTerms?: string[];
}

export interface PepiteCachee {
  id: string;
  titre: string;
  description: string;
  impact: "faible" | "moyen" | "fort";
  risque: "faible" | "moyen" | "fort";
  certitude: CertitudeLevel;
  profilsConcernes: string[];
  theme: FicheTheme;
  /** Cases Caseopedia liées. */
  relatedCases?: string[];
  /** Termes du glossaire liés. */
  relatedTerms?: string[];
  /** Questions FAQ liées. */
  relatedQuestions?: string[];
  /** Autres fiches pratiques liées (`regle-RO-XXX`, `pepite-PC-XXX`, `zone-ZG-XXX`). */
  relatedFiches?: string[];
}

export interface BugAdmin {
  id: string;
  titre: string;
  symptomes: string[];
  profilsConcernes: string[];
  causesProbables: string[];
  actionsPossibles: string[];
  statut: "actif" | "resolu" | "intermittent";
  certitude: CertitudeLevel;
  messageIds?: string[];
}

export interface MessageType {
  id: string;
  destinataire: string;
  objet: string;
  corps: string;
  contexte: string;
  icon: string;
}

export interface ZoneGrise {
  id: string;
  sujet: string;
  positionA: string;
  positionB: string;
  conclusion: string;
  certitude: CertitudeLevel;
  theme: FicheTheme;
  profilsConcernes: string[];
  /** Cases Caseopedia liées. */
  relatedCases?: string[];
  /** Termes du glossaire liés. */
  relatedTerms?: string[];
  /** Questions FAQ liées. */
  relatedQuestions?: string[];
  /** Autres fiches pratiques liées (`regle-RO-XXX`, `pepite-PC-XXX`, `zone-ZG-XXX`). */
  relatedFiches?: string[];
}

export interface CalendrierMois {
  mois: string;
  numero: number;
  demarches: { titre: string; description: string; urgent: boolean }[];
}

export const reglesOr: RegleOr[] = [
  {
    id: "RO-001",
    numero: 1,
    titre: "Priorité du CA réel sur le SNIR si supérieur",
    description: "Si ton Chiffre d'Affaires brut est supérieur au montant indiqué sur le SNIR, il est préférable de déclarer ton CA réel. La correction à la hausse ne pose généralement pas de problème à l'administration. Le SNIR est souvent incomplet (il n'inclut pas toujours les ROSP, revenus EHPAD, forfaits, remplacements antérieurs à l'installation, etc.). 💡 **Hippodoc** affiche en parallèle ton CA encaissé et le SNIR pour repérer l'écart d'un coup d'œil.",
    exemple: "Mon SNIR 2025 affiche 4 215 € mais mon export Doctolib totalise 6 840 €. Je dois déclarer 6 840 €.",
    certitude: "confirmed",
    icon: "✅",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-011", "PM-012", "PM-013"],
    relatedCases: ["DSCS", "DSAV", "5HQ"],
    relatedTerms: ["snir", "comptabilite-caisse", "recettes-brutes-nettes", "super-net", "quotient-familial"],
    relatedQuestions: ["QT-001", "QT-022"],
  },
  {
    id: "RO-002",
    numero: 2,
    titre: "Déclaration PAMC même en micro-BNC",
    description: "Le micro-BNC est un régime **fiscal**, le PAMC est un régime **social** — les deux sont indépendants (voir la règle d'or *« Fiscal ≠ Social »*). Conséquence : même en micro-BNC, la déclaration PAMC (DSCS, DSAV, DSAU, etc.) doit être remplie pour informer l'URSSAF et la CARMF de tes revenus afin qu'ils puissent calculer tes cotisations sociales. Ne pas la remplir entraîne des relances, une taxation d'office et la perte de la prise en charge des cotisations maladie (PCC). 💡 Le module `Aide DSFU – volet PAMC` d'**Hippodoc** pré-remplit ces 9 cases à partir de tes encaissements.",
    exemple: "Un remplaçant en micro-BNC avec un CA brut de 47 320 € doit reporter ce montant en DSCS et DSAV. S'il ne remplit que la 5HQ, il s'expose à des problèmes avec l'URSSAF et la CARMF.",
    certitude: "confirmed",
    icon: "⚠️",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-005", "PM-009", "PM-010", "PM-011", "PM-012", "PM-013"],
    relatedCases: ["5HQ", "DSCS", "DSAV", "DSAU"],
    relatedTerms: ["pamc", "micro-bnc", "ds-pamc"],
    relatedQuestions: ["QT-014", "QT-021", "QT-022"],
  },
  {
    id: "RO-003",
    numero: 3,
    titre: "Traitement des rétrocessions versées en micro-BNC (CGI Art. 102 ter)",
    description: "En micro-BNC, les rétrocessions versées (par un titulaire à ses remplaçants) ou la redevance de collaboration (par un collaborateur au titulaire) sont pré-déduites du CA brut avant report en 5HQ. Ce ne sont pas des 'charges' (puisqu'il n'y a pas de charges en micro-BNC), mais des 'recettes en moins'. Sans cette pré-déduction, tu paierais impôts et cotisations sur de l'argent que tu n'as jamais conservé. 💡 Le module `Aide 2042` d'**Hippodoc** applique automatiquement cette pré-déduction dans la 5HQ.",
    exemple: "Titulaire micro-BNC : CA brut 87 460 €, rétrocessions versées 22 180 € → 5HQ = 65 280 €. Collaborateur micro-BNC : CA encaissé 73 920 €, redevance versée 22 470 € → 5HQ = 51 450 €.",
    certitude: "confirmed",
    icon: "💡",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-004", "PM-011"],
    relatedCases: ["5HQ"],
    relatedTerms: ["retrocession", "redevance-collaboration", "micro-bnc", "collaboration-liberale"],
    relatedQuestions: ["QT-014"],
  },
  {
    id: "RO-004",
    numero: 4,
    titre: "IJ CPAM et maternité en micro-BNC",
    description: "En micro-BNC, les IJ CPAM (maladie, maternité/paternité, allocation forfaitaire de repos maternel — AFRM) ne sont pas imposables fiscalement (hors ALD — les IJ en ALD sont totalement exonérées quel que soit le régime). Elles doivent cependant être incluses dans la déclaration sociale (DSCS, DSDX) pour le calcul des cotisations sociales. La position fiscale et sociale diverge sur ce point.\n\n**Cas particulier maternité (RSPM ou PAMC)** : le congé maternité est ouvert **dès le 1er jour** d'arrêt (IJ + AFRM forfaitaire), contrairement aux IJ maladie qui n'interviennent qu'au **91ᵉ jour**. La couverture CARMF (option 25 % vs 100 %) impacte le **montant** des IJ, pas l'éligibilité. Pour ouvrir tes droits CPAM, l'**attestation URSSAF** des cotisations à jour est exigée — les **6 mois d'affiliation se cumulent entre régimes** (RSPM + PAMC), donc une bascule récente ne fait pas perdre tes droits. Si l'URSSAF tarde à clôturer ton compte RSPM, demande l'attestation par mail en joignant la notification de bascule.",
    exemple: "J'ai touché 2 850 € d'IJ maternité. Je ne les ajoute pas en 5HQ mais je les rapporte dans la partie sociale (DSDX). Si c'est une ALD, elles sont totalement exonérées d'IR quel que soit le régime.",
    certitude: "consensus",
    icon: "🔄",
    theme: "ij-prevoyance",
    profilsConcernes: ["PM-002", "PM-005", "PM-006", "PM-012", "PM-013"],
    relatedCases: ["DSDX", "5HQ", "1AJ"],
    relatedTerms: ["micro-bnc", "cpam", "ds-pamc"],
    relatedQuestions: ["QT-006", "QT-023"],
  },
  {
    id: "RO-005",
    numero: 5,
    titre: "Chèques Vacances ANCV : deux plafonds indépendants (547 € social / 1 823 € fiscal en 2026)",
    description: "Un seul dispositif, deux plafonds qui ne se cumulent pas mais s'appliquent **en même temps** sur la même commande.\n\n**Plafond fiscal — 1 823 € en 2026** (= 1 SMIC mensuel brut, réindexé chaque année). C'est ce que tu peux retirer de ton bénéfice imposable.\n\n**Plafond social — 547 € en 2026**. Sur les 547 premiers euros commandés, exonération URSSAF + CARMF. Au-delà : neutre, pas de surcoût. La **CSG-CRDS reste due** sur ces 547 € (calcul automatique côté URSSAF, rien à saisir).\n\n**Côté déclaration sociale (DSFU volet PAMC, case DSCN)** : tu inscris le **montant total commandé** (ex : 1 823 €), sans plafonner toi-même. L'URSSAF applique l'exo dans la limite de 547 €.\n\n**Côté fiscal selon ton régime** :\n• **Micro-BNC** → tu retires de 5HQ le montant commandé × **1,515** (le coefficient neutralise l'abattement 34 %).\n• **BNC réel** → mécanique en deux temps sur la 2035 puis minoration manuelle de 5QC. Voir la fiche dédiée RO-011.\n\n**Conditions** : activité libérale **depuis plus d'1 an**, pas de salarié OU ≤ 50 (avec obligation de proposer le dispositif si tu en as). Frais d'achat ANCV (port, création de compte) déductibles à 100 % en charges.",
    exemple: "**Micro-BNC** — CA 64 280 €, 690 € de CV commandés → 5HQ = 64 280 − (690 × 1,515) ≈ **63 235 €**. DSCN reçoit 690 € : 547 € exonérés URSSAF + CARMF, 143 € soumis (neutre, pas de surcoût).\n\n**BNC réel** — bénéfice 2035 (CP) = 92 410 €, 1 380 € de CV commandés → résultat 2035 inchangé (cf. RO-011), puis 5QC = 92 410 − 1 380 = **91 030 €**. DSCN reçoit 1 380 €.",
    certitude: "confirmed",
    icon: "💸",
    theme: "optimisation",
    profilsConcernes: ["PM-001", "PM-002", "PM-011", "PM-013"],
    relatedCases: ["5HQ", "DSCN", "5QC"],
    relatedTerms: ["ancv", "micro-bnc"],
    relatedQuestions: ["QT-026"],
  },
  {
    id: "RO-006",
    numero: 6,
    titre: "Exonération ZFU/PDSA — Micro-BNC ET régime réel",
    description: "L'exonération fiscale pour les revenus réalisés en Zone Franche Urbaine (ZFU) ou les majorations de Permanence Des Soins Ambulatoires (PDSA) est compatible avec **les deux régimes fiscaux** (micro-BNC et BNC réel). Le régime fiscal n'est pas un critère d'éligibilité.\n\n⚠️ **Attention au piège classique : la case 5HP n'accueille QUE les régimes zonés (ZFU-TE, ZRR/FRR, JEI — CGI Art. 1417, IV, b). La PDSA exonérée Art. 151 ter ne va JAMAIS en 5HP.** Mettre la PDSA en 5HP n'a aucun effet fiscal (case purement informative) mais entraîne un **double-comptage URSSAF** (les impôts retransmettent 5HP à l'URSSAF qui l'ajoute à 5HQ × 0,66 + DSFA pour calculer ton revenu net social), donc des cotisations sociales surévaluées.\n\n**Le bon mapping en MICRO-BNC** :\n• **ZFU** (installé) → 5HQ réduit du brut + 5HP = brut × 0,66.\n• **ZRR/FRR** (installé ou collaborateur uniquement, jamais remplaçant) → 5HQ réduit du brut + 5HP = brut × 0,66.\n• **PDSA** (Art. 151 ter — majorations CRD/CRS/CRN/VRN/VRS + forfaits d'astreinte PRD/PRN) → 5HQ réduit du brut + **DSFA** (déclarant 1) ou **DSFB** (déclarant 2) = brut × 0,66 sur la DSFU (volet PAMC).\n\n**Le bon mapping en BNC RÉEL** (régime contrôlé) :\n• **ZFU/ZRR/JEI** → bénéfice exonéré déduit dans la 2035 + 5QB en informatif.\n• **PDSA** → comptabilisée en recettes 2035-A puis **déduite en ligne CI** de la 2035-B (« divers à déduire — exonération permanence des soins »). Côté social, la ligne CI **figure dans la formule du RBS** → la PDSA est **réintégrée AUTOMATIQUEMENT** en **DSDE** (RBS positif) ou **DSDG** (RBS négatif). **Aucune saisie DSFA en réel** — c'est le piège n°2 : remplir DSFA en plus de CI = double cotisation.\n\nPour les actes classiques (G, GS, V, VL, MEG, MN, MM) réalisés pendant la garde : ils restent imposables et restent dans 5HQ / au bénéfice 2035.",
    exemple: "**Cas 1 — ZFU pur (installé micro-BNC)** : 38 745 € de CA total dont 9 815 € exonérés en ZFU.\n• 5HQ = 38 745 − 9 815 = **28 930 €**\n• 5HP = 9 815 × 0,66 ≈ **6 478 €**\n• DSFA = 0\n\n💡 **Si l'installation date de < 12 mois**, le plafond 5HP de 50 000 € est à proratiser au nombre de mois d'exonération effective (CGI Art. 49 K ann. III ; CE 18/07/2018 n° 412142). Exemple : installation en décembre → plafond 2025 ≈ 4 167 €. Détail dans **QT-049**.\n\n**Cas 2 — PDSA pur (remplaçant micro-BNC PAMC)** : 27 480 € de recettes dont 3 720 € de majorations PDSA exonérées (CRN/VRN/PRN).\n• 5HQ = 27 480 − 3 720 = **23 760 €**\n• 5HP = **0** (rien à mettre — pas un régime zoné)\n• **DSFA** = 3 720 × 0,66 ≈ **2 455 €**\n\n**Cas 3 — Mixte ZFU + PDSA (micro-BNC)** : 5HQ réduit des deux, 5HP pour la part ZFU uniquement, DSFA pour la part PDSA uniquement.\n\n**Cas 4 — PDSA en BNC RÉEL (installé secteur 1, 60 000 € de bénéfice avant exo, 8 000 € de PDSA éligible)** :\n• 2035-A : recettes incluent la PDSA brute (rien à retirer).\n• 2035-B ligne **CI** = **8 000 €** → bénéfice fiscal = 60 000 − 8 000 = 52 000 € → reporté en **5QC**.\n• Côté social : la ligne CI est dans la formule du RBS → DSDE (ou DSDG si RBS négatif) intègre déjà les 8 000 €.\n• **DSFA = 0** ❌ — surtout pas remplir, sinon les 8 000 € seraient cotisés deux fois.",
    certitude: "confirmed",
    icon: "📍",
    theme: "regime-transition",
    profilsConcernes: ["PM-002", "PM-008", "PM-012", "PM-013"],
    relatedCases: ["5HQ", "5HP", "5QB", "DSFA", "CI", "DSDE", "DSDG"],
    relatedTerms: ["zfu-te", "pdsa", "micro-bnc"],
    relatedQuestions: ["QT-020", "QT-027", "QT-028", "QT-049"],
  },
  {
    id: "RO-007",
    numero: 7,
    titre: "Conserver sa comptabilité en cas de bascule Micro-BNC vers Réel",
    description: "Pour passer du micro-BNC au régime réel, deux conditions cumulatives : (1) avoir levé l'option pour le réel auprès de ton SIE (généralement avant le 1er février de l'année concernée), et (2) avoir tenu une comptabilité précise dès le 1er janvier. Sans l'option formelle ET la comptabilité, le passage n'est pas possible pour l'année concernée — la compta seule ne suffit pas.",
    exemple: "Un médecin ayant beaucoup de charges d'installation en fin d'année 2025, s'il n'a pas tenu de 2035 pendant cette année, devra rester en micro-BNC pour 2025 et reporter ses charges (amortissements) sur 2026 en passant au réel.",
    certitude: "confirmed",
    icon: "🗓️",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-004", "PM-011", "PM-012"],
    relatedCases: ["5HQ", "5QC", "2035"],
    relatedTerms: ["micro-bnc", "bnc-reel", "amortissement", "comptabilite-caisse"],
    relatedQuestions: ["QT-013", "QT-014"],
  },
  {
    id: "RO-008",
    numero: 8,
    titre: "Les forfaits S1 (2%, 3%, groupe III) ne s'appliquent qu'à la part installation/collaboration",
    description: "Réservés aux installés secteur 1 en BNC réel. Forfait 2 % (case DF, ligne 43 de la 2035-B) : 2 % des recettes brutes totales (AA + AF + dépassements + redevances de collaboration perçues + IJ) — couvre représentation, prospection, blanchissage, cadeaux, petits déplacements ; applicable dès la 1ère année d'installation. Forfait 3 % (case DG) : 3 % des seuls honoraires conventionnels AA, hors PDSA exonéré, hors dépassements (DE/DP), HN, MSU, expertises, études cliniques et IJ Madelin. Les forfaits CPAM (ROSP, Médecin Traitant, forfait structure) sont des revenus conventionnés et restent INCLUS dans l'assiette des 3 %. Groupe III (case DH) : forfait fixe de 3 050 €. **Cumul DF + DG + DH autorisé** depuis l'imposition des revenus 2023 (suppression de la majoration art. 158, 7 CGI ; BOI-BNC-SECT-40, repris dans le Guide UNASA 2035-2026 §391 p. 92-93). Le 2 % (DF) reste seulement incompatible avec la déduction des frais réels de même nature (poste 30). ⚠️ Première année d'installation : DF et DG applicables dès le 1er exercice, DH disponible à partir de la 2ème année. En activité mixte (remplacement + installation), ces forfaits ne s'appliquent que sur la part installation/collaboration. Les appliquer sur le CA de remplacement expose à un redressement. ⚠️ ATTENTION : ces déductions vont en cases dédiées DF/DG/DH ligne 43 de la 2035-B. Ne RIEN mettre en parallèle dans « frais de représentation, réception, prospection » (poste 30) sinon cela vaut renonciation au forfait 2 %. ⚠️ Installation en cours d'année : les 2 %/3 %/Groupe III s'appliquent sur le CA à compter de la date d'installation effective. Les frais de repas hors domicile sont cumulables avec le forfait 2 % (postes différents). Réforme 2026 : la case DSCO est supprimée — DG et DH sont désormais réintégrés socialement via le RBS du Cadre 8 de la 2035-B, reporté en DSDE. 💡 Le module `Aide 2035` d'**Hippodoc** calcule les 3 forfaits et le RBS correctement (rétrocessions exclues, Groupe III bloqué la 1ère année).",
    exemple: "CA total 142 360 € dont 18 470 € de DE/HN/PDSA exonéré et 9 240 € de rétrocessions versées à un remplaçant. Forfait 2 % (DF) = 2 % × 142 360 ≈ 2 847 € sur la base recettes totales. Forfait 3 % (DG) = 3 % × (AA conventionné − exclusions) ≈ 3 717 €. Groupe III (DH) = 3 050 €. Total déduit fiscalement ≈ 9 614 €. Côté social : DG + DH (6 767 €) sont réintégrés dans le RBS via le Cadre 8 → DSDE ; DF (2 %) reste déduit socialement.",
    certitude: "confirmed",
    icon: "⚠️",
    theme: "optimisation",
    profilsConcernes: ["PM-001", "PM-003", "PM-004", "PM-011"],
    relatedCases: ["2035", "DF", "DG", "DH", "DSDE", "5QC"],
    relatedTerms: ["secteur-1-2", "groupe-iii", "bnc-reel"],
    relatedQuestions: ["QT-024"],
  },
  {
    id: "RO-009",
    numero: 9,
    titre: "PER individuel : n'est intéressant que si ta TMI retraite sera plus basse qu'aujourd'hui",
    description: "Les versements sur un PER sont déductibles du revenu imposable (jusqu'à 10% du bénéfice, plafond ~37 700€ en 2025). Mais à la sortie (retraite), le capital ou la rente est imposé. Le PER n'est donc rentable que si ta tranche marginale d'imposition sera plus basse à la retraite qu'aujourd'hui — ce qui est le cas pour la majorité des libéraux, mais pas pour ceux qui anticipent des revenus fonciers ou un patrimoine important.",
    exemple: "TMI actuelle 41 % → versement 8 750 € coûte effectivement 5 163 €. Si TMI retraite 30 % → récupération imposée à 2 625 €. Gain net : 962 €. Si TMI retraite identique : aucun gain, juste un report d'imposition.",
    certitude: "confirmed",
    icon: "💡",
    theme: "optimisation",
    profilsConcernes: ["PM-001", "PM-003", "PM-004", "PM-010"],
    relatedCases: ["5QC", "2035"],
    relatedTerms: ["per", "madelin", "tmi", "ir"],
  },
  {
    id: "RO-010",
    numero: 10,
    titre: "AGA : adhésion inutile depuis l'exercice 2023",
    description: "La majoration de 10% du bénéfice imposable pour non-adhésion à un organisme de gestion agréé (AGA/CGA) a été définitivement supprimée à partir des revenus 2023 (loi de finances 2021, arrêt CJUE). Tu n'as plus besoin d'adhérer à une AGA pour éviter une pénalité. L'adhésion peut néanmoins rester utile pour l'assistance déclarative et l'accès à certains services, mais ce n'est plus obligatoire. Pour les exercices antérieurs (2022 et avant), si tu as payé cette majoration, tu peux réclamer un dégrèvement via le site de la FMF.",
    exemple: "Installé depuis 2024 sans AGA : aucune majoration de 10%. Installé en 2022 avec majoration appliquée à tort : envoyer un message aux impôts via messagerie sécurisée en citant la jurisprudence CJUE et l'article de la FMF.",
    certitude: "confirmed",
    icon: "✅",
    theme: "optimisation",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-011", "PM-012"],
    relatedCases: ["2035", "5QC"],
    relatedTerms: ["aga", "bnc-reel"],
  },
  {
    id: "RO-011",
    numero: 11,
    titre: "Chèques Vacances ANCV en BNC réel : L30 + L36 puis minoration manuelle en 5QC",
    description: "En BNC réel, la déduction fiscale ne se fait **pas** directement sur la 2035 mais sur la 2042-C-PRO. La 2035 sert uniquement de support social (reflet de l'activité réelle).\n\n**Étape 1 — 2035 ligne 30** : tu inscris le montant total des CV commandés en charge comptable.\n**Étape 2 — 2035 ligne 36** : tu **réintègres le même montant en totalité**. Résultat : la case CP reste **inchangée**.\n**Étape 3 — 2042-C-PRO case 5QC** : tu **soustrais manuellement** jusqu'à **1 823 €** (plafond 2026) du bénéfice CP. C'est ici que la déduction fiscale se matérialise. Pas de case dédiée aux CV sur la 2042.\n\n**Pourquoi ce montage ?** La 2035 doit refléter l'activité économique réelle pour le calcul des cotisations sociales (base RSPM/PAMC). Si on déduisait les CV directement sur la 2035, on ferait baisser indûment l'assiette sociale au-delà des 547 € prévus. La réintégration L36 neutralise donc l'effet sur la 2035, et la déduction fiscale passe par la 2042.\n\nFrais d'achat ANCV (port, création de compte) → ligne « frais divers de gestion » de la 2035, déductibles à 100 %.\n\n👉 **Pour les deux plafonds (547 € social / 1 823 € fiscal) et le mécanisme micro-BNC** : voir RO-005.",
    exemple: "BNC réel — CP = 78 940 €, 1 250 € de CV commandés en 2026.\n• 2035 : L30 +1 250 €, L36 −1 250 € → CP = **78 940 €** inchangé.\n• 2042-C-PRO : 5QC = 78 940 − 1 250 = **77 690 €**.\n\nSi tu commandes au plafond (1 823 €) : 5QC = 78 940 − 1 823 = **77 117 €**.",
    certitude: "confirmed",
    icon: "💸",
    theme: "optimisation",
    profilsConcernes: ["PM-001", "PM-003", "PM-004", "PM-011"],
    relatedCases: ["5QC", "2035", "DSCN"],
    relatedTerms: ["ancv", "bnc-reel"],
    relatedQuestions: ["QT-026"],
  },
  {
    id: "RO-012",
    numero: 12,
    titre: "DSCS = CA brut AVANT déduction (rétrocessions versées OU redevance de collaboration)",
    description: "Le montant à déclarer en DSCS (recettes brutes non salariées) est **toujours le CA total BRUT encaissé**, AVANT toute déduction de la part reversée à un tiers. C'est la règle sociale, qui s'applique à deux profils symétriques :\n\n• **Titulaire avec remplaçants** : DSCS = CA total AVANT rétrocessions versées.\n• **Collaborateur libéral** : DSCS = CA total encaissé AVANT redevance versée au titulaire (L16/BG).\n\nCôté **fiscal**, la part reversée est en revanche bien déduite : **L21/BG (rétrocession) ou L16/BG (redevance) en BNC réel**, et **pré-déduite des recettes avant report en 5HQ** en micro-BNC (CGI Art. 102 ter — voir RO-003). Conséquence concrète : **chez un titulaire avec remplaçants OU un collaborateur, DSCS > 5HQ** (et DSCS > 5QC). Ce n'est PAS une incohérence — c'est l'asymétrie social/fiscal.\n\n**Pourquoi DSCS reste brut côté social** ? Parce qu'il sert à calculer le ratio **DSAU = DSAV / DSCS** qui décide de la prise en charge des cotisations maladie (PCC en secteur 1). Soustraire la part reversée casserait ce ratio. Les cotisations URSSAF/CARMF, elles, sont assises sur 5HQ (micro) ou DSDE (réel) — pas sur DSCS — donc ce CA brut **n'augmente PAS** tes cotisations.\n\nErreur fréquente : déclarer en DSCS le CA après rétrocessions/redevance versée. 💡 Le module `Aide DSFU – volet PAMC` d'**Hippodoc** sépare nativement la base sociale (DSCS = CA brut) de la base fiscale (après rétrocessions ou redevance).",
    exemple: "**Titulaire** : CA total 142 480 € dont 27 360 € rétrocédés aux remplaçants → DSCS = 142 480 € (pas 115 120 €). 5HQ (micro) ou 5QC (réel) = 115 120 €.\n\n**Collaborateur micro-BNC** : 80 000 € encaissés, 8 000 € de redevance versée au titulaire → DSCS = **80 000 €**, 5HQ = **72 000 €**. Les deux cases ne sont PAS le même chiffre.",
    certitude: "confirmed",
    icon: "⚠️",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-011"],
    relatedCases: ["DSCS", "DSAV", "5HQ", "5QC"],
    relatedTerms: ["retrocession", "redevance-collaboration", "collaboration-liberale", "ds-pamc", "pamc"],
    relatedQuestions: ["QT-022"],
  },
  {
    id: "RO-013",
    numero: 13,
    titre: "Calendrier des régularisations : URSSAF/impôts à N+1, CARMF jusqu'à N+2",
    description: "Les régularisations ne tombent pas toutes en même temps. **URSSAF et impôts** régularisent généralement à **N+1**, dès que tu as déclaré tes revenus N. La **CARMF**, elle, peut encore te demander un rappel à **N+2** : ses cotisations N sont calculées en provisionnel sur la base de tes revenus N-2, puis ajustées dès que les revenus N sont remontés. Le décalage administratif décale d'autant le rappel ou le remboursement. ⚠️ Conséquence pratique : même après avoir réglé ta régul URSSAF + impôts en N+1, garde une réserve de trésorerie pour la régul CARMF qui peut tomber l'année suivante.\n\n**⚠️ Cas particulier RSPM** : **aucune régularisation URSSAF ni CARMF**, jamais. Au RSPM, tu paies trimestriellement selon les **tranches progressives** (13,5 % jusqu'à ~19 000 € puis 21,2 % au-delà — voir le glossaire `rspm` et PM-012) appliquées au CA réel déclaré chaque trimestre — il n'y a rien à régulariser a posteriori. Le décalage N+1/N+2 ne concerne que l'**IR** (côté impôts). Le N+2 CARMF n'existe **que** pour le PAMC. Ne te laisse pas dire le contraire par un confrère mal informé.\n\n💡 **Hippodoc** affiche tes provisions estimées et te rappelle que la CARMF (PAMC) est sur un cycle long.",
    exemple: "Tu es **installée au PAMC** depuis 2025. En 2026, tu déclares tes revenus 2025 → la régul URSSAF tombe courant 2026, en même temps que la régul d'IR. Mais la régul CARMF sur tes revenus 2025 peut, elle, ne tomber qu'en 2027 (cycle long PAMC). Si tu as 7 250 € de côté après URSSAF + IR payés, ne pioche pas tout : laisse une part pour la CARMF N+2.\n\n**Variante RSPM** : tu démarres en libéral en 2025 au RSPM, tu paies trimestriellement selon les tranches RSPM (13,5 % puis 21,2 %) sur ton CA réel. En 2026, seule ta régul d'**IR** tombe (au moment de la déclaration). Côté URSSAF/CARMF : rien à régulariser, ni en 2026, ni en 2027.",
    certitude: "consensus",
    icon: "📅",
    theme: "vie-pratique",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-005", "PM-011", "PM-012", "PM-013"],
    relatedCases: ["DSCS", "DSDE"],
    relatedTerms: ["urssaf", "carmf", "rspm", "pamc", "regularisation-urssaf", "acomptes-trimestriels"],
  },
  {
    id: "RO-014",
    numero: 14,
    titre: "Fiscal ≠ Social : deux régimes indépendants, deux déclarations",
    description: "C'est probablement **la confusion la plus fréquente** chez les médecins libéraux. Le régime **fiscal** (Micro-BNC ou BNC réel) et le régime **social** (PAMC ou RSPM) sont **deux choses totalement indépendantes**. Le choix de l'un n'a aucune influence sur l'autre.\n\n**Côté fiscal** (DGFiP / impôts) → tu remplis la **2042-C-PRO** : case **5HQ** si tu es en micro-BNC, case **5QC** + liasse **2035** si tu es au réel. C'est ce qui calcule ton **impôt sur le revenu**.\n\n**Côté social** (URSSAF + CARMF) → tu remplis la **DSFU (ex DS-PAMC)** si tu es au PAMC, ou rien de spécifique si tu es au RSPM. C'est ce qui calcule tes **cotisations sociales** (maladie, retraite, allocations familiales, CSG/CRDS).\n\n**La règle d'or** : être en micro-BNC ne te dispense **JAMAIS** de remplir la DSFU si tu es au PAMC. Le cas qui piège le plus : la **remplaçante en micro-BNC + PAMC** (cas le plus fréquent quand l'URSSAF demande la bascule depuis le RSPM). Elle doit remplir **5HQ** *ET* **DSCS + DSAV**, pas l'un ou l'autre.\n\n**Variante titulaire avec remplaçants OU collaborateur libéral** : ton DSCS et ta 5HQ (ou 5QC) **ne sont PAS le même chiffre**. DSCS reste brut (avant la part reversée), 5HQ/5QC est nette (après pré-déduction de la rétrocession ou de la redevance). C'est l'asymétrie social/fiscal — voir RO-012.\n\n**Qui décide de quoi dans la DSFU ?**\n- **5HQ** (micro-BNC) ou **DSDE** (BNC réel) → **fixe le montant** de tes cotisations URSSAF + CARMF. C'est l'assiette.\n- **DSCS + DSAV** → ne fixent **rien** directement. Ils servent à calculer le **ratio DSAU = DSAV / DSCS**, qui décide si la CPAM prend en charge tes cotisations maladie (PCC) en secteur 1. **DSAU < 1** → PCC perdue, cotisations maladie quasi doublées (~0,1 % → ~8,5 % (taux 2026)). En pratique, viser **DSAU ≥ 0,9** comme marge de sécurité avant validation. Donc oui, DSCS = ton CA brut total — non, ça n'augmente pas tes cotisations.\n\n**Conséquence si tu ne remplis pas la DSFU** : taxation d'office URSSAF, appels CARMF forfaitaires (souvent surestimés), perte de la PCC, relances et majorations. 💡 Le module `Aide DSFU – volet PAMC` d'**Hippodoc** pré-remplit les 9 cases de la DSFU à partir de tes encaissements, en parallèle du module `Aide 2042` qui pré-remplit la 5HQ — pour que tu n'oublies ni l'un ni l'autre.",
    exemple: "Remplaçante en micro-BNC + PAMC, 100 % conventionné, 47 320 € encaissés en 2025 :\n• **5HQ** (impôts) = 47 320 €\n• **DSCS** (URSSAF/CARMF) = 47 320 €\n• **DSAV** (part conventionnée) = 47 320 €\n• **DSDE** (revenu brut social) = **vide** — l'URSSAF applique l'abattement 34 % toute seule sur DSCS, ne le fais surtout pas à sa place.\n• **DSAU**, **DSAT**, **DSAW** = 0 (pas d'activité hors convention, dépassements ou Secteur 2).",
    certitude: "confirmed",
    icon: "🧭",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-005", "PM-009", "PM-010", "PM-011", "PM-012", "PM-013"],
    relatedCases: ["5HQ", "5QC", "DSCS", "DSAV"],
    relatedTerms: ["micro-bnc", "bnc-reel", "pamc", "rspm", "ds-pamc"],
    relatedQuestions: ["QT-013", "QT-014", "QT-007", "QT-021", "QT-030", "QT-031"],
  },
  {
    id: "RO-015",
    numero: 15,
    titre: "RSPM + PDSA : ta 2042-C-PRO pré-remplie par les impôts est gonflée",
    description: "Si tu es **remplaçante au RSPM** et que tu fais de la **PDSA en zone déficitaire** (ZIP/ZAC), il y a un piège silencieux que **personne ne te dit** : ta déclaration **2042-C-PRO pré-remplie** par les impôts est **fausse** (gonflée).\n\n**Pourquoi ?** L'URSSAF télétransmet automatiquement tes revenus libéraux au fisc via une chaîne dite « simplifiée », mais cette télétransmission est **aveugle** : elle ne distingue **pas** la part PDSA exonérée d'IR (Art. 151 ter CGI — majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN). Résultat : la case **5HQ** (micro-BNC) ou **5QC** (réel) est pré-remplie avec ton **CA brut total**, comme si rien n'était exonéré.\n\n**Ce que tu dois faire** (chaque année et rétroactivement) :\n1. **Écrase** la case 5HQ (ou 5QC) pré-remplie avec le bon montant : CA brut **moins** PDSA exonéré brut.\n2. **Ne mets RIEN en 5HP.** Cette case est exclusivement réservée aux régimes zonés (ZFU-TE, ZRR/FRR, JEI — CGI Art. 1417). La PDSA ne s'y déclare **jamais**. Si tu y reportes la PDSA, tu déclenches un **double-comptage côté URSSAF** (revenu net social = 0,66 × 5HQ + DSFA + 5HP) et tu paies plus de cotisations que nécessaire.\n3. **Au PAMC uniquement** : reporte la PDSA exonérée nette (×0,66 en micro-BNC) en case **DSFA** (déclarant 1) ou **DSFB** (déclarant 2) de la DSFU (volet PAMC). Au RSPM, il n'y a aucune DSFU à remplir : les cotisations sont calculées automatiquement sur le CA déclaré au RSPM (qui inclut la PDSA brute, c'est normal — l'exonération est uniquement fiscale).\n4. **N'informe SURTOUT PAS le RSPM** de la correction fiscale : c'est une rectification **purement fiscale** auprès de ton SIP (service des impôts des particuliers), via la messagerie sécurisée de ton espace fiscal particulier. Le RSPM continue de cotiser sur le CA total (les majorations PDSA sont exonérées d'IR mais **pas** de cotisations sociales).\n5. Si tu as fait de la PDSA en RSPM en **2023 ou 2024**, dépose une **déclaration rectificative** via cette même messagerie tant que les années ne sont pas prescrites (3 ans). Tu peux récupérer plusieurs centaines, voire milliers, d'euros payés à tort.\n\n💡 **Hippodoc calcule automatiquement** le bon montant à reporter en 5HQ à partir de tes encaissements PDSA. Le module `Aide 2042` affiche un encart d'alerte dédié si tu es en RSPM avec de la PDSA exonérée, et le module `Aide DSFU – volet PAMC` pré-remplit DSFA si tu es au PAMC.\n\n⚠️ **Attends-toi à une incompréhension** de l'agent du fisc : la chaîne automatisée URSSAF→DGFiP rend ces rectifications « anormales » à leurs yeux. Ajoute une **mention expresse** justifiant l'exonération Art. 151 ter CGI et conserve les attestations de garde signées par le médecin coordinateur.",
    exemple: "Remplaçante RSPM micro-BNC, 27 480 € encaissés en 2025 dont 3 720 € de majorations PDSA en zone déficitaire (CRN/VRN/PRN).\n\n**Pré-rempli (faux)** : 5HQ = 27 480 € → IR calculé sur 27 480 × 66 % ≈ 18 137 €.\n**Correct (à écraser)** :\n• 5HQ = 27 480 − 3 720 = **23 760 €**\n• 5HP = **0** (PDSA n'y va jamais — case réservée ZFU/ZRR/JEI)\n• Pas de DSFA non plus (tu es au RSPM, pas au PAMC)\n→ IR calculé sur 23 760 × 66 % ≈ 15 682 €.\n\n**Économie** : ~736 € d'IR à TMI 30 % (et ce, chaque année).\n\n**Variante PAMC micro-BNC** (mêmes chiffres) : 5HQ = 23 760 €, 5HP = 0, **DSFA = 3 720 × 0,66 ≈ 2 455 €**. Pas de double-comptage URSSAF.\n\n**Variante PAMC BNC réel** : voir RO-006 Cas 4 (PDSA → ligne CI → RBS → DSDE/DSDG, **jamais DSFA**).",
    certitude: "confirmed",
    icon: "🚨",
    theme: "declarations",
    profilsConcernes: ["PM-002", "PM-005", "PM-008", "PM-012"],
    relatedCases: ["5HQ", "5QC", "DSFA", "CI", "DSDG"],
    relatedTerms: ["rspm", "pdsa", "micro-bnc"],
    relatedQuestions: ["QT-020", "QT-027", "QT-028"],
  }
];

export const caseopedia: CaseInfo[] = [
  {
    id: "CASE-001",
    code: "5HQ",
    nom: "Revenus Imposables (Micro-BNC)",
    formulaire: "2042 C PRO",
    description: "Montant brut total des recettes issues de l'activité libérale, avant l'abattement de 34 % mais APRÈS déduction des rétrocessions versées (CGI Art. 102 ter), des revenus exonérés (ZFU, FRR, JEI **et** PDSA) et de l'ajustement ANCV (×1,515, plafond fiscal 1 823 € en 2026). Représente le CA imposable soumis à l'abattement forfaitaire.",
    quiRemplit: "Médecin en micro-BNC",
    erreurFrequente: "Inclure les revenus exonérés, déduire l'abattement de 34% avant de reporter, ou oublier de pré-déduire les rétrocessions versées.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Déclarer le montant AVANT abattement 34 % (appliqué automatiquement par l'administration), mais APRÈS déduction des rétrocessions versées, revenus exonérés (ZFU/FRR/JEI **et** PDSA) et ajustement ANCV. Pour les chèques vacances ANCV, appliquer la règle spécifique (CA − CV × 1,515, dans la limite d'un plafond fiscal de 1 823 € en 2026). ⚠️ Le seuil micro-BNC (77 700 € en 2025 / 83 600 € en 2026) se calcule sur le CA TOTAL brut, incluant les revenus exonérés (ZFU et PDSA), même si ceux-ci sont retirés de la case 5HQ.",
    relatedTerms: ["micro-bnc", "retrocession", "redevance-collaboration", "comptabilite-caisse", "versement-liberatoire", "declarant-1-vs-2"],
    relatedQuestions: ["QT-013", "QT-014", "QT-020", "QT-021", "QT-029", "QT-039", "QT-041"],
    relatedFiches: ["regle-RO-002", "regle-RO-003", "regle-RO-006", "regle-RO-014", "pepite-PC-003", "zone-ZG-009", "pepite-PC-008"],
  },
  {
    id: "CASE-002",
    code: "5QC",
    nom: "Bénéfice net (BNC)",
    formulaire: "2042 C PRO",
    description: "Bénéfice net provenant de l'activité non commerciale, tel que calculé dans la déclaration 2035, après déduction des charges réelles. Si tu as souscrit des chèques vacances ANCV, il faut en déduire le montant (jusqu'à 1 823 € en 2026). Formule : 5QC = case CP de la 2035 − chèques vacances (max 1 823 €). Pour un couple, le déclarant 2 utilise la case 5RC.",
    quiRemplit: "Médecin en régime réel (BNC)",
    erreurFrequente: "Non-concordance avec le bénéfice de la 2035, oubli de la déduction des chèques vacances ANCV, oubli de certaines réintégrations.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Doit correspondre au bénéfice de la 2035 (case CP) moins les chèques vacances ANCV (jusqu'à 1 823 € en 2026). Sans CV, 5QC = CP directement. Pour un couple, le conjoint médecin utilise la case 5RC.",
    relatedTerms: ["bnc-reel", "cerfa-2035", "cerfa-2042", "ancv", "deficit-reportable", "declarant-1-vs-2"],
    relatedQuestions: ["QT-004", "QT-024"],
    relatedFiches: ["regle-RO-007", "regle-RO-011", "pepite-PC-013", "pepite-PC-001", "pepite-PC-011"],
  },
  {
    id: "CASE-003",
    code: "5HP",
    nom: "Revenu exonéré régimes zonés ZFU-TE / FRR / JEI (Net) — micro-BNC",
    formulaire: "2042 C PRO",
    description: "Montant NET exonéré d'IR pour les activités en **régime zoné uniquement** : ZFU-TE (CGI Art. 44 octies A), ZRR/FRR (Art. 44 quindecies / 44 quindecies A) ou statut JEI (Art. 44 sexies-0 A). En micro-BNC : revenus exonérés bruts × 0,66 (l'administration applique elle-même l'abattement de 34 %). En BNC réel : voir 5QB. Plafonds : ZFU 50 000 €/an de bénéfice exonéré, dégressif sur 8 ans (5 ans à 100 %, puis 60 %/40 %/20 %) ; FRR 300 000 € sur 3 ans glissants (titulaires/collaborateurs uniquement, pas les remplaçants). **Le plafond est proratisé au nombre de mois d'exonération effective l'année d'installation ou de basculement de palier** (CGI Art. 49 K annexe III ; CE 18/07/2018 n° 412142) — exemple chiffré dans QT-049. ⚠️ **La PDSA exonérée Art. 151 ter ne va JAMAIS en 5HP.** Elle se déclare en réduction de 5HQ + report en DSFA/DSFB sur la DSFU (volet PAMC) (au PAMC).",
    quiRemplit: "Médecin installé en ZFU-TE, FRR/ZRR ou bénéficiant du statut JEI (et remplaçant en ZFU-TE)",
    erreurFrequente: "Reporter la PDSA exonérée en 5HP : c'est l'erreur n°1, qui entraîne un **double-comptage URSSAF** (revenu net social = 0,66 × 5HQ + DSFA + 5HP) et fait exploser tes cotisations. Autre erreur : reporter le montant brut au lieu du net (oubli du ×0,66 en micro-BNC). **Oublier de proratiser le plafond l'année d'installation** = redressement quasi systématique (cf. QT-049).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Ce montant est un revenu NET. En micro-BNC : montant exonéré brut × 0,66 (régime zoné uniquement). **En BNC réel, n'utilise pas 5HP — c'est la case 5QB qu'il faut remplir** (bénéfice exonéré net calculé sur la 2035). **Pour la PDSA, n'utilise PAS cette case** — retire les majorations exonérées de 5HQ et reporte le net (×0,66) en DSFA/DSFB sur la DSFU (volet PAMC). Pour la ZFU dégressive, applique le taux d'exonération de l'année (100/60/40/20 %) au bénéfice avant ×0,66.",
    relatedTerms: ["zfu-te", "zfrr", "micro-bnc"],
    relatedQuestions: ["QT-020", "QT-027", "QT-049"],
    relatedFiches: ["regle-RO-006", "zone-ZG-007"],
  },
  {
    id: "CASE-004",
    code: "5HY",
    nom: "Revenu exonéré (dispositifs résiduels — déclaration contrôlée)",
    formulaire: "2042 C PRO",
    description: "Case du **régime de la déclaration contrôlée (réel)** dédiée à des dispositifs d'exonération résiduels (certains cas FRR/JEI atypiques) qui ne passent ni par 5QB ni par les autres cases dédiées. **Très peu utilisée en pratique** et **JAMAIS auto-poussée par le wizard Hippodoc** : elle n'apparaît dans ta checklist que si tu l'ajoutes manuellement après avis d'un AGA ou d'un expert-comptable.",
    quiRemplit: "Médecin en BNC réel bénéficiant d'un dispositif d'exonération résiduel non couvert par 5QB (rare — confirmation AGA / expert-comptable recommandée)",
    erreurFrequente: "ATTENTION : Ne JAMAIS remplir cette case si tu as déjà renseigné 5HQ ou 5QC pour les mêmes revenus. C'est la cause n°1 de double imposition. Et 5HY n'est PAS le \"brut\" de 5HP — les deux cases couvrent des régimes différents (5HP = micro-BNC, 5HY = déclaration contrôlée). Ne JAMAIS y reporter la PDSA exonérée (qui se gère via réduction de 5HQ + DSFA/DSFB) ni la ZFU classique (5HP en micro, 5QB en réel).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Cette case est rarement à remplir. Vérifie que tu ne doubles pas tes revenus. **Si tu es en micro-BNC** et en ZFU/FRR, c'est **5HP** qu'il faut utiliser, pas 5HY. **Si tu es en BNC réel** et en ZFU/FRR, c'est **5QB**. Pour la PDSA, c'est **DSFA/DSFB** au PAMC (micro-BNC) ou **ligne CI de la 2035-B** en réel, jamais 5HY ni 5HP. En FRR (ex-ZRR), le plafond est de 300 000 € sur 3 ans glissants.",
    relatedTerms: ["zfrr", "zfu-te"],
    relatedQuestions: ["QT-027"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "CASE-005",
    code: "DSCS",
    nom: "Total Recettes brutes non salariées",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Somme des recettes brutes tirées des activités non salariées, conventionnées et autres. Représente l'ensemble du Chiffre d'Affaires y compris gains divers (DPC, ROSP, forfait MT, forfait structure, ACI, indemnités garde fixe EHPAD, expertises, primes ARS). **Si tu es titulaire avec des remplaçants OU collaborateur libéral** : DSCS = CA AVANT rétrocessions versées (titulaire) ou AVANT redevance versée au titulaire (collaborateur — L16/BG). Dans ces deux cas, **DSCS sera supérieur à ta 5HQ / 5QC** (qui, elles, sont nettes de la part reversée — voir RO-012).\n\n**Exemple chiffré** : 92 000 € de C/CS conventionnés + 945 € DPC + 1 200 € ROSP + 800 € forfait MT + 8 000 € HN/expertises → **DSCS = 102 945 €** (tout entre, y compris HN). Le tri conventionné/non-conventionné se fait ensuite dans DSAV.\n\n**Cas collaborateur micro-BNC** : 80 000 € encaissés, 8 000 € de redevance versée → **DSCS = 80 000 €**, 5HQ = 72 000 €. Les deux cases ne sont PAS le même chiffre, c'est normal (CGI Art. 102 ter côté fiscal, brut côté social).",
    quiRemplit: "Médecin en régime PAMC (y compris micro-BNC)",
    erreurFrequente: "Confondre avec le bénéfice, laisser la case vide en micro-BNC, oublier les gains divers (DPC, ROSP, forfait MT), ou pour les titulaires avec remplaçants / collaborateurs libéraux : mettre le CA après rétrocessions versées / redevance de collaboration au lieu d'avant.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Même en micro-BNC, tu dois remplir DSCS avec ton CA brut total incluant **tous les gains conventionnés et non conventionnés** : DPC, ROSP, forfait médecin traitant, forfait structure, ACI, indemnités garde fixe, mais aussi HN, expertises et dépassements. Pour les **titulaires (avec remplaçants)** ou les **collaborateurs libéraux** : mettre le CA **AVANT** rétrocessions versées / redevance de collaboration. La part reversée est déduite côté fiscal (L21/BG ou L16/BG en réel, pré-déduite avant 5HQ en micro-BNC), **jamais côté social** — voir **RO-012**. Toute case DSCS inférieure au SNIR peut déclencher un contrôle — mais si ton SNIR est inférieur à ta compta réelle (cas fréquent), c'est **DSCS qui l'emporte** : voir QT-046. 💡 Le module `Aide DSFU – volet PAMC` d'**Hippodoc** la calcule à partir de tes encaissements.",
    relatedTerms: ["pamc", "ds-pamc", "snir", "recettes-brutes-nettes", "tresorerie", "patientele", "resultat-fiscal", "declarant-1-vs-2"],
    relatedQuestions: ["QT-004", "QT-007", "QT-010", "QT-019", "QT-021", "QT-022", "QT-046"],
    relatedFiches: ["regle-RO-002", "regle-RO-012", "regle-RO-014", "pepite-PC-010", "zone-ZG-010"],
  },
  {
    id: "CASE-006",
    code: "DSAV",
    nom: "Recettes tirées d'actes conventionnés",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant des recettes brutes issues des actes réalisés dans le cadre de la convention médicale (= DSCS − HN/expertises non conventionnées). Si toute l'activité est conventionnée, ce montant est généralement identique à DSCS.\n\n**Exemple chiffré** : DSCS = 100 000 € dont 8 000 € HN/expertises → **DSAV = 92 000 €**, **DSAU = 0,92**. En secteur 1 → PCC perdue (DSAU < 1 strictement), cotisations maladie quasi doublées.",
    quiRemplit: "Médecin en régime PAMC",
    erreurFrequente: "Se fier à un pré-remplissage erroné (ex: SNIR) sans le corriger avec le CA réel conventionné. Ne pas inclure les revenus de remplaçants qui sont des actes conventionnés. Soustraire les rétrocessions versées (à ne PAS faire — elles restent dans DSCS comme dans DSAV).",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Si 100% de l'activité est conventionnée, ce montant doit être égal à DSCS. Corriger si le pré-remplissage du SNIR est inférieur au CA réel — la vérité comptable l'emporte sur le SNIR pré-rempli (voir QT-046). ⚠️ **Impact si DSAV < DSCS (ratio DSAU < 1)** : en **secteur 1**, tu perds la **PCC** (Prise en Charge des Cotisations maladie par la CPAM) — tes cotisations maladie passent de ~0,1 % à ~8,5 % (taux 2026 après réforme), soit cotisations quasi doublées. En **secteur 2 OPTAM**, l'erreur est moins grave (pas de PCC à perdre, juste prime de performance et aide à l'assistant) mais reste à corriger. **Règle officielle** : la PCC tombe dès DSAU < 1 strictement. **Marge de sécurité avant validation** : viser DSAU ≥ 0,9 (en dessous, vérifier qu'aucun revenu conventionné n'a été mal classé en gains divers).",
    relatedTerms: ["pamc", "secteur-1-2", "snir", "declarant-1-vs-2"],
    relatedQuestions: ["QT-004", "QT-022", "QT-046"],
    relatedFiches: ["regle-RO-001", "regle-RO-012", "regle-RO-014", "pepite-PC-015"],
  },
  {
    id: "CASE-007",
    code: "DSAW",
    nom: "Dont dépassements d'honoraires",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Part des recettes brutes correspondant aux dépassements d'honoraires réalisés. Pour un médecin secteur 1, ce montant est généralement de 0.",
    quiRemplit: "Médecin en régime PAMC, Secteur 2",
    erreurFrequente: "Négliger de le renseigner pour les Secteur 2, ou le remplir pour les Secteur 1.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Vérifier la cohérence avec le statut conventionnel et l'activité réelle.",
    relatedTerms: ["secteur-1-2", "optam"],
    relatedQuestions: ["QT-038"],
    relatedFiches: ["zone-ZG-005"],
  },
  {
    id: "CASE-008",
    code: "DSAU",
    nom: "Ratio conventionné",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Ratio DSAV / DSCS calculé automatiquement. **C'est lui qui décide** si la CPAM prend en charge tes cotisations maladie (PCC) en secteur 1 : **DSAU = 1** → PCC complète ; **DSAU < 1** → PCC perdue, cotisations maladie quasi doublées. Il ne sert qu'à ça — il ne fixe ni l'impôt ni l'assiette des cotisations (c'est 5HQ en micro-BNC, ou DSDE en BNC réel).",
    quiRemplit: "Calculé automatiquement",
    erreurFrequente: "Tenter de le modifier manuellement.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Vérifier la cohérence de DSAV et DSCS pour s'assurer que ce ratio est correct. **Cas fréquent** : DSAU à 0 ou 0,3 alors que tu fais 100 % de remplacements conventionnés. Cause classique : tes **remplacements ont été comptabilisés en gains divers** par ton comptable au lieu de revenus conventionnés. À corriger en repassant DSAV = DSCS si tout est conventionné. Voir aussi le warning DSAV (PCC perdue en secteur 1).",
    relatedTerms: ["pamc", "pcc"],
    relatedQuestions: ["QT-022", "QT-030", "QT-037"],
    relatedCases: ["DSAV", "DSCS"],
    relatedFiches: ["pepite-PC-015"],
  },
  {
    id: "CASE-009",
    code: "DSDE",
    nom: "Revenu brut social (Entreprise Individuelle)",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Revenu brut social servant de base au calcul des cotisations sociales pour les entreprises individuelles. Correspond à la case DD de la 2035. L'URSSAF applique ensuite un abattement de 26% (plafonné à 130% du PASS pour les hauts revenus / Secteur 2).",
    quiRemplit: "Médecin en régime réel (BNC) uniquement",
    erreurFrequente: "Confondre avec le bénéfice imposable, ne pas le renseigner en régime réel, ou le remplir à tort en micro-BNC.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "En micro-BNC, ne PAS remplir DSDE : laisser la case vide. L'abattement de 34% est appliqué automatiquement sur le CA déclaré en DSCS. En BNC réel, ce montant est calculé via la formule officielle de la 2035 : DD = CE − CN + BK + BV + CS + AW + CU + CI + CO + DG + CJ + DH + DE − DB. Détail des cases 2026 : CE (total produits), CN (total charges), BK (cotisations sociales personnelles + Madelin/PER), BV (CSG déductible), CS (exo ZFU), AW (exo entreprise nouvelle), CU (exo innovante), CI (exo PDSA/zones déficitaires), CO (majoration 25% non adhérents - supprimée depuis 2023), DG (exo forfait 3% conventionnel), CJ (exo ZFRR/FRR), DH (exo groupe III 3 050€), DE (réintégrations diverses), DB (IJ Madelin à déduire). Plus simplement : Ligne 1 (recettes) + ligne 6 (gains divers) − charges + réintégrations. Si ton comptable n'a pas rempli DD, utilise le module Aide 2035 d'Hippodoc.\n\n💡 **Remboursement URSSAF reçu pendant l'année** : il réduit BK (si remboursement N pour N) ou s'ajoute en gains divers AB (si remboursement N pour N-1+). Voir QT-045 pour le détail comptable (comptes 646/772, ventilation CSG).",
    relatedCases: ["DD", "2035"],
    relatedTerms: ["bnc-reel", "pamc", "cfe", "cet", "cfp", "cotisation-maladie", "allocations-familiales", "asv", "crds", "rcp", "dpc", "cam-3-25", "das-2", "net-imposable", "resultat-fiscal", "declarant-1-vs-2", "remboursement-urssaf"],
    relatedQuestions: ["QT-004", "QT-045"],
    relatedFiches: ["regle-RO-014", "zone-ZG-005"],
  },
  {
    id: "CASE-010",
    code: "DSDX",
    nom: "IJ versées par la CPAM",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant des indemnités journalières de la CPAM (maladie, maternité/paternité, forfaits) perçues. Ce montant est souvent pré-rempli et peut être source d'erreur ou d'incompréhension, notamment en cas d'écart avec l'attestation fiscale de l'Ameli ou de mélange avec d'autres types d'IJ.\n\n⚠️ **Bug national connu campagne 2026** : la CPAM transmet aux impôts un montant **brut** (avant précompte CSG/CRDS) au lieu du **net** attendu en DSDX. La case est **non modifiable** sur impots.gouv.fr — il faut valider la déclaration telle quelle puis faire une réclamation URSSAF avec le relevé fiscal Ameli. Voir QT-043.",
    quiRemplit: "Médecin ayant perçu des IJ CPAM",
    erreurFrequente: "Montants pré-remplis erronés, confusion avec les IJ Madelin ou prévoyance privée, difficulté à rectifier.",
    certitude: "grey_zone",
    categorie: "social",
    conseil: "Comparer ce montant avec l'attestation fiscale fournie par Ameli. En cas d'écart manifeste (bug 2026 fréquent), valider la déclaration et envoyer une réclamation à l'URSSAF via messagerie sécurisée avec le relevé fiscal Ameli — la régularisation sociale se fera ensuite. Aucun impact côté IR. Attention, même non imposables en micro-BNC, les IJ CPAM sont soumises à cotisations sociales. Note : la case DSDC (réintégration automatique) est calculée par l'URSSAF à partir de DSDX — tu n'as pas à la remplir toi-même.",
    relatedTerms: ["cpam", "ds-pamc", "dsdx-dsdy"],
    relatedQuestions: ["QT-002", "QT-006", "QT-040", "QT-041", "QT-043"],
    relatedFiches: ["regle-RO-004", "pepite-PC-014", "zone-ZG-001", "zone-ZG-016"],
  },
  {
    id: "CASE-011",
    code: "DSCN",
    nom: "Chèques Vacances ANCV",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant TOTAL des chèques vacances ANCV commandés sur l'année (sans plafonner toi-même). L'URSSAF applique automatiquement l'exonération de cotisations URSSAF + CARMF dans la limite de 547 € (2026). La CSG-CRDS reste due sur ces 547 € — calcul automatique, rien à ajouter.\n\n⚠️ **À ne pas inscrire dans DSCN** : les **frais d'ouverture du compte ANCV** et les **frais d'envoi/port** ne se reportent **PAS** ici — ils vont en charges déductibles de la 2035-A (ligne L30 « Autres frais divers de gestion »).",
    quiRemplit: "Médecin ayant souscrit des chèques vacances ANCV",
    erreurFrequente: "Plafonner toi-même à 547 € au lieu d'inscrire le montant total commandé. Renseigner un montant net. Inclure les frais d'ouverture/d'envoi dans DSCN (à mettre en charges 2035-A à la place).",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Indiquer le montant brut total commandé (ex : 1 823 €) — **uniquement la valeur faciale des chèques**, jamais les frais annexes. L'URSSAF déduit l'exo sociale dans la limite de 547 € (2026). Le plafond fiscal (1 823 € en 2026, = 1 SMIC mensuel brut) est totalement indépendant et se gère côté 5HQ ou 5QC. Les frais d'achat ANCV (création de compte, frais d'envoi, commission) sont déductibles à 100 % en charges (ligne L30 de la 2035-A en réel ; noyés dans l'abattement 34 % en micro-BNC). Payer avec le compte pro pour la traçabilité.",
    relatedTerms: ["ancv"],
    relatedQuestions: ["QT-026"],
    relatedFiches: ["regle-RO-005", "regle-RO-011"],
  },
  {
    id: "CASE-012",
    code: "DSFA",
    nom: "PDSA exonérée (volet social PAMC)",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Case de la DSFU (volet PAMC) pour reporter la **PDSA Art. 151 ter exonérée d'IR mais soumise à cotisations sociales** en **MICRO-BNC PAMC uniquement** (majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN, plafond 60 jours). Montant **NET** = brut × 0,66. DSFA = déclarant 1, DSFB = déclarant 2.\n\n⚠️ **La ZFU micro-BNC ne passe PAS par DSFA** : le volet social s'appuie sur DSCS (recettes brutes totales, ZFU comprise). DSFA est strictement réservée à la PDSA.\n\n⚠️ **En BNC réel, on ne touche JAMAIS à DSFA pour la PDSA** : la déduction se fait en **ligne CI** (cadre 7 « Divers à déduire ») de la 2035-B, et la formule du **RBS** (Cadre 8) la réintègre automatiquement en **DSDE** (positif) ou **DSDG** (négatif).",
    quiRemplit: "Médecin au PAMC en MICRO-BNC ayant de la PDSA exonérée Art. 151 ter (gardes en zone déficitaire, plafond 60 jours)",
    erreurFrequente: "**Erreur n°1** : Confondre DSFA avec la case 5HP de la 2042-C-PRO. La PDSA exonérée se déclare en DSFA (micro), **JAMAIS** en 5HP (réservée ZFU/ZRR/JEI) — sinon double-comptage URSSAF.\n**Erreur n°2** : Remplir DSFA en **BNC réel** pour la PDSA. Au réel, la PDSA passe par CI → RBS → DSDE/DSDG ; remplir DSFA en plus = **double cotisation**.\n**Erreur n°3** : Y reporter la ZFU exonérée — la ZFU micro-BNC est déjà comprise dans DSCS (recettes brutes), aucune ligne DSFA à saisir pour elle.\n**Erreur n°4** : Reporter le montant brut au lieu du net (oubli du ×0,66 en micro-BNC).",
    certitude: "confirmed",
    categorie: "social",
    conseil: "**En micro-BNC**, remplis DSFA dès que tu as de la PDSA exonérée Art. 151 ter, **toujours en NET** (brut × 0,66) — l'URSSAF applique elle-même l'abattement 34 %. C'est la seule case qui informe l'URSSAF de la ventilation pour le calcul du revenu net social transmis à la CARMF.\n\n**En BNC réel pour la PDSA : ne touche pas à DSFA.** La réintégration sociale se fait toute seule via la ligne **CI** (2035-B) → formule du **RBS** → **DSDE/DSDG**.\n\n**Pour la ZFU** : aucune saisie DSFA — la ZFU brute est déjà incluse dans DSCS (recettes totales), l'URSSAF cotise dessus normalement (la ZFU exonère l'IR, pas les cotisations sociales).\n\nNe mets jamais la PDSA en **5HP** (micro) ni en **5QB** (réel) — réservées aux régimes zonés. 💡 Le module `Aide DSFU – volet PAMC` d'Hippodoc pré-remplit DSFA automatiquement à partir de tes encaissements PDSA.",
    relatedTerms: ["zfu-te", "pdsa", "declarant-1-vs-2"],
    relatedQuestions: ["QT-020", "QT-048"],
    relatedFiches: ["regle-RO-006", "pepite-PC-003", "zone-ZG-006"],
  },
  {
    id: "CASE-013",
    code: "2035",
    nom: "Déclaration de Revenu des Professions Non Commerciales",
    formulaire: "2035",
    description: "Liasse fiscale détaillée pour les Libéraux au régime réel. La 2035-A récapitule les postes clés : AA (CA total conventionné avant rétro), AF (gains divers), CE (total excédent), CN (total excédent et insuffisances), BK (charges sociales personnelles / Madelin/PER), BV (CSG déductible), BS (cotisations sociales obligatoires), BQ (frais de repas), AW (exo entreprise nouvelle), CS (exo ZFU), CU (exo entreprise innovante), CI (exo zones déficitaires), DG (exo forfait 3%), CJ (exo ZFRR), DH (exo groupe III), et le résultat final en CP (bénéfice) ou CR (déficit). La partie travailleurs indépendants contient la case DD (Revenu Brut Social) servant de base aux cotisations URSSAF/CARMF.",
    quiRemplit: "Médecin en régime réel (BNC)",
    erreurFrequente: "Erreurs de catégorisation des charges, omission de certains éléments (amortissements, réintégrations), difficultés avec le calcul du Revenu Social Brut (DD). Oubli fréquent de la réintégration des cotisations Madelin non déductibles.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Nécessite une comptabilité rigoureuse. Les postes les plus importants à vérifier : AA (recettes = DSCS), BK (Madelin/PER plafonnés à 10% du bénéfice), BV (CSG déductible — attention, ce n'est PAS le loyer professionnel), et la case DD (formule complexe : CE - CN + BK + BV + CS + AW + CU + CI + CO + DG + CJ + DH + DE - DB). Utiliser un logiciel comptable ou l'aide d'un expert-comptable/AGA est fortement recommandé.",
    relatedTerms: ["bnc-reel", "cerfa-2035", "aga", "amortissement", "charges-deductibles", "deficit-reportable", "net-imposable", "resultat-fiscal", "scm-scp"],
    relatedQuestions: ["QT-003", "QT-004", "QT-005", "QT-016", "QT-024", "QT-025"],
    relatedFiches: ["regle-RO-007", "regle-RO-008", "regle-RO-010", "pepite-PC-013", "pepite-PC-001"],
  },
  {
    id: "CASE-014",
    code: "DD",
    nom: "Revenu Brut Social (2035)",
    formulaire: "2035",
    description: "Case sur la liasse 2035 (partie travailleurs indépendants) qui agrège les éléments du bénéfice pour le calcul du Revenu Social Brut, servant de base aux cotisations sociales. Formule complexe à utiliser.",
    quiRemplit: "Médecin en régime réel (BNC)",
    erreurFrequente: "Non remplie ou mal calculée, car la formule est complexe et demande une bonne compréhension des postes de la 2035.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Utiliser une calculette en ligne pour s'assurer du bon calcul (CE - CN + BK + BV + CS + AW + CU + CI + CO + DG + CJ + DH + DE - DB).",
    relatedTerms: ["bnc-reel", "ds-pamc"],
    relatedQuestions: ["QT-004", "QT-005", "QT-023"],
    relatedFiches: ["regle-RO-014", "pepite-PC-014"],
  },
  {
    id: "CASE-016",
    code: "DSEC",
    nom: "Rémunérations brutes (gérant SEL)",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant brut de la rémunération de gérance perçue par le dirigeant d'une SEL. Depuis 2024, cette rémunération est catégorisée en BNC (et non plus en traitements et salaires).",
    quiRemplit: "Gérant de SELARL/SELAS",
    erreurFrequente: "Reporter le net au lieu du brut, ou oublier de reclasser la rémunération en BNC depuis la réforme 2024.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Reporter le montant brut, avant prélèvements sociaux. Ce montant alimente le calcul des cotisations URSSAF et CARMF via la formule société.",
    relatedTerms: ["bnc", "dsdi-gerance-sel"],
    relatedQuestions: ["QT-017"],
    relatedFiches: ["zone-ZG-004"],
  },
  {
    id: "CASE-017",
    code: "DSSC",
    nom: "Dividendes versés au-delà de 10% du capital",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant des dividendes versés par la SEL/SPFPL au gérant qui excèdent 10% du capital social. Cette fraction est soumise aux cotisations sociales URSSAF et CARMF au même titre que la rémunération.",
    quiRemplit: "Gérant de SEL percevant des dividendes",
    erreurFrequente: "Oublier de déclarer les dividendes > 10% du capital, ce qui entraîne un rappel de cotisations avec pénalités.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Seule la fraction au-delà de 10% du capital social est à déclarer ici. Les dividendes en dessous de ce seuil sont soumis au PFU (flat tax 30%) et ne concernent pas l'URSSAF.",
    relatedTerms: ["dividendes-sel-10pct", "dsdi-gerance-sel"],
    relatedQuestions: ["QT-017"],
    relatedFiches: ["zone-ZG-004"],
  },
  {
    id: "CASE-018",
    code: "8UZ",
    nom: "Crédit d'impôt famille (CESU pré-financés)",
    formulaire: "2042",
    description: "Permet de bénéficier d'un crédit d'impôt de 25% sur les CESU pré-financés via le compte professionnel, pour la garde d'enfants ou les services à la personne. Cumulable avec les chèques-vacances.",
    quiRemplit: "Tout médecin libéral ayant acheté des CESU pré-financés via son compte pro",
    erreurFrequente: "Confondre les CESU pré-financés (crédit 25% via l'entreprise, case 8UZ) avec les CESU déclaratifs personnels (crédit 50% en case 7DB, plafond 12 000€/an). Les deux coexistent mais ne se cumulent pas sur les mêmes dépenses.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Calculer 25% du montant des CESU pré-financés et reporter en 8UZ. Nécessite de remplir les formulaires 2069-FA-SD (déclaration spéciale) et 2069-RCI-SD (via 'ajouter une déclaration' sur impots.gouv, chercher 'famille'). Plafond du crédit : 1 830€/an/bénéficiaire.",
    relatedTerms: ["ir"],
    relatedQuestions: ["QT-026"],
    relatedFiches: ["pepite-PC-006"],
  },
  {
    id: "CASE-019",
    code: "4BE",
    nom: "Revenus fonciers micro-foncier (loyer pro à domicile)",
    formulaire: "2042",
    description: "Si tu te verses un loyer professionnel depuis ton domicile personnel, ce loyer déduit en charge sur la 2035 doit être déclaré en miroir comme revenu foncier. La case 4BE est pour le régime micro-foncier (abattement 30%, plafond 15 000€/an).",
    quiRemplit: "Médecin déduisant un loyer pro de son domicile",
    erreurFrequente: "Déduire le loyer en charge professionnelle sans le déclarer en revenu foncier en miroir. C'est l'oubli le plus fréquent et le plus risqué en contrôle.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "L'avantage net est souvent modeste (quelques centaines d'euros/an) mais réel. Faire estimer le m² par un agent immobilier pour justifier le montant. En 4BA si régime réel foncier. Propriétaire avec emprunt : déduire aussi la quote-part d'intérêts et de taxe foncière. ⚠️ L'avantage est surtout pour les locataires. Pour les propriétaires sans emprunt, l'intérêt est très limité (pas de 'loyer' à se verser à soi-même).",
    relatedTerms: ["foncier-micro", "scm-scp"],
    relatedQuestions: ["QT-018"],
    relatedFiches: ["zone-ZG-002"],
  },
  {
    id: "CASE-020",
    code: "1AS",
    nom: "Pensions de retraite (CARMF, régimes complémentaires)",
    formulaire: "2042",
    description: "Case **1AS (déclarant 1) / 1BS (déclarant 2)** de la 2042 (rubrique « Pensions, retraites et rentes ») pour les **pensions de retraite** versées par la CARMF (RB, RC, ASV) ou tout régime de retraite. Abattement 10 % automatique plafonné à 4 439 €/foyer pour les revenus 2025.\n\n⚠️ **Distinction clé** : 1AS = pensions de retraite uniquement.\n• Une **rente d'invalidité permanente CARMF** → case **1AZ** (voir CASE-032), pas 1AS.\n• Une **IJ CARMF d'incapacité temporaire** (Madelin obligatoire) → BNC gain divers ligne **AF** de la 2035-A en réel ou recettes **5HQ** en micro-BNC — **jamais** en 1AS ni 1AZ.",
    quiRemplit: "Médecin retraité ou en cumul emploi-retraite percevant une pension CARMF.",
    erreurFrequente: "Confondre 1AS (retraite) avec 1AZ (invalidité permanente). Y reporter à tort une IJ CARMF d'incapacité temporaire (qui relève du BNC, ligne AF).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Pension de retraite CARMF → 1AS. Rente d'invalidité permanente CARMF → 1AZ (CASE-032). IJ CARMF d'incapacité temporaire → BNC (AF en réel ou 5HQ en micro). Abattement 10 % automatique.",
    relatedCases: ["1AZ"],
    relatedTerms: ["carmf", "asv"],
    relatedQuestions: ["QT-034"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "CASE-021",
    code: "1AJ",
    nom: "Traitements et salaires (NON utilisée pour IJ CPAM en 2026)",
    formulaire: "2042",
    description: "Case 1AJ = traitements et salaires perçus au titre d'un emploi salarié (médecin hospitalier, vacations salariées, etc.). Doctrine 2026 (BOI-BNC-CHAMP-10-30-10 + notice 2035 DGFiP 2026) : les IJ CPAM hors ALD perçues au titre d'une activité libérale NE SE DÉCLARENT PLUS en 1AJ. En BNC réel, elles vont en AF (gains divers 2035) → 5QC + DB cadre 8 + DSDX. En micro-BNC, elles sont non imposables — uniquement DSDX pour le social.",
    quiRemplit: "Médecin percevant un véritable salaire (contrat de travail salarié)",
    erreurFrequente: "Y reporter les IJ CPAM perçues au titre de l'activité libérale — c'était toléré historiquement mais n'est plus la doctrine en 2026. Pour les IJ libérales : voir QT-040 (réel) ou QT-041 (micro-BNC).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Réserver 1AJ aux salaires nets imposables d'un véritable contrat salarié (hôpital, centre en mode salarié). Pour les IJ CPAM perçues au titre du libéral : voir cases AF + DB + DSDX (réel) ou DSDX seule (micro-BNC, non imposable IR).",
    relatedTerms: ["bnc-reel", "garde-hospitaliere", "cpam", "rpps", "carte-cps", "cnom", "licence-remplacement"],
    relatedQuestions: ["QT-006", "QT-008", "QT-011", "QT-012", "QT-015", "QT-029", "QT-040", "QT-041"],
    relatedFiches: ["regle-RO-004", "pepite-PC-002", "pepite-PC-014", "zone-ZG-016", "pepite-PC-009"],
  },
  {
    id: "CASE-022",
    code: "DSCZ",
    nom: "Autres revenus de remplacement — IJ Madelin (hors ALD) + AJPA (DSFU)",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Case **DSCZ (déclarant 1) / DSDZ (déclarant 2)** de la DSFU (volet PAMC) regroupant les **autres revenus de remplacement** non transmis automatiquement par la CPAM/CARMF : **IJ Madelin perçues hors ALD** + **AJPA** (Allocation Journalière du Proche Aidant versée par la CAF). Montant à reporter en **brut avant CSG/CRDS**, cumulé sur l'année.\n\n⚠️ DSCZ = revenus REÇUS, pas cotisations Madelin payées. Depuis la réforme 2026, les **cotisations Madelin versées** ne se déclarent plus dans aucune case sociale URSSAF (abattement forfaitaire 26 % sur le RBS).",
    quiRemplit: "Médecin PAMC ayant perçu des IJ Madelin hors ALD et/ou de l'AJPA (réel comme micro-BNC).",
    erreurFrequente: "Confondre DSCZ avec DSEM (épargne salariale IS, sans rapport). Confondre revenus reçus (DSCZ) et cotisations payées (plus aucune case depuis 2026). Oublier l'AJPA, qui se cumule avec les IJ Madelin dans la même case. Reporter du net au lieu du brut.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Reporte le **brut avant CSG/CRDS** des IJ Madelin hors ALD + AJPA, cumulé. **Exclus** les IJ Madelin liées à une ALD (hors assiette sociale). En BNC réel, les IJ Madelin sont déjà dans le bénéfice via les gains divers (AF) — pour neutraliser le double-comptage social, le brut doit être reporté sur la **ligne DB du Cadre 8** de la 2035-B (« Sommes à déduire pour la détermination du revenu brut social »). L'**Aide 2035 d'Hippodoc** gère ce report automatiquement dès que tes IJ Madelin sont en AF. En micro-BNC, DSCZ reste obligatoire malgré la non-déductibilité des cotisations Madelin (pas de mécanisme DB/Cadre 8 en micro). Source : Guide PAMC URSSAF v1.0 du 09/04/2026, sec. 6.5.",
    relatedTerms: ["madelin", "ajpa", "dscz-dsdz", "ds-pamc"],
    relatedQuestions: ["QT-006", "QT-023", "QT-036"],
    relatedFiches: ["pepite-PC-014", "pepite-PC-007"],
  },
  {
    id: "CASE-023",
    code: "DSAT",
    nom: "Recettes EHPAD/HAD/SSIAD/CMPP nettes",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Montant net des recettes provenant d'activités en EHPAD à tarif non opposable, HAD (Hospitalisation à Domicile), SSIAD (Service de Soins Infirmiers à Domicile) ou CMPP (Centre Médico-Psycho-Pédagogique). Ces recettes sont considérées comme non conventionnelles.",
    quiRemplit: "Médecin ayant des recettes EHPAD/HAD/SSIAD/CMPP",
    erreurFrequente: "Oublier de les isoler dans DSAT alors qu'elles impactent le ratio conventionné (DSAU).",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Ces recettes sont à déclarer en net. Elles sont déjà incluses dans le DSCS (CA total) mais doivent être isolées en DSAT pour le calcul du ratio conventionné par l'URSSAF.",
    relatedTerms: ["pamc", "pcc"],
    relatedQuestions: ["QT-037"],
    relatedFiches: ["regle-RO-012"],
  },
  {
    id: "CASE-024",
    code: "DSCO",
    nom: "Réintégration S1 (3 % + Groupe III) — ⚠️ SUPPRIMÉE depuis 2025",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "🚫 **Case supprimée par la réforme de l'assiette sociale 2026** (revenus 2025+). Avant cette réforme, DSCO permettait de réintégrer dans l'assiette sociale les déductions du Forfait 3 % (DG) et du Groupe III (DH). **Depuis 2025, cette réintégration est intégrée directement dans le calcul du Revenu Brut Social (RBS) via le Cadre 8 de la 2035-B**, puis le RBS est reporté en case **DSDE** (déclarant 1) ou **DSDF** (déclarant 2) sur la déclaration 2042 (volet PAMC). Tu n'as donc plus rien à saisir manuellement en DSCO.",
    quiRemplit: "Personne — case supprimée. Voir DSDE / DSDF à la place.",
    erreurFrequente: "Continuer à chercher la case DSCO sur la déclaration 2026. Elle n'existe plus. Si ton comptable ou ton AGA t'en parle encore, demande-lui le RBS du Cadre 8 (case DD ou DC de la 2035-B) qui se reporte en DSDE.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "📍 **Nouveau processus 2026 (Secteur 1 réel)** : (1) Tu calcules tes 3 forfaits → cases **DF** (2 %), **DG** (3 %), **DH** (Groupe III) ligne 43 de la 2035-B. (2) Le Cadre 8 calcule le RBS = Bénéfice fiscal + cotisations sociales (BK) + CSG déductible (BV) + DG + DH + DE − DB. Le résultat va en **case DD** (si positif) ou **DC** (si négatif). (3) Tu reportes DD en **DSDE** sur la 2042 (volet PAMC). Le forfait 2 % (DF), lui, n'est jamais réintégré socialement — il reste déduit dans les deux mondes. L'URSSAF applique ensuite son abattement forfaitaire de 26 % en interne.",
    relatedCases: ["DSDE", "DD", "DG", "DH", "2035"],
    relatedTerms: ["secteur-1-2", "groupe-iii"],
    relatedQuestions: ["QT-024"],
    relatedFiches: ["regle-RO-008"],
  },
  {
    id: "CASE-025",
    code: "DSEM",
    nom: "Épargne salariale (intéressement / participation / abondement PER) — DSFU",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Cases **DSEM (déclarant 1) / DSEN (déclarant 2)** pour l'**épargne salariale** : intéressement, participation, abondement employeur sur un PER d'entreprise — versés dans le cadre d'une **société soumise à l'IS**. Concerne typiquement les gérants/associés de SEL.\n\n⚠️ **Aucun rapport** avec les IJ Madelin ni les cotisations Madelin personnelles. Pour le médecin libéral EI-IR exerçant en BNC, ces cases restent vides dans la grande majorité des cas.",
    quiRemplit: "Gérant/associé d'une société à l'IS percevant intéressement, participation ou abondement PER d'entreprise.",
    erreurFrequente: "Erreur la plus répandue sur le web : déclarer les IJ Madelin reçues en DSEM. **Faux** : les IJ Madelin hors ALD vont en **DSCZ/DSDZ**. DSEM = épargne salariale IS uniquement.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Si tu exerces en EI-IR (cas le plus fréquent), laisse DSEM/DSEN vides. Pour tes IJ Madelin, utilise **DSCZ/DSDZ**. Pour l'abondement employeur PER en EI-IR, c'est la case **DSPC**. Source : notice PAMC URSSAF v1.0 du 09/04/2026 + Brochure IR DGFiP 2026 Part 3.",
    relatedTerms: ["per", "dscz-dsdz", "dspc"],
    relatedQuestions: ["QT-036"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "CASE-026",
    code: "DF",
    nom: "Forfait 2 % — Représentation/prospection (Secteur 1, BNC réel)",
    formulaire: "2035-B (ligne 43)",
    description: "Déduction forfaitaire de **2 % des recettes brutes totales** (AA conventionné + AF gains divers + dépassements + redevances de collaboration perçues + IJ). Couvre représentation, prospection, blanchissage, cadeaux, petits déplacements. Accessible dès la 1ère année d'installation, sans justificatif. **Réforme 2026** : seul forfait à rester exonéré socialement (non réintégré dans le RBS du Cadre 8).",
    quiRemplit: "Médecin Secteur 1 en BNC réel.",
    erreurFrequente: "Cumuler le forfait 2 % avec des frais de représentation déclarés en poste 30 → vaut renonciation au forfait.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "À reporter en case **DF** ligne 43 de la 2035-B. Si tu déclares le 2 %, ne mets RIEN en parallèle dans « frais de représentation, réception, prospection » (poste 30).",
    relatedCases: ["DG", "DH", "2035", "5QC"],
    relatedTerms: ["secteur-1-2", "bnc-reel"],
    relatedQuestions: ["QT-024", "QT-032"],
    relatedFiches: ["regle-RO-008"],
  },
  {
    id: "CASE-027",
    code: "DG",
    nom: "Forfait 3 % conventionnel (Secteur 1, BNC réel)",
    formulaire: "2035-B (ligne 43)",
    description: "Déduction forfaitaire de **3 % des seuls honoraires conventionnels AA**, hors PDSA exonéré, hors dépassements (DE/DP), HN, MSU, expertises, études cliniques et IJ Madelin. **Cumulable avec le Groupe III (DH)** depuis l'imposition des revenus 2023 (BOI-BNC-SECT-40 ; UNASA Guide 2035-2026 §391). **Réforme 2026** : DG est désormais réintégré socialement via le RBS du Cadre 8 → DSDE (compensé par l'abattement URSSAF de 26 %).",
    quiRemplit: "Médecin Secteur 1 conventionné en BNC réel.",
    erreurFrequente: "Appliquer le 3 % à des recettes hors champ (PDSA exonéré, dépassements, HN, MSU…) ou continuer à saisir manuellement la réintégration en DSCO (supprimée).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "À reporter en case **DG** ligne 43 de la 2035-B. Le Cadre 8 réintègre automatiquement DG dans le RBS — plus rien à saisir en DSCO.",
    relatedCases: ["DF", "DH", "DD", "DSDE", "DSCO", "2035"],
    relatedTerms: ["secteur-1-2", "bnc-reel", "groupe-iii"],
    relatedQuestions: ["QT-024", "QT-032"],
    relatedFiches: ["regle-RO-008"],
  },
  {
    id: "CASE-028",
    code: "DH",
    nom: "Groupe III — Déduction conventionnelle 3 050 €",
    formulaire: "2035-B (ligne 43)",
    description: "Déduction forfaitaire fixe de **3 050 €/an**, **cumulable avec le Forfait 3 % (DG)** depuis l'imposition des revenus 2023 (BOI-BNC-SECT-40 ; UNASA Guide 2035-2026 §391). ⚠️ **Non disponible la 1ère année d'installation**. **Réforme 2026** : DH est désormais réintégré socialement via le RBS du Cadre 8 → DSDE (compensé par l'abattement URSSAF de 26 %).",
    quiRemplit: "Médecin Secteur 1 en BNC réel, à partir de la 2ème année d'installation.",
    erreurFrequente: "Activer DH la 1ère année d'installation (réservé aux exercices ultérieurs). Confondre l'assiette DH (forfait fixe 3 050 €) avec celle du 3 % (calculée sur AA conventionné hors exclusions). Saisir DH en parallèle des frais réels de représentation déjà inscrits au poste 30.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "À reporter en case **DH** ligne 43 de la 2035-B. **Cumul DG + DH** recommandé en S1 BNC réel : 3 % conventionnel + 3 050 € de Groupe III s'additionnent (pas de choix à faire).",
    relatedCases: ["DF", "DG", "DD", "DSDE", "DSCO", "2035"],
    relatedTerms: ["secteur-1-2", "bnc-reel", "groupe-iii"],
    relatedQuestions: ["QT-024", "QT-032"],
    relatedFiches: ["regle-RO-008"],
  },
  {
    id: "CASE-029",
    code: "CI",
    nom: "Exonération PDSA / zones déficitaires (Art. 151 ter)",
    formulaire: "2035-B (cadre 7 « Divers à déduire »)",
    description: "Ligne **CI** du cadre 7 « Divers à déduire » de la 2035-B. C'est ici qu'en **BNC réel** on déduit fiscalement les majorations PDSA exonérées (Art. 151 ter — CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN, plafond 60 jours). La PDSA reste comptabilisée dans les recettes 2035-A puis sortie via CI. Côté social, **CI figure dans la formule du RBS** (Cadre 8) → réintégration **AUTOMATIQUE** en **DSDE** (positif) ou **DSDG** (négatif).",
    quiRemplit: "Médecin en BNC réel ayant réalisé de la PDSA exonérée d'IR.",
    erreurFrequente: "Remplir **DSFA en parallèle de CI** — DSFA est réservée au micro-BNC. En réel, la double saisie déclenche une **double cotisation** sur la PDSA. Autre erreur : ne pas inclure la PDSA dans les recettes 2035-A « pour gagner du temps ».",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Comptabilise la PDSA brute en recettes 2035-A, puis déduis-la en **CI** (cadre 7). Le bénéfice fiscal qui part en 5QC est donc net de PDSA. Ne touche pas à DSFA — la réintégration sociale se fait toute seule via le RBS → DSDE/DSDG. 💡 Le module `Aide 2035` d'Hippodoc remplit CI à partir de tes encaissements PDSA.",
    relatedCases: ["DD", "DSDE", "DSDG", "DSFA", "5QC", "2035"],
    relatedTerms: ["pdsa", "bnc-reel"],
    relatedQuestions: ["QT-020", "QT-028", "QT-032"],
    relatedFiches: ["regle-RO-006", "regle-RO-015", "pepite-PC-003"],
  },
  {
    id: "CASE-030",
    code: "DSDG",
    nom: "Revenu Brut Social négatif (EI)",
    formulaire: "DSFU (ex DS-PAMC)",
    description: "Pendant social de **DSDE** quand le RBS du Cadre 8 ressort **négatif** (typiquement : forte exonération PDSA/ZFU, déficit BNC, ou cumul de réintégrations défavorables). Calculé via la même formule officielle que DD/DSDE : `RBS = CE − CN + BK + BV + CS + AW + CU + CI + CO + DG + CJ + DH + DE − DB`. Si le résultat est ≥ 0 → reporte en **DSDE** ; si < 0 → reporte la valeur absolue en **DSDG**.",
    quiRemplit: "Médecin en BNC réel dont le RBS du Cadre 8 est strictement négatif.",
    erreurFrequente: "Reporter un RBS négatif en DSDE (au lieu de DSDG) — l'URSSAF rejette ou applique des cotisations forfaitaires. Ou renseigner DSFA en parallèle pour la PDSA en pensant « compenser » : c'est inutile et ça génère une double cotisation.",
    certitude: "confirmed",
    categorie: "social",
    conseil: "DSDG = même formule que DSDE, simplement quand le résultat passe en négatif. Aucune saisie supplémentaire pour la PDSA : la ligne CI est déjà dans le RBS. 💡 Le module `Aide DSFU – volet PAMC` d'Hippodoc bascule automatiquement vers DSDG si le RBS est négatif.",
    relatedCases: ["DD", "DSDE", "CI", "DSFA"],
    relatedTerms: ["bnc-reel", "pamc", "pdsa"],
    relatedQuestions: ["QT-020", "QT-032"],
    relatedFiches: ["regle-RO-006", "regle-RO-015"],
  },
  {
    id: "CASE-031",
    code: "BT",
    nom: "Cotisation IJ CPAM obligatoire (PAMC)",
    formulaire: "2035-A",
    description: "Ligne **BT** de la 2035-A : cotisation obligatoire d'indemnités journalières CPAM pour les médecins PAMC (entrée en vigueur 2021, généralisée 2025). Taux **0,30 %** appliqué sur le **Revenu Brut Social (RBS)** après abattement forfaitaire 26 %, avec :\n• **revenus 2025 (déclaration 2026)** — plancher **56,52 €** / plafond **423,90 €** (calculés sur PASS 2025 = 47 100 € : assiette mini = 40 % PASS, assiette maxi = 3 PASS)\n• **revenus 2026 (déclaration 2027)** — plancher ≈ **57,67 €** / plafond ≈ **432,54 €** (PASS 2026 = 48 060 €)\n\nCharge déductible du BNC en régime réel.\n\n⚠️ Distincte de la cotisation **BU** (versements nouveaux PER individuels — voir CASE-034) et de **BZ** (cotisations facultatives Madelin retraite/prévoyance) : BT est obligatoire et concerne uniquement les IJ CPAM (délai de carence ramené de 91 à **3 jours** depuis le 1er juillet 2021, décret 2021-755).",
    quiRemplit: "Tous les médecins PAMC en BNC réel (titulaires installés ≥ 38 000 €).",
    erreurFrequente: "Confondre BT (obligatoire, IJ CPAM) avec BU (Madelin volontaire, prévoyance privée). Oublier de la déduire en BNC réel alors qu'elle est prélevée par l'URSSAF avec les autres cotisations.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Reporte le montant prélevé par l'URSSAF (relevé annuel) en ligne BT de la 2035-A. Charge déductible. Ne pas la confondre avec la prévoyance Madelin (BU). En micro-BNC, déjà noyée dans l'abattement 34 %.",
    relatedCases: ["DSDX", "BU"],
    relatedTerms: ["pamc", "cotisation-ij-cpam-bt"],
    relatedQuestions: ["QT-033", "QT-035"],
    relatedFiches: ["regle-RO-013", "pepite-PC-014"],
  },
  {
    id: "CASE-032",
    code: "1AZ",
    nom: "Pensions d'invalidité (CARMF, CPAM permanente)",
    formulaire: "2042",
    description: "Case **1AZ** de la 2042 (rubrique « Pensions, retraites et rentes ») pour les **pensions d'invalidité permanente** (CARMF rente invalidité-décès, pension invalidité CPAM). Distincte de **1AS** qui concerne les pensions de retraite. Abattement automatique 10 % (plafond 4 439 € par foyer pour 2025).\n\n⚠️ Une **IJ CARMF** liée à une incapacité **temporaire** (Madelin obligatoire) reste un revenu BNC (gain divers AF en réel, recettes 5HQ en micro). Seule la **rente invalidité permanente** relève de 1AZ.",
    quiRemplit: "Médecin percevant une rente d'invalidité permanente CARMF ou une pension invalidité CPAM.",
    erreurFrequente: "Confondre 1AZ (invalidité permanente) avec 1AS (retraite). Confondre rente invalidité CARMF (1AZ) avec IJ CARMF d'incapacité temporaire (gains divers AF en réel ou 5HQ en micro).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Pension d'invalidité permanente → 1AZ (2042). Pension de retraite → 1AS. Ne PAS inclure dans le BNC. Exonérée de cotisations sociales URSSAF/CARMF. Abattement 10 % automatique.",
    relatedCases: ["1AS"],
    relatedTerms: ["carmf", "invalidite-deces", "pension-invalidite-carmf"],
    relatedQuestions: ["QT-034"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "CASE-033",
    code: "6QS",
    nom: "Cotisations PER/Madelin (info plafond épargne retraite)",
    formulaire: "2042",
    description: "Case **6QS (déclarant 1) / 6QT (déclarant 2) / 6QU (enfant à charge)** de la 2042 (rubrique « Charges déductibles — Épargne retraite »). Sert **uniquement à calculer le plafond global d'épargne retraite** (Art. 163 quatervicies CGI = 10 % des revenus pro N-1, plafonné à 8 PASS).\n\n⚠️ **Ce n'est PAS une 2ᵉ déduction** : les cotisations Madelin sont déjà déduites du BNC en **BU/L25** de la 2035 (réel), dans la limite Art. 154 bis. La case 6QS ne fait que reporter le montant pour information, afin que le fisc connaisse ton plafond PER restant disponible.\n\n📌 **Réforme 2026** : depuis le 1er janvier 2026, **plus aucune case sociale URSSAF** pour les cotisations Madelin payées (l'abattement forfaitaire 26 % sur le RBS du Cadre 8 remplace l'ancien mécanisme de réintégration). À ne pas confondre avec **DSCZ/DSDZ** = IJ Madelin **REÇUES** + AJPA (côté maternité).",
    quiRemplit: "Tout médecin (BNC réel ou micro-BNC, libéral ou salarié) ayant versé des cotisations Madelin ou PER individuel dans l'année.",
    erreurFrequente: "Croire que 6QS est une 2ᵉ déduction (alors que c'est juste informatif). Confondre 6QS (cotisations versées) avec DSCZ (IJ Madelin reçues). Oublier de la remplir → perte du calcul de plafond PER reportable les années suivantes.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Reporte le montant total versé en Madelin/PER en 6QS (toi) ou 6QT (conjoint). Aucun impact direct sur l'IR (la déduction se fait en BU/L25 de la 2035). Sert uniquement à matérialiser ton plafond épargne retraite.",
    relatedCases: ["BU"],
    relatedTerms: ["madelin", "per", "plafond-epargne-retraite"],
    relatedQuestions: ["QT-035"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "CASE-034",
    code: "BU",
    nom: "Cotisations PER individuel / Madelin retraite — déduction BNC réel",
    formulaire: "2035-A (ligne 25)",
    description: "Ligne **BU** de la 2035-A (rubrique « Cotisations sociales personnelles » — ligne 25, sous-poste à côté de BT et BZ) : **versements aux nouveaux PER individuels** (Plan Épargne Retraite, ouvert depuis le 1er octobre 2019), déductibles du bénéfice BNC dans la limite **Art. 154 bis CGI**.\n\n**Plafond global Madelin/PER 2025 (3 enveloppes indépendantes — pas de plafond chapeau)** :\n• **Retraite** : 10 % du bénéfice (plafonné à 8 PASS) + 15 % de la fraction du bénéfice entre 1 et 8 PASS — plafond global ≈ **87 135 €** (PASS 2025 = 47 100 €).\n• Prévoyance/mutuelle : 3,75 % du bénéfice + 7 % du PASS — plafond ≈ 11 304 €.\n• Perte d'emploi : max(2,5 % PASS, 1,875 % bénéfice) — plafond 7 065 €.\n\n⚠️ **3 lignes à ne JAMAIS confondre** sur la 2035-A :\n• **BT** = cotisation IJ CPAM **obligatoire** (0,30 % RBS, plancher 56,52 € / plafond 423,90 € pour les revenus 2025) — voir CASE-031.\n• **BU** = versements **nouveaux PER individuels** (cette case).\n• **BZ** = cotisations facultatives **Madelin retraite/prévoyance** (contrats fermés à la souscription depuis le 1er octobre 2020, mais les contrats existants continuent de fonctionner et restent déductibles).\n\n**Reporting 2042** : le total versé (BU + BZ retraite) est aussi à indiquer en **6QS / 6QT / 6QU** sur la 2042 — uniquement à titre **informatif** pour le calcul du plafond épargne retraite reportable (Art. 163 quatervicies CGI). Ce n'est **PAS une 2ᵉ déduction** (voir CASE-033).",
    quiRemplit: "Médecin en BNC réel ayant versé des cotisations sur un PER individuel ou un contrat Madelin retraite/prévoyance dans l'année.",
    erreurFrequente: "Confondre BU (PER) avec BT (IJ CPAM obligatoire) ou BZ (Madelin facultatif) → mauvais poste comptable. Oublier la déduction en BU et ne reporter qu'en 6QS sur la 2042 (qui est seulement informatif → aucune économie d'impôt). Dépasser le plafond Art. 154 bis sans le savoir (excédent non déductible mais soumis aux mêmes prélèvements à la sortie = double peine).",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Reporte les versements PER individuel en **BU**, les versements Madelin (retraite + prévoyance + perte d'emploi) en **BZ** — chaque enveloppe a son propre plafond Art. 154 bis. Reporte aussi le total versé en **6QS / 6QT / 6QU** sur la 2042 (informatif). En micro-BNC : non déductible séparément (l'abattement 34 % couvre tout). Réforme 2026 : **plus aucune case sociale URSSAF** pour les cotisations Madelin/PER (l'abattement forfaitaire 26 % sur le RBS du Cadre 8 remplace l'ancien mécanisme).",
    relatedCases: ["BT", "DSCZ", "6QS"],
    relatedTerms: ["per", "madelin", "plafond-epargne-retraite", "pass"],
    relatedQuestions: ["QT-006", "QT-035"],
    relatedFiches: ["pepite-PC-014", "regle-RO-009"],
  },
  {
    id: "CASE-035",
    code: "DSDI",
    nom: "Revenu brut social — Gérants/associés de sociétés à l'IS",
    formulaire: "2042 (volet PAMC)",
    description: "Case **DSDI** de la DSFU (ex DS-PAMC) : RBS des **gérants majoritaires de SARL/SELARL, associés gérants de SCP à l'IS, présidents de SAS/SELAS** assimilés salariés au sens social.\n\n📌 **Si tu es en EI (entreprise individuelle), DSDI = 0** : ton RBS se reporte uniquement en **DSDE** (case dédiée aux EI).\n\n⚠️ **Bug national connu campagne 2026** : sur impots.gouv.fr, DSDI se pré-remplit parfois automatiquement à hauteur de DSDE pour des médecins en EI. **Force DSDI à 0 manuellement** sinon l'URSSAF calculera tes cotisations sur 2× ton RBS. Voir QT-044.\n\n💡 **Pas besoin de cocher DSAJ** (case « Exploitant individuel ») : la sélection de DSAP (installé) ou DSAQ (remplaçant) suffit dans la plupart des cas.",
    quiRemplit: "Uniquement les médecins **gérants majoritaires ou associés** d'une société soumise à l'IS (SELARL, SELAS, SCP à l'IS). Les EI laissent DSDI = 0.",
    erreurFrequente: "Laisser le doublon DSDI = DSDE quand on est en EI (bug 2026) → l'URSSAF facture sur le double du RBS. Confondre DSDI avec DSDE (entreprises individuelles).",
    certitude: "confirmed",
    categorie: "social",
    conseil: "Si tu es en EI, vérifie systématiquement que DSDI = 0 sur ta DSFU. Si tu es gérant/associé d'une société à l'IS, reporte ton RBS personnel (issu de ta 2035 perso en tant qu'associé SEL post-réforme 2024) en DSDI.",
    relatedCases: ["DSDE", "DD"],
    relatedTerms: ["dsdi-gerance-sel", "pamc"],
    relatedQuestions: ["QT-044", "QT-032", "QT-017"],
    relatedFiches: ["zone-ZG-004"],
  },
  {
    id: "CASE-036",
    code: "5QB",
    nom: "Bénéfice exonéré régimes zonés ZFU-TE / FRR / JEI (BNC réel)",
    formulaire: "2042 C PRO",
    description: "Montant du **bénéfice net exonéré d'IR** au titre des dispositifs zonés (ZFU-TE Art. 44 octies A, FRR/ZRR Art. 44 quindecies, JEI Art. 44 sexies-0 A) pour les médecins en **BNC réel (déclaration contrôlée)**. Le bénéfice exonéré est calculé sur la 2035 (au prorata des recettes éligibles, après affectation des charges) puis reporté en 5QB / 5RB (déclarant 2) / 5SB.\n\n⚠️ **En BNC réel, n'utilise pas 5HP** (réservée micro-BNC). Plafonds : ZFU 50 000 €/an de bénéfice exonéré, dégressif sur 8 ans (5 ans à 100 %, puis 60 %/40 %/20 %) ; FRR 300 000 € sur 3 ans glissants (titulaires/collaborateurs uniquement, jamais les remplaçants). **Le plafond est lui-même proratisé au nombre de mois d'exonération effective l'année d'installation ou de basculement de palier** (CGI Art. 49 K annexe III ; CE 18/07/2018 n° 412142) — voir QT-049 pour l'exemple chiffré. Le bénéfice imposable (5QC) ne contient QUE la part non exonérée.",
    quiRemplit: "Médecin en **BNC réel** installé en ZFU-TE, FRR/ZRR ou bénéficiant du statut JEI",
    erreurFrequente: "Reporter le CA brut au lieu du bénéfice exonéré (oubli de la déduction des charges au prorata). Utiliser 5HP au lieu de 5QB en BNC réel. Oublier la dégressivité au-delà de la 5ᵉ année. **Oublier de proratiser le plafond l'année d'installation** (50 000 € en plein, ~4 167 € si installation en décembre) = redressement quasi systématique.",
    certitude: "confirmed",
    categorie: "fiscal",
    conseil: "Calcule d'abord le bénéfice exonéré sur la 2035 (recettes ZFU/FRR ÷ recettes totales × bénéfice), applique le taux dégressif de l'année (100/60/40/20 %), plafonne à 50 000 € (ZFU) ou 300 000 €/3 ans glissants (FRR), puis reporte le résultat en 5QB. Le bénéfice imposable restant va en 5QC. **Côté social, la ZFU/FRR n'exonère PAS les cotisations URSSAF/CARMF** : DSCS reste le CA brut total.",
    relatedTerms: ["zfu-te", "zfrr", "bnc-reel", "declarant-1-vs-2"],
    relatedQuestions: ["QT-020", "QT-027", "QT-049"],
    relatedFiches: ["regle-RO-006", "zone-ZG-007"],
  }
];

export const profils: ProfilMedecin[] = [
  {
    id: "PM-001",
    label: "Médecin installé, secteur 1, BNC réel",
    description: "Médecin généraliste ou spécialiste installé en cabinet, soumis au régime des bénéfices non commerciaux (BNC) au réel, et conventionné secteur 1.",
    icon: "stethoscope",
    casePrioritaires: ["2035", "5QC", "DSCS", "DSAV", "DSDE", "DD", "BT"],
    conseilsCles: ["⚠️ **Si tu as des remplaçants** : ton **DSCS** (URSSAF) et ta **5QC** (impôts) ne sont **PAS le même chiffre**. DSCS = ton CA brut encaissé (AVANT rétrocessions versées) ; 5QC = bénéfice net après déduction L21/BG. C'est normal et voulu — voir RO-012.", "Utiliser un logiciel comptable ou un expert-comptable/AGA.", "Vérifier la concordance entre la 2035 et la 2042 C PRO.", "Bien calculer le Revenu Brut Social (case DD de la 2035 puis DSDE du PAMC).", "Optimiser les charges déductibles (véhicule, repas, loyer professionnel, Madelin).", "Reporter la cotisation IJ CPAM obligatoire (0,30 % RBS, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025 — bornes basées sur PASS 2025 = 47 100 €) en ligne BT de la 2035-A — déductible du BNC."],
    faqPertinentes: ["QT-001","QT-004","QT-024","QT-031","QT-033","QT-042"]
  },
  {
    id: "PM-002",
    label: "Médecin remplaçant",
    description: "Médecin effectuant des remplacements, en micro-BNC ou en BNC réel. La déclaration varie selon le régime fiscal, mais les principes de base restent les mêmes.",
    icon: "car",
    casePrioritaires: ["5HQ", "5QC", "2035", "DSCS", "DSAV", "BT"],
    conseilsCles: ["En micro-BNC : déclarer en 5HQ ton CA encaissé (= les rétrocessions perçues des titulaires que tu remplaces), sans appliquer toi-même l'abattement 34% (les impôts l'appliquent automatiquement).", "En BNC réel : remplir la 2035, déduire tes charges réelles (véhicule, repas, matériel) et reporter le bénéfice en 5QC.", "Renseigner DSCS et DSAV avec le CA brut total sur la DSFU.", "Vérifier l'éligibilité aux exonérations ZFU/FRR (case 5HP/5QB) et PDSA (réduction de 5HQ + DSFA/DSFB au PAMC, **jamais** 5HP), et tenir compte des IJ CPAM (DSDX).", "En BNC réel + PAMC (recettes ≥ 38 000 €) : reporter la cotisation IJ CPAM obligatoire (0,30 % RBS, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025) en ligne **BT** de la 2035-A — déductible du BNC. En micro-BNC, déjà couverte par l'abattement 34 %.", "**Cases DSCI / DSCJ** (recettes déjà soumises au RSPM) : si tu étais au RSPM toute l'année N, tu ne remplis **RIEN** dans ces cases, même si tu passes au PAMC en N+1. Source : notice URSSAF + retours terrain mai 2026."],
    faqPertinentes: ["QT-001","QT-013","QT-014","QT-021","QT-029","QT-030","QT-041","QT-043"]
  },
  {
    id: "PM-003",
    label: "Médecin installé, secteur 2 OPTAM",
    description: "Médecin spécialiste ou généraliste installé en secteur 2 avec option tarifaire maîtrisée (OPTAM ou OPTAM-CO).",
    icon: "coins",
    casePrioritaires: ["2035", "5QC", "DSCS", "DSAV", "DSAW", "DSDE", "DD", "BT"],
    conseilsCles: [
      "⚠️ **Si tu as des remplaçants** : ton **DSCS** (URSSAF) et ta **5QC** (impôts) ne sont **PAS le même chiffre**. DSCS reste brut (avant rétrocessions versées), 5QC est net (après déduction L21/BG). C'est normal — voir RO-012.",
      "Gérer les dépassements d'honoraires (DSAW).",
      "Utiliser un simulateur URSSAF pour évaluer l'impact des dépassements sur les cotisations.",
      "Comparer la rentabilité avec le secteur 1 après charges.",
      "⚠️ **Pas de Prise en Charge des Cotisations (PCC) en S2** : la PCC est **réservée au secteur 1 conventionné**. En OPTAM, tu bénéficies uniquement de la **prime de performance** et de l'**aide à l'embauche d'un assistant médical** — pas de prise en charge de tes cotisations URSSAF maladie par la CPAM.",
      "⚠️ **Pas de forfait 3 % (DG) ni de Groupe III (DH)** : ces déductions forfaitaires sont **réservées au secteur 1**. En OPTAM, seul le **forfait 2 % (DF)** reste accessible si tu y as droit (frais de représentation).",
      "Reporter la cotisation IJ CPAM obligatoire (0,30 % RBS, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025 — bornes basées sur PASS 2025 = 47 100 €) en ligne BT de la 2035-A — déductible du BNC."
    ],
    faqPertinentes: ["QT-004","QT-024","QT-031","QT-038","QT-042","QT-043"]
  },
  {
    id: "PM-004",
    label: "Médecin en première installation",
    description: "Médecin récemment installé, souvent confronté à la complexité des premières déclarations et au choix entre micro-BNC et régime réel.",
    icon: "rocket",
    casePrioritaires: ["5HQ", "2035", "DSCS", "DSAV", "DSDE"],
    conseilsCles: ["Ne pas hésiter à prendre un comptable ou à adhérer à une AGA dès la première année.", "Évaluer le régime fiscal le plus avantageux en fonction des charges d'installation (micro-BNC si charges < 34% du CA imposable, réel sinon).", "Anticiper la bascule du RSPM au PAMC.", "Ne pas oublier les forfaits et aides à l'installation."],
    faqPertinentes: ["QT-003","QT-009","QT-013","QT-031","QT-043"]
  },
  {
    id: "PM-005",
    label: "Médecin avec activité salariée et libérale",
    description: "Médecin cumulant une activité salariée (ex: hospitalière) et une activité libérale (ex: remplaçant ou installation à temps partiel).",
    icon: "shuffle",
    casePrioritaires: ["5HQ", "5QC", "1AJ", "DSCS"],
    conseilsCles: ["Déclarer les revenus salariés et libéraux séparément.", "S'assurer de ne pas double-compter les revenus ou les IJ.", "Vérifier l'imposition des IJ CPAM en fonction du régime (salaire vs libéral).", "Un simulateur fiscal en ligne peut être utile pour la partie libérale."],
    faqPertinentes: ["QT-014","QT-021","QT-029"]
  },
  {
    id: "PM-006",
    label: "Médecin avec arrêt / IJ (maternité, maladie, prévoyance)",
    description: "Médecin ayant perçu des indemnités journalières : IJ CPAM (maternité, paternité, maladie), allocation de repos maternel, IJ prévoyance Madelin, IJ CARMF d'incapacité temporaire ou pension d'invalidité permanente CARMF.",
    icon: "baby",
    casePrioritaires: ["DSDX", "DSCZ", "5HQ", "DSCS", "1AZ"],
    conseilsCles: ["**IJ CPAM hors ALD — doctrine 2026 scellée (expert mai 2026)** : en **BNC réel**, à reporter en **AF** (gains divers L7 de la 2035-A) → 5QC + miroir **DB cadre 8** (2035-B) + **DSDX brut** (2042 volet PAMC). En **micro-BNC**, **NON imposables IR** (DGFiP brochure 2026 p. 180) → **JAMAIS dans 5HQ** ; seul **DSDX brut**. **JAMAIS en 1AJ** dans les deux régimes — la pré-tolérance « salaire » historique a été supprimée. Voir QT-040 et QT-041.", "IJ Madelin hors ALD + AJPA (proche aidant) : imposables fiscalement en gains divers (case AF de la 2035 en réel ; recettes 5HQ en micro-BNC) ET réintégrées socialement en **DSCZ/DSDZ** brut avant CSG/CRDS — JAMAIS en DSEM (épargne salariale IS, sans rapport). En BNC réel, le mécanisme **Cadre 8 + ligne DB** de la 2035-B neutralise le double-comptage social (l'Aide 2035 d'Hippodoc le fait automatiquement dès que tes IJ Madelin sont en AF).", "**IJ CARMF d'incapacité temporaire** (Madelin obligatoire) : imposables en BNC gain divers (ligne **AF** de la 2035-A en réel, recettes **5HQ** en micro-BNC), exonérées de cotisations sociales. **Jamais** en 1AS ni 1AZ.", "**Pension d'invalidité permanente CARMF** (rente viagère invalidité-décès) : case **1AZ** de la 2042 (pas 1AS), abattement 10 % automatique plafonné 4 439 €/foyer, exonérée de cotisations sociales.", "ALD : toutes les IJ (CPAM, Madelin, CARMF) liées à une ALD sont totalement exonérées d'IR ET exclues de l'assiette sociale — ne rien déclarer.", "Comparer les montants pré-remplis dans DSDX avec les attestations Ameli — override si écart manifeste.", "Conserver tous les justificatifs (attestations, relevés, contrats prévoyance)."],
    faqPertinentes: ["QT-002","QT-006","QT-023","QT-034","QT-036","QT-043"]
  },
  {
    id: "PM-012",
    label: "Interne / Étudiant en médecine",
    description: "Interne ou étudiant effectuant ses premiers remplacements libéraux en parallèle de son activité hospitalière. Tu découvres les déclarations fiscales et sociales.",
    icon: "graduation-cap",
    casePrioritaires: ["5HQ", "1AJ", "DSCS"],
    conseilsCles: ["Tes remplacements libéraux se déclarent séparément de ton salaire d'interne — ce sont deux revenus distincts.", "En micro-BNC (le plus fréquent au début) : reporte ton CA brut en 5HQ, l'abattement 34% est appliqué automatiquement.", "Tu es au RSPM tant que tes revenus libéraux restent < ~38 000€/an (en dessous de ~19 000€, tes cotisations sont au taux réduit de 13,5%) — c'est à toi de déclarer tes honoraires au RSPM pour que tes cotisations soient calculées.", "Pense à ouvrir un compte bancaire dédié à ton activité libérale dès le premier remplacement.", "Tu n'es PAS conventionné(e) personnellement — tu exerces sous la convention du médecin que tu remplaces."],
    faqPertinentes: ["QT-013","QT-014","QT-019","QT-029"]
  },
  {
    id: "PM-008",
    label: "Médecin en ZFU/FRR ou pratiquant la PDSA",
    description: "Médecin exerçant dans une zone bénéficiant d'une exonération fiscale (Zone Franche Urbaine, France Rurale Revitalisée ex-ZRR) **ou** pratiquant la Permanence Des Soins Ambulatoires (PDSA) avec majorations exonérées (Art. 151 ter CGI). Les deux régimes ont des canaux de déclaration **distincts**.",
    icon: "map-pin",
    casePrioritaires: ["5HQ", "5QC", "5HP", "5QB", "DSFA"],
    conseilsCles: [
      "**ZFU-TE** : 5HP (micro) ou 5QB (réel) ; dégressif sur 8 ans (5 ans à 100 %, puis 60 %/40 %/20 %), plafond 50 000 €/an de bénéfice exonéré, **accessible aux remplaçants**.",
      "**FRR (ex-ZRR)** : plafond 300 000 € sur 3 ans glissants, **PAS accessible aux remplaçants** (uniquement titulaires/collaborateurs installés).",
      "**PDSA** (Art. 151 ter, plafond 60 jours/an) : en micro-BNC → retire le brut de 5HQ ; en BNC réel → déduis le brut en **ligne CI** (cadre 7 « Divers à déduire ») de la 2035-B. Au PAMC micro-BNC : reporte le NET (×0,66) en **DSFA** (déclarant 1) ou **DSFB** (déclarant 2). Au PAMC réel : la formule du RBS réintègre CI automatiquement en DSDE/DSDG, **ne jamais remplir DSFA**. Au RSPM, pas de DSFU.",
      "⚠️ **Ne JAMAIS reporter la PDSA en 5HP/5QB** : double-comptage URSSAF garanti (revenu net social = 0,66 × 5HQ + DSFA + 5HP).",
      "Exonération PDSA = uniquement fiscale, pas sociale (les majorations restent soumises à cotisations URSSAF/CARMF). Conserver l'attestation du médecin coordinateur."
    ],
    faqPertinentes: ["QT-020","QT-027","QT-028"]
  },
  {
    id: "PM-009",
    label: "Médecin remplaçant RSPM vers PAMC",
    description: "Médecin dont le régime social passe du Dispositif Simplifié (RSPM) au régime PAMC. Trois cas distincts : (A) installation en cabinet propre ou collaboration libérale en cours d'année — bascule au 1er jour du trimestre civil suivant, ANNÉE MIXTE ; (B) dépassement du plafond ~38 000 € — radiation au 1er janvier N+1, PAS de bascule sur N ; (C) demande volontaire — option annuelle, effet au 1er janvier N+1.",
    icon: "arrow-left-right",
    casePrioritaires: ["5HQ", "DSCS", "DSAV"],
    conseilsCles: [
      "Identifie ton CAS : (A) installation/collaboration → bascule trimestre civil + année mixte ; (B) dépassement seuil → radiation au 1er janvier N+1, AUCUNE DSFU sur N ; (C) demande volontaire → effet au 1er janvier N+1, AUCUNE DSFU sur N.",
      "Cas A uniquement : ne remplir la partie PAMC de la DSFU QUE pour les revenus encaissés après la date de bascule. Les revenus de la période RSPM restent uniquement en 2042-C-PRO.",
      "En micro-BNC première année PAMC : 5HQ = CA brut, DSCS = DSAV = CA brut total (période PAMC), DSAU = 1 si 100 % conventionné, DSAW = 0, DSDE = laisser VIDE (abattement 34 % automatique), DSAT = 0 (sauf EHPAD/HAD/SSIAD).",
      "Contacter la CARMF directement par mail (affiliations.cotis@carmf.fr) — la radiation n'est jamais notifiée automatiquement.",
      "Créer un NOUVEL espace personnel URSSAF (l'ancien compte RSPM ne sera pas mis à jour)."
    ],
    faqPertinentes: ["QT-002","QT-007","QT-021","QT-030"]
  },
  {
    id: "PM-010",
    label: "Médecin avec SELARL/SELAS",
    description: "Médecin exerçant via une Société d'Exercice Libéral (SELARL, SELAS), avec des problématiques de rémunération de gérance (en BNC depuis 2024), dividendes et optimisation patrimoniale.",
    icon: "building-2",
    casePrioritaires: ["5QC", "DSDI", "DSEC", "DSSC", "DD"],
    conseilsCles: [
      "La rémunération du dirigeant de SEL est en BNC depuis 2024, à déclarer en 5QC.",
      "Cocher DSDI sur la DSFU et remplir DSEC (rémunération brute) et DSSC (dividendes > 10% capital).",
      "Les dividendes > 10% du capital social sont soumis à cotisations URSSAF/CARMF.",
      "Risque d'abus de droit si rémunération anormalement basse et dividendes élevés — avoir un expert fiscaliste.",
      "Une SPFPL (holding) permet le régime mère-fille sur les dividendes remontés, mais nécessite un accompagnement expert.",
      "⚠️ **Ventilation DSDE / DSEC (doctrine 2024+, en cours de stabilisation 2026)** : les honoraires rétrocédés par la société au gérant via la case **5QC** (BNC personnel) se ventilent **proportionnellement** entre **DSDE** (RBS personnel BNC) et **DSEC** (rémunération brute gérance) sur la base du ratio **5QC / 1GB** (rémunération gérance / total rémunération brute société). Cette doctrine remplace la version V1 « DSDE seul » diffusée jusqu'à mi-2025. **À valider avec ton AGA / expert-comptable** : la pratique URSSAF n'est pas encore homogénéisée sur tout le territoire. Sources : retours praticiens 2026 + Notice URSSAF DSFU 2026 (sec. 7.2)."
    ],
    faqPertinentes: ["QT-005","QT-017","QT-024","QT-044","QT-047"]
  },
  {
    id: "PM-011",
    label: "Médecin collaborateur libéral",
    description: "Médecin exerçant en collaboration libérale dans le cabinet d'un titulaire. Tu encaisses directement tes honoraires et tu verses une redevance (ligne L16/BG de la 2035) au titulaire pour l'utilisation du cabinet.",
    icon: "handshake",
    casePrioritaires: ["5HQ", "5QC", "2035", "DSCS", "DSAV", "DSDE", "BT"],
    conseilsCles: ["⚠️ **Piège classique** : ton **DSCS** (URSSAF) et ta **5HQ** (impôts) ne sont **PAS le même chiffre**. DSCS = ton CA brut encaissé (AVANT redevance) ; 5HQ = ton CA − redevance versée. C'est normal et voulu — voir RO-012.", "La redevance de collaboration est une charge déductible en BNC réel (ligne L16/BG de la 2035).", "En micro-BNC, la redevance est pré-déduite du CA avant report en 5HQ (comme les rétrocessions versées, CGI Art. 102 ter).", "Tu encaisses directement tes honoraires — c'est toi qui déclares ton CA brut en DSCS.", "Le contrat de collaboration doit être déposé au Conseil de l'Ordre (CDOM).", "Tu peux bénéficier des forfaits 2%/3% Secteur 1 sur ta part d'activité installée.", "En PAMC réel : reporter la cotisation IJ CPAM obligatoire (0,30 % RBS, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025 — bornes calculées sur PASS 2025) en ligne **BT** de la 2035-A — déductible du BNC."],
    faqPertinentes: ["QT-001","QT-022","QT-024","QT-033","QT-042"]
  },
  {
    id: "PM-013",
    label: "Médecin vacataire (centre / maison médicale)",
    description: "Médecin effectuant des vacations en centre de santé, maison de santé pluriprofessionnelle ou structure de soins. La structure verse les honoraires bruts directement (pas de rétrocession au sens classique).",
    icon: "hospital",
    casePrioritaires: ["5HQ", "5QC", "DSCS", "DSAV", "BT"],
    conseilsCles: ["La structure te verse des honoraires bruts (pas une rétrocession). Tu déclares ces honoraires en recettes BNC (5HQ en micro, 5QC en réel).", "Demande à la structure un récapitulatif annuel (relevé SNIR ou attestation) — sinon reconstitue via tes encaissements bancaires.", "En PAMC : DSCS = total des honoraires perçus, DSAV = part conventionnée.", "En PAMC réel : reporter la cotisation IJ CPAM obligatoire (0,30 % RBS, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025 — bornes calculées sur PASS 2025) en ligne **BT** de la 2035-A — déductible du BNC.", "En RSPM (< 38 000 €/an) : pas de DSFU à remplir, cotisations prélevées trimestriellement sur ton CA déclaré.", "Vérifie que la structure ne te déclare pas comme salarié (BS / 1AJ) si tu es bien en libéral — confusion fréquente."],
    faqPertinentes: ["QT-001","QT-021","QT-022","QT-031"]
  },
  {
    id: "PM-014",
    label: "Médecin en EI à l'IS (option art. 1655 sexies CGI)",
    description: "Médecin exerçant en **entreprise individuelle ayant opté pour l'impôt sur les sociétés** (option ouverte depuis 2022, art. 1655 sexies CGI) sans création de société (pas de SELARL ni de SELAS). Fiche standalone, non proposée par la boussole — doctrine en cours d'appropriation par les médecins.",
    icon: "building-2",
    casePrioritaires: ["DSEC", "DSDI", "5QC", "DD"],
    conseilsCles: [
      "**Option art. 1655 sexies CGI (depuis 2022)** : tu restes en EI (pas de personnalité morale, pas de SELARL/SELAS), mais ton bénéfice est imposé à l'**IS** (15 % jusqu'à 42 500 €, 25 % au-delà) et tu te verses une **rémunération de gérant** comme en SELARL.",
      "**Côté social — DSFU (volet PAMC)** : ta rémunération brute va en **DSEC** (comme un gérant SEL), et tu coches **DSDI** (statut « société à l'IS » au sens social). **Ne pas remplir DSDE** (réservé aux EI à l'IR).",
      "**Côté fiscal personnel** : ta rémunération de gérant est imposée en **traitements et salaires** (1AJ/1BJ) **OU** en BNC selon l'arbitrage gérance majoritaire (rare en EI-IS). Vérifier avec ton expert-comptable selon la nature exacte de l'option.",
      "⚠️ **Limites par rapport à la SELARL** : pas de capacité d'**apport à une holding (SPFPL)**, pas de **régime mère-fille** sur les dividendes (puisqu'il n'y a pas de titres de société à transférer). L'option EI-IS est principalement pour **lisser l'imposition** et bénéficier du taux IS, **pas** pour structurer un patrimoine professionnel.",
      "⚠️ **Pas de coûts de structure société** (pas de greffe, pas de capital, pas de commissaire aux comptes < seuils) — c'est l'**avantage principal** vs SELARL.",
      "**Option révocable les 5 premières années** puis irrévocable. Anticiper la stratégie patrimoniale avant de basculer (passage à l'IR ensuite = liquidation imposable de l'actif net professionnel).",
      "Sources : CGI art. 1655 sexies + BOI-IS-CHAMP-40 (doctrine en cours d'appropriation, peu de praticiens et peu de jurisprudence URSSAF spécifique aux médecins)."
    ],
    faqPertinentes: ["QT-005","QT-017","QT-044","QT-047"]
  }
];

export const questionsFAQ: QuestionReformule[] = [
  {
    id: "QT-001",
    question: "Dois-je déclarer mon CA réel si mon SNIR est inférieur ?",
    reponse: "Oui, toujours déclarer le CA réel. L'administration ne s'alerte pas si tu déclares plus que ce qu'elle estime.",
    certitude: "confirmed",
    tags: ["SNIR", "CA", "Déclaration", "Contrôle"],
    theme: "declarations",
    relatedCases: ["DSCS", "DSAV", "5HQ"],
    relatedTerms: ["snir", "comptabilite-caisse"],
    relatedFiches: ["regle-RO-001"],
  },
  {
    id: "QT-002",
    question: "Mon compte CARMF est vide après bascule RSPM vers PAMC, est-ce normal ?",
    reponse: "Oui, c'est courant. La transition n'est pas toujours fluide. Il faut souvent créer un NOUVEL espace personnel sur le site de la CARMF, lié à ton nouveau numéro d'affiliation PAMC. L'ancien compte RSPM ne sera pas mis à jour. Les majorations de retard peuvent être retirées si le problème est administratif. N'hésite pas à appeler plusieurs fois en changeant d'interlocuteur.",
    certitude: "consensus",
    tags: ["CARMF", "URSSAF", "RSPM", "PAMC", "Bug administratif"],
    theme: "ij-prevoyance",
    relatedTerms: ["carmf", "rspm", "pamc"],
    relatedFiches: ["regle-RO-013"],
  },
  {
    id: "QT-003",
    question: "Comment gérer le forfait structure à 0€ en première année d'installation ?",
    reponse: "Il est fréquent que des erreurs surviennent la première année. Assure-toi d'avoir rempli et envoyé tous les justificatifs dans les délais. Fais une réclamation auprès de l'assurance maladie. Une mise à jour logiciel avant le 31 décembre peut aussi être en cause.",
    certitude: "consensus",
    tags: ["Forfait structure", "Installation", "Erreurs", "Réclamation"],
    theme: "comptabilite",
    relatedTerms: ["rosp"],
  },
  {
    id: "QT-004",
    question: "Quelles cases remplir pour ma 2035 et DSFU (ex DS-PAMC) si je suis au réel et conventionné ?",
    reponse: "En 2042C, c'est la case 5QC (bénéfice net). Pour la partie PAMC de la DSFU, DSCS (CA total), DSAV (égal à DSCS si 100% conventionné), DSDE (Revenu Brut Social, = DD de la 2035). DSAU sera 1 automatiquement. Il existe des calculettes pour aider au report.",
    certitude: "confirmed",
    tags: ["2035", "DSFU (ex DS-PAMC)", "Réel", "Conventionné", "Calcul"],
    theme: "declarations",
    relatedCases: ["2035", "5QC", "DSCS", "DSAV", "DSDE", "DD"],
    relatedTerms: ["bnc-reel", "ds-pamc", "secteur-1-2"],
    relatedFiches: ["regle-RO-008", "regle-RO-014"],
  },
  {
    id: "QT-005",
    question: "Quelle est la définition des 'charges non professionnelles' déductibles dans la partie DB de la 2035 ?",
    reponse: "Il s'agit de charges liées à une autre activité indépendante, si elle est significative (ex: location immobilière importante hors LMNP simple). Cela ne concerne pas les charges médicales habituelles.",
    certitude: "confirmed",
    tags: ["2035", "DB", "Charges", "Déductions"],
    theme: "regime-fiscal",
    relatedCases: ["DD", "DSDE"],
    relatedTerms: ["bnc-reel", "charges-deductibles"],
  },
  {
    id: "QT-006",
    question: "Les IJ Madelin (prévoyance privée) sont-elles imposables et soumises à cotisations sociales ?",
    reponse: "Oui (hors ALD). Les IJ Madelin perçues hors ALD sont **imposables à l'IR** (à déclarer en gains divers, case AF de la 2035 en réel ; recettes 5HQ en micro-BNC) **et soumises aux cotisations sociales** via la case **DSCZ (déclarant 1) / DSDZ (déclarant 2)** de la DSFU — montant **brut avant CSG/CRDS**, cumulé avec l'AJPA éventuelle.\n\n⚠️ **Ne jamais utiliser DSEM** pour les IJ Madelin : DSEM est réservée à l'épargne salariale en société à l'IS (intéressement, participation, abondement PER d'entreprise). Erreur très fréquente sur le web.\n\n**BNC réel** : les IJ Madelin entrent déjà dans le bénéfice via les gains divers (AF), donc dans le RBS du Cadre 8 de la 2035-B. Pour neutraliser le double-comptage social, le brut doit être reporté sur la **ligne DB du Cadre 8** (« Sommes à déduire pour la détermination du revenu brut social »). DSCZ informe l'URSSAF du brut perçu ; DB le déduit du RBS. L'**Aide 2035 d'Hippodoc** gère ce report DB automatiquement dès que tes IJ Madelin sont en AF. **Micro-BNC** : DSCZ reste obligatoire malgré la non-déductibilité des cotisations Madelin (noyées dans l'abattement 34 %, pas de mécanisme DB/Cadre 8).\n\n**ALD** : les IJ Madelin liées à une ALD sont exclues de DSCZ/DSDZ (hors assiette sociale).\n\n👉 **Vue d'ensemble** : voir le tableau récap *« Quel traitement fiscal et social pour chaque IJ ? »* (PC-014). Source : Guide PAMC URSSAF v1.0 du 09/04/2026, sec. 6.5.",
    certitude: "confirmed",
    tags: ["IJ Madelin", "Impôts", "Cotisations sociales", "DSCZ", "AJPA"],
    theme: "ij-prevoyance",
    relatedFiches: ["pepite-PC-014"],
    relatedQuestions: ["QT-023"],
    relatedCases: ["DSCZ", "DSDX"],
    relatedTerms: ["madelin", "ajpa", "dscz-dsdz", "invalidite-deces"],
  },
  {
    id: "QT-007",
    question: "Comment déclarer si j'étais RSPM en 2025 mais passe PAMC en 2026 ?",
    reponse: "Pour les revenus de 2025, si tu étais RSPM toute l'année, tu ne dois pas remplir les données complémentaires pour la déclaration des PAMC. **Cas micro-BNC (le plus fréquent)** : remplis uniquement la case 5HQ avec ton CA brut. **Cas BNC réel (rare en RSPM)** : remplis 5QC avec ton bénéfice 2035 (pas 5HQ). Dans les deux cas, aucune donnée PAMC à compléter. L'URSSAF a transmis cette information par mail.",
    certitude: "confirmed",
    tags: ["RSPM", "PAMC", "Transition", "Déclaration"],
    theme: "regime-fiscal",
    relatedCases: ["5HQ", "DSCS"],
    relatedTerms: ["rspm", "pamc"],
    relatedFiches: ["regle-RO-014"],
  },
  {
    id: "QT-008",
    question: "Comment déclarer une activité libérale HN (hors nomenclature) pour touristes/étrangers quand on est secteur 1 ?",
    reponse: "Il s'agit d'honoraires non conventionnés. Tu peux les déclarer sur le même SIRET/URSSAF/CARMF que ton activité conventionnée. Tenir une comptabilité séparée pour ces recettes peut être utile, mais cela reste des honoraires non soumis à TVA tant que la 'compta séparée' ne suggère pas une activité de services distincte.",
    certitude: "consensus",
    tags: ["HN", "Non conventionné", "TVA", "SIRET"],
    theme: "cotations",
    relatedTerms: ["honoraires", "tva-exoneration"],
  },
  {
    id: "QT-009",
    question: "Quel est le coût moyen d'un comptable pour un médecin libéral et est-ce toujours nécessaire ?",
    reponse: "Compte plutôt 150–400€/an pour une AGA médicale (assistance déclarative seule) et 1 500–3 500€/an pour un expert-comptable spécialisé en régime réel (selon la complexité : amortissements, SEL, holding, etc.). Certains médecins font eux-mêmes avec des logiciels comme Indy, même en réel. Côté logiciel, **Hippodoc** se positionne sur la même logique d'autonomie : il pré-remplit les cases 2035, 2042-C-PRO et DSFU à partir de tes encaissements et calcule le Super-Net en continu.",
    certitude: "consensus",
    tags: ["Comptable", "AGA", "Coût", "Gestion", "Indy"],
    theme: "comptabilite",
    relatedTerms: ["aga"],
    relatedFiches: ["zone-ZG-003"],
  },
  {
    id: "QT-010",
    question: "J'ai un bug pour payer l'URSSAF en ligne, que faire ?",
    reponse: "Les bugs informatiques sont fréquents. Si tu es à l'étranger, essaie un VPN. Sinon, contacte l'URSSAF par message après le délai, en demandant le retrait des pénalités de retard. Souvent, cela fonctionne, surtout si le bug est avéré.",
    certitude: "consensus",
    tags: ["URSSAF", "Bug", "Paiement", "Pénalités"],
    theme: "optimisation",
    relatedTerms: ["urssaf"],
    relatedFiches: ["regle-RO-013"],
  },
  {
    id: "QT-011",
    question: "Puis-je coter IMT à 60€ pour des nouveaux patients en ALD ?",
    reponse: "Oui, aucun problème, cette cotation est reconnue et ne génère pas de rejets si le patient est bien en ALD et que tu es bien le nouveau médecin traitant. Tu peux aussi coter MPH pour la récupération de dossier (non cumulable avec MD si même acte).",
    certitude: "confirmed",
    tags: ["IMT", "ALD", "Cotation", "Médecin traitant"],
    theme: "cotations",
    relatedTerms: ["cotation-ngap-ccam"],
  },
  {
    id: "QT-012",
    question: "Le tiers payant total pour un acte IMT ALD est-il possible ?",
    reponse: "Oui, la cotation IMT est pour les patients ALD, donc elle est prise en charge à 100% par la CPAM, ce qui permet de faire un tiers payant total si la consultation est en lien avec l'ALD.",
    certitude: "confirmed",
    tags: ["Tiers payant", "IMT", "ALD", "CPAM"],
    theme: "cotations",
    relatedTerms: ["tiers-payant", "cotation-ngap-ccam", "cpam"],
  },
  {
    id: "QT-013",
    question: "Puis-je changer de régime fiscal (Micro-BNC ou Réel) ?",
    reponse: "Le passage du micro-BNC au réel suppose deux choses : (1) avoir levé l'option pour le réel auprès de ton SIE (par courrier/messagerie sécurisée avant le 1er février N pour l'année N, ou directement cochée sur la déclaration de revenus dans certains cas), et (2) avoir tenu une comptabilité au réel dès le 1er janvier. La compta seule ne suffit pas : sans option formelle, l'administration considère que tu restes en micro-BNC. L'option est valable 1 an et reconductible tacitement. Le retour au micro-BNC est possible l'année suivante si ton CA reste sous le plafond en vigueur (83 600€ en 2026). Pas de bascule rétroactive possible.\n\n👉 **À ne pas confondre** : voir QT-014 — le régime fiscal et le régime social sont indépendants.",
    certitude: "confirmed",
    tags: ["Micro-BNC", "Régime réel", "Changement", "Comptabilité"],
    theme: "regime-fiscal",
    relatedFiches: ["regle-RO-007"],
    relatedQuestions: ["QT-014"],
    relatedCases: ["5HQ", "5QC", "2035"],
    relatedTerms: ["micro-bnc", "bnc-reel", "comptabilite-caisse"],
  },
  {
    id: "QT-014",
    question: "Le choix du régime fiscal (Micro-BNC/Réel) et social (RSPM/PAMC) sont-ils liés ?",
    reponse: "Non, ces deux régimes sont **totalement indépendants**. Le régime **fiscal** (Micro-BNC ou Réel) gère ton impôt sur le revenu (cases 5HQ ou 5QC sur la 2042-C-PRO). Le régime **social** (PAMC ou RSPM) gère tes cotisations URSSAF + CARMF (DSFU pour le PAMC). Tu peux très bien être en Micro-BNC + PAMC (cas le plus fréquent des remplaçantes ayant dépassé le plafond RSPM), ou en BNC réel + RSPM (temporairement). Conséquence pratique : une remplaçante en micro-BNC + PAMC doit remplir **5HQ côté impôts** *ET* **DSCS + DSAV côté URSSAF**, pas l'un ou l'autre. Voir la règle d'or *« Fiscal ≠ Social : deux régimes indépendants, deux déclarations »* pour le détail.",
    certitude: "confirmed",
    tags: ["Régime fiscal", "Régime social", "Micro-BNC", "PAMC", "RSPM"],
    theme: "regime-fiscal",
    relatedFiches: ["regle-RO-014"],
    relatedQuestions: ["QT-013", "QT-007", "QT-021"],
    relatedCases: ["5HQ", "5QC", "DSCS"],
    relatedTerms: ["micro-bnc", "bnc-reel", "pamc", "rspm", "ds-pamc"],
  },
  {
    id: "QT-015",
    question: "La réforme de la facture électronique concerne-t-elle les factures aux particuliers ?",
    reponse: "Non, la réforme concerne principalement la facturation entre entreprises (B2B). Les factures aux particuliers ne sont pas obligatoirement soumises à ce système. Certains logiciels comptables proposeront des solutions.",
    certitude: "confirmed",
    tags: ["Facture électronique", "Particuliers", "Logiciel", "Réforme"],
    theme: "cotations",
    relatedTerms: ["honoraires"],
  },
  {
    id: "QT-016",
    question: "Comment déclarer la revente de matériel médical amorti ?",
    reponse: "Il ne s'agit pas d'une 'recette en plus' mais plutôt d'une 'charge en moins'. Si le matériel a été amorti, la cession génère une **plus-value professionnelle** (prix de cession − valeur nette comptable) à reporter sur la 2035. Tu peux la calculer toi-même via le module **Aide 2035** d'Hippodoc (rubrique amortissements + plus-values), ou la faire vérifier par ton comptable / AGA si tu es accompagné(e). Régime court terme (≤ 2 ans de détention) : imposition au barème IR + cotisations sociales. Long terme (> 2 ans, sur la part > amortissements pratiqués) : 12,8 % + 17,2 % de prélèvements sociaux.",
    certitude: "confirmed",
    tags: ["Matériel médical", "Amortissement", "Revente", "Plus-value"],
    theme: "comptabilite",
    relatedCases: ["2035"],
    relatedTerms: ["plus-value", "amortissement", "bnc-reel"],
  },
  {
    id: "QT-017",
    question: "Est-ce avantageux d'investir via une holding lorsqu'on est en SEL ?",
    reponse: "Oui, une holding (SPFPL ou patrimoniale) permet d'investir avec un effet de levier fiscal plus important qu'en direct (moins d'impôts sur les dividendes qui remontent). Cela demande une structure complexe et des objectifs patrimoniaux clairs. Le risque d'abus de droit existe si la rémunération est anormalement basse par rapport à l'activité.",
    certitude: "consensus",
    tags: ["Holding", "SEL", "Optimisation fiscale", "Dividendes", "Investissement"],
    theme: "optimisation",
    relatedCases: ["DSDI", "DSEC", "DSSC"],
    relatedFiches: ["zone-ZG-004"],
  },
  {
    id: "QT-018",
    question: "Comment déduire un loyer professionnel de son domicile personnel ?",
    reponse: "Il est possible de déduire une partie des frais liés à ton domicile (loyer, charges, électricité, internet) au prorata de la surface utilisée professionnellement. Cependant, le loyer que tu te verses à toi-même doit être déclaré comme revenu foncier, ce qui réduit souvent l'intérêt fiscal global.",
    certitude: "confirmed",
    tags: ["Loyer professionnel", "Domicile", "Déduction", "Revenus fonciers"],
    theme: "comptabilite",
    relatedCases: ["4BE", "2035"],
    relatedTerms: ["foncier-micro", "bnc-reel"],
    relatedFiches: ["zone-ZG-002"],
  },
  {
    id: "QT-019",
    question: "Est-il obligatoire de déposer les recettes en espèces sur un compte pro ?",
    reponse: "Non, il n'est pas obligatoire de déposer toutes les espèces sur un compte pro, mais elles doivent être enregistrées scrupuleusement dans ta comptabilité (livre des recettes). Certains médecins les utilisent pour des dépenses personnelles en les notant comme 'prélèvements personnels' — c'est toléré tant que la traçabilité est parfaite. ⚠️ En contrôle, l'administration peut présumer une recette non déclarée si les espèces ne sont pas justifiées par une comptabilité rigoureuse. Le passage par le compte pro reste la solution la plus sûre.",
    certitude: "confirmed",
    tags: ["Espèces", "Compte pro", "Prélèvements personnels", "Comptabilité"],
    theme: "comptabilite",
    relatedTerms: ["comptabilite-caisse", "comptabilite-caisse"],
  },
  {
    id: "QT-020",
    question: "Comment déclarer si mon CA est en ZFU et Micro-BNC (remplaçant) ?",
    reponse: "Pour un remplacement en ZFU, si le titulaire est éligible à l'exonération, tu l'es aussi. En micro-BNC, réduis ton CA global en 5HQ des revenus bruts réalisés en ZFU. Inscris la part nette (revenus ZFU × 0,66) en **5HP** (case dédiée aux régimes zonés ZFU/ZRR/JEI). Si tu es en PAMC, reporte aussi le montant **net** (×0,66) en **DSFA** (case sociale) pour que l'URSSAF cotise correctement. ⚠️ Ne confonds pas avec la PDSA, qui va en DSFA mais **JAMAIS** en 5HP. ⚠️ **Plafond 50 000 € proratisé** au nombre de mois d'exonération effective l'année d'installation ou de basculement de palier (CGI Art. 49 K ann. III) — détail QT-049.",
    certitude: "confirmed",
    tags: ["ZFU", "Micro-BNC", "Remplaçant", "Exonération", "Prorata"],
    theme: "declarations",
    relatedCases: ["5HQ", "5HP", "DSFA"],
    relatedTerms: ["zfu-te", "micro-bnc", "pdsa"],
    relatedFiches: ["regle-RO-006"],
    relatedQuestions: ["QT-049"],
  },
  {
    id: "QT-021",
    question: "Dois-je remplir la PAMC si j'étais au RSPM toute l'année 2025 ?",
    reponse: "Non. Si tu étais au RSPM du 1er janvier au 31 décembre 2025, tu ne dois PAS remplir les données complémentaires PAMC (DSCS, DSAV, DSAW, DSAU, etc.). L'URSSAF a confirmé cette position par mail. Remplis uniquement la case 5HQ avec ton CA brut (sans l'abattement de 34%). Si la case PAMC est cochée d'office et non modifiable sur le site des impôts, contacte l'URSSAF par messagerie pour faire corriger. 💡 **Hippodoc** t'alerte dès que tes encaissements YTD franchissent le seuil ~38k€ pour que tu mettes à jour ton régime social dans ton profil — la bascule RSPM → PAMC reste un acte administratif que toi seul(e) peux déclencher avec l'URSSAF.",
    certitude: "confirmed",
    tags: ["RSPM", "PAMC", "Transition", "DSCS", "DSAV", "Déclaration"],
    theme: "declarations",
    relatedCases: ["5HQ", "DSCS"],
    relatedTerms: ["rspm", "pamc"],
    relatedFiches: ["regle-RO-014"],
  },
  {
    id: "QT-022",
    question: "DSCS et DSAV doivent-ils être identiques si je suis 100% conventionné ?",
    reponse: "Oui. Si toute ton activité est conventionnée (pas de HN, pas de non conventionné), alors DSAV = DSCS. Le ratio DSAU se mettra automatiquement à 1. Si DSAV est pré-rempli avec le SNIR et qu'il diffère de DSCS, corrige DSAV pour qu'il soit égal à DSCS. Le SNIR est souvent incomplet et inférieur au CA réel.\n\n⚠️ **Pourquoi c'est critique en secteur 1** : la **règle officielle** est nette — la PCC est perdue dès que **DSAU < 1 strictement**. Conséquence : tes cotisations maladie passent de ~0,1 % à ~8,5 % (taux 2026 après réforme), soit **cotisations quasi doublées** sur l'année. En **secteur 2 OPTAM**, pas de PCC à perdre donc l'impact financier est moindre, mais il faut quand même corriger pour la cohérence. **Marge de sécurité avant d'envoyer la DSFU** : viser DSAU ≥ 0,9 (si tu es en dessous, vérifie qu'aucun revenu conventionné n'a été mal classé).",
    certitude: "confirmed",
    tags: ["DSCS", "DSAV", "DSAU", "Conventionné", "PAMC", "SNIR"],
    theme: "declarations",
    relatedCases: ["DSCS", "DSAV", "DSAU"],
    relatedTerms: ["snir", "ds-pamc"],
    relatedFiches: ["regle-RO-001", "regle-RO-012"],
  },
  {
    id: "QT-023",
    question: "Où déclarer mes IJ Madelin sur la DSFU (volet PAMC) ?",
    reponse: "**Case DSCZ (déclarant 1) / DSDZ (déclarant 2)** de la DSFU — montant **brut avant CSG/CRDS**, cumulé avec l'AJPA éventuelle. Hors ALD uniquement (les IJ Madelin liées à une ALD sont exclues de l'assiette sociale).\n\n⚠️ **Pas en DSEM** : DSEM est réservée à l'épargne salariale en société à l'IS (intéressement, participation, abondement PER d'entreprise). C'est une erreur très répandue sur le web.\n\n**BNC réel** : les IJ Madelin sont déjà dans le bénéfice via AF (gains divers). Pour neutraliser le double-comptage social, le brut doit être reporté sur la **ligne DB du Cadre 8** de la 2035-B. DSCZ informe l'URSSAF du brut perçu ; DB le déduit du RBS. L'**Aide 2035 d'Hippodoc** gère ce report DB automatiquement dès que tes IJ Madelin sont en AF. **Micro-BNC** : DSCZ obligatoire malgré la non-déductibilité des cotisations Madelin (pas de mécanisme DB/Cadre 8 en micro).\n\n👉 **Vue d'ensemble** : voir le tableau récap *« Quel traitement fiscal et social pour chaque IJ ? »* (PC-014). Source : Guide PAMC URSSAF v1.0 du 09/04/2026, sec. 6.5.",
    certitude: "confirmed",
    tags: ["IJ Madelin", "DSCZ", "DSDZ", "DSFU", "AJPA"],
    theme: "ij-prevoyance",
    relatedFiches: ["pepite-PC-014"],
    relatedQuestions: ["QT-006"],
    relatedCases: ["DSCZ", "DSDX"],
    relatedTerms: ["madelin", "ajpa", "dscz-dsdz", "bnc-reel"],
  },
  {
    id: "QT-024",
    question: "Comment fonctionnent les forfaits 2 %, 3 % et Groupe III en BNC réel ?",
    reponse: "Ce sont trois déductions supplémentaires qui s'empilent sur les charges réelles, réservées au BNC réel Secteur 1. Elles vont en cases dédiées **DF / DG / DH** ligne 43 de la 2035-B (et non en case CQ comme avant). **Forfait 2 % (case DF)** : 2 % des recettes brutes totales (AA conventionné + AF gains divers + dépassements + redevances de collaboration perçues + IJ) — couvre représentation, prospection, blanchissage, cadeaux, petits déplacements ; accessible dès la 1ère année d'installation, sans justificatif. **Forfait 3 % (case DG)** : 3 % des seuls honoraires conventionnels AA, hors PDSA exonéré, hors dépassements (DE/DP), HN, MSU, expertises, études cliniques et IJ Madelin. **Groupe III (case DH)** : déduction conventionnelle fixe de 3 050 €/an, non disponible la 1ère année d'installation. **Les trois sont cumulables** (DF + DG + DH) depuis l'imposition des revenus 2023 — la suppression de la majoration de l'art. 158, 7 CGI a rendu sans objet l'ancienne condition de non-cumul DG/DH (BOI-BNC-SECT-40 ; UNASA Guide 2035-2026 §391 p. 92-93). Pour 100 000 € de CA conventionné en S1 : 2 000 € + 3 000 € + 3 050 € ≈ 8 050 € de déduction fiscale supplémentaire, soit 2 400 à 3 700 € d'impôt économisé selon la TMI. C'est l'argument central pour basculer du micro-BNC vers le réel. **Réforme 2026** : la case **DSCO est supprimée**. DG et DH sont désormais réintégrés socialement via le RBS du Cadre 8 de la 2035-B, reporté en **DSDE** sur la 2042. Seul le 2 % (DF) reste exonéré socialement. ⚠️ L'adhésion AGA n'est plus un critère d'éligibilité depuis la suppression de la majoration (revenus 2023). ⚠️ Le 2 % reste incompatible uniquement avec la déduction des frais réels de même nature (poste 30 « représentation »).",
    certitude: "confirmed",
    tags: ["Forfait 2%", "Forfait 3%", "Groupe III", "BNC réel", "AGA", "Secteur 1", "Optimisation", "Réforme 2026"],
    theme: "optimisation",
    relatedCases: ["2035", "DF", "DG", "DH", "DSDE", "5QC"],
    relatedTerms: ["secteur-1-2", "groupe-iii", "bnc-reel"],
    relatedFiches: ["regle-RO-008", "zone-ZG-008"],
  },
  {
    id: "QT-025",
    question: "Puis-je déduire mes frais de repas pris seul au cabinet ?",
    reponse: "Oui, en BNC réel. La fraction déductible se situe entre le seuil minimum (5,35 €/repas en 2025) et le plafond (20,70 €/repas en 2025). Exemple : pour un repas à 18 €, tu déduis 18 − 5,35 = 12,65 €. Les repas avec un confrère pour discuter d'un dossier sont déductibles à 100 % en frais de représentation (pas de plafond). Conserver les tickets et noter le motif professionnel.",
    certitude: "confirmed",
    tags: ["Frais de repas", "BNC réel", "Charges", "Déductions", "2035"],
    theme: "optimisation",
    relatedCases: ["2035"],
    relatedTerms: ["bnc-reel", "frais-reels", "charges-deductibles"],
    relatedFiches: ["pepite-PC-012"],
  },
  {
    id: "QT-026",
    question: "Comment fonctionne le crédit d'impôt famille avec les CESU pré-financés ?",
    reponse: "Si tu achètes des CESU pré-financés via ton compte professionnel (Domiserve, Edenred, Sodexo) pour la garde d'enfants ou services à la personne, tu bénéficies d'un crédit d'impôt de 25% en case 8UZ. En BNC réel, les CESU sont aussi déductibles en charges sur la 2035. Pour 1 000€ de CESU en TMI 30%, l'économie cumulée atteint ~550-600€. Démarche : remplir le formulaire 2069-FA-SD, ajouter le 2069-RCI-SD sur impots.gouv (chercher 'famille'), reporter 25% en case 8UZ. Plafond du crédit : 1 830€/an. Ne pas confondre avec les CESU déclaratifs personnels (crédit 50% en 7DB).",
    certitude: "confirmed",
    tags: ["CESU", "Crédit d'impôt famille", "8UZ", "Garde d'enfants", "Optimisation"],
    theme: "optimisation",
    relatedCases: ["8UZ", "2035"],
    relatedTerms: ["ir"],
    relatedFiches: ["pepite-PC-006"],
  },
  {
    id: "QT-027",
    question: "La France Rurale Revitalisée (FRR) remplace-t-elle la ZRR ?",
    reponse: "Oui, depuis 2024 le dispositif ZRR est remplacé par le zonage France Rurale Revitalisée (FRR). L'exonération porte sur les bénéfices imposables, plafonnée à 300 000€ sur trois années glissantes. Différence majeure avec la ZFU : la FRR n'est PAS accessible aux remplaçants — il faut être titulaire ou collaborateur installé. Le zonage est révisé périodiquement par les ARS. Attention : le zonage 2026 ne s'applique qu'aux revenus 2026 (à déclarer en 2027). ZFU et FRR ne sont pas cumulables entre elles, mais cumulables avec l'exonération PDSA. ⚠️ **Le plafond est proratisé** au nombre de mois d'exonération effective l'année d'installation ou de basculement de palier (CGI Art. 49 K ann. III ; CE 18/07/2018 n° 412142) — détail QT-049.",
    certitude: "confirmed",
    tags: ["FRR", "ZRR", "Exonération", "Installation", "Zone rurale", "Remplaçant", "Prorata"],
    theme: "regime-fiscal",
    relatedCases: ["5HQ", "5HP", "5QB"],
    relatedTerms: ["zfrr", "zfu-te"],
    relatedQuestions: ["QT-049"],
  },
  {
    id: "QT-028",
    question: "Comment compter les 60 jours de PDSA pour l'exonération ?",
    reponse: "Règle de base : chaque période d'astreinte = 1 jour (samedi 12h-20h, samedi 20h-0h, dimanche 8h-20h, nuit 20h-8h). Exception : une nuit complète 20h-8h à cheval sur deux jours calendaires ne compte que pour 1 jour (dérogation BOFIP). Au-delà de 60 jours, deux méthodes BOFiP au choix : (a) **affectation réelle** — tu sélectionnes les 60 jours les mieux rémunérés ; (b) **forfaitaire** — PDSA totale × 60 / N jours effectués.\n\n👉 **Décompte détaillé, prorata remplaçant et justificatifs à conserver** : voir l'astuce *« PDSA en pratique »* (PC-003).",
    certitude: "confirmed",
    tags: ["PDSA", "60 jours", "Comptage", "Astreinte", "Exonération"],
    theme: "declarations",
    relatedFiches: ["pepite-PC-003", "regle-RO-006"],
    relatedCases: ["5HP", "5HQ"],
    relatedTerms: ["pdsa"],
  },
  {
    id: "QT-029",
    question: "Première déclaration mixte interne (salaire) + remplaçant (micro-BNC) : mon impôt à payer paraît énorme, est-ce normal ?",
    reponse: "Premier réflexe : **regarde l'impôt total annuel** (ligne « Montant de l'impôt sur les revenus » du récap), pas le PAS recalculé qui s'affiche tout en haut — ce dernier répartit ton impôt restant sur les mois à venir et peut sembler disproportionné. Ordre de grandeur pour 1 part fiscale : ~26 000 € de salaire d'interne + ~22 000 € de remplacements micro-BNC ≈ environ **4 600 € d'IR total**. Vérifie aussi que tu as bien renseigné la **case 5XI** (nombre de mois d'activité non salariée dans l'année) — cela permet à l'administration d'ajuster ton PAS futur au prorata, pas de modifier le calcul de l'impôt 2025 lui-même. Si l'écart reste important après ces vérifications, refais une simulation avec le simulateur Hippodoc en ajoutant ton salaire d'interne pour comparer.",
    certitude: "confirmed",
    tags: ["Première déclaration", "Interne", "Remplaçant", "Micro-BNC", "5HQ", "5XI", "PAS"],
    theme: "declarations",
    relatedCases: ["5HQ", "1AJ"],
    relatedTerms: ["micro-bnc", "pas", "ir"],
  },
  {
    id: "QT-030",
    question: "Pourquoi mes cotisations URSSAF font ~10 % de mon CA et pas 25 % comme on me l'a dit ?",
    reponse: "Parce que la fameuse règle « 25 % » est une idée reçue qui ne s'applique **pas** au médecin **secteur 1 conventionné en micro-BNC**. En réalité, en S1, l'URSSAF prélève surtout : **CSG/CRDS ≈ 9,7 %** (gros morceau) + **assurance maladie PCC ~0,1 %** (la CPAM prend en charge le reste grâce au conventionnement) + **allocations familiales souvent 0** sous certains seuils + **retraite et IJ marginaux** sur ces niveaux de revenus. Total : ~10 % du CA.\n\n**Exemple concret** : CA 49 633 € → cotisations annuelles ~13 000 €, exactement ce que retourne le simulateur officiel URSSAF. La règle « 25 % » que tu vois circuler vise plutôt les **secteur 2** (pas de PCC) ou des assiettes plus larges. **Ne provisionne pas 25 %** si tu es en S1 micro-BNC — tu te bloquerais inutilement de la trésorerie.\n\n💡 Hippodoc utilise les vrais barèmes URSSAF/CARMF pour estimer tes provisions au plus juste (modules `Aide PAMC` + Dashboard).",
    certitude: "confirmed",
    tags: ["URSSAF", "Micro-BNC", "Cotisations", "PAMC", "CSG", "Secteur 1", "PCC"],
    theme: "comptabilite",
    relatedCases: ["DSCS", "DSDE", "DSAV"],
    relatedTerms: ["pamc", "csg-deductible", "secteur-1-2", "urssaf"],
    relatedFiches: ["regle-RO-014"],
  },
  {
    id: "QT-031",
    question: "C'est quoi la « Contribution Additionnelle Maladie » (CAM 3,25 %) sur mon avis URSSAF ?",
    reponse: "La CAM (Contribution Additionnelle Maladie) est une **surtaxe d'assurance maladie de 3,25 %** appliquée **uniquement** sur la fraction de tes revenus **non conventionnels** quand tu es médecin **secteur 1**. Concrètement : honoraires hors nomenclature (HN) facturés à des patients hors parcours, certaines expertises, primes hors convention.\n\n**Ce qu'elle ne touche PAS** : les revenus conventionnés (consultations C/CS au tarif opposable), le DPC (qui est conventionné, voir PC-015), la ROSP (conventionnée), et les médecins secteur 2 dans leur ensemble (eux ont d'autres règles via OPTAM).\n\n**Ligne CAM à 0 € sur ton avis** = tu n'as pas (ou tu n'as pas déclaré) de revenus HN — c'est normal pour la majorité des S1. **Ligne CAM élevée inattendue** = vérifie que tu n'as pas mal classé du DPC, de la ROSP ou des actes conventionnés en gains divers / HN. Cette mauvaise classification fait aussi chuter ton ratio DSAU et te fait perdre la PCC (cf. CASE-006). Double peine.",
    certitude: "confirmed",
    tags: ["CAM", "URSSAF", "Secteur 1", "Hors nomenclature", "PAMC"],
    theme: "comptabilite",
    relatedCases: ["DSAV", "DSAW", "DSCS"],
    relatedTerms: ["pamc", "secteur-1-2", "optam", "urssaf"],
    relatedFiches: ["regle-RO-014"],
  },
  {
    id: "QT-032",
    question: "Pourquoi la case DSCO n'existe plus en 2026 ?",
    reponse: "La case **DSCO est supprimée par la réforme de l'assiette sociale 2026** (revenus 2025 et suivants). Avant, DSCO servait à réintégrer manuellement, dans l'assiette sociale, les déductions du Forfait 3 % (DG) et du Groupe III (DH) pour éviter qu'elles soient deux fois avantageuses (impôt + cotisations).\n\n**Ce qui change** : la réintégration est désormais **intégrée au calcul du Revenu Brut Social (RBS)** dans le **Cadre 8** de la 2035-B. Tu n'as plus rien à saisir manuellement.\n\n**Le nouveau parcours en 4 étapes (Secteur 1, BNC réel)** :\n\n1. **Compta** — Tu calcules ton bénéfice fiscal classique (recettes − charges).\n2. **2035-B ligne 43** — Tu portes les forfaits **DF (2 %)**, **DG (3 %)** et **DH (Groupe III)** dans leurs cases dédiées.\n3. **Cadre 8 → RBS** — La 2035-B calcule automatiquement : **RBS = Bénéfice fiscal + cotisations sociales (BK) + CSG déductible (BV) + DG + DH + DE − DB**. Le résultat va en case **DD** (positif) ou **DC** (négatif).\n4. **2042 (volet PAMC)** — Tu reportes DD en case **DSDE** (déclarant 1) ou **DSDF** (déclarant 2). L'URSSAF applique ensuite son **abattement forfaitaire de 26 %** en interne pour neutraliser les charges « moyennes » du métier.\n\n💡 **Résultat net** : seul le **2 % (DF)** reste exonéré socialement. Les **3 % (DG)** et **Groupe III (DH)** redeviennent socialement neutres, puis sont compensés par l'abattement de 26 % de l'URSSAF.\n\nSi ton AGA ou ton comptable te parle encore de DSCO en 2026, demande-lui le **RBS du Cadre 8** : c'est lui qui se reporte en DSDE.",
    certitude: "confirmed",
    tags: ["DSCO", "RBS", "Cadre 8", "Réforme 2026", "Secteur 1", "BNC réel", "DSDE"],
    theme: "comptabilite",
    relatedCases: ["DSCO", "DSDE", "DD", "DF", "DG", "DH", "2035"],
    relatedTerms: ["secteur-1-2", "bnc-reel", "pamc", "groupe-iii"],
    relatedFiches: ["regle-RO-008"],
  },
  // ============= Phase 9N — Combler 6 cases sans FAQ =============
  {
    id: "QT-033",
    question: "Pourquoi je vois la case BT à 56,52 € chaque année sur ma 2035-A ?",
    reponse: "BT est la **cotisation IJ CPAM obligatoire** pour tous les médecins PAMC (entrée en vigueur 2021, généralisée 2025). Taux **0,30 %** appliqué sur le Revenu Brut Social après abattement 26 %, encadré par un **plancher 56,52 € / plafond 423,90 €** pour les revenus 2025 (PASS 2025 = 47 100 €). Pour les revenus 2026 : ≈ 57,67 € / 432,54 €. Elle est **distincte** de BU (versements PER individuels) et BZ (Madelin facultatif retraite/prévoyance). En BNC réel, charge déductible à reporter en ligne BT de la 2035-A. En micro-BNC, déjà noyée dans l'abattement 34 %.",
    certitude: "confirmed",
    tags: ["BT", "IJ CPAM", "PAMC", "Cotisation obligatoire", "2035-A"],
    theme: "ij-prevoyance",
    relatedCases: ["BT", "DSDX"],
    relatedTerms: ["cotisation-ij-cpam-bt", "pamc", "carmf"],
    relatedFiches: ["regle-RO-013"],
  },
  {
    id: "QT-034",
    question: "Quelle différence entre 1AS, 1AZ et la ligne AF de la 2035 pour les IJ et pensions CARMF ?",
    reponse: "Trois cases TRÈS différentes — ne JAMAIS les confondre :\n\n• **1AS** (2042 « Pensions, retraites, rentes ») = **pension de retraite** CARMF (RB, RC, ASV) ou tout régime de retraite. Abattement automatique 10 %.\n• **1AZ** (même rubrique 2042) = **pension d'invalidité PERMANENTE** (rente CARMF invalidité-décès, pension invalidité CPAM permanente). Abattement 10 %.\n• **Ligne AF de la 2035-A** (en BNC réel) ou **case 5HQ** (en micro-BNC) = **IJ CARMF d'incapacité TEMPORAIRE** (Madelin obligatoire). C'est un revenu **BNC** (gain divers), PAS une pension.\n\n💡 Mémo : « retraite → 1AS, invalidité permanente → 1AZ, incapacité temporaire → BNC ». Source : Brochure DGFiP 2026 Part 3 + notice CARMF.",
    certitude: "confirmed",
    tags: ["1AS", "1AZ", "CARMF", "Pension", "IJ", "Invalidité"],
    theme: "ij-prevoyance",
    relatedCases: ["1AS", "1AZ"],
    relatedTerms: ["carmf", "pension-invalidite-carmf", "invalidite-deces"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "QT-035",
    question: "Mes cotisations PER/Madelin se déduisent en BU ou en 6QS ?",
    reponse: "**BU = vraie déduction**, **6QS = info plafond** — ce ne sont PAS deux déductions cumulables.\n\n• **BU (2035-A ligne 25)** : versements aux **nouveaux PER individuels** déductibles du bénéfice BNC dans la limite **Art. 154 bis CGI** (3 enveloppes indépendantes : retraite ≈ 87 135 € pour 2025, prévoyance ≈ 11 304 €, perte d'emploi ≈ 7 065 €). C'est cette case qui te fait économiser de l'IR.\n• **BZ (2035-A ligne 25)** : cotisations Madelin retraite/prévoyance (contrats existants ou prévoyance encore ouverte) — même mécanique de déduction Art. 154 bis.\n• **6QS / 6QT / 6QU (2042)** : **uniquement informative** — sert au calcul du plafond global d'épargne retraite reportable (Art. 163 quatervicies CGI = 10 % des revenus pro N-1, plafonné à 8 PASS). Ce n'est **PAS** une seconde déduction.\n\n📌 Réforme 2026 : depuis le 1er janvier 2026, **plus aucune case sociale URSSAF** pour ces cotisations (l'abattement 26 % du RBS Cadre 8 remplace l'ancien mécanisme). En micro-BNC : non déductibles séparément (l'abattement 34 % couvre tout).",
    certitude: "confirmed",
    tags: ["BU", "BZ", "6QS", "PER", "Madelin", "Plafond épargne retraite", "Art. 154 bis"],
    theme: "optimisation",
    relatedCases: ["BU", "6QS", "BT"],
    relatedTerms: ["per", "madelin", "plafond-epargne-retraite", "pass"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "QT-036",
    question: "Mes IJ Madelin reçues, je les déclare en DSEM ou en DSCZ ?",
    reponse: "**DSCZ — JAMAIS DSEM.** C'est une confusion ultra-fréquente sur le web.\n\n• **DSCZ (déclarant 1) / DSDZ (déclarant 2)** = **autres revenus de remplacement** : **IJ Madelin perçues hors ALD** + **AJPA** (Allocation Journalière du Proche Aidant). Brut avant CSG/CRDS, cumulé sur l'année. Obligatoire en réel comme en micro-BNC.\n• **DSEM (déclarant 1) / DSEN (déclarant 2)** = **épargne salariale IS uniquement** : intéressement, participation, abondement employeur PER d'entreprise. Concerne les gérants/associés de SEL — **rien à voir** avec les IJ Madelin.\n• **DSPC** = **abondement employeur PER en EI-IR** (cas spécifique, voir glossaire).\n\n⚠️ **IJ Madelin ALD** : exclues de DSCZ/DSDZ (hors assiette sociale).\n💡 En BNC réel, les IJ Madelin sont déjà dans le bénéfice via la ligne **AF** (gains divers) — pour neutraliser le double-comptage social, le brut est reporté en parallèle sur la **ligne DB du Cadre 8** de la 2035-B. L'**Aide 2035 Hippodoc** gère ce report automatiquement.\n\nSource : Guide PAMC URSSAF v1.0 du 09/04/2026, sec. 6.5.",
    certitude: "confirmed",
    tags: ["DSCZ", "DSEM", "IJ Madelin", "AJPA", "DSPC", "PAMC"],
    theme: "ij-prevoyance",
    relatedCases: ["DSCZ", "DSEM"],
    relatedTerms: ["dscz-dsdz", "dsem", "dspc", "madelin", "ajpa"],
    relatedFiches: ["pepite-PC-014"],
  },
  {
    id: "QT-037",
    question: "Comment déclarer mes vacations EHPAD / HAD / SSIAD / CMPP en DSAT ?",
    reponse: "Ces recettes (EHPAD à tarif non opposable, HAD, SSIAD, CMPP) sont **considérées comme NON conventionnelles** par l'URSSAF — elles impactent ton ratio PCC.\n\n**Règle d'or** :\n1. Inclus-les dans **DSCS** (CA total brut, comme tout le reste).\n2. **Isole-les** dans **DSAT** (montant net) pour que l'URSSAF puisse les sortir du calcul du ratio conventionné.\n3. Conséquence : ton **ratio DSAU = DSAV / DSCS** descend mécaniquement, ce qui peut te faire **perdre la PCC** (Prise en Charge des Cotisations maladie) si tu es secteur 1 et que DSAU < 1.\n\n💡 Si tu fais beaucoup d'EHPAD/HAD, c'est un sujet à anticiper : la perte de PCC fait passer ta cotisation maladie de ~0,1 % à ~8,5 % (taux 2026 après réforme). Vérifie aussi que ton comptable n'a pas catégorisé ces vacations en gains divers — sinon double pénalité (sortie de DSAV + sortie de DSAT).\n\n⚠️ Les forfaits S1 (DF 2 % / DG 3 % / DH Groupe III) **ne s'appliquent pas** sur la fraction EHPAD/HAD/SSIAD (hors champ conventionnel).",
    certitude: "confirmed",
    tags: ["DSAT", "EHPAD", "HAD", "SSIAD", "CMPP", "Ratio conventionné", "PCC"],
    theme: "comptabilite",
    relatedCases: ["DSAT", "DSAU", "DSAV", "DSCS"],
    relatedTerms: ["pamc", "pcc", "secteur-1-2"],
    relatedFiches: ["regle-RO-012"],
  },
  {
    id: "QT-038",
    question: "Mes dépassements d'honoraires (Secteur 2 / OPTAM) doivent-ils figurer en DSAW ?",
    reponse: "Oui — DSAW = **part des recettes brutes correspondant aux dépassements d'honoraires** réalisés sur l'année, à isoler du total DSCS.\n\n**Règle d'or** :\n• **Secteur 1** : DSAW = 0 (sauf cas particuliers de dépassements DE pour exigences personnelles patient).\n• **Secteur 2 / OPTAM-CO** : reporte le total annuel des dépassements (montant brut, déjà inclus dans DSCS).\n• Tes dépassements **n'entrent PAS** dans la base de calcul du **forfait 3 % conventionnel (DG)** — uniquement les honoraires conventionnels AA y sont éligibles.\n\n💡 L'URSSAF utilise DSAW pour calculer ton **ratio conventionné DSAU = DSAV / DSCS**. Si tu es S2 et que tu oublies DSAW, ton ratio reste correct (les dépassements sont dans DSCS), mais tu rates l'info statistique URSSAF/CARMF.\n\n⚠️ En **OPTAM**, les dépassements maîtrisés ouvrent droit à des avantages (PCC partielle, cotisations réduites) — bien remplir DSAW est une preuve de transparence.",
    certitude: "confirmed",
    tags: ["DSAW", "Dépassements", "Secteur 2", "OPTAM", "Ratio conventionné"],
    theme: "comptabilite",
    relatedCases: ["DSAW", "DSAV", "DSCS", "DSAU"],
    relatedTerms: ["secteur-1-2", "optam"],
    relatedFiches: ["zone-ZG-005"],
  },
  {
    id: "QT-039",
    question: "Je suis Déclarant 2 (conjoint·e) — comment je remplis ma déclaration ?",
    reponse: "En déclaration commune (mariage/Pacs), le **Déclarant 2** utilise des cases au code **décalé** d'une lettre/chiffre par rapport au Déclarant 1. Le sens fiscal est strictement identique.\n\n**Exemples les plus courants** :\n• Micro-BNC : **5HQ → 5IQ**\n• BNC réel (OGA) : **5QC → 5RC**\n• Recettes brutes PAMC : **DSCS → DSDS**\n• Conventionné PAMC : **DSAV → DSBV**\n• Salaires : **1AJ → 1BJ**\n• PDSA exonérée micro : **DSFA → DSFB**\n\n**Important** : la **2035** ne distingue PAS D1/D2 (elle est rattachée à un SIRET unique). C'est uniquement au moment du **report sur la 2042 et la DSFU** que la distinction s'opère.\n\n💡 **Astuce** : sur **/guide-declarations/calculette**, le toggle « Déclarant 1 / Déclarant 2 » bascule **tous les codes affichés** (badges des champs ET résultats) sans toucher aux montants. Idéal pour préparer la déclaration de ton conjoint·e.\n\n👉 Pour la liste complète, voir le glossaire « Déclarant 1 vs Déclarant 2 ».",
    certitude: "confirmed",
    tags: ["Déclarant 2", "Conjoint", "Pacs", "Mariage", "5IQ", "DSDS"],
    theme: "declarations",
    relatedCases: ["5HQ", "5QC", "DSCS", "DSAV", "DSDE", "DSFA"],
    relatedTerms: ["declarant-1-vs-2", "pamc"],
  },
  {
    id: "QT-040",
    question: "IJ CPAM hors ALD : pourquoi plus en case 1AJ en 2026 ?",
    reponse: "**Mise à jour 2026** : les indemnités journalières CPAM hors ALD ne sont **plus à déclarer en case 1AJ** (salaire). Le cadre fiscal considère qu'elles relèvent du **BNC** dès lors que tu es en activité libérale (cf. brochure pratique DGFiP 2026, p. 180).\n\n**Régime réel (2035)** :\n1. **AF** (L7 gains divers de la 2035) → reportées sur **5QC** (2042-C PRO)\n2. **DB cadre 8** (2035-B) → neutralisation pour sortir du **RBS** (évite le double comptage social)\n3. **DSDX** (2042) → reporter le **brut** (avant CSG) pour la réintégration sociale URSSAF\n\n**Micro-BNC** : voir QT-041 (régime spécifique : non imposable).\n\n💡 **Pourquoi ce changement ?** L'administration a clarifié que les IJ versées au titre d'une activité non salariée suivent le régime BNC. Le **case 1AJ reste réservé** aux IJ perçues au titre d'un emploi salarié (ex : médecin hospitalier en arrêt).\n\n⚠️ **Si ta CPAM a pré-rempli 1AJ ou DSDX avec un montant inexact** : tu as le droit (et le devoir) de **corriger à la baisse** en t'appuyant sur ton relevé Ameli annuel.",
    certitude: "confirmed",
    tags: ["IJ CPAM", "1AJ", "5QC", "AF", "DB", "DSDX", "Cadre 8"],
    theme: "declarations",
    relatedCases: ["5QC", "DSDX", "1AJ"],
    relatedTerms: ["pamc"],
    relatedQuestions: ["QT-041"],
  },
  {
    id: "QT-041",
    question: "IJ CPAM hors ALD en micro-BNC : où les déclarer ?",
    reponse: "**Doctrine 2026** (DGFiP brochure p. 180, notice 2042 millésime 2026) : en **micro-BNC**, les IJ CPAM hors ALD (maladie, maternité, paternité, AFRM, IFRP) sont **non imposables à l'IR**.\n\n**À faire** :\n• **5HQ / 5IQ** : **NE PAS** les inclure (l'abattement 34 % ne s'applique pas — elles n'entrent pas dans la base imposable).\n• **DSDX** (2042) : reporter le **brut** annuel (avant CSG/CRDS) pour la réintégration sociale URSSAF.\n\n**Pourquoi ?** Le forfait 34 % du micro-BNC est censé couvrir l'ensemble des charges professionnelles. L'administration considère que les IJ ne sont pas un revenu d'activité au sens du micro-BNC — elles sont donc **isolées** et exonérées d'IR (mais pas de cotisations sociales).\n\n💡 **À l'inverse**, en **régime réel**, les IJ sont imposables : voir **QT-040** (AF + DB + DSDX).\n\n⚠️ **IJ en ALD (Affection Longue Durée)** : totalement exonérées (IR + social) — à ne reporter nulle part.",
    certitude: "confirmed",
    tags: ["IJ CPAM", "Micro-BNC", "5HQ", "5IQ", "DSDX", "Non imposable"],
    theme: "declarations",
    relatedCases: ["5HQ", "DSDX"],
    relatedTerms: ["micro-bnc", "pamc"],
    relatedQuestions: ["QT-040"],
  },
  {
    id: "QT-042",
    question: "Puis-je cumuler les 3 forfaits Secteur 1 (2 % + 3 % + Groupe III) ?",
    reponse: "**Oui — les trois sont cumulables** depuis l'imposition des revenus 2023.\n\n**Source** : la suppression de la majoration prévue au 1° du 7 de l'art. 158 CGI (réforme du non-adhérent OGA) a rendu sans objet l'ancienne condition de non-cumul entre la déduction Groupe III (DH) et la déduction complémentaire 3 % (DG). Position confirmée par BOI-BNC-SECT-40 et reprise dans le Guide fiscal UNASA 2035-2026 §391, p. 92-93 : « *Les médecins conventionnés du secteur 1 ont donc intérêt à opter pour ces deux déductions forfaitaires.* »\n\n**En pratique pour un S1 en BNC réel** :\n• **DF (2 %)** sur recettes brutes totales — accessible dès la 1ère année.\n• **DG (3 %)** sur honoraires conventionnels (AA hors exclusions) — accessible dès la 1ère année.\n• **DH (3 050 €)** forfait fixe — accessible à partir de la **2ème année** d'installation.\n\n**Seule restriction** : le 2 % (DF) reste incompatible avec la déduction des **frais réels de même nature** (poste 30 : représentation, réception, prospection, cadeaux, blanchissage, petits déplacements). Le choix s'opère en début d'exercice.\n\n**Côté social (réforme 2026)** : DG et DH sont réintégrés via le RBS du Cadre 8 → DSDE. Le 2 % (DF) reste exonéré socialement.\n\n💡 La calculette `/guide-declarations/calculette` propose désormais l'option **Cumul 3 % + Groupe III** (recommandée) en plus des choix « 3 % seul » ou « Groupe III seul ».",
    certitude: "confirmed",
    tags: ["Forfait 2%", "Forfait 3%", "Groupe III", "Cumul", "BNC réel", "Secteur 1", "BOI-BNC-SECT-40"],
    theme: "optimisation",
    relatedCases: ["DF", "DG", "DH", "DSDE", "2035"],
    relatedTerms: ["secteur-1-2", "groupe-iii", "bnc-reel"],
    relatedQuestions: ["QT-024"],
    relatedFiches: ["regle-RO-008"],
  },
  {
    id: "QT-043",
    question: "Ma case DSDX (IJ CPAM) est pré-remplie avec un mauvais montant. Que faire ?",
    reponse: "**Bug national connu de la campagne 2026** : la CPAM transmet aux impôts un montant **brut** (avant précompte CSG/CRDS) au lieu du **net** attendu en DSDX, créant un écart systématique chez de nombreux médecins. CPAM, URSSAF et impôts ont confirmé le bug par téléphone.\n\n**Procédure officielle** :\n1. **Valider la déclaration d'impôt telle quelle** : la case DSDX est **non modifiable** sur impots.gouv.fr.\n2. **Côté IR** : aucun impact — l'IR est calculé sur le bénéfice BNC (5QC en réel, 5HQ en micro), pas sur DSDX. Tu ne paies donc pas trop d'impôt sur le revenu.\n3. **Côté URSSAF** : envoyer une **réclamation via la messagerie sécurisée** de ton espace URSSAF, en joignant ton **relevé fiscal annuel Ameli** (Espace assuré → Mes paiements → Attestation fiscale). Une régularisation des cotisations sociales sera faite par l'URSSAF.\n4. **Conserver les justificatifs** : relevé fiscal Ameli + accusé de réception URSSAF.\n\n💡 **Délai de régularisation** : non communiqué officiellement, mais plusieurs mois sont à prévoir.\n\n⚠️ **Ne pas annuler la déclaration d'impôt** en attendant — la rectification se fait uniquement côté social.",
    certitude: "consensus",
    tags: ["IJ CPAM", "DSDX", "Bug 2026", "URSSAF", "Réclamation", "Réforme"],
    theme: "declarations",
    relatedCases: ["DSDX", "5HQ"],
    relatedTerms: ["pamc"],
    relatedQuestions: ["QT-040", "QT-041"],
  },
  {
    id: "QT-044",
    question: "La case DSDI se remplit automatiquement avec le même montant que DSDE. Bug ou normal ?",
    reponse: "**Bug connu 2026 sur impots.gouv.fr** : pour un médecin en EI (entreprise individuelle), la case **DSDI** (réservée aux **gérants/associés de société**) se pré-remplit automatiquement à hauteur du montant DSDE. Plusieurs témoignages convergents (impôts contactés confirment et font remonter à l'URSSAF).\n\n**Que faire** :\n1. **Forcer DSDI à 0** dans le formulaire (case modifiable, contrairement à DSDX).\n2. **DSDE seul** doit contenir ton RBS (Revenu Brut Social = case DD du Cadre 8 de ta 2035-B).\n3. **Pas besoin de cocher DSAJ** (Exploitant individuel) : son affichage est parfois grisé selon les profils. La sélection de DSAP (installé) ou DSAQ (remplaçant) suffit.\n\n⚠️ **Si tu laisses DSDI = DSDE** : l'URSSAF te calculera des cotisations sur **2× ton RBS** (doublon mécanique). Tu recevras alors un mail de réclamation.\n\n💡 **DSDI te concerne uniquement si tu es gérant/associé de SELARL, SELAS ou SCP** — sinon c'est toujours 0.",
    certitude: "consensus",
    tags: ["DSDI", "DSDE", "Bug 2026", "EI", "RBS"],
    theme: "declarations",
    relatedCases: ["DSDE", "DSDI", "DD"],
    relatedTerms: ["pamc"],
    relatedQuestions: ["QT-032", "QT-045"],
  },
  {
    id: "QT-045",
    question: "J'ai reçu un remboursement URSSAF en 2026 pour des cotisations 2024-2025. Comment je le déclare ?",
    reponse: "**Règle générale (BNC réel)** : un remboursement URSSAF n'est **pas** un revenu d'activité — c'est soit une **cotisation négative**, soit un **produit exceptionnel sur exercice antérieur**, selon l'année d'origine des cotisations remboursées.\n\n**1. Remboursement N pour N (cotisations payées et remboursées la même année)**\nC'est le cas le plus simple. Le remboursement vient **réduire le poste de cotisations** :\n• Compte comptable **646** (cotisations sociales personnelles) → ligne **BK / L25** de la 2035-A, en moins.\n• Concrètement : tu inscris en BK le **net payé** (cotisations versées − remboursements reçus).\n\n**2. Remboursement N pour N-1 ou plus ancien (régularisation de cotisations passées)**\nLes cotisations N-1 ont déjà été déduites l'année dernière → le remboursement devient un **produit exceptionnel sur exercice antérieur** :\n• Compte comptable **772** (produits exceptionnels) → ligne **AB / L2** (gains divers) de la 2035-A.\n• Pas de minoration de BK cette année (sinon double prise en compte).\n\n**3. Ventilation impérative : ne pas mélanger CSG/CRDS non déductible avec les cotisations**\nL'URSSAF te rembourse **un mix** : cotisations maladie, allocations familiales, CSG déductible **ET** CSG/CRDS non déductible (2,4 %). Tu dois **ventiler** :\n• Part **cotis sociales obligatoires + CSG déductible** → compte 646 ou 772 selon l'année.\n• Part **CSG/CRDS non déductible** (2,4 %) → **rester séparée**, n'entre **ni** en BK, **ni** en AB. Sinon, tu paies de la CSG sur du remboursement de CSG (effet boule de neige).\n\nLa ventilation figure sur ton **attestation fiscale URSSAF** (urssaf.fr → Documents → Attestation fiscale annuelle).\n\n**4. Micro-BNC** : neutre — l'abattement forfaitaire 34 % (CGI Art. 102 ter) couvre forfaitairement toutes les charges, donc tu ne déclares ni les cotisations versées, ni les remboursements reçus. Aucune case à toucher.\n\n**5. Côté social (DSFU/PAMC) — réel uniquement**\nLes remboursements N pour N réduisent **automatiquement** ton RBS via la baisse de BK → DSDE diminue d'autant. Les remboursements N pour N-1+ augmentent AB → augmentent le bénéfice → augmentent DSDE. Aucune case sociale dédiée.\n\n💡 **Astuce pratique** : plutôt qu'un remboursement bancaire, **demande l'imputation sur tes prochaines échéances** (formulaire de demande d'imputation URSSAF). Tu évites toute écriture comptable côté 772 et tu fais l'économie d'un mouvement de trésorerie.\n\nSources : Notice URSSAF DSFU 2026 + Plan Comptable Général (comptes 646 et 772) + BOI-BNC-BASE-40-60-10 (régime des indemnités et remboursements).",
    certitude: "consensus",
    tags: ["Remboursement URSSAF", "Cotisations", "646", "772", "BK", "AB", "Régularisation"],
    theme: "declarations",
    relatedCases: ["DD", "DSDE"],
    relatedTerms: ["remboursement-urssaf", "bnc-reel", "pamc"],
    relatedQuestions: ["QT-004", "QT-032"],
  },
  {
    id: "QT-046",
    question: "Mon SNIR pré-rempli est inférieur à mon CA réel. Lequel l'emporte sur la DSFU ?",
    reponse: "**La vérité comptable l'emporte, toujours.** Le SNIR (Système National Inter-Régimes de la CPAM) est un **agrégat statistique** qui omet régulièrement certains flux :\n• Forfait médecin traitant (MT)\n• Forfait structure (RMT, ROSP)\n• Indemnités DPC versées par l'ANDPC\n• Recettes EHPAD / HAD à tarif opposable mais hors NGAP\n• Rétrocessions reçues d'un confrère (côté remplaçant)\n\nSi ton SNIR affiche 95 000 € mais ta 2035 (ligne AG) affiche 102 945 €, **DSCS doit valoir 102 945 €**. Tu **corriges** le pré-remplissage à la hausse.\n\n⚠️ **Risque si tu laisses DSCS = SNIR sous-estimé (en secteur 1)** : tes recettes conventionnées (DSAV) restant à leur niveau réel mais DSCS étant artificiellement baissé, le **ratio DSAU peut dépasser 1** sans conséquence immédiate. **MAIS** si l'inverse se produit (SNIR > compta réelle, plus rare), DSAV pré-rempli > DSCS → DSAU > 1 → cohérence cassée → contrôle URSSAF. Dans tous les cas : **DSCS et DSAV doivent matcher tes encaissements de l'année** (compta cash-basis BNC).\n\n**Réflexe systématique** :\n1. Télécharge ton SNIR (Espace ameli pro → Statistiques d'activité)\n2. Compare ligne par ligne avec ta ligne AA + AF de la 2035-A (ou tes encaissements en micro-BNC)\n3. Si écart > 1 % → corrige DSCS pour matcher la compta\n4. Conserve le SNIR + la justification de l'écart (forfait MT, DPC, EHPAD…) pour un éventuel contrôle\n\n💡 **Hippodoc** affiche un comparateur SNIR / compta dans la page `Aide DSFU – volet PAMC` et alerte sur les écarts > 1 %.\n\nSource : Notice URSSAF DSFU 2026 + Guide PAMC URSSAF v1.0 du 09/04/2026.",
    certitude: "consensus",
    tags: ["SNIR", "DSCS", "DSAV", "Pré-remplissage", "Compta cash-basis"],
    theme: "declarations",
    relatedCases: ["DSCS", "DSAV", "DSAU"],
    relatedTerms: ["snir", "pamc", "recettes-brutes-nettes"],
    relatedQuestions: ["QT-022", "QT-030", "QT-037"],
  },
  {
    id: "QT-047",
    question: "Je suis gérant de SELARL : la case DSDE seule ou DSDE/DSEC ventilées ?",
    reponse: "**Doctrine 2024+ (en cours de stabilisation 2026)** : les honoraires rétrocédés par la société au gérant, reportés en case **5QC** (BNC personnel après réforme 2024 — CGI Art. 92), se ventilent **proportionnellement** entre **DSDE** (RBS personnel BNC) et **DSEC** (rémunération brute gérance) sur la base du ratio **5QC / 1GB**.\n\n**Formule** :\n• `part_gerance = 5QC / 1GB` (rémunération de gérance / total rémunération brute société)\n• `DSEC = bénéfice_société × part_gerance`\n• `DSDE = bénéfice_société × (1 − part_gerance)`\n\n**Pourquoi cette ventilation** : depuis la réforme 2024, la rémunération de gérance est en BNC personnel (donc passe par 5QC), mais l'URSSAF doit séparer la part **assimilée traitements** (DSEC) de la part **bénéfice EI résiduel** (DSDE) pour appliquer les bonnes assiettes de cotisations sociales (taux gérance ≠ taux EI sur les forfaits sociaux).\n\n**Vs doctrine V1 « DSDE seul » (jusqu'à mi-2025)** : la version initiale post-réforme 2024 préconisait DSDE = bénéfice intégral, DSEC = 0. Cette doctrine a été **abandonnée** courant 2025 par défaut d'homogénéité de calcul URSSAF.\n\n⚠️ **À valider avec ton AGA / expert-comptable** : la pratique URSSAF n'est pas encore homogène sur tout le territoire. Conserver tes justificatifs et la formule de ventilation appliquée. Pour un médecin **en EI à l'IS** (option art. 1655 sexies CGI, voir PM-014), le mécanisme est différent : DSEC seul (rémunération de gérant), DSDE = 0, DSDI coché.\n\nSources : retours praticiens 2026 + Notice URSSAF DSFU 2026 (sec. 7.2) + BOI-BNC-CHAMP-10-40 (rémunération gérance SEL).",
    certitude: "consensus",
    tags: ["SELARL", "DSDE", "DSEC", "Ventilation", "5QC", "1GB", "Gérance"],
    theme: "declarations",
    relatedCases: ["DSDE", "DSEC", "5QC"],
    relatedTerms: ["dsdi-gerance-sel", "pamc"],
    relatedQuestions: ["QT-017", "QT-044"],
  },
  {
    id: "QT-048",
    question: "Pourquoi la case DSFA est-elle vide quand je suis au BNC réel ?",
    reponse: "**C'est normal — et c'est même la bonne doctrine.** En **BNC réel PAMC**, la PDSA exonérée d'IR (Art. 151 ter CGI — majorations CRD/CRS/CRN/VRN/VRS + forfaits PRD/PRN) n'a **rien à faire en DSFA** : elle est déjà réintégrée socialement par un autre chemin.\n\n**Le circuit en BNC réel** :\n1. Les majorations PDSA sont **comptabilisées en recettes** dans la 2035-A (avec le reste du CA conventionné).\n2. Elles sont **déduites du bénéfice fiscal** via la **ligne CI** de la 2035-B (« divers à déduire — exonération permanence des soins »).\n3. La **formule officielle du RBS** (Cadre 8, Cerfa 15945*08 millésime 2026) inclut **+ CI** : `RBS = CE − CN + BK + BV + Σ exonérations (CS+AW+CU+CI+CO+DG+CJ+DH) + DE − DB`.\n4. Le RBS positif part en **DSDE**, le RBS négatif en **DSDG**.\n5. Conclusion : **la PDSA est déjà réintégrée socialement via CI → RBS → DSDE/DSDG**. DSFA reste à 0.\n\n**Si tu remplis DSFA en réel = double cotisation URSSAF** sur la PDSA. C'est le piège n°2 classique (le n°1 étant de mettre la PDSA en 5HP, voir QT-020).\n\n**Pour qui DSFA/DSFB est utile** : uniquement les médecins **au PAMC en micro-BNC** (déclarant 1 → DSFA, déclarant 2 → DSFB). Formule : `DSFA = pdsaExonere × 0,66` (NET après abattement forfaitaire 34 %).\n\n**Cas particuliers** :\n• **RSPM** : pas de DSFU du tout — DSFA n'existe pas. Les cotisations sont calculées sur le CA total déclaré au RSPM (PDSA brute incluse, c'est normal — l'exonération est purement fiscale).\n• **EI à l'IS** (option art. 1655 sexies CGI, PM-014) : pas de DSFA non plus, la PDSA suit le bénéfice IS.\n\n💡 **Hippodoc gère ce piège automatiquement** : le module `Aide DSFU – volet PAMC` n'affiche DSFA/DSFB que si tu es en micro-BNC PAMC avec de la PDSA exonérée. En réel, la case est masquée pour éviter toute tentation de saisie manuelle.\n\nSources : Brochure DGFiP 2026 p. 180 + Notice URSSAF 52348#06 (sec. 6.5) + bible HippoDoc règles RO-006 / RO-015.",
    certitude: "confirmed",
    tags: ["DSFA", "DSFB", "PDSA", "BNC réel", "Micro-BNC", "PAMC", "CI", "DSDE"],
    theme: "declarations",
    relatedCases: ["DSFA", "CI", "DSDE", "DSDG", "5HP", "5HQ"],
    relatedTerms: ["pdsa", "declarant-1-vs-2"],
    relatedQuestions: ["QT-020", "QT-022", "QT-047"],
  },
  {
    id: "QT-049",
    question: "Comment proratiser le plafond ZFU/ZFRR l'année d'installation ?",
    reponse: "Le plafond annuel d'exonération ZFU-TE (**50 000 €**) est **ajusté au prorata du temps d'activité en zone, en mois entiers** (toute fraction de mois compte pour un mois entier — BOFiP **BOI-BIC-CHAMP-80-10-20-20 §80**) l'année d'installation. ⚠️ **C'est le PLAFOND qui est proratisé, PAS le bénéfice lui-même**. Le bénéfice réalisé pendant la période d'activité en zone est intégralement exonéré, dans la limite du plafond ajusté. ZFRR (Art. 44 quindecies) : plafond glissant 300 000 €/3 ans, pas de prorata annuel. Sources : **CGI Art. 44 octies A I** + **BOI-BIC-CHAMP-80-10-20-20 §80** (mois entiers — Art. 49 K annexe III et CE 412142 portent sur d'autres règles ZFU, pas sur le plafond annuel).\n\n**Formule correcte** :\n• `plafond_ajusté = 50 000 × (13 − mois_installation) / 12`\n• `bénéfice_zone = recettes_zone × 0,66 × taux_année` (PAS de prorata)\n• `5HP = min(bénéfice_zone, plafond_ajusté)`\n• Surplus éventuel → 5HQ (en recettes brutes équivalentes = surplus_bénéfice ÷ 0,66)\n\n**Exemple concret — installation en décembre 2025, recettes ZFU = 7 030 €** :\n• Bénéfice zone = 7 030 × 0,66 = 4 640 €\n• Plafond ajusté = 50 000 × 1/12 ≈ **4 167 €**\n• 5HP = min(4 640 ; 4 167) = **4 167 €**\n• Surplus brut équivalent en 5HQ = (4 640 − 4 167) ÷ 0,66 ≈ **717 €** → **5HQ = 717 €**\n\n**Exemple — installation en septembre 2025, recettes ZFU = 25 000 €** :\n• Bénéfice zone = 16 500 €\n• Plafond ajusté = 50 000 × 4/12 ≈ 16 667 €\n• 5HP = 16 500 € (sous plafond), 5HQ = 0 €\n\n👉 **Erreur fréquente** : appliquer un prorata aux RECETTES (ex. 7 030 × 31/365). Tu obtiendrais 5HP = 394 €, ce qui est **faux** : tu paierais l'IR sur des recettes que tu as pourtant gagnées en zone.\n\n💡 **Calculette Hippodoc (Phase 14.12)** : le champ **Mois d'installation** apparaît automatiquement sur `/guide-declarations/calculette` en ZFU année 1. Le plafond est ajusté en mois entiers ; le bénéfice n'est pas touché ; tout surplus part en 5HQ.\n\n**Volet social** : le prorata du plafond ne concerne **que le fiscal**. Les cotisations URSSAF/CARMF restent dues sur la totalité (DSCS = recettes brutes totales).",
    certitude: "confirmed",
    tags: ["ZFU", "ZFRR", "Prorata", "Installation", "Plafond", "5HP", "5QB"],
    theme: "declarations",
    relatedCases: ["5HP", "5HY", "5QB", "5HQ"],
    relatedTerms: ["zfu-te", "zfrr"],
    relatedFiches: ["regle-RO-006"],
    relatedQuestions: ["QT-020", "QT-027"],
  }
];


export const pepitesCachees: PepiteCachee[] = [
  {
    id: "PC-001",
    titre: "Optimisation de l'achat de matériel d'installation avec report au réel",
    description: "Si tu t'installes en fin d'année avec de grosses dépenses d'installation et es tenté par le micro-BNC pour cette première année, opte pour une 'revente' de tes achats de l'année N à ton entreprise (EI) début N+1. Cela permet de bénéficier du régime réel N+1 et de déduire ces charges sur une période plus favorable.",
    impact: "fort",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-004", "PM-001"],
    theme: "optimisation",
    relatedCases: ["5HQ", "2035", "5QC"],
    relatedTerms: ["micro-bnc", "bnc-reel", "amortissement"],
    relatedQuestions: ["QT-013"],
  },
  {
    id: "PC-002",
    titre: "Gestion des cotations en cas d'oubli de 'ALD/exo' sur des visites",
    description: "Si tu as oublié de cocher 'exo' pour des patients ALD, tu as plusieurs options : demander aux patients le remboursement (preuves à l'appui), faire des FSP papier en mode 'remplace et annule' pour que la sécu leur envoie la facture, ou en cas de refus, invoquer l'article 47 du Code de déontologie médicale (continuité des soins) pour justifier la poursuite du suivi du patient. Les montants non réglés ne sont pas imposables.",
    impact: "moyen",
    risque: "moyen",
    certitude: "consensus",
    profilsConcernes: ["PM-001", "PM-003"],
    theme: "vie-pratique",
    relatedTerms: ["cotation-ngap-ccam", "tiers-payant", "cpam"],
  },
  {
    id: "PC-003",
    titre: "PDSA en pratique : décompte des 60 jours, prorata remplaçant, justificatifs",
    description: "L'exonération fiscale des majorations et forfaits de gardes PDSA est compatible avec le micro-BNC. **Retirer les montants exonérés bruts de 5HQ.** ⚠️ **Ne RIEN reporter en 5HP** : cette case est exclusivement réservée aux régimes zonés (ZFU/ZRR/JEI). Reporter la PDSA en 5HP entraîne un double-comptage URSSAF (revenu net social = 0,66 × 5HQ + DSFA + 5HP). **Au PAMC** : reporter la part nette (×0,66) en **DSFA** (déclarant 1) ou **DSFB** (déclarant 2). **Au RSPM** : pas de DSFU, le CA brut total reste cotisé via les tranches RSPM. Plafond : 60 jours de garde/an. Comptage : 20h-0h = 1 jour, 12h-20h samedi = 1 jour, 08h-20h dimanche/JF = 1 jour, nuit complète 20h-8h = 1 jour (dérogation). Un samedi 12h-0h = 2 jours. Au-delà de 60j, tu choisis les jours les mieux rémunérés. Pour les remplaçants : l'exonération est au prorata de la rétrocession perçue (70 % de rétrocession perçue = 70 % des majorations exonérables) — position pratique largement admise, non formellement confirmée par le BOFiP. Justificatif idéal : attestation du remplacé mentionnant « dont X € déductibles en raison d'une PDSA en zone défiscalisée ». ⚠️ Seules les majorations NGAP spécifiques sont exonérables : CRD, CRS, CRN, VRN, VRS + forfaits d'astreinte CPAM. Le G, GS, MEG, MN et MM ne sont PAS concernés même s'ils sont réalisés pendant la garde. ⚠️ Ton cabinet n'a pas besoin d'être en ZIP — c'est le secteur de garde PDSA qui doit contenir au moins une commune classée ZIP par l'ARS. ⚠️ Le seuil micro-BNC se calcule sur le CA TOTAL brut (exo + non-exo), même si 5HQ ne montre que la part non-exonérée.",
    impact: "fort",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-002", "PM-008"],
    theme: "optimisation",
    relatedCases: ["5HQ", "DSFA"],
    relatedTerms: ["pdsa", "micro-bnc"],
    relatedQuestions: ["QT-028", "QT-020"],
  },
  {
    id: "PC-006",
    titre: "Crédit d'impôt famille pour les médecins libéraux",
    description: "Il est possible de bénéficier d'un crédit d'impôt famille pour la garde d'enfants de moins de 6 ans ou des services à la personne. Pour cela, il faut avoir acheté des chèques CESU via son compte professionnel. Le montant est déduit du chiffre d'affaires et ouvre droit à ce crédit.",
    impact: "moyen",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-002", "PM-004", "PM-012"],
    theme: "optimisation",
    relatedCases: ["8UZ"],
    relatedTerms: ["ir"],
    relatedQuestions: ["QT-026"],
  },
  {
    id: "PC-007",
    titre: "Optimisation de la prévoyance en consultant des courtiers",
    description: "Les offres de prévoyance de certains organismes peuvent être très coûteuses. Comparer via un courtier spécialisé permet souvent d'obtenir les mêmes garanties pour un coût divisé par deux, même avec l'âge (ex: 250€/mois au lieu de 430€).",
    impact: "fort",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-012"],
    theme: "vie-pratique",
    relatedTerms: ["madelin", "invalidite-deces"],
  },
  {
    id: "PC-008",
    titre: "Transfert IBAN pour simplifier les démarches",
    description: "Lors d'un changement de RIB professionnel, il n'est pas toujours nécessaire d'informer chaque organisme individuellement. Une adresse centralisée (souvent celle de la CPAM de ton département) peut transmettre l'information à l'ensemble des caisses (MGEN, MSA, autres CPAM) et même aux organismes comme l'HAD ou la faculté (pour les MSU).",
    impact: "faible",
    risque: "faible",
    certitude: "consensus",
    profilsConcernes: ["PM-001", "PM-002"],
    theme: "vie-pratique",
    relatedTerms: ["cpam", "carmf", "urssaf"],
  },
  {
    id: "PC-009",
    titre: "Négocier des plateformes de facturation électronique, même en HN",
    description: "La réforme de la facturation électronique ne s'applique pas aux particuliers. Si ton cabinet te facture une solution coûteuse pour des actes HN, sache que des banques et logiciels comptables proposent des solutions gratuites ou moins chères, et que les prix sont souvent négociables car la marge peut être importante.",
    impact: "moyen",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-003"],
    theme: "vie-pratique",
    relatedTerms: ["honoraires"],
  },
  {
    id: "PC-010",
    titre: "Gardes de régulation SAS (hors PDSA) = recettes conventionnées normales",
    description: "Les gardes de régulation libérale au SAMU/SAS en journée (hors PDSA) sont des honoraires conventionnés classiques. Pas de case spéciale ni de traitement particulier : elles rentrent dans DSCS et DSAV comme le reste de ton activité conventionnée. En BNC réel, elles entrent dans le CA de la 2035 ; en micro-BNC, elles s'ajoutent au CA en 5HQ.",
    impact: "faible",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-002"],
    theme: "declarations",
    relatedCases: ["DSCS", "DSAV", "5HQ"],
    relatedTerms: ["pdsa", "honoraires"],
  },
  {
    id: "PC-011",
    titre: "Vélo électrique déductible à 100% en charges professionnelles",
    description: "Un vélo ou vélo électrique acheté pour les déplacements professionnels (visites, domicile-cabinet) est déductible à 100% en charges sur la 2035, indépendamment des indemnités kilométriques voiture. La seule condition est de ne pas déclarer les mêmes trajets dans les deux barèmes (IK voiture + vélo). Pour un VAE à 2 500€, c'est 750 à 1 000€ d'économie d'impôt selon la TMI.",
    impact: "moyen",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-004"],
    theme: "optimisation",
    relatedCases: ["2035", "5QC"],
    relatedTerms: ["bnc-reel", "ik", "frais-reels", "charges-deductibles"],
  },
  {
    id: "PC-012",
    titre: "Frais de repas : seule la part entre 5,35€ et 20,70€ est déductible",
    description: "En BNC réel, les repas pris seul à proximité du cabinet sont partiellement déductibles. Seule la part entre le seuil forfaitaire (5,35€ en 2025) et le plafond (20,70€) est une charge professionnelle, soit au maximum 15,35€ par repas. Si tu déjeunes à 12€, tu peux déduire 12 - 5,35 = 6,65€. Conserver tous les justificatifs (tickets de caisse). Non applicable en micro-BNC (l'abattement 34% couvre tout). ✅ Cumulable avec le forfait 2% : les frais de repas sont un poste distinct (pas inclus dans le 2% qui couvre représentation, réception, prospection, blanchissage, petits déplacements).",
    impact: "moyen",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-003", "PM-004", "PM-011"],
    theme: "optimisation",
    relatedCases: ["2035"],
    relatedTerms: ["bnc-reel", "frais-reels", "charges-deductibles"],
    relatedQuestions: ["QT-025"],
  },
  {
    id: "PC-013",
    titre: "Barème kilométrique vs frais réels véhicule : le bon choix",
    description: "En BNC réel, deux options pour les frais de voiture : (1) Barème IK (simple, forfait par km selon puissance fiscale, couvre tout : carburant + assurance + entretien + dépréciation, majoré +20% pour les électriques). (2) Frais réels au prorata pro/perso (amortissement plafonné : 18 300€ thermique / 30 000€ électrique sur 5 ans + carburant + entretien + assurance). En LOA/LLD : déduction des loyers plafonnée = (plafond/5)/12 × % pro. 1er loyer majoré : déductible s'il ne dépasse pas 1/3 du total des loyers (Conseil d'État). Électrique : batterie amortissable séparément sur 3 ans ; « carburant » = électricité domicile estimée en nombre de pleins × capacité batterie (kWh) × prix du kWh. Barème BIC carburant ≠ barème IK BNC (le BIC ne couvre QUE le carburant, cumulable avec loyers/entretien). Plus-value à la revente : prix de vente − valeur comptable résiduelle, imposée à l'IR+PS. Le prorata pro/perso peut varier d'une année à l'autre. 💡 Conseil pratique : acheter en perso et déduire les IK est souvent le meilleur choix pour éviter les plus-values à la revente (sauf utilisation 100% pro avec peu de km). ⚠️ En micro-BNC : RIEN n'est déductible (ni IK, ni loyers, ni carburant) — tout est couvert par l'abattement forfaitaire de 34%.\n\n**🔁 Activité mixte salarié + libéral dans la même année** (ex. CESP 5 mois + remplas) : les frais réels km en option salariée sont déductibles **uniquement sur la période salariée** ET **uniquement pour les trajets liés à l'emploi salarié** (domicile-hôpital, déplacements de service). Les km libéraux restent traités côté BNC (barème IK 2035 si réel, ou inclus dans l'abattement 34 % si micro-BNC). **Double risque à éviter** : (1) déduire des km salariés sur une période postérieure à la fin du contrat ; (2) compter deux fois les mêmes km en salarié *et* en libéral.",
    impact: "fort",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-011", "PM-012"],
    theme: "optimisation",
    relatedCases: ["2035"],
    relatedTerms: ["ik", "frais-reels", "amortissement", "bnc-reel", "micro-bnc"],
  },
  {
    id: "PC-014",
    titre: "Tableau récap des IJ : quel traitement fiscal et social ?",
    description: "Les différentes IJ n'ont pas le même régime. Résumé (réforme 2026) :\n\n• **Cotisations Madelin versées** → déductibles fiscalement en BU/L25 de la 2035 (réel) dans la limite Art. 154 bis. **Plus aucune case sociale URSSAF** depuis 2026 : l'abattement forfaitaire 26 % sur le RBS remplace l'ancien mécanisme. Reportées pour information en 6QS/6QT/6QU sur la 2042 (calcul du plafond épargne retraite global, pas une 2ᵉ déduction).\n\n• **Cotisation IJ CPAM obligatoire (ligne BT, 2035-A)** → 0,30 % du RBS après abattement 26 %, plancher **56,52 €** / plafond **423,90 €** pour les revenus 2025 (PASS 2025 = 47 100 €) ; revenus 2026 ≈ 57,67 € / 432,54 €. Charge déductible du BNC en réel ; en micro-BNC, noyée dans l'abattement 34 %. **Distincte de BU** (Madelin volontaire). Voir CASE-031.\n\n• **IJ Madelin reçues (hors ALD)** → imposables IR (gains divers AF en réel, recettes 5HQ en micro) **et** réintégrées socialement en **DSCZ (déclarant 1) / DSDZ (déclarant 2)** brut avant CSG/CRDS, cumulées avec l'AJPA. ⚠️ **Pas en DSEM** (épargne salariale IS). En BNC réel, le brut doit aussi être reporté sur la **ligne DB du Cadre 8** de la 2035-B pour neutraliser le double-comptage social — l'Aide 2035 d'Hippodoc le fait automatiquement.\n\n• **AJPA (CAF)** → même traitement que les IJ Madelin : BNC + DSCZ/DSDZ + ligne DB en réel.\n\n• **IJ CARMF d'incapacité temporaire (hors ALD)** → imposables en BNC gain divers, ligne **AF** de la 2035-A en réel ou recettes **5HQ** en micro-BNC. Exonérée de cotisations sociales. **Jamais** en case 1AS ni 1AZ ni en DSFU.\n\n• **Pension d'invalidité permanente CARMF** (rente viagère invalidité-décès) → case **1AZ (déclarant 1) / 1BZ (déclarant 2)** de la 2042 (« Pensions, retraites et rentes »), abattement 10 % automatique plafonné 4 439 €/foyer. **Pas 1AS** (réservée aux pensions de retraite). Exonérée de cotisations sociales.\n\n• **IJ CPAM (hors ALD) — doctrine 2026 scellée (expert mai 2026)** :\n  – **BNC réel** : ligne **AF** (gains divers L7) de la 2035-A → reportées sur **5QC** ; miroir **ligne DB du Cadre 8** (2035-B) pour neutraliser le double-comptage social ; **DSDX/DSDY brut** sur la 2042 (volet PAMC). **JAMAIS en 1AJ** — la pré-tolérance « salaire » historique a été supprimée. Voir QT-040.\n  – **Micro-BNC** : **NON imposables IR** (DGFiP brochure 2026 p. 180) → **JAMAIS dans 5HQ/5IQ**. Seul report : **DSDX/DSDY brut** (volet social, normalement pré-rempli). Voir QT-041.\n  – **SEL/IS** : DSDX/DSDY brut (personnel) — JAMAIS en DSEC/DSED ni en 1AJ.\n\n• **Exception ALD (toutes IJ confondues)** : exonérées d'IR ; les IJ Madelin/CPAM ALD sont également exclues de DSCZ/DSDX.\n\n• **IJ non Madelin (prévoyance privée)** → exonérées fiscalement, soumises aux cotisations sociales si versées sur le compte pro.\n\n💡 Le tableau de bord **Hippodoc** classe automatiquement chaque type d'IJ dans la bonne case (2035, 2042 ou DSFU) et gère le report DB du Cadre 8 en réel. Source : Guide PAMC URSSAF v1.0 du 09/04/2026, sec. 6.5 + Brochure IR DGFiP 2026 Part 3 + doctrine expert mai 2026.",
    impact: "fort",
    risque: "moyen",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004", "PM-006", "PM-011"],
    theme: "ij-prevoyance",
    relatedCases: ["DSDX", "DSCZ", "1AJ", "1AZ", "BT"],
    relatedTerms: ["madelin", "ajpa", "cpam", "carmf", "dscz-dsdz", "ds-pamc", "pension-invalidite-carmf", "cotisation-ij-cpam-bt"],
    relatedQuestions: ["QT-006", "QT-023"],
  },
  {
    id: "PC-015",
    titre: "DPC : revenu conventionné, plafond strict 945 €/an (45 h × 21 €)",
    description: "Le DPC (Développement Professionnel Continu) indemnisé par l'ANDPC est plafonné à **45 actions × 21 €/h = 945 €/an** maximum. Surtout, il s'agit d'un **revenu conventionné** — il doit donc être inclus dans **DSAV** (recettes conventionnées) au même titre que tes consultations C/CS, **PAS** en gains divers ni en hors nomenclature (HN).\n\n⚠️ **Erreur fréquente** : classer le DPC en HN « parce que ce n'est pas une consultation ». Conséquence en cascade : (1) ton ratio DSAU tombe sous 1 → en secteur 1, perte de la PCC et cotisations maladie quasi doublées (cf. CASE-006) ; (2) tu déclenches à tort la **CAM 3,25 %** sur ce montant (cf. QT-031). Pour 945 € mal classés, tu peux perdre plusieurs centaines d'euros de cotisations supplémentaires.\n\n**Bon réflexe** : DPC + ROSP + forfaits structure conventionnés → tous dans DSAV/DSCS, jamais en HN.",
    impact: "moyen",
    risque: "faible",
    certitude: "confirmed",
    profilsConcernes: ["PM-001", "PM-003", "PM-004"],
    theme: "declarations",
    relatedCases: ["DSAV", "DSCS", "DSAU"],
    relatedTerms: ["pamc", "secteur-1-2"],
    relatedQuestions: ["QT-031", "QT-022"],
  }
];

export const bugsAdmin: BugAdmin[] = [
  {
    id: "BA-001",
    titre: "Décalage SNIR / CA réel",
    symptomes: ["SNIR reçu par l'Assurance Maladie est inférieur au CA réel facturé (ex: Doctolib)."],
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004"],
    causesProbables: ["Non prise en compte des remplacements antérieurs à l'installation.", "Absence des ROSP, revenus EHPAD, forfaits ou autres revenus non conventionnés/hétérogènes.", "Erreurs de calcul du côté de l'Assurance Maladie."],
    actionsPossibles: ["Déclarer le CA réel (supérieur au SNIR). La correction à la hausse est acceptée.", "Ne pas s'inquiéter si le SNIR est bas, car c'est le CA de ta comptabilité qui prévaut."],
    statut: "actif",
    certitude: "confirmed"
  },
  {
    id: "BA-002",
    titre: "Compte URSSAF/CARMF non fonctionnel après bascule RSPM -> PAMC",
    symptomes: ["Accès impossible aux fonctionnalités (paiement, échéanciers en ligne) après être passé du RSPM au PAMC.", "Compte CARMF vide ou inactif malgré l'envoi d'échéanciers papier.", "Message 'radié' sur l'URSSAF."],
    profilsConcernes: ["PM-002", "PM-009", "PM-012"],
    causesProbables: ["Non-fluidité de la passation entre régimes.", "Bug informatique généralisé (souvent invoqué par l'URSSAF).", "Ancien compte RSPM non correctement clos avant l'ouverture du PAMC."],
    actionsPossibles: ["Contacter la CPAM pour régulariser l'affiliation.", "Créer un nouvel espace personnel sur le site, lié à la nouvelle affiliation PAMC.", "Effectuer des captures d'écran et tracer les échanges.", "Appeler fréquemment l'URSSAF/CARMF, en changeant d'interlocuteur si nécessaire.", "Paiement en retard possible, demander le retrait des majorations pour cause de bug administratif."],
    statut: "intermittent",
    certitude: "confirmed",
    messageIds: ["MT-006"]
  },
  {
    id: "BA-003",
    titre: "Forfait structure à 0€ en première année d'installation",
    symptomes: ["Montant de forfait structure annoncé à 0€ sur Ameli, malgré une installation récente et le respect des conditions."],
    profilsConcernes: ["PM-004", "PM-001"],
    causesProbables: ["Oubli administratif de la part de l'administration.", "Mise à jour logicielle impérative non effectuée avant le 31 décembre (ex : Hellodoc nécessite une MAJ intégrant les derniers avenants conventionnels AVANT le 31/12, sinon forfait structure = 0€).", "Justificatifs non reçus ou égarés par l'administration.", "Bug récurrent signalé en 2025-2026 chez Hellodoc ET Doctolib : la MAJ du logiciel doit être faite proactivement."],
    actionsPossibles: ["Vérifier le remplissage et l'envoi des justificatifs via Ameli avant la deadline.", "Faire une réclamation formelle. Le paiement peut être différé (ex: versé en janvier N+1 pour N-1).", "S'assurer IMPÉRATIVEMENT que le logiciel métier (Hellodoc, Doctolib, MédiStory…) est à jour AVANT le 31 décembre.", "Si forfait à 0€ malgré tout : faire un courrier de contestation à la CPAM avec captures d'écran."],
    statut: "intermittent",
    certitude: "consensus",
    messageIds: ["MT-004"]
  },
  {
    id: "BA-004",
    titre: "Montant des IJ CPAM pré-remplies (DSDX) incohérent",
    symptomes: ["Montant des IJ CPAM pré-remplies dans la case DSDX (DSFU) est significativement supérieur au montant réellement perçu ou à l'attestation fiscale Ameli.", "Difficulté à obtenir des explications ou des corrections de la part de la CPAM, URSSAF ou Impôts, qui se renvoient la balle."],
    profilsConcernes: ["PM-006", "PM-002"],
    causesProbables: ["Erreurs de transmission de données entre CPAM et URSSAF.", "Confusion avec les IJ de prévoyance privée.", "Mode de calcul agrégé complexe du côté administratif."],
    actionsPossibles: ["Comparer avec l'attestation fiscale Ameli.", "Contacter la CPAM par mail pour une traçabilité et une demande de justification détaillée.", "Si persiste, faire une déclaration papier en indiquant le montant correct et joindre les justificatifs.", "Ne rien modifier dans la 5HQ pour ces IJ (non imposables en micro-BNC)."],
    statut: "actif",
    certitude: "grey_zone",
    messageIds: ["MT-002"]
  },
  {
    id: "BA-005",
    titre: "IJ CPAM non pré-remplies ou mal catégorisées (2042)",
    symptomes: ["IJ CPAM (maladie, maternité) non pré-remplies dans la rubrique 'salaires' de la 2042 C PRO. Ou pré-remplies mais une double imposition CGS est suspectée."],
    profilsConcernes: ["PM-006", "PM-005"],
    causesProbables: ["Changement de logique administrative : non-imposables en micro-BNC, elles sont retirées de la section 'salaires'.", "Erreurs de transmission de données entre CPAM et services fiscaux. ", "Confusion sur la différence entre traitement fiscal et social."],
    actionsPossibles: ["**Micro-BNC** : les IJ CPAM hors ALD ne sont **pas imposables IR** (DGFiP brochure 2026 p. 180) → ne pas les ajouter à 5HQ. Seul report : DSDX/DSDY brut (volet social, normalement pré-rempli — vérifie vs ton attestation Ameli).", "**BNC réel (doctrine 2026)** : les IJ CPAM hors ALD se déclarent en **AF** (gains divers L7 de la 2035-A) → 5QC + miroir **DB cadre 8** (anti-doublon social) + **DSDX** brut sur la 2042. **JAMAIS en 1AJ** — la pré-tolérance « salaire » historique a été supprimée (voir QT-040).", "Demander une attestation fiscale ou un récapitulatif des paiements à Ameli (Espace assuré → Mes paiements). En cas d'écart avec le pré-rempli DSDX, override avec le brut réel."],
    statut: "intermittent",
    certitude: "grey_zone",
    messageIds: ["MT-003"]
  },
  {
    id: "BA-006",
    titre: "Erreur de comptable : mauvaise catégorisation des salaires ou non prise en compte des spécificités médicales",
    symptomes: ["Comptable confondant salaire (ex: maître de stage) et honoraires.", "Comptable ignorant les spécificités des médecins (ZFU, PDSA, chèques vacances ANCV)."],
    profilsConcernes: ["PM-001", "PM-002", "PM-004", "PM-012"],
    causesProbables: ["Manque de spécialisation du comptable dans le secteur médical.", "Charge de travail importante du comptable, manque d'attention."],
    actionsPossibles: ["Changer de comptable pour un cabinet spécialisé dans la comptabilité médicale.", "Utiliser des outils en ligne ou des simulateurs fiscaux pour vérifier les calculs.", "Remettre en question son comptable si ses explications sont floues ou incohérentes avec les informations trouvées.", "Ne pas hésiter à contacter l'Ordre des Experts-Comptables pour une médiation."],
    statut: "actif",
    certitude: "confirmed"
  },
  {
    id: "BA-007",
    titre: "Case DSDX (IJ CPAM) pré-remplie avec écart de +10 000€ pour les congés maternité",
    symptomes: ["Montant DSDX (IJ versées par la CPAM) supérieur de ~10 000€ à ce que la médecin a réellement perçu.", "Écart flagrant avec l'attestation fiscale disponible sur Ameli.", "Case grisée et non modifiable en ligne.", "Renvoi en boucle entre les impôts, l'URSSAF et la CPAM, aucun ne revendiquant l'erreur."],
    profilsConcernes: ["PM-006", "PM-002"],
    causesProbables: ["Erreur de transmission de données entre la CPAM et l'URSSAF.", "Inclusion d'éléments non identifiés (allocation forfaitaire de repos maternel, IJ pathologiques, etc.) dans un montant agrégé.", "Bug systémique récurrent en 2025-2026 touchant de nombreuses médecins en congé maternité."],
    actionsPossibles: ["Comparer avec l'attestation fiscale téléchargeable sur Ameli.", "Contacter la CPAM par mail (pas par téléphone) pour avoir une traçabilité écrite.", "En dernier recours, faire une déclaration papier en indiquant le montant correct et en joignant l'attestation Ameli.", "Ne PAS modifier la case 5HQ pour ces IJ (elles sont non imposables en micro-BNC)."],
    statut: "actif",
    certitude: "confirmed",
    messageIds: ["MT-002"]
  }
];

export const messagesTypes: MessageType[] = [
  {
    id: "MT-001",
    destinataire: "URSSAF / CARMF",
    objet: "Demande de retrait des majorations de retard pour bug informatique",
    corps: "Madame, Monsieur, Je constate un problème de connexion / d'accès aux fonctionnalités de mon compte URSSAF / CARMF depuis le [date]. Malgré mes tentatives de connexion sur différentes plateformes (ordinateur, mobile, différents navigateurs) et les démarches entreprises auprès de vos services (appels téléphoniques les [dates]), le problème persiste, m'empêchant de réaliser le télépaiement de mes cotisations dues le [date limite]. Vous trouverez ci-joint les copies d'écran attestant de l'erreur. Je vous prie de bien vouloir annuler les éventuelles majorations de retard liées à cette situation indépendante de ma volonté. Cordialement, [Votre Nom]",
    contexte: "Paiement des cotisations URSSAF/CARMF impossible suite à un bug informatique récurent sur leur plateforme en ligne.",
    icon: "📧"
  },
  {
    id: "MT-002",
    destinataire: "CPAM (par mail, service local)",
    objet: "Demande de justification ou de correction du montant IJ CPAM (case DSDX)",
    corps: "Madame, Monsieur, Je sollicite votre aide concernant le montant pré-rempli dans la case DSDX (IJ versées par la CPAM) de ma déclaration DSFU (ex DS-PAMC) pour l'année [Année]. Le montant affiché ([Montant DSDX]) est significativement différent de celui figurant sur l'attestation fiscale disponible sur mon compte Ameli ([Montant Ameli]). Je vous prie de bien vouloir m'apporter des précisions sur ce décalage et, si nécessaire, les démarches à suivre pour corriger ce montant. Vous trouverez ci-joint mon attestation fiscale Ameli. Cordialement, [Votre Nom]",
    contexte: "Disparité importante entre le montant pré-rempli des IJ CPAM dans la déclaration DSFU (ex DS-PAMC) et l'attestation fiscale Ameli.",
    icon: "📨"
  },
  {
    id: "MT-003",
    destinataire: "Services des Impôts (SIE) - par messagerie sécurisée",
    objet: "Demande de confirmation écrite - non-imposition des IJ CPAM en micro-BNC",
    corps: "Madame, Monsieur, En tant que médecin en régime micro-BNC, j'ai perçu des indemnités journalières de la CPAM (maladie/maternité) pour l'année [Année]. Des informations contradictoires m'ont été communiquées concernant leur imposition fiscale. Pourriez-vous me confirmer par écrit si ces IJ sont bien non imposables dans le cadre du régime micro-BNC et si elles ne doivent donc pas figurer dans ma déclaration de revenus (2042 C PRO ou 5HQ) ? Je vous remercie de votre attention. Cordialement, [Votre Nom]",
    contexte: "Besoin d'une clarification ferme et écrite sur l'imposition des IJ CPAM pour un médecin en micro-BNC, face aux informations divergentes.",
    icon: "✉️"
  },
  {
    id: "MT-004",
    destinataire: "Assurance Maladie - Service Affiliation / Règlements",
    objet: "Réclamation - Forfait Structure (année N)",
    corps: "Madame, Monsieur, Je me permets de vous contacter concernant le versement de mon forfait structure pour l'année [Année]. Après vérification sur mon compte Ameli, le montant affiché est de 0€, alors que j'ai respecté l'ensemble des conditions d'éligibilité et transmis les justificatifs requis avant la date limite. Je vous saurais gré de bien vouloir vérifier l'état de mon dossier et de procéder à la régularisation de mon due dans les meilleurs délais. Vous trouverez ci-joint une copie des justificatifs transmis. Cordialement, [Votre Nom]",
    contexte: "Médecin installé n'ayant pas perçu son forfait structure malgré le respect des conditions.",
    icon: "📝"
  },
  {
    id: "MT-005",
    destinataire: "Patient / Famille du patient",
    objet: "Demande de remboursement - Factures Manquantes ALD",
    corps: "Madame, Monsieur, Lors de la révision de ma comptabilité pour l'année [Année], j'ai constaté qu'une erreur de saisie a fait que les visites effectuées pour [Nom/Prénom patient] du [Date début] au [Date fin], pour un montant total de [Montant Total], n'ont pas été réglées de votre part. Le remboursement de ces actes ayant été effectué directement sur votre compte par l'Assurance Maladie, je vous demande de bien vouloir me régler la somme due. Vous trouverez ci-joint les détails des factures concernées. Dans l'attente de votre retour, Cordialement, [Votre Nom]",
    contexte: "Le médecin réalise que des visites non réglées par le patient ont été remboursées directement au patient par la CPAM suite à une erreur de saisie de sa part.",
    icon: "📋"
  },
  {
    id: "MT-006",
    destinataire: "URSSAF / CARMF — par messagerie sécurisée",
    objet: "Signalement blocage accès compte post-bascule RSPM → PAMC — demande création compte",
    corps: "Madame, Monsieur, Je suis médecin remplaçant et mon régime social est passé du RSPM au PAMC à compter du [date de bascule]. Depuis cette date, mon ancien espace RSPM est clôturé mais aucun espace PAMC n'a été créé, ce qui m'empêche de consulter mes échéances, de modifier mes revenus estimés et de payer mes cotisations. J'ai contacté vos services par téléphone les [dates d'appel] sans résolution. Je vous demande : (1) la création de mon espace PAMC dans les meilleurs délais, (2) l'annulation des éventuelles majorations de retard liées à cette situation indépendante de ma volonté, (3) la transmission de mes informations à la CARMF pour la création de mon compte retraite PAMC. [Pour la CARMF : contacter directement affiliations.cotis@carmf.fr en joignant la lettre de radiation RSPM.] Cordialement, [Votre Nom] — N° SIRET : [SIRET] — N° RPPS : [RPPS]",
    contexte: "Bascule RSPM → PAMC avec blocage d'accès aux services en ligne pendant plusieurs mois, empêchant le paiement des cotisations et la saisie des revenus estimés.",
    icon: "📧"
  }
];

export const zonesGrises: ZoneGrise[] = [
  {
    id: "ZG-001",
    sujet: "IJ CPAM en micro-BNC : Imposition fiscale vs cotisations sociales",
    positionA: "Les IJ CPAM (maladie, maternité/paternité) sont non imposables fiscalement en micro-BNC. Elles ne doivent pas être déclarées en 5HQ ni dans les salaires de la 2042 C PRO.",
    positionB: "Les IJ CPAM sont soumises à cotisations sociales même en micro-BNC. Elles doivent être déclarées dans la DSFU (DSDX) pour le calcul des charges sociales, mais leur montant prérempli est souvent erroné et difficilement rectifiable.",
    conclusion: "Il y a un consensus sur la non-imposition fiscale en micro-BNC (confirmé par la notice officielle URSSAF/impôts). Par contre, certains agents des impôts donnent des réponses contradictoires par téléphone ou par écrit (MAJ 05/05/2026 : un agent écrit qu'elles doivent figurer dans la 2035, en contradiction avec la notice officielle). Leur traitement pour les cotisations sociales via la DSDX et les erreurs de montant prérempli génèrent confusion et renvoi entre administrations. Attention : le montant pré-rempli en DSDX est fréquemment erroné (souvent +10 000€ au-dessus du réel), surtout pour les congés maternité (voir le bug administratif « Case DSDX (IJ CPAM) pré-remplie avec écart de +10 000 € pour les congés maternité »). En cas de contrôle, s'appuyer sur la notice officielle et demander une confirmation écrite. La prudence est de ne pas les déclarer en 5HQ et de contacter la CPAM par mail pour obtenir une explication écrite sur l'écart.",
    certitude: "grey_zone",
    theme: "ij-prevoyance",
    profilsConcernes: ["PM-002", "PM-005", "PM-006"],
    relatedCases: ["DSDX", "5HQ"],
    relatedTerms: ["cpam", "micro-bnc"],
    relatedQuestions: ["QT-006"],
  },
  {
    id: "ZG-002",
    sujet: "Déduction du loyer professionnel du domicile personnel",
    positionA: "Il est possible de déduire une partie des frais du domicile (loyer, charges, électricité, internet) au prorata de l'usage professionnel. C'est une charge pour l'activité libérale.",
    positionB: "Le 'loyer' versé à soi-même ou au conjoint doit être déclaré comme revenu foncier pour la personne propriétaire/bailleur. Cela génère une imposition sur ces revenus fonciers qui peut annuler l'avantage fiscal de la déduction en charge. Certains comptables 'oublient' de mentionner cette contrepartie.",
    conclusion: "La déduction est 'en théorie' possible mais son avantage net après imposition des revenus fonciers est souvent minime, voire nul. La vigilance est de mise, le montage peut être remis en cause. Il est plus intéressant pour les locataires que les propriétaires.",
    certitude: "grey_zone",
    theme: "vie-pratique",
    profilsConcernes: ["PM-001", "PM-004"],
    relatedCases: ["4BE", "2035"],
    relatedTerms: ["foncier-micro", "bnc-reel"],
    relatedQuestions: ["QT-018"],
  },
  {
    id: "ZG-003",
    sujet: "Coût et utilité d'un expert-comptable pour un médecin libéral",
    positionA: "Un expert-comptable est indispensable pour gérer la complexité fiscale et sociale, surtout en régime réel, SEL ou holding, et offre une sécurité juridique. Le prix est justifié par le temps gagné et l'optimisation.",
    positionB: "Un comptable peut être cher et faire des erreurs (non-spécialisation, oublis). Des solutions alternatives (logiciels comptables en ligne, AGA) avec de l'autonomie sont suffisantes pour les cas simples (micro-BNC) et permettent des économies. Le médecin doit toujours vérifier ce qu'envoie le comptable.",
    conclusion: "Le choix dépend du profil du médecin (complexité de l'activité, temps disponible, niveau de connaissance). Pour le régime réel complexe (SEL, holding, amortissements lourds), un accompagnement reste fortement recommandé (AGA ou expert-comptable spécialisé). Pour le micro-BNC ou le réel simple, des outils comme **Hippodoc** automatisent la 2035, la 2042-C-PRO et la DSFU et rendent les médecins largement autonomes — l'expert-comptable garde alors un rôle de second regard ponctuel plutôt que de gestionnaire mensuel.",
    certitude: "grey_zone",
    theme: "regime-transition",
    profilsConcernes: ["PM-001", "PM-002", "PM-003", "PM-004"],
    relatedTerms: ["aga", "bnc-reel"],
    relatedQuestions: ["QT-009"],
  },
  {
    id: "ZG-004",
    sujet: "Stratégies d'investissement via SEL et holding : risques d'abus de droit",
    positionA: "La constitution d'une holding (SPFPL ou patrimoniale) au-dessus d'une SEL permet une optimisation fiscale majeure via la remontée de dividendes moins taxée, favorisant la capitalisation et l'investissement.",
    positionB: "Le fisc peut requalifier le montage en cas d'abus de droit (art L.64 et L.64 A) si la rémunération du dirigeant est anormalement basse par rapport à l'activité, au profit de dividendes excessifs. Des jurisprudences existent et les règles (ex: 10% du capital social pour l'Urssaf/Carmf sur les dividendes) encadrent ces pratiques.",
    conclusion: "L'optimisation via holding est puissante pour l'investissement long terme mais doit être menée avec un expert fiscaliste. Le risque est la requalification si la structure manque de fondement économique ou si l'abus est flagrant. Le but premier doit rester l'exercice médical.",
    certitude: "grey_zone",
    theme: "regime-transition",
    profilsConcernes: ["PM-010", "PM-014"],
    relatedCases: ["DSDI", "DSEC", "DSSC"],
    relatedQuestions: ["QT-017"],
  },
  {
    id: "ZG-005",
    sujet: "Impact de la réforme des cotisations sociales sur le Revenu Brut Social (RBS) pour les Secteur 2",
    positionA: "La réforme applique un abattement automatique de 26% sur le Revenu Brut Social (RBS). C'est censé être plus simple et avantageux pour les Secteur 1 avec peu de charges.",
    positionB: "Pour les Secteur 2, l'abattement de 26% peut être plafonné (130% du PASS), ce qui signifie que même si le revenu net est élevé et que les cotisations dues sont supérieures à ce plafond, la base de calcul pour les cotisations ne sera pas plus basse que le plafond. Cela peut rendre le régime moins avantageux, les Secteur 2 devenant globalement perdants.",
    conclusion: "La réforme favorise globalement les profils avec moins de charges, mais peut désavantager les Secteurs 2 ou les hauts revenus en plafonnant l'abattement, augmentant de fait leur base de cotisations sur une partie de leur revenu qui était auparavant 'neutralisée' par des charges réelles.",
    certitude: "grey_zone",
    theme: "regime-transition",
    profilsConcernes: ["PM-003"],
    relatedCases: ["DSDE", "DD"],
    relatedTerms: ["secteur-1-2", "optam", "pamc", "pass"],
  },
  {
    id: "ZG-006",
    sujet: "Exonération PDSA : fiscale uniquement, pas sociale",
    positionA: "Les majorations de garde PDSA (CRD, CRS, CRN, VRN, VRS) et les forfaits d'astreinte (PRD, PRN) sont exonérés d'impôt sur le revenu dans la limite de 60 jours de garde par an. L'exonération est accessible même en micro-BNC et transmissible aux remplaçants.",
    positionB: "L'exonération est EXCLUSIVEMENT fiscale. L'URSSAF et la CARMF prélèvent toujours leurs cotisations sur ces montants. Le tarif de base de la consultation (G ou VG) n'est jamais exonéré, même en PDSA. Et les consultations hors PDSA (y compris les gardes SAS en journée) ne sont pas éligibles.",
    conclusion: "Ne pas confondre exonération fiscale et exonération sociale. **En BNC réel**, l'exonération passe par la 2035 (annexe A, case CI). **En micro-BNC**, retirer les majorations PDSA brutes de 5HQ. **NE RIEN reporter en 5HP** (case réservée aux régimes zonés ZFU/ZRR/JEI). **Au PAMC** : reporter le montant net (×0,66) en **DSFA** (case sociale) pour que l'URSSAF puisse réintégrer le montant dans le calcul du revenu net social. **Au RSPM** : pas de DSFU à remplir, le CA brut total reste cotisé via les tranches RSPM.",
    certitude: "confirmed",
    theme: "ij-prevoyance",
    profilsConcernes: ["PM-001", "PM-002", "PM-008"],
    relatedCases: ["5HQ", "DSFA"],
    relatedTerms: ["pdsa"],
    relatedQuestions: ["QT-028"],
  },
  {
    id: "ZG-007",
    sujet: "PDSA et case 5HP : pourquoi il ne faut JAMAIS y reporter la PDSA",
    positionA: "Une pratique répandue (parfois recommandée par d'anciens guides syndicaux) consistait à reporter la part PDSA exonérée nette (×0,66) en case 5HP de la 2042-C-PRO, au même titre que la ZFU.",
    positionB: "**La case 5HP est réservée aux régimes zonés** (ZFU-TE, ZRR/FRR, JEI — CGI Art. 1417, IV, b). La PDSA exonérée Art. 151 ter n'a **aucune** case dédiée sur la 2042-C-PRO : il suffit de la retirer de 5HQ. Côté social, elle se déclare en **DSFA/DSFB** sur la DSFU (volet PAMC) (PAMC uniquement).",
    conclusion: "**Ne RIEN mettre en 5HP pour la PDSA.** La case est purement informative côté IR (aucun impact sur l'impôt), mais l'URSSAF récupère 5HP pour calculer ton **revenu net social** (formule : 0,66 × 5HQ + DSFA + 5HP). Reporter la PDSA en 5HP **et** en DSFA = **double-comptage** = sur-cotisation. Hippodoc retient donc : **5HP = 0 pour la PDSA**, et report en **DSFA** pour la part sociale.",
    certitude: "confirmed",
    theme: "declarations",
    profilsConcernes: ["PM-002", "PM-008"],
    relatedCases: ["5HQ", "DSFA"],
    relatedTerms: ["pdsa", "micro-bnc", "rescrit-fiscal"],
  },
  {
    id: "ZG-008",
    sujet: "Remplaçants et forfaits Secteur 1 (2%, 3%, Groupe III) : exclusion confirmée",
    positionA: "Les remplaçants, exerçant sous la convention du remplacé, devraient pouvoir prétendre aux mêmes avantages fiscaux que les installés secteur 1 puisqu'ils facturent aux tarifs opposables.",
    positionB: "Le texte officiel (BOFiP) exclut explicitement les remplaçants : « Ces médecins, n'étant pas personnellement adhérents à la convention nationale, sont exclus du champ d'application du régime spécial des médecins conventionnés. » Un rescrit fiscal a confirmé cette exclusion en 2024.",
    conclusion: "Malgré l'ambiguïté ressentie par certains remplaçants et comptables, l'exclusion est claire et confirmée par rescrit. Ne JAMAIS appliquer le 2%, 3% ou groupe III en tant que remplaçant, même si tu remplaces exclusivement des S1. En revanche, dès l'installation (ou la collaboration), tu y as droit.",
    certitude: "confirmed",
    theme: "optimisation",
    profilsConcernes: ["PM-002"],
    relatedCases: ["2035"],
    relatedTerms: ["secteur-1-2", "groupe-iii"],
    relatedQuestions: ["QT-024"],
  },
  {
    id: "ZG-009",
    sujet: "Cotations et forfaits hors NGAP perçus pendant la PDSA : exonérables d'IR ?",
    positionA: "Plusieurs actes et forfaits perçus PENDANT une garde régulée (constats de décès 100 €, réquisitions garde à vue, indemnité forfaitaire CPAM ≈ 75 € de régulation, cotation SNP de nuit profonde…) sont versés uniquement parce que tu es de garde. À ce titre, ils pourraient relever des « rémunérations perçues au titre de la permanence des soins » visées par l'Art. 151 ter du CGI, au même titre que les majorations CRD/CRS/CRN/VRN/VRS et les forfaits d'astreinte PRD/PRN.",
    positionB: "L'Art. 151 ter et le BOFIP (BOI-BNC-CHAMP-10-40-20) listent **limitativement** les **majorations spécifiques NGAP** (CRD, CRS, CRN, VRN, VRS) et les **forfaits d'astreinte CPAM** (PRD, PRN). Tout ce qui n'y figure pas nommément — forfait ARS constat de décès, réquisition préfectorale/judiciaire (base juridique distincte), indemnité forfaitaire CPAM de régulation, SNP (majoration NGAP générique de nuit profonde) — reste imposable comme une recette libérale classique.",
    conclusion: "Aucune position formelle BOFIP ni rescrit public connu pour ces cas. Par prudence, **règle commune : hors liste BOFIP NGAP + forfaits d'astreinte → imposable, sauf rescrit personnel**.\n\n• **Constats de décès (100 €)** — Forfait ARS, base juridique de réquisition distincte. Ne pas exonérer ; si tu le fais, prépare la justification du lien direct avec la PDS en cas de contrôle.\n\n• **Réquisitions garde à vue** — Réquisition préfectorale/judiciaire, hors NGAP. Ne pas exonérer.\n\n• **Indemnité forfaitaire CPAM (≈ 75 €) de régulation** — Pas listée nommément. Ne pas l'inclure dans le bloc exonéré PDSA tant que tu n'as pas une attestation écrite SAS/ARS/CPAM ou un rescrit personnel. Hippodoc la traite par défaut comme imposable.\n\n• **Cotation SNP (supplément nuit profonde)** — Majoration NGAP générique, pas spécifique à la PDS. Ne pas exonérer (risque de redressement sur assiette modeste mais réel). Hippodoc ne range pas le SNP dans les actes exonérables PDSA.\n\nDans tous les cas : si tu choisis d'exonérer, conserve un justificatif détaillé liant la rémunération à la garde régulée et envisage un rescrit personnel auprès de ton SIE.",
    certitude: "grey_zone",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002", "PM-008", "PM-011"],
    relatedCases: ["5HP", "5HQ"],
    relatedTerms: ["pdsa", "rescrit-fiscal"],
  },
  {
    id: "ZG-010",
    sujet: "PDSES (Permanence Des Soins en Établissement) : exonération Art. 151 ter ?",
    positionA: "La PDSES est une permanence des soins, comme la PDSA. Un médecin effectuant des gardes en établissement pourrait logiquement bénéficier de la même exonération fiscale.",
    positionB: "L'Art. 151 ter du CGI vise spécifiquement la « permanence des soins exercée en application de l'article L. 6314-1 du code de la santé publique », qui concerne la PDSA (ambulatoire). La PDSES relève d'un cadre juridique différent (art. R. 6111-45 et suivants). Les textes ne la mentionnent pas.",
    conclusion: "La PDSES n'est très probablement PAS éligible à l'exonération Art. 151 ter qui vise uniquement la permanence ambulatoire. Pas de rescrit ni de jurisprudence connue sur ce point.",
    certitude: "grey_zone",
    theme: "declarations",
    profilsConcernes: ["PM-001", "PM-002"],
    relatedTerms: ["pdsa"],
  },
  {
    id: "ZG-016",
    sujet: "IJ CPAM hors ALD en BNC réel : case 1AJ ou gains divers de la 2035 ? — RÉSOLU mai 2026",
    positionA: "**Position historique (avant 2026)** : les IJ CPAM hors ALD versées sur le compte personnel se déclaraient en **case 1AJ** (traitements et salaires) de la 2042. Pratique majoritaire chez les comptables médicaux, par parallélisme avec les attestations « salaire » émises historiquement par Ameli. Côté social, réintégration via DSDX → DSDC.",
    positionB: "**Position confirmée (doctrine 2026, expert mai 2026 + Brochure DGFiP 2026 p. 180)** : les IJ CPAM hors ALD perçues au titre d'une activité libérale relèvent du **BNC**. En réel : **AF** (gains divers L7 de la 2035) → 5QC + miroir **DB cadre 8** (anti-doublon social) + **DSDX brut**. En micro-BNC : **non imposables IR** → exclues de 5HQ ; seul DSDX brut. **JAMAIS en 1AJ.** L'attestation fiscale « salaire » Ameli n'est plus émise pour ces revenus.",
    conclusion: "**Zone grise résolue.** La doctrine 2026 tranche en faveur de la position B (gains divers + DB en réel ; exclu 5HQ + DSDX seul en micro). Le **case 1AJ** reste réservé aux IJ perçues au titre d'un véritable contrat salarié (médecin hospitalier en arrêt). Si la CPAM ou le pré-rempli 2042 affiche un montant erroné, override avec le brut du relevé Ameli. Voir QT-040 (réel) et QT-041 (micro-BNC).",
    certitude: "confirmed",
    theme: "ij-prevoyance",
    profilsConcernes: ["PM-001", "PM-003", "PM-006", "PM-011"],
    relatedCases: ["5QC", "DSDX", "1AJ"],
    relatedTerms: ["cpam", "bnc-reel"],
    relatedQuestions: ["QT-006", "QT-040", "QT-041"],
  }
];

export const calendrierAnnuel: CalendrierMois[] = [
  {
    mois: "Janvier",
    numero: 1,
    demarches: [
      { titre: "Bascule RSPM vers PAMC", description: "Pour les médecins dont le CA a dépassé le seuil RSPM (~38 000€), bascule vers le régime PAMC déclenchée par l'URSSAF. Vérifier que ton espace PAMC a bien été créé et que la CARMF a été notifiée (elle ne l'est jamais automatiquement). Forte probabilité de bugs administratifs sur URSSAF/CARMF.", urgent: true },
      { titre: "Déclaration DAS-2 (honoraires versés)", description: "Déclarer en ligne sur impots.gouv.fr tous les honoraires > 1 200 €/an versés à des tiers non salariés (rétrocessions versées à un remplaçant, honoraires de comptable, d'avocat…). Deadline : 31 janvier. Amende de 50 % en cas d'oubli.", urgent: true },
      { titre: "Début de l'année comptable", description: "Début des enregistrements de recettes et dépenses pour l'année courante si tu es au régime réel.", urgent: false },
      { titre: "Versements Forfait Structure N-1", description: "Paiement du forfait structure de l'année précédente si régularisé (suite à des bugs ou réclamations).", urgent: false }
    ]
  },
  {
    mois: "Février",
    numero: 2,
    demarches: [
      { titre: "Contrôle SNIR N-1", description: "Réception du SNIR de l'année précédente. Le comparer avec le CA réel de ta comptabilité. Ne pas s'inquiéter si le SNIR est inférieur au CA réel.", urgent: false }
    ]
  },
  {
    mois: "Mars",
    numero: 3,
    demarches: [
      { titre: "Préparation Déclaration 2035 N-1 (régime réel)", description: "Finalisation de la comptabilité au réel pour préparer la liasse 2035 de l'année précédente. Calcul du Revenu Brut Social (case DD).", urgent: true },
      { titre: "Vérification Attestations Fiscales Ameli IJ CPAM", description: "Vérifier la disponibilité et la conformité des attestations fiscales pour les IJ CPAM (maladie, maternité).", urgent: false }
    ]
  },
  {
    mois: "Avril",
    numero: 4,
    demarches: [
      { titre: "Ouverture Déclaration de Revenus (IR)", description: "La déclaration d'impôts sur le revenu (2042, 2042 C PRO) est généralement ouverte en avril. Début de la période de déclaration fiscale et sociale (DSFU, ex DS-PAMC).", urgent: true },
      { titre: "Revue Régime Fiscal", description: "Évaluer si un passage du micro-BNC au réel est plus avantageux pour l'année N-1, si la comptabilité a été tenue en conséquence.", urgent: true }
    ]
  },
  {
    mois: "Mai",
    numero: 5,
    demarches: [
      { titre: "Date limite déclaration — départements 01-19", description: "Échéance 2026 : vendredi 22 mai. Déclaration en ligne 2042 + 2042-C-PRO + DSFU. Ne pas oublier de remplir la DSFU en même temps que la 2042 !", urgent: true },
      { titre: "Date limite déclaration — départements 20-54", description: "Échéance 2026 : vendredi 29 mai (non-résidents inclus).", urgent: true },
      { titre: "Paiement Cotisations URSSAF", description: "Échéance de paiement des cotisations URSSAF (généralement le 5 mai). Anticiper les éventuels bugs informatiques.", urgent: true }
    ]
  },
  {
    mois: "Juin",
    numero: 6,
    demarches: [
      { titre: "Date limite déclaration — départements 55+", description: "Échéance 2026 : vendredi 5 juin. Dernière date pour la télédéclaration en ligne.", urgent: true },
      { titre: "Paiement Cotisations CARMF", description: "Échéance de paiement des cotisations CARMF.", urgent: true },
      { titre: "Simulation Régime Fiscal et Social", description: "Faire des simulations pour les années futures (passage Micro-BNC/Réel, impact de nouveaux zonages) avant la fin de l'année.", urgent: false }
    ]
  },
  {
    mois: "Juillet",
    numero: 7,
    demarches: [
      { titre: "Ajustement Impôt à la Source", description: "Possibilité d'ajuster le taux de prélèvement à la source en fonction des revenus déclarés pour l'année N-1.", urgent: false }
    ]
  },
  {
    mois: "Août",
    numero: 8,
    demarches: [
      { titre: "Réception Avis d'Imposition", description: "Réception de l'avis d'imposition basé sur la déclaration N-1.", urgent: false }
    ]
  },
  {
    mois: "Septembre",
    numero: 9,
    demarches: [
      { titre: "Facturation électronique obligatoire (réception)", description: "À partir du 1er septembre 2026, tous les médecins avec un SIRET doivent disposer d'une plateforme agréée pour recevoir les factures électroniques de leurs fournisseurs (loyer pro, logiciels, RCP, internet). L'émission vers les patients n'est pas concernée. Solutions gratuites disponibles : Portail Public de Facturation (PPF) de l'État, Indy, certaines banques pro. Les Plateformes de Dématérialisation Partenaires (PDP) privées proposent des offres payantes (souvent 5–15 €/mois selon le volume).", urgent: true },
      { titre: "Paiement Impôt sur le Revenu", description: "Première échéance de paiement si l'impôt est élevé et n'est pas entièrement couvert par le prélèvement à la source.", urgent: false },
      { titre: "Rapprochement avec Prévisionnels N+1", description: "Comparer les revenus N et N-1 avec les prévisionnels N+1 pour la prévoyance, cotisations... ", urgent: false }
    ]
  },
  {
    mois: "Octobre",
    numero: 10,
    demarches: [
      { titre: "Révision des contrats de Prévoyance", description: "Avec les revenus N-1 et l'avis d'imposition N-1, c'est un bon moment pour reévaluer et renégocier les contrats de prévoyance.", urgent: false }
    ]
  },
  {
    mois: "Novembre",
    numero: 11,
    demarches: [
      { titre: "Avis de CFE", description: "Réception de l'avis de CFE (Cotisation Foncière des Entreprises). Le paiement est dû avant le 15 décembre (acompte de 50 % en juin si > 3 000 €). Exonération la première année civile d'installation.", urgent: true }
    ]
  },
  {
    mois: "Décembre",
    numero: 12,
    demarches: [
      { titre: "Optimisation de fin d'année", description: "Achats de matériel, souscription de Chèques Vacances ANCV, gestion des MADELIN, pour optimiser les charges de l'année en cours.", urgent: true },
      { titre: "Préparation au régime réel", description: "Si tu envisages de passer au régime réel l'année suivante, assure-toi de tenir une comptabilité rigoureuse dès maintenant.", urgent: true },
      { titre: "Mise à jour des logiciels métier", description: "S'assurer que le logiciel métier est bien à jour avant la fin d'année pour les forfaits structure etc.", urgent: true }
    ]
  }
];

// === Helpers ===

export function getProfilLabel(profilId: string): string {
  const p = profils.find(x => x.id === profilId);
  return p ? `${p.icon} ${p.label}` : profilId;
}

export function getProfilShortLabel(profilId: string): string {
  const p = profils.find(x => x.id === profilId);
  return p ? p.label : profilId;
}

// Mapping profil → tags for question filtering
export const profilTagMapping: Record<string, string[]> = {
  "PM-001": ["2035", "Réel", "Conventionné", "Charges", "Déductions", "Comptable", "AGA", "DD", "DSDE", "Forfait 2%", "Forfait 3%", "Groupe III"],
  "PM-002": ["Micro-BNC", "SNIR", "CA", "Déclaration", "RSPM", "PAMC", "Remplaçant", "5HQ", "FRR", "ZFU"],
  "PM-003": ["Réel", "Conventionné", "Secteur 2", "OPTAM", "Dépassements", "DSAW"],
  "PM-004": ["Installation", "Micro-BNC", "Régime réel", "Comptable", "AGA", "Forfait structure", "FRR", "Zone rurale"],
  "PM-005": ["Salaire", "Mixte", "IJ", "Double imposition", "CPAM", "CESU", "Garde d'enfants"],
  "PM-006": ["Maternité", "Maladie", "Prévoyance", "IJ", "CPAM", "DSDX", "DSDY", "DSCZ", "DSDZ", "AJPA", "Proche aidant", "DSEM", "Congé", "CESU", "Garde d'enfants", "Madelin", "CARMF", "Cadre 8", "ALD"],
  "PM-012": ["Interne", "Étudiant", "Premier remplacement", "RSPM", "Salaire", "Hospitalier"],
  "PM-008": ["ZFU", "FRR", "ZRR", "PDSA", "Exonération", "5HP", "5QB", "DSFA"],
  "PM-009": ["RSPM", "PAMC", "Transition", "CARMF", "URSSAF", "Bug"],
  "PM-010": ["SELARL", "SEL", "SELAS", "Holding", "Dividendes", "Optimisation fiscale", "DSDI", "DSEC", "DSSC"],
  "PM-011": ["Collaborateur", "Collaboration", "Redevance", "L16", "BG", "Encaissement", "Cabinet", "Micro-BNC", "Réel"],
  "PM-013": ["Vacation", "Centre médical", "Maison de santé", "Honoraires bruts", "PAMC", "RSPM", "5HQ", "DSCS", "DSAV", "SNIR", "PDSA"],
  "PM-014": ["EI", "IS", "Entreprise individuelle", "Art. 1655 sexies", "DSEC", "DSDI", "Option IS", "Gérance"],
};


// Wizard logic
/** Seuil annuel libéral au-dessus duquel l'URSSAF bascule du RSPM (Dispositif Simplifié) au PAMC. */
export const RSPM_PAMC_THRESHOLD = 38_000;
/** Seuil bas RSPM : en dessous, taux réduit de cotisations (13,5 % vs 21,2 %). */
export const RSPM_LOWER_BAND = 19_000;

export interface WizardResult {
  cases: { code: string; nom: string; formulaire: string; ordre: number }[];
  reglesPertinentes: string[];
  pieges: string[];
}

// === Phase 12 — Grouped wizard result (UI consumption) ===
export type WizardPointType = 'info' | 'warning' | 'critical' | 'tip';
export type WizardSectionId = 'fiscal' | 'exonerations' | 'social' | 'situations';

export interface WizardCase {
  code: string;
  nom: string;
  formulaire: string;
  ordre: number;
}
export interface WizardPoint {
  type: WizardPointType;
  texte: string;
}
export interface WizardSection {
  id: WizardSectionId;
  titre: string;
  sousTitre: string;
  formulairePrincipal: string;
  cases: WizardCase[];
  points: WizardPoint[];
}
export interface WizardResultGrouped {
  resume: { cases: number; formulaires: number; estimation: string };
  sections: WizardSection[];
  // R5 (cleanup mai 2026) : `pointsTransverses` retiré — `sectionForPoint()` ne retourne
  // jamais 'transverse' (toutes les branches aboutissent à fiscal/exonerations/social/situations).
  reglesPertinentes: string[];
  /** Conseils sur-mesure liés au profil sélectionné, dédupliqués des pièges déjà présents. */
  conseilsProfil: { nom: string; conseils: string[] } | null;
  meta: {
    regime: 'micro-bnc' | 'reel' | 'selarl';
    regimeSocial: 'rspm' | 'pamc';
    typeActivite: string;
  };
}

// Classification d'un piège en type sémantique
function classifyPoint(texte: string): WizardPointType {
  const t = texte.toLowerCase();
  // Critical : pièges silencieux qui font perdre de l'argent ou déclencher un contrôle
  if (texte.startsWith('⚠️')) return 'critical';
  if (t.includes('rspm + pdsa') || t.includes('rspm+pdsa')) return 'critical';
  if (t.includes('frr') && t.includes("n'est pas accessible")) return 'critical';
  if (t.includes('erreur très fréquente') || t.includes('oubli très fréquent')) return 'critical';
  if (t.includes('risque en contrôle') || t.includes('das-2')) return 'critical';
  // Warning : à vérifier, action attentive requise
  if (t.includes('concordance') || t.includes('surveille') || t.includes('vérifie')) return 'warning';
  if (t.includes('ne pas') || t.includes('ne déduis pas') || t.includes('ne reporte pas') || t.includes('ne les mélange')) return 'warning';
  if (t.includes('pas de dsfu') || t.includes('avant rétrocession')) return 'warning';
  // Warning : explications calculatoires / frontières clés à ne pas survoler
  if (t.startsWith('rspm ≠') || t.startsWith('rspm =')) return 'warning';
  if (t.startsWith('dscs =') || t.startsWith('dsfu =')) return 'warning';
  if (t.includes('comptage des 60 jours')) return 'warning';
  if (t.startsWith('ancv micro-bnc') || t.startsWith('ancv réel')) return 'warning';
  if (t.includes('bascule')) return 'warning';
  // Tip : bon à savoir, optimisation
  if (t.includes('automatiquement') || t.includes('peux bénéficier') || t.includes('non imposable')) return 'tip';
  // Default
  return 'info';
}

// Détermine la section d'un piège selon ses mots-clés.
// R5 (cleanup mai 2026) : retour simplifié — toutes les branches aboutissent à une section
// nommée (plus de 'transverse' jamais retourné).
function sectionForPoint(texte: string): WizardSectionId {
  const t = texte.toLowerCase();
  // Exonérations : PDSA, ZFU, FRR, 5HP
  if (t.includes('5hp') || t.includes('zfu') || t.includes('frr') || t.includes('pdsa') || t.includes('151 ter') || t.includes('60 jours') || t.includes('majorations')) return 'exonerations';
  // Social : DSFU, cotisations, IJ, ANCV, DSCS, RSPM (régime social), bascule PAMC, URSSAF, CARMF
  if (t.includes('dscs') || t.includes('dsfu') || t.includes('dsde') || t.includes('dsco') || t.includes('dscn') || t.includes('dsdx')) return 'social';
  if (t.includes('rspm') || t.includes('pamc')) return 'social';
  if (t.includes('cotisations')) return 'social';
  if (t.includes('urssaf') || t.includes('carmf')) return 'social';
  if (t.includes('ij cpam') && !t.includes('1aj')) return 'social';
  if (t.includes('ancv')) return 'social';
  // Situations particulières : foncier, CESU, loyer pro, crédits annexes
  if (t.includes('cesu') || t.includes('foncier') || t.includes('4be') || t.includes('8uz') || t.includes('loyer pro')) return 'situations';
  // Fiscal recettes par défaut (5HQ, 1AJ, abattement 34%, etc.)
  return 'fiscal';
}

// Détermine la section d'une case
function sectionForCase(c: WizardCase): WizardSectionId {
  if (c.code === '5HP' || c.code === '5HY' || c.code === 'DSFA') return 'exonerations';
  if (c.code === '1AJ' || c.code === '1AS' || c.code === '1AZ' || c.code === 'BT') return 'fiscal';
  // Phase 12N : DSAT/DSCZ/DSEM explicitement social (cohérent avec leur formulaire DSFU)
  if (c.code === 'DSAT' || c.code === 'DSCZ' || c.code === 'DSEM') return 'social';
  if (c.code.startsWith('DS')) return 'social';
  if (c.code === '4BE' || c.code === '8UZ') return 'situations';
  return 'fiscal';
}

const SECTION_META: Record<WizardSectionId, { titre: string; sousTitre: string }> = {
  fiscal: { titre: 'Tes recettes BNC', sousTitre: 'Ce que tu déclares aux impôts' },
  exonerations: { titre: 'Tes exonérations', sousTitre: 'PDSA, ZFU, FRR — à reporter à part' },
  social: { titre: 'Tes cotisations sociales', sousTitre: 'DSFU URSSAF / CARMF' },
  situations: { titre: 'Situations particulières', sousTitre: 'Foncier, CESU, autres crédits' },
};

/** Normalise un texte pour comparaison : lowercase, sans accent, sans emoji/puce, espaces compactés. */
function normalizeForDedup(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[⚠️•·\-–—*]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getWizardResultGrouped(
  regime: 'micro-bnc' | 'reel' | 'selarl',
  typeActivite: 'remplacant' | 'installe' | 'mixte' | 'collaborateur' | 'centre_medical',
  situations: string[],
  regimeSocial: 'rspm' | 'pamc' = 'pamc',
  profileId?: string | null,
): WizardResultGrouped {
  const flat = getWizardResult(regime, typeActivite, situations, regimeSocial, profileId);

  // Grouping
  const sectionsMap: Record<WizardSectionId, WizardSection> = {
    fiscal: { id: 'fiscal', ...SECTION_META.fiscal, formulairePrincipal: '', cases: [], points: [] },
    exonerations: { id: 'exonerations', ...SECTION_META.exonerations, formulairePrincipal: '', cases: [], points: [] },
    social: { id: 'social', ...SECTION_META.social, formulairePrincipal: '', cases: [], points: [] },
    situations: { id: 'situations', ...SECTION_META.situations, formulairePrincipal: '', cases: [], points: [] },
  };

  // Cases
  for (const c of flat.cases) {
    const sid = sectionForCase(c);
    sectionsMap[sid].cases.push(c);
  }
  // Points — toujours routés vers une section nommée (cf. R5)
  for (const p of flat.pieges) {
    const sid = sectionForPoint(p);
    sectionsMap[sid].points.push({ type: classifyPoint(p), texte: p });
  }

  // Formulaire principal de chaque section (le plus représenté)
  for (const sec of Object.values(sectionsMap)) {
    const counts: Record<string, number> = {};
    sec.cases.forEach(c => { counts[c.formulaire] = (counts[c.formulaire] ?? 0) + 1; });
    sec.formulairePrincipal = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    sec.cases.sort((a, b) => a.ordre - b.ordre);
  }

  // Phase 12P/12S — A4 : sous-titre social dynamique selon le régime social effectif.
  // Seul le cas A (installation/collaboration en cours d'année) ouvre une période PAMC sur N
  // et donc une DSFU. Les cas B (dépassement seuil) et C (sortie volontaire) prennent effet
  // au 1er janvier N+1 et n'impliquent AUCUNE DSFU sur l'année N.
  if (regimeSocial === 'rspm') {
    sectionsMap.social.sousTitre = situations.includes('installation_collab_cours_annee')
      ? 'Bascule RSPM → PAMC : DSFU sur la période PAMC uniquement'
      : 'RSPM — pas de DSFU à remplir, cotisations trimestrielles';
  }

  // Note : en RSPM la section "social" peut n'avoir aucune case officielle (DSFU absente),
  // mais on garde ses points (RSPM, bascule PAMC, etc.) dans la section dédiée plutôt que de
  // les rediriger en transverses — cohérence visuelle pour le user.

  // Filtre sections vides
  const sections = (Object.values(sectionsMap) as WizardSection[]).filter(
    s => s.cases.length > 0 || s.points.length > 0,
  );

  // Résumé
  const totalCases = sections.reduce((acc, s) => acc + s.cases.length, 0);
  const formulairesSet = new Set<string>();
  sections.forEach(s => s.cases.forEach(c => formulairesSet.add(c.formulaire)));
  const nbForms = formulairesSet.size;
  const estimation = totalCases <= 2 ? '~10 min' : totalCases <= 5 ? '~20 min' : totalCases <= 8 ? '~30 min' : '~45 min';

  // Conseils sur-mesure du profil retenu — dédupliqués vs pièges déjà routés
  let conseilsProfil: WizardResultGrouped['conseilsProfil'] = null;
  if (profileId) {
    const prof = profils.find(p => p.id === profileId);
    if (prof) {
      const piegesNorm = new Set<string>(flat.pieges.map(normalizeForDedup));
      const filtered = prof.conseilsCles.filter(c => !piegesNorm.has(normalizeForDedup(c)));
      if (filtered.length > 0) {
        conseilsProfil = { nom: prof.label, conseils: filtered.slice(0, 5) };
      }
    }
  }

  return {
    resume: { cases: totalCases, formulaires: nbForms, estimation },
    sections,
    reglesPertinentes: flat.reglesPertinentes,
    conseilsProfil,
    meta: { regime, regimeSocial, typeActivite },
  };
}

export function getWizardResult(
  regime: 'micro-bnc' | 'reel' | 'selarl',
  typeActivite: 'remplacant' | 'installe' | 'mixte' | 'collaborateur' | 'centre_medical',
  situations: string[],
  regimeSocial: 'rspm' | 'pamc' = 'pamc',
  profileId?: string | null,
): WizardResult {
  // Garde-fous combinaisons aberrantes
  if (regime === 'selarl' && regimeSocial === 'rspm') {
    // Un gérant SEL est toujours au PAMC sur sa rémunération de gérance
    regimeSocial = 'pamc';
  }
  if ((typeActivite === 'installe' || typeActivite === 'collaborateur') && regimeSocial === 'rspm') {
    // Un installé/collaborateur est par définition au PAMC dès qu'il dépasse ~38k€
    regimeSocial = 'pamc';
  }
  // Phase 12T — Sortie RSPM : 2 déclencheurs réglementaires distincts.
  //   A) installation_collab_cours_annee → trimestre civil suivant, ANNÉE MIXTE (RSPM puis PAMC)
  //                                        SEUL cas qui modifie la checklist (DSFU partielle).
  //   B+C) sortie_rspm_n_plus_1          → dépassement plafond OU demande volontaire :
  //                                        effet au 1er janvier N+1, AUCUNE DSFU sur N.
  // Rétro-compat : `bascule_rspm_pamc` → cas A ; `depassement_seuil_rspm`/`sortie_volontaire_rspm` → B+C.
  if (situations.includes('bascule_rspm_pamc') && !situations.includes('installation_collab_cours_annee')) {
    situations = [...situations.filter(s => s !== 'bascule_rspm_pamc'), 'installation_collab_cours_annee'];
  }
  if (situations.includes('depassement_seuil_rspm') || situations.includes('sortie_volontaire_rspm')) {
    const cleaned = situations.filter(s => s !== 'depassement_seuil_rspm' && s !== 'sortie_volontaire_rspm');
    if (!cleaned.includes('sortie_rspm_n_plus_1')) cleaned.push('sortie_rspm_n_plus_1');
    situations = cleaned;
  }
  const cases: { code: string; nom: string; formulaire: string; ordre: number }[] = [];
  const regles: string[] = [];
  const pieges: string[] = [];

  // Helper anti-doublon pour la case 1AJ (peut être ajoutée par mixte, profil interne, IJ CPAM réel)
  const has1AJ = () => cases.some(c => c.code === '1AJ');
  const push1AJ = (nom: string) => { if (!has1AJ()) cases.push({ code: '1AJ', nom, formulaire: '2042', ordre: 0 }); };

  // Profil interne / étudiant en médecine : il a TOUJOURS un salaire hospitalier (1AJ)
  if (profileId === 'PM-012') {
    push1AJ('Salaire hospitalier (interne)');
  }

  // Fix #2 — Adapter la terminologie 5HQ selon le type d'activité.
  // Règle d'or terminologie : ne jamais écrire « rétrocessions » seul ; toujours préciser
  // « perçues » (= recette du remplaçant) ou « versées » (= charge du titulaire/mixte).
  // Cf. mem://constraints/retrocession-terminology.
  const _hasPdsaEarly = situations.includes('pdsa');
  const _pdsaSuffix = _hasPdsaEarly ? ' (et retire la PDSA exonérée brute)' : '';

  // Base cases by regime
  if (regime === 'micro-bnc') {
    cases.push({ code: '5HQ', nom: 'Revenus Imposables (Micro-BNC)', formulaire: '2042 C PRO', ordre: 1 });
    regles.push('RO-001', 'RO-003');

    // Message 5HQ contextualisé par profil d'activité.
    let piege5HQ: string;
    if (typeActivite === 'remplacant') {
      piege5HQ = `Case 5HQ : reporte la somme brute des **rétrocessions perçues** en 2025 (= ton CA encaissé)${_pdsaSuffix}. Tu n'as **rien à soustraire** : les rétrocessions perçues *sont* ton chiffre d'affaires. Ne déduis PAS toi-même l'abattement 34 %, il est appliqué automatiquement par les impôts.`;
    } else if (typeActivite === 'collaborateur') {
      piege5HQ = `Case 5HQ : reporte ton CA encaissé **− redevance de collaboration versée au titulaire**${_pdsaSuffix} (CGI Art. 102 ter). Ne déduis PAS toi-même l'abattement 34 %, il est appliqué automatiquement par les impôts.`;
    } else if (typeActivite === 'centre_medical') {
      piege5HQ = `Case 5HQ : reporte les honoraires bruts versés par la structure en 2025${_pdsaSuffix}. Ne déduis PAS toi-même l'abattement 34 %, il est appliqué automatiquement par les impôts.`;
    } else {
      // installe / mixte / autre : ils peuvent verser des rétros à un remplaçant.
      piege5HQ = `Case 5HQ : reporte ton CA brut **− rétrocessions versées à tes remplaçants**${_pdsaSuffix} (CGI Art. 102 ter). Ne déduis PAS toi-même l'abattement 34 %, il est appliqué automatiquement par les impôts.`;
    }
    pieges.push(piege5HQ);

    // R1 — piège PDSA micro-BNC consolidé plus bas (bloc hasPdsa + micro-BNC + PAMC).

  } else if (regime === 'reel') {
    cases.push({ code: '2035', nom: 'Liasse fiscale BNC', formulaire: '2035', ordre: 1 });
    cases.push({ code: 'DD', nom: 'Revenu Brut Social', formulaire: '2035', ordre: 2 });
    cases.push({ code: '5QC', nom: 'Bénéfice net (BNC)', formulaire: '2042 C PRO', ordre: 3 });
    regles.push('RO-007');
    pieges.push("Concordance obligatoire entre 2035 et 2042-C-PRO");
    // R1 — piège PDSA réel consolidé plus bas (bloc hasPdsa + réel + PAMC).

  } else {
    // SELARL/SELAS
    cases.push({ code: '5QC', nom: 'Rémunération de gérance (BNC)', formulaire: '2042 C PRO', ordre: 1 });
    cases.push({ code: 'DSDI', nom: 'Gérant société IS (cocher)', formulaire: 'DSFU', ordre: 6 });
    cases.push({ code: 'DSEC', nom: 'Rémunération brute', formulaire: 'DSFU', ordre: 7 });
    cases.push({ code: 'DSSC', nom: 'Dividendes > 10% capital', formulaire: 'DSFU', ordre: 8 });
    pieges.push("La rémunération du dirigeant de SEL est en BNC depuis 2024");
    pieges.push("Dividendes > 10% du capital social soumis à cotisations URSSAF/CARMF");
    pieges.push("Ne PAS remplir DSDE — elle est réservée aux EI, pas aux SEL");
  }

  // Social cases (PAMC) — DSCS/DSAV/DSAU réservés aux EI conventionnés (pas SELARL : DSDI/DSEC/DSSC)
  if (regime !== 'selarl') {
    cases.push({ code: 'DSCS', nom: 'Total Recettes brutes', formulaire: 'DSFU', ordre: 20 });
    cases.push({ code: 'DSAV', nom: 'Recettes conventionnées', formulaire: 'DSFU', ordre: 21 });
    // C4 / Phase 12O — DSAU (ratio PCC) : critique pour tous les types PAMC EI (mixte inclus)
    if (
      typeActivite === 'remplacant' ||
      typeActivite === 'installe' ||
      typeActivite === 'collaborateur' ||
      typeActivite === 'mixte' ||
      typeActivite === 'centre_medical'
    ) {
      cases.push({ code: 'DSAU', nom: 'Ratio PCC (DSAV / DSCS)', formulaire: 'DSFU', ordre: 24 });
    }
  }
  regles.push('RO-002');

  if (regime === 'reel') {
    cases.push({ code: 'DSDE', nom: 'Revenu brut social (EI)', formulaire: 'DSFU', ordre: 22 });
  }

  // Fix #3 & #8 — Collaborateur liberal specifics (texte adapté au régime, fusionné)
  if (typeActivite === 'collaborateur') {
    const redevanceDeduction = regime === 'micro-bnc'
      ? 'pré-déduite avant de reporter en 5HQ (CGI Art. 102 ter)'
      : regime === 'reel'
        ? 'déductible en L16/BG de la 2035'
        : 'déductible dans la comptabilité de la société';
    pieges.push(`Tu encaisses directement tes honoraires. La redevance de collaboration est ${redevanceDeduction} — mais elle n'est PAS déduite de DSCS.`);
    pieges.push("DSCS = ton CA total encaissé (avant déduction de la redevance).");
    if (regime === 'reel') {
      regles.push('RO-008');
      pieges.push("Tu peux bénéficier des forfaits 2%/3%/groupe III sur ta part d'activité installée");
    }
  }

  // Fix #5 & #7 — Installé : un seul piège factorisé (suffixe régime).
  // R2 (cleanup mai 2026) : ne pas dupliquer la phrase d'amorce « DSCS = CA total AVANT
  // rétrocessions versées » sur 3 branches quasi identiques — un seul push avec suffixe.
  if (typeActivite === 'installe') {
    const suffixeRegime = regime === 'reel'
      ? "Les rétrocessions versées sont déductibles en L21/BG de la 2035."
      : regime === 'micro-bnc'
        ? "Les rétrocessions versées sont ensuite pré-déduites avant de reporter en 5HQ (CGI Art. 102 ter)."
        : "Les rétrocessions versées sont une charge de la société, déductible en comptabilité.";
    pieges.push(`Si tu as des remplaçants : ton DSCS = CA total AVANT rétrocessions versées. ${suffixeRegime}`);
  }

  // Fix #4 — Mixte (salarié + libéral) specifics : case adaptée au régime
  if (typeActivite === 'mixte') {
    const caseLib = regime === 'micro-bnc' ? '5HQ' : '5QC';
    // C1 — la case 1AJ doit figurer dans la checklist (pas seulement dans un piège)
    push1AJ('Traitements et salaires');
    pieges.push(`Déclare tes revenus salariés en 1AJ (traitements et salaires) et tes revenus libéraux séparément (${caseLib}). Ne les mélange jamais.`);
    pieges.push("Si tu as des IJ CPAM côté salarié, elles sont déjà pré-remplies en 1AJ — ne les re-déclare pas côté libéral.");
  }

  // Centre médical / vacation : la structure verse les honoraires bruts
  if (typeActivite === 'centre_medical') {
    pieges.push("Vacation en centre médical : la structure te verse des honoraires bruts (pas de rétrocession au sens classique). Tu déclares ces honoraires en recettes BNC (5HQ ou 2035 selon ton régime).");
    pieges.push("Vérifie si la structure te remet bien un récapitulatif annuel (relevé SNIR ou attestation centre) — sinon reconstitue toi-même via tes encaissements bancaires.");
    if (regimeSocial === 'rspm') {
      pieges.push("Centre médical + RSPM : si la structure te demande un n° de DSFU, rappelle-lui que tu es en Dispositif Simplifié — tes cotisations sont prélevées trimestriellement sur ton CA déclaré, sans DSFU à remplir.");
    }
  }

  // Régime social — RSPM vs PAMC
  if (regimeSocial === 'rspm') {
    // Phase 12Q/12S — B2 : si installation/collaboration en cours d'année (cas A), ne PAS afficher
    // le piège « pas de DSFU » qui contredirait les cases DSFU préservées (Phase 12P A2).
    // Les cas B (dépassement seuil) et C (sortie volontaire) gardent ce piège : pas de DSFU sur N.
    if (!situations.includes('installation_collab_cours_annee')) {
      pieges.push("RSPM : tu n'as PAS de DSFU à remplir. Tes cotisations sont prélevées trimestriellement par le RSPM sur ton CA déclaré (13,5 % jusqu'à ~19 000 €, 21,2 % au-delà, dans la limite de ~38 000 €/an).");
    }
    pieges.push("RSPM ≠ exonération fiscale : tu remplis quand même la 2042-C-PRO (5HQ en micro, 5QC en réel) auprès des impôts. Le RSPM ne concerne que tes cotisations sociales.");
    // Phase 12S — Précision réglementaire : un dépassement du seuil 38 000 € NE déclenche PAS
    // de bascule en cours d'année. La radiation du RSPM intervient au 1er janvier N+1.
    // R7 (audit final mai 2026) : si le user a déjà coché « Sortie du RSPM » (sortie_rspm_n_plus_1),
    // le bloc dédié L2745+ couvre déjà précisément ce message — on évite le doublon.
    if (!situations.includes('sortie_rspm_n_plus_1')) {
      pieges.push("Surveille tes recettes : si tu dépasses ~38 000 €/an en RSPM, l'URSSAF te radie automatiquement au 1er janvier N+1 (pas en cours d'année). Tu restes 100 % RSPM sur N et tu démarres au PAMC en N+1 — anticipe les cotisations PAMC qui sont sensiblement plus élevées.");
    }
  }

  // Situations
  // Fix #1 — Rétrocessions : éviter la redondance avec le piège installé déjà ajouté
  // R6 (audit final mai 2026) : la branche SELARL a été retirée (inatteignable — un gérant SEL
  // a `typeActivite='installe'` ou `'collaborateur'`, exclus par la garde ci-dessous).
  if (situations.includes('retrocessions')) {
    // R4 — RO-003 déjà push pour micro-BNC base ; n'ajouter ici qu'en BNC réel/SELARL.
    if (regime !== 'micro-bnc') regles.push('RO-003');
    if (typeActivite !== 'installe' && typeActivite !== 'collaborateur') {
      if (regime === 'micro-bnc') {
        pieges.push("Rétrocessions versées : déduire du CA AVANT de reporter en 5HQ (CGI Art. 102 ter). N'oublie pas la déclaration DAS-2 si tu verses > 1 200 €/an à un même remplaçant.");
      } else if (regime === 'reel') {
        pieges.push("Rétrocessions versées : charge déductible en L21/BG de la 2035. Pense à la DAS-2 si > 1 200 €/an par bénéficiaire.");
      }
      // SELARL : branche supprimée (cas impossible — voir R6 ci-dessus).
    }
  }

  const hasZfu = situations.includes('zfu');
  const hasFrr = situations.includes('frr');
  const hasPdsa = situations.includes('pdsa');

  // FRR (ex-ZRR) inaccessible aux remplaçants
  if (hasFrr && typeActivite === 'remplacant') {
    pieges.push("⚠️ FRR (ex-ZRR) : ce dispositif n'est PAS accessible aux médecins remplaçants. Tu dois être installé en cabinet propre dans la zone pour en bénéficier.");
  }
  // ZFU-TE également inaccessible aux remplaçants (exonération conditionnée à une installation effective en zone)
  if (hasZfu && typeActivite === 'remplacant') {
    pieges.push("⚠️ ZFU-TE : ce dispositif n'est PAS accessible aux médecins remplaçants. Il faut être installé en cabinet propre dans la zone (implantation effective et exclusive) pour en bénéficier.");
  }

  // 5HP / 5QB / DSFA — labels dynamiques selon les exonérations cochées.
  // Doctrine 2026 (notice DGFiP 2042-C-PRO + brochure pratique BNC) :
  //   • Micro-BNC ZFU/FRR/JEI  → 5HP/5IP/5JP UNIQUEMENT (revenu net exonéré = brut × 0,66).
  //   • Réel ZFU/FRR/JEI        → 5QB/5RB/5SB UNIQUEMENT (bénéfice exonéré).
  //   • 5HY/5IY/5JY = case résiduelle (déclaration contrôlée — dispositifs FRR/JEI atypiques),
  //     "très peu utilisée en pratique" → JAMAIS auto-poussée par le wizard.
  //   • DSFA/DSFB (volet social PAMC) = PDSA Art. 151 ter en micro-BNC PAMC uniquement.
  //     Pour la ZFU micro-BNC, le volet social passe par DSCS (recettes brutes totales).
  const exoZonageLabels: string[] = [];
  if (hasZfu) exoZonageLabels.push('ZFU');
  if (hasFrr) exoZonageLabels.push('FRR');
  const dsfaLabels: string[] = [];
  if (hasPdsa) dsfaLabels.push('PDSA');

  // F2 — ZFU/FRR ne sont accessibles qu'aux titulaires/collaborateurs/mixtes installés.
  // Pour remplaçant/centre_medical, on garde le piège d'inéligibilité (déjà poussé L2557-2563)
  // mais on NE pousse PAS la case 5HP/5QB sinon la checklist se contredit.
  const exoZonageEligible = typeActivite !== 'remplacant' && typeActivite !== 'centre_medical';
  if (exoZonageLabels.length > 0 && exoZonageEligible) {
    const exoZonageText = exoZonageLabels.join(' + ');
    regles.push('RO-006');

    if (regime === 'micro-bnc') {
      cases.push({ code: '5HP', nom: `Revenu net exonéré ${exoZonageText} (micro-BNC)`, formulaire: '2042 C PRO', ordre: 5 });
      pieges.push(`Case 5HP (${exoZonageText}) : reporte tes revenus exonérés APRÈS application de l'abattement 34 % (montant brut × 0,66). Ne reporte PAS le brut. Aucune autre case ZFU à remplir (pas de 5HY).`);
    } else if (regime === 'reel') {
      cases.push({ code: '5QB', nom: `Bénéfice exonéré ${exoZonageText} (régime réel)`, formulaire: '2042 C PRO', ordre: 5 });
      pieges.push(`Case 5QB (${exoZonageText}) : reporte le bénéfice exonéré net (après déduction des charges au prorata, tel que calculé sur la 2035). Ne reporte PAS le CA brut. La case 5HP n'est PAS utilisée en BNC réel.`);
    }
    // SELARL/IS : exonération traitée côté société, aucune case 2042 personnelle à pousser.
  }

  // V24 — DSFA exclusivement micro-BNC + PAMC pour la PDSA (la PDSA en réel passe par CI → RBS → DSDE/DSDG).
  // La ZFU micro-BNC ne transite PAS par DSFA : le volet social s'appuie sur DSCS (recettes brutes).
  if (dsfaLabels.length > 0 && regimeSocial === 'pamc' && regime === 'micro-bnc') {
    const dsfaText = dsfaLabels.join(' + ');
    cases.push({ code: 'DSFA', nom: `Revenus exonérés ${dsfaText} (Net)`, formulaire: 'DSFU', ordre: 13 });
    if (hasPdsa) {
      pieges.push("⚠️ Ne reporte JAMAIS la PDSA en case 5HP (réservée ZFU/ZRR/JEI). En micro-BNC, la PDSA exonérée se déclare uniquement en DSFA/DSFB sur la DSFU (volet PAMC), en NET (×0,66). La mettre en 5HP entraîne un double-comptage URSSAF.");
    }
  }

  // V24 — En BNC réel + PAMC + PDSA : passage par CI (DSDE déjà poussé L2146, DSDG ajouté pour cas RBS<0)
  if (hasPdsa && regimeSocial === 'pamc' && regime === 'reel') {
    cases.push({ code: 'CI', nom: 'PDSA exonérée — Divers à déduire (cadre 7)', formulaire: '2035', ordre: 11 });
    cases.push({ code: 'DSDG', nom: 'Revenu brut social négatif (si RBS < 0)', formulaire: 'DSFU', ordre: 23 });
  }

  if (hasZfu || hasFrr) {
    pieges.push("ZFU/FRR : exonération dégressive (100 % les 5 premières années, puis 60 % / 40 % / 20 % les années 6-7-8). Vérifie ton année d'installation pour appliquer le bon taux.");
  }

  if (hasPdsa) {
    if (regime === 'micro-bnc' && regimeSocial === 'pamc') {
      pieges.push("PDSA : exonération fiscale (Art. 151 ter CGI) MAIS pas sociale. En micro-BNC + PAMC, reporte le NET (×0,66) en DSFA/DSFB sur la DSFU (volet PAMC) — les majorations restent soumises à cotisations URSSAF/CARMF.");
    } else if (regime === 'reel' && regimeSocial === 'pamc') {
      pieges.push("PDSA : exonération fiscale (Art. 151 ter CGI) MAIS pas sociale. En BNC réel, déduis-la en **ligne CI** (cadre 7) de la 2035-B — la formule du RBS la réintègre automatiquement en DSDE (RBS positif) ou DSDG (RBS négatif). Ne remplis JAMAIS DSFA en réel (sinon double cotisation).");
    } else if (regimeSocial === 'rspm' && regime !== 'micro-bnc') {
      // R3 (cleanup mai 2026) : en RSPM micro-BNC, le piège silencieux ci-dessous couvre déjà
      // « rien à faire socialement / pas de DSFU » — on évite le doublon.
      pieges.push("PDSA : exonération fiscale (Art. 151 ter CGI) MAIS pas sociale. Au RSPM, rien à faire socialement — déjà cotisé sur le CA brut déclaré.");
    }
    // SELARL/IS : la PDSA en société sort du périmètre BNC — pas de message générique.
    pieges.push("Comptage des 60 jours : 1 garde samedi 12h-0h = 2 jours (12h-20h + 20h-0h). Nuit 20h-8h = 1 jour par dérogation. Choisis les jours les mieux rémunérés si tu dépasses 60.");

    // R3 — Piège silencieux RSPM + PDSA micro-BNC consolidé : couvre l'exonération sociale,
    // la pré-remplie 2042-C-PRO, l'interdiction 5HP et l'absence de DSFU en un seul message.
    if (regimeSocial === 'rspm' && regime === 'micro-bnc') {
      pieges.push("⚠️ RSPM + PDSA (micro-BNC) : exonération fiscale (Art. 151 ter CGI) MAIS pas sociale — au RSPM tu as déjà cotisé sur le CA brut. Ta 2042-C-PRO est pré-remplie PDSA INCLUSE : écrase le 5HQ pré-rempli (recettes hors PDSA exonérée). NE METS RIEN en 5HP (case réservée ZFU/ZRR/JEI). Aucune DSFU à remplir.");
    }
  }

  if (situations.includes('maternite')) {
    cases.push({ code: 'DSDX', nom: 'IJ versées par la CPAM (brut)', formulaire: 'DSFU', ordre: 14 });
    // Phase 12N — G1 : IJ Madelin hors ALD + AJPA (PAMC uniquement, DSFU)
    if (regimeSocial === 'pamc') {
      cases.push({ code: 'DSCZ', nom: 'IJ Madelin (hors ALD) + AJPA', formulaire: 'DSFU', ordre: 14 });
    }
    // Phase 9J — G2 : 1AZ (pension d'invalidité permanente CARMF) NON poussé automatiquement
    // (rare et hors sujet maternité). La nuance reste expliquée dans le piège pédagogique
    // ci-dessous. Pour les profils explicitement concernés, voir PM-006.casePrioritaires.
    regles.push('RO-004');
    if (regime === 'micro-bnc') {
      pieges.push("**IJ CPAM hors ALD — micro-BNC (doctrine 2026, DGFiP brochure p. 180)** : NON imposables IR → JAMAIS dans 5HQ. Seul report : DSDX/DSDY brut (volet social, normalement pré-rempli par la CPAM — vérifie vs ton attestation Ameli). Voir QT-041.");
    }
    if (regime === 'reel') {
      // Doctrine 2026 sealing : IJ CPAM hors ALD → AF (gains divers) → 5QC + DB cadre 8 (anti-doublon social) + DSDX brut. JAMAIS 1AJ.
      // (cases AF/DB de la 2035 ne sont pas dans le caseopedia 2042 — pédagogie dans le piège)
      pieges.push("**IJ CPAM hors ALD — BNC réel (doctrine 2026, expert mai 2026)** : reporter en **AF** (gains divers L7 de la 2035-A) → 5QC, ET en miroir **DB du Cadre 8** (2035-B) pour neutraliser le double-comptage social, ET en **DSDX brut** (volet PAMC). **JAMAIS en 1AJ** — la pré-tolérance « salaire » historique a été supprimée. Voir QT-040.");
    }
    if (regime === 'selarl') {
      pieges.push("**IJ CPAM hors ALD — SEL/IS (doctrine 2026)** : à reporter en DSDX brut (volet PAMC personnel) — JAMAIS en DSEC/DSED (rémunération de gérant) ni en 1AJ. Source : Brochure DGFiP 2026 p. 180.");
    }
    pieges.push("IJ Madelin hors ALD + AJPA : imposables en gains divers (case AF de la 2035 en réel ; recettes 5HQ en micro-BNC) ET soumises à cotisations sociales en **DSCZ/DSDZ** (PAMC) — JAMAIS en DSEM (épargne salariale IS, sans rapport). En BNC réel, le mécanisme Cadre 8 + ligne DB de la 2035-B neutralise le double-comptage social. ALD : exclues de DSCZ/DSDZ (hors assiette sociale).");
    pieges.push("**IJ CARMF d'incapacité temporaire** : imposables en BNC gain divers (ligne AF de la 2035-A en réel ou recettes 5HQ en micro-BNC), exonérées socialement — JAMAIS en 1AS ni 1AZ. **Pension d'invalidité permanente CARMF** (rente viagère) : case **1AZ** de la 2042 (pas 1AS, qui est réservée aux pensions de retraite).");
  }
  if (situations.includes('revenus_fonciers') && regime !== 'micro-bnc') {
    cases.push({ code: '4BE', nom: 'Revenus fonciers (loyer pro domicile)', formulaire: '2042', ordre: 17 });
    pieges.push("Le loyer pro déduit (2035 ou comptabilité SEL) doit être déclaré en miroir comme revenu foncier (4BE ou 4BA). Oublier = risque en contrôle.");
  }
  // Fix #6 — ANCV : expliquer le coefficient 1,515
  if (situations.includes('ancv')) {
    cases.push({ code: 'DSCN', nom: 'Chèques Vacances ANCV', formulaire: 'DSFU', ordre: 15 });
    regles.push('RO-005');
    if (regime === 'micro-bnc') {
      pieges.push("ANCV micro-BNC : 5HQ = CA − (montant CV × 1,515). Ce coefficient neutralise l'abattement 34% (1 ÷ 0,66 ≈ 1,515).");
    }
  }
  if (situations.includes('secteur2')) {
    cases.push({ code: 'DSAW', nom: 'Dépassements d\'honoraires', formulaire: 'DSFU', ordre: 12 });
  }
  if (situations.includes('cesu')) {
    cases.push({ code: '8UZ', nom: 'Crédit d\'impôt famille (CESU)', formulaire: '2042', ordre: 16 });
    pieges.push("CESU pré-financés via compte PRO (pas personnel) — formulaires 2069-FA-SD et 2069-RCI-SD à remplir");
  }
  // Fix #9 / Phase 12O — Forfaits S1 : installés, collaborateurs ET mixtes (réel)
  if (
    situations.includes('forfaits_s1') &&
    regime === 'reel' &&
    (typeActivite === 'installe' || typeActivite === 'collaborateur' || typeActivite === 'mixte')
  ) {
    // F3 — Secteur 2 / OPTAM : seul DF (2 % frais de représentation) reste accessible.
    // DG (3 % conventionnel) et DH (Groupe III 3 050 €) sont réservés au Secteur 1.
    const isSecteur2 = situations.includes('secteur2');
    cases.push({ code: 'DF', nom: 'Forfait 2 % (frais de représentation)', formulaire: '2035-B', ordre: 23 });
    if (!isSecteur2) {
      cases.push({ code: 'DG', nom: 'Forfait 3 % conventionnel', formulaire: '2035-B', ordre: 24 });
      // Phase 9K — F3 : Groupe III (DH) indisponible la 1ère année d'installation (RO-008).
      // PM-004 = Médecin en première installation → on bloque DH et on remonte un piège pédagogique.
      const isFirstYearInstall = profileId === 'PM-004';
      if (!isFirstYearInstall) {
        cases.push({ code: 'DH', nom: 'Groupe III (3 050 €)', formulaire: '2035-B', ordre: 25 });
      }
      regles.push('RO-008');
      pieges.push("Forfaits 2 % / 3 % / Groupe III : uniquement sur la part installation/collaboration, pas sur les remplacements ! Vont en cases dédiées DF / DG / DH ligne 43 de la 2035-B.");
      if (isFirstYearInstall) {
        pieges.push("⚠️ Groupe III (DH 3 050 €) : indisponible la **1ère année d'installation**. Tu peux activer DF (2 %) et DG (3 %) dès le 1er exercice — DH attend la 2ème année (voir RO-008).");
      }
      pieges.push("Réforme 2026 : la case DSCO est supprimée. Le 3 % (DG) et le Groupe III (DH) sont désormais réintégrés socialement via le RBS du Cadre 8 de la 2035-B → DSDE. Le 2 % (DF) reste exonéré socialement.");
    } else {
      // Secteur 2 OPTAM : uniquement DF accessible.
      pieges.push("⚠️ **Secteur 2 / OPTAM** : seul le **forfait 2 % (DF)** est accessible. Le **3 % (DG)** et le **Groupe III (DH)** sont **réservés au Secteur 1 conventionné** — ne PAS les remplir.");
    }
  }

  // Phase 12N — G3 : Activités annexes EHPAD/HAD/SSIAD (PAMC uniquement)
  if (situations.includes('ehpad_had') && regimeSocial === 'pamc') {
    cases.push({ code: 'DSAT', nom: 'Recettes EHPAD/HAD/SSIAD', formulaire: 'DSFU', ordre: 22 });
    pieges.push("DSAT : déclare uniquement les honoraires perçus en EHPAD, HAD ou SSIAD (régime de cotisations spécifique). Si tu n'en as pas, laisse à 0 — ne mélange pas avec DSCS.");
  }

  // Phase 9J — G4 : Cotisations Madelin / PER versées (réel + PAMC).
  // ⚠️ Doctrine 2026 scellée : les cotisations Madelin ne se déclarent PLUS dans aucune case
  // sociale URSSAF (l'abattement forfaitaire 26 % sur le RBS remplace l'ancien mécanisme).
  // On pousse uniquement les cases d'INFO PER sur la 2042 (6QS/6QT/6QU — calcul du plafond
  // épargne retraite global). DSCZ est réservé aux IJ Madelin REÇUES + AJPA (cf. maternité).
  if (situations.includes('madelin_cotisations') && regime === 'reel' && regimeSocial === 'pamc') {
    // Phase 9L — F1 : pousser BU (déduction réelle 2035-A L25) AVANT 6QS (info plafond 2042).
    cases.push({ code: 'BU', nom: 'Cotisations PER/Madelin déductibles (Art. 154 bis CGI)', formulaire: '2035-A', ordre: 22 });
    cases.push({ code: '6QS', nom: 'Info plafond épargne retraite (calcul 2042)', formulaire: '2042', ordre: 23 });
    pieges.push("Cotisations Madelin/PER versées : la déduction réelle se fait en **BU / ligne 25** de la 2035-A dans la limite Art. 154 bis CGI. Le report en **6QS / 6QT / 6QU** sur la 2042 sert UNIQUEMENT à calculer ton plafond épargne retraite N+1 — ce **n'est PAS une 2ᵉ déduction**. **Plus aucune case sociale URSSAF** depuis 2026 (l'abattement forfaitaire 26 % sur le RBS remplace l'ancien mécanisme). ⚠️ Ne pas confondre avec **DSCZ** (= IJ Madelin REÇUES + AJPA, voir « Congé maternité »).");
  }

  // Phase 12S — Cas A : Installation cabinet propre OU collaboration libérale en cours d'année
  // → bascule au 1er jour du trimestre civil suivant. SEUL cas qui produit une année mixte
  // RSPM (jusqu'au trimestre T) + PAMC (après T) sur N et donc une DSFU partielle.
  if (situations.includes('installation_collab_cours_annee')) {
    pieges.push("⚠️ Installation / collaboration en cours d'année (bascule RSPM → PAMC) : la sortie du RSPM prend effet au **1er jour du trimestre civil suivant** ta date d'installation (ou de signature du contrat de collaboration). Tu es donc RSPM jusqu'à cette date, puis PAMC après — c'est la SEULE situation qui crée une année fiscale « mixte ».");
    pieges.push("Année mixte : ne déclare en DSFU QUE les revenus de la période PAMC (après le basculement). Les recettes de la période RSPM restent uniquement en 2042-C-PRO (5HQ ou 5QC), JAMAIS en DSCS/DSAV.");
    pieges.push("DSAU = DSAV / DSCS : si tu es 100 % conventionné sur la période PAMC, DSAU = 1. Vérifie la cohérence avant validation.");
    pieges.push("Contacte la CARMF par mail (affiliations.cotis@carmf.fr) pour officialiser la bascule — elle n'est jamais notifiée automatiquement par l'URSSAF.");
  }

  // Phase 12T — Cas B+C fusionnés : sortie du RSPM avec effet au 1er janvier N+1.
  // → Que ce soit par dépassement du plafond (radiation auto URSSAF) ou par demande volontaire,
  //   il N'Y A PAS de bascule en cours d'année et AUCUNE DSFU à remplir sur N.
  //   Les deux déclencheurs partagent la même conséquence déclarative : on les fusionne en UI
  //   pour éviter la confusion (3 lignes visuellement identiques pour 2 comportements identiques).
  if (situations.includes('sortie_rspm_n_plus_1')) {
    pieges.push("⚠️ Sortie du RSPM (dépassement de plafond ou demande volontaire) : il N'Y A PAS de bascule en cours d'année. Tu restes 100 % RSPM sur N et tu démarres au PAMC le **1er janvier N+1**. Aucune DSFU à remplir sur N.");
    pieges.push("Dépassement automatique : si tu franchis ~19 000 € / 38 000 € de recettes annuelles, l'URSSAF te radie d'office au 1er janvier N+1 — tu n'as aucune démarche à faire.");
    pieges.push("Sortie volontaire : c'est une **option annuelle**. Demande écrite à l'URSSAF avant la fin de l'année N → effet au 1er janvier N+1. Stratégique si tu anticipes un dépassement ou si le PAMC devient plus avantageux (droits CARMF complets, IJ, prévoyance).");
    pieges.push("Anticipe la trésorerie : les cotisations PAMC (URSSAF + CARMF) sont sensiblement plus élevées que les forfaits RSPM. Mets de côté ~20 % de tes recettes dès que tu approches du seuil.");
    pieges.push("Conserve l'accusé de réception URSSAF de ta demande (sortie volontaire) et crée ton nouvel espace personnel URSSAF dès la radiation effective — l'ancien compte RSPM ne sera pas mis à jour, et la radiation peut tarder à être notifiée à la CARMF.");
  }

  // Rétro-compat (legacy) : `bascule_rspm_pamc` est normalisé en `installation_collab_cours_annee`
  // dès l'entrée de la fonction. Le helper ci-dessous reste tolérant pour la lisibilité du filtre DSFU.
  // EXCEPTION (Phase 12P — A2) : si installation/collaboration en cours d'année, on conserve la
  // DSFU pour la fraction PAMC de l'année (sinon la checklist serait pédagogiquement vide).
  const keepDsfu = situations.includes('installation_collab_cours_annee');
  const filteredCases = regimeSocial === 'rspm' && !keepDsfu
    ? cases.filter(c => c.formulaire !== 'DSFU')
    : cases;

  // Deduplicate cases by code
  const uniqueCases = filteredCases.reduce((acc, c) => {
    if (!acc.find(x => x.code === c.code)) acc.push(c);
    return acc;
  }, [] as typeof cases);

  // Phase 12N — M2 : dédup pièges normalisée (insensible à ponctuation/casse/accents)
  const seenPieges = new Set<string>();
  const uniquePieges: string[] = [];
  for (const p of pieges) {
    const key = normalizeForDedup(p);
    if (seenPieges.has(key)) continue;
    seenPieges.add(key);
    uniquePieges.push(p);
  }

  return {
    cases: uniqueCases.sort((a, b) => a.ordre - b.ordre),
    reglesPertinentes: [...new Set(regles)],
    pieges: uniquePieges,
  };
}
