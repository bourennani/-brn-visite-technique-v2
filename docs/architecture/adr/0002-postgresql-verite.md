# ADR-0002 — PostgreSQL comme système de vérité unique

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P1, P8, réversibilité (chap. 05 §8), intégrité (chap. 00 §2)

## Contexte

L'ERP manipule de l'argent, du stock, de la paie, des engagements juridiques.
L'intégrité est la qualité n°1. Il faut aussi de la souplesse (le bâtiment est un
domaine à structure variable, déjà géré par profils/JSONB en v2) et la
réversibilité (ne pas être prisonnier d'un fournisseur).

## Options envisagées

1. **Base documentaire (NoSQL)** — souple, mais transactions et intégrité
   référentielle faibles ; risqué pour l'argent et le stock.
2. **Base propriétaire d'un cloud** — pratique, mais verrouillage fournisseur,
   réversibilité compromise.
3. **PostgreSQL** — relationnel ACID + JSONB pour la souplesse, ouvert, standard,
   mûr, hébergeable partout (UE).

## Décision

**PostgreSQL** est le système de vérité unique pour les données structurées. On
combine colonnes relationnelles (stable, chiffré, contraint) et `JSONB` (détail
métier variable), avec `org_id` partout (multi-tenant) et sécurité au niveau
ligne. Les fichiers vont en object storage S3 ; le reste (cache, index, cache
local) est dérivé et reconstructible.

## Conséquences

- **Positives :** transactions ACID pour l'argent/stock/paie, souplesse JSONB
  sans fracturer prématurément le modèle v2, standard ouvert = réversibilité,
  RLS pour l'isolation multi-tenant.
- **Négatives / coûts :** discipline sur l'usage de JSONB (ce qui est requêté doit
  « remonter » en colonne relationnelle) ; PostgreSQL doit être exploité
  correctement (sauvegardes, migrations, supervision).
- **Suivi :** volume et performance des colonnes JSONB agrégées ; promotion en
  relationnel dès qu'un champ JSONB devient requêté/chiffré.
