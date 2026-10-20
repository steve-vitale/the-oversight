#!/usr/bin/env node
// indispensable-transcripts-20261020.js — sense-testing capture for
// sim-indispensable (2026-10-20, flesh-out loop).
//
// Re-runs ONE seated diag sweep seed (deterministic, the DIAG substrate)
// with Game.say wrapped AND Game.sysSay restored (sim-harness stubs sysSay
// to a no-op, so a say-only wrap renders the System silent) and captures
// SAY lines from sitting-10d through sitting+2d — the run's closest
// approach to the indispensable gate. SENSE-TESTING LAW: read it whole and
// judge whether the villagers act like people — goals, routines, dialogue,
// reactions — as the seat nears.
// READ-ONLY (reuses the probe's composition; writes one transcript file).
// Usage: <substrate env> POLICY=leadfeast SEED=64201 node
//   scripts/indispensable-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-indispensable-diag-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT',
  'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHDRIVER', 'RELAYDARK', 'INDISPDIAG'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '1') { console.error('STOP: SEATDRIVE=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-indispensablediag', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: diag sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const diag = seedRec.diag || {};
const sitDay = diag.bestSeatDay;
const gameDays = seedRec.gameDays || 0;

// Capture window: the approach to the best seat (sitting-10d..sitting+2d);
// if never sat, the last 15 days.
let anchor, endD;
if (sitDay != null) { anchor = Math.max(1, sitDay - 10); endD = sitDay + 2; }
else { anchor = Math.max(1, gameDays - 15); endD = gameDays; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'posttable', fullTelemetry: false });
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
  // sysSay restore — the sim-harness stubs it to a no-op; restore the
  // engine's format (game.js) so the System's beats are heard.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 1 }); });
  const probeEnd = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
  const fid = probeEnd === (gameDays | 0) ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${gameDays})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'indispensablediag-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# indispensablediag transcript — diag-substrate/${POLICY} seed ${SEED} [${fid}]\n` +
    `# bestSeat=${diag.bestSeat || 'none'} day=${sitDay}, indispEver=${!!diag.indispEver}, end=${seedRec.endReason}:d${gameDays}, won=${!!seedRec.won}\n` +
    `# window d${anchor}–d${endD}\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} SAY lines) [${fid}]`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.stack || e); process.exit(1); });
