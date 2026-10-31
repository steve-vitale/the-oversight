#!/usr/bin/env node
// r65 analyzer: reads journey-establishment-r65-seed{337..340}.json plus
// hidecraft / arrivals / learn / repeatsit probe files from EVID dir,
// prints the pre-registered verdict table. A missing probe file on an
// over=true seed is SKIP-over (probes return before writing), NOT a crash.
// Usage: node scripts/analyze-journey-establishment-r65-20261030.js [EVIDDIR]
'use strict';
const fs = require('fs');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-30';
const SEEDS = [337, 338, 339, 340];
const load = (n) => { try { return JSON.parse(fs.readFileSync(`${EVID}/${n}`, 'utf8')); } catch (e) { return null; } };
for (const seed of SEEDS) {
  const j = load(`journey-establishment-r65-seed${seed}.json`);
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
  for (const [kind, file] of [['HIDECRAFT', `journey-establishment-r65-hidecraft-seed${seed}.json`], ['BARKCRAFT', `journey-establishment-r65-barkcraft-seed${seed}.json`], ['CONTESTDEATH', `journey-establishment-r65-contestdeath-seed${seed}.json`], ['ARRIVALS', `journey-establishment-r65-arrivals-seed${seed}.json`], ['LEARN', `journey-establishment-r65-learn-seed${seed}.json`], ['REPEATSIT', `journey-establishment-r65-repeatsit-seed${seed}.json`]]) {
    const p = load(file);
    if (!p) { console.log(`  ${kind}: MISSING (r65 probes always write — this is a crash, not a skip)`); continue; }
    if (kind === 'HIDECRAFT') console.log(`  HIDECRAFT: verdict=${p.verdict} attempts=${JSON.stringify(p.attempts.map(a => 'd' + a.day + ' L' + ((a.recipe && a.recipe.level) || 0) + ' pack=' + JSON.stringify(a.packMats) + ' stashHide=' + ((a.stashMats || {}).hide || 0) + ' ->' + a.result))}`);
    if (kind === 'ARRIVALS') console.log(`  ARRIVALS: verdict=${p.verdict} accepted=${p.accepted ? (p.accepted.name + ' score=' + p.accepted.score) : '-'} days=${JSON.stringify((p.days || []).map(d => 'd' + d.day + (d.joined ? ':JOINED' : '')))}`);
    if (kind === 'LEARN') console.log(`  LEARN: verdict=${p.verdict} gained=${JSON.stringify(p.gained || [])} hideRecipe=${JSON.stringify((p.hideSnap || {}).playerHideRecipe || null)} wearers=${JSON.stringify((p.hideSnap || {}).hideWearers || [] )} stashHide=${(p.hideSnap || {}).stashHide}`);
    if (kind === 'REPEATSIT') console.log(`  REPEATSIT: verdict=${p.verdict} subject=${(p.subject || {}).name || '-'}`);
    if (kind === 'BARKCRAFT') console.log(`  BARKCRAFT: verdict=${p.verdict} attempts=${JSON.stringify(p.attempts.map(a => 'd' + a.day + ' L' + ((a.recipe && a.recipe.level) || 0) + ' pack=' + JSON.stringify(a.packMats) + ' ->' + a.result))}`);
    if (kind === 'CONTESTDEATH') console.log(`  CONTESTDEATH: verdict=${p.verdict} subject=${(p.subject || {}).name || '-'} checks1=${JSON.stringify(p.after1Checks || null)} checks2=${JSON.stringify(p.after2Checks || null)}`);
    if (kind === 'LEARN') {
      const grants = (j.grantLog || []).filter(g => g.phase === 'learn' && g.domain === 'skill');
      const untraced = (p.gained || []).filter(s => !grants.some(g => g.id === s));
      console.log(`  LEARN-JUMP: gained=${JSON.stringify(p.gained || [])} probeSkillGrants=${JSON.stringify(grants.map(g => 'd' + g.day + ':' + g.id + '/' + g.type + (g.by ? '/by:' + g.by : '')))} untraced=${JSON.stringify(untraced)} -> ${untraced.length ? 'UNTRACED' : 'TRACED'}`);
      const weekly = j.gearWeekly || [];
      const snaps = [j.gearCensusStart, ...weekly, j.gearCensusEnd].filter(Boolean);
      const wearers = {};
      for (const s of snaps) for (const r of (s.villagers || [])) { const arm = (r.equipped || []).filter(x => x === 'bark_armor' || x === 'hide_armor'); if (arm.length) wearers[r.id] = wearers[r.id] || { name: r.name, firstDay: s.day, pieces: arm }; }
      console.log(`  EQUIP-TRACE: snapshots=${snaps.map(s => 'd' + s.day).join(',')} wearers=${JSON.stringify(wearers)} craftRows=${JSON.stringify((j.armorCraftLog || []).map(r => r.item + ':' + (r.ok ? 'ok' : 'fail') + '@d' + r.day + ':' + r.name))}`);
    }
  }
}
console.log('\nPanel verdicts (pre-registered bars):');
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-hidecraft-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  HIDE-CRAFT-PLAYER: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-arrivals-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  ARRIVALS-ACCEPT: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-learn-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict + '(' + (p.gained || []).length + ')' : 'MISSING'}`); }
  console.log(`  LEARN: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-repeatsit-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  REPEATSIT: ${v.join(' ')}`); }
{ let barkOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r65-seed${seed}.json`); if (j) barkOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'bark_armor').length; }
  console.log(`  BARK-CRAFT panel ok rows: ${barkOk} -> ${barkOk >= 1 ? 'GO' : 'NO-GO'}`); }
{ let hideOk = 0;
  for (const seed of SEEDS) { const j = load(`journey-establishment-r65-seed${seed}.json`); if (j) hideOk += (j.armorCraftLog || []).filter(r => r.ok && r.item === 'hide_armor').length; }
  console.log(`  HIDE-CRAFT (NPC tele rows) panel ok rows: ${hideOk}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-barkcraft-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  BARK-CRAFT-ATTEMPT: ${v.join(' ')}`); }
{ const v = [];
  for (const seed of SEEDS) { const p = load(`journey-establishment-r65-contestdeath-seed${seed}.json`); v.push(`${seed}:${p ? p.verdict : 'MISSING'}`); }
  console.log(`  CONTEST-DEATH-STAGED: ${v.join(' ')}`); }
{ let missing = 0, total = 0;
  for (const seed of SEEDS) for (const k of ['repeatsit', 'learn', 'hidecraft', 'barkcraft', 'arrivals', 'contestdeath']) { total++; if (!load(`journey-establishment-r65-${k}-seed${seed}.json`)) missing++; }
  console.log(`  SKIP-FILES: missing ${missing}/${total} -> ${missing === 0 ? 'GO' : 'NO-GO'}`); }
