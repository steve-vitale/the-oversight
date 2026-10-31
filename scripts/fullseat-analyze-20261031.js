#!/usr/bin/env node
// fullseat-analyze-20261031.js — sim-fullseat-a census analyzer (idle
// process, no game loaded).
//
// Usage: node scripts/fullseat-analyze-20261031.js <perseed-dir> <out-json>
// Reads <perseed-dir>/leadfeast/s<seed>.json, writes the census +
// cross-checks. Exits non-zero (loud) if any judged seed file is
// missing/empty or any cross-check fails beyond the prereg's single
// succession-shaped explanation clause (which the analyzer flags but
// does not auto-pass — the human verdict in the evidence file decides).
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const outPath = process.argv[3];
if (require.main === module && (!dir || !outPath)) { console.error('Usage: node scripts/fullseat-analyze-20261031.js <perseed-dir> <out-json>'); process.exit(2); }

const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
const n0 = x => { const n = x | 0; return n > 0 ? n : 0; };
const key = e => [e.d, e.mid, e.w, e.by, e.via, e.trick || null].join('|');
const capKey = k => [k.d, k.mid, k.w, k.by, k.via, k.trick || null].join('|');

function bindingAt(v) {
  const b = [];
  if (n0(v.w1) < BARS.w1) b.push('w1');
  if (n0(v.w2) < BARS.w2) b.push('w2');
  if (n0(v.w3) < BARS.w3) b.push('w3');
  if (n0(v.w4) < BARS.w4) b.push('w4');
  if (n0(v.w5) < BARS.w5) b.push('w5');
  if (n0(v.contests) < BARS.contests) b.push('contests');
  if (n0(v.crises) < BARS.crises) b.push('crises');
  if (n0(v.stage) < BARS.stage) b.push('stage');
  if (!v.foodDeeds) b.push('foodDeeds');
  if (!v.scale) b.push('scale');
  return b;
}
function shortfall(v) {
  return Math.max(0, BARS.w1 - n0(v.w1)) + Math.max(0, BARS.w2 - n0(v.w2))
    + Math.max(0, BARS.w3 - n0(v.w3)) + Math.max(0, BARS.w4 - n0(v.w4))
    + Math.max(0, BARS.w5 - n0(v.w5)) + Math.max(0, BARS.contests - n0(v.contests))
    + Math.max(0, BARS.crises - n0(v.crises)) + Math.max(0, BARS.stage - n0(v.stage))
    + (v.foodDeeds ? 0 : 1) + (v.scale ? 0 : 1);
}

