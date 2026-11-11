import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass, Search, X, Check, ChevronLeft, ChevronRight, RotateCcw,
  Stethoscope, Car, Coins, Rocket, Shuffle, Baby, GraduationCap, MapPin,
  ArrowLeftRight, Building2, Handshake, FileText, ArrowDownRight, Hospital,
  Moon, Palmtree, CreditCard, PercentCircle, Home, Pencil, LogOut,
  HelpCircle, Info, Wallet, Receipt, ShieldCheck, Activity,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { profils, getWizardResult, getWizardResultGrouped, type WizardResult, type WizardResultGrouped } from '@/data/boussoleData';
import { ChecklistResult } from './checklist/ChecklistResult';
import { trackEvent } from '@/lib/analytics';

// =====================================================================
// Portage de src/pages/guide-declarations/components/SituationFinder.tsx
// (SPA source) — le "boussole" wizard, seul îlot interactif de la page.
// Déviations volontaires vs la source :
//  1. framer-motion (motion.*/AnimatePresence) retiré partout : éléments
//     bruts, mêmes classNames. Perte : petites transitions d'entrée/sortie
//     — comportement fonctionnel intact.
//  2. `selectedProfil` / `onProfilChange` / `onComputedCasesChange`
//     n'existent plus comme props externes : dans la SPA source, l'état
//     du profil sélectionné était levé dans `GuideDeclarationsBody` pour
//     filtrer/surligner en aval FlowChartSection, CaseopediaSection,
//     FichesPratiquesSection, TopQuestionsSection (profil sélectionné →
//     mise en avant des cases/fiches pertinentes). Ce guide étant porté
//     en pages statiques indépendantes (zéro JS hors îlot), cette
//     synchronisation croisée n'existe plus : le wizard est autonome et
//     ne filtre plus le reste de la page. Toutes les sections statiques
//     affichent donc TOUJOURS l'intégralité du contenu, non filtré.
//
// DA 2026 (phase 5d, MIGRATION.md § 9.el) : seules les classes changent
// (src/styles/guide.css, `gd-b-*`). Une grande fiche en relief ; le fil
// d'étapes en pastilles ; chaque choix est une fiche ciel doux à pastille
// d'icône, cerclée d'encre quand elle est choisie ; le bouton qui mène à la
// checklist en jaune. États, effets, gestionnaires : pas une ligne.
// =====================================================================

type Regime = 'micro-bnc' | 'reel' | 'selarl';
type RegimeSocial = 'rspm' | 'pamc';
type TypeActivite = 'remplacant' | 'installe' | 'mixte' | 'collaborateur' | 'centre_medical';
type StepKey = 'profil' | 'regime' | 'regimeSocial' | 'type' | 'situations' | 'result';

const iconMap: Record<string, React.ElementType> = {
  stethoscope: Stethoscope, car: Car, coins: Coins, rocket: Rocket, shuffle: Shuffle,
  baby: Baby, 'graduation-cap': GraduationCap, 'map-pin': MapPin,
  'arrow-left-right': ArrowLeftRight, 'building-2': Building2, 'handshake': Handshake,
  // P2 : aliases défensifs si un futur profil utilise ces icônes
  hospital: Hospital, moon: Moon, palmtree: Palmtree, 'credit-card': CreditCard,
  'percent-circle': PercentCircle, home: Home, pencil: Pencil,
};

// Presets : seules les valeurs CERTAINES selon le profil. Les autres restent demandées.
const PROFIL_PRESETS: Record<string, { regime?: Regime; regimeSocial?: RegimeSocial; type?: TypeActivite }> = {
  'PM-001': { regime: 'reel', regimeSocial: 'pamc', type: 'installe' },
  'PM-002': { type: 'remplacant' },
  'PM-003': { regime: 'reel', regimeSocial: 'pamc', type: 'installe' },
  'PM-004': { type: 'installe' },
  // Phase 12O — P2 : mixte salarié+libéral par défaut micro-BNC + RSPM (<38k€)
  'PM-005': { regime: 'micro-bnc', regimeSocial: 'rspm', type: 'mixte' },
  'PM-006': {}, // maternité concerne tous les types — on ne préjuge pas
  // Phase 12P — A5 : ZFU/FRR accessibles aussi en RSPM (1ʳᵉ année < 38k€) → ne pas forcer PAMC
  'PM-008': {},
  'PM-009': { type: 'remplacant' }, // bascule RSPM↔PAMC : le user choisit le régime social cible
  'PM-010': { regime: 'selarl', regimeSocial: 'pamc', type: 'installe' },
  'PM-011': { regimeSocial: 'pamc', type: 'collaborateur' },
  // Phase 12P — A7 : interne = micro-BNC + RSPM, mais on laisse le user choisir entre
  // Mixte (s'il cumule avec son salaire d'interne) et Remplaçant (stage libre / pas de salaire).
  'PM-012': { regime: 'micro-bnc', regimeSocial: 'rspm' },
  // Phase 12R — C1 : ne pas verrouiller PAMC (un vacataire 1ʳᵉ année <38k€ est RSPM)
  'PM-013': { type: 'centre_medical' },
};

