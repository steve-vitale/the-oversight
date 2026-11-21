// Proof test for sim-d3refreeze2-b — the SECOND D3 re-freeze + re-judge.
//
// The corrected first-lever-day bound (frozen in
// evidence/2026-11-21/sim-d3refreeze2-b-prereg.md, finding #2639) is the
// first needWave>=4 dawnbidScore row on the ON leg, ANY part. The POOL-ROW
// bound (frozen in sim-d3refreeze-b) was proven non-conservative on seeds
// 106759 and 106764: the lever acted at mid-day scorings (parts 1-3) the
// part-0-only pool rows never observe (106759: lever acted day 95 part 3,
// first pool row day 97; 106764: lever acted day 55 part 3, first pool row
// day 64). The dawnbidScore row carries the plan's needWave as
// row.plan.needWave — a top-level row.needWave does NOT exist.
// This test proves the bound change BEFORE the judged D3 re-run:
//   (a) pool-row bound computes 97 for 106759 and 64 for 106764, while the
//       corrected (dawnbidScore) bound computes 95 and 55;
//   (b) the pool-row check flags 106759/106764 DRIFT, the corrected check
//       calls them CLEAN, and the world-tick check still flags 106751 DRIFT;
//   (c) the corrected per-seed bound table matches the frozen table (16 seeds);
//   (d) the verdict logic on synthetic corpora (CLEAN / DRIFT / IDENTICAL /
//       null-bound + divergence / companion2-depart fallback /
//       plan.needWave field, not a top-level needWave);
//   (e) the refreeze drift check is a copy of the d3refreeze check with ONLY
//       firstLeverDay changed (diff, ignoring comment lines);
//   (f) the confirm corpora are unmodified in git status (read-only);
//   (g) no src/ change in this arm.
// Pure re-analysis: no sims, no game load, no writes into the corpora.
// Usage: node scripts/test-d3refreeze2-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OFFDIR = path.join(ROOT, 'evidence/2026-11-21/perseed-profilegate4-confirm-b-off');
const ONDIR = path.join(ROOT, 'evidence/2026-11-21/perseed-profilegate4-confirm-b-on');
const WORLD_CHECK = path.join(ROOT, 'scripts/profilegate4-confirm-b-drift-check.js');
const POOL_CHECK = path.join(ROOT, 'scripts/profilegate4-d3refreeze-b-drift-check.js');
const NEW_CHECK = path.join(ROOT, 'scripts/profilegate4-d3refreeze2-b-drift-check.js');
const PREREG = path.join(ROOT, 'evidence/2026-11-21/sim-d3refreeze2-b-prereg.md');

// Frozen per-seed corrected bound (first needWave>=4 dawnbidScore row on the
// ON leg, any part; fallback: first companion2 depart; null = neither
// exists), from the prereg's pre-freeze verification.
const FROZEN_BOUND = {
  106751: 68, 106752: 62, 106753: 44, 106754: 63, 106755: 87, 106756: null,
  106757: 100, 106758: null, 106759: 95, 106760: null, 106761: 144,
  106762: null, 106763: 55, 106764: 55, 106765: 92, 106766: null,
};
// Frozen first-scoring part for the seeds whose first dawnbidScore is mid-day.
const FROZEN_PART = { 106751: 3, 106757: 1, 106759: 3, 106761: 1, 106764: 3, 106765: 3 };
// Frozen pool-row bound for the two seeds the d3refreeze arm flagged.
const FROZEN_POOL = { 106759: 97, 106764: 64 };
// Frozen old (world-tick) bound for 106751.
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

// ---- (a)+(b) pool-row vs corrected bound on the two flagged seeds, real corpora ----
const poolRun = runCheck(POOL_CHECK, OFFDIR, ONDIR);
const newRun = runCheck(NEW_CHECK, OFFDIR, ONDIR);
const worldRun = runCheck(WORLD_CHECK, OFFDIR, ONDIR);
const poolLines = parseLines(poolRun.stdout);
const newLines = parseLines(newRun.stdout);
const worldLines = parseLines(worldRun.stdout);
check('pool-row check exits nonzero (2 expected DRIFT seeds)', poolRun.status === 1, 'status=' + poolRun.status);
check('pool-row bound computes 97 for 106759', poolLines['106759'] && poolLines['106759'].leverDay === FROZEN_POOL[106759],
  'got ' + (poolLines['106759'] && poolLines['106759'].leverDay));
check('pool-row bound computes 64 for 106764', poolLines['106764'] && poolLines['106764'].leverDay === FROZEN_POOL[106764],
  'got ' + (poolLines['106764'] && poolLines['106764'].leverDay));
