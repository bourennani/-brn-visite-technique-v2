# 08 — Automatisations

## 1. Rôle du moteur d'automatisation

Le moteur d'automatisation transforme l'ERP d'un outil **passif** (on saisit, on
consulte) en outil **actif** (il alerte, relance, prépare, déclenche). C'est un
service **transverse** (couche 4) branché sur le **bus d'événements** (chap. 06).

> Principe : **une automatisation observe des événements et déclenche des actions,
> selon des règles configurables — sans jamais coder en dur un processus métier
> dans un module.**

## 2. Le triptyque Déclencheur → Condition → Action

Chaque automatisation est une règle déclarative :

```
QUAND   un événement se produit            (déclencheur)
SI      certaines conditions sont vraies   (filtre)
ALORS   exécuter une ou plusieurs actions  (effet)
```

| Élément | Exemples |
|---|---|
| **Déclencheur** | Un événement de domaine (`Finance.DevisÉmis`), une échéance temporelle (chaque matin, J-30 avant fin de garantie), un seuil (`Stock.SeuilAtteint`). |
| **Condition** | Montant > X, chantier en retard > N jours, marge réalisée < marge prévue − Y %, devis sans réponse depuis Z jours. |
| **Action** | Notifier (e-mail/push/in-app), créer une tâche, générer un document, appeler un connecteur, émettre un événement, proposer (via l'IA) un brouillon. |

## 3. Automatisations de référence (par module)

| Automatisation | Déclencheur | Action |
|---|---|---|
| **Relance de devis** | `DevisÉmis` + délai sans réponse | Rappel commercial + e-mail client (brouillon IA possible). |
| **Alerte dépassement de marge** | `Chantier.AvancementMisÀJour` | Alerte dirigeant si marge réalisée < seuil. |
| **Situation de travaux due** | Avancement franchit un jalon | Préparer une situation à valider (Finance). |
| **Réappro automatique** | `Stock.SeuilAtteint` | Proposer un bon de commande fournisseur. |
| **Rappel de réserve non levée** | Réserve ouverte + délai | Notifier le conducteur de travaux. |
| **Fin de garantie** | J-30/J-60 avant échéance | Alerter SAV / proposer un contrat de maintenance. |
| **Relance impayé** | `FactureÉmise` + échéance dépassée | Relance graduée, escalade au dirigeant. |
| **Purge RGPD** | Échéance de conservation | Anonymiser/archiver la donnée (chap. 05 §3). |
| **Onboarding chantier** | `Chantier.Démarré` | Créer le dossier documentaire, checklist, affectations types. |

## 4. Gouvernance des automatisations

Une automatisation mal réglée peut **agir en masse** — c'est puissant et
dangereux. Garde-fous obligatoires :

- **Configurables, pas codées en dur** : une règle est de la **donnée** (P7),
  éditable par un administrateur métier, tracée à chaque modification.
- **Journalisées** : chaque déclenchement produit une trace (règle, événement
  source, actions, résultat). On sait **pourquoi** une action a eu lieu.
- **Idempotentes et anti-boucle** : une action qui émet un événement ne doit pas
  re-déclencher sa propre règle en boucle (détection de cycle via `causationId`).
- **Réversibles / à effet limité** : une action engageante (envoi client, commande
  fournisseur) passe par un **mode brouillon + validation humaine** par défaut ;
  l'exécution **entièrement automatique** est réservée aux actions sûres
  (notification interne, création de tâche) et **activée explicitement**.
- **Limitées en débit** : garde-fou contre l'emballement (ex. : pas plus de N
  e-mails/heure vers un même tiers).
- **Testables à blanc** (mode simulation) : voir ce qu'une règle **aurait** fait
  sans l'exécuter.

## 5. Articulation avec l'IA

L'IA (chap. 07) et les automatisations se complètent :

- **Automatisation = déterministe** : « SI marge < 5 % ALORS alerter ». Prévisible,
  auditable, sans surprise.
- **IA = probabiliste** : « ce devis a X % de chances d'être accepté », « voici un
  brouillon de relance ». Utile mais faillible.
- On combine : une **automatisation** déclenche, l'**IA** enrichit (rédige le
  brouillon), un **humain** valide l'acte engageant.

> On ne remplace jamais une règle métier claire par une inférence IA. La règle
> déterministe est le squelette ; l'IA est le muscle optionnel.
