#!/usr/bin/env node
// scripts/test-w5chain-diag.js — analyzer for sim-w5chain-a.
// Reads evidence/2026-10-25/perseed-sim-w5chain-a/summary.json rows
// (written by scripts/test-w5chain-diag-sweep.js --summary) and cuts
// the wave-5 eligibility chain PER SEED CLASS: national-reached
// (row.nationalEver) x wave-4-reached (harness waveReach >= 4).
//
// RECONSTRUCTION (same formula as test-w5births-diag.js, pure reads
// only — the corpus holds no gated-function calls): t4=100, t5=200,
// plentyCapT5=100 (standingCfg). holds: cap (raw>=200 && capped<200
// && peak<5 -> 199); defer4 (raw>=100 && !rd4.ready && peak<4 -> 99);
// defer5 (capped>=200 && !rd5.ready && peak<5 -> 199); gated =
// min(raw, holds...); floor = peak>=5 ? 200 : peak>=4 ? 100 : 0;
// effective = max(gated, floor). Peak is the OBSERVED
// state._standingPeakWave at that daily point. Proxy unlocked: w3
// rung (day>=25 && pts2>=4) + effective>=100 -> 4; + effective>=200 +
// faced4>0 -> 5; w3 rung alone -> 3.
//
// DEFINITIONS (pre-registered, fixed before sweeping):
// - Distinct-day counting: a calendar day counts once even when the
//   daily hook fires twice on it (the corpus shows duplicate day-2
//   points on some seeds).
// - sample(t): the last daily point with day <= t (or the first
//   point if none); end sample = the last daily point. For a seed
//   ending before t, sample(t) IS the end point and is flagged
//   endSubstituted=true.
// - rd5 bars met (standingCfg readyDemand[5]): armored >= 4,
//   armed >= 6, tricks >= 3, veterans >= 2. allFour = rd5.ready on
//   the point AND short[] empty (any ready-with-short point is
//   printed as an INCONSISTENCY and fails the gate).
// - Binding leg per seed: fewest distinct days met over the full
//   trace (ties listed in full). Binding leg per class: binds the
//   most seeds in the class (ties listed in full).
// - Chain stages, in order: capped>=200 ever? rd5.ready ever?
//   faced4 ever? proxy 5 ever? First stage never reached = the
//   seed's binding stage.
// - Gate-trace complete for a seed: days array non-empty, every
//   point errs == 0, all three recorder diag errs == 0, samples for
//   30/60/120/180 present (end-substituted where the seed ended
//   first) plus the end sample. DIAG-GO bar: >=95% of seeds
//   complete (7/8 = 87.5% fails, so in practice 8/8).
// - Births-side: wave-5 births from the spawnsrc census (spawns
//   with wave 5, by source tag); spawnWaveTarget calls at pool top 5
//   and returning target 5 from the w5births aggregates + targets
//   list. Wave-4 births likewise, for the SPAWN4-style window check.
//
// Usage: node scripts/test-w5chain-diag.js [--dir <perseed-dir>]
// Writes <dir>/analysis.json and prints the class tables.
// Exit 1 if any seed's trace is incomplete, any required field is
// null, any ready-with-short inconsistency appears, or any seed's
// harness wave-4 verdict disagrees with its proxyMax (printed as
// RECONCILIATION and failed, never silently resolved).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const T4 = 100, T5 = 200, CAP = 100;
const DEM5 = { armored: 4, armed: 6, tricks: 3, veterans: 2 };
const LEGS = ['armored', 'armed', 'tricks', 'veterans'];

