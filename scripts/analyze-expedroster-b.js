// analyze-expedroster-b.js — analyzer for arm sim-expedroster-b
// (DIAGNOSTIC/TOOLING: the daily st.exped snapshot instrument).
//
// Reads the per-seed corpora under evidence/2026-11-18/
// perseed-expedroster-b/ (driver scripts/expedroster-driver-b.js)
// and, for every deduped wave-4 launch (the analyzer's
// launchesForSeed, imported from scripts/trace-launchquad-b.js — the
// tracer replicates the analyzer's join exactly, so the import IS the
// replication; the launch-filter trap is pinned by the proof test),
// classifies the expedition from its v4expedRoster rows over the
// window [launchDay, launchDay+21]:
//
//   together-en-route — some day in the window has >=2 launch members
//     with roster rows on the SAME node (nx,ny) AND the SAME target
//     tile (tx,ty). The target check guards against coincidental
//     co-location of villagers on different trips.
//   destination-only — no together day, but some day has >=2 launch
//     members with roster rows sharing a target tile (the launch
//     created shared-destination expeditions; the members never
//     shared a tile).
//   unknown-with-reason — otherwise; reason one of:
//     no-roster-rows (no member has any row in the window — the launch
//       was recorded but no expedition was ever visible),
//     holder-only (only the holder has rows; companions never departed),
//     no-overlap (members have rows but no day has >=2 members with
//       rows — their spans never cover a common day),
//     no-shared-target (some day has >=2 members with rows but they
//       never share a target tile — e.g. a companion kept its own trip).
//
// Instrument metrics (frozen in the prereg
// evidence/2026-11-18/sim-expedroster-b-prereg.md):
//   capture rate — launches whose holder has a roster row within
//     [launchDay, launchDay+2] / all launches. GO bar >=95%.
//   snapshot gaps — missing days strictly inside ONE expedition (one
//     sinceDay run) of a launch member's roster span. GO bar 0.
//     CORRECTED 2026-11-18T0130Z (re-judge): the frozen whole-span rule
//     counted home intervals between expeditions as gaps (111/111 in
//     the pilot were home intervals, 0 true misses); the corrected bar
//     counts gaps only within one sinceDay run. Same corpus, same
//     capture/join bars; the gap bar is the only change.
//   join rate — launched wave-4 meetings (encounters joined to a
//     launch by the replicated join) classifiable — fighter roster row
//     on the meeting day, or a determinable absence reason (fighter
//     dead by meeting day per the deaths list, or the fighter's last
//     roster day precedes the meeting day, i.e. the expedition had
//     ended) — / all launched meetings. GO bar 100%.
//   pool floor — >=5 deduped wave-4 launches; below it NO-GO
//     (METRIC-BROKEN).
//
// Usage:
//   node scripts/analyze-expedroster-b.js [corpusDir] [outJson]
//   node scripts/analyze-expedroster-b.js --selftest
// Exits 0 on GO, 2 on NO-GO (bar missed or pool floor missed).
// No repo writes except the analysis JSON.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const T = require('./trace-launchquad-b.js');
const launchesForSeed = T.launchesForSeed;
const joinLaunch = T.joinLaunch;

const WINDOW_DAYS = 21;
const POOL_FLOOR = 5;

function membersOf(launch) {
  return [launch.vid].concat(launch.party || []);
}

