#!/usr/bin/env node
// test-strandfix2-b.js — proof for sim-strandfix2-b.
// Pure unit tests always run. Corpus checks run against the judged
// corpora under evidence/2026-10-31/ unless --pure-only is passed.
// Usage: node scripts/test-strandfix2-b.js [--pure-only]
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { strandDecision, flipDecision, findGatherTarget } = require('./policies/strandfix2-diag');
const { loadDir, censusLeg, detGate } = require('./analyze-strandfix2-b');

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
check('gate skips prev-not-stranded and rescued prev', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'completed', prevBucket: 'none', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'prev-not-stranded');
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: true, wakeTileType: 'creek', insideHaven: false }).skip, 'prev-not-stranded');
});
check('gate skips haven morning, game-over, combat', () => {
  eq(strandDecision({ gameOver: false, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'haven', insideHaven: false }).skip, 'haven-morning');
  eq(strandDecision({ gameOver: true, combatLive: false, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'game-over');
  eq(strandDecision({ gameOver: false, combatLive: true, prevOutcome: 'travel-refused', prevBucket: 'creek', prevRescued: false, wakeTileType: 'creek', insideHaven: false }).skip, 'combat');
});

// ---- pure: flip decision (waitsalign 448 line) ----
check('flip: 448 needs 1, 449 banks, 465 banks', () => {
  eq(flipDecision(448), { mode: 'flip', needed: 1 });
  eq(flipDecision(449).mode, 'bank');
  eq(flipDecision(465).mode, 'bank');
});
check('flip: 368 needs 81 -> too far; 401 needs 48 -> flip', () => {
  eq(flipDecision(368), { mode: 'skip', skip: 'flip-too-far', needed: 81 });
  eq(flipDecision(401), { mode: 'flip', needed: 48 });
});
check('flip: clock unknown skips', () => {
  eq(flipDecision(null).skip, 'clock-unknown');
  eq(flipDecision(undefined).skip, 'clock-unknown');
});

// ---- pure: BFS gather target ----
function gridFrom(cells) {
  const g = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push(cells[x + ',' + y] || 'grass'); g.push(row); }
  return g;
}
const blocks = (c) => c === 'tree' || c === 'bigtree' || c === 'wall' || c === 'water' || c === 'tent' || c === 'fire';
check('bfs: adjacent bigtree, zero walk', () => {
  const r = findGatherTarget(gridFrom({ '5,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target, { x: 5, y: 4, cell: 'bigtree' });
  eq(r.path, []);
  eq(r.stance, [4, 4]);
});
check('bfs: nearer tree beats farther bigtree', () => {
  const r = findGatherTarget(gridFrom({ '5,4': 'tree', '8,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target.cell, 'tree');
});
check('bfs: equal distance, bigtree beats tree', () => {
  const r = findGatherTarget(gridFrom({ '5,4': 'tree', '3,4': 'bigtree' }), [4, 4], blocks);
  eq(r.target.cell, 'bigtree');
});
check('bfs: no gatherable cell -> null', () => {
  eq(findGatherTarget(gridFrom({}), [4, 4], blocks), null);
});
check('bfs: bush is its own stance', () => {
  const r = findGatherTarget(gridFrom({ '4,4': 'bush' }), [4, 4], blocks);
  eq(r.target.cell, 'bush');
  eq(r.path, []);
});

// ---- corpus checks (skipped under --pure-only) ----
const pureOnly = process.argv.includes('--pure-only');
if (!pureOnly) {
  const ev = (name) => path.join(__dirname, '..', 'evidence', '2026-10-31', name);
  const pilotOn = loadDir(ev('sim-strandfix2-b-corpus-pilot-on-variant'));
  check('pilot ON corpus present (8 files)', () => {
    assert(pilotOn && pilotOn.files.length === 8, 'pilot files: ' + (pilotOn ? pilotOn.files.length : 'missing dir'));
  });
  check('pilot ON errs 0 on every file', () => {
    for (const [seed, file] of Object.entries((pilotOn || {}).seeds || {})) {
      assert(((file.strandfix2Store || {}).errs || 0) === 0, 'seed ' + seed + ' sf2 errs ' + (file.strandfix2Store || {}).errs);
    }
  });
  check('pilot ON 15215 still evenings all carry an sf2 evening record', () => {
    const f = (pilotOn || {}).seeds['15215'];
    assert(f, '15215 pilot file missing');
    const still = (f.evenings || []).filter((e) => (e.woodcarry || {}).bucket === 'creek' && !(e.woodcarry || {}).rescued);
    assert(still.length > 0, 'no still evenings on pilot 15215');
    for (const e of still) assert(e.sf2Evening, 'still loopDay ' + e.loopDay + ' lacks sf2Evening');
  });
  const cg = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-guard-control')));
  const co = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-on-control')));
  const vg = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-guard-variant')));
  const vo = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-on-variant')));
  const og = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-guard-off')));
  const oo = censusLeg(loadDir(ev('sim-strandfix2-b-corpus-on-off')));
  check('confirm corpora present (8 files each, all six legs)', () => {
    for (const [name, leg] of [['guard-control', cg], ['on-control', co], ['guard-variant', vg], ['on-variant', vo], ['guard-off', og], ['on-off', oo]]) {
      assert(leg && leg.files.length === 8, name + ': ' + (leg ? leg.files.length : 'missing'));
    }
  });
  check('det-gate: OFF legs reproduce control legs exactly', () => {
    const g = detGate(cg, og), o = detGate(co, oo);
    assert(g && g.match, 'guard det-gate mismatches: ' + JSON.stringify(g && g.mismatches));
    assert(o && o.match, 'on det-gate mismatches: ' + JSON.stringify(o && o.mismatches));
  });
  check('variant legs: sf2 errs 0, records complete on 15215 still evenings', () => {
    for (const [name, leg] of [['guard-variant', vg], ['on-variant', vo]]) {
      const f = leg.perSeed['15215'];
      assert(((f.sf2Errs === null || f.sf2Errs === undefined) ? 0 : f.sf2Errs) === 0, name + ' sf2 errs ' + f.sf2Errs);
      for (const row of f.rows.filter((r) => !r.rescued)) {
        assert(row.sf2Evening, name + ' still loopDay ' + row.loopDay + ' lacks sf2Evening');
      }
    }
  });
}

console.log('test-strandfix2-b: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
