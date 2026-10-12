#!/usr/bin/env node
// SEALED BARRIER (Steve 2026-10-11): flee-by-barrier is obvious — no visual
// clutter in normal fights. The red barrierSealed edge marks ONLY sealed
// fights, and the seal must actually hold: tbBarrierExit refuses the crossing.
// Proof: normal fight allows the barrier attempt; sealed fight refuses it.
const H = require('./combat-break-harness.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const Game = await H.newCombatReadyGame();

  console.log('--- sealed barrier exit ---');
  {
    H.synthFight(Game, 'bulldozer', { mhp: 200, php: 100 });
    const p = Game.tbFighter('p');
    p.mx = 0; p.my = 4; // on the west edge
    Game.tbfight.turnIdx = 0; // player's turn
    // tbIsPlayerTurn check: ensure it reports true
    const isPT = Game.tbIsPlayerTurn();

    // 1. Normal fight: barrier exit is attempted (not sealed-refused).
    Game.state.arenaContest = null;
    Game.tbfight.noFlee = false;
    let said = [];
    const origSay = Game.say;
    Game.say = (m) => said.push(String(m));
    let r1 = false;
    try { r1 = Game.tbBarrierExit(-1, 0); } catch (e) { said.push('THREW: ' + e.message); }
    const sealedRefusal1 = said.some(m => /Sealed: no one leaves/.test(m));
    check('normal fight: no sealed refusal', isPT && !sealedRefusal1,
      `isPT=${isPT} said=${JSON.stringify(said).slice(0, 160)}`);
    if (Game.tbfight && !Game.tbfight.over) { /* fight may have ended via exit; restore */ }
    Game.say = origSay;

    // 2. Sealed fight (arenaContest): the crossing is refused, fight continues.
    H.synthFight(Game, 'bulldozer', { mhp: 200, php: 100 });
    const p2 = Game.tbFighter('p');
    p2.mx = 0; p2.my = 4;
    Game.tbfight.turnIdx = 0;
    Game.state.arenaContest = { id: 'test-arena' };
    said = [];
    Game.say = (m) => said.push(String(m));
    let r2 = false;
    try { r2 = Game.tbBarrierExit(-1, 0); } catch (e) { said.push('THREW: ' + e.message); }
    Game.say = origSay;
    const sealedRefusal2 = said.some(m => /Sealed: no one leaves/.test(m));
    check('sealed fight: refusal narration', sealedRefusal2,
      `said=${JSON.stringify(said).slice(0, 160)}`);
    check('sealed fight: push consumed (turn spent, no free retry)', r2 === true);
    check('sealed fight: still in combat', !!Game.tbfight && !Game.tbfight.over);
    check('sealed fight: player still on edge tile', p2.mx === 0 && p2.my === 4);
    Game.state.arenaContest = null;
    if (Game.tbfight) Game.tbEnd('fled');

    // 3. Sealed via tbfight.noFlee flag: same refusal.
    H.synthFight(Game, 'bulldozer', { mhp: 200, php: 100 });
    const p3 = Game.tbFighter('p');
    p3.mx = 8; p3.my = 4;
    Game.tbfight.turnIdx = 0;
    Game.tbfight.noFlee = true;
    said = [];
    Game.say = (m) => said.push(String(m));
    try { Game.tbBarrierExit(1, 0); } catch (e) { said.push('THREW: ' + e.message); }
    Game.say = origSay;
    check('noFlee flag: refusal narration',
      said.some(m => /Sealed: no one leaves/.test(m)),
      `said=${JSON.stringify(said).slice(0, 160)}`);
    check('noFlee flag: still in combat', !!Game.tbfight && !Game.tbfight.over);
    if (Game.tbfight) Game.tbEnd('fled');
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
