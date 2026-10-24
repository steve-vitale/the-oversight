#!/usr/bin/env node
// scripts/test-fullseat-diag-sweep.js — sim-fullseat-diag-a pilot + proof
// gates (scale-onramp axis, 2026-10-24, run fleshout-20261024T2115Z).
//
// QUESTION: on the tableseat band (leanlinkrescue courtship + seat legs, no
// wait), which full-seat component blocks the full seat, and by how far —
// at run end AND at the win (wins truncate the window). The 1955Z round took
// 6 lesser seats and 0 full seats; full-seat reachability is unknown.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, FULLSEAT unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/fullseat-diag.js
//     (FULLSEAT=1). The recorder is PURE-READ: it writes nothing to game
//     state and draws no RNG — so baseline and armed trajectories must be
//     IDENTICAL (G2), and the delta is measurement only.
// fullseat-diag.js is REUSED UNMODIFIED (landed 2026-10-21); no new policy
// file was written because withFullseatDiag composes cleanly on
// tableseat-nowait (delegates when FULLSEAT is unset).
//
// Modes:
//   default: pilot sweep. SEEDS="73641,..." (default 73641-73648), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-fullseat-diag-a (default).
//     Per-config INCREMENTAL corpus writes. Prints a table + verdict.
//     Exit 0 on a completed sweep regardless of DIAG-GO/NO-GO (the verdict
//     is data, not a script failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (SEED env, default 73641):
//     tableseat-nowait vs fullseat-wrapped tableseat-nowait with FULLSEAT
//     unset must match on days/gameDays/ts counters with no _fullseatdiag
//     surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-fullseat-diag-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical — the recorder fires
//     daily everywhere, so any divergence anywhere is a leak.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     endSnap with dist on every row, diag block on every armed row.
//
// Verdict (computed, not asserted): DIAG-GO iff 8/8 armed rows carry an end
// snapshot with per-component distances AND every won armed row carries a
// win snapshot AND G1 passes AND G2 passes AND G3 passes. The cost comparison
// (starvation/median vs baseline) is diagnostic — reported to prove recorder
// neutrality — but any G2 divergence is NO-GO by itself.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withFullseatDiag, snapFullSeat } = require('./policies/fullseat-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const COMP_ORDER = ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage', 'foodDeeds'];
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
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

// distFromSnap: per-component distance vector from a snapFullSeat object
// (end or win), in COMP_ORDER, plus the binding list and worst component.
function distFromSnap(s) {
  if (!s || !s.dist) return null;
  const d = {};
  for (const k of COMP_ORDER) d[k] = (s.dist[k] | 0);
  return { dist: d, binding: (s.binding || []).slice(), worst: s.worst || null, seat: s.seat || 'none', ok: !!s.ok };
}

