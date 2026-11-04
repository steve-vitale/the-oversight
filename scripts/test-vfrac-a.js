#!/usr/bin/env node
// test-vfrac-a.js — proof for sim-vfrac-a (DIAG ONLY).
// Pure synthetic series ONLY. No judged seeds, no game load, no
// RNG, no file writes. Synthetic seed numbers are 999xxx and
// pantry values are invented; any resemblance to a judged seed's
// shape (a shallow 0.872 hover) is a MECHANISM reproduction,
// not that seed's data.
'use strict';
const assert = require('assert');
const A = require('./analyze-vfrac-a');
const FRESH = require('./analyze-freshband-b');
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
    days: o.days != null ? o.days : pantry.length,
    gameDays: o.gameDays != null ? o.gameDays : pantry.length,
    maxWaveUnlocked: 2,
    deaths: o.deaths || [],
    rows,
  };
}
function flat(v, count) { return Array(count).fill(v); }

// --- Series 1: shallow 0.872 hover — fraction DISCRIMINATES ---
const s1 = makeSeed(999101, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 17440, 17440, 17440],
  { endReason: 'village-lost', daysAlive: 11, days: 30, deaths: [{ day: 11, cause: 'starvation' }] });
const a1 = A.analyzeSeedVfrac(s1);
eq(a1.perFraction['0.85'].v, null, 'hover: (v_0.85) does NOT fire');
ok(a1.perFraction['0.90'].v != null && a1.perFraction['0.90'].v.day === 9, 'hover: (v_0.90) fires day 9');
eq(a1.perFraction['0.90'].v.clause, 'E1-envelope', 'hover: 0.90 clause is E1-envelope');
eq(a1.perFraction['0.90'].v.fraction, 0.872, 'hover: E1 firing fraction reported 0.872');
eq(a1.win90, true, 'hover: leg counts as win90 (lead_90 > lead_85, no-fire = -inf)');
eq(a1.win85, false, 'hover: leg does NOT count as win85');
eq(a1.identical, false, 'hover: leg is not identical');
eq(a1.collapsing, true, 'hover: leg classifies collapsing (village-lost + starvation)');
eq(a1.referenceDay, 11, 'hover: reference day is first starvation day');
eq(a1.perFraction['0.90'].lead, 2, 'hover: lead_90 = 2');
eq(a1.crossCheckMatch, true, 'hover: cross-check holds');

// --- Series 2: boundary fire — fraction IDENTICAL ---
const s2 = makeSeed(999102, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 17000, 17000],
  { endReason: 'village-lost', daysAlive: 10, days: 30, deaths: [{ day: 10, cause: 'starvation' }] });
const a2 = A.analyzeSeedVfrac(s2);
eq(a2.perFraction['0.85'].v.day, 9, 'boundary: (v_0.85) fires day 9');
eq(a2.perFraction['0.90'].v.day, 9, 'boundary: (v_0.90) fires day 9');
eq(a2.identical, true, 'boundary: leg is identical across fractions');
eq(a2.win90, false, 'boundary: no win90');
eq(a2.win85, false, 'boundary: no win85');

// --- Series 3: F fallback with streak 0 — fraction IDENTICAL ---
const s3 = makeSeed(999103, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 19000, 18000, 15000], { streak: 0 });
const a3 = A.analyzeSeedVfrac(s3);
eq(a3.perFraction['0.85'].v.day, 10, 'F series: (v_0.85) fires day 10 via F');
eq(a3.perFraction['0.90'].v.day, 10, 'F series: (v_0.90) fires day 10 via F');
eq(a3.identical, true, 'F series: identical (F is fraction-independent)');

// --- Series 4: E2 cliff — fraction IDENTICAL ---
const s4 = makeSeed(999104, [20000, 20000, 20000, 20000, 20000, 20000, 20000, 20000, 12000]);
const a4 = A.analyzeSeedVfrac(s4);
eq(a4.perFraction['0.85'].v.day, 9, 'cliff: (v_0.85) fires day 9');
eq(a4.perFraction['0.90'].v.day, 9, 'cliff: (v_0.90) fires day 9');
eq(a4.identical, true, 'cliff: identical (E2 is fraction-independent)');

