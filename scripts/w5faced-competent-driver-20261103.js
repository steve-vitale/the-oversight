#!/usr/bin/env node
// w5faced-competent-driver-20261103.js — driver for the competent-policy
// wave-5-fought population diagnostic (run fleshout-20261103T0940Z, arm
// sim-w5faced-a, 0815Z blank 3). Competent-policy generalization of the
// 0316Z closecommit driver: same stage instrument (corrected: campaignOnly
// split, fight-start capture, wrap fire counts), but the policy is
// scripts/policies/competent.js {competent} VERBATIM with default env —
// the point is what an ordinary competent village meets, not what a
// seat-driving stack can force. One process per seed, seeds sequential.
// Say transcripts go to /tmp only, never to the repo. Per-seed JSON goes
// to evidence/2026-11-03/perseed-w5faced-competent-a/ (sims write once,
// on purpose). The driver REFUSES to overwrite an existing per-seed file
// (prereg freshness promise): a collision aborts before any judged run.
// Usage:
//   DAYS=180 SEEDS=98901,98902 RUN=compdiag node scripts/w5faced-competent-driver-20261103.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const INST = require(path.join(REPO, 'scripts', 'w5faced-competent-instrument-20261103'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'compdiag';
if (!SEEDS.length) { console.error('W5FACED-COMPETENT STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-w5faced-competent-a');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, `w5-competent-s${seed}-${RUN}.json`);
  if (fs.existsSync(file)) { console.error('W5FACED-COMPETENT STOP: refusing to overwrite ' + file); process.exit(3); }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed, mode: 'competent-w5faced', fullTelemetry: false });
  const says = [];
  const errors = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') says.push({ day: gday(Game), line: String(arg).slice(0, 600) });
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshot(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshot(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, endGate = null, tableProg = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { endGate = FD.snapFullSeat(Game); } catch (e) { errors.push('snapFullSeat: ' + String(e.message).slice(0, 80)); }
  try { tableProg = (st.scholar && st.scholar.prog && st.scholar.prog.table) || null; } catch (e) {}
  let tableLatch = 0, tableWaiting = null, tableDone = null;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) tableLatch = 1; tableWaiting = !!pg.tableWaiting; tableDone = !!pg.tableDone; } catch (e) {}

  const out = {
    seed, arm: 'competent', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1,
    tableLatch: tableLatch,
    tableWaiting: tableWaiting, tableDone: tableDone,
    tableSeat: tableProg ? tableProg.seat : null,
    tablePath: tableProg ? tableProg.path : null,
    endGate: endGate,
    wrapCounts: t.wrapCounts,
    targetRows: t.targetRows, castRows: t.castRows, spawnRows: t.spawnRows,
    triggerRows: t.triggerRows, startRows: t.startRows, tbEndRows: t.tbEndRows,
    fieldRows: t.fieldRows, removeRows: t.removeRows, daily: t.daily,
    sayCount: says.length, instrumentErrors: t.instrumentErrors.concat(errors),
  };
  return { out: out, says: says };
}

(async () => {
  const saysDir = process.env.SAYS_DIR || '/tmp/w5faced-competent-says';
  fs.mkdirSync(saysDir, { recursive: true });
  for (const seed of SEEDS) {
    const { out, says } = await oneRun(seed);
    const file = path.join(outDir, `w5-competent-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    fs.writeFileSync(path.join(saysDir, `w5-says-s${seed}-${RUN}.jsonl`), says.map(s => JSON.stringify(s)).join('\n') + '\n');
    const w5 = function (rows) { return rows.filter(function (r) { return r.wave === 5; }); };
    const spawnFC = w5(out.spawnRows).filter(function (r) { return !r.campaignOnly; }).length;
    const line = {
      seed: out.seed, run: out.run, days: out.days, endReason: out.endReason,
      won: out.won, scaleRank: out.scaleRank, maxWave: out.maxWave,
      tableLatch: out.tableLatch, seat: out.tableSeat,
      gateW4: out.endGate ? out.endGate.w4 : null, gateW5: out.endGate ? out.endGate.w5 : null,
      targetW5: out.targetRows.filter(function (r) { return r.target === 5; }).length,
      castW5: w5(out.castRows).length,
      spawnW5: w5(out.spawnRows).length, spawnW5FightCandidate: spawnFC,
      triggerW5: w5(out.triggerRows).length,
      startW5: w5(out.startRows).length, fieldW5: w5(out.fieldRows).length,
      removeW5: w5(out.removeRows).length,
      tableWaiting: out.tableWaiting, tableDone: out.tableDone,
      wrapCounts: out.wrapCounts,
      says: out.sayCount, errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    };
    console.log(JSON.stringify(line));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