// F5 / Phase 12N : situations pré-cochées par profil (aide pédagogique, l'utilisateur peut décocher)
// Audit final mai 2026 :
//   I2 — PM-005 (mixte salarié + libéral, défaut micro-BNC + RSPM) : ses anciens presets
//        `secteur2`+`forfaits_s1` étaient inertes (DSAW filtré par le filtre DSFU RSPM ;
//        forfaits_s1 gaté à `regime==='reel'`). Preset vidé pour éviter la fausse-bannière.
//   I3 — PM-011 (collaborateur) : `forfaits_s1` retiré (inerte si l'user reste micro-BNC).
//        L'option reste cochable manuellement à l'étape « situations » s'il choisit réel.
//   I9 — PM-008 (ZFU/FRR/PDSA) : retire `zfu` et `frr` du preset. Si l'utilisateur choisit
//        type=remplaçant, le moteur pousse ⚠️ « non accessible » tout en gardant la bannière
//        cohérente. ZFU/FRR restent disponibles dans la step 5 pour les installés/collaborateurs.
const PROFIL_SITUATION_PRESETS: Record<string, string[]> = {
  'PM-001': ['forfaits_s1'],          // installé S1 réel : forfaits 2 %/3 % quasi systématiques
  'PM-003': ['secteur2'],
  // Phase 9L — F2 / Audit mai 2026 I2 : PM-005 (mixte micro-BNC + RSPM) → preset vidé.
  'PM-005': [],
  'PM-006': ['maternite'],
  // I9 — PM-008 = ZFU/FRR/PDSA : seul `pdsa` est pré-coché (compatible toutes situations).
  // ZFU/FRR restent disponibles à la main de l'utilisateur dans la step 5.
  'PM-008': ['pdsa'],
    // U1 — PM-009 = remplaçant figé : cas A (installation/collab) inaccessible → preset cas B+C
    'PM-009': ['sortie_rspm_n_plus_1'],
  // I3 — PM-011 (collaborateur) : `forfaits_s1` retiré du preset (inerte si user reste micro-BNC).
  'PM-011': [],
  // Phase 12Q — B4 : vacataires (SOS Médecins, MMG, centres) font fréquemment de la PDSA
  'PM-013': ['pdsa'],
};


const REGIME_LABELS: Record<Regime, string> = {
  'micro-bnc': 'Micro-BNC',
  'reel': 'BNC Réel',
  'selarl': 'SELARL / SEL',
};
const REGIME_SOCIAL_LABELS: Record<RegimeSocial, string> = {
  rspm: 'RSPM',
  pamc: 'PAMC',
};
const TYPE_LABELS: Record<TypeActivite, string> = {
  remplacant: 'Remplaçant',
  installe: 'Installé',
  collaborateur: 'Collaborateur',
  centre_medical: 'Vacataire (centre / maison de santé)',
  mixte: 'Mixte (salarié + libéral)',
};
// F3 : label spécifique pour le stepper quand le régime est SELARL (le "type" n'est qu'interne)
const TYPE_LABEL_FOR_SELARL = 'Société d\'exercice (SEL)';

// U3 — labels courts des situations pour le bandeau « Auto-rempli depuis ton profil ».
const SITUATION_SHORT_LABELS: Record<string, string> = {
  zfu: 'ZFU',
  frr: 'FRR',
  pdsa: 'PDSA',
  maternite: 'Arrêt / IJ',
  ancv: 'ANCV',
  madelin_cotisations: 'Madelin / PER',
  installation_collab_cours_annee: 'Installation en cours d\'année',
  sortie_rspm_n_plus_1: 'Sortie du RSPM',
  secteur2: 'Secteur 2',
  forfaits_s1: 'Forfaits S1',
  retrocessions: 'Rétrocessions versées',
  cesu: 'CESU',
  revenus_fonciers: 'Loyer pro',
  ehpad_had: 'EHPAD / HAD',
};

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Audit final wizard (mai 2026) — helper P2 :
 * Régime social automatiquement forcé en PAMC dans 3 cas indissociables :
 *   • SELARL/SEL (gérant toujours PAMC sur rémunération de gérance)
 *   • Installé en cabinet propre (≥ 38 k€ par définition)
 *   • Collaborateur libéral (encaissement direct, conventionné)
 * Factorisé pour éviter les divergences entre useEffect, stepFlow, handlers et derived state.
 */
function isSocialAutoPamc(regime: Regime | null, type: TypeActivite | null): boolean {
  return regime === 'selarl' || type === 'installe' || type === 'collaborateur';
}

