// sense-vanishcause-a.js — ONE-SEED transcript read for arm
// sim-vanishcause-a (finding #2635). Re-runs seed 107224 with the
// SAME env as the judged pilot (GUNRATE+CELLGATE substrate, competent
// policy) and FULL telemetry, then prints the narration around the
// gun's life-chain days: grant d110, seating d111, succession d126,
// corpse-take d143. The driver wraps consume no RNG, so the
// trajectory reproduces the pilot leg1 corpus exactly.
// SENSE-TESTING LAW: read the words, judge whether the villagers act
// like people — the succession + corpse-take chain must read as a
// human story, not a bookkeeping artifact.
// Usage: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
//   SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 \
//   node scripts/sense-vanishcause-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

(async function () {
  const { Game } = await loadGame({ seed: 107224, mode: 'sense-vanishcause-a', fullTelemetry: true });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: 150, sampleEvery: 1 }); });
  const tel = (Game.state && Game.state.telemetry) || [];
  console.log('days=' + result.days + ' end=' + result.endReason + ' telemetry=' + tel.length);
  const want = function (e) {
    const d = (e && (e.day || (e.data && e.data.day))) || 0;
    return (d >= 124 && d <= 128) || (d >= 141 && d <= 144) || (d >= 109 && d <= 112);
  };
  const txt = function (e) {
    try { return JSON.stringify(e).slice(0, 400); } catch (err) { return String(e).slice(0, 400); }
  };
  let shown = 0;
  for (const e of tel) {
    if (!want(e)) continue;
    const s = txt(e);
    if (/searcaster|succession|scholar|corpse|gen_q9x1lf3|gen_rc0dd1q/i.test(s)) { console.log(s); shown++; }
  }
  console.log('shown=' + shown);
  process.exit(0);
})().catch(function (e) { console.error(e.stack || e.message); process.exit(1); });
