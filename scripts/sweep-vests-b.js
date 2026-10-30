#!/usr/bin/env node
// scripts/sweep-vests-b.js — vest-acquisition census driver (DIAG ONLY,
// sim-vests-b, backlog #1494). Instrument, never game code: it wraps a
// policy's daily with a READ-ONLY census and records tele events, on
// identical seeds, for two columns (competent vs leanlink).
//
// What the stock sweep MISSES (and this census covers):
//   - sweep-compare stdSnapshot counts ONLY the scholar's pack/equipped,
//     and reads entry `.id` while inventory entries are stored under
//     `.itemId`. A villager-held vest, a stashed vest, or an itemId-stored
//     vest all read as 0 there.
//   - This census scans, every day + day 0 + end of run: the scholar's
//     pack/equipped; EVERY roster villager's items/equipped/stashed/
//     villageShare/fullPool (generation pool, reported separately from
//     held); and the village stash armor pile (state.village.stash.armor,
//     read directly, never via stashState() which would initialize it).
//   - Holder identity: 'scholar' for state.scholar, villager id otherwise.
//     The current bearer <redacted> person record is NOT double-counted: its live
//     pack IS state.scholar, so person items/equipped/stashed are skipped
//     for the bearer vid (its fullPool is still recorded as generation
//     evidence). Dead persons (person.dead) are reported as deadHolders,
//     never counted as holding.
//   - PERCEPTION LAW: the recorder reads game state only. It never feeds
//     a roster, list, or census result into any villager decision, and it
//     never calls a game verb. hierarchyState()/scaleRank()/
//     deedGateReady()/tableSeat() are pure reads already used by policies.
//
// Usage (one process per column — the LEANLINK env gate must not leak
// into the competent column):
//   SEEDS="9911,...,9918" POLICY=competent DAYS=180 \
//     OUT=evidence/2026-10-30/sim-vests-b-corpus-competent.json \
//     PERSEED_DIR=evidence/2026-10-30/sim-vests-b-corpus-competent \
//     node scripts/sweep-vests-b.js
//   LEANLINK=1 SEEDS="9911,...,9918" POLICY=leanlink DAYS=180 \
//     OUT=evidence/2026-10-30/sim-vests-b-corpus-leanlink.json \
//     PERSEED_DIR=evidence/2026-10-30/sim-vests-b-corpus-leanlink \
//     node scripts/sweep-vests-b.js
//
// Output JSON contains NO wall-clock timestamps (determinism gate:
// re-runs byte-identical). Per-seed files under PERSEED_DIR hold the
// full census (first-seen events, holder histories, gate states).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { leanlink } = require('./policies/leanlink');

const VEST_IDS = ['military_vest', 'swat_vest'];
const POLICY_MAP = { competent, leanlink };

