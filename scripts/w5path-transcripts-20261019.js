#!/usr/bin/env node
// w5path-transcripts-20261019.js — sense-testing probe for sim-w5census.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in the window around the run's stall point, for a human read
// of whether the wave-5 path reads as legible, reachable-but-hard, or
// broken-fiction (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-19/w5path-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   POLICY=leadfeast SEED=63701 node scripts/w5path-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attribute } = require('./analyze-w5path-20261019');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '63701', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-w5path', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = attribute(seedRec);

// Capture window: for engaged-but-failed, the longest attempt window ±3d;
// for unlocked, 3d before the unlock through run end; otherwise the last
// 15 days (the stall as lived).
let anchor, endD;
if (attr.stallClass === 'unlocked' && attr.wave5Day != null) { anchor = attr.wave5Day - 3; endD = attr.endDay; }
else if (attr.attempts.length) {
  const w = attr.attempts.slice().sort((a, b) => b.len - a.len)[0];
  anchor = w.start - 3; endD = w.end + 3;
} else { anchor = Math.max(1, attr.endDay - 15); endD = attr.endDay; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);
const maxDay = 180;

(async () => {
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'w5path-xscript', fullTelemetry: true });
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
  // The harness stubs G.sysSay to a no-op (sim-harness.js:234 — "silence
  // narration for sims"). The System's voice — hold beats, release beats,
  // RATINGS ARE UP — all route through sysSay, so a say-only wrap renders
  // the w5 door SILENT and the path reads as broken-fiction when it isn't.
  // Restore it here, replicating the engine's format (game.js sysSay),
  // so the transcript hears the System. Probe-only; the sim still runs
  // with the stubbed (silent) sysSay everywhere else.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: maxDay, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'w5path-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# w5path transcript — w5path-preseat-windefer/${POLICY} seed ${SEED}\n` +
    `# stall: ${attr.stallClass}${attr.stallSub ? ' (' + attr.stallSub + ')' : ''}, ` +
    `w4d=${attr.wave4Day == null ? '—' : 'd' + attr.wave4Day}, firstDef5=${attr.firstDef5Day == null ? '—' : 'd' + attr.firstDef5Day}, ` +
    `w5d=${attr.wave5Day == null ? '—' : 'd' + attr.wave5Day}, end=${attr.won ? 'won' : attr.endReason}:d${attr.endDay}\n` +
    `# attempts: ${attr.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—'}\n` +
    `# say-lines captured d[${anchor}, ${endD}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
