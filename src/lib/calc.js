import { Check } from "lucide-react";
import { CHECKLIST, ELEC_CAT, FIELD_LABELS, FORMES, LOTS_DEDUC, PLAQUES, n } from "./catalogue";

/* ==================================================================== */
/*  MODULE 2 — MOTEUR DE CALCUL                                         */
/* ==================================================================== */

export const uid = () => Math.random().toString(36).slice(2, 10);

/* ==================================================================== */
/*  ÉTATS DE VALIDATION DES QUANTITÉS                                   */
/*  auto   : la quantité suit le calcul en temps réel                   */
/*  valide : le calcul est accepté et figé à l'instant de validation    */
/*  manuel : valeur saisie ; ne suit plus le calcul                     */
/* ==================================================================== */
/* Déclarations séparées : un `export const A = …, B = …` sur une seule ligne
   n'expose de façon fiable que le premier identifiant pour l'outillage. */
export const AUTO = "auto";
export const VALIDE = "valide";
export const MANUEL = "manuel";

/** Valeur effectivement retenue pour une quantité. */
export function qVal(q, calc) {
  if (!q || !q.mode || q.mode === AUTO) return calc;
  if (q.val === "" || q.val === undefined || q.val === null) return calc;
  return n(q.val);
}
/** Le calcul a-t-il changé depuis que la valeur a été figée ? */
export function qPerime(q, calc) {
  if (!q || !q.mode || q.mode === AUTO) return false;
  if (q.snap === undefined || q.snap === null) return false;
  return Math.abs(n(q.snap) - calc) > 0.005;
}
export function qMode(q) {
  return q && q.mode ? q.mode : AUTO;
}
/** Fige la valeur calculée : passage en « Validé ».
 *  Renvoie null si le calcul n'est pas un nombre exploitable (NaN, Infinity, ≤ 0) :
 *  aucune valeur invalide ne doit atteindre l'état ni IndexedDB. */
export function qValider(calc) {
  const v = Number(calc);
  if (!Number.isFinite(v) || v <= 0) return null;
  const arrondi = Math.round(v * 100) / 100;
  if (!Number.isFinite(arrondi)) return null;
  return { mode: VALIDE, val: arrondi, snap: v };
}
export function qManuel(val, calc) {
  return { mode: MANUEL, val, snap: calc };
}
export const qAuto = () => ({ mode: AUTO, val: "", snap: null });

export const fmt = (v, d = 2) =>
  (Math.round((v || 0) * 10 ** d) / 10 ** d).toLocaleString("fr-FR", {
    minimumFractionDigits: d, maximumFractionDigits: d,
  });

/* --- Zone --- */
export function calcZone(z) {
  const def = FORMES[z.forme] || FORMES.rectangle;
  const q = Math.max(1, n(z.qte) || 1);
  const h = def.hMoy ? def.hMoy(z) : n(z.H);
  const sol = Math.max(0, def.sol(z)) * q;
  const perim = Math.max(0, def.perim(z)) * q;
  return { sol, perim, h, mursBrut: perim * h, volume: sol * h, plafond: sol };
}

/* --- Ouverture --- */
export function calcOuverture(o) {
  const q = Math.max(1, n(o.qte) || 1);
  const surface = n(o.L) * n(o.H) * q;
  const prof = n(o.profTableau);
  const r = o.retours || {};
  const tabG = r.tabG ? prof * n(o.H) * q : 0;
  const tabD = r.tabD ? prof * n(o.H) * q : 0;
  const linteau = r.linteau ? prof * n(o.L) * q : 0;
  const appui = r.appui ? prof * n(o.L) * q : 0;
  const seuil = r.seuil ? prof * n(o.L) * q : 0;
  return {
    surface, tabG, tabD, linteau, appui, seuil,
    tableaux: tabG + tabD,
    retours: tabG + tabD + linteau + appui + seuil,
    largeurSol: (n(o.largeurAuSol) || n(o.L)) * q,
  };
}

