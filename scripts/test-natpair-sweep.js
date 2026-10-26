#!/usr/bin/env node
// scripts/test-natpair-sweep.js — sim-natpair-a sweep
// (scale-onramp axis, 2026-10-26: the national-pairing instrument
// question. DIAG ONLY, zero src/js changes, zero default flips,
// no edits to any existing sweep/summary/check.)
//
// ONE ARM, plain tableseat-nowait (LEANLINKRESCUE=1,
// TABLESEATNOWAIT=1), seeds 73671-73678, 180d death-aware.
// The sweep wraps tableseat-nowait.daily with PURE READS only:
// a pre-daily snap (exactly as prior sweeps compute hist.maxRank /
// nationalEver / table / entered), then delegation, then a
// post-daily snap (NEW diagnostic field only, never folded into
// the old fields). It captures ctx.tsNationalDay and a per-day
// rank trace (pre-order, post-order) so a transient can be
// located to a day and a direction.
//
// Pairing definitions (see evidence/2026-10-26/sim-natpair-a.md):
//   SNAPNAT  = row nationalEver (0/1, pre-daily hist + final snap)
//   TSPRESENT = tsNationalDay != null
//   MAXNAT   = maxRank in {national, global}
//   OLDPAIRED = (SNAPNAT === TSPRESENT) computed literally in JS
//     (number === boolean: always false — the suspected bug,
//     preserved verbatim so it stays readable)
//   NEWPAIRED = (SNAPNAT === (TSPRESENT ? 1 : 0)) — the ADOPTED
//     revised check (check condition revised; the brief's pairing
//     definition is NOT revised: national-ever stays snap-based,
//     ts stays an independent witness, pairing = witnesses agree)
//   MAXAGREE = (MAXNAT === (SNAPNAT === 1))
// Classes (exactly one per seed): agree | transient-ts-only |
// snap-only | final-only | post-explained-transient | unclassified.
// A transient-ts-only seed still reads MISMATCH under NEWPAIRED:
// the witnesses genuinely disagree, and that is the finding.
//
// Modes (read the argv handling here — do NOT probe with --help):
//   --one natpair <seed> : run one seed, write its row.
//   --summary : build summary.json from the rows on disk, print
//     the pairing table + DIAG-GO leg computation. Exit 1 on
//     corpus failure (missing rows).
//   --detgate : plain tableseat-nowait vs the natpair wrapper on
//     one seed (SEED env, default 73671): days/gameDays/
//     tsNationalDay/won/deaths must match, proving the pure-read
//     wrapper moves no play.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { tableseatNowait } = require('./policies/tableseat-nowait');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RANK_NAMES = ['village', 'regional', 'national', 'global'];
const SEEDS = (process.env.SEEDS || '73671,73672,73673,73674,73675,73676,73677,73678')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
// 0126Z authoritative rebaseline table (comparison reference only).
const REBASELINE = {
  band: { deaths: 260, nationalEver: 6, nationalFinal: 5, table: 4, entered: 4, wins: 4, wave4: 5, wave5: 0, medianDays: 143 },
  seeds: {
    73671: { days: 180, won: 0, deaths: 31 }, 73672: { days: 97, won: 1, deaths: 25 },
    73673: { days: 124, won: 1, deaths: 28 }, 73674: { days: 163, won: 1, deaths: 30 },
    73675: { days: 180, won: 0, deaths: 38 }, 73676: { days: 70, won: 0, deaths: 31 },
    73677: { days: 143, won: 0, deaths: 43 }, 73678: { days: 116, won: 1, deaths: 34 },
  },
};
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
// Pure pairing math, exported for the proof test.
function classifyPairing(r) {
  const snapNat = (r.nationalEver | 0);
  const tsPresent = r.tsNationalDay != null;
  const maxNat = (r.maxRank === 'national' || r.maxRank === 'global');
  const finalNat = (r.finalRank === 'national' || r.finalRank === 'global');
  const postNat = (r.postMaxRank === 'national' || r.postMaxRank === 'global');
  const oldPaired = (snapNat === tsPresent); // eslint-disable-line eqeqeq: literal, intentional
  const newPaired = (snapNat === (tsPresent ? 1 : 0));
  const maxAgree = (maxNat === (snapNat === 1));
  let cls = 'unclassified';
  if (tsPresent && snapNat === 0 && postNat) cls = 'post-explained-transient';
  else if (tsPresent && snapNat === 0) cls = 'transient-ts-only';
  else if (snapNat === 1 && !tsPresent) cls = 'snap-only';
  else if (snapNat === 1 && !maxNat && finalNat) cls = 'final-only';
  else if (newPaired && maxAgree) cls = 'agree';
  else cls = 'unclassified';
  return { snapNat, tsPresent, maxNat, finalNat, postNat, oldPaired, newPaired, maxAgree, cls };
}

