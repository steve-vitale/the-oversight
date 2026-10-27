#!/usr/bin/env node
// scripts/test-arroworigin-diag-sweep.js — sim-arroworigin-a sweep
// (scale-onramp axis, 2026-10-27, arm sim-arroworigin-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; every row is written
// incrementally into the worktree evidence dir, NEVER /tmp).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot.
// Armed: tableseat-nowait wrapped with ONE new observational recorder
// (arroworigin-diag, ARROWORIGIN=1): per-day per-person arrow map
// (carried + stashed), holder detail (items/stashed/fullPool), scholar
// bucket, change events, new-person events — all BEFORE the day's
// actions, so day 1 is the post-setup starting state.
// Records after delegating nothing: the snapshot precedes inner.daily
// by design (starting-state convention, same as ammostorage-diag).
// It draws no RNG, never throws into the engine.
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>. See the evidence
// pre-registration in evidence/2026-10-27/sim-arroworigin-a-prereg.md
// for the arrival paths, the DIAG-GO bar, and the cross-checks.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newArrowStore, withArrowOriginDiag,
} = require('./policies/arroworigin-diag');
const PI = require('./postunlock-instrument');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const BAND1920 = { wins: 2, nationalEver: 6, nationalFinal: 5, table: 4, entered: 2, wave4: 6, wave5: 0, medianDays: 152, deaths: 307, starvation: 1 };

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) {} }
function writeFileRetry(p, body) {
  // Patient retry: the container EPERM flap on writes can last many
  // minutes (this arm: every sweep-child write failed 01:27–01:46 CDT
  // across evidence/ AND /tmp, while shell probes in the gaps passed —
  // a temporal flap, not a path, size, or harness effect; a state.js
  // "culprit" from bisecting was coincidence, retracted). Never force,
  // never ref surgery: wait it out. 60 attempts, sleeps 2s..30s,
  // ~26 min of waiting max. The sweep parent (which never runs the
  // harness) owns all corpus writes, so a long wait costs no sim time.
  let lastErr = null;
  for (let a = 1; a <= 60; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 60) sleepMs(Math.min(30000, 2000 * a));
    }
  }
  throw lastErr;
}
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-27', 'perseed-arroworigin-a'); }
// writeViaChild: corpus writes go through a FRESH writer child process,
// never through a process that spawned a harness child. REPRODUCED
// 2026-10-27: after a process spawns a child that runs loadGame (even
// load-only, no sim days), that process's own fs writes fail with EPERM
// on the write syscall (open succeeds, 0-byte file left) — while reads,
// mkdir, and readdir keep working, and fresh processes write fine.
// Mechanism unidentified (not require, not eval content, not spawn
// alone, not size, not filename — all bisected); the rule is what the
// sweep obeys. The writer child is trivial (no harness, no spawns), so
// its writes succeed; it verifies by reading back and parsing.
const WRITER_SRC = "const fs=require('fs'),path=require('path');"
  + "const dest=process.argv[1];const wantSeed=process.argv[2];const wantPolicy=process.argv[3];"
  + "const body=fs.readFileSync(0,'utf8');"
  + "fs.mkdirSync(path.dirname(dest),{recursive:true});"
  + "fs.writeFileSync(dest,body);"
  + "const back=JSON.parse(fs.readFileSync(dest,'utf8'));"
  + "if(!back||!(back.days>0)) throw new Error('verify: bad days');"
  + "if(wantSeed&&String(back.seed)!==wantSeed) throw new Error('verify: seed');"
  + "if(wantPolicy&&back.policy!==wantPolicy) throw new Error('verify: policy');"
  + "console.log('VERIFIED '+Buffer.byteLength(body));";
