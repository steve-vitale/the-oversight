#!/usr/bin/env node
// scripts/test-volley-diag-sweep.js — sim-volley-a sweep
// (scale-onramp axis, 2026-10-26, arm sim-volley-a. DIAG /
// MEASUREMENT ONLY, zero src/js changes.)
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
// seeds 73671-73678, 180d death-aware horizon. One process per seed
// (default mode spawns --one children; every row is written
// incrementally into the worktree evidence dir, NEVER /tmp).
//
// Baseline: plain tableseat-nowait, post-run pure-read snapshot.
// Armed: tableseat-nowait wrapped with two observational recorders
// (innermost first): volley-diag (NEW: per-field-fight volley-gate /
// party-potential / intentWhy) and w4dmg-diag (verbatim reuse, field +
// tbEnd rows — cross-check only). All record after delegating, draw
// no RNG, never throw into the engine.
//
// Modes: --one <pid> <seed> | (default sweep) | --summary |
// --detgate | --detail <seed> | --sense <seed>. See the evidence
// pre-registration in evidence/2026-10-26/sim-volley-a.md for the
// gate taxonomy, party conditions, and DIAG-GO bar.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { copyKillLog } = require('./policies/vetkill-diag');
const {
  newStore: newVolleyStore, installVolleyDiag, withVolleyDiag,
} = require('./policies/volley-diag');
const {
  newStore: newW4dmgStore, installW4dmgDiag, withW4dmgDiag,
} = require('./policies/w4dmg-diag');
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
function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-volley-a'); }
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
  let volleyStore = null, w4dmgStore = null;
  let base = tableseatNowait;
  if (pid === 'armed') {
    process.env.VOLLEYDIAG = '1'; process.env.W4DMG = '1';
    volleyStore = newVolleyStore(); w4dmgStore = newW4dmgStore();
    base = withW4dmgDiag(
      withVolleyDiag(tableseatNowait, 'volley-diag', 'tableseat-nowait + volley/party/intent recorder', volleyStore),
      'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore);
  } else {
    delete process.env.VOLLEYDIAG; delete process.env.W4DMG;
  }
  const { Game } = await loadGame({ seed, mode: 'volley-diag-' + pid, fullTelemetry: false });
  await setupGame(Game);
  if (pid === 'armed') {
    try { installVolleyDiag(Game, volleyStore); } catch (e) {}
    try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
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
    row.volley = {
      fieldFights: volleyStore.fieldFights, noRecord: volleyStore.noRecord,
      diag: { errs: volleyStore.errs, errors: volleyStore.errors, overflow: volleyStore.overflow, installed: volleyStore.installed },
    };
    row.w4dmg = {
      fieldFights: w4dmgStore.fieldFights, tbEnds: w4dmgStore.tbEnds,
      diag: { errs: w4dmgStore.errs, errors: w4dmgStore.errors, overflow: w4dmgStore.overflow, installed: w4dmgStore.installed },
    };
  } else {
    row.note = 'snapshot-only: no event lists on the baseline arm';
  }
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    writeFileRetry(fn, JSON.stringify(row, null, 1) + '\n');
    row.corpusFile = fn;
  }
  return row;
}

