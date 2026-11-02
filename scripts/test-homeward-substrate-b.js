#!/usr/bin/env node
// test-homeward-substrate-b.js — proof for the sim-homeward-substrate-b
// validator + screener (prereg evidence/2026-11-02/
// sim-homeward-substrate-b-prereg.md, census section). Fixtures are
// driver-shaped records written to /tmp only (new tests must not
// write into the repo). Asserts:
// (a) validate mode counts matched-prefix agreement exactly:
//     agreeing prefix (61807 shape), one disagreeing hop,
//     64601 shape ending in a vetoed hop;
// (b) screen mode applies the APPROACH-CLEAN definition exactly:
//     qualifying trip, armed-approach-missing trip rejected,
//     armed-homeward-passing trip rejected, shadow-approach-failing
//     trip rejected;
// (c) every screening band start in the prereg is outside the
//     banned set (task banned bands + predecessor bands);
// (d) none of the reused instrument files (driver, analyzer,
//     full guard, outward-only variant, homeveto screener) is
//     modified in the worktree.
// Exit 0 = PASS, 1 = FAIL.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

const HERE = __dirname;
const TOOL = path.join(HERE, 'analyze-homeward-substrate-b.js');
function hop(fx, fy, tx, ty, opts) {
  return Object.assign({ from: { x: fx, y: fy }, to: { x: tx, y: ty },
    simOk: true, directOk: true, via: 'direct', legs: 0, creditUsed: 0,
    vetoed: false, homeward: false, originSimOk: null, silent: false, shadow: false }, opts);
}
function dayRec(loopDay, opts) {
  return Object.assign({ loopDay, start: { pos: { x: 4, y: 4 }, haven: { x: 4, y: 4 } },
    end: { pos: { x: 4, y: 4 }, haven: { x: 4, y: 4 }, kcal: 1000, hydration: 100 },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
    beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0,
    outwardOnlyPasses: 0, hops: [], forages: [],
    dayEndReturnSim: { ok: true, via: 'home', directOk: true, legs: 0, reason: 'home' } }, opts);
}
function runTool(args, insts) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homeward-substrate-'));
  const files = {};
  for (const [name, data] of Object.entries(insts)) {
    files[name] = path.join(tmp, name + '.jsonl');
    fs.writeFileSync(files[name], data.map((i) => JSON.stringify(i)).join('\n') + '\n');
  }
  const argv = args.map((a) => (files[a] ? files[a] : a));
  const out = execFileSync('node', [TOOL].concat(argv), { encoding: 'utf8' });
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

// (a1) Agreeing prefix, 61807 shape: walk-out + homeward entry hop.
{
  const W = [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2), hop(1, 2, 1, 1), hop(1, 1, 2, 0, { directOk: false, via: 'lateral' })];
  const H = hop(2, 0, 3, 0, { simOk: false, directOk: false, via: null, homeward: true });
  const s = [{ seed: 61807, policy: 'competent', days: [dayRec(4, { hops: W.concat([H]), end: { pos: { x: 3, y: 0 }, haven: { x: 4, y: 4 }, kcal: 930, hydration: 100 }, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } })] }];
  const a = [{ seed: 61807, policy: 'competent-homewardstep-b', days: [dayRec(4, { hops: W.concat([Object.assign({}, H, { vetoed: true })]), homewardVetoes: 1, vetoes: 1 })] }];
  const out = runTool(['--validate', '--shadow', 'shadow', '--armed', 'armed', '--seed', '61807', '--day', '4', '--terminator', '2,0->3,0'], { shadow: s, armed: a });
  check('validate agreeing prefix reports 6/6 + BAR100 PASS', /agreement=6\/6/.test(out) && /BAR100=PASS/.test(out), out.trim().split('\n').pop());
}
// (a2) One disagreeing hop in the prefix.
{
  const sW = [hop(4, 4, 2, 4), hop(2, 4, 1, 4, { simOk: false, directOk: false, via: null })];
  const aW = [hop(4, 4, 2, 4), hop(2, 4, 1, 4)];
  const term = hop(2, 4, 1, 4, { simOk: false, directOk: false, via: null });
  const s = [{ seed: 99901, policy: 'competent', days: [dayRec(1, { hops: sW })] }];
  const a = [{ seed: 99901, policy: 'competent-homewardstep-b', days: [dayRec(1, { hops: aW })] }];
  const out = runTool(['--validate', '--shadow', 'shadow', '--armed', 'armed', '--seed', '99901', '--day', '1', '--terminator', '2,4->1,4'], { shadow: s, armed: a });
  check('validate disagreeing hop reports 1/2 + BAR100 FAIL', /agreement=1\/2/.test(out) && /BAR100=FAIL/.test(out), out.trim().split('\n').pop());
}
// (a3) 64601 shape: prefix ending in a vetoed approach hop.
{
  const s = [{ seed: 64601, policy: 'competent', days: [dayRec(17, { hops: [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2, { simOk: false, directOk: false, via: null })] })] }];
  const a = [{ seed: 64601, policy: 'competent-homewardstep-b', days: [dayRec(17, { hops: [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2, { simOk: false, directOk: false, via: null, vetoed: true })], vetoes: 1 })] }];
  const out = runTool(['--validate', '--shadow', 'shadow', '--armed', 'armed', '--seed', '64601', '--day', '17', '--terminator', '1,4->1,2'], { shadow: s, armed: a });
  check('validate 64601 shape reports 3/3 + BAR100 PASS (veto is terminator, not before-end)', /agreement=3\/3/.test(out) && /BAR100=PASS/.test(out), out.trim().split('\n').pop());
}

