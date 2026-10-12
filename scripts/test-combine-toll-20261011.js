#!/usr/bin/env node
// test-combine-toll-20261011.js — proof for longsim lever 4 (knowledge &
// teaching) r3: "the combine toll scales with the depth differential".
// Baseline (r2 20x200d): combineKnowledge fired 0 times — the village knows
// deeper (151 L2 / 94 L3 shared entries) but the player's flat 3-harvest toll
// never clears in sims (maxHarvests 0-1: sims forage for calories across
// depleting ground, not for depth).
// The lever: in combineKnowledge, the toll = max(1, 4 - depthGap) where
// depthGap = deepestOther - myLevel. Gap 1 -> 3 (Steve's gate, unchanged),
// gap 2 -> 2, gap 3+ -> 1. NEVER 0 — no free depth from the fire. The hint
// shows the real toll.
// Proves, on fixed seeds:
//   T1 gap 1 unchanged: village L2 + player L1: 2 harvests refuses, 3 fires
//   T2 gap 2: village L3 + player L1: 1 harvest refuses, 2 fires
//   T3 gap 3 (other-village L4, player L1): 0 harvests refuses (never 0), 1 fires
//   T4 hint names the real toll for each gap
//   T5 mastery/equal-depth guards still hold (L4 player; no deeper other)
// Run: node scripts/test-combine-toll-20261011.js
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
function fresh(pid, myLevel, harvests, sharedLevel, otherVillageLevel) {
  return { pid, myLevel, harvests, sharedLevel, otherVillageLevel };
}
function setUp(Game, cfg) {
  const v = Game.state.village;
  v.sharedKnowledge = v.sharedKnowledge || {};
  delete v.sharedKnowledge[cfg.pid];
  if (cfg.sharedLevel) v.sharedKnowledge[cfg.pid] = { discoveredBy: 'x', day: 0, level: cfg.sharedLevel };
  Game.state.codex.plants = Game.state.codex.plants || {};
  Game.state.codex.plants[cfg.pid] = {
    identifiedDay: 0, level: cfg.myLevel, harvests: cfg.harvests, tastings: 0, by: 'test',
  };
  Game.state.otherVillages = [];
  if (cfg.otherVillageLevel) {
    Game.state.otherVillages = [{
      name: 'Far Haven',
      codex: { plants: { [cfg.pid]: { level: cfg.otherVillageLevel } } },
    }];
  }
  // no traders in the test roster path matter — isKnowledgeTrader is real;
  // keep roster default; the shared/other-village sources are what we set.
}
function plantIds(Game, n) {
  const ps = (Game.data.plants || []).filter(x => x && x.id && x.edibility && x.knowledgeLevels);
  if (ps.length < n) throw new Error('not enough plants');
  return ps.slice(0, n).map(p => p.id);
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'knowledge-r2' });
  await setupGame(Game);
  const [pA, pB, pC, pD, pE] = plantIds(Game, 5);

  // ---- T1: gap 1 unchanged (village L2, player L1) ----
  setUp(Game, fresh(pA, 1, 2, 2, 0));
  ok('T1a gap1: 2 harvests refuses (Steve\'s gate holds)', Game.combineKnowledge(pA) === false);
  ok('T1b gap1: player stays L1', Game.state.codex.plants[pA].level === 1);
  setUp(Game, fresh(pA, 1, 3, 2, 0));
  ok('T1c gap1: 3 harvests fires', Game.combineKnowledge(pA) === true);
  ok('T1d gap1: player reaches L2', Game.state.codex.plants[pA].level === 2);

  // ---- T2: gap 2 (village L3, player L1) ----
  setUp(Game, fresh(pB, 1, 1, 3, 0));
  ok('T2a gap2: 1 harvest refuses', Game.combineKnowledge(pB) === false);
  setUp(Game, fresh(pB, 1, 2, 3, 0));
  ok('T2b gap2: 2 harvests fires', Game.combineKnowledge(pB) === true);
  ok('T2c gap2: player jumps to L3 (the village knew uses)', Game.state.codex.plants[pB].level === 3);

  // ---- T3: gap 3 via other village L4 (player L1); never 0 ----
  setUp(Game, fresh(pC, 1, 0, 0, 4));
  ok('T3a gap3: 0 harvests refuses (never free)', Game.combineKnowledge(pC) === false);
  ok('T3b gap3: 0 harvests stays L1', Game.state.codex.plants[pC].level === 1);
  setUp(Game, fresh(pC, 1, 1, 0, 4));
  ok('T3c gap3: 1 harvest fires', Game.combineKnowledge(pC) === true);
  ok('T3d gap3: player reaches L4 cap (min(4, deepest))', Game.state.codex.plants[pC].level === 4);

  // ---- T4: the hint names the real toll ----
  setUp(Game, fresh(pD, 1, 1, 3, 0));
  const cap = captureSay(Game);
  Game.combineKnowledge(pD);
  const hints = cap.lines.filter(l => l.includes('it\'ll click'));
  ok('T4a hint fires once for gap-2 near miss', hints.length === 1, `got ${hints.length}`);
  ok('T4b hint shows the real toll (1/2), not the old flat 3', /\b1\/2\b/.test(hints[0] || ''),
    `line: ${(hints[0] || '').slice(0, 140)}`);
  cap.restore();
  setUp(Game, fresh(pD, 1, 0, 2, 0));
  const cap2 = captureSay(Game);
  Game.combineKnowledge(pD);
  const hints2 = cap2.lines.filter(l => l.includes('it\'ll click'));
  ok('T4c gap-1 hint still shows the old toll (0/3)', /\b0\/3\b/.test(hints2[0] || ''),
    `line: ${(hints2[0] || '').slice(0, 140)}`);
  cap2.restore();

  // ---- T5: guards still hold ----
  setUp(Game, fresh(pE, 4, 9, 3, 0));
  ok('T5a mastered player (L4) never combines', Game.combineKnowledge(pE) === false);
  setUp(Game, fresh(pE, 2, 9, 2, 0));
  ok('T5b no deeper other: no fire', Game.combineKnowledge(pE) === false);
  ok('T5c no deeper other: level unchanged', Game.state.codex.plants[pE].level === 2);

  // ---- T6: knowledge-trader path (a trader counts as L3 depth) ----
  {
    const v = Game.state.village;
    const rid = (v.roster || []).find(id => id !== Game.villagerId);
    ok('T6a precondition: a fellow villager exists', !!rid);
    const vp = (Game.data.villagers || []).find(x => x.id === rid);
    if (vp) vp.trader = true;
    ok('T6b the villager is a knowledge trader now', Game.isKnowledgeTrader(rid));
    const tk = Game.traderKnowledge(rid);
    ok('T6c trader has a deterministic plant pool', tk.length >= 2, `got ${tk.length}`);
    const tpid = tk[0];
    setUp(Game, fresh(tpid, 1, 2, 0, 0)); // player L1 + 2 harvests, no shared, no OV
    const fired = Game.combineKnowledge(tpid);
    ok('T6d trader-depth combine fires at gap-2 toll (2 harvests)', fired === true);
    ok('T6e player reaches L3 via the trader', Game.state.codex.plants[tpid].level === 3);
    if (vp) vp.trader = false;
  }

  console.log(`\nT-tests: ${pass} passed, ${fail} failed`);
  await wiringTests();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

