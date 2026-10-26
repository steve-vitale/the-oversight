#!/usr/bin/env node
// analyze-noelig-lean-b.js — per-seed class table + sense samples for
// the noelig lean-band corpus (sim-noelig-lean-b, 2026-10-26).
// Usage: node scripts/analyze-noelig-lean-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-noelig-lean-b-corpus');
const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
const load = (cap, seed) => JSON.parse(fs.readFileSync(path.join(dir, `noelig-lean-b-cap${cap}-pd0-dg1-competent-nofeast-s${seed}.json`), 'utf8'));
const band = { plain: 0, SILENCED: 0, NOELIG: 0, RES2PLUS: 0, FIRST: 0, UNCLASS: 0, eligFirst: 0, eligFirstTot: 0, eligRes: 0, eligResTot: 0 };
console.log('seed days batches res worked racksFull plain say deaths rank wave | SILENCED NOELIG RES2PLUS FIRST UNCLASS | eligSplit');
for (const seed of seeds) {
  const c = load(1, seed);
  const cc = c.classCounts || {};
  const s = cc['P-SILENCED'] || 0, n = cc['P-RACKS-NOELIG'] || 0, r = cc['P-RES2PLUS'] || 0, f = cc['P-FIRST-NOSMOKE'] || 0, u = cc.UNCLASSIFIED || 0;
  band.plain += c.plainLines || 0; band.SILENCED += s; band.NOELIG += n; band.RES2PLUS += r; band.FIRST += f; band.UNCLASS += u;
  const es = c.eligSplit || {};
  if (es['P-FIRST-NOSMOKE']) { band.eligFirst += es['P-FIRST-NOSMOKE'].eligiblePresent; band.eligFirstTot += es['P-FIRST-NOSMOKE'].total; }
  if (es['P-RES2PLUS']) { band.eligRes += es['P-RES2PLUS'].eligiblePresent; band.eligResTot += es['P-RES2PLUS'].total; }
  console.log(`${seed} ${c.daysAlive} ${c.preserveVillagerBatches} ${c.preserveVillagerResolutions} ${c.workedLines} ${c.racksFullLines} ${c.plainLines} ${c.sayTotal} ${c.deaths} ${c.rank} ${c.waveReach.length} | ${s} ${n} ${r} ${f} ${u} | FIRST elig ${es['P-FIRST-NOSMOKE'] ? es['P-FIRST-NOSMOKE'].eligiblePresent + '/' + es['P-FIRST-NOSMOKE'].total : '-'} RES elig ${es['P-RES2PLUS'] ? es['P-RES2PLUS'].eligiblePresent + '/' + es['P-RES2PLUS'].total : '-'}`);
  console.log(`  byCook: ${JSON.stringify(c.byCookClass)}`);
}
console.log(`BAND plain=${band.plain} SILENCED=${band.SILENCED} NOELIG=${band.NOELIG} RES2PLUS=${band.RES2PLUS} FIRST=${band.FIRST} UNCLASS=${band.UNCLASS}`);
console.log(`ELIG SPLIT FIRST ${band.eligFirst}/${band.eligFirstTot} RES ${band.eligRes}/${band.eligResTot}`);
console.log('--- sense samples: first line of each non-empty class per seed (first 3 seeds with that class) ---');
const shown = {};
for (const seed of seeds) {
  const c = load(1, seed);
  for (const p of (c.plainDetail || [])) {
    if ((shown[p.class] || 0) >= 1) continue;
    shown[p.class] = 1;
    console.log(`[${p.class}] seed=${seed} d${p.day} cook=${p.cook} resIndex=${p.resIndex} racksFull=${p.racksFull} elig=${p.eligiblePresent} (${p.eligibleCount} stacks, ${p.eligibleKcal} kcal) preserved=${p.preservedKcal} rackCap=${p.rackCap} voiceToday=${p.voiceSpokenToday} :: ${p.text}`);
  }
}
console.log('--- NOELIG lines, all (if any) ---');
let noeligShown = 0;
for (const seed of seeds) {
  const c = load(1, seed);
  for (const p of (c.plainDetail || [])) {
    if (p.class !== 'P-RACKS-NOELIG') continue;
    noeligShown++;
    if (noeligShown <= 20) console.log(`[NOELIG] seed=${seed} d${p.day} cook=${p.cook} resIndex=${p.resIndex} preserved=${p.preservedKcal} rackCap=${p.rackCap} elig=${p.eligiblePresent} voiceToday=${p.voiceSpokenToday} :: ${p.text}`);
  }
}
console.log(`NOELIG lines total: ${noeligShown}`);
console.log('--- wall numbers (cap1) ---');
const days = seeds.map(s => load(1, s).daysAlive).sort((a, b) => a - b);
const nat = seeds.filter(s => load(1, s).national).length;
const w4 = seeds.filter(s => load(1, s).waveReach.length >= 4).length;
const w5 = seeds.filter(s => load(1, s).waveReach.length >= 5).length;
const tab = seeds.filter(s => load(1, s).table).length;
console.log(`national-or-better ${nat}/8 table ${tab}/8 wins ${tab}/8 wave4 ${w4}/8 wave5 ${w5}/8 median daysAlive ${days[3]} (sorted ${days.join(',')})`);
