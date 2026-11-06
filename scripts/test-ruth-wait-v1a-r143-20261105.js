#!/usr/bin/env node
// test-ruth-wait-v1a-r143-20261105.js — journey-endgame r143, Ruth fixes (2).
// BUG (r143 dark probe, v1a-loss/v1b-honest): Ruth harries every round in
// v1c-tank (r140 Fix A working) but waits silently 3x in the losing walks.
// Diagnosis (probe-ruth-wait-v1a-r143-20261105.js): Ruth is 'helpful' at
// body-distance 2 from the Finale, full HP, 0 moves. Rounds 1-2 she harries
// (player healthy, Fix A branch). Rounds 3-5 the player is hurt (<70%), so
// the HELP branch fires first — she tries to close on the player, cannot
// reach them (0 moves, blocked), and returns 'wait' WITHOUT ever reaching
// the strike/harry logic below. Fix A patched only the strike branch; the
// help branch kept the silent wait. And tbVillagerTurn has no narration
// branch for 'wait' at all (r140's planned Fix B never landed — no such
// string exists on master), so the turn is silent in the transcript.
//   Fix C (engine/combat.js): when the hurt player cannot be reached, the
//     help branch falls back to fighting from where she stands — strike
//     if the foe is adjacent, harry if it is in range. No second move:
//     her steps were spent closing on the player.
//   Fix B (game.js tbVillagerTurn): any unhandled action ('wait') is
//     narrated honestly — the villager holds and watches — so no turn is
//     ever silent. (Canon: no silent actions.)
// Part A is unit checks on villagerDecide (RED: 'wait' where a harry is
// owed, GREEN: 'harry'/'help' as named). Part B replays the v1a trial walk
// and asserts zero silent turns with Ruth harrying 5/5. Part C stages a
// live field fight and asserts a genuine out-of-range wait is narrated
// (the "holds and watches" line), proving Fix B at the turn level.
// Usage: node scripts/test-ruth-wait-v1a-r143-20261105.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame, driveFights } = require('./sim-harness');
const L = require('./godpath/lib.js');

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
  // is body-distance 2; every closing step blocked (r140 geometry).
  const monster = { key: 'm_0', kind: 'monster', mx: 5, my: 5, size: 2, hp: 1000, maxHp: 1000, alive: true };
  const blockedAll = () => true;
  const mkRuth = (o) => Object.assign({ key: 'v_r', kind: 'villager', name: 'Ruth', mx: 3, my: 4, hp: 100, maxHp: 100, speed: 2, ai: 'helpful', alive: true }, o || {});
  // A1: THE BUG — player hurt (60%) and unreachable (far + blocked),
  // foe at body-distance 2. Old code: 'wait'. Fixed: 'harry'.
  const hurtPlayer = { key: 'p', kind: 'player', mx: 0, my: 0, hp: 60, maxHp: 100, alive: true };
  const ruthA1 = mkRuth();
  const decA1 = combat.villagerDecide(ruthA1, [hurtPlayer, monster, ruthA1], blockedAll, [], null, 11);
  console.log('A1 hurt-unreachable-foe-near decide:', JSON.stringify(decA1.action));
  assert.strictEqual(decA1.action.type, 'harry', 'help-branch fallback: unreachable hurt player + foe at dist 2 must harry, not wait');
  assert.strictEqual(decA1.action.target, 'm_0', 'the fallback harry must target the foe');
  // A2: help still fires when the hurt player IS reachable.
  const ruthA2 = mkRuth({ mx: 1, my: 0 });
  const decA2 = combat.villagerDecide(ruthA2, [hurtPlayer, monster, ruthA2], blockedAll, [], null, 11);
  console.log('A2 hurt-reachable decide:', JSON.stringify(decA2.action));
  assert.strictEqual(decA2.action.type, 'help', 'help must still fire when the hurt player is adjacent');
  // A3: Fix A regression — player healthy, foe at dist 2, blocked.
  const healthyPlayer = { key: 'p', kind: 'player', mx: 0, my: 0, hp: 100, maxHp: 100, alive: true };
  const ruthA3 = mkRuth();
  const decA3 = combat.villagerDecide(ruthA3, [healthyPlayer, monster, ruthA3], blockedAll, [], null, 11);
  assert.strictEqual(decA3.action.type, 'harry', 'Fix A control: healthy player + foe at dist 2 must harry');
  // A4: no foe in range + unreachable hurt player — decide still waits
  // (nothing to throw at); Fix B narrates it at the turn level (Part C).
  const farMonster = { key: 'm_0', kind: 'monster', mx: 9, my: 9, size: 2, hp: 1000, maxHp: 1000, alive: true };
  const ruthA4 = mkRuth();
  const decA4 = combat.villagerDecide(ruthA4, [hurtPlayer, farMonster, ruthA4], blockedAll, [], null, 11);
  console.log('A4 hurt-unreachable-foe-far decide:', JSON.stringify(decA4.action));
  assert.strictEqual(decA4.action.type, 'wait', 'out-of-range foe must still decide wait (no invented harry)');
  // A5: fallback strike — hurt unreachable player, foe adjacent.
  const ruthA5 = mkRuth({ mx: 4, my: 5 });
  const decA5 = combat.villagerDecide(ruthA5, [hurtPlayer, monster, ruthA5], blockedAll, [], null, 11);
  assert.strictEqual(decA5.action.type, 'strike', 'help-branch fallback: adjacent foe must strike');

  // ---- Part B: end-to-end v1a walk (fresh gear, beat:kill) — zero
  // silent turns, Ruth harries 5/5 (was harry 2 + wait 3).
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { lines.push(String(t)); try { return origSay.apply(this, arguments); } catch (e) {} };
  Game.sysSay = function (t) { lines.push('SYS:' + String(t)); try { return origSys.apply(this, arguments); } catch (e) {} };
  lesserSeat(Game);
  Game.state.scholar.day = 90;
  // v1a walk: fresh gear (no apex bow, no 5000-HP pool), beat:kill.
  Game.tableScene();
  Game.chooseTableOption('path:feared');
  if (Game.tableState().phase === 'conscript') Game.chooseTableOption('conscript:no');
  Game.chooseTableOption('beat:kill');
  Game.chooseTableOption('beat:trial');
  assert.ok(Game.tbfight && !Game.tbfight.over, 'trial fight must be live');
  const ctx = { policyId: 'ruth-v1a-test', notes: [] };
  let calls = 0;
  while (Game.tbfight && !Game.tbfight.over && calls++ < 12) driveFights(Game, {}, ctx);
  assert.ok(!(Game.tbfight && !Game.tbfight.over), 'trial fight must resolve');
  const { silent, silentList } = countSilentTurns(lines, ['Wolfgang', 'Dineo', 'Lena', 'Ruth']);
  console.log('silent turns:', silent, JSON.stringify(silentList));
  assert.strictEqual(silent, 0, 'no villager turn may be silent in the v1a walk (Fix C harry + Fix B hold line)');
  const ruthHarries = lines.filter(l => l.indexOf('Ruth harries the Finale.') >= 0).length;
  console.log('Ruth harry lines:', ruthHarries);
  assert.strictEqual(ruthHarries, 5, 'Ruth must harry on all 5 of her v1a turns (was 2 harry + 3 silent waits)');
  Game.say = origSay; Game.sysSay = origSys;

  // ---- Part C: Fix B at the turn level. Stage a live field fight, put
  // a cautious villager far from the foe (decide 'wait'), drive their
  // turn directly, and assert the wait is narrated.
  const Game2 = await L.load({ seed: 99101 });
  L.newRun(Game2, 'Columbus, Ohio');
  L.fight(Game2, 'hummice', { party: true });
  assert.ok(Game2.tbfight && !Game2.tbfight.over, 'field fight must be live');
  const fighters = Game2.tbfight.fighters || [];
  const vill = fighters.find(f => f.kind === 'villager' && f.alive);
  assert.ok(vill, 'a living villager fighter must exist');
  const foe = fighters.find(f => f.kind === 'monster' && f.alive);
  assert.ok(foe, 'a living monster fighter must exist');
  // Isolate the decide path: cautious, full HP, no abilities (villagerId
  // null skips the ability/field-medicine hooks), far from the foe.
  vill.ai = 'cautious';
  vill.villagerId = null;
  vill.hp = vill.maxHp;
  vill.mx = 0; vill.my = 0;
  foe.mx = 7; foe.my = 4;
  const p2 = Game2.tbFighter('p');
  if (p2) { p2.hp = p2.maxHp; }
  const lines2 = L.captureSays(Game2);
  Game2.tbVillagerTurn(vill);
  const holdLines = lines2.filter(l => l.indexOf('holds and watches') >= 0);
  console.log('hold lines:', JSON.stringify(holdLines));
  assert.ok(holdLines.length >= 1, 'a genuine wait turn must say the villager holds and watches (Fix B)');
  lines2.restore();
  console.log('PASS test-ruth-wait-v1a-r143');
  process.exit(0);
})().catch(e => { console.error('FAIL test-ruth-wait-v1a-r143:', e && e.message); process.exit(1); });