function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}
function classifySeed(row) {
  const v = row.volley.fieldFights || [];
  const w = row.w4dmg.fieldFights || [];
  const v4 = v.filter(f => (f.wave | 0) === 4);
  const w4 = w.filter(f => (f.wave | 0) === 4);
  // Party failure classes (per fight; mutually exclusive, in order):
  // solo-potential (optsAllies 0) | called (calledHelp) |
  // potential-learn-blocked (opts>0, no call, everHopeless, final learn) |
  // potential-hopeless-engage-nocall (opts>0, no call, everHopeless, engage) |
  // potential-never-hopeless (opts>0, no call, !everHopeless).
  const partyClass = (f) => {
    if ((f.optsAllies | 0) === 0) return 'solo-potential';
    if (f.calledHelp) return 'called';
    if (f.everHopeless && f.intent === 'learn') return 'potential-learn-blocked';
    if (f.everHopeless && f.intent !== 'learn') return 'potential-hopeless-engage-nocall';
    return 'potential-never-hopeless';
  };
  const diagErrs = (row.volley.diag.errs | 0) + (row.w4dmg.diag.errs | 0);
  const overflowN = (row.volley.diag.overflow.fieldFights | 0) + (row.w4dmg.diag.overflow.fieldFights | 0) + (row.w4dmg.diag.overflow.tbEnds | 0);
  const checks = {
    fieldCountMatch: v.length === w.length,
    wave4CountMatch: v4.length === w4.length,
    gateComplete: v.every(f => !!f.gate),
    diagClean: diagErrs === 0 && overflowN === 0 && (row.volley.noRecord | 0) === 0,
  };
  checks.all = checks.fieldCountMatch && checks.wave4CountMatch && checks.gateComplete && checks.diagClean;
  return {
    seed: row.seed,
    fieldAll: v.length, field4: v4.length, w4dmgFieldAll: w.length, w4dmgField4: w4.length,
    checks: checks, diagErrs: diagErrs, overflowN: overflowN, noRecord: row.volley.noRecord | 0,
    gatesAll: counter(v, f => f.gate), gates4: counter(v4, f => f.gate),
    intentAll: counter(v, f => f.intent), intentWhyAll: counter(v, f => f.intentWhy),
    intent4: counter(v4, f => f.intent), intentWhy4: counter(v4, f => f.intentWhy),
    partyAll: counter(v, partyClass), party4: counter(v4, partyClass),
    optsAlliesAll: counter(v, f => String(f.optsAllies)), optsAllies4: counter(v4, f => String(f.optsAllies)),
    allyDealtAll: v.reduce((t, f) => t + (f.allyDealt | 0), 0), allyDealt4: v4.reduce((t, f) => t + (f.allyDealt | 0), 0),
    volleyDmgAll: v.reduce((t, f) => t + (f.volleyDmg | 0), 0), volleyDmg4: v4.reduce((t, f) => t + (f.volleyDmg | 0), 0),
    volleyShotsAll: counter(v, f => (f.volleyShots == null ? 'null' : String(f.volleyShots))),
    volleyShots4: counter(v4, f => (f.volleyShots == null ? 'null' : String(f.volleyShots))),
    trickKnown4: counter(v4, f => String(f.trickKnown)),
    crewSize4: v4.map(f => f.crewSize), vfa4: v4.map(f => f.vfaCount),
    fieldRows4: v4, fieldRowsAll: v,
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
    const facedOk = !!c && !!a && JSON.stringify(c.faced) === JSON.stringify(a.faced);
    const killsOk = !!c && !!a && JSON.stringify((c.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via])) === JSON.stringify((a.logEntries || []).map(e => [e.d, e.mid, e.w, e.by, e.via]));
    g2.push({ seed, ok, facedOk, killsOk, cDays: c ? c.days : null, aDays: a ? a.days : null, cGameDays: c ? c.gameDays : null, aGameDays: a ? a.gameDays : null });
  }
  const g2Pass = g2.every(x => x.ok);
  const corpusOk = rows.length === SEEDS.length * 2 && rows.every(r => r.days > 0 && r.faced && r.logEntries)
    && rows.filter(r => r.policy === 'armed').every(r => Array.isArray(r.volley.fieldFights) && Array.isArray(r.w4dmg.fieldFights));
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
  const fullyDecomposedSeeds = perSeed.filter(p => p.checks.all).length;
  const bandGatesAll = mergeCounters(perSeed.map(p => p.gatesAll));
  const bandGates4 = mergeCounters(perSeed.map(p => p.gates4));
  const bandIntentAll = mergeCounters(perSeed.map(p => p.intentAll));
  const bandIntentWhyAll = mergeCounters(perSeed.map(p => p.intentWhyAll));
  const bandIntent4 = mergeCounters(perSeed.map(p => p.intent4));
  const bandIntentWhy4 = mergeCounters(perSeed.map(p => p.intentWhy4));
  const bandPartyAll = mergeCounters(perSeed.map(p => p.partyAll));
  const bandParty4 = mergeCounters(perSeed.map(p => p.party4));
  const bandOptsAll = mergeCounters(perSeed.map(p => p.optsAlliesAll));
  const bandOpts4 = mergeCounters(perSeed.map(p => p.optsAllies4));
  const allField = perSeed.flatMap(p => p.fieldRowsAll);
  const allField4 = perSeed.flatMap(p => p.fieldRows4);
  const verdict = (fullyDecomposedSeeds >= 6 && bandIntent4.learn != null) ? 'DIAG-GO' : 'DIAG-NO-GO';
  // DIAG-GO rule, stated exactly: gate table complete (every fight gated,
  // cross-checks pass on >= 6 seeds) AND party conditions enumerated
  // AND intent distribution reproduced (wave-4 learn/engage vs w4dmg
  // 10/2). The verdict above is a placeholder guard; the evidence
  // judges the full bar, including the reproduction check below.
  const intentRepro = (bandIntent4.learn === 10 && bandIntent4.engage === 2);
  const verdictFull = (fullyDecomposedSeeds >= 6 && intentRepro) ? 'DIAG-GO' : 'DIAG-NO-GO';
  void verdict;
  const report = {
    label: 'sim-volley-a', seeds: SEEDS, days: 180, perSeed: perSeed,
    gates: { g2RecorderNeutrality: g2, g2Pass: g2Pass, corpusOk: corpusOk, rebaselineExact: rebaselineExact, diffVs1920: diff1920, costBar: costBar },
    baselineBand: baselineBand, armedBand: armedBand, band1920: BAND1920,
    bandGatesAll: bandGatesAll, bandGates4: bandGates4,
    bandIntentAll: bandIntentAll, bandIntentWhyAll: bandIntentWhyAll,
    bandIntent4: bandIntent4, bandIntentWhy4: bandIntentWhy4,
    bandPartyAll: bandPartyAll, bandParty4: bandParty4,
    bandOptsAlliesAll: bandOptsAll, bandOptsAllies4: bandOpts4,
    fieldAll: allField.length, field4: allField4.length,
    volleyDmgAll: allField.reduce((t, f) => t + (f.volleyDmg | 0), 0),
    volleyDmg4: allField4.reduce((t, f) => t + (f.volleyDmg | 0), 0),
    allyDmgAll: allField.reduce((t, f) => t + (f.allyDealt | 0), 0),
    allyDmg4: allField4.reduce((t, f) => t + (f.allyDealt | 0), 0),
    intentRepro: intentRepro, intentReproExpect: { learn: 10, engage: 2 },
    fullyDecomposedSeeds: fullyDecomposedSeeds,
    verdict: verdictFull,
    verdictRule: 'DIAG-GO iff gate table complete with per-condition block counts over all field fights AND the wave-4 subset, AND party-formation conditions enumerated with counts, AND opening-move distribution reproduced (wave-4 final intent 10 learn / 2 engage, as in w4dmg) with learn-first trigger conditions, on >= 6 fully-decomposed seeds.',
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-volley-a ===');
  console.log(`  baseline: n=${baselineBand.n} won=${baselineBand.won} medD=${baselineBand.medianDays} natEver=${baselineBand.nationalEver} natFinal=${baselineBand.nationalFinal} table=${baselineBand.table} entered=${baselineBand.entered} wave4=${baselineBand.wave4} wave5=${baselineBand.wave5} starv=${baselineBand.starvationTotal} deaths=${baselineBand.deathTotal}`);
  console.log(`  armed:    n=${armedBand.n} won=${armedBand.won} medD=${armedBand.medianDays} natEver=${armedBand.nationalEver} natFinal=${armedBand.nationalFinal} table=${armedBand.table} entered=${armedBand.entered} wave4=${armedBand.wave4} wave5=${armedBand.wave5} starv=${armedBand.starvationTotal} deaths=${armedBand.deathTotal}`);
  console.log(`  rebaseline vs 1920Z: ${rebaselineExact ? 'EXACT' : 'DIFF ' + JSON.stringify(diff1920)}`);
  console.log(`  G2 recorder neutrality: ${g2Pass ? 'PASS' : 'FAIL'} (${g2.filter(x => x.ok).length}/${g2.length}; faced ${g2.filter(x => x.facedOk).length}/${g2.length}, kills ${g2.filter(x => x.killsOk).length}/${g2.length})`);
  console.log(`  corpus: ${corpusOk ? 'PASS' : 'FAIL'}; costBar starvationOk=${costBar.starvationOk} medianOk=${costBar.medianOk}`);
  for (const p of perSeed) {
    console.log(`  seed ${p.seed}: fieldAll=${p.fieldAll} field4=${p.field4} fullyDecomposed=${p.checks.all} gates4=${JSON.stringify(p.gates4)} intent4=${JSON.stringify(p.intent4)} party4=${JSON.stringify(p.party4)}`);
  }
  console.log(`  band gates ALL (${allField.length}): ${JSON.stringify(bandGatesAll)}`);
  console.log(`  band gates W4 (${allField4.length}): ${JSON.stringify(bandGates4)}`);
  console.log(`  band intent ALL: ${JSON.stringify(bandIntentAll)} why: ${JSON.stringify(bandIntentWhyAll)}`);
  console.log(`  band intent W4: ${JSON.stringify(bandIntent4)} why: ${JSON.stringify(bandIntentWhy4)} repro10/2=${intentRepro}`);
  console.log(`  band party ALL: ${JSON.stringify(bandPartyAll)}`);
  console.log(`  band party W4: ${JSON.stringify(bandParty4)}`);
  console.log(`  band optsAllies ALL: ${JSON.stringify(bandOptsAll)} W4: ${JSON.stringify(bandOpts4)}`);
  console.log(`  fullyDecomposed seeds: ${fullyDecomposedSeeds}/8 -> VERDICT ${verdictFull}`);
  console.log(`  -> ${summaryPath}`);
  if (!g2Pass || !corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function sweepMode() {
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const pids = (process.env.PIDS || 'baseline,armed').split(',').map(s => s.trim()).filter(Boolean);
  for (const pid of pids) {
    for (const seed of SEEDS) {
      console.log(`--- ${pid} seed ${seed} ---`);
      const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-volley-diag-sweep.js'), '--one', pid, String(seed)],
        { cwd: REPO, encoding: 'utf8', timeout: 1200000, env: Object.assign({}, process.env, { EVID: evidDir }) });
      process.stdout.write(out);
    }
  }
  await summaryMode();
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  let line = `days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal}`;
  if (pid === 'armed') {
    const c = classifySeed(row);
    line += ` fieldAll=${c.fieldAll} field4=${c.field4} fullyDecomposed=${c.checks.all} diagErrs=${c.diagErrs} noRecord=${c.noRecord}`;
  }
  console.log(`  [${pid} seed ${seed}] ${line}`);
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const c = await runOne('baseline', seed, days, null);
  delete process.env.VOLLEYDIAG; delete process.env.W4DMG;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const volleyStore = newVolleyStore(), w4dmgStore = newW4dmgStore();
  const wrapped = withW4dmgDiag(
    withVolleyDiag(tableseatNowait, 'volley-diag', 'tableseat-nowait + volley/party/intent recorder', volleyStore),
    'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore);
  const { Game } = await loadGame({ seed, mode: 'volley-diag-detgate', fullTelemetry: false });
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
  const hasDiagSurface = !!(capturedCtx && (capturedCtx._volley || capturedCtx._w4dmg));
  const wrapsInstalled = !!Game._volleyDiagInstalled || !!Game._w4dmgDiagInstalled;
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
    && classifySeed(census).field4 === a.field4
    && classifySeed(census).fieldAll === a.fieldAll
    && JSON.stringify(classifySeed(census).gates4) === JSON.stringify(a.gates4);
  console.log(`DETAIL-REPRO seed=${seed} days=${row.days} gameDays=${row.gameDays} censusMatch=${same} fieldAll=${a.fieldAll} field4=${a.field4} gates4=${JSON.stringify(a.gates4)}`);
  if (!same) { console.error('DETAIL REPRODUCTION FAILURE'); process.exit(1); }
  console.log('DETAIL wave-4 volley rows:');
  for (const r of a.fieldRows4) console.log(`DETAIL w4 d${r.day} ${r.mid} vid=${r.vid} gate=${r.gate} preRanged=${r.preRanged} postRanged=${r.postRanged} postAmmo=${r.postAmmoId} preAmmoN=${r.preAmmoN} volleyShots=${r.volleyShots} intent=${r.intent} why=${r.intentWhy} trick=${r.trickKnown} optsAllies=${r.optsAllies} called=${r.calledHelp} allyDealt=${r.allyDealt} everHopeless=${r.everHopeless} out=${r.outcome} carriedRanged=${JSON.stringify(r.carriedRanged)}`);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-26', 'sim-volley-a-sense.txt');
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  process.env.VOLLEYDIAG = '1'; process.env.W4DMG = '1';
  const volleyStore = newVolleyStore(), w4dmgStore = newW4dmgStore();
  const armed = withW4dmgDiag(
    withVolleyDiag(tableseatNowait, 'volley-diag', 'tableseat-nowait + volley/party/intent recorder', volleyStore),
    'w4dmg-diag', 'tableseat-nowait + wave-4 damage decomposition recorder', w4dmgStore);
  const { Game } = await loadGame({ seed, mode: 'volley-diag-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  try { installVolleyDiag(Game, volleyStore); } catch (e) {}
  try { installW4dmgDiag(Game, w4dmgStore); } catch (e) {}
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let dmgLine = 'volley: unavailable';
  try {
    const field4 = volleyStore.fieldFights.filter(f => (f.wave | 0) === 4);
    const byG = {};
    for (const f of field4) byG[f.gate || 'null'] = (byG[f.gate || 'null'] || 0) + 1;
    dmgLine = `volley (SENSE-ONLY, non-measured): field4=${field4.length} byGate=${JSON.stringify(byG)} volleyDmg=${field4.reduce((t, f) => t + (f.volleyDmg | 0), 0)}`;
  } catch (e) { dmgLine = 'volley error: ' + String((e && e.message) || e).slice(0, 160); }
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=tableseat-nowait+volley-diag days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone}`,
    dmgLine,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  if (out === 'stdout') {
    process.stdout.write(body);
  } else {
    writeFileRetry(out, body);
  }
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
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
if (require.main === module) main().catch(e => { console.error('VOLLEY-DIAG SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, classifySeed, bandOf, BAND1920, SEEDS };
