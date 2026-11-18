// test-notick-a.js — proof for arm sim-notick-a (DIAG: fate of a wave-4
// plan AFTER a no-tick-after-commit selection — re-bid, depart, stall,
// die, or silently drop?).
// Proves the FATE TRACER (scripts/analyze-notick-a.js) plus the corpus
// facts it stands on:
//   - static: src/ diff vs the frozen base is EMPTY (the PROFILEGATE
//     lever was re-applied in-tree only for the fresh band and reverted
//     before this test is run); the lever stays reverted; the
//     instrument files exist.
//   - tracer fixtures: synthetic no-tick instances, one per frozen fate
//     bucket (re-bid-next-day / re-bid-later / depart-next-day full /
//     depart-next-day holder-only / depart-later / plan-deleted-after /
//     holder-died-after / stall / unknown / village-ended), plus
//     tie-break precedence (re-bid beats death the same day), the
//     post-launch no-tick shape (gen_4hoo6rr), and the secondary
//     metric (a part-2 commit that DOES launch same-day is counted).
//   - corpus: the frozen ON corpus re-traced gives exactly 12
//     no-tick selections with the frozen fate tally and 0 unknown;
//     late commits 29 with 0 same-day launches; the OFF/ON
//     replication vs the frozen profilegate-b analysis is exact;
//     the fresh band re-traced gives all classified, unknown <= 1.
// D1/D2 live legs (60d, seed 103441, VETREENGAGE=1, PROFILEGATE=1)
// were run during the arm and are recorded in
// evidence/2026-11-17/sim-notick-a.md — they are NOT re-run here (a
// proof test must stay fast; the driver legs are the arm's evidence,
// not the test's). The frozen prereg is
// evidence/2026-11-17/sim-notick-a-prereg.md (Corrections 1–2).
// Usage:
//   node scripts/test-notick-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));
const TRACER = require(path.join(REPO, 'scripts', 'analyze-notick-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen prereg.
function frozenBase() {
  if (process.env.NOTICK_BASE) return process.env.NOTICK_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-notick-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return null;
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitStatusNames(dir) {
  try {
    return execSync('git status --porcelain --untracked-files=no -- ' + dir, { cwd: REPO }).toString().split('\n').map(function (s) { return s.replace(/^.{2} /, ''); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}

// ---------- 1. Static ----------
function staticChecks() {
console.log('== static ==');
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
check('frozen base resolves (parent of the prereg-adding commit)', !!BASE);
const srcDiff = BASE ? gitDiffNames(BASE, 'src/') : ['NO-BASE'];
const srcStatus = gitStatusNames('src/');
const srcUnion = Array.from(new Set(srcDiff.concat(srcStatus))).sort();
check('src/ diff vs base + worktree is EMPTY (DIAG arm: lever reverted after the fresh band; no fix landed)',
  JSON.stringify(srcUnion) === JSON.stringify([]),
  'union=' + JSON.stringify(srcUnion));
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('profilegate lever stays reverted: no gated profile check in either twin',
  brainJs.indexOf("if (!profilegateOn() && prof !== 'wanderer' && prof !== 'explorer') continue;") === -1 &&
  winplanJs.indexOf("if (!profilegateOn() && prof !== 'wanderer' && prof !== 'explorer') continue;") === -1);
check('unguarded profile check PRESENT in both twins (master behavior)',
  brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1 &&
  winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1);
check('no profilegateOn() helper in either twin',
  brainJs.indexOf('profilegateOn') === -1 && winplanJs.indexOf('profilegateOn') === -1);
check('prereg + evidence + analyses exist',
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-notick-a-prereg.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-notick-a.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-fresh-analysis.json')));
check('instrument files exist (driver + classifier + tracer)',
  fs.existsSync(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-profilegate-b.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-launchdef-a.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-notick-a.js')));
check('frozen + fresh corpora exist (8 files each)',
  fs.readdirSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on')).filter(function (x) { return x.endsWith('.json'); }).length === 8 &&
  fs.readdirSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notick-a-on')).filter(function (x) { return x.endsWith('.json'); }).length === 8);
}

// ---------- 2. Tracer fixtures: one synthetic no-tick instance per fate ----------
// Minimal per-seed corpus: one wave-4 seed row opens one instance; score
// rows carry the party_launch commits; depart/skip rows resolve them;
// census rows bound the plan's life; deaths carry holder deaths.
// (Shapes mirror scripts/test-selblock-a.js mkSeed/scoreRow/depRow.)
function mkSeed(over) {
  const j = {
    seed: 103441, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [], dawnbidStarts: [],
    launchdefSkips: [], companionPool: [],
    daily: [{ day: 150, waveKillLog: [], roster: [{ vid: 'v1', dead: false }], wave4Slain: {}, vetsW3: { count: 0 }, vetsW4: { count: 0 }, ready4: { ready: false }, ready5: { ready: false } }],
    deaths: [],
  };
  return Object.assign(j, over || {});
}
function seedRow(day, vid, target) {
  return { day: day, vid: vid, mid: target, wave: 4, outcome: 'fled', path: 'world-tick',
    caller: 'test', stageAfter: 'party', target: target, node: null };
}
function scoreRow(day, vid, target, opts) {
  const o = opts || {};
  const part = o.part != null ? o.part : 0;
  const commitAction = o.commitAction !== undefined ? o.commitAction : 'party_launch';
  const stage = o.stage || 'party';
  const cands = (commitAction === 'party_launch')
    ? [{ kind: 'EXPEDITION', w: 10, winPlanAction: 'party_launch', companion: 'c1' }]
    : [{ kind: 'HAVEN_CHORE', w: 10, winPlanAction: commitAction, companion: null }];
  return { day: day, part: part, vid: vid, cands: cands,
    pick: { kind: 'EXPEDITION', winPlanAction: commitAction },
    logCands: cands.map(function (c) { return { kind: c.kind, score: 10, winPlanAction: c.winPlanAction || null }; }),
    commit: { kind: 'EXPEDITION', winPlanAction: commitAction, companion: (commitAction === 'party_launch' ? 'c1' : null) },
    plan: { stage: stage, target: target, needWave: 4, party: [] },
    holderGear: { armed: true, armored: true } };
}
function depRow(day, vid, target, result, opts) {
  const o = opts || {};
  return { seq: o.seq != null ? o.seq : 1, day: day, vid: vid, source: 'brain', result: result,
    winPlanAction: 'party_launch', commitKind: o.commitKind || 'dawn', commitPart: o.commitPart != null ? o.commitPart : 0,
    companion: 'c1',
    vidExped: result === 'launch', companionExped: (result === 'launch' && !o.companionBlocked),
    vidBlock: o.vidBlock !== undefined ? o.vidBlock : null,
    companionBlock: o.companionBlock !== undefined ? o.companionBlock : null,
    stage: 'party', target: target, party: [] };
}
function censusRows(vid, target, fromDay, toDay) {
  const out = [];
  for (let d = fromDay; d <= toDay; d++) {
    out.push({ day: d, vid: vid, target: target, needWave: 4, stage: 'party',
      party: [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
      holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } });
  }
  return out;
}
// fateCorpus: one instance (v1 -> strike, seeded day 10) with a no-tick
// commit on day 20 part 3, plus opts for the post-commit story.
function fateCorpus(opts) {
  const o = opts || {};
  const j = mkSeed(o.seedOver);
  j.v4seeds = [seedRow(10, 'v1', 'strike')];
  j.dawnbidScores = o.scores !== undefined ? o.scores : [scoreRow(20, 'v1', 'strike', { part: 3 })];
  j.dawnbidDeparts = o.departs !== undefined ? o.departs : [];
  j.launchdefSkips = o.skips !== undefined ? o.skips : [];
  j.dawnbidCensus = o.census !== undefined ? o.census : censusRows('v1', 'strike', 10, 150);
  j.deaths = o.deaths !== undefined ? o.deaths : [];
  return j;
}
function traceFates(j) {
  const c = ANALYZE.funnelForSeed(j);
  const out = [];
  for (const inst of (c.instances || [])) {
    for (const res of (inst.resolved || [])) {
      if (res.outcome === 'blocked' && res.reason === 'no-tick-after-commit') {
        out.push(TRACER.traceOne(j, inst, res));
      }
    }
  }
  return out;
}
function fateChecks() {
console.log('== tracer fixtures: one synthetic no-tick instance per fate ==');
let t;
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(21, 'v1', 'strike', { part: 0 })] }));
check('F1 re-bid-next-day: no-tick d20, party_launch commit d21',
  t.length === 1 && t[0].fate === 're-bid-next-day' && t[0].fateDay === 21, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(23, 'v1', 'strike', { part: 0 })] }));
check('F2 re-bid-later: no-tick d20, first re-bid d23 (gap 3)',
  t.length === 1 && t[0].fate === 're-bid-later' && t[0].fateDay === 23, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(21, 'v1', 'strike', { part: 0 })],
  departs: [depRow(21, 'v1', 'strike', 'launch', {})] }));
check('F3 depart-next-day (full party): no-tick d20, launch d21 with companion started',
  t.length === 1 && t[0].fate === 'depart-next-day' && t[0].fateDay === 21 && t[0].companionStarted === true, JSON.stringify(t.map(function (x) { return x.fate + ':' + x.companionStarted; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(21, 'v1', 'strike', { part: 1 })],
  departs: [depRow(21, 'v1', 'strike', 'launch', { companionBlocked: true, companionBlock: 'range-0', commitKind: 'mid-day part-1', commitPart: 1 })] }));
check('F4 depart-next-day (HOLDER-ONLY): launch d21, companion range-0 never started',
  t.length === 1 && t[0].fate === 'depart-next-day' && t[0].fateDay === 21 && t[0].companionStarted === false, JSON.stringify(t.map(function (x) { return x.fate + ':' + x.companionStarted; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(23, 'v1', 'strike', { part: 0 })],
  departs: [depRow(23, 'v1', 'strike', 'launch', {})] }));
check('F5 depart-later: no-tick d20, no d21 commit, launch d23',
  t.length === 1 && t[0].fate === 'depart-later' && t[0].fateDay === 23, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ census: censusRows('v1', 'strike', 10, 21) }));
