// sense-corpsecap-a.js — ONE-SEED transcript read for arm
// sim-corpsecap-a (corpse-cap gun sink).
// Re-runs seed 107275 with the SAME env as the judged diag pilot
// (GUNRATE+CELLGATE substrate, competent policy) and FULL telemetry,
// then prints the narration around days 110-120: giulia_bianchi wins
// the gun day 93, dies "alien" day 113, and the scholar takes the
// searcaster from her corpse the same day — the band's only
// corpse-gun recovery. A second gun sits on gen_mw19eak's corpse
// days 116-120, never taken.
// The driver wraps consume no RNG, so the trajectory reproduces the
// pilot diag corpus exactly.
// SENSE-TESTING LAW: read the words — does taking a dead friend's gun
// read as a human moment (grief, recognition, the village noticing),
// or as bookkeeping?
// Usage: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
//   SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 \
//   node scripts/sense-corpsecap-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

(async function () {
  const { Game } = await loadGame({ seed: 107275, mode: 'sense-corpsecap-a', fullTelemetry: true });
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: 150, sampleEvery: 1 }); });
  const tel = (Game.state && Game.state.telemetry) || [];
  console.log('days=' + result.days + ' end=' + result.endReason + ' telemetry=' + tel.length);
  const want = function (e) {
    const d = (e && (e.day || (e.data && e.data.day))) || 0;
    return d >= 110 && d <= 120;
  };
  const txt = function (e) {
    try { return JSON.stringify(e).slice(0, 600); } catch (err) { return String(e).slice(0, 600); }
  };
  let shown = 0;
  for (const e of tel) {
    if (!want(e)) continue;
    const s = txt(e);
    if (/giulia|corpse|searcaster|fusion|loot|alien|mw19eak|death|grief|funeral|buried/i.test(s)) { console.log(s); shown++; }
  }
  console.log('shown=' + shown);
  process.exit(0);
})().catch(function (e) { console.error(e.stack || e.message); process.exit(1); });
