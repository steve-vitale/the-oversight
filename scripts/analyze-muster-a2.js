// analyze-muster-a2.js — muster-day classifier + band summary for arm
// sim-muster-a (the party never musters).
//
// NOTE ON THE NAME: scripts/analyze-muster-a.js and scripts/test-muster-a.js
// already exist on master — the landed October 2026-10-30 sim-muster-a arm
// (Herald muster-diag probe, commit 1bec3ced8; prereg
// evidence/2026-10-30/sim-muster-a-prereg.md). Overwriting them would
// destroy that arm's instrument, so this arm's analyzer/proof test are
// -a2. See evidence/2026-11-23/sim-muster-a-prereg.md §13.
//
// Reads per-seed corpora written by scripts/muster-driver-a.js
// (evidence/2026-11-23/perseed-muster-a-ctl/) and, for every muster-day
// eligible-0 event, names its cause from the frozen taxonomy in
// evidence/2026-11-23/sim-muster-a-prereg.md §5 (evaluated in order,
// first match wins; pool-empty causes vs never-asked causes, from the
// code, not invented).
//
// A "muster day" is one (seed, day, holder) with a wave-4+ plan held at
// dawn scoring (part 0). An "eligible-0 event" is a muster day whose
// pool snapshot reads eligible 0, PLUS a holder-day with no part-0
// muster row at all (population B: the holder held a wave-4+ plan at
// end of day, alive, but was never scored at dawn).
//
// A "launch" is a v4departs row with result 'launch' for a wave-4+
// plan (targetWave >= 4 or target in the wave-4+ roster from
// src/data/monsters.json, re-read live) — the launchsilence definition,
// with the same score-row / planCensus fallback join, so launch counts
// stay comparable across the two arms.
//
// Usage:
//   node scripts/analyze-muster-a2.js [--dir <corpus-dir>]
//       [--out <analysis.json>] [--selftest] [--diff <dirA> <dirB>]
//   --selftest runs the built-in fixture suite (one synthetic corpus
//   per taxonomy row + ask-classification + determinism checks) and
//   exits non-zero on any failure. --diff compares two corpus dirs
//   seed by seed on (muster classification summary, launches, days)
//   for the determinism check.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const CAUSES = ['never-asked:stage-gear', 'never-asked:holder-not-scored',
  'pool-empty:dead', 'pool-empty:away', 'pool-empty:trustLow',
  'pool-empty:notAtHaven', 'pool-empty:engaged', 'pool-empty:notRanger',
  'pool-empty:onExped', 'pool-empty:no-other-villagers', 'unclassified'];
const FIRST_FAIL_ORDER = ['dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'];
const ASK_KINDS = ['party_launch', 'party_wait', 'veteran_guard', 'no-candidate', 'gear_hold', 'no-plan'];

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

// resolveW4pDepart(seed, row): is this depart row for a wave-4+ plan?
// Primary: the row's own target/targetWave (the driver reads the plan
// BEFORE the call). Fallback for v1-shaped corpora: join the dawn score
// for the same vid + day + committed action, then the planCensus for
// the same vid that day, then any census row that day whose party
// includes the vid. (Copied from analyze-launchsilence-a.js so the
// launch count stays the same definition across arms.)
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
// so dedupe by (vid, day).
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

function maxWaveReached(seed) {
  if (seed.maxWave != null) return seed.maxWave | 0;
  let m = 0;
  for (const r of (seed.funnelStage || [])) if ((r.unlockedWave | 0) > m) m = r.unlockedWave | 0;
  if (m > 0) return m;
  if (seed.unlockedWave != null) return seed.unlockedWave | 0;
  return null;
}

// modalCause(members): the modal first-fail cause among the roster's
// non-eligible members, ties broken by findCompanion's check order.
// members carry firstFail per the driver's poolReplica (selfOrScholar
// and eligible members are excluded from the population).
function modalCause(members) {
  const counts = {};
  for (const b of FIRST_FAIL_ORDER) counts[b] = 0;
  let n = 0;
  for (const m of (members || [])) {
    if (!m || m.firstFail === 'selfOrScholar' || m.firstFail === 'eligible') continue;
    if (FIRST_FAIL_ORDER.indexOf(m.firstFail) === -1) continue;
    counts[m.firstFail]++;
    n++;
  }
  if (n === 0) return null;
  let best = null, bestN = -1;
  for (const b of FIRST_FAIL_ORDER) {
    if (counts[b] > bestN) { bestN = counts[b]; best = b; }
  }
  return { cause: best, counts: counts, n: n };
}

// havenCoords(seed): the Haven tile, from any pool snapshot in the
// seed (companionPool rows carry haven; muster rows carry pool.haven).
function havenCoords(seed) {
  for (const r of (seed.companionPool || [])) if (r.haven) return r.haven;
  for (const r of (seed.muster || [])) if (r.pool && r.pool.haven) return r.pool.haven;
  return null;
}

