#!/usr/bin/env node
// probe-fullseat-20261021.js — the full-seat DIAG sweep (sim-fullseat,
// 2026-10-21, flesh-out loop, axis scale-onramp, backlog #710).
//
// POLICY-SIDE: zero src/js changes. Measures, on the SEATDRIVE=1 winning
// substrate, each full-seat component's reach + distance-to-full per run —
// at run end AND at the win (wins truncate the measurement window).
//
// SUBSTRATE (the winning substrate, unchanged):
//   withFullseatDiag(withSeatDrive(withWinDefer(TF base)))
//   on {leadfeast, belongfeast} tribfloor bases. SEATDRIVE=1 -> seatdrive
//   drives the seat; FULLSEAT=1 -> the component recorder reads the
//   engine's own gate state every daily (pure reads, zero RNG, zero
//   game-state writes).
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
// NO tablepathdriver, no relaydark — the natural track, not the driven one.
//
// Usage:
//   <substrate env> node scripts/probe-fullseat-20261021.js
//   SMOKE=1 ...        # 2 seeds x 30d, field sanity
//   DET=1 ...          # instrument-on twice byte-identical (2 seeds x 60d)
//   ONLY=leadfeast ... # policy filter
//   SEEDS="64501,64502" DAYS=180 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const FD = require('./policies/fullseat-diag');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

