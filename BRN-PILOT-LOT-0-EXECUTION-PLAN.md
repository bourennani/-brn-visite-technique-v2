# BRN PILOT — PLAN D'EXÉCUTION DU LOT 0 (FONDATIONS) — VERSION 1.0

> **Nature du document.** Plan **précis et validable** du **Lot 0** (fondations),
> à approuver **avant** toute création de dépôt et toute écriture de code.
>
> **Aucun code n'est écrit. Aucun dépôt n'est créé. Aucune fonctionnalité métier.**
> Ce document décrit **ce qui sera fait**, dans quel ordre, et **comment on vérifie**
> que c'est fait (mapping vers les 12 critères d'acceptation).
>
> **Base validée** (décisions G1–G4 de la revue globale) :
> - Stack : **Next.js + TypeScript strict** (Vercel) · **PostgreSQL** · **Drizzle**.
> - Plateforme managée consolidée : **Supabase** (Postgres + Auth + Storage + RLS +
>   pgvector), **région UE**, **derrière des ports** (remplaçable sans réécrire le
>   métier).
> - Asynchrone : **pg-boss** + **worker persistant séparé** (UE, type Railway/Render)
>   — **hors périmètre du Lot 0** (voir §9), réservé pour le lot Automatisations.
> - Nouveau dépôt **`brn-pilot`** séparé ; les 9 documents fondateurs copiés dans
>   `docs/`.
>
> **Statut :** proposition — **en attente de validation**. Le Lot 0 ne démarre
> qu'après votre feu vert.

---

## 1. Objet & périmètre du Lot 0

Le Lot 0 **prouve que les fondations tiennent** (sécurité, multi-entreprise, audit,
CI, environnements, UX de base) **avant** tout module métier. Il ne contient **aucune
valeur financière réelle, aucune IA, aucune intégration externe**.

**Inclus (validé — revue globale, partie K) :** dépôt séparé, structure, qualité +
CI, authentification (OIDC via Supabase, MFA direction), entreprise (tenant +
RLS), utilisateur dirigeant, rôles & permissions de base, PostgreSQL (schéma socle)
+ migrations, journal d'audit, **coque de navigation**, **cockpit connecté en
données de démonstration clairement identifiées**, **responsive**, **mode
clair/sombre**, environnements **local + preview**.

**Exclu (confirmé) :** aucun calcul financier complet ; aucune IA réelle ; aucune
connexion bancaire ; aucune synchronisation Apple Calendar ; aucun worker
asynchrone ; **aucune donnée réelle de BRN Group**.

## 2. Stack finalisée du Lot 0 (rappel)

| Couche | Choix | Note |
|---|---|---|
| Application web | **Next.js (App Router) + TypeScript strict** sur **Vercel** | Rendu + BFF. |
| Style | **Tailwind + jetons de design** (UX/UI Bible) | Clair/sombre via jetons. |
| Validation | **Zod** (schémas partagés) | Frontières validées. |
| Base | **PostgreSQL (Supabase)** + **RLS** | Région UE. |
| Accès données | **Drizzle** (+ migrations versionnées) | SQL-first, typé. |
| Auth | **Supabase Auth (OIDC/MFA)** **derrière un port** | Remplaçable. |
| Stockage | **Supabase Storage** **derrière un port** | Non utilisé au Lot 0 (port réservé). |
| pgvector | **Prévu** (extension), **non utilisé** au Lot 0 | Pour le RAG (futur). |
| Domaine | **TypeScript pur, sans dépendance** à Next.js/Supabase/Drizzle/Vercel | Ports & adaptateurs. |
| Tests | **Vitest** (+ Playwright plus tard) | Continuité. |
| CI | **GitHub Actions** (ou équivalent) | Portes bloquantes. |

## 3. Décisions à consigner en ADR (dans le nouveau dépôt `docs/adr/`)

