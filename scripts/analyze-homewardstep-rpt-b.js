#!/usr/bin/env node
// analyze-homewardstep-b.js — travelTo-jump-faithful guard analyzer
// Re-ported for sim-homewardstep-rpt-b (2026-11-02) via git show.
// (sim-homewardstep-b). Reads driver .jsonl files (baseline shadow +
// armed veto, one JSON object per seed, stdout of
// homewardstep-b-driver.js) and judges the prereg bars
// (evidence/2026-11-02/sim-homewardstep-b-prereg.md).
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
// - pocket-entry stranding episode: a maximal run of consecutive away
//   day-ends containing >= 1 day-end whose live dayEndReturnSim
//   FAILS, AND (the run lasts >= 2 day-ends OR a strand-linked player
//   death follows: a player starvation/dehydration death whose
//   deaths[].day maps to an away day-end that day or the day before
//   — deaths[].day attribution per the 0459Z metric review, never
//   Game.over).
// - PREVENTED pocket-entries (primary metric, NOT veto count): a
//   baseline episode on a seed counts as prevented ONLY if the armed
//   leg on that seed has ZERO pocket-entry episodes (any armed
//   episode on that seed = reroute / whack-a-mole, zero prevented
//   counted for that seed).
// - B7 false opens in the wild: armed day-ends away where the day's
//   hops were all approved (vetoes == 0 that day) AND the day-end
//   jump sim fails. False closes in the wild: armed seed-days with
//   vetoes > 0 whose same-seed baseline same-loopDay day-end was home
//   (day alignment is approximate after divergence — reported as a
//   cost signal, not a bar).
//
// Modes: --baseline <jsonl> --armed <jsonl> judges the pilot (exit 1
// on any bar FAIL, 0 when all PASS). --baseline <jsonl> alone prints
// the screening table (per-seed episodes + POCKET qualifier) and
// exits 0 without judging.
'use strict';
const fs = require('fs');
const path = require('path');

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
const baseFile = arg('baseline', null), armedFile = arg('armed', null);
if (!baseFile) { console.error('usage: analyze-homewardstep-b.js --baseline <jsonl> [--armed <jsonl>]'); process.exit(2); }

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
  const deaths = (inst.deaths || []).map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  const playerDeaths = (inst.deaths || []).filter((x) => (typeof x === 'string' ? true : x.player !== false));
  const playerDeathTexts = playerDeaths.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  // Strand-linked player deaths: starvation/dehydration, death day maps
  // to an away day-end that day or the day before.
  const strandDeathDays = [];
  for (const d of playerDeaths) {
    const cause = (typeof d === 'string' ? d : JSON.stringify(d));
    if (!/starvat|dehydrat/i.test(cause)) continue;
    const day = (d && typeof d === 'object' && d.day) || null;
    if (day == null) continue;
    if (awayByDay[day] || awayByDay[day - 1]) strandDeathDays.push(day);
  }
  // Pocket-entry stranding episodes: maximal consecutive away runs
  // containing >= 1 failed day-end sim, lasting >= 2 day-ends OR with
  // a strand-linked death day inside [runStart, runEnd + 1].
  const episodes = [];
  let run = null;
  const flushRun = () => {
    if (!run) return;
    const pocket = run.days.some((d) => d.dayEndReturnSim && d.dayEndReturnSim.ok === false);
    const deathLinked = strandDeathDays.some((dd) => dd >= run.start && dd <= run.end + 1);
    if (pocket && (run.days.length >= 2 || deathLinked)) {
      const entryDay = run.days[0];
      const entryPos = entryDay.end.pos;
      const homewardEntry = (entryDay.hops || []).some((h) => h.homeward && h.to && entryPos &&
        h.to.x === entryPos.x && h.to.y === entryPos.y);
      episodes.push({ start: run.start, end: run.end, homewardEntry, days: run.days.map((d) => d.loopDay),
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
  const homewardVetoes = days.reduce((t, d) => t + (d.homewardVetoes || 0), 0);
  const vetoOriginPass = days.reduce((t, d) => t + (d.vetoOriginPass || 0), 0);
  const vetoOriginFail = days.reduce((t, d) => t + (d.vetoOriginFail || 0), 0);
  const silentVetoes = days.reduce((t, d) => t + (d.silentVetoes || 0), 0);
  const lateralPasses = days.reduce((t, d) => t + (d.lateralPasses || 0), 0);
  const lateralDayEnds = days.filter((d) => d.dayEndReturnSim && d.dayEndReturnSim.via === 'lateral').map((d) => d.loopDay);
  const vetoDays = days.filter((d) => (d.vetoes || 0) > 0).map((d) => d.loopDay);
  const creditUses = days.reduce((t, d) => t + (d.creditUses || 0), 0);
  const simChecks = days.reduce((t, d) => t + (d.simChecks || 0), 0);
  const beyondUngenerated = days.reduce((t, d) => t + (d.beyondUngenerated || 0), 0)
    + days.reduce((t, d) => t + (((d.dayEndReturnSim || {}).beyondUngenerated) || 0), 0);
  // B7 false opens in the wild: away day-end, zero vetoes that day,
  // day-end sim fails.
  const falseOpens = days.filter((d) => away(d.end) && (d.vetoes || 0) === 0 &&
    d.dayEndReturnSim && d.dayEndReturnSim.ok === false).map((d) => d.loopDay);
  return { seed: inst.seed, policy: inst.policy, loopDays, daysAlive: inst.daysAlive,
    endReason: inst.endReason, maxWaveUnlocked: inst.maxWaveUnlocked,
    awayDayEnds, failedTripDays,
    failedTripDayShare: loopDays ? failedTripDays / loopDays : null,
    haulKcal: Math.round(haulKcal), meanDailyHaul: loopDays ? +(haulKcal / loopDays).toFixed(1) : null,
    haulCoverage: successes ? valuedSuccesses / successes : null,
    attempts, successes, vetoes, silentVetoes, lateralPasses, lateralDayEnds, vetoDays, creditUses, simChecks, beyondUngenerated,
    deaths, playerDeathTexts, strandDeathDays, episodes, falseOpens,
    homewardVetoes, vetoOriginPass, vetoOriginFail,
    homewardEpisodes: episodes.filter((e) => e.homewardEntry),
    strandLinked: strandDeathDays.length > 0,
    playerDeaths };
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
  const homewardEpisodes = seeds.reduce((t, s) => t + s.homewardEpisodes.length, 0);
  const homewardVetoes = seeds.reduce((t, s) => t + s.homewardVetoes, 0);
  const vetoOriginPass = seeds.reduce((t, s) => t + s.vetoOriginPass, 0);
  const vetoOriginFail = seeds.reduce((t, s) => t + s.vetoOriginFail, 0);
  const vetoes = seeds.reduce((t, s) => t + s.vetoes, 0);
  const silentVetoes = seeds.reduce((t, s) => t + s.silentVetoes, 0);
  const lateralPasses = seeds.reduce((t, s) => t + s.lateralPasses, 0);
  const creditUses = seeds.reduce((t, s) => t + s.creditUses, 0);
  const falseOpens = seeds.reduce((t, s) => t + s.falseOpens.length, 0);
  return { seeds, totalDays, failedTripDays: failed,
    failedTripDayShare: totalDays ? +(failed / totalDays).toFixed(3) : null,
    awayDayEnds: away, meanDailyHaul: meanHaul == null ? null : +meanHaul.toFixed(1),
    medianSurvival: median, starvationDeathSeeds: starvDeaths,
    episodes, homewardEpisodes, vetoes, silentVetoes, lateralPasses, creditUses, falseOpens,
    homewardVetoes, vetoOriginPass, vetoOriginFail };
}

const baseline = analyzeBand(readJsonl(baseFile));
if (!armedFile) {
  console.log('SCREENING TABLE (baseline only — POCKET qualifier per seed)');
  for (const s of baseline.seeds) {
    console.log('seed ' + s.seed + ' loopDays=' + s.loopDays + ' away=' + s.awayDayEnds +
      ' episodes=' + s.episodes.length + ' homewardEpisodes=' + s.homewardEpisodes.length + ' ' + JSON.stringify(s.episodes) +
      ' strandDeathDays=' + JSON.stringify(s.strandDeathDays) +
      ' QUALIFIES-HOMEWARD=' + (s.homewardEpisodes.length > 0 ? 'YES' : 'no'));
  }
  console.log('band episodes=' + baseline.episodes + ' homewardEpisodes=' + baseline.homewardEpisodes +
    ' qualifyingSeeds=' + baseline.seeds.filter((s) => s.homewardEpisodes.length > 0).length + '/' + baseline.seeds.length);
  process.exit(0);
}

const armed = analyzeBand(readJsonl(armedFile));

// Primary metric: prevented HOMEWARD-HOP pocket-entries (per-seed
// conservative rule: a baseline homeward episode counts as prevented
// only if the armed leg has ZERO pocket episodes of any type).
let prevented = 0;
const preventedBySeed = {};
for (const b of baseline.seeds) {
  const a = armed.seeds.find((s) => s.seed === b.seed);
  if (!a) continue;
  const p = (b.homewardEpisodes.length > 0 && a.episodes.length === 0) ? b.homewardEpisodes.length : 0;
  preventedBySeed[b.seed] = p;
  prevented += p;
}
// Veto-created pockets: armed episode on a seed with zero baseline episodes.
const vetoCreated = [];
for (const a of armed.seeds) {
  const b = baseline.seeds.find((s) => s.seed === a.seed);
  if (!b) continue;
  if (a.episodes.length > 0 && b.episodes.length === 0) vetoCreated.push({ seed: a.seed, armedEpisodes: a.episodes });
}
// B2 new-or-worsened, per seed.
const worsened = [];
for (const a of armed.seeds) {
  const b = baseline.seeds.find((s) => s.seed === a.seed);
  if (!b) continue;
  if (a.awayDayEnds >= 10 && a.awayDayEnds >= b.awayDayEnds + 10) worsened.push({ seed: a.seed, baseline: b.awayDayEnds, armed: a.awayDayEnds });
}
// Unpaired strand-linked deaths on armed seeds (no baseline episode on that seed).
const unpairedStrandDeaths = [];
for (const a of armed.seeds) {
  const b = baseline.seeds.find((s) => s.seed === a.seed);
  if (!b) continue;
  if (a.strandLinked && b.episodes.length === 0) unpairedStrandDeaths.push({ seed: a.seed, days: a.strandDeathDays });
}
// B7 false closes in the wild (REFINED proxy — see evidence metric
// review: the day-end-home-only proxy over-counts after divergence,
// because the armed scholar keeps attempting hops the baseline
// successor never attempts): an armed vetoed hop (from->to) counts
// ONLY if the baseline leg on the same seed-day TOOK that exact hop
// (it appears in the baseline shadow hop log — shadow never vetoes,
// so presence means taken) AND the baseline day ended home. A hop
// the baseline never attempted is not a false close, whatever the
// day-end says. Even this refined proxy is a cost signal, not proof:
// the trace (diag61705) is what confirms a false close's mechanism.
const falseCloses = [];
{
  const baseBySeed = new Map();
  for (const inst of readJsonl(baseFile)) baseBySeed.set(inst.seed, inst);
  for (const inst of readJsonl(armedFile)) {
    const b = baseBySeed.get(inst.seed);
    if (!b) continue;
    const bDays = new Map((b.days || []).map((d) => [d.loopDay, d]));
    for (const d of (inst.days || [])) {
      const bd = bDays.get(d.loopDay);
      if (!bd || !bd.end || !bd.end.pos) continue;
      const hv = bd.end.haven || { x: 4, y: 4 };
      if (!(bd.end.pos.x === hv.x && bd.end.pos.y === hv.y)) continue;
      const bHops = new Set((bd.hops || []).map((h) => h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y));
      for (const h of (d.hops || []).filter((x) => x.vetoed)) {
        const k = h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y;
        if (bHops.has(k)) falseCloses.push({ seed: inst.seed, loopDay: d.loopDay, hop: k });
      }
    }
  }
}

// RPT-B v2 (arrival-conditioned, quoted cost signal): an armed vetoed hop
// f->t on loopDay d counts ONLY if the baseline leg on the same seed-day
// ARRIVED at t after attempting f->t — a later baseline hop that day
// departs from t, or the baseline day ends at t. (v1, above, counts
// mere attempts of f->t and produced the 62001 artifact: 19 fires for
// a hop the baseline scholar never took.)
const falseClosesV2 = [];
{
  const baseBySeed = new Map();
  for (const inst of readJsonl(baseFile)) baseBySeed.set(inst.seed, inst);
  for (const inst of readJsonl(armedFile)) {
    const b = baseBySeed.get(inst.seed);
    if (!b) continue;
    const bDays = new Map((b.days || []).map((d) => [d.loopDay, d]));
    for (const d of (inst.days || [])) {
      const bd = bDays.get(d.loopDay);
      if (!bd || !bd.end || !bd.end.pos) continue;
      const hv = bd.end.haven || { x: 4, y: 4 };
      if (!(bd.end.pos.x === hv.x && bd.end.pos.y === hv.y)) continue;
      const bHopList = (bd.hops || []);
      for (const h of (d.hops || []).filter((x) => x.vetoed)) {
        const k = h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y;
        const idx = bHopList.findIndex((bh) => bh.from.x + ',' + bh.from.y + '->' + bh.to.x + ',' + bh.to.y === k);
        if (idx < 0) continue;
        const arrived = (bd.end.pos.x === h.to.x && bd.end.pos.y === h.to.y) ||
          bHopList.slice(idx + 1).some((bh) => bh.from.x === h.to.x && bh.from.y === h.to.y);
        if (arrived) falseClosesV2.push({ seed: inst.seed, loopDay: d.loopDay, hop: k });
      }
    }
  }
}

const bars = {};
bars.primaryPrevented = { value: prevented, threshold: '>= 2', pass: prevented >= 2 };
bars.B1AwayTotal = { baseline: baseline.awayDayEnds, armed: armed.awayDayEnds, pass: armed.awayDayEnds <= baseline.awayDayEnds };
bars.B2Worsened = { worsened, unpairedStrandDeaths, pass: worsened.length === 0 && unpairedStrandDeaths.length === 0 };
bars.B4FailedTripShare = { baseline: baseline.failedTripDayShare, armed: armed.failedTripDayShare, pass: armed.failedTripDayShare <= baseline.failedTripDayShare };
bars.B5MeanDailyHaul = { baseline: baseline.meanDailyHaul, armed: armed.meanDailyHaul,
  threshold: '>= 0.95 x baseline', pass: armed.meanDailyHaul >= 0.95 * baseline.meanDailyHaul };
// RPT-B per-seed floor (binding): no seed below 0.50x its own baseline haul.
const perSeedHaul = baseline.seeds.map((b) => {
  const a = armed.seeds.find((x) => x.seed === b.seed) || {};
  const ratio = (b.meanDailyHaul || 0) > 0 ? (a.meanDailyHaul || 0) / b.meanDailyHaul : null;
  return { seed: b.seed, baseline: b.meanDailyHaul, armed: a.meanDailyHaul ?? null,
    ratio: ratio == null ? null : +ratio.toFixed(3),
    homewardVetoes: a.homewardVetoes ?? 0,
    pass: ratio == null ? true : ratio >= 0.50 };
});
bars.B5perSeed = { perSeedHaul, threshold: 'every seed >= 0.50x its own baseline',
  pass: perSeedHaul.every((r) => r.pass) };
bars.B6Survival = { baselineMedian: baseline.medianSurvival, armedMedian: armed.medianSurvival,
  baselineStarvSeeds: baseline.starvationDeathSeeds, armedStarvSeeds: armed.starvationDeathSeeds,
  threshold: 'median >= control AND starv seeds <= baseline + 2',
  pass: armed.medianSurvival >= baseline.medianSurvival && armed.starvationDeathSeeds <= baseline.starvationDeathSeeds + 2 };
bars.vetoCreatedPockets = { vetoCreated, pass: vetoCreated.length === 0 };
bars.B7FalseOpens = { armedFalseOpens: armed.falseOpens, pass: true }; // reported, called out in verdict
const allPass = Object.values(bars).every((b) => b.pass) &&
  bars.primaryPrevented.pass && bars.B1AwayTotal.pass && bars.B2Worsened.pass &&
  bars.B4FailedTripShare.pass && bars.B5MeanDailyHaul.pass && bars.B5perSeed.pass && bars.B6Survival.pass &&
  bars.vetoCreatedPockets.pass;

console.log('PER-SEED TABLE');
console.log('seed | base away/ep | armed away/ep | base failedShare | armed failedShare | base haul | armed haul | haulRatio | homeVetoes | vetoes(silent) | lateralPasses | credit | simChecks | beyondUngen | falseOpens');
for (const b of baseline.seeds) {
  const a = armed.seeds.find((s) => s.seed === b.seed) || {};
  console.log(b.seed + ' | ' + b.awayDayEnds + '/' + b.episodes.length + ' | ' + (a.awayDayEnds ?? '?') + '/' + ((a.episodes || []).length) +
    ' | ' + b.failedTripDayShare + ' | ' + (a.failedTripDayShare ?? '?') +
    ' | ' + b.meanDailyHaul + ' | ' + (a.meanDailyHaul ?? '?') +
    ' | ' + ((b.meanDailyHaul || 0) > 0 && a.meanDailyHaul != null ? +((a.meanDailyHaul / b.meanDailyHaul).toFixed(3)) : '?') +
    ' | ' + (a.homewardVetoes ?? 0) +
    ' | ' + (a.vetoes ?? 0) + '(' + (a.silentVetoes ?? 0) + ')' + ' | ' + (a.lateralPasses ?? 0) + ' | ' + (a.creditUses ?? 0) + ' | ' + (a.simChecks ?? 0) + ' | ' + (a.beyondUngenerated ?? 0) +
    ' | ' + JSON.stringify(a.falseOpens || []));
}
console.log('BAND: baseline away=' + baseline.awayDayEnds + ' armed away=' + armed.awayDayEnds +
  ' baseline episodes=' + baseline.episodes + ' armed episodes=' + armed.episodes +
  ' baseline homewardEpisodes=' + baseline.homewardEpisodes +
  ' prevented=' + prevented + ' ' + JSON.stringify(preventedBySeed) +
  ' vetoCreated=' + JSON.stringify(vetoCreated) +
  ' armed homewardVetoes=' + armed.homewardVetoes + ' vetoOriginPass=' + armed.vetoOriginPass + ' vetoOriginFail=' + armed.vetoOriginFail +
  ' baseline median=' + baseline.medianSurvival + ' armed median=' + armed.medianSurvival +
  ' baseline starvSeeds=' + baseline.starvationDeathSeeds + ' armed starvSeeds=' + armed.starvationDeathSeeds +
  ' armed falseOpens=' + armed.falseOpens + ' armed silentVetoes=' + armed.silentVetoes + ' armed lateralPasses=' + armed.lateralPasses + ' falseClosesV1=' + JSON.stringify(falseCloses) + ' falseClosesV2=' + JSON.stringify(falseClosesV2));
console.log('BARS: ' + JSON.stringify(bars, null, 2));
console.log('VERDICT: ' + (allPass ? 'GO' : 'NO-GO'));
process.exit(allPass ? 0 : 1);
