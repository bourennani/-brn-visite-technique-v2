import { describe, it, expect } from "vitest";
import {
  margeDe, calcPoste, statutPoste, typeRevetement,
  catalogueDeRoom, ouvragesDeVisite, ouvragesParLot,
  MARGE_REVETEMENT, VERIF,
} from "./travaux";
import { calcRoom, AUTO, VALIDE, MANUEL } from "./calc";
import { LOTS } from "./catalogue";

/* ====================================================================
   FILET DE NON-RÉGRESSION — MOTEUR DES POSTES DE TRAVAUX (lot 0.1)

   Verrouille les règles les plus subtiles et les plus coûteuses du
   produit : le NON-CUMUL des marges (métré vs poste, README 2.2.0) et
   la source unique vivante des ouvrages (régression 2.2.1 : le rapport
   lisait un agrégat figé et affichait des quantités périmées).
   ==================================================================== */

const rect = (o = {}) => ({ forme: "rectangle", L: "5", l: "4", H: "2.50", qte: "1", ...o });
const item = (id) => LOTS.flatMap((l) => l.items.map((i) => ({ ...i, lot: l.id, lotNom: l.nom })))
  .find((i) => i.id === id);

describe("margeDe — priorité des marges", () => {
  it("la marge saisie par le métreur l'emporte sur tout", () => {
    expect(margeDe({ id: "so_revetement" }, { marge: "7" }, { revetement: "Carrelage" })).toBe(7);
  });
  it("à défaut, le sol suit le matériau choisi au métré", () => {
    expect(margeDe({ id: "so_revetement" }, {}, { revetement: "Carrelage" })).toBe(MARGE_REVETEMENT.Carrelage);
    expect(margeDe({ id: "so_revetement" }, {}, { revetement: "Sol PVC" })).toBe(MARGE_REVETEMENT["Sol PVC"]);
  });
  it("à défaut, la marge par défaut du poste, sinon 0", () => {
    expect(margeDe({ id: "pe_murs" }, {}, {})).toBe(0);
    expect(margeDe({ id: "poste_inconnu" }, {}, {})).toBe(0);
  });
});

describe("NON-CUMUL des marges — la règle métier centrale (2.2.0)", () => {
  /* Un sol carrelage 20 m² net, marge métré 10 % (appro), marge poste 10 %.
     Le poste part du métré NET (20), pas de la proposée métré (22). Si les
     deux marges se cumulaient, on aurait 20 × 1.1 × 1.1 = 24.2 : c'est
     précisément ce qu'on interdit. */
  const room = { zones: [rect()], ouvertures: [], sol: { revetement: "Carrelage", marge: 10 } };
  const c = calcRoom(room);

  it("le métré expose une proposée avec marge appro", () => {
    expect(c.solNet).toBe(20);
    expect(c.solProposee).toBe(22); // 20 × 1.10 (affiché à l'onglet Métré)
  });

  it("le poste lit le NET (20), pas la proposée métré (22)", () => {
    const p = calcPoste(item("so_revetement"), {}, c);
    expect(p.brute).toBe(20); // solNet — la marge métré n'entre pas ici
  });

  it("une seule marge s'applique au poste (22, jamais 24.2)", () => {
    const p = calcPoste(item("so_revetement"), {}, c);
    expect(p.marge).toBe(10);
    expect(p.propose).toBe(22);
    expect(p.propose).not.toBe(24.2); // le cumul silencieux est proscrit
  });
});

describe("calcPoste — quantité retenue selon le mode", () => {
  const c = calcRoom({ zones: [rect()], ouvertures: [] });

  it("auto : retenu = proposé", () => {
    const p = calcPoste(item("pe_murs"), { mode: AUTO }, c);
    expect(p.retenu).toBe(p.propose);
    expect(p.mode).toBe(AUTO);
  });
  it("manuel : retenu = valeur saisie, calcul conservé pour comparaison", () => {
    const p = calcPoste(item("pe_murs"), { mode: MANUEL, val: "30", snap: p_snap(c) }, c);
    expect(p.retenu).toBe(30);
  });
  it("écart notable manuel vs calcul : signalé (avertissement)", () => {
    const p = calcPoste(item("so_revetement"), { mode: MANUEL, val: "100" },
      calcRoom({ zones: [rect()], ouvertures: [], sol: { revetement: "Carrelage" } }));
    expect(p.ecart).toBeGreaterThan(0.25);
  });
  it("périmé : la valeur figée ne suit plus, mais le décalage est détecté", () => {
    const p = calcPoste(item("pe_murs"), { mode: VALIDE, val: "10", snap: "999" }, c);
    expect(p.retenu).toBe(10);     // la valeur figée ne bouge pas
    expect(p.perime).toBe(true);   // mais on sait que la source a changé
  });
});

