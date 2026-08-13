/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Organic" design system, from the Claude Design mockup
        // ("OpenFolklore Landing.dc.html") — replaces the original placeholder
        // palette (docs/phase1-discovery.md) now that a real design exists.
        // Key name kept as "adinkra" so every page already using bg-adinkra-*/
        // text-adinkra-* repaints with the real palette with zero per-file
        // edits (docs/phase13-future-evolution.md — full redesign is a
        // separate, later pass; this project-wide token swap is not).
        adinkra: {
          50: "#fbf6ec",
          100: "#fff2eb",
          200: "#ffe1d0",
          300: "#ffc6a5",
          400: "#f6a06b",
          500: "#d67f48",
          600: "#b2622d",
          700: "#8c491a",
          800: "#643312",
          900: "#402310",
        },
        // Organic's secondary accent (olive green) — used on Landing for the
        // community CTA band and a few tags, matching the mockup exactly.
        accent2: {
          100: "#f0fae1",
          200: "#e1eecc",
          300: "#ccdbb2",
          400: "#aebf92",
          500: "#8fa073",
          600: "#728157",
          700: "#56633f",
          800: "#3d472b",
          900: "#272e1b",
        },
        organicNeutral: {
          100: "#f9f4ed",
          200: "#eee7db",
          300: "#dcd3c4",
          400: "#c0b6a5",
          500: "#a19786",
          600: "#82796a",
          700: "#645c50",
          800: "#474238",
          900: "#2e2b25",
        },
      },
      fontFamily: {
        heading: ['"Caprasimo"', "system-ui", "sans-serif"],
        body: ['"Figtree"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "organic-sm": "8px",
        "organic-md": "16px",
        "organic-lg": "28px",
      },
    },
  },
  plugins: [],
};
