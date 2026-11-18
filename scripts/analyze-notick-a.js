// analyze-notick-a.js — fate tracer for arm sim-notick-a (DIAG: what happens
// to a wave-4 plan AFTER a no-tick-after-commit selection?).
// Reads per-seed corpora (frozen profilegate-b ON leg and/or the fresh
// notick-a ON leg), runs the frozen classifier
// (scripts/analyze-profilegate-b.js funnelForSeed, which wraps
// analyze-launchdef-a.js classifySeed), and traces every
// `no-tick-after-commit` resolution forward in the same per-seed file:
// later score rows (re-bids), later depart rows (brain dawnbidDeparts +
// legacy v4departs), later skip rows, the instance close (closeDay /
// closeKind), holder death, and village end. Fate = the earliest
// post-commit event within 7 days, per the frozen prereg buckets
// (depart-next-day / depart-later / re-bid-next-day / re-bid-later /
// plan-deleted-after / holder-died-after / village-ended / stall /
// unknown). Also reports the secondary metric: every party_launch
// commit at part >= 2 and its same-day resolution (do late commits
// EVER execute?).
// This is a READ over the corpora: no re-classification, no sims.
// Usage:
//   node scripts/analyze-notick-a.js <corpusDir> [outJson]
// Writes the analysis JSON (default: evidence/2026-11-17/notick-a-analysis.json).
// Exits 0 iff every file parses and every no-tick selection got a fate
// (unknown counts as a fate — the GO bar on unknowns is judged by the
// proof test, not here).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));

const FATE_ORDER = ['depart-next-day', 'depart-later', 're-bid-next-day', 're-bid-later',
  'plan-deleted-after', 'holder-died-after', 'village-ended', 'stall', 'unknown'];

function loadDir(dir) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return { bySeed: bySeed, files: files };
}

function firstLaunchAfter(rows, vid, target, afterDay) {
  let best = null;
  for (const r of rows) {
    if (r.vid !== vid || r.target !== target) continue;
    if (r.day <= afterDay) continue;
    if (r.result !== 'launch') continue;
    if (!best || r.day < best.day) best = r;
  }
  return best;
}
function firstRebidAfter(scoreRows, vid, target, afterDay) {
  let best = null;
  for (const r of scoreRows) {
    if (r.vid !== vid || !r.plan || r.plan.target !== target) continue;
    if (r.day <= afterDay) continue;
    const act = r.commit ? (r.commit.winPlanAction || null) : null;
    if (act !== 'party_launch') continue;
    if (!best || r.day < best.day || (r.day === best.day && r.part < best.part)) best = r;
  }
  return best;
}
function holderDeathDay(j, vid, seedDay) {
  // CORRECTION (tracer fix, sim-notick-a): the deaths array is the
  // authoritative source. classifySeed's churn detection only sees
  // census holderAlive=false and daily-roster dead:true — but dead
  // villagers DROP OUT of the daily roster, so the backup never fires,
  // and census rows stop when the plan is deleted on death. Proven on
  // the frozen corpus: david_kim died d86 and gen_4hoo6rr died d147,
  // both closed `plan-deleted` by the classifier, both in deaths.
  let died = null;
  for (const e of (j.deaths || [])) {
    if (e && e.kind === 'villager' && e.who === vid && (e.day | 0) >= seedDay) {
      if (died == null || (e.day | 0) < died) died = e.day | 0;
    }
  }
  if (died != null) return died;
  for (const c of (j.dawnbidCensus || [])) {
    if (c.vid !== vid) continue;
    if (c.holderAlive === false) { died = c.day; break; }
  }
  if (died == null) {
    for (const snap of (j.daily || [])) {
      if (!snap.roster) continue;
      const row = snap.roster.find(function (x) { return x && x.vid === vid; });
      if (row && row.dead) { died = snap.day; break; }
    }
  }
  if (died != null && died < seedDay) return null;
  return died;
}
function holderDeathCause(j, vid, day) {
  for (const e of (j.deaths || [])) {
    if (e && e.kind === 'villager' && e.who === vid && (e.day | 0) === day) return e.cause || null;
  }
  return null;
}

