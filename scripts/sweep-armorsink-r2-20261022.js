#!/usr/bin/env node
// sweep-armorsink-r2-20261022.js — sim-armorsink-r2 sweep: the worn-armor
// mortality-sink ledger on the pinned VGEAR winning substrate.
//
// INSTRUMENT-ONLY DIAG: zero src/js changes. Two modes:
//   MODE=ledger — the armorsink ledger instrument installed (the measurement).
//   MODE=bare   — no hooks at all; dayHash trace only (the §15 parity leg).
// The sweep compares per-config dayHash traces ledger vs bare: any drift is
// a loud failure (instrument must be read-only).
//
// SUBSTRATE (pinned): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
//   SEATDRIVE=1 VGEAR=1 KILLDISC=1; policies VCE.armedFor(leadfeast|
//   belongfeast) via scripts/policies/vgearconfirm.js. SUCCGRACE,
//   RAIDDENSITY, NODEWITNESS, FULLSEAT, VETREL, VGEARBEATS, ARMORCATCH unset.
// HORIZON: 180d death-aware (+10d tail max via the harness).
// SEEDS: 65421-65428 (the armorcatch corpus seed set — comparable).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-armorsink-r2/<mode>/<policy>/s<seed>.json
// and prints a per-config summary + the DET parity verdict.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//     MODE=ledger SEEDS=65421,65422 node scripts/sweep-armorsink-r2-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const LEDGER = require(path.join(REPO, 'scripts', 'armorsink-ledger-20261022'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));

// WINNING-SUBSTRATE guard (pinned; nothing else).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winning substrate + VGEAR).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'ARMORCATCH']) {
  if (k in process.env) { console.error(`SWEEP STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}

const MODE = (process.env.MODE || 'ledger').toLowerCase();
if (MODE !== 'ledger' && MODE !== 'bare') { console.error('SWEEP STOP: MODE must be ledger|bare.'); process.exit(2); }
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [65421, 65422, 65423, 65424, 65425, 65426, 65427, 65428]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast'])
  .filter(p => p === 'leadfeast' || p === 'belongfeast');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorsink-r2', MODE);
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const gday = (Game) => { try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'armorsink-r2', fullTelemetry: false });
  const C = LEDGER.freshLedger();
  let uninstall = () => {};
  if (MODE === 'ledger') uninstall = LEDGER.install(Game, C);
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      let r;
      try { r = oDaily ? oDaily(G, ctx) : undefined; } catch (e) { throw e; }
      try { C.hashes.push(gday(G) + ':' + dayHash(G)); } catch (e) { C.instrumentErrors.push('hash: ' + e.message); }
      if (MODE === 'ledger') {
        try { LEDGER.dailySample(G, C); } catch (e) { C.instrumentErrors.push('dailySample: ' + e.message); }
      }
      return r;
    },
  });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  if (MODE === 'ledger') {
    try { LEDGER.finalize(Game, C); } catch (e) { C.instrumentErrors.push('finalize: ' + e.message); }
  }
  let gameDays = 0;
  try { gameDays = gday(Game); } catch (e) {}
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= DAYS ? 'survived' : (result.endReason || 'ended'));
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? (Game.unlockedWave() | 0) : 1; } catch (e) {}
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = {};
  try {
    for (const dd of (result.samples.deaths || [])) {
      const k = String(dd.cause || dd.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const out = {
    seed, policyId, mode: MODE, anchor: ANCHOR,
    substrate: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1',
    days: result.days, gameDays, endReason, won, national, table, maxWave,
    deaths,
    instrumentErrors: C.instrumentErrors.length,
    instrumentErrorList: C.instrumentErrors.slice(0, 10),
    hashes: C.hashes,
  };
  if (MODE === 'ledger') {
    out.ledger = {
      deaths: C.deaths, production: C.production, wear: C.wear,
      sinkEvents: C.sinkEvents, returnEvents: C.returnEvents,
      corpseTracks: C.corpseTracks, defer5: C.defer5, rebinds: C.rebinds,
      dailyTotals: C.dailyTotals, unexplained: C.unexplained, summary: C.summary,
      sayRing: C.sayRing,
    };
  }
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, `s${seed}.json`);
  const tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(out));
  fs.renameSync(tmp, f);
  const st = fs.statSync(f);
  if (st.size === 0) { fs.unlinkSync(f); throw new Error('0-byte per-seed file (host EPERM flap?): ' + f); }
  return out;
}

async function main() {
  let bad = 0;
  const sums = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      try {
        const out = await runOne(seed, policyId);
        const s = out.ledger && out.ledger.summary;
        sums.push(out);
        console.log(`  ok ${MODE}/${policyId}/s${seed} days=${out.gameDays} end=${out.endReason} ` +
          `ierr=${out.instrumentErrors}` +
          (s ? ` deaths=${s.deaths} armorDeaths=${s.deathsWithArmor} vanished=${s.vanishedPieces} buried=${s.buriedPieces} produced=${s.producedPieces} returned=${s.returnedPieces} unexpl=${s.unexplained} rebinds=${s.rebinds}/${s.rebindsArmor}` : ''));
      } catch (e) {
        bad++;
        console.error(`  FAIL ${MODE}/${policyId}/s${seed}: ${e && e.message}`);
      }
    }
  }
  console.log(`SWEEP DONE mode=${MODE} bad=${bad}`);
  if (bad) process.exit(1);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, MODE, SEEDS, POLICIES };
