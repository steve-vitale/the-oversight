#!/usr/bin/env node
// sweep-hauldrive-20261016.js — pilot sweep for the kill→haul drive layer
// (loop B food-economy ARM sim-hauldrive-b, finding #17, 2026-10-16).
//
// 8 seeds x {leadcourt,belongseek} x {control,armed} = 32 runs, 180d
// death-aware, identical seeds both sides. Own control in the SAME sweep.
// FEASTSCALE_R13=1 both sides (the feastscale courtship substrate;
// leadcourt→leadfeast, belongseek→belongfeast per the sleepin precedent).
//
// Control: HAULDRIVE unset (wrapped policy, gate-off pure delegation —
//   the proof test's det-gate pins byte-identical trajectories).
// Armed: HAULDRIVE=1 (freshHaul + cleanOnSite + cautiousTest beats live).
//
// PRE-REGISTRATION (binding, evidence/2026-10-16/sim-hauldrive-b.md header):
//   PRIMARY: player-hauled gross kcal share (hauledTotal/killedTotal)
//     armed >= 2x control.
//   GUARDRAILS: starvation deaths armed <= control+2; national armed >=
//     control-2/16; no new death mode; median survival armed >=
//     control-10d; alien-quirk acquisitions armed <= control+2.
//   SECONDARY (report-only): revealed-valued monster-meat eaten kcal/run;
//     scholar hunger-days.
//   GO → land the layer. MISS → kill protocol: delete the layer, commit
//     evidence + instruments only.
//
// Instruments: scripts/meatlastmile-lib-20261015.js (stage attribution —
// hauled/killed/eaten/rot) + an applyStatus wrap counting alien-pool
// acquisitions + the standard wall/death census + hauldrive liveness
// counters (hdHauled/hdCleaned/hdKnifeSkips/meatTests from the run ctx).
//
// Usage:
//   SMOKE=1 node scripts/sweep-hauldrive-20261016.js
//   node scripts/sweep-hauldrive-20261016.js            # full pilot
//   SEEDS="171,282" ONLY="leadcourt,armed" node scripts/sweep-hauldrive-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { attachInstruments, finalize } = require('./meatlastmile-lib-20261015');
const hd = require('./policies/hauldrive');

