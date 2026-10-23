// scripts/analyze-r22-armor-20261022.js — analyze the r22 armor-road pilot.
// Reads evidence/2026-10-22/journey-scale-r22-armor/journey-scale-r22-armor-<seed>.json
// and prints: armored15 trajectory, r5 bar trajectory, crafts, and per-seed
// attribution of every P>=15 worn piece (item flags from items.json).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-22', 'journey-scale-r22-armor');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [40001, 40002, 40003, 40004]);
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
const list = Array.isArray(items) ? items : Object.values(items);
const defOf = (id) => list.find(d => d && d.id === id) || null;
function flags(id) {
  const d = defOf(id);
  if (!d) return '?';
  const f = [];
  if (d.findable) f.push('FIND');
  if (d.universal) f.push('UNIV');
  if (d.tier || d.lootTier) f.push('T' + (d.tier || d.lootTier));
  return f.join(',') || 'start?';
}
for (const seed of SEEDS) {
  const fp = path.join(EVIDIR, `journey-scale-r22-armor-${seed}.json`);
  if (!fs.existsSync(fp)) { console.log(`seed ${seed}: MISSING`); continue; }
  const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const c = d.census;
  console.log(`\n===== seed ${seed} =====`);
  console.log(`day=${c.day} over=${c.over}(${c.overCause || ''}) pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} rank=${c.scaleRank} wave=${c.maxWave} seat=${c.tableSeat}`);
  console.log(`crafts: hide=${c.hideArmorCrafted} bark=${c.barkArmorCrafted} vinebankDeferHide=${c.vinebankDeferHide} scholarWornP=${c.scholarWornP}`);
  console.log(`r5 final: ${c.r5 ? JSON.stringify({ armored: c.r5.armored, armed: c.r5.armed, tricks: c.r5.tricks, veterans: c.r5.veterans, ready: c.r5.ready, short: c.r5.short }) : 'n/a'}`);
  console.log('armored15 trajectory: ' + d.armorLedger.map(w => `d${w.day}:${w.armored15}`).join(' '));
  // final-week P>=15 fighters and their worn pieces
  const last = d.armorLedger[d.armorLedger.length - 1];
  console.log('final P>=15 fighters:');
  for (const f of last.fighters) {
    if (!f.alive || f.p < 15) continue;
    const pieces = (f.worn || []).map(w => `${w.id}(P${w.p})[${flags(w.id)}]`).join(' + ');
    console.log(`  ${f.n}: P${f.p} = ${pieces || '(unattributed sum)'}`);
  }
  // crafts in capture
  const cap = fs.readFileSync(path.join(EVIDIR, `journey-scale-r22-capture-${seed}.txt`), 'utf8');
  const craftLines = cap.split('\n').filter(l => /you (make|craft|fashion)/i.test(l) && /armor/i.test(l));
  if (craftLines.length) { console.log('armor crafts in capture:'); craftLines.slice(0, 10).forEach(l => console.log('  ' + l.slice(0, 160))); }
}
