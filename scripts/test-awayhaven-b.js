// test-awayhaven-b.js — proof for arm sim-awayhaven-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seed call's presence matches AWAYHAVEN_SEED_CALL
// (default 'on'; 'off' is the post-revert not-built shape), the
// driver wraps exist (incl. the companionPool capture + the members
// extension + the awayTrace daily snapshot), the game-code diff is
// the seed call only, the wave-4 id set matches the data, the
// away-while-at-Haven classifier places one fixture per class
// ((a) linger-after-return, (b) non-spatial absence,
// (c) recorder/node-read artifact, (d) other-with-evidence,
// UNRESOLVED with a named missing hook, window widening, the
// same-day-return grace, multi-trip reads (each flag day against
// ITS trip), the departure-part guard flicker, and the return-walk
// clock lag), the subject extraction finds the 9 distinct
// members / 18 flag rows of the poolmarginals instrument corpus, the
// recorder rows have their shape, the vbrainScorePick wrap records
// pool rows without changing the pick, the pool replica runs against
// live game state, and the determinism legs D1 (repeatability) + D2
// (wrap neutrality) are green at 60d on seed 102131.
// Usage:
//   node scripts/test-awayhaven-b.js            (seed call expected ON)
//   AWAYHAVEN_SEED_CALL=off node scripts/test-awayhaven-b.js   (post-revert shape)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const SEED_CALL_EXPECTED = process.env.AWAYHAVEN_SEED_CALL || 'on';
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-awayhaven-b.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const seedBlockPresent = gameJs.indexOf("VETPARTY (sim-vetparty-a)") !== -1 &&
  gameJs.indexOf("this.winPlanSeedFromFight(vid, mdef, 'fled')") !== -1;
check('seed call present iff AWAYHAVEN_SEED_CALL=on (expected ' + SEED_CALL_EXPECTED + ', found ' + (seedBlockPresent ? 'present' : 'absent') + ')',
  (SEED_CALL_EXPECTED === 'on') === seedBlockPresent);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcOk = srcStatus.every(function (s) { return /src\/js\/game\.js$/.test(s); }) &&
  (SEED_CALL_EXPECTED === 'off' ? srcStatus.length === 0 : true);
check('game-code worktree diff is the seed call only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*awayhaven-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is awayhaven-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'awayhaven-driver-20261116.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'companionPool', 'poolReplica', 'members', 'awayTrace', 'awayTraceSnapshot']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has AWAYHAVEN_RECORDER off-switch', driverSrc.indexOf("AWAYHAVEN_RECORDER") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records the raw away record (purpose/sinceDay/duration/nx/ny)', driverSrc.indexOf('sinceDay: raw.sinceDay') !== -1 && driverSrc.indexOf('purpose: raw.purpose') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
// The two findCompanions exist where the prereg says they do.
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('villager-brain.js findCompanion reads v.away at line ~135',
  brainJs.indexOf('var away = v.away || {};') !== -1);
check('villager-brain.js findCompanion calls companionRank (party_launch path)',
  brainJs.indexOf('function findCompanion') !== -1 && brainJs.indexOf('companionRank(vid, elig') !== -1);
check('win-plan.js findCompanion exists (depart-gate twin)',
  winPlanJs.indexOf('function findCompanion') !== -1 && winPlanJs.indexOf('companionRank(vid, elig') !== -1);
// The away setters / clearers the classifier's mechanisms rest on.
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
const objectivesJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-objectives.js'), 'utf8');
check('expedition departure sets v.away (villager-agency.js)',
  agencyJs.indexOf("v.away[vid] = {") !== -1 && agencyJs.indexOf("purpose: 'expedition'") !== -1);
check('objective departure sets v.away (villager-objectives.js)',
  objectivesJs.indexOf("v.away[vid] = {") !== -1);
check('base return clock clears v.away and sets the node to Haven (game.js)',
  gameJs.indexOf("delete v.away[rid];") !== -1 && gameJs.indexOf("this.npcSetNode(rid, hx, hy);") !== -1);

