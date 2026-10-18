#!/usr/bin/env node
// test-readconfirm-sweep.js — sim-readconfirm fresh-seed CONFIRM (2026-10-18).
//
// CONFIRM of Steve's recalibrated wave-4/5 readiness bar (src/js/standing.js
// standingCfg().readyDemand: w4 {4@P15,5,3,2} -> {3@P10,5,3,1},
// w5 {6@P20,7,4,3} -> {4@P15,6,3,2}), axis scale-onramp.
//
// INSTRUMENT: scripts/test-rebuildaudit-sweep.js's env/policies EXACTLY
// (the instrument that measured the collapse — 180d death-aware, exact
// round-1 env): loadGame({seed, mode, fullTelemetry:false}) +
// scripts/policies/tribfloor leadfeast/belongfeast + runDays({days:180,
// manifest:undefined, sampleEvery:30}) + the 8-flag substrate guard.
//
// TWO ARMS against ONE shared fresh-seed set (SEEDS env, default 52101-52108):
//   ARM=armed   — pristine current code (the NEW bar). The confirm.
//   ARM=control — ZERO game-code changes. Game.standingCfg is monkey-patched
//                AFTER loadGame, BEFORE runDays, to return the OLD
//                readyDemand for control runs only:
//                  4: {armored:4, armorP:15, armed:5, tricks:3, veterans:2}
//                  5: {armored:6, armorP:20, armed:7, tricks:4, veterans:3}
//                waveCombatReadiness() reads standingCfg() fresh at every call
//                site (standing.js:119,173,213,349,360,444), so the patch
//                takes effect everywhere the gate reads. Zero-trace: nothing
//                written to the repo, nothing in game code changed. Each run
//                loadGames fresh, so the patch cannot leak between arms.
//
// READINESS CENSUS: Game.sleep is wrapped (read-only) to record a daily
// snapshot {day, unlockedWave, standingTotal, waveCombatReadiness(4) legs +
// short list}. All three reads are pure state reads (no RNG, no writes),
// so the census cannot perturb the sim — the det-gate pins this.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-readconfirm/<LABEL>/ and prints a summary.
// No timestamps or timings are written, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   ARM=armed SEEDS=52101,52102 LABEL=armed \
//   node scripts/test-readconfirm-sweep.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = process.env.ARM || 'armed';
if (ARM !== 'armed' && ARM !== 'control') { console.error('SWEEP STOP: ARM must be armed|control.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [52101, 52102, 52103, 52104, 52105, 52106, 52107, 52108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const LABEL = process.env.LABEL || ARM;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-readconfirm', LABEL);
fs.mkdirSync(EVID, { recursive: true });

// The OLD bar — control runs only, monkey-patched at runtime (see header).
const OLD_DEMAND = {
  4: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 },
  5: { armored: 6, armorP: 20, armed: 7, tricks: 4, veterans: 3 },
};

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'readconfirm', fullTelemetry: false });

  // CONTROL ARM: zero-trace runtime patch of the readiness bar.
  if (ARM === 'control') {
    const origCfg = Game.standingCfg.bind(Game);
    Game.standingCfg = function () {
      const c = origCfg();
      c.readyDemand = OLD_DEMAND;
      return c;
    };
  }

  // Read-only daily readiness census (header: cannot perturb the sim).
  const census = [];
  const origSleep = Game.sleep;
  Game.sleep = function () {
    try {
      const day = ((Game.state || {}).scholar || {}).day || 0;
      const uw = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 1;
      let st = null;
      try { st = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) {}
      let rd = null;
      try { rd = (typeof Game.waveCombatReadiness === 'function') ? Game.waveCombatReadiness(4) : null; } catch (e) {}
      census.push({
        day, uw, st,
        legs: rd ? { armored: rd.armored | 0, armed: rd.armed | 0, tricks: rd.tricks | 0, veterans: rd.veterans | 0 } : null,
        short: rd ? (rd.short || []).slice() : null,
      });
    } catch (e) {}
    return origSleep.apply(this, arguments);
  };

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.sleep = origSleep;

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Deferral-day census on the ARM's bar: days where standing >= t4(100)
  // but the wave-4 door is still shut. Binding legs counted per leg-day.
  const t4 = 100;
  let unlockDay4 = null, deferralDays4 = 0;
  const binding = { armor: 0, weapons: 0, tricks: 0, veterans: 0 };
  let demandV = null, firstVetDay = null, maxVets = 0, endVets = 0;
  for (const c of census) {
    if (unlockDay4 === null && c.uw >= 4) unlockDay4 = c.day;
    if (c.st != null && c.st >= t4 && c.uw < 4) {
      deferralDays4++;
      for (const leg of (c.short || [])) if (binding[leg] !== undefined) binding[leg]++;
    }
    if (c.legs) {
      if (demandV === null) { try { demandV = Game.standingCfg().readyDemand[4].veterans | 0; } catch (e) { demandV = 1; } }
      if (firstVetDay === null && (c.legs.veterans | 0) >= demandV) firstVetDay = c.day;
      if ((c.legs.veterans | 0) > maxVets) maxVets = c.legs.veterans | 0;
      endVets = c.legs.veterans | 0;
    }
  }

  // Death-cause shares (live-captured by the harness, independent of the
  // 300-event telemetry ring).
  const deathCauses = {};
  let playerDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const c = String((d && d.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (d && d.player) playerDeaths++;
    }
  } catch (e) {}

  // Veteran census from waveKillLog: wave-3+ kills {d, by, w}.
  let w3Kills = 0;
  const killers = new Set();
  try {
    for (const e of (st.waveKillLog || [])) {
      if (!e || ((e.w | 0) < 3)) continue;
      w3Kills++;
      if (e.by) killers.add(e.by);
    }
  } catch (e) {}

  const out = {
    seed, policyId, arm: ARM, label: LABEL,
    substrate: 'pure round-1 (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1)',
    anchorCommit: process.env.ANCHOR || 'unknown',
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    unlockDay4, deferralDays4, binding,
    demandVeterans: demandV, firstVetDay, maxVets, endVets,
    w3Kills, w3Killers: killers.size,
    deathCauses, playerDeaths,
  };
  const fp = path.join(EVID, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: wave${r.maxWave} u4day=${r.unlockDay4} defer=${r.deferralDays4} national=${r.national} table=${r.table} days=${r.days} (${r.endReason})`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, arm: ARM, label: LABEL, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const w4 = ok.filter(r => r.wave4).length;
  const w5 = ok.filter(r => r.wave5).length;
  const nat = ok.filter(r => r.national).length;
  const tab = ok.filter(r => r.table).length;
  const won = ok.filter(r => r.won).length;
  const days = ok.map(r => r.days).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  const dc = {};
  for (const r of ok) for (const [k, v] of Object.entries(r.deathCauses || {})) dc[k] = (dc[k] || 0) + v;
  const summary = { arm: ARM, label: LABEL, n: ok.length, errors: rows.length - ok.length, wave4: w4, wave5: w5, national: nat, table: tab, won, medianDays: med, deathCauses: dc };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
