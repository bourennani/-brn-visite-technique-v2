import React from "react";
import { AlertTriangle, RotateCcw, Copy } from "lucide-react";

/**
 * Filet de sécurité global.
 * Une erreur survenue pendant le rendu démonte tout l'arbre React et laisse une page
 * blanche. Ce composant l'intercepte et propose un écran de récupération : les données
 * déjà enregistrées dans IndexedDB ne sont jamais perdues, seul l'affichage est reconstruit.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { erreur: null, infos: null, copie: false };
  }

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, infos) {
    this.setState({ infos });
    console.error("[BRN] Erreur de rendu interceptée par l'ErrorBoundary");
    console.error("[BRN] Message :", erreur?.message);
    console.error("[BRN] Pile :", erreur?.stack);
    console.error("[BRN] Arbre React :", infos?.componentStack);
  }

  rapport() {
    const { erreur, infos } = this.state;
    return [
      "BRN — rapport d'erreur",
      `Date    : ${new Date().toISOString()}`,
      `Version : ${__APP_VERSION__}`,
      `URL     : ${window.location.href}`,
      `Écran   : ${window.innerWidth}x${window.innerHeight}`,
      `Agent   : ${navigator.userAgent}`,
      "",
      `Erreur  : ${erreur?.name}: ${erreur?.message}`,
      "",
      "Pile :",
      erreur?.stack || "(indisponible)",
      "",
      "Arbre React :",
      infos?.componentStack || "(indisponible)",
    ].join("\n");
  }

  async copier() {
    try {
      await navigator.clipboard.writeText(this.rapport());
      this.setState({ copie: true });
      setTimeout(() => this.setState({ copie: false }), 2000);
    } catch {
      /* presse-papiers refusé : le détail reste lisible à l'écran */
    }
  }

  render() {
    if (!this.state.erreur) return this.props.children;

    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white border-2 border-stone-200 overflow-hidden">
          <div className="p-4 border-b-2 border-stone-100 flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-stone-900">L'affichage a rencontré une erreur</div>
              <p className="text-sm text-stone-600 mt-0.5">
                Vos visites enregistrées ne sont pas perdues : elles restent dans la mémoire
                de l'appareil. Seul l'écran doit être rechargé.
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="rounded-xl bg-stone-50 border border-stone-200 p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-1">
                Détail technique
              </div>
              <code className="text-[11px] text-red-800 break-words block">
                {this.state.erreur?.name}: {this.state.erreur?.message}
              </code>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full min-h-[52px] rounded-xl font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: "#3C6410" }}
            >
              <RotateCcw size={18} /> Recharger l'application
            </button>

            <button
              onClick={() => this.copier()}
              className="w-full min-h-[46px] rounded-xl font-semibold border-2 border-stone-300 text-stone-700 flex items-center justify-center gap-2"
            >
              <Copy size={16} /> {this.state.copie ? "Rapport copié" : "Copier le rapport d'erreur"}
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              Version {__APP_VERSION__}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
