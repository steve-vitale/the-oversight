// analyze-launchsilence-a.js — first-fail classifier + band summary for
// arm sim-launchsilence-a (the launch funnel's silence).
//
// Reads per-seed corpora written by scripts/launchsilence-driver-a.js
// (evidence/2026-11-23/perseed-launchsilence-a-ctl/) and, for every
// village that launches nothing wave-4+ in 150 days, names its
// FIRST-FAIL stage from the frozen taxonomy in
// evidence/2026-11-23/sim-launchsilence-a-prereg.md §5 (evaluated in
// order, first match wins; the terminal hold names the fail when
// several holds occur, with the full hold-cause history recorded).
//
// A "launch" is a v4departs row with result 'launch' for a wave-4+
// plan (targetWave >= 4 or target in the wave-4+ roster from
// src/data/monsters.json, re-read live).
//
// Usage:
//   node scripts/analyze-launchsilence-a.js [--dir <corpus-dir>]
//       [--out <analysis.json>] [--selftest] [--diff <dirA> <dirB>]
//   --selftest runs the built-in fixture suite (one synthetic corpus
//   per taxonomy row + missing-stream + determinism checks) and exits
//   non-zero on any failure. --diff compares two corpus dirs seed by
//   seed on (firstFail, launches) for the determinism check.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const FIRST_FAILS = ['village-lost-before-launch', 'gate-says-wait', 'no-plan-created',
  'plan-never-ignites', 'no-target', 'no-companions-available', 'holder-blocked',
  'other', 'unclassified'];

function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return []; }
}
const W4P_SET = new Set(loadWave4pIds());

function isW4pRow(r) {
  if (!r) return false;
  if ((r.targetWave | 0) >= 4) return true;
  if ((r.needWave | 0) >= 4) return true;
  return !!(r.target && W4P_SET.has(r.target));
}
function isW4pPlan(p) {
  if (!p) return false;
  if ((p.needWave | 0) >= 4) return true;
  return !!(p.target && W4P_SET.has(p.target));
}

// resolveW4pDepart(seed, row): is this depart row for a wave-4+
// plan? Primary: the row's own target/targetWave (the driver reads
// the plan BEFORE the call since the 2026-11-23 fix, so these are
// set). Fallback for v1 corpora, where the brain wrap read the plan
// AFTER the call and the target came back null (pilot seeds 107519
// d90 / 107522 d45: a homebody-handoff launch recorded with target
// null while the party went out and fought): join the dawn score for
// the same vid + day + committed action (the execute consumes the
// dawn commit, so the same action that day is the same plan), then
// the planCensus for the same vid that day, then any census row that
// day whose party includes the vid.
function resolveW4pDepart(seed, row) {
  if (isW4pRow(row)) return true;
  if (!row || !row.vid || row.day == null) return false;
  for (const s of (seed.dawnbidScores || [])) {
    if (s.day !== row.day || s.vid !== row.vid) continue;
    if (!s.plan || (s.plan.needWave | 0) < 4) continue;
    if (row.winPlanAction && s.commit && s.commit.winPlanAction && s.commit.winPlanAction !== row.winPlanAction) continue;
    return true;
  }
  for (const c of (seed.planCensus || [])) {
    if (c.day !== row.day || (c.needWave | 0) < 4) continue;
    if (c.vid === row.vid) return true;
    if (Array.isArray(c.party) && c.party.indexOf(row.vid) !== -1) return true;
  }
  return false;
}

// countLaunches(seed): distinct wave-4+ launch events. A brain-path
// launch is recorded in BOTH v4departs and dawnbidDeparts (same call),
// so dedupe by (vid, day) — one execute per vid per day.
function countLaunches(seed) {
  const seen = {};
  let n = 0;
  function add(row) {
    const k = row.vid + '|' + row.day;
    if (!seen[k]) { seen[k] = true; n++; }
  }
  for (const r of (seed.v4departs || [])) if (r.result === 'launch' && resolveW4pDepart(seed, r)) add(r);
  for (const r of (seed.dawnbidDeparts || [])) if (r.result === 'launch' && resolveW4pDepart(seed, r)) add(r);
  return n;
}

// maxWaveReached(seed): the highest wave the village ever unlocked
// (result.maxWaveUnlocked first; else the max unlockedWave in the
// funnelStage rows; else the final unlockedWave).
function maxWaveReached(seed) {
  if (seed.maxWave != null) return seed.maxWave | 0;
  let m = 0;
  for (const r of (seed.funnelStage || [])) if ((r.unlockedWave | 0) > m) m = r.unlockedWave | 0;
  if (m > 0) return m;
  if (seed.unlockedWave != null) return seed.unlockedWave | 0;
  return null;
}

