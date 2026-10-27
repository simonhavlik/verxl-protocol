import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        whitepaperDir: path.resolve(__dirname, "whitepaper/index.html"),
        whitepaperFile: path.resolve(__dirname, "whitepaper.html"),
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
