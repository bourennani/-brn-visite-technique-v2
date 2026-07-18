import { ArrowUpDown, Bath, BedDouble, Briefcase, Building2, Car, Check, ChefHat, DoorOpen, Droplets, Home, Layers, Package, Shirt, Sofa, Sun, Trees, Warehouse, Wrench } from "lucide-react";

/* ==================================================================== */
/*  MODULE 1 — TOKENS & CATALOGUES                                      */
/* ==================================================================== */

export const G_DARK = "#3C6410";
export const G_MID = "#5E9918";
export const G_LIGHT = "#8BC53F";
export const G_PALE = "#EEF5E4";
export const INK = "#14180F";

export const UNITES = ["forfait", "u", "ml", "m²", "m³", "h", "j", "kg", "l", "ens"];

export const INTERVENTIONS = ["Dépose", "Fourniture", "Pose", "Fourniture et pose", "Dépose et repose"];

/* ---- Types de pièces ---- */
export const TYPES = [
  { id: "entree", label: "Entrée", Icon: DoorOpen },
  { id: "degagement", label: "Dégagement", Icon: ArrowUpDown },
  { id: "couloir", label: "Couloir", Icon: ArrowUpDown },
  { id: "salon", label: "Salon", Icon: Sofa },
  { id: "sejour", label: "Séjour", Icon: Sofa },
  { id: "sam", label: "Salle à manger", Icon: Sofa },
  { id: "cuisine", label: "Cuisine", Icon: ChefHat, modules: ["cuisine"] },
  { id: "chambre", label: "Chambre", Icon: BedDouble },
  { id: "suite", label: "Suite parentale", Icon: BedDouble, modules: ["sanitaire"] },
  { id: "dressing", label: "Dressing", Icon: Shirt },
  { id: "bureau", label: "Bureau", Icon: Briefcase },
  { id: "sdb", label: "Salle de bain", Icon: Bath, modules: ["sanitaire"] },
  { id: "sde", label: "Salle d'eau", Icon: Droplets, modules: ["sanitaire"] },
  { id: "wc", label: "WC", Icon: Droplets, modules: ["sanitaire"] },
  { id: "debarras", label: "Débarras", Icon: Package },
  { id: "cellier", label: "Cellier", Icon: Package },
  { id: "buanderie", label: "Buanderie", Icon: Package },
  { id: "veranda", label: "Véranda", Icon: Sun },
  { id: "balcon", label: "Balcon", Icon: Sun, modules: ["exterieur"], cat: "ext" },
  { id: "terrasse", label: "Terrasse", Icon: Sun, modules: ["exterieur"], cat: "ext" },
  { id: "garage", label: "Garage", Icon: Car },
  { id: "cave", label: "Cave", Icon: Warehouse },
  { id: "soussol", label: "Sous-sol", Icon: Warehouse },
  { id: "combles", label: "Combles", Icon: Layers, modules: ["toiture"] },
  { id: "grenier", label: "Grenier", Icon: Layers },
  { id: "escalier", label: "Escalier", Icon: ArrowUpDown },
  { id: "facade", label: "Façade", Icon: Building2, modules: ["facade"], cat: "ext" },
  { id: "toiture", label: "Toiture", Icon: Home, modules: ["toiture"], cat: "ext" },
  { id: "jardin", label: "Jardin", Icon: Trees, modules: ["exterieur"], cat: "ext" },
  { id: "technique", label: "Local technique", Icon: Wrench },
  { id: "communes", label: "Parties communes", Icon: Building2 },

  { id: "facade_avant", label: "Façade avant", Icon: Building2, modules: ["facade"], cat: "ext" },
  { id: "facade_arriere", label: "Façade arrière", Icon: Building2, modules: ["facade"], cat: "ext" },
  { id: "pignon", label: "Pignon", Icon: Building2, modules: ["facade"], cat: "ext" },
  { id: "cour", label: "Cour", Icon: Trees, modules: ["exterieur"], cat: "ext" },
];

/* ---- Formes de zones ---- */
export const n = (v) => {
  const x = parseFloat(String(v ?? "").replace(",", "."));
  return isFinite(x) ? x : 0;
};

export const FORMES = {
  rectangle: {
    label: "Rectangle", fields: ["L", "l", "H"],
    sol: (z) => n(z.L) * n(z.l), perim: (z) => 2 * (n(z.L) + n(z.l)),
  },
  carre: {
    label: "Carré", fields: ["L", "H"], hint: "L = côté",
    sol: (z) => n(z.L) ** 2, perim: (z) => 4 * n(z.L),
  },
  triangle: {
    label: "Triangle", fields: ["L", "l", "H"], hint: "L = base, l = hauteur du triangle",
    sol: (z) => (n(z.L) * n(z.l)) / 2,
    perim: (z) => n(z.L) + n(z.l) + Math.hypot(n(z.L), n(z.l)),
  },
  trapeze: {
    label: "Trapèze", fields: ["L", "l", "p", "H"], hint: "L = grande base, l = petite base, p = profondeur",
    sol: (z) => ((n(z.L) + n(z.l)) / 2) * n(z.p),
    perim: (z) => n(z.L) + n(z.l) + 2 * Math.hypot(n(z.p), Math.abs(n(z.L) - n(z.l)) / 2),
  },
  enL: {
    label: "Partie en L", fields: ["L", "l", "a", "b", "H"], hint: "L × l = rectangle englobant, a × b = angle manquant",
    sol: (z) => n(z.L) * n(z.l) - n(z.a) * n(z.b),
    perim: (z) => 2 * (n(z.L) + n(z.l)),
  },
  rampant: {
    label: "Rampant / mansardé", fields: ["L", "l", "H", "H2"], hint: "H = hauteur haute, H2 = hauteur basse",
    sol: (z) => n(z.L) * n(z.l), perim: (z) => 2 * (n(z.L) + n(z.l)),
    hMoy: (z) => (n(z.H) + n(z.H2)) / 2,
  },
  perso: {
    label: "Personnalisée", fields: ["surfaceManu", "perimManu", "H"], hint: "Surface et périmètre saisis directement",
    sol: (z) => n(z.surfaceManu), perim: (z) => n(z.perimManu),
  },
};

