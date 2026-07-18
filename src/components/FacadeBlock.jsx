import { useState } from "react";
import { Plus, Minus, Trash2, Copy, X, AlertTriangle, Search } from "lucide-react";
import {
  G_DARK, G_MID, G_LIGHT, G_PALE, n,
  FACADE_ORIENTATIONS, FACADE_SUPPORTS, FACADE_ETATS, FACADE_ACCES,
  FACADE_PATHOLOGIES, FACADE_TRAVAUX, FACADE_FINITIONS, FACADE_ASPECTS,
} from "../lib/catalogue";
import { fmt } from "../lib/calc";
import { newFace, newPathologie, newBandeau } from "../lib/store";
import { Section, Btn, Line, Toggle, Chips } from "./ui";

/* Un champ obligatoire non renseigné se signale en orange (et jamais en rouge :
   ce n'est pas une erreur, c'est une information encore manquante). */
const bordure = (vide) => (vide ? "#F59E0B" : "#D6D3D1");

function Champ({ label, value, onChange, unit, obligatoire, placeholder, inputMode = "decimal" }) {
  const vide = obligatoire && !String(value ?? "").trim();
  return (
    <label className="block">
      <span className="text-[9px] font-bold uppercase text-stone-400 flex items-center gap-1">
        {label}
        {vide && <span style={{ color: "#B45309" }}>• requis</span>}
      </span>
      <div className="relative">
        <input
          inputMode={inputMode}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-2 pr-8 rounded-lg border-2 font-mono text-sm focus:outline-none"
          style={{ borderColor: bordure(vide) }}
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-400">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

/* ---- Une face de bâtiment ---- */
function FaceCard({ f, onChange, onDelete, onDup }) {
  const set = (k, v) => onChange({ ...f, [k]: v });
  const niv = Math.max(1, n(f.niveaux) || 1);
  const hTot = f.hParNiveau ? n(f.hauteur) * niv : n(f.hauteur);
  const surface = n(f.largeur) * hTot * Math.max(1, n(f.qte) || 1);

  return (
    <div className="rounded-xl border-2 p-2.5 mb-2" style={{ borderColor: G_LIGHT }}>
      <div className="flex gap-1.5 mb-2">
        <input
          value={f.nom ?? ""}
          onChange={(e) => set("nom", e.target.value)}
          placeholder="Nom de la façade"
          className="flex-1 min-w-0 h-10 px-2.5 rounded-lg border-2 border-stone-300 text-sm font-semibold"
        />
        <button onClick={onDup} className="w-10 h-10 rounded-lg border-2 border-stone-200 flex items-center justify-center">
          <Copy size={13} className="text-stone-500" />
        </button>
        <button onClick={onDelete} className="w-10 h-10 rounded-lg border-2 border-red-200 flex items-center justify-center">
          <Trash2 size={13} className="text-red-600" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-1.5">
        <Champ label="Largeur" value={f.largeur} onChange={(v) => set("largeur", v)} unit="m" obligatoire />
        <Champ label={f.hParNiveau ? "Hauteur / niveau" : "Hauteur totale"} value={f.hauteur} onChange={(v) => set("hauteur", v)} unit="m" obligatoire />
        <Champ label="Nombre de niveaux" value={f.niveaux} onChange={(v) => set("niveaux", v)} unit="niv" inputMode="numeric" />
        <Champ label="Façades identiques" value={f.qte} onChange={(v) => set("qte", v)} unit="×" inputMode="numeric" />
      </div>

      <Toggle
        label="La hauteur saisie est celle d'un seul niveau"
        checked={!!f.hParNiveau}
        onChange={(v) => set("hParNiveau", v)}
      />

      <div className="mt-1.5">
        <span className="text-[9px] font-bold uppercase text-stone-400">Orientation</span>
        <div className="flex gap-1 overflow-x-auto pb-0.5 mt-0.5">
          {FACADE_ORIENTATIONS.map((o) => (
            <button
              key={o}
              onClick={() => set("orientation", f.orientation === o ? "" : o)}
              className="h-7 px-1.5 rounded text-[9px] font-bold border shrink-0"
              style={
                f.orientation === o
                  ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
                  : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }
              }
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-stone-100 flex items-baseline justify-between">
        <span className="text-[10px] text-stone-500">
          Surface brute {f.hParNiveau && niv > 1 ? `(${niv} niveaux)` : ""}
        </span>
        <span className="font-mono font-bold text-sm" style={{ color: G_DARK }}>
          {fmt(surface)} m²
        </span>
      </div>
    </div>
  );
}

/* ---- Une pathologie relevée ---- */
function PathoCard({ p, onChange, onDelete, onDup }) {
  const set = (k, v) => onChange({ ...p, [k]: v });
  const cat = FACADE_PATHOLOGIES.find((x) => x.id === p.type);
  const q = Math.max(0, n(p.qte));

  return (
    <div className="rounded-xl border-2 p-2 mb-1.5" style={{ borderColor: q > 0 ? G_LIGHT : "#F5F5F4" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className={`text-xs truncate ${q > 0 ? "font-bold text-stone-900" : "text-stone-500"}`}>
            {p.label || cat?.label}
          </div>
          <div className="text-[9px] text-stone-400 truncate">
            {p.localisation || "Localisation non précisée"}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {p.unite !== "forfait" && (
            <>
              <button
                onClick={() => set("qte", String(Math.max(0, Math.round((q - 1) * 100) / 100)))}
                className="w-9 h-9 rounded-lg border-2 border-stone-300 flex items-center justify-center"
              >
                <Minus size={13} className="text-stone-600" />
              </button>
              <input
                inputMode="decimal"
                value={p.qte ?? ""}
                onChange={(e) => set("qte", e.target.value)}
                className="w-12 h-9 rounded-lg border-2 font-mono font-bold text-center text-sm"
                style={{ borderColor: bordure(!String(p.qte ?? "").trim()) }}
              />
              <button
                onClick={() => set("qte", String(Math.round((q + 1) * 100) / 100))}
                className="w-9 h-9 rounded-lg border-2 flex items-center justify-center"
                style={{ backgroundColor: G_PALE, borderColor: G_LIGHT }}
              >
                <Plus size={13} style={{ color: G_DARK }} />
              </button>
            </>
          )}
          <span className="w-9 text-[9px] font-mono font-bold text-center" style={{ color: G_MID }}>
            {p.unite}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <input
          value={p.localisation ?? ""}
          onChange={(e) => set("localisation", e.target.value)}
          placeholder="Localisation (ex. R+2 angle nord)"
          className="h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px]"
        />
        <div className="flex gap-1">
          <input
            value={p.obs ?? ""}
            onChange={(e) => set("obs", e.target.value)}
            placeholder="Observations"
            className="flex-1 min-w-0 h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px]"
          />
          <button onClick={onDup} className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center shrink-0">
            <Copy size={12} className="text-stone-500" />
          </button>
          <button onClick={onDelete} className="w-9 h-9 rounded-lg border-2 border-red-200 flex items-center justify-center shrink-0">
            <Trash2 size={12} className="text-red-600" />
          </button>
        </div>
      </div>

      {/* L'unité reste modifiable : un même désordre peut se chiffrer autrement selon le chantier. */}
      <div className="flex gap-1 mt-1.5">
        {["m²", "ml", "u", "forfait"].map((u) => (
          <button
            key={u}
            onClick={() => set("unite", u)}
            className="h-6 px-1.5 rounded text-[9px] font-bold border"
            style={
              p.unite === u
                ? { backgroundColor: G_MID, borderColor: G_MID, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }
            }
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FacadeBlock({ room, update, c }) {
  const f = room.facade || {};
  const cf = c.facade;
  const [rechPatho, setRechPatho] = useState("");

  const setF = (k, v) => update({ ...room, facade: { ...f, [k]: v } });
  const setListe = (k, v) => setF(k, v);

  const faces = f.faces || [];
  const pathos = f.pathologies || [];
  const bandeaux = f.bandeaux || [];

  const pathoFiltrees = FACADE_PATHOLOGIES.filter((p) =>
    p.label.toLowerCase().includes(rechPatho.toLowerCase())
  );

  const travauxActifs = Object.values(f.travaux || {}).filter(Boolean).length;

  return (
    <div className="space-y-2.5">
      {/* ---------- Dimensions ---------- */}
      <Section title="Dimensions de la façade" accent defaultOpen badge={faces.length}>
        {faces.map((fa) => (
          <FaceCard
            key={fa.id}
            f={fa}
            onChange={(nf) => setListe("faces", faces.map((x) => (x.id === nf.id ? nf : x)))}
            onDelete={() => setListe("faces", faces.filter((x) => x.id !== fa.id))}
            onDup={() => setListe("faces", [...faces, { ...fa, id: newFace().id, nom: `${fa.nom} (copie)` }])}
          />
        ))}
        <Btn variant="ghost" onClick={() => setListe("faces", [...faces, newFace()])} className="w-full">
          <Plus size={16} /> Ajouter une façade
        </Btn>

        <div className="mt-2.5 pt-2.5 border-t-2 border-stone-100 space-y-2">
          <Toggle
            label="Traiter les tableaux d'ouvertures"
            checked={f.traiterTableaux !== false}
            onChange={(v) => setF("traiterTableaux", v)}
          />
          <Toggle
            label="Soubassement traité séparément"
            checked={!!f.soubassementTraite}
            onChange={(v) => setF("soubassementTraite", v)}
          />
          {f.soubassementTraite && (
            <Champ
              label="Hauteur du soubassement"
              value={f.soubassementH}
              onChange={(v) => setF("soubassementH", v)}
              unit="m"
              obligatoire
            />
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t-2 border-stone-100">
          <div className="text-[9px] font-bold uppercase text-stone-400 mb-1">
            Bandeaux, corniches, appuis
          </div>
          {bandeaux.map((b) => (
            <div key={b.id} className="flex gap-1.5 mb-1.5">
              <input
                value={b.label ?? ""}
                onChange={(e) => setListe("bandeaux", bandeaux.map((x) => (x.id === b.id ? { ...x, label: e.target.value } : x)))}
                placeholder="Désignation"
                className="flex-1 min-w-0 h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px]"
              />
              <input
                inputMode="decimal"
                value={b.longueur ?? ""}
                onChange={(e) => setListe("bandeaux", bandeaux.map((x) => (x.id === b.id ? { ...x, longueur: e.target.value } : x)))}
                placeholder="ml"
                className="w-16 h-9 px-2 rounded-lg border-2 border-stone-300 font-mono text-[11px] text-center"
              />
              <button
                onClick={() => setListe("bandeaux", bandeaux.filter((x) => x.id !== b.id))}
                className="w-9 h-9 rounded-lg border-2 border-red-200 flex items-center justify-center shrink-0"
              >
                <Trash2 size={12} className="text-red-600" />
              </button>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setListe("bandeaux", [...bandeaux, newBandeau()])} className="w-full h-9">
            <Plus size={14} /> Ajouter un bandeau / une corniche
          </Btn>
        </div>
      </Section>

      {/* ---------- Support ---------- */}
      <Section title="Support et accès" accent>
        <div className="space-y-2">
          <div>
            <span className="text-[9px] font-bold uppercase text-stone-400">Nature du support</span>
            <Chips options={FACADE_SUPPORTS} value={f.support} onChange={(v) => setF("support", v)} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-stone-400">État général</span>
            <Chips options={FACADE_ETATS} value={f.etat} onChange={(v) => setF("etat", v)} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-stone-400">Moyen d'accès</span>
            <Chips options={FACADE_ACCES} value={f.acces} onChange={(v) => setF("acces", v)} />
          </div>
        </div>
      </Section>

      {/* ---------- Pathologies ---------- */}
      <Section title="État et pathologies" accent badge={cf.nbPathologies}>
        {pathos.map((p) => (
          <PathoCard
            key={p.id}
            p={p}
            onChange={(np) => setListe("pathologies", pathos.map((x) => (x.id === np.id ? np : x)))}
            onDelete={() => setListe("pathologies", pathos.filter((x) => x.id !== p.id))}
            onDup={() => setListe("pathologies", [...pathos, { ...p, id: newPathologie().id }])}
          />
        ))}

        <div className="relative mb-1.5 mt-1">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={rechPatho}
            onChange={(e) => setRechPatho(e.target.value)}
            placeholder="Rechercher un désordre…"
            className="w-full h-9 pl-7 pr-2 rounded-lg border-2 border-stone-200 text-[11px]"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {pathoFiltrees.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setListe("pathologies", [...pathos, newPathologie(cat)])}
              className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-dashed border-stone-300 text-stone-600 active:bg-lime-50"
            >
              + {cat.label} <span className="text-stone-400">({cat.unite})</span>
            </button>
          ))}
          {!pathoFiltrees.length && (
            <span className="text-[10px] text-stone-400 py-2">Aucun désordre ne correspond.</span>
          )}
        </div>
      </Section>

      {/* ---------- Travaux façade ---------- */}
      <Section title="Travaux de façade" accent badge={travauxActifs}>
        <p className="text-[10px] text-stone-500 mb-2 leading-snug">
          Les quantités proposées viennent du métré ci-dessus. Le chiffrage détaillé reste
          dans l'onglet Travaux.
        </p>
        <div className="space-y-1">
          {FACADE_TRAVAUX.map((t) => {
            const actif = !!(f.travaux || {})[t.id];
            const auto = t.auto ? cf[t.auto] : null;
            return (
              <button
                key={t.id}
                onClick={() => setF("travaux", { ...(f.travaux || {}), [t.id]: !actif })}
                className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg border-2 text-left"
                style={
                  actif
                    ? { backgroundColor: G_PALE, borderColor: G_LIGHT }
                    : { backgroundColor: "#fff", borderColor: "#F5F5F4" }
                }
              >
                <span className={`text-[11px] ${actif ? "font-bold text-stone-900" : "text-stone-500"}`}>
                  {t.label}
                </span>
                <span className="font-mono text-[10px] shrink-0" style={{ color: actif ? G_DARK : "#D6D3D1" }}>
                  {auto != null && auto > 0 ? `${fmt(auto, t.unite === "u" ? 0 : 2)} ${t.unite}` : t.unite}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ---------- Finition ---------- */}
      <Section title="Finition" accent>
        <div className="space-y-2">
          <div>
            <span className="text-[9px] font-bold uppercase text-stone-400">Système de finition</span>
            <Chips options={FACADE_FINITIONS} value={f.finition} onChange={(v) => setF("finition", v)} />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-stone-400">Aspect</span>
            <Chips options={FACADE_ASPECTS} value={f.aspect} onChange={(v) => setF("aspect", v)} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Champ label="Teinte / RAL" value={f.teinte} onChange={(v) => setF("teinte", v)} inputMode="text" />
            <Champ label="Nombre de couches" value={f.couches} onChange={(v) => setF("couches", v)} inputMode="numeric" />
          </div>
        </div>
      </Section>

      {/* ---------- Résumé ---------- */}
      <Section title="Métré de la façade" accent defaultOpen>
        <div className="rounded-xl p-2.5 mb-2" style={{ backgroundColor: G_PALE }}>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G_DARK }}>
            Traitement général
          </div>
          <Line k="Surface brute" v={fmt(cf.surfaceBrute)} u="m²" />
          <Line k="Ouvertures déduites" v={fmt(cf.ouvertures)} u="m²" neg />
          <Line k="Surface nette" v={fmt(cf.surfaceNette)} u="m²" strong />
          <Line k="Tableaux" v={fmt(cf.tableaux)} u="m²" />
          <Line k="Soubassement" v={fmt(cf.soubassement)} u="m²" />
          <Line k="Bandeaux / corniches" v={fmt(cf.bandeaux)} u="ml" />
          <div className="mt-1 pt-1 border-t" style={{ borderColor: G_LIGHT }}>
            <Line k="Surface à traiter" v={fmt(cf.surfaceATraiter)} u="m²" strong />
          </div>
        </div>

        <div className="rounded-xl p-2.5 border-2" style={{ borderColor: "#FDE68A", backgroundColor: "#FFFBEB" }}>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color: "#92400E" }}>
            <AlertTriangle size={11} /> Réparations localisées
          </div>
          <Line k="Fissures et linéaires" v={fmt(cf.reparationsMl)} u="ml" strong />
          <Line k="Reprises de surface" v={fmt(cf.reparationsM2)} u="m²" strong />
          <Line k="Points ponctuels" v={fmt(cf.reparationsU, 0)} u="u" />
          <Line k="Forfaits" v={fmt(cf.reparationsForfait, 0)} u="u" />
          <p className="text-[8px] text-stone-500 mt-1 leading-snug">
            Ces quantités <b>s'ajoutent</b> au traitement général : elles ne s'en déduisent jamais.
          </p>
        </div>
      </Section>
    </div>
  );
}
