/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        blue: {
          50: "#f4fbf7", 100: "#e7f8f0", 200: "#c9f0df", 300: "#a9e6ce",
          400: "#b8f6dd", 500: "#7fae9d", 600: "#5f8a7a", 700: "#48695d",
          800: "#324a42", 900: "#1e2f2a", 950: "#0f1a16",
        },
        cyan: {
          300: "#d8efe6", 400: "#cfe9df", 500: "#9fc7b9", 600: "#7aa999",
          700: "#5c8274", 800: "#3f5b51", 900: "#273b34", 950: "#14211d",
        },
        indigo: {
          300: "#c2cdc9", 400: "#a9b8b2", 500: "#8fa39b", 600: "#6f847c",
          700: "#55665f", 800: "#3d4a45", 900: "#27302d", 950: "#141a18",
        },
        verxl: {
          dark: "#080c14",
          card: "#0d1322",
          cardHover: "#121a2e",
          border: "#1e293b",
          borderLight: "#334155",
          accent: "#b8f6dd",
          accentGlow: "rgba(184, 246, 221, 0.15)",
          text: "#f8fafc",
          muted: "#94a3b8",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { opacity: 0.4 },
          "100%": { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
};
