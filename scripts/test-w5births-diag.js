#!/usr/bin/env node
// scripts/test-w5births-diag.js — analyzer for sim-w5births-a.
// Reads evidence/2026-10-25/perseed-sim-w5births-a/summary.json rows
// (written by scripts/test-w5births-diag-sweep.js --summary) and
// classifies each seed per the evidence file's pre-registration.
//
// RECONSTRUCTION (never calls the gated function — the corpus holds
// only pure reads, by design): standingCfg in this tree is t4=100,
// t5=200, plentyCapT5=100 (read from src/js/standing.js). For each
// daily point (end-of-day, in order):
//   holds: cap (raw>=200 && capped<200 && peak<5 -> 199);
//          defer4 (raw>=100 && !rd4.ready && peak<4 -> 99);
//          defer5 (capped>=200 && !rd5.ready && peak<5 -> 199);
//   gated = min(raw, holds...); floor = peak>=5 ? 200 : peak>=4 ? 100 : 0;
//   effective = max(gated, floor). Peak here is the OBSERVED
//   state._standingPeakWave at that daily point (the engine's own
//   ratchet, read — not simulated), which is more faithful than a
//   re-simulation: a mid-day engine release is already in the peak
//   by the end-of-day point.
//   proxy unlocked: w3 rung (day>=25 && pts2>=4) + effective>=100 -> 4;
//   + effective>=200 + faced4>0 -> 5; w3 rung alone -> 3.
// Final harness waveReach (the harness's post-run unlockedWave() call)
// is reported alongside the proxy and must agree on wave 4/5 (peak
// ratchet makes final == max); any disagreement is printed as a
// RECONCILIATION note, never silently resolved.
//
// CLASSIFICATION (pre-registered causal order — earliest never-cleared
// gate wins): STANDING100 / READINESS4 / FACED4 / SPAWN4 /
// STANDING200 / READINESS5 / SPAWN-TARGETING / OTHER-NAMED. See the
// evidence file for the exact definitions.
//
// Usage: node scripts/test-w5births-diag.js [--dir <perseed-dir>]
// Writes <dir>/analysis.json and prints the classification table.
// Exit 1 if any seed is unclassifiable or any required field is null.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const T4 = 100, T5 = 200, CAP = 100;

function gatedOf(p) {
  if (p.raw === null || p.raw === undefined) return null;
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
  if (!w3) return 3; // upper bound only: waves 1-2 not distinguished here (pts1 not recorded); w3 rung is what matters for 4/5
  if (g >= T5 && (p.faced4 || 0) > 0) return 5;
  if (g >= T4) return 4;
  return 3;
}

