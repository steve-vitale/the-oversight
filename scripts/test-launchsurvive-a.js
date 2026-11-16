// test-launchsurvive-a.js — proof for arm sim-launchsurvive-a
// (DIAG: decompose WHY seedland's launched parties never re-met
// their target — launch survival + re-encounter).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call is present VERBATIM from the frozen
// seedland prereg (LAUNCHSURVIVE_SEED_CALL=on; 'off' is the
// post-revert shape), the src/ diff vs the frozen base is the
// 13-line seed call only (0 post-revert), the scripts diff is the
// launchsurvive instrument + the seedpaths driver extension only,
// the LAUNCHSURVIVE=1 driver extension records per-day launch
// tracker rows (flag unset = no v4launchTrack key at all) and
// implies the SEEDLAND semantics (wave >= 4 watch + origin), the
// analyzer classifies every launch into exactly one of the six
// frozen classes with target persistence measured (fixtures incl.
// each class, precedence, death cause/place joins, plan-linger
// tails, tracker gaps), the live recorder shape carries tracker
// rows, and the determinism legs D1 (repeatability) + D2 (wrap
// neutrality) are green at 60d on seed 102401 with
// LAUNCHSURVIVE=1. The observable effect — real launches
// classified from real corpora — is demonstrated in §7, which runs
// the analyzer over the judged pilot corpora when they exist on
// disk (SKIP before the pilot; the instrument-tip run must not
// depend on corpora that do not exist yet).
// Usage:
//   node scripts/test-launchsurvive-a.js            (seed call expected ON)
//   LAUNCHSURVIVE_SEED_CALL=off node scripts/test-launchsurvive-a.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.LAUNCHSURVIVE_SEED_CALL || 'on';
// LAUNCHSURVIVE=1 for every live run in this test (the judged legs
// both run with the flag on; the flag-unset shape is checked
// separately in §6). SEEDLAND=1 is set explicitly too — the
// implication (LAUNCHSURVIVE implies SEEDLAND) is checked in §5.
process.env.LAUNCHSURVIVE = '1';
process.env.SEEDLAND = '1';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-launchsurvive-a.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));

