#!/usr/bin/env node
// scripts/test-choiceprice-sweep.js — sim-choiceprice-a sweep
// (scale-onramp axis, 2026-10-26: measure the choice-price gap
// carried from sim-hunttable-a. DIAG ONLY, zero src/js changes,
// zero default flips, no edits to any existing policy, sweep,
// summary, or check file — this is a NEW file composing existing
// pieces read-only. The hunttable corpus is read, never edited
// or imported, and NOT re-judged here.)
//
// ONE COLUMN on the band 73901-73908, 180d death-aware horizon
// (dead villages stop; 180 is the cap, not a fixed horizon), one
// seed per exec call: driveoff-clean shape EXACTLY as
// hunttable's hunt column (FEASTDRAWCLEAN=1, tableseat-nowait
// substrate, COMPETENT_SEEK_FIGHTS left ON) + the new
// choiceprice recorder (scripts/policies/choiceprice-diag.js).
// The recorder wraps Game.say / grantFeastBuff /
// driveOffFeastDraw / faceFeastDraw / clearFeastBuff AROUND the
// originals and records only; the sweep's daily wrapper calls
// base.daily exactly once, in the same position, and records
// only pure-read snapshots (tableSeat pricing, tablePreview,
// progState fields, scholar.prog). No game call is added,
// removed, or reordered. The det-gate proves it (plain vs
// wrapped on pilot seed 73901) BEFORE the band is spent.
//
// Modes (do NOT probe with --help):
//   --one choiceprice-hunt <seed> : one seed, writes its row.
//   --summary : build summary.json from rows on disk, print
//     band + per-seed draw/forfeit tables. Exit 1 on failure.
//   --detgate : plain driveoff-clean vs wrapped, SEED env
//     (default 73901). Exit 1 on mismatch.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { feastdrawDriveoffClean } = require('./policies/feastdraw-driveoff-clean');
const { newStore, installChoicepriceDiag } = require('./policies/choiceprice-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANK_NAMES = ['village', 'regional', 'national', 'global'];
const SEEDS = (process.env.SEEDS || '73901,73902,73903,73904,73905,73906,73907,73908')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const COLLAPSED = [73903, 73904, 73906, 73907, 73908];
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
function deathSummary(deaths) {
  const m = {};
  for (const d of (deaths || [])) {
    const k = (d.player ? 'player:' : 'villager:') + String(d.cause || 'unknown');
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
// PURE-READ snapshot of the table chain at one moment. Every call
// below is a read (scaleRank, progState fields, scholar.prog,
// tableSeat pricing, tablePreview pricing); nothing here writes
// game state, spends a resource, advances a day, or answers a beat.
function chainSnap(Game) {
  const out = {
    day: 0, rank: 'village', rankOrd: 0, arc: 1,
    tableWaiting: false, tableDone: false, tableAnnounced: false,
    sentimentTaught: false, crisesN: 0, feastSurgeUsed: false,
    stage: 0, wave: 1, seat: 'none', foodDeeds: false,
    previewSeat: null, previewReady: null, previewWhy: null,
  };
  try { out.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; out.rankOrd = RANK_ORDER[out.rank] || 0; } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    out.arc = pg.arc || 1;
    out.tableWaiting = !!pg.tableWaiting;
    out.tableDone = !!pg.tableDone;
    out.tableAnnounced = !!pg.tableAnnounced;
    out.sentimentTaught = !!pg.sentimentTaught;
    out.crisesN = Object.keys(pg.crises || {}).length;
  } catch (e) {}
  try { out.feastSurgeUsed = !!((((Game.state || {}).scholar || {}).prog || {}).feastSurgeUsed); } catch (e) {}
  try { out.stage = (Game.integrationStage ? Game.integrationStage() : 0) || 0; } catch (e) {}
  try { out.wave = (Game.unlockedWave ? Game.unlockedWave() : 1) || 1; } catch (e) {}
  try {
    const seat = (Game.tableSeat ? Game.tableSeat() : null) || {};
    out.seat = seat.seat || 'none';
    out.foodDeeds = !!(seat.detail && seat.detail.foodDeeds);
  } catch (e) {}
  try {
    const pv = (Game.tablePreview ? Game.tablePreview() : null);
    if (pv) { out.previewSeat = pv.seat || null; out.previewReady = !!pv.ready; out.previewWhy = pv.why || null; }
  } catch (e) {}
  return out;
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAWCLEAN = '1';
  delete process.env.COMPETENT_SEEK_FIGHTS;
  const base = feastdrawDriveoffClean;
  const store = newStore();
  const { Game } = await loadGame({ seed, mode: 'choiceprice-hunt', fullTelemetry: false });
  await setupGame(Game);
  try { installChoicepriceDiag(Game, store); } catch (e) { store.errs.push('install:' + String((e && e.message) || e).slice(0, 120)); }
  const firsts = {
    preNationalDay: null, postNationalDay: null, preGlobalDay: null, postGlobalDay: null,
    arc2Day: null, arc3Day: null, arc4Day: null,
    barSentimentDay: null, barSurgeDay: null,
    seatFirstDay: null, seatFirstKind: null,
    invitationDay: null, previewDay: null, previewReadyDay: null, enteredDay: null,
  };
  const chainTrace = [];
  const rankTrace = [];
  let capturedCtx = null;
  function recordFirsts(snap, isPre) {
    const d = snap.day;
    if (isPre) {
      if (snap.rankOrd >= 2 && firsts.preNationalDay == null) firsts.preNationalDay = d;
      if (snap.rankOrd >= 3 && firsts.preGlobalDay == null) firsts.preGlobalDay = d;
    } else {
      if (snap.rankOrd >= 2 && firsts.postNationalDay == null) firsts.postNationalDay = d;
      if (snap.rankOrd >= 3 && firsts.postGlobalDay == null) firsts.postGlobalDay = d;
    }
    if (snap.arc >= 2 && firsts.arc2Day == null) firsts.arc2Day = d;
    if (snap.arc >= 3 && firsts.arc3Day == null) firsts.arc3Day = d;
    if (snap.arc >= 4 && firsts.arc4Day == null) firsts.arc4Day = d;
    if (snap.sentimentTaught && firsts.barSentimentDay == null) firsts.barSentimentDay = d;
    if (snap.feastSurgeUsed && firsts.barSurgeDay == null) firsts.barSurgeDay = d;
    if (snap.seat !== 'none' && firsts.seatFirstDay == null) { firsts.seatFirstDay = d; firsts.seatFirstKind = snap.seat; }
    if (snap.tableWaiting && firsts.invitationDay == null) firsts.invitationDay = d;
    if (snap.previewSeat != null && firsts.previewDay == null) firsts.previewDay = d;
    if (snap.previewReady && firsts.previewReadyDay == null) firsts.previewReadyDay = d;
    if (snap.tableDone && firsts.enteredDay == null) firsts.enteredDay = d;
  }
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      let pre = null, preOrd = 0;
      try { pre = chainSnap(G); recordFirsts(pre, true); preOrd = pre.rankOrd; } catch (e) { pre = null; }
      let r;
      if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
      try {
        const post = chainSnap(G);
        recordFirsts(post, false);
        rankTrace.push({ day: post.day, pre: preOrd, post: post.rankOrd });
        chainTrace.push(post);
      } catch (e) {}
      return r;
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = chainSnap(Game);
  recordFirsts(end, false);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const ctxOut = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('fd') === 0 || k.indexOf('ts') === 0) ctxOut[k] = capturedCtx[k];
    }
    for (const k of ['facedDraw', 'feasts', 'armedFeasts']) if (capturedCtx[k] !== undefined) ctxOut[k] = capturedCtx[k];
  }
  let won = 0;
  try { won = Game.won ? 1 : 0; } catch (e) {}
  // Forfeiture events: a drive-off whose deed was unmarked before
  // AND after, joined to the buff expiry that closes its window
  // (first expiry after the drive-off day with the deed still
  // unmarked). A drive-off on a seed that later marks the deed
  // via another fight is NOT a forfeiture of the run's deed —
  // it is counted separately in the summary (forfeitedRuns).
  const forfeits = [];
  for (const df of store.driveoffs) {
    if (!df.ok) continue;
    const ex = store.expiries.find(e => e.day >= df.day && !e.before.feastSurgeUsed && !e.after.feastSurgeUsed);
    forfeits.push({
      day: df.day, monsterId: df.draw ? df.draw.monsterId : null,
      offerText: df.offerText || null, driveoffLines: df.driveoffLines || [],
      deedBefore: df.before.feastSurgeUsed, deedAfter: df.after.feastSurgeUsed,
      expiryDay: ex ? ex.day : null, expiryDeedStillUnmarked: ex ? !!ex.deedStillUnmarked : null,
    });
  }
  const row = {
    policy: 'choiceprice-hunt', seed,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won, waveReach: result.maxWaveUnlocked || 1,
    maxArc: Math.max.apply(null, chainTrace.map(t => t.arc || 1).concat([1])),
    finalRank: end.rank,
    maxRank: RANK_NAMES[Math.max.apply(null, rankTrace.map(t => Math.max(t.pre, t.post)).concat([0]))] || 'village',
    nationalEver: Math.max.apply(null, rankTrace.map(t => Math.max(t.pre, t.post)).concat([0])) >= 2 ? 1 : 0,
    nationalFinal: end.rankOrd >= 2 ? 1 : 0,
    table: firsts.invitationDay != null ? 1 : 0,
    entered: firsts.enteredDay != null ? 1 : 0,
    deaths: deathSummary(deaths), deathTotal: deaths.length,
    starvationDeaths: starv.length,
    starvationDetail: starv.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player })),
    ts: ctxOut, ctxOut: ctxOut,
    tsNationalDay: ctxOut.tsNationalDay != null ? ctxOut.tsNationalDay : null,
    firsts: firsts, finalSnap: end,
    preNationalDay: firsts.preNationalDay, postNationalDay: firsts.postNationalDay,
    preGlobalDay: firsts.preGlobalDay, postGlobalDay: firsts.postGlobalDay,
    rankTrace: rankTrace, chainTrace: chainTrace,
    choiceprice: {
      grants: store.grants, offers: store.offers, driveoffs: store.driveoffs,
      faces: store.faces, expiries: store.expiries, sayLines: store.sayLines,
      errs: store.errs, installed: store.installed,
    },
    forfeits: forfeits,
    counts: {
      grants: store.grants.filter(g => g.granted && !g.refreshed).length,
      draws: store.grants.filter(g => g.granted && !g.refreshed && g.draw).length,
      offers: store.offers.length,
      driveoffs: store.driveoffs.filter(d => d.ok).length,
      faces: store.faces.filter(f => f.ok).length,
      forfeitingChoices: forfeits.length,
    },
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-choiceprice-hunt.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-choiceprice-a'); }

