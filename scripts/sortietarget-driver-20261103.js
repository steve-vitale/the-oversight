#!/usr/bin/env node
// sortietarget-driver-20261103.js — pilot/confirm driver, arm sim-sortietarget-a.
// One process per seed; never two harnesses in one process. Prints one JSON
// summary line per seed to stdout and writes one per-seed JSON file into
// evidence/2026-11-03/perseed-sortietarget-a/ (sims write once, on purpose).
// Full say transcripts go ONLY to /tmp (never the repo).
//
// Arms (env ARM): baseline = closecommit stack + sortietarget BARE answer
// layer (answers the last announced offer with bare 'sortie' — current
// order); variant = same stack + sortietarget AIMED layer (answers with
// ('sortie', offer.key) — match-first). The ONLY difference between arms
// is the target argument. Env flags (same seven as the sortie driver):
// FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap.
//   ARM=baseline|variant SEEDS=98401,98402 DAYS=180 RUN=stpilot \
//     node scripts/sortietarget-driver-20261103.js
//
// Attribution is RETURN-VALUE (0815 lesson): the driver wrap records the
// lingererSortie return object (fought[] captured at fight start, plus
// targetMatched/raidersAtStart) — never a post-return tbfight.id read.
// The policy's own ctx.sortietarget.calls are kept as a cross-check; the
// driver wrap is the primary record.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const TR = require(path.join(REPO, 'scripts', 'policies', 'titanroute'));
const MC = require(path.join(REPO, 'scripts', 'policies', 'musterclose'));
const MG = require(path.join(REPO, 'scripts', 'policies', 'mustergap'));
const ST = require(path.join(REPO, 'scripts', 'policies', 'sortietarget'));
const { tableFlags } = require(path.join(REPO, 'scripts', 'fightoutcome-tableflags'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`SORTIETARGET STOP: ${k}=1 is required.`); process.exit(2); }
}
const ARM = process.env.ARM || '';
if (ARM !== 'baseline' && ARM !== 'variant') { console.error('SORTIETARGET STOP: ARM=baseline|variant required.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'stpilot';
if (!SEEDS.length) { console.error('SORTIETARGET STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  const fd = FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
  const rt = TR.withTitanRoute(fd, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  const cc = MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
  if (ARM === 'variant') return ST.withSortieAimed(cc, 'lead-sortietarget-aimed', 'closecommit + aimed sortie answers');
  return ST.withSortieBare(cc, 'lead-sortietarget-bare', 'closecommit + bare sortie answers');
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const says = [];
  const answerCalls = [];
  const errors = [];
  let capturedCtx = null;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') says.push({ day: gday(Game), line: String(arg).slice(0, 500) });
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
  try {
    const origAns = Game.answerLingerer;
    if (typeof origAns === 'function') {
      Game.answerLingerer = function () {
        const argKey = arguments.length > 1 ? (arguments[1] || null) : null;
        let ret = null, err = null;
        try { ret = origAns.apply(this, arguments); } catch (e) { err = String(e && e.message || e).slice(0, 120); }
        try {
          answerCalls.push({ day: gday(Game), how: String(arguments[0]),
            argKey: argKey ? String(argKey) : null,
            ok: !!(ret && typeof ret === 'object' && ret.ok),
            why: (ret && typeof ret === 'object' && ret.why) || (typeof ret === 'string' ? ret : null),
            cleared: (ret && typeof ret === 'object' && (ret.cleared | 0)) || 0,
            broke: !!(ret && typeof ret === 'object' && ret.broke),
            fought: (ret && typeof ret === 'object' && Array.isArray(ret.fought)) ? ret.fought : [],
            targetMatched: !!(ret && typeof ret === 'object' && ret.targetMatched),
            raidersAtStart: (ret && typeof ret === 'object' && (ret.raidersAtStart | 0)) || 0,
            error: err });
        } catch (e) {}
        if (err) throw new Error(err);
        return ret;
      };
    }
  } catch (e) { errors.push('ans-wrap: ' + String(e.message).slice(0, 80)); }

  const wrapped = Object.assign({}, policy, {
    setup(Gm, ctx) { capturedCtx = ctx; if (policy.setup) return policy.setup(Gm, ctx); },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  let faced = {};
  try { faced = JSON.parse(JSON.stringify(((typeof Game.deedState === 'function') ? Game.deedState().wavesFaced : {}) || {})); } catch (e) { errors.push('faced: ' + String(e.message).slice(0, 80)); }
  const w4Faced = Object.keys(faced).filter(mid => (faced[mid] | 0) === 4);
  const w5Faced = Object.keys(faced).filter(mid => (faced[mid] | 0) === 5);
  let rank = 'village';
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  let tf = { tableWaiting: 0, tableDone: 0, table: 0 };
  try { tf = tableFlags(Game.progState ? Game.progState() : {}); } catch (e) {}
  let unlocked = 1;
  try { unlocked = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1; } catch (e) {}
  const ctx = capturedCtx || {};
  const st = (ctx.sortietarget) || { answered: {}, calls: [] };
  const deaths = ((result && result.samples && result.samples.deaths) || []).slice();
  const deathByCause = {};
  let starvationDeaths = 0;
  for (const d of deaths) {
    const c = String((d && d.cause) || 'unknown');
    deathByCause[c] = (deathByCause[c] || 0) + 1;
    if (/starv|hunger|famine/i.test(c)) starvationDeaths++;
  }
  const answerDays = new Set(answerCalls.map(a => a.day));
  const sortieLines = says.filter(s => answerDays.has(s.day) &&
    /SORTIE|treeline|fought|didn't come back|falls back/i.test(s.line));
  const out = { seed, arm: ARM, run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: ((Game.state || {}).scholar || {}).day || 0, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked,
    national: (rank === 'national' || rank === 'global') ? 1 : 0, rank,
    tableWaiting: tf.tableWaiting, tableDone: tf.tableDone, table: tf.table,
    won: !!Game.won ? 1 : 0,
    faced, w4Faced, w4Count: w4Faced.length, w5Faced, w5Count: w5Faced.length,
    answerCalls, policyCalls: st.calls || [],
    answerCount: answerCalls.length, policyCallCount: (st.calls || []).length,
    sortieLines: sortieLines.slice(0, 120),
    deaths: deaths.length, deathByCause, starvationDeaths,
    sayCount: says.length, errors };
  return { out, says };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-03', 'perseed-sortietarget-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const { out, says } = await oneRun(seed);
    const file = path.join(outDir, `s-${out.arm}-s${seed}-${out.run}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    try { fs.writeFileSync(`/tmp/sortietarget-says-${out.arm}-s${seed}-${out.run}.json`, JSON.stringify(says) + '\n'); } catch (e) {}
    console.log(JSON.stringify({ seed: out.seed, arm: out.arm, days: out.days, endReason: out.endReason,
      maxWave: out.maxWave, unlockedWave: out.unlockedWave, w4Count: out.w4Count, w5Count: out.w5Count,
      answers: out.answerCount, policyCalls: out.policyCallCount,
      national: out.national, tableDone: out.tableDone, won: out.won,
      deaths: out.deaths, starvation: out.starvationDeaths, errors: out.errors }));
  }
})().catch(e => { console.error('SORTIETARGET FATAL: ' + (e && e.stack || e)); process.exit(1); });