// --- Agreement with reused analyzers on every synthetic ---
for (const s of [s1, s2, s3, s4]) {
  const mine = A.analyzeSeedVfrac(s);
  const fresh = FRESH.analyzeSeedFreshband(s);
  eq(mine.perFraction['0.85'].v == null ? null : mine.perFraction['0.85'].v.day,
    fresh.v == null ? null : fresh.v.day,
    'vfrac 0.85 day matches freshband (v**) on synthetic ' + s.seed);
  const env90 = ENV.fireVariantAt(s, 0.90);
  eq(mine.perFraction['0.90'].v == null ? null : mine.perFraction['0.90'].v.day,
    env90 == null ? null : env90.day,
    'vfrac 0.90 day matches envelope analyzer at 0.90 on synthetic ' + s.seed);
  const env85 = ENV.fireVariantAt(s, 0.85);
  eq(mine.perFraction['0.85'].v == null ? null : mine.perFraction['0.85'].v.day,
    env85 == null ? null : env85.day,
    'vfrac 0.85 day matches envelope analyzer at 0.85 on synthetic ' + s.seed);
  eq(mine.crossCheckMatch, true, 'cross-check holds on synthetic ' + s.seed);
  const reusedC = GATED.analyzeSeedGatediseng(s).candidates.c_standDownTrend;
  eq(mine.c == null ? null : mine.c.day, reusedC == null ? null : reusedC.day,
    'reused (c) day matches on synthetic ' + s.seed);
}

// --- Settled-field verification through the vfrac analyzer ---
const vExact = makeSeed(999201, flat(20000, 30), { daysAlive: 30, days: 30, gameDays: 31 });
eq(A.analyzeSeedVfrac(vExact).verification.verified, true, 'exact leg verifies');
const vLoss = makeSeed(999202, flat(20000, 19), { endReason: 'village-lost', daysAlive: 20, days: 30, gameDays: 19, deaths: [{ day: 16, cause: 'starvation' }] });
eq(A.analyzeSeedVfrac(vLoss).verification.verified, true, 'loss-day leg verifies under exemption');
eq(A.analyzeSeedVfrac(vLoss).verification.kind, 'loss-day-exempt', 'loss-day leg kind');
const vShort = makeSeed(999203, flat(20000, 29), { daysAlive: 30, days: 30, gameDays: 30 });
eq(A.analyzeSeedVfrac(vShort).verification.verified, false, 'survivor leg one row short FAILS');

// --- Decision function (stub legs) ---
function stubCol(seed, kind) {
  // kind: 'win90' | 'win85' | 'identical' | 'win90-nofire85'
  const dims = (fired, tie, strict, leadOne) => ({ fired, tie, strict, leadOne });
  let p85; let p90;
  if (kind === 'win90') { p85 = dims(true, false, false, false); p90 = dims(true, true, true, true); }
  else if (kind === 'win85') { p85 = dims(true, true, true, true); p90 = dims(true, false, false, false); }
  else if (kind === 'win90-nofire85') { p85 = dims(false, false, false, false); p90 = dims(true, true, false, true); }
  else { p85 = dims(true, true, false, true); p90 = dims(true, true, false, true); }
  return {
    seed, collapsing: true, survived: false, crossCheckMatch: true,
    verification: { verified: true },
    perFraction: { '0.85': p85, '0.90': p90 },
    win90: kind === 'win90' || kind === 'win90-nofire85',
    win85: kind === 'win85',
    identical: kind === 'identical',
  };
}
function stubSurv(seed, fire85, fire90) {
  const dims = (fired) => ({ fired, tie: false, strict: false, leadOne: false });
  return {
    seed, collapsing: false, survived: true, crossCheckMatch: true,
    verification: { verified: true },
    perFraction: { '0.85': dims(fire85), '0.90': dims(fire90) },
    win90: false, win85: false, identical: true,
  };
}
function survSet(fire85Count, fire90Count) {
  const out = [];
  for (let i = 0; i < 16; i++) out.push(stubSurv(9200 + i, i < fire85Count, i < fire90Count));
  return out;
}
function colSet(kinds) { return kinds.map((k, i) => stubCol(9100 + i, k)); }

