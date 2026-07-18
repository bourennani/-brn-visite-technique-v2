# ADR-0006 — TypeScript de bout en bout, cœur métier pur partagé client/serveur

- **Statut :** Accepté
- **Date :** 2026-07-18
- **Principes concernés :** P6, maintenabilité (chap. 00 §2), continuité v2

## Contexte

La v2 est en JavaScript/React, avec un **cœur métier déjà pur** (`calc.js`,
`travaux.js` : calculs déterministes, recalcul du « catalogue vivant »). Ce cœur
doit tourner **à l'identique** côté terrain (hors-ligne, dans le navigateur) et
côté serveur (vérité, recalcul de contrôle). On veut préserver ce savoir-faire,
pas le réécrire.

## Options envisagées

1. **Back dans un autre langage (ex. Java, C#, Go)** — écosystèmes solides, mais
   le cœur métier devrait être **réécrit et maintenu en double** (une version
   navigateur, une version serveur) : risque de divergence, coût permanent.
2. **JS non typé partout** — continuité maximale, mais à l'échelle d'un ERP la
   sûreté des contrats devient ingérable sans typage.
3. **TypeScript de bout en bout (front + back Node)** — un seul langage ; le cœur
   pur se **partage littéralement** entre client et serveur ; typage fort pour les
   contrats.

## Décision

**TypeScript** partout, **Node.js** au serveur. Le cœur métier pur (métré,
marges, chiffrage, plus tard paie) est écrit **une fois** et exécuté des deux
côtés (client local-first et serveur de vérité). La v2 migre progressivement de JS
vers TS, fichier par fichier (TS accepte le JS), en commençant par le cœur pur.
Un besoin ponctuel de calcul lourd dans un autre langage reste possible via un
service dédié — mais c'est un ADR spécifique, pas le défaut.

## Conséquences

- **Positives :** zéro duplication du domaine, cohérence client/serveur garantie,
  continuité avec la v2 et son équipe, typage des contrats à l'échelle.
- **Négatives / coûts :** Node.js pour les traitements très lourds n'est pas
  toujours idéal (parade : service dédié ponctuel) ; la migration JS→TS demande un
  effort progressif (assumé, non bloquant grâce à l'interop JS/TS).
- **Suivi :** progression du typage du cœur ; couverture de tests du domaine pur ;
  absence de logique métier dupliquée entre client et serveur.
