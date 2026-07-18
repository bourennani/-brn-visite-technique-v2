# BRN PILOT — BUSINESS RULES BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **tout le
> comportement** de *BRN Pilot* : événements, déclencheurs, automatismes, calculs,
> états, transitions, validations, priorités, workflows, alertes, intelligence,
> et couche IA. **Le Master Blueprint définit la structure ; cette Bible définit le
> comportement.**
>
> **Règle fondamentale de gouvernance (P13 du Master Blueprint, décision D30).**
> Aucune logique métier importante n'est développée sans être documentée ici au
> préalable. Tout code implémentant une règle **cite l'identifiant** de la règle
> (`BR-…`, `CALC-…`, `PRI-…`, etc.). Une logique métier absente de cette Bible est
> **non conforme** et refusée en revue.
>
> **Ce document ne contient aucun code, aucune interface, aucune base de données.**
> Les formules sont exprimées en langage naturel. C'est l'**intelligence** du
> logiciel, écrite **avant** son développement.
>
> **Statut :** v1.0, en construction — référence en cours de constitution.
> **Périmètre :** cohérent avec le Master Blueprint v1.1 (mêmes modules V1 ; SAV et
> Maintenance restent des modules futurs).

---

## Table des matières

**Partie A — Fondations**
- A1. Objectif et portée
- A2. Convention d'identification des règles
- A3. Anatomie d'une règle
- A4. Typologie des règles
- A5. Principes de comportement (invariants)
- A6. Gouvernance et cycle de vie des règles

**Partie B — Catalogue des événements métier** (EVT)

**Partie C — Machines à états et transitions** (ST)

**Partie D — Règles métier par domaine** (BR)
- D1. Finance (BR-FIN)
- D2. Chantiers (BR-CHA)
- D3. RH / Main-d'œuvre (BR-RH)
- D4. Stock (BR-STK)
- D5. CRM (BR-CRM)
- D6. Parc Véhicules (BR-VEH)
- D7. Contraventions (BR-CTR)
- D8. Espace Dirigeant (BR-DIR)
- D9. Documents (BR-DOC)
- D10. Calendrier (BR-CAL)

**Partie E — Moteur de calcul** (CALC)

**Partie F — Moteur de priorité** (PRI)

**Partie G — Moteur d'alertes** (ALR)

**Partie H — Moteur d'intelligence et détection d'anomalies** (ANO)

**Partie I — Workflows** (WF)

**Partie J — Copilote IA** (IA)
- J1. Principes fondamentaux
- J2. Niveaux d'autonomie
- J3. Brief quotidien du dirigeant
- J4. Assistant conversationnel
- J5. Actions proposées
- J6. Détection d'anomalies assistée
- J7. Architecture multi-fournisseur (AI Gateway)
- J8. Architecture RAG
- J9. Sécurité IA
- J10. Fiabilité et honnêteté

**Partie K — Index et traçabilité**

---

# Partie A — Fondations

## A1. Objectif et portée

Cette Bible est le **cerveau** de *BRN Pilot*. Elle décrit **toutes les décisions
que le logiciel prend** : quand il réagit, ce qu'il calcule, ce qu'il autorise, ce
qu'il alerte, ce qu'il priorise, et comment son copilote IA assiste le dirigeant
**sans jamais** produire un chiffre officiel.

Elle sert de contrat entre la direction (le métier) et le développement : **le
comportement est décidé ici, pas dans le code**.

## A2. Convention d'identification des règles

Chaque règle porte un identifiant **unique, stable et jamais réattribué** :

`BR-<DOMAINE>-<NNN>` pour une règle métier, et des préfixes dédiés pour les autres
familles :

| Préfixe | Famille | Exemple |
|---|---|---|
| `EVT-<DOM>-NNN` | Événement métier | `EVT-FIN-004` |
| `ST-<ENTITÉ>-NNN` | Transition d'état | `ST-DEVIS-003` |
| `BR-<DOM>-NNN` | Règle métier / automatisme | `BR-FIN-010` |
| `CALC-<DOM>-NNN` | Calcul officiel centralisé | `CALC-FIN-002` |
| `PRI-NNN` | Règle du moteur de priorité | `PRI-005` |
| `ALR-NNN` | Règle d'alerte | `ALR-020` |
| `ANO-NNN` | Règle de détection d'anomalie | `ANO-007` |
| `WF-NNN` | Workflow | `WF-003` |
| `IA-NNN` | Règle de la couche IA | `IA-042` |
| `GOV-NNN` | Règle de gouvernance | `GOV-002` |

Domaines : `FIN` (Finance), `CHA` (Chantiers), `RH`, `STK` (Stock), `CRM`,
`VEH` (Véhicules), `CTR` (Contraventions), `DIR` (Dirigeant), `DOC` (Documents),
`CAL` (Calendrier), `CORE` (transverse).

> Un identifiant **retiré** n'est jamais recyclé : la règle passe en statut
> *Abrogée — remplacée par …* (GOV-004). L'histoire des règles est conservée.

## A3. Anatomie d'une règle

Toute règle est décrite par :

