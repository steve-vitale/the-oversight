// analyze-planignite-a.js — classifier for arm sim-planignite-a (DIAG).
// Answers: WHY do villages never start a plan? Decomposes havenTick
// plan creation per village per day and names, for every village that
// never starts a plan, WHICH condition blocks it — the frozen
// taxonomy from evidence/2026-11-16/sim-planignite-a-prereg.md
// (first match wins, per village):
//   1. no-ranger — zero ranger-days in igniteCensus.
//   2. no-engagement — rangers exist, but heard never true (slainN 0
//      every day) AND no ranger ever fought (foughtN 0 all days).
//   3. ranger-never-reaches-haventick — rangers exist, engagement
//      true some day, but zero havenTickCalls for any ranger.
//      Sub-blocker = modal first-fail bucket among ranger-ticks.
//   4. haventick-called-no-create — havenTickCalls for rangers exist
//      but zero creations. Sub-blocker = modal call outcome.
//   5. unexplained — none of the above (fails bar 1 by construction).
// Villages that DO ignite get 'ignited' with first-creation
// day/source/creator, for contrast. Reuses the haventick analyzer's
// classifyHavenTick for the creation-ledger check (bar 6) and the
// wall numbers (bar 7).
// Usage:
//   node scripts/analyze-planignite-a.js <controlDir>
// Writes evidence/2026-11-16/planignite-a-analysis.json. Exits 0 iff
// every no-plan village is classified (bar 1), 8/8 files parse
// (bar 2), zero tick-gate mismatches (bar 5), the ledger check is
// clean (bar 6), and wall numbers are reported (bar 7).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const HAVEN = require(path.join(REPO, 'scripts', 'analyze-haventick-b.js'));

const FAIL_BUCKETS = ['player-skip', 'dead', 'engaged', 'onExped', 'notRanger', 'notAtHaven', 'night', 'indoor', 'trigger', 'instrument-error'];
const RANGER_PROFILES = ['wanderer', 'explorer'];

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function modeOf(vals) {
  const tally = {};
  for (const v of vals) { const k = String(v); tally[k] = (tally[k] || 0) + 1; }
  let best = null, bestN = -1;
  for (const k of Object.keys(tally)) if (tally[k] > bestN) { best = k; bestN = tally[k]; }
  return { value: best, count: bestN, tally: tally };
}
function isRanger(p) { return RANGER_PROFILES.indexOf(p) !== -1; }

// scorePartsBreakdown(parts): the profile-score contributions of one
// villager's recorded inputs, in the npcRangeProfile scoring rules
// (temper bold/restless +2, intense +1, cautious/withdrawn -2,
// gentle -1; goal explore +2, prove/lead/escape +1, heal/protect -1;
// age <30 +1, >55 -2, >45 -1; rangingApt as recorded; potential +2).
function scorePartsBreakdown(parts) {
  const t = parts.temper, g = parts.goal, age = parts.age;
  const temperPart = (t === 'bold' || t === 'restless') ? 2 : t === 'intense' ? 1
    : (t === 'cautious' || t === 'withdrawn') ? -2 : t === 'gentle' ? -1 : 0;
  const goalPart = g === 'explore' ? 2 : (g === 'prove' || g === 'lead' || g === 'escape') ? 1
    : (g === 'heal' || g === 'protect') ? -1 : 0;
  const agePart = age < 30 ? 1 : age > 55 ? -2 : age > 45 ? -1 : 0;
  return { temper: temperPart, goal: goalPart, age: agePart,
    rangingApt: parts.rangingApt || 0, potential: parts.potential ? 2 : 0,
    total: temperPart + goalPart + agePart + (parts.rangingApt || 0) + (parts.potential ? 2 : 0) };
}