export const PRESETS_ZONE = [
  "Zone principale", "Renfoncement", "Niche", "Retour", "Décroché",
  "Sous-escalier", "Partie en L", "Partie mansardée", "Rampant", "Trémie",
];

export const FIELD_LABELS = {
  L: "Longueur", l: "Largeur", H: "Hauteur", H2: "Haut. basse",
  p: "Profondeur", a: "Retrait a", b: "Retrait b",
  surfaceManu: "Surface", perimManu: "Périmètre",
};

/* ---- Ouvertures ---- */
export const TYPES_OUV = [
  "Porte", "Fenêtre", "Baie vitrée", "Verrière", "Passage ouvert", "Trappe", "Niche", "Personnalisée",
];

export const LOTS_DEDUC = [
  { k: "murs", label: "Murs" },
  { k: "peinture", label: "Peinture" },
  { k: "enduit", label: "Enduit" },
  { k: "doublage", label: "Doublage" },
  { k: "isolation", label: "Isolation" },
  { k: "faience", label: "Faïence" },
  { k: "papier", label: "Papier peint" },
  { k: "plinthes", label: "Plinthes" },
];

export const RETOURS = [
  { k: "tabG", label: "Tableau gauche" },
  { k: "tabD", label: "Tableau droit" },
  { k: "linteau", label: "Linteau" },
  { k: "appui", label: "Appui" },
  { k: "seuil", label: "Seuil" },
];

/* ---- Revêtements de sol ---- */
export const REVETEMENTS = [
  "Carrelage", "Parquet stratifié", "Parquet contrecollé", "Parquet massif",
  "Sol PVC", "Lino", "Moquette", "Résine",
  /* conservés : des visites antérieures peuvent déjà les porter */
  "Vinyle", "Béton ciré",
  "Autre",
];
export const MARGES = [0, 5, 7, 10, 12, 15];

/** Unités proposées pour une prestation saisie à la main. */
export const UNITES_LIBRES = ["m²", "ml", "m³", "u", "forfait", "h", "j"];

export const OPTIONS_SOL = [
  { k: "sousMeubles", label: "Passe sous meubles de cuisine" },
  { k: "sousPlacards", label: "Passe sous placards" },
  { k: "sousBaignoire", label: "Passe sous baignoire" },
  { k: "sousReceveur", label: "Passe sous receveur" },
  { k: "sousEquip", label: "Passe sous équipements fixes" },
  { k: "visibleSeul", label: "Zones visibles uniquement" },
];

/* ---- Plafond ---- */
export const MODES_PLAFOND = [
  "Existant conservé", "Peinture seule", "Faux plafond complet", "Faux plafond partiel",
  "Plafond suspendu", "Plafond démontable", "BA13 sur ossature", "Rampants", "Non traité",
];

/* ---- Plaques / ossature ---- */
export const PLAQUES = [
  { id: "ba13", label: "BA13 standard", surf: 2.88 },
  { id: "ba13h", label: "BA13 hydrofuge", surf: 2.88 },
  { id: "ba13p", label: "BA13 phonique", surf: 2.88 },
  { id: "ba13f", label: "BA13 feu", surf: 2.88 },
  { id: "ba18", label: "BA18", surf: 2.88 },
  { id: "hd", label: "Haute dureté", surf: 2.88 },
];
export const OSSATURES = ["Rails 48", "Rails 70", "Rails 90", "Fourrures F530", "Doublage collé", "Autre"];
export const ENTRAXES = [40, 60];

/* ---- Peinture ---- */
export const SUPPORTS_PEINTURE = [
  { k: "murs", label: "Murs", unit: "m²", auto: "peintureMurs" },
  { k: "plafonds", label: "Plafonds", unit: "m²", auto: "plafondNet" },
  { k: "portes", label: "Portes", unit: "u", auto: "nbPortes" },
  { k: "fenetres", label: "Fenêtres", unit: "u", auto: "nbFenetres" },
  { k: "boiseries", label: "Boiseries", unit: "m²" },
  { k: "plinthes", label: "Plinthes", unit: "ml", auto: "plinthesRetenu" },
  { k: "radiateurs", label: "Radiateurs", unit: "u" },
  { k: "escaliers", label: "Escaliers", unit: "u" },
  { k: "gardecorps", label: "Garde-corps", unit: "ml" },
  { k: "tuyaux", label: "Tuyauteries", unit: "ml" },
  { k: "metal", label: "Éléments métalliques", unit: "m²" },
  { k: "facade", label: "Façade", unit: "m²" },
];

export const PREPARATIONS = [
  "Lessivage", "Grattage", "Ponçage", "Reprises localisées", "Rebouchage",
  "Ratissage partiel", "Ratissage complet", "Impression",
];

/* ---- Équipements (compteurs génériques) ---- */
export const ETATS_EQUIP = ["Existant", "À conserver", "À déposer", "À déplacer", "À remplacer", "À créer"];

