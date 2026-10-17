#!/usr/bin/env node
// scripts/sweep-seatblow-20261017.js — SEATBLOW feasted-blow actor attribution
// (flesh-out loop, axis scale-onramp, 2026-10-17, diagnostic).
//
// WHY: sim-tablegate (finding #441) named the blocking gate: the foodDeeds
// sub-bar's combat half (feastSurgeUsed) — the scholar must land a feasted
// strike/ability in real combat. Steve's call: is the deed INTENDED to
// require the scholar's own hands? This arm answers with data from the
// WINNING substrate: attribute EVERY foodDeeds-crediting event
// (noteFeastedCombatUse marking prog.feastSurgeUsed) to its actor — the
// scholar's own hands, a villager companion, another villager, or something
// else — plus feasted state at the moment and the credit path.
//
// SUBSTRATE (asserted up front):
//   FEASTSCALE_R13=1
//   SEATDRIVE=1 EXPLICIT (the seatdrive-composed winning stack:
//   withSeatDrive(withWinDefer(tribfloor base)) via scripts/policies/seatdrive.js
//   `leadseat`/`belongseat`. Tracker METHOD NOTE: SEATDRIVE unset != driver
//   active — the composition is explicit, and the sweep pins the env to '1'.)
//
// 8 FRESH seeds [5201-5208] x {leadseat, belongseat} = 16 runs, 180d
// death-aware, identical-seed lead/belong pairs. DIAGNOSTIC: the instrument
// is read-only — hooks record, never alter. The det-gate (proof) pins
// byte-identical trajectories vs the uninstrumented policy.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/sweep-seatblow-20261017.js
// Targeted re-runs: SEEDS="5201,5202" ONLY="leadseat" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=1 node scripts/sweep-seatblow-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { leadseat, belongseat } = require('./policies/seatdrive');
const { attachSeatblowCapture } = require('./seatblow-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '1') fails.push('SEATDRIVE=1 required EXPLICIT (unset is not the pinned state for this sweep)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [5201, 5202, 5203, 5204, 5205, 5206, 5207, 5208]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const POLICIES = { leadseat, belongseat };
const ROAD_IDS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => POLICIES[s])
  : ['leadseat', 'belongseat'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-seatblow');
const BEATS = path.join(__dirname, '..', 'evidence', DATE, 'seatblow-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// ---------- one attributed run ----------
// opts: { days, writeJson, instrumented } — instrumented=false replays the
// bare policy for the det-gate (no evidence pollution).
async function runSeatblow(seed, policyId, opts) {
  opts = opts || {};
  const days = opts.days || DAYS;
  const writeJson = opts.writeJson !== false;
  const instrumented = opts.instrumented !== false;
  const policy = POLICIES[policyId];
  if (!policy) throw new Error('unknown policy ' + policyId);
  const { Game } = await loadGame({ seed, mode: `seatblow-${policyId}` });
  await setupGame(Game);
  const inst = instrumented ? attachSeatblowCapture(Game) : null;
  const hist = { maxRank: 0 };
  const hashes = [];
  let lastCtx = null;
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    lastCtx = ctx || null;
    let r;
    if (oDaily) r = oDaily(G, ctx);
    try {
      if (inst) inst.sample();
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      hashes.push(G.state.scholar.day + ':' + dayHash(G));
    } catch (e) { if (inst) inst.capture.errors++; }
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, sampleEvery: 30 }); });
  policy.daily = oDaily; // restore (same process runs many seeds)
  let cap = null;
  if (inst) {
    try { cap = inst.finish(lastCtx); } catch (e) { cap = inst.capture; cap.errors++; }
    try { inst.restore(); } catch (e) {}
  }
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const notes = cap ? cap.noteEvents : [];
  const marked = notes.filter(e => e && e.marked);
  const actorSplit = {};
  for (const e of marked) actorSplit[e.actor || 'unknown'] = (actorSplit[e.actor || 'unknown'] || 0) + 1;
  const upliftByActor = {};
  for (const u of (cap ? cap.upliftEvents : [])) upliftByActor[u.actor || 'unknown'] = (upliftByActor[u.actor || 'unknown'] || 0) + 1;
  const out = {
    seed, policyId, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank | 0, national: hist.maxRank >= 2 ? 1 : 0,
    table: cap && cap.inviteEver ? 1 : 0, wins: Game.won ? 1 : 0,
    maxWave: (result.maxWaveUnlocked || 1) | 0,
    // the seat chain
    seatEver: cap && cap.seatEver ? 1 : 0, seatDay: cap && cap.seatDay != null ? cap.seatDay : null,
    seatKind: cap ? cap.seatKind : null,
    inviteEver: cap && cap.inviteEver ? 1 : 0, inviteDay: cap && cap.inviteDay != null ? cap.inviteDay : null,
    pathTaken: cap ? cap.pathTaken : null, branchTaken: cap ? cap.branchTaken : null,
    phaseEnd: cap ? cap.phaseEnd : null, tableDone: cap && cap.tableDone ? 1 : 0,
    seatTakenByDriver: cap ? (cap.sdSeatTaken | 0) : 0, seatTakenDay: cap ? cap.sdSeatDay : null,
    arcMax: cap ? (cap.arcMax | 0) : 0,
    feastSurgeUsedEnd: cap && cap.feastSurgeUsedEnd ? 1 : 0,
    sentimentTaughtEnd: cap && cap.sentimentTaughtEnd ? 1 : 0,
    // the attribution payload
    buffGrants: cap ? (cap.buffGrants.length | 0) : 0,
    noteCalls: notes.length | 0,
    noteMarked: marked.length | 0,
    actorSplit: actorSplit,
    markedEvents: marked.map(e => ({
      day: e.day, via: e.via, actor: e.actor, actorDetail: e.actorDetail,
      feasted: e.feasted ? 1 : 0, fighterKind: e.fighterKind,
      targetKind: e.targetKind, targetMid: e.targetMid, targetName: e.targetName,
      targetWave: e.targetWave, abilityId: e.abilityId,
      contextBeats: (e.contextBeats || []).map(b => ({ day: b.day, text: b.text })),
    })),
    unmarkedCalls: (notes.length - marked.length) | 0,
    upliftN: cap ? (cap.upliftEvents.length | 0) : 0,
    upliftByActor: upliftByActor,
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
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} table=${out.table} wins=${out.wins} seat=${out.seatEver ? out.seatKind + '@' + out.seatDay : 'no'} marked=${out.noteMarked} actors=${JSON.stringify(actorSplit)} err=${out.instrumentErrors}`);
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
      recs.push(await runSeatblow(seed, policyId, { days: EFF_DAYS }));
    }
  }
  console.log('\n== seatblow summary ==');
  for (const policyId of ROAD_IDS) {
    const rs = recs.filter(r => r.policyId === policyId);
    const n = rs.length;
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    const actors = {};
    for (const r of rs) for (const [k, v] of Object.entries(r.actorSplit)) actors[k] = (actors[k] || 0) + v;
    console.log(`${policyId}: n=${n} national=${sum('national')}/${n} table=${sum('table')}/${n} wins=${sum('wins')}/${n} ` +
      `seat=${sum('seatEver')}/${n} marked=${rs.reduce((a, r) => a + r.noteMarked, 0)} ` +
      `medianSurv=${median(rs.map(r => r.gameDays)).toFixed(1)}d instErr=${rs.reduce((a, r) => a + r.instrumentErrors, 0)}`);
    console.log(`  actorSplit(marked): ${Object.entries(actors).map(([k, v]) => k + '=' + v).join(', ')}`);
  }
}

module.exports = { runSeatblow, assertSubstrate, ROAD_IDS, SEEDS };

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}
