#!/usr/bin/env node
// scripts/test-waitseat-sweep.js — sim-waitseat-a pilot + proof gates
// (scale-onramp axis, run fleshout-20261124T1215Z, tracker blank #5).
//
// Measures tableseat (seat+wait) vs tableseat-nowait (seat only) on
// IDENTICAL seeds, REPLAY band 107383-107390, death-aware horizon 180
// loop-days — plus a leanlinkrescue-only baseline as the substrate
// check. Both seat policies wrap leanlinkrescue.daily verbatim and
// their seat legs (tsDriveSeat + tsAnswerTableChoices) are
// byte-identical (verified by extraction diff before sweeping); the
// ONLY behavioral difference is the wait leg in tableseat.daily.
//
// Pairing (the crux, defined exactly):
//   baseline = scripts/policies/leanlinkrescue.js with LEANLINKRESCUE=1,
//     TABLESEAT + TABLESEATNOWAIT unset.
//   wait     = scripts/policies/tableseat.js with LEANLINKRESCUE=1 AND
//     TABLESEAT=1 (seat + wait legs).
//   nowait   = scripts/policies/tableseat-nowait.js with LEANLINKRESCUE=1
//     AND TABLESEATNOWAIT=1 (seat legs only, wait omitted).
// Env is read per daily call by both policies, so setting it per config
// (and only there) is the whole pairing.
//
// Modes:
//   default: pilot sweep. SEEDS="107383,..." (default 107383-107390),
//     DAYS=180 (default), EVID=evidence/2026-11-24/perseed-waitseat-a.
//     Writes one per-config JSON per config INCREMENTALLY (a sweep
//     killed mid-run keeps its completed configs — the tablesit first
//     attempt died silently with no corpus), then a sweep aggregate.
//     Exit 0 on a completed sweep regardless of GO/NO-GO (the verdict
//     is data, not a script failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (default 107383):
//     leanlinkrescue-only vs tableseat-with-TABLESEAT-unset vs
//     tableseat-nowait-with-TABLESEATNOWAIT-unset (all with
//     LEANLINKRESCUE=1) must match on days/gameDays with no ts
//     counters on either armed side. Exit 1 on mismatch.
//   --sense SEED [ARM]: NON-MEASURED narration replay (narration
//     shifts trajectories, so it never enters the census): the named
//     arm (wait|nowait, default wait) on one seed with the say ring,
//     written to evidence/2026-11-24/sim-waitseat-a-sense-<arm>.txt.
//
// Proof gates (binding, printed, G1/G2/G3 failures exit 1 in sweep
// mode where they apply):
//   G1 det-gate: see --detgate (run separately; the sweep prints a
//     reminder, it does not re-run it — one process, one seed each).
//   G2 pre-national read-only: for every pilot seed where NO arm ever
//     reached national, days and gameDays must be identical across all
//     three arms — the wrappers are read-only before national, so any
//     divergence is a wrapper leak, not a treatment effect.
//   G3 corpus integrity: 24/24 rows, days > 0, counters objects present.
//
// Verdict (computed, not asserted by the script — the evidence file
// judges; the script only reports; prereg frozen
// evidence/2026-11-24/sim-waitseat-a-prereg.md):
//   PRIMARY: the wait leg changes entered or wins by >= 2 seeds in the
//     wait arm's favour: (entered_wait - entered_nowait >= 2) OR
//     (won_wait - won_nowait >= 2).
//   DECIDING COST BAR (from sim-scalemetric, binding; control = nowait):
//     starvation deaths wait total <= nowait total + 2 AND arm-only
//     starvation (wait starvation deaths on seeds where the paired
//     nowait row had none) <= 2 AND median days wait >= 0.8 x median
//     days nowait. GO iff primary AND all three cost conditions pass.
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
const { tableseatNowait } = require('./policies/tableseat-nowait');
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

function baseFor(arm) {
  if (arm === 'wait' || arm === 'wait-detgate') return tableseat;
  if (arm === 'nowait' || arm === 'nowait-detgate') return tableseatNowait;
  return leanlinkrescue;
}
function setEnvFor(arm) {
  process.env.LEANLINKRESCUE = '1';
  if (arm === 'wait') { process.env.TABLESEAT = '1'; delete process.env.TABLESEATNOWAIT; }
  else if (arm === 'nowait') { delete process.env.TABLESEAT; process.env.TABLESEATNOWAIT = '1'; }
  else { delete process.env.TABLESEAT; delete process.env.TABLESEATNOWAIT; }
}

