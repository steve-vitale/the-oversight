// test-sortietarget-a.js — proof test for arm sim-sortietarget-a.
// One harness per child process (sortietarget-fixture.js); this file only
// aggregates JSON lines, never loads the game itself.
// Legs (pre-registered in scripts/sortietarget-prereg-20261103.md):
//  (a) Fixture sweep: first-fought agreement 100% over >=20 constructed
//      multi-lingerer sorties (targetMiddle/targetLast/twinTarget).
//  (b) Fought order is a prefix of the expected order in every sortie
//      case (breaks truncate, never reorder).
//  (c) Fallback legs: unmatched key and absent key both fall back to
//      current world order (targetMatched false).
//  (d) Single lingerer, endure, key stability/distinctness (incl. twins),
//      gorge-loop offer record (last announced).
//  (e) Static legs: beats-panel per-lingerer buttons + handler passes
//      spec[2]; threading in havenGrowth; policy cleanliness (no roster/
//      position channel token in the policy file).
//  (f) Attribution fire counts: every ok sortie reports >=1 fought entry
//      (identity captured at fight start); totals printed.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const FIX = path.join(REPO, 'scripts', 'sortietarget-fixture.js');

function run(seed, kase) {
  const raw = execFileSync(process.execPath, [FIX, String(seed), kase],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  const line = raw.trim().split('\n').filter(Boolean).pop();
  const row = JSON.parse(line);
  if (row.error) throw new Error(`fixture ${kase} seed ${seed}: ${row.error}`);
  return row;
}

let failures = 0;
function check(name, fn) {
  try { fn(); console.log('PASS ' + name); }
  catch (e) { failures++; console.log('FAIL ' + name + ': ' + e.message); }
}

const multiSeeds = {
  targetMiddle: [7, 11, 21, 31, 42, 55, 71, 99, 123, 202],
  targetLast: [7, 42, 99, 123, 202],
  twinTarget: [7, 42, 99, 123, 202],
};
const multi = [];
for (const [kase, seeds] of Object.entries(multiSeeds)) {
  for (const s of seeds) multi.push(run(s, kase));
}
const fallback = [run(7, 'unmatched'), run(42, 'unmatched'), run(7, 'absent'), run(42, 'absent')];
const singles = [run(7, 'single'), run(42, 'single')];
const endure = run(7, 'endure');
const offers = [run(7, 'offerRecord'), run(42, 'offerRecord')];
const stability = run(7, 'keyStability');

const fireTotal = multi.concat(fallback, singles)
  .reduce((n, r) => n + ((r.ret && Array.isArray(r.ret.fought)) ? r.ret.fought.length : 0), 0);
console.log(`SWEEP: multi-sorties=${multi.length} fought-entries-total=${fireTotal}`);

check('fixture sweep: 100% first-fought agreement over >=20 multi-sorties', () => {
  assert.ok(multi.length >= 20, `only ${multi.length} multi-sorties`);
  for (const r of multi) {
    assert.ok(r.ret && r.ret.ok, `${r.case} seed ${r.seed} not ok`);
    assert.ok(r.ret.fought && r.ret.fought.length > 0, `${r.case} seed ${r.seed} fought nothing`);
    assert.strictEqual(r.firstFoughtIsTarget, true, `${r.case} seed ${r.seed} first fought ${r.foughtKeys && r.foughtKeys[0]}`);
    assert.strictEqual(r.ret.targetMatched, true, `${r.case} seed ${r.seed} targetMatched false`);
  }
});

check('fought order is a prefix of expected order in every sortie case', () => {
  for (const r of multi.concat(fallback, singles)) {
    assert.strictEqual(r.foughtIsPrefix, true, `${r.case} seed ${r.seed} fought ${JSON.stringify(r.foughtKeys)} vs expected ${JSON.stringify(r.expectedOrder)}`);
  }
});

check('fallback legs: unmatched and absent keys fall back to current order', () => {
  for (const r of fallback) {
    assert.strictEqual(r.ret.targetMatched, false, `${r.case} targetMatched true`);
    assert.ok(r.ret.fought && r.ret.fought.length > 0, `${r.case} fought nothing`);
  }
});

check('single lingerer: target fought first; twins get distinct keys', () => {
  for (const r of singles) {
    assert.strictEqual(r.firstFoughtIsTarget, true, `single seed ${r.seed}`);
  }
  for (const r of multi.filter(x => x.case === 'twinTarget')) {
    assert.strictEqual(r.keysDistinct, true, `twin seed ${r.seed} keys collide`);
    assert.strictEqual(r.raiderIds[0], r.raiderIds[1], 'twin case is not same-kind');
    assert.strictEqual(r.firstFoughtIsTarget, true, `twin seed ${r.seed} first fought is not the aimed twin`);
  }
});

check('endure unaffected; keys stable across calls', () => {
  assert.strictEqual(endure.ret, 'endured');
  assert.ok(endure.beatDay !== undefined && endure.beatDay !== null, 'beatDay not set');
  assert.strictEqual(stability.keysStable, true);
});

check('gorge loop records the last announced offer', () => {
  for (const r of offers) {
    assert.ok(r.offer && r.offer.key, `offerRecord seed ${r.seed} no offer`);
    assert.strictEqual(r.offerMatchesLast, true, `offerRecord seed ${r.seed} offer key ${r.offer.key} != last raider key`);
  }
});

check('attribution fire counts: every ok sortie reports >=1 fought entry', () => {
  for (const r of multi.concat(fallback, singles)) {
    assert.ok(r.ret.ok, `${r.case} seed ${r.seed} not ok`);
    assert.ok(Array.isArray(r.ret.fought) && r.ret.fought.length >= 1, `${r.case} seed ${r.seed} zero fought entries`);
    for (const f of r.ret.fought) {
      assert.ok(f.key && f.id && f.outcome, `fought entry missing identity/outcome: ${JSON.stringify(f)}`);
    }
  }
  console.log(`  fire count total across sweep sorties: ${fireTotal}`);
});

check('static: beats panel carries per-lingerer keys; handler passes target', () => {
  const app = fs.readFileSync(path.join(REPO, 'src', 'js', 'app.js'), 'utf8');
  assert.ok(app.includes('lingerer:sortie:${esc(m.lingerKey'), 'no per-lingerer sortie button template');
  assert.ok(app.includes("Game.answerLingerer(spec[1], spec[2])"), 'handler does not pass spec[2]');
  const hg = fs.readFileSync(path.join(REPO, 'src', 'js', 'havenGrowth.js'), 'utf8');
  assert.ok(hg.includes('answerLingerer(how, targetKey)'), 'answerLingerer not threaded');
  assert.ok(hg.includes('lingererSortie(targetKey)'), 'lingererSortie not threaded');
  assert.ok(hg.includes('lingerKeyFor(m)'), 'lingerKeyFor missing');
  assert.ok(hg.includes('lastLingererOffer'), 'offer record missing');
});

check('policy cleanliness: no roster/position channel in the policy file', () => {
  const pol = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'sortietarget.js'), 'utf8');
  for (const tok of ['lingeringRaiders', 'worldMonsters', 'monsterAt(']) {
    assert.ok(!pol.includes(tok), `policy file contains forbidden token ${tok}`);
  }
  assert.ok(pol.includes('lastLingererOffer'), 'policy does not read the announced offer');
});

if (failures) { console.log(`FAILURES: ${failures}`); process.exit(1); }
console.log('ALL GREEN');
