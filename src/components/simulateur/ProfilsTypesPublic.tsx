import { useState } from "react";
import { Users, ChevronDown, Stethoscope, UserCheck, Briefcase, Star, Baby, Building2, TrendingUp, Car, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SimulateurFormData } from "./simulateurSchema";
import type { LieuExercice } from "@/lib/dom-tom";

interface PublicProfil {
  id: string;
  nom: string;
  description: string;
  icon: typeof Stethoscope;
  populaire?: boolean;
  /**
   * Un profil type ne renseigne QUE les champs qui le caractérisent (une douzaine
   * sur vingt-six) : le type doit donc être partiel. Les champs absents sont
   * complétés par SIMULATEUR_DEFAULTS au moment du `reset()` — voir
   * SimulateurForm.tsx. Le typer comme complet produisait 8 erreurs et laissait
   * croire, à tort, que le profil remplissait tout le formulaire.
   */
  data: Partial<Omit<SimulateurFormData, 'regimeFiscal'>> & {
    regimeSocial?: 'auto' | 'rspm' | 'pamc';
    lieuExercice?: LieuExercice;
  };
}

/**
 * Profils types (MIGRATION.md § 9.gf), dans l'ordre d'un parcours : interne, débuts, remplaçant
 * régulier, installé. Calés sur les simulations réelles (table Supabase `simulateur_public_events`,
 * 563 visiteurs, février à novembre 2026) : un profil par situation que le simulateur sait montrer
 * (RSPM, première année, micro ou réel selon les charges, salaire en plus, installé, secteur 2).
 * Tous en mode Auto : le régime social se choisit comme pour une saisie libre. Les identifiants des
 * profils gardés ne changent pas (suivi `profil_type_id`) ; un nouveau profil a un nouvel
 * identifiant, un profil retiré ne se réutilise pas.
 */
const PUBLIC_PROFILES: PublicProfil[] = [
  {
    id: "interne-mixte",
    nom: "Interne qui remplace",
    description: "Quelques remplacements en plus de l'internat",
    icon: Stethoscope,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 12500,
      chargesHorsCotisations: 1300, revenusSalaries: 28000,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      typeExercice: 'remplacant', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
      debutActivite: 'premiere',
    }
  },
  {
    id: "remplacant-debut",
    nom: "Jeune remplaçant",
    description: "Première année en libéral",
    icon: CalendarClock,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 40000,
      chargesHorsCotisations: 2000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      typeExercice: 'remplacant', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
      debutActivite: 'premiere',
    }
  },
  {
    id: "remplacant-s1",
    nom: "Remplaçant régulier",
    description: "Toute l'année, peu de frais",
    icon: UserCheck,
    populaire: true,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 70000,
      chargesHorsCotisations: 5000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      typeExercice: 'remplacant', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
    }
  },
  {
    id: "remplacant-deplacements",
    nom: "Remplaçant qui roule beaucoup",
    description: "Trajets et nuits d'hôtel : des frais élevés",
    icon: Car,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 60000,
      chargesHorsCotisations: 15000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      typeExercice: 'remplacant', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
    }
  },
  {
    id: "remplacant-mixte",
    nom: "Remplaçant et salarié",
    description: "Remplacements et poste salarié",
    icon: Briefcase,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 40000,
      chargesHorsCotisations: 2500, revenusSalaries: 30000,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      typeExercice: 'remplacant', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
    }
  },
  {
    id: "installe-generaliste",
    nom: "Installé généraliste",
    description: "Cabinet établi, secteur\u00a01",
    icon: Building2,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 160000,
      chargesHorsCotisations: 48000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 2,
      typeExercice: 'installe', secteurConventionnel: 'secteur_1', regimeSocial: 'auto',
    }
  },
  {
    id: "specialiste-s2",
    nom: "Spécialiste secteur\u00a02",
    description: "Honoraires libres, cabinet établi",
    icon: TrendingUp,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 280000,
      chargesHorsCotisations: 98000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 2,
      typeExercice: 'installe', secteurConventionnel: 'secteur_2', regimeSocial: 'auto',
    }
  },
];

function PublicProfilBadges({ profil }: { profil: PublicProfil }) {
  const badges = [];

  if (profil.data.revenusSalaries && profil.data.revenusSalaries > 0) {
    badges.push(
      <Badge key="mixte" variant="secondary" className="sim-puce neutre gap-1">
        <Briefcase className="h-2.5 w-2.5" />
        Mixte
      </Badge>
    );
  }

  if (profil.data.debutActivite === 'premiere') {
    badges.push(
      <Badge key="debut" variant="secondary" className="sim-puce neutre gap-1">
        <CalendarClock className="h-2.5 w-2.5" />
        1re année
      </Badge>
    );
  }

  if ((profil.data.enfants ?? 0) > 0) {
    badges.push(
      <Badge key="enfants" variant="secondary" className="sim-puce neutre gap-1">
        <Baby className="h-2.5 w-2.5" />
        {profil.data.enfants} enfant{(profil.data.enfants ?? 0) > 1 ? 's' : ''}
      </Badge>
    );
  }

  if (profil.data.revenusConjoint && profil.data.revenusConjoint > 0) {
    badges.push(
      <Badge key="conjoint" variant="secondary" className="sim-puce neutre gap-1">
        <Users className="h-2.5 w-2.5" />
        Conjoint
      </Badge>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {badges}
    </div>
  );
}

interface ProfilsTypesPublicProps {
  onSelectProfil: (data: Partial<Omit<SimulateurFormData, 'regimeFiscal'>>, profilId?: string) => void;
}

export function ProfilsTypesPublic({ onSelectProfil }: ProfilsTypesPublicProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="sim-profils-tete flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="sim-rond">
              <Users className="h-4 w-4" />
            </div>
            <span className="sim-profils-titre">
              Partir d'un profil type
            </span>
          </div>
          <ChevronDown
            className={`sim-chevron h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {isOpen && (
            <div
              className="sim-profils grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3"
            >
              {PUBLIC_PROFILES.map((profil) => {
                const Icon = profil.icon;
                return (
                  <button
                    key={profil.id}
                    onClick={() => onSelectProfil(profil.data, profil.id)}
                    className="sim-profil relative text-left"
                  >
                    {profil.populaire && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="sim-puce encre">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Populaire
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5">
                      <div className="sim-rond flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="sim-profil-nom">
                          {profil.nom}
                        </p>
                        <p className="sim-profil-desc">
                          {profil.description}
                        </p>
                        <PublicProfilBadges profil={profil} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CollapsibleContent>
    </Collapsible>
  );
}
