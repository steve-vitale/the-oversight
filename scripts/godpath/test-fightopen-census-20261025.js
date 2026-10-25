#!/usr/bin/env node
'use strict';
// Proof for sim-findings #40 (fight-census undercount), via the
// fightopen-census instrument: a fight that "comes apart" in startCombat's
// opening pass MUST appear in the census even though a startCombat wrapper
// that opens its record only after a live fight returns (the dmg-audit
// pattern) records nothing for it.
//
// Fight A (comes apart): follows:false heckler (speed 5, direct pattern,
// reach 3) placed 6 tiles from the player. The monster is faster, so the
// opening tbAdvance runs; out of reach and unable to chase, tbEndCheck's
// DISENGAGE rule routes it: "It comes apart — no one in reach, no one
// chasing" -> tbEnd('routed').
// Fight B (control): same species adjacent to the player -> a live fight
// both the census and the wrapper record.
const K = require('./lib'), T = K.reporter('fightopen census');
const { loadGame, setupGame } = require('../sim-harness');
const { fight, captureSays } = K;
const { attachFightCensus } = require('../fightopen-census-20261025');

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'fightopen-census' });
  await setupGame(Game);
  const census = attachFightCensus(Game);
  T.ok('tbfight property interception attached', census.attached === true);
  T.ok('tbEnd wrapper attached', census.tbEndWrapped === true);

  // dmg-audit-style wrapper: open a record only if startCombat returns a
  // live fight (the pattern whose undercount #40 names).
  let wrapperRecords = 0;
  const origStartCombat = Game.startCombat;
  Game.startCombat = function (...args) {
    const ret = origStartCombat.apply(this, args);
    try { if (Game.tbfight && !Game.tbfight.over) wrapperRecords++; } catch (e) {}
    return ret;
  };

  const says = captureSays(Game);

  // --- Fight A: comes apart ---
  fight(Game, 'heckler', { px: 1, py: 4, mx: 7, my: 4 });
  const a = census.assignments[0] || {};
  T.ok('comes-apart fight assignment observed', census.assignments.length === 1);
  T.ok('comes-apart fight species recorded', a.mid === 'heckler');
  T.ok('comes-apart fight follows:false recorded', a.follows === false);
  T.ok('comes-apart fight closed as routed', census.outcomes.length === 1 && census.outcomes[0].result === 'routed');
  T.ok('comes-apart fight ended at round 1 (opening pass)', census.outcomes[0] && census.outcomes[0].round === 1);
  T.ok('comes-apart line spoken', says.some(l => /comes apart/.test(l)));
  T.ok('startCombat wrapper recorded nothing for the comes-apart fight', wrapperRecords === 0);
  T.ok('census routed-before-record count is 1', census.routedBeforeRecord().length === 1);

  // --- Fight B: live control fight ---
  fight(Game, 'heckler', { px: 1, py: 4, mx: 2, my: 4 });
  T.ok('control fight assignment observed', census.assignments.length === 2);
  T.ok('startCombat wrapper recorded the live control fight', wrapperRecords === 1);
  try { Game.tbEnd('fled'); } catch (e) {}
  T.ok('control fight closed as fled', census.outcomes.length === 2 && census.outcomes[1].result === 'fled');
  T.ok('census and wrapper agree on live fights (2 assignments, 1 wrapper record for the live one only)', census.assignments.length === 2 && wrapperRecords === 1);

  says.restore();
  Game.startCombat = origStartCombat;
  census.restore();
  T.ok('restore leaves tbfight readable', (() => { try { Game.tbfight = null; return Game.tbfight === null; } catch (e) { return false; } })());
  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
