# Spec 01 — Schéma de données : `core`, `events`, `audit`, `etudes`

Schéma PostgreSQL **concret** de la Vague 0. Le SQL ci-dessous est une
**référence d'intention** (types, contraintes, index, RLS) : l'outil de migration
et les détails de syntaxe relèvent de l'implémentation, mais **la structure et les
invariants sont normatifs**.

Rappels applicables (voir [`README`](./README.md) § Conventions) : `org_id`
partout, `uuid`, `timestamptz` UTC, `rev` (verrou optimiste), `deleted_at` (soft
delete), `created_by`/`updated_by`, RLS.

---

## 1. Schéma `core` — fondation partagée

### 1.1 Organisation (le tenant)

```sql
create schema core;

create table core.organization (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  siren       text,                       -- identifiant légal FR
  settings    jsonb not null default '{}',-- préférences org (fuseau, devise…)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

`organization` est la **seule** table sans `org_id` (elle *est* l'org). Tout le
reste la référence.

### 1.2 Tiers (party) — identité neutre, plusieurs rôles

Concept pivot (chap. 02 §2) : un tiers, plusieurs rôles, un seul identifiant.

```sql
create table core.party (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references core.organization(id),
  kind        text not null check (kind in ('person','company')),
  -- personne
  first_name  text,
  last_name   text,
  -- entreprise
  company_name text,
  siret        text,
  -- contact
  email       text,
  phone       text,
  address     jsonb not null default '{}', -- {rue, cp, ville, pays}
  notes       text,
  rev         integer not null default 1,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  created_by  uuid,
  updated_by  uuid,
  deleted_at  timestamptz
);

-- rôles joués par un tiers (client, fournisseur, sous-traitant, salarié…)
create table core.party_role (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references core.organization(id),
  party_id    uuid not null references core.party(id),
  role        text not null check (role in
                ('client','prospect','supplier','subcontractor','employee')),
  created_at  timestamptz not null default now(),
  unique (org_id, party_id, role)
);

create index on core.party (org_id) where deleted_at is null;
create index on core.party (org_id, email);
```

> **Pourquoi séparer `party` et `party_role`** : le même tiers peut être client
> *et* fournisseur. On ne duplique pas son identité ; on lui ajoute un rôle
> (chap. 02 §2, le piège « le client existe en 4 exemplaires »).

### 1.3 Utilisateurs & rôles applicatifs

L'authentification est **déléguée** (OIDC, ADR à venir / chap. 05 §1) : `core.user`
ne stocke **pas** de mot de passe, seulement le sujet (`subject`) fourni par le
fournisseur d'identité et le rattachement org + rôles.

```sql
create table core.user (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references core.organization(id),
  subject     text not null,            -- 'sub' OIDC
  email       text not null,
  display_name text not null,
  party_id    uuid references core.party(id), -- si l'user est aussi un salarié
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (org_id, subject)
);

