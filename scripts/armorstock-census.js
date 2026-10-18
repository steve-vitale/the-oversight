#!/usr/bin/env node
// scripts/armorstock-census.js — durable-armor census on current master
// (flesh-out loop arm sim-armorstock, 2026-10-17, axis scale-onramp).
//
// READ-ONLY vs the game: ZERO src/js changes, ZERO scripts/policies changes.
// This sweeps 8 FRESH seeds x {leadfeast, belongfeast} on the control stack
// (ARMORSTOCK unset — the policy file does not even need to exist) and
// records, per run:
//   (a) trophy-armor ACQUISITION: new P>=15 armor pieces entering the
//       village per 30d window (stock-flow: worn + scholar-pack + villager
//       packs sampled every 30d; first-appearance day per piece-id);
//       hide_armor crafts counted by wrapping Game.craft in the harness
//       (instrumentation, not game code).
//   (b) ARMORY STOCKPILE over time: trophy pieces (P>=15 single piece)
//       held in the scholar's pack (the reserve proxy) + worn, per 30d.
//   (c) WORN-DEPTH at wave-4 deferral: per-villager P census at the last
//       unready sample before first wave-4 unlock (bindingSnapshot style);
//       100% attribution — every run carries its deferral census or an
//       explicit reason (e.g. unlocked before first sample, never deferred).
//   (d) wall numbers: national/table/wins, wave-4 unlocks, median survival,
//       death-cause shares.
//
// Substrate (asserted at startup): FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
// RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 — the pre-seat wave-4
// deferral substrate (same as sim-vetshape, for comparability; SEATDRIVE=0
// avoids win-truncation confounding the deferral reads). The sweep-time
// master commit is recorded in every per-seed JSON.
//
// Per-seed JSONs land in evidence/2026-10-17/perseed-armorstock-census/
// (sims write once, on purpose, into evidence/<date>/).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     SEATDRIVE=0 node scripts/armorstock-census.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SWEEP_COMMIT = (() => {
  try { return execSync('git rev-parse HEAD', { cwd: __dirname, encoding: 'utf8' }).trim(); }
  catch (e) { return 'unknown'; }
})();

