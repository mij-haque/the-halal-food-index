import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // HFI brand tokens (design/design-system.html).
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
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
        body: ["var(--font-instrument)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
