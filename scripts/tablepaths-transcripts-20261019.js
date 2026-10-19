#!/usr/bin/env node
// tablepaths-transcripts-20261019.js — sense-testing probe for sim-tablepaths.
// Re-runs an armed sweep seed (deterministic, SEATDRIVE=1 + TABLEPATHS=1)
// with Game.say wrapped AND Game.sysSay restored (sim-harness stubs sysSay
// to a no-op, so a say-only wrap renders the System silent) and captures
// SAY lines from just before the table SITTING through the village's end,
// for a human read of the FORCED table paths — each path must read as a
// different game (per the endgame design), not just outcome codes
// (SENSE-TESTING LAW). READ-ONLY. Writes
// evidence/2026-10-19/tablepaths-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHS=1 \
//   POLICY=leadfeast SEED=64201 node scripts/tablepaths-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-tablepaths-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { analyzeRun } = require('./analyze-tablepaths-20261019');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHS'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '1') { console.error('STOP: SEATDRIVE=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-tablepaths', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: armed sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = analyzeRun(seedRec);

// Capture window: sitting-3d through the run's end (the seated stretch the
// diagnostic is about); if never sat, invitation-3d; if no invitation, the
// last 15 days.
const sitDay = attr.sittingDay;
const tableDay = attr.tableDay;
let anchor, endD;
if (sitDay != null) { anchor = Math.max(1, sitDay - 3); endD = attr.gameDays; }
else if (tableDay != null) { anchor = Math.max(1, tableDay - 3); endD = attr.gameDays; }
else { anchor = Math.max(1, attr.gameDays - 15); endD = attr.gameDays; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY, SEED);
  // Sweep-identical loadGame args — trajectory must match the measured
  // run so the captured lines cover the measured table walk.
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
  // engine's format (game.js) so the System's table beats are heard.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  // FIDELITY PIN: the probe trajectory must end where the sweep measured.
  const probeEnd = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
  const sweepEnd = attr.gameDays | 0;
  const fid = probeEnd === sweepEnd ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${sweepEnd})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'tablepaths-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const walked = attr.walked.map(w => `${w.path}/${w.branch || '?'}${w.fellBack ? ' (fallback)' : ''}`).join(', ') || '—';
  const trials = attr.trialResumes.map(t => `${t.result}${t.bearerDied ? '/bearer-died' : ''}`).join(', ') || '—';
  const sdLines = attr.seatedDeaths.map(d => `d${d.day} ${d.name}${d.player ? ' (scholar)' : ''} — ${d.pathChannel}/${d.cause}`).join('; ');
  const head = `# tablepaths transcript — tablepaths-win-side/${POLICY} seed ${SEED} [${fid}]\n` +
    `# assigned door=${attr.assigned}, walked=[${walked}], trials=[${trials}], sat=${attr.sat ? 'd' + sitDay + ' seat=' + (attr.seat || '?') : 'no'}, end=${attr.endReason}:d${attr.gameDays}, won=${attr.won}\n` +
    `# seated deaths (${attr.seatedDeaths.length})${sdLines ? ' — ' + sdLines : ''}\n` +
    `# window d${anchor}–d${endD}\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} SAY lines) [${fid}]`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.stack || e); process.exit(1); });
