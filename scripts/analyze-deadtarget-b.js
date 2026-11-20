// analyze-deadtarget-b.js — analyzer + judge, arm sim-deadtarget-diag-b.
// The departure-gate diagnostic (finding #2617): for every wave-4+
// launch on the designated band, classify the launch by the last
// FOUGHT encounter of its target type BEFORE the launch day —
// dead (last fight was a kill), live (last fight was not a kill),
// unknown (no fought encounter on record) — and cross-check the
// driver's at-departure gate snapshot against the recomputation.
// INSTRUMENT ONLY — no game code changes.
// Reads ONE per-seed corpus dir (the deadtarget driver recorder
// shape) and judges the frozen prereg bars.
// Usage:
//   node scripts/analyze-deadtarget-b.js --dir evidence/2026-11-19/perseed-deadtarget-diag-b [--out evidence/2026-11-19/deadtarget-diag-b-analysis.json]
//   node scripts/analyze-deadtarget-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));

// FROZEN BARS (prereg evidence/2026-11-19/sim-deadtarget-diag-b-prereg.md).
const BARS = {
  poolLaunches: 4,      // launches on the band (floor; fewer = METRIC-BROKEN)
  classifiedShare: 1.0, // every launch in exactly one class by construction
};
const WINDOW_DAYS = 21; // dmgshape first-fight-after window, for context only

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function isFought(e) { return ((e.rounds | 0) > 0 || (e.mDealt | 0) > 0); }

// Launches: v4departs rows with result 'launch', targetWave >= 4,
// target non-null — the survey's counting, all party sizes.
// Dedupe by (vid, day, target), keeping the first row: the driver
// wraps both winPlanDepart and vbrainExecuteDepart, and the
// dmgshape-rerun prereg verified 0 duplicates on the
// partysurvive-rerun corpus — but if the two wraps ever double-fire
// for one departure, the dedupe is the rule and the count is reported.
function launchesOf(d) {
  const out = [];
  const seen = {};
  let duplicates = 0;
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4 || !r.target) continue;
    const key = [r.vid, r.day, r.target].join('|');
    if (seen[key]) { duplicates++; continue; }
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, target: r.target,
      targetWave: r.targetWave, party: [r.vid].concat(r.party || []),
      partySize: r.partySize != null ? r.partySize : ((r.party || []).length + 1),
      source: r.source || null, gate: r.gate || null });
  }
  return { launches: out, duplicates: duplicates };
}

// Latest FOUGHT encounter of the target type strictly before the
// launch day (the dawn-gate rule: a departure call runs at dawn,
// before the day's fights). An evade (rounds 0, mDealt 0) is a
// sighting, not a fight — it never counts here. Returns null when
// no such row exists.
function lastFoughtBefore(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day >= launch.day) continue;
    if (!isFought(e)) continue;
    if (!best || e.day > best.day) best = e;
  }
  return best;
}

// Latest encounter of the target type strictly before the launch
// day, fought or evaded (the monster was seen alive). Returns null
// when no such row exists.
function lastSightedBefore(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day >= launch.day) continue;
    if (!best || e.day > best.day) best = e;
  }
  return best;
}

// First fight against the launch target AFTER the launch (dmgshape
// 21-day window, any origin, any fighter) — context only, never the
// verdict. Earliest day wins; file order breaks a same-day tie.
function firstFightAfter(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day < launch.day || e.day > launch.day + WINDOW_DAYS) continue;
    if (!isFought(e)) continue;
    if (!best || e.day < best.day) best = e;
  }
  return best;
}

// Did anyone fight the target type again after the launch day
// (rest of the run)? The #2617 "nobody fought again" shape.
function refoughtAfter(d, launch) {
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day <= launch.day) continue;
    if (isFought(e)) return true;
  }
  return false;
}

// Frozen classification, by the last pre-launch FOUGHT encounter.
function classify(lastFought) {
  if (!lastFought) return 'unknown';
  return lastFought.outcome === 'vKill' ? 'dead' : 'live';
}