function gatedOf(p) {
  const peak = (p.peak | 0) || 0;
  const raw = p.raw, capped = (p.capped === null || p.capped === undefined) ? raw : p.capped;
  const bounds = [];
  if (raw >= T5 && capped < T5 && peak < 5) bounds.push({ bound: T5 - 1, kind: 'cap' });
  if (raw >= T4 && p.rd4 && !p.rd4.ready && peak < 4) bounds.push({ bound: T4 - 1, kind: 'defer4' });
  if (capped >= T5 && p.rd5 && !p.rd5.ready && peak < 5) bounds.push({ bound: T5 - 1, kind: 'defer5' });
  let gated = raw;
  for (const h of bounds) if (h.bound < gated) gated = h.bound;
  const floor = peak >= 5 ? T5 : peak >= 4 ? T4 : 0;
  return { gated: Math.max(gated, floor), holds: bounds.map(h => h.kind), floor, peak };
}
function proxyOf(p, g) {
  const w3 = p.day >= 25 && (p.pts2 || 0) >= 4;
  if (!w3) return 3;
  if (g >= T5 && (p.faced4 || 0) > 0) return 5;
  if (g >= T4) return 4;
  return 3;
}
function sampleAt(traj, t) {
  // traj: points in order. Returns {point, endSubstituted}.
  let pick = null;
  for (const p of traj) { if (p.day <= t) pick = p; else break; }
  if (!pick) pick = traj[0];
  const endSubstituted = traj.length && pick === traj[traj.length - 1] && traj[traj.length - 1].day < t;
  return { point: pick, endSubstituted: !!endSubstituted };
}
function fmtPoint(p) {
  if (!p) return '—';
  const g = gatedOf(p);
  const rd5 = p.rd5 || {};
  return `d${p.day} raw=${p.raw} capped=${p.capped} gated=${g.gated} holds=[${g.holds.join(',') || 'none'}] peak=${g.peak} proxy=${proxyOf(p, g.gated)} rd5=${rd5.armored}/${DEM5.armored},${rd5.armed}/${DEM5.armed},${rd5.tricks}/${DEM5.tricks},${rd5.veterans}/${DEM5.veterans} ready=${!!rd5.ready} faced4=${p.faced4}`;
}

