#!/usr/bin/env node
// analyze-counterwired-20261016.js — the sim-counterwired census analyzer.
// Reads evidence/2026-10-16/perseed-counterwired/*.json and prints:
//   PRIMARY (binding): attribution % — counter-discovery events + counter-kill
//     events attributable by wave (id/mid → def wave). GO >= 95%.
//   (a) discovery by wave × channel × actor
//   (b) discovery→kill conversion by wave (kills after discovery vs before;
//       brute-force kills of the same species in no-discovery runs)
//   (c) survival differential: wave-3+ trick known vs not (field-death rate,
//       median survival)
//   (d) villager (non-scholar) counter executions (trickSummary on kills)
//   (e) wiring verdict inputs + wall numbers
'use strict';
const fs = require('fs');
const path = require('path');
const CENSUS = require('./census-counterwired-20261016.js');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-counterwired');
const byId = Object.fromEntries(CENSUS.census().map(r => [r.id, { wave: r.wave, name: r.name, kind: r.kind }]));
const waveOf = (id) => (byId[id] ? byId[id].wave : null);

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
const runs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
console.log(`runs: ${runs.length} (${files.join(' ').slice(0, 120)}...)`);

// ---------- PRIMARY: attribution ----------
let discTotal = 0, discAttr = 0, killTotal = 0, killAttr = 0;
for (const r of runs) {
  for (const e of (r.counterDiscovered || [])) { discTotal++; if (e.id && waveOf(e.id) != null) discAttr++; }
  for (const k of (r.kills || [])) { killTotal++; if (k.mid && waveOf(k.mid) != null) killAttr++; }
}
const attrPct = ((discAttr + killAttr) / Math.max(1, discTotal + killTotal)) * 100;
console.log(`\n== PRIMARY (binding) ==`);
console.log(`discovery events: ${discAttr}/${discTotal} wave-attributable`);
console.log(`kill events: ${killAttr}/${killTotal} wave-attributable`);
console.log(`ATTRIBUTION = ${attrPct.toFixed(1)}%  (GO >= 95%)  -> ${attrPct >= 95 ? 'GO' : 'NO-GO'}`);

// ---------- (a) discovery by wave / channel / actor ----------
console.log(`\n== (a) DISCOVERY ==`);
const discByWave = {}, discByVia = {}, discSpecies = {};
for (const r of runs) {
  for (const e of (r.counterDiscovered || [])) {
    const w = 'w' + (waveOf(e.id) || '?');
    discByWave[w] = (discByWave[w] || 0) + 1;
    discByVia[e.via || '?'] = (discByVia[e.via || '?'] || 0) + 1;
    discSpecies[e.id] = discSpecies[e.id] || { w, via: {} };
    discSpecies[e.id].via[e.via || '?'] = (discSpecies[e.id].via[e.via || '?'] || 0) + 1;
  }
}
console.log('by wave:', JSON.stringify(discByWave));
console.log('by channel (via):', JSON.stringify(discByVia));
console.log('distinct species discovered:', Object.keys(discSpecies).length, 'of', Object.keys(byId).length);
const speciesWave = {};
for (const [id, s] of Object.entries(discSpecies)) speciesWave[s.w] = (speciesWave[s.w] || 0) + 1;
console.log('distinct species by wave:', JSON.stringify(speciesWave));
console.log('w3+ species ever discovered:', Object.keys(discSpecies).filter(id => (waveOf(id) || 1) >= 3));