// musterEvents(seed): one event per (holder, day) at part 0, from the
// muster stream. The launch/wait scores + pick are joined from the
// same (vid, day) dawnbidScores row (logCands carry the annotated
// scores; the muster row's addedCands carry the raw weights).
// The pool cross-check compares the muster row's pool counts against
// the same (vid, day) companionPool row (both read the same dawn
// state; disagreement is an instrument anomaly, not a cause).
function musterEvents(seed) {
  const rows = (seed.muster || []).filter(function (r) { return (r.part | 0) === 0; });
  const byKey = {};
  const events = [];
  for (const r of rows) {
    const k = r.vid + '|' + r.day;
    if (byKey[k]) {
      // A second part-0 feed for the same holder-day: the ask must
      // agree (same state, same day). Disagreement is an anomaly.
      const prev = byKey[k];
      if (prev.askKind !== r.askKind || prev.findCompanionReturned !== r.findCompanionReturned) {
        prev.anomalies.push('duplicate-part0-ask-disagrees:' + r.askKind + '/' + (r.findCompanionReturned || 'null'));
      }
      prev.rows++;
      continue;
    }
    let scoreRow = null;
    for (const s of (seed.dawnbidScores || [])) {
      if (s.day === r.day && s.vid === r.vid) { scoreRow = s; break; }
    }
    let launchW = null, launchScore = null, waitW = null, waitScore = null, pick = null;
    for (const c of (r.addedCands || [])) {
      if (c.winPlanAction === 'party_launch') launchW = c.w;
      if (c.winPlanAction === 'party_wait') waitW = c.w;
    }
    if (scoreRow) {
      for (const c of (scoreRow.logCands || [])) {
        if (c && c.winPlanAction === 'party_launch') launchScore = c.score;
        if (c && c.winPlanAction === 'party_wait') waitScore = c.score;
      }
      if (scoreRow.pick && scoreRow.pick.winPlanAction) pick = scoreRow.pick.winPlanAction;
      else if (scoreRow.commit && scoreRow.commit.winPlanAction) pick = scoreRow.commit.winPlanAction;
    }
    let poolAgree = null, poolCounts = null;
    if (r.pool && r.pool.counts) poolCounts = r.pool.counts;
    const pools = (seed.companionPool || []).filter(function (p) { return p.day === r.day && p.vid === r.vid; });
    if (pools.length && poolCounts) {
      const last = pools[pools.length - 1];
      poolAgree = !!last.counts && (last.counts.eligible | 0) === (poolCounts.eligible | 0) &&
        FIRST_FAIL_ORDER.every(function (b) { return (last.counts[b] | 0) === (poolCounts[b] | 0); });
    }
    const ev = { day: r.day, vid: r.vid, stage: r.stage || null, target: r.target || null,
      needWave: (r.needWave != null ? r.needWave : null), party: (r.party || []).slice(),
      askKind: r.askKind || null, asked: !!r.findCompanionAsked,
      returned: r.findCompanionReturned || null,
      launchW: launchW, launchScore: launchScore, waitW: waitW, waitScore: waitScore, pick: pick,
      pool: r.pool || null, poolCounts: poolCounts, poolAgree: poolAgree,
      rows: 1, anomalies: [] };
    byKey[k] = ev;
    events.push(ev);
  }
  events.sort(function (a, b) { return (a.day - b.day) || (a.vid < b.vid ? -1 : 1); });
  return events;
}

// departAsked(seed, ev): was the depart gate reached for this
// holder-day? A v4departs OR dawnbidDeparts row for the same vid +
// day means winPlanDepart / vbrainExecuteDepart ran. Absent both, the
// depart was never asked — even when the dawn pick was party_launch.
function departAsked(seed, ev) {
  for (const r of (seed.v4departs || [])) if (r.day === ev.day && r.vid === ev.vid) return true;
  for (const r of (seed.dawnbidDeparts || [])) if (r.day === ev.day && r.vid === ev.vid) return true;
  return false;
}

