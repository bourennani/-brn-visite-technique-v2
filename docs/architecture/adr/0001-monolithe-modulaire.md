# ADR-0001 — Monolithe modulaire d'abord, microservices seulement si justifié

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P11, P2, coût (chap. 00 §2)

## Contexte

BRN Group est une PME du bâtiment. L'ERP doit couvrir à terme une douzaine de
domaines, mais avec une petite équipe et un budget d'exploitation maîtrisé. Le
piège classique est de démarrer en microservices « pour faire scalable » et de
crouler sous la complexité distribuée avant d'avoir un seul utilisateur.

## Options envisagées

1. **Microservices dès le départ** — un service par domaine.
   - + Extensibilité affichée, équipes indépendantes.
   - − Coût d'infra et d'exploitation élevé, transactions distribuées, latence,
     observabilité distribuée, frontières figées trop tôt et souvent mal placées.
2. **Monolithe classique (non modulaire)** — tout couplé.
   - + Simple à démarrer.
   - − Devient un plat de spaghettis, viole P2, mène à la refonte (interdite).
3. **Monolithe modulaire** — un déployable, modules cloisonnés par contrat,
   prêts à l'extraction.
   - + Coût minimal, refactoring facile, frontières apprises par l'usage,
     extraction possible plus tard sans réécrire les autres.
   - − Discipline de cloisonnement à tenir (sinon dérive vers l'option 2).

## Décision

On adopte le **monolithe modulaire** (option 3). Chaque module est un contexte
délimité avec API publique + cœur pur + persistance privée. On n'extrait un
service que lorsqu'une contrainte réelle l'exige (charge isolée, équipe dédiée,
cycle de vie divergent), via un ADR dédié.

## Conséquences

- **Positives :** coût d'exploitation minimal adapté à une PME, évolutivité réelle
  par ajout de modules, extraction future sans dette payée d'avance.
- **Négatives / coûts :** exige une **discipline de cloisonnement** stricte
  (rôles de base par module, interdiction de `JOIN` transverse) vérifiée en revue
  et en CI, sinon on retombe dans le monolithe couplé.
- **Suivi :** mesurer qu'un nouveau module ne modifie aucun fichier d'un module
  existant (indicateur chap. 12 §4).
