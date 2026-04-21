import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config & { safelist?: string[] } = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Division-tinted hover states (used dynamically via useDivisionTheme)
    'hover:border-idm-male/20', 'hover:border-idm-female/20',
    'hover:bg-idm-male/5', 'hover:bg-idm-female/5',
    // Active tab colors (conditional but need to be in CSS output)
    'data-[state=active]:text-idm-male', 'data-[state=active]:text-idm-female',
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 4px)',
                        sm: 'calc(var(--radius) - 6px)'
                },
                keyframes: {
                        'spin-slow': {
                                from: { transform: 'rotate(0deg)' },
                                to: { transform: 'rotate(360deg)' },
                        },
                        'spin-slower': {
                                from: { transform: 'rotate(0deg)' },
                                to: { transform: 'rotate(360deg)' },
                        },
                        'pulse-scale': {
                                '0%, 100%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.2)' },
                        },
                },
                animation: {
                        'spin-slow': 'spin-slow 1s linear infinite',
                        'spin-slower': 'spin-slower 1.5s linear infinite',
                        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
