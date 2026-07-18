# Spec 02 — Contrats d'API `/v1` (Vague 0)

Les contrats **avant** le code (P5, chap. 06 §1). REST versionné `/v1`, décrit ici
en intention ; la source formelle est le document **OpenAPI** du dépôt (à générer
depuis ces contrats). **Ce document est normatif** pour les formes de requête /
réponse, les codes d'erreur et l'enveloppe d'événement.

## 0. Conventions transverses de l'API

- **Base** : `https://<hôte>/v1`. Une rupture incompatible ⇒ `/v2`, `/v1` reste
  (P1, chap. 06 §1).
- **Authentification** : jeton porteur OIDC dans `Authorization: Bearer <jwt>`.
  Le jeton porte `sub`, `org_id`, rôles. Le serveur en **dérive** le contexte ; le
  client ne choisit jamais son `org_id` (ADR-0004).
- **Format** : JSON UTF-8. Dates ISO 8601 UTC. Montants et quantités en nombres
  décimaux (jamais de flottant pour l'argent côté persistance).
- **Identifiants exposés** préfixés : `party_…`, `study_…`, `room_…`, `evt_…`.
- **Verrou optimiste** : toute mise à jour envoie `If-Match: "<rev>"` (ou champ
  `rev` dans le corps). `rev` obsolète ⇒ `409 Conflict` (chap. 04 §8).
- **Idempotence** des écritures sensibles : en-tête `Idempotency-Key: <uuid>` ;
  rejouer la même clé renvoie le résultat initial, sans double effet (terrain,
  chap. 06 §1).
- **Pagination** : `?limit=&cursor=` (curseur opaque), jamais d'offset profond.
- **Autorisation** : vérifiée **côté serveur** au cas d'usage (chap. 05 §2). Un
  `403` ne divulgue pas l'existence d'une ressource hors périmètre.

### Forme d'erreur unique

```json
{
  "error": {
    "code": "conflict",              // 'validation'|'unauthorized'|'forbidden'
                                     // |'not_found'|'conflict'|'rate_limited'|'internal'
    "message": "La révision fournie est périmée.",
    "details": [{ "field": "rev", "issue": "stale" }],
    "correlation_id": "corr_…"       // à fournir au support / retrouvable dans les logs
  }
}
```

| Code HTTP | `error.code` | Sens |
|---|---|---|
| 400 | `validation` | Entrée invalide (schéma partagé, chap. 01 §7). |
| 401 | `unauthorized` | Jeton absent/invalide. |
| 403 | `forbidden` | Authentifié mais hors périmètre RBAC/ABAC. |
| 404 | `not_found` | Ressource absente **ou** hors périmètre (non divulgation). |
| 409 | `conflict` | `rev` périmée (verrou optimiste). |
| 422 | `validation` | Règle métier violée (ex. quantité ≤ 0, cf. `qValider`). |
| 429 | `rate_limited` | Débit dépassé (passerelle, chap. 05 §7). |

---

## 1. Contexte de session

```
GET /v1/me
```

Renvoie l'utilisateur courant, son org et ses rôles/scopes (pour que le front
**masque** ce qui n'est pas autorisé — le serveur, lui, **interdit**).

```json
{
  "user":  { "id": "user_…", "displayName": "…", "email": "…" },
  "org":   { "id": "org_…", "name": "BRN Group" },
  "roles": ["metreur"],
  "scope": { "chantier_ids": [] }
}
```

---

## 2. Tiers (`core.party`)

```
GET    /v1/parties?role=client&q=<recherche>&limit=&cursor=
POST   /v1/parties
GET    /v1/parties/{id}
PATCH  /v1/parties/{id}          (If-Match: rev)
DELETE /v1/parties/{id}          (soft delete + événement)
POST   /v1/parties/{id}/roles    { "role": "supplier" }
```

`POST /v1/parties` (personne ou entreprise) :

```json
// requête
{ "kind": "company", "companyName": "Dupont SARL", "email": "contact@…",
  "phone": "+33…", "address": { "rue": "…", "cp": "93140", "ville": "Bondy" },
  "roles": ["client"] }

// réponse 201
{ "id": "party_…", "rev": 1, "kind": "company", "companyName": "Dupont SARL",
  "roles": ["client"], "createdAt": "2026-07-18T09:00:00Z" }
```

Émet `Party.Créé`. Toute mutation émet l'événement correspondant et une entrée
d'audit (chap. 05 §6).

---

## 3. Études (`etudes.study` + `etudes.room`)

Le cœur de la Vague 0 : l'ex-Visite v2, servie par contrat.

### 3.1 Cycle d'une étude

```
GET    /v1/studies?status=&q=&limit=&cursor=
POST   /v1/studies
GET    /v1/studies/{id}                 (avec ?include=rooms)
PATCH  /v1/studies/{id}                  (If-Match: rev) — infos générales (site)
POST   /v1/studies/{id}/close            → status 'cloturee' + Etude.VisiteClôturée
DELETE /v1/studies/{id}                  (soft delete)
```

`POST /v1/studies` crée une étude vide (équivalent `newVisite`) :

```json
// réponse 201
{ "id": "study_…", "rev": 1, "status": "en_cours",
  "clientPartyId": null, "site": {}, "rooms": [], "createdAt": "…" }
```

`GET /v1/studies/{id}?include=rooms` renvoie l'agrégat complet. Le champ `site`
et chaque `room.survey` sont les **structures JSONB fidèles à la v2** — le front
v2 les consomme sans transformation de sens.

### 3.2 Pièces / zones

```
POST   /v1/studies/{id}/rooms            { "typeId": "cuisine", "name": "Cuisine" }
PATCH  /v1/rooms/{roomId}                (If-Match: rev) — met à jour survey/name/level
DELETE /v1/rooms/{roomId}                (soft delete)
POST   /v1/studies/{id}/rooms/reorder    { "order": ["room_…","room_…"] }
```

`PATCH /v1/rooms/{roomId}` accepte une mise à jour **partielle** du relevé :

```json
// requête (extrait) — le sous-arbre survey suit exactement newRoom()
{ "rev": 3,
  "survey": { "sol": { "revetement": "Carrelage", "marge": 10 },
              "travaux": { "so_carrelage": { "mode": "valide", "val": 24.2, "snap": 22 } } } }
```

> **Le serveur ne recalcule pas le métier à la place du client en Vague 0** : il
> **persiste** le relevé et **rejoue** le cœur pur (identique) pour (a) valider les
> invariants (`qValider` : refuse quantité ≤ 0 ⇒ `422`) et (b) régénérer
> `ouvrage_projection`. Même code des deux côtés (ADR-0006) ⇒ zéro divergence.

### 3.3 Ouvrages (dérivés, lecture seule)

```
GET /v1/studies/{id}/ouvrages
```

Renvoie la projection recalculée (jamais un agrégat figé — leçon v2.2.1) :

```json
{ "computedAt": "…",
  "ouvrages": [
    { "roomId": "room_…", "lot": "sols", "label": "Fourniture et pose de carrelage",
      "quantity": 24.2, "unit": "m2", "origin": "valide" }
  ] }
```

`POST /v1/studies/{id}/close` fige l'étude et émet `Etude.VisiteClôturée` puis
`Etude.MétréChiffréPrêt` (que la Finance écoutera en Vague 1) — les modules aval
se branchent **sans** que le module Études les connaisse (P2, ADR-0005).

---

## 4. Documents & médias

Envoi en deux temps (le binaire ne transite pas par l'API JSON) :

```
POST /v1/documents/upload-url
  { "kind":"photo","mime":"image/jpeg","bytes":812345,"ownerType":"room","ownerId":"room_…" }
  → { "documentId":"doc_…","uploadUrl":"https://s3/…","method":"PUT" }
PUT  <uploadUrl>            (le client téléverse directement vers l'object storage)
POST /v1/documents/{id}/commit   (confirme, enregistre checksum) → Document.Versionné
GET  /v1/documents/{id}          (métadonnées)
GET  /v1/documents/{id}/content  (URL signée temporaire)
```

- Compression à la capture **côté client** (déjà `compressImage`, v2) : l'API
  reçoit un binaire déjà normalisé.
- Un document `isImmutable` (devis/facture émis) refuse toute réécriture (`409`) —
  valeur juridique (chap. 04 §6).

---

## 5. Synchronisation local-first

Cœur de l'ADR-0003. Deux endpoints, une file de mutations idempotente.

### 5.1 Poussée des mutations locales

```
POST /v1/sync/push
```

```json
{ "deviceId": "dev_…",
  "mutations": [
    { "id":"mut_…", "at":"…", "op":"room.update", "aggregateId":"room_…",
      "baseRev":3, "patch":{ "survey": { … } } },
    { "id":"mut_…", "at":"…", "op":"study.create", "aggregateId":"study_…",
      "data":{ … } }
  ] }
```

- Chaque mutation porte son `id` (idempotence : rejouer ne duplique pas) et la
  `baseRev` de l'agrégat.
- Réponse **par mutation** — le serveur ne rejette jamais tout le lot pour un
  conflit isolé :

```json
{ "results": [
    { "id":"mut_…", "status":"applied",  "newRev":4 },
    { "id":"mut_…", "status":"conflict", "current": { "rev":5, "aggregate": { … } } }
  ] }
```

- `conflict` renvoie l'état serveur courant ; le client applique la stratégie de
  résolution **par type de donnée** (chap. 09 §4 : union des ajouts, fusion par
  champ, dernier écrivain + trace, refus manuel sur données engageantes).

### 5.2 Tirage des changements distants

```
GET /v1/sync/pull?since=<curseur>&scope=mine
```

Renvoie les agrégats du **périmètre de l'appareil** (rôle + affectation, chap. 09
§3) modifiés depuis le curseur, plus un nouveau curseur. Synchronisation
**bidirectionnelle**, volume **borné**.

> Le serveur reste la vérité durable ; `sync/*` réconcilie le cache local
> (IndexedDB) reconstructible. Un métreur hors-ligne accumule des mutations et les
> pousse au retour du réseau, sans rien perdre.

---

## 6. Enveloppe d'événement (contrat de publication)

Tout événement publié respecte l'enveloppe (chap. 06 §3), stable dans le temps.
C'est le contrat que **tout** consommateur (autres modules, IA, connecteurs,
automatisations) peut lire :

