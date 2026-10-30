#!/usr/bin/env node
// scripts/sim-fullseatgate-a-analyze.js — full-seat gate decomposition
// analyzer (arm sim-fullseatgate-a). Pure function over per-seed
// rows: no game reads, no RNG. Judges NOTHING by itself — it reports
// counts; the verdict against the prereg is computed in verdict()
// from those counts so the proof test can pin it.
'use strict';
const fs = require('fs');
const path = require('path');

const FULL_COMPONENTS = ['waves', 'contests', 'crises', 'scale', 'stageOk', 'foodDeeds'];
const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2 };

function analyzeRows(rows) {
  const seeds = rows.map(r => r.seed).sort((a, b) => a - b);
  const tableRows = rows.filter(r => r.table === 1);
  const withVector = tableRows.filter(r => r.atTable && r.atTable.full);
  const misses = tableRows.filter(r => !(r.atTable && r.atTable.full)).map(r => r.seed);
  const compFail = {}, compPass = {};
  for (const c of FULL_COMPONENTS) { compFail[c] = 0; compPass[c] = 0; }
  const waveShort = { w1: [], w2: [], w3: [], w4: [], w5: [] };
  const perSeed = [];
  for (const r of withVector) {
    const f = r.atTable.full;
    const fails = [], passes = [];
    for (const c of FULL_COMPONENTS) { if (f[c]) { compPass[c]++; passes.push(c); } else { compFail[c]++; fails.push(c); } }
    const short = {};
    for (const k of ['w1', 'w2', 'w3', 'w4', 'w5']) { short[k] = Math.max(0, BARS[k] - (f[k] | 0)); waveShort[k].push(short[k]); }
    perSeed.push({ seed: r.seed, seatAtTable: r.seatAtTable, fullOk: !!f.ok, fails, passes, counts: { w1: f.w1, w2: f.w2, w3: f.w3, w4: f.w4, w5: f.w5, contestsN: f.contestsN, crisesN: f.crisesN, rank: f.rank, stage: f.stage, foodDeeds: f.foodDeeds }, shortfall: short, lesserOk: !!(r.atTable.lesserOk), lesserFails: r.atTable.lesser ? Object.keys(r.atTable.lesser).filter(k => !r.atTable.lesser[k]) : null, doors: r.atTable.doors || null, dayAtTable: r.atTable.day, endSeat: r.seatAtEnd, endFullOk: !!(r.endVector && r.endVector.full && r.endVector.full.ok), won: r.won });
  }
  const n = withVector.length;
  const ranked = FULL_COMPONENTS.map(c => ({ component: c, fail: compFail[c], pass: compPass[c], failShare: n ? compFail[c] / n : 0 })).sort((a, b) => b.fail - a.fail);
  const waveMeanShort = {};
  for (const k of ['w1', 'w2', 'w3', 'w4', 'w5']) waveMeanShort[k] = waveShort[k].length ? waveShort[k].reduce((a, b) => a + b, 0) / waveShort[k].length : null;
  const waveEverShort = {};
  for (const k of ['w1', 'w2', 'w3', 'w4', 'w5']) waveEverShort[k] = waveShort[k].filter(s => s > 0).length;
  const lateFull = rows.filter(r => r.endVector && r.endVector.full && r.endVector.full.ok && !(r.atTable && r.atTable.full && r.atTable.full.ok)).map(r => r.seed);
  const days = rows.map(r => r.gameDays || r.days || 0).filter(Number.isFinite).sort((a, b) => a - b);
  const median = days.length ? days[Math.floor(days.length / 2)] : null;
  const wall = {
    seeds: rows.length, nationalEver: rows.filter(r => r.nationalEver === 1).length,
    nationalFinal: rows.filter(r => r.nationalFinal === 1).length,
    table: tableRows.length, entered: rows.filter(r => r.entered === 1).length,
    wins: rows.filter(r => r.won === 1).length,
    winsFull: rows.filter(r => r.won === 1 && r.seatAtEnd === 'full').length,
    winsLesser: rows.filter(r => r.won === 1 && r.seatAtEnd === 'lesser').length,
    winsOther: rows.filter(r => r.won === 1 && r.seatAtEnd !== 'full' && r.seatAtEnd !== 'lesser').length,
    waveReach: { 1: rows.filter(r => r.waveReach >= 1).length, 2: rows.filter(r => r.waveReach >= 2).length, 3: rows.filter(r => r.waveReach >= 3).length, 4: rows.filter(r => r.waveReach >= 4).length, 5: rows.filter(r => r.waveReach >= 5).length },
    medianSurvival: median, maxSurvival: days.length ? days[days.length - 1] : null,
  };
  return { seeds, tableSeeds: tableRows.map(r => r.seed), vectorSeeds: withVector.map(r => r.seed), misses, nVectors: n, compFail, compPass, ranked, waveMeanShort, waveEverShort, perSeed, lateFull, wall };
}

// verdict(a, band): band = 'pilot' | 'confirm'. Pilot verdict needs
// only the pilot gate + dominant/DIAG shape; confirm verdict checks
// reproduction of a pilot GO dominant component.
function verdict(a, band, pilotDominant) {
  const tableN = a.tableSeeds.length;
  const captureRate = tableN ? a.nVectors / tableN : 0;
  if (band === 'pilot') {
    if (tableN < 5) return { verdict: 'PILOT-FAILED', reason: `table ${tableN}/8 < 5 floor` };
    if (captureRate < 0.9) return { verdict: 'PILOT-FAILED', reason: `capture ${a.nVectors}/${tableN} < 90%` };
    const dom = a.ranked[0];
    const othersOverHalf = a.ranked.slice(1).filter(r => r.fail > a.nVectors / 2);
    if (dom && dom.fail === a.nVectors && othersOverHalf.length === 0) return { verdict: 'GO', dominant: dom.component, reason: `dominant ${dom.component} fails ${dom.fail}/${a.nVectors}, no other component over half` };
    return { verdict: 'DIAG-GO', reason: `no dominant gate; ranked: ${a.ranked.map(r => `${r.component} ${r.fail}/${a.nVectors}`).join(', ')}` };
  }
  // confirm
  if (pilotDominant) {
    const row = a.ranked.find(r => r.component === pilotDominant);
    const fail = row ? row.fail : 0;
    if (a.tableSeeds.length >= 8 ? fail >= 7 : fail === a.nVectors && a.nVectors > 0) return { verdict: 'GO-CONFIRMED', dominant: pilotDominant, reason: `${pilotDominant} fails ${fail}/${a.nVectors} on confirm` };
    if (a.nVectors > 0 && fail < a.nVectors / 2) return { verdict: 'NO-GO', reason: `pilot-dominant ${pilotDominant} fails only ${fail}/${a.nVectors} on confirm — contradicted` };
    return { verdict: 'NO-GO', reason: `pilot-dominant ${pilotDominant} fails ${fail}/${a.nVectors} on confirm — below confirm bar` };
  }
  return { verdict: 'DIAG-GO', reason: `confirm ranked: ${a.ranked.map(r => `${r.component} ${r.fail}/${a.nVectors}`).join(', ')}` };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const rows = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return analyzeRows(rows);
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: sim-fullseatgate-a-analyze.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 1));
}
module.exports = { analyzeRows, analyzeDir, verdict, FULL_COMPONENTS, BARS };