- **Identifiant** et **nom court**.
- **Déclencheur** : événement, condition, échéance ou seuil qui l'active.
- **Préconditions** : ce qui doit être vrai pour qu'elle s'applique.
- **Effet / Actions** : ce que le logiciel fait, listé, ordonné.
- **Type** (voir A4).
- **Traçabilité** : événement émis et/ou entrée d'audit.
- **Réversibilité** : comment on revient en arrière (ou pourquoi c'est irréversible).
- **Références** : autres règles, calculs, décisions du Master Blueprint.

Dans les tableaux compacts, ces champs sont condensés (Déclencheur | Effet | Type |
Notes) ; les règles complexes (calculs, priorité, IA) sont détaillées en prose.

## A4. Typologie des règles

| Type | Rôle |
|---|---|
| **Événementielle (réaction)** | « SI événement ALORS actions ». Le cœur des automatismes. |
| **Calcul** | Produit un chiffre officiel (déterministe, centralisé). |
| **Validation** | Autorise ou refuse une opération (garde-fou métier). |
| **Transition d'état** | Fait passer une entité d'un état à un autre, sous conditions. |
| **Alerte** | Produit une notification/tâche à partir d'une échéance ou d'un seuil. |
| **Priorité** | Attribue un niveau/score de priorité. |
| **Anomalie** | Détecte une incohérence et la présente comme **hypothèse à vérifier**. |
| **Workflow** | Enchaîne plusieurs règles pour un processus complet. |
| **IA** | Encadre le comportement du copilote (jamais un calcul officiel). |

## A5. Principes de comportement (invariants)

Ces principes priment sur toute règle particulière.

- **INV-1 — Déterminisme des chiffres officiels.** Tout montant, coût, marge,
  priorité officiel est produit par un **calcul centralisé** (`CALC-…` / `PRI-…`),
  déterministe et testé. Jamais par l'interface. Jamais par l'IA. (Master Blueprint
  P6, D7.)
- **INV-2 — Une saisie ne disparaît jamais en silence.** Une donnée validée n'est
  ni écrasée ni supprimée sans trace (verrou optimiste, suppression logique, audit).
- **INV-3 — Recalcul, pas figeage.** Les indicateurs dérivés (marge, coût réel,
  trésorerie, CA) sont **recalculés** à partir des faits, jamais recopiés puis
  oubliés. Exception : un **document émis** (facture) est figé par nature juridique.
- **INV-4 — Cohérence par événements.** Les effets inter-modules passent par
  événements (cohérence éventuelle), jamais par accès direct aux données d'autrui.
- **INV-5 — Idempotence.** Rejouer un événement ou une action ne produit pas de
  doublon ni de double effet.
- **INV-6 — Traçabilité.** Toute règle qui modifie une donnée engageante laisse une
  trace (événement + audit) : qui, quoi, quand, pourquoi (quelle règle).
- **INV-7 — L'humain valide l'engageant.** Toute action **engageante** (envoi
  externe, paiement, émission, signature, modification financière) exige une
  **validation humaine**, qu'elle vienne d'une automatisation ou de l'IA.
- **INV-8 — Configuration versionnée.** Seuils, délais, taux, pondérations sont des
  **données administrables, versionnées et datées** : on connaît la valeur en
  vigueur à une date. Changer un paramètre ne réécrit pas l'histoire.
- **INV-9 — Explicabilité.** Toute priorité, alerte ou anomalie s'accompagne d'une
  **explication** lisible (« pourquoi »).
- **INV-10 — Séparation fait / calcul / estimation / recommandation.** Le logiciel
  et l'IA étiquettent toujours la nature d'une information (voir IA-002).

## A6. Gouvernance et cycle de vie des règles

- **GOV-001 — Source unique.** Aucune règle métier importante n'existe hors de
  cette Bible. Le code cite l'identifiant de la règle qu'il implémente.
- **GOV-002 — Ajout.** Une nouvelle règle reçoit un identifiant neuf, un statut
  *Proposée* puis *Active* après validation.
- **GOV-003 — Modification.** Une règle active se modifie par **version** (on
  conserve l'historique du texte de la règle) ; les paramètres se changent par la
  configuration (INV-8), pas par réécriture de la règle.
- **GOV-004 — Abrogation.** Une règle retirée passe *Abrogée — remplacée par …* ;
  son identifiant n'est jamais recyclé.
- **GOV-005 — Conflit de règles.** En cas de conflit, l'ordre de préséance est :
  invariants (A5) > règles de sécurité/conformité > règles financières officielles
  > autres règles. Un conflit non résolvable est **escaladé** à la direction, pas
  tranché par le code.
- **GOV-006 — Testabilité.** Toute règle de calcul, de validation, de transition ou
  de priorité doit être **testable** par un cas reproductible (Master Blueprint
  ch. 27).

---

# Partie B — Catalogue des événements métier (EVT)

Les événements sont le **langage** par lequel les règles se déclenchent (Master
Blueprint ch. 13). Nommage « Domaine.FaitAuPassé ». Liste de référence
(extensible, jamais réduite en silence).

### B1. Finance

| ID | Événement | Émis quand |
|---|---|---|
| EVT-FIN-001 | Devis.Créé | Un devis est créé (brouillon). |
| EVT-FIN-002 | Devis.Émis | Un devis est envoyé au client. |
| EVT-FIN-003 | Devis.Accepté | Le client accepte le devis. |
| EVT-FIN-004 | Devis.Refusé | Le client refuse le devis. |
| EVT-FIN-005 | Devis.Expiré | La validité du devis est dépassée. |
| EVT-FIN-006 | Facture.Créée | Une facture est émise. |
| EVT-FIN-007 | Facture.Envoyée | La facture est transmise au client. |
| EVT-FIN-008 | Facture.Payée | Un paiement solde la facture. |
| EVT-FIN-009 | Facture.PartiellementPayée | Un paiement partiel est reçu. |
| EVT-FIN-010 | Facture.Impayée | L'échéance est dépassée sans paiement. |
| EVT-FIN-011 | Avoir.Émis | Un avoir est émis. |
| EVT-FIN-012 | Situation.Créée | Une situation de travaux est établie. |
| EVT-FIN-013 | Paiement.Reçu | Un encaissement est enregistré. |
| EVT-FIN-014 | Depense.Créée | Une dépense est enregistrée. |
| EVT-FIN-015 | Depense.Rattachée | Une dépense est rattachée (chantier/véhicule). |
| EVT-FIN-016 | Tresorerie.Recalculée | La trésorerie prévisionnelle est recalculée. |

### B2. Chantiers

| ID | Événement |
|---|---|
| EVT-CHA-001 | Chantier.Créé (depuis Devis.Accepté) |
| EVT-CHA-002 | Chantier.Démarré |
| EVT-CHA-003 | Chantier.AvancementMisÀJour |
| EVT-CHA-004 | Chantier.CoûtRéelMisÀJour |
| EVT-CHA-005 | Chantier.MargeRecalculée |
| EVT-CHA-006 | Chantier.Réceptionné |
| EVT-CHA-007 | Réserve.Créée |
| EVT-CHA-008 | Réserve.Levée |
| EVT-CHA-009 | Chantier.EnRetard |
| EVT-CHA-010 | Chantier.Clôturé |

### B3. RH / Main-d'œuvre

| ID | Événement |
|---|---|
| EVT-RH-001 | JournéeTravail.Enregistrée |
| EVT-RH-002 | Pointage.Validé |
| EVT-RH-003 | Absence.Déclarée |
| EVT-RH-004 | Absence.Validée |
| EVT-RH-005 | VariablePaie.Préparée |

### B4. Stock

| ID | Événement |
|---|---|
| EVT-STK-001 | Mouvement.Enregistré |
| EVT-STK-002 | Stock.SeuilAtteint |
| EVT-STK-003 | Réappro.Proposé |

### B5. CRM

| ID | Événement |
|---|---|
| EVT-CRM-001 | Opportunité.Créée |
| EVT-CRM-002 | Opportunité.Gagnée |
| EVT-CRM-003 | Opportunité.Perdue |
| EVT-CRM-004 | Interaction.Enregistrée |

### B6. Parc Véhicules

| ID | Événement |
|---|---|
| EVT-VEH-001 | Véhicule.Ajouté |
| EVT-VEH-002 | Kilométrage.Relevé |
| EVT-VEH-003 | Entretien.Planifié |
| EVT-VEH-004 | Entretien.Réalisé |
| EVT-VEH-005 | Réparation.Enregistrée |
| EVT-VEH-006 | Vidange.Enregistrée |
| EVT-VEH-007 | Pneus.Changés |
| EVT-VEH-008 | Batterie.Changée |
| EVT-VEH-009 | Échéance.Véhicule.Proche (assurance/CT/entretien/leasing) |
| EVT-VEH-010 | CoûtVéhicule.Recalculé |

### B7. Contraventions

| ID | Événement |
|---|---|
| EVT-CTR-001 | Contravention.Enregistrée |
| EVT-CTR-002 | Contravention.ÉchéancePaiementProche |
| EVT-CTR-003 | Contravention.ÉchéanceContestationProche |
| EVT-CTR-004 | Contravention.Payée |
| EVT-CTR-005 | Contravention.Contestée |
| EVT-CTR-006 | Contravention.Classée |

### B8. Espace Dirigeant

| ID | Événement |
|---|---|
| EVT-DIR-001 | Tâche.Créée |
| EVT-DIR-002 | Tâche.Priorisée |
| EVT-DIR-003 | Tâche.Terminée |
| EVT-DIR-004 | Décision.EnAttente |
| EVT-DIR-005 | Décision.Prise |
| EVT-DIR-006 | Validation.Demandée |
| EVT-DIR-007 | Validation.Accordée / Refusée |
| EVT-DIR-008 | Signature.Demandée |
| EVT-DIR-009 | Signature.Effectuée |
| EVT-DIR-010 | Obligation.ÉchéanceProche |
| EVT-DIR-011 | BriefQuotidien.Généré |

### B9. Documents & Calendrier

| ID | Événement |
|---|---|
| EVT-DOC-001 | Document.Ajouté |
| EVT-DOC-002 | Document.Versionné |
| EVT-DOC-003 | Document.Signé |
| EVT-CAL-001 | RendezVous.Détecté (source Apple Calendar, futur) |
| EVT-CAL-002 | RendezVous.Synchronisé |

### B10. IA & Anomalies

| ID | Événement |
|---|---|
| EVT-IA-001 | IA.SuggestionÉmise |
| EVT-IA-002 | IA.ActionProposée |
| EVT-IA-003 | IA.BriefGénéré |
| EVT-CORE-001 | Anomalie.Détectée |
| EVT-CORE-002 | Anomalie.Confirmée / Rejetée |

---

# Partie C — Machines à états et transitions (ST)

Chaque entité engageante a des **états** et des **transitions autorisées**. Toute
transition non listée est **interdite** (validation par défaut).

## C1. Devis

États : `Brouillon → Émis → {Accepté | Refusé | Expiré}`.

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-DEVIS-001 | Brouillon → Émis | Devis complet et chiffré (BR-FIN-002) | EVT-FIN-002 ; démarre le délai de validité. |
| ST-DEVIS-002 | Émis → Accepté | Réponse client positive | EVT-FIN-003 ; déclenche WF-001 (création chantier). |
| ST-DEVIS-003 | Émis → Refusé | Réponse client négative | EVT-FIN-004 ; met à jour l'opportunité (BR-CRM-004). |
| ST-DEVIS-004 | Émis → Expiré | Délai de validité dépassé | EVT-FIN-005 ; propose une relance (BR-FIN-004). |
| ST-DEVIS-005 | Accepté → (verrou) | — | Un devis accepté ne se modifie plus ; toute évolution = avenant (BR-FIN-005). |

## C2. Facture

États : `Brouillon → Émise → {Partiellement payée → Payée | Impayée → Payée | Annulée par avoir}`.

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-FAC-001 | Brouillon → Émise | Numérotation légale attribuée (CALC-FIN-020) | EVT-FIN-006 ; document figé et immuable. |
| ST-FAC-002 | Émise → Partiellement payée | Paiement < solde dû | EVT-FIN-009 ; recalcul solde. |
| ST-FAC-003 | {Émise, Partiellement payée} → Payée | Paiements = total dû | EVT-FIN-008. |
| ST-FAC-004 | Émise → Impayée | Échéance dépassée, solde > 0 | EVT-FIN-010 ; déclenche relance (BR-FIN-030). |
| ST-FAC-005 | Émise → Annulée-par-avoir | Émission d'un avoir lié (BR-FIN-040) | Jamais de suppression ; l'avoir compense. |

## C3. Chantier

États : `Prévu → EnCours → {EnRetard} → Réceptionné → Clôturé`.

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-CHA-001 | Prévu → EnCours | Date de démarrage atteinte / déclaré démarré | EVT-CHA-002. |
| ST-CHA-002 | EnCours → EnRetard | Avancement < avancement attendu à la date (CALC-CHA-010) | EVT-CHA-009 ; alerte ALR-030. |
| ST-CHA-003 | EnCours → Réceptionné | PV de réception établi | EVT-CHA-006 ; ouvre garanties, gèle le coût prévu. |
| ST-CHA-004 | Réceptionné → Clôturé | Réserves levées + soldé | EVT-CHA-010. |

## C4. Contravention

États : `ÀTraiter → {Payée | Contestée → {Classée-sans-suite | Maintenue → Payée}} | Classée`.

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-CTR-001 | (création) → ÀTraiter | Contravention enregistrée | EVT-CTR-001 ; crée échéances paiement/contestation. |
| ST-CTR-002 | ÀTraiter → Payée | Paiement enregistré | EVT-CTR-004 ; supprime alertes liées. |
| ST-CTR-003 | ÀTraiter → Contestée | Contestation déposée avant échéance | EVT-CTR-005 ; suit le délai de traitement. |
| ST-CTR-004 | Contestée → Classée-sans-suite | Contestation acceptée | EVT-CTR-006. |
| ST-CTR-005 | Contestée → Maintenue | Contestation rejetée | Réactive l'échéance de paiement (majorée éventuelle). |

## C5. Tâche (Espace Dirigeant)

États : `Créée → Priorisée → {EnCours → Terminée | Déléguée | Différée | Annulée}`.

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-TASK-001 | Créée → Priorisée | Score calculé (PRI-001) | EVT-DIR-002 ; place dans la file. |
| ST-TASK-002 | Priorisée → EnCours | Prise en charge | — |
| ST-TASK-003 | EnCours → Terminée | Action réalisée | EVT-DIR-003 ; retire du cockpit. |
| ST-TASK-004 | Priorisée → Déléguée | Affectée à un tiers | Reste suivie jusqu'à clôture. |
| ST-TASK-005 | Priorisée → Différée | Reportée avec nouvelle échéance | Recalcul de priorité à la date. |

## C6. Véhicule (cycle de conformité)

États de conformité (indicateur, non exclusifs) : `Conforme | AlerteProche | NonConforme`
(assurance, contrôle technique, entretien).

| ID | Transition | Précondition | Effet |
|---|---|---|---|
| ST-VEH-001 | Conforme → AlerteProche | Échéance dans le délai d'alerte (INV-8) | EVT-VEH-009 ; crée tâche + alerte (BR-VEH-020). |
| ST-VEH-002 | AlerteProche → NonConforme | Échéance dépassée | Priorité critique (PRI-010) ; risque juridique (ANO-020). |
| ST-VEH-003 | NonConforme → Conforme | Renouvellement enregistré | Supprime alertes ; nouvelle échéance. |

---

# Partie D — Règles métier par domaine (BR)

> Format compact : **ID | Déclencheur | Effet / Actions | Type | Notes**. Les
> actions renvoyant à un calcul citent le `CALC-…` correspondant. Toute action
> engageante respecte INV-7.

## D1. Finance (BR-FIN)

### D1.1 Devis

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-FIN-001 | Création d'un devis | Le devis est en `Brouillon` ; ses lignes sont chiffrées par le moteur financier (CALC-FIN-001) ; aucune valeur saisie en dur. | Validation/Calcul | INV-1. |
| BR-FIN-002 | Émission d'un devis | Vérifier complétude (client, lignes, montants, validité) ; passer `Émis` (ST-DEVIS-001) ; émettre EVT-FIN-002 ; démarrer le délai de validité. | Transition | Refus si incomplet. |
| BR-FIN-003 | Devis émis + délai sans réponse (seuil configurable) | Créer une tâche « relancer le devis » (BR-DIR-001) priorisée ; proposer un brouillon de relance (IA-040). | Alerte/Automatisme | Anti-fatigue (ALR-002). |
| BR-FIN-004 | Devis expiré (ST-DEVIS-004) | Proposer relance ou clôture ; mettre à jour l'opportunité CRM. | Automatisme | — |
| BR-FIN-005 | Modification demandée sur un devis accepté | Interdire la modification ; imposer un **avenant** (nouveau devis lié). | Validation | ST-DEVIS-005. |
| BR-FIN-006 | Devis accepté | Déclencher WF-001 : créer le chantier, reprendre le budget, notifier. | Workflow | EVT-FIN-003. |

### D1.2 Factures & situations

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-FIN-010** | **Une facture est créée (EVT-FIN-006)** | **(1) créer automatiquement son échéance de paiement (BR-FIN-011) ; (2) mettre à jour le CA facturé (CALC-FIN-002) ; (3) recalculer la trésorerie prévisionnelle (CALC-FIN-010) ; (4) mettre à jour le solde du client (CALC-CRM-001) ; (5) créer une alerte à échéance (ALR-020).** | Automatisme | Traduit l'exemple direction. Idempotent (INV-5). |
| BR-FIN-011 | Facture émise | Créer une **échéance** typée « paiement facture » à la date d'échéance calculée (CALC-FIN-011, selon conditions de paiement). | Automatisme | Source des alertes ALR-020/021. |
| BR-FIN-012 | Facture émise | Attribuer le **numéro légal séquentiel** (CALC-FIN-020) au moment de l'émission ; figer le document (immuable). | Calcul/Validation | Master Blueprint 15.6. |
| **BR-FIN-013** | **Une facture est payée (EVT-FIN-008)** | **(1) mettre à jour la trésorerie réelle (CALC-FIN-012) ; (2) recalculer les prévisions (CALC-FIN-010) ; (3) mettre à jour les statistiques (CALC-FIN-030) ; (4) supprimer les alertes d'impayé/échéance liées (ALR-090) ; (5) mettre à jour le chantier rattaché (encaissement, CALC-CHA-020).** | Automatisme | Traduit l'exemple direction. |
| BR-FIN-014 | Paiement partiel (EVT-FIN-009) | Recalculer le solde dû ; conserver l'échéance sur le reste ; mettre à jour la trésorerie. | Automatisme | — |
| BR-FIN-015 | Échéance de facture dépassée, solde > 0 | Passer `Impayée` (ST-FAC-004) ; créer alerte impayé (ALR-021) ; créer tâche relance priorisée (BR-DIR-001) ; escalade dirigeant si montant élevé (ALR-022). | Alerte/Automatisme | Impact financier fort → priorité haute (PRI). |
| BR-FIN-016 | Avancement de chantier franchit un jalon de facturation | Proposer une **situation de travaux** à valider (jamais émise automatiquement). | Automatisme | INV-7. |
| BR-FIN-017 | Émission d'une situation | Calculer le montant à l'avancement (CALC-FIN-040) ; appliquer la retenue de garantie (CALC-FIN-041). | Calcul | Règles précises à figer (question ouverte). |

### D1.3 Dépenses & trésorerie

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-FIN-020** | **Une dépense est créée (EVT-FIN-014)** | **(1) mettre à jour le budget/coût réel du chantier rattaché (CALC-CHA-002) ; (2) recalculer la marge (CALC-CHA-001) ; (3) mettre à jour la trésorerie (CALC-FIN-010) ; (4) mettre à jour les indicateurs/graphiques (via projections, CALC-FIN-030).** | Automatisme | Traduit l'exemple direction. |
| BR-FIN-021 | Dépense portant un identifiant de véhicule | La rattacher au véhicule et l'agréger dans son coût d'exploitation (CALC-VEH-010). | Automatisme | Rattachement automatique (Master Blueprint 11.3). |
| BR-FIN-022 | Dépense sans rattachement (ni chantier ni véhicule) | La classer « frais généraux » ; signaler pour catégorisation (IA-041 peut proposer une catégorie). | Validation | Pas de dépense « orpheline ». |
| BR-FIN-023 | Dépense d'un montant anormal | Déclencher ANO-001 (dépense inhabituelle) : hypothèse à vérifier. | Anomalie | Ne bloque pas la saisie. |
| BR-FIN-024 | Recalcul de trésorerie | Projeter les encaissements attendus (échéances factures) moins les décaissements attendus (dépenses/échéances) sur l'horizon configuré. | Calcul | CALC-FIN-010. |

### D1.4 Marge & pilotage financier

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-FIN-030 | Facture impayée | Générer une relance graduée (rappel, relance, mise en demeure) selon l'ancienneté ; brouillon préparé, envoi validé. | Automatisme | INV-7 ; IA-040 rédige le brouillon. |
| BR-FIN-031 | Marge réalisée d'un chantier passe sous la marge prévue d'un écart configurable | Déclencher ANO-002 (dérive de marge) ; créer tâche/alerte priorisée pour le dirigeant. | Anomalie/Alerte | Impact financier majeur. |
| BR-FIN-032 | Trésorerie projetée passe sous un seuil configurable | Déclencher ANO-003 (risque de trésorerie) ; alerte critique dirigeant. | Anomalie/Alerte | Priorité critique. |
| BR-FIN-040 | Émission d'un avoir | Lier l'avoir à la facture ; compenser le CA et la trésorerie ; conserver l'historique (jamais de suppression). | Automatisme | ST-FAC-005 ; INV-2. |

## D2. Chantiers (BR-CHA)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-CHA-001 | Devis accepté | Créer le chantier depuis le devis ; reprendre le budget vendu et le déboursé prévu ; état `Prévu`. | Workflow | WF-001. |
| BR-CHA-002 | Coût imputé (dépense, journée RH, sortie stock) | Recalculer le **coût réel** du chantier (CALC-CHA-002) et la **marge** (CALC-CHA-001). | Automatisme | Cœur du pilotage. |
| BR-CHA-003 | Mise à jour d'avancement | Recalculer la marge réalisée projetée (CALC-CHA-001) ; vérifier le retard (ST-CHA-002). | Automatisme | — |
| BR-CHA-004 | Avancement < avancement attendu (CALC-CHA-010) | Marquer `EnRetard` ; alerte ALR-030 ; tâche priorisée. | Alerte | Impact opérationnel. |
| BR-CHA-005 | Réception établie | Passer `Réceptionné` ; ouvrir les garanties (échéances) ; geler le budget prévu ; créer les réserves listées. | Transition | ST-CHA-003. |
| BR-CHA-006 | Réserve créée | Créer une tâche de levée priorisée ; échéance de levée. | Automatisme | ALR-031 si non levée. |
| BR-CHA-007 | Toutes réserves levées + chantier soldé | Passer `Clôturé`. | Transition | ST-CHA-004. |
| BR-CHA-008 | Coût réel projeté > budget vendu | Déclencher ANO-002 (dérive) ; escalade dirigeant. | Anomalie | — |

## D3. RH / Main-d'œuvre (BR-RH)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-RH-001** | **Une journée de travail est enregistrée (EVT-RH-001)** | **(1) calculer son coût (CALC-RH-001, taux horaire chargé × heures) ; (2) l'affecter au chantier ; (3) recalculer la marge (CALC-CHA-001) ; (4) recalculer le coût réel (CALC-CHA-002) ; (5) recalculer les indicateurs (projections).** | Automatisme | Traduit l'exemple direction. |
| BR-RH-002 | Pointage validé par le conducteur | Rendre le coût définitif ; verrouiller la journée (modification = correction tracée). | Validation | INV-2. |
| BR-RH-003 | Heures > seuil quotidien/hebdomadaire | Signaler pour vérification (heures supplémentaires) ; ANO-004 (saisie incohérente possible). | Anomalie | Ne bloque pas. |
| BR-RH-004 | Absence validée | Mettre à jour la disponibilité de l'équipe ; signaler conflit de planning éventuel (ANO-010). | Automatisme | — |
| BR-RH-005 | Préparation de paie | Agréger les variables (heures, absences, primes) sans calculer la paie légale (externe). | Calcul | Périmètre : préparation seulement. |

## D4. Stock (BR-STK)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-STK-001 | Sortie de stock vers un chantier | Valoriser la sortie (CALC-STK-001) ; l'imputer au coût réel du chantier (BR-CHA-002). | Automatisme | — |
| BR-STK-002 | Stock d'un article sous son seuil | Émettre EVT-STK-002 ; proposer un réapprovisionnement (brouillon de commande). | Alerte/Automatisme | INV-7 pour la commande. |
| BR-STK-003 | Entrée de stock | Mettre à jour la quantité et la valorisation. | Automatisme | — |
| BR-STK-004 | Écart d'inventaire | Déclencher ANO-005 (incohérence de stock). | Anomalie | — |

## D5. CRM (BR-CRM)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-CRM-001 | Opportunité créée | Proposer la planification d'une visite/étude ; rattacher au tiers. | Automatisme | — |
| BR-CRM-002 | Devis accepté | Passer l'opportunité `Gagnée` ; mettre à jour le pipeline. | Automatisme | — |
| BR-CRM-003 | Devis refusé/expiré | Passer l'opportunité `Perdue` ou en relance ; consigner le motif. | Automatisme | — |
| BR-CRM-004 | Paiement reçu | Mettre à jour le **solde client** (CALC-CRM-001) et l'historique. | Automatisme | Support de « combien me doivent mes clients ». |
| BR-CRM-005 | Client sans interaction depuis un délai | Proposer une relance commerciale (tâche). | Automatisme | — |

## D6. Parc Véhicules (BR-VEH)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-VEH-001 | Véhicule ajouté | Créer sa fiche ; générer les échéances connues (assurance, contrôle technique, leasing). | Automatisme | Source d'alertes. |
| BR-VEH-002 | Relevé kilométrique | Mettre à jour le kilométrage ; vérifier l'entretien dû au km (BR-VEH-010) ; calculer la consommation réelle (CALC-VEH-002). | Automatisme | — |
| BR-VEH-003 | Kilométrage incohérent (inférieur au précédent ou saut anormal) | Déclencher ANO-006 (kilométrage incohérent) ; ne pas écraser l'historique. | Anomalie | INV-2. |
| BR-VEH-010 | Kilométrage atteint le seuil d'un entretien périodique | Planifier l'entretien (EVT-VEH-003) ; créer tâche priorisée + alerte. | Alerte/Automatisme | — |
| BR-VEH-011 | Entretien réalisé | Enregistrer coût et km ; **rattacher la dépense** (BR-FIN-021) ; replanifier le prochain entretien ; supprimer l'alerte. | Automatisme | ALR-090 (nettoyage d'alerte). |
| **BR-VEH-020** | **Une échéance véhicule approche (assurance/CT/entretien/vidange/pneus/leasing) (EVT-VEH-009)** | **(1) créer une alerte (ALR-010) ; (2) créer une tâche (BR-DIR-001) ; (3) classer automatiquement sa priorité (PRI-001).** | Alerte/Automatisme | Traduit l'exemple direction. |
| BR-VEH-021 | Échéance véhicule dépassée | Passer le véhicule `NonConforme` (ST-VEH-002) ; priorité critique ; risque juridique (ANO-020). | Alerte/Anomalie | Sécurité/conformité. |
| BR-VEH-030 | Coûts d'un véhicule anormalement élevés vs sa catégorie | Déclencher ANO-007 (anomalie véhicule) : hypothèse à vérifier. | Anomalie | — |
| BR-VEH-031 | Fin de période mensuelle | Recalculer le coût d'exploitation par véhicule et le coût du parc (CALC-VEH-010/011). | Calcul | Alimente le tableau de bord. |

## D7. Contraventions (BR-CTR)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-CTR-001** | **Une contravention est enregistrée (EVT-CTR-001)** | **(1) créer automatiquement ses échéances (paiement, contestation) ; (2) créer une alerte (ALR-011) ; (3) rattacher la contravention au véhicule ; (4) rattacher la contravention au conducteur (tiers) ; (5) mettre à jour les statistiques (CALC-CTR-001).** | Automatisme | Traduit l'exemple direction. |
| BR-CTR-002 | Échéance de paiement proche | Alerte + tâche priorisée ; rappel du montant minoré si applicable. | Alerte | ALR-012. |
| BR-CTR-003 | Échéance de contestation proche | Alerte + tâche « contester ou renoncer ». | Alerte | Délai légal critique. |
| BR-CTR-004 | Contravention payée | Enregistrer la dépense (BR-FIN-021) ; supprimer les alertes liées ; mettre à jour les coûts. | Automatisme | — |
| BR-CTR-005 | Contestation déposée | Suivre le délai de traitement ; suspendre l'alerte de paiement le cas échéant. | Automatisme | ST-CTR-003. |
| BR-CTR-006 | Fin de période | Recalculer coût annuel, coût par véhicule, coût par conducteur (CALC-CTR-001). | Calcul | Statistiques. |
| BR-CTR-007 | Accès aux données de contraventions | Restreindre strictement (direction, gestionnaire de flotte) ; journaliser l'accès. | Validation/Sécurité | Données sensibles (RGPD renforcé). |

## D8. Espace Dirigeant (BR-DIR)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-DIR-001** | **Une tâche est créée (saisie ou automatisme) (EVT-DIR-001)** | **Calculer automatiquement son niveau de priorité (PRI-001) en tenant compte de : urgence, importance, impact financier, impact opérationnel, délai restant ; la placer dans la file ; produire son explication (INV-9).** | Priorité | Traduit l'exemple direction. |
| BR-DIR-002 | Événement porteur d'une action dirigeant (impayé, échéance, réserve, contravention, obligation…) | Créer automatiquement la tâche correspondante, rattachée à sa source, priorisée, dédoublonnée. | Automatisme | INV-5 (pas de doublon). |
| BR-DIR-003 | Validation demandée | Créer une entrée « à valider » priorisée ; bloquer l'acte engageant tant que non validé. | Validation | INV-7. |
| BR-DIR-004 | Signature demandée | Créer une entrée « à signer » ; préparer le document ; la signature engage (traçée). | Automatisme | Master Blueprint 16.4. |
| BR-DIR-005 | Obligation administrative/fiscale à échéance | Créer une tâche/alerte priorisée avec échéance et rappel. | Alerte | Référentiel d'obligations (configurable). |
| BR-DIR-006 | Début de journée | Générer le **brief quotidien** (WF-010, IA-020) : les points classés par priorité. | Workflow | Cœur de l'« OS du dirigeant ». |
| BR-DIR-007 | Tâche non traitée après son échéance | Escalader la priorité ; signaler l'oubli (ANO-011). | Anomalie/Priorité | — |
| BR-DIR-008 | Note prise par le dirigeant | Conserver, dater, permettre rattachement à un objet (chantier, client, véhicule). | Automatisme | — |

## D9. Documents (BR-DOC)

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| BR-DOC-001 | Document ajouté | Enregistrer la référence, l'empreinte, le rattachement ; proposer une catégorie (IA-041). | Automatisme | — |
| BR-DOC-002 | Document émis (facture, PV) | Rendre immuable et versionné ; toute évolution = nouvelle version. | Validation | INV-3. |
| BR-DOC-003 | Document à signer | Router vers la signature (BR-DIR-004) ; à la signature, émettre EVT-DOC-003. | Workflow | — |
| BR-DOC-004 | Échéance de conservation atteinte | Appliquer la politique de rétention (archivage/anonymisation). | Automatisme | RGPD. |

## D10. Calendrier (BR-CAL) — préparation, non développé

| ID | Déclencheur | Effet / Actions | Type | Notes |
|---|---|---|---|---|
| **BR-CAL-001** | **Un rendez-vous Apple Calendar est détecté (EVT-CAL-001, futur)** | **(1) le synchroniser en rendez-vous/échéance du cockpit ; (2) éviter les doublons (clé d'identité stable + dédoublonnage) ; (3) créer les rappels nécessaires (tâches/alertes).** | Automatisme | Traduit l'exemple direction. Architecture préparée (Master Blueprint ch. 40). |
| BR-CAL-002 | Conflit entre deux rendez-vous | Déclencher ANO-010 (conflit de planning) : hypothèse à vérifier. | Anomalie | — |
| BR-CAL-003 | Rendez-vous client détecté | Le remonter au brief quotidien (WF-010) et à la zone Dirigeant. | Automatisme | — |

---

# Partie E — Moteur de calcul (CALC)

> **Tous les chiffres officiels** sortent d'ici (INV-1). Déterministe, centralisé,
> testé. L'interface et l'IA **n'en produisent aucun**. Formules en langage
> naturel ; les paramètres (taux, seuils) sont des données versionnées (INV-8).

## E1. Finance

- **CALC-FIN-001 — Chiffrage d'une ligne / d'un devis.** Montant HT d'une ligne =
  quantité × prix unitaire − remise ; total HT = somme des lignes ; TVA par taux ;
  TTC = HT + TVA. Arrondi selon règle documentée (par ligne puis total). *Entrées :*
  lignes, taux TVA en vigueur, remises. *Sortie :* HT, TVA, TTC.
- **CALC-FIN-002 — CA facturé.** Somme des montants HT des factures émises sur une
  période, avoirs déduits. Recalculé sur EVT-FIN-006/011/040.
- **CALC-FIN-010 — Trésorerie prévisionnelle.** Solde de départ + encaissements
  attendus (échéances de factures non soldées) − décaissements attendus (dépenses
  et échéances à venir) sur l'horizon configuré. Recalcul sur EVT-FIN-006/008/014.
- **CALC-FIN-011 — Date d'échéance d'une facture.** Date d'émission + délai des
  conditions de paiement en vigueur. Gère fin de mois / jours ouvrés selon
  paramètre.
- **CALC-FIN-012 — Trésorerie réelle.** Solde effectif à partir des encaissements et
  décaissements enregistrés (base du rapprochement futur).
- **CALC-FIN-020 — Numéro légal de facture.** Séquence continue, sans trou,
  chronologique, par organisation, attribuée à l'émission. Robuste aux annulations
  (un numéro attribué n'est jamais réutilisé ; annulation = avoir).
- **CALC-FIN-030 — Statistiques financières.** Indicateurs agrégés (CA, marge
  moyenne, impayés, délais de paiement) pour les projections de pilotage.
- **CALC-FIN-040 — Montant d'une situation à l'avancement.** Montant du marché ×
  taux d'avancement retenu − situations antérieures. Règles précises à figer.
- **CALC-FIN-041 — Retenue de garantie.** Pourcentage configuré appliqué au montant
  de la situation, libéré selon les règles contractuelles.

## E2. Chantiers

- **CALC-CHA-001 — Marge (prévue et réalisée projetée).**
  Marge prévue = (budget vendu − déboursé prévu) ÷ budget vendu.
  Coût final projeté = si avancement ≥ seuil minimal (INV-8, évite l'instabilité en
  début de chantier) : coût réel ÷ avancement ; sinon : déboursé prévu.
  Marge réalisée projetée = (budget vendu − coût final projeté) ÷ budget vendu.
  *Explication attachée* (INV-9).
- **CALC-CHA-002 — Coût réel d'un chantier.** Somme des coûts imputés : main-d'œuvre
  (CALC-RH-001), achats et sorties de stock (CALC-STK-001), sous-traitance, dépenses
  rattachées.
- **CALC-CHA-010 — Avancement attendu à une date.** Selon le planning (linéaire ou
  jalonné) : sert à détecter le retard (ST-CHA-002).
- **CALC-CHA-020 — Reste à encaisser d'un chantier.** Montant facturé − encaissé ;
  alimente la trésorerie et le suivi client.

## E3. RH, Stock, CRM, Véhicules, Contraventions, Priorité

- **CALC-RH-001 — Coût d'une journée de travail.** Heures × taux horaire chargé du
  salarié (référentiel versionné) + majorations éventuelles. Affecté au chantier.
- **CALC-STK-001 — Valorisation d'une sortie de stock.** Selon la méthode de
  valorisation retenue (à figer) ; imputée au chantier.
- **CALC-CRM-001 — Solde d'un client.** Total facturé − total encaissé (factures
  non soldées). Répond à « combien me doivent mes clients ».
- **CALC-VEH-001 — Coût d'exploitation d'un véhicule.** Somme des dépenses
  rattachées (carburant, entretien, réparations, assurance, leasing,
  contraventions) sur une période.
- **CALC-VEH-002 — Consommation réelle.** Carburant consommé ÷ distance parcourue
  entre deux relevés.
- **CALC-VEH-010 — Coût au kilomètre.** Coût d'exploitation ÷ kilomètres parcourus.
- **CALC-VEH-011 — Coût total du parc.** Somme des coûts d'exploitation de tous les
  véhicules sur la période.
- **CALC-CTR-001 — Coûts de contraventions.** Coût annuel, par véhicule, par
  conducteur ; nombre d'infractions ; points perdus cumulés (donnée sensible).
- **CALC-PRI-001 — Score de priorité d'une tâche.** Voir Partie F (le moteur de
  priorité est décrit en détail).

> **Règle transversale des calculs (CALC-CORE-001).** Tout calcul officiel :
> (a) est déterministe et reproductible ; (b) utilise les paramètres **en vigueur à
> la date** concernée ; (c) journalise ses entrées et son résultat pour les actes
> engageants (Master Blueprint 15.5) ; (d) attache une **explication** exploitable.

---

# Partie F — Moteur de priorité (PRI)

Le moteur de priorité est le **cœur de l'« OS du dirigeant »** : chaque matin, il
sait ce qui est critique, urgent, ce qui peut attendre, ce qui présente un risque,
ce qui peut faire gagner ou perdre de l'argent.

## F1. Facteurs

Chaque tâche/élément est évalué sur **cinq facteurs**, chacun normalisé de 0 à 100 :

| Facteur | Définition | Exemple de source |
|---|---|---|
| **Urgence** | Proximité de l'échéance et criticité temporelle. | Délai de contestation à 2 jours = urgence élevée. |
| **Importance** | Enjeu stratégique/opérationnel intrinsèque. | Réception d'un gros chantier. |
| **Impact financier** | Montant en jeu (gain potentiel ou perte évitée), normalisé. | Facture impayée de montant élevé. |
| **Impact opérationnel** | Degré de blocage (chantier arrêté, véhicule non conforme, équipe bloquée). | Véhicule non conforme = blocage. |
| **Délai restant** | Temps disponible avant l'échéance (inverse : moins il reste, plus la priorité monte). | Obligation fiscale à J-30. |

- **PRI-001 — Calcul du score.** Score = somme **pondérée** des cinq facteurs. Les
  **poids** (somme = 100 %) sont des **paramètres administrables** (INV-8). Valeurs
  de départ à valider par la direction (Business Rules — question ouverte).
- **PRI-002 — Normalisation de l'impact financier.** Le montant en jeu est ramené à
  une échelle 0-100 par des paliers configurables (par exemple, palier « élevé »
  au-delà d'un seuil). Jamais de chiffre en dur.
- **PRI-003 — Facteur risque.** Un élément porteur d'un **risque** (juridique,
  trésorerie, conformité) reçoit un bonus de priorité configurable (« ce qui
  présente un risque » remonte).
- **PRI-004 — Facteur opportunité.** Un élément pouvant **faire gagner de l'argent**
  (devis à relancer proche de l'acceptation, situation à facturer) reçoit un bonus.
- **PRI-005 — Gain vs perte.** Le moteur distingue explicitement « peut faire gagner
  de l'argent » (opportunité) et « peut faire perdre de l'argent » (risque) : les
  deux sont étiquetés dans l'explication (INV-9).

## F2. Classement

- **PRI-010 — Matrice urgence × importance.** Quatre files, style Eisenhower :
  **Critique (faire maintenant)** = urgence haute + importance haute ;
  **Planifier** = importance haute + urgence basse ;
  **Déléguer** = urgence haute + importance basse ;
  **Différer** = urgence basse + importance basse.
- **PRI-011 — Tri intra-file.** À l'intérieur d'une file, tri par **score
  décroissant** (PRI-001).
- **PRI-012 — Ordre du tableau de bord.** Le tableau de bord du dirigeant **présente
  toujours** les éléments dans cet ordre de priorité (Critique d'abord), regroupés
  et expliqués. (Master Blueprint ch. 39.)
- **PRI-013 — Seuils de criticité.** Un élément dépassant un seuil de risque
  (trésorerie sous plancher, échéance légale dépassée, marge en dérive forte) est
  **forcé** en Critique, quel que soit son score.
- **PRI-014 — Explication obligatoire.** Chaque priorité affiche sa **raison** :
  facteurs déterminants, échéance, montant en jeu, action recommandée. (INV-9.)
- **PRI-015 — Anti-fatigue.** Le nombre d'éléments « Critique » présentés est borné
  (configurable) ; au-delà, regroupement et synthèse (« 5 échéances véhicules cette
  semaine »). L'objectif est **une poignée d'actions vraiment importantes**.
- **PRI-016 — Recalcul.** La priorité est recalculée à la création, à chaque
  changement d'un facteur (nouvelle échéance, paiement reçu, avancement), et chaque
  matin avant le brief (WF-010).

---

# Partie G — Moteur d'alertes (ALR)

Une alerte naît d'une **échéance** ou d'un **seuil**. Toutes les échéances du
produit (Master Blueprint 10.4) passent par cette mécanique unique.

- **ALR-001 — Source unique.** Toute alerte provient d'une échéance typée ou d'un
  seuil configurable ; jamais d'un test codé en dur dans l'interface.
- **ALR-002 — Anti-doublon.** Une même cause ne génère qu'une alerte active ; les
  répétitions sont regroupées (INV-5).
- **ALR-003 — Regroupement.** Les alertes d'un même objet (véhicule, chantier)
  sont regroupées en une entrée dépliable.
- **ALR-004 — Cycle de vie.** Une alerte est *Active → {Traitée | Expirée |
  Annulée}* ; sa disparition est **tracée** (jamais silencieuse).
- **ALR-010 — Échéance véhicule** (assurance/CT/entretien/vidange/pneus/leasing) :
  alerte à J-N (délai configurable par type). Voir BR-VEH-020.
- **ALR-011 — Contravention enregistrée** : alerte de suivi. Voir BR-CTR-001.
- **ALR-012 — Échéance de paiement/contestation d'une contravention** : alerte à
  J-N (délai légal critique). Voir BR-CTR-002/003.
- **ALR-020 — Échéance de facture** : alerte avant échéance. Voir BR-FIN-011.
- **ALR-021 — Facture impayée** : alerte à l'échéance dépassée. Voir BR-FIN-015.
- **ALR-022 — Impayé de montant élevé** : escalade dirigeant (priorité forcée).
- **ALR-030 — Chantier en retard** : voir BR-CHA-004.
- **ALR-031 — Réserve non levée** : voir BR-CHA-006.
- **ALR-040 — Obligation administrative/fiscale à échéance** : voir BR-DIR-005.
- **ALR-050 — Stock sous seuil** : voir BR-STK-002.
- **ALR-060 — Risque de trésorerie** : voir BR-FIN-032 (critique).
- **ALR-070 — Dérive de marge** : voir BR-FIN-031.
- **ALR-090 — Nettoyage d'alerte** : à la résolution de la cause (paiement,
  entretien réalisé, renouvellement), les alertes liées sont fermées et tracées.

---

# Partie H — Moteur d'intelligence et détection d'anomalies (ANO)

> **Principe (ANO-CORE-001).** Une anomalie est **une hypothèse à vérifier**, jamais
> un fait affirmé. Elle est présentée avec sa **raison** et une **action de
> vérification**. Elle n'entraîne **aucune** modification automatique de donnée
> officielle (INV-7, INV-10). Détection **déterministe** (seuils/règles) ;
> l'IA peut **enrichir** l'explication mais ne décide pas seule (Partie J).

| ID | Anomalie détectée | Signal déclencheur | Présentation |
|---|---|---|---|
| ANO-001 | **Dépense inhabituelle** | Montant hors des bornes habituelles du poste/fournisseur. | « Cette dépense semble inhabituelle (X vs habituel Y). Vérifier ? » |
| ANO-002 | **Dérive de marge** | Marge réalisée projetée < marge prévue − écart configurable. | Chantier, ampleur, cause probable, action. |
| ANO-003 | **Risque de trésorerie** | Trésorerie projetée sous le plancher sur l'horizon. | Date du creux, montant, leviers (relances, report). |
| ANO-004 | **Erreur de saisie (heures)** | Heures aberrantes (trop élevées/nulles). | À confirmer. |
| ANO-005 | **Incohérence de stock** | Écart d'inventaire, sortie > stock. | À vérifier. |
| ANO-006 | **Kilométrage incohérent** | Relevé inférieur au précédent ou saut anormal. | À vérifier ; historique conservé. |
| ANO-007 | **Anomalie véhicule** | Coût/consommation anormalement élevés vs catégorie. | Hypothèse (usure, conduite, fuite ?). |
| ANO-008 | **Doublon** | Facture/dépense/tiers potentiellement en double (mêmes montants/dates/références). | Proposer un rapprochement, pas une fusion automatique. |
| ANO-009 | **Hausse des coûts** | Tendance de coût d'un poste/fournisseur à la hausse. | Tendance, période, ampleur. |
| ANO-010 | **Conflit de calendrier** | Deux rendez-vous se chevauchent. | Proposer un arbitrage. |
| ANO-011 | **Oubli** | Tâche/échéance dépassée non traitée ; document attendu manquant. | Rappel priorisé. |
| ANO-020 | **Risque juridique simple** | Échéance légale dépassée (CT, assurance, délai de contestation). | Conséquence potentielle, action. |
| ANO-021 | **Baisse de marge (tendance)** | Marge moyenne en recul sur plusieurs chantiers/périodes. | Analyse de tendance. |

- **ANO-030 — Cycle d'une anomalie.** *Détectée → présentée → {Confirmée (devient une
  tâche/action) | Rejetée (tracée, sert à affiner les seuils)}*. Une anomalie
  rejetée n'est pas re-signalée à l'identique (apprentissage des seuils, INV-8).
