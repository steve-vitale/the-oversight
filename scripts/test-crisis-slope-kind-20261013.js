#!/usr/bin/env node
// test-crisis-slope-kind-20261013.js — PROOF for the crisis-leg r7 blank:
// "the cannibalism slope is unreachable for villager deaths."
//
// Root cause: corruption.js uses bare `c.kind === 'person'` gates, but EVERY
// villager death (starvation, thirst, wounds) registers kind 'villager'
// (corpses.js:110, corpseIsPerson(); the 2026-10-09 fix covered witness/glyph/
// funeral gates but not corruption.js). So in a famine:
//   1. corpseButcher REFUSES villager corpses (kind !== 'person').
//   2. nearButcherableCorpse never finds them.
//   3. npcCannibalTick's corpse filter finds nothing -> the slope's NPC half
//      can never fire on famine deaths.
// AFTER: all three gates use this.corpseIsPerson(c). Animal/monster corpses
// stay refused with an honest message.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-crisis-slope-kind-20261013.js
// Exit 0 = all green.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261013', 10);

(async () => {
const { Game } = await require('./sim-harness').loadGame({seed: SEED, mode: 'release-regression'});


let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

async function main() {
  // minimal live state (no full setupGame — we stage exactly what we need)
  Game.state = Game.state || {};
  Game.state.scholar = Game.state.scholar || { day: 30, corruption: 0, inventory: [], tools: [], kcal: 1500, trauma: 0, mx: 4, my: 4 };
  Game.state.village = Game.state.village || {};
  const v = Game.state.village;
  v.roster = ['vidA', 'vidB', 'vidC'];
  v.rosterChars = {
    vidA: { name: 'Test Anna' }, vidB: { name: 'Test Bruno' }, vidC: { name: 'Test Cara' },
  };
  Game.map = Game.map || {}; Game.map.px = 4; Game.map.py = 4;
  const s = Game.state.scholar;
  // an honest blade
  s.inventory.push({ plantId: 'machete', name: 'machete', units: 1 });
  ok(Game.hasCuttingTool(), 'sanity: scholar has a cutting tool');

  // two starvation deaths — kind 'villager', exactly like game.js:26718
  const mkCorpse = (vid, nm) => Game.registerDeath({ kind: 'villager', villagerId: vid, name: nm, cause: 'starvation' });
  const cA = mkCorpse('vidA', 'Test Anna');
  const cB = mkCorpse('vidB', 'Test Bruno');
  ok(cA && cA.kind === 'villager' && !cA.buried, 'sanity: starvation corpse registered, kind=villager, unburied');
  // starvingVillage needs a recent starvation fallen entry (game.js pushes these)
  v.fallen = v.fallen || [];
  v.fallen.push({ villagerId: 'vidA', day: s.day, cause: 'starvation' });
  ok(Game.starvingVillage() === true, 'sanity: starvingVillage() true after starvation death');

  // player stands at corpse A
  cA.node = cA.node || { x: 4, y: 4 }; cA.mx = 4; cA.my = 5;
  s.mx = 4; s.my = 4; Game.map.px = cA.node.x; Game.map.py = cA.node.y;

  // ---- 1. nearButcherableCorpse finds the villager corpse ----
  const near = Game.nearButcherableCorpse ? Game.nearButcherableCorpse() : null;
  ok(near && near.id === cA.id, 'nearButcherableCorpse finds an adjacent starvation (villager-kind) corpse');

  // ---- 2. corpseButcher works on it ----
  const meat = Game.corpseButcher(cA.id);
  ok(meat && meat.plantId === 'meat_human', 'corpseButcher butchers a villager corpse -> human meat');
  ok(cA.butchered === true, 'corpse marked butchered');
  ok(s.corruption >= 4, 'butchering adds corruption (>=4, got ' + s.corruption + ')');

  // ---- 3. the dark path continues: eat ----
  // minimal data for the modifier pipeline (no abilities -> no modifiers)
  Game.data = Game.data || {};
  Game.data.abilities = Game.data.abilities || [];
  Game.data.synergies = Game.data.synergies || [];
  Game.data.knowledge = Game.data.knowledge || [];
  Game.state.codex = Game.state.codex || { skills: {} };
  const idx = s.inventory.findIndex(x => x.plantId === 'meat_human');
  const corrBefore = s.corruption;
  const ate = idx >= 0 ? Game.eatCannibal(idx) : false;
  ok(ate === true, 'eatCannibal eats the butchered meat');
  ok(s.corruption >= corrBefore + 14, 'first cannibal meal: +14 corruption (got +' + (s.corruption - corrBefore) + ')');

  // ---- 4. animal corpses stay refused, honestly ----
  const cM = Game.registerDeath({ kind: 'monster', name: 'test beast', cause: 'combat' });
  const rM = Game.corpseButcher(cM.id);
  ok(rM === null, 'corpseButcher still refuses monster corpses');

  // ---- 5. npcCannibalTick can fire on villager corpses ----
  // corpse B is unbutchered; make Bruno's killer corrupt enough (>=35 gate)
  Game.addNpcCorruption('vidC', 40, 'test staging');
  Game.dayPart = 0;
  const normBefore = v.normShift || 0;
  let fired = 0;
  for (let i = 0; i < 500 && fired === 0; i++) {
    Game.npcCannibalTick();
    if ((v.normShift || 0) > normBefore + fired) fired = (v.normShift || 0) - normBefore;
  }
  ok(fired > 0, 'npcCannibalTick fires on unburied villager corpses (normShift moved)');
  ok(cB.npcFed === 'vidC' || cB.butchered === true, 'the NPC fed (corpse marked npcFed/butchered)');

  // ---- 6. contextual norm still answers from real state ----
  const norm = Game.cannibalNorm();
  ok(norm === 'horror', 'cannibalNorm = horror in the starving village (got ' + norm + ')');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });

})().catch(e => { console.error(e.stack); process.exitCode = 1; });
