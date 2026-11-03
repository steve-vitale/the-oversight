#!/usr/bin/env node
// test-streakfree-cost-b.js — proof test for the (v**) = (e**) OR (F)
// analyzer, where (e**) is (e*) with the E1 envelope fraction
// tightened from 0.90 to 0.85. Pure, synthetic evening series only;
// NO judged seeds, NO seed numbers from any judged band (synthetic
// seed 999102 only), no game load, no RNG, no writes.
// Run: node scripts/test-streakfree-cost-b.js (exit 0 = pass)
'use strict';
const { fireEstar85, fireFallback, fireVariant, fireCIndependent, analyzeSeedStreakfreeCost, summarizeStreakfreeCost, classifyScreen } = require('./analyze-streakfree-cost-b');
const { fireEstar } = require('./analyze-streakfree-b');
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
    seed: 999102, rows, deaths: [], daysAlive: 30, days: 30, endReason: 'survived',
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

// 1. 83011-SHAPE (synthetic series, not the judged seed): stretch
// peak 29732, then 27304 / 25914 with streak >= 1, fraction
// 25914/29732 = 0.872. Old (e*) E1 fires day 30; (e**) does NOT
// fire (0.872 > 0.85); (F) does not fire (only 2 falls); variant
// is silent. This is the cost-leg fix, on fractions alone.
{
  const sj = synth(27, [
    [26, 31000, 0], [27, 27747, 3], [28, 29732, 3], [29, 27304, 4], [30, 25914, 5],
  ]);
  const old = fireEstar(sj);
  const e = fireEstar85(sj);
  const v = fireVariant(sj);
  check('83011-shape: old (e*) E1 fires day 30 at fraction 0.872',
    old != null && old.day === 30 && old.clause === 'E1-envelope', old);
  check('83011-shape: (e**) silent at fraction 0.872 > 0.85', e == null, e);
  check('83011-shape: variant silent (F needs 3 falls)', v == null, v);
}

// 2. E1@0.85 still fires: fraction 0.84, falls 2, streak >= 1.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9200, 1], [12, 8400, 1],
  ]);
  const e = fireEstar85(sj);
  check('(e**) E1 fires at fraction 0.84', e != null && e.day === 12 && e.clause === 'E1-envelope', e);
}

// 3. Exact boundary: fraction exactly 0.85 fires (<= rule).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9200, 1], [12, 8500, 1],
  ]);
  const e = fireEstar85(sj);
  check('(e**) E1 fires at exactly 0.85 peak', e != null && e.day === 12, e);
}

// 4. Collapsing E1 at 0.759 (83019-shape) still fires day 20.
{
  const sj = synthCollapsing(18, [
    [17, 13000, 0], [18, 12050, 3], [19, 10253, 4], [20, 9150, 5],
  ], 25, 27);
  const e = fireEstar85(sj);
  const a = analyzeSeedStreakfreeCost(sj);
  check('collapsing E1 at 0.759 still fires, lead 5',
    e != null && e.day === 20 && a.v != null && a.v.lead === 5, a);
}

// 5. (F) carried verbatim: streak 0 throughout, falls 3,
// fraction 0.76 fires; (e**) silent (streak gate).
{
  const sj = synth(14, [
    [13, 12000, 0], [14, 11650, 0], [15, 9830, 0], [16, 10567, 0],
    [17, 9815, 0], [18, 8854, 0],
  ]);
  const f = fireFallback(sj);
  check('(F) fires with streak 0, falls 3, fraction 0.76',
    f != null && f.day === 18 && f.clause === 'F-fallback', f);
  check('(F) case: (e**) silent (streak gate blocks it)', fireEstar85(sj) == null);
  const v = fireVariant(sj);
  check('variant fires via (F) when (e**) is silent', v != null && v.day === 18 && v.clause === 'F-fallback', v);
}

// 6. (F) still needs 3 falls and <= 0.80 peak.
{
  const twoFalls = synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 9700, 0], [12, 8300, 0],
  ]);
  check('(F) does not fire on only 2 falls', fireFallback(twoFalls) == null, fireFallback(twoFalls));
  const shallow = synth(10, [
    [9, 12000, 0], [10, 10900, 0], [11, 10500, 0], [12, 10100, 0], [13, 9800, 0],
  ]);
  check('(F) does not fire when 3 falls stay above 0.80 peak', fireFallback(shallow) == null, fireFallback(shallow));
}

// 7. E2 cliff unchanged at 0.65.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 10000, 1], [11, 9000, 1], [12, 6400, 1],
  ]);
  const e = fireEstar85(sj);
  check('(e**) E2 fires at fraction 0.64', e != null && e.day === 12 && e.clause === 'E2-cliff', e);
}

// 8. Variant takes the EARLIER of (e**) and (F).
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2],
    [13, 8500, 2], [14, 8000, 2],
  ]);
  const v = fireVariant(sj);
  check('variant takes earlier (e**) day 13 over (F) day 14',
    v != null && v.day === 13 && v.clause === 'E1-envelope', v);
}