// ---------- 2. Away classifier unit fixtures ----------
console.log('== away classifier fixtures ==');
const HAVEN = { nx: 4, ny: 4 };
function trow(day, o) {
  const base = { day: day, id: 'mx1', name: 'Test', alive: true, away: false, awayRaw: null,
    node: { nx: 4, ny: 4 }, haven: { nx: 4, ny: 4 }, objective: null, exped: null,
    engaged: false, dawnCommit: null, partyOf: null, withScholar: false };
  return Object.assign(base, o || {});
}
// buildTrace(days, fn): consecutive trace rows over `days` ([lo, hi]);
// fn(day) returns partial overrides for that day.
function buildTrace(days, fn) {
  const rows = [];
  for (let d = days[0]; d <= days[1]; d++) rows.push(trow(d, fn ? fn(d) : {}));
  return rows;
}
function awayRec(nx, ny, purpose, sinceDay, duration) {
  return { nx: nx, ny: ny, purpose: purpose, sinceDay: sinceDay, sincePart: 0, duration: duration };
}
// (a) linger-after-return: spell 10-14, node off-Haven 10-12, back
// day 13, flag day 14 (>= 13+1).
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 14) return {};
    return { away: true, awayRaw: awayRec(2, 2, 'forage', 10, 20),
      node: d <= 12 ? { nx: 2, ny: 2 } : { nx: 4, ny: 4 },
      objective: { kind: 'FORAGE', state: 'out', purpose: 'forage', tx: 2, ty: 2, partsLeft: 20 - (d - 10) * 4, indoor: false, targetVid: null, companion: null } };
  });
  const c = ANALYZE.classifyMember(rows, [14], HAVEN);
  check('(a) linger-after-return: node back day 13, flag day 14',
    c.cls === '(a)' && c.spell[0] === 10 && c.spell[1] === 14 && c.details.nodeReturnDay === 13 && c.details.returnDay === 15,
    'cls=' + c.cls + ' spell=' + JSON.stringify(c.spell) + ' nodeReturnDay=' + c.details.nodeReturnDay + ' returnDay=' + c.details.returnDay + ' evidence=' + c.evidence);
})();
// (b) non-spatial absence: spell 10-12, node never leaves Haven, the
// away record AND the expedition record point at the Haven tile.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 12) return {};
    return { away: true, awayRaw: awayRec(4, 4, 'expedition', 10, 12),
      exped: { tx: 4, ty: 4, dist: 0, legs: d - 10, sinceDay: 10, sincePart: 0, duration: 12, encounters: 0, finds: 0 },
      objective: { kind: 'EXPLORE', state: 'out', purpose: 'expedition', tx: 4, ty: 4, partsLeft: null, indoor: false, targetVid: null, companion: null } };
  });
  const c = ANALYZE.classifyMember(rows, [11], HAVEN);
  check('(b) non-spatial absence: expedition to the Haven tile',
    c.cls === '(b)' && c.details.expedOnFlagDay && c.details.expedOnFlagDay.tx === 4 && c.details.expedOnFlagDay.ty === 4,
    'cls=' + c.cls + ' evidence=' + c.evidence);
})();
// (c) recorder artifact: no spell covers the flag day; the daily
// record says the member was never away around those dawns.
(function () {
  const rows = buildTrace([5, 16], function () { return {}; });
  const c = ANALYZE.classifyMember(rows, [12], HAVEN);
  check('(c) recorder artifact: no spell, trace says never away',
    c.cls === '(c)' && c.spell === null,
    'cls=' + c.cls + ' evidence=' + c.evidence);
})();
// (c) node-read branch: the trace shows the node off-Haven for the
// whole spell, but the pool row reads it at Haven.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 14) return {};
    return { away: true, awayRaw: awayRec(2, 2, 'forage', 10, 20), node: { nx: 2, ny: 2 } };
  });
  const c = ANALYZE.classifyMember(rows, [12], HAVEN);
  check('(c) node-read branch: node off-Haven the whole spell, pool says Haven',
    c.cls === '(c)',
    'cls=' + c.cls + ' evidence=' + c.evidence);
})();
// (d) departure recorded but never moved: node never leaves Haven,
// yet the away record points off-Haven.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 12) return {};
    return { away: true, awayRaw: awayRec(1, 2, 'forage', 10, 8) };
  });
  const c = ANALYZE.classifyMember(rows, [11], HAVEN);
  check('(d) other: departure recorded to an off-Haven target, node never moved',
    c.cls === '(d)',
    'cls=' + c.cls + ' evidence=' + c.evidence);
})();
// (d) return-day-only: node returns day 13, spell ends day 13, the
// only flag day IS the return day — the frozen (a) rule (flag >=1
// day after the return) does not fire.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 13) return {};
    return { away: true, awayRaw: awayRec(2, 2, 'forage', 10, 16),
      node: d <= 12 ? { nx: 2, ny: 2 } : { nx: 4, ny: 4 } };
  });
  const c = ANALYZE.classifyMember(rows, [13], HAVEN);
  check('(d) return-day-only: flag day is the return day itself',
    c.cls === '(d)' && c.details.nodeReturnDay === 13,
    'cls=' + c.cls + ' evidence=' + c.evidence);
})();
// UNRESOLVED: trace gap on the flag day names the missing hook.
(function () {
  const rows = buildTrace([5, 16], function () { return {}; }).filter(function (r) { return r.day !== 12; });
  const c = ANALYZE.classifyMember(rows, [12], HAVEN);
  check('UNRESOLVED: trace gap on the flag day names the hook',
    c.cls === 'UNRESOLVED' && typeof c.missingHook === 'string' && c.missingHook.indexOf('12') !== -1,
    'cls=' + c.cls + ' missingHook=' + c.missingHook);
})();
// UNRESOLVED: no trace rows at all.
(function () {
  const c = ANALYZE.classifyMember([], [12], HAVEN);
  check('UNRESOLVED: empty trace names the hook',
    c.cls === 'UNRESOLVED' && typeof c.missingHook === 'string' && c.missingHook.length > 0,
    'cls=' + c.cls + ' missingHook=' + c.missingHook);
})();
// Window widening: the spell starts day 2, eight days before the
// first flag day — the ±5 window must widen to cover the departure.
(function () {
  const rows = buildTrace([1, 16], function (d) {
    if (d < 2 || d > 13) return {};
    return { away: true, awayRaw: awayRec(2, 2, 'forage', 2, 40),
      node: d <= 10 ? { nx: 2, ny: 2 } : { nx: 4, ny: 4 } };
  });
  const c = ANALYZE.classifyMember(rows, [12, 13], HAVEN);
  check('window widens to the departure when it predates the ±5 window',
    c.cls === '(a)' && c.window.widened === true && c.window.start === 2 && c.window.end === 18,
    'cls=' + c.cls + ' window=' + JSON.stringify(c.window));
})();
// Same-day-return grace: spell ends day 12, the flag day is day 13
// (away at dawn, home by end of day) — still (a), not (c).
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 12) return {};
    return { away: true, awayRaw: awayRec(2, 2, 'forage', 10, 12),
      node: d <= 11 ? { nx: 2, ny: 2 } : { nx: 4, ny: 4 } };
  });
  const c = ANALYZE.classifyMember(rows, [13], HAVEN);
  check('same-day-return grace: flag day is the return day, still (a)',
    c.cls === '(a)' && c.details.graceDays && c.details.graceDays.indexOf(13) !== -1,
    'cls=' + c.cls + ' graceDays=' + JSON.stringify(c.details.graceDays) + ' evidence=' + c.evidence);
})();
// Expedition record vanishes mid-spell: recorded in details, the
// class still follows the node trajectory.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d < 10 || d > 12) return {};
    const base = { away: true, awayRaw: awayRec(4, 4, 'expedition', 10, 12) };
    if (d < 12) base.exped = { tx: 4, ty: 4, dist: 0, legs: d - 10, sinceDay: 10, sincePart: 0, duration: 12, encounters: 0, finds: 0 };
    return base;
  });
  const c = ANALYZE.classifyMember(rows, [12], HAVEN);
  check('expedition record vanished before the flag day is recorded in details',
    c.cls === '(b)' && c.details.expedVanished === true,
    'cls=' + c.cls + ' expedVanished=' + c.details.expedVanished);
})();
// Multi-trip (emma/adaeze shape): three back-to-back expeditions —
// two to the Haven tile, then one off-Haven. The classifier must
// read each flag day against ITS trip, not the merged span.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d === 10 || d === 11) return { away: true, awayRaw: awayRec(4, 4, 'expedition', 10, 13),
      exped: { tx: 4, ty: 4, dist: 1, legs: (d - 10) * 4, sinceDay: 10, sincePart: 0, duration: 13, encounters: 0, finds: 1 },
      objective: { kind: 'EXPLORE', state: 'out', purpose: 'expedition', tx: 4, ty: 4, partsLeft: 3, indoor: false, targetVid: null, companion: null } };
    if (d === 12 || d === 13) return { away: true, awayRaw: awayRec(4, 4, 'expedition', 12, 20),
      exped: { tx: 4, ty: 4, dist: 1, legs: (d - 12) * 4, sinceDay: 12, sincePart: 0, duration: 20, encounters: 0, finds: 0 },
      objective: { kind: 'EXPLORE', state: 'out', purpose: 'expedition', tx: 4, ty: 4, partsLeft: 2, indoor: false, targetVid: null, companion: null } };
    if (d === 14 || d === 15) return { away: true, awayRaw: awayRec(5, 5, 'expedition', 14, 13),
      exped: { tx: 5, ty: 5, dist: 2, legs: (d - 14) * 4, sinceDay: 14, sincePart: 0, duration: 13, encounters: 0, finds: 0 },
      node: { nx: 5, ny: 5 },
      objective: { kind: 'EXPLORE', state: 'out', purpose: 'expedition', tx: 5, ty: 5, partsLeft: 3, indoor: false, targetVid: null, companion: null } };
    return {};
  });
  const c = ANALYZE.classifyMember(rows, [11, 13], HAVEN);
  check('multi-trip: back-to-back expeditions read per trip, both (b)',
    c.cls === '(b)' && c.details.trips && c.details.trips.length === 3 &&
    c.details.coveringTrips.length === 2 &&
    c.details.perDay.every(function (p) { return p.mechanism === 'to-haven'; }),
    'cls=' + c.cls + ' trips=' + JSON.stringify(c.details.trips.map(function (t) { return [t.start, t.end]; })) + ' covering=' + JSON.stringify(c.details.coveringTrips));
})();
// Departure-part flicker (elena/boris shape): the flag day is the
// trip's first day — departed at dawn as a guard, node back at the
// post by end of day.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d === 10 || d === 11) return { away: true, awayRaw: awayRec(5, 4, 'guard', 10, 3),
      node: { nx: 5, ny: 4 },
      objective: { kind: 'GUARD', state: 'out', purpose: 'guard', tx: 5, ty: 4, partsLeft: 3, indoor: false, targetVid: 'miguel_santos', companion: 'miguel_santos' } };
    return {};
  });
  const c = ANALYZE.classifyMember(rows, [10], HAVEN);
  check('(d) departure-part flicker: flag day is the guard trip\'s first day',
    c.cls === '(d)' && c.details.perDay[0].mechanism === 'departure-flicker' &&
    c.evidence.indexOf('meander') !== -1,
    'cls=' + c.cls + ' mechanism=' + (c.details.perDay[0] || {}).mechanism + ' evidence=' + c.evidence);
})();
// Return-walk + clock lag (gen_51ydeej shape): the trip's last away
// day is 11, the node is home on day 12, the flag day is 12 — the
// clock read 3 parts against a duration of 4 at that dawn.
(function () {
  const rows = buildTrace([5, 16], function (d) {
    if (d === 11) return { away: true,
      awayRaw: { nx: 5, ny: 5, purpose: 'visit', sinceDay: 11, sincePart: 1, duration: 4 },
      node: { nx: 5, ny: 5 },
      objective: { kind: 'VISIT', state: 'out', purpose: 'visit', tx: 5, ty: 5, partsLeft: 4, indoor: false, targetVid: 'gen_j4ldf1z', companion: null } };
    return {};
  });
  const c = ANALYZE.classifyMember(rows, [12], HAVEN);
  check('(d) return-day with clock lag: flag day is the arrival day, clock 3 < 4 at dawn',
    c.cls === '(d)' && c.details.perDay[0].mechanism === 'return-day' &&
    c.evidence.indexOf('3 parts against a duration of 4') !== -1,
    'cls=' + c.cls + ' mechanism=' + (c.details.perDay[0] || {}).mechanism + ' evidence=' + c.evidence);
})();

