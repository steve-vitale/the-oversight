// analyze-part2night-a.js — analyzer for arm sim-part2night-a (DIAG).
// The unit is the COMMIT, not the plan instance: every part-2
// party_launch commit on the band is classified (frozen precedence:
// executed-launched, executed-held, died-at-night-veto,
// died-at-night-other, overwritten-before-night,
// plan-churned-before-night, holder-died-before-night, run-ended,
// UNCLASSIFIED), and every died-at-night-veto commit gets a
// hold-to-next-dawn counterfactual from its dawn follow-up snapshot.
// Wave-4+ subset reported alongside for launchdef comparability.
// Usage:
//   node scripts/analyze-part2night-a.js [--dir evidence/2026-11-17/perseed-part2night-a]
//     [--out evidence/2026-11-17/part2night-a-analysis.json]
//     [--seeds 103411,103412,...,103418]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
// --dir/--out accept absolute paths (path.join would silently nest an
// absolute path under REPO); relative paths resolve under REPO as before.
function resolveRepo(p) { return path.isAbsolute(p) ? p : path.join(REPO, p); }
const DIR = resolveRepo(argvVal('--dir', 'evidence/2026-11-17/perseed-part2night-a'));
const OUT = resolveRepo(argvVal('--out', 'evidence/2026-11-17/part2night-a-analysis.json'));
const SEEDS = (argvVal('--seeds', null) || '103411,103412,103413,103414,103415,103416,103417,103418')
  .split(',').map(function (s) { return parseInt(s.trim(), 10); });

const KNOWN_SKIP = ['holder-dead', 'engaged', 'away-as-companion', 'away-on-expedition',
  'profile-gate-veto', 'not-at-haven', 'night', 'indoor-objective', 'danger-gate',
  'execute-returned-normal', 'away-as-companion-this-tick', 'other'];
const CLASSES = ['executed-launched', 'executed-held', 'died-at-night-veto',
  'died-at-night-other', 'overwritten-before-night', 'plan-churned-before-night',
  'holder-died-before-night', 'run-ended', 'UNCLASSIFIED'];

function loadWaveMap() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    const m = {};
    for (const x of list) if (x && x.id) m[x.id] = (x.wave | 0);
    return m;
  } catch (e) { return {}; }
}
const WAVE_MAP = loadWaveMap();

// part2Commits(j): enumerate part-2 party_launch commits from the
// score rows. The standing commit per (vid, day) is the LAST part-2
// score row's commit; a part-2 commit exists iff that commit is a
// party_launch. Later part-2 party_launch rows for the same vid/day
// are the same commit (counted once); a superseded bid (last part-2
// commit is another action, or no commit) is counted separately.
function part2Commits(j) {
  const byKey = {};
  const order = [];
  for (const r of (j.dawnbidScores || [])) {
    if ((r.part | 0) !== 2) continue;
    if (!r.vid || r.day == null) continue;
    const key = r.vid + '|' + r.day;
    if (!byKey[key]) { byKey[key] = { vid: r.vid, day: r.day, rows: [] }; order.push(key); }
    byKey[key].rows.push(r);
  }
  const commits = [];
  const superseded = [];
  for (const key of order) {
    const g = byKey[key];
    const last = g.rows[g.rows.length - 1];
    const c = last.commit;
    if (c && c.winPlanAction === 'party_launch' && (c.part == null || c.part === 2)) {
      const plan = last.plan || {};
      const target = plan.target || null;
      commits.push({
        vid: g.vid, day: g.day, target: target,
        stage: plan.stage || null,
        party: (plan.party || []).slice(),
        needWave: (plan.needWave != null ? plan.needWave : null),
        wave: (target && WAVE_MAP[target] != null) ? WAVE_MAP[target] : null,
        wave4: !!((target && WAVE_MAP[target] != null && WAVE_MAP[target] >= 4) || (plan.needWave | 0) >= 4),
        scoreRows: g.rows.length,
      });
    } else {
      superseded.push({ vid: g.vid, day: g.day,
        action: c ? (c.winPlanAction || c.kind || 'cleared') : 'cleared',
        scoreRows: g.rows.length });
    }
  }
  return { commits: commits, superseded: superseded };
}

