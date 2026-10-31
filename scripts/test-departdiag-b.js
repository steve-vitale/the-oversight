#!/usr/bin/env node
// test-departdiag-b.js — proof for sim-departdiag-b.
// PURE tests (always run, no game, no RNG): isAtHaven, needTrip
// decomposition, activity classes, and every classifyDay gate kind.
// CORPUS checks (only with --corpus <guardDir> <onDir>): 8/8 files per
// leg, errs 0, decision/evening counts, guard/ON reporting, creek
// counts, and the prereg's instrument-integrity facts.
// Usage: node scripts/test-departdiag-b.js [--corpus <guardDir> <onDir>]
// Exit 0 only when every executed check passes.
// (DIAG ONLY: no game code, no policy, no writes except --out JSON.)
'use strict';
const fs = require('fs');
const path = require('path');
const { isAtHaven, needTripDecomposition, activityClass, classifyDay, analyzeSeed } = require('./analyze-departdiag-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function havenPos(over) {
  return Object.assign({ inside: false, tile: 'forest', mapPx: 3, mapPy: 4, havenPx: 4, havenPy: 4 }, over || {});
}

// --- isAtHaven ---
check('haven: inside true', isAtHaven(havenPos({ inside: true })) === true);
check('haven: tile haven', isAtHaven(havenPos({ tile: 'haven' })) === true);
check('haven: map == village node', isAtHaven(havenPos({ mapPx: 4, mapPy: 4 })) === true);
check('haven: away map + forest tile', isAtHaven(havenPos({})) === false);
check('haven: null pos', isAtHaven(null) === false);
check('haven: inside false + map null', isAtHaven({ inside: false, tile: 'forest', mapPx: null, mapPy: null, havenPx: 4, havenPy: 4 }) === false);

// --- needTrip decomposition ---
{
  const d = needTripDecomposition({ pantry: { kcal: 30000 }, morning: { kcal: 1500 }, kcalCap: 2000, lastGiveDayBefore: 5, day: 6 });
  check('decomp: pantryOK', d.pantryOK === true);
  check('decomp: kcalOK (1500 >= 1000)', d.kcalOK === true);
  check('decomp: giveOK (6-5=1 < 3)', d.giveOK === true);
}
{
  const d = needTripDecomposition({ pantry: { kcal: 20000 }, morning: { kcal: 400 }, kcalCap: 2000, lastGiveDayBefore: 0, day: 10 });
  check('decomp: pantry fail', d.pantryOK === false);
  check('decomp: kcal fail', d.kcalOK === false);
  check('decomp: give fail (10-0=10)', d.giveOK === false);
}
{
  const d = needTripDecomposition({ pantry: { kcal: 25000 }, morning: { kcal: 1000 }, kcalCap: 2000, lastGiveDayBefore: 4, day: 6 });
  check('decomp: boundary pantry 25000 OK', d.pantryOK === true);
  check('decomp: boundary kcal 1000 == cap/2 OK', d.kcalOK === true);
  check('decomp: boundary give 6-4=2 < 3 OK', d.giveOK === true);
}
{
  const d = needTripDecomposition({ pantry: { kcal: 30000 }, morning: { kcal: 1500 }, kcalCap: 2000, lastGiveDayBefore: 3, day: 6 });
  check('decomp: give boundary 6-3=3 NOT OK', d.giveOK === false);
}
{
  const d = needTripDecomposition({ pantry: null, morning: null, kcalCap: null, lastGiveDayBefore: null, day: 6 });
  check('decomp: nulls propagate (except lastGive, which the code reads as 0)', d.pantryOK === null && d.kcalOK === null && d.giveOK === false, d);
}
{
  const d = needTripDecomposition({ pantry: { kcal: 30000 }, morning: { kcal: 2000 }, kcalCap: 2000, lastGiveDayBefore: null, day: 2 });
  check('decomp: unset lastGive reads as day 0 (spawn days 1-2 giveOK)', d.giveOK === true && d.lastGiveDay === 0, d);
}

