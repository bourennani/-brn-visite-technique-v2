# 09 — Mobile & hors-ligne (local-first)

Le terrain est la réalité de BRN Group : chantiers, sous-sols, façades, zones sans
réseau. L'exigence **local-first** (P4) n'est pas un confort, c'est une condition
de survie de l'outil sur le terrain. Ce chapitre en fixe la stratégie.

## 1. Stratégie multi-clients

| Client | Public | Techno | Priorité hors-ligne |
|---|---|---|---|
| **PWA web** | Bureau, direction, ADV, tablette chantier | React/Vite (continuité v2) | Moyenne (bureau surtout connecté). |
| **App mobile** | Métreur, chef de chantier, technicien SAV | **PWA d'abord**, natif si besoin matériel | **Maximale**. |
| **Portail client** | Clients | Web | Faible (connecté). |

### PWA d'abord, natif ensuite

- La **PWA** couvre déjà l'essentiel du terrain (la v2 le prouve : installable iOS,
  hors-ligne, appareil photo, IndexedDB). On la **garde et on l'étend**.
- On passe au **natif** (React Native / Capacitor, pour **réutiliser** le socle
  React/TS et le domaine pur) **uniquement** si un besoin matériel l'exige :
  scan de codes-barres intensif (Stock), photo avancée, capteurs, notifications
  push riches, arrière-plan. C'est un ADR, pas un réflexe.

## 2. Le patron local-first

```
   Interface  ─── lit/écrit ──▶  CACHE LOCAL (IndexedDB)  ── instantané, hors-ligne
                                        │
                                 File de mutations (datées, attribuées, en attente)
                                        │  au retour du réseau
                                        ▼
                                MOTEUR DE SYNCHRONISATION  ◀── bidirectionnel ──▶  Serveur
```

Règles :

1. **L'interface ne parle qu'au cache local.** Aucune action utilisateur n'attend
   le réseau. La perception est **instantanée** (qualité 6, chap. 00 §2).
2. **Chaque écriture locale produit une mutation** : quoi, quel agrégat, quelle
   version de base (`rev`), qui, quand.
3. **Le moteur de synchronisation** rejoue la file vers le serveur dès que possible,
   et récupère les changements survenus ailleurs.
4. **Le serveur reste la vérité** (chap. 04 §1) : le local est un cache
   reconstructible.

## 3. Périmètre synchronisé (ne pas tout charger)

Un appareil ne charge **pas tout l'ERP** : seulement **son périmètre pertinent**,
défini par le rôle et l'affectation (ABAC, chap. 05 §2) :

- Métreur : ses visites/études en cours et à venir + référentiels.
- Chef de chantier : ses chantiers + planning + équipes + stock alloué.
- Technicien SAV : ses tickets + chantiers concernés + garanties.

Cela borne le volume local (crucial sur mobile) et **limite l'exposition** en cas
de perte d'appareil (chap. 05 §1).

## 4. Résolution de conflits (le cœur du sujet)

Deux personnes (ou une personne sur deux appareils) modifient la même donnée hors
ligne : il faut une stratégie **explicite**, choisie **par type de donnée**.

| Type de donnée | Stratégie | Justification |
|---|---|---|
| **Champs indépendants d'un même agrégat** (ex. notes vs métré d'une pièce) | **Fusion par champ** | Deux champs différents ne sont pas en conflit. |
| **Ajout d'éléments à une collection** (photos, pièces, lignes) | **Union** (les deux ajouts survivent) | Un ajout ne doit jamais en effacer un autre — c'est déjà l'esprit v2 : « une saisie ne disparaît jamais en silence ». |
| **Même champ, deux valeurs concurrentes** | **Dernier écrivain gagne + trace du perdant** | Simple, mais on **conserve** la valeur écartée dans l'audit, jamais de perte silencieuse. |
| **Donnée engageante** (montant validé, situation, paie) | **Verrou optimiste : refus + résolution manuelle** | On ne fusionne jamais automatiquement de l'argent. |

Mécanisme technique : **contrôle de concurrence optimiste** par version d'agrégat
(`rev`, chap. 04 §8). Une mutation basée sur une version périmée est **signalée**,
pas écrasée. L'utilisateur voit un écran de réconciliation clair — dans l'esprit
des « avertissements, jamais blocage » de la v2.

## 5. Cycle de vie du cache & fiabilité

- **Purge à la déconnexion / révocation** de l'appareil (sécurité, chap. 05 §4).
- **Attention iOS** (déjà documentée en v2) : le système peut purger le stockage
  d'une PWA peu utilisée. Tant que la synchronisation serveur n'est pas garantie,
  l'app **alerte** et incite à synchroniser ; une fois le serveur en place, la
  perte du cache local est **sans conséquence** (le serveur a tout).
- **Mise à jour applicative** sans interrompre une saisie (déjà le cas v2 :
  `registerType: "autoUpdate"`, application au retour au premier plan). On
  généralise : **jamais** de mise à jour destructive pendant une saisie terrain.
- **Photos/médias** : compression à la capture (déjà `compressImage` en v2),
  envoi différé et résumable (une photo de 12 Mo ne bloque pas la synchro d'un
  métré).

## 6. Continuité avec la v2

La v2 **est déjà** une application local-first réussie. La cible ne la remplace
pas : elle **ajoute la moitié manquante** (le serveur et la synchronisation
bidirectionnelle) **sans rien retirer** de ce qui marche :

| Acquis v2 | Devenir cible |
|---|---|
| IndexedDB + repli mémoire | Cache local du patron local-first. |
| `Store` (adaptateur) | Gagne un adaptateur de **synchronisation** vers le serveur. |
| Service worker / hors-ligne | Conservé, étendu au périmètre synchronisé. |
| Compression photo | Conservée, complétée par l'envoi différé. |
| « Une saisie ne disparaît jamais » | Devient la règle d'union/fusion de conflits (§4). |

C'est l'illustration parfaite de l'invariant P1 : **on capitalise sur l'existant,
on ne le refait pas.**
