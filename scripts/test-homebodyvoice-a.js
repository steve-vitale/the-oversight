// test-homebodyvoice-a.js — proof for arm sim-homebodyvoice-a (FICTION:
// one voice line when a dawn-bid pick cannot walk because the picked
// companion's max range is 0 — finding #2499, evidence/2026-11-17/
// sim-homebodyvoice-a-prereg.md, frozen bars B1–B5).
//   - static: the line site is present in writeCommit (villager-brain.js
//     only); the profile check in BOTH findCompanion twins is UNGUARDED
//     (the PROFILEGATE measurement lever is reverted); no PROFILEGATE
//     reference remains in src/.
//   - staged fixture (child process, one harness): a holder + homebody
//     companion scored as party_launch fires the line exactly once,
//     naming holder + companion + the reason; a second identical score
//     fires nothing; a second holder + the same companion fires once;
//     a holder + a WALKABLE companion fires nothing.
//   - live driver smoke: the homebodyvoice driver runs 5d on seed
//     103411 with 0 instrument errors (PROFILEGATE=1 + VETREENGAGE=1
//     in this process only — env flags, never src/).
//   - corpus checks: read evidence/2026-11-17/perseed-homebodyvoice-a-on/
//     (8 files, produced by the driver BEFORE this test's final run) and
//     judge B1-letter (day-78 Giulia+Jesse line on seed 103414, with the
//     pre-registered drift contingency), B2 (every line maps to a
//     range-0 blocked pick, ≤1 per pair, first occurrence fires, zero
//     lines for walkable picks), B4-letter (structural fields identical
//     to profilegate-b's ON corpus on the same band/flags, with the
//     pre-registered first-divergence-day drift rule), B5 (0 errors).
//   - control checks (§5, drift investigation — added after the frozen
//     comparison showed base drift): same-base no-line legs measure the
//     B1/B4 substance; they do NOT replace the frozen letter checks.
// Usage:
//   VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-homebodyvoice-a-on SEEDS=103411,103412 RUN=homebodyvoice-a node scripts/homebodyvoice-driver-20261117.js
//   node scripts/test-homebodyvoice-a.js
// The voice fixture runs in a child process (one harness per process):
//   node -e "require('./scripts/test-homebodyvoice-a.js').voiceFixture().then(function(r){console.log(JSON.stringify(r));})"
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
process.env.VETREENGAGE = '1';
const CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-homebodyvoice-a-on');
const PG_CORPUS_DIR = path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on');
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
  if (process.env.HOMEBODYVOICE_BASE) return process.env.HOMEBODYVOICE_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-homebodyvoice-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
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
  check('line site present in writeCommit (guard + dedup + text)',
    brainJs.indexOf("winPlanAction === 'party_launch'") !== -1 &&
    brainJs.indexOf('homebodySaid') !== -1 &&
    brainJs.indexOf('never leaves Haven') !== -1 &&
    brainJs.indexOf('stays behind.') !== -1);
  check('line guard mirrors the depart block (npcMaxDist < 1)',
    brainJs.indexOf('self.npcMaxDist') !== -1 && brainJs.indexOf('_hbMaxD < 1') !== -1);
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
    'scripts/homebodyvoice-driver-20261117.js',
    'scripts/test-homebodyvoice-a.js',
  ];
  const scriptsDiff = BASE ? gitDiffNames(BASE, 'scripts/') : [];
  const scriptsStatus = gitStatusNames('scripts/').filter(function (s) { return EXPECTED_SCRIPTS.indexOf(s) !== -1; });
  const scriptsUnion = Array.from(new Set(scriptsDiff.concat(scriptsStatus))).sort();
  check('scripts diff vs base + untracked is the homebodyvoice instrument only (2 files)',
    JSON.stringify(scriptsUnion) === JSON.stringify(EXPECTED_SCRIPTS.slice().sort()),
    'union=' + JSON.stringify(scriptsUnion));
  check('instrument files exist',
    EXPECTED_SCRIPTS.every(function (f) { return fs.existsSync(path.join(REPO, f)); }));
  const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'homebodyvoice-driver-20261117.js'), 'utf8');
  check('driver captures the line marker + blocked picks',
    driverSrc.indexOf('HOMEBODY_RE') !== -1 &&
    driverSrc.indexOf('never leaves Haven') !== -1 &&
    driverSrc.indexOf('blockedPicks') !== -1);
  check('driver is single-leg ON only (MODE must be on)',
    driverSrc.indexOf("if (MODE !== 'on')") !== -1);
  const DRIVER = require(path.join(REPO, 'scripts', 'homebodyvoice-driver-20261117.js'));
  check('driver exports oneRun',
    typeof DRIVER.oneRun === 'function');
}

