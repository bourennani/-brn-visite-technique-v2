import { useState } from "react";
import { AlertTriangle, Calculator, Check, CheckCircle2, ChevronDown, PenLine, Plus, RotateCcw, X } from "lucide-react";
import { MANUEL, fmt, qAuto, qManuel, qMode, qPerime, qVal, qValider, uid } from "../lib/calc";
import { G_DARK, G_LIGHT, G_MID, G_PALE, INK, MARGES, n } from "../lib/catalogue";

/* ==================================================================== */
/*  MODULE 4 — PRIMITIVES UI                                            */
/* ==================================================================== */

export function Btn({ children, onClick, variant = "primary", className = "", disabled, ...p }) {
  const st = {
    primary: "text-white active:brightness-90",
    ghost: "bg-white text-stone-800 border-2 border-stone-300 active:bg-stone-100",
    danger: "bg-red-600 text-white active:brightness-90",
    soft: "border-2 active:brightness-95",
  };
  return (
    <button
      onClick={onClick} disabled={disabled}
      className={`min-h-[52px] px-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition disabled:opacity-40 ${st[variant]} ${className}`}
      style={
        variant === "primary" ? { backgroundColor: G_DARK }
          : variant === "soft" ? { backgroundColor: G_PALE, borderColor: G_LIGHT, color: G_DARK } : {}
      }
      {...p}
    >{children}</button>
  );
}

export function Field({ label, value, onChange, placeholder, type = "text", hint }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <input
        type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[48px] px-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 focus:border-lime-700 focus:outline-none"
      />
      {hint && <span className="text-[10px] text-stone-400">{hint}</span>}
    </label>
  );
}

