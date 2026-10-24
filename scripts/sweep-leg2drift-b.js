#!/usr/bin/env node
// sweep-leg2drift-b.js — leg-2 PLENTYDEPRI rot-drift BISECTION reduced driver
// (sim-leg2drift-b, 2026-10-24, oversight-flesh-out-loop-b, axis food-economy).
//
// DIAG arm: measurement only, ZERO new lever, zero src/js changes. Bisects
// the leg-2 drift (pdtradeoff-era first-half 0.970x NEW -> current master
// 0.545x OLD, leadfeast/dg1 reduced contrast) across the four leg-2
// candidates fa10e1ca8 / 2c2336dd9 / 75fdd9258 / be55cfc2c plus era
// references and the pddrift-master anchor.
//
// DERIVED verbatim from scripts/sweep-pddrift-b.js (same instrument, only
// the mode string, corpus dir, and file prefix renamed leg2drift-b) so
// the leg-2 numbers are comparable to the pddrift corpus cell-for-cell.
//
// DIAG arm: measurement only, ZERO new lever, zero src/js changes. Bisects
// the PD=1/PD=0 rot/100d drift on leadfeast/dg1 (depinteraction 0.558x ->
// bufferdepri 1.033x / pdtradeoff 0.913x) across named candidate commits
// plus two era anchors plus current master.
//
// DERIVED from scripts/sweep-pdtradeoff-b.js (cited; the identical
// instrument per finding #850). Declared deltas vs the source instrument:
//   1. DG FIXED to dg1 (DEPOSITGATE=1 FATAL-explicit; dg0 cells dropped —
//      dg1 is the drift-sensitive cell; dg0 is not under bisection here).
//   2. POLICY leadfeast by default (POLICY env may select belongfeast for
//      the pre-registered conditional second-policy check only).
//   3. SEEDS default 9250-9257 (8 seeds, the reduced contrast) instead of
//      9250-9265.
//   4. ANCHOR env REQUIRED (FATAL if unset): the git sha of the extracted
//      tree being swept; every per-seed JSON is tagged with it.
//   5. Output names leg2drift-b-<ANCHOR8>-<SIDE>-dg1-<POLICY>-s<seed>.json
//      (anchor in the filename — anchors must never overwrite each other),
//      mode
//      'leg2drift-b-<policy>' (held constant across anchors).
//   6. Channel/inflow capture STRIPPED (glutChannels, easedKcal, DG
//      holdback, freshDays series): the bisection question is the rot
//      ratio only; channel ledgers are not compared across anchors.
//      Kept: rot capture (sweepSpoiled wrapper, same dedupe), death
//      capture, villageDays exposure, depriKcal ledger read, wall fields.
//   7. No summary MERGE: each anchor run writes its own summary file
//      (OUT env); the analyzer aggregates across anchors. Re-running an
//      anchor overwrites its summary (same seeds, seeded RNG).
// Everything else — rot capture, death capture, FATAL env asserts,
// death-aware horizons, EPERM-resilient writes, STDOUT_SPLIT routing —
// is carried over from the source instrument.
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted); SIDE=pd0|pd1
//   PLENTYDEPRI explicit per SIDE; DEPOSITGATE=1 explicit; ANCHOR=<sha>
//   POLICY=leadfeast|belongfeast; SEEDS="9250,...,9257"; DAYS=100
//   (death-aware; dead villages stop; +10d tail max).
// ANCHOR=<sha> SIDE=pd0|pd1 POLICY=leadfeast SEEDS=... OUT=<path>
//   PERSEED_DIR=<path> node scripts/sweep-leg2drift-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const ANCHOR = process.env.ANCHOR || '';
if (!/^[0-9a-f]{7,40}$/.test(ANCHOR)) {
  console.error('FATAL: ANCHOR=<git sha> must be set explicitly (every per-seed JSON is tagged with it)');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'pd0'; // pd0 | pd1
const PD_WANT = SIDE === 'pd1' ? '1' : '0';
if (process.env.PLENTYDEPRI !== PD_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires PLENTYDEPRI=${PD_WANT} explicitly (unset = default-ON)`);
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: this bisection is dg1-only; DEPOSITGATE=1 must be set explicitly');
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9250,9251,9252,9253,9254,9255,9256,9257')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'leg2drift-b-corpus', `sweep-${ANCHOR.slice(0, 8)}-${SIDE}-dg1-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'leg2drift-b-corpus');

function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  return c.slice(0, 32);
}

