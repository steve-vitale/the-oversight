#!/usr/bin/env node
// scripts/test-fieldpos-a-sweep.js — sim-fieldpos-a sweep
// (scale-onramp axis, 2026-10-25: field-fight position trace; DIAG
// ONLY, zero src/js changes).
//
// PAIRING (exact, identical seeds — the sim-echodraft-a composition,
// with the new recorder swapped in for the draft recorder):
//   armed = tableseat-nowait wrapped with FOUR recorders:
//     raftdraft-diag (raid draft census, cross-check),
//     spawnsrc-diag (instance tags, reused VERBATIM),
//     defwound-diag (resolve rows, reused VERBATIM — cross-check:
//       its fight count must equal the fieldpos fight count),
//     fieldpos-diag (resolve rows + tx/ty at fight time, new).
//   No baseline arm is run in the sweep: the published 1815 control
//   band IS the control, and the armed rows here must reproduce it
//   exactly (neutrality proof).
// Substrate: seeds 73671-73678, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon).
//
// Modes:
//   --one armed <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the trace numbers + neutrality gates + verdict. Exit 1 on
//     gate failure.
//   --detgate : delegation-off proof on one seed (SEED env, default
//     73671): tableseat-nowait with NO recorder on-switch must match
//     a plain tableseat-nowait run on days/gameDays/ts, with no
//     recorder surface and no installed wraps.
//   --sense <seed> : print (and write) the plain-words story of the
//     most field-re-met wounded entity on that seed's trajectory.
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
  newStore: newFpStore, installFieldposDiag, withFieldposDiag,
  analyzeFieldpos, verdictOf, distSumm, medianOf,
} = require('./policies/fieldpos-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// Published 1815 control band (sim-scale-onramp-round-1815.md), also
// reproduced exactly by sim-defwound-a Stage 1 and sim-echodraft-a.
const CONTROL = {
  raids: 85, raiders: 361, deaths: 234, nationalEver: 7, wins: 4,
  medianDays: 135, poolTotal: 1494, poolW3: 107, wave4: 6, wave5: 0,
};
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
  let raftStore = null, spawnStore = null, defStore = null, fpStore = null;
  if (pid === 'armed') {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.DEFWOUND = '1'; process.env.FIELDPOS = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); defStore = newDefStore(); fpStore = newFpStore();
  } else { delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.DEFWOUND; delete process.env.FIELDPOS; }
  const base = pid === 'armed'
    ? withFieldposDiag(withDefwoundDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'fieldpos-diag', 'tableseat-nowait + field-fight position trace', fpStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'fieldpos-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installDefwoundDiag(Game, defStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installFieldposDiag(Game, fpStore); } catch (e) { /* install best-effort; daily hook retries */ }
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
    fieldpos: fpStore ? {
      resolveFights: fpStore.resolveFights, noFightCalls: fpStore.noFightCalls,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-fieldpos-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, dd = row.defwound, fp = row.fieldpos;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} won=${row.won} deaths=${row.deathTotal} raids=${rd ? rd.raids.length : 'n/a'} raiders=${rd ? rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0) : 'n/a'} fpRows=${fp ? fp.resolveFights.length : 'n/a'} defRows=${dd ? dd.resolveFights.length : 'n/a'} noFight=${fp ? fp.noFightCalls : 'n/a'} errs=raft${rd ? rd.diag.errs : '?'}:spawn${row.spawnsrc ? row.spawnsrc.diag.errs : '?'}:def${dd ? dd.diag.errs : '?'}:fp${fp ? fp.diag.errs : '?'}`);
}

function loadRows(evidDir) {
  return SEEDS.map(seed => JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')));
}

function summarizeRows(rows) {
  const perSeed = rows.map(r => ({
    seed: r.seed,
    analysis: analyzeFieldpos((r.fieldpos && r.fieldpos.resolveFights) || [], r.days),
  }));
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
  const deathCauses = {};
  for (const r of rows) for (const k of Object.keys(r.deaths || {})) deathCauses[k] = (deathCauses[k] || 0) + r.deaths[k];
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
      poolTotal: raftPoolTotal, poolW3: raftPoolW3, wave4: band.wave4, wave5: band.wave5,
    },
    exact: raftRaids.length === CONTROL.raids && raftRaiders === CONTROL.raiders
      && band.deathTotal === CONTROL.deaths && band.nationalEver === CONTROL.nationalEver
      && band.won === CONTROL.wins && band.medianDays === CONTROL.medianDays
      && band.wave4 === CONTROL.wave4 && band.wave5 === CONTROL.wave5,
  };
  let defFpMismatch = 0;
  const defFpPerSeed = rows.map(r => {
    const d = (r.defwound && r.defwound.resolveFights) || [];
    const f = (r.fieldpos && r.fieldpos.resolveFights) || [];
    const ok = d.length === f.length;
    if (!ok) defFpMismatch++;
    return { seed: r.seed, defRows: d.length, fpRows: f.length, match: ok };
  });
  const pooledDists = {};
  const pooledEntityMeds = {};
  const pooledExposure = {};
  for (const s of perSeed) {
    for (const k of Object.keys(s.analysis.remeetDistsBySource || {})) {
      (pooledDists[k] = pooledDists[k] || []).push(...(s.analysis.remeetDistsBySource[k] || []));
    }
    for (const k of Object.keys(s.analysis.entityMediansBySource || {})) {
      (pooledEntityMeds[k] = pooledEntityMeds[k] || []).push(...(s.analysis.entityMediansBySource[k] || []));
    }
    for (const k of Object.keys(s.analysis.exposureBySource || {})) {
      const e = s.analysis.exposureBySource[k];
      if (!pooledExposure[k]) pooledExposure[k] = { entities: 0, totalDaysAlive: 0, totalFieldReMeets: 0, rateWeight: 0, rateSum: 0 };
      const p = pooledExposure[k];
      p.entities += e.entities; p.totalDaysAlive += e.totalDaysAlive; p.totalFieldReMeets += e.totalFieldReMeets;
      p.rateWeight += e.entities; p.rateSum += (e.meanReMeetsPerDayAlive || 0) * e.entities;
    }
  }
  const pooledPos = {};
  for (const k of Object.keys(pooledDists)) pooledPos[k] = distSumm(pooledDists[k]);
  const pooledEntityPos = {};
  for (const k of Object.keys(pooledEntityMeds)) pooledEntityPos[k] = distSumm(pooledEntityMeds[k]);
  const pooledExp = {};
  for (const k of Object.keys(pooledExposure)) {
    const p = pooledExposure[k];
    pooledExp[k] = {
      entities: p.entities, totalDaysAlive: p.totalDaysAlive, totalFieldReMeets: p.totalFieldReMeets,
      meanReMeetsPerDayAlive: p.rateWeight ? p.rateSum / p.rateWeight : null,
      pooledReMeetsPerDayAlive: p.totalDaysAlive ? p.totalFieldReMeets / p.totalDaysAlive : null,
    };
  }
  const pooledLingering = {};
  for (const s of perSeed) {
    for (const k of Object.keys(s.analysis.lingeringBySource || {})) {
      const l = s.analysis.lingeringBySource[k];
      if (!pooledLingering[k]) pooledLingering[k] = { n: 0, lingering: 0 };
      pooledLingering[k].n += l.n; pooledLingering[k].lingering += l.lingering;
    }
  }
  for (const k of Object.keys(pooledLingering)) {
    pooledLingering[k].lingeringShare = pooledLingering[k].n ? pooledLingering[k].lingering / pooledLingering[k].n : null;
  }
  const verdict = verdictOf(
    pooledPos['raid'] || null, pooledPos['field'] || null,
    (pooledExp['raid'] && pooledExp['raid'].meanReMeetsPerDayAlive) || null,
    (pooledExp['field'] && pooledExp['field'].meanReMeetsPerDayAlive) || null,
  );
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
    && Object.values(r.raftdraft.diag.overflow || {}).every(v => v === 0)
    && r.spawnsrc && Array.isArray(r.spawnsrc.raids) && r.spawnsrc.diag.errs === 0
    && Object.values(r.spawnsrc.diag.overflow || {}).every(v => v === 0)
    && r.defwound && Array.isArray(r.defwound.resolveFights) && r.defwound.diag.errs === 0
    && Object.values(r.defwound.diag.overflow || {}).every(v => v === 0)
    && r.fieldpos && Array.isArray(r.fieldpos.resolveFights) && r.fieldpos.diag.errs === 0
    && Object.values(r.fieldpos.diag.overflow || {}).every(v => v === 0))
    && defFpMismatch === 0
    && perSeed.every(s => s.analysis.fightsMissingPos === 0);
  const totals = {
    fights: perSeed.reduce((t, s) => t + s.analysis.fights, 0),
    raidFights: perSeed.reduce((t, s) => t + s.analysis.raidFights, 0),
    fieldFights: perSeed.reduce((t, s) => t + s.analysis.fieldFights, 0),
    noFightCalls: rows.reduce((t, r) => t + ((r.fieldpos && r.fieldpos.noFightCalls) || 0), 0),
    untaggedFights: perSeed.reduce((t, s) => t + s.analysis.untaggedFights, 0),
    movedRows: perSeed.reduce((t, s) => t + s.analysis.movedRows, 0),
    fightsMissingPos: perSeed.reduce((t, s) => t + s.analysis.fightsMissingPos, 0),
    woundedEntities: perSeed.reduce((t, s) => t + s.analysis.woundedEntities, 0),
    fieldReMeets: perSeed.reduce((t, s) => t + s.analysis.fieldReMeets, 0),
  };
  const firstWoundTotals = {};
  for (const s of perSeed) for (const k of Object.keys(s.analysis.firstWoundSourceCounts || {})) {
    firstWoundTotals[k] = (firstWoundTotals[k] || 0) + s.analysis.firstWoundSourceCounts[k];
  }
  return {
    band: band, deathCauses: deathCauses, neutrality: neutrality, corpusOk: corpusOk,
    perSeed: perSeed, pooled: {
      posBySource: pooledPos, entityPosBySource: pooledEntityPos,
      exposureBySource: pooledExp, lingeringBySource: pooledLingering,
      verdict: verdict, totals: totals, firstWoundTotals: firstWoundTotals,
      defFpPerSeed: defFpPerSeed, defFpMismatch: defFpMismatch,
      raftRaids: raftRaids.length, raftRaiders: raftRaiders,
    },
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = loadRows(evidDir);
  const { band, deathCauses, neutrality, corpusOk, perSeed, pooled } = summarizeRows(rows);
  const report = {
    label: 'sim-fieldpos-a pilot', seeds: SEEDS, band: band, deathCauses: deathCauses,
    control: CONTROL, neutrality: neutrality, corpusOk: corpusOk,
    perSeed: perSeed.map(s => ({ seed: s.seed, analysis: s.analysis })),
    pooled: pooled, generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fieldpos-a pilot ===');
  console.log(`  band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} deaths=${band.deathTotal}`);
  console.log(`  deathCauses: ${JSON.stringify(deathCauses)}`);
  console.log(`  raftdraft census: raids=${pooled.raftRaids} raiders=${pooled.raftRaiders} poolTotal=${neutrality.observed.poolTotal} poolW3=${neutrality.observed.poolW3}`);
  console.log(`  NEUTRALITY vs 1815 control: ${neutrality.exact ? 'EXACT' : 'DEVIATED'}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} (defFpMismatch=${pooled.defFpMismatch} fightsMissingPos=${pooled.totals.fightsMissingPos}) -> ${summaryPath}`);
  console.log(`  FIGHTS: total=${pooled.totals.fights} raid=${pooled.totals.raidFights} field=${pooled.totals.fieldFights} noFightCalls=${pooled.totals.noFightCalls} untagged=${pooled.totals.untaggedFights} moved=${pooled.totals.movedRows} woundedEntities=${pooled.totals.woundedEntities} fieldReMeets=${pooled.totals.fieldReMeets}`);
  console.log(`  FIRST-WOUND SOURCES: ${JSON.stringify(pooled.firstWoundTotals)}`);
  console.log(`  FIELD RE-MEET POS BY SOURCE: ${JSON.stringify(pooled.posBySource)}`);
  console.log(`  ENTITY-MEDIAN POS BY SOURCE: ${JSON.stringify(pooled.entityPosBySource)}`);
  console.log(`  EXPOSURE BY SOURCE: ${JSON.stringify(pooled.exposureBySource)}`);
  console.log(`  LINGERING-FLAG BY SOURCE: ${JSON.stringify(pooled.lingeringBySource)}`);
  console.log(`  VERDICT: ${JSON.stringify(pooled.verdict)}`);
  if (!corpusOk || !neutrality.exact) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.DEFWOUND; delete process.env.FIELDPOS;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), defStore = newDefStore(), fpStore = newFpStore();
  const wrapped = withFieldposDiag(withDefwoundDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'defwound-diag', 'tableseat-nowait + defender wound census', defStore), 'fieldpos-diag', 'tableseat-nowait + field-fight position trace', fpStore);
  const { Game } = await loadGame({ seed, mode: 'fieldpos-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._raftdraft || capturedCtx._spawnsrc || capturedCtx._defwound || capturedCtx._fieldpos));
  const wrapsInstalled = !!Game._raftdraftDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._defwoundDiagInstalled || !!Game._fieldposDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} postSetupWorld=${postSetupWorld} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const evidDir = evidDirOf();
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8'));
  const a = analyzeFieldpos((row.fieldpos && row.fieldpos.resolveFights) || [], row.days);
  const fpRows = (row.fieldpos && row.fieldpos.resolveFights) || [];
  const counts = {};
  for (const r of a.remeetRows) counts[r.seq] = (counts[r.seq] || 0) + 1;
  let topSeq = null, topN = 0;
  for (const k of Object.keys(counts)) if (counts[k] > topN) { topN = counts[k]; topSeq = k; }
  if (topSeq == null) { console.log(`SENSE seed=${seed}: no wounded entity with field re-meets found`); return; }
  const fw = a.firstWounds[String(topSeq)];
  const fights = fpRows.filter(r => String(r.seq) === String(topSeq));
  const lines = [];
  lines.push('SENSE — THE MOST FIELD-RE-MET WOUNDED ENTITY ON THIS TRAJECTORY (field-fight positions, not a narration replay)');
  lines.push(`seed=${seed} policy=tableseat-nowait+fieldpos-diag days=${row.days} endReason=${row.endReason}`);
  lines.push(`Entity: seq ${topSeq}, first-wound source ${fw ? fw.source : 'n/a'} (wound day ${fw ? fw.day : 'n/a'}, ${fw ? fw.context : ''} fight at tile ${fw ? fw.tx + ',' + fw.ty : 'n/a'} dist ${fw ? fw.dist : 'n/a'}${fw && fw.atHaven ? ' = AT HAVEN' : ''}), field re-meets ${topN}`);
  lines.push('');
  lines.push('All its fights (day, raid or field, outcome, rounds, start -> end HP fraction, tile, distance from Haven, at-Haven?):');
  for (const f of fights) {
    const tag = (fw && f.day === fw.day && f.context === fw.context) ? ' [FIRST WOUND]' : '';
    lines.push(`  d${f.day} ${f.context} ${f.outcome} rounds=${f.rounds} ${f.mHpStartFrac != null ? f.mHpStartFrac.toFixed(2) : 'n/a'} -> ${f.mHpEndFrac != null ? f.mHpEndFrac.toFixed(2) : 'n/a'} tile=${f.tx},${f.ty} dist=${f.dist}${f.atHaven ? ' AT-HAVEN' : ''} lingering=${f.lingering}${tag}`);
  }
  const out = path.join(REPO, 'evidence', '2026-10-25', 'sim-fieldpos-a-sense.txt');
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
  console.error('usage: test-fieldpos-a-sweep.js (--one armed <seed> | --summary | --detgate | --sense <seed>)');
  process.exit(2);
}
main().catch(e => { console.error('SWEEP FAILURE: ' + (e && e.stack || e)); process.exit(1); });
