#!/usr/bin/env node
// sweep-heraldmuster-20261021.js — sim-heraldmuster PILOT sweep.
//
// 8 FRESH seeds (64831-64838 — verified filename-unused in
// evidence/2026-10-21/perseed-*/ and unmentioned in evidence/2026-10-21/*.md
// before the sweep) x {leadfeast, belongfeast} x {control, armed}
// = 32 runs, 180d death-aware, paired identical seeds, on the SEATDRIVE=1
// WINNING substrate (the sim-fullseat corpus substrate):
//
//   control = HM.seatStackFor(base): seatdrive's prebuilt leadseat/belongseat
//             (withSeatDrive(withWinDefer(TF leadfeast/belongfeast)); HERALDMUSTER unset)
//   armed   = HM.armedFor(base):     withHeraldMuster OUTSIDE the same stack
//             (HERALDMUSTER=1)
// Both share scripts/policies/heraldmuster.js; composition honesty pinned by
// scripts/test-heraldmuster-20261021.js BEFORE this sweep ran.
//
// Instrument: HERALDCENSUS=1 (read-only herald engagement census + daily
// muster census — proven non-perturbing by the proof test's E2 gate).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-heraldmuster/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 HERALDCENSUS=1 \
//   ARM=control SEEDS=64831,64832 node scripts/sweep-heraldmuster-20261021.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 HERALDCENSUS=1 \
//   HERALDMUSTER=1 ARM=armed SEEDS=64831,64832 node scripts/sweep-heraldmuster-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
let HME = null;
try { HME = require(path.join(REPO, 'scripts', 'policies', 'heraldmuster')); }
catch (e) {
  if (process.env.HERALDMUSTER_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/heraldmuster.js deleted per kill protocol (sim-heraldmuster NO-GO) — sweep not applicable.');
    process.exit(0);
  }
  throw e;
}
const HMI = require(path.join(REPO, 'scripts', 'heraldmuster-instrument-20261021'));

// WINNING-SUBSTRATE guard (sim-fullseat corpus env, + HERALDCENSUS).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'HERALDCENSUS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate + census).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS', 'VGEAR']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}
if (HMI.instrumentOn() !== true) { console.error('SWEEP STOP: HERALDCENSUS instrument off despite HERALDCENSUS=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM must be control|armed.'); process.exit(2); }
if (ARM === 'armed' && process.env.HERALDMUSTER !== '1') { console.error('SWEEP STOP: HERALDMUSTER=1 required for ARM=armed.'); process.exit(2); }
if (ARM === 'control' && ('HERALDMUSTER' in process.env)) { console.error('SWEEP STOP: HERALDMUSTER must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64831, 64832, 64833, 64834, 64835, 64836, 64837, 64838]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-heraldmuster');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = HME.normBase(base); return ARM === 'armed' ? HME.armedFor(t) : HME.seatStackFor(t); }
function policyTag(base) { return HME.normBase(base) + (ARM === 'armed' ? '-heraldmuster' : ''); }

