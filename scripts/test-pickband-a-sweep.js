#!/usr/bin/env node
// scripts/test-pickband-a-sweep.js — sim-pickband-a fresh band.
// DIAGNOSIS ONLY: base code + all diag recorders ON (fieldparty +
// returns + funnel + departhold), no game change, no policy change.
// Adapted from scripts/test-departhold-a-sweep.js by SEED BAND and
// CORPUS DIR ONLY (install order, write-retry/verify logic, row
// shape unchanged); DEPARTHOLD is FORCED ON here — there is no OFF
// mode in this arm. The departlag census logic lives in the
// analyzer (scripts/test-pickband-a.js, importing classifyPick
// from scripts/test-departlag-a.js verbatim); it is not a recorder.
// Runs the VERBATIM tableseat-nowait policy + fieldparty-form-diag +
// returns-diag + funnel-diag + departhold-diag recorders (all reused
// verbatim) on seeds 75117-75124, 180d death-aware,
// LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1,
// FUNNEL=1, DEPARTHOLD=1. Corpus: evidence/2026-10-29/
// perseed-pickband-a/ (EVID override for determinism scratch
// re-runs only). Predecessor corpora are NEVER overwritten.
// Census is judged by scripts/test-pickband-a.js, never here.
// Modes: --one <seed> (run one seed, write its row), --summary
// (build summary.json from rows on disk), no args (all seeds,
// then summary). Exit 1 in --summary mode if the corpus is
// incomplete or any recorder errored/overflowed.
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
  newStore: newReturnsStore, installReturnsDiag,
} = require('./policies/returns-diag');
const {
  newStore: newFunnelStore, installFunnelDiag,
} = require('./policies/funnel-diag');
const {
  newStore: newDepartholdStore, installDepartholdDiag, layerOn: departholdOn,
} = require('./policies/departhold-diag');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
process.env.DEPARTHOLD = '1';
const SEEDS = (process.env.SEEDS || '75117,75118,75119,75120,75121,75122,75123,75124')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  // FLAP-PATIENT (sim-funnel-a 2026-10-29): the container EPERM flap
  // blocks write(2) for tens of minutes at a stretch (git objects,
  // index locks, AND evidence writes all failed 02:17-02:20 UTC).
  // A short retry loop fails the whole band on the first row. Wait
  // it out instead: up to 120 attempts x 15s (~30 min per file).
  // If the flap outlasts that, failing loudly is correct.
  let lastErr = null;
  for (let a = 1; a <= 120; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      if (a === 1 || a % 10 === 0) console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 120) sleepMs(15000);
    }
  }
  throw lastErr;
}
function rowFileVerifies(fn, seed) {
  try {
    const back = JSON.parse(fs.readFileSync(fn, 'utf8'));
    if (!(back.seed === seed && back.days > 0 && Array.isArray((back.funnel || {}).picks) && Array.isArray((back.funnel || {}).notes)
      && Array.isArray((back.returns || {}).meetings) && Array.isArray((back.fieldparty || {}).meetings))) return false;
    if (departholdOn()) return Array.isArray((back.departhold || {}).evaluations);
    return back.departhold == null;
  } catch (e) { return false; }
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
function evidDirOf() {
  if (process.env.EVID) return process.env.EVID;
  return path.join(REPO, 'evidence', '2026-10-29', 'perseed-pickband-a');
}

async function runOne(seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FIELDPARTY = '1';
  process.env.RETURNS = '1';
  process.env.FUNNEL = '1';
  if (departholdOn()) process.env.DEPARTHOLD = '1'; else delete process.env.DEPARTHOLD;
  const fpStore = newFieldpartyStore();
  const rtStore = newReturnsStore();
  const fuStore = newFunnelStore();
  const dhStore = departholdOn() ? newDepartholdStore() : null;
  const base = withFieldpartyDiag(tableseatNowait, 'fieldparty-diag', 'tableseat-nowait + field-party formation census', fpStore);
  const { Game } = await loadGame({ seed, mode: 'funnel-a-fresh', fullTelemetry: false });
  await setupGame(Game);
  try { installFieldpartyDiag(Game, fpStore); } catch (e) {}
  try { installReturnsDiag(Game, rtStore); } catch (e) {}
  try { installFunnelDiag(Game, fuStore); } catch (e) {}
  if (dhStore) { try { installDepartholdDiag(Game, dhStore); } catch (e) {} }
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
      try { installReturnsDiag(G, rtStore); } catch (e) {}
      try { installFunnelDiag(G, fuStore); } catch (e) {}
      if (dhStore) { try { installDepartholdDiag(G, dhStore); } catch (e) {} }
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
    policy: 'fresh-base', seed,
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
    // Full deaths list (day-granular, harness live capture): the
    // DIED-BEFORE-PICK channel. Day only — same-day death-vs-pick
    // order is flagged, never assumed, by the analyzer.
    deathsList: deaths.map(d => ({ day: d.day, who: d.who, cause: d.cause, player: !!d.player, kind: d.kind || null })),
    ts: (() => { const ts = {}; if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k]; return ts; })(),
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    tableState: tableState,
    courtship: courtship,
    fieldparty: fpStore ? {
      meetings: fpStore.meetings, partCounter: fpStore.partCounter,
      diag: { errs: fpStore.errs, errors: fpStore.errors, overflow: fpStore.overflow, installed: fpStore.installed },
    } : null,
    returns: rtStore ? {
      meetings: rtStore.meetings, departures: rtStore.departures, drops: rtStore.drops,
      partCounter: rtStore.partCounter,
      diag: { errs: rtStore.errs, errors: rtStore.errors, overflow: rtStore.overflow, installed: rtStore.installed },
    } : null,
    funnel: fuStore ? {
      picks: fuStore.picks, notes: fuStore.notes,
      partCounter: fuStore.partCounter,
      diag: { errs: fuStore.errs, errors: fuStore.errors, overflow: fuStore.overflow, installed: fuStore.installed },
    } : null,
    departhold: dhStore ? {
      evaluations: dhStore.evaluations,
      dangerOutside: dhStore.dangerOutside, departOutside: dhStore.departOutside,
      healOutside: dhStore.healOutside, tightenOutside: dhStore.tightenOutside,
      partCounter: dhStore.partCounter,
      diag: { errs: dhStore.errs, errors: dhStore.errors, overflow: dhStore.overflow, installed: dhStore.installed },
    } : null,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    // FLAP-VERIFY (sim-funnel-a): container write denials can leave
    // a 0-byte or truncated file WITHOUT throwing (cp showed this
    // class on this tree). Read back + parse + check the seed, and
    // rewrite until the row on disk is the row in memory.
    const body = JSON.stringify(row, null, 1) + '\n';
    let verified = false;
    for (let a = 1; a <= 8 && !verified; a++) {
      writeFileRetry(fn, body);
      try {
        const back = JSON.parse(fs.readFileSync(fn, 'utf8'));
        if (back.seed === seed && Array.isArray((back.funnel || {}).picks) && Array.isArray((back.funnel || {}).notes)
      && (departholdOn() ? Array.isArray((back.departhold || {}).evaluations) : back.departhold == null)) verified = true;
        else console.log(`VERIFY-RETRY s${seed} attempt=${a} (parse ok, shape wrong)`);
      } catch (e) {
        console.log(`VERIFY-RETRY s${seed} attempt=${a} err=${String((e && e.message) || e).slice(0, 120)}`);
        if (a < 8) sleepMs(Math.min(10000, 1000 * a));
      }
    }
    if (!verified) throw new Error(`corpus row s${seed} failed read-back verification after 8 attempts`);
    row.corpusFile = fn;
  }
  return row;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8')));
  const dhOn = departholdOn();
  const corpusOk = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings)
    && r.fieldparty.diag.errs === 0 && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.returns && Array.isArray(r.returns.meetings)
    && r.returns.diag.errs === 0 && Object.values(r.returns.diag.overflow || {}).every(v => (v | 0) === 0)
    && r.funnel && Array.isArray(r.funnel.picks) && Array.isArray(r.funnel.notes)
    && r.funnel.diag.errs === 0 && Object.values(r.funnel.diag.overflow || {}).every(v => (v | 0) === 0)
    && (dhOn ? (r.departhold && Array.isArray(r.departhold.evaluations)
      && r.departhold.diag.errs === 0 && Object.values(r.departhold.diag.overflow || {}).every(v => (v | 0) === 0)
      && r.departhold.diag.installed === true)
      : (r.departhold == null)));
  const meetings = [];
  for (const r of rows) for (const m of (r.fieldparty.meetings || [])) meetings.push(Object.assign({ seed: r.seed }, m));
  const judgedA = meetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const judgedB = meetings.filter(m => (m.wave | 0) === 4 && m.channel === 'field'
    && ['resolve', 'patrol'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar));
  const formedA = judgedA.filter(m => ((m.crewRaw || []).filter(v => v !== m.vid)).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const formedB = judgedB.filter(m => ((m.crewRaw || []).filter(v => v !== m.vid)).length > 0 && (m.calledHelp || m.joinedAllyVid));
  const killsA = judgedA.filter(m => m.outcome === 'vKill');
  const killsB = judgedB.filter(m => m.outcome === 'vKill');
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
  let rtMeetings = 0, rtDepartures = 0, rtDrops = 0, fuPicks = 0, fuNotes = 0, dhEval = 0, dhOver = 0, dhDep = 0, dhHeld = 0, dhOut = 0;
  for (const r of rows) {
    rtMeetings += ((r.returns || {}).meetings || []).length;
    rtDepartures += ((r.returns || {}).departures || []).length;
    rtDrops += ((r.returns || {}).drops || []).length;
    fuPicks += ((r.funnel || {}).picks || []).length;
    fuNotes += ((r.funnel || {}).notes || []).length;
    const evs = ((r.departhold || {}).evaluations || []);
    dhEval += evs.length;
    dhOver += evs.filter(e => e.action === 'overwritten').length;
    dhDep += evs.filter(e => e.action === 'departed').length;
    dhHeld += evs.filter(e => e.action === 'held-ready').length;
    dhOut += ((r.departhold || {}).dangerOutside || []).length + ((r.departhold || {}).departOutside || []).length
      + ((r.departhold || {}).healOutside || []).length + ((r.departhold || {}).tightenOutside || []).length;
  }
  const summary = { band, deathsByCause, meetings: meetings.length,
    judgedA: judgedA.length, formedA: formedA.length, killsA: killsA.length,
    judgedB: judgedB.length, formedB: formedB.length, killsB: killsB.length,
    returnsMeetings: rtMeetings, returnsDepartures: rtDepartures, returnsDrops: rtDrops,
    funnelPicks: fuPicks, funnelNotes: fuNotes,
    departholdOn: dhOn, departholdEvaluations: dhEval, departholdOverwritten: dhOver,
    departholdDeparted: dhDep, departholdHeld: dhHeld, departholdOutside: dhOut,
    corpusOk };
  writeFileRetry(path.join(evidDir, 'summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('=== sim-pickband-a fresh band (all recorders ON) ===');
  console.log(`corpus: rows=${rows.length}/${SEEDS.length} ok=${corpusOk}`);
  console.log(`meetings all=${meetings.length} judgedA(resolve/patrol/aid)=${judgedA.length} formedA=${formedA.length} killsA=${killsA.length}`);
  console.log(`judgedB(resolve/patrol)=${judgedB.length} formedB=${formedB.length} killsB=${killsB.length}`);
  console.log(`returns: meetings=${rtMeetings} departures=${rtDepartures} drops=${rtDrops}`);
  console.log(`funnel: picks=${fuPicks} notes=${fuNotes}`);
  console.log(`departhold: evaluations=${dhEval} overwritten=${dhOver} departed=${dhDep} held=${dhHeld} outside=${dhOut}`);
  console.log(`FIELD-SHAPE (informational, fresh band): judgedA=${judgedA.length} formedA=${formedA.length} killsA=${killsA.length}`);
  console.log(`WALL: won=${band.won} (full=${band.wonFull}) natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave4=${band.wave4} wave5=${band.wave5} median=${band.medianDays} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`DEATHS-BY-CAUSE: ${JSON.stringify(deathsByCause)}`);
  console.log('PER-SEED:');
  for (const r of rows) {
    const jm = judgedA.filter(m => m.seed === r.seed);
    console.log(`  s${r.seed} days=${r.days} end=${r.endReason} won=${r.won} wave=${r.waveReach} judgedA=${jm.length} starv=${r.starvationDeaths} deaths=${r.deathTotal} fuPicks=${((r.funnel || {}).picks || []).length} fuNotes=${((r.funnel || {}).notes || []).length} dhEval=${((r.departhold || {}).evaluations || []).length}`);
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
    console.log(`  [fresh seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} rtMeetings=${row.returns.meetings.length} rtDep=${row.returns.departures.length} rtDrops=${row.returns.drops.length} fuPicks=${row.funnel.picks.length} fuNotes=${row.funnel.notes.length} dhEval=${row.departhold ? row.departhold.evaluations.length : 0} fpErrs=${row.fieldparty.diag.errs} rtErrs=${row.returns.diag.errs} fuErrs=${row.funnel.diag.errs} dhErrs=${row.departhold ? row.departhold.diag.errs : 0}`);
    return;
  }
  for (const seed of SEEDS) {
    // RESUME: a verified row on disk is never re-simulated (the
    // band is deterministic; re-running a good seed wastes the
    // slot and risks nothing, but resume keeps flap-interrupted
    // bands cheap to finish).
    const existing = path.join(evidDir, `s${seed}-fresh.json`);
    if (rowFileVerifies(existing, seed)) {
      const r = JSON.parse(fs.readFileSync(existing, 'utf8'));
      console.log(`  [fresh seed ${seed}] RESUMED days=${r.days} end=${r.endReason} wave=${r.waveReach} won=${r.won} natEver=${r.nationalEver} starv=${r.starvationDeaths} deaths=${r.deathTotal} fpMeetings=${r.fieldparty.meetings.length} rtMeetings=${r.returns.meetings.length} rtDep=${r.returns.departures.length} rtDrops=${r.returns.drops.length} fuPicks=${r.funnel.picks.length} fuNotes=${r.funnel.notes.length} dhEval=${r.departhold ? r.departhold.evaluations.length : 0}`);
      continue;
    }
    const row = await runOne(seed, days, evidDir);
    console.log(`  [fresh seed ${seed}] days=${row.days} end=${row.endReason} wave=${row.waveReach} won=${row.won} natEver=${row.nationalEver} starv=${row.starvationDeaths} deaths=${row.deathTotal} fpMeetings=${row.fieldparty.meetings.length} rtMeetings=${row.returns.meetings.length} rtDep=${row.returns.departures.length} rtDrops=${row.returns.drops.length} fuPicks=${row.funnel.picks.length} fuNotes=${row.funnel.notes.length} dhEval=${row.departhold ? row.departhold.evaluations.length : 0} fpErrs=${row.fieldparty.diag.errs} rtErrs=${row.returns.diag.errs} fuErrs=${row.funnel.diag.errs} dhErrs=${row.departhold ? row.departhold.diag.errs : 0}`);
  }
  await summaryMode();
}
main().catch(e => { console.error('SWEEP-FAIL', e && e.stack || e); process.exit(1); });
