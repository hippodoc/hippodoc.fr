#!/usr/bin/env node
/**
 * Contrôle du modèle de l'API Urssaf (MIGRATION.md § 9.fv, § 9.fw).
 *
 * Le simulateur donne au modèle de l'API (`modele-social`) la nouvelle assiette sociale et les
 * taux de la réforme, qu'il n'applique pas encore (`src/lib/simulateur/urssaf.ts`). Le jour où
 * l'Urssaf mettra la réforme dans ce modèle, ces surcharges compteraient l'abattement de 26 %
 * deux fois. Ce script interroge l'API sur un cas de référence, SANS surcharge, et échoue dès
 * qu'une valeur témoin a changé ; il vérifie aussi que les surcharges sont toujours acceptées.
 *
 * Lancé chaque semaine par `.github/workflows/controle-modele-urssaf.yml`, et à la main :
 *   node scripts/controle-modele-urssaf.mjs
 * S'il échoue : relire les règles du modèle, puis retirer ou adapter les surcharges de
 * `situationMedecin` et mettre à jour les valeurs témoins ci-dessous.
 */

const API = 'https://mon-entreprise.urssaf.fr/api/v1/evaluate';
const I = 'dirigeant . indépendant';
const C = `${I} . cotisations et contributions`;

// Remplaçant de secteur 1 au réel, 60 000 € de recettes, 6 000 € de charges, revenus 2026.
const SITUATION = {
  'date': '01/01/2026',
  'entreprise . catégorie juridique': "'EI'",
  'entreprise . catégorie juridique . EI . auto-entrepreneur': 'non',
  'entreprise . activité . nature': "'libérale'",
  'entreprise . activité . nature . libérale . réglementée': 'oui',
  'dirigeant . indépendant . PL . métier': "'santé . médecin'",
  'dirigeant . indépendant . PL . métier . santé . médecin . secteur': "'S1'",
  'dirigeant . indépendant . PL . PAMC . remplaçant': 'oui',
  'dirigeant . indépendant . PL . PAMC . proportion recette activité non conventionnée': '0 %',
  'entreprise . imposition': "'IR'",
  "entreprise . chiffre d'affaires": '60000 €/an',
  'entreprise . imposition . IR . régime micro-fiscal': 'non',
  'entreprise . charges': '6000 €/an',
};

// Valeurs du modèle relevées le 14 novembre 2026 (ancienne assiette) : si l'une change, le
// modèle a changé. 39 960 € vaut aussi 74 % du revenu brut, par coïncidence : c'est l'assiette
// de la CSG-CRDS, 50 449 €, qui distingue l'ancien calcul (revenu + cotisations) du nouveau.
const TEMOINS = [
  { expression: `${I} . assiette des cotisations`, attendu: 39960, tolerance: 2 },
  { expression: `${C} . CSG-CRDS . assiette`, attendu: 50449, tolerance: 2 },
  { expression: `${I} . PL . CNAVPL . retraite . tranche T1 . taux`, attendu: 8.23, tolerance: 0.001 },
  { expression: `${C} . retraite complémentaire`, attendu: 4076, tolerance: 2 },
  { expression: C, attendu: 15503, tolerance: 2 },
];

// Les surcharges du simulateur, pour vérifier que le modèle les lit encore.
const SURCHARGES = {
  [`${I} . assiette des cotisations`]: '39960 €/an',
  [`${C} . CSG-CRDS . assiette`]: '39960 €/an',
  [`${I} . PL . CNAVPL . retraite . tranche T1 . taux`]: '8.73 %',
  [`${I} . PL . maladie . taux`]: '5.1600 %',
  [`${I} . assiette minimale . maladie`]: '0 €/an',
  [`${I} . PL . PAMC . maladie . contribution additionnelle . taux`]: '3.25 %',
  [`${I} . PL . CARMF . retraite complémentaire`]: '4715 €/an',
};
const LUES = [
  { expression: `${C} . CSG-CRDS . assiette`, attendu: 39960, tolerance: 2 },
  { expression: `${I} . PL . CNAVPL . retraite . tranche T1 . taux`, attendu: 8.73, tolerance: 0.001 },
  { expression: `${C} . retraite complémentaire`, attendu: 4715, tolerance: 2 },
];

async function evaluer(situation, expressions, essai = 1) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation, expressions }),
  });
  if (res.status === 429 && essai < 4) {
    await new Promise((r) => setTimeout(r, 2000 * essai));
    return evaluer(situation, expressions, essai + 1);
  }
  if (!res.ok) throw new Error(`API Urssaf : HTTP ${res.status}`);
  const json = await res.json();
  if (json.situationError) throw new Error(`situation refusée : ${JSON.stringify(json.situationError).slice(0, 400)}`);
  return json.evaluate.map((e, i) => {
    if (e?.missingVariables && e.nodeValue === undefined) throw new Error(`« ${expressions[i]} » : pas de valeur`);
    return e?.nodeValue;
  });
}

const echecs = [];
const comparer = (liste, valeurs, contexte) => liste.forEach((t, i) => {
  const v = valeurs[i];
  const ok = typeof v === 'number' && Math.abs(v - t.attendu) <= t.tolerance;
  console.log(`${ok ? '✓' : '✗'} ${contexte} · ${t.expression} = ${v} (attendu ${t.attendu})`);
  if (!ok) echecs.push(`${contexte} : ${t.expression} = ${v}, attendu ${t.attendu}`);
});

try {
  comparer(TEMOINS, await evaluer(SITUATION, TEMOINS.map((t) => t.expression)), 'sans surcharge');
  await new Promise((r) => setTimeout(r, 800));
  comparer(LUES, await evaluer({ ...SITUATION, ...SURCHARGES }, LUES.map((t) => t.expression)), 'avec surcharges');
} catch (err) {
  echecs.push(String(err?.message ?? err));
  console.log(`✗ ${err?.message ?? err}`);
}

if (echecs.length) {
  console.error(`\nLe modèle de l'API Urssaf a changé (${echecs.length} écart(s)).`);
  console.error("Relire src/lib/simulateur/urssaf.ts (surcharges de la réforme de l'assiette, MIGRATION.md § 9.fv)");
  console.error("avant toute autre chose : si la réforme y est entrée, les surcharges la comptent deux fois.");
  process.exit(1);
}
console.log("\nModèle inchangé : les surcharges de la réforme restent nécessaires et lues.");
