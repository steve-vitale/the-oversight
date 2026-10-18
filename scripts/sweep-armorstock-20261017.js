#!/usr/bin/env node
// scripts/sweep-armorstock-20261017.js — the quartermaster-protocol instrument
// sweep (flesh-out loop arm sim-armorstock, 2026-10-17, scale-onramp axis).
//
// PRIMARY (binding, pre-registered in evidence/2026-10-17/sim-armorstock.md):
//   wave-4 unlock share armed (ARMORSTOCK=1) >= control (ARMORSTOCK unset) + 3
//   on the pre-seat wave-4 deferral substrate.
// SECONDARY (report-only): deferral armor-margin coverage (share of deferral
//   runs with armor bar met at margin >= 2, i.e. 6+ armored).
// GUARDRAILS (kill conditions): starvation deaths armed > control+2; median
//   survival armed < control-10d; any new death mode on armed; wave-4 unlocks
//   bought with mass death.
//
// Design: 8 FRESH seeds (4101117..4871831, 0 filename hits across evidence/
// — verified 2026-10-17) x {leadfeast, belongfeast} (SD.leadseat/SD.belongseat,
// the exact vetshape policyFor mapping) x {control: ARMORSTOCK unset,
// armed: ARMORSTOCK=1} = 32 runs, identical seeds per arm, 180d death-aware
// horizons. The armed side wraps the base in AS.withArmorstock (zero src/js).
//
// Substrate (asserted at startup): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 EXPLICIT both arms
// (pre-seat: the seat driver delegates to the windefer-wrapped tribfloor
// stack), ALLOWGATE2 unset. The sweep-time master commit is recorded in every
// per-seed JSON.
//
// Per-seed JSONs land in evidence/2026-10-17/perseed-armorstock/ (sims write
// once, on purpose, into evidence/<date>/). A summary JSON + console table
// are printed at the end.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 node scripts/sweep-armorstock-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const AS = require('./policies/armorstock');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SWEEP_COMMIT = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: __dirname, encoding: 'utf8' }).trim(); }
  catch (e) { return 'unknown'; }
})();

const SEEDS = [4101117, 4211219, 4321321, 4431423, 4541525, 4651627, 4761729, 4871831];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-armorstock');

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
  if (process.env.SEATDRIVE !== '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be EXPLICIT 0 (pre-seat substrate).');
}

function baseFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
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

// Per-villager P census (read-only) — for the deferral worn-depth read.
function censusP(G) {
  const rows = [];
  try {
    const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
    const eq = S.equipment || {};
    const itemDefs = (G.data && G.data.items) || [];
    const roster = ((G.state && G.state.village && G.state.village.roster) || []);
    const scholarId = G.villagerId;
    for (const vid of roster) {
      if (vid === scholarId) {
        let P = 0;
        try { P = (typeof G.armorBonus === 'function') ? (G.armorBonus() | 0) : 0; } catch (e) {}
        rows.push({ vid, scholar: true, P });
        continue;
      }
      let vp = null;
      try { vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; } catch (e) { vp = null; }
      if (!vp || vp.dead) continue;
      let P = 0;
      try { P = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0; } catch (e) {}
      rows.push({ vid, scholar: false, P });
    }
  } catch (e) {}
  return rows;
}

