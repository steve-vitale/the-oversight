#!/usr/bin/env node
// analyze-eveningdetour-b.js — refused-evening rescue analysis for
// sim-eveningdetour-b (prereg:
// evidence/2026-10-29/sim-eveningdetour-b-prereg.md, committed
// BEFORE any judged after-leg).
//
// Usage:
//   node scripts/analyze-eveningdetour-b.js --before <gate-off-dir>
//     --after <gate-on-dir> [--out <analysis.json>]
// --before = nighttravel gate-OFF corpus, --after = nighttravel
// gate-ON corpus. Same driver, same seeds, same substrate.
// Prints a human table and writes the JSON analysis when --out
// is given. Exits 0 when the analysis is complete (the verdict
// is data, not an exit code — the evidence file judges it).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const outFile = arg('out', null);
if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--out <file>]'); process.exit(2); }

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isStarv(d) { return /starv|hunger|famine/i.test(String((d && d.cause) || '')); }
const BLOCKED = new Set(['blocked-combat', 'blocked-tent', 'game-over']);
const DETOUR_OUTCOMES = new Set(['detour-stopped', 'detour-nopath', 'detour-died']);

function endsInside(e) { return e.inside === true && e.tile === 'haven'; }
function isAway(e) { return e.preStepTile !== null && e.preStepTile !== undefined && e.preStepTile !== 'haven'; }
// Refused, per the prereg: before leg = travel-refused; after leg =
// detour attempted OR travel-refused (a detour evening whose entry
// then failed still counts as refused-and-unrescued, never rescued).
function isRefused(e, leg) {
  if (leg === 'before') return e.eveningOutcome === 'travel-refused';
  return !!e.detourAttempted || e.eveningOutcome === 'travel-refused';
}
function streaksOf(evs, isUnrescuedRefused) {
  const sorted = evs.slice().sort((a, b) => a.loopDay - b.loopDay);
  const list = [];
  let cur = null;
  const finish = () => { if (cur) { list.push(cur); cur = null; } };
  for (const e of sorted) {
    if (isUnrescuedRefused(e) && cur && e.loopDay === cur.endDay + 1) {
      cur.endDay = e.loopDay; cur.evenings++;
    } else if (isUnrescuedRefused(e)) {
      finish(); cur = { startDay: e.loopDay, endDay: e.loopDay, evenings: 1 };
    } else finish();
  }
  finish();
  return list;
}