// Pure classification of one launch from its roster rows in the
// window. rosterRows: all v4expedRoster rows for this seed.
// Returns { verdict, reason, togetherDays, sharedTargetDays,
//   membersWithRows, daysWithRows }.
function classifyExpedition(launch, rosterRows) {
  const members = membersOf(launch);
  const d0 = launch.day, d1 = launch.day + WINDOW_DAYS;
  const byVid = {};
  for (const m of members) byVid[m] = [];
  for (const r of (rosterRows || [])) {
    if (!r || byVid[r.vid] === undefined) continue;
    if (r.day < d0 || r.day > d1) continue;
    byVid[r.vid].push(r);
  }
  const membersWithRows = members.filter(function (m) { return byVid[m].length > 0; });
  if (membersWithRows.length === 0) {
    return { verdict: 'unknown-with-reason', reason: 'no-roster-rows', togetherDays: [], sharedTargetDays: [], membersWithRows: membersWithRows, daysWithRows: {} };
  }
  if (membersWithRows.length === 1) {
    if (membersWithRows[0] === launch.vid) {
      return { verdict: 'unknown-with-reason', reason: 'holder-only', togetherDays: [], sharedTargetDays: [], membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
    }
    return { verdict: 'unknown-with-reason', reason: 'companion-only (' + membersWithRows[0] + '; holder never visible)', togetherDays: [], sharedTargetDays: [], membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
  }
  // Days with >=2 members holding rows.
  const byDay = {};
  for (const m of membersWithRows) {
    for (const r of byVid[m]) {
      (byDay[r.day] = byDay[r.day] || []).push(r);
    }
  }
  const days2plus = Object.keys(byDay).filter(function (d) {
    const vids = {};
    for (const r of byDay[d]) vids[r.vid] = true;
    return Object.keys(vids).length >= 2;
  }).map(Number).sort(function (a, b) { return a - b; });
  if (days2plus.length === 0) {
    return { verdict: 'unknown-with-reason', reason: 'no-overlap', togetherDays: [], sharedTargetDays: [], membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
  }
  const togetherDays = [];
  const sharedTargetDays = [];
  for (const d of days2plus) {
    const rows = byDay[d];
    let together = null, shared = null;
    for (let i = 0; i < rows.length && (!together || !shared); i++) {
      for (let j = i + 1; j < rows.length && (!together || !shared); j++) {
        const a = rows[i], b = rows[j];
        if (a.vid === b.vid) continue;
        const sameTarget = a.tx != null && b.tx != null && a.tx === b.tx && a.ty === b.ty;
        if (sameTarget && !shared) shared = { day: d, members: [a.vid, b.vid], target: { tx: a.tx, ty: a.ty } };
        const sameNode = sameTarget && a.node && b.node && a.node.nx === b.node.nx && a.node.ny === b.node.ny;
        if (sameNode && !together) together = { day: d, members: [a.vid, b.vid], node: { nx: a.node.nx, ny: a.node.ny }, target: { tx: a.tx, ty: a.ty } };
      }
    }
    if (together) togetherDays.push(together);
    if (shared) sharedTargetDays.push(shared);
  }
  if (togetherDays.length > 0) {
    return { verdict: 'together-en-route', reason: togetherDays.length + ' together-day(s): first d' + togetherDays[0].day + ' ' + togetherDays[0].members.join('+') + ' on node ' + togetherDays[0].node.nx + ',' + togetherDays[0].node.ny + ' target ' + togetherDays[0].target.tx + ',' + togetherDays[0].target.ty, togetherDays: togetherDays, sharedTargetDays: sharedTargetDays, membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
  }
  if (sharedTargetDays.length > 0) {
    return { verdict: 'destination-only', reason: 'shared target tile on ' + sharedTargetDays.length + ' day(s) (first d' + sharedTargetDays[0].day + ' ' + sharedTargetDays[0].members.join('+') + ' -> ' + sharedTargetDays[0].target.tx + ',' + sharedTargetDays[0].target.ty + ') but never the same node', togetherDays: togetherDays, sharedTargetDays: sharedTargetDays, membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
  }
  return { verdict: 'unknown-with-reason', reason: 'no-shared-target', togetherDays: togetherDays, sharedTargetDays: sharedTargetDays, membersWithRows: membersWithRows, daysWithRows: daysByVid(byVid) };
}

function daysByVid(byVid) {
  const out = {};
  for (const k of Object.keys(byVid)) {
    out[k] = byVid[k].map(function (r) { return r.day; }).sort(function (a, b) { return a - b; });
  }
  return out;
}

// Snapshot gaps: missing days strictly inside ONE expedition (one
// sinceDay run) of a member's roster span. Days between two expeditions
// (a home interval: rows resume under a new sinceDay) are NOT gaps —
// the recorder fires every day an expedition exists, and no expedition
// exists on a home day. Rows without sinceDay fall back to one group
// (the old whole-span rule) so synthetic fixtures stay valid.
function gapDays(rows) {
  const groups = {};
  for (const r of rows) {
    const k = (r.sinceDay == null) ? '' : String(r.sinceDay);
    (groups[k] = groups[k] || []).push(r.day);
  }
  const gaps = [];
  for (const k of Object.keys(groups)) {
    const days = groups[k].sort(function (a, b) { return a - b; });
    for (let i = 1; i < days.length; i++) {
      for (let d = days[i - 1] + 1; d < days[i]; d++) gaps.push(d);
    }
  }
  return gaps.sort(function (a, b) { return a - b; });
}

// Absence reason for a fighter with no roster row on the meeting day.
function meetingAbsenceReason(seedJson, fighterVid, meetingDay, rosterRows) {
  const deaths = seedJson.deaths || [];
  for (const d of deaths) {
    if (d.who === fighterVid && (d.day | 0) <= meetingDay) return 'fighter-dead d' + d.day + ' (' + (d.cause || d.kind || '?') + ')';
  }
  let last = null;
  for (const r of (rosterRows || [])) {
    if (r.vid === fighterVid && r.day < meetingDay && (last == null || r.day > last)) last = r.day;
  }
  if (last != null) return 'exped-ended (last roster row d' + last + ')';
  return null;
}

function analyzeSeed(seedJson) {
  const launches = launchesForSeed(seedJson);
  const roster = seedJson.v4expedRoster || [];
  const deaths = seedJson.deaths || [];
  const exps = [];
  let captured = 0;
  const allGaps = [];
  for (const launch of launches) {
    const c = classifyExpedition(launch, roster);
    // Capture: holder row within [launchDay, launchDay+2].
    const holderRows = roster.filter(function (r) { return r.vid === launch.vid && r.day >= launch.day && r.day <= launch.day + 2; });
    const isCaptured = holderRows.length > 0;
    if (isCaptured) captured++;
    // Gaps per member span.
    const memberGaps = [];
    for (const m of membersOf(launch)) {
      const mrows = roster.filter(function (r) { return r.vid === m && r.day >= launch.day && r.day <= launch.day + WINDOW_DAYS; });
      const g = gapDays(mrows);
      for (const gd of g) memberGaps.push({ vid: m, day: gd });
    }
    for (const g of memberGaps) allGaps.push(g);
    // Meetings joined to this launch.
    const meetings = [];
    for (const e of (seedJson.v4encounters || [])) {
      const jl = joinLaunch(launches, e);
      if (!jl || jl !== launch) continue;
      const row = roster.find(function (r) { return r.vid === e.vid && r.day === e.day; }) || null;
      const absence = row ? null : meetingAbsenceReason(seedJson, e.vid, e.day, roster);
      meetings.push({ day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, rounds: e.rounds,
        allyVids: e.allyVids || [], allyFromStart: e.allyFromStart,
        tile: row ? { node: row.node, target: { tx: row.tx, ty: row.ty }, legs: row.legs } : null,
        absenceReason: absence, classifiable: !!(row || absence) });
    }
    exps.push({ launchDay: launch.day, holder: launch.vid, party: launch.party || [],
      partySize: launch.partySize, target: launch.target, targetWave: launch.targetWave,
      captured: isCaptured, verdict: c.verdict, reason: c.reason,
      togetherDays: c.togetherDays, sharedTargetDays: c.sharedTargetDays,
      membersWithRows: c.membersWithRows, gaps: memberGaps, meetings: meetings });
  }
  // Launched meetings: every encounter joined to a launch (the same
  // join the expeditions above used, so the counts agree by
  // construction). Classifiable = fighter roster row on the meeting
  // day, or a determinable absence reason.
  let launchedMeetings = 0, classifiable = 0;
  for (const ex of exps) {
    for (const m of ex.meetings) {
      launchedMeetings++;
      if (m.classifiable) classifiable++;
    }
  }
  return { seed: seedJson.seed, launches: launches.length, captured: captured,
    gaps: allGaps, expeditions: exps,
    launchedMeetings: launchedMeetings, meetingsClassifiable: classifiable,
    rosterRows: roster.length,
    wall: { standing: seedJson.standing, scaleRank: seedJson.scaleRank,
      maxWave: seedJson.maxWave, won: !!seedJson.won,
      gameDays: seedJson.gameDays, deaths: deaths.length,
      endReason: seedJson.endReason } };
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  const out = [];
  for (const f of files) out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return out;
}

function main() {
  const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-18', 'perseed-expedroster-b');
  const outFile = process.argv[3] || path.join(REPO, 'evidence', '2026-11-18', 'expedroster-b-analysis.json');
  const seeds = loadDir(dir);
  const perSeed = seeds.map(analyzeSeed);
  let launches = 0, captured = 0, gaps = 0, meetings = 0, classifiable = 0, rows = 0;
  const verdictCounts = {};
  for (const s of perSeed) {
    launches += s.launches; captured += s.captured; gaps += s.gaps.length;
    meetings += s.launchedMeetings; classifiable += s.meetingsClassifiable; rows += s.rosterRows;
    for (const e of s.expeditions) verdictCounts[e.verdict] = (verdictCounts[e.verdict] || 0) + 1;
  }
  const captureRate = launches ? captured / launches : null;
  const joinRate = meetings ? classifiable / meetings : null;
  const go = launches >= POOL_FLOOR && captureRate != null && captureRate >= 0.95 && gaps === 0 && joinRate != null && joinRate >= 1;
  const out = { arm: 'expedroster-b', run: process.argv[4] || 'fleshout-loop-b-20261118T0430Z',
    corpus: { dir: path.basename(dir), seeds: perSeed.map(function (s) { return s.seed; }) },
    instrument: { launches: launches, captured: captured,
      captureRate: captureRate, gaps: gaps, launchedMeetings: meetings,
      meetingsClassifiable: classifiable, joinRate: joinRate,
      rosterRows: rows, poolFloor: POOL_FLOOR },
    verdictCounts: verdictCounts, verdict: go ? 'GO' : 'NO-GO',
    perSeed: perSeed };
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');
  console.log('=== sim-expedroster-b ===');
  console.log('launches: ' + launches + ' (pool floor ' + POOL_FLOOR + ') captured: ' + captured +
    ' captureRate: ' + (captureRate == null ? 'n/a' : captureRate.toFixed(3)) +
    ' gaps: ' + gaps + ' launchedMeetings: ' + meetings +
    ' classifiable: ' + classifiable + ' joinRate: ' + (joinRate == null ? 'n/a' : joinRate.toFixed(3)));
  console.log('verdicts: ' + JSON.stringify(verdictCounts));
  console.log('instrument verdict: ' + out.verdict);
  for (const s of perSeed) {
    for (const e of s.expeditions) {
      console.log('- s' + s.seed + ' d' + e.launchDay + ' ' + e.holder + '+' + (e.party || []).join('+') +
        ' -> ' + e.target + ' : ' + e.verdict + ' (' + e.reason + ')' +
        (e.meetings.length ? ' meetings:' + e.meetings.map(function (m) { return ' d' + m.day + ' ' + m.vid + ' vs ' + m.mid + ' ' + (m.tile ? ('node ' + (m.tile.node ? m.tile.node.nx + ',' + m.tile.node.ny : 'null')) : ('no-tile: ' + m.absenceReason)); }).join(';') : ''));
    }
  }
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!go) {
    console.error('ANALYZER NO-GO: ' + (launches < POOL_FLOOR ? 'pool floor missed (' + launches + ' < ' + POOL_FLOOR + ')' : '') +
      (captureRate != null && captureRate < 0.95 ? ' captureRate ' + captureRate.toFixed(3) + ' < 0.95' : '') +
      (gaps !== 0 ? ' gaps ' + gaps : '') +
      (joinRate != null && joinRate < 1 ? ' joinRate ' + joinRate.toFixed(3) + ' < 1' : ''));
    process.exitCode = 2;
  }
}

function selftest() {
  let n = 0, fails = 0;
  function check(name, cond, extra) {
    n++;
    if (cond) console.log('ok ' + n + ' - ' + name);
    else { fails++; console.log('FAIL ' + n + ' - ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // launchesForSeed: wave-3 filtered, same-day dupes merged (the
  // launch-filter trap fixture, same shape as the tracer's).
  const raw = { v4departs: [
    { result: 'launch', vid: 'a', day: 10, target: 'ad_break', targetWave: 3, party: ['b'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['d'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['e'], partySize: 4, source: 'winPlan' },
    { result: 'hold', vid: 'c', day: 11, target: 'audit', targetWave: 4, party: [], partySize: 1, source: 'brain' },
  ] };
  const ls = launchesForSeed(raw);
  check('launchesForSeed: wave-3 filtered, wave-4 kept, dupes merged', ls.length === 1 && ls[0].vid === 'c' && ls[0].partySize === 4 && ls[0].party.slice().sort().join(',') === 'd,e', ls);
  // classify: together-en-route (same node + same target, day 12).
  const launch = { vid: 'h', day: 10, target: 'audit', targetWave: 4, party: ['c1', 'c2'], partySize: 3 };
  const rowsTogether = [
    { day: 10, vid: 'h', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c2', tx: 7, ty: 7, legs: 0, node: { nx: 4, ny: 5 } },
    { day: 11, vid: 'h', tx: 7, ty: 7, legs: 1, node: { nx: 6, ny: 6 } },
    { day: 11, vid: 'c1', tx: 7, ty: 7, legs: 1, node: { nx: 6, ny: 6 } },
  ];
  const ct = classifyExpedition(launch, rowsTogether);
  check('classify: same node + same target -> together-en-route', ct.verdict === 'together-en-route' && ct.togetherDays.length === 2, ct);
  // classify: destination-only (same target, never same node).
  const rowsDest = [
    { day: 10, vid: 'h', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 7, ty: 7, legs: 0, node: { nx: 3, ny: 5 } },
    { day: 11, vid: 'h', tx: 7, ty: 7, legs: 1, node: { nx: 6, ny: 6 } },
    { day: 11, vid: 'c1', tx: 7, ty: 7, legs: 1, node: { nx: 4, ny: 6 } },
  ];
  const cd = classifyExpedition(launch, rowsDest);
  check('classify: same target, never same node -> destination-only', cd.verdict === 'destination-only', cd);
  // classify: same node but different target is NOT together (coincidence).
  const rowsCoinc = [
    { day: 10, vid: 'h', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 1, ty: 1, legs: 0, node: { nx: 5, ny: 5 } },
  ];
  const cc = classifyExpedition(launch, rowsCoinc);
  check('classify: same node, different target -> no-shared-target (not together)', cc.verdict === 'unknown-with-reason' && cc.reason === 'no-shared-target', cc);
  // classify: holder-only.
  const rowsHolder = [{ day: 10, vid: 'h', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } }];
  const ch = classifyExpedition(launch, rowsHolder);
  check('classify: only holder rows -> holder-only', ch.verdict === 'unknown-with-reason' && ch.reason === 'holder-only', ch);
  // classify: companion-only (holder never visible).
  const rowsCompOnly = [{ day: 10, vid: 'c1', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } }];
  const cco = classifyExpedition(launch, rowsCompOnly);
  check('classify: only companion rows -> companion-only', cco.verdict === 'unknown-with-reason' && cco.reason.indexOf('companion-only') === 0, cco);
  // classify: no rows at all.
  const cn = classifyExpedition(launch, []);
  check('classify: no rows -> no-roster-rows', cn.verdict === 'unknown-with-reason' && cn.reason === 'no-roster-rows', cn);
  // classify: spans never overlap on a common day.
  const rowsNoOverlap = [
    { day: 10, vid: 'h', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
    { day: 12, vid: 'c1', tx: 7, ty: 7, legs: 0, node: { nx: 5, ny: 5 } },
  ];
  const co = classifyExpedition(launch, rowsNoOverlap);
  check('classify: spans never share a day -> no-overlap', co.verdict === 'unknown-with-reason' && co.reason === 'no-overlap', co);
  // gapDays: contiguous spans have no gaps; a hole is reported.
  check('gapDays: contiguous span -> []', gapDays([{ day: 10 }, { day: 11 }, { day: 12 }]).length === 0);
  check('gapDays: hole d11 -> [11]', JSON.stringify(gapDays([{ day: 10 }, { day: 12 }])) === '[11]');
  // gapDays (corrected bar, re-judge 2026-11-18T0130Z): a home interval
  // between two sinceDay runs is NOT a gap; a hole inside one run is.
  check('gapDays: home interval d100-112 between sinceDay runs -> []',
    gapDays([{ day: 94, sinceDay: 98 }, { day: 95, sinceDay: 98 }, { day: 96, sinceDay: 98 },
      { day: 97, sinceDay: 98 }, { day: 98, sinceDay: 98 }, { day: 99, sinceDay: 98 },
      { day: 113, sinceDay: 113 }, { day: 114, sinceDay: 113 }]).length === 0);
  check('gapDays: hole d11 inside one sinceDay run -> [11]',
    JSON.stringify(gapDays([{ day: 10, sinceDay: 10 }, { day: 12, sinceDay: 10 }])) === '[11]');
  check('gapDays: two runs, hole only in second -> [21]',
    JSON.stringify(gapDays([{ day: 10, sinceDay: 10 }, { day: 11, sinceDay: 10 },
      { day: 20, sinceDay: 20 }, { day: 22, sinceDay: 20 }])) === '[21]');
  // meetingAbsenceReason: dead fighter named; ended expedition named.
  const sj = { deaths: [{ day: 20, who: 'h', cause: 'monster', kind: 'monster' }] };
  check('absence: fighter dead by meeting day', meetingAbsenceReason(sj, 'h', 21, []) === 'fighter-dead d20 (monster)');
  check('absence: last roster row before meeting', meetingAbsenceReason({ deaths: [] }, 'h', 21, [{ vid: 'h', day: 18 }]) === 'exped-ended (last roster row d18)');
  check('absence: no reason determinable -> null', meetingAbsenceReason({ deaths: [] }, 'h', 21, []) === null);
  console.log('analyze-expedroster-b --selftest: ' + n + ' checks, ' + fails + ' failures');
  process.exit(fails ? 1 : 0);
}

if (require.main === module) {
  if (process.argv[2] === '--selftest') selftest();
  else main();
}
module.exports = { classifyExpedition: classifyExpedition, gapDays: gapDays, meetingAbsenceReason: meetingAbsenceReason, analyzeSeed: analyzeSeed, launchesForSeed: launchesForSeed, joinLaunch: joinLaunch, WINDOW_DAYS: WINDOW_DAYS, POOL_FLOOR: POOL_FLOOR };