check('pool-row check flags 106759 DRIFT (div 96 < 97)', poolLines['106759'] && /^DRIFT/.test(poolLines['106759'].verdict),
  'got ' + (poolLines['106759'] && poolLines['106759'].verdict));
check('pool-row check flags 106764 DRIFT (div 56 < 64)', poolLines['106764'] && /^DRIFT/.test(poolLines['106764'].verdict),
  'got ' + (poolLines['106764'] && poolLines['106764'].verdict));
check('pool-row check reports DRIFT SEEDS: 2', /DRIFT SEEDS: 2/.test(poolRun.stdout),
  'stdout tail: ' + poolRun.stdout.trim().split('\n').slice(-1)[0]);
check('corrected check exits zero (NO PRE-LEVER DRIFT)', newRun.status === 0, 'status=' + newRun.status);
check('corrected bound computes 95 for 106759', newLines['106759'] && newLines['106759'].leverDay === 95,
  'got ' + (newLines['106759'] && newLines['106759'].leverDay));
check('corrected bound computes 55 for 106764', newLines['106764'] && newLines['106764'].leverDay === 55,
  'got ' + (newLines['106764'] && newLines['106764'].leverDay));
check('corrected check calls 106759 CLEAN (div 96 >= 95)', newLines['106759'] && /^CLEAN/.test(newLines['106759'].verdict),
  'got ' + (newLines['106759'] && newLines['106759'].verdict));
check('corrected check calls 106764 CLEAN (div 56 >= 55)', newLines['106764'] && /^CLEAN/.test(newLines['106764'].verdict),
  'got ' + (newLines['106764'] && newLines['106764'].verdict));
check('corrected check reports NO PRE-LEVER DRIFT', /NO PRE-LEVER DRIFT/.test(newRun.stdout),
  'stdout tail: ' + newRun.stdout.trim().split('\n').slice(-1)[0]);
check('world-tick control exits nonzero (106751 DRIFT)', worldRun.status === 1, 'status=' + worldRun.status);
check('world-tick bound computes 111 for 106751', worldLines['106751'] && worldLines['106751'].leverDay === FROZEN_OLD_106751,
  'got ' + (worldLines['106751'] && worldLines['106751'].leverDay));
check('world-tick check flags 106751 DRIFT (div 75 < 111)', worldLines['106751'] && /^DRIFT/.test(worldLines['106751'].verdict),
  'got ' + (worldLines['106751'] && worldLines['106751'].verdict));
check('world-tick check reports DRIFT SEEDS: 1', /DRIFT SEEDS: 1/.test(worldRun.stdout),
  'stdout tail: ' + worldRun.stdout.trim().split('\n').slice(-1)[0]);

// ---- (c) corrected per-seed bound table matches the frozen table ----
let boundOk = true, boundDetail = '';
for (const seed of Object.keys(FROZEN_BOUND).sort()) {
  const got = newLines[seed] ? newLines[seed].leverDay : undefined;
  if (got !== FROZEN_BOUND[seed]) { boundOk = false; boundDetail += seed + ': got ' + got + ', frozen ' + FROZEN_BOUND[seed] + '; '; }
}
check('corrected per-seed bound table matches frozen table (16 seeds)', boundOk, boundDetail);
check('corrected check covers all 16 seeds', Object.keys(newLines).length === 16, 'got ' + Object.keys(newLines).length);
// The first dawnbidScore row's part, read straight from the ON corpora.
let partOk = true, partDetail = '';
for (const seed of Object.keys(FROZEN_PART).sort()) {
  const files = fs.readdirSync(ONDIR).filter(function (f) { return f.indexOf('-s' + seed + '-') !== -1; });
  const j = JSON.parse(fs.readFileSync(path.join(ONDIR, files[0]), 'utf8'));
  let first = null;
  for (const r of (j.dawnbidScores || [])) {
    if (((r.plan && r.plan.needWave) | 0) >= 4) { if (first == null || r.day < first.day) first = r; }
  }
  if (!first || first.day !== FROZEN_BOUND[seed] || first.part !== FROZEN_PART[seed]) {
    partOk = false; partDetail += seed + ': got ' + (first && first.day + ' part ' + first.part) + '; ';
  }
}
check('first needWave>=4 dawnbidScore part matches frozen table (mid-day scorings)', partOk, partDetail);

