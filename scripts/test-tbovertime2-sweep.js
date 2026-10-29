#!/usr/bin/env node
// scripts/test-w4convert-sweep.js — sim-w4convert-a wave-4 encounter-to-kill conversion census sweep
// COPY of scripts/test-w4damage-sweep.js, differing ONLY in corpus dir,
// labels, loadGame mode label, and ONE sweep-side addition: the runOne
// daily wrapper records a read-only scholar history ({day, scholarId}
// from the Game.villagerId property read, once per day) so killer
// classification survives scholar succession. The original is untouched.
// (scale-onramp axis, 2026-10-28: the wave-4 inter-fight damage gap —
// five world-HP drops with no recorded fight row between them, plus a
// same-day 65-HP wobble, from sim-w4lethality-rebase. DIAG ONLY,
// zero src/js changes).
//
// COPY of scripts/test-w4lethality-rebase-sweep.js, differing ONLY in:
// corpus dir (evidence/2026-10-29/perseed-tbovertime2-a), labels, the
// loadGame mode label, and the added w4damage layer in the
// composition + detgate composition (scripts/policies/w4damage-diag.js:
// fieldFight choke-point rows with caller classification, per-object
// havenRaidTick toll rows, daily world-HP snapshots). The original
// is untouched. PAIRING (exact, identical seeds — the landed
// oldcore/w5chain pattern, composed): armed = tableseat-nowait
// wrapped with the rebase recorder stack PLUS w4damage-diag,
// reused VERBATIM (never edited).
// Substrate: seeds 75101-75108, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon — MEASUREMENT §10).
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one armed <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print gates.
//   --detgate : delegation-off proof on one seed (SEED env, default
//     75101): tableseat-nowait with NO recorder on-switch must match
//     a plain tableseat-nowait run on days/gameDays/ts, with no
//     recorder surface and no installed wraps.
// Exit 1 on gate failure in --summary mode (census incomplete,
// recorder errors > 0, or the neutrality band missed — a missed
// band is reported as a FAILED gate, and the evidence must then
// explain it before any verdict is judged).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
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
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newDefStore, installDefwoundDiag, withDefwoundDiag,
} = require('./policies/defwound-diag');
const {
  newStore: newTbdmgStore, installTbdmgDiag, withTbdmgDiag,
} = require('./policies/tbdmg-rebase-diag');
const {
  newStore: newW4dmgStore, installW4damageDiag, withW4damageDiag,
} = require('./policies/w4damage-diag');
const {
  newStore: newFcStore, installFighterconstructDiag, withFighterconstructDiag,
} = require('./policies/fighterconstruct-diag');
const {
  newStore: newTbovStore, installTbovertimeDiag, withTbovertimeDiag,
} = require('./policies/tbovertime-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Published control band (poolpres-a + spawnsrc-a + w5chain-a, byte-identical):
const CONTROL = {
  raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4,
  medianDays: 135, poolTotal: 1494, poolW3: 107, wave4: 6, wave5: 0,
};
function medianOf(arr) {
  if (!arr.length) return 0;
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
// Killer-status snapshot (sweep-side pure reads only): for each
// distinct wave-4 kill-log killer, the gate's own living test —
// vid == Game.villagerId (scholar, living by definition), else
// vpOf(vid) exists and !vp.dead — plus roster/fallen membership
// for the analyzer's divergence explanation. A vid the gate
// cannot see (null, or vpOf missing) is recorded as such, never
// guessed living or dead.
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
    // Gate's own living test, computed here so the analyzer never
    // re-implements it: scholar => living; else vp found & !dead.
    // 'player' as a vid is NOT the scholar unless villagerId is
    // literally 'player' — that mismatch, if it ever occurs, is a
    // not-counted killer by construction, and is reported as such.
    if (k.isScholar) k.gateLiving = true;
    else if (k.vpFound === true) k.gateLiving = !k.vpDead;
    else if (k.vpFound === false) k.gateLiving = false;
    else k.gateLiving = null;
  }
  return out;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  delete process.env.TABLESEATNOWAIT; // tbovertime2: NO seat drive — village waits, overtime clock runs
  let raftStore = null, spawnStore = null, oldStore = null, w5Store = null, defStore = null, nwkStore = null, tbdmgStore = null, w4dmgStore = null, fcStore = null, tbovStore = null;
  if (pid === 'armed') {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.OLDCORE = '1'; process.env.W5BIRTHS = '1'; process.env.DEFWOUND = '1'; process.env.NONWORLDKILL = '1'; process.env.TBDMG = '1'; process.env.W4DMG = '1'; process.env.FIGHTERCONSTRUCT = '1'; process.env.TBOVERTIME = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); oldStore = newOldStore(); w5Store = newW5Store(); defStore = newDefStore(); nwkStore = newNwkStore(); tbdmgStore = newTbdmgStore(); w4dmgStore = newW4dmgStore(); fcStore = newFcStore(); tbovStore = newTbovStore();
    if (storeHolder) { storeHolder.raftStore = raftStore; storeHolder.spawnStore = spawnStore; storeHolder.oldStore = oldStore; storeHolder.w5Store = w5Store; storeHolder.defStore = defStore; storeHolder.nwkStore = nwkStore; storeHolder.tbdmgStore = tbdmgStore; storeHolder.w4dmgStore = w4dmgStore; storeHolder.fcStore = fcStore; storeHolder.tbovStore = tbovStore; }
  } else { delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE; delete process.env.W5BIRTHS; delete process.env.DEFWOUND; delete process.env.NONWORLDKILL; delete process.env.TBDMG; delete process.env.W4DMG; delete process.env.FIGHTERCONSTRUCT; delete process.env.TBOVERTIME; }
  const base = pid === 'armed'
    ? withTbovertimeDiag(withFighterconstructDiag(withW4damageDiag(withTbdmgDiag(withNonworldkillDiag(withW5birthsDiag(withDefwoundDiag(withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'w5births-diag', 'tableseat-nowait + wave-5 birth-gate census', w5Store), 'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore), 'tbdmg-rebase-diag', 'tableseat-nowait + TB/field damage census', tbdmgStore), 'w4damage-diag', 'tableseat-nowait + wave-4 encounter-to-kill conversion census', w4dmgStore), 'fighterconstruct-diag', 'tableseat-nowait + TB fighter-construction census', fcStore), 'tbovertime-diag', 'tableseat-nowait + TB overtime-tier census', tbovStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'tbovertime2-a-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installOldcoreDiag(Game, oldStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installDefwoundDiag(Game, defStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installW5birthsDiag(Game, w5Store); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installTbdmgDiag(Game, tbdmgStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installW4damageDiag(Game, w4dmgStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installFighterconstructDiag(Game, fcStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installTbovertimeDiag(Game, tbovStore); } catch (e) { /* install best-effort; daily hook retries */ }
  }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const scholarHistory = [];
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const day = ((G.state || {}).scholar || {}).day || 0;
        const sid = (typeof G.villagerId !== 'undefined') ? G.villagerId : null;
        const lastSch = scholarHistory.length ? scholarHistory[scholarHistory.length - 1] : null;
        if (!lastSch || lastSch.scholarId !== sid) scholarHistory.push({ day: day, scholarId: sid });
      } catch (e) { /* scholar-history read-only best-effort */ }
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) { /* hist best-effort */ }
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort */ } }
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
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) { /* tableState best-effort */ }
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
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
    raftdraft: raftStore ? {
      raids: raftStore.raids, calls: raftStore.calls, fieldFights: raftStore.fieldFights,
      faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
      logEntries: log.entries, logErrs: log.errs, logError: log.error,
      diag: { errs: raftStore.errs, errors: raftStore.errors, overflow: raftStore.overflow, installed: raftStore.installed },
    } : { faced: faced.faced, facedErrs: faced.errs, facedError: faced.error, logEntries: log.entries, logErrs: log.errs, logError: log.error, analysis: null, note: 'snapshot-only' },
    spawnsrc: spawnStore ? {
      raids: spawnStore.raids, spawns: spawnStore.spawns,
      diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed },
    } : null,
    oldcore: oldStore ? {
      births: oldStore.births, removals: oldStore.removals, tbEnds: oldStore.tbEnds,
      snapshots: oldStore.snapshots, finalPresent: finalPresent,
      pendingLifts: oldStore.pendingLifts || [],
      diag: { errs: oldStore.errs, errors: oldStore.errors, overflow: oldStore.overflow, installed: oldStore.installed },
    } : null,
    defwound: defStore ? {
      resolveFights: defStore.resolveFights,
      diag: { errs: defStore.errs, errors: defStore.errors, overflow: defStore.overflow, installed: defStore.installed },
    } : null,
    w5births: w5Store ? {
      days: w5Store.days,
      targetCounts: w5Store.targetCounts, targetCalls: w5Store.targetCalls, maxTop: w5Store.maxTop,
      firstTop5Day: w5Store.firstTop5Day, firstTarget5Day: w5Store.firstTarget5Day,
      targets: w5Store.targets,
      diag: { errs: w5Store.errs, errors: w5Store.errors, overflow: w5Store.overflow, installed: w5Store.installed },
    } : null,
    killerStatus: killerStatus,
    scholarHistory: scholarHistory,
    tableState: tableState,
    courtship: courtship,
    nonworldkill: nwkStore ? {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
    } : null,
    tbdmg: tbdmgStore ? {
      tbEnds: tbdmgStore.tbEnds, fieldSupp: tbdmgStore.fieldSupp,
      diag: { errs: tbdmgStore.errs, errors: tbdmgStore.errors, overflow: tbdmgStore.overflow, installed: tbdmgStore.installed },
    } : null,
    w4damage: w4dmgStore ? {
      fieldFights: w4dmgStore.fieldFights, raidTicks: w4dmgStore.raidTicks, snapshots: w4dmgStore.snapshots,
      diag: { errs: w4dmgStore.errs, errors: w4dmgStore.errors, overflow: w4dmgStore.overflow, installed: w4dmgStore.installed },
    } : null,
    fighterconstruct: fcStore ? {
      constructions: fcStore.constructions, openingDamage: fcStore.openingDamage, postStarts: fcStore.postStarts,
      diag: { errs: fcStore.errs, errors: fcStore.errors, overflow: fcStore.overflow, installed: fcStore.installed },
    } : null,
    tbovertime: tbovStore ? {
      starts: tbovStore.starts, ends: tbovStore.ends,
      diag: { errs: tbovStore.errs, errors: tbovStore.errors, overflow: tbovStore.overflow, installed: tbovStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-tbovertime2-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, sd = row.spawnsrc, od = row.oldcore, wd = row.w5births, dd = row.defwound, nk = row.nonworldkill;
  const line = rd.raids
    ? `raids=${rd.raids.length} raiders=${rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} calls=${rd.calls.length} field=${rd.fieldFights.length} raftErrs=${rd.diag.errs}`
    : `snapshot-only faced=${Object.keys(rd.faced || {}).length}`;
  const sline = sd ? `spawnRaids=${sd.raids.length} spawns=${sd.spawns.length} spawnErrs=${sd.diag.errs}` : 'spawnsrc=null';
  const oline = od ? `oldBirths=${od.births.length} oldRemovals=${od.removals.length} tbEnds=${od.tbEnds.length} snaps=${od.snapshots.length} finalPresent=${od.finalPresent.length} oldErrs=${od.diag.errs}` : 'oldcore=null';
  const wline = wd ? `w5days=${wd.days.length} targetCalls=${wd.targetCalls} maxTop=${wd.maxTop} w5Errs=${wd.diag.errs}` : 'w5births=null';
  const dline = dd ? `resolve=${dd.resolveFights.length} defErrs=${dd.diag.errs}` : 'defwound=null';
  const nkline = nk ? `nwkStarts=${nk.starts.length} nwkEnds=${nk.ends.length} nwkErrs=${nk.diag.errs}` : 'nonworldkill=null';
  const tb = row.tbdmg;
  const tbline = tb ? `tbEnds=${tb.tbEnds.length} fieldSupp=${tb.fieldSupp.length} tbErrs=${tb.diag.errs}` : 'tbdmg=null';
  const w4 = row.w4damage;
  const wdline = w4 ? `w4ff=${w4.fieldFights.length} w4raidTicks=${w4.raidTicks.length} w4snaps=${w4.snapshots.length} w4Errs=${w4.diag.errs}` : 'w4damage=null';
  const fc = row.fighterconstruct;
  const fcline = fc ? `fcConstr=${fc.constructions.length} fcDmg=${fc.openingDamage.length} fcPost=${fc.postStarts.length} fcErrs=${fc.diag.errs}` : 'fighterconstruct=null';
  const tbov = row.tbovertime;
  const tbovline = tbov ? `tbovStarts=${tbov.starts.length} tbovEnds=${tbov.ends.length} tbovErrs=${tbov.diag.errs}` : 'tbovertime=null';
  const w4spawns = sd ? sd.spawns.filter(s => (s.wave | 0) === 4).length : 0;
  const w4log = rd.logEntries.filter(e => (e.w | 0) === 4).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} w4spawns=${w4spawns} w4log=${w4log} killers4=${row.killerStatus.killers.length} courtCombined=${row.courtship ? row.courtship.combined : 'null'} seat=${row.tableState ? row.tableState.seat : 'null'} ${line} ${sline} ${oline} ${wline} ${dline} ${nkline} ${tbline} ${wdline} ${fcline} ${tbovline}`);
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-armed.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: rows.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const raftRaids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raftRaids.push(Object.assign({ seed: r.seed }, x));
  const raftRaiders = raftRaids.reduce((t, r) => t + (r.raiders || []).length, 0);
  const raftPoolTotal = raftRaids.reduce((t, r) => t + (r.livingN || 0), 0);
  const raftPoolW3 = raftRaids.reduce((t, r) => t + (r.w3plusPool || []).length, 0);
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.spawnsrc
    && Array.isArray(r.spawnsrc.raids) && Array.isArray(r.spawnsrc.spawns)
    && r.spawnsrc.diag.errs === 0 && Object.values(r.spawnsrc.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
    && r.oldcore && Array.isArray(r.oldcore.births) && Array.isArray(r.oldcore.removals)
    && r.oldcore.diag.errs === 0 && Object.values(r.oldcore.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.w5births && Array.isArray(r.w5births.days) && r.w5births.days.length > 0
    && r.w5births.diag.errs === 0 && Object.values(r.w5births.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.defwound && Array.isArray(r.defwound.resolveFights)
    && r.defwound.diag.errs === 0 && Object.values(r.defwound.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.nonworldkill && Array.isArray(r.nonworldkill.starts) && Array.isArray(r.nonworldkill.ends)
    && r.nonworldkill.diag.errs === 0 && Object.values(r.nonworldkill.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.tbdmg && Array.isArray(r.tbdmg.tbEnds) && Array.isArray(r.tbdmg.fieldSupp)
    && r.tbdmg.diag.errs === 0 && Object.values(r.tbdmg.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.w4damage && Array.isArray(r.w4damage.fieldFights) && Array.isArray(r.w4damage.raidTicks) && Array.isArray(r.w4damage.snapshots)
    && r.w4damage.diag.errs === 0 && Object.values(r.w4damage.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.fighterconstruct && Array.isArray(r.fighterconstruct.constructions) && Array.isArray(r.fighterconstruct.openingDamage) && Array.isArray(r.fighterconstruct.postStarts)
    && r.fighterconstruct.diag.errs === 0 && Object.values(r.fighterconstruct.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.tbovertime && Array.isArray(r.tbovertime.starts) && Array.isArray(r.tbovertime.ends)
    && r.tbovertime.diag.errs === 0 && Object.values(r.tbovertime.diag.overflow || {}).every(v => (v | 0) === 0));
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  const report = {
    label: 'sim-tbovertime2-a TB tier-2+ overtime decomposition', seeds: SEEDS, days, rows, band,
    corpusOk: corpusOk, courtship: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk }, seats,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-tbovertime-a decomposition ===');
  console.log(`  band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`  raftdraft census: raids=${raftRaids.length} raiders=${raftRaiders} poolTotal=${raftPoolTotal} poolW3=${raftPoolW3}`);
  console.log(`  courtship combined=${courtTotals.combined} seedsActive=${courtSeedsActive} substrateOk=${substrateOk} seats=${JSON.stringify(seats)}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '75101', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE; delete process.env.W5BIRTHS; delete process.env.DEFWOUND; delete process.env.NONWORLDKILL; delete process.env.TBDMG; delete process.env.W4DMG; delete process.env.FIGHTERCONSTRUCT; delete process.env.TBOVERTIME;
  process.env.LEANLINKRESCUE = '1'; delete process.env.TABLESEATNOWAIT; // tbovertime2: seat legs off
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), oldStore = newOldStore(), w5Store = newW5Store(), defStore = newDefStore(), nwkStore = newNwkStore(), tbdmgStore = newTbdmgStore(), w4dmgStore = newW4dmgStore(), fcStore = newFcStore(), tbovStore = newTbovStore();
  // Wrapped but OFF: all recorders' layer guards must delegate
  // byte-identically (no wraps installed, no ctx surface).
  const wrapped = withTbovertimeDiag(withFighterconstructDiag(withW4damageDiag(withTbdmgDiag(withNonworldkillDiag(withW5birthsDiag(withDefwoundDiag(withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'w5births-diag', 'tableseat-nowait + wave-5 birth-gate census', w5Store), 'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore), 'tbdmg-rebase-diag', 'tableseat-nowait + TB/field damage census', tbdmgStore), 'w4damage-diag', 'tableseat-nowait + wave-4 encounter-to-kill conversion census', w4dmgStore), 'fighterconstruct-diag', 'tableseat-nowait + TB fighter-construction census', fcStore), 'tbovertime-diag', 'tableseat-nowait + TB overtime-tier census', tbovStore);
  const { Game } = await loadGame({ seed, mode: 'tbovertime2-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  const postSetupWorld = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters().length : null;
  let capturedCtx = null;
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return wrapped.daily(G, ctx); } catch (e) { /* delegate best-effort */ }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._raftdraft || capturedCtx._spawnsrc || capturedCtx._oldcore || capturedCtx._w5births || capturedCtx._defwound || capturedCtx._nonworldkill || capturedCtx._tbdmg || capturedCtx._w4damage || capturedCtx._fighterconstruct || capturedCtx._tbovertime));
  const wrapsInstalled = !!Game._raftdraftDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._oldcoreDiagInstalled || !!Game._w5birthsDiagInstalled || !!Game._defwoundDiagInstalled || !!Game._nonworldkillDiagInstalled || !!Game._tbdmgDiagInstalled || !!Game._w4damageDiagInstalled || !!Game._fighterconstructDiagInstalled || !!Game._tbovertimeDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} postSetupWorld=${postSetupWorld} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --one <pid> <seed> | --summary | --detgate');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('TBOVERTIME SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, CONTROL, SEEDS };
