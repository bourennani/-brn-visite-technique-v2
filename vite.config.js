import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

// Lecture compatible Node 18+ (les attributs d'import JSON exigent Node 20.10+).
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // registerSW() est appelé manuellement dans src/main.jsx : pas de double enregistrement.
      injectRegister: null,
      // Le manifeste est généré ICI (source unique) -> dist/manifest.webmanifest
      manifestFilename: "manifest.webmanifest",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "BRN Group — Visite technique",
        short_name: "BRN Visite",
        description: "Relevé et métré de chantier hors ligne",
        theme_color: "#3C6410",
        background_color: "#F5F5F4",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "fr-FR",
        categories: ["business", "productivity", "utilities"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // L'app doit fonctionner sur chantier sans réseau : on précharge tout le bundle.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/index.html",
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  },
  server: { port: 5173, host: true }
});
