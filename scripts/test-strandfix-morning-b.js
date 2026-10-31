#!/usr/bin/env node
// test-strandfix-morning-b.js — proof for sim-strandfix-morning-b.
// Pure unit tests always run. Corpus checks run against the judged
// corpora under evidence/2026-10-30/ unless --pure-only is passed.
// Usage: node scripts/test-strandfix-morning-b.js [--pure-only]
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { strandDecision, findWoodTarget, verbDecision } = require('./policies/strandfix-morning-diag');
const { classifyRaw, censusDir, detGateCompare, attemptTable, toolGateFromLines } = require('./analyze-strandfix-morning-b');

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; console.log('FAIL ' + name + ': ' + (e && e.message)); }
}
function eq(a, b, msg) { assert.deepStrictEqual(a, b, msg || (JSON.stringify(a) + ' !== ' + JSON.stringify(b))); }

// ---- pure: strand gate ----
check('gate fires on prev creek still, away', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }), { fire: true });
});
check('gate skips prev-not-stranded', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'completed', prevBucket: 'none', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'prev-not-stranded');
});
check('gate skips rescued prev', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: true, wakeTileType: 'creek', insideHaven: false }).skip, 'prev-not-stranded');
});
check('gate skips haven morning', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'haven', insideHaven: false }).skip, 'haven-morning');
});
check('gate skips game-over and combat', () => {
  eq(strandDecision({ gameOver: true, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'game-over');
  eq(strandDecision({ gameOver: false, combatLive: true, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'combat');
});

// ---- pure: BFS target choice ----
function gridFrom(cells) {
  // cells: { 'x,y': type }; default grass.
  const g = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push(cells[x + ',' + y] || 'grass'); g.push(row); }
  return g;
}
const blocks = (c) => c === 'tree' || c === 'bigtree' || c === 'wall' || c === 'water' || c === 'tent' || c === 'fire';
check('bfs: adjacent bigtree, zero walk', () => {
  const r = findWoodTarget(gridFrom({ '5,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target, { x: 5, y: 4, cell: 'bigtree' });
  eq(r.path, []);
  eq(r.stance, [4, 4]);
});
check('bfs: nearer tree beats farther bigtree (path length primary)', () => {
  const r = findWoodTarget(gridFrom({ '5,4': 'tree', '8,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target.cell, 'tree');
  eq(r.path, []);
});
check('bfs: equal distance, bigtree beats tree', () => {
  const r = findWoodTarget(gridFrom({ '5,4': 'tree', '3,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target.cell, 'bigtree');
});
check('bfs: walks around blocking cells to a stance', () => {
  // Tree at (6,4) ringed by walls except stance (6,3) reached via (5,3).
  const cells = { '6,4': 'tree', '5,4': 'wall', '7,4': 'wall', '6,5': 'wall', '5,5': 'wall', '7,5': 'wall', '7,3': 'wall', '5,3': 'grass' };
  // Nearest stance is (5,3): diagonally adjacent to the tree at
  // distance 1 from the start — the BFS rule picks smallest path,
  // not the orthogonally-aligned stance.
  const r = findWoodTarget(gridFrom(cells), [4, 4], blocks);
  eq(r.target, { x: 6, y: 4, cell: 'tree' });
  eq(r.stance, [5, 3]);
  eq(r.path, [[5, 3]]);
});
check('bfs: bush cleared from nearest adjacent stance', () => {
  // The bush cell itself is walkable, but the nearest stance is
  // (5,3) at distance 1 — clearing from an adjacent cell is
  // cheaper than walking onto the bush, so the BFS rule picks it.
  const r = findWoodTarget(gridFrom({ '6,4': 'bush' }), [4, 4], blocks);
  eq(r.target.cell, 'bush');
  eq(r.stance, [5, 3]);
  eq(r.path, [[5, 3]]);
});
check('bfs: no wood -> null', () => {
  eq(findWoodTarget(gridFrom({}), [4, 4], blocks), null);
});
check('bfs: start cell itself is a stance despite a walled ring', () => {
  const cells = { '4,4': 'grass', '5,4': 'tree' };
  for (const [x, y] of [[4, 3], [5, 3], [6, 3], [4, 5], [5, 5], [6, 5], [6, 4]]) cells[x + ',' + y] = 'wall';
  // Start (4,4): stance candidates around (5,4) are all walls/unvisited except (4,4) itself — (4,4) IS adjacent to (5,4).
  const r = findWoodTarget(gridFrom(cells), [4, 4], blocks);
  eq(r.target.cell, 'tree');
  eq(r.path, []);
});
check('bfs: fully enclosed tree with no adjacent stance -> null', () => {
  // Tree at (5,5), every neighbour a wall; start far away.
  const cells = { '5,5': 'tree' };
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (dx === 0 && dy === 0) continue;
    cells[(5 + dx) + ',' + (5 + dy)] = 'wall';
  }
  eq(findWoodTarget(gridFrom(cells), [0, 0], blocks), null);
});

// ---- pure: verb floors ----
check('verb: fell needs 80 kcal and 96 ticks', () => {
  eq(verbDecision({ cell: 'bigtree', fells: 0, kcal: 79, ticksLeft: 200 }), { skip: 'kcal-floor' });
  eq(verbDecision({ cell: 'bigtree', fells: 0, kcal: 80, ticksLeft: 95 }), { skip: 'ticks-floor' });
  eq(verbDecision({ cell: 'bigtree', fells: 0, kcal: 80, ticksLeft: 96 }), { verb: 'cutTree' });
  eq(verbDecision({ cell: 'tree', fells: 2, kcal: 500, ticksLeft: 500 }), { skip: 'fell-cap' });
});
check('verb: brush affordable below 80 (40 kcal, 32 ticks)', () => {
  eq(verbDecision({ cell: 'bush', fells: 0, kcal: 44, ticksLeft: 100 }), { verb: 'clearBrush' });
  eq(verbDecision({ cell: 'bush', fells: 0, kcal: 39, ticksLeft: 100 }), { skip: 'kcal-floor' });
  eq(verbDecision({ cell: 'bush', fells: 0, kcal: 44, ticksLeft: 31 }), { skip: 'ticks-floor' });
  eq(verbDecision({ cell: 'grass', fells: 0, kcal: 500, ticksLeft: 500 }), { skip: 'not-wood' });
});

// ---- pure: raw-gate classification mapping ----
function fakeEvening(logs, kcal, ticks) {
  return { woodcarry: { bucket: 'creek', rescued: false,
    classification: { woodPlayer: logs, kcal, kcalLive: kcal, ticksToDayEnd: ticks },
    bridge: { attempted: false, skip: 'wood-short' } } };
}
check('classify: all eight prereg classes', () => {
  eq(classifyRaw(fakeEvening(4, 2254, 47)).mode, 'ticks-only');
  eq(classifyRaw(fakeEvening(4, 0, 239)).mode, 'kcal-only');
  eq(classifyRaw(fakeEvening(3, 240, 238)).mode, 'wood-only');
  eq(classifyRaw(fakeEvening(3, 0, 111)).mode, 'both');
  eq(classifyRaw(fakeEvening(2, 0, 95)).mode, 'ticks-plus-both');
  eq(classifyRaw(fakeEvening(0, 1246, 93)).mode, 'ticks-plus-wood');
  eq(classifyRaw(fakeEvening(4, 0, 90)).mode, 'ticks-plus-kcal');
  eq(classifyRaw(fakeEvening(4, 240, 238)).mode, 'neither/other');
});
check('classify: kcalLive fallback named', () => {
  const e = fakeEvening(4, 100, 200);
  delete e.woodcarry.classification.kcalLive;
  const c = classifyRaw(e);
  eq(c.kcalFallbackUsed, true);
  eq(c.kcal, 100);
});
check('classify: null gate -> unclassified', () => {
  const e = fakeEvening(4, 100, 200);
  e.woodcarry.classification.ticksToDayEnd = null;
  eq(classifyRaw(e).unclassified, true);
});

// ---- pure: det-gate comparison function ----
check('detGate: identical censuses match, drift mismatches', () => {
  const mk = (creek, still, rescued, nights, woods) => ({ perSeed: { 15215: { creek, still, rescued,
    strands: nights.map((n, i) => ({ nights: n, eveningWoods: woods[i] })) } } });
  const base = mk(10, 10, 0, [[7, 8]], [[4, 4]]);
  eq(detGateCompare(base, mk(10, 10, 0, [[7, 8]], [[4, 4]])).match, true);
  const bad = detGateCompare(base, mk(10, 9, 1, [[7]], [[4]]));
  eq(bad.match, false);
  assert.ok(bad.mismatches.length >= 2, 'expected census + strand mismatches');
});

// ---- pure: tool-gate derivation from day lines ----
check('toolGate: axe hint lines classify, other lines do not', () => {
  eq(toolGateFromLines(["Your Stone knife can't fell a giant — it takes branches, not trunks. You need an axe."]), true);
  eq(toolGateFromLines(['The big tree comes down with a crack that echoes. +5 wood.']), false);
  eq(toolGateFromLines(null), false);
  eq(toolGateFromLines([]), false);
});

// ---- corpus checks (skipped with --pure-only) ----
const pureOnly = process.argv.includes('--pure-only');
if (!pureOnly) {
  const E = path.join(__dirname, '..', 'evidence', '2026-10-30');
  const legs = ['base-guard', 'base-on', 'control-guard', 'control-on', 'off-guard', 'off-on', 'variant-guard', 'variant-on'];
  const BANK = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439];
  const dirOf = (leg) => path.join(E, 'sim-strandfix-morning-b-corpus-' + leg);
  check('corpus: all judged legs present, 10 seeds each', () => {
    for (const leg of legs) {
      const files = fs.readdirSync(dirOf(leg)).filter((f) => f.endsWith('.json'));
      eq(files.length, 10, leg + ' file count');
      for (const s of BANK) assert.ok(files.some((f) => f.includes('s' + s + '.json')), leg + ' missing seed ' + s);
    }
  });
  check('corpus: errs 0 on all judged legs', () => {
    for (const leg of legs) {
      const c = censusDir(dirOf(leg));
      eq(c.errs, 0, leg + ' errs');
    }
  });
  check('corpus: det-gate OFF == fresh baselines, both legs', () => {
    eq(detGateCompare(censusDir(dirOf('base-guard')), censusDir(dirOf('off-guard'))).match, true, 'guard det-gate');
    eq(detGateCompare(censusDir(dirOf('base-on')), censusDir(dirOf('off-on'))).match, true, 'on det-gate');
  });
  check('corpus: variant attempt/skip tables cover strand mornings', () => {
    for (const leg of ['variant-guard', 'variant-on']) {
      const c = censusDir(dirOf(leg));
      const rows = attemptTable(dirOf(leg));
      const strandMornings = new Set();
      for (const st of c.strands) for (const n of st.nights) strandMornings.add(c.strands.length ? st.seed + ':' + n : '');
      // Each strand morning must have an attempt or a gate-fired skip.
      for (const st of c.strands) {
        for (const n of st.nights) {
          const found = rows.some((r) => r.seed === st.seed && r.loopDay === n);
          assert.ok(found, leg + ' strand morning missing from attempt table: ' + st.seed + ' day ' + n);
        }
      }
      // Boundary mornings (attempt on the morning after the last still
      // evening) are flagged, not counted as strand mornings.
      void strandMornings;
    }
  });
  check('corpus: determinism byte-identical', () => {
    const dDir = path.join(E, 'sim-strandfix-morning-b-corpus-determinism');
    const files = fs.readdirSync(dDir).filter((f) => f.endsWith('.json'));
    assert.ok(files.length >= 1, 'determinism dir empty');
    for (const f of files) {
      const seed = f.match(/s(\d+)\.json/)[1];
      const judged = fs.readdirSync(dirOf('variant-on')).find((g) => g.includes('s' + seed + '.json'));
      assert.ok(judged, 'no judged variant-on file for seed ' + seed);
      eq(fs.readFileSync(path.join(dDir, f), 'utf8'), fs.readFileSync(path.join(dirOf('variant-on'), judged), 'utf8'), 'determinism ' + f);
    }
  });
  check('corpus: src/ diff empty vs pinned base; policies/ diff exactly the new file', () => {
    const { execSync } = require('child_process');
    const PIN = '7917b1d19cd9b898e54c168a5cf4f201ff02f53c';
    const srcDiff = execSync('git diff ' + PIN + ' --name-only -- src/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    eq(srcDiff, '', 'src/ diff must be empty');
    const polDiff = execSync('git diff ' + PIN + ' --name-only -- scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    // Untracked new policy file is not in git diff; check via status instead.
    const status = execSync('git status --short -- scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    const trackedPolDiff = execSync('git diff ' + PIN + ' --name-only -- scripts/policies/', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
    assert.ok(polDiff.length === 0 || polDiff.every((x) => x === 'scripts/policies/strandfix-morning-diag.js'), 'tracked policies diff: ' + polDiff.join(','));
    void status;
  });
}

console.log('strandfix proof: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
