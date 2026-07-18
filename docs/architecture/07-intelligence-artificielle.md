# 07 — Intelligence artificielle

## 1. Principe fondateur : l'IA augmente, elle ne décide pas seule

L'IA est une **couche d'augmentation** (principe P10), branchée sur les contrats
(chap. 06 §1) et les événements (chap. 06 §3). Elle **propose**, un humain
**dispose**. Elle n'est **jamais** dans le chemin critique d'une écriture métier
engageante (un devis émis, une facture, une paie).

```
   Événements + Contrats (lecture)        Suggestions (écriture indirecte)
        │                                        ▲
        ▼                                        │
   ┌──────────────────────────────────────────────────┐
   │           COUCHE IA (service d'augmentation)      │
   │  Extraction · Résumé · Classification · Assistant │
   │  Détection d'anomalie · Aide à la décision        │
   └──────────────────────────────────────────────────┘
        │                                        │
        ▼                                        ▼
   Propose au module métier              Un HUMAIN valide avant écriture
   (jamais d'écriture directe            engageante (métré, devis, paie)
    dans un agrégat engageant)
```

## 2. Pourquoi une couche séparée

- **Découplage** : l'IA évolue vite (modèles, fournisseurs). En la gardant à part,
  on change de modèle sans toucher au cœur métier (comme un connecteur, chap. 06).
- **Non-bloquant** : l'IA vit dans les **travailleurs asynchrones** (chap. 01 §5).
  Une panne, une lenteur, un quota atteint ne bloque **aucune** opération métier.
- **Traçabilité** : toute suggestion IA est un **événement** (`IA.SuggestionÉmise`)
  horodaté, attribué au modèle et à sa version, avec le contexte d'entrée. On sait
  toujours **ce que l'IA a proposé, sur quelle base, et ce que l'humain en a fait**.

## 3. Cas d'usage par module (feuille de route indicative)

| Cas d'usage | Module | Nature | Garde-fou |
|---|---|---|---|
| Pré-remplir un métré depuis une **photo** ou un **plan** | Études | Extraction / vision | Le métreur valide chaque quantité (comme un poste « à vérifier » v2.2). |
| Contrôle de **cohérence du relevé** (oubli, incohérence de surface) | Études | Détection | Avertissement, jamais blocage (esprit des « contrôles de cohérence » v2.2). |
| **Aide au chiffrage** (prix probable d'un ouvrage d'après l'historique) | Finance | Suggestion | Le chiffreur ajuste ; le prix reste sa décision. |
| **Détection d'anomalie de marge** (chantier qui dérape) | Chantiers | Anomalie | Alerte au dirigeant, pas d'action automatique. |
| **Résumé de chantier** (journal, échanges, avancement) | Chantiers | Synthèse | Lecture d'aide, source consultable. |
| **Classement automatique de documents** | Documents | Classification | Proposition de rangement, validable. |
| **Priorisation des tickets SAV** | SAV | Scoring | Le responsable réordonne librement. |
| **Assistant conversationnel** sur les données de l'entreprise | Transverse | Question-réponse | Répond en **lecture seule**, cite ses sources, respecte le RBAC de l'utilisateur. |
| **Aide à la rédaction** (courriers, comptes rendus, relances) | Transverse | Génération | Brouillon, relu et envoyé par un humain. |

## 4. Souveraineté et confidentialité des données (non négociable)

L'IA manipule des données **clients**, **salariés**, **financières**. Le RGPD et le
secret des affaires s'appliquent **intégralement** (chap. 05).

- **Aucune donnée personnelle ou stratégique n'alimente l'entraînement d'un modèle
  tiers** sans base légale et sans garantie contractuelle explicite.
- Le fournisseur d'inférence est un **sous-traitant** (chap. 05 §3, chap. 06 §4) :
  contractualisé, hébergement/traitement **UE** privilégié, pas de rétention des
  requêtes côté fournisseur.
- **Minimisation** : on n'envoie au modèle que le **strict contexte nécessaire** à
  la tâche, filtré selon les droits de l'utilisateur qui déclenche la demande.
- **Réversibilité** : la couche IA est branchée derrière un **port** ; on change de
  fournisseur (ou on passe à un modèle auto-hébergé) sans réécrire les cas d'usage.
- **Journalisation** : entrées, sorties, modèle, version et coût de chaque appel,
  pour l'audit et la maîtrise budgétaire.

## 5. Garde-fous de qualité

- **L'humain dans la boucle** pour tout acte engageant : la suggestion arrive avec
  un statut « à valider », jamais « appliqué ».
- **Citer les sources** : un assistant qui répond sur les données cite les
  documents/chantiers d'origine, consultables.
- **Mesurer** : taux d'acceptation des suggestions, taux de correction. Une IA dont
  les suggestions sont massivement corrigées est **désactivée** ou revue — elle
  détruit de la confiance.
- **Dégradation gracieuse** : si l'IA est indisponible, l'ERP fonctionne
  **exactement** comme sans elle. Aucune fonctionnalité métier n'en **dépend**.

## 6. Ce que l'IA ne fera pas

- Émettre, signer ou envoyer un acte engageant sans validation humaine.
- Modifier une donnée financière, RH ou de stock directement.
- Accéder à des données hors du périmètre RBAC de l'utilisateur qui la sollicite.
- Devenir une **dépendance dure** d'un processus métier critique.

> L'IA est un **copilote**, jamais le pilote. Le pilote, c'est le dirigeant et ses
> équipes ; l'ERP — IA comprise — est à leur service.
