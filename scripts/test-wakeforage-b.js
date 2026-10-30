#!/usr/bin/env node
// test-wakeforage-b.js — proof for sim-wakeforage-b (prereg:
// evidence/2026-10-30/sim-wakeforage-b-prereg.md, as amended
// pre-leg). File-based checks over the fresh censuses +
// replay joins + determinism re-runs. No game code, no sims
// run here (legs are run by the driver scripts first).
// Usage: node scripts/test-wakeforage-b.js
// Exits non-zero on any failed check; prints PASS/FAIL lines.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const E = path.join(__dirname, '..', 'evidence', '2026-10-30');
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name + (detail !== undefined ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' — ' + detail : '')); }
}
function eqPerSeed(a, b, field) {
  const keys = Object.keys(a.perSeed || {}).sort();
  if (JSON.stringify(keys) !== JSON.stringify(Object.keys(b.perSeed || {}).sort())) return false;
  for (const k of keys) if ((a.perSeed[k][field] || 0) !== (b.perSeed[k][field] || 0)) return false;
  return true;
}

const baseGuard = J(path.join(E, 'sim-wakeforage-b-census-base-guard.json'));
const baseOn = J(path.join(E, 'sim-wakeforage-b-census-base-on.json'));
const recGuard = J(path.join(E, 'sim-wakeforage-b-census-guard.json'));
const recOn = J(path.join(E, 'sim-wakeforage-b-census-on.json'));
const det = J(path.join(E, 'sim-wakeforage-b-census-determinism.json'));

