# BRN PILOT — AUTOMATION BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **tous les
> automatismes** de *BRN Pilot* : déclencheurs, événements, réactions, délais,
> synchronisations, notifications, traitements asynchrones, tâches planifiées, et
> l'**écosystème d'agents IA** avec son **orchestrateur**.
>
> **Complémentarité.** La **Business Rules Bible** définit *quoi et pourquoi* (la
> logique des règles). La **Automation Bible** définit *comment ça s'exécute* (les
> mécanismes : quand, avec quel délai, en synchrone ou en tâche de fond, avec quelles
> notifications, quelle reprise sur erreur, quelle possibilité d'annulation). Les
> deux se citent mutuellement, sans se dupliquer.
>
> **Règle cardinale.** *BRN Pilot* automatise le **maximum de tâches répétitives
> sans jamais perdre le contrôle humain.* **Aucune action sensible n'est exécutée
> sans validation.**
>
> **Ce document ne contient aucun code.** Nous restons en phase de conception.
>
> **Statut :** v1.0 — référence en cours de constitution.
> **Cohérence :** aligné sur Master Blueprint v1.1, Business Rules Bible v1.0, Data
> Bible v1.0, Security Bible v1.0, Product Bible v1.0.

---

## Table des matières

**Partie A — Fondations**
- A1. Objectif et portée
- A2. Principes d'automatisation
- A3. Anatomie d'un automatisme (9 champs obligatoires)
- A4. Taxonomie des déclencheurs
- A5. Sensibilité et validation humaine
- A6. Gouvernance

**Partie B — Infrastructure d'exécution**
- B1. Synchrone vs asynchrone
- B2. File de messages & travailleurs
- B3. Tâches planifiées
- B4. Notifications
- B5. Synchronisations (internes & externes)
- B6. Gestion des erreurs et reprise
- B7. Idempotence & anti-boucle
- B8. Historique & journalisation des automatismes

**Partie C — Catalogue des automatismes par domaine** (AUTO-…)
- C1. Devis · C2. Factures · C3. Clients · C4. Fournisseurs · C5. Dépenses ·
  C6. Trésorerie · C7. Chantiers · C8. Véhicules · C9. Entretiens ·
  C10. Contraventions · C11. Tâches · C12. Calendrier Apple · C13. IA ·
  C14. Documents · C15. Alertes · C16. Utilisateurs · C17. Sécurité

**Partie D — Tâches planifiées (catalogue)**

**Partie E — Agents IA & Orchestrateur**
- E1. Principes des agents
- E2. L'Orchestrateur IA
- E3. Les agents (Finance, Chantier, Dirigeant, Véhicules, Documents, Administratif, Planning)
- E4. Interaction agents ↔ moteurs déterministes
- E5. Sécurité des agents

**Partie F — Matrice de validation**

**Partie G — Traçabilité vers les autres documents fondateurs**

> **Convention.** Chaque automatisme porte un identifiant `AUTO-<DOM>-NNN`, chaque
> agent `AG-<NOM>`, chaque tâche planifiée `SCHED-NNN` — stables, jamais recyclés.

---

# Partie A — Fondations

## A1. Objectif et portée

Définir **tous les déclencheurs automatiques**, les **événements** qui les
activent, les **réactions**, les **délais**, les **synchronisations**, les
**notifications**, les **traitements asynchrones** et les **tâches planifiées** —
ainsi que les **agents IA** qui assistent (et jamais ne décident seuls).

Un **automatisme** est un enchaînement d'actions déclenché sans intervention
humaine directe. Il **applique** une ou plusieurs règles de la Business Rules Bible
(`BR-…`, `WF-…`) et produit ses effets via les moteurs déterministes (`CALC-…`,
`PRI-…`, `ALR-…`).

## A2. Principes d'automatisation

| # | Principe | Énoncé |
|---|---|---|
| AUTO-P1 | **Contrôle humain préservé** | Aucune action **sensible** n'est exécutée sans **validation humaine** (Product P07, Business Rules INV-7). |
| AUTO-P2 | **Fiabilité d'abord** | On n'automatise que ce qui est **sûr et répétitif** (Product P06). Une automatisation hasardeuse est proscrite. |
| AUTO-P3 | **Idempotence** | Rejouer un automatisme ne produit ni doublon ni double effet. |
| AUTO-P4 | **Anti-boucle** | Un automatisme qui émet un événement ne peut pas re-déclencher sa propre chaîne à l'infini (détection de cycle). |
| AUTO-P5 | **Non bloquant** | Les traitements longs sont **asynchrones** ; l'utilisateur n'attend jamais. |
| AUTO-P6 | **Réversibilité** | Un automatisme est réversible autant que possible ; sinon, il exige une validation **préalable** (car l'irréversible ne se rattrape pas). |
| AUTO-P7 | **Traçabilité totale** | Tout automatisme laisse une trace (historique + journal) : quoi, quand, déclenché par quoi, résultat. |
| AUTO-P8 | **Explicabilité** | Un automatisme qui crée une tâche/alerte en fournit la **raison** (Product P08). |
| AUTO-P9 | **Limitation de débit** | Les actions de masse sont plafonnées (anti-emballement, anti-spam). |
| AUTO-P10 | **Testable à blanc** | Un automatisme peut être **simulé** (mode « à blanc ») pour voir ce qu'il aurait fait, sans l'exécuter. |
| AUTO-P11 | **Dégradation gracieuse** | Si un composant (IA, connecteur externe) est indisponible, les automatismes déterministes continuent ; l'IA optionnelle est ignorée. |
| AUTO-P12 | **Configuration, pas code** | Délais, seuils, fréquences, canaux sont des **paramètres** administrables et versionnés. |

## A3. Anatomie d'un automatisme (9 champs obligatoires)

Chaque automatisme du catalogue (Partie C) est décrit par **neuf champs** :

1. **Déclencheur** — ce qui l'active (événement, échéance, planification, seuil).
2. **Préconditions** — l'état requis pour qu'il s'exécute.
3. **Vérifications** — contrôles réalisés avant d'agir (droits, cohérence,
   doublons).
