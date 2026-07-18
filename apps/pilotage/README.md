# Tableau de bord Pilotage — application autonome

Application **indépendante** de l'application de visite technique. Elle
matérialise le module **« Chantiers / Pilotage »** de l'architecture ERP
(voir [`../../docs/architecture/`](../../docs/architecture/)) : la vision du
dirigeant en un seul écran.

## Ce qu'elle montre

- **Indicateurs clés** : CA signé, marge prévue vs réalisée (pondérée par le
  budget), trésorerie projetée, chantiers en cours et en retard.
- **Chantiers** : avancement, montant vendu, coût à date, marge prévue →
  réalisée projetée, pastille de santé (vert / orange / rouge), filtres.
- **Alertes & actions** dérivées par règles déterministes (dérive de marge,
  retard, impayé, réserves non levées, fin de garantie approchante) — l'esprit
  du chapitre 08 « Automatisations ».
- **CA facturé par mois** (graphe SVG, sans dépendance).

## Comment la lancer

C'est un **fichier autonome**, sans build ni serveur :

```
ouvrir apps/pilotage/index.html dans un navigateur
```

Tout (styles, logique, données) est en ligne dans `index.html`. L'application
fonctionne **hors-ligne**. Thème clair/sombre automatique.

## Indépendance vis-à-vis de l'app de visite

- **Aucun fichier de `src/` n'est utilisé ni modifié.**
- Aucune dépendance npm, aucun import du code de la visite.
- Les deux applications peuvent évoluer séparément — c'est exactement le
  principe de cloisonnement par module de l'architecture (ADR-0005).

## Données

Les chiffres de `DATA` (dans `index.html`) sont **fictifs**, pour une
démonstration autonome. Dans l'ERP réel, ils seront des **projections**
alimentées par les événements de domaine (Finance, RH, Stock, Chantiers) via
les contrats `/v1` (voir [`../../docs/architecture/specs/`](../../docs/architecture/specs/)).
La logique de calcul (marge projetée à l'avancement, alertes) est, elle,
représentative de la cible.
