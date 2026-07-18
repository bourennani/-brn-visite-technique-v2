# BRN PILOT — REVUE GLOBALE DU SOCLE DOCUMENTAIRE — VERSION 1.0

> **Nature du document.** Revue critique **croisée** des 9 documents fondateurs de
> *BRN Pilot*. Ce n'est **pas** un nouveau document fondateur : c'est une **analyse**
> destinée à valider (ou corriger) le socle **avant** le premier lot de
> développement.
>
> **Ce document ne contient aucun code. Aucun développement n'est commencé.**
>
> **Documents analysés** (présents sur cette branche) : Master Blueprint (v1.1),
> Business Rules Bible, Data Bible, Security Bible, Product Bible, Automation Bible,
> UX/UI Bible, API Bible, Developer Bible.
>
> **Posture.** Honnête et critique. Je signale les vraies tensions, pas des défauts
> inventés. Le socle est mon propre travail : je le relis **comme un auditeur
> externe**.

---

## Sommaire

- A. Résumé exécutif
- B. Niveau de maturité du projet
- C. Forces du socle
- D. Contradictions
- E. Manques
- F. Surarchitecture
- G. Décisions bloquantes
- H. Décisions non bloquantes
- I. Paramètres métier à valider
- J. Recommandations techniques
- K. Validation / correction du premier lot
- L. Roadmap
- M. Registre des risques
- N. Matrice de traçabilité
- O. Verdict final

---

## A. Résumé exécutif

Le socle documentaire de *BRN Pilot* est **solide, cohérent et complet** au niveau
architectural. Les 9 documents forment un ensemble **discipliné** : mêmes principes
(cloisonnement, calculs déterministes centralisés, sécurité par conception, une
seule saisie, validation humaine des actes engageants), mêmes invariants, et une
**traçabilité mutuelle** réelle. Il n'y a **aucune contradiction majeure** ni
**surarchitecture** : les pièges classiques (microservices, CQRS lourd, event
sourcing, bases multiples) ont été **explicitement évités**.

Ce qui reste avant de développer relève de **deux catégories normales à ce stade** :
1. **Confirmer les fournisseurs techniques** (hébergement, base, identité, région
   UE) — décisions **bloquantes** pour le lot 0 mais simples, avec recommandations
   claires ci-dessous ;
2. **Trancher des paramètres métier** (seuils, pondérations, délais, durées de
   conservation) — que je **n'invente pas**, mais pour lesquels je propose des
   valeurs de départ raisonnables.

Quelques **réconciliations mineures** sont à faire (modèle de priorité, précision
monétaire, périmètre exact du premier lot). Aucune ne remet en cause l'architecture.

**Verdict : prêt sous réserve de corrections mineures** (détail en O).

## B. Niveau de maturité du projet

| Dimension | Maturité | Commentaire |
|---|---|---|
| Vision & périmètre | ★★★★★ | Clairs, stables, « OS du dirigeant » assumé. |
| Architecture technique | ★★★★★ | Monolithe modulaire, couches, contrats — cohérent et sobre. |
| Règles métier | ★★★★☆ | Structure complète ; **paramètres** et modèle de priorité à préciser. |
| Modèle de données | ★★★★☆ | Exhaustif ; classification par entité à compléter. |
| Sécurité & RGPD | ★★★★★ | Zero Trust, classification, matrice de permissions, multi-tenant. |
| Automatisations & IA | ★★★★☆ | Cadre clair ; version IA minimale à confirmer pour éviter la complexité précoce. |
| UX/UI | ★★★★★ | Cockpit, design system, parcours, critères d'acceptation. |
| API | ★★★★★ | Contrats, sécurité, idempotence, événements, intégrations. |
| Développement | ★★★★☆ | Stack figée, discipline forte ; fournisseurs à confirmer. |
| **Global** | **★★★★☆** | **Prêt à démarrer après validation d'un petit nombre de décisions.** |

## C. Forces du socle

