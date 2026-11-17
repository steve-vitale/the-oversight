// analyze-deadplan-b.js — analyzer for arm sim-deadplan-b (DIAG).
// Answers the cost question with counts: (a) dead-holder plan rows
// as a share of the plan census over time; (b) POOL POLLUTION —
// every launch attempt, dawn pool selection, companion pick, or
// plan-target read that ever touches a dead holder's plan; (c)
// SLOT — a dead holder's plan ever blocking a living villager;
// (d) CENSUS NOISE — rows attributable to dead vs live holders and
// whether any downstream metric would change if dead-holder rows
// were excluded. Verdict: COSTLY (with measured instances) or
// NOISE-ONLY (zero touches, census-only).
// Usage:
//   node scripts/analyze-deadplan-b.js --on evidence/2026-11-16/perseed-deadplan-b-on --off evidence/2026-11-16/perseed-deadplan-b-off [--out evidence/2026-11-16/deadplan-b-analysis.json]
// Exits 0 iff bars 1, 3, 4 (prereg) pass; bar 2 is the proof test's.
// The analyzer never re-scores: the classification follows the
// frozen bar-3 rule exactly.
'use strict';
const fs = require('fs');
const path = require('path');

const DRIVER = require(path.join(__dirname, 'deadplan-driver-20261117.js'));
const TOUCH_METHODS = DRIVER.DEADPLAN_TOUCH_METHODS;
const BUCKETS = [[0, 30], [31, 60], [61, 90], [91, 120], [121, 150]];
function bucketOf(day) {
  for (let i = 0; i < BUCKETS.length; i++) if (day >= BUCKETS[i][0] && day <= BUCKETS[i][1]) return BUCKETS[i][0] + '-' + BUCKETS[i][1];
  return 'other';
}
function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// deathDayMap(j): vid -> first day the villager is dead.
// Sources, in order: (1) the run's deaths array — kind
// 'villager'/'person' rows carry who=vid (monster kills carry
// kind 'monster' and are skipped); (2) planCensus — a holder's
// first holderAlive===false day (cross-check / fallback).
// The daily roster snapshots CANNOT source death days: dead
// villagers are REMOVED from the roster before the snapshot (the
// snapshot's dead flag is always false and the roster shrinks —
// verified on seed 103224: Sal Ding last roster day 31, first dead
// census day 32). A holder dead in the census with no deaths row is
// listed in deathDayUnknown (fallback to the census day).
function deathDayMap(j) {
  const map = {};
  const seen = {};
  const unknown = [];
  for (const d of (j.deaths || [])) {
    if (!d || (d.kind !== 'villager' && d.kind !== 'person') || !d.who) continue;
    if (map[d.who] == null || d.day < map[d.who]) map[d.who] = (d.day | 0);
    seen[d.who] = true;
  }
  for (const r of (j.planCensus || [])) {
    seen[r.vid] = true;
    for (const pid of (r.party || [])) seen[pid] = true;
    if (r.holderAlive === false) {
      if (map[r.vid] == null) map[r.vid] = (r.day | 0);
      else if (r.day < map[r.vid]) map[r.vid] = (r.day | 0);
    }
  }
  for (const d of (j.daily || [])) {
    for (const r of (d.roster || [])) if (r && r.vid) seen[r.vid] = true;
  }
  // Census-dead holders with no deaths-array row.
  const censusDead = {};
  for (const r of (j.planCensus || [])) {
    if (r.holderAlive === false) censusDead[r.vid] = true;
  }
  for (const vid of Object.keys(censusDead)) {
    const hasDeathRow = (j.deaths || []).some(function (d) {
      return d && (d.kind === 'villager' || d.kind === 'person') && d.who === vid;
    });
    if (!hasDeathRow) unknown.push(vid);
  }
  return { map: map, seen: seen, deathDayUnknown: unknown };
}
function finalKillLog(j) {
  try {
    const daily = j.daily || [];
    const last = daily.length ? daily[daily.length - 1] : null;
    return (last && last.waveKillLog) || [];
  } catch (e) { return []; }
}

