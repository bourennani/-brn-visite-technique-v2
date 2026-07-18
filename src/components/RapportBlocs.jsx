import { Fragment } from "react";
import { G_DARK, G_LIGHT, G_MID, G_PALE, n } from "../lib/catalogue";
import { fmt } from "../lib/calc";
import { profilDe } from "../lib/profils";
import { StoredImg } from "./SketchPad";

/* ==================================================================== */
/*  BLOCS DU RAPPORT (v2.3)                                             */
/*                                                                      */
/*  Règle unique : on n'écrit que ce qui a été renseigné.               */
/*  Pas de « 0 », pas de « Aucun », pas de « Non renseigné », pas de    */
/*  section vide. Une rubrique sans contenu disparaît entièrement.      */
/* ==================================================================== */

/** Une valeur mérite-t-elle d'être imprimée ? */
export const aValeur = (x) => {
  if (x === null || x === undefined) return false;
  if (typeof x === "number") return Number.isFinite(x) && x !== 0;
  const s = String(x).trim();
  if (!s) return false;
  return !["0", "-", "—", "aucun", "aucune", "non renseigné", "non renseignée", "n/a", "néant"]
    .includes(s.toLowerCase());
};

/** Ligne d'un tableau technique : rendue seulement si la valeur existe. */
function L({ k, v, u }) {
  if (!aValeur(v)) return null;
  return (
    <tr>
      <td className="py-1 pr-3 text-stone-600 align-top" style={{ width: "45%" }}>{k}</td>
      <td className="py-1 font-mono font-bold text-right whitespace-nowrap">
        {typeof v === "number" ? fmt(v, u === "u" ? 0 : 2) : v}
        {u ? <span className="text-stone-400 font-normal"> {u}</span> : null}
      </td>
    </tr>
  );
}


/** Bandeau technique compact : une suite de chiffres clés sur 1 à 2 lignes.
    Chaque case disparaît si sa valeur est absente ou nulle ; le bandeau
    entier disparaît s'il ne reste aucune case. */
