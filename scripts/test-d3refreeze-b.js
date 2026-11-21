// Proof test for sim-d3refreeze-b — the D3 re-freeze + re-judge.
//
// The corrected first-lever-day bound (frozen in
// evidence/2026-11-21/sim-d3refreeze-b-prereg.md, finding #2639) is the
// first needWave>=4 pool row on the ON leg. The OLD bound (first
// world-tick v4 seed row) was proven non-conservative on seed 106751:
// the lever acted day 74 while the first world-tick row is day 111.
// This test proves the bound change BEFORE the judged D3 re-run:
//   (a) old bound computes 111 for 106751, corrected bound computes 74;
//   (b) the old check flags 106751 DRIFT, the corrected check calls it CLEAN;
//   (c) the corrected per-seed bound table matches the frozen table (16 seeds);
//   (d) the verdict logic on synthetic corpora (CLEAN / DRIFT / IDENTICAL /
//       null-bound + divergence);
//   (e) the refreeze drift check is a copy of the confirm check with ONLY
//       firstLeverDay changed (diff, ignoring comment lines);
//   (f) the confirm corpora are unmodified in git status (read-only);
//   (g) no src/ change in this arm.
// Pure re-analysis: no sims, no game load, no writes into the corpora.
// Usage: node scripts/test-d3refreeze-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OFFDIR = path.join(ROOT, 'evidence/2026-11-21/perseed-profilegate4-confirm-b-off');
const ONDIR = path.join(ROOT, 'evidence/2026-11-21/perseed-profilegate4-confirm-b-on');
const OLD_CHECK = path.join(ROOT, 'scripts/profilegate4-confirm-b-drift-check.js');
const NEW_CHECK = path.join(ROOT, 'scripts/profilegate4-d3refreeze-b-drift-check.js');
const PREREG = path.join(ROOT, 'evidence/2026-11-21/sim-d3refreeze-b-prereg.md');

// Frozen per-seed corrected bound (first needWave>=4 pool row on the ON
// leg; fallback: first companion2 depart; null = neither exists), from
// the prereg's pre-freeze verification. 106765 has no pool row — its
// bound 94 comes from the day-94 v4departs row (nina_petrova's herald
// launch, companion2 nikos_papadopoulos).
const FROZEN_BOUND = {
  106751: 74, 106752: 62, 106753: 44, 106754: 63, 106755: 87, 106756: null,
  106757: 103, 106758: null, 106759: 97, 106760: null, 106761: 148,
  106762: null, 106763: 55, 106764: 64, 106765: 94, 106766: null,
};
// Frozen old bound for 106751 (first world-tick v4 seed row).
const FROZEN_OLD_106751 = 111;

