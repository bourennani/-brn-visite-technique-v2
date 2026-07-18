import { useState } from "react";
import { Plus, Minus, Trash2, Copy, Search, ChevronDown } from "lucide-react";
import {
  G_DARK, G_MID, G_LIGHT, G_PALE, n,
  CUISINE_MEUBLES, CUISINE_RANGS, CUISINE_ETATS, CUISINE_POSITIONS,
  CUISINE_IMPLANTATIONS, PDT_MATERIAUX, PDT_CHANTS, PDT_DECOUPES, PDT_EPAISSEURS,
  CREDENCE_MATERIAUX, CUISINE_EQUIPEMENTS,
} from "../lib/catalogue";
import { fmt } from "../lib/calc";
import { newMeuble, newTroncon, newCredence, newEquipCuisine } from "../lib/store";
import { Section, Btn, Line, Toggle, Chips } from "./ui";

const bordure = (vide) => (vide ? "#F59E0B" : "#D6D3D1");

function Mini({ label, value, onChange, unit, obligatoire, inputMode = "decimal", w = "" }) {
  const vide = obligatoire && !String(value ?? "").trim();
  return (
    <label className={`block ${w}`}>
      <span className="text-[8px] font-bold uppercase text-stone-400">{label}</span>
      <div className="relative">
        <input
          inputMode={inputMode}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-9 px-1.5 rounded border-2 font-mono text-[11px]"
          style={{ borderColor: bordure(vide) }}
        />
        {unit && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-stone-400">
            {unit}
          </span>
        )}
      </div>
    </label>
  );
}

