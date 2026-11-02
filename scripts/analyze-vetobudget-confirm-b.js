#!/usr/bin/env node
// analyze-vetobudget-confirm-b.js — veto-budget CONFIRM analyzer
// (sim-vetobudget-confirm-b). Derived from analyze-vetobudget-b.js
// (same haul valuation, away/failed-trip/episode definitions).
// Reads confirm-driver .jsonl files and judges the confirm prereg
// (evidence/2026-11-02/sim-vetobudget-confirm-b-prereg.md).
// CONFIRM DIFFERENCES from the pilot analyzer, all preregged:
// - PRIMARY is P2+P3 only; P1 is computed and reported, never part
//   of the verdict (pilot metric review: baseline per-day was
//   already 3, so P1 does not discriminate).
// - B2 adds player-flagged deaths (player === true) as a separate
//   binding bar.
// - IDENTITY: per-seed per-loopDay comparison of day snapshots
//   (positions, scholar kcal, pantry kcal, roster count + ids)
//   + forage counts; reports divergent day-records.
// - ROUTE-REOPEN: for each armed abandonment, the baseline twin's
//   later hops for the same step (vetoed === false = the step
//   later passed) and the armed leg's later-day hops for the step
//   (structural (a1): must be 0 — the guard was never invoked
//   after abandonment). Same-day armed hops are reported
//   separately (they may be pre-abandonment attempts; intra-day
//   order between hop slices and budget log is not recorded).
// - Verdict rule for reopen cost (prereg): reopen > 0 + any bar
//   failing because of it => NO-GO (already implied by the bars);
//   reopen > 0 + all bars pass => GO with the cost reported.
//   Structural (a1) violation => NO-GO on its own.
// Modes: --baseline <jsonl> --armed <jsonl> judges the confirm
// (exit 1 on any bar FAIL, 0 when all PASS). If no repetition seed
// exists at baseline, the primary is unjudgeable: prints VERDICT:
// DIAG and exits 2 (never a GO on an unjudgeable primary).
//
// Definitions (prereg, implemented exactly):
// - away day-end: post-daily snapshot position != haven tile.
// - failed-trip day: >= 1 forage attempt, 0 successes.
// - meanDailyHaul: band mean of seed mean-daily forage kcal (same
//   valuation as the roadguard analyzer: finished rows at kcalEach x
//   units; lump components at plants.json calories, nuts x 0.75; a
//   success whose components cannot all be valued falls back to
//   hiddenKcal where present, else is flagged unvalued, never
//   zero-filled).
// - repetition seed (baseline): a seed where some step accumulates
//   >= 6 total silent vetoes at baseline OR same-step silent vetoes
//   on >= 4 distinct days.
// - same-step silent vetoes per seed-day: from the per-day hop-log
//   slices (vetoed && silent), grouped by from->to step key and
//   loopDay. Budgeted-leg silent vetoes are guard vetoes only;
//   suppressions are counted separately and are NEVER vetoes.
// - pocket-entry stranding episode: a maximal run of consecutive away
//   day-ends containing >= 1 day-end whose live dayEndReturnSim
//   FAILS, AND (the run lasts >= 2 day-ends OR a strand-linked player
//   death follows: a player starvation/dehydration death whose
//   deaths[].day maps to an away day-end that day or the day before).
//
// Modes: --baseline <jsonl> --armed <jsonl> judges the pilot (exit 1
// on any bar FAIL, 0 when all PASS). If no repetition seed exists at
// baseline, the primary is unjudgeable: prints VERDICT: DIAG and
// exits 2 (never a GO on an unjudgeable primary).
'use strict';
const fs = require('fs');
const path = require('path');

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
const baseFile = arg('baseline', null), armedFile = arg('armed', null);
if (!baseFile || !armedFile) { console.error('usage: analyze-vetobudget-b.js --baseline <jsonl> --armed <jsonl>'); process.exit(2); }

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}