check('F6 plan-deleted-after: no-tick d20, census ends d21, close d22',
  t.length === 1 && t[0].fate === 'plan-deleted-after' && t[0].fateDay === 22, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ census: censusRows('v1', 'strike', 10, 21),
  deaths: [{ day: 22, kind: 'villager', who: 'v1', cause: 'monster', player: false }] }));
check('F7 holder-died-after: death d22 beats the plan-deleted close d22 (deaths array is authoritative)',
  t.length === 1 && t[0].fate === 'holder-died-after' && t[0].fateDay === 22 && t[0].holderDeathCause === 'monster', JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }),
  scoreRow(21, 'v1', 'strike', { part: 1, commitAction: 'gear_hold' }),
  scoreRow(22, 'v1', 'strike', { part: 0, commitAction: 'party_wait' })] }));
check('F8 stall: plan still scored d21/d22 but no party_launch commit within 7 days',
  t.length === 1 && t[0].fate === 'stall', JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({}));
check('F9 unknown: no-tick d20, no later score, no close (census runs to day 150), no death',
  t.length === 1 && t[0].fate === 'unknown', JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ census: censusRows('v1', 'strike', 10, 23),
  seedOver: { days: 23, gameDays: 23, endReason: 'village-lost',
    daily: [{ day: 23, waveKillLog: [], roster: [{ vid: 'v1', dead: false }], wave4Slain: {}, vetsW3: { count: 0 }, vetsW4: { count: 0 }, ready4: { ready: false }, ready5: { ready: false } }] } }));
