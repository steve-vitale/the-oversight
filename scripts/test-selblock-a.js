// test-selblock-a.js — proof for arm sim-selblock-a (DIAG: classify finding
// #2498 — what blocks a selected party after the profile gate fills the
// pool). No game change in this arm: nothing in src/ is touched, and the
// PROFILEGATE lever is never re-applied. This test proves the
// CLASSIFICATION INSTRUMENT plus the corpus facts it stands on:
//   - static: src/ diff vs the frozen base is EMPTY; the profilegate
//     lever stays reverted (unguarded profile check in both twins, no
//     profilegateOn()); the instrument files exist.
//   - analyzer fixtures: synthetic selected-blocked instances, one per
//     frozen bucket (inviter-sick / inviter-range-0 / inviter-hurt /
//     companion-not-started:sick / companion-not-started:range-0 /
//     danger-gate / night / not-at-haven / no-tick-after-commit /
//     selected-not-executed / commit-overwritten-midday:<action>), plus
//     the unknown bucket (inviter-exped-failed-unknown, depart `hold`
//     with no vidBlock), plus first-blocked-resolution precedence
//     (two blocked selections -> the FIRST names the instance).
//   - corpus: the real profilegate-b ON corpus re-analyzed gives exactly
//     12 selected-blocked with the frozen sub-tally (range-0 6,
//     no-tick-after-commit 3, sick 1, hurt 1, companion-not-started:sick
//     1), 0 unknown; the OFF corpus re-analyzed reproduces the frozen
//     analysis exactly (funnel + pool shape + wall + median).
// D1/D2 live legs (60d, seed 103411, VETREENGAGE=1, PROFILEGATE unset)
// were run during the arm and are recorded in
// evidence/2026-11-17/sim-selblock-a.md — they are NOT re-run here (a
// proof test must stay fast; the driver legs are the arm's evidence,
// not the test's). The frozen prereg is
// evidence/2026-11-17/sim-selblock-a-prereg.md.
// Usage:
//   node scripts/test-selblock-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
// frozenBase(): the parent of the commit that ADDED the frozen prereg.
function frozenBase() {
  if (process.env.SELBLOCK_BASE) return process.env.SELBLOCK_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-selblock-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
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
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().split('\n').map(function (s) { return s.replace(/^.{2} /, ''); }).filter(Boolean);
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
check('src/ diff vs base + worktree is EMPTY (DIAG arm: no game change, lever never re-applied)',
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
check('prereg + evidence files exist',
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-selblock-a-prereg.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-selblock-a.md')));
check('profilegate-b instrument + corpora this arm reads still exist',
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-profilegate-b.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'profilegate-driver-20261117.js')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'profilegate-b-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-off')));
}