async function runOne(pid, seed, days, evidDir) {
  // Env pairing: LEANLINKRESCUE=1 + TABLESEATNOWAIT=1 for BOTH arms (the
  // tableseat substrate is shared exactly); FULLSEAT=1 only for armed.
  // Both policy gates read env per daily call, so setting env between
  // configs in one process is safe.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'armed') process.env.FULLSEAT = '1';
  else delete process.env.FULLSEAT;
  const base = pid === 'armed'
    ? withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder')
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'fullseat-diag-' + pid, fullTelemetry: false });
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
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // End snapshot: pure-read, computed AFTER runDays, so it cannot affect
  // the trajectory on either arm.
  let endSnap = null;
  try { endSnap = snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  // Recorder block (armed only): max reach, first-seat days, win snapshot.
  let diag = null;
  if (capturedCtx && capturedCtx._fullseatdiag) {
    const D = capturedCtx._fullseatdiag;
    diag = {
      days: D.days, errs: D.errs, max: D.max,
      bestSeat: D.bestSeat, firstFullSeatDay: D.firstFullSeatDay,
      firstLesserDay: D.firstLesserDay == null ? null : D.firstLesserDay,
      indispEver: !!D.indispEver, firstIndispDay: D.firstIndispDay,
      winDay: D.winDay,
      seats: D.seats,
      sentDay: D.sentDay == null ? null : D.sentDay,
      surgeDay: D.surgeDay == null ? null : D.surgeDay,
      winSnap: D.winSnap ? distFromSnap(D.winSnap) : null,
      winSnapFull: D.winSnap || null,
      firstFullSeatSnap: D.firstFullSeatSnap ? distFromSnap(D.firstFullSeatSnap) : null,
    };
    // Max-reach distances: the closest approach over the whole run (wins
    // truncate, national decays — the end snapshot alone understates reach).
    if (D.max) {
      const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
      const md = {};
      for (const k of ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage']) md[k] = Math.max(0, BARS[k] - (D.max[k] | 0));
      md.foodDeeds = (D.sentDay != null && D.surgeDay != null) ? 0 : 1;
      diag.maxDist = md;
    }
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
  // Win snapshot for the row: armed uses the recorder's win-day snapshot;
  // baseline uses the end snapshot when the run won (the run ends at the
  // win, so end == win there). Non-won rows carry winSnap null.
  const winSnapRow = pid === 'armed'
    ? (diag && diag.winSnap ? diag.winSnap : null)
    : (end.won ? distFromSnap(endSnap) : null);
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
    enteredFull: (endSnap && endSnap.seat === 'full') || (diag && diag.firstFullSeatDay != null) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    endSnap: distFromSnap(endSnap),
    endSnapFull: endSnap,
    winSnap: winSnapRow,
    diag,
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
  // Binding-blocker frequency + median distances (end snapshot).
  const blockCount = {}, endDistLists = {}, maxDistLists = {};
  for (const k of COMP_ORDER) { blockCount[k] = 0; endDistLists[k] = []; maxDistLists[k] = []; }
  for (const r of rs) {
    if (r.endSnap) {
      for (const k of COMP_ORDER) endDistLists[k].push(r.endSnap.dist[k] | 0);
      for (const k of (r.endSnap.binding || [])) if (k in blockCount) blockCount[k]++;
    }
    if (r.diag && r.diag.maxDist) for (const k of COMP_ORDER) maxDistLists[k].push(r.diag.maxDist[k] | 0);
  }
  const medianEndDist = {}, medianMaxDist = {};
  for (const k of COMP_ORDER) {
    medianEndDist[k] = medianOf(endDistLists[k]);
    medianMaxDist[k] = maxDistLists[k].length ? medianOf(maxDistLists[k]) : null;
  }
  const rankedBlockers = COMP_ORDER.map(k => ({ component: k, seedsBlocked: blockCount[k], medianEndDist: medianEndDist[k], medianMaxDist: medianMaxDist[k] }))
    .sort((a, b) => (b.seedsBlocked - a.seedsBlocked) || (b.medianEndDist - a.medianEndDist));
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
    enteredFull: rs.reduce((t, r) => t + r.enteredFull, 0),
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
    blockCount, medianEndDist, medianMaxDist, rankedBlockers,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73641,73642,73643,73644,73645,73646,73647,73648')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-fullseat-diag-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} enteredFull=${row.enteredFull} won=${row.won} starv=${row.starvationDeaths} endSeat=${row.endSnap ? row.endSnap.seat : '?'} endBinding=${row.endSnap ? row.endSnap.binding.join(',') : '?'} endWorst=${row.endSnap ? row.endSnap.worst : '?'} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G2: recorder neutrality — ALL seeds identical days/gameDays/ts/starvation.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    g2.push({ seed, ok, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  // G3: corpus integrity.
  const armedRows = rows.filter(r => r.policy === 'armed');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && r.endSnap.dist)
    && armedRows.length === seeds.length && armedRows.every(r => r.diag && r.diag.days > 0);
  // DIAG-GO inputs.
  const armedEndSnaps = armedRows.every(r => r.endSnap && r.endSnap.dist);
  const armedWinSnaps = armedRows.filter(r => r.won === 1).every(r => r.winSnap && r.winSnap.dist);
  const diagGo = armedEndSnaps && armedWinSnaps && g2Pass && g3Pass;
  const report = {
    label: 'sim-fullseat-diag-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    verdictInputs: { armedEndSnaps, armedWinSnaps, g2Pass, g3Pass },
    verdict: diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff 8/8 armed rows carry an end snapshot with per-component distances AND every won armed row carries a win snapshot AND G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fullseat-diag-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} enteredFull=${b.enteredFull} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
    console.log(`    medianEndDist: ${JSON.stringify(b.medianEndDist)}`);
    console.log(`    rankedBlockers: ${b.rankedBlockers.map(x => `${x.component}:${x.seedsBlocked}(medEnd${x.medianEndDist},medMax${x.medianMaxDist})`).join(' ')}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} (armedEndSnaps ${armedEndSnaps ? 'PASS' : 'FAIL'}; armedWinSnaps ${armedWinSnaps ? 'PASS' : 'FAIL'}; G2 ${g2Pass ? 'PASS' : 'FAIL'}; G3 ${g3Pass ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (FULLSEAT unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73641', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  // Wrapped policy under FULLSEAT-unset env: run the wrapped policy
  // directly (runOne('armed') would set FULLSEAT=1, which is not the gate).
  delete process.env.FULLSEAT;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
  const { Game } = await loadGame({ seed, mode: 'fullseat-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._fullseatdiag);
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(FULLSEAT unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73641', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-fullseat-diag-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  const armed = withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + full-seat recorder');
  const { Game } = await loadGame({ seed, mode: 'fullseat-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+fullseat-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
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
if (require.main === module) main().catch(e => { console.error('FULLSEAT-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