let passed = 0, failed = 0;
const failures = [];
function check(name, ok, detail) {
  if (ok) { passed++; }
  else { failed++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

function runCheck(script, offDir, onDir) {
  const r = cp.spawnSync(process.execPath, [script, offDir, onDir], { encoding: 'utf8', timeout: 120000 });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}
function parseLines(stdout) {
  const out = {};
  for (const line of stdout.split('\n')) {
    const m = line.match(/^(\d+): firstLeverDay=(\d+|null) firstDivDay=(\d+|null) -> (.*)$/);
    if (m) out[m[1]] = { leverDay: m[2] === 'null' ? null : Number(m[2]), firstDiv: m[3] === 'null' ? null : Number(m[3]), verdict: m[4] };
  }
  return out;
}

// ---- (a)+(b) old vs corrected bound on seed 106751, real corpora ----
const oldRun = runCheck(OLD_CHECK, OFFDIR, ONDIR);
const newRun = runCheck(NEW_CHECK, OFFDIR, ONDIR);
const oldLines = parseLines(oldRun.stdout);
const newLines = parseLines(newRun.stdout);
check('old check exits nonzero (106751 DRIFT)', oldRun.status === 1, 'status=' + oldRun.status);
check('old bound computes 111 for 106751', oldLines['106751'] && oldLines['106751'].leverDay === FROZEN_OLD_106751,
  'got ' + (oldLines['106751'] && oldLines['106751'].leverDay));
check('old check flags 106751 DRIFT (div 75 < 111)', oldLines['106751'] && /^DRIFT/.test(oldLines['106751'].verdict),
  'got ' + (oldLines['106751'] && oldLines['106751'].verdict));
check('old check firstDivDay 75 for 106751', oldLines['106751'] && oldLines['106751'].firstDiv === 75,
  'got ' + (oldLines['106751'] && oldLines['106751'].firstDiv));
check('corrected check exits nonzero (2 expected DRIFT seeds)', newRun.status === 1, 'status=' + newRun.status);
check('corrected bound computes 74 for 106751', newLines['106751'] && newLines['106751'].leverDay === 74,
  'got ' + (newLines['106751'] && newLines['106751'].leverDay));
check('corrected check calls 106751 CLEAN (div 75 >= 74)', newLines['106751'] && /^CLEAN/.test(newLines['106751'].verdict),
  'got ' + (newLines['106751'] && newLines['106751'].verdict));
check('old check says NO PRE-LEVER DRIFT is absent (it reports DRIFT SEEDS)',
  /DRIFT SEEDS: 1/.test(oldRun.stdout), 'stdout tail: ' + oldRun.stdout.trim().split('\n').slice(-1)[0]);

// ---- (c) corrected per-seed bound table matches the frozen table ----
let boundOk = true, boundDetail = '';
for (const seed of Object.keys(FROZEN_BOUND).sort()) {
  const got = newLines[seed] ? newLines[seed].leverDay : undefined;
  if (got !== FROZEN_BOUND[seed]) { boundOk = false; boundDetail += seed + ': got ' + got + ', frozen ' + FROZEN_BOUND[seed] + '; '; }
}
check('corrected per-seed bound table matches frozen table (16 seeds)', boundOk, boundDetail);
check('corrected check covers all 16 seeds', Object.keys(newLines).length === 16, 'got ' + Object.keys(newLines).length);
// The two seeds the prereg predicts DRIFT under the frozen pool-row bound.
check('106759 DRIFT under corrected bound (div 96 < pool 97)', newLines['106759'] && /^DRIFT/.test(newLines['106759'].verdict),
  'got ' + (newLines['106759'] && newLines['106759'].verdict));
check('106764 DRIFT under corrected bound (div 56 < pool 64)', newLines['106764'] && /^DRIFT/.test(newLines['106764'].verdict),
  'got ' + (newLines['106764'] && newLines['106764'].verdict));
check('106765 CLEAN under corrected bound (fallback bound 94, div 95)', newLines['106765'] && /^CLEAN/.test(newLines['106765'].verdict),
  'got ' + (newLines['106765'] && newLines['106765'].verdict));
check('106765 bound resolves via companion2-depart fallback (94, not null)',
  newLines['106765'] && newLines['106765'].leverDay === 94,
  'got ' + (newLines['106765'] && newLines['106765'].leverDay));
check('corrected check reports DRIFT SEEDS: 2', /DRIFT SEEDS: 2/.test(newRun.stdout),
  'stdout tail: ' + newRun.stdout.trim().split('\n').slice(-1)[0]);

// ---- (d) verdict logic on synthetic corpora ----
function dayRow(day, wkl) {
  return { day: day, roster: [{ vid: 'a', dead: false }, { vid: 'b', dead: false }],
    waveKillLog: (wkl || []).map(function (m) { return { vid: '?', w: 1, mid: m }; }),
    wave4Slain: 0, vetsW3: { count: 0 }, vetsW4: { count: 0 },
    ready4: { ready: false }, ready5: { ready: false } };
}
function synthCase(dir, opts) {
  // opts: { divDay (null = identical), poolDay (null = no pool row), departDay }
  const off = { seed: 900001, daily: [dayRow(1), dayRow(2), dayRow(3), dayRow(4), dayRow(5), dayRow(6), dayRow(7), dayRow(8), dayRow(9), dayRow(10)],
    companionPool: [], v4departs: [], dawnbidDeparts: [] };
  const on = JSON.parse(JSON.stringify(off));
  if (opts.divDay != null) {
    const row = on.daily.find(function (d) { return d.day === opts.divDay; });
    row.waveKillLog = [{ vid: '?', w: 1, mid: 'extra_kill' }];
  }
  if (opts.poolDay != null) on.companionPool = [{ day: opts.poolDay, needWave: 4 }];
  if (opts.departDay != null) on.dawnbidDeparts = [{ day: opts.departDay, companion2: 'x' }];
  fs.mkdirSync(path.join(dir, 'off'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'on'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'off', 's900001-off.json'), JSON.stringify(off));
  fs.writeFileSync(path.join(dir, 'on', 's900001-on.json'), JSON.stringify(on));
  return runCheck(NEW_CHECK, path.join(dir, 'off'), path.join(dir, 'on'));
}
const TMP = '/tmp/d3refreeze-b-fixtures';
cp.execSync('rm -rf ' + TMP);
const cClean = synthCase(path.join(TMP, 'clean'), { divDay: 10, poolDay: 9 });
check('synthetic CLEAN: div 10 >= pool 9, exit 0', cClean.status === 0 && /CLEAN/.test(cClean.stdout),
  'status=' + cClean.status + ' out=' + cClean.stdout.trim());
const cDrift = synthCase(path.join(TMP, 'drift'), { divDay: 5, poolDay: 9 });
check('synthetic DRIFT: div 5 < pool 9, exit 1', cDrift.status === 1 && /DRIFT/.test(cDrift.stdout),
  'status=' + cDrift.status + ' out=' + cDrift.stdout.trim());
const cIdent = synthCase(path.join(TMP, 'ident'), { divDay: null, poolDay: 9 });
check('synthetic IDENTICAL: no divergence, exit 0', cIdent.status === 0 && /IDENTICAL/.test(cIdent.stdout),
  'status=' + cIdent.status + ' out=' + cIdent.stdout.trim());
const cNullDrift = synthCase(path.join(TMP, 'nulldrift'), { divDay: 5, poolDay: null });
check('synthetic null-bound + divergence = DRIFT, exit 1', cNullDrift.status === 1 && /DRIFT/.test(cNullDrift.stdout),
  'status=' + cNullDrift.status + ' out=' + cNullDrift.stdout.trim());
const cNullIdent = synthCase(path.join(TMP, 'nullident'), { divDay: null, poolDay: null });
check('synthetic null-bound, no divergence = IDENTICAL, exit 0', cNullIdent.status === 0 && /IDENTICAL/.test(cNullIdent.stdout),
  'status=' + cNullIdent.status + ' out=' + cNullIdent.stdout.trim());
const cFallback = synthCase(path.join(TMP, 'fallback'), { divDay: 8, poolDay: null, departDay: 7 });
check('synthetic fallback: no pool row, companion2 depart day 7, div 8 = CLEAN',
  cFallback.status === 0 && /CLEAN/.test(cFallback.stdout),
  'status=' + cFallback.status + ' out=' + cFallback.stdout.trim());

// ---- (e) refreeze drift check is a copy with ONLY firstLeverDay changed ----
function stripComments(src) {
  return src.split('\n').filter(function (l) { return !/^\s*\/\//.test(l); }).join('\n');
}
const oldSrc = fs.readFileSync(OLD_CHECK, 'utf8');
const newSrc = fs.readFileSync(NEW_CHECK, 'utf8');
const oldCode = stripComments(oldSrc).split('\n');
const newCode = stripComments(newSrc).split('\n');
const oldSet = new Set(oldCode), newSet = new Set(newCode);
const removed = oldCode.filter(function (l) { return !newSet.has(l); });
const added = newCode.filter(function (l) { return !oldSet.has(l); });
check('copy-diff: only the firstLeverDay scan lines differ (code, comments stripped)',
  removed.length === 2 && added.length === 2 &&
  removed[0].indexOf("a.v4seeds") !== -1 && removed[1].indexOf("world-tick") !== -1 &&
  added[0].indexOf("a.companionPool") !== -1 && added[1].indexOf("needWave") !== -1,
  'removed=' + JSON.stringify(removed) + ' added=' + JSON.stringify(added));
check('copy-diff: fingerprint function identical', newSrc.indexOf(oldSrc.slice(oldSrc.indexOf('function fp('), oldSrc.indexOf('function firstLeverDay'))) !== -1);
check('copy-diff: verdict loop identical',
  newSrc.indexOf("const verdict = firstDiv == null ? 'IDENTICAL'") !== -1 &&
  newSrc.indexOf("if (drift) process.exitCode = 1;") !== -1);
check('refreeze check no longer references v4seeds/world-tick in code',
  stripComments(newSrc).indexOf('v4seeds') === -1 && stripComments(newSrc).indexOf('world-tick') === -1);

// ---- (f) corpora read-only in git status ----
try {
  const st = cp.execSync('git -C ' + ROOT + ' status --porcelain -- evidence/2026-11-21/perseed-profilegate4-confirm-b-off evidence/2026-11-21/perseed-profilegate4-confirm-b-on', { encoding: 'utf8', timeout: 180000 });
  check('corpora dirs unmodified in git status (read-only)', st.trim() === '', 'status output: ' + JSON.stringify(st.slice(0, 200)));
} catch (e) {
  check('corpora dirs unmodified in git status (read-only)', false, 'git status failed: ' + String(e.message).slice(0, 120));
}

// ---- (g) no src/ change in this arm ----
try {
  const diff = cp.execSync('git -C ' + ROOT + ' diff --quiet HEAD -- src/; echo $?', { encoding: 'utf8', timeout: 180000 }).trim();
  check('no src/ change vs HEAD (diff --quiet exit 0)', diff === '0', 'exit=' + diff);
} catch (e) {
  check('no src/ change vs HEAD (diff --quiet exit 0)', false, 'git diff failed: ' + String(e.message).slice(0, 120));
}

// ---- prereg frozen-table cross-check (the test's table is the prereg's) ----
const prereg = fs.readFileSync(PREREG, 'utf8');
let preregOk = true;
for (const seed of Object.keys(FROZEN_BOUND).sort()) {
  const v = FROZEN_BOUND[seed] == null ? 'null' : String(FROZEN_BOUND[seed]);
  // 106765's bound comes from the fallback; the prereg records it as
  // 'null → fallback 94' in the pool-row column.
  const needle = seed === '106765' ? '| 106765 | null → fallback 94 |' : '| ' + seed + ' | ' + v + ' |';
  if (prereg.indexOf(needle) === -1) preregOk = false;
}
check('prereg carries the same frozen bound table', preregOk);

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
