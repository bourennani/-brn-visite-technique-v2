import { useState, useRef, useMemo } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Building2, Calculator, Camera, Check, ChefHat, ChevronDown, ChevronLeft, Image as ImageIcon, ListChecks, Minus, PenLine, Plus, RotateCcw, Ruler, Trash2, X } from "lucide-react";
import { StoredImg } from "../components/SketchPad";
import { Btn, Chips, DynList, Field, Line, NumField, QtyBox, Section, Toggle } from "../components/ui";
import { AUTO, VALIDE, calcOuverture, calcRoom, calcZone, fmt, qValider, uid, validateRoom } from "../lib/calc";
import { profilDe, sectionVisible, equipVisible, lotsVisibles, PROFILS_LISTE } from "../lib/profils";
import FacadeBlock from "../components/FacadeBlock";
import CuisineBlock from "../components/CuisineBlock";
import TravauxTab from "../components/TravauxTab";
import { ELEC_CAT, ELEC_EMPLACEMENTS, ELEC_HAUTEURS, ELEC_POSES, ENTRAXES, EQUIPEMENTS, ETATS_EQUIP, FIELD_LABELS, FORMES, G_DARK, G_LIGHT, G_MID, G_PALE, INK, INTERVENTIONS, LOTS, LOTS_DEDUC, MODES_PLAFOND, OPTIONS_SOL, OSSATURES, PLAQUES, PREPARATIONS, PRESETS_ZONE, RETOURS, REVETEMENTS, SUPPORTS_PEINTURE, TYPES_OUV, n } from "../lib/catalogue";
import { Store, compressImage, forgetUrl, newOuverture, newZone } from "../lib/store";

/* ==================================================================== */
/*  MODULE 7 — DÉTAIL D'UNE PIÈCE                                       */
/* ==================================================================== */