- **ANO-031 — Pas d'action silencieuse.** Une anomalie ne modifie ni ne supprime
  jamais une donnée ; elle **propose**.

---

# Partie I — Workflows (WF)

Un workflow enchaîne plusieurs règles pour un processus complet. Chaque étape est
elle-même une règle référencée.

- **WF-001 — Du devis accepté au chantier.** EVT-FIN-003 → BR-CHA-001 (créer
  chantier) → reprise budget/déboursé → notifications → mise à jour CRM (BR-CRM-002).
- **WF-002 — Cycle de facturation.** Avancement/jalon → BR-FIN-016 (situation
  proposée) → validation humaine (INV-7) → émission (BR-FIN-012) → échéance
  (BR-FIN-011) → alerte (ALR-020) → paiement (BR-FIN-013) → mise à jour chantier.
- **WF-003 — Relance d'impayé.** ALR-021 → tâche priorisée → brouillon IA (IA-040)
  → validation → envoi → suivi → escalade (ALR-022) si sans effet.
- **WF-004 — Cycle de vie d'une contravention.** BR-CTR-001 → échéances/alertes →
  décision (payer/contester) → BR-CTR-004/005 → mise à jour coûts/statistiques.
- **WF-005 — Cycle d'entretien véhicule.** Seuil km/date → BR-VEH-010 (planifier) →
  alerte/tâche → réalisation (BR-VEH-011) → dépense rattachée → replanification.
