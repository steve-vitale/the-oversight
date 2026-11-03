#!/usr/bin/env node
// test-sensorresupply-b.js — proof test for the (e*) fixed-supply pilot
// analyzer. Pure, synthetic evening series only; NO judged seeds, NO
// seed numbers from any judged band (synthetic seed 999001 only), no
// game load, no RNG, no writes. The competent-policy check requires
// the policy module only (no game load) and asserts the full policy
// object (setup + upkeep + daily) the pocketpersist lesson requires.
// Run: node scripts/test-sensorresupply-b.js  (exit 0 = all pass)
'use strict';
const { fireEstar, fireCIndependent, analyzeSeedSensorResupply, summarizeSensorResupply, classifyScreen } = require('./analyze-sensorresupply-b');
const { analyzeSeedGatediseng } = require('./analyze-gatediseng-b');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : '')); }
}
// rows: triples [loopDay, pantry, streak]; S = first disengaged day.
// Days before S are gateEngaged (the run's engaged stretch).
function synth(S, triples, extra) {
  const rows = triples.map(([d, p, st]) => ({
    loopDay: d, gateEngaged: d < S, pantryKcal: p, hungryStreak: st,
  }));
  return Object.assign({
    seed: 999001, rows, deaths: [], daysAlive: 30, days: 30, endReason: 'survived',
  }, extra || {});
}
function synthCollapsing(S, triples, refDay, daysAlive) {
  return synth(S, triples, {
    deaths: [{ day: refDay, cause: 'starvation' }],
    daysAlive: daysAlive == null ? 29 : daysAlive,
    endReason: 'village-lost',
  });
}

// 0. FULL POLICY OBJECT (pocketpersist lesson): the tracer's policy
// is the competent object itself, which must carry setup + upkeep +
// daily — never a bare {daily}.
check('full policy object: competent.setup/upkeep/daily are functions',
  typeof competent.setup === 'function' && typeof competent.upkeep === 'function' && typeof competent.daily === 'function');

// 1. BOUNCE: rise after stand-down must NOT restart the fall count.
{
  const sj = synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2],
    [13, 8800, 2], [14, 9000, 0],
  ]);
  const e = fireEstar(sj);
  check('bounce: E1 fires day 13 despite day-11 rise', e != null && e.day === 13 && e.clause === 'E1-envelope', e);
  check('bounce: reused (c) never fires on the same series', analyzeSeedGatediseng(sj).candidates.c_standDownTrend == null);
  check('bounce: independent (c) agrees with reused (c) (both null)', fireCIndependent(sj) == null);
}

// 2. CLIFF: store empties in 2 evenings; (e*) fires on the 2nd via E2.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 8000, 2], [11, 5000, 3], [12, 0, 4], [13, 0, 5],
  ]);
  const e = fireEstar(sj);
  check('cliff: E2 fires day 11 (5000 <= 0.65*8000)', e != null && e.day === 11 && e.clause === 'E2-cliff', e);
  check('cliff: reused (c) never fires on the same series', analyzeSeedGatediseng(sj).candidates.c_standDownTrend == null);
  check('cliff: independent (c) agrees with reused (c) (both null)', fireCIndependent(sj) == null);
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

// 4. (c) FIRES on three consecutive falls below 0.90 of stand-down,
// and the independent (c) agrees with the reused (c) on the day.
{
  const sj = synth(10, [
    [9, 12000, 0], [10, 11000, 1], [11, 10000, 1], [12, 9000, 1], [13, 8000, 1],
  ]);
  const c = analyzeSeedGatediseng(sj).candidates.c_standDownTrend;
  const ci = fireCIndependent(sj);
  // Day 12 is NOT eligible: D-3 = 9 predates the stand-down S = 10.
  // Day 13 is the first eligible three-fall evening (8000 <= 0.90*11000).
  check('(c) fires day 13 on three falls (8000 <= 0.90*11000)', c != null && c.day === 13, c);
  check('independent (c) agrees with reused (c) day', ci != null && ci.day === 13, ci);
  const a = analyzeSeedSensorResupply(sj);
  check('cross-check field true on a (c)-firing series', a.crossCheckMatch === true, a);
}

