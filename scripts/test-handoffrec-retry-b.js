// test-handoffrec-retry-b.js — proof for arm sim-handoffrec-retry-b
// (RE-RUN of the sim-handoffrec-a classification on the STAGING band
// 103411-103418, the selblock/profilegate band that produced the frozen
// 79 range-0-holder blocked selections. sim-handoffrec-a staged ZERO
// selections on fresh band 103541-103548, so this arm re-runs the same
// fixed recorder + (day, part) join where the contact exists. No game
// change in this arm: nothing in src/ is touched. This test proves the
// RECORDER + the CLASSIFIER JOIN plus the corpus facts they stand on:
//   - static: src/ diff is EMPTY; the driver exists and its pool
//     emission is no longer gated on part 0 (and records the actual
//     part); MODE is on|rec only; the prereg exists with the frozen bars.
//   - join fixtures: synthetic selections proving the (day, part) join
//     — a mid-day commit uses its own mid-day row (J2); a later part-2
//     row does NOT serve a part-1 commit (J3, the discriminating join
//     case); a dawn commit uses the dawn row (J4); an unparseable
//     commitKind falls back to the day-only rule (J5); the frozen-unknown
//     shape (mid-day commit, no dawn row, mid-day row with a free
//     forager) now classifies — with the old-code-fails control (same
//     fixture minus the mid-day row goes unknown, J6).
//   - frozen reproduction (bar 2): the updated analyzer run on the
//     frozen ON corpus reproduces handoff-a-analysis.json exactly on
//     every frozen field (79 selections, tally 28/0/47/4, same 4
//     unknowns) — the join change is a no-op on dawn-only rows.
//   - staging corpus (only when argv gives the ON + REC dirs): bar 3
//     firing rate (a pool row for every wave-4 score, same vid/day/
//     part; a pool row on/before every wave-4 depart day; zero
//     pool-path instrument errors), D1 repeatability (two seed-103414
//     files identical except the run label), D2 wrap neutrality (ON vs
//     REC fingerprints identical per seed), and bars 1-2 on the
//     staging-band classification (unknown 0, >=1 mid-day-backed
//     selection, every selection classified).
// Usage:
//   node scripts/test-handoffrec-retry-b.js                                  (pre-pilot gate: static + fixtures + frozen)
//   node scripts/test-handoffrec-retry-b.js <onDir> <recDir> [d1FileA d1FileB]  (full: + staging-corpus checks)
// The fresh-corpus checks print SKIP (not FAIL) when the dirs are absent.
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const HANDOFF = require(path.join(REPO, 'scripts', 'analyze-handoff-a.js'));

const ON_DIR_ARG = process.argv[2] || null;
const REC_DIR_ARG = process.argv[3] || null;
const D1_A = process.argv[4] || null;
const D1_B = process.argv[5] || null;

let pass = 0, fail = 0, skip = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function skipCheck(name) { skip++; console.log('  SKIP: ' + name); }

