import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
        },
        content: {
          DEFAULT: "#0f172a",
          muted: "#64748b",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          light: "#818cf8",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
        },
        border: {
          DEFAULT: "#e2e8f0",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(99, 102, 241, 0.5)",
        "glow-lg": "0 0 60px -10px rgba(139, 92, 246, 0.6)",
        card: "0 10px 30px -12px rgba(15, 23, 42, 0.15)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.4)" },
          "70%": { boxShadow: "0 0 0 10px rgba(99, 102, 241, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        blob: "blob 8s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
