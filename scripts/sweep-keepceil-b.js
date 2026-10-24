#!/usr/bin/env node
// sweep-keepceil-b.js — KEEPCEIL keep-ceiling volume knob sweep
// (sim-keepceil-b, 2026-10-24, axis food-economy, oversight-flesh-out-loop-b).
//
// Lever measurement: KEEPCEIL ∈ {4000,6000,8000} (+ kcoff = KEEPCEIL unset,
// the OFF-identity control) × policies {leadfeast,belongfeast}, seeds
// 9250-9265 (pooled block 1), 100d death-aware, FEASTSCALE_R13=1/
// SEATDRIVE=0, PLENTYDEPRI=0 explicit, DEPOSITGATE=1 explicit (the ceiling
// binds only on DG=1 cells). Instrument: scripts/homecoming-instruments-b.js
// reused UNCHANGED (attachEC): hc brought/kept/deposit/keepRaise/
// keepRaiseEvents per glut-day and per decision, plus rot fresh/preserved,
// freshDays, death causes, wall fields. keepRaise is defined against the
// FIXED 2000 base ceiling, so it stays comparable across KEEPCEIL levels.
//
// PER-SEED SCHEMA:
// {"seed","policy","keepceil":4000|6000|8000|null,"depositgate":1,
//  "plentydepri":0,"daysAlive","villageDays","rotFreshKcal",
//  "rotPreservedKcal","easedKcal","glutDays","freshDaysMedian",
//  "deathCauses":{},"national","table","win","waveReach":[],
//  "medianSurvival":null,
//  "hc":{decisions,tripDecisions,oldDecisions,brought,kept,deposit,spoiled,
//        capStranded,keepRaise,keepRaiseEvents,capDecisions,
//        broughtPerGlutDay,keptPerGlutDay,depositPerGlutDay,
//        keepRaisePerGlutDay,decisionsPerGlutDay,broughtPerDecision,
//        keptPerDecision,depositPerDecision,channelScholarHomecoming},
//  "extra":{endReason,rank,starveDays,starveDeaths,rot100d,ms}}
//
// PRE-REGISTRATION lives in evidence/2026-10-24/sim-keepceil-b.md
// (written BEFORE sweeping per §14).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1 explicit
//   (asserted); SIDE=kc4000|kc6000|kc8000|kcoff; KEEPCEIL explicit per side
//   (kcoff: must be UNSET — asserted); SEEDS=csv POLICY=leadfeast|belongfeast
//   DAYS=100 OUT=<path> PERSEED_DIR=<dir>
//   SIDE=kc4000 POLICY=leadfeast SEEDS=9250,...,9257 node scripts/sweep-keepceil-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachEC, canonCause } = require('./homecoming-instruments-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
if (process.env.PLENTYDEPRI !== '0') {
  console.error('FATAL: PLENTYDEPRI=0 must be explicit (keep channel in isolation; unset = default-ON)');
  process.exit(2);
}
if (process.env.DEPOSITGATE !== '1') {
  console.error('FATAL: DEPOSITGATE=1 must be explicit (ceiling binds only on DG=1 cells)');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'kc6000';
const KC_MAP = { kc4000: '4000', kc6000: '6000', kc8000: '8000', kcoff: undefined };
if (!(SIDE in KC_MAP)) { console.error('FATAL: unknown SIDE ' + SIDE); process.exit(2); }
const KC_WANT = KC_MAP[SIDE];
if (KC_WANT === undefined) {
  if (process.env.KEEPCEIL !== undefined) { console.error('FATAL: SIDE=kcoff requires KEEPCEIL UNSET'); process.exit(2); }
} else if (process.env.KEEPCEIL !== KC_WANT) {
  console.error(`FATAL: SIDE=${SIDE} requires KEEPCEIL=${KC_WANT} explicitly`);
  process.exit(2);
}
const POLICIES = { leadfeast, belongfeast };
const POLICY_ID = process.env.POLICY || 'leadfeast';
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9250,9251,9252,9253,9254,9255,9256,9257')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '100', 10);
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'keepceil-b-corpus', `sweep-${SIDE}-${POLICY_ID}.json`);
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-10-24', 'keepceil-b-corpus');

const med = xs => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };

