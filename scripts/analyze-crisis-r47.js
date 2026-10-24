#!/usr/bin/env node
// analyze-crisis-r47.js — analyzer for journey-crisis-r47-seed*.json.
// Prints per-seed siege composition tables + cross-seed verdict on the M1-M8
// pre-registered bindings.
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24';
const files = fs.readdirSync(DIR).filter(f => /^journey-crisis-r47-seed\d+\.json$/.test(f)).sort();

function raidCause(d) { return /raid|sortie/i.test(d.cause) || /monster/i.test(d.cause); }

for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (d.error) { console.log(`${f}: ERROR ${d.error}`); continue; }
  // resolutions are double-captured (say line + resolveAidCrisis wrap): dedupe
  const seenRes = new Set();
  d.aidResolutions = d.aidResolutions.filter(r => {
    const k = r.day + '|' + r.how;
    if (seenRes.has(k)) return false;
    seenRes.add(k);
    return true;
  });
  console.log(`\n===== ${f} — days ${d.days} end=${d.endReason} alive=${d.census && d.census.aliveCount} =====`);
  console.log(`raids: ${d.raids.length}${d.raids.map(r => ' d' + r.day).join('')}`);
  console.log(`aidRaises: ${d.aidRaises.length}`, d.aidRaises.map(a => `d${a.day}:${a.name}(w${a.wave},raiders=${a.raidersFlag})`).join(' '));
  console.log(`aidResolutions: ${d.aidResolutions.length}`, d.aidResolutions.map(a => `d${a.day}:${a.how}${a.via ? '(' + a.via + ')' : ''}`).join(' '));
  console.log(`defenseBeats: ${d.defenseBeats.length} | defendedFights: ${d.defendedFights.length}`);
  for (const r of d.raids) {
    const fights = d.defendedFights.filter(x => x.day === r.day);
    const beat = d.defenseBeats.some(b => b.day === r.day || b.day === r.day + 1);
    console.log(`  raid d${r.day}: fights=${fights.length} (${fights.map(x => x.name.split(' ')[0] + ':' + x.outcome).join(',')}) beat=${beat}`);
  }
  console.log(`unmetRaiders: ${d.unmetRaiders.length} | gorgeNights: ${d.gorgeNights.length} | sorties: ${d.sorties.length}`);
  const lingerMax = d.lingerDaily.reduce((m, x) => Math.max(m, x.n), 0);
  const lingerNights = d.lingerDaily.filter(x => x.n > 0).length;
  console.log(`linger: max=${lingerMax} nights-with-lingers=${lingerNights}`);
  console.log(`aidCalls: ${d.aidCalls.length}`, d.aidCalls.map(c => `d${c.day}:${c.tier}=${c.result}`).join(' '));
  console.log(`deaths: ${d.deaths.length} raidCause=${d.deaths.filter(raidCause).length}`);
  const raidDeaths = d.deaths.filter(raidCause);
  for (const rd of raidDeaths) {
    const mourned = d.mournLines.some(m => m.day >= rd.day && m.day <= rd.day + 7);
    console.log(`  raid death: ${rd.name} d${rd.day} (${rd.cause}) mourned<=7d=${mourned}`);
  }
  const shelteredFights = d.defendedFights.filter(x => x.sheltered === true);
  console.log(`sheltered-in-defense: ${shelteredFights.length}`);
  console.log(`fabricHits: ${d.fabricHits.length} | convosDriven: ${d.convosDriven.length} | mournLines: ${d.mournLines.length}`);
  console.log(`census: ${d.census && d.census.aliveCount} alive / ${d.census && d.census.dead.length} dead | pantry ${(d.census && d.census.pantryKcal || 0).toLocaleString()} kcal`);
  if (d.census && d.census.alive) console.log(`  alive: ${d.census.alive.join(', ').slice(0, 200)}`);
  if (d.census && d.census.dead.length) console.log(`  dead: ${d.census.dead.join(', ').slice(0, 200)}`);
}