const SEEDS = [171, 282, 393, 504, 615, 726, 837, 948];
const DAYS = 180;
const POLICIES = ['leadcourt', 'belongseek'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-hauldrive');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'hauldrive-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const ALIEN_QUIRKS = new Set(['howlbelly', 'gristlefit', 'croakbelly', 'shellgut',
  'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons']);

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const armed of [false, true]) {
    if (armed) process.env.HAULDRIVE = '1'; else delete process.env.HAULDRIVE;
    process.env.FEASTSCALE_R13 = '1';
    for (const pid of POLICIES) {
      const side = armed ? 'armed' : 'control';
      const policy = hd.policyForRun(pid);
      check(`[${side}/${pid}] policy.upkeep is a function`, typeof policy.upkeep === 'function');
      let liveFlag = null, dailyCalls = 0;
      const pw = Object.assign({}, policy);
      const os = policy.setup;
      pw.setup = (G, ctx) => { liveFlag = hd.layerOn(); if (os) return os(G, ctx); };
      const od = policy.daily;
      pw.daily = (G, ctx) => { dailyCalls++; if (od) return od(G, ctx); };
      const { Game } = await loadGame({ seed: 171, mode: 'hauldrive-smoke', fullTelemetry: false });
      await setupGame(Game);
      const m = attachInstruments(Game);
      let result = null;
      await quietLog(async () => { result = await runDays(Game, pw, { days: 15, manifest: undefined, sampleEvery: 10 }); });
      const s = finalize(Game, m, result);
      check(`[${side}/${pid}] layer-live marker == ${armed}`, liveFlag === armed, 'live=' + liveFlag);
      check(`[${side}/${pid}] policy.daily fired (calls=${dailyCalls})`, dailyCalls > 0);
      check(`[${side}/${pid}] instrument honest (errors=${s.instrErrors.length})`, s.instrErrors.length === 0,
        s.instrErrors.slice(0, 2).join('; '));
    }
  }
  delete process.env.HAULDRIVE;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: policies drive, layer-live marker honest, instrument clean.');
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  process.env.FEASTSCALE_R13 = '1';
  if (armed) process.env.HAULDRIVE = '1'; else delete process.env.HAULDRIVE;
  const { Game } = await loadGame({ seed, mode: `hauldrive-${side}`, fullTelemetry: false });
  await setupGame(Game);
  // quirk-acquisition instrument: count alien-pool statuses applied to anyone
  const quirks = { n: 0, byId: {} };
  try {
    const oApply = Game.applyStatus.bind(Game);
    Game.applyStatus = function (target, id, opts) {
      try {
        if (ALIEN_QUIRKS.has(String(id))) {
          quirks.n++;
          quirks.byId[id] = (quirks.byId[id] || 0) + 1;
        }
      } catch (e) {}
      return oApply.apply(this, arguments);
    };
  } catch (e) {}
  // sense-testing beats (filtered say capture — haul/clean/test voice)
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/doesn't stay on the ground|eaten this before|Waste is the real enemy|butcher's cut|walk home is lighter|no knife in hand|stone knife would|cautious|test.*flesh|It's food|NOT food|Taken:.*carcass|Cleaned.*carcass/i.test(s) && beats.length < 3000)
        beats.push({ day: gday(Game), text: s.slice(0, 300) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const m = attachInstruments(Game);
  const base = hd.policyForRun(policyId);
  let runCtx = null, layerLive = null, dailyCalls = 0, hungryDays = 0;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; layerLive = hd.layerOn(); if (oSetup) return oSetup(G, ctx); };
  const hist = { maxRank: 0, everTable: false, maxWave: 1, exiled: false };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      dailyCalls++;
      const rk = RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village')] || 0;
      hist.maxRank = Math.max(hist.maxRank, rk);
      if (G.progState && G.progState().tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave());
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      // hunger-days: the engine's own starving threshold (kcal < 500)
      try { if (((G.state.scholar || {}).kcal || 0) < 500) hungryDays++; } catch (e) {}
    } catch (e) {}
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  if (layerLive !== armed) throw new Error(`layer-live marker mismatch: side=${side} live=${layerLive}`);
  if (dailyCalls < 10) throw new Error(`SMOKE FAIL: policy.daily fired ${dailyCalls}x`);
  const s = finalize(Game, m, result);
  if (s.instrErrors.length) throw new Error('instrument errors: ' + s.instrErrors.slice(0, 3).join('; '));
  // deaths
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  const L = runCtx || {};
  const killed = s.killedTotal || 0;
  const hauled = s.hauledTotal || 0;
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    layerLive, dailyCalls,
    // mechanism liveness (did the beats fire?)
    hdHauled: L.hdHauled || 0, hdCleaned: L.hdCleaned || 0,
    hdKnifeSkips: L.hdKnifeSkips || 0, hdSampled: L.hdSampled || 0,
    meatTests: L.meatTests || 0,
    // meat pipeline (meatlastmile-lib, gross-valued kcal)
    killed, hauled,
    hauledShare: killed > 0 ? +(hauled / killed).toFixed(4) : 0,
    corpseRot: s.corpseRotTotal || 0,
    reveals: s.reveals || 0, revealDelta: s.revealDelta || 0,
    eatenScholar: s.eatenTotal || 0, eatenVillager: s.villagerEatenTotal || 0,
    eatenAnyone: (s.eatenTotal || 0) + (s.villagerEatenTotal || 0),
    coverage: s.coverage,
    // guardrails + wall
    quirks: quirks.n, quirksById: quirks.byId,
    starveDeaths, deaths, hungryDays,
    maxRank: hist.maxRank, national: hist.maxRank >= 2, everTable: hist.everTable,
    won: !!Game.won, maxWave: hist.maxWave, exiled: hist.exiled,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-${side}-s${seed}.json`), JSON.stringify(out, null, 1));
  fs.mkdirSync(BEATS, { recursive: true });
  fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.slice(0, 400), null, 1));
  console.log(`  [${side} ${policyId} s${seed}] d=${out.gameDays} ${out.endReason} ` +
    `haulShare=${out.hauledShare} hdHauled=${out.hdHauled} hdClean=${out.hdCleaned} hdSampled=${out.hdSampled} tests=${out.meatTests} ` +
    `eat=${out.eatenAnyone} quirk=${out.quirks} starv=${out.starveDeaths} nat=${out.national} wave=${out.maxWave}`);
  return out;
}

async function main() {
  if (process.env.SMOKE === '1') { await smokeGate(); return; }
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
  delete process.env.HAULDRIVE;
  // merge with pre-existing per-seed files (parallel chunks / re-runs)
  const have = {};
  try {
    for (const f of fs.readdirSync(EVID)) {
      const mt = f.match(/^([a-z]+)-(control|armed)-s(\d+)\.json$/);
      if (mt) {
        const r = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
        if (!r.error) have[`${mt[1]}|${mt[2]}|${mt[3]}`] = r;
      }
    }
  } catch (e) { console.log('merge note: ' + e.message); }
  for (const r of all) { if (!r.error) have[`${r.policyId}|${r.side}|${r.seed}`] = r; }
  const rows = Object.values(have);
  fs.writeFileSync(path.join(EVID, 'summary.json'), JSON.stringify(rows, null, 1));
  console.log('\nwrote ' + EVID + '/summary.json (' + rows.length + ' rows)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