function hasPlanW4(seed) {
  for (const c of (seed.v4creates || [])) if (isW4pRow(c)) return true;
  for (const c of (seed.planCensus || [])) if (isW4pPlan(c)) return true;
  for (const r of (seed.funnelStage || [])) if ((r.nPlansW4 | 0) > 0) return true;
  return false;
}

// consideredEver(seed): a dawnbidScores row for a wave-4+ plan holder
// carrying a winPlanAction candidate (the scorer offered a launch).
function consideredEver(seed) {
  for (const r of (seed.dawnbidScores || [])) {
    if (!r.plan || (r.plan.needWave | 0) < 4) continue;
    for (const c of (r.cands || [])) if (c && c.winPlanAction) return true;
  }
  return false;
}

function igniteDetail(seed) {
  const scores = seed.dawnbidScores || [];
  let offered = false, picked = false;
  for (const r of scores) {
    if (!r.plan || (r.plan.needWave | 0) < 4) continue;
    for (const c of (r.cands || [])) {
      if (c && c.winPlanAction) {
        offered = true;
        if (c.winPlanAction === 'party_launch') {
          // offered as a candidate; picked only if the commit says so
        }
      }
    }
    if (r.commit && r.commit.winPlanAction === 'party_launch') picked = true;
  }
  if (!offered) {
    // Was the holder ever at Haven to be asked? A holder with zero
    // havenTick calls after the plan's creation never got the call.
    const creates = (seed.v4creates || []).filter(isW4pRow);
    if (creates.length) {
      const first = creates[0];
      const calls = (seed.havenTickCalls || []).filter(function (r) { return r.vid === first.vid && r.day >= first.day; });
      if (calls.length === 0) return 'never-offered; holder ' + first.vid + ' never reached a Haven tick after creation (d' + first.day + ')';
    }
    return 'never-offered';
  }
  if (!picked) return 'offered-never-picked';
  return 'offered-and-picked-but-no-depart-call';
}

