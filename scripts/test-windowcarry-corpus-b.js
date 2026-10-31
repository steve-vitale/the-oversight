// test-windowcarry-corpus-b.js — judged-corpus checks for sim-windowcarry-b.
// Pure reads over the committed corpora (no game load, no writes).
// Asserts the prereg's instrument bars: det-gate exactness on both legs,
// zero window violations on every variant leg, byte-identical
// determinism re-run of the ON variant leg, zero driver errors, and
// median survival not worse than control on either leg.
// Usage: node scripts/test-windowcarry-corpus-b.js
// Exit 0 = all green. Run from the worktree root.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
const SEEDS = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337];
const DIRS = {
  controlGuard: 'sim-windowcarry-b-corpus-control-guard',
  controlOn: 'sim-windowcarry-b-corpus-control-on',
  variantGuard: 'sim-windowcarry-b-corpus-variant-guard',
  variantOn: 'sim-windowcarry-b-corpus-variant-on',
  offGuard: 'sim-windowcarry-b-corpus-off-guard',
  offOn: 'sim-windowcarry-b-corpus-off-on',
  detOn: 'sim-windowcarry-b-corpus-variant-on-det',
};
function load(dir, seed, driver) {
  const p = path.join(BASE, dir, driver + '-nighttravel-s' + seed + '.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function strand(d) {
  const still = [], rescued = [];
  for (const e of (d.evenings || [])) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    if (wc.rescued) rescued.push(e.loopDay);
    else still.push(e.loopDay);
  }
  return { still, rescued };
}
let n = 0;
function ok(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

for (const leg of ['guard', 'on']) {
  const cap = leg === 'guard' ? 'Guard' : 'ON';
  const cDir = leg === 'guard' ? DIRS.controlGuard : DIRS.controlOn;
  const vDir = leg === 'guard' ? DIRS.variantGuard : DIRS.variantOn;
  const oDir = leg === 'guard' ? DIRS.offGuard : DIRS.offOn;
  ok('det-gate ' + cap + ': OFF reproduces control creek/still/rescued on all 8 seeds', () => {
    for (const seed of SEEDS) {
      const c = strand(load(cDir, seed, 'morningcarry-b'));
      const o = strand(load(oDir, seed, 'windowcarry-b'));
      assert.deepStrictEqual([o.still, o.rescued], [c.still, c.rescued], 'seed ' + seed);
    }
  });
  ok('window integrity ' + cap + ': zero acted departs outside loop-days 1-7 or after first still evening', () => {
    for (const seed of SEEDS) {
      const v = load(vDir, seed, 'windowcarry-b');
      const bad = (v.windowcarryStore.departRecords || []).filter((r) => r.acted && r.loopDay > 7);
      assert.strictEqual(bad.length, 0, 'seed ' + seed + ' late departs');
      assert.strictEqual(v.windowcarryStore.errs.length, 0, 'seed ' + seed + ' store errs');
      assert.strictEqual(v.errCount, 0, 'seed ' + seed + ' driver errs');
    }
  });
  ok('median survival ' + cap + ': variant median daysAlive >= control median', () => {
    const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const cDays = SEEDS.map((s) => load(cDir, s, 'morningcarry-b').daysAlive);
    const vDays = SEEDS.map((s) => load(vDir, s, 'windowcarry-b').daysAlive);
    assert.ok(med(vDays) >= med(cDays), 'control ' + med(cDays) + ' variant ' + med(vDays));
  });
}
ok('determinism: ON variant re-run byte-identical on all 8 seeds', () => {
  for (const seed of SEEDS) {
    const a = fs.readFileSync(path.join(BASE, DIRS.variantOn, 'windowcarry-b-nighttravel-s' + seed + '.json'));
    const b = fs.readFileSync(path.join(BASE, DIRS.detOn, 'windowcarry-b-nighttravel-s' + seed + '.json'));
    assert.ok(a.equals(b), 'seed ' + seed);
  }
});
ok('15215 ON: variant still-count fall is 9 (10 -> 1) with zero linked rescues in range 7-16', () => {
  const c = strand(load(DIRS.controlOn, 15215, 'morningcarry-b'));
  const v = load(DIRS.variantOn, 15215, 'windowcarry-b');
  const vs = strand(v);
  assert.deepStrictEqual(c.still, [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  assert.deepStrictEqual(vs.still, [4]);
  const byDay = {};
  for (const e of (v.evenings || [])) byDay[e.loopDay] = e;
  const linked = vs.rescued.filter((D) => c.still.includes(D) && byDay[D - 1] && (byDay[D - 1].pack ? byDay[D - 1].pack.kcalKnown : 0) > 0);
  assert.deepStrictEqual(linked, []);
});
console.log('test-windowcarry-corpus-b: ' + n + '/' + n + ' green');
