#!/usr/bin/env node
// sweep-scholardistsafe-b.js — scholar-safe variant sweep.
//
// 16 FRESH seeds (67517-67532, verified never used before via the FILENAME
// criterion: no filename in the tree names any of these seeds; content hits,
// if any, are numeric-kcal-value hits reported for review, not filename
// matches) x {leadfeast, belongfeast} x {control, armed} = 64 configs,
// paired identical seeds, 180d death-aware horizons (runDays stops on
// Game.over). Substrate: FEASTSCALE_R13=1 / SEATDRIVE=0 (the pilot/confirm
// substrate). Armed: SCHOLARDISTSAFE=1 (the gated layer).
//
// Emits per-seed JSONs to evidence/2026-10-23/perseed-scholardistsafe-b/
// in the scholardist schema: seed, policy, arm, anchor, days, gameDays,
// endReason, national, table, exiled, won, maxWave, communityLost,
// deaths[{day, who, vid, cause, pclass, player, deathDayFreshDays,
// thinPool}], thinPoolStarvation, totalStarvation, deathModes,
// medFreshDays, freshSeriesDays, tele, beats, instrumentErrors.
//
// The pre-registration header lives in
// evidence/2026-10-23/sim-scholardistsafe-b.md (written BEFORE any sims).
// This script judges nothing — the manual paired-row comparison judges
// (panel is descriptive-by-construction for the env-gated lever,
// sim-findings.md #796).
//
// Usage: node scripts/sweep-scholardistsafe-b.js
//   SEED_FILTER="67517,67518" POLICY_FILTER="leadfeast" node scripts/sweep-scholardistsafe-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { stdSnapshot, POLICY_REGISTRY } = require('./sweep-compare');
const scholardistsafe = require('./layers/scholardistsafe-b');

const SEEDS = [];
for (let s = 67517; s <= 67532; s++) SEEDS.push(s);
const POLICIES = ['leadfeast', 'belongfeast'];
// Parallel-split support: SEED_FILTER="67517,67518" and/or
// POLICY_FILTER="leadfeast" restrict the sweep to a disjoint subset (two
// processes share OUTDIR resume-safely; files are per (arm,policy,seed)).
const SEED_FILTER = process.env.SEED_FILTER ? process.env.SEED_FILTER.split(',').map(s => +s.trim()) : null;
const POLICY_FILTER = process.env.POLICY_FILTER ? process.env.POLICY_FILTER.split(',').map(s => s.trim()) : null;
const RUN_SEEDS = SEED_FILTER ? SEEDS.filter(s => SEED_FILTER.includes(s)) : SEEDS;
const RUN_POLICIES = POLICY_FILTER ? POLICIES.filter(p => POLICY_FILTER.includes(p)) : POLICIES;
const DAYS = 180;
const OUTDIR = path.join(ROOT, 'evidence', '2026-10-23', 'perseed-scholardistsafe-b');