// 9. (c) fires on three falls; independent (c) agrees (cross-check).
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 11000, 1], [11, 10000, 1], [12, 9000, 1], [13, 8000, 1],
  ]);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  const ci = fireCIndependent(sj);
  check('(c) fires day 13, independent agrees', c != null && c.day === 13 && ci != null && ci.day === 13, { c, ci });
}

// 10. Collapse derivation shapes (carried): lost-without-starvation
// is not collapsing; lost day 30 + starvation is; survivor with a
// starvation death is not collapsing.
{
  const other = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 12, cause: 'the wild' }], daysAlive: 26, endReason: 'village-lost',
  });
  check('lost-without-starvation: collapsing false', analyzeSeedStreakfreeCost(other).collapsing === false);
  const edge = synthCollapsing(10, [[9, 10000, 0], [10, 9000, 1]], 26, 30);
  const a2 = analyzeSeedStreakfreeCost(edge);
  check('lost day 30 + starvation: collapsing true, ref 26', a2.collapsing === true && a2.referenceDay === 26, a2);
  const surv = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 18, cause: 'starvation' }], daysAlive: 30, endReason: 'survived',
  });
  check('survivor-with-starvation: collapsing false', analyzeSeedStreakfreeCost(surv).collapsing === false);
}

// 11. PILOT-GO: 4 collapsing candidates + 16 cost survivors with
// exactly 3 variant firings (<= floor(0.25*16) = 4) -> GO.
{
  const cand = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8500, 2],
  ], 15, 29);
  const firingCost = () => synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9200, 1], [12, 8400, 1],
  ], {});
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [cand(), cand(), cand(), cand(), firingCost(), firingCost(), firingCost()];
  for (let i = 0; i < 13; i++) seeds.push(silentCost());
  seeds.forEach((s, i) => { s.seed = 999102 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfreeCost(seeds, roles);
  check('pilot-GO: 3/16 cost firings pass, all legs true',
    sum.stillCollapsing.length === 4 && sum.legs.fireLeg && sum.legs.tieLeg
    && sum.legs.strictLeg && sum.legs.leadOneLeg && sum.legs.costLeg
    && sum.legs.crossCheckLeg && sum.verdict === 'PILOT-GO', sum);
}

// 12. PILOT-NO-GO via cost: 5/16 cost firings exceed the bar.
{
  const cand = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8500, 2],
  ], 15, 29);
  const firingCost = () => synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9200, 1], [12, 8400, 1],
  ], {});
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [cand(), cand(), cand(), cand()];
  for (let i = 0; i < 5; i++) seeds.push(firingCost());
  for (let i = 0; i < 11; i++) seeds.push(silentCost());
  seeds.forEach((s, i) => { s.seed = 999122 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfreeCost(seeds, roles);
  check('pilot-NO-GO: 5/16 cost firings fail the cost leg',
    sum.legs.costLeg === false && sum.verdict === 'PILOT-NO-GO', sum);
}

// 13. Still-collapsing exclusion -> INSUFFICIENT-DATA (3 < 4).
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8500, 2],
  ], 15, 29);
  const excludedSeed = synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), excludedSeed];
  seeds.forEach((s, i) => { s.seed = 999142 + i; });
  const roles = {}; seeds.forEach((s) => { roles[s.seed] = 'candidate'; });
  const sum = summarizeStreakfreeCost(seeds, roles);
  check('exclusion: 3 still-collapsing -> INSUFFICIENT-DATA',
    sum.excludedCandidates.length === 1 && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

// 14. Survivor drift (cost seed collapsing) -> INSUFFICIENT-DATA.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8500, 2],
  ], 15, 29);
  const drift = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 9200, 1], [12, 8400, 1],
  ], 15, 29);
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), good(), drift()];
  for (let i = 0; i < 15; i++) seeds.push(silentCost());
  seeds.forEach((s, i) => { s.seed = 999152 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeStreakfreeCost(seeds, roles);
  check('drift: collapsing cost seed -> INSUFFICIENT-DATA',
    sum.newlyCollapsingCost.length === 1 && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

// 15. Screen classification from the judged definition.
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

// 16. Old-corpus spot property (synthetic): an E1 firing at 0.759
// under (v*) keeps the same day under (v**) — tightening moves no
// collapsing E1 day in the tested shapes.
{
  const sj = synthCollapsing(18, [
    [17, 13000, 0], [18, 12050, 3], [19, 10253, 4], [20, 9150, 5],
  ], 25, 27);
  const old = fireEstar(sj);
  const neu = fireEstar85(sj);
  check('E1@0.759: old and new fire the same day',
    old != null && neu != null && old.day === neu.day, { old, neu });
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
if (fail > 0) process.exit(1);
