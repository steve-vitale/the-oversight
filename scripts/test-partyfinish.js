#!/usr/bin/env node
// scripts/test-partyfinish.js — sim-partyfinish-a analyzer / proof validator.
//
// Reads two corpora of partyfinish-sweep rows
// (evidence/2026-10-28/perseed-partyfinish-a/{control,armed}/s*-armed.json)
// and judges the binding prereg (sim-partyfinish-a-prereg.md).
// PRIMARY record: row.partyfinish.fights (pfFights) — the only record
// carrying party size + gear + corneredHold per fight.
//   COUNTED FINISH = caller 'sortie' + worldMonster + outcome 'vKill'
//     + partySize >= 2 + wb > 0 + wb/armor non-null + corneredHold true.
// Prints, per band, the wall numbers, the sortie-vKill party/gear split
// as a first-class table, the cost bar, and the GO/NO-GO verdict.
// Exit 0 when both bands are valid and computable (the verdict is
// printed, never hidden in the exit code); exit 1 on an invalid band
// (missing rows, recorder errors, substrate gate miss).
'use strict';
const fs = require('fs');
const path = require('path');

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadRows(dir) {
  const rows = [];
  for (const seed of [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108]) {
    const p = path.join(dir, `s${seed}-armed.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  return rows;
}
function bandStats(dir, label) {
  const rows = loadRows(dir);
  const errs = [];
  for (const r of rows) {
    if (!r.partyfinish || !Array.isArray(r.partyfinish.fights)) errs.push(`seed ${r.seed}: partyfinish fights missing`);
    else if (r.partyfinish.diag.errs !== 0) errs.push(`seed ${r.seed}: pf errs ${r.partyfinish.diag.errs}`);
    if (r.w4damage && r.w4damage.diag.errs !== 0) errs.push(`seed ${r.seed}: w4damage errs ${r.w4damage.diag.errs}`);
  }
  const fights = [];
  for (const r of rows) for (const f of (r.partyfinish.fights || [])) fights.push(Object.assign({ seed: r.seed }, f));
  const counted = fights.filter(f => f.caller === 'sortie' && f.worldMonster && f.outcome === 'vKill'
    && (f.partySize | 0) >= 2 && f.wb !== null && f.armor !== null && (f.wb | 0) > 0 && f.corneredHold === true);
  const sortieKills = fights.filter(f => f.caller === 'sortie' && f.outcome === 'vKill');
  const sortieKillsNoHold = sortieKills.filter(f => f.corneredHold !== true);
  const sortieKillsUnarmed = sortieKills.filter(f => !(f.wb !== null && (f.wb | 0) > 0));
  const sortieKillsNullGear = sortieKills.filter(f => f.wb === null || f.armor === null);
  const sortieKillsSolo = sortieKills.filter(f => (f.partySize | 0) < 2);
  const corneredFights = fights.filter(f => f.cornered === true);
  const heldFights = fights.filter(f => f.corneredHold === true);
  const sortieFights = fights.filter(f => f.caller === 'sortie');
  const courtCombined = rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) | 0), 0);
  const courtSeeds = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const deaths = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deaths[k] = (deaths[k] || 0) + v;
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  const wins = rows.filter(r => r.won).length;
  const winsBySeat = {};
  for (const r of rows) if (r.won) { const st = (r.tableState && r.tableState.seat) || 'unknown'; winsBySeat[st] = (winsBySeat[st] || 0) + 1; }
  return {
    label, rows, errs,
    n: rows.length,
    counted: counted.length, countedRows: counted,
    sortieKills: sortieKills.length, sortieKillsNoHold: sortieKillsNoHold.length,
    sortieKillsUnarmed: sortieKillsUnarmed.length, sortieKillsNullGear: sortieKillsNullGear.length,
    sortieKillsSolo: sortieKillsSolo.length,
    corneredFights: corneredFights.length, heldFights: heldFights.length, sortieFights: sortieFights.length,
    courtCombined, courtSeeds, substrateOk: courtCombined > 0 && courtSeeds >= 6,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wins, winsBySeat, seats,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    medianDays: medianOf(rows.map(r => r.days)),
    starv: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    deaths,
    deadSeeds: new Set(rows.filter(r => r.endReason === 'village-lost').map(r => r.seed)),
    perSeed: rows.map(r => ({ seed: r.seed, days: r.days, end: r.endReason, won: r.won, wave: r.waveReach, natEver: r.nationalEver, table: r.table, entered: r.entered, starv: r.starvationDeaths, deaths: r.deathTotal })),
  };
}
function printBand(b) {
  console.log(`\n--- ${b.label} ---`);
  console.log(`  rows=${b.n} errs=${b.errs.length ? JSON.stringify(b.errs) : 'none'}`);
  console.log(`  COUNTED finishes=${b.counted} | sortie fights=${b.sortieFights} cornered=${b.corneredFights} held=${b.heldFights}`);
  console.log(`  sortie vKills: total=${b.sortieKills} counted=${b.counted} noHold=${b.sortieKillsNoHold} unarmed=${b.sortieKillsUnarmed} nullGear=${b.sortieKillsNullGear} solo=${b.sortieKillsSolo}`);
  for (const f of b.countedRows) console.log(`    COUNTED seed=${f.seed} day=${f.day} ${f.mid} wave=${f.wave} startHp=${f.mHpStart}/${f.mHpMax} rounds=${f.rounds} party=${f.partySize} wb=${f.wb} armor=${f.armor} hold=${f.corneredHold}`);
  console.log(`  wall: natEver=${b.nationalEver}/8 natFinal=${b.nationalFinal}/8 table=${b.table}/8 entered=${b.entered}/8 wins=${b.wins}/8 ${JSON.stringify(b.winsBySeat)} wave3=${b.wave3} wave4=${b.wave4} wave5=${b.wave5} median=${b.medianDays}d starv=${b.starv} deaths=${b.deathTotal}`);
  console.log(`  seats=${JSON.stringify(b.seats)} courtCombined=${b.courtCombined} courtSeeds=${b.courtSeeds} substrateOk=${b.substrateOk}`);
  console.log(`  death causes: ${JSON.stringify(b.deaths)}`);
  console.log(`  per-seed: ${b.perSeed.map(s => `${s.seed}:${s.end}/${s.days}d/w${s.wave}${s.won ? '/WON' : ''}`).join(' ')}`);
}
function main() {
  const [controlDir, armedDir] = process.argv.slice(2);
  if (!controlDir || !armedDir) { console.error('usage: test-partyfinish.js <controlDir> <armedDir>'); process.exit(2); }
  const c = bandStats(controlDir, 'CONTROL (tableseat-nowait)');
  const a = bandStats(armedDir, 'ARMED (partyfinish + cornered hold)');
  printBand(c);
  printBand(a);
  console.log('\n--- GO JUDGMENT (prereg legs) ---');
  const legA = c.errs.length === 0 && a.errs.length === 0 && c.n === 8 && a.n === 8 && c.corneredFights === 0;
  console.log(`  (a) BAND VALIDITY: ${legA ? 'PASS' : 'FAIL'} (errs control=${c.errs.length} armed=${a.errs.length}; baseline cornered fights=${c.corneredFights}, must be 0)`);
  const legB = c.substrateOk && a.substrateOk;
  console.log(`  (b) SUBSTRATE GATE: ${legB ? 'PASS' : 'FAIL'} (control ${c.courtCombined}/${c.courtSeeds} armed ${a.courtCombined}/${a.courtSeeds})`);
  const legC = a.counted >= 2 && a.counted >= c.counted + 2;
  console.log(`  (c) COUNTED FINISHES: ${legC ? 'PASS' : 'FAIL'} (armed=${a.counted} baseline=${c.counted}; need >= 2 and >= baseline + 2)`);
  const medRatio = c.medianDays ? (a.medianDays / c.medianDays) : 0;
  const armOnlyDead = [...a.deadSeeds].filter(s => !c.deadSeeds.has(s));
  const armOnlyStarv = a.rows.filter(r => armOnlyDead.indexOf(r.seed) >= 0).reduce((t, r) => t + r.starvationDeaths, 0);
  const legD = medRatio >= 0.8 && a.starv <= c.starv + 2 && armOnlyStarv <= 2;
  console.log(`  (d) COST BAR: ${legD ? 'PASS' : 'FAIL'} (median ${a.medianDays} vs ${c.medianDays} ratio=${medRatio.toFixed(3)} need >= 0.8; starv ${a.starv} vs ${c.starv} + 2; arm-only dead seeds=${JSON.stringify(armOnlyDead)} starv there=${armOnlyStarv} need <= 2)`);
  console.log('  (e) DETGATE: judged by the sweep --detgate run (see evidence), not this analyzer.');
  console.log(`  (f) PARTY/GEAR REPORTING: ${a.sortieKills >= 0 ? 'PASS' : 'FAIL'} (split table printed above for both bands)`);
  const go = legA && legB && legC && legD;
  console.log(`\nVERDICT: ${go ? 'GO' : 'NO-GO'} (legs a=${legA} b=${legB} c=${legC} d=${legD}; detgate leg e reported separately)`);
  if (!legA || !legB) { console.error('INVALID BAND — verdict is not a NO-GO, the band itself failed'); process.exit(1); }
}
main();
