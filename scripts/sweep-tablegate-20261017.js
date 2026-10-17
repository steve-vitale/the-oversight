#!/usr/bin/env node
// scripts/sweep-tablegate-20261017.js — TABLEGATE arrival-path attribution
// (flesh-out loop, axis scale-onramp, 2026-10-17, diagnostic).
//
// WHY: sim-wallcensus-b (finding #435) measured on the SEATDRIVE=0
// base-courtship substrate: national 15/16, median survival 182d, but
// table 0/16, wins 0/16, wave-4/5 0/16. The wall sits between national
// and the table. This diagnostic TRACES the galactic-table arrival path
// per run and attributes each national-without-table run to its SINGLE
// blocking gate (docs/TABLE.md's arrival chain):
//   seat-bar (tableSeat) -> Arc IV -> tableWaiting (invitation staged)
//   -> announced (day>=90) -> tableTakeSeat verb (the driver) -> tableScene
// Base courtship has NO seat-taking verb (only capable.js's tableRoad
// and the seatdrive layer take the seat) — the question is WHERE the
// chain stops, measured, not assumed.
//
// 8 FRESH seeds [3801-3808] x {leadcourt, belongseek} = 16 runs, 180d
// death-aware, identical-seed lead/belong pairs. Base courtship policies
// ONLY (no policy layers). DIAGNOSTIC: the instrument is read-only —
// hooks record, never alter. The det-gate (proof) pins byte-identical
// trajectories vs the uninstrumented policy.
//
// SUBSTRATE (asserted up front):
//   FEASTSCALE_R13=1
//   SEATDRIVE='0' EXPLICIT opt-out (unset now means driver ON after
//   c004b9dd — this census pins the driver OFF, same as the census it
//   sharpens).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-tablegate-20261017.js
// Targeted re-runs: SEEDS="3801,3802" ONLY="leadcourt" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-tablegate-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');
const { attachTablegateCapture, classifyGate } = require('./tablegate-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT (unset means driver ON post-c004b9dd)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [3801, 3802, 3803, 3804, 3805, 3806, 3807, 3808]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const POLICIES = { leadcourt, belongseek };
const ROAD_IDS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => POLICIES[s])
  : ['leadcourt', 'belongseek'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-tablegate');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'tablegate-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// ---------- one attributed run ----------
// opts: { days, writeJson, instrumented } — instrumented=false replays the
// bare policy for the det-gate (no evidence pollution).
async function runTablegate(seed, policyId, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const writeJson = opts.writeJson !== false;
  const instrumented = opts.instrumented !== false;
  const policy = POLICIES[policyId];
  if (!policy) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: `tablegate-${policyId}` });
  await setupGame(Game);
  const inst = instrumented ? attachTablegateCapture(Game) : null;
  const hist = { maxRank: 0, everTable: false, exiled: false };
  const hashes = [];
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      try {
        const ts = G.tableState ? G.tableState() : null;
        if (ts && (ts.staged || ts.seated || ts.done)) hist.everTable = true;
      } catch (e) {}
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
    } catch (e) { if (inst) inst.capture.errors++; }
    let r;
    if (oDaily) r = oDaily(G, ctx);
    try {
      if (inst) inst.sample();
      hashes.push(G.state.scholar.day + ':' + dayHash(G));
    } catch (e) { if (inst) inst.capture.errors++; }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 30 }); });
  policy.daily = oDaily; // restore (same process runs many seeds)
  let cap = null, gate = { gate: 'unattributed', sub: null, note: 'uninstrumented replay' };
  if (inst) {
    try { cap = inst.finish(); } catch (e) { cap = inst.capture; cap.errors++; }
    try { gate = classifyGate(cap); } catch (e) { cap.errors++; }
    try { inst.restore(); } catch (e) {}
  }
  // deaths
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const ts = cap ? cap.takeSeatCalls : [];
  const out = {
    seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank | 0, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: (result.maxWaveUnlocked || 1) | 0,
    exiled: hist.exiled ? 1 : 0,
    // The attribution (the diagnostic's payload).
    gate: gate.gate, gateSub: gate.sub, gateNote: gate.note,
    seatEver: cap ? cap.seatEver : null, seatEverDay: cap ? cap.seatEverDay : null,
    bestSeatDetail: cap ? cap.bestDetail : null, bestSeatDay: cap ? cap.bestDay : null,
    arcMax: cap ? cap.arcMax : null, arc4Day: cap ? cap.arc4Day : null,
    waitingDay: cap ? cap.waitingDay : null, announcedDay: cap ? cap.announcedDay : null,
    floorOkDay: cap ? cap.floorOkDay : null, systemArrivedEver: cap ? !!cap.systemArrivedEver : null,
    takeSeatCallN: ts.length, takeSeatOkN: ts.filter(c => c && c.ok).length,
    takeSeatCalls: ts.slice(0, 12),
    seated: cap ? !!cap.seated : null, seatDay: cap ? cap.seatDay : null,
    nationalDay: cap ? cap.nationalDay : null, nationalRank: cap ? cap.nationalRank : null,
    endSeatDetail: cap ? cap.endDetail : null,
    realmEnd: cap ? cap.realmEnd : null,
    standingEnd: cap ? cap.standingEnd : null,
    breadthEnd: cap ? cap.breadthEnd : null, stageEnd: cap ? cap.stageEnd : null,
    crisesEnd: cap ? cap.crisesEnd : null,
    instrumentErrors: cap ? (cap.errors | 0) : 0,
    instrumented: !!instrumented,
    hashes,
  };
  if (writeJson) {
    fs.mkdirSync(EVID, { recursive: true });
    const jsonOut = Object.assign({}, out);
    delete jsonOut.hashes; // per-seed JSONs carry analysis, not the det-gate hash chain
    fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(jsonOut, null, 1));
    if (cap && cap.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(cap.beats, null, 1));
    }
  }
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} table=${out.table} wins=${out.wins} gate=${out.gate} seat=${out.seatEver} arc=${out.arcMax} tts=${out.takeSeatCallN} err=${out.instrumentErrors}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  assertSubstrate();
  const recs = [];
  for (const policyId of ROAD_IDS) {
    for (const seed of SEEDS) {
      recs.push(await runTablegate(seed, policyId, { days: EFF_DAYS }));
    }
  }
  console.log('\n== tablegate summary ==');
  for (const policyId of ROAD_IDS) {
    const rs = recs.filter(r => r.policyId === policyId);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const gates = {};
    for (const r of rs) gates[r.gate] = (gates[r.gate] || 0) + 1;
    console.log(`${policyId}: n=${n} national=${sum('national')}/${n} table=${sum('table')}/${n} wins=${sum('wins')}/${n} ` +
      `exiled=${sum('exiled')}/${n} medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d ` +
      `instErr=${rs.reduce((a, r) => a + r.instrumentErrors, 0)}`);
    console.log(`  gates: ${Object.entries(gates).map(([k, v]) => k + '=' + v).join(', ')}`);
  }
}

module.exports = { runTablegate, assertSubstrate, ROAD_IDS, SEEDS };

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}
