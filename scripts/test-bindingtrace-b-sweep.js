#!/usr/bin/env node
// scripts/test-bindingtrace-b-sweep.js — sim-bindingtrace-b pilot + proof gates
// (scale-onramp / winnability chain, 2026-11-10, run
// fleshout-loop-b-20261110T1030Z).
//
// QUESTION (follow-up to sim-binddiag-b, 2026-11-08): that arm proved the
// LEAD road delivers national on the tableseat-nowait substrate (4/8
// national, all five beats First Court, day 77) and that The Binding (the
// BELONG road's beat) NEVER FIRED — because the substrate forms ZERO
// Haven-subordinate links. This arm does NOT re-assert that it fails; it
// traces the BELONG chain stage by stage and names the FIRST failing link
// per seed: foreign 4-realm forms -> Haven becomes a subordinate (counter
// accept) -> belong link reaches good standing -> belong qualifies (good +
// realm >= 4) -> The Binding stages (LEAD-mask recorded) -> resolved
// (answered / walked / died + why).
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, BINDIAG + BINDINGTRACE unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/binddiag-b.js
//     (BINDIAG=1) and scripts/policies/bindingtrace-b.js (BINDINGTRACE=1).
//     Both recorders are PURE-READ: they write nothing to game state and
//     draw no RNG — so baseline and armed trajectories must be IDENTICAL
//     (G2), and the delta is measurement only.
//
// Modes:
//   default: pilot sweep. SEEDS="81201,..." (default 81201-81208), DAYS=180
//     (default), EVID=evidence/2026-11-10/perseed-bindingtrace-b (default).
//     Per-config INCREMENTAL corpus writes. Prints a belong-chain funnel +
//     per-seed first-failing-link table + verdict. Exit 0 on a completed
//     sweep regardless of DIAG-GO/NO-GO (the verdict is data, not a script
//     failure); exit 1 on proof-gate failure.
//   --detgate: G1 delegation proof on one seed (SEED env, default 81201):
//     tableseat-nowait vs both-recorders-wrapped tableseat-nowait with
//     BINDIAG + BINDINGTRACE unset must match on days/gameDays/ts counters
//     with no _binddiag / _bindingtrace surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-11-10/sim-bindingtrace-b-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical — the recorders fire
//     daily everywhere, so any divergence anywhere is a leak.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     endSnap on every row, diag (binddiag) + btrace blocks on every armed
//     row, engine-gated validation matching on every armed row.
//   BEFORE-VALIDITY (the arm's own bar, per the 2026-11-09 flee-loop
//     finding): national-ever >= 4/8 on the armed arm. A before side with
//     too few national events cannot test the mechanism; below 4/8 the
//     arm reports NO-GO on before-validity even if G1/G2/G3 pass.
//
// Verdict (computed, not asserted): DIAG-GO iff 8/8 armed rows carry a
// full belong-chain trace + a classification (first failing link named) on
// >= 7/8 seeds AND before-validity holds (national-ever >= 4/8) AND G1
// passes AND G2 passes AND G3 passes.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withBindDiag, snapBindingEnd } = require('./policies/binddiag-b');
const { withBindingTrace, classifyBelong } = require('./policies/bindingtrace-b');
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

function armedPolicy() {
  return withBindingTrace(
    withBindDiag(tableseatNowait, 'binddiag-b', 'tableseat-nowait + Binding pipeline recorder'),
    'bindingtrace-b', 'tableseat-nowait + binddiag-b + BELONG chain tracer');
}

