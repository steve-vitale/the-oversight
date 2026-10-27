#!/usr/bin/env node
// scripts/test-w4abstain-a-sweep.js — villager-only wave-4 kill
// conversion census under player abstention (DIAG ONLY).
// Run fleshout-20261027T2147Z, axis scale-onramp, worker sim-w4abstain-a.
//
// Single arm: scripts/policies/tableseat-nowait.js VERBATIM
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) PLUS
// scripts/policies/w4abstain.js (W4ABSTAIN=1) on seeds 75101-75108,
// 180d DEATH-AWARE horizon (runDays stops on death/win).
// ADAPTED from test-vetsurvive-a-sweep.js: the gate census is kept
// (so wall numbers compare), and the following are added: the
// w4funnel recorder stack VERBATIM (raftdraft, spawnsrc, oldcore,
// w5births, defwound) + nonworldkill-diag installed OUTERMOST, a
// strike counter (recorder-style wrap on Game.tbPlayerStrike), and
// a det-gate mode (seed 75101, recorders ON vs OFF, headlines must
// agree exactly — run BEFORE the judged sweep).
//
// Gate model (same replication as vetsurvive, unchanged):
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
// READ DISCIPLINE (same as vetsurvive): the daily series uses ONLY
// pure reads. It NEVER calls villageStandingTotal() or unlockedWave()
// daily; the daily gated total and daily unlocked wave are COMPUTED
// from the pure reads. The engine's own numbers are called once at
// end and recorded separately.
//
// Per-seed rows are written INCREMENTALLY via the chunked writer
// subprocess (same pattern as test-vetsurvive-a-sweep.js) so a write
// flap cannot silently lose a row: the row JSON is printed to stdout
// first (ROWJSON-BEGIN/END), then written with sha check + retry.
//
// Modes: default = census sweep (SEEDS / DAYS / EVID env).
//   --detgate = det-gate only (DETSEED / DAYS / EVID env): seed
//   DETSEED run twice under the abstain policy, recorders+counter ON
//   vs OFF; headlines must agree exactly; exit 1 on mismatch.
// Exit 0 on a completed sweep (verdict is data, judged in evidence
// via scripts/test-w4abstain-a.js); exit 1 on a proof-gate failure
// (missing row, zero-day row, missing gate field, det-gate mismatch).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { w4abstain } = require('./policies/w4abstain');
const {
  newStore: newRaftStore, installRaftdraftDiag, withRaftdraftDiag,
} = require('./policies/raftdraft-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newOldStore, installOldcoreDiag, withOldcoreDiag, snapshotOldcore,
} = require('./policies/oldcore-diag');
const {
  newStore: newW5Store, installW5birthsDiag, withW5birthsDiag,
} = require('./policies/w5births-diag');
const {
  newStore: newDefStore, installDefwoundDiag, withDefwoundDiag,
} = require('./policies/defwound-diag');
const {
  newStore: newNwStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');

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

function w4LogEntries(Game) {
  return (((Game.state || {}).waveKillLog || []).filter(e => e && ((e.w | 0) === 4)));
}
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
function monsterWave(Game, mid) {
  try { const m = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); if (m && m.wave != null) return (m.wave | 0); } catch (e) {}
  return null;
}

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

// Strike counter: recorder-style wrap on Game.tbPlayerStrike.
// Records AFTER delegating (the original return value decides whether
// the strike landed — refused calls return false). Never throws into
// the engine: recording errors are counted on the store, never raised.
function installStrikeCounter(Game, store) {
  if (!Game || !store || typeof Game.tbPlayerStrike !== 'function') { store.errs = (store.errs || 0) + 1; return; }
  const orig = Game.tbPlayerStrike;
  Game.tbPlayerStrike = function (targetKey) {
    let ret = false;
    try { ret = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      const f = Game.tbfight;
      const waves = [];
      if (f && Array.isArray(f.fighters)) {
        for (const o of f.fighters) {
          if (!o || o.kind !== 'monster' || !o.alive || o.fled) continue;
          let w = null;
          if (o.mdef && o.mdef.wave != null) w = (o.mdef.wave | 0);
          else if (o.monsterId) w = monsterWave(Game, o.monsterId);
          if (w != null && waves.indexOf(w) < 0) waves.push(w);
        }
      }
      store.strikes.push({
        fightId: (f && f.id) || null,
        day: ((Game.state || {}).scholar || {}).day || 0,
        target: targetKey || null,
        waves: waves,
        returned: !!ret,
      });
    } catch (e) { store.errs = (store.errs || 0) + 1; }
    return ret;
  };
  store.installed = true;
}