async function oneRun(seed, base) {
  const policyObj = policyFor(base);
  const tag = policyTag(base);
  let lastCtx = null;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) { lastCtx = ctx; return policyObj.daily(G, ctx); },
  });
  const { Game } = await loadGame({ seed, mode: 'heraldmuster', fullTelemetry: false });
  const t = { heraldEngagements: [], instrumentErrors: [] };
  const uninstallHMI = HMI.install(Game, t);

  // Daily muster census (call-through, pure reads, zero writes/RNG).
  const musterCensus = [];
  let uninstallCensus = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try { musterCensus.push(HMI.census(Game)); } catch (e) { t.instrumentErrors.push('musterCensus: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallCensus = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallCensus) uninstallCensus(); } catch (e) {}
  try { uninstallHMI(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0, winTrack = null;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    if (ek) winTrack = { path: ek.tablePath || null, moral: ek.moral || null, track: ek.track || null, seat: ek.seat || null };
  } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  // Herald engagement tallies (the PRIMARY metric's raw material).
  const eng = t.heraldEngagements || [];
  const accepted = eng.filter(e => e.verdict === 'accepted');
  const refused = eng.filter(e => e.verdict === 'refused');
  const unexplained = eng.filter(e => e.verdict === 'unexplained');

  // Muster trajectory summary (from the daily census).
  let readyDays = 0, maxAllies = 0, maxHaven = 0, omenLocatedDay = null, gateReadyFirstDay = null;
  try {
    for (const c of musterCensus) {
      if ((c.uniqueAllies | 0) > maxAllies) maxAllies = c.uniqueAllies | 0;
      if ((c.havenBlades | 0) > maxHaven) maxHaven = c.havenBlades | 0;
      if (c.omenStage != null && c.omenStage >= 2 && omenLocatedDay == null) omenLocatedDay = c.day;
      if (c.gateReady === true) { readyDays++; if (gateReadyFirstDay == null) gateReadyFirstDay = c.day; }
    }
  } catch (e) {}

  const hm = lastCtx ? {
    soundAttempts: lastCtx.hmSoundAttempts | 0, soundOk: lastCtx.hmSoundOk | 0,
    commitTaps: lastCtx.hmCommitTaps | 0, readyDay: lastCtx.hmReadyDay || null,
    driveError: lastCtx.hmDriveError | 0, soundError: lastCtx.hmSoundError | 0,
    commitError: lastCtx.hmCommitError | 0, noScholar: lastCtx.hmNoScholar | 0,
  } : null;

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'heraldmuster-instrument-20261021 (HERALDCENSUS=1)',
    substrate: 'SEATDRIVE=1 winning substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 HERALDCENSUS=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS)' + (ARM === 'armed' ? ' + HERALDMUSTER=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled, winTrack,
    days: result.days, gameDays, endReason: result.endReason,
    // PRIMARY (pre-registered): accepted-seeds; verdict tallies per seed.
    heraldAccepted: accepted.length > 0 ? 1 : 0,
    heraldAcceptedN: accepted.length, heraldRefusedN: refused.length, heraldUnexplainedN: unexplained.length,
    heraldEngagements: eng.map(e => ({ day: e.day, verdict: e.verdict, omenStage: e.snap.omenStage, gateReady: e.snap.gateReady, uniqueAllies: e.snap.uniqueAllies, havenBlades: e.snap.havenBlades, activeLinks: e.snap.activeLinks })),
    // Muster assembly (diagnostic context, never the judge).
    musterMaxAllies: maxAllies, musterMaxHaven: maxHaven, musterReadyDays: readyDays,
    omenLocatedDay, gateReadyFirstDay,
    layer: hm,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
    musterCensusDays: musterCensus.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${r.policy} s${seed}: accepted=${r.heraldAcceptedN} refused=${r.heraldRefusedN} unexpl=${r.heraldUnexplainedN} readyDays=${r.musterReadyDays} maxA=${r.musterMaxAllies} maxH=${r.musterMaxHaven} errs=${r.instrumentErrors.length} end=${r.endReason} won=${r.won} nat=${r.national}`);
      } catch (e) {
        console.error(`FAILED ${base} s${seed}: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`);
        process.exitCode = 1;
      }
    }
  }
  fs.writeFileSync(path.join(EVID, `_summary-${ARM}.json`), JSON.stringify(rows.map(r => ({
    seed: r.seed, policy: r.policy, maxWave: r.maxWave, national: r.national, table: r.table, won: r.won, exiled: r.exiled,
    heraldAccepted: r.heraldAccepted, heraldAcceptedN: r.heraldAcceptedN, heraldRefusedN: r.heraldRefusedN, heraldUnexplainedN: r.heraldUnexplainedN,
    musterReadyDays: r.musterReadyDays, musterMaxAllies: r.musterMaxAllies, musterMaxHaven: r.musterMaxHaven, omenLocatedDay: r.omenLocatedDay, gateReadyFirstDay: r.gateReadyFirstDay,
    gameDays: r.gameDays, endReason: r.endReason, deathCauses: r.deathCauses, winTrack: r.winTrack, layer: r.layer,
  })), null, 1) + '\n');
  console.log(`wrote ${rows.length} per-seed JSONs to ${EVID}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
