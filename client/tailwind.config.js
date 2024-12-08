/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
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
		  chart: {
			'1': 'hsl(var(--chart-1))',
			'2': 'hsl(var(--chart-2))',
			'3': 'hsl(var(--chart-3))',
			'4': 'hsl(var(--chart-4))',
			'5': 'hsl(var(--chart-5))'
		  },
		  purple: {
			DEFAULT: 'hsl(var(--purple))',
			foreground: 'hsl(var(--purple-foreground))'
		  },
		  pink: {
			DEFAULT: 'hsl(var(--pink))',
			foreground: 'hsl(var(--pink-foreground))'
		  },
		},
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		fontFamily: {
			poppins: ["Poppins", "sans-serif"],
			spc: ["Space Grotesk", "sans-serif"],
			proxima: ["Proxima", "sans-serif"],
			proxima_semibold: ["Proxima-SemiBold", "sans-serif"],
			proxima_bold: ["Proxima-Bold", "sans-serif"],
			recoleta: ["Recoleta", "sans-serif"],
			recoleta_bold: ["Recoleta-Bold", "sans-serif"],
			recoleta_black: ["Recoleta-Black", "sans-serif"],
			recoleta_semibold: ["Recoleta-SemiBold", "sans-serif"]
		},
		backgroundImage: {
		  'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
		  'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
		  'gradient-blue': 'linear-gradient(to right, var(--blue), var(--blue-dark))',
		  'gradient-purple-pink': 'linear-gradient(to right, var(--purple), var(--pink))',
		}
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  