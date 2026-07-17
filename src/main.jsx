import React from "react";
import ReactDOM from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./index.css";

/* Service worker : mise à jour silencieuse, l'app doit rester utilisable hors ligne. */
registerSW({
  immediate: true,
  onRegisteredSW(url, reg) {
    // Vérifie une mise à jour à chaque retour au premier plan, jamais pendant une saisie.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && reg) reg.update();
    });
  },
  onOfflineReady() {
    console.info("[BRN] Application disponible hors ligne.");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
