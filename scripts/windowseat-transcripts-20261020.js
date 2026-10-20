#!/usr/bin/env node
// windowseat-transcripts-20261020.js — sense-testing probe for
// sim-windowseat. Re-runs a sweep seed (deterministic) with Game.say
// wrapped AND Game.sysSay restored (the w5census probe-artifact lesson:
// sim-harness stubs sysSay to a no-op, so a say-only wrap renders the
// System silent) and captures SAY lines in the window around the run's
// longest deferral-5 window, for a human read of whether window deaths
// read as people dying or stat-bags (SENSE-TESTING LAW).
// READ-ONLY. Writes evidence/2026-10-20/windowseat-transcripts/<policy>-s<seed>.txt.
// Usage (READ THIS — the sweep's base must match, or the transcript
// diverges from the measured teles):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 NODEWITNESS=1 KILLDISC=1 WINDOWSEAT=1 \
//   POLICY=leadfeast SEED=66001 node scripts/windowseat-transcripts-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-windowseat-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attribute } = require('./analyze-windowseat-20261020');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'WINDOWSEAT'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
if (process.env.SEATDRIVE === '0') { console.error('STOP: SEATDRIVE must NOT be 0.'); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '66001', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-windowseat', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const attr = attribute(seedRec);

// Capture window: the longest window ±3d (prefer 'died'); else the last 15 days.
const winPref = (a, b) => {
  const da = a.outcome === 'died' ? 1 : 0, db = b.outcome === 'died' ? 1 : 0;
  return (db - da) || (b.len - a.len);
};
const win = attr.attempts.slice().sort(winPref)[0];
let anchor, endD;
if (win) { anchor = win.start - 3; endD = win.end + 3; }
else { anchor = Math.max(1, attr.endDay - 15); endD = attr.endDay; }
const keep = new Set();
for (let d = anchor; d <= endD; d++) if (d >= 1) keep.add(d);

(async () => {
  const policy = SW.policyFor(POLICY);
  // Sweep-identical loadGame args — trajectory must match the measured
  // run so the captured lines cover the measured window deaths.
  const { Game } = await loadGame({ seed: SEED, mode: 'windowseat', fullTelemetry: false });
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
  // engine's format (game.js) so the System's hold/death beats are heard.
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-20', 'windowseat-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const wdLines = attr.windowDeaths.map(d => `d${d.day} ${d.name} (${d.player ? 'scholar' : 'villager'}) — ${d.wclass}/${d.cause}${d.killerWave == null ? '' : '/w' + d.killerWave} (window-day ${d.windowDay}/${d.windowOutcome})`).join('; ');
  const head = `# windowseat transcript — seatdrive-natural-win-side/${POLICY} seed ${SEED}\n` +
    `# door: ${attr.def5ever ? 'reached' : 'not reached'} (firstDef5=${attr.firstDef5Day == null ? '—' : 'd' + attr.firstDef5Day}), ` +
    `w4d=${attr.wave4Day == null ? '—' : 'd' + attr.wave4Day}, end=${attr.endReason}:d${attr.endDay}${attr.won ? ' WON' : ''}\n` +
    `# windows: ${attr.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—'}\n` +
    `# window deaths: ${attr.windowDeathCount}${wdLines ? ' — ' + wdLines : ''}\n` +
    `# say-lines captured d[${anchor}, ${endD}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