1. **Discipline transverse** : les mêmes principes reviennent partout (P1 non-régression, P6 calculs purs, P2 séparation des couches, sécurité par conception).
2. **Une seule source de vérité pour les chiffres** : l'IA ne calcule jamais l'officiel — règle martelée dans 4 documents (Product, Business Rules, API, Developer).
3. **Sécurité de premier plan** : classification à 4 niveaux, matrice de permissions, multi-tenant + RLS, Zero Trust, audit immuable.
4. **Sobriété assumée** : refus explicite des microservices/CQRS/event sourcing ; stack peu coûteuse, adaptée à une petite équipe.
5. **Continuité** : réutilisation du savoir-faire (React/TS/Tailwind/Vitest) hérité de *BRN Visite Technique*.
6. **Traçabilité** : chaque document renvoie aux autres ; les règles portent des identifiants stables.
7. **Livraison par tranches verticales** : pas de « big bang », premier lot minimal, ordre justifié.
8. **Honnêteté** : chaque document liste ses propres questions ouvertes plutôt que de les masquer.

## D. Contradictions

> Aucune contradiction **majeure**. Les points ci-dessous sont des **tensions
> mineures à réconcilier**.

**D1 — Modèle de priorité : 5 facteurs vs 8 facteurs.**
- Documents : Business Rules Bible (Partie F, PRI-001 = **5 facteurs** pondérés +
  bonus risque/opportunité) vs UX/UI Bible (Cockpit Zone 2 = **8 facteurs** :
  urgence, importance, délai, impact financier, impact opérationnel, risque
  juridique, risque client, risque chantier).
- Nature : le nombre et la nature des facteurs diffèrent (les « risques »
  juridique/client/chantier sont-ils des facteurs à part ou des composantes du
  « bonus risque » PRI-003 ?).
- Risque : moteur de priorité ambigu → scores non reproductibles, incompréhension.
- Solution recommandée : **unifier sur le modèle Business Rules** = 5 facteurs
  (urgence, importance, délai, impact financier, impact opérationnel) **+** un
  **facteur risque composite** (juridique/client/chantier) et un **facteur
  opportunité**. Mettre à jour l'UX pour refléter ce modèle. À figer **avant le
  module Dirigeant/priorité** (lot 1).
- Décision à valider : le modèle exact des facteurs et leurs **pondérations** (voir I).

**D2 — Langage/hébergement : « question ouverte » (Master Blueprint) vs « figé » (Developer Bible).**
- Documents : Master Blueprint ch. 6.2/35 laisse le **langage backend** et
  l'**hébergement** ouverts ; la Developer Bible **fige** Next.js/TS + Postgres +
  Vercel + worker séparé.
- Nature : ce n'est pas une contradiction de fond (la Developer Bible **résout** la
  question), mais la décision n'a pas été **formellement validée** par la direction.
- Risque : démarrer le lot 0 sans validation explicite de la stack.
- Solution : **valider la stack** comme décision officielle (ADR) — voir G1.

**D3 — Résultat « estimé » du cockpit : officiel ou IA ?**
- Documents : UX/UI Zone 1 affiche un « résultat estimé » ; Business Rules INV-1 =
  officiel du moteur ; UX B2.5 distingue officiel (neutre) vs estimation IA (violet).
- Nature : ambiguïté sur la nature du « résultat estimé » (projection
  **déterministe** du moteur, ou estimation **IA** ?).
- Risque : confusion visuelle entre officiel et IA (viole UX-P07).
- Solution : préciser que le « résultat estimé » est une **projection déterministe
  du moteur** (donc **officielle**, libellée « projeté/estimé » mais **neutre**, pas
  violette). Le violet est réservé aux estimations **IA**. Clarification à porter dans
  UX/UI et Business Rules. Mineur.

**D4 — Garanties ouvertes (Chantiers) mais module SAV retiré de la V1.**
- Documents : Master Blueprint v1.1 retire **SAV/Maintenance** de la V1 ; mais
  Chantiers **ouvre les garanties** à la réception (échéances). Data Bible modélise
  E-RECEPTION/garanties.
