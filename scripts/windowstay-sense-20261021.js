#!/usr/bin/env node
// windowstay-sense-20261021.js — SENSE-TESTING for sim-windowstay-r2:
// re-runs an unlocking seed with LIVE narration (loadGame {narration:true} —
// the harness's sanctioned path; the silenced sweep capture sees no voiced
// lines) WITH the post-win continuation hook, and prints the System's and
// villagers' voiced lines across the unlock + post-unlock window for
// judgment: does the village's reaction to the unlock read like people
// (fear, resolve, confusion)? Do wave-5 Producers announce themselves?
//
// SEPARATE diagnostic run, not part of the corpus — no DET claim attaches.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   SEED=64858 POLICY=belongfeast DAYS=180 node scripts/windowstay-sense-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const VCE = require('./policies/vgearconfirm');

const SEED = parseInt(process.env.SEED || '64858', 10);
const POLICY = (process.env.POLICY || 'belongfeast').toLowerCase();
const DAYS = parseInt(process.env.DAYS || '180', 10);
// The voiced lines that matter in the window: unlock/release beats,
// Producer announcements and fights, the table/win sequence, villager
// reactions (fear/resolve/confusion), deaths and funerals.
const LINE_RE = /fifth draft|producers|talent has been released|not bought with bread alone|cancellation|editor|rerun|spoiler|timeslot|nielsen|finale|network note|narrative|threatening|galactic table|table waiting|the table|you win|won |victory|died|funeral|has fallen|mourns|afraid|fear|scared|we can|we will|hold the|stand together|not ready|ready/i;

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

(async () => {
  const base = VCE.armedFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'windowstay-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const s = String(x);
      if (LINE_RE.test(s)) {
        const day = gday(Game);
        if (day >= 70) lines.push(`[d${day}] ${s.slice(0, 600)}`);
      }
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  const policy = Object.assign({}, base);
  await quietLog(async () => { await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // POST-WIN CONTINUATION (same documented hook as the sweep): the win
  // truncates the narration at ~d90; keep listening to 180d.
  let winDay = null;
  if (Game.over && Game.won) {
    winDay = gday(Game);
    Game.over = false; // POSTWIN hook under test (sense run)
    await quietLog(async () => { await runDays(Game, policy, { days: Math.max(0, DAYS - winDay), manifest: undefined, sampleEvery: 30 }); });
  }
  console.log(`sense ${POLICY}/s${SEED}: ${lines.length} voiced lines d70+ (winDay=${winDay}):`);
  for (const l of lines) console.log(l + '\n');
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
