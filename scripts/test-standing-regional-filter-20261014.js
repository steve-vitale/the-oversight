#!/usr/bin/env node
// scripts/test-standing-regional-filter-20261014.js — PROOF for the
// Standing diplomacy regional+ filter (sim-findings #85: the spec says
// "+34 per seasoned regional+ link" but villageStanding() counted ALL
// seasoned links — splinter-village bonds scored the same as regional
// fires).
//
// DESIGN CALL (2026-10-14, Steve's make-the-call rule — he can overrule):
// a seasoned link is REGIONAL+ (counts toward diplomacy) iff it
// participates in a regional-scale polity, read from existing APIs only:
//   LEAD   — one of Haven's seasoned subordinate links AND polityOf('haven')
//            exists (>=3 seasoned subordinates = a realm; 4 fires under one
//            head). This keeps the spec's "3 links = 102: the pure
//            DIPLOMACY path" honest.
//   BELONG — Haven subordinate AND polityOf(primary) exists (the primary's
//            realm holds >=4 villages).
//   LEAGUE — a seasoned covenant/trade peer link inside its league polity
//            (_covenantPolity()/_tradePolity() non-null, link among links).
// A lone seasoned bond with a splinter village (a pact of 1-2, no polity
// behind it) is courtship, not regional power — it no longer moves the
// System. No new tracking; fail-closed (missing APIs = not regional+).
//
// RED on pristine code: lone-seasoned-link assertions FAIL (links===1 vs
// expected 0). GREEN after the fix in src/js/standing.js.
'use strict';
const assert = require('assert');
const K = require('./godpath/lib');
const { stripReadiness, prepareReadiness } = require('./lib/standing-fixture');
let sharedGame;

let pass = 0, fail = 0;
function ok(name, cond) {
  if (!cond) { fail++; console.error('FAIL ' + name); return; }
  pass++; console.log('  PASS ' + name);
}

function clearLinks(Game) {
  try { Game.hierarchyState().length = 0; } catch (e) {}
  try { Game.state.foreignPolities = []; } catch (e) {}
}

function mkSub(Game, id, trust) {
  return { id: 'l_' + id, primary: 'haven', subordinate: 'village_' + id,
    trust: trust == null ? 50 : trust, status: 'active', day: 0, arrears: 0 };
}
function mkPeer(Game, id, kind) {
  return { id: 'l_' + id, kind: kind, a: 'haven', b: 'village_' + id,
    trust: 50, status: 'active', day: 0, arrears: 0 };
}
function mkBelong(Game, id, trust) {
  return { id: 'l_b' + id, primary: 'village_' + id, subordinate: 'haven',
    trust: trust == null ? 50 : trust, status: 'active', day: 0, arrears: 0 };
}

async function freshGame() {
  const Game = sharedGame;
  K.newRun(Game);
  Game.state.scholar.day = 60; // 30+ days old + trust 40+ => seasoned
  clearLinks(Game);
  return Game;
}