// --- activity classes ---
check('activity: silent', activityClass([], {}) === 'silent');
check('activity: forage wins', activityClass(['You forage the thicket.'], {}) === 'forage-trip');
check('activity: forage via ctx delta', activityClass(['Something else.'], { forageTrips: 1 }) === 'forage-trip');
check('activity: forager mention is NOT a forage trip (runner complaint)',
  activityClass(['Your foragers are stripping our side of the southwest ground. Back off.'], {}) === 'other');
check('activity: horizon foragers line is NOT a forage trip',
  activityClass(['You see smoke on the horizon. Emberhold — 12 people, 3 days in. foragers, by the look of it.'], {}) === 'other');
check('activity: garden-fish-trap', activityClass(['You sow the garden.'], {}) === 'garden-fish-trap');
check('activity: assign', activityClass(["Fish. They'll report back by next part."], {}) === 'assign');
check('activity: talk', activityClass(['You gossip with Fatima.'], {}) === 'talk');
check('activity: eat-drink-rest', activityClass(['You eat beans from the pantry.'], {}) === 'eat-drink-rest');
check('activity: other fallback', activityClass(['Overnight, unknown nuts went bad.'], {}) === 'other');

// --- classifyDay: every gate kind ---
function dec(over) {
  return Object.assign({
    morning: havenPos({ mapPx: 4, mapPy: 4 }), pantry: { kcal: 30000 }, kcalCap: 2000,
    day: 6, lastGiveDayBefore: 5, lastGiveDayAfter: 5,
    needTrip: false, recovering: false, ctxDelta: { forageTrips: 0 },
  }, over || {});
}
function eve(over) {
  return Object.assign({
    inside: false, tile: 'haven', mapPx: 4, mapPy: 4, havenPx: 4, havenPy: 4,
    eveningOutcome: 'completed', gameOver: false, dayLines: [],
  }, over || {});
}
check('classify: stay-needtrip-false',
  classifyDay(dec({}), eve({})).kind === 'stay-needtrip-false');
check('classify: departed-needtrip-true',
  classifyDay(dec({ needTrip: true }), eve({ tile: 'forest', mapPx: 3, mapPy: 4 })).kind === 'departed-needtrip-true');
check('classify: departed-buffer-divergence (needTrip false, ended away)',
  classifyDay(dec({}), eve({})).kind === 'stay-needtrip-false' &&
  classifyDay(dec({}), eve({ tile: 'forest', mapPx: 5, mapPy: 4 })).kind === 'departed-buffer-divergence');
check('classify: stay-recovering',
  classifyDay(dec({ needTrip: true, recovering: true }), eve({})).kind === 'stay-recovering');
check('classify: stay-day-trip-home (needTrip true, forage delta, ended home)',
  classifyDay(dec({ needTrip: true, ctxDelta: { forageTrips: 1 } }), eve({})).kind === 'stay-day-trip-home');
check('classify: stay-unknown-downstream (needTrip true, no evidence)',
  classifyDay(dec({ needTrip: true }), eve({})).kind === 'stay-unknown-downstream');
check('classify: away-origin (morning away)',
  classifyDay(dec({ morning: havenPos({ mapPx: 6, mapPy: 6 }) }), eve({})).kind === 'away-origin');
check('classify: away-origin morning inside counts haven, not away',
  classifyDay(dec({ morning: havenPos({ inside: true }) }), eve({})).kind === 'stay-needtrip-false');
check('classify: game-over',
  classifyDay(dec({}), eve({ gameOver: true, eveningOutcome: 'game-over' })).kind === 'game-over');
check('classify: no-evening',
  classifyDay(dec({}), null).kind === 'no-evening');
check('classify: stay flags', (() => {
  const c = classifyDay(dec({}), eve({}));
  return c.stay === true && c.departed === false && c.awayOrigin === false;
})());
check('classify: departed flags', (() => {
  const c = classifyDay(dec({ needTrip: true }), eve({ tile: 'forest', mapPx: 3, mapPy: 4 }));
  return c.departed === true && c.stay === false;
})());

