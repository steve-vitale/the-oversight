#!/usr/bin/env node
// test-sensorconfirm3-b.js — proof test for the (e*) screen-then-tracer
// confirm analyzer. Pure, synthetic evening series only; NO judged
// seeds, NO seed numbers from any judged band (synthetic seed 999001
// only, plus synthetic seed ORDER numbers in the sample test, which are
// list positions, not game seeds), no game load, no RNG, no writes.
// Run: node scripts/test-sensorconfirm3-b.js  (exit 0 = all pass)
'use strict';
const { fireEstar, classifyScreen, sampleSurvivors, analyzeSeedSensorconfirm3,
  applyStillCollapsing, summarizeAnalyses } = require('./analyze-sensorconfirm3-b');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
function synth(S, triples) {
  const rows = triples.map(([d, p, st]) => ({
    loopDay: d, gateEngaged: d < S, pantryKcal: p, hungryStreak: st,
  }));
  return { seed: 999001, rows, deaths: [], daysAlive: 30, days: 30, endReason: 'survived' };
}
// 1. BOUNCE: rise after stand-down must NOT restart the fall count.
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
// 2. CLIFF: store empties in 2 evenings; (e*) fires on the 2nd via E2.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 8000, 2], [11, 5000, 3], [12, 0, 4], [13, 0, 5],
  ]);
  const e = fireEstar(sj);
  check('cliff: E2 fires day 11 (5000 <= 0.65*8000)', e != null && e.day === 11 && e.clause === 'E2-cliff', e);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  check('cliff: (c) never fires on the same series', c == null, c);
}
// 3. STREAK GATE: streak 0 throughout must NOT fire; streak 1 on a
// still-qualifying evening fires then.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 0], [11, 10100, 0], [12, 9500, 0],
    [13, 8800, 0], [14, 8600, 1],
  ]);
  const e = fireEstar(sj);
  check('streak gate: no fire while streak 0, fires day 14 once streak 1',
    e != null && e.day === 14 && e.clause === 'E1-envelope', e);
}
// 4. PEAK ENVELOPE: a rise raises the peak; day 12 (1 fall) must not
// fire, day 13 (2 falls, below 0.90 of new peak) fires.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 12000, 1], [12, 10500, 1], [13, 10000, 1],
  ]);
  const e = fireEstar(sj);
  check('peak envelope: fires day 13, not day 12 (needs 2 falls)',
    e != null && e.day === 13, e);
}
// 5. ELIGIBILITY: shape completing at/after day 8 fires at first
// eligible evening, never before day 8.
{
  const sj = synth(5, [
    [4, 11000, 0], [5, 10000, 2], [6, 9000, 2], [7, 8000, 2],
    [8, 7000, 2], [9, 6000, 2],
  ]);
  const e = fireEstar(sj);
  check('eligibility: first eligible firing is day 8, not earlier',
    e != null && e.day === 8, e);
}
// 6. RE-ENGAGEMENT resets the stretch.
{
  const sj = { seed: 999001, rows: [
    { loopDay: 9, gateEngaged: true, pantryKcal: 11000, hungryStreak: 0 },
    { loopDay: 10, gateEngaged: false, pantryKcal: 10000, hungryStreak: 2 },
    { loopDay: 11, gateEngaged: false, pantryKcal: 9000, hungryStreak: 2 },
    { loopDay: 12, gateEngaged: true, pantryKcal: 9500, hungryStreak: 0 },
    { loopDay: 13, gateEngaged: false, pantryKcal: 9400, hungryStreak: 2 },
    { loopDay: 14, gateEngaged: false, pantryKcal: 9300, hungryStreak: 2 },
  ], deaths: [], daysAlive: 30, days: 30, endReason: 'survived' };
  const e = fireEstar(sj);
  check('re-engagement: falls from the old stretch do not carry over', e == null, e);
}
// 7. WINDOW-INCLUSIVE COLLAPSE: village-lost ON day 30 with a
// starvation death IS collapsing (the 81053 shape); village-lost
// with NO starvation death is NOT collapsing (the 81042 shape).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9500, 2], [12, 9000, 2],
    [13, 8500, 2], [14, 8000, 2],
  ]);
  sj.deaths = [{ day: 26, cause: 'starvation' }];
  sj.daysAlive = 30; sj.endReason = 'village-lost';
  const a = analyzeSeedSensorconfirm3(sj);
  check('day-30 loss + starvation death IS collapsing, ref day 26',
    a.collapsing === true && a.referenceDay === 26, a);
  check('day-30 shape: no collapsed-flag divergence',
    a.collapsedDivergence === false, a);
  const sj2 = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9500, 2], [12, 9000, 2],
  ]);
  sj2.deaths = [{ day: 15, cause: 'combat' }];
  sj2.daysAlive = 26; sj2.endReason = 'village-lost';
  const a2 = analyzeSeedSensorconfirm3(sj2);
  check('lost without starvation death is NOT collapsing',
    a2.collapsing === false && a2.referenceDay == null, a2);
}
// 8. NO-FIRE collapsing seed: leads null, beatsOrTies false.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 0], [11, 10100, 0], [12, 10200, 0],
  ]);
  sj.deaths = [{ day: 15, cause: 'starvation' }];
  sj.daysAlive = 16; sj.endReason = 'village-lost';
  const a = analyzeSeedSensorconfirm3(sj);
  check('no-fire: (e*) null and beatsOrTies false',
    a.e == null && a.leadComparison.beatsOrTies === false, a);
}
// 9. SCREEN CLASSIFICATION: endReason + death causes only.
{
  const coll = { seed: 999001, endReason: 'village-lost', daysAlive: 24, days: 30,
    deaths: [{ day: 23, cause: 'starvation' }], rows: [] };
  const surv = { seed: 999001, endReason: 'survived', daysAlive: 30, days: 30,
    deaths: [], rows: [] };
  const other = { seed: 999001, endReason: 'village-lost', daysAlive: 26, days: 30,
    deaths: [{ day: 20, cause: 'combat' }], rows: [] };
  const day30 = { seed: 999001, endReason: 'village-lost', daysAlive: 30, days: 30,
    deaths: [{ day: 26, cause: 'starvation' }], rows: [] };
  check('screen: village-lost + starvation = collapsing', classifyScreen(coll) === 'collapsing');
  check('screen: survived 30d = survivor', classifyScreen(surv) === 'survivor');
  check('screen: lost without starvation = other', classifyScreen(other) === 'other');
  check('screen: day-30 loss + starvation = collapsing', classifyScreen(day30) === 'collapsing');
}
// 10. SURVIVOR SAMPLE: first 16 survivors in seed order, skipping
// collapsing/other lines, never re-sorted by outcome.
{
  const lines = [];
  for (let i = 0; i < 20; i++) {
    lines.push({ seed: 1000 + i, endReason: i % 5 === 0 ? 'village-lost' : 'survived',
      daysAlive: i % 5 === 0 ? 20 : 30, days: 30,
      deaths: i % 5 === 0 ? [{ day: 18, cause: 'starvation' }] : [], rows: [] });
  }
  const sample = sampleSurvivors(lines, 16);
  check('sample: exactly the first 16 survivors in order',
    sample.length === 16 && sample[0] === 1001 && sample[15] === 1019, sample);
}
// 11. STILL-COLLAPSING EXCLUSION: a candidate whose tracer analysis
// is not collapsing is excluded, never counted as a rule failure.
{
  const analyses = [
    { seed: 1, collapsing: true, survived: false, e: { lead: 2 }, leadComparison: { beatsOrTies: true, strictlyBeats: true } },
    { seed: 2, collapsing: false, survived: true, e: null, leadComparison: { beatsOrTies: false, strictlyBeats: false } },
  ];
  const { still, excluded } = applyStillCollapsing(analyses);
  check('still-collapsing: non-collapsing tracer line excluded, not failed',
    still.length === 1 && still[0].seed === 1 && excluded.length === 1 && excluded[0] === 2,
    { still: still.map((s) => s.seed), excluded });
}
// 12. VERDICT ARITHMETIC on fabricated analyses:
// (a) count gate fails -> INSUFFICIENT-DATA even with passing legs;
// (b) count gate passes + a leg fails -> CONFIRM-NO-GO;
// (c) all pass -> CONFIRM-GO.
{
  const mk = (coll, surv, leadE, beats, strict) => ({
    collapsing: coll, survived: surv,
    e: leadE == null ? null : { lead: leadE },
    leadComparison: { beatsOrTies: beats, strictlyBeats: strict },
  });
  const small = [mk(true, false, 2, true, true), mk(true, false, 1, true, false),
    mk(false, true, null, false, false)];
  check('verdict: count gate fail -> INSUFFICIENT-DATA',
    summarizeAnalyses(small).verdict === 'INSUFFICIENT-DATA', summarizeAnalyses(small).verdict);
  const noGo = [];
  for (let i = 0; i < 4; i++) noGo.push(mk(true, false, i === 0 ? null : 2, i !== 0, i !== 0));
  for (let i = 0; i < 12; i++) noGo.push(mk(false, true, null, false, false));
  check('verdict: count gate passes + fire leg fails -> CONFIRM-NO-GO',
    summarizeAnalyses(noGo).verdict === 'CONFIRM-NO-GO', summarizeAnalyses(noGo).verdict);
  const go = [];
  for (let i = 0; i < 4; i++) go.push(mk(true, false, 2, true, true));
  for (let i = 0; i < 16; i++) go.push(mk(false, true, null, false, false));
  check('verdict: all legs pass -> CONFIRM-GO',
    summarizeAnalyses(go).verdict === 'CONFIRM-GO', summarizeAnalyses(go).verdict);
  const costFail = [];
  for (let i = 0; i < 4; i++) costFail.push(mk(true, false, 2, true, true));
  for (let i = 0; i < 16; i++) costFail.push(mk(false, true, i < 5 ? 9 : null, false, false));
  check('verdict: cost 5/16 > 25% -> CONFIRM-NO-GO',
    summarizeAnalyses(costFail).verdict === 'CONFIRM-NO-GO', summarizeAnalyses(costFail).verdict);
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
process.exit(fail === 0 ? 0 : 1);
