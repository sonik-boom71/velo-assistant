import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // asphalt-grey base — the workshop / road surface
        asphalt: {
          950: "#0c0e0f",
          900: "#131618",
          850: "#181c1f",
          800: "#1f2427",
          700: "#2a3034",
          600: "#3a4146",
          500: "#525a60",
          400: "#727b82",
          300: "#9aa3a9",
          200: "#c2c9cd",
          100: "#e6e9eb",
        },
        // signal lime — reflective gear; only for active states / accents / progress
        lime: {
          DEFAULT: "#c2f000",
          dim: "#9bc000",
        },
        // wear indicator traffic colours
        wear: {
          ok: "#54c47a",
          warn: "#e8c14a",
          over: "#ef5350",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0",
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
        lg: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
