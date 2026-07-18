/* ==================================================================== */
/*  MOTEUR DES POSTES DE TRAVAUX (v2.2)                                 */
/*                                                                      */
/*  Chaîne unique, sans double saisie :                                 */
/*     métré net  ->  marge du poste  ->  quantité proposée             */
/*                 ->  quantité retenue (validée ou saisie)             */
/*                                                                      */
/*  RÈGLE DE MARGE : le poste part TOUJOURS du métré NET.               */
/*  Les marges de l'onglet Métré (sol, plinthes, faïence) servent à     */
/*  l'approvisionnement matière et restent affichées là-bas ; elles ne  */
/*  sont pas réappliquées ici, sinon la marge serait comptée deux fois. */
/* ==================================================================== */

import { n, LOTS } from "./catalogue";
import { AUTO, VALIDE, MANUEL, calcRoom } from "./calc";

/** Statut supplémentaire : poste actif, calculé, jamais confirmé. */
export const VERIF = "verif";

export const STATUTS = {
  [AUTO]: { label: "Automatique", bg: "#EEF5E4", fg: "#3C6410" },
  [VERIF]: { label: "À vérifier", bg: "#FEF3C7", fg: "#92400E" },
  [VALIDE]: { label: "Validé", bg: "#DCFCE7", fg: "#15803D" },
  [MANUEL]: { label: "Modifié manuellement", bg: "#FFEDD5", fg: "#9A3412" },
};

/* ---- Marges par défaut, par poste (%) ---------------------------- */
/* Modifiables poste par poste dans l'interface. Tout poste absent = 0 %. */
/* Marge de découpe par revêtement de sol.
   Le catalogue n'a qu'un poste générique « Revêtement de sol » : la marge suit
   donc le matériau choisi dans l'onglet Métré, et non un poste par matériau. */
export const MARGE_REVETEMENT = {
  "Carrelage": 10,
  "Parquet massif": 8,
  "Parquet stratifié": 8,
  "Parquet contrecollé": 8,
  "Sol PVC": 5,
  "Lino": 5,
  "PVC": 5,
  "Vinyle": 5,
  "Moquette": 5,
  "Résine": 0,
  "Béton ciré": 0,
};

/** Type de revêtement retenu pour la pièce, « Autre » compris.
    Renvoie "" si rien n'est choisi : le libellé générique est alors conservé. */
export function typeRevetement(room) {
  const r = (room?.sol?.revetement || "").trim();
  if (!r) return "";
  if (r === "Autre") return (room?.sol?.revetementAutre || "").trim();
  return r;
}

export const MARGE_DEFAUT = {
  /* Sols : valeur de repli si aucun revêtement n'est choisi */
  so_revetement: 10, so_soucouche: 5,
  de_carrelage: 0, de_parquet: 0,
  /* Plinthes : chutes de coupe */
  mi_plinthes: 5, pe_plinthes: 5, de_plinthes: 0,
  /* Faïence et crédence */
  mu_faience: 10, de_faience: 0, cu_credence: 10,
  /* Peinture, enduit : pas de marge, la surface nette suffit.
     (Valeur de repli explicite : tout poste absent de cette table vaut déjà 0.) */
  pe_murs: 0, pe_plafond: 0,
  /* Plan de travail : débité sur mesure */
  cu_plan: 0,
  /* Façade : le métré fait foi */
  fa_peinture: 0, fa_enduit_finition: 0, fa_hydrofuge: 0, fa_nettoyage_hp: 0,
};

export const margeDe = (item, t, c) => {
  /* 1. La marge saisie par le métreur l'emporte toujours. */
  const m = t?.marge;
  if (m !== undefined && m !== null && String(m).trim() !== "") return n(m);
  /* 2. Le poste de revêtement de sol suit le matériau choisi au métré. */
  if (item.id === "so_revetement" && c?.revetement) {
    const mr = MARGE_REVETEMENT[c.revetement];
    if (mr !== undefined) return mr;
  }
  /* 3. Valeur par défaut du poste. */
  return MARGE_DEFAUT[item.id] ?? 0;
};

