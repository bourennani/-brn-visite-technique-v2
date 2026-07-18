# BRN PILOT — PRODUCT BIBLE — VERSION 1.0

> **Nature du document.** Référence **officielle** de l'**identité** de *BRN Pilot* :
> sa raison d'être, sa mission, sa vision, ses valeurs, ses principes, et les
> **règles d'arbitrage** de toute décision produit.
>
> **Rôle unique.** Là où le Master Blueprint dit *comment c'est construit*, la
> Business Rules Bible *comment ça se comporte*, la Data Bible *quelles données*, et
> la Security Bible *comment c'est protégé* — la **Product Bible dit *pourquoi*, pour
> *qui*, et *jusqu'où*.** C'est la boussole. En cas de doute sur « faut-il faire
> ceci ? », la réponse commence ici.
>
> **Ce document ne contient aucun code.** Nous restons en phase de conception.
>
> **Statut :** v1.0 — référence en cours de constitution.
> **Ambition :** garder *BRN Pilot* **cohérent pendant plusieurs années**, quelles
> que soient les personnes et les modes.

---

## Table des matières

**Partie A — Identité**
- A1. Pourquoi BRN Pilot existe
- A2. Le problème résolu
- A3. Mission
- A4. Vision à 5 ans
- A5. Vision à 10 ans
- A6. Positionnement (ce que le produit est / n'est pas)

**Partie B — Valeurs du produit**

**Partie C — Principes produit (guident toutes les décisions)**

**Partie D — Profils d'utilisateurs**

**Partie E — Expérience utilisateur voulue**

**Partie F — Politique de fonctionnalités**
- F1. Critères d'acceptation
- F2. Critères de refus
- F3. Grille de décision (filtre de fonctionnalité)
- F4. Arbitrage de la complexité

**Partie G — Mesure du succès (indicateurs)**

**Partie H — Gouvernance produit**

**Partie I — Traçabilité vers les autres documents fondateurs**

> **Convention.** Les principes portent un identifiant `PROD-Pxx`, stable et
> jamais recyclé, pour être cités dans les décisions produit.

---

# Partie A — Identité

## A1. Pourquoi BRN Pilot existe

Un dirigeant d'entreprise générale du bâtiment porte, seul, une charge mentale
immense : chantiers, marges, trésorerie, équipes, matériaux, véhicules, clients,
échéances administratives, décisions. L'information est **éparpillée** — tableurs,
messagerie, logiciel comptable, papiers, mémoire — et le dirigeant passe son temps
à **la rassembler** au lieu de **décider**.

*BRN Pilot* existe pour renverser cela :

> **Rassembler l'information une fois pour toutes, et rendre au dirigeant le temps
> et la clarté de décider.**

Ce n'est pas « un logiciel de plus ». C'est le **poste de commandement** unique du
dirigeant : le lieu où tout converge, se calcule, s'ordonne, et se présente prêt à
la décision.

## A2. Le problème résolu

| Douleur actuelle | Réponse de BRN Pilot |
|---|---|
| L'information est fragmentée et redondante. | Une **source de vérité unique**, sans ressaisie. |
| On ne sait pas, en temps réel, si un chantier gagne ou perd de l'argent. | **Marge prévue vs réalisée** en continu, alertée dès qu'elle dérive. |
| La trésorerie est un angle mort. | **Trésorerie projetée** et alertes de risque. |
| Les échéances se ratent (contrôle technique, assurance, contravention, obligation fiscale). | **Échéancier unifié** et alertes proactives. |
| Le dirigeant réagit au lieu d'anticiper. | **Priorisation intelligente** : chaque matin, l'essentiel d'abord. |
| Trop d'outils, trop de saisie, trop de bruit. | **Un seul outil**, **une saisie**, **des priorités**, pas du bruit. |

En une phrase : *BRN Pilot* transforme un dirigeant **submergé et réactif** en un
dirigeant **informé et proactif**.

## A3. Mission

> **Donner au dirigeant, chaque jour, une vision fiable et priorisée de son
> entreprise et de sa journée — pour qu'il sache immédiatement ce qui est
> important, ce qui est urgent, ce qui peut attendre, et où sont les risques — et
> qu'il agisse au bon moment, avec l'aide d'une IA de confiance.**

La mission est le juge de paix : **une fonctionnalité qui ne sert pas cette mission
n'a pas sa place** (Partie F).

## A4. Vision à 5 ans

Dans 5 ans, *BRN Pilot* est le **système d'exploitation du dirigeant** de BRN
Group :

- Le dirigeant ouvre *BRN Pilot* **chaque matin** et sait, en une minute, ce qui
  compte.
- **Aucune** donnée n'est saisie deux fois ; le parcours « de la visite à la
  garantie » est continu.
- La **marge**, la **trésorerie** et les **échéances** sont pilotées en temps réel ;
  plus de mauvaise surprise en fin de chantier.
- Le **parc automobile** et les **contraventions** sont maîtrisés et anticipés.
- Une **IA copilote** explique, résume, propose — et le dirigeant décide.
- Le produit est **stable, sûr, rapide**, et a évolué **sans refonte ni régression**.

## A5. Vision à 10 ans

Dans 10 ans, *BRN Pilot* peut équiper **plusieurs entreprises** du bâtiment, chacune
cloisonnée et sécurisée :

- Un **standard de pilotage** pour dirigeants du bâtiment, réputé pour sa
  **fiabilité** et sa **clarté**.
- Une IA copilote **mûre, explicable et souveraine**, **multi-fournisseur**, jamais
  une boîte noire.
- Des intégrations riches (comptabilité, banque, agenda, signature) sans jamais
  perdre la maîtrise ni la réversibilité.
- Une architecture **toujours la même** qu'au départ : chaque module ajouté n'a rien
  cassé. La **cohérence de 10 ans** est la preuve que cette Bible a tenu.

> **Le succès de la vision se mesure à une chose : après 10 ans, l'architecture et
> les principes fondateurs sont toujours valables. Pas de « grand rewrite ».**

## A6. Positionnement (ce que le produit est / n'est pas)

| BRN Pilot **est** | BRN Pilot **n'est pas** |
|---|---|
| Un système de pilotage et de décision. | Un simple outil de saisie. |
| Le poste de commandement du dirigeant. | Un tableur amélioré. |
| Un produit unique et cohérent. | Une collection d'écrans indépendants. |
| Assisté par une IA de confiance. | Piloté par une IA qui décide seule. |
| Sécurisé et souverain par conception. | Un produit où la sécurité s'ajoute après. |
| Sobre, rapide, lisible. | Une usine à gaz pleine d'options inutiles. |
| Le complément de *BRN Visite Technique* (métré). | Un remplaçant du métré (qui reste là-bas). |

---

# Partie B — Valeurs du produit

Les valeurs sont ce qui ne se négocie pas. Elles inspirent les principes (Partie C).

| Valeur | Ce qu'elle signifie au quotidien |
|---|---|
| **Clarté** | Toujours privilégier la lisibilité et la compréhension immédiate. Un écran qui embrouille est un échec. |
| **Confiance** | Des chiffres justes, tracés, explicables. On ne trompe jamais l'utilisateur, on n'invente jamais. |
| **Fiabilité** | Ça marche, ça ne casse pas, ça ne perd pas de données. La stabilité prime sur la nouveauté. |
| **Sobriété** | Faire moins mais mieux. Refuser la complexité inutile. Chaque ajout se mérite. |
| **Proactivité** | Le logiciel vient au-devant du dirigeant (alertes, priorités, brief) au lieu d'attendre qu'on le cherche. |
| **Respect** | Respect du temps du dirigeant, respect des données (des clients, des salariés), respect de la vie privée. |
| **Souveraineté** | Maîtrise des données et des dépendances ; réversibilité ; pas de boîte noire. |
| **Honnêteté** | Distinguer fait, calcul, estimation, recommandation. Assumer l'incertitude. |

---

# Partie C — Principes produit (guident toutes les décisions)

> Ces principes sont **opposables** : toute décision de développement peut être
> mise à l'épreuve d'un principe. Ils incluent les principes forts demandés par la
> direction et les prolongent.

### Principes d'usage et de valeur

- **PROD-P01 — Une donnée n'est saisie qu'une seule fois.** Toute ressaisie est un
  défaut de conception. La donnée circule, elle ne se recopie pas.
- **PROD-P02 — Chaque fonctionnalité doit faire gagner du temps au dirigeant.** Si
  elle ne fait pas gagner de temps (ou d'argent, ou ne réduit pas un risque), elle
  ne se justifie pas.
- **PROD-P03 — Toute nouvelle fonctionnalité doit avoir une valeur métier
  démontrable.** On sait dire *pour qui*, *quel gain*, *comment on le mesure*. Sinon,
  on ne la fait pas.
- **PROD-P04 — Le dirigeant d'abord.** En cas d'arbitrage, on tranche en faveur de
  ce qui sert la décision du dirigeant (sans nuire aux autres rôles).
- **PROD-P05 — Proactivité.** Le bon réflexe est « le logiciel me prévient », pas
  « je dois aller vérifier ».

### Principes d'automatisation et d'IA

- **PROD-P06 — L'automatisation est privilégiée lorsqu'elle est fiable.** On
  automatise ce qui est sûr et répétitif ; on ne force jamais une automatisation
  hasardeuse.
- **PROD-P07 — L'IA conseille, elle ne décide jamais seule.** L'IA explique,
  résume, propose ; l'humain valide tout acte engageant. Jamais de chiffre officiel
  produit par l'IA.
- **PROD-P08 — Transparence et explicabilité.** Toute priorité, alerte, anomalie ou
  suggestion s'accompagne d'une **raison** lisible. Rien d'opaque.

### Principes de qualité et de sobriété

- **PROD-P09 — Éviter la complexité inutile.** La simplicité est un objectif, pas
  un défaut. « Non » est la réponse par défaut à une complexité non justifiée.
- **PROD-P10 — Privilégier la lisibilité, la rapidité et la stabilité.** Ces trois
  qualités priment sur la richesse fonctionnelle et sur l'esthétique gratuite.
- **PROD-P11 — On ne casse jamais l'existant.** Aucune évolution ne dégrade une
  fonction qui marche ni ne perd une donnée. La confiance se gagne lentement et se
  perd d'un coup.
- **PROD-P12 — Cohérence avant tout.** Un comportement uniforme partout vaut mieux
  qu'une exception ingénieuse. La cohérence est ce qui permet de tenir 10 ans.

### Principes de sécurité et de confiance

- **PROD-P13 — La sécurité prévaut toujours sur le confort.** Si un choix oppose
  sécurité et facilité, la sécurité gagne. Toujours.
- **PROD-P14 — Une source de vérité unique.** Les chiffres officiels sortent du
  moteur métier, jamais de l'interface ni de l'IA. Un seul endroit fait foi.
- **PROD-P15 — Réversibilité et souveraineté.** On préserve la capacité d'exporter,
  de migrer, de changer de fournisseur. Pas d'enfermement.

### Principes de méthode

- **PROD-P16 — Configuration plutôt que code.** Ce qui varie (seuils, taux,
  pondérations, catalogues) est une **donnée administrable**, pas du code figé.
- **PROD-P17 — Définir avant de coder.** Aucune règle métier ou donnée importante
  n'entre dans le code sans être définie dans la bible concernée (Business Rules,
  Data). Le comportement se décide, il ne s'improvise pas.
- **PROD-P18 — Livrer par vagues utiles.** Chaque livraison apporte une valeur seule
  et ne dépend pas de la suivante. Pas de « grand soir ».

> **Utilisation.** Face à un choix, on cite les principes en jeu. Deux principes
> peuvent sembler s'opposer (ex. richesse vs sobriété) : l'**ordre de préséance**
> est : sécurité (P13) > intégrité/vérité (P11, P14) > mission/valeur (P02, P03) >
> simplicité/qualité (P09, P10). En dernier recours, la direction tranche et **écrit
> la décision**.

---

# Partie D — Profils d'utilisateurs

## D1. Le dirigeant (utilisateur central)

- **Qui.** Le chef d'entreprise. Porte tout : stratégie, finances, chantiers,
  équipes, décisions. Temps rare, charge mentale élevée, souvent en déplacement.
- **Ce qu'il attend.** Savoir en un coup d'œil ce qui compte ; anticiper les
  risques ; décider vite et bien ; ne pas ressaisir ; être prévenu, pas surpris.
- **Ce que BRN Pilot lui apporte.** Le **cockpit** et le **tableau de bord** : brief
  quotidien priorisé, marge/trésorerie/échéances, décisions et signatures en
  attente, parc et contraventions maîtrisés, IA copilote.
- **Ce qu'il ne veut pas.** Du bruit, des écrans complexes, des chiffres douteux,
  de la saisie inutile, des surprises financières.

## D2. Le conducteur de travaux

- **Qui.** Pilote l'exécution de ses chantiers, sur le terrain.
- **Attentes.** Suivre l'avancement et le coût réel de **ses** chantiers, saisir vite
  (pointage, dépenses), lever les réserves.
- **Apport.** Vue chantier claire, saisie mobile simple, alertes de retard.
- **Refuse.** Une interface lourde, des fonctions hors de son périmètre.

## D3. Le commercial

- **Qui.** Développe les affaires, établit les devis.
- **Attentes.** Suivre le pipeline, transformer une visite en devis sans ressaisie,
  relancer au bon moment.
- **Apport.** CRM léger, devis pré-remplis depuis le métré, relances proposées.

## D4. Le comptable / ADV

- **Qui.** Gère la facturation, les encaissements, la relation à l'expert-comptable.
- **Attentes.** Factures justes et numérotées, échéances suivies, export propre,
  trésorerie fiable.
- **Apport.** Moteur financier centralisé, numérotation légale, exports, connecteur
  comptable (futur).

## D5. Le RH

- **Qui.** Gère salariés, pointages, absences, préparation de paie.
- **Attentes.** Données RH fiables et **cloisonnées**, préparation de paie sans
  ressaisie.
- **Apport.** Module RH cloisonné, variables de paie agrégées.

## D6. Le magasinier

- **Qui.** Gère le stock et l'approvisionnement.
- **Attentes.** Mouvements simples, alertes de seuil, valorisation.
- **Apport.** Stock clair, réappro proposé.

## D7. Le gestionnaire de flotte

- **Qui.** Gère les véhicules et les contraventions.
- **Attentes.** Échéances (assurance, contrôle technique, entretien) qui ne se
  ratent pas ; coûts par véhicule ; suivi des contraventions.
- **Apport.** Module Parc + Contraventions, alertes proactives, coûts consolidés.

## D8. Profils futurs (portails)

- **Le client** (futur) : consulte **ses** chantiers, documents, situations.
- **Le sous-traitant** (futur) : voit **ses** lots sur **ses** chantiers.
- Périmètre strictement restreint, en lecture principalement.

> **Priorité produit.** Le **dirigeant** est le persona central : en cas de conflit
> d'ergonomie ou de priorité, c'est son expérience qui prime (PROD-P04), sans nuire
> aux autres.

---

# Partie E — Expérience utilisateur voulue

> Cette partie fixe la **philosophie** d'expérience ; le détail visuel relèvera de
> l'**UX/UI Bible** à venir. Elle sert de cadre à celle-ci.

- **EXP-1 — L'essentiel en un coup d'œil.** À l'ouverture, le dirigeant voit d'abord
  **ce qui exige son attention**, ordonné par priorité. La valeur se lit en moins
  d'une minute.
- **EXP-2 — Moins de clics, moins de saisie.** Chaque interaction superflue est un
  défaut. Ce qui peut être pré-rempli l'est ; ce qui peut être calculé n'est pas
  saisi.
- **EXP-3 — Le logiciel vient à l'utilisateur.** Alertes, brief, priorités : le
  produit signale, il n'attend pas qu'on cherche (PROD-P05).
- **EXP-4 — Clarté avant densité.** Un écran dit **une** chose importante clairement
  plutôt que dix choses confusément. La hiérarchie visuelle guide la décision.
- **EXP-5 — Rapidité perçue.** L'interface répond instantanément ; les traitements
  lourds se font en arrière-plan sans bloquer.
- **EXP-6 — Cohérence partout.** Les mêmes gestes, les mêmes codes visuels, les
  mêmes mots dans tout le produit. On apprend une fois.
- **EXP-7 — Mobile de plein droit.** Utilisable sur téléphone et tablette pour les
  usages nomades, pas seulement au bureau.
- **EXP-8 — Explicable.** Chaque chiffre, priorité ou alerte peut dire « pourquoi ».
  L'utilisateur n'est jamais devant une décision opaque.
- **EXP-9 — Rassurant.** Rien ne se perd, tout se retrouve, une erreur se rattrape.
  Le produit inspire confiance par sa stabilité et sa traçabilité.
- **EXP-10 — Sobre et professionnel.** Une esthétique au service de la lisibilité,
  jamais décorative au détriment de la clarté.

---

# Partie F — Politique de fonctionnalités

> Le cœur de la discipline produit : **quoi accepter, quoi refuser, comment
> arbitrer.** Cette politique évite la dérive du périmètre et la mort par
> accumulation.

## F1. Critères d'acceptation

Une fonctionnalité est **recevable** seulement si elle satisfait **tous** ces
critères :

1. **Sert la mission** (A3) : elle aide le dirigeant (ou un rôle clé) à décider,
   piloter, anticiper.
2. **Valeur métier démontrable** (PROD-P03) : on sait dire *pour qui*, *quel gain*
   (temps / argent / risque évité), *comment on le mesure*.
3. **Ne casse pas l'existant** (PROD-P11) : rétro-compatible ou migration explicite.
4. **Respecte les documents fondateurs** : conforme à la Security Bible, définie
   dans la Business Rules Bible et la Data Bible avant d'être codée (PROD-P17).
5. **Une seule saisie** (PROD-P01) : elle n'introduit pas de ressaisie.
6. **Ne dégrade pas lisibilité, rapidité, stabilité** (PROD-P10).
7. **Reste sobre** (PROD-P09) : son bénéfice justifie sa complexité (F4).
8. **Réversible** (PROD-P15) : elle n'enferme pas (données exportables, pas de
   dépendance irremplaçable).

