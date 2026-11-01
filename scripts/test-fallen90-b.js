#!/usr/bin/env node
// test-fallen90-b.js — pure proof for sim-fallen90-b (DIAG ONLY).
// (sim-fallen90-b; prereg: evidence/2026-11-01/
// sim-fallen90-b-prereg.md, committed BEFORE any judged leg.)
// Synthetic legs only; no game load. Two parts:
//  (1) 90d-horizon episode classification via the VERBATIM analyzer
//      scripts/analyze-refusewin-b.js (resolved / still-refused-at-90 /
//      ended-other / splitting / instrument gate at 90d scale);
//  (2) static guard: the NEW 90d driver
//      scripts/refusedband-trace-90d-b.js must be the verbatim driver
//      scripts/refusedband-trace-b.js with ONLY the header + DAYS gate
//      changed (inverse-replacement equality), and the original must
//      still carry the {30, 60} gate (i.e. it was not edited).
// Usage: node scripts/test-fallen90-b.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { gateOf, groupEpisodes, classifyEpisode, analyzeLeg } = require('./analyze-refusewin-b');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok ' + n + ' ' + name); }

function eve(day, outcome, extra) {
  return Object.assign({
    loopDay: day, eveningOutcome: outcome, tile: outcome === 'travel-refused' ? 'wetland' : 'haven',
    mapPx: outcome === 'travel-refused' ? 3 : 4, mapPy: outcome === 'travel-refused' ? 5 : 4,
    inside: outcome !== 'travel-refused', gameOver: false, dayLines: [],
    ntTravel: { hopReturnKind: 'block:fallen_tree' },
    creekremedy: { blockType: 'fallen_tree', blockedTile: { x: 4, y: 5 }, routeAroundPath: [[3, 5], [3, 4], [4, 4]], hopReturnKind: 'block:fallen_tree' },
  }, extra || {});
}
function leg(days, evenings, endReason, daysAlive) {
  return {
    seed: 17724, policy: 'bare', days, daysAlive: daysAlive != null ? daysAlive : days,
    endReason: endReason || 'survived', errCount: 0,
    decisions: evenings.map((e) => ({ loopDay: e.loopDay })),
    evenings,
  };
}

check('90d: single-night day-60 episode resolved day 61 by daytime walk', () => {
  const evenings = [eve(60, 'travel-refused'),
    eve(61, 'completed', { dayLines: ['Travel 1 tile to Haven.', 'You walk back into Haven.'] })];
  const { byDay, episodes } = groupEpisodes(evenings);
  assert.strictEqual(episodes.length, 1);
  const c = classifyEpisode(episodes[0], byDay, leg(90, evenings));
  assert.strictEqual(c.classification, 'resolved-by-daytime-walk');
  assert.strictEqual(c.resolutionDay, 61);
  assert.deepStrictEqual(c.days, [60]);
  assert.deepStrictEqual(c.blockedTiles, ['4,5']);
  assert.strictEqual(c.resolutionTravelLines.length, 2);
});

check('90d: episode still-refused at day 90 (horizonDay 90)', () => {
  const evenings = [eve(88, 'travel-refused'), eve(89, 'travel-refused'), eve(90, 'travel-refused')];
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, leg(90, evenings));
  assert.strictEqual(c.classification, 'still-refused-at-horizon');
  assert.strictEqual(c.horizonDay, 90);
});

check('90d: episode ended-other by leg ending (village-lost, day recorded)', () => {
  const evenings = [eve(70, 'travel-refused'), eve(71, 'travel-refused')];
  const L = leg(90, evenings, 'village-lost', 71);
  const { byDay, episodes } = groupEpisodes(evenings);
  const c = classifyEpisode(episodes[0], byDay, L);
  assert.strictEqual(c.classification, 'ended-other');
  assert.strictEqual(c.endKind, 'leg-ended');
  assert.strictEqual(c.endDay, 71);
});

check('90d: episodes split across a non-refused evening (never merged)', () => {
  const evenings = [eve(60, 'travel-refused'), eve(61, 'completed'),
    eve(62, 'travel-refused'), eve(63, 'travel-refused')];
  const { episodes } = groupEpisodes(evenings);
  assert.strictEqual(episodes.length, 2);
  assert.deepStrictEqual(episodes[0].days, [60]);
  assert.deepStrictEqual(episodes[1].days, [62, 63]);
});

check('90d: instrument gate passes on a clean 90d leg, fails on errs', () => {
  const evenings = [eve(60, 'travel-refused'),
    eve(61, 'completed', { dayLines: ['Travel 1 tile to Haven.'] })];
  const clean = leg(90, evenings);
  // analyzeLeg needs a full 90-evening leg for gate daysComplete; gateOf itself
  // only checks errs/counts/complete, so build a 90-row leg for the pass case.
  const full = [];
  for (let d = 1; d <= 90; d++) full.push(d === 60 ? eve(60, 'travel-refused') : eve(d, 'completed'));
  const g = gateOf(leg(90, full));
  assert.strictEqual(g.pass, true);
  const bad = leg(90, full); bad.errCount = 1;
  assert.strictEqual(gateOf(bad).pass, false);
  const a = analyzeLeg(leg(90, full));
  assert.strictEqual(a.totalRefusals, 1);
  assert.strictEqual(a.episodes[0].classification, 'resolved-by-daytime-walk');
  assert.strictEqual(clean.days, 90);
});

check('static guard: 90d driver is verbatim driver + header/DAYS gate only', () => {
  const dir = path.dirname(__filename);
  const orig = fs.readFileSync(path.join(dir, 'refusedband-trace-b.js'), 'utf8');
  const v90 = fs.readFileSync(path.join(dir, 'refusedband-trace-90d-b.js'), 'utf8');
  assert.ok(orig.includes('DAYS !== 30 && DAYS !== 60'), 'original keeps {30,60} gate');
  assert.ok(!orig.includes('DAYS !== 30 && DAYS !== 60 && DAYS !== 90'), 'original has no 90 gate (unedited)');
  assert.ok(v90.includes('DAYS !== 30 && DAYS !== 60 && DAYS !== 90'), 'new driver admits 90');
  // Inverse-replace the three known changes; the result must equal the original exactly.
  let back = v90;
  back = back.replace(
    '// refusedband-trace-90d-b.js — 90d variant of refusedband-trace-b.js (DIAG ONLY).\n// NEW FILE for sim-fallen90-b: byte-identical copy of the verbatim driver\n// except this header and the DAYS gate below ({30, 60, 90}). The original\n// scripts/refusedband-trace-b.js is untouched; see scripts/test-fallen90-b.js\n// static guard, which fails if the two files differ anywhere else.',
    '// refusedband-trace-b.js — travel-refused band hunt driver (DIAG ONLY).');
  back = back.replace('//   SEEDS (default 17601), DAYS in {30, 60, 90} (90d variant only)',
    '//   SEEDS (default 17601), DAYS in {30, 60}');
  back = back.replace("if (DAYS !== 30 && DAYS !== 60 && DAYS !== 90) { console.error('FATAL: DAYS must be 30, 60 or 90 for refusedband legs'); process.exit(2); }",
    "if (DAYS !== 30 && DAYS !== 60) { console.error('FATAL: DAYS must be 30 or 60 for refusedband legs'); process.exit(2); }");
  assert.strictEqual(back, orig, 'new driver differs from original somewhere besides header + DAYS gate');
});

console.log('test-fallen90-b: ' + n + '/6 passed');
