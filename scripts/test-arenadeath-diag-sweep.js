#!/usr/bin/env node
// scripts/test-arenadeath-diag-sweep.js — sim-arenadeath-a pilot + proof gates
// (scale-onramp axis, 2026-10-24, run fleshout-20261024T2315Z).
//
// QUESTION: sim-vetkill-a proved 4/8 band seeds are KILLED-DEAD-KILLER
// (wave-3+ killers who then die, 7/8 dead killers carrying fallen cause
// "the arena") — but its fallen map was FIRST-WINS per vid, so it cannot
// answer the FULL fallen list per killer (backlog item #949: the 73672
// ethan_hunt day-56-before-day-103-kill anomaly), each killer's arena
// history from the surfaces the engine actually keeps, whether arena
// participation for killers is mandatory/voluntary/mixed (from code),
// or the arena-death rate for wave-3+ killers vs villagers overall.
// This sweep records all of it, pure-read, on the SAME seeds.
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, ARENADEATH unset).
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     arenadeath-diag.js (ARENADEATH=1). The recorder is PURE-READ and
//     never calls villageStandingTotal() during a run; it copies the
//     kill log, the FULL fallen array, and the contest/arena memory
//     surfaces. So baseline and armed runs must be IDENTICAL (G2).
//
// Modes:
//   default: pilot sweep. SEEDS="73671,..." (default 73671-73678), DAYS=180
//     (default), EVID=evidence/2026-10-24/perseed-arenadeath-a (default).
//     Per-config INCREMENTAL corpus writes. Prints a table + verdict.
//     Exit 0 on a completed sweep with all gates passing; exit 1 on
//     proof-gate failure (G2/G3/G4).
//   --detgate: G1 delegation proof on one seed (SEED env, default 73671):
//     tableseat-nowait vs arenadeath-wrapped tableseat-nowait with
//     ARENADEATH unset must match on days/gameDays/ts counters with no
//     _arenadeathdiag surface. Exit 1 on mismatch.
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): armed policy on one
//     seed with the say ring, written to
//     evidence/2026-10-24/sim-arenadeath-a-sense.txt.
//
// Proof gates (failures exit 1 in sweep mode):
//   G1 det-gate: see --detgate (run separately; the sweep prints a reminder).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical.
//   G3 corpus integrity: every config produced a row, no zero-day rows,
//     every armed row carries the per-killer arena table + full fallen
//     lists, every baseline row carries a post-run pure-read kill-log
//     snapshot.
//   G4 classification completeness: EACH killer on KILLED-DEAD seeds
//     73671/73672/73673/73676 classified (not UNCLASSIFIED) with evidence.
//   DIAG-GO iff G1 AND G2 AND G3 AND G4. The classification VERDICT
//   itself (which class wins) is a finding, not a pass/fail.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withArenadeathDiag, arenaSnapshot } = require('./policies/arenadeath-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const FOCUS_SEEDS = [73671, 73672, 73673, 73676];
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

// Post-run pure-read arena snapshot: full kill log + FULL fallen list +
// contest/arena memory surfaces + per-killer classification + rates.
// Runs AFTER runDays, so its reads cannot affect any trajectory on
// either arm. The armed traj (daily lastContest snapshots) is passed
// through when available so per-killer lastContest timelines exist.
function arenaSnap(Game, traj) {
  return arenaSnapshot(Game, traj || null);
}

