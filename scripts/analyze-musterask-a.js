// analyze-musterask-a.js — muster-day classifier + band summary for arm
// sim-musterask-a (name the dawn-scoring gap: the 82 never-scored
// holder-days from sim-muster-a).
//
// Copy of scripts/analyze-muster-a2.js with the §5b extended taxonomy
// ONLY (prereg evidence/2026-11-23/sim-musterask-a-prereg.md §5b):
// never-scored holder-days are now classified from the DAWN-STATE
// sampler streams (dawnState / objTickTrace / objPickLog / refreshLog,
// recorded by scripts/musterask-driver-a.js) plus the frozen
// daily.scholarId + v4creates fallbacks. The muster / launch / wall
// logic is byte-identical to -a2 so --diff stays comparable across
// the frozen muster-a corpus and the musterask replay corpus.
//
// Usage:
//   node scripts/analyze-musterask-a.js [--dir <corpus-dir>]
//       [--out <analysis.json>] [--selftest] [--diff <dirA> <dirB>]
//   --selftest runs the built-in fixture suite (one synthetic corpus
//   per taxonomy row + ask-classification + determinism checks) and
//   exits non-zero on any failure. --diff compares two corpus dirs
//   seed by seed on (muster classification summary, launches, days)
//   for the determinism check.
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
  'pool-empty:onExped', 'pool-empty:no-other-villagers',
  'never-asked:holder-scholar-at-dawn', 'never-asked:holder-engaged-at-dawn',
  'never-asked:holder-away-at-dawn', 'never-asked:holder-on-expedition-at-dawn',
  'never-asked:holder-not-at-haven-at-dawn', 'never-asked:holder-off-roster-at-dawn',
  'never-asked:pick-early-return', 'never-asked:objective-live-all-day',
  'never-asked:plan-created-after-dawn', 'unclassified'];
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

// ---- dawn-state classification (musterask extension, prereg §5b) ----
const EARLY_RETURN_KINDS = ['REST', 'EAT', 'SEEK', 'HAUL', 'LEAVE'];
function dawnRowFor(seed, vid, day) {
  for (const r of (seed.dawnState || [])) if (r.day === day && r.vid === vid) return r;
  return null;
}
function dawnRowsForDay(seed, day) {
  return (seed.dawnState || []).filter(function (r) { return r.day === day; });
}
function pickRowsFor(seed, vid, day) {
  return (seed.objPickLog || []).filter(function (r) { return r.day === day && r.vid === vid; });
}
function refreshRowsFor(seed, vid, day) {
  return (seed.refreshLog || []).filter(function (r) { return r.day === day && r.vid === vid; });
}
function traceRowsFor(seed, vid, day) {
  return (seed.objTickTrace || []).filter(function (r) { return r.day === day && r.vid === vid; });
}
function dailyScholarId(seed, day) {
  for (const r of (seed.daily || [])) if (r.day === day) return r.scholarId || null;
  return null;
}
function firstPlanDay(seed, vid, target) {
  let first = null;
  for (const c of (seed.planCensus || [])) {
    if (c.vid !== vid) continue;
    if (target != null && c.target !== target) continue;
    if (first == null || c.day < first) first = c.day;
  }
  return first;
}
function createInfo(seed, vid, day) {
  for (const c of (seed.v4creates || [])) if (c.vid === vid && c.day === day) return c;
  return null;
}
function objectiveIsLive(o) {
  return !!(o && o.kind && o.kind !== 'idle' && o.state !== 'done' && o.state !== 'returning');
}

