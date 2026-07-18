import { useState, useMemo } from "react";
import { Check, Download, FileText, Printer, RefreshCw, X } from "lucide-react";
import { StoredImg } from "../components/SketchPad";
import { Btn, Chips, Line, Section, Toggle } from "../components/ui";
import { AUTO, calcProgression, calcRoom, calcVisite, fmt, qValider } from "../lib/calc";
import { ouvragesDeVisite, ouvragesParLot } from "../lib/travaux";
import { profilDe } from "../lib/profils";
import { BlocPiece, BlocFacade, aValeur } from "../components/RapportBlocs";
import { CHECKLIST, G_DARK, G_LIGHT, G_PALE, LOTS, estExterieur, n } from "../lib/catalogue";

/* ==================================================================== */
/*  MODULE 8 — RÉCAP GLOBAL / CHECK-LIST / RAPPORT                      */
/* ==================================================================== */

export function RecapScreen({ v, set, toast }) {
  const c = useMemo(() => calcVisite(v), [v]);
  /* Les ouvrages sont TOUJOURS reconstruits depuis la visite courante. */
  const ouvrages = useMemo(() => ouvragesDeVisite(v), [v]);
  const [fPiece, setFPiece] = useState("");
  const [fLot, setFLot] = useState("");
  const [fUnit, setFUnit] = useState("");
  const [fInter, setFInter] = useState("");
  const [confirmGlobal, setConfirmGlobal] = useState(false);

  const rows = ouvrages
    .filter((o) => !fPiece || o.roomId === fPiece)
    .filter((o) => !fLot || o.lot === fLot)
    .filter((o) => !fUnit || o.unit === fUnit)
    .filter((o) => !fInter || o.intervention === fInter);

  const grouped = {};
  rows.forEach((o) => {
    const k = o.lotNom || "Autres";
    (grouped[k] = grouped[k] || []).push(o);
  });

  const consolide = {};
  rows.forEach((o) => {
    const k = `${o.lotNom}|${o.label}|${o.unit}`;
    if (!consolide[k]) consolide[k] = { ...o, qteCalc: 0, qteRetenue: 0, pieces: [] };
    consolide[k].qteCalc += o.qteCalc;
    consolide[k].qteRetenue += o.qteRetenue;
    consolide[k].pieces.push(o.roomNom);
  });

  const exportCSV = () => {
    const head = ["Lot", "Ouvrage", "Pièce", "Intervention", "Qté calculée", "Qté retenue", "Unité", "Matériau", "Référence", "Observations"];
    const lines = [head.join(";")];
    rows.forEach((o) => lines.push([
      o.lotNom, o.label, o.roomNom, o.intervention,
      fmt(o.qteCalc).replace(/\s/g, ""), fmt(o.qteRetenue).replace(/\s/g, ""),
      o.unit, o.materiau, o.reference, (o.obs || "").replace(/;/g, ","),
    ].join(";")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `recap_${v.ref || "visite"}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Récapitulatif exporté");
  };

  const totaux = [
    { k: "Sol net", v: c.totals.solNet, u: "m²" },
    { k: "Sol retenu", v: c.totals.solRetenu, u: "m²" },
    { k: "Plafond", v: c.totals.plafondNet, u: "m²" },
    { k: "Murs nets", v: c.totals.mursNet, u: "m²" },
    { k: "Peinture murs", v: c.totals.peintureMurs, u: "m²" },
    { k: "Enduit", v: c.totals.enduitNet, u: "m²" },
    { k: "Plinthes", v: c.totals.plinthesRetenu, u: "ml" },
    { k: "Faïence", v: c.totals.faienceRetenu, u: "m²" },
    { k: "Doublage", v: c.totals.doublageNet, u: "m²" },
    { k: "Cloisons", v: c.totals.cloisonSurf, u: "m²" },
    { k: "Isolation", v: c.totals.isolationNet, u: "m²" },
    { k: "Volume", v: c.totals.volume, u: "m³" },
    { k: "Portes", v: c.totals.nbPortes, u: "u", d: 0 },
    { k: "Fenêtres", v: c.totals.nbFenetres, u: "u", d: 0 },
    { k: "Radiateurs", v: c.totals.nbRadiateurs, u: "u", d: 0 },
    { k: "Équip. sanitaires", v: c.totals.nbSanitaires, u: "u", d: 0 },
  ];

  const totauxElec = [
    { k: "Prises (appareillages)", v: c.totals.nbPrises, fort: true },
    { k: "— dont simples", v: c.totals.nbPriseSimple },
    { k: "— dont doubles", v: c.totals.nbPriseDouble },
    { k: "— dont triples", v: c.totals.nbPriseTriple },
    { k: "Socles de prise (info)", v: c.totals.nbSocles, info: true },
    { k: "Interrupteurs", v: c.totals.nbInter, fort: true },
    { k: "— dont simples", v: c.totals.nbInterSimple },
    { k: "— dont doubles", v: c.totals.nbInterDouble },
    { k: "— dont triples", v: c.totals.nbInterTriple },
    { k: "Points lumineux", v: c.totals.nbPoints, fort: true },
    { k: "Spots", v: c.totals.nbSpots, fort: true },
    { k: "Prises RJ45", v: c.totals.nbRJ45, fort: true },
    { k: "Équipements spécialisés", v: c.totals.nbSpec, fort: true },
    { k: "Courant faible", v: c.totals.nbFaible },
  ];

  const aValider = [];
  v.rooms.forEach((r) => {
    const rc = calcRoom(r);
    rc.quantites.forEach((x) => {
      if (x.mode === AUTO && x.calc > 0) aValider.push({ roomId: r.id, roomNom: r.nom, ...x });
    });
  });

  const validerChantier = () => {
    try {
      // Toutes les pièces sont calculées d'abord : si une seule échoue,
      // aucune n'est modifiée (pas de validation à moitié appliquée).
      let n0 = 0;
      const rejets = [];
      const rooms = v.rooms.map((r) => {
        const rc = calcRoom(r);
        const q = { ...(r.q || {}) };
        rc.quantites.forEach((x) => {
          if (x.mode !== AUTO) return;                 // valeurs manuelles/validées conservées
          if (!Number.isFinite(x.calc) || x.calc <= 0) return;
          const val = qValider(x.calc);
          if (val === null) { rejets.push(`${r.nom} — ${x.label}`); return; }
          q[x.k] = val;
          n0++;
        });
        return { ...r, q };
      });

      if (rejets.length) console.warn("[BRN] Quantités non validables :", rejets.join(" | "));
      set({ ...v, rooms });
      setConfirmGlobal(false);
      toast(n0 ? `${n0} métré(s) validé(s) sur le chantier` : "Aucun métré à valider");
    } catch (e) {
      console.error("[BRN] Échec de la validation globale du chantier");
      console.error("[BRN] Visite :", v?.ref, "| id :", v?.id);
      console.error("[BRN] Erreur :", e);
      setConfirmGlobal(false);
      toast("Validation impossible — aucune donnée modifiée");
    }
  };

  return (
    <div className="p-3 space-y-3 pb-28">
      <Section title="Totaux du chantier" accent defaultOpen>
        <div className="grid grid-cols-2 gap-x-3">
          {totaux.map((t) => <Line key={t.k} k={t.k} v={fmt(t.v, t.d ?? 2)} u={t.u} strong={t.v > 0} />)}
        </div>
      </Section>

      <Section title="Électricité — totaux du chantier" accent defaultOpen>
        <div>
          {totauxElec.map((t) => (
            <div key={t.k} className="flex items-center justify-between py-0.5">
              <span className={`text-[11px] ${t.fort ? "font-bold text-stone-800" : t.info ? "text-stone-400 italic" : "text-stone-500"}`}>{t.k}</span>
              <span className="font-mono text-[12px] font-bold" style={{ color: t.info ? "#A8A29E" : t.v > 0 ? G_DARK : "#D6D3D1" }}>
                {fmt(t.v, 0)}
              </span>
            </div>
          ))}
          <p className="text-[8px] text-stone-500 mt-1 leading-snug">
            Une prise double compte pour <b>1 appareillage</b> ; les socles sont donnés à titre indicatif.
          </p>
        </div>
      </Section>

      <Section title="Validation des métrés" accent defaultOpen badge={aValider.length}>
        <div className="space-y-2">
          <p className="text-[10px] text-stone-600 leading-snug">
            Les quantités calculées alimentent déjà les postes de travaux. La validation fige la valeur :
            elle ne suivra plus les dimensions, et un avertissement s'affichera si le calcul change.
          </p>
          {aValider.length === 0 ? (
            <p className="text-[11px] font-bold text-center py-2" style={{ color: G_DARK }}>
              Tous les métrés calculés sont validés.
            </p>
          ) : (
            <Btn onClick={() => setConfirmGlobal(true)} className="w-full">
              <Check size={17} /> Valider tous les métrés du chantier ({aValider.length})
            </Btn>
          )}
        </div>
      </Section>

      {confirmGlobal && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80%] flex flex-col overflow-hidden">
            <div className="p-3 border-b-2 border-stone-100">
              <div className="font-bold text-stone-900">Valider tous les métrés du chantier</div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Valeurs qui seront reprises comme quantités retenues :
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {v.rooms.map((r) => {
                const items = aValider.filter((x) => x.roomId === r.id);
                if (!items.length) return null;
                return (
                  <div key={r.id}>
                    <div className="text-[10px] font-bold uppercase" style={{ color: G_DARK }}>{r.nom}</div>
                    {items.map((x) => (
                      <div key={x.k} className="flex items-center justify-between py-0.5 border-b border-stone-50">
                        <span className="text-[11px] text-stone-600">{x.label}</span>
                        <span className="font-mono text-[11px] font-bold" style={{ color: G_DARK }}>
                          {fmt(x.calc)} {x.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t-2 border-stone-100 flex gap-2">
              <Btn variant="ghost" onClick={() => setConfirmGlobal(false)} className="flex-1">Annuler</Btn>
              <Btn onClick={validerChantier} className="flex-1"><Check size={17} /> Valider</Btn>
            </div>
          </div>
        </div>
      )}

      <Section title="Filtres" defaultOpen>
        <div className="space-y-2">
          <Chips label="Pièce" value={fPiece} onChange={setFPiece} options={v.rooms.map((r) => ({ v: r.id, l: r.nom }))} />
          <Chips label="Lot" value={fLot} onChange={setFLot} options={[...new Set(ouvrages.map((o) => o.lot))].map((id) => ({ v: id, l: (LOTS.find((l) => l.id === id) || {}).nom || id }))} />
          <Chips label="Unité" value={fUnit} onChange={setFUnit} options={[...new Set(ouvrages.map((o) => o.unit))]} />
          <Chips label="Intervention" value={fInter} onChange={setFInter} options={[...new Set(ouvrages.map((o) => o.intervention).filter(Boolean))]} />
          {(fPiece || fLot || fUnit || fInter) && (
            <Btn variant="ghost" onClick={() => { setFPiece(""); setFLot(""); setFUnit(""); setFInter(""); }} className="w-full min-h-[40px]">
              <X size={15} /> Effacer les filtres
            </Btn>
          )}
        </div>
      </Section>

      <Section title={`Quantitatif consolidé (${Object.keys(consolide).length})`} accent defaultOpen>
        {Object.keys(consolide).length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">Aucun ouvrage ne correspond aux filtres.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([lotNom, items]) => {
              const cons = {};
              items.forEach((o) => {
                const k = `${o.label}|${o.unit}`;
                if (!cons[k]) cons[k] = { ...o, qteCalc: 0, qteRetenue: 0, pieces: [] };
                cons[k].qteCalc += o.qteCalc;
                cons[k].qteRetenue += o.qteRetenue;
                cons[k].pieces.push(o.roomNom);
              });
              return (
                <div key={lotNom}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G_DARK }}>{lotNom}</div>
                  <div className="rounded-lg border-2 border-stone-100 overflow-hidden">
                    {Object.values(cons).map((o, i) => (
                      <div key={i} className="px-2 py-1.5 border-b border-stone-50 last:border-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-stone-800 truncate">{o.label}</span>
                          <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: G_DARK }}>
                            {fmt(o.qteRetenue)} <span className="text-[9px] text-stone-400">{o.unit}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] text-stone-400 truncate">{[...new Set(o.pieces)].join(", ")}</span>
                          {Math.abs(o.qteCalc - o.qteRetenue) > 0.01 && (
                            <span className="text-[9px] font-mono text-stone-400 shrink-0">calc. {fmt(o.qteCalc)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Check-list de fin de visite" badge={CHECKLIST.filter((k) => v.checklist?.[k]).length}>
        <div className="space-y-0.5">
          {CHECKLIST.map((k) => (
            <Toggle key={k} label={k} checked={!!v.checklist?.[k]}
              onChange={(x) => set({ ...v, checklist: { ...v.checklist, [k]: x } })} />
          ))}
        </div>
      </Section>

      <Section title="Notes générales">
        <div className="space-y-2">
          <textarea value={v.notesGenerales} onChange={(e) => set({ ...v, notesGenerales: e.target.value })}
            placeholder="Synthèse, réserves, demandes du client…"
            className="w-full h-24 p-3 rounded-xl border-2 border-stone-200 focus:border-lime-700 focus:outline-none resize-none" />
          <textarea value={v.notesInternes} onChange={(e) => set({ ...v, notesInternes: e.target.value })}
            placeholder="Notes internes (masquables sur le rapport)"
            className="w-full h-20 p-3 rounded-xl border-2 bg-amber-50 focus:outline-none resize-none" style={{ borderColor: "#FCD34D" }} />
        </div>
      </Section>

      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t-2 border-stone-200">
        <Btn onClick={exportCSV} className="w-full" disabled={!rows.length}>
          <Download size={19} /> Exporter le récapitulatif (CSV)
        </Btn>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  RAPPORT A4                                                          */
/* -------------------------------------------------------------------- */

const PRINT_CSS = `
@page { size: A4 portrait; margin: 12mm 10mm 14mm 10mm; }
@media print {
  .no-print { display: none !important; }
  html, body { background: #fff !important; }
  .rap { box-shadow: none !important; border: 0 !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
  .rap-piece { page-break-inside: avoid; break-inside: avoid; }
  .rap-break { page-break-before: always; break-before: page; }
  .rap-foot { position: fixed; bottom: 0; left: 0; right: 0; font-size: 7pt; color: #777;
    border-top: 1px solid #ccc; padding-top: 2mm; }
  thead { display: table-header-group; }
  tr, img { page-break-inside: avoid; break-inside: avoid; }
}
`;

export function ReportScreen({ v, toast }) {
  /* `nonce` ne sert qu'au bouton « Actualiser » : il force une reconstruction
     complète même si React n'a rien vu changer. */
  const [nonce, setNonce] = useState(0);
  const c = useMemo(() => calcVisite(v), [v, nonce]);
  /* Aucune copie : les ouvrages sont relus dans le catalogue vivant à chaque
     changement de la visite. */
  const ouvrages = useMemo(() => ouvragesDeVisite(v), [v, nonce]);
  /* Horodatage de la construction affichée : il suit v, donc il prouve à
     l'écran que ce qui est lu est bien la dernière version enregistrée. */
  const genereLe = useMemo(() => new Date(), [v, nonce]);
  const [showInternes, setShowInternes] = useState(false);
  const [showPhotos, setShowPhotos] = useState(true);
  const p = calcProgression(v);

  const cli = `${v.client.societe || ""} ${v.client.nom || ""} ${v.client.prenom || ""}`.trim() || "—";
  const dt = v.chantier.dateVisite ? new Date(v.chantier.dateVisite).toLocaleDateString("fr-FR") : "—";

  const reserves = [];
  v.rooms.forEach((r) => (r.pointsAVerifier || []).forEach((x) => { if (x.txt && !x.ok) reserves.push({ piece: r.nom, txt: x.txt }); }));

  /* Consolidation faite sur les ouvrages RELUS, jamais sur un agrégat figé. */
  const parLotCons = useMemo(() => ouvragesParLot(ouvrages), [ouvrages]);

  return (
    <div className="pb-28">
      <style>{PRINT_CSS}</style>

      <div className="no-print p-3 space-y-2">
        {/* Preuve à l'écran que l'aperçu vient bien de la dernière version enregistrée. */}
        <div className="rounded-xl border-2 p-2 flex items-center justify-between gap-2"
          style={{ borderColor: G_LIGHT, backgroundColor: G_PALE }}>
          <div className="min-w-0">
            <div className="text-[14px] font-bold uppercase tracking-wide" style={{ color: G_DARK }}>
              Rapport actualisé le
            </div>
            <div className="text-[16px] font-mono text-stone-700">
              {genereLe.toLocaleDateString("fr-FR")} à {genereLe.toLocaleTimeString("fr-FR")}
            </div>
            <p className="text-[13px] text-stone-500 leading-snug mt-0.5">
              L'aperçu se reconstruit à chaque modification de la visite.
            </p>
          </div>
          <button onClick={() => { setNonce((x) => x + 1); toast("Rapport reconstruit"); }}
            className="h-9 px-2.5 rounded-lg text-[14px] font-bold text-white flex items-center gap-1 shrink-0"
            style={{ backgroundColor: G_DARK }}>
            <RefreshCw size={13} /> Actualiser le rapport
          </button>
        </div>

        <div className="rounded-xl p-2 flex items-start gap-1.5" style={{ backgroundColor: G_PALE }}>
          <FileText size={13} style={{ color: G_DARK }} className="mt-0.5 shrink-0" />
          <p className="text-[14px] text-stone-700 leading-snug">
            Mise en page A4. Le bouton lance l'impression du navigateur : choisissez « Enregistrer au format PDF ».
          </p>
        </div>
        <div className="rounded-xl bg-white border-2 border-stone-200 p-2.5 space-y-1">
          <Toggle label="Inclure les photos" checked={showPhotos} onChange={setShowPhotos} />
          <Toggle label="Afficher les notes internes" checked={showInternes} onChange={setShowInternes} />
        </div>
      </div>

      <div className="rap mx-3 bg-white border-2 border-stone-200 rounded-2xl p-5 text-stone-900" style={{ fontSize: 16 }}>
        {/* En-tête */}
        <div className="flex items-start justify-between border-b-4 pb-2.5 mb-3" style={{ borderColor: G_DARK }}>
          <div className="flex items-start gap-2.5">
            <img src="/logo-brn.png" alt="BRN GROUP" className="h-14 w-auto shrink-0"
              style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }} />
            <div className="leading-tight">
              <div className="font-bold text-2xl leading-none tracking-tight" style={{ color: G_DARK }}>BRN GROUP</div>
              <div className="text-[11px] uppercase tracking-[0.12em] text-stone-500 mt-0.5">
                Entreprise générale du bâtiment · Tous corps d'état
              </div>
              <div className="text-[11px] text-stone-500 mt-1 leading-snug">
                204 avenue Gallieni, 93140 Bondy<br />
                contact@brngroup.fr · www.brn-group.fr
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Rapport de</div>
            <div className="font-bold text-lg leading-tight tracking-tight" style={{ color: G_DARK }}>VISITE TECHNIQUE</div>
            {aValeur(v.ref) && (
              <div className="font-mono text-[14px] text-stone-700 mt-1">{v.ref}</div>
            )}
            <div className="text-[13px] text-stone-500">{dt}</div>
          </div>
        </div>

        {/* Identification */}
        <table className="w-full mb-3" style={{ fontSize: 14 }}>
          <tbody>
            <tr>
              <td className="align-top w-1/2 pr-3">
                <div className="font-bold text-[13px] uppercase tracking-wide mb-1" style={{ color: G_DARK }}>Client</div>
                <div><b>{cli}</b></div>
                {v.client.tel && <div>{v.client.tel}</div>}
                {v.client.email && <div>{v.client.email}</div>}
                {v.client.origine && <div className="text-stone-500">Origine : {v.client.origine}</div>}
              </td>
              <td className="align-top w-1/2">
                <div className="font-bold text-[13px] uppercase tracking-wide mb-1" style={{ color: G_DARK }}>Chantier</div>
                {aValeur(v.chantier.adresse) && <div>{v.chantier.adresse}</div>}
                <div>{v.chantier.cp} {v.chantier.ville}</div>
                <div className="text-stone-500">
                  {[v.chantier.typeBien, v.chantier.etage && `Étage ${v.chantier.etage}`, v.chantier.ascenseur ? "Ascenseur" : null, v.chantier.occupation]
                    .filter(Boolean).join(" · ")}
                </div>
                {v.chantier.metreur && <div className="text-stone-500">Métreur : {v.chantier.metreur}</div>}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Synthèse */}
        <div className="mb-3">
          <div className="font-bold text-[13px] uppercase tracking-wide mb-1" style={{ color: G_DARK }}>Synthèse</div>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { k: "Pièces", v: v.rooms.length },
              { k: "Surface sol", v: fmt(c.totals.solNet, 1) + " m²" },
              { k: "Surface murs", v: fmt(c.totals.mursNet, 1) + " m²" },
              { k: "Ouvrages", v: ouvrages.length },
            ].map((x) => (
              <div key={x.k} className="border-2 rounded p-1.5" style={{ borderColor: G_LIGHT }}>
                <div className="text-[11px] uppercase text-stone-500 font-bold">{x.k}</div>
                <div className="font-mono font-bold text-sm" style={{ color: G_DARK }}>{x.v}</div>
              </div>
            ))}
          </div>
          {(v.chantier.amiante === "Présent" || v.chantier.amiante === "Suspecté" || v.chantier.plomb === "Présent" || v.chantier.plomb === "Suspecté" ||
            (Number(v.chantier.annee) > 0 && Number(v.chantier.annee) < 1997)) && (
            <div className="border-2 border-red-300 bg-red-50 rounded p-1.5 text-[13px] text-red-900 mb-2">
              <b>Risques sanitaires :</b>{" "}
              {[aValeur(v.chantier.amiante) && `Amiante ${v.chantier.amiante}`,
                aValeur(v.chantier.plomb) && `Plomb ${v.chantier.plomb}`].filter(Boolean).join(" · ")}.
              {Number(v.chantier.annee) > 0 && Number(v.chantier.annee) < 1997 && " Bâti antérieur à 1997 : RAAT obligatoire avant toute démolition."}
            </div>
          )}
          {aValeur(v.chantier.demandeClient) && (
            <div className="mb-2">
              <div className="font-bold text-[13px] uppercase tracking-wide mb-0.5" style={{ color: G_DARK }}>
                Demande du client
              </div>
              <p className="text-[14px] leading-snug whitespace-pre-line">{v.chantier.demandeClient}</p>
            </div>
          )}
          {aValeur(v.chantier.contraintes) && (
            <div className="mb-2">
              <div className="font-bold text-[13px] uppercase tracking-wide mb-0.5" style={{ color: G_DARK }}>
                Contraintes et souhaits particuliers
              </div>
              <p className="text-[14px] leading-snug whitespace-pre-line">{v.chantier.contraintes}</p>
            </div>
          )}
          {aValeur(v.chantier.observations) && (
            <div className="mb-2 rounded p-1.5" style={{ backgroundColor: G_PALE }}>
              <div className="font-bold text-[13px] uppercase tracking-wide mb-0.5" style={{ color: G_DARK }}>
                Observations générales BRN GROUP
              </div>
              <p className="text-[14px] leading-snug whitespace-pre-line">{v.chantier.observations}</p>
            </div>
          )}
          {(aValeur(v.chantier.delai) || aValeur(v.chantier.budget)) && (
            <p className="text-[14px] text-stone-600 mt-1">
              {aValeur(v.chantier.delai) && <>Délai souhaité : <b>{v.chantier.delai}</b>. </>}
              {aValeur(v.chantier.budget) && <>Budget annoncé : <b>{v.chantier.budget}</b>.</>}
            </p>
          )}
        </div>

        {/* Relevé détaillé : chaque bloc masque ce qui est vide.
            Aucune surface n'est fusionnée entre pièces — la consolidation
            n'intervient qu'au récapitulatif général, en fin de rapport. */}
        <div className="rap-break mb-1">
          <div className="font-bold text-[19px] uppercase tracking-[0.06em] pb-1.5 mb-1 border-b-4"
            style={{ color: G_DARK, borderColor: G_DARK }}>
            Relevé détaillé des interventions
          </div>
          <p className="text-[11px] text-stone-500 leading-snug mb-2">
            Constats, métrés et interventions retenues, présentés pièce par pièce.
          </p>
        </div>

        {c.perRoom.filter(({ room: r }) => !estExterieur(r.typeId)).length > 0 && (
          <>
            <div className="font-bold text-[14px] uppercase tracking-[0.09em] mb-2 mt-1 border-b-2 pb-1" style={{ color: G_DARK, borderColor: G_LIGHT }}>
              Pièces intérieures
            </div>
            {c.perRoom
              .filter(({ room: r }) => !estExterieur(r.typeId))
              .map(({ room: r, c: rc }) => (
                <BlocPiece key={r.id} r={r} rc={rc} ouvrages={ouvrages.filter((o) => o.roomId === r.id)} showPhotos={showPhotos} showInternes={showInternes} />
              ))}
          </>
        )}

        {c.perRoom.filter(({ room: r }) => estExterieur(r.typeId)).length > 0 && (
          <>
            <div className="font-bold text-[14px] uppercase tracking-[0.09em] mb-2 mt-4 border-b-2 pb-1" style={{ color: G_DARK, borderColor: G_LIGHT }}>
              Zones extérieures
            </div>
            {c.perRoom
              .filter(({ room: r }) => estExterieur(r.typeId))
              .map(({ room: r, c: rc }) =>
                profilDe(r).id === "facade"
                  ? <BlocFacade key={r.id} r={r} rc={rc} ouvrages={ouvrages.filter((o) => o.roomId === r.id)} showPhotos={showPhotos} showInternes={showInternes} />
                  : <BlocPiece key={r.id} r={r} rc={rc} ouvrages={ouvrages.filter((o) => o.roomId === r.id)} showPhotos={showPhotos} showInternes={showInternes} />
              )}
          </>
        )}

        {/* Récapitulatif général — les détails pièce par pièce figurent
            dans chaque bloc ci-dessus ; ici, et seulement ici, on totalise. */}
        <div className="rap-break">
          <div className="font-bold text-[19px] uppercase tracking-[0.06em] pb-1.5 mb-1 border-b-4"
            style={{ color: G_DARK, borderColor: G_DARK }}>
            Récapitulatif général des interventions
          </div>
          <p className="text-[11px] text-stone-500 mb-1.5 leading-snug">
            Totaux tous locaux confondus. Le détail par pièce figure dans chaque section
            « Interventions retenues » ci-dessus.
          </p>
          {Object.keys(parLotCons).length === 0 && (
            <p className="text-[14px] text-stone-500 py-2">Aucune intervention retenue.</p>
          )}
          {Object.entries(parLotCons).map(([lotNom, items]) => (
            <div key={lotNom} className="mb-2 rap-piece">
              <div className="font-bold text-[15px] mb-1" style={{ color: G_DARK }}>{lotNom}</div>
              <table className="w-full" style={{ fontSize: 13 }}>
                <tbody>
                  {items.map((o, i2) => (
                    <tr key={i2} className="border-b border-stone-100">
                      <td className="px-1 py-0.5">{o.label}</td>
                      <td className="px-1 py-0.5 text-stone-400 text-[11px]">{[...new Set(o.pieces)].join(", ")}</td>
                      <td className="px-1 py-0.5 text-right font-mono font-bold w-16">{fmt(o.qteRetenue, o.unit === "u" ? 0 : 2)}</td>
                      <td className="px-1 py-0.5 text-stone-400 font-mono w-8">{o.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Réserves */}
        {(reserves.length > 0 || v.notesGenerales) && (
          <div className="mt-3 rap-piece">
            <div className="font-bold text-[14px] uppercase tracking-[0.09em] mb-2 mt-1 border-b-2 pb-1" style={{ color: G_DARK, borderColor: G_LIGHT }}>
              Réserves & points restant à confirmer
            </div>
            {v.notesGenerales && <p className="text-[14px] mb-1">{v.notesGenerales}</p>}
            {reserves.map((r, i) => (
              <div key={i} className="text-[13px] flex gap-1">
                <span className="text-stone-400">☐</span>
                <span><b>{r.piece} :</b> {r.txt}</span>
              </div>
            ))}
            {showInternes && v.notesInternes && (
              <p className="text-[13px] italic text-amber-800 bg-amber-50 px-1 py-0.5 rounded mt-1">Interne : {v.notesInternes}</p>
            )}
          </div>
        )}

        {/* Validation */}
        <div className="mt-4 pt-2 border-t-2 flex justify-between text-[13px]" style={{ borderColor: G_LIGHT }}>
          <div>
            <div className="text-stone-500">Métreur BRN Group</div>
            <div className="font-bold">{aValeur(v.chantier.metreur) ? v.chantier.metreur : ""}</div>
            <div className="mt-4 border-t border-stone-300 w-32 pt-0.5 text-stone-400">Signature</div>
          </div>
          <div>
            <div className="text-stone-500">Visite effectuée le</div>
            <div className="font-bold">{dt}</div>
            <div className="mt-4 border-t border-stone-300 w-32 pt-0.5 text-stone-400">Signature client</div>
          </div>
        </div>

        <div className="rap-foot mt-3 pt-1 border-t border-stone-200 text-[11px] text-stone-400 flex justify-between">
          <span>BRN Group — Rapport de visite technique {v.ref && `· ${v.ref}`}</span>
          <span>Progression {p.pct}% · Édité le {new Date().toLocaleDateString("fr-FR")}</span>
        </div>
      </div>

      <div className="no-print fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t-2 border-stone-200">
        <Btn onClick={() => window.print()} className="w-full"><Printer size={19} /> Imprimer / Enregistrer en PDF</Btn>
      </div>
    </div>
  );
}