function perSeed(j, leg) {
  const evs = (j.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  const outcomes = {};
  let away = 0, refused = 0, rescued = 0;
  let blockedGuardAway = 0, havenUnknownAway = 0, outOfReachAway = 0, otherAway = 0;
  let detourAttempted = 0, detourRescued = 0, detourStopped = 0, detourNopath = 0, detourDied = 0;
  let detourStepsTotal = 0, detourStepsCombat = 0, detourPathLenSum = 0, detourPathLenN = 0;
  let detourPathLenHist = {};
  const g3 = { teleportSteps: 0, rescuedOffHaven: 0, combatThenInside: 0, stillRefusedMoved: 0, details: [] };
  let detourAttemptedGateOff = 0;
  for (const e of evs) {
    outcomes[e.eveningOutcome] = (outcomes[e.eveningOutcome] || 0) + 1;
    if (e.detourAttempted) detourAttempted++;
    if (leg === 'before' && e.detourAttempted) detourAttemptedGateOff++;
    if (!isAway(e)) continue;
    away++;
    if (BLOCKED.has(e.eveningOutcome)) { blockedGuardAway++; continue; }
    if (e.eveningOutcome === 'haven-unknown') { havenUnknownAway++; continue; }
    if (e.eveningOutcome === 'out-of-reach') { outOfReachAway++; continue; }
    if (isRefused(e, leg)) {
      refused++;
      const res = endsInside(e);
      if (res) { rescued++; }
      if (e.detourAttempted) {
        if (res) detourRescued++;
        if (e.eveningOutcome === 'detour-stopped') detourStopped++;
        if (e.eveningOutcome === 'detour-nopath') detourNopath++;
        if (e.eveningOutcome === 'detour-died') detourDied++;
        const d = e.detour || {};
        if (Array.isArray(d.path)) {
          detourPathLenSum += d.path.length; detourPathLenN++;
          detourPathLenHist[d.path.length] = (detourPathLenHist[d.path.length] || 0) + 1;
        }
        if (Array.isArray(d.steps)) {
          for (const s of d.steps) {
            detourStepsTotal++;
            if (s.combatLive) detourStepsCombat++;
            const md = Math.abs((s.to.mapPx ?? -99) - (s.from.mapPx ?? -99)) + Math.abs((s.to.mapPy ?? -99) - (s.from.mapPy ?? -99));
            if (md !== 1) { g3.teleportSteps++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'teleport-step', step: s }); }
          }
          // Final-step haven check on rescued evenings.
          if (res && d.steps.length) {
            const last = d.steps[d.steps.length - 1];
            const h = e.haven || {};
            if (last.to.mapPx !== h.hx || last.to.mapPy !== h.hy) {
              g3.rescuedOffHaven++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'rescued-off-haven', last });
            }
          }
        }
        if (res && e.inCombat === true) {
          g3.combatThenInside++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'combat-then-inside' });
        }
      }
      // Still-refused arrival == departure check (hop record).
      if (!res && e.travel && e.travel.from && e.travel.arrival) {
        if (e.travel.from.mapPx !== e.travel.arrival.mapPx || e.travel.from.mapPy !== e.travel.arrival.mapPy) {
          // A detour-stopped evening legitimately MOVED on detour steps;
          // the G3 check is about the REFUSED hop, not detour steps.
          // Only flag when no detour step moved.
          const movedSteps = (e.detour && Array.isArray(e.detour.steps))
            ? e.detour.steps.filter((s) => s.moved).length : 0;
          if (movedSteps === 0) {
            g3.stillRefusedMoved++; g3.details.push({ seed: j.seed, loopDay: e.loopDay, kind: 'still-refused-moved', travel: e.travel });
          }
        }
      }
    } else if (endsInside(e)) {
      // Converted without refusal (plain nighttravel hop success).
    } else {
      otherAway++;
    }
  }
  const streakList = streaksOf(evs, (e) => isAway(e) && isRefused(e, leg) && !endsInside(e));
  const streakLens = streakList.map((s) => s.evenings);
  const starv = (j.deaths || []).filter(isStarv).length;
  // Morning-after persistence for rescued evenings (secondary).
  const evByLoopDay = {};
  for (const e of evs) evByLoopDay[e.loopDay] = e;
  const mornings = j.mornings || [];
  let rescuedMorningInside = 0, rescuedWithMorning = 0;
  for (const e of evs) {
    if (isAway(e) && isRefused(e, leg) && endsInside(e)) {
      const m = mornings.find((mm) => mm.loopDay === e.loopDay + 1);
      if (m) { rescuedWithMorning++; if (m.inside === true && m.tile === 'haven') rescuedMorningInside++; }
    }
  }
  void evByLoopDay;
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason,
    evenings: evs.length, away, refused, rescued,
    rescueRate: refused ? rescued / refused : null,
    blockedGuardAway, havenUnknownAway, outOfReachAway, otherAway,
    partitionSum: blockedGuardAway + havenUnknownAway + outOfReachAway + refused + otherAway
      + evs.filter((e) => isAway(e) && !isRefused(e, leg) && endsInside(e)).length,
    detourAttempted, detourRescued, detourStopped, detourNopath, detourDied,
    detourStepsTotal, detourStepsCombat,
    detourEncounterRatePerStep: detourStepsTotal ? detourStepsCombat / detourStepsTotal : null,
    detourPathLenMean: detourPathLenN ? detourPathLenSum / detourPathLenN : null,
    detourPathLenHist,
    g3Violations: g3.teleportSteps + g3.rescuedOffHaven + g3.combatThenInside + g3.stillRefusedMoved,
    g3, detourAttemptedGateOff,
    streakCount: streakList.length, streakList,
    streakMean: streakLens.length ? streakLens.reduce((a, b) => a + b, 0) / streakLens.length : null,
    streakMax: streakLens.length ? Math.max(...streakLens) : 0,
    rescuedMorningInside, rescuedWithMorning,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
    maxWaveUnlocked: j.maxWaveUnlocked, waveKills: j.waveKills,
    outcomes, grantOk: j.grantOk,
  };
}

