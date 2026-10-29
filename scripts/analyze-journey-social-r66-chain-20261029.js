#!/usr/bin/env node
// analyze-journey-social-r66-chain-20261029.js -- DRY-CHAIN vs ROSTER-SIZE (lane B, social r66).
// Reads evidence/2026-10-29/r66/journey-social-r66-s<seed>.json for seeds
// 6101-6104 (or SEEDS env) and bands every dry9Detail turn by the living
// NPC roster on its day (FULL >= 8, THINNED 5-7, THIN <= 4, UNBANDED when
// no snapshot at or before its day). Prints per-seed + pooled, per band:
// dry9 turns, dry9-with-next, another-dry follows (chain rate), max/mean
// consecutive-dry run per conversation, days in band, dry9 per band-day.
// No game code, no RNG: pure JSON aggregation.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-29', 'r66');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [6101, 6102, 6103, 6104]).filter(Number.isFinite);
const bandOf = (n) => (n === null || n === undefined ? 'UNBANDED' : (n >= 8 ? 'FULL' : (n >= 5 ? 'THINNED' : 'THIN')));
const pct = (n, d) => d ? (100 * n / d).toFixed(1) + '%' : 'n/a';
const BANDS = ['FULL', 'THINNED', 'THIN', 'UNBANDED'];
function newBand() { return { dry9: 0, withNext: 0, chain: 0, trueChain: 0, phantom: 0, anomaly: 0, convos: new Set(), maxRun: 0, runs: 0, runTurns: 0, days: 0 }; }
const pooled = {}; for (const b of BANDS) pooled[b] = newBand();
let pooledConvos = 0, pooledDry9 = 0, pooledEnd = 0, pooledRec = 0, pooledWithNext = 0, pooledUnbanded = 0, pooledDry9All = 0;
for (const s of SEEDS) {
  const f = path.join(EVIDIR, `journey-social-r66-s${s}.json`);
  let r;
  try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`SEED ${s}: MISSING/UNPARSEABLE ${f}`); continue; }
  const dc = r.dryCensus || {};
  const det = dc.dry9Detail || [];
  const snaps = (r.rosterByDay || []).slice().sort((a, b) => a.day - b.day);
  const rosterOn = (day) => { let v = null; for (const sn of snaps) { if (sn.day <= day) v = sn.living; else break; } return v; };
  const bands = {}; for (const b of BANDS) bands[b] = newBand();
  for (const sn of snaps) bands[bandOf(sn.living)].days++;
  // consecutive-dry runs per conversation (detail records, consecutive turn numbers)
  const byConvo = {};
  for (const d of det) (byConvo[d.convoIdx] = byConvo[d.convoIdx] || []).push(d);
  const runByConvo = {};
  for (const [ci, list] of Object.entries(byConvo)) {
    const turns = list.map(d => d.turn).sort((a, b) => a - b);
    let best = 1, cur = 1;
    for (let i = 1; i < turns.length; i++) { if (turns[i] === turns[i - 1] + 1) cur++; else cur = 1; if (cur > best) best = cur; }
    runByConvo[ci] = best;
  }
  const drySet = new Set(det.map(d => d.convoIdx + ':' + d.turn));
  for (const d of det) {
    const b = bandOf(rosterOn(d.day));
    const bb = bands[b];
    bb.dry9++; bb.convos.add(d.convoIdx);
    if (d.followKind !== 'end') {
      bb.withNext++;
      if (d.followKind === 'another-dry') {
        bb.chain++;
        // Amendment A split: TRUE = next turn added entries AND a sibling
        // dry9 record sits at turn+1; PHANTOM = next turn added nothing
        // (stale lastLine echo); ANOMALY = anything else (investigate).
        if (d.followNextAdded >= 1 && drySet.has(d.convoIdx + ':' + (d.turn + 1))) bb.trueChain++;
        else if (d.followNextAdded === 0) bb.phantom++;
        else bb.anomaly++;
      }
    }
  }
  for (const [ci, best] of Object.entries(runByConvo)) {
    // attribute the convo's run to the band of its FIRST dry9 turn's day
    const first = byConvo[ci].slice().sort((a, b) => a.turn - b.turn)[0];
    const b = bandOf(rosterOn(first.day));
    bands[b].runs++; bands[b].runTurns += best; if (best > bands[b].maxRun) bands[b].maxRun = best;
  }
  const withNext = det.filter(d => d.followKind !== 'end');
  const rec = withNext.filter(d => d.followKind === 'substantive' || d.followKind === 'close').length;
  console.log(`SEED ${s}: days=${r.days} alive=${r.alive} convos=${dc.totalConvos} dry9=${dc.dry9Lines} dry9/convo=${dc.totalConvos ? (dc.dry9Lines / dc.totalConvos).toFixed(3) : 'n/a'} endDry9convos=${dc.dry9EndConvoCount} recovery=${rec}/${withNext.length} (${pct(rec, withNext.length)}) ctr=${dc.counterDryTotal}/${dc.counterSelfTotal} (transcript dry=${dc.totalDryLines}) rosterSnaps=${snaps.length} rosterRange=${snaps.length ? (Math.min(...snaps.map(x => x.living)) + '-' + Math.max(...snaps.map(x => x.living))) : 'n/a'}`);
  for (const b of BANDS) {
    const bb = bands[b];
    console.log(`  ${b}: dry9=${bb.dry9} withNext=${bb.withNext} chain65=${bb.chain} (${pct(bb.chain, bb.withNext)}) TRUE=${bb.trueChain} (${pct(bb.trueChain, bb.withNext)}) PHANTOM=${bb.phantom} ANOMALY=${bb.anomaly} convos=${bb.convos.size} maxRun=${bb.maxRun} meanRun=${bb.runs ? (bb.runTurns / bb.runs).toFixed(2) : 'n/a'} days=${bb.days} dry9/band-day=${bb.days ? (bb.dry9 / bb.days).toFixed(2) : 'n/a'}`);
    pooled[b].dry9 += bb.dry9; pooled[b].withNext += bb.withNext; pooled[b].chain += bb.chain; pooled[b].trueChain += bb.trueChain; pooled[b].phantom += bb.phantom; pooled[b].anomaly += bb.anomaly;
    for (const ci of bb.convos) pooled[b].convos.add(ci + '@' + s);
    pooled[b].runs += bb.runs; pooled[b].runTurns += bb.runTurns; if (bb.maxRun > pooled[b].maxRun) pooled[b].maxRun = bb.maxRun;
    pooled[b].days += bb.days;
  }
  pooledConvos += dc.totalConvos || 0; pooledDry9 += dc.dry9Lines || 0; pooledEnd += dc.dry9EndConvoCount || 0;
  pooledRec += rec; pooledWithNext += withNext.length; pooledDry9All += det.length;
  pooledUnbanded += bands.UNBANDED.dry9;
}
console.log(`POOLED: convos=${pooledConvos} dry9=${pooledDry9} dry9/convo=${pooledConvos ? (pooledDry9 / pooledConvos).toFixed(3) : 'n/a'} recovery=${pooledRec}/${pooledWithNext} (${pct(pooledRec, pooledWithNext)}) end-on-dry9=${pooledEnd} (${pct(pooledEnd, pooledConvos)}) UNBANDED=${pooledUnbanded}/${pooledDry9All} (${pct(pooledUnbanded, pooledDry9All)})`);
for (const b of BANDS) {
  const bb = pooled[b];
  console.log(`POOLED ${b}: dry9=${bb.dry9} withNext=${bb.withNext} chain65=${bb.chain} (${pct(bb.chain, bb.withNext)}) TRUE=${bb.trueChain} (${pct(bb.trueChain, bb.withNext)}) PHANTOM=${bb.phantom} ANOMALY=${bb.anomaly} convos=${bb.convos.size} maxRun=${bb.maxRun} meanRun=${bb.runs ? (bb.runTurns / bb.runs).toFixed(2) : 'n/a'} days=${bb.days} dry9/band-day=${bb.days ? (bb.dry9 / bb.days).toFixed(2) : 'n/a'}`);
}
const full = pooled.FULL, thin = pooled.THIN;
const diff = (thin.withNext && full.withNext) ? (100 * thin.trueChain / thin.withNext - 100 * full.trueChain / full.withNext) : null;
console.log(`VERDICT-CHAIN-TRACKS (TRUE chains, amendment A): ${thin.withNext >= 30 && full.withNext >= 30 ? (diff >= 5 ? 'TRACKS' : 'NO-TRACK') : 'INSUFFICIENT-DATA'} (thin TRUE ${pct(thin.trueChain, thin.withNext)} n=${thin.withNext} vs full TRUE ${pct(full.trueChain, full.withNext)} n=${full.withNext}, diff=${diff === null ? 'n/a' : diff.toFixed(1) + 'pp'} bar >=5pp, n>=30 each)`);
console.log(`REPORT chain65 (r65 definition, NOT the verdict series): thin ${pct(thin.chain, thin.withNext)} vs full ${pct(full.chain, full.withNext)}`);
console.log(`VERDICT-REPLICATION: ${pooledConvos && pooledDry9 / pooledConvos >= 0.20 && pooledDry9 / pooledConvos <= 0.40 ? 'IN-BAND' : 'OUT-OF-BAND'} (dry9/convo band [0.20, 0.40])`);
console.log(`VERDICT-RECOVERY: ${pooledWithNext && pooledRec / pooledWithNext >= 0.85 && pooledConvos && pooledEnd / pooledConvos < 0.05 ? 'HESITATION' : 'WART'} (recovery ${pct(pooledRec, pooledWithNext)} bar >=85%; end-on-dry9 ${pct(pooledEnd, pooledConvos)} bar <5%)`);
