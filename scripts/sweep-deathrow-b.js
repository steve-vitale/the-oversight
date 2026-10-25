#!/usr/bin/env node
// scripts/sweep-deathrow-b.js — sim-deathrow-b SWEEP + proof modes
// (loop B, run fleshout-loop-b-20261025T1752Z, axis food-economy).
//
// THE UNBLOCK: sim-causeext-b (1630Z) proved the tableseat-nowait corpus
// (evidence/2026-10-24/perseed-tableseat-nowait-a/) carries NO per-death
// rows with kind — its sweep aggregated deaths at write time and discarded
// the rows. This script is DERIVED from that sweep
// (scripts/test-tableseat-nowait-sweep.js): same policy pairing, same
// 180d death-aware horizon, same per-seed row shape — with ONE DELTA,
// declared here: the per-seed file ALSO persists the full per-death list
// (`deathRows`) materialized from the harness live-death capture
// (scripts/sim-harness.js: tele 'death' rows carry day/kind/who/cause +
// a lazy player getter repaired by corpses.js TELEFLAG).
//
// DELTAS vs test-tableseat-nowait-sweep.js runOne (exhaustive):
//   1. Policy side is ARMED ONLY (tableseat-nowait, LEANLINKRESCUE=1 +
//      TABLESEATNOWAIT=1). No leanlinkrescue-only side: that is a
//      different substrate, and pooling the two sides would be a
//      substrate conflict in scripts/analyze-causebase-b.js. The pooled
//      list is the ARMED-substrate list causeext-b asked for.
//   2. Per-seed `policy` field is "tableseat-nowait" (not "armed") so
//      the analyzer derives scope.policy from the corpora themselves.
//   3. Per-seed file carries `deathRows` (analyzer sweep format: kind,
//      isPlayer, cause, plus day/who/player passthrough), `side`,
//      `flags`, and `substrate` for human readability. The aggregated
//      `deaths` dict and `starvationDetail` are kept for backward
//      compatibility with the old corpus shape.
//   4. Kind-missing rows are NEVER repaired or invented: a row whose
//      harness kind is null is persisted with kind null, counted in
//      `kindMissing`, and reported. The analyzer then fails loudly on
//      pool (exit 2) — that is the honest STOP path, not a silent fix.
//   5. Summary file carries `meta` (policy/days/env) and NO top-level
//      `seed` field, so the analyzer skips it for counting but derives
//      horizon days (180) from it.
// ZERO src/js changes. The recorder is sweep-side persistence only: the
// trajectory code path is byte-identical to the pristine sweep (proven
// by --neutrality, which shells out to the pristine sweep script on the
// same seed and compares days/gameDays/deathTotal/deaths/ts).
//
// Modes:
//   default: sweep. SEEDS (default 73701-73708 pilot band), DAYS=180
//     (default), EVID=evidence/2026-10-25/perseed-deathrow-b (default).
//     Per-config INCREMENTAL corpus writes via the chunked writer
//     subprocess (survives the container write-flap class). Exit 0 on a
//     completed sweep regardless of GO/NO-GO (the verdict is data);
//     exit 1 on proof-gate failure (G3 corpus integrity below) or on
//     any kind-missing row (the STOP condition fires at the sweep).
//   --neutrality SEED: recorder path vs pristine
//     test-tableseat-nowait-sweep.js path on one seed (same env, same
//     seed): days/gameDays/deathTotal/deaths/ts must match, or exit 1.
//     The pristine run writes to a scratch dir removed in the same
//     command, so no leftovers.
//   --rerun SEED: determinism leg — re-run one seed through the recorder
//     path (no writes) and byte-compare to its committed per-seed file
//     (excluding corpusFile/corpusSha bookkeeping). Mismatch exits 1.
//
// Seed freshness: asserted inline (evidence filenames + scripts, self
// excluded). Bands 73601-73608 and 73671-73678 are TAKEN and must never
// appear here; the run's bands are 73701-73708 (pilot) and 73711-73718,
// 73721-73728, 73731-73738, 73741-73748 (multi-band).
//
// Usage:
//   node scripts/sweep-deathrow-b.js
//   SEEDS=73711,73712,73713,73714,73715,73716,73717,73718 node scripts/sweep-deathrow-b.js
//   node scripts/sweep-deathrow-b.js --neutrality 73701
//   node scripts/sweep-deathrow-b.js --rerun 73701
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const STARV_RE = /starv|hunger/i;
const TAKEN_BANDS = [[73601, 73608], [73671, 73678]];
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

