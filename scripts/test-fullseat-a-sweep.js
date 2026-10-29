#!/usr/bin/env node
// scripts/test-fullseat-a-sweep.js — sim-fullseat-a pilot + proof gates
// (scale-onramp axis, 2026-10-29, run fleshout-20261029T1715Z, backlog #920).
//
// QUESTION: on the tableseat substrate (leanlinkrescue courtship + seat
// legs, no wait), does a FULL-SEAT-PURSUING policy produce full-seat
// offers — or is the full seat still decoration? The 2115Z diag arm
// recorded the blockers (w5 8/8 unreachable, w4 6/8, surge-deed 6/8)
// without pursuing. This arm pursues: it DECLINES ready lesser seats
// (the diag arm's truncation finding: lesser wins end runs before wave
// bars fill) and adds patrol / channel / feast / integration verbs.
//
// PAIRING (exact, identical seeds):
//   OFF = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1) wrapped with scripts/policies/fullseat-diag.js
//     (FULLSEAT=1, pure-read recorder).
//   ON  = scripts/policies/fullseat-pursuit.js (LEANLINKRESCUE=1,
//     FULLSEATPURSUIT=1) wrapped with fullseat-diag (FULLSEAT=1).
// Courtship shared exactly (ON runs leanlinkrescue.daily directly, not
// tableseat-nowait.daily, so the seat-leg delta is only the full-only
// gate). Fight behavior identical both arms (competent.fight; neither
// policy defines a fight hook). Contests harness-driven (choice 0)
// identically both arms.
//
// Modes:
//   default: pilot sweep. SEEDS (default 76001-76008), DAYS=180
//     (default), EVID=evidence/2026-10-29/perseed-fullseat-a (default).
//     Per-config INCREMENTAL corpus writes (tableseat precedent).
//     Prints a table + verdict. Exit 0 on a completed sweep regardless
//     of GO/NO-GO (the verdict is data, not a script failure); exit 1
//     on proof-gate failure (G3; G1/G2/G4 run separately).
//   --detgate: G1 (pursuit gate-off == tableseat-nowait) + G2 (diag
//     neutrality re-proof on current master) on one seed (SEED env,
//     default 76001). Exit 1 on mismatch.
//   --determ SEED: G4 determinism — run the ON config twice, compare
//     rows modulo corpusFile/corpusSha. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): ON policy on one
//     seed with the say ring, written to
//     evidence/2026-10-29/sim-fullseat-a-sense.txt (SENSE_OUT env).
//
// Proof gates (prereg):
//   G1 pursuit det-gate: see --detgate.
//   G2 diag neutrality: see --detgate.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     endSnap with dist on every row, diag block on every row.
//   G4 determinism: see --determ.
//   G5 pre-national read-only: DIAGNOSTIC ONLY (pursuit verbs may
//     diverge pre-national trajectories by design) — reported, never
//     a gate failure.
//
// Verdict (computed, not asserted): GO iff (ON full-offer seeds >= 2 OR
// ON full-entered seeds >= 1) AND starvationTotal ON <= OFF + 2 AND
// arm-only starvation <= 2 AND medianDays ON >= 0.8 x medianDays OFF.
// Full-offer seed = at least one daily wrapper tablePreview() returning
// seat 'full' (ready or not — the seat is priced full; fullReady and
// fullEntered are reported separately). The evidence file judges; this
// script only reports.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { fullseatPursuit } = require('./policies/fullseat-pursuit');
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

function distFromSnap(s) {
  if (!s || !s.dist) return null;
  const d = {};
  for (const k of COMP_ORDER) d[k] = (s.dist[k] | 0);
  return { dist: d, binding: (s.binding || []).slice(), worst: s.worst || null, seat: s.seat || 'none', ok: !!s.ok };
}