function writeViaChild(dest, body, seed, policy) {
  const out = execFileSync('node', ['-e', WRITER_SRC, dest, seed != null ? String(seed) : '', policy || ''],
    { cwd: REPO, encoding: 'utf8', timeout: 300000, input: body });
  if (out.indexOf('VERIFIED') < 0) throw new Error(`WRITER CHILD NO VERIFY ${dest}: ${String(out).slice(0, 200)}`);
  console.log(`  [writer-child ${path.basename(dest)} ${out.trim()}]`);
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
function copyFaced(Game) {
  const out = { faced: {}, errs: 0, error: null };
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out.faced[k] = faced[k] | 0;
  } catch (e) { out.errs++; out.error = 'wavesFaced: ' + String((e && e.message) || e).slice(0, 100); }
  return out;
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  let arrowStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.ARROWORIGIN = '1';
    arrowStore = newArrowStore();
    base = withArrowOriginDiag(tableseatNowait, 'arroworigin-diag', 'tableseat-nowait + per-person arrow-arrival trace', arrowStore);
  } else {
    delete process.env.ARROWORIGIN;
  }
  const { Game } = await loadGame({ seed, mode: 'arroworigin-diag-' + pid, fullTelemetry: false });
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
  const faced = copyFaced(Game);
  const log = copyKillLog(Game);
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ts = {};
  if (capturedCtx) for (const k of Object.keys(capturedCtx)) if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
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
    ts,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    faced: faced.faced, facedErrs: faced.errs, facedError: faced.error,
    logEntries: log.entries, logErrs: log.errs, logError: log.error,
  };
  if (pid === 'armed') {
    // Strip in-memory-only fields before serializing.
    const clean = {
      dailyRows: arrowStore.dailyRows, changeEvents: arrowStore.changeEvents,
      newPersons: arrowStore.newPersons,
      diag: { errs: arrowStore.errs, errors: arrowStore.errors, overflow: arrowStore.overflow, installed: arrowStore.installed },
    };
    row.arroworigin = clean;
  } else {
    row.note = 'snapshot-only: no event lists on the baseline arm';
  }
  // NOTE: runOne NEVER writes files itself (see writeViaChild: a process
  // that ran the harness cannot write). Callers write via writer child
  // (oneMode/sweepMode) or not at all (detgate/detail, evidDir null).
  return row;
}

function classifySeed(row) {
  const ao = (row.arroworigin) || {};
  const rows = ao.dailyRows || [];
  const changes = ao.changeEvents || [];
  const news = ao.newPersons || [];
  const diagErrs = (ao.diag && ao.diag.errs) | 0;
  const overflowN = ao.diag ? ((ao.diag.overflow.dailyRows | 0) + (ao.diag.overflow.changeEvents | 0) + (ao.diag.overflow.newPersons | 0)) : 0;
  const firstWithArrow = rows.find(r => (r.total | 0) > 0) || null;
  const maxTotal = rows.reduce((m, r) => Math.max(m, r.total | 0), 0);
  const daysWithArrow = rows.filter(r => (r.total | 0) > 0).length;
  const scholarDays = rows.filter(r => (r.scholarArrow | 0) > 0).length;
  const scholarMax = rows.reduce((m, r) => Math.max(m, r.scholarArrow | 0), 0);
  const holderSet = {};
  for (const r of rows) for (const h of (r.holders || [])) holderSet[h.vid] = h.name || h.vid;
  const holderVids = Object.keys(holderSet);
  // Arrival attribution per prereg: first arrow day's holder detail +
  // whether the holder is a first-roster-day person that day.
  // Compact v2 rows carry it as holderDetail; full rows carry it on
  // the first arrow day's holders[0]. Both shapes are accepted.
  let arrival = null;
  if (firstWithArrow) {
    const h = (row.arroworigin && row.arroworigin.holderDetail) || (firstWithArrow.holders || [])[0] || null;
    const np = news.find(n => n.vid === (h && h.vid) && n.day === firstWithArrow.day) || null;
    const firstSeen = news.find(n => n.vid === (h && h.vid)) || null;
    // Joiner-population signature (Petra 73672): the change event on the
    // arrow day has EMPTY previous lists — the person record itself was
    // populated that day (static bg seed -> hydrated villager), not an
    // item gained by an existing person (whose prev lists would be
    // non-empty). The recorder's newPersons day for such a holder is
    // the static-bg first-seen artifact (day 1), NOT the join day, and
    // must never be cited as one — the change event + villager-list
    // transition (deepdive) are the join evidence.
    const chOnDay = changes.find(c => c.vid === (h && h.vid) && c.day === firstWithArrow.day) || null;
    arrival = h ? {
      day: firstWithArrow.day, vid: h.vid, name: h.name,
      carried: h.carried, stashed: h.stashed,
      items: h.items, stashedList: h.stashedList,
      fullPool: h.fullPool, fullPoolHasArrow: Array.isArray(h.fullPool) && h.fullPool.indexOf('arrow') >= 0,
      equippedRanged: h.equippedRanged,
      holderFirstRosterDay: firstSeen ? firstSeen.day : null,
      holderIsNewThatDay: !!np,
      holderNewPersonRecord: np,
      changeEventOnArrivalDay: chOnDay,
      changePrevEmpty: !!(chOnDay && !(chOnDay.prevItems || []).length && !(chOnDay.prevStashedList || []).length),
    } : null;
  }
  const checks = {
    rowsPresent: rows.length > 0,
    rowsMatchDays: rows.length === row.days || rows.length === row.days + 0,
    diagClean: diagErrs === 0 && overflowN === 0,
  };
  checks.all = checks.rowsPresent && checks.diagClean;
  return {
    seed: row.seed,
    days: row.days, dailyRows: rows.length,
    checks: checks, diagErrs: diagErrs, overflowN: overflowN,
    changeEvents: changes.length, newPersons: news.length,
    firstArrowDay: firstWithArrow ? firstWithArrow.day : null,
    maxTotal: maxTotal, daysWithArrow: daysWithArrow,
    holderVids: holderVids, holderNames: holderSet,
    scholarDaysWithArrow: scholarDays, scholarMaxArrow: scholarMax,
    arrival: arrival,
    changeEventsList: changes, newPersonsList: news,
    dailyRowsList: rows,
  };
}