// classifyNeverScoredDawn(seed, d): the extended §5b dawn sub-causes
// for a never-scored holder-day whose EOD sub-cause is 'unknown'.
// Evaluated in objTick's own order (scholar → engaged → expedition →
// away), then pick-early-return, then objective-live-all-day, then the
// not-at-Haven residue. Returns null when nothing names it.
function classifyNeverScoredDawn(seed, d) {
  const dawn = dawnRowFor(seed, d.vid, d.day);
  const picks = pickRowsFor(seed, d.vid, d.day);
  // 2b. Scholar at dawn. The dawnState row is authoritative; the frozen
  // daily.scholarId is the fallback (end-of-day scholar, not dawn — the
  // detail says so, and --diff catches any disagreement).
  const scholarAtDawn = dawn ? !!dawn.isScholar : (dailyScholarId(seed, d.day) === d.vid);
  if (scholarAtDawn) {
    return { cause: 'never-asked:holder-scholar-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': holder WAS the scholar that day' +
        (dawn ? ' (dawnState.scholarId=' + (dawn.scholarId || '?') + ')' : ' (via daily.scholarId fallback — end-of-day scholar, not dawn)') +
        ' — objTick skips villagerId before any pick; plan persists (cleanup fires only on death)', counts: null };
  }
  if (!dawn) {
    // No dawn row: either the plan did not exist at dawn (created
    // later that day) or the sampler saw nothing. Distinguish via
    // whether objTick ran for anyone that day.
    const anyDawn = dawnRowsForDay(seed, d.day).length > 0;
    const first = firstPlanDay(seed, d.vid, d.target);
    if (first === d.day) {
      const ci = createInfo(seed, d.vid, d.day);
      return { cause: 'never-asked:plan-created-after-dawn',
        detail: 'never scored d' + d.day + ' ' + d.vid + ': no dawnState row (plan first seen today; first planCensus day ' + first + (ci ? '; v4creates creator ' + (ci.creator || '?') : '; no v4creates row') + ') — the plan did not exist at dawn scoring', counts: null };
    }
    if (!anyDawn) {
      return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': NO dawnState rows at all that day (objTick gap? sampler saw no wave-4+ holder at dawn)', counts: null };
    }
    return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': no dawnState row although objTick ran for others that day; first planCensus day ' + first + ' (plan existed before today) — sampler gap or plan not wave-4+ at dawn', counts: null };
  }
  // The feed ran but no muster row exists: instrument contradiction,
  // never a classification (the muster wrap records every feed with a
  // wave-4+ plan).
  for (const p of picks) {
    if (p.feedRan) {
      return { cause: 'unclassified', detail: 'ANOMALY d' + d.day + ' ' + d.vid + ': objPickLog shows feedRan=true at part ' + p.part + ' but no muster row exists — the muster wrap missed a feed', counts: null };
    }
  }
  // 2c. Engaged at dawn (objTick skips engaged villagers).
  if (dawn.engaged) {
    return { cause: 'never-asked:holder-engaged-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': engaged AT DAWN (dawnState.engaged=true) — objTick skips engaged villagers before the dawn block', counts: null };
  }
  // 2e. On an agency expedition at dawn.
  if (dawn.onExped) {
    return { cause: 'never-asked:holder-on-expedition-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': on an agency expedition AT DAWN — objTick forces EXPLORE/expedition and continues', counts: null };
  }
  // 2d. Away at dawn.
  if (dawn.away) {
    return { cause: 'never-asked:holder-away-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': away AT DAWN' + (dawn.awayEntry && dawn.awayEntry.purpose ? ' (purpose ' + dawn.awayEntry.purpose + ', sinceDay ' + dawn.awayEntry.sinceDay + ')' : '') + ' — objTick skips the dawn re-pick for away villagers', counts: null };
  }
  // 2g. Off the roster at dawn (and not the scholar — 2b already fired).
  if (!dawn.onRoster) {
    return { cause: 'never-asked:holder-off-roster-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': off the roster AT DAWN' + (dawn.personExists ? '' : ' (no person record)') + ' — objTick iterates the roster, so a plan-holder off it is never visited', counts: null };
  }
  // 2h. A pick ran but an early return fired before the feed.
  if (picks.length) {
    const kinds = [];
    for (const p of picks) {
      if (p.result && p.result.kind && EARLY_RETURN_KINDS.indexOf(p.result.kind) !== -1) kinds.push(p.result.kind + '@p' + p.part);
    }
    if (kinds.length) {
      let refused = null;
      for (const r of refreshRowsFor(seed, d.vid, d.day)) {
        if (r.outcome === 'refused') { refused = r; break; }
      }
      return { cause: 'never-asked:pick-early-return',
        detail: 'never scored d' + d.day + ' ' + d.vid + ': pick ran but early-returned (' + kinds.join(', ') + ') before the line-660 feed — no feed, no score' +
          (refused ? '; mid-day refresh refused (same-day commit, part ' + refused.part + ')' : ''), counts: null };
    }
    return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': picks ran (' + picks.map(function (p) { return (p.result && p.result.kind) || '?'; }).join(', ') + ') with feedRan=false but no early-return kind — no dawn fact explains the missing feed', counts: null };
  }
  // 2i. Objective live at dawn and at every scoring opportunity.
  if (objectiveIsLive(dawn.objective)) {
    const traces = traceRowsFor(seed, d.vid, d.day);
    const allLive = traces.length > 0 && traces.every(function (t) { return objectiveIsLive(t.objective); });
    if (allLive) {
      return { cause: 'never-asked:objective-live-all-day',
        detail: 'never scored d' + d.day + ' ' + d.vid + ': objective live at dawn (' + dawn.objective.kind + '/' + dawn.objective.state + ', partsLeft ' + dawn.objective.partsLeft + ') and live at every part 1–3 entry — the dawn staleness test never fired, so no re-pick and no feed', counts: null };
    }
    if (traces.length === 0) {
      return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': objective live at dawn (' + dawn.objective.kind + '/' + dawn.objective.state + ') but NO objTickTrace rows to prove it stayed live — cannot name live-all-day', counts: null };
    }
    return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': objective live at dawn (' + dawn.objective.kind + '/' + dawn.objective.state + ') but a trace row shows it went done mid-day with no pick — refresh should have fired (commit stale); no dawn fact explains the miss', counts: null };
  }
  // 2f. Not at Haven at dawn, with a STALE objective and no pick: the
  // node check runs AFTER the dawn re-pick, so it alone does not block
  // scoring — this fires only as the residue, and the detail says so.
  const haven = havenCoords(seed);
  const hx = haven ? haven.nx : 4, hy = haven ? haven.ny : 4;
  if (dawn.node && (dawn.node.nx !== hx || dawn.node.ny !== hy)) {
    return { cause: 'never-asked:holder-not-at-haven-at-dawn',
      detail: 'never scored d' + d.day + ' ' + d.vid + ': not at Haven AT DAWN (node ' + JSON.stringify(dawn.node) + '), objective stale (' + (dawn.objective ? (dawn.objective.kind || 'none') + '/' + (dawn.objective.state || '?') : 'none') + '), no pick ran — the node check runs AFTER the re-pick, so this names the only remaining dawn fact, not a proven gate', counts: null };
  }
  return { cause: 'unclassified', detail: 'never scored d' + d.day + ' ' + d.vid + ': holder alive, at Haven, not on expedition at dawn, objective stale, no pick ran — no dawn fact explains the missing dawn score', counts: null };
}

