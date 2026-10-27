#!/usr/bin/env node
// scripts/test-tbstarts-diag-sweep.js — sim-tbstarts-a sweep
// (scale-onramp axis, 2026-10-27: CLASSIFY the unsettled TB starts
// on the w4melt band — the 61-starts / 28-tbEnd gap on 73675.
// DIAG ONLY, zero src/js changes).
//
// PAIRING (exact, identical seeds — the landed w4melt pattern,
// composed): TWO arms, same seeds: plain = tableseat-nowait
// with no recorders; armed = tableseat-nowait wrapped with
//   raftdraft-diag (RAFTDRAFT=1, raid draft census — raid days
//     per seed for the cluster test),
//   spawnsrc-diag (SPAWNSRC=1, birth source + seq tags —
//     arrival days per wave-4 seq for the cluster test),
//   tbstarts-diag (TBSTARTS=1, NEW this run, installed
//     OUTERMOST, last — startCombat rows with fight id +
//     call argument + pre/post live-fight identity, tbEnd rows
//     with fight id, tbBarrierExit dissolve markers, daily
//     live-fight snapshots).
// The two reused recorders are VERBATIM from current master
// (never edited; sha256 in the prereg, identical to w4melt's).
//   PLAIN runs first. The armed rows must reproduce plain EXACTLY
//   on every shared field (days, gameDays, endReason, won,
//   waveReach, ranks, national, table, deaths, starvation, faced,
//   waveKillLog) — that exactness IS the neutrality gate in
//   --summary. Plain-vs-0615/w4melt comparison is REPORT-ONLY
//   (this worktree's base is the coordinator-provided branch,
//   not the w4melt rebase tip): deviation is base movement,
//   never a gate failure.
// Substrate: seeds 73671-73678, 180d death-aware (runDays stops on
// death/win; 180 is the cap, not a fixed horizon — MEASUREMENT §10).
// Modes:
//   --one baseline <seed> : run one plain seed, write its row.
//   --one armed <seed> : run one armed seed, write its row.
//   --summary : build summary.json from the rows on disk, print gates.
//   --detgate : delegation-off proof on one seed (SEED env, default
//     73675): tableseat-nowait with NO recorder on-switch must match
//     a plain tableseat-nowait run on days/gameDays/ts, with no
//     recorder surface and no installed wraps.
// Exit 1 on gate failure in --summary mode (corpus incomplete,
// recorder errors > 0, or armed-vs-plain inexact).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newRaftStore, installRaftdraftDiag, withRaftdraftDiag,
} = require('./policies/raftdraft-diag');
const {
  newStore: newSpawnStore, installSpawnsrcDiag, withSpawnsrcDiag,
} = require('./policies/spawnsrc-diag');
const {
  newStore: newTbStore, installTbstartsDiag, withTbstartsDiag,
} = require('./policies/tbstarts-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const CONTROL = {
  nationalEver: 7, nationalFinal: 5, table: 5, entered: 4, wins: 4,
  wave4: 5, wave5: 0, medianDays: 130, deaths: 284, starvation: 2,
};
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function snap(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, tableEntered: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) { /* best-effort */ }
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) { /* best-effort */ }
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) { /* best-effort */ }
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}
// Pairing v2: join starts to ends/dissolves by fight id OR by
// recorder token (same fight object — direct-build person-fights
// carry no tbfight.id), with two call-level joins for starts whose
// post-call fight is already null:
//   TITAN-GATE-REFUSED: the call appended a titan 'refused'
//     outcome for its argument (titans wrapper returned before
//     core startCombat ran) — no fight, no end.
//   INSTANT-SETTLED / INSTANT-DISSOLVED: an end / dissolve row
//     recorded DURING this startCombat call (activeStart == the
//     start's call index) — the fight started and ended inside
//     the call, so its post-call fight is already null.
//   UNSETTLED: a post-call fight exists (id or token) with no end
//     or dissolve for it. UNSETTLED-NULL: no post-call fight and
//     no inside end/dissolve/refusal — unexplained by construction.
function pairStarts(tb) {
  const endsById = new Map(), dissById = new Map();
  const endsByToken = new Map(), dissByToken = new Map();
  const endsByActive = new Map(), dissByActive = new Map();
  for (const e of (tb.ends || [])) {
    if (e.id) endsById.set(e.id, e);
    if (e.token != null) endsByToken.set(e.token, e);
    if (e.activeStart != null) endsByActive.set(e.activeStart, e);
  }
  for (const d of (tb.dissolves || [])) {
    if (d.id) dissById.set(d.id, d);
    if (d.token != null) dissByToken.set(d.token, d);
    if (d.activeStart != null) dissByActive.set(d.activeStart, d);
  }
  const out = { starts: 0, ends: (tb.ends || []).length, dissolves: (tb.dissolves || []).length,
    refused: 0, titanRefused: 0, settled: 0, instantSettled: 0, instantDissolved: 0,
    dissolved: 0, unsettled: 0, unsettledNull: 0, unmatchedEnds: 0,
    unsettledRows: [], titanRows: [], instantRows: [] };
  const matchedEndIdx = new Set();
  const endIndex = new Map();
  (tb.ends || []).forEach((e, i) => endIndex.set(e, i));
  for (const s of (tb.starts || [])) {
    out.starts++;
    if (s.refused) { out.refused++; continue; }
    if ((s.newOutcomes || []).some(o => o && o.titan === s.arg && o.outcome === 'refused')) { out.titanRefused++; out.titanRows.push(s); continue; }
    if (s.postId && endsById.has(s.postId)) { out.settled++; matchedEndIdx.add(endIndex.get(endsById.get(s.postId))); continue; }
    if (s.postId && dissById.has(s.postId)) { out.dissolved++; continue; }
    if (s.postToken != null && endsByToken.has(s.postToken)) { out.settled++; matchedEndIdx.add(endIndex.get(endsByToken.get(s.postToken))); continue; }
    if (s.postToken != null && dissByToken.has(s.postToken)) { out.dissolved++; continue; }
    if (s.postId == null && s.postToken == null) {
      if (endsByActive.has(s.callIdx)) { out.instantSettled++; out.instantRows.push(s); matchedEndIdx.add(endIndex.get(endsByActive.get(s.callIdx))); continue; }
      if (dissByActive.has(s.callIdx)) { out.instantDissolved++; out.instantRows.push(s); continue; }
      out.unsettledNull++; out.unsettledRows.push(s); continue;
    }
    out.unsettled++; out.unsettledRows.push(s);
  }
  out.unmatchedEnds = (tb.ends || []).filter((e, i) => !matchedEndIdx.has(i)).length;
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let raftStore = null, spawnStore = null, tbStore = null;
  if (pid === 'armed') {
    process.env.RAFTDRAFT = '1'; process.env.SPAWNSRC = '1'; process.env.TBSTARTS = '1';
    raftStore = newRaftStore(); spawnStore = newSpawnStore(); tbStore = newTbStore();
  } else { delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.TBSTARTS; }
  const base = pid === 'armed'
    ? withTbstartsDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'tbstarts-diag', 'tableseat-nowait + TB-start classification census', tbStore)
    : tableseatNowait;
  const { Game } = await loadGame({ seed, mode: 'tbstarts-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installRaftdraftDiag(Game, raftStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installSpawnsrcDiag(Game, spawnStore); } catch (e) { /* install best-effort; daily hook retries */ }
    try { installTbstartsDiag(Game, tbStore); } catch (e) { /* install best-effort; daily hook retries */ }
  }
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
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let finalPresent = [];
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    finalPresent = list.map(m => ({ seq: (m._spawnSeq != null ? m._spawnSeq : null), src: (m._spawnsrc || null), type: m.id || null, wave: (m.wave != null ? m.wave : null), hp: (m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null }));
  } catch (e) { /* final present best-effort */ }
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
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    finalPresent: finalPresent,
    raftdraft: raftStore ? {
      raids: raftStore.raids, calls: raftStore.calls, fieldFights: raftStore.fieldFights,
      faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
      logEntries: log.entries, logErrs: log.errs, logError: log.error,
      diag: { errs: raftStore.errs, errors: raftStore.errors, overflow: raftStore.overflow, installed: raftStore.installed },
    } : { faced: faced.faced, facedErrs: faced.errs, facedError: faced.error, logEntries: log.entries, logErrs: log.errs, logError: log.error, analysis: null, note: 'snapshot-only' },
    spawnsrc: spawnStore ? {
      raids: spawnStore.raids, spawns: spawnStore.spawns,
      diag: { errs: spawnStore.errs, errors: spawnStore.errors, overflow: spawnStore.overflow, installed: spawnStore.installed },
    } : null,
    tbstarts: tbStore ? {
      starts: tbStore.starts, ends: tbStore.ends, dissolves: tbStore.dissolves,
      throws: tbStore.throws, daily: tbStore.daily,
      diag: { errs: tbStore.errs, errors: tbStore.errors, overflow: tbStore.overflow, installed: tbStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-tbstarts-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const rd = row.raftdraft, sd = row.spawnsrc, td = row.tbstarts;
  const line = rd.raids
    ? `raids=${rd.raids.length} raiders=${rd.raids.reduce((t, r) => t + (r.raiders || []).length, 0)} calls=${rd.calls.length} field=${rd.fieldFights.length} raftErrs=${rd.diag.errs}`
    : `snapshot-only faced=${Object.keys(rd.faced || {}).length}`;
  const sline = sd ? `spawnRaids=${sd.raids.length} spawns=${sd.spawns.length} spawnErrs=${sd.diag.errs}` : 'spawnsrc=null';
  const tline = td ? `tbStarts=${td.starts.length} tbEnds=${td.ends.length} tbDissolves=${td.dissolves.length} tbThrows=${td.throws.length} tbDaily=${td.daily.length} tbErrs=${td.diag.errs}` : 'tbstarts=null';
  const pair = td ? pairStarts(td) : null;
  const pline = pair ? `pair refused=${pair.refused} titanRefused=${pair.titanRefused} settled=${pair.settled} instantSettled=${pair.instantSettled} instantDissolved=${pair.instantDissolved} dissolved=${pair.dissolved} unsettled=${pair.unsettled} unsettledNull=${pair.unsettledNull} unmatchedEnds=${pair.unmatchedEnds}` : '';
  const w4spawns = sd ? sd.spawns.filter(s => (s.wave | 0) === 4).length : 0;
  const w4log = rd.logEntries.filter(e => (e.w | 0) === 4).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} w4spawns=${w4spawns} w4log=${w4log} ${line} ${sline} ${tline} ${pline}`);
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  const plainRows = [], rows = [];
  for (const seed of SEEDS) {
    plainRows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-baseline.json`), 'utf8')));
    rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')));
  }
  function bandOf(rs) {
    return {
      n: rs.length,
      won: rs.reduce((t, r) => t + r.won, 0),
      medianDays: medianOf(rs.map(r => r.days)),
      nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
      nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
      table: rs.reduce((t, r) => t + r.table, 0),
      entered: rs.reduce((t, r) => t + r.entered, 0),
      wave3: rs.filter(r => (r.waveReach || 1) >= 3).length,
      wave4: rs.filter(r => (r.waveReach || 1) >= 4).length,
      wave5: rs.filter(r => (r.waveReach || 1) >= 5).length,
      starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
      deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
    };
  }
  const band = bandOf(rows);
  const plainBand = bandOf(plainRows);
  const SHARED = ['days', 'gameDays', 'endReason', 'won', 'waveReach', 'maxArc', 'finalRank', 'maxRank', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'starvationDeaths'];
  const perSeedExact = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const a = plainRows[i], b = rows[i];
    const diffs = [];
    for (const f of SHARED) if (JSON.stringify(a[f]) !== JSON.stringify(b[f])) diffs.push(f + ':' + JSON.stringify(a[f]) + '!=' + JSON.stringify(b[f]));
    const facedA = JSON.stringify((a.raftdraft || {}).faced || {});
    const facedB = JSON.stringify((b.raftdraft || {}).faced || {});
    if (facedA !== facedB) diffs.push('faced');
    const logA = JSON.stringify((a.raftdraft || {}).logEntries || []);
    const logB = JSON.stringify((b.raftdraft || {}).logEntries || []);
    if (logA !== logB) diffs.push('logEntries');
    perSeedExact.push({ seed: SEEDS[i], exact: diffs.length === 0, diffs });
  }
  const armedVsPlainExact = perSeedExact.every(x => x.exact)
    && JSON.stringify(plainBand) === JSON.stringify(band);
  const plainVs0615 = {
    reference: CONTROL,
    plain: plainBand,
    exact: plainBand.nationalEver === CONTROL.nationalEver && plainBand.nationalFinal === CONTROL.nationalFinal
      && plainBand.table === CONTROL.table && plainBand.entered === CONTROL.entered
      && plainBand.won === CONTROL.wins && plainBand.wave4 === CONTROL.wave4 && plainBand.wave5 === CONTROL.wave5
      && plainBand.medianDays === CONTROL.medianDays && plainBand.deathTotal === CONTROL.deaths
      && plainBand.starvationTotal === CONTROL.starvation,
    note: 'report-only: deviation is base movement, never a gate failure',
  };
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.spawnsrc
    && Array.isArray(r.spawnsrc.raids) && Array.isArray(r.spawnsrc.spawns)
    && r.spawnsrc.diag.errs === 0 && Object.keys(r.spawnsrc.diag.overflow || {}).length === 0
    && r.raftdraft && Array.isArray(r.raftdraft.raids) && r.raftdraft.diag.errs === 0
    && Object.keys(r.raftdraft.diag.overflow || {}).length === 0
    && r.tbstarts && Array.isArray(r.tbstarts.starts) && Array.isArray(r.tbstarts.ends)
    && r.tbstarts.diag.errs === 0 && Object.keys(r.tbstarts.diag.overflow || {}).length === 0);
  const pairing = rows.map(r => {
    const p = pairStarts(r.tbstarts);
    return { seed: r.seed, starts: p.starts, ends: p.ends, dissolves: p.dissolves,
      refused: p.refused, titanRefused: p.titanRefused, settled: p.settled,
      instantSettled: p.instantSettled, instantDissolved: p.instantDissolved,
      dissolved: p.dissolved, unsettled: p.unsettled,
      unsettledNull: p.unsettledNull, unmatchedEnds: p.unmatchedEnds,
      unsettledDays: p.unsettledRows.map(s => s.day),
      titanDays: p.titanRows.map(s => s.day),
      instantDays: p.instantRows.map(s => s.day),
      raidDays: (r.raftdraft.raids || []).map(x => x.day),
      w4arrivals: (r.spawnsrc.spawns || []).filter(s => (s.wave | 0) === 4).map(s => ({ day: s.day, seq: s.seq, type: s.type, src: s.src })),
      w4kills: (r.raftdraft.logEntries || []).filter(e => (e.w | 0) === 4).map(e => ({ day: e.d, by: e.by, via: e.via })),
    };
  });
  const report = {
    label: 'sim-tbstarts-a', seeds: SEEDS, days, rows, plainRows, band, plainBand,
    perSeedExact, armedVsPlainExact, plainVs0615,
    control0615: CONTROL, corpusOk: corpusOk,
    pairing: pairing,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + String.fromCharCode(10));
  console.log(String.fromCharCode(10) + '=== sim-tbstarts-a ===');
  console.log(`  plain band: n=${plainBand.n} won=${plainBand.won} medD=${plainBand.medianDays} natEver=${plainBand.nationalEver} natFinal=${plainBand.nationalFinal} table=${plainBand.table} entered=${plainBand.entered} wave3=${plainBand.wave3} wave4=${plainBand.wave4} wave5=${plainBand.wave5} starv=${plainBand.starvationTotal} deaths=${plainBand.deathTotal}`);
  console.log(`  armed band: n=${band.n} won=${band.won} medD=${band.medianDays} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`  ARMED-vs-PLAIN: ${armedVsPlainExact ? 'EXACT' : 'DEVIATED'} (per-seed: ${perSeedExact.map(x => x.seed + ':' + (x.exact ? 'exact' : x.diffs.join(','))).join(' ')})`);
  console.log(`  PLAIN-vs-0615 (report-only): ${plainVs0615.exact ? 'EXACT' : 'MOVED'} (0615 natEver=${CONTROL.nationalEver} natFinal=${CONTROL.nationalFinal} table=${CONTROL.table} entered=${CONTROL.entered} wins=${CONTROL.wins} wave4=${CONTROL.wave4} wave5=${CONTROL.wave5} medD=${CONTROL.medianDays} deaths=${CONTROL.deaths} starv=${CONTROL.starvation})`);
  for (const p of pairing) console.log(`  pair seed=${p.seed}: starts=${p.starts} ends=${p.ends} dissolves=${p.dissolves} refused=${p.refused} titanRefused=${p.titanRefused} settled=${p.settled} instantSettled=${p.instantSettled} instantDissolved=${p.instantDissolved} dissolvedN=${p.dissolved} unsettled=${p.unsettled} unsettledNull=${p.unsettledNull} unmatchedEnds=${p.unmatchedEnds} unsettledDays=${JSON.stringify(p.unsettledDays)} titanDays=${JSON.stringify(p.titanDays)} instantDays=${JSON.stringify(p.instantDays)} raidDays=${JSON.stringify(p.raidDays)}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk || !armedVsPlainExact) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73675', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.RAFTDRAFT; delete process.env.SPAWNSRC; delete process.env.TBSTARTS;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const raftStore = newRaftStore(), spawnStore = newSpawnStore(), tbStore = newTbStore();
  // Wrapped but OFF: all three recorders' layer guards must delegate
  // byte-identically (no wraps installed, no ctx surface).
  const wrapped = withTbstartsDiag(withSpawnsrcDiag(withRaftdraftDiag(tableseatNowait, 'raftdraft-diag', 'tableseat-nowait + raid draft census', raftStore), 'spawnsrc-diag', 'tableseat-nowait + spawn-source census', spawnStore), 'tbstarts-diag', 'tableseat-nowait + TB-start classification census', tbStore);
  const { Game } = await loadGame({ seed, mode: 'tbstarts-diag-detgate', fullTelemetry: false });
  await setupGame(Game);
  const postSetupWorld = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters().length : null;
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._raftdraft || capturedCtx._spawnsrc || capturedCtx._tbstarts));
  const wrapsInstalled = !!Game._raftdraftDiagInstalled || !!Game._spawnsrcDiagInstalled || !!Game._tbstartsDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} postSetupWorld=${postSetupWorld} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  console.error('usage: --one <pid> <seed> | --summary | --detgate');
  process.exit(2);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
