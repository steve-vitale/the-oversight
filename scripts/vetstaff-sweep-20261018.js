#!/usr/bin/env node
// vetstaff-sweep-20261018.js — sim-vetstaff-a pilot sweep (2026-10-18).
//
// PILOT of the vetstaff blood-list staffing layer (scripts/policies/
// vetstaff.js), axis scale-onramp. 8 fresh seeds x {leadfeast, belongfeast}
// x {armed, control} = 32 runs, 180d death-aware.
//
// INSTRUMENT: the readconfirm pure round-1 instrument, exactly:
// loadGame({seed, mode, fullTelemetry:false}) + scripts/policies/tribfloor
// leadfeast/belongfeast + runDays({days:180, manifest:undefined,
// sampleEvery:30}).
//
// TWO ARMS against ONE shared fresh-seed set:
//   ARM=armed   — VETSTAFF=1 (blood-list staffing on).
//   ARM=control — VETSTAFF unset (pure tribfloor base; the det-gate pins
//                 the layer to byte-identical delegation when off).
//
// READINESS CENSUS: Game.sleep wrapped (read-only) for the daily {day, uw,
// st, legs, short} snapshot; policy.daily wrapped once to stash ctx (read
// after runDays — the wrapper adds no game-state writes). Both arms get the
// identical wrapper, so the comparison stays fair.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-vetstaff/<LABEL>/ and prints a summary.
// No timestamps or timings are written, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   ARM=armed SEEDS=58101,58102 LABEL=armed \
//   node scripts/vetstaff-sweep-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
// POST-KILL INFO-SKIP: the vetstaff layer was deleted per the kill protocol
// (NO-GO on the binding primary, 2026-10-18). Kept as historical record;
// exit 0 instead of crashing on the missing module.
if (!fs.existsSync(path.join(__dirname, 'policies', 'vetstaff.js'))) {
  console.log('INFO-SKIP: vetstaff-sweep-20261018.js — layer deleted per kill protocol (NO-GO primary 2026-10-18).');
  process.exit(0);
}
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const VS = require(path.join(REPO, 'scripts', 'policies', 'vetstaff'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = process.env.ARM || 'armed';
if (ARM !== 'armed' && ARM !== 'control') { console.error('SWEEP STOP: ARM must be armed|control.'); process.exit(2); }
// ARM=armed sets VETSTAFF=1 in-process; control deletes it (gate off).
if (ARM === 'armed') process.env.VETSTAFF = '1'; else delete process.env.VETSTAFF;
if (VS.vetstaffOn() !== (ARM === 'armed')) { console.error('SWEEP STOP: vetstaffOn() disagrees with ARM.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [58101, 58102, 58103, 58104, 58105, 58106, 58107, 58108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const LABEL = process.env.LABEL || ARM;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-vetstaff', LABEL);
fs.mkdirSync(EVID, { recursive: true });

function policyFor(policyId) {
  return policyId === 'leadfeast' ? VS.vetstaffLead : VS.vetstaffBelong;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'vetstaff', fullTelemetry: false });

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
  // Stash the policy ctx (read after runDays; the wrapper writes nothing).
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) { try { G.__vsctx = ctx; } catch (e) {} return policy.daily(G, ctx); },
  });

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.sleep = origSleep;
  let vsctx = {};
  try { vsctx = Game.__vsctx || {}; } catch (e) {}

  const st = Game.state || {};
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}
  let scholarVid = null;
  try { scholarVid = Game.villagerId || null; } catch (e) {}

  // Deferral-day census on the ARM's bar.
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

  // Death-cause shares (live-captured by the harness).
  const deathCauses = {};
  let playerDeaths = 0, scholarCombatDeaths = 0, starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const c = String((d && d.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
      if (d && d.player) {
        playerDeaths++;
        if (['combat', 'monster', 'ambush'].includes(c)) scholarCombatDeaths++;
      }
      if (/starv/i.test(c)) starveDeaths++;
    }
  } catch (e) {}

  // Veteran census from waveKillLog: wave-3+ kills {d, by, w}; villager
  // (non-scholar) kills keyed on `by` vs the scholar vid — NOT `via`
  // (finding: via='player' mis-tags on villager kills).
  let w3Kills = 0, w3VillagerKills = 0;
  const killers = new Set();
  try {
    for (const e of (st.waveKillLog || [])) {
      if (!e || ((e.w | 0) < 3)) continue;
      w3Kills++;
      if (e.by) killers.add(e.by);
      if (e.by && e.by !== scholarVid) w3VillagerKills++;
    }
  } catch (e) {}

  const out = {
    seed, policyId, arm: ARM, label: LABEL,
    substrate: 'pure round-1 (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1, no vetrel, no vetblood)',
    anchorCommit: process.env.ANCHOR || 'unknown',
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    unlockDay4, deferralDays4, binding,
    demandVeterans: demandV, firstVetDay, maxVets, endVets,
    w3Kills, w3Killers: killers.size, w3VillagerKills,
    deathCauses, playerDeaths, scholarCombatDeaths, starveDeaths,
    // vetstaff layer telemetry (from ctx; control runs report zeros)
    vsHunts: vsctx.vetstaffHunts | 0,
    vsHuntLegs: vsctx.vetstaffHuntLegs | 0,
    vsHuntEngaged: vsctx.vetstaffHuntEngaged | 0,
    vsHuntFights: vsctx.vetstaffHuntFights | 0,
    vsStaff: vsctx.vetstaffStaff | 0,
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
        console.log(`done ${policyId} s${seed}: wave${r.maxWave} firstVet=${r.firstVetDay} w3v=${r.w3VillagerKills} vsH=${r.vsHunts}/staff=${r.vsStaff} national=${r.national} days=${r.days} (${r.endReason})`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, arm: ARM, label: LABEL, error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const w4 = ok.filter(r => r.wave4).length;
  const nat = ok.filter(r => r.national).length;
  const tab = ok.filter(r => r.table).length;
  const won = ok.filter(r => r.won).length;
  const prod = ok.filter(r => r.firstVetDay != null);
  const fvd = prod.map(r => r.firstVetDay).sort((a, b) => a - b);
  const medFvd = fvd.length ? fvd[Math.floor(fvd.length / 2)] : null;
  const days = ok.map(r => r.days).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  const hun = ok.filter(r => (r.vsHunts | 0) >= 1).length;
  const dc = {};
  for (const r of ok) for (const [k, v] of Object.entries(r.deathCauses || {})) dc[k] = (dc[k] || 0) + v;
  const summary = {
    arm: ARM, label: LABEL, n: ok.length, errors: rows.length - ok.length,
    wave4: w4, national: nat, table: tab, won,
    everVeteran: prod.length, medianFirstVetDay: medFvd,
    engagementHunts: hun,
    medianDays: med, deathCauses: dc,
  };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
