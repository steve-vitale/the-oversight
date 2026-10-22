#!/usr/bin/env node
// sweep-armorsink-r3-20261022.js — sim-armorsink-r3 sweep: the r3 attribution
// instrument (generation + form paths, day-boundary carry-forward, prize
// shadow-dedup, per-holder deltas) on the 3 seeds implicated by r2's
// DIAG-NO-GO (65422/leadfeast, 65424/belongfeast, 65428/belongfeast).
//
// INSTRUMENT-ONLY DIAG: zero src/js changes. Two modes:
//   MODE=ledger — r2+r3 instruments installed (the measurement).
//   MODE=bare   — no hooks at all; dayHash trace only (the §15 parity leg).
// Per-config dayHash ledger vs bare must be byte-identical.
//
// SUBSTRATE (pinned): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
//   SEATDRIVE=1 VGEAR=1 KILLDISC=1; policies VCE.armedFor(leadfeast|
//   belongfeast) via scripts/policies/vgearconfirm.js.
// HORIZON: 180d death-aware (+10d tail max via the harness).
// CONFIGS: 65422/leadfeast, 65424/belongfeast, 65428/belongfeast (fixed).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-22/perseed-armorsink-r3/<mode>/<policy>/s<seed>.json
// and prints the r3 attribution verdict per config.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//     MODE=ledger node scripts/sweep-armorsink-r3-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const R3 = require(path.join(REPO, 'scripts', 'armorsink-ledger-r3-20261022'));
const R2 = R3.R2;
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
// The 3 r2-implicated configs. Fixed: the DIAG targets r2's 6 events.
const CONFIGS = [
  { seed: 65422, policyId: 'leadfeast' },
  { seed: 65424, policyId: 'belongfeast' },
  { seed: 65428, policyId: 'belongfeast' },
];
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorsink-r3', MODE);
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const gday = (Game) => { try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; } };

async function runOne(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'armorsink-r3', fullTelemetry: false });
  const C = R3.freshLedgerR3();
  let u2 = () => {}, u3 = () => {};
  if (MODE === 'ledger') { u2 = R2.install(Game, C); u3 = R3.installR3(Game, C); }
  const oDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) {
      let r;
      try { r = oDaily ? oDaily(G, ctx) : undefined; } catch (e) { throw e; }
      try { C.hashes.push(gday(G) + ':' + dayHash(G)); } catch (e) { C.instrumentErrors.push('hash: ' + e.message); }
      if (MODE === 'ledger') {
        try { R3.dailySampleR3(G, C); } catch (e) { C.instrumentErrors.push('dailySampleR3: ' + e.message); }
      }
      return r;
    },
  });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { u3(); } catch (e) {}
  try { u2(); } catch (e) {}
  if (MODE === 'ledger') {
    try { R3.finalizeR3(Game, C); } catch (e) { C.instrumentErrors.push('finalizeR3: ' + e.message); }
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
      r3transfers: C.r3transfers, r3attributed: C.r3attributed,
      r3holderDeltas: C.r3holderDeltas, r3genArmor: C.r3genArmor,
      r3formAnomalies: C.r3formAnomalies, r3samplesPerDay: C.r3samplesPerDay,
      r3summary: C.r3summary,
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
  for (const { seed, policyId } of CONFIGS) {
    try {
      const out = await runOne(seed, policyId);
      const s = out.ledger && out.ledger.r3summary;
      console.log(`  ok ${MODE}/${policyId}/s${seed} days=${out.gameDays} end=${out.endReason} ` +
        `ierr=${out.instrumentErrors} national=${out.national} table=${out.table} won=${out.won} wave=${out.maxWave}` +
        (s ? ` | unexpl=${s.unexplained} attrib=${s.attributed} shadows=${s.shadowDeduped} genArmor=${s.genArmorSightings} formAnom=${s.formAnomalies}` : ''));
    } catch (e) {
      bad++;
      console.error(`  FAIL ${MODE}/${policyId}/s${seed}: ${e && e.message}`);
    }
  }
  console.log(`SWEEP DONE mode=${MODE} bad=${bad}`);
  if (bad) process.exit(1);
}

if (require.main === module) main().catch(e => { console.error('SWEEP FATAL:', e && e.message); process.exit(1); });
module.exports = { runOne, MODE, CONFIGS };
