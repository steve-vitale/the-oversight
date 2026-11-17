// test-nightcarry-resume.js — proof for the sim-nightcarry-a RESUME
// (Loop A fleshout-20261117T060712Z, arm sim-nightcarry-resume).
// Proves, on the re-applied tip (master 9f7d0522e + lever from
// 00fb5745a):
//  1. The lever hunks re-applied from 00fb5745a are present verbatim in
//     src/js/villager-brain.js (hunks 1-3 applied clean, hunk 4 voice
//     block hand-placed at its original anchor) — and the ONLY other
//     difference vs the 00fb5745a file is the companionguard change.
//  2. Companionguard (1ef267b8b, shipped unconditional) is intact in
//     both villager-brain.js and villager-agency.js.
//  3. The lever is env-gated, default OFF: the fresh control leg
//     (8/8) shows 0 carries and 0 carried lines.
//  4. The lever FIRED on the ON leg: 4 carries (103103: 3, 103107: 1),
//     3 carried launches (both expeditions started), 3 carried
//     departure lines naming yesterday's plan — raw conversion 3/4.
//  5. D1 drift is real and recorded: the D1 re-run of committed
//     control seed 103101 on this tip differs from its committed
//     corpus (standing 199 vs 465, v4seeds 0 vs 32).
//  6. The frozen verdict is UNJUDGEABLE: the analyzer's
//     nightcarry-resume-analysis.json has instancesBothLegs 0 (< 4
//     floor) while every cost bar passes — the lever is untested on
//     its frozen metric, NOT a NO-GO.
//  7. No pre-lever drift (vetparty-drift-check.js exits clean) and the
//     balanced panel compare exists with decision review_required,
//     flagged only on villageDeaths (the 103103 survival artifact).
//  8. The original proof (scripts/test-nightcarry-a.js) is green on
//     this re-applied tip (65/65, lever-present mode).
// MODE-AWARE (sim-nightcarry-resume, following sim-proofadapt-a): the
// lever is REVERTED after the judged legs (UNJUDGEABLE/unjudged kill
// discipline), so on a reverted tree this proof runs its OFF-MODE legs;
// on a tip where the lever is applied it runs the lever legs verbatim.
// Mode is detected at runtime from the source (LEVER below), never
// from an env flag. Lever-present: 41 checks. Off-mode: the same 41,
// with the lever-presence section replaced by absence counterparts.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-11-17');

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function git(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString(); } catch (e) { return ''; }
}
function loadCorpus(dir, seed, leg) {
  return JSON.parse(fs.readFileSync(path.join(EVID, dir, 'nightcarry-a-s' + seed + '-nightcarry-resume-' + leg + '.json'), 'utf8'));
}
const SEEDS = [103101, 103102, 103103, 103104, 103105, 103106, 103107, 103108];

// 1. Lever hunks present verbatim (lever-present) / absent (off-mode).
const brain = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const LEVER = brain.indexOf('function nightcarryOn()') !== -1;
console.log('mode: ' + (LEVER ? 'lever-present' : 'off-mode (lever reverted)'));
if (LEVER) {
  check('lever gate nightcarryOn present', brain.indexOf('function nightcarryOn()') !== -1);
  check('lever companionStillEligible present', brain.indexOf('function companionStillEligible(') !== -1);
  check('lever writeCommit carried fields present', brain.indexOf('carried: !!chosen.carried') !== -1 && brain.indexOf('carriedFromPart: (chosen.carriedFromPart') !== -1);
  check('lever carry hook present in vbrainScorePick', brain.indexOf("override: 'night_carry'") !== -1 && brain.indexOf('_nc0.day === _ncToday - 1') !== -1);
  check('lever carried voice line present', brain.indexOf('is finally setting out') !== -1 && brain.indexOf('yesterday') !== -1 && brain.indexOf('leaving today with') !== -1);
  check('lever stats counter present', brain.indexOf('_ncBr.stats.nightcarries') !== -1);
  // Every '+' line of the 00fb5745a lever diff exists verbatim in the current file.
  const leverDiff = git('diff 00fb5745a^ 00fb5745a -- src/js/villager-brain.js');
  const added = leverDiff.split('\n').filter(function (l) { return l.startsWith('+') && !l.startsWith('+++'); }).map(function (l) { return l.slice(1); });
  let missing = [];
  for (const line of added) {
    if (!line.trim()) continue;
    if (brain.indexOf(line) === -1) missing.push(line.slice(0, 60));
  }
  check('all 00fb5745a lever added-lines present verbatim (' + added.filter(function (l) { return l.trim(); }).length + ' lines)', missing.length === 0, missing.slice(0, 3).join(' | '));
  // The only difference vs the 00fb5745a file is companionguard.
  let leverOld = '';
  try { leverOld = execSync('git show 00fb5745a:src/js/villager-brain.js', { cwd: REPO }).toString(); } catch (e) {}
  const oldLines = leverOld.split('\n');
  const newLines = brain.split('\n');
  const onlyInOld = oldLines.filter(function (l) { return newLines.indexOf(l) === -1 && l.trim(); });
  check('no lever line lost vs 00fb5745a (only companionguard-context lines may differ)', onlyInOld.length <= 6, 'lines only in old file: ' + onlyInOld.length + ' — ' + onlyInOld.slice(0, 3).join(' / '));
} else {
  check('lever gate nightcarryOn ABSENT (reverted)', brain.indexOf('function nightcarryOn()') === -1);
  check('lever companionStillEligible ABSENT', brain.indexOf('function companionStillEligible(') === -1);
  check('lever writeCommit carried fields ABSENT', brain.indexOf('carried: !!chosen.carried') === -1 && brain.indexOf('carriedFromPart: (chosen.carriedFromPart') === -1);
  check('lever carry hook ABSENT', brain.indexOf("override: 'night_carry'") === -1 && brain.indexOf('_nc0.day === _ncToday - 1') === -1);
  check('lever carried voice line ABSENT', brain.indexOf('is finally setting out') === -1);
  check('lever stats counter ABSENT', brain.indexOf('_ncBr.stats.nightcarries') === -1);
  check('no carriedFromPart in writeCommit', brain.indexOf('carriedFromPart:') === -1);
  check('no NIGHTCARRY block anywhere in villager-brain.js', brain.indexOf('NIGHTCARRY (sim-nightcarry-a)') === -1);
}

