#!/usr/bin/env node
// seatdriveposttable-transcripts-20261019.js — sense-testing probe for
// sim-seatdrive-posttable.
// Re-runs an armed sweep seed (deterministic, SEATDRIVE=1) with Game.say
// wrapped AND Game.sysSay restored (sim-harness stubs sysSay to a no-op, so
// a say-only wrap renders the System silent) and captures SAY lines from just
// before the table SITTING through the village's end, for a human read of the
// SEATED table — the table's own stakes (pricing, trial by combat,
// light/dark branches, the win-day-floor deferral) must read sensically as
// fiction with real consequences, not just fire as events (SENSE-TESTING
// LAW). READ-ONLY. Writes
// evidence/2026-10-19/seatdriveposttable-transcripts/<policy>-s<seed>.txt.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 \
//   POLICY=leadfeast SEED=64201 node scripts/seatdriveposttable-transcripts-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-seatdriveposttable-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { seatAttribute } = require('./analyze-seatdriveposttable-20261019');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE !== '1') { console.error('STOP: SEATDRIVE=1 required.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64201', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-posttable-seatdrive', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: armed sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = seatAttribute(seedRec);

// Capture window: sitting-3d through the run's end (the seated stretch the
// diagnostic is about); if never sat, invitation-3d; if no invitation, the
// last 15 days.
const sitDay = attr.seated.sittingDay;
const tableDay = attr.table.tableDay;
let anchor, endD;
if (sitDay != null) { anchor = Math.max(1, sitDay - 3); endD = attr.wall.gameDays; }
else if (tableDay != null) { anchor = Math.max(1, tableDay - 3); endD = attr.wall.gameDays; }
else { anchor = Math.max(1, attr.wall.gameDays - 15); endD = attr.wall.gameDays; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY);
  // Sweep-identical loadGame args — trajectory must match the measured
  // run so the captured lines cover the measured seated deaths.
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
  // engine's format (game.js) so the System's table/overtime beats are heard.
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
  const sweepEnd = attr.wall.gameDays | 0;
  const fid = probeEnd === sweepEnd ? 'FIDELITY-OK' : `FIDELITY-DIVERGED(probe d${probeEnd} vs sweep d${sweepEnd})`;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-19', 'seatdriveposttable-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const sdLines = attr.seated.rows.map(d => `d${d.day}(+${d.dayAfterSit})${d.duringTable ? '' : '[post]'} ${d.name}${d.player ? ' (scholar)' : ''} — ${d.channel}/${d.cause}${d.killerWave == null ? '' : '/w' + d.killerWave}/t${d.otier == null ? '?' : d.otier}`).join('; ');
  const head = `# seatdriveposttable transcript — seatdrive-win-side/${POLICY} seed ${SEED} [${fid}]\n` +
    `# table: ${attr.table.tableOutcome} (invite d${tableDay == null ? '—' : tableDay}), sat=${attr.seated.sat ? 'd' + sitDay + ' seat=' + (attr.seated.seatAtSit || '?') : 'no'}, phases=${attr.table.phasesSeen.join('+') || '—'}, done=${attr.table.tableDoneDay == null ? '—' : 'd' + attr.table.tableDoneDay}, end=${attr.wall.endReason}:d${attr.wall.gameDays}, won=${attr.wall.won}\n` +
    `# seated deaths (${attr.seated.count})${sdLines ? ' — ' + sdLines : ''}\n` +
    `# unmet at death: ${attr.unmet.join(',') || '—'}\n` +
    `# say-lines captured d[${anchor}, ${endD}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines) [${fid}]`);
  if (fid !== 'FIDELITY-OK') process.exitCode = 3;
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