async function runOne(seed, days, evidDir, armed) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.W4ABSTAIN = '1';
  delete process.env.TABLEDEFIANT;
  let raftStore = null, spawnStore = null, oldStore = null, w5Store = null, defStore = null, nwStore = null;
  const strikeStore = { strikes: [], errs: 0, installed: false };
  let base = w4abstain;
  if (armed) {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.OLDCORE = '1';
    process.env.W5BIRTHS = '1'; process.env.DEFWOUND = '1'; process.env.NONWORLDKILL = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); oldStore = newOldStore();
    w5Store = newW5Store(); defStore = newDefStore(); nwStore = newNwStore();
    // Nonworldkill OUTERMOST (last wrap), per its own doc.
    base = withNonworldkillDiag(
      withW5birthsDiag(
        withDefwoundDiag(
          withOldcoreDiag(
            withSpawnsrcDiag(
              withRaftdraftDiag(w4abstain, 'raftdraft-diag', 'w4abstain + raid draft census', raftStore),
              'spawnsrc-diag', 'w4abstain + spawn-source census', spawnStore),
            'oldcore-diag', 'w4abstain + old-core turnover census', oldStore),
          'defwound-diag', 'w4abstain + defender wound census', defStore),
        'w5births-diag', 'w4abstain + wave-5 birth-gate census', w5Store),
      'nonworldkill-diag', 'w4abstain + TB initiation census', nwStore);
  } else {
    delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE;
    delete process.env.W5BIRTHS; delete process.env.DEFWOUND; delete process.env.NONWORLDKILL;
  }
  const { Game } = await loadGame({ seed, mode: 'w4abstain-a', fullTelemetry: false });
  await setupGame(Game);
  if (armed) {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) {}
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) {}
    try { installOldcoreDiag(Game, oldStore); } catch (e) {}
    try { installDefwoundDiag(Game, defStore); } catch (e) {}
    try { installW5birthsDiag(Game, w5Store); } catch (e) {}
    try { installNonworldkillDiag(Game, nwStore); } catch (e) {}
    try { installStrikeCounter(Game, strikeStore); } catch (e) { strikeStore.errs++; }
  }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const killerTrack = {};
  const daily = [];
  const policy = Object.assign({}, base, {
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
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
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
  const ts = {}, dp = {}, ab = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      else if (k.indexOf('dp') === 0) dp[k] = capturedCtx[k];
      else if (k.indexOf('w4abstain') === 0) ab[k] = capturedCtx[k];
    }
  }
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.tendTrustsN = (capturedCtx && capturedCtx.tendTrusts) ? capturedCtx.tendTrusts.length : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const deathsForFate = result.samples.deaths || [];
  const endLog = w4LogEntries(Game);
  const fateKillers = [];
  const seenVids = [];
  for (const e of endLog) if (e.by && seenVids.indexOf(e.by) < 0) seenVids.push(e.by);
  for (const vid of seenVids) {
    const tr = killerTrack[vid] || null;
    const kills = endLog.filter(e => e.by === vid).map(e => ({ d: (e.d | 0), mid: e.mid, monster: monsterName(Game, e.mid), via: (e.via || 'unknown'), trick: e.trick || null }));
    const firstKillDay = Math.min.apply(null, kills.map(k => k.d)); // kills non-empty by construction; never seed with 0 (vetsurvive lesson)
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
  const rdPeaks = {
    rd4peak: daily.length ? Math.max.apply(null, daily.map(x => (x.rd4 ? x.rd4[3] | 0 : 0))) : 0,
    rd5peak: daily.length ? Math.max.apply(null, daily.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0,
    rd4end: (rd4End && rd4End.veterans) | 0,
    rd5end: (rd5End && rd5End.veterans) | 0,
  };
  let finalPresent = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    finalPresent = list.map(m => ({ seq: (m._spawnSeq != null ? m._spawnSeq : null), src: (m._spawnsrc || null), type: m.id || null, wave: (m.wave != null ? m.wave : null), hp: (m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null }));
  } catch (e) {}
  if (oldStore) { try { snapshotOldcore(Game, oldStore); } catch (e) {} }
  const row = {
    policy: 'w4abstain', seed,
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
    abstain: ab,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
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
    recorders: armed ? {
      raftdraft: { raids: raftStore.raids, calls: raftStore.calls, fieldFights: raftStore.fieldFights,
        diag: { errs: raftStore.errs, errors: raftStore.errors, overflow: raftStore.overflow, installed: raftStore.installed } },
      spawnsrc: { raids: spawnStore.raids, spawns: spawnStore.spawns,
        diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed } },
      oldcore: { births: oldStore.births, removals: oldStore.removals, tbEnds: oldStore.tbEnds,
        snapshots: oldStore.snapshots, finalPresent: finalPresent, pendingLifts: oldStore.pendingLifts || [],
        diag: { errs: oldStore.errs, errors: oldStore.errors, overflow: oldStore.overflow, installed: oldStore.installed } },
      defwound: { resolveFights: defStore.resolveFights,
        diag: { errs: defStore.errs, errors: defStore.errors, overflow: defStore.overflow, installed: defStore.installed } },
      w5births: { days: w5Store.days, targetCounts: w5Store.targetCounts, targetCalls: w5Store.targetCalls,
        maxTop: w5Store.maxTop, firstTop5Day: w5Store.firstTop5Day, firstTarget5Day: w5Store.firstTarget5Day,
        targets: w5Store.targets,
        diag: { errs: w5Store.errs, errors: w5Store.errors, overflow: w5Store.overflow, installed: w5Store.installed } },
      nonworldkill: { starts: nwStore.starts, ends: nwStore.ends,
        diag: { errs: nwStore.errs, errors: nwStore.errors, overflow: nwStore.overflow, installed: nwStore.installed } },
      strikeCounter: strikeStore,
    } : null,
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

function headlineOf(r) {
  return { days: r.days, gameDays: r.gameDays, endReason: r.endReason, won: r.won,
    waveReach: r.waveReach, engineUwEnd: r.engineUwEnd, nationalEver: r.nationalEver,
    nationalFinal: r.nationalFinal, table: r.table, entered: r.entered,
    w4kills: (r.gate && r.gate.kills && r.gate.kills.w4kills) | 0,
    courtshipCombined: (r.courtship && r.courtship.combined) | 0 };
}

async function detgateMode() {
  const seed = parseInt(process.env.DETSEED || '75101', 10) || 75101;
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4abstain-a');
  fs.mkdirSync(evidDir, { recursive: true });
  console.log(`DETGATE seed=${seed} days=${days} (recorders+counter ON vs OFF, abstain policy both sides)`);
  const on = await runOne(seed, days, null, true);
  const off = await runOne(seed, days, null, false);
  const hOn = headlineOf(on), hOff = headlineOf(off);
  const keys = Object.keys(hOn);
  const diffs = keys.filter(k => JSON.stringify(hOn[k]) !== JSON.stringify(hOff[k]));
  const pass = diffs.length === 0;
  const report = { mode: 'detgate', seed, days, on: hOn, off: hOff, diffs, pass,
    generated: new Date().toISOString() };
  const dp = path.join(evidDir, 'detgate.json');
  writeRowViaWriter(dp, JSON.stringify(report, null, 1) + '\n');
  console.log(`DETGATE ${pass ? 'PASS' : 'FAIL'} on=${JSON.stringify(hOn)} off=${JSON.stringify(hOff)} diffs=${JSON.stringify(diffs)}`);
  console.log(`  -> ${dp}`);
  if (!pass) { console.error('DETGATE FAILED: recorders moved the trajectory — aborting before the judged sweep.'); process.exit(1); }
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4abstain-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    const row = await runOne(seed, days, evidDir, true);
    rows.push(row);
    const g = row.gate;
    const ab = row.abstain || {};
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} waveReach=${row.waveReach} engineUw=${row.engineUwEnd} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} path=${row.enteredPath} seat=${row.tableState && row.tableState.seat} won=${row.won} | raw=${g.standing.raw} capped=${g.capped} gatedComp=${g.gatedComputed} gatedEng=${g.gatedEngine} rd5=${g.rd5.armored}/${g.rd5.armed}/${g.rd5.tricks}/${g.rd5.veterans} w4faced=${g.w4faced} w4kills=${g.kills.w4kills} livingW4=${g.kills.livingW4killers} starv=${row.starvationDeaths} abstainTurns=${ab.w4abstainTurns || 0} abstainFights=${ab.w4abstainFights || 0} held=${ab.w4abstainHeldTurns || 0} driveoffs=${ab.w4abstainDrawDriveoffs || 0} pendingSeen=${ab.w4abstainPendingSeen || 0}`);
  }
  const agg = aggregate(rows);
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
  // Activation gate, from the strike counters + the logs (recomputed
  // again by the validator; this is the sweep's own first pass).
  let playerW4Strikes = 0, playerW4Kills = 0;
  for (const r of rows) {
    const sc = r.recorders && r.recorders.strikeCounter;
    if (sc) for (const s of (sc.strikes || [])) if (s.returned && (s.waves || []).indexOf(4) >= 0) playerW4Strikes++;
    const sid = r.gate && r.gate.scholarId;
    for (const e of ((r.gate && r.gate.waveKillLog) || [])) if (e.w === 4 && e.by === sid) playerW4Kills++;
  }
  const activationOk = playerW4Strikes === 0 && playerW4Kills === 0;
  const report = {
    label: 'sim-w4abstain-a villager-only wave-4 kill conversion census', seeds, days, rows, aggregate: agg,
    fate: { all: fateAll, dead: fateDead.length, alive: fateAll.filter(k => k.aliveAtEnd).length,
      totalKills: fateAll.reduce((t, k) => t + k.killCount, 0), fateComplete,
      dominantCause: causeKeys.length ? causeKeys[0] : null, causeCounts,
      medianPostKillSurvivalDead: medianSurvDead, survDead },
    courtship: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk },
    activation: { playerW4Strikes, playerW4Kills, activationOk },
    verdictRule: 'GO iff 8/8 rows AND activation gate passes (player w4 strikes 0 AND player w4 kills 0) AND >=95% of wave-4 arrivals classified AND villager kill/fight counts + identities + sense read reported. Substrate gate (courtship combined > 0 band-wide AND >= 6/8 seeds active) invalidates the run if failed — judged in evidence via scripts/test-w4abstain-a.js.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-w4abstain-a census ===');
  console.log(`  n=${agg.n} won=${agg.won} medD=${agg.medianDays} medGameD=${agg.medianGameDays} maxD=${agg.maxDays} natEver=${agg.nationalEver} natFinal=${agg.nationalFinal} table=${agg.table} entered=${agg.entered} fullSeat=${agg.fullSeat} lesserSeat=${agg.lesserSeat} wave4=${agg.wave4} wave5=${agg.wave5} maxArc=${agg.maxArc} starvTotal=${agg.starvationTotal} w4kills=${agg.w4killsTotal} w4killers=${agg.w4killersTotal} livingW4=${agg.livingW4killersTotal}`);
  console.log(`  fate kills=${report.fate.totalKills} killers=${fateAll.length} dead=${report.fate.dead} alive=${report.fate.alive} complete=${fateComplete} courtCombined=${courtTotals.combined} courtSeedsActive=${courtSeedsActive} substrateOk=${substrateOk}`);
  console.log(`  ACTIVATION playerW4Strikes=${playerW4Strikes} playerW4Kills=${playerW4Kills} activationOk=${activationOk}`);
  console.log(`  -> ${summaryPath}`);
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

(async () => {
  if (process.argv.indexOf('--detgate') >= 0) await detgateMode();
  else await sweepMode();
})().catch(e => { console.error('W4ABSTAIN SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
