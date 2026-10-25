#!/usr/bin/env node
// scripts/test-deathcensus-diag-sweep.js — sim-deathcensus-a pilot + proof
// (scale-onramp axis, 2026-10-25, DIAG ONLY: zero src/js changes).
//
// QUESTION (from sim-scale-onramp-round-0535): three finish remedies
// were killed because villages could not afford them (breakexcept:
// deaths 261 -> 390, median 116d), but the death SOURCE was never
// measured. WHERE do villagers actually die on the tableseat-nowait
// band, and what does that say about the survivability companion the
// next finish lever needs?
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, DEATHCENSUS unset). Post-run rows carry the
//     harness death list + faced/kill-log snapshot only — no fight rows.
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     deathcensus-diag.js (DEATHCENSUS=1): resolve-level rows (raid
//     vs field context), direct fieldFight rows (arena vs field,
//     routed fights deduped), tb rows (per-fighter end states).
//     Observational only.
//
// Modes:
//   default: pilot sweep. SEEDS (default 73671-73678), DAYS=180
//     (default), EVID=evidence/2026-10-25/perseed-deathcensus-a.
//     Per-config INCREMENTAL corpus writes. Exit 0 on a completed
//     sweep regardless of GO/NO-GO (the verdict is data); exit 1 on
//     proof-gate failure (G2/G3).
//   --detgate: G1 delegation proof on one seed (SEED env, default
//     73671): tableseat-nowait vs deathcensus-wrapped tableseat-nowait
//     with DEATHCENSUS unset must match on days/gameDays/ts with no
//     _deathcensusdiag surface and no installed wraps. Exit 1 on mismatch.
//   --detail SEED: re-run armed on ONE seed; census-match check
//     (days/gameDays/ts/fight rows/death rows) must pass or exit 1.
//   --sense SEED: NON-MEASURED narration replay, written to
//     evidence/2026-10-25/sim-deathcensus-a-sense.txt; prints the
//     replay census + the ring lines around one villager combat death.
//     NOTE (2026-10-25): narration replays DIVERGED from census
//     trajectories on 4/4 seeds tried (different days/outcomes, zero
//     villager deaths), so --sense cannot quote a census death. Use
//     --transcript instead: same trajectory as the census (proven by
//     the census-match check) plus the engine's own awayNews death
//     line tapped read-only from the fight wrap.
//   --transcript SEED: re-run armed on ONE seed with
//     DEATHCENSUS_TRANSCRIPT=1; census-match check must pass or exit
//     1; prints every vDie row with its awayNews death line; writes
//     evidence/2026-10-25/sim-deathcensus-a-sense.txt (the sense file
//     for this run — a real death transcript on the census trajectory).
//
// Pre-registered GO (binding, judge only against this; the sweep prints
// the inputs, the evidence file judges):
//   DIAG-GO iff (a) census complete on 8/8 seeds with zero recorder
//   errors and unknown-context deaths < 10% of combat deaths,
//   (b) death contexts ranked with numbers and the single largest
//   villager-death source stated, and (c) the companion target for the
//   next finish lever named with numbers (which context a
//   survivability companion must protect, and what it must NOT break)
//   — or the data stated to support no single target.
// Pilot only: 8 seeds, no confirm spend.
//
// METRIC REVIEW NOTE (carried from 0535, do not re-score anything
// under it): the all-runs median is win-shortened (wins end days
// 90-135) and wave-4 reach trips on wins that skip wave-4 — so this
// sweep reports BOTH all-runs median and wins-excluded median, and
// BOTH wave-4 reach and wins.
//
// Historic band headlines as a control check (prior controls): won
// 4/8, median 150d, national-ever 8/8, wave-4 5/8, wave-5 0/8,
// deaths ~261. Any mismatch is reported, never hidden.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore, installDeathcensusDiag, withDeathcensusDiag, analyzeDeathcensus,
} = require('./policies/deathcensus-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* snap best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* snap best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* snap best-effort */ }
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

function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// deathcensusSnapshot(Game, store, deaths, scholarId): post-run census.
// Armed: full analysis over persisted ROWS + the harness death list.
// Baseline: deaths + faced/kill-log snapshot only.
function deathcensusSnapshot(Game, store, deaths, scholarId) {
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const snapOut = {
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
    deaths: deaths,
  };
  if (!store) { snapOut.analysis = null; snapOut.note = 'snapshot-only: no fight rows on the baseline arm'; return snapOut; }
  snapOut.resolveFights = store.resolveFights;
  snapOut.directFights = store.directFights;
  snapOut.tbFights = store.tbFights;
  snapOut.analysis = analyzeDeathcensus(store, deaths, scholarId);
  snapOut.diag = { errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed };
  return snapOut;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let store = null;
  if (pid === 'armed') { process.env.DEATHCENSUS = '1'; store = newStore(); if (storeHolder) storeHolder.store = store; }
  else delete process.env.DEATHCENSUS;
  const base = pid === 'armed'
    ? withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'deathcensus-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const scholarId = Game.villagerId || null;
  if (pid === 'armed') { try { installDeathcensusDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ } }
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
  // Materialize the harness death list (the lazy player getter resolves now).
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) { player = false; }
    return { day: d.day | 0, kind: d.kind || null, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player: player };
  });
  const dc = deathcensusSnapshot(Game, store, deaths, scholarId);
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
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
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    deathcensus: dc,
    diag: store ? { errs: store.errs, overflow: store.overflow } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  const byContext = { raid: 0, field: 0, arena: 0, tb: 0, other: 0, unknown: 0 };
  const byCause = {};
  let combatDeaths = 0, starvationVillager = 0, villagerDeaths = 0, scholarDeaths = 0, monsterDeaths = 0, unknownKindDeaths = 0;
  let fieldW3Fights = 0, fieldW3VKill = 0, fieldW3VDie = 0;
  let raidMFleeBelowLine = 0, raidFights = 0, raidVDie = 0, raidVKill = 0;
  let resolveRows = 0, directRows = 0, tbRows = 0, evidenceRows = 0, orphanEvidence = 0, recorderErrs = 0;
  const combatDetail = [];
  for (const r of rs) {
    const a = r.deathcensus && r.deathcensus.analysis;
    if (!a) continue;
    for (const k of Object.keys(byContext)) byContext[k] += a.byContext[k] || 0;
    for (const k of Object.keys(a.byCause || {})) byCause[k] = (byCause[k] || 0) + (a.byCause[k] || 0);
    combatDeaths += a.threeWay.combat; starvationVillager += a.threeWay.starvation;
    villagerDeaths += a.population.villagerDeaths; scholarDeaths += a.population.scholarDeaths;
    monsterDeaths += a.population.monsterDeaths; unknownKindDeaths += a.population.unknownKindDeaths;
    fieldW3Fights += a.fightTotals.fieldW3.fights; fieldW3VKill += a.fightTotals.fieldW3.vKill; fieldW3VDie += a.fightTotals.fieldW3.vDie;
    raidMFleeBelowLine += a.fightTotals.mFleeBelowLine.raid; raidFights += a.fightTotals.raid.fights;
    raidVDie += a.fightTotals.raid.vDie; raidVKill += a.fightTotals.raid.vKill;
    resolveRows += a.fightTotals.resolveRows; directRows += a.fightTotals.directRows; tbRows += a.fightTotals.tbRows;
    evidenceRows += a.evidenceRows; orphanEvidence += (a.orphanEvidence || []).length;
    recorderErrs += (r.deathcensus.diag && r.deathcensus.diag.errs) || 0;
    for (const d of (a.combatDeathDetail || [])) combatDetail.push(Object.assign({ seed: r.seed }, d));
  }
  const ranked = Object.keys(byContext).map(k => ({ context: k, n: byContext[k] }))
    .sort((a, b) => b.n - a.n);
  const wonRows = rs.filter(r => r.won);
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianDaysWinsExcluded: medianOf(rs.filter(r => !r.won).map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    starvationBySeed: starvBySeed,
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    census: { byContext, byCause, ranked, combatDeaths, starvationVillager, villagerDeaths, scholarDeaths, monsterDeaths, unknownKindDeaths,
      fieldW3: { fights: fieldW3Fights, vKill: fieldW3VKill, vDie: fieldW3VDie },
      raid: { fights: raidFights, vDie: raidVDie, vKill: raidVKill, mFleeBelowLine: raidMFleeBelowLine },
      rows: { resolve: resolveRows, direct: directRows, tb: tbRows, evidence: evidenceRows, orphanEvidence: orphanEvidence },
      recorderErrs: recorderErrs, combatDetail: combatDetail },
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const a = row.deathcensus.analysis;
      const line = a
        ? `census=${JSON.stringify(a.byContext)} villagerDeaths=${a.population.villagerDeaths} combat=${a.threeWay.combat} starv=${a.threeWay.starvation} fieldW3=${a.fightTotals.fieldW3.fights}/${a.fightTotals.fieldW3.vKill}/${a.fightTotals.fieldW3.vDie} raidMFleeBelowLine=${a.fightTotals.mFleeBelowLine.raid} errs=${row.deathcensus.diag.errs}`
        : `snapshot-only deaths=${row.deathTotal}`;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ${line} ts=${JSON.stringify(row.ts)}`);
      rows.push(row);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.deathcensus.faced) === JSON.stringify(a.deathcensus.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.deathcensus.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.deathcensus.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    const deathsOk = !!c && !!a && JSON.stringify(c.deathcensus.deaths) === JSON.stringify(a.deathcensus.deaths);
    g2.push({ seed, ok, facedOk, killsOk, deathsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.deathcensus && r.deathcensus.faced && r.deathcensus.logEntries && Array.isArray(r.deathcensus.deaths))
    && armedRows.length === seeds.length && armedRows.every(r => Array.isArray(r.deathcensus.resolveFights) && Array.isArray(r.deathcensus.directFights) && Array.isArray(r.deathcensus.tbFights) && r.deathcensus.analysis)
    && baselineRows.length === seeds.length && baselineRows.every(r => r.deathcensus.analysis === null && !r.deathcensus.resolveFights);
  const ac = byPolicy.armed.census;
  const unknownShare = ac.combatDeaths > 0 ? (ac.byContext.unknown / ac.combatDeaths) : null;
  const goA = armedRows.length === seeds.length && ac.recorderErrs === 0 && unknownShare !== null && unknownShare < 0.10;
  const report = {
    label: 'sim-deathcensus-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    goInputs: { goA: goA, seedsComplete: armedRows.length === seeds.length, recorderErrs: ac.recorderErrs,
      unknownDeaths: ac.byContext.unknown, combatDeaths: ac.combatDeaths, unknownShare: unknownShare,
      rankedContexts: ac.ranked, largestContext: ac.ranked[0] || null },
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-deathcensus-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medDNoWin=${b.medianDaysWinsExcluded} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed}`);
    if (b.census) console.log(`  ${pid} census: byContext=${JSON.stringify(b.census.byContext)} ranked=${JSON.stringify(b.census.ranked)} combat=${b.census.combatDeaths} starvVillager=${b.census.starvationVillager} villagerDeaths=${b.census.villagerDeaths} scholarDeaths=${b.census.scholarDeaths} monsterDeaths=${b.census.monsterDeaths} unknownKind=${b.census.unknownKindDeaths} fieldW3=${JSON.stringify(b.census.fieldW3)} raid=${JSON.stringify(b.census.raid)} rows=${JSON.stringify(b.census.rows)} recorderErrs=${b.census.recorderErrs}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length}, deaths-agree ${g2.filter(x => x.deathsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  DIAG-GO input (a): seedsComplete=${armedRows.length}/${seeds.length} recorderErrs=${ac.recorderErrs} unknown=${ac.byContext.unknown} combat=${ac.combatDeaths} unknownShare=${unknownShare !== null ? unknownShare.toFixed(3) : 'n/a'} -> goA=${goA}`);
  console.log(`  Ranked death contexts: ${JSON.stringify(ac.ranked)}`);
  console.log(`  Control check vs historic (won 4/8, median 150d, national-ever 8/8, wave-4 5/8, wave-5 0/8, deaths ~261): baseline won=${byPolicy.baseline.won}/8 medD=${byPolicy.baseline.medianDays} natEver=${byPolicy.baseline.nationalEver}/8 wave4=${byPolicy.baseline.wave4}/8 wave5=${byPolicy.baseline.wave5}/8 deathTotal=${byPolicy.baseline.deathTotal} | armed won=${byPolicy.armed.won}/8 medD=${byPolicy.armed.medianDays} natEver=${byPolicy.armed.nationalEver}/8 wave4=${byPolicy.armed.wave4}/8 wave5=${byPolicy.armed.wave5}/8 deathTotal=${byPolicy.armed.deathTotal}`);
  console.log('  NOTE: run --detgate separately for G1 (DEATHCENSUS unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.DEATHCENSUS;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder');
  const { Game } = await loadGame({ seed, mode: 'deathcensus-diag-detgate', fullTelemetry: false });
  await setupGame(Game);
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._deathcensusdiag);
  const wrapsInstalled = !!Game._deathcensusDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(DEATHCENSUS unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const dc = row.deathcensus;
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && JSON.stringify(census.deathcensus.deaths) === JSON.stringify(dc.deaths)
    && JSON.stringify((census.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey))
    && JSON.stringify((census.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey))
    && JSON.stringify(census.deathcensus.analysis.byContext) === JSON.stringify(dc.analysis.byContext);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} villagerDeaths=${dc.analysis.population.villagerDeaths} byContext=${JSON.stringify(dc.analysis.byContext)} resolveRows=${store.resolveFights.length} directRows=${store.directFights.length} tbRows=${store.tbFights.length} errs=${store.errs}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
  console.log('DETAIL attributed deaths:');
  for (const a of dc.analysis.attributed) {
    console.log(`DETAIL death d${a.death.day} who=${a.death.who} cause=${a.death.cause} context=${a.context} ev=${JSON.stringify(a.evidence)}`);
  }
  console.log('DETAIL other/unknown deaths:');
  for (const o of dc.analysis.other) console.log(`DETAIL other d${o.death.day} who=${o.death.who} cause=${o.death.cause} sub=${o.sub}`);
  for (const u of dc.analysis.unknown) console.log(`DETAIL unknown d${u.death.day} who=${u.death.who} cause=${u.death.cause} reason=${u.reason} contexts=${JSON.stringify(u.contexts || null)}`);
}