// classifyIgnition(j): the frozen taxonomy, per seed. Returns the
// per-seed classification plus diagnostics. `base` is the haventick
// classification of the same corpus (ledger + wall).
function classifyIgnition(j, base) {
  const seed = j.seed;
  const creates = (j.v4creates || []).slice();
  const calls = (j.havenTickCalls || []).slice();
  const census = (j.igniteCensus || []).slice();
  const village = (j.igniteVillage || []).slice();
  const totals = j.tickGateTotals || {};
  const checks = (j.tickGateChecks || []).slice();
  const noPlan = creates.length === 0;

  // Per-villager modal profile + modal inputs (over their census rows).
  const byVid = {};
  for (const r of census) {
    if (!byVid[r.vid]) byVid[r.vid] = [];
    byVid[r.vid].push(r);
  }
  const villagers = [];
  for (const vid of Object.keys(byVid)) {
    const rows = byVid[vid];
    const profMode = modeOf(rows.map(function (r) { return r.profile; }));
    const temperMode = modeOf(rows.map(function (r) { return r.temper; }));
    const goalMode = modeOf(rows.map(function (r) { return r.goal; }));
    const ageMode = modeOf(rows.map(function (r) { return r.age; }));
    const aptMode = modeOf(rows.map(function (r) { return r.rangingApt; }));
    const potMode = modeOf(rows.map(function (r) { return r.potential; }));
    const scoreMode = modeOf(rows.map(function (r) { return r.score; }));
    villagers.push({ vid: vid, days: rows.length,
      modalProfile: profMode.value, profileTally: profMode.tally,
      modalTemper: temperMode.value, modalGoal: goalMode.value,
      modalAge: (ageMode.value == null ? null : Number(ageMode.value)),
      modalRangingApt: (aptMode.value == null ? null : Number(aptMode.value)),
      modalPotential: potMode.value === 'true',
      modalScore: (scoreMode.value == null ? null : Number(scoreMode.value)),
      scoreParts: scorePartsBreakdown({ temper: temperMode.value, goal: goalMode.value,
        age: (ageMode.value == null ? 35 : Number(ageMode.value)),
        rangingApt: (aptMode.value == null ? 0 : Number(aptMode.value)),
        potential: potMode.value === 'true' }) });
  }
  const rangers = villagers.filter(function (v) { return isRanger(v.modalProfile); });
  const rangerDays = census.filter(function (r) { return isRanger(r.profile); }).length;
  const modalProfileTally = modeOf(villagers.map(function (v) { return v.modalProfile; }));

  // Engagement: village-level heard (any day slainN > 0) or any
  // ranger personally fought (foughtN > 0 on a ranger census row).
  let heardEver = false, heardFirstDay = null;
  for (const row of village) {
    if ((row.slainN | 0) > 0) { heardEver = true; if (heardFirstDay == null) heardFirstDay = row.day; break; }
  }
  let foughtEver = false, foughtMax = 0, foughtFirstDay = null;
  for (const r of census) {
    if (!isRanger(r.profile)) continue;
    if ((r.foughtN | 0) > foughtMax) foughtMax = r.foughtN | 0;
    if ((r.foughtN | 0) > 0) { foughtEver = true; if (foughtFirstDay == null || r.day < foughtFirstDay) foughtFirstDay = r.day; }
  }
  const engagedEver = heardEver || foughtEver;

  // Ranger havenTick calls + call-outcome distribution (all calls).
  const rangerCalls = calls.filter(function (c) { return isRanger(c.profile); });
  const callOutcomes = {};
  for (const c of calls) callOutcomes[c.outcome] = (callOutcomes[c.outcome] || 0) + 1;
  const unexplainedCalls = calls.filter(function (c) { return c.outcome === 'unexplained-call'; });
  const nullTickCalls = calls.filter(function (c) { return c.tick == null; });

  // Ranger-tick first-fail distribution (tickGateTotals summed over
  // modal-ranger vids; 'reached' is not a fail bucket and is reported
  // separately, with the explained mid-tick companion departures).
  const rangerBucketDist = {};
  let rangerReachedTicks = 0;
  for (const v of rangers) {
    const t = totals[v.vid] || {};
    for (const b of Object.keys(t)) {
      if (b === 'reached') { rangerReachedTicks += t[b]; continue; }
      rangerBucketDist[b] = (rangerBucketDist[b] || 0) + t[b];
    }
  }
  let modalBucket = null, modalBucketN = -1;
  for (const b of Object.keys(rangerBucketDist)) {
    if (rangerBucketDist[b] > modalBucketN) { modalBucket = b; modalBucketN = rangerBucketDist[b]; }
  }
  let modalOutcome = null, modalOutcomeN = -1;
  for (const o of Object.keys(callOutcomes)) {
    if (callOutcomes[o] > modalOutcomeN) { modalOutcome = o; modalOutcomeN = callOutcomes[o]; }
  }
  const explainedMidTick = [];
  for (const chk of checks) for (const e of (chk.explained || [])) explainedMidTick.push({ tick: chk.tick, day: chk.day, vid: e.vid, reason: e.reason });

  // ---- Store-initializer diagnostic (NOT a taxonomy row — the
  // frozen taxonomy has no row for it; this detail only explains an
  // 'unexplained' village after the fact) ----
  // v.winPlan is lazily initialized by stateOf (win-plan.js:93),
  // called by winPlanSeedFromFight / winPlanNoteKill /
  // winPlanFightGate-bump / winPlanOf / winPlanStats. winPlanHavenTick
  // itself reads v.winPlan directly and returns null when it is
  // absent — it can NEVER be the first spark. Observable initializer
  // events in the corpus: a wave-3+ seed row (seed call -> stateOf),
  // an expedition kill (winPlanNoteKill -> stateOf; waveKillLog via
  // 'agency'), a fight-gate avoid (seed/bump -> stateOf), or a
  // bonds/muster bump (winPlanStats counters). A village with none
  // of these before a ranger+engaged havenTick call has a store that
  // never existed — the call cannot create, whatever the profile,
  // Haven presence, or engagement says.
  let finalKillLog = [];
  try {
    const last = (j.daily || []).slice(-1)[0];
    if (last && last.waveKillLog) finalKillLog = last.waveKillLog;
  } catch (e) {}
  function minDayOf(rows, key) {
    let d = null;
    for (const r of rows) { const dd = (r[key] | 0); if (d == null || dd < d) d = dd; }
    return d;
  }
  const seedRowsW3 = (j.v4seeds || []).filter(function (s) { return (s.wave | 0) >= 3; });
  const gateAvoids = (j.v4gates || []).filter(function (g) { return g.result === 'avoid'; });
  const agencyKills = finalKillLog.filter(function (e) { return e && e.via === 'agency'; });
  const stats = j.winPlanStats || {};
  const firstSeedRowDay = minDayOf(seedRowsW3, 'day');
  const firstAgencyKillDay = minDayOf(agencyKills, 'd');
  const firstGateAvoidDay = minDayOf(gateAvoids, 'day');
  const firstInitializerDay = (function () {
    let d = null;
    for (const x of [firstSeedRowDay, firstAgencyKillDay, firstGateAvoidDay]) {
      if (x != null && (d == null || x < d)) d = x;
    }
    return d;
  })();
  const initializers = { seedRowsW3: seedRowsW3.length, firstSeedRowDay: firstSeedRowDay,
    agencyKills: agencyKills.length, firstAgencyKillDay: firstAgencyKillDay,
    gateAvoids: gateAvoids.length, firstGateAvoidDay: firstGateAvoidDay,
    bondTends: stats.bondTends || 0, musterStanddowns: stats.musterStanddowns || 0,
    firstInitializerDay: firstInitializerDay,
    storeEverInitialized: firstInitializerDay != null || creates.length > 0 };

  // ---- Frozen taxonomy, first match wins ----
  let blocker = null, subBlocker = null, detail = {};
  if (!noPlan) {
    blocker = 'ignited';
    let first = null;
    for (const c of creates) if (!first || c.day < first.day) first = c;
    detail = { firstCreationDay: first ? first.day : null,
      firstCreator: first ? first.creator : null, firstSource: first ? (first.source || null) : null,
      firstVid: first ? first.vid : null, totalCreates: creates.length,
      rangerCalls: rangerCalls.length, totalCalls: calls.length,
      initializers: initializers,
      // The store must exist before the first creation can happen:
      // the first creation day must be on/after the first
      // initializer day (same-day is possible — the initializer and
      // the creation can share a tick).
      firstCreationOnOrAfterInitializer: first && firstInitializerDay != null ? first.day >= firstInitializerDay : null };
  } else if (rangerDays === 0) {
    blocker = 'no-ranger';
    subBlocker = null;
    detail = { modalProfile: modalProfileTally.value, modalProfileTally: modalProfileTally.tally,
      villagers: villagers.map(function (v) {
        return { vid: v.vid, profile: v.modalProfile, score: v.modalScore,
          temper: v.modalTemper, goal: v.modalGoal, age: v.modalAge,
          rangingApt: v.modalRangingApt, potential: v.modalPotential, parts: v.scoreParts };
      }) };
  } else if (!engagedEver) {
    blocker = 'no-engagement';
    subBlocker = null;
    detail = { rangers: rangers.length, rangerDays: rangerDays,
      heardFirstDay: heardFirstDay, foughtMax: foughtMax, foughtFirstDay: foughtFirstDay,
      rangerVids: rangers.map(function (v) { return v.vid; }) };
  } else if (rangerCalls.length === 0) {
    blocker = 'ranger-never-reaches-haventick';
    subBlocker = modalBucket;
    detail = { rangers: rangers.length, rangerDays: rangerDays,
      heardFirstDay: heardFirstDay, foughtFirstDay: foughtFirstDay,
      rangerBucketDist: rangerBucketDist, rangerReachedTicks: rangerReachedTicks,
      explainedMidTick: explainedMidTick,
      rangerVids: rangers.map(function (v) { return v.vid; }) };
  } else {
    // havenTickCalls for rangers exist but zero creations.
    if (unexplainedCalls.length) {
      blocker = 'unexplained';
      subBlocker = 'unexplained-call';
      detail = { rangerCalls: rangerCalls.length, totalCalls: calls.length,
        callOutcomes: callOutcomes, unexplainedCalls: unexplainedCalls,
        initializers: initializers };
    } else {
      blocker = 'haventick-called-no-create';
      subBlocker = modalOutcome;
      detail = { rangerCalls: rangerCalls.length, totalCalls: calls.length,
        callOutcomes: callOutcomes, rangerCallDays: rangerCalls.map(function (c) { return c.day; }) };
    }
  }

  const mismatches = checks.filter(function (c) { return !c.match; });
  return {
    seed: seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: j.won, maxWave: j.maxWave,
    villageLost: j.villageLost,
    noPlan: noPlan, blocker: blocker, subBlocker: subBlocker, detail: detail,
    creates: creates.length, havenTickCalls: calls.length, rangerCalls: rangerCalls.length,
    rangerDays: rangerDays, rangers: rangers.length, villagers: villagers.length,
    heardEver: heardEver, heardFirstDay: heardFirstDay,
    foughtEver: foughtEver, foughtMax: foughtMax,
    engagedEver: engagedEver,
    callOutcomes: callOutcomes, unexplainedCalls: unexplainedCalls.length,
    nullTickCalls: nullTickCalls.length,
    tickGateChecks: checks.length, tickGateMismatches: mismatches.length,
    mismatchList: mismatches.slice(0, 5),
    instrumentErrors: (j.instrumentErrors || []).length,
    holdersWithoutCreation: (base.holdersWithoutCreation || []).length,
    censusRowWithoutEpisodeUnexplained: ((base.censusRowWithoutEpisodeCauses || {}).unexplained || 0),
  };
}