function bandOf(rows, pid) {
  const rs = rows.filter(r => r.policy === pid);
  const wave = (n) => rs.filter(r => (r.waveReach || 1) >= n).length;
  return {
    n: rs.length,
    won: rs.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rs.map(r => r.days)),
    maxDays: Math.max.apply(null, rs.map(r => r.days).concat([0])),
    nationalEver: rs.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rs.reduce((t, r) => t + r.nationalFinal, 0),
    table: rs.reduce((t, r) => t + r.table, 0),
    entered: rs.reduce((t, r) => t + r.entered, 0),
    wave3: wave(3), wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rs.map(r => r.maxArc).concat([1])),
    starvationTotal: rs.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: rs.reduce((t, r) => t + r.deathTotal, 0),
  };
}
function mergeCounters(list) {
  const m = {};
  for (const c of list) for (const k of Object.keys(c)) m[k] = (m[k] || 0) + c[k];
  return m;
}

// Ammostorage cross-check: first-arrow snapshot day per seed, recomputed
// from evidence/2026-10-26/perseed-ammostorage-a/s<seed>-armed.json.
function ammostorageCrossCheck() {
  const dir = path.join(REPO, 'evidence', '2026-10-26', 'perseed-ammostorage-a');
  const out = {};
  for (const seed of SEEDS) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
      const snaps = (r.ammostorage && r.ammostorage.dailySnapshots) || [];
      let first = null, maxTot = 0;
      for (const sn of snaps) {
        const st = sn.storage || {};
        const tot = ((st.otherPersonsStashed && st.otherPersonsStashed.arrow) | 0)
          + ((st.otherPersonsCarried && st.otherPersonsCarried.arrow) | 0)
          + ((st.scholarInventory && st.scholarInventory.arrow) | 0);
        if (tot > maxTot) maxTot = tot;
        if (tot > 0 && !first) first = { day: sn.day, total: tot, stashed: (st.otherPersonsStashed && st.otherPersonsStashed.arrow) | 0, carried: (st.otherPersonsCarried && st.otherPersonsCarried.arrow) | 0 };
      }
      out[seed] = { firstArrowDay: first ? first.day : null, firstTotal: first ? first.total : 0, maxTotal: maxTot, snaps: snaps.length };
    } catch (e) { out[seed] = { error: String((e && e.message) || e).slice(0, 120) }; }
  }
  return out;
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      const p = path.join(evidDir, `s${seed}-${pid}.json`);
      rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
    }
  }
  const perSeed = [];
  for (const seed of SEEDS) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    perSeed.push(classifySeed(armed));
  }
  const g2 = [];
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = !!c && !!a && c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    // Faced comparison is SEMANTIC (sorted keys): JSON object key order
    // carries no game meaning, and one corpus file (73671 baseline) was
    // transcribed with alphabetically sorted keys while its armed twin
    // keeps run order. Values must still match exactly; order must not
    // fail the leg. (Same rule as the proof script's G2 faced check.)
    const sortKeys = o => JSON.stringify(Object.fromEntries(Object.entries(o || {}).sort()));
    const facedOk = !!c && !!a && sortKeys(c.faced) === sortKeys(a.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const corpusOk = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.faced && r.logEntries)
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.arroworigin.dailyRows) && Array.isArray(r.arroworigin.changeEvents));
  const baselineBand = bandOf(rows, 'baseline');
  const armedBand = bandOf(rows, 'armed');
  const diff1920 = {
    wins: baselineBand.won - BAND1920.wins, nationalEver: baselineBand.nationalEver - BAND1920.nationalEver,
    nationalFinal: baselineBand.nationalFinal - BAND1920.nationalFinal, table: baselineBand.table - BAND1920.table,
    entered: baselineBand.entered - BAND1920.entered,
    wave4: baselineBand.wave4 - BAND1920.wave4, wave5: baselineBand.wave5 - BAND1920.wave5,
    medianDays: baselineBand.medianDays - BAND1920.medianDays, deaths: baselineBand.deathTotal - BAND1920.deaths,
    starvation: baselineBand.starvationTotal - BAND1920.starvation,
  };
  const rebaselineExact = Object.keys(diff1920).every(k => diff1920[k] === 0);
  const costBar = {
    starvationOk: armedBand.starvationTotal <= baselineBand.starvationTotal + 2,
    medianOk: armedBand.medianDays >= 0.8 * baselineBand.medianDays,
  };
  const ammoX = ammostorageCrossCheck();
  const xPerSeed = perSeed.map(p => {
    const x = ammoX[p.seed] || {};
    return {
      seed: p.seed, myFirstDay: p.firstArrowDay, ammoFirstDay: x.firstArrowDay,
      firstDayMatch: p.firstArrowDay === x.firstArrowDay,
      myMaxTotal: p.maxTotal, ammoMaxTotal: x.maxTotal, maxMatch: p.maxTotal === x.maxTotal,
      myDaysWithArrow: p.daysWithArrow, diagClean: p.checks.diagClean,
    };
  });
  const xMatch = xPerSeed.every(x => x.firstDayMatch && x.maxMatch);
  // DIAG-GO per prereg: named source on BOTH arrow seeds + zero-arrow on
  // the other 6 + recorder neutrality.
  function namedSource(p) {
    if (!p.arrival) return null;
    const a = p.arrival;
    if (!a.fullPoolHasArrow) return null;
    // Founder: arrow day 1, holder a full person from day 1 (Jesse 73676:
    // day-1 record carries items + fullPool, zero change events).
    if (a.day === 1 && a.holderFirstRosterDay === 1 && p.changeEvents === 0) return 'starting stash (founder)';
    // Joiner-population: arrow day > 1, holder's person record populated
    // that day (change event with empty previous lists) with the opening
    // pool (Petra 73672: day 40). The recorder's newPersons day for such
    // a holder is the static-bg first-seen artifact, never the join day.
    if (a.day > 1 && a.changePrevEmpty) return 'starting stash (joiner-population, person record populated day ' + a.day + ' with opening pool)';
    return null;
  }
  const arrowSeeds = perSeed.filter(p => p.firstArrowDay != null);
  const zeroSeeds = perSeed.filter(p => p.firstArrowDay == null);
  const sources = {};
  for (const p of arrowSeeds) sources[p.seed] = namedSource(p);
  const verdict = (arrowSeeds.length === 2 && arrowSeeds.every(p => !!namedSource(p))
    && zeroSeeds.length === 6 && zeroSeeds.every(p => p.daysWithArrow === 0 && p.maxTotal === 0)
    && g2Pass && xMatch) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const deathBand = mergeCounters(rows.filter(r => r.policy === 'armed').map(r => r.deaths));
  const report = {
    label: 'sim-arroworigin-a', seeds: SEEDS, days: 180, perSeed: perSeed.map(p => {
      const copy = Object.assign({}, p);
      delete copy.dailyRowsList; delete copy.changeEventsList; delete copy.newPersonsList;
      return copy;
    }),
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1920: diff1920, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920,
    ammostorageCrossCheck: { perSeed: xPerSeed, xMatch: xMatch, ammoX: ammoX },
    sources: sources, verdict: verdict,
    verdictRule: 'DIAG-GO iff a NAMED source (fullPool-traced starting stash / craft / loot / trade) on BOTH arrow seeds, zero-arrow on the other 6 seeds, recorder neutrality (G2), and ammostorage first-day + max agreement.',
    deathBandArmed: deathBand,
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  // Summary write also goes through a writer child: by now this parent
  // has spawned harness children and cannot write (see writeViaChild).
  writeViaChild(summaryPath, JSON.stringify(report, null, 1) + '\n', null, null);
  console.log('\n=== sim-arroworigin-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: days=${p.days} rows=${p.dailyRows} firstArrowDay=${p.firstArrowDay} maxTotal=${p.maxTotal} daysWithArrow=${p.daysWithArrow} holders=${JSON.stringify(p.holderVids)} scholarMax=${p.scholarMaxArrow} scholarDays=${p.scholarDaysWithArrow} changes=${p.changeEvents} newPersons=${p.newPersons} diagClean=${p.checks.diagClean}`);
    if (p.arrival) console.log(`    arrival: d${p.arrival.day} ${p.arrival.name} (${p.arrival.vid}) carried=${p.arrival.carried} stashed=${p.arrival.stashed} fullPoolHasArrow=${p.arrival.fullPoolHasArrow} holderFirstRosterDay=${p.arrival.holderFirstRosterDay} equippedRanged=${p.arrival.equippedRanged} -> source=${sources[p.seed] || 'UNATTRIBUTED'}`);
  }
  for (const x of xPerSeed) {
    console.log(`  xcheck seed ${x.seed}: myFirst=${x.myFirstDay} ammoFirst=${x.ammoFirstDay} match=${x.firstDayMatch} myMax=${x.myMaxTotal} ammoMax=${x.ammoMaxTotal} maxMatch=${x.maxMatch} diagClean=${x.diagClean}`);
  }
  console.log(`  -> VERDICT ${verdict} -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  // EPERM-flap design (this arm, 2026-10-27): sweep children NEVER write
  // files, and neither does this parent. REPRODUCED RULE: after a
  // process spawns a child that runs loadGame, that process's own fs
  // writes fail with EPERM (open succeeds, 0-byte file left) while
  // reads/mkdir/readdir keep working. Each child runs with NO_WRITE=1:
  // it prints its row as one ROWJSON line on stdout, and the parent
  // hands the row to a FRESH writer child (writeViaChild) that writes
  // + verifies it. No sweep output ever rests in /tmp, and no poisoned
  // process ever writes a corpus file.
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      // Resume-safe: skip a seed whose evidence file already exists,
      // parses, and matches seed/policy (lets a killed/poisoned parent
      // restart without re-running finished seeds).
      const dest0 = path.join(evidDir, `s${seed}-${pid}.json`);
      try {
        const existing = JSON.parse(fs.readFileSync(dest0, 'utf8'));
        if (existing.seed === seed && existing.policy === pid && existing.days > 0) {
          console.log(`--- ${pid} seed ${seed} --- (skip: evidence present, verified)`);
          continue;
        }
      } catch (e) { /* missing/corrupt/partial: run it */ }
      console.log(`--- ${pid} seed ${seed} ---`);
      let out;
      try {
        out = execFileSync('node', [path.join(REPO, 'scripts', 'test-arroworigin-diag-sweep.js'), '--one', pid, String(seed)],
          { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { NO_WRITE: '1' }) });
      } catch (e) {
        console.log(`CHILD FAILED ${pid} seed ${seed}: ${String((e && e.message) || e).slice(0, 300)}`);
        if (e.stdout) process.stdout.write(e.stdout);
        if (e.stderr) process.stdout.write(e.stderr);
        throw e;
      }
      process.stdout.write(out);
      const rowLine = out.split('\n').find(l => l.indexOf('ROWJSON ') === 0);
      if (!rowLine) throw new Error(`NO ROWJSON FROM CHILD ${pid} seed ${seed}`);
      const body = rowLine.slice('ROWJSON '.length);
      const parsed = JSON.parse(body);
      if (parsed.seed !== seed || parsed.policy !== pid) throw new Error(`ROWJSON MISMATCH ${pid} seed ${seed}: got seed=${parsed.seed} policy=${parsed.policy}`);
      const dest = path.join(evidDir, `s${seed}-${pid}.json`);
      writeViaChild(dest, body + '\n', seed, pid);
      console.log(`  [parent-wrote ${seed}-${pid} bytes=${body.length + 1}]`);
    }
  }
  await summaryMode();
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  // NO_WRITE=1 (sweepMode): the child writes NOTHING — it prints the row
  // as one ROWJSON line for the parent to write (EPERM-flap design).
  // Without NO_WRITE (direct --one use), the row is written via a
  // writer child (runOne itself never writes — see writeViaChild).
  const noWrite = process.env.NO_WRITE === '1';
  const evidDir = noWrite ? null : evidDirOf();
  const row = await runOne(pid, seed, days, null);
  if (!noWrite) {
    const dest = path.join(evidDir, `s${seed}-${pid}.json`);
    writeViaChild(dest, JSON.stringify(row, null, 1) + '\n', seed, pid);
  }
  let line = `days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal}`;
  if (pid === 'armed') {
    const c = classifySeed(row);
    line += ` rows=${c.dailyRows} firstArrowDay=${c.firstArrowDay} maxTotal=${c.maxTotal} changes=${c.changeEvents} newPersons=${c.newPersons} diagErrs=${c.diagErrs}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
  if (noWrite) {
    const clean = Object.assign({}, row);
    delete clean.corpusFile;
    if (pid === 'armed' && clean.arroworigin) {
      // COMPACT ROWJSON v2 (session-write-poisoning path, 2026-10-27):
      // the row travels out of the poisoned session via stdout and is
      // written to the corpus by a fresh session, so per-day holder
      // DETAIL (items/stashed/fullPool, repeated on every arrow day)
      // is factored out: daily rows carry only day, totals, slim
      // holder identities ({vid,name,carried,stashed}), and
      // scholarArrow; the full holder record appears ONCE as
      // holderDetail (first arrow day) and once as holderLast (last
      // day), plus scholarFirstFullPool (day-1 scholar pool).
      // newPersons keeps ONLY persons who ever hold an arrow (holder
      // identity + first-roster-day + fullPool is the verdict's
      // evidence; the other ~105 roster records are dropped).
      // classifySeed() reads arrival from holderDetail (see below).
      const ao = clean.arroworigin;
      const holderVids = {};
      for (const r of (ao.dailyRows || [])) for (const h of (r.holders || [])) holderVids[h.vid] = true;
      const slimRows = (ao.dailyRows || []).map(r => ({
        day: r.day, rosterN: r.rosterN,
        totalCarried: r.totalCarried, totalStashed: r.totalStashed, total: r.total,
        holders: (r.holders || []).map(h => ({ vid: h.vid, name: h.name, carried: h.carried, stashed: h.stashed })),
        scholarArrow: r.scholarArrow,
      }));
      const firstArrowRow = (ao.dailyRows || []).find(r => (r.total | 0) > 0) || null;
      const lastRow = (ao.dailyRows || []).length ? ao.dailyRows[ao.dailyRows.length - 1] : null;
      const holderDetail = firstArrowRow && firstArrowRow.holders && firstArrowRow.holders[0] ? Object.assign({ day: firstArrowRow.day }, firstArrowRow.holders[0]) : null;
      const holderLast = lastRow && lastRow.holders && lastRow.holders[0] ? Object.assign({ day: lastRow.day }, lastRow.holders[0]) : null;
      clean.arroworigin = {
        dailyRows: slimRows,
        changeEvents: ao.changeEvents,
        newPersons: (ao.newPersons || []).filter(n => holderVids[n.vid]),
        diag: ao.diag,
        compact: 2,
        holderDetail: holderDetail,
        holderLast: holderLast,
        scholarFirstFullPool: (ao.dailyRows || []).length ? ao.dailyRows[0].scholarFullPool || null : null,
      };
    }
    console.log('ROWJSON ' + JSON.stringify(clean));
  }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.ARROWORIGIN;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const arrowStore = newArrowStore();
  const wrapped = withArrowOriginDiag(tableseatNowait, 'arroworigin-diag', 'tableseat-nowait + per-person arrow-arrival trace', arrowStore);
  const { Game } = await loadGame({ seed, mode: 'arroworigin-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && capturedCtx._arroworigin);
  const wrapsInstalled = !!Game._arrowOriginDiagInstalled;
  const ok = c.days === result.days && c.gameDays === result.gameDays
    && JSON.stringify(ts) === JSON.stringify(c.ts) && !hasDiagSurface && !wrapsInstalled;
  console.log(`DETGATE seed=${seed} baseline days=${c.days} gameDays=${c.gameDays} ts=${JSON.stringify(c.ts)} | wrapped(recorders OFF) days=${result.days} gameDays=${result.gameDays} ts=${JSON.stringify(ts)} diagSurface=${hasDiagSurface} wrapsInstalled=${wrapsInstalled} -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) process.exit(1);
}

async function detailMode(seedArg) {
  const seed = parseInt(process.env.DETAIL_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  let census = null;
  try { census = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-armed.json`), 'utf8')); } catch (e) { census = null; }
  const row = await runOne('armed', seed, days, null);
  const a = classifySeed(row);
  const same = !!census && census.days === row.days && census.gameDays === row.gameDays
    && JSON.stringify(census.ts) === JSON.stringify(row.ts)
    && classifySeed(census).firstArrowDay === a.firstArrowDay
    && classifySeed(census).maxTotal === a.maxTotal;
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} firstArrowDay=${a.firstArrowDay} maxTotal=${a.maxTotal} holders=${JSON.stringify(a.holderVids)}`);
  if (a.arrival) console.log(`DETAIL arrival: ${JSON.stringify(a.arrival)}`);
  console.log('DETAIL change events:');
  for (const ev of a.changeEventsList) console.log(`DETAIL change d${ev.day} ${ev.name} (${ev.vid}) ${ev.prevCarried}/${ev.prevStashed} -> ${ev.curCarried}/${ev.curStashed} prevItems=${JSON.stringify(ev.prevItems)} prevStashed=${JSON.stringify(ev.prevStashedList)} curItems=${JSON.stringify(ev.curItems)} curStashed=${JSON.stringify(ev.curStashedList)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || 'stdout';
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.ARROWORIGIN = '1';
  const arrowStore = newArrowStore();
  const armed = withArrowOriginDiag(tableseatNowait, 'arroworigin-diag', 'tableseat-nowait + per-person arrow-arrival trace', arrowStore);
  const { Game } = await loadGame({ seed, mode: 'arroworigin-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  const arrowLines = ring.filter(s => /arrow|quiver|bow|nock|loose/i.test(s.text || ''));
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+arroworigin-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    `arrowLines=${arrowLines.length}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  if (out === 'stdout') {
    process.stdout.write(body);
  } else {
    // Sense runs in-process after loadGame, so it cannot write either:
    // same writer-child rule as the sweep (see writeViaChild).
    writeViaChild(out, body, null, null);
  }
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} arrowLines=${arrowLines.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--detail')) return detailMode(args[args.indexOf('--detail') + 1]);
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('ARROWORIGIN-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifySeed, bandOf, BAND1920, SEEDS };
