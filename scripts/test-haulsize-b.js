#!/usr/bin/env node
// test-haulsize-b.js — proof test for the haulsize instrument (DIAG).
// Pure checks run by default (no sim). Live modes, on NON-JUDGED seed
// 51509 only, prove the instrument records real trips:
//   --live-control : one 30d run; asserts days, returns, forage events,
//     trip-end snapshots, and a return census via the judged code path.
//   --live-det     : two 30d runs; asserts byte-identical day/forage/
//     return census (minus sayLines) across runs.
// Env for live modes (same substrate as judged legs):
//   POLICY=competent COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
//   DEPOSITGATE=0 DAYS=30
'use strict';
process.env.POLICY = 'competent';
process.env.COMPETENT_FEAST = '0';
process.env.SEATDRIVE = '0';
process.env.PLENTYDEPRI = '0';
process.env.DEPOSITGATE = '0';
process.env.DAYS = '30';
const lib = require('./haulsize-b-lib');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function pure() {
  // Shelled-net formula (engine: round(hidden x 0.75)).
  check('shelled 200 -> 150', lib.shelledNetEach(200, 0) === 150);
  check('shelled 150 -> 113', lib.shelledNetEach(150, 0) === 113);
  check('shelled fallback kcalEach', lib.shelledNetEach(null, 100) === 75);
  // summarizePack: finished + shelled + unknown, no double count.
  const isUnproc = (it) => it.foodState === 'in_shell';
  const s = lib.summarizePack([
    { kcalEach: 100, units: 5, foodKind: null, foodState: 'fresh' },
    { kcalEach: 0, units: 8, foodKind: 'nut', foodState: 'in_shell', hiddenKcal: 200, plantId: 'hickory_nut' },
    { kcalEach: 0, units: 3, foodKind: null, foodState: null, lump: [{ pid: 'x', units: 3 }] },
  ], isUnproc, (lump) => lump.reduce((t, c) => t + c.units * 40, 0));
  check('pack finished 500', s.finishedKcal === 500, s);
  check('pack shelled 1200', s.shelledNet === 1200, s);
  check('pack unknown 120', s.unknownValue === 120, s);
  check('pack combined 1820', s.combined === 1820, s);
  check('pack nutUnits 8', s.nutUnits === 8, s);
  check('pack acorn 0', s.acornUnits === 0, s);
  // classifyTripDay: priority + boundaries.
  const base = { forageSuccesses: 1, forageAttempts: 1, forageFailures: [],
    packKgAtTripEnd: 5, packCapAtTripEnd: 20, stockedRemainingAtTripEnd: 3,
    ticksRemainingAtTripEnd: 300, medianTripCost: 100, secondTripAttempted: false };
  check('classify POLICY_ONE_TRIP', lib.classifyTripDay(base) === 'POLICY_ONE_TRIP');
  check('classify PACK_FULL via say', lib.classifyTripDay({ ...base,
    forageFailures: [{ say: 'Your pack is full. Eat something' }] }) === 'PACK_FULL');
  check('classify PACK_FULL via kg', lib.classifyTripDay({ ...base, packKgAtTripEnd: 19.5 }) === 'PACK_FULL');
  check('classify PACK_FULL beats NO_TARGETS', lib.classifyTripDay({ ...base,
    packKgAtTripEnd: 20, stockedRemainingAtTripEnd: 0 }) === 'PACK_FULL');
  check('classify NO_MORE_TARGETS', lib.classifyTripDay({ ...base, stockedRemainingAtTripEnd: 0 }) === 'NO_MORE_TARGETS');
  check('classify OUT_OF_TIME strict <', lib.classifyTripDay({ ...base, ticksRemainingAtTripEnd: 99 }) === 'OUT_OF_TIME');
  check('classify boundary remaining==cost is not OUT_OF_TIME',
    lib.classifyTripDay({ ...base, ticksRemainingAtTripEnd: 100 }) === 'POLICY_ONE_TRIP');
  check('classify NO_TRIP', lib.classifyTripDay({ forageSuccesses: 0, forageAttempts: 0 }) === 'NO_TRIP');
  check('classify failed-only UNCLASSIFIED', lib.classifyTripDay({ forageSuccesses: 0, forageAttempts: 2, forageFailures: [] }) === 'UNCLASSIFIED');
  check('classify second-trip UNCLASSIFIED', lib.classifyTripDay({ ...base, secondTripAttempted: true }) === 'UNCLASSIFIED');
  // attributeSeed.
  const mk = (cats) => cats.map((c) => ({ category: c }));
  const a1 = lib.attributeSeed(mk(['POLICY_ONE_TRIP', 'POLICY_ONE_TRIP', 'POLICY_ONE_TRIP', 'OUT_OF_TIME', 'PACK_FULL']));
  check('attribute modal >=50%', a1.mechanism === 'POLICY_ONE_TRIP' && a1.share === 0.6, a1);
  const a2 = lib.attributeSeed(mk(['POLICY_ONE_TRIP', 'OUT_OF_TIME', 'PACK_FULL', 'NO_MORE_TARGETS']));
  check('attribute scattered unattributed', a2.mechanism === null, a2);
  const a3 = lib.attributeSeed(mk(['POLICY_ONE_TRIP', 'POLICY_ONE_TRIP', 'POLICY_ONE_TRIP']));
  check('attribute too-few-days unattributed', a3.mechanism === null && a3.unattributedReason === 'too-few-trip-days', a3);
  // dominantMechanism.
  const d1 = lib.dominantMechanism([{ mechanism: 'POLICY_ONE_TRIP' }, { mechanism: 'POLICY_ONE_TRIP' }, { mechanism: null }]);
  check('dominant count 2', d1.mechanism === 'POLICY_ONE_TRIP' && d1.count === 2 && d1.attributedSeeds === 2, d1);
  const d2 = lib.dominantMechanism(Array.from({ length: 6 }, (_, i) => ({ mechanism: i < 3 ? 'A' : 'B' })));
  check('dominant scattered flag', d2.scattered === true && d2.count === 3, d2);
  console.log('haulsize pure: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

async function liveControl() {
  const { oneInstance } = require('./haulsize-b-driver');
  const inst = await oneInstance(51509);
  const live = inst.homecomings.filter((h) => !h.overAtEntry);
  const forages = inst.days.flatMap((d) => d.forages || []);
  const successes = forages.filter((f) => f.ok);
  const tripEnds = inst.days.filter((d) => d.tripEnd);
  console.log('live-control seed=51509 days=' + inst.days.length + ' daysAlive=' + inst.daysAlive +
    ' liveReturns=' + live.length + ' forageEvents=' + forages.length +
    ' successes=' + successes.length + ' tripEnds=' + tripEnds.length);
  check('control 30 loopDays', inst.days.length === 30, inst.days.length);
  check('control live returns >0', live.length > 0, live.length);
  check('control forage events >0', forages.length > 0, forages.length);
  check('control successful forages >0', successes.length > 0, successes.length);
  check('control trip-end snapshots >0', tripEnds.length > 0, tripEnds.length);
  check('control return packs present', live.every((h) => Array.isArray(h.packBefore)), null);
  check('control forage events carry tick deltas', forages.every((f) => f.ticksDelta === null || typeof f.ticksDelta === 'number'), null);
  // Judged code path: analyzer runs on this instance without error.
  const { analyzeSeed } = require('./analyze-haulsize-b');
  const a = analyzeSeed(inst);
  check('control analyzer maxCombined numeric', typeof a.maxCombined === 'number' && a.maxCombined >= 0, a.maxCombined);
  check('control analyzer tripDays >0', a.tripDays > 0, a.tripDays);
  console.log('haulsize live-control: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

async function liveDet() {
  const { oneInstance } = require('./haulsize-b-driver');
  const strip = (inst) => JSON.stringify({ days: inst.days, homecomings: inst.homecomings,
    deposits: inst.deposits, donates: inst.donates, forageTele: inst.forageTele,
    daysAlive: inst.daysAlive, endReason: inst.endReason });
  const a = strip(await oneInstance(51509));
  const b = strip(await oneInstance(51509));
  check('determinism identical census', a === b, { lenA: a.length, lenB: b.length });
  console.log('haulsize live-det: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

async function main() {
  const mode = process.argv[2] || '';
  let ok = true;
  if (mode === '--live-control') ok = await liveControl();
  else if (mode === '--live-det') ok = await liveDet();
  else ok = pure();
  process.exit(ok ? 0 : 1);
}
if (require.main === module) main().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
module.exports = { pure };