let plants = null;
function plantData(pid) {
  try {
    if (!plants) plants = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'plants.json'), 'utf8'));
    if (Array.isArray(plants)) return plants.find((x) => x && x.id === pid) || null;
  } catch (e) {}
  return null;
}
function isNutPid(pid) {
  if (!pid) return false;
  if (pid === 'hickory_nut' || pid === 'acorn_white_oak') return true;
  const p = plantData(pid);
  return p ? /crack|shell|husk/i.test(p.preparation || '') : false;
}
function forageKcal(ev) {
  let kcal = 0, valued = true;
  for (const r of (ev.added || [])) {
    if (r.foodState === 'unknown') continue;
    if ((r.kcalEach || 0) > 0) kcal += r.kcalEach * (r.units || 0);
  }
  for (const c of (ev.addedLump || [])) {
    const p = plantData(c.pid);
    if (p && typeof p.caloriesPerUnit === 'number') {
      kcal += c.units * (isNutPid(c.pid) ? Math.round(p.caloriesPerUnit * 0.75) : p.caloriesPerUnit);
    } else valued = false;
  }
  return { kcal, valued };
}
function deathMode(d) {
  const raw = (d && typeof d === 'object' && d.cause) ? String(d.cause) : (typeof d === 'string' ? d : JSON.stringify(d));
  const s = raw.toLowerCase();
  if (/starvat/.test(s)) return 'starvation';
  if (/dehydrat/.test(s)) return 'dehydration';
  if (/monster|beast|wild|combat|fight|kill/.test(s)) return 'wild/combat';
  if (/disease|poison|sick/.test(s)) return 'disease/poison';
  return 'other:' + raw.slice(0, 80);
}

