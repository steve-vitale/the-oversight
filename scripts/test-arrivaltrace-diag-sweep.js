#!/usr/bin/env node
// scripts/test-arrivaltrace-diag-sweep.js — sim-arrivaltrace-a pilot + proof
// (scale-onramp axis, 2026-10-24: trace ONE 1-HP world-entity arrival
// to its source; DIAG ONLY, zero src/js changes).
//
// PAIRING (exact, identical seeds):
//   baseline = scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1, ARRIVATRACE unset). Post-run rows carry a
//     pure-read snapshot only (deed feed wavesFaced + waveKillLog).
//   armed    = tableseat-nowait wrapped with scripts/policies/
//     arrivaltrace-diag.js (ARRIVATRACE=1): daily world census +
//     fieldFight + havenRaidTick + spawnWorldMonster +
//     reengageWaitingMonsters + tbEnd wraps. Observational only.
//
// Modes (per-seed invocation preferred — a vanished long sweep lost
// work on the predecessor run; every row is written incrementally):
//   --one <baseline|armed> <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print gates.
//   --detgate : G1 delegation proof on one seed (SEED env, default
//     73671): tableseat-nowait vs arrivaltrace-wrapped tableseat-nowait
//     with ARRIVATRACE unset must match on days/gameDays/ts with no
//     _arrivaltrace surface and no installed wraps. Exit 1 on mismatch.
//   --detail <seed> : re-run armed on ONE seed, census-match check
//     (days/gameDays/ts/field counts/raid counts) must pass or exit 1,
//     then dump the focus arrival chains.
//   --sense <seed> : NON-MEASURED narration replay, written to
//     evidence/2026-10-24/sim-arrivaltrace-a-sense.txt.
//
// Proof gates (failures exit 1 in --summary mode):
//   G1 det-gate: see --detgate (run separately).
//   G2 recorder neutrality: for ALL 8 seeds, baseline vs armed days,
//     gameDays, ts counters and starvation identical.
//   G3 corpus integrity: 16/16 rows, no zero-day rows, every armed row
//     carries persisted census + event ROWS (not counts alone),
//     every baseline row carries the post-run pure-read snapshot.
//   G4 arrival decision: GO iff a named source path has a traced event
//     chain for >= 1 focus arrival (73675 chorus_line 43->1, 73678
//     spool 28->1) from this corpus, or all four candidates are
//     excluded with control-positive evidence. NO-GO otherwise.
//     The verdict is a FINDING, not a pass/fail; only G2/G3 failures
//     exit 1 in --summary mode.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore, installArrivaltraceDiag, withArrivaltraceDiag,
} = require('./policies/arrivaltrace-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const FOCUS = { 73675: ['chorus_line'], 73678: ['spool'] };
const ALL_FOCUS_TYPES = ['chorus_line', 'spool'];
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

function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

// analyzeArrival(store, seed): per focus type, the arrival chain.
// Returns {chains, controls} where a chain covers each focus arrival:
// first 1-HP field fight, the last pre-arrival fight, census days
// bracketing the drop, and every candidate-path event in the window.
function analyzeArrival(store, seed) {
  const chains = {};
  const types = FOCUS[seed] || ALL_FOCUS_TYPES;
  for (const mid of types) {
    const fights = (store.fieldFights || []).filter(f => f.mid === mid);
    // arrivals: first 1-HP-start fight whose previous fight of the type ended > 1
    const arrivals = [];
    for (let i = 0; i < fights.length; i++) {
      const f = fights[i];
      if (f.startHp !== 1) continue;
      const prev = fights.slice(0, i).filter(x => x.endHp != null).pop();
      if (prev && prev.endHp > 1) arrivals.push({ fight: f, prevFight: prev, prevIndex: i });
    }
    const chainList = arrivals.map(a => {
      const lo = a.prevFight.day, hi = a.fight.day;
      const census = (store.census || []).filter(c => c.day > lo && c.day <= hi);
      const censusFocus = census.map(c => ({ day: c.day, ents: (c.world || []).filter(w => w.id === mid).map(w => ({ hp: w.hp, maxHp: w.maxHp, tx: w.tx, ty: w.ty })) }));
      const censusBefore = (store.census || []).filter(c => c.day <= lo).slice(-1)[0];
      const raids = (store.raids || []).filter(r => r.day > lo && r.day <= hi && (r.diffs || []).some(d => d.id === mid));
      const raidHits = [];
      for (const r of raids) for (const d of (r.diffs || [])) if (d.id === mid) raidHits.push({ day: r.day, tier: r.tier, preHp: d.preHp, postHp: d.postHp, maxHp: d.maxHp, wall: d.wall });
      const spawns = (store.spawns || []).filter(s => s.day > lo && s.day <= hi && s.id === mid);
      const reengages = (store.reengages || []).filter(r => r.day > lo && r.day <= hi && ((r.stash || []).some(s => s && s.id === mid) || (r.fighters || []).some(f2 => f2.monsterId === mid)));
      const tbRestores = (store.tbRestores || []).filter(r => r.day > lo && r.day <= hi && r.pre && r.pre.originId === mid);
      const censusCounts = (store.census || []).filter(c => c.day > lo && c.day <= hi).map(c => ({ day: c.day, n: (c.world || []).filter(w => w.id === mid).length }));
      const multiEntityDays = censusCounts.filter(c => c.n > 1).length;
      return {
        arrivalFight: a.fight, prevFight: a.prevFight,
        window: { loDay: lo, hiDay: hi },
        censusBefore: censusBefore ? { day: censusBefore.day, ents: (censusBefore.world || []).filter(w => w.id === mid) } : null,
        censusWindow: censusFocus,
        censusCounts: censusCounts, multiEntityDays: multiEntityDays,
        raidHits: raidHits, spawnsInWindow: spawns, reengagesInWindow: reengages, tbRestoresInWindow: tbRestores,
      };
    });
    chains[mid] = { fights: fights, arrivals: chainList };
  }
  const controls = {
    raidsTotal: (store.raids || []).length,
    raidsWithHit1: (store.raids || []).filter(r => (r.diffs || []).some(d => d.postHp === 1 && d.preHp != null && d.preHp > 1)).length,
    spawnsTotal: (store.spawns || []).length,
    spawnsAt1: (store.spawns || []).filter(s => s.hp === 1).length,
    spawnsAt1Focus: (store.spawns || []).filter(s => s.hp === 1 && ALL_FOCUS_TYPES.indexOf(s.id) >= 0).length,
    reengagesTotal: (store.reengages || []).length,
    reengagesWithStash1: (store.reengages || []).filter(r => (r.stash || []).some(s => s && s.hp === 1)).length,
    tbRestoresTotal: (store.tbRestores || []).length,
    censusDays: (store.census || []).length,
    censusMultiFocusDays: (store.census || []).filter(c => ALL_FOCUS_TYPES.some(t => (c.world || []).filter(w => w.id === t).length > 1)).length,
  };
  return { chains, controls };
}

function arrivaltraceSnapshot(Game, store) {
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const snapOut = { faced: faced.faced, facedErrs: faced.errs, facedError: faced.error, logEntries: log.entries, logErrs: log.errs, logError: log.error };
  if (!store) { snapOut.analysis = null; snapOut.note = 'snapshot-only: no arrival rows on the baseline arm'; return snapOut; }
  snapOut.census = store.census;
  snapOut.fieldFights = store.fieldFights;
  snapOut.raids = store.raids;
  snapOut.spawns = store.spawns;
  snapOut.reengages = store.reengages;
  snapOut.tbRestores = store.tbRestores;
  snapOut.diag = { errs: store.errs, errors: store.errors, overflow: store.overflow, installed: store.installed };
  return snapOut;
}

async function runOne(pid, seed, days, evidDir, storeHolder) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let store = null;
  if (pid === 'armed') { process.env.ARRIVATRACE = '1'; store = newStore(); if (storeHolder) storeHolder.store = store; }
  else delete process.env.ARRIVATRACE;
  const base = pid === 'armed'
    ? withArrivaltraceDiag(tableseatNowait, 'arrivaltrace-diag', 'tableseat-nowait + 1-HP arrival tracer', store)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'arrivaltrace-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') { try { installArrivaltraceDiag(Game, store); } catch (e) { /* install best-effort; daily hook retries */ } }
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
  const at = arrivaltraceSnapshot(Game, store);
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
    arrivaltrace: at,
    diag: store ? { errs: store.errs, overflow: store.overflow } : null,
  };
  if (store) row.arrivaltrace.analysis = analyzeArrival(store, seed);
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-arrivaltrace-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const a = row.arrivaltrace.analysis;
  const line = a
    ? `census=${row.arrivaltrace.census.length} field=${row.arrivaltrace.fieldFights.length} raids=${row.arrivaltrace.raids.length} spawns=${row.arrivaltrace.spawns.length} reeng=${row.arrivaltrace.reengages.length} tbRest=${row.arrivaltrace.tbRestores.length} controls=${JSON.stringify(a.controls)} chains=${JSON.stringify(Object.keys(a.chains).map(mid => ({ mid, arrivals: a.chains[mid].arrivals.length, raidHits: a.chains[mid].arrivals.map(c => c.raidHits) })))}`
    : `snapshot-only faced=${Object.keys(row.arrivaltrace.faced || {}).length} kills=${(row.arrivaltrace.logEntries || []).length}`;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} ${line} ts=${JSON.stringify(row.ts)}`);
}

async function summaryMode() {
  const seeds = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const rows = [];
  for (const pid of ['baseline', 'armed']) for (const seed of seeds) {
    const p = path.join(evidDir, `s${seed}-${pid}.json`);
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const byPolicy = {};
  for (const pid of ['baseline', 'armed']) {
    const rs = rows.filter(r => r.policy === pid);
    byPolicy[pid] = {
      n: rs.length, won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: medianOf(rs.map(r => r.days)), medianGameDays: medianOf(rs.map(r => r.gameDays)),
      maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
      nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0), nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
      table: rs.reduce((t, r) => t + r.table, 0), entered: rs.reduce((t, r) => t + r.entered, 0),
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length, wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
      starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    };
  }
  const g2 = [];
  for (const seed of seeds) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    const facedOk = !!c && !!a && JSON.stringify(c.arrivaltrace.faced) === JSON.stringify(a.arrivaltrace.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.arrivaltrace.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.arrivaltrace.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const armedRows = rows.filter(r => r.policy === 'armed');
  const baselineRows = rows.filter(r => r.policy === 'baseline');
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.arrivaltrace && r.arrivaltrace.faced && r.arrivaltrace.logEntries)
    && armedRows.length === seeds.length && armedRows.every(r => Array.isArray(r.arrivaltrace.census) && r.arrivaltrace.census.length > 0 && Array.isArray(r.arrivaltrace.raids) && Array.isArray(r.arrivaltrace.spawns) && r.arrivaltrace.analysis)
    && baselineRows.length === seeds.length && baselineRows.every(r => r.arrivaltrace.analysis === undefined || r.arrivaltrace.analysis === null);
  // G4: focus chains from the armed rows only.
  const focusChains = [];
  for (const seed of [73675, 73678]) {
    const r = armedRows.find(x => x.seed === seed);
    if (!r) continue;
    for (const mid of Object.keys(r.arrivaltrace.analysis.chains || {})) {
      for (const ch of r.arrivaltrace.analysis.chains[mid].arrivals) {
        const raidHit1 = (ch.raidHits || []).filter(h => h.postHp === 1 && h.preHp != null && h.preHp > 1);
        focusChains.push({ seed, mid, prevFight: { day: ch.prevFight.day, endHp: ch.prevFight.endHp, outcome: ch.prevFight.outcome }, arrivalFight: { day: ch.arrivalFight.day, startHp: ch.arrivalFight.startHp, outcome: ch.arrivalFight.outcome, rounds: ch.arrivalFight.rounds }, raidHits: ch.raidHits, raidHit1: raidHit1, spawnsInWindow: ch.spawnsInWindow.length, reengagesInWindow: ch.reengagesInWindow.length, tbRestoresInWindow: ch.tbRestoresInWindow.length, multiEntityDays: ch.multiEntityDays, traced: raidHit1.length > 0 && ch.multiEntityDays === 0 });
      }
    }
  }
  const tracedCount = focusChains.filter(c => c.traced).length;
  const controlsBand = armedRows.map(r => ({ seed: r.seed, controls: r.arrivaltrace.analysis.controls }));
  const verdict = tracedCount >= 1 ? 'GO-TRACED' : 'NO-GO';
  const report = {
    label: 'sim-arrivaltrace-a pilot', seeds, days, rows, byPolicy,
    gates: { g2RecorderNeutrality: g2, g2Pass, g3CorpusIntegrity: g3Pass, focusChains, tracedCount, controlsBand },
    verdictInputs: { g2Pass, g3Pass, tracedCount, focusChainsCount: focusChains.length },
    verdict: verdict,
    verdictRule: 'GO iff >= 1 focus arrival has a traced event chain from this corpus (raid hit to 1 in the window, single-entity census), or all four candidates excluded with control-positive evidence. NO-GO otherwise.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-arrivaltrace-a pilot ===');
  for (const pid of ['baseline', 'armed']) {
    const b = byPolicy[pid];
    console.log(`  ${pid}: n=${b.n} won=${b.won} medD=${b.medianDays} medGameD=${b.medianGameDays} maxD=${b.maxDays} natEver=${b.nationalEver} natFinal=${b.nationalFinal} table=${b.table} entered=${b.entered} wave4=${b.wave4} wave5=${b.wave5} maxArc=${b.maxArc} starvTotal=${b.starvationTotal} deathTotal=${b.deathTotal}`);
  }
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length} seeds identical; faced-agree ${g2.filter(x => x.facedOk).length}/${g2.length}, kills-agree ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  Focus chains: ${JSON.stringify(focusChains, null, 1)}`);
  console.log(`  Traced arrivals: ${tracedCount} -> ${verdict} -> ${summaryPath}`);
  console.log('  NOTE: run --detgate separately for G1 (ARRIVATRACE unset delegation).');
  if (!g2Pass || !g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.ARRIVATRACE;
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const wrapped = withArrivaltraceDiag(tableseatNowait, 'arrivaltrace-diag', 'tableseat-nowait + 1-HP arrival tracer');
  const { Game } = await loadGame({ seed, mode: 'arrivaltrace-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._arrivaltrace);
  const wrapsInstalled = !!Game._arrivaltraceDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline(tableseat-nowait) days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(ARRIVATRACE unset) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const holder = {};
  const row = await runOne('armed', seed, days, null, holder);
  const store = holder.store;
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && census.arrivaltrace.fieldFights.length === row.arrivaltrace.fieldFights.length
    && census.arrivaltrace.raids.length === row.arrivaltrace.raids.length
    && JSON.stringify((census.arrivaltrace.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp])) === JSON.stringify((store.fieldFights || []).map(f => [f.day, f.mid, f.outcome, f.rounds, f.startHp, f.endHp]));
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} field=${row.arrivaltrace.fieldFights.length} raids=${row.arrivaltrace.raids.length} spawns=${row.arrivaltrace.spawns.length} reeng=${row.arrivaltrace.reengages.length} tbRest=${row.arrivaltrace.tbRestores.length}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE: re-run does not match census row'); process.exit(1); }
  const analysis = row.arrivaltrace.analysis;
  for (const mid of Object.keys(analysis.chains || {})) {
    for (const ch of analysis.chains[mid].arrivals) {
      console.log(`DETAIL chain ${mid} prev d${ch.prevFight.day} endHp=${ch.prevFight.endHp} -> arrival d${ch.arrivalFight.day} startHp=${ch.arrivalFight.startHp} outcome=${ch.arrivalFight.outcome} r${ch.arrivalFight.rounds}`);
      console.log(`DETAIL   censusWindow: ${JSON.stringify(ch.censusWindow)}`);
      console.log(`DETAIL   raidHits: ${JSON.stringify(ch.raidHits)} spawns=${ch.spawnsInWindow.length} reeng=${ch.reengagesInWindow.length} tbRest=${ch.tbRestoresInWindow.length} multiEntityDays=${ch.multiEntityDays}`);
    }
  }
  console.log(`DETAIL controls: ${JSON.stringify(analysis.controls)}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-24', 'sim-arrivaltrace-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.ARRIVATRACE = '1';
  const store = newStore();
  const armed = withArrivaltraceDiag(tableseatNowait, 'arrivaltrace-diag', 'tableseat-nowait + 1-HP arrival tracer', store);
  const { Game } = await loadGame({ seed, mode: 'arrivaltrace-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installArrivaltraceDiag(Game, store); } catch (e) { /* install best-effort */ }
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) { /* uninstall best-effort */ }
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) { /* prog best-effort */ }
  const analysis = analyzeArrival(store, seed);
  const atLine = `arrivaltrace: census=${store.census.length} field=${store.fieldFights.length} raids=${store.raids.length} spawns=${store.spawns.length} reeng=${store.reengages.length} tbRest=${store.tbRestores.length} chains=${JSON.stringify(Object.keys(analysis.chains).map(mid => ({ mid, arrivals: analysis.chains[mid].arrivals.map(c => ({ prevDay: c.prevFight.day, prevEnd: c.prevFight.endHp, arrDay: c.arrivalFight.day, raidHits: c.raidHits })) })))}`;
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+arrivaltrace-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    atLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  console.error('usage: --one <pid> <seed> | --summary | --detgate | --detail <seed> | --sense <seed>');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('ARRIVATRACE-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, analyzeArrival, writeRowViaWriter, arrivaltraceSnapshot };
