#!/usr/bin/env node
// sweep-scholarsurvive-20261020.js — pilot sweep for arm sim-scholarsurvive
// (flesh-out loop run fleshout-20261020T1015Z, axis scale-onramp).
//
// CONTROL vs ARMED on IDENTICAL seeds, pre-seat + windefer substrate (the
// exact w5doormeasure stack, composed never edited):
//   withScholarsurvive(withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (+ SCHOLARSURVIVE=1 for armed).
// The sweep FAILS LOUD unless the env matches exactly.
//
// Horizon: 180d death-aware (dead villages stop simulating), from the
// baseline survival distribution (w5census on this substrate: median 137d).
//
// Corpus: 8 FRESH seeds (64001-64008 — verified zero filename/content hits
// in evidence/ and scripts/) x {leadfeast, belongfeast} x {control, armed}
// = 32 runs. Instrument: daily pure-engine reads + the layer's own
// counters; writes evidence/2026-10-20/perseed-scholarsurvive/<arm>/<policy>/s<seed>.json.
//
// PRIMARY (binding): share of ARMED wave-4 kills (via='player') whose
// killer is alive at +30d post-kill: GO >= 4/8 (baseline E3: 0.10).
// SECONDARY: 2-living-veterans readiness bar (waveCombatReadiness(5))
// met in >= 2/8 runs per policy.
// GUARDRAILS: median survival >= control -10d; no new death modes;
// wave-4 unlocks >= control.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   SCHOLARSURVIVE=0|1 ARM=control|armed \
//   node scripts/sweep-scholarsurvive-20261020.js
//   SMOKE=1 ...        # 2 seeds x both policies, 30d
//   ONLY=leadfeast ... # policy filter
//   SEEDS="64001,64002" DAYS=60 ...
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019'); // policyFor: the landed w5census stack (composed, never edited)
const SS = require('./policies/scholarsurvive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (scholarsurvive substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (pre-seat substrate).`); process.exit(2); }
}
const ARM = process.env.ARM || '';
if (ARM !== 'control' && ARM !== 'armed') { console.error('SWEEP STOP: ARM=control|armed is required.'); process.exit(2); }
if (ARM === 'armed' && process.env.SCHOLARSURVIVE !== '1') { console.error('SWEEP STOP: armed requires SCHOLARSURVIVE=1.'); process.exit(2); }
if (ARM === 'control' && process.env.SCHOLARSURVIVE === '1') { console.error('SWEEP STOP: control must run with SCHOLARSURVIVE unset.'); process.exit(2); }
if (!SW.policyFor) { console.error('SWEEP STOP: probe-w5path policyFor missing.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const SMOKE = process.env.SMOKE === '1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-scholarsurvive', ARM);
fs.mkdirSync(EVID, { recursive: true });

function policyFor(policyId) {
  const base = SW.policyFor(policyId);
  if (ARM === 'armed') return SS.withScholarsurvive(base, `${policyId}-ss`, `${policyId} w5 stack + scholarsurvive (SCHOLARSURVIVE=1)`);
  return base;
}
function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }
function readBars(G, w) {
  try {
    const r = G.waveCombatReadiness ? G.waveCombatReadiness(w) : null;
    return r ? { veterans: r.veterans | 0, demand: (r.demand && r.demand.veterans) | 0, ready: !!r.ready } : null;
  } catch (e) { return null; }
}

// Instrument record: daily pure-engine reads AFTER the base daily.
// Mirrors probe-w5doormeasure's pathRec kill-diffing (append-only log,
// diff by length) plus the veteran-bar live read.
function instRec(G, prev) {
  const day = gday(G);
  const rec = { d: day };
  try { rec.uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0; } catch (e) { rec.uw = 1; }
  try { rec.scholarVid = G.villagerId || null; } catch (e) { rec.scholarVid = null; }
  try { rec.alive = !!(G.state && G.state.scholar && !G.state.scholar.dead); } catch (e) { rec.alive = false; }
  rec.r5 = readBars(G, 5);
  rec.r4 = readBars(G, 4);
  try {
    const log = (G.state && G.state.waveKillLog) || [];
    const prevLen = (prev && (prev._logLen | 0)) || 0;
    const newK = [];
    for (let i = prevLen; i < log.length; i++) {
      const e = log[i];
      if (!e) continue;
      newK.push({ mid: e.mid || null, w: (e.w | 0) || 0, by: e.by || null, ch: String(e.via || 'unknown') });
    }
    rec.newKills = newK;
    rec._logLen = log.length;
  } catch (e) { rec.newKills = []; rec._logLen = 0; }
  return rec;
}

async function runOne(seed, policyId) {
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'scholarsurvive', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
  const recs = [];
  const hashes = [];
  let prev = null;
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const rec = instRec(G, prev);
      prev = rec;
      recs.push(rec);
      hashes.push(G.state.scholar.day + ':' + dayHash(Game));
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  const deaths = {};
  const deathList = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathList.push({ day: d.day | 0, who: String(d.who || ''), player: !!d.player, kind: String(d.kind || ''), cause: String(d.cause || '') });
    }
  } catch (e) {}
  let maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
  } catch (e) {}
  // Layer counters (armed only; control has none).
  const ss = {};
  if (runCtx) for (const k of Object.keys(runCtx)) if (/^ss/.test(k)) ss[k] = runCtx[k];
  // Veteran-bar max over the run (the secondary's live read).
  let vets5max = 0, vets5demand = 2;
  for (const r of recs) {
    if (r.r5 && (r.r5.veterans | 0) > vets5max) vets5max = r.r5.veterans | 0;
    if (r.r5 && (r.r5.demand | 0)) vets5demand = r.r5.demand | 0;
  }
  const out = {
    arm: ARM, seed, policyId, days: daysNow(), gameDays,
    endReason: result.endReason || null, maxWave, won: !!result.won,
    national: !!(result.scaleMax === 'national' || result.scaleMax === 'global'),
    deaths, deathList, ss, vets5max, vets5demand,
    recs, hashes,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out) + '\n');
  return out;
}

(async () => {
  const seeds = SMOKE ? SEEDS.slice(0, 2) : SEEDS;
  const days = SMOKE ? 30 : daysNow();
  const saveDays = process.env.DAYS;
  if (SMOKE) process.env.DAYS = '30';
  let done = 0, errors = 0;
  for (const policyId of POLICIES) {
    for (const seed of seeds) {
      try {
        const out = await runOne(seed, policyId);
        done++;
        console.log(`[${ARM}] ${policyId} s${seed}: days=${out.gameDays} maxWave=${out.maxWave} end=${out.endReason} vets5max=${out.vets5max} ssKills=${out.ss.ssKillsDetected || 0} ssDis=${out.ss.ssDisengages || 0} ssRest=${out.ss.ssRests || 0}`);
      } catch (e) {
        errors++;
        console.error(`[${ARM}] ${policyId} s${seed}: ERROR ${e && e.message}`);
      }
    }
  }
  if (saveDays === undefined) delete process.env.DAYS; else process.env.DAYS = saveDays;
  console.log(`done ${done}, errors ${errors}`);
  if (errors) process.exit(1);
})().catch(e => { console.error(e.stack); process.exit(1); });