// holdCause(seed, row): the cause of one wave-4+ hold row, in the
// code order of winPlanDepart (gear -> dead-target -> findCompanion
// -> companionLaunchable -> holder startExpedition), with the
// veteran-guard as the fallback label for a table-stage hold when no
// underlying evidence names a cause. Returns {kind, detail} where
// kind is one of: holder-gear, dead-target, no-companion,
// companion-blocked, holder-block, veteran-guard, unknown,
// unclassified (a hold-evidence stream is missing).
function holdCause(seed, row) {
  if (!Array.isArray(seed.deadTargetChecks) || !Array.isArray(seed.companionPool) ||
      !Array.isArray(seed.dawnbidDeparts) || !Array.isArray(seed.igniteCensus)) {
    const missing = [];
    if (!Array.isArray(seed.deadTargetChecks)) missing.push('deadTargetChecks');
    if (!Array.isArray(seed.companionPool)) missing.push('companionPool');
    if (!Array.isArray(seed.dawnbidDeparts)) missing.push('dawnbidDeparts');
    if (!Array.isArray(seed.igniteCensus)) missing.push('igniteCensus');
    return { kind: 'unclassified', detail: 'missing hold-evidence stream(s): ' + missing.join(', ') };
  }
  // 1. Gear stage: holder unarmed AND unarmored (winPlanDepart gear
  // check runs before anything else).
  if (row.stageBefore === 'gear' && row.holderArmed === false && row.holderArmored === false) {
    return { kind: 'holder-gear', detail: 'gear-stage hold d' + row.day + ': holder unarmed+unarmored' };
  }
  // 2. Dead target held on the same day for the same holder
  // (winPlanCommitDeadTarget runs before launchParty).
  for (const dt of seed.deadTargetChecks) {
    if (dt.day === row.day && dt.vid === row.vid && dt.result === 'held') {
      return { kind: 'dead-target', detail: 'dead-target held d' + row.day + ' (target ' + (dt.targetBefore || '?') + ')' };
    }
  }
  // 3. No companion: the dawn pool that day has zero eligible, or —
  // when no pool row exists for the day (e.g. a wave-5 plan, for
  // which the pool wrap does not fire) — the ignite census shows
  // zero ranger-profile villagers at Haven and free that day. The
  // census count is an UPPER bound (it ignores trust/engaged), so a
  // zero there means no companion existed.
  const pools = seed.companionPool.filter(function (r) { return r.day === row.day && r.vid === row.vid; });
  if (pools.length) {
    const last = pools[pools.length - 1];
    if (last.counts && (last.counts.eligible | 0) === 0) {
      return { kind: 'no-companion', detail: 'companionPool eligible 0 d' + row.day + ' (roster ' + (last.rosterN | 0) + ')' };
    }
  } else {
    let freeRangers = 0;
    for (const r of seed.igniteCensus) {
      if (r.day !== row.day || r.vid === row.vid) continue;
      if ((r.profile === 'wanderer' || r.profile === 'explorer') && r.atHaven && !r.onExped) freeRangers++;
    }
    const censusDays = seed.igniteCensus.some(function (r) { return r.day === row.day; });
    if (censusDays && freeRangers === 0) {
      return { kind: 'no-companion', detail: 'igniteCensus free rangers 0 d' + row.day + ' (no pool row; wave-5 plan)' };
    }
  }
  // 4. Companion blocked (brain path: the picked companion could
  // not launch — companionLaunchable failed for them).
  for (const b of seed.dawnbidDeparts) {
    if (b.day === row.day && b.vid === row.vid && b.companionBlock) {
      return { kind: 'companion-blocked', detail: 'brain companionBlock ' + b.companionBlock + ' d' + row.day };
    }
  }
  // 5. Holder blocked (the wrap's pre-call deriveLaunchBlock read,
  // or the brain path's vidBlock): sick / range-0 /
  // hurt-no-medicine-no-healer.
  if (row.holderBlock) {
    return { kind: 'holder-block', detail: 'holder launch-block ' + row.holderBlock + ' d' + row.day };
  }
  for (const b of seed.dawnbidDeparts) {
    if (b.day === row.day && b.vid === row.vid && b.vidBlock) {
      return { kind: 'holder-block', detail: 'brain vidBlock ' + b.vidBlock + ' d' + row.day };
    }
  }
  // 6. Veteran guard: a table-stage hold with no underlying cause
  // named above (the guard is what keeps the plan from going
  // 'normal' after launchParty fails).
  if (row.stageBefore === 'table') {
    return { kind: 'veteran-guard', detail: 'table-stage hold d' + row.day + ' (veteran guard; no underlying cause in evidence)' };
  }
  return { kind: 'unknown', detail: 'hold d' + row.day + ' stageBefore ' + (row.stageBefore || '?') + ': no dead-target, no block, pool eligible>0 or absent' };
}

function holdHistory(seed, holds) {
  const counts = {};
  for (const h of holds) {
    const c = holdCause(seed, h);
    counts[c.kind] = (counts[c.kind] || 0) + 1;
  }
  return counts;
}

function unclassified(detail) {
  return { firstFail: 'unclassified', detail: detail, holdHistory: {} };
}

