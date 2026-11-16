// trickteach-firstlearn-probe.js — DIAGNOSTIC ONLY (post-hoc, not judged).
// The D3 drift check flags 7/8 seeds: trajectories diverge BEFORE the
// first wave-4/5 trick-learned day visible in the killfailFights rows.
// But the lever fires on ALL trick-bearing species (waves 1-2 from day
// 1) and via the scholar channel, neither of which the fight rows see.
// This probe finds the TRUE first learn day (any wave, any channel) per
// seed on the ARMED leg, by wrapping _trickObservation and recording
// (day, mid, obs, learned). If the first learn is on/before the
// divergence day, the D3 flag is a definition artifact, not substrate
// drift — the legs differ ONLY by TRICKTEACH, and D1 proves the armed
// tip deterministic, so every divergence traces to the lever.
// Usage: TRICKTEACH=1 node scripts/trickteach-firstlearn-probe.js <seed> <days>
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const seed = parseInt(process.argv[2], 10);
const days = parseInt(process.argv[3], 10) || 60;

(async function () {
  const { Game } = await loadGame({ seed: seed, mode: 'trickteach-firstlearn', fullTelemetry: false });
  const learns = [];
  const orig = Game._trickObservation.bind(Game);
  Game._trickObservation = function (vid, mid, firstPerson) {
    const before = Game.villageKnowsTrick ? !!Game.villageKnowsTrick(mid) : false;
    const obsBefore = ((Game.state || {}).villageCounterObs || {})[mid] || 0;
    const ret = orig(vid, mid, firstPerson);
    const after = Game.villageKnowsTrick ? !!Game.villageKnowsTrick(mid) : false;
    const obsAfter = ((Game.state || {}).villageCounterObs || {})[mid] || 0;
    if (!before && after) {
      learns.push({ day: ((Game.state || {}).scholar || {}).day || 0, mid: mid, obs: obsAfter, via: firstPerson ? 'scholar' : 'villager' });
    }
    return ret;
  };
  // The witness channel shares the bar but not the function: wrap it too.
  if (typeof Game.noteNodeWitnessKill === 'function') {
    const origW = Game.noteNodeWitnessKill.bind(Game);
    Game.noteNodeWitnessKill = function (vid, mid, witnesses) {
      const before = Game.villageKnowsTrick ? !!Game.villageKnowsTrick(mid) : false;
      const ret = origW(vid, mid, witnesses);
      const after = Game.villageKnowsTrick ? !!Game.villageKnowsTrick(mid) : false;
      if (!before && after) {
        learns.push({ day: ((Game.state || {}).scholar || {}).day || 0, mid: mid, obs: ((Game.state || {}).villageCounterObs || {})[mid] || 0, via: 'witness' });
      }
      return ret;
    };
  }
  await setupGame(Game);
  await quietLog(async function () { await runDays(Game, competent, { days: days, manifest: undefined, sampleEvery: 1 }); });
  learns.sort(function (a, b) { return (a.day - b.day) || 0; });
  console.log(JSON.stringify({ seed: seed, days: days, trickTeach: process.env.TRICKTEACH === '1', firstLearn: learns[0] || null, learns: learns.slice(0, 12) }));
})().catch(function (e) { console.error(e.stack); process.exit(1); });