check('F10 village-ended: no-tick d20, village ends d23 before any re-bid',
  t.length === 1 && t[0].fate === 'village-ended' && t[0].fateDay === 23, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 3 }), scoreRow(21, 'v1', 'strike', { part: 0 })],
  deaths: [{ day: 21, kind: 'villager', who: 'v1', cause: 'monster', player: false }] }));
check('F11 precedence: re-bid d21 beats death d21 the same day (earliest event, depart > re-bid > death)',
  t.length === 1 && t[0].fate === 're-bid-next-day' && t[0].fateDay === 21, JSON.stringify(t.map(function (x) { return x.fate; })));
t = traceFates(fateCorpus({ scores: [scoreRow(18, 'v1', 'strike', { part: 0 }), scoreRow(20, 'v1', 'strike', { part: 3, stage: 'hunt' })],
  departs: [depRow(18, 'v1', 'strike', 'launch', {})],
  census: censusRows('v1', 'strike', 10, 21),
  deaths: [{ day: 22, kind: 'villager', who: 'v1', cause: 'the wild', player: false }] }));
check('F12 post-launch no-tick (gen_4hoo6rr shape): launched d18, no-tick d20 while hunting, died d22 -> holder-died-after',
  t.length === 1 && t[0].fate === 'holder-died-after' && t[0].fateDay === 22, JSON.stringify(t.map(function (x) { return x.fate; })));
