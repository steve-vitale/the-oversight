#!/usr/bin/env node
// fullseat-transcripts-20261021.js — sense-testing capture for sim-fullseat
// (2026-10-21, flesh-out loop, axis scale-onramp).
//
// Re-runs selected sweep seeds (deterministic, the DIAG substrate) with
// Game.say wrapped AND Game.sysSay restored (sim-harness stubs sysSay to
// a no-op, so a say-only wrap renders the System silent) and captures SAY
// lines around the table invitation / audit / seat readouts — the fiction
// that names the seat and its fullness. SENSE-TESTING LAW: read the lines
// and judge whether the fiction matches the instrument's component states.
//
// READ-ONLY (reuses the probe's composition; writes transcript files).
// Usage: <substrate env> POLICY=leadfeast SEED=64501 node
//   scripts/fullseat-transcripts-20261021.js
//   WINDOW=15 (days each side of the invitation day; default 10)
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-fullseat-20261021');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '64501', 10);
const WINDOW = parseInt(process.env.WINDOW || '10', 10) || 10;
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-fullseat', POLICY, `s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const dg = seedRec.diag || {};

// Anchor on the invitation day if we can find it; else the best-seat day;
// else the last WINDOW days. The invitation day is read from the sweep
// record's day-of-first-seat if present, else bestSeatEver.
let anchorDay = dg.firstLesserDay || dg.firstFullSeatDay || dg.winDay || null;
if (process.env.ANCHOR) anchorDay = parseInt(process.env.ANCHOR, 10) || anchorDay;
if (anchorDay == null && seedRec.gameDays) anchorDay = Math.max(1, seedRec.gameDays - WINDOW);
const startD = Math.max(1, anchorDay - WINDOW), endD = anchorDay + WINDOW;

const KEEP = /TABLE|table|seat|Seat|SEAT|audit|AUDIT|deed|Deed|DEED|invitation|Invitation|ring of pale light|reschedule|RESCHEDULE|withdrawn|WITHDRAWN|door|Door|DOOR/i;

(async () => {
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'fullseat-transcript', fullTelemetry: false });
  await setupGame(Game);
  // Restore sysSay (sim-harness stubs it to a no-op).
  try {
    if (Game.sysSay && Game.sysSay._harnessStub && Game._origSysSay) Game.sysSay = Game._origSysSay;
  } catch (e) {}
  const lines = [];
  const osay = Game.say.bind(Game);
  const ossy = (Game.sysSay || osay).bind ? (Game.sysSay || osay).bind(Game) : osay;
  Game.say = function (x) {
    try {
      const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      if (day >= startD && day <= endD && KEEP.test(String(x))) lines.push(`[d${day} SAY] ${String(x).slice(0, 600)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  try {
    Game.sysSay = function (x) {
      try {
        const day = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
        if (day >= startD && day <= endD && KEEP.test(String(x))) lines.push(`[d${day} SYS] ${String(x).slice(0, 600)}`);
      } catch (e) {}
      return ossy.apply(this, arguments);
    };
  } catch (e) {}
  await quietLog(async () => { await runDays(Game, policy, { days: seedRec.days || 180 }); });
  const outDir = path.join(__dirname, '..', 'evidence', '2026-10-21', 'fullseat-transcripts');
  fs.mkdirSync(outDir, { recursive: true });
  const fp = path.join(outDir, `${POLICY}-s${SEED}.txt`);
  const header = [
    `# ${POLICY} s${SEED} — invitation/audit fiction (d${startD}..d${endD}, anchored ${anchorDay})`,
    `# instrument: bestSeatEver=${dg.bestSeatEver} firstFullSeatDay=${dg.firstFullSeatDay} firstLesserDay=${dg.firstLesserDay} winDay=${dg.winDay} won=${seedRec.won} gameDays=${seedRec.gameDays}`,
    `# maxReach: w=${[dg.maxReach && dg.maxReach.w1, dg.maxReach && dg.maxReach.w2, dg.maxReach && dg.maxReach.w3, dg.maxReach && dg.maxReach.w4, dg.maxReach && dg.maxReach.w5].join('/')} contests=${dg.maxReach && dg.maxReach.contests} crises=${dg.maxReach && dg.maxReach.crises} stage=${dg.maxReach && dg.maxReach.stage}`,
    '',
  ].join('\n');
  fs.writeFileSync(fp, header + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} lines)`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e && e.stack || e); process.exit(2); });