let pass = 0, fail = 0, skip = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function noteSkip(name, detail) {
  skip++;
  console.log('  SKIP: ' + name + (detail ? ' — ' + detail : ''));
}
// frozenBase(): the parent of the commit that ADDED the frozen
// prereg — self-locating across rebases. Env
// LAUNCHSURVIVE_BASE overrides.
function frozenBase() {
  if (process.env.LAUNCHSURVIVE_BASE) return process.env.LAUNCHSURVIVE_BASE.trim();
  try {
    const c = execSync('git log --format=%H --diff-filter=A -- evidence/2026-11-16/sim-launchsurvive-a-prereg.md', { cwd: REPO }).toString().trim().split('\n')[0];
    if (c) return execSync('git rev-parse ' + c + '^', { cwd: REPO }).toString().trim();
  } catch (e) {}
  return '35686d860';
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function gitDiffNumstat(base, file) {
  try {
    return execSync('git diff --numstat ' + base + ' HEAD -- ' + file, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
// The 13-line seed call is frozen verbatim in the SEEDLAND prereg
// (this arm re-lands the same block; blob a66d45a5e).
const seedlandPrereg = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'sim-seedland-b-prereg.md'), 'utf8');
const fence = seedlandPrereg.match(/```js\n([\s\S]*?)\n```/);
const seedBlock = fence ? fence[1] : null;
check('seedland prereg carries the 13-line seed-call fence (exact text source)', !!seedBlock && seedBlock.indexOf('VETPARTY (sim-vetparty-a)') !== -1 && seedBlock.split('\n').length === 13, seedBlock ? (seedBlock.split('\n').length + ' lines') : 'no fence');
const seedBlockPresent = !!seedBlock && gameJs.indexOf(seedBlock) !== -1;
check('seed call present VERBATIM from the prereg iff LAUNCHSURVIVE_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
check('seed call sits immediately before the alreadyDead anchor',
  SEED_CALL_EXPECTED === 'off' || (seedBlockPresent && (function () {
    const i = gameJs.indexOf(seedBlock);
    const after = gameJs.slice(i + seedBlock.length, i + seedBlock.length + 80);
    return after.indexOf("if (rec.outcome === 'alreadyDead')") !== -1 && after.trim().startsWith("if (rec.outcome === 'alreadyDead')");
  })()));
const BASE = frozenBase();
console.log('  info: frozen base ' + BASE);
const srcNames = gitDiffNames(BASE, 'src/');
const srcNumstat = gitDiffNumstat(BASE, 'src/js/game.js');
check('game-code diff vs base is the seed call only (src files: ' + JSON.stringify(srcNames) + ', game.js numstat: ' + JSON.stringify(srcNumstat) + ')',
  SEED_CALL_EXPECTED === 'off' ? srcNames.length === 0 : (srcNames.length === 1 && srcNames[0] === 'src/js/game.js' && srcNumstat === '13\t0\tsrc/js/game.js'),
  'src=' + JSON.stringify(srcNames) + ' numstat=' + JSON.stringify(srcNumstat));
const scriptsNames = gitDiffNames(BASE, 'scripts/');
const scriptsOk = scriptsNames.every(function (s) {
  return s === 'scripts/analyze-launchsurvive-a.js' || s === 'scripts/test-launchsurvive-a.js' ||
    s === 'scripts/seedpaths-driver-20261116.js';
});
check('scripts diff vs base is launchsurvive instrument + seedpaths driver extension only (' + JSON.stringify(scriptsNames) + ')',
  scriptsNames.length >= 2 && scriptsOk, JSON.stringify(scriptsNames));
check('launchsurvive instrument files exist (analyzer + proof test)',
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-launchsurvive-a.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'test-launchsurvive-a.js')));
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'), 'utf8');
check('driver defines LAUNCHSURVIVE flag + targetPersistence + v4launchTrack',
  driverSrc.indexOf("LAUNCHSURVIVE = process.env.LAUNCHSURVIVE === '1'") !== -1 &&
  driverSrc.indexOf('function targetPersistence(') !== -1 &&
  driverSrc.indexOf('v4launchTrack') !== -1);
check('driver LAUNCHSURVIVE implies SEEDLAND semantics',
  driverSrc.indexOf("SEEDLAND = process.env.SEEDLAND === '1' || LAUNCHSURVIVE") !== -1);
check('driver writes v4launchTrack key only under LAUNCHSURVIVE',
  driverSrc.indexOf('if (LAUNCHSURVIVE) { out.v4launchTrack = v4launchTrack;') !== -1);
check('gate fix present on this tip (PROFILEGATE in villager-agency.js)',
  fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8').indexOf('PROFILEGATE (sim-profilegate-a)') !== -1);

// ---------- 2. targetPersistence fixtures ----------
console.log('== targetPersistence fixtures ==');
function fakeGame(monsters) {
  return { worldMonsters: function () { return monsters; } };
}
(function () {
  const g = fakeGame([{ id: 'strike', tx: 5, ty: 5 }, { id: 'strike', tx: 9, ty: 9 }, { id: 'eater', tx: 5, ty: 5 }]);
  const r = DRIVER.targetPersistence(g, 'strike', { nx: 4, ny: 4 });
  check('persistence: nearest dist 1, nearCount 1 (only the close strike), aliveCount 2 (eater ignored)',
    r.nearDist === 1 && r.nearCount === 1 && r.aliveCount === 2, JSON.stringify(r));
})();
(function () {
  const g = fakeGame([{ id: 'strike', tx: 7, ty: 7 }, { id: 'strike', tx: 9, ty: 9 }]);
  const r = DRIVER.targetPersistence(g, 'strike', { nx: 4, ny: 4 });
  check('persistence: nearest dist 3, nearCount 0 (nothing within R=2), aliveCount 2',
    r.nearDist === 3 && r.nearCount === 0 && r.aliveCount === 2, JSON.stringify(r));
})();
(function () {
  const g = fakeGame([{ id: 'eater', tx: 4, ty: 4 }]);
  const r = DRIVER.targetPersistence(g, 'strike', { nx: 4, ny: 4 });
  check('persistence: type extinct today -> nearDist null, nearCount 0, aliveCount 0',
    r.nearDist === null && r.nearCount === 0 && r.aliveCount === 0, JSON.stringify(r));
})();
(function () {
  const g = fakeGame([{ id: 'strike', tx: 4, ty: 4 }]);
  const r = DRIVER.targetPersistence(g, 'strike', null);
  check('persistence: no last-known tile -> nearDist null, nearCount 0, aliveCount 1 (still counted)',
    r.nearDist === null && r.nearCount === 0 && r.aliveCount === 1, JSON.stringify(r));
})();
(function () {
  const g = {};
  const r = DRIVER.targetPersistence(g, 'strike', { nx: 4, ny: 4 });
  check('persistence: world-monster list unreadable -> all null (explicit, never a silent zero)',
    r.nearDist === null && r.nearCount === null && r.aliveCount === null, JSON.stringify(r));
})();

// ---------- 3. classifyLaunch fixtures (all six classes) ----------
console.log('== classifyLaunch fixtures ==');
const HAVEN = { nx: 4, ny: 4 };
function trow(day, over) {
  const r = { day: day, vid: 'v1', target: 'strike', holderAlive: true,
    holderNode: { nx: 4, ny: 4 }, holderExped: false, haven: HAVEN,
    targetNearCount: 0, targetNearDist: null };
  return Object.assign(r, over || {});
}
function clsArgs(over) {
  return Object.assign({ launchDay: 20, closeDay: 40, closeKind: 'plan-deleted',
    holder: 'v1', companion: 'v2', target: 'strike',
    windowRows: [], censusRows: [], deaths: [], meetingsCount: 0 }, over || {});
}
(function () {
  // C1 traveled-and-found: a meeting beats everything, even a
  // still-open window and a later death.
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: null, meetingsCount: 1,
    windowRows: [trow(20), trow(21, { holderAlive: false })] }));
  check('C1 traveled-and-found: meeting beats still-open + death',
    r.cls === 'traveled-and-found', r.cls);
})();
(function () {
  // C2 still-open: no meeting, closeDay null.
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: null,
    windowRows: [trow(20, { holderExped: true }), trow(25)] }));
  check('C2 still-open: no meeting, closeDay null',
    r.cls === 'still-open' && r.traveledDays === 1, r.cls + ' traveled=' + r.traveledDays);
})();
(function () {
  // C3 died-en-route: death-day row on expedition; cause + place
  // joined from the death log + node.
  const rows = [trow(20, { holderExped: true }),
    trow(25, { holderExped: true, holderNode: { nx: 7, ny: 6 } }),
    trow(26, { holderAlive: false, holderExped: true, holderNode: { nx: 7, ny: 6 } })];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 26, closeKind: 'holder-died',
    windowRows: rows,
    deaths: [{ day: 26, kind: 'villager', who: 'v1', cause: 'monster', player: false }] }));
  check('C3 died-en-route: died on expedition, cause monster, place away',
    r.cls === 'died-en-route' && r.deathDay === 26 && r.deathCause === 'monster' && r.deathPlace === 'away',
    r.cls + ' d' + r.deathDay + ' ' + r.deathCause + '/' + r.deathPlace);
})();
(function () {
  // C4 stayed-home-died: died at Haven, never on expedition, every
  // window row at Haven.
  const rows = [trow(20), trow(21), trow(22, { holderAlive: false })];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 22, closeKind: 'holder-died',
    windowRows: rows,
    deaths: [{ day: 22, kind: 'villager', who: 'v1', cause: 'the wild', player: false }] }));
  check('C4 stayed-home-died: died at Haven, never traveled',
    r.cls === 'stayed-home-died' && r.deathCause === 'the wild' && r.deathPlace === 'haven' && r.everExped === false,
    r.cls + ' ' + r.deathCause + '/' + r.deathPlace);
})();
(function () {
  // C5 died-at-home-other: died at Haven AFTER having traveled
  // (Greta's shape: out, back, died defending the door).
  const rows = [trow(20, { holderExped: true, holderNode: { nx: 7, ny: 6 } }),
    trow(25), trow(26, { holderAlive: false })];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 26, closeKind: 'holder-died',
    windowRows: rows,
    deaths: [{ day: 26, kind: 'villager', who: 'v1', cause: 'monster', player: false }] }));
  check('C5 died-at-home-other: traveled, then died at home',
    r.cls === 'died-at-home-other' && r.deathPlace === 'haven' && r.everExped === true,
    r.cls + ' ' + r.deathPlace);
})();
(function () {
  // C6 traveled-not-found: alive at close, no meeting, traveled.
  const rows = [trow(20, { holderExped: true }), trow(25), trow(30)];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 30, windowRows: rows }));
  check('C6 traveled-not-found: alive at close, no meeting',
    r.cls === 'traveled-not-found' && r.deathDay === null, r.cls);
})();
(function () {
  // C7 death-day row missing: the plan was deleted the same day the
  // holder died, so the death-day tracker row is absent — fall back
  // to the last alive day's row, and flag it.
  const rows = [trow(20, { holderExped: true, holderNode: { nx: 7, ny: 6 } }), trow(25)];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 26, closeKind: 'holder-died',
    windowRows: rows, censusRows: [trow(26, { holderAlive: false })],
    deaths: [{ day: 26, kind: 'villager', who: 'v1', cause: 'combat', player: false }] }));
  check('C7 death-day row missing: census supplies the death day, last alive row supplies the place, flagged',
    r.cls === 'died-at-home-other' && r.deathDay === 26 && r.deathRowMissing === true && r.deathCause === 'combat',
    r.cls + ' d' + r.deathDay + ' missing=' + r.deathRowMissing + ' ' + r.deathCause);
})();
(function () {
  // C8 no death-log row: the cause is explicit unknown, not a
  // silent default.
  const rows = [trow(20), trow(21, { holderAlive: false })];
  const r = ANALYZE.classifyLaunch(clsArgs({ closeDay: 21, closeKind: 'holder-died', windowRows: rows, deaths: [] }));
  check('C8 no death-log row: cause is explicit unknown',
    r.cls === 'stayed-home-died' && r.deathCause === 'unknown (no death-log row)', r.cls + ' / ' + r.deathCause);
})();