- **WF-006 — Réception de chantier.** BR-CHA-005 → réserves → tâches de levée →
  garanties (échéances) → clôture (BR-CHA-007).
- **WF-010 — Brief quotidien du dirigeant.** Chaque matin : recalcul des priorités
  (PRI-016) → agrégation des éléments critiques/urgents/risques/opportunités →
  génération du brief (IA-020) → présentation ordonnée (PRI-012). Voir Partie J3.
- **WF-011 — Synchronisation calendrier (futur).** EVT-CAL-001 → BR-CAL-001
  (synchroniser, dédoublonner) → rappels → remontée au brief.

---

# Partie J — Copilote IA

> *BRN Pilot* est connecté à une **IA copilote** — **pas un simple chatbot**. Elle
> analyse les **données autorisées** pour **aider à piloter**. Toute cette partie
> est encadrée par des règles : l'IA est **utile, explicable, sécurisée,
> multi-fournisseur, proactive et fiable** — et **jamais** productrice d'un chiffre
> officiel.

## J1. Principes fondamentaux

- **IA-001 — Règle fondamentale : l'IA ne calcule jamais les chiffres officiels.**
  Tout montant, coût, marge, priorité, échéance **officiel** provient du moteur
  métier (Parties E, F). L'IA **reçoit** ces résultats pour les **expliquer,
  résumer, analyser, proposer** — jamais pour les produire ni les modifier.
  (Master Blueprint P6, D7 ; INV-1.)
