import { uid } from "./calc";

/* ==================================================================== */
/*  MODULE 3 — PERSISTANCE                                              */
/*  Adaptateur : IndexedDB en primaire, mémoire en repli.               */
/*  Même interface pour brancher Supabase / Firebase plus tard.         */
/* ==================================================================== */

const DB_NAME = "brn_visites";
const DB_VER = 1;
const S_VISITES = "visites";
const S_BLOBS = "blobs";

let _db = null;
let _mode = "idb"; // 'idb' | 'memory'
const _mem = { visites: new Map(), blobs: new Map() };

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db);
    if (typeof indexedDB === "undefined") return reject(new Error("no-idb"));
    let req;
    try { req = indexedDB.open(DB_NAME, DB_VER); }
    catch (e) { return reject(e); }
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(S_VISITES)) db.createObjectStore(S_VISITES, { keyPath: "id" });
      if (!db.objectStoreNames.contains(S_BLOBS)) db.createObjectStore(S_BLOBS);
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error || new Error("idb-error"));
    req.onblocked = () => reject(new Error("idb-blocked"));
  });
}

function tx(store, mode, fn) {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      let out;
      try { out = fn(s); } catch (e) { return reject(e); }
      t.oncomplete = () => resolve(out && out.result !== undefined ? out.result : out);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }).catch(reject);
  });
}

function reqP(r) {
  return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}

export const Store = {
  mode: () => _mode,

  async init() {
    try {
      await openDB();
      // test d'écriture réel : certains environnements exposent l'API mais la bloquent
      await tx(S_VISITES, "readwrite", (s) => s.put({ id: "__probe__", t: Date.now() }));
      await tx(S_VISITES, "readwrite", (s) => s.delete("__probe__"));
      _mode = "idb";
    } catch {
      _mode = "memory";
    }
    return _mode;
  },

  async listVisites() {
    if (_mode === "memory") return [..._mem.visites.values()];
    try { return await tx(S_VISITES, "readonly", (s) => reqP(s.getAll())); }
    catch { return [..._mem.visites.values()]; }
  },

  async getVisite(id) {
    if (_mode === "memory") return _mem.visites.get(id) || null;
    try { return await tx(S_VISITES, "readonly", (s) => reqP(s.get(id))); }
    catch { return _mem.visites.get(id) || null; }
  },

  async saveVisite(v) {
    const rec = { ...v, updatedAt: Date.now() };
    _mem.visites.set(rec.id, rec);
    if (_mode === "idb") {
      try { await tx(S_VISITES, "readwrite", (s) => s.put(rec)); }
      catch { _mode = "memory"; }
    }
    return rec;
  },

  async deleteVisite(id) {
    const v = await this.getVisite(id);
    if (v) {
      const keys = [];
      (v.rooms || []).forEach((r) => (r.photos || []).forEach((p) => p.blobKey && keys.push(p.blobKey)));
      for (const k of keys) await this.delBlob(k);
    }
    _mem.visites.delete(id);
    if (_mode === "idb") { try { await tx(S_VISITES, "readwrite", (s) => s.delete(id)); } catch {} }
  },

  async putBlob(blob) {
    const key = "b_" + uid();
    _mem.blobs.set(key, blob);
    if (_mode === "idb") {
      try { await tx(S_BLOBS, "readwrite", (s) => s.put(blob, key)); }
      catch { _mode = "memory"; }
    }
    return key;
  },

  async getBlob(key) {
    if (_mem.blobs.has(key)) return _mem.blobs.get(key);
    if (_mode === "idb") {
      try {
        const b = await tx(S_BLOBS, "readonly", (s) => reqP(s.get(key)));
        if (b) _mem.blobs.set(key, b);
        return b || null;
      } catch { return null; }
    }
    return null;
  },

  async delBlob(key) {
    _mem.blobs.delete(key);
    if (_mode === "idb") { try { await tx(S_BLOBS, "readwrite", (s) => s.delete(key)); } catch {} }
  },
};

/* ---- Cache d'URLs d'aperçu ---- */
const _urls = new Map();
export async function blobUrl(key) {
  if (!key) return null;
  if (_urls.has(key)) return _urls.get(key);
  const b = await Store.getBlob(key);
  if (!b) return null;
  const u = URL.createObjectURL(b);
  _urls.set(key, u);
  return u;
}
export function forgetUrl(key) {
  const u = _urls.get(key);
  if (u) { URL.revokeObjectURL(u); _urls.delete(key); }
}

/* ---- Compression d'image ---- */
export const MAX_PHOTO_MB = 12;

export function compressImage(file, maxPx = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_PHOTO_MB * 1024 * 1024)
      return reject(new Error(`Photo trop volumineuse (${(file.size / 1048576).toFixed(1)} Mo, max ${MAX_PHOTO_MB} Mo)`));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const r = Math.min(1, maxPx / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * r);
      c.height = Math.round(img.height * r);
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("Compression impossible"))), "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image illisible")); };
    img.src = url;
  });
}

export function dataUrlToBlob(dataUrl) {
  const [head, body] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)[1];
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/* ==================================================================== */
/*  FABRIQUES                                                           */
/* ==================================================================== */

export const newZone = (nom = "Zone principale") => ({
  id: uid(), nom, forme: "rectangle", L: "", l: "", H: "2.50", H2: "", p: "", a: "", b: "",
  surfaceManu: "", perimManu: "", qte: "1", deduire: false, obs: "",
});

export const newOuverture = (type = "Fenêtre") => ({
  id: uid(), type, nom: type, L: type === "Porte" ? "0.83" : "1.20",
  H: type === "Porte" ? "2.04" : "1.40", qte: "1",
  largeurAuSol: "", profTableau: "0.20", appui: false, linteau: false, obs: "",
  deductions: { murs: true, peinture: true, enduit: true, doublage: true, isolation: true, faience: true, papier: true, plinthes: type === "Porte" },
  retours: { tabG: false, tabD: false, linteau: false, appui: false, seuil: false },
});

export const newRoom = (type, nom) => ({
  id: uid(), typeId: type.id, typeLabel: type.label, modules: type.modules || [],
  nom: nom || type.label, niveau: "RDC",
  zones: [newZone()], ouvertures: [],
  murs: { traiterRetours: true, retenu: "" },
  sol: { revetement: "Carrelage", marge: 10, options: {}, nonTraitees: [], retenu: "" },
  plafond: { mode: "Peinture seule", ajouts: [], deductions: [], retenu: "" },
  plinthes: { marge: 7, deductions: [], retenu: "" },
  faience: [], faienceMarge: 10, faienceRetenu: "",
  doublages: [],
  peinture: { supports: {}, preparation: {}, couches: 2 },
  equipements: {}, etats: {}, travaux: {},
  elec: [], q: {},
  photos: [], sketches: [], notes: "", notesInternes: "", pointsAVerifier: [],
});

export const newVisite = () => ({
  id: uid(), ref: "", statut: "en_cours", createdAt: Date.now(), updatedAt: Date.now(),
  client: { nom: "", prenom: "", societe: "", tel: "", email: "", origine: "" },
  chantier: {
    adresse: "", ville: "", cp: "", dateVisite: new Date().toISOString().slice(0, 10),
    metreur: "", typeBien: "", occupation: "", present: "", etage: "", ascenseur: false,
    acces: "", stationnement: "", superficie: "", annee: "", delai: "", budget: "",
    amiante: "", plomb: "", observations: "",
  },
  rooms: [], checklist: {}, notesGenerales: "", notesInternes: "",
});
