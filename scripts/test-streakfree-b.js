#!/usr/bin/env node
// test-streakfree-b.js — proof test for the (v*) = (e*) OR (F) analyzer.
// Pure, synthetic evening series only; NO judged seeds, NO seed numbers
// from any judged band (synthetic seed 999002 only), no game load, no
// RNG, no writes. Run: node scripts/test-streakfree-b.js (exit 0 = pass)
'use strict';
const { fireEstar, fireFallback, fireVariant, fireCIndependent, analyzeSeedStreakfree, summarizeStreakfree, classifyScreen } = require('./analyze-streakfree-b');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
// rows: triples [loopDay, pantry, streak]; S = first disengaged day.
function synth(S, triples, extra) {
  const rows = triples.map(([d, p, st]) => ({
    loopDay: d, gateEngaged: d < S, pantryKcal: p, hungryStreak: st,
  }));
  return Object.assign({
    seed: 999002, rows, deaths: [], daysAlive: 30, days: 30, endReason: 'survived',
  }, extra || {});
}
function synthCollapsing(S, triples, refDay, daysAlive) {
  return synth(S, triples, {
    deaths: [{ day: refDay, cause: 'starvation' }],
    daysAlive: daysAlive == null ? 29 : daysAlive,
    endReason: 'village-lost',
  });
}

check('full policy object: competent.setup/upkeep/daily are functions',
  typeof competent.setup === 'function' && typeof competent.upkeep === 'function' && typeof competent.daily === 'function');

// 1. (e*) carried: bounce E1 fires day 13; (c) never fires.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2],
    [13, 8800, 2], [14, 9000, 0],
  ]);
  const e = fireEstar(sj);
  check('(e*) bounce: E1 fires day 13', e != null && e.day === 13 && e.clause === 'E1-envelope', e);
  check('(e*) bounce: reused (c) null, independent (c) null',
    analyzeSeedGatediseng(sj).candidates.c_standDownTrend == null && fireCIndependent(sj) == null);
}

// 2. (F) fires with streak 0 throughout (the streak-free property):
// S=10 peak 10900; falls day 11, 12, 13; day 13 pantry 6400 <= 8720.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 9700, 0], [12, 8300, 0], [13, 6400, 0],
  ]);
  check('(F) fires day 13 with streak 0 throughout',
    (() => { const f = fireFallback(sj); return f != null && f.day === 13 && f.clause === 'F-fallback'; })(), fireFallback(sj));
  check('(F) case: (e*) never fires (streak gate blocks it)', fireEstar(sj) == null);
  const v = fireVariant(sj);
  check('variant fires day 13 via (F) when (e*) is silent', v != null && v.day === 13 && v.clause === 'F-fallback', v);
}

// 3. (F) needs 3 falls: 2 falls to <= 0.80 peak does NOT fire.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 9700, 0], [12, 8300, 0],
  ]);
  check('(F) does not fire on only 2 falls', fireFallback(sj) == null, fireFallback(sj));
}

// 4. (F) needs <= 0.80 peak: 3 falls but pantry still above 0.80 does NOT fire.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 10500, 0], [12, 10100, 0], [13, 9800, 0],
  ]);
  check('(F) does not fire when 3 falls stay above 0.80 peak', fireFallback(sj) == null, fireFallback(sj));
}

// 5. 82127-SHAPE (synthetic series, not the judged seed): S=16,
// 10900 flat, then 9700/8300/6400/4500/2750/0 with streak
// 1,2,0,0,0,0,1 across days 17-23. (F) fires day 20 (falls 3,
// 6400 <= 8720), (e*) fires day 23 (E2, streak returns to 1),
// (c) fires day 20, ref day 23 -> variant lead 3, ties (c).
{
  const sj = synthCollapsing(16, [
    [15, 12000, 0], [16, 10900, 0], [17, 10900, 1], [18, 9700, 2],
    [19, 8300, 0], [20, 6400, 0], [21, 4500, 0], [22, 2750, 0], [23, 0, 1],
  ], 23, 24);
  const f = fireFallback(sj);
  const e = fireEstar(sj);
  const v = fireVariant(sj);
  const a = analyzeSeedStreakfree(sj);
  check('82127-shape: (F) fires day 20, NOT day 19 (falls 2 < 3)',
    f != null && f.day === 20, f);
  check('82127-shape: (e*) fires day 23 (E2, streak back to 1)',
    e != null && e.day === 23 && e.clause === 'E2-cliff', e);
  check('82127-shape: variant day 20 via (F), lead 3, ties (c) day 20',
    v != null && v.day === 20 && v.clause === 'F-fallback' && a.c != null && a.c.day === 20
    && a.v.lead === 3 && a.leadComparison.beatsOrTies === true, a);
  check('82127-shape: cross-check true', a.crossCheckMatch === true, a);
}

// 6. Variant takes the EARLIER of (e*) and (F): (e*) E1 day 13 beats
// a later (F) day 14.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2],
    [13, 8800, 2], [14, 8000, 2],
  ]);
  const v = fireVariant(sj);
  check('variant takes earlier (e*) day 13 over (F) day 14',
    v != null && v.day === 13 && v.clause === 'E1-envelope', v);
}