// SUBSTRATE GUARD
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (fullseat substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor off.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer off.'); process.exit(2); }
if (!SD.layerOn()) { console.error('SWEEP STOP: seatdrive off.'); process.exit(2); }
if (!FD.layerOn()) { console.error('SWEEP STOP: fullseat-diag off.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64501, 64502, 64503, 64504, 64505, 64506, 64507, 64508]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-fullseat');

// EPERM flap hardening (2026-10-19 pattern): EPERM-only retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

// Policy composition — the DIAG stack:
//   withFullseatDiag(withSeatDrive(withWinDefer(TF base)))
function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-seatdrive`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  return FD.withFullseatDiag(sd, `${tag}-fullseat`, `${policyId} + full-seat component recorder (FULLSEAT=1)`);
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function scaleOf(Game) { try { return (Game.scaleRank ? Game.scaleRank() : 'village'); } catch (e) { return 'village'; } }

async function runSeed(policyId, seed, days) {
  const policy = policyFor(policyId);
  let lastCtx = null;
  const C = { instrumentErrors: 0, hashes: [] };
  policy.daily = ((oDaily) => (G, ctx) => {
    lastCtx = ctx;
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { C.instrumentErrors++; } }
    try { C.hashes.push(dayOf(G) + ':' + dayHash(G)); } catch (e) {}
    return r;
  })(policy.daily);
  const { Game } = await loadGame({ seed, mode: 'fullseat-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  const gameDays = dayOf(Game);
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= days ? 'survived' : (result.endReason || 'ended'));
  const rec = { policyId, seed, days, gameDays, endReason, won: !!Game.won };
  // Win-track attribution: the engine's own win record (endRec.tb path/branch).
  try {
    const pg = (typeof Game.progState === 'function') ? Game.progState() : {};
    const ek = pg.table && pg.table.endingKey;
    rec.winTrack = ek ? { path: ek.tablePath || null, moral: ek.moral || null,
      track: ek.track || null, godpath: ek.godpath || null, seat: (ek.seat || null) } : null;
  } catch (e) { rec.winTrack = { err: String(e && e.message || e) }; }
  // The recorder's attribution (from the final daily's ctx).
  try {
    const D = lastCtx && lastCtx._fullseatdiag;
    if (D) {
      // Distance-to-full at run END (the instrument's own live snapshot).
      const endSnap = FD.snapFullSeat(Game);
      rec.diag = {
        recDays: D.days | 0, errs: D.errs | 0,
        maxReach: D.max,
        // Distance-to-full at closest approach: foodShared from its max,
        // indisp score from its own max (b+m+fs peaks need not coincide).
        distAtMax: FD.distToFull(Object.assign({}, D.max, { brokerage: D.max.score, might: 0, foodShared: D.max.foodShared })),
        sentDay: D.sentDay != null ? D.sentDay : null,
        surgeDay: D.surgeDay != null ? D.surgeDay : null,
        bestSeatEver: (D.firstFullSeatDay != null) ? 'full' : (D.firstLesserDay != null ? 'lesser' : 'none'),
        firstFullSeatDay: D.firstFullSeatDay, firstLesserDay: D.firstLesserDay || null,
        firstFullSeatSnap: D.firstFullSeatSnap || null,
        indispEver: !!D.indispEver, firstIndispDay: D.firstIndispDay,
        firstIndispSnap: D.firstIndispSnap || null,
        winDay: D.winDay, winSnap: D.winSnap || null,
        seatsSeen: D.seats,
        endSnap,
      };
      // Distance at run end: from the end snapshot.
      rec.diag.distAtEnd = endSnap.dist;
      rec.diag.bindingAtEnd = endSnap.binding;
    } else {
      rec.diag = { err: 'no _fullseatdiag on ctx' };
    }
  } catch (e) { rec.diag = { err: String(e && e.message || e) }; }
  rec.national = ['national', 'global'].indexOf(scaleOf(Game)) >= 0;
  rec.scale = scaleOf(Game);
  rec.hashes = C.hashes;
  rec.instrumentErrors = C.instrumentErrors;
  return rec;
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const days = daysNow();
  if (MODE === 'smoke') {
    for (const p of POLICIES) {
      for (const s of SEEDS.slice(0, 2)) {
        const rec = await runSeed(p, s, Math.min(days, 30));
        console.log(`SMOKE ${p} s${s}: bestSeat=${(rec.diag || {}).bestSeatEver || '?'} errs=${(rec.diag || {}).errs || 0} end=${rec.endReason} won=${rec.won}`);
      }
    }
    return;
  }
  if (MODE === 'det') {
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
  // sweep — resume: skip seeds with a valid completed JSON (host service
  // restarts wipe /tmp mid-run; the probe writes straight to evidence/).
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
      try { writeFileRetry(fp, JSON.stringify(rec, null, 1)); }
      catch (e) { console.error(`WRITE FAIL ${fp}: ${e && e.message}`); }
      const dg = rec.diag || {};
      console.log(`  [${p} s${s}] d=${rec.gameDays} ${rec.endReason} won=${rec.won} seat=${dg.bestSeatEver || '?'} w4max=${(dg.maxReach || {}).w4} w5max=${(dg.maxReach || {}).w5} indisp=${dg.indispEver}`);
      results.push(rec);
    }
  }
  // Corpus summary.
  const full = results.filter(r => (r.diag || {}).bestSeatEver === 'full').length;
  const indisp = results.filter(r => (r.diag || {}).indispEver).length;
  const won = results.filter(r => r.won).length;
  const sum = {
    completedUtc: new Date().toISOString(), runs: results.length,
    seeds: SEEDS, policies: POLICIES, days,
    substrate: 'withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast/belongfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1',
    fullSeat: full + '/' + results.length, indispensable: indisp + '/' + results.length,
    wins: won + '/' + results.length,
    national: results.filter(r => r.national).length + '/' + results.length,
    instrumentErrors: results.reduce((t, r) => t + ((r.diag || {}).errs | 0) + (r.instrumentErrors | 0), 0),
  };
  writeFileRetry(path.join(__dirname, '..', 'evidence', '2026-10-21', 'fullseat-corpus-summary.json'), JSON.stringify(sum, null, 1));
  console.log('\n== summary ==', JSON.stringify(sum));
}

if (require.main === module) {
  main().catch(e => { console.error('PROBE CRASH:', e && e.stack || e); process.exit(2); });
}
module.exports = { policyFor, runSeed };
