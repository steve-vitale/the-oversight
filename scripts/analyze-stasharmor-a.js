#!/usr/bin/env node
// analyze-stasharmor-a.js — item-agnostic corpus analyzer for sim-stasharmor-a.
// The landed proof test (scripts/test-armorfetch-b.js Part C) hard-codes
// armorfetch-b's spawn items (swat_vest on 16103, farstrider_boots on
// 16109). Intervening landings changed spawn generation, so those items
// no longer spawn and Part C reads NO-SPAWN — a stale-item artifact, not
// a mechanism miss. This analyzer instead asks, per seed: of the armor
// the spawn vessel ACTUALLY stashed, what reached the scholar kit and
// was worn within 7 game days? Same window and verdict tiers as Part C.
// Usage: node scripts/analyze-stasharmor-a.js [corpusDir]
//   (default: evidence/2026-11-04/sim-stasharmor-a-corpus)
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04', 'sim-stasharmor-a-corpus');
const items = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'items.json'), 'utf8'));
const defs = Array.isArray(items) ? items : (items.items || []);
const armorIds = new Set(defs.filter((d) => d && d.armor).map((d) => d.id));
const load = (d) => {
  const out = {};
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json'))) {
    try { const j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); out[j.seed] = j; } catch (e) {}
  }
  return out;
};
const verdict = (d, item) => {
  const snaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }]
    .concat(d.mornings || []);
  let stashLost = null, firstKit = null, firstEq = null, prev = true;
  for (const s of snaps) {
    if (s.gameDay > 7) continue;
    const has = ((s.person || {}).stash || []).indexOf(item) >= 0;
    if (prev && !has && stashLost === null) stashLost = s.gameDay;
    prev = has;
    const sch = s.scholar || {};
    if (firstKit === null && [].concat(sch.inv || [], sch.eq || []).indexOf(item) >= 0) firstKit = s.gameDay;
    if (firstEq === null && (sch.eq || []).indexOf(item) >= 0) firstEq = s.gameDay;
  }
  if (stashLost !== null && firstEq !== null) return 'WORN';
  if (stashLost !== null && firstKit !== null) return 'FETCHED';
  return 'NO-GO';
};
const corpus = load(dir);
let worn = 0, fetched = 0, nogo = 0, nosSpawn = 0, seedsWith = 0;
for (const seed of Object.keys(corpus).sort((a, b) => a - b)) {
  const d = corpus[seed];
  const spawnArmor = (((d.spawnSnap || {}).pool || {}).stashed || []).filter((id) => armorIds.has(id));
  if (!spawnArmor.length) { nosSpawn++; console.log(seed + ' NO-SPAWN-ARMOR'); continue; }
  seedsWith++;
  for (const item of spawnArmor) {
    const v = verdict(d, item);
    console.log(seed + ' ' + item + ' -> ' + v);
    if (v === 'WORN') worn++;
    else if (v === 'FETCHED') fetched++;
    else nogo++;
  }
}
const days = Object.values(corpus).map((r) => r.daysAlive).sort((a, b) => a - b);
const lost = Object.values(corpus).filter((r) => r.endReason === 'village-lost').length;
console.log(JSON.stringify({
  seeds: Object.keys(corpus).length, seedsWithSpawnArmor: seedsWith, noSpawnArmorSeeds: nosSpawn,
  worn, fetched, nogo, band: { lost, medianDaysAlive: days[Math.floor(days.length / 2)] },
  maxWave: Math.max(...Object.values(corpus).map((r) => r.maxWaveUnlocked || 0)),
}));
