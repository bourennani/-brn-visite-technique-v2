# BRN PILOT — SECURITY BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **toute la
> sécurité** de *BRN Pilot* : architecture de sécurité de **niveau entreprise**,
> pensée **avant** le développement.
>
> **La sécurité fait partie intégrante du produit. Elle n'est jamais ajoutée après
> le développement.** Toute fonctionnalité respecte cette Bible dès sa conception.
>
> **Règle de gouvernance.** Aucun mécanisme touchant à l'authentification,
> l'autorisation, le chiffrement, la journalisation ou la conformité n'est
> développé sans être défini ici. Tout code de sécurité **cite l'identifiant** du
> contrôle (`SEC-…`).
>
> **Ce document ne contient aucun code.** Nous restons en **phase de conception**.
>
> **Statut :** v1.0 — référence en cours de constitution.
> **Cohérence :** aligné sur le Master Blueprint v1.1, la Business Rules Bible v1.0
> et la Data Bible v1.0.
> **Ambition :** multi-société (plusieurs entreprises sur la même plateforme) avec
> un **haut niveau de sécurité** et une **compatibilité audit / certification**.

---

## Table des matières

**Partie A — Fondations**
- A1. Objectif et portée
- A2. Principes de sécurité
- A3. Politique Zero Trust
- A4. Gouvernance de la sécurité

**Partie B — Classification des données** (4 niveaux)

**Partie C — Identité & contrôle d'accès**
- C1. Authentification
- C2. Double authentification (MFA)
- C3. Gestion des sessions
- C4. Rôles et permissions
- C5. Séparation des droits
- C6. Contrôle d'accès par module
- C7. Contrôle d'accès par entreprise (multi-société)
- C8. Contrôle d'accès par donnée
- C9. Matrice complète des permissions (rôle × module × action)

**Partie D — Protection des données**
- D1. Chiffrement
- D2. Gestion des secrets
- D3. Sécurité des documents et fichiers
- D4. Validation des fichiers & antivirus (futur)

**Partie E — Protection applicative**
- E1. Validation des entrées & injections
- E2. XSS
- E3. CSRF
- E4. Force brute & limitation de débit
- E5. Sécurité des API

**Partie F — Traçabilité & détection**
- F1. Journalisation
- F2. Audit
- F3. Historique
- F4. Journal des connexions
- F5. Détection d'activité suspecte

**Partie G — Sécurité par surface**
- G1. Sécurité IA
- G2. Sécurité mobile
- G3. Sécurité des synchronisations Apple Calendar

**Partie H — Sécurité de la chaîne (SecDevOps)**
- H1. Sécurité GitHub
- H2. Sécurité CI/CD
- H3. Gestion des environnements
- H4. Dépendances et chaîne d'approvisionnement

**Partie I — Résilience**
- I1. Sauvegardes et restauration
- I2. Continuité et reprise (PRA)
- I3. Réponse à incident

**Partie J — Conformité, audit & RGPD**
- J1. RGPD (conservation, suppression, archivage)
- J2. Compatibilité audit de sécurité
- J3. Compatibilité certification
- J4. Évolution future

**Partie K — Matrices consolidées & traçabilité**

> **Convention.** Chaque contrôle porte un identifiant `SEC-<DOMAINE>-NNN`, stable
> et jamais recyclé, pour l'auditabilité.

---

# Partie A — Fondations

## A1. Objectif et portée

Doter *BRN Pilot* d'une **architecture de sécurité de niveau entreprise**,
permettant à terme l'usage par **plusieurs sociétés** sur la même plateforme, avec
un cloisonnement strict et un haut niveau de garantie. La sécurité couvre :
l'identité, l'accès, les données, l'application, la traçabilité, les surfaces
spécifiques (IA, mobile, calendrier), la chaîne de fabrication et la conformité.

## A2. Principes de sécurité

| # | Principe | Énoncé |
|---|---|---|
| SEC-P1 | **Sécurité par conception** | La sécurité est décidée en amont, jamais ajoutée après (ce document). |
| SEC-P2 | **Zero Trust** | Aucune confiance implicite ; chaque accès est vérifié (A3). |
| SEC-P3 | **Moindre privilège** | Chacun (humain, service, IA) n'a que les droits strictement nécessaires. |
| SEC-P4 | **Défense en profondeur** | Plusieurs couches indépendantes ; la défaillance d'une couche n'ouvre pas tout. |
| SEC-P5 | **Cloisonnement** | Par entreprise, par module, par donnée (C6–C8). |
| SEC-P6 | **Confidentialité par défaut** | Une donnée est fermée par défaut, ouverte par décision explicite. |
| SEC-P7 | **Traçabilité intégrale** | Tout accès et action sensible est journalisé (Partie F). |
| SEC-P8 | **Respect de la vie privée (privacy by design)** | Minimisation, finalité, conservation limitée (RGPD, J1). |
| SEC-P9 | **Réversibilité et standards ouverts** | Pas de dépendance irremplaçable ; export possible. |
| SEC-P10 | **Auditabilité** | Le système est conçu pour être audité et, à terme, certifié (J2–J3). |
| SEC-P11 | **Aucun secret dans le code** | Les secrets vivent dans un coffre, jamais dans le dépôt ni le frontend. |
| SEC-P12 | **Supposer la compromission** | On conçoit comme si une couche était déjà percée (segmentation, journalisation, détection). |

## A3. Politique Zero Trust

> **SEC-ZT-001 — Principe.** *BRN Pilot* ne fait **jamais confiance par défaut**.
> **Chaque accès est contrôlé**, quelle que soit son origine (interne, externe,
> service, IA).

Règles Zero Trust :

- **SEC-ZT-002 — Vérification explicite.** Chaque requête est authentifiée et
  autorisée **individuellement** (identité + droits + contexte), à chaque appel —
  pas une seule fois à la connexion.
