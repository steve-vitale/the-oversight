#!/usr/bin/env node
// r85 proof test: the NPC armor-craft bootstrap gap (no src change).
// Claim: villagerArmorCraftDay cannot produce a village's FIRST armor
// from materials alone — knowledge must already exist (wearing a piece,
// a taught avCraft level, or hide-handling). With materials piled up but
// no knowledgeable villager, the beat attempts nothing for 10 days.
// With a taught villager, the same materials are attempted on day 1
// (attempt = stash deducted + cooldown set, whatever the roll says).
// Deterministic: the skip path consumes no RNG; the attempt assertion
// does not depend on the craft roll.
// Usage: node scripts/test-journey-establishment-r85-armor-bootstrap.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name} ${detail || ''}`); }
}
function stripArmor(Game) {
  const v = Game.state.village || {};
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson(id); } catch (e) {}
    if (!p) continue;
    if (p.equipped) for (const sl of Object.keys(p.equipped)) {
      const it = p.equipped[sl];
      if (it && (it.itemId === 'bark_armor' || it.itemId === 'hide_armor')) delete p.equipped[sl];
    }
    if (Array.isArray(p.items)) p.items = p.items.filter(it => it && it.itemId !== 'bark_armor' && it.itemId !== 'hide_armor');
  }
  v.avCraft = {};
  v.avCraftCd = {};
}
function homeVillager(Game) {
  const v = Game.state.village || {};
  for (const id of (v.roster || [])) {
    if (id === Game.villagerId) continue;
    if ((v.away || {})[id]) continue;
    let p = null; try { p = Game.getPerson(id); } catch (e) {}
    if (p && !p.dead) return id;
  }
  return null;
}
(async () => {
  const { Game } = await loadGame({ seed: 1104, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  v.stash = v.stash || {};
  // Variant A: materials piled up, nobody knowledgeable.
  stripArmor(Game);
  v.stash.materials = { bark: 10, vine: 5, hide: 0 };
  let attemptsA = 0;
  for (let d = 1; d <= 10; d++) {
    Game.state.scholar.day = d;
    const before = JSON.stringify(v.stash.materials);
    const made = Game.villagerArmorCraftDay();
    if (made !== 0) attemptsA++;
    if (JSON.stringify(v.stash.materials) !== before) attemptsA++;
    if (Object.keys(v.avCraftCd || {}).length) attemptsA++;
  }
  check('A: no-knowledge village attempts nothing in 10 days', attemptsA === 0, `(attemptSignals=${attemptsA})`);
  check('A: stash untouched', v.stash.materials.bark === 10 && v.stash.materials.vine === 5,
    JSON.stringify(v.stash.materials));
  check('A: no cooldown set', Object.keys(v.avCraftCd || {}).length === 0);
  // Variant B: same materials, one villager taught bark L2.
  const vid = homeVillager(Game);
  check('B: fixture has a home villager', !!vid, '');
  if (vid) {
    v.avCraft = {}; v.avCraftCd = {};
    v.avCraft[vid] = { bark_armor: 2 };
    v.stash.materials = { bark: 10, vine: 5, hide: 0 };
    Game.state.scholar.day = 20;
    const made = Game.villagerArmorCraftDay();
    check('B: taught villager attempts on day 1 (stash deducted)',
      v.stash.materials.bark === 7 && v.stash.materials.vine === 3,
      `stash=${JSON.stringify(v.stash.materials)} made=${made}`);
    check('B: cooldown set for the taught villager', v.avCraftCd[vid] === 20,
      `cd=${JSON.stringify(v.avCraftCd)}`);
  }
  // Variant C: same materials, one villager taught hide L2.
  if (vid) {
    v.avCraft = {}; v.avCraftCd = {};
    v.avCraft[vid] = { hide_armor: 2 };
    v.stash.materials = { bark: 10, vine: 5, hide: 2 };
    Game.state.scholar.day = 30;
    Game.villagerArmorCraftDay();
    check('C: taught hide villager attempts (hide/vine deducted)',
      v.stash.materials.hide === 0 && v.stash.materials.vine === 4,
      `stash=${JSON.stringify(v.stash.materials)}`);
  }
  console.log(`\n${pass} passed / ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e && e.stack || e); process.exit(1); });