function Readout({ c }) {
  const cells = [
    { k: "Sol net", v: fmt(c.solNet), u: "m²", hi: true },
    { k: "Murs net", v: fmt(c.mursNet), u: "m²", hi: true },
    { k: "Plinthes", v: fmt(c.plinthesRetenu), u: "ml", hi: true },
    { k: "Plafond", v: fmt(c.plafondNet), u: "m²" },
    { k: "Volume", v: fmt(c.volume), u: "m³" },
    { k: "Périmètre", v: fmt(c.perim), u: "ml" },
  ];
  return (
    <div className="rounded-2xl p-3 shadow-lg" style={{ backgroundColor: INK }}>
      <div className="flex items-center gap-2 mb-2">
        <Ruler size={12} style={{ color: G_LIGHT }} />
        <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: G_LIGHT }}>Calcul automatique</span>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {cells.map((x) => (
          <div key={x.k}>
            <div className="text-[8px] uppercase tracking-wider text-stone-500 font-semibold">{x.k}</div>
            <div className="font-mono font-bold leading-tight" style={{ color: x.hi ? G_LIGHT : "#E7E5E4", fontSize: x.hi ? 18 : 14 }}>
              {x.v}<span className="text-[9px] ml-1 text-stone-500">{x.u}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ZoneCard({ z, i, onChange, onDelete, canDelete }) {
  const def = FORMES[z.forme] || FORMES.rectangle;
  const c = calcZone(z);
  const set = (k, val) => onChange({ ...z, [k]: val });
  return (
    <div className="rounded-xl border-2 p-2.5 mb-2" style={{ borderColor: z.deduire ? "#FCA5A5" : "#E7E5E4", backgroundColor: z.deduire ? "#FEF2F2" : "#fff" }}>
      <div className="flex gap-1.5 mb-2">
        <input value={z.nom} onChange={(e) => set("nom", e.target.value)} placeholder={`Zone ${i + 1}`}
          className="flex-1 min-w-0 h-10 px-2.5 rounded-lg border-2 border-stone-300 text-sm font-bold focus:outline-none focus:border-lime-700" />
        <button onClick={() => set("deduire", !z.deduire)}
          className="h-10 px-2.5 rounded-lg text-[10px] font-bold border-2 shrink-0"
          style={z.deduire ? { backgroundColor: "#FEE2E2", borderColor: "#EF4444", color: "#B91C1C" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
          {z.deduire ? "Déduire" : "Ajouter"}
        </button>
        {canDelete && (
          <button onClick={onDelete} className="w-10 h-10 rounded-lg border-2 border-stone-200 flex items-center justify-center shrink-0">
            <X size={14} className="text-stone-500" />
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-2 overflow-x-auto pb-0.5">
        {Object.entries(FORMES).map(([k, f]) => (
          <button key={k} onClick={() => set("forme", k)}
            className="h-8 px-2 rounded-lg text-[10px] font-bold border-2 shrink-0"
            style={z.forme === k ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
            {f.label}
          </button>
        ))}
      </div>
      {def.hint && <p className="text-[9px] text-stone-400 mb-1.5">{def.hint}</p>}

      <div className="grid grid-cols-3 gap-1.5">
        {def.fields.map((f) => (
          <NumField key={f} label={FIELD_LABELS[f]} value={z[f]} onChange={(v) => set(f, v)}
            suffix={f === "surfaceManu" ? "m²" : "m"} invalid={n(z[f]) < 0} wide />
        ))}
        <NumField label="Quantité" value={z.qte} onChange={(v) => set("qte", v)} suffix="×" wide />
      </div>

      <div className="mt-2 pt-2 border-t border-stone-100 grid grid-cols-4 gap-1 font-mono text-[10px]">
        <div><span className="text-stone-400">Sol </span><b>{fmt(c.sol)}</b></div>
        <div><span className="text-stone-400">Pér. </span><b>{fmt(c.perim)}</b></div>
        <div><span className="text-stone-400">Murs </span><b>{fmt(c.mursBrut)}</b></div>
        <div><span className="text-stone-400">Vol. </span><b>{fmt(c.volume)}</b></div>
      </div>
    </div>
  );
}

function OuvCard({ o, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const c = calcOuverture(o);
  const set = (k, v) => onChange({ ...o, [k]: v });
  const setD = (k, v) => onChange({ ...o, deductions: { ...o.deductions, [k]: v } });
  const setR = (k, v) => onChange({ ...o, retours: { ...o.retours, [k]: v } });
  const nbDed = LOTS_DEDUC.filter((l) => o.deductions?.[l.k]).length;
  return (
    <div className="rounded-xl border-2 border-stone-200 p-2.5 mb-2 bg-white">
      <div className="flex gap-1.5 mb-2 overflow-x-auto pb-0.5">
        {TYPES_OUV.map((t) => (
          <button key={t} onClick={() => set("type", t)}
            className="h-8 px-2 rounded-lg text-[10px] font-bold border-2 shrink-0"
            style={o.type === t ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5 mb-2">
        <input value={o.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Nom / repère"
          className="flex-1 min-w-0 h-10 px-2.5 rounded-lg border-2 border-stone-300 text-sm focus:outline-none focus:border-lime-700" />
        <button onClick={onDelete} className="w-10 h-10 rounded-lg border-2 border-stone-200 flex items-center justify-center shrink-0">
          <X size={14} className="text-stone-500" />
        </button>
      </div>
      {o.srcId && (
        <div className="mb-2 text-[9px] font-bold px-1.5 py-1 rounded inline-flex items-center gap-1"
          style={{ backgroundColor: G_PALE, color: G_DARK }}>
          <PenLine size={9} /> Issue du croquis{o.position ? ` · ${o.position}` : ""}
        </div>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        <NumField label="Largeur" value={o.L} onChange={(v) => set("L", v)} suffix="m" invalid={n(o.L) < 0} wide />
        <NumField label="Hauteur" value={o.H} onChange={(v) => set("H", v)} suffix="m" invalid={n(o.H) < 0} wide />
        <NumField label="Quantité" value={o.qte} onChange={(v) => set("qte", v)} suffix="×" wide />
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="font-mono text-[11px]">
          <span className="text-stone-400">Surface </span>
          <b style={{ color: G_DARK }}>{fmt(c.surface)} m²</b>
          {c.retours > 0 && <span className="text-stone-400 ml-2">Retours <b style={{ color: G_MID }}>{fmt(c.retours)} m²</b></span>}
        </span>
        <button onClick={() => setOpen(!open)} className="h-8 px-2 rounded-lg text-[10px] font-bold border-2 border-stone-200 flex items-center gap-1">
          {nbDed}/{LOTS_DEDUC.length} déductions <ChevronDown size={12} className={open ? "rotate-180" : ""} />
        </button>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t-2 border-stone-100 space-y-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Déduire de</div>
            <div className="grid grid-cols-2 gap-x-2">
              {LOTS_DEDUC.map((l) => (
                <Toggle key={l.k} small label={l.label} checked={!!o.deductions?.[l.k]} onChange={(v) => setD(l.k, v)} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <NumField label="Larg. au sol (plinthes)" value={o.largeurAuSol} onChange={(v) => set("largeurAuSol", v)} suffix="m" wide />
            <NumField label="Prof. tableau" value={o.profTableau} onChange={(v) => set("profTableau", v)} suffix="m" wide />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Retours à traiter</div>
            <div className="grid grid-cols-2 gap-x-2">
              {RETOURS.map((r) => (
                <Toggle key={r.k} small label={r.label} checked={!!o.retours?.[r.k]} onChange={(v) => setR(r.k, v)} />
              ))}
            </div>
          </div>
          <input value={o.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Observations"
            className="w-full h-10 px-2.5 rounded-lg border-2 border-stone-200 text-sm focus:outline-none focus:border-lime-700" />
        </div>
      )}
    </div>
  );
}

/* ---- Module Électricité : lignes détaillées + boutons rapides ---- */
function ElecLigne({ l, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const cat = ELEC_CAT.find((c) => c.id === l.type) || ELEC_CAT[0];
  const set = (k, v) => onChange({ ...l, [k]: v });
  const q = Math.max(0, n(l.qte));
  return (
    <div className="rounded-lg border-2 p-1.5" style={{ borderColor: q > 0 ? G_LIGHT : "#F5F5F4" }}>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <div className={`text-xs truncate ${q > 0 ? "font-bold text-stone-900" : "text-stone-500"}`}>
            {l.libelle || cat.label}
          </div>
          <div className="text-[9px] text-stone-400 truncate">
            {[l.etat, l.pose, l.emplacement, l.hauteur, l.circuit, l.puissance].filter(Boolean).join(" · ") || "Aucun détail"}
            {cat.socles > 1 && q > 0 && (
              <span style={{ color: G_MID }}> · {q * cat.socles} socles</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => set("qte", String(Math.max(0, q - 1)))}
            className="w-9 h-9 rounded-lg border-2 border-stone-300 flex items-center justify-center active:bg-stone-100">
            <Minus size={13} className="text-stone-600" />
          </button>
          <input inputMode="numeric" value={l.qte ?? ""} onChange={(e) => set("qte", e.target.value)}
            className="w-10 h-9 px-0 rounded-lg border-2 border-stone-300 font-mono font-bold text-center text-sm" />
          <button onClick={() => set("qte", String(q + 1))}
            className="w-9 h-9 rounded-lg border-2 flex items-center justify-center active:brightness-95"
            style={{ backgroundColor: G_PALE, borderColor: G_LIGHT }}>
            <Plus size={13} style={{ color: G_DARK }} />
          </button>
          <button onClick={() => setOpen(!open)} className="w-8 h-9 flex items-center justify-center">
            <ChevronDown size={14} className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-2 pt-2 border-t border-stone-100 space-y-2">
          {l.type === "perso" && (
            <input value={l.libelle ?? ""} onChange={(e) => set("libelle", e.target.value)}
              placeholder="Désignation de l'élément"
              className="w-full h-9 px-2 rounded-lg border-2 border-stone-300 text-sm" />
          )}
          <div>
            <div className="text-[9px] font-bold uppercase text-stone-400 mb-1">État</div>
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {ETATS_EQUIP.map((e) => (
                <button key={e} onClick={() => set("etat", l.etat === e ? "" : e)}
                  className="h-7 px-1.5 rounded text-[9px] font-bold border shrink-0"
                  style={l.etat === e ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase text-stone-400 mb-1">Pose</div>
            <div className="flex gap-1">
              {ELEC_POSES.map((p) => (
                <button key={p} onClick={() => set("pose", l.pose === p ? "" : p)}
                  className="h-7 px-1.5 rounded text-[9px] font-bold border shrink-0"
                  style={l.pose === p ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <label>
              <span className="text-[9px] font-bold uppercase text-stone-400">Emplacement</span>
              <input list="elec-empl" value={l.emplacement ?? ""} onChange={(e) => set("emplacement", e.target.value)}
                className="w-full h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px]" />
            </label>
            <label>
              <span className="text-[9px] font-bold uppercase text-stone-400">Hauteur de pose</span>
              <input list="elec-haut" value={l.hauteur ?? ""} onChange={(e) => set("hauteur", e.target.value)}
                className="w-full h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px]" />
            </label>
            <label>
              <span className="text-[9px] font-bold uppercase text-stone-400">Circuit</span>
              <input value={l.circuit ?? ""} onChange={(e) => set("circuit", e.target.value)}
                placeholder="Ex. C4 — prises séjour"
                className="w-full h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px]" />
            </label>
            <label>
              <span className="text-[9px] font-bold uppercase text-stone-400">Puissance</span>
              <input value={l.puissance ?? ""} onChange={(e) => set("puissance", e.target.value)}
                placeholder={cat.defP || "—"}
                className="w-full h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px]" />
            </label>
          </div>
          <input value={l.obs ?? ""} onChange={(e) => set("obs", e.target.value)} placeholder="Observations"
            className="w-full h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px]" />
          <button onClick={onDelete} className="w-full h-8 rounded-lg border-2 border-red-200 text-[10px] font-bold text-red-600 flex items-center justify-center gap-1">
            <Trash2 size={11} /> Retirer cette ligne
          </button>
        </div>
      )}
    </div>
  );
}

function ElecBlock({ room, update, c }) {
  const lignes = room.elec || [];
  const setL = (v) => update({ ...room, elec: v });
  const ajouter = (type) => {
    const cat = ELEC_CAT.find((x) => x.id === type);
    setL([...lignes, {
      id: uid(), type, libelle: "", qte: "1", etat: "À créer", pose: "Encastré",
      emplacement: "", hauteur: "", circuit: "", puissance: cat?.defP || "", obs: "",
    }]);
  };
  const total = lignes.reduce((s, l) => s + Math.max(0, n(l.qte)), 0);

  const resume = [
    { l: "Prises (appareillages)", v: c.nbPrises, fort: true },
    { l: "— dont simples", v: c.nbPriseSimple },
    { l: "— dont doubles", v: c.nbPriseDouble },
    { l: "— dont triples", v: c.nbPriseTriple },
    { l: "Socles de prise (info)", v: c.nbSocles, info: true },
    { l: "Interrupteurs", v: c.nbInter, fort: true },
    { l: "— dont simples", v: c.nbInterSimple },
    { l: "— dont doubles", v: c.nbInterDouble },
    { l: "— dont triples", v: c.nbInterTriple },
    { l: "Points lumineux", v: c.nbPoints, fort: true },
    { l: "Spots", v: c.nbSpots, fort: true },
    { l: "Prises RJ45", v: c.nbRJ45, fort: true },
    { l: "Équipements spécialisés", v: c.nbSpec, fort: true },
    { l: "Courant faible", v: c.nbFaible },
  ];

  return (
    <Section title="Électricité" badge={total} accent>
      <datalist id="elec-empl">{ELEC_EMPLACEMENTS.map((x) => <option key={x} value={x} />)}</datalist>
      <datalist id="elec-haut">{ELEC_HAUTEURS.map((x) => <option key={x} value={x} />)}</datalist>

      <div className="space-y-1.5 mb-2">
        {lignes.length === 0 && (
          <p className="text-[11px] text-stone-400 text-center py-3">
            Ajoutez les appareillages relevés dans la pièce.
          </p>
        )}
        {lignes.map((l) => (
          <ElecLigne key={l.id} l={l}
            onChange={(nl) => setL(lignes.map((x) => (x.id === nl.id ? nl : x)))}
            onDelete={() => setL(lignes.filter((x) => x.id !== l.id))} />
        ))}
      </div>

      <div className="text-[9px] font-bold uppercase text-stone-400 mb-1">Ajout rapide</div>
      <div className="flex flex-wrap gap-1 mb-3">
        {ELEC_CAT.map((cat) => (
          <button key={cat.id} onClick={() => ajouter(cat.id)}
            className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-dashed border-stone-300 text-stone-600 active:bg-lime-50">
            + {cat.label}
          </button>
        ))}
        <button onClick={() => ajouter("perso")}
          className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-dashed" style={{ borderColor: G_LIGHT, color: G_DARK }}>
          + Élément personnalisé
        </button>
      </div>

      <div className="rounded-xl border-2 p-2.5" style={{ borderColor: G_LIGHT, backgroundColor: G_PALE }}>
        <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G_DARK }}>
          Résumé électricité de la pièce
        </div>
        {resume.map((r) => (
          <div key={r.l} className="flex items-center justify-between py-0.5">
            <span className={`text-[11px] ${r.fort ? "font-bold text-stone-800" : r.info ? "text-stone-400 italic" : "text-stone-500"}`}>{r.l}</span>
            <span className="font-mono text-[12px] font-bold" style={{ color: r.info ? "#A8A29E" : r.v > 0 ? G_DARK : "#D6D3D1" }}>
              {fmt(r.v, 0)}
            </span>
          </div>
        ))}
        <p className="text-[8px] text-stone-500 mt-1 leading-snug">
          Une prise double compte pour <b>1 appareillage</b> ; les socles sont indiqués séparément à titre informatif.
        </p>
      </div>
    </Section>
  );
}

function EquipBlock({ fam, room, update }) {
  const def = EQUIPEMENTS[fam];
  const eq = room.equipements?.[fam] || {};
  const set = (item, k, v) => update({
    ...room,
    equipements: { ...room.equipements, [fam]: { ...eq, [item]: { ...(eq[item] || {}), [k]: v } } },
  });
  const nb = Object.values(eq).filter((x) => x && n(x.qte) > 0).length;
  return (
    <Section title={def.label} badge={nb}>
      <div className="space-y-1.5">
        {def.items.map((it) => {
          const v = eq[it] || {};
          const on = n(v.qte) > 0;
          return (
            <div key={it} className="rounded-lg border-2 p-1.5" style={{ borderColor: on ? G_LIGHT : "#F5F5F4" }}>
              <div className="flex items-center gap-1.5">
                <span className={`flex-1 text-xs truncate ${on ? "font-bold text-stone-900" : "text-stone-500"}`}>{it}</span>
                <input inputMode="numeric" value={v.qte ?? ""} onChange={(e) => set(it, "qte", e.target.value)} placeholder="0"
                  className="w-[52px] h-9 px-1 rounded-lg border-2 border-stone-300 font-mono font-bold text-center text-sm" />
              </div>
              {on && (
                <div className="mt-1.5 flex gap-1 overflow-x-auto pb-0.5">
                  {ETATS_EQUIP.map((e) => (
                    <button key={e} onClick={() => set(it, "etat", v.etat === e ? "" : e)}
                      className="h-7 px-1.5 rounded text-[9px] font-bold border shrink-0"
                      style={v.etat === e ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------- */

export function RoomScreen({ room, update, openSketch, onPrev, onNext, hasPrev, hasNext, toast, visite }) {
  const [tab, setTab] = useState("metre");
  const [tousLots, setTousLots] = useState(false);
  const [ajoutLot, setAjoutLot] = useState(false);
  const c = useMemo(() => calcRoom(room), [room]);
  const errs = useMemo(() => validateRoom(room), [room]);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const setPart = (k, v) => update({ ...room, [k]: v });
  const setQ = (k, v) => update({ ...room, q: { ...(room.q || {}), [k]: v } });
  const validerTout = () => {
    try {
      // On construit l'intégralité du résultat AVANT de toucher à l'état :
      // en cas d'échec, rien n'est écrit et la pièce reste dans son état d'origine.
      const next = { ...(room.q || {}) };
      let n0 = 0;
      const rejets = [];

      c.quantites.forEach((x) => {
        if (x.mode !== AUTO) return;              // une valeur déjà validée ou modifiée est conservée
        if (!Number.isFinite(x.calc) || x.calc <= 0) return;
        const v = qValider(x.calc);
        if (v === null) { rejets.push(x.label); return; }
        next[x.k] = v;
        n0++;
      });

      if (rejets.length) console.warn("[BRN] Quantités non validables :", rejets.join(", "));
      if (!n0) { toast("Aucun métré à valider"); return; }

      update({ ...room, q: next });
      toast("Métrés de la pièce validés");
    } catch (e) {
      console.error("[BRN] Échec de la validation des métrés de la pièce");
      console.error("[BRN] Pièce :", room?.nom, "| id :", room?.id);
      console.error("[BRN] Erreur :", e);
      toast("Validation impossible — aucune donnée modifiée");
    }
  };

  /* ---- photos ---- */
  const addPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    const out = [];
    for (const f of files) {
      try {
        const blob = await compressImage(f);
        const key = await Store.putBlob(blob);
        out.push({ id: uid(), blobKey: key, legende: "", inclure: true });
      } catch (err) { toast(err.message); }
    }
    setBusy(false);
    if (out.length) update({ ...room, photos: [...room.photos, ...out] });
  };
  const movePhoto = (i, d) => {
    const p = [...room.photos];
    const j = i + d;
    if (j < 0 || j >= p.length) return;
    [p[i], p[j]] = [p[j], p[i]];
    update({ ...room, photos: p });
  };

  /* ---- travaux ---- */
  const toggleT = (lot, item) => {
    const cur = room.travaux[item.id];
    if (cur?.on) update({ ...room, travaux: { ...room.travaux, [item.id]: { ...cur, on: false } } });
    else update({
      ...room, travaux: {
        ...room.travaux,
        [item.id]: {
          on: true, label: item.label, unit: item.unit, autoKey: item.auto || null,
          lot: lot.id, lotNom: lot.nom, retenu: "", intervention: "Fourniture et pose",
          materiau: "", reference: "", obs: "",
        },
      },
    });
  };
  const setT = (id, k, v) => update({ ...room, travaux: { ...room.travaux, [id]: { ...room.travaux[id], [k]: v } } });

  /* --- Profil métier : c'est lui qui décide de ce qui est pertinent --- */
  const profil = profilDe(room);
  const TABS_DISPO = {
    metre: { id: "metre", label: "Métré", Icon: Ruler },
    facade: { id: "facade", label: "Façade", Icon: Building2 },
    cuisine: { id: "cuisine", label: "Cuisine", Icon: ChefHat },
    travaux: { id: "travaux", label: "Travaux", Icon: ListChecks },
    medias: { id: "medias", label: "Médias", Icon: Camera },
    notes: { id: "notes", label: "Notes", Icon: PenLine },
  };
  const tabs = profil.onglets.map((k) => TABS_DISPO[k]).filter(Boolean);

  /* Si l'onglet courant n'existe pas dans ce profil, on retombe sur le premier. */
  const tabActif = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;

  const voir = (k) => sectionVisible(room, k);
  const modLots = (room.modules || []).map((m) => EQUIPEMENTS[m]).filter(Boolean);

  return (
    <div className="pb-24">
      <div className="sticky top-[56px] z-20 bg-stone-100 px-2 pt-2 pb-2 border-b-2 border-stone-200">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1 text-[11px] font-bold"
              style={tabActif === t.id ? { backgroundColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", color: "#57534E", border: "2px solid #E7E5E4" }}>
              <t.Icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tabActif === "metre" && (
        <div className="p-3 space-y-3">
          <div className="rounded-2xl bg-white border-2 border-stone-200 p-3 space-y-2">
            <input value={room.nom} onChange={(e) => setPart("nom", e.target.value)}
              className="w-full h-11 px-3 rounded-xl border-2 border-stone-200 font-bold text-base focus:border-lime-700 focus:outline-none" />
            <div className="flex gap-1">
              {["Sous-sol", "RDC", "R+1", "R+2", "Combles"].map((nv) => (
                <button key={nv} onClick={() => setPart("niveau", nv)}
                  className="flex-1 h-9 rounded-lg text-[10px] font-bold border-2"
                  style={room.niveau === nv ? { backgroundColor: G_DARK, color: "#fff", borderColor: G_DARK } : { backgroundColor: "#fff", color: "#78716C", borderColor: "#E7E5E4" }}>
                  {nv}
                </button>
              ))}
            </div>
          </div>

          <Readout c={c} />

          <div className="rounded-2xl bg-white border-2 p-2.5" style={{ borderColor: c.nbPerimes ? "#EF4444" : G_LIGHT }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-stone-600">Métrés de la pièce</span>
              <span className="text-[9px] font-mono text-stone-400">
                {c.quantites.filter((x) => x.mode !== AUTO).length}/{c.quantites.filter((x) => x.calc > 0).length} validés
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {c.quantites.filter((x) => x.calc > 0).map((x) => (
                <span key={x.k} className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                  style={x.perime ? { backgroundColor: "#FEE2E2", color: "#B91C1C" }
                    : x.mode === AUTO ? { backgroundColor: G_PALE, color: G_DARK }
                    : x.mode === VALIDE ? { backgroundColor: "#DCFCE7", color: "#15803D" }
                    : { backgroundColor: "#FEF3C7", color: "#92400E" }}>
                  {x.perime ? "⚠" : x.mode === AUTO ? "○" : "✓"} {x.label} {fmt(x.val, x.unit === "u" ? 0 : 2)}
                </span>
              ))}
            </div>
            {c.nbPerimes > 0 && (
              <p className="text-[10px] text-red-800 mb-2">
                {c.nbPerimes} quantité(s) figée(s) alors que les dimensions ont changé — vos valeurs sont conservées.
              </p>
            )}
            <Btn variant="soft" onClick={validerTout} disabled={!c.nbAValider} className="w-full min-h-[42px]">
              <Check size={16} /> Valider tous les métrés calculés {c.nbAValider ? `(${c.nbAValider})` : ""}
            </Btn>
          </div>

          {errs.length > 0 && (
            <div className="rounded-xl p-2 space-y-1" style={{ backgroundColor: errs.some((e) => e.lvl === "err") ? "#FEE2E2" : "#FEF3C7" }}>
              {errs.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle size={11} className={`mt-0.5 shrink-0 ${e.lvl === "err" ? "text-red-700" : "text-amber-700"}`} />
                  <span className={`text-[10px] ${e.lvl === "err" ? "text-red-900" : "text-amber-900"}`}>{e.txt}</span>
                </div>
              ))}
            </div>
          )}

          {voir("zones") && (
            <Section title="Zones" defaultOpen badge={room.zones.length}>
            {room.zones.map((z, i) => (
              <ZoneCard key={z.id} z={z} i={i} canDelete={room.zones.length > 1}
                onChange={(nz) => setPart("zones", room.zones.map((x) => (x.id === nz.id ? nz : x)))}
                onDelete={() => setPart("zones", room.zones.filter((x) => x.id !== z.id))} />
            ))}
            <div className="flex gap-1.5 flex-wrap mb-2">
              {PRESETS_ZONE.slice(1).map((p) => (
                <button key={p} onClick={() => setPart("zones", [...room.zones, { ...newZone(p), H: room.zones[0]?.H || "2.50", deduire: p === "Trémie" }])}
                  className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-stone-200 text-stone-500">+ {p}</button>
              ))}
            </div>
            <Btn variant="soft" onClick={() => setPart("zones", [...room.zones, { ...newZone(`Zone ${room.zones.length + 1}`), H: room.zones[0]?.H || "2.50" }])} className="w-full">
              <Plus size={18} /> Ajouter une zone
            </Btn>
          </Section>
          )}

          {voir("ouvertures") && (
            <Section title="Ouvertures" badge={room.ouvertures.length}>
            {room.ouvertures.map((o) => (
              <OuvCard key={o.id} o={o}
                onChange={(no) => setPart("ouvertures", room.ouvertures.map((x) => (x.id === no.id ? no : x)))}
                onDelete={() => setPart("ouvertures", room.ouvertures.filter((x) => x.id !== o.id))} />
            ))}
            <div className="flex gap-1.5 flex-wrap">
              {["Porte", "Fenêtre", "Baie vitrée", "Passage ouvert"].map((t) => (
                <button key={t} onClick={() => setPart("ouvertures", [...room.ouvertures, newOuverture(t)])}
                  className="flex-1 h-10 rounded-lg text-[10px] font-bold border-2 border-dashed border-stone-300 text-stone-600">+ {t}</button>
              ))}
            </div>
          </Section>
          )}

          {voir("murs") && (
            <Section title="Murs" accent>
            <div className="space-y-2">
              <div className="rounded-xl border-2 border-stone-100 p-2.5">
                <Line k="Surface brute (périmètre × hauteur)" v={fmt(c.mursBrut)} u="m²" />
                <Line k="Ouvertures déduites" v={fmt(c.ded.murs)} u="m²" neg />
                <Line k="Retours / tableaux traités" v={fmt(c.retoursTotal)} u="m²" />
                <div className="border-t border-stone-100 mt-1 pt-1">
                  <Line k="Surface nette" v={fmt(c.mursNet)} u="m²" strong />
                </div>
              </div>
              <Toggle label="Ajouter les retours au métré des murs" checked={room.murs?.traiterRetours !== false}
                onChange={(v) => setPart("murs", { ...room.murs, traiterRetours: v })} />
              <QtyBox titre="Murs" calcule={c.mursNet} propose={c.mursNet} unit="m²"
                origine="Brut − ouvertures + retours"
                q={room.q?.murs} onQ={(v) => setQ("murs", v)} />
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { k: "Peinture", v: c.peintureMurs }, { k: "Enduit", v: c.enduitNet },
                  { k: "Doublage", v: c.doublageNet }, { k: "Isolation", v: c.isolationNet },
                  { k: "Papier peint", v: c.papierNet }, { k: "Tableaux", v: c.tableauxTotal },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg bg-stone-50 px-2 py-1.5">
                    <div className="text-[9px] uppercase font-bold text-stone-400">{x.k}</div>
                    <div className="font-mono font-bold text-xs" style={{ color: G_DARK }}>{fmt(x.v)} m²</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          )}

          {voir("sol") && (
            <Section title="Sol" accent>
            <div className="space-y-2">
              <Chips label="Revêtement" value={room.sol?.revetement} onChange={(v) => setPart("sol", { ...room.sol, revetement: v })} options={REVETEMENTS} />
              {room.sol?.revetement === "Autre" && (
                <Field label="Préciser le revêtement" value={room.sol?.revetementAutre ?? ""}
                  onChange={(v) => setPart("sol", { ...room.sol, revetementAutre: v })}
                  placeholder="Ex. Tomettes anciennes, jonc de mer…"
                  hint="Ce texte nomme les postes du lot Revêtements de sol et apparaît dans le rapport." />
              )}
              <div className="rounded-xl border-2 border-stone-100 p-2.5">
                <Line k="Surface brute (zones ajoutées)" v={fmt(c.solBrut)} u="m²" />
                <Line k="Zones déduites / trémies" v={fmt(c.solDeduit)} u="m²" neg />
                <Line k="Zones non traitées" v={fmt(c.solNonTraite)} u="m²" neg />
                <div className="border-t border-stone-100 mt-1 pt-1"><Line k="Surface nette" v={fmt(c.solNet)} u="m²" strong /></div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Le revêtement passe sous</div>
                <div className="grid grid-cols-2 gap-x-2">
                  {OPTIONS_SOL.map((o) => (
                    <Toggle key={o.k} small label={o.label} checked={!!room.sol?.options?.[o.k]}
                      onChange={(v) => setPart("sol", { ...room.sol, options: { ...room.sol.options, [o.k]: v } })} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Zones non traitées</div>
                <DynList items={room.sol?.nonTraitees} onChange={(v) => setPart("sol", { ...room.sol, nonTraitees: v })}
                  labelPlaceholder="Ex. sous cuisine" addLabel="Ajouter une zone non traitée" />
              </div>
              <QtyBox titre={`Sol — ${room.sol?.revetement || "revêtement"}`} calcule={c.solNet} marge={room.sol?.marge}
                onMarge={(m) => setPart("sol", { ...room.sol, marge: m })} marges propose={c.solProposee}
                unit="m²" origine="Surface nette + marge de découpe"
                q={room.q?.sol} onQ={(v) => setQ("sol", v)} />
            </div>
          </Section>
          )}

          {voir("plafond") && (
            <Section title="Plafond" accent>
            <div className="space-y-2">
              <Chips label="Traitement" value={room.plafond?.mode} onChange={(v) => setPart("plafond", { ...room.plafond, mode: v })} options={MODES_PLAFOND} />
              <div className="rounded-xl border-2 border-stone-100 p-2.5">
                <Line k="Surface brute (= sol)" v={fmt(c.plafondBrut)} u="m²" />
                <Line k="Zones ajoutées" v={fmt(c.pfAjout)} u="m²" />
                <Line k="Zones déduites" v={fmt(c.pfDeduit)} u="m²" neg />
                <div className="border-t border-stone-100 mt-1 pt-1"><Line k="Surface nette" v={fmt(c.plafondNet)} u="m²" strong /></div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Ajouts (rampants, caissons, soffites)</div>
              <DynList items={room.plafond?.ajouts} onChange={(v) => setPart("plafond", { ...room.plafond, ajouts: v })}
                labelPlaceholder="Ex. rampant" addLabel="Ajouter" />
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Déductions (trémies, niches)</div>
              <DynList items={room.plafond?.deductions} onChange={(v) => setPart("plafond", { ...room.plafond, deductions: v })}
                labelPlaceholder="Ex. trémie" addLabel="Déduire" />
              <QtyBox titre="Plafond" calcule={c.plafondNet} propose={c.plafondNet} unit="m²"
                origine="Sol + ajouts − déductions"
                q={room.q?.plafond} onQ={(v) => setQ("plafond", v)} />
            </div>
          </Section>
          )}

          {voir("plinthes") && (
            <Section title="Plinthes" accent>
            <div className="space-y-2">
              <div className="rounded-xl border-2 border-stone-100 p-2.5">
                <Line k="Périmètre brut" v={fmt(c.plinthesBrut)} u="ml" />
                <Line k="Déduction portes / passages" v={fmt(c.dedPlinthesOuv)} u="ml" neg />
                <Line k="Autres déductions (meubles…)" v={fmt(c.dedPlinthesManu)} u="ml" neg />
                <div className="border-t border-stone-100 mt-1 pt-1"><Line k="Longueur nette" v={fmt(c.plinthesNet)} u="ml" strong /></div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Zones sans plinthe</div>
              <DynList items={room.plinthes?.deductions} onChange={(v) => setPart("plinthes", { ...room.plinthes, deductions: v })}
                labelPlaceholder="Ex. meubles bas cuisine" unit="ml" addLabel="Ajouter une déduction" />
              <QtyBox titre="Plinthes" calcule={c.plinthesNet} marge={room.plinthes?.marge}
                onMarge={(m) => setPart("plinthes", { ...room.plinthes, marge: m })} marges propose={c.plinthesProposee}
                unit="ml" origine="Périmètre − déductions + marge"
                q={room.q?.plinthes} onQ={(v) => setQ("plinthes", v)} />
            </div>
          </Section>
          )}

          {voir("faience") && (
            <Section title="Faïence" badge={(room.faience || []).length}>
            <div className="space-y-2">
              {(room.faience || []).map((f, i) => {
                const setF = (k, v) => setPart("faience", room.faience.map((x) => (x.id === f.id ? { ...x, [k]: v } : x)));
                const surf = n(f.longueur) * n(f.hauteur) * Math.max(1, n(f.nbMurs) || 1);
                return (
                  <div key={f.id} className="rounded-xl border-2 border-stone-200 p-2.5">
                    <div className="flex gap-1.5 mb-2">
                      <input value={f.mur} onChange={(e) => setF("mur", e.target.value)} placeholder={`Zone faïence ${i + 1}`}
                        className="flex-1 h-10 px-2.5 rounded-lg border-2 border-stone-300 text-sm font-bold focus:outline-none focus:border-lime-700" />
                      <button onClick={() => setPart("faience", room.faience.filter((x) => x.id !== f.id))}
                        className="w-10 h-10 rounded-lg border-2 border-stone-200 flex items-center justify-center"><X size={14} className="text-stone-500" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <NumField label="Longueur" value={f.longueur} onChange={(v) => setF("longueur", v)} suffix="m" wide />
                      <NumField label="Haut. pose" value={f.hauteur} onChange={(v) => setF("hauteur", v)} suffix="m" wide />
                      <NumField label="Nb murs" value={f.nbMurs} onChange={(v) => setF("nbMurs", v)} suffix="×" wide />
                    </div>
                    <div className="mt-1.5 font-mono text-[11px]"><span className="text-stone-400">Brut </span><b style={{ color: G_DARK }}>{fmt(surf)} m²</b></div>
                    <div className="mt-2 text-[9px] font-bold uppercase text-stone-400">Déductions (portes, fenêtres, tablier…)</div>
                    <DynList items={f.deductions} onChange={(v) => setF("deductions", v)} labelPlaceholder="Ex. porte" addLabel="Déduire" />
                    <div className="mt-1.5 text-[9px] font-bold uppercase text-stone-400">Ajouts (niche, retour, coffrage…)</div>
                    <DynList items={f.ajouts} onChange={(v) => setF("ajouts", v)} labelPlaceholder="Ex. niche" addLabel="Ajouter" />
                  </div>
                );
              })}
              <Btn variant="soft" onClick={() => setPart("faience", [...(room.faience || []), { id: uid(), mur: "", longueur: "", hauteur: "2.00", nbMurs: "1", deductions: [], ajouts: [] }])} className="w-full">
                <Plus size={18} /> Ajouter une zone de faïence
              </Btn>
              {(room.faience || []).length > 0 && (
                <>
                  <div className="rounded-xl border-2 border-stone-100 p-2.5">
                    <Line k="Surface brute" v={fmt(c.faienceBrut)} u="m²" />
                    <Line k="Déductions" v={fmt(c.faienceDed)} u="m²" neg />
                    <Line k="Ajouts" v={fmt(c.faienceAjout)} u="m²" />
                    <div className="border-t border-stone-100 mt-1 pt-1"><Line k="Surface nette" v={fmt(c.faienceNet)} u="m²" strong /></div>
                  </div>
                  <QtyBox titre="Faïence" calcule={c.faienceNet} marge={room.faienceMarge}
                    onMarge={(m) => setPart("faienceMarge", m)} marges propose={c.faienceProposee}
                    unit="m²" origine="Brut − déductions + ajouts + marge"
                    q={room.q?.faience} onQ={(v) => setQ("faience", v)} />
                </>
              )}
            </div>
          </Section>
          )}

          {voir("doublages") && (
            <Section title="Doublage / cloisons / isolation" badge={(room.doublages || []).length}>
            <div className="space-y-2">
              {(room.doublages || []).map((d, i) => {
                const setD = (k, v) => setPart("doublages", room.doublages.map((x) => (x.id === d.id ? { ...x, [k]: v } : x)));
                return (
                  <div key={d.id} className="rounded-xl border-2 border-stone-200 p-2.5">
                    <div className="flex gap-1.5 mb-2">
                      <input value={d.nom} onChange={(e) => setD("nom", e.target.value)} placeholder={`Ouvrage ${i + 1}`}
                        className="flex-1 h-10 px-2.5 rounded-lg border-2 border-stone-300 text-sm font-bold focus:outline-none focus:border-lime-700" />
                      <button onClick={() => setPart("doublages", room.doublages.filter((x) => x.id !== d.id))}
                        className="w-10 h-10 rounded-lg border-2 border-stone-200 flex items-center justify-center"><X size={14} className="text-stone-500" /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <NumField label="Longueur" value={d.longueur} onChange={(v) => setD("longueur", v)} suffix="m" wide />
                      <NumField label="Hauteur" value={d.hauteur} onChange={(v) => setD("hauteur", v)} suffix="m" wide />
                      <NumField label="Faces" value={d.faces} onChange={(v) => setD("faces", v)} suffix="×" wide />
                      <NumField label="Épaisseur" value={d.epaisseur} onChange={(v) => setD("epaisseur", v)} suffix="mm" wide />
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <Chips label="Plaque" value={d.plaque} onChange={(v) => setD("plaque", v)} options={PLAQUES.map((p) => ({ v: p.id, l: p.label }))} />
                      <Chips label="Ossature" value={d.ossature} onChange={(v) => setD("ossature", v)} options={OSSATURES} />
                      <div className="flex items-center gap-2">
                        <Chips label="Entraxe" value={String(d.entraxe || 60)} onChange={(v) => setD("entraxe", v)} options={ENTRAXES.map((e) => String(e))} />
                        <div className="pt-4"><Toggle small label="Isolation" checked={!!d.isolation} onChange={(v) => setD("isolation", v)} /></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Btn variant="soft" onClick={() => setPart("doublages", [...(room.doublages || []), { id: uid(), nom: "", longueur: "", hauteur: room.zones[0]?.H || "2.50", faces: "1", epaisseur: "", plaque: "ba13", ossature: "Rails 48", entraxe: 60, isolation: true }])} className="w-full">
                <Plus size={18} /> Ajouter un doublage / une cloison
              </Btn>
              {(room.doublages || []).length > 0 && (
                <div className="rounded-xl border-2 p-2.5" style={{ borderColor: G_LIGHT, backgroundColor: G_PALE }}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: G_DARK }}>
                    Estimation des besoins — indicative, à ajuster
                  </div>
                  <Line k="Surface de plaques" v={fmt(c.materiaux.plaquesM2)} u="m²" />
                  <Line k="Nombre de plaques" v={fmt(c.materiaux.plaquesNb, 0)} u="u" />
                  <Line k="Rails" v={fmt(c.materiaux.rails)} u="ml" />
                  <Line k="Montants" v={fmt(c.materiaux.montants)} u="ml" />
                  <Line k="Fourrures" v={fmt(c.materiaux.fourrures)} u="ml" />
                  <Line k="Suspentes" v={fmt(c.materiaux.suspentes, 0)} u="u" />
                  <Line k="Isolant" v={fmt(c.materiaux.isolant)} u="m²" />
                  <Line k="Bandes" v={fmt(c.materiaux.bandes)} u="ml" />
                  <Line k="Enduit à bandes" v={fmt(c.materiaux.enduitKg)} u="kg" />
                  <Line k="Vis" v={fmt(c.materiaux.vis, 0)} u="u" />
                  <Line k="Cornières" v={fmt(c.materiaux.cornieres)} u="ml" />
                </div>
              )}
            </div>
          </Section>
          )}

          {voir("peinture") && (
            <Section title="Peinture / enduit">
            <div className="space-y-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Préparation</div>
                <div className="grid grid-cols-2 gap-x-2">
                  {PREPARATIONS.map((p) => (
                    <Toggle key={p} small label={p} checked={!!room.peinture?.preparation?.[p]}
                      onChange={(v) => setPart("peinture", { ...room.peinture, preparation: { ...room.peinture.preparation, [p]: v } })} />
                  ))}
                </div>
              </div>
              <Chips label="Nombre de couches" value={String(room.peinture?.couches || 2)}
                onChange={(v) => setPart("peinture", { ...room.peinture, couches: v })} options={["1", "2", "3"]} />
              <div className="rounded-xl border-2 border-stone-100 p-2.5">
                <Line k="Surface réelle du support (murs)" v={fmt(c.peintureMurs)} u="m²" strong />
                <Line k="Surface développée (× couches)" v={fmt(c.peintureDeveloppee)} u="m²" />
                <p className="text-[9px] text-stone-400 mt-1">
                  La surface développée sert à estimer les consommations et la main-d'œuvre — le poste de devis reste chiffré sur la surface réelle.
                </p>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-stone-500 mb-1">Supports concernés</div>
                <div className="space-y-1">
                  {SUPPORTS_PEINTURE.map((s) => {
                    const v = room.peinture?.supports?.[s.k] || {};
                    const on = !!v.on;
                    const auto = s.auto ? c[s.auto] || 0 : 0;
                    return (
                      <div key={s.k} className="flex items-center gap-1.5">
                        <div className="flex-1 min-w-0">
                          <Toggle small label={s.label} checked={on}
                            onChange={(x) => setPart("peinture", { ...room.peinture, supports: { ...room.peinture.supports, [s.k]: { ...v, on: x, qte: x && auto ? fmt(auto) : v.qte } } })} />
                        </div>
                        {on && (
                          <>
                            <input inputMode="decimal" value={v.qte ?? ""} placeholder={auto ? fmt(auto) : "0"}
                              onChange={(e) => setPart("peinture", { ...room.peinture, supports: { ...room.peinture.supports, [s.k]: { ...v, qte: e.target.value } } })}
                              className="w-[64px] h-9 px-1.5 rounded-lg border-2 border-stone-300 font-mono font-bold text-right text-xs" />
                            <span className="text-[9px] font-mono text-stone-400 w-5">{s.unit}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>
          )}

          {equipVisible(room, "elec") && <ElecBlock room={room} update={update} c={c} />}
          {equipVisible(room, "plomberie") && <EquipBlock fam="plomberie" room={room} update={update} />}
          {equipVisible(room, "chauffage") && <EquipBlock fam="chauffage" room={room} update={update} />}
          {equipVisible(room, "menuiseries") && <EquipBlock fam="menuiseries" room={room} update={update} />}
          {(room.modules || [])
            .filter((m) => equipVisible(room, m))
            .map((m) => <EquipBlock key={m} fam={m} room={room} update={update} />)}

          <Section title="Résumé de la pièce" accent defaultOpen>
            <div className="grid grid-cols-2 gap-x-3">
              <div>
                <Line k="Sol brut" v={fmt(c.solBrut)} u="m²" />
                <Line k="Sol net" v={fmt(c.solNet)} u="m²" strong />
                <Line k="Sol retenu" v={fmt(c.solRetenu)} u="m²" strong />
                <Line k="Plafond" v={fmt(c.plafondRetenu)} u="m²" />
                <Line k="Périmètre brut" v={fmt(c.plinthesBrut)} u="ml" />
                <Line k="Déduction plinthes" v={fmt(c.dedPlinthesOuv + c.dedPlinthesManu)} u="ml" neg />
                <Line k="Plinthes nettes" v={fmt(c.plinthesNet)} u="ml" />
                <Line k="Plinthes retenues" v={fmt(c.plinthesRetenu)} u="ml" strong />
                <Line k="Marge plinthes" v={fmt(c.margePl, 0)} u="%" />
              </div>
              <div>
                <Line k="Murs bruts" v={fmt(c.mursBrut)} u="m²" />
                <Line k="Ouvertures" v={fmt(c.ouvTotal)} u="m²" neg />
                <Line k="Tableaux" v={fmt(c.tableauxTotal)} u="m²" />
                <Line k="Murs nets" v={fmt(c.mursNet)} u="m²" strong />
                <Line k="Volume" v={fmt(c.volume)} u="m³" />
                <Line k="Portes / fenêtres" v={`${fmt(c.nbPortes, 0)} / ${fmt(c.nbFenetres, 0)}`} u="u" />
                <Line k="Radiateurs" v={fmt(c.nbRadiateurs, 0)} u="u" />
                <Line k="Prises" v={fmt(c.nbPrises, 0)} u="u" />
                <Line k="Photos" v={fmt(c.nbPhotos, 0)} u="" />
                <Line k="Points à vérifier" v={fmt(c.nbPointsAVerifier, 0)} u="" />
              </div>
            </div>
          </Section>
        </div>
      )}

      {tabActif === "facade" && (
        <div className="p-2 space-y-2.5">
          <FacadeBlock room={room} update={update} c={c} />
        </div>
      )}

      {tabActif === "cuisine" && (
        <div className="p-2 space-y-2.5">
          <CuisineBlock room={room} update={update} c={c} />
        </div>
      )}

      {tabActif === "travaux" && (
        <TravauxTab room={{ ...room, __calc: c }} update={update} visite={visite} toast={toast} />
      )}

      {tabActif === "medias" && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Btn onClick={() => fileRef.current?.click()} className="h-16" disabled={busy}>
              <Camera size={20} /> {busy ? "Traitement…" : "Photo"}
            </Btn>
            <Btn variant="ghost" onClick={() => openSketch(null)} className="h-16"><PenLine size={20} /> Croquis</Btn>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={addPhotos} className="hidden" />

          {room.sketches.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1.5">Croquis ({room.sketches.length})</div>
              <div className="grid grid-cols-2 gap-2">
                {room.sketches.map((s) => (
                  <div key={s.id} className="rounded-xl overflow-hidden border-2 border-stone-200 bg-white">
                    <div className="relative">
                      <button onClick={() => openSketch(s)} className="w-full block active:opacity-70">
                        <StoredImg blobKey={s.blobKey} className="w-full h-28 object-contain" />
                        <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: G_PALE, color: G_DARK }}>Modifier</span>
                      </button>
                      <button onClick={() => { if (s.blobKey) { Store.delBlob(s.blobKey); forgetUrl(s.blobKey); } update({ ...room, sketches: room.sketches.filter((x) => x.id !== s.id) }); }}
                        className="absolute top-1 right-1 w-8 h-8 rounded-lg bg-white/90 border-2 border-stone-200 flex items-center justify-center">
                        <Trash2 size={12} className="text-red-600" />
                      </button>
                    </div>
                    <input value={s.legende || ""} onChange={(e) => update({ ...room, sketches: room.sketches.map((x) => (x.id === s.id ? { ...x, legende: e.target.value } : x)) })}
                      placeholder="Légende" className="w-full h-8 px-2 text-[11px] border-t-2 border-stone-100 focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1.5">Photos ({room.photos.length})</div>
            {room.photos.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-stone-300 py-10 text-center">
                <ImageIcon size={24} className="text-stone-300 mx-auto mb-2" />
                <p className="text-[11px] text-stone-500">Vue d'ensemble, chaque mur, points singuliers.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {room.photos.map((p, i) => (
                  <div key={p.id} className="rounded-xl border-2 border-stone-200 bg-white overflow-hidden flex">
                    <StoredImg blobKey={p.blobKey} className="w-24 h-24 object-cover shrink-0" />
                    <div className="flex-1 min-w-0 p-2 flex flex-col justify-between">
                      <input value={p.legende} onChange={(e) => update({ ...room, photos: room.photos.map((x) => (x.id === p.id ? { ...x, legende: e.target.value } : x)) })}
                        placeholder="Légende" className="w-full h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px] focus:outline-none focus:border-lime-700" />
                      <div className="flex items-center gap-1">
                        <Toggle small label="Dans le rapport" checked={p.inclure !== false}
                          onChange={(v) => update({ ...room, photos: room.photos.map((x) => (x.id === p.id ? { ...x, inclure: v } : x)) })} />
                        <div className="flex-1" />
                        <button onClick={() => movePhoto(i, -1)} disabled={i === 0} className="w-8 h-8 rounded border-2 border-stone-200 flex items-center justify-center disabled:opacity-25"><ArrowUp size={11} /></button>
                        <button onClick={() => movePhoto(i, 1)} disabled={i === room.photos.length - 1} className="w-8 h-8 rounded border-2 border-stone-200 flex items-center justify-center disabled:opacity-25"><ArrowDown size={11} /></button>
                        <button onClick={() => { Store.delBlob(p.blobKey); forgetUrl(p.blobKey); update({ ...room, photos: room.photos.filter((x) => x.id !== p.id) }); }}
                          className="w-8 h-8 rounded border-2 border-stone-200 flex items-center justify-center"><Trash2 size={11} className="text-red-600" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tabActif === "notes" && (
        <div className="p-3 space-y-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Notes de la pièce — visibles sur le rapport</span>
            <textarea value={room.notes} onChange={(e) => setPart("notes", e.target.value)}
              placeholder="Observations, demandes du client, finitions attendues…"
              className="w-full h-32 p-3 rounded-2xl border-2 border-stone-200 bg-white focus:border-lime-700 focus:outline-none resize-none" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Notes internes — masquables sur le rapport</span>
            <textarea value={room.notesInternes} onChange={(e) => setPart("notesInternes", e.target.value)}
              placeholder="Réserves, aléas, marge à prendre…"
              className="w-full h-24 p-3 rounded-2xl border-2 bg-amber-50 focus:outline-none resize-none" style={{ borderColor: "#FCD34D" }} />
          </label>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1.5">Points à vérifier</div>
            <div className="space-y-1.5">
              {(room.pointsAVerifier || []).map((p) => (
                <div key={p.id} className="flex gap-1.5 items-center">
                  <button onClick={() => setPart("pointsAVerifier", room.pointsAVerifier.map((x) => (x.id === p.id ? { ...x, ok: !x.ok } : x)))}
                    className="w-9 h-9 rounded-lg border-2 flex items-center justify-center shrink-0"
                    style={p.ok ? { backgroundColor: G_DARK, borderColor: G_DARK } : { borderColor: "#D6D3D1" }}>
                    {p.ok && <Check size={14} className="text-white" />}
                  </button>
                  <input value={p.txt} onChange={(e) => setPart("pointsAVerifier", room.pointsAVerifier.map((x) => (x.id === p.id ? { ...x, txt: e.target.value } : x)))}
                    placeholder="Point à confirmer" className={`flex-1 h-9 px-2.5 rounded-lg border-2 border-stone-200 text-sm ${p.ok ? "line-through text-stone-400" : ""}`} />
                  <button onClick={() => setPart("pointsAVerifier", room.pointsAVerifier.filter((x) => x.id !== p.id))}
                    className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center shrink-0"><X size={13} className="text-stone-500" /></button>
                </div>
              ))}
              <button onClick={() => setPart("pointsAVerifier", [...(room.pointsAVerifier || []), { id: uid(), txt: "", ok: false }])}
                className="w-full h-10 rounded-lg border-2 border-dashed border-stone-300 text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1.5">
                <Plus size={14} /> Ajouter un point à vérifier
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-2 bg-white/95 backdrop-blur border-t-2 border-stone-200 flex gap-2">
        <Btn variant="ghost" onClick={onPrev} disabled={!hasPrev} className="flex-1 min-h-[46px]"><ChevronLeft size={18} /> Pièce préc.</Btn>
        <Btn variant="ghost" onClick={onNext} disabled={!hasNext} className="flex-1 min-h-[46px]">Pièce suiv. <ChevronLeft size={18} className="rotate-180" /></Btn>
      </div>
    </div>
  );
}
