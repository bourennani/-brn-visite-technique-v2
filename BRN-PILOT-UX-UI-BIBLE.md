# BRN PILOT — UX/UI BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **toute
> l'expérience utilisateur et de l'identité visuelle** de *BRN Pilot* : principes,
> Design System, navigation, écrans, composants, parcours, responsive,
> accessibilité, interaction IA et critères d'acceptation.
>
> **Ce document ne contient aucun code, aucune interface fonctionnelle.** Les
> valeurs de couleur, d'espacement et de typographie sont des **jetons de design**
> (données de conception), pas du code. Nous restons en **phase de conception**.
>
> **Objet.** Concevoir une **véritable expérience de pilotage pour le dirigeant** —
> moderne, premium, claire, rapide, fluide, très simple, responsive, cohérente,
> orientée **action et décision**.
>
> **Statut :** v1.0 — à relire et valider **avant** l'API Bible.
> **Cohérence :** aligné sur Master Blueprint, Business Rules, Data, Security,
> Product et Automation Bibles.

---

## Table des matières

**Partie A — Fondations UX**
- A1. Objectif global (la règle des 10 secondes)
- A2. Principes UX fondamentaux
- A3. Priorisation visuelle (règle transverse)

**Partie B — Design System**
- B1. Identité visuelle & inspirations
- B2. Palette de couleurs (marque, secondaires, états, alertes, financières, sémantiques IA)
- B3. Mode clair & mode sombre
- B4. Contrastes & couleur accessible
- B5. Typographie & hiérarchie
- B6. Grilles & espacements
- B7. Rayons, ombres (élévation)
- B8. Icônes
- B9. Mouvement (animations, transitions, états)
- B10. Récapitulatif des jetons

**Partie C — Structure de l'application**
- C1. Navigation principale
- C2. Recherche globale
- C3. Centre d'actions

**Partie D — Le Cockpit du dirigeant** (6 zones)

**Partie E — Modules & écrans**
- E1. Dirigeant · E2. Chantiers · E3. Finance · E4. Véhicules · E5. Contraventions ·
  E6. Tâches & priorités · E7. Calendrier · E8. Documents & coffre-fort · E9. IA

**Partie F — Composants standards**
- F1. Formulaires · F2. Tableaux & listes · F3. Graphiques & indicateurs ·
  F4. Alertes & notifications · F5. États vides, chargements & erreurs

**Partie G — Adaptation & confort**
- G1. Responsive · G2. Accessibilité · G3. Personnalisation

**Partie H — Parcours utilisateurs**

**Partie I — Interaction IA (règles UX)**

**Partie J — Analyse du prototype existant**

**Partie K — Critères d'acceptation UX**

**Partie L — Traçabilité vers les autres documents fondateurs**

> **Conventions.** Principes `UX-Pxx`, jetons `TOK-…`, composants `CMP-…`, écrans
> `SCR-…`, parcours `JRN-…`, critères d'acceptation `AC-…`. Identifiants stables,
> jamais recyclés.

---

# Partie A — Fondations UX

## A1. Objectif global — la règle des 10 secondes

> **AC-CORE-001 — La règle des 10 secondes.** En **moins de 10 secondes** après
> l'ouverture, le dirigeant doit comprendre : l'**état général de l'entreprise**,
> les **urgences**, les **risques**, les **décisions à prendre**, les **tâches
> prioritaires**, les **rendez-vous du jour**, les **éléments financiers
> importants**, les **alertes véhicules**, les **échéances proches**.

Conséquences de conception :

- L'écran d'entrée est le **Cockpit** (Partie D), pas une liste ni un menu.
- L'information est **hiérarchisée par priorité**, pas par module.
- Ce qui exige une **action** est visuellement dominant.
- La densité est maîtrisée : **un regard = les bonnes conclusions**.

L'application doit être : **moderne, premium, claire, rapide, fluide, très simple,
adaptée au dirigeant, responsive (ordinateur/tablette/mobile), cohérente sur tous
les modules, économe en saisie, orientée action et décision.**

## A2. Principes UX fondamentaux

| # | Principe | Traduction concrète |
|---|---|---|
| UX-P01 | Une information importante n'est jamais cachée. | Ce qui compte est visible au premier écran ; pas de « clic pour découvrir un risque ». |
| UX-P02 | Une donnée n'est saisie qu'une seule fois. | Pré-remplissage, reprise, calcul automatique ; jamais de ressaisie (Product P01). |
| UX-P03 | Les automatismes réduisent les clics. | Valeurs par défaut, actions groupées, brouillons prêts (Automation Bible). |
| UX-P04 | Les urgences remontent automatiquement. | Le moteur de priorité ordonne l'affichage (Business Rules PRI). |
| UX-P05 | Chaque écran permet d'agir, pas seulement de consulter. | Boutons d'action contextuels sur chaque objet. |
| UX-P06 | L'IA aide sans envahir. | L'IA est présente mais discrète ; jamais elle ne masque l'officiel. |
| UX-P07 | Les chiffres officiels sont distingués des estimations IA. | Deux traitements visuels stricts et constants (B2, Partie I). |
| UX-P08 | Les actions sensibles exigent toujours une validation. | Confirmation explicite ; état « en attente de validation » visible (Automation Bible F). |
| UX-P09 | Les erreurs sont compréhensibles et récupérables. | Message clair + cause + action ; jamais d'écran blanc (F5). |
| UX-P10 | Les formulaires sont courts, progressifs, intelligents. | Saisie par étapes, champs conditionnels, autocomplétion (F1). |
| UX-P11 | Les tableaux restent lisibles avec beaucoup de données. | Filtres, tri, densité, vues alternatives mobiles (F2). |
| UX-P12 | Les fonctions avancées ne compliquent pas les usages simples. | Le simple est immédiat ; l'avancé se déplie (progressive disclosure). |
| UX-P13 | Le mobile permet les actions essentielles terrain. | Consulter urgences, agenda, créer tâche/dépense, photo, valider (G1). |

## A3. Priorisation visuelle (règle transverse)