// 7. (c) fires day 13 on three falls; independent (c) agrees.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 11000, 1], [11, 10000, 1], [12, 9000, 1], [13, 8000, 1],
  ]);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  const ci = fireCIndependent(sj);
  check('(c) fires day 13, independent agrees', c != null && c.day === 13 && ci != null && ci.day === 13, { c, ci });
}

// 8. Collapse derivation shapes (carried): lost-without-starvation
// is not collapsing; lost day 30 + starvation is; survivor with a
// starvation death is not collapsing.
{
  const other = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 12, cause: 'the wild' }], daysAlive: 26, endReason: 'village-lost',
  });
  const a1 = analyzeSeedStreakfree(other);
  check('lost-without-starvation: collapsing false', a1.collapsing === false, a1);
  const edge = synthCollapsing(10, [[9, 10000, 0], [10, 9000, 1]], 26, 30);
  const a2 = analyzeSeedStreakfree(edge);
  check('lost day 30 + starvation: collapsing true, ref 26', a2.collapsing === true && a2.referenceDay === 26, a2);
  const surv = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 18, cause: 'starvation' }], daysAlive: 30, endReason: 'survived',
  });
  check('survivor-with-starvation: collapsing false', analyzeSeedStreakfree(surv).collapsing === false);
}

// 9. PILOT-GO via variant rescue: 4 candidates — 3 plain (e*) E1,
// 1 82127-shape rescued by (F) — plus 16 silent cost survivors.
{
  const plain = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const rescued = () => synthCollapsing(16, [
    [15, 12000, 0], [16, 10900, 0], [17, 10900, 1], [18, 9700, 2],
    [19, 8300, 0], [20, 6400, 0], [21, 4500, 0], [22, 2750, 0], [23, 0, 1],
  ], 23, 24);
  const cost = () => synth(10, [[9, 20000, 0], [10, 20000, 0], [11, 20000, 0]], {});
  const seeds = [plain(), plain(), plain(), rescued()];
  for (let i = 0; i < 16; i++) seeds.push(cost());
  seeds.forEach((s, i) => { s.seed = 999002 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfree(seeds, roles);
  check('pilot-GO with (F) rescue: all legs true, verdict PILOT-GO',
    sum.stillCollapsing.length === 4 && sum.legs.fireLeg && sum.legs.tieLeg
    && sum.legs.strictLeg && sum.legs.leadOneLeg && sum.legs.costLeg
    && sum.legs.crossCheckLeg && sum.verdict === 'PILOT-GO', sum);
}

// 10. PILOT-NO-GO: a candidate silent under BOTH (e*) and (F) fails fire.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const silent = () => synthCollapsing(10, [
    [9, 20000, 0], [10, 20000, 0], [11, 20000, 0], [12, 20000, 0],
  ], 15, 29);
  const cost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), silent()];
  for (let i = 0; i < 16; i++) seeds.push(cost());
  seeds.forEach((s, i) => { s.seed = 999012 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfree(seeds, roles);
  check('pilot-NO-GO: silent under both rules fails fire leg',
    sum.legs.fireLeg === false && sum.verdict === 'PILOT-NO-GO', sum);
}

// 11. Still-collapsing exclusion + survivor gate (carried bars).
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const excludedSeed = synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), excludedSeed];
  seeds.forEach((s, i) => { s.seed = 999022 + i; });
  const roles = {}; seeds.forEach((s) => { roles[s.seed] = 'candidate'; });
  const sum = summarizeStreakfree(seeds, roles);
  check('exclusion: 3 still-collapsing -> INSUFFICIENT-DATA',
    sum.excludedCandidates.length === 1 && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

// 12. Cost leg counts VARIANT firings (not (e*) alone): 2/4 firing
// cost survivors fail the <= 1/4 screen even if (e*) is silent on one.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const firingCostF = () => synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 9700, 0], [12, 8300, 0], [13, 6400, 0],
  ], {});
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), good(), firingCostF(), firingCostF(), silentCost(), silentCost()];
  seeds.forEach((s, i) => { s.seed = 999032 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfree(seeds, roles);
  check('cost leg: 2/4 variant-firing cost survivors fail',
    sum.legs.costLeg === false && sum.firingCostSurvivors.length === 2, sum);
}

// 13. Screen classification from the judged definition.
{
  const coll = synthCollapsing(10, [[9, 10000, 0], [10, 9000, 1]], 26, 30);
  const surv = synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const other = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 12, cause: 'the wild' }], daysAlive: 26, endReason: 'village-lost',
  });
  check('screen: collapsing/survivor/other',
    classifyScreen(coll) === 'collapsing' && classifyScreen(surv) === 'survivor' && classifyScreen(other) === 'other',
    [classifyScreen(coll), classifyScreen(surv), classifyScreen(other)]);
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
if (fail > 0) process.exit(1);
