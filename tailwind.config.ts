import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        smoke: "#f2f2f2",
        line: "#000000",
        gray: {
          50: "#fafafa",
          100: "#f0f0f0",
          200: "#e0e0e0",
          300: "#c7c7c7",
          400: "#a0a0a0",
          500: "#757575",
          600: "#525252",
          700: "#383838",
          800: "#212121",
          900: "#101010",
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
