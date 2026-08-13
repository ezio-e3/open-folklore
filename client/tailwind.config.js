/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A warm, earthy palette rather than a generic SaaS blue — a small,
        // deliberate choice given the subject matter (docs/phase1-discovery.md).
        adinkra: {
          50: "#fdf6ec",
          100: "#f8e8cc",
          200: "#efcb8e",
          300: "#e3a94f",
          400: "#d68a2d",
          500: "#b56a1e",
          600: "#8f5119",
          700: "#6e3f18",
          800: "#4a2a11",
          900: "#2c190a",
        },
      },
    },
  },
  plugins: [],
};
