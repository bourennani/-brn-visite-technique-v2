# BRN PILOT — API BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **toutes les
> interfaces d'échange** de *BRN Pilot* : les contrats techniques par lesquels les
> modules, les clients (web/mobile), les automatismes, l'IA et les intégrations
> externes communiquent de manière **sécurisée, cohérente et évolutive**.
>
> **Ce document ne contient aucun code, aucun endpoint implémenté, aucun schéma
> SQL.** Les chemins et formats décrits sont des **contrats** (documentation), pas
> une implémentation. Nous restons en **phase de conception**.
>
> **Subordination.** L'API **n'est jamais la source des règles**. Elle **expose**
> ce que définissent les autres Bibles et **ne les contourne jamais** :
> - **Business Rules Bible** — le comportement et les calculs officiels.
> - **Data Bible** — les entités, attributs, classification.
> - **Security Bible** — l'authentification, l'autorisation, la conformité.
> - **Automation Bible** — les automatismes et l'orchestration IA.
> - **Master / Product / UX-UI Bibles** — l'architecture, l'identité, l'expérience.
>
> **Statut :** v1.0 — à relire et valider **avant** la Developer Bible.
> **Base :** cette branche contient les 7 documents fondateurs (dernières versions,
> Master Blueprint v1.1) pour être auto-suffisante.

---

## Table des matières

**Partie A — Fondations**
1. Objectif & responsabilités de l'API
2. Principes fondamentaux
3. Style d'architecture recommandé
4. Périmètre public / privé

**Partie B — Conventions transverses**
5. Versionnement
6. Conventions de requêtes & réponses
7. Format standard des réponses & des erreurs
8. Nomenclature des codes d'erreur
9. Concurrence & modifications simultanées
10. Idempotence
11. Pagination, filtres & recherche
12. Limitation de débit
13. Cache

**Partie C — Sécurité**
14. Authentification & autorisation
15. Journalisation & audit

**Partie D — Catalogue des ressources & opérations métier**
16. Clients & prospects · 17. Chantiers · 18. Finance · 19. Devis · 20. Factures ·
21. Encaissements & paiements · 22. Dépenses & fournisseurs · 23. Main-d'œuvre ·
24. Véhicules · 25. Contraventions · 26. Tâches & priorités · 27. Calendrier ·
28. Documents · 29. Alertes & notifications

**Partie E — Fichiers, imports & exports**
30. Documents & fichiers volumineux · 31. Imports · 32. Exports

**Partie F — Asynchrone, automatisations & observabilité**
33. Traitements asynchrones · 34. Automatisations · 35. Santé & observabilité

**Partie G — Événements & intégrations**
36. Événements métier · 37. Webhooks · 38. Intégration BRN Visite Technique ·
39. Calendrier Apple (stratégies) · 40. Banque (préparation)

**Partie H — Intelligence artificielle**
41. API IA (AI Gateway) · 42. Actions IA · 43. RAG

**Partie I — Qualité & gouvernance**
44. Tests de contrat · 45. Documentation · 46. Critères d'acceptation ·
47. Traçabilité

> **Conventions.** Principes `API-Pxx`, codes d'erreur `ERR-…`, opérations
> métier nommées, événements `domaine.fait`. Les chemins illustratifs sont sous la
> forme `/api/v1/...` (contrat, non implémenté).

---

# Partie A — Fondations

## 1. Objectif & responsabilités de l'API

L'API est la **façade contractuelle** de *BRN Pilot*. Ses responsabilités :

- **Exposer** les ressources (Data Bible) et les **opérations métier** (Business
  Rules) de façon stable et versionnée.
- **Contrôler** chaque requête (identité, entreprise, rôle, permissions,
  classification) côté serveur (Security).
- **Router** vers les **services de domaine** qui exécutent les règles ; l'API ne
  décide de rien elle-même.
- **Publier** les événements métier et **déclencher** les traitements asynchrones.
- **Isoler** les intégrations externes derrière des adaptateurs.

Ce que l'API **ne fait pas** : contenir des règles métier, calculer un chiffre
officiel, autoriser sur la seule base de l'interface, exposer la base directement.

## 2. Principes fondamentaux

| # | Principe |
|---|---|
| API-P01 | L'API **n'est jamais la source** des règles métier. |
| API-P02 | Les règles métier sont exécutées par les **services de domaine**. |
| API-P03 | **Aucun calcul financier officiel** n'est réalisé dans le frontend (il provient de l'API/moteur). |
| API-P04 | **Aucune autorisation** ne dépend uniquement de l'interface. |
| API-P05 | **Chaque requête** est contrôlée côté serveur (identité + entreprise + rôle + permission + classification). |
| API-P06 | Toute **opération sensible** est **auditable**. |
| API-P07 | Les **contrats** sont **stables et versionnés** ; aucune modification silencieuse. |
| API-P08 | Les **réponses sont cohérentes** entre modules (même enveloppe, mêmes conventions). |
| API-P09 | Les **erreurs** sont compréhensibles **sans révéler** d'information sensible. |
| API-P10 | **Aucune donnée d'une entreprise** n'est accessible par une autre (cloisonnement). |
| API-P11 | Toute **modification** prévoit le risque de **doublon** (idempotence, détection). |
| API-P12 | Toute **action automatique** reste **traçable**. |
| API-P13 | L'API **fonctionne sans fournisseur d'IA** (dégradation gracieuse). |

## 3. Style d'architecture recommandé