// ---------- (b) discovery→kill conversion ----------
console.log(`\n== (b) DISCOVERY→KILL CONVERSION ==`);
// For each species discovered in ≥1 run: kills after vs before discovery,
// and brute-force kills of the same species in runs where it was never discovered.
const conv = {};
for (const r of runs) {
  const discDay = {}; // first discovery day per species in this run
  for (const e of (r.counterDiscovered || [])) {
    if (discDay[e.id] == null || e.day < discDay[e.id]) discDay[e.id] = e.day;
  }
  for (const k of (r.kills || [])) {
    const c = conv[k.mid] = conv[k.mid] || { w: k.w, discoveredRuns: 0, killsAfter: 0, killsBefore: 0, brute: 0, trick: 0, villagerTrick: 0, scholarKills: 0, villagerKills: 0 };
    if (discDay[k.mid] != null) {
      if (k.d >= discDay[k.mid]) c.killsAfter++; else c.killsBefore++;
      if (k.trick) c.trick++;
      if (k.trick && !k.byScholar) c.villagerTrick++;
    } else {
      c.brute++;
    }
    if (k.byScholar) c.scholarKills++; else c.villagerKills++;
  }
}
const discSpeciesList = Object.keys(conv).filter(id => conv[id].killsAfter + conv[id].killsBefore > 0);
let totAfter = 0, totBefore = 0, totBrute = 0, totTrick = 0, totVTrick = 0;
for (const id of discSpeciesList) { totAfter += conv[id].killsAfter; totBefore += conv[id].killsBefore; totBrute += conv[id].brute; totTrick += conv[id].trick; totVTrick += conv[id].villagerTrick; }
console.log(`species with discoveries: ${discSpeciesList.length}`);
console.log(`kills AFTER discovery: ${totAfter} | kills BEFORE discovery: ${totBefore} | brute-force (never discovered): ${totBrute}`);
console.log(`counter-executed kills (trickSummary): ${totTrick} — by villagers: ${totVTrick}`);
const byWaveConv = {};
for (const id of discSpeciesList) {
  const w = 'w' + (conv[id].w || '?');
  byWaveConv[w] = byWaveConv[w] || { species: 0, after: 0, before: 0, brute: 0, trick: 0, vtrick: 0 };
  byWaveConv[w].species++; byWaveConv[w].after += conv[id].killsAfter; byWaveConv[w].before += conv[id].killsBefore;
  byWaveConv[w].brute += conv[id].brute; byWaveConv[w].trick += conv[id].trick; byWaveConv[w].vtrick += conv[id].villagerTrick;
}
console.log('conversion by wave:', JSON.stringify(byWaveConv, null, 1));
const noDiscSpecies = Object.keys(conv).filter(id => conv[id].killsAfter + conv[id].killsBefore === 0 && conv[id].brute > 0);
console.log(`species killed ONLY by brute force (${noDiscSpecies.length}):`, noDiscSpecies.slice(0, 20).join(', '));

// ---------- (c) survival differential: wave-3+ trick known vs not ----------
console.log(`\n== (c) SURVIVAL DIFFERENTIAL (wave-3+ trick known vs not) ==`);
const with3 = runs.filter(r => r.wave3plusTrickKnown === 1);
const without3 = runs.filter(r => r.wave3plusTrickKnown !== 1);
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const stat = (set, label) => {
  const days = set.map(r => r.days);
  const field = set.reduce((n, r) => n + r.deaths, 0);
  const perRun = field / Math.max(1, set.length);
  console.log(`${label}: n=${set.length} medianSurvival=${med(days)}d maxSurvival=${Math.max(...days, 0)}d fieldDeaths/run=${perRun.toFixed(2)} wins=${set.reduce((n, r) => n + r.wins, 0)} national=${set.reduce((n, r) => n + r.national, 0)}`);
};
stat(with3, 'wave-3+ trick known ');
stat(without3, 'wave-3+ trick NOT known');

// ---------- (d) villager counter executions ----------
console.log(`\n== (d) VILLAGER (non-scholar) COUNTER EXECUTIONS ==`);
let vTrickTotal = 0, sTrickTotal = 0;
const vTrickByWave = {};
for (const r of runs) {
  for (const k of (r.kills || [])) {
    if (!k.trick) continue;
    if (k.byScholar) sTrickTotal++;
    else { vTrickTotal++; const w = 'w' + (k.w || '?'); vTrickByWave[w] = (vTrickByWave[w] || 0) + 1; }
  }
}
console.log(`trick-executed kills: scholar=${sTrickTotal} villagers=${vTrickTotal} by wave:`, JSON.stringify(vTrickByWave));
console.log(`answer (d): ${vTrickTotal > 0 ? 'YES — villagers execute counters' : 'NO — no villager ever executed a counter'} (${vTrickTotal} kills with trickSummary, non-scholar)`);

// ---------- (e) wall numbers ----------
console.log(`\n== (e) WALL NUMBERS ==`);
const nat = runs.reduce((n, r) => n + r.national, 0);
const tab = runs.reduce((n, r) => n + r.table, 0);
const wins = runs.reduce((n, r) => n + r.wins, 0);
const maxW = Math.max(...runs.map(r => r.maxWave), 1);
const faced = [...new Set(runs.flatMap(r => r.wavesFaced || []))].sort();
const daysAll = runs.map(r => r.days);
console.log(`runs=${runs.length} national=${nat} table=${tab} wins=${wins} maxWaveUnlocked=${maxW} wavesFaced=[${faced}] medianSurvival=${med(daysAll)}d maxSurvival=${Math.max(...daysAll)}d`);
const causes = {};
for (const r of runs) for (const [c, n] of Object.entries(r.deathCauses || {})) causes[c] = (causes[c] || 0) + n;
const causeTop = Object.entries(causes).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log('top death causes:', JSON.stringify(causeTop));
console.log('discoveries/channel by policy:');
for (const p of [...new Set(runs.map(r => r.policyId))]) {
  const pr = runs.filter(r => r.policyId === p);
  console.log(`  ${p}: disc=${pr.reduce((n, r) => n + r.nDiscovered, 0)} obs=${pr.reduce((n, r) => n + r.nObserved, 0)} species=${new Set(pr.flatMap(r => (r.counterDiscovered || []).map(e => e.id))).size}`);
}
