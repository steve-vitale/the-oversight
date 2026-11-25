// test-reunionwild-b.js — proof for the sim-reunionwild-b join.
// Proves the join is deterministic and spot-checks its outputs against
// the published wilddeath / bloodcluster numbers. Pure JSON; no game
// harness, no new sims.
// Usage: node scripts/test-reunionwild-b.js
'use strict';
const assert = require('assert');
const A = require('./analyze-reunionwild-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.log('FAIL ' + name + ' — ' + e.message); process.exitCode = 1; }
}

const a1 = A.analyze();
const a2 = A.analyze();

check('determinism: two runs byte-identical', () => {
  assert.strictEqual(JSON.stringify(a1), JSON.stringify(a2));
});

check('corpora: 16 BC v2 files, seeds 109310-109325; 16 WD files, seeds 109447-109462', () => {
  assert.strictEqual(a1.bcFiles, 16);
  assert.deepStrictEqual(a1.bcSeeds, [109310, 109311, 109312, 109313, 109314, 109315, 109316, 109317, 109318, 109319, 109320, 109321, 109322, 109323, 109324, 109325]);
  assert.strictEqual(a1.wdFiles, 16);
  assert.deepStrictEqual(a1.wdSeeds, [109447, 109448, 109449, 109450, 109451, 109452, 109453, 109454, 109455, 109456, 109457, 109458, 109459, 109460, 109461, 109462]);
});

check('numerator: 95 wild deaths, cross-checked by regDeaths (95)', () => {
  assert.strictEqual(a1.deaths.length, 95);
  assert.strictEqual(a1.regDeathsWildPlayer, 95);
  assert.strictEqual(a1.playerDeathsTotal, 124);
});

check('classification: 0 unclassified, 0 multi-kind (focus_group_eye adds dropped)', () => {
  assert.strictEqual(a1.unclassified.length, 0);
  assert.strictEqual(a1.multiKind.length, 0);
  // the one focus_group+eye death attributes to focus_group alone
  assert.strictEqual(a1.deathsByKind.focus_group, 1);
  assert.strictEqual(a1.deathsByKind.focus_group_eye || 0, 0);
});

check('numerator by kind matches published wilddeath counts', () => {
  assert.strictEqual(a1.deathsByKind.reunion, 29);
  assert.strictEqual(a1.deathsByKind.eulogy, 16);
  assert.strictEqual(a1.deathsByKind.suburb, 8);
  assert.strictEqual(a1.deathsByKind.algorithm, 8);
  assert.strictEqual(a1.deathsByKind.eater, 6);
  assert.strictEqual(a1.deathsByKind.audit, 4);
  assert.strictEqual(a1.deathsByKind.editor, 3);
  assert.strictEqual(a1.deathsByKind.timeslot, 1);
});

check('denominator: 89 genuine TB + 92 refused = 181 w4+ starts; 211 field; pooled 300', () => {
  assert.strictEqual(a1.tbContactsTotal, 89);
  assert.strictEqual(a1.tbRefusedW4, 92);
  assert.strictEqual(a1.tbStartsW4, 181);
  assert.strictEqual(a1.fieldContactsTotal, 211);
  assert.strictEqual(a1.pooledContactsTotal, 300);
});

check('TB contacts by kind match the frozen expectation', () => {
  const t = {};
  for (const r of a1.table) t[r.kind] = r.tbContacts;
  assert.strictEqual(t.reunion, 23);
  assert.strictEqual(t.eulogy, 16);
  assert.strictEqual(t.algorithm, 9);
  assert.strictEqual(t.influencer, 9);
  assert.strictEqual(t.eater, 7);
  assert.strictEqual(t.suburb, 7);
  assert.strictEqual(t.strike, 6);
  assert.strictEqual(t.audit, 3);
  assert.strictEqual(t.editor, 3);
  assert.strictEqual(t.herald, 0);
  assert.strictEqual(t.timeslot, 0);
});

check('field contacts by kind: eulogy-heavy / reunion-light channel split', () => {
  const f = {};
  for (const r of a1.table) f[r.kind] = r.fieldContacts;
  assert.strictEqual(f.eulogy, 54);
  assert.strictEqual(f.reunion, 15);
  assert.strictEqual(f.herald, 19);
});

check('cross-band scaling: BC 72 scholar wild deaths / 2082 days vs WD 95 / 2202', () => {
  assert.strictEqual(a1.bcScholarWildDeaths, 72);
  assert.strictEqual(a1.bcDays, 2082);
  assert.strictEqual(a1.wdDays, 2202);
});

check('rate ratio: reunion 29/23 vs pooled others 40/54, RR 1.70 CI [0.86, 3.37]', () => {
  const rr = a1.rateRatio;
  assert.strictEqual(rr.reunion.deaths, 29);
  assert.strictEqual(rr.reunion.contacts, 23);
  assert.deepStrictEqual(rr.pooledOthers.kinds, ['algorithm', 'eater', 'eulogy', 'influencer', 'strike', 'suburb']);
  assert.strictEqual(rr.pooledOthers.deaths, 40);
  assert.strictEqual(rr.pooledOthers.contacts, 54);
  assert.ok(Math.abs(rr.rr - 1.70) < 0.01, 'RR ' + rr.rr);
  assert.ok(Math.abs(rr.ci95[0] - 0.86) < 0.01, 'CI lo ' + rr.ci95[0]);
  assert.ok(Math.abs(rr.ci95[1] - 3.37) < 0.01, 'CI hi ' + rr.ci95[1]);
});

check('interpretation ladder: ELEVATED-BUT-UNPROVEN', () => {
  assert.strictEqual(a1.interpretation, 'ELEVATED-BUT-UNPROVEN');
  assert.strictEqual(A.interpret({}, undefined, undefined), 'INCONCLUSIVE');
});

check('interpret() ladder rungs', () => {
  assert.strictEqual(A.interpret(2.0, 1.2, 3.0), 'OVER-LETHAL');
  assert.strictEqual(A.interpret(1.0, 0.5, 2.0), 'PROPORTIONAL');
  assert.strictEqual(A.interpret(1.7, 0.86, 3.37), 'ELEVATED-BUT-UNPROVEN');
  assert.strictEqual(A.interpret(0.5, 0.2, 0.9), 'UNDER-LETHAL');
  assert.strictEqual(A.interpret(null, null, null), 'INCONCLUSIVE');
});

check('denominator-zero + structural zero named, not rated', () => {
  const t = {};
  for (const r of a1.table) t[r.kind] = r;
  assert.strictEqual(t.timeslot.denomZero, true);
  assert.strictEqual(t.timeslot.killsPerTbContact, null);
  assert.strictEqual(t.herald.tbContacts, 0);
  assert.strictEqual(t.herald.deaths, 0);
  assert.strictEqual(t.herald.killsPerTbContact, null);
});

console.log(pass + ' checks passed');
