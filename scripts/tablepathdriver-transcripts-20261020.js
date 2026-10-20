#!/usr/bin/env node
// tablepathdriver-transcripts-20261020.js — sense-testing probe for
// sim-tablepathdriver. Re-runs an armed sweep seed (deterministic,
// SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1) with Game.say wrapped AND
// Game.sysSay restored (sim-harness stubs sysSay to a no-op, so a say-only
// wrap renders the System silent) and captures SAY lines from just before
// the table SITTING through the village's end, for a human read of the
// walked table paths — each path must read as its own genre, not as the
// feared track with a palette swap (SENSE-TESTING LAW). READ-ONLY. Writes
// evidence/2026-10-20/tablepathdriver-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1 \
//   POLICY=leadfeast SEED=64201 node scripts/tablepathdriver-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-tablepathdriver-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const AZ = require('./analyze-tablepathdriver-20261020');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'TABLEPATHDRIVER', 'RELAYDARK'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '1') { console.error('STOP: SEATDRIVE=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const SEEDIDX = AZ.SEEDS.indexOf(SEED);
if (SEEDIDX < 0) { console.error(`STOP: seed ${SEED} not in the arm's seed set.`); process.exit(2); }
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-tablepathdriver', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: armed sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = AZ.analyzeRun({ policyId: POLICY, seed: SEED, r: seedRec });

// Capture window: sitting-3d through the run's end (the seated stretch the
// diagnostic is about); if never sat, invitation-3d; if no invitation, the
// last 15 days.
const sitDay = attr.sittingDay;
const gameDays = seedRec.gameDays || 0;
let anchor, endD;
if (sitDay != null) { anchor = Math.max(1, sitDay - 3); endD = gameDays; }
else if (seedRec.tableDay != null) { anchor = Math.max(1, seedRec.tableDay - 3); endD = gameDays; }
else { anchor = Math.max(1, gameDays - 15); endD = gameDays; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY, SEEDIDX);
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
  const sweepEnd = gameDays | 0;
  const fid = probeEnd === sweepEnd ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${sweepEnd})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'tablepathdriver-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const walked = attr.walked.map(w => `${w.path}/${w.branch || '?'}${w.fellBack ? ' (fallback)' : ''}`).join(', ') || '—';
  const sdLines = attr.seatedDeaths.map(d => `d${d.day} ${d.who} — ${d.channel}/${d.cause}`).join('; ');
  const rs = seedRec.relayAtSit || {};
  const head = `# tablepathdriver transcript — tablepathdriver-win-side/${POLICY} seed ${SEED} [${fid}]\n` +
    `# assigned door=${attr.assigned}, walked=[${walked}], sat=${attr.sat ? 'd' + sitDay : 'no'}, end=${attr.endReason}:d${gameDays}, won=${attr.won}\n` +
    `# relay at sit: lean=${rs.lean} band=${rs.band} grounding=${rs.grounding} darkUses=${rs.darkUses} lightUses=${rs.lightUses} bond=${rs.bond} stage=${rs.stage} held=${rs.held}\n` +
    `# seated deaths (${attr.seatedDeaths.length})${sdLines ? ' — ' + sdLines : ''}\n` +
    `# window d${anchor}–d${endD}\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} SAY lines) [${fid}]`);
})().catch(e => { console.error('TRANSCRIPT FATAL:', e && e.stack || e); process.exit(1); });