// ---------- 2b. Subject extraction on the real poolmarginals corpus ----------
// The 18 away-while-at-Haven rows (9 distinct members) the poolmarginals
// evidence names must be exactly what extractFlagged finds — this pins
// the subject before any judged sim runs.
(function () {
  const dir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-poolmarginals-b-on');
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  check('poolmarginals instrument corpus has 8 files', files.length === 8, 'got ' + files.length);
  let members = 0, rows = 0;
  const ids = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const ext = ANALYZE.extractFlagged(j);
    members += ext.flagged.length;
    for (const m of ext.flagged) { rows += m.flagDays.length; ids.push(j.seed + ':' + m.id); }
  }
  check('subject extraction: 9 distinct members, 18 flag rows',
    members === 9 && rows === 18,
    'members=' + members + ' rows=' + rows + ' ids=' + JSON.stringify(ids.sort()));
  check('subject extraction: the 3 on-expedition wanderers are seed 102133',
    ids.filter(function (x) { return x.indexOf('102133:') === 0; }).length === 5,
    'ids=' + JSON.stringify(ids.sort()));
})();

// ---------- 3. Recorder: live in-memory run (shape + pick neutrality) ----------
console.log('== recorder live ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'awayhaven-driver-20261116.js'))];
  const driver = require(path.join(REPO, 'scripts', 'awayhaven-driver-20261116.js'));
  const out = await driver.oneRun(102131);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries companionPool array', Array.isArray(out.companionPool));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run carries awayTrace array', Array.isArray(out.awayTrace));
  check('live run policy sha is competent verbatim (74a890f0844e)', out.policySha === '74a890f0844e', 'got ' + out.policySha);
  const badTrace = (out.awayTrace || []).find(function (r) {
    return !(r && typeof r.day === 'number' && typeof r.id === 'string' && typeof r.alive === 'boolean' &&
      typeof r.away === 'boolean' && (r.awayRaw === null || typeof r.awayRaw === 'object') &&
      (r.node === null || (typeof r.node === 'object' && typeof r.node.nx === 'number')) &&
      (r.objective === null || typeof r.objective === 'object') &&
      (r.exped === null || typeof r.exped === 'object') &&
      typeof r.engaged === 'boolean' && typeof r.withScholar === 'boolean');
  });
  check('awayTrace rows have their shape (day/id/alive/away/awayRaw/node/objective/exped/engaged/withScholar)', !badTrace,
    badTrace ? JSON.stringify(badTrace).slice(0, 300) : '');
  // One row per roster member per traced day.
  const byDay = {};
  for (const r of (out.awayTrace || [])) { (byDay[r.day] = byDay[r.day] || []).push(r.id); }
  const rosterN = (((out.samples || {}).roster || [])).length || null;
  const dayKeys = Object.keys(byDay).map(Number).sort(function (a, b) { return a - b; });
  const uniform = dayKeys.every(function (d) { return byDay[d].length === byDay[dayKeys[0]].length; }) &&
    new Set(byDay[dayKeys[0]]).size === byDay[dayKeys[0]].length;
  check('awayTrace covers one row per roster member per traced day', dayKeys.length >= 1 && uniform,
    'days=' + JSON.stringify(dayKeys) + ' per-day=' + (dayKeys.length ? byDay[dayKeys[0]].length : 0) + ' rosterN=' + rosterN);
  const badScore = (out.dawnbidScores || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined); });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badPool = (out.companionPool || []).find(function (r) {
    if (!(r && typeof r.day === 'number' && r.part === 0 && r.vid && r.counts && typeof r.rosterN === 'number' && Array.isArray(r.eligible))) return true;
    let sum = 0;
    for (const k of Object.keys(r.counts)) sum += r.counts[k];
    if (sum !== r.rosterN) return true;
    if (r.eligible.length !== (r.counts.eligible | 0)) return true;
    if ((r.counts.eligible | 0) > 0 && !r.rankedPick) return true;
    if (!Array.isArray(r.members) || r.members.length !== r.rosterN) return true;
    const tally = {};
    for (const m of r.members) {
      if (!m || m.id == null || m.firstFail == null) return true;
      if ((r.fails || {})[m.id] !== m.firstFail) return true;
      tally[m.firstFail] = (tally[m.firstFail] || 0) + 1;
    }
    for (const c of Object.keys(r.counts)) if ((tally[c] || 0) !== (r.counts[c] | 0)) return true;
    return false;
  });
  check('pool rows have their shape (counts sum, eligible matches, pick present, members valid)', !badPool, badPool ? JSON.stringify(badPool).slice(0, 300) : '');
  console.log('  info: live 5d run recorded ' + (out.awayTrace || []).length + ' trace rows, ' +
    (out.companionPool || []).length + ' pool rows, ' + (out.dawnbidScores || []).length + ' score rows');
  return out;
}