function analyzeSeed(inst) {
  const days = inst.days || [];
  const haven = (days[0] && days[0].start && days[0].start.haven) || { x: 4, y: 4 };
  const away = (snap) => !!snap && !!snap.pos && (snap.pos.x !== haven.x || snap.pos.y !== haven.y);
  const awayByDay = {};
  let awayDayEnds = 0, failedTripDays = 0, haulKcal = 0, successes = 0, valuedSuccesses = 0, attempts = 0;
  for (const d of days) {
    const isAway = away(d.end);
    awayByDay[d.loopDay] = isAway;
    if (isAway) awayDayEnds++;
    const att = (d.forages || []).length;
    const suc = (d.forages || []).filter((f) => f.ok).length;
    attempts += att; successes += suc;
    if (att > 0 && suc === 0) failedTripDays++;
    for (const f of (d.forages || []).filter((x) => x.ok)) {
      const v = forageKcal(f);
      haulKcal += v.kcal;
      if (v.valued) valuedSuccesses++;
    }
  }
  const loopDays = days.length;
  const deaths = (inst.deaths || []);
  const playerDeaths = deaths.filter((x) => (typeof x === 'string' ? true : x.player !== false));
  const playerDeathTexts = playerDeaths.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  const strandDeathDays = [];
  for (const d of playerDeaths) {
    const cause = (typeof d === 'string' ? d : JSON.stringify(d));
    if (!/starvat|dehydrat/i.test(cause)) continue;
    const day = (d && typeof d === 'object' && d.day) || null;
    if (day == null) continue;
    if (awayByDay[day] || awayByDay[day - 1]) strandDeathDays.push(day);
  }
  const episodes = [];
  let run = null;
  const flushRun = () => {
    if (!run) return;
    const pocket = run.days.some((d) => d.dayEndReturnSim && d.dayEndReturnSim.ok === false);
    const deathLinked = strandDeathDays.some((dd) => dd >= run.start && dd <= run.end + 1);
    if (pocket && (run.days.length >= 2 || deathLinked)) {
      episodes.push({ start: run.start, end: run.end, days: run.days.map((d) => d.loopDay),
        positions: run.days.map((d) => (d.end.pos ? d.end.pos.x + ',' + d.end.pos.y : '?')),
        simFailDays: run.days.filter((d) => d.dayEndReturnSim && d.dayEndReturnSim.ok === false).map((d) => d.loopDay),
        deathLinked });
    }
    run = null;
  };
  for (const d of days) {
    if (away(d.end)) {
      if (!run) run = { start: d.loopDay, end: d.loopDay, days: [d] };
      else { run.end = d.loopDay; run.days.push(d); }
    } else flushRun();
  }
  flushRun();
  const vetoes = days.reduce((t, d) => t + (d.vetoes || 0), 0);
  const silentVetoes = days.reduce((t, d) => t + (d.silentVetoes || 0), 0);
  const homewardVetoes = days.reduce((t, d) => t + (d.homewardVetoes || 0), 0);
  const lateralPasses = days.reduce((t, d) => t + (d.lateralPasses || 0), 0);
  const creditUses = days.reduce((t, d) => t + (d.creditUses || 0), 0);
  const simChecks = days.reduce((t, d) => t + (d.simChecks || 0), 0);
  const beyondUngenerated = days.reduce((t, d) => t + (d.beyondUngenerated || 0), 0)
    + days.reduce((t, d) => t + (((d.dayEndReturnSim || {}).beyondUngenerated) || 0), 0);
  const suppressions = days.reduce((t, d) => t + (d.suppressions || 0), 0);
  const abandonments = days.reduce((t, d) => t + (d.abandonments || 0), 0);
  const falseOpens = days.filter((d) => away(d.end) && (d.vetoes || 0) === 0 &&
    d.dayEndReturnSim && d.dayEndReturnSim.ok === false).map((d) => d.loopDay);
  // Per-step silent-veto stats from hop-log slices (vetoed && silent).
  const stepStats = {};
  for (const d of days) {
    for (const h of (d.hops || [])) {
      if (!h.vetoed || !h.silent) continue;
      const k = h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y;
      stepStats[k] = stepStats[k] || { total: 0, days: {}, maxPerDay: 0 };
      stepStats[k].total++;
      stepStats[k].days[d.loopDay] = (stepStats[k].days[d.loopDay] || 0) + 1;
      if (stepStats[k].days[d.loopDay] > stepStats[k].maxPerDay) stepStats[k].maxPerDay = stepStats[k].days[d.loopDay];
    }
  }
  for (const k of Object.keys(stepStats)) {
    stepStats[k].dayCount = Object.keys(stepStats[k].days).length;
    stepStats[k].dayList = Object.keys(stepStats[k].days).map(Number).sort((a, b) => a - b);
  }
  const maxStepTotal = Math.max(0, ...Object.values(stepStats).map((s) => s.total));
  const maxStepDays = Math.max(0, ...Object.values(stepStats).map((s) => s.dayCount));
  const maxStepPerDay = Math.max(0, ...Object.values(stepStats).map((s) => s.maxPerDay));
  const isRepetitionSeed = Object.values(stepStats).some((s) => s.total >= 6 || s.dayCount >= 4);
  // Abandoned steps (budgeted leg): from budgetLog abandonment entries.
  const abandonedSteps = [];
  for (const d of days) {
    for (const b of (d.budgetLog || [])) {
      if (b.abandoned) abandonedSteps.push({ loopDay: d.loopDay, step: b.from.x + ',' + b.from.y + '->' + b.to.x + ',' + b.to.y, count: b.count });
    }
  }
  return { seed: inst.seed, policy: inst.policy, loopDays, daysAlive: inst.daysAlive,
    endReason: inst.endReason, maxWaveUnlocked: inst.maxWaveUnlocked,
    awayDayEnds, failedTripDays,
    failedTripDayShare: loopDays ? +(failedTripDays / loopDays).toFixed(3) : null,
    haulKcal: Math.round(haulKcal), meanDailyHaul: loopDays ? +(haulKcal / loopDays).toFixed(1) : null,
    haulCoverage: successes ? valuedSuccesses / successes : null,
    attempts, successes, vetoes, silentVetoes, lateralPasses, creditUses, simChecks, beyondUngenerated,
    suppressions, abandonments, abandonedSteps,
    deaths, deathModes: deaths.map(deathMode), playerDeathTexts,
    playerDeaths: deaths.filter((d) => d && typeof d === 'object' && d.player === true).length,
    strandDeathDays, episodes, falseOpens,
    homewardVetoes, stepStats, maxStepTotal, maxStepDays, maxStepPerDay, isRepetitionSeed,
    strandLinked: strandDeathDays.length > 0 };
}

