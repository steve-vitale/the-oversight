#!/usr/bin/env node
// scripts/test-echodraft-a-sweep.js — sim-echodraft-a sweep
// (scale-onramp axis, 2026-10-25: raid-draft echo trace; DIAG ONLY,
// zero src/js changes).
//
// PAIRING (exact, identical seeds — the sim-defwound-a composition,
// plus the new recorder):
//   armed = tableseat-nowait wrapped with FOUR recorders:
//     raftdraft-diag (raid draft census, cross-check),
//     spawnsrc-diag (instance tags, reused VERBATIM),
//     defwound-diag (resolve rows with raid flag + instance seq +
//       start/end HP fractions, reused VERBATIM),
//     echodraft-diag (pre-draft pool snapshot with seq + distance +
//       wound state, new).
//   No baseline arm is run in the sweep: the published 1815 control
//   band IS the control, and the armed rows here must reproduce it
//   exactly (neutrality proof).
// Substrate: seeds 73671-73678, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon).
//
// Modes:
//   --one armed <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the trace numbers + neutrality gates. Exit 1 on gate failure.
//   --detgate : delegation-off proof on one seed (SEED env, default
//     73671): tableseat-nowait with NO recorder on-switch must match
//     a plain tableseat-nowait run on days/gameDays/ts, with no
//     recorder surface and no installed wraps.
//   --sense <seed> : print (and write) the plain-words story of the
//     most-drafted wounded entity on that seed's trajectory.
// Exit 1 on gate failure in --summary/--detgate modes.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const {
  newStore: newRaftStore, installRaftdraftDiag, withRaftdraftDiag,
} = require('./policies/raftdraft-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newDefStore, installDefwoundDiag, withDefwoundDiag,
} = require('./policies/defwound-diag');
const {
  newStore: newEchoStore, installEchodraftDiag, withEchodraftDiag,
} = require('./policies/echodraft-diag');
const { analyzeEcho } = require('./test-echodraft-a');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Published 1815 control band (sim-scale-onramp-round-1815.md), also
// reproduced exactly by sim-defwound-a Stage 1.
const CONTROL = {
  raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4,
  medianDays: 135, poolTotal: 1494, poolW3: 107,
};
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* best-effort */ } }
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

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let raftStore = null, spawnStore = null, defStore = null, echoStore = null;
  if (pid === 'armed') {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.DEFWOUND = '1'; process.env.ECHODRAFT = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); defStore = newDefStore(); echoStore = newEchoStore();
  } else { delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.DEFWOUND; delete process.env.ECHODRAFT; }
  const base = pid === 'armed'
    ? withEchodraftDiag(withDefwoundDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'echodraft-diag', 'tableseat-nowait + raid draft trace', echoStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'echodraft-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installDefwoundDiag(Game, defStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installEchodraftDiag(Game, echoStore); } catch (e) { /* install best-effort; daily hook retries */ }
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
  const deaths = result.samples.deaths || [];
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
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    raftdraft: raftStore ? {
      raids: raftStore.raids, calls: raftStore.calls,
      diag: { errs: raftStore.errs, errors: raftStore.errors, overflow: raftStore.overflow, installed: raftStore.installed },
    } : null,
    spawnsrc: spawnStore ? {
      raids: spawnStore.raids,
      diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed },
    } : null,
    defwound: defStore ? {
      resolveFights: defStore.resolveFights,
      diag: { errs: defStore.errs, errors: defStore.errors, overflow: defStore.overflow, installed: defStore.installed },
    } : null,
    echodraft: echoStore ? {
      raids: echoStore.raids,
      diag: { errs: echoStore.errs, errors: echoStore.errors, overflow: echoStore.overflow, installed: echoStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-echodraft-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, dd = row.defwound, ed = row.echodraft;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} won=${row.won} deaths=${row.deathTotal} raids=${rd ? rd.raids.length : 'n/a'} raiders=${rd ? rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0) : 'n/a'} echoRaids=${ed ? ed.raids.length : 'n/a'} defRows=${dd ? dd.resolveFights.length : 'n/a'} errs=raft${rd ? rd.diag.errs : '?'}:spawn${row.spawnsrc ? row.spawnsrc.diag.errs : '?'}:def${dd ? dd.diag.errs : '?'}:echo${ed ? ed.diag.errs : '?'}`);
}

function loadRows(evidDir) {
  return SEEDS.map(seed => JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')));
}

function summarizeRows(rows) {
  const perSeed = rows.map(r => ({
    seed: r.seed, analysis: analyzeEcho((r.echodraft && r.echodraft.raids) || [], (r.defwound && r.defwound.resolveFights) || []),
  }));
  const sum = (f) => perSeed.reduce((t, s) => t + f(s.analysis), 0);
  const pooledDist = (get) => {
    const all = [];
    for (const s of perSeed) for (const d of get(s.analysis)) all.push(d);
    return all;
  };
  // Pooled medians need raw distances: recompute from per-seed rows.
  const allDrafted = [], allPool = [];
  const draftedByClass = {}, poolByClass = {}, draftedByWound = { below: [], above: [] };
  const draftedByPrev = { 'previously-drafted': [], 'never-drafted': [] };
  let spearX = [], spearY = [], qObs = 0, qExp = 0;
  for (const r of rows) {
    const a = perSeed.find(s => s.seed === r.seed).analysis;
    void a;
    for (const raid of ((r.echodraft && r.echodraft.raids) || [])) {
      for (const p of (raid.pool || [])) {
        if (p.dist != null) { allPool.push(p.dist); spearX.push(p.dist); spearY.push(p.drafted ? 1 : 0); }
      }
      for (const d of (raid.drafted || [])) if (d.dist != null) allDrafted.push(d.dist);
    }
  }
  // Class/prev/wound pooled medians come from per-seed analysis
  // summaries only when the analyzer kept raw lists — it does not,
  // so recompute them here from the rows with the same pure logic.
  const { priorClassOf, medianOf, meanOf, spearman } = require('./test-echodraft-a');
  const draftedSeen = {};
  for (const r of rows) {
    const defRows = (r.defwound && r.defwound.resolveFights) || [];
    const seen = new Set();
    for (const raid of ((r.echodraft && r.echodraft.raids) || [])) {
      const q = Math.ceil((raid.livingN || (raid.pool || []).length) / 4);
      qExp += (raid.raidN * q) / Math.max(1, (raid.livingN || (raid.pool || []).length));
      for (const p of (raid.pool || [])) if (p.drafted && p.rank < q) qObs++;
      for (const d of (raid.drafted || [])) {
        const cls = priorClassOf(d.seq, raid.day, defRows);
        const prev = (d.seq != null && seen.has(d.seq)) ? 'previously-drafted' : 'never-drafted';
        if (d.dist != null) {
          if (!draftedByClass[cls]) draftedByClass[cls] = [];
          draftedByClass[cls].push(d.dist);
          draftedByPrev[prev].push(d.dist);
          if (d.belowLine === true) draftedByWound.below.push(d.dist);
          else if (d.belowLine === false) draftedByWound.above.push(d.dist);
        }
        if (d.seq != null) seen.add(d.seq);
      }
    }
    void draftedSeen;
  }
  const summ = (arr) => ({ n: arr.length, median: medianOf(arr), mean: meanOf(arr), dist0Share: arr.length ? arr.filter(d => d === 0).length / arr.length : null });
  const classSumm = (map) => { const o = {}; for (const k of Object.keys(map)) o[k] = summ(map[k]); return o; };
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
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const raftRaids = [];
  for (const r of rows) for (const x of (r.raftdraft.raids || [])) raftRaids.push(Object.assign({ seed: r.seed }, x));
  const raftRaiders = raftRaids.reduce((t, r) => t + (r.raiders || []).length, 0);
  const raftPoolTotal = raftRaids.reduce((t, r) => t + (r.livingN || 0), 0);
  const raftPoolW3 = raftRaids.reduce((t, r) => t + (r.w3plusPool || []).length, 0);
  const echoRaids = sum(a => a.raids);
  const echoDrafted = sum(a => a.totalDrafted);
  const echoPool = sum(a => a.totalPool);
  const constructionMismatches = sum(a => a.constructionMismatches);
  const untaggedDrafted = sum(a => a.untaggedDrafted);
  const untaggedPool = sum(a => a.untaggedPool);
  const laterBySource = {};
  for (const s of perSeed) for (const k of Object.keys(s.analysis.laterDraftsBySource)) {
    if (!laterBySource[k]) laterBySource[k] = { events: 0, laterDrafts: 0 };
    laterBySource[k].events += s.analysis.laterDraftsBySource[k].events;
    laterBySource[k].laterDrafts += s.analysis.laterDraftsBySource[k].laterDrafts;
  }
  const laterPerEntity = {};
  for (const s of perSeed) for (const k of Object.keys(s.analysis.laterDraftsPerEntity)) {
    if (!laterPerEntity[k]) laterPerEntity[k] = { entities: 0, drafts: 0 };
    laterPerEntity[k].entities += s.analysis.laterDraftsPerEntity[k].entities;
    laterPerEntity[k].drafts += s.analysis.laterDraftsPerEntity[k].drafts;
  }
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
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
    && r.spawnsrc && Array.isArray(r.spawnsrc.raids) && r.spawnsrc.diag.errs === 0
    && r.defwound && Array.isArray(r.defwound.resolveFights) && r.defwound.diag.errs === 0
    && Object.values(r.defwound.diag.overflow || {}).every(v => v === 0)
    && r.echodraft && Array.isArray(r.echodraft.raids) && r.echodraft.diag.errs === 0
    && Object.values(r.echodraft.diag.overflow || {}).every(v => v === 0))
    && echoRaids === raftRaids.length;
  const pooled = {
    draftedDist: summ(allDrafted), poolDist: summ(allPool),
    draftedDistByClass: classSumm(draftedByClass),
    draftedDistByWound: { below: summ(draftedByWound.below), above: summ(draftedByWound.above) },
    draftedDistByPrev: { 'previously-drafted': summ(draftedByPrev['previously-drafted']), 'never-drafted': summ(draftedByPrev['never-drafted']) },
    draftedCountByClass: perSeed.reduce((m, s) => { for (const k of Object.keys(s.analysis.draftedCountByClass)) m[k] = (m[k] || 0) + s.analysis.draftedCountByClass[k]; return m; }, {}),
    spearmanDistDrafted: spearman(spearX, spearY), spearmanN: spearX.length,
    quartile: { observed: qObs, expected: qExp },
    constructionMismatches: constructionMismatches, untaggedDrafted: untaggedDrafted, untaggedPool: untaggedPool,
    echoRaids: echoRaids, echoDrafted: echoDrafted, echoPool: echoPool,
    raftRaids: raftRaids.length, raftRaiders: raftRaiders,
    laterDraftsBySource: laterBySource, laterDraftsPerEntity: laterPerEntity,
  };
  return { band: band, neutrality: neutrality, corpusOk: corpusOk, perSeed: perSeed, pooled: pooled };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = loadRows(evidDir);
  const { band, neutrality, corpusOk, perSeed, pooled } = summarizeRows(rows);
  const report = {
    label: 'sim-echodraft-a pilot', seeds: SEEDS, band: band,
    control: CONTROL, neutrality: neutrality, corpusOk: corpusOk,
    perSeed: perSeed.map(s => ({ seed: s.seed, analysis: s.analysis })),
    pooled: pooled, generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-echodraft-a pilot ===');
  console.log(`  band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} deaths=${band.deathTotal}`);
  console.log(`  raftdraft census: raids=${pooled.raftRaids} raiders=${pooled.raftRaiders} poolTotal=${neutrality.observed.poolTotal} poolW3=${neutrality.observed.poolW3}`);
  console.log(`  NEUTRALITY vs 1815 control: ${neutrality.exact ? 'EXACT' : 'DEVIATED'}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} (echoRaids=${pooled.echoRaids} vs raftRaids=${pooled.raftRaids}) -> ${summaryPath}`);
  console.log(`  DRAFT: raids=${pooled.echoRaids} drafted=${pooled.echoDrafted} poolEntries=${pooled.echoPool} untaggedDrafted=${pooled.untaggedDrafted} untaggedPool=${pooled.untaggedPool} constructionMismatches=${pooled.constructionMismatches}`);
  console.log(`  DIST: drafted=${JSON.stringify(pooled.draftedDist)} pool=${JSON.stringify(pooled.poolDist)}`);
  console.log(`  DIST BY WOUND-AT-DRAFT: below=${JSON.stringify(pooled.draftedDistByWound.below)} above=${JSON.stringify(pooled.draftedDistByWound.above)}`);
  console.log(`  DIST BY PRIOR CLASS (drafted): ${JSON.stringify(pooled.draftedDistByClass)}`);
  console.log(`  COUNT BY PRIOR CLASS (drafted): ${JSON.stringify(pooled.draftedCountByClass)}`);
  console.log(`  DIST BY PREV-DRAFT: ${JSON.stringify(pooled.draftedDistByPrev)}`);
  console.log(`  NEAREST-FIRST: spearman=${pooled.spearmanDistDrafted != null ? pooled.spearmanDistDrafted.toFixed(3) : 'n/a'} (n=${pooled.spearmanN}) quartile observed=${pooled.quartile.observed} expected-random=${pooled.quartile.expected.toFixed(1)}`);
  console.log(`  LATER DRAFTS BY WOUND SOURCE: ${JSON.stringify(pooled.laterDraftsBySource)}`);
  console.log(`  DRAFTS PER ENTITY BY FIRST-WOUND SOURCE: ${JSON.stringify(pooled.laterDraftsPerEntity)}`);
  if (!corpusOk || !neutrality.exact) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.DEFWOUND; delete process.env.ECHODRAFT;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), defStore = newDefStore(), echoStore = newEchoStore();
  const wrapped = withEchodraftDiag(withDefwoundDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'echodraft-diag', 'tableseat-nowait + raid draft trace', echoStore);
  const { Game } = await loadGame({ seed, mode: 'echodraft-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._raftdraft || capturedCtx._spawnsrc || capturedCtx._defwound || capturedCtx._echodraft));
  const wrapsInstalled = !!Game._raftdraftDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._defwoundDiagInstalled || !!Game._echodraftDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} postSetupWorld=${postSetupWorld} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const evidDir = evidDirOf();
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8'));
  const a = analyzeEcho((row.echodraft && row.echodraft.raids) || [], (row.defwound && row.defwound.resolveFights) || []);
  const st = a.senseTimeline;
  if (!st) { console.log(`SENSE seed=${seed}: no wounded drafted entity found`); return; }
  const e = st.entity;
  const lines = [];
  lines.push('SENSE — THE MOST-DRAFTED WOUNDED ENTITY ON THIS TRAJECTORY (draft trace + fight rows, not a narration replay)');
  lines.push(`seed=${seed} policy=tableseat-nowait+echodraft-diag days=${row.days} endReason=${row.endReason}`);
  lines.push(`Entity: seq ${e.seq}, ${e.type}, wave ${e.wave}, first-wound source ${e.firstWoundSource}, drafted ${e.drafts} times, ever below-line at a draft: ${e.everBelowLineAtDraft}`);
  lines.push('');
  lines.push('Drafts (day, rank in draft, distance from Haven before the draft, HP fraction before the toll, below the break line?):');
  for (const d of st.drafts) lines.push(`  d${d.day} rank=${d.rank} dist=${d.dist} frac=${d.frac != null ? d.frac.toFixed(2) : 'n/a'} belowLine=${d.belowLine} priorClass=${d.priorClass} prev=${d.prev}`);
  lines.push('');
  lines.push('Fights (day, raid or field, outcome, rounds, start -> end HP fraction):');
  for (const f of st.fights) lines.push(`  d${f.day} ${f.context} ${f.outcome} rounds=${f.rounds} ${f.startFrac != null ? f.startFrac.toFixed(2) : 'n/a'} -> ${f.endFrac != null ? f.endFrac.toFixed(2) : 'n/a'} manufactured=${f.manufactured}`);
  const out = path.join(REPO, 'evidence', '2026-10-25', 'sim-echodraft-a-sense.txt');
  writeFileRetry(out, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
  console.log(`\nSENSE written to ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--one' && args[1] === 'armed' && args[2]) { await oneMode('armed', args[2]); return; }
  if (args[0] === '--summary') { await summaryMode(); return; }
  if (args[0] === '--detgate') { await detgateMode(); return; }
  if (args[0] === '--sense' && args[1]) { await senseMode(args[1]); return; }
  console.error('usage: test-echodraft-a-sweep.js (--one armed <seed> | --summary | --detgate | --sense <seed>)');
  process.exit(2);
}
main().catch(e => { console.error('SWEEP FAILURE: ' + (e && e.stack || e)); process.exit(1); });
