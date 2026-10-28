#!/usr/bin/env node
// scripts/test-sysbond-a.js — sim-sysbond-a fixture proof (audit arm).
//
// Question: does the Relay DOOR gate on sysBond >= 2 (docs/TABLE.md §7),
// or only on integration stage (+ relay office), with sysBond pricing
// strength (src/js/table-relay.js prereq)?
//
// Method: load the FULL src/js list in index.html order via the shared
// sim harness (seeded Math.random BEFORE eval; Game.save is NEVER
// stubbed — the harness keeps the real save). One fresh game per cell
// is unnecessary: a single loaded game is reconfigured per cell
// (integration, sysBond, switchboard), because prereq reads only those
// three inputs plus the seat. The seat is supplied by tableEarnedPaths
// itself; the ONLY stub in this script is a temporary tableSeat
// replacement returning the stated seat ({seat:'lesser'} or
// {seat:'none'}), restored after every cell. That stub isolates the
// prereq layer from the seat layer, and the seat-floor layer is then
// verified separately: seat 'none' must force relay not-earned at ANY
// stage/bond, which IS the floor working through the real
// tableEarnedPaths code path (no prereq bypass — the relay entry is
// read out of tableEarnedPaths, never by calling prereq directly).
//
// Expected (code reading, pre-registered in
// evidence/2026-10-28/sim-sysbond-a-prereg.md):
//   lesser + stage 3 + sysBond 0  -> earned, strength 40, why names sysbond 0
//   lesser + stage 2 + office + sysBond 0 -> earned, strength 25
//   lesser + stage 2 + NO office + sysBond 5 -> NOT earned
//   lesser + stage 1 + office + sysBond 5 -> NOT earned
//   none + stage 3 + sysBond 5 -> NOT earned (seat floor)
//   sysBond moves strength only: stage-3 strength 40+bond*10 capped 100;
//   stage-2+office strength 25+bond*5.
// Exit 0 on all-pass, 1 otherwise. Prints a machine-readable table.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 75101, mode: 'sysbond-a' });
  await setupGame(Game, 'Columbus, Ohio');
  const origSeat = Game.tableSeat;
  const origSay = Game.say;
  Game.say = function () {}; // silence narration; no game logic reads say's return

  function cell(seat, stage, bond, office) {
    Game.state.systemArrived = true;
    Game.state.scholar.integration = stage === 3 ? 80 : stage === 2 ? 40 : 5;
    const pg = Game.progState();
    pg.sysBond = bond;
    Game.state.switchboard = office ? { holderId: 'fixture-holder', appointedDay: 1, stage: 'village relay' } : null;
    const gotStage = Game.integrationStage();
    const gotBond = Game.sysBond();
    Game.tableSeat = function () { return { seat, detail: {} }; };
    let relay = null;
    try { relay = (Game.tableEarnedPaths() || []).find(p => p.id === 'relay') || null; }
    finally { Game.tableSeat = origSeat; }
    return { seat, stage: gotStage, bond: gotBond, office, earned: !!(relay && relay.earned), strength: relay ? relay.strength : 0, why: relay ? relay.why : '(no relay entry)' };
  }

  const rows = [];
  // Core gate cells.
  rows.push(cell('lesser', 3, 0, false));   // the seatpath-a case: stage 3, bond 0
  rows.push(cell('lesser', 3, 2, false));   // doc bar met, stage 3
  rows.push(cell('lesser', 3, 5, false));   // bond max, stage 3
  rows.push(cell('lesser', 2, 0, true));    // stage 2 + office, bond 0
  rows.push(cell('lesser', 2, 5, true));    // stage 2 + office, bond max
  rows.push(cell('lesser', 2, 5, false));   // stage 2, NO office, bond max -> must fail
  rows.push(cell('lesser', 1, 5, true));    // stage 1 + office, bond max -> must fail
  rows.push(cell('none', 3, 5, false));     // seat floor: stage 3, bond max, no seat
  rows.push(cell('none', 3, 0, false));     // seat floor, bond 0
  rows.push(cell('none', 2, 5, true));      // seat floor, stage 2 + office
  rows.push(cell('lesser', 2, 1, true));    // stage 2 + office, bond 1 (below doc bar)
  rows.push(cell('lesser', 3, 1, false));   // stage 3, bond 1 (below doc bar, above 0)

  console.log('SYSBOND-A relay-door matrix (seat, stage, bond, office -> earned/strength/why):');
  rows.forEach(r => console.log(`  ${r.seat} stage${r.stage} bond${r.bond} office=${r.office} -> earned=${r.earned} strength=${r.strength} why=${r.why}`));
  const R = (i) => rows[i];
  ok(R(0).earned === true && R(0).strength === 40, 'stage3+lesser+bond0 earns at strength 40', JSON.stringify(R(0)));
  ok(R(1).earned === true && R(1).strength === 60, 'stage3+lesser+bond2 earns at strength 60 (bond prices, not gates)', JSON.stringify(R(1)));
  ok(R(2).earned === true && R(2).strength === 90, 'stage3+lesser+bond5 earns at strength 90', JSON.stringify(R(2)));
  ok(R(3).earned === true && R(3).strength === 25, 'stage2+office+lesser+bond0 earns at strength 25', JSON.stringify(R(3)));
  ok(R(4).earned === true && R(4).strength === 50, 'stage2+office+lesser+bond5 earns at strength 50', JSON.stringify(R(4)));
  ok(R(5).earned === false, 'stage2+NO office+lesser+bond5 does NOT earn', JSON.stringify(R(5)));
  ok(R(6).earned === false, 'stage1+office+lesser+bond5 does NOT earn', JSON.stringify(R(6)));
  ok(R(7).earned === false, 'seat none+stage3+bond5 does NOT earn (seat floor)', JSON.stringify(R(7)));
  ok(R(8).earned === false, 'seat none+stage3+bond0 does NOT earn (seat floor)', JSON.stringify(R(8)));
  ok(R(9).earned === false, 'seat none+stage2+office+bond5 does NOT earn (seat floor)', JSON.stringify(R(9)));
  ok(R(10).earned === true && R(10).strength === 30, 'stage2+office+lesser+bond1 earns (below doc bar)', JSON.stringify(R(10)));
  ok(R(11).earned === true && R(11).strength === 50, 'stage3+lesser+bond1 earns (below doc bar)', JSON.stringify(R(11)));
  // Bond never flips earned at fixed stage/seat/office: bond sweep at stage 3.
  const sweep = [0, 1, 2, 3, 4, 5].map(b => cell('lesser', 3, b, false));
  ok(sweep.every(r => r.earned === true), 'bond sweep 0..5 at stage3+lesser: earned in ALL cells', JSON.stringify(sweep.map(r => r.bond + ':' + r.earned)));
  ok(JSON.stringify(sweep.map(r => r.strength)) === JSON.stringify([40, 50, 60, 70, 80, 90]), 'bond sweep strengths are exactly 40+bond*10', JSON.stringify(sweep.map(r => r.strength)));

  Game.say = origSay;
  console.log(`TEST-SYSBOND-A ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST-SYSBOND-A harness error', e); process.exit(1); });
