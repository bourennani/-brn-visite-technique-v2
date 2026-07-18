import { defineConfig } from "vitest/config";

/* Configuration de test isolée du build applicatif.
   On ne réutilise pas vite.config.js : le plugin PWA et la config React n'ont
   aucun rôle dans les tests du cœur métier pur (calc, travaux, catalogue,
   profils), qui ne dépendent ni du DOM ni du service worker. Environnement
   Node : le cœur est déterministe et sans I/O (principe P6). */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
    // Le cœur métier est pur : aucune horloge, aucun réseau, aucun stockage.
    clearMocks: true,
  },
});