- **SEC-ZT-003 — Pas de confiance réseau.** L'appartenance au réseau interne ne
  confère **aucun** privilège. Un service interne s'authentifie comme un externe.
- **SEC-ZT-004 — Autorisation côté serveur.** L'interface n'est jamais l'autorité :
  elle masque pour le confort ; le **serveur décide** (aligné Master Blueprint 18.3).
- **SEC-ZT-005 — Moindre privilège systématique.** Droits minimaux, périmètre
  minimal, durée minimale (jetons courts).
- **SEC-ZT-006 — Contexte pris en compte.** L'accès peut être affiné selon le
  contexte (appareil, heure, comportement inhabituel — F5).
- **SEC-ZT-007 — Micro-segmentation.** Chaque module a ses propres droits d'accès
  aux données (cloisonnement physique par module, Master Blueprint 9.3).
- **SEC-ZT-008 — Chaque donnée porte son niveau.** L'accès dépend de la
  **classification** de la donnée (Partie B) et du besoin d'en connaître.

## A4. Gouvernance de la sécurité

- **SEC-GOV-001 — Source unique.** Aucune mesure de sécurité importante hors de
  cette Bible ; le code cite l'identifiant du contrôle.
- **SEC-GOV-002 — Responsable sécurité.** Un rôle (interne ou délégué) veille au
  respect de cette Bible, arbitre les exceptions, suit les incidents.
- **SEC-GOV-003 — Revue de sécurité obligatoire.** Toute évolution touchant
  identité/accès/données/secrets passe une revue de sécurité avant fusion.
- **SEC-GOV-004 — Exceptions tracées.** Toute dérogation est écrite, justifiée,
  datée, à durée limitée, et revue.
- **SEC-GOV-005 — Amélioration continue.** Revue périodique (menaces, dépendances,
  incidents) ; test d'intrusion à envisager avant mise en service élargie.

---

# Partie B — Classification des données

Chaque donnée porte **un niveau de protection**. Le niveau détermine le
chiffrement, les droits, la journalisation et la conservation.

| Niveau | Nom | Définition | Exemples | Exigences minimales |
|---|---|---|---|---|
| **N1** | **Public** | Diffusable sans risque. | Nom commercial, mentions légales publiques. | Intégrité ; pas de restriction de lecture. |
| **N2** | **Interne** | Réservé à l'entreprise, non sensible. | Référentiels, libellés d'ouvrages, paramètres non financiers. | Accès authentifié ; chiffrement en transit. |
| **N3** | **Confidentiel** | Sensible pour l'entreprise ; fuite dommageable. | Devis, factures, marges, coûts, trésorerie, clients, chantiers, stock. | Chiffrement en transit + au repos ; accès par rôle et par entreprise ; journalisation des accès. |
| **N4** | **Très sensible** | Données personnelles sensibles / hautement stratégiques. | Données RH (salariés, paie), **conducteurs et contraventions (infractions, points)**, secrets, décisions du dirigeant, données d'authentification. | Chiffrement renforcé ; accès **strictement restreint** et **journalisé** ; conservation minimale ; masquage/anonymisation dès que possible ; jamais envoyé à un tiers (dont IA) sans nécessité et autorisation. |

Règles transverses :

- **SEC-CLASS-001.** Toute entité de la Data Bible reçoit un **niveau** (Partie K).
  En l'absence de niveau explicite, le défaut est **N3 (Confidentiel)** (SEC-P6).
- **SEC-CLASS-002.** Le niveau **remonte** : un agrégat contenant une donnée N4 est
  traité au moins comme N4.
- **SEC-CLASS-003.** Les traitements (export, IA, sauvegarde, journalisation)
  appliquent les règles du niveau le plus élevé présent.
- **SEC-CLASS-004.** Les données **N4** ne sont **jamais** journalisées en clair ni
  transmises à un service tiers sans base légale, minimisation et autorisation.

---

# Partie C — Identité & contrôle d'accès

## C1. Authentification

- **SEC-AUTH-001 — Authentification déléguée.** L'authentification est déléguée à
  un fournisseur d'identité standard (protocole ouvert, type OpenID Connect). *BRN
  Pilot* **ne stocke aucun mot de passe** (Master Blueprint 17, D8).
- **SEC-AUTH-002 — Identité vérifiée à chaque requête.** L'organisation et les
  rôles sont **dérivés du jeton**, jamais fournis par le client (SEC-ZT-002).
- **SEC-AUTH-003 — Jetons courts.** Jetons d'accès à durée limitée + jeton de
  rafraîchissement ; **révocation** possible à tout instant.