/* ---- Origine lisible de chaque métré ------------------------------ */
/* C'est ce que le métreur lit sous la quantité : d'où vient ce chiffre. */
export const ORIGINES = {
  /* Murs */
  mursNet: "Surface nette des murs (brut − ouvertures + retours)",
  mursBrut: "Surface brute des murs",
  peintureMurs: "Surface des murs à peindre",
  doublageNet: "Surface des murs − ouvertures déduites",
  isolationNet: "Surface des murs à isoler",
  /* Plafond */
  plafondNet: "Surface du plafond",
  /* Sol */
  solNet: "Surface nette du sol",
  solBrut: "Surface brute du sol",
  /* Plinthes */
  plinthesNet: "Périmètre − passages de portes",
  plinthesBrut: "Périmètre de la pièce",
  /* Faïence */
  faienceNet: "Surface de faïence relevée",
  /* Ouvertures */
  nbPortes: "Nombre de portes relevées",
  nbFenetres: "Nombre de fenêtres relevées",
  /* Électricité */
  nbPrises: "Prises comptées (appareillages)",
  nbInter: "Interrupteurs comptés",
  nbPoints: "Points lumineux comptés",
  nbSpots: "Spots comptés",
  nbRJ45: "Prises RJ45 comptées",
  nbSpec: "Équipements spécialisés comptés",
  /* Plomberie / chauffage */
  nbSanitaires: "Appareils sanitaires comptés",
  nbRadiateurs: "Radiateurs comptés",
  /* Volume */
  volume: "Volume de la pièce",
};

/* Origines des modules métier (préfixées dans la table de correspondance). */
export const ORIGINES_FACADE = {
  surfaceBrute: "Surface brute de façade",
  surfaceNette: "Surface nette de façade (brut − ouvertures)",
  surfaceATraiter: "Surface générale à traiter",
  soubassement: "Surface de soubassement",
  tableaux: "Surface des tableaux",
  bandeaux: "Bandeaux et corniches relevés",
  reparationsMl: "Réparations localisées relevées (linéaire)",
  reparationsM2: "Réparations localisées relevées (surface)",
  reparationsU: "Points ponctuels relevés",
  nbFenetres: "Fenêtres relevées en façade",
};

export const ORIGINES_CUISINE = {
  nbBasProjet: "Meubles bas projetés",
  nbHautProjet: "Meubles hauts projetés",
  nbColonnesProjet: "Colonnes projetées",
  nbIlotProjet: "Îlot / bar projeté",
  mlBasProjet: "Largeur cumulée des meubles bas projetés",
  mlHautProjet: "Largeur cumulée des meubles hauts projetés",
  mlIlotProjet: "Largeur cumulée de l'îlot",
  pdtLongueur: "Somme des tronçons de plan de travail",
  pdtDecoupes: "Découpes de plan de travail relevées",
  credenceSurface: "Surface des zones de crédence",
  plintheCuisine: "Longueur de plinthe de cuisine",
  nbJoues: "Joues relevées",
  nbFileurs: "Fileurs relevés",
  nbElectro: "Électroménager relevé",
  nbEquipements: "Équipements de cuisine relevés",
};

/**
 * Résout la valeur d'un métré source.
 * `auto` peut viser la pièce (« solNet »), la façade (« facade.surfaceNette »)
 * ou la cuisine (« cuisine.pdtLongueur »).
 */
export function valeurSource(c, auto) {
  if (!auto || !c) return null;
  if (auto.startsWith("facade.")) {
    const k = auto.slice(7);
    return { v: c.facade?.[k], origine: ORIGINES_FACADE[k] || k };
  }
  if (auto.startsWith("cuisine.")) {
    const k = auto.slice(8);
    return { v: c.cuisine?.[k], origine: ORIGINES_CUISINE[k] || k };
  }
  return { v: c[auto], origine: ORIGINES[auto] || auto };
}

/** Statut affiché d'un poste. */
export function statutPoste(t, calc) {
  const m = t?.mode || AUTO;
  if (m === MANUEL) return MANUEL;
  if (m === VALIDE) return VALIDE;
  return n(calc) > 0 ? VERIF : AUTO;
}