// ---------- 1. Static ----------
function staticChecks() {
console.log('== static ==');
check('prereg exists with the frozen bars (unknown 0, mid-day-backed >=1, firing 100%)',
  (function () {
    const p = path.join(REPO, 'evidence', '2026-11-18', 'sim-handoffrec-retry-b-prereg.md');
    if (!fs.existsSync(p)) return false;
    const t = fs.readFileSync(p, 'utf8');
    return t.indexOf('unknown = 0') !== -1 && t.indexOf('mid-day pool row') !== -1 &&
      t.indexOf('100%') !== -1 && t.indexOf('103411') !== -1;
  })());
check('driver exists',
  fs.existsSync(path.join(REPO, 'scripts', 'handoffrec-driver-20261118.js')));
const driverText = fs.readFileSync(path.join(REPO, 'scripts', 'handoffrec-driver-20261118.js'), 'utf8');
check('driver pool emission is NOT gated on part 0 (the recorder fix)',
  driverText.indexOf("if (planIsWave4(Game, plan)) {") !== -1 &&
  driverText.indexOf("(Game.dayPart | 0) === 0") === -1,
  'gate text present=' + (driverText.indexOf("(Game.dayPart | 0) === 0") !== -1));
check('driver pool row records the actual part (not hardcoded 0)',
  driverText.indexOf('part: (Game.dayPart | 0), vid: vid,') !== -1);
check('driver MODE validation is on|rec only',
  driverText.indexOf("MODE !== 'on' && MODE !== 'rec'") !== -1);
check('driver uses the staging band + handoffrec-retry-b names (no frozen corpus overwrite)',
  driverText.indexOf('perseed-handoffrec-retry-b-') !== -1 &&
  driverText.indexOf('2026-11-18') !== -1 &&
  driverText.indexOf('SEEDS=103541') === -1 &&
  driverText.indexOf('perseed-handoffrec-a-') === -1 &&
  driverText.indexOf("OUTDIR=perseed-profilegate-b-") === -1);
check('src/ is untouched (git diff HEAD + worktree status both empty for src/)',
  (function () {
    try {
      const d = execSync('git diff --name-only HEAD -- src/', { cwd: REPO }).toString().trim();
      const s = execSync('git status --porcelain -- src/', { cwd: REPO }).toString().trim();
      return d === '' && s === '';
    } catch (e) { return false; }
  })());
check('analyzer exports commitPartOfKind + classifySelection',
  typeof HANDOFF.commitPartOfKind === 'function' && typeof HANDOFF.classifySelection === 'function');
check('analyzer CLI accepts expectMode (frozen default, none for fresh band)',
  (function () {
    const t = fs.readFileSync(path.join(REPO, 'scripts', 'analyze-handoff-a.js'), 'utf8');
    return t.indexOf("EXPECT_MODE") !== -1 && t.indexOf("'none'") !== -1;
  })());
}

