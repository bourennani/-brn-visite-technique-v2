import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Circle, DoorOpen, Eraser, Minus, MousePointer2, MoveUpRight, PenLine, Redo2, RotateCcw, Ruler, Square, Trash2, Type as TypeIcon, Undo2, X } from "lucide-react";
import { uid } from "../lib/calc";
import { G_DARK, G_LIGHT, G_MID, G_PALE, INK, n } from "../lib/catalogue";
import { blobUrl } from "../lib/store";

/* ==================================================================== */
/*  MODULE 5 — CROQUIS (modèle d'objets)                                */
/*  Corrige : Texte (éditable / déplaçable / persistant)                */
/*            Gomme (traits touchés uniquement, 2 modes, annulable)     */
/*  Ajoute  : bibliothèque d'éléments, cotation murale, liaison métré   */
/* ==================================================================== */

export const OBJ_LIB = [
  { id: "porte_simple", label: "Porte simple", w: 0.83, H: 2.04, cat: "porte", ouv: "Porte" },
  { id: "porte_double", label: "Porte double", w: 1.4, H: 2.04, cat: "porte", ouv: "Porte" },
  { id: "porte_coul", label: "Porte coulissante", w: 0.9, H: 2.04, cat: "porte", ouv: "Porte" },
  { id: "porte_galandage", label: "Porte à galandage", w: 0.9, H: 2.04, cat: "porte", ouv: "Porte" },
  { id: "passage", label: "Passage ouvert", w: 0.9, H: 2.1, cat: "passage", ouv: "Passage ouvert" },
  { id: "fenetre_simple", label: "Fenêtre simple", w: 1.0, H: 1.4, cat: "fenetre", ouv: "Fenêtre" },
  { id: "fenetre_double", label: "Fenêtre double", w: 1.4, H: 1.4, cat: "fenetre", ouv: "Fenêtre" },
  { id: "baie", label: "Baie vitrée", w: 2.4, H: 2.15, cat: "fenetre", ouv: "Baie vitrée" },
  { id: "verriere", label: "Verrière", w: 1.6, H: 1.8, cat: "fenetre", ouv: "Verrière" },
  { id: "radiateur", label: "Radiateur", w: 0.8, H: 0.6, cat: "equip", prof: 0.12 },
  { id: "meuble", label: "Meuble fixe", w: 0.6, H: 0.9, cat: "equip", prof: 0.4 },
  { id: "perso", label: "Élément personnalisé", w: 0.5, H: 0.5, cat: "equip", prof: 0.5 },
];

export const SENS_PORTE = ["Tirant gauche", "Tirant droit", "Poussant gauche", "Poussant droit"];

/* ---- Géométrie pure (testable sans canvas) ---- */
export function distToSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Teste les SEGMENTS entiers, pas seulement les extrémités (bug corrigé). */
export function hitShape(s, p, tol = 12) {
  switch (s.k) {
    case "stroke": {
      for (let i = 1; i < s.pts.length; i++)
        if (distToSeg(p, s.pts[i - 1], s.pts[i]) < tol) return true;
      return s.pts.length === 1 && Math.hypot(s.pts[0].x - p.x, s.pts[0].y - p.y) < tol;
    }
    case "ligne": case "fleche": case "cote":
      return distToSeg(p, s.a, s.b) < tol;
    case "rect": {
      const x1 = Math.min(s.a.x, s.b.x), x2 = Math.max(s.a.x, s.b.x);
      const y1 = Math.min(s.a.y, s.b.y), y2 = Math.max(s.a.y, s.b.y);
      const near = (v, m) => Math.abs(v - m) < tol;
      const inX = p.x > x1 - tol && p.x < x2 + tol, inY = p.y > y1 - tol && p.y < y2 + tol;
      return (inX && (near(p.y, y1) || near(p.y, y2))) || (inY && (near(p.x, x1) || near(p.x, x2)));
    }
    case "cercle": {
      const r = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
      return Math.abs(Math.hypot(p.x - s.a.x, p.y - s.a.y) - r) < tol;
    }
    case "texte": {
      const w = Math.max(24, (s.txt || "").length * (s.size || 14) * 0.55), h = (s.size || 14) * 1.2;
      return p.x > s.a.x - tol && p.x < s.a.x + w + tol && p.y > s.a.y - h - tol && p.y < s.a.y + tol;
    }
    case "objet": {
      const c = Math.cos(-(s.rot || 0)), si = Math.sin(-(s.rot || 0));
      const dx = p.x - s.x, dy = p.y - s.y;
      const lx = dx * c - dy * si, ly = dx * si + dy * c;
      return Math.abs(lx) < s.w / 2 + tol && Math.abs(ly) < s.h / 2 + tol;
    }
    case "piece": {
      const near = (v, m) => Math.abs(v - m) < tol;
      const inX = p.x > s.x - tol && p.x < s.x + s.w + tol;
      const inY = p.y > s.y - tol && p.y < s.y + s.h + tol;
      return (inX && (near(p.y, s.y) || near(p.y, s.y + s.h))) || (inY && (near(p.x, s.x) || near(p.x, s.x + s.w)));
    }
    default: return false;
  }
}

