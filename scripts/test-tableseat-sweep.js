#!/usr/bin/env node
// scripts/test-tableseat-sweep.js — sim-tableseat-a pilot + proof gates
// (scale-onramp axis, run fleshout-20261024T1955Z, arm 1 of 2).
//
// Measures leanlinkrescue-only (baseline) vs tableseat (armed) on
// IDENTICAL seeds, death-aware horizon 180 loop-days (dead villages
// stop via runDays' Game.over break; no fixed-200d).
//
// Pairing (the crux, defined exactly):
//   baseline = scripts/policies/leanlinkrescue.js with LEANLINKRESCUE=1,
//     TABLESEAT unset (courtship on, seat legs absent — the policy
//     file does not exist in the baseline path at all).
//   armed    = scripts/policies/tableseat.js with LEANLINKRESCUE=1 AND
//     TABLESEAT=1 (leanlinkrescue.daily wrapped with the seat/wait
//     legs; courtship shared exactly with the baseline).
// tableseat.daily with TABLESEAT unset delegates to leanlinkrescue.daily,
// so the det-gate is a pure-delegation proof, not a behavior claim.
//
// Modes:
//   default: pilot sweep. SEEDS="73601,..." (default 73601-73608),
//     DAYS=180 (default), EVID=evidence/2026-10-24/perseed-tableseat-a.
//     Writes one per-config JSON per config INCREMENTALLY (a sweep
//     killed mid-run keeps its completed configs — the tablesit first
//     attempt died silently with no corpus), then a sweep aggregate.
//     Exit 0 on a completed sweep regardless of GO/NO-GO (the verdict
//     is data, not a script failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (default 73601):
//     leanlinkrescue-only vs tableseat-with-TABLESEAT-unset (both with
//     LEANLINKRESCUE=1) must match on days/gameDays with no ts
//     counters on the armed side. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): tableseat armed on
//     one seed with the say ring, written to
//     evidence/2026-10-24/sim-tableseat-a-sense.txt for the sense read.
//
// Proof gates (binding, printed, G1/G2/G3 failures exit 1 in sweep mode
// where they apply):
//   G1 det-gate: see --detgate (run separately; the sweep prints a
//     reminder, it does not re-run it — one process, one seed each).
//   G2 pre-national read-only: for every pilot seed where NEITHER arm
//     ever reached national, days and gameDays must be identical —
//     the wrapper is read-only before national, so any divergence is
//     a wrapper leak, not a treatment effect.
//   G3 corpus integrity: 16/16 rows, days > 0, counters objects present.
//
// Verdict (computed, not asserted by the script — the evidence file
// judges; the script only reports):
//   PRIMARY: armed table entered (tableDone ever) >= baseline entered + 2.
//   DECIDING COST BAR (from sim-scalemetric, binding): starvation
//     deaths armed total <= baseline total + 2 AND arm-only starvation
//     (armed starvation deaths on seeds where the paired baseline row
//     had none) <= 2 AND median days armed >= 0.8 x baseline median
//     days. GO iff primary AND all three cost conditions pass.
//   Starvation = a death whose cause matches /starv|hunger|famine/i;
//     the full by-cause table is carried per row so the bar is auditable.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync, execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, snapshotVillagers, quietLog } = require('./sim-harness');
const { leanlinkrescue } = require('./policies/leanlinkrescue');
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

// Per-config write: direct first, writer-subprocess fallback (the
// container's read-taint class has blocked direct writes from harness
// processes before — a failed attempt never leaves a 0-byte corpse:
// the writer uses a tmp file + hash-verified rename). Verified by
// read-back parse either way.
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

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

