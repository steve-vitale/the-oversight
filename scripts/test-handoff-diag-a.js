// test-handoff-diag-a.js — proof for arm sim-handoff-diag-a (DIAG:
// for each range-0-holder blocked selection in the FROZEN
// profilegate-b ON corpus, could a walker in the same village have
// held the plan instead?). No game change in this arm: nothing in
// src/ is touched, the PROFILEGATE lever was re-applied in-tree only
// for a pilot that proved the frozen instances do not reproduce on
// this tip (base drift — see prereg Correction 1) and was reverted
// before any classification. This test proves the CLASSIFICATION
// INSTRUMENT plus the corpus facts it stands on:
//   - static: src/ diff vs the frozen base is EMPTY; the lever
//     stays reverted (unguarded profile check in both twins, no
//     PROFILEGATE/_pg variant); the abandoned handoff driver and
//     scratch corpora do not exist.
//   - analyzer fixtures: synthetic selections, one per frozen bucket
//     (handoff-available via picked companion / via another walker /
//     via bid proof with no pool row; no-walker-in-village;
//     walker-exists-but-unavailable: holding / away / stale-state;
//     unknown: no row + homebody companion / no row + holding
//     companion), plus veteran-named, depart-companion precedence
//     (Correction 2 Bug 2), possibly-holding flag, and the late-joiner
//     roster-only path.
//   - corpus: the real frozen ON corpus gives exactly 79
//     inviter-range-0 selections with the frozen per-instance counts,
//     tally 28/0/47/4, share 28/79, unknown exactly the 4 frozen
//     no-pool-row selections, wall matching the frozen ON leg; the
//     OFF/ON corpora re-analyzed reproduce the frozen
//     profilegate-b analysis exactly (funnel + pool shape + wall +
//     median).
// The pilot legs (ON 103414 + OFF 103414, 150d) were run during the
// arm and are recorded in the prereg (Corrections 1-2) and evidence
// — they are NOT re-run here (a proof test must stay fast; the pilot
// legs are the arm's evidence, not the test's). The frozen prereg is
// evidence/2026-11-17/sim-handoff-diag-a-prereg.md.
// Usage:
//   node scripts/test-handoff-diag-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const HANDOFF = require(path.join(REPO, 'scripts', 'analyze-handoff-a.js'));
const PG = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function frozenBase() {
  if (process.env.HANDOFF_BASE) return process.env.HANDOFF_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-17/sim-handoff-diag-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
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
check('src/ diff vs base + worktree is EMPTY (DIAG arm: no game change; in-tree-only lever reverted)',
  JSON.stringify(srcUnion) === JSON.stringify([]),
  'union=' + JSON.stringify(srcUnion));
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('unguarded profile check PRESENT in both twins (master behavior)',
  brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1 &&
  winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1);
check('no PROFILEGATE-gated variant in either twin (lever reverted, not re-applied)',
  brainJs.indexOf('PROFILEGATE') === -1 && winplanJs.indexOf('PROFILEGATE') === -1 &&
  brainJs.indexOf('_pg') === -1 && winplanJs.indexOf('_pg') === -1);
check('prereg (+Corrections 1-2) + analysis + evidence files exist',
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-handoff-diag-a-prereg.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'handoff-a-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-handoff-diag-a.md')));
check('prereg carries Correction 1 and Correction 2',
  (function () {
    const t = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'sim-handoff-diag-a-prereg.md'), 'utf8');
    return t.indexOf('Correction 1') !== -1 && t.indexOf('Correction 2') !== -1;
  })());