/* ---- Module Électricité détaillé ---- */
/* socles : nb de socles de prise représentés (info secondaire, pas l'appareillage) */
export const ELEC_CAT = [
  { id: "prise_simple", label: "Prise simple", grp: "prises", socles: 1, defP: "" },
  { id: "prise_double", label: "Prise double", grp: "prises", socles: 2, defP: "" },
  { id: "prise_triple", label: "Prise triple", grp: "prises", socles: 3, defP: "" },
  { id: "prise_spec", label: "Prise spécialisée", grp: "spec", socles: 1, defP: "3680 W" },
  { id: "prise_32", label: "Prise 32 A (cuisson)", grp: "spec", socles: 1, defP: "7360 W" },
  { id: "inter_simple", label: "Interrupteur simple", grp: "inters", socles: 0 },
  { id: "inter_double", label: "Interrupteur double", grp: "inters", socles: 0 },
  { id: "inter_triple", label: "Interrupteur triple", grp: "inters", socles: 0 },
  { id: "va_et_vient", label: "Va-et-vient", grp: "inters", socles: 0 },
  { id: "bouton_poussoir", label: "Bouton-poussoir", grp: "inters", socles: 0 },
  { id: "variateur", label: "Variateur", grp: "inters", socles: 0 },
  { id: "point_lumineux", label: "Point lumineux (DCL)", grp: "points", socles: 0 },
  { id: "applique", label: "Applique", grp: "points", socles: 0 },
  { id: "spot", label: "Spot", grp: "spots", socles: 0 },
  { id: "ruban_led", label: "Ruban LED", grp: "spots", socles: 0 },
  { id: "rj45", label: "Prise RJ45", grp: "rj45", socles: 0 },
  { id: "prise_tv", label: "Prise TV", grp: "faible", socles: 0 },
  { id: "prise_usb", label: "Prise USB", grp: "faible", socles: 0 },
  { id: "sortie_cable", label: "Sortie de câble", grp: "spec", socles: 0 },
  { id: "tableau", label: "Tableau / coffret", grp: "spec", socles: 0 },
  { id: "detecteur", label: "Détecteur", grp: "faible", socles: 0 },
  { id: "vmc", label: "Commande VMC", grp: "spec", socles: 0 },
  { id: "interphone", label: "Interphone / visiophone", grp: "faible", socles: 0 },
  { id: "volet", label: "Commande volet roulant", grp: "spec", socles: 0 },
  { id: "thermostat", label: "Thermostat", grp: "spec", socles: 0 },
  { id: "rad_elec", label: "Radiateur électrique", grp: "spec", socles: 0, defP: "1000 W" },
  { id: "seche_serviettes", label: "Sèche-serviettes", grp: "spec", socles: 0, defP: "750 W" },
  { id: "irve", label: "Borne IRVE", grp: "spec", socles: 0, defP: "7400 W" },
  { id: "domotique", label: "Équipement domotique", grp: "faible", socles: 0 },
];

export const ELEC_POSES = ["Encastré", "Apparent", "Saillie", "En goulotte"];
export const ELEC_EMPLACEMENTS = [
  "Mur nord", "Mur sud", "Mur est", "Mur ouest", "Plafond", "Sol",
  "Plan de travail", "Derrière meuble", "Entrée de pièce", "Autre",
];
export const ELEC_HAUTEURS = ["0,25 m", "0,30 m", "1,10 m", "1,20 m", "1,30 m", "Plafond"];

/* Groupes affichés dans le résumé de pièce et le récap chantier */
export const ELEC_RESUME = [
  { k: "prises", label: "Prises (total)" },
  { k: "inters", label: "Interrupteurs" },
  { k: "points", label: "Points lumineux" },
  { k: "spots", label: "Spots" },
  { k: "rj45", label: "Prises RJ45" },
  { k: "spec", label: "Équipements spécialisés" },
  { k: "faible", label: "Courant faible" },
];

export const EQUIPEMENTS = {
  elec: {
    label: "Électricité", items: [
      "Prise de courant", "Prise spécialisée", "Interrupteur simple", "Va-et-vient",
      "Bouton-poussoir", "Point lumineux", "Spot", "Applique", "Ruban LED",
      "Sortie de câble", "Prise RJ45", "Prise TV", "Prise USB", "Détecteur",
      "VMC", "Interphone", "Visiophone", "Volet roulant", "Thermostat",
      "Radiateur électrique", "Borne IRVE", "Équipement domotique",
    ],
  },
  plomberie: {
    label: "Plomberie / sanitaire", items: [
      "Alimentation eau froide", "Alimentation eau chaude", "Évacuation",
      "Nourrice", "Compteur", "Vanne", "Robinet d'arrêt", "Ballon d'eau chaude",
      "Chaudière", "Pompe à chaleur", "WC au sol", "WC suspendu", "Bâti-support",
      "Lavabo", "Lave-mains", "Meuble vasque", "Vasque", "Baignoire", "Receveur",
      "Douche", "Paroi", "Colonne de douche", "Mitigeur", "Robinetterie",
      "Sèche-serviettes", "Miroir", "Accessoires",
    ],
  },
  chauffage: {
    label: "Chauffage / clim / ventilation", items: [
      "Radiateur à eau", "Radiateur électrique", "Radiateur acier", "Radiateur fonte",
      "Sèche-serviettes", "Plancher chauffant", "Chaudière", "Pompe à chaleur",
      "Climatisation", "Unité intérieure", "Unité extérieure", "Poêle", "Conduit",
      "Thermostat", "Bouche VMC", "Extracteur", "Grille de ventilation",
    ],
  },
  menuiseries: {
    label: "Menuiseries / portes", items: [
      "Bloc-porte complet", "Porte seule", "Huisserie", "Porte battante",
      "Porte coulissante", "Porte à galandage", "Porte coupe-feu", "Porte isoplane",
      "Porte pleine", "Porte vitrée", "Quincaillerie", "Serrure", "Poignée",
      "Butée", "Habillage", "Placard battant", "Placard coulissant", "Dressing",
      "Étagères", "Penderie",
    ],
  },
  cuisine: {
    label: "Cuisine", items: [
      "Meuble haut", "Meuble bas", "Colonne", "Îlot", "Plan de travail",
      "Crédence", "Plinthe de cuisine", "Évier", "Mitigeur", "Hotte", "Plaque",
      "Four", "Lave-vaisselle", "Réfrigérateur", "Prise spécialisée",
      "Arrivée d'eau", "Évacuation", "Éclairage", "Ventilation",
    ],
  },
  sanitaire: {
    label: "Salle de bain / salle d'eau", items: [
      "Baignoire", "Douche", "Receveur", "Paroi", "Meuble vasque", "Vasque",
      "Robinetterie", "WC", "Bâti-support", "Sèche-serviettes", "Faïence",
      "Carrelage", "SPEC", "SEL", "Coffrage", "Niche", "Ventilation",
    ],
  },
  facade: {
    label: "Façade", items: [
      "Crépi", "Enduit", "Pierre", "Brique", "Nettoyage", "Traitement",
      "Hydrofuge", "Peinture", "Reprise ponctuelle", "Fissure", "Décollement",
      "Trace de suie", "Humidité", "Échafaudage", "Nacelle",
    ],
  },
  toiture: {
    label: "Toiture", items: [
      "Tuiles", "Ardoises", "Zinc", "Bac acier", "Charpente", "Isolation",
      "Écran sous-toiture", "Gouttière", "Descente", "Chéneau", "Solin",
      "Fenêtre de toit", "Étanchéité", "Échafaudage", "Nacelle",
    ],
  },
  exterieur: {
    label: "Aménagement extérieur", items: [
      "Dalle béton", "Terrasse bois", "Dallage", "Garde-corps", "Clôture",
      "Portail", "Évacuation EP", "Terrassement", "Plantation",
    ],
  },
};

