#!/usr/bin/env node
// test-dodge-the-the-20261121.js — proof for the journey-crisis r261
// "dodged the the attack!" doubled-article blemish (r257 panel, seed 14575 d44).
//
// THE DEFECT: src/js/game.js tbMonsterTurn, the DODGED branch:
//   this.tbStyle(15, `dodged the ${this.encAttackName(m, tg.attackName)}!`);
// encAttackName returns 'the attack' (article included) while the pattern is
// unlearned — "the attack" is the dread placeholder, not a bare name. The
// blind "the " prepend composes "dodged the the attack!". Same family as
// the r249/r253 antler fix (26772ac93 / eb12c1471): the articlePhrase class
// fix exists and the sibling sites already use it; this site was missed.
// The sibling encAttackName call sites (44355, 44495, 44535, 45186, 45289,
// 45354) all compare against 'the attack' or use it bare — 44729 is the
// only blind-prepend site (grep verified).
//
// THE FIX (src/js/game.js): compose via articlePhrase —
//   `dodged ${this.articlePhrase(this.encAttackName(m, tg.attackName))}!`
// Unknown -> 'the attack' -> articlePhrase strips the lowercase article
// and re-adds it -> "dodged the attack!". A learned capitalized name
// ('Trample') stands bare -> "dodged Trample!". A learned lowercase name
// ('sweep') takes "the " -> "dodged the sweep!".
//
// STAGING: a real tbMonsterTurn resolve, not a string unit test. A fake
// brute (no species hooks fire) declares a beam telegraph with
// threatenedPlayer=true; the player stands OUTSIDE the staged cells at
// resolve, so playerHit=false and the DODGED branch fires. tbEndCheck is
// stubbed true so the turn ends after the resolve instead of falling
// through to act-by-pattern (the dodge line is already spoken by then;
// the stub only controls post-resolve flow, like the antler test's
// tbDamage stub). tbPatternKnown is stubbed true for the known-name cases
// — the stub stands in for "survived this attack before", the knowledge
// state encAttackName gates on. systemArrived must be true or tbStyle
// stays silent (its own guard).
//
// RED (before): case A says "dodged the the attack!" (1 fail).
// GREEN (after): all cases read clean (7/7).
//
// Usage: node scripts/test-dodge-the-the-20261121.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 14575, mode: 'dodge-the-the-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  // Fight ends after the resolve: keeps tbMonsterTurn from falling through
  // to act-by-pattern after the dodge line is spoken.
  Game.tbEndCheck = function () { return true; };
  Game.state.systemArrived = true;

  const mdef = { id: 'testbrute', name: 'Test Brute',
    attack: { name: 'Trample', damage: [5, 8], pattern: { type: 'beam' } } };

  function stageDodge(attackName, known) {
    said.length = 0;
    if (known) Game.tbPatternKnown = function () { return true; };
    else delete Game.tbPatternKnown; // real gate: unknown id -> 'the attack'
    const m = { kind: 'monster', key: 'm_0', monsterId: 'testbrute', mdef: mdef,
      name: 'Test Brute', mx: 4, my: 4, alive: true, hp: 50, maxHp: 50,
      speed: 3, moveLeft: 3, acted: false, stunned: 0,
      telegraph: { kind: 'squares', pattern: { type: 'beam' }, turnsLeft: 1,
        cells: [{ cx: 2, cy: 2 }], attackName: attackName,
        threatenedPlayer: true, dmg: [5, 8] } };
    const p = { kind: 'player', key: 'p', name: 'Scholar', mx: 5, my: 5,
      alive: true, hp: 100, maxHp: 100, moveLeft: 3, acted: false };
    Game.tbfight = { fighters: [m, p], order: ['p', 'm_0'], over: false, round: 1 };
    Game.tbMonsterTurn(m);
    return said.slice();
  }

  // ---- A: the panel case — pattern unlearned, attack is just "the attack" ----
  const a = stageDodge('Trample', false);
  check('A: the dodge branch fires (clean-dodge line spoken)',
    a.some(l => /Clean dodge/.test(l)), JSON.stringify(a));
  check('A: no "dodged the the attack!" doubled article',
    !a.some(l => /dodged the the /i.test(l)), JSON.stringify(a));
  check('A: line reads "dodged the attack!"',
    a.some(l => /dodged the attack!/.test(l)), JSON.stringify(a));

  // ---- B: pattern learned, capitalized name stands bare ----
  const b = stageDodge('Trample', true);
  check('B: learned name reads "dodged Trample!" (no "the Trample")',
    b.some(l => /dodged Trample!/.test(l)) && !b.some(l => /dodged the Trample/.test(l)),
    JSON.stringify(b));

  // ---- C: pattern learned, lowercase name takes "the " ----
  const c = stageDodge('sweep', true);
  check('C: learned lowercase name reads "dodged the sweep!"',
    c.some(l => /dodged the sweep!/.test(l)), JSON.stringify(c));
  check('C: no doubled article anywhere',
    !c.some(l => /dodged the the /i.test(l)), JSON.stringify(c));

  // ---- D: the player was never threatened -> no dodge line at all ----
  said.length = 0;
  delete Game.tbPatternKnown;
  const m2 = { kind: 'monster', key: 'm_0', monsterId: 'testbrute', mdef: mdef,
    name: 'Test Brute', mx: 4, my: 4, alive: true, hp: 50, maxHp: 50,
    speed: 3, moveLeft: 3, acted: false, stunned: 0,
    telegraph: { kind: 'squares', pattern: { type: 'beam' }, turnsLeft: 1,
      cells: [{ cx: 2, cy: 2 }], attackName: 'Trample',
      threatenedPlayer: false, dmg: [5, 8] } };
  const p2 = { kind: 'player', key: 'p', name: 'Scholar', mx: 5, my: 5,
    alive: true, hp: 100, maxHp: 100, moveLeft: 3, acted: false };
  Game.tbfight = { fighters: [m2, p2], order: ['p', 'm_0'], over: false, round: 1 };
  Game.tbMonsterTurn(m2);
  check('D: unthreatened player gets no dodge line',
    !said.some(l => /dodged /.test(l)), JSON.stringify(said));

  console.log(fail ? `\nRESULT: FAIL (${fail} failed, ${pass} passed)` : `\nRESULT: PASS (${pass} passed)`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
