# 02 — Modèle de domaine

Ce chapitre définit le **langage ubiquitaire** (le vocabulaire métier partagé) et
la **carte des contextes délimités**. C'est la carte de référence : chaque module
du chapitre 03 est l'un de ces contextes.

## 1. Carte des contextes délimités

Un **contexte délimité** est une zone où un mot a **un seul sens**. « Client »,
« Chantier », « Ouvrage » ne veulent pas dire exactement la même chose partout :
chaque contexte les définit pour lui-même, et les relie aux autres par
**identifiant**, jamais par fusion de modèle (principe P2).

```
                         ┌──────────────────────┐
                         │      RÉFÉRENTIELS      │  (partagé, amont)
                         │ Corps d'état, unités,  │
                         │ TVA, articles, taux    │
                         └──────────┬───────────┘
                                    │ conforme à
        ┌───────────┐        ┌──────┴───────┐        ┌────────────┐
        │    CRM     │───────▶│   ÉTUDES &    │───────▶│  FINANCE   │
        │ Prospects, │ compte │    MÉTRÉ      │ métré  │ Devis,     │
        │ comptes,   │        │ Visite,pièce, │ chiffré│ factures,  │
        │ opportunités│       │ ouvrage       │        │ trésorerie │
        └─────┬──────┘        └──────┬───────┘        └─────┬──────┘
              │                      │ devis signé          │
              │                      ▼                      │
              │               ┌─────────────┐               │
              └──────────────▶│  CHANTIERS   │◀──────────────┘
                              │ Planning,    │ situations, coûts
                    ┌────────▶│ avancement,  │◀────────┐
                    │         │ réception    │         │
              ┌─────┴────┐    └──────┬───────┘   ┌─────┴─────┐
              │    RH     │          │           │   STOCK    │
              │ Salariés, │  heures  │  sorties  │ Articles,  │
              │ pointage, │◀─────────┼──────────▶│ mouvements,│
              │ paie      │          │           │ appro      │
              └──────────┘           ▼           └───────────┘
                              ┌─────────────┐
                              │ SAV & MAINT. │  (aval, après réception)
                              │ Tickets,     │
                              │ garanties,   │
                              │ interventions│
                              └─────────────┘

  Transverses (au service de tous) : DOCUMENTS · IA · AUTOMATISATIONS ·
  IDENTITÉ · NOTIFICATIONS · AUDIT
```

Les relations sont typées (patterns DDD de cartographie de contextes) :

| Relation | Type | Sens |
|---|---|---|
| Référentiels → tous | *Conformist* (référence partagée) | Tous se conforment aux unités, corps d'état, TVA. |
| CRM → Études | *Customer/Supplier* | Le CRM fournit le compte/contact ; l'étude s'y rattache. |
| Études → Finance | *Customer/Supplier* | Le métré chiffré alimente le devis ; le devis ne réécrit pas le métré. |
| Finance ↔ Chantiers | *Partnership* | Situations de travaux, coûts réels : échange bidirectionnel par événements. |
| Chantiers ↔ RH / Stock | *Partnership* | Heures pointées, sorties de stock rattachées au chantier. |
| Chantiers → SAV | *Customer/Supplier* | La réception ouvre la période de garantie ; le SAV s'y rattache. |

## 2. Les entités pivots (agrégats racines)