// classifyCommit(commit, ctx): frozen precedence. ctx carries the
// seed's rows: departs (dawnbidDeparts), skips (part2nightSkips),
// scoreRows (dawnbidScores), census (part2nightCensus), deaths,
// gameDays. Returns { class, sub, detail }.
// Tie-break (prereg §"Frozen definitions" + metric-review note):
// churn requires the day to have COMPLETED (at least one census row
// exists that day); a commit day with no census rows at all never
// completed, so it falls through to run-ended. This preserves the
// frozen precedence while keeping a run-ended day from reading as
// a churned plan.
function classifyCommit(commit, ctx) {
  const vid = commit.vid, day = commit.day;
  const departs = (ctx.departs || []).filter(function (r) {
    return r.vid === vid && r.day === day && r.commitKind === 'mid-day part-2';
  });
  const launch = departs.find(function (r) { return r.result === 'launch'; });
  if (launch) {
    return { class: 'executed-launched',
      sub: (launch.companionExped === false) ? 'companion-not-started' : 'companion-started',
      detail: { vidExped: launch.vidExped, companionExped: launch.companionExped } };
  }
  const hold = departs.find(function (r) { return r.result === 'hold'; });
  if (hold) {
    return { class: 'executed-held',
      sub: hold.vidBlock || hold.companionBlock || 'unknown',
      detail: { vidBlock: hold.vidBlock, companionBlock: hold.companionBlock } };
  }
  const skips = (ctx.skips || []).filter(function (r) {
    return r.vid === vid && r.day === day && r.commitPart === 2 && r.part === 3;
  });
  if (skips.length) {
    const row = skips[0];
    if (row.reason === 'night') {
      return { class: 'died-at-night-veto', sub: 'night', detail: { skip: row } };
    }
    return { class: 'died-at-night-other', sub: row.reason, detail: { skip: row } };
  }
  // Overwrite: a later score row (part 3, or part 2 after the commit
  // row — impossible by construction, so part 3) whose commit is not
  // this party_launch.
  const later = (ctx.scoreRows || []).filter(function (r) {
    return r.vid === vid && r.day === day && (r.part | 0) === 3;
  });
  for (const r of later) {
    const c = r.commit;
    if (!c || c.winPlanAction !== 'party_launch') {
      return { class: 'overwritten-before-night',
        sub: c ? (c.winPlanAction || c.kind || 'cleared') : 'cleared',
        detail: { part: 3 } };
    }
  }
  const deaths = (ctx.deaths || []).filter(function (d) { return d.who === vid && d.day === day; });
  if (deaths.length) {
    return { class: 'holder-died-before-night', sub: (deaths[0].cause || 'unknown'), detail: {} };
  }
  const dayCensus = (ctx.census || []).filter(function (r) { return r.day === day; });
  const vidCensus = dayCensus.filter(function (r) { return r.vid === vid; });
  if (dayCensus.length && !vidCensus.length) {
    return { class: 'plan-churned-before-night', sub: 'plan-deleted', detail: {} };
  }
  if ((ctx.gameDays | 0) === day) {
    return { class: 'run-ended', sub: 'gameDays=' + ctx.gameDays, detail: {} };
  }
  return { class: 'UNCLASSIFIED', sub: 'no-skip-no-depart-no-overwrite-plan-live', detail: {} };
}