async function runOne(pid, seed, days, evidDir) {
  // Env pairing: LEANLINKRESCUE=1 + TABLESEATNOWAIT=1 for BOTH arms (the
  // tableseat substrate is shared exactly); BINDIAG=1 + BINDINGTRACE=1
  // only for armed. All policy gates read env per daily call, so setting
  // env between configs in one process is safe.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'armed') { process.env.BINDIAG = '1'; process.env.BINDINGTRACE = '1'; }
  else { delete process.env.BINDIAG; delete process.env.BINDINGTRACE; }
  const base = pid === 'armed' ? armedPolicy() : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'bindingtrace-b-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false, everGlobal: false };
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
        if ((RANK_ORDER[s.rank] || 0) >= 3) hist.everGlobal = true;
      } catch (e) {}
      if (base.daily) { try { return base.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // End snapshot: pure-read, computed AFTER runDays, so it cannot affect
  // the trajectory on either arm. Includes the engine-gated validation.
  let endSnap = null;
  try { endSnap = snapBindingEnd(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  // Recorder blocks (armed only).
  let diag = null;
  if (capturedCtx && capturedCtx._binddiag) {
    const D = capturedCtx._binddiag;
    diag = {
      days: D.days, errs: D.errs,
      first: D.first,
      maxSeasonedSubs: D.maxSeasonedSubs, maxSubs: D.maxSubs,
      beats: D.beats, nationalLost: D.nationalLost,
      refusedDay: D.refusedDay, refusedShape: D.refusedShape,
      winDay: D.winDay, winSnap: D.winSnap || null,
      traj: D.traj,
    };
  }
  let btrace = null;
  if (capturedCtx && capturedCtx._bindingtrace) {
    const D = capturedCtx._bindingtrace;
    btrace = {
      days: D.days, errs: D.errs,
      first: D.first,
      maxForeignSize: D.maxForeignSize, maxForeignPrimary: D.maxForeignPrimary,
      counters: D.counters, linkForms: D.linkForms,
      belongLinks: D.belongLinks,
      belongQualifyDays: D.belongQualifyDays, leadMaskDays: D.leadMaskDays,
      maskStageDays: D.maskStageDays, nationalLiveViaLead: D.nationalLiveViaLead,
      bindingBeats: D.bindingBeats,
      classification: classifyBelong(D),
      traj: D.traj,
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
    globalEver: hist.everGlobal ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    enteredFull: (endSnap && endSnap.seat === 'full') ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts, ctxExtra,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    endSnap,
    diag, btrace,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

// Belong-chain funnel: for each chain stage, seeds reaching it + median
// first-day. The binding stage is the one where the most seeds drop out.
function belongFunnel(rows) {
  const rs = rows.filter(r => r.policy === 'armed' && r.btrace);
  const stages = [
    ['foreignRealm', r => r.btrace.first.foreignRealmDay != null, r => r.btrace.first.foreignRealmDay],
    ['belongLink', r => r.btrace.first.firstBelongLinkDay != null, r => r.btrace.first.firstBelongLinkDay],
    ['belongGood', r => r.btrace.first.firstBelongGoodDay != null, r => r.btrace.first.firstBelongGoodDay],
    ['belongQualify', r => r.btrace.first.firstBelongQualifyDay != null, r => r.btrace.first.firstBelongQualifyDay],
    ['bindingStaged', r => r.btrace.first.firstBindingStagedDay != null, r => r.btrace.first.firstBindingStagedDay],
    ['bindingAnswered', r => r.btrace.first.firstBindingAnsweredDay != null, r => r.btrace.first.firstBindingAnsweredDay],
    ['national', r => r.diag && r.diag.first.nationalDay != null, r => r.diag.first.nationalDay],
  ];
  return stages.map(([name, reach, dayOf]) => {
    const reached = rs.filter(reach);
    return {
      stage: name, reached: reached.length, of: rs.length,
      medianFirstDay: reached.length ? medianOf(reached.map(dayOf)) : null,
      seeds: reached.map(r => r.seed),
    };
  });
}

function aggregate(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rs) starvBySeed[r.seed] = r.starvationDeaths;
  let shapes = null, classifications = null;
  if (pid === 'armed') {
    const staged = {}, delivered = {}, outcomes = {};
    let nationalLostTotal = 0, refusedTotal = 0;
    const classCounts = {};
    const classBySeed = {};
    for (const r of rs) {
      if (r.diag) {
        for (const b of (r.diag.beats || [])) {
          staged[b.shape] = (staged[b.shape] || 0) + 1;
          outcomes[b.outcome || 'pending'] = (outcomes[b.outcome || 'pending'] || 0) + 1;
          if (b.outcome === 'answered') delivered[b.shape] = (delivered[b.shape] || 0) + 1;
        }
        nationalLostTotal += (r.diag.nationalLost || []).length;
        if (r.diag.refusedDay != null) refusedTotal++;
      }
      if (r.btrace && r.btrace.classification) {
        const link = r.btrace.classification.link;
        classCounts[link] = (classCounts[link] || 0) + 1;
        classBySeed[r.seed] = r.btrace.classification;
      }
    }
    shapes = { staged, delivered, outcomes, nationalLostTotal, refusedTotal };
    classifications = { counts: classCounts, bySeed: classBySeed };
  }
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    medianGameDays: medianOf(rs.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    globalEver: rs.reduce((t, r) => t + r.globalEver, 0),
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
    shapes, classifications,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '81201,81202,81203,81204,81205,81206,81207,81208')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-10', 'perseed-bindingtrace-b');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      const F = row.diag ? row.diag.first : {};
      const B = row.btrace ? row.btrace.first : {};
      const C = row.btrace ? row.btrace.classification : null;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} enteredFull=${row.enteredFull} won=${row.won} starv=${row.starvationDeaths} first=${JSON.stringify(F)} belongFirst=${JSON.stringify(B)} class=${C ? C.stage + ':' + C.link : '-'} beats=${row.diag ? row.diag.beats.map(b => `${b.shape}:${b.outcome}`).join(',') : '-'} natLost=${row.diag ? row.diag.nationalLost.length : '-'} gatedMatch=${row.endSnap ? row.endSnap.gatedMatchesEngine : '-'} ts=${JSON.stringify(row.ts)}`);
    }
  }
  const byPolicy = { baseline: aggregate(rows, 'baseline'), armed: aggregate(rows, 'armed') };
  const fun = belongFunnel(rows);
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
  // G3: corpus integrity + engine-gated validation on every armed row.
  const armedRows = rows.filter(r => r.policy === 'armed');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.endSnap && !r.endSnap.error)
    && armedRows.length === seeds.length
    && armedRows.every(r => r.diag && r.diag.days > 0 && r.diag.traj && r.diag.traj.length > 0 && r.diag.first
      && r.btrace && r.btrace.days > 0 && r.btrace.traj && r.btrace.traj.length > 0 && r.btrace.first && r.btrace.classification
      && r.endSnap.gatedMatchesEngine === true);
  // Verdict inputs.
  const armedTraced = armedRows.every(r => r.btrace && r.btrace.traj && r.btrace.traj.length > 0 && r.btrace.first && r.btrace.classification);
  const classifiedCount = armedRows.filter(r => r.btrace && r.btrace.classification && r.btrace.classification.link).length;
  const classifiedOk = classifiedCount >= 7;
  const beforeValidity = byPolicy.armed.nationalEver >= 4;
  const diagGo = armedTraced && classifiedOk && beforeValidity && g2Pass && g3Pass;
  const report = {
    label: 'sim-bindingtrace-b pilot', seeds, days, rows, byPolicy, funnel: fun,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass },
    verdictInputs: { armedTraced, classifiedCount, classifiedOk, beforeValidityNationalEver: byPolicy.armed.nationalEver, beforeValidity, g2Pass, g3Pass },
    verdict: diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff 8/8 armed rows carry a full belong-chain trace + classification on >= 7/8 seeds AND before-validity holds (national-ever >= 4/8) AND G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes (incl. engine-gated validation)',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-bindingtrace-b pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} globEver=${b.globalEver} table=${b.table} entered=${b.entered} enteredFull=${b.enteredFull} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers}`);
    if (b.shapes) console.log(`    shapes staged=${JSON.stringify(b.shapes.staged)} delivered=${JSON.stringify(b.shapes.delivered)} outcomes=${JSON.stringify(b.shapes.outcomes)} nationalLostTotal=${b.shapes.nationalLostTotal} refusedTotal=${b.shapes.refusedTotal}`);
    if (b.classifications) console.log(`    first-failing-link counts=${JSON.stringify(b.classifications.counts)}`);
  }
  console.log('  belong funnel: ' + fun.map(f => `${f.stage}:${f.reached}/${f.of}(medDay ${f.medianFirstDay})`).join(' '));
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  before-validity (national-ever >= 4/8): ${beforeValidity ? 'PASS' : 'FAIL'} (armed national-ever ${byPolicy.armed.nationalEver}/8)`);
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} (armedTraced ${armedTraced ? 'PASS' : 'FAIL'}; classified ${classifiedCount}/8 ${classifiedOk ? 'PASS' : 'FAIL'}; beforeValidity ${beforeValidity ? 'PASS' : 'FAIL'}; G2 ${g2Pass ? 'PASS' : 'FAIL'}; G3 ${g3Pass ? 'PASS' : 'FAIL'}) -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (BINDIAG + BINDINGTRACE unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '81201', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  // Wrapped policy under BINDIAG+BINDINGTRACE-unset env: run the wrapped
  // policy directly (runOne('armed') would set the env flags, which is not
  // the gate).
  delete process.env.BINDIAG;
  delete process.env.BINDINGTRACE;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = armedPolicy();
  const { Game } = await loadGame({ seed, mode: 'bindingtrace-b-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._binddiag || capturedCtx._bindingtrace));
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(BINDIAG+BINDINGTRACE unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '81201', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-11-10', 'sim-bindingtrace-b-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.BINDIAG = '1';
  process.env.BINDINGTRACE = '1';
  const armed = armedPolicy();
  const { Game } = await loadGame({ seed, mode: 'bindingtrace-b-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let rank = 'village';
  try { rank = Game.scaleRank ? Game.scaleRank() : 'village'; } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+binddiag-b+bindingtrace-b days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} finalRank=${rank} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} finalRank=${rank} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('BINDINGTRACE-B SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
