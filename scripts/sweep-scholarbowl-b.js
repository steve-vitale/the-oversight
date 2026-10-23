#!/usr/bin/env node
// sweep-scholarbowl-b.js — pilot sweep for the scholar's bowl layer.
//
// 8 fresh seeds (67401–67408, inline filename-freshness assertion below) x
// {leadfeast, belongfeast} x {control, armed} = 32 configs, paired identical
// seeds, 180d death-aware horizons (runDays stops on Game.over).
// Substrate: FEASTSCALE_R13=1 / SEATDRIVE=0 (the deathcause-b / poolscholar-b
// / thindefer-b substrate — the substrate the pool-thickness theory was
// measured on).
//
// Emits per-seed JSONs to evidence/2026-10-22/perseed-scholarbowl-b/ in the
// thindefer-b schema: seed, policy, arm, anchor, days, gameDays, endReason,
// national, table, exiled, won, maxWave, communityLost, deaths[{day, who,
// vid, cause, pclass, player, deathDayFreshDays, thinPool}],
// thinPoolStarvation, totalStarvation, deathModes, medFreshDays,
// freshSeriesDays, tele, beats, instrumentErrors.
//
// The pre-registration header lives in evidence/2026-10-22/sim-scholarbowl-b.md
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
const scholarbowl = require('./layers/scholarbowl-b');

const SEEDS = [67401, 67402, 67403, 67404, 67405, 67406, 67407, 67408];
const POLICIES = ['leadfeast', 'belongfeast'];
const DAYS = 180;
const OUTDIR = path.join(ROOT, 'evidence', '2026-10-22', 'perseed-scholarbowl-b');

// INLINE SEED-FRESHNESS ASSERTION (the filename criterion): the pilot seeds
// must not appear as content anywhere in the repo's scripts/src/docs —
// substring greps that hit only numeric kcal values elsewhere are fine, but
// any seed usage of these numbers would silently reuse a run's trajectory.
function assertFreshSeeds() {
  const hits = [];
  const scanDirs = ['scripts', 'src', 'docs'].map(d => path.join(ROOT, d));
  const own = new Set(['sweep-scholarbowl-b.js', 'test-scholarbowl-b.js', 'scholarbowl-b.js',
    'build-scholarbowl-panel.js', 'analyze-scholarbowl-b.js']);
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
  console.log('seed freshness: 8/8 fresh (no prior repo content)');
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
  const prevScholarBowl = process.env.SCHOLARBOWL;
  if (armed) process.env.SCHOLARBOWL = '1'; else delete process.env.SCHOLARBOWL;
  try {
    const { Game, manifest } = await loadGame({ seed, mode: 'scholarbowl-b-' + arm });
    await setupGame(Game, 'Columbus, Ohio');
    const layer = scholarbowl.install(Game);
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
      beats: (layer.tele.beatLines || []).map(b => ({ day: b.day, line: b.line })),
      instrumentErrors,
    };
    const file = path.join(OUTDIR, `${arm}-${policyId}-s${seed}.json`);
    fs.writeFileSync(file, JSON.stringify(row, null, 2) + '\n');
    console.log(`  [${arm} ${policyId} s${seed}] days=${row.gameDays} end=${row.endReason} ` +
      `thinStarv=${thinPoolStarvation} totStarv=${totalStarvation} ` +
      `halves=${layer.tele.halves} saved=${layer.tele.savedKcal} voices=${layer.tele.voices}`);
    return row;
  } finally {
    if (prevScholarBowl === undefined) delete process.env.SCHOLARBOWL;
    else process.env.SCHOLARBOWL = prevScholarBowl;
  }
}

(async () => {
  assertFreshSeeds();
  process.env.FEASTSCALE_R13 = '1';
  process.env.SEATDRIVE = '0';
  fs.mkdirSync(OUTDIR, { recursive: true });
  const t0 = Date.now();
  let n = 0, skipped = 0;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
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