// EPERM-FLAP-RESILIENT WRITE (carried over from the source instrument,
// plus the leg2drift existing-target fast path, declared 2026-10-24
// during a create-block episode): atomic temp + rename, retries,
// read-back verification, FAIL LOUDLY. FAST PATH: when the target
// already exists, write DIRECTLY to it (same bytes, same readback
// check) — during create-block episodes the container denies creat(2)
// for new inodes while writes to existing inodes succeed (proven
// 2026-10-24: truncate-write + rename + append all OK while every
// create failed, system-wide). The tmp+rename path is retained when
// the target does not exist. Atomicity tradeoff of the fast path
// (crash mid-write could leave a truncated file) is covered by the
// readback check plus the runner's JSON-parse skip validation, which
// re-runs any corrupt file; the analyzer FATALs on unparseable files.
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 59) { console.error('WRITE FAIL LOUDLY', filePath, e.code || e.message); process.exit(2); }
      const t0 = Date.now(); while (Date.now() - t0 < 2000) {}
    }
  }
}

const STDOUT_SPLIT = process.env.STDOUT_SPLIT === '1';
function emitFile(filePath, data) {
  if (STDOUT_SPLIT) { process.stdout.write('@@FILE ' + path.basename(filePath) + '\n'); process.stdout.write(data + '\n'); return; }
  writeRobust(filePath, data);
}
function emitSweep(data) {
  if (STDOUT_SPLIT) { process.stdout.write('@@SWEEP\n'); process.stdout.write(data + '\n'); return; }
  writeRobust(OUT, data);
}
const progress = (...a) => { if (STDOUT_SPLIT) console.error(...a); else console.log(...a); };

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'leg2drift-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const W = { deaths: [], deathSeen: new Set(), villageDays: 0, rot_fast: 0, rot_preserved: 0 };

  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) { W.deathSeen.add(key); W.deaths.push({ day, who: who.slice(0, 24), kind, cause }); }
      }
    } catch (e) {}
  };

  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => {
    try { W.villageDays += (((G.state || {}).village || {}).roster || []).length; } catch (e) {}
    if (origDaily) return origDaily(G, ctx);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  let depriKcal = 0;
  try {
    const lg = (Game.state.village || {})._plentyDepri;
    if (lg) for (const d of Object.values(lg.days || {})) depriKcal += (d.kcal || 0);
  } catch (e) {}
  const deathCauses = {};
  for (const d of W.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;
  const rank = (() => { try { return String(Game.scaleRank()); } catch (e) { return '?'; } })();
  const won = !!Game.won;
  const national = /national|global/i.test(rank) || !!((Game.state || {}).nationalLive);
  const maxWave = (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })();
  const waveReach = [];
  for (let w = 1; w <= maxWave; w++) waveReach.push(w);

  const perSeed = {
    seed, policy: POLICY_ID,
    plentydepri: PD_WANT === '1' ? 1 : 0, depositgate: 1,
    daysAlive: result.days, villageDays: W.villageDays,
    rotFreshKcal: Math.round(W.rot_fresh || 0), rotPreservedKcal: Math.round(W.rot_preserved || 0),
    depriKcal: Math.round(depriKcal),
    deathCauses, national,
    table: won, win: won,
    waveReach, medianSurvival: null, // patched by the analyzer with the cell median
    anchorCommit: ANCHOR,
  };
  const diag = {
    endReason: result.endReason, rank, maxWave,
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    ms,
  };
  return { seed, perSeed, diag };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    emitFile(path.join(PERSEED_DIR, `leg2drift-b-${ANCHOR.slice(0, 8)}-${SIDE}-dg1-${POLICY_ID}-s${s}.json`),
      JSON.stringify(Object.assign({}, perSeed, { anchorCommit: ANCHOR })));
    const rotK = Math.round((perSeed.rotFreshKcal + perSeed.rotPreservedKcal) / 1000);
    progress(`done anchor=${ANCHOR.slice(0, 8)} seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} rot=${rotK}k depriK=${Math.round(perSeed.depriKcal / 1000)} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  emitSweep(JSON.stringify({ meta: { anchor: ANCHOR, cell: SIDE + '-dg1', policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: PD_WANT, DEPOSITGATE: '1' } }, rows }));
  progress('wrote ' + OUT + ' (' + rows.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