function main() {
  const controlDir = process.argv[2];
  if (!controlDir) { console.error('PLANIGNITE ANALYZE STOP: controlDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'].sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const ctrl = loadDir(controlDir);
  const perSeed = [];
  let noPlanSeeds = 0, unclassified = 0, unexplainedVillages = 0;
  let totalMismatches = 0, totalInstrumentErrors = 0, totalUnexplainedCalls = 0, totalNullTicks = 0;
  let totalHoldersNoCreate = 0, totalCensusUnexplained = 0;
  const blockerTally = {};
  const classificationTable = [];
  for (const k of Object.keys(ctrl.bySeed).sort()) {
    const j = ctrl.bySeed[k];
    const base = HAVEN.classifyHavenTick(j);
    const c = classifyIgnition(j, base);
    perSeed.push(c);
    blockerTally[c.blocker] = (blockerTally[c.blocker] || 0) + 1;
    if (c.noPlan) {
      noPlanSeeds++;
      if (c.blocker === 'unexplained') { unexplainedVillages++; unclassified++; }
      else if (!c.blocker) unclassified++;
    }
    totalMismatches += c.tickGateMismatches;
    totalInstrumentErrors += c.instrumentErrors;
    totalUnexplainedCalls += c.unexplainedCalls;
    totalNullTicks += c.nullTickCalls;
    totalHoldersNoCreate += c.holdersWithoutCreation;
    totalCensusUnexplained += c.censusRowWithoutEpisodeUnexplained;
    classificationTable.push({ seed: c.seed, noPlan: c.noPlan, blocker: c.blocker,
      subBlocker: c.subBlocker, days: c.gameDays, standing: c.standing,
      scaleRank: c.scaleRank, creates: c.creates, rangerCalls: c.rangerCalls,
      rangerDays: c.rangerDays, heardFirstDay: c.heardFirstDay });
  }
  // Wall numbers via the haventick summary (same corpora).
  const leg = { bySeed: {}, files: ctrl.files };
  for (const k of Object.keys(ctrl.bySeed).sort()) leg.bySeed[k] = HAVEN.classifyHavenTick(ctrl.bySeed[k]);
  const summary = HAVEN.summarizeHavenTick(leg);
  const wall = summary.wall;
  const medianSurvival = summary.medianSurvival;

  const bar1 = unclassified === 0 && unexplainedVillages === 0;
  const bar2 = ctrl.files.length === 8;
  const bar5 = totalMismatches === 0;
  const bar6 = totalHoldersNoCreate === 0;
  const bar7 = !!(wall && typeof wall.nationalByStanding === 'number' && typeof wall.nationalByRank === 'number' &&
    typeof wall.table === 'number' && typeof wall.wins === 'number');

  const out = {
    arm: 'planignite-a', run: 'planignite-a',
    controlDir: path.basename(controlDir),
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    classificationTable: classificationTable,
    blockerTally: blockerTally,
    noPlanSeeds: noPlanSeeds, unclassified: unclassified, unexplainedVillages: unexplainedVillages,
    perSeed: perSeed,
    wall: wall, medianSurvival: medianSurvival,
    tickGateMismatches: totalMismatches,
    instrumentErrors: totalInstrumentErrors,
    unexplainedCalls: totalUnexplainedCalls,
    nullTickCalls: totalNullTicks,
    holdersWithoutCreation: totalHoldersNoCreate,
    censusRowWithoutEpisodeUnexplained: totalCensusUnexplained,
    bars: {
      classificationCoverage: { pass: bar1, noPlanSeeds: noPlanSeeds, unclassified: unclassified, unexplainedVillages: unexplainedVillages },
      corpus: { pass: bar2, files: ctrl.files.length },
      tickGateReplica: { pass: bar5, mismatches: totalMismatches },
      creationLedger: { pass: bar6, holdersWithoutCreation: totalHoldersNoCreate, censusUnexplained: totalCensusUnexplained },
      wallReported: { pass: bar7, wall: wall, medianSurvival: medianSurvival },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'planignite-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== planignite-a control leg ===');
  console.log('seeds: ' + ctrl.files.length + '  no-plan villages: ' + noPlanSeeds +
    '  blocker tally: ' + JSON.stringify(blockerTally));
  for (const row of classificationTable) {
    console.log('  seed ' + row.seed + ': ' + (row.noPlan ? 'NO-PLAN' : 'ignited') +
      ' blocker=' + row.blocker + (row.subBlocker ? ' / ' + row.subBlocker : '') +
      ' creates=' + row.creates + ' rangerCalls=' + row.rangerCalls +
      ' rangerDays=' + row.rangerDays + ' heardFirstDay=' + row.heardFirstDay +
      ' days=' + row.days + ' standing=' + row.standing + ' rank=' + row.scaleRank);
  }
  console.log('tick-gate mismatches: ' + totalMismatches + '  instrument errors: ' + totalInstrumentErrors +
    '  unexplained calls: ' + totalUnexplainedCalls + '  null-tick calls: ' + totalNullTicks);
  console.log('ledger: holdersWithoutCreation=' + totalHoldersNoCreate +
    ' censusUnexplained=' + totalCensusUnexplained);
  console.log('wall: ' + JSON.stringify(wall) + '  medianSurvival: ' + medianSurvival);
  console.log('bars: coverage=' + (bar1 ? 'PASS' : 'FAIL') + ' corpus=' + (bar2 ? 'PASS' : 'FAIL') +
    ' tickGate=' + (bar5 ? 'PASS' : 'FAIL') + ' ledger=' + (bar6 ? 'PASS' : 'FAIL') +
    ' wall=' + (bar7 ? 'PASS' : 'FAIL') + ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar5 || !bar6 || !bar7 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyIgnition: classifyIgnition, scorePartsBreakdown: scorePartsBreakdown, RANGER_PROFILES: RANGER_PROFILES };