// evaluateCounterfactual(death, dawn, realDawnLaunch, gameDays):
// the frozen hold-to-next-dawn test for one died-at-night-veto commit.
// death: the skip row (day D). dawn: the part2nightDawns row for
// (vid, deathDay D), or null. realDawnLaunch: true iff a dawn depart
// row (day D+1, vid, commitKind 'dawn', result 'launch') exists.
// Returns { status, failures[], dawn } where status is
// would-have-launched | launched-anyway | would-not-launch |
// no-next-dawn | missing-dawn. Medic-duty is NOT a failure condition
// (directed win-plan launches are exempt — prereg assumption (d));
// it is recorded in the row for the state table.
function evaluateCounterfactual(death, dawn, realDawnLaunch, gameDays) {
  if (!dawn) {
    if ((gameDays | 0) <= death.day) return { status: 'no-next-dawn', failures: ['run-ended'], dawn: null };
    return { status: 'missing-dawn', failures: ['no-dawn-row'], dawn: null };
  }
  if (dawn.noDawn) {
    if ((gameDays | 0) > death.day) return { status: 'missing-dawn', failures: ['noDawn-but-run-continued'], dawn: dawn };
    return { status: 'no-next-dawn', failures: ['run-ended'], dawn: dawn };
  }
  const failures = [];
  if (!dawn.holderAlive) failures.push('holder-dead');
  if (!dawn.holderHaven) failures.push('holder-not-at-haven');
  if (dawn.holderAway || dawn.holderExped) failures.push('holder-away');
  if (dawn.holderEngaged) failures.push('holder-engaged');
  if (dawn.holderLaunchBlock) failures.push('holder-block:' + dawn.holderLaunchBlock);
  if (dawn.planGone) failures.push('plan-gone');
  else {
    if (dawn.stageNow !== 'party') failures.push('plan-stage:' + dawn.stageNow);
    if (dawn.targetNow !== dawn.targetAtDeath) failures.push('plan-retargeted');
    if (!dawn.partyIntact) failures.push('party-changed');
  }
  for (const cs of (dawn.companionStates || [])) {
    if (!cs.alive) failures.push('companion-dead:' + cs.vid);
    else if (!cs.haven) failures.push('companion-not-at-haven:' + cs.vid);
    else if (cs.away || cs.exped) failures.push('companion-away:' + cs.vid);
    else if (cs.launchBlock) failures.push('companion-block:' + cs.vid + ':' + cs.launchBlock);
  }
  if (dawn.danger) failures.push('danger-gate');
  if (dawn.indoor) failures.push('indoor-objective');
  if (failures.length) return { status: 'would-not-launch', failures: failures, dawn: dawn };
  if (realDawnLaunch) return { status: 'launched-anyway', failures: [], dawn: dawn };
  return { status: 'would-have-launched', failures: [], dawn: dawn };
}

function classifySeed(j) {
  const wave4Ids = j.wave4Ids || [];
  const p2 = part2Commits(j);
  const ctx = {
    departs: j.dawnbidDeparts || [],
    skips: j.part2nightSkips || [],
    scoreRows: j.dawnbidScores || [],
    census: j.part2nightCensus || [],
    deaths: j.deaths || [],
    gameDays: j.gameDays || 0,
  };
  const commits = p2.commits.map(function (c) {
    const cls = classifyCommit(c, ctx);
    return Object.assign({}, c, { class: cls.class, sub: cls.sub, detail: cls.detail });
  });
  // Orphan skip rows: night skip rows (commitPart 2, part 3) with no
  // score-row part-2 commit for that (vid, day).
  const commitKeys = {};
  for (const c of commits) commitKeys[c.vid + '|' + c.day] = true;
  const orphans = (j.part2nightSkips || []).filter(function (r) {
    return r.commitPart === 2 && r.part === 3 && !commitKeys[r.vid + '|' + r.day];
  });
  // Unknown skip reasons (instrument validity).
  const badReason = (j.part2nightSkips || []).find(function (r) { return KNOWN_SKIP.indexOf(r.reason) === -1; });
  // Counterfactuals for died-at-night-veto commits.
  const dawnByKey = {};
  for (const d of (j.part2nightDawns || [])) dawnByKey[d.vid + '|' + d.deathDay] = d;
  const counterfactuals = [];
  for (const c of commits) {
    if (c.class !== 'died-at-night-veto') continue;
    const dawn = dawnByKey[c.vid + '|' + c.day] || null;
    const realDawnLaunch = (j.dawnbidDeparts || []).some(function (r) {
      return r.vid === c.vid && r.day === c.day + 1 && r.commitKind === 'dawn' && r.result === 'launch';
    });
    const realDawnHold = (j.dawnbidDeparts || []).some(function (r) {
      return r.vid === c.vid && r.day === c.day + 1 && r.commitKind === 'dawn' && r.result === 'hold';
    });
    // Same-day part-1 re-bid launch (secondary context, prereg (e)).
    const laterSameDay = (j.dawnbidDeparts || []).some(function (r) {
      return r.vid === c.vid && r.day === c.day && r.result === 'launch' &&
        (r.commitKind === 'mid-day part-1' || r.commitKind === 'dawn');
    });
    const ev = evaluateCounterfactual(c.detail.skip, dawn, realDawnLaunch, j.gameDays || 0);
    counterfactuals.push(Object.assign({ vid: c.vid, day: c.day, target: c.target, wave4: c.wave4,
      realDawnLaunch: realDawnLaunch, realDawnHold: realDawnHold, laterSameDayLaunch: laterSameDay },
      ev, { dawn: ev.dawn ? { dawnDay: ev.dawn.dawnDay, holderMedicDuty: ev.dawn.holderMedicDuty,
        freshCommit: ev.dawn.freshCommit, noDawn: !!ev.dawn.noDawn } : null }));
  }
  // Part-3 commits (secondary population count).
  const part3 = {};
  for (const r of (j.dawnbidScores || [])) {
    if ((r.part | 0) !== 3 || !r.commit || r.commit.winPlanAction !== 'party_launch') continue;
    part3[r.vid + '|' + r.day] = true;
  }
  const counts = {};
  for (const k of CLASSES) counts[k] = 0;
  for (const c of commits) counts[c.class]++;
  const wave4 = commits.filter(function (c) { return c.wave4; });
  const wave4counts = {};
  for (const k of CLASSES) wave4counts[k] = 0;
  for (const c of wave4) wave4counts[c.class]++;
  const starv = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
  const scholarDeaths = (j.deaths || []).filter(function (d) { return d.player; }).length;
  // Night-death rows (part-3 skip rows for part-2 commits) for the
  // holder-state table in summarize().
  const nightDeaths = (j.part2nightSkips || []).filter(function (r) {
    return r.commitPart === 2 && r.part === 3;
  });
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays || 0, endReason: j.endReason,
    won: !!j.won, scaleRank: j.scaleRank || null, standing: (j.standing != null ? j.standing : null),
    maxWave: j.maxWave || 1, deaths: (j.deaths || []).length, starvation: starv,
    scholarDeaths: scholarDeaths,
    instrumentErrors: (j.instrumentErrors || []).length,
    commits: commits, counts: counts, wave4counts: wave4counts,
    wave4commits: wave4.length,
    superseded: p2.superseded, supersededCount: p2.superseded.length,
    orphans: orphans, orphanCount: orphans.length,
    badSkipReason: badReason ? badReason.reason : null,
    counterfactuals: counterfactuals,
    nightDeaths: nightDeaths,
    part3CommitDays: Object.keys(part3).length,
    wave4Ids: wave4Ids,
  };
}