| ADR | Décision |
|---|---|
| ADR-0001 | Monolithe modulaire Next.js, un seul dépôt. |
| ADR-0002 | PostgreSQL (Supabase) comme système de vérité ; RLS multi-tenant. |
| ADR-0003 | Supabase comme plateforme consolidée **derrière des ports** (Auth/Storage remplaçables). |
| ADR-0004 | Drizzle comme couche d'accès aux données. |
| ADR-0005 | Domaine pur indépendant des frameworks/fournisseurs. |
| ADR-0006 | Asynchrone via pg-boss + worker séparé (UE), hors Lot 0. |
| ADR-0007 | Hébergement : app sur Vercel, worker sur plateforme UE (Railway/Render). |

## 4. Arborescence du dépôt (Lot 0)

> Conforme à la Developer Bible §3, adaptée à Next.js + Supabase + Drizzle. Les
> dossiers vides au Lot 0 sont **réservés** (marqués « futur »).

```
brn-pilot/
  app/                         # Next.js App Router — PRÉSENTATION (aucune règle métier)
    (auth)/                    # écrans de connexion
    (app)/                     # coque authentifiée : layout + navigation
      cockpit/                 # cockpit (données DÉMONSTRATION au Lot 0)
    api/v1/                    # Route Handlers (BFF) : /me, /session…
  src/
    ui/                        # composants du design system (jetons, thème clair/sombre)
    core/                      # socle transverse : types, résultat, erreurs, temps
    modules/
      organization/            # Entreprise (org, paramètres)
      users/                   # Utilisateurs, rôles, permissions
      audit/                   # Journal d'audit
      dirigeant/               # Espace Dirigeant (coquille au Lot 0)
    services/
      auth/                    # AuthPort + SupabaseAuthAdapter
      storage/                 # StoragePort + SupabaseStorageAdapter (réservé, non utilisé)
    db/                        # client Drizzle, contexte tenant, RLS
    db/migrations/             # migrations versionnées (schéma socle)
    validation/                # schémas Zod partagés
    types/                     # types transverses
    workers/                   # RÉSERVÉ (futur) — vide au Lot 0
    integrations/              # RÉSERVÉ (futur) — vide au Lot 0
    ai/                        # RÉSERVÉ (futur) — vide au Lot 0
  tests/                       # Vitest : domaine, intégration, étanchéité tenant
  docs/                        # les 9 documents fondateurs + adr/ + ce plan
  scripts/                     # seed de démonstration (données marquées DÉMO)
  config/                      # lint, format, tsconfig, CI, .env.example
```

> **Règle appliquée dès le départ :** aucune logique métier dans `app/` ni `src/ui/`
> (Developer Bible DEV-REPO-03).

## 5. Tâches ordonnées (par phases)

> Chaque tâche `T0.x` est **petite et vérifiable**. Progression par **étapes
> validées**. Les identifiants `L0-AC-xx` renvoient aux critères d'acceptation (§6).

### Phase A — Dépôt & structure
- **T0.1** Créer le dépôt **privé `brn-pilot`** (propriétaire `bourennani`). → L0-AC-01
- **T0.2** Copier les **9 documents fondateurs** dans `docs/` + créer `docs/adr/`
  (ADR-0001…0007). → L0-AC-01
- **T0.3** Initialiser Next.js + TypeScript strict + Tailwind ; poser l'**arborescence**
  (§4) avec dossiers réservés. → L0-AC-01

### Phase B — Qualité & CI
- **T0.4** Configurer **formatage, lint, typage strict**, règles d'imports (pas de
  cycle), **détection de secrets**. → L0-AC-02