function analyzeBand(insts) {
  const seeds = insts.map(analyzeSeed);
  const totalDays = seeds.reduce((t, s) => t + s.loopDays, 0);
  const failed = seeds.reduce((t, s) => t + s.failedTripDays, 0);
  const away = seeds.reduce((t, s) => t + s.awayDayEnds, 0);
  const meanHaul = seeds.length ? seeds.reduce((t, s) => t + (s.meanDailyHaul || 0), 0) / seeds.length : null;
  const sorted = seeds.map((s) => s.daysAlive).sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
  const starvDeaths = seeds.filter((s) => (s.playerDeathTexts || []).some((d) => /starvat/i.test(d))).length;
  const episodes = seeds.reduce((t, s) => t + s.episodes.length, 0);
  const vetoes = seeds.reduce((t, s) => t + s.vetoes, 0);
  const silentVetoes = seeds.reduce((t, s) => t + s.silentVetoes, 0);
  const suppressions = seeds.reduce((t, s) => t + s.suppressions, 0);
  const abandonments = seeds.reduce((t, s) => t + s.abandonments, 0);
  const forageTrips = seeds.reduce((t, s) => t + s.attempts, 0);
  const deaths = seeds.reduce((t, s) => t + s.deaths.length, 0);
  const deathModes = [...new Set(seeds.flatMap((s) => s.deathModes))];
  const falseOpens = seeds.reduce((t, s) => t + s.falseOpens.length, 0);
  const playerDeaths = seeds.reduce((t, s) => t + (s.playerDeaths || 0), 0);
  return { seeds, totalDays, failedTripDays: failed,
    failedTripDayShare: totalDays ? +(failed / totalDays).toFixed(3) : null,
    awayDayEnds: away, meanDailyHaul: meanHaul == null ? null : +meanHaul.toFixed(1),
    medianSurvival: median, starvationDeathSeeds: starvDeaths,
    episodes, vetoes, silentVetoes, suppressions, abandonments, forageTrips, deaths, deathModes, falseOpens, playerDeaths };
}

const baseInsts = readJsonl(baseFile);
const armedInsts = readJsonl(armedFile);
const baseline = analyzeBand(baseInsts);
const armed = analyzeBand(armedInsts);

// IDENTITY: per-seed per-loopDay snapshot comparison (confirm driver
// records pantryKcal + roster on every day snapshot). Scope, stated
// in the evidence: positions, scholar kcal, pantry kcal, roster
// count + id set, forage attempts/successes. NOT compared: codex,
// trust, inventory composition, monster state.
function snapSig(snap) {
  if (!snap) return null;
  const r = snap.roster || {};
  return JSON.stringify([snap.pos, snap.kcal, snap.pantryKcal ?? null,
    r.count ?? null, (r.ids || null)]);
}
function identityCompare(baseInst, armedInst) {
  const bDays = new Map((baseInst.days || []).map((d) => [d.loopDay, d]));
  const aDays = new Map((armedInst.days || []).map((d) => [d.loopDay, d]));
  const divergentLoopDays = [];
  const divergentFields = {};
  for (const [ld, bd] of bDays) {
    const ad = aDays.get(ld);
    if (!ad) { divergentLoopDays.push(ld); divergentFields[ld] = ['missing-armed-day']; continue; }
    const fields = [];
    if (JSON.stringify((bd.start || {}).pos) !== JSON.stringify((ad.start || {}).pos)) fields.push('startPos');
    if (JSON.stringify((bd.end || {}).pos) !== JSON.stringify((ad.end || {}).pos)) fields.push('endPos');
    if ((bd.end || {}).kcal !== (ad.end || {}).kcal) fields.push('endKcal');
    if (snapSig(bd.end) !== snapSig(ad.end)) fields.push('endSnapshot');
    const bF = bd.forages || [], aF = ad.forages || [];
    if (bF.length !== aF.length) fields.push('forageAttempts');
    if (bF.filter((f) => f.ok).length !== aF.filter((f) => f.ok).length) fields.push('forageSuccesses');
    if (fields.length) { divergentLoopDays.push(ld); divergentFields[ld] = fields; }
  }
  return { seed: baseInst.seed, divergentDays: divergentLoopDays.length,
    divergentLoopDays, firstDivergentDay: divergentLoopDays.length ? Math.min(...divergentLoopDays) : null,
    divergentFields };
}
const identity = baseInsts.map((b) => {
  const a = armedInsts.find((x) => x.seed === b.seed);
  return a ? identityCompare(b, a) : { seed: b.seed, divergentDays: null, divergentLoopDays: [], firstDivergentDay: null, divergentFields: {}, missingArmed: true };
});