check('abandoned handoff driver + scratch corpora do NOT exist (fresh run abandoned, nothing left behind)',
  !fs.existsSync(path.join(REPO, 'scripts', 'handoff-driver-20261117.js')) &&
  !fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-handoff-a-pilot')) &&
  !fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-handoff-a-offcheck')) &&
  !fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-handoff-a-on')));
check('frozen corpora + analyzer this arm reads still exist',
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-handoff-a.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-profilegate-b.js')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'profilegate-b-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-off')));
}

// ---------- 2. Analyzer fixtures ----------
// Minimal fake seed file: holder 'h1' (homebody), target 'eater'.
// Pool rows carry members; daily rows carry the roster + veterans.
function member(id, over) {
  const m = { id: id, profile: 'forager', trust: 50, trustRaw: 50,
    node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false,
    alive: true, firstFail: 'eligible' };
  return Object.assign(m, over || {});
}
function poolRow(day, vid, members, over) {
  const p = { day: day, part: 0, vid: vid, target: 'eater', stage: 'party',
    holderProfile: 'homebody', holderNode: { nx: 4, ny: 4 },
    profileGateOpen: true, haven: { nx: 4, ny: 4 }, rosterN: 4,
    counts: {}, fails: {}, eligible: [], rankedOrder: [], rankedPick: null,
    rankedVia: 'roster-fallback', bidCompanion: null, agree: null, members: members };
  return Object.assign(p, over || {});
}
function dailyRow(day, roster, over) {
  const d = { day: day, partyMembers: [], ready4: {}, ready5: {}, roster: roster,
    scholarId: 'scholar1', veteranRows: [],
    vetsW3: { count: 0, killers: [] }, vetsW4: { count: 0, killers: [] },
    wave4Slain: 0, waveKillLog: [], waveKills: {} };
  return Object.assign(d, over || {});
}
function fakeSeed(over) {
  const j = { seed: 999001, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4departs: [], v4gates: [], v4encounters: [],
    dawnbidScores: [], dawnbidDeparts: [], dawnbidCensus: [], dawnbidStarts: [],
    launchdefSkips: [], companionPool: [], samples: {},
    daily: [], deaths: [] };
  return Object.assign(j, over || {});
}
function roster(vids) {
  return [{ vid: 'h1', dead: false }, { vid: 'scholar1', dead: false }]
    .concat(vids.map(function (v) { return { vid: v, dead: false }; }));
}
function fakeInst(day, companion) {
  return { vid: 'h1', target: 'eater',
    selections: [{ day: day, companion: companion, commitKind: 'dawn', parts: [0] }] };
}
function fakeRes(day) {
  return { outcome: 'blocked', reason: 'inviter-range-0', day: day, commitKind: 'dawn' };
}
function classify(j, day, companion) {
  return HANDOFF.classifySelection(j, fakeInst(day, companion), fakeRes(day));
}
function fixtureChecks() {
console.log('== analyzer fixtures: handoff buckets ==');
let r;
// F1: available via picked companion (same-day row, forager at Haven).
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('c1', {})])],
  daily: [dailyRow(20, roster(['c1']))],
}), 20, 'c1');
check('F1 handoff-available via picked companion (forager at Haven, not holding)',
  r.bucket === 'handoff-available' && r.namedWalker && r.namedWalker.id === 'c1' && r.namedWalker.isPickedCompanion === true,
  r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F2: available via ANOTHER walker (picked companion homebody; other forager free).
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' }),
    member('w1', { profile: 'wanderer' })],
    { rankedOrder: [{ id: 'w1', s: 1 }], rankedPick: 'w1', rankedVia: 'companionRank' })],
  daily: [dailyRow(20, roster(['hb1', 'w1']))],
}), 20, 'hb1');
check('F2 handoff-available via another walker (picked homebody; wanderer free, ranked first)',
  r.bucket === 'handoff-available' && r.namedWalker && r.namedWalker.id === 'w1' && r.namedWalker.isPickedCompanion === false,
  r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F3: no walker in village (same-day row, all homebodies).
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' }),
    member('hb2', { profile: 'homebody' })])],
  daily: [dailyRow(20, roster(['hb1', 'hb2']))],
}), 20, 'hb1');
check('F3 no-walker-in-village (same-day row, every member a homebody)',
  r.bucket === 'no-walker-in-village', r.bucket);
// F4: walker exists but holding a wave-4 plan (census row that day).
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']))],
  dawnbidCensus: [{ day: 20, vid: 'w1', target: 'herald', needWave: 4, stage: 'party', party: [],
    holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false, holderHealth: 90,
    holderGear: { armed: true, armored: true } }],
}), 20, 'w1');
check('F4 walker-exists-but-unavailable: only walker holding a wave-4 plan (census)',
  r.bucket === 'walker-exists-but-unavailable' && r.walkers[0] && r.walkers[0].why === 'holding-a-plan',
  r.bucket + ' why=' + JSON.stringify(r.walkers.map(function (w) { return w.why; })));