// 5. COLLAPSE DERIVATION — the 81042 shape: village-lost with NO
// starvation death is collapsed but NOT collapsing.
{
  const sj = synth(10, [[9, 10000, 0], [10, 9000, 1], [11, 8000, 1]], {
    deaths: [{ day: 12, cause: 'the wild' }, { day: 15, cause: 'combat' }],
    daysAlive: 26, endReason: 'village-lost',
  });
  const a = analyzeSeedSensorResupply(sj);
  check('81042-shape: collapsed true, collapsing false, ref null',
    a.collapsed === true && a.collapsing === false && a.referenceDay == null, a);
}

// 6. COLLAPSE DERIVATION — the 81053 shape: village-lost ON day 30
// with a starvation death IS collapsing (window-inclusive boundary).
{
  const sj = synthCollapsing(10, [[9, 10000, 0], [10, 9000, 1]], 26, 30);
  const a = analyzeSeedSensorResupply(sj);
  check('81053-shape: village-lost day 30 + starvation day 26 IS collapsing, ref 26',
    a.collapsed === true && a.collapsing === true && a.referenceDay === 26, a);
}

// 7. COLLAPSE DERIVATION — a survivor with a starvation death is
// NOT collapsing (village loss is required, not starvation alone).
{
  const sj = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 18, cause: 'starvation' }], daysAlive: 30, endReason: 'survived',
  });
  const a = analyzeSeedSensorResupply(sj);
  check('survivor-with-starvation: collapsing false', a.collapsing === false, a);
}

// 8. PILOT-GO: 4 still-collapsing candidates, all fire, all beat or
// tie (c), all lead >= 1, plus 4 silent cost survivors.
{
  // Candidate shape: stand-down day 10, (e*) E1 day 13, ref day 15
  // (lead 2); (c) never fires (bounce breaks its consecutive run).
  const cand = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const cost = () => synth(10, [[9, 20000, 0], [10, 20000, 0], [11, 20000, 0]], {});
  const seeds = [cand(), cand(), cand(), cand()];
  for (let i = 0; i < 16; i++) seeds.push(cost());
  // Seeds must differ for role mapping; use distinct synthetic seeds.
  seeds.forEach((s, i) => { s.seed = 999001 + i; });
  const roles = {};
  seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('pilot-GO: still-collapsing 4/4, 16 cost survivors, all legs true, verdict PILOT-GO',
    sum.stillCollapsing.length === 4 && sum.legs.fireLeg && sum.legs.tieLeg
    && sum.legs.strictLeg && sum.legs.leadOneLeg && sum.legs.costLeg
    && sum.legs.crossCheckLeg && sum.verdict === 'PILOT-GO', sum);
}