// ---------- 2. Staged voice fixture (live, child process) ----------
// voiceFixture(): one harness. Stages two holders + one homebody + one
// walkable companion at Haven on day 0, wraps Game.say, and scores the
// four cases through the real vbrainScorePick (the line's site). The
// candidates are hand-built party_launch extras — findCompanion and the
// profile gate are NOT under test here (the line fires on the commit,
// whatever picked the companion).
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
    const { Game } = await loadGame({ seed: seed, mode: 'homebodyvoice-fixture', fullTelemetry: false });
    await setupGame(Game);
    Game.dayPart = 0; // day, not night (isNight() is dayPart === 3)
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
    const holders = [], homebodies = [], walkables = [];
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId) continue;
      if (!atHaven(rid) || !alive(rid)) continue;
      if (((v.away || {})[rid])) continue;
      const prof = profOf(rid);
      if (prof === 'homebody') homebodies.push(rid);
      else if ((prof === 'wanderer' || prof === 'explorer') && (maxDOf(rid) || 0) >= 1) walkables.push(rid);
      else holders.push(rid);
    }
    if (holders.length < 2 || !homebodies.length || !walkables.length) {
      return { stagingFailed: true, error: 'roles-missing', holders: holders.length, homebodies: homebodies.length, walkables: walkables.length };
    }
    const h1 = holders[0], h2 = holders[1], comp = homebodies[0], walk = walkables[0];
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
    function homebodyLines() { return lines.filter(function (l) { return l.indexOf('never leaves Haven') !== -1; }); }
    const s1 = scorePartyLaunch(h1, comp);
    const after1 = homebodyLines().slice();
    const s2 = scorePartyLaunch(h1, comp); // same pair again: dedup
    const after2 = homebodyLines().slice();
    const s3 = scorePartyLaunch(h2, comp); // second holder, same companion
    const after3 = homebodyLines().slice();
    const s4 = scorePartyLaunch(h1, walk); // walkable companion: silence
    const after4 = homebodyLines().slice();
    return {
      holder1: h1, holder1First: firstOf(h1),
      holder2: h2, holder2First: firstOf(h2),
      comp: comp, compFirst: firstOf(comp), compMaxD: maxDOf(comp),
      walk: walk, walkFirst: firstOf(walk), walkMaxD: maxDOf(walk),
      s1: s1, s2: s2, s3: s3, s4: s4,
      linesAfter1: after1, linesAfter2: after2, linesAfter3: after3, linesAfter4: after4,
    };
  }
}
function childVoiceFixture() {
  const script = "const t=require('./scripts/test-homebodyvoice-a.js');" +
    "t.voiceFixture().then(function(r){console.log(JSON.stringify(r));}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function voiceLive() {
  console.log('== voice fixture live (child process) ==');
  const r = childVoiceFixture();
  check('fixture staged (2 holders + homebody + walkable at Haven)',
    !r.error && !r.stagingFailed, JSON.stringify(r).slice(0, 300));
  if (r.error || r.stagingFailed) return;
  check('homebody companion is range-0 (maxD < 1)', (r.compMaxD | 0) < 1, 'maxD=' + r.compMaxD);
  check('walkable companion can walk (maxD >= 1)', (r.walkMaxD | 0) >= 1, 'maxD=' + r.walkMaxD);
  check('score 1 commits party_launch with the homebody',
    r.s1.commitAction === 'party_launch' && r.s1.commitCompanion === r.comp, JSON.stringify(r.s1));
  check('score 1 fires the line exactly once, naming holder + companion + reason',
    r.linesAfter1.length === 1 &&
    r.linesAfter1[0].indexOf(r.holder1First) !== -1 &&
    r.linesAfter1[0].indexOf(r.compFirst) !== -1 &&
    r.linesAfter1[0].indexOf('never leaves Haven') !== -1,
    JSON.stringify(r.linesAfter1));
  check('score 1 line text is the frozen wording',
    r.linesAfter1.length === 1 &&
    r.linesAfter1[0] === r.holder1First + ' asked ' + r.compFirst + ' to walk out with the party — but ' + r.compFirst + ' never leaves Haven, so ' + r.compFirst + ' stays behind.',
    JSON.stringify(r.linesAfter1));
  check('score 2 (same pair) fires nothing new (dedup)',
    r.linesAfter2.length === 1, JSON.stringify(r.linesAfter2));
  check('score 3 (second holder, same companion) fires exactly one new line naming the second holder',
    r.linesAfter3.length === 2 &&
    r.linesAfter3[1].indexOf(r.holder2First) !== -1 &&
    r.linesAfter3[1].indexOf(r.compFirst) !== -1,
    JSON.stringify(r.linesAfter3));
  check('score 4 (walkable companion) fires nothing new',
    r.linesAfter4.length === 2, JSON.stringify(r.linesAfter4));
  check('score 4 commits party_launch with the walkable companion',
    r.s4.commitAction === 'party_launch' && r.s4.commitCompanion === r.walk, JSON.stringify(r.s4));
}