// ---- (d) verdict logic on synthetic corpora ----
function dayRow(day, wkl) {
  return { day: day, roster: [{ vid: 'a', dead: false }, { vid: 'b', dead: false }],
    waveKillLog: (wkl || []).map(function (m) { return { vid: '?', w: 1, mid: m }; }),
    wave4Slain: 0, vetsW3: { count: 0 }, vetsW4: { count: 0 },
    ready4: { ready: false }, ready5: { ready: false } };
}
function synthCase(dir, opts) {
  // opts: { divDay (null = identical), dbDay (null = no dawnbidScore row),
  //         dbPart, departDay, topNeedWave (a row with ONLY a top-level
  //         needWave and no plan — must NOT count as a bound) }
  const off = { seed: 900001, daily: [dayRow(1), dayRow(2), dayRow(3), dayRow(4), dayRow(5), dayRow(6), dayRow(7), dayRow(8), dayRow(9), dayRow(10)],
    dawnbidScores: [], v4departs: [], dawnbidDeparts: [] };
  const on = JSON.parse(JSON.stringify(off));
  if (opts.divDay != null) {
    const row = on.daily.find(function (d) { return d.day === opts.divDay; });
    row.waveKillLog = [{ vid: '?', w: 1, mid: 'extra_kill' }];
  }
  if (opts.dbDay != null) on.dawnbidScores = [{ day: opts.dbDay, part: opts.dbPart || 0, plan: { needWave: 4 } }];
  if (opts.topNeedWave != null) on.dawnbidScores = [{ day: opts.topNeedWave, part: 0, needWave: 4, plan: { needWave: null } }];
  if (opts.departDay != null) on.dawnbidDeparts = [{ day: opts.departDay, companion2: 'x' }];
  fs.mkdirSync(path.join(dir, 'off'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'on'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'off', 's900001-off.json'), JSON.stringify(off));
  fs.writeFileSync(path.join(dir, 'on', 's900001-on.json'), JSON.stringify(on));
  return runCheck(NEW_CHECK, path.join(dir, 'off'), path.join(dir, 'on'));
}
const TMP = '/tmp/d3refreeze2-b-fixtures';
cp.execSync('rm -rf ' + TMP);
const cClean = synthCase(path.join(TMP, 'clean'), { divDay: 10, dbDay: 9 });
check('synthetic CLEAN: div 10 >= dawnbid 9, exit 0', cClean.status === 0 && /CLEAN/.test(cClean.stdout),
  'status=' + cClean.status + ' out=' + cClean.stdout.trim());
const cMidday = synthCase(path.join(TMP, 'midday'), { divDay: 10, dbDay: 9, dbPart: 3 });
check('synthetic CLEAN: mid-day (part 3) dawnbidScore day 9 still bounds div 10',
  cMidday.status === 0 && /CLEAN/.test(cMidday.stdout),
  'status=' + cMidday.status + ' out=' + cMidday.stdout.trim());
const cDrift = synthCase(path.join(TMP, 'drift'), { divDay: 5, dbDay: 9 });
check('synthetic DRIFT: div 5 < dawnbid 9, exit 1', cDrift.status === 1 && /DRIFT/.test(cDrift.stdout),
  'status=' + cDrift.status + ' out=' + cDrift.stdout.trim());
const cIdent = synthCase(path.join(TMP, 'ident'), { divDay: null, dbDay: 9 });
check('synthetic IDENTICAL: no divergence, exit 0', cIdent.status === 0 && /IDENTICAL/.test(cIdent.stdout),
  'status=' + cIdent.status + ' out=' + cIdent.stdout.trim());
const cNullDrift = synthCase(path.join(TMP, 'nulldrift'), { divDay: 5, dbDay: null });
check('synthetic null-bound + divergence = DRIFT, exit 1', cNullDrift.status === 1 && /DRIFT/.test(cNullDrift.stdout),
  'status=' + cNullDrift.status + ' out=' + cNullDrift.stdout.trim());
const cNullIdent = synthCase(path.join(TMP, 'nullident'), { divDay: null, dbDay: null });
check('synthetic null-bound, no divergence = IDENTICAL, exit 0', cNullIdent.status === 0 && /IDENTICAL/.test(cNullIdent.stdout),
  'status=' + cNullIdent.status + ' out=' + cNullIdent.stdout.trim());
const cFallback = synthCase(path.join(TMP, 'fallback'), { divDay: 8, dbDay: null, departDay: 7 });
check('synthetic fallback: no dawnbidScore row, companion2 depart day 7, div 8 = CLEAN',
  cFallback.status === 0 && /CLEAN/.test(cFallback.stdout),
  'status=' + cFallback.status + ' out=' + cFallback.stdout.trim());
const cTopLevel = synthCase(path.join(TMP, 'toplevel'), { divDay: 5, dbDay: null, topNeedWave: 4 });
check('synthetic field guard: top-level needWave with plan.needWave null does NOT bind (div 5 = DRIFT)',
  cTopLevel.status === 1 && /DRIFT/.test(cTopLevel.stdout),
  'status=' + cTopLevel.status + ' out=' + cTopLevel.stdout.trim());