// ---------- 3b. Pool replica against live game state ----------
async function replicaLive() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const driver = require(path.join(REPO, 'scripts', 'awayhaven-driver-20261116.js'));
  const { Game } = await loadGame({ seed: 102131, mode: 'awayhaven-proof', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  check('live replica: roster is non-empty', roster.length > 0, 'roster=' + roster.length);
  let checked = 0;
  for (const vid of roster.slice(0, 5)) {
    const pool = driver.poolReplica(Game, vid);
    if (!pool) continue;
    checked++;
    let sum = 0;
    for (const k of Object.keys(pool.counts)) sum += pool.counts[k];
    let membersOk = Array.isArray(pool.members) && pool.members.length === pool.rosterN;
    if (membersOk) {
      const tally = {};
      for (const m of pool.members) {
        if (!m || m.id == null || m.firstFail == null || (pool.fails || {})[m.id] !== m.firstFail) { membersOk = false; break; }
        tally[m.firstFail] = (tally[m.firstFail] || 0) + 1;
      }
      if (membersOk) for (const c of Object.keys(pool.counts)) if ((tally[c] || 0) !== (pool.counts[c] | 0)) { membersOk = false; break; }
    }
    check('live replica for ' + vid + ': counts sum to rosterN, eligible matches, members valid',
      sum === pool.rosterN && pool.eligible.length === (pool.counts.eligible | 0) &&
      ((pool.counts.eligible | 0) === 0 || !!pool.rankedPick) && membersOk,
      'sum=' + sum + ' rosterN=' + pool.rosterN + ' eligible=' + pool.eligible.length + ' pick=' + pool.rankedPick + ' membersOk=' + membersOk);
    if (checked >= 3) break;
  }
  check('live replica ran on at least 3 roster members', checked >= 3, 'checked=' + checked);
}

// ---------- 4. Determinism legs D1 + D2 (60d, seed 102131) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60' }, envExtra || {});
  const script = "const d=require('./scripts/awayhaven-driver-20261116.js');" +
    "d.oneRun(102131).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childFingerprint({ AWAYHAVEN_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty companionPool/dawnbid/v4/awayTrace arrays',
    (off.full.companionPool || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidCensus || []).length === 0 &&
    (off.full.awayTrace || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  console.log('  info: D1 60d run recorded ' + (a.full.awayTrace || []).length + ' trace rows, ' +
    (a.full.companionPool || []).length + ' pool rows, ' +
    (a.full.dawnbidScores || []).length + ' score rows, ' + (a.full.v4seeds || []).length + ' v4 seeds');
}

(async function () {
  try {
    await liveRuns();
    await replicaLive();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
