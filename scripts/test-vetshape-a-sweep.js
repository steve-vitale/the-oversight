#!/usr/bin/env node
// scripts/test-vetshape-a-sweep.js — sim-vetshape-a pilot + proof
// (scale-onramp axis, 2026-10-24, run fleshout-20261024T2315Z).
//
// QUESTION: is the veterans-bar SHAPE (living-only vs living-or-dead
// killers) the binding constraint on the standing-99 pin? The instrument
// already exists in src/js/standing.js, default OFF: VETSHAPE=1 counts
// DISTINCT killer vids with wave-(w-1)+ kills in state.waveKillLog,
// living-OR-DEAD; unset = pristine living-only behavior. This arm does NOT
// edit standing.js, does NOT move readyDemand numbers, does NOT flip any
// default. Policy-side probe only (env flag + this sweep script).
//
// SUBSTRATE (both columns, identical seeds): tableseat-nowait —
// leanlinkrescue courtship (LEANLINKRESCUE=1) + seat legs only
// (TABLESEATNOWAIT=1), no wait leg. Baseline: VETSHAPE unset. Armed:
// VETSHAPE=1. Both columns wrapped with the standing99-diag recorder
// (STANDING99=1 on both arms) so daily rd4/rd5 readiness + computed gated
// standing are recorded identically in both columns. STANDING99 appears
// nowhere in src/js (recorder-only gate); the diag arm proved that
// recorder neutral on this exact substrate. The ONLY delta between
// columns is therefore VETSHAPE.
//
// NOTE (stated before sweeping): recorder-neutrality does NOT apply here
// — armed intentionally changes gate arithmetic, so baseline vs armed
// trajectory identity is NOT expected and must NOT be claimed.
//
// PRE-REGISTRATION (binding; see evidence/2026-10-24/sim-vetshape-a.md):
//   GO requires BOTH (1) RELEASE: armed releases >= 2 of the 3 end-stuck
//   seeds {73674, 73675, 73677} to wave-4 readiness (rd4 ready on >= 1 day
//   AND gated standing >= 100, or a wave-4 fight recorded — per-seed table
//   reports which criterion fired), vs 0 released among those 3 in the own
//   baseline; AND (2) cost bar: armed starvation total <= baseline + 2,
//   AND armed median days >= 0.8x baseline median days.
//   If (1) fails (0-1 releases) the verdict is NO-GO for the shape lever.
//   Gates: G1 baseline replication vs published diag baseline aggregates
//   (won 4/8, national ever 8/8, final 7/8, wave 4 5/8, wave 5 0/8,
//   starvation 3, median 150, deaths 261); G2 corpus integrity 16/16 rows
//   with rd4/rd5 + gated + wave reach + win/table; G3 det-gate (separate
//   --detgate run): VETSHAPE-unset run through this sweep == unwrapped
//   tableseat-nowait run on one seed (days/counters identical).
//
// Modes:
//   default: pilot sweep. SEEDS (default 73671-73678), DAYS=180 (default),
//     EVID=evidence/2026-10-24/perseed-vetshape-a (default). Per-config
//     INCREMENTAL corpus writes. Prints a table + verdict. Exit 0 on a
//     completed sweep regardless of GO/NO-GO (the verdict is data, not a
//     script failure); exit 1 on proof-gate failure (G1/G2/G3 handled:
//     G1/G2 checked in sweep mode, G3 in --detgate mode).
//   --detgate: G3 on one seed (SEED env, default 73671): sweep-script run
//     (recorder wrapped, VETSHAPE unset) vs unwrapped tableseat-nowait
//     must match on days/gameDays/ts counters. Recorder surface is
//     present by design in the wrapped run (pure-read); the comparison is
//     days/counters, not trajectory absence. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-vetshape-a-sense.txt.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withStanding99Diag, snapStanding } = require('./policies/standing99-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const STUCK_SEEDS = [73674, 73675, 73677];
const PUBLISHED_BASELINE = { won: 4, nationalEver: 8, nationalFinal: 7, wave4: 5, wave5: 0, starvationTotal: 3, medianDays: 150, deaths: 261 };
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

