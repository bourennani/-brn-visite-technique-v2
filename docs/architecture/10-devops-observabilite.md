# 10 — DevOps, qualité & observabilité

Une architecture prévue pour durer des années **doit** être exploitable,
observable et testable avec discipline. Ce chapitre fixe les règles de fabrication
et d'exploitation.

## 1. Environnements

| Environnement | Rôle | Données |
|---|---|---|
| **Développement** | Travail quotidien. | Jeux de données fictifs. |
| **Recette (staging)** | Validation avant production, tests de migration. | Copie anonymisée de production. |
| **Production** | Exploitation réelle. | Données réelles (RGPD). |

- **Isolation stricte** : secrets, bases et stockages **jamais** partagés entre
  environnements (chap. 05 §5).
- Toute migration de schéma est **jouée d'abord en recette** sur une copie de
  production (chap. 04 §7).

## 2. Intégration & déploiement continus (CI/CD)

Chaîne obligatoire à chaque *pull request* :

1. **Lint** (déjà présent v2 : `npm run lint`) + vérification de types.
2. **Tests** : unitaires (cœur métier pur), d'intégration (API + base),
   de contrat (le front et le back respectent l'OpenAPI), de migration
   (migration + rollback rejoués).
3. **Scan de sécurité** : secrets, dépendances vulnérables.
4. **Build** reproductible.
5. **Déploiement** : automatique en recette, **validé** en production.

Règles :

- **Déploiements petits et fréquents** > grosses livraisons rares. Moins de risque,
  retour arrière facile.
- **Migrations rétro-compatibles** (chap. 04 §7) → on peut déployer sans
  interruption et revenir en arrière.
- **Drapeaux de fonctionnalité** (*feature flags*) pour activer un module
  progressivement sans le livrer à tous d'un coup — sert la trajectoire par vagues
  (chap. 03, chap. 12).

## 3. Versionnage

- **Code** : versionnage sémantique, déjà en place (v2.4.1). `MAJEUR.MINEUR.CORRECTIF`.
- **API** : versionnée dans l'URL (`/v1`), jamais de rupture sur une version
  publiée (chap. 06 §1).
- **Événements** : champ `version` par type, évolutions additives (chap. 06 §3).
- **Document d'architecture** : versionné lui aussi (README, chap. 4).
- **Historique lisible** : la culture v2 (README détaillé, chaque version explique
  *symptôme → cause → correctif*) est **conservée** : chaque livraison documente ce
  qu'elle change et pourquoi.

## 4. Stratégie de test

La pyramide, adaptée à cette architecture :

| Niveau | Cible | Pourquoi c'est faisable ici |
|---|---|---|
| **Unitaire (majorité)** | Cœur métier **pur** (calc de métré, marges, chiffrage, paie). | Le domaine est sans I/O (P6) → testable en masse, vite. C'est le meilleur retour sur investissement. |
| **Intégration** | API de module + base + événements. | Vérifie les contrats et les transactions. |
| **Contrat** | Cohérence front ↔ back ↔ connecteurs vs OpenAPI. | Empêche les divergences silencieuses. |
| **Migration** | Chaque migration + son inverse, sur données de chaque version. | Garantit l'invariant P1 dans le temps. |
| **Bout-en-bout (minorité)** | Parcours critiques (« visite → devis → chantier »). | Coûteux : on en garde peu, mais on couvre le fil rouge (chap. 00 §5). |

> **Non-régression métier :** chaque bug corrigé arrive avec un test qui le
> reproduit. La v2 a vécu des régressions coûteuses (page blanche 2.0.1, rapport
> figé 2.2.1) : le test de non-régression est la parade structurelle.

## 5. Observabilité

On ne pilote bien que ce qu'on mesure. Trois piliers :

- **Journaux (logs)** structurés, corrélés par `correlationId` (chap. 06 §3) :
  suivre un parcours complet à travers les modules.
- **Métriques** : santé technique (latence, erreurs, files d'événements en retard,
  synchronisations terrain en échec) **et** métier (devis émis, marge moyenne,
  chantiers en retard) — utiles au dirigeant, pas qu'à la technique.
- **Traces** : suivre une requête/un événement de bout en bout pour diagnostiquer.

**Alertes** sur les signaux qui comptent : file d'événements bloquée, connecteur
externe en panne, échec de sauvegarde, taux d'erreur anormal, synchronisation
terrain durablement en échec.

## 6. Sauvegardes & reprise (PRA)

- **Sauvegardes** : base PostgreSQL + object storage (chap. 04 §1), **chiffrées**,
  automatiques, **testées par restauration réelle** (une sauvegarde jamais
  restaurée n'existe pas), rétention définie, copie **hors-site**.
- **Objectifs à fixer avec la direction** :
  - **RPO** (perte maximale acceptable) : ex. ≤ 15 min de données.
  - **RTO** (temps de remise en service) : ex. ≤ 4 h.
- **Plan de reprise documenté et répété** : la procédure de restauration est
  écrite, à jour, et exécutée en exercice au moins une fois par an.
- **Réversibilité fournisseur** (chap. 05 §8) : standards ouverts, export possible
  à tout moment. On n'est prisonnier de personne.

## 7. Dette technique & santé du code

- **Le graphe de dépendances reste acyclique** (culture v2). Un module ne crée
  jamais de cycle ; l'outillage le vérifie en CI.
- **Revue de code obligatoire** : au moins un pair, avec la grille des principes
  (chap. 00 §3) comme critère explicite.
- **Refactoring continu** : la dette se rembourse en continu, pas en « grande
  refonte » (interdite par les anti-objectifs, chap. 00 §4).
- **Budget de qualité** : une part de chaque cycle réservée à la robustesse
  (tests, migrations, observabilité), défendue face à la pression fonctionnelle.
