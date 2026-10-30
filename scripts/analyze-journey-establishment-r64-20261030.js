#!/usr/bin/env node
// r64 analyzer: reads journey-establishment-r64-seed{333..336}.json plus
// hidecraft / arrivals / learn / repeatsit probe files from EVID dir,
// prints the pre-registered verdict table. A missing probe file on an
// over=true seed is SKIP-over (probes return before writing), NOT a crash.
// Usage: node scripts/analyze-journey-establishment-r64-20261030.js [EVIDDIR]
'use strict';
const fs = require('fs');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-30';
const SEEDS = [333, 334, 335, 336];
const load = (n) => { try { return JSON.parse(fs.readFileSync(`${EVID}/${n}`, 'utf8')); } catch (e) { return null; } };
for (const seed of SEEDS) {
  const j = load(`journey-establishment-r64-seed${seed}.json`);
  if (!j) { console.log(`\n=== seed ${seed}: PANEL JSON MISSING ===`); continue; }
  const g = j.guardrails || {};
  const vDeaths = (j.deaths || []).filter(d => d.kind !== 'monster');
  const mKills = (j.deaths || []).filter(d => d.kind === 'monster');
  const starv = (j.deaths || []).filter(d => d.day >= 15 && /starvat|hunger|thirst/.test(String(d.cause || '')));
  const craft = j.armorCraftLog || [];
  const lessons = (j.skillLessonLog || []).filter(r => r.via === 'villager');
  const lessonDays = new Set(lessons.map(r => r.day)).size;
  const distinct = new Set(lessons.map(r => r.skill)).size;
  const ints = (j.intakeDays || []).slice(-7);
  const starvCounts = ints.map(d => (d.starving || []).length);
  const meanStarv = starvCounts.length ? (starvCounts.reduce((a, b) => a + b, 0) / starvCounts.length) : null;
  const cds = j.contestDeathSnap || {};
  const contestTele = (j.deaths || []).filter(d => String(d.cause || '') === 'contest');
  const cdKeys = cds.contestDeathsById ? Object.keys(cds.contestDeathsById) : [];
  const cdVerdict = contestTele.length === 0 ? 'NO-CONTEST-DEATH(UNTESTED)'
    : (cdKeys.length && (cds.rosterStartLen - cds.rosterEndLen) === vDeaths.length ? 'LEDGERED' : 'UNMATCHED');
  console.log(`\n=== seed ${seed} (reachedDay ${j.reachedDay}, over ${j.over} ${JSON.stringify(j.overCause || {})}) ===`);
  console.log(`  guardrails: alive=${g.popAlive} pantry=${g.pantryKcal} tier=${g.tier} villagerDeaths=${vDeaths.length} ${JSON.stringify(vDeaths.map(d => d.who + ':' + d.cause))} monsterKills=${mKills.length} contests=${JSON.stringify((g.contestList || []).map(c => c.cid + ':' + c.outcome))}`);
  console.log(`  gear: startHide=${(j.gearCensusStart || {}).wornHide} endHide=${(j.gearCensusEnd || {}).wornHide} endBark=${(j.gearCensusEnd || {}).wornBark} craftRows=${JSON.stringify(craft.map(r => r.item + ':' + (r.ok ? 'ok' : 'fail') + '@d' + r.day + ':' + r.name))}`);
  console.log(`  LESSON-DIST: ${lessonDays >= 21 || distinct >= 5 ? 'GO' : 'NO-GO'} (villager-via days=${lessonDays} distinct=${distinct})`);
  console.log(`  FOOD-INTAKE: final7 starving=${JSON.stringify(starvCounts)} mean=${meanStarv === null ? '-' : meanStarv.toFixed(2)} starvationDeaths=${starv.length} verdict=${(meanStarv !== null && meanStarv <= 1 && starv.length === 0) ? 'DIST-OK' : 'DIST-FLAG'}`);
  console.log(`  CONTEST-DEATH: ${cdVerdict} raw=${JSON.stringify(cds.contestDeathsById || null)} roster ${cds.rosterStartLen}->${cds.rosterEndLen} namedDeaths=${vDeaths.length}`);
  console.log(`  mship: ${JSON.stringify(j.mshipSnap || null)}`);
  for (const [kind, file] of [['HIDECRAFT', `journey-establishment-r64-hidecraft-seed${seed}.json`], ['ARRIVALS', `journey-establishment-r64-arrivals-seed${seed}.json`], ['LEARN', `journey-establishment-r64-learn-seed${seed}.json`], ['REPEATSIT', `journey-establishment-r64-repeatsit-seed${seed}.json`]]) {
    const p = load(file);
    if (!p) { console.log(`  ${kind}: ${j.over ? 'SKIP-over (no file by design — probe returns before writing)' : 'MISSING'}`); continue; }
    if (kind === 'HIDECRAFT') console.log(`  HIDECRAFT: verdict=${p.verdict} attempts=${JSON.stringify(p.attempts.map(a => 'd' + a.day + ' L' + ((a.recipe && a.recipe.level) || 0) + ' pack=' + JSON.stringify(a.packMats) + ' stashHide=' + ((a.stashMats || {}).hide || 0) + ' ->' + a.result))}`);
    if (kind === 'ARRIVALS') console.log(`  ARRIVALS: verdict=${p.verdict} accepted=${p.accepted ? (p.accepted.name + ' score=' + p.accepted.score) : '-'} days=${JSON.stringify((p.days || []).map(d => 'd' + d.day + (d.joined ? ':JOINED' : '')))}`);
    if (kind === 'LEARN') console.log(`  LEARN: verdict=${p.verdict} gained=${JSON.stringify(p.gained || [])} hideRecipe=${JSON.stringify((p.hideSnap || {}).playerHideRecipe || null)} wearers=${JSON.stringify((p.hideSnap || {}).hideWearers || [] )} stashHide=${(p.hideSnap || {}).stashHide}`);
    if (kind === 'REPEATSIT') console.log(`  REPEATSIT: verdict=${p.verdict} subject=${(p.subject || {}).name || '-'}`);
  }
}
console.log('\nPanel verdicts (pre-registered bars):');
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r64-hidecraft-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'SKIP-over'}`); }
  console.log(`  HIDE-CRAFT-PLAYER: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r64-arrivals-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'SKIP-over'}`); }
  console.log(`  ARRIVALS-ACCEPT: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r64-learn-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict + '(' + (p.gained || []).length + ')' : 'SKIP-over'}`); }
  console.log(`  LEARN: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r64-repeatsit-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'SKIP-over'}`); }
  console.log(`  REPEATSIT: ${v.join(' ')}`); }
{ let barkOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r64-seed${seed}.json`); if (j) barkOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'bark_armor').length; }
  console.log(`  BARK-CRAFT panel ok rows: ${barkOk} -> ${barkOk >= 1 ? 'GO' : 'NO-GO'}`); }
{ let hideOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r64-seed${seed}.json`); if (j) hideOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'hide_armor').length; }
  console.log(`  HIDE-CRAFT (NPC tele rows) panel ok rows: ${hideOk}`); }