// ---- cross-seed binding verdicts ----
console.log('\n===== BINDING VERDICTS =====');
const ds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))).filter(d => !d.error);
const raidSeeds = ds.filter(d => d.raids.length >= 1);
console.log(`M1 raid reach: ${raidSeeds.length}/${ds.length} seeds with >=1 natural raid -> ${raidSeeds.length >= 2 ? 'GO' : 'NO-GO'}`);
let m2miss = 0, m2tot = 0;
for (const d of raidSeeds) {
  for (const r of d.raids) {
    m2tot++;
    const ok = d.aidRaises.some(a => a.day === r.day && a.raidersFlag);
    if (!ok) { m2miss++; console.log(`  M2 MISS: raid d${r.day} seed ${d.seed} with no raiders-flagged aid crisis`); }
  }
}
console.log(`M2 crisis raised: ${m2tot - m2miss}/${m2tot} raids with raiders-flagged aid crisis -> ${m2miss === 0 && m2tot > 0 ? 'GO' : 'NO-GO'}`);
let m3miss = 0, m3tot = 0;
for (const d of raidSeeds) {
  for (const r of d.raids) {
    const fights = d.defendedFights.filter(x => x.day === r.day);
    const beat = d.defenseBeats.some(b => b.day === r.day || b.day === r.day + 1);
    m3tot++;
    if (fights.length === 0 && !beat) { m3miss++; console.log(`  M3 MISS: raid d${r.day} seed ${d.seed}: no fights, no defense beat`); }
  }
}
console.log(`M3 real defense: ${m3tot - m3miss}/${m3tot} raids with fights or beat -> ${m3miss === 0 && m3tot > 0 ? 'GO' : 'NO-GO'}`);
let m4miss = 0, m4tot = 0;
for (const d of ds) {
  for (const rd of d.deaths.filter(raidCause)) {
    m4tot++;
    if (!d.mournLines.some(m => m.day >= rd.day && m.day <= rd.day + 7)) { m4miss++; console.log(`  M4 MISS: ${rd.name} seed ${d.seed} d${rd.day} unmourned`); }
  }
}
console.log(`M4 mourning: ${m4tot - m4miss}/${m4tot} raid deaths mourned<=7d -> ${m4miss === 0 && m4tot > 0 ? 'GO' : m4tot === 0 ? 'VACUOUS' : 'NO-GO'}`);
// M5: linger price — group gorge nights by lingerer-episode: for each unmet raid, count gorge voices within 3 nights
let m5miss = 0, m5tot = 0;
for (const d of ds) {
  for (const u of d.unmetRaiders) {
    m5tot++;
    const voices = d.gorgeNights.filter(g => g.day >= u.day && g.day <= u.day + 3).length;
    if (voices < 3) { m5miss++; console.log(`  M5 MISS: unmet d${u.day} seed ${d.seed}: ${voices}/3 gorge voices in 3 nights`); }
  }
}
console.log(`M5 linger price: ${m5tot - m5miss}/${m5tot} unmet raiders with >=3 gorge voices in 3 nights -> ${m5miss === 0 && m5tot > 0 ? 'GO' : m5tot === 0 ? 'VACUOUS' : 'NO-GO'}`);
// M6: no lingerer immortal — check longest consecutive linger stretch per seed
let m6miss = 0;
for (const d of ds) {
  let run = 0;
  for (const x of d.lingerDaily) {
    if (x.n > 0) { run++; } else {
      if (run > 8) { m6miss++; console.log(`  M6 MISS: seed ${d.seed} linger stretch ${run} nights`); }
      run = 0;
    }
  }
  if (run > 8) { m6miss++; console.log(`  M6 MISS: seed ${d.seed} trailing linger stretch ${run} nights`); }
}
console.log(`M6 linger resolution: ${m6miss === 0 ? 'GO (no >8-night stretches)' : 'NO-GO'}`);
let m7n = 0;
for (const d of ds) { m7n += d.defendedFights.filter(x => x.sheltered === true).length; }
console.log(`M7 shelter discipline: ${m7n} sheltered villagers in defense fights -> ${m7n === 0 ? 'GO' : 'NO-GO'}`);
let m8n = 0;
for (const d of ds) { m8n += d.fabricHits.length; }
console.log(`M8 no theater: ${m8n} fabricated-history lines in say stream -> ${m8n === 0 ? 'GO' : 'NO-GO'}`);