4. **Traitement** — les actions effectuées, dans l'ordre (citant `BR-…`/`CALC-…`).
5. **Notifications** — qui est prévenu, par quel canal.
6. **Historique** — ce qui est conservé (Data Bible : événement, historique).
7. **Annulation** — comment on revient en arrière (ou pourquoi impossible → d'où la
   validation préalable).
8. **Journalisation** — la trace technique produite (Security Bible F1).
9. **Gestion des erreurs** — réessais, mise en file d'échec, alerte (B6).

> **Défauts transverses.** Sauf mention contraire, tout automatisme respecte les
> règles B6 (erreurs), B7 (idempotence/anti-boucle) et B8 (historique/journal). Les
> blocs de la Partie C précisent l'essentiel et signalent les exceptions.

## A4. Taxonomie des déclencheurs

| Type | Description | Exemple |
|---|---|---|
| **Événement** | Un fait métier (`EVT-…`) survient. | *Facture émise* → créer l'échéance. |
| **Planifié (récurrent)** | Une horloge (tâche planifiée, Partie D). | Chaque matin → brief du dirigeant. |
| **Échéance** | Une date-butoir approche/est dépassée. | Contrôle technique à J-30 → alerte. |
| **Seuil** | Une valeur franchit une limite. | Trésorerie sous plancher → alerte critique. |
| **Manuel** | Une action utilisateur lance un traitement de fond. | Import Excel → traitement asynchrone. |
| **Externe** | Un signal d'un partenaire (connecteur). | Rendez-vous Apple Calendar détecté (futur). |

## A5. Sensibilité et validation humaine

Chaque automatisme a un **mode d'exécution** :

| Mode | Définition | Exemples |
|---|---|---|
| **Automatique** | S'exécute seul (action **sûre**, réversible, non engageante). | Créer une échéance/tâche, recalculer un indicateur, envoyer une notification interne, classer par défaut. |
| **Préparation** | Prépare un **brouillon** ; rien n'est appliqué. | Rédiger une relance, proposer une commande de réappro, proposer une catégorie de dépense. |
| **Validation requise** | Ne s'exécute qu'après **validation humaine explicite**. | Émettre une facture/situation, envoyer un e-mail externe, payer, signer, commander, modifier une donnée officielle, exporter des données personnelles. |

> **Règle AUTO-VAL-001.** Toute action **engageante** (financière, envoi externe,
> signature, commande, modification officielle) est en **Validation requise**. La
> séparation des droits (Security SEC-SOD) s'applique : au-delà d'un seuil, l'auteur
> ne peut pas s'auto-valider.

## A6. Gouvernance

- **AUTO-GOV-001 — Source unique.** Aucun automatisme important hors de ce
  document ; le code cite l'identifiant `AUTO-…`.
- **AUTO-GOV-002 — Règles = données.** Les paramètres (délais, seuils, fréquences,
  canaux) sont administrables (AUTO-P12), versionnés.
- **AUTO-GOV-003 — Ajout/retrait.** Identifiants stables ; un automatisme retiré est
  marqué abrogé, jamais recyclé.
