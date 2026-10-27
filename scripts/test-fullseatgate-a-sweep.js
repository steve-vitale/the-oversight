#!/usr/bin/env node
// scripts/test-fullseatgate-a-sweep.js — full-seat scale-gate census (DIAG ONLY).
// Run fleshout-20261027T1940Z, axis scale-onramp, worker sim-fullseatgate-a.
//
// Single arm: scripts/policies/tableseat-nowait.js VERBATIM
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) on seeds
// 74501-74508, 180d DEATH-AWARE horizon (runDays stops on death/win).
// No game code is touched, no default flipped, no lever under test.
//
// COUNTERFACTUAL INSTRUMENT (see the prereg for the full binding text):
// this tree ALREADY enforces scale in deedGateReady().ok (sim-scalegate-a
// is in the base), so "would be BLOCKED if scale were enforced" is
// computed from the breakdown fields the code still reports separately:
//   barsOnly = waves && contests && crises && stageOk && foodDeeds
//   blocked  = barsOnly && !scale   (old ok would have been true)
//   pass     = barsOnly && scale    (full under either ok)
// The validator checks ok == (barsOnly && scale) on every snapshot.
// Table ENTRY = first day the daily snap sees tableWaiting true;
// ENTERED = first day it sees tableDone true. Entry/entered deed
// snapshots are pure deedGateReady() reads on those days.
//
// Gate model (re-derived from src/js/game.js unlockedWave() and
// src/js/standing.js villageStandingTotal()/waveCombatReadiness(),
// read before this script was written):
//   wave 5 iff w3rung (day>=dayFloor AND wave-2 ledger pts>=bar[2])
//     AND gated standing >= 200 AND waveEngaged(4) > 0.
//   gated = raw, pulled to 199 by the plenty cap (raw>=200, capped<200)
//     or the rd5 deferral (capped>=200, rd5 not ready), pulled to 99 by
//     the rd4 deferral (raw>=100, rd4 not ready), floored by the peak
//     ratchet (peak>=5 -> 200, peak>=4 -> 100).
//   capped = war + diplomacy + min(plenty, 100).
//   rd5 demand: armored 4 @ P>=15, armed 6, tricks 3, veterans 2
//     (living wave-4+ killers, scholar counts living by definition).
//
// READ DISCIPLINE (why the daily series is trustworthy): the daily
// wrapper calls ONLY pure reads — villageStanding(),
// standingPlentyCappedTotal(), waveCombatReadiness(4/5), waveEngaged(4),
// waveLedgerPoints(), state reads. It NEVER calls villageStandingTotal()
// (which carries the release side effect) or unlockedWave() daily; the
// daily gated total and daily unlocked wave are COMPUTED from the pure
// reads by the replication below, so the census cannot push the gate it
// measures. At end of run the ENGINE's own villageStandingTotal() and
// unlockedWave() are called once and recorded separately; the validator
// (scripts/test-fullseatgate-a.js) checks computed == engine, allowing only
// for a peak release between the two reads (peak before/after recorded).
//
// Per-seed rows are written INCREMENTALLY via the chunked writer
// subprocess (same pattern as test-tablepaths-defiant-sweep.js) so a
// write flap cannot silently lose a row: the row JSON is printed to
// stdout first (ROWJSON-BEGIN/END), then written with sha check + retry.
//
// Modes: default = census sweep (SEEDS / DAYS / EVID env).
// Exit 0 on a completed sweep (verdict is data, judged in evidence);
// exit 1 on a proof-gate failure (missing row, zero-day row, missing
// gate field, computed-vs-engine mismatch beyond the peak allowance).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function last(arr) { return (arr && arr.length ? arr[arr.length - 1][1] : null); }