// ROUTE-REOPEN: for each armed abandonment, the baseline twin's hops
// for the same step on LATER loopDays (vetoed === false = passed).
function stepKeyOf(h) { return h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y; }
const reopen = [];
const structuralViolations = [];
for (const aInst of armedInsts) {
  const bInst = baseInsts.find((x) => x.seed === aInst.seed);
  if (!bInst) continue;
  const aAnalyzed = armed.seeds.find((s) => s.seed === aInst.seed) || {};
  for (const ab of (aAnalyzed.abandonedSteps || [])) {
    const step = ab.step, day = ab.loopDay;
    let basePasses = 0, basePassDays = [], baseVetoesAfter = 0;
    for (const d of (bInst.days || [])) {
      if (d.loopDay <= day) continue;
      for (const h of (d.hops || [])) {
        if (stepKeyOf(h) !== step) continue;
        if (h.vetoed) baseVetoesAfter++; else { basePasses++; basePassDays.push(d.loopDay); }
      }
    }
    let armedLaterHops = 0, armedLaterHopDays = [], armedSameDayHops = 0;
    for (const d of (aInst.days || [])) {
      for (const h of (d.hops || [])) {
        if (stepKeyOf(h) !== step) continue;
        if (d.loopDay > day) { armedLaterHops++; armedLaterHopDays.push(d.loopDay); }
        else if (d.loopDay === day) armedSameDayHops++;
      }
    }
    const entry = { seed: aInst.seed, step, abandonDay: day,
      baselinePassesAfter: basePasses, firstBaselinePassDay: basePassDays.length ? Math.min(...basePassDays) : null,
      baselineVetoesAfter: baseVetoesAfter,
      armedLaterHops, armedLaterHopDays: [...new Set(armedLaterHopDays)].sort((x, y) => x - y),
      armedSameDayHops };
    reopen.push(entry);
    if (armedLaterHops > 0) structuralViolations.push(entry);
  }
}
const reopenCount = reopen.filter((r) => r.baselinePassesAfter > 0).length;
// Divergence traced to a reopen: divergent identity days on/after the
// first baseline pass day for that seed/step (null when no pass).
for (const r of reopen) {
  const id = identity.find((x) => x.seed === r.seed) || {};
  r.divergentDaysOnOrAfterFirstPass = r.firstBaselinePassDay == null ? null :
    (id.divergentLoopDays || []).filter((d) => d >= r.firstBaselinePassDay);
  r.divergentDaysOnOrAfterAbandon = (id.divergentLoopDays || []).filter((d) => d >= r.abandonDay);
}

// PRIMARY: repetition seeds are defined on the BASELINE leg.
const repetitionSeeds = baseline.seeds.filter((s) => s.isRepetitionSeed).map((s) => s.seed);
const p1 = { repetitionSeeds, perSeed: [], pass: true };
for (const b of baseline.seeds.filter((s) => s.isRepetitionSeed)) {
  const a = armed.seeds.find((s) => s.seed === b.seed) || {};
  const v = (a.maxStepPerDay == null ? null : a.maxStepPerDay);
  const pass = v != null && v <= 3;
  if (!pass) p1.pass = false;
  p1.perSeed.push({ seed: b.seed, baselineMaxPerDay: b.maxStepPerDay, armedMaxPerDay: v, pass });
}
const p2violations = [];
for (const a of armed.seeds) {
  for (const [k, s] of Object.entries(a.stepStats)) {
    if (s.dayCount > 3) p2violations.push({ seed: a.seed, step: k, silentDays: s.dayCount, total: s.total });
  }
}
const p2 = { violations: p2violations, pass: p2violations.length === 0 };
const p3violations = [];
for (const a of armed.seeds) {
  for (const [k, s] of Object.entries(a.stepStats)) {
    if (s.total > 3) p3violations.push({ seed: a.seed, step: k, total: s.total, silentDays: s.dayCount });
  }
}
const p3 = { violations: p3violations, pass: p3violations.length === 0 };
// CONFIRM: P1 is REPORT ONLY (pilot metric review) — the binding
// primary is P2 AND P3 on every repetition seed.
const primaryPass = repetitionSeeds.length > 0 && p2.pass && p3.pass;

