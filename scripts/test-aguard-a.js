// test-aguard-a.js — proof for arm sim-aguard-a (FICTION GUARD:
// the firstNameOf shared guard (finding #2509) so no say() line can
// ever print a bare "A" name — evidence/2026-11-17/
// sim-aguard-a-prereg.md, frozen bars B1–B5).
//   - static: the src/ diff vs base is firstNameOf ONLY (one hunk);
//     both voice-line call sites byte-identical to base; both line
//     texts unchanged; win-plan.js untouched; no PROFILEGATE
//     reference remains in src/ (the measurement lever reverted).
//   - staged fixture (child process, one harness): PRE-System leg
//     (systemArrived false — the state the finding is about): a
//     range-0 holder + walkable companion scores party_launch → the
//     holder line fires once with WHOLE descriptors, no bare "A"; a
//     second identical score fires nothing (dedup); a BOTH-range-0
//     pair fires BOTH lines once each, companion first, no bare "A";
//     a walkable holder fires nothing. POST-System leg
//     (systemArrived = true, fresh pairs): both lines fire with REAL
//     first names in the EXACT frozen #2499/#2505 wording — proving
//     the guard is a no-op on real names.
//   - live driver smoke: the aguard driver runs 5d on seed 103461
//     with 0 instrument errors (PROFILEGATE=1 + VETREENGAGE=1 in this
//     process only — env flags, never src/).
//   - corpus checks: read evidence/2026-11-17/perseed-aguard-a-on/
//     and perseed-aguard-a-off/ (8 files each, produced by the driver
//     BEFORE this test's final run) and judge B2 (0 bare-"A" lines on
//     both legs, both lines; voice counts equal on/off) and B3
//     (guard-on vs guard-off byte-identical on all 24 structural
//     fields, sayCount identical, blockedPicks identical).
// Usage:
//   VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-aguard-a-on SEEDS=103461,103462 RUN=aguard-a node scripts/aguard-driver-20261117.js
//   VETREENGAGE=1 PROFILEGATE=1 MODE=off OUTDIR=perseed-aguard-a-off SEEDS=103461,103462 RUN=aguard-a node scripts/aguard-driver-20261117.js
//   node scripts/test-aguard-a.js
// The voice fixture runs in a child process (one harness per process):
//   node -e "require('./scripts/test-aguard-a.js').voiceFixture().then(function(r){console.log(JSON.stringify(r));})"
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
const CORPUS_ON_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-aguard-a-on');
const CORPUS_OFF_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-aguard-a-off');
const BAND = [103461, 103462, 103463, 103464, 103465, 103466, 103467, 103468];
// BARE_A_RE: the same detector the driver uses — every bare-"A"
// position in the two voice lines. Kept in sync with
// scripts/aguard-driver-20261117.js by the static check below.
const BARE_A_RE = /(^A (asked|meant) )|( with A —)|(but A never)|(so A stays)/;

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen prereg.
// Before anything is committed (prereg still untracked), fall back to
// HEAD — the arm's base tip — so the diff+status union still judges
// exactly the uncommitted work. After the commit lands, the git-log
// route wins and the same checks judge the committed diff.
function frozenBase() {
  if (process.env.AGUARD_BASE) return process.env.AGUARD_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-aguard-a-prereg.md', { cwd: REPO, timeout: 120000 }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO, timeout: 120000 }).toString().trim();
  } catch (e) {}
  try { return execSync('git rev-parse HEAD', { cwd: REPO, timeout: 120000 }).toString().trim(); } catch (e) {}
  return null;
}
// NOTE: no bare `git status` anywhere in this file — `git status` on
// the whole tree HANGS in this worktree (prereg §Instrument
// limitations 2). Scoped `git diff --name-only` and `git ls-files
// --others` (both verified fast) judge the same union.
function gitDiffNames(base, dir, ref) {
  try {
    const r = ref || 'HEAD';
    return execSync('git diff --name-only ' + base + ' ' + r + ' -- ' + dir, { cwd: REPO, timeout: 120000 }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitWorktreeDiffNames(dir) {
  try {
    return execSync('git diff --name-only -- ' + dir, { cwd: REPO, timeout: 120000 }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitUntrackedNames(dir) {
  try {
    return execSync('git ls-files --others --exclude-standard -- ' + dir, { cwd: REPO, timeout: 120000 }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitShowFile(base, file) {
  try { return execSync('git show ' + base + ':' + file, { cwd: REPO, timeout: 120000 }).toString(); } catch (e) { return null; }
}

// ---------- 1. Static ----------
function staticChecks() {
  console.log('== static ==');
  const BASE = frozenBase();
  console.log('  info: frozen base ' + BASE);
  check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
  const EXPECTED_SRC = ['src/js/villager-brain.js'];
  const srcDiff = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
  const srcWt = gitWorktreeDiffNames('src/');
  const srcUntracked = gitUntrackedNames('src/').filter(function (s) { return EXPECTED_SRC.indexOf(s) !== -1; });
  const srcUnion = Array.from(new Set(srcDiff.concat(srcWt).concat(srcUntracked))).sort();
  check('src/ diff vs base + worktree + untracked is villager-brain.js only',
    JSON.stringify(srcUnion) === JSON.stringify(EXPECTED_SRC),
    'union=' + JSON.stringify(srcUnion));
  const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('guard present in firstNameOf (AGUARD marker + whole-descriptor return)',
    brainJs.indexOf('AGUARD (sim-aguard-a, finding #2509)') !== -1 &&
    brainJs.indexOf("if (/^an? /i.test(s)) return s;") !== -1);
  // The src/ diff vs base must be ONE hunk inside firstNameOf: no
  // voice-line text touched, no call-site line touched.
  let diffText = '';
  try { diffText = execSync('git diff ' + (BASE || 'HEAD') + ' -- src/js/villager-brain.js', { cwd: REPO, timeout: 120000 }).toString(); } catch (e) { diffText = 'GIT-UNAVAILABLE'; }
  const hunkCount = (diffText.match(/^@@ /gm) || []).length;
  check('villager-brain.js diff vs base is a single hunk (firstNameOf only)',
    diffText !== 'GIT-UNAVAILABLE' && hunkCount === 1, 'hunks=' + hunkCount);
  check('diff touches no voice-line text (no stays behind/home lines in the diff)',
    diffText.indexOf('stays behind') === -1 && diffText.indexOf('stays home') === -1 &&
    diffText.indexOf('_hbH') === -1 && diffText.indexOf('_hdH') === -1);
  check('both voice-line call sites byte-identical to base',
    (function () {
      const baseJs = BASE ? gitShowFile(BASE, 'src/js/villager-brain.js') : null;
      if (!baseJs) return false;
      const sites = [
        "_hbH = firstNameOf(_hbH || vid);",
        "_hbC = firstNameOf(_hbC || chosen.companion);",
        "_hdH = firstNameOf(_hdH || vid);",
        "_hdC = firstNameOf(_hdC || chosen.companion);",
      ];
      return sites.every(function (s) { return brainJs.indexOf(s) !== -1 && baseJs.indexOf(s) !== -1; }) &&
        brainJs.indexOf('homebodySaid') !== -1 && brainJs.indexOf('holderSaid') !== -1;
    })());
  check('#2499 companion line text UNCHANGED (frozen wording still present)',
    brainJs.indexOf('stays behind.') !== -1 &&
    brainJs.indexOf(" + ' asked ' + ") !== -1);
  check('#2505 holder line text UNCHANGED (frozen wording still present)',
    brainJs.indexOf('stays home.') !== -1 &&
    brainJs.indexOf(" + ' meant to walk out with ' + ") !== -1);
  check('no PROFILEGATE reference remains in src/ (lever reverted)',
    brainJs.indexOf('PROFILEGATE') === -1 && winplanJs.indexOf('PROFILEGATE') === -1 &&
    brainJs.indexOf('profilegateOn') === -1 && winplanJs.indexOf('profilegateOn') === -1);
  check('win-plan.js untouched by this arm',
    BASE ? gitDiffNames(BASE, 'src/js/win-plan.js').length === 0 && gitWorktreeDiffNames('src/js/win-plan.js').length === 0 : false,
    'win-plan diff=' + JSON.stringify(BASE ? gitDiffNames(BASE, 'src/js/win-plan.js') : null));
  const EXPECTED_SCRIPTS = [
    'scripts/aguard-driver-20261117.js',
    'scripts/test-aguard-a.js',
  ];
  const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
  const scriptsWt = gitWorktreeDiffNames('scripts/');
  const scriptsUntracked = gitUntrackedNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
  const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsWt).concat(scriptsUntracked))).sort();
  check('scripts diff vs base + worktree + untracked is the aguard instrument only (2 files)',
    JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
    'union=' + JSON.stringify(scriptsUnion));
  check('instrument files exist',
    EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'aguard-driver-20261117.js'), 'utf8');
  check('driver captures bare-A + both voice lines + blocked picks',
    driverSrc.indexOf('BARE_A_RE') !== -1 &&
    driverSrc.indexOf('bareALines') !== -1 &&
    driverSrc.indexOf('stays home') !== -1 &&
    driverSrc.indexOf('holderLines') !== -1 &&
    driverSrc.indexOf('never leaves Haven') !== -1 &&
    driverSrc.indexOf('homebodyLines') !== -1 &&
    driverSrc.indexOf('blockedPicks') !== -1);
  check('driver bare-A detector matches this test (kept in sync)',
    driverSrc.indexOf('(^A (asked|meant) )|( with A —)|(but A never)|(so A stays)') !== -1);
  check('driver is two-leg on/off (MODE must be on or off)',
    driverSrc.indexOf("if (MODE !== 'on' && MODE !== 'off')") !== -1);
  const DRIVER = require(path.join(REPO, 'scripts', 'aguard-driver-20261117.js'));
  check('driver exports oneRun',
    typeof DRIVER.oneRun === 'function');
}

// ---------- 2. Staged voice fixture (live, child process) ----------
// voiceFixture(): one harness. Stages two range-0 holders + one walkable
// holder + one homebody companion + two walkable companions at Haven on
// day 0, wraps Game.say, and scores the cases through the real
// vbrainScorePick (the lines' site). The candidates are hand-built
// party_launch extras — findCompanion and the profile gate are NOT under
// test here (the line fires on the commit, whatever picked the companion).
// A party_launch extra deterministically overrides the core lottery pick
// (vbrainScorePick: win-plan holds/launches outrank the soft lottery).
// PRE-System leg first (systemArrived false — the state finding #2509
// is about): the guard must render whole descriptors, never bare "A".
// POST-System leg second (systemArrived = true, FRESH pairs — the
// pre-System pairs are already dedup-marked): the guard must be a
// no-op, and both lines must match the EXACT frozen #2499/#2505 wording
// with real first names.
async function voiceFixture() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  let lastFailure = null;
  for (const seed of [103461, 103462, 103463, 103464, 103465]) {
    const r = await attemptSeed(seed);
    if (r && !r.stagingFailed) { r.seed = seed; return r; }
    lastFailure = r;
  }
  return lastFailure || { error: 'no-seed-staged' };
  async function attemptSeed(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'aguard-fixture', fullTelemetry: false });
    await setupGame(Game);
    Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
    // PRE-System staging: displayName returns a stranger descriptor
    // ("A man, maybe 20s") until the System arrives or the name is
    // earned socially — before that, firstNameOf on the descriptor
    // yields bare "A" WITHOUT the guard. Live, party_launch picks
    // happen weeks in, post-arrival (496/496 blocked picks on the
    // homebodyvoice-a corpus carry real first names, 0 "A"-names),
    // so the pre-System leg is the guard's proof, not the live shape.
    try { if (Game.state) Game.state.systemArrived = false; } catch (e) {}
    const v = Game.state.village;
    const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
    function atHaven(rid) {
      try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
    }
    function profOf(rid) {
      try { return Game.npcRangeProfile ? Game.npcRangeProfile(rid) : null; } catch (e) { return null; }
    }
    function maxDOf(rid) {
      try { return Game.npcMaxDist ? Game.npcMaxDist(rid) : null; } catch (e) { return null; }
    }
    function alive(rid) {
      try { const p = Game.getPerson ? Game.getPerson(rid) : null; return !(p && p.dead); } catch (e) { return true; }
    }
    // descOf: the WHOLE displayName (descriptor pre-System, full name post-System).
    function descOf(rid) {
      try { return String(Game.displayName(rid) || ''); } catch (e) { return rid; }
    }
    // firstOf: the first token — the real first name post-System.
    function firstOf(rid) {
      try { return String(Game.displayName(rid) || '').split(' ')[0]; } catch (e) { return rid; }
    }
    const range0 = [], walkables = [];
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId) continue;
      if (!atHaven(rid) || !alive(rid)) continue;
      if (((v.away || {})[rid])) continue;
      const prof = profOf(rid);
      if (prof === 'homebody' && (maxDOf(rid) | 0) < 1) range0.push(rid);
      else if ((prof === 'wanderer' || prof === 'explorer') && (maxDOf(rid) || 0) >= 1) walkables.push(rid);
    }
    if (range0.length < 2 || walkables.length < 3) {
      return { stagingFailed: true, error: 'roles-missing', range0: range0.length, walkables: walkables.length };
    }
    const h0 = range0[0], h1 = range0[1], compH = range0[1];
    const hw = walkables[0], compW = walkables[1], compW2 = walkables[2];
    // Wrap Game.say BEFORE scoring: capture every narration line.
    const lines = [];
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') lines.push(String(arg));
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
    function scorePartyLaunch(holder, companion) {
      const core = { kind: 'HAVEN_CHORE', w: 5 };
      const launch = { kind: 'EXPEDITION', w: 5, winPlanAction: 'party_launch', companion: companion, vbrainSrc: 'win_plan' };
      Game.vbrainScorePick(holder, [core, launch], { dawn: true });
      let commit = null;
      try { commit = Game.vbrainCommit(holder); } catch (e) {}
      return { commitCompanion: commit ? (commit.companion || null) : null,
        commitAction: commit ? (commit.winPlanAction || null) : null };
    }
    function holderLines() { return lines.filter(function (l) { return l.indexOf('stays home.') !== -1; }); }
    function compLines() { return lines.filter(function (l) { return l.indexOf('stays behind.') !== -1; }); }
    function bareALines() { return lines.filter(function (l) { return BARE_A_RE.test(l); }); }
    // ---- PRE-System leg ----
    const preDesc = { h0: descOf(h0), h1: descOf(h1), hw: descOf(hw), compH: descOf(compH), compW: descOf(compW), compW2: descOf(compW2) };
    const p1 = scorePartyLaunch(h0, compW);
    const preAfter1 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    const p2 = scorePartyLaunch(h0, compW); // same pair again: dedup
    const preAfter2 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    const p3 = scorePartyLaunch(h0, compH); // BOTH range-0: both lines, companion first
    const preAfter3 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    const p4 = scorePartyLaunch(hw, compW); // walkable holder: silence
    const preAfter4 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    // ---- POST-System leg (fresh pairs; pre-System pairs are dedup-marked) ----
    try { if (Game.state) Game.state.systemArrived = true; } catch (e) {}
    const postFirst = { h1: firstOf(h1), hw: firstOf(hw), compH: firstOf(compH), compW: firstOf(compW), compW2: firstOf(compW2) };
    const q1 = scorePartyLaunch(h1, compW2);
    const postAfter1 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    const q2 = scorePartyLaunch(h1, compH); // BOTH range-0, real names
    const postAfter2 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    const q3 = scorePartyLaunch(hw, compW2); // walkable holder, real names: silence
    const postAfter3 = { holder: holderLines().slice(), comp: compLines().slice(), bareA: bareALines().slice() };
    return {
      holder0: h0, holder0MaxD: maxDOf(h0),
      holder1: h1, holder1MaxD: maxDOf(h1),
      holderWalk: hw, holderWalkMaxD: maxDOf(hw),
      compH: compH, compHMaxD: maxDOf(compH),
      compW: compW, compWMaxD: maxDOf(compW),
      compW2: compW2, compW2MaxD: maxDOf(compW2),
      preDesc: preDesc, postFirst: postFirst,
      p1: p1, p2: p2, p3: p3, p4: p4,
      preAfter1: preAfter1, preAfter2: preAfter2, preAfter3: preAfter3, preAfter4: preAfter4,
      q1: q1, q2: q2, q3: q3,
      postAfter1: postAfter1, postAfter2: postAfter2, postAfter3: postAfter3,
    };
  }
}
function childVoiceFixture() {
  const script = "const t=require('./scripts/test-aguard-a.js');" +
    "t.voiceFixture().then(function(r){console.log(JSON.stringify(r));}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function voiceLive() {
  console.log('== voice fixture live (child process) ==');
  const r = childVoiceFixture();
  check('fixture staged (2 range-0 holders + walkable holder + homebody + 2 walkable companions at Haven)',
    !r.error && !r.stagingFailed, JSON.stringify(r).slice(0, 300));
  if (r.error || r.stagingFailed) return;
  check('range-0 holders are range-0 (maxD < 1)', (r.holder0MaxD | 0) < 1 && (r.holder1MaxD | 0) < 1, 'maxD=' + r.holder0MaxD + '/' + r.holder1MaxD);
  check('walkable holder can walk (maxD >= 1)', (r.holderWalkMaxD | 0) >= 1, 'maxD=' + r.holderWalkMaxD);
  check('homebody companion is range-0 (maxD < 1)', (r.compHMaxD | 0) < 1, 'maxD=' + r.compHMaxD);
  check('walkable companions can walk (maxD >= 1)', (r.compWMaxD | 0) >= 1 && (r.compW2MaxD | 0) >= 1, 'maxD=' + r.compWMaxD + '/' + r.compW2MaxD);
  // Pre-System descriptors are whole "A ..." strings (the guard's input shape).
  const pd = r.preDesc || {};
  check('pre-System descriptors are whole "A ..." strings (guard input shape)',
    Object.keys(pd).every(function (k) { return /^A (man|woman|person), maybe \d0s/.test(pd[k] || ''); }),
    JSON.stringify(pd));
  // ---- PRE-System assertions (B1, guard works) ----
  check('pre score 1 commits party_launch with the walkable companion',
    r.p1.commitAction === 'party_launch' && r.p1.commitCompanion === r.compW, JSON.stringify(r.p1));
  check('pre score 1 fires the holder line exactly once, with WHOLE descriptors (never bare "A")',
    r.preAfter1.holder.length === 1 &&
    r.preAfter1.holder[0] === pd.h0 + ' meant to walk out with ' + pd.compW + ' — but ' + pd.h0 + ' never leaves Haven, so ' + pd.h0 + ' stays home.' &&
    r.preAfter1.comp.length === 0 && r.preAfter1.bareA.length === 0,
    JSON.stringify(r.preAfter1));
  check('pre score 2 (same pair) fires nothing new (dedup)',
    r.preAfter2.holder.length === 1 && r.preAfter2.comp.length === 0 && r.preAfter2.bareA.length === 0, JSON.stringify(r.preAfter2));
  check('pre score 3 (both range-0) fires BOTH lines once each, companion first, no bare "A"',
    r.preAfter3.holder.length === 2 && r.preAfter3.comp.length === 1 && r.preAfter3.bareA.length === 0 &&
    r.preAfter3.comp[0] === pd.h0 + ' asked ' + pd.compH + ' to walk out with the party — but ' + pd.compH + ' never leaves Haven, so ' + pd.compH + ' stays behind.' &&
    r.preAfter3.holder[1] === pd.h0 + ' meant to walk out with ' + pd.compH + ' — but ' + pd.h0 + ' never leaves Haven, so ' + pd.h0 + ' stays home.',
    JSON.stringify(r.preAfter3));
  check('pre score 4 (walkable holder) fires nothing new',
    r.preAfter4.holder.length === 2 && r.preAfter4.comp.length === 1 && r.preAfter4.bareA.length === 0, JSON.stringify(r.preAfter4));
  // ---- POST-System assertions (B1, guard is a no-op on real names) ----
  const pf = r.postFirst || {};
  check('post-System first names are real (not "A", not descriptors)',
    Object.keys(pf).every(function (k) { return pf[k] && pf[k] !== 'A' && pf[k].indexOf('maybe') === -1; }),
    JSON.stringify(pf));
  check('post score 1 fires the holder line exactly once, EXACT frozen #2505 wording with real names',
    r.postAfter1.holder.length === 3 &&
    r.postAfter1.holder[2] === pf.h1 + ' meant to walk out with ' + pf.compW2 + ' — but ' + pf.h1 + ' never leaves Haven, so ' + pf.h1 + ' stays home.' &&
    r.postAfter1.comp.length === 1 && r.postAfter1.bareA.length === 0,
    JSON.stringify(r.postAfter1));
  check('post score 2 (both range-0) fires BOTH lines once each, companion first, EXACT frozen wording',
    r.postAfter2.holder.length === 4 && r.postAfter2.comp.length === 2 && r.postAfter2.bareA.length === 0 &&
    r.postAfter2.comp[1] === pf.h1 + ' asked ' + pf.compH + ' to walk out with the party — but ' + pf.compH + ' never leaves Haven, so ' + pf.compH + ' stays behind.' &&
    r.postAfter2.holder[3] === pf.h1 + ' meant to walk out with ' + pf.compH + ' — but ' + pf.h1 + ' never leaves Haven, so ' + pf.h1 + ' stays home.',
    JSON.stringify(r.postAfter2));
  check('post score 3 (walkable holder) fires nothing new',
    r.postAfter3.holder.length === 4 && r.postAfter3.comp.length === 2 && r.postAfter3.bareA.length === 0, JSON.stringify(r.postAfter3));
}

