# Architecture de référence — ERP de pilotage BRN Group

> **Statut : document de référence normatif.**
> Toute version future du logiciel doit respecter cette architecture. Un écart
> se traite par une **décision d'architecture** (ADR, voir `adr/`) documentée et
> approuvée, jamais par une dérogation silencieuse.

**Version du document : 1.0.0 — 2026-07-18**
**Auteur : Architecture logicielle — validé pour la direction BRN Group.**

---

## 0. À qui s'adresse ce document

| Lecteur | Ce qu'il vient y chercher |
|---|---|
| Direction (dirigeant BRN Group) | Vision, périmètre, trajectoire pluriannuelle, maîtrise du risque et du coût (chap. 1 et 12). |
| Architecte / lead technique | Règles structurantes, contextes délimités, contrats, décisions (tous chapitres + ADR). |
| Développeur | Où poser un nouveau module sans rien casser (chap. 3, 4, 6, 11). |
| Prestataire externe / intégrateur | Contrats d'API, sécurité, modèle de données (chap. 4, 5, 6). |

## 1. Ce que ce projet est — et n'est pas

Ce n'est **pas** une application de plus. C'est un **ERP de pilotage** pour une
entreprise générale du bâtiment, conçu pour vivre **plusieurs années sans refonte
majeure** et pour absorber, l'un après l'autre et **sans casser l'existant**, les
domaines suivants :

> Finance · Chantiers · CRM · RH · Stock · SAV · Maintenance · Documents · IA ·
> Application mobile · Synchronisations externes · Automatisations avancées.

L'existant — la PWA de **visite technique / métré** (v2.4.1) — n'est pas jeté :
il devient le **premier module métier** (« Études & Métré ») d'un système plus
vaste. Sa culture d'ingénierie (adaptateur de persistance, migration douce,
hors-ligne d'abord, graphe de dépendances en couches sans cycle) devient la
**culture de tout l'ERP**.

## 2. Plan de lecture

| # | Document | Contenu |
|---|---|---|
| 00 | [`00-vision-et-principes.md`](./00-vision-et-principes.md) | Objectifs, invariants d'architecture, les 12 principes directeurs. |
| 01 | [`01-architecture-cible.md`](./01-architecture-cible.md) | Vue d'ensemble, style architectural (monolithe modulaire → services), couches, diagrammes. |
| 02 | [`02-modele-de-domaine.md`](./02-modele-de-domaine.md) | Contextes délimités (DDD), langage ubiquitaire, entités pivots, événements de domaine. |
| 03 | [`03-modules-fonctionnels.md`](./03-modules-fonctionnels.md) | Les 13 modules : périmètre, données, dépendances, ordre d'arrivée. |
| 04 | [`04-donnees-et-persistance.md`](./04-donnees-et-persistance.md) | Système de vérité, multi-tenant, journal d'événements, migrations, cycle de vie des documents et médias. |
| 05 | [`05-securite-conformite.md`](./05-securite-conformite.md) | Authentification, RBAC/ABAC, RGPD, pistes d'audit, secrets. |
| 06 | [`06-integrations-synchronisation.md`](./06-integrations-synchronisation.md) | API-first, événements, outbox, connecteurs externes, moteur de synchronisation hors-ligne. |
| 07 | [`07-intelligence-artificielle.md`](./07-intelligence-artificielle.md) | Couche IA d'augmentation, garde-fous, cas d'usage, souveraineté des données. |
| 08 | [`08-automatisations.md`](./08-automatisations.md) | Moteur de règles et de workflows, déclencheurs, actions, gouvernance. |
| 09 | [`09-mobile-et-offline.md`](./09-mobile-et-offline.md) | Stratégie multi-clients (PWA, mobile natif), local-first, résolution de conflits. |
| 10 | [`10-devops-observabilite.md`](./10-devops-observabilite.md) | Environnements, CI/CD, versionnage, tests, supervision, sauvegardes, PRA. |
| 11 | [`11-trajectoire-migration.md`](./11-trajectoire-migration.md) | Comment passer de la PWA actuelle à l'ERP, jalon par jalon, sans rupture. |
| 12 | [`12-gouvernance-et-roadmap.md`](./12-gouvernance-et-roadmap.md) | Feuille de route pluriannuelle, gouvernance de l'architecture, indicateurs. |
| — | [`adr/`](./adr/) | Registre des décisions d'architecture (Architecture Decision Records). |
| — | [`specs/`](./specs/) | Spécifications techniques implémentables : le *comment* dérivé des chapitres (schéma de données, contrats d'API, plan de la Vague 0). |
| — | [`glossaire.md`](./glossaire.md) | Langage ubiquitaire : le vocabulaire métier partagé. |

## 3. Les 5 invariants (à ne jamais violer)

Ces cinq règles priment sur toute considération de confort ou de délai. Elles
sont détaillées au chapitre 00 mais énoncées ici pour qu'aucun lecteur ne
puisse les manquer.

1. **On ne casse jamais l'existant.** Toute évolution est rétro-compatible ou
   accompagnée d'une migration explicite, réversible et testée. La donnée
   déjà saisie sur un chantier est sacrée.
2. **Chaque domaine est un contexte délimité.** Finance, Chantiers, RH… ne se
   parlent que par des **contrats** (API, événements), jamais en fouillant dans
   la base de l'autre.
3. **L'écrit fait foi, la donnée est tracée.** Tout fait métier significatif
   produit un événement horodaté, attribué et immuable (piste d'audit).
4. **Hors-ligne d'abord sur le terrain.** Un métreur, un chef de chantier, un
   technicien SAV doit pouvoir travailler sans réseau ; la synchronisation est
   un mécanisme, pas une condition d'usage.
5. **La sécurité et le RGPD sont dans l'architecture, pas en option.** Chaque
   donnée a un propriétaire, une base légale, une durée de conservation.

## 4. Comment faire évoluer ce document

- Ce dossier vit **dans le dépôt**, à côté du code : la doc et le code évoluent
  ensemble, dans la même *pull request*.
- Une décision structurante = **un ADR** ajouté dans `adr/`, numéroté, jamais
  supprimé (on le marque `Remplacé par ADR-XXXX`).
- Le numéro de version en tête de ce README suit le **versionnage sémantique**
  du document : `MAJEUR` (rupture de principe), `MINEUR` (ajout de chapitre ou
  de module), `CORRECTIF` (précision, coquille).