- **T0.5** Configurer **Vitest** (test d'exemple : étanchéité tenant à venir en C). → L0-AC-02
- **T0.6** Pipeline **CI** (installation reproductible → lint → typage → tests →
  détection de secrets → build → **preview**). **Bloquant** en cas d'échec. → L0-AC-02

### Phase C — Base de données & multi-entreprise
- **T0.7** Provisionner **Supabase** (Postgres, **région UE**) ; connexion **Drizzle**
  via le **pooler** (compatible serverless). → L0-AC-09
- **T0.8** **Schéma socle** (migrations Drizzle) : `organization`, `user`, `role`,
  `role_assignment`, `audit_entry` — avec `org_id`, `created_at`, `updated_at`,
  `revision`, `deleted_at` (Data Bible A4). → L0-AC-04
- **T0.9** **RLS** activée sur toutes les tables portant `org_id` ; **contexte tenant**
  posé par la couche d'accès (défense en profondeur : filtrage applicatif **+** RLS).
  *(Détail à finaliser : `org_id` en claim JWT Supabase vs contexte serveur — décidé
  en début de phase C.)* → L0-AC-04
- **T0.10** **Test d'étanchéité** multi-entreprise (deux organisations, aucune fuite). → L0-AC-04

### Phase D — Authentification
- **T0.11** Définir **`AuthPort`** (interface) ; implémenter **`SupabaseAuthAdapter`**
  (OIDC, session). Le domaine/app ne dépend que du port. → L0-AC-03
- **T0.12** **MFA obligatoire** pour le rôle Direction ; sessions limitées,
  **révocation**. → L0-AC-03
- **T0.13** **Contexte de session** serveur : dérive `org_id` + rôles du jeton (jamais
  du client). → L0-AC-03 / L0-AC-04

### Phase E — Domaine socle (pur)
- **T0.14** Entités et règles **pures** : Organisation, Utilisateur, Rôle,
  Permission, Entrée d'audit — **sans I/O**, testées (Vitest). → L0-AC-05
- **T0.15** Rôles & **permissions de base** ; **Espace Dirigeant strictement privé**
  (accès Direction uniquement). → L0-AC-05

### Phase F — API socle
- **T0.16** `GET /api/v1/me` (contexte utilisateur : org, rôles, périmètre) ;
  enveloppe de réponse/erreur standard (API Bible §7). **Contrôle serveur
  systématique** (auth + org + rôle). → L0-AC-03 / L0-AC-11

### Phase G — Interface (coque + cockpit démo)
- **T0.17** **Jetons de design** (couleurs, espacements, typo) + **thème clair/sombre**
  (parité de sens). → L0-AC-08
- **T0.18** **Coque de navigation** (latérale bureau / basse mobile) selon UX/UI Bible ;
  **responsive** (bureau/tablette/mobile). → L0-AC-08
- **T0.19** **Cockpit** affichant des **données de DÉMONSTRATION clairement
  identifiées** (bandeau « DONNÉES DE DÉMONSTRATION »), authentifié et tenant-aware,
  **sans aucun calcul officiel** dans l'interface. → L0-AC-07 / L0-AC-11
- **T0.20** États de base (chargement/vide/erreur) selon UX/UI Bible F5. → L0-AC-11

### Phase H — Journal d'audit
- **T0.21** **Écriture d'audit** sur les actions engageantes du socle (connexion,
  changement de rôle) ; **lecture restreinte** (Direction). → L0-AC-06

### Phase I — Environnements & secrets
- **T0.22** **Local** (`.env.example` sans valeur réelle ; validation des variables au
  démarrage) + **Preview** (par branche). **Secrets isolés**, **région UE** ; aucune
  variable sensible en `NEXT_PUBLIC_`. → L0-AC-09

### Phase J — Sauvegarde & restauration
- **T0.23** Configurer les **sauvegardes** (Supabase) ; **restauration testée** au
  moins une fois (procédure notée). → L0-AC-12

## 6. Mapping tâches → critères d'acceptation

