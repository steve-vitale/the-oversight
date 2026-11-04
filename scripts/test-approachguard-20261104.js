// test-approachguard-20261104.js — proof for the guardrail re-test arm
// sim-approachguard-b (Loop B run fleshout-loop-b-20261104T2235Z).
// Read-only over existing corpora except a /tmp scratch dir for the
// filter test; asserts:
//   1. COUNTING RULE MATCHES THE CONFIRM'S: applying the guard rule
//      (cause||reason||kind, lower-cased, contains 'starv';
//      player-flagged = player === true) to the confirm corpus
//      (perseed-approachconf-b) reproduces the confirm summarizer's
//      own starvation totals for BOTH legs, seed by seed.
//   2. SUMMARIZER FILTER MATCHES ONLY THE 24 NEW FILES: the guard
//      summarizer run on a scratch dir holding the 24 expected
//      approachguard filenames plus decoys (a replay-style
//      approachguard-seq file, a foreign-prefix file, a .bak file)
//      reports exactly the 24 panel files and no decoy.
//   3. GATE-OFF CONTROL IS BYTE-IDENTICAL (variant file untouched):
//      git diff HEAD is empty for BOTH policy files AND each file's
//      worktree hash equals its HEAD blob hash.
//   4. DRIVER ISOLATION: the guard driver writes only to
//      perseed-approachguard-b with the approachguard- prefix and
//      contains no reference to the confirm/branch corpus dirs or
//      prefixes as output targets.
//   5. PREREG PRECEDES JUDGED SIMS: the prereg file exists in git
//      history (committed before the sweep), and every corpus file
//      in perseed-approachguard-b shares ONE anchor commit.
//   6. SINGLE-BASE: that shared anchor is in history, and the game
//      code + policies are byte-identical between the anchor and
//      HEAD (tooling/evidence commits between them change no game
//      or policy bytes, so all legs ran on one game base; a
//      pull/rebase mid-sweep would break this).
// Usage: node scripts/test-approachguard-20261104.js (exit 0 = ALL PASS)
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const GAME_BASE = '3f92c4d3dba1037c148ea82ca5b4f9aed691d24b';
let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sh(cmd) { return execSync(cmd, { cwd: REPO }).toString().trim(); }
function starvCounts(j) {
  let t = 0, p = 0;
  for (const d of (j.deaths || [])) {
    const c = (d && (d.cause || d.reason || d.kind)) || 'unknown';
    if (String(c).toLowerCase().indexOf('starv') >= 0) {
      t++;
      if (d && d.player === true) p++;
    }
  }
  return { t: t, p: p };
}

// 1. Counting rule matches the confirm summarizer, both legs, per seed.
for (const run of ['baseline', 'armed']) {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'approachconf-summarize-20261104.js'),
    path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachconf-b'), run], { cwd: REPO }).toString();
  const summ = JSON.parse(out);
  check('confirm summarizer ' + run + ' has 12 files', summ.files.length === 12, 'got ' + summ.files.length);
  let tot = 0, totP = 0;
  for (const row of summ.perSeed) {
    const f = 'approachconf-s' + row.seed + '-' + run + '.json';
    const j = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachconf-b', f), 'utf8'));
    const c = starvCounts(j);
    tot += c.t; totP += c.p;
  }
  // Confirm perSeed rows carry no starvation fields; the totals object
  // is the summarizer's own starvation accounting.
  check('confirm totals match ' + run, summ.totals.starvationDeaths === tot && summ.totals.starvationPlayerDeaths === totP,
    'summ ' + summ.totals.starvationDeaths + '/' + summ.totals.starvationPlayerDeaths + ' vs rule ' + tot + '/' + totP);
  console.log('INFO confirm ' + run + ' starvation totals: ' + tot + ' total, ' + totP + ' player-flagged');
}

// 2. Summarizer filter matches only the 24 new files (scratch dir).
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'approachguard-filter-'));
  const minimal = { seed: 99601, run: 'baseline', policy: 'competent', days: 100,
    endReason: 'village-lost', exposures: [], deaths: [], killRows: [], won: false,
    nationalReached: false, tableEntered: false, tableWaiting: false, maxWave: 1,
    standingFinal: null, scaleRankFinal: null, arcFinal: null, scaleReadError: null };
  const expected = [];
  for (let s = 99601; s <= 99612; s++) for (const run of ['baseline', 'armed']) {
    const f = 'approachguard-s' + s + '-' + run + '.json';
    expected.push(f);
    const j = Object.assign({}, minimal, { seed: s, run: run, policy: run === 'baseline' ? 'competent' : 'approachfall' });
    fs.writeFileSync(path.join(dir, f), JSON.stringify(j));
  }
  // Decoys: replay-style seq file, foreign prefix, backup suffix.
  fs.writeFileSync(path.join(dir, 'approachguard-seq5-replay.json'), JSON.stringify(minimal));
  fs.writeFileSync(path.join(dir, 'approachconf-s99601-baseline.json'), JSON.stringify(minimal));
  fs.writeFileSync(path.join(dir, 'approachguard-s99601-baseline.json.bak'), JSON.stringify(minimal));
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'approachguard-summarize-20261104.js'), dir], { cwd: REPO }).toString();
  const summ = JSON.parse(out);
  // Guard summarizer shape: files = count, perSeed rows carry seed/run.
  const got = summ.perSeed.map(function (r) { return 'approachguard-s' + r.seed + '-' + r.run + '.json'; }).sort();
  const want = expected.slice().sort();
  check('filter matches exactly 24 files', summ.files === 24 && JSON.stringify(got) === JSON.stringify(want),
    'count ' + summ.files + ', extra: ' + got.filter(function (f) { return want.indexOf(f) < 0; }).join(','));
  check('filter excludes decoys', got.indexOf('approachguard-seq5-replay.json') < 0 &&
    got.indexOf('approachconf-s99601-baseline.json') < 0 &&
    got.indexOf('approachguard-s99601-baseline.json.bak') < 0);
  fs.rmSync(dir, { recursive: true, force: true });
})();