Un **agrégat** est un groupe d'objets qu'on modifie ensemble, gardé cohérent par
une **racine** (l'objet par lequel on entre). On ne modifie jamais l'intérieur
d'un agrégat sans passer par sa racine. Voici les racines structurantes de l'ERP.

### Tiers (Party) — la personne ou l'entreprise

Concept **transverse et neutre** : un tiers est une personne physique ou morale.
Il peut jouer plusieurs **rôles** : prospect, client, fournisseur, sous-traitant,
salarié. On ne duplique pas l'identité d'un tiers dans chaque module : chaque
module référence le `party_id` et lui attache **ce qui le concerne**.

> C'est la réponse au piège classique de l'ERP : « le client existe en 4
> exemplaires ». Ici, **un tiers, plusieurs rôles, un seul identifiant**.

### Compte & Opportunité (CRM)

- **Compte** : le tiers vu comme relation commerciale (historique, contacts,
  interactions).
- **Opportunité** : une affaire potentielle (une demande de travaux), avec un
  cycle (prospect → qualifié → visité → devisé → gagné/perdu).

### Visite / Étude (Études & Métré) — *l'existant*

La racine **Visite** existe déjà (`newVisite` dans `src/lib/store.js`). Elle
contient :

- `client`, `chantier` (informations générales)
- `rooms[]` : les **pièces / zones** (racines secondaires de l'agrégat étude)
  - chaque pièce : `zones[]`, `ouvertures[]`, `murs`, `sol`, `plafond`,
    `plinthes`, `faience`, `doublages`, `peinture`, `elec[]`, modules métier
    (`facade`, `cuisine`), `travaux{}`, `prestations[]`, `photos[]`, `sketches[]`.
- Le **profil métier** est *dérivé* du `typeId` (jamais stocké) — `profils.js`.

Dans l'ERP, la Visite devient une **Étude** rattachée à une **Opportunité** (CRM)
et produisant un **Métré chiffré** consommé par la **Finance**. Son modèle interne
ne change pas : il gagne seulement des **liens** (`opportunite_id`, `chantier_id`).

### Ouvrage & Devis (Finance)

- **Ouvrage** (ligne de travaux) : issu du métré (`ouvragesDeVisite()` en v2), il
  porte un lot/corps d'état, une quantité, une unité, une marge. C'est le pont
  entre l'étude (quantités) et le chiffrage (prix).
- **Devis** : un ensemble d'ouvrages chiffrés, versionné, avec un cycle
  (brouillon → envoyé → accepté/refusé). L'acceptation émet `DevisAccepté` qui
  **déclenche** la création d'un chantier.

### Chantier (Chantiers) — la racine de la réalisation

L'entité centrale du pilotage. Un **chantier** agrège :

- son origine (devis accepté), son client, son adresse ;
- un **planning** (phases, tâches, jalons) ;
- l'**avancement** (par lot, par ouvrage) ;
- les **coûts réels** (heures RH + achats + sorties de stock + sous-traitance)
  confrontés au **budget** (métré chiffré) → **marge prévue vs réalisée** ;
- les **situations de travaux** (facturation à l'avancement) ;
- la **réception** et la **levée des réserves**, qui ouvre les **garanties**.

### Salarié & Pointage (RH), Article & Mouvement (Stock), Ticket (SAV)

Racines de leurs contextes respectifs, détaillées au chapitre 03. Toutes portent
un lien vers le **chantier** quand elles s'y rattachent — c'est ce lien qui
alimente le coût réel et donc le pilotage.

## 3. Le langage ubiquitaire (extrait)

Le glossaire complet est dans [`glossaire.md`](./glossaire.md). Quelques termes
structurants, tirés du métier réel de BRN Group (et déjà présents dans le code) :

| Terme | Sens précis | Contexte |
|---|---|---|
| **Lot / Corps d'état** | Famille de travaux (maçonnerie, plâtrerie, électricité…). En v2 : `maçon, platre, menint, elec…` dans `profils.js`. | Études, Finance, Chantiers |
| **Métré** | Mesure des quantités (surfaces, longueurs, unités) à partir du relevé. | Études |
| **Métré net** | Quantité après déduction des ouvertures et zones non traitées. | Études |
| **Marge (métré vs poste)** | Deux marges distinctes : appro matière (métré) et quantité retenue (poste). **Ne se cumulent jamais** (règle 2.2.0). | Études, Finance |
| **Ouvrage / Poste** | Une ligne de travail chiffrable rattachée à un lot. | Études → Finance |
| **Profil métier** | Configuration dérivée du type de pièce qui pilote l'UI et les règles. | Études |
| **Situation de travaux** | Facturation intermédiaire d'un chantier à l'avancement. | Finance, Chantiers |
| **Réserve** | Défaut constaté à la réception, à lever avant clôture. | Chantiers → SAV |
| **Garantie (parfait achèvement, biennale, décennale)** | Périodes de responsabilité post-réception qui pilotent le SAV. | SAV |

> **Règle de langage :** on n'invente pas de synonyme. « Ouvrage » et « poste »
> désignent la même chose selon l'angle (chiffrage vs travaux) : le glossaire
> tranche. Un nouveau terme métier s'ajoute au glossaire **avant** d'entrer dans
> le code.

## 4. Événements de domaine de référence

Les événements sont le **contrat temporel** entre modules (chap. 06). Nommage :
`Contexte.FaitAuPassé`. Liste de référence (extensible, jamais réduite) :

| Événement | Émis par | Écouté par (exemples) |
|---|---|---|
| `Crm.OpportuniteCréée` | CRM | Études (planifier une visite) |
| `Etude.VisiteClôturée` | Études | Finance (préparer un devis), IA (contrôle qualité métré) |
| `Etude.MétréChiffréPrêt` | Études | Finance |
| `Finance.DevisÉmis` | Finance | CRM (suivi), Documents (archivage) |
| `Finance.DevisAccepté` | Finance | Chantiers (créer le chantier), RH, Stock |
| `Chantier.Démarré` | Chantiers | RH (affecter), Stock (réserver), Notifications |
| `Chantier.AvancementMisÀJour` | Chantiers | Finance (situation), Pilotage |
| `Rh.HeuresPointées` | RH | Chantiers (coût réel), Finance (paie) |
| `Stock.MouvementEnregistré` | Stock | Chantiers (coût réel), Finance |
| `Finance.FactureÉmise` | Finance | Trésorerie, Documents, Notifications |
| `Finance.PaiementReçu` | Finance | Trésorerie, CRM |
| `Chantier.Réceptionné` | Chantiers | SAV (ouvrir garanties), Finance (retenue de garantie) |
| `Sav.TicketOuvert` | SAV | Maintenance, RH (planifier), Notifications |
| `Sav.InterventionClôturée` | SAV/Maintenance | Chantiers (historique), Finance (si facturable) |

Chaque événement porte un **enveloppe standard** : `id`, `type`, `version`,
`org_id`, `occurredAt`, `actor` (qui), `aggregateId`, `payload`, `correlationId`
(pour relier une chaîne d'événements d'un même parcours). Détails en chap. 06 §3.

## 5. Règles d'or du modèle

1. **Un agrégat, une transaction.** On ne modifie qu'un agrégat par transaction ;
   la cohérence entre agrégats est **éventuelle**, portée par les événements.
2. **Références par identifiant.** Un chantier référence `devis_id`, `client_id`
   (party) — il ne **copie** pas le devis ni le client.
3. **Les copies figées sont interdites** sauf raison métier explicite. La v2 l'a
   appris à ses dépens (bug 2.2.1 : le rapport lisait un agrégat figé → il
   affichait des quantités périmées). On relit la source vivante et on recalcule.
   Exception légitime : un **document émis** (devis PDF signé, facture) est figé
   **par nature juridique** — c'est une photographie datée, versionnée, immuable.
4. **Le dérivé ne se stocke pas** (sauf performance justifiée). Le profil métier
   se **dérive** du type ; la marge réalisée se **calcule** des coûts. On stocke
   les faits, on calcule les vues.
5. **Le temps est une donnée.** Toute entité porte `createdAt`, `updatedAt`, et
   les entités engageantes portent leur **historique d'événements**. On peut
   toujours répondre à « qui a changé quoi, quand ».