async function runOne(pid, seed, days, evidDir) {
  // Env pairing: LEANLINKRESCUE=1 + TABLESEATNOWAIT=1 for BOTH arms
  // (substrate shared exactly); FULLSEAT=1 both arms (diag recorder);
  // FULLSEATPURSUIT=1 only for ON. Policy gates read env per daily
  // call, so setting env between configs in one process is safe.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  if (pid === 'on') process.env.FULLSEATPURSUIT = '1';
  else delete process.env.FULLSEATPURSUIT;
  const inner = pid === 'on' ? fullseatPursuit : tableseatNowait;
  const base = withFullseatDiag(inner, 'fullseat-diag', 'tableseat substrate + full-seat recorder');
  const { Game } = await loadGame({ seed, mode: 'fullseat-a-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const pvHist = { fullDays: 0, fullReadyDays: 0, lesserDays: 0, nullDays: 0, overtimeMax: 0 };
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
        // Pure-read preview pricing (same class as snap(): reads only;
        // tablePreview/tableSeat/tableEarnedPaths write nothing).
        try {
          const pv = (typeof G.tablePreview === 'function') ? G.tablePreview() : null;
          if (!pv) pvHist.nullDays++;
          else if (pv.seat === 'full') { pvHist.fullDays++; if (pv.ready) pvHist.fullReadyDays++; }
          else if (pv.seat === 'lesser') pvHist.lesserDays++;
          if (pv && pv.overtime != null) pvHist.overtimeMax = Math.max(pvHist.overtimeMax, pv.overtime | 0);
        } catch (e) {}
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  let endSnap = null;
  try { endSnap = snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
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
    if (D.max) {
      const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
      const md = {};
      for (const k of ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage']) md[k] = Math.max(0, BARS[k] - (D.max[k] | 0));
      md.foodDeeds = (D.sentDay != null && D.surgeDay != null) ? 0 : 1;
      diag.maxDist = md;
    }
  }
  const ts = {}, fsc = {}, ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      else if (k.indexOf('fs') === 0) fsc[k] = capturedCtx[k];
      else if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const winSnapRow = (end.won && diag && diag.winSnap) ? diag.winSnap
    : (end.won ? distFromSnap(endSnap) : null);
  const seatKindTaken = pid === 'on' ? (fsc.fsSeatKind || null) : (ts.tsSeatKind || null);
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
    enteredKind: (hist.everEntered || end.tableEntered) ? (seatKindTaken || (endSnap && endSnap.seat) || null) : null,
    fullOffer: pvHist.fullDays > 0 ? 1 : 0,
    fullReady: pvHist.fullReadyDays > 0 ? 1 : 0,
    fullEntered: ((pid === 'on' ? (fsc.fsSeatTaken || 0) : (ts.tsSeatTaken || 0)) > 0 && seatKindTaken === 'full') ? 1 : 0,
    gateFullEver: (diag && diag.firstFullSeatDay != null) ? 1 : 0,
    pvHist,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, fsc, ctxExtra,
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
    enteredFull: rs.reduce((t, r) => t + r.fullEntered, 0),
    enteredLesser: rs.reduce((t, r) => t + ((r.entered && r.enteredKind === 'lesser') ? 1 : 0), 0),
    fullOffer: rs.reduce((t, r) => t + r.fullOffer, 0),
    fullReady: rs.reduce((t, r) => t + r.fullReady, 0),
    gateFullEver: rs.reduce((t, r) => t + r.gateFullEver, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationTotal, 0),
    starvationBySeed: starvBySeed,
    seatTaken: rs.reduce((t, r) => t + ((r.policy === 'on' ? (r.fsc.fsSeatTaken || 0) : (r.ts.tsSeatTaken || 0))), 0),
    seatAttempts: rs.reduce((t, r) => t + ((r.policy === 'on' ? (r.fsc.fsSeatAttempts || 0) : (r.ts.tsSeatAttempts || 0))), 0),
    lesserSkipped: rs.reduce((t, r) => t + (r.fsc.fsLesserSkipped || 0), 0),
    patrols: rs.reduce((t, r) => t + (r.fsc.fsPatrols || 0), 0),
    channels: rs.reduce((t, r) => t + (r.fsc.fsChannels || 0), 0),
    feasts: rs.reduce((t, r) => t + (r.fsc.fsFeasts || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + ((r.policy === 'on' ? (r.fsc.fsTableAnswers || 0) : (r.ts.tsTableAnswers || 0))), 0),
    blockCount, medianEndDist, medianMaxDist, rankedBlockers,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '76001,76002,76003,76004,76005,76006,76007,76008')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-fullseat-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['off', 'on']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} kind=${row.enteredKind} fullOffer=${row.fullOffer} fullReady=${row.fullReady} fullEntered=${row.fullEntered} gateFull=${row.gateFullEver} won=${row.won} starv=${row.starvationDeaths} endSeat=${row.endSnap ? row.endSnap.seat : '?'} endBinding=${row.endSnap ? row.endSnap.binding.join(',') : '?'} ts=${JSON.stringify(row.ts)} fsc=${JSON.stringify(row.fsc)}`);
    }
  }
  const byPolicy = { off: aggregate(rows, 'off'), on: aggregate(rows, 'on') };
  // G3: corpus integrity.
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && r.endSnap.dist && r.diag && r.diag.days > 0);
  // G5: pre-national read-only, DIAGNOSTIC ONLY (pursuit verbs diverge by design).
  const g5 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'off' && r.seed === seed);
    const a = rows.find(r => r.policy === 'on' && r.seed === seed);
    if (c && a && !c.nationalEver && !a.nationalEver) {
      g5.push({ seed, identical: c.days === a.days && c.gameDays === a.gameDays, cDays: c.days, aDays: a.days, cGameDays: c.gameDays, aGameDays: a.gameDays });
    }
  }
  // Guards + primary.
  let armOnlyStarv = 0;
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'off' && r.seed === seed);
    const a = rows.find(r => r.policy === 'on' && r.seed === seed);
    if (c && a && (c.starvationDeaths || 0) === 0 && (a.starvationDeaths || 0) > 0) armOnlyStarv += a.starvationDeaths;
  }
  const primaryPass = byPolicy.on.fullOffer >= 2 || byPolicy.on.fullEntered >= 1;
  const cost1 = byPolicy.on.starvationTotal <= byPolicy.off.starvationTotal + 2;
  const cost2 = armOnlyStarv <= 2;
  const cost3 = byPolicy.on.medianDays >= 0.8 * byPolicy.off.medianDays;
  const go = primaryPass && cost1 && cost2 && cost3;
  const substrateRepro = byPolicy.off.enteredLesser >= 1 && byPolicy.off.nationalEver >= 4;
  const report = {
    label: 'sim-fullseat-a pilot', seeds, days, rows, byPolicy,
    gates: { g3CorpusIntegrity: g3Pass, g5PreNationalDiagnostic: g5 },
    verdictInputs: { primaryPass, onFullOffer: byPolicy.on.fullOffer, onFullEntered: byPolicy.on.fullEntered, costStarvationTotal: cost1, costArmOnlyStarvation: cost2, armOnlyStarvation: armOnlyStarv, costMedianDays: cost3, substrateRepro },
    verdict: go ? 'GO' : 'NO-GO',
    verdictRule: 'GO iff (ON full-offer seeds >= 2 OR ON full-entered seeds >= 1) AND starvationTotal ON <= OFF + 2 AND arm-only starvation <= 2 AND medianDays ON >= 0.8 x medianDays OFF',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-fullseat-a pilot ===');
  for (const pid of ['off', 'on']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} enteredFull=${b.enteredFull} enteredLesser=${b.enteredLesser} fullOffer=${b.fullOffer} fullReady=${b.fullReady} gateFullEver=${b.gateFullEver} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} lesserSkipped=${b.lesserSkipped} patrols=${b.patrols} channels=${b.channels} feasts=${b.feasts} tableAnswers=${b.tableAnswers}`);
    console.log(`    medianEndDist: ${JSON.stringify(b.medianEndDist)}`);
    console.log(`    rankedBlockers: ${b.rankedBlockers.map(x => `${x.component}:${x.seedsBlocked}(medEnd${x.medianEndDist},medMax${x.medianMaxDist})`).join(' ')}`);
  }
  console.log(`  arm-only starvation: ${armOnlyStarv}`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  G5 pre-national diagnostic: ${g5.length} comparable seeds, ${g5.filter(x => x.identical).length} identical (divergence is pursuit-verb action, not a gate failure)`);
  console.log(`  SUBSTRATE REPRODUCTION: ${substrateRepro ? 'PASS' : 'FAIL'} (OFF lesser entered ${byPolicy.off.enteredLesser} need >= 1; OFF national ever ${byPolicy.off.nationalEver} need >= 4)`);
  console.log(`  VERDICT: ${report.verdict} (primary ${primaryPass ? 'PASS' : 'FAIL'}; cost1 ${cost1 ? 'PASS' : 'FAIL'}; cost2 ${cost2 ? 'PASS' : 'FAIL'}; cost3 ${cost3 ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1/G2, --determ for G4.');
  if (!g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function runBare(base, envSetup, seed, days) {
  envSetup();
  const { Game } = await loadGame({ seed, mode: 'fullseat-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try { return base.daily(G, ctx); } catch (e) {}
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const ts = {}, fsc = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      else if (k.indexOf('fs') === 0) fsc[k] = capturedCtx[k];
    }
  }
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  return { days: result.days, gameDays: result.gameDays, ts, fsc, starvationDeaths: starv.length, hasDiag: !!(capturedCtx && capturedCtx._fullseatdiag) };
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '76001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  // G1: pursuit gate-off == tableseat-nowait.
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  delete process.env.FULLSEATPURSUIT; delete process.env.FULLSEAT;
  const g1a = await runBare(tableseatNowait, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    delete process.env.FULLSEATPURSUIT; delete process.env.FULLSEAT;
  }, seed, days);
  const g1b = await runBare(fullseatPursuit, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    delete process.env.FULLSEATPURSUIT; delete process.env.FULLSEAT;
  }, seed, days);
  const g1Pass = g1a.days === g1b.days && g1a.gameDays === g1b.gameDays
    && JSON.stringify(g1a.ts) === JSON.stringify(g1b.ts) && Object.keys(g1b.fsc).length === 0;
  console.log(`G1 pursuit det-gate seed=${seed}: substrate days=${g1a.days} gameDays=${g1a.gameDays} ts=${JSON.stringify(g1a.ts)} | pursuit(gate off) days=${g1b.days} gameDays=${g1b.gameDays} ts=${JSON.stringify(g1b.ts)} fsKeys=${Object.keys(g1b.fsc).length} -> ${g1Pass ? 'PASS' : 'FAIL'}`);
  // G2: diag neutrality re-proof on current master.
  const g2a = await runBare(tableseatNowait, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    delete process.env.FULLSEAT; delete process.env.FULLSEATPURSUIT;
  }, seed, days);
  const wrapped = withFullseatDiag(tableseatNowait, 'fullseat-diag', 'tableseat-nowait + recorder');
  const g2b = await runBare(wrapped, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    process.env.FULLSEAT = '1'; delete process.env.FULLSEATPURSUIT;
  }, seed, days);
  const g2Pass = g2a.days === g2b.days && g2a.gameDays === g2b.gameDays
    && JSON.stringify(g2a.ts) === JSON.stringify(g2b.ts) && g2a.starvationDeaths === g2b.starvationDeaths;
  console.log(`G2 diag neutrality seed=${seed}: bare days=${g2a.days} gameDays=${g2a.gameDays} starv=${g2a.starvationDeaths} | +diag days=${g2b.days} gameDays=${g2b.gameDays} starv=${g2b.starvationDeaths} diagSurface=${g2b.hasDiag} -> ${g2Pass ? 'PASS' : 'FAIL'}`);
  if (!g1Pass || !g2Pass) process.exit(1);
}

async function determMode(seedArg) {
  const seed = parseInt(process.env.SEED || seedArg || '76001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const r1 = await runOne('on', seed, days, null);
  const r2 = await runOne('on', seed, days, null);
  const strip = (r) => { const c = Object.assign({}, r); delete c.corpusFile; delete c.corpusSha; return JSON.stringify(c); };
  const ok = strip(r1) === strip(r2);
  console.log(`DETERM seed=${seed} ON: run1 days=${r1.days} gameDays=${r1.gameDays} | run2 days=${r2.days} gameDays=${r2.gameDays} -> ${ok ? 'PASS (byte-identical modulo corpus fields)' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '76001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-29', 'sim-fullseat-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEATPURSUIT = '1';
  process.env.FULLSEAT = '1';
  const armed = withFullseatDiag(fullseatPursuit, 'fullseat-diag', 'fullseat-pursuit + recorder');
  const { Game } = await loadGame({ seed, mode: 'fullseat-a-sense', fullTelemetry: false, narration: true });
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
    `seed=${seed} policy=fullseat-pursuit days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--determ')) return determMode(args[args.indexOf('--determ') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('FULLSEAT-A SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
