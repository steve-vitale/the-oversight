#!/usr/bin/env node
// scripts/test-standing99-diag-sweep.js — sim-standing99-diag-a pilot + proof
// gates (scale-onramp axis, 2026-10-24, run fleshout-20261024T2215Z).
//
// QUESTION: decompose the standing-99 pin and the wave-5 unlock block on
// the tableseat-nowait substrate. The prior run (sim-fullseat-diag-a,
// 73641-73648) found 4 seeds pinned at standing exactly 99, standing max
// 172, wave-5 fights 0/8 — and reported hold kind `below-bar` everywhere,
// even though its own corpus shows gated < raw on pinned seeds (raw 102 and
// 182 vs gated 99). Per src/js/standing.js, villageStandingTotal() clamps
// the gated total to t4-1 = 99 while the wave-4 readiness bar is unmet
// (defer4 hold). This sweep tests, from DAILY TRAJECTORIES (not code
// reading alone), whether 99 is a cap, a decay equilibrium, or a hold —
// and which readiness bar never clears.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, STANDING99 unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     standing99-diag.js (STANDING99=1). The recorder is PURE-READ and
//     never calls villageStandingTotal() during a run (that function has
//     side effects: peak release + hold beats); it computes the gated
//     total from pure reads and validates against the engine's gated
//     total only AFTER runDays. So baseline and armed trajectories must
//     be IDENTICAL (G2).
//
// fullseat-diag.js is NOT reused here, deliberately and documented in
// evidence/2026-10-24/sim-standing99-diag-a.md: it stores no trajectory,
// records no wave-4 readiness bars, and its hold inference omits defer4
// (the mechanism under test) — wrapping it would mislabel the pin again.
//
// Modes:
//   default: pilot sweep. SEEDS="73671,..." (default 73671-73678), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-standing99-diag-a
//     (default). Per-config INCREMENTAL corpus writes. Prints a table +
//     verdict. Exit 0 on a completed sweep regardless of DIAG-GO/NO-GO
//     (the verdict is data, not a script failure); exit 1 on proof-gate
//     failure (G2/G3).
//   --detgate: G1 delegation proof on one seed (SEED env, default 73671):
//     tableseat-nowait vs standing99-wrapped tableseat-nowait with
//     STANDING99 unset must match on days/gameDays/ts counters with no
//     _standing99diag surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-standing99-diag-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     every armed row carries a full trajectory + pin analysis + end
//     snapshot, every baseline row carries a post-run end snapshot.
//   DIAG-GO inputs: 8/8 armed analyses present (a non-pinned seed's
//     analysis is a complete analysis with pinned=false — the measurement
//     succeeding does not require the phenomenon to occur) AND G1 AND G2
//     AND G3.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withStanding99Diag, snapStanding, analyzeTrajectory } = require('./policies/standing99-diag');
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

// Incremental corpus write via the chunked writer subprocess (the
// tableseat-nowait precedent — a sweep killed mid-run must not lose
// completed configs). Retries; on total failure the row JSON is printed
// to stdout first so the data is never silently lost.
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

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'armed') process.env.STANDING99 = '1';
  else delete process.env.STANDING99;
  const base = pid === 'armed'
    ? withStanding99Diag(tableseatNowait, 'standing99-diag', 'tableseat-nowait + standing-trajectory recorder')
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'standing99-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
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
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort, as in the prior sweep */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // End snapshot: pure-read, computed AFTER runDays, so it cannot affect
  // the trajectory on either arm. For armed rows it must equal the last
  // trajectory point (checked in the row as endMatchesTraj).
  let endPoint = null;
  try { endPoint = snapStanding(Game); } catch (e) { endPoint = { error: String((e && e.message) || e).slice(0, 120) }; }
  // Engine-gated validation: AFTER the end snapshot, call the engine's
  // gated total once and compare with the computed gated total. This
  // call happens after the run ends, so its side effects (peak release,
  // hold beats) cannot affect any trajectory. Recorded, never used to
  // overwrite the computed value.
  let validation = null;
  try {
    const engineGated = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null;
    validation = { engineGated, computedGated: endPoint ? (endPoint.gated | 0) : null, match: engineGated === (endPoint ? (endPoint.gated | 0) : null) };
  } catch (e) { validation = { error: String((e && e.message) || e).slice(0, 120) }; }
  let diag = null;
  if (capturedCtx && capturedCtx._standing99diag) {
    const D = capturedCtx._standing99diag;
    const analysis = analyzeTrajectory(D.traj);
    const lastTraj = D.traj.length ? D.traj[D.traj.length - 1] : null;
    diag = {
      days: D.days, errs: D.errs, traj: D.traj, analysis,
      endMatchesTraj: !!(lastTraj && endPoint && lastTraj.gated === endPoint.gated && lastTraj.raw === endPoint.raw),
    };
  }
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
    endPoint, validation, diag,
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
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-standing99-diag-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const a = row.diag && row.diag.analysis;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} endGated=${row.endPoint ? row.endPoint.gated : '?'} endRaw=${row.endPoint ? row.endPoint.raw : '?'} endHold=${row.endPoint ? row.endPoint.holdKind : '?'} validMatch=${row.validation ? row.validation.match : '?'}${a ? ` pin=${a.pinned ? ('day' + a.firstPinDay + '/' + a.daysPinned + 'd') : 'none'} maxRaw=${a.maxRaw.raw} maxCapped=${a.maxCapped.capped} t5dist=${a.t5Approach.distToT5}` : ''} ts=${JSON.stringify(row.ts)}`);
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
    g2.push({ seed, ok, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endPoint && typeof r.endPoint.gated === 'number')
    && armedRows.length === seeds.length && armedRows.every(r => r.diag && r.diag.analysis && r.diag.traj.length > 0);
  const armedAnalyses = armedRows.every(r => r.diag && r.diag.analysis);
  const validationPass = rows.every(r => r.validation && r.validation.match === true);
  const diagGo = armedAnalyses && g2Pass && g3Pass;
  const report = {
    label: 'sim-standing99-diag-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, engineGatedValidation: validationPass },
    verdictInputs: { armedAnalyses, g2Pass, g3Pass, validationPass },
    verdict: diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff 8/8 armed rows carry a complete pin analysis AND G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes. Engine-gated validation is reported, not gating, because it runs after runDays.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-standing99-diag-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Engine-gated validation (computed == engine at end): ${validationPass ? 'PASS' : 'FAIL'} (${rows.filter(r => r.validation && r.validation.match).length}/${rows.length} rows)`);
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} (armedAnalyses ${armedAnalyses ? 'PASS' : 'FAIL'}; G2 ${g2Pass ? 'PASS' : 'FAIL'}; G3 ${g3Pass ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (STANDING99 unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.STANDING99;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withStanding99Diag(tableseatNowait, 'standing99-diag', 'tableseat-nowait + standing-trajectory recorder');
  const { Game } = await loadGame({ seed, mode: 'standing99-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._standing99diag);
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(STANDING99 unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-standing99-diag-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.STANDING99 = '1';
  const armed = withStanding99Diag(tableseatNowait, 'standing99-diag', 'tableseat-nowait + standing-trajectory recorder');
  const { Game } = await loadGame({ seed, mode: 'standing99-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+standing99-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('STANDING99-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter };
