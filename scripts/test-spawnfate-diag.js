#!/usr/bin/env node
// scripts/test-spawnfate-diag.js — spawnfate sweep for journey-scale r41
// (lane A, 2026-10-26, DIAG / MEASUREMENT ONLY, zero src/js changes).
//
// QUESTION (from sim-wave4enc-a): WHY are wave-4 spawns never fought?
// This sweep composes the four wave4enc recorders with the new
// spawnfate daily census (scripts/policies/spawnfate-diag.js) and
// classifies every wave-4 spawn into exactly one fate:
//   fought-field, fought-tb, fought-both, alive-at-end,
//   vanished-edge, vanished-near-player, vanished-interior, unclassified.
// Vanished classes carry last-seen day/position and the spawn's
// closest approach to the player over its censused life.
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678 (the wave4enc band), 180d death-aware horizon.
// One process per seed (default mode spawns --one children; a vanished
// parent cannot take the corpus with it — every row is written
// incrementally). Modes:
//   --one <seed> : run one seed, write s<seed>-fate.json.
//   (default)    : run all seeds via --one children, then --summary.
//   --summary    : rebuild summary.json from the rows on disk
//                  (resume-safe; also the gate/verdict step).
//
// PRE-REGISTER: evidence/2026-10-26/journey-scale-r41-prereg.md
// (FATE-COMPLETE GO iff >=6/8 seeds fully partitioned; FATE-DOMINANT
// names the largest never-fought fate class; FATE-HOLE reports any
// vanished-near-player spawn LOUD).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newWaveStore, installWave4encDiag, withWave4encDiag,
} = require('./policies/wave4enc-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newFFStore, installFieldfinishDiag, withFieldfinishDiag,
} = require('./policies/fieldfinish-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag, classifyStart,
} = require('./policies/nonworldkill-diag');
const {
  newStore: newFateStore, withSpawnfateDiag,
} = require('./policies/spawnfate-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'journey-scale-r41-spawnfate'); }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* snapshot best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* snapshot best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* snapshot best-effort */ }
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

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.WAVE4ENC = '1'; process.env.SPAWNSRC = '1'; process.env.FIELDFINISH = '1';
  process.env.NONWORLDKILL = '1'; process.env.SPAWNFATE = '1';
  const waveStore = newWaveStore(), spawnStore = newSpawnStore(),
    ffStore = newFFStore(), nwkStore = newNwkStore(), fateStore = newFateStore();
  const base = withSpawnfateDiag(
    withNonworldkillDiag(
      withFieldfinishDiag(
        withSpawnsrcDiag(
          withWave4encDiag(tableseatNowait, 'wave4enc-diag', 'tableseat-nowait + wave-4 field spawn-link recorder', waveStore),
          'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore),
        'fieldfinish-diag', 'tableseat-nowait + wounded field-finish recorder', ffStore),
      'nonworldkill-diag', 'tableseat-nowait + TB initiation census', nwkStore),
    'spawnfate-diag', 'tableseat-nowait + wave-4 spawn-fate census', fateStore);
  const { Game } = await loadGame({ seed, mode: 'spawnfate-diag', fullTelemetry: false });
  await setupGame(Game);
  try { installWave4encDiag(Game, waveStore); } catch (e) { /* install errors are counted in the store */ }
  try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* counted */ }
  try { installFieldfinishDiag(Game, ffStore); } catch (e) { /* counted */ }
  try { installNonworldkillDiag(Game, nwkStore); } catch (e) { /* counted */ }
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
      } catch (e) { /* snapshot best-effort */ }
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* policy errors surface via runDays */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const row = {
    policy: 'fate', seed,
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
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
    wave4enc: { fieldFights: waveStore.fieldFights, diag: { errs: waveStore.errs, errors: waveStore.errors, overflow: waveStore.overflow, installed: waveStore.installed } },
    spawnsrc: { spawns: spawnStore.spawns, raids: spawnStore.raids, diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed, seq: spawnStore.seq } },
    fieldfinish: { fieldFights: ffStore.fieldFights, tbFights: ffStore.tbFights, diag: { errs: ffStore.errs, errors: ffStore.errors, overflow: ffStore.overflow, installed: ffStore.installed } },
    nonworldkill: { starts: nwkStore.starts, ends: nwkStore.ends, diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed } },
    spawnfate: { days: fateStore.days, diag: { errs: fateStore.errs, errors: fateStore.errors, overflow: fateStore.overflow } },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-fate.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

