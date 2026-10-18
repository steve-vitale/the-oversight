#!/usr/bin/env node
// killdisc-analyze-20261018.js — sim-killdisc STAGE 1 diagnostic analysis.
//
// Reads evidence/2026-10-18/perseed-killdisc-diag/*.json and answers the
// kill-securing question: companion damage-share vs kill-share in wave-3
// fights.
//
// Outputs:
//   - per-kill table (day, monster, killer, shape, companion dmg-share,
//     kill-share attribution, single-monster?)
//   - corpus aggregates: total companion damage-share, companion kill-share,
//     the gap; per-companion damage ranking; other-share (instrument trust)
//   - the design input for the kill-discipline rule: distribution of
//     companion single-hit damage (what "kill range" the scholar should
//     hold inside of).
//
// Usage: node scripts/killdisc-analyze-20261018.js [perseed-dir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-18', 'perseed-killdisc-diag');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_') && !f.startsWith('.'));
const kills = [];
let totSch = 0, totComp = 0, totOther = 0, totHits = 0;
let nKills = 0, nCompKills = 0, nSchKills = 0, nSingle = 0, nDmg = 0;
const compDmgByVid = {};
const compHits = []; // per-kill companion damage (for hit-size distribution)
const shapeDmg = {};

for (const f of files) {
  const row = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (row.error) continue;
  for (const k of (row.kills || [])) {
    nKills++;
    if (k.companion) nCompKills++;
    if (k.scholarKill) nSchKills++;
    if (!k.dmg) continue;
    nDmg++;
    const d = k.dmg;
    if (d.singleMonster) nSingle++;
    totSch += d.scholar; totComp += d.companion; totOther += d.other; totHits += d.hits;
    kills.push({
      file: f, day: k.d, mid: k.mid, by: k.byName || k.by, via: k.via,
      shape: k.shape, companion: k.companion, scholarKill: k.scholarKill,
      sch: d.scholar, comp: d.companion, other: d.other,
      compShare: d.compShare, single: d.singleMonster,
    });
    for (const [vid, v] of Object.entries(d.byVid || {})) {
      compDmgByVid[vid] = (compDmgByVid[vid] || 0) + v;
    }
    if (d.companion > 0) compHits.push(d.companion);
    const sh = k.shape || 'unknown';
    shapeDmg[sh] = shapeDmg[sh] || { sch: 0, comp: 0, kills: 0, compKills: 0 };
    shapeDmg[sh].sch += d.scholar; shapeDmg[sh].comp += d.companion;
    shapeDmg[sh].kills++;
    if (k.companion) shapeDmg[sh].compKills++;
  }
}

const tot = totSch + totComp + totOther;
console.log('=== KILLDISC DIAGNOSTIC: companion damage-share vs kill-share ===');
console.log(`runs: ${files.length}, wave-3 kills: ${nKills} (companion ${nCompKills}, scholar ${nSchKills}), dmg-attached: ${nDmg}/${nKills} (single-monster ${nSingle})`);
console.log('');
console.log('CORPUS DAMAGE (wave-3 fights with kills):');
console.log(`  scholar   ${totSch}  (${(100 * totSch / Math.max(1, tot)).toFixed(1)}%)`);
console.log(`  companion ${totComp}  (${(100 * totComp / Math.max(1, tot)).toFixed(1)}%)`);
console.log(`  other     ${totOther}  (${(100 * totOther / Math.max(1, tot)).toFixed(1)}%)  <- instrument-trust line`);
console.log(`  total hits attributed: ${totHits}`);
console.log('');
console.log('KILL-SHARE:');
console.log(`  companion kills ${nCompKills}/${nKills} = ${(100 * nCompKills / Math.max(1, nKills)).toFixed(1)}%`);
console.log(`  scholar kills   ${nSchKills}/${nKills} = ${(100 * nSchKills / Math.max(1, nKills)).toFixed(1)}%`);
console.log('');
const dmgShare = totComp / Math.max(1, tot), killShare = nCompKills / Math.max(1, nKills);
console.log(`THE GAP: companion damage-share ${(100 * dmgShare).toFixed(1)}% vs kill-share ${(100 * killShare).toFixed(1)}% (gap ${(100 * (dmgShare - killShare)).toFixed(1)}pp)`);
console.log(dmgShare - killShare > 0.10
  ? 'VERDICT: KILL-SECURING GAP CONFIRMED — companions deal real damage but rarely land the blow. A kill-discipline rule is the right next lever.'
  : 'VERDICT: no securing gap — companion damage is thin; the lever is capability (arming/leveling), not discipline.');
console.log('');
console.log('BY SHAPE:');
for (const [sh, s] of Object.entries(shapeDmg).sort((a, b) => b[1].kills - a[1].kills)) {
  const st = s.sch + s.comp;
  console.log(`  ${sh}: kills=${s.kills} compKills=${s.compKills} dmg comp-share=${(100 * s.comp / Math.max(1, st)).toFixed(1)}%`);
}
console.log('');
console.log('PER-KILL (companion dmg-share vs who killed):');
for (const k of kills.sort((a, b) => a.day - b.day)) {
  console.log(`  d${k.day} ${k.mid} by=${k.by}${k.companion ? ' [COMPANION]' : ''} shape=${k.shape} compShare=${k.compShare == null ? 'n/a' : (100 * k.compShare).toFixed(0) + '%'} (sch ${k.sch}/comp ${k.comp}/other ${k.other})${k.single ? '' : ' MULTI'}`);
}
console.log('');
if (compHits.length) {
  const s = compHits.slice().sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  console.log(`companion per-fight damage: n=${s.length} min=${s[0]} p25=${q(0.25)} median=${q(0.5)} p75=${q(0.75)} max=${s[s.length - 1]}`);
  console.log('(design input: the kill-discipline hold range should cover a typical companion fight-total in the low hundreds)');
}
const out = {
  runs: files.length, nKills, nCompKills, nSchKills, nDmg, nSingle,
  corpus: { scholar: totSch, companion: totComp, other: totOther, hits: totHits },
  dmgShare: +dmgShare.toFixed(3), killShare: +killShare.toFixed(3),
  gapPp: +((dmgShare - killShare) * 100).toFixed(1),
  otherShare: +(totOther / Math.max(1, tot)).toFixed(3),
  byShape: shapeDmg,
  kills,
};
fs.writeFileSync(path.join(DIR, '_analysis.json'), JSON.stringify(out, null, 1) + '\n');
console.log('\nwrote _analysis.json');
