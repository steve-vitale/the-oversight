#!/usr/bin/env node
// scripts/test-tableseat-nowait-sweep.js — sim-tableseat-nowait-a pilot +
// proof gates (scale-onramp axis, 2026-10-24, run fleshout-20261024T1955Z).
//
// Arm 2 of 2: leanlinkrescue courtship + table SEAT legs ONLY (no wait leg),
// vs leanlinkrescue-only baseline, on IDENTICAL seeds, death-aware horizon
// 180 loop-days (dead villages stop via runDays' Game.over break).
//
// Pairing (exact):
//   baseline = scripts/policies/leanlinkrescue.js with LEANLINKRESCUE=1,
//     TABLESEATNOWAIT unset.
//   armed    = scripts/policies/tableseat-nowait.js with LEANLINKRESCUE=1
//     AND TABLESEATNOWAIT=1.
// The armed daily wraps leanlinkrescue.daily (NOT competent.daily), so the
// courtship is shared exactly and the delta is ONLY the seat legs.
//
// Modes:
//   default: pilot sweep. SEEDS="73601,..." (default 73601-73608), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-tableseat-nowait-a
//     (default). Per-config INCREMENTAL corpus writes (a sweep killed
//     mid-run must not lose completed configs — the tablesit first attempt
//     died silently with no corpus). Prints a table + verdict. Exit 0 on a
//     completed sweep regardless of GO/NO-GO (the verdict is data, not a
//     script failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (SEED env, default 73601):
//     leanlinkrescue-only vs tableseat-nowait with TABLESEATNOWAIT unset
//     (LEANLINKRESCUE=1 both) must match on days/gameDays with no ts
//     counters. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-tableseat-nowait-a-sense.txt.
//     SENSE_SEED env overrides the argv seed.
//
// Proof gates (G1/G2 failures exit 1 in sweep mode; G3 likewise):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 pre-national read-only: for every pilot seed where NEITHER arm ever
//     reached national, days and gameDays must be identical — the seat leg
//     fires only at national+, so any divergence is a wrapper leak.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     counters object present on every row.
//
// Verdict (computed, not asserted): GO iff armed entered >= baseline
// entered + 2 AND the deciding cost bar passes (starvation armed total <=
// baseline total + 2 AND arm-only starvation <= 2 AND armed median days >=
// 0.8 x baseline median days). Starvation = death cause matching
// /starv|hunger/i. The evidence file judges; this script only reports.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leanlinkrescue } = require('./policies/leanlinkrescue');
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
  // Env pairing: LEANLINKRESCUE=1 for BOTH arms (courtship shared exactly);
  // TABLESEATNOWAIT=1 only for the armed arm. Both policy gates read env
  // per daily call, so setting env between configs in one process is safe.
  process.env.LEANLINKRESCUE = '1';
  if (pid === 'armed') process.env.TABLESEATNOWAIT = '1';
  else delete process.env.TABLESEATNOWAIT;
  const base = pid === 'armed' ? tableseatNowait : leanlinkrescue;
  const { Game } = await loadGame({ seed, mode: 'tableseat-nowait-' + pid, fullTelemetry: false });
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
  const seeds = (process.env.SEEDS || '73601,73602,73603,73604,73605,73606,73607,73608')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-tableseat-nowait-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G2: pre-national read-only — identical days/gameDays where neither arm reached national ever.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (c && a && !c.nationalEver && !a.nationalEver) {
      const ok = c.days === a.days && c.gameDays === a.gameDays;
      g2.push({ seed, ok, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object');
  // Deciding cost bar (binding, from sim-scalemetric).
  let armOnlyStarv = 0;
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) armOnlyStarv += a.starvationDeaths;
  }
  const primaryPass = byPolicy.armed.entered >= byPolicy.baseline.entered + 2;
  const cost1 = byPolicy.armed.starvationTotal <= byPolicy.baseline.starvationTotal + 2;
  const cost2 = armOnlyStarv <= 2;
  const cost3 = byPolicy.armed.medianDays >= 0.8 * byPolicy.baseline.medianDays;
  const go = primaryPass && cost1 && cost2 && cost3;
  const report = {
    label: 'sim-tableseat-nowait-a pilot', seeds, days, rows, byPolicy,
    gates: { g2PreNationalReadOnly: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    verdictInputs: { primaryPass, costStarvationTotal: cost1, costArmOnlyStarvation: cost2, armOnlyStarvation: armOnlyStarv, costMedianDays: cost3 },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff armed entered >= baseline entered + 2 AND starvationTotal armed <= baseline + 2 AND arm-only starvation <= 2 AND armed medianDays >= 0.8 x baseline medianDays',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-tableseat-nowait-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
  }
  console.log(`  arm-only starvation: ${armOnlyStarv}`);
  console.log(`  G2 pre-national read-only: ${g2Pass === null ? 'n/a (every seed reached national in some arm)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${report.verdict} (primary ${primaryPass ? 'PASS' : 'FAIL'}; cost1 ${cost1 ? 'PASS' : 'FAIL'}; cost2 ${cost2 ? 'PASS' : 'FAIL'}; cost3 ${cost3 ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (TABLESEATNOWAIT unset delegation).');
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73601', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  // runOne('armed') would set TABLESEATNOWAIT=1; for the det-gate the armed
  // arm must run with the gate OFF, i.e. exactly the baseline env. So run
  // the armed POLICY under baseline env by hand: delete the gate first,
  // then run the armed policy object directly via a second runOne-like
  // call is not available — instead emulate: temporarily force runOne's
  // armed branch off by unsetting after the call setup. Simplest correct
  // route: run baseline twice is NOT a det-gate. Do it properly below.
  delete process.env.TABLESEATNOWAIT;
  process.env.LEANLINKRESCUE = '1';
  const { Game } = await loadGame({ seed, mode: 'tableseat-nowait-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return tableseatNowait.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
  const ok = c.days === result.days && c.gameDays === result.gameDays && Object.keys(ts).length === 0;
  console.log(`DETGATE seed=${seed} baseline(leanlinkrescue-only) days=${c.days} gameDays=${c.gameDays} | armed(TABLESEATNOWAIT unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73601', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-tableseat-nowait-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'tableseat-nowait-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, tableseatNowait, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
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
if (require.main === module) main().catch(e => { console.error('TABLESEAT-NOWAIT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
