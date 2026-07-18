# 05 — Sécurité & conformité

La sécurité et le RGPD sont **dans l'architecture** (principe P9), pas ajoutés
après coup. Ce chapitre est normatif : ses règles s'appliquent à **tout** module.

## 1. Authentification

- **Standard OIDC / OAuth 2.1.** L'ERP délègue l'authentification à un fournisseur
  d'identité (interne ou managé), jamais de mots de passe « maison ».
- **MFA obligatoire** pour les rôles à privilèges (direction, administration,
  finance, RH).
- **Sessions** à durée limitée, jetons courts + jeton de rafraîchissement, révocation
  possible à tout instant (perte d'un appareil terrain).
- **Appareils terrain** : le local-first (chap. 09) impose un **jeton de
  synchronisation** distinct, révocable par appareil ; la perte d'un iPhone de
  chantier n'expose pas tout l'ERP.

## 2. Autorisation : RBAC + ABAC

Deux couches complémentaires :

### RBAC — rôles (le « qui »)

Rôles de référence, cloisonnés par module :

| Rôle | Accès type |
|---|---|
| Direction | Tout, en lecture pilotage + validation des actes engageants. |
| Conducteur de travaux | Chantiers, RH (équipes de ses chantiers), Stock, Finance (situations). |
| Métreur / Chargé d'études | Études & Métré, lecture CRM et Chantiers liés. |
| Commercial | CRM, Devis (Finance en écriture limitée). |
| Comptable / ADV | Finance complète, lecture Chantiers. |
| RH | RH complet (cloisonné du reste). |
| Magasinier | Stock. |
| Technicien SAV | SAV, Maintenance, lecture Chantiers concernés. |
| Client (portail) | **Uniquement** ses propres chantiers/documents (aval). |
| Sous-traitant | Périmètre **restreint** à ses lots/chantiers. |

### ABAC — attributs (le « sur quoi »)

Le rôle ne suffit pas : on filtre aussi par **attributs** — l'organisation
(`org_id`), le **chantier d'affectation**, le **statut** de la donnée, la
**propriété**. Exemple : un conducteur de travaux voit RH **des salariés de ses
chantiers**, pas de toute l'entreprise.

> Règle : **l'autorisation est vérifiée au niveau du cas d'usage (serveur), jamais
> seulement dans l'interface.** Le front masque pour le confort ; le serveur
> interdit pour la sécurité. Renforcé par la sécurité au niveau ligne (RLS) en base
> (chap. 04 §2).

## 3. RGPD : les données personnelles par conception

BRN Group traite des données personnelles de **clients** et de **salariés** (RH).
Le RGPD est structurant, pas optionnel.

| Exigence RGPD | Mise en œuvre architecturale |
|---|---|
| **Minimisation** | Chaque module ne stocke que les données personnelles qu'il lui faut. Le Tiers centralise l'identité ; les modules attachent le strict nécessaire. |
| **Base légale & finalité** | Chaque catégorie de donnée porte sa base légale (contrat, obligation légale, intérêt légitime) et sa finalité, documentées dans le **registre des traitements**. |
| **Durée de conservation** | Chaque type de donnée a une durée (facture 10 ans, candidature X mois, prospect Y mois). Purge/anonymisation automatisée (module Automatisations). |
| **Droit d'accès & portabilité** | Export structuré des données d'une personne (via l'API, par `party_id`). |
| **Droit à l'effacement** | Processus **tracé** : anonymisation des données non soumises à obligation légale de conservation, conservation minimale du reste. Ce n'est pas un `DELETE` sauvage (chap. 04 §8). |
| **Cloisonnement** | Les données RH (salariés) sont dans un contexte séparé, RBAC renforcé, journalisation d'accès spécifique. |
| **Localisation** | Hébergement **UE** (chap. 01 §4). |
| **Sous-traitants** | Chaque connecteur externe (chap. 06) est un sous-traitant : contractualisé, listé, avec ses garanties. |

## 4. Chiffrement

- **En transit** : TLS partout, y compris entre services internes. Aucune donnée
  en clair sur le réseau. (La v2 impose déjà HTTPS — c'est un prérequis physique
  de l'app.)
- **Au repos** : base et object storage chiffrés. Les **secrets** particulièrement
  sensibles (jetons de connecteurs, clés) chiffrés au niveau applicatif en plus.
- **Cache local terrain** : les données sensibles dans IndexedDB sont protégées par
  l'authentification de l'appareil ; à la révocation ou déconnexion, purge du cache.

## 5. Gestion des secrets

- **Aucun secret dans le code ni dans le dépôt.** Jamais de clé d'API, de mot de
  passe, de jeton en dur (à vérifier en revue et en CI par un scan de secrets).
- Secrets injectés par l'environnement / un coffre (*secrets manager*), avec
  **rotation** régulière.
- Séparation stricte des secrets par **environnement** (dev/recette/prod).

## 6. Piste d'audit

La piste d'audit (`audit.*`) est **immuable et append-only**. Elle répond à tout
moment à : **qui a fait quoi, quand, depuis où, sur quelle donnée**.

- Chaque action engageante (émission de devis, validation de facture, modification
  de paie, suppression logique, export de données personnelles, changement de
  droit) produit une entrée d'audit.
- L'audit est **distinct** du journal d'événements métier (qui sert la logique) :
  l'audit sert la **conformité et la sécurité**, il est plus restrictif en accès.
- Conservation longue, non modifiable, exportable pour un contrôle.

## 7. Sécurité applicative (les fondamentaux non négociables)

- **Validation systématique des entrées** côté serveur (schéma partagé, chap. 01).
  Le serveur ne fait jamais confiance au client.
- **Requêtes paramétrées** uniquement (pas de concaténation SQL). Protection
  injection.
- **Principe du moindre privilège** partout : rôles applicatifs, rôles de base de
  données par module, jetons de connecteurs limités au strict besoin.
- **Limitation de débit** et protection anti-abus à la passerelle.
- **Dépendances** : suivi des vulnérabilités, mises à jour régulières, revue des
  nouvelles dépendances (chaîne d'approvisionnement logicielle).
- **Journalisation de sécurité** : tentatives d'authentification, élévations de
  droit, accès aux données RH/clients.

## 8. Continuité (résumé — détail chap. 10)

- **Sauvegardes** chiffrées, régulières, testées (une sauvegarde non restaurée
  n'existe pas), avec rétention et copie hors-site.
- **Plan de reprise (PRA)** documenté : objectifs de temps (RTO) et de perte
  maximale (RPO) définis avec la direction.
- **Réversibilité** : standards ouverts (PostgreSQL, S3, OIDC) pour ne jamais être
  prisonnier d'un fournisseur (anti-objectif chap. 00 §4).
