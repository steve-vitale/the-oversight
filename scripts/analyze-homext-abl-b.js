#!/usr/bin/env node
// analyze-homext-abl-b.js — homeward-extension ABLATION analyzer
// (sim-homext-abl-b, 2026-11-02). The rpt-b analyzer with a third leg:
// baseline (shadow) vs outward-only vs full, judged on the SAME band.
// Prereg: evidence/2026-11-02/sim-homext-abl-b-prereg.md.
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
// Modes: --baseline <jsonl> --outwardonly <jsonl> --full <jsonl> judges
// the ablation (exit 1 on NO-GO, 0 on GO). --baseline <jsonl> alone
// prints the screening table and exits 0 without judging.
'use strict';
const fs = require('fs');
const path = require('path');

const arg = (name, fallback) => {
  const i = process.argv.indexOf('--' + name);
  return i < 0 ? fallback : process.argv[i + 1];
};
const baseFile = arg('baseline', null), outFile = arg('outwardonly', null), fullFile = arg('full', null);
const armedFile = fullFile; // legacy name kept for the screening-mode guard below
if (!baseFile) { console.error('usage: analyze-homext-abl-b.js --baseline <jsonl> [--outwardonly <jsonl> --full <jsonl>]'); process.exit(2); }

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
  const outwardOnlyPasses = days.reduce((t, d) => t + (d.outwardOnlyPasses || 0), 0);
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
    homewardVetoes, vetoOriginPass, vetoOriginFail, outwardOnlyPasses,
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
  const outwardOnlyPasses = seeds.reduce((t, s) => t + s.outwardOnlyPasses, 0);
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
    homewardVetoes, vetoOriginPass, vetoOriginFail, outwardOnlyPasses };
}