// --- analyzeSeed aggregation on a fixture ---
{
  const inst = {
    seed: 99999, woodwarm: '0', daysAlive: 30, endReason: 'survived', errCount: 0,
    spawn: { pos: { vesselId: 'gen_test' } },
    decisions: [
      dec({ loopDay: 1 }), dec({ loopDay: 2, needTrip: true }),
      dec({ loopDay: 3, morning: havenPos({ mapPx: 6, mapPy: 6 }) }),
    ],
    evenings: [
      eve({ loopDay: 1, woodcarry: { bucket: 'creek', rescued: false } }),
      eve({ loopDay: 2, tile: 'forest', mapPx: 3, mapPy: 4 }),
      eve({ loopDay: 3, woodcarry: { bucket: 'creek', rescued: true } }),
    ],
  };
  const r = analyzeSeed(inst);
  check('analyze: departures=1', r.departures === 1, r.departures);
  check('analyze: stays=1', r.stays === 1, r.stays);
  check('analyze: awayOrigins=1', r.awayOrigins === 1, r.awayOrigins);
  check('analyze: creekStill=1', r.creekStill === 1, r.creekStill);
  check('analyze: creekRescued=1', r.creekRescued === 1, r.creekRescued);
  check('analyze: firstDepartureLoopDay=2', r.firstDepartureLoopDay === 2, r.firstDepartureLoopDay);
  check('analyze: gateCounts', r.gateCounts['stay-needtrip-false'] === 1 && r.gateCounts['departed-needtrip-true'] === 1 && r.gateCounts['away-origin'] === 1, r.gateCounts);
}

// --- corpus checks (only with --corpus) ---
const ci = process.argv.indexOf('--corpus');
if (ci >= 0) {
  const guardDir = process.argv[ci + 1], onDir = process.argv[ci + 2];
  if (!guardDir || !onDir) { console.error('usage: --corpus <guardDir> <onDir>'); process.exit(2); }
  for (const [leg, dir] of [['guard', guardDir], ['on', onDir]]) {
    const files = fs.readdirSync(dir).filter((f) => /^departdiag-b-nighttravel-s\d+\.json$/.test(f)).sort();
    check('corpus ' + leg + ': 8/8 files', files.length === 8, files.length);
    for (const f of files) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      check('corpus ' + leg + ' ' + f + ': errs 0', inst.errCount === 0, inst.errCount);
      check('corpus ' + leg + ' ' + f + ': decisions == evenings', inst.decisions.length === inst.evenings.length, [inst.decisions.length, inst.evenings.length]);
      check('corpus ' + leg + ' ' + f + ': 30 days or game-over', inst.decisions.length === 30 || inst.endReason !== 'survived', [inst.decisions.length, inst.endReason]);
      check('corpus ' + leg + ' ' + f + ': loopDays 1..N contiguous',
        inst.decisions.every((d, i) => d.loopDay === i + 1));
      check('corpus ' + leg + ' ' + f + ': every decision has needTrip reading',
        inst.decisions.every((d) => d.needTrip === true || d.needTrip === false));
      check('corpus ' + leg + ' ' + f + ': every decision has recovering reading',
        inst.decisions.every((d) => d.recovering === true || d.recovering === false));
      check('corpus ' + leg + ' ' + f + ': woodwarm matches leg',
        String(inst.woodwarm) === (leg === 'guard' ? '0' : '1'), inst.woodwarm);
    }
  }
  // Cross-leg: same seeds both legs.
  const gSeeds = fs.readdirSync(guardDir).filter((f) => /^departdiag-b-nighttravel-s\d+\.json$/.test(f)).sort();
  const oSeeds = fs.readdirSync(onDir).filter((f) => /^departdiag-b-nighttravel-s\d+\.json$/.test(f)).sort();
  check('corpus: same seed files both legs', JSON.stringify(gSeeds) === JSON.stringify(oSeeds), [gSeeds, oSeeds]);
} else {
  console.error('corpus checks skipped (no --corpus); pure checks only');
}

console.log('test-departdiag-b: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