/* --- Pièce --- */
export function calcRoom(room) {
  /* zones */
  let solBrut = 0, solDeduit = 0, perim = 0, mursBrut = 0, volume = 0, plafondBrut = 0;
  room.zones.forEach((z) => {
    const c = calcZone(z);
    if (z.deduire) { solDeduit += c.sol; volume -= c.volume; plafondBrut -= c.plafond; }
    else { solBrut += c.sol; perim += c.perim; mursBrut += c.mursBrut; volume += c.volume; plafondBrut += c.plafond; }
  });
  const solNetZones = solBrut - solDeduit;

  /* ouvertures */
  const ded = {};
  LOTS_DEDUC.forEach((l) => (ded[l.k] = 0));
  let ouvTotal = 0, retoursTotal = 0, tableauxTotal = 0, linteauxTotal = 0, appuisTotal = 0;
  let dedPlinthesOuv = 0, nbPortes = 0, nbFenetres = 0;

  room.ouvertures.forEach((o) => {
    const c = calcOuverture(o);
    ouvTotal += c.surface;
    retoursTotal += c.retours;
    tableauxTotal += c.tableaux;
    linteauxTotal += c.linteau;
    appuisTotal += c.appui;
    const d = o.deductions || {};
    LOTS_DEDUC.forEach((l) => { if (d[l.k]) ded[l.k] += c.surface; });
    if (d.plinthes) dedPlinthesOuv += c.largeurSol;
    const q = Math.max(1, n(o.qte) || 1);
    if (o.type === "Porte") nbPortes += q;
    if (o.type === "Fenêtre" || o.type === "Baie vitrée") nbFenetres += q;
  });

  /* murs — par lot */
  const traiterRetours = room.murs?.traiterRetours !== false;
  const bonus = traiterRetours ? retoursTotal : 0;
  const surfLot = (k) => Math.max(0, mursBrut - ded[k] + bonus);
  const mursNet = Math.max(0, mursBrut - ded.murs + bonus);
  const peintureMurs = surfLot("peinture");
  const enduitNet = surfLot("enduit");
  const doublageNet = Math.max(0, mursBrut - ded.doublage);
  const isolationNet = Math.max(0, mursBrut - ded.isolation);
  const papierNet = surfLot("papier");

  /* plinthes */
  const pl = room.plinthes || {};
  const dedManu = (pl.deductions || []).reduce(
    (s, d) => s + n(d.longueur) * Math.max(1, n(d.qte) || 1), 0
  );
  const plinthesBrut = perim;
  const plinthesNet = Math.max(0, plinthesBrut - dedPlinthesOuv - dedManu);
  const margePl = n(pl.marge);
  const plinthesProposee = plinthesNet * (1 + margePl / 100);

  /* sol */
  const sol = room.sol || {};
  const solNonTraite = (sol.nonTraitees || []).reduce(
    (s, z) => s + n(z.surface) * Math.max(1, n(z.qte) || 1), 0
  );
  const solNet = Math.max(0, solNetZones - solNonTraite);
  const margeSol = n(sol.marge);
  const solProposee = solNet * (1 + margeSol / 100);

  /* plafond */
  const pf = room.plafond || {};
  const pfAjout = (pf.ajouts || []).reduce((s, z) => s + n(z.surface) * Math.max(1, n(z.qte) || 1), 0);
  const pfDeduit = (pf.deductions || []).reduce((s, z) => s + n(z.surface) * Math.max(1, n(z.qte) || 1), 0);
  const plafondNetCalc = Math.max(0, plafondBrut + pfAjout - pfDeduit);

  /* faïence */
  let faienceBrut = 0, faienceDed = 0, faienceAjout = 0;
  (room.faience || []).forEach((f) => {
    faienceBrut += n(f.longueur) * n(f.hauteur) * Math.max(1, n(f.nbMurs) || 1);
    faienceDed += (f.deductions || []).reduce((s, d) => s + n(d.surface) * Math.max(1, n(d.qte) || 1), 0);
    faienceAjout += (f.ajouts || []).reduce((s, d) => s + n(d.surface) * Math.max(1, n(d.qte) || 1), 0);
  });
  const faienceNet = Math.max(0, faienceBrut - faienceDed + faienceAjout);
  const margeFai = n(room.faienceMarge);
  const faienceProposee = faienceNet * (1 + margeFai / 100);

  /* doublages / cloisons */
  let cloisonSurf = 0;
  const materiaux = { plaquesM2: 0, plaquesNb: 0, rails: 0, montants: 0, fourrures: 0, suspentes: 0, isolant: 0, bandes: 0, enduitKg: 0, vis: 0, cornieres: 0 };
  (room.doublages || []).forEach((d) => {
    const L = n(d.longueur), H = n(d.hauteur);
    const faces = Math.max(1, n(d.faces) || 1);
    const surf = L * H * faces;
    cloisonSurf += surf;
    const ent = (n(d.entraxe) || 60) / 100;
    const plaque = PLAQUES.find((p) => p.id === d.plaque) || PLAQUES[0];
    materiaux.plaquesM2 += surf;
    materiaux.plaquesNb += Math.ceil(surf / plaque.surf);
    materiaux.rails += 2 * L;
    const nbMont = Math.floor(L / ent) + 1;
    materiaux.montants += nbMont * H;
    materiaux.isolant += d.isolation ? L * H : 0;
    materiaux.bandes += surf * 2.2;
    materiaux.enduitKg += surf * 0.4;
    materiaux.vis += Math.ceil(surf * 25);
    materiaux.cornieres += 2 * H;
  });
  materiaux.fourrures = plafondNetCalc > 0 && (room.plafond?.mode || "").includes("ossature")
    ? plafondNetCalc / 0.6 : 0;
  materiaux.suspentes = materiaux.fourrures > 0 ? Math.ceil(plafondNetCalc / (0.6 * 1.2)) : 0;

  /* équipements */
  const eq = room.equipements || {};
  const countEquip = (fam, filtre) =>
    Object.entries(eq[fam] || {}).reduce((s, [, v]) => {
      if (!v || !v.qte) return s;
      if (filtre && !filtre(v)) return s;
      return s + n(v.qte);
    }, 0);
  const nbSanitaires = countEquip("plomberie");
  const nbRadiateurs = countEquip("chauffage");

  /* --- Électricité : comptage détaillé --- */
  const lignesElec = room.elec || [];
  const elecQte = (id) => lignesElec.filter((l) => l.type === id).reduce((s, l) => s + Math.max(0, n(l.qte)), 0);
  const elecGrp = (grp) => ELEC_CAT.filter((c) => c.grp === grp).reduce((s, c) => s + elecQte(c.id), 0);

  const nbPriseSimple = elecQte("prise_simple");
  const nbPriseDouble = elecQte("prise_double");
  const nbPriseTriple = elecQte("prise_triple");
  /* Appareillages : une prise double = 1 appareillage. */
  const nbPrises = nbPriseSimple + nbPriseDouble + nbPriseTriple;
  /* Socles : information secondaire (double = 2 socles, triple = 3). */
  const nbSocles = nbPriseSimple + nbPriseDouble * 2 + nbPriseTriple * 3;

  const nbInterSimple = elecQte("inter_simple") + elecQte("va_et_vient");
  const nbInterDouble = elecQte("inter_double");
  const nbInterTriple = elecQte("inter_triple");
  const nbInter = nbInterSimple + nbInterDouble + nbInterTriple;

  const nbPoints = elecGrp("points");
  const nbSpots = elecQte("spot");
  const nbRJ45 = elecQte("rj45");
  const nbSpec = elecGrp("spec");
  const nbFaible = elecGrp("faible");
  const nbPointsElec = lignesElec.reduce((s, l) => s + Math.max(0, n(l.qte)), 0);

  /* peinture développée */
  const peint = room.peinture || {};
  const couches = Math.max(1, n(peint.couches) || 2);

  const base = {
    solBrut, solDeduit, solNonTraite, solNetZones, solNet, margeSol, solProposee,
    perim, plafondBrut, plafondNet: plafondNetCalc, pfAjout, pfDeduit,
    mursBrut, ouvTotal, retoursTotal, tableauxTotal, linteauxTotal, appuisTotal,
    mursNet, peintureMurs, enduitNet, doublageNet, isolationNet, papierNet, ded,
    plinthesBrut, dedPlinthesOuv, dedPlinthesManu: dedManu, plinthesNet, margePl, plinthesProposee,
    faienceBrut, faienceDed, faienceAjout, faienceNet, margeFai, faienceProposee,
    cloisonSurf, materiaux, volume,
    nbPortes, nbFenetres, nbPointsElec, nbSanitaires, nbRadiateurs,
    nbPrises, nbSocles, nbPriseSimple, nbPriseDouble, nbPriseTriple,
    nbInter, nbInterSimple, nbInterDouble, nbInterTriple,
    nbPoints, nbSpots, nbRJ45, nbSpec, nbFaible,
    couches, peintureDeveloppee: peintureMurs * couches,
    nbPhotos: (room.photos || []).length,
    nbCroquis: (room.sketches || []).length,
    nbPointsAVerifier: (room.pointsAVerifier || []).filter((p) => p.txt && !p.ok).length,
  };

  /* --- Quantités retenues : auto par défaut, jamais de ressaisie --- */
  const q = room.q || {};
  base.solRetenu = qVal(q.sol, base.solProposee);
  base.plinthesRetenu = qVal(q.plinthes, base.plinthesProposee);
  base.mursRetenu = qVal(q.murs, base.mursNet);
  base.plafondRetenu = qVal(q.plafond, base.plafondNet);
  base.faienceRetenu = qVal(q.faience, base.faienceProposee);
  base.doublageRetenu = qVal(q.doublage, base.doublageNet);

  /* Base de chaque quantité pilotable : calcul, valeur, statut, unité, origine */
  base.quantites = QUANTITES.map((d) => {
    const calc = d.calc(base);
    return {
      ...d, calc, val: qVal(q[d.k], calc), mode: qMode(q[d.k]),
      perime: qPerime(q[d.k], calc),
    };
  });
  base.nbAValider = base.quantites.filter((x) => x.mode === AUTO && x.calc > 0).length;
  base.nbPerimes = base.quantites.filter((x) => x.perime).length;

  return base;
}