/** Murs d'une pièce rectangulaire : 0=haut, 1=droit, 2=bas, 3=gauche */
export function mursDePiece(pc) {
  return [
    { i: 0, nom: "haut", a: { x: pc.x, y: pc.y }, b: { x: pc.x + pc.w, y: pc.y } },
    { i: 1, nom: "droit", a: { x: pc.x + pc.w, y: pc.y }, b: { x: pc.x + pc.w, y: pc.y + pc.h } },
    { i: 2, nom: "bas", a: { x: pc.x + pc.w, y: pc.y + pc.h }, b: { x: pc.x, y: pc.y + pc.h } },
    { i: 3, nom: "gauche", a: { x: pc.x, y: pc.y + pc.h }, b: { x: pc.x, y: pc.y } },
  ];
}

/** Chaîne de cotes : angle → ouverture → ouverture → angle. En mètres. */
export function chaineCotes(longueurMur, ouvertures) {
  const ouvs = [...ouvertures].sort((x, y) => x.pos - y.pos);
  const segs = [];
  let cur = 0;
  ouvs.forEach((o) => {
    const debut = o.pos - o.larg / 2;
    if (debut - cur > 0.005) segs.push({ type: "plein", L: debut - cur });
    segs.push({ type: "ouverture", L: o.larg, label: o.label });
    cur = debut + o.larg;
  });
  if (longueurMur - cur > 0.005) segs.push({ type: "plein", L: longueurMur - cur });
  return segs;
}

const OUTILS = [
  { k: "select", label: "Sélect.", Icon: MousePointer2 },
  { k: "libre", label: "Libre", Icon: PenLine },
  { k: "objet", label: "Éléments", Icon: DoorOpen },
  { k: "cote", label: "Cote", Icon: Ruler },
  { k: "texte", label: "Texte", Icon: TypeIcon },
  { k: "ligne", label: "Ligne", Icon: Minus },
  { k: "rect", label: "Rect.", Icon: Square },
  { k: "cercle", label: "Cercle", Icon: Circle },
  { k: "fleche", label: "Flèche", Icon: MoveUpRight },
  { k: "gomme", label: "Gomme", Icon: Eraser },
];