/* ---- Bibliothèque des travaux par lot ---- */
export const LOTS = [
  { id: "instal", nom: "Installation de chantier", items: [
    { id: "in_instal", label: "Installation de chantier", unit: "forfait" },
    { id: "in_protec", label: "Protections sols et existants", unit: "m²", auto: "solNet" },
    { id: "in_confine", label: "Confinement poussière", unit: "forfait" },
    { id: "in_benne", label: "Location benne", unit: "u" },
  ]},
  { id: "demo", nom: "Démolition / curage", items: [
    { id: "de_carrelage", label: "Dépose carrelage sol", unit: "m²", auto: "solNet" },
    { id: "de_faience", label: "Dépose faïence", unit: "m²", auto: "faienceNet" },
    { id: "de_parquet", label: "Dépose parquet / moquette", unit: "m²", auto: "solNet" },
    { id: "de_plinthes", label: "Dépose plinthes", unit: "ml", auto: "plinthesNet" },
    { id: "de_portes", label: "Dépose portes + huisseries", unit: "u", auto: "nbPortes" },
    { id: "de_fenetres", label: "Dépose fenêtres", unit: "u", auto: "nbFenetres" },
    { id: "de_cloison", label: "Dépose cloison", unit: "m²" },
    { id: "de_doublage", label: "Dépose doublage / isolant", unit: "m²", auto: "doublageNet" },
    { id: "de_fauxplaf", label: "Dépose faux plafond", unit: "m²", auto: "plafondNet" },
    { id: "de_toiledeverre", label: "Dépose de toile de verre", unit: "m²", auto: "mursNet" },
    { id: "de_papierpeint", label: "Dépose de papier peint", unit: "m²", auto: "mursNet" },
    { id: "de_curage", label: "Curage complet", unit: "m²", auto: "solNet" },
    { id: "de_gravats", label: "Évacuation des gravats", unit: "m³" },
  ]},
  { id: "macon", nom: "Maçonnerie / gros œuvre", items: [
    { id: "ma_ouverture", label: "Ouverture dans mur porteur", unit: "u" },
    { id: "ma_ipn", label: "Pose IPN / linteau", unit: "u" },
    { id: "ma_rebouchage", label: "Rebouchage / calfeutrement", unit: "u" },
    { id: "ma_chape", label: "Chape", unit: "m²", auto: "solNet" },
    { id: "ma_ragreage", label: "Ragréage", unit: "m²", auto: "solNet" },
    { id: "ma_saignee", label: "Saignées", unit: "ml" },
  ]},
  { id: "platre", nom: "Plâtrerie / isolation / faux plafond", items: [
    { id: "pl_doublage", label: "Doublage", unit: "m²", auto: "doublageNet" },
    { id: "pl_cloison", label: "Cloison", unit: "m²", auto: "cloisonSurf" },
    { id: "pl_isolation", label: "Isolation", unit: "m²", auto: "isolationNet" },
    { id: "pl_fauxplaf", label: "Faux plafond", unit: "m²", auto: "plafondNet" },
    { id: "pl_bandes", label: "Bandes / ratissage", unit: "m²", auto: "mursNet" },
    { id: "pl_trappe", label: "Trappe de visite", unit: "u" },
    { id: "pl_habillage", label: "Coffrage / habillage", unit: "ml" },
  ]},
  { id: "menint", nom: "Menuiseries intérieures", items: [
    { id: "mi_bloc", label: "Bloc-porte", unit: "u", auto: "nbPortes" },
    { id: "mi_coul", label: "Porte coulissante / galandage", unit: "u" },
    { id: "mi_placard", label: "Placard / dressing", unit: "ml" },
    { id: "mi_plinthes", label: "Plinthes", unit: "ml", auto: "plinthesNet" },
    { id: "mi_habillage", label: "Habillage / chambranle", unit: "u" },
  ]},
  { id: "menext", nom: "Menuiseries extérieures / vitrerie", items: [
    { id: "me_fenetre", label: "Fenêtre", unit: "u", auto: "nbFenetres" },
    { id: "me_baie", label: "Porte-fenêtre / baie", unit: "u" },
    { id: "me_porte", label: "Porte d'entrée", unit: "u" },
    { id: "me_volet", label: "Volet roulant", unit: "u", auto: "nbFenetres" },
    { id: "me_appui", label: "Appui de fenêtre", unit: "u", auto: "nbFenetres" },
    { id: "me_vitrage", label: "Vitrage / verrière", unit: "m²" },
  ]},
  { id: "serrur", nom: "Serrurerie / métallerie", items: [
    { id: "se_gardecorps", label: "Garde-corps", unit: "ml" },
    { id: "se_grille", label: "Grille / barreaudage", unit: "u" },
    { id: "se_structure", label: "Structure métallique", unit: "kg" },
  ]},
  { id: "sols", nom: "Revêtements de sol", items: [
    /* Le libellé de ces deux postes reçoit le type de revêtement choisi au
       métré (voir typeRevetement / catalogueDeRoom dans lib/travaux.js). */
    { id: "so_revetement", label: "Revêtement de sol", unit: "m²", auto: "solNet" },
    { id: "so_depose", label: "Dépose du revêtement de sol", unit: "m²", auto: "solNet" },
    { id: "so_soucouche", label: "Sous-couche", unit: "m²", auto: "solNet" },
    { id: "so_seuil", label: "Barre de seuil", unit: "u" },
    { id: "so_nezmarche", label: "Nez de marche", unit: "u" },
  ]},
  { id: "murs", nom: "Revêtements muraux", items: [
    { id: "mu_enduit", label: "Enduit / ratissage", unit: "m²", auto: "enduitNet" },
    { id: "mu_toile", label: "Toile de verre", unit: "m²", auto: "mursNet" },
    { id: "mu_papier", label: "Papier peint", unit: "m²", auto: "papierNet" },
    { id: "mu_faience", label: "Faïence", unit: "m²", auto: "faienceNet" },
    { id: "mu_parement", label: "Parement / pierre", unit: "m²" },
  ]},
  { id: "peint", nom: "Peinture", items: [
    { id: "pe_prepa", label: "Préparation des supports", unit: "m²", auto: "mursNet" },
    { id: "pe_murs", label: "Peinture murs", unit: "m²", auto: "peintureMurs" },
    { id: "pe_plafond", label: "Peinture plafond", unit: "m²", auto: "plafondNet" },
    { id: "pe_portes", label: "Peinture portes", unit: "u", auto: "nbPortes" },
    { id: "pe_plinthes", label: "Peinture plinthes", unit: "ml", auto: "plinthesNet" },
    { id: "pe_boiseries", label: "Peinture boiseries", unit: "m²" },
    { id: "pe_metal", label: "Peinture métaux", unit: "m²" },
  ]},
  { id: "elec", nom: "Électricité / courant faible", items: [
    /* Détail par pièce : chaque appareillage a son poste et sa quantité
       propre, alimentés par le relevé électrique de la pièce. */
    { id: "el_prise_simple", label: "Prise simple", unit: "u", auto: "nbPriseSimple" },
    { id: "el_prise_double", label: "Prise double", unit: "u", auto: "nbPriseDouble" },
    { id: "el_prise_triple", label: "Prise triple", unit: "u", auto: "nbPriseTriple" },
    { id: "el_prise_spec", label: "Prise spécialisée", unit: "u", auto: "nbSpec" },
    { id: "el_inter_simple", label: "Interrupteur simple", unit: "u", auto: "nbInterSimple" },
    { id: "el_inter_double", label: "Interrupteur double", unit: "u", auto: "nbInterDouble" },
    { id: "el_inter_triple", label: "Interrupteur triple", unit: "u", auto: "nbInterTriple" },
    { id: "el_point_lumineux", label: "Point lumineux", unit: "u", auto: "nbPoints" },
    { id: "el_spot", label: "Spot / ruban LED", unit: "u", auto: "nbSpots" },
    { id: "el_rj45", label: "Prise RJ45", unit: "u", auto: "nbRJ45" },
    { id: "el_faible", label: "Courant faible (TV, USB, détecteur…)", unit: "u", auto: "nbFaible" },
    { id: "el_tableau", label: "Tableau électrique", unit: "u" },
    { id: "el_point", label: "Point électrique (total)", unit: "u", auto: "nbPointsElec" },
    { id: "el_courantfaible", label: "Courant faible (RJ45 / TV)", unit: "u" },
    { id: "el_consuel", label: "Consuel", unit: "forfait" },
  ]},
  { id: "plomb", nom: "Plomberie / sanitaire", items: [
    { id: "pb_alim", label: "Alimentation EF / EC", unit: "pt" },
    { id: "pb_evac", label: "Évacuation", unit: "pt" },
    { id: "pb_equip", label: "Équipement sanitaire", unit: "u", auto: "nbSanitaires" },
    { id: "pb_ballon", label: "Production ECS", unit: "u" },
  ]},
  { id: "chauf", nom: "Chauffage / clim / ventilation", items: [
    { id: "ch_emetteur", label: "Émetteur de chauffage", unit: "u", auto: "nbRadiateurs" },
    { id: "ch_generateur", label: "Générateur (chaudière / PAC)", unit: "u" },
    { id: "ch_pc", label: "Plancher chauffant", unit: "m²", auto: "solNet" },
    { id: "ch_vmc", label: "Ventilation / VMC", unit: "u" },
  ]},
  { id: "cuisine", nom: "Cuisine", items: [
    { id: "cu_meubles", label: "Meubles de cuisine", unit: "ml" },
    { id: "cu_plan", label: "Plan de travail", unit: "ml", auto: "cuisine.pdtLongueur" },
    { id: "cu_credence", label: "Crédence", unit: "m²", auto: "cuisine.credenceSurface" },
    { id: "cu_electro", label: "Électroménager", unit: "u", auto: "cuisine.nbElectro" },
  ]},
  { id: "sdb", nom: "Salle de bain", items: [
    { id: "sd_equip", label: "Équipement sanitaire", unit: "u" },
    { id: "sd_etancheite", label: "Étanchéité SPEC / SEL", unit: "m²" },
    { id: "sd_faience", label: "Faïence", unit: "m²", auto: "faienceNet" },
  ]},
  { id: "facade", nom: "Façade", items: [
    { id: "fa_enduit", label: "Enduit / crépi", unit: "m²", auto: "facade.surfaceATraiter" },
    { id: "fa_peinture", label: "Peinture façade", unit: "m²", auto: "facade.surfaceATraiter" },
    { id: "fa_nettoyage", label: "Nettoyage / traitement", unit: "m²", auto: "facade.surfaceNette" },
    { id: "fa_fissure", label: "Reprise de fissures", unit: "ml" },
    { id: "fa_echafaudage", label: "Échafaudage", unit: "m²", auto: "facade.surfaceBrute" },
  ]},
  { id: "couv", nom: "Couverture / charpente / zinguerie", items: [
    { id: "co_couverture", label: "Couverture", unit: "m²" },
    { id: "co_charpente", label: "Charpente", unit: "m²" },
    { id: "co_isolation", label: "Isolation combles", unit: "m²" },
    { id: "co_etancheite", label: "Étanchéité", unit: "m²" },
    { id: "co_zinguerie", label: "Zinguerie / solins", unit: "ml" },
    { id: "co_gouttiere", label: "Gouttières / descentes", unit: "ml" },
    { id: "co_velux", label: "Fenêtre de toit", unit: "u" },
  ]},
  { id: "ext", nom: "Terrassement / aménagement extérieur", items: [
    { id: "ex_terrassement", label: "Terrassement", unit: "m³" },
    { id: "ex_dalle", label: "Dalle / dallage", unit: "m²" },
    { id: "ex_cloture", label: "Clôture / portail", unit: "ml" },
    { id: "ex_evac", label: "Évacuation EP / drainage", unit: "ml" },
  ]},
  { id: "nettoyage", nom: "Nettoyage / divers", items: [
    { id: "ne_chantier", label: "Nettoyage de chantier", unit: "m²", auto: "solNet" },
    { id: "ne_fin", label: "Nettoyage de fin de chantier", unit: "forfait" },
    { id: "ne_autre", label: "Autres travaux", unit: "forfait" },
  ]},
];