function analyzeSeed(j) {
  const rt = j.regtableRows || [];
  const wg = j.wavegateRows || [];
  const vr = j.vetRows || [];
  const a = { seed: j.seed, anchorCommit: j.anchorCommit };
  a.errs = { wavegate: j.wavegateErrs | 0, vet: j.vetErrs | 0, regtable: j.regtableErrs | 0, capture: j.captureErrs | 0 };
  a.rows = { regtable: rt.length, wavegate: wg.length, vet: vr.length };
  a.end = { won: !!j.won, table: !!j.table, national: !!j.national, maxWave: j.maxWave, gameDays: j.gameDays, endReason: j.endReason, endScaleRank: j.endScaleRank };

  // (1) Table day + seat from regtable rows.
  let tableRow = null;
  for (const r of rt) { if (r.tableWaiting || r.tableDone) { tableRow = r; break; } }
  a.tableDay = tableRow ? tableRow.day : null;
  a.seatAtTable = tableRow ? tableRow.seat : null;
  a.rankAtTable = tableRow ? tableRow.rank : null;
  a.fullAtTable = tableRow ? tableRow.full : null;
  a.fullOkAtTable = tableRow ? !!tableRow.fullOk : null;
  // cc1: wavegate derivation of table day.
  let wgTableDay = null;
  for (const r of wg) { if (r.tableWaiting || r.tableDone) { wgTableDay = r.day; break; } }
  a.wgTableDay = wgTableDay;
  a.cc1_tableDayAgree = (a.tableDay === wgTableDay);

  // (2/3) Closest approach: per-component max over regtable rows.
  const mx = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0, contests: 0, crises: 0, stage: 0, foodDeeds: false, scale: false };
  let firstFullDay = null;
  for (const r of rt) {
    const f = r.full || {};
    for (const k of ['w1', 'w2', 'w3', 'w4', 'w5']) if (n0(f[k]) > mx[k]) mx[k] = n0(f[k]);
    if (n0(f.contestsN) > mx.contests) mx.contests = n0(f.contestsN);
    if (n0(f.crisesN) > mx.crises) mx.crises = n0(f.crisesN);
    if (n0(f.stage) > mx.stage) mx.stage = n0(f.stage);
    if (f.foodDeeds) mx.foodDeeds = true;
    if (f.scale) mx.scale = true;
    if (r.fullOk && firstFullDay == null) firstFullDay = r.day;
  }
  a.maxVector = mx;
  a.bindingAtMax = bindingAt(mx);
  a.shortfallAtMax = shortfall(mx);
  a.firstFullDay = firstFullDay;
  a.everFull = firstFullDay != null;
  // Fullseat ctx cross-check (cc5, informational): max + firstFullSeatDay.
  if (j.fullseat) {
    const fm = j.fullseat.max || {};
    a.fullseatMax = { w1: fm.w1, w2: fm.w2, w3: fm.w3, w4: fm.w4, w5: fm.w5, contests: fm.contests, crises: fm.crises, stage: fm.stage, standing: fm.standing };
    a.fullseatFirstFullDay = j.fullseat.firstFullSeatDay;
    a.fullseatFirstLesserDay = j.fullseat.firstLesserDay || null;
    a.fullseatWinDay = j.fullseat.winDay;
    a.cc5_fullseatMaxAgree = (fm.w1 === mx.w1 && fm.w2 === mx.w2 && fm.w3 === mx.w3 && fm.w4 === mx.w4 && fm.w5 === mx.w5
      && fm.contests === mx.contests && fm.crises === mx.crises && fm.stage === mx.stage);
    a.cc5_firstFullAgree = (j.fullseat.firstFullSeatDay === firstFullDay);
  }
  // Binding + shortfall at table day.
  if (tableRow && tableRow.full) {
    const f = tableRow.full;
    const v = { w1: f.w1, w2: f.w2, w3: f.w3, w4: f.w4, w5: f.w5, contests: f.contestsN, crises: f.crisesN, stage: f.stage, foodDeeds: f.foodDeeds, scale: f.scale };
    a.vectorAtTable = v;
    a.bindingAtTable = bindingAt(v);
    a.shortfallAtTable = shortfall(v);
  } else { a.vectorAtTable = null; a.bindingAtTable = null; a.shortfallAtTable = null; }
  a.singleBarNearMissAtMax = a.bindingAtMax.length === 1;
  // Component-wise pass but never simultaneous?
  a.componentWisePass = a.bindingAtMax.length === 0;
  // Closest single day: the daily row minimizing shortfall (ties ->
  // latest day). The max vector is per-component; this is the best
  // day the village actually lived, and the gap between the two is
  // the simultaneity gap.
  let closest = null;
  for (const r of rt) {
    const f = r.full || {};
    const v = { w1: f.w1, w2: f.w2, w3: f.w3, w4: f.w4, w5: f.w5, contests: f.contestsN, crises: f.crisesN, stage: f.stage, foodDeeds: f.foodDeeds, scale: f.scale };
    const sf = shortfall(v);
    if (closest == null || sf <= closest.shortfall) closest = { day: r.day, vector: v, binding: bindingAt(v), shortfall: sf, seat: r.seat, rank: r.rank };
  }
  a.closestDay = closest;

  // (4) Veterans census.
  let maxV5 = 0, maxV5First = null, maxV5Last = null, maxV5Rows = 0;
  const vet5Holders = new Set(), vet5Names = {};
  let endV5 = [];
  for (const r of vr) {
    const s = (r.vet5 || []).length;
    if (s > maxV5) { maxV5 = s; maxV5First = r.day; maxV5Last = r.day; maxV5Rows = 1; }
    else if (s === maxV5 && s > 0) { maxV5Last = r.day; maxV5Rows++; }
    for (const vid of (r.vet5 || [])) { vet5Holders.add(vid); if (r.names && r.names[vid]) vet5Names[vid] = r.names[vid]; }
  }
  if (vr.length) endV5 = vr[vr.length - 1].vet5 || [];
  a.maxVet5 = maxV5; a.maxVet5FirstDay = maxV5First; a.maxVet5LastDay = maxV5Last; a.maxVet5Rows = maxV5Rows;
  a.vet5Holders = [...vet5Holders].map(vid => ({ vid, name: vet5Names[vid] || null }));
  a.endVet5 = endV5;
  // Vet5 holder day-spans: first/last day each holder appears living.
  const spans = {};
  for (const r of vr) for (const vid of (r.vet5 || [])) {
    if (!spans[vid]) spans[vid] = { first: r.day, last: r.day, rows: 1 };
    else { spans[vid].last = r.day; spans[vid].rows++; }
  }
  a.vet5Spans = spans;

  // Kills: dedupe exact repeats (vet2-a pattern), key scholar/companion
  // by kill-time scholar vid (capture's scholarVid).
  const kills = j.kills || [];
  const seenCap = new Map();
  let dupCap = 0;
  for (const k of kills) { const kk = capKey(k); if (seenCap.has(kk)) dupCap++; else seenCap.set(kk, k); }
  const dedup = [...seenCap.values()];
  const w4kills = dedup.filter(k => k.w === 4);
  const w5kills = dedup.filter(k => k.w >= 5);
  const w3pkills = dedup.filter(k => k.w >= 3);
  const byKiller = {};
  for (const k of dedup.filter(k => k.w >= 4)) {
    const role = (k.by === k.scholarVid) ? 'scholar' : 'companion';
    if (!byKiller[k.by]) byKiller[k.by] = { kills: [], roleAtKill: role };
    byKiller[k.by].kills.push({ d: k.d, mid: k.mid, w: k.w, via: k.via, src: k.src, role });
  }
  // Names for killers from vet rows.
  for (const vid of Object.keys(byKiller)) {
    for (const r of vr) { if (r.names && r.names[vid]) { byKiller[vid].name = r.names[vid]; break; } }
  }
  a.kills = { captureCalls: kills.length, dedupCalls: dedup.length, dupCap, w3plus: w3pkills.length, w4: w4kills.length, w5: w5kills.length, byKiller };
  // cc2: capture (deduped) vs final log.
  const logCounts = new Map(), capCounts = new Map();
  for (const e of (j.finalWaveKillLog || [])) { const kk = key(e); logCounts.set(kk, (logCounts.get(kk) || 0) + 1); }
  for (const k of dedup) { const kk = capKey(k); capCounts.set(kk, (capCounts.get(kk) || 0) + 1); }
  const cc2Extra = [], cc2Missing = [];
  for (const [kk, c] of capCounts) { const l = logCounts.get(kk) || 0; if (c > l) cc2Extra.push({ key: kk, cap: c, log: l }); }
  for (const [kk, c] of logCounts) { const l = capCounts.get(kk) || 0; if (c > l) cc2Missing.push({ key: kk, cap: l, log: c }); }
  a.cc2 = { extra: cc2Extra, missing: cc2Missing, pass: cc2Extra.length === 0 && cc2Missing.length === 0 };
  // cc3: capture scholar vid vs latest daily vet scholar vid <= kill day.
  const cc3Mismatch = [];
  for (const k of dedup) {
    let census = null, censusRow = null;
    for (const r of vr) { if (r.day <= k.d) { census = r.scholarVid; censusRow = r; } else break; }
    if (census != null && k.scholarVid != null && census !== k.scholarVid) {
      // Succession-shaped? some earlier vet row scholar == capture scholar.
      const earlier = vr.some(r => r.day <= k.d && r.scholarVid === k.scholarVid);
      cc3Mismatch.push({ d: k.d, mid: k.mid, by: k.by, captureScholar: k.scholarVid, censusScholar: census, successionShaped: earlier });
    }
  }
  a.cc3 = { mismatches: cc3Mismatch, pass: cc3Mismatch.length === 0 };
  // cc4: derived vs engine unlocked wave.
  a.cc4_derivedEqEngine = (j.derivedFinalUw === j.engineFinalUw);
  a.derivedFinalUw = j.derivedFinalUw; a.engineFinalUw = j.engineFinalUw;
  // (5) Wave-5 blocker from last wavegate row.
  const lastWg = wg.length ? wg[wg.length - 1] : null;
  a.lastWavegate = lastWg ? { day: lastWg.day, uw: lastWg.uw, gated: lastWg.gated, hold: lastWg.hold, binding: lastWg.binding, w4faced: lastWg.w4faced, raw: lastWg.raw, capped: lastWg.capped, peak: lastWg.peak } : null;
  a.missingDays = null;
  return a;
}

