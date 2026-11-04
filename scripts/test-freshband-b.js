#!/usr/bin/env node
// test-freshband-b.js — proof for sim-freshband-b (DIAG ONLY).
// Pure synthetic series ONLY. No judged seeds, no game load, no
// RNG, no file writes. Synthetic seed numbers are 999xxx and
// pantry values are invented; any resemblance to a judged seed's
// shape (a shallow 0.872 firing, a 0.87-0.90 hover) is a MECHANISM
// reproduction, not that seed's data.
'use strict';
const assert = require('assert');
const A = require('./analyze-freshband-b');
const COST = require('./analyze-streakfree-cost-b');
const ENV = require('./analyze-envelope-b');
const GATED = require('./analyze-gatediseng-b');

let n = 0;
function ok(cond, label) {
  n++;
  try { assert.ok(cond, label); console.log('ok ' + n + ' - ' + label); }
  catch (e) { console.error('FAIL ' + n + ' - ' + label + ': ' + e.message); process.exitCode = 1; }
}
function eq(a, b, label) {
  n++;
  try { assert.strictEqual(a, b, label + ' (got ' + a + ', want ' + b + ')'); console.log('ok ' + n + ' - ' + label); }
  catch (e) { console.error('FAIL ' + n + ' - ' + label + ': ' + e.message); process.exitCode = 1; }
}

// Build a synthetic tracer leg. pantry[0] is loopDay 1.
function makeSeed(seed, pantry, opts) {
  const o = opts || {};
  const streak = o.streak == null ? 1 : o.streak;
  const rows = pantry.map((p, i) => ({
    loopDay: i + 1,
    gameDay: i + 1,
    pantryKcal: p,
    gateEngaged: (o.engaged || []).includes(i + 1),
    hungryStreak: typeof streak === 'function' ? streak(i + 1) : streak,
  }));
  return {
    seed,
    endReason: o.endReason || 'survived',
    daysAlive: o.daysAlive != null ? o.daysAlive : pantry.length,
    gameDays: o.gameDays != null ? o.gameDays : pantry.length,
    maxWaveUnlocked: 2,
    deaths: o.deaths || [],
    rows,
  };
}
function flat(v, count) { return Array(count).fill(v); }

// --- Series 1: clean E1@0.85 boundary fire (day 9, fraction 0.85) ---
const s1 = makeSeed(999101, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 17000, 17000]);
const e1 = A.fireEstar85(s1);
eq(e1 && e1.day, 9, 'E1 fires day 9 at the 0.85 boundary');
eq(e1 && e1.clause, 'E1-envelope', 'E1 clause on boundary series');
eq(e1 && e1.fraction, 0.85, 'E1 firing fraction reported as 0.85');
eq(A.fireFallback(s1), null, 'no F on boundary series (falls < 3 at fire)');
eq(A.fireVariant(s1).day, 9, 'variant = E1 day 9 on boundary series');

// --- Series 2: shallow 0.872 hover — SYNTHETIC 83011-shape mechanism ---
const s2 = makeSeed(999102, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 17440, 17440, 17440]);
eq(A.fireEstar85(s2), null, 'E1@0.85 does NOT fire on synthetic 0.872 shallow hover');
eq(COST.fireVariant(s2), null, 'prior cost analyzer agrees: no (v**) fire on shallow hover');
ok(ENV.fireVariantAt(s2, 0.90) != null && ENV.fireVariantAt(s2, 0.90).day === 9,
  'envelope analyzer at 0.90 DOES fire day 9 on the same hover (parameterization check)');
ok(ENV.fireVariantAt(s2, 0.85) == null, 'envelope analyzer at 0.85 agrees: no fire');

// --- Series 3: hover delay — SYNTHETIC 83248-shape mechanism ---
// (c) fires day 10 (0.898 of stand-down), (v**) waits until day 11.
const s3 = makeSeed(999103, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19500, 19000, 17960, 16000, 16000]);
const c3 = GATED.analyzeSeedGatediseng(s3).candidates.c_standDownTrend;
eq(c3 && c3.day, 10, '(c) fires day 10 on hover series');
eq(A.fireVariant(s3).day, 11, '(v**) fires day 11 on hover series (delayed by tightening)');
eq(A.fireCIndependent(s3).day, 10, 'independent (c) matches reused (c) day 10 on hover series');

