#!/usr/bin/env node
// sweep-vetwindow-20261022.js — sim-vetwindow PILOT sweep.
//
// 8 FRESH seeds (65541-65548, filename-criterion verified) x {leadfeast,
// belongfeast} x {control, vetwindow} = 32 configs, 180d death-aware,
// paired identical seeds, on the NON-SEAT long substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   (no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
//   TWOVETS/VGEAR/WAVE4ENGAGE)
//
//   control   = VW.substrateFor(base): the armorydrive stack
//               (ARMORYDRIVE=1, VETWINDOW unset)
//   vetwindow = VW.armedFor(base):    the restraint OUTSIDE the same stack
//               (ARMORYDRIVE=1, VETWINDOW=1)
//
// Composition honesty pinned by scripts/test-vetwindow-20261022.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (killdisc-instrument-20261021.js) + daily
// w5-readiness census + ad/vw layer counters (counts only) + daily bearer
// census (kill-time attribution) + wave-4 fight damage tables.
//
// Writes per-seed JSONs ONCE to evidence/2026-10-22/perseed-vetwindow/
// and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=control SEEDS=65541,65542 node scripts/sweep-vetwindow-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 VETWINDOW=1 ARM=vetwindow SEEDS=65541,65542 node scripts/sweep-vetwindow-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VW = require(path.join(REPO, 'scripts', 'policies', 'vetwindow'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT SUBSTRATE guard (the pinned substrate + KILLDISC v2 + ARMORYDRIVE).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vetwindow') { console.error('SWEEP STOP: ARM must be control|vetwindow.'); process.exit(2); }
if (ARM === 'vetwindow' && process.env.VETWINDOW !== '1') { console.error('SWEEP STOP: VETWINDOW=1 required for ARM=vetwindow.'); process.exit(2); }
if (ARM === 'control' && ('VETWINDOW' in process.env)) { console.error('SWEEP STOP: VETWINDOW must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65541, 65542, 65543, 65544, 65545, 65546, 65547, 65548]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-vetwindow');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = VW.normBase(base); return ARM === 'vetwindow' ? VW.armedFor(t) : VW.substrateFor(t); }
function policyTag(base) { return VW.normBase(base) + (ARM === 'vetwindow' ? '-vetwindow' : ''); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

function writeFileFlap(fp, data) {
  let last = null;
  for (let i = 0; i < 12; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      last = e;
      if (!/EPERM/i.test(String((e && e.code) || '') + String((e && e.message) || ''))) throw e;
      execSync('sleep 20');
    }
  }
  throw last;
}

async function oneRun(seed, base) {
  const policy = policyFor(base);
  const tag = policyTag(base);
  const { Game } = await loadGame({ seed, mode: 'vetwindow', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  const w5census = [];
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, short: r ? (r.short || []).slice() : null });
        } catch (e) { t.instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  const oDaily = policy.daily;
  const bearerByDay = {};
  let lastCtx = null;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    return oDaily(G, ctx);
  } }) : policy;

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { uninstallKD(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0, exiled = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  const wkl = (st.waveKillLog || []).slice();
  const w4 = wkl.filter(e => e && (e.w | 0) === 4);
  const w4villagers = new Set();
  let w4scholarKills = 0;
  for (const e of w4) {
    const bearerAtKill = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
    if (e.by === bearerAtKill || e.by === 'player') w4scholarKills++;
    else if (e.by) w4villagers.add(e.by);
  }

  let w5vetsEnd = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    w5vetsEnd = (r && r.veterans) | 0;
  } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const c of w5census) if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0; } catch (e) {}
  const deathCauses = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  let villagerCombatDeaths = 0, starvationDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || '');
      if (/starv/i.test(c)) starvationDeaths++;
      if (!dd.player && /combat|fight|monster|wound|bleed|titan/i.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const vw = {};
  try {
    for (const k of ['vwWindowDays', 'vwRestrainedFights', 'vwFlees', 'vwFleeWalks', 'vwFleeHeld', 'vwFleeFallback']) {
      if (lastCtx && lastCtx[k] != null) vw[k] = lastCtx[k];
    }
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+w5census+killtime-bearer+vetwindow-counters',
    substrate: 'non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE)' + (ARM === 'vetwindow' ? ' +VETWINDOW=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    w4kills: w4.length,
    w4distinctVillagers: [...w4villagers].map(v => ({ vid: v, name: nameOf(Game, v) })),
    nW4Villagers: w4villagers.size,
    w4scholarKills,
    vw,
    instrumentErrors: t.instrumentErrors,
    deathCauses, villagerCombatDeaths, starvationDeaths,
    w5censusDays: w5census.length,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const fp = path.join(EVID, `${ARM}-${VW.normBase(base)}${ARM === 'vetwindow' ? '-vetwindow' : ''}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      console.log(`RUN seed=${seed} base=${base} arm=${ARM}`);
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`  done: days=${r.days} maxWave=${r.maxWave} w5vetsMax=${r.w5vetsMax} wave5=${r.wave5} vw=${JSON.stringify(r.vw)} (${Math.round((Date.now() - t0) / 1000)}s)`);
      } catch (e) {
        console.log(`  ERROR seed=${seed} base=${base}: ${(e && e.message) || e}`);
      }
    }
  }
  console.log(`SWEEP DONE arm=${ARM}: ${rows.length} runs`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(1); });
