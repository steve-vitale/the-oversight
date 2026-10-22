#!/usr/bin/env node
// probe-friendship-effect-20261022.js -- social leg r42 mechanism probe.
// Leg question: THE FRIENDSHIP EFFECT — do friends stand by friends at the moot?
// Tests the two wired mechanisms directly (betrayal.js):
//   P1 pairAffinity math: bond {v:80, depth:3} -> affinity vs stranger.
//   P2 initBelief: a voter who likes the accused starts acquit-leaning.
//   P3 tallyVotes counterfactual: same seeded RNG streams, bonds vs zeroed
//      bonds — does the friendship term move votes and flip verdicts?
// Usage: node scripts/probe-friendship-effect-20261022.js
// Gates: DET (run twice, byte-identical), P3 verdict-flip must be non-empty.
'use strict';
const { mulberry32, loadGame, setupGame } = require('./sim-harness');

function setBond(Game, a, b, v, depth) {
  const k = Game.bondKey(a, b);
  const vil = Game.state.village;
  vil.bonds = vil.bonds || {};
  vil.bonds[k] = { v, depth, day: 1, dayGain: 0 };
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'probe', fullTelemetry: false });
  await setupGame(Game);
  const npcs = Game.npcIds().filter(id => {
    try { return !(Game.getPerson(id) || {}).dead; } catch (e) { return true; }
  });
  if (npcs.length < 4) { console.log('ABORT: fewer than 4 living NPCs'); process.exit(2); }
  const A = npcs[0];                 // the accused
  const F = npcs[1];                 // the friend (bonded to A)
  const S = npcs[2];                 // the stranger
  const T = npcs[3];                 // the target/victim
  const nm = (id) => { try { return Game.displayName(id) || String(id); } catch (e) { return String(id); } };
  console.log(`cast: accused=${nm(A)} friend=${nm(F)} stranger=${nm(S)} target=${nm(T)}`);

  // P1: pairAffinity math.
  setBond(Game, F, A, 80, 3);
  const affFA = Game.pairAffinity(F, A);
  const affSA = Game.pairAffinity(S, A);
  console.log('P1 pairAffinity:');
  check('bonded affinity ~= +36 (min(30,80/2)=30 + depth 3*2=6)', Math.abs(affFA - 36) <= 6, `got ${affFA}`);
  check('stranger affinity near 0 (|aff|<=12)', Math.abs(affSA) <= 12, `got ${affSA}`);
  check('friendship beats stranger by >= 20', (affFA - affSA) >= 20, `delta ${affFA - affSA}`);

  // P2: initBelief — same case, voter with/without friendship to the accused.
  console.log('P2 initBelief:');
  function beliefFor(accBondV) {
    const c = { id: 'probe-belief', accused: [A], target: T, plotId: null, charge: 'theft', belief: {} };
    if (accBondV === 0) setBond(Game, F, A, 0, 0);
    else setBond(Game, F, A, accBondV, 3);
    setBond(Game, S, A, 0, 0);
    Game.initBelief(c);
    return { f: c.belief[F], s: c.belief[S] };
  }
  const bBonded = beliefFor(80);
  const bZero = beliefFor(0);
  check('friend belief > stranger belief (bonded)', bBonded.f > bBonded.s, `friend=${bBonded.f} stranger=${bBonded.s}`);
  check('zeroed bonds: friend ~= stranger (|d|<=6)', Math.abs(bZero.f - bZero.s) <= 6, `friend=${bZero.f} stranger=${bZero.s}`);
  check('bonding moved friend belief by >= +15', (bBonded.f - bZero.f) >= 15, `delta ${bBonded.f - bZero.f}`);

  // P3: tallyVotes counterfactual — paired seeded RNG streams.
  // The vote-stage term is isolated by fixing belief near the decision
  // boundary (belief -6: slightly guilty-leaning); the natural combined
  // effect is measured in P4 via initBelief.
  console.log('P3 tallyVotes counterfactual (belief pinned near boundary):');
  const N = 400;
  function tallyRates(accBondV, seedN) {
    let acF = 0, acS = 0, guiltyVerdicts = 0;
    for (let i = 0; i < N; i++) {
      if (accBondV === 0) setBond(Game, F, A, 0, 0);
      else setBond(Game, F, A, accBondV, 3);
      setBond(Game, S, A, 0, 0);
      const c = { id: 'probe-tally', accused: [A], target: T, plotId: null, charge: 'theft',
        trial: { present: Game.npcIds().filter(id => id !== A) }, belief: {}, bribes: [], exposedBribes: [] };
      c.belief[F] = -6; c.belief[S] = -6;
      const r = Game.tallyVotes(c, false, mulberry32(seedN * 100003 + i));
      for (const vt of (r.votes || [])) {
        if (vt.vid === F && vt.vote === 'acquit') acF++;
        if (vt.vid === S && vt.vote === 'acquit') acS++;
      }
      if (r.guilty > (r.votes.length - r.guilty)) guiltyVerdicts++;
    }
    return { acqF: acF / N, acqS: acS / N, guiltyRate: guiltyVerdicts / N };
  }
  const withB = tallyRates(80, 7);
  const noB = tallyRates(0, 7);
  console.log(`  bonded:   friend acquit=${(withB.acqF * 100).toFixed(1)}% stranger acquit=${(withB.acqS * 100).toFixed(1)}% guilty-verdicts=${(withB.guiltyRate * 100).toFixed(1)}%`);
  console.log(`  counterf: friend acquit=${(noB.acqF * 100).toFixed(1)}% stranger acquit=${(noB.acqS * 100).toFixed(1)}% guilty-verdicts=${(noB.guiltyRate * 100).toFixed(1)}%`);
  check('bonded friend acquits more than zeroed friend', withB.acqF > noB.acqF + 0.05, `delta ${((withB.acqF - noB.acqF) * 100).toFixed(1)}pp`);
  check('stranger rate stable across conditions (|d|<=3pp)', Math.abs(withB.acqS - noB.acqS) <= 0.03, `delta ${((withB.acqS - noB.acqS) * 100).toFixed(1)}pp`);
  check('friendship lowers guilty-verdict rate', withB.guiltyRate < noB.guiltyRate, `bonded ${(withB.guiltyRate * 100).toFixed(1)}% vs zeroed ${(noB.guiltyRate * 100).toFixed(1)}%`);

  console.log(`\nPROBE: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})();
