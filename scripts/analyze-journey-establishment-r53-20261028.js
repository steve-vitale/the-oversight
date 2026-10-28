#!/usr/bin/env node
// r53 PANEL ANALYZER (read-only): armor-craft conversion + villager lessons.
// Reads r53 seed JSONs, prints per-seed verdicts against the prereg bars.
// Usage: node scripts/analyze-journey-establishment-r53-20261028.js [EVIDDIR]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28';
const load = (dir, n) => { try { return JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); } catch (e) { return null; } };
let craftOkPanel = 0, lessonGoSeeds = 0;
for (const s of [209, 228, 238, 239]) {
  const d = load(EVID, `journey-establishment-r53-seed${s}.json`);
  if (!d) { console.log(`== seed ${s}: r53 JSON missing`); continue; }
  const ac = d.armorCraftLog || [], sl = d.skillLessonLog || [];
  const vv = sl.filter(r => r.via === 'villager');
  const tot = {};
  for (const row of (d.foodLedger || [])) for (const [k, v] of Object.entries(row.typeCounts || {})) tot[k] = (tot[k] || 0) + v;
  const g0 = d.gearCensusStart || {}, g1 = d.gearCensusEnd || {};
  const m1 = (g1.stashMaterials || {});
  const wearers = (g1.villagers || []).filter(r => (r.equipped || []).includes('bark_armor') || (r.equipped || []).includes('hide_armor'))
    .map(r => `${r.name}(${r.equipped.filter(x => x === 'bark_armor' || x === 'hide_armor').join(',')},avCraft=${JSON.stringify(r.avCraft)})`);
  const craftGo = ac.some(r => r.ok);
  const lessonGo = vv.length >= 1;
  if (craftGo) craftOkPanel++;
  if (lessonGo) lessonGoSeeds++;
  console.log(`== seed ${s}: day=${d.reachedDay} alive=${d.guardrails.popAlive} pantry=${d.censusPantryKcal} tier=${d.guardrails.tier} starv=${d.c3.starvationDeaths}`);
  console.log(`   CRAFT rows=${ac.length} ok=${ac.filter(r => r.ok).length} foodLedgerArmor=${tot.armor_craft || 0} verdict=${craftGo ? 'GO' : 'NO-GO'}`);
  console.log(`   LESSON rows=${sl.length} villagerVia=${vv.length} foodLedgerSkill=${tot.skill_lesson || 0} skills=${[...new Set(vv.map(r => r.skill))].join(',')} verdict=${lessonGo ? 'GO' : 'NO-GO'}`);
  console.log(`   GEAR start bark=${g0.wornBark} hide=${g0.wornHide} spares=${g0.sparePieces} | end bark=${g1.wornBark} hide=${g1.wornHide} spares=${g1.sparePieces} wearers=[${wearers.join('; ')}]`);
  console.log(`   STASH end bark=${m1.bark} vine=${m1.vine} hide=${m1.hide} wood=${m1.wood} branch=${m1.branch}`);
}
console.log(`PANEL: CRAFT-GO seeds=${craftOkPanel}/4 (bar: >=1 ok row panel-wide) | LESSON-GO seeds=${lessonGoSeeds}/4 (bar: >=1 villager-via lesson per seed)`);