- **AUTO-GOV-004 — Revue.** Les automatismes sont revus périodiquement (utilité,
  taux de déclenchement, faux positifs, fatigue d'alerte).

---

# Partie B — Infrastructure d'exécution

## B1. Synchrone vs asynchrone

- **B1-1 — Synchrone** : ce qui doit répondre immédiatement à l'utilisateur
  (validation d'une saisie, lecture). Rapide, borné.
- **B1-2 — Asynchrone** : tout le reste (automatismes, envois, imports volumineux,
  calculs d'alertes, préparation IA, synchronisations). **Ne bloque jamais**
  l'utilisateur (AUTO-P5, Master Blueprint 8.3).
- **B1-3 — Règle.** Un automatisme déclenché par un événement s'exécute en
  **asynchrone** par défaut ; la réponse à l'utilisateur ne l'attend pas.

## B2. File de messages & travailleurs

- **B2-1 — File.** Les événements et tâches asynchrones passent par une **file de
  messages** ; des **travailleurs** les consomment.
- **B2-2 — Fiabilité.** Livraison **au moins une fois** ; consommateurs
  **idempotents** (B7). Un événement écrit avec sa donnée est publié de façon fiable
  (boîte d'envoi transactionnelle, Master Blueprint 13.4).
- **B2-3 — Ordonnancement.** Les traitements d'un même agrégat respectent l'ordre
  causal (identifiants de corrélation/causalité).
- **B2-4 — Concurrence maîtrisée.** Débit et parallélisme bornés (AUTO-P9).

## B3. Tâches planifiées

- **B3-1 — Planificateur.** Un planificateur déclenche les traitements **récurrents**
  (Partie D) : quotidiens, périodiques, à heure fixe.
- **B3-2 — Robustesse.** Une exécution manquée (panne) est rattrapée ; pas de double
  exécution (idempotence).
- **B3-3 — Fenêtres.** Les traitements lourds s'exécutent hors des heures de forte
  activité quand c'est possible.

## B4. Notifications

- **B4-1 — Canaux.** In-app (par défaut), e-mail, notification mobile (push). SMS en
  réserve pour le critique.
- **B4-2 — Préférences.** Chaque utilisateur/organisation configure ses canaux et
  seuils (AUTO-P12).
- **B4-3 — Anti-fatigue.** **Regroupement** (plusieurs échéances d'un même véhicule
  = une notification), **anti-doublon**, **hiérarchisation** (le critique d'abord).
  Objectif : peu de notifications, mais justes (Business Rules PRI-015).
- **B4-4 — Sécurité.** Aucune donnée très sensible (N4) en clair dans une
  notification externe ; on notifie « une action requise », le détail est dans
  l'application.
- **B4-5 — Traçabilité.** Chaque notification est journalisée (envoyée, lue).

## B5. Synchronisations (internes & externes)

- **B5-1 — Internes (entre modules).** Par **événements** uniquement (jamais d'accès
  direct) ; cohérence éventuelle. Ex. : une dépense véhicule met à jour le coût du
  véhicule et la trésorerie via événements.
- **B5-2 — Externes (connecteurs).** Comptabilité, banque, **Apple Calendar**,
  **BRN Visite Technique**, signature. Chaque connecteur **isole** le partenaire :
  une panne externe n'affecte pas le cœur (file d'attente + réessais).
- **B5-3 — Sens et fréquence.** Chaque synchronisation précise son **sens** (entrant,
  sortant, bidirectionnel), sa **fréquence** (temps réel via événement, ou périodique
  planifiée) et sa **stratégie de dédoublonnage**.
- **B5-4 — Idempotence et rejeu.** Les synchronisations sont idempotentes ; en cas
  de coupure, elles se rattrapent par rejeu sans doublon.
- **B5-5 — Sécurité.** Identités de service dédiées, à moindre privilège, secrets au
  coffre (Security D2, C7). *Apple Calendar : lecture seule d'abord, rien développé à
  ce stade (Master Blueprint 40).*

## B6. Gestion des erreurs et reprise

- **B6-1 — Réessais avec temporisation croissante.** Une erreur transitoire est
  réessayée automatiquement (délais croissants), dans une limite.
- **B6-2 — File d'échec.** Après épuisement des réessais, le traitement part en
  **file d'échec** analysable (jamais perdu en silence).
- **B6-3 — Alerte technique.** Une file qui grossit ou un connecteur en panne
  **alerte** le responsable technique (Security F5, distinct des alertes métier).
- **B6-4 — Pas d'effet partiel.** Un automatisme construit son résultat **avant**
  d'écrire ; en cas d'échec, il n'a rien laissé à moitié fait (Business Rules 25.2).
- **B6-5 — Reprise sûre.** La reprise s'appuie sur l'idempotence (B7) : rejouer est
  sans danger.

## B7. Idempotence & anti-boucle

- **B7-1 — Clé d'idempotence.** Chaque déclenchement porte une clé ; le même
  déclenchement traité deux fois ne produit qu'un effet.
- **B7-2 — Anti-boucle.** La chaîne d'événements est suivie (causalité) ; un cycle
  est détecté et rompu ; un automatisme ne se réveille pas lui-même indéfiniment.
- **B7-3 — Plafonds.** Nombre d'actions par automatisme et par période plafonné
  (AUTO-P9).

## B8. Historique & journalisation des automatismes

- **B8-1 — Événement de domaine.** Un automatisme qui modifie une donnée engageante
  **émet un événement** (Data Bible E-EVENEMENT).
- **B8-2 — Historique.** Les modifications engageantes conservent l'état antérieur
  (Data Bible E-HISTO).
- **B8-3 — Journal d'exécution.** Chaque exécution est journalisée : automatisme,
  déclencheur, préconditions évaluées, actions, résultat, durée, erreurs.
- **B8-4 — Audit.** Les automatismes touchant des actes engageants ou des données
  N4 produisent une entrée d'**audit** (Security F2).

---

# Partie C — Catalogue des automatismes par domaine

> Format compact des 9 champs (A3). *Décl.* = déclencheur, *Précond.* =
> préconditions, *Vérif.* = vérifications, *Trait.* = traitement, *Notif.* =
> notifications, *Hist.* = historique, *Annul.* = annulation, *Journal.* =
> journalisation, *Err.* = gestion des erreurs, *Mode* = automatique / préparation /
> validation requise (A5). « std » renvoie aux défauts transverses (B6-B8).

## C1. Devis

**AUTO-DEV-001 — Relance de devis sans réponse**
- Décl. : planifié quotidien + `Devis.Émis` ancien (délai configurable).
- Précond. : devis `Émis`, non accepté/refusé, délai de relance atteint.
- Vérif. : pas de relance déjà en cours ; droits ; anti-doublon.
- Trait. : créer une **tâche priorisée** (BR-FIN-003, PRI-001) ; **préparer** un
  brouillon de relance (Agent Finance / IA-040).
- Notif. : commercial + dirigeant (in-app).
- Hist. : tâche tracée. Annul. : la tâche/brouillon se supprime. Journal. : std.
- Err. : std. **Mode : Préparation** (l'envoi au client est en Validation requise).

**AUTO-DEV-002 — Expiration de devis**
- Décl. : échéance de validité dépassée. Précond. : devis `Émis`.
- Vérif. : droits, statut. Trait. : passer `Expiré` (ST-DEVIS-004) ; proposer
  relance ou clôture ; mettre à jour l'opportunité (BR-CRM-003).
- Notif. : commercial. Hist./Journal. : std. Annul. : réémission possible.
- Err. : std. **Mode : Automatique** (changement d'état interne, non engageant).

## C2. Factures

**AUTO-FAC-001 — Effets de l'émission d'une facture**
- Décl. : `Facture.Créée` (BR-FIN-010). Précond. : facture émise, numéro légal
  attribué (CALC-FIN-020).
- Vérif. : cohérence des montants (CALC-FIN-001) ; unicité du numéro.
- Trait. : créer l'échéance de paiement (CALC-FIN-011) ; recalculer CA (CALC-FIN-002)
  et trésorerie prévisionnelle (CALC-FIN-010) ; mettre à jour le solde client
  (CALC-CRM-001) ; créer l'alerte d'échéance (ALR-020).
- Notif. : comptable (in-app). Hist. : facture immuable + événement. Annul. :
  **non** (facture émise ; correction = avoir, AUTO-FAC-003). Journal./Err. : std.
- **Mode : Automatique** (les effets dérivés), mais **l'émission elle-même est en
  Validation requise** (AUTO-VAL-001).

**AUTO-FAC-002 — Passage en impayé & relance**
- Décl. : échéance dépassée, solde > 0. Précond. : facture `Émise`.
- Vérif. : solde réel, pas de paiement en cours de rapprochement.
- Trait. : passer `Impayée` (ST-FAC-004) ; alerte impayé (ALR-021) ; créer une tâche
  de relance priorisée ; **préparer** une relance graduée (Agent Finance, WF-003) ;
  escalade dirigeant si montant élevé (ALR-022).
- Notif. : comptable + dirigeant. Hist./Journal./Err. : std. Annul. : retour à
  `Payée` si paiement enregistré (AUTO-FAC-004). **Mode : Préparation** (envoi
  externe validé).

**AUTO-FAC-003 — Situation de travaux due**
- Décl. : `Chantier.AvancementMisÀJour` franchit un jalon. Précond. : chantier actif.
- Vérif. : jalon non déjà facturé. Trait. : **préparer** une situation (CALC-FIN-040/041)
  à valider. Notif. : comptable, conducteur. **Mode : Validation requise.**
- Annul. : brouillon supprimable avant validation. Hist./Journal./Err. : std.

**AUTO-FAC-004 — Effets du paiement**
- Décl. : `Facture.Payée` (BR-FIN-013). Précond. : encaissement enregistré.
- Vérif. : montant = solde dû (sinon paiement partiel, AUTO-FAC-005).
- Trait. : mettre à jour trésorerie réelle (CALC-FIN-012) ; recalculer prévisions et
  statistiques ; **fermer** les alertes liées (ALR-090) ; mettre à jour le chantier
  (CALC-CHA-020). Notif. : comptable. **Mode : Automatique.** Hist./Journal./Err. : std.

## C3. Clients

**AUTO-CLI-001 — Mise à jour du solde client**
- Décl. : `Facture.Créée`, `Paiement.Reçu`, `Avoir.Émis`. Trait. : recalculer le
  solde (CALC-CRM-001) ; rafraîchir les projections. Notif. : aucune (donnée de
  fond). **Mode : Automatique.** Hist./Journal./Err. : std.

**AUTO-CLI-002 — Relance client inactif**
- Décl. : planifié ; client sans interaction depuis un délai. Trait. : **préparer**
  une relance commerciale (tâche + brouillon). Notif. : commercial. **Mode :
  Préparation.**

## C4. Fournisseurs

**AUTO-FOU-001 — Rapprochement d'une dépense fournisseur**
- Décl. : `Depense.Créée` avec fournisseur. Vérif. : détection de **doublon**
  potentiel (ANO-008). Trait. : rattacher au fournisseur ; **proposer** une
  catégorie (Agent Documents/Finance). Notif. : comptable si doublon suspecté.
- **Mode : Automatique** (rattachement) + **Préparation** (catégorie proposée).

## C5. Dépenses

**AUTO-DEP-001 — Effets d'une dépense**
- Décl. : `Depense.Créée` (BR-FIN-020). Précond. : dépense valide et rattachée.
- Vérif. : rattachement présent (chantier/véhicule/frais généraux) ; montant
  cohérent (ANO-001 si anormal).
- Trait. : mettre à jour coût réel du chantier (CALC-CHA-002) et marge (CALC-CHA-001) ;
  ou coût du véhicule (CALC-VEH-001) ; mettre à jour la trésorerie (CALC-FIN-010) et
  les projections. Notif. : conducteur/gestionnaire concerné si dérive.
- **Mode : Automatique.** Annul. : correction tracée (jamais d'effacement). Hist./
  Journal./Err. : std.

**AUTO-DEP-002 — Dépense anormale**
- Décl. : dépense hors bornes du poste. Trait. : créer une **hypothèse d'anomalie**
  (ANO-001) à vérifier ; tâche priorisée. Notif. : dirigeant/comptable. **Mode :
  Automatique** (signalement, aucune modification).

## C6. Trésorerie

**AUTO-TRE-001 — Recalcul de trésorerie prévisionnelle**
- Décl. : tout événement financier (facture, paiement, dépense, échéance) + planifié
  quotidien. Trait. : recalculer la projection (CALC-FIN-010). Notif. : aucune (fond).
  **Mode : Automatique.** Err. : std.

**AUTO-TRE-002 — Risque de trésorerie**
- Décl. : projection sous le plancher configuré. Vérif. : seuil, horizon. Trait. :
  **anomalie** risque de trésorerie (ANO-003) ; alerte **critique** (ALR-060) ; tâche
  prioritaire forcée (PRI-013) ; l'Agent Dirigeant **propose** des leviers (relances,
  report). Notif. : dirigeant (critique). **Mode : Automatique** (alerte) +
  **Préparation** (leviers proposés).

## C7. Chantiers

**AUTO-CHA-001 — Création du chantier**
- Décl. : `Devis.Accepté` (WF-001). Vérif. : devis accepté, non déjà converti.
  Trait. : créer le chantier ; reprendre budget/déboursé ; mettre à jour le CRM.
  Notif. : conducteur, dirigeant. **Mode : Automatique.** Annul. : suppression logique
  si créé par erreur. Hist./Journal./Err. : std.

**AUTO-CHA-002 — Détection de retard**
- Décl. : planifié quotidien ; avancement < attendu (CALC-CHA-010). Trait. : marquer
  `EnRetard` (ST-CHA-002) ; alerte (ALR-030) ; tâche priorisée. Notif. : conducteur,
  dirigeant. **Mode : Automatique.**

**AUTO-CHA-003 — Dérive de marge**
- Décl. : recalcul de marge (après dépense/journée) ; écart > seuil. Trait. :
  **anomalie** dérive (ANO-002) ; alerte (ALR-070) ; l'Agent Chantier **explique** la
  cause probable. Notif. : dirigeant. **Mode : Automatique** (alerte) +
  **Préparation** (analyse).

**AUTO-CHA-004 — Réserve non levée**
- Décl. : échéance de levée dépassée. Trait. : alerte (ALR-031) ; tâche priorisée.
  Notif. : conducteur. **Mode : Automatique.**

## C8. Véhicules

**AUTO-VEH-001 — Génération des échéances à l'ajout**
- Décl. : `Véhicule.Ajouté`. Trait. : créer les échéances connues (assurance,
  contrôle technique, leasing) ; planifier les entretiens. Notif. : gestionnaire de
  flotte. **Mode : Automatique.** Hist./Journal./Err. : std.

**AUTO-VEH-002 — Échéance véhicule proche**
- Décl. : échéance (assurance/CT/entretien/vidange/pneus/leasing) à J-N configurable
  (BR-VEH-020). Vérif. : échéance active, non traitée, anti-doublon.
- Trait. : alerte (ALR-010) ; **tâche** priorisée (PRI-001) ; regroupement par
  véhicule (B4-3). Notif. : gestionnaire de flotte (+ dirigeant si critique).
- **Mode : Automatique.** Annul. : fermeture à la réalisation/renouvellement (ALR-090).

**AUTO-VEH-003 — Non-conformité**
- Décl. : échéance dépassée (CT/assurance). Trait. : passer `NonConforme`
  (ST-VEH-002) ; priorité **critique** ; **anomalie** risque juridique (ANO-020).
  Notif. : dirigeant, gestionnaire. **Mode : Automatique.**

**AUTO-VEH-004 — Kilométrage incohérent**
- Décl. : `Kilométrage.Relevé` < précédent ou saut anormal. Trait. : **anomalie**
  (ANO-006) à vérifier ; historique conservé (jamais écrasé). **Mode : Automatique**
  (signalement).

## C9. Entretiens

**AUTO-ENT-001 — Entretien dû au kilométrage**
- Décl. : `Kilométrage.Relevé` atteint le seuil d'un entretien périodique
  (BR-VEH-010). Trait. : planifier l'entretien ; échéance ; tâche + alerte. Notif. :
  gestionnaire de flotte. **Mode : Automatique.**

**AUTO-ENT-002 — Clôture d'entretien**
- Décl. : `Entretien.Réalisé`. Trait. : enregistrer coût et km ; **rattacher la
  dépense** (AUTO-DEP-001) ; replanifier le prochain ; **fermer** l'alerte (ALR-090).
  Notif. : gestionnaire. **Mode : Automatique.**

## C10. Contraventions

**AUTO-CTR-001 — Effets de l'enregistrement**
- Décl. : `Contravention.Enregistrée` (BR-CTR-001). Précond. : véhicule + conducteur
  renseignés. Vérif. : **droits renforcés** (données N4, Security C9) ; anti-doublon.
- Trait. : créer les échéances (paiement, contestation) ; alerte (ALR-011) ;
  rattacher au véhicule et au conducteur ; mettre à jour les statistiques
  (CALC-CTR-001). Notif. : **gestionnaire de flotte / direction uniquement**
  (in-app ; jamais le détail N4 en notification externe, B4-4).
- **Mode : Automatique.** Hist. : complète. Annul. : correction tracée. Journal. :
  **accès journalisé** (renforcé). Err. : std.

**AUTO-CTR-002 — Délais de paiement / contestation**
- Décl. : échéance de paiement ou de contestation à J-N. Trait. : alerte (ALR-012) ;
  tâche « payer ou contester » priorisée (délai légal → urgence forte). Notif. :
  gestionnaire de flotte, dirigeant. **Mode : Automatique.**

## C11. Tâches

**AUTO-TAC-001 — Priorisation automatique**
- Décl. : `Tâche.Créée` (saisie ou automatique) (BR-DIR-001). Trait. : calculer le
  score et le niveau (PRI-001) ; produire l'explication (PRI-014) ; classer dans la
  file. Notif. : selon niveau. **Mode : Automatique.** Err. : std.

**AUTO-TAC-002 — Création de tâche depuis un événement**
- Décl. : tout événement porteur d'une action dirigeant (impayé, échéance, réserve,
  contravention, obligation…) (BR-DIR-002). Vérif. : **anti-doublon** (une source =
  une tâche). Trait. : créer la tâche, la rattacher à sa source, la prioriser.
  **Mode : Automatique.**

**AUTO-TAC-003 — Escalade d'une tâche non traitée**
- Décl. : tâche dépassée non traitée. Trait. : escalader la priorité ; **anomalie**
  oubli (ANO-011). Notif. : dirigeant. **Mode : Automatique.**

**AUTO-TAC-004 — Recalcul quotidien des priorités**
- Décl. : planifié, chaque matin avant le brief (PRI-016). Trait. : recalculer toutes
  les priorités actives. **Mode : Automatique.**

## C12. Calendrier Apple *(préparation — non développé)*

**AUTO-CAL-001 — Synchronisation d'un rendez-vous**
- Décl. : `RendezVous.Détecté` (source Apple, futur) (BR-CAL-001). Précond. :
  connexion active (lecture seule). Vérif. : **dédoublonnage** (identité externe
  stable) ; périmètre utilisateur/organisation.
- Trait. : créer/mettre à jour le rendez-vous du cockpit ; créer les rappels
  nécessaires ; remonter au brief (WF-010). Notif. : dirigeant (rappels).
- **Mode : Automatique** (import lecture seule). Hist./Journal. : synchro tracée.
  Err. : réessais ; une panne Apple n'affecte pas le reste (B5-2). *Rien développé à
  ce stade (Master Blueprint 40).*

**AUTO-CAL-002 — Conflit de planning**
- Décl. : deux rendez-vous se chevauchent. Trait. : **anomalie** (ANO-010) ;
  proposer un arbitrage. Notif. : dirigeant. **Mode : Automatique** (signalement).

## C13. IA

**AUTO-IA-001 — Génération du brief quotidien**
- Décl. : planifié, chaque matin (SCHED-001, WF-010). Précond. : priorités recalculées
  (AUTO-TAC-004). Vérif. : périmètre et droits de l'utilisateur.
- Trait. : l'**Orchestrateur IA** (E2) collecte les contributions des agents,
  assemble le brief à partir des éléments **déjà priorisés par le moteur** (l'IA met
  en forme et explique, ne recalcule pas — IA-001). Notif. : dirigeant.
- Hist. : brief tracé (E-IA-INTERACTION). Annul. : — (lecture). Journal. : entrée,
  sources, fournisseur, modèle, coût (sans N4 en clair). Err. : si IA indisponible,
  **brief déterministe** sans mise en forme IA (AUTO-P11). **Mode : Automatique
  (lecture).**

**AUTO-IA-002 — Suggestion d'action**
- Décl. : détection déterministe (anomalie, échéance) ou demande utilisateur.
  Trait. : un agent **propose** une action (créer tâche, préparer relance/mail,
  classer, rattacher, rapport, rappel, rapprochement — IA-040). Notif. : selon
  l'action. Annul. : le brouillon se rejette. **Mode : Préparation** ; l'exécution
  est en **Validation requise** (IA-042).

## C14. Documents

**AUTO-DOC-001 — Classement à l'ajout**
- Décl. : `Document.Ajouté`. Trait. : enregistrer référence + empreinte ; **proposer**
  un rattachement/catégorie (Agent Documents). Notif. : aucune. **Mode : Préparation**
  (classement proposé). Err. : std.

**AUTO-DOC-002 — Document à signer**
- Décl. : un acte requiert signature (devis accepté, PV, document du cockpit).
  Trait. : router vers la file « à signer » du dirigeant (BR-DIR-004). Notif. :
  dirigeant. **Mode : Validation requise** (la signature engage).

**AUTO-DOC-003 — Rétention / conservation**
- Décl. : planifié ; échéance de conservation atteinte (Data Bible Partie F).
  Trait. : archiver/anonymiser selon la politique. Notif. : responsable conformité.
  **Mode : Automatique** (archivage) ; une suppression définitive éventuelle est en
  **Validation requise**. Journal. : audit (Security J1).

## C15. Alertes

**AUTO-ALR-001 — Cycle de vie des alertes**
- Décl. : création (échéance/seuil), résolution (cause traitée). Trait. : ouvrir,
  **regrouper** (B4-3), fermer à la résolution (ALR-090) ; disparition **tracée**
  (jamais silencieuse). Notif. : selon niveau. **Mode : Automatique.**

**AUTO-ALR-002 — Anti-fatigue**
- Décl. : nombre d'alertes/tâches « critiques » dépasse le plafond configuré.
  Trait. : regrouper et synthétiser (PRI-015) ; ne présenter que l'essentiel. **Mode :
  Automatique.**

## C16. Utilisateurs

**AUTO-USR-001 — Cycle de vie d'un accès**
- Décl. : création/désactivation d'un utilisateur, changement de rôle. Vérif. :
  **action critique** (Security SEC-SOD-004) → **Validation requise** + audit.
  Trait. : appliquer les droits ; révoquer les sessions si désactivation. Notif. :
  l'utilisateur et l'administration. **Mode : Validation requise.** Journal. : audit.

**AUTO-USR-002 — Départ d'un utilisateur**
- Décl. : désactivation. Trait. : révoquer jetons et sessions (Security C3, G2) ;
  réassigner ses tâches ouvertes. Notif. : direction. **Mode : Validation requise.**

## C17. Sécurité

**AUTO-SEC-001 — Détection d'activité suspecte**
- Décl. : signaux (échecs d'auth répétés, accès hors périmètre, export massif,
  contexte inhabituel) (Security F5). Trait. : réaction graduée (demande de
  ré-authentification, invalidation de session, blocage temporaire) ; alerte
  sécurité. Notif. : responsable sécurité (canal dédié). **Mode : Automatique** pour
  la protection ; les mesures lourdes (blocage prolongé) → **Validation** du
  responsable. Journal. : sécurité renforcée.

**AUTO-SEC-002 — Purge RGPD**
- Décl. : planifié ; échéance de conservation d'une donnée personnelle. Trait. :
  anonymiser (processus tracé, jamais suppression sauvage). Notif. : conformité.
  **Mode : Automatique** (anonymisation) ; audit. (Security J1.)

**AUTO-SEC-003 — Sauvegarde & vérification**
- Décl. : planifié. Trait. : sauvegarde chiffrée (base + fichiers) ; **vérification**
  périodique par restauration test (Security I1). Notif. : technique si échec (B6-3).
  **Mode : Automatique.**

---

# Partie D — Tâches planifiées (catalogue)

| ID | Tâche | Fréquence (paramétrable) | Rôle |
|---|---|---|---|
| SCHED-001 | Brief quotidien du dirigeant | Chaque matin | AUTO-IA-001 (après SCHED-002). |
| SCHED-002 | Recalcul des priorités | Chaque matin (+ à l'événement) | AUTO-TAC-004. |
| SCHED-003 | Scan des échéances | Quotidien (plusieurs fois si besoin) | Facture, véhicule, contravention, obligation, réserve → alertes. |
| SCHED-004 | Détection de retard des chantiers | Quotidien | AUTO-CHA-002. |
| SCHED-005 | Recalcul de trésorerie | Quotidien (+ à l'événement) | AUTO-TRE-001. |
| SCHED-006 | Relances (devis, impayés, clients inactifs) | Quotidien | AUTO-DEV-001, AUTO-FAC-002, AUTO-CLI-002 (préparation). |
| SCHED-007 | Recalcul des projections de pilotage | Périodique | Tableaux de bord frais. |
| SCHED-008 | Rétention / purge RGPD | Quotidien/hebdomadaire | AUTO-DOC-003, AUTO-SEC-002. |
| SCHED-009 | Sauvegarde & vérification | Selon politique | AUTO-SEC-003. |
| SCHED-010 | Synchronisations externes périodiques | Selon connecteur | Comptabilité, banque, Apple Calendar (futur). |
| SCHED-011 | Surveillance des files & connecteurs | Continu/fréquent | Alerte technique (B6-3). |

> Toutes les tâches planifiées sont **idempotentes** et **rattrapables** (B3-2), et
> **journalisées** (B8-3).

---

# Partie E — Agents IA & Orchestrateur

> Les agents IA **appliquent** les principes de la Business Rules Bible (Partie J)
> et de la Security Bible (G1). Rappel absolu : **un agent propose, il ne décide
> jamais seul ; il ne produit jamais un chiffre officiel ; il n'exécute jamais une
> action sensible sans validation.**

## E1. Principes des agents

- **AG-P1 — Périmètre borné.** Chaque agent a un **domaine** et des **données
  autorisées** précis ; il ne sort jamais de son périmètre ni des droits de
  l'utilisateur (Security SEC-IA-002).
- **AG-P2 — Ne calcule pas les chiffres officiels.** Les montants/coûts/marges/
  priorités viennent des **moteurs déterministes** (`CALC-…`, `PRI-…`). L'agent les
  **reçoit** pour expliquer/résumer/proposer (IA-001).
- **AG-P3 — Propose, ne décide pas.** Toute action passe en **Préparation** puis
  **Validation requise** (A5, IA-042).
- **AG-P4 — Explicable et honnête.** Chaque sortie étiquette **fait / calcul /
  estimation / recommandation** (IA-002) et cite ses **sources** (RAG, IA-072).
- **AG-P5 — Sécurisé.** Minimisation des données, séparation instructions/données,
  anti-injection, aucune clé côté frontend (Security G1). Jamais de données N4
  inutiles.
- **AG-P6 — Dégradation gracieuse.** Sans IA, les moteurs déterministes continuent ;
  les agents sont un **plus**, jamais une dépendance dure (AUTO-P11).

## E2. L'Orchestrateur IA

**AG-ORCH — Orchestrateur IA.**
- **Rôle.** Coordonner les agents : router une demande vers le(s) bon(s) agent(s),
  assembler leurs contributions (par exemple pour le **brief quotidien**), arbitrer
  les priorités entre agents, appliquer les garde-fous transverses (droits,
  sécurité, étiquetage), et gérer l'**AI Gateway** multi-fournisseur (Claude,
  ChatGPT, Gemini, local — IA-060).
- **Ce qu'il fait.** (1) reçoit un déclencheur (brief planifié, question du
  dirigeant, anomalie détectée) ; (2) vérifie droits et périmètre ; (3) sollicite les
  agents concernés avec un **contexte minimisé** ; (4) **fusionne** les résultats en
  respectant la priorisation du moteur (PRI) ; (5) **étiquette** (fait/calcul/
  estimation/recommandation) et **cite les sources** ; (6) renvoie une réponse ou des
  **actions proposées** (jamais exécutées sans validation).
- **Garde-fous.** L'Orchestrateur **n'écrit rien** d'officiel ; il n'exécute une
  action qu'après validation humaine ; il **journalise** chaque étape ; il applique
  la dégradation gracieuse (si un fournisseur tombe, il bascule — IA-063 — ou renvoie
  un résultat déterministe).
- **Ce qu'il ne fait jamais.** Décider seul, produire un chiffre officiel, croiser
  des données de deux organisations, contourner les droits, transformer une
  hypothèse en fait.

## E3. Les agents

Chaque agent est décrit par : **mission**, **données autorisées**, **ce qu'il
observe**, **ce qu'il propose**, **garde-fous / ce qu'il ne fait jamais**.

**AG-FIN — Agent Finance.**
- Mission : aider à piloter devis, factures, trésorerie, marge.
- Données : Finance + Chantiers (coûts) selon droits.
- Observe : impayés, dérives de marge, risques de trésorerie, devis à relancer.
- Propose : brouillons de relance, priorisation des encaissements, explications de la
  marge, rapprochements. Répond à « combien me doivent mes clients ? » (via
  CALC-CRM-001), « quel chantier est le moins rentable ? » (via CALC-CHA-001).
- Ne fait jamais : calculer un montant officiel, envoyer/émettre sans validation.

**AG-CHA — Agent Chantier.**
- Mission : suivre la santé des chantiers (avancement, coût réel, marge, retards,
  réserves).
- Données : Chantiers + coûts imputés (RH/Stock/dépenses) selon droits.
- Observe : retards, dérives, réserves non levées.
- Propose : explications des dérives (causes probables), actions correctives,
  résumés de chantier.
- Ne fait jamais : modifier un avancement ou un coût officiel.

**AG-DIR — Agent Dirigeant.**
- Mission : assister le cockpit — priorités, décisions, échéances, brief.
- Données : agrégats autorisés de tous les modules (via projections), Espace
  Dirigeant.
- Observe : ce qui est critique/urgent/risqué/opportun (issu du moteur PRI).
- Propose : le **brief quotidien** (mise en forme + explications), la meilleure
  action par point, des reformulations de tâches, des leviers face à un risque.
- Ne fait jamais : recalculer les priorités (c'est PRI), décider à la place du
  dirigeant.

**AG-VEH — Agent Véhicules.**
- Mission : maîtriser le parc (échéances, entretiens, coûts, contraventions).
- Données : Parc + Contraventions (**N4, droits renforcés**) selon droits.
- Observe : échéances proches, non-conformités, coûts anormaux, contraventions à
  traiter.
- Propose : planification d'entretien, priorisation des échéances, synthèses de
  coûts, rappels de délais légaux.
- Ne fait jamais : divulguer des données N4 hors périmètre, payer/contester sans
  validation.

**AG-DOC — Agent Documents.**
- Mission : classer et exploiter les documents.
- Données : GED selon droits (RAG).
- Observe : documents à classer, à signer, échéances de conservation, informations
  utiles dans les documents (par extraction).
- Propose : catégorie/rattachement d'un document, détection d'échéances dans un
  document importé, réponses citant les sources documentaires.
- Ne fait jamais : traiter un contenu de document comme une instruction (anti-
  injection, Security SEC-IA-004) ; classer définitivement sans possibilité de
  correction.

**AG-ADM — Agent Administratif.**
- Mission : suivre les obligations administratives et fiscales, les signatures, les
  validations.
- Données : obligations, échéances administratives, file des validations/signatures.
- Observe : obligations à échéance, documents à signer, validations en attente.
- Propose : rappels priorisés, préparation de dossiers/courriers, checklists.
- Ne fait jamais : effectuer une démarche engageante sans validation.

**AG-PLA — Agent Planning.**
- Mission : aider à organiser le temps (chantiers, équipes, rendez-vous).
- Données : planning chantiers, équipes/absences (selon droits), calendrier
  (rendez-vous, Apple à terme).
- Observe : conflits de planning, surcharges, rendez-vous du jour, chevauchements.
- Propose : arbitrages de planning, réorganisations, préparation d'une journée.
- Ne fait jamais : déplacer un rendez-vous externe ou réaffecter une équipe sans
  validation.

## E4. Interaction agents ↔ moteurs déterministes

```
Événement / Demande
     │
     ▼
Orchestrateur IA ── droits & périmètre ──▶ sollicite les agents (contexte minimisé)
     │                                            │
     │         Moteurs déterministes              │  observent (lecture)
     │      (CALC officiels, PRI, ALR, ANO)  ◀────┘
     │                │  chiffres/priorités officiels
     ▼                ▼
Réponse / Actions proposées (étiquetées, sourcées)
     │
     ▼
VALIDATION HUMAINE  ──▶  exécution (si validée)  ──▶ événement + audit
```

- Les **chiffres** et **priorités** viennent **toujours** des moteurs (AG-P2).
- Les agents **observent** et **proposent** ; l'**humain valide** ; l'exécution
  passe par les automatismes (Partie C) qui tracent tout.

## E5. Sécurité des agents

Reprend et rend opposables les contrôles de la Security Bible (G1) : minimisation
(SEC-IA-001), droits hérités (SEC-IA-002), séparation instructions/données
(SEC-IA-003), anti-injection (SEC-IA-004), aucune clé au frontend (SEC-IA-005),
journalisation (SEC-IA-006), souveraineté (SEC-IA-007), aucune modification
officielle sans validation (SEC-IA-008). Aucun agent ne **croise** deux
organisations (SEC-ACC-ORG-004).

---

# Partie F — Matrice de validation

> Résume, pour les familles d'actions, le **mode d'exécution** (A5) et **qui valide**.

| Famille d'action | Mode | Validation par |
|---|---|---|
| Créer échéance / tâche / alerte | Automatique | — |
| Recalculer indicateur / projection / priorité | Automatique | — |
| Notification interne | Automatique | — |
| Classer / catégoriser un document, rattacher une dépense | Préparation | L'utilisateur du module |
| Préparer une relance / un mail / un rapport | Préparation | L'émetteur |
| **Émettre un devis / une facture / une situation** | **Validation requise** | Comptable / Direction (SoD) |
| **Envoyer un e-mail externe / une relance** | **Validation requise** | L'émetteur |
| **Payer / commander / engager une dépense** | **Validation requise** | Selon seuil (SoD) |
| **Signer un document** | **Validation requise** | Direction |
| **Modifier une donnée officielle** | **Validation requise** | Rôle habilité |
| **Exporter des données personnelles** | **Validation requise** | Direction / responsable |
| **Changer des droits / désactiver un utilisateur** | **Validation requise** | Administration (audit) |
| **Blocage de sécurité prolongé** | **Validation requise** | Responsable sécurité |
| Anonymiser à l'échéance RGPD | Automatique (tracé) | — (suppression définitive : validation) |

> **Règle finale (AUTO-VAL-002).** En cas de doute sur la sensibilité d'une action,
> le **défaut est « Validation requise »** (principe de prudence, Security SEC-P6).

---

# Partie G — Traçabilité vers les autres documents fondateurs

| Thème | Automation Bible | Master Blueprint | Business Rules Bible | Data Bible | Security Bible | Product Bible |
|---|---|---|---|---|---|---|
| Automatismes = exécution des règles | A1, Partie C | ch. 14 | Parties B, D, G, I | — | — | P06 |
| Contrôle humain / validation | A5, Partie F | 14.4 | INV-7, IA-042 | — | SEC-SOD, G1 | P07 |
| Traitements asynchrones & files | B1, B2 | 8.3, 13.4 | — | E-EVENEMENT | — | — |
| Tâches planifiées | B3, Partie D | 14.2 | WF-010 | E-ECHEANCE | — | — |
| Notifications | B4 | — | ALR / PRI-015 | E-NOTIF | F4 | EXP-3 |
| Synchronisations externes | B5 | ch. 23, 40 | BR-CAL | E-SOURCECAL | G3, C7 | P15 |
| Erreurs & reprise | B6 | 25 | 25.2 | — | I3 | P10 |
| Idempotence & anti-boucle | B7 | 8.4 | INV-5, 14.4 | — | — | — |
| Agents IA & Orchestrateur | Partie E | ch. 24 | Partie J | C14 | G1 | P07, P08 |
| L'IA ne calcule pas l'officiel | AG-P2, E4 | P6 | IA-001 | — | SEC-IA-008 | P14 |

---

## Fin du document

> **BRN PILOT — Automation Bible v1.0.** Tous les automatismes du logiciel : leurs
> déclencheurs, délais, synchronisations, notifications, traitements asynchrones et
> tâches planifiées, avec les **9 champs** obligatoires par automatisme — et
> l'écosystème d'**agents IA** coordonnés par un **Orchestrateur**. Document
> normatif, sans code.
>
> **Règle d'or.** *BRN Pilot* automatise le maximum de tâches répétitives **sans
> jamais perdre le contrôle humain**. **Aucune action sensible n'est exécutée sans
> validation.** Les agents IA **proposent** ; les moteurs déterministes
> **calculent** ; l'humain **décide**.
>
> Prochaines étapes (dans l'ordre prévu) : **UX/UI Bible**, **API Bible**,
> **Developer Bible** — avant tout développement.
