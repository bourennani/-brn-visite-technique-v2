import { describe, it, expect } from "vitest";
import { migrerRoom, migrerVisite, newVisite, newRoom } from "./store";
import { MANUEL } from "./calc";

/* ====================================================================
   FILET DE NON-RÉGRESSION — MIGRATION DOUCE (lot 0.1)

   Le principe fondateur du projet (P1) est né ici : on COMPLÈTE une
   donnée ancienne à la lecture, on ne la RÉÉCRIT jamais. Ces fonctions
   deviennent le patron de migration de tout l'ERP (chap. 04 §7.2). Deux
   garanties à verrouiller : idempotence, et préservation stricte des
   données déjà saisies.
   ==================================================================== */

describe("migrerRoom — complète sans écraser", () => {
  it("ajoute les champs absents des versions récentes", () => {
    const ancienne = { id: "r1", nom: "Séjour", typeId: "chambre", zones: [], ouvertures: [] };
    const m = migrerRoom(ancienne);
    expect(Array.isArray(m.elec)).toBe(true);
    expect(Array.isArray(m.prestations)).toBe(true); // v2.4
    expect(m.lotsExceptionnels).toEqual([]);
    expect(m.facade).toBeTruthy();
    expect(m.cuisine).toBeTruthy();
    expect(m.profilForce).toBe("");
  });

  it("ne touche jamais une donnée déjà présente", () => {
    const room = {
      id: "r1", nom: "Cuisine", typeId: "cuisine", zones: [], ouvertures: [],
      elec: [{ type: "prise_simple", qte: "3" }],
      prestations: [{ id: "px_1", label: "Reprise", qte: "1" }],
      cuisine: { implantation: "en L", meubles: [{ id: "m1" }] },
    };
    const m = migrerRoom(room);
    expect(m.elec).toHaveLength(1);
    expect(m.prestations[0].label).toBe("Reprise");
    expect(m.cuisine.implantation).toBe("en L");
    expect(m.cuisine.meubles).toHaveLength(1);
  });

  it("convertit un poste v2.0 {on, retenu} en saisie manuelle (quantité préservée)", () => {
    const room = {
      id: "r1", nom: "x", typeId: "chambre", zones: [], ouvertures: [],
      travaux: { so_revetement: { on: true, retenu: "12.5" } },
    };
    const t = migrerRoom(room).travaux.so_revetement;
    expect(t.mode).toBe(MANUEL);   // une saisie ne disparaît jamais en silence
    expect(t.val).toBe("12.5");    // à l'identique
  });

  it("laisse intact un poste déjà au format v2.2 (présence de mode)", () => {
    const poste = { on: true, mode: "valide", val: "8", snap: "8" };
    const room = { id: "r1", nom: "x", typeId: "chambre", zones: [], ouvertures: [], travaux: { p: poste } };
    expect(migrerRoom(room).travaux.p).toEqual(poste);
  });

  it("est idempotente : migrer deux fois ne change rien de plus", () => {
    const room = { id: "r1", nom: "x", typeId: "chambre", zones: [], ouvertures: [],
      travaux: { p: { on: true, retenu: "5" } } };
    const once = migrerRoom(room);
    const twice = migrerRoom(once);
    expect(twice).toEqual(once);
  });
});

describe("migrerVisite — contexte général (v2.3) sans toucher l'existant", () => {
  it("ajoute demandeClient et contraintes, préserve observations", () => {
    const v = { id: "v1", chantier: { adresse: "1 rue X", observations: "RAS historique" }, rooms: [] };
    const m = migrerVisite(v);
    expect(m.chantier.demandeClient).toBe("");
    expect(m.chantier.contraintes).toBe("");
    expect(m.chantier.observations).toBe("RAS historique"); // champ d'origine intact
    expect(m.chantier.adresse).toBe("1 rue X");
  });

  it("migre toutes les pièces et reste idempotente", () => {
    const v = { id: "v1", chantier: {}, rooms: [
      { id: "r1", nom: "x", typeId: "chambre", zones: [], ouvertures: [], travaux: { p: { on: true, retenu: "5" } } },
    ] };
    const once = migrerVisite(v);
    expect(migrerVisite(once)).toEqual(once);
    expect(once.rooms[0].travaux.p.mode).toBe(MANUEL);
  });
});

describe("fabriques — une visite/pièce neuve est déjà « à jour »", () => {
  it("newVisite est idempotente vis-à-vis de la migration (aucun champ à ajouter)", () => {
    const v = newVisite();
    const m = migrerVisite(v);
    // La migration ne doit rien avoir à compléter sur une donnée neuve.
    expect(m.chantier.demandeClient).toBe(v.chantier.demandeClient);
    expect(m.chantier.contraintes).toBe(v.chantier.contraintes);
  });

  it("newRoom porte tous les champs des modules métier", () => {
    const type = { id: "cuisine", label: "Cuisine", modules: ["cuisine"] };
    const r = newRoom(type, "Ma cuisine");
    expect(r.facade).toBeTruthy();
    expect(r.cuisine).toBeTruthy();
    expect(Array.isArray(r.prestations)).toBe(true);
    expect(r.typeId).toBe("cuisine");
  });
});
