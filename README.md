# hippodoc.fr

Site marketing public d'[Hippodoc](https://hippodoc.fr), le SaaS français de gestion administrative pour médecins remplaçants. Site **statique Astro** (52 pages) déployé sur Vercel. L'application privée vit sur app.hippodoc.fr (dépôt séparé).

## Démarrage

```bash
npm install
npm run dev        # http://localhost:4321
```

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build statique → `dist/` |
| `npm run preview` | Sert le build localement |
| `node scripts/verify-site.mjs` | Après build : crawl du sitemap + assertions SEO par page |

Avant tout push qui touche aux pages : `npm run build` puis `node scripts/verify-site.mjs`.

## Structure

```
src/
├── pages/            # Routes (Astro) — URLs publiques figées, jamais renommer
├── layouts/          # BaseLayout.astro : contrat SEO (title, description, canonique, JSON-LD)
├── content/blog/     # 38 articles Markdown — source de vérité du blog
├── components/       # Composants Astro + îlots React (simulateur, calculette, boussole)
├── lib/              # Constantes site, moteurs de calcul, plugin remark
└── data/             # Données statiques (boussole, etc.)
scripts/              # verify-site.mjs, generate-blog-content.mjs (migration, ne pas relancer)
vercel.json           # Redirections 301 (actives uniquement sur Vercel)
```

## Principes clés

- **Statique d'abord** : zéro JS client hors îlots des outils (`client:visible`), PostHog et scripts tiers. Interactions des pages statiques en CSS pur ou HTML natif (`<details>`).
- **SEO verrouillé** : URLs sans slash final, canoniques exactes, contenu français verbatim, Lighthouse ≥ 95. `verify-site.mjs` fait respecter le contrat.
- **Outils** : `/simulateur` (calcul URSSAF, branche PAMC via Edge Function Supabase), `/guide-declarations/calculette` (100 % local), `/guide-declarations` (boussole).
- **Analytics** : PostHog en proxy first-party, GA4/Meta/Crisp chargés hors fenêtre Lighthouse, gatés par le consentement cookies.

Détails complets, invariants et historique de migration : [CLAUDE.md](CLAUDE.md) et [MIGRATION.md](MIGRATION.md).
