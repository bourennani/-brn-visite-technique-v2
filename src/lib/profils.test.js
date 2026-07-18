import { describe, it, expect } from "vitest";
import { profilDe, sectionVisible, equipVisible, lotsVisibles, PROFILS } from "./profils";

/* ====================================================================
   FILET DE NON-RÉGRESSION — PROFILS MÉTIER (lot 0.1)

   Règle structurante (README 2.1.0) : le profil est DÉRIVÉ du typeId,
   jamais stocké. Les anciennes visites héritent du bon profil sans
   migration. Ce contrat doit survivre à l'extraction vers l'ERP
   (chap. 02 : profil dérivé, jamais persisté).
   ==================================================================== */

describe("profilDe — dérivation depuis le typeId", () => {
  it("mappe les types métier vers leur profil", () => {
    expect(profilDe({ typeId: "cuisine" }).id).toBe("cuisine");
    expect(profilDe({ typeId: "sdb" }).id).toBe("sanitaire");
    expect(profilDe({ typeId: "wc" }).id).toBe("sanitaire");
    expect(profilDe({ typeId: "facade" }).id).toBe("facade");
    expect(profilDe({ typeId: "facade_avant" }).id).toBe("facade");
    expect(profilDe({ typeId: "toiture" }).id).toBe("toiture");
    expect(profilDe({ typeId: "cour" }).id).toBe("exterieur");
  });

  it("type inconnu ou absent ⇒ profil intérieur par défaut", () => {
    expect(profilDe({ typeId: "type_inexistant" }).id).toBe("interieur");
    expect(profilDe({}).id).toBe("interieur");
    expect(profilDe(null).id).toBe("interieur");
  });

  it("profilForce l'emporte sur la dérivation (cas particulier assumé)", () => {
    expect(profilDe({ typeId: "cuisine", profilForce: "facade" }).id).toBe("facade");
  });

  it("profilForce invalide est ignoré (robustesse)", () => {
    expect(profilDe({ typeId: "cuisine", profilForce: "inexistant" }).id).toBe("cuisine");
  });
});

describe("sectionVisible — rubriques pertinentes par profil", () => {
  it("une façade n'affiche ni sol ni plafond, mais garde les ouvertures", () => {
    const facade = { typeId: "facade" };
    expect(sectionVisible(facade, "sol")).toBe(false);
    expect(sectionVisible(facade, "plafond")).toBe(false);
    expect(sectionVisible(facade, "ouvertures")).toBe(true);
  });
  it("l'intérieur affiche les rubriques classiques", () => {
    const interieur = { typeId: "chambre" };
    expect(sectionVisible(interieur, "sol")).toBe(true);
    expect(sectionVisible(interieur, "murs")).toBe(true);
  });
});

describe("equipVisible & lotsVisibles", () => {
  it("les équipements suivent le profil", () => {
    expect(equipVisible({ typeId: "sdb" }, "sanitaire")).toBe(true);
    expect(equipVisible({ typeId: "facade" }, "sanitaire")).toBe(false);
  });

  it("le filtre des lots inclut les lots exceptionnels de la pièce", () => {
    const room = { typeId: "chambre", lotsExceptionnels: ["couv"] };
    const lots = lotsVisibles(room, false);
    expect(lots).toContain("couv");
    expect(lots).toContain("peint"); // lot standard du profil intérieur
  });

  it("« afficher tous les lots » lève le filtre (null = pas de filtre)", () => {
    expect(lotsVisibles({ typeId: "facade" }, true)).toBeNull();
  });

  it("tous les profils exposent la même forme (onglets, sections, lots…)", () => {
    Object.values(PROFILS).forEach((p) => {
      expect(Array.isArray(p.onglets)).toBe(true);
      expect(Array.isArray(p.sections)).toBe(true);
      expect(Array.isArray(p.lots)).toBe(true);
      expect(typeof p.id).toBe("string");
    });
  });
});