/* Quantités pilotables d'une pièce — source unique pour l'UI et les travaux */
export const QUANTITES = [
  { k: "sol", label: "Sol", unit: "m²", origine: "Surface nette + marge de découpe", calc: (c) => c.solProposee },
  { k: "murs", label: "Murs", unit: "m²", origine: "Brut − ouvertures + retours", calc: (c) => c.mursNet },
  { k: "plafond", label: "Plafond", unit: "m²", origine: "Sol + ajouts − déductions", calc: (c) => c.plafondNet },
  { k: "plinthes", label: "Plinthes", unit: "ml", origine: "Périmètre − déductions + marge", calc: (c) => c.plinthesProposee },
  { k: "faience", label: "Faïence", unit: "m²", origine: "Brut − déductions + ajouts + marge", calc: (c) => c.faienceProposee },
  { k: "doublage", label: "Doublage / isolation", unit: "m²", origine: "Murs bruts − ouvertures déduites", calc: (c) => c.doublageNet },
];

/* --- Visite : récap global --- */
export function calcVisite(visite) {
  const rooms = visite.rooms || [];
  const perRoom = rooms.map((r) => ({ room: r, c: calcRoom(r) }));
  const totals = {
    solNet: 0, solRetenu: 0, plafondNet: 0, mursNet: 0, peintureMurs: 0,
    plinthesRetenu: 0, faienceRetenu: 0, doublageNet: 0, cloisonSurf: 0,
    isolationNet: 0, enduitNet: 0, volume: 0,
    nbPortes: 0, nbFenetres: 0, nbRadiateurs: 0, nbSanitaires: 0, nbPhotos: 0,
    nbPrises: 0, nbSocles: 0, nbPriseSimple: 0, nbPriseDouble: 0, nbPriseTriple: 0,
    nbInter: 0, nbInterSimple: 0, nbInterDouble: 0, nbInterTriple: 0,
    nbPoints: 0, nbSpots: 0, nbRJ45: 0, nbSpec: 0, nbFaible: 0,
    nbAValider: 0, nbPerimes: 0,
  };
  perRoom.forEach(({ c }) => Object.keys(totals).forEach((k) => (totals[k] += c[k] || 0)));

  /* agrégat des ouvrages */
  const ouvrages = [];
  perRoom.forEach(({ room, c }) => {
    Object.entries(room.travaux || {}).forEach(([id, t]) => {
      if (!t.on) return;
      const qteCalc = t.autoKey ? c[t.autoKey] || 0 : 0;
      const qteRetenue = t.retenu !== undefined && t.retenu !== "" ? n(t.retenu) : qteCalc;
      ouvrages.push({
        id, roomId: room.id, roomNom: room.nom, lot: t.lot, lotNom: t.lotNom,
        label: t.label, unit: t.unit, intervention: t.intervention || "",
        materiau: t.materiau || "", reference: t.reference || "", obs: t.obs || "",
        qteCalc, qteRetenue, manuel: t.retenu !== undefined && t.retenu !== "",
      });
    });
  });

  const parLot = {};
  ouvrages.forEach((o) => {
    const k = o.lotNom || "Autres";
    if (!parLot[k]) parLot[k] = [];
    const ex = parLot[k].find((x) => x.label === o.label && x.unit === o.unit);
    if (ex) { ex.qteCalc += o.qteCalc; ex.qteRetenue += o.qteRetenue; ex.pieces.push(o.roomNom); }
    else parLot[k].push({ ...o, pieces: [o.roomNom] });
  });

  return { perRoom, totals, ouvrages, parLot };
}

