#!/usr/bin/env node
// scripts/sweep-wave4reach-20261017.js — the vetrel + VETSHAPE composition
// sweep (flesh-out loop arm sim-wave4reach, 2026-10-17, axis scale-onramp,
// lever-2 lens; findings #469 + #427).
//
// THE EXPERIMENT (never measured): compose vetrel (scripts/policies/vetrel.js,
// VETREL=1 default OFF — companion-veteran reliability driver, 18-0
// companion wave-3 kills at confirm) with the VETSHAPE=1 instrument
// (src/js/standing.js, default OFF — veteran bar counts veteran kills
// living-or-dead, PRIMARY GO +3/16 pre-seat), on the PRE-SEAT courtship road,
// and measure wave-4 unlocks.
//
// PRIMARY (binding, pre-registered in evidence/2026-10-17/sim-wave4reach.md):
//   wave-4 unlocks armed (VETREL=1 + VETSHAPE=1) minus control (both unset)
//   GO iff >= +3/16 (vetshape's bar).
// GUARDRAILS (kill conditions): median survival armed < control-10d;
//   national reach armed < control-2; any new death mode on armed;
//   det-gate byte-identical with both layers off (pinned in the proof test);
//   SMOKE green.
// METRIC BINDING (docs/MEASUREMENT.md §14): a miss is NO-GO, never re-scored.
//
// Design: 8 FRESH seeds (0 filename hits across evidence/ — verified
// 2026-10-17 before this script ran: 3091141, 3101243, 3211345, 3321447,
// 3431549, 3541651, 3651753, 3761855) x {leadfeast, belongfeast} (the win-side
// stack SD.leadseat/SD.belongseat wrapped in withVetrel — gate-off is pure
// delegation, byte-identical to the vetshape-measured substrate) x
// {control: VETREL/VETSHAPE unset, armed: VETREL=1 + VETSHAPE=1} = 32 runs,
// identical seeds per arm, 180d death-aware horizons.
//
// Per run ALSO recorded: first wave-4 unlock day + which readiness bar was
// binding at unlock (armor/weapons/veterans/tricks) — the #427 steve-call feed.
// SENSE-TESTING: beats around unlocks read post-sweep via a sense probe.
//
// Substrate (asserted at startup — the wave4census lesson): FEASTSCALE_R13=1
// TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1,
// SEATDRIVE=0 EXPLICIT both arms, ALLOWGATE2 unset. Sweep-time master commit
// recorded in every per-seed JSON.
//
// Per-seed JSONs land in evidence/2026-10-17/perseed-wave4reach/ (sims write
// once, on purpose, into evidence/<date>/). Summary JSON + console table at end.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 node scripts/sweep-wave4reach-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const VR = require('./policies/vetrel');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const SWEEP_COMMIT = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: __dirname, encoding: 'utf8' }).trim(); }
  catch (e) { return 'unknown'; }
})();

const SEEDS = [3091141, 3101243, 3211345, 3321447, 3431549, 3541651, 3651753, 3761855];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-wave4reach');

// The composition: vetrel wraps the exact win-side stack the vetshape sweep
// measured. Gate-off (VETREL unset) = pure delegation, byte-identical to the
// substrate (pinned by this arm's proof test det-gate).
const COMPOSED = {
  leadfeast: VR.withVetrel(SD.leadseat, 'vetrel-leadseat',
    'win-side leadfeast stack (SEATDRIVE=0) + VETREL veteran-reliability (VETREL=1)'),
  belongfeast: VR.withVetrel(SD.belongseat, 'vetrel-belongseat',
    'win-side belongfeast stack (SEATDRIVE=0) + VETREL veteran-reliability (VETREL=1)'),
};

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
  if (process.env.SEATDRIVE !== '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be EXPLICIT 0 (pre-seat substrate).');
}

function deathCauseSummary(deaths) {
  const byCause = {};
  let starv = 0;
  for (const d of (deaths || [])) {
    const c = String((d && d.cause) || 'unknown');
    byCause[c] = (byCause[c] || 0) + 1;
    if (/starv|hunger|famine/i.test(c)) starv++;
  }
  return { byCause, starv, total: (deaths || []).length };
}

function reachedNational(samples) {
  try {
    for (const [day, rank] of ((samples || {}).scale || [])) {
      if (rank === 'national' || rank === 'global') return 1;
    }
  } catch (e) {}
  return 0;
}

