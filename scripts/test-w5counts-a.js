#!/usr/bin/env node
// scripts/test-w5counts-a.js — sim-w5counts-a DIAG/INSTRUMENTATION arm
// (scale-onramp axis, 2026-10-29, run fleshout-20261029T2115Z,
// backlog #1453). Follow-up to sim-w5ready-a: that arm proved the
// wave-5 wall at BAR level (rd5short names only) and left exact
// counts unmeasured. THIS arm records the exact counts per snapshot
// plus standing peak splits, so the next arm can design a stack
// pursuit variant from counts instead of intervals.
//
// MEASUREMENT ONLY: zero src/js changes, zero default flips, zero
// deed-bar moves, zero pursuit-variant design. The ON policy is the
// EXISTING fullseat-pursuit policy (restored from git history for
// the sweep run only, then deleted again per the NO-GO rule —
// this script FAILS LOUDLY if it is missing instead of silently
// substituting a different policy).
//
// Modes:
//   default (sweep): SEEDS (default 76001-76008), DAYS=180 (default),
//     EVID=evidence/2026-10-29/perseed-w5counts-a (default). Per-config
//     INCREMENTAL corpus writes (fullseat precedent). Exit 0 on a
//     completed sweep regardless of GO/NO-GO (the verdict is data);
//     exit 1 on proof-gate failure (G0 must pass first — see below).
//   --detgate (G0 neutrality): one OFF seed bare vs +w5counts
//     recorder; requires days, gameDays, starvation deaths, and
//     final samples identical. Exit 1 on mismatch. RUN THIS BEFORE
//     THE SWEEP; a failed G0 invalidates the sweep.
//   --analyze [--corpus DIR] [--out PATH]: the JUDGED leg. Loads
//     the corpus, verifies the demand citation from standing.js,
//     recomputes max/peak/days-ready from the daily traces (+ final
//     snap for END), runs the prereg cross-checks, judges GO/NO-GO
//     exactly as preregistered, and writes the analysis JSON.
//     Exit 1 on NO-GO (a failed judged leg must not look green).
//   --sense SEED: NON-MEASURED narration replay (narration shifts
//     trajectories, so it never enters the census): ON policy on one
//     seed with the say ring, written to
//     evidence/2026-10-29/sim-w5counts-a-sense.txt (SENSE_OUT env).
//
// Prereg: evidence/2026-10-29/sim-w5counts-a-prereg.md — COMMITTED
// BEFORE the judged analyzer leg (and before the sweep itself).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');
const { withFullseatDiag, snapFullSeat } = require('./policies/fullseat-diag');
const { withW5countsDiag, snapW5counts } = require('./policies/w5counts-diag');
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