function traceOne(j, inst, res) {
  const D = res.day;
  const vid = inst.vid;
  const target = inst.target;
  const scoreRows = j.dawnbidScores || [];
  const brainDeparts = j.dawnbidDeparts || [];
  const legacyDeparts = j.v4departs || [];
  const skipRows = j.launchdefSkips || [];

  const sel = (inst.selections || []).find(function (s) { return s.day === D; });
  const companion = sel ? (sel.companion || null) : null;

  // First re-bid (party_launch commit) after D, and first score row of any kind.
  const rebid = firstRebidAfter(scoreRows, vid, target, D);
  let firstScoreAfter = null;
  for (const r of scoreRows) {
    if (r.vid !== vid || !r.plan || r.plan.target !== target) continue;
    if (r.day <= D) continue;
    if (!firstScoreAfter || r.day < firstScoreAfter.day || (r.day === firstScoreAfter.day && r.part < firstScoreAfter.part)) firstScoreAfter = r;
  }
  // First launch after D: brain departs first, legacy v4departs as a net.
  const brainLaunch = firstLaunchAfter(brainDeparts, vid, target, D);
  const legacyLaunch = firstLaunchAfter(legacyDeparts, vid, target, D);
  let launch = null, launchSrc = null;
  if (brainLaunch && (!legacyLaunch || brainLaunch.day <= legacyLaunch.day)) { launch = brainLaunch; launchSrc = 'brain'; }
  else if (legacyLaunch) { launch = legacyLaunch; launchSrc = 'legacy'; }
  // First skip row after D (context, not a fate event).
  let firstSkipAfter = null;
  for (const r of skipRows) {
    if (r.vid !== vid || r.target !== target) continue;
    if (r.day <= D) continue;
    if (!firstSkipAfter || r.day < firstSkipAfter.day) firstSkipAfter = r;
  }
  const closeDay = (inst.closeDay != null ? inst.closeDay : null);
  const closeKind = inst.closeKind || null;
  const deathDay = holderDeathDay(j, vid, inst.seedDay);
  const endDay = j.gameDays || j.days || 0;

  // Candidate events within (D, D+7]. Earliest day wins; ties resolve
  // depart > re-bid > death > close > village-end (a depart on the
  // re-bid day executes that re-bid; a death on the close day causes
  // the close — the death cleanup deletes the plan the same day).
  const cands = [];
  if (launch && launch.day <= D + 7) cands.push({ kind: 'depart', day: launch.day, prio: 0 });
  if (rebid && rebid.day <= D + 7) cands.push({ kind: 'rebid', day: rebid.day, prio: 1 });
  if (deathDay != null && deathDay > D && deathDay <= D + 7) cands.push({ kind: 'death', day: deathDay, prio: 2 });
  if (closeDay != null && (closeKind === 'plan-deleted' || closeKind === 'retargeted' || closeKind === 'holder-died') &&
      closeDay > D && closeDay <= D + 7) cands.push({ kind: 'close', day: closeDay, prio: 3 });
  if (endDay > D && endDay <= D + 7) cands.push({ kind: 'end', day: endDay, prio: 4 });
  cands.sort(function (a, b) { return (a.day - b.day) || (a.prio - b.prio); });

  let fate = null, fateDay = null, fateNote = null;
  if (cands.length) {
    const c = cands[0];
    fateDay = c.day;
    if (c.kind === 'depart') {
      fate = (c.day === D + 1) ? 'depart-next-day' : 'depart-later';
      // Companion-started qualifier: a launch row with vidExped but
      // companionExped false is a HOLDER-ONLY departure (the companion
      // never started) — the plan advanced to hunt short-handed.
      // Legacy v4departs rows carry no exped flags, so a legacy-only
      // launch reports companionStarted null (unknown).
      const compStarted = (launchSrc === 'brain')
        ? !!(launch.vidExped && launch.companionExped) : null;
      const compQual = compStarted === true ? ' (full party)'
        : compStarted === false ? ' (HOLDER-ONLY, companion ' + (launch.companionBlock || 'not-started') + ')'
        : ' (legacy launch, companion state unknown)';
      fateNote = 'launch ' + launchSrc + ' day ' + launch.day + compQual +
        (launch.commitKind ? ' commitKind=' + launch.commitKind : '') +
        (launch.commitPart != null ? ' commitPart=' + launch.commitPart : '');
    } else if (c.kind === 'rebid') {
      fate = (c.day === D + 1) ? 're-bid-next-day' : 're-bid-later';
      fateNote = 're-bid day ' + rebid.day + ' part ' + rebid.part +
        ' companion=' + ((rebid.commit && rebid.commit.companion) || 'none');
    } else if (c.kind === 'death') {
      fate = 'holder-died-after';
      fateNote = 'holder died day ' + deathDay +
        ' cause=' + (holderDeathCause(j, vid, deathDay) || 'unknown');
    } else if (c.kind === 'close') {
      fate = (closeKind === 'holder-died') ? 'holder-died-after' : 'plan-deleted-after';
      fateNote = 'close ' + closeKind + ' day ' + closeDay;
    } else {
      fate = 'village-ended';
      fateNote = 'village ended day ' + endDay + ' (' + (j.endReason || 'unknown') + ')';
    }
  } else {
    // No event within 7 days: stall if the plan is still scored, else unknown.
    const scoredWithin7 = firstScoreAfter && firstScoreAfter.day <= D + 7;
    if (scoredWithin7) {
      fate = 'stall';
      fateDay = firstScoreAfter.day;
      fateNote = 'plan still scored day ' + firstScoreAfter.day + ' part ' + firstScoreAfter.part +
        ' but no party_launch commit within 7 days';
    } else {
      fate = 'unknown';
      fateDay = null;
      fateNote = 'no post-D event, no later score row, closeDay=' + closeDay + ' closeKind=' + closeKind;
    }
  }

  // The re-bid's own resolution (if the re-bid day was itself resolved).
  let rebidResolution = null;
  if (rebid) {
    const rr = (inst.resolved || []).find(function (x) { return x.day === rebid.day; });
    if (rr) rebidResolution = rr.outcome + ':' + rr.reason;
  }
  // Eventual instance outcome (for the evidence table, not the fate).
  const eventual = (inst.funnelBucket || inst.bucket) + ':' + (inst.funnelSub || inst.sub);
  return {
    seed: j.seed, vid: vid, target: target, holderProfile: null,
    noTickDay: D, noTickPart: (sel && sel.parts ? Math.max.apply(null, sel.parts) : null),
    commitKind: res.commitKind || null, companion: companion,
    fate: fate, fateDay: fateDay, fateNote: fateNote,
    rebidDay: rebid ? rebid.day : null, rebidPart: rebid ? rebid.part : null,
    rebidCompanion: rebid ? ((rebid.commit && rebid.commit.companion) || null) : null,
    rebidResolution: rebidResolution,
    launchDay: launch ? launch.day : null, launchSource: launchSrc,
    companionStarted: launch ? (launchSrc === 'brain' ? !!(launch.vidExped && launch.companionExped) : null) : null,
    companionBlock: launch ? (launch.companionBlock || null) : null,
    firstScoreAfterDay: firstScoreAfter ? firstScoreAfter.day : null,
    firstSkipAfter: firstSkipAfter ? { day: firstSkipAfter.day, reason: firstSkipAfter.reason } : null,
    closeDay: closeDay, closeKind: closeKind, holderDeathDay: deathDay,
    holderDeathCause: deathDay != null ? holderDeathCause(j, vid, deathDay) : null,
    villageEndDay: endDay, villageEndReason: j.endReason || null,
    eventualInstance: eventual, targetKilledDay: inst.targetKilledDay || null,
  };
}