// Replication of villageStandingTotal()'s gated arithmetic, pure reads only.
function computedGated(Game, st, rd4, rd5) {
  const cfg = Game.standingCfg ? Game.standingCfg() : {};
  const t4 = (cfg.t4 | 0) || 100, t5 = (cfg.t5 | 0) || 200;
  const cap = (cfg.plentyCapT5 | 0) || 100;
  const raw = (st.total | 0) || 0;
  const capped = ((st.war | 0) + (st.diplomacy | 0) + Math.min((st.plenty | 0), cap)) | 0;
  const peak = ((Game.state && Game.state._standingPeakWave) | 0) || 0;
  let gated = raw;
  if (raw >= t5 && capped < t5 && peak < 5) gated = Math.min(gated, t5 - 1);
  if (raw >= t4 && !(rd4 && rd4.ready) && peak < 4) gated = Math.min(gated, t4 - 1);
  if (capped >= t5 && !(rd5 && rd5.ready) && peak < 5) gated = Math.min(gated, t5 - 1);
  const floor = peak >= 5 ? t5 : peak >= 4 ? t4 : 0;
  return { raw, capped, gated: Math.max(gated, floor), peak };
}

function w3rung(Game) {
  let day = 1, pts2 = 0, dN = 25, bar2 = 5;
  try { day = (Game.state.scholar || {}).day || 1; } catch (e) {}
  try { pts2 = (Game.waveLedgerPoints ? Game.waveLedgerPoints(2) : 0) | 0; } catch (e) {}
  try {
    const cfg = Game.waveLedgerCfg ? Game.waveLedgerCfg() : null;
    if (cfg) {
      if (cfg.dayFloor != null) dN = cfg.dayFloor;
      if (cfg.barsPerWave && cfg.barsPerWave[2] != null) bar2 = cfg.barsPerWave[2];
    }
  } catch (e) {}
  return { met: day >= dN && pts2 >= bar2, day, pts2, dayFloor: dN, bar2 };
}

// Wave-4+ kill census from state.waveKillLog (entries {d,mid,w,by,via}).
// Living rule = the gate's own rule: scholar vid counts living by
// definition; otherwise vpOf(vid) must exist and not be dead.
function killCensus(Game) {
  const log = ((Game.state || {}).waveKillLog || []).slice();
  const scholarId = (Game.state && Game.state.scholar && Game.state.scholar.villagerId) || Game.villagerId || 'player';
  const living = (vid) => {
    if (vid === scholarId) return true;
    try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); } catch (e) { return false; }
  };
  const out = {};
  for (const w of [1, 2, 3, 4, 5]) {
    const es = log.filter(e => e && (e.w | 0) === w);
    const killers = [...new Set(es.map(e => e.by).filter(Boolean))];
    out[w] = {
      kills: es.length,
      killers: killers.length,
      livingKillers: killers.filter(living).length,
      killerVids: killers,
      livingKillerVids: killers.filter(living),
    };
  }
  const w4 = out[4];
  return { scholarId, byWave: out, w4kills: w4.kills, w4killers: w4.killers, livingW4killers: w4.livingKillers };
}


// deedGateReady() snapshot (pure read: computes from progState/
// deedState()/scaleRank()/integrationStage(); writes nothing except
// idempotent deedState defaults). Returns null on any read error so a
// failed deed read fails visibly (null in the row), never silently.
function deedSnap(Game) {
  try {
    const d = Game.deedGateReady ? Game.deedGateReady() : null;
    if (!d) return null;
    return { ok: !!d.ok, waves: !!d.waves, contests: !!d.contests, crises: !!d.crises,
      scale: !!d.scale, stageOk: !!d.stageOk, foodDeeds: !!d.foodDeeds, stage: d.stage | 0,
      w1: d.w1 | 0, w2: d.w2 | 0, w3: d.w3 | 0, w4: d.w4 | 0, w5: d.w5 | 0,
      contestsN: d.contestsN | 0, crisesN: d.crisesN | 0, rank: d.rank || null };
  } catch (e) { return null; }
}

function wavesFacedCounts(Game) {
  const counts = {};
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      counts[w] = (counts[w] || 0) + 1;
    }
  } catch (e) {}
  return counts;
}

function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