// NO-HARM BARS
const bars = {};
bars.B1Survival = { baselineMedian: baseline.medianSurvival, armedMedian: armed.medianSurvival,
  pass: armed.medianSurvival >= baseline.medianSurvival };
const newModes = armed.deathModes.filter((m) => !baseline.deathModes.includes(m));
bars.B2Deaths = { baselineDeaths: baseline.deaths, armedDeaths: armed.deaths,
  baselinePlayerDeaths: baseline.playerDeaths, armedPlayerDeaths: armed.playerDeaths,
  baselineModes: baseline.deathModes, armedModes: armed.deathModes, newModes,
  pass: armed.deaths <= baseline.deaths && newModes.length === 0 && armed.playerDeaths <= baseline.playerDeaths };
bars.B3FailedTripShare = { baseline: baseline.failedTripDayShare, armed: armed.failedTripDayShare,
  threshold: 'armed <= baseline + 0.05 (this arm\'s own tolerance)',
  pass: armed.failedTripDayShare <= baseline.failedTripDayShare + 0.05 };
bars.B4MeanDailyHaul = { baseline: baseline.meanDailyHaul, armed: armed.meanDailyHaul,
  threshold: '>= 0.95 x baseline', pass: armed.meanDailyHaul >= 0.95 * baseline.meanDailyHaul };
const perSeedHaul = baseline.seeds.map((b) => {
  const a = armed.seeds.find((x) => x.seed === b.seed) || {};
  const ratio = (b.meanDailyHaul || 0) > 0 ? (a.meanDailyHaul || 0) / b.meanDailyHaul : null;
  return { seed: b.seed, baseline: b.meanDailyHaul, armed: a.meanDailyHaul ?? null,
    ratio: ratio == null ? null : +ratio.toFixed(3), pass: ratio == null ? true : ratio >= 0.50 };
});
bars.B4perSeed = { perSeedHaul, threshold: 'every seed >= 0.50x its own baseline',
  pass: perSeedHaul.every((r) => r.pass) };
bars.B5Away = { baseline: baseline.awayDayEnds, armed: armed.awayDayEnds,
  threshold: 'armed <= baseline + 2', pass: armed.awayDayEnds <= baseline.awayDayEnds + 2 };
bars.B6Idling = { baselineForageTrips: baseline.forageTrips, armedForageTrips: armed.forageTrips,
  threshold: 'armed >= 0.90 x baseline', pass: armed.forageTrips >= 0.90 * baseline.forageTrips };
const b7missing = [];
for (const b of baseline.seeds.filter((s) => s.isRepetitionSeed)) {
  const a = armed.seeds.find((s) => s.seed === b.seed) || {};
  if (!((a.suppressions || 0) > 0)) b7missing.push(b.seed);
}
bars.B7Engagement = { repetitionSeeds, suppressionsBySeed: armed.seeds.map((s) => ({ seed: s.seed, suppressions: s.suppressions, abandonments: s.abandonments })),
  missing: b7missing, pass: b7missing.length === 0 };
const vetoCreated = [];
for (const a of armed.seeds) {
  const b = baseline.seeds.find((s) => s.seed === a.seed);
  if (!b) continue;
  if (a.episodes.length > 0 && b.episodes.length === 0) vetoCreated.push({ seed: a.seed, armedEpisodes: a.episodes });
}
bars.B8VetoCreatedPockets = { vetoCreated, pass: vetoCreated.length === 0 };
const allBarsPass = Object.values(bars).every((b) => b.pass);

