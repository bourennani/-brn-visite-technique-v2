import { describe, it, expect } from "vitest";
import {
  calcZone, calcOuverture, calcRoom, calcFacade, calcCuisine,
  qVal, qValider, qPerime, qMode, qManuel, qAuto,
  validateRoom, calcProgression,
  AUTO, VALIDE, MANUEL,
} from "./calc";

/* ====================================================================
   FILET DE NON-RÉGRESSION DU CŒUR MÉTIER (lot 0.1)

   Ces tests gèlent le comportement du moteur de métré AVANT toute
   extraction vers l'ERP. Ils encodent les règles métier documentées
   (README) et les bugs historiques corrigés (2.0.1, 2.2.1). Toute
   modification de valeur attendue doit être un choix explicite et
   justifié — jamais un effet de bord (principe P1).
   ==================================================================== */

/** Pièce minimale acceptée par calcRoom : zones + ouvertures obligatoires. */
const makeRoom = (o = {}) => ({ zones: [], ouvertures: [], ...o });
const rect = (o = {}) => ({ forme: "rectangle", L: "4", l: "3", H: "2.50", qte: "1", ...o });

describe("calcZone — surfaces par forme", () => {
  it("rectangle : sol, périmètre, murs bruts, volume", () => {
    const c = calcZone(rect());
    expect(c.sol).toBe(12);
    expect(c.perim).toBe(14);
    expect(c.h).toBe(2.5);
    expect(c.mursBrut).toBe(35);
    expect(c.volume).toBe(30);
    expect(c.plafond).toBe(12);
  });

  it("partie en L : retrait soustrait du rectangle englobant", () => {
    const c = calcZone({ forme: "enL", L: "4", l: "3", a: "1", b: "1", H: "2.50", qte: "1" });
    expect(c.sol).toBe(11); // 12 − (1×1)
    expect(c.perim).toBe(14);
  });

  it("triangle : demi-produit base × hauteur", () => {
    const c = calcZone({ forme: "triangle", L: "4", l: "3", H: "2.50", qte: "1" });
    expect(c.sol).toBe(6);
    expect(c.perim).toBe(12); // 4 + 3 + hypot(4,3)=5
  });

  it("rampant : hauteur moyenne des deux pentes", () => {
    const c = calcZone({ forme: "rampant", L: "4", l: "3", H: "2.50", H2: "1.50", qte: "1" });
    expect(c.h).toBe(2); // (2.5 + 1.5) / 2
    expect(c.mursBrut).toBe(28); // périmètre 14 × 2
  });

  it("quantité multiplie surface et périmètre", () => {
    const c = calcZone(rect({ qte: "3" }));
    expect(c.sol).toBe(36);
    expect(c.perim).toBe(42);
  });
});

describe("calcOuverture — surface et retours de tableau", () => {
  it("surface = L × H × quantité", () => {
    const c = calcOuverture({ L: "1.20", H: "1.40", qte: "2", profTableau: "0.20" });
    expect(c.surface).toBeCloseTo(3.36, 5);
  });

  it("retours de tableau comptés seulement si cochés", () => {
    const base = { type: "Porte", L: "0.90", H: "2.04", qte: "1", profTableau: "0.20" };
    expect(calcOuverture({ ...base }).retours).toBe(0);
    const c = calcOuverture({ ...base, retours: { tabG: true, tabD: true } });
    expect(c.tableaux).toBeCloseTo(0.816, 5); // 2 × (0.20 × 2.04)
  });
});

describe("calcRoom — pièce rectangulaire simple", () => {
  const c = calcRoom(makeRoom({ zones: [rect({ L: "5", l: "4" })] }));

  it("surfaces de base", () => {
    expect(c.solBrut).toBe(20);
    expect(c.solNet).toBe(20);
    expect(c.mursBrut).toBe(45); // périmètre 18 × 2.5
    expect(c.plafondNet).toBe(20);
    expect(c.plinthesBrut).toBe(18);
  });

  it("aucune marge saisie ⇒ proposée = nette", () => {
    expect(c.solProposee).toBe(20);
    expect(c.plinthesProposee).toBe(18);
  });
});

