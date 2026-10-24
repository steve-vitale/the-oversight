// test-scalediscovery-nextact-dedup-20261023.js
// journey-deepening r39 blank fill: the duplicate "next act / BIGGER STAGE" pitch.
//
// Root cause: SCALE-DISCOVERY.md Beat 4 (game.js scalePointerW4, 2026-10-12)
// and the 2026-10-13 blitz's scaleDiscovery._sdNextAct are the SAME beat built
// twice. On a wave-3-landing one-fire village both fire within a day:
//   - scalePointerW4 (producers): "The next act needs a BIGGER STAGE...
//     Get me STANDING - blood, bonds, or bread."
//   - _sdNextAct (System): "The next act needs a BIGGER STAGE...
//     Get me a network. More fires. Bigger story. GO."
// Near-identical opener, conflicting asks, two voices. Evidence:
// hidden_files/evidence/2026-10-24/journey-deepening-r39-sdbeats-competent-{39002,39003}.txt
// (both beats d55 on 39002; d59+d60 on 39003).
//
// The fix: _sdNextAct stays silent when game.js's Beat 4 already fired
// (state._scalePtrW4) — Beat 4 owns the one-fire moment and its text names the
// current lever (standing, 2026-10-13). _sdNextAct keeps the regional case,
// where Beat 4 never fires and the network ask still climbs the ladder.
//
// Usage: node scripts/test-scalediscovery-nextact-dedup-20261023.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function captureSay(Game) {
  const lines = [];
  const _say = Game.say;
  Game.say = function (s) { lines.push(String(s)); return _say.apply(this, arguments); };
  return lines;
}

async function oneGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-nextact-dedup' });
  await setupGame(Game);
  // Earned state for the next-act moment: System up, day 40, wave 3 landed,
  // one fire (not regional), no refusal.
  Game.state.systemArrived = true;
  Game.state.scholar.day = 40;
  const _uw = Game.unlockedWave;
  Game.unlockedWave = function () { return 3; };
  const _sr = Game.scaleRank;
  Game.scaleRank = function () { return 'village'; };
  return { Game, _uw, _sr };
}

async function main() {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log(`PASS ${name}`); }
    else { fail++; console.log(`FAIL ${name}${extra ? ' -- ' + extra : ''}`); }
  };

  // Case A: Beat 4 (game.js) already fired -> _sdNextAct must stay silent.
  {
    const { Game } = await oneGame(777001);
    Game.state._scalePtrW4 = true; // scalePointerW4 ran (wave-3 unlock, one fire)
    const lines = captureSay(Game);
    Game.scaleDiscoveryDaily();
    const dupes = lines.filter(l => /BIGGER STAGE/i.test(l));
    const sd = Game.scaleDiscovery();
    ok('A1 no duplicate next-act pitch when Beat 4 fired', dupes.length === 0,
      dupes.length ? JSON.stringify(dupes[0]).slice(0, 120) : '');
    ok('A2 nextAct not marked fired', !sd.nextAct);
  }

  // Case B: Beat 4 did NOT fire (flag unset) -> _sdNextAct still fires (no kill).
  {
    const { Game } = await oneGame(777002);
    const lines = captureSay(Game);
    Game.scaleDiscoveryDaily();
    const pitches = lines.filter(l => /BIGGER STAGE/i.test(l));
    const sd = Game.scaleDiscovery();
    ok('B1 nextAct fires when Beat 4 did not', pitches.length > 0,
      `got ${pitches.length} BIGGER STAGE lines`);
    ok('B2 nextAct marked fired via system', !!(sd.nextAct && sd.nextAct.via === 'system'));
  }

  // Case C: regional village — _sdNextAct skips these by pre-existing design
  // (Beat 4 also skips them; the region/realm/nation ladder pointers carry the
  // regional case). The dedup gate must not change this partition.
  {
    const { Game } = await oneGame(777003);
    Game.scaleRank = function () { return 'regional'; };
    const lines = captureSay(Game);
    Game.scaleDiscoveryDaily();
    const pitches = lines.filter(l => /BIGGER STAGE/i.test(l));
    const sd = Game.scaleDiscovery();
    ok('C1 regional village: nextAct stays silent (pre-existing partition)', pitches.length === 0 && !sd.nextAct,
      `got ${pitches.length} BIGGER STAGE lines`);
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
