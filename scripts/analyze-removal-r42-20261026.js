// scripts/analyze-removal-r42-20261026.js — join removal rows to vanished
// wave-4 spawns for journey-scale r42 (lane A).
//
// Reads evidence/2026-10-26/journey-scale-r42-removal/s<seed>-fate.json
// (written by scripts/test-removalsite-r42.js, which embeds the
// removalsite rows + the spawnfate census). Reuses the driver's own
// classifyFate() so the fate partition is identical to the driver's
// summary — never a second implementation of the partition.
//
// Join rule (stated, not hidden): a vanished spawn's removal is the
// removal row with the same monster id, day in [lastDay, lastDay+3],
// preferring an exact tile match (lastTx,lastTy), else playerDist <= 1,
// else nearest day. A vanished spawn with no matching row is reported
// as removal-unclassified — it is a recorder gap or a bypassing splice,
// never silently assigned a site. Lift-restore pairs (removal row
// followed by a later census sighting of the same seq) are counted
// separately: they are lifts, not deaths, and cannot explain a vanished
// spawn (vanished means no later sighting by definition).
//
// Usage: node scripts/analyze-removal-r42-20261026.js [EVIDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyFate } = require('./test-removalsite-r42');

const EVIDIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'journey-scale-r42-removal');
const files = fs.readdirSync(EVIDIR).filter(f => /^s\d+-fate\.json$/.test(f)).sort();
if (!files.length) { console.log('no fate JSONs in ' + EVIDIR); process.exit(1); }

const siteCounts = {};
let vanishedTotal = 0, vanishedWithSite = 0, unclassifiedRemoval = 0;
for (const f of files) {
  const row = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8'));
  const c = classifyFate(row);
  const removals = (row.removalsite && row.removalsite.rows) || [];
  const vanished = c.detail.filter(d => d.fate.indexOf('vanished') === 0);
  console.log(`seed ${c.seed}: spawns4=${c.spawns4} fates=${JSON.stringify(c.fates)} vanished=${vanished.length} removalRows=${removals.length} installed=${!!(row.removalsite && row.removalsite.diag && row.removalsite.diag.installed)}`);
  for (const v of vanished) {
    vanishedTotal++;
    const cands = removals.filter(r =>
      r.id === v.type && r.day >= v.life.lastDay && r.day <= v.life.lastDay + 3);
    const exact = cands.find(r => r.tx === v.life.lastTx && r.ty === v.life.lastTy);
    const near = cands.find(r => r.playerDist != null && r.playerDist <= 1);
    const hit = exact || near || (cands.length ? cands[0] : null);
    if (hit) {
      vanishedWithSite++;
      siteCounts[hit.site] = (siteCounts[hit.site] || 0) + 1;
      console.log(`   vanished seq=${v.seq} ${v.type} lastSeen d${v.life.lastDay} (${v.life.lastTx},${v.life.lastTy}) minDist=${v.life.minDist} fate=${v.fate} -> ${hit.site} d${hit.day} (${hit.tx},${hit.ty}) hp=${hit.hp} lingering=${hit.lingering} titan=${hit.titan} tbActive=${hit.tbActive} fightMonster=${hit.fightMonster} fightIds=[${(hit.fightIds || []).join(',')}] stack=${(hit.stack && hit.stack.gameFrame) || '-'}`);
    } else {
      unclassifiedRemoval++;
      console.log(`   vanished seq=${v.seq} ${v.type} lastSeen d${v.life.lastDay} (${v.life.lastTx},${v.life.lastTy}) minDist=${v.life.minDist} fate=${v.fate} -> REMOVAL-UNCLASSIFIED (no removal row id=${v.type} d${v.life.lastDay}-${v.life.lastDay + 3}; ${removals.length} rows total)`);
    }
  }
  // Gauntlet-day spotlight: all removal rows on days with a tb-bystander-lift.
  const bystanders = removals.filter(r => r.site === 'tb-bystander-lift');
  if (bystanders.length) {
    const byDay = {};
    for (const b of bystanders) (byDay[b.day] = byDay[b.day] || []).push(b);
    for (const d of Object.keys(byDay).sort((a, b) => a - b)) {
      console.log(`   BYSTANDER-DAY d${d}: ${byDay[d].map(b => `${b.id} seq=${b.seq} (${b.tx},${b.ty}) hp=${b.hp} lingering=${b.lingering} fightIds=[${(b.fightIds || []).join(',')}]`).join(' | ')}`);
    }
  }
}
console.log(`\nREMOVAL SUMMARY: vanished=${vanishedTotal} withSite=${vanishedWithSite} unclassified=${unclassifiedRemoval} sites=${JSON.stringify(siteCounts)}`);