/**
 * Calcule tout ce qu'un poste doit afficher.
 * Ne lit jamais l'état : fonction pure, donc testable.
 */
export function calcPoste(item, t, c) {
  const src = item.calcDirect !== undefined
    ? { v: item.calcDirect, origine: item.origine || "Détail relevé" }
    : valeurSource(c, item.auto);

  const brute = Number.isFinite(n(src?.v)) ? n(src?.v) : 0;
  const aSource = !!(item.auto || item.calcDirect !== undefined);
  const marge = margeDe(item, t, c);
  const propose = Math.round(brute * (1 + marge / 100) * 100) / 100;

  const mode = t?.mode || AUTO;
  const manuel = mode === MANUEL && String(t?.val ?? "").trim() !== "";
  const fige = mode === VALIDE && Number.isFinite(n(t?.val));

  const retenu = manuel ? n(t.val) : fige ? n(t.val) : propose;

  /* Le métré source a bougé depuis que la valeur a été figée ou saisie. */
  const perime =
    (mode === VALIDE || mode === MANUEL) &&
    t?.snap !== undefined && t?.snap !== null &&
    Math.abs(n(t.snap) - propose) > 0.005;

  /* Écart notable entre saisie manuelle et calcul : on avertit, on ne bloque pas. */
  const ecart = manuel && propose > 0 ? Math.abs(retenu - propose) / propose : 0;

  return {
    id: item.id, label: item.label, unit: item.unit,
    lot: item.lot, lotNom: item.lotNom,
    brute, marge, propose, retenu,
    calc: brute, aSource,
    origine: src?.origine || "Aucun métré source",
    mode, statut: statutPoste(t, brute), perime, ecart,
    obs: t?.obs || "",
    dateValid: t?.dateValid || null,
    dateModif: t?.dateModif || null,
    ancienne: t?.ancienne ?? null,
  };
}

/* ---- Traçabilité : construite ici, écrite par l'écran ------------- */

const maintenant = () => new Date().toISOString();

/** Fige la quantité proposée. Renvoie null si elle n'est pas exploitable. */
export function validerPoste(t, p) {
  if (!Number.isFinite(p.propose) || p.propose <= 0) return null;
  return {
    ...t, mode: VALIDE, val: p.propose, snap: p.propose,
    source: p.origine, dateValid: maintenant(), dateModif: maintenant(),
    ancienne: t?.val ?? null,
  };
}

export function manuelPoste(t, val, p) {
  return {
    ...t, mode: MANUEL, val, snap: p.propose,
    source: p.origine, dateModif: maintenant(),
    ancienne: t?.val ?? null,
  };
}

export function autoPoste(t) {
  return { ...t, mode: AUTO, val: "", snap: null, dateModif: maintenant(), ancienne: t?.val ?? null };
}

/* ---- Postes dynamiques : détail par largeur de la cuisine ---------- */
/*  « Fourniture et pose meuble bas 60 cm — 4 u » : un poste par largeur. */
export function postesCuisineDetail(c) {
  const det = c?.cuisine?.projet?.detail || [];
  return det
    .filter((d) => d.nb > 0 && d.largeur > 0)
    .map((d) => ({
      id: `cu_fp_${d.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${d.largeur}`,
      label: `Fourniture et pose ${d.label.toLowerCase()} ${d.largeur} cm`,
      unit: "u",
      lot: "cuisine",
      lotNom: "Cuisine",
      calcDirect: d.nb,
      origine: `Détail du mobilier projeté (${d.largeur} cm)`,
      dynamique: true,
    }));
}

export function postesCuisineDepose(c) {
  const det = c?.cuisine?.existant?.detail || [];
  return det
    .filter((d) => d.nb > 0 && d.largeur > 0)
    .map((d) => ({
      id: `cu_dep_${d.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${d.largeur}`,
      label: `Dépose ${d.label.toLowerCase()} ${d.largeur} cm`,
      unit: "u",
      lot: "demo",
      lotNom: "Démolition / curage",
      calcDirect: d.nb,
      origine: `Détail du mobilier existant (${d.largeur} cm)`,
      dynamique: true,
    }));
}