function summarize(bySeed) {
  const seeds = Object.keys(bySeed).map(Number).sort(function (a, b) { return a - b; });
  const total = { counts: {}, wave4counts: {}, commits: 0, wave4commits: 0,
    superseded: 0, orphans: 0, part3CommitDays: 0,
    counterfactual: {}, dawnFailures: {}, holderState: {}, instrumentErrors: 0,
    files: seeds.length };
  for (const k of CLASSES) { total.counts[k] = 0; total.wave4counts[k] = 0; }
  for (const s of ['would-have-launched', 'launched-anyway', 'would-not-launch', 'no-next-dawn', 'missing-dawn']) total.counterfactual[s] = 0;
  let wall = { wins: 0, nationalStanding: 0, nationalRank: 0, table: 0, wave4: 0, wave5: 0,
    survivals: [], deaths: 0, starvation: 0, scholarDeaths: 0 };
  const perSeed = {};
  for (const seed of seeds) {
    const cs = bySeed[seed];
    perSeed[seed] = cs;
    for (const k of CLASSES) { total.counts[k] += cs.counts[k]; total.wave4counts[k] += cs.wave4counts[k]; }
    total.commits += cs.commits.length;
    total.wave4commits += cs.wave4commits;
    total.superseded += cs.supersededCount;
    total.orphans += cs.orphanCount;
    total.part3CommitDays += cs.part3CommitDays;
    total.instrumentErrors += cs.instrumentErrors;
    for (const cf of cs.counterfactuals) {
      total.counterfactual[cf.status]++;
      for (const f of (cf.failures || [])) {
        const base = f.split(':')[0];
        total.dawnFailures[base] = (total.dawnFailures[base] || 0) + 1;
      }
    }
    if (cs.won) wall.wins++;
    if ((cs.standing || 0) >= 200) wall.nationalStanding++;
    if (cs.scaleRank === 'national' || cs.scaleRank === 'global') wall.nationalRank++;
    if ((cs.maxWave || 1) >= 4) wall.wave4++;
    if ((cs.maxWave || 1) >= 5) wall.wave5++;
    wall.survivals.push(cs.gameDays || 0);
    wall.deaths += cs.deaths;
    wall.starvation += cs.starvation;
    wall.scholarDeaths += cs.scholarDeaths;
  }
  wall.survivals.sort(function (a, b) { return a - b; });
  const n = wall.survivals.length;
  wall.medianSurvival = n ? (n % 2 ? wall.survivals[(n - 1) / 2] : (wall.survivals[n / 2 - 1] + wall.survivals[n / 2]) / 2) : null;
  // Holder-state table at each night death (all skip rows at part 3
  // with commitPart 2, both reasons), across seeds.
  const hs = { total: 0, atHaven: 0, away: 0, medicDuty: 0, sick: 0, engaged: 0,
    launchBlock: 0, reason: {}, wave4: 0 };
  for (const seed of seeds) {
    const cs = bySeed[seed];
    for (const r of (cs.nightDeaths || [])) {
      hs.total++;
      if (r.raw && r.raw.haven) hs.atHaven++;
      if (r.raw && (r.raw.away || r.raw.exped)) hs.away++;
      if (r.medicDuty) hs.medicDuty++;
      if (r.sick) hs.sick++;
      if (r.raw && r.raw.engaged) hs.engaged++;
      if (r.launchBlock) hs.launchBlock++;
      hs.reason[r.reason] = (hs.reason[r.reason] || 0) + 1;
      const w = (r.target && WAVE_MAP[r.target] != null) ? WAVE_MAP[r.target] : null;
      if (w != null && w >= 4) hs.wave4++;
    }
  }
  total.holderState = hs;
  total.wall = wall;
  total.perSeed = perSeed;
  return total;
}