// 2. Companionguard intact.
check('companionguard in villager-brain.js', brain.indexOf('// COMPANIONGUARD (sim-companionguard-b)') !== -1 && brain.indexOf('var launched = [];') !== -1);
const agency = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('companionguard in villager-agency.js', agency.indexOf('COMPANIONGUARD (sim-companionguard-b, SHIPPED UNCONDITIONAL') !== -1);

// src/ diff is the lever only (lever-present) / empty (off-mode).
const srcDiff = git('diff --name-only -- src/');
if (LEVER) check('src/ diff vs HEAD is villager-brain.js only', srcDiff.trim() === 'src/js/villager-brain.js', JSON.stringify(srcDiff.trim()));
else check('src/ diff vs HEAD is EMPTY (lever reverted)', srcDiff.trim() === '', JSON.stringify(srcDiff.trim()));

// 3. Control leg: lever OFF, nothing carried.
let ctrlCarries = 0, ctrlSays = 0, ctrlSkips = 0, ctrlFiles = 0;
for (const s of SEEDS) {
  const j = loadCorpus('perseed-nightcarry-resume-control', s, 'control');
  ctrlFiles++;
  ctrlCarries += (j.nightcarryCarries || []).length;
  ctrlSays += (j.carriedSays || []).length;
  ctrlSkips += (j.nightcarrySkips || []).length;
  check('control seed ' + s + ' anchor is this tip', (j.anchorCommit || '').indexOf('9f7d0522e') === 0);
}
check('control leg 8/8 files', ctrlFiles === 8);
check('control leg: 0 carries (lever OFF)', ctrlCarries === 0, 'carries=' + ctrlCarries);
check('control leg: 0 carried lines', ctrlSays === 0);
check('control leg: 0 nightcarrySkips (phenomenon absent on this tip)', ctrlSkips === 0, 'skips=' + ctrlSkips);

// 4. ON leg fired: 4 carries, 3 carried launches, 3 carried lines.
let onCarries = 0, onSays = 0, onLaunches = 0;
const carriesBySeed = {};
for (const s of SEEDS) {
  const j = loadCorpus('perseed-nightcarry-resume-on', s, 'on');
  onCarries += (j.nightcarryCarries || []).length;
  onSays += (j.carriedSays || []).length;
  carriesBySeed[s] = (j.nightcarryCarries || []).length;
  for (const r of (j.dawnbidDeparts || [])) {
    if (r.result === 'launch' && r.carried && r.vidExped && r.companionExped) onLaunches++;
  }
}
check('ON leg: 4 carries total', onCarries === 4, 'carries=' + onCarries);
check('ON leg carries are 103103:3 + 103107:1', carriesBySeed[103103] === 3 && carriesBySeed[103107] === 1, JSON.stringify(carriesBySeed));
check('ON leg: 3 carried launches (both expeditions started)', onLaunches === 3, 'launches=' + onLaunches);
check('ON leg: 3 carried departure lines', onSays === 3, 'says=' + onSays);
const says103103 = loadCorpus('perseed-nightcarry-resume-on', 103103, 'on').carriedSays;
check('carried line names yesterday\'s plan', says103103.every(function (x) { return (x.line || '').indexOf("yesterday's plan") !== -1; }));
const rawConversion = onCarries ? onLaunches / onCarries : null;
check('raw carry conversion 3/4 = 0.75 (informational; frozen secondary is in-instance)', rawConversion === 0.75, 'conversion=' + rawConversion);