// Incremental corpus write via the chunked writer subprocess (same pattern
// as the tableseat-nowait and deathcensus-diag sweeps: the writer reads
// stdin only, so its writes survive the container's write-flap class).
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

function assertFresh(seeds) {
  for (const s of seeds) {
    for (const [lo, hi] of TAKEN_BANDS) {
      if (s >= lo && s <= hi) { console.error(`SWEEP STOP: seed ${s} is in TAKEN band ${lo}-${hi}`); process.exit(2); }
    }
  }
  const hits = [];
  const ev = path.join(REPO, 'evidence');
  try {
    for (const day of fs.readdirSync(ev)) {
      const dd = path.join(ev, day);
      let st; try { st = fs.statSync(dd); } catch (e) { continue; }
      if (!st.isDirectory()) continue;
      for (const sub of fs.readdirSync(dd)) {
        const fn = String(sub);
        for (const s of seeds) if (fn.indexOf(String(s)) >= 0) hits.push(path.join(day, fn));
      }
    }
  } catch (e) {}
  const sc = path.join(REPO, 'scripts');
  try {
    for (const f of fs.readdirSync(sc)) {
      if (f === 'sweep-deathrow-b.js') continue;
      const txt = fs.readFileSync(path.join(sc, f), 'utf8');
      for (const s of seeds) if (txt.indexOf(String(s)) >= 0) hits.push('scripts/' + f + ':' + s);
    }
    for (const f of fs.readdirSync(path.join(sc, 'policies'))) {
      const txt = fs.readFileSync(path.join(sc, 'policies', f), 'utf8');
      for (const s of seeds) if (txt.indexOf(String(s)) >= 0) hits.push('scripts/policies/' + f + ':' + s);
    }
  } catch (e) {}
  if (hits.length) { console.error('SWEEP STOP: seeds not fresh: ' + hits.slice(0, 10).join(', ')); process.exit(2); }
  console.log('seed freshness OK: ' + seeds.join(','));
}

async function runOne(seed, days, evidDir) {
  // Env pairing (exact, armed substrate only): LEANLINKRESCUE=1 AND
  // TABLESEATNOWAIT=1. No wait leg anywhere in this script.
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  const { Game } = await loadGame({ seed, mode: 'deathrow-b', fullTelemetry: false });
  await setupGame(Game);
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
  let capturedCtx = null;
  const policy = Object.assign({}, tableseatNowait, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (tableseatNowait.daily) { try { return tableseatNowait.daily(G, ctx); } catch (e) {} }
    },
  });
  const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
  const end = snap(Game);
  // Materialize the harness death list (the lazy player getter resolves
  // now, post-run, so the corpses.js TELEFLAG repair is honored). This is
  // THE recorder: every harness row carries kind, and it is persisted
  // whole instead of aggregated away. DELTA vs the old sweep, nothing else.
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) { player = false; }
    return { day: d.day | 0, kind: (d.kind != null) ? String(d.kind) : null, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player: player };
  });
  const deathRows = deaths.map(d => ({
    day: d.day, kind: d.kind, who: d.who, cause: d.cause,
    player: d.player, isPlayer: d.player,
  }));
  const kindMissing = deathRows.filter(r => r.kind === null || r.kind === undefined || r.kind === '').length;
  const flagMissing = deathRows.filter(r => typeof r.isPlayer !== 'boolean').length;
  const causeMissing = deathRows.filter(r => r.cause === null || r.cause === undefined || r.cause === '').length;
  const ts = {};
  const ctxExtra = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ts[k] = capturedCtx[k];
      if (k.indexOf('court') === 0 || k === 'tended' || k === 'proposedLead' || k === 'defenseCalls') ctxExtra[k] = capturedCtx[k];
    }
  }
  const starv = deaths.filter(d => STARV_RE.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const row = {
    policy: 'tableseat-nowait',
    side: 'armed',
    substrate: 'leanlinkrescue courtship (LEANLINKRESCUE=1) + tableseat-nowait seat legs only (TABLESEATNOWAIT=1), no wait leg',
    flags: { LEANLINKRESCUE: 1, TABLESEATNOWAIT: 1 },
    seed,
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
    deathRows,
    kindMissing, flagMissing, causeMissing,
  };
  if (evidDir) {
    const fn = path.join(evidDir, `s${seed}.json`);
    const body = JSON.stringify(row, null, 1) + '\n';
    const sha = writeRowViaWriter(fn, body);
    row.corpusFile = fn; row.corpusSha = sha;
  }
  return row;
}