function writeRowViaWriter(p, body) {
  console.log('ROWJSON-BEGIN ' + path.basename(p) + '\n' + body + '\nROWJSON-END');
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      const sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
      if (m[1] !== sha) throw new Error('writer sha mismatch');
      return sha;
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  delete process.env.TABLEDEFIANT;
  const { Game } = await loadGame({ seed, mode: 'fullseatgate-a', fullTelemetry: false });
  await setupGame(Game);
  const daily = [];
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  // Full-seat-gate entry/entered deed snapshots: pure deedGateReady()
  // reads on the FIRST day the daily snap sees tableWaiting / tableDone.
  // (A tableWaiting that starts inside a day's policy run is seen on the
  // next day's wrapper call; the prereg defines entry by first-seen day.)
  let entryDeedSnap = null, enteredDeedSnap = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      try {
        const st = G.villageStanding ? G.villageStanding() : {};
        const rd5 = G.waveCombatReadiness ? G.waveCombatReadiness(5) : null;
        const rd4 = G.waveCombatReadiness ? G.waveCombatReadiness(4) : null;
        const cg = computedGated(G, st, rd4, rd5);
        const rung = w3rung(G);
        const kc = killCensus(G);
        const day = ((G.state || {}).scholar || {}).day || 0;
        const w4f = (G.waveEngaged ? G.waveEngaged(4) : 0) | 0;
        const deed = deedSnap(G);
        // Entry/entered capture: deed is this day's pure read; the snap
        // below (same call) reports this day's table flags.
        try {
          const s2 = snap(G);
          if (s2.tableWaiting && !entryDeedSnap) entryDeedSnap = { day, deed };
          if (s2.tableEntered && !enteredDeedSnap) enteredDeedSnap = { day, deed };
        } catch (e) {}
        const uw = (rung.met && cg.gated >= 200 && w4f > 0) ? 5
          : (rung.met && cg.gated >= 100) ? 4
          : (rung.met ? 3 : (day >= 8 ? 2 : 1));
        daily.push({
          d: day, raw: cg.raw, war: st.war | 0, dip: st.diplomacy | 0, plenty: st.plenty | 0,
          warPts: st.warPts | 0, links: st.links | 0, feasts: st.feasts | 0,
          capped: cg.capped, gated: cg.gated, peak: cg.peak,
          rd5: rd5 ? [rd5.armored | 0, rd5.armed | 0, rd5.tricks | 0, rd5.veterans | 0] : null,
          rd5short: rd5 ? (rd5.short || []) : null,
          rd4: rd4 ? [rd4.armored | 0, rd4.armed | 0, rd4.tricks | 0, rd4.veterans | 0] : null,
          w4faced: w4f, w3met: rung.met ? 1 : 0, uw,
          w4kills: kc.w4kills, w4killers: kc.w4killers, livingW4killers: kc.livingW4killers,
          deed: deed ? [deed.w1, deed.w2, deed.w3, deed.w4, deed.w5, deed.contestsN, deed.crisesN, deed.stage, deed.foodDeeds ? 1 : 0, deed.scale ? 1 : 0, deed.ok ? 1 : 0] : null,
          rank: RANK_ORDER[snap(G).rank] || 0,
        });
      } catch (e) { /* a failed daily read must not kill the sim; the end snapshot + validator catch gaps */ }
      // Post-policy capture: a tableWaiting/tableDone that starts inside
      // this day's policy beat is seen here the same day (the pre-policy
      // snap above would only see it tomorrow, or never on a winning day).
      // Still pure reads only — deedSnap advances no clock or ledger.
      let ret;
      if (tableseatNowait.daily) { try { ret = tableseatNowait.daily(G, ctx); } catch (e) {} }
      try {
        const s3 = snap(G);
        const d3 = ((G.state || {}).scholar || {}).day || 0;
        if (s3.tableWaiting && !entryDeedSnap) entryDeedSnap = { day: d3, deed: deedSnap(G) };
        if (s3.tableEntered && !enteredDeedSnap) enteredDeedSnap = { day: d3, deed: deedSnap(G) };
      } catch (e) {}
      return ret;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // End snapshot: pure reads first, then the engine's own numbers once.
  const stEnd = Game.villageStanding ? Game.villageStanding() : {};
  const rd5End = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null;
  const rd4End = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null;
  const cgEnd = computedGated(Game, stEnd, rd4End, rd5End);
  const rungEnd = w3rung(Game);
  const kcEnd = killCensus(Game);
  const facedEnd = wavesFacedCounts(Game);
  const deedEnd = deedSnap(Game);
  const w4fEnd = (Game.waveEngaged ? Game.waveEngaged(4) : 0) | 0;
  const peakBefore = cgEnd.peak;
  let engineGated = null, engineUw = null, def5 = null;
  try { engineGated = (Game.villageStandingTotal ? Game.villageStandingTotal() : null) | 0; } catch (e) {}
  try { engineUw = (Game.unlockedWave ? Game.unlockedWave() : null) | 0; } catch (e) {}
  try { def5 = Game.standingDeferral ? Game.standingDeferral(5) : null; } catch (e) {}
  const peakAfter = ((Game.state && Game.state._standingPeakWave) | 0) || 0;
  // End roster living set (validator recomputes veterans from this).
  const rosterLiving = [];
  try {
    const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
    for (const vid of roster) {
      let liv = false;
      if (vid === kcEnd.scholarId) liv = true;
      else { try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; liv = !!(vp && !vp.dead); } catch (e) {} }
      rosterLiving.push({ vid, living: liv });
    }
  } catch (e) {}
  let tableState = null;
  try { const ts = Game.tableState ? Game.tableState() : null; if (ts) tableState = { path: ts.path || null, branch: ts.branch || null, phase: ts.phase || null, seat: ts.seat || null }; } catch (e) {}
  const ts = {}, dp = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      else if (k.indexOf('dp') === 0) dp[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const row = {
    policy: 'tableseat-nowait', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1, engineUwEnd: engineUw,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    enteredPath: (tableState && tableState.path) || dp.dpPath || null,
    tableState,
    // --- full-seat scale-gate entry/entered snapshots (pure reads) ---
    entryDeedSnap,
    enteredDeedSnap,
    deaths: deathSummary(deaths), deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, dp,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    // --- wave-5 gate end snapshot ---
    gate: {
      w3rung: rungEnd,
      standing: { raw: stEnd.total | 0, war: stEnd.war | 0, diplomacy: stEnd.diplomacy | 0, plenty: stEnd.plenty | 0, warPts: stEnd.warPts | 0, links: stEnd.links | 0, feasts: stEnd.feasts | 0 },
      capped: cgEnd.capped, gatedComputed: cgEnd.gated, gatedEngine: engineGated,
      peakBeforeEngineCall: peakBefore, peakAfterEngineCall: peakAfter,
      rd5: rd5End ? { armored: rd5End.armored | 0, armed: rd5End.armed | 0, tricks: rd5End.tricks | 0, veterans: rd5End.veterans | 0, ready: !!rd5End.ready, short: rd5End.short || [], demand: rd5End.demand || null } : null,
      rd4: rd4End ? { armored: rd4End.armored | 0, armed: rd4End.armed | 0, tricks: rd4End.tricks | 0, veterans: rd4End.veterans | 0, ready: !!rd4End.ready, short: rd4End.short || [], demand: rd4End.demand || null } : null,
      deferral5: def5 ? { deferred: !!def5.deferred, grandfathered: !!def5.grandfathered, ready: !!def5.ready, raw: def5.raw | 0, capped: def5.capped | 0, threshold: def5.threshold | 0, bars: def5.bars || null } : null,
      w4faced: w4fEnd, wavesFaced: facedEnd, deedEnd,
      kills: kcEnd, waveKillsState: (Game.state && Game.state.waveKills) || {},
      waveKillLog: ((Game.state || {}).waveKillLog || []).map(e => ({ d: e.d, mid: e.mid, w: e.w, by: e.by, via: e.via })),
      rosterLiving, scholarId: kcEnd.scholarId,
    },
    daily,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

// Blocker support counting (pre-registered operationalization, encoded
// BEFORE any sweep ran): standing is ONE component (standingNum =
// raw>=200 AND capped>=200; the cap-only sub-case raw>=200,capped<200 is
// counted separately); rd5 expands to sub-bars when it is the short one.
// A seed supports C iff C is short at end AND every other component is
// met at end (w4faced met = ever met, since engagements never un-happen;
// peak wave >= 5 means wave 5 reached — no blocker on that seed).
function blockerSupport(rows) {
  const cands = ['w3rung', 'standingNum', 'capOnly', 'w4faced', 'rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans'];
  const perSeed = {};
  for (const r of rows) {
    const g = r.gate;
    const met = {
      w3rung: !!(g.w3rung && g.w3rung.met),
      standingNum: (g.standing.raw >= 200) && (g.capped >= 200),
      capOnly: !((g.standing.raw >= 200) && (g.capped < 200)), // met = "not cap-blocked"
      w4faced: (g.w4faced > 0) || (r.daily || []).some(d => (d.w4faced | 0) > 0),
      'rd5-armored': (g.rd5.armored >= (g.rd5.demand.armored | 0)),
      'rd5-armed': (g.rd5.armed >= (g.rd5.demand.armed | 0)),
      'rd5-tricks': (g.rd5.tricks >= (g.rd5.demand.tricks | 0)),
      'rd5-veterans': (g.rd5.veterans >= (g.rd5.demand.veterans | 0)),
    };
    met.rd5ready = met['rd5-armored'] && met['rd5-armed'] && met['rd5-tricks'] && met['rd5-veterans'];
    const reached5 = (r.engineUwEnd | 0) >= 5 || (r.waveReach | 0) >= 5;
    const support = [];
    if (!reached5) {
      // standingNum supports only when it is the ONLY standing shortfall
      // pattern: raw/capped short while w3, rd5ready, w4faced met.
      if (!met.standingNum && met.w3rung && met.rd5ready && met.w4faced) support.push('standingNum');
      // capOnly: raw met, capped short, everything else met.
      if ((g.standing.raw >= 200) && (g.capped < 200) && met.w3rung && met.rd5ready && met.w4faced) support.push('capOnly');
      if (!met.w3rung && met.standingNum && met.rd5ready && met.w4faced) support.push('w3rung');
      if (!met.w4faced && met.w3rung && met.standingNum && met.rd5ready) support.push('w4faced');
      for (const b of ['rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans']) {
        if (!met[b] && met.w3rung && met.standingNum && met.w4faced
          && ['rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans'].every(x => x === b || met[x])) support.push(b);
      }
    }
    perSeed[r.seed] = { met, reached5, support, short: cands.filter(c => !met[c]) };
  }
  const counts = {};
  for (const c of cands) counts[c] = rows.filter(r => (perSeed[r.seed].support || []).includes(c)).length;
  return { cands, perSeed, counts };
}

// Two-key recount (binding verdict): per seed, peak capped standing
// (daily capped max) and peak rd5 veterans (daily rd5[3] max).
function twokey(rows) {
  const perSeed = {};
  for (const r of rows) {
    const d = r.daily || [];
    const peakCapped = d.length ? Math.max.apply(null, d.map(x => x.capped | 0)) : 0;
    const peakVet = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
    const endVet = (r.gate.rd5 && r.gate.rd5.veterans) | 0;
    const vetZeroBoth = endVet === 0 && peakVet === 0;
    const bothAbsentPeak = peakVet === 0 && peakCapped < 200;
    const deedEnd = r.gate.deedEnd;
    const looseEnd = !!deedEnd && deedEnd.w1 >= 5 && deedEnd.w2 >= 5 && deedEnd.w3 >= 4 && deedEnd.w4 >= 3
      && deedEnd.contestsN >= 3 && deedEnd.crisesN >= 3 && deedEnd.stage >= 2 && deedEnd.foodDeeds && deedEnd.scale;
    // Deed daily tuple: [w1,w2,w3,w4,w5,contestsN,crisesN,stage,food,scale,ok].
    const loosePeak = d.length ? d.some(x => x.deed && x.deed[0] >= 5 && x.deed[1] >= 5 && x.deed[2] >= 4 && x.deed[3] >= 3
      && x.deed[5] >= 3 && x.deed[6] >= 3 && x.deed[7] >= 2 && x.deed[8] === 1 && x.deed[9] === 1) : false;
    perSeed[r.seed] = { peakCapped, peakVet, endVet, vetZeroBoth, bothAbsentPeak,
      endCapped: r.gate.capped, strictOkEnd: !!(deedEnd && deedEnd.ok), looseEnd, loosePeak,
      w4killsEnd: r.gate.kills.w4kills | 0 };
  }
  const count = (f) => rows.filter(r => f(perSeed[r.seed])).length;
  return { perSeed,
    bothAbsentPeak: count(x => x.bothAbsentPeak),
    vetZeroBoth: count(x => x.vetZeroBoth),
    strictOkWithZeroKills: count(x => x.strictOkEnd && x.w4killsEnd === 0),
    looseEndWithZeroKills: count(x => x.looseEnd && x.w4killsEnd === 0),
    loosePeakWithZeroKills: count(x => x.loosePeak && x.w4killsEnd === 0) };
}

function aggregate(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n || (r.engineUwEnd || 1) >= n).length;
  const deathTotals = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + r.deaths[k];
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    medianGameDays: medianOf(rows.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    enteredByPath: (() => { const m = {}; for (const r of rows.filter(x => x.entered)) { const p = r.enteredPath || 'unknown'; m[p] = (m[p] || 0) + 1; } return m; })(),
    fullSeat: rows.filter(r => r.tableState && r.tableState.seat === 'full').length,
    lesserSeat: rows.filter(r => r.tableState && r.tableState.seat === 'lesser').length,
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotals,
    w4killsTotal: rows.reduce((t, r) => t + (r.gate.kills.w4kills | 0), 0),
    w4killersTotal: rows.reduce((t, r) => t + (r.gate.kills.w4killers | 0), 0),
    livingW4killersTotal: rows.reduce((t, r) => t + (r.gate.kills.livingW4killers | 0), 0),
  };
}

// Full-seat scale-gate counting (binding prereg definitions).
// barsOnly(d) = waves && contests && crises && stageOk && foodDeeds,
// recomputed from a deed snapshot's own fields. For a snapshot:
//   eligible = barsOnly; blocked = eligible && !scale; pass = eligible && scale.
// ENTRY split counts invited villages at their entry snapshot; END split
// counts table-reaching villages at their end snapshot (deedEnd).
// Lesser entries (end seat 'lesser') are their own split, unaffected
// by the full-seat gate. A scale-false 'full' seat at end is a gate
// failure and is flagged (not counted as pass).
function barsOnlyOf(d) {
  return !!(d && d.waves && d.contests && d.crises && d.stageOk && d.foodDeeds);
}
function fullseatgate(rows) {
  const perSeed = {};
  for (const r of rows) {
    const entry = r.entryDeedSnap && r.entryDeedSnap.deed;
    const entered = r.enteredDeedSnap && r.enteredDeedSnap.deed;
    const end = r.gate && r.gate.deedEnd;
    const cls = (d) => (d ? { barsOnly: barsOnlyOf(d), scale: !!d.scale, ok: !!d.ok,
      stage: d.stage | 0, stageOk: !!d.stageOk, rank: d.rank || null,
      blocked: barsOnlyOf(d) && !d.scale, pass: barsOnlyOf(d) && !!d.scale } : null);
    perSeed[r.seed] = {
      invited: r.table ? 1 : 0, entered: r.entered ? 1 : 0,
      seat: (r.tableState && r.tableState.seat) || null,
      entryDay: r.entryDeedSnap ? r.entryDeedSnap.day : null,
      entry: cls(entry), enteredDay: r.enteredDeedSnap ? r.enteredDeedSnap.day : null,
      enteredSnap: cls(entered), end: cls(end),
    };
  }
  const invited = rows.filter(r => r.table);
  const count = (f) => rows.filter(r => f(perSeed[r.seed])).length;
  const entry = {
    invited: invited.length,
    entrySnapPresent: count(x => x.invited && !!x.entry),
    eligible: count(x => x.invited && x.entry && x.entry.barsOnly),
    blocked: count(x => x.invited && x.entry && x.entry.blocked),
    pass: count(x => x.invited && x.entry && x.entry.pass),
  };
  const end = {
    tableReaching: invited.length,
    endSnapPresent: count(x => x.invited && !!x.end),
    eligible: count(x => x.invited && x.end && x.end.barsOnly),
    blocked: count(x => x.invited && x.end && x.end.blocked),
    pass: count(x => x.invited && x.end && x.end.pass),
  };
  const lesser = rows.filter(r => r.tableState && r.tableState.seat === 'lesser').length;
  const full = rows.filter(r => r.tableState && r.tableState.seat === 'full').length;
  const fullScaleFalse = rows.filter(r => r.tableState && r.tableState.seat === 'full'
    && r.gate && r.gate.deedEnd && !r.gate.deedEnd.scale).length;
  const instrumentComplete = rows.length === 8 && entry.entrySnapPresent === entry.invited
    && end.endSnapPresent === end.tableReaching;
  let verdictCandidate;
  if (!instrumentComplete) verdictCandidate = 'INSTRUMENT-FAIL';
  else if (entry.invited === 0) verdictCandidate = 'INCONCLUSIVE (0 table entries)';
  else verdictCandidate = 'AUDIT-GO';
  return { perSeed, entry, end, lesser, full, fullScaleFalse, instrumentComplete, verdictCandidate };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '74501,74502,74503,74504,74505,74506,74507,74508')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-fullseatgate-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    const row = await runOne(seed, days, evidDir);
    rows.push(row);
    const g = row.gate;
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} waveReach=${row.waveReach} engineUw=${row.engineUwEnd} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} path=${row.enteredPath} seat=${row.tableState && row.tableState.seat} won=${row.won} | w3=${g.w3rung.met ? 1 : 0} raw=${g.standing.raw} war=${g.standing.war} dip=${g.standing.diplomacy} plenty=${g.standing.plenty} capped=${g.capped} gatedComp=${g.gatedComputed} gatedEng=${g.gatedEngine} peak=${g.peakBeforeEngineCall}->${g.peakAfterEngineCall} rd5=${g.rd5.armored}/${g.rd5.armed}/${g.rd5.tricks}/${g.rd5.veterans} short=${JSON.stringify(g.rd5.short)} w4faced=${g.w4faced} w4kills=${g.kills.w4kills} livingW4=${g.kills.livingW4killers} starv=${row.starvationDeaths} deedEnd=${row.gate.deedEnd ? JSON.stringify(row.gate.deedEnd) : 'null'} entryDeed=${row.entryDeedSnap ? JSON.stringify(row.entryDeedSnap) : 'null'} enteredDeed=${row.enteredDeedSnap ? JSON.stringify(row.enteredDeedSnap) : 'null'}`);
  }
  const agg = aggregate(rows);
  const blk = blockerSupport(rows);
  const tk = twokey(rows);
  const fg = fullseatgate(rows);
  const verdict = fg.verdictCandidate;
  const report = {
    label: 'sim-fullseatgate-a full-seat scale-gate census', seeds, days, rows, aggregate: agg,
    blocker: blk, twokey: tk, fullseatgate: fg, verdictCandidate: verdict,
    verdictRule: 'AUDIT-GO iff instrument reports scale-vs-ok at entry and end for every table-reaching village on 8/8 seeds AND >= 1 table entry; INCONCLUSIVE iff 0 table entries; INSTRUMENT-FAIL iff any table-reaching seed lacks its entry/end snapshot (judged in evidence, not here)',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fullseatgate-a census ===');
  console.log(`  n=${agg.n} won=${agg.won} medD=${agg.medianDays} medGameD=${agg.medianGameDays} maxD=${agg.maxDays} natEver=${agg.nationalEver} natFinal=${agg.nationalFinal} table=${agg.table} entered=${agg.entered} enteredByPath=${JSON.stringify(agg.enteredByPath)} fullSeat=${agg.fullSeat} lesserSeat=${agg.lesserSeat} wave4=${agg.wave4} wave5=${agg.wave5} maxArc=${agg.maxArc} starvTotal=${agg.starvationTotal} w4kills=${agg.w4killsTotal} w4killers=${agg.w4killersTotal} livingW4=${agg.livingW4killersTotal}`);
  console.log(`  fullseatgate ENTRY: invited=${fg.entry.invited} snapPresent=${fg.entry.entrySnapPresent} eligible=${fg.entry.eligible} BLOCKED=${fg.entry.blocked} PASS=${fg.entry.pass}`);
  console.log(`  fullseatgate END: tableReaching=${fg.end.tableReaching} snapPresent=${fg.end.endSnapPresent} eligible=${fg.end.eligible} BLOCKED=${fg.end.blocked} PASS=${fg.end.pass}`);
  console.log(`  fullseatgate splits: lesser=${fg.lesser} full=${fg.full} fullScaleFalse=${fg.fullScaleFalse} instrumentComplete=${fg.instrumentComplete} -> VERDICT CANDIDATE: ${verdict}`);
  console.log(`  blocker support: ${JSON.stringify(blk.counts)}`);
  console.log(`  twokey per-seed: ${JSON.stringify(tk.perSeed)}`);
  console.log(`  -> ${summaryPath}`);
}

(async () => {
  await sweepMode();
})().catch(e => { console.error('FULLSEATGATE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