// Secondary metric: every party_launch commit at part >= 2 and its
// same-day resolution (do late commits EVER execute?).
function lateCommits(j, classified) {
  const out = [];
  for (const inst of (classified.instances || [])) {
    for (const sel of (inst.selections || [])) {
      const parts = sel.parts || [];
      const lastPart = parts.length ? Math.max.apply(null, parts) : null;
      if (lastPart == null || lastPart < 2) continue;
      const res = (inst.resolved || []).find(function (x) { return x.day === sel.day; });
      out.push({ seed: j.seed, vid: inst.vid, target: inst.target, day: sel.day,
        parts: parts.slice(), lastPart: lastPart, companion: sel.companion || null,
        commitKind: sel.commitKind || null,
        resolution: res ? (res.outcome + ':' + res.reason) : 'unresolved',
        resolvedPart: res ? (res.part != null ? res.part : null) : null });
    }
  }
  return out;
}

function analyzeDir(dir) {
  const raw = loadDir(dir);
  const bySeed = {};
  const traces = [];
  const late = [];
  let files = 0, instrumentErrors = 0;
  for (const seed of Object.keys(raw.bySeed).sort()) {
    const j = raw.bySeed[seed];
    files++;
    instrumentErrors += (j.instrumentErrors || []).length;
    const c = ANALYZE.funnelForSeed(j);
    bySeed[seed] = c;
    for (const inst of (c.instances || [])) {
      for (const res of (inst.resolved || [])) {
        if (res.outcome === 'blocked' && res.reason === 'no-tick-after-commit') {
          traces.push(traceOne(j, inst, res));
        }
      }
    }
    late.push.apply(late, lateCommits(j, c));
  }
  const fateTally = {};
  for (const f of FATE_ORDER) fateTally[f] = 0;
  for (const t of traces) fateTally[t.fate] = (fateTally[t.fate] || 0) + 1;
  const lateTally = {};
  for (const l of late) {
    const k = l.resolution.split(':')[0] + ':' + (l.resolution.indexOf('no-tick') !== -1 ? 'no-tick-after-commit' : l.resolution.slice(l.resolution.indexOf(':') + 1));
    lateTally[k] = (lateTally[k] || 0) + 1;
  }
  const lateLaunched = late.filter(function (l) { return l.resolution.indexOf('launched') === 0; }).length;
  return {
    dir: path.basename(dir), files: files, seeds: Object.keys(bySeed).length,
    instrumentErrors: instrumentErrors,
    noTickSelections: traces.length,
    fateTally: fateTally,
    unknown: fateTally.unknown || 0,
    traces: traces,
    lateCommits: late,
    lateCommitCount: late.length,
    lateCommitLaunched: lateLaunched,
    lateTally: lateTally,
  };
}