// neverScoredDays(seed, events): holder-days with a wave-4+ plan held
// at end of day (planCensus, holder alive) but no part-0 muster event.
// Sub-cause from the holder's end-of-day state.
function neverScoredDays(seed, events) {
  const have = {};
  for (const e of events) have[e.vid + '|' + e.day] = true;
  const otherPart = {};
  for (const r of (seed.muster || [])) {
    if ((r.part | 0) !== 0) otherPart[r.vid + '|' + r.day] = true;
  }
  const haven = havenCoords(seed);
  const out = [];
  const seen = {};
  for (const c of (seed.planCensus || [])) {
    if (!isW4pPlan(c)) continue;
    if (!c.holderAlive) continue; // orphaned plan, not a muster day (§5c)
    const k = c.vid + '|' + c.day;
    if (have[k] || seen[k]) continue;
    seen[k] = true;
    let sub = 'unknown';
    if (seed.villagerId && c.vid === seed.villagerId) sub = 'holder-is-scholar';
    else if (otherPart[k]) sub = 'scored-other-part-only';
    else if (c.holderExped) sub = 'holder-on-expedition';
    else if (c.holderNode && haven && (c.holderNode.nx !== haven.nx || c.holderNode.ny !== haven.ny)) sub = 'holder-not-at-haven';
    out.push({ day: c.day, vid: c.vid, stage: c.stage || null, target: c.target || null,
      needWave: (c.needWave != null ? c.needWave : null), subcause: sub,
      holderExped: !!c.holderExped, holderNode: c.holderNode || null });
  }
  out.sort(function (a, b) { return (a.day - b.day) || (a.vid < b.vid ? -1 : 1); });
  return out;
}

// classifyEvent(seed, ev): the frozen §5b taxonomy for one scored
// eligible-0 event. Returns {cause, detail, counts}.
function classifyEvent(seed, ev) {
  if (!Array.isArray(seed.muster) || !Array.isArray(seed.planCensus)) {
    return { cause: 'unclassified', detail: 'missing stream(s): ' + (!Array.isArray(seed.muster) ? 'muster ' : '') + (!Array.isArray(seed.planCensus) ? 'planCensus' : ''), counts: null };
  }
  if (ev.askKind === 'gear_hold') {
    return { cause: 'never-asked:stage-gear',
      detail: 'd' + ev.day + ' ' + ev.vid + ' stage gear: findCompanion never called (gear_hold early return); pool eligible 0 incidental',
      counts: ev.poolCounts || null };
  }
  if (!ev.askKind || ASK_KINDS.indexOf(ev.askKind) === -1) {
    return { cause: 'unclassified', detail: 'unknown askKind ' + JSON.stringify(ev.askKind) + ' d' + ev.day + ' ' + ev.vid, counts: ev.poolCounts || null };
  }
  if (!ev.pool || !ev.pool.members) {
    return { cause: 'unclassified', detail: 'muster row d' + ev.day + ' ' + ev.vid + ' carries no pool snapshot', counts: ev.poolCounts || null };
  }
  const members = ev.pool.members;
  const nonSelf = members.filter(function (m) { return m && m.firstFail !== 'selfOrScholar'; });
  if (nonSelf.length === 0) {
    return { cause: 'pool-empty:no-other-villagers',
      detail: 'd' + ev.day + ' ' + ev.vid + ': roster holds only the holder + scholar — there is nobody to muster',
      counts: ev.poolCounts || null };
  }
  const modal = modalCause(members);
  if (!modal) {
    return { cause: 'unclassified', detail: 'd' + ev.day + ' ' + ev.vid + ': eligible 0 but no member carries a first-fail cause', counts: ev.poolCounts || null };
  }
  return { cause: 'pool-empty:' + modal.cause,
    detail: 'd' + ev.day + ' ' + ev.vid + ' ask ' + ev.askKind + ': modal first-fail ' + modal.cause +
      ' (' + modal.counts[modal.cause] + '/' + modal.n + ' disqualified); counts ' + JSON.stringify(modal.counts),
    counts: modal.counts };
}

// classifyNeverScored(d): the frozen §5b cause for one never-scored
// holder-day. 'unknown' sub-cause stays unclassified (prereg §5b #2):
// the taxonomy names no scorer gap it cannot ground.
function classifyNeverScored(d) {
  if (d.subcause === 'unknown') {
    return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': holder alive, not on expedition, node ' + JSON.stringify(d.holderNode) + ' — no state explains the missing dawn score', counts: null };
  }
  return { cause: 'never-asked:holder-not-scored',
    detail: 'never scored d' + d.day + ' ' + d.vid + ' (' + d.subcause + ')', counts: null };
}

// launchability(ev): the SEPARATE depart-time table — among the
// event's ELIGIBLE villagers, how many are blocked by
// companionLaunchable bars (unarmed+unarmored / sick / hurt <70 —
// the last two read from the member's own fields; medicine/healer
// availability is village-level and is NOT re-derived here, so hurt
// members are reported as hurt, not as blocked). Never a pool cause.
function launchability(ev) {
  const out = { eligible: 0, eligibleUnarmedUnarmored: 0, eligibleSick: 0, eligibleHurt: 0, eligibleRange0: 0, eligibleKiller3: 0, eligibleArmed: 0 };
  if (!ev.pool || !ev.pool.members) return out;
  for (const m of ev.pool.members) {
    if (!m || m.firstFail !== 'eligible') continue;
    out.eligible++;
    if (m.armed === false && m.armored === false) out.eligibleUnarmedUnarmored++;
    if (m.armed) out.eligibleArmed++;
    if (m.sick) out.eligibleSick++;
    if (m.health != null && m.health < 70) out.eligibleHurt++;
    if (m.maxDist != null && m.maxDist < 1) out.eligibleRange0++;
    if (m.killer3) out.eligibleKiller3++;
  }
  return out;
}

