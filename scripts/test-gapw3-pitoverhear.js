#!/usr/bin/env node
// scripts/test-gapw3-pitoverhear.js — proof for gap-closure findings #616
// (phase 2 bundle W3-food-villager-social, sim-findings.md line 616):
// a watched pit_overhear DUPLICATED the teachChoreLine — one tick said
// both the third-person chore line ("is showing ... the pit trap") and
// the player's own overhear line ("You watch ... walk someone through
// the pit trap"). The fix is instead-of: when pitLessonOverhear fires,
// the chore line is skipped; when it refuses (gates), the chore line stands.
//
// Drives the real objTick chore path: a knowsPit teacher on a forced
// HAVEN_CHORE 'teach' objective, a pit-naive learner at the same haven
// tile, the player at haven, pit_trap L0, teacher trust 20. Loops objTick
// until a pit lesson lands (tele 'pit_lesson'), then counts the two
// line shapes in everything said.
//
// Usage: node scripts/test-gapw3-pitoverhear.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, quietLog } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 61601, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy; // player at haven
  Game.dayPart = 1; // not dawn: no dawn re-pick of the forced objective
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  delete Game.state.codex.recipes.pit_trap; // player L0: overhear may fire

  const roster = (v.roster || []).filter(id => id !== Game.villagerId && !(Game.vpOf(id) || {}).dead);
  assert(roster.length >= 2, 'need 2 live villagers');
  const teacher = roster[0], learner = roster[1];
  // isolate the pit lesson: every other villager already knows the pit,
  // so the ONLY pit lesson in the run is the teacher -> learner one and
  // every pit line counted belongs to it (plant lessons to others are
  // filtered out by the pit-line regexes below).
  for (const id of roster) { if (id !== learner) { try { Game.vpOf(id).knowsPit = true; } catch (e) {} } }
  const tvp = Game.vpOf(teacher); tvp.knowsPit = true;
  const lvp = Game.vpOf(learner); lvp.knowsPit = false; lvp.pitTaught = false;
  v.trust = v.trust || {}; v.trust[teacher] = 20;
  // learner novice (tracking xp < 8) so the pit lesson is need-driven
  try { const ag = Game.agencyOf(learner); if (ag && ag.xp && ag.xp[learner]) ag.xp[learner].tracking = 0; } catch (e) {}
  try { Game.npcNeeds(learner).hunger = 80; } catch (e) {}
  // both at the haven tile, so the chore's "here" filter finds the learner
  for (const id of [teacher, learner]) {
    try { const n = Game.npcNode(id); n.nx = hx; n.ny = hy; } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
  }
  // force the teacher's indoor teach chore (objTick lives it as-is)
  const o = Game.objOf(teacher);
  o.kind = 'HAVEN_CHORE'; o.chore = 'teach'; o.indoor = true; o.state = 'indoor';

  const said = [];
  const oSay = Game.say; Game.say = (s) => { said.push(String(s)); };
  let lessonFired = false;
  await quietLog(async () => {
    for (let i = 0; i < 400 && !lessonFired; i++) {
      try { Game.objTick(); } catch (e) {}
      if (Game.vpOf(learner).pitTaught) lessonFired = true;
    }
  });
  Game.say = oSay;
  assert(lessonFired, 'no pit lesson landed in 400 objTicks');
  const chorePit = said.filter(s => /is showing .* the pit trap/.test(s));
  const overhearPit = said.filter(s => /You watch .* walk someone through the pit trap/.test(s));
  console.log(`  pit lessons landed; chore-line pit says=${chorePit.length} overhear says=${overhearPit.length}`);
  assert(overhearPit.length >= 1, 'overhear line never said on a watched pit lesson');
  assert(chorePit.length === 0, 'DUPLICATE: chore line also said alongside the overhear — ' + JSON.stringify(chorePit.slice(0, 1)));
  const lvl = (((Game.state.codex || {}).recipes || {}).pit_trap || {}).level || 0;
  assert(lvl === 1, 'overhear should grant pit_trap L1, got ' + lvl);
  console.log('PASS test-gapw3-pitoverhear: instead-of holds (overhear only, chore line skipped, L1 granted)');
})().catch(e => { console.error('FAIL test-gapw3-pitoverhear: ' + (e && e.message)); process.exit(1); });