function analyzeRow(r) {
  const wd = r.w5births || {};
  const rawDays = wd.days || [];
  const traj = [];
  const inconsistencies = [];
  let pointErrs = 0;
  for (const p of rawDays) {
    if ((p.errs | 0) > 0) pointErrs++;
    if (p.raw === null || p.raw === undefined) continue;
    const g = gatedOf(p);
    const pr = proxyOf(p, g.gated);
    if (p.rd5 && p.rd5.ready && (p.rd5.short || []).length) inconsistencies.push(`d${p.day} ready-with-short ${JSON.stringify(p.rd5.short)}`);
    traj.push({ day: p.day, raw: p.raw, war: p.war, diplomacy: p.diplomacy, plenty: p.plenty, capped: p.capped, gated: g.gated, holds: g.holds, peak: g.peak, proxy: pr, rd4: p.rd4, rd5: p.rd5, faced4: p.faced4, faced5: p.faced5, kills4: p.kills4, kills5: p.kills5, pts2: p.pts2, pts3: p.pts3, pts4: p.pts4 });
  }
  // Distinct-day aggregates.
  const byDay = new Map();
  for (const p of traj) if (!byDay.has(p.day)) byDay.set(p.day, p);
  // NOTE: for leg-met counting, a day counts as met if ANY point that
  // day meets the leg (the hook can fire twice; the last point is
  // the end-of-day state, but met-once is the generous, stated rule
  // for "ever held" questions; the end-of-day point is used for
  // samples and maxima).
  const metDays = { armored: new Set(), armed: new Set(), tricks: new Set(), veterans: new Set() };
  const vet1Days = new Set(); let vetMax = 0;
  const allFourDays = new Set(), allFourCappedDays = new Set(), fullEligDays = new Set();
  const defer5Days = new Set(), capped200Days = new Set();
  let maxRaw = -1, maxRawDay = null, maxCapped = -1, maxCappedDay = null, maxGated = -1, proxyMax = 0, peakMax = 0;
  const first = {};
  const mark = (k, d) => { if (first[k] === undefined) first[k] = d; };
  for (const p of traj) {
    const rd5 = p.rd5 || {};
    if ((rd5.armored | 0) >= DEM5.armored) metDays.armored.add(p.day);
    if ((rd5.armed | 0) >= DEM5.armed) metDays.armed.add(p.day);
    if ((rd5.tricks | 0) >= DEM5.tricks) metDays.tricks.add(p.day);
    if ((rd5.veterans | 0) >= DEM5.veterans) metDays.veterans.add(p.day);
    if ((rd5.veterans | 0) >= 1) vet1Days.add(p.day);
    if ((rd5.veterans | 0) > vetMax) vetMax = (rd5.veterans | 0);
    if (rd5.ready) allFourDays.add(p.day);
    if (rd5.ready && (p.capped | 0) >= T5) allFourCappedDays.add(p.day);
    if (rd5.ready && (p.capped | 0) >= T5 && (p.faced4 | 0) > 0) fullEligDays.add(p.day);
    if ((p.capped | 0) >= T5 && !rd5.ready && (p.peak | 0) < 5) defer5Days.add(p.day);
    if ((p.capped | 0) >= T5) capped200Days.add(p.day);
    if (p.raw > maxRaw) { maxRaw = p.raw; maxRawDay = p.day; }
    if ((p.capped | 0) > maxCapped) { maxCapped = p.capped; maxCappedDay = p.day; }
    if (p.gated > maxGated) maxGated = p.gated;
    if (p.proxy > proxyMax) proxyMax = p.proxy;
    if ((p.peak | 0) > peakMax) peakMax = p.peak;
    if ((p.capped | 0) >= T5) mark('capped200', p.day);
    if (rd5.ready) mark('rd5ready', p.day);
    if ((p.faced4 | 0) > 0) mark('faced4', p.day);
    if (p.proxy >= 5) mark('proxy5', p.day);
    if (p.proxy >= 4) mark('proxy4', p.day);
  }
  const legMet = {}; for (const l of LEGS) legMet[l] = metDays[l].size;
  const minMet = Math.min(...LEGS.map(l => legMet[l]));
  const bindingLegs = LEGS.filter(l => legMet[l] === minMet);
  const atMaxCapped = maxCappedDay !== null ? traj.filter(t => t.day === maxCappedDay).pop() : null;
  const samples = {};
  for (const t of [30, 60, 120, 180]) { const s = sampleAt(traj, t); samples['d' + t] = { point: s.point, endSubstituted: s.endSubstituted }; }
  const endPoint = traj.length ? traj[traj.length - 1] : null;
  // Births-side.
  const spawns = (r.spawnsrc && r.spawnsrc.spawns) || [];
  const birthsByWave = {}; const birthsBySourceWave = {};
  for (const s of spawns) {
    const w = s.wave || s.w || 0;
    birthsByWave[w] = (birthsByWave[w] || 0) + 1;
    const src = s.src || s.source || s.via || 'unknown';
    birthsBySourceWave[src + ':w' + w] = (birthsBySourceWave[src + ':w' + w] || 0) + 1;
  }
  const targets = (wd.targets || []);
  let top5Calls = 0, target5Calls = 0, top4Calls = 0, target4Calls = 0;
  for (const t of targets) {
    if (t.poolTop === 5) top5Calls++;
    if (t.target === 5) target5Calls++;
    if (t.poolTop === 4) top4Calls++;
    if (t.target === 4) target4Calls++;
  }
  const facedMap = (r.raftdraft && r.raftdraft.faced) || {};
  const nationalEver = r.nationalEver === 1;
  const wave4Harness = (r.waveReach || 1) >= 4;
  const wave4Proxy = proxyMax >= 4;
  const recon = wave4Harness === wave4Proxy ? null : `RECONCILIATION harness=${r.waveReach} proxyMax=${proxyMax}`;
  const stages = {
    capped200: first.capped200 !== undefined,
    rd5ready: first.rd5ready !== undefined,
    faced4: first.faced4 !== undefined,
    proxy5: first.proxy5 !== undefined,
  };
  const bindingStage = !stages.capped200 ? 'capped200' : !stages.rd5ready ? 'rd5ready' : !stages.faced4 ? 'faced4' : !stages.proxy5 ? 'proxy5' : 'none (all stages reached)';
  const recErrs = (r.raftdraft && r.raftdraft.diag && r.raftdraft.diag.errs) || 0
    + ((r.spawnsrc && r.spawnsrc.diag && r.spawnsrc.diag.errs) || 0)
    + ((wd.diag && wd.diag.errs) || 0);
  const complete = Boolean(traj.length > 0 && pointErrs === 0 && recErrs === 0 && inconsistencies.length === 0
    && samples.d30.point && samples.d60.point && samples.d120.point && samples.d180.point && endPoint);
  return {
    seed: r.seed, end: r.endReason, days: r.days, won: r.won, finalRank: r.finalRank,
    nationalEver, nationalFinal: r.nationalFinal === 1, table: r.table === 1, entered: r.entered === 1,
    waveReach: r.waveReach, wave4Harness, wave4Proxy, proxyMax, recon,
    classKey: (nationalEver ? 'nat' : 'nonat') + 'x' + (wave4Harness ? 'w4' : 'now4'),
    maxRaw, maxRawDay, maxCapped, maxCappedDay, maxGated, peakMax,
    first, legMet, bindingLegs, atMaxCapped: atMaxCapped ? fmtPoint(atMaxCapped) : null,
    atMaxCappedRd5: atMaxCapped ? atMaxCapped.rd5 : null,
    daysAllFour: allFourDays.size, allFourDays: [...allFourDays].sort((a, b) => a - b),
    vetMax, daysVet1plus: vet1Days.size,
    daysAllFourCapped: allFourCappedDays.size, daysFullElig: fullEligDays.size,
    daysDefer5: defer5Days.size, daysCapped200: capped200Days.size,
    stages, bindingStage,
    samples: Object.fromEntries(Object.entries(samples).map(([k, v]) => [k, { line: fmtPoint(v.point), endSubstituted: v.endSubstituted }])),
    endLine: fmtPoint(endPoint),
    birthsByWave, birthsBySourceWave,
    targetCalls: (wd.targetCalls || 0), targetCounts: (wd.targetCounts || {}),
    top5Calls, target5Calls, top4Calls, target4Calls, maxTop: wd.maxTop,
    facedFinal: facedMap, kills4: (traj.length ? traj[traj.length - 1].kills4 : 0),
    tracePoints: traj.length, distinctDays: byDay.size, pointErrs, recErrs,
    inconsistencies, complete,
  };
}