// Baselines: 10 seeds, all survived 30 days, walktree-shape counts
for (const [nm, c] of [['base-guard', baseGuard], ['base-on', baseOn], ['rec-guard', recGuard], ['rec-on', recOn]]) {
  check(nm + ' 10 seeds', c.seeds === 10, 'seeds=' + c.seeds);
  check(nm + ' all survived 30d', Object.values(c.perSeed).every((s) => s.daysAlive === 30), JSON.stringify(Object.fromEntries(Object.entries(c.perSeed).map(([k, v]) => [k, v.daysAlive]))));
}
// Equivalence: recorder == fresh baseline per-seed creek/still/rescued
for (const [nm, base, rec] of [['guard', baseGuard, recGuard], ['on', baseOn, recOn]]) {
  check('equivalence ' + nm + ' creek', eqPerSeed(base, rec, 'creek'), JSON.stringify(base.perSeed) + ' vs ' + JSON.stringify(rec.perSeed));
  check('equivalence ' + nm + ' still', eqPerSeed(base, rec, 'still'), '');
  check('equivalence ' + nm + ' rescued', eqPerSeed(base, rec, 'rescued'), '');
  check('equivalence ' + nm + ' totals', base.creekEvenings === rec.creekEvenings && base.stillRefused === rec.stillRefused && base.rescued === rec.rescued,
    'base ' + base.creekEvenings + '/' + base.stillRefused + '/' + base.rescued + ' rec ' + rec.creekEvenings + '/' + rec.stillRefused + '/' + rec.rescued);
}
check('guard warmth acted 0', recGuard.warmActed === 0 && baseGuard.warmActed === 0, 'rec=' + recGuard.warmActed + ' base=' + baseGuard.warmActed);
check('recorder errors 0 both legs', recGuard.recorderErrors === 0 && recOn.recorderErrors === 0, 'guard=' + recGuard.recorderErrors + ' on=' + recOn.recorderErrors);
// Determinism: 15003 ON recorder re-run census equals judged ON census
// (compared on non-yield fields only: the determinism census is
// generated without a replay join, so its mornings carry no yield).
{
  const strip = (m) => ({ seed: m.seed, loopDay: m.loopDay, wakeTile: m.wakeTile, wakeTileType: m.wakeTileType,
    wake: m.wake, morningKcal: m.morningKcal, morningWood: m.morningWood, grid: m.grid,
    sweepCells: m.sweepCells, forageableCells: m.forageableCells });
  check('determinism 15003 ON census equal', JSON.stringify(det.perSeed['15003']) === JSON.stringify(recOn.perSeed['15003']) &&
    JSON.stringify(det.mornings.filter((m) => m.seed === 15003).map(strip)) === JSON.stringify(recOn.mornings.filter((m) => m.seed === 15003).map(strip)),
    'det-seed15003 vs rec-seed15003');
}
// Coverage: every field morning has a press yield, no aborts, no snap mismatches
for (const [nm, c] of [['guard', recGuard], ['on', recOn]]) {
  const field = c.mornings.filter((m) => m.wakeTileType !== 'haven');
  const withYield = field.filter((m) => m.yield && m.yield.mode === 'press');
  check(nm + ' yield complete 100% field', withYield.length === field.length, withYield.length + '/' + field.length);
  check(nm + ' no press aborts', field.filter((m) => m.yield && m.yield.mode === 'press-aborted').length === 0, '');
  check(nm + ' no control mismatches', c.totals.controlMismatch === 0, 'mismatch=' + c.totals.controlMismatch);
  check(nm + ' no press mismatches', c.totals.pressMismatch === 0, 'mismatch=' + c.totals.pressMismatch);
  // E cross-check: E == sum over added items edible units*kcalEach
  let eOk = true, eDetail = '';
  for (const m of withYield) {
    const sum = (m.yield.addedItems || []).filter((it) => it.plantId && it.edible === true)
      .reduce((a, it) => a + (it.units || 0) * (it.kcalEach || 0), 0);
    if (sum !== m.yield.E) { eOk = false; eDetail = 'seed ' + m.seed + ' day ' + m.loopDay + ' E ' + m.yield.E + ' sum ' + sum; }
  }
  check(nm + ' E == added-items sum', eOk, eDetail);
  // Verdict arithmetic cross-check on one row per leg is covered by
  // full re-computation below.
  let vOk = true, vDetail = '';
  for (const m of withYield) {
    const y = m.yield;
    if (y.dayNeed !== (y.E >= 2200)) { vOk = false; vDetail = 'dayNeed seed ' + m.seed + ' day ' + m.loopDay; }
    if (y.selfFunding !== (y.E >= 60)) { vOk = false; vDetail = 'selfFunding seed ' + m.seed + ' day ' + m.loopDay; }
    if (y.bridgeCovering !== (m.morningKcal - 60 + y.E >= 60)) { vOk = false; vDetail = 'bridge seed ' + m.seed + ' day ' + m.loopDay; }
    if (y.yStar !== null && y.yStarCover !== (y.E >= y.yStar)) { vOk = false; vDetail = 'yStar seed ' + m.seed + ' day ' + m.loopDay; }
    if (y.yStar !== null && y.walkKcal !== null && y.yStar !== (y.walkKcal + 200 - m.morningKcal)) { vOk = false; vDetail = 'yStar formula seed ' + m.seed + ' day ' + m.loopDay + ' yStar ' + y.yStar + ' walkKcal ' + y.walkKcal + ' morningKcal ' + m.morningKcal; }
  }
  check(nm + ' verdict arithmetic recomputed', vOk, vDetail);
  // Sweep sense check: every press morning's sweep cells are all
  // within Chebyshev <= 1 of the wake cell (3x3 scope, no list feed)
  let sOk = true;
  for (const m of field) {
    const [wx, wy] = m.wake || [null, null];
    for (const c of (m.sweepCells || [])) {
      if (Math.max(Math.abs(c.x - wx), Math.abs(c.y - wy)) > 1) sOk = false;
    }
  }
  check(nm + ' all sweep cells within 3x3 of wake', sOk, '');
  // Press say line present on every press morning (narration, not silent)
  check(nm + ' press narration present', withYield.every((m) => (m.yield.pressSay || []).length > 0), '');
}
// Press determinism: re-run file byte-identical to judged press file
{
  const detDir = path.join(E, 'sim-wakeforage-b-corpus-replay-determinism');
  const repDir = path.join(E, 'sim-wakeforage-b-corpus-replay');
  const detFiles = fs.existsSync(detDir) ? fs.readdirSync(detDir).filter((f) => f.endsWith('.json')).sort() : [];
  check('press determinism file exists', detFiles.length >= 1, 'files=' + detFiles.length);
  for (const f of detFiles) {
    const a = fs.readFileSync(path.join(detDir, f), 'utf8');
    const bPath = path.join(repDir, f);
    check('press determinism byte-identical ' + f, fs.existsSync(bPath) && fs.readFileSync(bPath, 'utf8') === a, fs.existsSync(bPath) ? 'exists, equal=' + (fs.readFileSync(bPath, 'utf8') === a) : 'missing judged file');
  }
}
// Instrument hygiene: recorder never calls a state verb; replay
// presses forage exactly once (in the PRESS branch).
{
  const recSrc = fs.readFileSync(path.join(__dirname, 'wakeforage-trace-b.js'), 'utf8');
  check('recorder has no verb calls', !/\.(doAction|microMove|cutTree|clearBrush)\s*\(/.test(recSrc), '');
  const repSrc = fs.readFileSync(path.join(__dirname, 'wakeforage-replay-b.js'), 'utf8');
  const presses = (repSrc.match(/\.doAction\('forage'\)/g) || []).length;
  check('replay presses forage exactly once in source', presses === 1, 'count=' + presses);
}
// Tracked diff guard: src/ and scripts/policies/ unchanged vs HEAD
{
  let diffOut = '';
  try { diffOut = execSync('git diff --name-only -- src scripts/policies', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim(); } catch (e) { diffOut = 'GIT-ERROR'; }
  check('src/ + scripts/policies/ diff empty', diffOut === '', diffOut || '(empty)');
}
console.log('wakeforage proof: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
