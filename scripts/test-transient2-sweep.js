#!/usr/bin/env node
// scripts/test-transient2-sweep.js — sim-transient2-a sweep
// (scale-onramp axis, 2026-10-26: re-anchored transient hunt.
// DIAG ONLY, zero src/js changes, zero default flips, no edits
// to any existing policy, sweep, summary, or check file — this
// is a NEW file composing existing pieces read-only.)
//
// TWO ARMS on one fresh band (73901-73908, verified fresh
// before any sweep; see evidence/2026-10-26/sim-transient2-a.md):
//   anchor: plain tableseat-nowait (LEANLINKRESCUE=1,
//     TABLESEATNOWAIT=1) + natpair pre/post-daily snaps.
//   hunt:   driveoff-clean shape (FEASTDRAWCLEAN=1,
//     tableseat-nowait substrate, COMPETENT_SEEK_FIGHTS left
//     ON, feastdraw + nonworldkill recorders exactly as the
//     freshtransient sweep does) + the same pre/post snaps.
// The snaps and say-line capture are PURE READS: they read
// scaleRank()/progState() and record lines; no game call is
// added, removed, or reordered. Det-gates prove it per arm
// (plain vs wrapped, days/gameDays/won/deaths/tsNationalDay).
//
// Pairing definitions (verbatim from natpair, NEWPAIRED rule):
//   SNAPNAT = row nationalEver (0/1, pre-daily hist + final snap)
//   TSPRESENT = tsNationalDay != null
//   MAXNAT = maxRank in {national, global}
//   POSTNAT = postMaxRank in {national, global} (diagnostic)
//   OLDPAIRED = (SNAPNAT === TSPRESENT) literal (number ===
//     boolean: always false — the natpair type bug, preserved)
//   NEWPAIRED = (SNAPNAT === (TSPRESENT ? 1 : 0))
//   Classes via classifyPairing from test-natpair-sweep
//   (imported read-only): agree | transient-ts-only |
//   snap-only | final-only | post-explained-transient |
//   unclassified. A transient is transient-ts-only or
//   post-explained-transient; the post-explained form additionally
//   locates the rise inside a base.daily (post snap saw it).
//   A genuine transient ALSO needs the overnight fall located:
//   rankTrace shows post>=2 on day D and pre<=1 on day D+1
//   with no later pre>=2 — checked by the proof test from the
//   stored rankTrace, never hand-edited.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one transient2-anchor <seed> : anchor arm, one seed.
//   --one transient2-hunt <seed>   : hunt arm, one seed.
//   --summary : build summary.json from rows on disk for both
//     arms, print both band tables. Exit 1 on corpus failure.
//   --detgate-anchor : plain tableseat-nowait vs wrapped,
//     SEED env (default 73901).
//   --detgate-hunt : plain driveoff-clean (+recorders) vs
//     wrapped, SEED env (default 73901).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const {
  newStore: newFdStore, installFeastdrawDiag, withFeastdrawDiag,
} = require('./policies/feastdraw-diag');
const {
  newStore: newNwkStore, installNonworldkillDiag, withNonworldkillDiag,
} = require('./policies/nonworldkill-diag');
const { classifyPairing } = require('./test-natpair-sweep');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANK_NAMES = ['village', 'regional', 'national', 'global'];
const SEEDS = (process.env.SEEDS || '73901,73902,73903,73904,73905,73906,73907,73908')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const STARV_RE = /starv|hunger/i;
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
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
// Pure helper, exported for the proof test: locate an overnight
// fall in a rankTrace — a day D with post>=2 whose next day's
// pre<=1, with no later pre>=2 (a one-night national that never
// re-appears at a pre-daily snap). Returns the fall day (D+1)
// or null. The rise day is postNationalDay.
function locateOvernightFall(rankTrace, postNationalDay) {
  if (!Array.isArray(rankTrace) || postNationalDay == null) return null;
  const byDay = {};
  for (const t of rankTrace) byDay[t.day] = t;
  const rise = byDay[postNationalDay];
  if (!rise || rise.post < 2) return null;
  for (let d = postNationalDay + 1; d <= postNationalDay + 400; d++) {
    const t = byDay[d];
    if (!t) continue;
    if (t.pre >= 2) return null; // re-appeared at a pre snap: not a one-night fall
    if (t.pre <= 1) return d; // first morning after the rise at/below regional
  }
  return null;
}

