#!/usr/bin/env node
// scripts/test-staying-b-sweep.js — sim-staying-b pilot sweep.
// Runs the VERBATIM tableseat-nowait policy + the fieldparty-form-diag
// recorder (reused verbatim, never edited) + the staying-b recorder
// (observational only) on seeds 75101-75108, 180d death-aware,
// LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, STAYINGB=1.
// Modes: --one <seed> | --summary | (no args: all seeds + summary).
// TAG env ('base' | 'armed', default 'base') selects the corpus file
// suffix; EVID env overrides the corpus dir. The BASE leg must
// reproduce the control shape EXACTLY (meetings 1272, judgedA 24,
// kills 0) before any armed sweep is judged.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const {
  newStore: newFieldpartyStore, installFieldpartyDiag, withFieldpartyDiag,
} = require('./policies/fieldparty-form-diag');
const {
  newStore: newStayingbStore, installStayingbDiag, withStayingbDiag,
} = require('./policies/staying-b-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '75101,75102,75103,75104,75105,75106,75107,75108')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const TAG = (process.env.TAG || 'base').replace(/[^A-Za-z0-9_-]/g, '') || 'base';
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
// EPERM flap (2026-10-29 class: write(2) returns EPERM for minutes at a
// time, across dirs, for every exec-side channel — /tmp, workspace,
// /dev/shm, and .git objects all denied alike; only the file-tool
// channel still writes). During a flap, disk writes are futile, so
// retry briefly (a clear moment may land) and then NEVER lose a
// computed seed: on final failure the full row JSON goes to stdout
// (ROWJSON-BEGIN/END) so it can be reconstructed by hand, and the
// sweep continues to the next seed instead of aborting.
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a <= 4; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return true; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 4) sleepMs(Math.min(8000, 2000 * a));
    }
  }
  return false;
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-staying-b'); }

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  process.env.STAYINGB = '1';
  const fpStore = newFieldpartyStore();
  const sbStore = newStayingbStore();
  let base = withFieldpartyDiag(tableseatNowait, 'fieldparty-diag', 'tableseat-nowait + field-party formation census', fpStore);
  base = withStayingbDiag(base, 'stayingb-diag', 'tableseat-nowait + staying-b fight census', sbStore);
  const { Game } = await loadGame({ seed, mode: 'staying-b-' + TAG, fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
  try { installStayingbDiag(Game, sbStore); } catch (e) {}
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
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  let tableState = null;
  try { const tst = Game.tableState ? Game.tableState() : null; if (tst) tableState = { path: tst.path || null, branch: tst.branch || null, phase: tst.phase || null, seat: tst.seat || null }; } catch (e) {}
  const COURT_KEYS = ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead'];
  const courtship = {};
  for (const k of COURT_KEYS) courtship[k] = capturedCtx ? ((capturedCtx[k] | 0) || 0) : 0;
  courtship.combined = COURT_KEYS.reduce((t, k) => t + courtship[k], 0);
  const row = {
    policy: 'staying-b-' + TAG, seed, tag: TAG,
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
    tableState: tableState,
    courtship: courtship,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
    stayingb: sbStore ? {
      meetings: sbStore.meetings,
      diag: { errs: sbStore.errs, errors: sbStore.errors, overflow: sbStore.overflow, installed: sbStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${TAG}.json`);
    const ok = writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    if (ok) row.corpusFile = fn;
    else {
      // FLAP FALLBACK: the full row is ~130KB of lens detail and cannot
      // be hand-copied, so print only what the judgment needs, verbatim
      // from the recorders: the judgedA staying-b rows, the wall fields,
      // and the recorder counts (including the fieldparty judgedA count
      // for the control-shape cross-check). The run is deterministic, so
      // a later clear-window --one re-run reproduces the full row.
      row.writeFailed = true;
      const sbJudged = (sbStore.meetings || []).filter(m => (m.wave | 0) === 4 && m.channel === 'field'
        && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !m.leaderIsScholar);
      const fpJudged = (fpStore.meetings || []).filter(m => (m.wave | 0) === 4 && m.channel === 'field'
        && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
      const extract = { seed, tag: TAG,
        wall: { days: row.days, gameDays: row.gameDays, endReason: row.endReason, won: row.won,
          waveReach: row.waveReach, maxRank: row.maxRank, finalRank: row.finalRank,
          nationalEver: row.nationalEver, nationalFinal: row.nationalFinal,
          table: row.table, entered: row.entered, deathTotal: row.deathTotal,
          starvationDeaths: row.starvationDeaths, deaths: row.deaths },
        counts: { fpMeetings: (fpStore.meetings || []).length, sbMeetings: (sbStore.meetings || []).length,
          fpJudgedA: fpJudged.length, sbJudgedA: sbJudged.length,
          fpErrs: fpStore.diag ? fpStore.diag.errs : fpStore.errs, sbErrs: sbStore.diag ? sbStore.diag.errs : sbStore.errs },
        judged: sbJudged };
      console.log(`JUDGEDJSON-BEGIN s${seed}-${TAG}`);
      console.log(JSON.stringify(extract));
      console.log(`JUDGEDJSON-END s${seed}-${TAG}`);
    }
  }
  return row;
}

function breakReason(m) {
  if (m.outcome === 'vKill') return 'KILL';
  if (m.outcome === 'mFlee' && (m.rounds | 0) < 15 && !m.capLine) return 'DRIVE-OFF';
  if ((m.rounds | 0) === 15 && m.capLine) return 'CAP';
  if (m.outcome === 'vDie') return 'PARTY-DEATH';
  if (m.outcome === 'vFlee' && m.fleeHopeless) return 'HOPELESS';
  if (m.outcome === 'vFlee' && m.fleeLearn && !m.fleeHopeless) return 'LEARN-WITHDRAWAL';
  if (m.outcome === 'vFlee' && !m.fleeHopeless && !m.fleeLearn) return 'WOUND-FLOOR';
  return 'OTHER';
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-${TAG}.json`), 'utf8')));
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.stayingb && Array.isArray(r.stayingb.meetings)
    && r.stayingb.diag.errs === 0 && Object.values(r.stayingb.diag.overflow || {}).every(v => (v | 0) === 0));
  const meetings = [];
  for (const r of rows) for (const m of (r.stayingb.meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const fpMeetings = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) fpMeetings.push(Object.assign({ seed: r.seed }, m));
  const judgedA = meetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !m.leaderIsScholar);
  const judgedWild = judgedA.filter(m => ['resolve', 'patrol'].indexOf(m.caller) >= 0);
  const foughtA = judgedA.filter(m => (m.rounds | 0) >= 1 && ['vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(m.outcome) >= 0);
  const tileParty = judgedA.filter(m => (m.tileJoined | 0) >= 1);
  const tileKills = tileParty.filter(m => m.outcome === 'vKill');
  const tileDrive = tileParty.filter(m => m.outcome === 'mFlee');
  const tileDeaths = tileParty.filter(m => m.outcome === 'vDie');
  const soloWild = judgedWild.filter(m => (m.tileJoined | 0) === 0 && !m.calledHelp && (m.alliesJoined == null || m.alliesJoined.length === 0));
  const breaks = {};
  for (const m of foughtA) { const b = breakReason(m); breaks[b] = (breaks[b] || 0) + 1; }
  const med = (arr) => medianOf(arr);
  const band = {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(rows.map(r => r.days)),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const deathsByCause = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) deathsByCause[k] = (deathsByCause[k] || 0) + v;
  const summary = { band, deathsByCause, meetings: meetings.length, fpMeetings: fpMeetings.length,
    judgedA: judgedA.length, judgedWild: judgedWild.length, foughtA: foughtA.length,
    tileParty: tileParty.length, tileKills: tileKills.length, tileDrive: tileDrive.length, tileDeaths: tileDeaths.length,
    soloWild: soloWild.length, breaks,
    partyRoundsMed: med(tileParty.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0)),
    partyMDealtMed: med(tileParty.map(m => m.mDealt | 0)),
    soloRoundsMed: med(soloWild.filter(m => (m.rounds | 0) >= 1).map(m => m.rounds | 0)),
    soloDeaths: soloWild.filter(m => m.outcome === 'vDie').length,
    judgedPartyDeaths: judgedA.filter(m => m.outcome === 'vDie').length,
    corpusOk, tag: TAG };
  if (!writeFileRetry(path.join(evidDir, `summary-${TAG}.json`), JSON.stringify(summary, null, 1) + '\n')) {
    console.log(`SUMMARYJSON-BEGIN ${TAG}`);
    console.log(JSON.stringify(summary));
    console.log(`SUMMARYJSON-END ${TAG}`);
  }
  console.log(`=== sim-staying-b ${TAG} band ===`);
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk} fpMeetings=${fpMeetings.length} sbMeetings=${meetings.length}`);
  console.log(`judgedA=${judgedA.length} judgedWild=${judgedWild.length} foughtA=${foughtA.length} tileParty=${tileParty.length} tileKills=${tileKills.length} tileDrive=${tileDrive.length} tileDeaths=${tileDeaths.length}`);
  console.log(`BREAKS(foughtA): ${JSON.stringify(breaks)}`);
  console.log(`partyRoundsMed=${summary.partyRoundsMed} partyMDealtMed=${summary.partyMDealtMed} soloWild=${soloWild.length} soloRoundsMed=${summary.soloRoundsMed} soloDeaths=${summary.soloDeaths}`);
  console.log(`WALL: won=${band.won} (full=${band.wonFull}) natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} median=${band.medianDays} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    const jm = judgedA.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} end=${r.endReason} won=${r.won} wave=${r.waveReach} judgedA=${jm.length} starv=${r.starvationDeaths} deaths=${r.deathTotal}`);
  }
  if (!corpusOk) { console.log('CORPUS-INVALID'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  if (args[0] === '--summary') { await summaryMode(); return; }
  if (args[0] === '--one') {
    const seed = parseInt(args[1], 10);
    const row = await runOne(seed, days, evidDir);
    console.log(`  [${TAG} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} sbMeetings=${row.stayingb.meetings.length} fpErrs=${row.fieldparty.diag.errs} sbErrs=${row.stayingb.diag.errs}`);
    return;
  }
  for (const seed of SEEDS) {
    const row = await runOne(seed, days, evidDir);
    console.log(`  [${TAG} seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} sbMeetings=${row.stayingb.meetings.length} fpErrs=${row.fieldparty.diag.errs} sbErrs=${row.stayingb.diag.errs} writeFailed=${!!row.writeFailed}`);
  }
  try { await summaryMode(); }
  catch (e) { console.log('SUMMARY-SKIPPED (row files incomplete — flap fallback; judge from JUDGEDJSON extracts instead): ' + String((e && e.message) || e).slice(0, 200)); }
}
main().catch(e => { console.error('SWEEP-FAIL', e && e.stack || e); process.exit(1); });