```json
{
  "id": "evt_…",
  "type": "Etude.MétréChiffréPrêt",
  "version": 1,
  "org_id": "org_…",
  "occurredAt": "2026-07-18T09:12:00Z",
  "actor": { "userId": "user_…", "via": "web" },
  "aggregateId": "study_…",
  "correlationId": "corr_…",
  "causationId": "evt_…",
  "payload": { "studyId": "study_…", "ouvrageCount": 37 }
}
```

Règles de compatibilité (P1) :

- Un événement évolue **par ajout** de champs ; les consommateurs **tolèrent** les
  champs inconnus.
- Une évolution incompatible **incrémente `version`** et coexiste avec l'ancienne.
- Un type d'événement publié **ne disparaît jamais** silencieusement.

---

## 7. Ce que ces contrats garantissent

| Garantie | Mécanisme |
|---|---|
| Le front v2 fonctionne **à l'identique** | `study.site` / `room.survey` = structures JSONB fidèles à la v2. |
| Aucune perte terrain | `sync/push` idempotent + résolution de conflits par type. |
| Aucune régression métier | Recalcul serveur par le **même cœur pur** (ADR-0006), invariants `qValider`. |
| Extensible sans casser | Modules aval branchés par **événements**, pas par appel direct (ADR-0005). |
| Traçable | Chaque mutation ⇒ événement + audit ; `correlationId` relie le parcours. |
| Sûr | `org_id` dérivé du jeton, autorisation serveur, non-divulgation en `404`. |