{
  const d = A.decideFraction(colSet(['win90', 'win90', 'win90-nofire85', 'identical']), survSet(3, 2));
  eq(d.decision, 0.90, 'decision: wins90=3, cost90=2/16 -> 0.90');
  eq(d.branch, 'DECISION 0.90', 'decision branch label 0.90');
  eq(d.wins90, 3, 'decision counts wins90=3');
  eq(d.flips.tie.to90, 3, 'decision flips: tie flips to 0.90 on all 3 win legs');
}
{
  const d = A.decideFraction(colSet(['win90', 'win90', 'win90-nofire85', 'identical']), survSet(3, 5));
  eq(d.decision, 0.85, 'decision: wins90=3 but cost90=5/16 -> 0.85');
  eq(d.branch, 'DECISION 0.85 COST-VETO', 'decision branch label is COST-VETO, not tie-break');
}
{
  const d = A.decideFraction(colSet(['win85', 'win85', 'win85', 'identical']), survSet(3, 3));
  eq(d.decision, 0.85, 'decision: wins85=3 -> 0.85');
  eq(d.branch, 'DECISION 0.85 MEASURED', 'decision branch label is MEASURED');
}
{
  const d = A.decideFraction(colSet(['win90', 'win90', 'identical', 'identical']), survSet(3, 3));
  eq(d.decision, 0.85, 'decision: wins90=2 (<3) -> 0.85');
  eq(d.branch, 'DECISION 0.85 TIE-BREAK', 'decision branch label is TIE-BREAK, not measured superiority');
}
{
  const d = A.decideFraction(colSet(['identical', 'identical', 'identical', 'identical']), survSet(0, 0));
  eq(d.decision, 0.85, 'decision: all identical -> 0.85');
  eq(d.branch, 'DECISION 0.85 TIE-BREAK', 'all-identical branch is TIE-BREAK');
}
{
  const d = A.decideFraction(colSet(['win90', 'win90', 'win90', 'win85', 'win85', 'win85']), survSet(0, 0));
  eq(d.decision, 0.85, 'decision: wins90=3 and wins85=3 net tie -> 0.85');
  eq(d.branch, 'DECISION 0.85 TIE-BREAK', 'net-tie branch is TIE-BREAK');
}
{
  const d = A.decideFraction(colSet(['win90', 'win90', 'win90', 'win90', 'win85', 'win85', 'win85']), survSet(0, 0));
  eq(d.decision, 0.90, 'decision: wins90=4 > wins85=3 -> 0.90 (net rule)');
}

// --- judgeVfrac gates ---
function judgeSet(colKinds, survFires) {
  const legs = colSet(colKinds);
  const survs = survSet(survFires[0], survFires[1]);
  const roles = {};
  for (const l of legs) roles[l.seed] = 'candidate';
  for (const l of survs) roles[l.seed] = 'cost';
  return { legs: legs.concat(survs), roles };
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'win90-nofire85', 'identical'], [3, 2]);
  const j = A.judgeVfrac(legs, roles);
  eq(j.verdict, 'DECISION 0.90', 'judge: gated GO set -> DECISION 0.90');
  eq(j.gates.gatesPass, true, 'judge: gates pass on GO set');
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'identical'], [3, 2]);
  const j = A.judgeVfrac(legs, roles);
  eq(j.verdict, 'INSUFFICIENT-DATA', 'judge: <4 still-collapsing -> INSUFFICIENT-DATA');
  eq(j.gates.countGate, false, 'judge: count gate false below 4');
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'win90-nofire85', 'identical'], [3, 2]);
  legs[4].collapsing = true; legs[4].survived = false; // sampled survivor newly collapses
  const j = A.judgeVfrac(legs, roles);
  eq(j.verdict, 'INSUFFICIENT-DATA', 'judge: survivor drift -> INSUFFICIENT-DATA');
  eq(j.newlyCollapsingCost.length, 1, 'judge: drift seed named');
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'win90-nofire85', 'identical'], [3, 2]);
  legs[0].crossCheckMatch = false;
  const j = A.judgeVfrac(legs, roles);
  eq(j.verdict, 'INSUFFICIENT-DATA', 'judge: cross-check mismatch -> INSUFFICIENT-DATA');
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'win90-nofire85', 'identical'], [3, 2]);
  legs[0].verification = { verified: false };
  const j = A.judgeVfrac(legs, roles);
  eq(j.verdict, 'INSUFFICIENT-DATA', 'judge: verification failure -> INSUFFICIENT-DATA');
}
{
  const { legs, roles } = judgeSet(['win90', 'win90', 'win90-nofire85', 'identical'], [3, 2]);
  legs[0].collapsing = false; legs[0].survived = false; // screened candidate no longer collapsing
  const j = A.judgeVfrac(legs, roles);
  eq(j.excludedCandidates.length, 1, 'judge: still-collapsing rule excludes, does not fail the leg');
}

console.log('vfrac proof: ' + n + ' checks passed');
