#!/usr/bin/env node
// analyze-overtimehonest-20261021.js — verdict for the OVERTIME HONESTY run
// (lane B endgame r34). Reads evidence/2026-10-21/perseed-overtime/*.json.
//
// PRIMARY (binding): on every run reaching overtime tier >= 2, each staged
// tier (1..maxTier) is announced aloud (one ◈ OVERTIME detail line) AND the
// overtime_tier telemetry event fires with the matching tier. GO = 0 silent
// tiers, 0 telemetry mismatches across all runs. A silent tier is NO-GO.
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-overtime');
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && f.startsWith('overtime-r34-'));
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));

let silent = 0, teleMiss = 0, announced = 0, teleOk = 0;
const lines = [];
for (const r of recs) {
  const tiers = [];
  for (let t = 1; t <= r.maxTier; t++) {
    const spoke = r.tierLines.some(tl => tl.tier === t);
    const tele = r.teleTiers.some(tt => tt.tier === t);
    tiers.push(`${t}:${spoke ? 'voiced' : 'SILENT'}/${tele ? 'tele' : 'no-tele'}`);
    if (!spoke) silent++;
    if (!tele) teleMiss++;
    if (spoke) announced++;
    if (tele) teleOk++;
  }
  const raidByTier = {};
  for (const rd of r.raidDays) {
    const d = r.days.find(x => x[0] >= rd);
    const k = d ? 't' + d[1] : '?';
    raidByTier[k] = (raidByTier[k] || 0) + 1;
  }
  const wf = Object.keys(r.waveFirst || {}).map(mid => `${mid}(w${r.waveFirst[mid].wave}@d${r.waveFirst[mid].day})`).join(',') || '-';
  lines.push(`seed=${r.seed} announce=${r.announceDay} sat=${r.satDay}(${r.satSeatKind || '?'}) maxTier=${r.maxTier}` +
    ` tiers[${tiers.join(' ')}] reruns=${r.rerunFights.length} raids=${r.raidDays.length}${JSON.stringify(raidByTier)}` +
    ` w4+firsts=[${wf}] wavesAnn=${JSON.stringify(r.wavesAtAnnounce)} wavesEnd=${JSON.stringify(r.wavesEnd)} penalty=${r.satPenalty ? JSON.stringify(r.satPenalty) : '-'} won=${r.won} end=${r.endReason}`);
}
console.log('=== OVERTIME HONESTY — per-seed ===');
for (const l of lines) console.log(l);
console.log('\n=== PRIMARY (binding) ===');
console.log(`announced tiers: ${announced}, silent tiers: ${silent}`);
console.log(`telemetry matched: ${teleOk}, telemetry missing: ${teleMiss}`);
const goRuns = recs.filter(r => r.maxTier >= 2).length;
console.log(`runs at tier>=2: ${goRuns}/${recs.length}`);
console.log(silent === 0 && teleMiss === 0
  ? `PRIMARY: GO — every staged tier on every run voiced aloud + telemetry matched (${announced}/${announced + silent} tiers, ${goRuns} run(s) reached tier>=2)`
  : 'PRIMARY: NO-GO — see silent/missing lines above');
console.log('\n=== RERUN fights (teeth) ===');
for (const r of recs) {
  for (const f of r.rerunFights) console.log(`seed=${r.seed} day=${f.day} tier=${f.tier} monsters=${f.monsters.join(',')}`);
}
console.log('\n=== raid days by tier period ===');
for (const r of recs) console.log(`seed=${r.seed} raids@${r.raidDays.join(',')}`);
