#!/usr/bin/env node
// scripts/test-rule3trial-a-sweep.js — sim-rule3trial-a screen pilot + proof gates
// (scale-onramp axis, 2026-10-27, run fleshout-20261027T1940Z, sim-rule3trial-a).
//
// Arm: tableseat-trialchase + a DEFIANT-door answer override ONLY (policy
// scripts/policies/tablepaths-trial.js, TABLETRIALDOOR=1), vs
// tableseat-trialchase baseline, on IDENTICAL seeds, death-aware horizon
// 180 loop-days. tableseat-trialchase = tableseat-nowait (leanlinkrescue
// courtship + seat legs, no wait leg) + the trial-chasing player layer
// (extra forage + donate-all on pantry trials, eat L2 plants on identify
// trials); the door rule is tablepaths-defiant's rule verbatim, on the
// trial-chase substrate. Both legs chase trials identically.
// The baseline is THIS arm's own replication (8), never another arm's corpus.
//
// Pairing (exact):
//   baseline = scripts/policies/tableseat-trialchase.js with TABLESEATNOWAIT=1,
//     TRIALCHASE=1, TABLETRIALDOOR unset.
//   armed    = scripts/policies/tablepaths-trial.js with TABLESEATNOWAIT=1,
//     TRIALCHASE=1, TABLETRIALDOOR=1.
// Both share courtship + trial chase exactly; the delta is ONLY the door
// choice at the paths-phase offer (all other phases answer first-option,
// exactly like the baseline).
//
// Modes:
//   default: pilot sweep. SEEDS env (default 77301-77308, the single pilot band), DAYS=180 (default),
//     EVID=evidence/2026-10-27/perseed-rule3trial-a (default).
//     Per-config INCREMENTAL corpus writes (never batch-write at the end).
//     Prints per-path tables + verdict. Exit 0 on a completed sweep
//     regardless of GO/NO-GO (the verdict is data); exit 1 on proof-gate
//     failure (G2 leak or G3 corpus failure).
//   --detgate: G1 delegation proof on one seed (SEED env, default 77301):
//     tableseat-trialchase (TRIALCHASE=1) vs tablepaths-trial with
//     TABLETRIALDOOR unset (TRIALCHASE=1) must match on days/gameDays
//     with no dp counters. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-27/sim-rule3trial-a-sense.txt. SENSE_SEED env
//     overrides the argv seed.
//
// Proof gates (defined in the evidence header BEFORE sweeping):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 door-assignment leak gate: for every pilot seed where NEITHER arm
//     entered the table, days and gameDays must be identical — the door
//     assignment changes NOTHING except the door answered, so any
//     divergence on a non-seated seed is a wrapper leak and NO-GO.
//     (Pre-national subset reported separately: seeds where neither arm
//     ever reached national must also match.)
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     counters object present on every row.
//
// Verdict (computed, not asserted): GO iff BOTH (a) defiant entered on >= 1
// seating (fallback-Feared seatings excluded — they walk feared, so they
// cannot count as defiant entered by construction; the count used is
// enteredPath === 'defiant') AND (b) the deciding cost bar passes
// (starvation armed total <= baseline total + 2 AND arm-only starvation
// <= 2 AND armed median days >= 0.8 x baseline median days).
// If the band produces 0 seatings, the verdict is PILOT-INCONCLUSIVE (not a
// defiant kill, not a GO) — reported as such, never re-scored on another
// band mid-run. The evidence file judges; this script only reports.
// Starvation = death cause matching /starv|hunger/i.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatTrialchase } = require('./policies/tableseat-trialchase');
const { tablepathsTrial } = require('./policies/tablepaths-trial');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
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