console.log('PER-SEED TABLE');
console.log('seed | base away/ep | armed away/ep | base failedShare | armed failedShare | base haul | armed haul | haulRatio | vetoes(silent) base->armed | suppressions | abandonments | maxStep silent total/days/perDay base->armed | wave | endReason');
for (const b of baseline.seeds) {
  const a = armed.seeds.find((s) => s.seed === b.seed) || {};
  const bs = Object.entries(b.stepStats).map(([k, s]) => k + '=' + s.total + '/' + s.dayCount + '/' + s.maxPerDay).join(';');
  const as = Object.entries(a.stepStats || {}).map(([k, s]) => k + '=' + s.total + '/' + s.dayCount + '/' + s.maxPerDay).join(';');
  console.log(b.seed + (b.isRepetitionSeed ? ' [REP]' : '') + ' | ' + b.awayDayEnds + '/' + b.episodes.length + ' | ' + (a.awayDayEnds ?? '?') + '/' + ((a.episodes || []).length) +
    ' | ' + b.failedTripDayShare + ' | ' + (a.failedTripDayShare ?? '?') +
    ' | ' + b.meanDailyHaul + ' | ' + (a.meanDailyHaul ?? '?') +
    ' | ' + ((b.meanDailyHaul || 0) > 0 && a.meanDailyHaul != null ? +((a.meanDailyHaul / b.meanDailyHaul).toFixed(3)) : '?') +
    ' | ' + b.vetoes + '(' + b.silentVetoes + ')->' + (a.vetoes ?? 0) + '(' + (a.silentVetoes ?? 0) + ')' +
    ' | ' + (a.suppressions ?? 0) + ' | ' + (a.abandonments ?? 0) +
    ' | ' + bs + ' -> ' + as +
    ' | ' + (a.maxWaveUnlocked ?? '?') + ' | ' + (a.endReason ?? '?'));
}
console.log('BAND: baseline away=' + baseline.awayDayEnds + ' armed away=' + armed.awayDayEnds +
  ' baseline episodes=' + baseline.episodes + ' armed episodes=' + armed.episodes +
  ' baseline vetoes=' + baseline.vetoes + '(' + baseline.silentVetoes + ' silent)' +
  ' armed vetoes=' + armed.vetoes + '(' + armed.silentVetoes + ' silent)' +
  ' armed suppressions=' + armed.suppressions + ' armed abandonments=' + armed.abandonments +
  ' baseline median=' + baseline.medianSurvival + ' armed median=' + armed.medianSurvival +
  ' baseline deaths=' + baseline.deaths + ' armed deaths=' + armed.deaths +
  ' baseline starvSeeds=' + baseline.starvationDeathSeeds + ' armed starvSeeds=' + armed.starvationDeathSeeds +
  ' armed falseOpens=' + armed.falseOpens);
console.log('PRIMARY: ' + JSON.stringify({ P1reportOnly: p1, P2: p2, P3: p3, primaryPass }, null, 2));
console.log('BARS: ' + JSON.stringify(bars, null, 2));
console.log('IDENTITY: ' + JSON.stringify({ perSeed: identity,
  totalDivergentDays: identity.reduce((t, s) => t + (s.divergentDays || 0), 0) }, null, 2));
console.log('ROUTE-REOPEN: ' + JSON.stringify({ reopen, reopenCount,
  structuralViolations, structuralPass: structuralViolations.length === 0 }, null, 2));
if (repetitionSeeds.length === 0) {
  console.log('VERDICT: DIAG (no repetition seed at baseline — primary unjudgeable)');
  process.exit(2);
}
const structuralPass = structuralViolations.length === 0;
console.log('VERDICT: ' + (primaryPass && allBarsPass && structuralPass ? 'GO' : 'NO-GO') +
  (reopenCount > 0 ? ' (route-reopen cost measured: ' + reopenCount + ' abandoned step(s) later passed at baseline; verdict stands on the bars per prereg)' : ''));
process.exit(primaryPass && allBarsPass && structuralPass ? 0 : 1);