function Bandeau({ cases }) {
  const utiles = cases.filter((c) => aValeur(c.v));
  if (!utiles.length) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 rounded-lg px-3 py-2 mb-2"
      style={{ backgroundColor: G_PALE }}>
      {utiles.map((c, i) => (
        <div key={i} className="leading-none">
          <div className="text-[11px] uppercase tracking-[0.08em] text-stone-500 mb-1">{c.k}</div>
          <div className="font-mono font-bold text-[16px]" style={{ color: G_DARK }}>
            {typeof c.v === "number" ? fmt(c.v, c.d ?? (c.u === "u" ? 0 : 2)) : c.v}
            {c.u ? <span className="text-stone-400 font-normal text-[11px]"> {c.u}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Ligne d'attributs textuels, séparés par des points médians. */
function Attributs({ items }) {
  const utiles = items.filter((x) => aValeur(x.v));
  if (!utiles.length) return null;
  return (
    <div className="text-[13px] text-stone-700 mb-1.5 leading-snug">
      {utiles.map((x, i) => (
        <span key={i}>
          {i > 0 && <span className="text-stone-300"> · </span>}
          <span className="text-stone-400">{x.k} </span>
          <b>{x.v}</b>
        </span>
      ))}
    </div>
  );
}

/** Rubrique : disparaît si elle n'a aucun enfant à montrer. */
function Rub({ titre, children }) {
  const enfants = Array.isArray(children) ? children.flat(Infinity).filter(Boolean) : children;
  if (!enfants || (Array.isArray(enfants) && enfants.length === 0)) return null;
  return (
    <div className="mb-2">
      <div className="text-[11px] font-bold uppercase tracking-[0.09em] mb-1 text-stone-500">
        {titre}
      </div>
      {enfants}
    </div>
  );
}

/** Tableau technique : disparaît si aucune ligne n'a de valeur. */
function Tech({ titre, lignes }) {
  const utiles = lignes.filter((l) => aValeur(l.v));
  if (!utiles.length) return null;
  return (
    <Rub titre={titre}>
      <table className="w-full" style={{ fontSize: 13 }}>
        <tbody>
          {utiles.map((l, i) => <L key={i} k={l.k} v={l.v} u={l.u} />)}
        </tbody>
      </table>
    </Rub>
  );
}

function Photos({ photos, montrer }) {
  const utiles = (photos || []).filter((p) => p.inclure !== false);
  if (!montrer || !utiles.length) return null;
  return (
    <Rub titre="Photos">
      <div className="grid grid-cols-3 gap-1">
        {utiles.map((p) => (
          <figure key={p.id} className="m-0">
            <StoredImg blobKey={p.blobKey} className="w-full h-24 object-cover rounded border border-stone-300" />
            {aValeur(p.legende) && (
              <figcaption className="text-[12px] text-stone-500 mt-1 leading-snug">{p.legende}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </Rub>
  );
}

function Texte({ titre, contenu }) {
  if (!aValeur(contenu)) return null;
  return (
    <Rub titre={titre}>
      <p className="text-[14px] leading-relaxed whitespace-pre-line text-stone-800">{contenu}</p>
    </Rub>
  );
}

/* ---- En-tête commun ---- */
function Titre({ r, sousTitre }) {
  return (
    <div className="rap-titre flex items-baseline justify-between gap-3 border-b-2 pb-1 mb-2"
      style={{ borderColor: G_LIGHT }}>
      <div className="flex items-center gap-2 min-w-0">
        {/* Filet vertical : le nom de pièce se repère sans lire. */}
        <span className="w-1 h-5 rounded-sm shrink-0" style={{ backgroundColor: G_MID }} />
        <span className="font-bold text-[19px] leading-none tracking-tight truncate" style={{ color: G_DARK }}>
          {r.nom}
        </span>
      </div>
      {aValeur(sousTitre) && (
        <div className="text-[12px] text-stone-500 shrink-0 whitespace-nowrap">{sousTitre}</div>
      )}
    </div>
  );
}

/* ---- Observations et réserves, communes aux deux blocs ---- */
function Obs({ r, showInternes }) {
  const reserves = (r.pointsAVerifier || []).filter((x) => aValeur(x.txt) && !x.ok);
  return (
    <>
      <Texte titre="Observations" contenu={r.notes} />
      {reserves.length > 0 && (
        <Rub titre="Points à vérifier">
          <ul className="list-disc pl-3.5 m-0">
            {reserves.map((x, i) => (
              <li key={i} className="text-[14px] leading-relaxed text-stone-800">{x.txt}</li>
            ))}
          </ul>
        </Rub>
      )}
      {showInternes && <Texte titre="Note interne" contenu={r.notesInternes} />}
    </>
  );
}


/** Interventions retenues pour cette pièce ou zone.
    Les quantités viennent des ouvrages relus ; rien n'est fusionné ici. */
function Interventions({ ouvrages }) {
  if (!ouvrages || !ouvrages.length) return null;
  const parLot = {};
  ouvrages.forEach((o) => {
    const k = o.lotNom || "Autres";
    (parLot[k] = parLot[k] || []).push(o);
  });
  return (
    <Rub titre="Interventions retenues">
      <table className="w-full" style={{ fontSize: 13 }}>
        <tbody>
          {Object.entries(parLot).map(([lotNom, items]) => (
            /* Fragment nommé : un fragment court `<>` ne peut pas porter de key. */
            <Fragment key={lotNom}>
              <tr>
                <td colSpan={2} className="pt-2 pb-1 text-[12px] font-bold uppercase tracking-[0.08em] text-stone-500">
                  {lotNom}
                </td>
              </tr>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-stone-100">
                  <td className="py-1 pr-3 text-stone-800 align-top">
                    {o.label}
                    {o.manuelle && (
                      <span className="ml-1.5 text-[11px] font-bold uppercase px-1.5 py-0.5 rounded align-middle"
                        style={{ backgroundColor: "#FFEDD5", color: "#9A3412" }}>
                        saisie manuelle
                      </span>
                    )}
                    {aValeur(o.obs) && <div className="text-[11px] text-stone-500 leading-tight">{o.obs}</div>}
                  </td>
                  <td className="py-1 font-mono font-bold text-right whitespace-nowrap align-top" style={{ width: "22%" }}>
                    {fmt(o.qteRetenue, o.unit === "u" ? 0 : 2)}
                    <span className="text-stone-400 font-normal"> {o.unit}</span>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Rub>
  );
}

/* ==================================================================== */
/*  BLOC FAÇADE / ZONE EXTÉRIEURE                                       */
/*  Aucune information intérieure : ni sol, ni plafond, ni plinthes.    */
/* ==================================================================== */
export function BlocFacade({ r, rc, ouvrages, showPhotos, showInternes }) {
  const f = r.facade || {};
  const cf = rc.facade || {};
  const faces = (f.faces || []).filter((x) => n(x.largeur) > 0 || n(x.hauteur) > 0);
  const patho = (f.pathologies || []).filter((p) => n(p.qte) > 0 || p.unite === "forfait");
  const ouvs = (r.ouvertures || []).filter((o) => n(o.L) > 0 && n(o.H) > 0);

  /* Chiffres de tête : cumul des largeurs, hauteur la plus haute. */
  const largeurTot = faces.reduce((s2, x) => s2 + n(x.largeur) * Math.max(1, n(x.qte) || 1), 0);
  const hauteurMax = faces.reduce((s2, x) => {
    const h = x.hParNiveau ? n(x.hauteur) * Math.max(1, n(x.niveaux) || 1) : n(x.hauteur);
    return Math.max(s2, h);
  }, 0);

  return (
    <div className="rap-piece mb-3 pb-2 border-b border-stone-200">
      <Titre r={r} sousTitre={r.typeLabel} />

      <Attributs
        items={[
          { k: "Support", v: f.support },
          { k: "État", v: f.etat },
          { k: "Accès", v: f.acces },
          { k: "Finition", v: f.finition },
          { k: "Aspect", v: f.aspect },
          { k: "Teinte", v: f.teinte },
        ]}
      />

      {faces.length > 0 && (
        <Rub titre="Dimensions">
          <table className="w-full" style={{ fontSize: 13 }}>
            <tbody>
              {faces.map((x) => {
                const niv = Math.max(1, n(x.niveaux) || 1);
                const h = x.hParNiveau ? n(x.hauteur) * niv : n(x.hauteur);
                const q = Math.max(1, n(x.qte) || 1);
                return (
                  <tr key={x.id}>
                    <td className="py-1 pr-3 text-stone-600 align-top">
                      {x.nom}
                      {aValeur(x.orientation) && <span className="text-stone-400"> · {x.orientation}</span>}
                    </td>
                    <td className="py-1 font-mono text-right whitespace-nowrap text-stone-700">
                      {fmt(n(x.largeur))} × {fmt(h)} m{q > 1 ? ` × ${q}` : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Rub>
      )}

      <Bandeau
        cases={[
          { k: "Largeur", v: largeurTot, u: "m" },
          { k: "Hauteur", v: hauteurMax, u: "m" },
          { k: "Surf. brute", v: cf.surfaceBrute, u: "m²" },
          { k: "Ouvertures", v: cf.ouvertures, u: "m²" },
          { k: "Surf. nette", v: cf.surfaceNette, u: "m²" },
          { k: "Fenêtres", v: cf.nbFenetres, u: "u" },
          { k: "Portes", v: cf.nbPortes, u: "u" },
          { k: "Tableaux", v: cf.tableaux, u: "m²" },
          { k: "Soubassement", v: cf.soubassement, u: "m²" },
          { k: "Bandeaux", v: cf.bandeaux, u: "ml" },
          { k: "À traiter", v: cf.surfaceATraiter, u: "m²" },
          { k: "Pathologies", v: patho.length, u: "u" },
        ]}
      />

      {ouvs.length > 0 && (
        <Rub titre="Ouvertures">
          <table className="w-full" style={{ fontSize: 13 }}>
            <tbody>
              {ouvs.map((o) => (
                <tr key={o.id}>
                  <td className="py-1 pr-3 text-stone-600">
                    {o.nom || o.type}
                    {aValeur(o.type) && o.nom ? <span className="text-stone-400"> · {o.type}</span> : null}
                  </td>
                  <td className="py-1 font-mono text-right whitespace-nowrap text-stone-700">
                    {fmt(n(o.L))} × {fmt(n(o.H))} m
                    {Math.max(1, n(o.qte) || 1) > 1 ? ` × ${Math.max(1, n(o.qte))}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Rub>
      )}

      {patho.length > 0 && (
        <Rub titre="Dégradations constatées">
          <table className="w-full" style={{ fontSize: 13 }}>
            <tbody>
              {patho.map((p) => (
                <tr key={p.id}>
                  <td className="py-1 pr-3 text-stone-800 align-top">
                    {p.label}
                    {aValeur(p.localisation) && <span className="text-stone-400"> · {p.localisation}</span>}
                    {aValeur(p.obs) && <div className="text-[11px] text-stone-500 leading-tight">{p.obs}</div>}
                  </td>
                  <td className="py-1 font-mono font-bold text-right whitespace-nowrap align-top">
                    {p.unite === "forfait" ? "forfait" : `${fmt(n(p.qte), p.unite === "u" ? 0 : 2)} ${p.unite}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Rub>
      )}

      <Tech
        titre="Réparations localisées"
        lignes={[
          { k: "Linéaire de fissures", v: cf.reparationsMl, u: "ml" },
          { k: "Reprises de surface", v: cf.reparationsM2, u: "m²" },
          { k: "Points ponctuels", v: cf.reparationsU, u: "u" },
        ]}
      />

      <Interventions ouvrages={ouvrages} />
      <Photos photos={r.photos} montrer={showPhotos} />
      <Texte titre="Observations" contenu={f.obs} />
      <Obs r={r} showInternes={showInternes} />
    </div>
  );
}

/* ==================================================================== */
/*  BLOC PIÈCE INTÉRIEURE                                               */
/* ==================================================================== */
export function BlocPiece({ r, rc, ouvrages, showPhotos, showInternes }) {
  const p = profilDe(r);
  const zones = (r.zones || []).filter((z) => n(z.L) > 0 || n(z.l) > 0);
  const ouvs = (r.ouvertures || []).filter((o) => n(o.L) > 0 && n(o.H) > 0);
  const cu = rc.cuisine || {};
  const voir = (k) => p.sections.includes(k);

  const sousTitre = [r.niveau, r.typeLabel].filter(aValeur).join(" · ");

  return (
    <div className="rap-piece mb-3 pb-2 border-b border-stone-200">
      <Titre r={r} sousTitre={sousTitre} />

      {/* --- Constat --- */}
      <Rub titre="Constat">
        {[
          aValeur(r.etatGeneral) && <span key="e" className="text-[13px] text-stone-800">{r.etatGeneral}</span>,
          zones.length > 0 && (
            <div key="z" className="text-[13px] text-stone-700">
              {zones.map((z) => (
                <span key={z.id}>
                  {z.nom || "Zone"} : {fmt(n(z.L))} × {fmt(n(z.l))} m
                  {n(z.H) > 0 ? `, H ${fmt(n(z.H))} m` : ""}
                  {Math.max(1, n(z.qte) || 1) > 1 ? ` × ${Math.max(1, n(z.qte))}` : ""}
                  {". "}
                </span>
              ))}
            </div>
          ),
        ].filter(Boolean)}
      </Rub>

      {/* --- Informations techniques : compactes, adaptées au profil --- */}
      <Bandeau
        cases={[
          voir("sol") && { k: "Sol", v: rc.solNet, u: "m²" },
          voir("murs") && { k: "Murs", v: rc.mursNet, u: "m²" },
          voir("plafond") && { k: "Plafond", v: rc.plafondNet, u: "m²" },
          voir("plinthes") && { k: "Plinthes", v: rc.plinthesNet, u: "ml" },
          { k: "Hauteur", v: rc.hauteur, u: "m" },
          { k: "Ouvertures", v: ouvs.length, u: "u" },
          voir("faience") && { k: "Faïence", v: rc.faienceNet, u: "m²" },
          voir("doublages") && { k: "Doublage", v: rc.doublageNet, u: "m²" },
          { k: "Volume", v: rc.volume, u: "m³" },
        ].filter(Boolean)}
      />

      {ouvs.length > 0 && (
        <Rub titre="Ouvertures">
          <table className="w-full" style={{ fontSize: 13 }}>
            <tbody>
              {ouvs.map((o) => (
                <tr key={o.id}>
                  <td className="py-1 pr-3 text-stone-600">{o.nom || o.type}</td>
                  <td className="py-1 font-mono text-right whitespace-nowrap text-stone-700">
                    {fmt(n(o.L))} × {fmt(n(o.H))} m
                    {Math.max(1, n(o.qte) || 1) > 1 ? ` × ${Math.max(1, n(o.qte))}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Rub>
      )}

      {/* --- Électricité : le détail par appareillage, propre à cette pièce.
              Le total général ne remplace jamais ce détail. --- */}
      <Rub titre="Électricité">
        <Bandeau
          cases={[
            { k: "Prises simples", v: rc.nbPriseSimple, u: "u" },
            { k: "Prises doubles", v: rc.nbPriseDouble, u: "u" },
            { k: "Prises triples", v: rc.nbPriseTriple, u: "u" },
            { k: "Prises spécialisées", v: rc.nbSpec, u: "u" },
            { k: "Inter. simples", v: rc.nbInterSimple, u: "u" },
            { k: "Inter. doubles", v: rc.nbInterDouble, u: "u" },
            { k: "Inter. triples", v: rc.nbInterTriple, u: "u" },
            { k: "Points lumineux", v: rc.nbPoints, u: "u" },
            { k: "Spots / LED", v: rc.nbSpots, u: "u" },
            { k: "RJ45", v: rc.nbRJ45, u: "u" },
            { k: "Courant faible", v: rc.nbFaible, u: "u" },
          ]}
        />
        {aValeur(rc.nbSocles) && aValeur(rc.nbPrises) && rc.nbSocles !== rc.nbPrises && (
          <div className="text-[11px] text-stone-400 leading-snug -mt-1 mb-1.5">
            {fmt(rc.nbPrises, 0)} appareillages, soit {fmt(rc.nbSocles, 0)} socles.
          </div>
        )}
      </Rub>

      {/* --- Cuisine : seulement pour le profil cuisine et si renseignée --- */}
      {p.modules.includes("cuisine") && (
        <>
          <Rub titre="Cuisine — mobilier">
            <Bandeau
              cases={[
                { k: "Bas existants", v: cu.existant?.nbBas, u: "u" },
                { k: "Hauts existants", v: cu.existant?.nbHaut, u: "u" },
                { k: "Colonnes exist.", v: cu.existant?.nbColonnes, u: "u" },
                { k: "Bas projetés", v: cu.nbBasProjet, u: "u" },
                { k: "Hauts projetés", v: cu.nbHautProjet, u: "u" },
                { k: "Colonnes projet", v: cu.nbColonnesProjet, u: "u" },
                { k: "Îlot / bar", v: cu.nbIlotProjet, u: "u" },
                { k: "Larg. cum. bas", v: cu.mlBasProjet, u: "ml" },
                { k: "Larg. cum. hauts", v: cu.mlHautProjet, u: "ml" },
              ]}
            />
          </Rub>
          <Rub titre="Cuisine — plan de travail, crédence, équipements">
            <Bandeau
              cases={[
                { k: "Plan de travail", v: cu.pdtLongueur, u: "ml" },
                { k: "Découpes", v: cu.pdtDecoupes, u: "u" },
                { k: "Crédence", v: cu.credenceSurface, u: "m²" },
                { k: "Plinthe cuisine", v: cu.plintheCuisine, u: "ml" },
                { k: "Joues", v: cu.nbJoues, u: "u" },
                { k: "Fileurs", v: cu.nbFileurs, u: "u" },
                { k: "Équipements", v: cu.nbEquipements, u: "u" },
              ]}
            />
          </Rub>
        </>
      )}

      <Interventions ouvrages={ouvrages} />
      <Photos photos={r.photos} montrer={showPhotos} />
      <Obs r={r} showInternes={showInternes} />
    </div>
  );
}
