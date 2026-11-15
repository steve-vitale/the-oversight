// test-ove48-drawparity.js — proof test for the OVE-48 RNG-draw-parity
// probe (arm sim-ove48-drawparity-a).
//
//   node scripts/test-ove48-drawparity.js --stage1   (pre-run guards:
//     tooling present, bars match the prereg, the counter is a pure
//     pass-through that consumes no draws, the analyzer judges the
//     synthetic verdicts, the step script parses, zero src/js changes)
//   node scripts/test-ove48-drawparity.js --stage2   (post-run:
//     corpora complete, comparison + evidence present, verdict in the
//     pre-registered set, zero src/js changes, tracked tree clean)
//
// Stage 1 runs NO judged sims. The RNG unit tests run in child node
// processes so the Math.random wrapper never leaks into this process.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const BRANCH = 'sim-ove48-drawparity-a';
const INSTR = path.join(REPO, 'scripts', 'ove48-drawparity-instrument-20261114.js');
const DRIVER = path.join(REPO, 'scripts', 'ove48-drawparity-driver-20261114.js');
const ANALYZER = path.join(REPO, 'scripts', 'ove48-drawparity-analyze-20261114.js');
const STEP = path.join(REPO, 'scripts', 'ove48-drawparity-step.sh');
const PREREG = path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-drawparity-prereg.md');
const EVIDENCE = path.join(REPO, 'evidence', '2026-11-14', 'sim-ove48-drawparity-a.md');
const COMPARISON = path.join(REPO, 'evidence', '2026-11-14', 'ove48-drawparity-comparison.json');