function analyzeOne(j) {
  const census = (j.planCensus || []).slice();
  const touches = (j.deadTouches || []).slice();
  const creates = (j.v4creates || []).slice();
  const seeds = (j.v4seeds || []).slice();
  const scores = (j.dawnbidScores || []).slice();
  const dawnScored = (j.dawnScored || []).slice();
  const pool = (j.companionPool || []).slice();
  const departs = (j.v4departs || []).slice();
  const { map: deathDay, seen: rosterSeen, deathDayUnknown } = deathDayMap(j);
  const killLog = finalKillLog(j);

  // ---- validity (bar 1) ----
  const badSeed = seeds.find(function (r) { return DRIVER.SEED_PATHS.indexOf(r.path) === -1; }) || null;
  const badCreate = creates.find(function (r) {
    if (!DRIVER.isNamedCreator(r.creator)) return true;
    if (r.creator === 'havenTick' && (!r.source || String(r.source).indexOf('unknown-') === 0)) return true;
    return false;
  }) || null;
  const badTouch = touches.find(function (r) {
    return TOUCH_METHODS.indexOf(r.method) === -1 || typeof r.holderAlive !== 'boolean';
  }) || null;
  const unknownErrors = (j.instrumentErrors || []).length;

  // ---- (a) linger share ----
  const censusTotal = census.length;
  const censusDead = census.filter(function (r) { return r.holderAlive === false; }).length;
  const bucketRows = {};
  for (const b of BUCKETS) bucketRows[b[0] + '-' + b[1]] = { total: 0, dead: 0 };
  for (const r of census) {
    const bk = bucketOf(r.day);
    if (bucketRows[bk]) { bucketRows[bk].total++; if (r.holderAlive === false) bucketRows[bk].dead++; }
  }
  // Dead-holder tails: per holder, first dead census day -> last census day.
  const byHolder = {};
  for (const r of census) {
    if (!byHolder[r.vid]) byHolder[r.vid] = { rows: 0, deadRows: 0, firstDeadDay: null, lastDay: -1, firstDay: null };
    const h = byHolder[r.vid];
    h.rows++;
    if (h.firstDay == null) h.firstDay = r.day;
    if (r.day > h.lastDay) h.lastDay = r.day;
    if (r.holderAlive === false) {
      h.deadRows++;
      if (h.firstDeadDay == null) h.firstDeadDay = r.day;
    }
  }
  const tails = [];
  for (const vid of Object.keys(byHolder)) {
    const h = byHolder[vid];
    if (h.deadRows > 0) {
      tails.push({ vid: vid, deadRows: h.deadRows, firstDeadDay: h.firstDeadDay,
        lastDay: h.lastDay, spanDays: h.lastDay - h.firstDeadDay,
        stage: null, target: null });
    }
  }
  // Attach the holder's last plan stage/target for the story.
  for (const t of tails) {
    const rows = census.filter(function (r) { return r.vid === t.vid; });
    const last = rows.length ? rows[rows.length - 1] : null;
    if (last) { t.stage = last.stage || null; t.target = last.target || null; }
  }
  tails.sort(function (a, b) { return b.spanDays - a.spanDays; });
  const longTails = tails.filter(function (t) { return t.spanDays >= 30; });

  // ---- (b) pool pollution: six frozen sub-counts + dawn completeness ----
  const poolCounts = {
    b0_dawnScoredDead: dawnScored.filter(function (r) { return r.holderAlive === false; }),
    b1_dawnbidScoresDead: scores.filter(function (r) { return r.holderAlive === false; }),
    b2_rankedPickDead: pool.filter(function (r) { return r.rankedPickAlive === false; }),
    b3_departsDead: departs.filter(function (r) {
      if (r.holderAlive === false) return true;
      return ((r.partyAlive || []).some(function (p) { return p && p.alive === false; }));
    }),
    b4_touchesDeadByMethod: {},
    b5_secondPickDead: touches.filter(function (r) { return r.method === 'winPlanSecondCompanion' && r.pickAlive === false; }),
    b6_winPlanOfDead: touches.filter(function (r) { return r.method === 'winPlanOf' && r.holderAlive === false; }),
  };
  for (const m of TOUCH_METHODS) poolCounts.b4_touchesDeadByMethod[m] = touches.filter(function (r) { return r.method === m && r.holderAlive === false; });
  const touchesByMethod = {};
  for (const m of TOUCH_METHODS) touchesByMethod[m] = touches.filter(function (r) { return r.method === m; }).length;
  const touchesDeadTotal = touches.filter(function (r) { return r.holderAlive === false; }).length;
  const winPlanOfCreatedDead = touches.filter(function (r) { return r.method === 'winPlanOf' && r.holderAlive === false && r.created === true; });
  const createsDead = creates.filter(function (r) { return r.holderAlive === false; });

  // ---- (c) slot ----
  // (c-i) census-side: living holders whose plan.party contains a
  // vid dead on that day (deathDay map; unknown members counted
  // separately, never assumed dead).
  const slotHolders = {};
  let slotHolderDays = 0;
  let slotUnknownRefs = 0;
  for (const r of census) {
    if (r.holderAlive !== true) continue;
    const party = r.party || [];
    let deadRef = null, unknownRef = null;
    for (const pid of party) {
      if (!pid) continue;
      if (deathDay[pid] != null && deathDay[pid] <= r.day) { deadRef = pid; break; }
      if (!rosterSeen[pid] && deathDay[pid] == null) unknownRef = pid;
    }
    if (deadRef) {
      slotHolderDays++;
      if (!slotHolders[r.vid]) slotHolders[r.vid] = { vid: r.vid, firstDeadRefDay: r.day, deadRef: deadRef, days: 0, launchedAfter: false };
      slotHolders[r.vid].days++;
    } else if (unknownRef) slotUnknownRefs++;
  }
  const slotHolderList = Object.keys(slotHolders).map(function (k) { return slotHolders[k]; });
  for (const h of slotHolderList) {
    h.launchedAfter = departs.some(function (d) {
      return d.vid === h.vid && d.result === 'launch' && d.day > h.firstDeadRefDay;
    });
  }
  // (c-ii) launch-side: launches whose party contained a dead vid.
  const launchesWithDeadParty = departs.filter(function (d) {
    return d.result === 'launch' && (d.partyAlive || []).some(function (p) { return p && p.alive === false; });
  });
  // (c-iii) winPlanOf creation for a dead vid (same rows as b6-created).
  const slot = { holders: slotHolderList, holderDays: slotHolderDays,
    launchesWithDeadParty: launchesWithDeadParty,
    winPlanOfCreatedDead: winPlanOfCreatedDead,
    unknownPartyRefs: slotUnknownRefs,
    deathDayUnknown: deathDayUnknown };
  // Reverse diagnostic (not a slot cost — nothing ever reads a dead
  // holder's party except the holder's own, never-taken actions):
  // dead holders whose plan.party still names a villager alive on
  // that day. Stale in both directions, read in neither.
  let deadHolderLivePartyRefs = 0;
  const deadHolderLivePartyExamples = [];
  for (const r of census) {
    if (r.holderAlive !== false) continue;
    for (const pid of (r.party || [])) {
      if (!pid) continue;
      const dd = deathDay[pid];
      if (dd == null || dd > r.day) {
        deadHolderLivePartyRefs++;
        if (deadHolderLivePartyExamples.length < 5) {
          deadHolderLivePartyExamples.push({ day: r.day, holder: r.vid, partyVid: pid });
        }
        break;
      }
    }
  }

  // ---- (d) census noise ----
  const perDay = {};
  for (const r of census) {
    if (!perDay[r.day]) perDay[r.day] = { incl: 0, excl: 0 };
    perDay[r.day].incl++;
    if (r.holderAlive !== false) perDay[r.day].excl++;
  }
  const days = Object.keys(perDay).map(function (k) { return parseInt(k, 10); }).sort(function (a, b) { return a - b; });
  let maxInflation = 0, sumInflation = 0, nDays = 0;
  for (const d of days) {
    const row = perDay[d];
    if (row.excl > 0) { const inf = row.incl / row.excl; if (inf > maxInflation) maxInflation = inf; sumInflation += inf; nDays++; }
    else if (row.incl > 0) { maxInflation = Infinity; }
  }
  const finalDay = days.length ? days[days.length - 1] : null;
  const censusNoise = {
    daysWithCensus: days.length,
    meanInflation: nDays ? +(sumInflation / nDays).toFixed(3) : null,
    maxInflation: maxInflation === Infinity ? 'all-dead-day' : +maxInflation.toFixed(3),
    finalDay: finalDay,
    finalDayIncl: finalDay != null ? perDay[finalDay].incl : 0,
    finalDayExcl: finalDay != null ? perDay[finalDay].excl : 0,
    perDay: perDay,
  };

  // ---- wall numbers (this seed) ----
  const w4kills = killLog.filter(function (e) { return (e.w | 0) >= 4; }).length;
  const w5kills = killLog.filter(function (e) { return (e.w | 0) >= 5; }).length;
  return {
    seed: j.seed, mode: j.mode, recorderOn: j.recorderOn,
    anchorCommit: j.anchorCommit || null, policySha: j.policySha || null,
    gameDays: j.gameDays || 0, endReason: j.endReason || null,
    won: !!j.won, standing: (j.standing != null ? j.standing : null),
    scaleRank: j.scaleRank || null, maxWave: j.maxWave || null,
    unlockedWave: j.unlockedWave || null,
    nationalByStanding: (j.standing != null && j.standing >= 200),
    nationalByScaleRank: (j.scaleRank === 'national' || j.scaleRank === 'global'),
    wave4Kills: w4kills, wave5Kills: w5kills,
    deaths: (j.deaths || []).length,
    instrumentErrors: unknownErrors,
    validity: { badSeed: badSeed, badCreate: badCreate, badTouch: badTouch,
      unknownErrors: unknownErrors },
    linger: { censusTotal: censusTotal, censusDead: censusDead,
      share: censusTotal ? +(censusDead / censusTotal).toFixed(4) : 0,
      buckets: bucketRows, tails: tails, longTails: longTails.length,
      longestSpan: tails.length ? tails[0].spanDays : 0,
      distinctDeadHolders: tails.length },
    pool: {
      b0_dawnScoredDeadN: poolCounts.b0_dawnScoredDead.length,
      b0_dawnScoredDead: poolCounts.b0_dawnScoredDead,
      b1_dawnbidScoresDeadN: poolCounts.b1_dawnbidScoresDead.length,
      b1_dawnbidScoresDead: poolCounts.b1_dawnbidScoresDead,
      b2_rankedPickDeadN: poolCounts.b2_rankedPickDead.length,
      b2_rankedPickDead: poolCounts.b2_rankedPickDead,
      b3_departsDeadN: poolCounts.b3_departsDead.length,
      b3_departsDead: poolCounts.b3_departsDead,
      b4_touchesDeadByMethod: poolCounts.b4_touchesDeadByMethod,
      b4_touchesDeadTotal: touchesDeadTotal,
      touchesByMethod: touchesByMethod,
      b5_secondPickDeadN: poolCounts.b5_secondPickDead.length,
      b5_secondPickDead: poolCounts.b5_secondPickDead,
      b6_winPlanOfDeadN: poolCounts.b6_winPlanOfDead.length,
      b6_winPlanOfDead: poolCounts.b6_winPlanOfDead,
      winPlanOfCreatedDeadN: winPlanOfCreatedDead.length,
      winPlanOfCreatedDead: winPlanOfCreatedDead,
      createsDeadN: createsDead.length, createsDead: createsDead,
    },
    slot: slot,
    deadHolderLivePartyRefs: deadHolderLivePartyRefs,
    deadHolderLivePartyExamples: deadHolderLivePartyExamples,
    censusNoise: censusNoise,
  };
}