// Incremental corpus write via the chunked writer subprocess (read-only
// reuse: it reads stdin only, never the worktree, so its writes survive
// the container's write-flap class). Retries; on total failure the row
// JSON is printed to stdout first so the data is never silently lost.
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
  // Env pairing: TABLESEATNOWAIT=1 + TRIALCHASE=1 for BOTH arms
  // (courtship + seat legs shared exactly); TABLETRIALDOOR=1 only for armed.
  // Both policy gates read env per daily call, so setting env between
  // configs in one process is safe.
  // COURTSHIP ACTIVATION (fix 2026-10-27, after the invalid first sweep):
  // tableseat-nowait MEANS leanlinkrescue courtship + seat legs; the
  // courtship itself gates on LEANLINKRESCUE=1. Omitting it silently
  // runs competent-only (no courtship, no national, no seats) — the
  // first sweep's failure mode. Both legs set it identically.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TRIALCHASE = '1';
  if (pid === 'armed') { process.env.TABLETRIALDOOR = '1'; }
  else { delete process.env.TABLETRIALDOOR; }
  const base = pid === 'armed' ? tablepathsTrial : tableseatTrialchase;
  const { Game } = await loadGame({ seed, mode: 'rule3trial-a-' + pid, fullTelemetry: false });
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
  let tableState = null;
  try { const ts = Game.tableState ? Game.tableState() : null; if (ts) tableState = { path: ts.path || null, branch: ts.branch || null, phase: ts.phase || null, seat: ts.seat || null }; } catch (e) {}
  // Price evidence (best-effort, never a verdict input): the full table
  // state as JSON, truncated, so a defiant walk's paid/tribute/relay-taken
  // fields survive in the corpus row when the engine exposes them.
  let tableFull = null;
  try { const ts = Game.tableState ? Game.tableState() : null; if (ts) tableFull = JSON.stringify(ts).slice(0, 2000); } catch (e) {}
  let progTable = null;
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.table) progTable = JSON.stringify(pg.table).slice(0, 2000); } catch (e) {}
  const ts = {};
  const dp = {};
  const tr = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      else if (k.indexOf('dp') === 0) dp[k] = capturedCtx[k];
      else if (k.indexOf('tr') === 0) tr[k] = capturedCtx[k];
      else if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls' || k === 'forageTrips' || k === 'donated' || k === 'donatedKcal' || k === 'sorted') ctxExtra[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const enteredPath = (tableState && tableState.path) || dp.dpPath || dp.dpDowngrade || null;
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
    enteredPath,
    doorRule: dp.dpRule || null,
    fallbackFeared: (dp.dpFallbackFeared || 0) > 0 ? 1 : 0,
    tableState,
    tableFull,
    progTable,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, dp, tr, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