> **Solution recommandée : une combinaison REST + commandes métier + événements
> asynchrones.**
>
> - **REST** pour les **ressources** (lecture, création simple, mise à jour) :
>   `/api/v1/<ressource>`. Universel, cacheable, outillé, parfait pour Next.js et le
>   futur mobile.
> - **Commandes métier** (RPC métier nommé) pour les **actions** qui ne sont pas de
>   simples `PATCH` : `POST /api/v1/projects/{id}:start`, `:receive`, `:close`,
>   `invoices/{id}:issue`, `fines/{id}:contest`. On **ne réduit pas** les actions
>   métier à une modification générique (elles portent des règles, des états, des
>   validations).
> - **Événements asynchrones** pour la **communication entre modules** et les
>   **automatismes** (boîte d'envoi transactionnelle, Business Rules 13.4).
>
> **Avantages.** Simplicité et universalité de REST ; expressivité métier des
> commandes (états, validations, séparation des droits) ; découplage et robustesse
> des événements. Adapté à : app web Next.js, futur mobile, imports, automatisations,
> événements, intégration BRN Visite Technique / Apple Calendar / banque, IA
> multi-fournisseur (via l'AI Gateway interne, Partie H).
>
> **Limites.** Deux « styles » (ressources + commandes) à maîtriser ; discipline de
> nommage nécessaire.
>
> **Risques.** Dérive vers du « REST anémique » (tout en PATCH) qui noierait les
> règles → atténué par le catalogue d'opérations métier (Partie D). Sur-usage de
> l'asynchrone → réservé à ce qui le justifie (Partie F).
>
> **Alternatives rejetées.**
> - **REST pur (CRUD générique)** : incapable d'exprimer les actions métier et leurs
>   états sans logique côté client (violerait API-P01).
> - **GraphQL** : puissant pour les lectures flexibles, mais complexité (sécurité par
>   champ, coût des requêtes, cache) **non justifiée** pour une PME à ce stade ;
>   pourra être **ajouté plus tard** comme couche de lecture si un besoin réel
>   apparaît, sans remplacer REST.
> - **RPC pur** : perd les bénéfices de REST (cache, conventions, outillage).
> - **Tout asynchrone** : complexité inutile pour les lectures simples.

## 4. Périmètre public / privé

| Surface | Nature | V1 |
|---|---|---|
| **API frontend interne** | Consommée par l'app web Next.js et le futur mobile. | Oui. |
| **API administrative** | Administration/sécurité/paramètres (droits élevés, audit). | Oui, restreinte. |
| **API d'intégration** | Connecteurs internes (comptabilité, banque, calendrier, BRN Visite Technique). | Progressif. |
| **Événements internes** | Bus d'événements entre modules. | Oui. |
| **Webhooks externes** | Entrants/sortants vers partenaires. | **Préparés**, activés plus tard. |
| **Outils internes de l'IA** | Appelés par l'AI Gateway (contrôlés). | Oui (Partie H). |
| **API partenaire publique** | Ouverte à des tiers. | **Non requise en V1.** |

> Par défaut, **aucune API partenaire publique** en V1. Le mobile et les connecteurs
> consomment **les mêmes contrats** que le frontend, filtrés par droits (surface
> minimale, Security SEC-API-007).

---

# Partie B — Conventions transverses

## 5. Versionnement

- **API-VER-01 — Préfixe de version.** Toutes les routes sous **`/api/v1`**. Une
  version majeure incompatible crée `/api/v2` ; `/api/v1` continue de vivre.
- **API-VER-02 — Compatibilité.** Sont **non cassants** (autorisés sur une version) :
  ajouter un champ optionnel en réponse, ajouter un endpoint, ajouter une valeur
  d'énumération **tolérée**, ajouter un paramètre optionnel. Sont **cassants**
  (interdits sur une version publiée) : retirer/renommer un champ, changer un type,
  rendre obligatoire un champ optionnel, changer une sémantique, retirer une valeur
  d'énumération.
- **API-VER-03 — Dépréciation.** Un élément déprécié est **annoncé**, marqué dans la
  documentation et via un en-tête de dépréciation, **maintenu** une durée définie
  (à fixer, p. ex. plusieurs mois) avant retrait dans une version majeure.
- **API-VER-04 — Communication.** Journal des changements versionné ; migration des
  clients documentée ; **tests de contrat** (§44) garantissant la non-régression.
- **API-VER-05 — Interdiction.** **Aucune modification silencieuse** d'un contrat
  existant (API-P07). Les **événements** sont versionnés séparément (§36).

## 6. Conventions de requêtes & réponses

| Élément | Convention |
|---|---|
| **Identifiants** | Chaîne opaque **préfixée par type** (`inv_…`, `prj_…`, `veh_…`). Jamais un identifiant technique deviné. |
| **Dates / heures** | ISO 8601 en **UTC** (`…Z`) en transport ; l'affichage localise (fuseau du client). |
| **Fuseaux horaires** | Fuseau de l'organisation par défaut ; les événements portent l'instant UTC. |
| **Montants** | **Entier en centimes** + **devise obligatoire** (ex. `{ "amount": 123450, "currency": "EUR" }`). **Jamais de flottant.** Règles d'arrondi = celles du moteur financier (Business Rules 15.3). |
| **Pourcentages** | Décimal typé, précision documentée (ex. marge en points de %). |
| **Quantités** | Décimal typé (unité précisée). |
| **Adresses** | Objet structuré (rue, code postal, ville, pays). |
| **Statuts** | Énumérations **fermées et documentées** (miroir des états Data/Business Rules). |
| **Langues** | Codes standard ; français par défaut. |
| **Métadonnées** | Bloc `meta` normalisé (§7). |
| **Pagination / tri / filtres / recherche** | §11. |
| **Pièces jointes** | Jamais dans le corps JSON : flux fichier dédié (§30). |

> **API-MONEY-01.** La représentation monétaire recommandée est **centimes entiers +
> devise obligatoire**. Un montant sans devise est **invalide**. Les chiffres
> officiels proviennent **exclusivement** du moteur financier déterministe
> (API-P03).

## 7. Format standard des réponses & des erreurs

**Réponse réussie (enveloppe commune) :**

- `data` — la ressource ou la liste.
- `meta` — contexte : `correlationId`, `generatedAt`, version d'API, et pour une
  liste : `pagination` (curseur, limite, total éventuel).
- `warnings` — avertissements non bloquants (ex. « donnée estimée », « proche de la
  limite »).

**Réponse d'erreur (enveloppe commune) :**

- `error.code` — **code technique stable** (`ERR-…`, §8), inchangé même si le
  message évolue.
- `error.message` — message **utilisateur** clair, sans détail sensible.
- `error.details` — facultatif : liste `{ field, issue }` pour les erreurs de
  validation.
- `error.retryable` — booléen : l'opération peut-elle être réessayée ?
- `error.correlationId` — identifiant de corrélation (support/audit).
- `error.docs` — lien de documentation éventuel.

**Ne jamais exposer** : pile d'erreur, requête SQL, secret, structure interne
sensible, chemin serveur (Security, API-P09).

## 8. Nomenclature des codes d'erreur

Codes **stables** (le message peut changer, le code non). Catégories :

| Code | Sens |
|---|---|
| `ERR-AUTH-REQUIRED` / `ERR-AUTH-INVALID` | Authentification manquante/invalide (401). |
| `ERR-FORBIDDEN` | Autorisé mais hors périmètre (403) — ou `ERR-NOT-FOUND` par non-divulgation. |
| `ERR-VALIDATION` | Entrée invalide (400) — accompagné de `details`. |
| `ERR-BUSINESS-RULE` | Règle métier violée (422). |
| `ERR-NOT-FOUND` | Ressource inexistante **ou** hors périmètre (404, non-divulgation). |
| `ERR-CONFLICT` | Conflit d'état (409). |
| `ERR-DUPLICATE` | Doublon détecté (409). |
| `ERR-STALE-REVISION` | Version obsolète — verrou optimiste (409, §9). |
| `ERR-RATE-LIMITED` | Plafond dépassé (429). |
| `ERR-FILE-INVALID` | Fichier invalide (type/taille/quarantaine). |
| `ERR-INTEGRATION-UNAVAILABLE` | Intégration externe indisponible (502/503). |
| `ERR-AUTOMATION-FAILED` | Automatisation échouée. |
| `ERR-AI-UNAVAILABLE` | IA indisponible (le métier continue, API-P13). |
| `ERR-INSUFFICIENT-DATA` | Donnée insuffisante pour répondre (ex. IA sans base). |
| `ERR-VALIDATION-REQUIRED` | Action nécessitant une validation humaine (Automation F). |
| `ERR-ALREADY-EXECUTED` | Action déjà exécutée (idempotence). |
| `ERR-EXPIRED` | Délai expiré (ex. proposition IA, jeton). |
| `ERR-INTERNAL` | Erreur interne (500) — **aucun détail sensible**. |

## 9. Concurrence & modifications simultanées

> **API-CONC-01 — Verrou optimiste obligatoire** sur toute ressource modifiable.

- Chaque ressource porte une **`revision`** (et une `updatedAt`).
- Une mise à jour transmet la révision lue (en-tête `If-Match` ou champ `revision`).
- Si la révision est périmée → **`409 ERR-STALE-REVISION`**, **jamais d'écrasement
  silencieux** (Product P11, UX-P… non-régression).
- La réponse de conflit renvoie l'**état serveur courant** (pour montrer les
  changements concurrents), permettant au client de **recharger** et, selon le cas,
  de **fusionner** champ par champ (stratégie UX/UI Bible §conflits) ou d'imposer un
  **rechargement**.

Exemple de règle : *si deux utilisateurs modifient la même facture ou le même
chantier, aucune modification récente n'est écrasée en silence.*

## 10. Idempotence

> **API-IDEMP-01 — Clé d'idempotence** (`Idempotency-Key`) **obligatoire** sur les
> opérations à effet non rejouable.

Opérations concernées (au moins) : **création d'un paiement, import bancaire,
création de facture, enregistrement d'une dépense, réception d'un webhook,
exécution d'une automatisation, synchronisation calendrier, envoi de notification,
exécution d'une action proposée par l'IA.**

- Rejouer la **même clé** renvoie le **résultat initial** (`ERR-ALREADY-EXECUTED`
  ou le même corps), **sans** créer une seconde opération financière ni un second
  document (API-P11).
- La clé est conservée le temps nécessaire ; les consommateurs d'événements sont
  **idempotents** par `eventId`.

## 11. Pagination, filtres & recherche

- **API-LIST-01 — Curseur par défaut** pour les grandes listes (`?limit=&cursor=`) ;
  pagination simple tolérée pour les petites. **Pas d'offset profond.**
- **API-LIST-02 — Limites maximales** par endpoint (empêcher l'extraction sans
  limite de très gros volumes).
- **API-LIST-03 — Filtres typés** sur des **champs autorisés** (liste blanche) ;
  **tri stable** (clé secondaire) ; **recherche textuelle** et **multi-critères**.
- **API-LIST-04 — Vues enregistrées** : un utilisateur peut sauvegarder un jeu
  filtres/tri/colonnes (UX/UI Bible F2), rappelé par référence.
- **API-LIST-05 — Champs projetés** : possibilité de restreindre les champs
  retournés (`fields=`), sans jamais divulguer un champ hors droits.

## 12. Limitation de débit

Limites **par utilisateur**, **par entreprise**, **par adresse IP** (si pertinent),
**par clé d'intégration**, **par fonctionnalité**. Zones à limiter en priorité :
**authentification, recherche, export, import, téléversement, IA, webhooks,
endpoints sensibles, administration.** Dépassement → `429 ERR-RATE-LIMITED` avec
indication de réessai. (Security SEC-APP-031.)

## 13. Cache

- **Cacheable** : ressources de référence peu sensibles (référentiels), résultats
  **IA non sensibles** lorsque pertinent, réponses de lecture idempotentes courtes.
- **Jamais mis en cache public** : **toute donnée métier** (N3/N4). Cache **privé**
  uniquement, **clés « tenant-aware »** (isolées par entreprise) pour **empêcher
  toute fuite inter-entreprises**.
- **Invalidation** : durée courte + invalidation à la modification (cohérence après
  écriture). Aucune donnée sensible dans un cache partagé (Security).

---

# Partie C — Sécurité

## 14. Authentification & autorisation

**Contrats d'authentification** (délégués au fournisseur d'identité, Security C1) :
connexion, déconnexion, **renouvellement de session**, **double authentification
(MFA)**, récupération de compte, **révocation de session**, **appareils reconnus**,
**journal des connexions**, **gestion des rôles**, **gestion des permissions**.

