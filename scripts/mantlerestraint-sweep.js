#!/usr/bin/env node
// mantlerestraint-sweep.js — MANTLE-RESTRAINT lever census (flesh-out loop
// arm sim-mantlerestraint, axis scale-onramp, run fleshout-20261023T1730Z).
// Game-side, MANTLERESTRAINT=1 (default-off). Namespace mantlerestraint.
//
// THE SURFACE (sim-vetretention-restage named next #4): the re-stage proved
// the chair dominates blooded-vid mortality — 7 control + 6 armed
// chair-censored deaths inside the 14d window vs ZERO fighter window-deaths
// on either arm. This arm's game-side hook (ledger.js playerDeath via
// Game.mantleRestraint): skip in-window (14d post-first-wave-4+-kill)
// blooded vids as succession candidates, voiced as the village holding its
// blooded back from the office while they recover. Candidacy only — trust
// is never touched.
//
// Design: 8 seeds (65511–65518) x {lead, belong} x {control, armed} = 32
// configs, 180d death-aware, paired identical seeds. Pinned substrate on
// BOTH arms (the autopsy corpus — comparable):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   control = VS.substrateFor (armorydrive stack, MANTLERESTRAINT unset)
//   armed   = VS.substrateFor (same stack + MANTLERESTRAINT=1)
// ONE DELTA ONLY.
//
// Sensors (retained per seed):
//   (1) state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans
//       bar reads — standing.js; the killdisc t.kills wrapper missed these
//       in w5door-b, so the direct read is the method, per the autopsy).
//   (2) per-villager death rows via the windowstay death-capture layer
//       (lesson #760 shape) — killer vid -> death cause/day is a direct
//       join on vid.
//   (3) state.mantleRestraintTrace — the engagement instrument: every
//       succession where the restraint filtered >=1 candidate
//       ({d, skipped, picked, fallback, outcomeChanged}).
//   (4) dayHash chains — the det-gate: the control arm must reproduce the
//       committed re-stage control corpus hashes byte-identically
//       (evidence/2026-10-23/perseed-vetrestage/control-*-s<seed>.json).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-23/perseed-mantlerestraint/<arm>-<policytag>-s<seed>.json.
// The per-seed anchorCommit field is the #793 check.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 \
//   MR=1 POLICY=lead SEEDS=65511,65512 node scripts/mantlerestraint-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VS = require(path.join(REPO, 'scripts', 'policies', 'vetrestage'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