// F5: walker exists but away. (Picked companion is a different,
// at-Haven homebody: the picked companion cannot be away, because
// the bid itself proves at-Haven at scoring time.)
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' }),
    member('w1', { away: true, node: { nx: 6, ny: 5 }, firstFail: 'away' })])],
  daily: [dailyRow(20, roster(['hb1', 'w1']))],
}), 20, 'hb1');
check('F5 walker-exists-but-unavailable: only walker away from Haven',
  r.bucket === 'walker-exists-but-unavailable' && r.walkers.some(function (w) { return w.id === 'w1' && w.why === 'away'; }),
  r.bucket + ' why=' + JSON.stringify(r.walkers.map(function (w) { return w.why; })));
// F6: unknown — no pool row, picked companion homebody. (The
// after-row supplies the companion's profile, as in the real corpus:
// profiles never change, so the after-row is a valid profile source.)
r = classify(fakeSeed({
  companionPool: [poolRow(22, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' })])],
  daily: [dailyRow(20, roster(['hb1']))],
}), 20, 'hb1');
check('F6 unknown: no pool row on/before the day, picked companion a homebody',
  r.bucket === 'unknown' && r.walkers.length === 0, r.bucket);
// F7: unknown — no pool row, picked companion a walker but holding.
r = classify(fakeSeed({
  companionPool: [poolRow(22, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']))],
  dawnbidCensus: [{ day: 20, vid: 'w1', target: 'herald', needWave: 4, stage: 'party', party: [],
    holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false, holderHealth: 90,
    holderGear: { armed: true, armored: true } }],
}), 20, 'w1');
check('F7 unknown: no pool row, picked companion a walker but holding a plan',
  r.bucket === 'unknown' && r.walkers.some(function (w) { return w.id === 'w1' && w.why === 'holding-a-plan'; }),
  r.bucket + ' why=' + JSON.stringify(r.walkers.map(function (w) { return w.why; })));
// F8: available via bid proof with NO pool row (picked forager, not
// holding). The after-row supplies the companion's profile.
r = classify(fakeSeed({
  companionPool: [poolRow(22, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']))],
}), 20, 'w1');
check('F8 handoff-available via bid proof with no pool row (picked forager, free)',
  r.bucket === 'handoff-available' && r.namedWalker && r.namedWalker.id === 'w1',
  r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F9: stale row (gap 2) — picked companion available via bid proof anyway.
r = classify(fakeSeed({
  companionPool: [poolRow(18, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']))],
}), 20, 'w1');
check('F9 stale row (gap 2): picked companion still available via bid proof',
  r.bucket === 'handoff-available' && r.poolRowGap === 2,
  r.bucket + ' gap=' + r.poolRowGap);
// F10: stale row (gap 2) — non-companion walker state unproven.
r = classify(fakeSeed({
  companionPool: [poolRow(18, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['hb1', 'w1']))],
}), 20, 'hb1');
check('F10 stale row: non-companion walker state-unproven, selection unavailable with stale why',
  r.bucket === 'walker-exists-but-unavailable' &&
  r.walkers.some(function (w) { return w.why === 'state-unproven-stale-2d'; }),
  r.bucket + ' why=' + JSON.stringify(r.walkers.map(function (w) { return w.why; })));
// F11: veteran named (available walker with a wave-4 kill).
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']), {
    vetsW4: { count: 1, killers: [{ by: 'w1', name: 'W One', firstDay: 12, lastDay: 12, maxWave: 4, kills: 1, scholarAtKill: false, pyrrhicKills: 0 }] },
  })],
}), 20, 'w1');
check('F11 veteran named: available walker with vetW4>0 is named with veteran status',
  r.bucket === 'handoff-available' && r.namedWalker && r.namedWalker.vetW4 === 1,
  r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F12: depart-companion precedence (Correction 2 Bug 2): score says
// jesse, depart says giulia — the executed pick (giulia) is used.
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('giulia_bianchi', { profile: 'homebody' }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['giulia_bianchi', 'w1']))],
  dawnbidDeparts: [{ seq: 1, day: 20, vid: 'h1', source: 'brain', result: 'hold',
    winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0, companion: 'giulia_bianchi',
    vidExped: false, companionExped: false, vidBlock: 'range-0', companionBlock: 'unknown',
    stage: 'party', target: 'eater', party: [] }],
}), 20, 'jesse_cortez');
check('F12 depart-companion precedence: executed pick giulia (homebody) is the companion, not score pick jesse',
  r.companion === 'giulia_bianchi' && r.bucket === 'handoff-available' &&
  r.namedWalker && r.namedWalker.id === 'w1' && r.namedWalker.isPickedCompanion === false,
  'companion=' + r.companion + ' bucket=' + r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F13: possibly-holding flag — walker with a wave-3-only seed, no
// census/score that day, is available but flagged.
r = classify(fakeSeed({
  companionPool: [poolRow(20, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('w1', {})])],
  daily: [dailyRow(20, roster(['w1']))],
  v4seeds: [{ day: 12, vid: 'w1', mid: 'eater', wave: 3, outcome: 'fled', path: 'world-tick',
    caller: 'test', stageAfter: 'party', target: 'eater', node: null }],
}), 20, 'w1');
check('F13 possibly-holding: wave-3-seeded walker is available but flagged (does not block)',
  r.bucket === 'handoff-available' && r.namedWalker && r.namedWalker.possiblyHolding &&
  r.namedWalker.possiblyHolding.wave === 3,
  r.bucket + ' named=' + JSON.stringify(r.namedWalker));