function p_snap(c) { return calcPoste(item("pe_murs"), {}, c).propose; }

describe("statutPoste", () => {
  it("mode manuel/validé conservés, sinon à vérifier si calcul positif", () => {
    expect(statutPoste({ mode: MANUEL }, 10)).toBe(MANUEL);
    expect(statutPoste({ mode: VALIDE }, 10)).toBe(VALIDE);
    expect(statutPoste({}, 10)).toBe(VERIF);
    expect(statutPoste({}, 0)).toBe(AUTO);
  });
});

describe("typeRevetement & nommage des postes de sol", () => {
  it("résout le revêtement, « Autre » compris", () => {
    expect(typeRevetement({ sol: { revetement: "Carrelage" } })).toBe("Carrelage");
    expect(typeRevetement({ sol: { revetement: "Autre", revetementAutre: "Jonc de mer" } })).toBe("Jonc de mer");
    expect(typeRevetement({ sol: {} })).toBe("");
  });
  it("le catalogue nomme le poste d'après le matériau (1re lettre en minuscule)", () => {
    const room = { zones: [rect()], ouvertures: [], sol: { revetement: "Sol PVC" } };
    const cat = catalogueDeRoom(room, calcRoom(room));
    const revetement = cat.find((i) => i.id === "so_revetement");
    expect(revetement.label).toBe("Fourniture et pose de sol PVC"); // « sol PVC », pas « sol pvc »
  });
});

describe("ouvragesDeVisite — source unique vivante (régression 2.2.1)", () => {
  it("un poste automatique coché produit un ouvrage recalculé", () => {
    const visite = { rooms: [{
      id: "r1", nom: "Séjour", zones: [rect()], ouvertures: [],
      sol: { revetement: "Carrelage" },
      travaux: { so_revetement: { on: true, mode: AUTO } },
    }] };
    const ouv = ouvragesDeVisite(visite);
    const o = ouv.find((x) => x.id === "so_revetement");
    expect(o).toBeTruthy();
    expect(o.qteRetenue).toBe(22); // 20 net × 1.10 poste — recalculé, pas figé
    expect(o.roomNom).toBe("Séjour");
  });

  it("poste non coché : absent du rapport", () => {
    const visite = { rooms: [{
      id: "r1", nom: "Séjour", zones: [rect()], ouvertures: [],
      travaux: { pe_murs: { on: false } },
    }] };
    expect(ouvragesDeVisite(visite)).toHaveLength(0);
  });
});

describe("ouvragesDeVisite — poste orphelin : une saisie ne disparaît jamais", () => {
  const baseRoom = { id: "r1", nom: "Cuisine", zones: [rect()], ouvertures: [] };

  it("orphelin AVEC saisie manuelle : conservé, marqué orphelin", () => {
    const visite = { rooms: [{ ...baseRoom, travaux: {
      poste_supprime: { on: true, mode: MANUEL, val: "5", label: "Ancien meuble 60 cm", unit: "u" },
    } }] };
    const ouv = ouvragesDeVisite(visite);
    const o = ouv.find((x) => x.id === "poste_supprime");
    expect(o).toBeTruthy();
    expect(o.orphelin).toBe(true);
    expect(o.qteRetenue).toBe(5); // la saisie du métreur est préservée
  });

  it("orphelin SANS saisie (automatique) : retiré du rapport", () => {
    const visite = { rooms: [{ ...baseRoom, travaux: {
      poste_supprime: { on: true, mode: AUTO },
    } }] };
    expect(ouvragesDeVisite(visite).find((x) => x.id === "poste_supprime")).toBeUndefined();
  });
});

describe("ouvragesParLot — consolidation des ouvrages identiques", () => {
  it("même libellé/unité dans deux pièces : fusionné, quantités additionnées", () => {
    const visite = { rooms: [
      { id: "r1", nom: "Chambre 1", zones: [rect()], ouvertures: [], sol: { revetement: "Carrelage" },
        travaux: { so_revetement: { on: true, mode: AUTO } } },
      { id: "r2", nom: "Chambre 2", zones: [rect()], ouvertures: [], sol: { revetement: "Carrelage" },
        travaux: { so_revetement: { on: true, mode: AUTO } } },
    ] };
    const parLot = ouvragesParLot(ouvragesDeVisite(visite));
    const sols = parLot["Revêtements de sol"];
    expect(sols).toHaveLength(1);
    expect(sols[0].qteRetenue).toBe(44); // 22 + 22
    expect(sols[0].pieces).toEqual(["Chambre 1", "Chambre 2"]);
  });
});