/* ---- Check-list de fin de visite ---- */
export const CHECKLIST = [
  "Toutes les pièces visitées", "Dimensions relevées", "Hauteurs relevées",
  "Portes mesurées", "Fenêtres mesurées", "Radiateurs recensés", "Prises recensées",
  "Photos réalisées", "Tableau électrique photographié", "Compteurs photographiés",
  "Accès vérifié", "Stationnement vérifié", "Demandes du client notées",
  "Délai souhaité renseigné", "Matériaux ou finitions identifiés", "Points à confirmer listés",
];

export const TYPES_BIEN = ["Appartement", "Maison", "Immeuble", "Commerce", "Bureau", "Entrepôt", "Local technique", "Autre"];
export const OCCUPATIONS = ["Vide", "Occupé", "Locataire en place", "Propriétaire occupant", "Meublé"];
export const PRESENTS = ["Propriétaire", "Locataire", "Gestionnaire", "Syndic", "Aucun"];
export const ORIGINES = ["Recommandation", "Site internet", "Appel entrant", "Assurance", "Client existant", "Prospection", "Autre"];

/* ==================================================================== */
/*  PROFIL FAÇADE                                                       */
/* ==================================================================== */

export const FACADE_ORIENTATIONS = ["Nord", "Sud", "Est", "Ouest", "Nord-est", "Nord-ouest", "Sud-est", "Sud-ouest", "Sur rue", "Sur cour", "Pignon"];

