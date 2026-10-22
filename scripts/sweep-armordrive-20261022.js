#!/usr/bin/env node
// sweep-armordrive-20261022.js — sim-armor-drive pilot sweep.
//
// 8 FRESH seeds (65551-65558) x {lead,belong} x {control,drive} = 32
// configs, 180d death-aware, paired identical seeds, on the pinned non-seat
// long substrate:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   KILLDISC=1 ARMORYDRIVE=1
//   (VETREL/REPOSITION/VGEAR unset)
//
// Policies both legs: AD.armedFor('lead'|'belong') — the landed weapons
// baseline. The ONLY difference between legs is the game code under test:
// run this script with REPO=<tree>:
//   control leg: REPO=<pristine base worktree>  (no armor-drive verbs)
//   drive leg:   REPO=<this tree>               (armorDriveLive verbs on)
// Identical seeds, identical env, identical policies -> §15 panel-valid.
//
// Instruments (read-only, call-through): daily w5-readiness census via
// wrapped Game.sleep; war-loot call/grant counters via wrapped
// Game.rollWarLoot; end-run armor census (P>=15 pieces village-wide).
//
// Writes per-seed JSONs ONCE, on purpose, to evidence/2026-10-22/
// perseed-armordrive/ and prints a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 ARM=control SEEDS=65551,65552 \
//   REPO=/home/hatch/workspace/worktrees/sim-armor-drive-ctrl \
//   node scripts/sweep-armordrive-20261022.js
//   ... ARM=drive REPO=/home/hatch/workspace/worktrees/sim-armor-drive ...
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

