#!/usr/bin/env node
// sweep-prodstore-pilot-a.js — PILOT for the PLENTY-WEEK lever (sim-prodstore-a,
// 2026-11-07, axis food-economy). Derived from scripts/sweep-prodstore-diag-a.js
// with the guard INVERTED: this sweep REQUIRES PRODSTORE_LEVER=1 (armed) and
// writes to evidence/2026-11-07/prodstore-a-corpus-armed/. Same 8 seeds
// (96201-96208), same competent policy, same 150d death-aware horizon, same
// PLENTYDEPRI=1 / DEPOSITGATE=1 — the ONLY difference from the Phase-A baseline
// corpus is the lever. Per-seed files are named identically
// (prodstore-a-competent-s<seed>.json) so the analyzer runs unchanged on either
// corpus dir. The diagnosis sweep's FATAL guard (lever must be unset) stays in
// the diagnosis sweep; this file is the armed twin.
//
// GO bar (prereg amendment, binding): starvation deaths <= 1 AND median
// survival >= 92.4d (baseline: 3 deaths, 115.5d). Judged by the analyzer
// output + the evidence file, never by this sweep.
//
// REVERTED POST-KILL (sim-prodstore-a, 2026-11-07): the pilot NO-GO'd
// (starvation 2 vs bar ≤1; CONCEPT-DEAD as a standalone lever — see
// evidence/2026-11-07/sim-prodstore-a.md) and the lever hunk was reverted
// from src/js/game.js, so PRODSTORE_LEVER=1 no longer changes anything:
// re-running this sweep now measures the BASELINE, not the armed lever.
// Do not re-run as an armed pilot. The armed corpus is preserved at
// evidence/2026-11-07/prodstore-a-corpus-armed/ and the lever as measured
// lives in the branch history (commit 471ced6d8).
'use strict';
const fs = require('fs');
const path = require('path');
const { oneRun, writeRobust } = require('./sweep-prodstore-diag-a.js');

if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
  if (require.main === module) {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
}
if (process.env.PRODSTORE_LEVER !== '1' && require.main === module) {
  console.error('FATAL: PRODSTORE_LEVER=1 is required for the pilot sweep (this run measures the ARMED lever)');
  process.exit(2);
}
const SEEDS = (process.env.SEEDS || '')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const BATCH_PILOT = [96201, 96202, 96203, 96204, 96205, 96206, 96207, 96208];
const BATCH_CONFIRM = [96209, 96210, 96211, 96212, 96213, 96214, 96215, 96216,
  96217, 96218, 96219, 96220, 96221, 96222, 96223, 96224];
const BAND = process.env.BAND || 'pilot';
const BATCH = BAND === 'confirm' ? BATCH_CONFIRM : BATCH_PILOT;
const isList = (list) => SEEDS.length === list.length && SEEDS.every((s, i) => s === list[i]);
const DAYS = parseInt(process.env.DAYS || '', 10);
const CORPUS_SUBDIR = BAND === 'confirm' ? 'prodstore-a-corpus-armed-confirm' : 'prodstore-a-corpus-armed';
const OUT = process.env.OUT || path.join(
  __dirname, '..', 'evidence', '2026-11-07', CORPUS_SUBDIR, 'sweep-competent.json');
const PERSEED_DIR = process.env.PERSEED_DIR || path.join(
  __dirname, '..', 'evidence', '2026-11-07', CORPUS_SUBDIR);

if (require.main === module) (async () => {
  if (process.env.PLENTYDEPRI !== '1' || process.env.DEPOSITGATE !== '1') {
    console.error('FATAL: PLENTYDEPRI=1 and DEPOSITGATE=1 must both be set explicitly (shipped defaults, explicit)');
    process.exit(2);
  }
  if (process.env.PRODSTORE_LEVER !== '1') {
    console.error('FATAL: PRODSTORE_LEVER=1 is required for the pilot sweep (this run measures the ARMED lever)');
    process.exit(2);
  }
  if (!isList(BATCH)) {
    console.error('FATAL: seeds must be exactly ' + BATCH.join('-') + ' (BAND=' + BAND + '), got: ' + (process.env.SEEDS || '(unset)'));
    process.exit(2);
  }
  if (DAYS !== 150) {
    console.error('FATAL: DAYS must be exactly 150, got: ' + (process.env.DAYS || '(unset)'));
    process.exit(2);
  }
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, perSeed, diag } = await oneRun(seed, DAYS);
    perSeed.prodstoreLever = 1;
    rows.push({ seed: s, perSeed, diag });
    try { fs.mkdirSync(PERSEED_DIR, { recursive: true }); }
    catch (e) { console.error('MKDIR FAIL LOUDLY', PERSEED_DIR, e.message); process.exit(2); }
    writeRobust(path.join(PERSEED_DIR, `prodstore-a-competent-s${s}.json`),
      JSON.stringify(perSeed));
    console.log(`done seed=${s} days=${perSeed.daysAlive} end=${diag.endReason} rank=${diag.rank} wave=${diag.maxWave} deaths=${diag.deathRowCount} meals=${diag.mealRowCount} won=${perSeed.win} (${diag.ms}ms)`);
  }
  try { fs.mkdirSync(require('path').dirname(OUT), { recursive: true }); }
  catch (e) { console.error('MKDIR FAIL LOUDLY', OUT, e.message); process.exit(2); }
  let merged = rows;
  try {
    if (fs.existsSync(OUT)) {
      const prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      const bySeed = new Map();
      for (const r of (prev.rows || [])) bySeed.set(r.seed, r);
      for (const r of rows) bySeed.set(r.seed, r);
      merged = [...bySeed.values()].sort((a, b) => a.seed - b.seed);
    }
  } catch (e) { console.error('SUMMARY MERGE FAIL', OUT, e.message); process.exit(2); }
  const allSeeds = merged.map(r => r.seed).sort((a, b) => a - b);
  writeRobust(OUT, JSON.stringify({ meta: { cell: 'competent', policy: 'competent', days: DAYS, seeds: allSeeds, env: { PLENTYDEPRI: '1', DEPOSITGATE: '1', PRODSTORE_LEVER: '1' } }, rows: merged }));
  console.log('wrote ' + OUT + ' (' + merged.length + ' rows)');
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });

module.exports = { BATCH, DAYS };
