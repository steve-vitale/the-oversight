// test-teleingest.js — proof for scripts/telemetry-check.js --sweep-rows
// (sim-teleingest-a, 2026-10-28). Proves: (1) the tbovertime corpus
// reproduces the worker wall numbers exactly with 8 seed rows and 2
// skipped non-row files and zero ARTIFACT loud lines (a LOUD line whose
// current value is wrong from field-name mismatch or inflated file count);
// (2) a synthetic sweep-row corpus maps every alias and skips decoys;
// (3) the default (non---sweep-rows) path is unchanged.
// Writes only to os.tmpdir. Never touches the scale-wall baseline file:
// the "scale-wall" values below are a mirrored copy of its published
// numbers (national 12, table 16, wins 16, exiled 0), not a read of it,
// so this test stays inside the repo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const CHECK = path.join(__dirname, 'telemetry-check.js');
const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-28', 'perseed-tbovertime-a');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

function runChecker(args) {
  try {
    return { code: 0, stdout: execFileSync('node', [CHECK].concat(args), { encoding: 'utf8' }) };
  } catch (e) {
    return { code: e.status, stdout: (e.stdout || '') + (e.stderr || '') };
  }
}

function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'teleingest-')); }
function writeBase(dir, obj) {
  const p = path.join(dir, 'base.json');
  fs.writeFileSync(p, JSON.stringify(obj));
  return p;
}
// Mirrors the published scale-wall baseline numbers (winseat regime).
const WALL_BASE = { national: 12, table: 16, wins: 16, exiled: 0 };

// 1. TBOVERTIME REPRODUCTION (real corpus, judged numbers).
{
  const dir = tmpDir();
  const base = writeBase(dir, WALL_BASE);
  const out = path.join(dir, 'newbase.json');
  const r = runChecker(['--sweep-rows', '--baseline', base,
    '--current', path.join(CORPUS, '*.json'),
    '--metrics', 'nationalEver,nationalFinal,table,entered,won',
    '--update-baseline', out]);
  const written = JSON.parse(fs.readFileSync(out, 'utf8'));
  check('tbovertime nationalEver 7', written.nationalEver === 7, JSON.stringify(written));
  check('tbovertime nationalFinal 6', written.nationalFinal === 6, JSON.stringify(written));
  check('tbovertime table 4', written.table === 4, JSON.stringify(written));
  check('tbovertime entered 3', written.entered === 3, JSON.stringify(written));
  check('tbovertime won 3', written.won === 3, JSON.stringify(written));
  check('tbovertime wall line shows 7/8 6/8 4/8 3/8 3/8',
    /wall: nationalEver=7\/8 nationalFinal=6\/8 table=4\/8 entered=3\/8 won=3\/8/.test(r.stdout), r.stdout);
  check('tbovertime n=8 seeds, 2 non-row skipped',
    /8 seeds, 2 non-row files skipped/.test(r.stdout), r.stdout);
  // Artifact = a LOUD line with a WRONG current value from schema mismatch
  // (national/wins disappeared to 0). Regime LOUDs (correct values vs a
  // different-regime baseline) are not artifacts and are allowed here.
  const artifact = r.stdout.split('\n').filter(l =>
    /LOUD: (national|wins) disappeared/.test(l) || /\(n=10 files\)/.test(l) || /\(n=9 files\)/.test(l));
  check('tbovertime zero artifact LOUD lines', artifact.length === 0, artifact.join(' | ') || r.stdout);
}

// 1b. OLD COORDINATOR FORM, new mode: bare names alias correctly.
{
  const dir = tmpDir();
  const base = writeBase(dir, WALL_BASE);
  const r = runChecker(['--sweep-rows', '--baseline', base,
    '--current', path.join(CORPUS, '*.json'),
    '--metrics', 'national,table,wins,exiled']);
  check('alias form: no national/wins disappeared lines',
    !/LOUD: (national|wins) disappeared/.test(r.stdout), r.stdout);
  check('alias form: n is seed rows, not files',
    /\(n=8 seed rows\)/.test(r.stdout) || /8 seeds/.test(r.stdout), r.stdout);
}