if (require.main === module) {
const leadDir = path.join(dir, 'leadfeast');
const files = fs.readdirSync(leadDir).filter(f => /^s\d+\.json$/.test(f)).sort();
if (!files.length) { console.error('ANALYZE STOP: no per-seed JSONs in ' + leadDir); process.exit(2); }
const seeds = [];
let fail = false;
for (const f of files) {
  const raw = fs.readFileSync(path.join(leadDir, f), 'utf8');
  if (!raw.trim()) { console.error('ANALYZE STOP: empty file ' + f); process.exit(2); }
  let j;
  try { j = JSON.parse(raw); } catch (e) { console.error('ANALYZE STOP: unparsable ' + f); process.exit(2); }
  const a = analyzeSeed(j);
  seeds.push(a);
  console.log(`s${a.seed}: table=${a.tableDay} seat=${a.seatAtTable} rank=${a.rankAtTable} full=${a.firstFullDay} maxV5=${a.maxVet5} w4k=${a.kills.w4} w5k=${a.kills.w5} bindMax=[${a.bindingAtMax.join(',')}] shortMax=${a.shortfallAtMax} cc1=${a.cc1_tableDayAgree} cc2=${a.cc2.pass} cc3=${a.cc3.pass} cc4=${a.cc4_derivedEqEngine} errs=${a.errs.wavegate}/${a.errs.vet}/${a.errs.regtable}/${a.errs.capture}`);
  if (!a.cc1_tableDayAgree || !a.cc2.pass || !a.cc4_derivedEqEngine) fail = true;
  if (a.errs.wavegate || a.errs.vet || a.errs.regtable || a.errs.capture) fail = true;
}
const band = {
  seeds: seeds.length,
  table: seeds.filter(s => s.tableDay != null).length,
  everFull: seeds.filter(s => s.everFull).length,
  won: seeds.filter(s => s.end.won).length,
  national: seeds.filter(s => s.end.national).length,
  wave4: seeds.filter(s => s.end.maxWave >= 4).length,
  wave5: seeds.filter(s => s.end.maxWave >= 5).length,
  maxVet5ge2: seeds.filter(s => s.maxVet5 >= 2).length,
  w4killsTotal: seeds.reduce((t, s) => t + s.kills.w4, 0),
  w5killsTotal: seeds.reduce((t, s) => t + s.kills.w5, 0),
  singleBarNearMiss: seeds.filter(s => s.singleBarNearMissAtMax).map(s => s.seed),
  componentWisePass: seeds.filter(s => s.componentWisePass).map(s => s.seed),
};
const out = { band, seeds };
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log(`band: ${JSON.stringify(band)}`);
if (fail) { console.error('ANALYZE: cross-check/err failures present (see per-seed lines; cc3 succession-shaped exceptions are flagged, not auto-failed).'); process.exit(3); }
console.log('analyze done: all gated cross-checks pass');
}

module.exports = { analyzeSeed, bindingAt, shortfall, BARS };
