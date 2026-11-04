#!/usr/bin/env node
// r85 analyzer: reads journey-establishment-r85-seed{1101..1104}.json
// from EVID dir, prints the pre-registered verdict table.
// Usage: node scripts/analyze-journey-establishment-r85-20261104.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04');
const SEEDS = [1101, 1102, 1103, 1104];
const maxOf = (rows, f) => rows.reduce((t, r) => Math.max(t, f(r) || 0), 0);
let m1 = 0, m2 = 0, m3 = 0, m4 = 0;
for (const seed of SEEDS) {
  const p = `${EVID}/journey-establishment-r85-seed${seed}.json`;
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`seed ${seed}: MISSING/UNREADABLE ${p} (${e.message})`); continue; }
  const mt = j.matTrace || [];
  const stashMax = m => maxOf(mt, r => (r.stash || {})[m]);
  const packMax = m => maxOf(mt, r => (r.pack || {})[m]);
  const npcMax = m => maxOf(mt, r => (r.npcTotal || {})[m]);
  const worn = (j.census || []).filter(c => (c.equipped || []).includes('bark_armor') || (c.equipped || []).includes('hide_armor')
    || (c.ownedArmor || []).length);
  const wornNames = worn.map(c => `${c.name}:${[...(c.equipped || []).filter(x => /armor/.test(x)), ...(c.ownedArmor || [])].join(',')}`);
  const playerAttempts = (j.craftLog || []).length;
  const npcCalls = (j.npcCraftLog || []).length;
  const npcNonzero = (j.npcCraftLog || []).filter(r => r.ret !== '0' && r.ret !== 'null' && r.ret !== undefined).length;
  const starv = (j.deaths || []).filter(d => /starvat|hunger|thirst/i.test(String(d.cause || '')));
  const rosterDeaths = (j.census || []).filter(c => c.dead).length;
  const m1go = playerAttempts > 0 || npcNonzero > 0;
  const m2go = worn.length > 0;
  const m3go = !j.gameOver && (j.aliveAt40 || 0) >= 1;
  const m4go = starv.length === 0;
  if (m1go) m1++; if (m2go) m2++; if (m3go) m3++; if (m4go) m4++;
  console.log(`\n=== seed ${seed} (endDay ${j.endDay}, over ${j.gameOver}) ===`);
  console.log(`  start ${j.startCensus ? j.startCensus.length : '?'} -> census ${j.census.length}, aliveEnd ${j.aliveEnd}, aliveAt40 ${j.aliveAt40}, rosterDead ${rosterDeaths}, wave ${j.waveReached}, pantryEnd ${j.pantryKcalEnd}`);
  console.log(`  M1 attempts: playerCraft=${playerAttempts} npcBeatCalls=${npcCalls} npcNonzeroRet=${npcNonzero} -> ${m1go ? 'GO' : 'NO-GO'}`);
  console.log(`  M2 wornEnd: ${worn.length} wearers [${wornNames.join('; ') || '-'}] playerPack=${JSON.stringify(j.playerPackArmor)} playerEquipped=${JSON.stringify(j.playerEquipped)} recipes=${JSON.stringify(j.playerRecipes)} -> ${m2go ? 'GO' : 'NO-GO'}`);
  console.log(`  M3 survival42: ${m3go ? 'GO' : 'NO-GO'} | M4 pantry: starvationDeaths=${starv.length} teleDeaths=${j.deaths.length} -> ${m4go ? 'GO' : 'NO-GO'}`);
  console.log(`  stash max: bark=${stashMax('bark')} vine=${stashMax('vine')} hide=${stashMax('hide')} branch=${stashMax('branch')} | pack max: bark=${packMax('bark')} vine=${packMax('vine')} hide=${packMax('hide')} | npc max: bark=${npcMax('bark')} vine=${npcMax('vine')} hide=${npcMax('hide')}`);
  console.log(`  stash end: ${JSON.stringify(mt.length ? mt[mt.length - 1].stash : {})}`);
  console.log(`  contests: ${JSON.stringify(j.contestCounts)} firedDays=${(j.contestTele || []).filter(t => t.type === 'contest_fired').map(t => t.day).join(',')}`);
  console.log(`  deaths by cause: ${JSON.stringify((j.deaths || []).reduce((a, d) => { a[d.cause] = (a[d.cause] || 0) + 1; return a; }, {}))}`);
}
console.log(`\nPANEL: M1 ARMOR-ATTEMPTS ${m1}/4 (GO needs >=3) | M2 ARMOR-WORN ${m2}/4 (GO needs >=2) | M3 SURVIVAL-42 ${m3}/4 (GO needs >=3) | M4 PANTRY ${m4}/4 (GO needs >=3)`);
console.log(`PANEL VERDICT: M1 ${m1 >= 3 ? 'GO' : 'NO-GO'} | M2 ${m2 >= 2 ? 'GO' : 'NO-GO'} | M3 ${m3 >= 3 ? 'GO' : 'NO-GO'} | M4 ${m4 >= 3 ? 'GO' : 'NO-GO'}`);