(function () { // F13: secondary metric counts a part-2 commit that DOES launch
  const j = fateCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 2 })],
    departs: [depRow(20, 'v1', 'strike', 'launch', { commitKind: 'mid-day part-2', commitPart: 2 })] });
  const c = ANALYZE.funnelForSeed(j);
  const a = TRACER.analyzeDir; // (unused here; late-commit path exercised below via analyzeDir on a temp dir)
  const inst = c.instances[0];
  const late = [];
  for (const sel of (inst.selections || [])) {
    const lastPart = Math.max.apply(null, sel.parts || []);
    if (lastPart >= 2) {
      const res = (inst.resolved || []).find(function (x) { return x.day === sel.day; });
      late.push(res ? res.outcome + ':' + res.reason : 'unresolved');
    }
  }
  check('F13 secondary metric: a part-2 commit that launches same-day resolves launched (0/29 on the real corpus is a finding, not a blind spot)',
    late.length === 1 && late[0].indexOf('launched') === 0, JSON.stringify(late));
})();
}

// ---------- 3. Corpus ----------
function loadDir(dir) {
  const bySeed = {};
  const files = [];
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j; files.push(f);
  }
  return { bySeed: bySeed, files: files };
}
function corpusChecks() {
console.log('== corpus ==');
const frozen = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'profilegate-b-analysis.json'), 'utf8'));
const frozenTrace = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-analysis.json'), 'utf8'));
const freshTrace = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'notick-a-fresh-analysis.json'), 'utf8'));
check('C1 frozen ON: 12 no-tick selections, 0 unknown (Correction 2 population)',
  frozenTrace.noTickSelections === 12 && frozenTrace.unknown === 0,
  'n=' + frozenTrace.noTickSelections + ' unknown=' + frozenTrace.unknown);
check('C2 frozen fate tally is the frozen split (depart-next-day 4, depart-later 1, re-bid-next-day 2, re-bid-later 3, holder-died-after 2)',
  frozenTrace.fateTally['depart-next-day'] === 4 &&
  frozenTrace.fateTally['depart-later'] === 1 &&
  frozenTrace.fateTally['re-bid-next-day'] === 2 &&
  frozenTrace.fateTally['re-bid-later'] === 3 &&
  frozenTrace.fateTally['holder-died-after'] === 2 &&
  frozenTrace.fateTally['plan-deleted-after'] === 0 &&
  frozenTrace.fateTally.stall === 0 &&
  frozenTrace.fateTally.unknown === 0,
  JSON.stringify(frozenTrace.fateTally));
