#!/usr/bin/env node
// PROOF: the haul knowledge channel (journey r12, 2026-10-17).
//
// r11's blank: the villager haul-unrevealed path never fired in 3 seeds.
// The r12 probe (§14b) localized it: killers remember corpses
// (39-43 monster remembers/seed) and mapmemBestHaul finds targets, but
// the objective gate was famine-only (pantry < 5000 || hunger > 50) —
// in a competent village (pantry 50k+) the HAUL candidate was never
// offered. The fix (mapmemHaulCandidate in villager-mapmem.js, called
// from objPick): famine gate + knowledge channel — unrevealed monster
// flesh is new knowledge worth a trip even with a full pantry (Steve
// 2026-10-16: hauling is how unknown flesh reaches the cautious-test
// loop). Known-safe meat with a full pantry stays un-offered.
//
// This test stages the substrate honestly in-engine (registerDeath +
// monsterCarcassEntries + mapmemRemember) and asserts the REAL predicate:
//   1. unrevealed monster meat + full pantry -> candidate OFFERED (the fix)
//   2. same meat marked food-safe + full pantry -> NOT offered (famine gate
//      still holds for known food)
//   3. no remembered corpse -> NOT offered (no phantom hauls)
//   4. unrevealed monster meat + famine pantry -> OFFERED (old gate intact)
//
// RED: run with the fix reverted (patch-file recipe — never stash on the
// hot tree): case 1 must be null.
// GREEN: with the fix: case 1 offered, cases 2-4 as stated.
// Usage: SEED=7 node scripts/test-haul-knowledge-gate-20261017.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '7', 10);

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('  ok: ' + name);
  else { failures++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const sid = Game.villagerId;
  const vid = (v.roster || []).find(id => id !== sid);
  if (!vid) { console.log('FAIL: no villager'); process.exit(1); }
  const hx = v.px ?? 4, hy = v.py ?? 4;

  // premise: hushwolf meat is unrevealed in a fresh game
  check('hushwolf meat unrevealed (premise)', Game.monsterFoodSafe && !Game.monsterFoodSafe('hushwolf'));

  // stage the substrate: a hushwolf corpse with meat, remembered by vid
  const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
  check('hushwolf def exists (premise)', !!mdef);
  const corpse = Game.registerDeath({
    kind: 'monster', monsterId: 'hushwolf', monsterName: mdef.name,
    name: Game.monsterDisplayName ? Game.monsterDisplayName('hushwolf') : 'Hushwolf',
    node: { x: 3, y: 3 }, cause: 'test', killerId: vid, witnesses: [vid],
  });
  check('corpse registered (premise)', !!(corpse && corpse.id));
  const meats = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef) : [];
  for (const me of meats) corpse.items.push(me);
  check('corpse holds meat (premise)', meats.length > 0 && !!Game.mapmemMeatItem(corpse));
  Game.mapmemRemember(vid, corpse);

  // full pantry: the old gate is CLOSED
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Test stores', kcalEach: 500, units: 120, unit: 'portion' }); // 60k
  let pantry = v.pantry.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  check('pantry full (premise, famine gate closed)', pantry >= 5000, 'pantry=' + pantry);
  let hunger = 0;
  try { hunger = (Game.npcNeeds(vid) || {}).hunger || 0; } catch (e) {}
  console.log('  premise: hunger=' + hunger);

  console.log('case 1: unrevealed monster meat + full pantry');
  const c1 = Game.mapmemHaulCandidate(vid, hx, hy);
  check('candidate OFFERED', !!(c1 && c1.ref === corpse.id), 'got ' + JSON.stringify(c1 && c1.ref));

  console.log('case 2: same meat revealed + full pantry (famine gate)');
  Game.markMonsterFoodSafe('hushwolf', 'tested');
  check('hushwolf now food-safe (premise)', !!Game.monsterFoodSafe('hushwolf'));
  const c2 = Game.mapmemHaulCandidate(vid, hx, hy);
  check('candidate NOT offered', c2 === null, 'got ' + JSON.stringify(c2 && c2.ref));

  console.log('case 3: villager with no memory');
  const vid2 = (v.roster || []).find(id => id !== sid && id !== vid);
  let c3 = 'skipped';
  if (vid2) { c3 = Game.mapmemHaulCandidate(vid2, hx, hy); check('candidate NOT offered', c3 === null); }
  else console.log('  (only 2 villagers — skipped)');

  console.log('case 4: unrevealed meat + famine pantry (old gate intact)');
  // un-reveal is not supported; stage a second monster instead
  const mdef2 = (Game.data.monsters || []).find(m => m.id === 'bulldozer') || mdef;
  const corpse2 = Game.registerDeath({
    kind: 'monster', monsterId: mdef2.id, monsterName: mdef2.name,
    name: mdef2.name, node: { x: 2, y: 2 }, cause: 'test', killerId: vid, witnesses: [vid],
  });
  const meats2 = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef2) : [];
  for (const me of meats2) corpse2.items.push(me);
  Game.mapmemRemember(vid, corpse2);
  const known2 = Game.mapmemFoodKnown ? Game.mapmemFoodKnown(corpse2) : true;
  if (!known2 && meats2.length) {
    v.pantry = [{ name: 'Crumbs', kcalEach: 100, units: 10, unit: 'portion' }]; // 1k < 5000
    const c4 = Game.mapmemHaulCandidate(vid, hx, hy);
    check('candidate OFFERED in famine', !!(c4 && (c4.ref === corpse2.id || c4.ref === corpse.id)),
      'got ' + JSON.stringify(c4 && c4.ref));
  } else console.log('  (second monster has no meat or already known — skipped)');

  console.log('case 5: pantry unknown flesh is revealed by markMonsterFoodSafe');
  // stage a hauled unknown-flesh item in the pantry (as mapmemHaulAt leaves it)
  const panItem = {
    name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_hushwolf', edible: false, kcalEach: 0, hiddenKcal: 1500,
    units: 3, unit: 'portion', kg: 0.3,
    prep: '⚠️ Unknown flesh. You have no idea if this is food or poison. Test it cautiously, or ask someone who knows.',
  };
  v.pantry.push(panItem);
  // un-reveal hushwolf first (case 2 revealed it) — reset the codex entry
  if (Game.state.codex.monsters) delete Game.state.codex.monsters['hushwolf'];
  check('hushwolf unrevealed again (premise)', !Game.monsterFoodSafe('hushwolf'));
  Game.markMonsterFoodSafe('hushwolf', 'tested');
  check('pantry flesh revealed', panItem.edible === true && panItem.kcalEach > 0,
    'edible=' + panItem.edible + ' kcalEach=' + panItem.kcalEach);

  console.log('case 6: the experiment beat tries pantry unknown flesh');
  if (Game.state.codex.monsters) delete Game.state.codex.monsters['hushwolf'];
  const panItem2 = {
    name: 'Unknown flesh', foodKind: 'meat', foodState: 'cleaned',
    plantId: 'meat_hushwolf', edible: false, kcalEach: 0, hiddenKcal: 1500,
    units: 2, unit: 'portion', kg: 0.2,
    prep: '⚠️ Unknown flesh. Test it cautiously.',
  };
  v.pantry.push(panItem2);
  // isolate: the beat prefers stash lumps and inventory meat — clear those
  try { Game.state.scholar.prepStash = []; } catch (e) {}
  try {
    Game.state.scholar.inventory = (Game.state.scholar.inventory || [])
      .filter(it => !(it && it.foodKind === 'meat' && it.edible === false) && !(it && it.lump));
  } catch (e) {}
  try { delete v.lastExperimentDay; } catch (e) {}
  check('hushwolf unrevealed before beat (premise)', !Game.monsterFoodSafe('hushwolf'));
  Game.villagerExperimentBeat(true);
  check('beat revealed the pantry flesh', !!Game.monsterFoodSafe('hushwolf'));
  check('pantry item converted to food', panItem2.edible === true && panItem2.kcalEach > 0,
    'edible=' + panItem2.edible + ' kcalEach=' + panItem2.kcalEach);

  console.log('case 7: doomed haul (rot beats the trip) is NOT offered');
  // a corpse whose meat spoils today, 1 tile out: trip needs 1.67 days
  const corpse3 = Game.registerDeath({
    kind: 'monster', monsterId: 'hushwolf', monsterName: mdef.name,
    name: 'Hushwolf', node: { x: 3, y: 3 }, cause: 'test', killerId: vid, witnesses: [vid],
  });
  const meats3 = Game.monsterCarcassEntries ? Game.monsterCarcassEntries(mdef) : [];
  for (const me of meats3) { me.spoilDay = (Game.state.scholar.day || 0); corpse3.items.push(me); }
  Game.mapmemRemember(vid, corpse3);
  // hushwolf is currently revealed (case 6) — un-reveal for the knowledge channel
  if (Game.state.codex.monsters) delete Game.state.codex.monsters['hushwolf'];
  v.pantry = [{ name: 'Test stores', kcalEach: 500, units: 120, unit: 'portion' }];
  const c7 = Game.mapmemHaulCandidate(vid, hx, hy);
  // the candidate must not be the doomed corpse3 (any live site is fine, but
  // corpse3 itself is doomed — with only corpse3 fresh, expect null)
  const c7doomed = c7 && c7.ref === corpse3.id;
  check('doomed haul NOT offered', !c7doomed, 'got ' + JSON.stringify(c7 && c7.ref));

  console.log('case 8: expedition killer butchers on the spot and carries home');
  // simulate the expedition kill flow: mapmemNoteKill returns carried meat
  const vid3 = (v.roster || []).find(id => id !== sid && id !== vid && id !== vid2);
  const carrier = vid3 || vid;
  // fake an expedition state
  const ast = Game.agencyState ? Game.agencyState() : null;
  if (ast) {
    ast.exped = ast.exped || {};
    ast.exped[carrier] = { tx: 1, ty: 1, dist: 3, legs: 0, finds: [], encounters: [], meat: [] };
    const mdef3 = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
    if (Game.state.codex.monsters) delete Game.state.codex.monsters['hushwolf'];
    const carried = Game.mapmemNoteKill(carrier, { id: 'hushwolf', name: mdef3.name }, { nx: 1, ny: 1 });
    check('killer butchered on the spot (meat carried)', !!(carried && (carried.kcal > 0 || (carried.unknown || []).length > 0)),
      JSON.stringify(carried));
    check('unrevealed flesh carried as unknown', (carried.unknown || []).length > 0 && carried.unknown[0].edible === false && carried.unknown[0].kcalEach === 0);
    if (carried) {
      ast.exped[carrier].meat.push(carried);
      // simulate return: deposit
      const panBefore = v.pantry.length;
      Game.expeditionReturn(carrier, false);
      const uf = v.pantry.filter(it => it && it.name === 'Unknown flesh');
      check('unknown flesh arrived in pantry', uf.length > 0, 'pantry unknown-flesh items: ' + uf.length);
      check('knowledge law holds (0 kcal until tested)', uf.every(it => it.kcalEach === 0 && it.edible === false));
    }
    delete ast.exped[carrier];
  } else console.log('  (no agency state — skipped)');

  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
