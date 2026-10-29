#!/usr/bin/env node
// test-nighttravel-rerun-b.js — proof for the metric-revised nighttravel
// rerun (prereg: evidence/2026-10-28/sim-nighttravel-rerun-b-prereg.md).
//
// Usage:
//   node scripts/test-nighttravel-rerun-b.js --before <insideevening-dir>
//     --after <nighttravel-dir> --analysis <analysis.json>
//     [--seeds 10750,...,10757]
// Legs (recomputed INDEPENDENTLY from raw corpus JSONs, not from the
// analyzer's output, then cross-checked against the analysis JSON):
//   R1 corpus completeness (one file per seed, both legs)
//   R2 seed band is fresh: no seed in 10700-10707, and no seed in
//        the reserved/confirm bands named in the prereg is judged here
//        unless it is the declared band (checked by the caller passing
//        --seeds; the script refuses 10700-10707 outright)
//   R3 population partition sums per seed: away = blockedGuard +
//        havenUnknownAway + expeditionAway + blockedPathAway +
//        withinReachAway + unclassifiedAway (policy leg)
//   R4 blocked-path separation: every blockedPathAway evening has a
//        'block:*' hopReturnKind, and withinReachAway counts offered
//        evenings minus blockedPathAway (never pooled)
//   R5 primary recomputation: analyzer primaryN/primaryConverted/
//        primaryRate match the independent recount
//   R6 minimum-n rule: if primaryN < 8 the analysis verdict must be
//        'insufficient-data' with go=false; if >= 8 the verdict must be
//        GO iff rate>=0.50 and G1/G2/G3 all hold
//   R7 guards recomputed: G1 median policy >= control median - 2;
//        G2 starvation policy <= control + 2; G3 zero
//        positionAgrees/landing violations on the policy leg, where
//        the landing check judges ONLY hops that MOVED (G3
//        landing-check fix, post-2224Z: a refused hop's arrival is
//        its departure and is verified by arrival == departure +
//        outcome 'travel-refused', never counted as a landing
//        failure; the legacy raw-false count is recomputed alongside
//        for transparency but is not the guard)
//   R7b refused-hop verification is folded into R9: every travel
//        record that did not move must be a 'travel-refused' evening
//   R8 streak recomputation: independent streak count matches the
//        analysis rows (broken iff streak's last evening converted)
//   R9 honesty legs: no mid-fight/tent entry, every travel hop
//        exactly one hop unforced, control leg records no travel
//   R10 sense anchor: if any within-reach evening converted, at
//        least one travelled-home tail says "You step into the
//        Haven hall." (if none converted, this leg reports
//        no-anchor-needed and passes — the evidence file still
//        sense-tests whatever evenings exist)
//   R11 no src/ changes (policy-side arm only)
// Exits 0 with PROOF-GREEN iff every leg passes.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const analysisFile = arg('analysis', null);
const seeds = arg('seeds', '10750,10751,10752,10753,10754,10755,10756,10757')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!beforeDir || !afterDir || !analysisFile) { console.error('usage: --before <dir> --after <dir> --analysis <file> [--seeds ...]'); process.exit(2); }

