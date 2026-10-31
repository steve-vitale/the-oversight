// test-fedevening-b.js — proof for sim-fedevening-b (pure tests; corpus
// checks appended after judged legs run). Run: node scripts/test-fedevening-b.js
'use strict';
const assert = require('assert');
const {
  findDeadfallTarget, fireCostFor, substitutionLine, blocksCell,
  isDeadfallCell, kindRank, withFedevening, newStore,
} = require('./policies/fedevening-diag');
const { linkedRescues, strandOf, starvationCount } = require('./analyze-fedevening-b');

let n = 0;
function check(name, fn) {
  n++;
  try { fn(); console.log('ok ' + n + ' ' + name); }
  catch (e) { console.error('FAIL ' + n + ' ' + name + ': ' + (e && e.message)); process.exitCode = 1; }
}
const noBlock = () => false;
function grid(rows) { return rows.map((r) => r.split('')); }

// --- findDeadfallTarget ---
check('empty grid null', () => {
  assert.strictEqual(findDeadfallTarget(grid(['.........', '.........', '.........', '.........', '.........', '.........', '.........', '.........', '.........']), [4, 4], noBlock), null);
});
check('adjacent bigtree path empty', () => {
  const g = grid(['.........', '.........', '.........', '.........', '....B....', '.........', '.........', '.........', '.........']);
  // 'B' is not a cell value; use real values below instead
  void g;
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[4][5] = 'bigtree';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.ok(r); assert.deepStrictEqual(r.target, { x: 5, y: 4, cell: 'bigtree' });
  assert.deepStrictEqual(r.path, []);
});
check('bigtree beats tree on tie', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[4][3] = 'tree'; g2[4][5] = 'bigtree';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.strictEqual(r.target.cell, 'bigtree');
});
check('bush is its own stance', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[4][4] = 'bush';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.ok(r); assert.deepStrictEqual(r.stance, [4, 4]); assert.deepStrictEqual(r.path, []);
});
check('thicket counts as deadfall', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[5][4] = 'thicket';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.ok(r); assert.strictEqual(r.target.cell, 'thicket');
});
check('walled ring null', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  for (let x = 3; x <= 5; x++) { g2[3][x] = 'wall'; g2[5][x] = 'wall'; }
  g2[4][3] = 'wall'; g2[4][5] = 'wall';
  g2[4][7] = 'tree';
  const blocks = (c) => c === 'wall' || c === 'tree' || c === 'bigtree';
  assert.strictEqual(findDeadfallTarget(g2, [4, 4], blocks), null);
});
check('two-step path reconstructed', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[4][6] = 'tree';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.ok(r); assert.strictEqual(r.path.length, 1); // one step to a stance
  // Stance must be Chebyshev-adjacent to the tree (diagonal stances count:
  // gatherFallen adjacency is Chebyshev <= 1, so (5,3) is valid).
  assert.ok(Math.max(Math.abs(r.stance[0] - 6), Math.abs(r.stance[1] - 4)) <= 1);
  assert.deepStrictEqual(r.path, [r.stance]);
});
check('out-of-bounds start null', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  assert.strictEqual(findDeadfallTarget(g2, [9, 9], () => false), null);
});
check('row-major tie-break', () => {
  const g2 = [];
  for (let y = 0; y < 9; y++) { g2.push([]); for (let x = 0; x < 9; x++) g2[y].push('.'); }
  g2[3][4] = 'tree'; g2[5][4] = 'tree';
  const r = findDeadfallTarget(g2, [4, 4], () => false);
  assert.deepStrictEqual([r.target.x, r.target.y], [4, 3]);
});

