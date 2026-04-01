/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#26463f",
          "green-light": "#365c52",
          "green-pale": "#4b776b",
        },
      },
    },
  },
  plugins: [],
};