const before = loadDir(beforeDir), after = loadDir(afterDir);
const seeds = Object.keys(after).map(Number).sort((a, b) => a - b);
const rows = { before: {}, after: {} };
for (const s of seeds) {
  if (before[s]) rows.before[s] = perSeed(before[s], 'before');
  rows.after[s] = perSeed(after[s], 'after');
}
const sum = (rs, k) => Object.values(rs).reduce((t, r) => t + (r[k] || 0), 0);
const refusedN = sum(rows.after, 'refused');
const rescuedN = sum(rows.after, 'rescued');
const rate = refusedN ? rescuedN / refusedN : null;
const medBefore = median(Object.values(rows.before).map((r) => r.daysAlive));
const medAfter = median(Object.values(rows.after).map((r) => r.daysAlive));
const starvBefore = sum(rows.before, 'starvationDeaths');
const starvAfter = sum(rows.after, 'starvationDeaths');
const g1 = medBefore === null ? null : (medAfter >= medBefore - 2);
const g2 = starvAfter <= starvBefore + 2;
const g3Violations = sum(rows.after, 'g3Violations');
const g3 = g3Violations === 0;
const minNMet = refusedN >= 8;
let verdictStr;
if (!minNMet) verdictStr = 'INSUFFICIENT-DATA';
else if (rate !== null && rate >= 0.50 && g1 && g2 && g3) verdictStr = 'GO';
else verdictStr = 'KILLED-AT-PILOT';
const allStreakLensAfter = Object.values(rows.after).flatMap((r) => r.streakList.map((s) => s.evenings));
const allStreakLensBefore = Object.values(rows.before).flatMap((r) => r.streakList.map((s) => s.evenings));
const verdict = {
  seeds: seeds.length, seedList: seeds,
  primary: { refusedN, rescuedN, rate, bar: 0.50, minN: 8, minNMet },
  g1: { medianBefore: medBefore, medianAfter: medAfter, pass: g1 },
  g2: { starvationBefore: starvBefore, starvationAfter: starvAfter, pass: g2 },
  g3: { violations: g3Violations, pass: g3 },
  verdict: verdictStr,
  go: verdictStr === 'GO',
  beforeRefused: sum(rows.before, 'refused'),
  afterDetourAttempted: sum(rows.after, 'detourAttempted'),
  afterDetourStopped: sum(rows.after, 'detourStopped'),
  afterDetourNopath: sum(rows.after, 'detourNopath'),
  afterDetourDied: sum(rows.after, 'detourDied'),
  afterDetourStepsTotal: sum(rows.after, 'detourStepsTotal'),
  afterDetourStepsCombat: sum(rows.after, 'detourStepsCombat'),
  afterDetourEncounterRatePerStep: sum(rows.after, 'detourStepsTotal')
    ? sum(rows.after, 'detourStepsCombat') / sum(rows.after, 'detourStepsTotal') : null,
  streakBeforeMean: allStreakLensBefore.length ? allStreakLensBefore.reduce((a, b) => a + b, 0) / allStreakLensBefore.length : null,
  streakBeforeMax: allStreakLensBefore.length ? Math.max(...allStreakLensBefore) : 0,
  streakAfterMean: allStreakLensAfter.length ? allStreakLensAfter.reduce((a, b) => a + b, 0) / allStreakLensAfter.length : null,
  streakAfterMax: allStreakLensAfter.length ? Math.max(...allStreakLensAfter) : 0,
  rescuedMorningInside: sum(rows.after, 'rescuedMorningInside'),
  rescuedWithMorning: sum(rows.after, 'rescuedWithMorning'),
  partitionHolds: seeds.every((s) => rows.after[s].partitionSum === rows.after[s].away
    && (!rows.before[s] || rows.before[s].partitionSum === rows.before[s].away)),
  gateOffDetourAttempted: sum(rows.before, 'detourAttemptedGateOff'),
  wave4_5: { before: Object.values(rows.before).filter((r) => (r.maxWaveUnlocked || 0) >= 4).length, after: Object.values(rows.after).filter((r) => (r.maxWaveUnlocked || 0) >= 4).length },
};
const analysis = { verdict, rows };
console.log('seed | days | away refused rescued rate | detour att resc stop nopath died | steps combat | streakMean/Max | starv | end (after leg; before in JSON)');
for (const s of seeds) {
  const r = rows.after[s];
  console.log(`${s} | ${r.daysAlive} | ${r.away} ${r.refused} ${r.rescued} ${r.rescueRate === null ? 'null' : r.rescueRate.toFixed(2)} | ${r.detourAttempted} ${r.detourRescued} ${r.detourStopped} ${r.detourNopath} ${r.detourDied} | ${r.detourStepsTotal} ${r.detourStepsCombat} | ${r.streakMean === null ? 'null' : r.streakMean.toFixed(2)}/${r.streakMax} | ${r.starvationDeaths} | ${r.endReason}`);
}
console.log('--- before leg (gate OFF) ---');
for (const s of seeds) {
  const r = rows.before[s];
  if (!r) { console.log(`${s} | MISSING`); continue; }
  console.log(`${s} | ${r.daysAlive} | ${r.away} ${r.refused} ${r.rescued} | streak ${r.streakMean === null ? 'null' : r.streakMean.toFixed(2)}/${r.streakMax} | ${r.starvationDeaths} | ${r.endReason}`);
}
console.log('--- verdict ---');
console.log(JSON.stringify(verdict, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n');