// classifyFirstFail(seed): the frozen §5 taxonomy. Returns
// {firstFail, detail, holdHistory, launches, maxStage}.
function classifyFirstFail(seed) {
  const departs = Array.isArray(seed.v4departs) ? seed.v4departs : null;
  const launches = countLaunches(seed);
  if (launches > 0) {
    return { firstFail: 'launched', detail: launches + ' wave-4+ launch(es)', holdHistory: {}, launches: launches, maxStage: 4 };
  }
  const mw = maxWaveReached(seed);
  const lost = !!seed.villageLost;
  const lostDay = seed.funnelVillage ? seed.funnelVillage.lostDay : null;
  // 1. Village lost before the funnel's prerequisites existed.
  if (lost && mw != null && mw < 3) {
    return { firstFail: 'village-lost-before-launch', detail: 'lost d' + (lostDay != null ? lostDay : '?') + ', maxWave ' + mw, holdHistory: {}, launches: 0, maxStage: 0 };
  }
  // 2. The wave-4 door never opened.
  if (mw != null && mw < 4) {
    let ready = '';
    try { ready = ' ready4=' + JSON.stringify(seed.ready4).slice(0, 160); } catch (e) {}
    return { firstFail: 'gate-says-wait', detail: 'maxWave ' + mw + ', standing ' + (seed.standing != null ? seed.standing : '?') + (lost ? ', lost d' + (lostDay != null ? lostDay : '?') : ', survived') + ready, holdHistory: {}, launches: 0, maxStage: 0 };
  }
  if (mw == null) return unclassified('maxWave unknown (no maxWave / funnelStage / unlockedWave)');
  // 3. Door open, no plan ever formed.
  if (!hasPlanW4(seed)) {
    return { firstFail: 'no-plan-created', detail: 'maxWave ' + mw + ' but no wave-4+ plan in v4creates/planCensus/funnelStage', holdHistory: {}, launches: 0, maxStage: 0 };
  }
  if (!departs || !Array.isArray(seed.dawnbidScores)) {
    return unclassified('missing stream(s): ' + (!departs ? 'v4departs ' : '') + (!Array.isArray(seed.dawnbidScores) ? 'dawnbidScores' : ''));
  }
  const attempts = departs.filter(function (r) { return resolveW4pDepart(seed, r); });
  const considered = consideredEver(seed);
  // 4. Plan exists, never became a depart attempt. The detail
  // distinguishes whether the dawn scorer ever offered a launch:
  // never-offered / offered-never-picked / holder-never-at-haven
  // (prereg §5 stage 4 detail list). The one sub-case that is NOT
  // stage 4: offered AND picked, but no depart call ever recorded —
  // the plan was picked for launch and the call returned 'normal'
  // (brain path) or never ran; that is the residual bucket, with
  // the brain-path normals as evidence.
  if (attempts.length === 0) {
    const det = igniteDetail(seed);
    if (det.indexOf('offered-and-picked') === 0) {
      const expired = (seed.deadTargetChecks || []).filter(function (r) { return r.result === 'expired'; });
      if (expired.length) {
        return { firstFail: 'no-target', detail: 'considered-never-attempted; dead-target expired x' + expired.length, holdHistory: {}, launches: 0, maxStage: 2 };
      }
      // Brain 'normal' returns scoped to wave-4+ plans: the unscoped
      // count is polluted by low-wave plans (pilot seed 107519 v1:
      // 23 normals, all low-wave). Name the picked plan, so the
      // residual says which plan was picked and never departed.
      const allNormals = (seed.dawnbidDeparts || []).filter(function (r) { return r.winPlanAction === 'party_launch' && r.result === 'normal'; });
      const brainNormals = allNormals.filter(function (r) { return resolveW4pDepart(seed, r); });
      let pickedPlan = '?';
      for (const r of (seed.dawnbidScores || [])) {
        if (r.plan && (r.plan.needWave | 0) >= 4 && r.commit && r.commit.winPlanAction === 'party_launch') {
          pickedPlan = (r.plan.target || '?') + ' d' + r.day + ' (' + r.vid + ')';
          break;
        }
      }
      return { firstFail: 'other', detail: 'considered-never-attempted: picked ' + pickedPlan + '; ' + brainNormals.length + ' wave-4+ brain normal return(s), 0 depart rows, no expired rows (' + allNormals.length + ' brain normals total, all low-wave plans: ' + (allNormals.length - brainNormals.length) + ')', holdHistory: {}, launches: 0, maxStage: 2 };
    }
    return { firstFail: 'plan-never-ignites', detail: det, holdHistory: {}, launches: 0, maxStage: considered ? 2 : 1 };
  }
  const holds = attempts.filter(function (r) { return r.result === 'hold'; });
  // Attempts exist but every one ended 'normal' (wait expired /
  // target expired) with no hold rows at all.
  if (holds.length === 0) {
    const expired = (seed.deadTargetChecks || []).filter(function (r) { return r.result === 'expired'; });
    if (expired.length) {
      return { firstFail: 'no-target', detail: 'attempts ended on normal returns only (' + attempts.length + ' rows); dead-target expired x' + expired.length, holdHistory: {}, launches: 0, maxStage: 3 };
    }
    return { firstFail: 'other', detail: 'attempts ended on normal returns only (' + attempts.length + ' rows, 0 holds, 0 launches), no expired rows', holdHistory: {}, launches: 0, maxStage: 3 };
  }
  // 5–7. Terminal hold names the fail (the block that persisted).
  const terminal = holds[holds.length - 1];
  const cause = holdCause(seed, terminal);
  const history = holdHistory(seed, holds);
  if (cause.kind === 'unclassified') {
    return { firstFail: 'unclassified', detail: cause.detail, holdHistory: history, launches: 0, maxStage: 3 };
  }
  if (cause.kind === 'dead-target') {
    return { firstFail: 'no-target', detail: cause.detail, holdHistory: history, launches: 0, maxStage: 3 };
  }
  if (cause.kind === 'no-companion' || cause.kind === 'companion-blocked') {
    return { firstFail: 'no-companions-available', detail: cause.detail, holdHistory: history, launches: 0, maxStage: 3 };
  }
  if (cause.kind === 'holder-gear' || cause.kind === 'holder-block' || cause.kind === 'veteran-guard') {
    return { firstFail: 'holder-blocked', detail: cause.detail, holdHistory: history, launches: 0, maxStage: 3 };
  }
  return { firstFail: 'other', detail: cause.detail, holdHistory: history, launches: 0, maxStage: 3 };
}

