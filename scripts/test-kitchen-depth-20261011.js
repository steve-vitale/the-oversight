#!/usr/bin/env node
// test-kitchen-depth-20261011.js — proof for longsim lever 4 (knowledge &
// teaching) r2: "the village's hands deepen".
// Baseline (diagnostic 5x100d + r1 20x200d): village sharedKnowledge sat at L1
// forever (only L2s from expert discoverers); combineKnowledge fired 0 times;
// plant L2+ ~3% of entries and never earned via the village; animal depth 0.
// The lever: every village-day a NAMED plant is served from the pantry,
// sharedKnowledge[pid].servings accrues; at 8 the village knows parts/prep
// (L2), at 20 it knows uses (L3); caps at L3 (mastery is personal). This is
// the "others know deeper" half of combineKnowledge — the fireside overlap
// can finally fire for village staples.
// Proves, on fixed seeds:
//   K1 L1->L2 at 8 servings, narrated, knowledge-gated (no true-name leak)
//   K2 L2->L3 at 20 servings; caps at L3 (50 servings, no further change)
//   K3 unnamed plant: no entry created, no crash, ledger cleared
//   K4 servings accrue per served day only; todayHandled cleared (no double-count)
//   K5 expert-discovered L2 entry deepens to L3 (no L2 re-fire)
//   K6 combine FIRES on village L2: player L1 + 3 harvests -> player L2
//   K7 combine still gated: 0 harvests -> no deepen (the player's work matters)
// Run: node scripts/test-kitchen-depth-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function captureSay(Game) {
  const lines = [];
  const _say = Game.say;
  Game.say = function (m) { lines.push(String(m || '')); return _say.call(this, m); };
  return { lines, restore() { Game.say = _say; } };
}
function somePlant(Game) {
  const p = (Game.data.plants || []).find(x => x && x.id && x.edibility && x.knowledgeLevels);
  if (!p) throw new Error('no plant with knowledgeLevels');
  return p;
}