// ---------- 3. Live driver smoke (5d, seed 103411) ----------
async function liveRuns() {
  console.log('== driver live smoke ==');
  process.env.DAYS = '5';
  process.env.PROFILEGATE = '1';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'homebodyvoice-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'homebodyvoice-driver-20261117.js'));
  const out = await driver.oneRun(103411);
  check('live driver run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live driver run carries homebodyLines + blockedPicks arrays',
    Array.isArray(out.homebodyLines) && Array.isArray(out.blockedPicks));
  check('live driver run carries v4 + dawnbid + pool arrays',
    Array.isArray(out.v4seeds) && Array.isArray(out.dawnbidScores) && Array.isArray(out.companionPool));
  check('live driver run policy sha is the frozen competent verbatim (df9b7dff4de4)',
    out.policySha === 'df9b7dff4de4', 'got ' + out.policySha);
  console.log('  info: live 5d run recorded ' + out.homebodyLines.length + ' homebody lines, ' +
    out.blockedPicks.length + ' blocked picks, ' + (out.companionPool || []).length + ' pool rows');
  return out;
}

// ---------- 4. Corpus checks (B1 / B2 / B4 / B5) ----------

// linePrefix(hf, cf): the frozen line's opening, role-sensitive.
// Substring matching is WRONG here: "Lena asked Naran" contains both
// 'Lena' and 'Naran', and would false-match the reversed pair
// (naran_tumen > lena_ruiz). The prefix pins holder vs companion.
function linePrefix(hf, cf) { return hf + ' asked ' + cf + ' to walk out'; }
function lineNames(line) {
  const m = /^([^ ]+) asked ([^ ]+) to walk out/.exec(line || '');
  return m ? { holderFirst: m[1], compFirst: m[2] } : null;
}
function loadCorpus(dir, seed) {
  const f = path.join(dir, 'homebodyvoice-a-s' + seed + '-homebodyvoice-a-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function loadPgCorpus(seed) {
  const f = path.join(PG_CORPUS_DIR, 'profilegate-b-s' + seed + '-profilegate-b-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function corpusChecks() {
  console.log('== corpus checks (B1/B2/B4/B5) ==');
  const files = BAND.map(function (seed) { return { seed: seed, j: loadCorpus(CORPUS_DIR, seed) }; });
  const missing = files.filter(function (x) { return !x.j; }).map(function (x) { return x.seed; });
  check('corpus present: 8/8 homebodyvoice-a ON files (run the driver first if missing)',
    missing.length === 0, 'missing seeds: ' + JSON.stringify(missing));
  if (missing.length) return;
  // B5 first (instrument): 0 errors on every file.
  const errSeeds = files.filter(function (x) { return (x.j.instrumentErrors || []).length !== 0; }).map(function (x) { return x.seed; });
  check('B5: 0 instrument errors on all 8 seeds', errSeeds.length === 0, 'error seeds: ' + JSON.stringify(errSeeds));
  check('B5: policy sha frozen on all 8 seeds',
    files.every(function (x) { return x.j.policySha === 'df9b7dff4de4'; }));
  // B1: seed 103414, day-78 Giulia+Jesse line (or the pre-registered drift contingency).
  const s14 = files.filter(function (x) { return x.seed === 103414; })[0].j;
  const lines14 = s14.homebodyLines || [];
  const d78 = lines14.filter(function (l) { return l.day === 78 && l.line.indexOf(linePrefix('Giulia', 'Jesse')) === 0; });
  let b1branch = 'none';
  if (d78.length === 1) b1branch = 'instance';
  else {
    // Drift contingency (frozen in the prereg): if the day-78 commit did
    // not reproduce, the bar is the first Giulia+Jesse blocked pick on
    // the same seed and a line firing on exactly that day naming them.
    const gj = (s14.blockedPicks || []).filter(function (r) { return r.holderFirst === 'Giulia' && r.compFirst === 'Jesse'; });
    if (gj.length) {
      const firstDay = Math.min.apply(null, gj.map(function (r) { return r.day; }));
      const hit = lines14.filter(function (l) { return l.day === firstDay && l.line.indexOf(linePrefix('Giulia', 'Jesse')) === 0; });
      if (hit.length === 1 && firstDay !== 78) b1branch = 'drift-contingency-day-' + firstDay;
    }
  }
  check('B1-letter: line fires on the d78 Jesse instance (Giulia+Jesse, seed 103414) — frozen rule',
    b1branch !== 'none', 'branch=' + b1branch + ' d78-hits=' + d78.length +
    ' giulia-jesse-picks=' + JSON.stringify((s14.blockedPicks || []).filter(function (r) { return r.holderFirst === 'Giulia' && r.compFirst === 'Jesse'; }).map(function (r) { return r.day; })));
  // B2: every line maps to a range-0 blocked pick; ≤1 per pair; first occurrence fires; zero for walkable picks.
  let b2bad = [];
  files.forEach(function (x) {
    const picks = x.j.blockedPicks || [];
    const lines = x.j.homebodyLines || [];
    // Group picks by exact pair (vid+companion).
    const groups = {};
    picks.forEach(function (r) {
      const k = r.vid + '>' + r.companion;
      if (!groups[k]) groups[k] = [];
      groups[k].push(r);
    });
    Object.keys(groups).forEach(function (k) {
      const rows = groups[k];
      const maxD = rows[0].maxD;
      const firstDay = Math.min.apply(null, rows.map(function (r) { return r.day; }));
      const hf = rows[0].holderFirst, cf = rows[0].compFirst;
      const prefix = linePrefix(hf, cf);
      const hits = lines.filter(function (l) { return l.day === firstDay && l.line.indexOf(prefix) === 0; });
      const anyHits = lines.filter(function (l) { return l.line.indexOf(prefix) === 0; });
      if (maxD != null && maxD < 1) {
        if (hits.length !== 1) b2bad.push('seed ' + x.seed + ' blocked pair ' + k + ' (' + hf + '+' + cf + '): ' + hits.length + ' lines on first day ' + firstDay + ', ' + anyHits.length + ' total');
        if (anyHits.length !== 1) b2bad.push('seed ' + x.seed + ' blocked pair ' + k + ': ' + anyHits.length + ' total lines (want 1)');
      } else {
        if (anyHits.length !== 0) b2bad.push('seed ' + x.seed + ' WALKABLE pair ' + k + ' (maxD=' + maxD + '): ' + anyHits.length + ' lines');
      }
    });
    // Every line must belong to some blocked pair (no orphan lines).
    // Parse the line's own (holder, companion) from its prefix — the
    // roles are in the wording, not in a substring search.
    lines.forEach(function (l) {
      const nm = lineNames(l.line);
      const ok = !!nm && picks.some(function (r) {
        return r.maxD != null && r.maxD < 1 && l.day === r.day &&
          r.holderFirst === nm.holderFirst && r.compFirst === nm.compFirst;
      });
      if (!ok) b2bad.push('seed ' + x.seed + ' orphan line day ' + l.day + ': ' + l.line.slice(0, 120));
    });
    // Line count must equal blocked-pair count (no extras, none missing).
    const blockedPairs = Object.keys(groups).filter(function (k) { return groups[k][0].maxD != null && groups[k][0].maxD < 1; }).length;
    if (lines.length !== blockedPairs) b2bad.push('seed ' + x.seed + ': ' + lines.length + ' lines vs ' + blockedPairs + ' blocked pairs');
  });
  check('B2: no walkable fire, no spam — every line maps to a range-0 pick, ≤1 per pair, first occurrence fires',
    b2bad.length === 0, b2bad.slice(0, 5).join(' | '));
  // B4: structural fields identical to profilegate-b's ON corpus; first-divergence-day drift rule.
  const STRUCT = ['gameDays', 'days', 'endReason', 'standing', 'scaleRank', 'maxWave', 'unlockedWave', 'won', 'villageLost', 'deaths', 'winPlanStats', 'dawnbidScores', 'dawnbidDeparts', 'companionPool', 'vetSays'];
  let b4bad = [];
  files.forEach(function (x) {
    const pg = loadPgCorpus(x.seed);
    if (!pg) { b4bad.push('seed ' + x.seed + ': profilegate-b ON corpus missing'); return; }
    const diffs = STRUCT.filter(function (f) { return JSON.stringify(x.j[f]) !== JSON.stringify(pg[f]); });
    if (!diffs.length) return;
    // First-divergence day from the daily snapshots (frozen B4 rule).
    let firstDiv = null;
    const a = x.j.daily || [], b = pg.daily || [];
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n; i++) {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) { firstDiv = (a[i] || b[i] || {}).day; break; }
    }
    const firstLine = (x.j.homebodyLines || []).length ? Math.min.apply(null, x.j.homebodyLines.map(function (l) { return l.day; })) : null;
    // No firing on this seed at all (no blocked pick ever occurred) means
    // the line never acted here — any divergence is drift by definition
    // (the frozen rule charges only a divergence ON OR AFTER a firing).
    if (firstLine == null) {
      console.log('  info: seed ' + x.seed + ' structural diff [' + diffs.join(',') + '] is base drift (no line ever fired on this seed)');
    } else if (firstDiv == null || firstDiv >= firstLine) {
      b4bad.push('seed ' + x.seed + ': structural diff in [' + diffs.join(',') + '], first-div-day=' + firstDiv + ', first-line-day=' + firstLine);
    } else {
      console.log('  info: seed ' + x.seed + ' structural diff [' + diffs.join(',') + '] is base drift (first-div-day ' + firstDiv + ' < first-line-day ' + firstLine + ')');
    }
  });
  check('B4-letter: trajectories match profilegate-b ON, or diverge only before the first line fires (frozen rule)',
    b4bad.length === 0, b4bad.slice(0, 5).join(' | '));
}