// ---------- 2. Analyzer fixtures: one synthetic instance per bucket ----------
// Minimal per-seed corpus: one wave-4 seed row opens one instance; score
// rows carry the party_launch commits; depart/skip rows resolve them.
// (Shapes mirror scripts/test-profilegate-b.js mkSeed/scoreRow/depRow.)
function mkSeed(over) {
  const j = {
    seed: 103411, days: 150, gameDays: 150, endReason: 'survived',
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
  const cands = [{ kind: 'winplan', w: 10, winPlanAction: 'party_launch', companion: 'c1' }];
  return { day: day, part: part, vid: vid, cands: cands,
    pick: { kind: 'winplan', winPlanAction: commitAction },
    logCands: cands.map(function (c) { return { kind: c.kind, score: 10, winPlanAction: c.winPlanAction || null }; }),
    commit: { kind: 'winplan', winPlanAction: commitAction, companion: 'c1' },
    plan: { stage: 'party', target: target, needWave: 4, party: ['c1'] },
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
function skipRow(day, vid, target, reason, opts) {
  const o = opts || {};
  return { seq: o.seq != null ? o.seq : 1, day: day, part: o.part != null ? o.part : 3,
    vid: vid, target: target, stage: 'party', party: [], commitKind: o.commitKind || 'dawn',
    leg: 'on', reason: reason, executeResult: null,
    raw: { profile: 'homebody', node: { nx: 4, ny: 4 }, haven: true, exped: false, away: false,
      night: false, engaged: false, indoor: false, danger: false, dead: false } };
}
// blockedCorpus: one instance (v1 -> strike, seeded day 10) with one
// selection on day 20 unless opts.selections says otherwise.
function blockedCorpus(opts) {
  const o = opts || {};
  const j = mkSeed();
  j.v4seeds = [seedRow(10, 'v1', 'strike')];
  j.dawnbidScores = o.scores !== undefined ? o.scores : [scoreRow(20, 'v1', 'strike')];
  j.dawnbidDeparts = o.departs !== undefined ? o.departs : [];
  j.launchdefSkips = o.skips !== undefined ? o.skips : [];
  return j;
}
function firstBlocked(j) {
  const r = ANALYZE.funnelForSeed(j);
  const inst = r.instances[0];
  if (!inst) return { bucket: 'NO-INSTANCE', sub: null, r: r };
  return { bucket: inst.funnelBucket, sub: inst.funnelSub, inst: inst, r: r };
}
function bucketChecks() {
console.log('== analyzer fixtures: selected-blocked buckets ==');
let t;
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'hold', { vidBlock: 'range-0' })] }));
check('S1 inviter-range-0: depart hold, holder npcMaxDist<1', t.bucket === 'selected-blocked' && t.sub === 'inviter-range-0', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'hold', { vidBlock: 'sick' })] }));
check('S2 inviter-sick: depart hold, holder sick', t.bucket === 'selected-blocked' && t.sub === 'inviter-sick', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'hold', { vidBlock: 'hurt-no-medicine-no-healer' })] }));
check('S3 inviter-hurt: depart hold, holder hurt with no medicine/healer', t.bucket === 'selected-blocked' && t.sub === 'inviter-hurt', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'launch', { companionBlocked: true, companionBlock: 'sick' })] }));
check('S4 companion-not-started:sick: holder launches, companion sick', t.bucket === 'selected-blocked' && t.sub === 'companion-not-started:sick', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'launch', { companionBlocked: true, companionBlock: 'range-0' })] }));
check('S5 companion-not-started:range-0: holder launches, companion range-0 (homebody companion)', t.bucket === 'selected-blocked' && t.sub === 'companion-not-started:range-0', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'normal')],
  skips: [skipRow(20, 'v1', 'strike', 'danger-gate', { part: 1 })] }));
check('S6 danger-gate: depart normal + first skip danger-gate', t.bucket === 'selected-blocked' && t.sub === 'danger-gate', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'normal')],
  skips: [skipRow(20, 'v1', 'strike', 'night', { part: 3 })] }));
check('S7 night: depart normal + skip night', t.bucket === 'selected-blocked' && t.sub === 'night', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [],
  skips: [skipRow(20, 'v1', 'strike', 'not-at-haven', { part: 0 }), skipRow(20, 'v1', 'strike', 'not-at-haven', { part: 1 })] }));
check('S8 not-at-haven: no depart row, skip rows only', t.bucket === 'selected-blocked' && t.sub === 'not-at-haven', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 2 })], departs: [], skips: [] }));
check('S9 no-tick-after-commit: last commit at part-2, no depart/skip row', t.bucket === 'selected-blocked' && t.sub === 'no-tick-after-commit', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 0 })], departs: [], skips: [] }));
check('S10 selected-not-executed: dawn commit, no depart/skip row at all', t.bucket === 'selected-blocked' && t.sub === 'selected-not-executed', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ scores: [scoreRow(20, 'v1', 'strike', { part: 0 }), scoreRow(20, 'v1', 'strike', { part: 1, commitAction: 'party_wait' })], departs: [], skips: [] }));
check('S11 commit-overwritten-midday:party_wait: dawn bid replaced mid-day', t.bucket === 'selected-blocked' && t.sub === 'commit-overwritten-midday:party_wait', t.bucket + ':' + t.sub);
t = firstBlocked(blockedCorpus({ departs: [depRow(20, 'v1', 'strike', 'hold', { vidBlock: 'unknown' })] }));
check('S12 UNKNOWN bucket: depart hold with no vidBlock -> inviter-exped-failed-unknown', t.bucket === 'selected-blocked' && t.sub === 'inviter-exped-failed-unknown', t.bucket + ':' + t.sub);
(function () { // S13: first-blocked-resolution precedence
  const j = blockedCorpus({
    scores: [scoreRow(20, 'v1', 'strike', { part: 0 }), scoreRow(21, 'v1', 'strike', { part: 0 })],
    departs: [depRow(20, 'v1', 'strike', 'hold', { vidBlock: 'range-0' }), depRow(21, 'v1', 'strike', 'normal')],
    skips: [skipRow(21, 'v1', 'strike', 'danger-gate', { part: 1 })] });
  const r = firstBlocked(j);
  check('S13 precedence: two blocked selections -> FIRST names the instance (range-0, not danger-gate)',
    r.bucket === 'selected-blocked' && r.sub === 'inviter-range-0' &&
    r.inst.resolved.length === 2 && r.inst.resolved[1].reason === 'danger-gate',
    r.bucket + ':' + r.sub + ' resolved=' + JSON.stringify(r.inst.resolved.map(function (x) { return x.reason; })));
})();
}

