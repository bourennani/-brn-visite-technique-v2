/* ==================================================================== */
/*  PROFILS MÉTIER                                                      */
/*                                                                      */
/*  Le profil est DÉRIVÉ du typeId de la pièce, jamais stocké dans la   */
/*  visite : les anciennes visites héritent donc du bon profil sans     */
/*  aucune migration de données.                                        */
/*                                                                      */
/*  Un profil décrit ce qui est PERTINENT pour un métier :              */
/*    sections    -> rubriques de métré affichées                       */
/*    equipements -> familles d'équipements proposées                   */
/*    lots        -> familles de travaux visibles                       */
/*    modules     -> modules métier dédiés (façade, cuisine…)           */
/*    metres      -> quantités pilotables retenues au résumé            */
/* ==================================================================== */

const LOTS_COMMUNS = ["instal", "demo", "nettoyage"];

/** Rubriques de métré intérieur classiques. */
const SECTIONS_INT = ["zones", "ouvertures", "murs", "sol", "plafond", "plinthes", "faience", "doublages", "peinture"];

export const PROFILS = {
  interieur: {
    id: "interieur",
    label: "Intérieur",
    onglets: ["metre", "travaux", "medias", "notes"],
    sections: SECTIONS_INT,
    equipements: ["elec", "plomberie", "chauffage", "menuiseries"],
    lots: [...LOTS_COMMUNS, "macon", "platre", "menint", "menext", "serrur", "sols", "murs", "peint", "elec", "plomb", "chauf"],
    modules: [],
    metres: ["sol", "murs", "plafond", "plinthes", "faience", "doublage"],
  },

  cuisine: {
    id: "cuisine",
    label: "Cuisine",
    onglets: ["metre", "cuisine", "travaux", "medias", "notes"],
    sections: SECTIONS_INT,
    equipements: ["elec", "plomberie", "chauffage", "menuiseries"],
    lots: [...LOTS_COMMUNS, "macon", "platre", "menint", "menext", "sols", "murs", "peint", "elec", "plomb", "chauf", "cuisine"],
    modules: ["cuisine"],
    metres: ["sol", "murs", "plafond", "plinthes", "faience", "doublage"],
  },

  sanitaire: {
    id: "sanitaire",
    label: "Salle d'eau / WC",
    onglets: ["metre", "travaux", "medias", "notes"],
    sections: SECTIONS_INT,
    equipements: ["elec", "plomberie", "chauffage", "menuiseries", "sanitaire"],
    lots: [...LOTS_COMMUNS, "macon", "platre", "menint", "sols", "murs", "peint", "elec", "plomb", "chauf", "sdb"],
    modules: [],
    metres: ["sol", "murs", "plafond", "plinthes", "faience", "doublage"],
  },

  facade: {
    id: "facade",
    label: "Façade",
    onglets: ["facade", "travaux", "medias", "notes"],
    /* Aucune rubrique intérieure : ni sol, ni plafond, ni plinthes, ni faïence.
       Les ouvertures restent : elles se déduisent de la surface de façade. */
    sections: ["ouvertures"],
    equipements: [],
    lots: [...LOTS_COMMUNS, "facade", "menext", "serrur", "couv"],
    modules: ["facade"],
    metres: [],
  },

  toiture: {
    id: "toiture",
    label: "Toiture",
    onglets: ["metre", "travaux", "medias", "notes"],
    sections: ["zones", "ouvertures"],
    equipements: ["toiture"],
    lots: [...LOTS_COMMUNS, "couv", "serrur", "facade"],
    modules: [],
    metres: ["sol"],
  },

  exterieur: {
    id: "exterieur",
    label: "Extérieur",
    onglets: ["metre", "travaux", "medias", "notes"],
    sections: ["zones", "ouvertures", "sol"],
    equipements: ["exterieur", "elec"],
    lots: [...LOTS_COMMUNS, "macon", "ext", "serrur", "menext"],
    modules: [],
    metres: ["sol"],
  },

  technique: {
    id: "technique",
    label: "Local technique",
    onglets: ["metre", "travaux", "medias", "notes"],
    sections: ["zones", "ouvertures", "murs", "sol", "plafond"],
    equipements: ["elec", "plomberie", "chauffage"],
    lots: [...LOTS_COMMUNS, "macon", "platre", "sols", "peint", "elec", "plomb", "chauf"],
    modules: [],
    metres: ["sol", "murs", "plafond"],
  },
};

/** typeId -> profil. Tout type absent retombe sur « interieur ». */
const PAR_TYPE = {
  cuisine: "cuisine",
  sdb: "sanitaire", sde: "sanitaire", wc: "sanitaire", suite: "sanitaire",
  facade: "facade", facade_avant: "facade", facade_arriere: "facade", pignon: "facade",
  toiture: "toiture", combles: "toiture",
  balcon: "exterieur", terrasse: "exterieur", jardin: "exterieur", cour: "exterieur",
  veranda: "exterieur",
  technique: "technique",
};

/** Profil métier d'une pièce. Robuste aux pièces anciennes et personnalisées. */
export function profilDe(room) {
  if (!room) return PROFILS.interieur;
  /* Une pièce peut forcer son profil (cas particulier assumé par le métreur). */
  if (room.profilForce && PROFILS[room.profilForce]) return PROFILS[room.profilForce];
  return PROFILS[PAR_TYPE[room.typeId]] || PROFILS.interieur;
}

/** La rubrique de métré est-elle pertinente pour cette pièce ? */
export function sectionVisible(room, k) {
  return profilDe(room).sections.includes(k);
}

/** La famille d'équipements est-elle pertinente ? */
export function equipVisible(room, fam) {
  return profilDe(room).equipements.includes(fam);
}

/**
 * Lots de travaux à afficher.
 * `tousLots` = bascule « Afficher tous les lots », qui restitue le catalogue complet.
 * `lotsExceptionnels` = lots ajoutés au cas par cas sur cette pièce, conservés dans la visite.
 */
export function lotsVisibles(room, tousLots) {
  if (tousLots) return null; // null = aucun filtre
  const p = profilDe(room);
  return [...new Set([...p.lots, ...(room.lotsExceptionnels || [])])];
}

export const PROFILS_LISTE = Object.values(PROFILS);