function analyzeSeed(seed) {
  const launches = countLaunches(seed);
  const events = musterEvents(seed);
  const neverScored = neverScoredDays(seed, events);
  const missingStreams = !Array.isArray(seed.muster) || !Array.isArray(seed.planCensus);
  const eligible0 = [];
  const found = [];
  const anomalies = [];
  const askKindCounts = {};
  for (const k of ASK_KINDS) askKindCounts[k] = 0;
  askKindCounts.other = 0;
  let poolAgreeN = 0, poolAgreeDen = 0, launchOffered = 0, departNeverAsked = 0;
  let launchScoreSeen = 0, waitScoreSeen = 0;
  for (const ev of events) {
    if (ASK_KINDS.indexOf(ev.askKind) !== -1) askKindCounts[ev.askKind]++;
    else askKindCounts.other++;
    if (ev.anomalies.length) for (const a of ev.anomalies) anomalies.push('d' + ev.day + ' ' + ev.vid + ': ' + a);
    if (ev.poolAgree != null) { poolAgreeDen++; if (ev.poolAgree) poolAgreeN++; }
    if (ev.poolAgree === false) anomalies.push('d' + ev.day + ' ' + ev.vid + ': muster pool disagrees with companionPool row');
    if (ev.launchScore != null) launchScoreSeen++;
    if (ev.waitScore != null) waitScoreSeen++;
    if (ev.pick === 'party_launch') {
      launchOffered++;
      if (!departAsked(seed, ev)) departNeverAsked++;
    }
    const elig = ev.poolCounts ? (ev.poolCounts.eligible | 0) : null;
    if (elig === 0) eligible0.push(ev);
    else if (elig != null && elig > 0) found.push(ev);
    else anomalies.push('d' + ev.day + ' ' + ev.vid + ': no pool counts on muster row');
  }
  const classified = [];
  for (const ev of eligible0) {
    const c = classifyEvent(seed, ev);
    classified.push({ day: ev.day, vid: ev.vid, stage: ev.stage, target: ev.target,
      askKind: ev.askKind, asked: ev.asked, returned: ev.returned,
      launchW: ev.launchW, launchScore: ev.launchScore, waitW: ev.waitW, waitScore: ev.waitScore,
      pick: ev.pick, poolCounts: ev.poolCounts, launchability: launchability(ev),
      cause: c.cause, detail: c.detail, counts: c.counts });
  }
  const classifiedNever = [];
  for (const d of neverScored) {
    const c = classifyNeverScored(d);
    classifiedNever.push({ day: d.day, vid: d.vid, stage: d.stage, target: d.target,
      subcause: d.subcause, cause: c.cause, detail: c.detail });
  }
  const allEvents = classified.concat(classifiedNever);
  const named = allEvents.filter(function (e) { return e.cause !== 'unclassified'; });
  const causeCounts = {};
  for (const c of CAUSES) causeCounts[c] = 0;
  for (const e of allEvents) causeCounts[e.cause] = (causeCounts[e.cause] || 0) + 1;
  // MusterExtra: trio/quad asks.
  const extra = { secondAsked: 0, secondReturned: 0, thirdAsked: 0, thirdReturned: 0,
    secondCallers: {}, thirdCallers: {} };
  for (const r of (seed.musterExtra || [])) {
    if (r.which === 'second') {
      extra.secondAsked++;
      if (r.returned) extra.secondReturned++;
      const ck = (r.caller || '').indexOf('winPlanCands') !== -1 ? 'dawn' : ((r.caller || '').indexOf('launchParty') !== -1 || (r.caller || '').indexOf('winPlanDepart') !== -1 ? 'depart' : 'other');
      extra.secondCallers[ck] = (extra.secondCallers[ck] || 0) + 1;
    } else if (r.which === 'third') {
      extra.thirdAsked++;
      if (r.returned) extra.thirdReturned++;
      const ck = (r.caller || '').indexOf('winPlanCands') !== -1 ? 'dawn' : ((r.caller || '').indexOf('launchParty') !== -1 || (r.caller || '').indexOf('winPlanDepart') !== -1 ? 'depart' : 'other');
      extra.thirdCallers[ck] = (extra.thirdCallers[ck] || 0) + 1;
    }
  }
  const errs = (seed.instrumentErrors || []).length;
  const mism = (seed.tickGateChecks || []).filter(function (x) { return !x.match; }).length;
  const funnelMax = seed.funnelVillage ? seed.funnelVillage.maxStage : null;
  return {
    seed: seed.seed, launches: launches, days: seed.days, gameDays: seed.gameDays,
    endReason: seed.endReason, villageLost: !!seed.villageLost,
    maxWave: maxWaveReached(seed), standing: seed.standing, scaleRank: seed.scaleRank,
    won: !!seed.won, deaths: (seed.deaths || []).length,
    funnelMaxStage: funnelMax,
    musterFeedCalls: seed.musterFeedCalls != null ? seed.musterFeedCalls : null,
    musterDays: events.length, musterDaysScored: events.length,
    eligible0Events: eligible0.length, neverScoredDays: neverScored.length,
    totalEvents: allEvents.length, classifiedEvents: named.length,
    unclassifiedEvents: allEvents.length - named.length,
    causeCounts: causeCounts,
    askKindCounts: askKindCounts,
    foundDays: found.length,
    launchOfferedDays: launchOffered, departNeverAskedDays: departNeverAsked,
    launchScoreSeen: launchScoreSeen, waitScoreSeen: waitScoreSeen,
    poolAgree: poolAgreeDen ? (poolAgreeN + '/' + poolAgreeDen) : null,
    poolAgreeAll: poolAgreeDen ? poolAgreeN === poolAgreeDen : null,
    musterExtra: extra,
    missingStreams: missingStreams,
    instrumentErrors: errs, tickGateMismatches: mism,
    anomalies: anomalies,
    events: classified, neverScored: classifiedNever,
  };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  let instrumentErrors = 0;
  let tickMismatches = 0;
  for (const f of files) {
    const seed = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = analyzeSeed(seed);
    instrumentErrors += s.instrumentErrors;
    tickMismatches += s.tickGateMismatches;
    perSeed.push(s);
  }
  const totalEvents = perSeed.reduce(function (a, p) { return a + p.totalEvents; }, 0);
  const classifiedTotal = perSeed.reduce(function (a, p) { return a + p.classifiedEvents; }, 0);
  const unclassifiedTotal = perSeed.reduce(function (a, p) { return a + p.unclassifiedEvents; }, 0);
  const causeTotals = {};
  for (const c of CAUSES) causeTotals[c] = 0;
  for (const p of perSeed) for (const c of CAUSES) causeTotals[c] += (p.causeCounts[c] || 0);
  // Pilot-gate population: non-launchers' events only (prereg §6 bar 6).
  const nonLaunchers = perSeed.filter(function (p) { return p.launches === 0; });
  const nlEvents = nonLaunchers.reduce(function (a, p) { return a + p.totalEvents; }, 0);
  const nlClassified = nonLaunchers.reduce(function (a, p) { return a + p.classifiedEvents; }, 0);
  const nlUnclassified = nonLaunchers.reduce(function (a, p) { return a + p.unclassifiedEvents; }, 0);
  const surv = perSeed.map(function (p) { return p.days; }).sort(function (a, b) { return a - b; });
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  const wall = {
    wins: perSeed.filter(function (p) { return p.won; }).length,
    national: perSeed.filter(function (p) { return p.scaleRank === 'national' || p.scaleRank === 'global'; }).length,
    table: 0, // the table seat is not in the per-seed corpus
    wave5: perSeed.filter(function (p) { return (p.maxWave | 0) >= 5; }).length,
    wave4: perSeed.filter(function (p) { return (p.maxWave | 0) >= 4; }).length,
    medianSurvival: median, maxSurvival: surv.length ? surv[surv.length - 1] : null,
    villagesLost: perSeed.filter(function (p) { return p.villageLost; }).length,
    totalDeaths: perSeed.reduce(function (a, p) { return a + p.deaths; }, 0),
  };
  return {
    arm: 'muster-a', dir: dir, seeds: perSeed.length,
    launchesTotal: perSeed.reduce(function (a, p) { return a + p.launches; }, 0),
    launchingSeeds: perSeed.filter(function (p) { return p.launches > 0; }).length,
    nonLaunchingSeeds: nonLaunchers.length,
    musterDaysTotal: perSeed.reduce(function (a, p) { return a + p.musterDays; }, 0),
    eligible0Events: totalEvents,
    classifiedEvents: classifiedTotal,
    classifiedShare: totalEvents ? classifiedTotal / totalEvents : 1,
    unclassifiedEvents: unclassifiedTotal,
    causeTotals: causeTotals,
    nonLauncherEvents: nlEvents,
    nonLauncherClassified: nlClassified,
    nonLauncherClassifiedShare: nlEvents ? nlClassified / nlEvents : 1,
    nonLauncherUnclassified: nlUnclassified,
    foundDaysTotal: perSeed.reduce(function (a, p) { return a + p.foundDays; }, 0),
    launchOfferedDaysTotal: perSeed.reduce(function (a, p) { return a + p.launchOfferedDays; }, 0),
    departNeverAskedDaysTotal: perSeed.reduce(function (a, p) { return a + p.departNeverAskedDays; }, 0),
    poolAgreeAll: perSeed.every(function (p) { return p.poolAgreeAll !== false; }),
    instrumentErrors: instrumentErrors, tickGateMismatches: tickMismatches,
    wall: wall, perSeed: perSeed,
  };
}

