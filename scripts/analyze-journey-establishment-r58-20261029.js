#!/usr/bin/env node
// r58 analyzer: reads journey-establishment-r58-seed{209,228,238,239}.json
// from EVID dir, prints the pre-registered verdict table. Usage:
//   node scripts/analyze-journey-establishment-r58-20261028.js [EVIDDIR]
'use strict';
const fs = require('fs');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-29';
const SEEDS = [209, 228, 238, 239];
const sum = (a, f) => a.reduce((t, x) => t + (f(x) || 0), 0);
for (const seed of SEEDS) {
  const p = `${EVID}/journey-establishment-r58-seed${seed}.json`;
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`seed ${seed}: MISSING/UNREADABLE ${p} (${e.message})`); continue; }
  const mt = j.materialTrace || [];
  const maxStash = (m) => mt.reduce((t, r) => Math.max(t, (r.stash && r.stash[m]) || 0), 0);
  const maxPack = (m) => mt.reduce((t, r) => Math.max(t, (r.pack && r.pack[m]) || 0), 0);
  const maxNpc = (m) => mt.reduce((t, r) => Math.max(t, (r.npcTotal && r.npcTotal[m]) || 0), 0);
  const last = mt.length ? mt[mt.length - 1] : {};
  const addBy = {};
  for (const r of (j.addMaterialLog || [])) addBy[r.mat] = (addBy[r.mat] || 0) + 1;
  const donBy = {};
  for (const r of (j.donateMaterialLog || [])) donBy[r.mat] = (donBy[r.mat] || 0) + 1;
  const lessons = (j.skillLessonLog || []).filter(r => r.via === 'villager');
  const lessonDays = new Set(lessons.map(r => r.day)).size;
  const distinct = new Set(lessons.map(r => r.skill)).size;
  const craft = j.armorCraftLog || [];
  const starv = (j.deaths || []).filter(d => d.day >= 15 && /starvat|hunger|thirst/.test(String(d.cause || '')));
  const g = j.guardrails || {};
  console.log(`\n=== seed ${seed} (reachedDay ${j.reachedDay}, over ${j.over}) ===`);
  console.log(`  materialTrace days: ${mt.length} (wrap addMat=${j.addMaterialWrap} donateMat=${j.donateMaterialWrap})`);
  console.log(`  stash max: bark=${maxStash('bark')} vine=${maxStash('vine')} hide=${maxStash('hide')} branch=${maxStash('branch')} | final: ${JSON.stringify(last.stash || {})}`);
  console.log(`  player pack max: bark=${maxPack('bark')} vine=${maxPack('vine')} hide=${maxPack('hide')} branch=${maxPack('branch')}`);
  console.log(`  NPC pack max: bark=${maxNpc('bark')} vine=${maxNpc('vine')} hide=${maxNpc('hide')} branch=${maxNpc('branch')}`);
  console.log(`  addMaterial calls: ${JSON.stringify(addBy)} | donateMaterial calls: ${JSON.stringify(donBy)}`);
  console.log(`  armor_craft rows: ${craft.length} ok=${craft.filter(r => r.ok).length} | gearEnd stash: ${JSON.stringify((j.gearCensusEnd || {}).stashMaterials || {})} wornBark=${(j.gearCensusEnd || {}).wornBark} wornHide=${(j.gearCensusEnd || {}).wornHide}`);
  console.log(`  lessons villager-via: ${lessons.length} rows, ${lessonDays} days, ${distinct} distinct skills [${[...new Set(lessons.map(r => r.skill))].join(', ')}]`);
  console.log(`  LESSON-DIST: ${lessonDays >= 21 || distinct >= 5 ? 'GO' : 'NO-GO'} (days>=21? ${lessonDays >= 21}, distinct>=5? ${distinct >= 5})`);
  console.log(`  guardrails: alive=${g.popAlive} pantry=${g.pantryKcal} tier=${g.tier} deaths=${(j.deaths || []).length} starvation=${starv.length} arrivals=${(j.arrivals || []).length}`);
}
console.log('\nPanel SUPPLY verdict: BRIDGE-ABSENT iff every seed shows stash bark/vine/hide max 0 AND npc max 0 AND some seed shows pack max > 0.');
