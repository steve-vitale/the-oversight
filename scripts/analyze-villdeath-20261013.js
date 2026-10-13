#!/usr/bin/env node
// scripts/analyze-villdeath-20261013.js — analyze a villdeath census sweep.
// Usage: node scripts/analyze-villdeath-20261013.js /tmp/villdeath-base.json
'use strict';
const fs = require('fs');
const rows = JSON.parse(fs.readFileSync(process.argv[2] || '/tmp/villdeath-base.json', 'utf8'));

const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };

// ---- wall numbers ----
const days = rows.map(r => r.days);
console.log('=== WALL ===');
console.log(`runs=${rows.length} national=${rows.filter(r => r.national).length} ` +
  `table=${rows.filter(r => r.table).length} won=${rows.filter(r => r.won).length} ` +
  `wave45unlock=${rows.filter(r => (r.maxWaveUnlocked || 1) >= 4).length} ` +
  `medianSurv=${med(days)} maxSurv=${Math.max(...days)} maxWaveEver=${Math.max(...rows.map(r => r.maxWaveUnlocked || 1))}`);

// ---- death causes (NPC only) ----
const byClass = {};
let npcTotal = 0, npcMonster = 0;
const w1deaths = [];
for (const r of rows) {
  for (const d of r.deaths) {
    if (d.playerVessel) continue;
    npcTotal++;
    byClass[d.class] = (byClass[d.class] || 0) + 1;
    if (/^monster/.test(d.class)) npcMonster++;
    if (d.class === 'monster-w1' && d.fight) w1deaths.push(Object.assign({ seed: r.seed, policy: r.policy }, d));
  }
}
console.log('\n=== NPC DEATHS ===');
console.log(`npcDeaths=${npcTotal} monsterShare=${(npcMonster / npcTotal).toFixed(3)}`);
console.log(JSON.stringify(byClass));

// ---- wave-1 monster deaths: where, why, armed, ambushed ----
console.log('\n=== WAVE-1 NPC MONSTER DEATHS (n=' + w1deaths.length + ') ===');
const venueCount = {}, purposeCount = {};
let ambushed = 0, playerPresent = 0, playerAtHavenUnknown = 0;
const wbs = [], armors = [], hps = [], rounds = [], dists = [];
const monsterCount = {};
for (const d of w1deaths) {
  const f = d.fight;
  venueCount[f.venue] = (venueCount[f.venue] || 0) + 1;
  purposeCount[f.awayPurpose || 'none'] = (purposeCount[f.awayPurpose || 'none'] || 0) + 1;
  if (f.ambushed) ambushed++;
  if (f.playerPresent) playerPresent++;
  if (f.wbFight != null) wbs.push(f.wbFight);
  if (f.armorP != null) armors.push(f.armorP);
  if (f.hp0 != null) hps.push(f.hp0);
  if (f.rounds != null) rounds.push(f.rounds);
  if (f.dist != null) dists.push(f.dist);
  monsterCount[f.monster] = (monsterCount[f.monster] || 0) + 1;
}
console.log('venue:', JSON.stringify(venueCount));
console.log('awayPurpose:', JSON.stringify(purposeCount));
console.log(`ambushed=${ambushed}/${w1deaths.length} playerPresent=${playerPresent}/${w1deaths.length}`);
console.log('monsters:', JSON.stringify(monsterCount));
console.log('wbFight:', JSON.stringify(wbs), 'median=' + med(wbs));
console.log('armorP: median=' + med(armors), 'hp0: median=' + med(hps), 'rounds: median=' + med(rounds), 'dist: median=' + med(dists));

// ---- contact fight outcomes overall (NPC) ----
let contact = 0, evade = 0, vdie = 0, vkill = 0, vdieArmed = 0, vdieUnarmed = 0;
for (const r of rows) {
  for (const f of r.fights) {
    if (f.venue === 'contest') continue;
    if (f.evaded) { evade++; continue; }
    contact++;
    if (f.outcome === 'vDie') { vdie++; if (f.wbFight > 0) vdieArmed++; else vdieUnarmed++; }
    if (f.outcome === 'vKill') vkill++;
  }
}
console.log('\n=== ALL NPC FIELD FIGHTS (non-contest) ===');
console.log(`contact=${contact} evade=${evade} vDie=${vdie} vKill=${vkill} ` +
  `deathRate=${(vdie / Math.max(1, contact)).toFixed(3)} killRate=${(vkill / Math.max(1, contact)).toFixed(3)}`);
console.log(`vDie armed=${vdieArmed} unarmed=${vdieUnarmed}`);

// ---- sense-test: say-lines around villager deaths ----
console.log('\n=== SAY-LINES (villager death beats, first 12) ===');
const lines = [];
for (const r of rows) for (const s of (r.sayLines || [])) lines.push(`[${r.policy} s${r.seed} d${s.day}] ${s.msg.slice(0, 200)}`);
lines.slice(0, 12).forEach(l => console.log('  ' + l));
console.log(`(${lines.length} total)`);