/* ---- Contrôles de cohérence --------------------------------------- */
/*  Tous sont des AVERTISSEMENTS : ils n'empêchent jamais de continuer. */

export function controlesPiece(room, c) {
  const a = [];
  const push = (gravite, msg) => a.push({ gravite, msg });

  const cu = c?.cuisine, cf = c?.facade;

  (room?.cuisine?.meubles || []).forEach((m) => {
    if (!n(m.largeur) && m.rang !== "accessoire")
      push("orange", `Meuble « ${m.label} » sans largeur`);
  });
  (room?.cuisine?.credence || []).forEach((z) => {
    if (!n(z.hauteur)) push("orange", `Crédence « ${z.nom || "zone"} » sans hauteur`);
    if (!n(z.longueur)) push("orange", `Crédence « ${z.nom || "zone"} » sans longueur`);
  });
  (room?.cuisine?.pdt || []).forEach((t) => {
    if (!n(t.longueur)) push("orange", `Tronçon « ${t.nom || "plan"} » sans longueur`);
  });
  (room?.facade?.faces || []).forEach((f) => {
    if (!n(f.largeur)) push("orange", `Façade « ${f.nom || "sans nom" } » sans largeur`);
    if (!n(f.hauteur)) push("orange", `Façade « ${f.nom || "sans nom"} » sans hauteur`);
  });
  (room?.facade?.pathologies || []).forEach((p) => {
    if (p.unite !== "forfait" && !n(p.qte))
      push("orange", `Pathologie « ${p.label} » sans quantité`);
  });

  /* Surface manifestement incohérente : mur inférieur au sol. */
  if (c?.solNet > 0 && c?.mursNet > 0 && c.mursNet < c.solNet * 0.5)
    push("orange", "Surface de murs faible au regard du sol — vérifier les hauteurs");

  if (cf?.surfaceBrute > 0 && cf.surfaceNette <= 0)
    push("rouge", "Les ouvertures déduisent toute la surface de façade");

  if (cu?.pdtLongueur > 0 && cu.nbBasProjet === 0)
    push("orange", "Plan de travail sans meuble bas projeté");

  return a;
}

/** Contrôles portant sur les postes eux-mêmes. */
export function controlesPostes(postes) {
  const a = [];
  postes.forEach((p) => {
    if (!p.unit) a.push({ gravite: "orange", msg: `« ${p.label} » sans unité` });
    if (!p.aSource) a.push({ gravite: "info", msg: `« ${p.label} » n'a aucun métré source` });
    else if (p.retenu === 0) a.push({ gravite: "orange", msg: `« ${p.label} » : quantité nulle` });
    if (p.ecart > 0.25)
      a.push({
        gravite: "orange",
        msg: `« ${p.label} » : quantité saisie très différente du calcul (${Math.round(p.ecart * 100)} %)`,
      });
    if (p.perime)
      a.push({ gravite: "orange", msg: `« ${p.label} » : le métré source a changé depuis la validation` });
  });
  return a;
}

/* ==================================================================== */
/*  OUVRAGES D'UNE VISITE (v2.2.1)                                      */
/*                                                                      */
/*  Source unique du récapitulatif ET du rapport.                       */
/*                                                                      */
/*  Rien n'est lu depuis une copie figée dans le poste : le libellé,    */
/*  l'unité et le métré source sont TOUJOURS relus dans le catalogue    */
/*  vivant et recalculés par calcPoste(). Un poste ne stocke que le     */
/*  choix du métreur (coché, mode, valeur, marge, observations).        */
/* ==================================================================== */

/** Catalogue effectif d'une pièce : lots + postes dynamiques du module cuisine. */
export function catalogueDeRoom(room, c) {
  /* Le type de revêtement choisi au métré nomme les postes de sol :
     « Fourniture et pose de carrelage » plutôt que « Revêtement de sol ». */
    const rev = typeRevetement(room);
  /* Seule la première lettre passe en minuscule : « Sol PVC » doit donner
     « sol PVC », pas « sol pvc ». */
  const bas = rev ? rev.charAt(0).toLowerCase() + rev.slice(1) : "";
  const nommer = (i) => {
    if (!rev) return i;
    if (i.id === "so_revetement") return { ...i, label: `Fourniture et pose de ${bas}`, materiau: rev };
    if (i.id === "so_depose") return { ...i, label: `Dépose de ${bas}`, materiau: rev };
    return i;
  };
  const items = LOTS.flatMap((l) =>
    l.items.map((i) => nommer({ ...i, lot: l.id, lotNom: l.nom }))
  );
  return [...postesCuisineDetail(c), ...postesCuisineDepose(c), ...items];
}