// F14: late joiner — day-D roster vid missing from the (stale) row is
// a candidate with location unproven, not silently dropped.
r = classify(fakeSeed({
  companionPool: [poolRow(18, 'h1', [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('hb1', { profile: 'homebody' })],
    { rankedOrder: [], rankedPick: null })],
  daily: [dailyRow(20, roster(['hb1', 'w1']))],
  // w1's profile comes from the AFTER row (profiles never change).
  companionPool2: null,
}), 20, 'hb1');
check('F14 (setup): roster-only walker without an after-row profile is not invented — and the zero-walker verdict stays unproven (unknown)',
  r.bucket === 'unknown' && r.walkers.length === 0 && r.unknownProfileCount === 1,
  r.bucket + ' walkers=' + JSON.stringify(r.walkers) + ' unknownProfile=' + r.unknownProfileCount);
(function () { // F14b: same, with an after-row carrying w1's profile.
  const j = fakeSeed({
    companionPool: [
      poolRow(18, 'h1', [
        member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
        member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
        member('hb1', { profile: 'homebody' })]),
      poolRow(22, 'h1', [
        member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
        member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
        member('hb1', { profile: 'homebody' }),
        member('w1', {})]),
    ],
    daily: [dailyRow(20, roster(['hb1', 'w1']))],
  });
  const rr = classify(j, 20, 'hb1');
  check('F14b late joiner: after-row profile makes the roster-only walker visible (location unproven)',
    rr.bucket === 'walker-exists-but-unavailable' &&
    rr.walkers.some(function (w) { return w.id === 'w1' && w.source === 'roster-only'; }),
    rr.bucket + ' walkers=' + JSON.stringify(rr.walkers));
})();
}

// ---------- 3. Corpus ----------
function corpusChecks() {
console.log('== corpus ==');
const a = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'handoff-a-analysis.json'), 'utf8'));
check('C1 enumeration reproduces selblock-a exactly (79; per-instance 1+8+28+24+5+10+3)',
  a.enumerationOk === true && a.total === 79 &&
  JSON.stringify(a.perInstance) === JSON.stringify({
    '103413:naran_tumen:herald': 1, '103413:omar_farouk:influencer': 8,
    '103414:giulia_bianchi:eater': 28, '103414:visjoin_73:reunion': 24,
    '103414:visjoin_85:eulogy': 5, '103418:yuki_mori:reunion': 10,
    '103418:visjoin_59:reunion': 3 }),
  'total=' + a.total + ' perInstance=' + JSON.stringify(a.perInstance));
check('C2 tally sums to 79 and is 28 available / 0 no-walker / 47 unavailable / 4 unknown',
  a.tally['handoff-available'] === 28 && a.tally['no-walker-in-village'] === 0 &&
  a.tally['walker-exists-but-unavailable'] === 47 && a.tally.unknown === 4 &&
  (a.tally['handoff-available'] + a.tally['no-walker-in-village'] +
   a.tally['walker-exists-but-unavailable'] + a.tally.unknown) === 79,
  JSON.stringify(a.tally));