// classifyNeverScored(seed, d): the frozen §5b cause for one never-scored
// holder-day. 'unknown' sub-cause now consults the dawn taxonomy
// (classifyNeverScoredDawn); it stays unclassified only when no dawn
// sub-cause names it. Called as classifyNeverScored(d) by old callers
// (seed null → dawn lookup skipped → frozen behavior).
function classifyNeverScored(seedOrD, d) {
  const seed = (d === undefined ? null : seedOrD);
  const rec = (d === undefined ? seedOrD : d);
  if (rec.subcause === 'unknown') {
    if (seed) {
      const dawn = classifyNeverScoredDawn(seed, rec);
      if (dawn) return dawn;
    }
    return { cause: 'unclassified', detail: 'never scored d' + rec.day + ' ' + rec.vid + ': holder alive, not on expedition, node ' + JSON.stringify(rec.holderNode) + ' — no state explains the missing dawn score', counts: null };
  }
  return { cause: 'never-asked:holder-not-scored',
    detail: 'never scored d' + rec.day + ' ' + rec.vid + ' (' + rec.subcause + ')', counts: null };
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
    const c = classifyNeverScored(seed, d);
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
    dawnStateRows: (seed.dawnState || []).length,
    objTickTraceRows: (seed.objTickTrace || []).length,
    objPickLogRows: (seed.objPickLog || []).length,
    refreshLogRows: (seed.refreshLog || []).length,
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
    arm: 'musterask-a', dir: dir, seeds: perSeed.length,
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
  // 13. never-scored on the plan's first day, no dawn streams: the
  // extended taxonomy names it plan-created-after-dawn (the old
  // taxonomy left this exact fixture unclassified — see the
  // old-code-fails control in test-musterask-a.js).
  s = analyzeSeed(synthBase({
    planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('never-scored first-day plan -> plan-created-after-dawn (extension moves it)', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:plan-created-after-dawn', JSON.stringify(s.neverScored));
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
  // ---- musterask dawn taxonomy (prereg §5b 2b-2j) ----
  // Helpers: a dawnState row + an objTickTrace row + objPickLog rows.
  function synthDawn(vid, over) {
    const r = { day: 100, part: 0, vid: vid, scholarId: 'scholar', isScholar: false,
      onRoster: true, personExists: true, vpDead: false, engaged: false, away: false,
      awayEntry: null, onExped: false, node: { nx: 4, ny: 4 },
      objective: { kind: 'HAVEN_CHORE', state: 'indoor', partsLeft: 2, indoor: true, purpose: 'chore' },
      plan: { stage: 'party', target: 'eater', needWave: 4, party: [] },
      needs: { energy: 80, hunger: 20 }, goal: 'feed', health: 100, sick: false };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function synthTrace(vid, part, over) {
    const r = { day: 100, part: part, vid: vid,
      objective: { kind: 'FORAGE', state: 'out', partsLeft: 3, indoor: false },
      isScholar: false, engaged: false, away: false, onExped: false,
      node: { nx: 4, ny: 4 }, plan: { stage: 'hunt', target: 'eater' } };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function synthPick(vid, kind, over) {
    const r = { day: 100, part: 0, vid: vid,
      planBefore: { stage: 'party', target: 'eater', needWave: 4 },
      result: { kind: kind, state: 'indoor', partsLeft: 3, indoor: true },
      feedRan: false, error: null };
    if (over) for (const k in over) r[k] = over[k];
    return r;
  }
  function neverScoredBase(over) {
    const b = synthBase({ planCensus: [{ day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] });
    if (over) for (const k in over) b[k] = over[k];
    return b;
  }
  // 22. scholar-at-dawn via the dawnState row (the 40/82 mechanism).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { isScholar: true, scholarId: 'a' })] }));
  check('dawn: holder-scholar-at-dawn (dawnState row)', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-scholar-at-dawn', JSON.stringify(s.neverScored));
  // 23. scholar-at-dawn via the daily.scholarId fallback (frozen corpus shape).
  s = analyzeSeed(neverScoredBase({ daily: [{ day: 100, scholarId: 'a', roster: [{ vid: 'a', name: 'A', dead: false }] }] }));
  check('dawn: holder-scholar-at-dawn (daily.scholarId fallback)', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-scholar-at-dawn' && /fallback/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 24. engaged-at-dawn beats the EOD state (EOD engaged is false here).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { engaged: true })] }));
  check('dawn: holder-engaged-at-dawn', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-engaged-at-dawn', JSON.stringify(s.neverScored));
  // 25. away-at-dawn (purpose carried into the detail).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { away: true, awayEntry: { purpose: 'forage', sinceDay: 99, duration: 3 } })] }));
  check('dawn: holder-away-at-dawn', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-away-at-dawn' && /forage/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 26. on-expedition-at-dawn.
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { onExped: true })] }));
  check('dawn: holder-on-expedition-at-dawn', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-on-expedition-at-dawn', JSON.stringify(s.neverScored));
  // 27. off-roster-at-dawn (no person record folded in).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { onRoster: false, personExists: false })] }));
  check('dawn: holder-off-roster-at-dawn', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-off-roster-at-dawn', JSON.stringify(s.neverScored));
  // 28. pick-early-return REST (no feed; refresh refused named).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })],
    objPickLog: [synthPick('a', 'REST')],
    refreshLog: [{ day: 100, part: 1, vid: 'a', opts: { dawn: false, force: false }, shouldRefresh: false, outcome: 'refused', emergency: false, planBefore: { stage: 'party', target: 'eater', needWave: 4 } }] }));
  check('dawn: pick-early-return REST (+refused mid-day refresh)', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:pick-early-return' && /REST/.test(s.neverScored[0].detail) && /refused/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 29. pick-early-return EAT (no refresh rows — still named).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })],
    objPickLog: [synthPick('a', 'EAT')] }));
  check('dawn: pick-early-return EAT', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:pick-early-return' && /EAT/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 30. objective-live-all-day (FORAGE out, live at dawn + all parts).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'FORAGE', state: 'out', partsLeft: 3, indoor: false, purpose: 'forage' } })],
    objTickTrace: [synthTrace('a', 1), synthTrace('a', 2), synthTrace('a', 3)] }));
  check('dawn: objective-live-all-day', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:objective-live-all-day' && /FORAGE/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 31. objective live at dawn but trace shows it went done with no
  // pick: NOT named live-all-day (refresh should have fired).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'FORAGE', state: 'out', partsLeft: 1, indoor: false, purpose: 'forage' } })],
    objTickTrace: [synthTrace('a', 1), synthTrace('a', 2, { objective: { kind: 'idle', state: 'done', partsLeft: 0, indoor: false } }), synthTrace('a', 3, { objective: { kind: 'idle', state: 'done', partsLeft: 0, indoor: false } })] }));
  check('dawn: live-at-dawn but done mid-day, no pick -> unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified', JSON.stringify(s.neverScored));
  // 32. plan-created-after-dawn (no dawn row, other holders scored
  // that day, first planCensus day is today, world-tick create).
  s = analyzeSeed(neverScoredBase({
    dawnState: [synthDawn('b')],
    v4creates: [{ day: 100, vid: 'a', creator: 'world-tick', stageAfter: 'party', target: 'eater', needWave: 4 }] }));
  check('dawn: plan-created-after-dawn', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:plan-created-after-dawn' && /world-tick/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 33. no dawn row, plan existed before today -> unclassified (not
  // silently plan-created). Day 99 was scored (a found day, eligible
  // 1 — not an event), so only the day-100 silence is judged.
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('b')],
    muster: [synthMusterRow({ day: 99, askKind: 'party_launch', findCompanionAsked: true, findCompanionReturned: 'b',
      addedCands: [{ winPlanAction: 'party_launch', companion: 'b', w: 5.0 }],
      pool: { rosterN: 6, haven: { nx: 4, ny: 4 },
        counts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 3, onExped: 0, eligible: 1 },
        members: [synthMember('h', 'selfOrScholar'), synthMember('s', 'selfOrScholar'),
          synthMember('b', 'eligible', { profile: 'wanderer' }),
          synthMember('c', 'notRanger'), synthMember('d', 'notRanger'), synthMember('e', 'notRanger')] } })],
    planCensus: [{ day: 99, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false },
      { day: 100, vid: 'a', target: 'eater', needWave: 4, stage: 'party', holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false }] }));
  check('dawn: no dawn row, plan pre-existing -> unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified', JSON.stringify(s.neverScored));
  // 34. feedRan=true with no muster row: ANOMALY, never classified.
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })],
    objPickLog: [synthPick('a', 'FORAGE', { feedRan: true })] }));
  check('dawn: feedRan=true but no muster row -> ANOMALY unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified' && /ANOMALY/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 35. not-at-Haven residue: stale objective, no pick, node elsewhere.
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { node: { nx: 1, ny: 2 }, objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })] }));
  check('dawn: not-at-Haven residue (stale objective, no pick)', s.totalEvents === 1 && s.neverScored[0].cause === 'never-asked:holder-not-at-haven-at-dawn' && /only remaining dawn fact/.test(s.neverScored[0].detail), JSON.stringify(s.neverScored));
  // 36. stale objective, at Haven, no pick, no dawn fact -> unclassified.
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })] }));
  check('dawn: stale objective, at Haven, no pick -> unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified', JSON.stringify(s.neverScored));
  // 37. A lottery pick with feedRan=false and a non-early kind is
  // NOT an early return (the feed should have run — unclassified).
  s = analyzeSeed(neverScoredBase({ dawnState: [synthDawn('a', { objective: { kind: 'idle', state: 'idle', partsLeft: null, indoor: false, purpose: null } })],
    objPickLog: [synthPick('a', 'FORAGE')] }));
  check('dawn: lottery pick, feedRan=false, no early kind -> unclassified', s.totalEvents === 1 && s.neverScored[0].cause === 'unclassified', JSON.stringify(s.neverScored));
  return { pass: pass, fail: fail, failures: failures };
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    const r = selftest();
    console.log('musterask-a analyzer selftest: ' + r.pass + ' passed, ' + r.fail + ' failed');
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
  let dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-musterask-a-ctl');
  let out = path.join(REPO, 'evidence', '2026-11-23', 'musterask-a-analysis.json');
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
  classifyNeverScoredDawn: classifyNeverScoredDawn, objectiveIsLive: objectiveIsLive,
  musterEvents: musterEvents, neverScoredDays: neverScoredDays, modalCause: modalCause,
  countLaunches: countLaunches, CAUSES: CAUSES, loadWave4pIds: loadWave4pIds };