export const FACADE_SUPPORTS = [
  "Enduit ciment", "Enduit hydraulique", "Enduit monocouche", "Crépi", "Béton",
  "Béton banché", "Brique", "Brique apparente", "Pierre", "Moellon", "Parpaing",
  "Bardage bois", "Bardage métallique", "Bardage composite", "ITE existante", "Autre",
];

export const FACADE_ETATS = ["Bon état", "État moyen", "Dégradé", "Très dégradé"];

export const FACADE_ACCES = ["Échafaudage fixe", "Échafaudage roulant", "Nacelle", "Cordiste", "Pied / échelle", "À définir"];

/* Chaque pathologie porte son unité de métré : c'est elle qui pilote le chiffrage. */
export const FACADE_PATHOLOGIES = [
  { id: "microfissure", label: "Microfissure", unite: "ml" },
  { id: "fissure", label: "Fissure", unite: "ml" },
  { id: "fissure_trav", label: "Fissure traversante", unite: "ml" },
  { id: "lezarde", label: "Lézarde", unite: "ml" },
  { id: "joint_degrade", label: "Joint dégradé", unite: "ml" },
  { id: "decollement", label: "Décollement d'enduit", unite: "m²" },
  { id: "cloquage", label: "Cloquage / faïençage", unite: "m²" },
  { id: "enduit_sonne", label: "Enduit sonnant à piocher", unite: "m²" },
  { id: "humidite", label: "Humidité / infiltration", unite: "m²" },
  { id: "remontees", label: "Remontées capillaires", unite: "m²" },
  { id: "salpetre", label: "Salpêtre / efflorescence", unite: "m²" },
  { id: "mousse", label: "Mousse / lichen", unite: "m²" },
  { id: "salissure", label: "Salissure / pollution", unite: "m²" },
  { id: "suie", label: "Trace de suie", unite: "m²" },
  { id: "graffiti", label: "Graffiti / tag", unite: "m²" },
  { id: "eclat", label: "Éclat / épaufrure", unite: "u" },
  { id: "fer_apparent", label: "Fer apparent / oxydation", unite: "u" },
  { id: "nid_gravier", label: "Nid de gravier", unite: "u" },
  { id: "appui_degrade", label: "Appui dégradé", unite: "u" },
  { id: "corniche_degradee", label: "Corniche dégradée", unite: "ml" },
  { id: "descente_ep", label: "Descente EP défectueuse", unite: "u" },
  { id: "scellement", label: "Scellement à reprendre", unite: "u" },
  { id: "autre_patho", label: "Autre désordre", unite: "forfait" },
];

/* auto : clé du calcul façade qui alimente la quantité proposée */
export const FACADE_TRAVAUX = [
  { id: "fa_echafaudage", label: "Échafaudage", unite: "m²", auto: "surfaceBrute" },
  { id: "fa_nacelle", label: "Nacelle", unite: "j" },
  { id: "fa_protection", label: "Protections / bâchage", unite: "m²", auto: "surfaceBrute" },
  { id: "fa_nettoyage_hp", label: "Nettoyage haute pression", unite: "m²", auto: "surfaceNette" },
  { id: "fa_nettoyage_bp", label: "Nettoyage basse pression", unite: "m²", auto: "surfaceNette" },
  { id: "fa_antimousse", label: "Traitement anti-mousse", unite: "m²", auto: "surfaceNette" },
  { id: "fa_decapage", label: "Décapage", unite: "m²", auto: "surfaceNette" },
  { id: "fa_piochage", label: "Piochage d'enduit", unite: "m²", auto: "reparationsM2" },
  { id: "fa_rebouchage", label: "Rebouchage / reprise localisée", unite: "m²", auto: "reparationsM2" },
  { id: "fa_fissures", label: "Ouverture et traitement de fissures", unite: "ml", auto: "reparationsMl" },
  { id: "fa_pontage", label: "Pontage de fissures", unite: "ml", auto: "reparationsMl" },
  { id: "fa_agrafage", label: "Agrafage de lézarde", unite: "ml" },
  { id: "fa_ragreage", label: "Ragréage", unite: "m²", auto: "surfaceNette" },
  { id: "fa_enduit_rebouchage", label: "Enduit de rebouchage", unite: "m²", auto: "surfaceNette" },
  { id: "fa_enduit_finition", label: "Enduit de finition", unite: "m²", auto: "surfaceATraiter" },
  { id: "fa_impermeabilisation", label: "Imperméabilisation (I4)", unite: "m²", auto: "surfaceATraiter" },
  { id: "fa_hydrofuge", label: "Hydrofuge", unite: "m²", auto: "surfaceATraiter" },
  { id: "fa_peinture", label: "Peinture de façade", unite: "m²", auto: "surfaceATraiter" },
  { id: "fa_ravalement", label: "Ravalement complet", unite: "m²", auto: "surfaceATraiter" },
  { id: "fa_ite", label: "Isolation thermique par l'extérieur", unite: "m²", auto: "surfaceNette" },
  { id: "fa_bardage", label: "Bardage", unite: "m²", auto: "surfaceNette" },
  { id: "fa_soubassement", label: "Traitement du soubassement", unite: "m²", auto: "soubassement" },
  { id: "fa_tableaux", label: "Reprise des tableaux", unite: "m²", auto: "tableaux" },
  { id: "fa_bandeaux", label: "Reprise de bandeaux / corniches", unite: "ml", auto: "bandeaux" },
  { id: "fa_appuis", label: "Reprise d'appuis", unite: "u", auto: "nbFenetres" },
  { id: "fa_zinguerie", label: "Zinguerie / descentes EP", unite: "ml" },
  { id: "fa_nettoyage_fin", label: "Nettoyage de fin de chantier", unite: "forfait" },
];

