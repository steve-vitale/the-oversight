#!/usr/bin/env node
// r63 analyzer: reads journey-establishment-r63-seed{329,330,331,332}.json
// plus journey-establishment-r63-repeatsit-seed{329,330,331,332}.json
// from EVID dir, prints the pre-registered verdict table. Usage:
//   node scripts/analyze-journey-establishment-r63-20261030.js [EVIDDIR]
'use strict';
const fs = require('fs');
const EVID = process.argv[2] || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-30';
const SEEDS = [329, 330, 331, 332];
const sum = (a, f) => a.reduce((t, x) => t + (f(x) || 0), 0);
for (const seed of SEEDS) {
  const p = `${EVID}/journey-establishment-r63-seed${seed}.json`;
  let j;
  try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { console.log(`seed ${seed}: MISSING/UNREADABLE ${p} (${e.message})`); continue; }
  const mt = j.materialTrace || [];
  const maxStash = (m) => mt.reduce((t, r) => Math.max(t, (r.stash && r.stash[m]) || 0), 0);
  const maxPack = (m) => mt.reduce((t, r) => Math.max(t, (r.pack && r.pack[m]) || 0), 0);
  const maxNpc = (m) => mt.reduce((t, r) => Math.max(t, (r.npcTotal && r.npcTotal[m]) || 0), 0);
  const last = mt.length ? mt[mt.length - 1] : {};
  const addBy = {};
  for (const r of (j.addMaterialLog || [])) addBy[r.mat] = (addBy[r.mat] || 0) + 1;
  const donBy = {};
  for (const r of (j.donateMaterialLog || [])) donBy[r.mat] = (donBy[r.mat] || 0) + 1;
  const lessons = (j.skillLessonLog || []).filter(r => r.via === 'villager');
  const lessonDays = new Set(lessons.map(r => r.day)).size;
  const distinct = new Set(lessons.map(r => r.skill)).size;
  const craft = j.armorCraftLog || [];
  const starv = (j.deaths || []).filter(d => d.day >= 15 && /starvat|hunger|thirst/.test(String(d.cause || '')));
  const g = j.guardrails || {};
  console.log(`\n=== seed ${seed} (reachedDay ${j.reachedDay}, over ${j.over}) ===`);
  console.log(`  materialTrace days: ${mt.length} (wrap addMat=${j.addMaterialWrap} donateMat=${j.donateMaterialWrap})`);
  console.log(`  stash max: bark=${maxStash('bark')} vine=${maxStash('vine')} hide=${maxStash('hide')} branch=${maxStash('branch')} | final: ${JSON.stringify(last.stash || {})}`);
  console.log(`  player pack max: bark=${maxPack('bark')} vine=${maxPack('vine')} hide=${maxPack('hide')} branch=${maxPack('branch')}`);
  console.log(`  NPC pack max: bark=${maxNpc('bark')} vine=${maxNpc('vine')} hide=${maxNpc('hide')} branch=${maxNpc('branch')}`);
  console.log(`  addMaterial calls: ${JSON.stringify(addBy)} | donateMaterial calls: ${JSON.stringify(donBy)}`);
  console.log(`  armor_craft rows: ${craft.length} ok=${craft.filter(r => r.ok).length} | gearEnd stash: ${JSON.stringify((j.gearCensusEnd || {}).stashMaterials || {})} wornBark=${(j.gearCensusEnd || {}).wornBark} wornHide=${(j.gearCensusEnd || {}).wornHide}`);
  console.log(`  lessons villager-via: ${lessons.length} rows, ${lessonDays} days, ${distinct} distinct skills [${[...new Set(lessons.map(r => r.skill))].join(', ')}]`);
  console.log(`  LESSON-DIST: ${lessonDays >= 21 || distinct >= 5 ? 'GO' : 'NO-GO'} (days>=21? ${lessonDays >= 21}, distinct>=5? ${distinct >= 5})`);
  console.log(`  guardrails: alive=${g.popAlive} pantry=${g.pantryKcal} tier=${g.tier} deaths=${(j.deaths || []).length} starvation=${starv.length} arrivals=${(j.arrivals || []).length}`);
  console.log(`  mship: ${JSON.stringify(j.mshipSnap || null)}`);
  const hc = (j.armorCraftLog || []).filter(r => r.item === 'hide_armor');
  console.log(`  hide_craft rows: ${hc.length} ok=${hc.filter(r => r.ok).length} | bark_craft ok=${craft.filter(r => r.ok && r.item !== 'hide_armor').length}`);
  let rp = null;
  try { rp = JSON.parse(fs.readFileSync(`${EVID}/journey-establishment-r63-repeatsit-seed${seed}.json`, 'utf8')); } catch (e) { rp = { verdict: 'MISSING', error: e.message }; }
  const s = (rp && rp.subject) || {};
  const remOk = ((s.remaining || []).filter(x => x.why === 'ok')).map(x => x.sid);
  console.log(`  REPEATSIT: verdict=${rp.verdict} subject=${s.name || '-'} day ${s.day1 || '-'}->${s.day2 || '-'} offers1=${JSON.stringify(s.offers1 || null)} pick=${s.pick || '-'} done ${s.lessonDoneBefore}->${s.lessonDoneAfter} offers2=${JSON.stringify(s.offers2 || null)} menu2=${JSON.stringify(s.menu2 || null)} remainingOk=${JSON.stringify(remOk)} doneDay2=${s.lessonDoneDay2} control=${rp.control ? (rp.control.name + ' offers=' + JSON.stringify(rp.control.offers)) : '-'}`);
  let lp = null;
  try { lp = JSON.parse(fs.readFileSync(`${EVID}/journey-establishment-r63-learn-seed${seed}.json`, 'utf8')); } catch (e) { lp = { verdict: 'MISSING', error: e.message }; }
  console.log(`  LEARN: verdict=${lp.verdict} gained=${JSON.stringify(lp.gained || [])} before=${(lp.before || []).length} after=${(lp.after || []).length} days=${(lp.days || []).map(d => d.took ? d.took.skill + '@' + d.took.teacherName : 'none').join(', ')} hideWearers=${JSON.stringify((lp.hideSnap || {}).hideWearers || [])} stashHide=${(lp.hideSnap || {}).stashHide} playerHideRecipe=${JSON.stringify((lp.hideSnap || {}).playerHideRecipe || null)}`);
  // --- r63 additions: HIDE opener, CONTEST-DEATH name match, FOOD-DISTRIBUTION ---
  const hideEnd = lp.hideSnapEnd || {};
  const hideRecipe = (lp.hideSnap || {}).playerHideRecipe || hideEnd.playerHideRecipe || null;
  const hideRecipeLvl = (hideRecipe && (hideRecipe.level || hideRecipe.lvl)) || 0;
  console.log(`  HIDE: playerRecipeLvl=${hideRecipeLvl} recipe=${JSON.stringify(hideRecipe)} wearersEnd=${JSON.stringify(hideEnd.hideWearers || [])} stashHideEnd=${hideEnd.stashHide} wornHideEnd=${(j.gearCensusEnd || {}).wornHide} hideCraftOk=${hc.filter(r => r.ok).length}/${hc.length}`);
  const cds = j.contestDeathSnap || {};
  const contestTele = (j.deaths || []).filter(d => String(d.cause || '') === 'contest');
  const namedDeaths = (j.deaths || []).filter(d => d.who && d.who !== 'Someone');
  const popDrop = (cds.rosterStartLen || 0) - (cds.rosterEndLen || 0);
  const cdKeys = cds.contestDeathsById ? Object.keys(cds.contestDeathsById) : [];
  const bareCounter = cdKeys.length > 0 && cdKeys.every(k => !/^[A-Za-z]/.test(k) || k === 'drop' || !namedDeaths.some(d => d.who === k));
  const cdVerdict = contestTele.length === 0 ? 'NO-CONTEST-DEATH'
    : (cdKeys.length && !bareCounter && popDrop === namedDeaths.length ? 'LEDGERED'
    : (cdKeys.length && bareCounter ? 'BARE-COUNTER' : 'UNMATCHED'));
  console.log(`  CONTEST-DEATH: verdict=${cdVerdict} teleContest=${JSON.stringify(contestTele.map(d => d.who + '@d' + d.day))} raw=${JSON.stringify(cds.contestDeathsById || null)} rosterStart=${cds.rosterStartLen} rosterEnd=${cds.rosterEndLen} popDrop=${popDrop} namedDeaths=${namedDeaths.length} (${namedDeaths.map(d => d.who).join(', ')})`);
  const nameById = {};
  for (const r of (j.censusEnd || [])) nameById[String(r.id)] = r.name;
  const lastHealth = (j.healthSnaps || []).length ? (j.healthSnaps[j.healthSnaps.length - 1].health || {}) : {};
  const lowHealth = Object.entries(lastHealth).filter(([id, hp]) => id !== 'player' && typeof hp === 'number' && hp < 50)
    .map(([id, hp]) => `${nameById[id] || id}:${hp}`);
  console.log(`  FOOD-DIST: endPantryKcal=${g.pantryKcal} lowHealthLiving=${JSON.stringify(lowHealth)} verdict=${(lowHealth.length === 0 || (g.pantryKcal || 0) <= 2000) && starv.length === 0 ? 'DIST-OK' : 'DIST-FLAG'} starvation=${starv.length}`);
}
console.log('\nPanel SUPPLY verdict: BRIDGE-ABSENT iff every seed shows stash bark/vine/hide max 0 AND npc max 0 AND some seed shows pack max > 0.');
{ const counts = {};
  for (const seed of SEEDS) { try { const rp = JSON.parse(fs.readFileSync(`${EVID}/journey-establishment-r63-repeatsit-seed${seed}.json`, 'utf8')); counts[rp.verdict] = (counts[rp.verdict] || 0) + 1; } catch (e) { counts.MISSING = (counts.MISSING || 0) + 1; } }
  const sticky = counts.STICKY || 0, ret = counts.OFFERS_RETURN || 0, no = counts['NO-OFFER'] || 0;
  const panel = sticky >= 3 ? 'STICKY-REPRO' : (ret >= 3 ? 'STICKY-ABSENT' : (no >= 3 ? 'NO-OFFER' : 'MIXED'));
  console.log(`Panel REPEATSIT verdict: ${panel} (counts ${JSON.stringify(counts)})`); }
{ const lg = [];
  for (const seed of SEEDS) { try { const lp = JSON.parse(fs.readFileSync(`${EVID}/journey-establishment-r63-learn-seed${seed}.json`, 'utf8')); lg.push(`${seed}:${lp.verdict}(${(lp.gained || []).length})`); } catch (e) { lg.push(`${seed}:MISSING`); } }
  console.log(`Panel LEARN: ${lg.join(' ')}`); }