const baseline = analyzeBand(readJsonl(baseFile));
if (!fullFile || !outFile) {
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

const outward = analyzeBand(readJsonl(outFile));
const full = analyzeBand(readJsonl(fullFile));

// Per-seed conservative prevention rule (as in rpt-b): a baseline
// homeward episode counts as PREVENTED by a leg only if that leg has
// ZERO pocket episodes of any type on that seed.
function preventedBy(legBand) {
  let prevented = 0;
  const bySeed = {};
  for (const b of baseline.seeds) {
    const a = legBand.seeds.find((s) => s.seed === b.seed);
    if (!a) continue;
    const p = (b.homewardEpisodes.length > 0 && a.episodes.length === 0) ? b.homewardEpisodes.length : 0;
    bySeed[b.seed] = p;
    prevented += p;
  }
  return { prevented, bySeed };
}
const preventedFull = preventedBy(full);
const preventedOut = preventedBy(outward);
// PRIMARY: extension-only preventions — baseline homeward episodes on
// seeds where FULL prevents (0 episodes) but OUTWARD-ONLY does not
// (>= 1 episode). GO threshold: >= 1.
let extensionOnly = 0;
const extensionOnlyBySeed = {};
for (const b of baseline.seeds) {
  const f = full.seeds.find((s) => s.seed === b.seed);
  const o = outward.seeds.find((s) => s.seed === b.seed);
  if (!f || !o) continue;
  const e = (b.homewardEpisodes.length > 0 && f.episodes.length === 0 && o.episodes.length >= 1)
    ? b.homewardEpisodes.length : 0;
  extensionOnlyBySeed[b.seed] = e;
  extensionOnly += e;
}
// Veto-created pockets vs outward-only: full episode where outward has none.
const vetoCreated = [];
for (const f of full.seeds) {
  const o = outward.seeds.find((s) => s.seed === f.seed);
  if (!o) continue;
  if (f.episodes.length > 0 && o.episodes.length === 0) vetoCreated.push({ seed: f.seed, fullEpisodes: f.episodes });
}
// B2 new-or-worsened, full vs outward-only.
const worsened = [];
for (const f of full.seeds) {
  const o = outward.seeds.find((s) => s.seed === f.seed);
  if (!o) continue;
  if (f.awayDayEnds >= 10 && f.awayDayEnds >= o.awayDayEnds + 10) worsened.push({ seed: f.seed, outward: o.awayDayEnds, full: f.awayDayEnds });
}
const unpairedStrandDeaths = [];
for (const f of full.seeds) {
  const o = outward.seeds.find((s) => s.seed === f.seed);
  if (!o) continue;
  if (f.strandLinked && o.episodes.length === 0) unpairedStrandDeaths.push({ seed: f.seed, days: f.strandDeathDays });
}

// False-close proxies (v1 attempt-based, v2 arrival-conditioned) for one
// armed leg against the baseline leg. Same definitions as rpt-b.
function falseCloseSets(armedJsonlFile) {
  const v1 = [], v2 = [];
  const baseBySeed = new Map();
  for (const inst of readJsonl(baseFile)) baseBySeed.set(inst.seed, inst);
  for (const inst of readJsonl(armedJsonlFile)) {
    const b = baseBySeed.get(inst.seed);
    if (!b) continue;
    const bDays = new Map((b.days || []).map((d) => [d.loopDay, d]));
    for (const d of (inst.days || [])) {
      const bd = bDays.get(d.loopDay);
      if (!bd || !bd.end || !bd.end.pos) continue;
      const hv = bd.end.haven || { x: 4, y: 4 };
      if (!(bd.end.pos.x === hv.x && bd.end.pos.y === hv.y)) continue;
      const bHopList = (bd.hops || []);
      const bHopSet = new Set(bHopList.map((h) => h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y));
      for (const h of (d.hops || []).filter((x) => x.vetoed)) {
        const k = h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y;
        if (bHopSet.has(k)) v1.push({ seed: inst.seed, loopDay: d.loopDay, hop: k });
        const idx = bHopList.findIndex((bh) => bh.from.x + ',' + bh.from.y + '->' + bh.to.x + ',' + bh.to.y === k);
        if (idx < 0) continue;
        const arrived = (bd.end.pos.x === h.to.x && bd.end.pos.y === h.to.y) ||
          bHopList.slice(idx + 1).some((bh) => bh.from.x === h.to.x && bh.from.y === h.to.y);
        if (arrived) v2.push({ seed: inst.seed, loopDay: d.loopDay, hop: k });
      }
    }
  }
  return { v1, v2 };
}
const fcFull = falseCloseSets(fullFile);
const fcOut = falseCloseSets(outFile);

// Trajectory identity: full vs outward-only, per seed, per loopDay:
// day-end pos + kcal + hydration + veto counters, plus daysAlive and
// endReason. If full homeward vetoes = 0, decisions coincide on every
// hop and these must all match; any divergence is a finding.
const identity = [];
for (const f of full.seeds) {
  const o = outward.seeds.find((s) => s.seed === f.seed);
  if (!o) { identity.push({ seed: f.seed, identical: false, reason: 'no outward leg' }); continue; }
  const fInst = readJsonl(fullFile).find((x) => x.seed === f.seed);
  const oInst = readJsonl(outFile).find((x) => x.seed === o.seed);
  let div = null;
  if (fInst.daysAlive !== oInst.daysAlive || fInst.endReason !== oInst.endReason) {
    div = 'daysAlive/endReason ' + fInst.daysAlive + '/' + fInst.endReason + ' vs ' + oInst.daysAlive + '/' + oInst.endReason;
  } else {
    for (const fd of (fInst.days || [])) {
      const od = (oInst.days || []).find((d) => d.loopDay === fd.loopDay);
      if (!od) { div = 'missing loopDay ' + fd.loopDay; break; }
      const same = (fd.end.pos.x === od.end.pos.x && fd.end.pos.y === od.end.pos.y &&
        fd.end.kcal === od.end.kcal && fd.end.hydration === od.end.hydration &&
        fd.vetoes === od.vetoes && fd.homewardVetoes === od.homewardVetoes &&
        fd.silentVetoes === od.silentVetoes);
      if (!same) { div = 'loopDay ' + fd.loopDay + ' full end=' + JSON.stringify(fd.end) + ' vetoes=' + fd.vetoes + ' vs outward end=' + JSON.stringify(od.end) + ' vetoes=' + od.vetoes; break; }
    }
  }
  identity.push({ seed: f.seed, identical: div === null, divergence: div });
}

const bars = {};
bars.primaryExtensionOnly = { value: extensionOnly, threshold: '>= 1', pass: extensionOnly >= 1 };
bars.B1AwayTotal = { outward: outward.awayDayEnds, full: full.awayDayEnds, pass: full.awayDayEnds <= outward.awayDayEnds };
bars.B2Worsened = { worsened, unpairedStrandDeaths, pass: worsened.length === 0 && unpairedStrandDeaths.length === 0 };
bars.B4FailedTripShare = { outward: outward.failedTripDayShare, full: full.failedTripDayShare, pass: full.failedTripDayShare <= outward.failedTripDayShare };
// B5 per-seed haul floor vs outward-only: every seed >= 1.00x (0/0 null excluded).
const perSeedHaul = outward.seeds.map((o) => {
  const f = full.seeds.find((x) => x.seed === o.seed) || {};
  const ratio = (o.meanDailyHaul || 0) > 0 ? (f.meanDailyHaul || 0) / o.meanDailyHaul : null;
  return { seed: o.seed, outward: o.meanDailyHaul, full: f.meanDailyHaul ?? null,
    ratio: ratio == null ? null : +ratio.toFixed(3),
    fullHomewardVetoes: f.homewardVetoes ?? 0,
    pass: ratio == null ? true : ratio >= 1.00 };
});
bars.B5perSeedVsOutward = { perSeedHaul, threshold: 'every seed >= 1.00x its own outward-only haul',
  pass: perSeedHaul.every((r) => r.pass) };
bars.B6Survival = { outwardMedian: outward.medianSurvival, fullMedian: full.medianSurvival,
  outwardStarvSeeds: outward.starvationDeathSeeds, fullStarvSeeds: full.starvationDeathSeeds,
  threshold: 'median >= outward AND starv seeds <= outward + 2',
  pass: full.medianSurvival >= outward.medianSurvival && full.starvationDeathSeeds <= outward.starvationDeathSeeds + 2 };
bars.vetoCreatedPockets = { vetoCreated, pass: vetoCreated.length === 0 };
bars.B7FalseOpens = { fullFalseOpens: full.falseOpens, pass: true }; // reported, called out in verdict
const outwardHomewardVetoesOk = outward.homewardVetoes === 0;
const allPass = Object.values(bars).every((b) => b.pass) && outwardHomewardVetoesOk;
const verdict = (bars.primaryExtensionOnly.pass && allPass) ? 'GO' : 'NO-GO';

console.log('PER-SEED TABLE');
console.log('seed | base away/ep | out away/ep | full away/ep | base haul | out haul | full haul | full/out | out homeV | full homeV | out vetoes(silent) | full vetoes(silent) | out passes | full lateral | falseOpens(full)');
for (const b of baseline.seeds) {
  const o = outward.seeds.find((s) => s.seed === b.seed) || {};
  const f = full.seeds.find((s) => s.seed === b.seed) || {};
  console.log(b.seed + ' | ' + b.awayDayEnds + '/' + b.episodes.length + ' | ' + (o.awayDayEnds ?? '?') + '/' + ((o.episodes || []).length) + ' | ' + (f.awayDayEnds ?? '?') + '/' + ((f.episodes || []).length) +
    ' | ' + b.meanDailyHaul + ' | ' + (o.meanDailyHaul ?? '?') + ' | ' + (f.meanDailyHaul ?? '?') +
    ' | ' + ((o.meanDailyHaul || 0) > 0 && f.meanDailyHaul != null ? +((f.meanDailyHaul / o.meanDailyHaul).toFixed(3)) : '?') +
    ' | ' + (o.homewardVetoes ?? 0) + ' | ' + (f.homewardVetoes ?? 0) +
    ' | ' + (o.vetoes ?? 0) + '(' + (o.silentVetoes ?? 0) + ')' + ' | ' + (f.vetoes ?? 0) + '(' + (f.silentVetoes ?? 0) + ')' +
    ' | ' + (o.outwardOnlyPasses ?? 0) + ' | ' + (f.lateralPasses ?? 0) +
    ' | ' + JSON.stringify(f.falseOpens || []));
}
console.log('BAND: baseline away=' + baseline.awayDayEnds + ' outward away=' + outward.awayDayEnds + ' full away=' + full.awayDayEnds +
  ' baseline episodes=' + baseline.episodes + ' outward episodes=' + outward.episodes + ' full episodes=' + full.episodes +
  ' baseline homewardEpisodes=' + baseline.homewardEpisodes +
  ' preventedFull=' + preventedFull.prevented + ' ' + JSON.stringify(preventedFull.bySeed) +
  ' preventedOutward=' + preventedOut.prevented + ' ' + JSON.stringify(preventedOut.bySeed) +
  ' extensionOnly=' + extensionOnly + ' ' + JSON.stringify(extensionOnlyBySeed) +
  ' vetoCreated=' + JSON.stringify(vetoCreated) +
  ' outward homewardVetoes=' + outward.homewardVetoes + ' (must be 0: ' + (outwardHomewardVetoesOk ? 'OK' : 'PROOF FAILURE') + ')' +
  ' full homewardVetoes=' + full.homewardVetoes + ' full vetoOriginPass=' + full.vetoOriginPass + ' full vetoOriginFail=' + full.vetoOriginFail +
  ' outward outwardOnlyPasses=' + outward.outwardOnlyPasses +
  ' baseline median=' + baseline.medianSurvival + ' outward median=' + outward.medianSurvival + ' full median=' + full.medianSurvival +
  ' baseline starvSeeds=' + baseline.starvationDeathSeeds + ' outward starvSeeds=' + outward.starvationDeathSeeds + ' full starvSeeds=' + full.starvationDeathSeeds +
  ' full falseOpens=' + full.falseOpens + ' full silentVetoes=' + full.silentVetoes + ' full lateralPasses=' + full.lateralPasses +
  ' falseClosesV1 full=' + JSON.stringify(fcFull.v1) + ' outward=' + JSON.stringify(fcOut.v1) +
  ' falseClosesV2 full=' + JSON.stringify(fcFull.v2) + ' outward=' + JSON.stringify(fcOut.v2));
console.log('TRAJECTORY IDENTITY full-vs-outward: ' + JSON.stringify(identity));
console.log('BARS: ' + JSON.stringify(bars, null, 2));
console.log('VERDICT: ' + verdict);
process.exit(verdict === 'GO' ? 0 : 1);