export function NumField({ label, value, onChange, suffix, wide, invalid }) {
  return (
    <label className={`flex flex-col gap-1 ${wide ? "flex-1 min-w-0" : ""}`}>
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500 truncate">{label}</span>
      <div className="relative">
        <input
          inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="w-full h-[48px] px-3 pr-9 rounded-xl border-2 bg-white text-base font-mono font-semibold text-stone-900 focus:outline-none"
          style={{ borderColor: invalid ? "#DC2626" : "#D6D3D1" }}
          onFocus={(e) => (e.target.style.borderColor = invalid ? "#DC2626" : G_MID)}
          onBlur={(e) => (e.target.style.borderColor = invalid ? "#DC2626" : "#D6D3D1")}
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-stone-400">{suffix}</span>}
      </div>
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <select
        value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="w-full h-[48px] px-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 focus:border-lime-700 focus:outline-none"
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export function Zone({ label, value, onChange, placeholder, hint, rows = 4 }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <textarea
        value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className="w-full p-3 rounded-xl border-2 border-stone-300 bg-white text-stone-900 text-sm leading-snug focus:border-lime-700 focus:outline-none resize-y"
      />
      {hint && <span className="text-[10px] text-stone-400 leading-snug">{hint}</span>}
    </label>
  );
}

export function Chips({ label, value, onChange, options, cols = 4 }) {
  return (
    <div>
      {label && <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1.5">{label}</div>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.v;
          const l = typeof o === "string" ? o : o.l;
          const on = value === v;
          return (
            <button key={v} onClick={() => onChange(on ? "" : v)}
              className="min-h-[40px] px-3 rounded-lg text-xs font-bold border-2 transition"
              style={on ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}
            >{l}</button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange, small }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 ${small ? "min-h-[36px]" : "min-h-[44px]"} text-left w-full`}>
      <span className="w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0"
        style={checked ? { backgroundColor: G_DARK, borderColor: G_DARK } : { borderColor: "#D6D3D1" }}>
        {checked && <Check size={14} className="text-white" />}
      </span>
      <span className={`${small ? "text-[11px]" : "text-sm"} ${checked ? "font-bold text-stone-900" : "text-stone-600"}`}>{label}</span>
    </button>
  );
}

export function Section({ title, children, defaultOpen = false, badge, accent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white border-2 overflow-hidden" style={{ borderColor: accent ? G_LIGHT : "#E7E5E4" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full px-3 py-3 flex items-center justify-between min-h-[52px]"
        style={{ backgroundColor: accent ? G_PALE : "#FAFAF9" }}>
        <span className="text-xs font-bold uppercase tracking-wide text-left" style={{ color: accent ? G_DARK : "#57534E" }}>
          {title}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {badge != null && badge !== 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: G_MID }}>{badge}</span>
          )}
          <ChevronDown size={18} className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && <div className="p-3 border-t-2 border-stone-100">{children}</div>}
    </div>
  );
}

/* ---- Quantité pilotée : Calcul auto / Validé / Modifié manuellement ---- */
export function QtyBox({ titre, calcule, marge, propose, unit, origine, onMarge, marges, q, onQ }) {
  const mode = qMode(q);
  const val = qVal(q, propose);
  const perime = qPerime(q, propose);
  const st = {
    auto:   { l: "Calcul automatique", bg: "#EEF5E4", fg: G_DARK, Icon: Calculator },
    valide: { l: "Validé",             bg: "#DCFCE7", fg: "#15803D", Icon: CheckCircle2 },
    manuel: { l: "Modifié manuellement", bg: "#FEF3C7", fg: "#92400E", Icon: PenLine },
  }[mode];

  return (
    <div className="rounded-xl border-2 p-2.5" style={{ borderColor: mode === "auto" ? "#E7E5E4" : st.fg, backgroundColor: "#fff" }}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-stone-600 truncate">{titre}</span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0"
          style={{ backgroundColor: st.bg, color: st.fg }}>
          <st.Icon size={9} /> {st.l}
        </span>
      </div>

      <div className="space-y-0.5 mb-2">
        <Line k="Quantité calculée" v={fmt(calcule)} u={unit} />
        {marges && (
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[11px] text-stone-500">Marge</span>
            <div className="flex gap-1">
              {MARGES.map((m) => (
                <button key={m} onClick={() => onMarge(m)}
                  className="w-8 h-7 rounded text-[10px] font-bold border"
                  style={n(marge) === m ? { backgroundColor: G_DARK, color: "#fff", borderColor: G_DARK }
                    : { backgroundColor: "#fff", color: "#A8A29E", borderColor: "#E7E5E4" }}
                >{m}</button>
              ))}
              <input inputMode="decimal" value={marge ?? ""} onChange={(e) => onMarge(e.target.value)}
                className="w-11 h-7 px-1 rounded border border-stone-300 text-[10px] font-mono text-center" placeholder="%" />
            </div>
          </div>
        )}
        {marges && <Line k="Après marge" v={fmt(propose)} u={unit} />}
      </div>

      {perime && (
        <div className="rounded-lg px-2 py-1.5 mb-2 flex items-start gap-1.5" style={{ backgroundColor: "#FEE2E2" }}>
          <AlertTriangle size={11} className="text-red-700 mt-0.5 shrink-0" />
          <span className="text-[10px] text-red-900 leading-snug">
            Les dimensions ont changé : le calcul donne maintenant <b>{fmt(propose)} {unit}</b>. Votre valeur est conservée.
          </span>
        </div>
      )}

      {mode === "manuel" ? (
        <div className="relative mb-1.5">
          <input inputMode="decimal" value={q?.val ?? ""} autoFocus
            onChange={(e) => onQ({ mode: MANUEL, val: e.target.value, snap: propose })}
            placeholder={fmt(propose)}
            className="w-full h-11 px-2.5 pr-8 rounded-lg border-2 font-mono font-bold text-right focus:outline-none"
            style={{ borderColor: "#92400E" }} />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400">{unit}</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between rounded-lg px-2.5 py-2 mb-1.5" style={{ backgroundColor: "#FAFAF9" }}>
          <span className="text-[10px] text-stone-500">Quantité retenue</span>
          <span className="font-mono font-bold text-lg" style={{ color: G_DARK }}>{fmt(val)} <span className="text-[10px] text-stone-400">{unit}</span></span>
        </div>
      )}

      <div className="flex gap-1">
        {mode === "auto" && (
          <button onClick={() => { const v = qValider(propose); if (v) onQ(v); }}
            className="flex-1 h-9 rounded-lg text-[10px] font-bold text-white flex items-center justify-center gap-1"
            style={{ backgroundColor: G_DARK }}>
            <Check size={12} /> Valider
          </button>
        )}
        {mode !== "manuel" && (
          <button onClick={() => onQ(qManuel(fmt(val).replace(/\s/g, "").replace(",", "."), propose))}
            className="flex-1 h-9 rounded-lg text-[10px] font-bold border-2 border-stone-300 text-stone-700 flex items-center justify-center gap-1">
            <PenLine size={11} /> Modifier
          </button>
        )}
        {mode !== "auto" && (
          <button onClick={() => onQ(qAuto())}
            className="flex-1 h-9 rounded-lg text-[10px] font-bold border-2 flex items-center justify-center gap-1"
            style={{ borderColor: G_LIGHT, color: G_DARK, backgroundColor: G_PALE }}>
            <RotateCcw size={11} /> Revenir au calcul auto
          </button>
        )}
      </div>

      <div className="mt-1.5 text-[9px] text-stone-400 truncate">Origine : {origine}</div>
    </div>
  );
}

export function Line({ k, v, u, strong, neg }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={`text-[11px] ${strong ? "font-bold text-stone-800" : "text-stone-500"}`}>{k}</span>
      <span className={`font-mono text-[12px] ${strong ? "font-bold" : ""}`} style={{ color: neg ? "#B91C1C" : strong ? G_DARK : "#44403C" }}>
        {neg && v !== "0,00" ? "−" : ""}{v} <span className="text-[9px] text-stone-400">{u}</span>
      </span>
    </div>
  );
}

/* ---- Lignes dynamiques (déductions, ajouts) ---- */
export function DynList({ items, onChange, labelPlaceholder, unit = "m²", addLabel }) {
  const add = () => onChange([...(items || []), { id: uid(), label: "", surface: "", longueur: "", qte: "1" }]);
  const set = (id, k, v) => onChange(items.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const del = (id) => onChange(items.filter((x) => x.id !== id));
  const key = unit === "ml" ? "longueur" : "surface";
  return (
    <div className="space-y-1.5">
      {(items || []).map((it) => (
        <div key={it.id} className="flex gap-1.5 items-end">
          <label className="flex-1 min-w-0">
            <input value={it.label} onChange={(e) => set(it.id, "label", e.target.value)}
              placeholder={labelPlaceholder}
              className="w-full h-11 px-2.5 rounded-lg border-2 border-stone-300 text-sm focus:outline-none focus:border-lime-700" />
          </label>
          <input inputMode="decimal" value={it[key]} onChange={(e) => set(it.id, key, e.target.value)}
            placeholder="0" className="w-[70px] h-11 px-2 rounded-lg border-2 border-stone-300 font-mono text-right text-sm" />
          <input inputMode="decimal" value={it.qte} onChange={(e) => set(it.id, "qte", e.target.value)}
            placeholder="1" className="w-[46px] h-11 px-1 rounded-lg border-2 border-stone-300 font-mono text-center text-sm" />
          <button onClick={() => del(it.id)} className="w-11 h-11 rounded-lg border-2 border-stone-200 flex items-center justify-center shrink-0">
            <X size={14} className="text-stone-500" />
          </button>
        </div>
      ))}
      <button onClick={add} className="w-full h-10 rounded-lg border-2 border-dashed border-stone-300 text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1.5">
        <Plus size={14} /> {addLabel} <span className="text-stone-400">({unit} × qté)</span>
      </button>
    </div>
  );
}

export function Confirm({ open, titre, texte, onOk, onCancel, okLabel = "Supprimer" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={20} className="text-red-600" />
          <span className="font-bold text-stone-900">{titre}</span>
        </div>
        <p className="text-sm text-stone-600 mb-4">{texte}</p>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onCancel} className="flex-1">Annuler</Btn>
          <Btn variant="danger" onClick={onOk} className="flex-1">{okLabel}</Btn>
        </div>
      </div>
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg"
      style={{ backgroundColor: INK }}>{msg}</div>
  );
}