function aggregate(rows) {
  const wave = (n) => rows.filter(r => (r.waveReach || 1) >= n).length;
  const starvBySeed = {};
  for (const r of rows) starvBySeed[r.seed] = r.starvationDeaths;
  return {
    n: rows.length,
    won: rows.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(rows.map(r => r.days)),
    medianGameDays: medianOf(rows.map(r => r.gameDays)),
    maxDays: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: wave(4), wave5: wave(5),
    maxArc: Math.max.apply(null, rows.map(r => r.maxArc).concat([1])),
    starvationTotal: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    starvationBySeed: starvBySeed,
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    kindMissing: rows.reduce((t, r) => t + (r.kindMissing || 0), 0),
    flagMissing: rows.reduce((t, r) => t + (r.flagMissing || 0), 0),
    causeMissing: rows.reduce((t, r) => t + (r.causeMissing || 0), 0),
    seatTaken: rows.reduce((t, r) => t + (r.ts.tsSeatTaken || 0), 0),
    seatAttempts: rows.reduce((t, r) => t + (r.ts.tsSeatAttempts || 0), 0),
    seatFailed: rows.reduce((t, r) => t + (r.ts.tsSeatFailed || 0), 0),
    previewSeen: rows.reduce((t, r) => t + (r.ts.tsPreviewSeen || 0), 0),
    previewNotReady: rows.reduce((t, r) => t + (r.ts.tsPreviewNotReady || 0), 0),
    tableAnswers: rows.reduce((t, r) => t + (r.ts.tsTableAnswers || 0), 0),
  };
}

