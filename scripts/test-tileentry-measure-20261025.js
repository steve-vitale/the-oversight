#!/usr/bin/env node
// scripts/test-tileentry-measure-20261025.js — sim-tileentry-a measurement.
// Computes the pre-registered PRIMARY + guards from spawnsrc-sweep rows
// (raftdraft census) WITHOUT the poolpres analyzer's row-shape gate
// (that analyzer requires a top-level row.diag that spawnsrc rows do
// not carry; the numbers below are computed from the same fields it
// reads: livingN, w3plusPool, raiders[].wave, poolByWave).
// Usage: CTL=<control dir> ARM=<armed dir> node scripts/test-tileentry-measure-20261025.js
// Prints one band block per dir plus a GO/NO-GO verdict line for the
// armed band against the control band. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
function medianOf(a) { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }
function band(dir) {
  const rows = SEEDS.map(s => JSON.parse(fs.readFileSync(path.join(dir, `s${s}-armed.json`), 'utf8')));
  const raids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raids.push(x);
  const poolTotal = raids.reduce((t, r) => t + (r.livingN || 0), 0);
  const poolW3 = raids.reduce((t, r) => t + (r.w3plusPool || []).length, 0);
  const poolW5 = raids.reduce((t, r) => t + ((r.poolByWave || {})['5'] || 0) + ((r.poolByWave || {})['6'] || 0), 0);
  const draftedW3 = raids.reduce((t, r) => t + (r.raiders || []).filter(x => (x.wave || 1) >= 3).length, 0);
  const raiders = raids.reduce((t, r) => t + (r.raiders || []).length, 0);
  const raidsWithW3Drafted = raids.filter(r => (r.raiders || []).some(x => (x.wave || 1) >= 3)).length;
  const tileBirths = rows.reduce((t, r) => t + (r.spawnsrc.spawns || []).filter(s => s.src === 'tile-entry').length, 0);
  const tileW3Births = rows.reduce((t, r) => t + (r.spawnsrc.spawns || []).filter(s => s.src === 'tile-entry' && (s.wave || 1) >= 3).length, 0);
  const perSeed = rows.map(r => ({ seed: r.seed, days: r.days, raids: (r.raftdraft.raids || []).length, raiders: (r.raftdraft.raids || []).reduce((t, x) => t + (x.raiders || []).length, 0), won: r.won, natEver: r.nationalEver, deaths: r.deathTotal, waveReach: r.waveReach }));
  return {
    n: rows.length, raids: raids.length, raiders, poolTotal, poolW3,
    poolW3Share: poolTotal ? poolW3 / poolTotal : 0,
    poolW5, draftedW3, w3plusPerRaid: raids.length ? draftedW3 / raids.length : 0,
    raidsWithW3Drafted, tileBirths, tileW3Births,
    won: rows.reduce((t, r) => t + r.won, 0),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: medianOf(rows.map(r => r.days)),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    perSeed,
  };
}
function printBand(label, b) {
  console.log(`${label}: raids=${b.raids} raiders=${b.raiders} poolTotal=${b.poolTotal} poolW3=${b.poolW3} poolW3Share=${(b.poolW3Share * 100).toFixed(2)}% poolW5=${b.poolW5} draftedW3=${b.draftedW3} w3plusPerRaid=${b.w3plusPerRaid.toFixed(3)} raidsWithW3Drafted=${b.raidsWithW3Drafted}/${b.raids} tileBirths=${b.tileBirths} tileW3Births=${b.tileW3Births}`);
  console.log(`${label} WALL: won=${b.won}/8 natEver=${b.nationalEver}/8 natFinal=${b.nationalFinal}/8 table=${b.table}/8 entered=${b.entered}/8 wave3=${b.wave3}/8 wave4=${b.wave4}/8 wave5=${b.wave5}/8 medDays=${b.medianDays} deaths=${b.deathTotal} starv=${b.starvationTotal}`);
  for (const s of b.perSeed) console.log(`  seed ${s.seed}: days=${s.days} raids=${s.raids} raiders=${s.raiders} won=${s.won} natEver=${s.natEver} deaths=${s.deaths} wave=${s.waveReach}`);
}
const ctlDir = process.env.CTL, armDir = process.env.ARM;
if (!ctlDir || !armDir) { console.error('usage: CTL=<dir> ARM=<dir> node scripts/test-tileentry-measure-20261025.js'); process.exit(2); }
const c = band(ctlDir), a = band(armDir);
printBand('CONTROL', c);
printBand('ARMED  ', a);
const sharePass = a.poolW3Share >= 0.23, draftedPass = a.w3plusPerRaid >= 0.9;
const winsPass = a.won >= 3, natPass = a.nationalEver >= 6, deathsPass = Math.abs(a.deathTotal - c.deathTotal) <= 0.20 * c.deathTotal;
console.log(`VERDICT: share ${sharePass ? 'PASS' : 'FAIL'} (${(a.poolW3Share * 100).toFixed(2)}% vs >=23%) | drafted/raid ${draftedPass ? 'PASS' : 'FAIL'} (${a.w3plusPerRaid.toFixed(3)} vs >=0.9) | wins ${winsPass ? 'PASS' : 'FAIL'} (${a.won} vs >=3) | natEver ${natPass ? 'PASS' : 'FAIL'} (${a.nationalEver} vs >=6) | deaths ${deathsPass ? 'PASS' : 'FAIL'} (${a.deathTotal} vs control ${c.deathTotal} ±20% [${(0.8 * c.deathTotal).toFixed(1)}, ${(1.2 * c.deathTotal).toFixed(1)}]) -> ${sharePass && draftedPass && winsPass && natPass && deathsPass ? 'GO' : 'NO-GO'}`);
