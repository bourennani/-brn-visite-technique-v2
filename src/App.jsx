import { useState, useRef, useEffect, useCallback } from "react";
import { AlertTriangle, ChevronLeft, Home, Save } from "lucide-react";
import { OBJ_LIB, SketchPad } from "./components/SketchPad";
import { Toast } from "./components/ui";
import { uid } from "./lib/calc";
import { G_DARK, G_MID, G_PALE, n } from "./lib/catalogue";
import { Store, dataUrlToBlob, forgetUrl, newOuverture, newRoom, newVisite } from "./lib/store";
import { RecapScreen, ReportScreen } from "./screens/Recap";
import { RoomScreen } from "./screens/Room";
import { InfosScreen, RoomsScreen, TypesScreen, VisitesScreen } from "./screens/Visites";

/* ==================================================================== */
/*  MODULE 9 — APP                                                      */
/* ==================================================================== */

export default function App() {
  const [visites, setVisites] = useState([]);
  const [vid, setVid] = useState(null);
  const [screen, setScreen] = useState("visites");
  const [roomId, setRoomId] = useState(null);
  const [sketching, setSketching] = useState(null);
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("idb");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  const timer = useRef(null);

  const toast = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(""), 2600); }, []);

  /* init */
  useEffect(() => {
    (async () => {
      const m = await Store.init();
      setMode(m);
      const list = await Store.listVisites();
      setVisites(list.filter((x) => x && x.id !== "__probe__"));
      setReady(true);
    })();
  }, []);

  const v = visites.find((x) => x.id === vid) || null;
  const room = v?.rooms.find((r) => r.id === roomId) || null;
  const rIdx = v ? v.rooms.findIndex((r) => r.id === roomId) : -1;

  /* autosave debounce */
  const setV = useCallback((next) => {
    setVisites((prev) => prev.map((x) => (x.id === next.id ? next : x)));
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await Store.saveVisite(next);
      setSaved(true);
    }, 600);
  }, []);

  const newV = async () => {
    const nv = newVisite();
    nv.ref = `BRN-${new Date().getFullYear()}-${String(visites.length + 1).padStart(3, "0")}`;
    await Store.saveVisite(nv);
    setVisites((p) => [...p, nv]);
    setVid(nv.id);
    setScreen("infos");
  };

  const dupV = async (id) => {
    const src = visites.find((x) => x.id === id);
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = uid();
    copy.ref = (src.ref || "BRN") + "-COPIE";
    copy.statut = "en_cours";
    copy.createdAt = Date.now();
    copy.rooms.forEach((r) => { r.id = uid(); r.photos = []; r.sketches = []; });
    await Store.saveVisite(copy);
    setVisites((p) => [...p, copy]);
    toast("Visite dupliquée (photos non copiées)");
  };

  const delV = async (id) => {
    await Store.deleteVisite(id);
    setVisites((p) => p.filter((x) => x.id !== id));
    toast("Visite supprimée");
  };

  const statutV = async (id, st) => {
    const nv = { ...visites.find((x) => x.id === id), statut: st };
    await Store.saveVisite(nv);
    setVisites((p) => p.map((x) => (x.id === id ? nv : x)));
  };

  const addRoom = (type) => {
    const same = v.rooms.filter((r) => r.typeId === type.id).length;
    const r = newRoom(type, same > 0 ? `${type.label} ${same + 1}` : type.label);
    setV({ ...v, rooms: [...v.rooms, r] });
    setRoomId(r.id);
    setScreen("room");
  };

  const updateRoom = (r) => setV({ ...v, rooms: v.rooms.map((x) => (x.id === r.id ? r : x)) });

  /* Le croquis est persisté en OBJETS (shapes) + un PNG pour le rapport.
     C'est ce qui permet de rouvrir un croquis et d'y retrouver textes et cotes. */
  const saveSketch = async (dataUrl, shapes, echelle) => {
    try {
      const blob = dataUrlToBlob(dataUrl);
      const key = await Store.putBlob(blob);
      const rec = { id: sketching?.id || uid(), blobKey: key, shapes, echelle, legende: sketching?.legende || "" };
      if (sketching?.id) {
        if (sketching.blobKey) { Store.delBlob(sketching.blobKey); forgetUrl(sketching.blobKey); }
        updateRoom({ ...room, sketches: room.sketches.map((s) => (s.id === sketching.id ? rec : s)) });
      } else {
        updateRoom({ ...room, sketches: [...room.sketches, rec] });
      }
    } catch { toast("Croquis non enregistré"); }
    setSketching(null);
  };

  /* Liaison croquis → métrés : anti-doublon par identifiant d'objet */
  const syncOuverture = (obj) => {
    const lib = OBJ_LIB.find((l) => l.id === obj.type);
    if (!lib?.ouv) return;
    const exist = (room.ouvertures || []).find((o) => o.srcId === obj.id);
    const champs = {
      type: lib.ouv,
      nom: obj.ref || lib.label,
      L: String(n(obj.wM)),
      H: String(n(obj.hM)),
      qte: "1",
      srcId: obj.id,
      position: obj.mur !== undefined ? ["Mur haut", "Mur droit", "Mur bas", "Mur gauche"][obj.mur] : "",
      sens: obj.sens || "",
    };
    if (exist) {
      updateRoom({ ...room, ouvertures: room.ouvertures.map((o) => (o.srcId === obj.id ? { ...o, ...champs } : o)) });
      toast(`${lib.label} mise à jour dans les métrés`);
    } else {
      const o = { ...newOuverture(lib.ouv), ...champs };
      updateRoom({ ...room, ouvertures: [...(room.ouvertures || []), o] });
      toast(`${lib.label} ajoutée aux ouvertures`);
    }
  };

  const titres = {
    visites: "Visites", infos: "Informations générales", rooms: v ? (v.client.nom || v.ref || "Visite") : "",
    types: "Type de pièce", room: room?.nom || "", recap: "Récapitulatif chantier", report: "Rapport de visite",
  };

  const back = () => {
    if (screen === "room" || screen === "types" || screen === "recap" || screen === "report" || screen === "infos") setScreen("rooms");
    else setScreen("visites");
    if (screen === "rooms") setVid(null);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl mx-auto mb-2 animate-pulse" style={{ backgroundColor: G_PALE }} />
          <p className="text-xs text-stone-500">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100" style={{ WebkitTapHighlightColor: "transparent" }}>
      <div className="no-print sticky top-0 z-30 bg-white border-b-2 border-stone-200">
        <div className="h-[56px] px-2 flex items-center gap-2">
          {screen !== "visites" ? (
            <button onClick={back} className="w-10 h-10 rounded-xl flex items-center justify-center active:bg-stone-100">
              <ChevronLeft size={22} className="text-stone-700" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center ml-1" style={{ backgroundColor: G_PALE }}>
              <Home size={18} style={{ color: G_DARK }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-stone-900 truncate leading-tight text-sm">{titres[screen]}</div>
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: G_MID }}>BRN Group · Relevé & métré</div>
          </div>
          {v && screen !== "visites" && (
            <span className="text-[9px] font-bold px-2 py-1 rounded-lg shrink-0 flex items-center gap-1"
              style={saved ? { backgroundColor: G_PALE, color: G_DARK } : { backgroundColor: "#FEF3C7", color: "#92400E" }}>
              <Save size={9} /> {saved ? "Enregistré" : "…"}
            </span>
          )}
        </div>
        {v && ["rooms", "infos", "recap", "report"].includes(screen) && (
          <div className="flex gap-1 px-2 pb-2">
            {[
              { k: "infos", l: "Infos" }, { k: "rooms", l: "Pièces" },
              { k: "recap", l: "Récap" }, { k: "report", l: "Rapport" },
            ].map((t) => (
              <button key={t.k} onClick={() => setScreen(t.k)}
                className="flex-1 h-9 rounded-lg text-[11px] font-bold border-2"
                style={screen === t.k ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
                {t.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === "memory" && (
        <div className="no-print px-3 pt-2">
          <div className="rounded-lg px-2.5 py-1.5 flex items-start gap-1.5" style={{ backgroundColor: "#FEF3C7" }}>
            <AlertTriangle size={12} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-900 leading-tight">
              Stockage local indisponible dans cet aperçu : les données restent en mémoire et seront perdues au rechargement.
              Une fois l'application hébergée en HTTPS, la sauvegarde IndexedDB fonctionne normalement.
            </p>
          </div>
        </div>
      )}

      {screen === "visites" && (
        <VisitesScreen visites={visites} onNew={newV} onDup={dupV} onDel={delV} onStatut={statutV}
          onOpen={(id) => { setVid(id); setScreen("rooms"); }} />
      )}
      {screen === "infos" && v && <InfosScreen v={v} set={setV} />}
      {screen === "rooms" && v && (
        <RoomsScreen v={v} set={setV} onOpen={(id) => { setRoomId(id); setScreen("room"); }}
          onAdd={() => setScreen("types")} onRecap={() => setScreen("recap")} onReport={() => setScreen("report")} />
      )}
      {screen === "types" && v && <TypesScreen onPick={addRoom} />}
      {screen === "room" && room && (
        <RoomScreen room={room} update={updateRoom} openSketch={(s) => setSketching(s || {})} toast={toast}
          hasPrev={rIdx > 0} hasNext={rIdx < v.rooms.length - 1}
          onPrev={() => setRoomId(v.rooms[rIdx - 1].id)} onNext={() => setRoomId(v.rooms[rIdx + 1].id)} />
      )}
      {screen === "recap" && v && <RecapScreen v={v} set={setV} toast={toast} />}
      {screen === "report" && v && <ReportScreen v={v} toast={toast} />}

      {sketching && room && (
        <SketchPad initial={sketching} room={room} onClose={() => setSketching(null)}
          onSave={saveSketch} onSyncOuverture={syncOuverture} />
      )}
      <Toast msg={msg} />
    </div>
  );
}