// ---------- 3. Corpus: the real 12, and the OFF replication ----------
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
check('C1 ON corpus: 8 files, 12 selected-blocked, 0 unknown',
  on.files === 8 && on.summary.byFunnel['selected-blocked'] === 12 && on.summary.unknown === 0,
  'files=' + on.files + ' blocked=' + on.summary.byFunnel['selected-blocked'] + ' unknown=' + on.summary.unknown);
check('C2 ON sub-tally is the frozen split (range-0 6, no-tick 3, sick 1, hurt 1, companion-sick 1)',
  on.summary.byFunnelSub['selected-blocked:inviter-range-0'] === 6 &&
  on.summary.byFunnelSub['selected-blocked:no-tick-after-commit'] === 3 &&
  on.summary.byFunnelSub['selected-blocked:inviter-sick'] === 1 &&
  on.summary.byFunnelSub['selected-blocked:inviter-hurt'] === 1 &&
  on.summary.byFunnelSub['selected-blocked:companion-not-started:sick'] === 1,
  JSON.stringify(on.summary.byFunnelSub));
check('C3 every selected-blocked instance carries a NAMED reason (none is inviter-exped-failed-unknown)',
  (function () {
    const leg = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on'));
    for (const k of Object.keys(leg.bySeed)) {
      const r = ANALYZE.funnelForSeed(leg.bySeed[k]);
      for (const inst of r.instances) {
        if (inst.funnelBucket === 'selected-blocked' && inst.funnelSub === 'inviter-exped-failed-unknown') return false;
      }
    }
    return true;
  })());
check('C4 OFF replication: funnel buckets exact vs frozen analysis',
  JSON.stringify(off.summary.byFunnel) === JSON.stringify(frozen.off.byFunnel),
  JSON.stringify(off.summary.byFunnel));
check('C5 OFF replication: funnel subs + pool shape + wall + median exact vs frozen analysis',
  JSON.stringify(off.summary.byFunnelSub) === JSON.stringify(frozen.off.byFunnelSub) &&
  JSON.stringify(off.summary.poolShape) === JSON.stringify(frozen.off.poolShape) &&
  JSON.stringify(off.summary.wall) === JSON.stringify(frozen.off.wall) &&
  off.summary.medianSurvival === frozen.off.medianSurvival,
  'subs=' + (JSON.stringify(off.summary.byFunnelSub) === JSON.stringify(frozen.off.byFunnelSub)) +
  ' pool=' + (JSON.stringify(off.summary.poolShape) === JSON.stringify(frozen.off.poolShape)) +
  ' wall=' + (JSON.stringify(off.summary.wall) === JSON.stringify(frozen.off.wall)) +
  ' median=' + off.summary.medianSurvival + ' vs ' + frozen.off.medianSurvival);
check('C6 ON re-analysis matches the frozen ON summary too (funnel + pool + wall + median)',
  JSON.stringify(on.summary.byFunnel) === JSON.stringify(frozen.on.byFunnel) &&
  JSON.stringify(on.summary.byFunnelSub) === JSON.stringify(frozen.on.byFunnelSub) &&
  JSON.stringify(on.summary.poolShape) === JSON.stringify(frozen.on.poolShape) &&
  JSON.stringify(on.summary.wall) === JSON.stringify(frozen.on.wall) &&
  on.summary.medianSurvival === frozen.on.medianSurvival,
  'wall got=' + JSON.stringify(on.summary.wall) + ' want=' + JSON.stringify(frozen.on.wall));
}

staticChecks();
bucketChecks();
corpusChecks();
console.log('== test-selblock-a: ' + pass + ' passed, ' + fail + ' failed ==');
if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
if (require.main !== module) module.exports = {};