function analyzeRow(r) {
  const wd = r.w5births || {};
  const days = wd.days || [];
  let maxRaw = -1, maxCapped = -1, maxGated = -1, maxPeak = 0;
  let maxRawDay = null, proxyMax = 0, gatedMax = -1;
  let first = {};
  const mark = (k, d) => { if (first[k] === undefined) first[k] = d; };
  const traj = [];
  for (const p of days) {
    if (p.raw === null || p.raw === undefined) continue;
    const g = gatedOf(p);
    const eff = g.gated;
    const pr = proxyOf(p, eff);
    traj.push({ day: p.day, raw: p.raw, capped: p.capped, gated: eff, holds: g.holds, peak: g.peak, proxy: pr, rd4: p.rd4, rd5: p.rd5, faced4: p.faced4, faced5: p.faced5, kills4: p.kills4, kills5: p.kills5, pts2: p.pts2, pts3: p.pts3, pts4: p.pts4 });
    if (p.raw > maxRaw) { maxRaw = p.raw; maxRawDay = p.day; }
    if ((p.capped || 0) > maxCapped) maxCapped = p.capped;
    if (eff > maxGated) { maxGated = eff; gatedMax = p.day; }
    if ((g.peak || 0) > maxPeak) maxPeak = g.peak;
    if (pr > proxyMax) proxyMax = pr;
    if (p.raw >= T4) mark('raw100', p.day);
    if (p.raw >= T5) mark('raw200', p.day);
    if ((p.capped || 0) >= T5) mark('capped200', p.day);
    if (p.rd4 && p.rd4.ready) mark('rd4ready', p.day);
    if (p.rd5 && p.rd5.ready) mark('rd5ready', p.day);
    if ((p.faced4 || 0) > 0) mark('faced4', p.day);
    if ((p.faced5 || 0) > 0) mark('faced5', p.day);
    if ((p.kills4 || 0) > 0) mark('killed4', p.day);
    if ((p.kills5 || 0) > 0) mark('killed5', p.day);
    if (pr >= 4) mark('proxy4', p.day);
    if (pr >= 5) mark('proxy5', p.day);
    if ((g.peak || 0) >= 4) mark('peak4', p.day);
    if ((g.peak || 0) >= 5) mark('peak5', p.day);
  }
  const last = traj.length ? traj[traj.length - 1] : null;
  const atMaxRaw = maxRawDay !== null ? traj.find(t => t.day === maxRawDay) : null;
  // Final faced/kills from the post-run snapshots (authoritative end state).
  const facedMap = (r.raftdraft && r.raftdraft.faced) || {};
  let faced4Final = 0, faced5Final = 0;
  const faced4Types = [], faced5Types = [];
  for (const [mid, w] of Object.entries(facedMap)) {
    if (w === 4) { faced4Final++; faced4Types.push(mid); }
    if (w === 5) { faced5Final++; faced5Types.push(mid); }
  }
  const logEntries = (r.raftdraft && r.raftdraft.logEntries) || [];
  let kills4Final = 0, kills5Final = 0;
  for (const e of logEntries) { if ((e.w | 0) === 4) kills4Final++; if ((e.w | 0) === 5) kills5Final++; }
  // Births by wave + wave-4 births by source (spawnsrc census).
  const spawns = (r.spawnsrc && r.spawnsrc.spawns) || [];
  const birthsByWave = {};
  const births4BySrc = {};
  for (const s of spawns) {
    birthsByWave[s.wave] = (birthsByWave[s.wave] || 0) + 1;
    if (s.wave === 4) births4BySrc[s.src] = (births4BySrc[s.src] || 0) + 1;
  }
  const births5 = birthsByWave[5] || 0;
  const births4 = birthsByWave[4] || 0;
  // Readiness maxima (living veterans ever observed at a daily point).
  let rd4VetMax = 0, rd5VetMax = 0, rd4ArmMax = 0, rd5ArmMax = 0;
  for (const t of traj) {
    if (t.rd4) { rd4VetMax = Math.max(rd4VetMax, t.rd4.veterans || 0); rd4ArmMax = Math.max(rd4ArmMax, t.rd4.armored || 0); }
    if (t.rd5) { rd5VetMax = Math.max(rd5VetMax, t.rd5.veterans || 0); rd5ArmMax = Math.max(rd5ArmMax, t.rd5.armored || 0); }
  }
  // Post-unlock spawn window: target calls at poolTop>=4 on/after the
  // first proxy-4 day, and wave-4 birth days (spawnsrc census). A seed
  // whose unlock lands on the final day has a window of ~0 days: its
  // "0 births" is a missing window, NOT a targeting refusal — the
  // detail must say so, or the label misleads.
  const proxy4Day = first.proxy4;
  const w4BirthDays = spawns.filter(s => s.wave === 4).map(s => s.day);
  const postUnlockTargets = (wd.targets || []).filter(t => proxy4Day !== undefined && t.day >= proxy4Day && t.poolTop >= 4);
  const postUnlockCalls = postUnlockTargets.length;
  const postUnlockReturns4 = postUnlockTargets.filter(t => t.target === 4).length;
  const windowDays = proxy4Day !== undefined ? Math.max(0, (r.days - proxy4Day)) : null;
  // Classification (pre-registered causal order).
  let label = null, detail = '', taskMap = '';
  const bars = (rd, dem) => rd ? `armored ${rd.armored}/${dem.a} @P, armed ${rd.armed}/${dem.ar}, tricks ${rd.tricks}/${dem.t}, veterans ${rd.veterans}/${dem.v}` : 'no-read';
  if ((r.waveReach || 1) >= 5 || proxyMax >= 5) {
    if (births5 === 0) { label = 'SPAWN-TARGETING'; taskMap = '(d) spawn targeting'; detail = `gates cleared (proxyMax=${proxyMax}, harness waveReach=${r.waveReach}) yet w5 births=0; target calls at top5=${(wd.targetCounts || {})['5:5'] || 0}, firstTop5Day=${wd.firstTop5Day}, firstTarget5Day=${wd.firstTarget5Day}`; }
    else { label = 'OTHER-NAMED'; taskMap = '—'; detail = `wave 5 reached AND born (${births5} births) — contradicts the spawnsrc premise; investigate`; }
  } else if ((r.waveReach || 1) >= 4 || proxyMax >= 4) {
    if (faced4Final === 0) {
      if (births4 === 0) { label = 'SPAWN4'; taskMap = '(d) spawn targeting at wave 4'; detail = `wave 4 unlocked day ${proxy4Day} (run ends day ${r.days}; window ${windowDays}d) but 0 wave-4 births: ${postUnlockCalls} target calls at top>=4 after unlock (all ${wd.targetCalls || 0} calls were at top<=3, before unlock) — a missing spawn WINDOW, not a targeting refusal (target never saw top 4 after unlock). CO-BLOCKER (named, not hidden): capped already ${maxCapped} (day ${first.capped200}) with gated held at ${maxGated} by defer5 (rd5 veterans max=${rd5VetMax}/2, never ready) — even with a window, wave 5 still needed a wave-4 kill first.`; }
      else { label = 'FACED4'; taskMap = '(b) wave-4 never faced'; detail = `wave 4 unlocked day ${proxy4Day} (window ${windowDays}d to day ${r.days}); ${births4} wave-4 births on days ${w4BirthDays.join(',')}; ${postUnlockCalls} target calls at top>=4 after unlock (${postUnlockReturns4} returned 4); faced4=0 at end (never fought blow-by-blow)`; }
    } else if (maxCapped < T5) {
      label = 'STANDING200'; taskMap = '(a) standing never 200'; detail = `faced4=${faced4Final}, kills4=${kills4Final}, but maxCapped=${maxCapped} < 200 (maxRaw=${maxRaw}); first capped200 never`;
    } else if (first.rd5ready === undefined) {
      label = 'READINESS5'; taskMap = '(c) veterans lock (wave 5)'; detail = `capped>=200 (day ${first.capped200}), faced4=${faced4Final}, but rd5 never ready: final bars ${bars(last ? last.rd5 : null, { a: 4, ar: 6, t: 3, v: 2 })}; rd5 veterans max=${rd5VetMax} (demand 2), final=${last && last.rd5 ? last.rd5.veterans : null}; short at end=${last && last.rd5 ? (last.rd5.short || []).join(',') : '?'}`;
    } else {
      label = 'OTHER-NAMED'; taskMap = '—'; detail = `proxy4 + faced + capped + rd5 ready yet proxy never 5 — check gated trace (maxGated=${maxGated}, first proxy5=${first.proxy5})`;
    }
  } else {
    if (maxRaw < T4) { label = 'STANDING100'; taskMap = '(a) standing never 100/200'; detail = `maxRaw=${maxRaw} < 100 (maxCapped=${maxCapped}); wave-4 door never opened`; }
    else {
      label = 'READINESS4'; taskMap = '(c) veterans lock (wave 4)'; detail = `raw>=100 (day ${first.raw100}), maxRaw=${maxRaw}, but rd4 never ready: bars at max-raw day ${bars(atMaxRaw ? atMaxRaw.rd4 : null, { a: 3, ar: 5, t: 3, v: 1 })}; bars at end ${bars(last ? last.rd4 : null, { a: 3, ar: 5, t: 3, v: 1 })}; rd4 veterans max=${rd4VetMax} (demand 1), final=${last && last.rd4 ? last.rd4.veterans : null}; short at end=${last && last.rd4 ? (last.rd4.short || []).join(',') : '?'}`;
    }
  }
  const recon = ((r.waveReach || 1) >= 4) !== (proxyMax >= 4) || ((r.waveReach || 1) >= 5) !== (proxyMax >= 5)
    ? `RECONCILIATION: harness waveReach=${r.waveReach} vs proxyMax=${proxyMax}` : null;
  return {
    seed: r.seed, days: r.days, gameDays: r.gameDays, endReason: r.endReason, won: r.won,
    waveReach: r.waveReach, nationalEver: r.nationalEver, nationalFinal: r.nationalFinal,
    maxRaw, maxCapped, maxGated, maxPeak, maxRawDay, proxyMax, first, lastDay: last,
    atMaxRaw: atMaxRaw ? { day: atMaxRaw.day, raw: atMaxRaw.raw, capped: atMaxRaw.capped, gated: atMaxRaw.gated, rd4: atMaxRaw.rd4, rd5: atMaxRaw.rd5 } : null,
    faced4Final, faced5Final, faced4Types, faced5Types, kills4Final, kills5Final,
    birthsByWave, births4, births5, births4BySrc,
    targetCalls: wd.targetCalls || 0, targetCounts: wd.targetCounts || {}, maxTop: wd.maxTop || 1,
    proxy4Day, windowDays, postUnlockCalls, postUnlockReturns4, w4BirthDays,
    firstTop5Day: wd.firstTop5Day, firstTarget5Day: wd.firstTarget5Day,
    rd4VetMax, rd5VetMax, rd4ArmMax, rd5ArmMax,
    label, taskMap, detail, recon,
    trajDays: traj.length, w5diagErrs: (wd.diag && wd.diag.errs) || 0,
  };
}