- **SEC-AUTH-004 — Politique de mots de passe** (au niveau du fournisseur
  d'identité) : longueur/complexité minimales, blocage des mots de passe compromis,
  pas de rotation forcée absurde.
- **SEC-AUTH-005 — Comptes de service.** Les accès non humains (connecteurs, IA,
  BRN Visite Technique) utilisent des **identités de service dédiées**, à moindre
  privilège, révocables, distinctes des comptes humains.

## C2. Double authentification (MFA)

- **SEC-MFA-001 — MFA obligatoire pour les rôles à privilèges** : Direction,
  Administration technique, Finance, RH, Gestionnaire de flotte (accès N4).
- **SEC-MFA-002 — MFA recommandé pour tous** ; activable par l'organisation.
- **SEC-MFA-003 — Facteurs acceptés.** Application d'authentification (recommandé),
  clé matérielle (idéal pour la direction). Les SMS sont tolérés en dernier recours.
- **SEC-MFA-004 — Ré-authentification pour les actions critiques.** Actions
  hautement sensibles (changement de droits, export massif, configuration IA,
  gestion des secrets) exigent une **ré-authentification** récente.

## C3. Gestion des sessions

- **SEC-SESS-001 — Sessions serveur maîtrisées.** Durée de vie limitée ;
  expiration d'inactivité ; expiration absolue.
- **SEC-SESS-002 — Révocation.** Déconnexion à distance, révocation par appareil
  (perte d'un mobile de chantier — SEC-MOB).
- **SEC-SESS-003 — Liaison au contexte.** Une session anormale (changement brutal
  de contexte) peut être invalidée (F5).
- **SEC-SESS-004 — Pas de secret exploitable côté client.** Les jetons sont
  protégés (transport sécurisé, stockage adapté) ; aucun secret durable exposé au
  frontend (SEC-P11).

## C4. Rôles et permissions

- **SEC-ROLE-001 — Modèle rôles + attributs.** Les **rôles** donnent des capacités ;
  les **attributs** restreignent le périmètre (organisation, chantiers/véhicules
  affectés, propriété, classification). Master Blueprint 18, Data Bible A7.
- **SEC-ROLE-002 — Permissions élémentaires.** Une permission = capacité
  d'effectuer une **action** sur un **type d'objet** (voir C9). Les rôles
  composent des permissions.
- **SEC-ROLE-003 — Sensibilité des permissions.** Chaque permission porte une
  **catégorie de sensibilité** (`standard | sensible | critique`) ; les critiques
  exigent MFA/ré-auth (SEC-MFA-004).
- **SEC-ROLE-004 — Rôles de référence.** Direction, Conducteur de travaux,
  Commercial, Comptable/ADV, RH, Magasinier, Gestionnaire de flotte, Administrateur
  technique ; (Client et Sous-traitant : portails futurs, périmètre restreint).

## C5. Séparation des droits (SoD)

- **SEC-SOD-001 — Séparation des tâches sensibles.** Les fonctions incompatibles
  sont séparées : par exemple, **création** d'une dépense/paiement et **validation**
  ne relèvent pas nécessairement de la même personne pour les montants élevés.
- **SEC-SOD-002 — Validation des actes engageants.** Tout acte engageant exige une
  **validation** (aligné Business Rules INV-7) ; l'auteur ne s'auto-valide pas
  au-delà d'un seuil configurable.
- **SEC-SOD-003 — Administration séparée du métier.** L'**Administrateur technique**
  (infrastructure, secrets, sécurité) est distinct de la **Direction** (métier) :
  aucun rôle ne cumule tous les pouvoirs sans traçabilité.
- **SEC-SOD-004 — Le pouvoir d'accorder des droits est tracé.** Modifier les rôles
  d'un utilisateur est une action critique (audit + ré-auth).

## C6. Contrôle d'accès par module

- **SEC-ACC-MOD-001 — Micro-segmentation par module.** Chaque module (Finance,
  Chantiers, RH, Parc, Contraventions…) a ses propres droits d'accès aux données ;
  un module ne lit/écrit jamais les données d'un autre (cloisonnement physique,
  Master Blueprint 9.3).
- **SEC-ACC-MOD-002 — Accès inter-module par contrat.** Les échanges passent par
  API interne ou événements, jamais par accès direct (respect P3 du Blueprint).
- **SEC-ACC-MOD-003 — Modules très sensibles.** L'**Espace Dirigeant** et les
  **Contraventions** ont des droits d'accès **restreints par défaut** (voir C9).

## C7. Contrôle d'accès par entreprise (multi-société)

- **SEC-ACC-ORG-001 — Cloisonnement d'organisation.** Chaque donnée porte son
  **identifiant d'organisation** ; toute requête est filtrée par cet identifiant
  (Master Blueprint D4, Data Bible A4).
- **SEC-ACC-ORG-002 — Isolation à deux niveaux.** Filtrage systématique dans la
  couche d'accès **et** contrôle au niveau de la base (sécurité au niveau ligne).
  Même une requête fautive ne peut pas franchir la frontière d'entreprise.
- **SEC-ACC-ORG-003 — Étanchéité testée.** L'isolation inter-entreprises est
  vérifiée par des **tests d'étanchéité** systématiques.
- **SEC-ACC-ORG-004 — Aucun croisement.** Aucune fonctionnalité (recherche, IA,
  export, pilotage) ne peut agréger des données de deux organisations distinctes.
- **SEC-ACC-ORG-005 — Administration par organisation.** Chaque organisation gère
  ses propres utilisateurs et rôles ; un super-administrateur de plateforme, s'il
  existe, agit sous **traçabilité renforcée** et jamais silencieusement.

## C8. Contrôle d'accès par donnée

- **SEC-ACC-DAT-001 — Accès par attributs (ABAC).** Au-delà du rôle, l'accès est
  filtré par **attributs** : affectation (ses chantiers, ses véhicules), propriété
  (ses tâches/notes), statut, et **classification** (Partie B).
- **SEC-ACC-DAT-002 — Besoin d'en connaître.** Une donnée N3/N4 n'est accessible
  qu'aux personnes qui en ont besoin pour leur fonction.
- **SEC-ACC-DAT-003 — Non-divulgation.** Une ressource hors périmètre renvoie « non
  trouvé », jamais un indice de son existence (aligné Master Blueprint 12.2).
- **SEC-ACC-DAT-004 — Masquage.** Les champs très sensibles (points de permis,
  données de paie) sont **masqués** par défaut et révélés seulement au besoin,
  avec journalisation.

## C9. Matrice complète des permissions (rôle × module × action)

**Actions :** **L** Lecture · **C** Création · **M** Modification · **S** Suppression
(logique) · **V** Validation · **E** Export · **A** Administration.

**Portée :** toutes les cellules sont **restreintes par attributs** (organisation,
affectation) et **vérifiées côté serveur**. « — » = aucun accès. « L(∘) » = lecture
limitée à son périmètre (ses chantiers/véhicules).

| Module ↓ / Rôle → | Direction | Conducteur | Commercial | Comptable/ADV | RH | Magasinier | Gest. flotte | Admin technique |
|---|---|---|---|---|---|---|---|---|
| **Espace Dirigeant** | L C M S V E A | — | — | — | — | — | — | — |
| **Pilotage / Tableau de bord** | L E | L(∘) | L | L | — | — | L(∘) | — |
| **CRM** | L C M S E | L(∘) | L C M V E | L | — | — | — | — |
| **Finance — Devis** | L C M S V E | L(∘) | L C M | L | — | — | — | — |
| **Finance — Factures/Encaiss.** | L C M V E | — | L | L C M V E | — | — | — | — |
| **Finance — Dépenses** | L C M S V E | L C(∘) | — | L C M V E | — | L C(∘) | L C(∘) | — |
| **Chantiers** | L C M S V E | L C M(∘) | L | L | — | — | — | — |
| **RH** | L E | L(∘) | — | — | L C M S V E | — | — | — |
| **Stock** | L E | L(∘) | — | L | — | L C M S E | — | — |
| **Parc Véhicules** | L C M S V E | L(∘) | — | L | — | — | L C M S V E | — |
| **Contraventions** | L C M S V E | — | — | L (montant) | — | — | L C M S V E | — |
| **Documents** | selon l'objet lié + classification | | | | | | | — |
| **IA / Copilote** | L C(∘) | L(∘) | L(∘) | L(∘) | L(∘) | L(∘) | L(∘) | — |
| **Paramètres & Sécurité** | L (métier) | — | — | — | — | — | — | L C M S V E A |

Règles de la matrice :

- **SEC-PERM-001.** L'**Administrateur technique** administre l'infrastructure, les
  secrets, la sécurité et les paramètres techniques — **sans** accès aux données
  métier (N3/N4) en clair au-delà du strict nécessaire d'exploitation, et sous
  audit.
- **SEC-PERM-002.** La **Direction** a la vue métier la plus large mais **ne
  détient pas** l'administration technique/sécurité (séparation des pouvoirs,
  SEC-SOD-003).