create table core.role_assignment (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references core.organization(id),
  user_id     uuid not null references core.user(id),
  role        text not null,   -- 'direction','conducteur','metreur',… (chap. 05 §2)
  scope       jsonb not null default '{}', -- ABAC : {chantier_ids?, …}
  created_at  timestamptz not null default now(),
  unique (org_id, user_id, role)
);
```

### 1.4 Référentiels partagés

Deux niveaux (chap. 04 §2) : `global` (org_id nul, ex. TVA légale, unités) et
propre à l'org (corps d'état, catalogue). On modélise par un `org_id` **nullable**
ici, exception assumée et **unique** au schéma (référentiels seulement).

```sql
create table core.reference (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid references core.organization(id), -- NULL = global
  domain      text not null,   -- 'unit','vat_rate','trade'(corps d'état),'room_type'
  code        text not null,   -- 'm2','ml','u','elec','cuisine'…
  label       text not null,
  data        jsonb not null default '{}',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  unique (org_id, domain, code)
);
```

> Les catalogues de la v2 (`catalogue.js`, `profils.js`) migrent ici comme
> **données** (P7), en gardant leurs `code` actuels (`elec`, `cuisine`, `m2`…)
> pour la continuité.

### 1.5 Documents (références aux fichiers)

Les binaires vivent en object storage (chap. 04 §6) ; la base porte la référence.

```sql
create table core.document (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references core.organization(id),
  kind        text not null,           -- 'photo','sketch','report_pdf','quote_pdf'…
  storage_key text not null,           -- clé S3 (≈ blobKey de la v2)
  mime        text not null,
  bytes       bigint not null,
  checksum    text not null,           -- empreinte (intégrité, dédup)
  -- rattachement souple : à quoi appartient ce document
  owner_type  text not null,           -- 'study','room','quote'…
  owner_id    uuid not null,
  version     integer not null default 1,
  is_immutable boolean not null default false, -- true = acte émis (devis, facture)
  created_at  timestamptz not null default now(),
  created_by  uuid,
  deleted_at  timestamptz
);

create index on core.document (org_id, owner_type, owner_id) where deleted_at is null;
```

---

## 2. Schéma `events` — journal & Outbox

Colonne vertébrale (P3, chap. 04 §5). **Append-only**.

```sql
create schema events;

create table events.event (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null,
  type           text not null,          -- 'Etude.VisiteClôturée'…
  schema_version integer not null default 1,
  aggregate_type text not null,          -- 'study','party'…
  aggregate_id   uuid not null,
  occurred_at    timestamptz not null default now(),
  actor          jsonb not null,         -- {user_id, via:'web|mobile|automation|connector'}
  correlation_id uuid not null,
  causation_id   uuid,
  payload        jsonb not null,
  -- Outbox : publication fiable
  published_at   timestamptz             -- NULL = pas encore publié
);

create index on events.event (org_id, aggregate_type, aggregate_id, occurred_at);
create index on events.event (published_at) where published_at is null; -- file Outbox
```

**Pattern Outbox** (chap. 04 §5) : un cas d'usage écrit sa donnée métier **et** la
ligne `events.event` dans **la même transaction**. Un processus de publication lit
`where published_at is null`, publie, puis marque `published_at`. Livraison
au-moins-une-fois ; consommateurs idempotents via `event.id`.

> On n'ajoute **jamais** de `UPDATE`/`DELETE` métier sur cette table : l'histoire
> ne se réécrit pas, elle se rejoue.

---

## 3. Schéma `audit` — piste d'audit (conformité)

Distinct des événements métier (chap. 05 §6) : sert la **conformité**, accès plus
restreint, immuable.

```sql
create schema audit;

create table audit.entry (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  at          timestamptz not null default now(),
  user_id     uuid,
  action      text not null,   -- 'party.create','quote.emit','rgpd.export'…
  target_type text not null,
  target_id   uuid,
  ip          inet,
  user_agent  text,
  detail      jsonb not null default '{}'
);

create index on audit.entry (org_id, at);
create index on audit.entry (org_id, target_type, target_id);
```

---

## 4. Schéma `etudes` — le module actuel promu

Fidèle à la structure v2 (`newVisite`/`newRoom`), avec le **relevé fin en JSONB**
(chap. 04 §4) pour ne rien fracturer. Le comportement métier ne change pas
(chap. 11 §4).

### 4.1 Étude (ex-Visite)

```sql
create schema etudes;

create table etudes.study (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references core.organization(id),
  ref          text,                    -- référence lisible (ex. 'BRN-2026-0142')
  status       text not null default 'en_cours'
                 check (status in ('en_cours','cloturee','archivee')),
  -- liens vers les autres contextes (nullable en Vague 0, remplis plus tard)
  client_party_id uuid references core.party(id),
  opportunity_id  uuid,                 -- CRM (Vague 1) — pas de FK dure inter-module
  chantier_id     uuid,                 -- Chantiers (Vague 2)
  -- informations générales (chantier au sens 'site', pas le module Chantiers)
  site         jsonb not null default '{}', -- adresse, ville, cp, dateVisite, metreur,
                                            -- typeBien, occupation, amiante, plomb,
                                            -- demandeClient, contraintes, observations…
  rev          integer not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  created_by   uuid,
  updated_by   uuid,
  deleted_at   timestamptz
);

create index on etudes.study (org_id, status) where deleted_at is null;
create index on etudes.study (org_id, client_party_id);
```

> **Note de nommage** : dans la v2, `chantier` désignait les *informations de
> site* d'une visite. Pour éviter la collision avec le futur module **Chantiers**,
> ce bloc devient `site`. C'est une migration de **nom de champ applicatif**, pas
> de sens — traitée en *expand & contract* (chap. 04 §7.1) côté import.

### 4.2 Pièce / Zone (racine secondaire de l'agrégat étude)

Le relevé d'une pièce est **intrinsèquement variable** selon le profil (intérieur,
cuisine, façade…). On stocke l'ossature en colonnes, le relevé fin en `JSONB`.

```sql
create table etudes.room (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references core.organization(id),
  study_id     uuid not null references etudes.study(id),
  position     integer not null default 0, -- ordre d'affichage
  type_id      text not null,            -- 'cuisine','sdb','facade'… (→ profil dérivé)
  name         text not null,
  level        text,                     -- 'RDC','R+1'…
  -- relevé fin, fidèle à newRoom() de la v2 : zones, ouvertures, murs, sol,
  -- plafond, plinthes, faience, doublages, peinture, elec, facade, cuisine,
  -- travaux, prestations, q, notes, notesInternes, pointsAVerifier…
  survey       jsonb not null default '{}',
  rev          integer not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create index on etudes.room (org_id, study_id, position) where deleted_at is null;
```

> **Le profil métier reste dérivé** de `type_id` (chap. 02 §2, `profils.js`) : il
> n'est **pas** stocké. Une étude ancienne hérite du bon profil sans migration —
> exactement comme en v2.

### 4.3 Ouvrage (pont métré → chiffrage)

L'ouvrage est **dérivé** du relevé par le cœur pur (`ouvragesDeVisite`,
`calcPoste`). En Vague 0, il est **calculé à la demande**, pas persisté comme
vérité (chap. 02 §5, règle 3 « le dérivé ne se stocke pas »). On prévoit toutefois
une table de **projection** pour l'exposition et la reprise Finance (Vague 1),
reconstructible par recalcul :

```sql
create table etudes.ouvrage_projection (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null,
  study_id     uuid not null references etudes.study(id),
  room_id      uuid references etudes.room(id),
  lot          text not null,           -- corps d'état (référentiel 'trade')
  label        text not null,
  quantity     numeric(14,3) not null,
  unit         text not null,           -- 'm2','ml','u','forfait'…
  origin       text not null,           -- 'auto','valide','manuel' (états v2)
  computed_at  timestamptz not null default now()
  -- pas de rev : projection reconstructible, jamais éditée directement
);

create index on etudes.ouvrage_projection (org_id, study_id);
```

> Distinction clé (leçon du bug v2.2.1) : la **vérité** est le relevé + le catalogue
> vivant ; l'ouvrage est **recalculé**. La projection n'est qu'un cache de lecture,
> régénéré à chaque `Etude.MétréChiffréPrêt`. On ne lit jamais un agrégat figé.

---

## 5. Sécurité au niveau ligne (RLS) — l'étanchéité multi-tenant

Défense en profondeur (ADR-0004, chap. 05 §2). Activée sur **toutes** les tables
portant `org_id`. Modèle (à répliquer par table) :

```sql
alter table core.party enable row level security;

-- l'org courante est injectée par la couche d'accès en début de transaction :
--   set local app.org_id = '<uuid>';
create policy party_isolation on core.party
  using      (org_id = current_setting('app.org_id')::uuid)
  with check (org_id = current_setting('app.org_id')::uuid);
```

- La couche d'accès pose `app.org_id` (et `app.user_id`) **à chaque transaction**,
  jamais l'appelant applicatif.
- Même une requête fautive ne peut lire/écrire hors de son organisation.
- **Rôles PostgreSQL par module** (chap. 04 §3) : le rôle du module `etudes` n'a
  aucun droit sur les tables `finance.*` — le cloisonnement P2 devient **physique**,
  pas seulement conventionnel.

---

## 6. Import des données v2 (sans perte)

La v2 est locale (IndexedDB). L'import (Vague 0, étape B — chap. 11 §3) applique
la **migration douce** existante, côté serveur :

1. Export du contenu IndexedDB (visites + blobs) depuis l'appareil.
2. `migrerVisite`/`migrerRoom` (déjà idempotents) complètent les champs manquants
   **sans réécriture destructive**.
3. Mapping : `visite → etudes.study` (`chantier` → `site`), `rooms[] →
   etudes.room` (le sous-arbre entier → `survey` JSONB), blobs → object storage +
   `core.document`.
4. Chaque import émet `Etude.Importée` (traçabilité), et une entrée `audit.entry`.
5. **Rejouable** : réimporter la même visite ne crée pas de doublon (clé
   d'idempotence = identifiant v2 conservé en métadonnée).

> Invariant P1 vérifié : aucune donnée v2 n'est modifiée dans sa signification ;
> les quantités et règles restent identiques (gelées par les tests du cœur pur,
> chap. 10 §4).

---

## 7. Récapitulatif des invariants de ce schéma

| Invariant | Où | Principe |
|---|---|---|
| `org_id` + RLS partout | §1–§4, §5 | ADR-0004 |
| Verrou optimiste `rev` sur les agrégats | `party`, `study`, `room` | chap. 04 §8 |
| Soft delete `deleted_at` | tables métier | chap. 04 §8 |
| Journal append-only + Outbox transactionnel | `events.event` | chap. 04 §5 |
| Audit immuable séparé | `audit.entry` | chap. 05 §6 |
| Relevé fin en JSONB, ossature en colonnes | `study.site`, `room.survey` | chap. 04 §4 |
| Profil dérivé, jamais stocké | `room.type_id` | chap. 02 §2 |
| Dérivé recalculé, pas figé | `ouvrage_projection` | chap. 02 §5 |
| Cloisonnement physique par rôle DB | §5 | ADR-0005 |
