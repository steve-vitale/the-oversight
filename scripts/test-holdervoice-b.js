// test-holdervoice-b.js — proof for arm sim-holdervoice-b (FICTION:
// one voice line when a dawn-bid pick cannot walk because the HOLDER's
// max range is 0 — finding #2505, evidence/2026-11-17/
// sim-holdervoice-b-prereg.md, frozen bars B1–B5).
//   - static: the holder line site is present in writeCommit
//     (villager-brain.js only); the #2499 companion line is UNCHANGED;
//     the profile check in BOTH findCompanion twins is UNGUARDED
//     (the PROFILEGATE measurement lever is reverted); no PROFILEGATE
//     reference remains in src/.
//   - staged fixture (child process, one harness): a range-0 holder +
//     walkable companion scored as party_launch fires the holder line
//     exactly once, naming holder + companion + the reason; a second
//     identical score fires nothing; the same holder + a DIFFERENT
//     companion fires once; a WALKABLE holder fires nothing; a
//     BOTH-range-0 pair (range-0 holder + homebody companion) fires
//     BOTH lines once each, companion line first; a second holder +
//     the same companion fires once.
//   - live driver smoke: the holdervoice driver runs 5d on seed
//     103411 with 0 instrument errors (PROFILEGATE=1 + VETREENGAGE=1
//     in this process only — env flags, never src/).
//   - corpus checks: read evidence/2026-11-17/perseed-holdervoice-b-on/
//     (8 files, produced by the driver BEFORE this test's final run) and
//     judge B1 (state: every holder-range-0 blocked pick voiced exactly
//     once on its first day), B2 (no walkable fire, no spam, no orphans),
//     B5 (0 errors, policy sha frozen). Cross-base structural comparison
//     vs homebodyvoice-a's ON corpus is INFORMATIONAL ONLY (logged, not
//     a bar — the prereg registers B4 as the same-base control).
//   - control checks (§5, B4 substance): same-base no-line legs in
//     perseed-holdervoice-b-noline/ are byte-identical on all 24
//     structural fields, and the sayCount difference equals the
//     holder-line firings exactly.
// Usage:
//   VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-holdervoice-b-on SEEDS=103411,103412 RUN=holdervoice-b node scripts/holdervoice-driver-20261117.js
//   node scripts/test-holdervoice-b.js
// The voice fixture runs in a child process (one harness per process):
//   node -e "require('./scripts/test-holdervoice-b.js').voiceFixture().then(function(r){console.log(JSON.stringify(r));})"
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
const CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-holdervoice-b-on');
const HB_CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-homebodyvoice-a-on');
const NOLINE_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-holdervoice-b-noline');
const BAND = [103411, 103412, 103413, 103414, 103415, 103416, 103417, 103418];

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
  if (process.env.HOLDERVOICE_BASE) return process.env.HOLDERVOICE_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-holdervoice-b-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  try { return execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
  return null;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitStatusNames(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().split('\n').map(function (s) { return s.replace(/^.{2} /, ''); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
function staticChecks() {
  console.log('== static ==');
  const BASE = frozenBase();
  console.log('  info: frozen base ' + BASE);
  check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
  const EXPECTED_SRC = ['src/js/villager-brain.js'];
  const srcDiff = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
  const srcStatus = gitStatusNames('src/').filter(function (s) { return EXPECTED_SRC.indexOf(s) !== -1; });
  const srcUnion = Array.from(new Set(srcDiff.concat(srcStatus))).sort();
  check('src/ diff vs base + untracked is the line only (villager-brain.js)',
    JSON.stringify(srcUnion) === JSON.stringify(EXPECTED_SRC),
    'union=' + JSON.stringify(srcUnion));
  const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('holder line site present in writeCommit (guard + dedup + text)',
    brainJs.indexOf("winPlanAction === 'party_launch'") !== -1 &&
    brainJs.indexOf('holderSaid') !== -1 &&
    brainJs.indexOf('stays home.') !== -1 &&
    brainJs.indexOf('_hdMaxD < 1') !== -1);
  check('holder line guard mirrors the depart holder block (npcMaxDist(vid) < 1)',
    brainJs.indexOf('self.npcMaxDist(vid)') !== -1 || brainJs.indexOf('npcMaxDist ? self.npcMaxDist(vid)') !== -1);
  check('#2499 companion line UNCHANGED (guard + dedup + text still present)',
    brainJs.indexOf('homebodySaid') !== -1 &&
    brainJs.indexOf('stays behind.') !== -1 &&
    brainJs.indexOf('_hbMaxD < 1') !== -1);
  check('unguarded profile check PRESENT in both findCompanion twins (measurement lever reverted)',
    brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1 &&
    winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1);
  check('no PROFILEGATE reference remains in src/ (lever reverted)',
    brainJs.indexOf('PROFILEGATE') === -1 && winplanJs.indexOf('PROFILEGATE') === -1 &&
    brainJs.indexOf('profilegateOn') === -1 && winplanJs.indexOf('profilegateOn') === -1);
  check('win-plan.js untouched by this arm',
    BASE ? gitDiffNames(BASE, 'src/js/win-plan.js').length === 0 : false,
    'win-plan diff=' + JSON.stringify(BASE ? gitDiffNames(BASE, 'src/js/win-plan.js') : null));
  const EXPECTED_SCRIPTS = [
    'scripts/holdervoice-driver-20261117.js',
    'scripts/test-holdervoice-b.js',
  ];
  const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
  const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
  const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
  check('scripts diff vs base + untracked is the holdervoice instrument only (2 files)',
    JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
    'union=' + JSON.stringify(scriptsUnion));
  check('instrument files exist',
    EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'holdervoice-driver-20261117.js'), 'utf8');
  check('driver captures the holder marker + holderMaxD + blocked picks',
    driverSrc.indexOf('HOLDER_RE') !== -1 &&
    driverSrc.indexOf('stays home') !== -1 &&
    driverSrc.indexOf('holderLines') !== -1 &&
    driverSrc.indexOf('holderMaxD') !== -1 &&
    driverSrc.indexOf('blockedPicks') !== -1);
  check('driver keeps the companion-line capture (homebodyLines, never leaves Haven)',
    driverSrc.indexOf('HOMEBODY_RE') !== -1 &&
    driverSrc.indexOf('never leaves Haven') !== -1 &&
    driverSrc.indexOf('homebodyLines') !== -1);
  check('driver is single-leg ON only (MODE must be on)',
    driverSrc.indexOf("if (MODE !== 'on')") !== -1);
  const DRIVER = require(path.join(REPO, 'scripts', 'holdervoice-driver-20261117.js'));
  check('driver exports oneRun',
    typeof DRIVER.oneRun === 'function');
}

// ---------- 2. Staged voice fixture (live, child process) ----------
// voiceFixture(): one harness. Stages two range-0 holders + one walkable
// holder + one homebody companion + two walkable companions at Haven on
// day 0, wraps Game.say, and scores the six cases through the real
// vbrainScorePick (the line's site). The candidates are hand-built
// party_launch extras — findCompanion and the profile gate are NOT under
// test here (the line fires on the commit, whatever picked the companion).
// A party_launch extra deterministically overrides the core lottery pick
// (vbrainScorePick: win-plan holds/launches outrank the soft lottery).
async function voiceFixture() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  let lastFailure = null;
  for (const seed of [103413, 103411, 103412, 103414, 103415]) {
    const r = await attemptSeed(seed);
    if (r && !r.stagingFailed) { r.seed = seed; return r; }
    lastFailure = r;
  }
  return lastFailure || { error: 'no-seed-staged' };
  async function attemptSeed(seed) {
    const { Game } = await loadGame({ seed: seed, mode: 'holdervoice-fixture', fullTelemetry: false });
    await setupGame(Game);
    Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
    // Post-System staging: displayName returns a real name only once the
    // System has arrived (or the name is earned socially) — before that
    // it returns a stranger descriptor ("A man, maybe 20s") whose first
    // token is "A", and every line would read "A meant to walk out with
    // A". Live, party_launch picks happen weeks in, post-arrival (496/496
    // blocked picks on the homebodyvoice-a corpus carry real first names,
    // 0 "A"-names), so the fixture stages the post-arrival state the line
    // actually fires in. This stages the world, not the game code.
    try { if (Game.state) Game.state.systemArrived = true; } catch (e) {}
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
    const s1 = scorePartyLaunch(h0, compW);
    const after1 = { holder: holderLines().slice(), comp: compLines().slice() };
    const s2 = scorePartyLaunch(h0, compW); // same pair again: dedup
    const after2 = { holder: holderLines().slice(), comp: compLines().slice() };
    const s3 = scorePartyLaunch(h0, compW2); // same holder, DIFFERENT companion
    const after3 = { holder: holderLines().slice(), comp: compLines().slice() };
    const s4 = scorePartyLaunch(hw, compW); // walkable holder: silence
    const after4 = { holder: holderLines().slice(), comp: compLines().slice() };
    const s5 = scorePartyLaunch(h0, compH); // BOTH range-0: both lines, companion first
    const after5 = { holder: holderLines().slice(), comp: compLines().slice() };
    const s6 = scorePartyLaunch(h1, compW); // second holder, same companion
    const after6 = { holder: holderLines().slice(), comp: compLines().slice() };
    return {
      holder0: h0, holder0First: firstOf(h0), holder0MaxD: maxDOf(h0),
      holder1: h1, holder1First: firstOf(h1), holder1MaxD: maxDOf(h1),
      holderWalk: hw, holderWalkFirst: firstOf(hw), holderWalkMaxD: maxDOf(hw),
      compH: compH, compHFirst: firstOf(compH), compHMaxD: maxDOf(compH),
      compW: compW, compWFirst: firstOf(compW), compWMaxD: maxDOf(compW),
      compW2: compW2, compW2First: firstOf(compW2), compW2MaxD: maxDOf(compW2),
      s1: s1, s2: s2, s3: s3, s4: s4, s5: s5, s6: s6,
      linesAfter1: after1, linesAfter2: after2, linesAfter3: after3,
      linesAfter4: after4, linesAfter5: after5, linesAfter6: after6,
    };
  }
}
function childVoiceFixture() {
  const script = "const t=require('./scripts/test-holdervoice-b.js');" +
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
  check('score 1 commits party_launch with the walkable companion',
    r.s1.commitAction === 'party_launch' && r.s1.commitCompanion === r.compW, JSON.stringify(r.s1));
  check('score 1 fires the holder line exactly once, naming holder + companion + reason',
    r.linesAfter1.holder.length === 1 &&
    r.linesAfter1.holder[0].indexOf(r.holder0First) !== -1 &&
    r.linesAfter1.holder[0].indexOf(r.compWFirst) !== -1 &&
    r.linesAfter1.holder[0].indexOf('never leaves Haven') !== -1 &&
    r.linesAfter1.comp.length === 0,
    JSON.stringify(r.linesAfter1));
  check('score 1 holder line text is the frozen wording',
    r.linesAfter1.holder.length === 1 &&
    r.linesAfter1.holder[0] === r.holder0First + ' meant to walk out with ' + r.compWFirst + ' — but ' + r.holder0First + ' never leaves Haven, so ' + r.holder0First + ' stays home.',
    JSON.stringify(r.linesAfter1.holder));
  check('score 2 (same pair) fires nothing new (dedup)',
    r.linesAfter2.holder.length === 1 && r.linesAfter2.comp.length === 0, JSON.stringify(r.linesAfter2));
  check('score 3 (same holder, different companion) fires exactly one new holder line naming the new companion',
    r.linesAfter3.holder.length === 2 &&
    r.linesAfter3.holder[1].indexOf(r.holder0First) !== -1 &&
    r.linesAfter3.holder[1].indexOf(r.compW2First) !== -1 &&
    r.linesAfter3.comp.length === 0,
    JSON.stringify(r.linesAfter3));
  check('score 4 (walkable holder) fires nothing new',
    r.linesAfter4.holder.length === 2 && r.linesAfter4.comp.length === 0, JSON.stringify(r.linesAfter4));
  check('score 4 commits party_launch with the walkable companion',
    r.s4.commitAction === 'party_launch' && r.s4.commitCompanion === r.compW, JSON.stringify(r.s4));
  check('score 5 (both range-0) fires BOTH lines once each, companion line first',
    r.linesAfter5.holder.length === 3 && r.linesAfter5.comp.length === 1 &&
    r.linesAfter5.comp[0].indexOf(r.holder0First) !== -1 &&
    r.linesAfter5.comp[0].indexOf(r.compHFirst) !== -1 &&
    r.linesAfter5.holder[2].indexOf(r.holder0First) !== -1 &&
    r.linesAfter5.holder[2].indexOf(r.compHFirst) !== -1,
    JSON.stringify(r.linesAfter5));
  check('score 5 companion line text is the frozen #2499 wording',
    r.linesAfter5.comp.length === 1 &&
    r.linesAfter5.comp[0] === r.holder0First + ' asked ' + r.compHFirst + ' to walk out with the party — but ' + r.compHFirst + ' never leaves Haven, so ' + r.compHFirst + ' stays behind.',
    JSON.stringify(r.linesAfter5.comp));
  check('score 6 (second holder, same companion) fires exactly one new holder line naming the second holder',
    r.linesAfter6.holder.length === 4 &&
    r.linesAfter6.holder[3].indexOf(r.holder1First) !== -1 &&
    r.linesAfter6.holder[3].indexOf(r.compWFirst) !== -1 &&
    r.linesAfter6.comp.length === 1,
    JSON.stringify(r.linesAfter6));
}

// ---------- 3. Live driver smoke (5d, seed 103411) ----------
async function liveRuns() {
  console.log('== driver live smoke ==');
  process.env.DAYS = '5';
  process.env.PROFILEGATE = '1';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'holdervoice-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'holdervoice-driver-20261117.js'));
  const out = await driver.oneRun(103411);
  check('live driver run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live driver run carries holderLines + homebodyLines + blockedPicks arrays',
    Array.isArray(out.holderLines) && Array.isArray(out.homebodyLines) && Array.isArray(out.blockedPicks));
  check('live driver run carries v4 + dawnbid + pool arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.dawnbidScores) && Array.isArray(out.companionPool));
  check('live driver run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + out.holderLines.length + ' holder lines, ' +
    out.homebodyLines.length + ' voice lines, ' + out.blockedPicks.length + ' blocked picks, ' +
    (out.companionPool || []).length + ' pool rows');
  return out;
}

// ---------- 4. Corpus checks (B1 / B2 / B5) ----------

// holderPrefix(hf, cf): the frozen holder line's opening, role-sensitive.
// Substring matching is WRONG here: "Lena asked Naran" contains both
// 'Lena' and 'Naran', and would false-match the reversed pair.
// The prefix pins holder vs companion (the homebodyvoice-a B2 lesson).
function holderPrefix(hf, cf) { return hf + ' meant to walk out with ' + cf; }
function holderLineNames(line) {
  const m = /^([^ ]+) meant to walk out with ([^ ]+)/.exec(line || '');
  return m ? { holderFirst: m[1], compFirst: m[2] } : null;
}
function loadCorpus(dir, seed) {
  const f = path.join(dir, 'holdervoice-b-s' + seed + '-holdervoice-b-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function loadHbCorpus(seed) {
  const f = path.join(HB_CORPUS_DIR, 'homebodyvoice-a-s' + seed + '-homebodyvoice-a-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function corpusChecks() {
  console.log('== corpus checks (B1/B2/B5) ==');
  const files = BAND.map(function (seed) { return { seed: seed, j: loadCorpus(CORPUS_DIR, seed) }; });
  const missing = files.filter(function (x) { return !x.j; }).map(function (x) { return x.seed; });
  check('corpus present: 8/8 holdervoice-b ON files (run the driver first if missing)',
    missing.length === 0, 'missing seeds: ' + JSON.stringify(missing));
  if (missing.length) return;
  // B5 first (instrument): 0 errors on every file.
  const errSeeds = files.filter(function (x) { return (x.j.instrumentErrors || []).length !== 0; }).map(function (x) { return x.seed; });
  check('B5: 0 instrument errors on all 8 seeds', errSeeds.length === 0, 'error seeds: ' + JSON.stringify(errSeeds));
  check('B5: policy sha frozen on all 8 seeds',
    files.every(function (x) { return x.j.policySha === 'df9b7dff4de4'; }));
  // B1 + B2: group blocked picks by exact pair (vid+companion); the
  // holder line fires iff holderMaxD < 1, exactly once, on the pair's
  // first-occurrence day; walkable-holder pairs get zero lines; every
  // line maps to a holder-blocked row (no orphans).
  let b1bad = [], b2bad = [];
  files.forEach(function (x) {
    const picks = x.j.blockedPicks || [];
    const lines = x.j.holderLines || [];
    const groups = {};
    picks.forEach(function (r) {
      const k = r.vid + '>' + r.companion;
      if (!groups[k]) groups[k] = [];
      groups[k].push(r);
    });
    Object.keys(groups).forEach(function (k) {
      const rows = groups[k];
      const hMaxD = rows[0].holderMaxD;
      const firstDay = Math.min.apply(null, rows.map(function (r) { return r.day; }));
      const hf = rows[0].holderFirst, cf = rows[0].compFirst;
      const prefix = holderPrefix(hf, cf);
      const hits = lines.filter(function (l) { return l.day === firstDay && l.line.indexOf(prefix) === 0; });
      const anyHits = lines.filter(function (l) { return l.line.indexOf(prefix) === 0; });
      if (hMaxD != null && hMaxD < 1) {
        if (hits.length !== 1) b1bad.push('seed ' + x.seed + ' holder-blocked pair ' + k + ' (' + hf + '+' + cf + '): ' + hits.length + ' lines on first day ' + firstDay + ', ' + anyHits.length + ' total');
        if (anyHits.length !== 1) b1bad.push('seed ' + x.seed + ' holder-blocked pair ' + k + ': ' + anyHits.length + ' total lines (want 1)');
      } else {
        if (anyHits.length !== 0) b2bad.push('seed ' + x.seed + ' WALKABLE-holder pair ' + k + ' (holderMaxD=' + hMaxD + '): ' + anyHits.length + ' lines');
      }
    });
    // Every holder line must belong to some holder-blocked pair (no orphan lines).
    lines.forEach(function (l) {
      const nm = holderLineNames(l.line);
      const ok = !!nm && picks.some(function (r) {
        return r.holderMaxD != null && r.holderMaxD < 1 && l.day === r.day &&
          r.holderFirst === nm.holderFirst && r.compFirst === nm.compFirst;
      });
      if (!ok) b2bad.push('seed ' + x.seed + ' orphan holder line day ' + l.day + ': ' + l.line.slice(0, 120));
    });
    // Holder-line count must equal holder-blocked-pair count (no extras, none missing).
    const blockedPairs = Object.keys(groups).filter(function (k) { return groups[k][0].holderMaxD != null && groups[k][0].holderMaxD < 1; }).length;
    if (lines.length !== blockedPairs) b1bad.push('seed ' + x.seed + ': ' + lines.length + ' holder lines vs ' + blockedPairs + ' holder-blocked pairs');
  });
  check('B1: every holder-range-0 blocked pick voiced exactly once on its first day, band-wide',
    b1bad.length === 0, b1bad.slice(0, 5).join(' | '));
  check('B2: no walkable-holder fire, no spam, no orphans — every line maps to a holder-range-0 pick, ≤1 per pair',
    b2bad.length === 0, b2bad.slice(0, 5).join(' | '));
  // Informational ONLY (not a bar): structural comparison vs the
  // homebodyvoice-a ON corpus (same band/flags, companion line only).
  // The two corpora should differ ONLY in the say stream (holder lines
  // added); any structural diff is logged for the evidence, never gated.
  const STRUCT = ['gameDays', 'days', 'endReason', 'standing', 'scaleRank', 'maxWave', 'unlockedWave', 'won', 'villageLost', 'deaths', 'winPlanStats', 'dawnbidScores', 'dawnbidDeparts', 'companionPool', 'vetSays'];
  files.forEach(function (x) {
    const hb = loadHbCorpus(x.seed);
    if (!hb) { console.log('  info: seed ' + x.seed + ' homebodyvoice-a ON corpus missing (cross-base info skipped)'); return; }
    const diffs = STRUCT.filter(function (f) { return JSON.stringify(x.j[f]) !== JSON.stringify(hb[f]); });
    const sayDiff = (x.j.sayCount | 0) - (hb.sayCount | 0);
    console.log('  info: seed ' + x.seed + ' vs homebodyvoice-a ON: structural diffs [' + diffs.join(',') + '], sayCount diff ' + sayDiff + ' vs holder lines ' + (x.j.holderLines || []).length);
  });
}

// ---------- 5. Control checks (B4 substance, same-base no-line legs) ----------
// The no-line legs in perseed-holdervoice-b-noline/ (same driver, same
// flags, same base, holder-line block temporarily removed, byte-restored
// after — see evidence) measure B4's substance: the holder line moves no
// game outcome. Invocation pattern matches the ON legs exactly (each seed
// its own process, same order), so the driver's module-level `seq`
// counter histories match and cannot false-diff.
function loadNolineCorpus(seed) {
  const f = path.join(NOLINE_DIR, 'holdervoice-b-s' + seed + '-holdervoice-b-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function controlChecks() {
  console.log('== control checks (B4 substance, same-base no-line legs) ==');
  const STRUCT = ['gameDays', 'days', 'endReason', 'standing', 'scaleRank', 'maxWave', 'unlockedWave', 'won', 'villageLost', 'deaths', 'winPlanStats', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'vetSays', 'v4seeds', 'v4departs', 'v4gates', 'v4encounters', 'launchdefSkips', 'daily', 'samples'];
  let bad = [];
  let totLines = 0, totSayDiff = 0;
  BAND.forEach(function (seed) {
    const f = path.join(CORPUS_DIR, 'holdervoice-b-s' + seed + '-holdervoice-b-on.json');
    if (!fs.existsSync(f)) { bad.push('seed ' + seed + ': line-on corpus missing'); return; }
    const line = JSON.parse(fs.readFileSync(f, 'utf8'));
    const nl = loadNolineCorpus(seed);
    if (!nl) { bad.push('seed ' + seed + ': no-line control corpus missing'); return; }
    STRUCT.forEach(function (k) {
      if (JSON.stringify(line[k]) !== JSON.stringify(nl[k])) bad.push('seed ' + seed + ': line-on vs no-line differs in ' + k);
    });
    if ((line.sayCount | 0) - (nl.sayCount | 0) !== (line.holderLines || []).length) {
      bad.push('seed ' + seed + ': sayCount diff != holder-line firings');
    }
    // The no-line legs must carry the same blocked picks (the state
    // exists with and without the line) and zero holder lines.
    if (JSON.stringify(line.blockedPicks) !== JSON.stringify(nl.blockedPicks)) {
      bad.push('seed ' + seed + ': blockedPicks differ between line-on and no-line legs');
    }
    if ((nl.holderLines || []).length !== 0) {
      bad.push('seed ' + seed + ': no-line leg recorded ' + (nl.holderLines || []).length + ' holder lines');
    }
    totLines += (line.holderLines || []).length;
    totSayDiff += (line.sayCount | 0) - (nl.sayCount | 0);
  });
  check('B4: line-on vs no-line byte-identical on all 24 structural fields, all 8 seeds',
    bad.length === 0, bad.slice(0, 5).join(' | '));
  check('B4: sayCount diff equals holder-line firings band-wide (' + totSayDiff + ' = ' + totLines + ')',
    totLines === totSayDiff);
}

async function main() {
  try {
    staticChecks();
    await voiceLive();
    await liveRuns();
    corpusChecks();
    controlChecks();
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