export function SketchPad({ initial, room, onSave, onClose, onSyncOuverture }) {
  const cvs = useRef(null);
  const wrap = useRef(null);
  const [outil, setOutil] = useState("select");
  const [couleur, setCouleur] = useState(INK);
  const [ep, setEp] = useState(3);
  const [shapes, setShapes] = useState(initial?.shapes || []);
  const [redo, setRedo] = useState([]);
  const [sel, setSel] = useState(null);
  const [gommeMode, setGommeMode] = useState("dessin");
  const [gommeTaille, setGommeTaille] = useState(12);
  const [libOpen, setLibOpen] = useState(false);
  const [unite, setUnite] = useState("m");
  const [echelle, setEchelle] = useState(initial?.echelle || 60);
  const drag = useRef(null);
  const tmp = useRef(null);
  const [, force] = useState(0);

  const push = (next) => { setShapes(next); setRedo([]); };
  const selShape = shapes.find((s) => s.id === sel) || null;
  const piece = shapes.find((s) => s.k === "piece") || null;

  function bbox(s) {
    switch (s.k) {
      case "stroke": {
        const xs = s.pts.map((p) => p.x), ys = s.pts.map((p) => p.y);
        return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
      }
      case "objet": return { x: s.x - s.w / 2, y: s.y - s.h / 2, w: s.w, h: s.h };
      case "texte": {
        const w = Math.max(24, (s.txt || "").length * (s.size || 14) * 0.55), h = s.size || 14;
        return { x: s.a.x, y: s.a.y - h, w, h };
      }
      case "piece": return { x: s.x, y: s.y, w: s.w, h: s.h };
      default: {
        return { x: Math.min(s.a.x, s.b.x), y: Math.min(s.a.y, s.b.y), w: Math.abs(s.b.x - s.a.x), h: Math.abs(s.b.y - s.a.y) };
      }
    }
  }

  const draw = useCallback((ctx, s, isSel) => {
    ctx.save();
    ctx.strokeStyle = s.couleur || INK;
    ctx.fillStyle = s.couleur || INK;
    ctx.lineWidth = s.ep || 2;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    switch (s.k) {
      case "piece":
        ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.strokeRect(s.x, s.y, s.w, s.h); break;
      case "stroke":
        ctx.beginPath();
        s.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke(); break;
      case "ligne":
        ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(s.b.x, s.b.y); ctx.stroke(); break;
      case "rect":
        ctx.strokeRect(s.a.x, s.a.y, s.b.x - s.a.x, s.b.y - s.a.y); break;
      case "cercle": {
        const r = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
        ctx.beginPath(); ctx.arc(s.a.x, s.a.y, r, 0, Math.PI * 2); ctx.stroke(); break;
      }
      case "fleche": {
        ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(s.b.x, s.b.y); ctx.stroke();
        const ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x), h = 10 + (s.ep || 2) * 2;
        ctx.beginPath(); ctx.moveTo(s.b.x, s.b.y);
        ctx.lineTo(s.b.x - h * Math.cos(ang - 0.4), s.b.y - h * Math.sin(ang - 0.4));
        ctx.lineTo(s.b.x - h * Math.cos(ang + 0.4), s.b.y - h * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill(); break;
      }
      case "cote": {
        const ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x);
        const off = s.offset || 0;
        const nx = -Math.sin(ang) * off, ny = Math.cos(ang) * off;
        const a = { x: s.a.x + nx, y: s.a.y + ny }, b = { x: s.b.x + nx, y: s.b.y + ny };
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(a.x, a.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.b.x, s.b.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        [[a, 1], [b, -1]].forEach((pair) => {
          const p = pair[0], d = pair[1];
          ctx.beginPath(); ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + d * 8 * Math.cos(ang - 0.5), p.y + d * 8 * Math.sin(ang - 0.5));
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + d * 8 * Math.cos(ang + 0.5), p.y + d * 8 * Math.sin(ang + 0.5));
          ctx.stroke();
        });
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const txt = s.txt || "";
        ctx.font = "bold 11px ui-monospace, monospace";
        const w = ctx.measureText(txt).width + 6;
        ctx.fillStyle = "#fff"; ctx.fillRect(mx - w / 2, my - 13, w, 14);
        ctx.fillStyle = s.couleur || INK; ctx.textAlign = "center";
        ctx.fillText(txt, mx, my - 2);
        break;
      }
      case "texte":
        ctx.font = `bold ${s.size || 14}px system-ui, sans-serif`;
        ctx.textAlign = "left";
        if (!s.txt) {
          ctx.globalAlpha = 0.4;
          ctx.fillText("Texte…", s.a.x, s.a.y);
          ctx.globalAlpha = 1;
        } else ctx.fillText(s.txt, s.a.x, s.a.y);
        break;
      case "objet": {
        const lib = OBJ_LIB.find((l) => l.id === s.type) || OBJ_LIB[0];
        ctx.translate(s.x, s.y); ctx.rotate(s.rot || 0);
        ctx.lineWidth = 2;
        if (lib.cat === "porte" || lib.cat === "passage") {
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(-s.w / 2, 0); ctx.lineTo(s.w / 2, 0); ctx.stroke();
          ctx.strokeStyle = s.couleur || INK; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-s.w / 2, -4); ctx.lineTo(-s.w / 2, 4);
          ctx.moveTo(s.w / 2, -4); ctx.lineTo(s.w / 2, 4); ctx.stroke();
          if (lib.cat === "porte") {
            const dir = (s.sens || "").includes("droit") ? -1 : 1;
            const px = dir * (-s.w / 2);
            ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, -s.w); ctx.stroke();
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(px, 0, s.w, -Math.PI / 2, dir > 0 ? 0 : Math.PI, dir < 0);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        } else if (lib.cat === "fenetre") {
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 7;
          ctx.beginPath(); ctx.moveTo(-s.w / 2, 0); ctx.lineTo(s.w / 2, 0); ctx.stroke();
          ctx.strokeStyle = s.couleur || "#2563EB"; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-s.w / 2, -2.5); ctx.lineTo(s.w / 2, -2.5);
          ctx.moveTo(-s.w / 2, 2.5); ctx.lineTo(s.w / 2, 2.5);
          ctx.moveTo(-s.w / 2, -4); ctx.lineTo(-s.w / 2, 4);
          ctx.moveTo(s.w / 2, -4); ctx.lineTo(s.w / 2, 4);
          ctx.stroke();
        } else {
          ctx.strokeStyle = s.couleur || INK;
          ctx.strokeRect(-s.w / 2, -s.h / 2, s.w, s.h);
          ctx.beginPath(); ctx.moveTo(-s.w / 2, -s.h / 2); ctx.lineTo(s.w / 2, s.h / 2); ctx.stroke();
        }
        ctx.rotate(-(s.rot || 0));
        if (s.showDims !== false) {
          ctx.font = "bold 9px ui-monospace, monospace";
          ctx.textAlign = "center";
          const t = `${n(s.wM).toFixed(2)}×${n(s.hM).toFixed(2)}`;
          const tw = ctx.measureText(t).width + 4;
          ctx.fillStyle = "#fff"; ctx.fillRect(-tw / 2, 9, tw, 11);
          ctx.fillStyle = s.couleur || INK; ctx.fillText(t, 0, 18);
        }
        if (s.ref) {
          ctx.font = "bold 9px system-ui";
          ctx.textAlign = "center";
          ctx.fillStyle = G_DARK;
          ctx.fillText(s.ref, 0, -10);
        }
        break;
      }
      default: break;
    }
    ctx.restore();

    if (isSel) {
      ctx.save();
      ctx.strokeStyle = G_MID; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      const bb = bbox(s);
      ctx.strokeRect(bb.x - 7, bb.y - 7, bb.w + 14, bb.h + 14);
      ctx.setLineDash([]);
      if (s.k === "objet") {
        ctx.fillStyle = G_MID;
        ctx.beginPath(); ctx.arc(bb.x + bb.w + 7, bb.y - 7, 8, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }, []);

  const render = useCallback((extra) => {
    const c = cvs.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#EDECE8"; ctx.lineWidth = 1;
    const g = Math.max(12, echelle / 4);
    for (let x = 0; x < c.width; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, c.height); ctx.stroke(); }
    for (let y = 0; y < c.height; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
    [...shapes, ...(extra ? [extra] : [])].forEach((s) => draw(ctx, s, s.id === sel));
  }, [shapes, sel, draw, echelle]);

  /* Le canevas suit son conteneur, et lui seul.
     Auparavant cet effet dépendait de `render`, dont l'identité change à
     chaque sélection : sélectionner une forme redimensionnait le canevas,
     et toute forme située plus bas que la nouvelle hauteur devenait
     inatteignable. Un ResizeObserver ne réagit qu'aux vrais changements de
     taille — bandeau, rotation de tablette, fenêtre redimensionnée — et on
     ne touche au canevas que si les dimensions ont réellement bougé (les
     réécrire vide le dessin). */
  useEffect(() => {
    const c = cvs.current, w = wrap.current;
    if (!c || !w) return;
    const ajuster = () => {
      const r = w.getBoundingClientRect();
      const lg = Math.max(1, Math.round(r.width));
      const ht = Math.max(1, Math.round(r.height));
      if (c.width !== lg || c.height !== ht) {
        c.width = lg; c.height = ht;
      }
      render();
    };
    ajuster();
    const ro = new ResizeObserver(ajuster);
    ro.observe(w);
    window.addEventListener("orientationchange", ajuster);
    return () => { ro.disconnect(); window.removeEventListener("orientationchange", ajuster); };
  }, [render]);

  useEffect(() => { render(); }, [shapes, sel, render]);

  const pos = (e) => {
    const r = cvs.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const cibleGomme = (p, list) =>
    [...list].reverse().find((s) => {
      if (s.k === "piece") return false;
      if (gommeMode === "dessin" && s.k !== "stroke") return false;
      return hitShape(s, p, gommeTaille);
    });

  function snapToWall(p, pc) {
    const murs = mursDePiece(pc);
    let best = null;
    murs.forEach((m) => {
      const d = distToSeg(p, m.a, m.b);
      if (d < 36 && (!best || d < best.d)) {
        const dx = m.b.x - m.a.x, dy = m.b.y - m.a.y;
        const l2 = dx * dx + dy * dy;
        let t = ((p.x - m.a.x) * dx + (p.y - m.a.y) * dy) / l2;
        t = Math.max(0.03, Math.min(0.97, t));
        best = { d, x: m.a.x + t * dx, y: m.a.y + t * dy, rot: Math.atan2(dy, dx), mur: m.i, t };
      }
    });
    return best;
  }

  const start = (e) => {
    e.preventDefault();
    const p = pos(e);

    if (outil === "gomme") {
      const c = cibleGomme(p, shapes);
      if (c) push(shapes.filter((s) => s !== c));
      drag.current = { mode: "gomme" };
      return;
    }
    if (outil === "texte") {
      const hit = [...shapes].reverse().find((s) => s.k === "texte" && hitShape(s, p));
      if (hit) { setSel(hit.id); return; }
      const id = uid();
      push([...shapes, { id, k: "texte", a: p, txt: "", size: 14, couleur }]);
      setSel(id);
      return;
    }
    if (outil === "select") {
      const hit = [...shapes].reverse().find((s) => hitShape(s, p));
      setSel(hit ? hit.id : null);
      if (hit) {
        const bb = bbox(hit);
        if (hit.k === "objet" && Math.hypot(p.x - (bb.x + bb.w + 7), p.y - (bb.y - 7)) < 16)
          drag.current = { mode: "rotate", id: hit.id };
        else
          drag.current = { mode: "move", id: hit.id, p0: p, snap: JSON.parse(JSON.stringify(hit)) };
      }
      return;
    }
    drag.current = { mode: "draw" };
    tmp.current = outil === "libre"
      ? { id: uid(), k: "stroke", pts: [p], couleur, ep }
      : { id: uid(), k: outil, a: p, b: p, couleur, ep, offset: outil === "cote" ? 20 : 0 };
    force((x) => x + 1);
  };

  const move = (e) => {
    const d = drag.current;
    if (!d) return;
    e.preventDefault();
    const p = pos(e);

    if (d.mode === "gomme") {
      setShapes((prev) => {
        const c = cibleGomme(p, prev);
        return c ? prev.filter((s) => s !== c) : prev;
      });
      return;
    }
    if (d.mode === "move") {
      const dx = p.x - d.p0.x, dy = p.y - d.p0.y;
      setShapes((prev) => prev.map((s) => {
        if (s.id !== d.id) return s;
        const o = d.snap;
        if (s.k === "objet") {
          const nx = o.x + dx, ny = o.y + dy;
          const lib = OBJ_LIB.find((l) => l.id === s.type) || {};
          if (piece && lib.cat !== "equip") {
            const sn = snapToWall({ x: nx, y: ny }, piece);
            if (sn) return { ...s, x: sn.x, y: sn.y, rot: sn.rot, mur: sn.mur };
          }
          return { ...s, x: nx, y: ny, mur: undefined };
        }
        if (s.k === "texte") return { ...s, a: { x: o.a.x + dx, y: o.a.y + dy } };
        if (s.k === "stroke") return { ...s, pts: o.pts.map((q) => ({ x: q.x + dx, y: q.y + dy })) };
        if (s.k === "piece") return { ...s, x: o.x + dx, y: o.y + dy };
        return { ...s, a: { x: o.a.x + dx, y: o.a.y + dy }, b: { x: o.b.x + dx, y: o.b.y + dy } };
      }));
      return;
    }
    if (d.mode === "rotate") {
      setShapes((prev) => prev.map((s) => (s.id === d.id ? { ...s, rot: Math.atan2(p.y - s.y, p.x - s.x), mur: undefined } : s)));
      return;
    }
    if (d.mode === "draw" && tmp.current) {
      if (outil === "libre") tmp.current.pts.push(p);
      else tmp.current.b = p;
      render(tmp.current);
    }
  };

  const end = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.mode !== "draw") { setRedo([]); return; }
    const s = tmp.current;
    tmp.current = null;
    if (!s) return;
    if (s.k === "cote") {
      const m = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y) / echelle;
      s.txt = unite === "cm" ? `${Math.round(m * 100)} cm` : `${m.toFixed(2)} m`;
    }
    push([...shapes, s]);
    setSel(s.id);
  };

  const tracerPiece = () => {
    const z = room?.zones?.[0];
    const L = n(z?.L), l = n(z?.l);
    if (!L || !l) return;
    const c = cvs.current;
    const ech = Math.min((c.width - 150) / L, (c.height - 150) / l);
    setEchelle(ech);
    const w = L * ech, h = l * ech;
    const pc = { id: uid(), k: "piece", x: (c.width - w) / 2, y: (c.height - h) / 2, w, h, LM: L, lM: l };
    const cotes = mursDePiece(pc).map((m) => {
      const long = m.i % 2 === 0 ? L : l;
      return {
        id: uid(), k: "cote", a: m.a, b: m.b, mur: m.i, general: true,
        couleur: G_DARK, ep: 1.5, offset: -24,
        txt: unite === "cm" ? `${Math.round(long * 100)} cm` : `${long.toFixed(2)} m`,
      };
    });
    push([...shapes.filter((s) => s.k !== "piece" && !s.general), pc, ...cotes]);
  };

  const placer = (lib) => {
    const c = cvs.current;
    const o = {
      id: uid(), k: "objet", type: lib.id, label: lib.label,
      x: c.width / 2, y: c.height / 2, rot: 0,
      w: lib.w * echelle, h: (lib.prof || 0.14) * echelle,
      wM: lib.w, hM: lib.H, sens: lib.cat === "porte" ? SENS_PORTE[0] : "",
      showDims: true, couleur: lib.cat === "fenetre" ? "#2563EB" : INK, ep: 2,
    };
    if (piece && lib.cat !== "equip") {
      const sn = snapToWall({ x: o.x, y: o.y }, piece);
      if (sn) { o.x = sn.x; o.y = sn.y; o.rot = sn.rot; o.mur = sn.mur; }
    }
    push([...shapes, o]);
    setSel(o.id);
    setLibOpen(false);
    setOutil("select");
  };

  const coterMur = (murIdx) => {
    if (!piece) return;
    const m = mursDePiece(piece)[murIdx];
    const longM = murIdx % 2 === 0 ? piece.LM : piece.lM;
    const lpx = Math.hypot(m.b.x - m.a.x, m.b.y - m.a.y);
    const ouvs = shapes.filter((s) => s.k === "objet" && s.mur === murIdx).map((s) => ({
      pos: (Math.hypot(s.x - m.a.x, s.y - m.a.y) / lpx) * longM,
      larg: n(s.wM), label: s.label,
    }));
    const segs = chaineCotes(longM, ouvs);
    const dirx = (m.b.x - m.a.x) / longM, diry = (m.b.y - m.a.y) / longM;
    let cur = 0;
    const nouvelles = segs.map((sg) => {
      const a = { x: m.a.x + dirx * cur * echelle, y: m.a.y + diry * cur * echelle };
      cur += sg.L;
      const b = { x: m.a.x + dirx * cur * echelle, y: m.a.y + diry * cur * echelle };
      return {
        id: uid(), k: "cote", a, b, mur: murIdx, segment: true,
        couleur: sg.type === "ouverture" ? "#2563EB" : G_MID, ep: 1.5, offset: 30,
        txt: unite === "cm" ? `${Math.round(sg.L * 100)}` : `${sg.L.toFixed(2)}`,
      };
    });
    push([...shapes.filter((s) => !(s.segment && s.mur === murIdx)), ...nouvelles]);
  };

  const undo = () => { if (!shapes.length) return; setRedo([shapes[shapes.length - 1], ...redo]); setShapes(shapes.slice(0, -1)); };
  const rredo = () => { if (!redo.length) return; setShapes([...shapes, redo[0]]); setRedo(redo.slice(1)); };
  const supprimerSel = () => { if (!sel) return; push(shapes.filter((s) => s.id !== sel)); setSel(null); };
  const setSelProp = (k, v) => setShapes(shapes.map((s) => (s.id === sel ? { ...s, [k]: v } : s)));

  const aLier = shapes.filter((s) => s.k === "objet" && (OBJ_LIB.find((l) => l.id === s.type) || {}).ouv && !s.synced);
  const libSel = selShape?.k === "objet" ? OBJ_LIB.find((l) => l.id === selShape.type) || {} : {};

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex flex-col">
      <div className="flex items-center justify-between px-2 py-2 bg-white border-b-2 border-stone-200">
        <button onClick={onClose} className="h-11 px-3 flex items-center gap-1 font-semibold text-stone-600"><X size={20} /> Fermer</button>
        <span className="font-bold text-stone-800 text-sm">Croquis coté</span>
        <button onClick={() => onSave(cvs.current.toDataURL("image/png"), shapes, echelle)}
          className="h-11 px-4 rounded-xl text-white font-bold flex items-center gap-1" style={{ backgroundColor: G_DARK }}>
          <Check size={18} /> Garder
        </button>
      </div>

      <div className="px-2 py-1.5 bg-white border-b-2 border-stone-100 flex gap-1 overflow-x-auto">
        {OUTILS.map((o) => (
          <button key={o.k} onClick={() => { setOutil(o.k); if (o.k === "objet") setLibOpen(true); }}
            className="min-w-[50px] h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 border-2 shrink-0"
            style={outil === o.k ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" }
              : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
            <o.Icon size={14} /><span className="text-[8px] font-bold">{o.label}</span>
          </button>
        ))}
      </div>

      <div className="px-2 py-1.5 bg-stone-50 border-b-2 border-stone-100 flex gap-1.5 items-center overflow-x-auto">
        {outil === "gomme" ? (
          <>
            <span className="text-[9px] font-bold text-stone-400 shrink-0">MODE</span>
            {[{ k: "dessin", l: "Traits à main levée" }, { k: "objet", l: "Sélectionner et supprimer" }].map((m) => (
              <button key={m.k} onClick={() => setGommeMode(m.k)}
                className="h-8 px-2 rounded text-[10px] font-bold border-2 shrink-0"
                style={gommeMode === m.k ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
                {m.l}
              </button>
            ))}
            <span className="text-[9px] font-bold text-stone-400 shrink-0 ml-1">TAILLE</span>
            {[8, 12, 20, 30].map((t) => (
              <button key={t} onClick={() => setGommeTaille(t)}
                className="w-8 h-8 rounded text-[9px] font-mono font-bold border-2 shrink-0"
                style={gommeTaille === t ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
                {t}
              </button>
            ))}
          </>
        ) : (
          <>
            <button onClick={tracerPiece} disabled={!n(room?.zones?.[0]?.L) || !n(room?.zones?.[0]?.l)}
              className="h-8 px-2 rounded text-[10px] font-bold border-2 shrink-0 disabled:opacity-30"
              style={{ backgroundColor: G_PALE, borderColor: G_LIGHT, color: G_DARK }}>
              Tracer la pièce
            </button>
            {piece && mursDePiece(piece).map((m) => (
              <button key={m.i} onClick={() => coterMur(m.i)}
                className="h-8 px-1.5 rounded text-[9px] font-bold border-2 border-stone-200 text-stone-600 shrink-0">
                Coter mur {m.nom}
              </button>
            ))}
            <button onClick={() => setUnite(unite === "m" ? "cm" : "m")}
              className="h-8 px-2 rounded text-[10px] font-mono font-bold border-2 border-stone-200 text-stone-600 shrink-0">
              {unite}
            </button>
          </>
        )}
      </div>

      {/* Zone de dessin. Sa hauteur ne dépend PAS du bandeau : l'espace de
          celui-ci est réservé en permanence ci-dessous. Sans cela, ouvrir le
          bandeau rétrécissait le canevas et toute forme tracée plus bas que
          la nouvelle hauteur devenait inatteignable. */}
      <div ref={wrap} className="flex-1 min-h-[200px] relative m-2 rounded-2xl overflow-hidden border-2 border-stone-300 bg-white">
        <canvas ref={cvs} className="absolute inset-0 touch-none"
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end} />
      </div>

      {/* Espace réservé au bandeau d'édition : toujours présent, hauteur fixe.
          C'est ce qui garantit que le canevas ne bouge jamais et que le bas du
          croquis reste utilisable, bandeau ouvert ou fermé. */}
      <div className="h-[136px] shrink-0 mx-2 mb-2">
      {!selShape && (
        <div className="h-full rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center">
          <span className="text-[10px] text-stone-400 px-3 text-center leading-snug">
            Touchez une forme du croquis pour la modifier ou la déplacer.
          </span>
        </div>
      )}
      {selShape && (
        <div className="h-full overflow-y-auto rounded-xl bg-white border-2 p-2"
          style={{ borderColor: G_LIGHT }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase" style={{ color: G_DARK }}>
              {selShape.k === "objet" ? selShape.label : selShape.k === "texte" ? "Zone de texte" : selShape.k === "cote" ? "Cote" : selShape.k}
            </span>
            <div className="flex gap-1">
              {selShape.k === "objet" && (
                <button onClick={() => setSelProp("showDims", selShape.showDims === false)}
                  className="h-8 px-2 rounded text-[9px] font-bold border-2 border-stone-200 text-stone-600">
                  {selShape.showDims === false ? "Afficher cotes" : "Masquer cotes"}
                </button>
              )}
              <button onClick={supprimerSel} className="h-8 px-2 rounded border-2 border-red-200 flex items-center">
                <Trash2 size={12} className="text-red-600" />
              </button>
            </div>
          </div>

          {selShape.k === "objet" && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                <label className="flex-1">
                  <span className="text-[8px] font-bold uppercase text-stone-400">Largeur (m)</span>
                  <input inputMode="decimal" value={selShape.wM ?? ""}
                    onChange={(e) => setShapes(shapes.map((s) => (s.id === sel ? { ...s, wM: e.target.value, w: n(e.target.value) * echelle } : s)))}
                    className="w-full h-9 px-2 rounded border-2 border-stone-300 font-mono text-sm" />
                </label>
                <label className="flex-1">
                  <span className="text-[8px] font-bold uppercase text-stone-400">Hauteur (m)</span>
                  <input inputMode="decimal" value={selShape.hM ?? ""} onChange={(e) => setSelProp("hM", e.target.value)}
                    className="w-full h-9 px-2 rounded border-2 border-stone-300 font-mono text-sm" />
                </label>
                <label className="flex-1">
                  <span className="text-[8px] font-bold uppercase text-stone-400">Repère</span>
                  <input value={selShape.ref ?? ""} onChange={(e) => setSelProp("ref", e.target.value)}
                    className="w-full h-9 px-2 rounded border-2 border-stone-300 text-sm" />
                </label>
              </div>
              {libSel.cat === "porte" && (
                <div className="flex gap-1 overflow-x-auto pb-0.5">
                  {SENS_PORTE.map((s) => (
                    <button key={s} onClick={() => setSelProp("sens", s)}
                      className="h-7 px-1.5 rounded text-[9px] font-bold border shrink-0"
                      style={selShape.sens === s ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#A8A29E" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5 items-center">
                <button onClick={() => setSelProp("rot", (selShape.rot || 0) + Math.PI / 2)}
                  className="h-8 px-2 rounded text-[9px] font-bold border-2 border-stone-200 flex items-center gap-1 shrink-0">
                  <RotateCcw size={11} /> Pivoter 90°
                </button>
                {libSel.ouv && (
                  <button onClick={() => { onSyncOuverture && onSyncOuverture(selShape); setSelProp("synced", true); }}
                    className="flex-1 h-8 rounded text-[9px] font-bold text-white"
                    style={{ backgroundColor: selShape.synced ? "#A8A29E" : G_MID }}>
                    {selShape.synced ? "✓ Reprise dans les métrés" : "Ajouter aux ouvertures de la pièce"}
                  </button>
                )}
              </div>
              {selShape.mur !== undefined && (
                <p className="text-[8px] text-stone-400">Aimantée sur le mur {mursDePiece(piece || { x: 0, y: 0, w: 0, h: 0 })[selShape.mur]?.nom}</p>
              )}
            </div>
          )}

          {selShape.k === "texte" && (
            <div className="flex gap-1.5 items-end">
              <label className="flex-1">
                <span className="text-[8px] font-bold uppercase text-stone-400">Contenu</span>
                <input value={selShape.txt ?? ""} onChange={(e) => setSelProp("txt", e.target.value)}
                  placeholder="Saisissez le texte" autoFocus
                  className="w-full h-10 px-2 rounded border-2 border-stone-300 text-sm" />
              </label>
              <div className="flex gap-1">
                {[11, 14, 18, 24].map((t) => (
                  <button key={t} onClick={() => setSelProp("size", t)}
                    className="w-8 h-10 rounded text-[9px] font-bold border-2"
                    style={(selShape.size || 14) === t ? { backgroundColor: G_DARK, borderColor: G_DARK, color: "#fff" } : { backgroundColor: "#fff", borderColor: "#E7E5E4", color: "#78716C" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selShape.k === "cote" && (
            <div className="flex gap-1.5 items-end">
              <label className="flex-1">
                <span className="text-[8px] font-bold uppercase text-stone-400">Valeur affichée</span>
                <input value={selShape.txt ?? ""} onChange={(e) => setSelProp("txt", e.target.value)}
                  className="w-full h-9 px-2 rounded border-2 border-stone-300 font-mono text-sm" />
              </label>
              <button onClick={() => setSelProp("offset", -(selShape.offset || 20))}
                className="h-9 px-2 rounded text-[9px] font-bold border-2 border-stone-200 text-stone-600">Intérieur / Extérieur</button>
            </div>
          )}
        </div>
      )}
      </div>

      {libOpen && (
        <div className="absolute inset-0 z-10 bg-black/40 flex items-end" onClick={() => setLibOpen(false)}>
          <div className="w-full bg-white rounded-t-2xl p-3 max-h-[72%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-stone-800">Bibliothèque d'éléments</span>
              <button onClick={() => setLibOpen(false)} className="w-9 h-9 rounded-lg border-2 border-stone-200 flex items-center justify-center"><X size={15} /></button>
            </div>
            {!piece && (
              <p className="text-[10px] text-amber-800 bg-amber-50 rounded p-1.5 mb-2">
                Tracez d'abord la pièce : les ouvertures s'aimanteront alors automatiquement sur les murs.
              </p>
            )}
            <div className="grid grid-cols-3 gap-2">
              {OBJ_LIB.map((l) => (
                <button key={l.id} onClick={() => placer(l)}
                  className="rounded-xl border-2 border-stone-200 p-2 flex flex-col items-center gap-1 active:bg-lime-50 min-h-[70px] justify-center">
                  <span className="text-[10px] font-bold text-stone-700 text-center leading-tight">{l.label}</span>
                  <span className="text-[8px] font-mono text-stone-400">{l.w.toFixed(2)} × {l.H.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-2 py-2 bg-white border-t-2 border-stone-200">
        {[INK, G_MID, "#C0392B", "#2563EB"].map((c) => (
          <button key={c} onClick={() => setCouleur(c)}
            className={`w-9 h-9 rounded-full border-4 ${couleur === c ? "border-stone-800" : "border-stone-200"}`}
            style={{ backgroundColor: c }} />
        ))}
        <button onClick={() => setEp(ep === 3 ? 6 : ep === 6 ? 1 : 3)}
          className="w-10 h-9 rounded-lg border-2 border-stone-300 font-mono font-bold text-xs">{ep}px</button>
        <div className="flex-1" />
        {aLier.length > 0 && (
          <span className="text-[9px] font-bold px-1.5 py-1 rounded" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
            {aLier.length} à lier
          </span>
        )}
        <button onClick={undo} disabled={!shapes.length}
          className="w-9 h-9 rounded-lg border-2 border-stone-300 flex items-center justify-center disabled:opacity-30"><Undo2 size={16} /></button>
        <button onClick={rredo} disabled={!redo.length}
          className="w-9 h-9 rounded-lg border-2 border-stone-300 flex items-center justify-center disabled:opacity-30"><Redo2 size={16} /></button>
      </div>
    </div>
  );
}

/* ---- Image persistée ---- */
export function StoredImg({ blobKey, dataUrl, className, alt = "" }) {
  const [src, setSrc] = useState(dataUrl || null);
  useEffect(() => {
    let dead = false;
    if (dataUrl) { setSrc(dataUrl); return; }
    if (!blobKey) return;
    blobUrl(blobKey).then((u) => { if (!dead) setSrc(u); });
    return () => { dead = true; };
  }, [blobKey, dataUrl]);
  if (!src) return <div className={`${className} bg-stone-100 animate-pulse`} />;
  return <img src={src} alt={alt} className={className} />;
}