// --- Series 4: E2 cliff with a single fall ---
const s4 = makeSeed(999104, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 12000]);
const e4 = A.fireEstar85(s4);
eq(e4 && e4.day, 9, 'E2 cliff fires day 9 on a single-fall drop to 0.60 peak');
eq(e4 && e4.clause, 'E2-cliff', 'E2 clause on cliff series');

// --- Series 5: F fallback with streak 0 ---
const s5 = makeSeed(999105, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 18000, 15000], { streak: 0 });
eq(A.fireEstar85(s5), null, 'no (e**) fire when streak is 0');
eq(A.fireFallback(s5).day, 10, 'F fires day 10 with streak 0');
eq(A.fireVariant(s5).clause, 'F-fallback', 'variant = F on streak-0 series');

// --- Series 6: variant first-firing — F earlier than (e**) ---
const s6 = makeSeed(999106, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 18000, 15000, 14000],
  { streak: (d) => (d >= 11 ? 1 : 0) });
eq(A.fireFallback(s6).day, 10, 'F day 10 on first-firing series');
eq(A.fireEstar85(s6).day, 11, '(e**) day 11 on first-firing series');
eq(A.fireVariant(s6).day, 10, 'variant takes the earlier F day 10');
eq(A.fireVariant(s6).clause, 'F-fallback', 'variant clause is F when F is earlier');

// --- Series 7: (c) independent vs reused agreement on every synthetic ---
const series = [s1, s2, s3, s4, s5, s6];
for (const s of series) {
  const reused = GATED.analyzeSeedGatediseng(s).candidates.c_standDownTrend;
  const ind = A.fireCIndependent(s);
  eq(ind == null ? null : ind.day, reused == null ? null : reused.day,
    'independent (c) matches reused (c) on synthetic seed ' + s.seed);
  const mine = A.analyzeSeedFreshband(s);
  eq(mine.crossCheckMatch, true, 'cross-check holds on synthetic seed ' + s.seed);
  const costV = COST.fireVariant(s);
  eq(mine.v == null ? null : mine.v.day, costV == null ? null : costV.day,
    'freshband (v**) day matches prior cost analyzer on synthetic seed ' + s.seed);
  const envV = ENV.fireVariantAt(s, 0.85);
  eq(mine.v == null ? null : mine.v.day, envV == null ? null : envV.day,
    'freshband (v**) day matches envelope analyzer at 0.85 on synthetic seed ' + s.seed);
}

// --- Series 8: stretch-boundary (c) window D-3 >= S ---
const s8 = makeSeed(999108, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 18000, 17000],
  { engaged: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11] });
eq(A.fireCIndependent(s8).day, 15, '(c) fires day 15 in the second stretch (D-3 == S)');
eq(GATED.analyzeSeedGatediseng(s8).candidates.c_standDownTrend.day, 15, 'reused (c) agrees day 15');

// --- Settled-field verification ---
const vExact = makeSeed(999201, flat(20000, 30), { daysAlive: 30, gameDays: 31 });
eq(A.verifyLeg(vExact).verified, true, 'exact leg verifies (rows == daysAlive)');
eq(A.verifyLeg(vExact).kind, 'exact', 'exact leg kind');
const vLoss = makeSeed(999202, flat(20000, 19), { endReason: 'village-lost', daysAlive: 20, gameDays: 19, deaths: [{ day: 16, cause: 'starvation' }] });
eq(A.verifyLeg(vLoss).verified, true, 'loss-day leg verifies under exemption');
eq(A.verifyLeg(vLoss).kind, 'loss-day-exempt', 'loss-day leg kind');
const vShort = makeSeed(999203, flat(20000, 29), { daysAlive: 30, gameDays: 30 });
eq(A.verifyLeg(vShort).verified, false, 'survivor leg one row short FAILS');
const vGap = makeSeed(999204, [20000, 20000, 20000], {});
vGap.rows[2].loopDay = 4;
eq(A.verifyLeg(vGap).verified, false, 'non-contiguous leg FAILS');
const vNoCorr = makeSeed(999205, flat(20000, 19), { endReason: 'village-lost', daysAlive: 20, gameDays: 20 });
eq(A.verifyLeg(vNoCorr).verified, false, 'loss leg WITHOUT gameDays == N corroboration FAILS');
const vSurvShort = makeSeed(999206, flat(20000, 29), { endReason: 'survived', daysAlive: 30, gameDays: 29 });
eq(A.verifyLeg(vSurvShort).verified, false, 'survivor leg at daysAlive - 1 FAILS (exemption is village-lost only)');

