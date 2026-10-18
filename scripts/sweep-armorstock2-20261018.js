#!/usr/bin/env node
// scripts/sweep-armorstock2-20261018.js — the quartermaster-protocol RETRY
// sweep (flesh-out loop arm sim-armorstock2, 2026-10-18, scale-onramp axis;
// the armorbreak NAMED RETRY).
//
// PRIMARY (binding, pre-registered in evidence/2026-10-18/sim-armorstock2.md):
//   median over qualifying pairs of (armed.deferralMargin - control.deferralMargin) >= +1.0 piece,
//   where deferralMargin = rd.armored - 4 at the LAST wave-4-unready day, and a
//   qualifying pair = both runs have a deferral read AND neither run won
//   (non-winning pairs per the w5reach lesson — the seatdrive stack truncates
//   at the win ~d90). Miss = NO-GO, never re-scored.
// MEASURABILITY FLOOR: <6 qualifying pairs -> PRIMARY UNMEASURABLE, file the
//   all-pairs deferral-margin census as the diagnostic, SUBSTRATE-STILL-MISSING.
// GUARDRAILS (kill): new death mode (cause-canonicalized); median survival
//   (harness days) armed < control-10d; wins armed < control wins;
//   villager (non-scholar) combat deaths armed > control x 1.25 (§14c co-primary).
//
// Design: 8 FRESH seeds (5102117..5872831, 0 filename hits across evidence/ —
// verified 2026-10-18) x {leadseat, belongseat} (the seatdrive-composed win
// stack + VETREL=1, pre-wrapped as AS.armorstock2Lead/Belong) x {control:
// ARMORSTOCK unset, armed: ARMORSTOCK=1} = 32 runs, identical seeds per arm,
// 180d death-aware. The armed/control delta is ONLY the env var (same policy
// objects both arms).
//
// Substrate (asserted at startup): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 VETREL=1, SEATDRIVE default-ON (unset —
// the seat driver takes the seat; wins truncate ~d90), ALLOWGATE2 unset.
// The sweep-time master commit is recorded in every per-seed JSON.
//
// Per-seed JSONs land in evidence/2026-10-18/perseed-armorstock2/. A summary
// JSON + console table are printed at the end.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     VETREL=1 node scripts/sweep-armorstock2-20261018.js
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

const SEEDS = [5102117, 5212219, 5322321, 5432423, 5542525, 5652627, 5762729, 5872831];
const POLICIES = ['leadseat', 'belongseat'];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-armorstock2');

// Cause canonicalization (2026-10-17 tooling finding): 'thirst'
// (game.js water-rationing) and 'dehydration' (calories.js overnight scholar
// death) are both pre-existing engine water deaths — not new modes.
const NON_COMBAT_CAUSES = /^(starvation|thirst|dehydration|sickness|wound_fever|bad belly|a wound that wouldn.t close|lockjaw|injuries|the phoenix link.*|drowned|froze|burned|unknown)$/i;

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'VETREL']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.SEATDRIVE === '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be default-ON (unset) — the seatdrive win stack.');
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
}

function baseFor(policyId) {
  return policyId === 'leadseat' ? AS.armorstock2Lead : AS.armorstock2Belong;
}