// ---------- 5. Control checks (drift investigation — NOT the frozen bars) ----------
// Added AFTER the frozen corpus comparison showed base drift: the frozen
// B1/B4 comparisons are against profilegate-b's ON corpus, measured on
// base eb2d3714f; this tree's base is 77a37fe91, and trajectories on this
// band moved between the two (profilegate-b's own rebase note documents
// the same drift killing seed 103413's plans). These checks measure the
// frozen bars' SUBSTANCE with a same-base control instead of a
// cross-base corpus comparison: the no-line legs in
// perseed-homebodyvoice-a-noline/ (same driver, same flags, same base,
// line block temporarily removed, byte-restored after — see evidence).
// They do NOT replace the frozen letter checks in §4, which stay
// reported as-is; the evidence judges the verdict from both and names
// the deviation. If §5 passes and §4 fails on drift alone, the bars'
// substance is proven and their frozen operationalizations are what
// failed (metric review in the evidence).
function loadNolineCorpus(seed) {
  const f = path.join(REPO, 'evidence', '2026-11-17', 'perseed-homebodyvoice-a-noline', 'homebodyvoice-a-s' + seed + '-homebodyvoice-a-on.json');
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function controlChecks() {
  console.log('== control checks (B1/B4 substance, same-base no-line legs) ==');
  const STRUCT = ['gameDays', 'days', 'endReason', 'standing', 'scaleRank', 'maxWave', 'unlockedWave', 'won', 'villageLost', 'deaths', 'winPlanStats', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'vetSays', 'v4seeds', 'v4departs', 'v4gates', 'v4encounters', 'launchdefSkips', 'daily', 'samples'];
  let bad = [];
  let totLines = 0, totSayDiff = 0;
  BAND.forEach(function (seed) {
    const f = path.join(CORPUS_DIR, 'homebodyvoice-a-s' + seed + '-homebodyvoice-a-on.json');
    if (!fs.existsSync(f)) { bad.push('seed ' + seed + ': line-on corpus missing'); return; }
    const line = JSON.parse(fs.readFileSync(f, 'utf8'));
    const nl = loadNolineCorpus(seed);
    if (!nl) { bad.push('seed ' + seed + ': no-line control corpus missing'); return; }
    STRUCT.forEach(function (k) {
      if (JSON.stringify(line[k]) !== JSON.stringify(nl[k])) bad.push('seed ' + seed + ': line-on vs no-line differs in ' + k);
    });
    if ((line.sayCount | 0) - (nl.sayCount | 0) !== (line.homebodyLines || []).length) {
      bad.push('seed ' + seed + ': sayCount diff != line firings');
    }
    totLines += (line.homebodyLines || []).length;
    totSayDiff += (line.sayCount | 0) - (nl.sayCount | 0);
  });
  check('B4-control: line-on vs no-line byte-identical on all 24 structural fields, all 8 seeds',
    bad.length === 0, bad.slice(0, 5).join(' | '));
  check('B4-control: sayCount diff equals line firings band-wide (' + totSayDiff + ' = ' + totLines + ')',
    totLines === totSayDiff);
  // B1-control: on the instance seed (103414), every Jesse blocked pick
  // is voiced exactly once on its first day (the finding's substance for
  // the Jesse instance, whatever holder picks him — the d78 Giulia+Jesse
  // pairing itself does not exist on this base, with or without the line).
  const s14 = JSON.parse(fs.readFileSync(path.join(CORPUS_DIR, 'homebodyvoice-a-s103414-homebodyvoice-a-on.json'), 'utf8'));
  const s14nl = loadNolineCorpus(103414);
  const jessePicks = (s14.blockedPicks || []).filter(function (r) { return r.compFirst === 'Jesse' && r.maxD != null && r.maxD < 1; });
  const jessePairs = {};
  jessePicks.forEach(function (r) { const k = r.vid + '>' + r.companion; if (!jessePairs[k]) jessePairs[k] = []; jessePairs[k].push(r); });
  let jesseBad = [];
  Object.keys(jessePairs).forEach(function (k) {
    const rows = jessePairs[k];
    const firstDay = Math.min.apply(null, rows.map(function (r) { return r.day; }));
    const hits = (s14.homebodyLines || []).filter(function (l) { return l.day === firstDay && l.line.indexOf(linePrefix(rows[0].holderFirst, 'Jesse')) === 0; });
    if (hits.length !== 1) jesseBad.push(k + ': ' + hits.length + ' lines on first day ' + firstDay);
  });
  check('B1-control: every Jesse blocked pick on seed 103414 is voiced exactly once on its first day (' + Object.keys(jessePairs).length + ' pairs)',
    jesseBad.length === 0, jesseBad.slice(0, 5).join(' | '));
  check('B1-control: the d78 Giulia+Jesse pairing is absent with AND without the line (base drift, not a line failure)',
    (s14.blockedPicks || []).filter(function (r) { return r.holderFirst === 'Giulia' && r.compFirst === 'Jesse'; }).length === 0 &&
    (s14nl.blockedPicks || []).filter(function (r) { return r.holderFirst === 'Giulia' && r.compFirst === 'Jesse'; }).length === 0);
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