export const FACADE_FINITIONS = [
  "Enduit taloché", "Enduit gratté", "Enduit écrasé", "Enduit projeté", "Enduit ribbé",
  "RPE", "Peinture siloxane", "Peinture pliolite", "Peinture acrylique",
  "Badigeon de chaux", "Lasure", "Aucune",
];
export const FACADE_ASPECTS = ["Taloché", "Gratté", "Écrasé", "Ribbé", "Roulé", "Lisse", "Rustique"];

/* ==================================================================== */
/*  PROFIL CUISINE                                                      */
/* ==================================================================== */

/* largeurs standard en cm — le métreur choisit d'un geste, ou saisit une largeur libre */
export const CUISINE_MEUBLES = [
  { id: "bas", label: "Meuble bas", rang: "bas", largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], h: 70, p: 56 },
  { id: "bas_tiroirs", label: "Meuble bas à tiroirs", rang: "bas", largeurs: [40, 50, 60, 80, 90, 120], h: 70, p: 56 },
  { id: "sous_evier", label: "Meuble sous-évier", rang: "bas", largeurs: [60, 80, 90, 120], h: 70, p: 56 },
  { id: "angle_bas", label: "Meuble d'angle bas", rang: "bas", largeurs: [90, 100, 110], h: 70, p: 56 },
  { id: "meuble_four", label: "Meuble four / micro-ondes", rang: "colonne", largeurs: [60], h: 200, p: 56 },
  { id: "haut", label: "Meuble haut", rang: "haut", largeurs: [30, 40, 45, 50, 60, 80, 90, 100, 120], h: 70, p: 35 },
  { id: "haut_vitre", label: "Meuble haut vitré", rang: "haut", largeurs: [40, 50, 60, 80], h: 70, p: 35 },
  { id: "angle_haut", label: "Meuble d'angle haut", rang: "haut", largeurs: [60, 65, 90], h: 70, p: 35 },
  { id: "hotte_meuble", label: "Meuble hotte", rang: "haut", largeurs: [60, 90], h: 35, p: 35 },
  { id: "colonne", label: "Colonne", rang: "colonne", largeurs: [40, 50, 60], h: 200, p: 56 },
  { id: "colonne_frigo", label: "Colonne réfrigérateur", rang: "colonne", largeurs: [60], h: 200, p: 56 },
  { id: "ilot", label: "Îlot", rang: "ilot", largeurs: [120, 150, 180, 200, 240], h: 90, p: 90 },
  { id: "bar", label: "Bar / retour", rang: "ilot", largeurs: [90, 120, 150], h: 105, p: 60 },
  { id: "etagere", label: "Étagère", rang: "haut", largeurs: [60, 80, 100, 120], h: 4, p: 25 },
  { id: "casserolier", label: "Casserolier", rang: "bas", largeurs: [40, 50, 60, 80, 90, 120], h: 70, p: 56 },
  { id: "meuble_plaque", label: "Meuble plaque", rang: "bas", largeurs: [60, 80, 90], h: 70, p: 56 },
  { id: "meuble_lv", label: "Meuble lave-vaisselle", rang: "bas", largeurs: [45, 60], h: 70, p: 56 },
  { id: "meuble_mo", label: "Meuble micro-ondes", rang: "haut", largeurs: [60], h: 40, p: 35 },
  { id: "sur_mesure", label: "Meuble sur mesure", rang: "bas", largeurs: [], h: 70, p: 56 },
  { id: "meuble_perso", label: "Autre élément", rang: "bas", largeurs: [], h: 70, p: 56 },
  /* Accessoires : comptés à part. Une joue n'est pas un meuble bas et ne doit
     entrer ni dans le nombre de meubles ni dans la largeur cumulée. */
  { id: "joue", label: "Joue de finition", rang: "accessoire", largeurs: [], h: 70, p: 56 },
  { id: "fileur", label: "Fileur", rang: "accessoire", largeurs: [3, 5, 8, 10], h: 70, p: 2 },
  { id: "plinthe_cuisine", label: "Plinthe de cuisine", rang: "accessoire", largeurs: [], h: 15, p: 2 },
];

export const CUISINE_RANGS = [
  { k: "bas", label: "Meubles bas" },
  { k: "haut", label: "Meubles hauts" },
  { k: "colonne", label: "Colonnes" },
  { k: "ilot", label: "Îlot / bar" },
  { k: "accessoire", label: "Joues, fileurs, plinthes" },
];
/* Rangs entrant dans le comptage des meubles (les accessoires en sont exclus). */
export const CUISINE_RANGS_MEUBLE = ["bas", "haut", "colonne", "ilot"];

