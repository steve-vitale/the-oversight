#!/usr/bin/env node
// killattr-sweep-20261020.js — CONTROL corpus for arm sim-killeraftermath
// (flesh-out loop run fleshout-20261020T2015Z, axis scale-onramp). DIAGNOSTIC
// PHASE: control-only, zero game-side changes, zero policy layers beyond the
// substrate.
//
// Substrate (EXACT w5doormeasure stack, composed never edited):
//   policyFor: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   on {leadfeast, belongfeast} tribfloor bases (scripts/probe-w5path-20261019).
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLATTR=1
//        (VETREL/REPOSITION unset -> inert; SEATDRIVE=0 -> seatdrive pure
//        delegation; VETSHAPE unset -> pristine living-only veterans bar).
// The sweep FAILS LOUD unless the env matches exactly.
//
// Horizon: 180d death-aware (dead villages stop simulating), from the
// w5doormeasure baseline survival distribution (median 181.5d).
//
// Corpus: 8 seeds (64001–64008 — the scholarcare/readiness named set, so the
// deep taxonomy extends those taxonomies mechanism-by-mechanism on identical
// trajectories) x {leadfeast, belongfeast} = 16 CONTROL runs.
// Instrument: scripts/killattr-instrument-20261020.js (read-only death +
// kill attribution, wave-4+ kills only; raid-night ledger for the raid join).
// Writes evidence/2026-10-20/perseed-killattr/control/<policy>/s<seed>.json
// ONCE, on purpose. Per-seed JSONs carry no timestamps — re-runs are
// byte-comparable.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLATTR=1 \
//   node scripts/killattr-sweep-20261020.js
//   SMOKE=1 ...        # 2 seeds x both policies, 30d
//   ONLY=leadfeast ... # policy filter
//   SEEDS="64001,64002" DAYS=60 ...
//   RESUME=1 ...       # skip seeds whose per-seed JSON already exists
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./probe-w5path-20261019'); // policyFor: the landed w5doormeasure stack (composed, never edited)
const KA = require('./killattr-instrument-20261020');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLATTR'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (killattr substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
for (const k of ['VETREL', 'REPOSITION', 'VETSHAPE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must NOT be 1 (substrate).`); process.exit(2); }
}
if (!SW.policyFor) { console.error('SWEEP STOP: probe-w5path policyFor missing.'); process.exit(2); }
if (!KA.instrumentOn()) { console.error('SWEEP STOP: KILLATTR instrument off despite KILLATTR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64001, 64002, 64003, 64004, 64005, 64006, 64007, 64008]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const SMOKE = process.env.SMOKE === '1';
const RESUME = process.env.RESUME === '1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-killattr', 'control');
fs.mkdirSync(EVID, { recursive: true });

function gday(G) { try { return (G.state && G.state.scholar && G.state.scholar.day) | 0 || 0; } catch (e) { return 0; } }

async function runOne(seed, policyId) {
  const policy = SW.policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'killattr', fullTelemetry: false });
  const t = {};
  const uninstall = KA.install(Game, t);

  await setupGame(Game);
  let result;
  const hashes = [];
  const wrappedDaily = policy.daily;
  const pol = Object.assign({}, policy);
  pol.daily = (G, ctx) => {
    let r;
    if (wrappedDaily) { try { r = wrappedDaily(G, ctx); } catch (e) {} }
    try { hashes.push(gday(G) + ':' + dayHash(Game)); } catch (e) {}
    return r;
  };
  await quietLog(async () => { result = await runDays(Game, pol, { days: daysNow(), manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  let maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  let maxRank = 'village', everTable = false, won = false;
  try { maxRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; everTable = !!(pg.tableWaiting || pg.tableDone); } catch (e) {}
  try { won = !!Game.won; } catch (e) {}

  const out = {
    seed, policyId, days: daysNow(), gameDays,
    endReason: result.endReason || null, maxWave, maxRank, everTable, won,
    instrumentErrors: (t.instrumentErrors || []).slice(0, 20),
    instrumentErrorCount: (t.instrumentErrors || []).length,
    kills: t.kills || [],        // wave-4+ kills with kill-time ctx
    deaths: t.deaths || [],      // player deaths with death-time ctx
    raidNights: t.raidNights || [],
    hashes,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out) + '\n');
  return out;
}

(async () => {
  const seeds = SMOKE ? SEEDS.slice(0, 2) : SEEDS;
  const saveDays = process.env.DAYS;
  if (SMOKE) process.env.DAYS = '30';
  let done = 0, errors = 0;
  for (const policyId of POLICIES) {
    for (const seed of seeds) {
      const outFp = path.join(EVID, policyId, `s${seed}.json`);
      if (RESUME && fs.existsSync(outFp)) {
        console.log(`[control] ${policyId} s${seed}: resumed (already complete)`);
        done++;
        continue;
      }
      try {
        const out = await runOne(seed, policyId);
        done++;
        console.log(`[control] ${policyId} s${seed}: days=${out.gameDays} wave=${out.maxWave} kills=${out.kills.length} deaths=${out.deaths.length} raids=${out.raidNights.length} end=${out.endReason}`);
      } catch (e) {
        errors++;
        console.error(`[control] ${policyId} s${seed}: ERROR ${e && e.message}`);
      }
    }
  }
  if (saveDays !== undefined) process.env.DAYS = saveDays;
  console.log(`done=${done} errors=${errors}`);
  process.exit(errors ? 1 : 0);
})();
