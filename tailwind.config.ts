import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/* Ce qui reste de Tailwind depuis la phase 5d (MIGRATION.md § 9.em) : les pages
   et leurs composants sont dans la DA, sans classe utilitaire. Tailwind sert
   encore le socle (preflight), les composants partagés `src/components/ui/`
   (shadcn), les .tsx des îlots (simulateur, calculette, guide des
   déclarations : logique et habillage y sont mêlés, ils gardent des
   utilitaires), le carrousel du blog, BlogReadMore.astro, la bannière cookies
   de ThirdPartyScripts.astro et trois classes de src/pages/index.astro. D'où
   ce qui est gardé ici :
   les couleurs `hippo` et les jetons shadcn, les rayons, les deux animations de
   l'accordéon. Retirés en 5d, preuve d'inemploi à l'appui : le conteneur
   (`container`), quatorze animations et treize de leurs images clés, le plugin
   typography (`prose`), et le plugin qui exposait chaque couleur de Tailwind en
   variable CSS (263 variables dans la feuille commune, aucune lue). */

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{astro,ts,tsx,md,mdx}",
	],
	prefix: "",
	/* `.container` : plus aucun élément ne porte la classe, mais le mot revient
	   dans les sources (noms de variables), et Tailwind en tirait la règle. */
	corePlugins: { container: false },
	theme: {
		extend: {
			/* Police du site (phase 5a, MIGRATION.md § 9.ed) : Google Sans Flex sur
			   toutes les pages, par la règle `html` du socle de Tailwind. Les trois
			   @font-face (la police, et deux faces de repli à métriques ajustées :
			   400 à 599, 600 à 800) sont dans src/styles/da.css ; BaseLayout
			   précharge le woff2. Un caractère absent du fichier (flèche, coche,
			   émoji, ≈ ≠) sort dans la suite de la liste : Arial par la face de
			   repli, puis la liste de Tailwind par défaut. */
			fontFamily: {
				sans: ['"Google Sans Flex"', '"Google Sans Flex Fallback"', ...defaultTheme.fontFamily.sans],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// HippoShift custom colors
				hippo: {
					50: '#F0F7FF',
					100: '#E0EFFF',
					200: '#B3D7FF',
					300: '#80BFFF',
					400: '#4DA6FF',
					500: '#1A8CFF', // Primary blue
					600: '#006BD6', // Assombri pour WCAG AA (4.5:1 sur fond blanc)
					700: '#0059B3',
					800: '#003C80',
					900: '#001E40',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				/* Le reflet du squelette de chargement du simulateur
				   (`before:animate-[shimmer_1.5s_infinite]`, ui/skeleton.tsx) : la
				   classe arbitraire nomme ces images clés, Tailwind les émet avec elle. */
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
