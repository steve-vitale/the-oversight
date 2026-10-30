#!/usr/bin/env node
// killconv-analyze-20261030.js — sim-killconv-a decomposition analyzer.
//
// Reads evidence/2026-10-30/perseed-killconv/leadfeast/s<seed>.json and
// prints the wall numbers plus the per-seed OPPORTUNITY / SURVIVORSHIP /
// ACCOUNTING decomposition of the wave-5 veterans-bar shortfall, per the
// pre-registration (evidence/2026-10-30/sim-killconv-a-prereg.md).
//
// Binding-class rule per bar-short seed (peakR5Veterans < 2):
//   1. wave 4 never unlocked            -> OPPORTUNITY (upstream)
//   2. wave 4 unlocked, zero w4+ kills   -> OPPORTUNITY (no w4 kill)
//   3. >=2 distinct w4+ killers ever but peak living < 2
//                                        -> SURVIVORSHIP
//   4. w4+ kills exist but <2 distinct killers ever
//                                        -> ACCOUNTING (distinct-killer collapse)
// Anything else -> UNCLASSIFIED (counts against DIAG-GO, see prereg).
//
// Usage: node scripts/killconv-analyze-20261030.js [per-seed-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'perseed-killconv', 'leadfeast');

const files = fs.readdirSync(DIR).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = [];
for (const f of files) {
  try { seeds.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); } catch (e) { console.error('SKIP ' + f + ': ' + e.message); }
}
seeds.sort((a, b) => a.seed - b.seed);