async function transcriptMode(seedArg) {
  const seed = parseInt(process.env.TRANSCRIPT_SEED || seedArg || '73672', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
  const out = process.env.TRANSCRIPT_OUT || path.join(REPO, 'evidence', '2026-10-25', 'sim-deathcensus-a-sense.txt');
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  process.env.DEATHCENSUS_TRANSCRIPT = '1';
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const dc = row.deathcensus;
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && JSON.stringify(census.deathcensus.deaths) === JSON.stringify(dc.deaths)
    && JSON.stringify((census.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey))
    && JSON.stringify((census.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey))
    && JSON.stringify(census.deathcensus.analysis.byContext) === JSON.stringify(dc.analysis.byContext);
  console.log(`TRANSCRIPT-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} villagerDeaths=${dc.analysis.population.villagerDeaths} byContext=${JSON.stringify(dc.analysis.byContext)}`);
  if (!same) { console.error('TRANSCRIPT REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
  const lines = [];
  lines.push('SENSE TRANSCRIPT — ON THE CENSUS TRAJECTORY (transcript tap, not a narration replay)');
  lines.push(`seed=${seed} policy=tableseat-nowait+deathcensus-diag days=${row.days} gameDays=${row.gameDays} endReason=${row.endReason} censusMatch=${same}`);
  lines.push(`census: villagerDeaths=${dc.analysis.population.villagerDeaths} byContext=${JSON.stringify(dc.analysis.byContext)}`);
  lines.push('');
  const allRows = (store.resolveFights || []).concat(store.directFights || []);
  for (const f of allRows) {
    if (f.outcome !== 'vDie') continue;
    const line = `d${f.day} [${f.context}] ${f.vid} vs ${f.mid} (wave ${f.wave}) rounds=${f.rounds} vHpStartFrac=${f.vHpStartFrac != null ? f.vHpStartFrac.toFixed(2) : null} mHpStartFrac=${f.mHpStartFrac != null ? f.mHpStartFrac.toFixed(2) : null} mDealt=${f.mDealt} vTaken=${f.vTaken} mHpEndFrac=${f.mHpEndFrac != null ? f.mHpEndFrac.toFixed(2) : null} belowLineEnd=${f.belowLineEnd}`;
    console.log('TRANSCRIPT ' + line);
    lines.push(line);
    if (f.awayNewsLast) { console.log('TRANSCRIPT awayNews: ' + f.awayNewsLast); lines.push('  awayNews: ' + f.awayNewsLast); }
    else lines.push('  awayNews: (queue full — line dropped, not invented)');
  }
  for (const a of dc.analysis.attributed) {
    if (a.context === 'tb') {
      const line = `d${a.death.day} [tb] ${a.death.who} cause=${a.death.cause} (tb fighter ended dead; no field row, no awayNews line)`;
      console.log('TRANSCRIPT ' + line);
      lines.push(line);
    }
  }
  writeRowViaWriter(out, lines.join('\n') + '\n');
  console.log(`TRANSCRIPT-DONE seed=${seed} -> ${out}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-25', 'sim-deathcensus-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.DEATHCENSUS = '1';
  const store = newStore();
  const armed = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store);
  const { Game } = await loadGame({ seed, mode: 'deathcensus-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  const scholarId = Game.villagerId || null;
  try { installDeathcensusDiag(Game, store); } catch (e) { /* install best-effort */ }
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) { player = false; }
    return { day: d.day | 0, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player: player };
  });
  const analysis = analyzeDeathcensus(store, deaths, scholarId);
  // Pick the first attributed combat death; print ring lines from its day.
  const pick = analysis.attributed.find(a => a.context === 'raid' || a.context === 'field' || a.context === 'arena' || a.context === 'tb');
  let focusLines = [];
  let focusNote = 'no attributed combat death in this replay';
  if (pick) {
    let vname = pick.death.who;
    try { const p = Game.getPerson ? Game.getPerson(pick.death.who) : null; if (p && p.name) vname = String(p.name).split(' ')[0]; } catch (e) { /* name best-effort */ }
    const mid = (pick.evidence[0] && pick.evidence[0].mid) || '';
    focusLines = ring.filter(s => Math.abs((s.day | 0) - (pick.death.day | 0)) <= 1);
    focusNote = `focus death: d${pick.death.day} who=${pick.death.who} (${vname}) cause=${pick.death.cause} context=${pick.context} mid=${mid} ringLinesAround=${focusLines.length}`;
  }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+deathcensus-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    `replay census: villagerDeaths=${analysis.population.villagerDeaths} byContext=${JSON.stringify(analysis.byContext)}`,
    focusNote,
    '',
  ].join('\n');
  const focusBody = focusLines.map(s => `[d${s.day}] ${s.text}`).join('\n');
  const body = header + '--- ring lines around the focus death (day +- 1) ---\n' + focusBody + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} ${focusNote} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--transcript')) return transcriptMode(args[args.indexOf('--transcript') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('DEATHCENSUS-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter, deathcensusSnapshot };
