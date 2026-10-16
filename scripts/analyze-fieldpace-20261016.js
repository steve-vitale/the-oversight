#!/usr/bin/env node
'use strict';
// analyze-fieldpace-20261016.js — aggregate the wave-4/5 pacing census.
//
// Reads evidence/2026-10-16/perseed-fieldpace/<policy>-s<seed>.json (16 runs:
// 8 fresh seeds x {leadfeast, belongfeast}) and reports the pre-registered
// primary: one-round-kill share by wave, round-of-death distribution, median
// fight length, top-5 killer species, channel split, attribution rate, wall
// numbers, and the residue diagnosis.
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldpace');

const files = fs.readdirSync(EVID).filter((f) => f.endsWith('.json')).sort();
if (!files.length) { console.error('no per-seed files'); process.exit(2); }

const agg = {
  runs: 0, days: 0,
  wave45Deaths: 0, monsterVerbVillagerDeaths: 0,
  w4: [], w5: [], w6: [],
  fightsW45: [],
  killers: {},
  channel: { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0, unattributed: 0 },
  chanByWave: { 4: { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0 }, 5: { RAID: 0, EXPEDITION: 0, 'WILD-ENCOUNTER': 0 } },
  residue: [],
  residueReasons: {},
  national: 0, table: 0, wins: 0, exiled: 0, maxWave: 0,
  orkFightLens: [], // fight rounds for ORK deaths
};

for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  agg.runs++;
  agg.days += o.gameDays || 0;
  agg.national += o.national || 0;
  agg.table += o.table || 0;
  agg.wins += o.wins || 0;
  agg.exiled += o.exiled || 0;
  agg.maxWave = Math.max(agg.maxWave, o.maxWave || 0);
  agg.monsterVerbVillagerDeaths += (o.summary && o.summary.monsterVerbVillagerDeaths) || 0;
  for (const d of o.deaths || []) {
    agg.wave45Deaths++;
    (agg['w' + d.wave] = agg['w' + d.wave] || []).push(d);
    agg.killers[d.mId] = (agg.killers[d.mId] || 0) + 1;
    agg.channel[d.channel] = (agg.channel[d.channel] || 0) + 1;
    if (agg.chanByWave[d.wave]) agg.chanByWave[d.wave][d.channel] = (agg.chanByWave[d.wave][d.channel] || 0) + 1;
  }
  for (const r of o.residue || []) {
    agg.residue.push(Object.assign({ file: f }, r));
    agg.residueReasons[r.reason] = (agg.residueReasons[r.reason] || 0) + 1;
  }
}

// Fight-length stats need the per-fight records; they are persisted in the
// per-seed files under `fights`.
const allFights = [];
for (const f of files) {
  const o = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  for (const fr of o.fights || []) allFights.push(fr);
}
const nonPlayerFights = allFights.filter((fr) => !fr.player);
const frRounds = nonPlayerFights.map((fr) => fr.rounds).sort((a, b) => a - b);
const frMedian = frRounds.length ? frRounds[Math.floor(frRounds.length / 2)] : null;
const frOutcomes = nonPlayerFights.reduce((m, fr) => { m[fr.outcome] = (m[fr.outcome] || 0) + 1; return m; }, {});
const frByWave = {};
for (const fr of nonPlayerFights) {
  const k = 'w' + fr.wave;
  frByWave[k] = frByWave[k] || { rounds: [], outcomes: {} };
  frByWave[k].rounds.push(fr.rounds);
  frByWave[k].outcomes[fr.outcome] = (frByWave[k].outcomes[fr.outcome] || 0) + 1;
}
const frMedianW = (k) => {
  const r = (frByWave[k] || { rounds: [] }).rounds.sort((a, b) => a - b);
  return r.length ? r[Math.floor(r.length / 2)] : null;
};

const share = (arr) => arr.length ? arr.filter((d) => d.oneRoundKill).length / arr.length : null;
const hist = (arr) => {
  const h = {};
  for (const d of arr) h[d.roundOfDeath] = (h[d.roundOfDeath] || 0) + 1;
  return h;
};
const pct = (x) => x == null ? 'n/a' : (x * 100).toFixed(1) + '%';

console.log('=== FIELD PACE CENSUS (wave-4/5 field fights, pre-seat substrate) ===');
console.log(`runs: ${agg.runs} (8 fresh seeds x leadfeast/belongfeast), 180d death-aware`);
console.log(`wall: national ${agg.national}/${agg.runs} table ${agg.table}/${agg.runs} wins ${agg.wins}/${agg.runs} exiled ${agg.exiled}/${agg.runs} maxWave ${agg.maxWave}`);
console.log('');
console.log(`monster-verb villager deaths (population): ${agg.monsterVerbVillagerDeaths}`);
console.log(`attributed wave-4/5 field-fight deaths: ${agg.wave45Deaths}  (rate ${pct(agg.wave45Deaths / Math.max(1, agg.monsterVerbVillagerDeaths))})`);
console.log(`  w4: ${agg.w4.length}  w5: ${agg.w5.length}  w6: ${agg.w6.length}`);
console.log('');
console.log(`one-round-kill share — w4: ${pct(share(agg.w4))} (${agg.w4.filter((d) => d.oneRoundKill).length}/${agg.w4.length})`);
console.log(`one-round-kill share — w5: ${pct(share(agg.w5))} (${agg.w5.filter((d) => d.oneRoundKill).length}/${agg.w5.length})`);
console.log('');
console.log('round-of-death distribution — w4:', JSON.stringify(hist(agg.w4)));
console.log('round-of-death distribution — w5:', JSON.stringify(hist(agg.w5)));
console.log('');
console.log(`wave-4/5 field fights recorded (non-player): ${nonPlayerFights.length}; median rounds all: ${frMedian}`);
console.log(`  per-wave: w4 n=${(frByWave.w4 || { rounds: [] }).rounds.length} med=${frMedianW('w4')} outcomes=${JSON.stringify((frByWave.w4 || { outcomes: {} }).outcomes)}`);
console.log(`  per-wave: w5 n=${(frByWave.w5 || { rounds: [] }).rounds.length} med=${frMedianW('w5')} outcomes=${JSON.stringify((frByWave.w5 || { outcomes: {} }).outcomes)}`);
console.log(`  outcomes (all): ${JSON.stringify(frOutcomes)}`);
console.log('');
console.log('top killer species (canonical m.id):',
  Object.entries(agg.killers).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([k, v]) => `${k}=${v}`).join(', '));
console.log('');
console.log('channel split (all attributed):', JSON.stringify(agg.channel));
console.log('  w4:', JSON.stringify(agg.chanByWave[4]));
console.log('  w5:', JSON.stringify(agg.chanByWave[5]));
console.log('');
console.log(`residue: ${agg.residue.length} — reasons:`, JSON.stringify(agg.residueReasons));
for (const r of agg.residue.slice(0, 15)) {
  console.log(`  residue: ${r.file} d${r.day} vid=${r.vid} monsterId=${r.monsterId} waveById=${r.waveByMonsterId} src=${r.src} via=${r.via} reason=${r.reason}`);
}
console.log('');
console.log('EXAMPLE fight logs (sense-read): stored in per-seed files under `examples` (up to 3 vDie fights).');