// Derived max stage (0–4) from the event streams, for the
// funnelStage cross-check: 0 no-plan / 1 plan-exists / 2 considered /
// 3 attempted / 4 launched.
function derivedMaxStage(seed) {
  const departs = seed.v4departs || [];
  if (countLaunches(seed) > 0) return 4;
  if (departs.some(function (r) { return resolveW4pDepart(seed, r); })) return 3;
  if (consideredEver(seed)) return 2;
  if (hasPlanW4(seed)) return 1;
  return 0;
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  let instrumentErrors = 0;
  let tickMismatches = 0;
  for (const f of files) {
    const seed = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const c = classifyFirstFail(seed);
    const errs = (seed.instrumentErrors || []).length;
    instrumentErrors += errs;
    const mism = (seed.tickGateChecks || []).filter(function (x) { return !x.match; }).length;
    tickMismatches += mism;
    const funnelMax = seed.funnelVillage ? seed.funnelVillage.maxStage : null;
    const derived = derivedMaxStage(seed);
    perSeed.push({
      seed: seed.seed, file: f,
      launches: c.launches, maxStage: c.maxStage, derivedMaxStage: derived,
      funnelMaxStage: funnelMax, funnelAgrees: funnelMax == null ? null : (funnelMax === derived),
      firstFail: c.firstFail, detail: c.detail, holdHistory: c.holdHistory,
      days: seed.days, gameDays: seed.gameDays, endReason: seed.endReason,
      villageLost: !!seed.villageLost, lostDay: seed.funnelVillage ? seed.funnelVillage.lostDay : null,
      maxWave: maxWaveReached(seed), standing: seed.standing, scaleRank: seed.scaleRank,
      won: !!seed.won, deaths: (seed.deaths || []).length,
      starvationDeaths: (seed.deaths || []).filter(function (d) { return /starv/i.test((d.cause || '') + ' ' + (d.kind || '')); }).length,
      instrumentErrors: errs, tickGateMismatches: mism,
    });
  }
  const nonLaunchers = perSeed.filter(function (p) { return p.launches === 0; });
  const named = nonLaunchers.filter(function (p) { return p.firstFail !== 'unclassified'; });
  const stageCounts = {};
  for (const f of FIRST_FAILS) stageCounts[f] = 0;
  for (const p of nonLaunchers) stageCounts[p.firstFail] = (stageCounts[p.firstFail] || 0) + 1;
  const surv = perSeed.map(function (p) { return p.days; }).sort(function (a, b) { return a - b; });
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  const wall = {
    wins: perSeed.filter(function (p) { return p.won; }).length,
    national: perSeed.filter(function (p) { return p.scaleRank === 'national' || p.scaleRank === 'global'; }).length,
    table: 0, // the table seat is not in the per-seed corpus; counted from evidence, see below
    wave5: perSeed.filter(function (p) { return (p.maxWave | 0) >= 5; }).length,
    wave4: perSeed.filter(function (p) { return (p.maxWave | 0) >= 4; }).length,
    medianSurvival: median, maxSurvival: surv.length ? surv[surv.length - 1] : null,
    villagesLost: perSeed.filter(function (p) { return p.villageLost; }).length,
    totalDeaths: perSeed.reduce(function (a, p) { return a + p.deaths; }, 0),
  };
  return {
    arm: 'launchsilence-a', dir: dir, seeds: perSeed.length,
    launchesTotal: perSeed.reduce(function (a, p) { return a + p.launches; }, 0),
    launchingSeeds: perSeed.filter(function (p) { return p.launches > 0; }).length,
    nonLaunchingSeeds: nonLaunchers.length,
    classified: named.length,
    classifiedShare: nonLaunchers.length ? named.length / nonLaunchers.length : 1,
    unclassified: nonLaunchers.length - named.length,
    other: stageCounts.other || 0,
    stageCounts: stageCounts,
    funnelAgreesAll: perSeed.every(function (p) { return p.funnelAgrees !== false; }),
    instrumentErrors: instrumentErrors, tickGateMismatches: tickMismatches,
    wall: wall, perSeed: perSeed,
  };
}