> **API-SEC-01 — Contrôle systématique.** Chaque requête vérifie côté serveur :
> **identité** de l'utilisateur, **entreprise**, **rôle**, **permissions**, **niveau
> de confidentialité** de la ressource (classification Security B), et les
> restrictions spécifiques :
> - **Espace Dirigeant** : strictement réservé (Direction/délégués).
> - **Contraventions** : accès très restreint et **audité** (données N4).
> - **Données financières et salariales** : accès selon rôle, séparation des droits.

- **API-SEC-02 — Multi-entreprise.** L'`org` est **dérivée du jeton**, jamais du
  client ; aucun accès inter-entreprise possible (API-P10, Security C7). Isolation
  renforcée au niveau des données (sécurité au niveau ligne).
- **API-SEC-03 — Non-divulgation.** Une ressource hors périmètre renvoie
  `ERR-NOT-FOUND` (jamais un indice d'existence).
- **API-SEC-04 — Actions critiques.** Changement de droits, export de données
  personnelles, configuration IA/sécurité : **ré-authentification** possible + audit.

## 15. Journalisation & audit

Toute action importante peut enregistrer : **utilisateur, entreprise, date/heure,
action, ressource, état avant, état après, origine, appareil/session, identifiant de
corrélation, automatisation éventuelle, proposition IA éventuelle, validation humaine
éventuelle.**

On **différencie** quatre journaux (Security F, Data Bible) :

| Journal | Rôle |
|---|---|
| **Technique** | Exploitation (latence, erreurs). |
| **Sécurité** | Auth, élévations, accès sensibles. |
| **Audit métier** | Actes engageants (facture émise, validation, export…), immuable. |
| **Historique fonctionnel** | État avant/après d'une donnée engageante. |

---

# Partie D — Catalogue des ressources & opérations métier

> Format : **ressources REST** (`/api/v1/…`) + **commandes métier** nommées
> (`…:action`). Colonnes : *Opération* · *Type* (R = ressource, C = commande) ·
> *Mode* (Auto / Validation requise) · *Idempotent* · *Événement émis*. Toutes les
> opérations respectent §5–§15. Les états reflètent les machines `ST-…` (Business
> Rules) ; les chiffres officiels viennent du moteur (API-P03).

## 16. Clients & prospects (`/api/v1/parties`, `/clients`, `/prospects`)

| Opération | Type | Mode | Idemp. | Événement |
|---|---|---|---|---|
| Créer / lire / modifier / archiver un tiers | R | Auto | Créat. : oui | `party.created` |
| Rechercher (multi-critères) | R | Auto | — | — |
| **Fusionner des doublons** | C `parties/{id}:merge` | Validation requise | oui | `party.merged` |
| Consulter l'historique | R | Auto | — | — |
| Rattacher contacts / chantiers / devis / factures / documents | R | Auto | — | — |
| **Créer une relance** | C `clients/{id}:remind` | Préparation (envoi validé) | oui | `client.reminder-prepared` |
| Consulter l'**exposition financière** (solde dû) | R (calculé) | Auto | — | — |

> Distinction claire : **entreprise cliente** (organisation) ≠ **client** (tiers en
> rôle client) ≠ **prospect** (tiers en rôle prospect) ≠ **contact** (personne
> rattachée). Data Bible C2.

## 17. Chantiers (`/api/v1/projects`)

Ressource : état, avancement, budget, coûts, marges, planning, équipes, dépenses,
documents, photos, alertes, commentaires, décisions, historique (sous-ressources).

**Opérations métier dédiées** (ne pas réduire à un `PATCH` générique) :

| Commande | Effet | Mode | Événement |
|---|---|---|---|
| `projects:create` (depuis devis accepté) | Créer | Auto (souvent automatique) | `project.created` |
| `projects/{id}:start` | Démarrer | Validation | `project.started` |
| `projects/{id}:suspend` | Suspendre | Validation | `project.suspended` |
| `projects/{id}:resume` | Reprendre | Validation | `project.resumed` |
| `projects/{id}:declare-delay` | Déclarer un retard | Auto/Validation | `project.delay-declared` |
| `projects/{id}:validate-progress` | Valider un avancement | Validation | `project.progress-validated` |
| `projects/{id}:update-budget` | Modifier le budget | Validation (tracée) | `project.budget-changed` |
| `projects/{id}:receive` | Réceptionner | Validation | `project.received` |
| `projects/{id}:close` | Clôturer | Validation | `project.closed` |

Les marges (prévue / réelle / projetée) sont **lues** (calculées par le moteur,
CALC-CHA), jamais écrites.

## 18. Finance (`/api/v1/finance`)

Ressources/lectures : **trésorerie, mouvements, prévisions, encaissements,
décaissements, catégories, charges récurrentes, budgets, marges, résultats,
ventilation (chantier/client/catégorie), périodes, scénarios prévisionnels.**

> **API-FIN-01.** Les chiffres officiels proviennent **exclusivement** du moteur
> financier déterministe (Business Rules Partie E). L'API **distingue** et **étiquette**
> chaque nature : **réel, engagé, prévu, estimé, encaissé, facturé, restant, en
> retard**. Une valeur **estimée par l'IA** est marquée comme telle (jamais confondue
> avec l'officiel).

Scénarios prévisionnels : lecture de projections (paramétrables), **jamais**
écriture d'un chiffre officiel.

## 19. Devis (`/api/v1/quotes`)

Ressource versionnée. Opérations : créer, **brouillon**, modifier, **dupliquer**,
**version**, **validation interne**, **envoyer**, **accepter**, **refuser**,
**expirer**, **transformer en chantier**, documents, historique.

| Commande | Mode | Événement |
|---|---|---|
| `quotes/{id}:issue` (envoyer) | Validation | `quote.issued` |
| `quotes/{id}:accept` | Validation | `quote.accepted` → déclenche `projects:create` |
| `quotes/{id}:refuse` | Auto | `quote.refused` |
| `quotes/{id}:convert-to-project` | Validation | `project.created` |

> **API-QUOTE-01.** Un devis **accepté** ne se modifie plus : toute évolution passe
> par un **avenant** (nouvelle version liée). Gestion de versions obligatoire pour
> qu'un devis accepté **ne soit jamais modifié silencieusement**.

## 20. Factures (`/api/v1/invoices`)

Opérations : créer, **brouillon**, **valider**, **émettre**, **envoyer**,
**échéance**, **paiement partiel/complet** (via §21), **avoir**, **annulation
légale**, **litige**, **relance**, **export**, **archivage**.

| Commande | Mode | Idemp. | Événement |
|---|---|---|---|
| `invoices/{id}:issue` | Validation | oui | `invoice.issued` (numéro légal attribué) |
| `invoices/{id}:send` | Validation | oui | `invoice.sent` |
| `invoices/{id}:credit-note` (avoir) | Validation | oui | `credit-note.issued` |
| `invoices/{id}:dispute` | Auto | — | `invoice.disputed` |
| `invoices/{id}:remind` | Préparation | oui | `invoice.reminder-prepared` |

> **API-INV-01.** Respect **strict** de la **numérotation séquentielle, continue,
> sans trou** et de l'**inaltérabilité** (Business Rules CALC-FIN-020). **Jamais de
> suppression simple** d'une facture émise : correction = **avoir** ; document émis
> **immuable et versionné**.

## 21. Encaissements & paiements (`/api/v1/payments`)

Opérations : **création, rapprochement, rapprochement partiel, ventilation entre
plusieurs factures, annulation encadrée, remboursement, origine bancaire,
référence, justificatif, historique.**

> **API-PAY-01.** Toute **validation définitive** est **idempotente** (§10) et
> **auditée**. Le rapprochement peut être partiel ou réparti sur plusieurs factures ;
> l'annulation est **encadrée** (jamais une suppression). Événements :
> `payment.recorded`, `payment.reconciled`, `payment.refunded`.

## 22. Dépenses & fournisseurs (`/api/v1/expenses`, `/suppliers`)

Ressources : **fournisseur, facture fournisseur, dépense, catégorie, TVA, paiement,
justificatif**, rattachement **chantier / véhicule / salarié ou intervenant**,
validation, rejet, **détection de doublon**, **OCR futur**.

| Opération | Mode | Événement |
|---|---|---|
| `expenses:create` | Auto (validation au-delà d'un seuil) | `expense.created` |
| `expenses/{id}:validate` / `:reject` | Validation | `expense.validated` / `expense.rejected` |
| Détection de doublon | Auto (signale) | `expense.duplicate-suspected` |

> **API-EXP-01.** L'IA peut **proposer** une catégorie ou un rattachement, mais la
> donnée officielle suit les **niveaux d'autonomie** (Automation A5) : proposition →
> validation. Le **rattachement véhicule** alimente automatiquement le coût du
> véhicule (Business Rules 11.3).

## 23. Main-d'œuvre (`/api/v1/labor`)

Ressources : **salariés, intervenants, tarifs, journées, heures, heures
supplémentaires, primes, avances, absences, affectations, répartition par chantier,
validation mensuelle, historique.**

> **API-LAB-01 — Séparation des données.** L'API **sépare** les **informations
> opérationnelles** (heures, affectations, présence — accessibles au conducteur pour
> ses chantiers) des **informations confidentielles de rémunération** (tarifs,
> primes, avances — accessibles aux seuls rôles autorisés, RH/Direction). Données
> N4, accès restreint et audité (Security).

| Commande | Mode | Événement |
|---|---|---|
| `labor/workdays:record` (journée) | Auto (validée par conducteur) | `labor.workday-recorded` |
| `labor:validate-month` | Validation | `labor.month-validated` |

## 24. Véhicules (`/api/v1/vehicles`)

Ressource : conducteur principal, kilométrage, assurance, contrôle technique,
entretien, réparation, pneus, carburant, coût, document, photo, immobilisation,
cession, archivage.

| Commande | Mode | Événement |
|---|---|---|
| `vehicles:create` / `:update` | Auto | `vehicle.added` |
| `vehicles/{id}:record-mileage` | Auto (anomalie si incohérent) | `vehicle.mileage-recorded` |
| `vehicles/{id}:schedule-maintenance` | Auto/Validation | `vehicle.maintenance-scheduled` |
| `vehicles/{id}:close-maintenance` | Auto | `vehicle.maintenance-done` |
| `vehicles/{id}:attach-expense` | Auto | `expense.created` |
| `vehicles/{id}:declare-immobilization` | Validation | `vehicle.immobilized` |
| `vehicles/{id}:change-driver` | Validation | `vehicle.driver-changed` |

Échéances (assurance/CT/entretien) génèrent des événements et alertes (Automation
AUTO-VEH).

## 25. Contraventions (`/api/v1/fines`) — **accès strictement contrôlé & audité**

Ressource : véhicule, conducteur, infraction, montant, points, échéance, paiement,
contestation, document, statut, historique.

| Commande | Mode | Événement |
|---|---|---|
| `fines:record` | Validation (droits N4) | `fine.recorded` |
| `fines/{id}:assign-driver` | Validation | `fine.driver-assigned` |
| `fines/{id}:confirm-receipt` | Validation | `fine.receipt-confirmed` |
| `fines/{id}:declare-payment` | Validation | `fine.paid` |
| `fines/{id}:open-contest` | Validation | `fine.contested` |
| `fines/{id}:register-surcharge` (majoration) | Validation | `fine.surcharge-registered` |
| `fines/{id}:close` | Validation | `fine.closed` |

> **API-FINE-01.** Accès **strictement restreint** (Direction, Gestionnaire de
> flotte), **audité** (Security C9, BR-CTR-007). Non-divulgation stricte.

## 26. Tâches & priorités (`/api/v1/tasks`)

Ressource : affectation, délégation, priorité, échéance, dépendance, statut,
commentaire, pièce jointe, origine, automatisation, proposition IA, validation,
clôture, réouverture.

> **API-TASK-01.** Le **score officiel de priorité** provient du **moteur
> déterministe** (Business Rules PRI-001) ; l'API **fournit l'explication** du score
> (`GET /tasks/{id}/priority-explanation`). Une tâche **proposée par l'IA** est
> marquée comme telle et exige une action humaine. Événements : `task.created`,
> `task.priority-changed`, `task.delegated`, `task.closed`, `task.reopened`.

## 27. Calendrier (`/api/v1/calendar`)

Ressources : **événement interne, rendez-vous, réunion, déplacement, rappel**, liens
(tâche, chantier, client), **synchronisation externe**, **conflit**, **doublon**,
**fuseau horaire**. Détails d'intégration Apple en §39. Gestion de doublons/conflits
avec identité externe stable et signalement.

## 28. Documents (`/api/v1/documents`)

Voir §30 (fichiers). Opérations : téléversement, téléchargement, prévisualisation,
version, classement, tags, confidentialité, **expiration**, **renouvellement**,
**signature**, archivage, **suppression encadrée**, analyse OCR/IA, lien avec une
entité. États : valide / expirant / expiré / à signer / incomplet / non classé
(UX/UI Bible E8).

## 29. Alertes & notifications (`/api/v1/alerts`, `/notifications`)

Opérations : création, **regroupement**, priorité, **lecture**, **résolution**,
**mise en veille**, **réactivation**, historique, **diffusion**, **préférences
utilisateur**. On **distingue** : **alerte métier**, **notification**, **tâche**,
**incident de sécurité**, **recommandation IA** (types séparés, traitements
distincts). Anti-fatigue (regroupement, plafond) piloté par le moteur (PRI-015).

---

# Partie E — Fichiers, imports & exports

## 30. Documents & fichiers volumineux

> **API-FILE-01 — Flux en trois temps** (le backend ne transporte pas les gros
> fichiers) :
> 1. **URL signée** demandée (`POST /api/v1/files:upload-url`) avec type/taille/
>    rattachement prévus ;
> 2. **téléversement direct** vers le stockage objet (PUT sur l'URL) ;
> 3. **confirmation** (`:commit`) → **analyse** (type réel, **hash**, **détection de
>    doublon**), **mise en quarantaine** (antivirus futur), **validation**, puis
>    **rattachement métier** et disponibilité.

Contrôles : **analyse du type de fichier**, **taille maximale**, **contrôle
antivirus futur** (place réservée), **hash** (intégrité/dédup), **statut de
traitement** (`pending → clean → available` / `rejected`). Accès via **URL
temporaire signée** soumise aux droits et à la classification (Security D3).
Documents émis **immuables et versionnés** ; **suppression encadrée** (jamais un
simple `DELETE` d'un acte engageant).

## 31. Imports

> **API-IMPORT-01 — Workflow en étapes, avec aperçu obligatoire.** Aucune importation
> importante n'est exécutée sans **aperçu préalable**.

1. **Téléversement** → 2. **analyse** → 3. **détection du format** → 4.
**correspondance des colonnes** → 5. **prévisualisation** → 6. **validation** → 7.
**détection des doublons** → 8. **exécution** (asynchrone) → 9. **rapport** → 10.
**correction/annulation** selon le cas.

Formats/domaines couverts : **Excel, CSV, relevés bancaires, dépenses, main-d'œuvre,
clients, fournisseurs, véhicules.** Chaque import est **tracé**, **idempotent**
(rejeu sans doublon) et passe par les **règles métier** (un montant importé passe par
le moteur, jamais directement en base). Endpoints : `imports:create`,
`imports/{id}:preview`, `imports/{id}:commit`, `imports/{id}` (statut/rapport).

## 32. Exports

Formats : **Excel, CSV, PDF, rapports.** Portées : **données filtrées, période,
chantier, client, véhicule, finance, audit.** Les exports **respectent les
permissions** de l'utilisateur (on n'exporte que ce qu'on a le droit de voir) et
sont **journalisés** lorsqu'ils contiennent des données sensibles (N3/N4). Export
volumineux = **asynchrone** (§33) avec URL signée de récupération.

---

# Partie F — Asynchrone, automatisations & observabilité

## 33. Traitements asynchrones

Opérations **asynchrones** : **imports, exports importants, OCR, indexation RAG,
analyse IA, génération de rapport, notifications en masse, synchronisation
calendrier, rapprochement bancaire, recalculs importants, détection d'anomalies.**

Chaque traitement expose : **file d'attente**, **priorité**, **délai**, **retry**,
**backoff**, **dead-letter queue**, **statut**, **annulation**, **supervision**.
Un client suit un traitement via `GET /api/v1/jobs/{id}` (statut + résultat/URL).

## 34. Automatisations

Interfaces : **déclencher, planifier, interrompre, reprendre, réessayer, annuler,
consulter le statut, consulter l'historique, traiter les erreurs, demander une
validation humaine.** Chaque **exécution** a un **identifiant unique** et un statut
parmi : **planifiée, en attente, en cours, en validation, réussie, échouée,
annulée, partiellement réussie** (Automation Bible). Endpoints :
`automations/{id}:trigger`, `.../runs/{runId}` (statut), `.../runs/{runId}:cancel`,
`.../runs/{runId}:approve` (validation humaine).

## 35. Santé & observabilité

Interfaces techniques **séparées** (non publiques, sans donnée sensible) : **état
général, disponibilité, dépendances, base de données, file d'attente, stockage,
fournisseur IA, services externes.** Ex. : `/internal/health` (vivacité),
`/internal/ready` (dépendances). Réservées à l'exploitation et à la supervision.

---

# Partie G — Événements & intégrations

## 36. Événements métier

**Catalogue officiel** (nommage `domaine.fait`, versionné). Exemples :
`invoice.created`, `invoice.issued`, `payment.recorded`, `expense.created`,
`project.started`, `project.margin-drift-detected`, `vehicle.maintenance-due`,
`fine.payment-deadline-approaching`, `task.priority-changed`, `document.expiring`,
`calendar.event-imported`, `ai.action-proposed`.

Pour **chaque événement**, le catalogue précise : **nom, version, producteur,
consommateurs, données minimales (payload), date, entreprise, utilisateur ou système
à l'origine, identifiant de corrélation, niveau de sensibilité, stratégie de rejeu,
idempotence.** Règles : évolution **additive** (consommateurs tolérants) ; un type
publié **ne disparaît jamais** en silence ; livraison **au moins une fois** +
consommateurs **idempotents** (Business Rules 13, Master Blueprint 13).

## 37. Webhooks (préparation)

Architecture **future** de webhooks **entrants** et **sortants**. Contrats :
**signature** (secret partagé), **horodatage**, **anti-rejeu** (fenêtre + nonce),
**idempotence** (`eventId`), **liste blanche** éventuelle, **tentatives** + **backoff**,
**journalisation**, **désactivation**, **rotation des secrets**.

> **API-WH-01.** **Aucun webhook ne fait confiance** aux données reçues sans
> **validation** (schéma + signature + autorisation) — elles sont traitées comme
> **données non fiables** (Security). Secrets au coffre, jamais dans le dépôt.

## 38. Intégration BRN Visite Technique

> **API-BVT-01.** Deux applications **séparées** ; **jamais** de base de données
> partagée. Communication future via **API + événements**, derrière un **connecteur**
> (adaptateur anti-corruption).

Données transmissibles (à terme) : **client, adresse, visite, rapport, pièces,
mesures, travaux identifiés, photos, documents, chiffrage, statut, utilisateur ayant
réalisé la visite.**

Le contrat définit pour **chaque donnée** :

| Aspect | Règle |
|---|---|
| **Source de vérité** | Le **métré/relevé** fait foi côté BRN Visite Technique ; le **devis/chantier** fait foi côté BRN Pilot. Chaque champ a un propriétaire unique. |
| **Synchronisation** | Sens (entrant : visite → devis), fréquence (événement `visit.finalized`), traduction de vocabulaire par le connecteur. |
| **Doublons** | Dédoublonnage par **identité externe stable** (référence de visite) ; réconciliation des **tiers/clients** (éviter les doublons de clients). |
| **Modifications** | Une donnée reçue est **conservée à l'identique** ; une évolution côté source produit un nouvel événement (pas d'écrasement silencieux). |
| **Erreurs** | File + réessais ; panne d'une application n'affecte pas l'autre. |
| **Autorisations** | Identité de service dédiée, à moindre privilège. |
| **Traçabilité** | Chaque échange journalisé et audité. |

## 39. Calendrier Apple (stratégies — non implémenté)

> **API-CAL-01.** Interface de **connecteur préparée**, **rien implémenté** (Master
> Blueprint 40). **Ne pas supposer** qu'Apple Calendar fournit une API serveur
> simple. Plusieurs stratégies possibles, avec leurs limites :

| Stratégie | Principe | Limites |
|---|---|---|
| **CalDAV** | Accès standard aux calendriers. | Authentification/config parfois complexe ; support variable. |
| **Synchronisation locale via appareil autorisé** | L'app mobile (autorisée) lit l'agenda du dirigeant et pousse vers BRN Pilot. | Dépend de l'appareil et de ses permissions ; nécessite l'app mobile. |
| **Import ICS** | Import d'un fichier/abonnement calendrier. | Souvent en lecture seule, latence, pas temps réel. |
| **Connecteur tiers** | Service d'agrégation d'agendas. | Dépendance et coût d'un tiers ; souveraineté à vérifier. |
| **Saisie interne + export** | Agenda saisi dans BRN Pilot, exporté vers Apple. | Ressaisie initiale ; sens inverse. |

Le contrat de connecteur est **agnostique** de la stratégie retenue : il expose des
**rendez-vous** normalisés (§27) avec **identité externe** (dédoublonnage), **sens**
(lecture seule d'abord), **conflits** signalés. La décision de stratégie est une
**question ouverte** (à trancher le moment venu).

## 40. Banque (préparation)

Connecteur bancaire **préparé** (agrégation de relevés pour le rapprochement, §21).
Isolé derrière un adaptateur ; import bancaire **idempotent** (§10) ; secrets au
coffre ; aucune dépendance dure. **Rien implémenté en V1.**

---

# Partie H — Intelligence artificielle

## 41. API IA (AI Gateway interne)

Contrats **internes** de l'AI Gateway (Automation Bible E). Capacités : **demande
d'analyse, brief quotidien, question conversationnelle, génération de brouillon,
classification, extraction documentaire, proposition d'action, explication,
recherche RAG.** Chaque réponse porte : **sources, niveau de confiance, coût,
fournisseur, modèle, version du prompt**, et l'**étiquetage** fait/calcul/
estimation/recommandation.

> **API-AI-01.** L'IA **ne peut jamais** appeler directement les tables ni
> contourner les services métier. Elle utilise des **outils internes contrôlés**
> (lecture via les mêmes contrats, filtrés par droits). Les **chiffres officiels**
> viennent du moteur (API-P03) ; l'IA les **reçoit**, ne les produit pas.
> **Multi-fournisseur** (Claude/ChatGPT/Gemini/local) via le Gateway ; sans IA, le
> métier continue (`ERR-AI-UNAVAILABLE`, API-P13).

## 42. Actions IA

> **API-AI-02 — Cycle complet d'une action proposée :**
> 1. **demande ou détection** ;
> 2. **collecte des données autorisées** (droits de l'utilisateur) ;
> 3. **génération de la proposition** ;
> 4. **affichage des sources** ;
> 5. **affichage des conséquences** ;
> 6. **validation humaine** ;
> 7. **exécution par le service métier** (jamais par l'IA elle-même) ;
> 8. **audit** ;
> 9. **retour du résultat**.

Chaque proposition a un **identifiant unique** et un **délai de validité**. Une
proposition **expirée** (`ERR-EXPIRED`) ou **déjà refusée** **ne peut pas** être
exécutée. L'exécution est **idempotente** (§10) et **auditée** (`ai.action-proposed`,
`ai.action-approved`, `ai.action-executed`, `ai.action-rejected`).

## 43. RAG

Interfaces : **indexer un document, supprimer un index, réindexer, rechercher,
filtrer par entreprise, filtrer par droits, citer les sources, gérer la version d'un
document, exclure un document confidentiel, journaliser les consultations
sensibles.**

> **API-RAG-01.** Le système **filtre les droits avant et après** la recherche : on
> n'indexe/ne renvoie que ce que l'utilisateur peut voir ; un document **confidentiel
> hors périmètre** est **exclu**. Cloisonnement **par entreprise** strict. Chaque
> réponse **cite ses sources** ; les consultations sensibles sont **journalisées**.

---

# Partie I — Qualité & gouvernance

## 44. Tests de contrat

Prévus : **schémas validables** (source de vérité des contrats), **tests de
contrat** (le client et le serveur respectent le schéma), **tests d'intégration**,
**compatibilité ascendante**, **jeux de données de test**, **scénarios d'erreur**,
**tests d'autorisation**, **tests multi-entreprise (étanchéité)**, **tests
d'idempotence**, **tests de concurrence**, **tests de webhooks**, **tests IA avec
réponses simulées** (l'IA est simulable pour tester sans fournisseur).

## 45. Documentation

Documentation destinée aux **développeurs, intégrateurs, applications internes,
futurs partenaires**. Elle contient pour chaque contrat : **description, exemples,
schémas, permissions, erreurs, limites, version, dépréciation.**

> **API-DOC-01.** La documentation technique **ne contient jamais** de vrais secrets
> ni de données réelles (données d'exemple fictives). Générée depuis les **schémas**
> (source unique), donc toujours à jour.

## 46. Critères d'acceptation

> Vérifiables lors de la conception détaillée et des revues. Une API n'est
> **conforme** que si :

| ID | Critère |
|---|---|
| AC-API-01 | **Aucun accès inter-entreprise** possible (test d'étanchéité). |
| AC-API-02 | **Aucune opération financière dupliquée** en cas de rejeu (idempotence). |
| AC-API-03 | **Aucune action sensible sans autorisation** (contrôle serveur). |
| AC-API-04 | **Aucun calcul officiel dépendant de l'IA** (moteur déterministe). |
| AC-API-05 | **Aucune modification silencieuse** d'un contrat (versionnement). |
| AC-API-06 | **Aucune erreur interne sensible** exposée. |
| AC-API-07 | **Chaque opération importante** est **auditée**. |
| AC-API-08 | **Chaque endpoint** est **documenté**. |
| AC-API-09 | **Chaque ressource** est **protégée côté serveur**. |
| AC-API-10 | **Chaque intégration externe** est **isolée derrière un adaptateur**. |
| AC-API-11 | **Chaque événement** est **versionné**. |
| AC-API-12 | **Chaque import** est **prévisualisé avant validation**. |
| AC-API-13 | **Chaque fichier** est **contrôlé avant disponibilité**. |
| AC-API-14 | **Chaque action IA** est **confirmée selon son niveau d'autonomie**. |

## 47. Traçabilité vers les autres documents fondateurs

| Thème API | API Bible | Master Blueprint | Business Rules | Data | Security | Automation | Product/UX |
|---|---|---|---|---|---|---|---|
| Style REST + commandes + événements | §3 | ch. 12, 13 | Parties B/D | — | — | B2 | — |
| Versionnement sans rupture | §5 | 29 | — | — | SEC-API-006 | — | P11 |
| Montants centimes + devise | §6 | 15 | 15.3, CALC-FIN | A3 | — | — | UX-P07 |
| Enveloppe & erreurs | §7, §8 | 25 | 25 | — | F | — | F5 (UX) |
| Concurrence (verrou optimiste) | §9 | 9.5, 30 | INV-2 | A4 | SEC-API-003 | — | — |
| Idempotence | §10 | 8.4 | INV-5 | — | SEC-API-004 | B7 | — |
| Auth & autorisation | §14 | 17, 18 | INV-7 | A7 | C, Partie E | — | — |
| Audit & journaux | §15 | 19, 26 | INV-6 | E-AUDIT | F | B8 | — |
| Opérations métier (commandes) | Partie D | 14 | ST-…, BR-… | Partie C | — | Partie C | UX P05 |
| Chiffres officiels ≠ IA | §18, Partie H | P6 | INV-1, IA-001 | attributs calculés | SEC-IA-008 | AG-P2 | UX-AI-03 |
| Imports/exports/fichiers | §30–§32 | 22 | 22 | E-DOCUMENT | D3, D4 | — | — |
| Automatisations & async | §33, §34 | 8.3, 14 | Partie I (WF) | — | — | Partie B/C | — |
| Événements & webhooks | §36, §37 | 13 | Partie B | E-EVENEMENT | J | — | — |
| BRN Visite Technique | §38 | 23 | BR-CAL/connecteur | E-VISITE | C7 | B5 | — |
| Apple Calendar (stratégies) | §39 | 40 | BR-CAL | E-SOURCECAL | G3 | AUTO-CAL | — |
| IA / RAG | §41–§43 | 24 | Partie J | C14 | G1 | Partie E | UX Partie I |

---

## Fin du document

> **BRN PILOT — API Bible v1.0.** Tous les contrats d'échange de *BRN Pilot* :
> architecture (REST + commandes métier + événements), conventions, catalogue des
> ressources et opérations métier, événements, intégrations, sécurité, erreurs,
> idempotence, concurrence, imports/exports, fichiers, automatisations, IA, RAG,
> observabilité, versionnement, tests et critères d'acceptation. Document normatif,
> **sans code, sans endpoint réel, sans schéma SQL**.
>
> **Règle d'or.** L'API **expose**, elle ne **décide** pas : les règles viennent des
> services de domaine, les chiffres officiels du moteur, l'autorisation du serveur.
> Aucun contrat ne change en silence ; aucune entreprise ne voit une autre ; aucune
> opération financière ne se duplique ; aucune action sensible sans validation.
>
> À relire et valider **avant** la Developer Bible.