// One per-seed file: every launch -> its class + gate cross-check.
function analyzeFile(d) {
  const got = launchesOf(d);
  const launches = got.launches;
  const rows = [];
  let gateMissing = 0, gateMismatch = 0;
  for (const launch of launches) {
    const lastFought = lastFoughtBefore(d, launch);
    const lastSeen = lastSightedBefore(d, launch);
    const firstAfter = firstFightAfter(d, launch);
    const cls = classify(lastFought);
    const gate = launch.gate || null;
    let gateOk = null; // null = no gate snapshot to check
    if (!gate) { gateMissing++; gateOk = false; }
    else {
      // The driver's snapshot and the analyzer's recomputation must
      // agree on the last pre-launch fight (day + kill). A mismatch
      // is an instrument failure, never silently resolved.
      const snapDay = (gate.lastFightDay != null ? gate.lastFightDay : null);
      const recomDay = (lastFought ? lastFought.day : null);
      const snapKill = (gate.lastFightKill != null ? !!gate.lastFightKill : null);
      const recomKill = (lastFought ? !!lastFought.vKill : null);
      gateOk = (snapDay === recomDay && snapKill === recomKill);
      if (!gateOk) gateMismatch++;
    }
    rows.push({ seed: d.seed, launch: launch, cls: cls,
      lastFought: lastFought ? { day: lastFought.day, vid: lastFought.vid,
        outcome: lastFought.outcome, vKill: !!lastFought.vKill,
        origin: lastFought.origin || null } : null,
      lastSighted: lastSeen ? { day: lastSeen.day, outcome: lastSeen.outcome || null } : null,
      daysSinceLastFight: lastFought ? (launch.day - lastFought.day) : null,
      daysSinceLastSighting: lastSeen ? (launch.day - lastSeen.day) : null,
      firstFightAfter: firstAfter ? { day: firstAfter.day, vid: firstAfter.vid,
        outcome: firstAfter.outcome, origin: firstAfter.origin || null,
        sameDay: firstAfter.day === launch.day } : null,
      refoughtAfter: refoughtAfter(d, launch),
      gateOk: gateOk,
      stageBefore: gate ? (gate.stageBefore || null) : null,
      villageSlain: gate ? (gate.villageSlain != null ? gate.villageSlain : null) : null });
  }
  return { seed: d.seed, launches: launches.length, duplicates: got.duplicates,
    gateMissing: gateMissing, gateMismatch: gateMismatch, rows: rows };
}

// Aggregate one corpus dir.
function analyzeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let rows = [];
  let errors = 0, filesRead = 0, duplicates = 0, gateMissing = 0, gateMismatch = 0;
  const seeds = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    seeds.push(d.seed);
    errors += ((d.instrumentErrors || []).length);
    const a = analyzeFile(d);
    duplicates += a.duplicates;
    gateMissing += a.gateMissing;
    gateMismatch += a.gateMismatch;
    rows = rows.concat(a.rows);
    perSeed.push({ seed: d.seed, launches: a.launches,
      dead: a.rows.filter(function (r) { return r.cls === 'dead'; }).length,
      live: a.rows.filter(function (r) { return r.cls === 'live'; }).length,
      unknown: a.rows.filter(function (r) { return r.cls === 'unknown'; }).length,
      duplicates: a.duplicates, gateMissing: a.gateMissing, gateMismatch: a.gateMismatch });
  }
  const dead = rows.filter(function (r) { return r.cls === 'dead'; });
  const live = rows.filter(function (r) { return r.cls === 'live'; });
  const unknown = rows.filter(function (r) { return r.cls === 'unknown'; });
  const stageBefore = {};
  for (const r of rows) stageBefore[r.stageBefore || 'null'] = (stageBefore[r.stageBefore || 'null'] || 0) + 1;
  const deadStanding = dead.filter(function (r) { return r.stageBefore === 'standing'; }).length;
  const deadSlainKnown = dead.filter(function (r) { return (r.villageSlain || 0) > 0; }).length;
  const deadNeverRefought = dead.filter(function (r) { return !r.refoughtAfter; }).length;
  const withFirstAfter = rows.filter(function (r) { return !!r.firstFightAfter; }).length;
  const sameDayFirstAfter = rows.filter(function (r) { return r.firstFightAfter && r.firstFightAfter.sameDay; }).length;
  const daysSince = rows.filter(function (r) { return r.daysSinceLastFight != null; }).map(function (r) { return r.daysSinceLastFight; });
  return { dir: dir, files: filesRead, seeds: seeds, errors: errors,
    duplicates: duplicates, gateMissing: gateMissing, gateMismatch: gateMismatch,
    launches: rows.length, perSeed: perSeed, rows: rows,
    dead: dead.length, live: live.length, unknown: unknown.length,
    classified: rows.length, // by construction: exactly one class each
    classifiedShare: rows.length ? 1.0 : null,
    deadShare: rows.length ? dead.length / rows.length : null,
    stageBefore: stageBefore, deadStanding: deadStanding,
    deadSlainKnown: deadSlainKnown, deadNeverRefought: deadNeverRefought,
    withFirstAfter: withFirstAfter, sameDayFirstAfter: sameDayFirstAfter,
    medianDaysSinceLastFight: median(daysSince) };
}