// SEED-FRESHNESS (FILENAME criterion): the 16 seeds must be never-used.
// Two passes:
//   (a) FILENAME pass — any basename in the tree naming the seed
//       (e.g. perseed-*/*-s67517.json) is a real seed use -> FAIL.
//   (b) CONTENT pass — word-boundary regex hits (\b67517\b) are reported
//       with context. Numeric-kcal-value hits (a JSON kcal field that
//       happens to equal the seed) are NOT seed uses; only seed-context
//       hits (seed:, SEEDS=, seed=, 'seed 67517') fail the run.
// Do NOT use substring greps: a kcal value like 675171 or an address in a
// big number is not a seed use and word boundaries exclude them.
function assertFreshSeeds() {
  const own = new Set(['sweep-scholardistsafe-b.js', 'analyze-scholardistsafe-b.js',
    'build-scholardistsafe-panel.js', 'sense-scholardistsafe-b.js',
    'test-scholardistsafe-b.js',
    'sim-scholardistsafe-b.md', 'scholardistsafe-panel-primary.md']);
  const filenameHits = [];
  const seedContextHits = [];
  const kcalLikeHits = [];
  const scanDirs = ['scripts', 'src', 'docs', 'evidence'].map(d => path.join(ROOT, d));
  const seedRe = new RegExp('\\b(' + SEEDS.join('|') + ')\\b');
  const seedCtxRe = /(?:seed|SEEDS|seeded)\s*["'=:\[]?\s*(\d{5})/i;
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name === 'node_modules') continue; walk(f); continue; }
      if (/\.(js|json|md|gz)$/.test(f) === false) continue;
      if (own.has(e.name)) continue;
      const m = e.name.match(seedRe);
      if (m) filenameHits.push(path.relative(ROOT, f) + ':' + m[1]);
      if (/\.gz$/.test(f)) continue;
      if (!/\.(js|json|md)$/.test(f)) continue;
      let text = '';
      try { text = fs.readFileSync(f, 'utf8'); } catch (err) { continue; }
      let cm;
      const lines = text.split('\n');
      for (const line of lines) {
        if (!seedRe.test(line)) continue;
        const num = (line.match(seedRe) || [])[1];
        const ctx = line.match(seedCtxRe);
        const rel = path.relative(ROOT, f) + ':' + num + ' :: ' + line.trim().slice(0, 100);
        if (ctx && +ctx[1] === +num) seedContextHits.push(rel);
        else kcalLikeHits.push(rel);
      }
    }
  }
  scanDirs.forEach(walk);
  if (kcalLikeHits.length) console.log('note: numeric-value content hits (kcal-like, not seed uses):\n  ' + kcalLikeHits.slice(0, 8).join('\n  '));
  if (filenameHits.length) throw new Error('SEED FRESHNESS FAIL — seed named in filenames: ' + filenameHits.join(', '));
  if (seedContextHits.length) throw new Error('SEED FRESHNESS FAIL — seeds used in seed context: ' + seedContextHits.join(', '));
  console.log('seed freshness: 16/16 fresh (FILENAME criterion: no filename names any seed; no seed-context content hits)');
}

function anchor() {
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); }
  catch (e) { return 'unknown'; }
}

// Mechanism-class death taxonomy (pre-registered for the confirm per the
// pilot's metric-review #2, kept for the variant): food-knowledge injuries
// ('experiment') -> sickness-adjacent; village-named-threat kills (monster
// register names, villageNames, aliases, 'split-fight:' names) -> combat.
// Applied at analysis time from the raw cause; the sweep-time pclass keeps
// the schema (thinPool depends only on cause === 'starvation').
function pclassOf(d) {
  const cause = String((d && d.cause) || 'unknown');
  const kind = String((d && d.kind) || '');
  if (cause === 'starvation') return 'starvation';
  if (cause === 'dehydration') return 'dehydration';
  if (cause === 'wound') return 'wound';
  if (cause === 'sickness' || cause === 'disease') return 'sickness';
  if (cause === 'contest') return 'contest';
  if (cause === 'raid') return 'raid';
  if (/combat/i.test(cause) || kind === 'monster') return 'combat';
  return 'other:' + cause;
}

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