describe("calcRoom — déductions d'ouvertures", () => {
  const room = makeRoom({
    zones: [rect({ L: "5", l: "4" })], // mursBrut 45, périmètre 18
    ouvertures: [{
      type: "Porte", L: "0.90", H: "2.04", qte: "1", profTableau: "0.20",
      largeurAuSol: "0.90",
      deductions: { murs: true, plinthes: true },
      retours: {},
    }],
  });
  const c = calcRoom(room);

  it("les murs perdent la surface de l'ouverture", () => {
    expect(c.ded.murs).toBeCloseTo(1.836, 3); // 0.90 × 2.04
    expect(c.mursNet).toBeCloseTo(43.164, 3);
  });

  it("les plinthes perdent la largeur au sol du passage", () => {
    expect(c.plinthesNet).toBeCloseTo(17.1, 3); // 18 − 0.90
  });

  it("compte les portes", () => {
    expect(c.nbPortes).toBe(1);
  });
});

describe("calcRoom — marge de sol (appro matière, onglet Métré)", () => {
  it("la marge de sol s'applique à la quantité proposée", () => {
    const c = calcRoom(makeRoom({
      zones: [rect({ L: "5", l: "4" })],
      sol: { revetement: "Carrelage", marge: 10 },
    }));
    expect(c.solNet).toBe(20);
    expect(c.solProposee).toBe(22); // 20 × 1.10 — marge appro, NON réappliquée aux travaux
  });
});

describe("calcRoom — comptage électrique détaillé (v2.4)", () => {
  const c = calcRoom(makeRoom({
    zones: [rect()],
    elec: [
      { type: "prise_simple", qte: "2" },
      { type: "prise_double", qte: "1" },
      { type: "inter_simple", qte: "1" },
      { type: "spot", qte: "3" },
    ],
  }));

  it("appareillages : une prise double = 1 appareillage", () => {
    expect(c.nbPrises).toBe(3); // 2 + 1 + 0
  });
  it("socles : une prise double = 2 socles", () => {
    expect(c.nbSocles).toBe(4); // 2 + 1×2
  });
  it("interrupteurs et spots comptés séparément", () => {
    expect(c.nbInter).toBe(1);
    expect(c.nbSpots).toBe(3);
  });
  it("total brut de points électriques", () => {
    expect(c.nbPointsElec).toBe(7); // 2 + 1 + 1 + 3
  });
});

describe("états de validation des quantités (auto / validé / manuel)", () => {
  it("qVal : auto suit le calcul", () => {
    expect(qVal(undefined, 10)).toBe(10);
    expect(qVal({ mode: AUTO }, 10)).toBe(10);
  });
  it("qVal : validé et manuel figent la valeur saisie", () => {
    expect(qVal({ mode: VALIDE, val: 12, snap: 12 }, 10)).toBe(12);
    expect(qVal({ mode: MANUEL, val: "15" }, 10)).toBe(15);
  });
  it("qVal : une valeur vide retombe sur le calcul (jamais 0 silencieux)", () => {
    expect(qVal({ mode: MANUEL, val: "" }, 10)).toBe(10);
  });
  it("qMode : défaut auto", () => {
    expect(qMode(undefined)).toBe(AUTO);
    expect(qMode({ mode: MANUEL })).toBe(MANUEL);
  });
  it("qPerime : détecte un calcul qui a bougé depuis le figeage", () => {
    expect(qPerime({ mode: VALIDE, snap: 12 }, 12)).toBe(false);
    expect(qPerime({ mode: VALIDE, snap: 12 }, 15)).toBe(true);
    expect(qPerime({ mode: AUTO }, 15)).toBe(false);
  });
});