async function runOne(arm, seed, days, evidDir) {
  // Env is read per daily call by both policies, so setting it here (and
  // only here, per config) is the whole pairing.
  setEnvFor(arm);
  const base = baseFor(arm);
  const { Game } = await loadGame({ seed, mode: 'waitseat-' + arm, fullTelemetry: false });
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
    policy: arm,
    arm,
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
    const fn = path.join(evidDir, `s${seed}-${arm}.json`);
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
  const seeds = (process.env.SEEDS || '107383,107384,107385,107386,107387,107388,107389,107390')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-24', 'perseed-waitseat-a');
  const rows = [];
  for (const arm of ['baseline', 'wait', 'nowait']) {
    for (const seed of seeds) {
      const row = await runOne(arm, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${arm} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} rank=${row.maxRank}/${row.endRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.tableInvited} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byArm = { baseline: aggregate(rows, 'baseline'), wait: aggregate(rows, 'wait'), nowait: aggregate(rows, 'nowait') };
  // G2: pre-national read-only — identical days/gameDays where NO arm ever reached national.
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.arm === 'baseline' && r.seed === seed);
    const w = rows.find(r => r.arm === 'wait' && r.seed === seed);
    const n = rows.find(r => r.arm === 'nowait' && r.seed === seed);
    if (c && w && n && !c.nationalEver && !w.nationalEver && !n.nationalEver) {
      const ok = c.days === w.days && w.days === n.days && c.gameDays === w.gameDays && w.gameDays === n.gameDays;
      g2.push({ seed, ok, cDays: c.days, wDays: w.days, nDays: n.days, cGameDays: c.gameDays, wGameDays: w.gameDays, nGameDays: n.gameDays });
    }
  }
  const g2Pass = g2.length ? g2.every(x => x.ok) : null;
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 3 && rows.every(r => r.days > 0 && r.ts && typeof r.ts === 'object' && r.court && typeof r.court === 'object');
  // Deciding cost bar (control = nowait).
  let armOnlyStarv = 0, armOnlyStarvSeeds = [];
  for (const seed of seeds) {
    const n = rows.find(r => r.arm === 'nowait' && r.seed === seed);
    const w = rows.find(r => r.arm === 'wait' && r.seed === seed);
    if (n && w && (n.starvationDeaths || 0) === 0 && (w.starvationDeaths || 0) > 0) {
      armOnlyStarv += w.starvationDeaths;
      armOnlyStarvSeeds.push(seed);
    }
  }
  const enteredDelta = byArm.wait.entered - byArm.nowait.entered;
  const wonDelta = byArm.wait.won - byArm.nowait.won;
  const primaryPass = enteredDelta >= 2 || wonDelta >= 2;
  const waitHarmful = (byArm.nowait.entered - byArm.wait.entered >= 2) || (byArm.nowait.won - byArm.wait.won >= 2);
  const costStarvTotal = byArm.wait.starvationDeaths <= byArm.nowait.starvationDeaths + 2;
  const costArmOnly = armOnlyStarv <= 2;
  const costMedian = byArm.wait.medianDays >= 0.8 * byArm.nowait.medianDays;
  const go = primaryPass && costStarvTotal && costArmOnly && costMedian;
  const report = {
    label: 'sim-waitseat-a pilot', seeds, days, rows, byArm,
    gates: { g2PreNationalReadOnly: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    deltas: { enteredDelta, wonDelta, waitHarmful },
    costBar: { control: 'nowait', armOnlyStarvationDeaths: armOnlyStarv, armOnlyStarvationSeeds: armOnlyStarvSeeds,
      starvationTotalPass: costStarvTotal, armOnlyPass: costArmOnly, medianPass: costMedian,
      medianRatio: byArm.nowait.medianDays ? byArm.wait.medianDays / byArm.nowait.medianDays : null },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff (entered_wait - entered_nowait >= 2 OR won_wait - won_nowait >= 2) AND starvation wait total <= nowait total + 2 AND arm-only starvation <= 2 AND median days wait >= 0.8 x median days nowait',
    primaryPass, generated: new Date().toISOString(),
  };
  const out = path.join(REPO, 'evidence', '2026-11-24', 'sim-waitseat-a-sweep.json');
  writeConfig(out, JSON.stringify(report, null, 2) + '\n');
  console.log('\n=== sim-waitseat-a pilot ===');
  for (const arm of ['baseline', 'wait', 'nowait']) {
    const b = byArm[arm];
    console.log(`  ${arm}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} tableInv=${b.tableInvited} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starv=${b.starvationDeaths} deaths=${b.totalDeaths} seatAtt=${b.seatAttempts} seatTaken=${b.seatTaken} seatDays=${JSON.stringify(b.seatDays)} seatKinds=${JSON.stringify(b.seatKinds)} answers=${b.tableAnswers} paths=${JSON.stringify(b.tablePaths)} waitDays=${b.waitDays} waitReturns=${b.waitReturns} waitStranded=${b.waitStranded} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady}`);
  }
  console.log(`  G2 pre-national read-only: ${g2Pass === null ? 'n/a (every seed reached national on some arm)' : (g2Pass ? 'PASS' : 'FAIL')} (${g2.length} comparable seeds)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  PRIMARY entered wait=${byArm.wait.entered} nowait=${byArm.nowait.entered} delta=${enteredDelta} (need>=2); won wait=${byArm.wait.won} nowait=${byArm.nowait.won} delta=${wonDelta} (need>=2) -> ${primaryPass ? 'PASS' : 'FAIL'}; waitHarmful=${waitHarmful}`);
  console.log(`  COST starvation total wait=${byArm.wait.starvationDeaths} nowait=${byArm.nowait.starvationDeaths} -> ${costStarvTotal ? 'PASS' : 'FAIL'}; arm-only=${armOnlyStarv} (seeds ${JSON.stringify(armOnlyStarvSeeds)}) -> ${costArmOnly ? 'PASS' : 'FAIL'}; median wait=${byArm.wait.medianDays} nowait=${byArm.nowait.medianDays} ratio=${report.costBar.medianRatio} -> ${costMedian ? 'PASS' : 'FAIL'}`);
  console.log(`  VERDICT: ${report.verdict} -> ${out}`);
  console.log('  NOTE: run --detgate separately for G1 (both gates unset delegation).');
  if (g2Pass === false || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '107383', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  const w = await runOne('wait-detgate', seed, days, null);
  const n = await runOne('nowait-detgate', seed, days, null);
  const wOk = c.days === w.days && c.gameDays === w.gameDays && !(w.ts.tsSeatTaken || w.ts.tsWaitDays || w.ts.tsSeatAttempts);
  const nOk = c.days === n.days && c.gameDays === n.gameDays && !(n.ts.tsSeatTaken || n.ts.tsWaitDays || n.ts.tsSeatAttempts);
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} | tableseat(gate unset) days=${w.days} gameDays=${w.gameDays} ts=${JSON.stringify(w.ts)} -> ${wOk ? 'PASS' : 'FAIL'} | tableseat-nowait(gate unset) days=${n.days} gameDays=${n.gameDays} ts=${JSON.stringify(n.ts)} -> ${nOk ? 'PASS' : 'FAIL'}`);
  if (!wOk || !nOk) process.exit(1);
}

async function senseMode(seedArg, armArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '107383', 10);
  const arm = (process.env.SENSE_ARM || armArg || 'wait').toLowerCase() === 'nowait' ? 'nowait' : 'wait';
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-24', `sim-waitseat-a-sense-${arm}.txt`);
  process.env.LEANLINKRESCUE = '1';
  if (arm === 'wait') { process.env.TABLESEAT = '1'; delete process.env.TABLESEATNOWAIT; }
  else { delete process.env.TABLESEAT; process.env.TABLESEATNOWAIT = '1'; }
  const base = arm === 'wait' ? tableseat : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'waitseat-sense-' + arm, fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, base, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-${arm} (LEANLINKRESCUE=1, ${arm === 'wait' ? 'TABLESEAT' : 'TABLESEATNOWAIT'}=1) days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body);
  console.log(`SENSE-DONE seed=${seed} arm=${arm} end=${result.endReason} ring=${ring.length} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1], args[args.indexOf('--sense') + 2]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('WAITSEAT SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