// ---------- 4. analyzeLaunchsurviveSeed fixtures (end to end) ----------
console.log('== analyzeLaunchsurviveSeed fixtures ==');
function baseSeed(over) {
  const j = {
    seed: 102401, days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, villageLost: false,
    instrumentErrors: [], v4seeds: [], v4encounters: [], killCalls: [], deaths: [],
    instances: [], attributionCoverage: 1, v4launchTrack: [], dawnbidCensus: [],
  };
  return Object.assign(j, over || {});
}
function launchedInst(vid, target, seedDay, launchDay, companion, closeDay, closeKind) {
  return { vid: vid, target: target, seedDay: seedDay, bucket: 'launched',
    resolved: [{ outcome: 'launched', day: launchDay, companion: companion || null }],
    closeDay: closeDay == null ? null : closeDay,
    closeKind: closeDay == null ? null : (closeKind || 'plan-deleted') };
}
function enc(day, vid, mid, wave, origin, outcome) {
  return { day: day, vid: vid, mid: mid, wave: wave, origin: origin, outcome: outcome };
}
function track(day, vid, target, over) {
  const r = { day: day, vid: vid, target: target, needWave: 4, stage: 'hunt', party: ['v2'],
    holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false,
    holderSick: false, holderHealth: 90, haven: HAVEN, partyNodes: { v2: { nx: 4, ny: 4 } },
    planNode: { nx: 4, ny: 4 }, sightingTile: { tx: 7, ty: 6, day: 10 },
    lastKnownTile: { nx: 7, ny: 6 }, lastKnownSource: 'sighting',
    targetNearDist: null, targetNearCount: 0, targetAliveCount: 0 };
  return Object.assign(r, over || {});
}
(function () {
  // L1: in-window expedition meeting + persistent target -> traveled-and-found, persistence yes.
  const rows = [];
  for (let d = 20; d <= 40; d++) {
    rows.push(track(d, 'v1', 'strike', d === 20 ? { holderExped: true, targetNearCount: 1, targetNearDist: 1, targetAliveCount: 2 } : {}));
  }
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', 40)],
    v4encounters: [enc(25, 'v2', 'strike', 4, 'expedition', 'vKill')],
    v4launchTrack: rows,
    dawnbidCensus: rows.map(function (r) { return { day: r.day, vid: 'v1', target: 'strike', holderAlive: true }; }),
  });
  const r = ANALYZE.analyzeLaunchsurviveSeed(j);
  check('L1 end-to-end: meeting + persistence -> traveled-and-found, persistence yes, 1 meeting',
    r.launches.length === 1 && r.launches[0].cls === 'traveled-and-found' &&
    r.launches[0].persistence === 'yes' && r.launches[0].meetings === 1 &&
    r.launches[0].persistentDays === 1 && r.launches[0].minTargetNearDist === 1 &&
    r.launches[0].lastKnownSource === 'sighting',
    JSON.stringify(r.launches[0] && { cls: r.launches[0].cls, persistence: r.launches[0].persistence, meetings: r.launches[0].meetings }));
  check('L1 meeting rows carry the frozen definition (expedition, holder/companion, target, in-window)',
    r.launches[0].meetingRows.length === 1 && r.launches[0].meetingRows[0].day === 25 &&
    r.launches[0].meetingRows[0].vid === 'v2' && r.launches[0].meetingRows[0].origin === 'expedition',
    JSON.stringify(r.launches[0].meetingRows));
})();
(function () {
  // L2: holder dies at home after traveling, no meetings, target
  // never near the last-known tile -> died-at-home-other, persistence no.
  const rows = [];
  for (let d = 20; d <= 26; d++) {
    rows.push(track(d, 'v1', 'strike', d === 20 ? { holderExped: true, holderNode: { nx: 7, ny: 6 } } : (d === 26 ? { holderAlive: false } : {})));
  }
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', 26, 'holder-died')],
    v4launchTrack: rows,
    dawnbidCensus: rows.map(function (r) { return { day: r.day, vid: 'v1', target: 'strike', holderAlive: r.holderAlive }; }),
    deaths: [{ day: 26, kind: 'villager', who: 'v1', cause: 'monster', player: false }],
  });
  const r = ANALYZE.analyzeLaunchsurviveSeed(j);
  check('L2 end-to-end: died at home after traveling -> died-at-home-other, persistence no',
    r.launches.length === 1 && r.launches[0].cls === 'died-at-home-other' &&
    r.launches[0].persistence === 'no' && r.launches[0].deathDay === 26 &&
    r.launches[0].deathCause === 'monster' && r.launches[0].deathPlace === 'haven',
    JSON.stringify(r.launches[0] && { cls: r.launches[0].cls, persistence: r.launches[0].persistence, death: r.launches[0].deathDay + '/' + r.launches[0].deathCause }));
  check('L2 linger: holder-died instance with no census tail -> tail 0, plan does not linger',
    r.linger.length === 1 && r.linger[0].postDeathTailDays === 0 && r.linger[0].planLingers === false,
    JSON.stringify(r.linger));
})();
(function () {
  // L3: still-open launch + a lingering plan (census tail after death).
  const rows = [];
  for (let d = 20; d <= 30; d++) rows.push(track(d, 'v1', 'strike', {}));
  const census = rows.map(function (r) { return { day: r.day, vid: 'v1', target: 'strike', holderAlive: true }; });
  // A second, non-launched instance whose holder died on day 15;
  // its plan lingers in the census for 10 more days (haventick shape).
  const tailCensus = [];
  for (let d = 10; d <= 25; d++) tailCensus.push({ day: d, vid: 'v9', target: 'audit', holderAlive: d < 15 });
  const j = baseSeed({
    instances: [
      launchedInst('v1', 'strike', 10, 20, 'v2', null),
      { vid: 'v9', target: 'audit', seedDay: 5, bucket: 'plan-churned-before-dawn',
        resolved: [], closeDay: 15, closeKind: 'holder-died' },
    ],
    v4launchTrack: rows,
    dawnbidCensus: census.concat(tailCensus),
  });
  const r = ANALYZE.analyzeLaunchsurviveSeed(j);
  check('L3 still-open launch classifies still-open',
    r.launches.length === 1 && r.launches[0].cls === 'still-open', JSON.stringify(r.launches.map(function (l) { return l.cls; })));
  check('L3 linger: dead holder plan lingers 10 census days after closeDay',
    r.linger.length === 1 && r.linger[0].postDeathTailDays === 10 && r.linger[0].planLingers === true &&
    r.lingeringPlans === 1 && r.medianTailDays === 10,
    JSON.stringify(r.linger));
})();
(function () {
  // L4 tracker gap: a launched instance with zero window tracker
  // rows is counted (bar 1 fails on it), not silently classified.
  const j = baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', 40)],
    v4launchTrack: [],
  });
  const r = ANALYZE.analyzeLaunchsurviveSeed(j);
  check('L4 tracker gap: launched instance with no window rows -> trackerGaps 1',
    r.trackerGaps === 1 && r.launches.length === 1, 'gaps=' + r.trackerGaps);
})();
(function () {
  // L5 leg judge: power bar + classification bar on hand-built legs.
  function legOf(perSeedList) {
    let launches = 0, gaps = 0, uncl = 0, nopers = 0;
    const byClass = {};
    for (const c of ANALYZE.LAUNCH_CLASSES) byClass[c] = 0;
    const all = [];
    for (const s of perSeedList) {
      launches += s.launches.length; gaps += s.trackerGaps;
      for (const l of s.launches) {
        all.push(l);
        if (ANALYZE.LAUNCH_CLASSES.indexOf(l.cls) === -1) uncl++;
        if (l.persistence !== 'yes' && l.persistence !== 'no') nopers++;
        byClass[l.cls]++;
      }
    }
    return { instrumentErrors: 0, files: 8, parseErrors: [], seeds: 8,
      attributionCoverage: 1, trackerGaps: gaps, launchesN: launches,
      launches: all, byClass: byClass };
  }
  const ctrl = legOf([]);
  const on = legOf([
    ANALYZE.analyzeLaunchsurviveSeed(baseSeed({
      instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
      v4launchTrack: [track(20, 'v1', 'strike', { holderExped: true })],
    })),
    ANALYZE.analyzeLaunchsurviveSeed(baseSeed({ seed: 102402,
      instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
      v4launchTrack: [track(20, 'v1', 'strike', { holderExped: true })],
    })),
    ANALYZE.analyzeLaunchsurviveSeed(baseSeed({ seed: 102403,
      instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
      v4launchTrack: [track(20, 'v1', 'strike', { holderExped: true })],
    })),
  ]);
  const judge = ANALYZE.judgeLaunchsurvive(ctrl, on);
  check('L5 judge: 3 launches -> power bar passes; all classified + persistence measured -> classification passes',
    judge.power.pass === true && judge.power.value === 3 && judge.classification.pass === true,
    'power=' + JSON.stringify(judge.power) + ' class=' + JSON.stringify(judge.classification));
  const onWeak = legOf([ANALYZE.analyzeLaunchsurviveSeed(baseSeed({
    instances: [launchedInst('v1', 'strike', 10, 20, 'v2', null)],
    v4launchTrack: [track(20, 'v1', 'strike', { holderExped: true })],
  }))]);
  const judge2 = ANALYZE.judgeLaunchsurvive(ctrl, onWeak);
  check('L5 judge: 1 launch -> power bar FAILS (under-powered, do not re-scope)',
    judge2.power.pass === false && judge2.power.value === 1, 'power=' + JSON.stringify(judge2.power));
})();

