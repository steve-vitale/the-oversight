#!/usr/bin/env node
// scripts/test-surgeconfirm-diag-sweep.js — sim-surgeconfirm-a sweep
// (scale-onramp axis, 2026-10-27: CONFIRMING MEASUREMENT for the
// wave-4 arrival surge attribution from sim-arrivalsurge-a.
// DIAG ONLY, zero src/js changes, zero default flips.)
//
// TWO arms, same seeds (73671-73678), same substrate (tableseat-nowait,
// LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware), both with the
// SAME five recorders reused VERBATIM from current master:
//   raftdraft-diag, spawnsrc-diag, oldcore-diag, w5births-diag,
//   defwound-diag (see the prereg for sha256).
//   CONTROL = tableseat-nowait as-is (fallback-on).
//   FALLBACKOFF = tableseat-nowait-nofallback (competent with ONLY the
//     908ad0f12 + 8a7540534 fallback hunks reverted, as a separate
//     policy variant file; scripts/policies/competent.js untouched).
// New in THIS sweep only (sweep-side pure reads, no recorder): after
// base.daily delegates each day, read Game.villageStanding() (raw
// breakdown) and Game.waveCombatReadiness(4) (ready flag + bars) and
// record first-crossing days. The gated villageStandingTotal() is
// NEVER called here: it writes peak state and fires hold/release
// beats, so calling it daily would perturb the trajectory it
// measures. First day standing >= 100 = first day raw total >= 100;
// first day readiness-met = first day waveCombatReadiness(4).ready;
// the derived wave-4-open day is the first day BOTH hold.
// Final ctx counters (cookStaffed / fishStaffed / cookStaffFallback /
// fishStaffFallback) are read at row-build time from the shared run
// ctx. No new read draws RNG or writes state.
//
// Modes:
//   --one <pid> <seed> : run one armed seed, write its row.
//     pid = control | fallbackoff.
//   --summary : build summary.json from the rows on disk, print the
//     control-vs-repin comparison (report-only: a control difference
//     is BASE MOVEMENT, never a gate failure) and the within-run
//     control-vs-fallbackoff comparison with the promotion-rule
//     inputs. Exit 1 only on corpus errors / missing rows.
//   --probe : run control seed 73671 only (the prereg's premise probe;
//     same as --one control 73671, kept as a named mode).
// Exit 1 on gate failure in --summary mode (census incomplete,
// recorder errors > 0). A control-vs-repin difference never exits 1.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
// NOTE (sim-surgeconfirm-a, found the hard way): the nofallback variant
// file exports its policy under the ORIGINAL name (tableseatNowait) —
// only its require line differs (see the prereg's variant section).
// Destructuring a renamed export here yields undefined, and the diag
// wrappers then silently wrap nothing, running an idle policy for a
// whole arm (first fallbackoff run: cook=fish=0 everywhere, discarded
// uncommitted). The guard in runOne below now throws on a missing
// base instead of ever running idle again.
const { tableseatNowait: tableseatNowaitNofallback } = require('./policies/tableseat-nowait-nofallback');
const { copyKillLog } = require('./policies/vetkill-diag');
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

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Repin control table (sim-w4funnel-repin-a, armed == plain == 0615Z):
// report-only reference for CONTROL. A difference is BASE MOVEMENT.
const REPIN = {
  nationalEver: 7, nationalFinal: 5, table: 5, entered: 4, wins: 4,
  wave4: 5, wave5: 0, medianDays: 130, deaths: 284, starvation: 2,
  arrivals: 31, tileEntry: 28, scriptedTitan: 3,
};
function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* best-effort */ }
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}
function snapshotKillerStatus(Game, logEntries) {
  const out = { scholarId: null, roster: null, fallenIds: null, killers: [], errs: 0, error: null };
  try { out.scholarId = (typeof Game.villagerId !== 'undefined') ? Game.villagerId : null; } catch (e) { out.errs++; }
  let roster = null, fallen = null;
  try { roster = ((Game.state && Game.state.village && Game.state.village.roster) || null); } catch (e) { out.errs++; }
  try { fallen = ((Game.state && Game.state.village && Game.state.village.fallen) || null); } catch (e) { out.errs++; }
  if (Array.isArray(roster)) out.roster = roster.slice();
  else if (roster && typeof roster === 'object') out.roster = Object.keys(roster);
  else out.roster = null;
  if (Array.isArray(fallen)) {
    out.fallenIds = fallen.map(f => {
      if (!f || typeof f !== 'object') return String(f);
      return f.villagerId || f.vid || f.id || f.name || null;
    });
  } else out.fallenIds = null;
  const seen = new Set();
  for (const e of (logEntries || [])) {
    if (!e || (e.w | 0) !== 4) continue;
    const vid = (e.by === undefined) ? null : e.by;
    const key = vid === null ? '\0null' : String(vid);
    if (seen.has(key)) continue;
    seen.add(key);
    const k = { vid: vid, kills4: 0, firstDay: null, lastDay: null, vias: [] };
    out.killers.push(k);
  }
  for (const e of (logEntries || [])) {
    if (!e || (e.w | 0) !== 4) continue;
    const k = out.killers.find(x => (x.vid === null ? e.by == null : x.vid === e.by));
    if (!k) continue;
    k.kills4++;
    if (k.firstDay === null || (e.d | 0) < k.firstDay) k.firstDay = e.d | 0;
    if (k.lastDay === null || (e.d | 0) > k.lastDay) k.lastDay = e.d | 0;
    if (k.vias.indexOf(e.via || 'unknown') < 0) k.vias.push(e.via || 'unknown');
  }
  for (const k of out.killers) {
    k.isScholar = (k.vid !== null && k.vid === out.scholarId);
    k.inRoster = (out.roster !== null && k.vid !== null) ? out.roster.indexOf(k.vid) >= 0 : null;
    k.inFallen = (out.fallenIds !== null && k.vid !== null) ? out.fallenIds.indexOf(k.vid) >= 0 : null;
    k.vpDead = null; k.vpFound = null;
    if (k.vid !== null && !k.isScholar && typeof Game.vpOf === 'function') {
      try {
        const vp = Game.vpOf(k.vid);
        k.vpFound = !!vp;
        k.vpDead = vp ? !!vp.dead : null;
      } catch (e) { k.vpFound = null; k.vpDead = null; out.errs++; }
    }
    if (k.isScholar) k.gateLiving = true;
    else if (k.vpFound === true) k.gateLiving = !k.vpDead;
    else if (k.vpFound === false) k.gateLiving = false;
    else k.gateLiving = null;
  }
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.OLDCORE = '1'; process.env.W5BIRTHS = '1'; process.env.DEFWOUND = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), oldStore = newOldStore(), w5Store = newW5Store(), defStore = newDefStore();
  const tableseatBase = pid === 'fallbackoff' ? tableseatNowaitNofallback : tableseatNowait;
  if (!tableseatBase || typeof tableseatBase.daily !== 'function') throw new Error(`SURGEONFIRM BASE MISSING for pid=${pid}: refusing to run an idle policy`);
  const base = withW5birthsDiag(withDefwoundDiag(withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatBase, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'w5births-diag', 'tableseat-nowait + wave-5 birth-gate census', w5Store);
  const { Game } = await loadGame({ seed, mode: 'surgeconfirm-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
  try { installOldcoreDiag(Game, oldStore); } catch (e) { /* install best-effort; daily hook retries */ }
  try { installDefwoundDiag(Game, defStore); } catch (e) { /* install best-effort; daily hook retries */ }
  try { installW5birthsDiag(Game, w5Store); } catch (e) { /* install best-effort; daily hook retries */ }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const surge = {
    firstStanding100Day: null, firstReadinessDay: null,
    standingErrs: 0, readinessErrs: 0,
    endStanding: null, endReadiness: null,
  };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      if (base.daily) { try { base.daily(G, ctx); } catch (e) { /* delegate best-effort */ } }
      // PURE READS ONLY, after the day's acts. No gated-total call, no
      // beats, no writes: villageStanding + waveCombatReadiness read
      // live state and return fresh objects.
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) { /* hist best-effort */ }
      let st = null, rd = null;
      try { st = (typeof G.villageStanding === 'function') ? G.villageStanding() : null; } catch (e) { surge.standingErrs++; }
      try { rd = (typeof G.waveCombatReadiness === 'function') ? G.waveCombatReadiness(4) : null; } catch (e) { surge.readinessErrs++; }
      const day = ((G.state && G.state.scholar && G.state.scholar.day) | 0) || 0;
      if (st) {
        surge.endStanding = { total: st.total | 0, war: st.war | 0, diplomacy: st.diplomacy | 0, plenty: st.plenty | 0, feasts: st.feasts | 0 };
        if (surge.firstStanding100Day === null && (st.total | 0) >= 100) surge.firstStanding100Day = day;
      }
      if (rd) {
        surge.endReadiness = { ready: !!rd.ready, armored: rd.armored | 0, armed: rd.armed | 0, tricks: rd.tricks | 0, veterans: rd.veterans | 0, short: rd.short || [] };
        if (surge.firstReadinessDay === null && rd.ready) surge.firstReadinessDay = day;
      }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let finalPresent = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    finalPresent = list.map(m => ({ seq: (m._spawnSeq != null ? m._spawnSeq : null), src: (m._spawnsrc || null), type: m.id || null, wave: (m.wave != null ? m.wave : null), hp: (m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null }));
  } catch (e) { /* final present best-effort */ }
  if (oldStore) { try { snapshotOldcore(Game, oldStore); } catch (e) { /* final snapshot best-effort */ } }
  const killerStatus = snapshotKillerStatus(Game, log.entries);
  // Derived wave-4-open day: first day BOTH raw standing >= 100 and
  // readiness ready (gated total releases wave 4 exactly then, peak
  // and plenty-cap aside for t4). Null unless both crossed.
  surge.derivedOpenDay = (surge.firstStanding100Day !== null && surge.firstReadinessDay !== null)
    ? Math.max(surge.firstStanding100Day, surge.firstReadinessDay) : null;
  const ctxCounters = capturedCtx ? {
    cookStaffed: capturedCtx.cookStaffed | 0, fishStaffed: capturedCtx.fishStaffed | 0,
    cookStaffFallback: capturedCtx.cookStaffFallback | 0, fishStaffFallback: capturedCtx.fishStaffFallback | 0,
  } : { cookStaffed: null, fishStaffed: null, cookStaffFallback: null, fishStaffFallback: null };
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    surge, ctxCounters,
    raftdraft: {
      raids: raftStore.raids, calls: raftStore.calls, fieldFights: raftStore.fieldFights,
      faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
      logEntries: log.entries, logErrs: log.errs, logError: log.error,
      diag: { errs: raftStore.errs, errors: raftStore.errors, overflow: raftStore.overflow, installed: raftStore.installed },
    },
    spawnsrc: {
      raids: spawnStore.raids, spawns: spawnStore.spawns,
      diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed },
    },
    oldcore: {
      births: oldStore.births, removals: oldStore.removals, tbEnds: oldStore.tbEnds,
      snapshots: oldStore.snapshots, finalPresent: finalPresent,
      pendingLifts: oldStore.pendingLifts || [],
      diag: { errs: oldStore.errs, errors: oldStore.errors, overflow: oldStore.overflow, installed: oldStore.installed },
    },
    defwound: {
      resolveFights: defStore.resolveFights,
      diag: { errs: defStore.errs, errors: defStore.errors, overflow: defStore.overflow, installed: defStore.installed },
    },
    w5births: {
      days: w5Store.days,
      targetCounts: w5Store.targetCounts, targetCalls: w5Store.targetCalls, maxTop: w5Store.maxTop,
      firstTop5Day: w5Store.firstTop5Day, firstTarget5Day: w5Store.firstTarget5Day,
      targets: w5Store.targets,
      diag: { errs: w5Store.errs, errors: w5Store.errors, overflow: w5Store.overflow, installed: w5Store.installed },
    },
    killerStatus: killerStatus,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-surgeconfirm-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, sd = row.spawnsrc, od = row.oldcore, wd = row.w5births, dd = row.defwound;
  const w4spawns = sd.spawns.filter(s => (s.wave | 0) === 4).length;
  const w4log = rd.logEntries.filter(e => (e.w | 0) === 4).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} w4spawns=${w4spawns} w4log=${w4log} killers4=${row.killerStatus.killers.length} raids=${rd.raids.length} spawnErrs=${sd.diag.errs} oldErrs=${od.diag.errs} w5Errs=${wd.diag.errs} defErrs=${dd.diag.errs} surge: standing100d=${row.surge.firstStanding100Day} readinessd=${row.surge.firstReadinessDay} opend=${row.surge.derivedOpenDay} feasts=${(row.surge.endStanding || {}).feasts} ctx: cook=${row.ctxCounters.cookStaffed} fish=${row.ctxCounters.fishStaffed} cookFB=${row.ctxCounters.cookStaffFallback} fishFB=${row.ctxCounters.fishStaffFallback}`);
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const controlRows = [], offRows = [];
  for (const seed of SEEDS) {
    controlRows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-control.json`), 'utf8')));
    offRows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fallbackoff.json`), 'utf8')));
  }
  function bandOf(rs) {
    return {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: medianOf(rs.map(r => r.days)),
      nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
      nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      entered: rs.reduce((t, r) => t + r.entered, 0),
      wave3: rs.filter(r => (r.waveReach || 1) >= 3).length,
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    };
  }
  const band = bandOf(controlRows);
  const offBand = bandOf(offRows);
  const corpusOk = controlRows.length === SEEDS.length && offRows.length === SEEDS.length
    && [...controlRows, ...offRows].every(r => r.days > 0 && r.spawnsrc
      && Array.isArray(r.spawnsrc.raids) && Array.isArray(r.spawnsrc.spawns)
      && r.spawnsrc.diag.errs === 0 && Object.keys(r.spawnsrc.diag.overflow || {}).length === 0
      && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
      && r.oldcore && Array.isArray(r.oldcore.births) && Array.isArray(r.oldcore.removals)
      && r.oldcore.diag.errs === 0 && Object.keys(r.oldcore.diag.overflow || {}).length === 0
      && r.w5births && Array.isArray(r.w5births.days) && r.w5births.days.length > 0
      && r.w5births.diag.errs === 0 && Object.keys(r.w5births.diag.overflow || {}).length === 0
      && r.defwound && Array.isArray(r.defwound.resolveFights)
      && r.defwound.diag.errs === 0 && Object.values(r.defwound.diag.overflow || {}).every(v => (v | 0) === 0)
      && (r.surge.standingErrs | 0) === 0 && (r.surge.readinessErrs | 0) === 0);
  const controlVsRepin = {
    reference: REPIN, control: band,
    exact: band.nationalEver === REPIN.nationalEver && band.nationalFinal === REPIN.nationalFinal
      && band.table === REPIN.table && band.entered === REPIN.entered
      && band.won === REPIN.wins && band.wave4 === REPIN.wave4 && band.wave5 === REPIN.wave5
      && band.medianDays === REPIN.medianDays && band.deathTotal === REPIN.deaths
      && band.starvationTotal === REPIN.starvation,
    note: 'report-only: deviation is base movement, never a gate failure',
  };
  const report = {
    label: 'sim-surgeconfirm-a', seeds: SEEDS,
    controlRows, offRows, band, offBand, controlVsRepin, corpusOk,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-surgeconfirm-a summary ===');
  console.log(`  control band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`  fallbackoff band: n=${offBand.n} won=${offBand.won} medD=${offBand.medianDays} natEver=${offBand.nationalEver} natFinal=${offBand.nationalFinal} table=${offBand.table} entered=${offBand.entered} wave3=${offBand.wave3} wave4=${offBand.wave4} wave5=${offBand.wave5} starv=${offBand.starvationTotal} deaths=${offBand.deathTotal}`);
  console.log(`  CONTROL-vs-REPIN (report-only): ${controlVsRepin.exact ? 'EXACT' : 'MOVED'}`);
  for (const r of controlRows) console.log(`  control ${r.seed}: days=${r.days} wave=${r.waveReach} won=${r.won} standing100d=${r.surge.firstStanding100Day} readinessd=${r.surge.firstReadinessDay} opend=${r.surge.derivedOpenDay} feasts=${(r.surge.endStanding || {}).feasts} cook=${r.ctxCounters.cookStaffed} fish=${r.ctxCounters.fishStaffed} cookFB=${r.ctxCounters.cookStaffFallback} fishFB=${r.ctxCounters.fishStaffFallback}`);
  for (const r of offRows) console.log(`  fallbackoff ${r.seed}: days=${r.days} wave=${r.waveReach} won=${r.won} standing100d=${r.surge.firstStanding100Day} readinessd=${r.surge.firstReadinessDay} opend=${r.surge.derivedOpenDay} feasts=${(r.surge.endStanding || {}).feasts} cook=${r.ctxCounters.cookStaffed} fish=${r.ctxCounters.fishStaffed} cookFB=${r.ctxCounters.cookStaffFallback} fishFB=${r.ctxCounters.fishStaffFallback}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--probe')) return oneMode('control', '73671');
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  console.error('usage: --one <pid> <seed> | --probe | --summary');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('SURGEONFIRM-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, REPIN, SEEDS };