// ---------- 2. Join fixtures ----------
// Minimal fake seed file: holder 'h1' (homebody), target 'eater'.
// Pool rows carry members; daily rows carry the roster + veterans.
function member(id, over) {
  const m = { id: id, profile: 'forager', trust: 50, trustRaw: 50,
    node: { nx: 4, ny: 4 }, away: false, engaged: false, onExped: false,
    alive: true, firstFail: 'eligible' };
  return Object.assign(m, over || {});
}
function poolRow(day, part, vid, members, over) {
  const p = { day: day, part: part, vid: vid, target: 'eater', stage: 'party',
    holderProfile: 'homebody', holderNode: { nx: 4, ny: 4 },
    profileGateOpen: true, haven: { nx: 4, ny: 4 }, rosterN: 4,
    counts: {}, fails: {}, eligible: [], rankedOrder: [], rankedPick: null,
    rankedVia: 'roster-fallback', bidCompanion: null, agree: null, members: members };
  return Object.assign(p, over || {});
}
function dailyRow(day, rosterVids, over) {
  const roster = [{ vid: 'h1', dead: false }, { vid: 'scholar1', dead: false }]
    .concat(rosterVids.map(function (v) { return { vid: v, dead: false }; }));
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
function selfMembers() {
  return [
    member('scholar1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
    member('h1', { profile: null, firstFail: 'selfOrScholar', trust: 10, trustRaw: null, node: null }),
  ];
}
function classify(j, day, companion, commitKind) {
  const inst = { vid: 'h1', target: 'eater',
    selections: [{ day: day, companion: companion, commitKind: commitKind, parts: [0] }] };
  const res = { outcome: 'blocked', reason: 'inviter-range-0', day: day, commitKind: commitKind };
  return HANDOFF.classifySelection(j, inst, res);
}
function joinChecks() {
console.log('== join fixtures: (day, part) ==');
// J1: commitPartOfKind units.
check('J1 commitPartOfKind: dawn->0, mid-day part-1->1, mid-day part-2->2, part-3->3, null/bogus->null',
  HANDOFF.commitPartOfKind('dawn') === 0 &&
  HANDOFF.commitPartOfKind('mid-day part-1') === 1 &&
  HANDOFF.commitPartOfKind('mid-day part-2') === 2 &&
  HANDOFF.commitPartOfKind('part-3') === 3 &&
  HANDOFF.commitPartOfKind(null) === null &&
  HANDOFF.commitPartOfKind('bogus') === null);
// J2: mid-day commit uses its own mid-day row. Part-0 row: walker away.
// Part-1 row: walker at Haven, free. Commit part 1 -> available, row part 1.
let r = classify(fakeSeed({
  companionPool: [
    poolRow(20, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', { away: true, node: { nx: 6, ny: 5 }, firstFail: 'away' })])),
    poolRow(20, 1, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
}), 20, 'hb1', 'mid-day part-1');
check('J2 mid-day commit uses its own mid-day row (walker away at dawn, at Haven at part 1 -> available, poolRowPart 1)',
  r.bucket === 'handoff-available' && r.poolRowPart === 1 && r.poolRowGap === 0 &&
  r.namedWalker && r.namedWalker.id === 'w1',
  r.bucket + ' poolRowPart=' + r.poolRowPart + ' named=' + JSON.stringify(r.namedWalker));
// J3: a LATER part-2 row must NOT serve a part-1 commit. Part-0 row:
// walker at Haven. Part-2 row: walker away. Commit part 1 -> the part-0
// row governs -> available, poolRowPart 0. (The old day-only join would
// take the part-2 row and call the walker away.)
r = classify(fakeSeed({
  companionPool: [
    poolRow(20, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
    poolRow(20, 2, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', { away: true, node: { nx: 6, ny: 5 }, firstFail: 'away' })])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
}), 20, 'hb1', 'mid-day part-1');
check('J3 later part-2 row does NOT serve a part-1 commit (walker at Haven at part 0 -> available, poolRowPart 0)',
  r.bucket === 'handoff-available' && r.poolRowPart === 0,
  r.bucket + ' poolRowPart=' + r.poolRowPart + ' why=' + JSON.stringify(r.walkers.map(function (w) { return w.why; })));
// J4: dawn commit uses the dawn row even when a mid-day row differs.
// Part-0 row: walker away. Part-1 row: walker at Haven. Commit dawn ->
// unavailable (away), poolRowPart 0.
r = classify(fakeSeed({
  companionPool: [
    poolRow(20, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', { away: true, node: { nx: 6, ny: 5 }, firstFail: 'away' })])),
    poolRow(20, 1, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
}), 20, 'hb1', 'dawn');
check('J4 dawn commit uses the dawn row (walker away at dawn -> unavailable, poolRowPart 0)',
  r.bucket === 'walker-exists-but-unavailable' && r.poolRowPart === 0 &&
  r.walkers.some(function (w) { return w.id === 'w1' && w.why === 'away'; }),
  r.bucket + ' poolRowPart=' + r.poolRowPart);
// J5: unparseable commitKind falls back to the day-only rule (latest
// row that day, part 1).
r = classify(fakeSeed({
  companionPool: [
    poolRow(20, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', { away: true, node: { nx: 6, ny: 5 }, firstFail: 'away' })])),
    poolRow(20, 1, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
}), 20, 'hb1', 'mystery-kind');
check('J5 unparseable commitKind falls back to the latest row that day (poolRowPart 1, available)',
  r.bucket === 'handoff-available' && r.poolRowPart === 1,
  r.bucket + ' poolRowPart=' + r.poolRowPart);
// J6: the frozen-unknown shape, fixed. No dawn row; one mid-day part-1
// row with a free forager at Haven; mid-day commit with a homebody
// companion. -> available, poolRowPart 1, gap 0.
const j6base = {
  companionPool: [
    poolRow(20, 1, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
    poolRow(22, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
};
r = classify(fakeSeed(j6base), 20, 'hb1', 'mid-day part-1');
check('J6 frozen-unknown shape fixed: mid-day commit + mid-day row, no dawn row -> available, poolRowPart 1',
  r.bucket === 'handoff-available' && r.poolRowPart === 1 && r.poolRowGap === 0 &&
  r.namedWalker && r.namedWalker.id === 'w1',
  r.bucket + ' poolRowPart=' + r.poolRowPart + ' gap=' + r.poolRowGap);
// J6-control (old-code-fails): the same fixture WITHOUT the mid-day row
// (what the old recorder produced) -> unknown. The fixture discriminates.
const j6ctl = {
  companionPool: [
    poolRow(22, 0, 'h1', selfMembers().concat([
      member('hb1', { profile: 'homebody' }),
      member('w1', {})])),
  ],
  daily: [dailyRow(20, ['hb1', 'w1'])],
};
r = classify(fakeSeed(j6ctl), 20, 'hb1', 'mid-day part-1');
check('J6-control old-code-fails: same fixture without the mid-day row -> unknown (the old recorder gap)',
  r.bucket === 'unknown' && r.poolRowDay == null,
  r.bucket + ' poolRowDay=' + r.poolRowDay);
}

// ---------- 3. Frozen reproduction (bar 2) ----------
function frozenChecks() {
console.log('== frozen reproduction (bar 2) ==');
const tmpOut = path.join(os.tmpdir(), 'handoffrec-frozen-check-' + process.pid + '.json');
try {
  execSync('node ' + path.join(REPO, 'scripts', 'analyze-handoff-a.js') + ' ' +
    path.join(REPO, 'evidence', '2026-11-17', 'perseed-profilegate-b-on') + ' ' + tmpOut + ' frozen',
    { cwd: REPO, stdio: 'pipe' });
} catch (e) {
  check('R0 updated analyzer runs on the frozen corpus (exit 0)', false, String(e.message).slice(0, 200));
  return;
}
check('R0 updated analyzer runs on the frozen corpus (exit 0)', true);
const a = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
const frozen = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-17', 'handoff-a-analysis.json'), 'utf8'));
check('R1 enumeration reproduces selblock-a exactly (79; per-instance 1+8+28+24+5+10+3)',
  a.enumerationOk === true && a.total === 79 &&
  JSON.stringify(a.perInstance) === JSON.stringify(frozen.perInstance),
  'total=' + a.total);
check('R2 tally identical to frozen (28 / 0 / 47 / 4) and share 28/79',
  JSON.stringify(a.tally) === JSON.stringify(frozen.tally) && a.share === frozen.share,
  JSON.stringify(a.tally) + ' share=' + a.share);
check('R3 unknown is exactly the same 4 frozen selections',
  JSON.stringify(a.selections.filter(function (s) { return s.bucket === 'unknown'; })
    .map(function (s) { return s.seed + ':' + s.holder + ':' + s.day; }).sort()) ===
  JSON.stringify(frozen.selections.filter(function (s) { return s.bucket === 'unknown'; })
    .map(function (s) { return s.seed + ':' + s.holder + ':' + s.day; }).sort()));
check('R4 every selection matches the frozen record on bucket + named walker + poolRowDay + poolRowGap (frozen fields only)',
  (function () {
    if (a.selections.length !== frozen.selections.length) return false;
    for (let i = 0; i < a.selections.length; i++) {
      const x = a.selections[i], y = frozen.selections[i];
      if (x.seed !== y.seed || x.holder !== y.holder || x.day !== y.day ||
        x.bucket !== y.bucket || x.poolRowDay !== y.poolRowDay || x.poolRowGap !== y.poolRowGap) return false;
      const xn = x.namedWalker ? x.namedWalker.id : null, yn = y.namedWalker ? y.namedWalker.id : null;
      if (xn !== yn) return false;
      if (JSON.stringify(x.whySummary) !== JSON.stringify(y.whySummary)) return false;
    }
    return true;
  })());
check('R5 all frozen poolRowPart values are 0 or null (every frozen row is a dawn row)',
  a.selections.every(function (s) { return s.poolRowPart === 0 || s.poolRowPart == null; }));
check('R6 same-day share 22/50, stale-face-value 37/79, veteran 0, picked 18, possibly-holding 0, wall identical',
  a.sameDayShare === frozen.sameDayShare && a.sameDayN === frozen.sameDayN &&
  a.staleFaceValueShare === frozen.staleFaceValueShare &&
  a.veteranNamed === frozen.veteranNamed && a.pickedCompanionNamed === frozen.pickedCompanionNamed &&
  a.possiblyHoldingVerdicts === frozen.possiblyHoldingVerdicts &&
  JSON.stringify(a.wall) === JSON.stringify(frozen.wall));
try { fs.unlinkSync(tmpOut); } catch (e) {}
}

// ---------- 4. Fresh corpus (bars 1-3, D1, D2) ----------
const W4 = new Set(['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald']);
function isW4Plan(plan) {
  if (!plan) return false;
  if ((plan.needWave | 0) >= 4) return true;
  return !!(plan.target && W4.has(plan.target));
}
function loadDir(dir) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return { bySeed: bySeed, files: files };
}
function fingerprint(j) {
  const daily = j.daily || [];
  const last = daily.length ? daily[daily.length - 1] : null;
  return {
    days: j.days, gameDays: j.gameDays, standing: j.standing, maxWave: j.maxWave,
    deaths: (j.deaths || []).length, endReason: j.endReason, endPantryKcal: j.endPantryKcal,
    killLogLen: last ? ((last.waveKillLog || []).length) : null,
    vetsW4: last ? JSON.stringify(((last.vetsW4 || {}).killers || []).map(function (k) { return k.by; }).sort()) : null,
    rosterN: last ? ((last.roster || []).length) : null,
  };
}
function freshChecks() {
console.log('== staging corpus (bars 1-3, D1, D2) ==');
if (!ON_DIR_ARG || !REC_DIR_ARG) {
  skipCheck('F0 firing rate / D1 / D2 / staging classification (no corpus dirs passed)');
  return;
}
const on = loadDir(ON_DIR_ARG);
const rec = loadDir(REC_DIR_ARG);
check('F0 staging ON corpus has 8 seeds (103411-103418)',
  on.files.length === 8 &&
  JSON.stringify(Object.keys(on.bySeed).map(Number).sort(function (a, b) { return a - b; })) ===
  JSON.stringify([103411, 103412, 103413, 103414, 103415, 103416, 103417, 103418]),
  'files=' + on.files.length + ' seeds=' + Object.keys(on.bySeed).sort().join(','));
// Bar 3a: a pool row for every wave-4 score, same (vid, day, part).
let scoreTotal = 0, scoreMatched = 0, scoreMissing = [];
for (const k of Object.keys(on.bySeed)) {
  const j = on.bySeed[k];
  const poolKeys = {};
  for (const p of (j.companionPool || [])) poolKeys[p.vid + '|' + p.day + '|' + (p.part != null ? p.part : 0)] = true;
  for (const r of (j.dawnbidScores || [])) {
    if (!isW4Plan(r.plan)) continue;
    scoreTotal++;
    if (poolKeys[r.vid + '|' + r.day + '|' + (r.part != null ? r.part : 0)]) scoreMatched++;
    else scoreMissing.push(j.seed + ':' + r.vid + ':d' + r.day + 'p' + r.part);
  }
}
check('F1 bar 3a: pool row for 100% of wave-4 scored calls (same vid/day/part)',
  scoreTotal > 0 && scoreMatched === scoreTotal,
  'matched=' + scoreMatched + '/' + scoreTotal + ' missing=' + JSON.stringify(scoreMissing.slice(0, 5)));
// Bar 3b: a pool row on/before every wave-4 holder depart day.
// SCOPE (corrected 2026-11-18, after the fresh ON corpus showed the
// first version over-counted): a "wave-4 holder" depart is one whose
// plan target is a wave-4 id. The depart wrap also records rows for
// wave-3 plan holders (party_launch commits for wave-3 targets) and
// for holders with no plan target (target null) — those holders
// correctly get NO pool row, because the recorder snapshots wave-4
// holders only. Counting them would fail the bar on rows the
// recorder must never emit.
let depTotal = 0, depMatched = 0, depMissing = [];
for (const k of Object.keys(on.bySeed)) {
  const j = on.bySeed[k];
  for (const r of (j.dawnbidDeparts || [])) {
    if (!W4.has(r.target)) continue;
    depTotal++;
    const has = (j.companionPool || []).some(function (p) { return p.vid === r.vid && p.day <= r.day; });
    if (has) depMatched++;
    else depMissing.push(j.seed + ':' + r.vid + ':d' + r.day);
  }
}
check('F2 bar 3b: pool row on/before 100% of wave-4-target holder depart days',
  depTotal > 0 && depMatched === depTotal,
  'matched=' + depMatched + '/' + depTotal + ' missing=' + JSON.stringify(depMissing.slice(0, 5)));
// Bar 3c: zero pool-path instrument errors.
let poolErrors = 0, errList = [];
for (const k of Object.keys(on.bySeed)) {
  const j = on.bySeed[k];
  for (const e of (j.instrumentErrors || [])) {
    if (String(e).indexOf('profilegate-replica-null') !== -1 || String(e).indexOf('profilegate-log') !== -1) {
      poolErrors++; errList.push(j.seed + ':' + String(e).slice(0, 60));
    }
  }
}
check('F3 bar 3c: zero pool-path instrument errors (replica-null / profilegate-log absent)',
  poolErrors === 0, 'errors=' + poolErrors + ' ' + JSON.stringify(errList.slice(0, 3)));
// Bars 1-2: run the analyzer on the fresh ON corpus (expectMode none).
const tmpOut = path.join(os.tmpdir(), 'handoffrec-fresh-check-' + process.pid + '.json');
try {
  execSync('node ' + path.join(REPO, 'scripts', 'analyze-handoff-a.js') + ' ' + ON_DIR_ARG + ' ' + tmpOut + ' none',
    { cwd: REPO, stdio: 'pipe' });
} catch (e) {
  check('F4 analyzer runs on the staging corpus (exit 0)', false, String(e.message).slice(0, 200));
  return;
}
check('F4 analyzer runs on the staging corpus (exit 0)', true);
const a = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
try { fs.unlinkSync(tmpOut); } catch (e) {}
const midBacked = a.selections.filter(function (s) { return s.poolRowPart === 1 || s.poolRowPart === 2; });
check('F5 bar 1: unknown = 0 on the staging band',
  a.tally.unknown === 0, 'tally=' + JSON.stringify(a.tally) + ' total=' + a.total);
check('F6 bar 1 (>=1 clause): >=1 selection backed by a mid-day pool row (part 1/2)',
  midBacked.length >= 1,
  'mid-day-backed=' + midBacked.length + '/' + a.total + ' ' +
  JSON.stringify(midBacked.slice(0, 5).map(function (s) { return s.seed + ':d' + s.day + ':' + s.holder + ':p' + s.poolRowPart; })));
check('F7 bar 2: every selection with a backing row is classified (no analyzer-side unknown beyond the frozen rule)',
  a.selections.every(function (s) { return s.bucket !== 'unknown' || s.poolRowDay == null; }) &&
  a.selections.filter(function (s) { return s.poolRowDay != null; }).every(function (s) { return s.bucket !== 'unknown'; }),
  'unknown=' + a.tally.unknown);
// D1: two seed-103414 files identical except the run label.
if (!D1_A || !D1_B) {
  skipCheck('F8 D1 repeatability (no D1 file pair passed)');
} else {
  const fa = JSON.parse(fs.readFileSync(D1_A, 'utf8'));
  const fb = JSON.parse(fs.readFileSync(D1_B, 'utf8'));
  delete fa.run; delete fb.run;
  check('F8 D1 repeatability: seed 103414 run twice, files identical except the run label',
    JSON.stringify(fa) === JSON.stringify(fb));
}
// D2: ON vs REC fingerprints identical per seed.
check('F9 D2 wrap neutrality: ON vs REC fingerprints identical on all 8 seeds',
  (function () {
    const seeds = Object.keys(on.bySeed).sort();
    if (seeds.length !== 8 || Object.keys(rec.bySeed).length !== 8) return false;
    for (const s of seeds) {
      if (!rec.bySeed[s]) return false;
      if (JSON.stringify(fingerprint(on.bySeed[s])) !== JSON.stringify(fingerprint(rec.bySeed[s]))) {
        console.log('    D2 mismatch seed ' + s + ': on=' + JSON.stringify(fingerprint(on.bySeed[s])) +
          ' rec=' + JSON.stringify(fingerprint(rec.bySeed[s])));
        return false;
      }
    }
    return true;
  })());
console.log('  info: staging classification total=' + a.total + ' tally=' + JSON.stringify(a.tally) +
  ' share=' + a.share + ' wall=' + JSON.stringify(a.wall));
}

staticChecks();
joinChecks();
frozenChecks();
freshChecks();
console.log('== test-handoffrec-retry-b: ' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped ==');
if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