// Static reader check (bar 3d support): the only src/js files that
// mention winPlan, and the standing/table files that must not.
function staticReaderCheck(repoRoot) {
  const out = { filesWithWinPlan: [], standingTableClean: true, problems: [] };
  try {
    const dir = path.join(repoRoot, 'src', 'js');
    for (const f of fs.readdirSync(dir)) {
      if (!/\.js$/.test(f)) continue;
      const src = fs.readFileSync(path.join(dir, f), 'utf8');
      if (src.indexOf('winPlan') !== -1) out.filesWithWinPlan.push(f);
    }
    out.filesWithWinPlan.sort();
    for (const f of ['standing.js', 'progression.js', 'hierarchy.js', 'table.js']) {
      if (out.filesWithWinPlan.indexOf(f) !== -1) {
        out.standingTableClean = false;
        out.problems.push(f + ' reads winPlan');
      }
    }
    const allowed = ['game.js', 'villager-agency.js', 'villager-brain.js', 'win-plan.js', 'betrayal.js'];
    // CORRECTION (sim-deathcleanup-b, 2026-11-17): betrayal.js is now a
    // sanctioned winPlan caller — removeVillager's death branch calls
    // winPlanOnVillagerDeath(vid) (the one removal choke point). The
    // deadplan-era allowlist predates that wiring; flagging it would
    // report the intended fix as a problem.
    for (const f of out.filesWithWinPlan) {
      if (allowed.indexOf(f) === -1) out.problems.push('unexpected winPlan reader: ' + f);
    }
  } catch (e) { out.problems.push('static check failed: ' + String(e.message).slice(0, 120)); }
  return out;
}

