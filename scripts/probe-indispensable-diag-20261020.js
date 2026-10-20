#!/usr/bin/env node
// probe-indispensable-diag-20261020.js — the indispensable-gate DIAG sweep
// (sim-indispensable, 2026-10-20, flesh-out loop, axis scale-onramp).
//
// POLICY-SIDE: zero src/js changes. Measures, on the pilot's substrate,
// what earns the indispensable why-string and how rare it is, per the
// arm's binding pre-registration (evidence/2026-10-20/sim-indispensable-road.md).
//
// SUBSTRATE (the pilot's substrate, unchanged):
//   withIndispDiag(withTablePathDriver(withSeatDrive(withWinDefer(withRelayDark(TF base)))))
//   on {leadfeast, belongfeast} tribfloor bases. SEATDRIVE=1 -> seatdrive
//   drives the seat; TABLEPATHDRIVER=1 -> driver drains the modal
//   (door='feared', trial OFF — the substrate's default track; pre-table
//   the driver is a pure no-op, DET-pinned); RELAYDARK=1 (active=false —
//   no relay-assigned runs here); INDISPDIAG=1 -> the gate recorder reads
//   the engine's own gate state every daily (pure reads, zero RNG, zero
//   game-state writes).
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//        WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
//        TABLEPATHDRIVER=1 RELAYDARK=1 INDISPDIAG=1
//   (KILLDISC=1 -> the existing scripts/killdisc-instrument-20261018.js
//   read-only instrument is installed; reused, not a new layer.)
// No VETREL, no REPOSITION (the probe's SUBSTRATE GUARD).
//
// Usage:
//   <substrate env> node scripts/probe-indispensable-diag-20261020.js
//   SMOKE=1 ...        # 2 seeds x 30d, field sanity
//   DET=1 ...          # layers-ON twice byte-identical (no unseeded RNG / no writes)
//   ONLY=leadfeast ... # policy filter
//   SEEDS="64201,64202" DAYS=180 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const TPD = require('./policies/tablepathdriver');
const RD = require('./policies/relaydark');
const DG = require('./policies/indispensable-diag');
const KD = require('./killdisc-instrument-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

// SUBSTRATE GUARD
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT',
  'WINDEFER', 'NODEWITNESS', 'KILLDISC', 'SEATDRIVE', 'TABLEPATHDRIVER', 'RELAYDARK', 'INDISPDIAG'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (indisp-diag substrate).`); process.exit(2); }
}
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1.'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1.'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor off.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive off.'); process.exit(2); }
if (!TPD.layerOn()) { console.error('SWEEP STOP: tablepathdriver off.'); process.exit(2); }
if (!RD.layerOn()) { console.error('SWEEP STOP: relaydark off.'); process.exit(2); }
if (!DG.layerOn()) { console.error('SWEEP STOP: indispensablediag off.'); process.exit(2); }
if (!KD.instrumentOn()) { console.error('SWEEP STOP: KILLDISC instrument off.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-indispensablediag');

// EPERM flap hardening (2026-10-19 pattern): EPERM-only retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

// Policy composition — the DIAG stack (read-only instruments compose upon
// the landed layers; none are edited):
//   withIndispDiag(withTablePathDriver(withSeatDrive(withWinDefer(withRelayDark(TF base)))))
// TABLEPATHDRIVER=1 with door='feared' (the substrate's default track);
// RELAYDARK=1 but active=false (no relay-assigned runs in this DIAG).
function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rd = RD.withRelayDark(base, `${tag}-relaydark`,
    `${policyId} + relaydark (RELAYDARK=1, active=false — no relay-assigned runs)`, { active: false });
  const wd = WD.withWinDefer(rd, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  const tp = TPD.withTablePathDriver(sd, `${tag}-tablepathdriver`,
    `${policyId} + tablepathdriver (TABLEPATHDRIVER=1, door=feared, trial=false)`, { door: 'feared', trial: false });
  return DG.withIndispDiag(tp, `${tag}-indispdiag`,
    `${policyId} + indispensable-gate recorder (INDISPDIAG=1)`);
}

function scaleOf(Game) { try { return (Game.scaleRank ? Game.scaleRank() : 'village'); } catch (e) { return 'village'; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

async function runSeed(policyId, seed, days) {
  const policy = policyFor(policyId);
  // KILLDISC read-only install happens inside the probe's policy wrap (like the parent probe).
  const oDaily = policy.daily;
  let lastCtx = null;
  const C = { kd: { kills: [], instrumentErrors: [] }, instrumentErrors: 0, hashes: [] };
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { C.instrumentErrors++; } }
    try { C.hashes.push(dayOf(G) + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'posttable', fullTelemetry: false });
  await setupGame(Game);
  try { KD.install(Game, C.kd); } catch (e) { C.instrumentErrors++; }
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  const gameDays = dayOf(Game);
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= days ? 'survived' : (result.endReason || 'ended'));
  const rec = { policyId, seed, days, gameDays, endReason, base: result.base || null, won: !!Game.won };
  // The recorder's attribution (from the final daily's ctx).
  try {
    const D = lastCtx && lastCtx._indispdiag;
    if (D) {
      rec.diag = {
        bestSeat: D.bestSeat, bestSeatDay: D.bestSeatDay,
        bestGate: D.best ? D.best.gate : null,
        bestLedger: D.best ? D.best.ledger : null,
        bestStanding: D.best ? D.best.standing : null,
        bestUnlockedWave: D.best ? D.best.unlockedWave : null,
        indispEver: !!D.indispEver, indispFirst: D.indispFirst || null,
        errs: D.errs | 0, recDays: D.days | 0,
      };
      // Also capture the END-of-run gate (states change — the best-seat
      // moment is the binding observation; the end state is for comparison).
      rec.endGate = DG.snapGate(Game);
    } else {
      rec.diag = { err: 'no _indispdiag on ctx' };
    }
  } catch (e) { rec.diag = { err: String(e && e.message || e) }; }
  rec.national = ['national', 'global'].indexOf(scaleOf(Game)) >= 0;
  rec.scale = scaleOf(Game);
  rec.hashes = C.hashes;
  rec.instrumentErrors = C.instrumentErrors;
  rec.kdErrors = (C.kd.instrumentErrors || []).length;
  return rec;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const days = daysNow();
  if (MODE === 'smoke') {
    for (const p of POLICIES) {
      for (const s of SEEDS.slice(0, 2)) {
        const rec = await runSeed(p, s, Math.min(days, 30));
        console.log(`SMOKE ${p} s${s}: seat=${(rec.diag || {}).bestSeat || '?'} errs=${(rec.diag || {}).errs || 0} end=${rec.endReason}`);
      }
    }
    return;
  }
  if (MODE === 'det') {
    // layers-ON twice byte-identical: same seed, two full 60d runs, hash
    // series + final diag record must match exactly.
    const detSeeds = SEEDS.slice(0, 2);
    let pass = 0, fail = 0;
    for (const p of POLICIES) {
      for (const s of detSeeds) {
        const a = await runSeed(p, s, 60);
        const b = await runSeed(p, s, 60);
        const strip = (r) => JSON.stringify({ h: r.hashes, d: r.diag, e: r.endReason, w: r.won, n: r.national });
        if (strip(a) === strip(b)) { pass++; console.log(`DET ${p} s${s}: PASS`); }
        else { fail++; console.log(`DET ${p} s${s}: FAIL`); }
      }
    }
    console.log(`DET: ${pass} pass, ${fail} fail`);
    if (fail) process.exit(3);
    return;
  }
  // sweep — resume: skip seeds with a valid completed JSON (the
  // tableconfirm pattern; host service restarts wiped /tmp mid-run twice).
  const results = [];
  for (const p of POLICIES) {
    const dir = path.join(EVID, p);
    fs.mkdirSync(dir, { recursive: true });
    for (const s of SEEDS) {
      const fp = path.join(dir, `s${s}.json`);
      if (fs.existsSync(fp)) {
        try {
          const prev = JSON.parse(fs.readFileSync(fp, 'utf8'));
          if (prev && prev.completed && prev.seed === s && prev.days === days) {
            console.log(`skip ${p} s${s} (completed)`);
            results.push(prev); continue;
          }
        } catch (e) {}
      }
      console.log(`run ${p} s${s} ...`);
      const rec = await runSeed(p, s, days);
      rec.completed = true;
      writeFileRetry(fp, JSON.stringify(rec, null, 2) + '\n');
      results.push(rec);
      console.log(`  seat=${rec.diag.bestSeat || '?'} day=${rec.diag.bestSeatDay} indisp=${rec.diag.indispEver} end=${rec.endReason} days=${rec.gameDays}`);
    }
  }
  const full = results.filter(r => r.diag && r.diag.bestSeat === 'full').length;
  const ind = results.filter(r => r.diag && r.diag.indispEver).length;
  console.log(`\nSWEEP: ${results.length} runs, full-seat-ever=${full}, indispensable-ever=${ind}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
}
module.exports = { policyFor, runSeed, SEEDS, daysNow };
