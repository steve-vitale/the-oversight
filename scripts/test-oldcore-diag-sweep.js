#!/usr/bin/env node
// scripts/test-oldcore-diag-sweep.js — sim-oldcore-a pilot sweep
// (scale-onramp axis, 2026-10-25: old-core turnover audit; DIAG ONLY,
// zero src/js changes).
//
// PAIRING (exact, identical seeds — the landed spawnsrc pattern):
//   armed = tableseat-nowait wrapped with THREE recorders:
//     raftdraft-diag (RAFTDRAFT=1, raid draft census — reproduces the
//     poolpres control band for the neutrality comparison),
//     spawnsrc-diag (SPAWNSRC=1, spawn-source census, reused VERBATIM),
//     oldcore-diag (OLDCORE=1, birth-to-fate turnover census, new).
//   No baseline arm is run: the poolpres control band (deaths 234,
//   national-ever 7/8, wins 4/8, raids 85, raiders 361, poolpres-a /
//   poolpres-lever-b control, byte-identical) IS the control, and the
//   armed rows here must reproduce it exactly. The neutrality gate
//   below judges the armed rows against that published control.
// Substrate: seeds 73671-73678, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon — MEASUREMENT §10).
//
// Modes:
//   --one armed <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print gates.
//   --detgate : delegation-off proof on one seed (SEED env, default
//     73671): tableseat-nowait with NO recorder on-switch must match
//     a plain tableseat-nowait run on days/gameDays/ts, with no
//     recorder surface and no installed wraps.
// Exit 1 on gate failure in --summary mode (census incomplete,
// recorder errors > 0, or the neutrality band missed).
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
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Published poolpres control band (poolpres-a + poolpres-lever-b
// control, byte-identical): the neutrality comparator for this run.
const CONTROL = {
  raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4,
  medianDays: 135, poolTotal: 1494, poolW3: 107,
};
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a < 8; a++) {
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

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let raftStore = null, spawnStore = null, oldStore = null;
  if (pid === 'armed') {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.OLDCORE = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); oldStore = newOldStore();
    if (storeHolder) { storeHolder.raftStore = raftStore; storeHolder.spawnStore = spawnStore; storeHolder.oldStore = oldStore; }
  } else { delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE; }
  const base = pid === 'armed'
    ? withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'oldcore-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installOldcoreDiag(Game, oldStore); } catch (e) { /* install best-effort; daily hook retries */ }
  }
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
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
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-oldcore-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, sd = row.spawnsrc, od = row.oldcore;
  const line = rd.raids
    ? `raids=${rd.raids.length} raiders=${rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} calls=${rd.calls.length} field=${rd.fieldFights.length} raftErrs=${rd.diag.errs}`
    : `snapshot-only faced=${Object.keys(rd.faced || {}).length}`;
  const sline = sd ? `spawnRaids=${sd.raids.length} spawns=${sd.spawns.length} spawnErrs=${sd.diag.errs}` : 'spawnsrc=null';
  const oline = od ? `oldBirths=${od.births.length} oldRemovals=${od.removals.length} tbEnds=${od.tbEnds.length} snaps=${od.snapshots.length} finalPresent=${od.finalPresent.length} oldErrs=${od.diag.errs}` : 'oldcore=null';
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} ${line} ${sline} ${oline}`);
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
  const neutrality = {
    control: CONTROL,
    observed: {
      raids: raftRaids.length, raiders: raftRaiders, deaths: band.deathTotal,
      nationalEver: band.nationalEver, wins: band.won, medianDays: band.medianDays,
      poolTotal: raftPoolTotal, poolW3: raftPoolW3,
    },
    exact: raftRaids.length === CONTROL.raids && raftRaiders === CONTROL.raiders
      && band.deathTotal === CONTROL.deaths && band.nationalEver === CONTROL.nationalEver
      && band.won === CONTROL.wins && band.medianDays === CONTROL.medianDays,
  };
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.spawnsrc
    && Array.isArray(r.spawnsrc.raids) && Array.isArray(r.spawnsrc.spawns)
    && r.spawnsrc.diag.errs === 0 && Object.keys(r.spawnsrc.diag.overflow || {}).length === 0
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
    && r.oldcore && Array.isArray(r.oldcore.births) && Array.isArray(r.oldcore.removals)
    && r.oldcore.diag.errs === 0 && Object.keys(r.oldcore.diag.overflow || {}).length === 0);
  const report = {
    label: 'sim-oldcore-a pilot', seeds: SEEDS, days, rows, band,
    control: CONTROL, neutrality: neutrality, corpusOk: corpusOk,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-oldcore-a pilot ===');
  console.log(`  band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`  raftdraft census: raids=${raftRaids.length} raiders=${raftRaiders} poolTotal=${raftPoolTotal} poolW3=${raftPoolW3}`);
  console.log(`  NEUTRALITY vs poolpres control: ${neutrality.exact ? 'EXACT' : 'DEVIATED'} (control raids=${CONTROL.raids} raiders=${CONTROL.raiders} deaths=${CONTROL.deaths} natEver=${CONTROL.nationalEver} wins=${CONTROL.wins} medD=${CONTROL.medianDays})`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.OLDCORE;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), oldStore = newOldStore();
  const wrapped = withOldcoreDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'oldcore-diag', 'tableseat-nowait + old-core turnover census', oldStore);
  const { Game } = await loadGame({ seed, mode: 'oldcore-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._raftdraft || capturedCtx._spawnsrc || capturedCtx._oldcore));
  const wrapsInstalled = !!Game._raftdraftDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._oldcoreDiagInstalled;
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
if (require.main === module) main().catch(e => { console.error('OLDCORE-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, CONTROL, SEEDS };
