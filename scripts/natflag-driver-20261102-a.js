#!/usr/bin/env node
// natflag-driver-20261102-a.js — daily scale-rank trace for sim-natflag-a
// (Loop A 20261102, axis scale-onramp, DIAGNOSIS ONLY, blank 5).
// Question: what exactly reads 1 in the musterupkeep arm's final-read
// driver-computed national flag on seed 97338 (village-lost d122)?
// Reuses the musterupkeep driver pattern verbatim for the policy stack:
// closecommit = tribfloor + windefer + seatdrive + fullseat-diag +
// titanroute + musterclose + mustergap. Zero src/js changes.
// One process per seed (harness rule); prints one JSON summary line per
// seed and writes one per-seed JSON file into
// evidence/2026-11-02/perseed-natflag-a/.
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1 \
//   DAYS=180 SEEDS=97338,97330 RUN=r1 node scripts/natflag-driver-20261102-a.js
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

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'HERALD']) {
  if (process.env[k] !== '1') { console.error(`NATFLAG STOP: ${k}=1 is required.`); process.exit(2); }
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const RUN = process.env.RUN || 'r1';
if (!SEEDS.length) { console.error('NATFLAG STOP: SEEDS required.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function basePolicy() {
  const base = TF.leadfeast;
  const wd = WD.withWinDefer(base, 'lead-windefer', 'leadfeast + win-side layers');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'leadfeast + win-side stack + seatdrive');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'leadfeast + full-seat component recorder');
}
function policyFor() {
  const b = basePolicy();
  const rt = TR.withTitanRoute(b, 'lead-titanroute', 'lead-fullseat + titanroute march/call');
  const mc = MC.withMusterClose(rt, 'lead-musterclose', 'lead-titanroute + musterclose deepening');
  return MG.withMusterGap(mc, 'lead-musterclose-commit', 'lead-musterclose + mustergap commit-own');
}

const SCALE_RE = /First Court|Iron Court|The Binding|Founding Council|The Charter|realm came apart|realm bows|oath was sworn|Regional Dawn|GOVERNANCE LAYER|national|National|NATIONAL|global|Global|Watchers|free fire|polity tribute|four fires/i;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function scaleRow(Game, errors) {
  const st = Game.state || {};
  const row = { day: gday(Game), villageLost: !!Game.villageLost, over: !!Game.over, won: !!Game.won };
  try { row.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { row.rank = 'ERR:' + String(e.message).slice(0, 60); errors.push('rank: ' + String(e.message).slice(0, 80)); }
  row.networkLive = !!st.networkLive; row.networkLiveDay = st.networkLiveDay == null ? null : st.networkLiveDay;
  row.nationalLive = !!st.nationalLive; row.nationalDay = st.nationalDay == null ? null : st.nationalDay;
  row.nationalShape = st.nationalShape || null; row.nationalPrimary = st.nationalPrimary || null;
  row.globalLive = !!st.globalLive;
  row.pendingNational = st.pendingNational ? { shape: st.pendingNational.shape || null, day: st.pendingNational.day == null ? null : st.pendingNational.day, villages: st.pendingNational.villages || null } : null;
  row.pendingGlobal = st.pendingGlobal ? true : false;
  row.scaleRefused = !!st.scaleRefused;
  try {
    const p = Game._havenPolity ? Game._havenPolity() : null;
    row.polity = p ? { shape: p.shape || null, primary: p.primary || null, villages: p.villages || null, size: p.size == null ? null : p.size, led: !!p.led } : null;
  } catch (e) { row.polity = 'ERR'; errors.push('polity: ' + String(e.message).slice(0, 80)); }
  try {
    const links = Game.hierarchyState ? (Game.hierarchyState() || []) : [];
    row.links = links.filter(function (l) { return l && l.status === 'active'; }).map(function (l) {
      return { id: l.id || null, primary: l.primary || null, subordinate: l.subordinate || null,
        trust: l.trust == null ? null : l.trust, arrears: l.arrears || 0,
        day: l.day == null ? null : l.day, conquered: !!l.conquered, kind: l.kind || null };
    });
  } catch (e) { row.links = []; errors.push('links: ' + String(e.message).slice(0, 80)); }
  try {
    const v = st.village || {};
    row.rosterLen = (v.roster || []).length;
    row.fallenLen = (v.fallen || []).length;
  } catch (e) {}
  return row;
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  const errors = [];
  const scaleTrace = [];
  const scaleLines = [];
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && SCALE_RE.test(arg) && scaleLines.length < 1000) {
          scaleLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }
  function maybeTrace() {
    try {
      const today = gday(Game);
      if (scaleTrace.some(function (r) { return r.day === today; })) return;
      scaleTrace.push(scaleRow(Game, errors));
    } catch (e) { errors.push('maybeTrace: ' + String(e.message).slice(0, 80)); }
  }
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally { maybeTrace(); }
    },
  });
  await setupGame(Game);
  let result = null;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // Final read: exactly the musterupkeep driver's computation.
  let national = 0, table = 0, rank = 'village';
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (rank === 'national' || rank === 'global') national = 1; } catch (e) { errors.push('final-rank: ' + String(e.message).slice(0, 80)); }
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) { errors.push('prog: ' + String(e.message).slice(0, 80)); }
  let deedGate = null;
  try { deedGate = Game.deedGateReady ? Game.deedGateReady() : null; } catch (e) { errors.push('deedGate: ' + String(e.message).slice(0, 80)); }
  let finalScale = null;
  try { finalScale = scaleRow(Game, errors); } catch (e) { errors.push('final-scale: ' + String(e.message).slice(0, 80)); }
  const st = Game.state || {};
  return { seed, arm: 'closecommit', run: RUN, anchorCommit: ANCHOR,
    scaleTrace: scaleTrace, scaleLines: scaleLines,
    finalRank: rank, national: national, table: table, won: !!Game.won ? 1 : 0,
    deedGate: deedGate, finalScale: finalScale,
    maxWave: result.maxWaveUnlocked || 1, days: result.days,
    gameDays: (st.scholar && st.scholar.day) || 0, endReason: result.endReason,
    villageLost: !!Game.villageLost, deaths: ((result.samples || {}).deaths || []).length,
    errors: errors };
}

(async () => {
  const outDir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-natflag-a');
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const rec = await oneRun(seed);
    const file = path.join(outDir, `nf-closecommit-s${seed}-${RUN}.json`);
    fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
    // Flip summary: first day of each rank value, in trace order.
    const flips = [];
    let prev = null;
    rec.scaleTrace.forEach(function (r) { if (r.rank !== prev) { flips.push({ day: r.day, rank: r.rank }); prev = r.rank; } });
    console.log(JSON.stringify({ seed: rec.seed, run: rec.run, flips: flips,
      finalRank: rec.finalRank, national: rec.national, table: rec.table, won: rec.won,
      gameDays: rec.gameDays, endReason: rec.endReason, maxWave: rec.maxWave,
      deedGate: rec.deedGate, scaleLines: rec.scaleLines.length, file: path.relative(REPO, file) }));
  }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