// EPERM-flap-resilient write (same class as the depositrelief sweep).
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 60; i++) {
    try {
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

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'keepceil-b-' + POLICY_ID, fullTelemetry: false });
  await setupGame(Game);
  const inst = attachEC(Game);
  const W = inst.W;
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  policy.daily = (G, ctx) => { try { inst.daily(G); } catch (e) {} if (origDaily) return origDaily(G, ctx); };
  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;
  inst.readLedgers(Game);

  let glutDays = 0, villageDays = 0;
  for (const [, g] of Object.entries(W.dayGlut)) if (g) glutDays++;
  for (const [, r] of Object.entries(W.dayRoster)) villageDays += (r || 0);
  const freshMed = med(W.freshSeries);
  const deathCauses = {};
  for (const dd of W.deaths) { const c = dd.kind + ':' + dd.cause; deathCauses[c] = (deathCauses[c] || 0) + 1; }
  let starveDeaths = 0;
  for (const dd of W.deaths) if (/starv|hunger/.test(dd.cause)) starveDeaths++;
  let national = 0, table = 0, won = 0, maxWave = 1, rank = '?';
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; rank = r; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  try { maxWave = result.maxWaveUnlocked || 1; } catch (e) {}
  const rotTotal = Math.round((W.rotFresh || 0) + (W.rotPreserved || 0));
  const hc = Object.assign({}, W.hc, {
    broughtPerGlutDay: glutDays ? +(W.hc.glutBrought / glutDays).toFixed(1) : null,
    keptPerGlutDay: glutDays ? +(W.hc.glutKept / glutDays).toFixed(1) : null,
    depositPerGlutDay: glutDays ? +(W.hc.glutDeposit / glutDays).toFixed(1) : null,
    keepRaisePerGlutDay: glutDays ? +(W.hc.glutKeepRaise / glutDays).toFixed(1) : null,
    decisionsPerGlutDay: glutDays ? +(W.hc.glutDecisions / glutDays).toFixed(3) : null,
    broughtPerDecision: W.hc.decisions ? Math.round(W.hc.brought / W.hc.decisions) : null,
    keptPerDecision: W.hc.decisions ? Math.round(W.hc.kept / W.hc.decisions) : null,
    depositPerDecision: W.hc.decisions ? Math.round(W.hc.deposit / W.hc.decisions) : null,
    channelScholarHomecoming: Math.round(W.inflow.scholarHomecoming || 0),
  });
  // Channel-identity guard: hc.deposit must equal the choke-point channel
  // (the DIAG's identity; a mismatch means the instrument misattributes).
  const identityGap = Math.abs(hc.deposit - hc.channelScholarHomecoming);
  const perSeed = {
    seed, policy: POLICY_ID,
    keepceil: KC_WANT === undefined ? null : parseInt(KC_WANT, 10),
    depositgate: 1, plentydepri: 0,
    daysAlive: result.days, villageDays,
    rotFreshKcal: Math.round(W.rotFresh || 0), rotPreservedKcal: Math.round(W.rotPreserved || 0),
    easedKcal: Math.round((W.funnelShareEased || 0) + (W.returnEased || 0) + (W.bigHaulEased || 0)),
    glutDays,
    freshDaysMedian: freshMed == null ? null : Math.round(freshMed * 10) / 10,
    deathCauses, national, table, win: won, waveReach: [maxWave], medianSurvival: null,
    hc,
    extra: {
      endReason: result.endReason, rank, starveDays: W.starveDays, starveDeaths,
      rot100d: result.days ? +((rotTotal / result.days) * 100).toFixed(0) : 0,
      channelIdentityGap: identityGap, ms,
    },
  };
  return { seed, perSeed };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed } = await oneRun(seed, DAYS);
    rows.push(perSeed);
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); } catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `keepceil-b-${SIDE}-${POLICY_ID}-s${s}.json`), JSON.stringify(perSeed));
    const h = perSeed.hc;
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${perSeed.extra.endReason} rank=${perSeed.extra.rank} wave=${perSeed.waveReach[0]} rot100d=${perSeed.extra.rot100d} glutDays=${perSeed.glutDays} hcDec=${h.decisions} hcDep/gd=${h.depositPerGlutDay} hcKeepRaiseEv=${h.keepRaiseEvents} identGap=${perSeed.extra.channelIdentityGap} won=${perSeed.win} (${perSeed.extra.ms}ms)`);
  }
  // MERGE: summary merges rows by seed with any existing summary file
  // (pilot + confirm share one 16-row summary per cell). Idempotent:
  // identical seeds are byte-identical (seeded RNG, same instrument).
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  try { fs.mkdirSync(path.dirname(OUT), { recursive: true }); } catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  writeRobust(OUT, JSON.stringify({ meta: { cell: SIDE, policy: POLICY_ID, days: DAYS, seeds: merged.map(r => r.seed).sort((a, b) => a - b), env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', KEEPCEIL: KC_WANT === undefined ? null : KC_WANT } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