async function runConfig(seed, policyId, arm) {
  const armed = arm === 'armed';
  const instrumentErrors = [];
  const prev = process.env.SCHOLARDISTSAFE;
  if (armed) process.env.SCHOLARDISTSAFE = '1'; else delete process.env.SCHOLARDISTSAFE;
  try {
    const { Game, manifest } = await loadGame({ seed, mode: 'scholardistsafe-b-' + arm });
    await setupGame(Game, 'Columbus, Ohio');
    const layer = scholardistsafe.install(Game);
    const freshSeries = [];
    const hist = { maxRank: 0, maxArc: 1, everTable: false, everEntered: false };
    const base = POLICY_REGISTRY[policyId];
    if (!base) throw new Error('unknown policy ' + policyId);
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try {
        const day = (G.state.scholar || {}).day || 0;
        freshSeries.push({ day, fd: G.pantryFreshDays() });
      } catch (e) { instrumentErrors.push('freshSeries: ' + e.message); }
      try {
        const s = stdSnapshot(G);
        hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
        hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
        if (s.tableWaiting) hist.everTable = true;
        if (s.tableEntered) hist.everEntered = true;
      } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: DAYS, manifest });
    layer.uninstall();

    const deaths = [];
    for (const d of (result.samples.deaths || [])) {
      let fd = null;
      for (let i = freshSeries.length - 1; i >= 0; i--) {
        if (freshSeries[i].day <= d.day) { fd = freshSeries[i].fd; break; }
      }
      const pc = pclassOf(d);
      deaths.push({
        day: d.day, who: d.who || null, vid: null,
        cause: d.cause || 'unknown', pclass: pc, player: !!d.player,
        deathDayFreshDays: fd === null ? null : +fd.toFixed(2),
        thinPool: pc === 'starvation' && fd !== null && fd < 2,
      });
    }
    const thinPoolStarvation = deaths.filter(d => d.thinPool).length;
    const totalStarvation = deaths.filter(d => d.pclass === 'starvation').length;
    const deathModes = [...new Set(deaths.map(d => d.pclass))].sort();

    const fds = freshSeries.map(r => r.fd).filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b);
    const medFreshDays = fds.length ? +fds[Math.floor(fds.length / 2)].toFixed(2) : null;

    const end = stdSnapshot(Game);
    let exiled = 0;
    try { exiled = Game.state.scholar && Game.state.scholar.exiled ? 1 : 0; } catch (e) {}
    const row = {
      seed, policy: policyId, arm, anchor: anchor(),
      days: result.days, gameDays: result.gameDays, endReason: result.endReason,
      national: Math.max(hist.maxRank, RANK_ORDER[end.rank] || 0) >= 2 ? 1 : 0,
      table: (hist.everTable || !!end.tableWaiting) ? 1 : 0,
      exiled,
      won: end.won ? 1 : 0,
      maxWave: result.maxWaveUnlocked || 1,
      maxArc: hist.maxArc,
      communityLost: result.endReason === 'village-lost' ? 1 : 0,
      deaths, thinPoolStarvation, totalStarvation, deathModes,
      medFreshDays, freshSeriesDays: freshSeries.length,
      tele: layer.tele,
      beats: (layer.tele.beatLines || []).map(b => ({ day: b.day, vid: b.vid, kcal: b.kcal, line: b.line })),
      instrumentErrors,
    };
    const file = path.join(OUTDIR, `${arm}-${policyId}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(row, null, 2) + '\n');
    console.log(`  [${arm} ${policyId} s${seed}] days=${row.gameDays} end=${row.endReason} ` +
      `thinStarv=${thinPoolStarvation} totStarv=${totalStarvation} ` +
      `halves=${layer.tele.halves} grants=${layer.tele.grants} grantedKcal=${layer.tele.grantedKcal} voices=${layer.tele.voices} ` +
      `gatedBurn=${layer.tele.gatedBurn} gatedHunger=${layer.tele.gatedHunger} gatedNoMouth=${layer.tele.gatedNoMouth}`);
    return row;
  } finally {
    if (prev === undefined) delete process.env.SCHOLARDISTSAFE;
    else process.env.SCHOLARDISTSAFE = prev;
  }
}

(async () => {
  assertFreshSeeds();
  // SUBSTRATE ASSERTION (read the Usage header before running): the
  // deathcause-b / scholarbowl-b / scholardist substrate.
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  fs.mkdirSync(OUTDIR, { recursive: true });
  const t0 = Date.now();
  let n = 0, skipped = 0;
  console.log(`sweep subset: seeds=[${RUN_SEEDS}] policies=[${RUN_POLICIES}]`);
  for (const policyId of RUN_POLICIES) {
    for (const seed of RUN_SEEDS) {
      for (const arm of ['control', 'armed']) {
        const existing = path.join(OUTDIR, `${arm}-${policyId}-s${seed}.json`);
        if (fs.existsSync(existing)) { skipped++; continue; } // resume-safe: never redo a finished config
        await runConfig(seed, policyId, arm);
        n++;
      }
    }
  }
  console.log(`\ndone: ${n} configs (+${skipped} resumed) in ${Math.round((Date.now() - t0) / 1000)}s -> ${path.relative(ROOT, OUTDIR)}/`);
})().catch(e => { console.error('SWEEP FAIL: ' + (e && e.stack || e)); process.exitCode = 1; });