async function runOne(pid, seed, days, evidDir) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  delete process.env.DEVOTIONGATE; delete process.env.DEVOTIONGATEDIAG;
  delete process.env.FEASTDRAW; delete process.env.NONWORLDKILL;
  const { Game } = await loadGame({ seed, mode: 'natpair-' + pid, fullTelemetry: false });
  await setupGame(Game);
  const sayLines = [];
  try {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function () {
        try {
          const t = String((arguments.length ? arguments[0] : '') || '');
          if (/national|global|table|realm|polity/i.test(t) && sayLines.length < 200) {
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
  let capturedCtx = null;
  const base = tableseatNowait;
  const policy = Object.assign({}, base, {
    daily(G, ctx) {
      if (!capturedCtx) capturedCtx = ctx;
      try {
        const s = snap(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
        var preOrder = RANK_ORDER[s.rank] || 0;
      } catch (e) { var preOrder = 0; }
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
  const starv = deaths.filter(d => /starv|hunger/i.test(String(d.cause || '')));
  const last = (arr) => (arr && arr.length ? arr[arr.length - 1][1] : null);
  const ctxTs = {};
  if (capturedCtx) {
    for (const k of Object.keys(capturedCtx)) {
      if (k.indexOf('ts') === 0) ctxTs[k] = capturedCtx[k];
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
    ts: ctxTs,
    ctxFd: ctxTs,
    tsNationalDay: ctxTs.tsNationalDay != null ? ctxTs.tsNationalDay : null,
    finalPop: last(result.samples.pop), finalPantry: last(result.samples.pantry),
    finalKnown: last(result.samples.knowledge),
    sayLines: sayLines,
    // NEW diagnostic fields only (never folded into the old fields above):
    postMaxRank: RANK_NAMES[post.maxRank] || 'village',
    postMaxArc: post.maxArc,
    postTable: (post.everTable || end.tableWaiting) ? 1 : 0,
    postEntered: (post.everEntered || end.tableEntered) ? 1 : 0,
    preNationalDay: preNationalDay,
    postNationalDay: postNationalDay,
    rankTrace: rankTrace,
  };
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

function evidDirOf() { return process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-natpair-a'); }

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const evidDir = evidDirOf();
  fs.mkdirSync(evidDir, { recursive: true });
  const row = await runOne(pid, seed, days, evidDir);
  const p = row.pairing;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} maxRank=${row.maxRank} postMaxRank=${row.postMaxRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} tsNationalDay=${row.tsNationalDay != null ? row.tsNationalDay : 'null'} preNatDay=${row.preNationalDay != null ? row.preNationalDay : 'null'} postNatDay=${row.postNationalDay != null ? row.postNationalDay : 'null'} pairing: class=${p.cls} oldPaired=${p.oldPaired} newPaired=${p.newPaired} maxAgree=${p.maxAgree} sayLines=${row.sayLines.length}`);
}

async function summaryMode() {
  const evidDir = evidDirOf();
  const rows = [];
  let corpusOk = true;
  for (const seed of SEEDS) {
    const p = path.join(evidDir, `s${seed}-natpair.json`);
    if (!fs.existsSync(p)) { console.log(`  MISSING ROW ${p}`); corpusOk = false; continue; }
    rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  const ok = rows.length === SEEDS.length && rows.every(r => r.days > 0 && r.pairing && r.pairing.cls !== 'unclassified');
  if (!ok) corpusOk = false;
  const band = {
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
  };
  const pairing = rows.map(r => ({
    seed: r.seed, days: r.days, won: r.won, wave: r.waveReach, arc: r.maxArc,
    finalRank: r.finalRank, maxRank: r.maxRank, postMaxRank: r.postMaxRank,
    natEver: r.nationalEver, natFinal: r.nationalFinal, table: r.table, entered: r.entered,
    tsNationalDay: r.tsNationalDay, preNationalDay: r.preNationalDay, postNationalDay: r.postNationalDay,
    starv: r.starvationDeaths, deaths: r.deathTotal,
    oldPaired: r.pairing.oldPaired, newPaired: r.pairing.newPaired, maxAgree: r.pairing.maxAgree,
    cls: r.pairing.cls,
  }));
  const classCounts = {};
  for (const x of pairing) classCounts[x.cls] = (classCounts[x.cls] || 0) + 1;
  const legs = {
    a_allClassified: rows.length === SEEDS.length && rows.every(r => r.pairing && r.pairing.cls !== 'unclassified'),
    b_adoptedRuleStated: 'MANUAL (see evidence pre-registration: check condition revised to NEWPAIRED, brief definition unchanged)',
    c_nationalEver6: band.nationalEver === 6,
  };
  legs.allComputableOk = legs.a_allClassified && legs.c_nationalEver6;
  const comparison = {
    deaths: { fresh: band.deathTotal, ref: REBASELINE.band.deaths, match: band.deathTotal === REBASELINE.band.deaths },
    nationalEver: { fresh: band.nationalEver, ref: 6, match: band.nationalEver === 6 },
    nationalFinal: { fresh: band.nationalFinal, ref: 5, match: band.nationalFinal === 5 },
    table: { fresh: band.table, ref: 4, match: band.table === 4 },
    entered: { fresh: band.entered, ref: 4, match: band.entered === 4 },
    wins: { fresh: band.won, ref: 4, match: band.won === 4 },
    wave4: { fresh: band.wave4, ref: 5, match: band.wave4 === 5 },
    wave5: { fresh: band.wave5, ref: 0, match: band.wave5 === 0 },
    medianDays: { fresh: band.medianDays, ref: 143, match: band.medianDays === 143 },
  };
  const summary = { band, pairing, classCounts, legs, comparison, corpusOk,
    verdict: (corpusOk && legs.allComputableOk) ? 'DIAG-GO (computable legs; leg (b) adopted-rule text judged in evidence)' : 'NO-GO' };
  const summaryPath = path.join(evidDir, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(summary, null, 1) + '\n');
  console.log(`  BAND: won=${band.won}/8 median=${band.medianDays}d natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} arc4=${band.arc4} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal}`);
  console.log(`  PAIRING: ${pairing.map(x => `s${x.seed}:${x.cls} (natEver=${x.natEver}, maxRank=${x.maxRank}, postMax=${x.postMaxRank}, tsDay=${x.tsNationalDay}, old=${x.oldPaired}, new=${x.newPaired}, maxAgree=${x.maxAgree})`).join(' ')}`);
  console.log(`  CLASSES: ${JSON.stringify(classCounts)}`);
  console.log(`  COMPARISON vs 0126Z: ${Object.entries(comparison).map(([k, v]) => `${k} fresh=${v.fresh} ref=${v.ref} ${v.match ? 'match' : 'DEVIATE'}`).join(' | ')}`);
  console.log(`  LEGS: (a)allClassified ${legs.a_allClassified} | (c)nationalEver6 ${legs.c_nationalEver6} | ALL-COMPUTABLE ${legs.allComputableOk} | (b)adopted-rule-text MANUAL`);
  console.log(`  VERDICT: ${summary.verdict} | CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  if (!corpusOk) { console.error('PROOF GATE FAILURE'); process.exit(1); }
}

async function detgateMode() {
  const seed = parseInt(process.env.SEED || '73671', 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1';
  const baseRow = await (async () => {
    const { Game } = await loadGame({ seed, mode: 'natpair-detgate-base', fullTelemetry: false });
    await setupGame(Game);
    let capturedCtx = null;
    const policy = Object.assign({}, tableseatNowait, {
      daily(G, ctx) { if (!capturedCtx) capturedCtx = ctx; return tableseatNowait.daily(G, ctx); },
    });
    const result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 10 });
    const end = snap(Game);
    return { days: result.days, gameDays: result.gameDays, won: end.won ? 1 : 0, deaths: (result.samples.deaths || []).length, ts: capturedCtx ? capturedCtx.tsNationalDay : null };
  })();
  const wrappedRow = await runOne('natpair', seed, days, null);
  const match = baseRow.days === wrappedRow.days && baseRow.gameDays === wrappedRow.gameDays
    && baseRow.won === wrappedRow.won && baseRow.deaths === wrappedRow.deathTotal
    && (baseRow.ts != null ? baseRow.ts : null) === wrappedRow.tsNationalDay;
  console.log(`  DETGATE seed=${seed} base days=${baseRow.days} gameDays=${baseRow.gameDays} won=${baseRow.won} deaths=${baseRow.deaths} ts=${baseRow.ts} | wrapped days=${wrappedRow.days} gameDays=${wrappedRow.gameDays} won=${wrappedRow.won} deaths=${wrappedRow.deathTotal} ts=${wrappedRow.tsNationalDay} | MATCH=${match}`);
  if (!match) { console.error('DETGATE FAILURE'); process.exit(1); }
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv[0] === '--one' && argv[1] === 'natpair') return oneMode(argv[1], argv[2]);
  if (argv[0] === '--summary') return summaryMode();
  if (argv[0] === '--detgate') return detgateMode();
  console.error('usage: test-natpair-sweep.js (--one natpair <seed> | --summary | --detgate)');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
module.exports = { classifyPairing };