/* --- Progression --- */
export function calcProgression(v) {
  const rooms = v.rooms || [];
  const steps = [
    { k: "Informations client", ok: !!(v.client?.nom && (v.chantier?.adresse || v.client?.adresse)) },
    { k: "Pièces créées", ok: rooms.length > 0 },
    { k: "Dimensions renseignées", ok: rooms.length > 0 && rooms.every((r) => calcRoom(r).solBrut > 0) },
    { k: "Ouvertures renseignées", ok: rooms.length > 0 && rooms.some((r) => (r.ouvertures || []).length > 0) },
    { k: "Métrés complétés", ok: rooms.length > 0 && rooms.every((r) => calcRoom(r).mursBrut > 0) },
    { k: "Photos réalisées", ok: rooms.some((r) => (r.photos || []).length > 0) },
    { k: "Travaux sélectionnés", ok: rooms.some((r) => Object.values(r.travaux || {}).some((t) => t.on)) },
    { k: "Check-list finalisée", ok: CHECKLIST.every((c) => v.checklist?.[c]) },
  ];
  const done = steps.filter((s) => s.ok).length;
  return { steps, done, total: steps.length, pct: Math.round((done / steps.length) * 100) };
}

/* ==================================================================== */
/*  VALIDATIONS                                                         */
/* ==================================================================== */