function main() {
  const args = process.argv.slice(2);
  const di = args.indexOf('--dir');
  const dir = di >= 0 ? args[di + 1] : path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-w5births-a');
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
  const perSeed = summary.rows.map(analyzeRow);
  const counts = {};
  for (const s of perSeed) counts[s.label] = (counts[s.label] || 0) + 1;
  const out = { label: 'sim-w5births-a analysis', seeds: summary.seeds, counts, perSeed, generated: new Date().toISOString() };
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('\n=== sim-w5births-a classification ===');
  console.log('seed | end | waveReach/proxyMax | maxRaw/maxCapped/maxGated | faced4/killed4 | births4/births5 | maxTop/targetCalls | LABEL (task map)');
  for (const s of perSeed) {
    console.log(`${s.seed} | ${s.endReason} ${s.days}d won=${s.won} | ${s.waveReach}/${s.proxyMax} | ${s.maxRaw}/${s.maxCapped}/${s.maxGated} peak=${s.maxPeak} | ${s.faced4Final}/${s.kills4Final} | ${s.births4}/${s.births5} | ${s.maxTop}/${s.targetCalls} | ${s.label} ${s.taskMap}`);
    console.log(`     detail: ${s.detail}`);
    if (s.recon) console.log(`     ${s.recon}`);
  }
  console.log(`\ncounts: ${JSON.stringify(counts)}`);
  console.log(`analysis -> ${path.join(dir, 'analysis.json')}`);
  const bad = perSeed.filter(s => !s.label || s.label === 'OTHER-NAMED' || s.w5diagErrs > 0);
  if (bad.length) {
    console.log(`WARN: ${bad.length} seed(s) OTHER-NAMED or with recorder errors — classification incomplete for those seeds (see details above).`);
  }
}
if (require.main === module) main();
module.exports = { analyzeRow, gatedOf, proxyOf };