async function oneMode(seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(seed, days, evidDir);
  const f = row.firsts, c = row.counts;
  console.log(`  [choiceprice-hunt seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNat=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} surge=${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} grants=${c.grants} draws=${c.draws} offers=${c.offers} driveoffs=${c.driveoffs} faces=${c.faces} forfeits=${c.forfeitingChoices} sayLines=${row.choiceprice.sayLines.length} cpErrs=${row.choiceprice.errs.length}`);
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
    draws: rows.reduce((t, r) => t + r.counts.draws, 0),
    driveoffs: rows.reduce((t, r) => t + r.counts.driveoffs, 0),
    forfeits: rows.reduce((t, r) => t + r.counts.forfeitingChoices, 0),
  };
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  let corpusOk = true;
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-choiceprice-hunt.json`);
    if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  if (rows.length !== SEEDS.length || rows.some(r => r.days <= 0)) corpusOk = false;
  const band = bandOf(rows);
  console.log(`  choiceprice-hunt BAND: won=${band.won}/${band.n} median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal} draws=${band.draws} driveoffs=${band.driveoffs} forfeits=${band.forfeits}`);
  for (const r of rows) {
    const f = r.firsts, c = r.counts;
    console.log(`  s${r.seed}: days=${r.days} won=${r.won} wave=${r.waveReach} arc=${r.maxArc} final=${r.finalRank} natEver=${r.nationalEver} tsNat=${r.tsNationalDay} surge=${f.barSurgeDay} seat=${f.seatFirstDay}:${f.seatFirstKind} invit=${f.invitationDay} grants=${c.grants} draws=${c.draws} offers=${c.offers} driveoffs=${c.driveoffs} faces=${c.faces} forfeits=${c.forfeitingChoices} sayLines=${r.choiceprice.sayLines.length} cpErrs=${r.choiceprice.errs.length}`);
    for (const fo of r.forfeits) {
      console.log(`    FORFEIT s${r.seed} day=${fo.day} monster=${fo.monsterId} deedBefore=${fo.deedBefore} deedAfter=${fo.deedAfter} expiryDay=${fo.expiryDay} offer=${fo.offerText ? 'QUOTED' : 'MISSING'}`);
    }
  }
  // Collapsed-seed forfeiture coverage: >= 4/5 collapsed seeds with
  // >= 1 forfeiture event carrying day + quoted choice text.
  let covered = 0;
  for (const seed of COLLAPSED) {
    const r = rows.find(x => x.seed === seed);
    const ok = r && r.forfeits.some(fo => fo.offerText && fo.day != null);
    if (ok) covered++;
    console.log(`  COLLAPSED s${seed}: forfeitEvents=${r ? r.forfeits.length : 'MISSING'} quotedCovered=${!!ok}`);
  }
  console.log(`  COLLAPSED-COVERAGE: ${covered}/5 (bar >= 4)`);
  // Villages ever encountering a surface naming the deed as the
  // price of the choice: scan captured say lines for a line that
  // names the surge deed / table price in the draw-choice context.
  // The inventory verdict itself is judged in the evidence file
  // (static code search + corpus scan); this count is the corpus
  // leg: a say line mentioning BOTH the draw choice AND the deed.
  let namingVillages = 0;
  for (const r of rows) {
    const hit = (r.choiceprice.sayLines || []).some(s =>
      /circling|drive off|drove off/i.test(s.text) && /deed|table.*price|pric.*table|feastSurgeUsed|surge.*deed/i.test(s.text));
    if (hit) namingVillages++;
    console.log(`  SAY-NAMING s${r.seed}: ${hit}`);
  }
  console.log(`  VILLAGES-WITH-CHOICE-CONTEXT-DEED-NAMING: ${namingVillages}/${rows.length}`);
  const summary = { band, rows: rows.map(r => ({ seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc, finalRank: r.finalRank, natEver: r.nationalEver, table: r.table, entered: r.entered, firsts: r.firsts, counts: r.counts, forfeits: r.forfeits })), collapsedCoverage: covered, namingVillages, corpusOk,
    verdict: corpusOk ? 'CORPUS-PASS (verdict judged in evidence against the pre-registered DIAG-GO, not re-scored)' : 'CORPUS-FAIL' };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  VERDICT: ${summary.verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgate() {
  const seed = parseInt(process.env.SEED || '73901', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.FEASTDRAWCLEAN = '1'; delete process.env.COMPETENT_SEEK_FIGHTS;
  const baseRow = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'choiceprice-detgate-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, feastdrawDriveoffClean, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return feastdrawDriveoffClean.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    return { days: result.days, gameDays: result.gameDays, won: Game.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne(seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  // Hunttable control row (read-only): hunt 73901 must read
  // days 23, won 0, deaths 8, ts null.
  try {
    const hp = path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-hunttable-a', 's73901-hunttable-hunt.json');
    const hr = JSON.parse(fs.readFileSync(hp, 'utf8'));
    const hmatch = hr.days === wrappedRow.days && hr.won === wrappedRow.won && hr.deathTotal === wrappedRow.deathTotal && (hr.tsNationalDay != null ? hr.tsNationalDay : null) === wrappedRow.tsNationalDay;
    console.log(`  HUNTTABLE-CONTROL s73901-hunt: days=${hr.days} won=${hr.won} deaths=${hr.deathTotal} ts=${hr.tsNationalDay} | MATCH-WRAPPED=${hmatch}`);
    if (!hmatch) console.log('  HUNTTABLE-CONTROL MISMATCH (reported, not reconciled)');
  } catch (e) { console.log(`  HUNTTABLE-CONTROL READ FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  try {
    const evidDir = evidDirOf();
    const body = JSON.stringify({ seed, base: baseRow, wrapped: { days: wrappedRow.days, gameDays: wrappedRow.gameDays, won: wrappedRow.won, deaths: wrappedRow.deathTotal, ts: wrappedRow.tsNationalDay }, match }, null, 1) + '\n';
    writeFileRetry(path.join(evidDir, `detgate-${seed}.json`), body);
    writeFileRetry(path.join(evidDir, 'detgate.json'), body);
  } catch (e) { console.log(`  DETGATE ARTIFACT WRITE FAILED: ${String((e && e.message) || e).slice(0, 160)}`); }
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && argv[1] === 'choiceprice-hunt') return oneMode(argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate') return detgate();
  console.error('usage: test-choiceprice-sweep.js (--one choiceprice-hunt <seed> | --summary | --detgate)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { runOne, chainSnap };