function distinctKillers(s, minWave) {
  const set = new Set();
  for (const k of (s.kills || [])) if ((k.wave | 0) >= minWave && k.by) set.add(k.by);
  for (const k of (s.endWaveKillLog || [])) if ((k.w | 0) >= minWave && k.by) set.add(k.by);
  return set;
}
function livingKillers(s, minWave) {
  const living = new Set(s.endLiving || []);
  const out = new Set();
  for (const k of (s.endWaveKillLog || [])) if ((k.w | 0) >= minWave && k.by && living.has(k.by)) out.add(k.by);
  return out;
}
function countOutcomes(list, key) {
  const c = {};
  for (const r of list) { const k = r[key] || 'unknown'; c[k] = (c[k] || 0) + 1; }
  return c;
}
const median = (xs) => {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const rows = [];
for (const s of seeds) {
  const barShort = (s.peakR5Veterans | 0) < 2;
  const dkEver = distinctKillers(s, 4);
  const lkEnd = livingKillers(s, 4);
  const w3AfterW4 = (s.kills || []).filter(k => (k.wave | 0) === 3 && s.w4Day !== null && k.day >= s.w4Day).length;
  const endR5 = s.endReadiness5 ? (s.endReadiness5.veterans | 0) : null;
  const readMismatch = (endR5 !== null && endR5 !== lkEnd.size) ? `endReadiness5=${endR5} vs livingW4Killers=${lkEnd.size}` : null;
  let cls = null, sub = null;
  if (!barShort) { cls = 'BAR-REACHED'; }
  else if (!s.wave4) { cls = 'OPPORTUNITY'; sub = 'wave4-never-unlocked'; }
  else if ((s.kills4Count | 0) === 0) {
    cls = 'OPPORTUNITY'; sub = 'zero-w4-kills';
    if ((s.sp4Count | 0) === 0) sub += '/no-w4-spawn';
    else sub += '/meetings-no-kill';
  }
  else if (dkEver.size >= 2) { cls = 'SURVIVORSHIP'; sub = `killersEver=${dkEver.size} peakLiving=${s.peakR5Veterans} livingAtEnd=${lkEnd.size}`; }
  // ACCOUNTING (distinct-killer collapse) requires >=2 kills concentrated
  // on ONE killer: kills that happened but collapse to a single credit.
  // A single w4 kill in the whole run is NOT collapse — the second kill
  // never happened, which is OPPORTUNITY, and the one kill WAS credited
  // (peakR5=1 proves it). See metric review in the evidence file.
  else if ((s.kills4Count | 0) >= 2 && dkEver.size < 2) { cls = 'ACCOUNTING'; sub = `distinctCollapse killersEver=${dkEver.size} kills4=${s.kills4Count}`; }
  else if ((s.kills4Count | 0) >= 1) { cls = 'OPPORTUNITY'; sub = `single-w4-kill killersEver=${dkEver.size} kills4=${s.kills4Count} (second kill never happened)`; }
  else { cls = 'UNCLASSIFIED'; }
  const ffOutcomes = countOutcomes(s.fieldFights || [], 'outcome');
  // TB outcomes split: started fights only (a startCombat call that
  // produces no fight is a refused/duplicate attempt, not a meeting).
  const tbStarted = (s.tb || []).filter(t => t.started);
  const tbNotStarted = (s.tb || []).filter(t => !t.started).length;
  rows.push({
    seed: s.seed, maxWave: s.maxWave, w4Day: s.w4Day, w5Day: s.w5Day,
    national: s.national, table: s.table, won: s.won, end: s.endReason, days: s.gameDays,
    peakR4: s.peakR4Veterans, peakR5: s.peakR5Veterans, r4: s.r4BarReached, r5: s.r5BarReached,
    kills3: s.kills3Count, kills4: s.kills4Count, dkEver: dkEver.size, lkEnd: lkEnd.size,
    ff4: s.ff4Count, tb4: s.tb4Count, tb4Started: tbStarted.length, tb4Refused: tbNotStarted, sp4: s.sp4Count, sp4vet: s.sp4VeteranCount,
    sp3: s.sp3Count, sp3vet: s.sp3VeteranCount, w3AfterW4,
    ffOutcomes, tbOutcomes: countOutcomes(tbStarted, 'end'),
    cls, sub, readMismatch, errs: (s.instrumentErrors || []).length,
  });
}

const n = rows.length;
const sum = (k) => rows.reduce((a, r) => a + (r[k] | 0), 0);
console.log(`seeds: ${n}`);
console.log(`WALL: national=${sum('national')} table=${sum('table')} wins=${sum('won')} wave4=${rows.filter(r => r.maxWave >= 4).length} wave5=${rows.filter(r => r.maxWave >= 5).length} medianSurvival=${median(rows.map(r => r.days))} maxSurvival=${Math.max(...rows.map(r => r.days))}`);
console.log(`BAR: r4Reached=${sum('r4')} r5Reached=${sum('r5')} peakR5 distribution: ${JSON.stringify(rows.reduce((a, r) => { a[r.peakR5] = (a[r.peakR5] || 0) + 1; return a; }, {}))}`);
console.log(`KILLS: w3=${sum('kills3')} w4plus=${sum('kills4')} distinctW4KillersEver(total)=${rows.reduce((a, r) => a + r.dkEver, 0)} livingAtEnd(total)=${rows.reduce((a, r) => a + r.lkEnd, 0)}`);
console.log(`MEETINGS: ff4=${sum('ff4')} tb4started=${sum('tb4Started')} tb4refused=${sum('tb4Refused')} sp4=${sum('sp4')} sp4vet=${sum('sp4vet')} sp3=${sum('sp3')} sp3vet=${sum('sp3vet')} w3KillsAfterW4Unlock=${sum('w3AfterW4')}`);
const clsCount = {};
for (const r of rows) { if (r.cls !== 'BAR-REACHED') clsCount[r.cls] = (clsCount[r.cls] || 0) + 1; }
console.log(`DECOMPOSITION (bar-short seeds only): ${JSON.stringify(clsCount)}`);
const short = rows.filter(r => r.cls !== 'BAR-REACHED');
const leader = Object.entries(clsCount).sort((a, b) => b[1] - a[1]);
if (leader.length) {
  const second = leader[1] ? leader[1][1] : 0;
  console.log(`LEADER: ${leader[0][0]} ${leader[0][1]} vs runner-up ${second} (2:1 rule: ${leader[0][1] >= 2 * Math.max(second, 1) ? 'MET' : 'NOT MET'})`);
}
console.log('--- per-seed ---');
for (const r of rows) {
  console.log(`s${r.seed} w${r.maxWave} w4d=${r.w4Day} w5d=${r.w5Day} nat=${r.national} tab=${r.table} won=${r.won} ${r.end} d${r.days} peakR4=${r.peakR4} peakR5=${r.peakR5} k3=${r.kills3} k4=${r.kills4} dkEver=${r.dkEver} lkEnd=${r.lkEnd} ff4=${r.ff4} tb4started=${r.tb4Started} tb4refused=${r.tb4Refused} sp4=${r.sp4} sp4vet=${r.sp4vet} sp3vet=${r.sp3vet} w3afterW4=${r.w3AfterW4} ff=${JSON.stringify(r.ffOutcomes)} tb=${JSON.stringify(r.tbOutcomes)} => ${r.cls}${r.sub ? ' (' + r.sub + ')' : ''}${r.readMismatch ? ' READ-MISMATCH: ' + r.readMismatch : ''} errs=${r.errs}`);
}
// Death-cause shares (defensive: rows may vary in shape).
const causes = {};
for (const s of seeds) {
  for (const d of (s.deaths || [])) {
    const c = (d && (d.cause || d.kind || d.type)) || 'unknown';
    causes[c] = (causes[c] || 0) + 1;
  }
}
console.log(`DEATH CAUSES (harness sampler rows): ${JSON.stringify(causes)}`);
console.log(`TRANSCRIPTS: ${seeds.reduce((a, s) => a + ((s.transcripts || []).length), 0)} snapshots across band`);
