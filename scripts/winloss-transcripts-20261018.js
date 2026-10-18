#!/usr/bin/env node
// winloss-transcripts-20261018.js — sense-testing probe for sim-winloss-a.
// Re-runs a sweep seed (deterministic) with Game.say wrapped and captures
// SAY lines in a window around the loss, for human reads of whether the
// loss cascade is meaningful (desperate, coherent) or arbitrary.
// Also dumps blocking state at run end (what froze the day, if it froze).
// READ-ONLY. Writes evidence/2026-10-18/winloss-transcripts/<policy>-s<seed>.txt.
// Usage: SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 \
//        POLICY=leadfeast SEED=59104 node scripts/winloss-transcripts-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
const POLICY = process.env.POLICY || 'leadfeast';
const SEED = parseInt(process.env.SEED || '59104', 10);
const EVIDSEED = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-winloss-a', `winseat-${POLICY}-s${SEED}.json`);
if (!fs.existsSync(EVIDSEED)) { console.error(`STOP: sweep JSON missing: ${EVIDSEED}`); process.exit(2); }
const seedRec = JSON.parse(fs.readFileSync(EVIDSEED, 'utf8'));
const gameDays = seedRec.gameDays | 0;
const rl = seedRec.runLoss || {};
// Capture window: last 15 game-days of the run (the loss cascade), clamped >= 1.
const keep = new Set();
for (let d = Math.max(1, gameDays - 15); d <= gameDays + 1; d++) keep.add(d);
const maxDay = 180;

function blockingState(Game) {
  const out = {};
  try { out.scholarDay = (Game.state.scholar || {}).day | 0; } catch (e) { out.scholarDay = '?'; }
  try { out.over = !!Game.over; out.won = !!Game.won; out.villageLost = !!Game.villageLost; } catch (e) {}
  try {
    const f = Game.tbfight;
    out.tbfight = f ? { id: f.id, round: f.round, over: !!f.over, fighters: (f.fighters || []).length } : null;
  } catch (e) { out.tbfight = 'err'; }
  try { out.activeContest = !!Game.state.activeContest; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.tableWaiting = !!pg.tableWaiting; out.tableDone = !!pg.tableDone; out.arc = pg.arc | 0;
  } catch (e) {}
  try {
    const T = Game.tableState ? Game.tableState() : {};
    out.tablePhase = T.phase || null; out.winDeferred = !!T.winDeferred;
  } catch (e) { out.tablePhase = 'err'; }
  try { out.tableActive = (typeof Game.tableActive === 'function') ? !!Game.tableActive() : null; } catch (e) {}
  try { out.scattered = !!((Game.state.village || {}).scattered); } catch (e) {}
  try { out.hungryDays = ((Game.state.village || {}).hungryDays) | 0; } catch (e) {}
  try { out.pop = ((Game.state.village || {}).roster || []).length; } catch (e) {}
  try { out.pendingEncounter = !!Game.pendingEncounter; out.pendingMonsterId = Game.pendingMonsterId || null; } catch (e) {}
  return out;
}

(async () => {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const policy = SW.policyFor(POLICY);
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss-xscript', fullTelemetry: true });
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
  const bs = blockingState(Game);
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-18', 'winloss-transcripts');
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${POLICY}-s${SEED}.txt`);
  const head = `# winloss transcript — winseat/${POLICY} seed ${SEED}\n` +
    `# runLoss: ${rl.terminal}:${rl.channel} (gameDays=${gameDays}, end=${seedRec.endReason})\n` +
    `# deaths: ${(seedRec.deaths || []).map(d => `d${d.day} ${d.name} '${d.cause}'->${d.channel}`).join('; ')}\n` +
    `# blocking state at end: ${JSON.stringify(bs)}\n` +
    `# say-lines captured d[${Math.max(1, gameDays - 15)}..${gameDays + 1}]: ${lines.length}\n\n`;
  fs.writeFileSync(fp, head + lines.join('\n') + '\n');
  console.log(`wrote ${fp} (${lines.length} say lines) blocking=${JSON.stringify(bs)}`);
})().catch(e => { console.error('TRANSCRIPT CRASH:', e); process.exit(2); });
