import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    // Plugin dinamis hanya dijalankan di development mode dan jika REPL_ID ada
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID
      ? [import("@replit/vite-plugin-cartographer").then((m) => m.cartographer())]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"), // Root folder untuk proyek
  build: {
    outDir: path.resolve(__dirname, "dist"), // Output build ke folder dist/
    emptyOutDir: true, // Bersihkan folder dist sebelum build
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "client", "index.html"), // Lokasi file index.html
      },
    },
  },
});