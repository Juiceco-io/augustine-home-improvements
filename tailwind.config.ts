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
        // Logo-green palette — replaces old brick-red aliases
        "brand-red": "#4b776b",      // was brick-red, now logo green (primary)
        "brand-brick": "#365c52",    // was dark brick, now logo green (dark)
        "brand-dark": "#26463f",     // was darkest brick, now logo green (deep)
        "brand-cream": "#f7fbf8",    // updated to match CSS --brand-cream
        "brand-charcoal": "#1c2a26", // updated to match CSS --brand-charcoal
        // Explicit green aliases for new code
        "brand-primary": "#4b776b",
        "brand-primary-dark": "#365c52",
        "brand-primary-deep": "#26463f",
        "brand-mist": "#edf5f1",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
