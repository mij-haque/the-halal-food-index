import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // HFI brand tokens (design/design-system.html). The unprefixed
        // tokens below are the retired navy/gold brand: do not extend them.
        hfi: {
          bg: "#FCFCFC",
          band: "#FFFFFF",
          // surface/border shift slightly inside .hfi-band sections (see site.css)
          surface: "var(--hfi-surface, #FFFFFF)",
          hair: "#E4E4E4",
          border: "var(--hfi-border, #E9E9E9)",
          divider: "#F1F1F1",
          ink: "#0F0F0F",
          t2: "#51514E",
          t3: "#8C8C89",
          pill: "#EFEFEF",
          green: "#0B8F5A",
          "green-bg": "#E4F4EC",
          orn: "#0B6B45",
          "orn-dark": "#084F33",
          brass: "#B8924E",
          amber: "#B06005",
          "amber-bg": "#FBF0E0",
          red: "#C02929",
          "red-bg": "#FAEAEA",
          link: "#1F56BA",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: "hsl(var(--navy))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-instrument)", "system-ui", "-apple-system", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
