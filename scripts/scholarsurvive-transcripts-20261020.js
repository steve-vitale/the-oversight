#!/usr/bin/env node
// scholarsurvive-transcripts-20261020.js — sense-testing probe for arm
// sim-scholarsurvive. Re-runs an ARMED sweep seed (deterministic) with
// Game.say wrapped and captures SAY lines in the window around the run's
// wave-4 scholar kills, for a human read of whether the withdrawal reads
// as a sensible person surviving (SENSE-TESTING LAW).
// READ-ONLY (the re-run draws no new game state; it replays the seed).
// Writes evidence/2026-10-20/scholarsurvive-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 SCHOLARSURVIVE=1 \
//   POLICY=leadfeast SEED=64001 node scripts/scholarsurvive-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019');
const SS = require('./policies/scholarsurvive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.SCHOLARSURVIVE !== '1') { console.error('STOP: SCHOLARSURVIVE=1 required (armed re-run).'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64001', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-scholarsurvive', 'armed', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));

// Capture window: wave-4 kill days ±5d (the kill, the withdrawal, the rest).
const killDays = [];
for (const r of (seedRec.recs || [])) {
  for (const k of (r.newKills || [])) {
    if ((k.w | 0) === 4 && k.ch === 'player') killDays.push(r.d);
  }
}
if (!killDays.length) { console.error('STOP: no armed wave-4 player kills in this seed run — pick a seed with one.'); process.exit(2); }
const keep = new Set();
for (const kd of killDays) for (let d = kd - 5; d <= kd + 10; d++) if (d >= 1) keep.add(d);
const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'scholarsurvive-transcripts');
fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  const policy = SS.withScholarsurvive(SW.policyFor(POLICY), `${POLICY}-ss`, 'armed re-run');
  const { Game } = await loadGame({ seed: SEED, mode: 'scholarsurvive-xscript', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (keep.has(day)) lines.push(`[d${day}] SAY: ${String(x).slice(0, 700)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  // The harness stubs G.sysSay to a no-op (sim-harness.js). Restore the
  // engine's format (game.js sysSay) so the transcript hears the System,
  // routed through the capture above. Probe-only.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  let runCtx = null;
  const p2 = Object.assign({}, policy);
  const oSetup = policy.setup;
  p2.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  await quietLog(async () => { await runDays(Game, p2, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const out = path.join(OUTDIR, `${POLICY}-s${SEED}.txt`);
  fs.writeFileSync(out, `seed ${SEED} policy ${POLICY} (armed); wave-4 kill days ${killDays.join(',')}; window ±5/+10d\n` +
    `layer counters: ${JSON.stringify(runCtx ? Object.fromEntries(Object.entries(runCtx).filter(([k]) => /^ss/.test(k))) : {})}\n\n` +
    lines.join('\n') + '\n');
  console.log(`wrote ${out} (${lines.length} lines)`);
})().catch(e => { console.error(e.stack); process.exit(1); });
