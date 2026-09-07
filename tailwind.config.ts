import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        paper: "#ffffff",
        smoke: "#f4f4f2",
        line: "#1a1a1a",
        gray: {
          50: "#fafafa",
          100: "#f0f0ef",
          200: "#e2e2e0",
          300: "#c9c9c6",
          400: "#a3a3a0",
          500: "#7a7a76",
          600: "#57574f",
          700: "#3b3b36",
          800: "#242420",
          900: "#121210",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Helvetica Neue", "Arial", "sans-serif"],
        nav: ["var(--font-nav)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
