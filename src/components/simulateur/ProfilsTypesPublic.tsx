import { useState } from "react";
import { Users, ChevronDown, Stethoscope, UserCheck, Briefcase, Star, Baby, Building2, Heart, TrendingUp, Activity } from "lucide-react";
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

const PUBLIC_PROFILES: PublicProfil[] = [
  {
    id: "interne-mixte",
    nom: "Interne remplaçant",
    description: "Internat + gardes ponctuelles",
    icon: Stethoscope,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 25000,
      chargesHorsCotisations: 2500, revenusSalaries: 28000,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      secteurConventionnel: 'secteur_1', regimeSocial: 'rspm',
    }
  },
  {
    id: "remplacant-s1",
    nom: "Remplaçant S1",
    description: "Activité soutenue, secteur 1",
    icon: UserCheck,
    populaire: true,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 120000,
      chargesHorsCotisations: 21600, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'celibataire', enfants: 0,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
    }
  },
  {
    id: "remplacant-mixte",
    nom: "Remplaçant mixte",
    description: "Libéral + hôpital, jeune parent",
    icon: Briefcase,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 90000,
      chargesHorsCotisations: 16200, revenusSalaries: 45000,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 1,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
    }
  },
  {
    id: "remplacant-famille",
    nom: "Remplaçant famille",
    description: "Haute activité, conjoint salarié",
    icon: Users,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 140000,
      chargesHorsCotisations: 25200, revenusSalaries: 0,
      revenusConjoint: 35000, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 2,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
    }
  },
  {
    id: "installe-generaliste",
    nom: "Installé généraliste",
    description: "Cabinet établi, charges élevées",
    icon: Building2,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 160000,
      chargesHorsCotisations: 48000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 2,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
    }
  },
  {
    id: "specialiste-s1",
    nom: "Spécialiste S1",
    description: "MEP conventionné, famille nombreuse",
    icon: Heart,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 220000,
      chargesHorsCotisations: 77000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 3,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
    }
  },
  {
    id: "specialiste-s2",
    nom: "Spécialiste S2",
    description: "Honoraires libres, haut de gamme",
    icon: TrendingUp,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 280000,
      chargesHorsCotisations: 98000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'marie_pacse', enfants: 2,
      secteurConventionnel: 'secteur_2', regimeSocial: 'pamc',
    }
  },
  {
    id: "parent-isole",
    nom: "Parent isolé",
    description: "Demi-part supplémentaire",
    icon: Activity,
    data: {
      periode: 'annuel', annee: 2026, recettesBrutes: 100000,
      chargesHorsCotisations: 18000, revenusSalaries: 0,
      revenusConjoint: 0, revenusExoneresPdsa: 0, lieuExercice: 'metropole',
      situationFamiliale: 'parent_isole', enfants: 1,
      secteurConventionnel: 'secteur_1', regimeSocial: 'pamc',
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
