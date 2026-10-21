#!/usr/bin/env node
// test-social-r36-uprising-openturn-20261021.js -- SOCIAL leg r36 proof test.
//
// BLANK: startVillageUprising (justice.js) and startBetrayalCombat (party.js)
// end with a bare `this.tbBeginTurn()` and never drive the opening turns.
// startCombat has the explicit kick ("if a monster is faster than you it
// opens — run AI turns until it's your turn. Without this the fight
// soft-locks on 'Not your turn' forever"). When a hostile outspeeds the
// player, the uprising/betrayal fight sits on the first hostile's turn with
// no driver: in sims the day clock freezes (sleep refused mid-fight); on the
// phone the player stares at "FIGHT, FLEE, or TALK?" with no turn to take.
//
// RED: after startVillageUprising returns on a hostile-first seed,
//   Game.tbIsPlayerTurn() === false (fight stalled on hostile turn).
// GREEN (fix): the opening-turn kick runs AI turns until the player's turn,
//   Game.tbIsPlayerTurn() === true (or the fight resolved).
//
// Usage: node scripts/test-social-r36-uprising-openturn-20261021.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function hostileFirstSeed() {
  // scan seeds for one where a hostile opens the uprising (speed > player)
  for (let seed = 1; seed <= 40; seed++) {
    const { Game } = await loadGame({ seed, mode: 'uprising-openturn-scan', fullTelemetry: false });
    await setupGame(Game);
    const v = Game.state.village;
    const others = v.roster.filter(id => id !== Game.villagerId);
    v.trust = v.trust || {};
    for (const rid of others) v.trust[rid] = 3;
    try { Game.justiceState().stage = 3; } catch (e) {}
    let tb = null;
    try { tb = Game.startVillageUprising('probe'); } catch (e) { continue; }
    if (!tb || tb.over) continue;
    const first = (tb.order || [])[0];
    const firstF = tb.fighters.find(f => f.key === first);
    if (firstF && firstF.kind === 'hostile') return { seed, firstKey: first };
    try { Game.tbEnd('debug'); } catch (e) {}
  }
  return null;
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log(`ok   ${name}`); }
    else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
  };

  const found = await hostileFirstSeed();
  ok('found a hostile-first uprising seed', !!found, found ? '' : 'no seed 1..40 opens hostile-first');
  if (!found) { console.log(`\n== ${pass} passed, ${fail} failed ==`); process.exit(1); }
  console.log(`  (seed ${found.seed}, opener ${found.firstKey})`);

  const { Game } = await loadGame({ seed: found.seed, mode: 'uprising-openturn', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const others = v.roster.filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const rid of others) v.trust[rid] = 3;
  Game.justiceState().stage = 3;
  const tb = Game.startVillageUprising('probe');
  ok('uprising started', !!tb && !tb.over);
  ok('opening-turn kick: it is the player turn after start (AI turns ran)',
    Game.tbIsPlayerTurn() === true,
    `tbIsPlayerTurn()=${Game.tbIsPlayerTurn()}, turnIdx=${tb.turnIdx}, order[0]=${(tb.order || [])[0]}`);
  // the fight is live and drivable: one player wait advances a full round
  const roundBefore = tb.round;
  if (Game.tbIsPlayerTurn()) {
    try { Game.tbPlayerWait(); } catch (e) { ok('player wait does not throw', false, String(e.message).slice(0, 80)); }
    ok('a player wait advances the fight (round progressed or fight ended)',
      tb.over || tb.round > roundBefore,
      `round ${roundBefore} -> ${tb.round}, over=${tb.over}`);
  }

  // startBetrayalCombat gets the same kick
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('debug'); } catch (e) {}
  const vid = others.find(id => { try { return !Game.getPerson(id).dead; } catch (e) { return false; } });
  const btb = Game.startBetrayalCombat(vid, { aggressor: 'npc' });
  if (btb && !btb.over) {
    const bFirst = (btb.order || [])[0];
    const bFirstF = btb.fighters.find(f => f.key === bFirst);
    if (bFirstF && bFirstF.kind === 'hostile') {
      ok('betrayal opening-turn kick: player turn after start',
        Game.tbIsPlayerTurn() === true,
        `tbIsPlayerTurn()=${Game.tbIsPlayerTurn()}, order[0]=${bFirst}`);
    } else {
      console.log('  (betrayal opened player-first on this seed — kick not exercised, skipping)');
    }
  } else {
    console.log('  (betrayal did not start — skipping)');
  }

  console.log(`\n== ${pass} passed, ${fail} failed ==`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