export function validateRoom(room) {
  const errs = [];
  room.zones.forEach((z, i) => {
    const def = FORMES[z.forme] || FORMES.rectangle;
    def.fields.forEach((f) => {
      if (n(z[f]) < 0) errs.push({ lvl: "err", txt: `Zone ${i + 1} : ${FIELD_LABELS[f]} négative` });
    });
    const c = calcZone(z);
    if (c.sol === 0 && !z.deduire) errs.push({ lvl: "warn", txt: `Zone ${i + 1} : surface nulle` });
    if (n(z.H) > 6) errs.push({ lvl: "warn", txt: `Zone ${i + 1} : hauteur ${z.H} m — à vérifier` });
    if (z.forme === "enL" && (n(z.a) * n(z.b) >= n(z.L) * n(z.l)))
      errs.push({ lvl: "err", txt: `Zone ${i + 1} : le retrait dépasse le rectangle` });
    if (z.forme === "rampant" && n(z.H2) > n(z.H))
      errs.push({ lvl: "err", txt: `Zone ${i + 1} : hauteur basse > hauteur haute` });
  });
  room.ouvertures.forEach((o, i) => {
    if (n(o.L) < 0 || n(o.H) < 0) errs.push({ lvl: "err", txt: `Ouverture ${i + 1} : dimension négative` });
    if (n(o.L) === 0 || n(o.H) === 0) errs.push({ lvl: "warn", txt: `Ouverture ${i + 1} : dimension manquante` });
  });
  const c = calcRoom(room);
  if (c.ouvTotal > c.mursBrut && c.mursBrut > 0)
    errs.push({ lvl: "err", txt: "Les ouvertures dépassent la surface des murs" });
  if (c.plinthesNet === 0 && c.plinthesBrut > 0)
    errs.push({ lvl: "warn", txt: "Plinthes entièrement déduites" });
  return errs;
}
