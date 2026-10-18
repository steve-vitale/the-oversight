#!/usr/bin/env node
// test-party-turnpointer-20261018.js — RED/GREEN for the party.js
// startCombat wrapper turn-pointer strand (dayfreeze root cause, arm a).
//
// Bug: party.js wraps Game.startCombat. After the real startCombat returns
// (its opening tbAdvance has correctly left the fight at the PLAYER's turn),
// the wrapper pushes party members beyond the 4-square radius into
// f.fighters and REBUILDS f.order by speed — without adjusting f.turnIdx.
// The turn pointer then addresses a non-player fighter in the new order:
// the "OPENING TURNS" contract is violated, the day clock strands
// ("Not in the middle of a fight" refusals; driveFights only drives player
// turns).
//
// RED (pre-fix): startCombat with 2 party members beyond 4 squares leaves
//   tbIsPlayerTurn() === false.
// GREEN (post-fix): tbIsPlayerTurn() === true (turn pointer preserved).
//
// Deterministic: seed 7, no policy, no sim loop. Exits 0 on GREEN, 1 on RED.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  await quietLog(async () => {
    // Pick 2 roster villagers as party members.
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    if (roster.length < 2) { console.error('RED SETUP FAIL: roster too small'); process.exit(2); }
    const pids = roster.slice(0, 2);
    Game.state.village.party = pids.slice();

    // Player far from villagers: 4-square join skips them, party.js wrapper adds them.
    Game.state.scholar.mx = 8; Game.state.scholar.my = 8;
    Game.state.village.positions = Game.state.village.positions || {};
    for (const pid of pids) Game.state.village.positions[pid] = { mx: 0, my: 0 };

    // Sanity: partyMembers sees them.
    const pm = Game.partyMembers();
    if (pm.length < 2) { console.error('RED SETUP FAIL: partyMembers=' + pm.length); process.exit(2); }

    Game.startCombat('bulldozer');
    const f = Game.tbfight;
    if (!f || f.over) { console.error('RED SETUP FAIL: no live fight'); process.exit(2); }
    const cur = Game.tbCurrent();
    const isPlayer = Game.tbIsPlayerTurn();
    console.error(`fighters=${f.fighters.length} turnIdx=${f.turnIdx} orderKey=${f.order[f.turnIdx]} cur=${cur ? cur.kind : 'null'} isPlayerTurn=${isPlayer}`);
    console.error(`order=[${f.order.join(',')}]`);
    if (isPlayer) {
      console.error('GREEN: turn pointer preserved at player turn after party join');
      process.exit(0);
    } else {
      console.error('RED: turn pointer stranded at non-player turn after party join');
      process.exit(1);
    }
  });
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