export const CUISINE_ETATS = ["Existant", "À conserver", "À déposer", "À déplacer", "À remplacer", "À créer"];
export const CUISINE_POSITIONS = ["Mur A", "Mur B", "Mur C", "Mur D", "Îlot", "Sous fenêtre", "Angle", "À définir"];
export const CUISINE_IMPLANTATIONS = ["Linéaire", "En L", "En U", "Parallèle (couloir)", "Avec îlot", "Avec bar"];

export const PDT_MATERIAUX = ["Stratifié", "Stratifié postformé", "Bois massif", "Compact (HPL)", "Quartz", "Granit", "Céramique", "Dekton", "Inox", "Béton ciré", "Autre"];
export const PDT_CHANTS = ["Droit", "Postformé", "ABS", "Massif", "Poli", "Adouci"];
export const PDT_DECOUPES = [
  { k: "evier", label: "Découpe évier" },
  { k: "plaque", label: "Découpe plaque" },
  { k: "robinet", label: "Perçage robinet" },
  { k: "angle", label: "Coupe d'angle" },
  { k: "prise", label: "Découpe prise" },
];
export const PDT_EPAISSEURS = [12, 20, 22, 30, 38, 40, 60];

export const CREDENCE_MATERIAUX = ["Faïence", "Verre laqué", "Stratifié", "Inox", "Quartz", "Céramique", "Compact", "Peinture lessivable", "Autre"];

export const CUISINE_EQUIPEMENTS = [
  "Évier", "Mitigeur", "Hotte aspirante", "Hotte décorative", "Plaque de cuisson",
  "Four", "Four vapeur", "Micro-ondes", "Lave-vaisselle", "Réfrigérateur",
  "Congélateur", "Cave à vin", "Éclairage sous meuble", "Éclairage plafond",
  "Prise spécialisée", "Arrivée d'eau", "Évacuation", "Ventilation", "Poubelle encastrée",
];

/* auto : clé du calcul cuisine qui alimente la quantité proposée */
export const CUISINE_TRAVAUX = [
  { id: "cu_depose", label: "Dépose de la cuisine existante", unite: "forfait" },
  { id: "cu_meubles_bas", label: "Fourniture et pose meubles bas", unite: "ml", auto: "mlBasProjet" },
  { id: "cu_meubles_haut", label: "Fourniture et pose meubles hauts", unite: "ml", auto: "mlHautProjet" },
  { id: "cu_colonnes", label: "Fourniture et pose colonnes", unite: "u", auto: "nbColonnesProjet" },
  { id: "cu_ilot", label: "Îlot / bar", unite: "ml", auto: "mlIlotProjet" },
  { id: "cu_plan", label: "Plan de travail", unite: "ml", auto: "pdtLongueur" },
  { id: "cu_decoupes", label: "Découpes de plan de travail", unite: "u", auto: "pdtDecoupes" },
  { id: "cu_credence", label: "Crédence", unite: "m²", auto: "credenceSurface" },
  { id: "cu_plinthe", label: "Plinthe de cuisine", unite: "ml", auto: "plintheCuisine" },
  { id: "cu_joues", label: "Joues de finition", unite: "u", auto: "nbJoues" },
  { id: "cu_fileurs", label: "Fileurs", unite: "u", auto: "nbFileurs" },
  { id: "cu_electro", label: "Pose électroménager", unite: "u", auto: "nbElectro" },
  { id: "cu_raccords", label: "Raccordements eau / évacuation", unite: "u" },
  { id: "cu_elec", label: "Alimentations électriques", unite: "u" },
];


/* ==================================================================== */
/*  DÉRIVATION DES LOTS MÉTIER (v2.2)                                   */
/*                                                                      */
/*  Les lots « Façade » et « Cuisine » du catalogue de travaux sont      */
/*  construits à partir des catalogues métier détaillés, pour qu'il      */
/*  n'existe qu'une seule liste d'ouvrages par métier.                   */
/*  Exécuté après toutes les déclarations : FACADE_TRAVAUX et            */
/*  CUISINE_TRAVAUX sont initialisés à ce point.                         */
/* ==================================================================== */

const remplirLot = (lotId, source, prefixe) => {
  const lot = LOTS.find((l) => l.id === lotId);
  if (!lot) return;
  lot.items = source.map((t) => ({
    id: t.id,
    label: t.label,
    unit: t.unite,
    ...(t.auto ? { auto: `${prefixe}.${t.auto}` } : {}),
  }));
};

remplirLot("facade", FACADE_TRAVAUX, "facade");
remplirLot("cuisine", CUISINE_TRAVAUX, "cuisine");

/* ==================================================================== */
/*  FAVORIS BRN GROUP (v2.2)                                            */
/*  Les ouvrages les plus fréquents en rénovation Île-de-France.        */
/*  Liste éditable : c'est un raccourci, pas une restriction.           */
/* ==================================================================== */
export const FAVORIS_BRN = [
  "in_instal", "in_protec", "de_gravats",
  "de_carrelage", "de_plinthes", "de_faience",
  "pl_doublage", "pl_fauxplaf",
  "so_revetement", "so_ragreage", "mi_plinthes",
  "mu_faience", "pe_murs", "pe_plafond", "pe_prep",
  "el_prises", "el_inter", "el_points",
  "pb_sanitaires", "ch_radiateurs",
  "cu_plan", "cu_credence",
  "fa_echafaudage", "fa_nettoyage_hp", "fa_peinture", "fa_fissures",
  "nettoyage_fin",
];


/* ==================================================================== */
/*  CATÉGORIES DE TYPES (v2.3)                                          */
/*  Une façade, une terrasse ou une toiture n'est pas une « pièce ».    */
/*  Le classement ne change QUE le rangement à l'écran ; le profil       */
/*  métier reste piloté par le typeId (voir lib/profils.js).            */
/* ==================================================================== */
TYPES.forEach((t) => { if (!t.cat) t.cat = "int"; });

export const CATEGORIES = [
  { k: "int", label: "Pièces", aide: "Intérieur du logement" },
  { k: "ext", label: "Zones extérieures", aide: "Façades, toiture, extérieurs" },
];

export const typesDe = (cat) => TYPES.filter((t) => t.cat === cat);
/** Une zone extérieure n'est pas comptée comme une pièce. */
export const estExterieur = (typeId) => (TYPES.find((t) => t.id === typeId) || {}).cat === "ext";
