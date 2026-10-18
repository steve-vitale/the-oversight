#!/usr/bin/env node
// test-readconfirm-sense.js — SENSE-TESTING instrument for sim-readconfirm.
//
// One armed (new-bar) run with narration:true, capturing every say/sysSay
// line live (Game.log is a 40-entry ring — insufficient). The capture wrapper
// only appends {day, voice, text} and calls through; say/sysSay/emit consume
// no RNG, so the transcript capture cannot perturb the sim.
//
// Writes the raw transcript to OUT (default ~/workspace/readconfirm-sense-<seed>.txt,
// NOT the repo) and prints the wave-4 beat window to stdout for judging.
// The judgment goes in the evidence file (SENSE-TESTING LAW: read the lines,
// judge meaning/coherence/relevance — never just counts).
//
// Usage: SEED=52103 POLICY=leadfeast node scripts/test-readconfirm-sense.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

const SEED = parseInt(process.env.SEED || '52103', 10);
const POLICY_ID = process.env.POLICY || 'leadfeast';
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const OUT = process.env.OUT || path.join(process.env.HOME || '/tmp', `readconfirm-sense-${SEED}.txt`);

function policyFor(id) { return id === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'readconfirm-sense', fullTelemetry: false, narration: true });

  // Live transcript capture (read-only append + call-through).
  const lines = [];
  const dayOf = () => (((Game.state || {}).scholar) || {}).day || 0;
  for (const name of ['say', 'sysSay']) {
    const orig = Game[name].bind(Game);
    Game[name] = function (msg) {
      try { lines.push({ day: dayOf(), voice: name, text: String(msg == null ? '' : msg) }); } catch (e) {}
      return orig(msg);
    };
  }

  // Census for the wave-4 unlock day.
  let unlockDay4 = null;
  const origSleep = Game.sleep;
  Game.sleep = function () {
    try {
      const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
      if (unlockDay4 === null && uw >= 4) unlockDay4 = dayOf();
    } catch (e) {}
    return origSleep.apply(this, arguments);
  };

  await setupGame(Game, 'Columbus, Ohio');
  const policy = policyFor(POLICY_ID);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.sleep = origSleep;

  fs.writeFileSync(OUT, lines.map(l => `[d${l.day}] ${l.voice}: ${l.text}`).join('\n') + '\n');
  console.log(`seed=${SEED} policy=${POLICY_ID} maxWave=${result.maxWaveUnlocked} unlockDay4=${unlockDay4} days=${result.days} end=${result.endReason} lines=${lines.length} -> ${OUT}`);

  // Print the wave-4 beat window for judging: 10 days before unlock through
  // 5 days after, filtered to System voice + readiness/hold/unlock lines.
  const beatRx = /SYSTEM|ready|armor|weapon|trick|veteran|blood|Mirror|draft|horde|scout/i;
  const lo = (unlockDay4 == null ? 200 : unlockDay4) - 12, hi = (unlockDay4 == null ? 200 : unlockDay4) + 5;
  const window = lines.filter(l => l.day >= lo && l.day <= hi && beatRx.test(l.text));
  console.log(`--- wave-4 beat window (d${lo}..d${hi}, ${window.length} lines) ---`);
  for (const l of window.slice(0, 60)) console.log(`[d${l.day}] ${l.voice}: ${l.text.slice(0, 300)}`);
  if (window.length > 60) console.log(`... (${window.length - 60} more)`);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
