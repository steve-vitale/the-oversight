#!/usr/bin/env node
// sweep-vetbench-20261022.js — sim-vetbench PILOT sweep.
//
// 8 FRESH seeds (65551-65558, filename-criterion verified) x {leadfeast,
// belongfeast} x {control, vetbench} = 32 configs, 180d death-aware,
// paired identical seeds, on the NON-SEAT long substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   (no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/
//   TWOVETS/VGEAR/WAVE4ENGAGE/VETWINDOW)
//
//   control  = VB.substrateFor(base): the armorydrive stack
//              (ARMORYDRIVE=1, VETBENCH unset)
//   vetbench = VB.armedFor(base):    the bench OUTSIDE the same stack
//              (ARMORYDRIVE=1, VETBENCH=1)
//
// Composition honesty pinned by scripts/test-vetbench-20261022.js (all
// gates GREEN) BEFORE this sweep runs.
//
// Instruments: KILLDISC=1 v2 (killdisc-instrument-20261021.js) + daily
// w5-readiness census + vetbench counters (counts only) + per-day
// window/veteran-set trace (for the primary: veteran combat deaths on
// live-window days) + unmet-raider say-line capture (the haven-breach
// guardrail proxy) + kill-time bearer census.
//
// Writes per-seed JSONs ONCE to evidence/2026-10-22/perseed-vetbench/
// and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARM=control SEEDS=65551,65552 node scripts/sweep-vetbench-20261022.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 VETBENCH=1 ARM=vetbench SEEDS=65551,65552 node scripts/sweep-vetbench-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const VB = require(path.join(REPO, 'scripts', 'policies', 'vetbench'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));

// NON-SEAT SUBSTRATE guard (the pinned substrate + KILLDISC v2 + ARMORYDRIVE).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'VETWINDOW']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (KD.instrumentOn() !== true) { console.error('SWEEP STOP: KILLDISC instrument off despite KILLDISC=1.'); process.exit(2); }

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'vetbench') { console.error('SWEEP STOP: ARM must be control|vetbench.'); process.exit(2); }
if (ARM === 'vetbench' && process.env.VETBENCH !== '1') { console.error('SWEEP STOP: VETBENCH=1 required for ARM=vetbench.'); process.exit(2); }
if (ARM === 'control' && ('VETBENCH' in process.env)) { console.error('SWEEP STOP: VETBENCH must be unset for ARM=control.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65551, 65552, 65553, 65554, 65555, 65556, 65557, 65558]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-vetbench');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { const t = VB.normBase(base); return ARM === 'vetbench' ? VB.armedFor(t) : VB.substrateFor(t); }
function policyTag(base) { return VB.normBase(base) + (ARM === 'vetbench' ? '-vetbench' : ''); }

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
  const { Game } = await loadGame({ seed, mode: 'vetbench', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstallKD = KD.install(Game, t);

  // Per-day window/veteran-set trace (the primary's join table).
  const windowTrace = [];
  // Unmet-raider say-lines (haven-breach guardrail proxy).
  let unmetRaiderNights = 0;
  const oSay = Game.say ? Game.say.bind(Game) : null;

  const oDaily = policy.daily;
  const bearerByDay = {};
  let lastCtx = null;
  const wrappedPolicy = oDaily ? Object.assign({}, policy, { daily(G, ctx) {
    lastCtx = ctx;
    try { bearerByDay[(G.state.scholar || {}).day || 0] = G.villagerId || null; } catch (e) {}
    const r = oDaily(G, ctx);
    try {
      const day = ((G.state || {}).scholar || {}).day || 0;
      windowTrace.push({ day, live: VB.vbWindowLive(G) ? 1 : 0, vets: VB.vbVetVids(G).slice().sort() });
    } catch (e) { t.instrumentErrors.push('windowTrace: ' + String((e && e.message) || e)); }
    return r;
  } }) : policy;

  if (oSay) {
    Game.say = function (s) {
      try {
        const str = String(s || '');
        if (/Nobody met .*still out there at the treeline/.test(str)) unmetRaiderNights++;
      } catch (e) {}
      return oSay(s);
    };
  }

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrappedPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (oSay) Game.say = oSay; } catch (e) {}
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

  // PRIMARY join: veteran combat deaths on live-window days.
  const vetSetByDay = {};
  for (const w of windowTrace) vetSetByDay[w.day] = new Set(w.vets);
  const liveDays = new Set(windowTrace.filter(w => w.live).map(w => w.day));
  const combatRe = /combat|fight|monster|wound|bleed|titan|mauled/i;
  const windowVetDeaths = [];
  for (const dd of (result.samples.deaths || [])) {
    const day = dd.day | 0;
    if (!liveDays.has(day)) continue;
    const set = vetSetByDay[day];
    if (!set || !set.has(dd.who)) continue;
    if (!combatRe.test(String(dd.cause || ''))) continue;
    windowVetDeaths.push({ day, who: dd.who, name: nameOf(Game, dd.who), cause: dd.cause, player: !!dd.player });
  }

  let w5vetsEnd = 0;
  try {
    const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
    w5vetsEnd = (r && r.veterans) | 0;
  } catch (e) {}
  let w5vetsMax = w5vetsEnd;
  try { for (const w of windowTrace) { const n = (w.vets || []).length; if (n > w5vetsMax) w5vetsMax = n; } } catch (e) {}
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
      if (!dd.player && combatRe.test(c)) villagerCombatDeaths++;
    }
  } catch (e) {}

  const vb = {};
  try {
    for (const k of ['vbWindowDays', 'vbBenched', 'vbBenchDays', 'vbReleased', 'vbEngaged', 'vbMusterCovered', 'vbMineMusterHeld']) {
      if (lastCtx && lastCtx[k] != null) vb[k] = lastCtx[k];
    }
  } catch (e) {}

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'killdisc-v2+windowtrace+vetbench-counters+unmetraider-sayline+killtime-bearer',
    substrate: 'non-seat long substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; no SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/TWOVETS/VGEAR/WAVE4ENGAGE/VETWINDOW)' + (ARM === 'vetbench' ? ' +VETBENCH=1' : ''),
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won, exiled,
    w5vetsEnd, w5vetsMax,
    days: result.days, gameDays, endReason: result.endReason,
    windowLiveDays: liveDays.size,
    nWindowVetDeaths: windowVetDeaths.length,
    windowVetDeaths,
    vb,
    unmetRaiderNights,
    instrumentErrors: t.instrumentErrors,
    deathCauses, villagerCombatDeaths, starvationDeaths,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const base of BASES) {
      const fp = path.join(EVID, `${ARM}-${VB.normBase(base)}${ARM === 'vetbench' ? '-vetbench' : ''}-s${seed}.json`);
      if (fs.existsSync(fp)) { console.log(`SKIP (exists): ${path.basename(fp)}`); continue; }
      console.log(`RUN seed=${seed} base=${base} arm=${ARM}`);
      const t0 = Date.now();
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`  done: days=${r.days} maxWave=${r.maxWave} w5vetsMax=${r.w5vetsMax} wave5=${r.wave5} winDays=${r.windowLiveDays} vetDeaths=${r.nWindowVetDeaths} vb=${JSON.stringify(r.vb)} (${Math.round((Date.now() - t0) / 1000)}s)`);
      } catch (e) {
        console.log(`  ERROR seed=${seed} base=${base}: ${(e && e.message) || e}`);
      }
    }
  }
  console.log(`SWEEP DONE arm=${ARM}: ${rows.length} runs`);
})().catch(e => { console.error('SWEEP CRASH:', e && e.stack || e); process.exit(1); });