// 2. SYNTHETIC SWEEP-ROW CORPUS (decoys + alias fallback).
{
  const dir = tmpDir();
  const rows = [
    { seed: 1, nationalEver: 1, nationalFinal: 1, table: 1, entered: 1, won: 1, waveReach: 4 },
    { seed: 2, nationalEver: 1, nationalFinal: 0, table: 1, entered: 0, won: 0, waveReach: 4 },
    { seed: 3, nationalEver: 0, nationalFinal: 0, table: 0, entered: 0, won: 0, waveReach: 3 },
    // Old-schema row: literal national, no nationalEver — alias must fall back.
    { seed: 4, national: 1, table: 0, entered: 0, won: 0, waveReach: 2 },
  ];
  rows.forEach((row, i) => fs.writeFileSync(path.join(dir, 's' + (i + 1) + '.json'), JSON.stringify(row)));
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ seeds: [1, 2, 3, 4], rows }));
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify({ seeds: [1, 2, 3, 4] }));
  // Baseline lives in its own dir: a *.json glob over the corpus dir must
  // see only rows + decoys, never the baseline itself.
  // national baseline 3 (= current) keeps this a quiet run under the
  // unchanged deviation rules (0 -> 3 would LOUD as a new appearance).
  const base = writeBase(tmpDir(), { national: 3, nationalEver: 0, nationalFinal: 0, table: 0, entered: 0, won: 0 });
  const out = path.join(dir, 'newbase.json');
  const r = runChecker(['--sweep-rows', '--baseline', base,
    '--current', path.join(dir, '*.json'),
    '--metrics', 'national,nationalEver,nationalFinal,table,entered,won',
    '--update-baseline', out]);
  const written = JSON.parse(fs.readFileSync(out, 'utf8'));
  // national (alias->nationalEver, fallback literal on seed 4): 1+1+0+1 = 3.
  // nationalEver literal: 1+1+0+0 = 2. nationalFinal: 1. table: 2. entered: 1. won: 1.
  check('synthetic national alias 3', written.national === 3, JSON.stringify(written));
  check('synthetic nationalEver 2', written.nationalEver === 2, JSON.stringify(written));
  check('synthetic nationalFinal 1', written.nationalFinal === 1, JSON.stringify(written));
  check('synthetic table 2 / entered 1 / won 1',
    written.table === 2 && written.entered === 1 && written.won === 1, JSON.stringify(written));
  check('synthetic n=4 seeds, 2 skipped', /4 seeds, 2 non-row files skipped/.test(r.stdout), r.stdout);
  check('synthetic quiet (all currents under LOUD bars)', r.code === 0, 'code=' + r.code + ' ' + r.stdout);
}

// 3. BACKWARD COMPATIBILITY: default mode unchanged on the same corpus.
{
  const dir = tmpDir();
  const rows = [
    { seed: 1, nationalEver: 1, won: 1 },
    { seed: 2, nationalEver: 1, won: 0 },
  ];
  rows.forEach((row, i) => fs.writeFileSync(path.join(dir, 's' + (i + 1) + '.json'), JSON.stringify(row)));
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ seeds: [1, 2] }));
  const base = writeBase(tmpDir(), { national: 5, wins: 5 });
  const r = runChecker(['--baseline', base,
    '--current', path.join(dir, '*.json'), '--metrics', 'national,wins']);
  // Old mode: bare national/wins read literally (no such fields -> 0),
  // and all 3 files count.
  check('old mode still counts every file (n=3 files)',
    /\(n=3 files\)/.test(r.stdout), r.stdout);
  check('old mode still reads bare names literally (disappeared)',
    /LOUD: national disappeared/.test(r.stdout) && /LOUD: wins disappeared/.test(r.stdout), r.stdout);
}

// 4. --update-baseline preserves underscore-prefixed baseline keys.
{
  const dir = tmpDir();
  const base = writeBase(dir, { _regime: { label: 'test-regime' }, w3fights: 0 });
  const cur = path.join(dir, 'cur.json');
  const out = path.join(dir, 'new.json');
  fs.writeFileSync(cur, JSON.stringify({ w3fights: [1, 2] }));
  runChecker(['--baseline', base, '--current', cur, '--metrics', 'w3fights', '--update-baseline', out]);
  const written = JSON.parse(fs.readFileSync(out, 'utf8'));
  check('update-baseline preserves _regime', written._regime && written._regime.label === 'test-regime', JSON.stringify(written));
  check('update-baseline still writes aggregates', written.w3fights === 2, JSON.stringify(written));
}

// 5. --sweep-rows with no seed rows is a loud failure, not a silent zero.
{
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ seeds: [1] }));
  const base = writeBase(dir, { national: 0 });
  const r = runChecker(['--sweep-rows', '--baseline', base,
    '--current', path.join(dir, '*.json'), '--metrics', 'national']);
  check('sweep-rows with no rows LOUDs and exits 1',
    r.code === 1 && /no seed rows/.test(r.stdout), 'code=' + r.code + ' ' + r.stdout);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
