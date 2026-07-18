import { useState, useMemo } from "react";
import {
  Check, Search, Star, Clock, Plus, RotateCcw, PenLine, AlertTriangle,
  Calculator, ChevronDown, X,
} from "lucide-react";
import { FAVORIS_BRN, G_DARK, G_LIGHT, G_MID, G_PALE, LOTS, UNITES_LIBRES, n } from "../lib/catalogue";
import { AUTO, VALIDE, MANUEL, fmt } from "../lib/calc";
import { lotsVisibles, profilDe } from "../lib/profils";
import {
  calcPoste, validerPoste, manuelPoste, autoPoste, postesCuisineDetail,
  postesCuisineDepose, controlesPiece, controlesPostes, STATUTS, VERIF,
} from "../lib/travaux";
import { newPrestation } from "../lib/store";
import { Section, Btn, Line } from "./ui";

/* Lots ouverts à la saisie manuelle. La démolition en premier : c'est là que
   les découvertes de chantier ne rentrent dans aucune case du catalogue. */
const LOTS_PRESTA_MANUELLE = ["demo"];

/* ---- Un poste de travaux ---- */
function PosteCard({ item, t, p, room, onT, toast }) {
  const [open, setOpen] = useState(false);
  /* Brouillon de saisie manuelle. Tant qu'il vaut null, le champ affiche la
     valeur enregistrée. Dès la première frappe il prend la main : plus rien
     n'est écrit dans la visite avant un clic sur Valider. */
  const [draft, setDraft] = useState(null);
  const on = !!t?.on;
  const st = STATUTS[p.statut];

  const set = (patch) => onT(item.id, patch);

  const basculer = () => {
    if (on) return set(null); // décoche : on retire le poste
    set({
      on: true, lot: item.lot, lotNom: item.lotNom,
      intervention: "Fourniture et pose", mode: AUTO, val: "", snap: null,
      source: p.origine, dateModif: new Date().toISOString(),
    });
  };

  const valider = () => {
    const nt = validerPoste(t, p);
    if (!nt) { toast("Quantité non validable"); return; }
    set(nt);
  };

  /* Enregistre le brouillon comme quantité manuelle, et seulement alors. */
  const validerManuel = () => {
    const brut = draft ?? String(t?.val ?? "");
    if (String(brut).trim() === "" || !(n(brut) > 0)) {
      toast("Saisissez une quantité avant de valider");
      return;
    }
    set(manuelPoste(t, String(brut), p));
    setDraft(null);
    toast(`Quantité manuelle enregistrée : ${fmt(n(brut), p.unit === "u" ? 0 : 2)} ${p.unit}`);
  };

  const revenirAuCalcul = () => {
    setDraft(null);
    set(autoPoste(t));
    toast("Quantité calculée rétablie");
  };

  /* Passer en saisie manuelle n'enregistre rien : on amorce le brouillon. */
  const passerEnManuel = () => {
    setDraft(String(p.retenu ?? ""));
    set({ ...t, mode: MANUEL });
  };

  const enAttente = draft !== null && draft !== String(t?.val ?? "");

  return (
    <div className="rounded-lg border-2 p-1.5" style={{ borderColor: on ? (p.perime ? "#EF4444" : G_LIGHT) : "#F5F5F4" }}>
      <div className="flex items-center gap-1.5">
        <button onClick={basculer} className="flex items-center gap-2 flex-1 min-w-0 min-h-[40px] text-left">
          <span className="w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0"
            style={on ? { backgroundColor: G_DARK, borderColor: G_DARK } : { borderColor: "#D6D3D1" }}>
            {on && <Check size={13} className="text-white" />}
          </span>
          <span className="min-w-0">
            <span className={`block text-xs truncate ${on ? "font-bold text-stone-900" : "text-stone-600"}`}>
              {item.label}
            </span>
            {on && (
              <span className="block text-[8px] text-stone-400 truncate">{p.origine}</span>
            )}
          </span>
        </button>

        {on && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="font-mono font-bold text-sm" style={{ color: G_DARK }}>
              {fmt(p.retenu, p.unit === "u" ? 0 : 2)}
            </span>
            <span className="text-[9px] font-mono text-stone-400 w-6">{p.unit}</span>
            <button onClick={() => setOpen(!open)} className="w-7 h-9 flex items-center justify-center">
              <ChevronDown size={13} className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>

      {on && (
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: st.bg, color: st.fg }}>
            {st.label}
          </span>
          {p.perime && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-0.5">
              <AlertTriangle size={8} /> métré modifié → {fmt(p.propose)} {p.unit}
            </span>
          )}
          {!p.aSource && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
              saisie libre
            </span>
          )}
          {p.ecart > 0.25 && (
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              écart {Math.round(p.ecart * 100)} %
            </span>
          )}
        </div>
      )}

      {on && open && (
        <div className="mt-2 pt-2 border-t border-stone-100 space-y-2">
          <div className="rounded-lg p-2" style={{ backgroundColor: "#FAFAF9" }}>
            <Line k="Quantité calculée" v={fmt(p.brute, p.unit === "u" ? 0 : 2)} u={p.unit} />
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] text-stone-500">Marge</span>
              <div className="flex gap-1 items-center">
                {[0, 5, 8, 10, 15].map((m) => (
                  <button key={m} onClick={() => set({ ...t, marge: String(m) })}
                    className="w-7 h-7 rounded text-[9px] font-bold border"
                    style={p.marge === m
                      ? { backgroundColor: G_DARK, color: "#fff", borderColor: G_DARK }
                      : { backgroundColor: "#fff", color: "#A8A29E", borderColor: "#E7E5E4" }}>
                    {m}
                  </button>
                ))}
                <input inputMode="decimal" value={t?.marge ?? ""} onChange={(e) => set({ ...t, marge: e.target.value })}
                  placeholder="%" className="w-10 h-7 px-1 rounded border border-stone-300 text-[10px] font-mono text-center" />
              </div>
            </div>
            <Line k="Quantité proposée" v={fmt(p.propose, p.unit === "u" ? 0 : 2)} u={p.unit} strong />
          </div>

          {p.mode === MANUEL ? (
            <div>
              <div className="relative">
                <input inputMode="decimal" value={draft ?? t?.val ?? ""} autoFocus
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") validerManuel(); }}
                  placeholder={fmt(p.propose)}
                  className="w-full h-11 px-2.5 pr-8 rounded-lg border-2 font-mono font-bold text-right"
                  style={{ borderColor: enAttente ? "#B45309" : "#9A3412" }} />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400">{p.unit}</span>
              </div>
              <div className="text-[9px] mt-1 leading-snug">
                {enAttente ? (
                  <span className="font-bold" style={{ color: "#B45309" }}>
                    Saisie non enregistrée — cliquez sur Valider.
                  </span>
                ) : (
                  <span className="text-stone-500">
                    Quantité manuelle enregistrée. Calcul automatique : {fmt(p.propose, p.unit === "u" ? 0 : 2)} {p.unit}.
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-baseline justify-between rounded-lg px-2.5 py-2" style={{ backgroundColor: G_PALE }}>
              <span className="text-[10px] text-stone-600">Quantité retenue</span>
              <span className="font-mono font-bold text-lg" style={{ color: G_DARK }}>
                {fmt(p.retenu, p.unit === "u" ? 0 : 2)} <span className="text-[10px] text-stone-400">{p.unit}</span>
              </span>
            </div>
          )}

          <div className="flex gap-1">
            {p.mode === AUTO && (
              <button onClick={valider} className="flex-1 h-9 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
                style={{ backgroundColor: G_DARK }}>
                <Check size={12} /> Valider
              </button>
            )}
            {p.mode !== MANUEL && (
              <button onClick={passerEnManuel}
                className="flex-1 h-9 rounded-lg text-[10px] font-bold border-2 border-stone-300 text-stone-700 flex items-center justify-center gap-1">
                <PenLine size={11} /> Modifier
              </button>
            )}
            {p.mode === MANUEL && (
              <button onClick={validerManuel}
                className="flex-1 h-9 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
                style={{ backgroundColor: enAttente ? "#B45309" : G_DARK }}>
                <Check size={12} /> Valider
              </button>
            )}
            {p.mode !== AUTO && (
              <button onClick={revenirAuCalcul}
                className="flex-1 h-9 rounded-lg text-[10px] font-bold border-2 flex items-center justify-center gap-1"
                style={{ borderColor: G_LIGHT, color: G_DARK, backgroundColor: G_PALE }}>
                <RotateCcw size={11} /> Revenir à la quantité calculée
              </button>
            )}
          </div>

          <input value={t?.obs ?? ""} onChange={(e) => set({ ...t, obs: e.target.value })}
            placeholder="Observations" className="w-full h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px]" />

          {(p.dateValid || p.ancienne != null) && (
            <div className="text-[8px] text-stone-400 leading-snug">
              {p.dateValid && <>Validé le {new Date(p.dateValid).toLocaleString("fr-FR")}. </>}
              {p.ancienne != null && <>Quantité précédente : {fmt(n(p.ancienne))} {p.unit}.</>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ---- Prestations saisies à la main ----
   Elles ne viennent d'aucun catalogue, ne sont jamais recalculées, et restent
   reconnaissables partout grâce à leur préfixe d'identifiant (px_). */
function PrestationsManuelles({ lotId, lotNom, room, update, toast }) {
  const liste = (room.prestations || []).filter((x) => (x.lot || "demo") === lotId);

  const majListe = (suite) => update({ ...room, prestations: suite });

  const ajouter = () => {
    majListe([...(room.prestations || []), newPrestation(lotId)]);
  };
  const modifier = (id, patch) => {
    majListe((room.prestations || []).map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };
  const supprimer = (id) => {
    majListe((room.prestations || []).filter((x) => x.id !== id));
    toast("Prestation supprimée");
  };

  return (
    <div className="mt-2 pt-2 border-t-2 border-dashed border-stone-200">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wide text-stone-500">
          Prestations manuelles
        </span>
        {liste.length > 0 && (
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
            {liste.length}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {liste.map((x) => (
          <div key={x.id} className="rounded-lg border-2 p-1.5 space-y-1.5" style={{ borderColor: "#FDBA74" }}>
            <div className="flex gap-1.5">
              <input value={x.label} onChange={(e) => modifier(x.id, { label: e.target.value })}
                placeholder="Libellé de la prestation"
                className="flex-1 h-9 px-2 rounded border-2 border-stone-300 text-[11px]" />
              <button onClick={() => supprimer(x.id)}
                className="w-9 h-9 rounded border-2 border-red-200 flex items-center justify-center shrink-0">
                <X size={13} className="text-red-600" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <input inputMode="decimal" value={x.qte}
                onChange={(e) => modifier(x.id, { qte: e.target.value })}
                placeholder="Qté"
                className="w-20 h-9 px-2 rounded border-2 border-stone-300 font-mono font-bold text-right text-[11px]" />
              <select value={x.unit} onChange={(e) => modifier(x.id, { unit: e.target.value })}
                className="h-9 px-1.5 rounded border-2 border-stone-300 text-[11px] font-mono bg-white">
                {UNITES_LIBRES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <input value={x.obs ?? ""} onChange={(e) => modifier(x.id, { obs: e.target.value })}
                placeholder="Observation (facultatif)"
                className="flex-1 h-9 px-2 rounded border-2 border-stone-200 text-[11px]" />
            </div>
            <div className="text-[8px] text-stone-400 leading-snug">
              Pièce : {room.nom} · {lotNom} · saisie manuelle, hors catalogue
              {String(x.label || "").trim() === "" || !(n(x.qte) > 0)
                ? <span className="font-bold text-amber-700"> · incomplète : absente du rapport</span>
                : null}
            </div>
          </div>
        ))}
      </div>

      <button onClick={ajouter}
        className="w-full h-9 mt-1.5 rounded-lg border-2 border-dashed text-[10px] font-bold flex items-center justify-center gap-1"
        style={{ borderColor: G_LIGHT, color: G_DARK }}>
        <Plus size={12} /> Ajouter une prestation manuelle
      </button>
    </div>
  );
}

export default function TravauxTab({ room, update, visite, toast }) {
  const c = room.__calc;
  const [tousLots, setTousLots] = useState(false);
  const [rech, setRech] = useState("");
  const [ajoutLot, setAjoutLot] = useState(false);
  const [vue, setVue] = useState("profil"); // profil | favoris | recents

  const profil = profilDe(room);

  const setT = (id, patch) => {
    const tv = { ...room.travaux };
    if (patch === null) delete tv[id];
    else tv[id] = { ...tv[id], ...patch, on: true };
    update({ ...room, travaux: tv });
  };

  /* --- Catalogue effectif : lots du profil + postes dynamiques cuisine --- */
  const { lots, tousPostes } = useMemo(() => {
    const vis = lotsVisibles(room, tousLots);
    const base = LOTS.filter((l) => !vis || vis.includes(l.id)).map((l) => ({
      ...l,
      items: l.items.map((i) => ({ ...i, lot: l.id, lotNom: l.nom })),
    }));

    /* Le détail par largeur devient de vrais postes, un par largeur. */
    if (profil.id === "cuisine" || tousLots) {
      const det = postesCuisineDetail(c);
      const dep = postesCuisineDepose(c);
      const lotCu = base.find((l) => l.id === "cuisine");
      if (lotCu && det.length) lotCu.items = [...det, ...lotCu.items];
      const lotDemo = base.find((l) => l.id === "demo");
      if (lotDemo && dep.length) lotDemo.items = [...dep, ...lotDemo.items];
    }

    const flat = base.flatMap((l) => l.items);
    return { lots: base, tousPostes: flat };
  }, [room, c, tousLots, profil.id]);

  /* --- Filtrage : recherche, favoris, récents --- */
  const recents = useMemo(() => {
    const ids = new Set();
    (visite?.rooms || []).forEach((r) => {
      if (r.id === room.id) return;
      Object.entries(r.travaux || {}).forEach(([id, t]) => { if (t?.on) ids.add(id); });
    });
    return ids;
  }, [visite, room.id]);

  const garde = (i) => {
    if (rech && !i.label.toLowerCase().includes(rech.toLowerCase())) return false;
    if (vue === "favoris") return FAVORIS_BRN.includes(i.id);
    if (vue === "recents") return recents.has(i.id);
    return true;
  };

  /* --- Postes calculés (source unique pour l'affichage et les compteurs) --- */
  const postes = useMemo(
    () => tousPostes.map((i) => ({ item: i, t: room.travaux[i.id], p: calcPoste(i, room.travaux[i.id], c) })),
    [tousPostes, room.travaux, c]
  );
  const actifs = postes.filter((x) => x.t?.on);
  const aVerifier = actifs.filter((x) => x.p.statut === VERIF);
  const perimes = actifs.filter((x) => x.p.perime);

  const alertes = useMemo(
    () => [...controlesPiece(room, c), ...controlesPostes(actifs.map((x) => x.p))],
    [room, c, actifs.length]
  );

  /* --- §9 Validation en masse --- */
  const validerPiece = () => {
    try {
      const tv = { ...room.travaux };
      let k = 0;
      aVerifier.forEach(({ item, t, p }) => {
        const nt = validerPoste(t, p);
        if (nt) { tv[item.id] = nt; k++; }
      });
      if (!k) { toast("Aucun poste à valider"); return; }
      update({ ...room, travaux: tv });
      toast(`${k} poste(s) validé(s)`);
    } catch (e) {
      console.error("[BRN] Échec de la validation des postes", e);
      toast("Validation impossible — aucune donnée modifiée");
    }
  };

  const reinit = () => {
    try {
      const tv = { ...room.travaux };
      let k = 0;
      actifs.forEach(({ item, t }) => {
        if ((t?.mode || AUTO) !== AUTO) { tv[item.id] = autoPoste(t); k++; }
      });
      update({ ...room, travaux: tv });
      toast(k ? `${k} poste(s) remis en calcul automatique` : "Rien à réinitialiser");
    } catch (e) {
      console.error("[BRN] Échec de la réinitialisation", e);
      toast("Réinitialisation impossible");
    }
  };

  const masques = tousLots ? [] : LOTS.filter((l) => !(lotsVisibles(room, false) || []).includes(l.id));

  return (
    <div className="p-3 space-y-2">
      {/* --- Bandeau de pilotage --- */}
      <div className="rounded-xl p-2 flex items-start gap-1.5" style={{ backgroundColor: G_PALE }}>
        <Calculator size={13} style={{ color: G_DARK }} className="mt-0.5 shrink-0" />
        <p className="text-[10px] text-stone-700 leading-snug">
          Les quantités viennent des métrés de la pièce. Vérifiez, validez — ou modifiez si besoin.
          La marge s'applique <b>une seule fois</b>, ici.
        </p>
      </div>

      {(aVerifier.length > 0 || perimes.length > 0) && (
        <div className="rounded-xl border-2 p-2" style={{ borderColor: perimes.length ? "#EF4444" : "#FDE68A", backgroundColor: perimes.length ? "#FEF2F2" : "#FFFBEB" }}>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold" style={{ color: perimes.length ? "#B91C1C" : "#92400E" }}>
              {aVerifier.length} poste(s) à vérifier
              {perimes.length > 0 && ` · ${perimes.length} métré(s) modifié(s)`}
            </span>
          </div>
          <div className="flex gap-1.5">
            <Btn onClick={validerPiece} disabled={!aVerifier.length} className="flex-1 min-h-[40px]">
              <Check size={14} /> Valider tous les métrés de cette pièce
            </Btn>
            <Btn variant="ghost" onClick={reinit} className="min-h-[40px]">
              <RotateCcw size={13} />
            </Btn>
          </div>
        </div>
      )}

      {/* --- §10 Contrôles de cohérence --- */}
      {alertes.length > 0 && (
        <Section title={`Contrôles de cohérence (${alertes.length})`} badge={alertes.length}>
          <div className="space-y-1">
            {alertes.slice(0, 20).map((a, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] leading-snug">
                <AlertTriangle size={10} className="mt-0.5 shrink-0"
                  style={{ color: a.gravite === "rouge" ? "#B91C1C" : a.gravite === "info" ? "#A8A29E" : "#B45309" }} />
                <span className="text-stone-600">{a.msg}</span>
              </div>
            ))}
            <p className="text-[9px] text-stone-400 pt-1">
              Ce sont des avertissements : ils ne bloquent rien.
            </p>
          </div>
        </Section>
      )}

      {/* --- §8 Filtrage --- */}
      <div className="rounded-xl border-2 p-2 space-y-1.5"
        style={{ borderColor: tousLots ? "#FDE68A" : "#E7E5E4", backgroundColor: tousLots ? "#FFFBEB" : "#fff" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: G_DARK }}>
              Profil {profil.label}
            </div>
            <p className="text-[9px] text-stone-500">
              {tousLots ? "Catalogue complet." : `${lots.length} lot(s) sur ${LOTS.length}.`}
            </p>
          </div>
          <button onClick={() => setTousLots(!tousLots)}
            className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 shrink-0"
            style={tousLots
              ? { backgroundColor: "#92400E", borderColor: "#92400E", color: "#fff" }
              : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
            {tousLots ? "Revenir au profil" : "Afficher tous les travaux"}
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={rech} onChange={(e) => setRech(e.target.value)}
            placeholder="Rechercher un ouvrage…"
            className="w-full h-9 pl-7 pr-2 rounded-lg border-2 border-stone-200 text-[11px]" />
        </div>

        <div className="flex gap-1">
          {[
            { k: "profil", l: "Tous", Icon: null },
            { k: "favoris", l: "Favoris BRN", Icon: Star },
            { k: "recents", l: `Récents${recents.size ? ` (${recents.size})` : ""}`, Icon: Clock },
          ].map((v) => (
            <button key={v.k} onClick={() => setVue(v.k)}
              className="flex-1 h-8 rounded-lg text-[9px] font-bold border-2 flex items-center justify-center gap-1"
              style={vue === v.k
                ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
              {v.Icon && <v.Icon size={10} />} {v.l}
            </button>
          ))}
        </div>
      </div>

      {!tousLots && masques.length > 0 && (
        <button onClick={() => setAjoutLot(true)}
          className="w-full h-9 rounded-lg border-2 border-dashed border-stone-300 text-[10px] font-semibold text-stone-500 flex items-center justify-center gap-1">
          <Plus size={12} /> Ajouter exceptionnellement un autre lot
        </button>
      )}

      {ajoutLot && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-3" onClick={() => setAjoutLot(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[70%] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b-2 border-stone-100 flex items-center justify-between">
              <div className="font-bold text-stone-900">Ajouter un lot</div>
              <button onClick={() => setAjoutLot(false)} className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {masques.map((l) => (
                <button key={l.id}
                  onClick={() => {
                    update({ ...room, lotsExceptionnels: [...(room.lotsExceptionnels || []), l.id] });
                    setAjoutLot(false);
                    toast(`Lot « ${l.nom} » ajouté`);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl border-2 border-stone-200 text-xs font-semibold text-stone-700 active:bg-lime-50">
                  {l.nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Les lots --- */}
      {lots.map((lot) => {
        const items = lot.items.filter(garde);
        if (!items.length) return null;
        const nb = items.filter((i) => room.travaux[i.id]?.on).length;
        const horsProfil = !profil.lots.includes(lot.id);
        return (
          <Section key={lot.id} title={horsProfil ? `${lot.nom} · hors profil` : lot.nom} badge={nb}>
            <div className="space-y-1.5">
              {items.map((item) => {
                const t = room.travaux[item.id];
                return (
                  <PosteCard key={item.id} item={item} t={t}
                    p={calcPoste(item, t, c)} room={room} onT={setT} toast={toast} />
                );
              })}
            </div>
            {LOTS_PRESTA_MANUELLE.includes(lot.id) && (
              <PrestationsManuelles lotId={lot.id} lotNom={lot.nom} room={room}
                update={update} toast={toast} />
            )}
          </Section>
        );
      })}

      {postes.filter((x) => garde(x.item)).length === 0 && (
        <p className="text-[11px] text-stone-400 text-center py-6">
          Aucun ouvrage ne correspond.
        </p>
      )}
    </div>
  );
}
