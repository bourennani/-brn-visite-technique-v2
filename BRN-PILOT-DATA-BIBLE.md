# BRN PILOT — DATA BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle et normative** de **toutes les
> données** manipulées par *BRN Pilot* : le **modèle métier de référence**,
> indépendant de toute technologie.
>
> **Le Master Blueprint définit la structure. La Business Rules Bible définit le
> comportement. La Data Bible définit les données.**
>
> **Règle de gouvernance.** Aucune donnée métier importante n'est ajoutée au
> développement sans avoir été définie ici au préalable. Toute entité/attribut
> manipulé par le code **cite l'identifiant** défini dans cette Bible.
>
> **Ce document ne contient aucun code, aucune table SQL, aucune migration.** Les
> types sont **conceptuels** (langage naturel). Nous restons en **phase de
> conception** : c'est le modèle **métier**, pas le schéma physique.
>
> **Statut :** v1.0 — référence en cours de constitution.
> **Cohérence :** aligné sur le Master Blueprint v1.1 et la Business Rules Bible
> v1.0 (mêmes modules V1 ; SAV et Maintenance restent des modules futurs).

---

## Table des matières

**Partie A — Fondations**
- A1. Objectif et portée
- A2. Indépendance technologique
- A3. Vocabulaire des types conceptuels
- A4. Attributs systèmes communs (portés par toute entité)
- A5. Conventions d'historisation
- A6. Conventions d'archivage et de conservation
- A7. Conventions de droits d'accès
- A8. Gouvernance de la Data Bible

**Partie B — Cartographie des entités**

**Partie C — Entités par domaine**
- C1. Socle & organisation
- C2. Tiers, clients, prospects, fournisseurs & CRM
- C3. Études & visites techniques (données reçues)
- C4. Chantiers & lots de travaux
- C5. Finance
- C6. RH, équipes & main-d'œuvre
- C7. Matériaux & stock
- C8. Parc véhicules & entretiens
- C9. Contraventions
- C10. Espace dirigeant
- C11. Échéances, priorités & alertes
- C12. Documents
- C13. Calendrier & synchronisation Apple (structure)
- C14. Intelligence artificielle
- C15. Transverses techniques (événements, audit, historiques, notifications, paramètres)

**Partie D — Matrice consolidée des relations**

**Partie E — Matrice consolidée des droits d'accès**

**Partie F — Règles consolidées de conservation**

**Partie G — Traçabilité vers les autres documents fondateurs**

---

# Partie A — Fondations

## A1. Objectif et portée

Cette Bible décrit, de manière **exhaustive et indépendante de la technologie** :
toutes les **entités métier**, leurs **attributs** (obligatoires, facultatifs,
calculés), leurs **relations**, leurs **états**, leurs **validations**, leurs
règles d'**historisation**, d'**archivage** et de **droits d'accès**.

Elle est la **source unique** du modèle de données. La Data Bible **précède** tout
schéma physique : le schéma SQL, quand il sera produit, devra en être la traduction
fidèle, jamais l'inverse.

## A2. Indépendance technologique

- Aucun type SQL, aucune contrainte physique, aucun index, aucune migration ici.
- Les **types conceptuels** (A3) décrivent la **nature** d'une donnée, pas son
  stockage. Le choix de stockage (colonne relationnelle vs document, selon le
  Master Blueprint 9.4) est une décision d'implémentation ultérieure.
- Les **identifiants** d'entités et d'attributs de cette Bible sont **stables** :
  ils survivent à tout changement de technologie.

## A3. Vocabulaire des types conceptuels

| Type conceptuel | Signification |
|---|---|
| **Identifiant** | Référence unique et stable d'une occurrence. |
| **Texte** | Chaîne courte (nom, libellé). |
| **TexteLong** | Texte libre (note, observation, description). |
| **Entier** | Nombre entier (quantité, compteur). |
| **Nombre** | Nombre décimal non monétaire (surface, kilométrage, consommation). |
| **Montant** | Valeur monétaire **exacte** (jamais approximée). Toujours en euros HT/TTC précisé. |
| **Pourcentage** | Taux exprimé en %. |
| **Date** | Date calendaire (sans heure). |
| **DateHeure** | Instant précis (horodatage, UTC en stockage, localisé à l'affichage). |
| **Booléen** | Vrai / Faux. |
| **Énumération** | Valeur parmi une liste fermée et documentée (états, catégories). |
| **Référence(→E)** | Lien vers une autre entité, par identifiant. |
| **Liste(de X)** | Collection d'éléments d'un type ou d'une sous-entité. |
| **Fichier** | Référence vers un document/binaire (le fichier vit hors base). |
| **Adresse** | Bloc structuré (rue, code postal, ville, pays). |
| **Durée** | Intervalle (jours, heures). |
| **Structure** | Ensemble de sous-champs métier variable (détail spécialisé). |

## A4. Attributs systèmes communs (portés par TOUTE entité métier)

Pour éviter la répétition, ces attributs sont **implicitement présents** sur chaque
entité et **ne sont pas re-listés** dans les tableaux de la Partie C :

| Attribut | Type | Rôle |
|---|---|---|
| identifiant | Identifiant | Clé unique et stable de l'occurrence. |
| organisation | Référence(→Entreprise) | Multi-entreprise ; cloisonnement (Master Blueprint D4). |
| créé_le | DateHeure | Date de création. |
| créé_par | Référence(→Utilisateur) | Auteur de la création. |
| modifié_le | DateHeure | Dernière modification. |
| modifié_par | Référence(→Utilisateur) | Auteur de la dernière modification. |
| révision | Entier | Verrou optimiste (anti-écrasement, Master Blueprint 9.5). |
| supprimé_le | DateHeure (facultatif) | Suppression **logique** (jamais d'effacement physique, sauf droit à l'effacement RGPD tracé). |

> **Exceptions.** *Entreprise* ne porte pas de référence à elle-même. Les entités
> **transverses techniques** (événement, audit) sont **immuables** et n'ont pas de
> révision ni de suppression logique.

## A5. Conventions d'historisation

Trois niveaux, appliqués selon l'entité (aligné sur la décision D21 du Master
Blueprint : tables d'historique + événements, sans event sourcing complet) :

| Niveau | Ce qui est conservé | Pour quelles entités |
|---|---|---|
| **Complète** | Chaque version antérieure (valeur avant/après, auteur, date). | Données engageantes (finance, chantiers, véhicules, contraventions, décisions). |
| **Audit seul** | Trace de l'action (qui/quoi/quand), sans versionner tout le contenu. | Données peu sensibles (notes, interactions, paramètres non financiers). |
| **Aucune** | Pas d'historique dédié (l'entité est elle-même un enregistrement immuable). | Événements, entrées d'audit, interactions IA. |

## A6. Conventions d'archivage et de conservation

- **Suppression = archivage** par défaut (suppression logique + événement), jamais
  d'effacement physique d'une donnée engageante.
- Chaque entité porte une **durée de conservation** (Partie F), fondée sur les
  obligations légales et le RGPD (minimisation, durées justifiées).
- **Droit à l'effacement RGPD** : processus **tracé** d'anonymisation des données
  personnelles non soumises à conservation légale (jamais une suppression sauvage).
- Les **données personnelles sensibles** (RH, conducteurs, contraventions) ont une
  conservation **restreinte** et un accès **renforcé**.

## A7. Conventions de droits d'accès

Le modèle combine **rôles** (qui) et **attributs** (sur quoi : organisation,
chantiers/véhicules affectés, propriété), conformément au Master Blueprint ch. 18.
Rôles de référence utilisés dans cette Bible :

`Direction` · `Conducteur de travaux` · `Commercial` · `Comptable/ADV` · `RH` ·
`Magasinier` · `Gestionnaire de flotte` · `Client` (portail futur) · `Sous-traitant`
(futur).