async function runOne(seed, policyId, armed) {
  assertSubstrate();
  if (armed) { process.env.VETREL = '1'; process.env.VETSHAPE = '1'; }
  else { delete process.env.VETREL; delete process.env.VETSHAPE; }
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = COMPOSED[policyId];
  const { Game } = await loadGame({ seed, mode: `wave4reach-${armed ? 'armed' : 'control'}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hashes = [];
  let capturedCtx = null, firstW4Day = null, lastUnready = null;
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      capturedCtx = ctx;
      const day = G.state.scholar.day;
      hashes.push(day + ':' + dayHash(G));
      if (firstW4Day == null && typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4)
        firstW4Day = day;
      // Binding bars: the last day the village was NOT ready, just before
      // the unlock — those short bars are what was holding the door.
      if (firstW4Day == null && typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready)
          lastUnready = { day, armored: rd.armored, armed: rd.armed, tricks: rd.tricks,
            veterans: rd.veterans, short: rd.short };
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);
  const deaths = (result.samples && result.samples.deaths) || [];
  const ds = deathCauseSummary(deaths);
  let readiness = null;
  try { readiness = Game.waveCombatReadiness(4); } catch (e) {}
  let standing = null;
  try { standing = Game.villageStanding(); } catch (e) {}
  let engage = null;
  try {
    const c = capturedCtx || {};
    engage = { invites: c.vetInvitesOk | 0, hunts: c.vetHunts | 0, huntLegs: c.vetHuntLegs | 0,
      huntFights: c.vetHuntFights | 0, yields: c.vetYields | 0,
      breakoffs: c.vetBreakoffs | 0, rescues: c.vetRescues | 0 };
  } catch (e) {}
  return {
    run: 'sim-wave4reach', axis: 'scale-onramp',
    seed, policyId, arm: armed ? 'armed' : 'control',
    vetrel: armed ? 1 : 0, vetshape: armed ? 1 : 0,
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, SEATDRIVE: 0 },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, maxWaveUnlocked: result.maxWaveUnlocked || 1,
    reachedNational: reachedNational(result.samples),
    standingPeakWave: (Game.state && Game.state._standingPeakWave) || 0,
    standingTotal: standing ? (standing.total | 0) : null,
    // The #427 feed: when wave 4 first opened, and what was binding.
    firstW4Day,
    bindingBars: firstW4Day != null ? (lastUnready ? lastUnready.short : []) : null,
    bindingSnapshot: lastUnready,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    vetrelEngagement: engage,
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
          row = { run: 'sim-wave4reach', seed, policyId, arm: armed ? 'armed' : 'control',
            crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
        }
        rows.push(row);
        const fn = `${row.arm}-${policyId}-s${seed}.json`;
        fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
        const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
        const w4d = row.firstW4Day != null ? ` unlock@${row.firstW4Day}` : '';
        const bind = row.bindingBars ? ` bind=[${row.bindingBars.join(',')}]` : '';
        console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] ${row.arm} ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4}${w4d}${bind} starv=${row.deaths ? row.deaths.starv : '?'} nat=${row.reachedNational}${row.crashed ? ' CRASHED' : ''}`);
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
    const nat = rs.reduce((t, r) => t + (r.reachedNational | 0), 0);
    const ds = rs.map(r => r.gameDays).sort((x, y) => x - y);
    const med = ds.length ? ds[Math.floor(ds.length / 2)] : 0;
    const causes = {};
    for (const r of rs) for (const [c, n] of Object.entries(r.deaths.byCause)) causes[c] = (causes[c] || 0) + n;
    const bindTally = {};
    const unlockDays = [];
    for (const r of rs) {
      if (r.firstW4Day != null) {
        unlockDays.push({ seed: r.seed, policyId: r.policyId, day: r.firstW4Day, bind: r.bindingBars });
        for (const b of (r.bindingBars || [])) bindTally[b] = (bindTally[b] || 0) + 1;
      }
    }
    byArm[a] = { n: rs.length, w4unlocks: w4, starvDeaths: starv, nationalReach: nat,
      medianDays: med, causes, unlockDays, bindTally };
  }
  const summary = { run: 'sim-wave4reach', sweepCommit: SWEEP_COMMIT, seeds: SEEDS, policies: POLICIES,
    arms: byArm, rows: rows.map(r => ({ seed: r.seed, policyId: r.policyId, arm: r.arm,
      days: r.days, endReason: r.endReason, w4: (r.maxWaveUnlocked || 1) >= 4,
      firstW4Day: r.firstW4Day, bindingBars: r.bindingBars, starv: r.deaths && r.deaths.starv,
      national: r.reachedNational })) };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'wave4reach-sweep-summary-20261017.json'), JSON.stringify(summary, null, 1));
  console.log('\n== SUMMARY ==');
  for (const a of ['control', 'armed']) {
    const b = byArm[a];
    console.log(`${a}: n=${b.n} w4-unlocks=${b.w4unlocks} starv=${b.starvDeaths} national=${b.nationalReach} medianDays=${b.medianDays}`);
    console.log(`  causes: ${JSON.stringify(b.causes)}`);
    console.log(`  unlocks: ${JSON.stringify(b.unlockDays)}`);
    console.log(`  binding bars: ${JSON.stringify(b.bindTally)}`);
  }
  const d = byArm.armed.w4unlocks - byArm.control.w4unlocks;
  console.log(`PRIMARY: armed-control = ${d} (GO needs >= +3)`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