function entryId(e) {
  if (!e) return null;
  if (typeof e === 'string') return e;
  return e.itemId || e.id || e.plantId || null;
}
function personName(Game, vid) {
  try {
    const p = (Game.data.villagers || []).find(x => x && x.id === vid);
    if (p && p.name) return p.name;
    const rc = (((Game.state || {}).village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  return String(vid || '?').slice(0, 24);
}

// scan(Game) -> { held: [{holder, holderName, location, vestId}],
//   stashed: [...], pools: [...], armory: [...], deadHolders: [...] }
// held = pack or equipped, live holders only. stashed/pools/armory are
// reported separately and NEVER folded into held counts.
function scan(Game) {
  const held = [], stashed = [], pools = [], armory = [], deadHolders = [];
  const push = (arr, holder, vestId, location) => {
    arr.push({ holder, holderName: holder === 'scholar' ? 'scholar' : personName(Game, holder), location, vestId });
  };
  try {
    const s = Game.state.scholar || {};
    for (const it of (s.inventory || [])) {
      const id = entryId(it);
      if (VEST_IDS.includes(id)) push(held, 'scholar', id, 'pack');
    }
    for (const v of Object.values(s.equipped || {})) {
      const id = entryId(v);
      if (VEST_IDS.includes(id)) push(held, 'scholar', id, 'equipped');
    }
  } catch (e) {}
  try {
    const roster = ((Game.state.village || {}).roster || []);
    const bearer = Game.villagerId;
    for (const vid of roster) {
      const p = (Game.data.villagers || []).find(x => x && x.id === vid)
        || (Game.data.background_survivors || []).find(x => x && x.id === vid);
      if (!p) continue;
      // Generation pool: always recorded, never counted as held.
      for (const it of (p.fullPool || [])) {
        const id = entryId(it);
        if (VEST_IDS.includes(id)) push(pools, vid, id, 'fullPool');
      }
      if (p.dead) {
        for (const it of (p.items || [])) {
          const id = entryId(it);
          if (VEST_IDS.includes(id)) push(deadHolders, vid, id, 'pack(dead)');
        }
        continue;
      }
      if (vid === bearer) continue; // live pack is state.scholar, counted above
      for (const it of (p.items || [])) {
        const id = entryId(it);
        if (VEST_IDS.includes(id)) push(held, vid, id, 'pack');
      }
      for (const v of Object.values(p.equipped || {})) {
        const id = entryId(v);
        if (VEST_IDS.includes(id)) push(held, vid, id, 'equipped');
      }
      for (const it of (p.stashed || [])) {
        const id = entryId(it);
        if (VEST_IDS.includes(id)) push(stashed, vid, id, 'stashed');
      }
      for (const it of (p.villageShare || [])) {
        const id = entryId(it);
        if (VEST_IDS.includes(id)) push(stashed, vid, id, 'villageShare');
      }
    }
  } catch (e) {}
  try {
    const pile = (((Game.state.village || {}).stash || {}).armor || []);
    for (const it of pile) {
      const id = entryId(it);
      if (VEST_IDS.includes(id)) push(armory, 'armory', id, 'armory');
    }
  } catch (e) {}
  return { held, stashed, pools, armory, deadHolders };
}

function gateState(Game) {
  const g = { rank: 'village', nationalLive: false, links: [], deed: null, seat: null };
  try { g.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { g.nationalLive = !!Game.state.nationalLive; } catch (e) {}
  try {
    const links = Game.hierarchyState ? Game.hierarchyState() : [];
    g.links = (links || []).filter(l => l && l.status === 'active').map(l => ({
      primary: l.primary, subordinate: l.subordinate, trust: l.trust,
      ageDays: l.ageDays != null ? l.ageDays : null, conquered: !!l.conquered,
    }));
  } catch (e) {}
  try {
    const d = Game.deedGateReady ? Game.deedGateReady() : null;
    if (d) {
      g.deed = { ok: !!d.ok, waves: !!d.waves, contests: !!d.contests, crises: !!d.crises,
        scale: !!d.scale, stageOk: !!d.stageOk, foodDeeds: !!d.foodDeeds, stage: d.stage,
        w1: d.w1, w2: d.w2, w3: d.w3, w4: d.w4, w5: d.w5, contestsN: d.contestsN,
        crisesN: d.crisesN, rank: d.rank };
    }
  } catch (e) {}
  try {
    const t = Game.tableSeat ? Game.tableSeat() : null;
    if (t) g.seat = { seat: t.seat || 'none', detail: t.detail || null };
  } catch (e) {}
  return g;
}

async function runSeed(seed, policyId, days) {
  const base = POLICY_MAP[policyId];
  if (!base) throw new Error('unknown policy: ' + policyId);
  const { Game, manifest } = await loadGame({ seed, mode: 'vests-b-' + policyId, fullTelemetry: false });
  await setupGame(Game);
  const census = {
    firstSeenHeld: [], firstSeenStashed: [], firstSeenPool: [], firstSeenArmory: [],
    teleVestEvents: [], dailyMaxHeld: 0, sweepVests: 0,
  };
  const seenHeld = new Set(), seenStashed = new Set(), seenPool = new Set(), seenArmory = new Set();
  let day0 = null, lastCtx = null;
  const takeCensus = (label) => {
    let day = 0;
    try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
    const s = scan(Game);
    const key = (h) => h.holder + '|' + h.vestId + '|' + h.location;
    for (const h of s.held) {
      const k = key(h);
      if (!seenHeld.has(k)) { seenHeld.add(k); census.firstSeenHeld.push({ day, label, ...h }); }
    }
    for (const h of s.stashed) {
      const k = key(h);
      if (!seenStashed.has(k)) { seenStashed.add(k); census.firstSeenStashed.push({ day, label, ...h }); }
    }
    for (const h of s.pools) {
      const k = key(h);
      if (!seenPool.has(k)) { seenPool.add(k); census.firstSeenPool.push({ day, label, ...h }); }
    }
    for (const h of s.armory) {
      const k = key(h);
      if (!seenArmory.has(k)) { seenArmory.add(k); census.firstSeenArmory.push({ day, label, ...h }); }
    }
    census.dailyMaxHeld = Math.max(census.dailyMaxHeld, s.held.length);
    // Sweep-definition recount (scholar only, itemId-aware) for
    // comparability with sim-wall-b's 0/8.
    const scholarHeld = s.held.filter(h => h.holder === 'scholar').length;
    census.sweepVests = Math.max(census.sweepVests, scholarHeld);
    return s;
  };
  // Tele recorder: installed BEFORE runDays, so runDays' own tele wrap
  // chains through it (runDays restores Game.tele to this wrapper).
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'loot_dropped' || type === 'loot_taken' || type === 'broadcast_item_prize') {
        const id = (data && (data.id || data.itemId)) || null;
        if (VEST_IDS.includes(id)) {
          census.teleVestEvents.push({ day: (Game.state.scholar || {}).day || 0, type, id,
            to: data.to || null, who: data.who || null, tier: data.tier != null ? data.tier : null });
        }
      }
    } catch (e) {}
    return r;
  };
  day0 = takeCensus('day0');
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    try { takeCensus('daily'); } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  if (typeof base.setup === 'function') {
    policy.setup = (G, ctx) => { lastCtx = ctx; return base.setup(G, ctx); };
  }
  const result = await runDays(Game, policy, { days, manifest, sampleEvery: 10 });
  const endScan = takeCensus('end');
  const endGate = gateState(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let maxRank = 'village', maxArc = 1;
  try { maxRank = endGate.rank; } catch (e) {}
  try { maxArc = Game.progState ? (Game.progState().arc || 1) : 1; } catch (e) {}
  // Max rank/arc over the run come from runDays samples (scale curve) and
  // the end gate; the end gate is authoritative for the final state, and
  // samples.scale holds the trajectory. Report both, never merge silently.
  const scaleCurve = (result.samples.scale || []).map(([d, r]) => [d, r]);
  const rankOrder = { village: 0, regional: 1, national: 2, global: 3 };
  for (const [, r] of scaleCurve) if ((rankOrder[r] || 0) > (rankOrder[maxRank] || 0)) maxRank = r;
  const court = {};
  try {
    if (lastCtx) {
      for (const k of ['proposedLead', 'courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls']) {
        if (lastCtx[k] != null) court[k] = lastCtx[k];
      }
    }
  } catch (e) {}
  const row = {
    policy: policyId, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: Game.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc,
    maxRank,
    national: (rankOrder[maxRank] || 0) >= 2 ? 1 : 0,
    table: 0, entered: 0, // vest census rows do not re-derive table; panel rows carry it
    vestsEverHeld: census.firstSeenHeld.length,
    vestsEverHeldByHolder: census.firstSeenHeld,
    vestsSweepMax: census.sweepVests,
    vestsDailyMaxHeld: census.dailyMaxHeld,
    stashedFirstSeen: census.firstSeenStashed,
    poolsFirstSeen: census.firstSeenPool,
    armoryFirstSeen: census.firstSeenArmory,
    teleVestEvents: census.teleVestEvents,
    day0Held: day0.held, day0Stashed: day0.stashed, day0Pools: day0.pools, day0Armory: day0.armory,
    endHeld: endScan.held, endStashed: endScan.stashed, endPools: endScan.pools, endArmory: endScan.armory,
    endGate,
    court,
    deaths,
    pacing: result.pacing ? { verbs: result.pacing.meanDeliberatePerDay } : null,
  };
  try {
    const pg = Game.progState ? Game.progState() : {};
    row.table = pg.tableWaiting ? 1 : 0;
    row.entered = pg.tableDone ? 1 : 0;
  } catch (e) {}
  console.log(`  [${policyId} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} rank=${row.maxRank} national=${row.national} everHeld=${row.vestsEverHeld} sweepMax=${row.vestsSweepMax} pools=${row.poolsFirstSeen.length} stashed=${row.stashedFirstSeen.length}`);
  return row;
}

async function main() {
  const policyId = process.env.POLICY || 'competent';
  const seeds = (process.env.SEEDS || '9911,9912,9913,9914,9915,9916,9917,9918').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT;
  const perSeedDir = process.env.PERSEED_DIR;
  if (policyId === 'leanlink' && process.env.LEANLINK !== '1') {
    console.error('REFUSAL: leanlink column requires LEANLINK=1 in this process (default-OFF gate).');
    process.exit(2);
  }
  if (perSeedDir) fs.mkdirSync(perSeedDir, { recursive: true });
  const runs = [];
  for (const seed of seeds) {
    const row = await runSeed(seed, policyId, days);
    runs.push(row);
    if (perSeedDir) fs.writeFileSync(path.join(perSeedDir, `seed-${seed}.json`), JSON.stringify(row, null, 1) + '\n');
  }
  const report = { label: 'sim-vests-b', policy: policyId, seeds, days,
    runs,
    byPolicy: {
      n: runs.length,
      won: runs.reduce((t, r) => t + r.won, 0),
      medianDays: runs.map(r => r.days).sort((a, b) => a - b)[Math.floor(runs.length / 2)] || 0,
      maxDays: Math.max.apply(null, runs.map(r => r.days).concat([0])),
      maxWave: Math.max.apply(null, runs.map(r => r.waveReach).concat([1])),
      national: runs.reduce((t, r) => t + r.national, 0),
      table: runs.reduce((t, r) => t + r.table, 0),
      entered: runs.reduce((t, r) => t + r.entered, 0),
      vestsEverHeld: runs.reduce((t, r) => t + r.vestsEverHeld, 0),
      vestsSweepMax: runs.reduce((t, r) => t + r.vestsSweepMax, 0),
      pools: runs.reduce((t, r) => t + r.poolsFirstSeen.length, 0),
      stashed: runs.reduce((t, r) => t + r.stashedFirstSeen.length, 0),
    },
  };
  if (out) { fs.writeFileSync(out, JSON.stringify(report, null, 1) + '\n'); console.log('wrote ' + out); }
  return report;
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
module.exports = { scan, gateState, entryId, VEST_IDS, runSeed };
