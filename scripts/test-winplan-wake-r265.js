#!/usr/bin/env node
// Proof: PLANWAKE — the win-plan store wakes live on the first Haven
// tick (journey-establishment r265, 2026-11-22).
//
// r247 proved the win-plan system never ignites on the establishment
// leg (0/5 seeds, planSeeds 0, partyDepartures 0 — seventh silent
// panel) because the plan store is created only by a wave-3+ agency
// evade/flee/kill or by the env-gated PLANFIX flag, and neither fires
// in live play. winPlanHavenTick read the store directly, so it could
// never be the first spark.
// ROOT CAUSE: the store-init guard `if (!v.winPlan) { if
// (!planfixOn()) return null; ... }` — planfixOn() is false in the
// browser (process undefined) and false in node sims unless PLANFIX=1.
// GREEN (post-fix): the store wakes unconditionally on the first Haven
// tick; the ENGAGEMENT gate is unchanged — a plan still seeds only for
// a wanderer/explorer-profile villager at Haven who has personally
// fought a beast or whose village has slain one (fire knowledge).
// An empty store is inert: no plan exists until seeded.
// Uses the shared harness (scripts/sim-harness). Exits nonzero on failure.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const ROOT = path.join(__dirname, '..');

let pass = 0;
function check(name, cond, extra) {
  assert(cond, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function freshGame() {
  const { Game } = await loadGame({ seed: 385, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const home = (Number.isFinite(v.px) && Number.isFinite(v.py)) ? { x: v.px, y: v.py } : { x: 4, y: 4 };
  const living = (v.roster || []).filter(id => {
    if (String(id) === String(Game.villagerId)) return false;
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  function placeAtHaven(vid) {
    const vv = Game.state.village || {};
    vv.nodePos = vv.nodePos || {};
    vv.nodePos[vid] = { nx: home.x, ny: home.y };
    if (vv.away) delete vv.away[vid];
  }
  function setProfile(vid, prof) {
    const a = Game.agencyState();
    a.profiles = a.profiles || {};
    a.profiles[vid] = prof;
    return Game.npcRangeProfile(vid);
  }
  return { Game, v, home, living, placeAtHaven, setProfile };
}

async function main() {
  const t = await freshGame();
  const Game = t.Game;
  check('winPlanHavenTick is a Game method', typeof Game.winPlanHavenTick === 'function');

  // A1: the store does not exist on a fresh game (the system sleeps).
  check('A1 no winPlan store on a fresh game', !((Game.state.village || {}).winPlan), 'winPlan=' + JSON.stringify((Game.state.village || {}).winPlan));

  // A2 (control first — no kill anywhere): a wanderer at Haven with
  // no lived/heard knowledge gets NO plan — the engagement gate holds —
  // but the store itself is now woken (empty, inert).
  const vidA = t.living[0];
  const profA = t.setProfile(vidA, 'wanderer');
  check('A2 staged profile reads wanderer', profA === 'wanderer', 'got ' + profA);
  t.placeAtHaven(vidA);
  Game.state.villageSlain = {};
  let tickA = null;
  try { tickA = Game.winPlanHavenTick(vidA, t.home.x, t.home.y); } catch (e) { assert(false, 'A2 tick threw: ' + (e && e.message)); }
  check('A2 store exists after the first Haven tick (woken)', !!((Game.state.village || {}).winPlan), 'winPlan missing after tick');
  check('A2 no plan without lived/heard knowledge', !((Game.state.village || {}).winPlan || {})[vidA], 'plan seeded with no knowledge: ' + JSON.stringify(((Game.state.village || {}).winPlan || {})[vidA]));
  check('A2 planSeeds still 0', ((Game.state.village || {}).winPlanStats || {}).planSeeds === 0, 'planSeeds=' + JSON.stringify(((Game.state.village || {}).winPlanStats || {}).planSeeds));

  // A3: the village has slain a beast (fire knowledge — the deed talk
  // tells everyone). The SAME wanderer at Haven now seeds a plan.
  Game.state.villageSlain = { deer: 1 };
  const tickB = Game.winPlanHavenTick(vidA, t.home.x, t.home.y);
  const planA = ((Game.state.village || {}).winPlan || {})[vidA];
  check('A3 plan seeded from village-slain knowledge', !!planA, 'no plan after villageSlain set');
  check('A3 plan starts at gear stage', planA && planA.stage === 'gear', 'stage=' + JSON.stringify(planA && planA.stage));
  check('A3 planSeeds bumped to 1', ((Game.state.village || {}).winPlanStats || {}).planSeeds === 1, 'planSeeds=' + JSON.stringify(((Game.state.village || {}).winPlanStats || {}).planSeeds));

  // A4: a second villager whose profile is NOT wanderer/explorer gets
  // no plan even with the village kill known (profile gate holds).
  const vidB = t.living[1];
  const profB = t.setProfile(vidB, 'homebody');
  check('A4 staged profile reads homebody', profB === 'homebody', 'got ' + profB);
  t.placeAtHaven(vidB);
  Game.winPlanHavenTick(vidB, t.home.x, t.home.y);
  check('A4 homebody gets no plan despite the village kill', !((Game.state.village || {}).winPlan || {})[vidB]);
  check('A4 planSeeds still 1', ((Game.state.village || {}).winPlanStats || {}).planSeeds === 1, 'planSeeds=' + JSON.stringify(((Game.state.village || {}).winPlanStats || {}).planSeeds));

  // A5: personally-fought knowledge also seeds (the lived arm, not
  // just the heard arm). A fresh wanderer with a fought record.
  const vidC = t.living[2];
  t.setProfile(vidC, 'explorer');
  t.placeAtHaven(vidC);
  const a = Game.agencyState();
  a.know = a.know || {};
  a.know[vidC] = a.know[vidC] || {};
  a.know[vidC].fought = ['deer'];
  Game.state.villageSlain = {};
  Game.winPlanHavenTick(vidC, t.home.x, t.home.y);
  const planC = ((Game.state.village || {}).winPlan || {})[vidC];
  check('A5 plan seeded from personally-fought knowledge', !!planC, 'no plan from fought record');
  check('A5 planSeeds now 2', ((Game.state.village || {}).winPlanStats || {}).planSeeds === 2, 'planSeeds=' + JSON.stringify(((Game.state.village || {}).winPlanStats || {}).planSeeds));

  // A6 (source): the Haven-tick guard no longer calls the env gate.
  const src = fs.readFileSync(path.join(ROOT, 'src/js/win-plan.js'), 'utf8');
  const tickSrc = src.slice(src.indexOf('winPlanHavenTick(vid, hx, hy) {'));
  const guardBlock = tickSrc.slice(0, tickSrc.indexOf('if (!atHaven'));
  check('A6 store-init guard has no planfixOn() call', !/planfixOn\(\)/.test(guardBlock), 'guard still env-gated');
  check('A6 store init still goes through stateOf()', /v = stateOf\(this\)/.test(guardBlock));

  console.log(`\n${pass} passed`);
}
main().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(1); });