- **IA-002 — Étiquetage systématique.** L'IA distingue et **étiquette** toujours :
  **Fait** (donnée vérifiable de la base), **Calcul** (résultat officiel du moteur),
  **Estimation** (approximation, incertitude assumée), **Recommandation** (avis à
  valider). Elle ne présente jamais une estimation comme un fait (INV-10).
- **IA-003 — Copilote, pas pilote.** L'IA propose ; l'humain décide. Aucune action
  engageante n'est exécutée sans validation (INV-7).
- **IA-004 — Périmètre de données.** L'IA n'accède qu'aux **données autorisées** de
  l'utilisateur qui la sollicite (mêmes droits que lui : rôles + attributs).
- **IA-005 — Traçabilité.** Chaque interaction IA (entrée, sortie, sources, modèle,
  version, coût) est journalisée (EVT-IA-001..003), pour l'audit et la maîtrise.

## J2. Niveaux d'autonomie

Trois niveaux, du plus sûr au plus engageant :

| Niveau | Nom | Ce que l'IA peut faire | Validation |
|---|---|---|---|
| **L0** | **Lecture** | Lire les données autorisées, expliquer, résumer, répondre, analyser des tendances. | Aucune (pas d'écriture). |
| **L1** | **Préparation** | Préparer un brouillon (mail, relance, tâche, catégorisation, rapport, rappel, proposition de rapprochement). | Rien n'est appliqué ; l'humain relit. |
| **L2** | **Exécution avec validation** | Déclencher une action **après validation humaine explicite** (créer la tâche, envoyer le mail préparé, classer le document). | **Validation obligatoire** avant tout effet. |

- **IA-010 — Niveau par défaut.** L0 (lecture). Le passage à L1/L2 est explicite et
  contextuel.
- **IA-011 — Actions sensibles.** Toute action **sensible** (financière, envoi
  externe, signature, modification de donnée officielle) reste en **L2 avec
  validation humaine**, sans exception (INV-7).
- **IA-012 — Aucune autonomie sur les chiffres.** L'IA n'a **aucun** niveau
  d'autonomie lui permettant de modifier un chiffre officiel (IA-001).

## J3. Brief quotidien du dirigeant

- **IA-020 — Génération.** Chaque matin (WF-010), l'IA génère un **briefing
  personnalisé** à partir des éléments **déjà priorisés par le moteur** (PRI). Elle
  **met en forme et explique** ; elle ne recalcule pas les priorités.
- **IA-021 — Contenu.** Le brief présente les points les plus importants du jour,
  par exemple : chantier en dérive de marge ; facture importante en retard ; risque
  de trésorerie ; rendez-vous client ; entretien véhicule ; contrôle technique ;
  contravention ; documents à signer ; validations ; appels urgents.
- **IA-022 — Structure de chaque point.** Chaque point est accompagné de :
  **niveau de priorité** (du moteur, PRI) ; **explication** ; **raison** ;
  **meilleure action recommandée**. La priorité et les montants viennent du moteur
  (IA-001) ; l'IA rédige l'explication et la recommandation.
- **IA-023 — Ton et personnalisation.** Le brief s'adresse nommément au dirigeant,
  va à l'essentiel, hiérarchise (le critique d'abord), et respecte l'anti-fatigue
  (PRI-015).