// (b) Screen mode cases, one seed each.
function screenCase(name, shadowDays, armedDays, want) {
  const s = [{ seed: 67001, policy: 'competent', days: shadowDays }];
  const a = [{ seed: 67001, policy: 'competent-homewardstep-b', days: armedDays }];
  const out = runTool(['--screen', '--shadow', 'shadow', '--armed', 'armed'], { shadow: s, armed: a });
  check('screen ' + name, (want ? /QUALIFIES=YES/.test(out) : /QUALIFIES=no/.test(out)), out.trim().split('\n').pop());
}
{
  const W = [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2)];
  const H = hop(1, 2, 3, 0, { simOk: false, directOk: false, via: null, homeward: true });
  // Note: W must end at H.from; build a consistent trip: haven->(2,4)->(1,4)->(1,2) then H (1,2)->(3,0).
  const W2 = [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2)];
  const H2 = hop(1, 2, 3, 0, { simOk: false, directOk: false, via: null, homeward: true });
  const sDay = dayRec(4, { hops: W2.concat([H2]), end: { pos: { x: 3, y: 0 }, haven: { x: 4, y: 4 }, kcal: 900, hydration: 90 }, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const aDay = dayRec(4, { hops: W2.concat([Object.assign({}, H2, { vetoed: true })]), homewardVetoes: 1, vetoes: 1 });
  screenCase('qualifying trip -> YES', [sDay], [aDay], true);
  // Armed-approach-missing: armed leg never walks W (different route home).
  const aDay2 = dayRec(4, { hops: [hop(4, 4, 4, 3), hop(4, 3, 4, 4, { homeward: true })] });
  screenCase('armed-approach-missing -> no', [sDay], [aDay2], false);
  // Armed-homeward-passing: H' passes E under armed.
  const aDay3 = dayRec(4, { hops: W2.concat([Object.assign({}, H2, { simOk: true, directOk: true, via: 'direct' })]) });
  screenCase('armed-homeward-passing -> no', [sDay], [aDay3], false);
  // Shadow-approach-failing: one W hop E-fails in shadow.
  const Wbad = [hop(4, 4, 2, 4), hop(2, 4, 1, 4), hop(1, 4, 1, 2, { simOk: false, directOk: false, via: null })];
  const sDay4 = dayRec(4, { hops: Wbad.concat([H2]), end: { pos: { x: 3, y: 0 }, haven: { x: 4, y: 4 }, kcal: 900, hydration: 90 }, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  screenCase('shadow-approach-failing -> no', [sDay4], [aDay], false);
}

// (c) Screening band starts vs banned set.
{
  const screening = [67001, 67101, 67201, 68001, 68201, 68701, 69101, 69201];
  const banned = new Set([62801, 62001, 62009, 61901, 61909, 62301, 62401, 62501, 62601, 62701,
    64001, 64101, 64201, 64301, 64401, 64501, 64601, 64701,
    62101, 62201, 61701, 61801, 62901, 63001, 61101, 60501, 61401, 61501, 61601, 61301, 61001, 60201]);
  const bannedSeeds = new Set();
  for (const b of banned) for (let s = b; s < b + 8; s++) bannedSeeds.add(s);
  const overlap = [];
  for (const b of screening) for (let s = b; s < b + 8; s++) if (bannedSeeds.has(s)) overlap.push(s);
  check('screening bands do not overlap any banned band', overlap.length === 0, 'overlap=' + JSON.stringify(overlap));
  check('screening budget is exactly 8 bands', screening.length === 8);
  check('screening bands are 8 seeds each, ascending, non-overlapping',
    screening.every((b, i) => i === 0 || b > screening[i - 1] + 7));
}

// (d) Reused instrument files unmodified in this worktree.
{
  const reused = ['scripts/homext-abl-b-driver.js', 'scripts/analyze-homext-abl-b.js',
    'scripts/analyze-homeveto-screen-b.js',
    'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent-homewardstep-outwardonly-b.js'];
  let status = '';
  try { status = execSync('git status --porcelain', { encoding: 'utf8', cwd: path.join(HERE, '..') }); } catch (e) { status = 'GIT-ERROR'; }
  const touched = reused.filter((f) => status.split('\n').some((l) => l.slice(3).trim() === f));
  check('reused driver/analyzer/policy files unmodified', touched.length === 0 && status !== 'GIT-ERROR',
    touched.length ? 'touched=' + touched.join(',') : 'status-clean-for-reused');
}

console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
