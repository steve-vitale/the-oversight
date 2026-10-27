#!/usr/bin/env node
// scripts/test-ammostorage-diag-sweep.js — sim-ammostorage-a sweep
// (scale-onramp axis, 2026-10-26, arm sim-ammostorage-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; every row is written
// incrementally into the worktree evidence dir, NEVER /tmp).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot.
// Armed: tableseat-nowait wrapped with ONE new observational recorder
// (ammostorage-diag, AMMOSTORAGE=1): per-field-fight storage /
// carried / equipped ammo census + light daily storage snapshots.
// Records after delegating, draws no RNG, never throws into the engine.
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>. See the evidence
// pre-registration in evidence/2026-10-26/sim-ammostorage-a-prereg.md
// for the storage buckets, gate taxonomy, and DIAG-GO bar.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newAmmoStore, installAmmoStorageDiag, withAmmoStorageDiag, AMMO_IDS,
} = require('./policies/ammostorage-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };

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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-ammostorage-a'); }
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let ammoStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.AMMOSTORAGE = '1';
    ammoStore = newAmmoStore();
    base = withAmmoStorageDiag(tableseatNowait, 'ammostorage-diag', 'tableseat-nowait + storage/carried/equipped ammo census', ammoStore);
  } else {
    delete process.env.AMMOSTORAGE;
  }
  const { Game } = await loadGame({ seed, mode: 'ammostorage-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installAmmoStorageDiag(Game, ammoStore); } catch (e) {}
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
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
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
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
  };
  if (pid === 'armed') {
    row.ammostorage = {
      fieldFights: ammoStore.fieldFights, dailySnapshots: ammoStore.dailySnapshots, noRecord: ammoStore.noRecord,
      diag: { errs: ammoStore.errs, errors: ammoStore.errors, overflow: ammoStore.overflow, installed: ammoStore.installed },
    };
  } else {
    row.note = 'snapshot-only: no event lists on the baseline arm';
  }
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}
function sumByType(rows, fn) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  for (const r of rows) { const v = fn(r) || {}; for (const id of AMMO_IDS) out[id] += (v[id] | 0); }
  return out;
}
function fightsWith(rows, fn) {
  let n = 0;
  for (const r of rows) if (fn(r)) n++;
  return n;
}
function sectionAmmoTotal(storage) {
  // Sum ammo across stash sections (tools/weapons/medicine/armor).
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  try {
    const secs = (storage && storage.stashSections) || {};
    for (const name of Object.keys(secs)) for (const id of AMMO_IDS) out[id] += (secs[name][id] | 0);
  } catch (e) {}
  return out;
}
function classifySeed(row) {
  const v = (row.ammostorage && row.ammostorage.fieldFights) || [];
  const snaps = (row.ammostorage && row.ammostorage.dailySnapshots) || [];
  const v4 = v.filter(f => (f.wave | 0) === 4);
  const diagErrs = (row.ammostorage.diag.errs | 0);
  const overflowN = (row.ammostorage.diag.overflow.fieldFights | 0) + (row.ammostorage.diag.overflow.dailySnapshots | 0);
  const checks = {
    gateComplete: v.every(f => !!f.gate),
    storagePresent: v.every(f => !!f.storage),
    diagClean: diagErrs === 0 && overflowN === 0 && (row.ammostorage.noRecord | 0) === 0,
  };
  checks.all = checks.gateComplete && checks.storagePresent && checks.diagClean;
  const stashStone = v.map(f => ((f.storage && f.storage.stashMaterials && f.storage.stashMaterials.stone) | 0));
  const snapStone = snaps.map(s => ((s.storage && s.storage.stashMaterials && s.storage.stashMaterials.stone) | 0));
  return {
    seed: row.seed,
    fieldAll: v.length, field4: v4.length,
    dailySnapshots: snaps.length,
    checks: checks, diagErrs: diagErrs, overflowN: overflowN, noRecord: row.ammostorage.noRecord | 0,
    gatesAll: counter(v, f => f.gate), gates4: counter(v4, f => f.gate),
    volleyDmgAll: v.reduce((t, f) => t + (f.volleyDmg | 0), 0), volleyDmg4: v4.reduce((t, f) => t + (f.volleyDmg | 0), 0),
    volleyShotsAll: counter(v, f => (f.volleyShots == null ? 'null' : String(f.volleyShots))),
    // Fighter buckets (expect all zero on carried; stashed is the personal-cache question).
    fighterCarriedByType: sumByType(v, f => f.fighterCarriedByType),
    fighterCarriedFights: fightsWith(v, f => AMMO_IDS.some(id => (f.fighterCarriedByType[id] | 0) > 0)),
    fighterStashedByType: sumByType(v, f => f.fighterStashedByType),
    fighterStashedFights: fightsWith(v, f => AMMO_IDS.some(id => (f.fighterStashedByType[id] | 0) > 0)),
    fighterCarriedFights4: fightsWith(v4, f => AMMO_IDS.some(id => (f.fighterCarriedByType[id] | 0) > 0)),
    // Storage buckets at fight time.
    stashStoneFights: fightsWith(v, f => ((f.storage && f.storage.stashMaterials && f.storage.stashMaterials.stone) | 0) > 0),
    stashStoneMax: stashStone.length ? Math.max.apply(null, stashStone) : 0,
    stashStoneMedian: medianOf(stashStone),
    otherCarriedByType: sumByType(v, f => f.storage && f.storage.otherPersonsCarried),
    otherCarriedFights: fightsWith(v, f => AMMO_IDS.some(id => ((f.storage.otherPersonsCarried[id]) | 0) > 0)),
    otherStashedByType: sumByType(v, f => f.storage && f.storage.otherPersonsStashed),
    otherStashedFights: fightsWith(v, f => AMMO_IDS.some(id => ((f.storage.otherPersonsStashed[id]) | 0) > 0)),
    sectionAmmoByType: sumByType(v, f => sectionAmmoTotal(f.storage)),
    sectionAmmoFights: fightsWith(v, f => AMMO_IDS.some(id => (sectionAmmoTotal(f.storage)[id] | 0) > 0)),
    pantryAmmoByType: sumByType(v, f => f.storage && f.storage.pantry && f.storage.pantry.byType),
    pantryAmmoFights: fightsWith(v, f => AMMO_IDS.some(id => ((f.storage.pantry.byType[id]) | 0) > 0)),
    scholarAmmoByType: sumByType(v, f => f.storage && f.storage.scholarInventory),
    scholarAmmoFights: fightsWith(v, f => AMMO_IDS.some(id => ((f.storage.scholarInventory[id]) | 0) > 0)),
    scholarFights: fightsWith(v, f => !!f.isScholar),
    scholarFightsWithAmmo: fightsWith(v, f => !!f.isScholar && AMMO_IDS.some(id => ((f.storage.scholarInventory[id]) | 0) > 0)),
    // Daily snapshots: days where ANY reservoir holds arrows/bolts (not stone).
    snapDaysWithArrowBolt: fightsWith(snaps, s => {
      const st = s.storage || {};
      const pools = [sectionAmmoTotal(st), st.otherPersonsCarried || {}, st.otherPersonsStashed || {}, st.scholarInventory || {}, (st.pantry && st.pantry.byType) || {}];
      return pools.some(p => ((p.arrow | 0) > 0 || (p.bolt | 0) > 0));
    }),
    snapDaysWithStone: fightsWith(snaps, s => ((s.storage.stashMaterials.stone) | 0) > 0),
    snapStoneMax: snapStone.length ? Math.max.apply(null, snapStone) : 0,
    fieldRows4: v4, fieldRowsAll: v,
  };
}

