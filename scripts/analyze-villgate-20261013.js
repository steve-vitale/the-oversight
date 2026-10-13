#!/usr/bin/env node
// scripts/analyze-villgate-20261013.js — before/after analysis for the
// villager departure heal gate pilot (flesh-out-b 2026-10-13, arm 1).
//
// Usage: node scripts/analyze-villgate-20261013.js /tmp/villgate-base.json /tmp/villgate-after.json
'use strict';
const fs = require('fs');

function median(a) {
  const s = a.slice().sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function summarize(rows, label) {
  const npcMonster = [], npcTotal = [], days = [], purposes = {}, hp0die = [], hp0all = [];
  let national = 0, table = 0, won = 0, contact = 0, vDie = 0, vKill = 0;
  for (const r of rows) {
    const vessels = {};
    for (const d of (r.deaths || [])) if (d.playerVessel) vessels[String(d.vid)] = true;
    const npc = (r.deaths || []).filter(d => !d.playerVessel);
    const nm = npc.filter(d => /^monster/.test(d.class)).length;
    npcMonster.push(nm); npcTotal.push(npc.length);
    for (const d of npc) if (/^monster/.test(d.class)) {
      const p = (d.fight && d.fight.awayPurpose) || 'none';
      purposes[p] = (purposes[p] || 0) + 1;
    }
    for (const f of (r.fights || [])) {
      if (f.venue === 'contest' || f.evaded || vessels[String(f.vid)]) continue;
      if (f.hp0 != null) hp0all.push(f.hp0);
      if (f.outcome === 'vDie' && f.hp0 != null) hp0die.push(f.hp0);
    }
    days.push(r.days); national += r.national || 0; table += r.table || 0; won += r.won || 0;
    contact += r.contactFights || 0; vDie += r.vDie || 0; vKill += r.vKill || 0;
  }
  const totM = npcMonster.reduce((a, b) => a + b, 0), totN = npcTotal.reduce((a, b) => a + b, 0);
  console.log(`\n=== ${label} (${rows.length} runs) ===`);
  console.log(`NPC monster-death share: ${totM}/${totN} = ${(totM / totN).toFixed(3)}`);
  console.log(`NPC deaths/run: ${median(npcTotal).toFixed(1)} median`);
  console.log(`survival days: median ${median(days)} (range ${Math.min(...days)}-${Math.max(...days)})`);
  console.log(`national ${national}/${rows.length}  table ${table}/${rows.length}  wins ${won}/${rows.length}`);
  console.log(`contact fights ${contact}, vDie ${vDie} (${(100 * vDie / contact).toFixed(1)}%/contact), vKill ${vKill}`);
  console.log(`NPC monster-death purposes: ${JSON.stringify(purposes)}`);
  console.log(`hp0 at entry — vDie fights: n=${hp0die.length} median=${median(hp0die)} | all contacts: n=${hp0all.length} median=${median(hp0all)}`);
  const under50 = hp0die.filter(h => h < 50).length;
  console.log(`vDie fights entered at <50 HP: ${under50}/${hp0die.length}`);
  return { share: totM / totN, medDays: median(days), national, table, won, medHp0die: median(hp0die) };
}

function main() {
  const base = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const after = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  const b = summarize(base, 'BASELINE (no gate)');
  const a = summarize(after, 'AFTER (departure heal gate)');
  console.log('\n=== DELTA ===');
  console.log(`NPC monster share: ${b.share.toFixed(3)} -> ${a.share.toFixed(3)} (${((a.share - b.share) * 100).toFixed(1)}pp)  GO needs <= -10pp`);
  console.log(`median survival: ${b.medDays}d -> ${a.medDays}d (guard: no regression, within ±10d in the good direction)`);
  console.log(`national: ${b.national}/8 -> ${a.national}/8   table: ${b.table}/8 -> ${a.table}/8   wins: ${b.won}/8 -> ${a.won}/8`);
  console.log(`vDie hp0 median: ${b.medHp0die} -> ${a.medHp0die}`);
  const go = (b.share - a.share) >= 0.10;
  const guard = a.medDays >= b.medDays - 10;
  console.log(`\nVERDICT: ${go && guard ? 'GO — both pre-registered bars met' : 'KILL — ' + (!go ? 'primary <10pp' : 'survival regressed')}`);
}
main();