function trajSummary(traj) {
  if (!traj || !traj.length) return null;
  let errs = 0, scholarChanges = 0, lastContestKeys = 0;
  const seenLC = new Set();
  let prevScholar = null;
  for (const p of traj) {
    errs += p.errs | 0;
    if (prevScholar !== null && p.scholarVid !== prevScholar) scholarChanges++;
    prevScholar = p.scholarVid;
    const lc = p.lastContest;
    if (lc) {
      const key = (lc.day || 0) + '|' + (lc.name || '') + '|' + (lc.ids || []).join(',') + '|' + (lc.died || []).join(',');
      if (!seenLC.has(key)) { seenLC.add(key); lastContestKeys++; }
    }
  }
  return { nPoints: traj.length, errs, scholarChanges, lastContestKeys };
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  if (pid === 'armed') process.env.ARENADEATH = '1';
  else delete process.env.ARENADEATH;
  const base = pid === 'armed'
    ? withArenadeathDiag(tableseatNowait, 'arenadeath-diag', 'tableseat-nowait + arena-death recorder')
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'arenadeath-diag-' + pid, fullTelemetry: false });
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
  const traj = (capturedCtx && capturedCtx._arenadeathdiag) ? capturedCtx._arenadeathdiag.traj : null;
  const as = arenaSnap(Game, traj);
  let diag = null;
  if (capturedCtx && capturedCtx._arenadeathdiag) {
    const D = capturedCtx._arenadeathdiag;
    diag = { days: D.days, errs: D.errs, traj: D.traj, trajSummary: trajSummary(D.traj) };
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
    arenaSnapshot: as, diag,
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
  let killersTotal = 0, killersDead = 0, killersArenaDead = 0, killersLiving = 0;
  const classCounts = {};
  for (const r of rs) {
    const rt = r.arenaSnapshot && r.arenaSnapshot.rates;
    if (!rt) continue;
    killersTotal += rt.killersTotal || 0;
    killersDead += rt.killersDead || 0;
    killersArenaDead += rt.killersArenaDead || 0;
    killersLiving += rt.killersLiving || 0;
    for (const k of Object.keys(rt.killersClassCounts || {})) classCounts[k] = (classCounts[k] || 0) + (rt.killersClassCounts[k] || 0);
  }
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
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    seatTaken: rs.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rs.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rs.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    previewSeen: rs.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rs.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rs.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
    killersTotal, killersDead, killersArenaDead, killersLiving, killersClassCounts: classCounts,
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-arenadeath-a');
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const pid of ['baseline', 'armed']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      const as = row.arenaSnapshot;
      const t = row.diag && row.diag.trajSummary;
      const kline = (as.killers || []).map(k => `${k.by}:${k.class}(k${k.kills},d${k.firstDay}${k.daysToArenaDeath != null ? '->+' + k.daysToArenaDeath : ''})`).join(' ');
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} logEntries=${as.entries.length} fallenEntries=${as.fallen.length} killers=${as.rates.killersTotal} deadKillers=${as.rates.killersDead} arenaDeadKillers=${as.rates.killersArenaDead} fallenDistinct=${as.rates.fallenDistinctVids} fallenArenaOrContest=${as.rates.fallenArenaOrContestDistinct}${t ? ` trajDays=${t.nPoints} scholarChanges=${t.scholarChanges} lastContestKeys=${t.lastContestKeys} trajErrs=${t.errs}` : ''} ts=${JSON.stringify(row.ts)}`);
      console.log(`    killers: ${kline || '(none)'}`);
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
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.arenaSnapshot && r.arenaSnapshot.killers)
    && armedRows.length === seeds.length && armedRows.every(r => r.diag && r.diag.traj && r.diag.traj.length > 0 && r.diag.trajSummary
      && r.arenaSnapshot.fallen && r.arenaSnapshot.killers);
  // G4: each killer on KILLED-DEAD seeds classified (not UNCLASSIFIED).
  const focusRows = armedRows.filter(r => FOCUS_SEEDS.indexOf(r.seed) >= 0);
  const focusKillers = [];
  for (const r of focusRows) {
    for (const k of (r.arenaSnapshot.killers || [])) {
      focusKillers.push({ seed: r.seed, by: k.by, kills: k.kills, firstDay: k.firstDay, class: k.class, reason: k.reason, daysToArenaDeath: k.daysToArenaDeath, chronology: k.chronology, fallenAll: k.fallenAll });
    }
  }
  const focusUnclassified = focusKillers.filter(k => k.class === 'UNCLASSIFIED');
  const g4Pass = focusRows.length === FOCUS_SEEDS.length && focusUnclassified.length === 0;
  const diagGo = g2Pass && g3Pass && g4Pass;
  const report = {
    label: 'sim-arenadeath-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, focusKillers, focusUnclassified, g4Pass },
    verdictInputs: { g2Pass, g3Pass, g4Pass },
    verdict: diagGo ? 'DIAG-GO-INPUTS' : 'DIAG-NO-GO',
    verdictRule: 'DIAG-GO iff G1 passes (separate --detgate run) AND G2 recorder neutrality passes AND G3 corpus integrity passes AND G4 (each killer on KILLED-DEAD seeds 73671/73672/73673/73676 classified, not UNCLASSIFIED) passes. The classification verdict itself is a finding, not a pass/fail.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-arenadeath-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal} seatAttempts=${b.seatAttempts} seatTaken=${b.seatTaken} seatFailed=${b.seatFailed} previewSeen=${b.previewSeen} previewNotReady=${b.previewNotReady} tableAnswers=${b.tableAnswers} killers=${b.killersTotal} deadKillers=${b.killersDead} arenaDeadKillers=${b.killersArenaDead} livingKillers=${b.killersLiving} classCounts=${JSON.stringify(b.killersClassCounts)}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical)`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  G4 classification completeness: ${g4Pass ? 'PASS' : 'FAIL'} focusKillers=${focusKillers.length} unclassified=${focusUnclassified.length} ${JSON.stringify(focusUnclassified)}`);
  console.log(`  VERDICT (pending G1 det-gate): ${report.verdict} -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (ARENADEATH unset delegation).');
  if (!g2Pass || !g3Pass || !g4Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.ARENADEATH;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withArenadeathDiag(tableseatNowait, 'arenadeath-diag', 'tableseat-nowait + arena-death recorder');
  const { Game } = await loadGame({ seed, mode: 'arenadeath-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._arenadeathdiag);
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(ARENADEATH unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73676', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-arenadeath-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.ARENADEATH = '1';
  const armed = withArenadeathDiag(tableseatNowait, 'arenadeath-diag', 'tableseat-nowait + arena-death recorder');
  const { Game } = await loadGame({ seed, mode: 'arenadeath-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  let ksLine = 'arenaSnapshot: unavailable';
  try {
    const as = arenaSnap(Game, null);
    const kline = (as.killers || []).map(k => `${k.by}:${k.class}`).join(' ');
    ksLine = `arenaSnapshot: logEntries=${as.entries.length} fallenEntries=${as.fallen.length} killers=${kline || '(none)'} rates=${JSON.stringify(as.rates)}`;
  } catch (e) { ksLine = 'arenaSnapshot error: ' + String((e && e.message) || e).slice(0, 120); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+arenadeath-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    ksLine,
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
if (require.main === module) main().catch(e => { console.error('ARENADEATH-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter, arenaSnap, trajSummary };