// releaseFromTraj(traj, waveReach): the pre-registered release test.
// released = (rd4 ready on >= 1 day AND max gated >= 100) OR wave-4
// recorded (waveReach >= 4 or a trajectory point with unlockedWave >= 4).
// criterion names which fired: 'ready+gated' | 'wave4' | 'none'.
// Exported for scripts/test-vetshape-a.js (synthetic-row proof).
function releaseFromTraj(traj, waveReach) {
  let rd4ReadyEver = false, rd4FirstReadyDay = null, rd5ReadyEver = false;
  let maxGated = null, maxGatedDay = null, maxUnlockedWave = 0;
  let maxRd4Veterans = null, maxRd5Veterans = null;
  for (const p of (traj || [])) {
    if (p.rd4) {
      if (p.rd4.ready && !rd4ReadyEver) { rd4ReadyEver = true; rd4FirstReadyDay = p.day; }
      if (maxRd4Veterans === null || (p.rd4.veterans | 0) > maxRd4Veterans) maxRd4Veterans = p.rd4.veterans | 0;
    }
    if (p.rd5) {
      if (p.rd5.ready) rd5ReadyEver = true;
      if (maxRd5Veterans === null || (p.rd5.veterans | 0) > maxRd5Veterans) maxRd5Veterans = p.rd5.veterans | 0;
    }
    if (typeof p.gated === 'number' && (maxGated === null || p.gated > maxGated)) { maxGated = p.gated; maxGatedDay = p.day; }
    if ((p.unlockedWave | 0) > maxUnlockedWave) maxUnlockedWave = p.unlockedWave | 0;
  }
  const wave4Recorded = ((waveReach | 0) >= 4) || maxUnlockedWave >= 4;
  const readyGated = rd4ReadyEver && (maxGated !== null && maxGated >= 100);
  const released = !!(readyGated || wave4Recorded);
  const criterion = readyGated ? 'ready+gated' : (wave4Recorded ? 'wave4' : 'none');
  return { released, criterion, rd4ReadyEver, rd4FirstReadyDay, rd5ReadyEver, maxGated, maxGatedDay, maxUnlockedWave, maxRd4Veterans, maxRd5Veterans, wave4Recorded };
}

// costBarPass(baselineAgg, armedAgg): the pre-registered deciding cost bar.
function costBarPass(b, a) {
  return {
    starvationOk: (a.starvationTotal <= b.starvationTotal + 2),
    medianOk: (a.medianDays >= 0.8 * b.medianDays),
    pass: (a.starvationTotal <= b.starvationTotal + 2) && (a.medianDays >= 0.8 * b.medianDays),
  };
}