describe("qValider — garde-fou anti page blanche (régression 2.0.1)", () => {
  it("fige une valeur exploitable, arrondie au centième", () => {
    expect(qValider(22)).toEqual({ mode: VALIDE, val: 22, snap: 22 });
    expect(qValider(3.14159).val).toBe(3.14);
  });
  it("refuse toute valeur non exploitable (null, jamais dans l'état ni IndexedDB)", () => {
    expect(qValider(0)).toBeNull();
    expect(qValider(-5)).toBeNull();
    expect(qValider(NaN)).toBeNull();
    expect(qValider(Infinity)).toBeNull();
    expect(qValider("abc")).toBeNull();
  });
  it("qManuel et qAuto ont la forme attendue", () => {
    expect(qManuel("5", 4)).toEqual({ mode: MANUEL, val: "5", snap: 4 });
    expect(qAuto()).toEqual({ mode: AUTO, val: "", snap: null });
  });
});

describe("calcFacade — traitement général ≠ réparations localisées", () => {
  const c = calcFacade({
    facade: {
      faces: [{ largeur: "10", hauteur: "6", niveaux: "1", qte: "1" }],
      pathologies: [
        { unite: "ml", qte: "5", label: "Fissure" },
        { unite: "m²", qte: "3", label: "Décollement" },
      ],
    },
    ouvertures: [],
  });

  it("surface générale calculée sur la façade", () => {
    expect(c.surfaceBrute).toBe(60);
    expect(c.surfaceNette).toBe(60);
    expect(c.surfaceATraiter).toBe(60);
  });

  it("réparations localisées ventilées par unité, jamais fondues dans la surface", () => {
    expect(c.reparationsMl).toBe(5);
    expect(c.reparationsM2).toBe(3);
    // La règle métier : la surface générale (60) ne contient AUCUNE réparation.
    expect(c.surfaceATraiter).toBe(60);
  });

  it("hauteur par niveau multipliée quand hParNiveau", () => {
    const c2 = calcFacade({
      facade: { faces: [{ largeur: "10", hauteur: "3", niveaux: "2", qte: "1", hParNiveau: true }] },
      ouvertures: [],
    });
    expect(c2.surfaceBrute).toBe(60); // 10 × (3 × 2)
  });
});

describe("calcCuisine — plan de travail = somme des tronçons", () => {
  const c = calcCuisine({
    cuisine: {
      meubles: [
        { type: "bas", rang: "bas", phase: "projet", largeur: "120", qte: "2" },
      ],
      pdt: [
        { longueur: "2", profondeur: "65", qte: "1" },
        { longueur: "1.5", profondeur: "65", qte: "2" },
      ],
    },
  });

  it("longueur du plan = addition stricte des tronçons", () => {
    expect(c.pdtLongueur).toBe(5); // 2 + (1.5 × 2)
  });

  it("la largeur des meubles n'influence jamais la longueur du plan", () => {
    // 2 meubles de 120 cm = 2.40 ml de meubles bas, mais le plan reste 5 ml.
    expect(c.mlBasProjet).toBeCloseTo(2.4, 5);
    expect(c.pdtLongueur).toBe(5);
  });

  it("les accessoires (joues) ne comptent pas comme meubles", () => {
    const c2 = calcCuisine({
      cuisine: { meubles: [
        { type: "joue", rang: "accessoire", phase: "projet", largeur: "2", qte: "2" },
        { type: "bas", rang: "bas", phase: "projet", largeur: "60", qte: "1" },
      ] },
    });
    expect(c2.nbJoues).toBe(2);
    expect(c2.nbBasProjet).toBe(1); // la joue est exclue du comptage des meubles
  });
});

describe("validateRoom — avertit sans bloquer", () => {
  it("signale des ouvertures qui dépassent les murs", () => {
    const errs = validateRoom(makeRoom({
      zones: [rect({ L: "2", l: "2", H: "0.30" })], // mursBrut faible
      ouvertures: [{ type: "Fenêtre", L: "3", H: "3", qte: "1", deductions: { murs: true }, retours: {} }],
    }));
    expect(errs.some((e) => e.txt.includes("ouvertures dépassent"))).toBe(true);
  });
});

describe("calcProgression — étapes du dossier", () => {
  it("dossier vide : progression faible, jamais NaN", () => {
    const p = calcProgression({ rooms: [] });
    expect(p.total).toBeGreaterThan(0);
    expect(Number.isFinite(p.pct)).toBe(true);
    expect(p.done).toBeLessThan(p.total);
  });
});