// --- fire cost / lines / cells ---
check('fireCostFor lighter/moss/plain', () => {
  assert.strictEqual(fireCostFor(true, false), 8);
  assert.strictEqual(fireCostFor(false, true), 32);
  assert.strictEqual(fireCostFor(false, false), 48);
});
check('substitutionLine lit/failed/gather/none', () => {
  assert.ok(substitutionLine({ fireAttempted: true, fireLit: true, branchesAfter: 2 }).includes('branch fire'));
  const f = substitutionLine({ fireAttempted: true, fireLit: false, branchesAfter: 2 });
  assert.ok(f.includes("won't catch") && !f.includes('takes the night'));
  assert.ok(substitutionLine({ fireAttempted: false, fireLit: false, branchesAfter: 2 }).includes('Branches gathered'));
  assert.strictEqual(substitutionLine({ fireAttempted: false, fireLit: false, branchesAfter: 1 }), null);
});
check('isDeadfallCell set', () => {
  for (const c of ['tree', 'bigtree', 'bush', 'thicket']) assert.strictEqual(isDeadfallCell(c), true);
  for (const c of ['wall', 'water', 'fire', '.', 'grass']) assert.strictEqual(isDeadfallCell(c), false);
});
check('kindRank order', () => {
  assert.ok(kindRank('bigtree') < kindRank('tree'));
  assert.ok(kindRank('tree') < kindRank('bush'));
  assert.ok(kindRank('bush') < kindRank('thicket'));
});
check('blocksCell fallback', () => {
  const fake = {};
  assert.strictEqual(blocksCell(fake, 'wall'), true);
  assert.strictEqual(blocksCell(fake, 'bush'), false);
});

// --- wrapper gates (stub inner) ---
check('lever-off records and delegates', () => {
  delete process.env.FEDEVENING;
  const inner = { daily: () => 'inner-ok' };
  const w = withFedevening(inner, newStore());
  const ctx = {};
  assert.strictEqual(w.daily({}, ctx), 'inner-ok');
  assert.strictEqual(ctx._feLast.skip, 'lever-off');
});
check('not-still-creek skip', () => {
  process.env.FEDEVENING = '1';
  const inner = { daily: (G, ctx) => { ctx._wcLast = { outcome: 'travel-refused', bucket: 'other', rescued: false }; } };
  const w = withFedevening(inner, newStore());
  const ctx = {};
  w.daily({}, ctx);
  assert.strictEqual(ctx._feLast.skip, 'not-still-creek');
  delete process.env.FEDEVENING;
});
check('rescued evening skip', () => {
  process.env.FEDEVENING = '1';
  const inner = { daily: (G, ctx) => { ctx._wcLast = { outcome: 'travel-refused', bucket: 'creek', rescued: true }; } };
  const w = withFedevening(inner, newStore());
  const ctx = {};
  w.daily({}, ctx);
  assert.strictEqual(ctx._feLast.skip, 'not-still-creek');
  delete process.env.FEDEVENING;
});

// --- analyzer pure ---
check('strandOf runs', () => {
  const d = { evenings: [
    { loopDay: 7, woodcarry: { bucket: 'creek', rescued: false } },
    { loopDay: 8, woodcarry: { bucket: 'creek', rescued: false } },
    { loopDay: 9, woodcarry: { bucket: 'creek', rescued: true } },
    { loopDay: 10, woodcarry: { bucket: 'creek', rescued: false } },
  ] };
  const s = strandOf(d);
  assert.deepStrictEqual(s.still, [7, 8, 10]);
  assert.deepStrictEqual(s.runs, [[7, 8], [10]]);
});
check('linkedRescues joint gate', () => {
  const variant = {
    rescued: [10], still: [7, 8, 9],
    byDay: {
      10: { loopDay: 10, bucket: 'creek', rescued: true, wood: 4 },
      8: { loopDay: 8, bucket: 'creek', rescued: false, wood: 4, fe: { branchesAfter: 2 }, warmth: { acted: false, miss: 'branches-available', logSpent: null } },
      9: { loopDay: 9, bucket: 'creek', rescued: false, wood: 4, fe: { branchesAfter: 0 }, warmth: { acted: true, miss: null, logSpent: 1 } },
    },
  };
  const links = linkedRescues([7, 8, 9, 10], variant, 'on');
  assert.strictEqual(links.length, 1);
  assert.strictEqual(links[0].linkEvening, 8);
  // No link when wood at rescue is short.
  const v2 = JSON.parse(JSON.stringify(variant));
  v2.byDay[10].wood = 3;
  assert.strictEqual(linkedRescues([7, 8, 9, 10], v2, 'on').length, 0);
  // No link when the rescue is outside the control range.
  const v3 = JSON.parse(JSON.stringify(variant));
  v3.rescued = [11];
  v3.byDay[11] = { loopDay: 11, bucket: 'creek', rescued: true, wood: 4 };
  assert.strictEqual(linkedRescues([7, 8, 9, 10], v3, 'on').length, 0);
});
check('starvationCount case-insensitive', () => {
  assert.strictEqual(starvationCount([{ cause: 'starvation' }, { cause: 'the wild' }, { note: 'STARVED' }]), 2);
});