## F2. Critères de refus

Une fonctionnalité est **refusée** (ou reportée/simplifiée) si elle :

- N'a **pas de valeur métier démontrable** (gadget, « parce que c'est à la mode »).
- Introduit une **ressaisie** ou une **seconde source de vérité**.
- Fait **calculer un chiffre officiel dans l'interface** ou par l'IA (viole
  PROD-P14).
- **Contourne ou affaiblit la sécurité** (viole PROD-P13), même pour plus de
  confort.
- Ajoute une **complexité** (pour l'utilisateur ou technique) **sans bénéfice
  proportionné** (F4).
- Crée une **dépendance dure** à un fournisseur (perte de souveraineté).
- Sert **un cas marginal** au prix d'une charge pour tous.
- Fait de l'**IA une décideuse** sur un acte engageant (viole PROD-P07).
- **Casse** ou risque de casser une fonction existante sans filet (viole PROD-P11).

## F3. Grille de décision (filtre de fonctionnalité)

Pour chaque demande, on répond à **10 questions**. Un « non » à une question
**bloquante** (marquée ⛔) suffit à refuser en l'état.

| # | Question | Bloquant |
|---|---|---|
| 1 | Sert-elle la mission / un rôle clé ? | ⛔ |
| 2 | La valeur métier est-elle démontrable et mesurable ? | ⛔ |
| 3 | Fait-elle gagner du temps / de l'argent / réduit-elle un risque ? | ⛔ |
| 4 | Évite-t-elle toute ressaisie (une seule saisie) ? | ⛔ |
| 5 | Respecte-t-elle la sécurité et le RGPD ? | ⛔ |
| 6 | Est-elle définie dans les bibles concernées avant d'être codée ? | ⛔ |
| 7 | Préserve-t-elle l'existant (pas de régression) ? | ⛔ |
| 8 | Sa complexité est-elle justifiée par son bénéfice ? | ⛔ |
| 9 | Reste-t-elle lisible, rapide, stable ? | — |
| 10 | Est-elle réversible (pas d'enfermement) ? | — |

> Si la fonctionnalité passe la grille mais reste lourde, on cherche d'abord à la
> **simplifier** ou à la **couvrir par configuration** (PROD-P16) avant de la coder.

## F4. Arbitrage de la complexité

> **Règle d'or de la complexité (PROD-P09).** *La complexité doit toujours être
> payée par une valeur métier proportionnée. À bénéfice égal, on choisit la solution
> la plus simple. En cas de doute, on dit non — car un « non » est réversible, un
> « oui » l'est rarement.*

Méthode d'arbitrage quand une fonctionnalité rend le logiciel plus complexe :

1. **Nommer la complexité.** Est-elle **pour l'utilisateur** (charge cognitive,
   écrans, options) ou **technique** (maintenance, risque de régression) ? La
   complexité **pour l'utilisateur** est la plus grave : elle se refuse en premier.
2. **Peser valeur vs coût.** Bénéfice métier (temps/argent/risque) face au coût
   (complexité, maintenance sur des années, risque de casser, charge cognitive).
3. **Chercher plus simple.** Peut-on obtenir 80 % de la valeur avec 20 % de la
   complexité ? Peut-on **réutiliser** l'existant plutôt qu'ajouter ? Couvrir par
   **configuration** plutôt que par code ?
4. **Isoler.** Si on la fait, la complexité reste **cloisonnée** (un module) et ne
   contamine pas le reste (cohérence, PROD-P12).
5. **Décider et écrire.** Acceptation, report ou refus — **écrit et justifié**,
   pour que la décision tienne dans le temps et ne soit pas rejouée sans fin.

> **Signal d'alerte.** Si une fonctionnalité oblige à écrire « cas particulier »,
> « exception », « sauf si » à répétition, c'est un signe qu'elle **casse la
> cohérence** : on la repense.

---

# Partie G — Mesure du succès (indicateurs)

> On mesure le succès du **produit**, pas seulement des fonctionnalités. Les valeurs
> cibles se fixent avec la direction ; l'important est de **suivre la tendance**.

## G1. Indicateurs de valeur pour le dirigeant (les plus importants)

| Indicateur | Ce qu'il prouve | Cible d'esprit |
|---|---|---|
| **Temps gagné par le dirigeant** (min/jour) | Le produit rend du temps. | En hausse. |
| **Temps pour voir l'essentiel le matin** | Clarté décisionnelle. | < 1 minute. |
| **Échéances manquées** (assurance, contrôle technique, contravention, obligation) | Proactivité. | Tendre vers zéro. |
| **Dérives de marge détectées à temps** (avant la fin du chantier) | Pilotage réel. | En hausse. |
| **Délai moyen de relance des impayés** | Trésorerie protégée. | En baisse. |
| **Décisions prises dans les temps** (validations/signatures non en retard) | Le cockpit fonctionne. | En hausse. |

## G2. Indicateurs d'usage et d'adoption

| Indicateur | Ce qu'il prouve |
|---|---|
| Ouverture quotidienne du cockpit par le dirigeant | Le produit est devenu le point d'entrée. |
| Taux d'adoption par rôle (conducteur, comptable…) | Le produit sert toute l'entreprise. |
| Part des saisies faites dans BRN Pilot (vs tableurs) | Le produit remplace l'éparpillement. |
| Taux d'acceptation des propositions IA | L'IA est utile et de confiance. |

## G3. Indicateurs de « une seule saisie »

| Indicateur | Ce qu'il prouve |
|---|---|
| Nombre de ressaisies éliminées dans le parcours « visite → garantie » | Principe PROD-P01 tenu. |
| Fraîcheur du pilotage (délai fait métier → tableau de bord) | La donnée circule vite. |

## G4. Indicateurs de qualité produit

| Indicateur | Ce qu'il prouve |
|---|---|
| **Régressions** par livraison | Non-régression (PROD-P11). Cible : zéro non couverte par un test. |
| Disponibilité et temps de réponse | Rapidité et stabilité (PROD-P10). |
| Incidents de sécurité / pertes de données | Confiance (PROD-P13, P14). Cible : zéro. |

## G5. Indicateurs de cohérence et de santé du produit (long terme)

| Indicateur | Ce qu'il prouve |
|---|---|
| Nombre de règles métier codées **hors** Business Rules Bible | Discipline PROD-P17. Cible : zéro. |
| Nombre de données manipulées **hors** Data Bible | Discipline PROD-P17. Cible : zéro. |
| Nombre de « cas particuliers / exceptions » ajoutés | Complexité rampante (F4). À surveiller. |
| **Absence de refonte majeure** dans le temps | La preuve ultime que les principes tiennent (A5). |

---

# Partie H — Gouvernance produit

- **PROD-GOV-001 — La Product Bible est la boussole.** Toute décision produit
  (ajout, report, refus, arbitrage) se prend **à la lumière de ce document**, en
  citant les principes en jeu.
- **PROD-GOV-002 — Ordre des documents fondateurs.** En cas de conflit :
  **Sécurité** (Security Bible) et **Vérité des données/règles** (Data + Business
  Rules) priment sur le confort et la richesse ; la **Product Bible** arbitre le
  *pourquoi* et le *jusqu'où*.
- **PROD-GOV-003 — Décisions écrites.** Toute décision produit structurante est
  écrite, datée, justifiée, jamais rejouée indéfiniment.
- **PROD-GOV-004 — Revue produit régulière.** On relit périodiquement les
  principes, on mesure les indicateurs (Partie G), on nettoie ce qui a dérivé.
- **PROD-GOV-005 — Le « non » est un livrable.** Refuser une fonctionnalité qui ne
  sert pas la mission **est** un acte produit positif : c'est ce qui garde *BRN
  Pilot* cohérent, sobre et durable.
- **PROD-GOV-006 — Feuille de route au service de la mission.** L'ordre de
  développement (vagues, Master Blueprint ch. 34) suit la **valeur pour le
  dirigeant**, pas la mode ni la facilité technique.

---

# Partie I — Traçabilité vers les autres documents fondateurs

| Thème produit | Product Bible | Master Blueprint | Business Rules Bible | Data Bible | Security Bible |
|---|---|---|---|---|---|
| Système d'exploitation du dirigeant | A1, A4, D1 | 1.7, D31 | Partie F (priorité), J (IA) | E-TACHE, C10 | — |
| Une seule saisie / source de vérité | PROD-P01, P14 | P6, D5, D7 | INV-1, INV-4 | A4 | — |
| Automatisation fiable | PROD-P06 | ch. 14 | Partie G, 14.4 | — | — |
| IA conseille, ne décide pas | PROD-P07, P08 | ch. 24 | Partie J (IA-001…) | C14 | G1 (SEC-IA) |
| Sécurité prime sur le confort | PROD-P13 | ch. 20 | — | Partie B | Tout le document |
| Ne jamais casser l'existant | PROD-P11 | P1, ch. 29-30 | INV-2 | A4, A5 | — |
| Éviter la complexité inutile | PROD-P09, F4 | P11 | GOV | — | — |
| Définir avant de coder | PROD-P17 | P13, D30 | GOV-001 | A8 | SEC-GOV-001 |
| Mesure du succès | Partie G | ch. 12 §indicateurs | — | — | — |
| Réversibilité / souveraineté | PROD-P15 | D20 | IA-060 (multi-fournisseur) | — | SEC-P9, J1 |

---

## Fin du document

> **BRN PILOT — Product Bible v1.0.** L'identité de *BRN Pilot* : pourquoi il
> existe, pour qui, avec quelles valeurs et quels principes, et comment arbitrer
> chaque décision pour rester **cohérent pendant plusieurs années**. Document
> normatif, sans code.
>
> **Règle d'or.** Face à toute décision produit, on revient ici. Une fonctionnalité
> qui ne sert pas la mission, n'a pas de valeur métier démontrable, casse l'existant,
> affaiblit la sécurité ou ajoute une complexité non justifiée **n'entre pas** —
> aussi séduisante soit-elle. C'est ce refus discipliné qui fait un **produit
> premium et durable**.
>
> Les documents fondateurs suivants (dans l'ordre prévu) : **UX/UI Bible**, puis
> **API Bible**, puis **Developer Bible** — avant tout développement.