// ---- selftest: one synthetic corpus per taxonomy row ----
function synthBase(over) {
  const b = {
    seed: 999001, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', ready4: { short: [] },
    v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null },
  };
  if (over) for (const k in over) b[k] = over[k];
  return b;
}
function w4create(day, vid) {
  return { day: day, vid: vid, creator: 'havenTick', source: 'lived', profile: 'wanderer', stageAfter: 'party', target: 'eater', needWave: 4, foughtN: 1, slainN: 0, caller: null };
}
function selftest() {
  let pass = 0, fail = 0;
  const failures = [];
  function check(name, cond, detail) {
    if (cond) pass++;
    else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
  }
  // 1. launched (excluded from the non-launcher set)
  let c = classifyFirstFail(synthBase({ maxWave: 4, v4departs: [{ day: 90, vid: 'a', source: 'winPlanDepart', result: 'launch', stageBefore: 'party', target: 'eater', targetWave: 4 }] }));
  check('launched seed classifies launched', c.firstFail === 'launched' && c.launches === 1, JSON.stringify(c));
  // 2. village-lost-before-launch (lost, maxWave 2)
  c = classifyFirstFail(synthBase({ maxWave: 2, villageLost: true, days: 40, funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: 40 } }));
  check('lost before wave 3 -> village-lost-before-launch', c.firstFail === 'village-lost-before-launch', JSON.stringify(c));
  // 3. gate-says-wait (survived 150d, maxWave 3)
  c = classifyFirstFail(synthBase({ maxWave: 3, standing: 85, ready4: { short: ['veterans'] } }));
  check('maxWave 3 survived -> gate-says-wait', c.firstFail === 'gate-says-wait', JSON.stringify(c));
  // 4. no-plan-created (door open, no plan anywhere)
  c = classifyFirstFail(synthBase({ maxWave: 4, standing: 120 }));
  check('door open, no plan -> no-plan-created', c.firstFail === 'no-plan-created', JSON.stringify(c));
  // 5. plan-never-ignites, never-offered
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    planCensus: [{ day: 60, vid: 'a', target: 'eater', needWave: 4, stage: 'party' }],
    funnelStage: [{ day: 60, nPlansW4: 1, stage: 1, maxStage: 1 }],
    funnelVillage: { maxStage: 1, firstLaunchDay: null, lostDay: null } }));
  check('plan exists, never offered -> plan-never-ignites', c.firstFail === 'plan-never-ignites' && /never-offered/.test(c.detail), JSON.stringify(c));
  // 6. plan-never-ignites, offered-never-picked
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    dawnbidScores: [{ day: 70, vid: 'a', cands: [{ kind: 'expedition', winPlanAction: 'party_launch' }], commit: { kind: 'forage', winPlanAction: null }, plan: { stage: 'party', target: 'eater', needWave: 4 } }],
    funnelVillage: { maxStage: 2, firstLaunchDay: null, lostDay: null } }));
  check('offered never picked -> plan-never-ignites', c.firstFail === 'plan-never-ignites' && /offered-never-picked/.test(c.detail), JSON.stringify(c));
  // 7. no-target (dead-target held on the terminal hold day)
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    deadTargetChecks: [{ day: 80, vid: 'a', result: 'held', targetBefore: 'eater', targetAfter: 'eater', planGone: false }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('dead-target terminal hold -> no-target', c.firstFail === 'no-target', JSON.stringify(c));
  // 8. no-companions-available (pool eligible 0)
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    companionPool: [{ day: 80, vid: 'a', rosterN: 6, counts: { eligible: 0 } }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('pool eligible 0 -> no-companions-available', c.firstFail === 'no-companions-available', JSON.stringify(c));
  // 9. holder-blocked, gear stage (unarmed + unarmored)
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'gear', holderArmed: false, holderArmored: false, holderBlock: null, target: 'eater', targetWave: 4 }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('gear-stage unarmed+unarmored -> holder-blocked', c.firstFail === 'holder-blocked', JSON.stringify(c));
  // 10. holder-blocked, range-0
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: 'range-0', target: 'eater', targetWave: 4 }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('range-0 holder block -> holder-blocked', c.firstFail === 'holder-blocked', JSON.stringify(c));
  // 11. other (hold with no cause in evidence)
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    companionPool: [{ day: 80, vid: 'a', rosterN: 6, counts: { eligible: 2 } }],
    igniteCensus: [{ day: 80, vid: 'b', profile: 'wanderer', atHaven: true, onExped: false }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('hold with no cause -> other', c.firstFail === 'other', JSON.stringify(c));
  // 12. unclassified (hold-evidence stream missing entirely)
  const missing = synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }] });
  delete missing.deadTargetChecks; delete missing.companionPool; delete missing.dawnbidDeparts; delete missing.igniteCensus;
  c = classifyFirstFail(missing);
  check('missing hold-evidence streams -> unclassified', c.firstFail === 'unclassified', JSON.stringify(c));
  // 13. determinism: same corpus twice -> identical classification
  const fix = synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [{ day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    companionPool: [{ day: 80, vid: 'a', rosterN: 6, counts: { eligible: 0 } }] });
  const c1 = classifyFirstFail(JSON.parse(JSON.stringify(fix)));
  const c2 = classifyFirstFail(JSON.parse(JSON.stringify(fix)));
  check('classifier deterministic on identical input', JSON.stringify(c1) === JSON.stringify(c2), JSON.stringify([c1, c2]));
  // 14. terminal-hold rule: an early gear hold that resolved, then a
  // persistent no-companion hold, names no-companions (not the gear).
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    v4departs: [
      { day: 70, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'gear', holderArmed: false, holderArmored: false, holderBlock: null, target: 'eater', targetWave: 4 },
      { day: 80, vid: 'a', source: 'winPlanDepart', result: 'hold', stageBefore: 'party', holderArmed: true, holderArmored: true, holderBlock: null, target: 'eater', targetWave: 4 }],
    companionPool: [{ day: 80, vid: 'a', rosterN: 6, counts: { eligible: 0 } }],
    funnelVillage: { maxStage: 3, firstLaunchDay: null, lostDay: null } }));
  check('terminal hold wins over resolved early hold', c.firstFail === 'no-companions-available' && c.holdHistory['holder-gear'] === 1 && c.holdHistory['no-companion'] === 1, JSON.stringify(c));
  // 15. funnelStage cross-check: derived stage agrees with the
  // recorded funnelVillage maxStage on the fixtures above.
  check('derived stage agrees with recorded maxStage (no-plan fixture)', derivedMaxStage(synthBase({ maxWave: 4 })) === 0);
  check('derived stage agrees with recorded maxStage (launch fixture)', derivedMaxStage(synthBase({ maxWave: 4, v4departs: [{ day: 90, vid: 'a', result: 'launch', targetWave: 4 }] })) === 4);
  // 16. Brain-path homebody-handoff launch, v2 shape (driver reads
  // the plan BEFORE the call, so the row carries targetWave): the
  // range-0 holder stays home, the companion walks — it still
  // counts as a wave-4+ launch (pilot seed 107522 d45 shape).
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(44, 'n')],
    v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: 'party', target: 'eater', targetWave: 4 }],
    dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: 'eater', targetWave: 4 }],
    funnelVillage: { maxStage: 4, firstLaunchDay: 45, lostDay: null } }));
  check('brain handoff launch (v2 rows) -> launched', c.firstFail === 'launched' && c.launches === 1, JSON.stringify(c));
  // 17. Same shape on a v1 corpus (brain wrap read the plan AFTER
  // the call: v4departs + dawnbidDeparts rows carry target null).
  // The score-row join recovers it: same vid + day + committed
  // action, plan eater needWave 4.
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(44, 'n')],
    v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: null, target: null, targetWave: null }],
    dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: null, targetWave: null }],
    dawnbidScores: [{ day: 45, vid: 'n', cands: [{ kind: 'expedition', winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch' }, plan: { stage: 'party', target: 'eater', needWave: 4 } }] }));
  check('brain handoff launch (v1 rows, score join) -> launched', c.firstFail === 'launched' && c.launches === 1, JSON.stringify(c));
  // 18. Picked but no depart call, low-wave brain normals only:
  // the residual must name the picked plan and count ZERO wave-4+
  // normals (the unscoped count would have said 23 — pilot seed
  // 107519 v1 shape, before its launch was recovered).
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(60, 'a')],
    dawnbidScores: [{ day: 70, vid: 'a', cands: [{ kind: 'expedition', winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch' }, plan: { stage: 'party', target: 'eater', needWave: 4 } }],
    dawnbidDeparts: [
      { day: 71, vid: 'b', source: 'brain', result: 'normal', winPlanAction: 'party_launch', target: null, targetWave: null },
      { day: 72, vid: 'b', source: 'brain', result: 'normal', winPlanAction: 'party_launch', target: null, targetWave: null }],
    funnelVillage: { maxStage: 2, firstLaunchDay: null, lostDay: null } }));
  check('picked, no depart, low-wave normals only -> other with 0 w4 normals', c.firstFail === 'other' && /eater d70/.test(c.detail) && /0 wave-4\+ brain normal/.test(c.detail), JSON.stringify(c));
  // 19. Algorithm shape (pilot seed 107519, Luke's plan): the dawn
  // scorer offers party_wait every day and party_launch is never
  // even a candidate for the wave-4+ plan -> offered-never-picked.
  c = classifyFirstFail(synthBase({ maxWave: 4, v4creates: [w4create(92, 'l')],
    dawnbidScores: [{ day: 94, vid: 'l', cands: [{ kind: 'FORAGE' }, { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' }], commit: { kind: 'HAVEN_CHORE', winPlanAction: 'party_wait' }, plan: { stage: 'party', target: 'algorithm', needWave: 4 } }],
    funnelVillage: { maxStage: 2, firstLaunchDay: null, lostDay: null } }));
  check('party_wait only, launch never a candidate -> offered-never-picked', c.firstFail === 'plan-never-ignites' && /offered-never-picked/.test(c.detail), JSON.stringify(c));
  return { pass: pass, fail: fail, failures: failures };
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    const r = selftest();
    console.log('launchsilence-a analyzer selftest: ' + r.pass + ' passed, ' + r.fail + ' failed');
    for (const f of r.failures) console.log('  FAIL: ' + f);
    process.exit(r.fail ? 1 : 0);
  }
  if (args.indexOf('--diff') !== -1) {
    const i = args.indexOf('--diff');
    const dirA = args[i + 1], dirB = args[i + 2];
    if (!dirA || !dirB) { console.error('USAGE: --diff <dirA> <dirB>'); process.exit(2); }
    const a = analyzeDir(dirA), b = analyzeDir(dirB);
    const bySeed = {};
    for (const p of a.perSeed) bySeed[p.seed] = { a: p };
    for (const p of b.perSeed) { if (!bySeed[p.seed]) bySeed[p.seed] = {}; bySeed[p.seed].b = p; }
    let match = 0, mismatch = 0;
    const rows = [];
    for (const s of Object.keys(bySeed).sort()) {
      const x = bySeed[s];
      if (!x.a || !x.b) { mismatch++; rows.push({ seed: +s, match: false, reason: 'present in only one dir' }); continue; }
      const ok = x.a.firstFail === x.b.firstFail && x.a.launches === x.b.launches && x.a.days === x.b.days;
      if (ok) match++; else mismatch++;
      rows.push({ seed: +s, match: ok, a: { firstFail: x.a.firstFail, launches: x.a.launches, days: x.a.days }, b: { firstFail: x.b.firstFail, launches: x.b.launches, days: x.b.days } });
    }
    console.log(JSON.stringify({ dirA: dirA, dirB: dirB, match: match, mismatch: mismatch, rows: rows }, null, 2));
    process.exit(mismatch ? 1 : 0);
  }
  let dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-launchsilence-a-ctl');
  let out = path.join(REPO, 'evidence', '2026-11-23', 'launchsilence-a-analysis.json');
  const di = args.indexOf('--dir'); if (di !== -1 && args[di + 1]) dir = args[di + 1];
  const oi = args.indexOf('--out'); if (oi !== -1 && args[oi + 1]) out = args[oi + 1];
  const result = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    seeds: result.seeds, launchesTotal: result.launchesTotal,
    launchingSeeds: result.launchingSeeds, nonLaunchingSeeds: result.nonLaunchingSeeds,
    classified: result.classified, classifiedShare: result.classifiedShare,
    unclassified: result.unclassified, other: result.other,
    stageCounts: result.stageCounts, funnelAgreesAll: result.funnelAgreesAll,
    instrumentErrors: result.instrumentErrors, tickGateMismatches: result.tickGateMismatches,
    wall: result.wall, out: path.relative(REPO, out),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { classifyFirstFail: classifyFirstFail, holdCause: holdCause, derivedMaxStage: derivedMaxStage, analyzeDir: analyzeDir, selftest: selftest, FIRST_FAILS: FIRST_FAILS, loadWave4pIds: loadWave4pIds };