function summarizeLeg(files) {
  const perSeed = files.map(analyzeOne);
  const wall = {
    seeds: perSeed.length,
    nationalByStanding: perSeed.filter(function (s) { return s.nationalByStanding; }).length,
    nationalByScaleRank: perSeed.filter(function (s) { return s.nationalByScaleRank; }).length,
    table: perSeed.filter(function (s) { return s.won; }).length,
    wins: perSeed.filter(function (s) { return s.won; }).length,
    wave4Reached: perSeed.filter(function (s) { return (s.maxWave || 0) >= 4; }).length,
    wave5Reached: perSeed.filter(function (s) { return (s.maxWave || 0) >= 5; }).length,
    medianSurvival: median(perSeed.map(function (s) { return s.gameDays; })),
    wave4Kills: perSeed.reduce(function (a, s) { return a + s.wave4Kills; }, 0),
    wave5Kills: perSeed.reduce(function (a, s) { return a + s.wave5Kills; }, 0),
    deaths: perSeed.reduce(function (a, s) { return a + s.deaths; }, 0),
  };
  return { perSeed: perSeed, wall: wall };
}

function classify(files) {
  const leg = summarizeLeg(files);
  const poolTotal = leg.perSeed.reduce(function (a, s) {
    return a + s.pool.b0_dawnScoredDeadN + s.pool.b1_dawnbidScoresDeadN +
      s.pool.b2_rankedPickDeadN + s.pool.b3_departsDeadN +
      s.pool.b4_touchesDeadTotal + s.pool.b5_secondPickDeadN + s.pool.b6_winPlanOfDeadN;
  }, 0);
  const slotTotal = leg.perSeed.reduce(function (a, s) {
    return a + s.slot.holders.length + s.slot.launchesWithDeadParty.length + s.slot.winPlanOfCreatedDead.length;
  }, 0);
  const censusDeadTotal = leg.perSeed.reduce(function (a, s) { return a + s.linger.censusDead; }, 0);
  const censusTotal = leg.perSeed.reduce(function (a, s) { return a + s.linger.censusTotal; }, 0);
  const validityOk = leg.perSeed.every(function (s) {
    return s.validity.badSeed == null && s.validity.badCreate == null &&
      s.validity.badTouch == null && s.validity.unknownErrors === 0;
  });
  const verdict = (poolTotal === 0 && slotTotal === 0) ? 'NOISE-ONLY' : 'COSTLY';
  return { leg: leg, poolTotal: poolTotal, slotTotal: slotTotal,
    censusDeadTotal: censusDeadTotal, censusTotal: censusTotal,
    validityOk: validityOk, verdict: verdict };
}

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