- **IA-024 — Honnêteté.** Si une donnée manque ou est incertaine, le brief le
  **dit** (IA-090) ; il ne comble jamais un vide par une invention.

## J4. Assistant conversationnel

- **IA-030 — Rôle.** Répondre aux questions du dirigeant à partir des **données
  autorisées** uniquement. Exemples : « Combien me doivent mes clients ? » (réponse
  = CALC-CRM-001 agrégé) ; « Quel chantier est le moins rentable ? » (tri par
  CALC-CHA-001) ; « Pourquoi la marge baisse ? » (explication d'ANO-002/021) ;
  « Quels véhicules coûtent le plus ? » (CALC-VEH-011) ; « Quels sont mes rendez-vous
  aujourd'hui ? » ; « Prépare un mail de relance » (L1) ; « Quels risques traiter
  aujourd'hui ? » (éléments Critiques du moteur) ; « Que dois-je faire cette
  semaine ? » (file priorisée).
- **IA-031 — Chiffres = moteur.** Toute réponse chiffrée **cite le résultat du
  moteur** (CALC/PRI) ; l'IA ne recalcule pas. Si le chiffre n'existe pas, elle le
  dit.
- **IA-032 — Sources citées.** Chaque réponse **cite ses sources** (documents,
  chantiers, factures consultés) — voir RAG (J8).
- **IA-033 — Respect des droits.** L'assistant ne révèle jamais une donnée hors du
  périmètre de l'utilisateur (IA-004). Une question hors droits reçoit un refus
  explicite, sans divulgation.
- **IA-034 — Rédaction assistée.** L'IA peut rédiger courriers, relances, comptes
  rendus (L1) ; l'envoi reste validé par un humain (L2, INV-7).

## J5. Actions proposées

- **IA-040 — Catalogue d'actions proposables.** L'IA peut **proposer** : créer une
  tâche ; préparer une relance ; préparer un mail ; classer un document ; rattacher
  une dépense ; proposer une catégorie ; préparer un rapport ; créer un rappel ;
  proposer un rapprochement bancaire.
- **IA-041 — Catégorisation / rattachement.** L'IA peut **suggérer** une catégorie
  de dépense ou un rattachement (chantier/véhicule) ; l'imputation officielle reste
  une décision validée (BR-FIN-021/022).
- **IA-042 — Validation obligatoire.** **Toute** action proposée est **validée avant
  exécution** (L2, INV-7). Une action refusée est tracée.
- **IA-043 — Réversibilité.** Une action exécutée après validation reste réversible
  selon les règles du domaine (ex. une tâche se supprime, un mail envoyé ne se
  « dé-envoie » pas — d'où la validation préalable).

## J6. Détection d'anomalies assistée

- **IA-050 — Rôle.** L'IA **enrichit** la détection déterministe (Partie H) :
  formuler l'hypothèse en langage clair, proposer des causes plausibles, suggérer la
  vérification. Elle ne **crée** pas une anomalie officielle sans le signal
  déterministe correspondant (ANO-CORE-001).
- **IA-051 — Hypothèse, jamais fait.** Une anomalie assistée est présentée comme
  **hypothèse à vérifier** (IA-002, INV-10).
- **IA-052 — Domaines.** Dépenses anormales, doublons, baisse de marge, hausse des
  coûts, erreurs de saisie, conflits de calendrier, kilométrages incohérents,
  anomalies véhicules, anomalies financières (miroir de la Partie H).

## J7. Architecture multi-fournisseur (AI Gateway)

- **IA-060 — Indépendance fournisseur.** *BRN Pilot* ne dépend d'**aucune** IA
  spécifique. Une **couche AI Gateway** unique fait l'intermédiaire entre le
  logiciel et le(s) fournisseur(s).
- **IA-061 — Fournisseurs branchables.** Le Gateway permet de connecter
  ultérieurement, **sans modifier le reste du logiciel** : Claude, ChatGPT, Gemini,
  **modèles locaux**. Le choix se fait par configuration (INV-8).
- **IA-062 — Contrat interne stable.** Les modules parlent au Gateway via un
  **contrat interne stable** (demande, contexte autorisé, réponse typée) ; changer
  de fournisseur ne change pas ce contrat.
- **IA-063 — Sélection et repli.** Le Gateway peut router selon la tâche (coût,
  confidentialité, capacité) et **basculer** sur un autre fournisseur en cas
  d'indisponibilité (dégradation gracieuse).
- **IA-064 — Dégradation gracieuse.** Si aucune IA n'est disponible, *BRN Pilot*
  fonctionne **exactement** comme sans IA : les moteurs déterministes (calculs,
  priorités, alertes, anomalies) restent pleinement opérationnels (Master Blueprint
  24.3).
- **IA-065 — Souveraineté et localisation.** Le Gateway applique les règles de
  confidentialité (J9) quel que soit le fournisseur ; traitement en Europe et/ou
  **modèle local** privilégiés pour les données sensibles.

## J8. Architecture RAG (récupération augmentée)

- **IA-070 — Rôle.** L'IA peut **consulter**, selon les droits, un corpus de
  documents et de données pour fonder ses réponses : devis, factures, contrats,
  rapports, documents véhicules, procédures, **Business Rules Bible**, **Master
  Blueprint**.
- **IA-071 — Récupération respectueuse des droits.** La récupération ne renvoie que
  ce que l'utilisateur a le droit de voir (IA-004) ; le filtrage par droits est
  appliqué **avant** l'envoi au modèle.
- **IA-072 — Citation des sources.** Chaque réponse fondée sur le corpus **cite les
  sources** utilisées (référence consultable). Une affirmation sans source est
  signalée comme telle.
- **IA-073 — Fraîcheur.** Les données chiffrées proviennent du moteur (temps réel,
  IA-031) ; le RAG sert surtout au **contexte documentaire** (contrats, procédures,
  règles), pas à recalculer des montants.
- **IA-074 — Le RAG connaît les règles.** En indexant cette Bible et le Master
  Blueprint, l'IA peut **expliquer le fonctionnement** de *BRN Pilot* lui-même
  (« pourquoi cette priorité ? », « quelle règle s'applique ? ») en citant les
  identifiants de règles.

## J9. Sécurité IA

- **IA-080 — Minimisation.** N'envoyer au fournisseur que le **strict contexte
  nécessaire** à la tâche, filtré par droits ; jamais de données sensibles inutiles.
- **IA-081 — Journalisation.** Toute requête/réponse IA est journalisée (entrée,
  sortie, modèle, version, coût) ; accès restreint.
- **IA-082 — Contrôle des droits.** L'IA hérite des droits de l'utilisateur ; aucune
  élévation de privilège via l'IA.
- **IA-083 — Séparation règles système / documents utilisateurs.** Les
  **instructions système** (comportement, garde-fous) sont **strictement séparées**
  du contenu utilisateur/documents ; le contenu récupéré (RAG) est traité comme
  **donnée**, jamais comme instruction.
- **IA-084 — Protection contre l'injection d'instructions (prompt injection).** Le
  contenu des documents et des messages ne peut pas **redéfinir** le comportement de
  l'IA ni ses garde-fous ; toute tentative est ignorée et signalée.
- **IA-085 — Aucune clé API dans le frontend.** Les identifiants des fournisseurs
  IA vivent **côté serveur** (Gateway), jamais dans l'interface (Master Blueprint
  ch. 20).
- **IA-086 — Aucune donnée sensible inutile.** Les données personnelles/sensibles
  (contraventions, points, RH) ne sont transmises que si strictement nécessaires et
  autorisées ; anonymisation/masquage privilégiés.
- **IA-087 — Rétention côté fournisseur.** Contractualiser l'absence de rétention et
  d'entraînement sur les données transmises (sous-traitant, Master Blueprint 24.3).

## J10. Fiabilité et honnêteté

L'IA ne devra **jamais** :

- **IA-090 — Inventer un chiffre.** Aucun montant/quantité inventé : les chiffres
  viennent du moteur (IA-001) ou sont déclarés indisponibles.
- **IA-091 — Transformer une hypothèse en fait.** Une estimation/anomalie reste
  étiquetée comme telle (IA-002, INV-10).
- **IA-092 — Masquer une incertitude.** L'incertitude est **explicitée** ; l'absence
  de donnée est dite.
- **IA-093 — Modifier une donnée officielle sans validation.** Toute écriture passe
  par L2 + validation humaine (INV-7).
- **IA-094 — Distinguer toujours** : **fait / calcul / estimation / recommandation**
  (IA-002). C'est la condition de la confiance.
- **IA-095 — Mesure de qualité.** Le taux d'acceptation des propositions IA est
  suivi ; une IA dont les suggestions sont massivement corrigées est revue ou
  désactivée (Master Blueprint 24). Une IA qui détruit la confiance est retirée.

---

# Partie K — Index et traçabilité

## K1. Familles de règles et volumétrie (v1.0)

| Famille | Préfixe | Portée |
|---|---|---|
| Gouvernance | GOV / INV | Invariants et cycle de vie des règles. |
| Événements | EVT | Catalogue des faits métier déclencheurs. |
| Transitions d'état | ST | Machines à états des entités engageantes. |
| Règles métier | BR | Automatismes et validations par domaine. |
| Calculs officiels | CALC | Tous les chiffres officiels (déterministes). |
| Priorité | PRI | Moteur de priorisation du cockpit. |
| Alertes | ALR | Échéances et seuils. |
| Anomalies | ANO | Détections présentées comme hypothèses. |
| Workflows | WF | Enchaînements complets. |
| IA | IA | Copilote : autonomie, brief, assistant, RAG, sécurité, fiabilité. |

> La v1.0 pose la **structure complète du cerveau** et un premier corpus de
> plusieurs centaines de règles couvrant tous les domaines V1. Les versions
> suivantes **densifient** chaque domaine (règles de détail) au fil de la conception,
> **sans jamais** en retirer en silence (GOV-004).

## K2. Traçabilité vers le Master Blueprint

| Thème | Business Rules Bible | Master Blueprint |
|---|---|---|
| Calculs centralisés, rien dans l'UI | INV-1, Partie E, IA-001 | P6, D7, ch. 15 |
| Événements comme colonne vertébrale | Partie B, INV-4 | ch. 13, D5, D12 |
| Priorisation intelligente | Partie F | ch. 38, D28 |
| Alertes / échéances unifiées | Partie G | ch. 10.4, 14 |
| Détection d'anomalies | Partie H | ch. 24, 32 |
| IA copilote (Gateway, RAG, sécurité) | Partie J | ch. 24 |
| Numérotation légale des factures | CALC-FIN-020, BR-FIN-012 | 15.6, D23 |
| Traçabilité / audit | INV-6 | ch. 19, D10 |
| Validation humaine des actes engageants | INV-7, IA-011/042 | ch. 14, 24 |

## K3. Règle d'or (rappel)

> **Aucune logique métier importante n'est codée sans figurer dans cette Bible
> (P13, GOV-001).** Le code cite l'identifiant de la règle qu'il implémente. Les
> chiffres officiels sortent du moteur (INV-1). L'IA assiste, explique et propose ;
> elle ne calcule ni ne décide seule (Partie J).

---

## Fin du document

> **BRN PILOT — Business Rules Bible v1.0.** Le cerveau de *BRN Pilot* : le
> comportement du logiciel décidé **avant** son développement. Document normatif, en
> construction, sans code, sans interface, sans base de données.
>
> Prochaines étapes proposées : densifier chaque domaine (objectif : plusieurs
> centaines de règles de détail supplémentaires), puis produire la **Data Bible**
> (les données que ces règles manipulent) et l'**API Bible** (les contrats qui les
> exposent).