function deathCauseSummary(deaths) {
  const byCause = {};
  let starv = 0, villagerCombat = 0;
  for (const d of (deaths || [])) {
    const c = String((d && d.cause) || 'unknown');
    byCause[c] = (byCause[c] || 0) + 1;
    if (/starv|hunger|famine/i.test(c)) starv++;
    if (!d.player && !NON_COMBAT_CAUSES.test(c)) villagerCombat++; // §14c co-primary
  }
  return { byCause, starv, villagerCombat, total: (deaths || []).length };
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
  const base = baseFor(policyId);
  const { Game } = await loadGame({ seed, mode: `armorstock2-${armed ? 'armed' : 'control'}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
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
          asWore: ctx.asWore | 0, asCraftFails: ctx.asCraftFails | 0,
        };
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== true || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need true) defer=${deferLive} (need true)`);
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
  const won = (() => { try { return Game.won ? 1 : 0; } catch (e) { return 0; } })();
  return {
    run: 'sim-armorstock2', axis: 'scale-onramp',
    seed, policyId, arm: armed ? 'armed' : 'control', armorstock: armorstockOn ? 1 : 0,
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, VETREL: 1, SEATDRIVE: 'default-ON' },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won, national,
    maxWaveUnlocked: result.maxWaveUnlocked || 1, firstW4Day,
    standingTotal: standing ? (standing.total | 0) : null,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    deferralSnapshot: lastUnready, deferralDepth,
    deferralArmorMargin: lastUnready ? (lastUnready.armored - 4) : null,
    armorstockCounters: asCtxSnap, // armed side only; null on control
    reserveNow, scholarPNow,
    deaths: { total: ds.total, starv: ds.starv, villagerCombat: ds.villagerCombat, byCause: ds.byCause },
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
          row = { run: 'sim-armorstock2', seed, policyId, arm: armed ? 'armed' : 'control',
            crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
        }
        rows.push(row);
        const fn = `${row.arm}-${policyId}-s${seed}.json`;
        fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
        const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
        const dm = row.deferralArmorMargin;
        const w = row.won ? 'WON' : '---';
        console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] ${row.arm} ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4} ${w} deferMargin=${dm} starv=${row.deaths ? row.deaths.starv : '?'}${row.crashed ? ' CRASHED' : ''}`);
      }
    }
  }
  const good = rows.filter(r => !r.crashed);
  const byArm = {};
  for (const a of ['control', 'armed']) {
    const rs = good.filter(r => r.arm === a);
    const w4 = rs.filter(r => r.maxWaveUnlocked >= 4).length;
    const wins = rs.filter(r => r.won).length;
    const starv = rs.reduce((t, r) => t + r.deaths.starv, 0);
    const vcomb = rs.reduce((t, r) => t + r.deaths.villagerCombat, 0);
    const ds = rs.map(r => r.days).sort((x, y) => x - y);
    const med = ds.length ? ds[Math.floor(ds.length / 2)] : 0;
    const causes = {};
    for (const r of rs) for (const [c, n] of Object.entries(r.deaths.byCause)) causes[c] = (causes[c] || 0) + n;
    const deferrals = rs.filter(r => r.deferralArmorMargin != null);
    const nat = rs.filter(r => r.national).length;
    byArm[a] = { n: rs.length, w4unlocks: w4, wins, starvDeaths: starv, villagerCombatDeaths: vcomb,
      medianDays: med, causes, deferrals: deferrals.length, national: nat };
  }
  // PRIMARY: paired margin deltas on qualifying (non-winning, both-deferred) pairs
  const key = r => `${r.policyId}-s${r.seed}`;
  const byKey = {};
  for (const r of good) byKey[`${r.arm}:${key(r)}`] = r;
  const deltas = [], allDeltas = [];
  for (const r of good.filter(x => x.arm === 'control')) {
    const a = byKey[`armed:${key(r)}`];
    if (!a) continue;
    if (r.deferralArmorMargin != null && a.deferralArmorMargin != null) {
      const d = a.deferralArmorMargin - r.deferralArmorMargin;
      allDeltas.push(d);
      if (!r.won && !a.won) deltas.push(d);
    }
  }
  const median = xs => { if (!xs.length) return null; const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const summary = { run: 'sim-armorstock2', sweepCommit: SWEEP_COMMIT, seeds: SEEDS, policies: POLICIES,
    arms: byArm,
    primary: { qualifyingPairs: deltas.length, medianPairedDelta: median(deltas), goThreshold: 1.0,
      go: deltas.length >= 6 && median(deltas) >= 1.0 },
    secondary: { allPairsMedianDelta: median(allDeltas), allPairs: allDeltas.length },
    rows: rows.map(r => ({ seed: r.seed, policyId: r.policyId, arm: r.arm,
      days: r.days, endReason: r.endReason, won: r.won, w4: (r.maxWaveUnlocked || 1) >= 4,
      firstW4Day: r.firstW4Day, deferralMargin: r.deferralArmorMargin,
      starv: r.deaths && r.deaths.starv, villagerCombat: r.deaths && r.deaths.villagerCombat,
      reserveNow: r.reserveNow, scholarPNow: r.scholarPNow })) };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-18', 'armorstock2-sweep-summary-20261018.json'), JSON.stringify(summary, null, 1));
  console.log('\n== SUMMARY ==');
  for (const a of ['control', 'armed']) {
    const b = byArm[a];
    console.log(`${a}: n=${b.n} w4-unlocks=${b.w4unlocks} wins=${b.wins} national=${b.national} starv=${b.starvDeaths} vComb=${b.villagerCombatDeaths} medianDays=${b.medianDays} deferrals=${b.deferrals}`);
    console.log(`  causes: ${JSON.stringify(b.causes)}`);
  }
  console.log(`PRIMARY: qualifying pairs=${deltas.length} median paired margin delta=${median(deltas)} (GO needs >= +1.0, >=6 pairs)`);
  console.log(`SECONDARY: all-pairs median delta=${median(allDeltas)} (n=${allDeltas.length})`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