- Nature : les garanties existent mais **aucun module ne les exploite** en V1.
- Risque : échéances de garantie créées mais orphelines (pas d'alerte/traitement).
- Solution : en V1, les garanties restent des **échéances passives** (alertes
  d'approche de fin de garantie via le moteur d'échéances/alertes existant), **sans**
  module SAV. Documenter explicitement ce comportement transitoire. Mineur.

**D5 — Nommage des entités : français (Data Bible) vs anglais (API/DB).**
- Documents : Data Bible = entités françaises (`E-FACTURE`) ; API Bible = ressources
  anglaises (`/invoices`) ; Developer Bible = tables anglaises (`invoices`).
- Nature : convention, pas contradiction, mais il manque une **table de
  correspondance canonique** (terme métier FR ↔ identifiant technique EN).
- Risque : divergence de vocabulaire, confusion.
- Solution : ajouter un **glossaire de correspondance** (Data Bible ou Developer
  Bible) : `Facture ↔ invoice`, `Chantier ↔ project`, etc. Mineur, à faire avant le
  code.

## E. Manques

> Éléments importants absents ou insuffisamment définis, par thème.

| # | Thème | Manque | Gravité |
|---|---|---|---|
| E1 | Calculs financiers | **Précision des prix unitaires** : le « centime entier » convient aux **totaux**, mais un prix unitaire (déboursé au m², taux horaire) peut nécessiter **plus de 2 décimales** avant arrondi de la ligne. À définir (ex. 4 décimales sur l'unitaire, arrondi cents sur la ligne). | Importante (avant Finance). |
| E2 | Règles de priorité | **Pondérations** et modèle exact (D1) non figés. | Importante (avant lot 1). |
| E3 | Données / classification | La **classification par entité** (N1–N4) n'est donnée qu'au niveau **famille** (Security K1) ; il manque un tableau **par entité** dans la Data Bible. | Moyenne. |
| E4 | Permissions | La matrice (Security C9) est au niveau **module** ; certaines **actions fines** (ex. voir le montant d'une contravention sans l'identité) restent à préciser par entité. | Moyenne (avant modules sensibles). |
| E5 | Automatisations | Les **délais** (relances, rappels véhicules, alertes) sont des **paramètres non fixés** (voir I). | Importante (avant automatisations). |
| E6 | IA | La **version minimale d'IA** pour les premiers lots n'est pas explicitée (section 8). | Moyenne. |
| E7 | Apple Calendar | Stratégie **non tranchée** (analyse en section 7). | Non bloquante (dernier lot). |
| E8 | Véhicules | Les **types d'entretien et périodicités** (au km/temps) ne sont pas catalogués (référentiel). | Importante (avant Véhicules). |
| E9 | Contraventions | **Imputation** (entreprise vs conducteur) et **barèmes** non tranchés ; enjeu RGPD/droit du travail. | Importante (avant Contraventions). |
| E10 | Tâches dirigeant | Le **catalogue des obligations administratives/fiscales** (types + échéances) n'est pas défini. | Moyenne. |
| E11 | Documents | Les **durées de conservation par type** (au-delà des minimums légaux) sont à fixer. | Moyenne. |
| E12 | Audit | Le **périmètre exact** des actions auditées est décrit en principe ; une **liste d'événements auditables** consolidée aiderait. | Faible. |
| E13 | Imports | Le **format des relevés bancaires** (CSV banque ? norme ?) à préciser lors du lot Finance. | Non bloquante. |
| E14 | Exports | La **liste des rapports/exports standard** (modèles PDF) n'est pas cataloguée. | Faible. |
| E15 | Sauvegardes / PRA | **RPO/RTO chiffrés** non fixés (à valider avec la direction). | Importante (avant production). |
| E16 | Reprise incident | Processus décrit ; manque un **contact/responsable** et un **canal** de notification (opérationnel, pas architectural). | Faible. |
| E17 | RGPD | **Registre des traitements** et **durées** à instancier (cadre défini, valeurs à saisir). | Importante (avant données réelles). |
| E18 | Mobile | Le **périmètre hors-ligne** nomade (D24) reste à délimiter précisément ; **non inclus** dans les premiers lots (connecté). | Moyenne (après lot 2-3). |
| E19 | Régressions | Cadre complet ; il manquera une **version stable de référence** à définir à la première mise en production. | Faible (au fil de l'eau). |
| E20 | Notifications / Objectifs / Décisions | Modules **légèrement spécifiés** (peu de détail vs les gros modules). | Faible (petits modules). |

## F. Surarchitecture

> Bonne nouvelle : le socle **évite** déjà les excès. Points de vigilance et
> simplifications proposées.

| # | Élément | Verdict | Simplification recommandée |
|---|---|---|---|
| F1 | Microservices | **Évité** (monolithe modulaire). | RAS. Conserver. |
| F2 | CQRS / Event sourcing | **Évité** (command/query léger, tables d'historique). | RAS. Conserver. |
| F3 | Bases multiples | **Évité** (un seul PostgreSQL + pgvector). | RAS. Conserver. |
| F4 | **Agents IA (7 agents + orchestrateur)** | **Risque de complexité précoce.** | Clarifier : les 7 « agents » sont des **profils de compétence** d'**un seul assistant/Gateway**, **pas 7 services**. Démarrer avec **un assistant unique** (un adaptateur fournisseur, lecture seule, mise en forme du brief) ; introduire les profils progressivement. |
| F5 | **Nombre de fournisseurs managés** | À surveiller (Vercel, Postgres, S3, OIDC, erreurs, IA, worker…). | **Consolider** : envisager une plateforme regroupant **Postgres + Auth + Stockage + pgvector** (réduit le nombre de fournisseurs pour une petite équipe, tout en restant sur Postgres portable). Voir J. |
| F6 | Webhooks / connecteurs bancaires / RAG | **Préparés mais non développés** — bon. | Conserver « préparé, non développé » ; ne rien coder avant le lot concerné. |
| F7 | Processus (DoR/DoD, revue, CI) | Complet — risque de **lourdeur** pour une équipe de 1-2 personnes. | **Right-size** : garder les **portes CI** (lint/typage/tests/secrets) et la DoD ; alléger la cérémonie (revue par pair possible mais pas bloquante si un seul dev, en compensant par des tests + un contrôle a posteriori). |
| F8 | Multi-devise / conversions | Peu utile (BRN = EUR). | Garder le **champ devise** (coût nul), mais **ne pas développer** la conversion (future). |

## G. Décisions bloquantes (avant le lot 0)

> À trancher **avant** d'initialiser le dépôt et le premier lot. Peu nombreuses,
> avec recommandations claires (détail des options en J).

**G1 — Valider la stack technique (ADR officiel).**
- Question : confirme-t-on Next.js + TypeScript + PostgreSQL + Drizzle + worker
  séparé (pg-boss) + stockage S3 + OIDC managé, hébergement UE ?
- Recommandation : **oui**, tel que figé dans la Developer Bible, avec **région
  UE** confirmée pour tous les services (RGPD). Impact coût : faible. Impact délai :
  nul (débloque le lot 0). Risque si non tranché : blocage du démarrage.

**G2 — Choisir les fournisseurs managés (identité, base, stockage, hébergement) et confirmer la région UE.**
- Question : quels prestataires concrets, en UE ?
- Recommandation (petite équipe, coût/réversibilité) : **deux options**, voir J2.
  Trancher avant le lot 0 car l'auth et la base y sont posées.

**G3 — Création du dépôt BRN Pilot séparé.**
- Question : nouveau dépôt GitHub `brn-pilot` (distinct de *BRN Visite Technique*) ?
  Les 9 documents fondateurs y sont-ils **copiés** (dans `docs/`) ?
- Recommandation : **oui** — nouveau dépôt privé `brn-pilot` ; copier les 9
  documents dans `docs/` comme référence officielle (source de vérité documentaire).
  Impact : faible. Bloquant car le lot 0 = « dépôt séparé ».

**G4 — Confirmer le périmètre exact du premier lot** (voir K, avec les ajustements
demandés : coque de navigation, responsive, clair/sombre, données de démonstration
clairement identifiées).

**G5 — Réconcilier le modèle de priorité (D1)** — techniquement non requis pour le
lot 0 (cockpit vide), mais **à décider avant le lot 1**. Je le classe **quasi
bloquant** car il conditionne le cœur produit.

## H. Décisions non bloquantes (par module / futures)

| # | Décision | Quand |
|---|---|---|
| H1 | Précision des prix unitaires (E1) | Avant Finance (lot 4-5). |
| H2 | Règles de numérotation légale (reset annuel ? avoirs) | Avant Factures (lot 4). |
| H3 | Types d'entretien / périodicités véhicules (E8) | Avant Véhicules (lot 6). |
| H4 | Imputation & barèmes contraventions (E9) | Avant Contraventions (lot 6). |
| H5 | Stratégie Apple Calendar (section 7) | Avant Calendrier (dernier lot). |
| H6 | Périmètre hors-ligne mobile (E18) | Après lot 2-3. |
| H7 | Connecteur bancaire (rapprochement) | Avec/aprés Trésorerie. |
| H8 | Activation des webhooks / API partenaire | Future. |
| H9 | Passage éventuel à un monorepo à paquets / mobile natif | Future (ADR). |
| H10 | Couche de lecture GraphQL | Future (si besoin réel). |

## I. Paramètres métier à valider

> **Je n'invente pas ces valeurs.** Ci-dessous, des **valeurs de départ
> raisonnables** pour une PME du bâtiment, à **valider/ajuster** par la direction.
> Toutes seront des **paramètres administrables** (versionnés), pas du code figé.

| Paramètre | Valeur de départ proposée (à valider) |
|---|---|
| **Seuil de marge dangereuse** | Alerte si marge réalisée projetée < marge prévue **− 5 points** ; **critique** si < prévue − 10 pts **ou** marge projetée < **8 %**. |
| **Seuil de dépassement de budget** | **Attention** si coût projeté > **90 %** du budget vendu ; **critique** si coût projeté > budget vendu (marge négative). |
| **Niveaux d'alerte** | information / attention / urgent / critique (déjà définis) — seuils par type ci-dessous. |
| **Pondérations du score de priorité** | urgence **30 %**, importance **25 %**, impact financier **20 %**, impact opérationnel **15 %**, délai **10 %** ; bonus risque/opportunité **+/− 10 %**. |
| **Délais de relance de devis** | rappel **J+7**, relance **J+14**, dernière relance **J+21** (sans réponse). |
| **Délais de relance d'impayé** | rappel **J+8** après échéance, relance **J+15**, mise en demeure **J+30** ; escalade dirigeant si montant > **5 000 €**. |
| **Contraventions — alerte avant majoration** | alerte **J-10** avant la date de majoration indiquée sur l'avis (la date exacte vient de l'avis, non inventée). |
| **Rappels véhicules** | contrôle technique **J-30**, assurance **J-30**, entretien **J-15** ou seuil km, vidange au **seuil km**, pneus selon **état/saison**, leasing **J-30**. |
| **Seuil de trésorerie critique** | plancher **absolu** défini par le dirigeant **ou** < **1 mois** de charges courantes (par défaut : à saisir). |
| **Objectif mensuel** | CA et marge cibles **définis par le dirigeant** (pas de défaut : saisie obligatoire). |
| **Règles urgent / critique** | matrice Eisenhower : **critique** = urgence haute + importance haute ; forçage critique si risque juridique/trésorerie/échéance légale dépassée. |
| **Délais de conservation** | facture/encaissement **10 ans** ; marchés/décennale **≈ 11 ans** ; prospects non convertis **3 ans** puis anonymisation ; contraventions **durée strictement nécessaire** ; RH selon obligations légales. |
| **Droits spécifiques du dirigeant** | Espace Dirigeant **strictement privé** ; délégués **nommés explicitement** (par défaut : aucun). |
| **RPO / RTO** | RPO **≤ 15 min**, RTO **≤ 4 h** (par défaut, à valider). |

## J. Recommandations techniques (avec contexte)

**J1 — Agents IA : commencer par un assistant unique.**
Ne pas développer 7 agents dès le départ. Implémenter **un** Orchestrateur/Gateway
avec **un** adaptateur fournisseur, en **lecture seule**, pour : (a) mettre en forme
le **brief quotidien** (à partir des priorités du moteur) et (b) répondre à
quelques questions. Les « agents » spécialisés = **profils de prompt/outils**
ajoutés progressivement. Simplicité, coût maîtrisé, réversibilité.

**J2 — Fournisseurs managés : deux options recommandées pour une petite équipe.**
- **Option A (consolidée) :** une plateforme **PostgreSQL managée regroupant
  base + authentification + stockage + pgvector** (moins de fournisseurs, mise en
  route rapide, région UE). Avantage : simplicité, coût, une seule facturation.
  Limite : léger couplage plateforme (atténué car **Postgres portable** + standards).
- **Option B (best-of-breed) :** Postgres managé (serverless) + fournisseur
  d'identité OIDC dédié + stockage S3 + Vercel. Avantage : chaque brique
  remplaçable ; identité plus riche (MFA, SSO). Limite : plus de fournisseurs à
  gérer.
- **Recommandation :** commencer par l'**Option A** (consolidée) pour aller vite et
  réduire la charge d'exploitation, **à condition** de vérifier la **région UE**, le
  **support OIDC/MFA** et l'**export/réversibilité** ; migrer vers B **plus tard** si
  un besoin (SSO entreprise, exigences avancées) apparaît. Dans tous les cas, **le
  domaine reste indépendant** du fournisseur (couche 4 / ports), donc le choix est
  **réversible**.

**J3 — Worker/asynchrone :** **pg-boss** (file sur Postgres) + **un petit service
worker** hébergé (conteneur léger / plateforme d'app managée UE). Évite un broker
dédié au démarrage ; réévaluer si le débit l'exige.

**J4 — Observabilité :** un **traqueur d'erreurs** managé + logs structurés
suffisent pour la V1 ; introduire traces/métriques détaillées au besoin.

**J5 — Right-sizing du processus :** garder les **portes CI** et la **DoD** ;
alléger la cérémonie de revue tant que l'équipe est réduite (compenser par les tests
et un contrôle a posteriori). Ne pas laisser le process ralentir la V1.

## K. Validation / correction du premier lot

> Le périmètre de la Developer Bible §48 est **confirmé** et **ajusté** avec vos
> précisions (coque de navigation, responsive, clair/sombre, données de
> démonstration clairement identifiées).

**Périmètre validé du Lot 0 :**
- Dépôt *BRN Pilot* **séparé** ; architecture initiale (structure, config).
- **Qualité de code + CI** (lint, typage, tests, détection de secrets, build,
  preview).
- **Authentification** (OIDC déléguée, session, MFA direction).
- **Entreprise** (organisation, contexte tenant `org_id` + **RLS**).
- **Utilisateur dirigeant** ; **rôles & permissions de base**.
- **Base PostgreSQL** (schéma socle : organisation, utilisateur, rôle, audit) +
  migrations versionnées.
- **Journal d'audit** (écriture + lecture restreinte).
- **Coque de navigation** (barre latérale/mobile) selon l'UX/UI Bible.
- **Cockpit connecté à la base** affichant des **données de démonstration
  clairement identifiées** (bandeau « DÉMONSTRATION », aucune donnée réelle).
- **Responsive** (ordinateur/tablette/mobile) + **mode clair et sombre**.

**Exclu du Lot 0 (confirmé) :** aucun calcul financier complet ; aucune IA réelle ;
aucune connexion bancaire ; aucune synchronisation Apple Calendar ; aucune donnée
réelle de BRN Group.

**Critères d'acceptation du Lot 0 :**

| ID | Critère |
|---|---|
| L0-AC-01 | Le dépôt `brn-pilot` existe, séparé, avec la structure de la Developer Bible et les 9 documents dans `docs/`. |
| L0-AC-02 | La CI bloque une contribution en cas d'échec lint/typage/tests/secrets. |
| L0-AC-03 | Un utilisateur s'authentifie via OIDC ; MFA exigé pour la direction. |
| L0-AC-04 | Toute donnée porte `org_id` ; la **RLS** empêche tout accès inter-entreprise (test d'étanchéité vert). |
| L0-AC-05 | Le dirigeant a un rôle avec permissions de base ; l'Espace Dirigeant est strictement privé. |
| L0-AC-06 | Chaque action engageante du socle produit une **entrée d'audit** (qui/quoi/quand). |
| L0-AC-07 | Le **cockpit** s'affiche, authentifié et tenant-aware, avec des données **marquées DÉMONSTRATION**. |
| L0-AC-08 | L'interface est **responsive** et supporte **clair/sombre** à parité de sens. |
| L0-AC-09 | Environnements **local** et **preview** opérationnels, secrets isolés, région UE. |
| L0-AC-10 | **Aucune** donnée financière réelle, **aucune** IA réelle, **aucune** intégration externe active. |
| L0-AC-11 | Aucune valeur de style en dur (jetons) ; aucun calcul officiel dans l'interface. |
| L0-AC-12 | Sauvegarde de la base configurée et **restauration testée** au moins une fois. |

## L. Roadmap (par lots verticaux utilisables)

> Un lot = une **tranche verticale** livrable et utile, qui ne casse pas la
> précédente. On **n'ouvre pas** plusieurs modules en parallèle.

| Lot | Objectif | Fonctionnalités clés | Dépendances | Risques | Critères d'acceptation (résumé) | Livrable |
|---|---|---|---|---|---|---|
| **0 — Fondations** | Socle sûr et testé | Dépôt, CI, auth/MFA, entreprise, dirigeant, rôles, RLS, audit, coque, cockpit démo, responsive, clair/sombre | — | Isolation tenant, config providers | Section K (L0-AC-01..12) | Socle déployé (preview) |
| **1 — Cockpit & Tâches** | Valeur dirigeant immédiate | Tâches, priorité (modèle figé), échéances, centre d'actions, brief déterministe (sans IA) | Lot 0 ; **modèle de priorité (D1)** | Ambiguïté de priorité | Priorité reproductible + explication ; tâches priorisées | Cockpit utile |
| **2 — Clients & Chantiers** | Cœur d'activité | Tiers/clients, chantiers, avancement, santé | Lot 0-1 | Modèle chantier | CRUD + états + santé ; audit | Suivi de chantiers |
| **3 — Dépenses & Main-d'œuvre** | Coût réel | Dépenses (rattachement), journées/pointage, coût réel | Lot 2 | Précision montants (E1) | Coût réel calculé (moteur) ; marge réelle | Marge réelle par chantier |
| **4 — Devis & Factures** | Vendre & facturer | Devis versionnés, factures (numérotation légale), échéances | Lot 2-3 | Numérotation, précision | Facture émise immuable + échéance + audit | Cycle devis→facture |
| **5 — Encaissements & Trésorerie** | Encaisser & piloter | Paiements, rapprochement manuel, trésorerie prévisionnelle, marge prévue vs réalisée | Lot 4 | Règles trésorerie | Trésorerie projetée ; alertes seuil | Pilotage financier |
| **6 — Véhicules & Contraventions** | Maîtriser le parc | Parc, échéances, coûts, contraventions (N4 audité) | Lot 0 ; référentiels (E8/E9) | RGPD contraventions | Alertes échéances ; coûts par véhicule ; accès restreint | Parc piloté |
| **7 — Documents (GED)** | Justificatifs | Upload signé, versions, expiration, signature (place réservée) | Lot 0 | Sécurité fichiers | Cycle document + accès signé + audit | Coffre documentaire |
| **8 — Automatisations** | Rendre actif | Files, jobs planifiés, règles déclencheur→action, validation humaine | Lots 1-7 (événements) | Fatigue d'alerte | Automatisations tracées + anti-fatigue | Le système alerte/relance |
| **9 — IA (minimale)** | Copilote | Assistant unique lecture seule, brief IA, RAG (droits), actions proposées validées | Lot 8 ; contrats stables | Coûts IA, sécurité | Sources citées ; officiel intact ; validation | Copilote de confiance |
| **10 — BRN Visite Technique** | Sans ressaisie | Connecteur métré→devis, réconciliation tiers | Lot 4 | Doublons tiers | Métré → devis sans base partagée | Intégration métré |
| **11 — Calendrier Apple** | Agenda unifié | Calendrier interne + stratégie de synchro (section 7) | Lot 1 | Contraintes Apple | Rendez-vous au cockpit, dédoublonnage | Agenda synchronisé |

## M. Registre des risques

| ID | Risque | Prob. | Impact | Niveau | Prévention | Plan de réponse | Responsable (futur) |
|---|---|---|---|---|---|---|---|
| R1 | Fuite de données inter-entreprise | Faible | Très élevé | **Critique** | `org_id` + RLS + tests d'étanchéité, cache/worker tenant-aware | Confinement, révocation, notification RGPD, postmortem | Resp. sécurité |
| R2 | Erreur de calcul financier | Moyenne | Très élevé | **Élevé** | Moteur unique, pur, testé ; rien dans l'UI ; précision unitaire (E1) | Correction + avoir tracé, communication | Lead technique |
| R3 | Perte de données | Faible | Très élevé | **Élevé** | Sauvegardes chiffrées **testées** + hors-site + audit | Restauration, RPO/RTO | Ops |
| R4 | Régression sur l'existant | Moyenne | Élevé | **Élevé** | Tests de non-régression, contrats versionnés, migrations réversibles | Rollback, correctif + test | Lead technique |
| R5 | Dépendance fournisseur (verrou) | Moyenne | Moyen | **Moyen** | Standards ouverts (Postgres/S3/OIDC), domaine indépendant (ports) | Migrer un adaptateur | Lead technique |
| R6 | Coûts IA non maîtrisés | Moyenne | Moyen | **Moyen** | Quotas, timeout, minimisation, cache, IA optionnelle | Réduire/désactiver l'IA (métier continue) | Dirigeant/Lead |
| R7 | Complexité excessive (dérive) | Moyenne | Moyen | **Moyen** | Product P09/F4, revue d'architecture, monolithe modulaire | Simplifier/refuser, ADR | Gardien archi |
| R8 | Import incorrect (corruption) | Moyenne | Élevé | **Élevé** | Aperçu obligatoire, validation, idempotence, passage par le moteur | Annulation d'import, rapport | ADV/Comptable |
| R9 | Synchronisation calendrier défaillante | Élevée | Faible | **Moyen** | Connecteur isolé, lecture seule, dédoublonnage | Mode dégradé (agenda interne) | Lead technique |
| R10 | Sécurité documentaire (fichier malveillant) | Moyenne | Moyen | **Moyen** | Upload signé, quarantaine, hash, antivirus futur | Mise en quarantaine, purge | Ops |
| R11 | Mauvaise adoption utilisateur | Moyenne | Élevé | **Élevé** | UX « 10 secondes », mobile, imports de reprise, livraison par vagues | Formation, ajustements UX | Dirigeant |
| R12 | Démarrage bloqué (décisions non tranchées) | Moyenne | Moyen | **Moyen** | Cette revue + validation des décisions bloquantes | Trancher G1-G5 | Dirigeant |

## N. Matrice de traçabilité

> Vérifie que chaque fonctionnalité importante est **couverte** par les bibles.
> P = Product, BR = Business Rules, D = Data, S = Security, A = Automation, UX =
> UX/UI, API, DEV = Developer. ✔ = couvert.

| Fonctionnalité | P | BR | D | S | A | UX | API | DEV |
|---|---|---|---|---|---|---|---|---|
| Auth & MFA | ✔ | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Multi-entreprise / RLS | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ |
| Cockpit / règle 10 s | ✔ | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ |
| Moteur de priorité | ✔ | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ |
| Marge prévue/réalisée | ✔ | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ |
| Trésorerie | ✔ | ✔ | ✔ | — | ✔ | ✔ | ✔ | ✔ |
| Numérotation légale factures | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Dépenses → coût | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Pointage → coût | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Véhicules & échéances | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Contraventions (N4) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Documents / GED | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Audit | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ |
| Imports | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Exports | ✔ | — | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Automatisations | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| IA copilote / RAG | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| BRN Visite Technique | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ |
| Apple Calendar | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Alertes / anti-fatigue | ✔ | ✔ | ✔ | — | ✔ | ✔ | ✔ | — |
| Espace Dirigeant | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |

**Fonctionnalités partiellement couvertes / à surveiller (orphelines relatives) :**

- **Garanties** (Chantiers) : couvertes en **données** mais **pas de module
  consommateur** en V1 (SAV différé) → traiter en échéances passives (D4).
- **Objectifs** et **Décisions** du dirigeant : présents (Data/UX) mais **peu
  détaillés** côté règles/automatisations → à préciser au lot 1.
- **Notifications** : présentes partout mais **sans chapitre dédié** (canaux/
  préférences) → à détailler au lot 8.
- **Alertes / anti-fatigue** : absentes du seul Developer Bible (implémentation
  implicite) → ajouter une note d'implémentation au lot 8.

> **Aucune** fonctionnalité importante n'est **totalement orpheline** ; les écarts
> ci-dessus sont des **précisions** à apporter au moment du lot concerné, pas des
> trous d'architecture.

## O. Verdict final

> ### ✅ PRÊT SOUS RÉSERVE DE CORRECTIONS MINEURES

Le socle documentaire de *BRN Pilot* est **cohérent, complet, réaliste, sécurisé,
maintenable, adapté à BRN Group, sobre et découpable en lots**. Il **n'y a pas** de
contradiction majeure ni de surarchitecture, et l'ensemble est **prêt pour un
premier lot vertical**.

Les réserves sont **mineures et normales** à ce stade :
1. **Trancher les décisions bloquantes G1-G5** (stack, fournisseurs UE, dépôt,
   périmètre du lot 0, modèle de priorité) — recommandations fournies.
2. **Valider les paramètres métier (I)** — valeurs de départ proposées.
3. **Réconcilier 5 points mineurs (D1-D5)** et compléter quelques manques (E) **au
   moment du lot concerné**.

Aucune de ces réserves ne demande de **revoir l'architecture**. Une fois les
décisions bloquantes validées, **le Lot 0 peut démarrer**.

---

## Fin du document

> **Revue globale du socle — v1.0.** Analyse croisée des 9 documents fondateurs, sans
> code, sans développement. Verdict : **prêt sous réserve de corrections mineures**.
>
> **Prochaine étape (à votre main) :** valider les **décisions bloquantes** (G1-G5)
> et les **paramètres métier** (I), puis lancer le **développement contrôlé du Lot 0**
> sur une branche dédiée, en respectant la Developer Bible.
