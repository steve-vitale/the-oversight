#!/usr/bin/env node
// r86 analyzer: reads journey-establishment-r86-seed{1201..1204}.json
// from EVID dir, prints the pre-registered verdict table (wave scope,
// wave-3 arrival, survival, pantry, armor guardrail).
// Usage: node scripts/analyze-journey-establishment-r86-20261104.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-04');
const SEEDS = [1201, 1202, 1203, 1204];
let m1 = 0, m3 = 0, m4 = 0;
for (const seed of SEEDS) {
  const p = `${EVID}/journey-establishment-r86-seed${seed}.json`;
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`seed ${seed}: MISSING/UNREADABLE ${p} (${e.message})`); continue; }
  const daily = j.daily || [];
  const firstWave = (w) => daily.find(d => (d.wave || 1) >= w);
  const w2 = firstWave(2), w3 = firstWave(3);
  const m1go = (j.waveReached || 1) >= 3;
  const m3go = !j.gameOver && (j.aliveAt40 || 0) >= 1;
  const starv = (j.deaths || []).filter(d => /starvat|hunger|thirst/i.test(String(d.cause || '')));
  const m4go = starv.length === 0;
  if (m1go) m1++; if (m3go) m3++; if (m4go) m4++;
  // Armor worn on the wave-3 arrival day (nearest matTrace at/before that day).
  let arrivalArmor = '(no wave-3 day)';
  let arrivalStash = '';
  if (w3) {
    const mt = j.matTrace || [];
    let snap = null;
    for (const r of mt) { if (r.day <= w3.day) snap = r; else break; }
    if (snap) {
      const armored = (snap.npcDetail || []).filter(d => (d.armor || []).length).map(d => `${d.name}:${d.armor.join(',')}`);
      arrivalArmor = armored.length ? armored.join('; ') : 'none roster-wide in matTrace';
      arrivalStash = JSON.stringify(snap.stash || {});
    }
  }
  const aliveAtArrival = w3 ? w3.alive : null;
  const after = w3 ? daily.filter(d => d.day > w3.day && d.day <= w3.day + 3) : [];
  const aliveMinAfter = after.length ? Math.min(...after.map(d => d.alive)) : null;
  const worn = (j.census || []).filter(c => (c.equipped || []).includes('bark_armor') || (c.equipped || []).includes('hide_armor')
    || (c.ownedArmor || []).length);
  const wornNames = worn.map(c => `${c.name}:${[...(c.equipped || []).filter(x => /armor/.test(x)), ...(c.ownedArmor || [])].join(',')}`);
  const playerAttempts = (j.craftLog || []).length;
  const npcNonzero = (j.npcCraftLog || []).filter(r => r.ret !== '0' && r.ret !== 'null' && r.ret !== undefined).length;
  const npcAttempts = (j.npcCraftLog || []).filter(r => r.attempted).map(r => r.day);
  const npcAttemptDays = npcAttempts.join(',');
  const rosterDeaths = (j.census || []).filter(c => c.dead).length;
  console.log(`\n=== seed ${seed} (endDay ${j.endDay}, over ${j.gameOver}) ===`);
  console.log(`  start ${j.startCensus ? j.startCensus.length : '?'} -> census ${j.census.length}, aliveEnd ${j.aliveEnd}, aliveAt40 ${j.aliveAt40}, rosterDead ${rosterDeaths}, waveEnd ${j.waveReached}, pantryEnd ${j.pantryKcalEnd}`);
  console.log(`  M1 wave-scope: waveEnd>=3 -> ${m1go ? 'STALE-FRAMING' : 'not'}`);
  console.log(`  wave2 first daily: ${w2 ? `day ${w2.day} alive ${w2.alive} ledger2 ${w2.ledger2}` : 'never'}`);
  console.log(`  wave3 first daily: ${w3 ? `day ${w3.day} alive ${w3.alive} ledger2 ${w3.ledger2} pantry ${w3.pantryKcal}` : 'never'}`);
  console.log(`  M2 arrival: armorThatDay=[${arrivalArmor}] stash=${arrivalStash} aliveAtArrival=${aliveAtArrival} aliveMinNext3d=${aliveMinAfter}`);
  console.log(`  M3 survival42: ${m3go ? 'GO' : 'NO-GO'} | M4 pantry: starvationDeaths=${starv.length} teleDeaths=${j.deaths.length} -> ${m4go ? 'GO' : 'NO-GO'}`);
  console.log(`  M6 armor guardrail: playerCraft=${playerAttempts} ${JSON.stringify(j.craftLog || [])} npcBeatCalls=${(j.npcCraftLog || []).length} npcNonzeroRet=${npcNonzero} npcAttempts=${npcAttempts.length} [${npcAttemptDays}] wornEnd=${worn.length} [${wornNames.join('; ') || '-'}] playerPack=${JSON.stringify(j.playerPackArmor)} playerEquipped=${JSON.stringify(j.playerEquipped)} recipes=${JSON.stringify(j.playerRecipes)}`);
  console.log(`  contests: ${JSON.stringify(j.contestCounts)} firedDays=${(j.contestTele || []).filter(t => t.type === 'contest_fired').map(t => t.day).join(',')}`);
  console.log(`  deaths by cause/kind: ${JSON.stringify((j.deaths || []).reduce((a, d) => { const k = `${d.cause}/${d.kind}`; a[k] = (a[k] || 0) + 1; return a; }, {}))}`);
  console.log(`  teleTypes: ${JSON.stringify(j.teleTypes || {})}`);
  console.log(`  waveSysLines: ${JSON.stringify((j.waveSysLines || []).slice(0, 8))}`);
}
console.log(`\nPANEL: M1 WAVE3-REACHED ${m1}/4 (stale framing if >=3) | M3 SURVIVAL-42 ${m3}/4 (GO needs >=3) | M4 PANTRY ${m4}/4 (GO needs >=3)`);
