#!/usr/bin/env node
// scripts/ammostorage-deepdive.js — second-level analysis of the
// sim-ammostorage-a corpus (read-only; no harness, no writes).
// Answers the sharp questions the summary totals cannot:
// - G6 (bow-no-ammo) fights by ammo type, and whether the needed ammo
//   sat in the fighter's OWN stash / the communal stone pile at that
//   very fight moment (the "own stash held it, pack empty" split).
// - Whether ANY bolt / heartseeker / fusion_cell ever appears in any
//   daily snapshot bucket (fight rows alone cannot prove a negative
//   across days).
// - Whether any fighter ever carries a ranged item unequipped
//   (verdict (c) check) or any scholar fight occurs (bucket-overlap
//   check).
// - Wave-4 rows with their full storage picture, one by one.
// Usage: node scripts/ammostorage-deepdive.js (prints the report).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-26', 'perseed-ammostorage-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const AMMO_IDS = ['arrow', 'bolt', 'stone', 'heartseeker_arrows', 'fusion_cell'];

function sectionTotal(storage) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  const secs = (storage && storage.stashSections) || {};
  for (const name of Object.keys(secs)) for (const id of AMMO_IDS) out[id] += (secs[name][id] | 0);
  return out;
}

const allF = [], allSnaps = [];
for (const seed of SEEDS) {
  const r = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-armed.json`), 'utf8'));
  for (const f of r.ammostorage.fieldFights) allF.push(Object.assign({ seed }, f));
  for (const s of r.ammostorage.dailySnapshots) allSnaps.push(Object.assign({ seed }, s));
}
const g6 = allF.filter(f => f.gate === 'G6-bow-no-ammo');
const byAmmo = {};
for (const f of g6) {
  const a = f.postAmmoId || 'null';
  if (!byAmmo[a]) byAmmo[a] = { fights: 0, ownStashHasIt: 0, stashStoneHasIt: 0, otherStashHasIt: 0, scholarHasIt: 0 };
  const b = byAmmo[a];
  b.fights++;
  if ((f.fighterStashedByType[a] | 0) > 0) b.ownStashHasIt++;
  if (a === 'stone' && ((f.storage.stashMaterials.stone) | 0) > 0) b.stashStoneHasIt++;
  if ((f.storage.otherPersonsStashed[a] | 0) > 0) b.otherStashHasIt++;
  if ((f.storage.scholarInventory[a] | 0) > 0) b.scholarHasIt++;
}
console.log(`DEEPDIVE fights=${allF.length} g6=${g6.length}`);
console.log('G6 by needed ammo:');
for (const a of Object.keys(byAmmo).sort()) console.log(`  ${a}: ${JSON.stringify(byAmmo[a])}`);
const g6OwnStash = g6.filter(f => (f.fighterStashedByType[f.postAmmoId] | 0) > 0).length;
const g6StonePile = g6.filter(f => f.postAmmoId === 'stone' && ((f.storage.stashMaterials.stone) | 0) > 0).length;
console.log(`G6 where fighter's OWN stash held the needed ammo: ${g6OwnStash}/${g6.length}`);
console.log(`G6 stone fights where communal pile held stone: ${g6StonePile}/${g6.filter(f => f.postAmmoId === 'stone').length}`);
// Any bolt/heartseeker/fusion_cell in daily snapshots, any bucket?
for (const id of ['bolt', 'heartseeker_arrows', 'fusion_cell']) {
  let days = 0, maxV = 0, maxSeed = null;
  for (const s of allSnaps) {
    const st = s.storage || {};
    const pools = [sectionTotal(st), st.otherPersonsCarried || {}, st.otherPersonsStashed || {}, st.scholarInventory || {}, (st.pantry && st.pantry.byType) || {}];
    const v = Math.max.apply(null, pools.map(p => (p[id] | 0)).concat([0]));
    if (v > 0) { days++; if (v > maxV) { maxV = v; maxSeed = s.seed; } }
  }
  console.log(`SNAP ${id}: days>0=${days}/${allSnaps.length} maxUnitsSingleBucket=${maxV} seed=${maxSeed}`);
}
// Arrow in daily snapshots: which seeds, first day?
for (const seed of SEEDS) {
  const snaps = allSnaps.filter(s => s.seed === seed);
  const arrowDays = snaps.filter(s => {
    const st = s.storage || {};
    const pools = [sectionTotal(st), st.otherPersonsCarried || {}, st.otherPersonsStashed || {}, st.scholarInventory || {}, (st.pantry && st.pantry.byType) || {}];
    return pools.some(p => ((p.arrow | 0) > 0));
  });
  const first = arrowDays.length ? arrowDays[0].day : null;
  console.log(`SNAP arrow seed=${seed}: days>0=${arrowDays.length}/${snaps.length} firstDay=${first}`);
}
// Carried-but-unequipped ranged items; scholar fights; fighter carried.
const carriedRangedFights = allF.filter(f => (f.carriedRanged || []).length > 0).length;
const scholarFights = allF.filter(f => !!f.isScholar).length;
const fighterCarriedFights = allF.filter(f => AMMO_IDS.some(id => (f.fighterCarriedByType[id] | 0) > 0)).length;
console.log(`carriedRanged>0 fights=${carriedRangedFights} scholarFights=${scholarFights} fighterCarried>0 fights=${fighterCarriedFights}`);
// Wave-4 rows, one by one.
console.log('WAVE-4 rows:');
for (const f of allF.filter(x => (x.wave | 0) === 4)) {
  const st = f.storage || {};
  console.log(`  s${f.seed} d${f.day} ${f.mid} gate=${f.gate} ranged=${f.postRanged} need=${f.postAmmoId} fighterCarried=${JSON.stringify(f.fighterCarriedByType)} fighterStashed=${JSON.stringify(f.fighterStashedByType)} stashStone=${(st.stashMaterials.stone) | 0} otherCarried=${JSON.stringify(st.otherPersonsCarried)} otherStashed=${JSON.stringify(st.otherPersonsStashed)} sections=${JSON.stringify(sectionTotal(st))} pantry=${JSON.stringify(st.pantry.byType)} scholar=${JSON.stringify(st.scholarInventory)}`);
}
// Communal stone pile at fight time: distribution + per-seed max/median.
const stones = allF.map(f => ((f.storage.stashMaterials.stone) | 0)).sort((a, b) => a - b);
const med = stones[Math.floor(stones.length / 2)];
console.log(`stashStone at fight time: min=${stones[0]} median=${med} max=${stones[stones.length - 1]} fights>0=${stones.filter(s => s > 0).length}/${stones.length}`);
for (const seed of SEEDS) {
  const ss = allF.filter(f => f.seed === seed).map(f => ((f.storage.stashMaterials.stone) | 0));
  const srt = ss.slice().sort((a, b) => a - b);
  console.log(`  stone seed=${seed}: min=${srt[0]} median=${srt[Math.floor(srt.length / 2)]} max=${srt[srt.length - 1]} fights>0=${ss.filter(s => s > 0).length}/${ss.length}`);
}