| Critère (revue, partie K) | Couvert par |
|---|---|
| L0-AC-01 Dépôt séparé + structure + 9 docs | T0.1–T0.3 |
| L0-AC-02 CI bloquante (lint/typage/tests/secrets) | T0.4–T0.6 |
| L0-AC-03 Auth OIDC + MFA direction | T0.11–T0.13, T0.16 |
| L0-AC-04 `org_id` + RLS + test d'étanchéité | T0.8–T0.10, T0.13 |
| L0-AC-05 Rôles de base + Espace Dirigeant privé | T0.14–T0.15 |
| L0-AC-06 Audit qui/quoi/quand | T0.21 |
| L0-AC-07 Cockpit tenant-aware en données DÉMO | T0.19 |
| L0-AC-08 Responsive + clair/sombre | T0.17–T0.18 |
| L0-AC-09 Environnements local + preview, secrets UE | T0.7, T0.22 |
| L0-AC-10 Aucune finance/IA/intégration réelle | garanti par le périmètre (§1, §9) |
| L0-AC-11 Aucune valeur de style/calcul en dur (jetons) | T0.16–T0.20 |
| L0-AC-12 Sauvegarde + restauration testée | T0.23 |

## 7. Points d'attention (à trancher en début de phase, non bloquants aujourd'hui)

- **RLS + contexte tenant avec Supabase.** Deux approches : (a) `org_id` en **claim
  JWT** exploité par les policies RLS ; (b) accès serveur via un **contexte tenant**
  posé par la couche d'accès + RLS en défense. **Recommandation :** (b) au Lot 0
  (contrôle serveur explicite, plus simple à tester), RLS en défense en profondeur.
  À figer en **T0.9**.
- **Connexions serverless.** Utiliser le **pooler** Supabase pour Next.js sur Vercel.
- **Abstraction Auth/Storage.** Les ports (`AuthPort`, `StoragePort`) sont posés dès
  le Lot 0 même si Storage n'est pas utilisé — garantit la **réversibilité** (votre
  exigence G1).
- **Données de démonstration.** Générées par un **script de seed**, **marquées DÉMO**,
  jamais confondues avec des données réelles ni des calculs officiels.

## 8. Ce que le Lot 0 ne fait pas (rappel)

Aucun module financier, aucun calcul officiel, aucune IA, aucune connexion bancaire,
aucune synchronisation Apple Calendar, **aucun worker asynchrone**, aucune donnée
réelle. Ces éléments arrivent dans les lots suivants (roadmap, revue partie L).

## 9. Worker asynchrone — pourquoi hors Lot 0

Le Lot 0 n'a **aucun besoin asynchrone** (pas d'automatisations, pas d'envois de
masse, pas d'IA). Introduire le worker maintenant serait de la **complexité
prématurée**. Son **emplacement est réservé** (`src/workers/`, ADR-0006/0007) ; il
sera implémenté au **lot Automatisations**, sur un service **UE séparé** (Railway/
Render), **jamais** dans une fonction serverless Vercel.

## 10. Definition of Done du Lot 0

Le Lot 0 est terminé quand : **les 12 critères d'acceptation** (§6) sont satisfaits ;
la CI est **verte** ; le **test d'étanchéité** multi-entreprise passe ; l'**audit**
fonctionne ; le **cockpit démo** s'affiche en clair/sombre et responsive ; les
**environnements** local + preview sont opérationnels en **UE** ; la **restauration**
d'une sauvegarde a été **testée** ; la **documentation** (ADR, README) est à jour ;
**aucune** donnée réelle, IA ou intégration n'est présente.

## 11. Séquencement & mode de travail

- Progression par **petites étapes validées** (une phase, une revue courte).
- Chaque étape : **branche dédiée** → CI verte → validation → fusion (main protégée).
- Je vous **signale les incertitudes** et **demande validation** dès qu'une règle ou
  un paramètre manque (Developer Bible §47).
- **Aucun secret** committé ; **aucun déploiement production** sans votre autorisation.

## 12. Prochaine action (après votre validation de ce plan)

1. **T0.1–T0.3** : créer le dépôt `brn-pilot` (privé), y copier les 9 documents +
   ADR, initialiser la structure. *(Action externe — je confirmerai la cible avant de
   créer le dépôt.)*
2. Puis dérouler les phases B → J, par étapes validées.

> **Rappel.** Ce document est un **plan à valider**. Rien n'est créé tant que vous ne
> l'avez pas approuvé. Le modèle de priorité (décision **G5**) reste à trancher
> **avant le Lot 1**, pas pour le Lot 0.
