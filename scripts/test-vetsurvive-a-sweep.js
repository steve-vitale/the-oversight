#!/usr/bin/env node
// scripts/test-vetsurvive-a-sweep.js — wave-4 killer-fate census (DIAG ONLY).
// Run fleshout-20261027T2036Z, axis scale-onramp, worker sim-vetsurvive-a.
//
// Single arm: scripts/policies/tableseat-nowait.js VERBATIM
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) on seeds
// 74801-74808, 180d DEATH-AWARE horizon (runDays stops on death/win).
// ADAPTED from test-w5seq-a-sweep.js: the gate census is kept (so wall
// numbers compare), and a per-kill KILLER-FATE tracker is added: every
// wave-4 kill entry in state.waveKillLog gets identity, kill day,
// alive/dead at village end, death day + death cause if dead, and
// post-kill survival days. Courtship ctx counters are captured in full
// (rule3trial lesson: delegation gates cannot detect missing courtship).
// No game code is touched, no default flipped, no lever under test.
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
// (scripts/test-w5seq-a.js) checks computed == engine, allowing only
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



// Wave-4 log entries (full, for the fate tracker).
function w4LogEntries(Game) {
  return (((Game.state || {}).waveKillLog || []).filter(e => e && ((e.w | 0) === 4)));
}
// Gate living rule for one vid at end of run (scholar vid at end counts
// living by definition; otherwise vpOf must exist and not be dead).
function gateLiving(Game, vid, scholarIdEnd) {
  if (vid === scholarIdEnd) return true;
  try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); } catch (e) { return false; }
}
function dispName(Game, vid) {
  try { const n = (typeof Game.disp === 'function') ? Game.disp(vid) : null; if (n) return String(n); } catch (e) {}
  try { const n = (typeof Game.displayName === 'function') ? Game.displayName(vid) : null; if (n) return String(n); } catch (e) {}
  try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; if (vp && vp.name) return String(vp.name); } catch (e) {}
  return String(vid);
}
function monsterName(Game, mid) {
  try { const m = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); if (m && m.name) return String(m.name); } catch (e) {}
  return String(mid);
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
  const { Game } = await loadGame({ seed, mode: 'vetsurvive-a', fullTelemetry: false });
  await setupGame(Game);
  const daily = [];
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const killerTrack = {}; // vid -> {vid,nameFirstSeen,firstKillDay,kills[],lastAliveDay,deathDayApprox,dead}
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
        try {
          const dayNow = ((G.state || {}).scholar || {}).day || 0;
          const sidNow = ((G.state || {}).scholar || {}).villagerId || kc.scholarId;
          for (const e of w4LogEntries(G)) {
            const vid = e.by; if (!vid) continue;
            if (!killerTrack[vid]) killerTrack[vid] = { vid, nameFirstSeen: dispName(G, vid), firstKillDay: (e.d | 0), kills: [], lastAliveDay: null, deathDayApprox: null, dead: false };
            const tr = killerTrack[vid];
            if (!tr.kills.some(k => k.d === (e.d | 0) && k.mid === e.mid && k.via === (e.via || 'unknown'))) tr.kills.push({ d: (e.d | 0), mid: e.mid, via: (e.via || 'unknown'), trick: e.trick || null });
            if (tr.firstKillDay > (e.d | 0)) tr.firstKillDay = (e.d | 0);
            let alive = false;
            if (vid === sidNow) alive = true;
            else { try { const vp = (typeof G.vpOf === 'function') ? G.vpOf(vid) : null; alive = !!(vp && !vp.dead); } catch (err) {} }
            if (alive) tr.lastAliveDay = dayNow; else if (!tr.dead) { tr.dead = true; tr.deathDayApprox = dayNow; }
          }
        } catch (err) {}
        const day = ((G.state || {}).scholar || {}).day || 0;
        const w4f = (G.waveEngaged ? G.waveEngaged(4) : 0) | 0;
        const deed = deedSnap(G);
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
      if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
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
  // COURTSHIP (rule3trial lesson): capture the leanlinkrescue courtship
  // counters in full — a delegation gate alone cannot detect missing
  // courtship. tendTrusts is a list; only its length is kept.
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.tendTrustsN = (capturedCtx && capturedCtx.tendTrusts) ? capturedCtx.tendTrusts.length : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  // KILLER-FATE TABLE (judged census): one record per wave-4 kill entry,
  // grouped by killer vid. Death cause matches the harness live-death
  // capture by name (earliest entry with day >= first kill day); an
  // unmatched dead killer keeps deathDayApprox with cause 'unmatched'
  // and is flagged, never invented.
  const deathsForFate = result.samples.deaths || [];
  const endLog = w4LogEntries(Game);
  const fateKillers = [];
  const seenVids = [];
  for (const e of endLog) if (e.by && seenVids.indexOf(e.by) < 0) seenVids.push(e.by);
  for (const vid of seenVids) {
    const tr = killerTrack[vid] || null;
    const kills = endLog.filter(e => e.by === vid).map(e => ({ d: (e.d | 0), mid: e.mid, monster: monsterName(Game, e.mid), via: (e.via || 'unknown'), trick: e.trick || null }));
    const firstKillDay = Math.min.apply(null, kills.map(k => k.d)); // kills non-empty by construction; never seed with 0 (that bug reported 0 once)
    const endName = dispName(Game, vid);
    const aliveAtEnd = gateLiving(Game, vid, kcEnd.scholarId);
    let deathDay = null, deathCause = null, deathPlayer = null, deathMatch = null;
    if (!aliveAtEnd) {
      deathDay = tr ? tr.deathDayApprox : null;
      const names = [endName, tr ? tr.nameFirstSeen : null].filter(Boolean);
      const cand = deathsForFate.filter(d => d && (d.day | 0) >= firstKillDay && (names.indexOf(String(d.who)) >= 0 || String(d.who) === String(vid)));
      cand.sort((a, b) => (a.day | 0) - (b.day | 0));
      if (cand.length) { deathMatch = cand[0]; deathDay = (deathMatch.day | 0); deathCause = String(deathMatch.cause || 'unknown'); deathPlayer = !!deathMatch.player; }
      else { deathCause = 'unmatched'; }
    }
    const endDay = result.days;
    fateKillers.push({
      vid, name: endName, nameFirstSeen: tr ? tr.nameFirstSeen : null,
      kills, killCount: kills.length, firstKillDay,
      aliveAtEnd: aliveAtEnd ? 1 : 0,
      deathDay, deathCause, deathPlayer,
      deathDayApprox: tr ? tr.deathDayApprox : null,
      trackedDaily: tr ? 1 : 0,
      postKillSurvival: aliveAtEnd ? (endDay - firstKillDay) : (deathDay != null ? (deathDay - firstKillDay) : null),
      censored: aliveAtEnd ? 1 : 0,
    });
  }
  const killerFate = { killers: fateKillers, totalKills: endLog.length, killerCount: fateKillers.length,
    deadKillers: fateKillers.filter(k => !k.aliveAtEnd).length,
    aliveKillers: fateKillers.filter(k => k.aliveAtEnd).length,
    unmatchedDeaths: fateKillers.filter(k => !k.aliveAtEnd && k.deathCause === 'unmatched').length };
  // rd4/rd5 veterans peaks from the daily series.
  const rdPeaks = {
    rd4peak: daily.length ? Math.max.apply(null, daily.map(x => (x.rd4 ? x.rd4[3] | 0 : 0))) : 0,
    rd5peak: daily.length ? Math.max.apply(null, daily.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0,
    rd4end: (rd4End && rd4End.veterans) | 0,
    rd5end: (rd5End && rd5End.veterans) | 0,
  };
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
    deaths: deathSummary(deaths), deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, dp, courtship, killerFate, rdPeaks,
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

// Sequential-leg computation (sim-w5seq-a prereg LEG 2).
// Daily point fields: d, raw, capped, gated, peak, rd5=[arm,armed,tricks,vet],
// rd4=[arm,armed,tricks,vet], w4faced, uw, deed. rd4ready = 3/5/3/1,
// rd5ready = 4/6/3/2 on the tuple counts (tuple armored already counts
// only armor meeting the P floor, per standing.js).
function seqLeg(rows) {
  const rd4ready = (t) => t && (t[0] | 0) >= 3 && (t[1] | 0) >= 5 && (t[2] | 0) >= 3 && (t[3] | 0) >= 1;
  const rd5ready = (t) => t && (t[0] | 0) >= 4 && (t[1] | 0) >= 6 && (t[2] | 0) >= 3 && (t[3] | 0) >= 2;
  const perSeed = {};
  for (const r of rows) {
    const d = r.daily || [];
    const peakCapped = d.length ? Math.max.apply(null, d.map(x => x.capped | 0)) : 0;
    const peakVet = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
    const peakGated = d.length ? Math.max.apply(null, d.map(x => x.gated | 0)) : 0;
    // S1 day-form: every gated>=200 & peak<5 point has both keys at that point.
    let s1violations = 0, firstGated200 = null;
    for (const x of d) {
      if ((x.gated | 0) >= 200) {
        if (!firstGated200) firstGated200 = { d: x.d, capped: x.capped | 0, rd5vet: (x.rd5 ? x.rd5[3] | 0 : 0), peak: x.peak | 0 };
        if ((x.peak | 0) < 5 && !(((x.capped | 0) >= 200) && ((x.rd5 ? x.rd5[3] | 0 : 0) >= 2))) s1violations++;
      }
    }
    const s1peakForm = !(peakGated >= 200 && !(peakCapped >= 200 && peakVet >= 2));
    const eng = r.gate.gatedEngine | 0;
    const s1engine = !(eng >= 200 && !(peakCapped >= 200 && peakVet >= 2) && !((r.gate.peakAfterEngineCall | 0) >= 5));
    // S2 deferral: a point with raw>=100, rd4vet=0, gated<=99.
    const defPoints = d.filter(x => (x.raw | 0) >= 100 && ((x.rd4 ? x.rd4[3] | 0 : 0) === 0) && (x.gated | 0) <= 99);
    const soleShort = defPoints.filter(x => {
      const t = x.rd4 || [0, 0, 0, 0];
      return (t[0] | 0) >= 3 && (t[1] | 0) >= 5 && (t[2] | 0) >= 3; // veterans the ONLY short rd4 bar
    });
    // 74316 replication: standing key at peak, veterans never, gated never 200.
    const rep74316 = (peakCapped >= 200 && peakVet === 0 && peakGated <= 199) ? 1 : 0;
    // S3: wave 5 reached without both keys at peak.
    const reached5 = d.some(x => (x.uw | 0) >= 5) || (r.engineUwEnd | 0) >= 5 || (r.waveReach | 0) >= 5;
    const s3violation = reached5 && !(peakCapped >= 200 && peakVet >= 2);
    // First-veteran days (descriptive).
    const f4 = d.find(x => (x.rd4 ? x.rd4[3] | 0 : 0) >= 1) || null;
    const f5 = d.find(x => (x.rd5 ? x.rd5[3] | 0 : 0) >= 1) || null;
    perSeed[r.seed] = { peakCapped, peakVet, peakGated, firstGated200,
      s1violations, s1peakForm, s1engine, s1ok: s1violations === 0 && s1peakForm && s1engine,
      deferralPoints: defPoints.length, deferralFirstDay: defPoints.length ? defPoints[0].d : null,
      soleShortPoints: soleShort.length,
      rep74316, reached5, s3violation,
      firstVet4: f4 ? { d: f4.d, raw: f4.raw | 0, capped: f4.capped | 0, gated: f4.gated | 0, rd4: f4.rd4, rd4ready: rd4ready(f4.rd4), rd5vet: (f4.rd5 ? f4.rd5[3] | 0 : 0) } : null,
      firstVet5: f5 ? { d: f5.d, raw: f5.raw | 0, capped: f5.capped | 0, gated: f5.gated | 0, rd5: f5.rd5, rd5ready: rd5ready(f5.rd5), rd4vet: (f5.rd4 ? f5.rd4[3] | 0 : 0) } : null };
  }
  const s1ok = rows.every(r => perSeed[r.seed].s1ok);
  const s2seeds = rows.filter(r => perSeed[r.seed].deferralPoints > 0).length;
  const s3ok = rows.every(r => !perSeed[r.seed].s3violation);
  return { perSeed, s1ok, s2seeds, s2ok: s2seeds >= 1, s3ok,
    seqOk: s1ok && s2seeds >= 1 && s3ok,
    rep74316seeds: rows.filter(r => perSeed[r.seed].rep74316).length,
    soleShortSeeds: rows.filter(r => perSeed[r.seed].soleShortPoints > 0).length };
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

async function sweepMode() {
  const seeds = (process.env.SEEDS || '74801,74802,74803,74804,74805,74806,74807,74808')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-vetsurvive-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    const row = await runOne(seed, days, evidDir);
    rows.push(row);
    const g = row.gate;
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} waveReach=${row.waveReach} engineUw=${row.engineUwEnd} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} path=${row.enteredPath} seat=${row.tableState && row.tableState.seat} won=${row.won} | w3=${g.w3rung.met ? 1 : 0} raw=${g.standing.raw} war=${g.standing.war} dip=${g.standing.diplomacy} plenty=${g.standing.plenty} capped=${g.capped} gatedComp=${g.gatedComputed} gatedEng=${g.gatedEngine} peak=${g.peakBeforeEngineCall}->${g.peakAfterEngineCall} rd5=${g.rd5.armored}/${g.rd5.armed}/${g.rd5.tricks}/${g.rd5.veterans} short=${JSON.stringify(g.rd5.short)} w4faced=${g.w4faced} w4kills=${g.kills.w4kills} livingW4=${g.kills.livingW4killers} starv=${row.starvationDeaths} deedEnd=${row.gate.deedEnd ? JSON.stringify(row.gate.deedEnd) : 'null'}`);
  }
  const agg = aggregate(rows);
  const blk = blockerSupport(rows);
  const tk = twokey(rows);
  const sq = seqLeg(rows);
  const fateAll = [];
  for (const r of rows) for (const k of (r.killerFate.killers || [])) fateAll.push(Object.assign({ seed: r.seed }, k));
  const fateDead = fateAll.filter(k => !k.aliveAtEnd);
  const fateComplete = fateAll.every(k => k.aliveAtEnd || (k.deathDay != null && k.deathCause && k.deathCause !== 'unmatched'));
  const causeCounts = {};
  for (const k of fateDead) if (k.deathCause) causeCounts[k.deathCause] = (causeCounts[k.deathCause] || 0) + 1;
  const causeKeys = Object.keys(causeCounts).sort((a, b) => causeCounts[b] - causeCounts[a]);
  const survDead = fateDead.map(k => k.postKillSurvival).filter(v => v != null).sort((a, b) => a - b);
  const medianSurvDead = survDead.length ? survDead[Math.floor(survDead.length / 2)] : null;
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;
  const verdict = (rows.length === 8 && fateComplete) ? 'CENSUS-GO (killer-fate census complete)'
    : (rows.length === 8 && fateAll.length === 0 ? 'CENSUS-GO (kill scarcity: zero wave-4 kills, census complete)'
    : 'CENSUS-INCOMPLETE');
  const report = {
    label: 'sim-vetsurvive-a wave-4 killer-fate census', seeds, days, rows, aggregate: agg,
    blocker: blk, twokey: tk, seq: sq, verdictCandidate: verdict,
    fate: { all: fateAll, dead: fateDead.length, alive: fateAll.filter(k => k.aliveAtEnd).length,
      totalKills: fateAll.reduce((t, k) => t + k.killCount, 0), fateComplete,
      dominantCause: causeKeys.length ? causeKeys[0] : null, causeCounts,
      medianPostKillSurvivalDead: medianSurvDead, survDead },
    courtship: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk },
    verdictRule: 'CENSUS-GO iff 8/8 rows AND every wave-4 kill has a complete fate record (alive, or deathDay + matched cause); zero kills = CENSUS-GO (kill scarcity). Substrate gate (courtship combined > 0 band-wide AND >= 6/8 seeds active) invalidates the run if failed — judged in evidence, not here.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-vetsurvive-a census ===');
  console.log(`  n=${agg.n} won=${agg.won} medD=${agg.medianDays} medGameD=${agg.medianGameDays} maxD=${agg.maxDays} natEver=${agg.nationalEver} natFinal=${agg.nationalFinal} table=${agg.table} entered=${agg.entered} enteredByPath=${JSON.stringify(agg.enteredByPath)} fullSeat=${agg.fullSeat} lesserSeat=${agg.lesserSeat} wave4=${agg.wave4} wave5=${agg.wave5} maxArc=${agg.maxArc} starvTotal=${agg.starvationTotal} w4kills=${agg.w4killsTotal} w4killers=${agg.w4killersTotal} livingW4=${agg.livingW4killersTotal}`);
  console.log(`  blocker support: ${JSON.stringify(blk.counts)}`);
  console.log(`  twokey per-seed: ${JSON.stringify(tk.perSeed)}`);
  console.log(`  twokey bothAbsentPeak=${tk.bothAbsentPeak} vetZeroBoth=${tk.vetZeroBoth} strictOkZeroKills=${tk.strictOkWithZeroKills} looseEndZeroKills=${tk.looseEndWithZeroKills} loosePeakZeroKills=${tk.loosePeakWithZeroKills}`);
  console.log(`  fate kills=${report.fate.totalKills} killers=${fateAll.length} dead=${report.fate.dead} alive=${report.fate.alive} complete=${fateComplete} dominantCause=${report.fate.dominantCause} medianSurvDead=${medianSurvDead} courtCombined=${courtTotals.combined} courtSeedsActive=${courtSeedsActive} substrateOk=${substrateOk} -> VERDICT CANDIDATE: ${verdict}`);
  console.log(`  seq s1ok=${sq.s1ok} s2seeds=${sq.s2seeds} s3ok=${sq.s3ok} seqOk=${sq.seqOk} rep74316seeds=${sq.rep74316seeds} soleShortSeeds=${sq.soleShortSeeds} -> VERDICT CANDIDATE: ${verdict}`);
  console.log(`  -> ${summaryPath}`);
}

(async () => {
  await sweepMode();
})().catch(e => { console.error('VETSURVIVE SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