function perPath(rows, pid, field) {
  const m = {};
  for (const r of rows.filter(r => r.policy === pid)) {
    if (!r[field]) continue;
    const p = r.enteredPath || 'unknown';
    m[p] = (m[p] || 0) + 1;
  }
  return m;
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  const deathTotals = {};
  for (const r of rs) for (const k of Object.keys(r.deaths || {})) deathTotals[k] = (deathTotals[k] || 0) + r.deaths[k];
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
    enteredByPath: perPath(rows, pid, 'entered'),
    wonByPath: perPath(rows.filter(r => r.won), pid, 'entered'),
    defiantEntered: rs.filter(r => r.entered && r.enteredPath === 'defiant').length,
    defiantWon: rs.filter(r => r.won && r.enteredPath === 'defiant').length,
    fallbackNonFeared: rs.filter(r => r.doorRule === 'fallback-non-feared').length,
    fallbackFeared: rs.filter(r => r.fallbackFeared).length,
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    starvationBySeed: starvBySeed,
    deathTotals,
    seatTaken: rs.reduce((t, r) => t + ((r.ts.tsSeatTaken || 0) + (r.dp.dpSeatTaken || 0)), 0),
    seatAttempts: rs.reduce((t, r) => t + ((r.ts.tsSeatAttempts || 0) + (r.dp.dpSeatAttempts || 0)), 0),
    seatFailed: rs.reduce((t, r) => t + ((r.ts.tsSeatFailed || 0) + (r.dp.dpSeatFailed || 0)), 0),
    previewSeen: rs.reduce((t, r) => t + ((r.ts.tsPreviewSeen || 0) + (r.dp.dpPreviewSeen || 0)), 0),
    previewNotReady: rs.reduce((t, r) => t + ((r.ts.tsPreviewNotReady || 0) + (r.dp.dpPreviewNotReady || 0)), 0),
    tableAnswers: rs.reduce((t, r) => t + ((r.ts.tsTableAnswers || 0) + (r.dp.dpTableAnswers || 0)), 0),
    trialsSeen: rs.reduce((t, r) => t + ((r.tr.trTrials || []).length), 0),
    trialsCompleted: rs.reduce((t, r) => t + (r.tr.trCompleted || 0), 0),
    trialsExpired: rs.reduce((t, r) => t + (r.tr.trExpired || 0), 0),
    chasePantryDays: rs.reduce((t, r) => t + (r.tr.trChasePantry || 0), 0),
    chaseIdentifyDays: rs.reduce((t, r) => t + (r.tr.trChaseIdentify || 0), 0),
    eatL2Bites: rs.reduce((t, r) => t + (r.tr.trEatL2Bites || 0), 0),
    courtProposed: rs.reduce((t, r) => t + ((r.ctxExtra || {}).proposedLead || 0), 0),
    courtCounters: rs.reduce((t, r) => t + ((r.ctxExtra || {}).courtCounters || 0), 0),
    courtTended: rs.reduce((t, r) => t + ((r.ctxExtra || {}).tended || 0), 0),
    l2toL3: rs.reduce((t, r) => t + (r.tr.trL2toL3 || 0), 0),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '77301,77302,77303,77304,77305,77306,77307,77308')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-rule3trial-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} enteredPath=${row.enteredPath} doorRule=${row.doorRule} fallbackFeared=${row.fallbackFeared} won=${row.won} starv=${row.starvationDeaths} dp=${JSON.stringify(row.dp)}`);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G2: defiant-assignment leak gate — identical days/gameDays where NEITHER arm entered the table.
  const g2 = [];
  const g2pre = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (c && a && !c.entered && !a.entered) {
      const ok = c.days === a.days && c.gameDays === a.gameDays;
      g2.push({ seed, ok, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
    if (c && a && !c.nationalEver && !a.nationalEver) {
      const ok = c.days === a.days && c.gameDays === a.gameDays;
      g2pre.push({ seed, ok, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  const g2prePass = g2pre.length ? g2pre.every(x => x.ok) : null;
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object' && r.dp && typeof r.dp === 'object' && r.tr && typeof r.tr === 'object');
  // Deciding cost bar (binding, from sim-scalemetric).
  let armOnlyStarv = 0;
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) armOnlyStarv += a.starvationDeaths;
  }
  const defiantEntered = byPolicy.armed.defiantEntered;
  const seatings = byPolicy.armed.entered;
  const primaryPass = defiantEntered >= 1;
  const cost1 = byPolicy.armed.starvationTotal <= byPolicy.baseline.starvationTotal + 2;
  const cost2 = armOnlyStarv <= 2;
  const cost3 = byPolicy.armed.medianDays >= 0.8 * byPolicy.baseline.medianDays;
  const go = primaryPass && cost1 && cost2 && cost3;
  const verdict = seatings === 0 ? 'PILOT-INCONCLUSIVE' : (go ? 'GO' : 'NO-GO');
  const report = {
    label: 'sim-rule3trial-a pilot', seeds, days, rows, byPolicy,
    gates: { g2NonSeatedLeakGate: g2, g2Pass, g2PreNational: g2pre, g2PrePass: g2prePass, g3CorpusIntegrity: g3Pass },
    verdictInputs: { defiantEntered, seatings, primaryPass, costStarvationTotal: cost1, costArmOnlyStarvation: cost2, armOnlyStarvation: armOnlyStarv, costMedianDays: cost3 },
    verdict,
    verdictRule: 'PILOT-INCONCLUSIVE if 0 armed seatings; else GO iff defiant entered >= 1 (fallback-Feared excluded by construction) AND starvationTotal armed <= baseline + 2 AND arm-only starvation <= 2 AND armed medianDays >= 0.8 x baseline medianDays',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-rule3trial-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} enteredByPath=${JSON.stringify(b.enteredByPath)} wonByPath=${JSON.stringify(b.wonByPath)} defiantEntered=${b.defiantEntered} defiantWon=${b.defiantWon} fallbackNonFeared=${b.fallbackNonFeared} fallbackFeared=${b.fallbackFeared} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers} trialsSeen=${b.trialsSeen} trialsCompleted=${b.trialsCompleted} trialsExpired=${b.trialsExpired} courtProposed=${b.courtProposed} courtCounters=${b.courtCounters} courtTended=${b.courtTended} chasePantry=${b.chasePantryDays} chaseIdentify=${b.chaseIdentifyDays} eatL2=${b.eatL2Bites} l2toL3=${b.l2toL3}`);
  }
  console.log(`  arm-only starvation: ${armOnlyStarv}`);
  console.log(`  G2 non-seated leak gate: ${g2Pass === null ? 'n/a (every seed seated in some arm)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G2 pre-national subset: ${g2prePass === null ? 'n/a' : (g2prePass ? 'PASS' : 'FAIL')} (${g2pre.length} seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${report.verdict} (defiantEntered>=1 ${primaryPass ? 'PASS' : 'FAIL'}; cost1 ${cost1 ? 'PASS' : 'FAIL'}; cost2 ${cost2 ? 'PASS' : 'FAIL'}; cost3 ${cost3 ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G-det1 (door-off) + G-det2 (trial-off).');
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '77301', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  // DETGATE 1 (door-off): armed POLICY under baseline-style env:
  // TRIALCHASE=1, TABLETRIALDOOR unset — must delegate to
  // tableseat-trialchase.
  // COURTSHIP ACTIVATION (fix 2026-10-27, after the invalid first sweep):
  // tableseat-nowait MEANS leanlinkrescue courtship + seat legs; the
  // courtship itself gates on LEANLINKRESCUE=1. Omitting it silently
  // runs competent-only (no courtship, no national, no seats) — the
  // first sweep's failure mode. Both legs set it identically.
  process.env.LEANLINKRESCUE = '1';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TRIALCHASE = '1';
  delete process.env.TABLETRIALDOOR;
  const { Game } = await loadGame({ seed, mode: 'rule3trial-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, tablepathsTrial, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return tablepathsTrial.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const dp = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('dp') === 0) dp[k] = capturedCtx[k];
  const ok = c.days === result.days && c.gameDays === result.gameDays && Object.keys(dp).length === 0;
  console.log(`DETGATE-1 seed=${seed} baseline(tableseat-trialchase) days=${c.days} gameDays=${c.gameDays} | armed-door-off(TABLETRIALDOOR unset) days=${result.days} gameDays=${result.gameDays} dp=${JSON.stringify(dp)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
  // DETGATE 2 (trial-off): tableseat-trialchase with TRIALCHASE unset must
  // delegate to tableseat-nowait exactly (TABLESEATNOWAIT=1 both runs).
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  delete process.env.TRIALCHASE;
  delete process.env.TABLETRIALDOOR;
  const g2a = await loadGame({ seed, mode: 'rule3trial-a-detgate2a', fullTelemetry: false });
  await setupGame(g2a.Game);
  let ctxA = null;
  const polA = Object.assign({}, tableseatTrialchase, {
    daily(G, ctx) { if (!ctxA) ctxA = ctx; try { return tableseatTrialchase.daily(G, ctx); } catch (e) {} },
  });
  const resA = await runDays(g2a.Game, polA, { days, manifest: undefined, sampleEvery: 10 });
  const g2b = await loadGame({ seed, mode: 'rule3trial-a-detgate2b', fullTelemetry: false });
  await setupGame(g2b.Game);
  const resB = await runDays(g2b.Game, tableseatNowait, { days, manifest: undefined, sampleEvery: 10 });
  const trA = {};
  if (ctxA) for (const k of Object.keys(ctxA)) if (k.indexOf('tr') === 0) trA[k] = ctxA[k];
  const ok2 = resA.days === resB.days && resA.gameDays === resB.gameDays && Object.keys(trA).length === 0;
  console.log(`DETGATE-2 seed=${seed} trial-off(tableseat-trialchase) days=${resA.days} gameDays=${resA.gameDays} tr=${JSON.stringify(trA)} | tableseat-nowait days=${resB.days} gameDays=${resB.gameDays} -> ${ok2 ? 'PASS' : 'FAIL'}`);
  if (!ok2) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '77301', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-27', 'sim-rule3trial-a-sense.txt');
  // COURTSHIP ACTIVATION (fix 2026-10-27, after the invalid first sweep):
  // tableseat-nowait MEANS leanlinkrescue courtship + seat legs; the
  // courtship itself gates on LEANLINKRESCUE=1. Omitting it silently
  // runs competent-only (no courtship, no national, no seats) — the
  // first sweep's failure mode. Both legs set it identically.
  process.env.LEANLINKRESCUE = '1';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.TRIALCHASE = '1';
  process.env.TABLETRIALDOOR = '1';
  const { Game } = await loadGame({ seed, mode: 'rule3trial-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, tablepathsTrial, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let tableState = null;
  try { const ts = Game.tableState ? Game.tableState() : null; if (ts) tableState = { path: ts.path || null, branch: ts.branch || null }; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tablepaths-trial days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} tablePath=${tableState ? tableState.path : null} tableBranch=${tableState ? tableState.branch : null}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} tablePath=${tableState ? tableState.path : null} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('LOWDEF SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