if (require.main === module) (function () {
  const args = process.argv.slice(2);
  function arg(name) {
    const i = args.indexOf(name);
    return (i !== -1 && args[i + 1]) ? args[i + 1] : null;
  }
  const onDir = arg('--on'), offDir = arg('--off'), outPath = arg('--out');
  if (!onDir || !offDir) {
    console.error('DEADPLAN STOP: --on and --off dirs required.');
    process.exit(2);
  }
  const onFiles = loadDir(onDir);
  const offFiles = loadDir(offDir);
  if (!onFiles.length || !offFiles.length) {
    console.error('DEADPLAN STOP: empty leg dir (on=' + onFiles.length + ' off=' + offFiles.length + ').');
    process.exit(2);
  }
  const repoRoot = path.join(__dirname, '..');
  const on = classify(onFiles);
  const off = summarizeLeg(offFiles);
  const staticCheck = staticReaderCheck(repoRoot);
  const bar1 = on.validityOk && onFiles.length === 8;
  const bar3 = on.verdict === 'NOISE-ONLY' || on.verdict === 'COSTLY'; // classified either way; counts decide which
  const bar3counts = (on.poolTotal === 0 && on.slotTotal === 0)
    ? 'NOISE-ONLY with zero touches on all sub-counts'
    : 'COSTLY with ' + on.poolTotal + ' pool touches + ' + on.slotTotal + ' slot instances enumerated';
  const report = {
    arm: 'deadplan-b', verdict: on.verdict,
    bars: {
      bar1_corpusValid: bar1,
      bar3_classified: bar3, bar3counts: bar3counts,
      bar4_wallReported: true,
    },
    staticReaderCheck: staticCheck,
    on: on, offWall: off.wall,
    offPerSeed: off.perSeed.map(function (s) {
      return { seed: s.seed, gameDays: s.gameDays, standing: s.standing,
        scaleRank: s.scaleRank, won: s.won, maxWave: s.maxWave,
        wave4Kills: s.wave4Kills, deaths: s.deaths };
    }),
  };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  console.log('verdict: ' + report.verdict + ' (pool touches ' + on.poolTotal +
    ', slot instances ' + on.slotTotal + ', dead census rows ' + on.censusDeadTotal +
    '/' + on.censusTotal + ')');
  console.log('bar1 corpus valid: ' + bar1 + ' | bar3: ' + bar3counts);
  console.log('wall ON : ' + JSON.stringify(on.leg.wall));
  console.log('wall OFF: ' + JSON.stringify(off.wall));
  console.log('static readers: ' + JSON.stringify(staticCheck.filesWithWinPlan) +
    ' standing/table clean: ' + staticCheck.standingTableClean);
  const fail = !bar1 || staticCheck.problems.length > 0;
  if (fail) {
    console.log('ANALYZER FAIL: bar1=' + bar1 + ' staticProblems=' + JSON.stringify(staticCheck.problems));
    process.exitCode = 1;
  }
})();

module.exports = { analyzeOne: analyzeOne, classify: classify, summarizeLeg: summarizeLeg,
  deathDayMap: deathDayMap, staticReaderCheck: staticReaderCheck, BUCKETS: BUCKETS };