// classifyFate(row): exactly-once fate partition over wave-4 spawns.
function classifyFate(row) {
  const spawns4 = (row.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4);
  const field4 = (row.wave4enc.fieldFights || []).filter(f => (f.wave | 0) === 4);
  const fieldSeqs = new Set(field4.filter(f => f.seq != null).map(f => f.seq));
  const classifiedStarts = (row.nonworldkill.starts || []).map(s => ({ start: s, cls: classifyStart(s) }));
  const inits4 = classifiedStarts.filter(c => !c.cls.excluded && ((c.start.wave | 0) === 4));
  const tbTileSeqs = new Set(inits4.filter(c => c.start.tileMonster && c.start.tileMonster.seq != null).map(c => c.start.tileMonster.seq));
  // Census index: 's<seq>' -> censused sightings in day order.
  const censusByFate = {};
  const censusDays = row.spawnfate.days || [];
  for (const d of censusDays) {
    for (const m of (d.monsters || [])) {
      (censusByFate[m.fate] = censusByFate[m.fate] || []).push({ day: d.day, tx: m.tx, ty: m.ty, dist: m.dist, type: m.type });
    }
  }
  const lastCensusDay = censusDays.length ? censusDays[censusDays.length - 1].day : null;
  const fates = {};
  const detail = [];
  for (const s of spawns4) {
    const foughtField = fieldSeqs.has(s.seq), foughtTb = tbTileSeqs.has(s.seq);
    let fate, life = null;
    const sightings = censusByFate['s' + s.seq] || [];
    if (foughtField && foughtTb) fate = 'fought-both';
    else if (foughtField) fate = 'fought-field';
    else if (foughtTb) fate = 'fought-tb';
    else if (!sightings.length) fate = 'unclassified';
    else {
      let minDist = null, lastSeen = null;
      for (const g of sightings) {
        if (g.dist != null && (minDist == null || g.dist < minDist)) minDist = g.dist;
        lastSeen = g;
      }
      life = { daysSeen: sightings.length, firstDay: sightings[0].day, lastDay: lastSeen.day, lastTx: lastSeen.tx, lastTy: lastSeen.ty, minDist };
      if (lastSeen.day === lastCensusDay) fate = 'alive-at-end';
      else if (lastSeen.tx != null && (lastSeen.tx === 0 || lastSeen.tx === 8 || lastSeen.ty === 0 || lastSeen.ty === 8)) fate = 'vanished-edge';
      else if (minDist != null && minDist <= 1) fate = 'vanished-near-player';
      else fate = 'vanished-interior';
    }
    fates[fate] = (fates[fate] || 0) + 1;
    detail.push({ day: s.day, seq: s.seq, type: s.type, src: s.src, fate, life });
  }
  const neverFought = detail.filter(d => d.fate.indexOf('vanished') === 0 || d.fate === 'alive-at-end' || d.fate === 'unclassified');
  const neverFateCounts = {};
  for (const d of neverFought) neverFateCounts[d.fate] = (neverFateCounts[d.fate] || 0) + 1;
  let dominantNever = null, dominantNeverN = 0;
  for (const k of Object.keys(neverFateCounts)) if (neverFateCounts[k] > dominantNeverN) { dominantNever = k; dominantNeverN = neverFateCounts[k]; }
  const diagErrs = (row.wave4enc.diag.errs | 0) + (row.spawnsrc.diag.errs | 0) + (row.fieldfinish.diag.errs | 0) + (row.nonworldkill.diag.errs | 0) + (row.spawnfate.diag.errs | 0);
  const overflowN = (row.wave4enc.diag.overflow.fieldFights | 0) + (row.spawnsrc.diag.overflow.spawns | 0) + (row.fieldfinish.diag.overflow.fieldFights | 0) + (row.fieldfinish.diag.overflow.tbFights | 0) + (row.nonworldkill.diag.overflow.starts | 0) + (row.nonworldkill.diag.overflow.ends | 0) + (row.spawnfate.diag.overflow.days | 0) + (row.spawnfate.diag.overflow.monsters | 0);
  const fullyPartitioned = (fates.unclassified | 0) === 0 && diagErrs === 0 && overflowN === 0;
  return {
    seed: row.seed, spawns4: spawns4.length, field4: field4.length, tbInits4: inits4.length,
    fates, neverFought: neverFought.length, neverFateCounts, dominantNever, dominantNeverN,
    nearPlayer: detail.filter(d => d.fate === 'vanished-near-player'),
    unclassified: detail.filter(d => d.fate === 'unclassified'),
    detail, diagErrs, overflowN, fullyPartitioned,
    lastCensusDay, censusDays: censusDays.length,
  };
}

