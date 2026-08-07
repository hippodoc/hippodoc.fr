import type { Config } from "tailwindcss";
// @ts-ignore
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{astro,ts,tsx,md,mdx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
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
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'heartbeat': {
					'0%, 100%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.1)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.1)' },
					'56%': { transform: 'scale(1)' },
				},
				'gentle-bounce': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-2px)' },
				},
				'gradient-xy': {
					'0%, 100%': {
						'background-position': '0% 50%',
						'background-size': '400% 400%'
					},
					'50%': {
						'background-position': '100% 50%',
						'background-size': '400% 400%'
					}
				},
				'spin-once': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(26, 140, 255, 0.4)' },
					'50%': { boxShadow: '0 0 40px rgba(26, 140, 255, 0.8)' }
				},
				'slideInLeft': {
					from: { opacity: '0', transform: 'translateX(-20px)' },
					to: { opacity: '1', transform: 'translateX(0)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},
				'pulseRing': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.5', transform: 'scale(1.05)' }
				},
				'bounceSubtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'shakeMicro': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-2px)' },
					'75%': { transform: 'translateX(2px)' }
				},
				'marquee': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'heartbeat': 'heartbeat 2s ease-in-out infinite',
				'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
				'gradient-xy': 'gradient-xy 4s ease infinite',
				'spin-once': 'spin-once 0.6s ease-out',
				'glow-pulse': 'glow-pulse 1.5s ease-in-out infinite',
				'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
				'shimmer': 'shimmer 2s linear infinite',
				'pulse-ring': 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce-subtle': 'bounceSubtle 0.6s ease-out',
				'shake-micro': 'shakeMicro 0.5s ease-in-out',
				'marquee': 'marquee 25s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography"), addVariablesForColors],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--hippo-500).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