// killLedger(Game): post-run PURE READ of state.waveKillLog — distinct
// killer vids at wave 3+ / 4+, split living vs dead. The scholar counts as
// living (standing.js isLiving). Read after runDays only, so it cannot
// affect any trajectory. Answers directly: did DEAD killers exist?
function killLedger(Game) {
  const out = { w3: { living: 0, dead: 0, livingVids: [], deadVids: [] }, w4: { living: 0, dead: 0, livingVids: [], deadVids: [] }, error: null };
  try {
    const log = ((Game.state || {}).waveKillLog) || [];
    const sid = Game.villagerId;
    const seen3L = new Set(), seen3D = new Set(), seen4L = new Set(), seen4D = new Set();
    for (const e of log) {
      if (!e || !e.by) continue;
      let living = true;
      if (e.by !== sid) {
        try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(e.by) : null; living = !!(vp && !vp.dead); }
        catch (err) { living = false; }
      }
      if ((e.w | 0) >= 3) (living ? seen3L : seen3D).add(e.by);
      if ((e.w | 0) >= 4) (living ? seen4L : seen4D).add(e.by);
    }
    out.w3 = { living: seen3L.size, dead: seen3D.size, livingVids: Array.from(seen3L), deadVids: Array.from(seen3D) };
    out.w4 = { living: seen4L.size, dead: seen4D.size, livingVids: Array.from(seen4L), deadVids: Array.from(seen4D) };
  } catch (e) { out.error = String((e && e.message) || e).slice(0, 120); }
  return out;
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

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.STANDING99 = '1'; // recorder on BOTH arms (pure-read; see header)
  if (pid === 'armed') process.env.VETSHAPE = '1';
  else delete process.env.VETSHAPE;
  const base = withStanding99Diag(tableseatNowait, 'standing99-diag', 'tableseat-nowait + standing-trajectory recorder');
  const { Game } = await loadGame({ seed, mode: 'vetshape-a-' + pid, fullTelemetry: false });
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
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) { /* delegate best-effort */ } }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  let endPoint = null;
  try { endPoint = snapStanding(Game); } catch (e) { endPoint = { error: String((e && e.message) || e).slice(0, 120) }; }
  let validation = null;
  try {
    const engineGated = (typeof Game.villageStandingTotal === 'function') ? (Game.villageStandingTotal() | 0) : null;
    validation = { engineGated, computedGated: endPoint ? (endPoint.gated | 0) : null, match: engineGated === (endPoint ? (endPoint.gated | 0) : null) };
  } catch (e) { validation = { error: String((e && e.message) || e).slice(0, 120) }; }
  const ledger = killLedger(Game);
  let diag = null;
  if (capturedCtx && capturedCtx._standing99diag) {
    const D = capturedCtx._standing99diag;
    const lastTraj = D.traj.length ? D.traj[D.traj.length - 1] : null;
    diag = {
      days: D.days, errs: D.errs, traj: D.traj,
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
  const release = diag ? releaseFromTraj(diag.traj, result.maxWaveUnlocked || 1) : null;
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
    endPoint, validation, diag, release, killLedger: ledger,
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
  const deathCause = {};
  for (const r of rs) for (const k of Object.keys(r.deaths || {})) deathCause[k] = (deathCause[k] || 0) + r.deaths[k];
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
    deathsTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    deathCause: deathCause,
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
    releases: rs.filter(r => r.release && r.release.released).map(r => ({ seed: r.seed, criterion: r.release.criterion })),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetshape-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const rel = row.release || {};
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} endGated=${row.endPoint ? row.endPoint.gated : '?'} endRaw=${row.endPoint ? row.endPoint.raw : '?'} endHold=${row.endPoint ? row.endPoint.holdKind : '?'} validMatch=${row.validation ? row.validation.match : '?'} released=${rel.released} crit=${rel.criterion} rd4ReadyEver=${rel.rd4ReadyEver} rd4FirstDay=${rel.rd4FirstReadyDay} maxGated=${rel.maxGated} maxRd4Vet=${rel.maxRd4Veterans} ledgerW3=L${row.killLedger.w3.living}/D${row.killLedger.w3.dead} ledgerW4=L${row.killLedger.w4.living}/D${row.killLedger.w4.dead} ts=${JSON.stringify(row.ts)}`);
      rows.push(row);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G1 baseline replication vs published diag baseline aggregates.
  const b = byPolicy.baseline;
  const g1 = {
    won: b.won === PUBLISHED_BASELINE.won, nationalEver: b.nationalEver === PUBLISHED_BASELINE.nationalEver,
    nationalFinal: b.nationalFinal === PUBLISHED_BASELINE.nationalFinal, wave4: b.wave4 === PUBLISHED_BASELINE.wave4,
    wave5: b.wave5 === PUBLISHED_BASELINE.wave5, starvationTotal: b.starvationTotal === PUBLISHED_BASELINE.starvationTotal,
    medianDays: b.medianDays === PUBLISHED_BASELINE.medianDays, deaths: b.deathsTotal === PUBLISHED_BASELINE.deaths,
  };
  const g1Pass = Object.values(g1).every(Boolean);
  // G2 corpus integrity.
  const g2Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endPoint && typeof r.endPoint.gated === 'number' && r.diag && r.diag.traj.length > 0 && r.release);
  const validationPass = rows.every(r => r.validation && r.validation.match === true);
  // Pre-registered GO: release >= 2 of the 3 stuck seeds in armed, 0 in baseline, AND cost bar.
  const baseReleased = STUCK_SEEDS.filter(s => { const r = rows.find(x => x.policy === 'baseline' && x.seed === s); return r && r.release && r.release.released; });
  const armedReleased = STUCK_SEEDS.filter(s => { const r = rows.find(x => x.policy === 'armed' && x.seed === s); return r && r.release && r.release.released; });
  const releasePass = armedReleased.length >= 2 && baseReleased.length === 0;
  const cost = costBarPass(byPolicy.baseline, byPolicy.armed);
  const go = releasePass && cost.pass;
  const report = {
    label: 'sim-vetshape-a pilot', seeds, days, rows, byPolicy,
    gates: { g1BaselineReplication: g1, g1Pass, g2CorpusIntegrity: g2Pass, engineGatedValidation: validationPass },
    verdictInputs: { stuckSeeds: STUCK_SEEDS, baseReleased, armedReleased, releasePass, costBar: cost },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff armed releases >= 2 of {73674,73675,73677} AND baseline releases 0 of them AND cost bar passes (armed starvation <= baseline + 2 AND armed median days >= 0.8x baseline median). GO means GO CANDIDATE as a default-OFF instrument only.',
    publishedBaseline: PUBLISHED_BASELINE,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-vetshape-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const x = byPolicy[pid];
    console.log(`  ${pid}: n=${x.n} won=${x.won} medD=${x.medianDays} medGameD=${x.medianGameDays} maxD=${x.maxDays} natEver=${x.nationalEver} natFinal=${x.nationalFinal} table=${x.table} entered=${x.entered} wave4=${x.wave4} wave5=${x.wave5} maxArc=${x.maxArc} starvTotal=${x.starvationTotal} deaths=${x.deathsTotal} seatAttempts=${x.seatAttempts} seatTaken=${x.seatTaken} releases=${JSON.stringify(x.releases)}`);
  }
  console.log(`  G1 baseline replication: ${g1Pass ? 'PASS' : 'FAIL'} ${JSON.stringify(g1)}`);
  console.log(`  G2 corpus integrity: ${g2Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Engine-gated validation: ${validationPass ? 'PASS' : 'FAIL'} (${rows.filter(r => r.validation && r.validation.match).length}/${rows.length} rows)`);
  console.log(`  RELEASE: baseline ${baseReleased.length}/3 ${JSON.stringify(baseReleased)} | armed ${armedReleased.length}/3 ${JSON.stringify(armedReleased)} -> releasePass=${releasePass}`);
  console.log(`  COST BAR: ${JSON.stringify(cost)}`);
  console.log(`  VERDICT: ${report.verdict} -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G3 (VETSHAPE-unset sweep-script run vs unwrapped tableseat-nowait).');
  if (!g1Pass || !g2Pass) { console.error('PROOF GATE FAILURE (G1/G2)'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.VETSHAPE;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'vetshape-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return tableseatNowait.daily(G, ctx); } catch (e) { /* delegate best-effort */ }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts);
  console.log(`DETGATE seed=${seed} sweep-script(VETSHAPE unset, recorder wrapped) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | unwrapped(tableseat-nowait) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-vetshape-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.STANDING99 = '1';
  process.env.VETSHAPE = '1';
  const armed = withStanding99Diag(tableseatNowait, 'standing99-diag', 'tableseat-nowait + standing-trajectory recorder');
  const { Game } = await loadGame({ seed, mode: 'vetshape-a-sense', fullTelemetry: false, narration: true });
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
    `seed=${seed} policy=tableseat-nowait+VETSHAPE=1 days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
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
if (require.main === module) main().catch(e => { console.error('VETSHAPE-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, releaseFromTraj, costBarPass, killLedger, writeRowViaWriter };
