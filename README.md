# hippodoc.fr

Public marketing site for [Hippodoc](https://hippodoc.fr), a French SaaS that handles admin work for locum doctors (médecins remplaçants). **Static Astro** site (52 pages) deployed on Vercel. The private app lives on app.hippodoc.fr (separate repo).

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Static build → `dist/` |
| `npm run preview` | Serve the build locally |
| `node scripts/verify-site.mjs` | After build: crawls the sitemap, asserts SEO invariants per page |

Before pushing anything that touches pages: `npm run build` then `node scripts/verify-site.mjs`.

## Structure

```
src/
├── pages/            # Routes (Astro) — public URLs are frozen, never rename
├── layouts/          # BaseLayout.astro: SEO contract (title, description, canonical, JSON-LD)
├── content/blog/     # 38 Markdown articles — source of truth for the blog
├── components/       # Astro components + React islands (simulator, calculator, wizard)
├── lib/              # Site constants, calculation engines, remark plugin
└── data/             # Static data (wizard content, etc.)
scripts/              # verify-site.mjs, generate-blog-content.mjs (one-time migration, do not re-run)
vercel.json           # 301 redirects (only active on Vercel)
```

## Key principles

- **Static first**: zero client-side JS except the tool islands (`client:visible`), PostHog and third-party scripts. Static page interactions are CSS-only or native HTML (`<details>`).
- **SEO locked down**: no trailing slashes, exact canonicals, French content kept verbatim, Lighthouse ≥ 95. `verify-site.mjs` enforces the contract.
- **Tools**: `/simulateur` (URSSAF simulator; PAMC branch calls a public Supabase Edge Function), `/guide-declarations/calculette` (fully local), `/guide-declarations` (declaration wizard).
- **Analytics**: PostHog behind a first-party proxy; GA4/Meta/Crisp loaded outside the Lighthouse window and gated by cookie consent.

Full details, invariants and migration history: [CLAUDE.md](CLAUDE.md) and [MIGRATION.md](MIGRATION.md).
