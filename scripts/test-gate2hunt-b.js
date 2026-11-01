#!/usr/bin/env node
// test-gate2hunt-b.js — pure proof for scripts/analyze-gate2hunt-b.js
// (DIAG ONLY, no game load, no repo writes except a /tmp scratch dir
// for the analyzeDir band-bar cases, cleaned up afterwards).
// Proves the 2343Z metric-review instrument fix: the corrected gate
// accepts a sleep-step engine ending (endReason 'village-lost' /
// 'over-other' with all evening rows gameOver false) while still
// failing genuinely truncated legs, error legs, and count-mismatched
// legs. Also proves the band bar and that refusal counting is
// unchanged by the gate fix (refusals come from eveningOutcome only).
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { gateOf, analyzeDir } = require('./analyze-gate2hunt-b');

let n = 0;
function check(name, cond) { n++; assert.ok(cond, name); console.log('ok ' + n + ' - ' + name); }
function eve(outcome, gameOver) {
  return { loopDay: 1, eveningOutcome: outcome, gameOver: !!gameOver, dayLines: [] };
}
function leg(o) {
  return Object.assign({
    seed: 1, policy: 'bare', days: 30, daysAlive: 30, endReason: 'survived',
    errCount: 0, decisions: [], evenings: [],
  }, o);
}
function daysOf(k, outcome) {
  const ds = [], es = [];
  for (let i = 1; i <= k; i++) { ds.push({ loopDay: i }); es.push(eve(outcome, false)); es[i - 1].loopDay = i; }
  return { decisions: ds, evenings: es };
}

// 1. Survived full horizon passes.
check('survived 30/30 passes', gateOf(leg(daysOf(30, 'completed'))).pass === true);
// 2. THE FIX: village-lost short leg, no evening gameOver, passes,
//    with its reason recorded.
{
  const l = leg(Object.assign(daysOf(35, 'completed'), { days: 60, daysAlive: 35, endReason: 'village-lost' }));
  const g = gateOf(l);
  check('village-lost 35/60, gameOver false everywhere, passes (fix)', g.pass === true);
  check('fix reason recorded', g.completeReason === 'endReason:village-lost');
  // Old predicate (days-complete OR evening gameOver) would fail it:
  const oldComplete = (l.daysAlive === l.days) || l.evenings.some((e) => e.gameOver === true);
  check('old predicate fails the same leg (gap demonstrated)', oldComplete === false);
}
// 3. over-other short leg passes.
check('over-other 20/60 passes', gateOf(leg(Object.assign(daysOf(20, 'completed'), { days: 60, daysAlive: 20, endReason: 'over-other' }))).pass === true);
// 4. Survived-but-short with no gameOver still fails (no masking).
check('survived 35/60, no gameOver, fails', gateOf(leg(Object.assign(daysOf(35, 'completed'), { days: 60, daysAlive: 35, endReason: 'survived' }))).pass === false);
// 5. Evening gameOver still passes (old path preserved).
{
  const es = daysOf(10, 'completed');
  es.evenings[9].gameOver = true;
  check('evening gameOver passes', gateOf(leg(Object.assign(es, { days: 60, daysAlive: 10, endReason: 'survived' }))).pass === true);
}
// 6. Errors fail even with an engine ending.
check('errCount 1 fails despite village-lost', gateOf(leg(Object.assign(daysOf(35, 'completed'), { days: 60, daysAlive: 35, endReason: 'village-lost', errCount: 1 }))).pass === false);
// 7. Count mismatch fails even with an engine ending.
{
  const d = daysOf(35, 'completed');
  d.decisions.pop();
  check('decisions != evenings fails despite village-lost', gateOf(leg(Object.assign(d, { days: 60, daysAlive: 35, endReason: 'village-lost' }))).pass === false);
}
// 8. Band bar via analyzeDir on synthetic corpora in /tmp.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate2hunt-test-'));
  try {
    function seedFile(seed, refusalDays) {
      const evenings = [];
      for (let d = 1; d <= 30; d++) {
        evenings.push({ loopDay: d, eveningOutcome: refusalDays.includes(d) ? 'travel-refused' : 'completed', gameOver: false, dayLines: [], ntTravel: { hopReturnKind: 'block:creek' }, creekremedy: { hopReturnKind: 'block:creek', blockType: 'creek', probeAgrees: true, probeError: null, isCreek: true, blockedTile: { x: 4, y: 3 } } });
      }
      const decisions = evenings.map((e) => ({ loopDay: e.loopDay }));
      fs.writeFileSync(path.join(dir, 's' + seed + '.json'), JSON.stringify({ seed, policy: 'bare', days: 30, daysAlive: 30, endReason: 'survived', errCount: 0, decisions, evenings }));
    }
    seedFile(17701, [4, 5, 6]); // 3 refusals, one seed
    seedFile(17702, [4, 5]);    // 2 refusals, second seed -> band (5 on 2 seeds)
    const out = path.join(dir, 'census.json');
    const c = analyzeDir(dir);
    check('band bar true at 5 refusals on 2 seeds', c.bandBar === true);
    check('band census refusals 5, D 5, gate2 5/5', c.totalRefusals === 5 && c.blockCreekDenominator === 5 && c.gate2Agreement === '5/5');
    check('band census gatePass true', c.gatePass === true);
    check('band census seedsWithRefusals both seeds', JSON.stringify(c.seedsWithRefusals) === JSON.stringify([17701, 17702]));
    // Single-seed-only variant must NOT be a band.
    fs.unlinkSync(path.join(dir, 's17702.json'));
    const c2 = analyzeDir(dir);
    check('single-seed 3 refusals is not a band', c2.bandBar === false && c2.totalRefusals === 3);
    void out;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
console.log('test-gate2hunt-b: ' + n + '/' + n + ' pure checks passed');
