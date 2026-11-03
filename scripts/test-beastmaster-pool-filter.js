#!/usr/bin/env node
// test-beastmaster-pool-filter.js — proof for the beastmaster pool filter
// (Steve 2026-11-02: exclude flee-capable beasts from the beastmaster
// contest pool; the dominance rule itself is untouched).
//
// Modes:
//   pick  [seed]          — print the beast the BEASTMASTER path picks:
//                          contestBeastFor(1, 700, { excludeFlee: true }).
//                          On pre-filter code the extra arg is ignored, so
//                          the same script reports the pre-filter pick
//                          there — the before/after comparison is apples to
//                          apples. (A plain contestBeastFor(1, 700) call is
//                          NOT the beastmaster pick post-filter; the other
//                          callers deliberately stay unfiltered.)
//   panel [seed] [count]  — resolve the beastmaster contest (engine path,
//                          contestResolveVillager) for the first `count`
//                          roster villagers (excluding the bearer) and
//                          print one JSON object per contest.
// One process per seed: the harness evals the game once per process, so
// a seed band is driven by looping this script (see the evidence note).
// Same seed + same code = same roster = same fights; before/after differ
// only by the picked beast.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const mode = process.argv[2] || 'pick';
const SEED = parseInt(process.env.SEED || process.argv[3] || '70001', 10);
const COUNT = parseInt(process.argv[4] || '6', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED });
  await quietLog(async () => { await setupGame(Game); });
  Game.state.systemArrived = true;
  Game.state.scholar.day = 20;
  const wave = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null;
  const pool = (typeof Game.monsterWavePool === 'function') ? Game.monsterWavePool() : [];
  // The beastmaster path's pick (see note above): filtered post-fix,
  // unfiltered pre-fix (extra arg ignored). Same call the contest makes.
  const pick = Game.contestBeastFor(1, 700, { excludeFlee: true });
  const threat = pick ? Game._cxBeastThreat(pick) : null;
  if (mode === 'pick') {
    console.log(JSON.stringify({
      seed: SEED, unlockedWave: wave, poolSize: pool.length,
      poolFleeCount: pool.filter(m => m.flee).length,
      pick: pick ? pick.id : null, pickFlee: !!(pick && pick.flee),
      pickThreat: threat, pickWave: pick ? (pick.wave || 1) : null,
    }));
    return;
  }
  if (mode !== 'panel') { console.error('unknown mode: ' + mode); process.exit(2); }
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const contestants = roster.slice(0, COUNT);
  for (const pid of contestants) {
    let r;
    try { r = Game.contestResolveVillager(pid, { id: 'beastmaster', cat: 'weird', risk: 'high' }, {}); }
    catch (e) { r = { outcome: 'error', detail: String(e && e.message || e), log: [] }; }
    // Bucket in plain words: kill / dominated (bolting counted as won) /
    // died / walked-away (contestant fled) / other loss.
    let bucket = 'other-lost';
    if (r.outcome === 'won' && r.detail === 'slew') bucket = 'kill';
    else if (r.outcome === 'won' && r.detail === 'dominated') bucket = 'dominated';
    else if (r.outcome === 'died') bucket = 'died';
    else if (r.outcome === 'lost' && r.detail === 'vFlee') bucket = 'walked-away';
    console.log(JSON.stringify({
      seed: SEED, pid, beast: pick ? pick.id : null, beastFlee: !!(pick && pick.flee),
      outcome: r.outcome, detail: r.detail, bucket,
    }));
  }
})().catch(e => { console.error('PROOF-FAILED: ' + (e && e.stack || e)); process.exit(1); });