// Substrate guards.
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required.'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEAR', 'WAVE4ENGAGE']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset.`); process.exit(2); }
}

const ARM = process.env.ARM || 'control';
if (ARM !== 'control' && ARM !== 'drive') { console.error('SWEEP STOP: ARM must be control|drive.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [65551, 65552, 65553, 65554, 65555, 65556, 65557, 65558]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const BASES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-armordrive');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(base) { return AD.armedFor(AD.normBase(base)); }
function policyTag(base) { return AD.normBase(base); }

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

// EPERM-flap-hardened write: node writeFileSync flaps EPERM in long
// windows; shell writes succeed. Retry EPERM-only with backoff.
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
  const { Game } = await loadGame({ seed, mode: 'armordrive', fullTelemetry: false });

  // Daily w5-readiness census (call-through).
  const w5census = [];
  const instrumentErrors = [];
  let uninstallW5 = null;
  try {
    const oSleep = Game.sleep ? Game.sleep.bind(Game) : null;
    if (oSleep) {
      Game.sleep = function (...a) {
        try {
          const r = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
          w5census.push({ day: ((Game.state || {}).scholar || {}).day || 0,
            veterans: r ? (r.veterans | 0) : null, armored: r ? (r.armored | 0) : null,
            ready: r ? !!r.ready : null, short: r ? (r.short || []).slice() : null,
            gate: null });
          try { w5census[w5census.length - 1].gate = Game.armorDriveLive ? !!Game.armorDriveLive() : null; }
          catch (e2) {}
        } catch (e) { instrumentErrors.push('w5census: ' + String((e && e.message) || e)); }
        return oSleep(...a);
      };
      uninstallW5 = () => { try { Game.sleep = oSleep; } catch (e) {} };
    }
  } catch (e) {}

  // War-loot counters (call-through; counting only, no RNG change).
  const war = { calls: 0, hits: 0, ids: [] };
  let uninstallWar = null;
  try {
    if (typeof Game.rollWarLoot === 'function') {
      const oRoll = Game.rollWarLoot.bind(Game);
      Game.rollWarLoot = function (...a) {
        war.calls++;
        const r = oRoll(...a);
        if (r) { war.hits++; war.ids.push(r); }
        return r;
      };
      uninstallWar = () => { try { Game.rollWarLoot = oRoll; } catch (e) {} };
    }
  } catch (e) {}

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { if (uninstallW5) uninstallW5(); } catch (e) {}
  try { if (uninstallWar) uninstallWar(); } catch (e) {}

  const st = Game.state || {};
  const scholarVid = Game.villagerId || null;
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Window + door from the census.
  let w5vetsMax = 0, w5armoredMax = 0, doorOpened = 0, windowDays = 0;
  try {
    for (const c of w5census) {
      if ((c.veterans | 0) > w5vetsMax) w5vetsMax = c.veterans | 0;
      if ((c.armored | 0) > w5armoredMax) w5armoredMax = c.armored | 0;
      if (c.ready) doorOpened = 1;
      if (c.gate) windowDays++;
    }
  } catch (e) {}
  if (maxWave >= 5) doorOpened = 1;
  const windowReached = w5vetsMax >= 2 ? 1 : 0;

  const deathCauses = {};
  let starvationDeaths = 0;
  try {
    for (const dd of (result.samples.deaths || [])) {
      const c = String((dd && dd.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (/starv/i.test(c)) starvationDeaths++;
    }
  } catch (e) {}

  // End-run armor census: P>=15 pieces across the village (worn + carried).
  let armorPieces = 0, armorWorn = 0;
  try {
    const S = (globalThis.Scattering || {});
    const Seq = S.equipment || null;
    const items = Game.data.items || [];
    const isArmor15 = (id) => {
      const d = items.find(x => x && x.id === id);
      return !!(d && d.armor && ((d.armor.protection | 0) >= 15));
    };
    const countItems = (arr) => { for (const it of (arr || [])) { const id = (it && (it.itemId || it.id)) || it; if (typeof id === 'string' && isArmor15(id)) armorPieces++; } };
    for (const rid of ((st.village || {}).roster || [])) {
      if (rid === scholarVid) continue;
      let p = null;
      try { p = Game.vpOf ? Game.vpOf(rid) : (Game.getPerson ? Game.getPerson(rid) : null); } catch (e) {}
      if (!p || p.dead) continue;
      countItems(p.items);
      for (const sl of Object.keys(p.equipped || {})) {
        const e = p.equipped[sl];
        const id = e && e.itemId;
        if (typeof id === 'string' && isArmor15(id)) { armorPieces++; armorWorn++; }
      }
    }
    const s = st.scholar || {};
    countItems(s.inventory);
    for (const sl of Object.keys(s.equipped || {})) {
      const e = s.equipped[sl];
      const id = e && e.itemId;
      if (typeof id === 'string' && isArmor15(id)) { armorPieces++; armorWorn++; }
    }
  } catch (e) { instrumentErrors.push('armorCensus: ' + String((e && e.message) || e)); }

  const out = {
    seed, policy: tag, arm: ARM,
    instrument: 'w5census+warloot-counters+armor-census',
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR unset)',
    anchorCommit: ANCHOR,
    repo: REPO,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    windowReached, w5vetsMax, w5armoredMax, windowDays, doorOpened,
    days: result.days, gameDays, endReason: result.endReason,
    deathCauses, starvationDeaths,
    armorPieces, armorWorn,
    warCalls: war.calls, warHits: war.hits, warIds: war.ids.slice(0, 20),
    instrumentErrors,
  };
  const fp = path.join(EVID, `${ARM}-${tag}-s${seed}.json`);
  writeFileFlap(fp, JSON.stringify(out, null, 1));
  return out;
}

(async function main() {
  const rows = [];
  for (const base of BASES) {
    for (const seed of SEEDS) {
      try {
        const r = await oneRun(seed, base);
        rows.push(r);
        console.log(`done ${ARM} ${r.policy} s${seed}: days=${r.gameDays} end=${r.endReason} win=${r.windowReached} door=${r.doorOpened} war=${r.warHits}/${r.warCalls} armor=${r.armorPieces}(worn ${r.armorWorn})`);
      } catch (e) {
        console.log(`ERROR ${ARM} ${base} s${seed}: ${String((e && e.message) || e)}`);
      }
    }
  }
  const wins = rows.filter(r => r.windowReached).length;
  const doors = rows.filter(r => r.doorOpened).length;
  console.log(`\n${ARM}: ${rows.length} runs, windows=${wins}, doors=${doors}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
