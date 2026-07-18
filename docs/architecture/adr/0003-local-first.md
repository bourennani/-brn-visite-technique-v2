# ADR-0003 — Local-first sur le terrain, synchronisation bidirectionnelle

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P4, disponibilité terrain (chap. 00 §2)

## Contexte

Le métier se joue sur des chantiers souvent sans réseau (sous-sols, façades,
zones blanches). La v2 est déjà une PWA local-first réussie (IndexedDB, repli
mémoire, service worker, hors-ligne). L'ERP ne doit pas régresser en imposant une
connexion permanente.

## Options envisagées

1. **Tout en ligne (serveur autoritaire, client mince)** — simple à raisonner,
   mais **inutilisable** sur un chantier sans réseau. Rédhibitoire.
2. **Hors-ligne « lecture seule »** — on consulte hors-ligne, on saisit en ligne.
   Insuffisant : le métré, le pointage, le SAV se **saisissent** sur le terrain.
3. **Local-first avec synchronisation bidirectionnelle** — l'interface travaille
   sur un cache local, la synchro est différée et robuste, conflits résolus
   explicitement.

## Décision

**Local-first** (option 3). L'interface terrain ne parle qu'au cache local
(IndexedDB) ; chaque écriture produit une mutation rejouée vers le serveur au
retour du réseau ; la synchro est bidirectionnelle ; les conflits sont résolus
**par type de donnée** (fusion par champ, union des ajouts, dernier écrivain +
trace, refus optimiste sur les données engageantes — chap. 09 §4). Le serveur
reste la vérité durable ; le local est un cache reconstructible.

## Conséquences

- **Positives :** continuité totale avec la v2, aucune régression terrain,
  perception instantanée, robustesse réseau.
- **Négatives / coûts :** la synchronisation et la résolution de conflits sont la
  partie **la plus délicate** du système ; elle exige des tests soignés et une
  UX de réconciliation claire. Le périmètre synchronisé par appareil doit être
  borné (rôle + affectation) pour le volume et la sécurité.
- **Suivi :** taux d'échec de synchronisation, fréquence et nature des conflits,
  volume du cache local par appareil.