let passed = 0, failed = 0;
function check(name, ok, detail) {
  if (ok) { passed++; console.log('  ok: ' + name); }
  else { failed++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function sh(cmd, opts) {
  return execSync(cmd, Object.assign({ cwd: REPO, encoding: 'utf8', timeout: 180000 }, opts || {}));
}

// --- child script 1: the counter is a pure pass-through that consumes
// no draws itself, with context-stack attribution. ---
const CHILD_COUNTER = `
'use strict';
const DP = require(process.env.INSTR);
const assert = require('assert');
// Fake RNG: deterministic values, counts its own invocations.
let calls = 0;
const VALUES = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.05];
function fake() { calls++; return VALUES[(calls - 1) % VALUES.length]; }
Math.random = fake; // setter wraps the fake
assert.strictEqual(calls, 0, 'assigning must not draw');
const got = [Math.random(), Math.random(), Math.random()];
assert.deepStrictEqual(got, [0.1, 0.2, 0.3], 'values must pass through in order');
assert.strictEqual(calls, 3, 'exactly one fake call per Math.random() call');
assert.strictEqual(DP.counts.total, 3, 'counter sees 3');
assert.strictEqual(DP.counts.byBucket.other, 3, 'no context -> other');
DP.enter('selectWant');
Math.random(); Math.random();
DP.enter('dawn');
Math.random();
DP.exit('dawn');
Math.random();
DP.exit('selectWant');
Math.random();
assert.strictEqual(DP.counts.total, 8, 'total 8');
assert.strictEqual(DP.counts.byBucket.selectWant, 3, 'selectWant bucket 3');
assert.strictEqual(DP.counts.byBucket.dawn, 1, 'dawn bucket 1');
assert.strictEqual(DP.counts.byBucket.other, 4, 'other bucket 4');
assert.strictEqual(calls, 8, 'fake called exactly 8 times: no extra draws');
// resetRun records setup draws and zeroes the run counters.
DP.resetRun();
const fin0 = DP.finish();
assert.strictEqual(fin0.setupDraws, 8, 'setup draws recorded');
assert.strictEqual(fin0.totalDraws, 0, 'run counters zeroed');
DP.snapshotDay(1);
Math.random();
DP.snapshotDay(2);
const fin1 = DP.finish();
assert.strictEqual(fin1.totalDraws, 1, 'one run draw');
assert.strictEqual(fin1.daySeries.length, 2, 'two day snapshots');
assert.strictEqual(fin1.daySeries[0].cumTotal, 0, 'day 1 cumulative 0');
assert.strictEqual(fin1.daySeries[1].cumTotal, 1, 'day 2 cumulative 1');
// wrapGame attribution with a fake Game (no real game code involved).
let innerDraws = 0;
const Game = {
  state: { scholar: { day: 5 } },
  convoDawnPriorities: function () { return { kind: 'FORAGE', drive: 'food_security', preferred: ['ask_favor'], boosts: {} }; },
  convoSelectWant: function () {
    Math.random(); Math.random(); Math.random(); // the pick loop's own draws
    this.convoDawnPriorities('v1');
    Math.random();
    return { id: 'ask_favor', def: {}, fromSeed: false, dawn: { kind: 'FORAGE', drive: 'food_security', preferred: ['ask_favor'], aligned: true } };
  },
  talkTo: function () { Math.random(); this.convoSelectWant('v1'); Math.random(); return 'hello'; },
};
const w = DP.wrapGame(Game);
DP.resetRun();
Game.talkTo('v1');
const fin2 = DP.finish();
assert.strictEqual(fin2.picks.length, 1, 'one pick recorded');
assert.strictEqual(fin2.picks[0].source, 'weighted-pick', 'pick classified weighted-pick');
assert.strictEqual(fin2.picks[0].draws, 4, 'pick consumed 4 draws');
assert.strictEqual(fin2.picks[0].dawnCalls, 1, 'one dawn read inside the pick');
assert.strictEqual(fin2.picks[0].day, 5, 'pick day recorded');
assert.strictEqual(fin2.byBucket.dawn, 0, 'dawn read itself draws 0');
assert.strictEqual(fin2.byBucket.selectWant, 4, 'selectWant bucket 4');
assert.strictEqual(fin2.byBucket.talk, 2, 'talk bucket 2 (outside the pick)');
w.uninstall();
console.log('CHILD-COUNTER-OK');
`;

// --- child script 2: the analyzer judges synthetic corpora. ---
function syntheticCorpus(dir, totals, days, deaths) {
  fs.mkdirSync(dir, { recursive: true });
  const seeds = [190457, 190458, 190459, 190460, 190461, 190462, 190463, 190464];
  seeds.forEach(function (seed, i) {
    const total = totals[i];
    const daySeries = [1, 2, 3].map(function (d) {
      return { day: d, cumTotal: Math.floor(total * d / 3), cumByBucket: { dawn: 0, selectWant: Math.floor(total * d / 3), talk: 0, other: 0 } };
    });
    const doc = {
      seed: seed, days: days[i], endReason: days[i] >= 150 ? 'survived' : 'village-lost', won: false,
      maxWave: 5, instrumentErrors: [],
      deaths: deaths[i] || [],
      draws: {
        setupDraws: 1000, totalDraws: total,
        byBucket: { dawn: 0, selectWant: total, talk: 0, other: 0 },
        daySeries: daySeries,
        picks: [{ day: 1, vid: 'v1', want: 'ask_favor', source: 'weighted-pick', draws: 9, dawnCalls: 1, dawnPresent: true }],
        totals: { selectWantCalls: 1, dawnPriorityCalls: 1, talkToCalls: 1, picksOverflow: 0 },
        errors: [],
      },
    };
    fs.writeFileSync(path.join(dir, 'drawparity-s' + seed + '-synth-fix.json'), JSON.stringify(doc));
  });
}
function runAnalyzer(baseDir, subjDir, extra) {
  const args = ['scripts/ove48-drawparity-analyze-20261114.js', '--base', baseDir, '--subj', subjDir];
  if (extra) args.push.apply(args, extra);
  return execFileSync('node', args, { cwd: REPO, encoding: 'utf8' });
}

function stage1() {
  console.log('stage1: pre-run guards');
  check('prereg exists', fs.existsSync(PREREG));
  check('instrument exists', fs.existsSync(INSTR));
  check('driver exists', fs.existsSync(DRIVER));
  check('analyzer exists', fs.existsSync(ANALYZER));
  check('step script exists', fs.existsSync(STEP));
  // Bars in the analyzer source match the prereg verbatim.
  const an = fs.readFileSync(ANALYZER, 'utf8');
  check('analyzer has PARITY-FAIL bars (median>0, total>=40, nPos>=7)',
    an.indexOf('med > 0') !== -1 && an.indexOf('totalDelta >= 40') !== -1 && an.indexOf('nPos >= 7') !== -1);
  check('analyzer has PARITY-OK bars (|total|<=10 or mixed)',
    an.indexOf('Math.abs(totalDelta) <= 10') !== -1 && an.indexOf('mixed') !== -1);
  check('analyzer has 80% localization bar', an.indexOf('>= 0.8') !== -1);
  check('analyzer embeds mech deathDiv table', an.indexOf('190457: 6') !== -1 && an.indexOf('190463: 4') !== -1);
  check('analyzer embeds conv day replication table',
    an.indexOf('190463: 23') !== -1 && an.indexOf('190463: 138') !== -1);
  // Prereg states the bars verbatim too.
  const pr = fs.readFileSync(PREREG, 'utf8');
  check('prereg states PARITY-FAIL', pr.indexOf('PARITY-FAIL') !== -1 && pr.indexOf('>= +40') !== -1 && pr.indexOf('>= 7/8') !== -1);
  check('prereg states PARITY-OK', pr.indexOf('PARITY-OK') !== -1 && pr.indexOf('<= 10') !== -1);
  check('prereg states localization bar', pr.indexOf('>= 80%') !== -1);
  check('prereg states determinism check', pr.indexOf('Determinism check') !== -1);
  // Syntax + step script parse.
  try { sh('node --check ' + INSTR + ' && node --check ' + DRIVER + ' && node --check ' + ANALYZER); check('node --check instrument/driver/analyzer', true); }
  catch (e) { check('node --check instrument/driver/analyzer', false, String(e.message).slice(0, 120)); }
  try { sh('bash -n ' + STEP); check('step script bash -n', true); }
  catch (e) { check('step script bash -n', false, String(e.message).slice(0, 120)); }
  // Counter purity in a child process.
  try {
    const out = execFileSync('node', ['-e', CHILD_COUNTER], { cwd: REPO, encoding: 'utf8', env: Object.assign({}, process.env, { INSTR: INSTR }) });
    check('counter pass-through + attribution (child)', out.indexOf('CHILD-COUNTER-OK') !== -1, out.slice(-200));
  } catch (e) { check('counter pass-through + attribution (child)', false, String((e.stdout || '') + (e.message || '')).slice(-300)); }
  // Analyzer verdicts on synthetic corpora.
  const tmp = fs.mkdtempSync(path.join('/tmp', 'drawparity-test-'));
  try {
    const days = [150, 101, 150, 124, 129, 150, 23, 115];
    const deaths = [[], [], [], [], [], [], [], []];
    // PARITY-FAIL: subj draws +100/seed over base, all positive.
    syntheticCorpus(path.join(tmp, 'base-fail'), [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], days, deaths);
    syntheticCorpus(path.join(tmp, 'subj-fail'), [1100, 1100, 1100, 1100, 1100, 1100, 1100, 1100], days, deaths);
    let out = runAnalyzer(path.join(tmp, 'base-fail'), path.join(tmp, 'subj-fail'));
    check('analyzer PARITY-FAIL on synthetic +100/seed', out.indexOf('verdict: PARITY-FAIL') !== -1 && out.indexOf('LOCALIZED') !== -1, out.split('\n').slice(0, 3).join(' | '));
    // PARITY-OK: identical totals.
    syntheticCorpus(path.join(tmp, 'subj-ok'), [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], days, deaths);
    out = runAnalyzer(path.join(tmp, 'base-fail'), path.join(tmp, 'subj-ok'));
    check('analyzer PARITY-OK on identical totals', out.indexOf('verdict: PARITY-OK') !== -1, out.split('\n').slice(0, 2).join(' | '));
    // AMBIGUOUS: consistent positive sign (7/8) but median and total
    // disagree — median +20, total -60 (one -200 outlier).
    syntheticCorpus(path.join(tmp, 'subj-amb'), [1020, 1020, 1020, 1020, 1020, 1020, 1020, 800], days, deaths);
    out = runAnalyzer(path.join(tmp, 'base-fail'), path.join(tmp, 'subj-amb'));
    check('analyzer AMBIGUOUS on median/total disagreement', out.indexOf('verdict: AMBIGUOUS') !== -1, out.split('\n').slice(0, 2).join(' | '));
    // WITHHELD: r2 totals mismatch.
    syntheticCorpus(path.join(tmp, 'base-r2'), [1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000], days, deaths);
    syntheticCorpus(path.join(tmp, 'subj-r2-bad'), [1100, 1100, 1100, 1100, 1100, 1100, 1100, 1101], days, deaths);
    out = runAnalyzer(path.join(tmp, 'base-fail'), path.join(tmp, 'subj-fail'),
      ['--baseR2', path.join(tmp, 'base-r2'), '--subjR2', path.join(tmp, 'subj-r2-bad')]);
    check('analyzer WITHHELD on r2 mismatch', out.indexOf('verdict: WITHHELD') !== -1, out.split('\n').slice(0, 2).join(' | '));
  } catch (e) { check('analyzer synthetic verdicts', false, String((e.stdout || '') + (e.message || '')).slice(-300)); }
  // Post-judgment setupDraws fix: the driver zeroes the counters
  // before loadGame so setup draws are clean (see the driver comment).
  const drv = fs.readFileSync(DRIVER, 'utf8');
  check('driver zeroes counters before loadGame (setupDraws fix)',
    drv.indexOf('DP.resetRun()') !== -1 && drv.indexOf('DP.resetRun()') < drv.indexOf('loadGame({'));
  // Zero src/js changes on this branch vs its merge-base with master
  // (pure object-DB read — no worktree scan, which is slow on this tree).
  try {
    const mb = sh('git merge-base HEAD master').trim();
    const diff = sh('git diff-tree --no-commit-id --name-only -r ' + mb + ' HEAD -- src/js/').trim();
    check('zero src/js changes vs merge-base (' + mb.slice(0, 12) + ')', diff === '', diff.slice(0, 200));
  } catch (e) { check('zero src/js changes vs merge-base', false, String(e.message).slice(0, 120)); }
  console.log('stage1: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

function stage2() {
  console.log('stage2: post-run checks');
  const steps = ['t-ove48-drawparity-base', 't-ove48-drawparity-subj', 't-ove48-drawparity-base-r2', 't-ove48-drawparity-subj-r2'];
  const expectCounts = { 't-ove48-drawparity-base': 8, 't-ove48-drawparity-subj': 8, 't-ove48-drawparity-base-r2': 2, 't-ove48-drawparity-subj-r2': 2 };
  for (const step of steps) {
    const dir = path.join(REPO, 'evidence', '2026-11-14', 'perseed-ove48-drawparity-' + step);
    check('corpus dir exists: ' + step, fs.existsSync(dir));
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); });
    check('corpus ' + step + ' has ' + expectCounts[step] + ' seeds', files.length === expectCounts[step], files.length + ' files');
    let ok = true, detail = '';
    for (const f of files) {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (!d.draws || d.draws.totalDraws == null || !Array.isArray(d.draws.daySeries) || !Array.isArray(d.draws.picks)) { ok = false; detail = f + ' missing draw fields'; break; }
        if ((d.instrumentErrors || []).length) { ok = false; detail = f + ' instrument errors: ' + d.instrumentErrors.join('; '); break; }
      } catch (e) { ok = false; detail = f + ' unparsable: ' + String(e.message).slice(0, 80); break; }
    }
    check('corpus ' + step + ' parses, draw fields present, 0 instrument errors', ok, detail);
  }
  check('comparison JSON exists', fs.existsSync(COMPARISON));
  if (fs.existsSync(COMPARISON)) {
    try {
      const c = JSON.parse(fs.readFileSync(COMPARISON, 'utf8'));
      check('comparison verdict in pre-registered set',
        ['PARITY-FAIL', 'PARITY-OK', 'AMBIGUOUS', 'WITHHELD'].indexOf(c.verdict) !== -1, 'verdict=' + c.verdict);
      check('comparison carries validity V1-V5', !!(c.validity && c.validity.V1 && c.validity.V5), '');
      check('comparison carries timing X/8', !!(c.timing && typeof c.timing.precedesCount === 'number'), '');
    } catch (e) { check('comparison JSON parses', false, String(e.message).slice(0, 120)); }
  }
  check('evidence file exists', fs.existsSync(EVIDENCE));
  if (fs.existsSync(EVIDENCE)) {
    const ev = fs.readFileSync(EVIDENCE, 'utf8');
    check('evidence has metric review section', ev.indexOf('metric review') !== -1);
    check('evidence names the verdict', /PARITY-(FAIL|OK)|AMBIGUOUS|WITHHELD/.test(ev));
    check('evidence reports wall numbers', ev.indexOf('Wall numbers') !== -1 || ev.indexOf('wall numbers') !== -1);
  }
  try {
    const mb = sh('git merge-base HEAD master').trim();
    const diff = sh('git diff-tree --no-commit-id --name-only -r ' + mb + ' HEAD -- src/js/').trim();
    check('zero src/js changes vs merge-base (' + mb.slice(0, 12) + ')', diff === '', diff.slice(0, 200));
  } catch (e) { check('zero src/js changes vs merge-base', false, String(e.message).slice(0, 120)); }
  try {
    const cur = sh('git branch --show-current').trim();
    check('on branch ' + BRANCH, cur === BRANCH, 'on ' + cur);
    const st = sh('git status --porcelain --untracked-files=no').trim();
    check('tracked tree clean', st === '', st.slice(0, 200));
  } catch (e) { check('branch + tracked-tree clean', false, String(e.message).slice(0, 120)); }
  console.log('stage2: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

const mode = process.argv[2];
if (mode === '--stage1') { process.exitCode = stage1() ? 0 : 1; }
else if (mode === '--stage2') { process.exitCode = stage2() ? 0 : 1; }
else { console.error('usage: node scripts/test-ove48-drawparity.js --stage1|--stage2'); process.exit(2); }