check('C3 unknown is exactly the 4 frozen no-pool-row selections (giulia d68, yuki d71/d72, visjoin_59 d77)',
  (function () {
    const u = a.selections.filter(function (s) { return s.bucket === 'unknown'; })
      .map(function (s) { return s.seed + ':' + s.holder + ':' + s.day; }).sort();
    return JSON.stringify(u) === JSON.stringify([
      '103414:giulia_bianchi:68', '103418:visjoin_59:77',
      '103418:yuki_mori:71', '103418:yuki_mori:72']);
  })(),
  JSON.stringify(a.selections.filter(function (s) { return s.bucket === 'unknown'; })
    .map(function (s) { return s.seed + ':' + s.holder + ':' + s.day; })));
check('C4 primary share is 28/79, same-day-only 22/50, stale-face-value 37/79',
  a.share === 28 / 79 && a.sameDayShare === 22 / 50 && a.staleFaceValueShare === 37 / 79 &&
  a.sameDayN === 50,
  'share=' + a.share + ' sameDay=' + a.sameDayShare + ' staleFace=' + a.staleFaceValueShare);
check('C5 no available walker is a wave-4 veteran; 18/28 named walkers are the picked companion; 0 verdicts rest only on possibly-holding walkers',
  a.veteranNamed === 0 && a.pickedCompanionNamed === 18 && a.possiblyHoldingVerdicts === 0,
  'vet=' + a.veteranNamed + ' picked=' + a.pickedCompanionNamed + ' possHold=' + a.possiblyHoldingVerdicts);
check('C6 wall matches the frozen ON leg (national 1, table 0, wins 0, wave4 8, wave5 1, median 116.5)',
  a.wall.national === 1 && a.wall.table === 0 && a.wall.wins === 0 &&
  a.wall.wave4 === 8 && a.wall.wave5 === 1 && a.wall.medianSurvival === 116.5,
  JSON.stringify(a.wall));
check('C7 every selection cites a backing row (poolRowDay set, or bid-proof no-row case)',
  a.selections.every(function (s) {
    return (s.poolRowDay != null) ||
      (s.poolRowGap == null && s.companion != null);
  }) && JSON.stringify(a.poolRowGapDist) === JSON.stringify({ 0: 50, 1: 11, 2: 5, 3: 4, 4: 2, 5: 2, none: 5 }),
  'gapDist=' + JSON.stringify(a.poolRowGapDist));
// C8/C9: frozen corpus integrity — the OFF/ON corpora re-analyzed
// reproduce the frozen profilegate-b analysis exactly (selblock C4-C6).
const frozen = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'profilegate-b-analysis.json'), 'utf8'));
function loadDir(dir) {
  const bySeed = {};
  const files = [];
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j; files.push(f);
  }
  return { bySeed: bySeed, files: files };
}
function summarizeLeg(dir) {
  const raw = loadDir(dir);
  const leg = loadDir(dir);
  for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = PG.funnelForSeed(leg.bySeed[k]);
  const s = PG.summarize(leg);
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
check('C8 OFF replication: funnel buckets exact vs frozen analysis',
  JSON.stringify(off.summary.byFunnel) === JSON.stringify(frozen.off.byFunnel),
  JSON.stringify(off.summary.byFunnel));
check('C9 OFF + ON replication: funnel subs + pool shape + wall + median exact vs frozen analysis',
  JSON.stringify(off.summary.byFunnelSub) === JSON.stringify(frozen.off.byFunnelSub) &&
  JSON.stringify(off.summary.poolShape) === JSON.stringify(frozen.off.poolShape) &&
  JSON.stringify(off.summary.wall) === JSON.stringify(frozen.off.wall) &&
  off.summary.medianSurvival === frozen.off.medianSurvival &&
  JSON.stringify(on.summary.byFunnel) === JSON.stringify(frozen.on.byFunnel) &&
  JSON.stringify(on.summary.byFunnelSub) === JSON.stringify(frozen.on.byFunnelSub) &&
  JSON.stringify(on.summary.poolShape) === JSON.stringify(frozen.on.poolShape) &&
  JSON.stringify(on.summary.wall) === JSON.stringify(frozen.on.wall) &&
  on.summary.medianSurvival === frozen.on.medianSurvival,
  'offWall=' + JSON.stringify(off.summary.wall) + ' onWall=' + JSON.stringify(on.summary.wall));
}

staticChecks();
fixtureChecks();
corpusChecks();
console.log('== test-handoff-diag-a: ' + pass + ' passed, ' + fail + ' failed ==');
if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
if (require.main !== module) module.exports = {};