// ---------- 3. Live driver smoke (5d, seed 103461) ----------
async function liveRuns() {
  console.log('== driver live smoke ==');
  process.env.DAYS = '5';
  process.env.PROFILEGATE = '1';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'aguard-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'aguard-driver-20261117.js'));
  const out = await driver.oneRun(103461);
  check('live driver run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live driver run carries bareALines + homebodyLines + holderLines + blockedPicks arrays',
    Array.isArray(out.bareALines) && Array.isArray(out.homebodyLines) && Array.isArray(out.holderLines) && Array.isArray(out.blockedPicks));
  check('live driver run carries v4 + dawnbid + pool arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.dawnbidScores) && Array.isArray(out.companionPool));
  check('live driver run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + out.bareALines.length + ' bare-A lines, ' +
    out.homebodyLines.length + ' voice lines, ' + out.holderLines.length + ' holder lines, ' +
    out.blockedPicks.length + ' blocked picks, ' +
    (out.companionPool || []).length + ' pool rows');
  return out;
}

// ---------- 4. Corpus checks (B2 / B3) ----------
function loadCorpus(dir, seed, mode) {
  const f = path.join(dir, 'aguard-a-s' + seed + '-aguard-a-' + mode + '.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
// stripSeq: the driver's module-level `seq` counter leaks across
// seeds in one CLI process (homebodyvoice-a metric review) — strip
// it before comparing dawnbidDeparts, identically on both legs.
function stripSeq(rows) {
  return (rows || []).map(function (r) {
    const c = Object.assign({}, r);
    delete c.seq;
    return c;
  });
}
function corpusChecks() {
  console.log('== corpus checks (B2/B3) ==');
  const onFiles = BAND.map(function (seed) { return { seed: seed, j: loadCorpus(CORPUS_ON_DIR, seed, 'on') }; });
  const offFiles = BAND.map(function (seed) { return { seed: seed, j: loadCorpus(CORPUS_OFF_DIR, seed, 'off') }; });
  const missingOn = onFiles.filter(function (x) { return !x.j; }).map(function (x) { return x.seed; });
  const missingOff = offFiles.filter(function (x) { return !x.j; }).map(function (x) { return x.seed; });
  check('corpus present: 8/8 aguard-a ON files (run the driver MODE=on first if missing)',
    missingOn.length === 0, 'missing seeds: ' + JSON.stringify(missingOn));
  check('corpus present: 8/8 aguard-a OFF files (run the driver MODE=off first if missing)',
    missingOff.length === 0, 'missing seeds: ' + JSON.stringify(missingOff));
  if (missingOn.length || missingOff.length) return;
  // B5 first (instrument): 0 errors on every file, policy sha frozen.
  const errOn = onFiles.filter(function (x) { return (x.j.instrumentErrors || []).length !== 0; }).map(function (x) { return x.seed; });
  const errOff = offFiles.filter(function (x) { return (x.j.instrumentErrors || []).length !== 0; }).map(function (x) { return x.seed; });
  check('B5: 0 instrument errors on all 16 legs', errOn.length === 0 && errOff.length === 0,
    'error seeds on=' + JSON.stringify(errOn) + ' off=' + JSON.stringify(errOff));
  check('B5: policy sha frozen on all 16 legs',
    onFiles.concat(offFiles).every(function (x) { return x.j.policySha === 'df9b7dff4de4'; }));
  // B2: bareALines empty on both legs; voice-line counts equal on/off.
  let b2bad = [];
  let totVoiceOn = 0, totVoiceOff = 0, totBareOn = 0, totBareOff = 0;
  onFiles.forEach(function (x, i) {
    const off = offFiles[i].j;
    const bareOn = (x.j.bareALines || []).length, bareOff = (off.bareALines || []).length;
    totBareOn += bareOn; totBareOff += bareOff;
    if (bareOn !== 0) b2bad.push('seed ' + x.seed + ' ON: ' + bareOn + ' bare-A lines: ' + JSON.stringify(x.j.bareALines.slice(0, 2)));
    if (bareOff !== 0) b2bad.push('seed ' + x.seed + ' OFF: ' + bareOff + ' bare-A lines: ' + JSON.stringify(off.bareALines.slice(0, 2)));
    const voiceOn = (x.j.homebodyLines || []).length, voiceOff = (off.homebodyLines || []).length;
    totVoiceOn += voiceOn; totVoiceOff += voiceOff;
    if (voiceOn !== voiceOff) b2bad.push('seed ' + x.seed + ': voice lines on=' + voiceOn + ' off=' + voiceOff);
    if ((x.j.holderLines || []).length !== (off.holderLines || []).length) {
      b2bad.push('seed ' + x.seed + ': holder lines on=' + (x.j.holderLines || []).length + ' off=' + (off.holderLines || []).length);
    }
    // Every recorded voice line must itself be bare-A-free (the
    // detector and the recorded lines agree — no capture gap).
    (x.j.homebodyLines || []).concat(off.homebodyLines || []).forEach(function (l) {
      if (BARE_A_RE.test(l.line || '')) b2bad.push('seed ' + x.seed + ': bare-A inside a recorded voice line: ' + (l.line || '').slice(0, 120));
    });
  });
  check('B2: 0 bare-"A" lines on BOTH legs, BOTH lines (' + totBareOn + '/' + totBareOff + ' bare-A; ' + totVoiceOn + '/' + totVoiceOff + ' voice lines on/off)',
    b2bad.length === 0, b2bad.slice(0, 5).join(' | '));
  // B3: structural identity on/off.
  const STRUCT = ['gameDays', 'days', 'endReason', 'standing', 'scaleRank', 'maxWave', 'unlockedWave', 'won', 'villageLost', 'deaths', 'winPlanStats', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'vetSays', 'v4seeds', 'v4departs', 'v4gates', 'v4encounters', 'launchdefSkips', 'daily', 'samples'];
  let bad = [];
  onFiles.forEach(function (x, i) {
    const off = offFiles[i].j;
    STRUCT.forEach(function (k) {
      let a = x.j[k], b = off[k];
      if (k === 'dawnbidDeparts') { a = stripSeq(a); b = stripSeq(b); }
      if (JSON.stringify(a) !== JSON.stringify(b)) bad.push('seed ' + x.seed + ': guard-on vs guard-off differs in ' + k);
    });
    if ((x.j.sayCount | 0) !== (off.sayCount | 0)) {
      bad.push('seed ' + x.seed + ': sayCount on=' + (x.j.sayCount | 0) + ' off=' + (off.sayCount | 0));
    }
    if (JSON.stringify(x.j.blockedPicks) !== JSON.stringify(off.blockedPicks)) {
      bad.push('seed ' + x.seed + ': blockedPicks differ between guard-on and guard-off legs');
    }
  });
  check('B3: guard-on vs guard-off byte-identical on all 24 structural fields, all 8 seeds (dawnbidDeparts seq-stripped, per prereg)',
    bad.length === 0, bad.slice(0, 5).join(' | '));
  check('B3: sayCount identical on every seed (guard changes no live line text)',
    bad.filter(function (b) { return b.indexOf('sayCount') !== -1; }).length === 0,
    bad.filter(function (b) { return b.indexOf('sayCount') !== -1; }).slice(0, 3).join(' | '));
}

// ---------- 5. Wall numbers (informational, from the ON corpus) ----------
function wallNumbers() {
  console.log('== wall numbers (ON corpus, informational) ==');
  const rows = BAND.map(function (seed) {
    const f = path.join(CORPUS_ON_DIR, 'aguard-a-s' + seed + '-aguard-a-on.json');
    if (!fs.existsSync(f)) return null;
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  }).filter(Boolean);
  if (rows.length !== 8) { console.log('  info: ON corpus incomplete (' + rows.length + '/8), wall numbers skipped'); return; }
  const national = rows.filter(function (r) { return (r.standing | 0) >= 200; }).length;
  const natRank = rows.filter(function (r) { return (r.scaleRank === 'national' || r.scaleRank === 'National'); }).length;
  const table = rows.filter(function (r) { return r.won; }).length;
  const w4 = rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length;
  const w5 = rows.filter(function (r) { return (r.maxWave | 0) >= 5 || (r.unlockedWave | 0) >= 5; }).length;
  const days = rows.map(function (r) { return r.days | 0; }).sort(function (a, b) { return a - b; });
  const median = (days[3] + days[4]) / 2;
  const alive150 = rows.filter(function (r) { return (r.days | 0) >= 150; }).length;
  console.log('  info: national(standing>=200) ' + national + '/8; national rank ' + natRank + '/8; table/wins ' + table + '/8; wave4 ' + w4 + '/8; wave5 ' + w5 + '/8; median survival ' + median + 'd; alive at 150d ' + alive150 + '/8');
}

async function main() {
  try {
    staticChecks();
    await voiceLive();
    await liveRuns();
    corpusChecks();
    wallNumbers();
  } catch (e) {
    fail++;
    failures.push('threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
}

if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
module.exports = { voiceFixture: voiceFixture };