// 8 FRESH seeds (0 filename hits across evidence/ — verified 2026-10-17
// before this script ran).
const SEEDS = [4101117, 4211219, 4321321, 4431423, 4541525, 4651627, 4761729, 4871831];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-armorstock-census');
const TROPHY_P = 15; // single piece qualifying a fighter at the P>=15 bar

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required.`);
  }
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore.');
  if (process.env.SEATDRIVE !== '0')
    throw new Error('SUBSTRATE STOP: SEATDRIVE must be EXPLICIT 0 (pre-seat substrate).');
  if (process.env.ARMORSTOCK === '1')
    throw new Error('SUBSTRATE STOP: ARMORSTOCK=1 set — census is control-only.');
}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

function protOfDef(def) {
  try { return (def && def.armor && def.armor.protection) || 0; } catch (e) { return 0; }
}
function itemIdOf(it) {
  if (!it) return null;
  if (typeof it === 'string') return it;
  return it.itemId || it.id || null;
}

// Full village armor stock snapshot (read-only). Trophy = def.armor
// protection >= 15 (single piece qualifies a fighter at the wave-4 bar).
function armorStock(G) {
  const out = { scholarWornP: 0, scholarPackTrophy: 0, scholarPackTrophyIds: [],
    villagerWornTrophy: 0, villagerPackTrophy: 0, totalTrophy: 0,
    perVillagerP: [], trophyIds: [] };
  try {
    const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
    const eq = S.equipment || {};
    const itemDefs = (G.data && G.data.items) || [];
    const defById = {};
    for (const d of itemDefs) if (d && d.id) defById[d.id] = d;
    const isTrophy = (iid) => protOfDef(defById[iid]) >= TROPHY_P;
    // scholar
    try { out.scholarWornP = (typeof G.armorBonus === 'function') ? (G.armorBonus() | 0) : 0; } catch (e) {}
    try {
      const inv = ((G.state || {}).scholar || {}).inventory || [];
      for (const it of inv) {
        const iid = itemIdOf(it);
        if (iid && isTrophy(iid)) { out.scholarPackTrophy++; out.scholarPackTrophyIds.push(iid); out.trophyIds.push('pack:' + iid); }
      }
    } catch (e) {}
    // villagers
    const roster = ((G.state && G.state.village && G.state.village.roster) || []);
    const scholarId = G.villagerId;
    for (const vid of roster) {
      if (vid === scholarId) continue;
      let vp = null;
      try { vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; } catch (e) { vp = null; }
      if (!vp || vp.dead) continue;
      let P = 0;
      try { P = (eq && typeof eq.armorOf === 'function') ? (eq.armorOf(vp, itemDefs) | 0) : 0; } catch (e) {}
      let name = vid;
      try { name = (typeof G.displayName === 'function' && G.displayName(vid)) || (vp && vp.name) || vid; } catch (e) {}
      out.perVillagerP.push({ vid, name, P, demandMet: P >= TROPHY_P });
      try {
        const eqt = (vp && vp.equipped) || {};
        for (const s of Object.keys(eqt)) {
          const e = eqt[s]; if (!e) continue;
          const iid = (typeof e === 'string') ? e : (e.itemId || e.id);
          if (iid && isTrophy(iid)) { out.villagerWornTrophy++; out.trophyIds.push('worn:' + iid); }
        }
        for (const it of (vp.items || [])) {
          const iid = itemIdOf(it);
          if (iid && isTrophy(iid)) { out.villagerPackTrophy++; out.trophyIds.push('vpack:' + iid); }
        }
      } catch (e) {}
    }
    // scholar worn trophy pieces
    try {
      const eqt = ((G.state || {}).scholar || {}).equipped || {};
      for (const s of Object.keys(eqt)) {
        const e = eqt[s]; if (!e) continue;
        const iid = (typeof e === 'string') ? e : (e.itemId || e.id);
        if (iid && isTrophy(iid)) out.trophyIds.push('sworn:' + iid);
      }
    } catch (e) {}
    out.totalTrophy = out.trophyIds.length;
  } catch (e) { out.error = String(e && e.message); }
  return out;
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

async function runOne(seed, policyId) {
  assertSubstrate();
  delete process.env.ARMORSTOCK;
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `armorstock-census`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  // Craft instrumentation (harness-side wrap, not game code): count
  // hide_armor / bark_armor crafts by the scholar.
  const crafts = { hide_armor: 0, bark_armor: 0, other: 0 };
  const oCraft = Game.craft;
  if (typeof oCraft === 'function') {
    Game.craft = function (id, ...rest) {
      let r;
      try { r = oCraft.call(this, id, ...rest); } catch (e) { r = null; }
      try {
        if (id === 'hide_armor') crafts.hide_armor++;
        else if (id === 'bark_armor') crafts.bark_armor++;
        else crafts.other++;
      } catch (e) {}
      return r;
    };
  }
  const stockSeries = [];   // every-30d armor stock snapshots
  const seenTrophy = {};    // trophy piece-id -> first-seen day
  let firstW4Day = null, lastUnready = null, deferralCensus = null;
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try {
      const day = G.state.scholar.day;
      if (firstW4Day == null && typeof G.unlockedWave === 'function' && G.unlockedWave() >= 4) {
        firstW4Day = day;
      }
      if (day % 30 === 0 || day === 1) {
        const st = armorStock(G);
        stockSeries.push(Object.assign({ day }, st));
        for (const tid of (st.trophyIds || [])) {
          const key = tid.replace(/^(pack|worn|vpack|sworn):/, '');
          if (!(key in seenTrophy)) seenTrophy[key] = { firstDay: day, firstLoc: tid.split(':')[0] };
        }
      }
      if (firstW4Day == null && typeof G.waveCombatReadiness === 'function') {
        const rd = G.waveCombatReadiness(4);
        if (rd && !rd.ready) {
          lastUnready = { day, armored: rd.armored, armed: rd.armed, tricks: rd.tricks,
            veterans: rd.veterans, short: rd.short, perVillagerP: armorStock(G).perVillagerP };
        }
      }
    } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);
  // deferral census: the last unready sample, or explicit attribution
  if (lastUnready) deferralCensus = lastUnready;
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
  // acquisition: new trophy pieces per 30d window (first-appearance days)
  const acquisitions = Object.entries(seenTrophy).map(([id, v]) => ({ id, firstDay: v.firstDay, firstLoc: v.firstLoc }));
  acquisitions.sort((a, b) => a.firstDay - b.firstDay);
  return {
    run: 'sim-armorstock-census', axis: 'scale-onramp',
    seed, policyId, arm: 'control',
    sweepCommit: SWEEP_COMMIT,
    substrate: { FEASTSCALE_R13: 1, TRIBFLOOR: 1, SUCCGRACE: 1, RAIDDENSITY: 1,
      WINPURSUIT: 1, WINDEFER: 1, SEATDRIVE: 0 },
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0, national, tableWaiting: !!(Game.progState && Game.progState().tableWaiting),
    maxWaveUnlocked: result.maxWaveUnlocked || 1, firstW4Day,
    standingTotal: standing ? (standing.total | 0) : null,
    readiness4: readiness ? { ready: readiness.ready, armored: readiness.armored,
      armed: readiness.armed, tricks: readiness.tricks, veterans: readiness.veterans,
      short: readiness.short } : null,
    deferralCensus, // null only if never deferred (unlocked w4 before any unready sample, or never reached t4-1)
    deferralAttributed: deferralCensus ? true : (firstW4Day != null ? 'unlocked-before-sample' : 'never-deferred'),
    stockSeries, acquisitions, crafts,
    deaths: { total: ds.total, starv: ds.starv, byCause: ds.byCause },
  };
}

(async () => {
  assertSubstrate();
  fs.mkdirSync(EVID, { recursive: true });
  console.log(`sweep-time master commit: ${SWEEP_COMMIT}`);
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const t0 = Date.now();
      let row;
      try {
        row = await runOne(seed, policyId);
      } catch (e) {
        console.error(`CRASH control ${policyId} s${seed}: ${e && e.message}`);
        row = { run: 'sim-armorstock-census', seed, policyId, arm: 'control',
          crashed: true, error: String(e && e.message), sweepCommit: SWEEP_COMMIT };
      }
      rows.push(row);
      const fn = `control-${policyId}-s${seed}.json`;
      fs.writeFileSync(path.join(EVID, fn), JSON.stringify(row, null, 1));
      const w4 = row.maxWaveUnlocked >= 4 ? 'W4' : 'w3-';
      const acq = row.acquisitions ? row.acquisitions.length : '?';
      console.log(`  [${((Date.now() - t0) / 1000).toFixed(0)}s] control ${policyId} s${seed}: days=${row.days} end=${row.endReason} ${w4} trophyAcq=${acq} crafts=${row.crafts ? JSON.stringify(row.crafts) : '?'}${row.crashed ? ' CRASHED' : ''}`);
    }
  }
  const good = rows.filter(r => !r.crashed);
  const summary = { run: 'sim-armorstock-census', sweepCommit: SWEEP_COMMIT, seeds: SEEDS,
    policies: POLICIES,
    rows: rows.map(r => ({ seed: r.seed, policyId: r.policyId, days: r.days,
      endReason: r.endReason, w4: (r.maxWaveUnlocked || 1) >= 4, firstW4Day: r.firstW4Day,
      trophyAcq: r.acquisitions ? r.acquisitions.length : null, crafts: r.crafts,
      deferralAttributed: r.deferralAttributed, starv: r.deaths && r.deaths.starv })) };
  fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-17', 'armorstock-census-summary-20261017.json'),
    JSON.stringify(summary, null, 1));
  console.log('\n== CENSUS SUMMARY ==');
  for (const r of summary.rows) {
    console.log(`s${r.seed} ${r.policyId}: ${r.w4 ? 'W4@' + r.firstW4Day : 'no-w4'} deferral=${r.deferralAttributed} trophyAcq=${r.trophyAcq}`);
  }
})().catch(e => { console.error('CENSUS CRASH:', e); process.exit(2); });
