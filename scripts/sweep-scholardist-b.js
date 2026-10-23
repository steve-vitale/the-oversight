#!/usr/bin/env node
// sweep-scholardist-b.js — pilot sweep for the scholar's share layer.
//
// 8 seeds (67401–67408 — the INTENTIONAL paired reuse of scholarbowl-b's
// corpus, task-mandated: identical seeds = paired before/after; base moved
// e32d4e8c4 -> b7160b82f so the pairing is within-run control-vs-armed) x
// {leadfeast, belongfeast} x {control, armed} = 32 configs, paired identical
// seeds, 180d death-aware horizons (runDays stops on Game.over).
// Substrate: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b / poolscholar-b
// / thindefer-b / scholarbowl-b substrate — the substrate the pool-thickness
// theory was measured on).
//
// Emits per-seed JSONs to evidence/2026-10-22/perseed-scholardist-b/ in the
// scholarbowl-b schema: seed, policy, arm, anchor, days, gameDays, endReason,
// national, table, exiled, won, maxWave, communityLost, deaths[{day, who,
// vid, cause, pclass, player, deathDayFreshDays, thinPool}],
// thinPoolStarvation, totalStarvation, deathModes, medFreshDays,
// freshSeriesDays, tele, beats, instrumentErrors.
//
// The pre-registration header lives in evidence/2026-10-22/sim-scholardist-b.md
// (written BEFORE any sims). This script judges nothing — the manual
// paired-row comparison judges (panel is descriptive-by-construction for the
// env-gated lever, sim-findings.md #796).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { stdSnapshot, POLICY_REGISTRY } = require('./sweep-compare');
const scholardist = require('./layers/scholardist-b');

const SEEDS = [67401, 67402, 67403, 67404, 67405, 67406, 67407, 67408];
const POLICIES = ['leadfeast', 'belongfeast'];
// Parallel-split support: SEED_FILTER="67401,67402" and/or
// POLICY_FILTER="leadfeast" restrict the sweep to a disjoint subset (two
// processes share OUTDIR resume-safely; files are per (arm,policy,seed)).
const SEED_FILTER = process.env.SEED_FILTER ? process.env.SEED_FILTER.split(',').map(s => +s.trim()) : null;
const POLICY_FILTER = process.env.POLICY_FILTER ? process.env.POLICY_FILTER.split(',').map(s => s.trim()) : null;
const RUN_SEEDS = SEED_FILTER ? SEEDS.filter(s => SEED_FILTER.includes(s)) : SEEDS;
const RUN_POLICIES = POLICY_FILTER ? POLICIES.filter(p => POLICY_FILTER.includes(p)) : POLICIES;
const DAYS = 180;
const OUTDIR = path.join(ROOT, 'evidence', '2026-10-22', 'perseed-scholardist-b');

// SEED-FRESHNESS with the mandated paired-reuse allow-list: seeds
// 67401–67408 are INTENTIONALLY reused from scholarbowl-b (identical seeds =
// paired before/after). The check allow-lists the scholarbowl-b arm files
// (and this arm's own files) and still fails on any other hit — accidental
// reuse anywhere else would silently correlate trajectories.
function assertFreshSeeds() {
  const hits = [];
  const scanDirs = ['scripts', 'src', 'docs'].map(d => path.join(ROOT, d));
  const own = new Set(['sweep-scholardist-b.js', 'test-scholardist-b.js', 'scholardist-b.js',
    'build-scholardist-panel.js', 'analyze-scholardist-b.js', 'sense-scholardist-b.js',
    // mandated paired reuse from the scholarbowl-b arm:
    'sweep-scholarbowl-b.js', 'test-scholarbowl-b.js', 'scholarbowl-b.js',
    'build-scholarbowl-panel.js', 'analyze-scholarbowl-b.js', 'sense-scholarbowl-b.js']);
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const f = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name === 'node_modules') continue; walk(f); continue; }
      if (!/\.(js|json|md)$/.test(f)) continue;
      if (own.has(e.name)) continue;
      let text = '';
      try { text = fs.readFileSync(f, 'utf8'); } catch (err) { continue; }
      for (const s of SEEDS) {
        if (text.includes(String(s))) hits.push(path.relative(ROOT, f) + ':' + s);
      }
    }
  }
  scanDirs.forEach(walk);
  if (hits.length) throw new Error('SEED FRESHNESS FAIL — seeds already used in: ' + hits.join(', '));
  console.log('seed freshness: 8/8 fresh outside the allow-listed scholarbowl-b paired-reuse files');
}

function anchor() {
  try { return execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); }
  catch (e) { return 'unknown'; }
}

// Mechanism-class death taxonomy (thindefer-b metric review #3: g3 must be
// pre-registered at the mechanism-class level, not the monster-name level).
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
  const prev = process.env.SCHOLARDIST;
  if (armed) process.env.SCHOLARDIST = '1'; else delete process.env.SCHOLARDIST;
  try {
    const { Game, manifest } = await loadGame({ seed, mode: 'scholardist-b-' + arm });
    await setupGame(Game, 'Columbus, Ohio');
    const layer = scholardist.install(Game);
    // daily hook: fresh-days series (end-of-day, before sleep) + wall history
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

    // deaths: live-captured, join death-day fresh-days on nearest series
    // entry with series.day <= death.day (the series can skip a day)
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
      `halves=${layer.tele.halves} grants=${layer.tele.grants} grantedKcal=${layer.tele.grantedKcal} voices=${layer.tele.voices}`);
    return row;
  } finally {
    if (prev === undefined) delete process.env.SCHOLARDIST;
    else process.env.SCHOLARDIST = prev;
  }
}

(async () => {
  assertFreshSeeds();
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
