#!/usr/bin/env node
// vetwindow-transcripts-20261018.js — sense-testing probe for sim-vetwindow.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in a window around each veteran death day, for human reads of
// whether veteran deaths are meaningful (desperate, traumatic) or arbitrary.
// READ-ONLY. Writes evidence/2026-10-18/vetwindow-transcripts/<policy>-s<seed>.txt.
// Usage: SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 \
//        POLICY=leadfeast SEED=53101 node scripts/vetwindow-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./vetwindow-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '53101', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-vetwindow', `winseat-${POLICY}-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const deathDays = (seedRec.veteranDeaths || []).map(d => d.day | 0);
if (!deathDays.length) { console.log('no veteran deaths in this run — nothing to transcribe.'); process.exit(0); }
// Capture window: 3 days before each veteran death through 1 day after.
// HORIZON (2026-10-18): the probe MUST use the sweep's 180d horizon — a
// shorter horizon terminates the run early (harness behavior) and the
// death days are never reached. The trajectory is horizon-invariant
// (verified: 80d vs 180d byte-identical on the common prefix), so the
// full-horizon re-run reproduces the sweep exactly.
const keep = new Set();
for (const dd of deathDays) for (let d = dd - 3; d <= dd + 1; d++) if (d >= 1) keep.add(d);
const maxDay = 180;

(async () => {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'vetwindow-xscript', fullTelemetry: true });
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
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: maxDay, manifest: undefined, sampleEvery: 30 }); });
  delete process.env.WINDEFER;
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'vetwindow-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const deaths = (seedRec.veteranDeaths || []).map(d =>
    `d${d.day} ${d.name} (${d.who}) died — channel=${d.channel} cause='${d.cause}' inWindow=${d.inWindow}`).join('\n');
  const head = `# vetwindow transcript — winseat/${POLICY} seed ${SEED}\n# veteran deaths in sweep run:\n${deaths}\n# say-lines captured d[death-3, death+1]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