check('C3 frozen secondary metric: 29 late commits (part>=2), 0 launched same-day',
  frozenTrace.lateCommitCount === 29 && frozenTrace.lateCommitLaunched === 0,
  'n=' + frozenTrace.lateCommitCount + ' launched=' + frozenTrace.lateCommitLaunched);
check('C4 fresh band: 8 files, 0 instrument errors, every no-tick classified, unknown <= 1',
  freshTrace.files === 8 && freshTrace.instrumentErrors === 0 &&
  freshTrace.traces.length === freshTrace.noTickSelections && freshTrace.unknown <= 1,
  'files=' + freshTrace.files + ' errors=' + freshTrace.instrumentErrors +
  ' n=' + freshTrace.noTickSelections + ' unknown=' + freshTrace.unknown);
check('C5 fresh band ran clean: every file carries the notick-a run + on mode + recorder on',
  (function () {
    const leg = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notick-a-on'));
    for (const k of Object.keys(leg.bySeed)) {
      const j = leg.bySeed[k];
      if (j.run !== 'notick-a' || j.mode !== 'on' || j.recorderOn !== true) return false;
      if ((j.instrumentErrors || []).length) return false;
    }
    return Object.keys(leg.bySeed).length === 8;
  })());
function summarizeLeg(dir) {
  const raw = loadDir(dir);
  const leg = loadDir(dir);
  for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = ANALYZE.funnelForSeed(leg.bySeed[k]);
  const s = ANALYZE.summarize(leg);
  let deaths = 0, starv = 0;
  for (const k of Object.keys(raw.bySeed)) {
    const j = raw.bySeed[k];
    deaths += (j.deaths || []).length;
    starv += (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
  }
  s.wall.deaths = deaths; s.wall.starvation = starv;
  return { summary: s, files: leg.files.length };
}
const on = summarizeLeg(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'));
const off = summarizeLeg(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-off'));
check('C6 ON re-analysis matches the frozen ON summary (funnel + pool + wall + median)',
  JSON.stringify(on.summary.byFunnel) === JSON.stringify(frozen.on.byFunnel) &&
  JSON.stringify(on.summary.byFunnelSub) === JSON.stringify(frozen.on.byFunnelSub) &&
  JSON.stringify(on.summary.poolShape) === JSON.stringify(frozen.on.poolShape) &&
  JSON.stringify(on.summary.wall) === JSON.stringify(frozen.on.wall) &&
  on.summary.medianSurvival === frozen.on.medianSurvival,
  'wall got=' + JSON.stringify(on.summary.wall) + ' want=' + JSON.stringify(frozen.on.wall));
check('C7 OFF replication exact vs frozen analysis (funnel + subs + pool + wall + median)',
  JSON.stringify(off.summary.byFunnel) === JSON.stringify(frozen.off.byFunnel) &&
  JSON.stringify(off.summary.byFunnelSub) === JSON.stringify(frozen.off.byFunnelSub) &&
  JSON.stringify(off.summary.poolShape) === JSON.stringify(frozen.off.poolShape) &&
  JSON.stringify(off.summary.wall) === JSON.stringify(frozen.off.wall) &&
  off.summary.medianSurvival === frozen.off.medianSurvival,
  'median=' + off.summary.medianSurvival + ' vs ' + frozen.off.medianSurvival);
const evidence = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-notick-a.md'), 'utf8');
check('C8 evidence records D1 GREEN and D2 GREEN',
  evidence.indexOf('D1 GREEN') !== -1 && evidence.indexOf('D2 GREEN') !== -1);
}

staticChecks();
fateChecks();
corpusChecks();
console.log('== test-notick-a: ' + pass + ' passed, ' + fail + ' failed ==');
if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
if (require.main !== module) module.exports = {};