function main() {
  const dir = process.argv[2];
  const outFile = process.argv[3] || path.join(REPO, 'evidence', '2026-11-17', 'notick-a-analysis.json');
  if (!dir) { console.error('NOTICK ANALYZE STOP: corpusDir required.'); process.exit(2); }
  const a = analyzeDir(dir);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(a, null, 2) + '\n');
  console.log('=== sim-notick-a fate trace: ' + a.dir + ' ===');
  console.log('files: ' + a.files + '  seeds: ' + a.seeds + '  instrumentErrors: ' + a.instrumentErrors);
  console.log('no-tick selections: ' + a.noTickSelections + '  unknown: ' + a.unknown);
  console.log('fate tally: ' + JSON.stringify(a.fateTally));
  for (const t of a.traces) {
    console.log('  seed ' + t.seed + ' ' + t.vid + ' -> ' + t.target + ' d' + t.noTickDay +
      ' part-' + t.noTickPart + ' companion=' + (t.companion || 'none') + ' => ' + t.fate +
      ' (day ' + t.fateDay + ') — ' + t.fateNote + ' | eventual ' + t.eventualInstance);
  }
  console.log('late commits (part>=2 party_launch): ' + a.lateCommitCount +
    '  launched same-day: ' + a.lateCommitLaunched);
  console.log('late tally: ' + JSON.stringify(a.lateTally));
  console.log('analysis: ' + path.relative(REPO, outFile));
}

if (require.main === module) main();
module.exports = { analyzeDir: analyzeDir, traceOne: traceOne, FATE_ORDER: FATE_ORDER };