function judge(a, leg) {
  const bars = [];
  bars.push({ id: 'pool-launches', pass: a.launches >= BARS.poolLaunches,
    detail: 'launches ' + a.launches + ' (floor ' + BARS.poolLaunches + '); dead ' + a.dead + ', live ' + a.live + ', unknown ' + a.unknown });
  bars.push({ id: 'classification', pass: a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare,
    detail: 'classified ' + a.classified + '/' + a.launches + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar 1.000); dead share ' + (a.deadShare == null ? 'n/a' : a.deadShare.toFixed(3)) });
  bars.push({ id: 'gate-snapshot', pass: a.gateMissing === 0 && a.gateMismatch === 0,
    detail: 'gate snapshots missing ' + a.gateMissing + ', mismatched vs recomputation ' + a.gateMismatch + ' (bar 0 / 0); duplicate depart rows ' + a.duplicates + ' (expect 0)' });
  bars.push({ id: 'instrument', pass: a.errors === 0 && a.files === 8,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/8' });
  let verdict = 'DIAG-GO', kind = null;
  if (a.launches < BARS.poolLaunches) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (a.errors || a.files !== 8) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.gateMissing || a.gateMismatch) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.classifiedShare == null || a.classifiedShare < BARS.classifiedShare) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  return { verdict: verdict, kind: kind, bars: bars, leg: leg,
    wall: leg ? leg.wall : null };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A CLASSIFICATION (synthetic per-seed doc).
  function mkEnc(day, vid, mid, origin, outcome, rounds, mDealt, vKill) {
    return { day: day, vid: vid, mid: mid, wave: 4, origin: origin, outcome: outcome,
      rounds: rounds, mDealt: mDealt, mHpStart: 1000, vKill: !!vKill, log: [], roundsDetail: [] };
  }
  function mkGate(stageBefore, lastFightDay, lastFightKill, villageSlain) {
    return { stageBefore: stageBefore, targetBefore: null, node: null, sinceDay: 1,
      villageSlain: villageSlain, lastFightDay: lastFightDay, lastFightKill: lastFightKill,
      lastFightOutcome: lastFightKill ? 'vKill' : 'vFlee',
      daysSinceLastFight: lastFightDay != null ? 99 : null,
      lastSightingDay: lastFightDay, daysSinceLastSighting: lastFightDay != null ? 99 : null };
  }
  function mkLaunch(day, vid, target, wave, gate) {
    return { day: day, vid: vid, result: 'launch', target: target, targetWave: wave || 4,
      party: ['c1'], partySize: 2, source: 'brain', gate: gate || null };
  }
  const d = {
    seed: 999001,
    instrumentErrors: [],
    v4departs: [
      mkLaunch(20, 'h1', 'herald', 4, mkGate('standing', 19, false, 1)),   // live: last fight d19 flee (after the d18 kill)
      mkLaunch(30, 'h2', 'eater', 4, mkGate('party', 25, false, 0)),      // live: last fight d25 flee
      mkLaunch(40, 'h3', 'audit', 4, mkGate('hunt', null, null, 0)),      // unknown: no prior fight
      mkLaunch(50, 'h4', 'herald', 4, mkGate('standing', 45, true, 2)),   // dead again (same type, 2nd holder)
      mkLaunch(60, 'h5', 'reunion', 4, mkGate('hunt', 55, false, 0)),    // live: kill d50, refight d55 flee -> live
      mkLaunch(70, 'h6', 'eulogy', 4, mkGate('party', 65, true, 1)),      // dead by kill d65; evade d68 is sighting only
      mkLaunch(80, 'h7', 'editor', 5, mkGate('table', null, null, 0)),    // unknown; same-day fight d80 must NOT count as before
    ],
    v4encounters: [
      mkEnc(18, 'x1', 'herald', 'world-tick', 'vKill', 6, 400, true),
      mkEnc(19, 'x2', 'herald', 'aid', 'vFlee', 2, 30, false),   // AFTER the d18 kill: h1's last fight is d19 flee -> LIVE, not dead
      mkEnc(25, 'h2', 'eater', 'world-tick', 'vFlee', 3, 90, false),
      mkEnc(45, 'x3', 'herald', 'world-tick', 'vKill', 5, 300, true),
      mkEnc(50, 'x4', 'reunion', 'expedition', 'vKill', 4, 200, true),
      mkEnc(55, 'h5', 'reunion', 'world-tick', 'vFlee', 2, 40, false),
      mkEnc(65, 'x5', 'eulogy', 'world-tick', 'vKill', 6, 350, true),
      mkEnc(68, 'x6', 'eulogy', 'aid', 'vFlee', 0, 0, false),   // no-contact evade: sighting, not a fight
      mkEnc(80, 'h7', 'editor', 'world-tick', 'vFlee', 3, 90, false), // same-day as h7's launch: NOT "before"
      mkEnc(85, 'h7', 'editor', 'world-tick', 'vFlee', 2, 50, false), // after launch: first-fight-after + refought
    ],
  };
  const a = analyzeFile(d);
  check('§A seven launches counted', a.launches === 7, a.launches);
  const byVid = {};
  for (const r of a.rows) byVid[r.launch.vid] = r;
  check('§A h1: last fight d19 flee (AFTER the d18 kill) -> live, not dead',
    byVid.h1.cls === 'live' && byVid.h1.lastFought.day === 19 && byVid.h1.lastFought.outcome === 'vFlee',
    byVid.h1);
  check('§A h2: last fight d25 flee -> live',
    byVid.h2.cls === 'live' && byVid.h2.daysSinceLastFight === 5, byVid.h2);
  check('§A h3: no prior audit fight -> unknown',
    byVid.h3.cls === 'unknown' && byVid.h3.lastFought === null, byVid.h3);
  check('§A h4: last fight d45 kill -> dead, stageBefore standing, villageSlain 2',
    byVid.h4.cls === 'dead' && byVid.h4.stageBefore === 'standing' && byVid.h4.villageSlain === 2,
    byVid.h4);
  check('§A h5: kill d50 then refight d55 flee -> live (latest fight wins)',
    byVid.h5.cls === 'live' && byVid.h5.lastFought.day === 55, byVid.h5);
  check('§A h6: kill d65 is the last FIGHT; d68 evade is a sighting only -> dead, lastSighted d68',
    byVid.h6.cls === 'dead' && byVid.h6.lastFought.day === 65 && byVid.h6.lastSighted.day === 68 &&
    byVid.h6.daysSinceLastFight === 5 && byVid.h6.daysSinceLastSighting === 2,
    byVid.h6);
  check('§A h7: same-day d80 fight does NOT count as before -> unknown; first-fight-after d80 same-day flagged',
    byVid.h7.cls === 'unknown' && !!byVid.h7.firstFightAfter && byVid.h7.firstFightAfter.day === 80 &&
    byVid.h7.firstFightAfter.sameDay === true && byVid.h7.refoughtAfter === true,
    byVid.h7);
  check('§A gate cross-check passes on all seven rows (snapshot == recomputation)',
    a.gateMissing === 0 && a.gateMismatch === 0 && a.rows.every(function (r) { return r.gateOk === true; }),
    { missing: a.gateMissing, mismatch: a.gateMismatch });
  check('§A dead never-refought: h4 has no herald fight after d50',
    byVid.h4.refoughtAfter === false, byVid.h4.refoughtAfter);
  // §B DEDUPE: the two recorder wraps fire once each for one departure.
  const dd = { seed: 999002, instrumentErrors: [],
    v4departs: [
      { day: 15, vid: 'h1', result: 'launch', target: 'herald', targetWave: 4, party: ['c1'], partySize: 2, source: 'winPlanDepart', gate: mkGate('party', null, null, 0) },
      { day: 15, vid: 'h1', result: 'launch', target: 'herald', targetWave: 4, party: ['c1'], partySize: 2, source: 'brain', gate: mkGate('party', null, null, 0) },
      { day: 16, vid: 'h1', result: 'launch', target: 'herald', targetWave: 4, party: ['c1'], partySize: 2, source: 'brain', gate: mkGate('hunt', null, null, 0) },
    ],
    v4encounters: [] };
  const b = analyzeFile(dd);
  check('§B duplicate depart rows collapse to one launch (duplicates 1, launches 2)',
    b.launches === 2 && b.duplicates === 1, { launches: b.launches, duplicates: b.duplicates });
  check('§B the surviving row keeps the first source (winPlanDepart)',
    b.rows[0].launch.source === 'winPlanDepart', b.rows[0].launch.source);
  // §C GATE MISSING / MISMATCH: a launch without a gate snapshot, and a stale one.
  const dc = { seed: 999003, instrumentErrors: [],
    v4departs: [
      { day: 10, vid: 'h1', result: 'launch', target: 'eater', targetWave: 4, party: [], partySize: 1, source: 'brain' },
      mkLaunch(20, 'h2', 'herald', 4, mkGate('standing', 10, true, 1)),
    ],
    v4encounters: [mkEnc(18, 'x1', 'herald', 'world-tick', 'vFlee', 3, 90, false)] };
  const c = analyzeFile(dc);
  check('§C gate missing counted (1), mismatch counted (1: snapshot says kill d10, recomputation says flee d18)',
    c.gateMissing === 1 && c.gateMismatch === 1, { missing: c.gateMissing, mismatch: c.gateMismatch });
  check('§C the mismatched row still classifies by the recomputation (live)',
    c.rows[1].cls === 'live' && c.rows[1].gateOk === false, c.rows[1]);
  // §D JUDGE fixtures.
  function mkA(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 4, live: 3, unknown: 1, classified: 8, classifiedShare: 1.0, deadShare: 0.5,
      stageBefore: { standing: 4, party: 2, hunt: 2 }, deadStanding: 4, deadSlainKnown: 4,
      deadNeverRefought: 3, withFirstAfter: 5, sameDayFirstAfter: 1, medianDaysSinceLastFight: 6 }, o);
  }
  let j = judge(mkA({}), null);
  check('§D judge DIAG-GO shape passes', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkA({ launches: 3, dead: 1, live: 1, unknown: 1, classified: 3, deadShare: 1 / 3 }), null);
  check('§D judge METRIC-BROKEN below the launch floor (3 < 4)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkA({ errors: 1 }), null);
  check('§D judge INSTRUMENT on instrument errors', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ files: 7 }), null);
  check('§D judge INSTRUMENT on files != 8', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ gateMismatch: 1 }), null);
  check('§D judge INSTRUMENT on gate mismatch', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT' && !j.bars[2].pass, JSON.stringify(j));
  j = judge(mkA({ gateMissing: 2 }), null);
  check('§D judge INSTRUMENT on missing gate snapshots', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  console.log('analyze-deadtarget-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-deadtarget-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  const leg = FCB.summarizeLeg(dir);
  const j = judge(a, leg);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, analysis: a,
    wall: leg.wall, medianDays: leg.medianDays, launches: leg.launches, errors: leg.errors };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    launches: a.launches, dead: a.dead, live: a.live, unknown: a.unknown,
    deadShare: a.deadShare, classifiedShare: a.classifiedShare,
    duplicates: a.duplicates, gateMissing: a.gateMissing, gateMismatch: a.gateMismatch,
    stageBefore: a.stageBefore, deadStanding: a.deadStanding,
    deadSlainKnown: a.deadSlainKnown, deadNeverRefought: a.deadNeverRefought,
    withFirstAfter: a.withFirstAfter, sameDayFirstAfter: a.sameDayFirstAfter,
    medianDaysSinceLastFight: a.medianDaysSinceLastFight,
    perSeed: a.perSeed, wall: leg.wall, medianDays: leg.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { launchesOf: launchesOf, lastFoughtBefore: lastFoughtBefore,
  lastSightedBefore: lastSightedBefore, firstFightAfter: firstFightAfter,
  refoughtAfter: refoughtAfter, classify: classify, analyzeFile: analyzeFile,
  analyzeDir: analyzeDir, judge: judge, BARS: BARS, WINDOW_DAYS: WINDOW_DAYS,
  selftest: selftest };