function main() {
  const args = process.argv.slice(2);
  const dirArg = args.indexOf('--dir');
  const dir = dirArg >= 0 ? args[dirArg + 1] : path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-w5chain-a');
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const rows = summary.rows;
  const out = rows.map(analyzeRow);
  const completeN = out.filter(o => o.complete).length;
  const reconN = out.filter(o => o.recon).length;
  const inconsistN = out.reduce((t, o) => t + o.inconsistencies.length, 0);
  // Class aggregation.
  const classes = {};
  for (const o of out) {
    if (!classes[o.classKey]) classes[o.classKey] = { seeds: [], legBindCount: { armored: 0, armed: 0, tricks: 0, veterans: 0 }, legMetSum: { armored: 0, armed: 0, tricks: 0, veterans: 0 }, daysAllFour: 0, daysFullElig: 0, stagesReached: { capped200: 0, rd5ready: 0, faced4: 0, proxy5: 0 } };
    const c = classes[o.classKey];
    c.seeds.push(o.seed);
    for (const l of o.bindingLegs) c.legBindCount[l]++;
    for (const l of LEGS) c.legMetSum[l] += o.legMet[l];
    c.daysAllFour += o.daysAllFour;
    c.daysFullElig += o.daysFullElig;
    for (const s of ['capped200', 'rd5ready', 'faced4', 'proxy5']) if (o.stages[s]) c.stagesReached[s]++;
  }
  for (const k of Object.keys(classes)) {
    const c = classes[k];
    const maxBind = Math.max(...LEGS.map(l => c.legBindCount[l]));
    c.bindingLegs = LEGS.filter(l => c.legBindCount[l] === maxBind && maxBind > 0);
  }
  const report = { label: 'sim-w5chain-a per-class analysis', dir, band: summary.band, neutrality: summary.neutrality, corpusOk: summary.corpusOk, completeN, totalN: out.length, reconN, inconsistN, classes, seeds: out, generated: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(report, null, 1) + '\n');
  console.log(`\n=== sim-w5chain-a per-class analysis (${out.length} seeds; trace complete ${completeN}/${out.length}; reconciliations ${reconN}; inconsistencies ${inconsistN}) ===`);
  console.log(`band: won=${summary.band.won} natEver=${summary.band.nationalEver} wave4=${summary.band.wave4} wave5=${summary.band.wave5} deaths=${summary.band.deathTotal} neutrality=${summary.neutrality.exact ? 'EXACT' : 'DEVIATED'}`);
  for (const k of ['natxw4', 'natxnow4', 'nonatxw4', 'nonatxnow4']) {
    const c = classes[k];
    if (!c) { console.log(`\nCLASS ${k}: (empty)`); continue; }
    console.log(`\nCLASS ${k}: seeds=[${c.seeds.join(',')}] bindingLegs=[${c.bindingLegs.join(',')}] legBindCount=${JSON.stringify(c.legBindCount)} legMetSum=${JSON.stringify(c.legMetSum)} daysAllFour=${c.daysAllFour} daysFullElig=${c.daysFullElig} stagesReached=${JSON.stringify(c.stagesReached)}`);
  }
  for (const o of out) {
    console.log(`\nseed ${o.seed} [${o.classKey}] end=${o.end} d=${o.days} won=${o.won} rank=${o.finalRank} wave=${o.waveReach} proxyMax=${o.proxyMax}${o.recon ? ' ' + o.recon : ''}`);
    console.log(`  maxRaw=${o.maxRaw}@d${o.maxRawDay} maxCapped=${o.maxCapped}@d${o.maxCappedDay} maxGated=${o.maxGated} peak=${o.peakMax} first=${JSON.stringify(o.first)}`);
    console.log(`  legMet=${JSON.stringify(o.legMet)} bindingLegs=[${o.bindingLegs.join(',')}] vetMax=${o.vetMax} daysVet1plus=${o.daysVet1plus} daysAllFour=${o.daysAllFour} daysAllFourCapped=${o.daysAllFourCapped} daysFullElig=${o.daysFullElig} daysDefer5=${o.daysDefer5} bindingStage=${o.bindingStage}`);
    console.log(`  atMaxCapped: ${o.atMaxCapped}`);
    console.log(`  samples: 30: ${o.samples.d30.line}${o.samples.d30.endSubstituted ? ' [END-SUB]' : ''} | 60: ${o.samples.d60.line}${o.samples.d60.endSubstituted ? ' [END-SUB]' : ''} | 120: ${o.samples.d120.line}${o.samples.d120.endSubstituted ? ' [END-SUB]' : ''} | 180: ${o.samples.d180.line}${o.samples.d180.endSubstituted ? ' [END-SUB]' : ''}`);
    console.log(`  end: ${o.endLine}`);
    console.log(`  birthsByWave=${JSON.stringify(o.birthsByWave)} targets: calls=${o.targetCalls} top4=${o.top4Calls} ->4=${o.target4Calls} top5=${o.top5Calls} ->5=${o.target5Calls} maxTop=${o.maxTop} trace=${o.tracePoints}pts/${o.distinctDays}days pointErrs=${o.pointErrs} recErrs=${o.recErrs} complete=${o.complete}`);
  }
  if (completeN < out.length || reconN > 0 || inconsistN > 0) { console.error('W5CHAIN GATE FAILURE'); process.exit(1); }
}
if (require.main === module) main();
module.exports = { analyzeRow, gatedOf, proxyOf, DEM5 };