async function sweepMode() {
  const seeds = (process.env.SEEDS || '73701,73702,73703,73704,73705,73706,73707,73708')
    .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b');
  assertFresh(seeds);
  fs.mkdirSync(evidDir, { recursive: true });
  const rows = [];
  for (const seed of seeds) {
    const row = await runOne(seed, days, evidDir);
    rows.push(row);
    console.log(`  [seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deathTotal=${row.deathTotal} deathRows=${row.deathRows.length} kindMissing=${row.kindMissing} flagMissing=${row.flagMissing} causeMissing=${row.causeMissing} ts=${JSON.stringify(row.ts)}`);
  }
  const agg = aggregate(rows);
  // G3 corpus integrity: every config produced a row, no zero-day rows,
  // deathRows present on every row, zero kind/flag/cause-missing rows.
  const g3Pass = rows.length === seeds.length && rows.every(r => r.days > 0 && Array.isArray(r.deathRows) && r.deathRows.length > 0)
    && agg.kindMissing === 0 && agg.flagMissing === 0 && agg.causeMissing === 0;
  const report = {
    label: 'sim-deathrow-b sweep', seeds, days, rows, aggregate: agg,
    meta: { policy: 'tableseat-nowait', days, env: { LEANLINKRESCUE: '1', TABLESEATNOWAIT: '1' } },
    gates: { g3CorpusIntegrity: g3Pass },
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeRowViaWriter(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-deathrow-b sweep ===');
  console.log(`  n=${agg.n} won=${agg.won} medD=${agg.medianDays} medGameD=${agg.medianGameDays} maxD=${agg.maxDays} natEver=${agg.nationalEver} natFinal=${agg.nationalFinal} table=${agg.table} entered=${agg.entered} wave4=${agg.wave4} wave5=${agg.wave5} maxArc=${agg.maxArc} starvTotal=${agg.starvationTotal} deathTotal=${agg.deathTotal} kindMissing=${agg.kindMissing} flagMissing=${agg.flagMissing} causeMissing=${agg.causeMissing} seatAttempts=${agg.seatAttempts} seatTaken=${agg.seatTaken} seatFailed=${agg.seatFailed} previewSeen=${agg.previewSeen} previewNotReady=${agg.previewNotReady} tableAnswers=${agg.tableAnswers}`);
  console.log(`  G3 corpus integrity: ${g3Pass ? 'PASS' : 'FAIL'}`);
  console.log(`  -> ${summaryPath}`);
  if (!g3Pass) { console.error('PROOF GATE FAILURE (G3) — kind/flag/cause-missing rows or empty deathRows: STOP condition territory, see evidence file'); process.exit(1); }
}

async function neutralityMode(seedArg) {
  const seed = parseInt(process.env.SEED || seedArg || '73701', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const mine = await runOne(seed, days, null);
  // Pristine path: shell out to the original sweep script on the same
  // seed, writing to a scratch dir removed in this same command.
  const scratch = path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b-neutrality-scratch');
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  fs.mkdirSync(scratch, { recursive: true });
  try {
    execFileSync('node', [path.join(REPO, 'scripts', 'test-tableseat-nowait-sweep.js')],
      { cwd: REPO, encoding: 'utf8', timeout: 3600000,
        env: Object.assign({}, process.env, { SEEDS: String(seed), DAYS: String(days), EVID: scratch }) });
  } catch (e) {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e2) {}
    console.error('NEUTRALITY: pristine sweep run failed: ' + String((e && e.message) || e).slice(0, 300));
    process.exit(1);
  }
  let pristine = null;
  try { pristine = JSON.parse(fs.readFileSync(path.join(scratch, `s${seed}-armed.json`), 'utf8')); } catch (e) {}
  try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  if (!pristine) { console.error('NEUTRALITY: pristine armed row not produced'); process.exit(1); }
  const fields = ['days', 'gameDays', 'deathTotal', 'ts'];
  const diffs = [];
  for (const f of fields) {
    if (JSON.stringify(mine[f]) !== JSON.stringify(pristine[f])) diffs.push(f + ': mine=' + JSON.stringify(mine[f]) + ' pristine=' + JSON.stringify(pristine[f]));
  }
  if (JSON.stringify(mine.deaths) !== JSON.stringify(pristine.deaths)) diffs.push('deaths dict differs');
  const ok = diffs.length === 0;
  console.log(`NEUTRALITY seed=${seed} mine(days=${mine.days} gameDays=${mine.gameDays} deathTotal=${mine.deathTotal} ts=${JSON.stringify(mine.ts)}) pristine(days=${pristine.days} gameDays=${pristine.gameDays} deathTotal=${pristine.deathTotal} ts=${JSON.stringify(pristine.ts)}) -> ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) { console.log('NEUTRALITY diffs: ' + diffs.join(' | ')); process.exit(1); }
}

async function rerunMode(seedArg) {
  const seed = parseInt(process.env.SEED || seedArg || '73701', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathrow-b');
  let committed = null;
  try { committed = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}.json`), 'utf8')); } catch (e) {
    console.error('RERUN: no committed per-seed file for seed ' + seed + ' in ' + evidDir);
    process.exit(1);
  }
  const fresh = await runOne(seed, days, null);
  const strip = (r) => { const c = Object.assign({}, r); delete c.corpusFile; delete c.corpusSha; return c; };
  const a = JSON.stringify(strip(committed), null, 1) + '\n';
  const b = JSON.stringify(strip(fresh), null, 1) + '\n';
  const ok = a === b;
  console.log(`RERUN-DETERMINISM seed=${seed} committed(days=${committed.days} gameDays=${committed.gameDays} deathRows=${(committed.deathRows || []).length}) fresh(days=${fresh.days} gameDays=${fresh.gameDays} deathRows=${(fresh.deathRows || []).length}) -> ${ok ? 'MATCH' : 'MISMATCH'}`);
  if (!ok) {
    // Report the first differing key for diagnosis, without dumping rows.
    const ca = strip(committed), cb = strip(fresh);
    for (const k of Object.keys(ca)) {
      if (JSON.stringify(ca[k]) !== JSON.stringify(cb[k])) { console.log('RERUN first differing key: ' + k); break; }
    }
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--neutrality')) return neutralityMode(args[args.indexOf('--neutrality') + 1]);
  if (args.includes('--rerun')) return rerunMode(args[args.indexOf('--rerun') + 1]);
  return sweepMode();
}
if (require.main === module) main().catch(e => { console.error('DEATHROW SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { runOne, aggregate, writeRowViaWriter };