async function runOne(pid, seed, days, evidDir) {
  const isHunt = pid === 'transient2-hunt';
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let fdStore = null, nwkStore = null, base;
  if (isHunt) {
    process.env.FEASTDRAW = '1';
    process.env.NONWORLDKILL = '1';
    process.env.FEASTDRAWCLEAN = '1';
    delete process.env.COMPETENT_SEEK_FIGHTS;
    fdStore = newFdStore(); nwkStore = newNwkStore();
    base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'transient2 sweep + TB initiation census', nwkStore), 'feastdraw-diag', 'transient2 sweep + feast-draw yield census', fdStore);
  } else {
    delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
    delete process.env.FEASTDRAWCLEAN; delete process.env.DEVOTIONGATE; delete process.env.DEVOTIONGATEDIAG;
    base = tableseatNowait;
  }
  const { Game } = await loadGame({ seed, mode: 'transient2-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (isHunt) {
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
  }
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/national|global|table|realm|polity|circling the edge|drove off|never brave|gives up and moves on/i.test(t) && sayLines.length < 200) {
            sayLines.push({ day: ((Game.state || {}).scholar || {}).day || 0, text: t.slice(0, 400) });
          }
        } catch (e) {}
        return origSay.apply(this, arguments);
      };
    }
  } catch (e) {}
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const post = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  const rankTrace = [];
  const patrolByDay = {};
  let capturedCtx = null;
  const policy = Object.assign({}, base, {
    upkeep(G, ctx) {
      let r;
      try { r = base.upkeep ? base.upkeep(G, ctx) : undefined; } catch (e) { r = undefined; }
      if (isHunt) {
        try {
          const d = ctx && ctx._feastFightDay, sw = ctx && ctx._feastFightSweeps;
          if (d && (sw | 0) > 0) patrolByDay[d] = Math.max(patrolByDay[d] || 0, sw | 0);
        } catch (e) {}
      }
      return r;
    },
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      let preOrder = 0;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        preOrder = RANK_ORDER[s.rank] || 0;
      } catch (e) { preOrder = 0; }
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      try {
        const s2 = snap(G);
        post.maxRank = Math.max(post.maxRank, RANK_ORDER[s2.rank] || 0);
        post.maxArc = Math.max(post.maxArc, s2.arc || 1);
        if (s2.tableWaiting) post.everTable = true;
        if (s2.tableEntered) post.everEntered = true;
        rankTrace.push({ day: ((G.state || {}).scholar || {}).day || 0, pre: preOrder, post: RANK_ORDER[s2.rank] || 0 });
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ctxFd = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0) ctxFd[k] = capturedCtx[k];
    }
  }
  const preNationalDay = (() => {
    const t = rankTrace.find(x => x.pre >= 2);
    return t ? t.day : null;
  })();
  const postNationalDay = (() => {
    const t = rankTrace.find(x => x.post >= 2);
    return t ? t.day : null;
  })();
  const row = {
    policy: pid, seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: end.won ? 1 : 0,
    waveReach: result.maxWaveUnlocked || 1,
    maxArc: hist.maxArc,
    finalRank: end.rank,
    maxRank: RANK_NAMES[hist.maxRank] || 'village',
    nationalEver: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    nationalFinal: (RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    entered: (hist.everEntered || end.tableEntered) ? 1 : 0,
    deaths: deathSummary(deaths),
    deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts: ctxFd,
    ctxFd: ctxFd,
    tsNationalDay: ctxFd.tsNationalDay != null ? ctxFd.tsNationalDay : null,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    sayLines: sayLines,
    postMaxRank: RANK_NAMES[post.maxRank] || 'village',
    postMaxArc: post.maxArc,
    postTable: (post.everTable || end.tableWaiting) ? 1 : 0,
    postEntered: (post.everEntered || end.tableEntered) ? 1 : 0,
    preNationalDay: preNationalDay,
    postNationalDay: postNationalDay,
    rankTrace: rankTrace,
    overnightFallDay: locateOvernightFall(rankTrace, postNationalDay),
  };
  if (isHunt) {
    row.patrol = { byDay: patrolByDay, total: Object.values(patrolByDay).reduce((t, v) => t + v, 0), days: Object.keys(patrolByDay).length };
    row.feastdraw = {
      grants: fdStore.grants, draws: fdStore.draws, faces: fdStore.faces,
      driveoffs: fdStore.driveoffs, clears: fdStore.clears,
      diag: { errs: fdStore.errs, errors: fdStore.errors, overflow: fdStore.overflow, installed: fdStore.installed },
    };
    row.nonworldkill = {
      starts: nwkStore.starts, ends: nwkStore.ends,
      diag: { errs: nwkStore.errs, errors: nwkStore.errors, overflow: nwkStore.overflow, installed: nwkStore.installed },
    };
  }
  row.pairing = classifyPairing({
    nationalEver: row.nationalEver, maxRank: row.maxRank, finalRank: row.finalRank,
    postMaxRank: row.postMaxRank, tsNationalDay: row.tsNationalDay,
  });
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-transient2-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const p = row.pairing;
  const fd = row.feastdraw || {};
  const draws = (fd.draws || []).length, driven = (fd.driveoffs || []).length;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} postMaxRank=${row.postMaxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNationalDay=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} preNatDay=${row.preNationalDay != null ? row.preNationalDay : 'null'} postNatDay=${row.postNationalDay != null ? row.postNationalDay : 'null'} fallDay=${row.overnightFallDay != null ? row.overnightFallDay : 'null'} pairing: class=${p.cls} oldPaired=${p.oldPaired} newPaired=${p.newPaired} maxAgree=${p.maxAgree} draws=${draws} driven=${driven} sayLines=${row.sayLines.length}`);
}

function bandOf(rows) {
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    arc4: rows.filter(r => (r.maxArc || 1) >= 4).length,
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    transients: rows.filter(r => r.pairing && (r.pairing.cls === 'transient-ts-only' || r.pairing.cls === 'post-explained-transient')).length,
    postExplained: rows.filter(r => r.pairing && r.pairing.cls === 'post-explained-transient').length,
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const arms = {};
  let corpusOk = true;
  for (const pid of ['transient2-anchor', 'transient2-hunt']) {
    const rows = [];
    for (const seed of SEEDS) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
    if (rows.length !== SEEDS.length || rows.some(r => r.days <= 0 || !r.pairing || r.pairing.cls === 'unclassified')) corpusOk = false;
    const band = bandOf(rows);
    const pairing = rows.map(r => ({
      seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc,
      finalRank: r.finalRank, maxRank: r.maxRank, postMaxRank: r.postMaxRank,
      natEver: r.nationalEver, natFinal: r.nationalFinal, table: r.table, entered: r.entered,
      tsNationalDay: r.tsNationalDay, preNationalDay: r.preNationalDay, postNationalDay: r.postNationalDay,
      fallDay: r.overnightFallDay, starv: r.starvationDeaths, deaths: r.deathTotal,
      oldPaired: r.pairing.oldPaired, newPaired: r.pairing.newPaired, maxAgree: r.pairing.maxAgree,
      cls: r.pairing.cls,
    }));
    const classCounts = {};
    for (const x of pairing) classCounts[x.cls] = (classCounts[x.cls] || 0) + 1;
    arms[pid] = { band, pairing, classCounts };
    console.log(`  ${pid} BAND: won=${band.won}/${band.n} median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal} transients=${band.transients} postExplained=${band.postExplained}`);
    console.log(`  ${pid} PAIRING: ${pairing.map(x => `s${x.seed}:${x.cls} (days=${x.days}, natEver=${x.natEver}, maxRank=${x.maxRank}, postMax=${x.postMaxRank}, tsDay=${x.tsNationalDay}, preNat=${x.preNationalDay}, postNat=${x.postNationalDay}, fallDay=${x.fallDay}, won=${x.won}, table=${x.table}, entered=${x.entered})`).join(' ')}`);
    console.log(`  ${pid} CLASSES: ${JSON.stringify(classCounts)}`);
  }
  const summary = { arms, corpusOk,
    verdict: corpusOk ? 'CORPUS-PASS (verdict judged in evidence: anchor table + transient capture, not re-scored)' : 'CORPUS-FAIL' };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  VERDICT: ${summary.verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateAnchor() {
  const seed = parseInt(process.env.SEED || '73901', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const baseRow = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'transient2-detgate-anchor-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return tableseatNowait.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const end = snap(Game);
    return { days: result.days, gameDays: result.gameDays, won: end.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('transient2-anchor', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-ANCHOR seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'anchor', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-anchor-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate-anchor.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function detgateHunt() {
  const seed = parseInt(process.env.SEED || '73901', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAW = '1'; process.env.NONWORLDKILL = '1';
  process.env.FEASTDRAWCLEAN = '1'; delete process.env.COMPETENT_SEEK_FIGHTS;
  const baseRow = await (async () => {
    const fdStore = newFdStore(), nwkStore = newNwkStore();
    const base = withFeastdrawDiag(withNonworldkillDiag(feastdrawDriveoffClean, 'nonworldkill-diag', 'detgate', nwkStore), 'feastdraw-diag', 'detgate', fdStore);
    const { Game } = await loadGame({ seed, mode: 'transient2-detgate-hunt-base', fullTelemetry: false });
    await setupGame(Game);
    try { installNonworldkillDiag(Game, nwkStore); } catch (e) {}
    try { installFeastdrawDiag(Game, fdStore); } catch (e) {}
    let capturedCtx = null;
    const policy = Object.assign({}, base, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return base.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const end = snap(Game);
    return { days: result.days, gameDays: result.gameDays, won: end.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('transient2-hunt', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE-HUNT seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, arm: 'hunt', base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-hunt-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate-hunt.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && (argv[1] === 'transient2-anchor' || argv[1] === 'transient2-hunt')) return oneMode(argv[1], argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate-anchor') return detgateAnchor();
  if (argv[0] === '--detgate-hunt') return detgateHunt();
  console.error('usage: test-transient2-sweep.js (--one transient2-anchor|transient2-hunt <seed> | --summary | --detgate-anchor | --detgate-hunt)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { runOne, snap, RANK_ORDER, RANK_NAMES, locateOvernightFall };