// --- corpus checks (DIAG run: strand set empty on this base) ---
// These run over the committed corpora only; they assert the DIAG's
// factual basis (clean legs, zero creek evenings everywhere), never a
// strand verdict (there is no strand to judge).
const fs = require('fs');
const path = require('path');
const EV = path.join(__dirname, '..', 'evidence', '2026-10-31');
function loadDir(dir, prefix) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[d.seed] = d;
  }
  return out;
}
function creekStill(d) {
  return (d.evenings || []).filter((e) => (e.woodcarry || {}).bucket === 'creek');
}
check('pilot corpus 8/8, errs 0, zero creek evenings', () => {
  const pilot = loadDir(path.join(EV, 'sim-fedevening-b-corpus-pilot-on'));
  assert.strictEqual(Object.keys(pilot).length, 8);
  for (const seed of Object.keys(pilot)) {
    const d = pilot[seed];
    assert.strictEqual(d.errCount, 0, 'seed ' + seed + ' errs');
    assert.strictEqual(d.daysAlive, 30, 'seed ' + seed + ' daysAlive');
    assert.strictEqual(creekStill(d).length, 0, 'seed ' + seed + ' creek evenings');
  }
  const p15215 = pilot[15215];
  assert.strictEqual(p15215.fedeveningStore.acted, 0);
  assert.strictEqual(p15215.fedeveningStore.errs, 0);
  assert.strictEqual(p15215.warmthStore.acted, 0);
});
check('control corpora 8/8 per leg, errs 0, zero creek evenings', () => {
  for (const leg of ['sim-fedevening-b-control-on', 'sim-fedevening-b-control-guard']) {
    const legs = loadDir(path.join(EV, leg));
    assert.strictEqual(Object.keys(legs).length, 8, leg);
    for (const seed of Object.keys(legs)) {
      const d = legs[seed];
      assert.strictEqual(d.errCount, 0, leg + ' seed ' + seed + ' errs');
      assert.strictEqual(creekStill(d).length, 0, leg + ' seed ' + seed + ' creek');
    }
  }
});
check('driftcheck corpora reproduce stay-home on 15215 both legs', () => {
  for (const leg of ['sim-fedevening-b-driftcheck-on', 'sim-fedevening-b-driftcheck-guard']) {
    const legs = loadDir(path.join(EV, leg));
    assert.strictEqual(Object.keys(legs).length, 1, leg);
    const d = legs[15215];
    assert.strictEqual(d.errCount, 0);
    assert.strictEqual(creekStill(d).length, 0);
    assert.strictEqual(d.daysAlive, 30);
  }
});
check('pilot 15215 vessel never leaves haven', () => {
  const pilot = loadDir(path.join(EV, 'sim-fedevening-b-corpus-pilot-on'));
  const d = pilot[15215];
  assert.ok((d.evenings || []).every((e) => e.tile === 'haven'));
  assert.strictEqual(d.spawn.pos.vesselId, 'gen_gyft62f');
});

console.log('test-fedevening-b: ' + n + ' checks, exit=' + (process.exitCode || 0));