/* ---- Un meuble ---- */
function MeubleCard({ m, onChange, onDelete, onDup }) {
  const [open, setOpen] = useState(false);
  const def = CUISINE_MEUBLES.find((x) => x.id === m.type);
  const set = (k, v) => onChange({ ...m, [k]: v });
  const q = Math.max(1, n(m.qte) || 1);
  const largeurs = def?.largeurs || [];

  return (
    <div className="rounded-lg border-2 p-1.5 mb-1.5" style={{ borderColor: n(m.largeur) ? G_LIGHT : "#F5F5F4" }}>
      <div className="flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-stone-900 truncate">{m.label || def?.label}</div>
          <div className="text-[9px] text-stone-400 truncate">
            {[m.largeur ? `${m.largeur} cm` : null, m.etat, m.position, m.surMesure ? "sur mesure" : null]
              .filter(Boolean)
              .join(" · ") || "À renseigner"}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => set("qte", String(Math.max(1, q - 1)))} className="w-8 h-9 rounded-lg border-2 border-stone-300 flex items-center justify-center">
            <Minus size={12} className="text-stone-600" />
          </button>
          <span className="w-7 text-center font-mono font-bold text-sm">{q}</span>
          <button onClick={() => set("qte", String(q + 1))} className="w-8 h-9 rounded-lg border-2 flex items-center justify-center" style={{ backgroundColor: G_PALE, borderColor: G_LIGHT }}>
            <Plus size={12} style={{ color: G_DARK }} />
          </button>
          <button onClick={() => setOpen(!open)} className="w-7 h-9 flex items-center justify-center">
            <ChevronDown size={13} className={`text-stone-400 transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Largeurs standard : le geste le plus fréquent du métreur, donc toujours visible. */}
      {largeurs.length > 0 && (
        <div className="flex gap-1 mt-1.5 overflow-x-auto pb-0.5">
          {largeurs.map((l) => (
            <button
              key={l}
              onClick={() => set("largeur", String(l))}
              className="h-7 px-1.5 rounded text-[9px] font-mono font-bold border shrink-0"
              style={
                n(m.largeur) === l
                  ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
                  : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }
              }
            >
              {l}
            </button>
          ))}
          <input
            inputMode="decimal"
            value={largeurs.includes(n(m.largeur)) ? "" : m.largeur ?? ""}
            onChange={(e) => set("largeur", e.target.value)}
            placeholder="perso"
            className="w-14 h-7 px-1 rounded border-2 font-mono text-[9px] text-center shrink-0"
            style={{ borderColor: bordure(!String(m.largeur ?? "").trim()) }}
          />
        </div>
      )}

      {open && (
        <div className="mt-2 pt-2 border-t border-stone-100 space-y-1.5">
          {largeurs.length === 0 && (
            <Mini label="Largeur" value={m.largeur} onChange={(v) => set("largeur", v)} unit="cm" obligatoire />
          )}
          <div className="grid grid-cols-3 gap-1.5">
            <Mini label="Hauteur" value={m.hauteur} onChange={(v) => set("hauteur", v)} unit="cm" />
            <Mini label="Profondeur" value={m.profondeur} onChange={(v) => set("profondeur", v)} unit="cm" />
            <Mini label="Référence" value={m.reference} onChange={(v) => set("reference", v)} inputMode="text" />
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <Mini label="Portes" value={m.portes} onChange={(v) => set("portes", v)} inputMode="numeric" />
            <Mini label="Tiroirs" value={m.tiroirs} onChange={(v) => set("tiroirs", v)} inputMode="numeric" />
            <Mini label="Finition" value={m.finition} onChange={(v) => set("finition", v)} inputMode="text" />
          </div>
          <div>
            <span className="text-[8px] font-bold uppercase text-stone-400">Sens d'ouverture</span>
            <Chips options={["Gauche", "Droite", "Relevable", "Coulissant", "Sans porte"]} value={m.sens} onChange={(v) => set("sens", v)} />
          </div>
          <div>
            <span className="text-[8px] font-bold uppercase text-stone-400">État / intervention</span>
            <Chips options={CUISINE_ETATS} value={m.etat} onChange={(v) => set("etat", v)} />
          </div>
          <div>
            <span className="text-[8px] font-bold uppercase text-stone-400">Position</span>
            <Chips options={CUISINE_POSITIONS} value={m.position} onChange={(v) => set("position", v)} />
          </div>
          <Toggle label="Sur mesure" checked={!!m.surMesure} onChange={(v) => set("surMesure", v)} />
          <input
            value={m.obs ?? ""}
            onChange={(e) => set("obs", e.target.value)}
            placeholder="Observations"
            className="w-full h-9 px-2 rounded-lg border-2 border-stone-200 text-[11px]"
          />
          <div className="flex gap-1.5">
            <Btn variant="ghost" onClick={onDup} className="flex-1 h-9">
              <Copy size={12} /> Dupliquer
            </Btn>
            <button onClick={onDelete} className="w-10 h-9 rounded-lg border-2 border-red-200 flex items-center justify-center">
              <Trash2 size={12} className="text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Liste de meubles d'une phase (Existant ou Projet) ---- */
function PhaseMeubles({ phase, titre, meubles, setMeubles, stats }) {
  const [rech, setRech] = useState("");
  const liste = meubles.filter((m) => (m.phase || "existant") === phase);
  const cat = CUISINE_MEUBLES.filter((d) => d.label.toLowerCase().includes(rech.toLowerCase()));

  return (
    <Section title={titre} accent={phase === "projet"} badge={liste.length}>
      {CUISINE_RANGS.map((r) => {
        const duRang = liste.filter((m) => (m.rang || "bas") === r.k);
        if (!duRang.length) return null;
        return (
          <div key={r.k} className="mb-2">
            <div className="text-[9px] font-bold uppercase text-stone-400 mb-1">{r.label}</div>
            {duRang.map((m) => (
              <MeubleCard
                key={m.id}
                m={m}
                onChange={(nm) => setMeubles(meubles.map((x) => (x.id === nm.id ? nm : x)))}
                onDelete={() => setMeubles(meubles.filter((x) => x.id !== m.id))}
                onDup={() => setMeubles([...meubles, { ...m, id: newMeuble().id }])}
              />
            ))}
          </div>
        );
      })}

      {!liste.length && (
        <p className="text-[11px] text-stone-400 text-center py-2">Aucun élément.</p>
      )}

      <div className="relative mb-1.5 mt-1">
        <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={rech}
          onChange={(e) => setRech(e.target.value)}
          placeholder="Rechercher un meuble…"
          className="w-full h-9 pl-7 pr-2 rounded-lg border-2 border-stone-200 text-[11px]"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {cat.map((d) => (
          <button
            key={d.id}
            onClick={() => setMeubles([...meubles, newMeuble(d, phase)])}
            className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-dashed border-stone-300 text-stone-600 active:bg-lime-50"
          >
            + {d.label}
          </button>
        ))}
      </div>

      {stats && (
        <div className="mt-2.5 pt-2 border-t-2 border-stone-100">
          {stats.detail.length === 0 ? (
            <p className="text-[10px] text-stone-400">Aucun métré.</p>
          ) : (
            stats.detail.map((d) => (
              <Line key={`${d.label}-${d.largeur}`} k={`${d.label} ${d.largeur} cm`} v={d.nb} u="" />
            ))
          )}
        </div>
      )}
    </Section>
  );
}

/* ---- Un tronçon de plan de travail ---- */
function TronconCard({ t, onChange, onDelete, onDup }) {
  const set = (k, v) => onChange({ ...t, [k]: v });
  return (
    <div className="rounded-xl border-2 p-2 mb-1.5" style={{ borderColor: n(t.longueur) ? G_LIGHT : "#F5F5F4" }}>
      <div className="flex gap-1.5 mb-1.5">
        <input
          value={t.nom ?? ""}
          onChange={(e) => set("nom", e.target.value)}
          placeholder="Tronçon"
          className="flex-1 min-w-0 h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px] font-semibold"
        />
        <button onClick={onDup} className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center">
          <Copy size={12} className="text-stone-500" />
        </button>
        <button onClick={onDelete} className="w-9 h-9 rounded-lg border-2 border-red-200 flex items-center justify-center">
          <Trash2 size={12} className="text-red-600" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-1.5">
        <Mini label="Longueur" value={t.longueur} onChange={(v) => set("longueur", v)} unit="m" obligatoire />
        <Mini label="Prof." value={t.profondeur} onChange={(v) => set("profondeur", v)} unit="cm" />
        <Mini label="Épais." value={t.epaisseur} onChange={(v) => set("epaisseur", v)} unit="mm" />
        <Mini label="Débord" value={t.debord} onChange={(v) => set("debord", v)} unit="cm" />
      </div>
      <div className="flex gap-1 mb-1.5 overflow-x-auto pb-0.5">
        {PDT_EPAISSEURS.map((e) => (
          <button
            key={e}
            onClick={() => set("epaisseur", String(e))}
            className="h-6 px-1.5 rounded text-[9px] font-mono font-bold border shrink-0"
            style={n(t.epaisseur) === e ? { backgroundColor: G_MID, borderColor: G_MID, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="mb-1.5">
        <span className="text-[8px] font-bold uppercase text-stone-400">Matériau</span>
        <Chips options={PDT_MATERIAUX} value={t.materiau} onChange={(v) => set("materiau", v)} />
      </div>
      <div className="mb-1.5">
        <span className="text-[8px] font-bold uppercase text-stone-400">Chants</span>
        <div className="flex gap-1 mt-0.5">
          {[
            { k: "chantAvant", l: "Avant" },
            { k: "chantG", l: "Gauche" },
            { k: "chantD", l: "Droit" },
          ].map((ch) => (
            <button
              key={ch.k}
              onClick={() => set(ch.k, !t[ch.k])}
              className="h-7 px-2 rounded text-[9px] font-bold border"
              style={t[ch.k] ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}
            >
              {ch.l}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-1.5">
        <span className="text-[8px] font-bold uppercase text-stone-400">Découpes et usinages</span>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {PDT_DECOUPES.map((d) => {
            const actif = !!(t.decoupes || {})[d.k];
            return (
              <button
                key={d.k}
                onClick={() => set("decoupes", { ...(t.decoupes || {}), [d.k]: !actif })}
                className="h-7 px-1.5 rounded text-[9px] font-bold border"
                style={actif ? { backgroundColor: G_MID, borderColor: G_MID, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Toggle label="Dosseret" checked={!!t.dosseret} onChange={(v) => set("dosseret", v)} />
        <Mini label="Remontée murale" value={t.remonteeMurale} onChange={(v) => set("remonteeMurale", v)} unit="cm" />
      </div>
    </div>
  );
}

export default function CuisineBlock({ room, update, c }) {
  const cu = room.cuisine || {};
  const cc = c.cuisine;
  const setCu = (k, v) => update({ ...room, cuisine: { ...cu, [k]: v } });

  const meubles = cu.meubles || [];
  const pdt = cu.pdt || [];
  const credence = cu.credence || [];
  const equipements = cu.equipements || [];

  return (
    <div className="space-y-2.5">
      <Section title="Implantation" accent defaultOpen>
        <Chips options={CUISINE_IMPLANTATIONS} value={cu.implantation} onChange={(v) => setCu("implantation", v)} />
      </Section>

      <PhaseMeubles
        phase="existant"
        titre="Mobilier existant"
        meubles={meubles}
        setMeubles={(v) => setCu("meubles", v)}
        stats={cc.existant}
      />
      <PhaseMeubles
        phase="projet"
        titre="Mobilier projeté"
        meubles={meubles}
        setMeubles={(v) => setCu("meubles", v)}
        stats={cc.projet}
      />

      {/* ---------- Plan de travail ---------- */}
      <Section title="Plan de travail" accent badge={pdt.length}>
        <p className="text-[10px] text-stone-500 mb-2 leading-snug">
          La longueur totale est la <b>somme des tronçons</b> saisis : elle n'est jamais
          déduite de la largeur des meubles.
        </p>
        {pdt.map((t) => (
          <TronconCard
            key={t.id}
            t={t}
            onChange={(nt) => setCu("pdt", pdt.map((x) => (x.id === nt.id ? nt : x)))}
            onDelete={() => setCu("pdt", pdt.filter((x) => x.id !== t.id))}
            onDup={() => setCu("pdt", [...pdt, { ...t, id: newTroncon().id, nom: `${t.nom} (copie)` }])}
          />
        ))}
        <Btn variant="ghost" onClick={() => setCu("pdt", [...pdt, newTroncon()])} className="w-full">
          <Plus size={16} /> Ajouter un tronçon
        </Btn>
        {pdt.length > 0 && (
          <div className="mt-2 pt-2 border-t-2 border-stone-100">
            <Line k="Longueur totale" v={fmt(cc.pdtLongueur)} u="ml" strong />
            <Line k="Surface" v={fmt(cc.pdtSurface)} u="m²" />
            <Line k="Découpes" v={fmt(cc.pdtDecoupes, 0)} u="u" />
          </div>
        )}
      </Section>

      {/* ---------- Crédence ---------- */}
      <Section title="Crédence" accent badge={credence.length}>
        {credence.map((z) => (
          <div key={z.id} className="rounded-xl border-2 p-2 mb-1.5" style={{ borderColor: n(z.longueur) ? G_LIGHT : "#F5F5F4" }}>
            <div className="flex gap-1.5 mb-1.5">
              <input
                value={z.nom ?? ""}
                onChange={(e) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, nom: e.target.value } : x)))}
                placeholder="Zone"
                className="flex-1 min-w-0 h-9 px-2 rounded-lg border-2 border-stone-300 text-[11px] font-semibold"
              />
              <button
                onClick={() => setCu("credence", [...credence, { ...z, id: newCredence().id }])}
                className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center"
              >
                <Copy size={12} className="text-stone-500" />
              </button>
              <button
                onClick={() => setCu("credence", credence.filter((x) => x.id !== z.id))}
                className="w-9 h-9 rounded-lg border-2 border-red-200 flex items-center justify-center"
              >
                <Trash2 size={12} className="text-red-600" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-1.5">
              <Mini label="Longueur" value={z.longueur} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, longueur: v } : x)))} unit="m" obligatoire />
              <Mini label="Hauteur" value={z.hauteur} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, hauteur: v } : x)))} unit="m" obligatoire />
              <Mini label="Déduction" value={z.deduction} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, deduction: v } : x)))} unit="m²" />
              <Mini label="Marge" value={z.marge} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, marge: v } : x)))} unit="%" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <Mini label="Prises à intégrer" value={z.prises} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, prises: v } : x)))} inputMode="numeric" />
              <Mini label="Retours" value={z.retours} onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, retours: v } : x)))} unit="ml" />
            </div>
            <Chips
              options={CREDENCE_MATERIAUX}
              value={z.materiau}
              onChange={(v) => setCu("credence", credence.map((x) => (x.id === z.id ? { ...x, materiau: v } : x)))}
            />
          </div>
        ))}
        <Btn variant="ghost" onClick={() => setCu("credence", [...credence, newCredence()])} className="w-full">
          <Plus size={16} /> Ajouter une zone de crédence
        </Btn>
        {credence.length > 0 && (
          <div className="mt-2 pt-2 border-t-2 border-stone-100">
            <Line k="Surface brute" v={fmt(cc.credenceBrut)} u="m²" />
            <Line k="Après déductions" v={fmt(cc.credenceNet)} u="m²" />
            <Line k="Avec marge" v={fmt(cc.credenceSurface)} u="m²" strong />
          </div>
        )}
      </Section>

      {/* ---------- Équipements ---------- */}
      <Section title="Équipements de cuisine" accent badge={cc.nbEquipements}>
        {equipements.map((e) => (
          <div key={e.id} className="rounded-lg border-2 p-1.5 mb-1.5" style={{ borderColor: G_LIGHT }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="flex-1 text-xs font-bold text-stone-900 truncate">{e.type}</span>
              <button onClick={() => setCu("equipements", equipements.map((x) => (x.id === e.id ? { ...x, qte: String(Math.max(1, n(x.qte) - 1)) } : x)))} className="w-8 h-8 rounded border-2 border-stone-300 flex items-center justify-center">
                <Minus size={11} />
              </button>
              <span className="w-6 text-center font-mono font-bold text-xs">{Math.max(1, n(e.qte) || 1)}</span>
              <button onClick={() => setCu("equipements", equipements.map((x) => (x.id === e.id ? { ...x, qte: String((n(x.qte) || 1) + 1) } : x)))} className="w-8 h-8 rounded border-2 flex items-center justify-center" style={{ backgroundColor: G_PALE, borderColor: G_LIGHT }}>
                <Plus size={11} style={{ color: G_DARK }} />
              </button>
              <button onClick={() => setCu("equipements", equipements.filter((x) => x.id !== e.id))} className="w-8 h-8 rounded border-2 border-red-200 flex items-center justify-center">
                <Trash2 size={11} className="text-red-600" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              <Mini label="Dimensions" value={e.dims} onChange={(v) => setCu("equipements", equipements.map((x) => (x.id === e.id ? { ...x, dims: v } : x)))} inputMode="text" />
              <Mini label="Observations" value={e.obs} onChange={(v) => setCu("equipements", equipements.map((x) => (x.id === e.id ? { ...x, obs: v } : x)))} inputMode="text" />
            </div>
            <Chips
              options={CUISINE_ETATS}
              value={e.etat}
              onChange={(v) => setCu("equipements", equipements.map((x) => (x.id === e.id ? { ...x, etat: v } : x)))}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-1">
          {CUISINE_EQUIPEMENTS.map((t) => (
            <button
              key={t}
              onClick={() => setCu("equipements", [...equipements, { ...newEquipCuisine(), type: t }])}
              className="h-8 px-2 rounded-lg text-[9px] font-bold border-2 border-dashed border-stone-300 text-stone-600 active:bg-lime-50"
            >
              + {t}
            </button>
          ))}
        </div>
      </Section>

      {/* ---------- Résumé ---------- */}
      <Section title="Métré de la cuisine" accent defaultOpen>
        <div className="rounded-xl p-2.5" style={{ backgroundColor: G_PALE }}>
          <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G_DARK }}>
            Projet
          </div>
          <Line k="Meubles bas" v={fmt(cc.nbBasProjet, 0)} u="u" strong />
          <Line k="Meubles hauts" v={fmt(cc.nbHautProjet, 0)} u="u" strong />
          <Line k="Colonnes" v={fmt(cc.nbColonnesProjet, 0)} u="u" strong />
          <Line k="Îlot / bar" v={fmt(cc.nbIlotProjet, 0)} u="u" />
          <div className="my-1 pt-1 border-t" style={{ borderColor: G_LIGHT }}>
            <Line k="Largeur cumulée bas" v={fmt(cc.mlBasProjet)} u="ml" />
            <Line k="Largeur cumulée hauts" v={fmt(cc.mlHautProjet)} u="ml" />
            <Line k="Longueur plan de travail" v={fmt(cc.pdtLongueur)} u="ml" strong />
            <Line k="Surface crédence" v={fmt(cc.credenceSurface)} u="m²" strong />
            <Line k="Plinthe de cuisine" v={fmt(cc.plintheCuisine)} u="ml" />
          </div>
          <Line k="Joues" v={fmt(cc.nbJoues, 0)} u="u" />
          <Line k="Fileurs" v={fmt(cc.nbFileurs, 0)} u="u" />
          <Line k="Équipements" v={fmt(cc.nbEquipements, 0)} u="u" />
          <Line k="dont électroménager" v={fmt(cc.nbElectro, 0)} u="u" />
        </div>

        {cc.projet.detail.length > 0 && (
          <div className="mt-2 rounded-xl border-2 p-2.5" style={{ borderColor: G_LIGHT }}>
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G_DARK }}>
              Détail par largeur
            </div>
            {cc.projet.detail.map((d) => (
              <Line key={`${d.label}-${d.largeur}`} k={`${d.label} ${d.largeur} cm`} v={d.nb} u="" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