(async () => {
  sharedGame = await K.load({ seed: Number(process.env.SEED || 90210) });
  sharedGame.debugRegion = 'na_eastern_woodlands';
  console.log('standing-regional-filter proof');

  // 1. ONE lone seasoned subordinate link: NOT regional+ -> 0 diplomacy.
  //    (RED on pristine: counted as 1.)
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkSub(Game, 0));
    const s = Game.villageStanding();
    ok('lone seasoned sub link counts 0 (not regional+)', s.links === 0 && s.diplomacy === 0);
  }

  // 2. TWO seasoned subordinate links (a pact, no realm): still 0.
  //    (RED on pristine: counted as 2.)
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkSub(Game, 0), mkSub(Game, 1));
    const s = Game.villageStanding();
    ok('two seasoned sub links (no realm) count 0', s.links === 0 && s.diplomacy === 0);
  }

  // 3. THREE seasoned subordinate links = a realm (polityOf('haven')):
  //    all count -> 3 x 34 = 102. The spec's pure-DIPLOMACY path.
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkSub(Game, 0), mkSub(Game, 1), mkSub(Game, 2));
    ok('realm exists via polityOf(haven)', !!Game.polityOf('haven'));
    const s = Game.villageStanding();
    ok('3 realm links = 3 links / 102 diplomacy', s.links === 3 && s.diplomacy === 102);
  }

  // 4. FOURTH link into an existing realm also counts (uncapped LEAD road).
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkSub(Game, 0), mkSub(Game, 1), mkSub(Game, 2), mkSub(Game, 3));
    const s = Game.villageStanding();
    ok('4 realm links = 4 links / 136 diplomacy', s.links === 4 && s.diplomacy === 136);
  }

  // 5. BELONG to a plain splinter village (no foreign realm): 0.
  //    (RED on pristine: counted as 1.)
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkBelong(Game, 0));
    const s = Game.villageStanding();
    ok('belong to splinter village counts 0', s.links === 0 && s.diplomacy === 0);
  }

  // 6. BELONG to a regional fire (primary heads a foreign realm of >=4
  //    villages): counts.
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkBelong(Game, 0));
    Game.state.foreignPolities = [{ primary: 'village_0', subs: ['village_1', 'village_2', 'village_3'], day: 10 }];
    ok('belong realm exists via polityOf(primary)', !!Game.polityOf('village_0'));
    const s = Game.villageStanding();
    ok('belong to regional fire counts 1', s.links === 1 && s.diplomacy === 34);
  }

  // 7. Two seasoned covenant peer links (a pact, no league polity): 0.
  //    (RED on pristine: counted as 2.)
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkPeer(Game, 0, 'covenant'), mkPeer(Game, 1, 'covenant'));
    const s = Game.villageStanding();
    ok('two covenant links (no league) count 0', s.links === 0 && s.diplomacy === 0);
  }

  // 8. Three seasoned covenant peer links = a 4-fire league: all count.
  {
    const Game = await freshGame();
    Game.hierarchyState().push(mkPeer(Game, 0, 'covenant'), mkPeer(Game, 1, 'covenant'), mkPeer(Game, 2, 'covenant'));
    ok('league exists via _covenantPolity', !!Game._covenantPolity());
    const s = Game.villageStanding();
    ok('3 league links = 3 links / 102 diplomacy', s.links === 3 && s.diplomacy === 102);
  }

  // 9. Unseasoned links never count (trust too low), even in a would-be realm.
  {
    const Game = await freshGame();
    const a = mkSub(Game, 0, 20), b = mkSub(Game, 1, 20), c = mkSub(Game, 2, 20);
    Game.hierarchyState().push(a, b, c);
    const s = Game.villageStanding();
    ok('unseasoned realm links count 0', s.links === 0 && s.diplomacy === 0);
  }

  // 10. Waves 1-3 unlock behavior unchanged (standing gate only gates 4+).
  {
    const Game = await freshGame();
    ok('fresh game wave 1', Game.unlockedWave() === 1);
    // wave-3 rung first (audit 2026-10-14: standing rungs sit on top of it):
    // day past the floor + 5 wave-2 ledger points (no standing from w2).
    Game.state.scholar.day = 30;
    for (const id of ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea', 'memory_projector']) Game.recordWaveKill(id);
    for (const id of ['redactor', 'gavel', 'focus_group', 'spool']) Game.recordWaveKill(id);
    stripReadiness(Game);
    ok('standing without live readiness holds at wave 3', Game.unlockedWave() === 3);
    ok('real combat readiness fixture meets the wave-4 bars', prepareReadiness(Game, 4).ready);
    ok('war path still unlocks wave 4 once ready (4 kills = 100)', Game.villageStanding().war === 100 && Game.unlockedWave() === 4);
    ok('wave 5 still locked without w4 faced', Game.unlockedWave() !== 5);
  }

  // 11. Day-90 win floor intact (table.js untouched, but assert).
  {
    const Game = await freshGame();
    Game.state.scholar.day = 89;
    ok('no win before day 90', Game.winDayFloorOk() === false);
    Game.state.scholar.day = 90;
    ok('win allowed at day 90', Game.winDayFloorOk() === true);
  }

  // 12. Weights unchanged: 34 per regional+ link (spec's sim starting point).
  {
    const Game = await freshGame();
    ok('diplomacyPerLink still 34', Game.standingCfg().diplomacyPerLink === 34);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
})().catch(e => { console.error('HARNESS ERROR', e); process.exitCode = 2; });