// ---------- 5. Recorder: live in-memory run (shape + tracker) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'seedpaths-driver-20261116.js'));
  check('live driver sees LAUNCHSURVIVE=1', driver.LAUNCHSURVIVE === true);
  check('live driver LAUNCHSURVIVE implies SEEDLAND (effective flag true)', driver.SEEDLAND === true);
  const out = await driver.oneRun(102401);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries v4 arrays + launchTrackOn flag', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters) && out.launchTrackOn === true, 'launchTrackOn=' + out.launchTrackOn);
  check('live run carries v4launchTrack array under LAUNCHSURVIVE=1', Array.isArray(out.v4launchTrack), 'has key: ' + ('v4launchTrack' in out));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const noOrigin = (out.v4encounters || []).find(function (r) { return !r.origin || typeof r.origin !== 'string'; });
  check('every recorded v4encounters row carries an origin string (SEEDLAND implied)', !noOrigin, noOrigin ? JSON.stringify(noOrigin).slice(0, 300) : '');
  const w5rows = (out.v4encounters || []).filter(function (r) { return (r.wave | 0) === 5; });
  const badTrack = (out.v4launchTrack || []).find(function (r) {
    return r.day == null || !r.vid || !r.target || !('holderAlive' in r) || !('holderNode' in r) ||
      !('partyNodes' in r) || !('lastKnownTile' in r) || !('lastKnownSource' in r) ||
      !('targetNearDist' in r) || !('targetNearCount' in r) || !('targetAliveCount' in r) ||
      (r.lastKnownSource !== null && r.lastKnownSource !== 'sighting' && r.lastKnownSource !== 'planNode');
  });
  check('every tracker row carries the frozen fields (incl. lastKnownSource sighting|planNode|null)', !badTrack, badTrack ? JSON.stringify(badTrack).slice(0, 400) : '');
  console.log('  info: live 5d run recorded ' + (out.v4encounters || []).length + ' encounters (' + w5rows.length + ' wave-5), ' +
    (out.v4seeds || []).length + ' seed rows, ' + (out.v4launchTrack || []).length + ' tracker rows');
  return out;
}

