import { useId, useState } from "react";
import { ChevronDown, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackEvent, tranche, TRANCHES_CHARGES } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { PUISSANCES, fraisKilometriques, fraisRepas, limitesRepas, type PuissanceFiscale } from "@/lib/simulateur/fraisPros";
import { formatNombre } from "@/lib/simulateur/nombres";

/**
 * « Estimer mes charges » (MIGRATION.md § 9.gd) : sous le champ des charges, une liste courte de
 * ce qu'un médecin peut déduire au réel. Deux lignes calculées par les barèmes officiels
 * (kilomètres, repas : `fraisPros.ts`), les autres saisies ; le total se reporte dans le champ.
 * Aucun montant pré-rempli. L'état reste quand le pli se ferme (le panneau seul est démonté).
 */

type Exercice = 'remplacant' | 'installe';

interface Ligne {
  id: string;
  libelle: string;
  aide?: string;
  pour?: Exercice;
}

const LIGNES: Ligne[] = [
  { id: 'ordre', libelle: "Cotisation à l'Ordre des médecins" },
  { id: 'rcp', libelle: 'Assurance responsabilité civile professionnelle' },
  { id: 'compta', libelle: 'Comptable, association de gestion agréée' },
  { id: 'cabinet', libelle: 'Loyer, charges ou redevance du cabinet', pour: 'installe' },
  { id: 'secretariat', libelle: 'Secrétariat, télésecrétariat', pour: 'installe' },
  { id: 'hebergement', libelle: 'Hébergement lors des remplacements', pour: 'remplacant' },
  { id: 'logiciels', libelle: 'Logiciels et abonnements professionnels' },
  { id: 'telephone', libelle: 'Téléphone et internet (part pro)' },
  {
    id: 'materiel',
    libelle: 'Matériel médical et petit équipement',
    aide: "Un équipement de plus de 500 € HT s'amortit sur plusieurs années : n'en compte que la part de l'année.",
  },
  { id: 'formation', libelle: 'Formation, congrès, livres et revues' },
  {
    id: 'reverse',
    libelle: 'Part reversée au médecin remplacé',
    aide: "Seulement si tes recettes saisies sont les honoraires que tu encaisses toi-même. Si le médecin remplacé encaisse et te reverse ta part, laisse vide.",
    pour: 'remplacant',
  },
  { id: 'autres', libelle: 'Autres (frais bancaires, fournitures, syndicat…)' },
];

const euros = (v: number, decimales = 0) =>
  formatNombre('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(v);

const nombre = (s: string) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : 0;
};

