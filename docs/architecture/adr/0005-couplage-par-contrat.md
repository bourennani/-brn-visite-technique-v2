# ADR-0005 — Couplage inter-modules par contrat et événements uniquement

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P2, P3, P5

## Contexte

L'exigence centrale du projet est d'ajouter des modules pendant des années sans
casser l'existant. Le premier tueur d'évolutivité d'un ERP est le **couplage par
base de données partagée** : un module qui fait un `JOIN` dans les tables d'un
autre gèle les deux pour toujours.

## Options envisagées

1. **Accès direct aux tables d'autrui** (base partagée) — pratique à court terme,
   mortel à long terme : impossible de changer un module sans casser les autres.
2. **Bibliothèque partagée de modèles** — couple les modules par le code, moins
   visible mais tout aussi bloquant.
3. **Couplage par contrat (API interne) + événements de domaine** — chaque module
   n'expose qu'une surface publique ; les autres n'en connaissent que ça.

## Décision

Les modules communiquent **exclusivement** par (a) appel de **contrat** (API
interne typée) quand une réponse immédiate est nécessaire, ou (b) **événement de
domaine** asynchrone quand on réagit à un fait accompli. Défaut : l'événement.
Aucun accès direct aux tables d'un autre module (renforcé par des rôles de base
distincts par module). Les seules données lues directement en transverse sont les
référentiels et l'annuaire des Tiers, en lecture seule.

## Conséquences

- **Positives :** un module se réécrit entièrement sans prévenir les autres tant
  que son contrat tient ; ajout de module = zéro modification de l'existant ;
  découplage de disponibilité (une panne locale se rattrape par rejeu).
- **Négatives / coûts :** cohérence **éventuelle** entre modules (pas immédiate) à
  assumer dans l'UX ; nécessite un bus d'événements fiable (Outbox) et des
  consommateurs idempotents.
- **Suivi :** aucune dépendance directe de base entre schémas de modules (vérifié
  par les permissions et en revue) ; latence de propagation des événements.
