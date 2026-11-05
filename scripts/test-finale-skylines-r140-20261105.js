#!/usr/bin/env node
// test-finale-skylines-r140-20261105.js — journey-endgame r140, fixes F2+F3.
// Replays the v1c trial walk (apex bow, 5000-HP pool — the fight runs
// long enough to reach the sky-fall phase) and asserts the sky lines:
//   F2: the player is "You take N.", never "You takes N."
//       (finale-campaign.js fiSkyFall/fiCreditsBurn build the line as
//       name + ' takes ' — the player's name IS "You".)
//   F3: no "(MOVE works.)" QA aside survives in player-facing fiction
//       (fiSkyFall's empty-zones line).
// Allies keep third-person "takes" (guard against over-correction).
// RED on baseline, GREEN after the fix. The walk takes ~30s.
//
// r140 closeout: the plain walk stopped hitting the player after Fix A
// (harry-when-stuck) changed the fight's course — zones resolve, allies
// take them, the player never stands under one. The driver below parks
// the player under an armed zone each round, so the F2 line is exercised
// deterministically. The four asserts are unchanged.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, driveFights } = require('./sim-harness');

const DARK_LEDGER = { might: 8, brokerage: 2, showmanship: 2, embrace: 0, defiance: 6, exposed: 2, unified: 2, fractured: 1, foodShared: 1, foodHoarded: 8, protected: 2, killed: 12, betrayed: 2 };

function lesserSeat(Game) {
  Game.state.systemArrived = true; Game.state.scholar.integration = 55;
  Game.state.networkLive = true;
  Game.progState().sentimentTaught = true;
  Game.state.scholar.prog = Game.state.scholar.prog || {}; Game.state.scholar.prog.feastSurgeUsed = true;
  const faced = {};
  [[1, 4], [2, 4], [3, 3]].forEach(([w, n]) => { for (let i = 0; i < n; i++) faced['w' + w + 'm' + i] = w; });
  Game.progState().deeds = { wavesFaced: faced, contestsSurvived: 2 };
  Game.progState().crises = { c1: 1, c2: 1 };
  Game.progState().ledger = DARK_LEDGER;
  Game.state.village.trust = {};
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  roster.forEach((id, i) => { Game.state.village.trust[id] = 45 + (i * 3) % 30; });
  Game.state.village.viewership = 20;
}

function gearUp(Game) {
  const s = Game.state.scholar;
  s.equipped = s.equipped || {};
  s.equipped.ranged = { itemId: 'apex_bow', name: 'Apex Bow' };
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'arrow', material: 'arrow', units: 200, name: 'Arrows' });
  s.health = 5000;
}

(async () => {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.apply(this, arguments); } catch (e) {} };
  Game.sysSay = function (t) { lines.push('SYS:' + String(t)); try { return origSys.apply(this, arguments); } catch (e) {} };

  lesserSeat(Game);
  Game.state.scholar.day = 90;
  gearUp(Game);
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  if (Game.tableState().phase === 'conscript') Game.chooseTableOption('conscript:no');
  Game.chooseTableOption('beat:mercy');
  Game.chooseTableOption('beat:trial');
  assert.ok(Game.tbfight && !Game.tbfight.over, 'trial fight must be live');
  const ctx = { policyId: 'skylines-test', notes: [] };
  // Park the player under an armed sky zone whenever one exists. The
  // default driver never moves the player (strike + wait), so without
  // this the walk's zone placement decides whether F2 is exercised at
  // all. Returning false lets the default strike/wait proceed.
  const parkPolicy = {
    fight(Game) {
      try {
        const f = Game.tbfight;
        const zones = (f && f.fiSkyArmed) || [];
        const p = zones.length ? Game.tbFighter('p') : null;
        if (p && p.alive) { p.mx = zones[0].x + 1; p.my = zones[0].y + 1; }
      } catch (e) {}
      return false;
    }
  };
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < 12) driveFights(Game, parkPolicy, ctx);
  assert.ok(!(Game.tbfight && !Game.tbfight.over), 'trial fight must resolve');

  const youTakes = lines.filter(l => /— You takes \d+/.test(l));
  const youTake = lines.filter(l => /— You take \d+\./.test(l));
  const moveWorks = lines.filter(l => /\(MOVE works\.\)/.test(l));
  const allyTakes = lines.filter(l => /— (Dineo|Wolfgang|Lena|Ruth) takes \d+/.test(l));
  console.log('you-takes lines:', JSON.stringify(youTakes));
  console.log('you-take lines:', JSON.stringify(youTake));
  console.log('MOVE-works lines:', JSON.stringify(moveWorks));
  console.log('ally-takes lines:', JSON.stringify(allyTakes));
  assert.strictEqual(youTakes.length, 0, 'no "You takes N." line may survive (F2)');
  assert.ok(youTake.length >= 1, 'at least one "You take N." line must appear (F2 — the sky must hit the player)');
  assert.strictEqual(moveWorks.length, 0, 'no "(MOVE works.)" aside may survive (F3)');
  assert.ok(allyTakes.length >= 1, 'allies must keep third-person "takes" (guard)');
  Game.say = origSay; Game.sysSay = origSys;
  console.log('PASS test-finale-skylines-r140');
  process.exit(0);
})().catch(e => { console.error('FAIL test-finale-skylines-r140:', e && e.message); process.exit(1); });
