import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/client": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
      "react/jsx-dev-runtime": "preact/jsx-runtime",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        chatDir: path.resolve(__dirname, "chat/index.html"),
        whitepaperDir: path.resolve(__dirname, "whitepaper/index.html"),
        whitepaperFile: path.resolve(__dirname, "whitepaper.html"),
        visionDir: path.resolve(__dirname, "vision/index.html"),
        terminalDir: path.resolve(__dirname, "terminal/index.html"),
        registryDir: path.resolve(__dirname, "registry/index.html"),
        oracleDir: path.resolve(__dirname, "oracle/index.html"),
        governanceDir: path.resolve(__dirname, "governance/index.html"),
        consoleDir: path.resolve(__dirname, "console/index.html"),
        privacyDir: path.resolve(__dirname, "privacy/index.html"),
        termsDir: path.resolve(__dirname, "terms/index.html"),
        legalDir: path.resolve(__dirname, "legal/index.html"),
      },
      output: {
        manualChunks: {
          vendorThree: ["three"],
          vendorIcons: ["lucide-react"],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      "/v1": {
        target: "https://verxl.com",
        changeOrigin: true,
        secure: true,
      },
      "/api": {
        target: "https://verxl.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
