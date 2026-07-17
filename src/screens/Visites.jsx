import { useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Calculator, CheckCircle2, Clock, Copy, FileText, Folder, Home, Package, Plus, Search, Trash2 } from "lucide-react";
import { Btn, Chips, Confirm, Field, Section, Select, Toggle } from "../components/ui";
import { calcProgression, calcRoom, calcVisite, fmt, uid, validateRoom } from "../lib/calc";
import { G_DARK, G_LIGHT, G_MID, G_PALE, INK, OCCUPATIONS, ORIGINES, PRESENTS, TYPES, TYPES_BIEN } from "../lib/catalogue";

/* ==================================================================== */
/*  MODULE 6 — ÉCRANS : VISITES / INFOS / PIÈCES                        */
/* ==================================================================== */

export function VisitesScreen({ visites, onOpen, onNew, onDup, onDel, onStatut }) {
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState("toutes");
  const [confirm, setConfirm] = useState(null);

  const list = visites
    .filter((v) => filtre === "toutes" || v.statut === filtre)
    .filter((v) => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return [v.ref, v.client?.nom, v.client?.prenom, v.client?.societe, v.chantier?.adresse, v.chantier?.ville]
        .filter(Boolean).some((x) => String(x).toLowerCase().includes(s));
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="pb-28">
      <div className="px-3 pt-3 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher : client, adresse, référence…"
            className="w-full h-[48px] pl-9 pr-3 rounded-xl border-2 border-stone-300 bg-white focus:border-lime-700 focus:outline-none" />
        </div>
        <div className="flex gap-1.5">
          {[{ v: "toutes", l: "Toutes" }, { v: "en_cours", l: "En cours" }, { v: "terminee", l: "Terminées" }].map((f) => (
            <button key={f.v} onClick={() => setFiltre(f.v)}
              className="flex-1 h-10 rounded-lg text-xs font-bold border-2"
              style={filtre === f.v ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
                : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div className="px-3 mt-3 space-y-2">
        {list.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-stone-200">
              <Folder size={28} className="text-stone-400" />
            </div>
            <p className="font-bold text-stone-700">{visites.length ? "Aucun résultat" : "Aucune visite"}</p>
            <p className="text-sm text-stone-500 mt-1">
              {visites.length ? "Modifiez votre recherche." : "Créez une visite pour commencer le relevé."}
            </p>
          </div>
        )}
        {list.map((v) => {
          const p = calcProgression(v);
          const c = calcVisite(v);
          return (
            <div key={v.id} className="rounded-2xl bg-white border-2 border-stone-200 overflow-hidden">
              <button onClick={() => onOpen(v.id)} className="w-full p-3 text-left active:bg-stone-50">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0">
                    <div className="font-bold text-stone-900 truncate">
                      {v.client?.nom || v.client?.societe ? `${v.client.societe || ""} ${v.client.nom || ""} ${v.client.prenom || ""}`.trim() : "Visite sans nom"}
                    </div>
                    <div className="text-xs text-stone-500 truncate">
                      {v.ref && <span className="font-mono">{v.ref} · </span>}
                      {v.chantier?.adresse || "Adresse non renseignée"} {v.chantier?.ville}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full shrink-0 flex items-center gap-1"
                    style={v.statut === "terminee" ? { backgroundColor: G_PALE, color: G_DARK } : { backgroundColor: "#FEF3C7", color: "#92400E" }}>
                    {v.statut === "terminee" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {v.statut === "terminee" ? "Terminée" : "En cours"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
                  <span>{(v.rooms || []).length} pièce(s)</span>
                  <span>{fmt(c.totals.solNet, 1)} m²</span>
                  <span>{c.ouvrages.length} ouvrage(s)</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? G_MID : G_LIGHT }} />
                </div>
              </button>
              <div className="flex border-t-2 border-stone-100">
                <button onClick={() => onStatut(v.id, v.statut === "terminee" ? "en_cours" : "terminee")}
                  className="flex-1 h-11 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-600 active:bg-stone-50">
                  <CheckCircle2 size={13} /> {v.statut === "terminee" ? "Rouvrir" : "Terminer"}
                </button>
                <div className="w-0.5 bg-stone-100" />
                <button onClick={() => onDup(v.id)} className="flex-1 h-11 flex items-center justify-center gap-1.5 text-[11px] font-bold text-stone-600 active:bg-stone-50">
                  <Copy size={13} /> Dupliquer
                </button>
                <div className="w-0.5 bg-stone-100" />
                <button onClick={() => setConfirm(v)} className="flex-1 h-11 flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-600 active:bg-red-50">
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t-2 border-stone-200">
        <Btn onClick={onNew} className="w-full"><Plus size={20} /> Nouvelle visite</Btn>
      </div>

      <Confirm open={!!confirm} titre="Supprimer la visite ?"
        texte={`« ${confirm?.client?.nom || confirm?.ref || "Visite"} » et toutes ses pièces, photos et croquis seront définitivement supprimés.`}
        onCancel={() => setConfirm(null)}
        onOk={() => { onDel(confirm.id); setConfirm(null); }} />
    </div>
  );
}

/* -------------------------------------------------------------------- */

export function InfosScreen({ v, set }) {
  const c = (k, val) => set({ ...v, client: { ...v.client, [k]: val } });
  const h = (k, val) => set({ ...v, chantier: { ...v.chantier, [k]: val } });
  return (
    <div className="p-3 space-y-3 pb-28">
      <Section title="Dossier" defaultOpen>
        <div className="space-y-2">
          <Field label="Référence du dossier" value={v.ref} onChange={(x) => set({ ...v, ref: x })} placeholder="Ex. BRN-2026-042" />
          <Field label="Date de visite" type="date" value={v.chantier.dateVisite} onChange={(x) => h("dateVisite", x)} />
          <Field label="Nom du métreur" value={v.chantier.metreur} onChange={(x) => h("metreur", x)} />
          <Select label="Origine de la demande" value={v.client.origine} onChange={(x) => c("origine", x)} options={ORIGINES} />
        </div>
      </Section>

      <Section title="Client" defaultOpen>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Nom" value={v.client.nom} onChange={(x) => c("nom", x)} />
            <Field label="Prénom" value={v.client.prenom} onChange={(x) => c("prenom", x)} />
          </div>
          <Field label="Société" value={v.client.societe} onChange={(x) => c("societe", x)} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Téléphone" type="tel" value={v.client.tel} onChange={(x) => c("tel", x)} />
            <Field label="E-mail" type="email" value={v.client.email} onChange={(x) => c("email", x)} />
          </div>
        </div>
      </Section>

      <Section title="Chantier">
        <div className="space-y-2">
          <Field label="Adresse du chantier" value={v.chantier.adresse} onChange={(x) => h("adresse", x)} />
          <div className="grid grid-cols-3 gap-2">
            <Field label="Code postal" value={v.chantier.cp} onChange={(x) => h("cp", x)} />
            <div className="col-span-2"><Field label="Ville" value={v.chantier.ville} onChange={(x) => h("ville", x)} /></div>
          </div>
          <Select label="Type de bien" value={v.chantier.typeBien} onChange={(x) => h("typeBien", x)} options={TYPES_BIEN} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Superficie approx. (m²)" value={v.chantier.superficie} onChange={(x) => h("superficie", x)} />
            <Field label="Année de construction" value={v.chantier.annee} onChange={(x) => h("annee", x)} />
          </div>
        </div>
      </Section>

      <Section title="Occupation & accès">
        <div className="space-y-3">
          <Chips label="Statut d'occupation" value={v.chantier.occupation} onChange={(x) => h("occupation", x)} options={OCCUPATIONS} />
          <Chips label="Présent lors de la visite" value={v.chantier.present} onChange={(x) => h("present", x)} options={PRESENTS} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Étage" value={v.chantier.etage} onChange={(x) => h("etage", x)} />
            <div className="flex items-end pb-1">
              <Toggle label="Ascenseur" checked={v.chantier.ascenseur} onChange={(x) => h("ascenseur", x)} />
            </div>
          </div>
          <Field label="Conditions d'accès" value={v.chantier.acces} onChange={(x) => h("acces", x)} placeholder="Escalier étroit, digicode, portage…" />
          <Field label="Stationnement" value={v.chantier.stationnement} onChange={(x) => h("stationnement", x)} placeholder="Zone piétonne, permis requis…" />
        </div>
      </Section>

      <Section title="Risques sanitaires" accent>
        <div className="space-y-3">
          {Number(v.chantier.annee) > 0 && Number(v.chantier.annee) < 1997 && (
            <div className="rounded-lg p-2 flex items-start gap-1.5" style={{ backgroundColor: "#FEE2E2" }}>
              <AlertTriangle size={13} className="text-red-700 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-900">Bâti antérieur à 1997 : repérage amiante avant travaux (RAAT) obligatoire avant toute démolition.</p>
            </div>
          )}
          <Chips label="Amiante" value={v.chantier.amiante} onChange={(x) => h("amiante", x)}
            options={["Absent", "Présent", "Suspecté", "Diagnostic à faire", "Non concerné"]} />
          <Chips label="Plomb" value={v.chantier.plomb} onChange={(x) => h("plomb", x)}
            options={["Absent", "Présent", "Suspecté", "Diagnostic à faire", "Non concerné"]} />
        </div>
      </Section>

      <Section title="Projet">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Délai souhaité" value={v.chantier.delai} onChange={(x) => h("delai", x)} />
            <Field label="Budget annoncé" value={v.chantier.budget} onChange={(x) => h("budget", x)} />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Observations générales</span>
            <textarea value={v.chantier.observations} onChange={(x) => h("observations", x.target.value)}
              className="w-full h-28 p-3 rounded-xl border-2 border-stone-300 focus:border-lime-700 focus:outline-none resize-none"
              placeholder="Demande du client, priorités, contraintes…" />
          </label>
        </div>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------------------- */

export function RoomsScreen({ v, set, onOpen, onAdd, onReport, onRecap }) {
  const [confirm, setConfirm] = useState(null);
  const c = calcVisite(v);
  const p = calcProgression(v);

  const move = (i, d) => {
    const r = [...v.rooms];
    const j = i + d;
    if (j < 0 || j >= r.length) return;
    [r[i], r[j]] = [r[j], r[i]];
    set({ ...v, rooms: r });
  };
  const dup = (id) => {
    const src = v.rooms.find((r) => r.id === id);
    const same = v.rooms.filter((r) => r.typeId === src.typeId).length;
    set({
      ...v, rooms: [...v.rooms, {
        ...JSON.parse(JSON.stringify(src)), id: uid(),
        nom: `${src.typeLabel} ${same + 1}`, photos: [], sketches: [],
      }],
    });
  };

  return (
    <div className="pb-28">
      <div className="px-3 pt-3">
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[
            { k: "Pièces", v: v.rooms.length },
            { k: "Sol", v: fmt(c.totals.solNet, 1) },
            { k: "Murs", v: fmt(c.totals.mursNet, 1) },
            { k: "Ouvrages", v: c.ouvrages.length },
          ].map((x) => (
            <div key={x.k} className="rounded-xl p-2" style={{ backgroundColor: INK }}>
              <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold">{x.k}</div>
              <div className="font-mono font-bold text-base truncate" style={{ color: G_LIGHT }}>{x.v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white border-2 border-stone-200 p-2.5 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Progression de la visite</span>
            <span className="font-mono font-bold text-sm" style={{ color: G_DARK }}>{p.pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, backgroundColor: p.pct === 100 ? G_MID : G_LIGHT }} />
          </div>
          <div className="flex flex-wrap gap-1">
            {p.steps.map((s) => (
              <span key={s.k} className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={s.ok ? { backgroundColor: G_PALE, color: G_DARK } : { backgroundColor: "#F5F5F4", color: "#A8A29E" }}>
                {s.ok ? "✓" : "○"} {s.k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 space-y-2">
        {v.rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-stone-200">
              <Home size={28} className="text-stone-400" />
            </div>
            <p className="font-bold text-stone-700">Aucune pièce</p>
            <p className="text-sm text-stone-500 mt-1">Ajoutez une pièce pour commencer le métré.</p>
          </div>
        )}
        {v.rooms.map((r, i) => {
          const rc = calcRoom(r);
          const t = TYPES.find((x) => x.id === r.typeId);
          const Icon = t ? t.Icon : Package;
          const nbT = Object.values(r.travaux || {}).filter((x) => x.on).length;
          const errs = validateRoom(r).filter((e) => e.lvl === "err").length;
          return (
            <div key={r.id} className="rounded-2xl bg-white border-2 border-stone-200 overflow-hidden">
              <button onClick={() => onOpen(r.id)} className="w-full flex items-center gap-3 p-3 text-left active:bg-stone-50">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: G_PALE }}>
                  <Icon size={20} style={{ color: G_DARK }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900 truncate flex items-center gap-1.5">
                    {r.nom}
                    {errs > 0 && <AlertTriangle size={13} className="text-red-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono truncate">
                    {r.niveau} · Sol {fmt(rc.solNet, 1)} · Murs {fmt(rc.mursNet, 1)} · Pl. {fmt(rc.plinthesRetenu, 1)} ml
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-bold" style={{ color: nbT ? G_DARK : "#A8A29E" }}>{nbT} ouvr.</div>
                  <div className="text-[10px] text-stone-400">{rc.nbPhotos} photo(s)</div>
                </div>
              </button>
              <div className="flex border-t-2 border-stone-100">
                <button onClick={() => move(i, -1)} disabled={i === 0}
                  className="w-12 h-10 flex items-center justify-center disabled:opacity-25"><ArrowUp size={14} /></button>
                <button onClick={() => move(i, 1)} disabled={i === v.rooms.length - 1}
                  className="w-12 h-10 flex items-center justify-center disabled:opacity-25"><ArrowDown size={14} /></button>
                <div className="flex-1" />
                <button onClick={() => dup(r.id)} className="px-3 h-10 flex items-center gap-1.5 text-[11px] font-bold text-stone-600">
                  <Copy size={13} /> Dupliquer
                </button>
                <button onClick={() => setConfirm(r)} className="px-3 h-10 flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-2.5 bg-white/95 backdrop-blur border-t-2 border-stone-200 flex gap-2">
        <Btn onClick={onAdd} className="flex-1"><Plus size={20} /> Ajouter une pièce</Btn>
        <Btn variant="ghost" onClick={onRecap} className="px-4"><Calculator size={19} /></Btn>
        <Btn variant="ghost" onClick={onReport} className="px-4"><FileText size={19} /></Btn>
      </div>

      <Confirm open={!!confirm} titre="Supprimer la pièce ?"
        texte={`« ${confirm?.nom} » et son métré seront supprimés.`}
        onCancel={() => setConfirm(null)}
        onOk={() => { set({ ...v, rooms: v.rooms.filter((x) => x.id !== confirm.id) }); setConfirm(null); }} />
    </div>
  );
}

/* -------------------------------------------------------------------- */

export function TypesScreen({ onPick }) {
  const [custom, setCustom] = useState("");
  return (
    <div className="p-3 pb-28">
      <p className="text-xs text-stone-500 mb-3">
        Le type choisi ouvre les modules correspondants (cuisine, sanitaire, façade, toiture, extérieur).
      </p>
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <button key={t.id} onClick={() => onPick(t)}
            className="rounded-2xl bg-white border-2 border-stone-200 p-2.5 flex flex-col items-center gap-1.5 active:bg-lime-50 min-h-[84px] justify-center">
            <t.Icon size={22} style={{ color: G_DARK }} />
            <span className="text-[10px] font-bold text-stone-700 text-center leading-tight">{t.label}</span>
            {t.modules && <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded" style={{ backgroundColor: G_PALE, color: G_DARK }}>module</span>}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white border-2 border-dashed border-stone-300 p-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-2">Pièce personnalisée</div>
        <div className="flex gap-2">
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex. Atelier, Réserve…"
            className="flex-1 h-[48px] px-3 rounded-xl border-2 border-stone-300 focus:border-lime-700 focus:outline-none" />
          <Btn onClick={() => { if (custom.trim()) { onPick({ id: "custom_" + uid(), label: custom.trim(), modules: [] }); setCustom(""); } }} className="px-5">
            <Plus size={20} />
          </Btn>
        </div>
      </div>
    </div>
  );
}