(async () => {
  // ============ K1/K2: the deepening ladder ============
  {
    const { Game } = await loadGame({ seed: 424242, mode: 'knowledge-r2' });
    await setupGame(Game);
    const v = Game.state.village;
    const p = somePlant(Game);
    const pid = p.id;
    // player must NOT know it (gating test) — fresh game: confirm
    ok('K1a precondition: player does not know the plant', !Game.plantKnown(pid));
    v.sharedKnowledge = v.sharedKnowledge || {};
    v.sharedKnowledge[pid] = { discoveredBy: 'someone', day: 0, level: 1 };
    const cap = captureSay(Game);
    for (let d = 0; d < 7; d++) { v.todayHandled = { [pid]: true }; Game.villageHandlingDeepens(v); }
    ok('K1b still L1 after 7 servings', (v.sharedKnowledge[pid].level || 1) === 1);
    v.todayHandled = { [pid]: true }; Game.villageHandlingDeepens(v);
    ok('K1c L2 at 8 servings', v.sharedKnowledge[pid].level === 2);
    const l2lines = cap.lines.filter(l => l.includes('deepens'));
    ok('K1d L2 narrated once', l2lines.length === 1, `got ${l2lines.length}`);
    ok('K1e no true-name leak (player ignorant)', !l2lines[0].includes(p.name),
      `line: ${l2lines[0].slice(0, 120)}`);
    for (let d = 0; d < 11; d++) { v.todayHandled = { [pid]: true }; Game.villageHandlingDeepens(v); }
    ok('K2a still L2 at 19 servings', v.sharedKnowledge[pid].level === 2);
    v.todayHandled = { [pid]: true }; Game.villageHandlingDeepens(v);
    ok('K2b L3 at 20 servings', v.sharedKnowledge[pid].level === 3);
    const l3lines = cap.lines.filter(l => l.includes('uses now'));
    ok('K2c L3 narrated once', l3lines.length === 1, `got ${l3lines.length}`);
    for (let d = 0; d < 30; d++) { v.todayHandled = { [pid]: true }; Game.villageHandlingDeepens(v); }
    ok('K2d caps at L3 (50 servings)', v.sharedKnowledge[pid].level === 3);
    ok('K2e servings kept accruing (honest bookkeeping)', v.sharedKnowledge[pid].servings === 50);
    cap.restore();
  }
  // ============ K3/K4: unnamed + ledger hygiene ============
  {
    const { Game } = await loadGame({ seed: 777001, mode: 'knowledge-r2' });
    await setupGame(Game);
    const v = Game.state.village;
    v.sharedKnowledge = v.sharedKnowledge || {};
    const ghost = 'no_such_plant_xyz';
    v.todayHandled = { [ghost]: true };
    let threw = false;
    try { Game.villageHandlingDeepens(v); } catch (e) { threw = true; }
    ok('K3a unnamed plant: no crash', !threw);
    ok('K3b unnamed plant: no entry created', !v.sharedKnowledge[ghost]);
    ok('K3c todayHandled cleared even with nothing served', Object.keys(v.todayHandled).length === 0);
    // K4: two plants, serve one
    const plants = (Game.data.plants || []).filter(x => x && x.id && x.edibility).slice(0, 2);
    const [a, b] = [plants[0].id, plants[1].id];
    v.sharedKnowledge[a] = { discoveredBy: 'x', day: 0, level: 1 };
    v.sharedKnowledge[b] = { discoveredBy: 'x', day: 0, level: 1 };
    v.todayHandled = { [a]: true };
    Game.villageHandlingDeepens(v);
    ok('K4a served plant accrues', v.sharedKnowledge[a].servings === 1);
    ok('K4b unserved plant untouched', v.sharedKnowledge[b].servings === undefined);
    ok('K4c ledger cleared after beat', Object.keys(v.todayHandled).length === 0);
  }
  // ============ K5: expert L2 -> L3 ============
  {
    const { Game } = await loadGame({ seed: 31337, mode: 'knowledge-r2' });
    await setupGame(Game);
    const v = Game.state.village;
    v.sharedKnowledge = v.sharedKnowledge || {};
    const p = somePlant(Game);
    // expert discoverer path writes level 2 directly (game.js living-world)
    v.sharedKnowledge[p.id] = { discoveredBy: 'expert', day: 0, level: 2, servings: 0 };
    const cap = captureSay(Game);
    for (let d = 0; d < 20; d++) { v.todayHandled = { [p.id]: true }; Game.villageHandlingDeepens(v); }
    ok('K5a expert L2 deepens to L3 at 20 servings', v.sharedKnowledge[p.id].level === 3);
    ok('K5b no L2 re-narration for an L2 entry',
      cap.lines.filter(l => l.includes('deepens') && !l.includes('uses now')).length === 0);
    cap.restore();
  }
  // ============ K6/K7: combineKnowledge — the point of the lever ============
  {
    const { Game } = await loadGame({ seed: 90210, mode: 'knowledge-r2' });
    await setupGame(Game);
    const v = Game.state.village;
    v.sharedKnowledge = v.sharedKnowledge || {};
    const p = somePlant(Game);
    const pid = p.id;
    // village did the kitchen work
    v.sharedKnowledge[pid] = { discoveredBy: 'kitchen', day: 0, level: 2, servings: 8 };
    // player did their own work: L1 + 3 harvests
    Game.state.codex.plants = Game.state.codex.plants || {};
    Game.state.codex.plants[pid] = { identifiedDay: 0, level: 1, harvests: 3, tastings: 0, by: 'test' };
    const cap = captureSay(Game);
    const fired = Game.combineKnowledge(pid);
    ok('K6a combine fires on village L2 + 3 harvests', fired === true);
    ok('K6b player reaches L2 via the village', Game.state.codex.plants[pid].level === 2);
    ok('K6c combine narrates the village as source',
      cap.lines.some(l => l.includes('KNOWLEDGE COMBINES') && /village/i.test(l)));
    cap.restore();
    // K7: same setup, but the player never handled the plant
    const p2 = (Game.data.plants || []).find(x => x && x.id && x.id !== pid && x.edibility);
    v.sharedKnowledge[p2.id] = { discoveredBy: 'kitchen', day: 0, level: 2, servings: 8 };
    Game.state.codex.plants[p2.id] = { identifiedDay: 0, level: 1, harvests: 0, tastings: 0, by: 'test' };
    const fired2 = Game.combineKnowledge(p2.id);
    ok('K7a combine refuses without harvests', fired2 === false);
    ok('K7b player stays L1 (their work still matters)', Game.state.codex.plants[p2.id].level === 1);
  }
  // ============ K8: integration — villagerMealDay feeds the ledger ============
  {
    const { Game } = await loadGame({ seed: 112233, mode: 'knowledge-r2' });
    await setupGame(Game);
    const v = Game.state.village;
    v.sharedKnowledge = v.sharedKnowledge || {};
    v.sharedKnowledge['k8_plant'] = { discoveredBy: 'x', day: 0, level: 1 };
    const vid = (v.roster || []).find(id => id !== Game.villagerId);
    const person = Game.getPerson(vid);
    v.todayHandled = {};
    let threw = false;
    try { Game.villagerMealDay(vid, person, v, { cookId: null }); } catch (e) { threw = true; }
    ok('K8a villagerMealDay records handling without throwing', !threw);
    ok('K8b todayHandled gains the known plant', !!v.todayHandled['k8_plant'],
      `keys: ${Object.keys(v.todayHandled).join(',')}`);
    // and the beat consumes it
    Game.villageHandlingDeepens(v);
    ok('K8c beat accrues the serving', v.sharedKnowledge['k8_plant'].servings === 1);
    ok('K8d beat clears the ledger', Object.keys(v.todayHandled).length === 0);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
