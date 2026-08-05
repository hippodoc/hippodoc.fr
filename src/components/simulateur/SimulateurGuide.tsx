import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calculator,
  Settings2,
  BarChart3,
  Lightbulb,
  Wallet,
  Heart,
  MapPin,
  ArrowDownCircle,
} from "lucide-react";
import { getDeclarationParams } from "@/lib/declarationParams";

interface GuideSection {
  number: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: React.ReactNode;
}

const sections: GuideSection[] = [
  {
    number: 1,
    title: "C'est quoi le Super-Net ?",
    icon: <Calculator className="h-4 w-4 text-white" />,
    color: "from-emerald-500 to-teal-500",
    content: (
      <p>
        Ce simulateur compare <strong>Micro-BNC</strong> et <strong>Régime Réel</strong> pour
        calculer ton <strong>Super-Net</strong> : ce qu'il te reste vraiment après cotisations
        sociales ET impôt sur le revenu. En 2 minutes, tu sais quel régime te laisse le plus en
        poche.
      </p>
    ),
  },
  {
    number: 2,
    title: "Tes revenus — Les champs essentiels",
    icon: <Wallet className="h-4 w-4 text-white" />,
    color: "from-blue-500 to-indigo-500",
    content: (
      <ul className="space-y-2.5">
        <li>
          <strong>Tes revenus libéraux</strong> — Total <em>annuel</em> de tous tes honoraires
          encaissés (consultations, actes techniques, dépassements, PDSA). Retrouve-le sur ton
          relevé SNIR ou ta comptabilité.
        </li>
        <li>
          <strong>Tes charges réelles</strong> — Dépenses professionnelles déductibles : loyer,
          matériel, RCP, comptable, véhicule, formations.{" "}
          <strong>Hors cotisations sociales</strong> (URSSAF et CARMF sont calculées
          automatiquement). Utilisé en Régime Réel uniquement — en Micro-BNC, un abattement
          forfaitaire de 34% les remplace.
        </li>
        <li>
          <strong>Revenus complémentaires</strong> (dépliable) :
          <ul className="mt-1.5 ml-4 space-y-1.5 list-disc">
            <li>
              <em>Revenus salariés</em> — Net imposable annuel si tu cumules hôpital ou gardes
              salariées. L'abattement de 10% est appliqué automatiquement.
            </li>
            <li>
              <em>Revenus PDSA</em> — Gardes de nuit et week-end régulées par l'ARS. Exonérés
              d'impôt sur le revenu (art. 151 ter CGI), mais restent soumis aux cotisations
              sociales.
            </li>
          </ul>
        </li>
      </ul>
    ),
  },
  {
    number: 3,
    title: "Ta situation fiscale",
    icon: <Heart className="h-4 w-4 text-white" />,
    color: "from-violet-500 to-purple-500",
    content: (
      <ul className="space-y-2.5">
        <li>
          <strong>Situation familiale</strong> — Célibataire, marié/pacsé, veuf ou parent isolé.
          Détermine ton nombre de parts fiscales et donc ton quotient familial.
        </li>
        <li>
          <strong>Enfants à charge</strong> — Chaque enfant augmente ton quotient familial.
          Demi-parts possibles (ex : garde alternée = 0.5 part).
        </li>
        <li>
          <strong>Revenus du conjoint</strong> (apparaît si marié/pacsé) — Net imposable annuel +
          type de revenu (salarié, libéral micro, libéral réel, autre). Impact direct sur le taux
          marginal d'imposition du foyer.
        </li>
      </ul>
    ),
  },
  {
    number: 4,
    title: "Paramètres de calcul",
    icon: <MapPin className="h-4 w-4 text-white" />,
    color: "from-amber-500 to-orange-500",
    content: (
      <ul className="space-y-2.5">
        <li>
          <strong>Année</strong> — Détermine les barèmes IR appliqués (2025 ou 2026).
        </li>
        <li>
          <strong>Lieu d'exercice</strong> — Métropole ou DOM-TOM. Les territoires ultramarins
          bénéficient d'un abattement automatique sur l'IR (30% Guadeloupe/Martinique/Réunion,
          40% Guyane/Mayotte).
        </li>
        <li>
          <strong>Secteur conventionnel</strong> — Secteur 1 (tarifs Sécu, déductions
          supplémentaires : 2% + 3% + Groupe III) ou Secteur 2 (honoraires libres, pas de
          déductions S1).
        </li>
        <li>
          <strong>Régime social</strong> — Auto (recommandé, le simulateur choisit selon ton CA),
          RSPM (simplifié, {"<"} 38 000 €) ou PAMC (classique).
        </li>
      </ul>
    ),
  },
  {
    number: 5,
    title: "Options avancées — Pour affiner",
    icon: <Settings2 className="h-4 w-4 text-white" />,
    color: "from-cyan-500 to-teal-500",
    content: (
      <div className="space-y-4">
        {/* CARMF */}
        <div>
          <p className="font-medium text-foreground mb-1.5">Retraite & CARMF</p>
          <ul className="space-y-2">
            <li>
              <strong>Affilié (régime normal)</strong> — C'est le cas le plus courant. Tu paies
              l'ensemble des cotisations CARMF : retraite de base, retraite complémentaire, ASV
              (allocations supplémentaires vieillesse) et invalidité-décès (RID).
            </li>
            <li>
              <strong>Affilié {"<"} 2 ans, {"<"} 40 ans</strong> — Si tu viens de t'installer et
              que tu as moins de 40 ans, tu es <em>exonéré de la cotisation complémentaire</em>{" "}
              pendant tes 2 premières années. Tes cotisations sont donc réduites (montants
              forfaitaires). C'est un vrai coup de pouce au démarrage.
            </li>
            <li>
              <strong>Dispensé</strong> — Sur demande à la CARMF, généralement pour des revenus
              faibles (démarche non automatique, à effectuer auprès de la caisse).
            </li>
            <li>
              <strong>Taux RID</strong> — L'invalidité-décès peut être cotisée à 25% (couverture
              minimale) ou 100% (couverture complète). Par défaut, le simulateur utilise 100%.
            </li>
          </ul>
        </div>

        {/* Déductions S1 */}
        <div>
          <p className="font-medium text-foreground mb-1.5">Déductions Secteur 1</p>
          <ul className="space-y-2">
            <li>
              <strong>Forfait 2%</strong> — Frais de représentation, réception et prospection
              déduits automatiquement de tes honoraires, sans justificatif.{" "}
              <em>Secteur 1 uniquement.</em>
            </li>
            <li>
              <strong>Déduction 3% conventionnelle</strong> — Un abattement supplémentaire sur tes
              honoraires conventionnés, plafonné par la Sécu. <em>Secteur 1 uniquement.</em>
            </li>
            <li>
              <strong>Barème Groupe III</strong> — Une déduction fixe calculée selon ta tranche de
              revenus (de 770 € à 3 050 €), en plus des 2% et 3%.{" "}
              <em>Secteur 1 uniquement.</em>
            </li>
            <li>
              <strong>Ratio honoraires non conventionnés</strong> — Si une partie de tes
              honoraires est hors convention, les déductions S1 sont réduites
              proportionnellement.
            </li>
          </ul>
        </div>

        {/* Cotisations volontaires */}
        <div>
          <p className="font-medium text-foreground mb-1.5">Cotisations volontaires</p>
          <ul className="space-y-2">
            <li>
              <strong>PER (Plan d'Épargne Retraite)</strong> — Tes versements sont déductibles de
              ton revenu imposable. Fonctionne en <em>Micro-BNC et en Réel</em>.
            </li>
            <li>
              <strong>Madelin (prévoyance/retraite)</strong> — Cotisations complémentaires
              déductibles de ton bénéfice. <em>Régime Réel uniquement.</em>
            </li>
            <li>
              <strong>Chèques-vacances ANCV</strong> — Déductibles de ton BNC dans la limite
              d'1 SMIC mensuel par an : <strong>{getDeclarationParams(2024).plafondChequesVacances.toLocaleString('fr-FR')} € en 2024</strong>, <strong>{getDeclarationParams(2025).plafondChequesVacances.toLocaleString('fr-FR')} € officiel en 2025</strong>,
              <strong> {getDeclarationParams(2026).plafondChequesVacances.toLocaleString('fr-FR')} € projeté en 2026</strong> (à confirmer après publication du SMIC 2026).
              <em>Régime Réel uniquement</em> (sans effet en Micro-BNC).
            </li>
          </ul>
        </div>

        {/* Zones & foncier */}
        <div>
          <p className="font-medium text-foreground mb-1.5">Fiscalité immobilière & zones</p>
          <ul className="space-y-2">
            <li>
              <strong>Zones exonérées (ZFU-TE / ZFRR)</strong> — Si tu exerces dans une zone
              prioritaire, une partie de ton bénéfice est exonérée d'impôt sur 8 ans (100 % les
              5 premières années). Dégressivité différente selon la zone : <strong>ZFU-TE</strong>
              → 60 % / 40 % / 20 % (clos au 31.12.2025) ; <strong>ZFRR</strong> → 75 % / 50 % / 25 %.
              Plafond commun : 50 000 € de bénéfice exonéré/an.
            </li>
            <li>
              <strong>Revenus fonciers</strong> — Si tu as des revenus locatifs : micro-foncier
              (abattement 30%) ou régime réel (avec possibilité de déduire un déficit foncier
              jusqu'à −10 700 €/an de ton revenu global).
            </li>
          </ul>
        </div>

        {/* Crédits d'impôt */}
        <div>
          <p className="font-medium text-foreground mb-1.5">Crédits d'impôt</p>
          <ul className="space-y-2">
            <li>
              <strong>Formation dirigeant</strong> — Heures de formation × SMIC horaire, plafonné
              à 40h (soit environ 475 €). Réduit directement ton impôt.
            </li>
            <li>
              <strong>Emploi à domicile</strong> — 50% des dépenses (ménage, garde, jardinage…),
              plafond de 12 000 à 15 000 €.
            </li>
            <li>
              <strong>Garde d'enfant {"<"} 6 ans (hors domicile)</strong> — 50% des frais de
              crèche ou assistante maternelle, plafond de 3 500 € par enfant.
            </li>
            <li>
              <strong>Autres crédits</strong> — Un champ libre pour tout autre crédit d'impôt
              dont tu bénéficies.
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    number: 6,
    title: "Comprendre les résultats",
    icon: <BarChart3 className="h-4 w-4 text-white" />,
    color: "from-rose-500 to-pink-500",
    content: (
      <ul className="space-y-2.5">
        <li>
          <strong>Les 2 cartes</strong> — Micro-BNC (abattement 34%) vs Régime Réel (charges
          réelles + optimisations). Chacune affiche un mini-donut et ton Super-Net mensuel et
          annuel.
        </li>
        <li>
          <strong>Le badge « Recommandé »</strong> — Indique le régime qui te laisse le plus en
          poche.
        </li>
        <li>
          <strong>Le Super-Net</strong> — Le montant final après TOUT : charges, cotisations,
          impôt. C'est LE chiffre qui compte.
        </li>
        <li>
          <strong>« Approfondir »</strong> — Détails ligne par ligne : donut de répartition,
          comparaison des deux régimes, modalités de prélèvement (source, acomptes,
          régularisation).
        </li>
      </ul>
    ),
  },
  {
    number: 7,
    title: "Comment est calculé ton Super-Net ?",
    icon: <ArrowDownCircle className="h-4 w-4 text-white" />,
    color: "from-indigo-500 to-blue-500",
    content: (
      <div className="space-y-3">
        <p>
          Le Super-Net, c'est ce qu'il te reste <strong>vraiment</strong> en poche après tout. Voici
          le calcul, étape par étape :
        </p>
        <ol className="space-y-2.5 list-decimal list-inside">
          <li>
            <strong>Tes revenus libéraux</strong> — Le total de tout ce que tu as encaissé dans
            l'année (honoraires, actes, dépassements).
          </li>
          <li>
            <strong>− Tes charges</strong> — En <em>Régime Réel</em>, on soustrait tes dépenses
            professionnelles réelles (loyer, matériel, véhicule…). En <em>Micro-BNC</em>, l'État
            applique un abattement forfaitaire de 34%. → Ça donne ton <strong>bénéfice</strong>.
          </li>
          <li>
            <strong>− Cotisations sociales</strong> — URSSAF (maladie, allocations familiales,
            retraite de base, CSG-CRDS) + CARMF (retraite complémentaire, invalidité-décès, ASV).
            Le simulateur les calcule automatiquement selon tes revenus et ta situation CARMF
            (voir section 5).
          </li>
          <li>
            <strong>− Déductions fiscales</strong> — Si tu es en Secteur 1 : forfait 2%, déduction
            3%, barème Groupe III. Puis PER, Madelin, chèques-vacances, zones exonérées… → Ça
            donne ton <strong>revenu imposable libéral</strong>.
          </li>
          <li>
            <strong>+ Autres revenus du foyer</strong> — On ajoute les salaires (après abattement
            10%), les revenus du conjoint, les revenus fonciers. → Ça donne le{" "}
            <strong>revenu fiscal du foyer</strong>.
          </li>
          <li>
            <strong>÷ Parts fiscales</strong> — On divise par ton nombre de parts (selon ta
            situation familiale et tes enfants) pour obtenir le quotient familial, puis on applique
            le barème progressif (11%, 30%, 41%, 45%).
          </li>
          <li>
            <strong>− Crédits d'impôt</strong> — Formation dirigeant, emploi à domicile, garde
            d'enfant… Ils viennent réduire directement ton impôt. → Ça donne ton{" "}
            <strong>impôt final</strong>.
          </li>
          <li>
            <strong>= Super-Net</strong> — Revenus − Charges − Cotisations − Impôt ={" "}
            <strong>ce qu'il te reste vraiment</strong>.
          </li>
        </ol>
        <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/30 text-xs">
          <strong>Micro vs Réel en bref :</strong> En Micro-BNC, tes charges sont remplacées par un
          abattement de 34% — c'est plus simple mais souvent moins avantageux si tes charges
          réelles dépassent ce seuil. Le simulateur compare les deux pour toi.
        </div>
      </div>
    ),
  },
  {
    number: 8,
    title: "Conseils personnalisés & Profils types",
    icon: <Lightbulb className="h-4 w-4 text-white" />,
    color: "from-emerald-500 to-green-500",
    content: (
      <ul className="space-y-2.5">
        <li>
          <strong>4 piliers</strong> — Budget, Sécurité, Investissement, Optimisation : des
          recommandations concrètes basées sur TON Super-Net.
        </li>
        <li>
          <strong>La règle 50/30/20</strong> — Appliquée à ta situation : combien consacrer aux
          besoins, aux envies et à l'épargne.
        </li>
        <li>
          <strong>Estimation charges sociales</strong> — Cotisations URSSAF, CARMF et CFE
          détaillées pour anticiper ta trésorerie.
        </li>
        <li>
          <strong>Profils types</strong> — Pas envie de tout remplir ? Clique sur un profil type
          pour pré-remplir le formulaire avec des données réalistes (interne, remplaçant, installé,
          spécialiste…). Tu peux ensuite ajuster les chiffres avant de lancer la simulation.
        </li>
      </ul>
    ),
  },
];

interface SimulateurGuideProps {
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function SimulateurGuide({ variant = "outline", className = "" }: SimulateurGuideProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <BookOpen className="mr-2 h-4 w-4" />
          Mode d'emploi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-primary">
                Guide du Simulateur Super-Net
              </DialogTitle>
              <DialogDescription>
                Comment l'utiliser et comprendre tes résultats
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-4 py-2">
            {sections.map((section) => (
              <div
                key={section.number}
                className="rounded-xl border border-border/50 bg-muted/30 p-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center shadow-md`}
                  >
                    {section.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground mb-2">
                      {section.number}. {section.title}
                    </h3>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div className="rounded-xl bg-muted/20 border border-border/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Ce simulateur fournit des estimations basées sur les barèmes en vigueur. Il ne
                remplace pas l'avis d'un expert-comptable.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