async function runOne(arm, seed, days, evidDir) {
  // Env is read per daily call by both policies, so setting it here (and
  // only here, per config) is the whole pairing.
  if (arm === 'armed') { process.env.LEANLINKRESCUE = '1'; process.env.TABLESEAT = '1'; }
  else if (arm === 'armed-detgate') { process.env.LEANLINKRESCUE = '1'; delete process.env.TABLESEAT; }
  else { process.env.LEANLINKRESCUE = '1'; delete process.env.TABLESEAT; }
  const base = arm === 'baseline' ? leanlinkrescue : tableseat;
  const { Game } = await loadGame({ seed, mode: 'tableseat-' + arm, fullTelemetry: false });
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
  const row = {
    policy: arm === 'armed-detgate' ? 'tableseat-detgate' : arm,
    arm: arm === 'armed-detgate' ? 'armed-detgate' : arm,
    seed, anchorCommit: ANCHOR, daysRequested: days,
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
    deaths, deathByCause: deathSummary(result.samples.deaths),
    starvationDeaths: starv.length,
    starvationDetail: starv,
    ts, court,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge), finalVillagers,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${arm === 'armed-detgate' ? 'detgate' : arm}.json`);
    const how = writeConfig(fn, JSON.stringify(row, null, 1) + '\n');
    console.log(`  WROTE ${fn} via=${how}`);
  }
  return row;
}

function aggregate(rows, arm) {
  const rs = rows.filter(r => r.arm === arm || r.policy === arm);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
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
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73601,73602,73603,73604,73605,73606,73607,73608')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-tableseat-a');
  const rows = [];
  for (const arm of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(arm, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${arm} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank}/${row.endRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.tableInvited} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byArm = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  // G2: pre-national read-only — identical days/gameDays where neither arm ever reached national.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.arm === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.arm === 'armed' && r.seed === seed);
    if (c && a && !c.nationalEver && !a.nationalEver) {
      const ok = c.days === a.days && c.gameDays === a.gameDays;
      g2.push({ seed, ok, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object' && r.court && typeof r.court === 'object');
  // Deciding cost bar.
  let armOnlyStarv = 0, armOnlyStarvSeeds = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.arm === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.arm === 'armed' && r.seed === seed);
    if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) {
      armOnlyStarv += a.starvationDeaths;
      armOnlyStarvSeeds.push(seed);
    }
  }
  const primaryPass = byArm.armed.entered >= byArm.baseline.entered + 2;
  const costStarvTotal = byArm.armed.starvationDeaths <= byArm.baseline.starvationDeaths + 2;
  const costArmOnly = armOnlyStarv <= 2;
  const costMedian = byArm.armed.medianDays >= 0.8 * byArm.baseline.medianDays;
  const go = primaryPass && costStarvTotal && costArmOnly && costMedian;
  const report = {
    label: 'sim-tableseat-a pilot', seeds, days, rows, byArm,
    gates: { g2PreNationalReadOnly: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    costBar: { armOnlyStarvationDeaths: armOnlyStarv, armOnlyStarvationSeeds: armOnlyStarvSeeds,
      starvationTotalPass: costStarvTotal, armOnlyPass: costArmOnly, medianPass: costMedian,
      medianRatio: byArm.baseline.medianDays ? byArm.armed.medianDays / byArm.baseline.medianDays : null },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff armed entered >= baseline entered + 2 AND starvation armed total <= baseline total + 2 AND arm-only starvation <= 2 AND median days armed >= 0.8 x baseline median days',
    primaryPass, generated: new Date().toISOString(),
  };
  const out = path.join(REPO, 'evidence', '2026-10-24', 'sim-tableseat-a-sweep.json');
  writeConfig(out, JSON.stringify(report, null, 2) + '\n');
  console.log('\n=== sim-tableseat-a pilot ===');
  for (const arm of ['baseline', 'armed']) {
    const b = byArm[arm];
    console.log(`  ${arm}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} tableInv=${b.tableInvited} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationDeaths} deaths=${b.totalDeaths} seatAtt=${b.seatAttempts} seatTaken=${b.seatTaken} seatDays=${JSON.stringify(b.seatDays)} seatKinds=${JSON.stringify(b.seatKinds)} answers=${b.tableAnswers} paths=${JSON.stringify(b.tablePaths)} waitDays=${b.waitDays} waitReturns=${b.waitReturns} waitStranded=${b.waitStranded} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady}`);
  }
  console.log(`  G2 pre-national read-only: ${g2Pass === null ? 'n/a (every seed reached national on some arm)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  PRIMARY entered armed=${byArm.armed.entered} baseline=${byArm.baseline.entered} need>=${byArm.baseline.entered + 2} -> ${primaryPass ? 'PASS' : 'FAIL'}`);
  console.log(`  COST starvation total armed=${byArm.armed.starvationDeaths} baseline=${byArm.baseline.starvationDeaths} -> ${costStarvTotal ? 'PASS' : 'FAIL'}; arm-only=${armOnlyStarv} (seeds ${JSON.stringify(armOnlyStarvSeeds)}) -> ${costArmOnly ? 'PASS' : 'FAIL'}; median armed=${byArm.armed.medianDays} baseline=${byArm.baseline.medianDays} ratio=${report.costBar.medianRatio} -> ${costMedian ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${report.verdict} -> ${out}`);
  console.log('  NOTE: run --detgate separately for G1 (TABLESEAT unset delegation).');
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73601', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  const a = await runOne('armed-detgate', seed, days, null);
  const ok = c.days === a.days && c.gameDays === a.gameDays && !(a.ts.tsSeatTaken || a.ts.tsWaitDays || a.ts.tsSeatAttempts);
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} | tableseat(TABLESEAT unset, LEANLINKRESCUE=1) days=${a.days} gameDays=${a.gameDays} ts=${JSON.stringify(a.ts)} court=${JSON.stringify(a.court)} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73601', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-tableseat-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEAT = '1';
  const { Game } = await loadGame({ seed, mode: 'tableseat-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, tableseat, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat (LEANLINKRESCUE=1, TABLESEAT=1) days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('TABLESEAT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