export function BoussoleWizard() {
  // Porté en état interne (voir note de portage en tête de fichier) —
  // la source recevait `selectedProfil`/`onProfilChange` en props du
  // parent `GuideDeclarationsBody`.
  const [selectedProfil, setSelectedProfilState] = useState<string | null>(null);
  const onProfilChange = setSelectedProfilState;
  const [query, setQuery] = useState('');
  const [regime, setRegime] = useState<Regime | null>(null);
  const [regimeSocial, setRegimeSocial] = useState<RegimeSocial | null>(null);
  const [typeActivite, setTypeActivite] = useState<TypeActivite | null>(null);
  const [situations, setSituations] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<StepKey>('profil');
  const [isOther, setIsOther] = useState(false);
  // Défilement vers l'étape : `reset` l'incrémente pour redemander un défilement quand
  // l'étape ne change pas (« Recommencer » depuis l'étape profil).
  const [scrollTick, setScrollTick] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Apply preset on profil select : on REMPLACE les valeurs du preset (et on vide les autres).
  // U2 — on replace AUSSI `currentStep` au premier step utile, sinon un changement de profil
  // en cours de wizard peut laisser l'utilisateur sur l'étape 'situations' avec regime=null.
  useEffect(() => {
    if (!selectedProfil) return;
    const preset = PROFIL_PRESETS[selectedProfil] ?? {};
    setRegime(preset.regime ?? null);
    setRegimeSocial(preset.regimeSocial ?? null);
    setTypeActivite(preset.type ?? null);
    setSituations(PROFIL_SITUATION_PRESETS[selectedProfil] ?? []);
    const socialAutoPamc = isSocialAutoPamc(preset.regime ?? null, preset.type ?? null);
    if (!preset.regime) setCurrentStep('regime');
    else if (!preset.regimeSocial && !socialAutoPamc) setCurrentStep('regimeSocial');
    else if (!preset.type) setCurrentStep('type');
    else setCurrentStep('situations');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProfil]);

  // Un seul défilement par changement d'étape, quel que soit le chemin (choix d'un profil,
  // d'un régime, « Continuer », « Retour », stepper, « Recommencer »). Il part APRÈS le rendu
  // de la nouvelle étape (effet + image suivante) : avant, il visait `#profils` pendant que
  // le contenu changeait, ou n'était pas demandé du tout (choix d'un profil), et le titre de
  // l'étape finissait sous la barre de recherche collante. Cible : le haut de la carte
  // (« Étape n / m » sur téléphone, puis le titre), placé sous l'en-tête et la barre mesurés
  // sur place. Si le haut de la carte est déjà sous la barre et le titre de l'étape dans
  // les deux tiers hauts de l'écran, la page ne bouge pas (cas du grand écran). Sans `behavior` : c'est `scroll-behavior`
  // de `global.css` qui décide, donc pas d'animation sous `prefers-reduced-motion`.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) return;
      const bar = document.querySelector<HTMLElement>('[role="search"]');
      const barBottom = bar
        ? (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight
        : 80;
      const min = barBottom + 12;
      const top = card.getBoundingClientRect().top;
      const titre = card.querySelector('h3');
      const basTitre = titre ? titre.getBoundingClientRect().bottom : top;
      if (top >= min && basTitre <= (window.innerHeight * 2) / 3) return;
      window.scrollTo({ top: window.scrollY + top - min });
    });
    return () => cancelAnimationFrame(raf);
  }, [currentStep, scrollTick]);

  // Compute the dynamic flow of steps based on what's known
  // Audit final wizard (mai 2026) — P0 : flow DYNAMIQUE basé sur (preset, regime, typeActivite).
  // L'étape `regimeSocial` est skippée dès que le moteur va de toute façon forcer PAMC
  // (SELARL, installé, collaborateur), quel que soit le chemin emprunté par l'utilisateur
  // (preset ou choix manuel via mode « Autre »). Évite d'afficher une étape contradictoire.
  const stepFlow: StepKey[] = useMemo(() => {
    const preset = selectedProfil ? PROFIL_PRESETS[selectedProfil] : undefined;
    const flow: StepKey[] = ['profil'];
    if (!preset?.regime) flow.push('regime');
    const skipSocial =
      !!preset?.regimeSocial ||
      isSocialAutoPamc(preset?.regime ?? regime, preset?.type ?? typeActivite);
    if (!skipSocial) flow.push('regimeSocial');
    if (!preset?.type) flow.push('type');
    flow.push('situations', 'result');
    return flow;
  }, [selectedProfil, regime, typeActivite]);

  const result: WizardResult | null = useMemo(() => {
    if (!regime || !typeActivite) return null;
    return getWizardResult(regime, typeActivite, situations, regimeSocial ?? 'pamc');
  }, [regime, regimeSocial, typeActivite, situations]);

  const grouped: WizardResultGrouped | null = useMemo(() => {
    if (!regime || !typeActivite) return null;
    return getWizardResultGrouped(regime, typeActivite, situations, regimeSocial ?? 'pamc', selectedProfil);
  }, [regime, regimeSocial, typeActivite, situations, selectedProfil]);

  // Filter profils
  const filteredProfils = useMemo(() => {
    // F1 — PM-014 (EI-IS option art. 1655 sexies CGI) est une fiche standalone, hors wizard.
    const visibles = profils.filter(p => p.id !== 'PM-014');
    if (!query.trim()) return visibles;
    const q = normalize(query.trim());
    return visibles.filter(p =>
      normalize(p.label).includes(q) ||
      normalize(p.conseilsCles.join(' ')).includes(q) ||
      normalize(p.description).includes(q)
    );
  }, [query]);

  const selected = selectedProfil ? profils.find(p => p.id === selectedProfil) : null;

  // Find the next step after currentStep in the flow
  const nextStep = (after: StepKey): StepKey => {
    const flow = stepFlow;
    const i = flow.indexOf(after);
    return flow[i + 1] ?? 'result';
  };

  // Handlers
  // Audit final wizard (mai 2026) — P1 : handler allégé. Le `useEffect[selectedProfil]`
  // ci-dessus s'occupe déjà du reset des champs + positionnement du `currentStep` dès que
  // `onProfilChange(id)` propage la nouvelle valeur. Garder une logique parallèle ici créait
  // un risque de divergence (déjà observé : socialAutoPamc dupliqué 4×).
  const handleSelectProfil = (id: string) => {
    setIsOther(false);
    setQuery('');
    onProfilChange(id);
  };

  const handleSelectOther = () => {
    setIsOther(true);
    setQuery('');
    onProfilChange(null);
    // Reset complet pour le mode manuel
    setRegime(null);
    setRegimeSocial(null);
    setTypeActivite(null);
    setSituations([]);
    setCurrentStep('regime');
  };

  const handleSelectRegime = (r: Regime) => {
    setRegime(r);
    // I6 / Phase 12O — U1 : purger les situations devenues incompatibles avec le nouveau régime
    setSituations(prev => prev.filter(s => {
      if (s === 'revenus_fonciers' && r === 'micro-bnc') return false;
      if (s === 'forfaits_s1' && r !== 'reel') return false;
      if (s === 'madelin_cotisations' && r !== 'reel') return false;
      return true;
    }));
    // B2 : SELARL → toujours PAMC
    if (r === 'selarl') setRegimeSocial('pamc');
    setCurrentStep(nextStep('regime'));
  };

  const handleSelectRegimeSocial = (rs: RegimeSocial) => {
    setRegimeSocial(rs);
    // Pruning : situations spécifiques PAMC ne survivent pas à un retour en RSPM
    if (rs === 'rspm') {
      setSituations(prev => prev.filter(s => s !== 'ehpad_had' && s !== 'madelin_cotisations'));
    }
    setCurrentStep(nextStep('regimeSocial'));
  };

  const handleSelectType = (t: TypeActivite) => {
    setTypeActivite(t);
    // B3 : installé / collaborateur → PAMC obligatoire (durci pour couvrir la nav arrière)
    if (t === 'installe' || t === 'collaborateur') setRegimeSocial('pamc');
    // C2 (audit final mai 2026) : `centre_medical` n'auto-force plus PAMC.
    // Doctrine PM-013 : un vacataire <38 000 €/an est légitimement au RSPM.
    // L'étape regimeSocial reste affichée pour ce type — le user choisit lui-même.
    // M4 : remplaçant → on retire les situations purement installé/collab (rétros versées, forfaits S1)
    if (t === 'remplacant') {
      setSituations(prev => prev.filter(s => s !== 'retrocessions' && s !== 'forfaits_s1' && s !== 'madelin_cotisations'));
    }
    if (t === 'centre_medical') {
      setSituations(prev => prev.filter(s => s !== 'retrocessions' && s !== 'forfaits_s1' && s !== 'madelin_cotisations'));
    }
    // Phase 12T — purge des situations RSPM→PAMC selon le type d'activité :
    //  - cas A (installation_collab_cours_annee) : réservé à installe/collaborateur/mixte
    //  - cas B+C fusionnés (sortie_rspm_n_plus_1) : tous les types RSPM-éligibles sauf installé/collab pur
    if (t === 'installe' || t === 'collaborateur') {
      // installé/collab pur → uniquement cas A pertinent (B+C supposent un statut RSPM courant)
      setSituations(prev => prev.filter(s => s !== 'sortie_rspm_n_plus_1' && s !== 'depassement_seuil_rspm' && s !== 'sortie_volontaire_rspm'));
    }
    if (t === 'remplacant' || t === 'centre_medical') {
      // remplaçant / centre médical : pas d'installation possible → cas A retiré
      setSituations(prev => prev.filter(s => s !== 'installation_collab_cours_annee'));
    }
    setCurrentStep('situations');
  };

  const toggleSituation = (s: string) => {
    setSituations(prev => {
      const has = prev.includes(s);
      if (has) return prev.filter(x => x !== s);
      // N3 (audit final mai 2026) : `installation_collab_cours_annee` et `sortie_rspm_n_plus_1`
      // sont deux trajectoires de sortie RSPM mutuellement exclusives — cocher l'une décoche l'autre.
      const EXCLUSIVE_PAIRS: Record<string, string> = {
        installation_collab_cours_annee: 'sortie_rspm_n_plus_1',
        sortie_rspm_n_plus_1: 'installation_collab_cours_annee',
      };
      const toRemove = EXCLUSIVE_PAIRS[s];
      const cleaned = toRemove ? prev.filter(x => x !== toRemove) : prev;
      return [...cleaned, s];
    });
  };


  const reset = () => {
    onProfilChange(null);
    setRegime(null);
    setRegimeSocial(null);
    setTypeActivite(null);
    setSituations([]);
    setQuery('');
    setIsOther(false);
    setCurrentStep('profil');
    // Phase 12N — U7 : analytics
    trackEvent('guide_declarations_wizard_reset');
    // P8 : ramener la vue en haut du wizard pour un nouveau parcours fluide
    // (défilement fait par l'effet `[currentStep, scrollTick]`).
    setScrollTick(t => t + 1);
  };

  const goToStep = (s: StepKey) => {
    // Le défilement vers la nouvelle étape est fait par l'effet `[currentStep, scrollTick]`.
    setCurrentStep(s);
  };

  // Stepper labels
  const stepMeta: Record<StepKey, { num: number; label: string; short: string }> = {
    profil:       { num: 1, label: 'Mon profil', short: 'Profil' },
    regime:       { num: 2, label: 'Régime fiscal', short: 'Fiscal' },
    regimeSocial: { num: 3, label: 'Régime social', short: 'Social' },
    type:         { num: 4, label: 'Mon activité', short: 'Activité' },
    situations:   { num: 5, label: 'Mes situations', short: 'Situations' },
    result:       { num: 6, label: 'Ma checklist', short: 'Checklist' },
  };
  const visibleSteps = stepFlow;
  const rawIndex = visibleSteps.indexOf(currentStep);
  // P3 : garde-fou défensif si currentStep n'est plus dans le flow (ex : changement de preset)
  const currentIndex = rawIndex < 0 ? 0 : rawIndex;

  // F4 : dérive le régime social effectivement utilisé par le moteur (couvre la nav arrière).
  // P2 : factorisé via `isSocialAutoPamc`.
  const effectiveRegimeSocial: RegimeSocial | null =
    isSocialAutoPamc(regime, typeActivite) ? 'pamc' : regimeSocial;

  // Status helpers
  const stepStatus = (s: StepKey): 'done' | 'active' | 'todo' => {
    if (s === currentStep) return 'active';
    const i = visibleSteps.indexOf(s);
    return i < currentIndex ? 'done' : 'todo';
  };

  const summaryFor = (s: StepKey): string | null => {
    if (s === 'profil') return selected?.label ?? (isOther ? 'Aucun profil prédéfini' : null);
    if (s === 'regime') return regime ? REGIME_LABELS[regime] : null;
    if (s === 'regimeSocial') return effectiveRegimeSocial ? REGIME_SOCIAL_LABELS[effectiveRegimeSocial] : null;
    // F3 : pour SELARL, l'étiquette « Installé » serait trompeuse → on affiche le statut société
    if (s === 'type') {
      if (regime === 'selarl') return TYPE_LABEL_FOR_SELARL;
      return typeActivite ? TYPE_LABELS[typeActivite] : null;
    }
    if (s === 'situations') return situations.length > 0 ? `${situations.length} sélectionnée(s)` : 'Aucune';
    // N2 (cleanup mai 2026) : 'result' → null intentionnellement (pas de résumé sur l'étape finale).
    return null;
  };

  return (
    <section id="profils" className="gd-sec gd-boussole">
      <div className="wrap">
        {/* Header */}
        <div className="gd-sec-tete milieu">
          <h2 className="gd-h2">
            <Compass className="gd-ic" /> Trouve ta situation
          </h2>
          <p className="gd-sous">
            Quelques questions pour personnaliser ta checklist de cases à remplir et filtrer la page autour de ton cas.
          </p>
        </div>

        {/* Page-filtered banner (persistent once a profil is set) */}
        {(selected || isOther) && (
          <div className="gd-b-filtre">
            {(() => {
              const Icon = selected ? (iconMap[selected.icon] || Stethoscope) : HelpCircle;
              return <Icon className="gd-ic" />;
            })()}
            <span className="gd-b-filtre-txt">
              {selected
                ? `Page filtrée pour : ${selected.label}`
                : 'Aucun profil prédéfini — on construit ton cas pas à pas (page non filtrée).'}
            </span>
            <button
              onClick={reset}
              className="gd-b-effacer"
              aria-label="Effacer le profil"
            >
              <X className="gd-ic" />
              <span className="gd-ordi">Effacer</span>
            </button>
          </div>
        )}

        {/* Stepper */}
        <div ref={cardRef} className="gd-b-fiche">
          {/* Mobile stepper compact (< sm) */}
          <div className="gd-b-fil-tel">
            <div className="gd-b-fil-tel-tete">
              <span className="gd-sur petit">
                {/* I1 (audit final mai 2026) : dénominateur basé sur les étapes RÉELLEMENT visibles. */}
                Étape {currentIndex + 1} / {visibleSteps.length}
              </span>
              <span className="gd-b-fil-tel-nom">
                {stepMeta[currentStep].label}
              </span>
            </div>

            <div className="gd-b-barres">
              {visibleSteps.map((s) => {
                const status = stepStatus(s);
                const isResultLocked = s === 'result' && !result;
                const clickable = (status === 'done' || status === 'active') && !isResultLocked;
                return (
                  <button
                    key={s}
                    onClick={() => clickable && goToStep(s)}
                    disabled={!clickable}
                    aria-label={`Étape ${stepMeta[s].num} : ${stepMeta[s].label}`}
                    aria-current={status === 'active' ? 'step' : undefined}
                    className={`gd-b-barre ${
                      status === 'active' ? 'actif'
                      : status === 'done' ? 'fait'
                      : ''
                    } ${clickable ? '' : 'verrou'}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop stepper (≥ sm) */}
          <div className="gd-b-fil">
            {visibleSteps.map((s) => {
              const meta = stepMeta[s];
              const status = stepStatus(s);
              const summary = summaryFor(s);
              const isResultLocked = s === 'result' && !result;
              const clickable = (status === 'done' || status === 'active') && !isResultLocked;
              return (
                <button
                  key={s}
                  onClick={() => clickable && goToStep(s)}
                  disabled={!clickable}
                  aria-current={status === 'active' ? 'step' : undefined}
                  className={`gd-b-pas ${
                    status === 'active' ? 'actif'
                    : status === 'done' ? 'fait'
                    : ''
                  } ${clickable ? '' : 'verrou'}`}
                >
                  <div className="gd-b-pas-nom">
                    {status === 'done'
                      ? <Check className="gd-ic" />
                      : <span className="gd-b-pas-num">
                          {/* D1 (audit final mai 2026) : numéro = position dans les étapes
                              RÉELLEMENT visibles (sinon « 1, 5, 6 » pour PM-001). */}
                          {visibleSteps.indexOf(s) + 1}
                        </span>}
                    <span>{meta.label}</span>
                  </div>
                  {status === 'done' && summary && (
                    <div className="gd-b-pas-resume">{summary}</div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Phase 12N — U2 : bandeau "Auto-rempli depuis ton profil" pour rendre visibles les étapes auto-skippées */}
          {selectedProfil && (() => {
            const preset = PROFIL_PRESETS[selectedProfil] ?? {};
            const autoFilled: { key: StepKey; label: string }[] = [];
            // Audit final wizard (mai 2026) — P1 : n'afficher dans le bandeau que les valeurs
            // preset qui correspondent ENCORE à l'état courant. Si l'user a modifié un champ
            // après l'auto-fill (ex : PM-001 preset reel → user revient à l'étape régime et
            // choisit micro-BNC), on n'affirme plus à tort « Auto-rempli : BNC Réel ».
            if (preset.regime && regime === preset.regime) {
              autoFilled.push({ key: 'regime', label: REGIME_LABELS[preset.regime] });
            }
            // Phase 12P — A1 : afficher le vrai régime social pré-rempli.
            // C1 (audit final mai 2026) : `centre_medical` retiré (vacataire <38k€ légitimement RSPM).
            // P1 (audit ultra-final mai 2026) : confronter à `effectiveRegimeSocial` courant.
            const socialAuto: RegimeSocial | null =
              preset.regimeSocial ??
              (isSocialAutoPamc(preset.regime ?? null, preset.type ?? null) ? 'pamc' : null);
            if (socialAuto && effectiveRegimeSocial === socialAuto) {
              autoFilled.push({ key: 'regimeSocial', label: REGIME_SOCIAL_LABELS[socialAuto] });
            }
            if (preset.type && typeActivite === preset.type) {
              autoFilled.push({ key: 'type', label: preset.regime === 'selarl' ? TYPE_LABEL_FOR_SELARL : TYPE_LABELS[preset.type] });
            }
            // U3 — situations pré-cochées (libellés courts), filtrées sur celles ENCORE cochées.
            const presetSituations = PROFIL_SITUATION_PRESETS[selectedProfil] ?? [];
            const situationLabels = presetSituations
              .filter(s => situations.includes(s))
              .map(s => SITUATION_SHORT_LABELS[s] ?? s)
              .filter(Boolean);
            if (autoFilled.length === 0 && situationLabels.length === 0) return null;
            return (
              <div className="gd-b-auto">
                <Check className="gd-ic" />
                <span className="gd-b-auto-nom">Auto-rempli depuis ton profil :</span>
                {autoFilled.map((a, i) => (
                  <span key={a.key} className="gd-b-auto-item">
                    <span className="gd-b-auto-val">
                      {a.label}
                    </span>
                    {i < autoFilled.length - 1 && <span>·</span>}
                  </span>
                ))}
                {situationLabels.length > 0 && (
                  <>
                    {autoFilled.length > 0 && <span>·</span>}
                    <span className="gd-b-auto-nom">Situations :</span>
                    {situationLabels.map((lbl, i) => (
                      <span key={`sit-${i}`} className="gd-b-auto-item">
                        <span className="gd-b-auto-val">
                          {lbl}
                        </span>
                        {i < situationLabels.length - 1 && <span>·</span>}
                      </span>
                    ))}
                    <button
                      onClick={() => goToStep('situations')}
                      className="gd-b-auto-modifier"
                      aria-label="Modifier les situations pré-cochées"
                    >
                      Modifier
                    </button>
                  </>
                )}
              </div>
            );
          })()}

          {/* Step body */}
          <div className="gd-b-corps">
              {currentStep === 'profil' && (
                <div key="step-profil">
                  <h3 className="gd-etape-titre">Quel profil te ressemble le plus ?</h3>

                  {/* Search */}
                  <div className="gd-b-cherche">
                    <Search className="gd-ic gd-rech-loupe" />
                    <Input
                      type="search"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Trouve ton profil (ex : remplaçant, ZFU, SELARL…)"
                      className="gd-b-saisie"
                    />
                    {query && (
                      <button onClick={() => setQuery('')} className="gd-rech-effacer">
                        <X className="gd-ic" />
                      </button>
                    )}
                  </div>

                  {/* Chips */}
                  <div className="gd-b-profils">
                    {filteredProfils.length === 0 ? (
                      <p className="gd-b-vide">
                        Aucun profil trouvé pour « {query} »
                      </p>
                    ) : (
                      filteredProfils.map((p, i) => {
                        const Icon = iconMap[p.icon] || Stethoscope;
                        const isSel = selectedProfil === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelectProfil(p.id)}
                            className={`gd-b-choix ${isSel ? 'choisi' : ''}`}
                          >
                            <span className="gd-rond blanc">
                              <Icon className="gd-ic" />
                            </span>
                            <span className="gd-b-choix-nom">{p.label}</span>
                          </button>
                        );
                      })
                    )}
                    {/* Option "Autre / Aucun ne me correspond" */}
                    <button
                      onClick={handleSelectOther}
                      className={`gd-b-choix autre ${isOther ? 'choisi' : ''}`}
                    >
                      <span className="gd-rond blanc">
                        <HelpCircle className="gd-ic" />
                      </span>
                      <span className="gd-b-choix-nom">
                        Aucun ne me correspond — guide-moi
                      </span>
                    </button>
                  </div>

                  {/* Note : les conseils prioritaires propres au profil sont désormais affichés
                      uniquement dans la checklist finale (carte hero "Pour toi"). Sélectionner un
                      profil déclenche un auto-advance immédiat → ce bloc serait invisible. */}
                </div>
              )}

              {currentStep === 'regime' && (
                <div key="step-regime">
                  <h3 className="gd-etape-titre">Quel est ton régime fiscal ?</h3>
                  <div className="gd-b-options">
                    {[
                      { v: 'micro-bnc' as Regime, label: 'Micro-BNC', desc: 'Abattement forfaitaire 34 %, pas de 2035', icon: FileText },
                      { v: 'reel' as Regime, label: 'BNC Réel', desc: 'Liasse 2035, charges déductibles au réel', icon: ArrowDownRight },
                      { v: 'selarl' as Regime, label: 'SELARL / SEL', desc: "Société d'exercice libéral", icon: Building2 },
                    ].map(r => {
                      const Icon = r.icon;
                      const isSel = regime === r.v;
                      return (
                        <button
                          key={r.v}
                          onClick={() => handleSelectRegime(r.v)}
                          className={`gd-b-choix grand ${isSel ? 'choisi' : ''}`}
                        >
                          <div className="gd-rond blanc grand">
                            <Icon className="gd-ic" />
                          </div>
                          <div>
                            <p className="gd-b-choix-nom">{r.label}</p>
                            <p className="gd-b-choix-desc">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 'regimeSocial' && (
                <div key="step-regimeSocial">
                  <div className="gd-b-titre-aide">
                    <h3 className="gd-etape-titre">Quel est ton régime social ?</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="gd-b-aide" aria-label="Comment savoir ?">
                            <Info className="gd-ic" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="gd-bulle">
                          <p className="gd-bulle-titre">Comment savoir ?</p>
                          <p>Vérifie sur ton espace URSSAF (rubrique « Mon affiliation »). Le RSPM est une option réservée aux remplaçants, ouverte jusqu'à 19 000 € d'honoraires par an. Tu le quittes au 1er janvier suivant après deux années de suite au-dessus de 19 000 €, ou une seule au-dessus de 38 000 € ; sans cette option, ou dès que tu t'installes, tu es au PAMC.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="gd-b-note">Le régime social (URSSAF + CARMF) est <strong>indépendant</strong> du régime fiscal — c'est la confusion la plus fréquente.</p>
                  <div className="gd-b-options">
                    {[
                      { v: 'rspm' as RegimeSocial, label: 'RSPM (Dispositif Simplifié)', desc: "Option des remplaçants, ouverte jusqu'à 19 000 €/an d'honoraires (l'année d'un dépassement, tu y restes). Pas de DSFU. Cotisations mensuelles ou trimestrielles, 13,5 % / 21,2 %.", icon: Wallet },
                      { v: 'pamc' as RegimeSocial, label: 'PAMC (Praticiens Conventionnés)', desc: 'Installé, collaborateur, ou remplaçant hors RSPM (jamais entré, ou sorti après un dépassement). DSFU obligatoire (DSCS, DSAV…).', icon: ShieldCheck },
                    ].map(r => {
                      const Icon = r.icon;
                      const isSel = regimeSocial === r.v;
                      return (
                        <button
                          key={r.v}
                          onClick={() => handleSelectRegimeSocial(r.v)}
                          className={`gd-b-choix grand ${isSel ? 'choisi' : ''}`}
                        >
                          <div className="gd-rond blanc grand">
                            <Icon className="gd-ic" />
                          </div>
                          <div>
                            <p className="gd-b-choix-nom">{r.label}</p>
                            <p className="gd-b-choix-desc">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 'type' && (
                <div key="step-type">
                  <h3 className="gd-etape-titre">Quel type d'activité ?</h3>
                  <div className="gd-b-options">
                    {[
                      { v: 'remplacant' as TypeActivite, label: 'Remplaçant', desc: 'Tu touches des rétrocessions perçues, sans cabinet propre', icon: Car },
                      { v: 'installe' as TypeActivite, label: 'Installé', desc: 'Cabinet propre, patientèle, charges fixes', icon: Hospital },
                      { v: 'collaborateur' as TypeActivite, label: 'Collaborateur libéral', desc: 'Encaissement direct, redevance au titulaire', icon: Building2 },
                      { v: 'centre_medical' as TypeActivite, label: 'Vacataire (centre / maison de santé)', desc: 'Tu vacationnes en structure (la structure verse les honoraires)', icon: Stethoscope },
                      { v: 'mixte' as TypeActivite, label: 'Mixte (salarié + libéral)', desc: 'Hospitalier + remplacements ou cabinet', icon: Shuffle },
                    ].map(r => {
                      const Icon = r.icon;
                      const isSel = typeActivite === r.v;
                      return (
                        <button
                          key={r.v}
                          onClick={() => handleSelectType(r.v)}
                          className={`gd-b-choix grand ${isSel ? 'choisi' : ''}`}
                        >
                          <div className="gd-rond blanc grand">
                            <Icon className="gd-ic" />
                          </div>
                          <div>
                            <p className="gd-b-choix-nom">{r.label}</p>
                            <p className="gd-b-choix-desc">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 'situations' && (
                <div key="step-situations">
                  <h3 className="gd-etape-titre">Situations particulières ?</h3>
                  <p className="gd-b-note">Coche tout ce qui s'applique — ou passe directement à la checklist.</p>
                  {(() => {
                    // M5 : groupes pédagogiques (Exonérations / Vie & arrêts / Conventionnel / Charges & crédits)
                    type SitItem = { v: string; label: string; icon: React.ElementType };
                    const groups: { titre: string; items: SitItem[] }[] = [
                      {
                        titre: 'Exonérations',
                        items: [
                          { v: 'zfu', label: 'ZFU', icon: MapPin },
                          { v: 'frr', label: 'FRR (ex-ZRR)', icon: MapPin },
                          { v: 'pdsa', label: 'Gardes PDSA', icon: Moon },
                        ],
                      },
                      {
                        titre: 'Vie & arrêts',
                        items: [
                          { v: 'maternite', label: 'Arrêt / IJ (maternité, maladie, prévoyance)', icon: Baby },
                          { v: 'ancv', label: 'Chèques Vacances ANCV', icon: Palmtree },
                          // Phase 9J — G4 : cotisations Madelin/PER versées (réel + PAMC effectif)
                          // Pousse uniquement 6QS (info plafond PER 2042) — JAMAIS DSCZ (doctrine 2026)
                          ...(regime === 'reel' && effectiveRegimeSocial === 'pamc' && (typeActivite === 'installe' || typeActivite === 'collaborateur' || typeActivite === 'mixte')
                            ? [{ v: 'madelin_cotisations', label: 'Cotisations Madelin / PER versées', icon: ShieldCheck }]
                            : []),
                          // Phase 12T — Sortie du RSPM : 2 entrées distinctes
                          //   A) Installation cabinet propre / collaboration libérale en cours d'année
                          //      → bascule au 1er jour du trimestre civil suivant (année mixte, DSFU partielle)
                          //   I8 (audit final mai 2026) : uniquement si l'utilisateur est encore au RSPM.
                          //   Pour installé/collaborateur le moteur force PAMC → seul mixte+RSPM est concerné en pratique.
                          ...((typeActivite === 'installe' || typeActivite === 'collaborateur' || typeActivite === 'mixte')
                              && effectiveRegimeSocial === 'rspm'
                            ? [{ v: 'installation_collab_cours_annee', label: 'Installation / collaboration en cours d\'année (sortie RSPM trimestrielle)', icon: ArrowLeftRight }]
                            : []),
                          //   B+C) Dépassement du plafond OU demande volontaire → effet 1er janvier N+1, aucune DSFU sur N
                          //   I7 (audit final mai 2026) : uniquement si l'utilisateur est encore au RSPM (sinon "sortie" n'a pas de sens).
                          ...(typeActivite !== 'installe' && typeActivite !== 'collaborateur'
                              && effectiveRegimeSocial === 'rspm'
                            ? [{ v: 'sortie_rspm_n_plus_1', label: 'Sortie du RSPM (effet 1ᵉʳ janvier N+1)', icon: LogOut }]
                            : []),

                        ],
                      },
                      {
                        titre: 'Conventionnel',
                        items: [
                          { v: 'secteur2', label: 'Secteur 2 / OPTAM', icon: Coins },
                          // Phase 12O — P3 : forfaits S1 aussi visibles pour mixte (installé secteur 1 réel)
                          ...(regime === 'reel' && (typeActivite === 'installe' || typeActivite === 'collaborateur' || typeActivite === 'mixte')
                            ? [{ v: 'forfaits_s1', label: 'Forfaits 2 % / 3 % (S1)', icon: PercentCircle }]
                            : []),
                        ],
                      },
                      {
                        titre: 'Charges & crédits',
                        items: [
                          ...(typeActivite !== 'remplacant' && typeActivite !== 'centre_medical'
                            ? [{ v: 'retrocessions', label: 'Rétrocessions versées (à un remplaçant)', icon: ArrowDownRight }]
                            : []),
                          { v: 'cesu', label: 'CESU pré-financés', icon: CreditCard },
                          ...(regime !== 'micro-bnc'
                            ? [{ v: 'revenus_fonciers', label: 'Loyer pro domicile', icon: Home }]
                            : []),
                        ],
                      },
                      // Phase 12N — G3 : Activités annexes (PAMC uniquement)
                      ...(effectiveRegimeSocial === 'pamc' ? [{
                        titre: 'Activités annexes',
                        items: [
                          { v: 'ehpad_had', label: 'EHPAD / HAD / SSIAD', icon: Activity },
                        ] as SitItem[],
                      }] : []),
                    ];
                    return (
                      <div className="gd-b-groupes">
                        {groups.filter(g => g.items.length > 0).map(g => (
                          <div key={g.titre}>
                            <p className="gd-sur petit">{g.titre}</p>
                            <div className="gd-b-situations">
                              {g.items.map(s => {
                                const Icon = s.icon;
                                const isSel = situations.includes(s.v);
                                return (
                                  <button
                                    key={s.v}
                                    onClick={() => toggleSituation(s.v)}
                                    className={`gd-b-choix coche ${isSel ? 'choisi' : ''}`}
                                  >
                                    <Icon className="gd-ic" />
                                    <span className="gd-b-choix-nom">{s.label}</span>
                                    {isSel && <Check className="gd-ic gd-b-coche" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {currentStep === 'result' && grouped && (
                <ChecklistResult result={grouped} />
              )}
            {/* Footer nav */}
            <div className="gd-b-pied">
              <Button variant="ghost" size="sm" onClick={reset} className="gd-bouton nu" aria-label="Recommencer">
                <RotateCcw className="gd-ic" /> <span className="gd-ordi">Recommencer</span>
              </Button>
              <div className="gd-b-pied-fin">
                {currentIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={() => goToStep(visibleSteps[currentIndex - 1])} className="gd-bouton ligne">
                    <ChevronLeft className="gd-ic" /> Retour
                  </Button>
                )}
                {/* F6 / Audit final wizard (mai 2026) — P2 : CTA "Continuer" factorisé.
                    Le bouton apparaît sur regime/regimeSocial/type quand la valeur courante
                    est saisie (cas du user qui revient en arrière via le stepper) ; sur
                    situations, il propose le passage à la checklist dès qu'un résultat existe. */}
                {(() => {
                  type CtaConfig = { ready: boolean; label: string; target: StepKey };
                  const ctas: Partial<Record<StepKey, CtaConfig>> = {
                    regime:       { ready: !!regime,        label: 'Continuer',       target: nextStep('regime') },
                    regimeSocial: { ready: !!regimeSocial,  label: 'Continuer',       target: nextStep('regimeSocial') },
                    type:         { ready: !!typeActivite,  label: 'Continuer',       target: nextStep('type') },
                    situations:   { ready: !!result,        label: 'Voir ma checklist', target: 'result' },
                  };
                  const cta = ctas[currentStep];
                  if (!cta || !cta.ready) return null;
                  return (
                    <Button size="sm" onClick={() => goToStep(cta.target)} className="gd-bouton soleil">
                      {cta.label} <ChevronRight className="gd-ic" />
                    </Button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