function bandOf(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fate.json`);
    if (!fs.existsSync(fn)) { console.log(`MISSING ${fn}`); continue; }
    rows.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
  }
  const perSeed = rows.map(classifyFate);
  const bandFates = {};
  for (const p of perSeed) for (const k of Object.keys(p.fates)) bandFates[k] = (bandFates[k] || 0) + p.fates[k];
  const bandNever = {};
  for (const p of perSeed) for (const k of Object.keys(p.neverFateCounts)) bandNever[k] = (bandNever[k] || 0) + p.neverFateCounts[k];
  let domNever = null, domNeverN = 0;
  for (const k of Object.keys(bandNever)) if (bandNever[k] > domNeverN) { domNever = k; domNeverN = bandNever[k]; }
  const fullyN = perSeed.filter(p => p.fullyPartitioned).length;
  const verdict = (fullyN >= 6) ? 'FATE-GO' : 'FATE-NO-GO';
  const nearTotal = perSeed.reduce((t, p) => t + p.nearPlayer.length, 0);
  const summary = {
    verdict, fullyPartitionedSeeds: fullyN, seeds: perSeed.length,
    band: bandOf(rows), bandFates, bandNever, dominantNever: domNever, dominantNeverN: domNeverN,
    nearPlayerTotal: nearTotal, perSeed,
  };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log(`\nSPAWNFATE SUMMARY: verdict=${verdict} fullyPartitioned=${fullyN}/${perSeed.length} bandFates=${JSON.stringify(bandFates)} bandNever=${JSON.stringify(bandNever)} dominantNever=${domNever}(${domNeverN}) nearPlayer=${nearTotal}`);
  for (const p of perSeed) console.log(`  seed ${p.seed}: spawns4=${p.spawns4} field4=${p.field4} tb4=${p.tbInits4} fates=${JSON.stringify(p.fates)} fully=${p.fullyPartitioned} diagErrs=${p.diagErrs} overflow=${p.overflowN}`);
  return summary;
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  for (const seed of SEEDS) {
    console.log(`--- fate seed ${seed} ---`);
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-spawnfate-diag.js'), '--one', String(seed)],
      { cwd: REPO, encoding: 'utf8', timeout: 1800000, env: Object.assign({}, process.env, { EVID: evidDir }) });
    process.stdout.write(out);
  }
  await summaryMode();
}

async function oneMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(seed, days, evidDir);
  const c = classifyFate(row);
  console.log(`  [fate seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} won=${row.won} deaths=${row.deathTotal} spawns4=${c.spawns4} field4=${c.field4} tb4=${c.tbInits4} fates=${JSON.stringify(c.fates)} fully=${c.fullyPartitioned} diagErrs=${c.diagErrs} overflow=${c.overflowN} censusDays=${c.censusDays}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1]);
  if (args.includes('--summary')) return summaryMode();
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('SPAWNFATE-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifyFate, bandOf, SEEDS };
