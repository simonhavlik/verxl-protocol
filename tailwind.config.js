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
        verxl: {
          dark: "#080c14",
          card: "#0d1322",
          cardHover: "#121a2e",
          border: "#1e293b",
          borderLight: "#334155",
          accent: "#3b82f6",
          accentGlow: "rgba(59, 130, 246, 0.15)",
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