// ============ W: the combine moment — deepening beat wires the overlap ====
// (r3 structural find: the fireside lesson is one-shot per plant (taughtAround),
// so combineKnowledge was only ever called at the naming, before depth existed.
// The deepening beat is where depth is born — the combine must fire there.)
async function wiringTests() {
  // NOTE: do NOT re-require('./sim-harness') here — the first loadGame evals
  // game files with a direct eval in the harness's module scope, and
  // food.js/justice.js do `module.exports = methods`, clobbering the
  // harness's exports. Reuse the top-level imports (still bound).
  const { Game } = await loadGame({ seed: 60606, mode: 'knowledge-r2' });
  await setupGame(Game);
  const v = Game.state.village;
  v.sharedKnowledge = v.sharedKnowledge || {};
  const p = (Game.data.plants || []).find(x => x && x.id && x.edibility && x.knowledgeLevels);
  const pid = p.id;
  const cap = captureSay(Game);

  // W1: village hits L2 while the player is home, knows it L1, has 3 harvests
  v.sharedKnowledge[pid] = { discoveredBy: 'x', day: 0, level: 1, servings: 7 };
  Game.state.codex.plants[pid] = { identifiedDay: 0, level: 1, harvests: 3, tastings: 0, by: 'test' };
  v.todayHandled = { [pid]: true };
  Game.villageHandlingDeepens(v);
  ok('W1a shared reaches L2', v.sharedKnowledge[pid].level === 2);
  ok('W1b combine fires at the deepening moment (player reaches L2)',
    Game.state.codex.plants[pid].level === 2);
  ok('W1c combine narrates the village as the deeper source',
    cap.lines.some(l => l.includes('KNOWLEDGE COMBINES') && /village/i.test(l)));

  // W2: same moment, but the player never handled it — hint, no deepen
  const p2 = (Game.data.plants || []).find(x => x && x.id && x.id !== pid && x.edibility && x.knowledgeLevels);
  v.sharedKnowledge[p2.id] = { discoveredBy: 'x', day: 0, level: 1, servings: 7 };
  Game.state.codex.plants[p2.id] = { identifiedDay: 0, level: 1, harvests: 0, tastings: 0, by: 'test' };
  const nBefore = cap.lines.length;
  v.todayHandled = { [p2.id]: true };
  Game.villageHandlingDeepens(v);
  ok('W2a shared reaches L2', v.sharedKnowledge[p2.id].level === 2);
  ok('W2b no harvests: player stays L1', Game.state.codex.plants[p2.id].level === 1);
  const newLines = cap.lines.slice(nBefore);
  ok('W2c the toll hint fires instead (0/3)', newLines.some(l => l.includes('it\'ll click') && /\b0\/3\b/.test(l)),
    `lines: ${newLines.map(l => l.slice(0, 80)).join(' | ')}`);

  // W3: player away — depth accrues, but no combine and no narration
  const p3 = (Game.data.plants || []).find(x => x && x.id && x.id !== pid && x.id !== p2.id && x.edibility && x.knowledgeLevels);
  v.sharedKnowledge[p3.id] = { discoveredBy: 'x', day: 0, level: 1, servings: 7 };
  Game.state.codex.plants[p3.id] = { identifiedDay: 0, level: 1, harvests: 5, tastings: 0, by: 'test' };
  Game.map.px = 50; Game.map.py = 50; // far from haven
  ok('W3a precondition: player is away', Game.playerAtHaven() === false);
  const mBefore = cap.lines.length;
  v.todayHandled = { [p3.id]: true };
  Game.villageHandlingDeepens(v);
  Game.map.px = 4; Game.map.py = 4;
  ok('W3b shared still deepens while you are away', v.sharedKnowledge[p3.id].level === 2);
  ok('W3c away: no combine (player stays L1)', Game.state.codex.plants[p3.id].level === 1);
  ok('W3d away: nothing narrated', cap.lines.length === mBefore);
  cap.restore();

  console.log(`\nW-tests: ${pass} passed, ${fail} failed`);
  console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
