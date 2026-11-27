import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          lime: "#ccff00",
          limeLight: "#d9ff33",
          limeDark: "#a6d200",
          black: "#0a0b0c",
          dark: "#101214",
          surface: "#16191d",
          border: "#252a31",
          muted: "#888d96",
        },
        brand: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#b9ddfd",
          300: "#7cc2fb",
          400: "#36a3f7",
          500: "#0c87eb",
          600: "#006bc9",
          700: "#0155a3",
          800: "#064886",
          900: "#0b3d6f",
          950: "#07264a",
        },
      },
      boxShadow: {
        "cyber-sm": "2px 2px 0px 0px #ccff00",
        "cyber": "4px 4px 0px 0px #ccff00",
        "cyber-lg": "6px 6px 0px 0px #ccff00",
        "cyber-white": "4px 4px 0px 0px #ffffff",
      },
    },
  },
  plugins: [],
};
export default config;