function bandOf(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}
function mergeCounters(list) {
  const m = {};
  for (const c of list) for (const k of Object.keys(c)) m[k] = (m[k] || 0) + c[k];
  return m;
}
function mergeTypeSums(list) {
  const out = {};
  for (const id of AMMO_IDS) out[id] = 0;
  for (const c of list) for (const id of AMMO_IDS) out[id] += (c[id] | 0);
  return out;
}
function volleyACrossCheck() {
  // Published volley-a corpus: evidence/2026-10-26/perseed-volley-a/s<seed>-armed.json
  const dir = path.join(REPO, 'evidence', '2026-10-26', 'perseed-volley-a');
  const out = {};
  for (const seed of SEEDS) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
      const v = (r.volley && r.volley.fieldFights) || [];
      out[seed] = {
        fieldAll: v.length, field4: v.filter(f => (f.wave | 0) === 4).length,
        gatesAll: counter(v, f => f.gate), gates4: counter(v.filter(f => (f.wave | 0) === 4), f => f.gate),
        g7: v.filter(f => f.gate === 'G7-fires').length,
        volleyDmgAll: v.reduce((t, f) => t + (f.volleyDmg | 0), 0),
      };
    } catch (e) { out[seed] = { error: String((e && e.message) || e).slice(0, 120) }; }
  }
  return out;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  }
  const perSeed = [];
  for (const seed of SEEDS) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    perSeed.push(classifySeed(armed));
  }
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.faced) === JSON.stringify(a.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const corpusOk = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.faced && r.logEntries)
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.ammostorage.fieldFights) && Array.isArray(r.ammostorage.dailySnapshots));
  const baselineBand = bandOf(rows, 'baseline');
  const armedBand = bandOf(rows, 'armed');
  const diff1920 = {
    wins: baselineBand.won - BAND1920.wins, nationalEver: baselineBand.nationalEver - BAND1920.nationalEver,
    nationalFinal: baselineBand.nationalFinal - BAND1920.nationalFinal, table: baselineBand.table - BAND1920.table,
    entered: baselineBand.entered - BAND1920.entered,
    wave4: baselineBand.wave4 - BAND1920.wave4, wave5: baselineBand.wave5 - BAND1920.wave5,
    medianDays: baselineBand.medianDays - BAND1920.medianDays, deaths: baselineBand.deathTotal - BAND1920.deaths,
    starvation: baselineBand.starvationTotal - BAND1920.starvation,
  };
  const rebaselineExact = Object.keys(diff1920).every(k => diff1920[k] === 0);
  const costBar = {
    starvationOk: armedBand.starvationTotal <= baselineBand.starvationTotal + 2,
    medianOk: armedBand.medianDays >= 0.8 * baselineBand.medianDays,
  };
  const volleyX = volleyACrossCheck();
  const xPerSeed = perSeed.map(p => {
    const x = volleyX[p.seed] || {};
    const gatesMatch = JSON.stringify(p.gatesAll) === JSON.stringify(x.gatesAll || null)
      && JSON.stringify(p.gates4) === JSON.stringify(x.gates4 || null);
    return {
      seed: p.seed, fieldAll: p.fieldAll, volleyFieldAll: x.fieldAll, fieldMatch: p.fieldAll === x.fieldAll,
      field4: p.field4, volleyField4: x.field4, field4Match: p.field4 === x.field4,
      gatesMatch: gatesMatch, volleyG7: x.g7, myG7: (p.gatesAll['G7-fires'] | 0),
      fullyCensused: p.checks.all && p.fieldAll === x.fieldAll && p.field4 === x.field4,
    };
  });
  const fullyCensusedSeeds = xPerSeed.filter(x => x.fullyCensused).length;
  const totalField = perSeed.reduce((t, p) => t + p.fieldAll, 0);
  const totalField4 = perSeed.reduce((t, p) => t + p.field4, 0);
  const volleyTotalField = SEEDS.reduce((t, s) => t + ((volleyX[s] && volleyX[s].fieldAll) | 0), 0);
  const volleyTotalField4 = SEEDS.reduce((t, s) => t + ((volleyX[s] && volleyX[s].field4) | 0), 0);
  const coverageAll = volleyTotalField ? totalField / volleyTotalField : 0;
  const coverage4 = volleyTotalField4 ? totalField4 / volleyTotalField4 : 0;
  const bandGatesAll = mergeCounters(perSeed.map(p => p.gatesAll));
  const bandGates4 = mergeCounters(perSeed.map(p => p.gates4));
  const verdict = (coverageAll >= 0.95 && coverage4 === 1 && (bandGatesAll['G7-fires'] | 0) === 0) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const report = {
    label: 'sim-ammostorage-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1920: diff1920, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920,
    volleyCrossCheck: { perSeed: xPerSeed, volleyTotalField: volleyTotalField, volleyTotalField4: volleyTotalField4, myTotalField: totalField, myTotalField4: totalField4, coverageAll: coverageAll, coverage4: coverage4, fullyCensusedSeeds: fullyCensusedSeeds },
    bandGatesAll: bandGatesAll, bandGates4: bandGates4,
    fieldAll: totalField, field4: totalField4,
    volleyDmgAll: perSeed.reduce((t, p) => t + p.volleyDmgAll, 0),
    volleyDmg4: perSeed.reduce((t, p) => t + p.volleyDmg4, 0),
    bandFighterCarriedByType: mergeTypeSums(perSeed.map(p => p.fighterCarriedByType)),
    bandFighterCarriedFights: perSeed.reduce((t, p) => t + p.fighterCarriedFights, 0),
    bandFighterStashedByType: mergeTypeSums(perSeed.map(p => p.fighterStashedByType)),
    bandFighterStashedFights: perSeed.reduce((t, p) => t + p.fighterStashedFights, 0),
    bandStashStoneFights: perSeed.reduce((t, p) => t + p.stashStoneFights, 0),
    bandStashStoneMax: Math.max.apply(null, perSeed.map(p => p.stashStoneMax).concat([0])),
    bandStashStoneMedian: medianOf(perSeed.map(p => p.stashStoneMedian)),
    bandOtherCarriedByType: mergeTypeSums(perSeed.map(p => p.otherCarriedByType)),
    bandOtherCarriedFights: perSeed.reduce((t, p) => t + p.otherCarriedFights, 0),
    bandOtherStashedByType: mergeTypeSums(perSeed.map(p => p.otherStashedByType)),
    bandOtherStashedFights: perSeed.reduce((t, p) => t + p.otherStashedFights, 0),
    bandSectionAmmoByType: mergeTypeSums(perSeed.map(p => p.sectionAmmoByType)),
    bandSectionAmmoFights: perSeed.reduce((t, p) => t + p.sectionAmmoFights, 0),
    bandPantryAmmoByType: mergeTypeSums(perSeed.map(p => p.pantryAmmoByType)),
    bandPantryAmmoFights: perSeed.reduce((t, p) => t + p.pantryAmmoFights, 0),
    bandScholarAmmoByType: mergeTypeSums(perSeed.map(p => p.scholarAmmoByType)),
    bandScholarAmmoFights: perSeed.reduce((t, p) => t + p.scholarAmmoFights, 0),
    bandScholarFights: perSeed.reduce((t, p) => t + p.scholarFights, 0),
    bandScholarFightsWithAmmo: perSeed.reduce((t, p) => t + p.scholarFightsWithAmmo, 0),
    bandSnapDaysWithArrowBolt: perSeed.reduce((t, p) => t + p.snapDaysWithArrowBolt, 0),
    bandSnapDaysWithStone: perSeed.reduce((t, p) => t + p.snapDaysWithStone, 0),
    bandSnapStoneMax: Math.max.apply(null, perSeed.map(p => p.snapStoneMax).concat([0])),
    bandDailySnapshots: perSeed.reduce((t, p) => t + p.dailySnapshots, 0),
    verdict: verdict,
    verdictRule: 'DIAG-GO iff fight-time census rows for >=95% of field fights AND 100% of wave-4 fights (denominator = volley-a published band counts, same substrate/seeds), with the storage / carried / equipped split quantified per ammo type, AND a verdict naming (a)/(b)/(c)/(d) per ammo type.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-ammostorage-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: fieldAll=${p.fieldAll} field4=${p.field4} snaps=${p.dailySnapshots} censused=${p.checks.all} gates4=${JSON.stringify(p.gates4)} stashStoneFights=${p.stashStoneFights}/${p.fieldAll} stashStoneMax=${p.stashStoneMax} otherCarriedFights=${p.otherCarriedFights} otherStashedFights=${p.otherStashedFights} sectionFights=${p.sectionAmmoFights} pantryFights=${p.pantryAmmoFights} scholarFights=${p.scholarAmmoFights} snapArrowBoltDays=${p.snapDaysWithArrowBolt}/${p.dailySnapshots}`);
  }
  for (const x of xPerSeed) {
    console.log(`  xcheck seed ${x.seed}: field ${x.fieldAll}/${x.volleyFieldAll} match=${x.fieldMatch} field4 ${x.field4}/${x.volleyField4} match=${x.field4Match} gatesMatch=${x.gatesMatch} G7 mine=${x.myG7} volley=${x.volleyG7} fullyCensused=${x.fullyCensused}`);
  }
  console.log(`  coverage: all ${totalField}/${volleyTotalField} = ${(coverageAll * 100).toFixed(1)}% ; wave-4 ${totalField4}/${volleyTotalField4} = ${(coverage4 * 100).toFixed(1)}% ; fullyCensused seeds ${fullyCensusedSeeds}/8`);
  console.log(`  band gates ALL (${totalField}): ${JSON.stringify(bandGatesAll)}`);
  console.log(`  band gates W4 (${totalField4}): ${JSON.stringify(bandGates4)}`);
  console.log(`  fighter carried: ${JSON.stringify(report.bandFighterCarriedByType)} fights=${report.bandFighterCarriedFights} ; fighter stashed: ${JSON.stringify(report.bandFighterStashedByType)} fights=${report.bandFighterStashedFights}`);
  console.log(`  stash stone: fights>0=${report.bandStashStoneFights}/${totalField} max=${report.bandStashStoneMax} median=${report.bandStashStoneMedian}`);
  console.log(`  other persons carried: ${JSON.stringify(report.bandOtherCarriedByType)} fights=${report.bandOtherCarriedFights} ; stashed: ${JSON.stringify(report.bandOtherStashedByType)} fights=${report.bandOtherStashedFights}`);
  console.log(`  stash sections ammo: ${JSON.stringify(report.bandSectionAmmoByType)} fights=${report.bandSectionAmmoFights} ; pantry ammo: ${JSON.stringify(report.bandPantryAmmoByType)} fights=${report.bandPantryAmmoFights}`);
  console.log(`  scholar inventory ammo: ${JSON.stringify(report.bandScholarAmmoByType)} fights=${report.bandScholarAmmoFights} (scholar fights ${report.bandScholarFights}, with ammo ${report.bandScholarFightsWithAmmo})`);
  console.log(`  daily snapshots: ${report.bandDailySnapshots} ; days with arrow/bolt anywhere=${report.bandSnapDaysWithArrowBolt} ; days with stash stone>0=${report.bandSnapDaysWithStone} ; snap stone max=${report.bandSnapStoneMax}`);
  console.log(`  -> VERDICT ${verdict} -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      console.log(`--- ${pid} seed ${seed} ---`);
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-ammostorage-diag-sweep.js'), '--one', pid, String(seed)],
        { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
      process.stdout.write(out);
    }
  }
  await summaryMode();
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  let line = `days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal}`;
  if (pid === 'armed') {
    const c = classifySeed(row);
    line += ` fieldAll=${c.fieldAll} field4=${c.field4} snaps=${c.dailySnapshots} censused=${c.checks.all} diagErrs=${c.diagErrs} noRecord=${c.noRecord}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.AMMOSTORAGE;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const ammoStore = newAmmoStore();
  const wrapped = withAmmoStorageDiag(tableseatNowait, 'ammostorage-diag', 'tableseat-nowait + storage/carried/equipped ammo census', ammoStore);
  const { Game } = await loadGame({ seed, mode: 'ammostorage-diag-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, wrapped, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return wrapped.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const hasDiagSurface = !!(capturedCtx && capturedCtx._ammostorage);
  const wrapsInstalled = !!Game._ammoStorageDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const row = await runOne('armed', seed, days, null);
  const a = classifySeed(row);
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && classifySeed(census).field4 === a.field4
    && classifySeed(census).fieldAll === a.fieldAll
    && JSON.stringify(classifySeed(census).gates4) === JSON.stringify(a.gates4);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} fieldAll=${a.fieldAll} field4=${a.field4} gates4=${JSON.stringify(a.gates4)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL wave-4 ammo rows:');
  for (const r of a.fieldRows4) {
    const st = r.storage || {};
    console.log(`DETAIL w4 d${r.day} ${r.mid} vid=${r.vid} gate=${r.gate} preRanged=${r.preRanged} postRanged=${r.postRanged} postAmmo=${r.postAmmoId} preAmmoN=${r.preAmmoN} volleyShots=${r.volleyShots} fighterCarried=${JSON.stringify(r.fighterCarriedByType)} fighterStashed=${JSON.stringify(r.fighterStashedByType)} stashStone=${(st.stashMaterials && st.stashMaterials.stone) | 0} otherCarried=${JSON.stringify(st.otherPersonsCarried)} otherStashed=${JSON.stringify(st.otherPersonsStashed)} sections=${JSON.stringify(sectionAmmoTotal(st))} pantry=${JSON.stringify(st.pantry && st.pantry.byType)} scholar=${JSON.stringify(st.scholarInventory)}`);
  }
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || 'stdout';
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.AMMOSTORAGE = '1';
  const ammoStore = newAmmoStore();
  const armed = withAmmoStorageDiag(tableseatNowait, 'ammostorage-diag', 'tableseat-nowait + storage/carried/equipped ammo census', ammoStore);
  const { Game } = await loadGame({ seed, mode: 'ammostorage-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installAmmoStorageDiag(Game, ammoStore); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let dmgLine = 'ammo: unavailable';
  try {
    const field4 = ammoStore.fieldFights.filter(f => (f.wave | 0) === 4);
    const byG = {};
    for (const f of field4) byG[f.gate || 'null'] = (byG[f.gate || 'null'] || 0) + 1;
    dmgLine = `ammo (SENSE-ONLY, non-measured): field4=${field4.length} byGate=${JSON.stringify(byG)} volleyDmg=${field4.reduce((t, f) => t + (f.volleyDmg | 0), 0)}`;
  } catch (e) { dmgLine = 'ammo error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+ammostorage-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    dmgLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  if (out === 'stdout') {
    process.stdout.write(body);
  } else {
    writeFileRetry(out, body);
  }
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('AMMOSTORAGE-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifySeed, bandOf, BAND1920, SEEDS };
