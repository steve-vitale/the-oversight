#!/usr/bin/env node
// test-wound-death-fallen-20261022.js — PROOF for journey-succession r34
// (2026-10-22): the wound-death path (game.js villageLives, foraging
// attrition) routes through registerDeath (corpse), removeVillager,
// seedGossip and the grief line — but never pushes v.fallen, the village's
// memorial roll. The hurtVillager path (game.js ~7783) and playerDeath both
// push fallen; the wound path was missed (its own comment claims "corpse,
// gossip, dead mark" — the dead mark never lands).
//
// Found empirically: seed 9902's Leo died of a wound d34 — corpse, grief,
// gossip and Codex page all fired, two villagers mourned him by name on
// d35 — but the census read fallen=1 (only the bearer). The memorial roll
// undercounts wound deaths.
//
// Method: seed a game, pick a non-bearer villager, pin their health to 1
// and tick villageLives() until the wound branch kills them (the only
// damage source in that loop for the target). Assert the corpse cause to
// prove we hit the wound path, then assert the fallen entry.
// Exit 0 = all green, 1 = failure (prints which).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-wound-death-fallen' });
  Game.say = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const bearerId = Game.villagerId;
  const target = (v.roster || []).find(id => id !== bearerId);
  if (!target) { console.log('no NPC target'); process.exit(1); }
  const tName = (() => { try { return Game.displayName(target); } catch (e) { return target; } })();
  console.log(`target: ${tName} (bearer ${Game.villagerId} untouched)`);

  let dead = false, iters = 0;
  for (iters = 0; iters < 300 && !dead && !Game.over; iters++) {
    try {
      v.health = v.health || {};
      if ((v.roster || []).includes(target)) v.health[target] = 1; // one wound tick kills
      Game.villageLives();
    } catch (e) { /* ambient tick noise; keep going */ }
    try {
      const vp = Game.vpOf(target);
      dead = !(v.roster || []).includes(target) || (vp && vp.dead);
    } catch (e) { dead = !(v.roster || []).includes(target); }
  }
  console.log(`ticks: ${iters}, target dead: ${dead}, over: ${!!Game.over}`);
  check('target-died', dead, dead ? '' : 'target survived 300 ticks (harness issue, not the bug)');
  if (!dead) process.exit(1);

  // Prove we hit the wound path (not some other death).
  const corpses = (typeof Game.corpses === 'function') ? Game.corpses() : (Game.state.corpses || []);
  const corpse = corpses.find(c => c && c.villagerId === target);
  check('corpse-exists', !!corpse, corpse ? `cause=${corpse.cause}` : 'no corpse for target');
  const woundPath = corpse && /wound that wouldn/.test(corpse.cause || '');
  check('wound-path', !!woundPath, woundPath ? '' : `corpse cause was '${corpse && corpse.cause}' — wrong path, rerun`);

  // THE BUG: the memorial roll must record the wound death.
  const fallen = (v.fallen || []).filter(f => f && f.villagerId === target);
  check('fallen-entry', fallen.length > 0,
    fallen.length > 0 ? `day ${fallen[0].day} cause ${fallen[0].cause}` : 'v.fallen has NO entry for the wound-dead villager');
  check('fallen-cause', fallen.some(f => /wound/.test(f.cause || '')),
    fallen.length ? `causes: ${fallen.map(f => f.cause).join(',')}` : 'n/a');

  // ---- scenario 2: thirst path (villageDrinks, non-bearer) ----
  {
    const v2 = Game.state.village;
    const bearer2 = Game.villagerId;
    const target2 = (v2.roster || []).find(id => id !== bearer2 && !((Game.vpOf(id) || {}).dead));
    if (!target2) { console.log('no NPC target for thirst'); process.exit(1); }
    const tName2 = (() => { try { return Game.displayName(target2); } catch (e) { return target2; } })();
    console.log(`thirst target: ${tName2}`);
    try {
      v2.water = v2.water || {};
      v2.water.clean = 0; v2.water.dirty = 0; // cistern dry: every villager goes thirsty
      v2.health = v2.health || {};
      v2.health[target2] = 3; // one -5 tick kills
      Game.villageDrinks();
    } catch (e) { console.log('villageDrinks threw: ' + e.message); }
    const vp2 = (() => { try { return Game.vpOf(target2); } catch (e) { return null; } })();
    const dead2 = !(v2.roster || []).includes(target2) || (vp2 && vp2.dead);
    check('thirst-target-died', !!dead2, dead2 ? '' : 'target survived the dry cistern');
    const corpses2 = (typeof Game.corpses === 'function') ? Game.corpses() : (Game.state.corpses || []);
    const corpse2 = corpses2.find(c => c && c.villagerId === target2);
    const thirstPath = corpse2 && corpse2.cause === 'thirst';
    check('thirst-path', !!thirstPath, thirstPath ? '' : `corpse cause was '${corpse2 && corpse2.cause}'`);
    const fallen2 = (v2.fallen || []).filter(f => f && f.villagerId === target2);
    check('thirst-fallen-entry', fallen2.length > 0,
      fallen2.length > 0 ? `day ${fallen2[0].day} cause ${fallen2[0].cause}` : 'v.fallen has NO entry for the thirst-dead villager');
  }

  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
