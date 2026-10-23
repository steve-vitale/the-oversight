#!/usr/bin/env node
// capture-vetbench-transcript-20261022.js — sense-testing capture for
// sim-vetbench (SENSE-TESTING LAW: judge meaning/coherence, not counts).
// Runs ONE armed 180d run and captures the benching/muster/raid-door
// say-lines to a transcript file for human reading.
//
// Usage: <pinned env incl VETBENCH=1> node scripts/capture-vetbench-transcript-20261022.js <seed> <leadfeast|belongfeast>
// Writes: evidence/2026-10-22/vetbench-transcript-s<seed>-<base>.txt
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const VB = require('./policies/vetbench');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const KD = require('./killdisc-instrument-20261021');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'VETBENCH']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const seed = parseInt(process.argv[2], 10);
const base = process.argv[3] === 'belongfeast' ? 'belongfeast' : 'leadfeast';
if (!Number.isFinite(seed)) { console.error('usage: <seed> <leadfeast|belongfeast>'); process.exit(2); }

(async () => {
  const { Game } = await loadGame({ seed, mode: 'vetbench-transcript', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  const lines = [];
  const oSay = Game.say.bind(Game);
  Game.say = function (s) {
    try {
      const str = String(s || '');
      if (/bench|stand down|stands down|MUSTER|Nobody met|chafes|veteran/i.test(str)) {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        lines.push(`[day ${day}] ${str.replace(/\s+/g, ' ').slice(0, 400)}`);
      }
    } catch (e) {}
    return oSay(s);
  };
  await setupGame(Game);
  const policy = VB.armedFor(base);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const fp = path.join(REPO, 'evidence', '2026-10-22', `vetbench-transcript-s${seed}-${base}.txt`);
  const head = [
    `# vetbench transcript — seed ${seed} base ${base} (armed, VETBENCH=1)`,
    `# days=${result.days} maxWave=${result.maxWaveUnlocked} endReason=${result.endReason}`,
    `# benching/muster/raid-door say-lines only (sense-test sample)`,
    '',
  ].join('\n');
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines)`);
})().catch(e => { console.error('CRASH:', e && e.stack || e); process.exit(1); });