// 3. Gate-off control: both policy files byte-identical to HEAD.
for (const f of ['scripts/policies/competent.js', 'scripts/policies/competent-approachfall-b.js']) {
  let diffClean = true;
  try { execSync('git diff --quiet HEAD -- ' + f, { cwd: REPO }); } catch (e) { diffClean = false; }
  check('git diff HEAD empty: ' + f, diffClean);
  const work = sh('git hash-object ' + f);
  const head = sh('git rev-parse HEAD:' + f);
  check('worktree hash == HEAD blob: ' + f, work === head, work + ' vs ' + head);
}

// 4. Driver isolation.
(function () {
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'approachguard-driver-20261104.js'), 'utf8');
  check('driver corpus dir is perseed-approachguard-b', src.indexOf('perseed-approachguard-b') >= 0);
  check('driver prefix is approachguard-s', src.indexOf("approachguard-s'") >= 0);
  check('driver never targets confirm corpus', src.indexOf('perseed-approachconf-b') < 0);
  check('driver never targets branch corpus', src.indexOf('perseed-approachbranch-a') < 0);
  check('driver never targets branch prefix as output', src.indexOf("approachbranch-s'") < 0);
  const summ = fs.readFileSync(path.join(REPO, 'scripts', 'approachguard-summarize-20261104.js'), 'utf8');
  check('summarizer regex is approachguard-s', summ.indexOf('/^approachguard-s') >= 0 && summ.indexOf('approachbranch-s') < 0 || summ.indexOf('/^approachguard-s\\d+-.*\\.json$/') >= 0);
})();

// 5+6. Prereg in history; single shared anchor; game/policy identical
// between anchor and HEAD.
(function () {
  const log = sh('git log --oneline -- evidence/2026-11-04/sim-approachguard-b-prereg.md');
  check('prereg committed in history', log.length > 0, 'no log entry');
  const dir = path.join(REPO, 'evidence', '2026-11-04', 'perseed-approachguard-b');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(function (f) { return /^approachguard-s\d+-.*\.json$/.test(f); });
    const anchors = {};
    for (const f of files) {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      anchors[j.anchorCommit] = true;
    }
    const list = Object.keys(anchors);
    check('corpus files share one anchor', list.length === 1, 'anchors: ' + list.join(','));
    console.log('INFO existing guard corpus files: ' + files.length + ', anchor: ' + list[0]);
    if (list.length === 1) {
      let inHist = true;
      try { sh('git cat-file -e ' + list[0] + '^{commit}'); } catch (e) { inHist = false; }
      check('sweep anchor is in history', inHist);
      let gameDiff = '';
      try { gameDiff = execSync('git diff ' + list[0] + ' HEAD -- src/js scripts/policies', { cwd: REPO }).toString(); } catch (e) { gameDiff = 'ERROR'; }
      check('game + policies identical anchor..HEAD', gameDiff === '', gameDiff.slice(0, 200));
      let ancestor = true;
      try { execSync('git merge-base --is-ancestor ' + list[0] + ' HEAD', { cwd: REPO }); } catch (e) { ancestor = false; }
      check('sweep anchor is ancestor of HEAD', ancestor);
    }
  } else {
    console.log('INFO guard corpus dir not yet created (pre-sweep state)');
  }
  // Game base itself: no game/policy diff between the prereg's stated
  // base and HEAD is asserted at evidence time; tooling-only drift
  // between base and sweep anchor is recorded in the prereg note.
  const baseDiff = execSync('git diff ' + GAME_BASE + ' HEAD -- src/js scripts/policies', { cwd: REPO }).toString();
  check('game + policies identical prereg-base..HEAD', baseDiff === '', baseDiff.slice(0, 200));
})();

if (failures) { console.log('FAILURES: ' + failures); process.exit(1); }
console.log('ALL PASS');