// ---- selftest ----
function synthMusterRow(over) {
  const b = { day: 100, part: 0, vid: 'a', stage: 'party', target: 'eater', needWave: 4, party: [],
    askKind: 'party_wait', findCompanionAsked: true, findCompanionReturned: null,
    addedCands: [{ winPlanAction: 'party_wait', companion: null, w: 4.0 }],
    pool: { rosterN: 6, haven: { nx: 4, ny: 4 }, counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
      members: [] } };
  if (over) for (const k in over) b[k] = over[k];
  return b;
}
function synthMember(id, firstFail, over) {
  const m = { id: id, profile: 'homebody', trust: 50, trustRaw: 50, node: { nx: 4, ny: 4 },
    away: false, engaged: false, onExped: false, alive: true, firstFail: firstFail,
    armed: true, armored: false, sick: false, health: 100, maxDist: 3, killer3: false };
  if (over) for (const k in over) m[k] = over[k];
  return m;
}
function synthBase(over) {
  const b = { seed: 999001, maxWave: 4, villageLost: false, standing: 120, days: 150, gameDays: 150,
    endReason: 'days', won: false, scaleRank: 'village', villagerId: 'scholar',
    v4creates: [], planCensus: [], funnelStage: [], v4departs: [], dawnbidScores: [],
    dawnbidDeparts: [], deadTargetChecks: [], companionPool: [], igniteCensus: [],
    havenTickCalls: [], tickGateChecks: [], instrumentErrors: [], deaths: [],
    muster: [], musterExtra: [], musterFeedCalls: 500,
    funnelVillage: { maxStage: 0, firstLaunchDay: null, lostDay: null } };
  if (over) for (const k in over) b[k] = over[k];
  return b;
}
function selftest() {
  let pass = 0, fail = 0;
  const failures = [];
  function check(name, cond, detail) {
    if (cond) pass++;
    else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
  }
  // 1. pool-empty:notAtHaven (modal: 3 notAtHaven of 4 disqualified)
  let s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 3, engaged: 0, notRanger: 1, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'notAtHaven', { node: { nx: 1, ny: 1 } }),
      synthMember('c', 'notAtHaven', { node: { nx: 2, ny: 2 } }),
      synthMember('d', 'notAtHaven', { node: { nx: 3, ny: 3 } }),
      synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:notAtHaven modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:notAtHaven', JSON.stringify(s.events));
  check('pool-empty:notAtHaven counts vector', s.events[0] && s.events[0].counts && s.events[0].counts.notAtHaven === 3 && s.events[0].counts.notRanger === 1, JSON.stringify(s.events[0] && s.events[0].counts));
  // 2. pool-empty:notRanger (all 4 disqualified are homebodies at Haven)
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 4, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'notRanger'), synthMember('c', 'notRanger'),
      synthMember('d', 'notRanger'), synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:notRanger modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:notRanger', JSON.stringify(s.events));
  // 3. pool-empty:trustLow (unknown trust defaults to 10 and fails)
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 5, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 3, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'trustLow', { trust: 10, trustRaw: null }),
      synthMember('c', 'trustLow', { trust: 5, trustRaw: 5 }),
      synthMember('d', 'trustLow', { trust: 12, trustRaw: 12 })] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:trustLow modal (incl. unknown-trust default 10)', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:trustLow', JSON.stringify(s.events));
  // 4. pool-empty:dead
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 5, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 2, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 1, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'dead', { alive: false }), synthMember('c', 'dead', { alive: false }),
      synthMember('d', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:dead modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:dead', JSON.stringify(s.events));
  // 5. pool-empty:away
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 4, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 2, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'away', { away: true }), synthMember('c', 'away', { away: true })] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:away modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:away', JSON.stringify(s.events));
  // 6. pool-empty:engaged
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 4, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 2, notRanger: 0, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'engaged', { engaged: true }), synthMember('c', 'engaged', { engaged: true })] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:engaged modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:engaged', JSON.stringify(s.events));
  // 7. pool-empty:onExped
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 4, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 2, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'onExped', { onExped: true }), synthMember('c', 'onExped', { onExped: true })] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:onExped modal', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:onExped', JSON.stringify(s.events));
  // 8. Modal tie-break: dead 1 vs notAtHaven 1 — dead wins (check order).
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 4, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 1, away: 0, trustLow: 0, notAtHaven: 1, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'dead', { alive: false }),
      synthMember('c', 'notAtHaven', { node: { nx: 1, ny: 1 } })] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('modal tie-break: dead beats notAtHaven (check order)', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:dead', JSON.stringify(s.events));
  // 9. never-asked:stage-gear (eligible 0, gear_hold — pool incidental).
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ stage: 'gear', askKind: 'gear_hold', findCompanionAsked: false,
    addedCands: [{ winPlanAction: 'gear_hold', companion: null, w: 6.0 }],
    pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
      counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 4, onExped: 0, eligible: 0 },
      members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
        synthMember('b', 'notRanger'), synthMember('c', 'notRanger'),
        synthMember('d', 'notRanger'), synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'gear', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('never-asked:stage-gear (pool causes do not override the ask)', s.totalEvents === 1 && s.events[0].cause === 'never-asked:stage-gear', JSON.stringify(s.events));
  // 10. never-asked:holder-not-scored, holder-on-expedition.
  s = analyzeSeed(synthBase({
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: true }] }));
  check('never-scored: holder-on-expedition', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-not-scored' && /holder-on-expedition/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 11. never-asked:holder-not-scored, holder-not-at-haven.
  s = analyzeSeed(synthBase({ companionPool: [{ day: 99, vid: 'z', haven: { nx: 4, ny: 4 }, counts: { eligible: 0 } }],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 1, ny: 1 }, holderExped: false }] }));
  check('never-scored: holder-not-at-haven', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-not-scored' && /holder-not-at-haven/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 12. never-asked:holder-not-scored, holder-is-scholar.
  s = analyzeSeed(synthBase({
    planCensus: [{ day: 100, vid: 'scholar', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('never-scored: holder-is-scholar', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-not-scored' && /holder-is-scholar/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 13. never-scored unknown -> unclassified (no state explains it).
  s = analyzeSeed(synthBase({
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('never-scored unknown -> unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified', JSON.stringify(s.neverScored));
  // 14. pool-empty:no-other-villagers (roster is holder + scholar only).
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ pool: { rosterN: 2, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('pool-empty:no-other-villagers', s.totalEvents === 1 && s.events[0].cause === 'pool-empty:no-other-villagers', JSON.stringify(s.events));
  // 15. asked:companion-found (eligible > 0) is NOT an eligible-0 event.
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ askKind: 'party_launch', findCompanionAsked: true, findCompanionReturned: 'b',
    addedCands: [{ winPlanAction: 'party_launch', companion: 'b', w: 5.0 }],
    pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
      counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 3, onExped: 0, eligible: 1 },
      members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
        synthMember('b', 'eligible', { profile: 'wanderer' }),
        synthMember('c', 'notRanger'), synthMember('d', 'notRanger'), synthMember('e', 'notRanger')] } })],
    dawnbidScores: [{ day: 100, vid: 'a', cands: [{ kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'b' }],
      commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'b' },
      pick: { kind: 'EXPEDITION', winPlanAction: 'party_launch' },
      logCands: [{ kind: 'EXPEDITION', score: 5.0, winPlanAction: 'party_launch' }],
      plan: { stage: 'party', target: 'eater', needWave: 4 } }],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('eligible>0 is a found day, not an event', s.totalEvents === 0 && s.foundDays === 1, JSON.stringify({ t: s.totalEvents, f: s.foundDays }));
  check('launch offered day counted, launch score read', s.launchOfferedDays === 1, JSON.stringify(s.launchOfferedDays));
  // 16. Launch count: brain handoff launch (v2 rows) counts 1.
  s = analyzeSeed(synthBase({ maxWave: 4,
    v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: 'party', target: 'eater', targetWave: 4 }],
    dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: 'eater', targetWave: 4 }] }));
  check('brain handoff launch counts 1 (deduped across tables)', s.launches === 1, JSON.stringify(s.launches));
  // 17. Launch count: v1-shaped rows (target null) recovered by the score join.
  s = analyzeSeed(synthBase({ maxWave: 4,
    v4departs: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', stage: null, target: null, targetWave: null }],
    dawnbidDeparts: [{ day: 45, vid: 'n', source: 'brain', result: 'launch', winPlanAction: 'party_launch', companion: 'c', vidExped: false, companionExped: true, vidBlock: 'range-0', target: null, targetWave: null }],
    dawnbidScores: [{ day: 45, vid: 'n', cands: [{ kind: 'expedition', winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch' }, plan: { stage: 'party', target: 'eater', needWave: 4 } }] }));
  check('v1-shaped launch recovered by score join', s.launches === 1, JSON.stringify(s.launches));
  // 18. Determinism: same corpus twice -> identical summary.
  const fix = synthBase({ muster: [synthMusterRow({ pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
    counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 3, engaged: 0, notRanger: 1, onExped: 0, eligible: 0 },
    members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
      synthMember('b', 'notAtHaven', { node: { nx: 1, ny: 1 } }),
      synthMember('c', 'notAtHaven', { node: { nx: 2, ny: 2 } }),
      synthMember('d', 'notAtHaven', { node: { nx: 3, ny: 3 } }),
      synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] });
  const s1 = analyzeSeed(JSON.parse(JSON.stringify(fix)));
  const s2 = analyzeSeed(JSON.parse(JSON.stringify(fix)));
  check('classifier deterministic on identical input', JSON.stringify(s1) === JSON.stringify(s2), 'diff');
  // 19. Launchability table: eligible-but-unarmed is reported
  // separately, never as a pool cause (here eligible 0, so zeros).
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({ askKind: 'party_wait',
    pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
      counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 4, onExped: 0, eligible: 0 },
      members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
        synthMember('b', 'notRanger', { armed: false, armored: false, sick: true, health: 40 }),
        synthMember('c', 'notRanger', { armed: false, armored: false }),
        synthMember('d', 'notRanger'), synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('launchability is a separate table (eligible 0, so all zeros)', s.events[0].cause === 'pool-empty:notRanger' && s.events[0].launchability.eligible === 0, JSON.stringify(s.events[0]));
  // 20. Missing muster stream is flagged, not silently classified.
  const stripped = synthBase({});
  delete stripped.muster;
  const s20 = analyzeSeed(stripped);
  check('stripped corpus (no muster stream) flagged missingStreams', s20.missingStreams === true, JSON.stringify(s20.missingStreams));
  // 21. musterEvents dedupes a duplicate part-0 feed for the same
  // holder-day (same ask) into one event.
  s = analyzeSeed(synthBase({ muster: [synthMusterRow({}), synthMusterRow({})],
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('duplicate part-0 feeds dedupe to one event', s.musterDays === 1 && s.totalEvents === 1, JSON.stringify({ m: s.musterDays, t: s.totalEvents }));
  return { pass: pass, fail: fail, failures: failures };
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    const r = selftest();
    console.log('muster-a analyzer selftest: ' + r.pass + ' passed, ' + r.fail + ' failed');
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
      const fields = ['launches', 'days', 'musterDays', 'totalEvents', 'classifiedEvents', 'unclassifiedEvents'];
      const okF = fields.every(function (f) { return x.a[f] === x.b[f]; });
      const okC = JSON.stringify(x.a.causeCounts) === JSON.stringify(x.b.causeCounts);
      const okA = JSON.stringify(x.a.askKindCounts) === JSON.stringify(x.b.askKindCounts);
      const ok = okF && okC && okA;
      if (ok) match++; else mismatch++;
      rows.push({ seed: +s, match: ok,
        a: { launches: x.a.launches, days: x.a.days, musterDays: x.a.musterDays, totalEvents: x.a.totalEvents, classified: x.a.classifiedEvents, unclassified: x.a.unclassifiedEvents, causes: x.a.causeCounts },
        b: { launches: x.b.launches, days: x.b.days, musterDays: x.b.musterDays, totalEvents: x.b.totalEvents, classified: x.b.classifiedEvents, unclassified: x.b.unclassifiedEvents, causes: x.b.causeCounts } });
    }
    console.log(JSON.stringify({ dirA: dirA, dirB: dirB, match: match, mismatch: mismatch, rows: rows }, null, 2));
    process.exit(mismatch ? 1 : 0);
  }
  let dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-muster-a-ctl');
  let out = path.join(REPO, 'evidence', '2026-11-23', 'muster-a-analysis.json');
  const di = args.indexOf('--dir'); if (di !== -1 && args[di + 1]) dir = args[di + 1];
  const oi = args.indexOf('--out'); if (oi !== -1 && args[oi + 1]) out = args[oi + 1];
  const result = analyzeDir(dir);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    seeds: result.seeds, launchesTotal: result.launchesTotal,
    launchingSeeds: result.launchingSeeds, nonLaunchingSeeds: result.nonLaunchingSeeds,
    musterDaysTotal: result.musterDaysTotal,
    eligible0Events: result.eligible0Events, classifiedEvents: result.classifiedEvents,
    classifiedShare: result.classifiedShare, unclassifiedEvents: result.unclassifiedEvents,
    causeTotals: result.causeTotals,
    nonLauncherEvents: result.nonLauncherEvents,
    nonLauncherClassifiedShare: result.nonLauncherClassifiedShare,
    nonLauncherUnclassified: result.nonLauncherUnclassified,
    foundDaysTotal: result.foundDaysTotal,
    launchOfferedDaysTotal: result.launchOfferedDaysTotal,
    departNeverAskedDaysTotal: result.departNeverAskedDaysTotal,
    poolAgreeAll: result.poolAgreeAll,
    instrumentErrors: result.instrumentErrors, tickGateMismatches: result.tickGateMismatches,
    wall: result.wall, out: path.relative(REPO, out),
  }, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, selftest: selftest,
  classifyEvent: classifyEvent, classifyNeverScored: classifyNeverScored,
  musterEvents: musterEvents, neverScoredDays: neverScoredDays, modalCause: modalCause,
  countLaunches: countLaunches, CAUSES: CAUSES, loadWave4pIds: loadWave4pIds };