export function EstimateurCharges({
  annee,
  periode,
  typeExercice,
  recettesAnnuelles,
  onReporter,
  ouvert: ouvertPilote,
  onOuvertChange,
}: {
  annee: number;
  periode: 'annuel' | 'mensuel';
  typeExercice: Exercice;
  recettesAnnuelles: number;
  /** Reçoit le montant à mettre dans le champ des charges (annuel ou mensuel, comme le champ). */
  onReporter: (montant: number) => void;
  /** Ouverture pilotée par le formulaire (§ 9.gg : l'invitation sous un champ de charges vide). */
  ouvert?: boolean;
  onOuvertChange?: (ouvert: boolean) => void;
}) {
  const id = useId();
  const [ouvertLocal, setOuvertLocal] = useState(false);
  const ouvert = ouvertPilote ?? ouvertLocal;
  const setOuvert = onOuvertChange ?? setOuvertLocal;
  const [km, setKm] = useState('');
  const [puissance, setPuissance] = useState<PuissanceFiscale>('5');
  const [electrique, setElectrique] = useState(false);
  const [peages, setPeages] = useState('');
  const [repas, setRepas] = useState('');
  const [prixRepas, setPrixRepas] = useState('');
  const [montants, setMontants] = useState<Record<string, string>>({});
  const [reporte, setReporte] = useState<string | null>(null);

  const lignes = LIGNES.filter((l) => !l.pour || l.pour === typeExercice);
  const voiture = fraisKilometriques(nombre(km), puissance, electrique);
  const deplacements = voiture + Math.round(nombre(peages));
  const repasDeductibles = fraisRepas(nombre(repas), nombre(prixRepas), annee);
  const { foyer, plafond } = limitesRepas(annee);
  const autres = lignes.reduce((t, l) => t + Math.round(nombre(montants[l.id] ?? '')), 0);
  const total = deplacements + repasDeductibles.total + autres;
  const mensuel = periode === 'mensuel';
  const aReporter = mensuel ? Math.round(total / 12) : total;

  const basculer = () => {
    if (!ouvert) trackEvent('public_simulator_charges_helper_opened');
    setOuvert(!ouvert);
  };
  const reporter = () => {
    onReporter(aReporter);
    const lignesRemplies = [km, repas, peages, ...Object.values(montants)].filter((v) => nombre(v) > 0).length;
    trackEvent('public_simulator_charges_helper_applied', { tranche_charges: tranche(total, TRANCHES_CHARGES), lignes_remplies: lignesRemplies });
    setReporte(`${euros(aReporter)}${mensuel ? ' par mois' : ''} reportés dans « Tes charges réelles ».`);
  };
  // Un champ modifié après le report : le message ne vaut plus.
  const changer = <T,>(f: (v: T) => void) => (v: T) => { f(v); setReporte(null); };

  const champ = (cle: string, libelle: string, valeur: string, surChange: (v: string) => void, opts: { aide?: string; unite?: string; decimales?: boolean } = {}) => (
    <div className="sim-estim-ligne" key={cle}>
      <label htmlFor={`${id}-${cle}`}>{libelle}</label>
      <div className="relative">
        <Input
          id={`${id}-${cle}`}
          type="number"
          inputMode={opts.decimales ? 'decimal' : 'numeric'}
          min={0}
          step={opts.decimales ? '0.01' : '1'}
          value={valeur}
          onChange={(e) => changer(surChange)(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-describedby={opts.aide ? `${id}-${cle}-aide` : undefined}
          className="pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">{opts.unite ?? '€'}</span>
      </div>
      {opts.aide && <p id={`${id}-${cle}-aide`} className="sim-estim-aide">{opts.aide}</p>}
    </div>
  );

  return (
    <div className="sim-estim">
      <Button
        type="button"
        variant="ghost"
        className="sim-pli w-full justify-between h-auto"
        aria-expanded={ouvert}
        aria-controls={`${id}-panneau`}
        onClick={basculer}
        data-ph="simulateur_estimer_charges"
      >
        <span className="flex items-center gap-1.5 sm:gap-2 text-sm flex-wrap">
          <Calculator className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="sm:hidden">Estimer mes charges</span>
          <span className="hidden sm:inline">Estimer mes charges (trajets, repas, assurance…)</span>
          <Badge variant="outline" className="sim-puce neutre">Aide</Badge>
        </span>
        <ChevronDown className={cn("sim-chevron h-5 w-5 transition-transform duration-200", ouvert && "rotate-180")} aria-hidden="true" />
      </Button>

      {ouvert && (
        <div id={`${id}-panneau`} className="sim-estim-panneau">
          <p className="sim-estim-intro">
            Ce que tu paies pour exercer, sur une année. Ces charges se déduisent au régime réel ; en Micro-BNC, l'abattement de 34{'\u00a0'}% les remplace. Le simulateur compare les deux.
          </p>

          <div className="sim-estim-groupe" role="group" aria-labelledby={`${id}-voiture`}>
            <p id={`${id}-voiture`} className="sim-estim-titre">Voiture</p>
            {champ('km', 'Kilomètres professionnels dans l\'année', km, setKm, {
              unite: 'km',
              aide: 'Trajets vers tes lieux d\'exercice, visites, gardes. Trajet domicile-cabinet : 40 km au plus par trajet, sauf circonstances particulières.',
            })}
            <div className="sim-estim-ligne">
              <label htmlFor={`${id}-cv`}>Puissance fiscale (case P.6 de la carte grise)</label>
              <Select value={puissance} onValueChange={(v) => changer(setPuissance)(v as PuissanceFiscale)}>
                <SelectTrigger id={`${id}-cv`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="sim sim-pop">
                  {PUISSANCES.map((p) => <SelectItem key={p.valeur} value={p.valeur}>{p.libelle}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="sim-estim-coche">
              <input type="checkbox" className="sim-case" checked={electrique} onChange={(e) => changer(setElectrique)(e.target.checked)} />
              <span>Voiture 100{'\u00a0'}% électrique (barème majoré de 20{'\u00a0'}%)</span>
            </label>
            {champ('peages', 'Péages et parkings', peages, setPeages, { aide: "Le barème couvre carburant, entretien, assurance et usure de la voiture ; péages et parkings s'y ajoutent." })}
            <p className="sim-estim-calcul">
              Barème kilométrique{'\u00a0'}: <strong>{euros(voiture)}</strong>{deplacements > voiture && <> · avec péages et parkings{'\u00a0'}: <strong>{euros(deplacements)}</strong></>}
            </p>
          </div>

          <div className="sim-estim-groupe" role="group" aria-labelledby={`${id}-repas-groupe`}>
            <p id={`${id}-repas-groupe`} className="sim-estim-titre">Repas</p>
            {champ('repas', 'Repas pris sur le lieu d\'exercice dans l\'année', repas, setRepas, {
              unite: 'repas',
              aide: 'Seulement ceux que la distance t\'empêche de prendre chez toi, ticket à l\'appui.',
            })}
            {champ('prix', 'Prix moyen d\'un repas', prixRepas, setPrixRepas, { decimales: true })}
            <p className="sim-estim-calcul">
              Déductible{'\u00a0'}: <strong>{euros(repasDeductibles.total)}</strong>
              {repasDeductibles.parRepas > 0 && <> ({euros(repasDeductibles.parRepas, 2)} par repas)</>}.
              {' '}Par repas, le prix plafonné à {euros(plafond, 2)}, moins {euros(foyer, 2)}, la valeur d'un repas pris chez soi.
            </p>
          </div>

          <div className="sim-estim-groupe" role="group" aria-labelledby={`${id}-annee`}>
            <p id={`${id}-annee`} className="sim-estim-titre">Dans l'année</p>
            {lignes.map((l) => champ(l.id, l.libelle, montants[l.id] ?? '', (v) => setMontants((m) => ({ ...m, [l.id]: v })), { aide: l.aide }))}
          </div>

          <p className="sim-estim-hors">
            Ne compte pas ici tes cotisations Urssaf et CARMF ni la CSG (le simulateur les calcule), ton impôt, ni tes versements PER ou Madelin (dans les options avancées).
          </p>

          <div className="sim-estim-total">
            <p>
              Total estimé{'\u00a0'}: <strong>{euros(total)}</strong> par an
              {mensuel && <> ({euros(Math.round(total / 12))} par mois)</>}
              {recettesAnnuelles > 0 && total > 0 && <>, soit {Math.round((total / recettesAnnuelles) * 100)}{'\u00a0'}% de tes recettes</>}.
              {recettesAnnuelles > 0 && <> Le Micro-BNC en compte 34{'\u00a0'}%, soit {euros(Math.round(recettesAnnuelles * 0.34))}, à leur place.</>}
            </p>
            <Button type="button" className="sim-estim-bouton" onClick={reporter} disabled={total <= 0} data-ph="simulateur_estimer_charges_reporter">
              Reporter {euros(aReporter)}{mensuel ? ' par mois' : ''} dans mes charges
            </Button>
            <p className="sim-estim-statut" role="status">{reporte}</p>
          </div>

          <p className="sim-estim-sources">
            Barème kilométrique{'\u00a0'}: arrêté du 27 mars 2023, le dernier publié. Repas{'\u00a0'}: limites {annee >= 2026 ? 2026 : 2025} du BOFiP. Pour aller plus loin{'\u00a0'}:{' '}
            <a href="/blog/frais-pros-medecin-liberal-2026" target="_blank" rel="noopener">les frais pros du médecin libéral</a>
            {' '}et{' '}
            <a href="/blog/voiture-bareme-kilometrique-ou-frais-reels-medecin" target="_blank" rel="noopener">barème kilométrique ou frais réels</a>.
          </p>
        </div>
      )}
    </div>
  );
}