Pour chaque entité, les droits sont exprimés en **Lecture** et **Écriture**, en
gardant que : (a) l'autorisation est **toujours vérifiée côté serveur** ; (b)
l'accès est **restreint par attributs** (un conducteur ne voit que ses chantiers) ;
(c) l'**Espace Dirigeant** et les **contraventions** sont **strictement restreints**.

## A8. Gouvernance de la Data Bible

- **Source unique.** Aucune entité/attribut métier important hors de cette Bible.
- **Ajout / modification.** Nouvelle entité ou attribut = identifiant neuf ;
  modification par version (l'histoire du modèle est conservée) ; un identifiant
  retiré n'est jamais recyclé.
- **Alignement.** Toute entité reflète les règles de la Business Rules Bible (par
  ex. les états ici correspondent aux machines à états `ST-…` là-bas).
- **Traçabilité.** Chaque entité renvoie aux règles/décisions concernées (Partie G).

---

# Partie B — Cartographie des entités

> Vue d'ensemble (diagramme de documentation, pas un schéma physique). Les liens
> **inter-domaines** se font par **référence d'identifiant** (cloisonnement) ; les
> liens **intra-domaine** sont des compositions.

```
SOCLE            Entreprise ─ Utilisateur ─ Rôle ─ Permission ─ Paramètre ─ Référentiel
                        │
TIERS/CRM        Tiers ─(rôles)─ Client / Prospect / Fournisseur ─ Contact
                   └ Opportunité ─ Interaction
ÉTUDES           VisiteTechnique (reçue de BRN Visite Technique)
CHANTIERS        Chantier ─ LotDeTravaux ─ Phase/Tâche ─ Réception ─ Réserve
FINANCE          Devis ─ LigneDevis ; Facture ─ LigneFacture ; Situation ;
                   Encaissement ; Dépense ; Avoir ; ArticleDePrix ; ÉcritureTrésorerie
RH               Salarié ─ Équipe ; JournéeDeTravail ; Absence ; VariablePaie
STOCK            Matériau ─ Emplacement ─ MouvementStock ─ Réapprovisionnement
PARC             Véhicule ─ ContratVéhicule ─ Entretien / Réparation / Vidange /
                   Pneu / Batterie ─ RelevéKilométrique ─ CoûtVéhicule
CONTRAVENTIONS   Contravention ─ Contestation ─ PaiementContravention
DIRIGEANT        Tâche ─ Décision ─ Validation ─ DemandeSignature ─ Objectif ─
                   Note ─ Obligation
ÉCHÉANCES        Échéance (typée) ─ Priorité (calculée) ─ Alerte
DOCUMENTS        Document ─ VersionDocument ─ ModèleDocument
CALENDRIER       RendezVous ─ SourceCalendrier (Apple, structure)
IA               InteractionIA ─ SuggestionIA ─ ActionProposéeIA ─ SourceRAG ─
                   ConfigurationFournisseurIA
TRANSVERSES      Événement ─ EntréeAudit ─ HistoriqueModification ─ Notification
```

Chaque entité ci-dessus est détaillée en Partie C.

---

# Partie C — Entités par domaine

> **Format par entité :** Objectif · Attributs propres (Obligatoire **O** /
> Facultatif **F** / Calculé **C**) · États · Relations · Historisation · Conservation
> · Droits. Les **attributs systèmes communs** (A4) ne sont pas répétés.

## C1. Socle & organisation

### E-ORG — Entreprise (Organisation)
**Objectif.** Représenter une entreprise cliente du logiciel (multi-entreprise).
Racine du cloisonnement.

| Attribut | Type | O/F/C | Validation / Notes |
|---|---|---|---|
| raison_sociale | Texte | O | Non vide. |
| identifiants_légaux | Structure | O | SIREN/SIRET, TVA intracommunautaire. |
| adresse | Adresse | O | — |
| logo | Fichier | F | — |
| paramètres | Référence(→Paramètre) | C | Agrégat des paramètres de l'organisation. |

**États.** `Active | Suspendue | Archivée`.
**Relations.** Possède toutes les autres entités (via l'attribut *organisation*).
**Historisation.** Complète. **Conservation.** Durée de vie du contrat + obligations légales.
**Droits.** Lecture : Direction. Écriture : Direction (super-administration).

### E-USER — Utilisateur
**Objectif.** Compte d'accès d'une personne au logiciel.

| Attribut | Type | O/F/C | Validation / Notes |
|---|---|---|---|
| identité_fournisseur | Texte | O | Sujet fourni par le fournisseur d'identité (aucun mot de passe stocké, Master Blueprint 17). |
| nom_affiché | Texte | O | — |
| email | Texte | O | Format e-mail valide. |
| tiers_lié | Référence(→Tiers) | F | Si l'utilisateur est aussi un salarié. |
| actif | Booléen | O | Désactivation sans suppression. |
| rôles | Liste(de Référence(→Rôle)) | O | Au moins un rôle. |

**États.** `Actif | Désactivé`.
**Relations.** Porte des rôles ; auteur des créations/modifications (A4).
**Historisation.** Complète (changements de rôles tracés). **Conservation.** Vie du compte + trace légale.
**Droits.** Lecture : Direction, l'utilisateur (son profil). Écriture : Direction/administration.

### E-ROLE — Rôle
**Objectif.** Ensemble de capacités attribuables à un utilisateur.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| code | Texte | O | Unique par organisation (`direction`, `conducteur`…). |
| libellé | Texte | O | — |
| permissions | Liste(de Référence(→Permission)) | O | — |
| périmètre_par_défaut | Structure | F | Attributs ABAC par défaut. |

**Historisation.** Complète. **Conservation.** Permanente (référentiel). **Droits.** Lecture : Direction. Écriture : Direction.

### E-PERM — Permission
**Objectif.** Capacité élémentaire (lire/écrire un type d'objet, exécuter une action).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| code | Texte | O | Unique (`facture.émettre`, `contravention.lire`…). |
| description | Texte | O | — |
| catégorie_de_sensibilité | Énumération | O | `standard | sensible | critique`. |

**Historisation.** Audit seul. **Conservation.** Permanente. **Droits.** Lecture : Direction. Écriture : Direction.

### E-PARAM — Paramètre
**Objectif.** Donnée de configuration administrable (seuils, délais, taux,
pondérations) — support de l'invariant « configuration versionnée » (Business Rules
INV-8).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| domaine | Énumération | O | `finance | priorité | alertes | véhicules | rgpd | ia`… |
| clé | Texte | O | Unique par domaine. |
| valeur | Structure | O | Selon le paramètre (montant, durée, pondération…). |
| en_vigueur_du | Date | O | Date de prise d'effet (versionnage temporel). |
| en_vigueur_au | Date | F | Fin de validité éventuelle. |

**Historisation.** Complète (on connaît la valeur en vigueur à toute date).
**Conservation.** Permanente (historique des paramètres conservé). **Droits.** Lecture : Direction, rôles concernés. Écriture : Direction.

### E-REF — Référentiel
**Objectif.** Liste de valeurs métier partagées (unités, taux de TVA, corps
d'état, types d'entretien, types d'infraction, catégories de dépense…).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| domaine | Énumération | O | `unité | tva | corps_état | type_entretien | type_infraction | catégorie_dépense`… |
| code | Texte | O | Unique par domaine. |
| libellé | Texte | O | — |
| données | Structure | F | Détail (par ex. taux, périodicité). |
| actif | Booléen | O | — |
| portée | Énumération | O | `globale | organisation`. |

**Historisation.** Complète. **Conservation.** Permanente. **Droits.** Lecture : tous (selon domaine). Écriture : Direction/administration.

## C2. Tiers, clients, prospects, fournisseurs & CRM

### E-TIERS — Tiers (Party)
**Objectif.** Personne physique ou morale **neutre**, pouvant jouer plusieurs
rôles. Entité pivot (évite la duplication d'identité).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | `personne | société`. |
| nom / prénom | Texte | O si personne | — |
| raison_sociale | Texte | O si société | — |
| identifiants_légaux | Structure | F | SIRET, TVA (si société). |
| email | Texte | F | Format valide. |
| téléphone | Texte | F | — |
| adresse | Adresse | F | — |
| rôles | Liste(Énumération) | O | `client | prospect | fournisseur | sous-traitant | salarié`. |
| notes | TexteLong | F | — |

**États.** `Actif | Inactif`.
**Relations.** Rattaché à comptes, opportunités, chantiers, véhicules (conducteur),
contraventions (conducteur), factures, dépenses…
**Historisation.** Complète. **Conservation.** Client/fournisseur : durée de la
relation + obligations. Prospect : durée limitée (RGPD). **Droits.** Lecture :
Direction, Commercial, Comptable, Conducteur (ses tiers). Écriture : selon rôle.

### E-CLIENT — Client (rôle de Tiers, vue commerciale/financière)
**Objectif.** Le tiers vu comme client : historique, solde, conditions.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| conditions_paiement | Référence(→Référentiel) | F | Délai, mode. |
| solde_dû | Montant | C | Calculé (Business Rules CALC-CRM-001). |
| encours_autorisé | Montant | F | Plafond de crédit. |
| origine | Énumération | F | Recommandation, site web… |

**Historisation.** Complète. **Conservation.** Légale (10 ans côté facturation). **Droits.** Lecture : Direction, Commercial, Comptable. Écriture : Commercial, Comptable.

### E-PROSPECT — Prospect (rôle de Tiers, vue avant-vente)
**Objectif.** Contact commercial non encore client.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| source | Énumération | F | Canal d'acquisition. |
| statut_qualification | Énumération | O | `nouveau | qualifié | visité | devisé`. |
| date_dernier_contact | Date | F | — |

**États.** `Nouveau → Qualifié → Visité → Devisé → {Gagné (devient Client) | Perdu}`.
**Historisation.** Audit seul. **Conservation.** **Restreinte** (durée RGPD configurée) puis anonymisation. **Droits.** Lecture/Écriture : Direction, Commercial.

### E-FOURNISSEUR — Fournisseur (rôle de Tiers)
**Objectif.** Tiers auprès duquel l'entreprise achète (matériaux, services,
sous-traitance).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| catégorie | Énumération | F | Matériaux, sous-traitant, services véhicules… |
| conditions_achat | Structure | F | Délais, remises. |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Lecture : Direction, Comptable, Magasinier, Gestionnaire de flotte. Écriture : Comptable, Magasinier.

### E-CONTACT — Contact
**Objectif.** Personne rattachée à un tiers (interlocuteur).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| nom / fonction | Texte | O / F | — |
| email / téléphone | Texte | F | — |

**Historisation.** Audit seul. **Conservation.** Avec le tiers. **Droits.** Comme le tiers.

### E-OPP — Opportunité (affaire)
**Objectif.** Affaire potentielle suivie dans le pipeline.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| compte | Référence(→Tiers) | O | — |
| libellé | Texte | O | — |
| montant_estimé | Montant | F | — |
| étape | Énumération | O | `prospect | qualifié | visité | devisé | gagné | perdu`. |
| probabilité | Pourcentage | F | — |
| motif_perte | Texte | F si perdu | — |

**États.** Voir *étape*.
**Relations.** → Visite technique, → Devis.
**Historisation.** Complète (suivi du pipeline). **Conservation.** Durée + analyse. **Droits.** Lecture/Écriture : Direction, Commercial.

### E-INTER — Interaction
**Objectif.** Trace d'un échange (appel, e-mail, visite) avec un tiers.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| type | Énumération | O | `appel | email | visite | autre`. |
| date | DateHeure | O | — |
| contenu | TexteLong | F | — |

**Historisation.** Audit seul. **Conservation.** Durée relation. **Droits.** Lecture/Écriture : Direction, Commercial.

## C3. Études & visites techniques (données reçues)

### E-VISITE — Visite technique
**Objectif.** Résultat d'une visite/métré réalisée dans *BRN Visite Technique* et
**reçu** par *BRN Pilot* via le connecteur (Master Blueprint ch. 23). *BRN Pilot*
**consomme** ces données, il ne les produit pas.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| référence_externe | Texte | O | Identifiant stable côté BRN Visite Technique (dédoublonnage). |
| opportunité | Référence(→Opportunité) | F | Rattachement commercial. |
| client | Référence(→Tiers) | F | — |
| adresse_chantier | Adresse | O | — |
| quantités_par_ouvrage | Liste(Structure) | O | Métré chiffrable (lot, libellé, quantité, unité). |
| date_visite | Date | O | — |

**États.** `Reçue | Convertie en devis`.
**Relations.** → Devis (source du chiffrage).
**Historisation.** Complète (donnée reçue conservée à l'identique). **Conservation.** Durée de l'affaire + légale. **Droits.** Lecture : Direction, Commercial, Métreur. Écriture : connecteur (import), pas de saisie directe.

## C4. Chantiers & lots de travaux

### E-CHANTIER — Chantier
**Objectif.** Réalisation d'un devis accepté ; entité centrale du pilotage.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| référence | Texte | O | Unique par organisation. |
| client | Référence(→Tiers) | O | — |
| devis_origine | Référence(→Devis) | O | — |
| adresse | Adresse | O | — |
| date_début / date_fin_prévue | Date | O / F | — |
| budget_vendu | Montant | C | Repris du devis. |
| déboursé_prévu | Montant | C | Repris du chiffrage. |
| coût_réel | Montant | C | Business Rules CALC-CHA-002. |
| avancement | Pourcentage | O | Saisi/mesuré. |
| marge_prévue | Pourcentage | C | CALC-CHA-001. |
| marge_réalisée_projetée | Pourcentage | C | CALC-CHA-001. |

**États.** `Prévu | EnCours | EnRetard | Réceptionné | Clôturé` (Business Rules ST-CHA).
**Relations.** → Lots, Phases, Réceptions, Réserves ; ← Dépenses, Journées de travail, Mouvements de stock, Situations, Factures ; peut référencer des véhicules affectés.
**Historisation.** Complète. **Conservation.** Légale (marchés, garanties décennales : longue durée). **Droits.** Lecture : Direction, Conducteur (ses chantiers), Comptable. Écriture : Direction, Conducteur.

### E-LOT — Lot de travaux
**Objectif.** Famille de travaux (corps d'état) au sein d'un chantier/devis.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| chantier | Référence(→Chantier) | O | — |
| corps_état | Référence(→Référentiel) | O | Maçonnerie, plâtrerie, électricité… |
| montant_vendu | Montant | C | — |
| déboursé_prévu | Montant | C | — |
| avancement_lot | Pourcentage | F | — |

**Historisation.** Complète. **Conservation.** Avec le chantier. **Droits.** Comme le chantier.

### E-PHASE — Phase / Tâche de chantier
**Objectif.** Étape planifiée du chantier (planning).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| chantier | Référence(→Chantier) | O | — |
| libellé | Texte | O | — |
| date_début / date_fin | Date | F | — |
| dépendances | Liste(Référence(→Phase)) | F | — |
| statut | Énumération | O | `à venir | en cours | terminée`. |
| équipe_affectée | Référence(→Équipe) | F | — |

**Historisation.** Complète. **Conservation.** Avec le chantier. **Droits.** Comme le chantier.

### E-RECEPTION — Réception
**Objectif.** Acte de fin de chantier ouvrant les garanties.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| chantier | Référence(→Chantier) | O | — |
| date | Date | O | — |
| pv_document | Fichier | O | PV signé (immuable). |
| garanties | Liste(Structure) | C | Parfait achèvement / biennale / décennale (échéances). |

**Historisation.** Complète. **Conservation.** Longue (durée décennale + marge). **Droits.** Lecture : Direction, Conducteur, Comptable. Écriture : Direction, Conducteur.

### E-RESERVE — Réserve
**Objectif.** Défaut constaté à la réception, à lever.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| réception | Référence(→Réception) | O | — |
| description | TexteLong | O | — |
| statut | Énumération | O | `ouverte | levée`. |
| échéance_levée | Date | F | Source d'alerte. |

**États.** `Ouverte → Levée`.
**Historisation.** Complète. **Conservation.** Avec la réception. **Droits.** Comme le chantier.

## C5. Finance

### E-DEVIS — Devis
**Objectif.** Proposition chiffrée au client, versionnée.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| numéro | Texte | O | Unique par organisation. |
| client | Référence(→Tiers) | O | — |
| opportunité | Référence(→Opportunité) | F | — |
| visite_source | Référence(→VisiteTechnique) | F | — |
| lignes | Liste(→LigneDevis) | O | Au moins une ligne. |
| total_ht / total_tva / total_ttc | Montant | C | Moteur financier (CALC-FIN-001). |
| validité | Date | O | Délai de validité. |
| statut | Énumération | O | `brouillon | émis | accepté | refusé | expiré`. |

**États.** Business Rules ST-DEVIS.
**Relations.** → Lignes ; → Chantier (si accepté) ; ← Opportunité.
**Historisation.** Complète (versions du devis). **Conservation.** Légale. **Droits.** Lecture : Direction, Commercial, Comptable. Écriture : Commercial (jusqu'à émission), Direction.

### E-LIGNEDEVIS — Ligne de devis
**Objectif.** Poste chiffré d'un devis.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| devis | Référence(→Devis) | O | — |
| désignation | Texte | O | — |
| lot | Référence(→Référentiel) | F | Corps d'état. |
| quantité / unité | Nombre / Référence | O | — |
| prix_unitaire | Montant | O | — |
| remise | Pourcentage | F | — |
| montant_ht | Montant | C | CALC-FIN-001. |
| taux_tva | Pourcentage | O | Référentiel. |

**Historisation.** Avec le devis. **Conservation.** Avec le devis. **Droits.** Comme le devis.

### E-FACTURE — Facture
**Objectif.** Document légal exigeant paiement.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| numéro_légal | Texte | C | Séquentiel, continu, sans trou (CALC-FIN-020). Attribué à l'émission. |
| client | Référence(→Tiers) | O | — |
| chantier | Référence(→Chantier) | F | — |
| lignes | Liste(→LigneFacture) | O | — |
| total_ht / total_tva / total_ttc | Montant | C | — |
| date_émission | Date | O | — |
| date_échéance | Date | C | CALC-FIN-011. |
| solde_dû | Montant | C | — |
| statut | Énumération | O | `émise | partiellement payée | payée | impayée | annulée par avoir`. |
| document_pdf | Fichier | C | Immuable une fois émis. |

**États.** Business Rules ST-FAC.
**Relations.** → Lignes, → Encaissements ; ← Chantier, Situation.
**Historisation.** Complète (mais document émis **immuable** ; correction = avoir). **Conservation.** **10 ans** (légal). **Droits.** Lecture : Direction, Comptable. Écriture (émission) : Comptable/Direction. Jamais de modification après émission.

### E-LIGNEFACTURE — Ligne de facture
**Objectif.** Poste d'une facture. Attributs analogues à E-LIGNEDEVIS.
**Historisation.** Avec la facture (immuable après émission). **Droits.** Comme la facture.

### E-SITUATION — Situation de travaux
**Objectif.** Facturation intermédiaire à l'avancement.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| chantier | Référence(→Chantier) | O | — |
| avancement_retenu | Pourcentage | O | — |
| montant | Montant | C | CALC-FIN-040. |
| retenue_garantie | Montant | C | CALC-FIN-041. |
| facture_liée | Référence(→Facture) | F | — |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Direction, Comptable.

### E-ENCAISSEMENT — Encaissement (Paiement reçu)
**Objectif.** Règlement reçu d'un client.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| facture | Référence(→Facture) | O | — |
| montant | Montant | O | > 0. |
| date | Date | O | — |
| mode | Énumération | O | Virement, chèque, espèces… |

**Historisation.** Complète. **Conservation.** 10 ans. **Droits.** Lecture : Direction, Comptable. Écriture : Comptable.

### E-DEPENSE — Dépense
**Objectif.** Coût engagé (achat, sous-traitance, frais, coût véhicule).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| libellé | Texte | O | — |
| montant_ht / tva / ttc | Montant | O / C / C | — |
| fournisseur | Référence(→Tiers) | F | — |
| catégorie | Référence(→Référentiel) | O | — |
| rattachement | Énumération | O | `chantier | véhicule | frais généraux`. |
| chantier | Référence(→Chantier) | F | Si rattachée à un chantier. |
| véhicule | Référence(→Véhicule) | F | Si rattachée à un véhicule (rattachement automatique, Master Blueprint 11.3). |
| justificatif | Fichier | F | — |
| date | Date | O | — |

**Historisation.** Complète. **Conservation.** Légale (10 ans). **Droits.** Lecture : Direction, Comptable, Conducteur (ses chantiers), Gestionnaire de flotte (ses véhicules). Écriture : Comptable, Conducteur, Gestionnaire de flotte.

### E-AVOIR — Avoir
**Objectif.** Annulation/compensation d'une facture (numérotation légale propre).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| facture_liée | Référence(→Facture) | O | — |
| numéro_légal | Texte | C | Séquentiel. |
| montant | Montant | O | — |
| motif | Texte | O | — |

**Historisation.** Complète. **Conservation.** 10 ans. **Droits.** Direction, Comptable.

### E-ARTICLEPRIX — Article de prix (bibliothèque de prix)
**Objectif.** Élément réutilisable de chiffrage (déboursé, main-d'œuvre, marge).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| désignation | Texte | O | — |
| unité | Référence(→Référentiel) | O | — |
| déboursé_sec | Montant | F | — |
| temps_main_œuvre | Nombre | F | — |
| marge_par_défaut | Pourcentage | F | — |
| corps_état | Référence(→Référentiel) | F | — |

**Historisation.** Complète (évolution des prix datée). **Conservation.** Permanente. **Droits.** Lecture : Direction, Commercial, Métreur. Écriture : Direction.

### E-TRESO — Écriture de trésorerie
**Objectif.** Mouvement (réel ou prévu) alimentant la trésorerie.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| sens | Énumération | O | `encaissement | décaissement`. |
| nature | Énumération | O | `réel | prévu`. |
| montant | Montant | O | — |
| date_prévue / date_réelle | Date | F | — |
| source | Référence | F | Facture, dépense, échéance… |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Direction, Comptable.

## C6. RH, équipes & main-d'œuvre

### E-SALARIE — Salarié (rôle de Tiers)
**Objectif.** Personne employée (données RH sensibles).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| tiers | Référence(→Tiers) | O | — |
| poste / qualification | Texte | F | — |
| habilitations | Liste(Référence(→Référentiel)) | F | — |
| taux_horaire_chargé | Montant | O | Base de CALC-RH-001. |
| équipe | Référence(→Équipe) | F | — |
| date_entrée / sortie | Date | O / F | — |

**États.** `Actif | Sorti`.
**Historisation.** Complète. **Conservation.** **Restreinte** (durée légale post-emploi), accès **renforcé** (RGPD). **Droits.** Lecture : Direction, RH, Conducteur (limité à l'affectation). Écriture : RH.

### E-EQUIPE — Équipe
**Objectif.** Groupe de salariés affecté à des chantiers.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| nom | Texte | O | — |
| responsable | Référence(→Salarié) | F | — |
| membres | Liste(Référence(→Salarié)) | O | — |

**Historisation.** Audit seul. **Conservation.** Vie de l'organisation. **Droits.** Lecture : Direction, Conducteur, RH. Écriture : Direction, RH.

### E-JOURNEE — Journée de travail (Pointage)
**Objectif.** Heures d'un salarié sur un chantier un jour donné (source du coût
main-d'œuvre).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| salarié | Référence(→Salarié) | O | — |
| chantier | Référence(→Chantier) | O | — |
| date | Date | O | — |
| heures | Nombre | O | > 0 ; alerte si aberrant (Business Rules ANO-004). |
| coût | Montant | C | CALC-RH-001. |
| statut | Énumération | O | `saisie | validée`. |

**États.** `Saisie → Validée` (verrouillée après validation).
**Historisation.** Complète. **Conservation.** Légale (paie). **Droits.** Lecture : Direction, RH, Conducteur (ses chantiers). Écriture : Conducteur (saisie), RH.

### E-ABSENCE — Absence
**Objectif.** Congé/arrêt d'un salarié.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| salarié | Référence(→Salarié) | O | — |
| type | Énumération | O | Congé, maladie… |
| date_début / date_fin | Date | O | Cohérence des dates. |
| statut | Énumération | O | `déclarée | validée | refusée`. |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Lecture : Direction, RH. Écriture : RH.

### E-VARPAIE — Variable de paie
**Objectif.** Élément agrégé pour préparer la paie (externe).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| salarié | Référence(→Salarié) | O | — |
| période | Structure | O | Mois/année. |
| heures_normales / supplémentaires | Nombre | C | — |
| primes | Montant | F | — |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Lecture/Écriture : Direction, RH.

## C7. Matériaux & stock

### E-MATERIAU — Matériau (Article)
**Objectif.** Élément stockable/achetable.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| référence / désignation | Texte | O | — |
| unité | Référence(→Référentiel) | O | — |
| prix_achat_référence | Montant | F | — |
| seuil_réappro | Nombre | F | Source d'alerte stock. |
| fournisseur_préféré | Référence(→Tiers) | F | — |

**Historisation.** Complète. **Conservation.** Permanente. **Droits.** Lecture : Direction, Magasinier, Conducteur, Comptable. Écriture : Magasinier.

### E-EMPLACEMENT — Emplacement / Dépôt
**Objectif.** Lieu de stockage.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| nom | Texte | O | — |
| type | Énumération | F | Dépôt, camion, chantier… |

**Historisation.** Audit seul. **Conservation.** Permanente. **Droits.** Lecture/Écriture : Magasinier, Direction.

### E-MOUVEMENT — Mouvement de stock
**Objectif.** Entrée/sortie/transfert d'un matériau.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| matériau | Référence(→Matériau) | O | — |
| sens | Énumération | O | `entrée | sortie | transfert`. |
| quantité | Nombre | O | > 0. |
| emplacement | Référence(→Emplacement) | O | — |
| chantier | Référence(→Chantier) | F | Si sortie vers chantier. |
| valorisation | Montant | C | CALC-STK-001. |
| date | DateHeure | O | — |

**Historisation.** Complète. **Conservation.** Légale (inventaire). **Droits.** Lecture : Direction, Magasinier, Conducteur. Écriture : Magasinier.

### E-REAPPRO — Réapprovisionnement
**Objectif.** Proposition/commande de réassort déclenchée par un seuil.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| matériau | Référence(→Matériau) | O | — |
| quantité_proposée | Nombre | C | — |
| fournisseur | Référence(→Tiers) | F | — |
| statut | Énumération | O | `proposé | validé | commandé | reçu`. |

**Historisation.** Complète. **Conservation.** Durée utile + légale. **Droits.** Magasinier, Direction.

## C8. Parc véhicules & entretiens

### E-VEHICULE — Véhicule
**Objectif.** Fiche complète d'un véhicule de la flotte.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| immatriculation | Texte | O | Unique par organisation. |
| marque / modèle | Texte | O | — |
| année / mise_en_circulation | Entier / Date | O | — |
| carburant | Énumération | O | — |
| consommation_référence | Nombre | F | — |
| consommation_réelle | Nombre | C | CALC-VEH-002. |
| kilométrage_actuel | Nombre | C | Dernier relevé (E-KM). |
| conducteur_principal | Référence(→Tiers) | F | Donnée personnelle. |
| coût_exploitation | Montant | C | CALC-VEH-001. |
| coût_au_km | Montant | C | CALC-VEH-010. |
| statut_conformité | Énumération | C | `conforme | alerte proche | non conforme` (Business Rules ST-VEH). |

**Relations.** → Contrats, Entretiens, Réparations, Vidanges, Pneus, Batteries, Relevés km, Coûts ; ← Dépenses, Contraventions.
**Historisation.** Complète. **Conservation.** Durée de détention + délais légaux. **Droits.** Lecture : Direction, Gestionnaire de flotte, Conducteur (son véhicule). Écriture : Gestionnaire de flotte, Direction.

### E-CONTRATVEH — Contrat véhicule (assurance / leasing / crédit)
**Objectif.** Engagement contractuel lié à un véhicule, avec échéances.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| type | Énumération | O | `assurance | leasing | crédit`. |
| organisme | Référence(→Tiers) | F | — |
| référence_contrat | Texte | F | — |
| mensualité / prime | Montant | F | — |
| date_début / échéance / terme | Date | O | Source d'échéances. |
| document | Fichier | F | Police, contrat. |

**Historisation.** Complète. **Conservation.** Durée + légale. **Droits.** Direction, Gestionnaire de flotte.

### E-ENTRETIEN — Entretien
**Objectif.** Opération d'entretien planifiée/réalisée.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| type | Référence(→Référentiel) | O | Type d'entretien. |
| périodicité | Structure | F | Km et/ou temps. |
| date_prévue / date_réalisée | Date | F | Source d'échéance. |
| kilométrage | Nombre | F | — |
| coût | Montant | F | Rattaché à une dépense. |
| prochain_prévu | Structure | C | Replanification (Business Rules BR-VEH-011). |
| statut | Énumération | O | `planifié | réalisé`. |

**Historisation.** Complète (historique des entretiens). **Conservation.** Durée de détention + revente. **Droits.** Direction, Gestionnaire de flotte, Conducteur (lecture).

### E-REPARATION — Réparation
**Objectif.** Intervention corrective sur un véhicule.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| description | TexteLong | O | — |
| date | Date | O | — |
| coût | Montant | F | Dépense rattachée. |

**Historisation.** Complète. **Conservation.** Durée de détention. **Droits.** Direction, Gestionnaire de flotte.

### E-VIDANGE — Vidange · E-PNEU — Pneus · E-BATTERIE — Batterie
**Objectif.** Éléments d'entretien suivis individuellement (échéances propres).

| Attribut commun | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| date | Date | O | — |
| kilométrage | Nombre | F | — |
| détail | Structure | F | Vidange : type d'huile ; Pneus : jeu, saison, état ; Batterie : état. |
| prochaine_échéance | Date/Nombre | C | Source d'alerte (Business Rules ALR-010). |

**Historisation.** Complète. **Conservation.** Durée de détention. **Droits.** Direction, Gestionnaire de flotte.

### E-KM — Relevé kilométrique
**Objectif.** Point de mesure daté du kilométrage.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| date | Date | O | — |
| kilométrage | Nombre | O | ≥ relevé précédent (sinon anomalie ANO-006). |

**Historisation.** Complète (jamais écrasé). **Conservation.** Durée de détention. **Droits.** Gestionnaire de flotte, Conducteur (saisie), Direction.

### E-COUTVEH — Coût véhicule (agrégat calculé)
**Objectif.** Coût d'exploitation consolidé par véhicule et période.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| période | Structure | O | — |
| répartition_par_poste | Structure | C | Carburant, entretien, assurance, leasing, contraventions. |
| total | Montant | C | CALC-VEH-001. |

**Historisation.** Aucune (projection recalculable). **Conservation.** Régénérable. **Droits.** Direction, Gestionnaire de flotte, Comptable.

## C9. Contraventions

### E-CONTRAVENTION — Contravention
**Objectif.** Infraction rattachée à un véhicule et un conducteur (données
**sensibles**).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| véhicule | Référence(→Véhicule) | O | — |
| conducteur | Référence(→Tiers) | O | Donnée personnelle sensible. |
| date / heure | Date / Texte | O | — |
| lieu | Texte | O | — |
| type_infraction | Référence(→Référentiel) | O | — |
| montant | Montant | O | — |
| perte_points | Entier | F | Donnée sensible. |
| statut | Énumération | O | `à traiter | payée | contestée | classée`. |
| délai_paiement / délai_contestation | Date | C | Échéances (Business Rules BR-CTR-001). |
| justificatifs | Liste(Fichier) | F | — |
| observations | TexteLong | F | — |

**États.** Business Rules ST-CTR.
**Relations.** → Contestation, → Paiement ; ← Véhicule, Conducteur ; → Dépense (si payée).
**Historisation.** Complète. **Conservation.** **Restreinte** (durée strictement nécessaire, RGPD). **Droits.** Lecture/Écriture : **Direction, Gestionnaire de flotte uniquement** ; accès **journalisé** (Master Blueprint 20.2, Business Rules BR-CTR-007).

### E-CONTESTATION — Contestation
**Objectif.** Recours contre une contravention.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| contravention | Référence(→Contravention) | O | — |
| date_dépôt | Date | O | Avant l'échéance de contestation. |
| motif | TexteLong | O | — |
| statut | Énumération | O | `déposée | acceptée | rejetée`. |
| document | Fichier | F | — |

**Historisation.** Complète. **Conservation.** Avec la contravention. **Droits.** Direction, Gestionnaire de flotte.

### E-PAIEMENTCTR — Paiement de contravention
**Objectif.** Règlement d'une contravention.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| contravention | Référence(→Contravention) | O | — |
| montant | Montant | O | — |
| date | Date | O | — |
| imputation | Énumération | O | `entreprise | conducteur` (règle à valider, RGPD/droit du travail). |

**Historisation.** Complète. **Conservation.** Avec la contravention. **Droits.** Direction, Gestionnaire de flotte, Comptable (montant).

## C10. Espace dirigeant

### E-TACHE — Tâche
**Objectif.** Action à réaliser, priorisée, du cockpit du dirigeant.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| libellé | Texte | O | — |
| description | TexteLong | F | — |
| source | Référence | F | Objet à l'origine (facture, échéance, contravention…). |
| origine | Énumération | O | `saisie | automatique`. |
| échéance | Date | F | — |
| facteurs_priorité | Structure | C | Urgence, importance, impact financier, impact opérationnel, délai. |
| score_priorité | Nombre | C | Business Rules PRI-001. |
| niveau_priorité | Énumération | C | `critique | planifier | déléguer | différer`. |
| explication_priorité | TexteLong | C | Raison (Business Rules PRI-014). |
| statut | Énumération | O | `créée | priorisée | en cours | terminée | déléguée | différée | annulée`. |
| assignée_à | Référence(→Utilisateur) | F | — |

**États.** Business Rules ST-TASK.
**Relations.** ← Événements de tous modules (BR-DIR-002).
**Historisation.** Complète. **Conservation.** Durée utile + trace. **Droits.** **Espace strictement personnel au dirigeant** (et délégués explicites) ; accès journalisé.

### E-DECISION — Décision du dirigeant
**Objectif.** Décision à prendre / prise, tracée.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| sujet | Texte | O | — |
| contexte | TexteLong | F | — |
| options | Liste(Texte) | F | — |
| statut | Énumération | O | `en attente | prise | reportée`. |
| décision_retenue | TexteLong | F si prise | — |
| date_décision | Date | F | — |

**Historisation.** Complète. **Conservation.** Longue (mémoire de direction). **Droits.** Direction uniquement.

### E-VALIDATION — Validation
**Objectif.** Approbation requise avant un acte engageant (Business Rules INV-7).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| objet | Référence | O | Acte à valider (devis, facture, envoi…). |
| statut | Énumération | O | `demandée | accordée | refusée`. |
| motif | TexteLong | F | — |
| date | DateHeure | F | — |

**Historisation.** Complète. **Conservation.** Avec l'objet. **Droits.** Direction (et délégués).

### E-SIGNATURE — Demande de signature
**Objectif.** Document à signer par le dirigeant (Master Blueprint 16.4).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| document | Référence(→Document) | O | — |
| statut | Énumération | O | `à signer | signé | refusé`. |
| date_signature | DateHeure | F | — |
| preuve_signature | Structure | C si signé | Élément probant (prestataire). |

**Historisation.** Complète. **Conservation.** Avec le document (valeur juridique). **Droits.** Direction.

### E-OBJECTIF — Objectif personnel
**Objectif.** But suivi par le dirigeant (CA, marge, personnel).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| libellé | Texte | O | — |
| cible | Structure | F | Valeur/date visée. |
| avancement | Pourcentage | C | Si mesurable via les données. |
| échéance | Date | F | — |

**Historisation.** Audit seul. **Conservation.** Durée utile. **Droits.** Direction.

### E-NOTE — Note
**Objectif.** Note libre du dirigeant, rattachable à un objet.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| contenu | TexteLong | O | — |
| objet_lié | Référence | F | Chantier, client, véhicule… |
| date | DateHeure | O | — |

**Historisation.** Audit seul. **Conservation.** Durée utile. **Droits.** Direction (auteur).

### E-OBLIGATION — Obligation administrative/fiscale
**Objectif.** Échéance réglementaire à respecter.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Référence(→Référentiel) | O | TVA, cotisations, déclarations… |
| échéance | Date | O | Source d'alerte (Business Rules BR-DIR-005). |
| périodicité | Structure | F | — |
| statut | Énumération | O | `à venir | faite | en retard`. |

**Historisation.** Complète. **Conservation.** Légale. **Droits.** Direction, Comptable.

## C11. Échéances, priorités & alertes

### E-ECHEANCE — Échéance (typée, transverse)
**Objectif.** Date-butoir unifiée, source de toutes les alertes (Master Blueprint
10.4).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | `facture | assurance | contrôle technique | entretien | vidange | pneus | leasing | contravention_paiement | contravention_contestation | obligation | réserve | garantie`. |
| objet_source | Référence | O | L'entité concernée. |
| date | Date | O | — |
| délai_alerte | Durée | C | Depuis le paramètre du type. |
| statut | Énumération | O | `à venir | proche | dépassée | traitée`. |

**Historisation.** Audit seul. **Conservation.** Avec l'objet source. **Droits.** Selon l'objet source.

### E-PRIORITE — Priorité (calculée)
**Objectif.** Résultat du moteur de priorité pour un élément (souvent une tâche).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| élément | Référence | O | Tâche/alerte concernée. |
| facteurs | Structure | C | 5 facteurs normalisés. |
| score | Nombre | C | PRI-001. |
| niveau | Énumération | C | `critique | planifier | déléguer | différer`. |
| explication | TexteLong | C | PRI-014. |
| calculée_le | DateHeure | C | Recalcul (PRI-016). |

**Historisation.** Aucune (recalculable). **Conservation.** Régénérable. **Droits.** Selon l'élément.

### E-ALERTE — Alerte
**Objectif.** Notification issue d'une échéance ou d'un seuil (Business Rules
Partie G).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | Correspond aux règles ALR-xxx. |
| échéance_source | Référence(→Échéance) | F | — |
| objet | Référence | O | — |
| niveau | Énumération | O | `information | avertissement | critique`. |
| statut | Énumération | O | `active | traitée | expirée | annulée`. |
| regroupée_dans | Référence(→Alerte) | F | Anti-fatigue (regroupement). |

**États.** Business Rules ALR-004.
**Historisation.** Audit seul (apparition/disparition tracées). **Conservation.** Durée utile. **Droits.** Selon l'objet.

## C12. Documents

### E-DOCUMENT — Document
**Objectif.** Référence vers un fichier justificatif (le binaire vit hors base).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | `photo | carte grise | contrôle technique | facture pdf | devis pdf | contrat | pv | justificatif`… |
| référence_stockage | Texte | O | Clé du fichier. |
| empreinte | Texte | C | Intégrité/dédoublonnage. |
| taille / format | Nombre / Texte | C | — |
| objet_lié | Référence | O | Rattachement polymorphe (type + identifiant). |
| version_courante | Entier | C | — |
| immuable | Booléen | O | Vrai pour les actes émis. |

**États.** `Actif | Archivé`.
**Relations.** → Versions ; ← n'importe quel objet.
**Historisation.** Complète (versions). **Conservation.** Selon le type (facture 10 ans, etc. — Partie F). **Droits.** Selon l'objet lié.

### E-VERSIONDOC — Version de document
**Objectif.** État figé et daté d'un document (les actes émis ne se modifient pas,
on versionne).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| document | Référence(→Document) | O | — |
| numéro_version | Entier | O | — |
| référence_stockage | Texte | O | — |
| date | DateHeure | O | — |

**Historisation.** Aucune (chaque version est immuable). **Conservation.** Comme le document. **Droits.** Comme le document.

### E-MODELE — Modèle de document
**Objectif.** Gabarit pour générer devis, factures, PV, courriers.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | — |
| contenu | Structure | O | Gabarit (champs à remplir). |
| actif | Booléen | O | — |

**Historisation.** Complète. **Conservation.** Permanente. **Droits.** Direction, administration.

## C13. Calendrier & synchronisation Apple (structure)

### E-RDV — Rendez-vous
**Objectif.** Rendez-vous/événement d'agenda du dirigeant (alimente le cockpit).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| titre | Texte | O | — |
| date_début / date_fin | DateHeure | O | — |
| lieu | Texte | F | — |
| participants | Liste(Texte/Référence) | F | — |
| type | Énumération | F | `rendez-vous | déplacement | réunion | rappel`. |
| source | Référence(→SourceCalendrier) | F | Interne ou Apple (futur). |
| identité_externe | Texte | F | Clé stable pour dédoublonnage (Business Rules BR-CAL-001). |

**Historisation.** Audit seul. **Conservation.** Durée utile. **Droits.** Direction.

### E-SOURCECAL — Source de calendrier (structure Apple, non développée)
**Objectif.** Décrire une source d'agenda externe à synchroniser **plus tard**
(Apple Calendar). **Structure uniquement** — aucune synchronisation développée.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| fournisseur | Énumération | O | `interne | apple` (extensible). |
| identité_connexion | Structure | F | Référence d'autorisation (jamais de secret en clair). |
| état_synchro | Énumération | O | `inactif | actif`. |
| dernière_synchro | DateHeure | F | — |
| direction | Énumération | O | `lecture seule | bidirectionnelle` (commencer en lecture seule). |

**Historisation.** Audit seul. **Conservation.** Durée de la connexion. **Droits.** Direction.

## C14. Intelligence artificielle

### E-IA-INTERACTION — Interaction IA
**Objectif.** Trace d'un échange avec le copilote (question/réponse, brief).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| utilisateur | Référence(→Utilisateur) | O | — |
| type | Énumération | O | `question | brief | analyse`. |
| entrée | TexteLong | O | Contexte envoyé (minimisé). |
| réponse | TexteLong | O | — |
| sources_citées | Liste(Référence) | C | RAG (Business Rules IA-072). |
| étiquettes | Structure | C | Fait/calcul/estimation/recommandation (IA-002). |
| fournisseur / modèle / version | Texte | C | Pour l'audit. |
| coût | Montant | C | Suivi budgétaire. |

**Historisation.** Aucune (enregistrement immuable). **Conservation.** Restreinte (durée d'analyse), minimisation. **Droits.** Direction, utilisateur (ses interactions).

### E-IA-SUGGESTION — Suggestion IA
**Objectif.** Proposition émise par l'IA (analyse, tendance, anomalie enrichie).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| origine | Référence | F | Donnée/anomalie source. |
| contenu | TexteLong | O | — |
| nature | Énumération | O | `estimation | recommandation` (jamais un chiffre officiel). |
| statut | Énumération | O | `proposée | acceptée | rejetée`. |

**Historisation.** Audit seul. **Conservation.** Durée utile. **Droits.** Selon la donnée source.

### E-IA-ACTION — Action proposée IA
**Objectif.** Action que l'IA propose d'exécuter (toujours validée avant effet).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Énumération | O | Créer tâche, préparer relance/mail, classer document, rattacher dépense, rapport, rappel, rapprochement… (Business Rules IA-040). |
| brouillon | Structure | O | Contenu préparé. |
| statut | Énumération | O | `proposée | validée | exécutée | refusée`. |
| validée_par | Référence(→Utilisateur) | F | Obligatoire avant exécution (IA-042). |

**Historisation.** Complète (traçabilité des validations). **Conservation.** Avec l'objet cible. **Droits.** Selon l'action.

### E-RAG-SOURCE — Source RAG
**Objectif.** Élément indexable consultable par l'IA selon les droits (devis,
factures, contrats, rapports, documents véhicules, procédures, Business Rules Bible,
Master Blueprint).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| objet | Référence | O | Document/donnée indexé. |
| type_source | Énumération | O | — |
| périmètre_droits | Structure | O | Qui peut la consulter (filtrage avant envoi au modèle, IA-071). |

**Historisation.** Audit seul. **Conservation.** Avec l'objet. **Droits.** Hérités de l'objet source.

### E-IA-CONFIG — Configuration fournisseur IA
**Objectif.** Paramétrage de l'AI Gateway (multi-fournisseur).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| fournisseur | Énumération | O | `claude | chatgpt | gemini | local` (extensible). |
| actif | Booléen | O | — |
| règles_de_routage | Structure | F | Par tâche/sensibilité (Business Rules IA-063). |
| identité_connexion | Structure | F | Côté serveur uniquement, jamais dans le frontend (IA-085). |

**Historisation.** Complète. **Conservation.** Permanente. **Droits.** Direction/administration technique.

## C15. Transverses techniques

### E-EVENEMENT — Événement métier
**Objectif.** Fait accompli, immuable, colonne vertébrale (Master Blueprint ch. 13).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| type | Texte | O | `Domaine.FaitAuPassé`. |
| version_schéma | Entier | O | — |
| agrégat | Référence | O | Objet concerné. |
| auteur | Structure | O | Utilisateur + canal (interface/mobile/automatisation/connecteur). |
| horodatage | DateHeure | O | — |
| corrélation / causalité | Référence | F | Chaîne d'événements. |
| contenu | Structure | O | Données métier. |

**Historisation.** Aucune (append-only, immuable). **Conservation.** Longue (histoire métier). **Droits.** Lecture : Direction/technique (restreint). Jamais de modification.

### E-AUDIT — Entrée d'audit
**Objectif.** Trace de conformité (qui/quoi/quand/où), immuable.

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| action | Texte | O | — |
| cible | Référence | O | — |
| auteur | Référence(→Utilisateur) | O | — |
| horodatage | DateHeure | O | — |
| contexte | Structure | F | Adresse, appareil… |

**Historisation.** Aucune (immuable). **Conservation.** Longue (conformité). **Droits.** Lecture : Direction (restreint, journalisée). Jamais de modification/suppression.

### E-HISTO — Historique de modification
**Objectif.** État antérieur d'une entité engageante (valeur avant/après).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| entité | Référence | O | — |
| attribut | Texte | O | — |
| valeur_avant / valeur_après | Structure | O | — |
| auteur / date | Référence / DateHeure | O | — |

**Historisation.** Aucune (l'historique est lui-même l'archive). **Conservation.** Selon l'entité concernée. **Droits.** Selon l'entité concernée.

### E-NOTIF — Notification
**Objectif.** Message poussé à un utilisateur (in-app, e-mail, push).

| Attribut | Type | O/F/C | Validation |
|---|---|---|---|
| destinataire | Référence(→Utilisateur) | O | — |
| canal | Énumération | O | `in-app | email | push`. |
| source | Référence | F | Alerte, tâche, événement. |
| lu | Booléen | O | — |
| date | DateHeure | O | — |

**Historisation.** Aucune. **Conservation.** Durée utile. **Droits.** Le destinataire, Direction.

---

# Partie D — Matrice consolidée des relations

> Les liens **inter-domaines** sont des **références d'identifiant** (cloisonnement,
> Master Blueprint P3) ; les liens **intra-domaine** sont des compositions. Extrait
> de référence :

| Entité | Référence vers | Cardinalité | Nature |
|---|---|---|---|
| Utilisateur | Rôle | 1..n | intra-socle |
| Tiers | (rôles multiples) | 0..n | pivot |
| Opportunité | Tiers, VisiteTechnique, Devis | 1 / 0..1 / 0..n | inter |
| Devis | Tiers, VisiteTechnique, LigneDevis | 1 / 0..1 / 1..n | mixte |
| Chantier | Devis, Tiers | 1 / 1 | inter |
| Chantier | Lot, Phase, Réception, Réserve | 0..n | intra |
| Facture | Tiers, Chantier, LigneFacture, Encaissement | 1 / 0..1 / 1..n / 0..n | mixte |
| Dépense | Chantier ou Véhicule, Tiers(fournisseur) | 0..1 / 0..1 | inter |
| JournéeDeTravail | Salarié, Chantier | 1 / 1 | inter |
| MouvementStock | Matériau, Emplacement, Chantier | 1 / 1 / 0..1 | inter |
| Véhicule | Tiers(conducteur), Contrats, Entretiens… | 0..1 / 0..n | mixte |
| Contravention | Véhicule, Tiers(conducteur) | 1 / 1 | inter (sensible) |
| Tâche | (objet source, tous modules) | 0..1 | inter |
| Échéance | (objet source) | 1 | transverse |
| Document | (objet lié, tous modules) | 1 | polymorphe |
| Événement / Audit | (agrégat / cible) | 1 | technique |

---

# Partie E — Matrice consolidée des droits d'accès (extrait de référence)

> **L** = lecture, **E** = écriture, **—** = pas d'accès. Toujours **restreint par
> attributs** (organisation, affectation) et **vérifié côté serveur**.

| Domaine / Entité | Direction | Conducteur | Commercial | Comptable/ADV | RH | Magasinier | Gest. flotte |
|---|---|---|---|---|---|---|---|
| Entreprise/Paramètres | L·E | — | — | L | — | — | — |
| Utilisateurs/Rôles | L·E | — | — | — | — | — | — |
| Clients/Prospects | L·E | L (ses chantiers) | L·E | L | — | — | — |
| Fournisseurs | L·E | — | — | L·E | — | L·E | L |
| Chantiers/Lots | L·E | L·E (ses chantiers) | L | L | — | — | — |
| Devis | L·E | L | L·E | L | — | — | — |
| Factures/Encaissements | L·E | — | L | L·E | — | — | — |
| Dépenses | L·E | L·E (ses chantiers) | — | L·E | — | L·E | L·E (ses véhicules) |
| RH (salariés, paie) | L·E | L (affectation) | — | — | L·E | — | — |
| Stock | L | L | — | L | — | L·E | — |
| Véhicules/Entretiens | L·E | L (son véhicule) | — | L | — | — | L·E |
| **Contraventions** | **L·E** | **—** | **—** | **L (montant)** | **—** | **—** | **L·E** |
| **Espace Dirigeant** | **L·E** | **—** | **—** | **—** | **—** | **—** | **—** |
| Documents | selon l'objet lié | | | | | | |
| IA (interactions) | L·E | L (les siennes) | L (les siennes) | L (les siennes) | L (les siennes) | L (les siennes) | L (les siennes) |
| Audit | L (restreint) | — | — | — | — | — | — |

> Les rôles **Client** et **Sous-traitant** (portails futurs) n'ont accès qu'à
> **leurs** objets (chantiers, documents, lots), en lecture principalement.

---

# Partie F — Règles consolidées de conservation

| Catégorie de donnée | Durée de conservation (principe) | Base |
|---|---|---|
| Factures, encaissements, avoirs, situations | **10 ans** | Obligation comptable/fiscale. |
| Devis | Durée de l'affaire + délai utile | Preuve commerciale. |
| Chantiers, réceptions, garanties | **Longue** (période décennale + marge) | Responsabilité décennale. |
| Documents émis (PV, factures) | Selon le type (souvent 10 ans) | Valeur juridique. |
| Données RH (salariés, paie, absences) | Durées légales post-emploi | Droit du travail + RGPD. |
| **Contraventions, points, conducteur** | **Strictement nécessaire** puis anonymisation | RGPD renforcé (données sensibles). |
| Prospects (non convertis) | **Durée limitée** puis anonymisation | RGPD (minimisation). |
| Véhicules et entretiens | Durée de détention + revente/garanties | Suivi + preuve. |
| Événements, audit | **Longue** (immuables) | Traçabilité/conformité. |
| Interactions IA | **Restreinte** (analyse), minimisée | RGPD + souveraineté. |
| Notifications | Durée utile | — |

> **Principes transverses.** Suppression = archivage (jamais d'effacement d'une
> donnée engageante). Droit à l'effacement RGPD = anonymisation **tracée**. Les
> durées précises par type sont des **paramètres** (E-PARAM) validés avec la
> direction (question ouverte du Master Blueprint).

---

# Partie G — Traçabilité vers les autres documents fondateurs

| Thème | Data Bible | Master Blueprint | Business Rules Bible |
|---|---|---|---|
| Multi-entreprise (attribut *organisation*) | A4 | D4, 9.2 | INV (cloisonnement) |
| Verrou optimiste (*révision*) | A4 | 9.5 | INV-2 |
| Suppression logique / archivage | A4, A6, F | 9.5, 4.4 | INV-2 |
| Historisation (tables d'historique) | A5, E-HISTO | D21, 9.6, 19.3 | INV-6 |
| Chiffres calculés (attributs C) | C (attributs *Calculé*) | P6, D7, 15 | INV-1, Partie E (CALC) |
| Échéances unifiées | E-ECHEANCE | 10.4 | Partie G (ALR) |
| Priorité | E-TACHE, E-PRIORITE | ch. 38, D28 | Partie F (PRI) |
| Contraventions sensibles | E-CONTRAVENTION, E, F | 20.2, D27 | BR-CTR-007 |
| Documents/pièces jointes | E-DOCUMENT | ch. 16, D11 | BR-DOC |
| Synchronisation Apple (structure) | E-SOURCECAL, E-RDV | ch. 40, D29 | BR-CAL |
| IA (interactions, RAG, gateway) | C14 | ch. 24 | Partie J |
| Événements / audit | E-EVENEMENT, E-AUDIT | ch. 13, 19 | Partie B, INV-6 |

---

## Fin du document

> **BRN PILOT — Data Bible v1.0.** Le modèle métier de référence : toutes les
> données officielles de *BRN Pilot*, indépendamment de toute technologie. Document
> normatif, en construction, **sans code, sans table SQL, sans migration**.
>
> **Règle d'or.** Aucune donnée métier importante n'est ajoutée au développement
> sans figurer ici. Le schéma physique, quand il viendra, sera la **traduction
> fidèle** de cette Bible — jamais l'inverse.
>
> Prochaines étapes proposées : préciser les **énumérations** et **validations** au
> niveau attribut (densification), fixer les **durées de conservation** et
> **pondérations** (paramètres, avec la direction), puis produire l'**API Bible**
> (contrats exposant ces données) et la **Security Bible**.
