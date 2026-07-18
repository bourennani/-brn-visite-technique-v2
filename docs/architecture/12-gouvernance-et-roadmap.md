# 12 — Gouvernance de l'architecture & feuille de route

## 1. Gouvernance : comment l'architecture reste vivante et respectée

Un document d'architecture qui n'est pas gouverné devient un document mort. Règles
de gouvernance :

- **Ce dossier fait autorité.** En cas de doute sur « comment faire », la réponse
  est ici. S'il n'y répond pas, on **ajoute** un ADR — on n'improvise pas dans le
  code.
- **La doc évolue avec le code**, dans la même *pull request*. Une fonctionnalité
  qui change une règle d'architecture met à jour le chapitre concerné **ou** crée
  un ADR. Une PR qui viole un principe sans ADR est refusée en revue.
- **Rôle de gardien de l'architecture** (le dirigeant peut le déléguer à un lead) :
  arbitre les ADR, veille aux invariants, tient la cohérence pluriannuelle.
- **Revue d'architecture périodique** (ex. trimestrielle) : on relit les
  principes, on mesure la dérive, on décide des extractions de services éventuelles
  (P11).

## 2. Le registre des décisions (ADR)

Chaque décision structurante = un fichier dans [`adr/`](./adr/), numéroté et
immuable (voir le modèle [`adr/0000-modele.md`](./adr/0000-modele.md)). Un ADR :

- expose le **contexte** (le problème réel),
- liste les **options** envisagées,
- énonce la **décision** et sa **justification**,
- assume ses **conséquences** (y compris négatives).

Un ADR ne se supprime pas : s'il est dépassé, un nouvel ADR le **remplace**, et
l'ancien est marqué `Remplacé par ADR-XXXX`. C'est la mémoire longue du projet.

ADR fondateurs déjà actés (voir `adr/`) :

| ADR | Décision |
|---|---|
| 0001 | Monolithe modulaire d'abord, microservices seulement si justifié. |
| 0002 | PostgreSQL comme système de vérité unique. |
| 0003 | Local-first sur le terrain, synchronisation bidirectionnelle. |
| 0004 | Multi-tenant (`org_id`) dès le premier jour. |
| 0005 | Couplage inter-modules par contrat et événements uniquement. |
| 0006 | TypeScript de bout en bout, cœur métier pur partagé client/serveur. |

## 3. Feuille de route pluriannuelle (indicative)

Les vagues (chap. 03) séquencées dans le temps. **Les durées sont indicatives** :
le principe « chaque vague est utile seule » prime sur le calendrier. On ne
démarre jamais une vague qui casserait la précédente.

```
─────────────────────────────────────────────────────────────────────────▶ temps

VAGUE 0  Socle + extraction Études & Métré (typage, tests, API, serveur, synchro)
         └─ Valeur : la v2 devient durable, sauvegardée, multi-appareils.

VAGUE 1  Finance (devis) + CRM léger + première automatisation (relance devis)
         └─ Valeur : de la visite au devis, sans ressaisie. Suivi commercial.

VAGUE 2  Chantiers (planning, avancement, tableau de bord dirigeant)
         └─ Valeur : LE pilotage. Marge prévue, retards, santé des chantiers.

VAGUE 3  RH (pointage terrain) + Stock
         └─ Valeur : le coût réel alimente la marge réalisée. Pilotage fiable.

VAGUE 4  Facturation / situations de travaux + Trésorerie + connecteur comptable
         └─ Valeur : encaisser, projeter la trésorerie, nourrir l'expert-comptable.

VAGUE 5  SAV + Maintenance + GED complète + connecteur banque
         └─ Valeur : le cycle complet « de la visite à la garantie ».

TRANSVERSES (en continu, dès qu'utiles, jamais bloquants) :
  IA (assistance métré → chiffrage → anomalies) · Mobile natif (si besoin matériel)
  · Automatisations avancées · Connecteurs (agenda, signature, fournisseurs, paie)
```

## 4. Indicateurs de réussite (pour la direction)

On mesure la réussite de l'architecture, pas seulement des fonctionnalités :

| Indicateur | Ce qu'il prouve | Cible |
|---|---|---|
| **Temps d'ajout d'un module** sans toucher l'existant | Le cloisonnement tient (P2). | Un nouveau module ne modifie **aucun** fichier d'un module existant. |
| **Nombre de régressions** sur l'existant par livraison | L'invariant P1 tient. | Zéro régression métier non couverte par un test. |
| **Ressaisies** dans le parcours « visite → garantie » | La vision est tenue (chap. 00 §5). | Zéro ressaisie d'une donnée déjà connue. |
| **Disponibilité terrain hors-ligne** | P4 tient. | 100 % des saisies terrain possibles sans réseau. |
| **Fraîcheur du pilotage** (délai fait métier → tableau de bord) | Les événements circulent. | Quasi temps réel (minutes). |
| **Couverture de tests du cœur métier** | Le domaine pur est protégé. | Élevée et maintenue. |
| **Réversibilité** (capacité d'export / de sortie fournisseur) | Pas de prisonnier (chap. 05 §8). | Export complet possible à tout moment. |

## 5. Les questions à se reposer à chaque décision

Avant tout choix structurant, on repasse ce filtre (issu des principes) :

1. Est-ce que ça **casse l'existant** ? (Si oui : migration explicite ou on ne le
   fait pas — P1.)
2. Est-ce que ça **couple deux contextes** autrement que par contrat/événement ?
   (Si oui : on refuse — P2, P5.)
3. Est-ce que ça **fonctionne hors-ligne** sur le terrain quand c'est du terrain ?
   (P4.)
4. Est-ce **tracé** (événement, audit) ? (P3, P9.)
5. Est-ce que ça **respecte le RGPD et la sécurité** par conception ? (P9.)
6. Est-ce **de la configuration** plutôt que du code figé quand c'est du métier
   variable ? (P7.)
7. Ajoute-t-on de la **complexité qui ne sert aucune qualité** visée ? (Si oui : on
   simplifie — chap. 00 §2, anti-objectifs §4.)
8. La décision est-elle **écrite** si elle est structurante ? (P12.)

> Si une décision passe ces huit questions, elle est conforme à l'architecture de
> référence. Sinon, elle réclame soit une correction, soit un ADR qui assume et
> justifie l'écart.

## 6. Mot de la fin

Cette architecture ne promet pas qu'on ne changera jamais rien. Elle promet que
**le changement sera toujours un ajout maîtrisé, jamais une démolition** — et
c'est exactement ce qui permet à un ERP de piloter une entreprise du bâtiment
**pendant des années, sans refonte majeure, sans casser l'existant.**
