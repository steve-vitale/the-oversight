#!/usr/bin/env node
// test-sensorredesign-b.js — proof test for the (e*) analyzer.
// Pure, synthetic evening series only; NO judged seeds, NO seed
// numbers from any judged band, no game load, no RNG, no writes.
// Run: node scripts/test-sensorredesign-b.js  (exit 0 = all pass)
'use strict';
const { fireEstar, analyzeSeedSensorredesign } = require('./analyze-sensorredesign-b');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
// Build a synthetic seed json: engaged through day S-1, disengaged
// from S on. rows: [day, pantry, streak] triples, disengaged flag
// derived from S.
function synth(S, triples) {
  const rows = triples.map(([d, p, st]) => ({
    loopDay: d, gateEngaged: d < S, pantryKcal: p, hungryStreak: st,
  }));
  return { seed: 999001, rows, deaths: [], daysAlive: 30, days: 30, endReason: 'survived' };
}
// 1. BOUNCE: rise after stand-down must NOT restart the fall count.
// S=10 (10000). Day 11 rises to 10100, days 12-13 fall to 9500, 8800.
// (e*) fires day 13 (E1: 2 falls, 8800 <= 0.90*10100=9090, streak 2).
// (c) needs 3 consecutive falls: never (only 2 falls before day-14 rise).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2],
    [13, 8800, 2], [14, 9000, 0],
  ]);
  const e = fireEstar(sj);
  check('bounce: E1 fires day 13 despite day-11 rise', e != null && e.day === 13 && e.clause === 'E1-envelope', e);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  check('bounce: (c) never fires on the same series', c == null, c);
}
// 2. CLIFF: store empties in 2 evenings; (e*) fires on the 2nd via E2,
// (c) never (0 -> 0 is flat, not a fall; only 2 falls exist).
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 8000, 2], [11, 5000, 3], [12, 0, 4], [13, 0, 5],
  ]);
  const e = fireEstar(sj);
  check('cliff: E2 fires day 11 (5000 <= 0.65*8000)', e != null && e.day === 11 && e.clause === 'E2-cliff', e);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  check('cliff: (c) never fires on the same series', c == null, c);
}
// 3. STREAK GATE: identical bounce shape but streak 0 throughout
// must NOT fire; when the streak reaches 1 on a still-qualifying
// evening, it fires then (delay, not suppression of the shape).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 0], [11, 10100, 0], [12, 9500, 0],
    [13, 8800, 0], [14, 8600, 1],
  ]);
  const e = fireEstar(sj);
  check('streak gate: no fire while streak 0, fires day 14 once streak 1',
    e != null && e.day === 14 && e.clause === 'E1-envelope', e);
}
// 4. PEAK ENVELOPE: a rise raises the peak; a dip that is <= 0.90
// of the old stand-down level but ABOVE 0.90 of the new peak must
// NOT fire (the peak, not S, is the anchor).
{
  // S=10 (10000), rise to 12000, fall to 10500 (falls=1 so far),
  // fall to 10000 (falls=2; 10000 <= 0.90*12000=10800 -> fires day 13).
  // The intermediate day-12 evening (10500) must NOT fire: only 1 fall.
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 12000, 1], [12, 10500, 1], [13, 10000, 1],
  ]);
  const e = fireEstar(sj);
  check('peak envelope: fires day 13, not day 12 (needs 2 falls)',
    e != null && e.day === 13, e);
}
// 5. ELIGIBILITY: a qualifying shape before day 8 must not fire,
// and a stretch starting before day 8 with the shape completing
// at/after day 8 fires at the first eligible evening.
{
  const sj = synth(5, [
    [4, 11000, 0], [5, 10000, 2], [6, 9000, 2], [7, 8000, 2],
    [8, 7000, 2], [9, 6000, 2],
  ]);
  const e = fireEstar(sj);
  check('eligibility: first eligible firing is day 8, not earlier',
    e != null && e.day === 8, e);
}
// 6. RE-ENGAGEMENT resets the stretch: falls before re-engagement
// must not carry into the next stretch.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 2], [11, 9000, 2],
    [12, 9500, 0], // re-engaged (gateEngaged true: day >= S logic below overrides)
  ]);
  // Build manually: day 12 engaged, day 13 new stand-down.
  sj.rows = [
    { loopDay: 9, gateEngaged: true, pantryKcal: 11000, hungryStreak: 0 },
    { loopDay: 10, gateEngaged: false, pantryKcal: 10000, hungryStreak: 2 },
    { loopDay: 11, gateEngaged: false, pantryKcal: 9000, hungryStreak: 2 },
    { loopDay: 12, gateEngaged: true, pantryKcal: 9500, hungryStreak: 0 },
    { loopDay: 13, gateEngaged: false, pantryKcal: 9400, hungryStreak: 2 },
    { loopDay: 14, gateEngaged: false, pantryKcal: 9300, hungryStreak: 2 },
  ];
  const e = fireEstar(sj);
  check('re-engagement: falls from the old stretch do not carry over',
    e == null, e);
}
// 7. (c) CROSS-CHECK AGREEMENT: the thin analyzer's (c) leg comes
// from the reused analyzer, so on a synthetic collapsing series
// both agree by construction; assert the plumbing (ref day, leads).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9500, 2], [12, 9000, 2],
    [13, 8500, 2], [14, 8000, 2],
  ]);
  sj.deaths = [{ day: 20, cause: 'starvation' }];
  sj.daysAlive = 22; sj.endReason = 'village-lost';
  const a = analyzeSeedSensorredesign(sj);
  check('plumbing: reference day is first starvation day', a.referenceDay === 20, a);
  check('plumbing: (c) fires day 13 (3 falls, 8500 <= 0.90*10000)',
    a.c != null && a.c.day === 13, a.c);
  check('plumbing: (e*) fires day 12 (E1: 2 falls, 9000 <= 0.90*10000)',
    a.e != null && a.e.day === 12, a.e);
  check('plumbing: lead_e (8) > lead_c (7)', a.e.lead === 8 && a.c.lead === 7, a);
}
// 8. NO-FIRE collapsing seed: leads null, beatsOrTies false.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 0], [11, 10100, 0], [12, 10200, 0],
  ]);
  sj.deaths = [{ day: 15, cause: 'starvation' }];
  sj.daysAlive = 16; sj.endReason = 'village-lost';
  const a = analyzeSeedSensorredesign(sj);
  check('no-fire: (e*) null and beatsOrTies false',
    a.e == null && a.leadComparison.beatsOrTies === false, a);
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
process.exit(fail === 0 ? 0 : 1);