function main() {
  const bySeed = {};
  let files = 0;
  let firstRaw = null;
  for (const seed of SEEDS) {
    const fp = path.join(DIR, 'part2night-a-s' + seed + '-part2night-a-diag.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    files++;
    if (!firstRaw) firstRaw = j;
    const cs = classifySeed(j);
    bySeed[seed] = cs;
  }
  const sum = summarize(bySeed);
  // Verdict vs the frozen bars (proof green is judged in the evidence
  // file — the analyzer cannot see the proof run).
  const verdict = {
    completeness: sum.counts.UNCLASSIFIED === 0,
    instrument: sum.instrumentErrors === 0 && files === SEEDS.length && sum.orphans === 0 &&
      !Object.keys(bySeed).some(function (s) { return bySeed[s].badSkipReason; }),
    counterfactualComputed: Object.keys(bySeed).every(function (s) {
      return bySeed[s].counterfactuals.every(function (cf) { return cf.status !== 'missing-dawn'; });
    }),
    floor: sum.commits >= 1 && sum.counts['died-at-night-veto'] >= 1,
  };
  verdict.go = verdict.completeness && verdict.instrument && verdict.counterfactualComputed && verdict.floor;
  verdict.unjudgeable = !verdict.floor;
  const out = {
    arm: 'part2night-a', run: 'part2night-a', band: SEEDS,
    policy: 'competent',
    policySha: (firstRaw && firstRaw.policySha) || null,
    anchorCommit: (firstRaw && firstRaw.anchorCommit) || null,
    files: files, verdict: verdict,
    counts: sum.counts, wave4counts: sum.wave4counts,
    commits: sum.commits, wave4commits: sum.wave4commits,
    superseded: sum.superseded, orphans: sum.orphans,
    part3CommitDays: sum.part3CommitDays,
    instrumentErrors: sum.instrumentErrors,
    counterfactual: sum.counterfactual,
    dawnFailures: sum.dawnFailures,
    holderState: sum.holderState,
    wall: sum.wall,
    perSeed: sum.perSeed,
  };
  // Strip nothing else: per-seed detail stays in the analysis via the
  // classified commits/counterfactuals.
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({
    verdict: verdict, counts: sum.counts, wave4counts: sum.wave4counts,
    commits: sum.commits, counterfactual: sum.counterfactual,
    orphans: sum.orphans, instrumentErrors: sum.instrumentErrors,
    wall: sum.wall, out: path.relative(REPO, OUT),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { classifySeed: classifySeed, classifyCommit: classifyCommit,
  evaluateCounterfactual: evaluateCounterfactual, part2Commits: part2Commits,
  summarize: summarize, CLASSES: CLASSES, KNOWN_SKIP: KNOWN_SKIP };