async function runOne(seed, policyId, armed) {
  assertSubstrate();
  if (armed) process.env.ARMORSTOCK = '1'; else delete process.env.ARMORSTOCK;
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = baseFor(policyId);
  const { Game } = await loadGame({ seed, mode: `armorstock-${armed ? 'armed' : 'control'}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = armed ? AS.withArmorstock(base, `armorstock-${policyId}`, 'quartermaster protocol') : Object.assign({}, base);
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const oDaily = policy.daily;
  let firstW4Day = null, lastUnready = null, deferralDepth = null;
  let armorstockOn = null, asCtxSnap = null;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const day = G.state.scholar.day;
      if (firstW4Day == null && typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4) {
        firstW4Day = day;
      }
      if (firstW4Day == null && typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready) {
          lastUnready = { day, armored: rd.armored, armed: rd.armed, tricks: rd.tricks,
            veterans: rd.veterans, short: rd.short };
          deferralDepth = censusP(G);
        }
      }
      // arm-leg engagement snapshot (armed side; control must stay null)
      if (armed) {
        asCtxSnap = {
          asRecovered: ctx.asRecovered | 0, asCrafted: ctx.asCrafted | 0,
          asReservePeak: ctx.asReservePeak | 0, asSuccessions: ctx.asSuccessions | 0,
          asCraftTries: ctx.asCraftTries | 0, asRecoveryTries: ctx.asRecoveryTries | 0,
        };
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);
  try { armorstockOn = (process.env.ARMORSTOCK === '1'); } catch (e) {}
  const deaths = (result.samples && result.samples.deaths) || [];
  const ds = deathCauseSummary(deaths);
  let readiness = null, standing = null, national = 0;
  try { readiness = Game.waveCombatReadiness(4); } catch (e) {}
  try { standing = Game.villageStanding(); } catch (e) {}
  try {
    const v = Game.state.village || {};
    const rank = v.scaleRank || v.rank || '';
    national = (rank === 'national' || rank === 'global') ? 1 : 0;
  } catch (e) {}
  const reserveNow = (() => { try { return AS.reservePieces(Game).length; } catch (e) { return null; } })();
  const scholarPNow = (() => { try { return AS.scholarWornP(Game); } catch (e) { return null; } })();
  return {
    run: 'sim-armorstock', axis: 'scale-onramp',
    seed, policyId, arm: armed ? 'armed' : 'control', armorstock: armorstockOn ? 1 : 0,
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, SEATDRIVE: 0 },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, national,
    maxWaveUnlocked: result.maxWaveUnlocked || 1, firstW4Day,
    standingTotal: standing ? (standing.total | 0) : null,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    deferralSnapshot: lastUnready, deferralDepth,
    deferralArmorMargin: lastUnready ? (lastUnready.armored - 4) : null,
    armorstockCounters: asCtxSnap, // armed side only; null on control
    reserveNow, scholarPNow,
    deaths: { total: ds.total, starv: ds.starv, byCause: ds.byCause },
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
          row = { run: 'sim-armorstock', seed, policyId, arm: armed ? 'armed' : 'control',
            crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
        }
        rows.push(row);
        const fn = `${row.arm}-${policyId}-s${seed}.json`;
        fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
        const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
        const dm = row.deferralArmorMargin;
        console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] ${row.arm} ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4} deferMargin=${dm} starv=${row.deaths ? row.deaths.starv : '?'}${row.crashed ? ' CRASHED' : ''}`);
      }
    }
  }
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
    const deferrals = rs.filter(r => r.deferralSnapshot);
    const margin2 = deferrals.filter(r => (r.deferralArmorMargin | 0) >= 2).length;
    byArm[a] = { n: rs.length, w4unlocks: w4, starvDeaths: starv, medianDays: med,
      causes, deferrals: deferrals.length, deferralMargin2: margin2 };
  }
  const summary = { run: 'sim-armorstock', sweepCommit: SWEEP_COMMIT, seeds: SEEDS, policies: POLICIES,
    arms: byArm, rows: rows.map(r => ({ seed: r.seed, policyId: r.policyId, arm: r.arm,
      days: r.days, endReason: r.endReason, w4: (r.maxWaveUnlocked || 1) >= 4,
      firstW4Day: r.firstW4Day, deferralMargin: r.deferralArmorMargin,
      starv: r.deaths && r.deaths.starv, reserveNow: r.reserveNow, scholarPNow: r.scholarPNow })) };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'armorstock-sweep-summary-20261017.json'), JSON.stringify(summary, null, 1));
  console.log('\n== SUMMARY ==');
  for (const a of ['control', 'armed']) {
    const b = byArm[a];
    console.log(`${a}: n=${b.n} w4-unlocks=${b.w4unlocks} starv=${b.starvDeaths} medianDays=${b.medianDays} deferrals=${b.deferrals} margin2=${b.deferralMargin2}`);
    console.log(`  causes: ${JSON.stringify(b.causes)}`);
  }
  const d = byArm.armed.w4unlocks - byArm.control.w4unlocks;
  const dm = byArm.armed.deferralMargin2 - byArm.control.deferralMargin2;
  console.log(`PRIMARY: armed-control w4-unlocks = ${d} (GO needs >= +3)`);
  console.log(`SECONDARY: armed-control deferral-margin2 = ${dm}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
