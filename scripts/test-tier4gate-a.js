// test-tier4gate-a.js — proof test for arm sim-tier4gate-a
// (tier-4 GATE widening: earlier apex, finding #2648).
// Proves BEFORE any judged sim, via the live harness (seed 7):
//   (1) the lever is OFF unless TIER4GATE=1: a wave-3 extreme contest
//       never reaches tier 4 (the apex wave bar stays 4);
//   (2) ON + wave 3 + extreme + lottery won -> tier 4 (the widening
//       opens exactly the wave-3 extreme rolls);
//   (3) ON + wave 3 + extreme + lottery lost -> tier <= 3 (the 25%
//       lottery still gates the newly-eligible rolls);
//   (4) ON + wave 2 + extreme + lottery won -> tier <= 3 (the bar
//       moves to 3, not below);
//   (5) ON + wave 3 + non-extreme + lottery won -> tier <= 3 (the
//       extreme gate is untouched);
//   (6) wave-4/5 extreme behavior is unchanged by the lever (on and
//       off both reach tier 4 on a won lottery);
//   (7) the lever writes nothing to Game.state (no save pollution);
//   (8) the analyzer's --selftest passes.
// The test stubs Game.unlockedWave (the wave is the lever's input)
// and wraps Game.rollAlienLoot to capture the tier _cxItemPrize passes
// in (the stub returns null, so no grant side effects run). The apex
// lottery is forced by overriding Math.random around each call
// (0.0 = always won, 0.99 = always lost), restored immediately after.
// Run: node scripts/test-tier4gate-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-tier4gate-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log('FAIL: ' + name); }
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-tier4gate-a', fullTelemetry: false });
  await setupGame(Game);
  const methods = ['_cxItemPrize', 'rollAlienLoot', 'unlockedWave', 'broadcastRewardTier'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');

  // Capture the tier _cxItemPrize passes to rollAlienLoot; return null
  // (shy vault) so no grant / redirect / bundle side effects run.
  let capturedTier = null;
  let capturedCalls = 0;
  const origRoll = Game.rollAlienLoot.bind(Game);
  Game.rollAlienLoot = function (mdef, fighter) {
    capturedTier = (mdef && mdef.loot && mdef.loot.tier != null) ? mdef.loot.tier : null;
    capturedCalls++;
    return null;
  };
  const origWave = Game.unlockedWave.bind(Game);
  const savedRandom = Math.random;
  function prizeAt(wave, risk, lotteryRandom) {
    Game.unlockedWave = function () { return wave; };
    capturedTier = null;
    Math.random = function () { return lotteryRandom; };
    try {
      Game._cxItemPrize({}, { risk: risk, id: 'gauntlet' }, 'player');
    } finally {
      Math.random = savedRandom;
      Game.unlockedWave = origWave;
    }
    return capturedTier;
  }

  try {
    // (1) Off: wave-3 extreme never reaches tier 4, even on a won lottery.
    delete process.env.TIER4GATE;
    let t = prizeAt(3, 'extreme', 0.0);
    check('off: wave-3 extreme + won lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);
    check('off: the prize roll reached rollAlienLoot', capturedCalls > 0);

    // (2) On: wave-3 extreme + won lottery -> tier 4.
    process.env.TIER4GATE = '1';
    t = prizeAt(3, 'extreme', 0.0);
    check('on: wave-3 extreme + won lottery -> tier 4 (got ' + t + ')', t === 4);

    // (3) On: wave-3 extreme + lost lottery -> tier <= 3.
    t = prizeAt(3, 'extreme', 0.99);
    check('on: wave-3 extreme + lost lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);

    // (4) On: wave-2 extreme + won lottery -> tier <= 3.
    t = prizeAt(2, 'extreme', 0.0);
    check('on: wave-2 extreme + won lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);

    // (5) On: wave-3 non-extreme + won lottery -> tier <= 3.
    t = prizeAt(3, 'high', 0.0);
    check('on: wave-3 high + won lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);
    t = prizeAt(3, 'medium', 0.0);
    check('on: wave-3 medium + won lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);

    // (6) Wave-4/5 extreme unchanged by the lever, on and off.
    t = prizeAt(4, 'extreme', 0.0);
    check('on: wave-4 extreme + won lottery -> tier 4 (got ' + t + ')', t === 4);
    t = prizeAt(5, 'extreme', 0.0);
    check('on: wave-5 extreme + won lottery -> tier 4 (got ' + t + ')', t === 4);
    t = prizeAt(4, 'extreme', 0.99);
    check('on: wave-4 extreme + lost lottery -> tier <= 3 (got ' + t + ')', t != null && t <= 3);
    delete process.env.TIER4GATE;
    t = prizeAt(4, 'extreme', 0.0);
    check('off: wave-4 extreme + won lottery -> tier 4 (got ' + t + ')', t === 4);

    // (7) No state pollution.
    let stateJson = '';
    try { stateJson = JSON.stringify(Game.state || {}); } catch (e) { stateJson = 'STRINGIFY-FAILED'; }
    check('transient: TIER4GATE/apexWave never serialize into Game.state',
      stateJson.indexOf('TIER4GATE') === -1 && stateJson.indexOf('apexWave') === -1);
  } finally {
    Game.rollAlienLoot = origRoll;
    Game.unlockedWave = origWave;
    Math.random = savedRandom;
    delete process.env.TIER4GATE;
  }
}

(async function () {
  try {
    await liveTests();
    let stOk = false;
    try { stOk = analyzer.selftest(); } catch (e) { console.log('analyzer selftest threw: ' + e.message); }
    check('analyzer --selftest passes', stOk === true);
    let diagOk = false;
    try { diagOk = require(path.join(REPO, 'scripts', 'analyze-tier4gate-diag-a')).selftest(); } catch (e) { console.log('diag selftest threw: ' + e.message); }
    check('diag analyzer --selftest passes', diagOk === true);
  } catch (e) {
    fail++;
    failures.push('top-level throw: ' + e.message);
    console.log('TOP-LEVEL THROW: ' + (e.stack || e.message));
  }
  console.log('test-tier4gate-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail === 0 ? 0 : 1);
})();