/** Prestations manuelles d'une pièce, mises au format d'un ouvrage.
    Aucun calcul : la quantité est celle que le métreur a saisie. */
export function prestationsDeRoom(room) {
  return (room?.prestations || [])
    .filter((p) => String(p.label || "").trim() !== "" && n(p.qte) > 0)
    .map((p) => {
      const lot = LOTS.find((l) => l.id === p.lot);
      return {
        id: p.id, roomId: room.id, roomNom: room.nom,
        lot: p.lot || "demo", lotNom: lot ? lot.nom : "Divers",
        label: p.label.trim(), unit: p.unit || "forfait",
        intervention: "", materiau: "", reference: "", obs: p.obs || "",
        qteCalc: 0, qteRetenue: n(p.qte), marge: 0,
        statut: MANUEL, mode: MANUEL, perime: false,
        manuelle: true, origine: "Prestation saisie manuellement",
      };
    });
}

export function ouvragesDeVisite(visite) {
  const out = [];
  (visite?.rooms || []).forEach((room) => {
    const c = calcRoom(room);
    const parId = new Map(catalogueDeRoom(room, c).map((i) => [i.id, i]));

    /* Les prestations manuelles ne passent par aucun catalogue. */
    out.push(...prestationsDeRoom(room));

    Object.entries(room.travaux || {}).forEach(([id, t]) => {
      if (!t?.on) return;
      const item = parId.get(id);

      /* Poste orphelin : son métré source a disparu (largeur de meuble
         supprimée, lot retiré du catalogue…). On ne conserve que ce que le
         métreur a saisi lui-même ; un poste automatique sans source n'a plus
         rien à dire et sort du rapport. */
      if (!item) {
        if ((t.mode || AUTO) !== MANUEL || String(t.val ?? "").trim() === "") return;
        out.push({
          id, roomId: room.id, roomNom: room.nom,
          lot: t.lot || "divers", lotNom: t.lotNom || "Autres",
          label: t.label || id, unit: t.unit || "",
          intervention: t.intervention || "", materiau: t.materiau || "",
          reference: t.reference || "", obs: t.obs || "",
          qteCalc: 0, qteRetenue: n(t.val), marge: 0,
          statut: MANUEL, mode: MANUEL, perime: false, orphelin: true,
          origine: "Métré source supprimé",
        });
        return;
      }

      const p = calcPoste(item, t, c);
      out.push({
        id, roomId: room.id, roomNom: room.nom,
        lot: item.lot, lotNom: item.lotNom,
        label: item.label, unit: item.unit,
        intervention: t.intervention || "",
        materiau: t.materiau || "", reference: t.reference || "",
        obs: p.obs,
        qteCalc: p.brute, qteRetenue: p.retenu, qtePropose: p.propose,
        marge: p.marge, origine: p.origine,
        statut: p.statut, mode: p.mode, perime: p.perime,
        manuel: p.mode === MANUEL, orphelin: false,
        dateValid: p.dateValid, dateModif: p.dateModif,
      });
    });
  });
  return out;
}

/** Regroupement par lot, avec consolidation des ouvrages identiques. */
export function ouvragesParLot(ouvrages) {
  const parLot = {};
  ouvrages.forEach((o) => {
    const k = o.lotNom || "Autres";
    if (!parLot[k]) parLot[k] = [];
    const ex = parLot[k].find((x) => x.label === o.label && x.unit === o.unit);
    if (ex) {
      ex.qteCalc += o.qteCalc;
      ex.qteRetenue += o.qteRetenue;
      ex.pieces.push(o.roomNom);
    } else {
      parLot[k].push({ ...o, pieces: [o.roomNom] });
    }
  });
  return parLot;
}