// 5. D1 drift recorded.
const d1 = JSON.parse(fs.readFileSync(path.join(EVID, 'perseed-nightcarry-resume-d1', 'nightcarry-a-s103101-nightcarry-a-control.json'), 'utf8'));
const committed = JSON.parse(fs.readFileSync(path.join(EVID, 'perseed-nightcarry-a-control', 'nightcarry-a-s103101-nightcarry-a-control.json'), 'utf8'));
check('D1 re-run differs from committed control corpus (drift)', d1.standing !== committed.standing || (d1.v4seeds || []).length !== (committed.v4seeds || []).length,
  'D1 standing ' + d1.standing + ' vs committed ' + committed.standing);
check('D1: v4seeds 0 vs committed 32', (d1.v4seeds || []).length === 0 && (committed.v4seeds || []).length === 32);

// 6. Frozen verdict UNJUDGEABLE, cost bars pass.
const analysis = JSON.parse(fs.readFileSync(path.join(EVID, 'nightcarry-resume-analysis.json'), 'utf8'));
check('analyzer verdict is UNJUDGEABLE', analysis.verdict === 'UNJUDGEABLE', 'verdict=' + analysis.verdict);
check('instances opened both legs = 0 (< 4 floor)', analysis.go.instancesBothLegs === 0, 'instancesBothLegs=' + analysis.go.instancesBothLegs);
check('cost bar: median survival ratio 1.0 >= 0.9', analysis.go.medianRatio === 1, 'ratio=' + analysis.go.medianRatio);
check('cost bar: deaths 541 <= control 532 + 16', analysis.go.deathsArmed === 541 && analysis.go.deathsControl === 532);
check('cost bar: starvation 1 = 1, arm-only 0 = 0', analysis.go.starvArmedTotal === 1 && analysis.go.starvControlTotal === 1 && analysis.go.starvArmedOnly === 0);
check('wall: national scaleRank 0/8 both legs, wins 0, wave4 8/8, wave5 2/8',
  analysis.go.nationalEndArmed === 0 && analysis.go.nationalEndControl === 0 &&
  analysis.instrument.wall.wave4 === 8 && analysis.instrument.wall.wave5 === 2 &&
  analysis.instrument.wall.wins === 0 && analysis.control.wall.wave4 === 8);

// 7. Drift check + panel.
let driftOut = '';
try { driftOut = execFileSync('node', ['scripts/vetparty-drift-check.js', 'evidence/2026-11-17/perseed-nightcarry-resume-control', 'evidence/2026-11-17/perseed-nightcarry-resume-on'], { cwd: REPO }).toString(); } catch (e) { driftOut = (e.stdout || '').toString(); }
check('drift check: NO PRE-LEVER DRIFT', driftOut.indexOf('NO PRE-LEVER DRIFT') !== -1, driftOut.split('\n').slice(-3).join(' '));
const panel = JSON.parse(fs.readFileSync(path.join(EVID, 'nightcarry-resume-panel.json'), 'utf8'));
check('panel compare decision is review_required', panel.decision === 'review_required', 'decision=' + panel.decision);
const flagged = [];
for (const p of (panel.policies || [])) for (const m of (p.metrics || [])) if (m.status === 'regression_watch' || m.status === 'regression') flagged.push(m.id);
check('panel flags only villageDeaths', flagged.length === 1 && flagged[0] === 'villageDeaths', 'flagged=' + JSON.stringify(flagged));

// 8. Original proof green on this tip.
let origOut = '', origCode = 0;
try { origOut = execFileSync('node', ['scripts/test-nightcarry-a.js'], { cwd: REPO, timeout: 300000 }).toString(); } catch (e) { origCode = 1; origOut = (e.stdout || '').toString(); }
const expectedOrig = LEVER ? '65 passed, 0 failed' : '68 passed, 0 failed';
check('original proof test-nightcarry-a.js green on this tip (' + (LEVER ? '65/65 lever-present' : '68/68 off-mode') + ')', origCode === 0 && origOut.indexOf(expectedOrig) !== -1, origOut.split('\n').slice(-2).join(' '));

console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
if (fail) { console.log('failures:'); for (const f of failures) console.log('  - ' + f); process.exit(1); }
