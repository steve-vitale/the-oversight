#!/usr/bin/env node
// sense-armorydrive-20261022.js — SENSE-TESTING LAW probe for sim-armorydrive.
// Re-runs the wave-5-unlocking config (s65464 leadfeast, ARMORYDRIVE=1)
// deterministically (E4b-pinned) with Game.say wrapped, and dumps narration
// windows around the d105 wave-4 kills (Elena + Sigrun vs the Strike).
// READ-ONLY: no state writes, no corpus writes (stdout only).
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 node scripts/sense-armorydrive-20261022.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

(async () => {
  const { Game } = await loadGame({ seed: 65464, mode: 'armorydrive-sense', fullTelemetry: false });
  await setupGame(Game);
  const policy = AD.armedFor('leadfeast');
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${day}] ${String(x).replace(/\s+/g, ' ').slice(0, 600)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`captured ${lines.length} narration lines`);
  // Windows: the d105 kills, plus the staging run-up (d95-104) for context.
  for (const [lo, hi, label] of [[103, 107, 'THE KILLS (d105: Elena + Sigrun vs the Strike)'], [95, 102, 'RUN-UP (staging/invites/donations)']]) {
    console.log(`\n===== ${label} =====`);
    const win = lines.filter(l => {
      const m = l.match(/^\[d(\d+)\]/);
      if (!m) return false;
      const d = parseInt(m[1], 10);
      return d >= lo && d <= hi;
    });
    // Trim to fight/staging-relevant lines to keep the read human-scale.
    const rel = win.filter(l => /strike|elena|sigrun|party|invite|armory|donat|weapon|fight|kill|slain|veteran|wave|mirror|stand|ready/i.test(l));
    console.log(`(${rel.length} relevant of ${win.length} lines in window)`);
    for (const l of rel.slice(0, 120)) console.log(l);
    if (rel.length > 120) console.log(`... (${rel.length - 120} more)`);
  }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
