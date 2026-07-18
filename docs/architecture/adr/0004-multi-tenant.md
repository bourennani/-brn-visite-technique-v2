# ADR-0004 — Multi-tenant (`org_id`) dès le premier jour

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P8, sécurité (chap. 05)

## Contexte

BRN Group est aujourd'hui seul utilisateur. Mais un ERP vit des années : filiales,
franchises, mode SaaS, cloisonnement d'un sous-traitant sont des évolutions
plausibles. Rétro-ajouter le multi-tenant à un système mono-tenant est une
refonte majeure (toutes les tables, toutes les requêtes, toute la sécurité).

## Options envisagées

1. **Mono-tenant maintenant, multi-tenant plus tard si besoin** — économise un
   champ aujourd'hui, coûte une refonte demain. Faux calcul.
2. **Une base par tenant** — isolation forte mais exploitation lourde et coûteuse,
   inadaptée à une PME et à l'agilité voulue.
3. **Multi-tenant partagé avec `org_id` + sécurité au niveau ligne (RLS)** — coût
   quasi nul aujourd'hui, isolation robuste, extensible.

## Décision

Chaque ligne de chaque table métier porte `org_id` non nul **dès le départ**
(option 3). L'isolation est appliquée au niveau de la couche d'accès **et** par
Row-Level Security PostgreSQL, de sorte qu'une requête fautive ne puisse pas
franchir la frontière d'organisation. Les référentiels ont deux niveaux : globaux
et propres à l'org.

## Conséquences

- **Positives :** aucune refonte pour ouvrir filiales/SaaS/cloisonnement plus
  tard ; défense en profondeur (couche d'accès + RLS) ; coût d'aujourd'hui
  négligeable.
- **Négatives / coûts :** toutes les requêtes et migrations doivent respecter
  `org_id` ; discipline à tenir et à vérifier (tests d'isolation).
- **Suivi :** tests automatisés d'étanchéité inter-organisations.