// ---------- 6. Flag-unset shape + determinism legs D1/D2 (60d, seed 102401) ----------
console.log('== flag-unset shape + determinism legs D1/D2 ==');
function childRun(days, envExtra) {
  const env = Object.assign({}, process.env, { DAYS: String(days) }, envExtra || {});
  // An explicit undefined value means "remove this key from the child
  // env" (execFileSync would stringify it otherwise).
  for (const k of Object.keys(env)) if (env[k] === undefined) delete env[k];
  const script = "const d=require('./scripts/seedpaths-driver-20261116.js');" +
    "d.oneRun(102401).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  // Flag unset: seedpaths shape — every encounter row wave == 4,
  // NO origin key, and NO v4launchTrack key at all.
  const unset = childRun(60, { SEEDLAND: undefined, LAUNCHSURVIVE: undefined });
  const unsetEncs = unset.full.v4encounters || [];
  const unsetBadWave = unsetEncs.find(function (r) { return (r.wave | 0) !== 4; });
  const unsetHasOrigin = unsetEncs.find(function (r) { return 'origin' in r; });
  check('flag unset: every encounter row is wave 4 (no wave-5 watch)', !unsetBadWave, unsetBadWave ? JSON.stringify(unsetBadWave).slice(0, 200) : '');
  check('flag unset: no encounter row carries an origin key', !unsetHasOrigin, unsetHasOrigin ? JSON.stringify(unsetHasOrigin).slice(0, 200) : '');
  check('flag unset: no v4launchTrack key on the output', !('v4launchTrack' in unset.full), 'keys=' + Object.keys(unset.full).filter(function (k) { return k.indexOf('launch') !== -1; }).join(','));
  console.log('  info: flag-unset 60d run recorded ' + unsetEncs.length + ' encounters');
  // D1/D2 with LAUNCHSURVIVE=1 SEEDLAND=1.
  const a = childRun(60, { SEEDLAND: '1', LAUNCHSURVIVE: '1' });
  const b = childRun(60, { SEEDLAND: '1', LAUNCHSURVIVE: '1' });
  check('D1 repeatability: identical full corpus, recorder ON twice, LAUNCHSURVIVE=1 (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun(60, { SEEDLAND: '1', LAUNCHSURVIVE: '1', SEEDPATHS_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, LAUNCHSURVIVE=1 (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4 arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.v4encounters || []).length === 0);
  check('D2 recorder-off run carries an empty v4launchTrack array (flag on, recorder off)',
    Array.isArray(off.full.v4launchTrack) && off.full.v4launchTrack.length === 0,
    'has key: ' + ('v4launchTrack' in off.full) + ' len: ' + ((off.full.v4launchTrack || []).length));
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  const origins = {};
  for (const r of (a.full.v4encounters || [])) origins[r.origin] = (origins[r.origin] || 0) + 1;
  console.log('  info: D1 60d run recorded ' + (a.full.v4encounters || []).length + ' encounters by origin ' + JSON.stringify(origins) +
    ', ' + (a.full.v4seeds || []).length + ' seed rows, ' + (a.full.v4launchTrack || []).length + ' tracker rows');
}

// ---------- 7. Observable effect: real launches classified from real corpora ----------
console.log('== real corpora (pilot) ==');
function realCorpora() {
  const onDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-launchsurvive-a-on');
  const ctrlDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-launchsurvive-a-control');
  if (!fs.existsSync(onDir) || !fs.existsSync(ctrlDir)) {
    noteSkip('pilot corpora not present yet — real-launch classification runs after the judged pilot',
      'expected ' + path.relative(REPO, onDir) + ' + control');
    return;
  }
  const on = ANALYZE.analyzeLaunchsurviveLeg(onDir);
  const ctrl = ANALYZE.analyzeLaunchsurviveLeg(ctrlDir);
  check('real corpora: on-leg analyzer runs, every launch classified into exactly one of the six classes',
    on.launches.every(function (l) { return ANALYZE.LAUNCH_CLASSES.indexOf(l.cls) !== -1; }),
    'launches=' + on.launchesN + ' classes=' + JSON.stringify(on.byClass));
  check('real corpora: target persistence measured (yes/no) for every on-leg launch',
    on.launches.every(function (l) { return l.persistence === 'yes' || l.persistence === 'no'; }),
    'persistence=' + on.launches.map(function (l) { return l.persistence; }).join(','));
  check('real corpora: zero tracker gaps on either leg (every launch window observed)',
    on.trackerGaps === 0 && ctrl.trackerGaps === 0,
    'gaps on=' + on.trackerGaps + ' control=' + ctrl.trackerGaps);
  check('real corpora: meetings share is a real measured number (not a fixture)',
    on.meetingsShare !== null || on.launchesN === 0,
    'share=' + on.meetingsShare + ' launches=' + on.launchesN);
  console.log('  info: real on-leg launches=' + on.launchesN + ' byClass=' + JSON.stringify(on.byClass) +
    ' meetingsShare=' + on.meetingsShare + ' persistenceYes=' + on.persistenceYes);
}

(async function () {
  try {
    await liveRuns();
    await determinism();
    realCorpora();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
