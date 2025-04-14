import type { Config } from "tailwindcss";
import clipPath from 'tailwind-clip-path';
import tailwindAnimate from "tailwindcss-animate"

export default {
    darkMode: ["class"],
    content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
  	extend: {
  		clipPath: {
  			'angled-clip': 'polygon(0 0, 0 calc(100% - 20%), 100% 100%, 100% 0)',
  			'framed-drop-path': 'path("M72.6917 221.045L72.6912 221.045C68.38 218.622 63.9385 215.558 59.3299 211.792L59.3286 211.791C55.9093 209.017 52.3918 205.844 48.7762 202.279L48.7761 202.279L0.680643 154.882L59.3956 85.3157L59.3957 85.3156L69.6967 73.1034L69.6968 73.1033L105.05 31.2115L105.051 31.2106C130.036 1.46035 160.25 -4.38947 186.208 3.9775C199.269 8.19546 211.358 15.9831 221.261 26.1596C231.186 36.3656 238.88 48.9227 243.114 62.6397L243.114 62.6398C252.138 91.8401 245.384 126.604 210.961 155.363L211.282 155.747L210.961 155.363L170.089 189.516C146.035 209.6 126.223 224.113 107.368 227.674C96.2445 229.773 84.994 227.981 72.6917 221.045Z")',
  			'evaluation-methods-path': 'path("M1178.02 266L234.736 225.59C108.902 225.601 14.3527 147.309 0 38.8604V33.6182C0 15.0562 15.1023 0 33.7321 0H1178.02C1199.55 0 1217 17.397 1217 38.8604V227.14C1217 248.603 1199.55 266 1178.02 266Z")'
  		},
  		animation: {
  			'spin-slow': 'spin 100s linear infinite'
  		},
  		keyframes: {
  			dash: {
  				to: {
  					'stroke-dashoffset': '0'
  				}
  			}
  		},
  		colors: {
  			primary: {
  				DEFAULT: '#0D3151',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: '#8BC53F',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			tertiary: '#659CCD',
  			section: '#F2F4F7',
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
  		fontFamily: {
  			primary: 'PingARLT'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [clipPath, tailwindAnimate],
} satisfies Config;