const fails = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!ok) fails.push(name);
}
function load(dir, seed, policy) {
  const f = path.join(dir, `nighttravel-b-${policy}-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isStarv(d) { return /starv|hunger|famine/i.test(String((d && d.cause) || '')); }
const BLOCKED = new Set(['blocked-combat', 'blocked-tent', 'game-over']);
function isBlockRefused(e) {
  return e.eveningOutcome === 'travel-refused' && e.travel
    && typeof e.travel.hopReturnKind === 'string' && e.travel.hopReturnKind.startsWith('block:');
}
// G3 landing-check fix (same definition as the analyzer; see its
// comment): only moved hops are judged on landing; refused hops
// are verified by arrival == departure + 'travel-refused'.
function travelMoved(e) {
  const t = e.travel;
  if (!t || !t.from || !t.arrival) return null;
  const fpx = t.from.mapPx, fpy = t.from.mapPy, apx = t.arrival.mapPx, apy = t.arrival.mapPy;
  if (fpx === null || fpx === undefined || fpy === null || fpy === undefined
    || apx === null || apx === undefined || apy === null || apy === undefined) return null;
  return fpx !== apx || fpy !== apy;
}
function landingViolation(e) {
  if (!e.travel) return false;
  const moved = travelMoved(e);
  if (moved === false) return false;
  if (moved === true) {
    const h = e.haven || null;
    return !(e.travel.arrival.mapPx === (h && h.hx) && e.travel.arrival.mapPy === (h && h.hy));
  }
  return e.travelLandedOnHaven === false;
}

// R1 + R2
let t1 = true;
for (const s of seeds) {
  if (!load(beforeDir, s, 'insideevening')) { t1 = false; console.log('  missing control seed ' + s); }
  if (!load(afterDir, s, 'nighttravel')) { t1 = false; console.log('  missing policy seed ' + s); }
}
check('R1 corpus completeness', t1, seeds.length + ' seeds x 2 legs');
const t2 = seeds.every((s) => s < 10700 || s > 10707);
check('R2 fresh band: no seed in 10700-10707', t2, seeds.join(','));

const analysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
const rerun = analysis.verdict && analysis.verdict.rerun;

let t3 = true, t4 = true, t5 = true, t8 = true, t9 = true, t10 = false;
let polN = 0, polConv = 0, polExp = 0, polBlock = 0, polGuard = 0, polUnknown = 0, polUnclass = 0;
let polStreaks = 0, polBroken = 0, agreeFalse = 0, travelLandFalse = 0, landingViolations = 0, refusedHopN = 0, refusedHopVerifiedN = 0;
let convertedWithinReach = 0;
for (const s of seeds) {
  const pol = load(afterDir, s, 'nighttravel');
  const ctl = load(beforeDir, s, 'insideevening');
  const aRow = analysis.rows && analysis.rows.after && analysis.rows.after[String(s)];
  if (!pol || !aRow) { t3 = false; t5 = false; t8 = false; continue; }
  const evs = (pol.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  let guard = 0, unknown = 0, exp = 0, block = 0, wr = 0, wrConv = 0, unclass = 0, away = 0, seedLanding = 0;
  // Streak recount.
  const sorted = evs.slice().sort((a, b) => a.loopDay - b.loopDay);
  let streaks = 0, broken = 0, cur = null;
  const finish = () => { if (!cur) return; streaks++; if (cur.lastConverted) broken++; cur = null; };
  for (const e of sorted) {
    const preAway = e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven';
    const endsInside = e.inside === true && e.tile === 'haven';
    if (preAway && cur && e.loopDay === cur.endDay + 1) { cur.endDay = e.loopDay; cur.lastConverted = endsInside; }
    else if (preAway) { finish(); cur = { endDay: e.loopDay, lastConverted: endsInside }; }
    else finish();
  }
  finish();
  if (aRow.awayStreaks !== streaks || aRow.streaksBroken !== broken) { t8 = false; console.log(`  streak mismatch seed ${s}: analysis ${aRow.streaksBroken}/${aRow.awayStreaks} vs recount ${broken}/${streaks}`); }
  polStreaks += streaks; polBroken += broken;
  for (const e of evs) {
    const preAway = e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven';
    const endsInside = e.inside === true && e.tile === 'haven';
    if (e.positionAgreesWithPolicy === false) agreeFalse++;
    if (e.travelLandedOnHaven === false) travelLandFalse++;
    if (landingViolation(e)) { landingViolations++; seedLanding++; }
    if (e.travel && travelMoved(e) === false) {
      refusedHopN++;
      if (e.eveningOutcome === 'travel-refused') refusedHopVerifiedN++;
      else { t9 = false; console.log('  non-moved hop not a refusal seed ' + s + ' day ' + e.loopDay + ' outcome ' + e.eveningOutcome); }
    }
    if (e.eveningOutcome === 'completed' || e.eveningOutcome === 'already-inside') {
      if (e.inCombat) { t9 = false; console.log('  mid-fight entry seed ' + s + ' day ' + e.loopDay); }
      if (e.policyBefore && e.policyBefore.insideTent === true) { t9 = false; console.log('  tent entry seed ' + s + ' day ' + e.loopDay); }
    }
    if (e.travel) {
      if (e.travel.hops !== 1 || e.travel.forced !== false) { t9 = false; console.log('  dishonest hop seed ' + s + ' day ' + e.loopDay); }
    }
    if (e.eveningOutcome === 'completed' && e.travelledHome && (e.eveningSayTail || []).some((l) => /You step into the Haven hall\./.test(l))) t10 = true;
    if (!preAway) continue;
    away++;
    if (BLOCKED.has(e.eveningOutcome)) guard++;
    else if (e.eveningOutcome === 'haven-unknown') unknown++;
    else if (e.travelOffered === false) exp++;
    else if (isBlockRefused(e)) {
      block++;
      if (!e.travel || !String(e.travel.hopReturnKind || '').startsWith('block:')) t4 = false;
    } else if (e.travelOffered === true) {
      wr++;
      if (endsInside) { wrConv++; convertedWithinReach++; }
    } else unclass++;
  }
  if (away !== guard + unknown + exp + block + wr + unclass) { t3 = false; console.log(`  partition sum mismatch seed ${s}: away ${away} vs ${guard}+${unknown}+${exp}+${block}+${wr}+${unclass}`); }
  if (aRow.blockedGuardAway !== guard || aRow.havenUnknownAway !== unknown || aRow.expeditionAway !== exp
    || aRow.blockedPathAway !== block || aRow.withinReachAway !== wr || aRow.withinReachConverted !== wrConv
    || aRow.unclassifiedAway !== unclass || aRow.away !== away) {
    t3 = false; t5 = false;
    console.log(`  analysis row mismatch seed ${s}: analysis guard/unknown/exp/block/wr/wrConv/unclass/away ${aRow.blockedGuardAway}/${aRow.havenUnknownAway}/${aRow.expeditionAway}/${aRow.blockedPathAway}/${aRow.withinReachAway}/${aRow.withinReachConverted}/${aRow.unclassifiedAway}/${aRow.away} vs recount ${guard}/${unknown}/${exp}/${block}/${wr}/${wrConv}/${unclass}/${away}`);
  }
  if (aRow.landingViolations !== undefined && aRow.landingViolations !== seedLanding) {
    t3 = false; t5 = false;
    console.log(`  landing row mismatch seed ${s}: analysis ${aRow.landingViolations} vs recount ${seedLanding}`);
  }
  polN += wr; polConv += wrConv; polExp += exp; polBlock += block; polGuard += guard; polUnknown += unknown; polUnclass += unclass;
  if (ctl) {
    for (const e of (ctl.evenings || [])) {
      if (e.travel) { t9 = false; console.log('  control leg recorded travel seed ' + s + ' day ' + e.loopDay); }
    }
  }
}
check('R3 partition sums + analysis rows match recount', t3, `away partitioned across ${seeds.length} seeds`);
check('R4 blocked-path separation (block:* only, never in withinReach)', t4, polBlock + ' blocked-path evenings');
const rate = polN ? polConv / polN : null;
const t5ok = rerun && rerun.primaryN === polN && rerun.primaryConverted === polConv
  && ((rerun.primaryRate === null && rate === null) || Math.abs((rerun.primaryRate || 0) - (rate || 0)) < 1e-9)
  && rerun.expeditionAway === polExp && rerun.blockedPathAway === polBlock
  && rerun.streaksTotal === polStreaks && rerun.streaksBroken === polBroken;
check('R5 primary + populations + streaks match analyzer', t5ok, `primary ${polConv}/${polN} = ${rate === null ? 'null' : rate.toFixed(3)}; streaks ${polBroken}/${polStreaks}`);

// R6 + R7: guards recomputed from raw corpora.
const medCtl = median(seeds.map((s) => { const j = load(beforeDir, s, 'insideevening'); return j ? j.daysAlive : null; }).filter((x) => x !== null));
const medPol = median(seeds.map((s) => { const j = load(afterDir, s, 'nighttravel'); return j ? j.daysAlive : null; }).filter((x) => x !== null));
const starvCtl = seeds.reduce((t, s) => { const j = load(beforeDir, s, 'insideevening'); return t + ((j && j.deaths || []).filter(isStarv).length); }, 0);
const starvPol = seeds.reduce((t, s) => { const j = load(afterDir, s, 'nighttravel'); return t + ((j && j.deaths || []).filter(isStarv).length); }, 0);
const g1 = medPol >= medCtl - 2, g2 = starvPol <= starvCtl + 2, g3 = (agreeFalse + landingViolations) === 0;
const g3LegacyViolations = agreeFalse + travelLandFalse;
const expectVerdict = polN < 8 ? 'insufficient-data' : (((rate !== null && rate >= 0.5) && g1 && g2 && g3) ? 'GO' : 'NO-GO');
const t6 = rerun && rerun.verdict === expectVerdict && rerun.go === (expectVerdict === 'GO')
  && rerun.minNMet === (polN >= 8);
check('R6 minimum-n rule + verdict', t6, `n=${polN} rate=${rate === null ? 'null' : rate.toFixed(3)} verdict=${rerun ? rerun.verdict : 'no-rerun'} expected=${expectVerdict}`);
const t7 = rerun && analysis.verdict.g1 === g1 && analysis.verdict.g2 === g2 && analysis.verdict.g3 === g3
  && analysis.verdict.g3Violations === (agreeFalse + landingViolations)
  && (analysis.verdict.g3ViolationsLegacy === undefined || analysis.verdict.g3ViolationsLegacy === g3LegacyViolations);
check('R7 guards recomputed (G1/G2/G3-fixed)', t7, `G1 median ${medPol} vs ${medCtl} (${g1}); G2 starv ${starvPol} vs ${starvCtl} (${g2}); G3-fixed violations ${agreeFalse + landingViolations} (${g3}); legacy raw-false ${g3LegacyViolations}; refused hops ${refusedHopVerifiedN}/${refusedHopN} verified`);
check('R8 streak recount matches analyzer', t8, `${polBroken}/${polStreaks} broken`);
check('R9 honesty legs (no mid-fight/tent entry, 1 unforced hop, no control travel, refused hops verified)', t9);
if (convertedWithinReach === 0) {
  console.log('PASS R10 sense anchor: no within-reach conversion in corpus — no-anchor-needed (evidence sense-tests existing evenings)');
} else {
  check('R10 sense anchor: a travelled-home tail says "You step into the Haven hall."', t10, convertedWithinReach + ' converted within-reach evenings');
}

// R11
let srcDirty = '';
try { srcDirty = cp.execFileSync('git', ['status', '--short', 'src/'], { encoding: 'utf8', cwd: path.join(__dirname, '..') }).trim(); } catch (e) { srcDirty = 'git-error'; }
check('R11 no src/ changes', srcDirty === '', srcDirty || 'clean');

if (fails.length) { console.log('PROOF-RED: ' + fails.join(', ')); process.exit(1); }
console.log('PROOF-GREEN');
