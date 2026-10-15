#!/usr/bin/env node
// sweep-bankleg-20261015.js — pilot sweep for the bankleg arm (loop B ARM 3).
// 8 seeds x {leadfeast, belongseek} x {control, armed}, 180d death-aware,
// identical seeds both sides. Own control in the SAME sweep (#247).
//
// Usage:
//   SMOKE=1 node scripts/sweep-bankleg-20261015.js
//   node scripts/sweep-bankleg-20261015.js   # full pilot
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL (loop B ARM3 NO-GO at pilot, 2026-10-15): the bankleg layer
// was deleted. The retained sweep documents the pre-kill pilot; it cannot
// run without the layer, so it INFO-SKIPs instead of crashing.
let bl = null;
try { bl = require('./policies/bankleg'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: bankleg layer deleted per kill protocol (NO-GO at pilot); sweep results retained in evidence/2026-10-15/perseed-bankleg/ — see evidence/2026-10-15/sim-bankleg-b.md');
    process.exit(0);
  }
  throw e;
}

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DAYS = 180;
const POLICIES = ['belongseek', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-bankleg');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'bankleg-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function packEdible(Game) { try { return bl.packEdibleKcal(Game); } catch (e) { return 0; } }
function scholarTrust(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const t = (v.trust || {})[s.villagerId];
    return t === undefined ? 10 : t;
  } catch (e) { return null; }
}
function stdSnapshot(Game) {
  const out = { won: false, rank: 'village', tableWaiting: false };
  try { out.won = !!Game.won; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  try { out.tableWaiting = !!(Game.progState ? Game.progState() : {}).tableWaiting; } catch (e) {}
  return out;
}

function freshRow(d) {
  return { day: d, eaten: 0, mealNight: null, cap: 2400, minBar: null, trust: null, scholarVid: null };
}

// ---- read-only scholar-day instruments (census pattern) ----
function installScholarCensus(Game, M) {
  // Game.eat: record bar deltas per game-day.
  const oEat = Game.eat.bind(Game);
  Game.eat = function () {
    const before = (Game.state.scholar || {}).kcal || 0;
    const r = oEat.apply(this, arguments);
    try {
      const after = (Game.state.scholar || {}).kcal || 0;
      const d = gday(Game);
      if (after > before) { const row = M.row(d); row.eaten += Math.round(after - before); }
    } catch (e) {}
    return r;
  };
  // Game.sleep: dusk sample before, dawn bookkeeping after. The night's
  // village meal (v.lastPlayerMeal, set by villageMeal during endDay)
  // belongs to the day that just ended — attribute it back.
  const oSleep = Game.sleep.bind(Game);
  Game.sleep = function () {
    let dusk = 0;
    try {
      dusk = gday(Game);
      const row = M.row(dusk);
      const s = Game.state.scholar || {};
      row.minBar = row.minBar == null ? Math.round(s.kcal || 0) : Math.min(row.minBar, Math.round(s.kcal || 0));
      try { row.cap = Math.round(Game.kcalCap()); } catch (e) {}
      row.scholarVid = s.villagerId || null;
      M.vids.add(s.villagerId);
    } catch (e) {}
    const r = oSleep.apply(this, arguments);
    try {
      const mealNight = Math.round((Game.state.village || {}).lastPlayerMeal || 0);
      M.row(dusk).mealNight = mealNight;
      M.mealKcal += mealNight;
      const s2 = Game.state.scholar || {};
      const row2 = M.row(dusk + 1);
      const b = Math.round(s2.kcal || 0);
      row2.minBar = row2.minBar == null ? b : Math.min(row2.minBar, b);
    } catch (e) {}
    return r;
  };
}

// ---- exposure instrument: count wild-tile visits (read-only counter) ----
function installExposureCounter(Game, X) {
  const oTravel = Game.travelTo.bind(Game);
  Game.travelTo = function (x, y) {
    try {
      const t = Game.tileAt ? Game.tileAt(x, y) : null;
      X.travelCalls++;
      if (t && t.type !== 'haven') X.wildVisits++;
    } catch (e) {}
    return oTravel(x, y);
  };
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const armed of [false, true]) {
    if (armed) process.env.BANKLEG = '1'; else delete process.env.BANKLEG;
    process.env.POLICY = 'belongseek';
    const base = bl.policyForRun();
    const side = armed ? 'armed' : 'control';
    check(`[${side}] named-export unwrap: policy.daily is a function`, typeof base.daily === 'function');
    check(`[${side}] policy id carries base+bankleg`, /bankleg/.test(base.id || '') && /belongseek/.test(base.id || ''), 'id=' + base.id);
    // LAYER-LIVE MARKER (belongfeast process lesson): the sweep must assert
    // the env-gated layer is actually live on the armed side, not just that
    // the policy object drives.
    let liveFlag = null;
    const policy = Object.assign({}, base);
    const os = base.setup;
    policy.setup = (G, ctx) => { liveFlag = bl.layerOn(); if (os) return os(G, ctx); };
    let dailyCalls = 0;
    const od = base.daily;
    policy.daily = (G, ctx) => { dailyCalls++; return od(G, ctx); };
    const { Game } = await loadGame({ seed: 11, mode: 'bankleg-smoke', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
    check(`[${side}] layer-live marker == ${armed}`, liveFlag === armed, 'live=' + liveFlag);
    check(`[${side}] harness invoked policy.daily (calls=${dailyCalls})`, dailyCalls > 0);
    const meanCalls = result.pacing ? (result.pacing.meanPolicyCallsPerDay || 0) : 0;
    check(`[${side}] policyCalls pacing > 0 (mean=${meanCalls}/day)`, meanCalls > 0);
  }
  delete process.env.BANKLEG;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, layer-live marker honest — safe to measure.');
}

async function oneRun(seed, policyId, side) {
  process.env.POLICY = policyId;
  if (side === 'armed') process.env.BANKLEG = '1'; else delete process.env.BANKLEG;
  const armed = side === 'armed';
  const { Game } = await loadGame({ seed, mode: `bankleg-${side}`, fullTelemetry: false });
  await setupGame(Game);
  // sense-testing beats (filtered say capture)
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Village meal|Half ration|half rations|Hunger gnaws|STARVING|went to sleep hungry|trust|discipline|takes from the pantry|Caught red-handed|watches you take|garden|Harvest|Nothing biting|fish|Nothing ripe/i.test(s) && beats.length < 2000)
        beats.push({ day: gday(Game), text: s.slice(0, 300) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  // scholar-day census
  const M = {
    rows: {}, vids: new Set(), mealKcal: 0,
    row(d) { return (this.rows[d] = this.rows[d] || freshRow(d)); },
  };
  installScholarCensus(Game, M);
  // exposure: wild-tile visits (read-only counter, no behavior change)
  const X = { travelCalls: 0, wildVisits: 0 };
  installExposureCounter(Game, X);
  const base = bl.policyForRun();
  let runCtx = null, layerLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; layerLive = bl.layerOn(); if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, exiled: false, maxTrust: 0 };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      if (s.tableWaiting) hist.everTable = true;
      const sc = G.state.scholar || {};
      if (sc.exiled) hist.exiled = true;
      const t = scholarTrust(G);
      const row = M.row(gday(G));
      row.trust = t;
      if (t != null) hist.maxTrust = Math.max(hist.maxTrust, t);
      const b = Math.round(sc.kcal || 0);
      row.minBar = row.minBar == null ? b : Math.min(row.minBar, b);
      M.vids.add(sc.villagerId);
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  if (layerLive !== armed) throw new Error(`layer-live marker mismatch: side=${side} live=${layerLive}`);
  // per-day scholar metrics
  let scholarDays = 0, starvedDays = 0, trustGe30 = 0, halfRation = 0, hungry1200 = 0, trustSamples = 0;
  for (const d of Object.keys(M.rows).map(Number).sort((a, b) => a - b)) {
    const r = M.rows[d];
    if (r.minBar == null) continue;
    scholarDays++;
    const ate = (r.eaten || 0) + (r.mealNight || 0);
    if (ate < 0.6 * (r.cap || 2400)) starvedDays++;
    if (r.minBar < 1200) hungry1200++;
    if (r.trust != null) {
      trustSamples++;
      if (r.trust >= 30) trustGe30++; else halfRation++;
    }
  }
  // ledger lineage sums (succession-safe: sum over every scholar vid seen)
  let takesSum = 0, givesSum = 0;
  try {
    const v = Game.state.village || {};
    for (const vid of M.vids) {
      takesSum += Math.round((v.takes || {})[vid] || 0);
      givesSum += Math.round((v.gives || {})[vid] || 0);
    }
  } catch (e) {}
  // deaths
  const deaths = {};
  let starveDeaths = 0, scholarDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
      if (d.player) scholarDeaths++;
    }
  } catch (e) {}
  let engineHungryDays = 0;
  try { engineHungryDays = (Game.state.village || {}).hungryDays || 0; } catch (e) {}
  const end = stdSnapshot(Game);
  const L = policy._bankleg || {};
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    scholarDays, starvedDays, trustGe30, halfRation, hungry1200, trustSamples, maxTrust: hist.maxTrust,
    mealKcal: M.mealKcal, takesSum, givesSum,
    refused: L.refused || 0, bulkRefused: L.bulkRefused || 0, hatchTakes: L.hatchTakes || 0,
    guaranteeLegs: L.guaranteeLegs || 0, guaranteeSkipped: L.guaranteeSkipped || 0,
    gardenLegs: L.gardenLegs || 0, fishLegs: L.fishLegs || 0, forageLegs: L.forageLegs || 0,
    travelCalls: X.travelCalls, wildVisits: X.wildVisits,
    starveDeaths, scholarDeaths, deaths, engineHungryDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2, everTable: hist.everTable,
    won: end.won, maxWave: result.maxWaveUnlocked, exiled: hist.exiled,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.mkdirSync(BEATS, { recursive: true });
  fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} starved=${starvedDays} t>=30=${trustGe30} half=${halfRation} h1200=${hungry1200} refused=${out.refused} hatch=${out.hatchTakes} legs=${out.guaranteeLegs}(g${out.gardenLegs}/f${out.fishLegs}/h${out.forageLegs}) wild=${out.wildVisits} nat=${out.national} wave=${out.maxWave} sDeaths=${starveDeaths}`);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
  // Targeted re-run support (process death mid-sweep): SEEDS="77,88",
  // ONLY="leadfeast,armed" (policy,side pairs as "policy,side").
  const seedFilter = process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : SEEDS;
  const onlyFilter = process.env.ONLY ? process.env.ONLY.split(';').map(p => p.split(',')) : null;
  const all = [];
  for (const policyId of POLICIES) {
    for (const side of ['control', 'armed']) {
      if (onlyFilter && !onlyFilter.some(([p, s]) => p === policyId && s === side)) continue;
      for (const seed of seedFilter) {
        try {
          all.push(await oneRun(seed, policyId, side));
        } catch (e) {
          console.log(`  [${side} ${policyId} s${seed}] ERROR ${e.message}`);
          all.push({ seed, policyId, side, error: String(e.message) });
        }
      }
    }
  }
  delete process.env.BANKLEG;
  // Merge with any pre-existing per-seed files (targeted re-runs after a
  // mid-sweep process death) before writing the summary.
  try {
    const have = {};
    for (const f of fs.readdirSync(EVID)) {
      const m = f.match(/^([a-z]+)-(control|armed)-s(\d+)\.json$/);
      if (m && f !== 'summary.json') {
        const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
        if (!r.error) have[`${m[1]}|${m[2]}|${m[3]}`] = r;
      }
    }
    for (const r of all) {
      if (!r.error) have[`${r.policyId}|${r.side}|${r.seed}`] = r;
    }
    all.length = 0;
    for (const k of Object.keys(have)) all.push(have[k]);
  } catch (e) { console.log('merge note: ' + e.message); }
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(all, null, 1));
  console.log('\nwrote ' + EVID + '/summary.json');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