- **SEC-PERM-003.** Les **Contraventions** (N4) et l'**Espace Dirigeant** (N4) sont
  fermés à tous les rôles sauf Direction et, pour le parc, Gestionnaire de flotte ;
  le Comptable ne voit que le **montant** d'une contravention (pas l'identité/points
  sauf droit explicite).
- **SEC-PERM-004.** L'**Export** (E) est une action **à part**, journalisée
  (données N3/N4), soumise à autorisation et éventuellement à ré-authentification.
- **SEC-PERM-005.** La **Validation** (V) implémente la séparation des droits
  (SEC-SOD) ; au-delà d'un seuil, l'auteur d'un acte ne peut pas le valider.
- **SEC-PERM-006.** Les rôles **Client** et **Sous-traitant** (futurs) n'ont que
  **L** sur **leurs** objets (leurs chantiers, documents, lots).

---

# Partie D — Protection des données

## D1. Chiffrement

- **SEC-ENC-001 — En transit.** TLS partout, y compris entre services internes
  (SEC-ZT-003). Aucune donnée en clair sur le réseau.
- **SEC-ENC-002 — Au repos.** Base de données et stockage de fichiers chiffrés au
  repos.
- **SEC-ENC-003 — Niveau applicatif pour le N4.** Les données très sensibles
  (secrets, éléments d'authentification, données très personnelles) sont chiffrées
  **en plus** au niveau applicatif.
- **SEC-ENC-004 — Gestion des clés.** Clés gérées par un service dédié (coffre),
  **rotation** régulière, séparation des clés par environnement, jamais de clé dans
  le code ni le dépôt.
- **SEC-ENC-005 — Sauvegardes chiffrées.** Les sauvegardes sont chiffrées (I1).

## D2. Gestion des secrets

- **SEC-SECRET-001 — Aucun secret dans le code ni le dépôt** (SEC-P11). Vérifié par
  analyse automatique (H2).
- **SEC-SECRET-002 — Coffre à secrets.** Les secrets (clés, jetons de connecteurs,
  identifiants IA) vivent dans un **coffre**, injectés à l'exécution.
- **SEC-SECRET-003 — Aucune clé dans le frontend.** Les identifiants des services
  (IA, stockage, connecteurs) restent **côté serveur** (aligné Business Rules
  IA-085).
- **SEC-SECRET-004 — Séparation par environnement.** Secrets distincts dev /
  recette / production, jamais partagés.
- **SEC-SECRET-005 — Rotation et révocation.** Rotation régulière ; révocation
  immédiate en cas de suspicion.

## D3. Sécurité des documents et fichiers

- **SEC-DOC-001 — Stockage séparé et chiffré.** Les fichiers vivent dans un
  stockage objet chiffré, séparés de la base (Master Blueprint 16).
- **SEC-DOC-002 — Accès contrôlé.** Accès aux fichiers via **URLs signées à durée
  limitée**, soumises aux mêmes autorisations et à la **classification** que les
  données (un document hérite du niveau de son objet).
- **SEC-DOC-003 — Intégrité.** Empreinte de chaque fichier (intégrité,
  dédoublonnage) ; documents émis **immuables et versionnés**.
- **SEC-DOC-004 — Traçabilité.** Consultation/téléchargement des documents N3/N4
  journalisés.

## D4. Validation des fichiers & antivirus (futur)

- **SEC-FILE-001 — Validation à l'entrée.** Type MIME et extension contrôlés ;
  taille bornée ; rejet des types non autorisés.
- **SEC-FILE-002 — Normalisation.** Compression/normalisation des images à
  l'entrée (réduit la surface et le volume).
- **SEC-FILE-003 — Pas d'exécution.** Les fichiers téléversés ne sont jamais
  interprétés/exécutés ; servis avec des en-têtes sûrs (téléchargement, pas de rendu
  actif).
- **SEC-FILE-004 — Antivirus (préparation).** L'architecture **réserve la place**
  d'une analyse antivirus des fichiers téléversés (à activer plus tard) : le flux
  d'envoi permet d'insérer une étape d'analyse **avant** mise à disposition, sans
  refonte. Rien n'est développé à ce stade.

---

# Partie E — Protection applicative

## E1. Validation des entrées & injections

- **SEC-APP-001 — Validation systématique côté serveur.** Toute entrée est validée
  contre un schéma (le serveur ne fait jamais confiance au client, SEC-ZT-004).
- **SEC-APP-002 — Protection injection (SQL et autres).** Requêtes **paramétrées**
  uniquement ; aucune concaténation de données utilisateur dans une requête ; pas
  d'interprétation dynamique de données non maîtrisées.
- **SEC-APP-003 — Sortie encodée.** Les données sont encodées selon le contexte de
  sortie (voir E2).

## E2. XSS (injection de scripts)

- **SEC-APP-010 — Encodage de sortie.** Toute donnée affichée est encodée selon son
  contexte ; aucune injection de contenu utilisateur comme code.
- **SEC-APP-011 — Politique de sécurité du contenu.** Restreindre les sources de
  scripts/ressources ; interdire l'exécution de contenu non maîtrisé.
- **SEC-APP-012 — Contenu utilisateur = donnée.** Le contenu saisi ou importé (y
  compris pour l'IA/RAG) est traité comme **donnée**, jamais comme instruction
  (lien avec G1).

## E3. CSRF (requêtes falsifiées)

- **SEC-APP-020 — Protection anti-CSRF.** Les actions modifiant l'état exigent un
  élément anti-falsification (jeton/entête) ; l'origine des requêtes est vérifiée.
- **SEC-APP-021 — Méthodes sûres.** Les lectures n'ont pas d'effet de bord ; seules
  les méthodes appropriées modifient l'état.

## E4. Force brute & limitation de débit

- **SEC-APP-030 — Anti-force brute.** Tentatives d'authentification limitées
  (au niveau du fournisseur d'identité), temporisation progressive, blocage après
  seuil.
- **SEC-APP-031 — Limitation de débit.** À la passerelle : quotas par
  identité/adresse ; protection contre l'abus et le déni de service applicatif.
- **SEC-APP-032 — Limites métier.** Actions de masse (envois, exports,
  automatisations) plafonnées (aligné Business Rules 14.4).

## E5. Sécurité des API

- **SEC-API-001 — HTTPS uniquement**, derrière la passerelle.
- **SEC-API-002 — Authentification et autorisation à chaque appel** (SEC-ZT-002) ;
  l'organisation et les rôles dérivés du jeton.
- **SEC-API-003 — Verrou optimiste.** Les écritures fournissent le numéro de
  révision ; une révision périmée est refusée (pas d'écrasement, Data Bible A4).
- **SEC-API-004 — Idempotence.** Écritures sensibles avec clé d'idempotence
  (pas de double effet).
- **SEC-API-005 — Réponses minimales.** Les réponses ne divulguent que le
  nécessaire ; pas de détail technique exploitable dans les erreurs.
- **SEC-API-006 — Versionnage sûr.** Une évolution incompatible crée une nouvelle
  version ; aucune rupture silencieuse (renvoi à l'API Bible à venir).
- **SEC-API-007 — Surface minimale.** Portail client/sous-traitant et IA consomment
  **les mêmes contrats**, filtrés par droits ; pas d'API privée « spéciale ».

---

# Partie F — Traçabilité & détection

## F1. Journalisation

- **SEC-LOG-001 — Journaux structurés et corrélés.** Chaque événement technique est
  journalisé, corrélé par un identifiant de suivi (parcours de bout en bout).
- **SEC-LOG-002 — Journalisation de sécurité.** Authentifications (succès/échec),
  élévations de droit, accès aux données N3/N4, exports, changements de
  configuration.
- **SEC-LOG-003 — Pas de secret ni de N4 en clair dans les journaux** (SEC-CLASS-004).
- **SEC-LOG-004 — Intégrité des journaux.** Journaux protégés contre l'altération ;
  accès restreint.

## F2. Audit

- **SEC-AUDIT-001 — Journal d'audit immuable.** Distinct des données métier ; « qui
  a fait quoi, quand, depuis où, sur quelle donnée » (Master Blueprint 19, Data
  Bible E-AUDIT).
- **SEC-AUDIT-002 — Actions engageantes tracées.** Émission de facture, validation,
  changement de droits, export de données personnelles, suppression logique,
  configuration IA/sécurité.
- **SEC-AUDIT-003 — Conservation longue** et accès **restreint** (lecture Direction
  restreinte / Administrateur sécurité), jamais de modification.

## F3. Historique

- **SEC-HIST-001 — Historique des modifications.** Les données engageantes
  conservent l'état antérieur (valeur avant/après, auteur, date) — tables
  d'historique (Data Bible A5, Master Blueprint D21).
- **SEC-HIST-002 — Non-répudiation.** On peut toujours répondre à « qui a changé
  cette valeur, quand, ancienne valeur ».

## F4. Journal des connexions

- **SEC-CONN-001 — Journal des connexions.** Chaque connexion enregistre :
  identité, horodatage, appareil/agent, adresse, résultat (succès/échec).
- **SEC-CONN-002 — Visibilité utilisateur.** Un utilisateur peut voir ses propres
  connexions récentes ; la Direction voit celles de son organisation.
- **SEC-CONN-003 — Rétention.** Conservé pour l'investigation, dans le respect du
  RGPD (durée justifiée).

## F5. Détection d'activité suspecte

- **SEC-DET-001 — Signaux surveillés.** Échecs d'authentification répétés, accès
  hors périmètre, exports massifs, connexions depuis un contexte inhabituel, pics
  d'activité anormaux, accès inhabituels à des données N4.
- **SEC-DET-002 — Réaction graduée.** Alerte de sécurité, demande de
  ré-authentification, invalidation de session, blocage temporaire selon la gravité.
- **SEC-DET-003 — Alerte sécurité.** Les événements graves alertent le responsable
  sécurité (canal distinct des alertes métier).
- **SEC-DET-004 — Distinction avec le métier.** La détection de sécurité est
  séparée de la détection d'anomalies métier (Business Rules Partie H) : accès et
  finalités différents.

---

# Partie G — Sécurité par surface

## G1. Sécurité IA

Reprend et rend normatives les règles de la Business Rules Bible (Partie J9) :

- **SEC-IA-001 — Minimisation.** N'envoyer au fournisseur IA que le **strict
  contexte nécessaire**, filtré par droits ; jamais de N4 inutile (SEC-CLASS-004).
- **SEC-IA-002 — Droits hérités.** L'IA n'accède qu'aux données autorisées de
  l'utilisateur ; aucune élévation de privilège via l'IA.
- **SEC-IA-003 — Séparation instructions/données.** Les **instructions système** de
  l'IA sont strictement séparées du **contenu utilisateur/documents** ; le contenu
  récupéré (RAG) est traité comme **donnée**, jamais comme instruction.
- **SEC-IA-004 — Protection contre l'injection d'instructions (prompt injection).**
  Aucun contenu (document, message, source RAG) ne peut redéfinir le comportement
  ou les garde-fous de l'IA ; toute tentative est ignorée et signalée.
- **SEC-IA-005 — Aucune clé IA dans le frontend** (SEC-SECRET-003) ; appels via
  l'AI Gateway côté serveur.
- **SEC-IA-006 — Journalisation IA.** Entrée, sortie, sources, fournisseur, modèle,
  version, coût journalisés (sans N4 en clair).
- **SEC-IA-007 — Souveraineté.** Traitement en Europe et/ou modèle local privilégié
  pour les données sensibles ; contractualisation de la non-rétention/non-
  entraînement (Master Blueprint 24.3).
- **SEC-IA-008 — L'IA ne modifie jamais une donnée officielle sans validation**
  (Business Rules IA-093, INV-7).

## G2. Sécurité mobile

- **SEC-MOB-001 — Jeton par appareil.** Chaque appareil nomade a un jeton distinct,
  **révocable individuellement** (perte/vol).
- **SEC-MOB-002 — Purge à la déconnexion/révocation.** Les données mises en cache
  localement sont purgées à la déconnexion ou à la révocation de l'appareil.
- **SEC-MOB-003 — Périmètre limité.** Un appareil ne détient que le **périmètre
  nécessaire** (ses chantiers/véhicules), pas toute la base (moindre exposition).
- **SEC-MOB-004 — Transport sécurisé.** Toutes les communications mobiles en TLS ;
  aucune donnée N4 stockée localement sans nécessité.
- **SEC-MOB-005 — Verrouillage.** Recommandation de verrouillage de l'appareil ;
  déconnexion sur inactivité.

## G3. Sécurité des synchronisations Apple Calendar (préparation)

- **SEC-CAL-001 — Connexion à moindre privilège.** La future synchronisation
  Apple Calendar utilise une **autorisation dédiée**, en **lecture seule** d'abord,
  révocable ; jamais un accès large.
- **SEC-CAL-002 — Pas de secret en clair.** Les identifiants de connexion vivent
  dans le coffre (D2), jamais dans le frontend ni le dépôt.
- **SEC-CAL-003 — Données minimales.** Seuls les champs nécessaires (titre, dates,
  lieu) sont importés ; classification adaptée (au moins N3).
- **SEC-CAL-004 — Isolation par entreprise/utilisateur.** Un agenda synchronisé
  reste **strictement** rattaché à son utilisateur/organisation.
- **SEC-CAL-005 — Traçabilité.** Connexion, synchronisation et révocation
  journalisées. *(Aucune synchronisation développée à ce stade — architecture
  préparée, Master Blueprint 40.)*

---

# Partie H — Sécurité de la chaîne (SecDevOps)

## H1. Sécurité GitHub

- **SEC-GH-001 — Accès à moindre privilège.** Droits sur le dépôt limités au
  nécessaire ; suppression des accès inutiles ; MFA exigé sur les comptes.
- **SEC-GH-002 — Protection des branches.** La branche principale est protégée :
  pas de poussée directe, revue obligatoire, contrôles verts requis avant fusion.
- **SEC-GH-003 — Aucun secret dans le dépôt.** Analyse automatique de secrets à
  chaque contribution ; blocage si secret détecté (SEC-SECRET-001).
- **SEC-GH-004 — Historique fiable.** Signature/traçabilité des contributions ;
  revue des contributions externes.
- **SEC-GH-005 — Séparation code / secrets / configuration.** La configuration
  sensible n'est jamais versionnée en clair.

## H2. Sécurité CI/CD

- **SEC-CICD-001 — Contrôles obligatoires.** Chaque contribution passe : analyse de
  secrets, analyse de dépendances vulnérables, tests, analyse statique de sécurité.
- **SEC-CICD-002 — Secrets d'exécution protégés.** Les secrets de la chaîne
  (déploiement, coffre) sont **injectés**, jamais imprimés dans les journaux.
- **SEC-CICD-003 — Chaîne à moindre privilège.** Les agents d'intégration/déploiement
  n'ont que les droits nécessaires, par environnement.
- **SEC-CICD-004 — Traçabilité des déploiements.** Qui a déployé quoi, quand ;
  possibilité de retour arrière.
- **SEC-CICD-005 — Intégrité de la construction.** Build reproductible ; artefacts
  tracés (intégrité de la chaîne d'approvisionnement).

## H3. Gestion des environnements

- **SEC-ENV-001 — Trois environnements isolés.** Développement, recette, production
  — **secrets, bases et stockages jamais partagés** (Master Blueprint 28).
- **SEC-ENV-002 — Données réelles en production uniquement.** La recette utilise des
  copies **anonymisées** ; jamais de données réelles N3/N4 en dev.
- **SEC-ENV-003 — Accès production restreint.** Accès à la production limité,
  journalisé, avec ré-authentification pour les opérations sensibles.
- **SEC-ENV-004 — Migrations sûres.** Migrations testées en recette avant
  production, réversibles (Master Blueprint 29).

## H4. Dépendances et chaîne d'approvisionnement

- **SEC-DEP-001 — Suivi des vulnérabilités.** Surveillance continue des dépendances ;
  mises à jour régulières.
- **SEC-DEP-002 — Revue des nouvelles dépendances.** Toute nouvelle dépendance est
  revue (réputation, maintenance, licence).
- **SEC-DEP-003 — Réduction de surface.** On évite les dépendances superflues.

---

# Partie I — Résilience

## I1. Sauvegardes et restauration

- **SEC-BAK-001 — Sauvegardes automatiques et chiffrées** de la base **et** du
  stockage de fichiers, avec **copie hors-site**, rétention définie.
- **SEC-BAK-002 — Restauration testée.** Une sauvegarde jamais restaurée n'existe
  pas : restauration exercée périodiquement.
- **SEC-BAK-003 — Isolation des sauvegardes.** Accès aux sauvegardes strictement
  restreint et journalisé ; protection contre l'altération/suppression malveillante.

## I2. Continuité et reprise (PRA)

- **SEC-PRA-001 — Objectifs.** RPO (perte maximale) et RTO (temps de reprise)
  définis avec la direction (Master Blueprint 21).
- **SEC-PRA-002 — Plan documenté et répété.** Procédure de reprise écrite, à jour,
  exercée au moins une fois par an.
- **SEC-PRA-003 — Réversibilité.** Standards ouverts pour pouvoir migrer/exporter à
  tout moment.

## I3. Réponse à incident

- **SEC-IR-001 — Processus d'incident.** Détection → confinement → éradication →
  restauration → analyse a posteriori, documenté.
- **SEC-IR-002 — Journal d'incidents.** Chaque incident est consigné (nature,
  impact, mesures, délais).
- **SEC-IR-003 — Notification.** En cas de violation de données personnelles, la
  procédure RGPD de notification est prévue (délais, autorité, personnes
  concernées).
- **SEC-IR-004 — Révocation rapide.** Capacité à révoquer immédiatement des accès,
  jetons, secrets compromis.

---

# Partie J — Conformité, audit & RGPD

## J1. RGPD (conservation, suppression, archivage)

- **SEC-RGPD-001 — Privacy by design.** Minimisation, base légale et finalité par
  catégorie de donnée, durées de conservation justifiées (Data Bible Partie F).
- **SEC-RGPD-002 — Registre des traitements.** Tenu à jour (finalités, catégories,
  destinataires, durées, sous-traitants).
- **SEC-RGPD-003 — Droits des personnes.** Accès, rectification, portabilité,
  **effacement** : l'effacement est une **anonymisation tracée** des données non
  soumises à conservation légale, jamais une suppression sauvage.
- **SEC-RGPD-004 — Conservation.** Chaque donnée a une durée (Data Bible F) ; purge
  ou anonymisation automatisée à l'échéance (via automatisations, sous contrôle).
- **SEC-RGPD-005 — Suppression = archivage.** Les données engageantes sont
  archivées (suppression logique + trace), jamais effacées physiquement, sauf droit
  à l'effacement (processus tracé).
- **SEC-RGPD-006 — Données sensibles (N4).** RH, conducteurs, contraventions :
  accès restreint, conservation minimale, journalisation renforcée, masquage.
- **SEC-RGPD-007 — Sous-traitants.** Chaque tiers traitant des données (hébergeur,
  IA, signature, calendrier) est contractualisé (garanties, localisation UE
  privilégiée).
- **SEC-RGPD-008 — Localisation.** Hébergement et traitement en Union européenne
  privilégiés.

## J2. Compatibilité audit de sécurité

- **SEC-AUD-001 — Conçu pour être audité.** Journaux, audit immuable, historique,
  matrice de permissions, classification des données et registre des traitements
  constituent les **preuves** exploitables lors d'un audit.
- **SEC-AUD-002 — Traçabilité de bout en bout.** Toute action sensible est
  reconstituable (qui, quoi, quand, pourquoi — quelle règle/permission).
- **SEC-AUD-003 — Tests de sécurité.** Analyse statique, analyse de dépendances,
  tests d'étanchéité multi-entreprises ; **test d'intrusion** à prévoir avant une
  mise en service élargie.
- **SEC-AUD-004 — Revue périodique.** Revue de sécurité régulière (SEC-GOV-005).

## J3. Compatibilité certification

- **SEC-CERT-001 — Cible.** L'architecture est conçue pour être **compatible** avec
  les référentiels reconnus (par exemple gestion de la sécurité de l'information et
  contrôles de type SOC), **sans** prétendre à une certification à ce stade.
- **SEC-CERT-002 — Cartographie des contrôles.** Les contrôles de cette Bible
  (`SEC-…`) sont pensés pour se **mapper** aux exigences d'un référentiel : accès,
  chiffrement, journalisation, continuité, gestion des changements, réponse à
  incident.
- **SEC-CERT-003 — Écarts documentés.** Toute distance à un référentiel visé est
  documentée et planifiée (feuille de route de conformité).
- **SEC-CERT-004 — Pas de sur-promesse.** On ne revendique aucune conformité non
  vérifiée ; la certification, si elle est visée, fera l'objet d'un projet dédié.

## J4. Évolution future

- **SEC-EVO-001 — Extensible sans refonte.** Ajouter un module, une entreprise, un
  fournisseur IA ou une intégration se fait **sans** casser le modèle de sécurité
  (mêmes contrôles, mêmes matrices).
- **SEC-EVO-002 — Contrôles versionnés.** Les identifiants `SEC-…` sont stables ;
  un contrôle retiré est marqué abrogé, jamais recyclé.
- **SEC-EVO-003 — Anticipation.** Antivirus (D4), test d'intrusion (J2),
  certification (J3), portails client/sous-traitant (C9) sont **prévus** sans être
  développés.

---

# Partie K — Matrices consolidées & traçabilité

## K1. Classification par grande famille de données (extrait de référence)

| Famille de données (Data Bible) | Niveau | Justification |
|---|---|---|
| Référentiels, libellés, paramètres non financiers | N2 Interne | Non sensible. |
| Clients, prospects, opportunités | N3 Confidentiel | Données commerciales + personnelles. |
| Devis, factures, encaissements, dépenses, trésorerie, marges | N3 Confidentiel | Sensibles pour l'entreprise. |
| Chantiers, lots, stock, matériaux | N3 Confidentiel | Stratégiques. |
| Véhicules, entretiens, coûts véhicules | N3 Confidentiel | Exploitation. |
| **Données RH (salariés, paie, absences)** | **N4 Très sensible** | Données personnelles sensibles. |
| **Contraventions (infractions, points, conducteur)** | **N4 Très sensible** | Personnelles sensibles + juridiques. |
| **Espace Dirigeant (décisions, tâches, notes)** | **N4 Très sensible** | Stratégiques et personnelles. |
| **Secrets, éléments d'authentification** | **N4 Très sensible** | Compromission = accès total. |
| Événements, audit, journaux | N3/N4 | Selon le contenu ; immuables. |
| Documents | Hérite de l'objet lié | Classification remontée. |

## K2. Contrôles clés par niveau de données

| Contrôle | N1 | N2 | N3 | N4 |
|---|---|---|---|---|
| Chiffrement en transit | ✔ | ✔ | ✔ | ✔ |
| Chiffrement au repos | — | ✔ | ✔ | ✔ (renforcé) |
| Accès par rôle + attributs | — | ✔ | ✔ | ✔ (restreint) |
| Cloisonnement par entreprise | ✔ | ✔ | ✔ | ✔ |
| Journalisation des accès | — | — | ✔ | ✔ (renforcée) |
| Masquage par défaut | — | — | partiel | ✔ |
| Transmission à un tiers (IA…) | libre | contrôlée | minimisée | interdite sauf nécessité + autorisation |
| Conservation | libre | interne | légale | minimale + anonymisation |

## K3. Traçabilité vers les autres documents fondateurs

| Thème | Security Bible | Master Blueprint | Business Rules Bible | Data Bible |
|---|---|---|---|---|
| Authentification déléguée / MFA | C1, C2 | ch. 17 | — | E-USER |
| Rôles + attributs / autorisation serveur | C4–C8 | ch. 18 | INV-7 | A7, Partie E |
| Multi-société / cloisonnement | C7 | D4, 9.2 | INV-4 | A4 |
| Chiffrement / secrets | D1, D2 | ch. 20 | IA-085 | — |
| Journalisation / audit / historique | F | ch. 19, 26 | INV-6 | E-EVENEMENT, E-AUDIT, E-HISTO |
| RGPD / conservation / suppression | J1 | ch. 5 §RGPD | INV-8 | A6, Partie F |
| Sécurité IA | G1 | ch. 24 | Partie J | C14 |
| Sécurité API | E5 | ch. 12 | — | — |
| Sécurité mobile | G2 | ch. 9 (offline) | — | — |
| Sécurité Apple Calendar | G3 | ch. 40 | BR-CAL | E-SOURCECAL |
| CI/CD / environnements | H | ch. 28 | — | — |
| Sauvegardes / PRA | I | ch. 21 | — | — |
| Classification des données | B, K1 | ch. 5 | — | toutes entités |

## K4. Règle d'or (rappel)

> **La sécurité est dans le produit, pas ajoutée après.** Aucun mécanisme
> d'identité, d'accès, de chiffrement, de journalisation ou de conformité n'est
> développé sans figurer ici. **Zero Trust** : rien n'est autorisé par défaut ;
> chaque accès est vérifié. Chaque donnée porte son **niveau de protection**.

---

## Fin du document

> **BRN PILOT — Security Bible v1.0.** Architecture de sécurité de niveau
> entreprise, multi-société, Zero Trust, compatible audit et certification.
> Document normatif, en construction, **sans code**.
>
> Points à valider avec la direction (paramètres, non changements d'architecture) :
> objectifs RPO/RTO chiffrés ; durées de conservation précises par donnée ;
> référentiel de certification visé (le cas échéant) ; seuils de séparation des
> droits (montant au-delà duquel auteur ≠ validateur) ; calendrier d'un éventuel
> test d'intrusion.
>
> Prochaines étapes prévues (dans l'ordre annoncé) : **UX/UI Bible**, puis **API
> Bible**, puis **Developer Bible** — avant tout développement.
