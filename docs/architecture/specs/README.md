# Spécifications techniques

Ce dossier **décline** l'architecture de référence (chapitres `../00`..`../12` et
ADR) en **spécifications implémentables**. La référence dit *quoi* et *pourquoi* ;
ces specs disent *comment*, au niveau où un développeur peut construire.

> **Statut : normatif, mais vivant.** Une spec évolue plus souvent que la
> référence. Toute spec reste **subordonnée** aux principes (chap. 00) et aux ADR :
> en cas de conflit, la référence gagne, ou l'on ouvre un ADR.

## Portée actuelle : Vague 0

Les specs présentes couvrent la **Vague 0** de la trajectoire (chap. 11 §3,
chap. 12 §3) : poser le socle serveur et extraire le module **Études & Métré** de
la PWA v2, **sans changer le comportement métier**.

| # | Spec | Contenu |
|---|---|---|
| 01 | [`01-schema-core-et-etudes.md`](./01-schema-core-et-etudes.md) | Schéma PostgreSQL concret : `core`, `events`, `audit`, `etudes`. Multi-tenant, RLS, JSONB, verrou optimiste, soft delete, Outbox. |
| 02 | [`02-contrats-api-v1.md`](./02-contrats-api-v1.md) | Contrats REST `/v1` (Tiers, Études, Ouvrages, Documents), enveloppe d'événement, endpoint de synchronisation local-first. |
| 03 | [`03-plan-vague-0.md`](./03-plan-vague-0.md) | Plan de construction : lots de travail, critères d'acceptation, ordre, définition de « terminé ». |

## Conventions communes à toutes les specs

Ces conventions matérialisent les principes. Elles sont **obligatoires** partout.

- **`org_id` partout** (ADR-0004). Toute table métier porte `org_id uuid not null`.
  Toute requête est filtrée par `org_id`, renforcé par RLS.
- **Identifiants** : `uuid` (v7 recommandé, ordonnable dans le temps). Les
  identifiants exposés en API sont préfixés par type (`party_`, `study_`,
  `evt_`…) pour la lisibilité et le débogage.
- **Horodatage** : `timestamptz` en UTC. Deux colonnes systématiques
  `created_at`, `updated_at`. L'affichage localise (fr-FR), le stockage non.
- **Verrou optimiste** (chap. 04 §8) : colonne `rev integer not null default 1`
  sur tout agrégat modifiable. Une écriture fournit la `rev` lue ; si elle ne
  correspond plus, le serveur répond `409 Conflict`.
- **Soft delete** (chap. 04 §8) : colonne `deleted_at timestamptz null`. On
  n'efface jamais physiquement une donnée engageante ; on marque et on émet un
  événement. Les lectures excluent `deleted_at is not null` par défaut.
- **Attribution** : colonnes `created_by`, `updated_by` (référence utilisateur).
  Qui a fait quoi est **toujours** répondable (P3, chap. 05 §6).
- **Nommage** : tables et colonnes en `snake_case`, singulier pour une entité
  (`study`), pluriel jamais. Schémas = noms de contextes (`core`, `etudes`…).
- **Détail métier variable en `JSONB`** (chap. 04 §4) : le relevé fin d'une pièce
  reste imbriqué, fidèle à la v2, non fracturé prématurément.

## Ce que ces specs ne figent pas

Elles fixent les **contrats et invariants** (schéma, API, événements), pas les
choix internes remplaçables (framework précis, bibliothèque d'accès aux données,
outil de migration). Ceux-ci relèvent de l'implémentation et peuvent changer tant
que les contrats tiennent (P2, P5).
