'use strict';
// analyze-bearercombat-20261015.js — pooled analysis of the bearer combat
// death census. Reads evidence/2026-10-15/sim-bearercombat-runs.json and
// the per-seed census packets; prints the wall numbers, the pooled
// attribution bar, and the killer-class breakdown.
const fs = require('fs');
const path = require('path');

const EV = process.env.EV || 'evidence/2026-10-15';
const runs = JSON.parse(fs.readFileSync(path.join(EV, 'sim-bearercombat-runs.json'), 'utf8'));

const natRuns = runs.filter(r => r.national);
console.log('=== wall numbers ===');
console.log(`runs: ${runs.length} | national-reach: ${natRuns.length} (${natRuns.filter(r => r.policy === 'leadfeast').length} leadfeast, ${natRuns.filter(r => r.policy === 'belongfeast').length} belongfeast)`);
console.log(`table: ${runs.filter(r => r.table).length} | wins: ${runs.filter(r => r.won).length} | wave-4: ${runs.filter(r => r.maxWave >= 4).length} | wave-5: ${runs.filter(r => r.maxWave >= 5).length} | exiled: ${runs.filter(r => r.exiled).length}`);
const surv = runs.map(r => r.survivalDays).sort((a, b) => a - b);
console.log(`median survival: ${surv[Math.floor(surv.length / 2)]}d | max: ${surv[surv.length - 1]}d`);

let nD = 0, nA = 0;
const byKiller = {}, byFT = {}, byTile = {}, byWave = {};
const entryHp = [], entryP = [], counterKnown = [], counterUnk = [], hits = [], dmg = [];
const rankAfter = {}, killerNames = {};
const ftTileWave = {};
for (const r of natRuns) {
  const pname = `${r.policy}-s${r.seed}`;
  const pkt = JSON.parse(fs.readFileSync(path.join(EV, 'perseed-bearercombat', pname + '.json'), 'utf8'));
  const cen = pkt.census;
  if (!cen) continue;
  for (const a of cen.deaths) {
    nD++;
    if (a.attributed) nA++;
    const k = a.killerWave != null ? 'w' + a.killerWave : a.killerClass;
    byKiller[k] = (byKiller[k] || 0) + 1;
    byFT[a.fightType] = (byFT[a.fightType] || 0) + 1;
    byTile[a.tile] = (byTile[a.tile] || 0) + 1;
    if (a.killerWave != null) byWave[a.killerWave] = (byWave[a.killerWave] || 0) + 1;
    const ck = `${k} x ${a.tile} x ${a.fightType}`;
    ftTileWave[ck] = (ftTileWave[ck] || 0) + 1;
    if (a.entryHp != null) entryHp.push(a.entryHp);
    const p = a.entryArmorP != null ? a.entryArmorP : a.armorPAtDeath;
    if (p != null) entryP.push(p);
    if (a.counterKnown === true) counterKnown.push(1);
    if (a.counterKnown === false) counterUnk.push(1);
    if (a.hitsTaken != null) hits.push(a.hitsTaken);
    if (a.dmgTaken != null) dmg.push(a.dmgTaken);
    rankAfter[a.rank7d || 'n/a'] = (rankAfter[a.rank7d || 'n/a'] || 0) + 1;
    if (a.killerName) killerNames[a.killerName] = (killerNames[a.killerName] || 0) + 1;
  }
}
const med = xs => xs.length ? xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)] : 'n/a';
const avg = xs => xs.length ? (xs.reduce((s, x) => s + x, 0) / xs.length).toFixed(1) : 'n/a';

console.log('\n=== DIAGNOSTIC GO: attribution share (denominator = bearer combat deaths on national-reaching runs) ===');
console.log(`census deaths: ${nD} | attributed: ${nA} | share: ${nD ? (100 * nA / nD).toFixed(1) + '%' : 'n/a'} (GO >= 90%)`);

console.log('\n=== killer class (wave x tile x fight-type) ===');
for (const [k, n] of Object.entries(ftTileWave).sort((a, b) => b[1] - a[1]))
  console.log(`  ${n}x  ${k}`);

console.log('\n=== by wave ===', JSON.stringify(byWave));
console.log('=== by tile ===', JSON.stringify(byTile));
console.log('=== by fight-type ===', JSON.stringify(byFT));
console.log('\n=== entry state ===');
console.log(`entry HP: median ${med(entryHp)} (n=${entryHp.length}) | armor P: median ${med(entryP)} (n=${entryP.length})`);
console.log(`counter known: ${counterKnown.length} | unknown: ${counterUnk.length}`);
console.log(`fight attrition: median hits taken ${med(hits)} | median dmg taken ${med(dmg)}`);
console.log('\n=== succession: rank 7d after death ===', JSON.stringify(rankAfter));
console.log('\n=== killer names ===');
for (const [k, n] of Object.entries(killerNames).sort((a, b) => b[1] - a[1]).slice(0, 12))
  console.log(`  ${n}x  ${k}`);
