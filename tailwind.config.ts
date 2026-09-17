import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121417",
        paper: "#F7F8FA",
        brand: { 50: "#f3f1ff", 100: "#e8e2ff", 500: "#6246c7", 600: "#5235b5", 700: "#432b91" },
      },
      boxShadow: { card: "0 1px 2px rgba(18,20,23,.04), 0 8px 24px rgba(18,20,23,.04)" },
    },
  },
  plugins: [],
} satisfies Config;
