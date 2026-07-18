# 03 — Modules fonctionnels

Chaque module est un **contexte délimité** (chap. 02) et suit **la même anatomie
interne** (chap. 01 §2). Ce chapitre fixe, pour chacun : son périmètre, ses
racines d'agrégat, ses événements, ses dépendances, et **l'ordre d'arrivée**.

## Règle commune à tous les modules

Avant de décrire chaque module, la règle qui vaut pour **tous** :

- **Il possède ses données.** Personne ne lit ni n'écrit dans ses tables.
- **Il expose une API** (couche 3) et **émet/écoute des événements** (couche 4).
- **Il apporte de la valeur seul.** On peut le livrer sans que le suivant existe.
- **Il ne connaît pas l'implémentation des autres.** Il connaît leurs contrats.
- **Il se greffe sans modifier l'existant.** Ajouter le module Stock ne touche
  pas une ligne du module Études.

## 0. Socle & Référentiels (fondation — livré en premier)

Non optionnel : c'est le sol sur lequel tout repose.

| Aspect | Contenu |
|---|---|
| **Périmètre** | Organisation (`org_id`), Tiers (party) et rôles, Identité/rôles/permissions, Référentiels partagés (corps d'état, unités, taux de TVA, jours fériés), Documents, Événements/Audit, Notifications. |
| **Racines** | Organisation, Tiers, Utilisateur, Rôle, Document, Référentiel. |
| **Émet** | `Party.Créé`, `Party.RôleAjouté`, `Document.Versionné`. |
| **Dépend de** | Rien (c'est la fondation). |
| **Pourquoi d'abord** | Tous les autres modules référencent le Tiers, l'identité et les référentiels. |

## 1. Études & Métré (module actuel — point de départ)

C'est **la v2 actuelle**, promue en module. Aucune fonctionnalité perdue.

| Aspect | Contenu |
|---|---|
| **Périmètre** | Visite technique, relevé, métré multi-profils (intérieur, cuisine, sanitaire, façade, toiture, extérieur, technique), croquis coté, photos, génération d'ouvrages, rapport A4. |
| **Racines** | Étude (ex-Visite), Pièce/Zone, Ouvrage. |
| **Cœur métier pur** | `calc.js` (moteur de métré + états de validation), `travaux.js` (`ouvragesDeVisite`, `calcPoste`), `profils.js`, `catalogue.js`. **Conservés tels quels.** |
| **Émet** | `Etude.VisiteClôturée`, `Etude.MétréChiffréPrêt`. |
| **Écoute** | `Crm.OpportunitéCréée` (pour préparer une visite). |
| **Dépend de** | Socle (Tiers, Référentiels, Documents). |
| **Migration** | La donnée locale IndexedDB actuelle est importée sans perte (chap. 11). Le `Store` devient un adaptateur qui synchronise avec le serveur. |

## 2. Finance (Devis · Facturation · Trésorerie)

Le module qui transforme le métré en argent et pilote la marge.

| Aspect | Contenu |
|---|---|
| **Périmètre** | Bibliothèque de prix (déboursés, main-d'œuvre, marges commerciales), devis versionnés, bons de commande, factures et **situations de travaux**, avoirs, **suivi de trésorerie** (projeté vs réel), **rapprochement**, export vers la comptabilité. |
| **Racines** | Devis, Facture, Situation, Écriture de trésorerie, ArticleDePrix. |
| **Émet** | `Finance.DevisÉmis`, `Finance.DevisAccepté`, `Finance.FactureÉmise`, `Finance.PaiementReçu`. |
| **Écoute** | `Etude.MétréChiffréPrêt` (fabrique un devis), `Chantier.AvancementMisÀJour` (déclenche une situation), `Rh.HeuresPointées`/`Stock.MouvementEnregistré` (coût réel → marge). |
| **Dépend de** | Socle, Études (ouvrages), Chantiers (avancement). |
| **Note** | La comptabilité **légale** reste externe (expert-comptable) ; la Finance de l'ERP la **nourrit** par connecteur (chap. 06), elle ne la remplace pas au départ. |

## 3. Chantiers (Planning · Avancement · Réception)

Le cœur du pilotage. C'est ici que « marge prévue vs réalisée » prend vie.

| Aspect | Contenu |
|---|---|
| **Périmètre** | Création du chantier depuis un devis accepté, planning (phases, tâches, jalons, dépendances), affectation des équipes, suivi d'avancement par lot, journal de chantier, photos d'avancement, **réception + réserves**, ouverture des garanties. |
| **Racines** | Chantier, Phase/Tâche, Réception, Réserve. |
| **Émet** | `Chantier.Démarré`, `Chantier.AvancementMisÀJour`, `Chantier.Réceptionné`, `Chantier.RéserveLevée`. |
| **Écoute** | `Finance.DevisAccepté` (crée le chantier), `Rh.HeuresPointées`, `Stock.MouvementEnregistré` (agrège le coût réel). |
| **Dépend de** | Socle, Finance, RH, Stock. |
| **Pilotage** | Tableau de bord dirigeant : santé du chantier (retard, marge, trésorerie, réserves). C'est l'écran qui justifie tout le projet. |

## 4. CRM (Relation client)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Comptes, contacts, opportunités/affaires, pipeline commercial, historique d'interactions, origine des demandes, relances, portail client (aval). |
| **Racines** | Compte, Opportunité, Interaction. |
| **Émet** | `Crm.OpportunitéCréée`, `Crm.AffaireGagnée`, `Crm.AffairePerdue`. |
| **Écoute** | `Finance.DevisAccepté`/`DevisRefusé`, `Finance.PaiementReçu`. |
| **Dépend de** | Socle (Tiers). |
| **Note** | Le champ `client.origine` de la v2 est déjà l'embryon du CRM : il devient une vraie donnée d'opportunité. |

## 5. RH (Salariés · Pointage · Paie)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Dossiers salariés, contrats, compétences/habilitations, planning des équipes, **pointage terrain** (heures par chantier), congés/absences, préparation de paie (variables), notes de frais. |
| **Racines** | Salarié, Pointage, Absence, ÉlémentDePaie. |
| **Émet** | `Rh.HeuresPointées`, `Rh.AbsenceValidée`. |
| **Écoute** | `Chantier.Démarré` (besoin de main-d'œuvre), `Chantier.AvancementMisÀJour`. |
| **Dépend de** | Socle (Tiers = salarié). |
| **Sensibilité** | Données personnelles fortes → cloisonnement RBAC strict et RGPD renforcé (chap. 05). La paie **légale** peut rester externe et être nourrie par connecteur. |

## 6. Stock (Articles · Mouvements · Approvisionnement)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Catalogue articles/matériaux, dépôts, stock par emplacement, entrées/sorties, réservation pour chantier, seuils et réappro, valorisation, lien fournisseurs et achats. |
| **Racines** | Article, Mouvement, Emplacement, Réapprovisionnement. |
| **Émet** | `Stock.MouvementEnregistré`, `Stock.SeuilAtteint`. |
| **Écoute** | `Finance.DevisAccepté` (réserver), `Chantier.Démarré` (allouer). |
| **Dépend de** | Socle, Finance (fournisseurs/achats). |
| **Note** | Les estimations matière du métré v2 (plaques, rails, bandes) deviennent des **besoins** qui alimentent le Stock. |

## 7. SAV (Après-vente · Litiges)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Tickets après réception, rattachement au chantier et à l'ouvrage concerné, **suivi des garanties** (parfait achèvement, biennale, décennale), planification d'intervention, historique, facturabilité (sous garantie ou non). |
| **Racines** | Ticket, Intervention, Garantie. |
| **Émet** | `Sav.TicketOuvert`, `Sav.InterventionClôturée`. |
| **Écoute** | `Chantier.Réceptionné` (ouvre les garanties). |
| **Dépend de** | Socle, Chantiers, RH (planifier). |

## 8. Maintenance (Contrats · Préventif)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Contrats de maintenance récurrente, équipements suivis, plans préventifs, interventions planifiées, échéancier, facturation récurrente. Cousin du SAV (curatif) mais **préventif et contractuel**. |
| **Racines** | ContratMaintenance, Équipement, InterventionPlanifiée. |
| **Émet** | `Maintenance.InterventionDue`, `Maintenance.InterventionRéalisée`. |
| **Écoute** | `Chantier.Réceptionné` (proposer un contrat). |
| **Dépend de** | Socle, SAV (partage la notion d'intervention), Finance (récurrent). |

## 9. Documents (GED transverse)

| Aspect | Contenu |
|---|---|
| **Périmètre** | Gestion électronique documentaire : classement par chantier/client/tiers, versionnage, modèles (devis, factures, PV de réception, attestations), **signature électronique**, recherche plein-texte, cycle de vie et conservation légale. |
| **Racines** | Document, Version, Modèle. |
| **Émet** | `Document.Versionné`, `Document.Signé`. |
| **Écoute** | Presque tous les événements produisant un document (devis, facture, PV…). |
| **Dépend de** | Socle. |
| **Note** | La génération de rapport A4/PDF de la v2 (`Recap.jsx`, `PRINT_CSS`) est le premier producteur de documents ; elle bascule vers ce module. |

## 10. IA (Augmentation — transverse)

Détaillé au chapitre 07. Résumé : couche d'assistance branchée sur les contrats
et événements. Cas d'usage : pré-remplissage de métré depuis photo/plan, contrôle
de cohérence, résumé de chantier, aide au chiffrage, détection d'anomalie de
marge, assistant conversationnel sur les données. **Ne décide jamais seule** (P10).

## 11. Mobile (Client terrain — transverse)

Détaillé au chapitre 09. Ce n'est pas un module de domaine mais un **client**
supplémentaire de tous les modules, avec exigence **local-first** renforcée
(métré, pointage, SAV, photos hors-ligne).

## 12. Synchronisations externes (Connecteurs — transverse)

Détaillé au chapitre 06. Connecteurs isolés vers : comptabilité, banque
(agrégation/rapprochement), agenda, messagerie, signature, cartographie,
fournisseurs. Chaque connecteur est un **adaptateur** qui protège le cœur des
pannes et des changements d'API du partenaire.

## 13. Automatisations (Moteur — transverse)

Détaillé au chapitre 08. Règles et workflows déclenchés par les événements :
relance de devis, alerte de dépassement de marge, rappel de fin de garantie,
réappro automatique, notification de réserve non levée.

---

## Ordre d'arrivée recommandé (résumé)

L'ordre sert la vision (chap. 00 §5) : rendre le **parcours de valeur** continu,
en commençant par ce qui existe et rapporte vite. Détails et jalons : chap. 12.

```
Vague 0 : Socle & Référentiels + migration d'Études & Métré  (fondation)
Vague 1 : Finance (devis) + CRM léger                        (chiffrer & suivre)
Vague 2 : Chantiers (planning, avancement, coût réel)        (piloter)
Vague 3 : RH (pointage) + Stock                              (nourrir le coût réel)
Vague 4 : Facturation/situations + Trésorerie                (encaisser)
Vague 5 : SAV + Maintenance + Documents (GED complète)       (après-vente)
Transverses (IA, Automatisations, Mobile, Connecteurs) : introduits progressivement,
dès qu'un module les rend utiles — jamais en préalable bloquant.
```

Chaque vague est **livrable et utile seule**. Aucune ne casse la précédente :
c'est la garantie de l'invariant P1.
