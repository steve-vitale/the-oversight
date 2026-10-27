#!/usr/bin/env node
// scripts/test-waitlong-sweep.js — sim-waitlong-a (scale-onramp axis,
// run fleshout-20261027T1215Z, arm 2 of 3).
//
// Question: DOES WAITING MATTER ON BANDS WHERE THE SEAT STAYS UNREADY
// LONGER? The 1955Z tableseat round proved seat-only replicates
// seat+wait exactly on band 73601-73608, where the longest unready
// stretch was 2 not-ready days on one seed (73605). This arm tests
// the wait delta on a fresh, uncherry-picked band (74001-74008,
// prereg evidence/2026-10-27/sim-waitlong-a-prereg.md) against ONE
// shared leanlinkrescue-only baseline.
//
// POLICY-SIDE ONLY. ZERO src/js. No new policy files: both armed legs
// reuse the prior arms' files verbatim — seat-only =
// scripts/policies/tableseat-nowait.js (TABLESEATNOWAIT=1), seat+wait =
// scripts/policies/tableseat.js (TABLESEAT=1), each wrapping
// leanlinkrescue.daily with LEANLINKRESCUE=1.
//
// WHY RECORDING WITHOUT PERTURBATION: the sweep wrapper does NOT call
// tablePreview() (its tableEarnedPaths path can consume Math.random
// via table-witness.js, which would perturb trajectories against the
// prior arms). Instead, before each day's policy.daily, on days where
// progState shows tableWaiting && !tableDone && rank >= national, it
// records Game.tableEntryBlock() — pure reads (over/won, activeContest,
// inCombat/monster, havenStoresAccess), no RNG, no writes — which is
// exactly the block the seat drive will see that day, plus the
// scholar's map position. Neutrality is PROVEN by the --probe mode
// (baseline + seat-only on seed 73601 must match the 1955Z corpus
// rows exactly), not assumed.
//
// Modes:
//   default: sweep. SEEDS="74001,..." (default 74001-74008), DAYS=180
//     (default), EVID=evidence/2026-10-27/perseed-waitlong-a.
//     Legs outer, seeds inner: baseline, seatonly, seatwait = 24
//     configs. Per-config INCREMENTAL writes (never batch at the end).
//     Exit 0 on a completed sweep regardless of verdict (the verdict
//     is data); exit 1 on proof-gate failure (G2/G3).
//   --probe [SEED]: replication probe (default 73601, no corpus
//     writes): baseline row must equal the 1955Z baseline row and the
//     seat-only row must equal the 1955Z nowait row on that seed.
//     Exit 1 on mismatch.
//   --sense [SEED]: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): SENSE_LEG=seatwait
//     (default) or seatonly, ring written to
//     evidence/2026-10-27/sim-waitlong-a-sense.txt plus a final-roster
//     section for the villager-behaviour sample.
//
// Verdict (computed, not asserted — the evidence file judges; the
// script only reports):
//   BAND QUALIFICATION (binding, prereg): the band counts as
//     "longer-unready" iff seat-only total not-ready previews >= 6 OR
//     any seated seat-only seed has latency >= 4 days (latency =
//     tsSeatDay - firstWaitingDay). 1955Z reference: total 2, max 2d.
//   PRIMARY (the wait question): seat+wait entered - seat-only entered.
//     GO (waiting matters) iff band qualifies AND delta >= 2 AND the
//     deciding cost bar passes.
//   COST BAR (seat+wait vs seat-only, from sim-scalemetric): starvation
//     total <= comparison + 2 AND arm-only starvation <= 2 AND median
//     days >= 0.8 x comparison median.
//   If no seat is taken on either leg: NO-DISCRIMINATION (not NO-GO).
//   If the band does not qualify: NOT-QUALIFIED (wait remains
//     undifferentiated on this band), whatever the delta.
//   Starvation = death cause matching /starv|hunger|famine/i.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, snapshotVillagers, quietLog } = require('./sim-harness');
const { leanlinkrescue } = require('./policies/leanlinkrescue');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { tableseat } = require('./policies/tableseat');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger|famine/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
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
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeConfig(p, body) {
  try {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, body);
    JSON.parse(fs.readFileSync(p, 'utf8'));
    return 'direct';
  } catch (e) {
    console.log(`WRITE-FALLBACK ${path.basename(p)} direct failed: ${String((e && e.message) || e).slice(0, 120)}`);
  }
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try {
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'sim-postunlock2-b-writer.js'), p],
        { input: body, cwd: REPO, encoding: 'utf8', timeout: 600000 });
      const m = /WROTE ([0-9a-f]{12})/.exec(out || '');
      if (!m) throw new Error('writer gave no WROTE line: ' + String(out).slice(0, 200));
      const sha = crypto.createHash('sha256').update(body).digest('hex').slice(0, 12);
      if (m[1] !== sha) throw new Error('writer sha mismatch');
      JSON.parse(fs.readFileSync(p, 'utf8'));
      return 'writer';
    } catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function blockClass(raw) {
  if (!raw) return 'ready';
  const s = String(raw);
  if (/Haven/i.test(s)) return 'haven';
  if (/contest/i.test(s)) return 'contest';
  if (/encounter/i.test(s)) return 'combat';
  if (/ended/i.test(s)) return 'ended';
  return 'other';
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

const LEGS = {
  baseline: { base: leanlinkrescue, env: () => { process.env.LEANLINKRESCUE = '1'; delete process.env.TABLESEAT; delete process.env.TABLESEATNOWAIT; } },
  seatonly: { base: tableseatNowait, env: () => { process.env.LEANLINKRESCUE = '1'; delete process.env.TABLESEAT; process.env.TABLESEATNOWAIT = '1'; } },
  seatwait: { base: tableseat, env: () => { process.env.LEANLINKRESCUE = '1'; process.env.TABLESEAT = '1'; delete process.env.TABLESEATNOWAIT; } },
};

async function runOne(arm, seed, days, evidDir) {
  const leg = LEGS[arm];
  leg.env();
  const base = leg.base;
  const { Game } = await loadGame({ seed, mode: 'waitlong-' + arm, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, firstWaitingDay: null, firstEnteredDay: null };
  const blocks = [];
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      // Pre-daily block snapshot: exactly what the seat drive sees today.
      try {
        const pre = snap(G);
        if (pre.tableWaiting && !pre.tableEntered && (RANK_ORDER[pre.rank] || 0) >= 2) {
          let raw = '';
          try { raw = (typeof G.tableEntryBlock === 'function') ? (G.tableEntryBlock() || '') : ''; } catch (e) { raw = 'ERR:' + String((e && e.message) || e).slice(0, 60); }
          let px = null, py = null;
          try { px = G.map.px; py = G.map.py; } catch (e) {}
          blocks.push({ day: ((G.state || {}).scholar || {}).day || 0, block: blockClass(raw), raw: String(raw).slice(0, 80), px, py });
        }
      } catch (e) {}
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      // Post-daily snapshot: first-waiting / first-entered days, maxima.
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) { hist.everTable = true; if (hist.firstWaitingDay == null) hist.firstWaitingDay = ((G.state || {}).scholar || {}).day || 0; }
        if (s.tableEntered) { hist.everEntered = true; if (hist.firstEnteredDay == null) hist.firstEnteredDay = ((G.state || {}).scholar || {}).day || 0; }
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const ts = {};
  const court = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') court[k] = capturedCtx[k];
    }
  }
  const deaths = (result.samples.deaths || []).map(d => ({ day: d.day, kind: d.kind, who: d.who, cause: d.cause, player: !!d.player }));
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let finalVillagers = null;
  try { finalVillagers = snapshotVillagers(Game); } catch (e) { finalVillagers = null; }
  const seatDay = (ts.tsSeatDay != null) ? ts.tsSeatDay : null;
  const latency = (seatDay != null && hist.firstWaitingDay != null) ? (seatDay - hist.firstWaitingDay) : null;
  const row = {
    policy: arm, arm, seed, anchorCommit: ANCHOR, daysRequested: days,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    endRank: end.rank,
    nationalEver: (Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2) ? 1 : 0,
    nationalFinal: ((RANK_ORDER[end.rank] || 0) >= 2) ? 1 : 0,
    tableInvited: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    firstWaitingDay: hist.firstWaitingDay,
    firstEnteredDay: hist.firstEnteredDay,
    seatLatencyDays: latency,
    blocks, blockCounts: blocks.reduce((m, b) => { m[b.block] = (m[b.block] || 0) + 1; return m; }, {}),
    deaths, deathByCause: deathSummary(result.samples.deaths),
    starvationDeaths: starv.length,
    starvationDetail: starv,
    ts, court,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge), finalVillagers,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${arm}.json`);
    const how = writeConfig(fn, JSON.stringify(row, null, 1) + '\n');
    console.log(`  WROTE ${fn} via=${how}`);
  }
  return row;
}

function aggregate(rows, arm) {
  const rs = rows.filter(r => r.arm === arm);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const blockTotals = {};
  for (const r of rs) for (const [k, v] of Object.entries(r.blockCounts || {})) blockTotals[k] = (blockTotals[k] || 0) + v;
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    tableInvited: rs.reduce((t, r) => t + r.tableInvited, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([0])),
    starvationDeaths: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    totalDeaths: rs.reduce((t, r) => t + r.deaths.length, 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    seatDays: rs.map(r => r.ts.tsSeatDay).filter(v => v != null),
    seatKinds: rs.map(r => r.ts.tsSeatKind).filter(v => v != null),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
    tablePaths: rs.map(r => r.ts.tsTablePath).filter(v => v != null),
    waitDays: rs.reduce((t, r) => t + (r.ts.tsWaitDays || 0), 0),
    waitAtHaven: rs.reduce((t, r) => t + (r.ts.tsWaitAtHaven || 0), 0),
    waitReturns: rs.reduce((t, r) => t + (r.ts.tsWaitReturns || 0), 0),
    waitStranded: rs.reduce((t, r) => t + (r.ts.tsWaitStranded || 0), 0),
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    blockTotals,
    latencies: rs.map(r => ({ seed: r.seed, latency: r.seatLatencyDays, seatDay: r.ts.tsSeatDay != null ? r.ts.tsSeatDay : null, firstWaitingDay: r.firstWaitingDay })).filter(x => x.latency != null),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '74001,74002,74003,74004,74005,74006,74007,74008')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-waitlong-a');
  const rows = [];
  for (const arm of ['baseline', 'seatonly', 'seatwait']) {
    for (const seed of seeds) {
      const row = await runOne(arm, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${arm} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank}/${row.endRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.tableInvited} firstWait=${row.firstWaitingDay} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ts=${JSON.stringify(row.ts)} blocks=${JSON.stringify(row.blockCounts)} latency=${row.seatLatencyDays}`);
    }
  }
  const byArm = { baseline: aggregate(rows, 'baseline'), seatonly: aggregate(rows, 'seatonly'), seatwait: aggregate(rows, 'seatwait') };
  // G2: pre-national read-only across all three legs.
  const g2 = [];
  for (const seed of seeds) {
    const rs = seeds.length ? rows.filter(r => r.seed === seed) : [];
    const legs = ['baseline', 'seatonly', 'seatwait'].map(a => rs.find(r => r.arm === a));
    if (legs.every(Boolean) && legs.every(r => !r.nationalEver)) {
      const ok = legs[0].days === legs[1].days && legs[0].days === legs[2].days && legs[0].gameDays === legs[1].gameDays && legs[0].gameDays === legs[2].gameDays;
      g2.push({ seed, ok, days: legs.map(r => r.days), gameDays: legs.map(r => r.gameDays) });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  const g3Pass = rows.length === seeds.length * 3 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object' && r.court && typeof r.court === 'object');
  // Band qualification + wait verdict (prereg rules).
  const so = byArm.seatonly, sw = byArm.seatwait;
  const maxLatency = so.latencies.length ? Math.max.apply(null, so.latencies.map(x => x.latency)) : null;
  const qualified = so.previewNotReady >= 6 || (maxLatency != null && maxLatency >= 4);
  const enteredDelta = sw.entered - so.entered;
  let armOnlyStarv = 0, armOnlyStarvSeeds = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.arm === 'seatonly' && r.seed === seed);
    const a = rows.find(r => r.arm === 'seatwait' && r.seed === seed);
    if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) { armOnlyStarv += a.starvationDeaths; armOnlyStarvSeeds.push(seed); }
  }
  const primaryPass = enteredDelta >= 2;
  const costStarvTotal = sw.starvationDeaths <= so.starvationDeaths + 2;
  const costArmOnly = armOnlyStarv <= 2;
  const costMedian = sw.medianDays >= 0.8 * so.medianDays;
  let verdict;
  if (so.entered === 0 && sw.entered === 0) verdict = 'NO-DISCRIMINATION';
  else if (!qualified) verdict = 'NOT-QUALIFIED';
  else verdict = (primaryPass && costStarvTotal && costArmOnly && costMedian) ? 'GO' : 'NO-GO';
  const report = {
    label: 'sim-waitlong-a pilot', seeds, days, rows, byArm,
    gates: { g2PreNationalReadOnly: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    qualification: { qualified, seatonlyPreviewNotReady: so.previewNotReady, seatonlyMaxLatency: maxLatency, seatonlyLatencies: so.latencies, rule: 'qualified iff seat-only previewNotReady >= 6 OR any seated seat-only latency >= 4 days (1955Z reference: total 2, max 2d)' },
    waitVerdict: { verdict, enteredDelta, primaryPass, costBar: { armOnlyStarvationDeaths: armOnlyStarv, armOnlyStarvationSeeds: armOnlyStarvSeeds, starvationTotalPass: costStarvTotal, armOnlyPass: costArmOnly, medianPass: costMedian, medianRatio: so.medianDays ? sw.medianDays / so.medianDays : null } },
    verdictRule: 'NO-DISCRIMINATION if neither leg entered; else NOT-QUALIFIED if band unqualified; else GO iff seatwait entered >= seatonly entered + 2 AND starvation seatwait total <= seatonly total + 2 AND arm-only starvation <= 2 AND median days seatwait >= 0.8 x seatonly median days',
    generated: new Date().toISOString(),
  };
  const out = path.join(REPO, 'evidence', '2026-10-27', 'sim-waitlong-a-sweep.json');
  writeConfig(out, JSON.stringify(report, null, 2) + '\n');
  console.log('\n=== sim-waitlong-a pilot ===');
  for (const arm of ['baseline', 'seatonly', 'seatwait']) {
    const b = byArm[arm];
    console.log(`  ${arm}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} tableInv=${b.tableInvited} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationDeaths} deaths=${b.totalDeaths} seatAtt=${b.seatAttempts} seatTaken=${b.seatTaken} seatDays=${JSON.stringify(b.seatDays)} seatKinds=${JSON.stringify(b.seatKinds)} answers=${b.tableAnswers} paths=${JSON.stringify(b.tablePaths)} waitDays=${b.waitDays} waitReturns=${b.waitReturns} waitStranded=${b.waitStranded} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} blocks=${JSON.stringify(b.blockTotals)} latencies=${JSON.stringify(b.latencies)}`);
  }
  console.log(`  G2 pre-national read-only: ${g2Pass === null ? 'n/a (every seed reached national on some leg)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  QUALIFICATION qualified=${qualified} seatonlyNotReady=${so.previewNotReady} maxLatency=${maxLatency}`);
  console.log(`  WAIT DELTA entered seatwait=${sw.entered} seatonly=${so.entered} delta=${enteredDelta} need>=2 -> ${primaryPass ? 'PASS' : 'FAIL'}`);
  console.log(`  COST starvation total seatwait=${sw.starvationDeaths} seatonly=${so.starvationDeaths} -> ${costStarvTotal ? 'PASS' : 'FAIL'}; arm-only=${armOnlyStarv} (seeds ${JSON.stringify(armOnlyStarvSeeds)}) -> ${costArmOnly ? 'PASS' : 'FAIL'}; median seatwait=${sw.medianDays} seatonly=${so.medianDays} ratio=${report.waitVerdict.costBar.medianRatio} -> ${costMedian ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${verdict} -> ${out}`);
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function probeMode(seedArg) {
  const seed = parseInt(process.env.SEED || seedArg || '73601', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  const a = await runOne('seatonly', seed, days, null);
  // Expected values are the 1955Z corpus rows (evidence/2026-10-24/
  // perseed-tableseat-a/s73601-baseline.json and
  // perseed-tableseat-nowait-a/s73601-armed.json), hardcoded here so
  // the probe is self-contained and cannot drift with the corpus.
  const expB = { days: 179, gameDays: 179, entered: 0, won: 0 };
  const expA = { days: 129, gameDays: 129, entered: 1, won: 1, seatDay: 129, seatKind: 'lesser', seatPath: 'feared' };
  const okB = c.days === expB.days && c.gameDays === expB.gameDays && c.entered === expB.entered && c.won === expB.won;
  const okA = a.days === expA.days && a.gameDays === expA.gameDays && a.entered === expA.entered && a.won === expA.won && a.ts.tsSeatDay === expA.seatDay && a.ts.tsSeatKind === expA.seatKind && a.ts.tsTablePath === expA.seatPath;
  console.log(`PROBE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} entered=${c.entered} won=${c.won} end=${c.endReason} -> ${okB ? 'PASS' : 'FAIL'}`);
  console.log(`PROBE seed=${seed} seatonly days=${a.days} gameDays=${a.gameDays} entered=${a.entered} won=${a.won} end=${a.endReason} ts=${JSON.stringify(a.ts)} blocks=${JSON.stringify(a.blockCounts)} -> ${okA ? 'PASS' : 'FAIL'}`);
  if (!okB || !okA) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '74001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const legName = (process.env.SENSE_LEG || 'seatwait');
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-27', 'sim-waitlong-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  if (legName === 'seatonly') { delete process.env.TABLESEAT; process.env.TABLESEATNOWAIT = '1'; }
  else { process.env.TABLESEAT = '1'; delete process.env.TABLESEATNOWAIT; }
  const base = legName === 'seatonly' ? tableseatNowait : tableseat;
  const { Game } = await loadGame({ seed, mode: 'waitlong-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result, finalVillagers = null;
  await quietLog(async () => { result = await runDays(Game, base, { days, manifest: undefined, sampleEvery: 30 }); });
  try { finalVillagers = snapshotVillagers(Game); } catch (e) {}
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=${legName} (LEANLINKRESCUE=1, ${legName === 'seatonly' ? 'TABLESEATNOWAIT=1' : 'TABLESEAT=1'}) days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  let roster = '\nFINAL ROSTER (sense replay only):\n';
  try { roster += JSON.stringify(finalVillagers, null, 1).slice(0, 4000) + '\n'; } catch (e) { roster += '(roster unavailable)\n'; }
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n' + roster;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body);
  console.log(`SENSE-DONE seed=${seed} leg=${legName} end=${result.endReason} ring=${ring.length} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--probe')) return probeMode(args[args.indexOf('--probe') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('WAITLONG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
