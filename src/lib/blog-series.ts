/** Généré depuis src/data/blogArticles.ts (SPA source) — ne pas éditer à la main. */
export interface BlogSeries {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  totalEpisodes: number | null;
}

export const blogSeries: BlogSeries[] = [
  {
    "id": "fiche-pratique",
    "name": "Fiches Pratiques",
    "description": "Les essentiels pour débuter sereinement tes remplacements",
    "color": "from-blue-700 to-cyan-700",
    "icon": "FileCheck",
    "totalEpisodes": 8
  },
  {
    "id": "fiche-fiscalite",
    "name": "Fiches Fiscalité",
    "description": "Tout comprendre sur la fiscalité du médecin remplaçant",
    "color": "from-purple-700 to-pink-700",
    "icon": "Calculator",
    "totalEpisodes": 9
  },
  {
    "id": "divers",
    "name": "Guides & Conseils",
    "description": "Salariat, rémunérations et types d'exercices",
    "color": "from-orange-700 to-red-700",
    "icon": "Lightbulb",
    "totalEpisodes": null
  }
];