> **UX-PRIO-001.** L'ordre et l'intensité visuelle d'un élément suivent **la
> priorité officielle** calculée par le moteur (Business Rules PRI-001), jamais un
> choix arbitraire de couleur.

- **Critique** : traitement le plus fort (couleur critique, position en tête, badge).
- **Urgent / à risque** : traitement d'alerte, mis en avant.
- **Normal** : neutre.
- **Terminé / sain** : discret, success léger.
- Chaque élément prioritaire porte une **explication accessible** (« pourquoi »),
  conformément à Product P08.

---

# Partie B — Design System

## B1. Identité visuelle & inspirations

*BRN Pilot* s'inspire des meilleurs SaaS modernes **sans les copier** : la sobriété
et la vitesse de **Linear** et **Vercel**, la lisibilité financière de **Stripe**,
**Qonto** et **Pennylane**, la structure calme de **Notion**, l'efficacité de
**Raycast**, la finesse d'**Apple**. Le résultat reste **adapté à BRN Group et au
bâtiment** : robuste, professionnel, direct, sans esbroufe.

**Signature visuelle BRN Pilot :** fond calme, contenu net, **une couleur de marque
verte** parcimonieuse (l'ADN BRN), la couleur réservée au **sens** (états, risques),
des chiffres **monospace** parfaitement alignés, beaucoup d'espace, peu d'ornement.
La couleur n'est jamais décorative : elle **signifie**.

## B2. Palette de couleurs

> Les valeurs ci-dessous sont des **jetons** (référence). Elles seront affinées à
> l'implémentation en respectant les contrastes (B4). La couleur porte toujours un
> **sens**, jamais une décoration.

### B2.1 Marque BRN (verts — hérités de l'existant)

| Jeton | Valeur | Usage |
|---|---|---|
| `TOK-brand-dark` | #3C6410 | Actions principales, accents forts, en-têtes. |
| `TOK-brand-mid` | #5E9918 | Éléments actifs, progression positive. |
| `TOK-brand-light` | #8BC53F | Accents légers, survol. |
| `TOK-brand-pale` | #EEF5E4 | Fonds d'accent doux, sélection. |
| `TOK-ink` | #14180F | Texte principal (mode clair). |

> La marque verte est **parcimonieuse** : elle marque l'action principale et
> l'identité, pas les états. Un écran n'est pas « vert partout ».

### B2.2 Neutres (structure)

Échelle de gris du fond au texte : `TOK-bg` (fond application), `TOK-surface`
(cartes/panneaux), `TOK-surface-2` (fond secondaire), `TOK-border` (filets),
`TOK-muted` (texte secondaire), `TOK-muted-2` (texte tertiaire), `TOK-ink`
(texte principal). Le fond est **calme et clair** ; le contenu ressort par le
contraste, pas par la couleur.

### B2.3 Couleurs d'état sémantiques

Chaque état a un **couple** (teinte forte pour texte/icône, teinte pâle pour fond) et
un **libellé**, pour ne jamais dépendre de la seule couleur (UX-P07, accessibilité).

| État | Jeton texte | Jeton fond | Sens |
|---|---|---|---|
| **Succès** | `TOK-success` (#15803D) | `TOK-success-bg` (#DCFCE7) | Opération réussie, sain, dans les temps. |
| **Information** | `TOK-info` (#2563EB) | `TOK-info-bg` (#DBEAFE) | Neutre informatif. |
| **Attention** | `TOK-warning` (#B45309) | `TOK-warning-bg` (#FEF3C7) | À surveiller, échéance proche. |
| **Alerte (urgent)** | `TOK-alert` (#EA580C) | `TOK-alert-bg` (#FFEDD5) | Action à faire bientôt. |
| **Critique** | `TOK-critical` (#B91C1C) | `TOK-critical-bg` (#FEE2E2) | Risque immédiat, dépassement, non-conformité. |

### B2.4 Couleurs financières

| Notion | Traitement | Règle |
|---|---|---|
| **Réalisé** | Neutre plein (ink) + éventuel succès. | Chiffre officiel, plein, net. |
| **Prévu** | Neutre en contour / trame. | Distingué du réalisé (contour, hachure). |
| **Estimé (IA)** | Teinte **IA** (voir B2.5) + libellé « estimation ». | Jamais confondu avec l'officiel (UX-P07). |
| **En attente** | Attention (ambre). | Encaissement/paiement attendu. |
| **En retard** | Critique (rouge). | Échéance dépassée. |
| **Montant positif / négatif** | Vert / rouge **+ signe explicite** (+/−) et libellé. | Jamais la couleur seule (accessibilité). |

### B2.5 Couleurs sémantiques IA & cycle d'action

Distinction **stricte et constante** entre officiel et IA, et entre les étapes
d'une action.

| Sémantique | Jeton | Traitement | Sens |
|---|---|---|---|
| **Donnée officielle** | `TOK-official` (ink/neutre) + pictogramme « officiel » | Net, sobre, **jamais teinté IA**. | Chiffre issu du moteur métier (fait foi). |
| **Donnée estimée (IA)** | `TOK-ai` (#6D28D9) + `TOK-ai-bg` (#EDE9FE) + libellé « Estimation IA » | Teinte violette dédiée à l'IA. | Approximation de l'IA, incertaine. |
| **Action proposée par l'IA** | `TOK-ai` + style « proposé » (contour violet) | Reconnaissable comme suggestion. | À valider par un humain. |
| **Action validée** | `TOK-success` | Confirmée. | Acte accompli/approuvé. |
| **Action en attente** | `TOK-warning` + style « en attente » | En file de validation. | Attend une décision. |

> **Règle absolue UX-AI-COLOR-001.** Le **violet IA** ne touche **jamais** un
> chiffre officiel. Un chiffre officiel est neutre. Une estimation IA est violette
> et **libellée**. Cette règle est non négociable (Product P14, Business Rules
> IA-002).

## B3. Mode clair & mode sombre

- **Deux modes complets**, cohérents, aux **mêmes significations** de couleur.
- **Mode clair** par défaut (professionnel, lisible en extérieur/chantier).
- **Mode sombre** confortable en faible lumière ; les états gardent leur sens
  (les fonds pâles deviennent des fonds sombres teintés équivalents).
- Le choix est **personnalisable** (G3) et respecte la préférence système.
- Aucune information ne doit dépendre du mode : **parité stricte** clair/sombre.

## B4. Contrastes & couleur accessible

- **Contraste minimal** conforme aux standards (texte courant ratio ≥ 4,5:1 ;
  éléments larges ≥ 3:1).
- **Jamais de dépendance à la seule couleur** : un état est toujours accompagné
  d'un **libellé, d'une icône ou d'un signe** (UX-P07, G2).
- Les couleurs d'alerte restent distinguables en **vision des couleurs atypique**
  (test daltonisme) : on double toujours par la forme/le texte.

## B5. Typographie & hiérarchie

- **Une famille d'interface** lisible et rapide (pile système, rendu natif, zéro
  temps de chargement de police), pour la sobriété et la performance.
- **Une famille monospace à chiffres tabulaires** pour **tous les montants,
  quantités et indicateurs** : alignement parfait des colonnes financières
  (inspiration Qonto/Stripe).
- **Échelle typographique** (référence) :

| Rôle | Taille (réf.) | Usage |
|---|---|---|
| Display | 28 | Grand chiffre clé du cockpit. |
| Titre 1 | 22 | Titre de page. |
| Titre 2 | 18 | Titre de section/carte. |
| Titre 3 | 15 | Sous-titre. |
| Corps | 14 | Texte courant (lisible, confirmé par l'app existante). |
| Petit | 13 | Tableaux, valeurs techniques. |
| Légende | 12 | Libellés secondaires. |
| Micro | 11 | Mentions, horodatages. |

- **Hiérarchie** : un seul élément dominant par écran ; le reste en appui. Le poids
  (graisse), la taille et l'espace créent la hiérarchie **avant** la couleur.

## B6. Grilles & espacements

- **Échelle d'espacement** (base 4) : 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
  Tout espacement est un multiple de l'échelle (rythme visuel régulier).
- **Grille** : conteneur large borné (lisibilité), 12 colonnes sur ordinateur,
  reflow en 8/4/1 colonne selon la taille (G1).
- **Respiration** : l'espace est un matériau. On préfère **aérer** plutôt que
  remplir (sobriété, Product P09).

## B7. Rayons, ombres (élévation)

- **Rayons** : `TOK-radius-sm` (petits éléments), `TOK-radius-md` (boutons/champs),
  `TOK-radius-lg` (cartes/panneaux), `TOK-radius-full` (pastilles/pills).
- **Élévation** en 3 niveaux : plat (contenu), léger (cartes), prononcé (menus,
  fenêtres modales, superpositions). Ombres **douces**, jamais dures ; en mode
  sombre, l'élévation se marque aussi par la teinte de surface.

## B8. Icônes

- **Un seul jeu d'icônes** cohérent (trait fin, style linéaire), aligné sur la
  sobriété. Taille et poids constants.
- **Icônes porteuses de sens** (état, action) toujours accompagnées d'un libellé au
  besoin (accessibilité).
- **Iconographie métier** claire : chantier, finance, véhicule, contravention,
  tâche, document, calendrier, IA — reconnaissable en un coup d'œil.

## B9. Mouvement (animations, transitions, états)

- **Le mouvement sert la compréhension**, jamais la décoration : transitions
  courtes, naturelles, discrètes (apparition d'un panneau, mise à jour d'un chiffre).
- **États d'un élément interactif** définis pour **tous** les composants :
  **repos**, **survol** (hover), **actif/pressé**, **sélectionné**, **désactivé**,
  **focus clavier** (anneau de focus **toujours visible**, G2), **chargement**.
- **Réduction des animations** respectée si l'utilisateur/le système le demande
  (accessibilité, G2).
- **Rapidité perçue** : retour visuel immédiat à chaque interaction (Product P10).

## B10. Récapitulatif des jetons

Les jetons (`TOK-…`) forment la **source unique** du style : couleurs, espacements,
typographie, rayons, ombres, durées d'animation. **Aucune valeur de style n'est
écrite en dur** dans un écran : tout passe par un jeton (garantit la cohérence et
les deux modes). Les jetons sont **versionnés** ; les faire évoluer met à jour tout
le produit d'un coup.

---

# Partie C — Structure de l'application

## C1. Navigation principale

**Modules (ordre logique, regroupé) :**

| Groupe | Entrées |
|---|---|
| **Pilotage** | Accueil (Cockpit), Dirigeant, Tâches, Alertes, Objectifs, Décisions, Calendrier. |
| **Activité** | Chantiers, Clients, Fournisseurs, Main-d'œuvre. |
| **Finance** | Finance (trésorerie/marge), Factures, Dépenses. |
| **Parc** | Véhicules, Contraventions. |
| **Ressources** | Documents. |
| **Assistant** | IA. |
| **Système** | Paramètres. |

Règles de navigation :

- **CMP-NAV-01 — Barre latérale (ordinateur).** Colonne gauche avec les groupes
  ci-dessus ; sections **repliables** ; l'élément actif est marqué. **Ne devient
  jamais trop longue** : regroupements logiques, sous-menus maîtrisés, éléments
  rares regroupés sous « Plus ».
- **CMP-NAV-02 — Tablette.** Barre latérale **compacte** (icônes + libellés au
  survol/expansion) ou repliée par défaut, dépliable.
- **CMP-NAV-03 — Mobile.** Navigation **simplifiée** : une barre inférieure avec 4-5
  destinations essentielles (Cockpit, Tâches, Calendrier, Chantiers, + « Plus »), le
  reste dans un menu.
- **CMP-NAV-04 — Éléments transverses.** Recherche globale (C2), Centre d'actions
  (C3), sélecteur de mode clair/sombre, profil, notifications — accessibles partout.
- **CMP-NAV-05 — Aides.** **Favoris**, **accès rapide** aux actions fréquentes,
  **historique récent**, **fil d'Ariane** quand la profondeur le justifie,
  **raccourcis clavier** (voir C2).

## C2. Recherche globale

- **CMP-SEARCH-01 — Palette de commande.** Recherche unique (raccourci clavier
  dédié, inspiration Linear/Raycast) accessible partout.
- **Cible** : client, chantier, facture, dépense, véhicule, contravention, document,
  tâche, rendez-vous, salarié, fournisseur.
- **Comportement** : **résultats instantanés**, **regroupés par catégorie**,
  **raccourcis** (aller à…), **historique récent**, **actions directes** (créer une
  tâche, ajouter une dépense sans quitter la recherche).
- **CMP-SEARCH-02 — Langage naturel (IA).** Une bascule permet une **recherche en
  langage naturel** via l'assistant (« factures impayées de plus de 5 000 € »),
  qui répond **avec sources** et **distinction officiel/estimation** (Partie I).
  Respecte strictement les **droits** de l'utilisateur.

## C3. Centre d'actions

> **CMP-ACT-01 — Un point unique pour « ce que je dois traiter ».** Le Centre
> d'actions rassemble tout ce qui attend une intervention : **validations,
> signatures, relances, tâches, alertes, décisions, éléments proposés par l'IA,
> documents à compléter, anomalies à vérifier.**

Chaque action affiche : **niveau de priorité**, **échéance**, **contexte**,
**impact**, **responsable**, **action recommandée**, **boutons d'action**,
**historique**. Les éléments sont **ordonnés par priorité** (UX-PRIO-001) et
**regroupés** pour éviter la fatigue (F4). Le Centre d'actions est le prolongement
« liste » du Cockpit : ce que la Zone 2 résume, le Centre d'actions le déroule.

---

# Partie D — Le Cockpit du dirigeant

> Écran d'entrée. Conçu comme un **véritable cockpit** en **zones hiérarchisées**.
> Chaque zone lit des **projections** (jamais les modules directement) et affiche des
> chiffres **officiels** (Business Rules INV-1). L'ordre des éléments suit la
> **priorité** (UX-PRIO-001). Objectif : la règle des 10 secondes (AC-CORE-001).

**Disposition (référence).** Sur ordinateur : une grille en zones ; en haut, la
santé (Zone 1) et le brief IA condensé (Zone 6) ; au centre, les priorités (Zone 2)
et l'agenda (Zone 3) ; plus bas, chantiers (Zone 4) et parc (Zone 5). Sur mobile :
zones empilées, **priorités et urgences en premier**.

## Zone 1 — Santé générale de l'entreprise

Indicateurs (officiels) : **trésorerie actuelle**, **trésorerie prévisionnelle**,
**CA facturé**, **CA encaissé**, **marge**, **résultat estimé** (clairement libellé
« estimé »), **restant à encaisser**, **chantiers en cours**, **chantiers en
retard**, **score de santé de l'entreprise**.

- Chaque indicateur : grand chiffre monospace + micro-tendance + état (couleur de
  sens). **Cliquable** pour aller à la source (drill-down).
- Le **score de santé** est une synthèse expliquée (« pourquoi ce score »).
- Distinction stricte **officiel vs estimé** (le résultat estimé porte le libellé et
  le traitement neutre, jamais IA-violet s'il vient du moteur ; s'il est une
  projection IA, il est libellé « estimation IA »).

## Zone 2 — Priorités du dirigeant

Liste ordonnée : **tâches critiques, tâches urgentes, décisions à prendre,
validations en attente, signatures, appels à passer, relances, dossiers bloquants,
échéances fiscales, échéances administratives.**

- Classement **automatique** selon : urgence, importance, délai restant, impact
  financier, impact opérationnel, risque juridique, risque client, risque chantier
  (Business Rules PRI, enrichi de facteurs de risque).
- Chaque élément : **priorité**, **échéance**, **raison**, **impact**, **action
  recommandée**, **boutons** (traiter, déléguer, différer). Bouton « voir
  l'explication du score ».

## Zone 3 — Agenda

Affiche : **rendez-vous du jour, réunions, déplacements, rappels, événements
synchronisés Apple Calendar** (futur), **conflits de calendrier**, **temps de
déplacement** si disponible. Les conflits sont **signalés** (F4). Lien direct vers le
module Calendrier (E7).

## Zone 4 — Chantiers

Affiche : **chantiers à risque, dérives de marge, retards, dépassements de budget,
réserves, avancement, problèmes nécessitant une décision.** Chaque chantier à risque
est une carte avec **santé** (vert/ambre/rouge), l'écart marge **prévue → réalisée**,
et l'action attendue. Tri par **gravité**.

## Zone 5 — Parc automobile

Affiche : **contrôles techniques, assurances, entretiens, réparations,
contraventions, véhicules immobilisés, coût du parc, alertes prioritaires.** Les
échéances proches et non-conformités remontent en tête. Données contraventions
**restreintes selon les droits**.

## Zone 6 — IA (brief quotidien)

Brief court et utile, par exemple :

> **Bonjour Hocine.** Voici les cinq sujets les plus importants aujourd'hui.

Pour **chaque sujet** : **priorité**, **raison**, **impact**, **action
recommandée**, **source des données**, **niveau de confiance**.

- Le brief **met en forme et explique** des éléments **déjà priorisés par le
  moteur** ; il ne recalcule rien (Business Rules IA-020).
- L'IA **ne masque jamais** les informations officielles : le brief renvoie toujours
  vers le chiffre officiel de la Zone concernée.
- Ton court, personnel, hiérarchisé. **Cinq sujets maximum** (anti-fatigue).

---

# Partie E — Modules & écrans

> Pour chaque module : sa **fonction**, ses **vues**, ce qui doit **ressortir**, les
> **actions** disponibles. Tous les écrans respectent la priorisation visuelle
> (A3), la distinction officiel/IA (B2.5) et « agir, pas seulement consulter »
> (UX-P05).

## E1. Module Dirigeant (`SCR-DIR`)

Espace **personnel réservé** au dirigeant (accès strict, Security). Contient :
**vue Aujourd'hui**, **Cette semaine**, **Ce mois**, **tâches**, **objectifs**,
**décisions**, **notes**, **validations**, **rendez-vous**, **relances**,
**signatures**, **rappels**, **synthèse IA**, **historique des actions**.

- **Deux niveaux de lecture** : une **vue simple le matin** (l'essentiel, orientée
  action) et une **vue détaillée** pour l'analyse (tendances, historique).
- « Aujourd'hui » = le cockpit personnel filtré sur le jour ; « Cette semaine » /
  « Ce mois » = planification et objectifs.

## E2. Module Chantiers (`SCR-CHA`)

**Liste** — cartes **ou** tableau (bascule), colonnes : état, avancement, vendu,
coût réel, budget, **marge prévue / réelle / projetée**, retard, **santé**,
responsable, alertes. **Filtres, tri, recherche.** La **santé** et la **marge**
dominent visuellement.

**Fiche chantier** — onglets cohérents : **Vue d'ensemble, Finance, Main-d'œuvre,
Dépenses, Planning, Documents, Photos, Alertes, Historique, Notes, Décisions.** La
page fait **immédiatement** ressortir : **la rentabilité**, **les écarts**, **les
risques**, **les prochaines actions** (bandeau de tête « santé + action attendue »).

## E3. Module Finance (`SCR-FIN`)

Écrans : **trésorerie, prévisions, encaissements, décaissements, charges
récurrentes, factures clients, factures fournisseurs, marges, résultats,
ventilations (par chantier / client / catégorie), rapprochement bancaire (futur).**

- **Graphiques lisibles et utiles, non décoratifs** (F3) ; chaque graphe répond à
  une question métier.
- **Distinction visuelle stricte** : réalisé, prévu, estimé, en attente, en retard
  (B2.4). Les montants officiels sont neutres et alignés (monospace) ; les
  projections IA sont libellées.
- Chaque écran permet d'**agir** (émettre — avec validation, relancer, exporter).

## E4. Module Véhicules (`SCR-VEH`)

**Liste du parc** + **fiche véhicule** : conducteur, kilométrage, coûts, documents,
assurance, contrôle technique, entretien, réparations, pneus, contraventions,
historique, alertes.

La **fiche véhicule** fait apparaître **immédiatement** : **statut**, **prochaine
échéance**, **coût mensuel**, **coût annuel**, **anomalies**, **documents
manquants** (bandeau de tête). Les échéances proches sont visuellement fortes.

## E5. Module Contraventions (`SCR-CTR`)

Vues : **liste, détail, échéances, contestations, paiements, conducteur, véhicule,
statistiques, documents.**

- **Alertes visuelles distinctes** : délai de paiement proche, **majoration
  imminente** (critique), délai de contestation proche, dossier incomplet, paiement
  en attente.
- **Accès strictement restreint** selon les droits (données N4) ; l'interface **ne
  révèle rien** hors périmètre (Security C8, non-divulgation).

## E6. Module Tâches & priorités (`SCR-TASK`)

Vues : **boîte de réception, aujourd'hui, cette semaine, urgent, important, en
retard, terminé, délégué, proposé par l'IA.**

Chaque tâche affiche : **priorité, échéance, origine, impact, contexte, responsable,
statut, dépendances, pièces jointes, historique.** La **priorité officielle** est
visible, avec un lien « **afficher l'explication du score** » (transparence,
Business Rules PRI-014). Les tâches **proposées par l'IA** portent le traitement IA
(violet + « proposé ») et exigent une action humaine.

## E7. Module Calendrier (`SCR-CAL`)

Vues : **jour, semaine, mois, liste d'agenda.** Éléments : rendez-vous, réunions,
déplacements, rappels, **tâches avec échéance**, **synchronisation Apple Calendar
future**. **Gestion des doublons et des conflits** (signalés visuellement,
proposition d'arbitrage). Les rendez-vous synchronisés portent une marque de
source.

## E8. Module Documents & coffre-fort (`SCR-DOC`)

Espace documentaire moderne. **Classement** par : entreprise, client, chantier,
fournisseur, véhicule, salarié, catégorie, échéance, **niveau de confidentialité**.

**États de document clairement affichés** : **valide, expirant bientôt, expiré, à
signer, incomplet, non classé** (couleurs de sens + libellés). Fonctions :
**prévisualisation, téléchargement, versionnage, historique, tags, recherche,
suggestions IA (classement), renouvellement, expiration.** Le niveau de
confidentialité conditionne l'accès et l'affichage (Security).

## E9. Module IA (`SCR-IA`)

Interface de l'assistant : **zone de conversation, suggestions de questions, sources
utilisées, distinction fait/calcul/estimation/recommandation, niveau de confiance,
actions proposées, validation humaine, historique, arrêt de génération, signalement
d'erreur.**

- **Un assistant unique** qui **orchestre** des compétences spécialisées (Finance,
  Chantier, Direction, Véhicules, Documents, Planning, Administratif) **sans obliger
  l'utilisateur à comprendre l'architecture d'agents** (Automation Bible E) : il
  parle à un seul assistant.
- Chaque réponse : **sources citées**, **étiquetage** fait/calcul/estimation/
  recommandation, **niveau de confiance** ; les **chiffres officiels** sont renvoyés
  du moteur, jamais inventés (Partie I). Toute **action proposée** passe par une
  **validation** explicite.

---

# Partie F — Composants standards

## F1. Formulaires (`CMP-FORM`)

Norme unique pour **tous** les formulaires :

- **Saisie progressive** (par étapes) ; **jamais** un long formulaire sur une seule
  page (UX-P10).
- **Champs conditionnels** (n'apparaissent que si pertinents), **valeurs par
  défaut**, **suggestions**, **autocomplétion**.
- **Validation en temps réel** (message clair sous le champ), **brouillon
  automatique** (rien n'est perdu), **détection de doublons**.
- **Confirmation avant action sensible** (UX-P08) ; **pièces jointes**, **import
  photo/PDF** (terrain) ; **messages d'erreur compréhensibles** orientés solution.
- **Une seule saisie** (UX-P02) : ce qui est connu est pré-rempli.

## F2. Tableaux & listes (`CMP-TABLE`)

Standards : **colonnes** (configurables), **filtres**, **tris**, **regroupements**,
**pagination** (ou défilement virtuel), **recherche**, **sélection multiple**,
**export** (action journalisée), **personnalisation**, **vues enregistrées**,
**densité d'affichage** (compacte/confortable).

- **Lisibilité à volume élevé** (UX-P11) : colonnes essentielles par défaut,
  chiffres monospace alignés, l'important à gauche.
- **Comportement mobile** : quand un tableau devient illisible, **vue alternative en
  cartes** (une carte = une ligne, champs clés) — jamais un tableau horizontal
  illisible.

## F3. Graphiques & indicateurs (`CMP-CHART`)

- **Chaque graphique répond à une question métier précise** ; aucun graphique
  décoratif.
- Types autorisés selon le besoin : **comparaison de périodes, tendance, prévision,
  répartition, écart, progression, seuil, anomalie.**
- **Lisibilité d'abord** : peu de séries, légende claire, unités explicites, seuils
  marqués. Le **prévu/estimé** est visuellement distinct du **réalisé** (B2.4).
- Un graphique porte toujours son **titre-question** et sa **conclusion** en clair.

## F4. Alertes & notifications (`CMP-ALERT`)

**Niveaux** : **information, attention, urgent, critique** (couleurs de sens +
libellé + icône).

- **Centre de notifications**, **alertes dans le cockpit**, **badges**, **emails
  (futur)**, **push (futur)**, **résumé quotidien**.
- **Regroupement des alertes similaires**, **limitation de la fatigue d'alerte**
  (peu, mais justes — Business Rules PRI-015), **mise en veille** (snooze),
  **résolution** (tracée), **historique**.
- Une alerte porte toujours une **raison** et une **action** ; sa disparition est
  **tracée**, jamais silencieuse.

## F5. États vides, chargements & erreurs (`CMP-STATE`)

Comportements définis pour **chaque** situation :

| Situation | Comportement |
|---|---|
| **Aucune donnée** | État vide **utile** : explique quoi faire + action pour commencer (jamais une page blanche). |
| **Chargement d'une page** | Squelette de contenu (structure grisée), pas un simple sablier ; perception de rapidité. |
| **Synchronisation en cours** | Indicateur discret « synchronisation… » ; l'app reste utilisable. |
| **Erreur** | Message **clair** (cause + action + identifiant de corrélation copiable) ; **récupérable** ; jamais d'écran blanc (UX-P09). |
| **Donnée indisponible** | Le champ indique « indisponible », l'app continue ; l'IA ne comble jamais par une invention. |
| **IA indisponible** | Le produit fonctionne **exactement** comme sans IA ; le brief bascule en version déterministe (Automation Bible AUTO-P11). |
| **Droits insuffisants** | Message de **non-divulgation** (« vous n'avez pas accès »), sans révéler l'existence de la donnée (Security C8). |
| **Action échouée** | Explication + réessai possible ; aucune écriture partielle laissée. |
| **Sauvegarde restaurée** | Bandeau informatif « données restaurées au [date] » ; contexte clair. |

---

# Partie G — Adaptation & confort

## G1. Responsive

Comportements par taille :

| Support | Comportement |
|---|---|
| **Grand écran** | Cockpit multi-zones, tableaux riches, panneaux latéraux de détail. |
| **Ordinateur portable** | Même structure, densité légèrement réduite, zones reflowées. |
| **Tablette** | Barre latérale compacte ; zones en 2 colonnes ; tactile confortable. |
| **Mobile** | Zones **empilées** (urgences d'abord) ; navigation basse ; tableaux → cartes. |

**Priorité mobile (usage terrain / déplacement)** : **consulter les urgences, voir
l'agenda, créer une tâche, enregistrer une dépense, prendre une photo, ajouter un
justificatif, consulter un chantier, valider une action, recevoir les alertes.**
Ces actions sont **immédiates** sur mobile (UX-P13) ; les fonctions lourdes
(analyse fine) restent surtout au bureau, sans être bloquées.

## G2. Accessibilité

- **Contrastes suffisants** (B4) ; **navigation clavier** complète ; **focus
  visible** partout (B9).
- **Lecteurs d'écran** : structure sémantique, libellés, **textes alternatifs** sur
  les visuels/icônes porteuses de sens.
- **Tailles de clic adaptées** (cibles tactiles suffisantes) ; **lisibilité
  mobile** ; **réduction des animations** si demandée.
- **Aucune dépendance à la seule couleur** (toujours libellé/icône/forme).
- Cible : viser un **référentiel d'accessibilité reconnu** (à confirmer), en
  cohérence avec l'ambition « premium ».

## G3. Personnalisation

Le dirigeant peut personnaliser : **cartes du cockpit, ordre des sections,
indicateurs visibles, vues enregistrées, filtres, raccourcis, notifications, mode
clair/sombre, densité d'affichage.**

> **UX-PERSO-001.** La personnalisation **ne casse jamais la cohérence** : on
> réorganise et on choisit ce qu'on voit, mais les **composants, couleurs de sens et
> règles** restent identiques partout. Un réglage par défaut sûr existe toujours
> (« réinitialiser »).

---

# Partie H — Parcours utilisateurs

> Pour chaque parcours : **point d'entrée · étapes · informations visibles ·
> actions · validations · erreurs possibles · résultat final.** (Format compact.)

**JRN-01 — Consulter les priorités du matin.** Entrée : ouverture (Cockpit). Étapes :
lecture Zone 1 (santé) → Zone 2 (priorités) → brief IA (Zone 6). Infos : urgences,
risques, chiffres clés, 5 sujets IA. Actions : traiter/déléguer/différer une
priorité. Validations : celles en attente signalées. Erreurs : IA indispo → brief
déterministe. Résultat : le dirigeant sait quoi faire en < 10 s (AC-CORE-001).

**JRN-02 — Créer un chantier.** Entrée : depuis un devis accepté (souvent
automatique) ou bouton « nouveau chantier ». Étapes : formulaire progressif
(pré-rempli depuis le devis). Infos : budget vendu, déboursé prévu repris. Actions :
compléter, affecter un responsable. Validations : création confirmée. Erreurs :
champs manquants signalés en temps réel. Résultat : chantier créé sans ressaisie.

**JRN-03 — Ajouter une dépense.** Entrée : mobile (terrain) ou bureau. Étapes :
montant, catégorie (suggérée), **rattachement** (chantier/véhicule), **photo du
justificatif**. Infos : impact sur coût/marge annoncé. Actions : enregistrer.
Validations : au-delà d'un seuil, validation requise. Erreurs : doublon détecté →
proposition de rapprochement. Résultat : dépense rattachée, marge/trésorerie mises
à jour (Automation AUTO-DEP-001).

**JRN-04 — Enregistrer une journée de travail.** Entrée : conducteur (mobile).
Étapes : salarié, chantier, heures. Infos : coût calculé (officiel). Actions :
enregistrer ; le conducteur valide. Erreurs : heures aberrantes signalées (anomalie).
Résultat : coût imputé au chantier, marge recalculée.

**JRN-05 — Enregistrer une facture.** Entrée : Finance. Étapes : client, lignes
(reprises), montants (calculés officiels). Validations : **émission = validation
requise** ; numéro légal attribué. Erreurs : incohérence de montant signalée.
Résultat : facture émise (immuable), échéance + alerte créées, CA/trésorerie mis à
jour.

**JRN-06 — Rapprocher un paiement.** Entrée : Finance (futur : depuis la banque).
Étapes : associer un encaissement à une facture. Infos : solde dû. Actions :
confirmer le rapprochement. Erreurs : montant ≠ solde → paiement partiel. Résultat :
facture soldée, alertes d'impayé fermées, trésorerie réelle mise à jour.

**JRN-07 — Créer une tâche.** Entrée : Cockpit, Centre d'actions, mobile, ou depuis
un objet. Étapes : libellé, échéance, contexte (souvent pré-rempli). Infos :
**priorité calculée** affichée avec explication. Actions : enregistrer/déléguer.
Résultat : tâche priorisée dans la file (Automation AUTO-TAC-001).

**JRN-08 — Traiter une contravention.** Entrée : Parc/Contraventions (accès
restreint). Étapes : consulter le détail, choisir **payer** ou **contester**
(délais visibles). Validations : paiement/contestation = validation requise. Erreurs :
délai de contestation dépassé signalé. Résultat : statut mis à jour, échéances/coûts
recalculés, alertes fermées.

**JRN-09 — Renouveler un document.** Entrée : Documents ou alerte d'expiration.
Étapes : ouvrir le document expirant, importer la nouvelle version. Infos : état
(expirant/expiré). Actions : verser la nouvelle version (versionnage). Résultat :
document valide, échéance repoussée, alerte fermée.

**JRN-10 — Valider une proposition IA.** Entrée : Centre d'actions ou assistant.
Étapes : lire la proposition (étiquetée « proposé par l'IA », avec sources et
confiance). Actions : **valider** ou **rejeter**. Validations : l'exécution n'a lieu
qu'après validation (UX-P08). Résultat : action exécutée et tracée, ou rejetée
(tracé).

**JRN-11 — Consulter une dérive de marge.** Entrée : alerte cockpit ou fiche
chantier. Étapes : ouvrir le chantier → onglet Finance ; l'IA (AG-Chantier) explique
la **cause probable** (estimation, étiquetée). Infos : marge prévue → projetée
(officielles), écart. Actions : décider (renégocier, ajuster). Résultat : décision
tracée, tâche éventuelle créée.

**JRN-12 — Préparer une relance client.** Entrée : alerte impayé ou Centre
d'actions. Étapes : l'IA (AG-Finance) **prépare un brouillon** ; le dirigeant relit.
Validations : **envoi = validation requise**. Erreurs : coordonnées manquantes
signalées. Résultat : relance envoyée (après validation), suivi créé.

**JRN-13 — Consulter un rendez-vous Apple Calendar (futur).** Entrée : Cockpit
(agenda) ou Calendrier. Étapes : voir le rendez-vous synchronisé (marque de source),
ses rappels. Infos : conflits éventuels signalés. Actions : préparer la journée
(AG-Planning). Résultat : le dirigeant a son agenda à jour, sans ressaisie
(synchronisation en lecture seule).

---

# Partie I — Interaction IA (règles UX)

Règles d'affichage et d'interaction de l'IA dans l'interface (complètent Business
Rules Partie J et Security G1) :

- **UX-AI-01 — Présente mais discrète.** L'IA vit dans des zones dédiées (brief,
  assistant, suggestions) ; elle **n'envahit pas** les écrans de travail (UX-P06).
- **UX-AI-02 — Jamais elle ne masque l'officiel.** Un chiffre officiel est toujours
  visible et prime ; l'IA **commente**, elle ne **remplace** pas.
- **UX-AI-03 — Distinction stricte.** Fait / **calcul officiel** / **estimation IA**
  / recommandation sont visuellement distincts (B2.5) et **libellés**.
- **UX-AI-04 — Sources et confiance.** Toute réponse IA affiche ses **sources** et
  un **niveau de confiance** ; on peut ouvrir la source.
- **UX-AI-05 — Un seul assistant.** L'utilisateur parle à **un** assistant qui
  orchestre les agents en coulisse (pas d'exposition de l'architecture interne).
- **UX-AI-06 — Actions toujours validées.** Une action proposée par l'IA affiche
  clairement « proposé » et exige **valider/rejeter** ; rien ne s'exécute seul
  (UX-P08, Business Rules IA-042).
- **UX-AI-07 — Contrôle de génération.** L'utilisateur peut **arrêter la
  génération** et **signaler une erreur** ; une réponse incertaine le dit.
- **UX-AI-08 — Respect des droits.** L'assistant ne montre que les données
  autorisées ; une demande hors droits reçoit un refus non divulgant.

---

# Partie J — Analyse du prototype existant

Le prototype HTML autonome (tableau de bord « Chantiers / Pilotage », données
fictives) est une **expérimentation UX**, **pas** la base technique définitive.

| Verdict | Éléments |
|---|---|
| **À conserver (inspire le cockpit final)** | La **palette BRN verte** parcimonieuse ; la **disposition en cartes KPI** ; le **traitement des alertes** (niveau + raison + action) ; les **pastilles de santé** (vert/ambre/rouge) ; le **graphe sobre** (CA mensuel) ; le **scénario réaliste** (entreprise saine + un chantier problématique isolé). |
| **À améliorer** | Passer des **données fictives** aux **projections officielles** ; ajouter les **zones Dirigeant, Agenda, Parc, IA** (le prototype ne couvre que la santé entreprise et les chantiers) ; introduire la **distinction officiel/estimation IA** ; ajouter la **priorisation explicable** ; enrichir le **responsive** et l'**accessibilité**. |
| **À supprimer** | Les **valeurs financières et calculs codés en dur dans la page** (violent Product P14 / Business Rules INV-1) ; les **données de démonstration figées**. |
| **Non conforme à l'architecture** | Le format **fichier HTML autonome monolithique** (pas de séparation présentation/logique/stockage, Master Blueprint P2) ; l'**absence de source de vérité** (tout est local et figé). |
| **Ce qui inspire le cockpit final** | L'idée d'un **écran unique de pilotage**, la **hiérarchie visuelle** claire, les **cartes d'alerte actionnables**, la **retenue graphique**. |

> **Conclusion.** Le prototype est une **bonne boussole visuelle** pour le cockpit,
> mais l'UX cible le **dépasse largement** (6 zones, priorisation, IA, distinction
> officiel/estimation) et l'implémentation cible **ne réutilise pas** son code.

---

# Partie K — Critères d'acceptation UX

> Une interface n'est **conforme** que si elle satisfait ces critères. Ils sont
> **vérifiables** lors de la conception détaillée et des revues.

| ID | Critère |
|---|---|
| AC-CORE-001 | En < 10 s, le dirigeant comprend l'essentiel (santé, urgences, risques, décisions, priorités, agenda, finances, parc, échéances). |
| AC-002 | Aucune information importante n'est cachée derrière un clic non signalé (UX-P01). |
| AC-003 | Aucune donnée n'est saisie deux fois dans un parcours (UX-P02). |
| AC-004 | Chaque écran propose au moins une **action** pertinente (UX-P05). |
| AC-005 | Les chiffres officiels et les estimations IA sont **toujours** visuellement distincts et libellés (UX-P07, UX-AI-03). |
| AC-006 | Toute action sensible passe par une **validation** explicite avec état visible (UX-P08). |
| AC-007 | Toute erreur est **claire et récupérable** ; aucun écran blanc (UX-P09, F5). |
| AC-008 | Les formulaires sont **courts, progressifs**, avec brouillon automatique (UX-P10, F1). |
| AC-009 | Les tableaux restent **lisibles** à fort volume et offrent une **vue mobile** en cartes (UX-P11, F2). |
| AC-010 | La priorité affichée suit le **moteur officiel** et son **explication** est accessible (UX-PRIO-001). |
| AC-011 | Le produit est **utilisable en mode clair et sombre**, à parité de sens (B3). |
| AC-012 | Contrastes, focus clavier, lecteurs d'écran, cibles tactiles conformes ; **aucune dépendance à la seule couleur** (G2). |
| AC-013 | Sur mobile, les **9 actions essentielles terrain** sont réalisables (G1, UX-P13). |
| AC-014 | Chaque graphique **répond à une question métier** et n'est pas décoratif (F3). |
| AC-015 | Les alertes sont **regroupées**, hiérarchisées et **anti-fatigue** (F4). |
| AC-016 | L'IA est **présente sans envahir**, cite ses **sources**, montre sa **confiance**, et **ne masque jamais** l'officiel (Partie I). |
| AC-017 | La personnalisation **ne casse pas** la cohérence globale (G3). |
| AC-018 | Aucune valeur de style n'est en dur : tout passe par des **jetons** (B10). |
| AC-019 | Chaque parcours (Partie H) a un **résultat clair** et des erreurs **gérées**. |
| AC-020 | L'expérience est **cohérente** sur tous les modules (mêmes composants, mêmes règles). |

---

# Partie L — Traçabilité vers les autres documents fondateurs

| Thème UX | UX/UI Bible | Product Bible | Master Blueprint | Business Rules | Data | Security | Automation |
|---|---|---|---|---|---|---|---|
| Règle des 10 s / cockpit | A1, D | A1, D1 | 1.7, 39 | PRI | E-TACHE | — | AUTO-IA-001 |
| Officiel vs estimation IA | B2.5, I | P14 | P6 | INV-1, IA-002 | attributs calculés | — | AG-P2 |
| Priorisation visuelle | A3, E6 | — | 38 | PRI | E-PRIORITE | — | AUTO-TAC-001 |
| Validation des actions | UX-P08, I | P07 | 14.4 | INV-7 | E-VALIDATION | SEC-SOD | Partie F |
| Alertes anti-fatigue | F4 | — | 39 | PRI-015, ALR | E-ALERTE | — | B4 |
| Accès restreint (contraventions, dirigeant) | E1, E5 | — | 20.2 | BR-CTR-007 | classification | C8, B | — |
| Responsive / terrain | G1 | EXP-7 | 7.2, 9 | — | — | G2 (mobile) | — |
| Deux modes / jetons | B3, B10 | — | 7 | — | — | — | — |
| Prototype = UX only | J | 1.7 note | note liminaire | — | — | — | — |

---

## Fin du document

> **BRN PILOT — UX/UI Bible v1.0.** Toute l'expérience et l'identité visuelle de
> *BRN Pilot* : une véritable expérience de **pilotage pour le dirigeant** —
> moderne, premium, claire, rapide, orientée décision. Document normatif, **sans
> code, sans interface**.
>
> **Règle d'or.** En moins de 10 secondes, le dirigeant sait ce qui compte. Rien
> d'important n'est caché ; l'officiel prime sur l'IA ; chaque écran permet d'agir ;
> l'action sensible se valide ; le style passe par des **jetons** cohérents.
>
> À relire et valider **avant** l'API Bible. Prochaines étapes : **API Bible**, puis
> **Developer Bible** — avant tout développement.