// ---- (e) refreeze drift check is a copy with ONLY firstLeverDay changed ----
function stripComments(src) {
  return src.split('\n').filter(function (l) { return !/^\s*\/\//.test(l); }).join('\n');
}
const oldSrc = fs.readFileSync(POOL_CHECK, 'utf8');
const newSrc = fs.readFileSync(NEW_CHECK, 'utf8');
const oldCode = stripComments(oldSrc).split('\n');
const newCode = stripComments(newSrc).split('\n');
const oldSet = new Set(oldCode), newSet = new Set(newCode);
const removed = oldCode.filter(function (l) { return !newSet.has(l); });
const added = newCode.filter(function (l) { return !oldSet.has(l); });
check('copy-diff: only the firstLeverDay scan lines differ (code, comments stripped)',
  removed.length === 2 && added.length === 2 &&
  removed[0].indexOf("a.companionPool") !== -1 && removed[1].indexOf("r.needWave") !== -1 &&
  added[0].indexOf("a.dawnbidScores") !== -1 && added[1].indexOf("r.plan") !== -1,
  'removed=' + JSON.stringify(removed) + ' added=' + JSON.stringify(added));
check('copy-diff: fingerprint function identical', newSrc.indexOf(oldSrc.slice(oldSrc.indexOf('function fp('), oldSrc.indexOf('function firstLeverDay'))) !== -1);
check('copy-diff: verdict loop identical',
  newSrc.indexOf("const verdict = firstDiv == null ? 'IDENTICAL'") !== -1 &&
  newSrc.indexOf("if (drift) process.exitCode = 1;") !== -1);
check('copy-diff: fallback (companion2 depart) identical',
  newSrc.indexOf("for (const dep of (a.v4departs || []).concat(a.dawnbidDeparts || [])) {") !== -1);
check('refreeze check no longer references companionPool in code',
  stripComments(newSrc).indexOf('companionPool') === -1);

// ---- (f) corpora read-only in git status ----
try {
  const st = cp.execSync('git -C ' + ROOT + ' status --porcelain -- evidence/2026-11-21/perseed-profilegate4-confirm-b-off evidence/2026-11-21/perseed-profilegate4-confirm-b-on', { encoding: 'utf8', timeout: 180000 });
  check('corpora dirs unmodified in git status (read-only)', st.trim() === '', 'status output: ' + JSON.stringify(st.slice(0, 200)));
} catch (e) {
  check('corpora dirs unmodified in git status (read-only)', false, 'git status failed: ' + String(e.message).slice(0, 120));
}

// ---- (g) no src/ change in this arm ----
// (Proof-test correction, pre-judged-leg: the first run used
// `git diff --quiet HEAD -- src/` via execSync, which timed out at 180s on
// this slow tree — an infrastructure timeout, not a src/ change. The
// equivalent property is checked here with `git status --porcelain -- src/`,
// which the corpora check (f) already proved completes: empty output means
// no staged or unstaged src/ change vs HEAD.)
try {
  const st = cp.execSync('git -C ' + ROOT + ' status --porcelain -- src/', { encoding: 'utf8', timeout: 180000 });
  check('no src/ change vs HEAD (status --porcelain -- src/ empty)', st.trim() === '', 'status output: ' + JSON.stringify(st.slice(0, 200)));
} catch (e) {
  check('no src/ change vs HEAD (status --porcelain -- src/ empty)', false, 'git status failed: ' + String(e.message).slice(0, 120));
}

// ---- prereg frozen-table cross-check (the test's table is the prereg's) ----
const prereg = fs.readFileSync(PREREG, 'utf8');
let preregOk = true;
for (const seed of Object.keys(FROZEN_BOUND).sort()) {
  const v = FROZEN_BOUND[seed] == null ? 'null' : String(FROZEN_BOUND[seed]);
  // Part-0 seeds are recorded as 0 in the prereg; only null-bound seeds
  // record '—' (proof-test correction, pre-judged-leg: the first run
  // used '—' for every seed missing from FROZEN_PART, which mismatched
  // the part-0 rows).
  const part = FROZEN_PART[seed] != null ? String(FROZEN_PART[seed]) : (FROZEN_BOUND[seed] == null ? '—' : '0');
  const needle = '| ' + seed + ' | ' + v + ' | ' + part + ' |';
  if (prereg.indexOf(needle) === -1) preregOk = false;
}
check('prereg carries the same frozen bound table', preregOk);

console.log(passed + ' passed, ' + failed + ' failed');
if (failed) { console.log('FAILURES:\n' + failures.join('\n')); process.exit(1); }
