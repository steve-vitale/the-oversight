#!/usr/bin/env node
// scripts/test-encounter-diag-sweep.js — sim-encounter-a pilot + proof
// gates (scale-onramp axis, 2026-10-24, the named next blank (1) from
// sim-vetkill-a: the NEVER-KILLED group's encounter/kill opportunity).
//
// QUESTION: vetkill-a proved seeds 73674/73675/73677 never killed a
// wave-3+ monster (0 wave-3+ entries in the waveKillLog) and 73674 never
// left wave 2 — but a zero kill count cannot say whether the village
// never FACED a wave-3+ monster, faced one and never fought it, or
// fought and lost/fled. This sweep records spawns, fights, and outcomes
// (scripts/policies/encounter-diag.js) on the SAME seeds and substrate
// and classifies each focus seed.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, ENCOUNTER unset). Post-run rows carry a
//     pure-read encounter SNAPSHOT only (deed feed, kill log, ledger
//     gate, live world) — no event lists, by construction.
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     encounter-diag.js (ENCOUNTER=1): daily pure-read snapshots PLUS
//     record-after-delegate wraps on spawnWorldMonster / fieldFight /
//     tbEnd. The wraps write nothing to game state and draw no RNG, so
//     baseline and armed runs must be IDENTICAL (G2).
//
// Modes:
//   default: pilot sweep. SEEDS (default 73671-73678), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-encounter-a (default).
//     Per-config INCREMENTAL corpus writes. Exit 0 on a completed sweep
//     regardless of DIAG-GO/NO-GO (the verdict is data); exit 1 on
//     proof-gate failure (G2/G3).
//   --detgate: G1 delegation proof on one seed (SEED env, default 73671):
//     tableseat-nowait vs encounter-wrapped tableseat-nowait with
//     ENCOUNTER unset must match on days/gameDays/ts counters with no
//     _encounterdiag surface and no installed wraps. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-encounter-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     every armed row carries the encounter classification + per-wave
//     encounter/fight/outcome counts, every baseline row carries a
//     post-run pure-read encounter snapshot.
//   G4 classification completeness: EACH focus seed 73674/73675/73677
//     carries a specific evidenced label (NEVER-FACED / FACED-LOST /
//     FACED-FLED / FACED-UNFOUGHT / FACED-DROVE-OFF / FACED-KILLED);
//     UNCLASSIFIED fails G4 for that seed. (73676 reported too.)
// The classification verdict itself is a FINDING, not a pass/fail.
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
  newStore, installEncounterDiag, withEncounterDiag, recordDaily,
  copyWavesFaced, ledgerGate, copyWorldMonsters, classifyEncounters,
} = require('./policies/encounter-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const FOCUS_SEEDS = [73674, 73675, 73677];
const FOCUS_EXTRA = [73676];
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

// encounterSnapshot(Game, store): post-run pure-read encounter state.
// For armed runs, store carries the event lists and this returns the
// full classification; for baseline runs, store is null and this returns
// the snapshot only (events unavailable by construction).
function encounterSnapshot(Game, store) {
  const faced = copyWavesFaced(Game);
  const log = copyKillLog(Game);
  const gate = ledgerGate(Game);
  const world = copyWorldMonsters(Game);
  let perType2 = null;
  try {
    const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : null;
    if (L && L[2]) perType2 = { points: L[2].points | 0, perType: Object.assign({}, L[2].perType || {}), perTypeX: Object.assign({}, L[2].perTypeX || {}) };
  } catch (e) { perType2 = null; }
  let dailyGate = null;
  if (store && store.daily.length) {
    const gated = store.daily.filter(p => p.ledger && p.ledger.w3gate);
    const pts2 = store.daily.map(p => (p.ledger && p.ledger.pts2 != null ? p.ledger.pts2 : 0));
    dailyGate = {
      nPoints: store.daily.length,
      firstW3GateDay: gated.length ? gated[0].day : null,
      maxPts2: Math.max.apply(null, pts2.concat([0])),
      endPts2: pts2.length ? pts2[pts2.length - 1] : null,
      errs: store.daily.reduce((t, p) => t + (p.errs | 0), 0),
    };
  }
  const snapOut = {
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
    gateEnd: { day: gate.day, pts1: gate.pts1, pts2: gate.pts2, bar2: gate.bar2, dayFloor: gate.dayFloor, w3gate: gate.w3gate },
    perType2, worldEnd: world.monsters, worldErrs: world.errs,
    dailyGate,
  };
  if (!store) { snapOut.classification = null; snapOut.classificationNote = 'snapshot-only: no event lists on the baseline arm'; return snapOut; }
  const defById = {};
  try { for (const m of (Game.data && Game.data.monsters) || []) if (m && m.id) defById[m.id] = m.wave | 0; } catch (e) { /* def map best-effort */ }
  const waveOf = (mid) => {
    if (mid && defById[mid] != null) return defById[mid];
    if (mid && faced.faced[mid] != null) return faced.faced[mid] | 0;
    return 1;
  };
  snapOut.classification = classifyEncounters({
    spawns: store.spawns, fieldFights: store.fieldFights, tbFights: store.tbFights,
    faced: faced.faced, killEntries: log.entries, waveOf,
  });
  snapOut.events = {
    spawns: store.spawns.length, fieldFights: store.fieldFights.length, tbFights: store.tbFights.length,
    errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed,
  };
  return snapOut;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let store = null;
  if (pid === 'armed') { process.env.ENCOUNTER = '1'; store = newStore(); if (storeHolder) storeHolder.store = store; }
  else delete process.env.ENCOUNTER;
  const base = pid === 'armed'
    ? withEncounterDiag(tableseatNowait, 'encounter-diag', 'tableseat-nowait + wave-3 encounter recorder', store)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'encounter-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  // Pre-install LAYER 2 before runDays so day-1 fights (which run before
  // the first policy.daily) are observed too. Idempotent with the daily
  // hook's own install call (same store).
  if (pid === 'armed') { try { installEncounterDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ } }
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
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort, as in the vetkill sweep */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const enc = encounterSnapshot(Game, store);
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
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
    encounter: enc,
    diag: store ? { dailyPoints: store.daily.length, errs: store.errs, overflow: store.overflow } : null,
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
  const encAgg = { spawnsW3: 0, fieldFightsW3: 0, tbFightsW3: 0, facedTypesW3: 0, killsW3: 0 };
  for (const r of rs) {
    const c = r.encounter && r.encounter.classification;
    if (c) { encAgg.spawnsW3 += c.counts.spawnsW3; encAgg.fieldFightsW3 += c.counts.fieldFightsW3; encAgg.tbFightsW3 += c.counts.tbFightsW3; encAgg.facedTypesW3 += c.counts.facedTypesW3; encAgg.killsW3 += c.counts.killsW3; }
  }
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
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
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
    encounter: encAgg,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-encounter-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const c = row.encounter.classification;
      const dg = row.encounter.dailyGate;
      const line = c
        ? `label=${c.label} spawnsW3=${c.counts.spawnsW3} ffW3=${c.counts.fieldFightsW3} tbW3=${c.counts.tbFightsW3} facedW3=${c.counts.facedTypesW3} killsW3=${c.counts.killsW3} firstSpawnW3=${c.spawnFirstDayW3} firstFightW3=${c.fightFirstDayW3} outcomes=${JSON.stringify(c.outcomeCounts)}`
        : `snapshot-only facedW3=${Object.keys(row.encounter.faced || {}).filter(m => (row.encounter.faced[m] | 0) >= 3).length} killsW3=${(row.encounter.logEntries || []).filter(e => (e.w | 0) >= 3).length}`;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} gateEndPts2=${row.encounter.gateEnd.pts2} gateEndW3=${row.encounter.gateEnd.w3gate}${dg ? ` firstGateDay=${dg.firstW3GateDay} maxPts2=${dg.maxPts2}` : ''} ${line} ts=${JSON.stringify(row.ts)}`);
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
    // Snapshot agreement (reported alongside G2, not part of the gate):
    const facedOk = !!c && !!a && JSON.stringify(c.encounter.faced) === JSON.stringify(a.encounter.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.encounter.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.encounter.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.encounter && r.encounter.faced && r.encounter.logEntries)
    && armedRows.length === seeds.length && armedRows.every(r => r.encounter.classification && r.encounter.classification.counts)
    && baselineRows.length === seeds.length && baselineRows.every(r => r.encounter.classification === null && r.encounter.classificationNote);
  const focusRows = armedRows.filter(r => FOCUS_SEEDS.indexOf(r.seed) >= 0);
  const focusClassified = focusRows.map(r => ({ seed: r.seed, label: r.encounter.classification.label, reason: r.encounter.classification.reason }));
  const focusPass = focusRows.length === FOCUS_SEEDS.length && focusClassified.every(f => f.label !== 'UNCLASSIFIED');
  const extraRows = armedRows.filter(r => FOCUS_EXTRA.indexOf(r.seed) >= 0);
  const extraClassified = extraRows.map(r => ({ seed: r.seed, label: r.encounter.classification.label, reason: r.encounter.classification.reason }));
  const diagGoInputs = g2Pass && g3Pass && focusPass;
  const report = {
    label: 'sim-encounter-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, focusClassified, focusPass, extraClassified },
    verdictInputs: { g2Pass, g3Pass, focusPass },
    verdict: diagGoInputs ? 'DIAG-GO-INPUTS' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes AND focus seeds 73674/73675/73677 each carry a specific evidenced label (not UNCLASSIFIED). The classification verdict itself is a finding, not a pass/fail.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-encounter-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers} enc=${JSON.stringify(b.encounter)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Focus classification: ${focusPass ? 'PASS' : 'FAIL'} ${JSON.stringify(focusClassified)}`);
  console.log(`  Extra (73676): ${JSON.stringify(extraClassified)}`);
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (ENCOUNTER unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.ENCOUNTER;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withEncounterDiag(tableseatNowait, 'encounter-diag', 'tableseat-nowait + wave-3 encounter recorder');
  const { Game } = await loadGame({ seed, mode: 'encounter-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._encounterdiag);
  const wrapsInstalled = !!Game._encounterDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(ENCOUNTER unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  // --detail SEED: re-run the armed arm on ONE seed and dump its
  // wave-3+ fight/spawn rows (the census rows carry counts only, not
  // rows). Reproduction check: days/gameDays/ts/classification counts
  // must equal the census row for that seed, else exit 1 — the detail
  // rows then describe the same trajectory, not a different run.
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-encounter-a');
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const c = row.encounter.classification;
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && census.encounter.classification.counts.spawnsW3 === c.counts.spawnsW3
    && census.encounter.classification.counts.fieldFightsW3 === c.counts.fieldFightsW3
    && census.encounter.classification.counts.tbFightsW3 === c.counts.tbFightsW3
    && census.encounter.classification.counts.killsW3 === c.counts.killsW3;
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} label=${c.label} reason=${c.reason}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
  console.log(`DETAIL label=${c.label} spawnsW3=${c.counts.spawnsW3} ffW3=${c.counts.fieldFightsW3} tbW3=${c.counts.tbFightsW3} facedW3=${c.counts.facedTypesW3} killsW3=${c.counts.killsW3}`);
  const defById = {};
  for (const mid of Object.keys(row.encounter.faced || {})) defById[mid] = row.encounter.faced[mid] | 0;
  const waveOf = (mid) => (defById[mid] != null ? defById[mid] : 1);
  console.log('DETAIL tbFightsW3:');
  for (const t of store.tbFights) {
    if (!t.monsterIds.some(mid => (waveOf(mid) | 0) >= 3)) continue;
    console.log(`DETAIL tb d${t.day} result=${t.result} mids=${t.monsterIds.join(',')} waves=${t.monsterIds.map(waveOf).join(',')} party=${t.villagerIds.join(',') || '-'} scholarIn=${t.scholarIn} arena=${t.arena}`);
  }
  console.log('DETAIL fieldFightsW3:');
  for (const f of store.fieldFights) {
    if ((f.wave | 0) < 3) continue;
    console.log(`DETAIL ff d${f.day} vid=${f.vid} mid=${f.mid} outcome=${f.outcome} rounds=${f.rounds} vHpLeft=${f.vHpLeft} mHpLeft=${f.mHpLeft} ally=${f.allyVid || '-'} help=${f.calledHelp} intent=${f.intent} hasRng=${f.hasRng}`);
  }
  console.log('DETAIL spawnsW3:');
  for (const s of store.spawns) {
    if ((s.wave | 0) < 3) continue;
    console.log(`DETAIL spawn d${s.day} mid=${s.mid} wave=${s.wave} tile=${s.tx},${s.ty} veteran=${s.veteran}`);
  }
  console.log('DETAIL killsW3:');
  for (const e of row.encounter.logEntries) {
    if ((e.w | 0) >= 3) console.log(`DETAIL kill d${e.d} mid=${e.mid} w=${e.w} by=${e.by} via=${e.via} trick=${e.trick}`);
  }
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-encounter-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.ENCOUNTER = '1';
  const store = newStore();
  const armed = withEncounterDiag(tableseatNowait, 'encounter-diag', 'tableseat-nowait + wave-3 encounter recorder', store);
  const { Game } = await loadGame({ seed, mode: 'encounter-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installEncounterDiag(Game, store); } catch (e) { /* install best-effort */ }
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  let encLine = 'encounter: unavailable';
  try {
    const enc = encounterSnapshot(Game, store);
    const c = enc.classification;
    encLine = `encounter: label=${c.label} reason=${c.reason} spawnsW3=${c.counts.spawnsW3} ffW3=${c.counts.fieldFightsW3} tbW3=${c.counts.tbFightsW3} facedW3=${c.counts.facedTypesW3} killsW3=${c.counts.killsW3} outcomes=${JSON.stringify(c.outcomeCounts)} unfoughtTypes=${JSON.stringify(c.unfoughtSpawnTypes)} foughtTypes=${JSON.stringify(c.foughtTypes)} gateEndPts2=${enc.gateEnd.pts2} gateEndW3=${enc.gateEnd.w3gate} firstGateDay=${enc.dailyGate ? enc.dailyGate.firstW3GateDay : null} maxPts2=${enc.dailyGate ? enc.dailyGate.maxPts2 : null} perType2=${JSON.stringify(enc.perType2)}`;
  } catch (e) { encLine = 'encounter error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+encounter-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    encLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('ENCOUNTER-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter, encounterSnapshot };