// Build the wrapped policy for one arm. THROWS if the ON policy file
// is absent (loud failure, never a silent substitution).
function buildPolicy(pid) {
  let inner;
  if (pid === 'on') {
    const p = path.join(REPO, 'scripts', 'policies', 'fullseat-pursuit.js');
    if (!fs.existsSync(p)) {
      throw new Error('fullseat-pursuit.js missing — restore it from git history first: '
        + 'git show 5a9f7579e:scripts/policies/fullseat-pursuit.js > scripts/policies/fullseat-pursuit.js '
        + '(delete it again before the final commit; it is never committed by this arm)');
    }
    inner = require('./policies/fullseat-pursuit').fullseatPursuit;
  } else {
    inner = tableseatNowait;
  }
  const withFS = withFullseatDiag(inner, 'fullseat-diag', 'tableseat substrate + full-seat recorder');
  return withW5countsDiag(withFS, 'w5counts-diag', 'w5counts recorder');
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEAT = '1';
  process.env.W5COUNTS = '1';
  if (pid === 'on') process.env.FULLSEATPURSUIT = '1';
  else delete process.env.FULLSEATPURSUIT;
  const base = buildPolicy(pid);
  const { Game } = await loadGame({ seed, mode: 'w5counts-a-' + pid, fullTelemetry: false });
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
  let endSnap = null;
  try { endSnap = snapFullSeat(Game); } catch (e) { endSnap = { error: String((e && e.message) || e).slice(0, 120) }; }
  let endW5 = null;
  try { endW5 = snapW5counts(Game); } catch (e) { endW5 = { error: String((e && e.message) || e).slice(0, 120) }; }
  let diag = null;
  if (capturedCtx && capturedCtx._fullseatdiag) {
    const D = capturedCtx._fullseatdiag;
    diag = {
      days: D.days, errs: D.errs, max: D.max,
      bestSeat: D.bestSeat, firstFullSeatDay: D.firstFullSeatDay,
      firstLesserDay: D.firstLesserDay == null ? null : D.firstLesserDay,
      indispEver: !!D.indispEver, firstIndispDay: D.firstIndispDay,
      winDay: D.winDay, seats: D.seats,
      sentDay: D.sentDay == null ? null : D.sentDay,
      surgeDay: D.surgeDay == null ? null : D.surgeDay,
    };
    if (D.max) {
      const BARS = { w1: 5, w2: 5, w3: 4, w4: 3, w5: 2, contests: 3, crises: 3, stage: 2 };
      const md = {};
      for (const k of ['w1', 'w2', 'w3', 'w4', 'w5', 'contests', 'crises', 'stage']) md[k] = Math.max(0, BARS[k] - (D.max[k] | 0));
      md.foodDeeds = (D.sentDay != null && D.surgeDay != null) ? 0 : 1;
      diag.maxDist = md;
    }
  }
  let w5counts = null;
  if (capturedCtx && capturedCtx._w5counts) {
    const W = capturedCtx._w5counts;
    w5counts = { days: W.days, errs: W.errs, trace: W.trace, max: W.max, peakStanding: W.peakStanding, firstMet: W.firstMet, end: endW5 };
  } else {
    w5counts = { days: 0, errs: null, trace: [], max: null, peakStanding: null, firstMet: null, end: endW5 };
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
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    endSnapFull: endSnap,
    diag, w5counts,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}-${pid}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '76001,76002,76003,76004,76005,76006,76007,76008')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-w5counts-a');
  fs.mkdirSync(evidDir, { recursive: true });
  // Fail loudly BEFORE any spend if the ON policy is absent.
  buildPolicy('on');
  const rows = [];
  for (const pid of ['off', 'on']) {
    for (const seed of seeds) {
      const row = await runOne(pid, seed, days, evidDir);
      rows.push(row);
      const e = row.w5counts && row.w5counts.end;
      console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} natEver=${row.nationalEver} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} traceDays=${row.w5counts ? row.w5counts.days : '?'} endCounts=${e ? `arm${e.armored}/wpn${e.armed}/trk${e.tricks}/vet${e.veterans}` : '?'} endGated=${e ? e.gated : '?'} hold=${e ? e.holdKind : '?'} peakGated=${row.w5counts && row.w5counts.peakStanding ? row.w5counts.peakStanding.gated : '?'}`);
    }
  }
  const g3Pass = rows.length === seeds.length * 2 && rows.every(r => r.days > 0 && r.w5counts && r.w5counts.trace && r.w5counts.trace.length > 0 && r.w5counts.end && r.endSnapFull && r.endSnapFull.unlock);
  console.log(`\n=== sim-w5counts-a sweep === rows=${rows.length} G3(corpus integrity)=${g3Pass ? 'PASS' : 'FAIL'}`);
  if (!g3Pass) { console.error('PROOF GATE FAILURE'); process.exit(1); }
  console.log('  NOTE: run --analyze to judge GO/NO-GO against the prereg.');
}

async function runBare(base, envSetup, seed, days) {
  envSetup();
  const { Game } = await loadGame({ seed, mode: 'w5counts-a-detgate', fullTelemetry: false });
  await setupGame(Game);
  const result = await runDays(Game, base, { days, manifest: undefined, sampleEvery: 10 });
  const deaths = result.samples.deaths || [];
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  return {
    days: result.days, gameDays: result.gameDays, starvationDeaths: starv.length,
    deathTotal: deaths.length, finalPop: last(result.samples.pop),
    finalPantry: last(result.samples.pantry), finalKnown: last(result.samples.knowledge),
  };
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '76001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const bare = await runBare(tableseatNowait, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    delete process.env.FULLSEAT; delete process.env.FULLSEATPURSUIT; delete process.env.W5COUNTS;
  }, seed, days);
  const wrapped = withW5countsDiag(tableseatNowait, 'w5counts-diag', 'tableseat-nowait + w5counts recorder');
  const rec = await runBare(wrapped, () => {
    process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
    process.env.W5COUNTS = '1'; delete process.env.FULLSEAT; delete process.env.FULLSEATPURSUIT;
  }, seed, days);
  const pass = bare.days === rec.days && bare.gameDays === rec.gameDays
    && bare.starvationDeaths === rec.starvationDeaths && bare.deathTotal === rec.deathTotal
    && bare.finalPop === rec.finalPop && bare.finalPantry === rec.finalPantry && bare.finalKnown === rec.finalKnown;
  console.log(`G0 w5counts neutrality seed=${seed}: bare days=${bare.days} gameDays=${bare.gameDays} starv=${bare.starvationDeaths} deaths=${bare.deathTotal} pop=${bare.finalPop} pantry=${bare.finalPantry} known=${bare.finalKnown}`);
  console.log(`G0 w5counts neutrality seed=${seed}: +rec days=${rec.days} gameDays=${rec.gameDays} starv=${rec.starvationDeaths} deaths=${rec.deathTotal} pop=${rec.finalPop} pantry=${rec.finalPantry} known=${rec.finalKnown} -> ${pass ? 'PASS' : 'FAIL'}`);
  if (!pass) process.exit(1);
}

function analyzeMode() {
  const args = process.argv.slice(2);
  let corpusDir = path.join(REPO, 'evidence', '2026-10-29', 'perseed-w5counts-a');
  let outPath = path.join(REPO, 'evidence', '2026-10-29', 'w5counts-a-analysis.json');
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--corpus') corpusDir = args[++i];
    if (args[i] === '--out') outPath = args[++i];
  }
  const fail = (msg) => { console.error('FAIL: ' + msg); process.exit(1); };
  // Leg 6: demand citation read from standing.js itself.
  const standingSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8');
  const demMatch = standingSrc.match(/5:\s*\{\s*armored:\s*(\d+),\s*armorP:\s*(\d+),\s*armed:\s*(\d+),\s*tricks:\s*(\d+),\s*veterans:\s*(\d+)\s*\}/);
  if (!demMatch) fail('readyDemand[5] not found in src/js/standing.js — citation broken');
  const DEMAND = { armored: +demMatch[1], armorP: +demMatch[2], armed: +demMatch[3], tricks: +demMatch[4], veterans: +demMatch[5] };
  if (DEMAND.armored !== 4 || DEMAND.armorP !== 15 || DEMAND.armed !== 6 || DEMAND.tricks !== 3 || DEMAND.veterans !== 2) {
    fail('readyDemand[5] mismatch vs prereg/MONSTER-WAVES.md: ' + JSON.stringify(DEMAND));
  }
  const rows = [];
  for (const f of fs.readdirSync(corpusDir).sort()) {
    if (!f.endsWith('.json') || f === 'summary.json') continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')));
  }
  rows.sort((a, b) => (a.seed - b.seed) || (a.policy < b.policy ? -1 : 1));
  if (rows.length !== 16) fail(`expected 16 corpus rows, found ${rows.length} — INSUFFICIENT-DATA`);
  // Fullseat holdKind mapping (prereg): my defer5<->defer5, cap<->cap,
  // defer4/floor/below-bar <-> below-bar, released<->released.
  const holdMapOk = (mine, theirs) => {
    if (mine === 'defer5' || mine === 'cap') return mine === theirs;
    if (mine === 'released') return theirs === 'released';
    return theirs === 'below-bar';
  };
  const analyzed = [];
  const failures = [];
  for (const r of rows) {
    const id = `${r.seed}-${r.policy}`;
    const W = r.w5counts;
    if (!W || !Array.isArray(W.trace) || W.trace.length === 0 || !W.end) { failures.push(id + ': missing trace/end block'); continue; }
    const e = W.end;
    const u = (r.endSnapFull && r.endSnapFull.unlock) || null;
    if (!u) { failures.push(id + ': missing endSnapFull.unlock'); continue; }
    // Leg 1: counts present as integers at END.
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) {
      if (!Number.isInteger(e[k])) failures.push(`${id}: end ${k} not an integer (${JSON.stringify(e[k])})`);
    }
    if (!e.demand || e.demand.armored !== 4 || e.demand.armorP !== 15 || e.demand.armed !== 6 || e.demand.tricks !== 3 || e.demand.veterans !== 2) {
      failures.push(`${id}: end demand mismatch (${JSON.stringify(e.demand)})`);
    }
    // Recompute from the trace (+ final snap for END-side maxima).
    const trace = W.trace;
    const maxFromTrace = {};
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) maxFromTrace[k] = Math.max.apply(null, trace.map(s => (s[k] | 0)).concat([0]));
    const peakFromTrace = trace.reduce((best, s) => (s.gated != null && (best == null || s.gated > best.gated)) ? s : best, null);
    const recomputedMax = {};
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) recomputedMax[k] = Math.max(maxFromTrace[k], (e[k] | 0));
    const recomputedPeakGated = Math.max(peakFromTrace ? peakFromTrace.gated : 0, (e.gated | 0));
    // Leg 4: recomputed trace-max == recorder max.
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) {
      if ((W.max[k] | 0) !== maxFromTrace[k]) failures.push(`${id}: recorder max ${k}=${W.max[k]} != trace max ${maxFromTrace[k]}`);
    }
    if (W.peakStanding && peakFromTrace && W.peakStanding.gated !== peakFromTrace.gated) {
      failures.push(`${id}: recorder peakStanding.gated=${W.peakStanding.gated} != trace peak ${peakFromTrace.gated}`);
    }
    // Peak split: the recorder's peakStanding must carry the split of
    // the peak day (recomputed from the trace's peak snapshot).
    let peakSplit = null;
    if (peakFromTrace) {
      peakSplit = { gated: peakFromTrace.gated, day: peakFromTrace.day, war: peakFromTrace.war, diplomacy: peakFromTrace.diplomacy, plenty: peakFromTrace.plenty, raw: peakFromTrace.raw, capped: peakFromTrace.capped, holdKind: peakFromTrace.holdKind };
      if (W.peakStanding && (W.peakStanding.war !== peakSplit.war || W.peakStanding.diplomacy !== peakSplit.diplomacy || W.peakStanding.plenty !== peakSplit.plenty || W.peakStanding.raw !== peakSplit.raw || W.peakStanding.capped !== peakSplit.capped)) {
        failures.push(`${id}: recorder peak split != trace peak split`);
      }
    }
    // Leg 3: killer identities — end equality + 100% daily equality.
    const endKillers = Array.isArray(e.killers) ? e.killers : null;
    if (!endKillers) { failures.push(`${id}: end killers list missing`); }
    else {
      const livingEnd = endKillers.filter(k => k.living).length;
      if (livingEnd !== (e.veterans | 0)) failures.push(`${id}: end living killers ${livingEnd} != gate veterans ${e.veterans}`);
      if ((e.livingKillers | 0) !== livingEnd) failures.push(`${id}: end livingKillers field ${e.livingKillers} != living list ${livingEnd}`);
      for (const k of endKillers) if (typeof k.living !== 'boolean' || !k.by) failures.push(`${id}: killer entry missing living/by (${JSON.stringify(k).slice(0, 80)})`);
    }
    let dailyMismatch = 0;
    for (const s of trace) {
      const lk = Array.isArray(s.killers) ? s.killers.filter(k => k.living).length : null;
      if (lk == null || lk !== (s.veterans | 0) || (s.livingKillers | 0) !== lk) dailyMismatch++;
    }
    if (dailyMismatch) failures.push(`${id}: daily living-vs-gate mismatches=${dailyMismatch}/${trace.length}`);
    // Leg 5: cross-checks vs the fullseat unlock block.
    if ((e.gated | 0) !== (u.standing | 0)) failures.push(`${id}: end gated ${e.gated} != unlock.standing ${u.standing}`);
    if ((e.raw | 0) !== (u.raw | 0) || (e.war | 0) !== (u.war | 0) || (e.diplomacy | 0) !== (u.diplomacy | 0) || (e.plenty | 0) !== (u.plenty | 0) || (e.capped | 0) !== (u.capped | 0)) {
      failures.push(`${id}: end standing split != unlock split (w5counts ${e.raw}/${e.war}/${e.diplomacy}/${e.plenty}/${e.capped} vs unlock ${u.raw}/${u.war}/${u.diplomacy}/${u.plenty}/${u.capped})`);
    }
    if (!holdMapOk(e.holdKind, u.holdKind)) failures.push(`${id}: end holdKind ${e.holdKind} !~ unlock.holdKind ${u.holdKind}`);
    if (JSON.stringify((e.short || []).slice().sort()) !== JSON.stringify((u.rd5short || []).slice().sort())) {
      failures.push(`${id}: end rd5short ${JSON.stringify(e.short)} != unlock.rd5short ${JSON.stringify(u.rd5short)}`);
    }
    // Secondary recomputations (reported, from the trace only).
    const daysReady = trace.filter(s => s.ready).length;
    const daysAllButVet = trace.filter(s => !s.short.includes('armor') && !s.short.includes('weapons') && !s.short.includes('tricks')).length;
    const maxSimul = Math.max.apply(null, trace.map(s => 4 - (s.short || []).length).concat([0]));
    const daysMet = {};
    for (const b of ['armor', 'weapons', 'tricks', 'veterans']) daysMet[b] = trace.filter(s => !(s.short || []).includes(b)).length;
    const firstMet = {};
    for (const b of ['armor', 'weapons', 'tricks', 'veterans']) {
      const hit = trace.find(s => !(s.short || []).includes(b));
      firstMet[b] = hit ? hit.day : null;
    }
    const peakShortfall = recomputedPeakGated < 200;
    const finalExceedsTrace = {};
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) finalExceedsTrace[k] = (e[k] | 0) > maxFromTrace[k];
    analyzed.push({
      seed: r.seed, policy: r.policy, days: r.days, endReason: r.endReason,
      waveReach: r.waveReach, nationalEver: r.nationalEver, nationalFinal: r.nationalFinal,
      table: r.table, entered: r.entered, won: r.won,
      end: { armored: e.armored, armed: e.armed, tricks: e.tricks, veterans: e.veterans,
             ready: !!e.ready, short: e.short, gated: e.gated, raw: e.raw, war: e.war,
             diplomacy: e.diplomacy, plenty: e.plenty, capped: e.capped, holdKind: e.holdKind,
             unlockedWave: e.unlockedWave, w4faced: !!e.w4faced, w3rung: !!e.w3rung,
             w2points: e.w2points, w2bar: e.w2bar, day: e.day,
             killers: endKillers },
      max: recomputedMax, maxFromTrace, peakStanding: peakSplit, peakGated: recomputedPeakGated,
      peakShortfall, daysReady, daysAllButVet, maxSimul, daysMet, firstMet,
      recorderFirstMet: W.firstMet, finalExceedsTrace,
      traceDays: trace.length, traceLastDay: trace.length ? trace[trace.length - 1].day : null,
      dailyMismatch,
      unlockCross: { gated: u.standing, holdKind: u.holdKind, rd5short: u.rd5short, distT5: u.distT5 },
    });
  }
  const byPolicy = {};
  for (const p of ['off', 'on']) {
    const rs = analyzed.filter(c => c.policy === p);
    const dist = (get) => rs.map(get);
    byPolicy[p] = {
      n: rs.length,
      endMedian: {}, maxMedian: {},
      endZero: {}, maxZero: {},
      peakGatedMedian: medianOf(dist(c => c.peakGated)),
      peakShortfall: rs.filter(c => c.peakShortfall).length,
      daysReadyAny: rs.filter(c => c.daysReady > 0).length,
      daysReadyMedian: medianOf(dist(c => c.daysReady)),
      maxSimulMedian: medianOf(dist(c => c.maxSimul)),
      wave5Unlocked: rs.filter(c => (c.end.unlockedWave | 0) >= 5).length,
      w4faced: rs.filter(c => c.end.w4faced).length,
      nationalEver: rs.reduce((t, c) => t + c.nationalEver, 0),
      table: rs.reduce((t, c) => t + c.table, 0),
      won: rs.reduce((t, c) => t + c.won, 0),
    };
    for (const k of ['armored', 'armed', 'tricks', 'veterans']) {
      byPolicy[p].endMedian[k] = medianOf(dist(c => c.end[k]));
      byPolicy[p].maxMedian[k] = medianOf(dist(c => c.max[k]));
      byPolicy[p].endZero[k] = rs.filter(c => c.end[k] === 0).length;
      byPolicy[p].maxZero[k] = rs.filter(c => c.max[k] === 0).length;
    }
  }
  const out = {
    label: 'sim-w5counts-a analysis', demand: DEMAND, n: analyzed.length,
    rows: analyzed, byPolicy, failures,
    verdict: failures.length ? 'NO-GO' : 'GO',
    verdictRule: 'GO iff prereg legs 1-6 all pass (counts present as integers 16/16; peak splits 16/16 incl. all gated-shortfall rows; killer identities with end + 100% daily living==gate equality; analyzer recomputation == recorder; fullseat cross-checks 16/16; demand citation verified)',
    generated: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log(`\n=== sim-w5counts-a analysis === n=${analyzed.length} failures=${failures.length} verdict=${out.verdict}`);
  for (const f of failures) console.log('  FAIL: ' + f);
  for (const p of ['off', 'on']) {
    const b = byPolicy[p];
    console.log(`  ${p}: endMedian=${JSON.stringify(b.endMedian)} maxMedian=${JSON.stringify(b.maxMedian)} peakGatedMed=${b.peakGatedMedian} peakShortfall=${b.peakShortfall}/8 daysReadyAny=${b.daysReadyAny}/8 maxSimulMed=${b.maxSimulMedian} wave5=${b.wave5Unlocked} w4faced=${b.w4faced}/8 natEver=${b.nationalEver} table=${b.table} won=${b.won}`);
    console.log(`    endZero=${JSON.stringify(b.endZero)} maxZero=${JSON.stringify(b.maxZero)}`);
  }
  console.log(`  -> ${outPath}`);
  if (failures.length) process.exit(1);
}

async function senseMode(seedArg) {
  const seed = parseInt(process.env.SENSE_SEED || seedArg || '76001', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const out = process.env.SENSE_OUT || path.join(REPO, 'evidence', '2026-10-29', 'sim-w5counts-a-sense.txt');
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.FULLSEATPURSUIT = '1';
  process.env.FULLSEAT = '1';
  process.env.W5COUNTS = '1';
  const armed = buildPolicy('on');
  const { Game } = await loadGame({ seed, mode: 'w5counts-a-sense', fullTelemetry: false, narration: true });
  const t = {};
  const uninstall = PI.install(Game, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, armed, { days, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}
  const ring = t.sayRing || [];
  let pg = {};
  try { pg = Game.progState ? Game.progState() : {}; } catch (e) {}
  let endW5 = null;
  try { endW5 = snapW5counts(Game); } catch (e) {}
  const header = [
    'SENSE-ONLY REPLAY — NON-MEASURED (narration shifts trajectories; never enters the census)',
    `seed=${seed} policy=fullseat-pursuit days=${result.days} gameDays=${result.gameDays} endReason=${result.endReason} maxWave=${result.maxWaveUnlocked} sayLive=${!!t.sayLive} ringLines=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} endCounts=${endW5 ? `arm${endW5.armored}/wpn${endW5.armed}/trk${endW5.tricks}/vet${endW5.veterans} gated=${endW5.gated} hold=${endW5.holdKind}` : '?'}`,
    '',
  ].join('\n');
  const body = header + ring.map(s => `[d${s.day}] ${s.text}`).join('\n') + '\n';
  writeRowViaWriter(out, body);
  console.log(`SENSE-DONE seed=${seed} end=${result.endReason} ring=${ring.length} tableWaiting=${!!pg.tableWaiting} tableDone=${!!pg.tableDone} -> ${out}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--detgate')) return detgateMode();
  if (args.includes('--analyze')) return analyzeMode();
  if (args.includes('--sense')) return senseMode(args[args.indexOf('--sense') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('W5COUNTS-A FAILED:', (e && e.stack) || e); process.exit(1); });
