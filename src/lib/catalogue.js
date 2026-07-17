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
  { id: "balcon", label: "Balcon", Icon: Sun, modules: ["exterieur"] },
  { id: "terrasse", label: "Terrasse", Icon: Sun, modules: ["exterieur"] },
  { id: "garage", label: "Garage", Icon: Car },
  { id: "cave", label: "Cave", Icon: Warehouse },
  { id: "soussol", label: "Sous-sol", Icon: Warehouse },
  { id: "combles", label: "Combles", Icon: Layers, modules: ["toiture"] },
  { id: "grenier", label: "Grenier", Icon: Layers },
  { id: "escalier", label: "Escalier", Icon: ArrowUpDown },
  { id: "facade", label: "Façade", Icon: Building2, modules: ["facade"] },
  { id: "toiture", label: "Toiture", Icon: Home, modules: ["toiture"] },
  { id: "jardin", label: "Jardin", Icon: Trees, modules: ["exterieur"] },
  { id: "technique", label: "Local technique", Icon: Wrench },
  { id: "communes", label: "Parties communes", Icon: Building2 },
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
  "Carrelage", "Parquet stratifié", "Parquet massif", "PVC", "Vinyle",
  "Moquette", "Résine", "Béton ciré", "Autre",
];
export const MARGES = [0, 5, 7, 10, 12, 15];

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
    { id: "de_faience", label: "Dépose faïence", unit: "m²", auto: "faienceRetenu" },
    { id: "de_parquet", label: "Dépose parquet / moquette", unit: "m²", auto: "solNet" },
    { id: "de_plinthes", label: "Dépose plinthes", unit: "ml", auto: "plinthesNet" },
    { id: "de_portes", label: "Dépose portes + huisseries", unit: "u", auto: "nbPortes" },
    { id: "de_fenetres", label: "Dépose fenêtres", unit: "u", auto: "nbFenetres" },
    { id: "de_cloison", label: "Dépose cloison", unit: "m²" },
    { id: "de_doublage", label: "Dépose doublage / isolant", unit: "m²", auto: "doublageNet" },
    { id: "de_fauxplaf", label: "Dépose faux plafond", unit: "m²", auto: "plafondNet" },
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
    { id: "mi_plinthes", label: "Plinthes", unit: "ml", auto: "plinthesRetenu" },
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
    { id: "so_revetement", label: "Revêtement de sol", unit: "m²", auto: "solRetenu" },
    { id: "so_soucouche", label: "Sous-couche", unit: "m²", auto: "solNet" },
    { id: "so_seuil", label: "Barre de seuil", unit: "u" },
    { id: "so_nezmarche", label: "Nez de marche", unit: "u" },
  ]},
  { id: "murs", nom: "Revêtements muraux", items: [
    { id: "mu_enduit", label: "Enduit / ratissage", unit: "m²", auto: "enduitNet" },
    { id: "mu_toile", label: "Toile de verre", unit: "m²", auto: "mursNet" },
    { id: "mu_papier", label: "Papier peint", unit: "m²", auto: "papierNet" },
    { id: "mu_faience", label: "Faïence", unit: "m²", auto: "faienceRetenu" },
    { id: "mu_parement", label: "Parement / pierre", unit: "m²" },
  ]},
  { id: "peint", nom: "Peinture", items: [
    { id: "pe_prepa", label: "Préparation des supports", unit: "m²", auto: "mursNet" },
    { id: "pe_murs", label: "Peinture murs", unit: "m²", auto: "peintureMurs" },
    { id: "pe_plafond", label: "Peinture plafond", unit: "m²", auto: "plafondNet" },
    { id: "pe_portes", label: "Peinture portes", unit: "u", auto: "nbPortes" },
    { id: "pe_plinthes", label: "Peinture plinthes", unit: "ml", auto: "plinthesRetenu" },
    { id: "pe_boiseries", label: "Peinture boiseries", unit: "m²" },
    { id: "pe_metal", label: "Peinture métaux", unit: "m²" },
  ]},
  { id: "elec", nom: "Électricité / courant faible", items: [
    { id: "el_tableau", label: "Tableau électrique", unit: "u" },
    { id: "el_point", label: "Point électrique", unit: "u", auto: "nbPointsElec" },
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
    { id: "cu_plan", label: "Plan de travail", unit: "ml" },
    { id: "cu_credence", label: "Crédence", unit: "ml" },
    { id: "cu_electro", label: "Électroménager", unit: "u" },
  ]},
  { id: "sdb", nom: "Salle de bain", items: [
    { id: "sd_equip", label: "Équipement sanitaire", unit: "u" },
    { id: "sd_etancheite", label: "Étanchéité SPEC / SEL", unit: "m²" },
    { id: "sd_faience", label: "Faïence", unit: "m²", auto: "faienceRetenu" },
  ]},
  { id: "facade", nom: "Façade", items: [
    { id: "fa_enduit", label: "Enduit / crépi", unit: "m²" },
    { id: "fa_peinture", label: "Peinture façade", unit: "m²" },
    { id: "fa_nettoyage", label: "Nettoyage / traitement", unit: "m²" },
    { id: "fa_fissure", label: "Reprise de fissures", unit: "ml" },
    { id: "fa_echafaudage", label: "Échafaudage", unit: "m²" },
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
