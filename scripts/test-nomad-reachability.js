#!/usr/bin/env node
// Proof: The Long Way Home — forced-nomad reachability (2026-10-15).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — this binds the run):
//   primary metric: seeds reaching a Long Way Home ending
//     (Game.over && Game.won with state.road ended by endRoad).
//   pilot GO:      >=2/8 seeds DEPART (Game.nomad.start() taken organically
//                  via canLeave().ok — proves both gates fire in real play).
//   confirm GO:    >=4/16 seeds reach an ending (only run if pilot is GO).
//   horizon:       death-aware, cap 200d (no victory before day 90 anyway).
//   seeds:         pilot STD8 [7,42,99,1234,555,777,2026,31337]; SEEDS env
//                  overrides. CONFIRM=1 runs 16.
//   policy:        scripts/policies/nomadseek.js (capable + answer the
//                  Watchers + leave when eligible + drive the road).
// A miss is NO-GO — never re-scored mid-run. Metric doubts go under
// "metric review" in the evidence file and apply to the NEXT run.
//
// What it measures: (1) does global rank ever engage organically
// (viewership >= 32 -> pendingGlobal -> answered -> globalLive)? (2) does
// the knowledge gate ever fire pre-road (scattered kin in a known region)?
// (3) is the road survivable from a real departure state?
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nomadseek } = require('./policies/nomadseek');

const PILOT = [7, 42, 99, 1234, 555, 777, 2026, 31337];
const CONFIRM_EXTRA = [1, 2, 3, 4, 5, 6, 8, 9];
const SEEDS = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const seeds = SEEDS.length ? SEEDS : (process.env.CONFIRM === '1' ? PILOT.concat(CONFIRM_EXTRA) : PILOT);
const DAYS = parseInt(process.env.DAYS || '200', 10);

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function knownKinCount(Game) {
  try {
    const st = Game.state || {};
    const me = Game.villagerId;
    const kin = typeof Game.worldKin === 'function' ? Game.worldKin(me) : [];
    return kin.filter(k => k.fate === 'scattered' && !k.found && k.region &&
      st.world && st.world.regions[k.region] && st.world.regions[k.region].known).length;
  } catch (e) { return -1; }
}
function totalScattered(Game) {
  try {
    const kin = typeof Game.worldKin === 'function' ? Game.worldKin(Game.villagerId) : [];
    return kin.filter(k => k.fate === 'scattered' && !k.found && k.region).length;
  } catch (e) { return -1; }
}

async function oneSeed(seed) {
  const { Game, manifest } = await loadGame({ seed, mode: 'nomad-reach' });
  await setupGame(Game);
  const diag = {
    seed, days: 0, endReason: null, won: false,
    maxRank: 'village', maxViewership: 0,
    pendingGlobalSeen: false, globalLive: false,
    eligibleDay: null, departed: false, departDay: null, departKin: 0,
    endingReached: false, endingReason: null, roadDays: 0,
    knownKinDay1: knownKinCount(Game), scatteredDay1: totalScattered(Game),
    gateDays: {}, lastGate: null, roadDeaths: 0, foodAtDepart: 0,
    nomadNotes: [],
  };
  const base = nomadseek;
  const policy = Object.assign({}, base);
  let lastCtx = null;
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    lastCtx = ctx;
    try {
      const st = G.state || {};
      const day = (st.scholar || {}).day || 0;
      let rank = 'village';
      try { rank = G.scaleRank ? G.scaleRank() : rank; } catch (e) {}
      if ((RANK_ORDER[rank] || 0) > (RANK_ORDER[diag.maxRank] || 0)) diag.maxRank = rank;
      if (st.pendingGlobal) diag.pendingGlobalSeen = true;
      if (st.globalLive) diag.globalLive = true;
      try { diag.maxViewership = Math.max(diag.maxViewership, ((st.village || {}).viewership) | 0); } catch (e) {}
      // Eligibility sampling (not on road).
      let onRoad = false;
      try { onRoad = !!(G.nomad && G.nomad.onRoad && G.nomad.onRoad()); } catch (e) {}
      if (!onRoad && G.nomad && G.nomad.canLeave) {
        try {
          const g = G.nomad.canLeave();
          if (g.ok && diag.eligibleDay == null) { diag.eligibleDay = day; diag.departKin = (g.kin || []).length; }
          if (!g.ok) {
            diag.gateDays[g.reason] = (diag.gateDays[g.reason] || 0) + 1;
            diag.lastGate = g.reason;
          }
        } catch (e) {}
      }
      if (onRoad && G.nomadDrive) { /* road driven by policy */ }
    } catch (e) {}
    let ret;
    if (origDaily) { try { ret = origDaily(G, ctx); } catch (e) {} }
    // Eligibility may first become true inside the policy's own daily
    // (e.g. the Watchers answered mid-tick) — count a departure as eligible.
    if (lastCtx && lastCtx.nomadDeparted && diag.eligibleDay == null) {
      diag.eligibleDay = lastCtx.nomadDepartDay;
      diag.departKin = lastCtx.nomadDepartKin || diag.departKin;
    }
    return ret;
  };
  const result = await runDays(Game, policy, { days: DAYS, manifest });
  diag.days = result.days;
  diag.endReason = result.endReason;
  diag.won = !!Game.won;
  if (lastCtx) {
    diag.departed = !!lastCtx.nomadDeparted;
    diag.departDay = lastCtx.nomadDepartDay || null;
    diag.roadDays = lastCtx.nomadRoadDays || 0;
    diag.joins = lastCtx.nomadJoins || 0;
    diag.nomadNotes = (lastCtx.nomadNotes || []).slice(0, 12);
    if (diag.departKin === 0 && lastCtx.nomadDepartKin) diag.departKin = lastCtx.nomadDepartKin;
  }
  try {
    const r = Game.state && Game.state.road;
    if (r) {
      diag.roadActive = !!r.active;
      diag.foundKin = (r.foundKin || []).length;
      diag.fallen = (r.fallen || []).length;
      diag.endingReason = r.endingReason || r.endReason || null;
      diag.endingReached = !r.active && !!diag.departed && diag.won;
      diag.roadDeaths = (r.log || []).filter(e => /died|starved|fell/i.test(String((e && e.text) || e || ''))).length;
    }
  } catch (e) {}
  return diag;
}

