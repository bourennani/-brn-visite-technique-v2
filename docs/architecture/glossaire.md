# Glossaire — Langage ubiquitaire

Le vocabulaire partagé de tout le projet. **Un terme = un sens.** Un nouveau terme
métier s'ajoute ici **avant** d'entrer dans le code. Deux catégories : métier
(bâtiment / ERP) et technique (architecture).

## Termes métier (bâtiment & ERP)

| Terme | Définition |
|---|---|
| **Tiers (party)** | Personne physique ou morale, neutre, pouvant jouer plusieurs rôles (client, fournisseur, sous-traitant, salarié). Un seul identifiant par tiers. |
| **Compte** | Le tiers vu comme relation commerciale (CRM). |
| **Opportunité / Affaire** | Demande de travaux potentielle, avec un cycle de vie commercial. |
| **Visite technique** | Déplacement de relevé sur site, à l'origine de l'étude. |
| **Étude** | Dossier issu de la visite : relevé, métré, ouvrages. (Ex-« Visite » de la v2.) |
| **Pièce / Zone** | Unité de relevé d'une étude (une pièce intérieure, une façade, une cour…). |
| **Profil métier** | Configuration (dérivée du type de pièce) qui pilote l'interface et les règles de métré. |
| **Métré** | Mesure des quantités (surfaces, longueurs, unités). |
| **Métré net** | Quantité après déduction des ouvertures et zones non traitées. |
| **Lot / Corps d'état** | Famille de travaux (maçonnerie, plâtrerie, électricité, peinture…). |
| **Ouvrage / Poste** | Ligne de travail chiffrable, rattachée à un lot. « Ouvrage » côté chiffrage, « poste » côté travaux : même objet, deux angles. |
| **Marge (métré)** | Marge d'approvisionnement matière, appliquée au métré. |
| **Marge (poste)** | Marge sur la quantité retenue d'un poste. **Ne se cumule jamais** avec la marge métré. |
| **Devis** | Ensemble d'ouvrages chiffrés, versionné, avec cycle (brouillon → envoyé → accepté/refusé). |
| **Situation de travaux** | Facturation intermédiaire d'un chantier à l'avancement. |
| **Chantier** | Réalisation d'un devis accepté : planning, avancement, coûts, réception. |
| **Avancement** | Degré de réalisation d'un chantier, par lot/ouvrage. |
| **Coût réel** | Somme des heures (RH) + achats + sorties de stock + sous-traitance imputés à un chantier. |
| **Marge prévue vs réalisée** | Écart entre le budget (métré chiffré) et le coût réel. Indicateur de pilotage central. |
| **Réception** | Acte de fin de chantier ; ouvre les périodes de garantie. |
| **Réserve** | Défaut constaté à la réception, à lever. |
| **Garantie (parfait achèvement / biennale / décennale)** | Périodes de responsabilité post-réception qui pilotent le SAV. |
| **Ticket SAV** | Demande après réception, rattachée à un chantier/ouvrage. |
| **Contrat de maintenance** | Engagement d'interventions préventives récurrentes. |
| **Pointage** | Enregistrement des heures d'un salarié sur un chantier. |
| **Mouvement de stock** | Entrée/sortie/réservation d'un article. |

## Termes techniques (architecture)

| Terme | Définition |
|---|---|
| **Contexte délimité (bounded context)** | Zone où un terme métier a un seul sens ; frontière d'un module. |
| **Agrégat** | Groupe d'objets modifiés ensemble, gardé cohérent par une racine. |
| **Racine d'agrégat** | Le seul point d'entrée pour modifier un agrégat. |
| **Langage ubiquitaire** | Vocabulaire métier partagé par le code, la doc et les équipes (ce glossaire). |
| **Événement de domaine** | Fait métier accompli, immuable, horodaté, attribué. |
| **Outbox** | Pattern garantissant qu'un événement écrit avec sa donnée est bien publié. |
| **Contrat** | Interface publique (API + schéma) par laquelle deux parties se parlent. |
| **Monolithe modulaire** | Un déployable, des modules cloisonnés en interne, prêts à être extraits. |
| **Architecture hexagonale (ports & adaptateurs)** | Cœur métier pur isolé de l'I/O par des interfaces. |
| **Cœur métier pur** | Fonctions déterministes sans effet de bord (calc, marges, chiffrage). |
| **Local-first** | L'interface travaille sur un cache local ; la synchro est différée. |
| **Migration douce** | Compléter une donnée ancienne à la lecture, sans réécriture destructive. |
| **Expand & contract** | Migration en trois temps (ajouter, migrer, retirer) sans rupture. |
| **Multi-tenant** | Plusieurs organisations isolées (`org_id`) dans un même système. |
| **RBAC / ABAC** | Autorisation par rôle / par attributs. |
| **Verrou optimiste** | Refus d'une écriture basée sur une version périmée, au lieu d'écraser. |
| **Projection de lecture** | Vue dérivée (agrégée) reconstructible par rejeu des événements. |
| **Connecteur (anti-corruption)** | Adaptateur isolant le cœur d'un partenaire externe instable. |
| **ADR** | Architecture Decision Record : décision structurante écrite et immuable. |
| **Correlation / Causation Id** | Identifiants reliant une chaîne d'événements d'un même parcours. |
| **RPO / RTO** | Perte de données maximale acceptable / temps de remise en service visé. |