// 9. PILOT-NO-GO: one candidate never fires -> fire leg fails.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const silent = () => synthCollapsing(10, [
    [9, 20000, 0], [10, 20000, 0], [11, 20000, 0], [12, 20000, 0],
  ], 15, 29);
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), silent()];
  for (let i = 0; i < 16; i++) seeds.push(silentCost());
  seeds.forEach((s, i) => { s.seed = 999011 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('pilot-NO-GO: a no-fire candidate fails the fire leg, verdict PILOT-NO-GO',
    sum.legs.fireLeg === false && sum.verdict === 'PILOT-NO-GO', sum);
}

// 10. STILL-COLLAPSING EXCLUSION: a candidate that survives fresh is
// excluded, NOT a rule failure — but 3 still-collapsing < 4 is
// INSUFFICIENT-DATA (bars not lowered).
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const excludedSeed = synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), excludedSeed];
  seeds.forEach((s, i) => { s.seed = 999021 + i; });
  const roles = {}; seeds.forEach((s) => { roles[s.seed] = 'candidate'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('exclusion: surviving candidate excluded, count gate fails, INSUFFICIENT-DATA',
    sum.excludedCandidates.length === 1 && sum.stillCollapsing.length === 3
    && sum.legs.countGate === false && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

// 11. MEMBERSHIP CHANGE: a cost seed that newly collapses voids the
// pilot (INSUFFICIENT-DATA), it does not join the denominator.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const costBad = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const seeds = [good(), good(), good(), good(), costBad()];
  seeds.forEach((s, i) => { s.seed = 999031 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('membership change: newly-collapsing cost seed -> INSUFFICIENT-DATA',
    sum.newlyCollapsingCost.length === 1 && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

// 12. LEAD-ONE LEG: leads [2, 2, 0, 0] meet fire/tie/strict but miss
// the >= 75% lead >= 1 bar (2/4 < 3/4) -> PILOT-NO-GO.
{
  const mk = (fireDay, refDay) => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], refDay, 29);
  // All four use the same E1 firing day 13; ref day sets the lead:
  // ref 15 -> lead 2; ref 13 -> lead 0. (c) never fires on this shape,
  // so tie holds and strict holds wherever (e*) fires.
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [mk(13, 15), mk(13, 15), mk(13, 13), mk(13, 13)];
  for (let i = 0; i < 16; i++) seeds.push(silentCost());
  seeds.forEach((s, i) => { s.seed = 999041 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('lead-one leg: 2/4 at lead >= 1 fails the >= 75% bar -> PILOT-NO-GO',
    sum.legs.leadOneLeg === false && sum.verdict === 'PILOT-NO-GO', sum);
}

// 13. COST LEG: 2/4 cost survivors firing exceeds the <= 1/4 screen.
{
  const good = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const firingCost = () => synth(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], {});
  const silentCost = () => synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const seeds = [good(), good(), good(), good(), firingCost(), firingCost(), silentCost(), silentCost()];
  seeds.forEach((s, i) => { s.seed = 999051 + i; });
  const roles = {}; seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('cost leg: 2/4 cost survivors firing fails the <= 1/4 screen',
    sum.legs.costLeg === false && sum.firingCostSurvivors.length === 2, sum);
}

// 14. SCREEN CLASSIFICATION: collapsing / survivor / other from the
// judged definition, never from summary flags.
{
  const coll = synthCollapsing(10, [[9, 10000, 0], [10, 9000, 1]], 26, 30);
  const surv = synth(10, [[9, 20000, 0], [10, 20000, 0]], {});
  const other = synth(10, [[9, 10000, 0], [10, 9000, 1]], {
    deaths: [{ day: 12, cause: 'the wild' }], daysAlive: 26, endReason: 'village-lost',
  });
  check('screen: village-lost + starvation -> collapsing', classifyScreen(coll) === 'collapsing', classifyScreen(coll));
  check('screen: 30d survivor -> survivor', classifyScreen(surv) === 'survivor', classifyScreen(surv));
  check('screen: village-lost without starvation -> other', classifyScreen(other) === 'other', classifyScreen(other));
}

// 15. SURVIVOR GATE: 4 collapsing candidates firing + only 4 cost
// survivors passes the old supply-pilot shape but is
// INSUFFICIENT-DATA under the re-supply Stage-2 count gate (>= 12).
{
  const cand = () => synthCollapsing(10, [
    [9, 11000, 0], [10, 10000, 1], [11, 10100, 2], [12, 9500, 2], [13, 8800, 2],
  ], 15, 29);
  const cost = () => synth(10, [[9, 20000, 0], [10, 20000, 0], [11, 20000, 0]], {});
  const seeds = [cand(), cand(), cand(), cand(), cost(), cost(), cost(), cost()];
  seeds.forEach((s, i) => { s.seed = 999061 + i; });
  const roles = {};
  seeds.forEach((s, i) => { roles[s.seed] = i < 4 ? 'candidate' : 'cost'; });
  const sum = summarizeSensorResupply(seeds, roles);
  check('survivor gate: 4 cost survivors < 12 -> INSUFFICIENT-DATA, survivorGate false',
    sum.legs.survivorGate === false && sum.verdict === 'INSUFFICIENT-DATA', sum);
}

console.log(pass + '/' + (pass + fail) + ' checks passed');
if (fail > 0) process.exit(1);