async function main() {
  const rows = [];
  for (const s of seeds) {
    process.stdout.write(`seed ${s}... `);
    try {
      const d = await oneSeed(s);
      rows.push(d);
      console.log(`${d.days}d end=${d.endReason} rank=${d.maxRank} elig@${d.eligibleDay} dep=${d.departed} ending=${d.endingReached}`);
    } catch (e) {
      console.log('FATAL ' + e.message);
      rows.push({ seed: s, fatal: e.message });
    }
  }
  const ok = rows.filter(r => !r.fatal);
  const departed = ok.filter(r => r.departed).length;
  const endings = ok.filter(r => r.endingReached).length;
  const eligible = ok.filter(r => r.eligibleDay != null).length;
  const glob = ok.filter(r => r.globalLive).length;
  const pg = ok.filter(r => r.pendingGlobalSeen).length;
  const gateHist = {};
  for (const r of ok) for (const [k, v] of Object.entries(r.gateDays || {})) gateHist[k] = (gateHist[k] || 0) + v;
  const reasons = {};
  for (const r of ok) { const k = r.endingReason || (r.departed ? 'road-no-end' : 'never-departed'); reasons[k] = (reasons[k] || 0) + 1; }

  const isPilot = !(process.env.CONFIRM === '1') && !SEEDS.length;
  const goBar = isPilot ? Math.ceil(seeds.length / 4) : Math.ceil(seeds.length / 4);
  const goMetric = isPilot ? departed : endings;
  const verdict = goMetric >= goBar ? 'GO' : 'NO-GO';

  console.log('\n=== nomad reachability ===');
  console.log(`seeds: ${ok.length}, eligible: ${eligible}, departed: ${departed}, endings: ${endings}`);
  console.log(`pendingGlobal seen: ${pg}, globalLive: ${glob}, maxRank dist: ` +
    JSON.stringify(ok.reduce((a, r) => { a[r.maxRank] = (a[r.maxRank] || 0) + 1; return a; }, {})));
  console.log(`gate-day histogram: ${JSON.stringify(gateHist)}`);
  console.log(`ending reasons: ${JSON.stringify(reasons)}`);
  console.log(`knownKin@day1 (per seed): ${ok.map(r => r.knownKinDay1 + '/' + r.scatteredDay1).join(' ')}`);
  console.log(`VERDICT: ${verdict} (${isPilot ? 'pilot' : 'confirm'} bar: >=${goBar} ${isPilot ? 'departures' : 'endings'})`);

  const evDir = path.join(ROOT, 'evidence', new Date().toISOString().slice(0, 10));
  fs.mkdirSync(evDir, { recursive: true });
  const evPath = path.join(evDir, 'sim-nomad-reachability.md');
  const lines = [
    `# sim-nomad-reachability — ${new Date().toISOString().slice(0, 10)}`,
    ``,
    `## Pre-registration (binds this run)`,
    `- primary metric: seeds reaching a Long Way Home ending (over && won, road ended)`,
    `- pilot GO: >=2/8 departures (Leave taken organically)`,
    `- confirm GO: >=4/16 endings`,
    `- horizon: death-aware, cap ${DAYS}d; seeds: ${seeds.join(',')}`,
    `- policy: nomadseek (capable + answer-Watchers-feast + leave-when-eligible + road drive)`,
    ``,
    `## Result`,
    `- seeds: ${ok.length}; eligible: ${eligible}; departed: ${departed}; endings: ${endings}`,
    `- pendingGlobal seen: ${pg}; globalLive: ${glob}`,
    `- maxRank: ${JSON.stringify(ok.reduce((a, r) => { a[r.maxRank] = (a[r.maxRank] || 0) + 1; return a; }, {}))}`,
    `- gate days: ${JSON.stringify(gateHist)}`,
    `- ending reasons: ${JSON.stringify(reasons)}`,
    `- knownKin@day1 (known/scattered): ${ok.map(r => r.knownKinDay1 + '/' + r.scatteredDay1).join(' ')}`,
    `- VERDICT: **${verdict}**`,
    ``,
    `## Per-seed`,
    ...ok.map(r => `- seed ${r.seed}: ${r.days}d, end=${r.endReason}, rank=${r.maxRank}, viewership~${r.maxViewership}, elig@${r.eligibleDay}, departed=${r.departed}@${r.departDay}, roadDays=${r.roadDays}, joins=${r.joins||0}, foundKin=${r.foundKin}, ending=${r.endingReached}(${r.endingReason}), won=${r.won}`),
    ``,
    `## Metric review`,
    `- (fill: was the bar honest? what should change for the next run?)`,
    ``,
    `## Notes`,
    ...ok.flatMap(r => (r.nomadNotes || []).map(n => `- seed ${r.seed}: ${n}`)).slice(0, 30),
  ];
  fs.writeFileSync(evPath, lines.join('\n') + '\n');
  console.log('evidence: ' + evPath);
  process.exit(verdict === 'GO' ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