// --- Classification: window-inclusive collapse, other, survivor ---
const cLoss30 = makeSeed(999301, flat(20000, 30), { endReason: 'village-lost', daysAlive: 30, gameDays: 30, deaths: [{ day: 30, cause: 'starvation' }] });
eq(A.classifyScreen(cLoss30), 'collapsing', 'loss ON horizon day 30 with starvation counts as collapsing');
const cLostNoStarv = makeSeed(999302, flat(20000, 20), { endReason: 'village-lost', daysAlive: 20, gameDays: 20, deaths: [{ day: 20, cause: 'fight' }] });
eq(A.classifyScreen(cLostNoStarv), 'other', 'lost without starvation is other, neither collapsing nor survivor');
eq(A.classifyScreen(vExact), 'survivor', '30d survived leg is a survivor');

// --- Verdict logic (pure stubs through judgeLegs) ---
function stub(seed, role, o) {
  return Object.assign({ seed, collapsing: false, survived: true, v: null, leadComparison: { beatsOrTies: true, strictlyBeats: true }, crossCheckMatch: true }, o);
}
function goSet(firingSurvivorCount) {
  const legs = [];
  for (let i = 0; i < 4; i++) legs.push(stub(9100 + i, 'candidate', { collapsing: true, survived: false, v: { day: 10, lead: 3 }, leadComparison: { beatsOrTies: true, strictlyBeats: true } }));
  for (let i = 0; i < 16; i++) legs.push(stub(9200 + i, 'cost', { v: i < firingSurvivorCount ? { day: 15, lead: null } : null }));
  const roles = {};
  for (const l of legs) roles[l.seed] = l.seed < 9200 ? 'candidate' : 'cost';
  return { legs, roles };
}
let r = A.judgeLegs(goSet(1).legs, goSet(1).roles);
eq(r.verdict, 'PILOT-GO', 'verdict logic: all legs hold -> PILOT-GO');
r = A.judgeLegs(goSet(4).legs, goSet(4).roles);
eq(r.verdict, 'PILOT-GO', 'verdict logic: cost 4/16 (at the 25% bar) still GO');
r = A.judgeLegs(goSet(5).legs, goSet(5).roles);
eq(r.verdict, 'PILOT-NO-GO', 'verdict logic: cost 5/16 -> PILOT-NO-GO');
eq(r.legs.costLeg, false, 'cost leg false at 5/16');
{
  const { legs, roles } = goSet(1);
  legs[0].leadComparison.beatsOrTies = false;
  const rr = A.judgeLegs(legs, roles);
  eq(rr.verdict, 'PILOT-NO-GO', 'verdict logic: tie miss -> PILOT-NO-GO');
  eq(rr.legs.tieLeg, false, 'tie leg false on a tie miss');
}
{
  const { legs, roles } = goSet(1);
  legs.splice(3, 1); // drop one collapsing candidate: only 3 remain
  const rr = A.judgeLegs(legs, roles);
  eq(rr.verdict, 'INSUFFICIENT-DATA', 'verdict logic: < 4 still-collapsing -> INSUFFICIENT-DATA');
}
{
  const { legs, roles } = goSet(1);
  legs[4].collapsing = true; legs[4].survived = false; // sampled survivor newly collapses
  const rr = A.judgeLegs(legs, roles);
  eq(rr.verdict, 'INSUFFICIENT-DATA', 'verdict logic: survivor drift -> INSUFFICIENT-DATA');
  eq(rr.newlyCollapsingCost.length, 1, 'survivor-drift seed named');
}
{
  const { legs, roles } = goSet(1);
  legs[0].crossCheckMatch = false;
  const rr = A.judgeLegs(legs, roles);
  eq(rr.verdict, 'INSUFFICIENT-DATA', 'verdict logic: cross-check mismatch -> INSUFFICIENT-DATA');
}
{
  const { legs, roles } = goSet(1);
  legs[0].collapsing = false; legs[0].survived = false; // screened candidate no longer collapsing
  const rr = A.judgeLegs(legs, roles);
  eq(rr.excludedCandidates.length, 1, 'still-collapsing rule excludes, does not fail');
  eq(rr.verdict, 'INSUFFICIENT-DATA', 'exclusion drops count below 4 -> INSUFFICIENT-DATA via count gate');
}

console.log('freshband proof: ' + n + ' checks passed');