// Pinned-substrate env guard (mantlerestraint namespace).
function checkEnv() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
  for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'SURPLUSFEED', 'VGEAR', 'WAVE4ENGAGE', 'VETBENCH', 'SCHOLARDIST', 'VETRESTAGE']) {
    if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
  }
  const POLICY = process.env.POLICY || 'lead';
  if (POLICY !== 'lead' && POLICY !== 'belong') { console.error('SWEEP STOP: POLICY must be lead|belong.'); process.exit(2); }
  const MR = process.env.MR || '0';
  if (MR !== '0' && MR !== '1') { console.error('SWEEP STOP: MR must be 0|1.'); process.exit(2); }
  if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }
  return { POLICY, MR };
}
const { POLICY, MR } = checkEnv();
if (MR === '1') process.env.MANTLERESTRAINT = '1'; else delete process.env.MANTLERESTRAINT;

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-mantlerestraint');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const ARM = MR === '1' ? 'armed' : 'control';
function policyFor() {
  const base = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return VS.substrateFor(base); // identical both arms: the ONE delta is MANTLERESTRAINT
}
function fileTag() {
  const tag = POLICY === 'belong' ? 'belongfeast' : 'leadfeast';
  return `${ARM}-${tag}${MR === '1' ? '-mantlerestraint' : ''}`;
}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed) {
  const policy = policyFor();
  const { Game } = await loadGame({ seed, mode: 'mantlerestraint', fullTelemetry: false });
  const t = { window: [], deathRecs: [], fightStarts: [], instrumentErrors: [] };
  const uninstall = WS.install(Game, t);

  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  const result = await quietLog(async () => { return await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });

  let winDay = null, winPath = null;
  try {
    if (Game.won) {
      winDay = gday(Game);
      try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    }
  } catch (e) {}
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};

  // (1) waveKillLog read DIRECTLY — the autopsy method.
  let waveKillLog = [];
  let waveKillLogCapped = false;
  try {
    const log = (st.waveKillLog || []);
    waveKillLogCapped = log.length >= 1000;
    waveKillLog = log.map(e => ({
      d: (e && e.d) | 0, mid: e && e.mid, w: (e && e.w) | 0,
      by: e && e.by, via: e && e.via, trick: e && e.trick,
    }));
  } catch (e) { t.instrumentErrors.push('waveKillLog.read: ' + String((e && e.message) || e)); }

  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}

  // (2) Death rows (lesson #760 autopsy grade).
  let liveDeaths = [];
  try { liveDeaths = (result.samples && result.samples.deaths) || []; } catch (e) {}
  const liveByKey = {};
  for (const d of liveDeaths) {
    const k = [(d.day | 0), String(d.who || ''), String(d.cause || '')].join('|');
    if (!(k in liveByKey)) liveByKey[k] = !!d.player;
  }
  const deathRows = t.deathRecs.map(rec => {
    let real = null;
    try { real = WS.diedForReal(Game, rec.who); } catch (e) {}
    const k = [(rec.day | 0), String(rec.who || ''), String(rec.cause || '')].join('|');
    const repaired = (k in liveByKey) ? liveByKey[k] : null;
    let channel = 'other', why = '';
    try {
      const monsterNames = WS.monsterNameSet(Game);
      const cls = WS.classifyDeath(rec.cause, rec.ctx, monsterNames);
      channel = cls[0]; why = cls[1];
    } catch (e) {}
    return {
      day: rec.day, who: rec.who, kind: rec.kind, cause: rec.cause,
      player: rec.player, playerRepaired: repaired, real,
      channel, channelWhy: why, wave: rec.wave,
    };
  });

  // (3) The mantle-restraint trace (the engagement instrument).
  let mrTrace = [];
  try { mrTrace = (st.mantleRestraintTrace || []).slice(); } catch (e) { t.instrumentErrors.push('mrTrace.read: ' + String((e && e.message) || e)); }

  // Wall numbers.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // defer5 co-satisfaction probe (secondary): max simultaneous living wave-4+ killers
  let vetsMax = 0;
  try {
    const byVid = {};
    for (const e of waveKillLog) {
      if ((e.w | 0) >= 4 && e.by) { byVid[e.by] = byVid[e.by] || []; byVid[e.by].push(e.d | 0); }
    }
    vetsMax = Object.keys(byVid).length; // distinct blooded vids this run (upper bound proxy)
  } catch (e) {}

  const out = {
    seed, arm: ARM, policyId: fileTag(),
    instrument: 'windowstay-window-layer+death-capture + direct waveKillLog read + mantleRestraintTrace',
    substrate: 'VS.substrateFor(' + (POLICY === 'belong' ? 'belongfeast' : 'leadfeast') + ') — non-seat long substrate + ARMORYDRIVE=1 (identical both arms)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1' + (MR === '1' ? ' MANTLERESTRAINT=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    winDay, winPath,
    deaths, nDeathRows: deathRows.length,
    deathRows,
    scholarVid,
    nWaveKillLog: waveKillLog.length, waveKillLogCapped,
    waveKillLog,
    mrTrace, nMrTrace: mrTrace.length,
    vetsDistinct: vetsMax,
    nWindowTraceDays: t.window.length,
    window: t.window,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  fs.writeFileSync(path.join(EVID, `${fileTag()}-s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return {
    seed, arm: ARM, policy: POLICY,
    w4kills: waveKillLog.filter(e => e.w >= 4).length,
    mrSkips: mrTrace.length, deaths: deathRows.length, days: result.days,
  };
}

(async () => {
  const rows = [];
  for (const s of SEEDS) {
    const r = await oneRun(s);
    rows.push(r);
    console.log(JSON.stringify(r));
  }
  console.log('MANTLERESTRAINT-SWEEP-DONE ' + JSON.stringify({ arm: ARM, policy: POLICY, seeds: SEEDS, anchor: ANCHOR }));
})().catch(e => { console.error('SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
