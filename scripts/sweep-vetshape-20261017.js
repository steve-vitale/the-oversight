#!/usr/bin/env node
// scripts/sweep-vetshape-20261017.js — the veteran-bar shape instrument sweep
// (flesh-out loop arm sim-vetshape, 2026-10-17, scale-onramp axis).
//
// PRIMARY (binding, pre-registered in evidence/2026-10-17/sim-vetshape.md):
//   wave-4 unlock share armed (VETSHAPE=1) >= control (VETSHAPE unset) + 3
//   on the pre-seat wincensus-c substrate.
// GUARDRAILS (kill conditions): starvation deaths armed > control+2;
//   median survival armed < control-10d; any new death mode on armed;
//   wave-4 unlocks bought with mass death.
//
// Design: 8 FRESH seeds (0 filename hits across evidence/ — verified
// 2026-10-17 before this script ran) x {leadfeast, belongfeast}
// (SD.leadseat/SD.belongseat, the exact wincensus-c policyFor mapping) x
// {control: VETSHAPE unset, armed: VETSHAPE=1} = 32 runs, identical seeds per
// arm, 180d death-aware horizons.
//
// Substrate (asserted at startup — the wave4census lesson): FEASTSCALE_R13=1
// TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
// SEATDRIVE=0 EXPLICIT both arms (pre-seat: the seat driver delegates to the
// windefer-wrapped tribfloor stack), ALLOWGATE2 unset. The sweep-time master
// commit is recorded in every per-seed JSON (SUBSTRATE LESSON from
// sim-wave4census: three food-code landings shifted the ground mid-run —
// assert and record the commit).
//
// Per-seed JSONs land in evidence/2026-10-17/perseed-vetshape/ (sims write
// once, on purpose, into evidence/<date>/). A summary JSON + console table
// are printed at the end.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 node scripts/sweep-vetshape-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SWEEP_COMMIT = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: __dirname, encoding: 'utf8' }).trim(); }
  catch (e) { return 'unknown'; }
})();

const SEEDS = [2210317, 2320419, 2430521, 2540623, 2650727, 2760829, 2870931, 2981033];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-vetshape');

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
  if (process.env.SEATDRIVE !== '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be EXPLICIT 0 (pre-seat substrate).');
}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

function deathCauseSummary(deaths) {
  // samples.deaths: {day, kind, who, cause, player}. Starvation guardrail:
  // count deaths whose cause string mentions starvation/hunger.
  const byCause = {};
  let starv = 0;
  for (const d of (deaths || [])) {
    const c = String((d && d.cause) || 'unknown');
    byCause[c] = (byCause[c] || 0) + 1;
    if (/starv|hunger|famine/i.test(c)) starv++;
  }
  return { byCause, starv, total: (deaths || []).length };
}

async function runOne(seed, policyId, armed) {
  assertSubstrate();
  if (armed) process.env.VETSHAPE = '1'; else delete process.env.VETSHAPE;
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `vetshape-${armed ? 'armed' : 'control'}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hashes = [];
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);
  const deaths = (result.samples && result.samples.deaths) || [];
  const ds = deathCauseSummary(deaths);
  // readiness snapshot at end (honest bars for the assessment)
  let readiness = null;
  try { readiness = Game.waveCombatReadiness(4); } catch (e) {}
  let standing = null;
  try { standing = Game.villageStanding(); } catch (e) {}
  let vetshapeOn = null;
  try { vetshapeOn = (process.env.VETSHAPE === '1'); } catch (e) {}
  return {
    run: 'sim-vetshape', axis: 'scale-onramp',
    seed, policyId, arm: armed ? 'armed' : 'control', vetshape: vetshapeOn ? 1 : 0,
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, SEATDRIVE: 0 },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, maxWaveUnlocked: result.maxWaveUnlocked || 1,
    standingPeakWave: (Game.state && Game.state._standingPeakWave) || 0,
    standingTotal: standing ? (standing.total | 0) : null,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    deaths: { total: ds.total, starv: ds.starv, byCause: ds.byCause },
    dayHashes: hashes.length,
  };
}

(async () => {
  assertSubstrate();
  fs.mkdirSync(EVID, { recursive: true });
  console.log(`sweep-time master commit: ${SWEEP_COMMIT}`);
  const rows = [];
  for (const armed of [false, true]) {
    for (const policyId of POLICIES) {
      for (const seed of SEEDS) {
        const t0 = Date.now();
        let row;
        try {
          row = await runOne(seed, policyId, armed);
        } catch (e) {
          console.error(`CRASH ${armed ? 'armed' : 'control'} ${policyId} s${seed}: ${e && e.message}`);
          row = { run: 'sim-vetshape', seed, policyId, arm: armed ? 'armed' : 'control',
            crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
        }
        rows.push(row);
        const fn = `${row.arm}-${policyId}-s${seed}.json`;
        fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
        const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
        console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] ${row.arm} ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4} starv=${row.deaths ? row.deaths.starv : '?'}${row.crashed ? ' CRASHED' : ''}`);
      }
    }
  }
  // summary
  const good = rows.filter(r => !r.crashed);
  const byArm = {};
  for (const a of ['control', 'armed']) {
    const rs = good.filter(r => r.arm === a);
    const w4 = rs.filter(r => r.maxWaveUnlocked >= 4).length;
    const starv = rs.reduce((t, r) => t + r.deaths.starv, 0);
    const ds = rs.map(r => r.gameDays).sort((x, y) => x - y);
    const med = ds.length ? ds[Math.floor(ds.length / 2)] : 0;
    const causes = {};
    for (const r of rs) for (const [c, n] of Object.entries(r.deaths.byCause)) causes[c] = (causes[c] || 0) + n;
    byArm[a] = { n: rs.length, w4unlocks: w4, starvDeaths: starv, medianDays: med, causes };
  }
  const summary = { run: 'sim-vetshape', sweepCommit: SWEEP_COMMIT, seeds: SEEDS, policies: POLICIES,
    arms: byArm, rows: rows.map(r => ({ seed: r.seed, policyId: r.policyId, arm: r.arm,
      days: r.days, endReason: r.endReason, w4: (r.maxWaveUnlocked || 1) >= 4, starv: r.deaths && r.deaths.starv })) };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'vetshape-sweep-summary-20261017.json'), JSON.stringify(summary, null, 1));
  console.log('\n== SUMMARY ==');
  for (const a of ['control', 'armed']) {
    const b = byArm[a];
    console.log(`${a}: n=${b.n} w4-unlocks=${b.w4unlocks} starv=${b.starvDeaths} medianDays=${b.medianDays}`);
    console.log(`  causes: ${JSON.stringify(b.causes)}`);
  }
  const d = byArm.armed.w4unlocks - byArm.control.w4unlocks;
  console.log(`PRIMARY: armed-control = ${d} (GO needs >= +3)`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
