#!/usr/bin/env node
// test-ruth-wait-r140-20261105.js — journey-endgame r140, Ruth fixes.
// BUG (r138 dark probe, reproduced r140): in the trial, Ruth takes a turn
// every round and never acts — 16/16 "SYS:Ruth's turn" headers with no
// action line. Diagnosis (probe-ruth-wait-r140): Ruth is 'helpful', stuck
// at body-distance 2 from the Finale with every closing step blocked
// (traffic jam around a big body), and the 'helpful' branch of
// villagerDecide has NO ranged fallback — unlike 'brave', which harries
// (thrown rock) at distance <= 3. So she waits, forever, silently:
// tbVillagerTurn has no narration branch for 'wait' either.
//   Fix A (engine/combat.js): a helpful villager who cannot close to
//     strike at range <= 3 harries, like a brave one — a throw from
//     where she stands, not a silent wait.
//   Fix B (game.js tbVillagerTurn): any unhandled action ('wait') is
//     narrated honestly — the villager holds and watches — so no turn
//     is ever silent.
// Part A is a unit check on villagerDecide (RED: 'wait', GREEN: 'harry').
// Part B replays the v1c trial walk and asserts zero silent turns
// (RED: 16, GREEN: 0). The walk takes ~30s.
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

function countSilentTurns(lines, names) {
  // A turn is silent when its "SYS:<name>'s turn" header is followed by
  // no line starting with "<name> " before the next SYS header.
  let silent = 0;
  const silentList = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^SYS:(.+)'s turn$/);
    if (!m) continue;
    const name = m[1];
    if (!names.includes(name)) continue;
    let j = i + 1, acted = false;
    while (j < lines.length && !lines[j].startsWith('SYS:')) {
      if (lines[j].startsWith(name + ' ')) { acted = true; break; }
      j++;
    }
    if (!acted) { silent++; silentList.push({ line: i + 1, name }); }
  }
  return { silent, silentList };
}

(async () => {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const combat = (globalThis.Scattering || {}).combat || {};
  assert.equal(typeof combat.villagerDecide, 'function', 'Scattering.combat.villagerDecide must exist');

  // ---- Part A: decide-level. Monster body 2x2 at (5,5); Ruth at (3,4)
  // is body-distance 2; every closing step blocked.
  const monster = { key: 'm_0', kind: 'monster', mx: 5, my: 5, size: 2, hp: 1000, maxHp: 1000, alive: true };
  const player = { key: 'p', kind: 'player', mx: 0, my: 0, hp: 100, maxHp: 100, alive: true };
  const blockedAll = () => true;
  const ruth = { key: 'v_r', kind: 'villager', name: 'Ruth', mx: 3, my: 4, hp: 100, maxHp: 100, speed: 2, ai: 'helpful', alive: true };
  const decRuth = combat.villagerDecide(ruth, [player, monster, ruth], blockedAll, [], null, 11);
  console.log('Ruth decide (blocked at dist 2):', JSON.stringify(decRuth.action));
  assert.strictEqual(decRuth.action.type, 'harry', 'a helpful villager who cannot close at range <=3 must harry, not wait');
  assert.strictEqual(decRuth.action.target, 'm_0', 'the harry must target the foe');
  // Controls: brave at the same spot already harries; helpful who CAN
  // close still strikes.
  const brave = Object.assign({}, ruth, { key: 'v_b', name: 'Brave', ai: 'brave' });
  const decBrave = combat.villagerDecide(brave, [player, monster, brave], blockedAll, [], null, 11);
  assert.strictEqual(decBrave.action.type, 'harry', 'brave control: harry at range <=3');
  const open = () => false;
  const ruthClose = Object.assign({}, ruth, { mx: 4, my: 5 });
  const decClose = combat.villagerDecide(ruthClose, [player, monster, ruthClose], open, [], null, 11);
  assert.strictEqual(decClose.action.type, 'strike', 'helpful control: strike when adjacency is reachable');

  // ---- Part B: end-to-end v1c walk — zero silent turns.
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
  const ctx = { policyId: 'ruth-test', notes: [] };
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < 12) driveFights(Game, {}, ctx);
  assert.ok(!(Game.tbfight && !Game.tbfight.over), 'trial fight must resolve');
  const { silent, silentList } = countSilentTurns(lines, ['Wolfgang', 'Dineo', 'Lena', 'Ruth']);
  console.log('silent turns:', silent, JSON.stringify(silentList));
  assert.strictEqual(silent, 0, 'no villager turn may be silent (Fix A harry + Fix B hold line)');
  Game.say = origSay; Game.sysSay = origSys;
  console.log('PASS test-ruth-wait-r140');
  process.exit(0);
})().catch(e => { console.error('FAIL test-ruth-wait-r140:', e && e.message); process.exit(1); });
