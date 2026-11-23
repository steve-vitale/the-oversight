// analyze-dawnchoke-a.js — LEVER analyzer, arm sim-dawnchoke-a
// (re-judge sim-dawnchoke-rejudge-a: same lever, corrected det-gate
// bound + total-deaths guardrail — see
// evidence/2026-11-22/sim-dawnchoke-rejudge-a-prereg.md §4).
// Reads the dawnchoke-driver-a.js corpora (two legs: ctl on old code,
// arm on new code) and judges the frozen bars in the re-judge prereg
// §6: PRIMARY wave-4+ departure attempts (armed >= ctl + 4) AND at
// least one control-STUCK staged plan actually departs on the armed
// leg; GUARDRAILS starvation + median survival + total deaths; plus
// the det-gate with a SHAPE-AGNOSTIC, BID-INCLUSIVE bound (first
// extra depart call on the armed leg, first non-skipped safety
// check, or first party_launch bid divergence — whichever is
// earliest — or first day any recorded event stream differs)
// and anchor checks that actually compare the recorded anchorCommit
// / brainSha / winplanSha fields against expected values (a missing
// expectation FAILS the check — never the vacuous checked:false the
// 2115Z analyzer returned). The bid-inclusive bound is the
// sim-departsafe-rejudge-a correction (prereg §2): a deferred
// part-3 bid is the lever's first observable effect a day before
// the depart call it produces.
// Also emits the DIAG tables from the control leg alone
// (--diag-only): choke rate by holder occupation and plan shape,
// and the sub-choke breakdown (no companion at dawn / companions
// present but none ranging / commit written but part-3 deferred /
// commit written but tick skipped otherwise).
// Usage:
//   node scripts/analyze-dawnchoke-a.js --ctl <ctl-dir> --arm <arm-dir> --out <file>
//     [--seeds 107423,...] [--ctl-anchor <sha> --arm-anchor <sha>]
//     [--ctl-brain <sha> --arm-brain <sha> --ctl-winplan <sha> --arm-winplan <sha>]
//   node scripts/analyze-dawnchoke-a.js --diag-only --ctl <ctl-dir> [--seeds ...]
//   node scripts/analyze-dawnchoke-a.js --selftest
// Det-gate comparison is ORDER-INSENSITIVE (sim-detgate-order-a):
// party/member arrays are deep-sorted, companion/companion2/
// companion3 are treated as a set, beat-text name lists are sorted,
// and the plan targets of a departure party's members are compared
// as a multiset over the party (villager-brain.js vbrainExecuteDepart
// copies the leader's target to companions 2 and 3 but NOT to
// companion 1, so which member keeps a null target is a function of
// party position). See canonicalMultisets below. A difference that
// survives canonicalization is a real divergence.
'use strict';
const fs = require('fs');
const path = require('path');

// Wave-4+ id set (frozen list from src/data/monsters.json —
// re-read live so the analyzer refuses a stale roster silently).
const W4P_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());
const STAGED = ['party', 'hunt', 'standing', 'table'];
function isW4Plan(target, needWave) {
  return ((needWave | 0) >= 4) || (target != null && W4P_SET.has(target));
}
function isStagedW4(plan) {
  return !!plan && STAGED.indexOf(plan.stage) !== -1 && isW4Plan(plan.target, plan.needWave);
}
function isTargetlessHunt(plan) {
  return !!plan && plan.stage === 'hunt' && plan.target == null && plan.needWave == null;
}
function isStarvationDeath(d) {
  return !!d && (/starv|hunger/i.test(String(d.kind || '')) || /starv|hunger/i.test(String(d.cause || '')));
}
function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Streams compared by the det-gate: every recorded event row with a
// day, on both legs, must be identical before the armed leg's first
// lever-attributable effect. departCalls / scorePicks / planCensus /
// dawnPool are the choke instrument; the rest are the needwave
// streams carried over unchanged.
const DET_STREAMS = ['departCalls', 'scorePicks', 'v4departs', 'planSeeds', 'v4fights',
  'volleyEvents', 'prizeEvents', 'grantEvents', 'contestEvents', 'deaths',
  'planCensus', 'dawnPool', 'needWaveCopies', 'departBeats', 'reseedBeats', 'beatLines',
  'departSafeCalls'];

// ---- Order-insensitive comparison (sim-detgate-order-a) ----
// The det-gate compares the two legs' recorded streams before the
// bound. Party order is a recording artifact, not a state
// difference: widening the companion pool re-orders findCompanion's
// candidates, so a departure that happens on BOTH legs is recorded
// with its members in a different order — and the order propagates
// into scalar fields (villager-brain.js vbrainExecuteDepart copies
// the leader's plan target to companions 2 and 3 but NOT to
// companion 1, so WHICH member keeps a null target is a function of
// party position). The canonicalization below makes the comparison
// blind to party order while preserving every order-free fact:
//   (a) all within-row arrays are deep-sorted (object keys sorted
//       too, so JSON.stringify is deterministic);
//   (b) companion/companion2/companion3 are treated as a set;
//   (c) the "sets out with A, B and C" name list in beatLines is
//       sorted (the split is deterministic, so a companion named by
//       a generated physical description — which contains commas —
//       still canonicalizes);
//   (d) the plan targets of a departure party's members are
//       compared as a MULTISET over the party (sorted targets
//       assigned to sorted member vids). A party persists across
//       the expedition, so the groups are built per day from every
//       source that records party membership (v4departs, planCensus
//       plan.party, v4fights lead + planParty + allies), not just
//       on the departure day; the gate is "party plan" (a party
//       list, or the post-departure 'hunt' stage where no list is
//       recorded).
// A difference that survives canonicalization is a real divergence.
// Canonicalization applies ONLY to the det-gate divergence check;
// all metric counting reads the raw rows.
// Boundaries (frozen, sim-detgate-order-a prereg §4): a target
// difference that CHANGES the party's target multiset still
// diverges; a plan-target difference for a villager who is NOT a
// member of a departure that day still diverges; a difference in
// any other field still diverges.
function canonValue(v) {
  if (Array.isArray(v)) {
    const arr = v.map(canonValue);
    arr.sort(function (a, b) {
      const sa = JSON.stringify(a), sb = JSON.stringify(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
    return arr;
  }
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v).sort()) o[k] = canonValue(v[k]);
    return o;
  }
  return v;
}
function targetCompare(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  const sa = String(a), sb = String(b);
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}
function canonicalizeRow(stream, row) {
  const r = canonValue(row || {});
  // (b) Companion triple as a set.
  if (r.companion !== undefined || r.companion2 !== undefined || r.companion3 !== undefined) {
    const vals = [r.companion, r.companion2, r.companion3].filter(function (x) { return x != null; });
    vals.sort();
    r.companion = vals.length > 0 ? vals[0] : null;
    r.companion2 = vals.length > 1 ? vals[1] : null;
    r.companion3 = vals.length > 2 ? vals[2] : null;
  }
  // (c) Beat-text name order.
  if (stream === 'beatLines' && typeof r.text === 'string') {
    const m = r.text.match(/sets out with (.+?) after /);
    if (m) {
      const parts = m[1].split(/,\s*|\s+and\s+/).filter(function (x) { return x !== ''; });
      parts.sort();
      let rejoined;
      if (parts.length <= 1) rejoined = parts.join('');
      else rejoined = parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
      const prefix = 'sets out with ';
      r.text = r.text.slice(0, m.index + prefix.length) + rejoined +
        r.text.slice(m.index + prefix.length + m[1].length);
    }
  }
  return r;
}
// Visit every {holderVid, plan} pair in a canonicalized row.
function forEachPlan(stream, row, fn) {
  if (stream === 'planCensus') {
    if (row.attrs && row.attrs.plan) fn(row.vid, row.attrs.plan);
  } else if (stream === 'planSeeds') {
    if (row.before) fn(row.vid, row.before);
    if (row.after) fn(row.vid, row.after);
  } else if (stream === 'v4fights') {
    if (row.lead && row.lead.plan) fn(row.lead.vid, row.lead.plan);
    for (const a of (row.allies || [])) if (a && a.plan) fn(a.vid, a.plan);
  } else if (stream === 'v4departs') {
    for (const m of (row.members || [])) if (m && m.plan) fn(m.vid, m.plan);
  }
}
// A party plan: the plan carries a party list, or is in the
// post-departure 'hunt' stage (planSeeds snapshots carry no party
// list, so stage is the only signal there).
function isPartyPlan(plan) {
  return !!plan && (((plan.party && plan.party.length) || plan.stage === 'hunt'));
}
// A party member's plan target on a day, from the leg's own
// snapshots (priority: planCensus, v4departs members, v4fights
// lead/allies, planSeeds after/before). Returns undefined when no
// party-plan snapshot exists for the member that day; null is a
// FOUND value (the member's plan genuinely has no target). The
// census is taken at end of day (driver policy.daily finally), so a
// census plan is the current party plan, not a pre-departure one.
function memberTarget(canonRows, day, vid) {
  for (const r of (canonRows.planCensus || [])) {
    if ((r.day | 0) === day && r.vid === vid && r.attrs && isPartyPlan(r.attrs.plan)) {
      return r.attrs.plan.target != null ? r.attrs.plan.target : null;
    }
  }
  for (const r of (canonRows.v4departs || [])) {
    if ((r.day | 0) !== day) continue;
    for (const m of (r.members || [])) {
      if (m && m.vid === vid && m.plan) {
        return m.plan.target != null ? m.plan.target : null;
      }
    }
  }
  for (const r of (canonRows.v4fights || [])) {
    if ((r.day | 0) !== day) continue;
    if (r.lead && r.lead.vid === vid && r.lead.plan) {
      return r.lead.plan.target != null ? r.lead.plan.target : null;
    }
    for (const a of (r.allies || [])) {
      if (a && a.vid === vid && a.plan) {
        return a.plan.target != null ? a.plan.target : null;
      }
    }
  }
  for (const r of (canonRows.planSeeds || [])) {
    if ((r.day | 0) !== day || r.vid !== vid) continue;
    if (r.after && r.after.stage === 'hunt') {
      return r.after.target != null ? r.after.target : null;
    }
    if (r.before && r.before.stage === 'hunt') {
      return r.before.target != null ? r.before.target : null;
    }
  }
  return undefined;
}
function unionFindGroups(sets) {
  const parent = {};
  function find(x) {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
    return x;
  }
  function union(a, b) {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  for (const s of sets) for (const m of s) if (!(m in parent)) parent[m] = m;
  for (const s of sets) for (let i = 1; i < s.length; i++) union(s[0], s[i]);
  const groups = {};
  for (const m of Object.keys(parent)) {
    const r = find(m);
    if (!groups[r]) groups[r] = [];
    groups[r].push(m);
  }
  return Object.keys(groups).map(function (k) { return groups[k].sort(); });
}
// Per-stream per-day row multisets, canonicalized (order-insensitive
// per §4): day -> sorted canonical JSON strings. Two legs recording
// the same departure with its members in a different order are
// identical here.
function canonicalMultisets(raw) {
  const canonRows = {};
  for (const stream of DET_STREAMS) {
    canonRows[stream] = (raw[stream] || []).filter(function (r) {
      // DEPARTSAFE (sim-departsafe-a): a SKIPPED safety call
      // returns before any gear-up, stats bump, or member judgment
      // — it has zero state effect, so it is invisible to the
      // det-gate (the same way the gate is blind to party order,
      // a recording artifact). Only non-skipped rows can diverge
      // the legs. Without this filter the arm leg "diverges" on
      // the first wave-3 departure (day 5-11 on the pilot band)
      // merely by recording that the check ran and skipped.
      return !(stream === 'departSafeCalls' && r && r.skipped);
    }).map(function (r) { return canonicalizeRow(stream, r); });
  }
  // (d) Party-level plan-target multiset. A departure party persists
  // across the expedition: the plan targets set at departure (with
  // the companion-1 asymmetry) are still carried when the same party
  // fights again the next day, so the multiset is tracked per party
  // per day, not just on the departure day. Groups are built per day
  // from every source that records party membership — v4departs
  // (leader + party), planCensus (a member's plan.party, non-empty),
  // v4fights (lead + planParty + allies) — and overlapping sets are
  // merged (a villager belongs to at most one party a day).
  const setsByDay = {};
  function addSet(day, members) {
    const clean = (members || []).filter(function (x) { return x != null; });
    if (clean.length < 2) return; // a party needs at least leader + 1
    if (!setsByDay[day]) setsByDay[day] = [];
    setsByDay[day].push(clean);
  }
  for (const r of (canonRows.v4departs || [])) addSet(r.day | 0, [r.vid].concat(r.party || []));
  for (const r of (canonRows.planCensus || [])) {
    const p = r.attrs && r.attrs.plan;
    if (p && p.party && p.party.length) addSet(r.day | 0, [r.vid].concat(p.party));
  }
  for (const r of (canonRows.v4fights || [])) {
    const members = [r.vid].concat(r.planParty || []);
    for (const a of (r.allies || [])) if (a && a.vid) members.push(a.vid);
    if (r.lead && r.lead.vid) members.push(r.lead.vid);
    addSet(r.day | 0, members);
  }
  const groupsByDay = {};
  for (const day of Object.keys(setsByDay)) groupsByDay[day] = unionFindGroups(setsByDay[day]);
  const assignment = {}; // "day|vid" -> canonical target
  for (const day of Object.keys(groupsByDay)) {
    for (const members of groupsByDay[day]) {
      const found = {};
      for (const m of members) {
        const t = memberTarget(canonRows, +day, m);
        if (t !== undefined) found[m] = t;
      }
      const withTargets = Object.keys(found).sort();
      if (!withTargets.length) continue;
      const targets = withTargets.map(function (m) { return found[m]; }).sort(targetCompare);
      for (let i = 0; i < withTargets.length; i++) {
        const key = day + '|' + withTargets[i];
        if (!(key in assignment)) assignment[key] = targets[i];
      }
    }
  }
  // Apply the assignment to every party-plan occurrence for group
  // members that day.
  for (const stream of ['planCensus', 'planSeeds', 'v4fights', 'v4departs']) {
    for (const r of (canonRows[stream] || [])) {
      const day = (r.day | 0);
      forEachPlan(stream, r, function (vid, plan) {
        const key = day + '|' + vid;
        if ((key in assignment) && isPartyPlan(plan)) plan.target = assignment[key];
      });
    }
  }
  const out = {};
  for (const stream of DET_STREAMS) {
    const byDay = {};
    for (const r of (canonRows[stream] || [])) {
      const d = (r && r.day != null) ? (r.day | 0) : 0;
      if (!byDay[d]) byDay[d] = [];
      // Re-canonicalize here, not just in step 1: the step-4 target
      // reassignment changes plan objects inside member/ally arrays,
      // so an array sorted before the reassignment can sit in a
      // different order than the same set sorted after it. Sorting
      // the final values makes the order deterministic across legs.
      byDay[d].push(JSON.stringify(canonValue(r)));
    }
    for (const d of Object.keys(byDay)) byDay[d].sort();
    out[stream] = byDay;
  }
  return out;
}

// Earliest day on which any DET_STREAM's canonical per-day row
// multiset differs between the legs (null when the legs are
// identical on all recorded streams, up to party order).
function firstDivergenceDayFromCanon(c, a) {
  let first = null;
  for (const stream of DET_STREAMS) {
    const days = {};
    for (const d of Object.keys(c[stream] || {})) days[d] = true;
    for (const d of Object.keys(a[stream] || {})) days[d] = true;
    for (const d of Object.keys(days).map(Number).sort(function (x, y) { return x - y; })) {
      if (JSON.stringify(c[stream][d] || []) !== JSON.stringify(a[stream][d] || [])) {
        if (first == null || d < first) first = d;
        break; // earliest differing day for this stream; other streams may be earlier
      }
    }
  }
  return first;
}
function firstDivergenceDay(ctlRow, armRow) {
  return firstDivergenceDayFromCanon(canonicalMultisets(ctlRow.raw), canonicalMultisets(armRow.raw));
}

// Earliest day the armed leg records a brain-path depart call
// (wave-4+ plan) for a (vid, day) with NO control-leg brain depart
// call for that vid that day — the lever's first extra depart call
// (null when the armed leg adds no depart call anywhere).
function firstExtraDepartDay(ctlRow, armRow) {
  const ctlKeys = {};
  for (const r of (ctlRow.raw.departCalls || [])) {
    if (r.source === 'brain' && isW4Plan(r.planTarget, r.planNeedWave)) ctlKeys[r.vid + '|' + (r.day | 0)] = true;
  }
  let first = null;
  for (const r of (armRow.raw.departCalls || [])) {
    if (r.source !== 'brain' || !isW4Plan(r.planTarget, r.planNeedWave)) continue;
    if (!ctlKeys[r.vid + '|' + (r.day | 0)] && (first == null || (r.day | 0) < first)) first = (r.day | 0);
  }
  return first;
}

// DEPARTSAFE (sim-departsafe-a): earliest day the armed leg records
// a NON-SKIPPED departSafeCheck call — the safety bar's first state
// effect (gear-up runs before the member judgment, so even a passing
// check can move state). Skipped rows (non-wave-4+ plans) touch
// nothing and do not count. Null when the stream is absent or has
// no non-skipped row — the det-gate bound then falls back to the
// re-judge rule (ctl-vs-lift, old corpora).
function firstSafetyDay(armRow) {
  let first = null;
  for (const r of (((armRow || {}).raw || {}).departSafeCalls || [])) {
    if (r.skipped) continue;
    if (first == null || (r.day | 0) < first) first = (r.day | 0);
  }
  return first;
}

// DEPARTSAFE-REJUDGE (sim-departsafe-rejudge-a): earliest day the
// armed leg records a party_launch BID for a staged wave-4+ plan
// that the control leg does not record for the same holder that
// day — the lever's first effect when the first bid is a deferred
// part-3 bid (sim-departsafe-a seed 107611: bid day 64, first extra
// depart call day 65). The bid IS the lever acting: the door admits
// a forager companion for the staged plan, so the dawn scorer picks
// party_launch where the control picks party_wait. A bid counts
// only when its wave-4+ plan is proven from the depart call it
// produces: the same-day brain depart call for a non-deferred bid,
// the next-day call for a deferred bid ('party_launch:no-tick-exact'
// has no tick left to execute, so the departure lands the next day).
// The window is tight on purpose — a wider window could attribute
// a wave-3 bid to a wave-4+ plan staged the next day. The same-day
// census row cannot prove the plan: it is an end-of-day snapshot and
// a same-day launch CONSUMES the plan before the census (107601
// day 79: zoltan bids party_launch part 0 for eater/needWave-4,
// launches part 1, and the day-79 census row shows stage 'gear',
// target null). A bid with no wave-4+ depart call on its execution
// day is NOT counted (conservative: a missed bid can only cause a
// false NO-GO, never a false GO — the bound falls back to
// firstExtra/firstSafety). Null when no day satisfies all three
// conditions. The bid cannot precede the first divergence (a bid
// difference IS a scorePicks difference), so adding it to the bound
// can never mask an unexplained earlier divergence.
function firstBidDivergenceDay(ctlRow, armRow) {
  const ctlBids = {};
  for (const r of (((ctlRow || {}).raw || {}).scorePicks || [])) {
    if (r.winPlanAction === 'party_launch') ctlBids[r.vid + '|' + (r.day | 0)] = true;
  }
  const armW4CallDays = {};
  for (const r of (((armRow || {}).raw || {}).departCalls || [])) {
    if (r.source !== 'brain') continue;
    if (!isW4Plan(r.planTarget, r.planNeedWave)) continue;
    if (!armW4CallDays[r.vid]) armW4CallDays[r.vid] = {};
    armW4CallDays[r.vid][r.day | 0] = true;
  }
  let first = null;
  for (const r of (((armRow || {}).raw || {}).scorePicks || [])) {
    if (r.winPlanAction !== 'party_launch') continue;
    if (ctlBids[r.vid + '|' + (r.day | 0)]) continue;
    // Execution day: the bid's own day, or the next day when the
    // bid is a deferred part-3 bid.
    const callDay = (r.deferred === 'party_launch:no-tick-exact') ? (r.day | 0) + 1 : (r.day | 0);
    if (!((armW4CallDays[r.vid] || {})[callDay])) continue;
    if (first == null || (r.day | 0) < first) first = (r.day | 0);
  }
  return first;
}

function isReleaseRow(r) {
  return !!r && r.source === 'brain' && STAGED.indexOf(r.planStage) !== -1 &&
    isW4Plan(r.planTarget, r.planNeedWave) &&
    (r.profile === 'forager' || r.profile === 'homebody') &&
    r.commitWinPlanAction !== 'party_launch';
}

function analyzeSeed(out) {
  const seed = out.seed;
  const errors = (out.instrumentErrors || []).length;
  const calls = (out.departCalls || []).slice();
  const brainCalls = calls.filter(function (r) { return r.source === 'brain'; });
  const wpCalls = calls.filter(function (r) { return r.source === 'winPlanDepart'; });
  const attempts = brainCalls.filter(function (r) { return isW4Plan(r.planTarget, r.planNeedWave); });
  const launches = attempts.filter(function (r) { return r.result === 'launch'; });
  const holds = attempts.filter(function (r) { return r.result === 'hold'; });
  const normals = attempts.filter(function (r) { return r.result === 'normal'; });
  const wpAttempts = wpCalls.filter(function (r) { return isW4Plan(r.planTarget, r.planNeedWave); });
  // First release day (det-gate bound): earliest release row.
  let firstReleaseDay = null;
  for (const r of brainCalls) {
    if (isReleaseRow(r) && (firstReleaseDay == null || r.day < firstReleaseDay)) firstReleaseDay = r.day;
  }
  const ctlReleaseRows = brainCalls.filter(isReleaseRow).length;
  // DEPARTSAFE (sim-departsafe-a): safety-bar call census.
  const safetyRows = (out.departSafeCalls || []).slice();
  const safetyCalls = safetyRows.filter(function (r) { return !r.skipped; });
  const safetyHolds = safetyCalls.filter(function (r) { return !r.ok; });
  const safetyPasses = safetyCalls.filter(function (r) { return r.ok; });
  const firstSafety = firstSafetyDay({ raw: out });
  // ---- Choke census: staged-plan days from planCensus ----
  // A staged-plan day is a census row for a living, at-Haven,
  // not-on-expedition holder of a staged wave-4+ plan OR a
  // targetless-hunt plan. It is a CHOKE day when no departCalls
  // row (either source) exists for that holder that day.
  const callDaysByVid = {};
  for (const r of calls) {
    if (!callDaysByVid[r.vid]) callDaysByVid[r.vid] = {};
    callDaysByVid[r.vid][r.day] = true;
  }
  const scoreByVidDay = {};
  for (const s of (out.scorePicks || [])) {
    const k = s.vid + '|' + s.day;
    if (!scoreByVidDay[k]) scoreByVidDay[k] = [];
    scoreByVidDay[k].push(s);
  }
  const poolByDay = {};
  for (const p of (out.dawnPool || [])) poolByDay[p.day] = p;
  let stagedDays = 0, chokeDays = 0;
  const byOcc = {}; // occupation -> {staged, choke}
  const byShape = {}; // 'targeted-w4' | 'targetless-hunt' -> {staged, choke}
  const byProfile = {}; // range profile -> {staged, choke}
  const subChoke = {}; // sub-choke class -> count (choke days only)
  const stagedDaysByVid = {}; // vid -> Set of days (wave-4+ staged only)
  const stagedSpanByVid = {}; // vid -> {min, max, n}
  for (const row of (out.planCensus || [])) {
    const a = row.attrs || {};
    if (a.dead || !a.atHaven || a.onExped) continue;
    const plan = a.plan;
    if (!plan) continue;
    const shape = isStagedW4(plan) ? 'targeted-w4'
      : (isTargetlessHunt(plan) ? 'targetless-hunt' : null);
    if (!shape) continue;
    const vid = row.vid, day = row.day;
    stagedDays++;
    const hadCall = !!(callDaysByVid[vid] && callDaysByVid[vid][day]);
    if (!hadCall) chokeDays++;
    const occ = a.occupation || 'unknown';
    if (!byOcc[occ]) byOcc[occ] = { staged: 0, choke: 0 };
    byOcc[occ].staged++;
    if (!hadCall) byOcc[occ].choke++;
    if (!byShape[shape]) byShape[shape] = { staged: 0, choke: 0 };
    byShape[shape].staged++;
    if (!hadCall) byShape[shape].choke++;
    const prof = a.profile || 'unknown';
    if (!byProfile[prof]) byProfile[prof] = { staged: 0, choke: 0 };
    byProfile[prof].staged++;
    if (!hadCall) byProfile[prof].choke++;
    if (shape === 'targeted-w4') {
      if (!stagedDaysByVid[vid]) stagedDaysByVid[vid] = {};
      stagedDaysByVid[vid][day] = true;
      if (!stagedSpanByVid[vid]) stagedSpanByVid[vid] = { min: day, max: day, n: 0 };
      const sp = stagedSpanByVid[vid];
      if (day < sp.min) sp.min = day;
      if (day > sp.max) sp.max = day;
      sp.n++;
    }
    if (!hadCall) {
      // Sub-choke classification from the day's scorePicks rows.
      const rows = scoreByVidDay[vid + '|' + day] || [];
      let cls;
      const plRows = rows.filter(function (r) { return r.winPlanAction === 'party_launch'; });
      if (plRows.length) {
        const def = plRows.some(function (r) { return r.deferred === 'party_launch:no-tick-exact'; });
        cls = def ? 'commit-written-part3-deferred' : 'commit-written-no-depart';
      } else if (rows.length) {
        // Latest scoring of the day decides what the holder did.
        const last = rows.slice().sort(function (x, y) { return (x.part - y.part) || 0; }).pop();
        if (last.winPlanAction === 'gear_hold') cls = 'stage-gear-hold';
        else if (last.winPlanAction === 'party_wait') cls = 'party-wait-no-companion';
        else if (last.winPlanAction) cls = 'bid-other-winplan:' + last.winPlanAction;
        else cls = 'bid-lost:' + (last.override || last.pickKind || 'none');
      } else {
        cls = 'never-scored';
      }
      subChoke[cls] = (subChoke[cls] || 0) + 1;
      // Cross-tab: eligible companions that day (0 vs >0).
      const pool = poolByDay[day];
      const elig = pool ? (pool.eligibleCompanions | 0) : null;
      const ekey = cls + '|elig' + (elig === 0 ? '=0' : (elig > 0 ? '>0' : '?'));
      subChoke[ekey] = (subChoke[ekey] || 0) + 1;
    }
  }
  // STUCK plans (control definition): wave-4+ staged on >= 7 distinct
  // census days with ZERO departCalls rows for that vid all run.
  const stuck = [];
  for (const vid of Object.keys(stagedDaysByVid)) {
    const days = Object.keys(stagedDaysByVid[vid]).length;
    const sp = stagedSpanByVid[vid];
    const hadAnyCall = !!(callDaysByVid[vid] && Object.keys(callDaysByVid[vid]).length);
    if (days >= 7 && !hadAnyCall) {
      stuck.push({ vid: vid, stagedDays: days, spanDays: (sp.max - sp.min + 1), firstDay: sp.min, lastDay: sp.max });
    }
  }
  // Deaths.
  const deaths = (out.deaths || []).slice();
  const starv = deaths.filter(isStarvationDeath);
  const kindStrings = {};
  for (const d of deaths) {
    const k = String((d.kind || '') + '/' + (d.cause || ''));
    kindStrings[k] = (kindStrings[k] || 0) + 1;
  }
  // Launches detail (wave-4+ attempts that launched).
  const launchDetail = launches.map(function (r) {
    return { seed: seed, day: r.day, part: r.part, vid: r.vid, source: r.source,
      target: r.planTarget || null, needWave: (r.planNeedWave != null ? (r.planNeedWave | 0) : null),
      stage: r.planStage || null, profile: r.profile || null, occupation: r.occupation || null,
      commitWinPlanAction: r.commitWinPlanAction || null };
  });
  return {
    seed: seed, mode: out.mode || out.leg || null,
    anchorCommit: out.anchorCommit || null,
    brainSha: out.brainSha || null, winplanSha: out.winplanSha || null,
    errors: errors, sayWrap: !!out.sayWrap,
    days: out.days, gameDays: out.gameDays,
    endReason: out.endReason || null, won: !!out.won,
    villageLost: !!out.villageLost, maxWave: out.maxWave,
    unlockedWave: out.unlockedWave, standing: out.standing,
    scaleRank: out.scaleRank || null,
    deaths: deaths.length, starvDeaths: starv.length,
    kindStrings: kindStrings,
    attempts: attempts.length, launchesN: launches.length,
    holds: holds.length, normals: normals.length,
    wpAttempts: wpAttempts.length,
    wpCalls: wpCalls.length, brainCalls: brainCalls.length,
    firstReleaseDay: firstReleaseDay, ctlReleaseRows: ctlReleaseRows,
    safetyCalls: safetyCalls.length, safetyHolds: safetyHolds.length,
    safetyPasses: safetyPasses.length, safetySkips: safetyRows.length - safetyCalls.length,
    firstSafetyDay: firstSafety,
    launchDetail: launchDetail,
    stagedDays: stagedDays, chokeDays: chokeDays,
    chokeRate: stagedDays ? chokeDays / stagedDays : null,
    byOcc: byOcc, byShape: byShape, byProfile: byProfile,
    subChoke: subChoke,
    stuck: stuck,
    beatLines: (out.beatLines || []).slice(),
    raw: out,
  };
}

function loadLeg(dir, mode, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'dawnchoke-a-s' + seed + '-dawnchoke-a-' + mode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(analyzeSeed(JSON.parse(fs.readFileSync(fp, 'utf8'))));
  }
  return rows;
}

function detGateForSeed(ctlRow, armRow) {
  const firstExtra = firstExtraDepartDay(ctlRow, armRow);
  const firstSafety = firstSafetyDay(armRow);
  const firstBid = firstBidDivergenceDay(ctlRow, armRow);
  const cCanon = canonicalMultisets(ctlRow.raw);
  const aCanon = canonicalMultisets(armRow.raw);
  const firstDiv = firstDivergenceDayFromCanon(cCanon, aCanon);
  // DEPARTSAFE (sim-departsafe-a) + DEPARTSAFE-REJUDGE
  // (sim-departsafe-rejudge-a): the bound is the earliest
  // lever-attributable effect day — the first extra depart call OR
  // the first non-skipped safety check OR the first party_launch
  // bid divergence, whichever is earliest. The bid is the third
  // source because a deferred part-3 bid is the lever's first
  // observable effect a day before the depart call it produces
  // (sim-departsafe-a seed 107611: bid 64, call 65, safety 66).
  // The safety check's gear-up is itself a state effect, so a
  // gear-up divergence before the first extra depart call must
  // not fail the gate. When the arm leg records no lever effect
  // at all (old corpora, or the lift leg with no safety calls) the
  // bound falls back to the first divergence day. Attribution: the
  // first divergence must BE one of the lever-effect days — a
  // divergence before any lever effect, or with no lever effect
  // at all, still fails.
  const effectDays = [firstExtra, firstSafety, firstBid].filter(function (d) { return d != null; });
  const bound = (effectDays.length === 0) ? firstDiv : Math.min.apply(null, effectDays);
  const detail = { seed: ctlRow.seed, bound: bound,
    firstExtraDepartDay: firstExtra, firstSafetyDay: firstSafety, firstBidDivergenceDay: firstBid,
    firstDivergenceDay: firstDiv, mismatches: [] };
  if (ctlRow.ctlReleaseRows !== 0) {
    detail.mismatches.push('ctl leg recorded ' + ctlRow.ctlReleaseRows + ' first-release rows (must be 0)');
  }
  if ((ctlRow.raw.departSafeCalls || []).length !== 0) {
    detail.mismatches.push('ctl leg recorded ' + ctlRow.raw.departSafeCalls.length + ' departSafeCalls rows (must be 0)');
  }
  // Pre-bound streams identical (verified independently of the bound
  // computation: canonical per-day multisets for days < bound).
  for (const stream of DET_STREAMS) {
    const c = cCanon[stream];
    const a = aCanon[stream];
    const days = {};
    for (const d of Object.keys(c)) if (bound == null || (+d) < bound) days[d] = true;
    for (const d of Object.keys(a)) if (bound == null || (+d) < bound) days[d] = true;
    for (const d of Object.keys(days)) {
      if (JSON.stringify(c[d] || []) !== JSON.stringify(a[d] || [])) {
        detail.mismatches.push(stream + ': pre-bound rows differ on day ' + d);
        break;
      }
    }
  }
  // Attribution: the first divergence must BE the lever's first
  // extra depart call, its first safety effect, or its first
  // party_launch bid divergence. A stream diverging before any
  // lever effect, or diverging with no lever effect at all, fails.
  if (firstDiv != null && firstDiv !== firstExtra && firstDiv !== firstSafety && firstDiv !== firstBid) {
    detail.mismatches.push('first divergence day ' + firstDiv + ' is not a lever-effect day (first extra depart ' +
      (firstExtra == null ? '(none)' : String(firstExtra)) + ', first safety effect ' +
      (firstSafety == null ? '(none)' : String(firstSafety)) + ', first bid divergence ' +
      (firstBid == null ? '(none)' : String(firstBid)) + ')');
  }
  detail.pass = detail.mismatches.length === 0;
  return detail;
}

function analyze(ctlRows, armRows, opts) {
  opts = opts || {};
  const seeds = ctlRows.map(function (r) { return r.seed; });
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  const ctlAttempts = sum(ctlRows, function (r) { return r.attempts; });
  const armAttempts = sum(armRows, function (r) { return r.attempts; });
  const ctlLaunches = sum(ctlRows, function (r) { return r.launchesN; });
  const armLaunches = sum(armRows, function (r) { return r.launchesN; });
  const ctlStarv = sum(ctlRows, function (r) { return r.starvDeaths; });
  const armStarv = sum(armRows, function (r) { return r.starvDeaths; });
  const ctlMed = median(ctlRows.map(function (r) { return r.gameDays; }));
  const armMed = median(armRows.map(function (r) { return r.gameDays; }));
  const ctlErr = sum(ctlRows, function (r) { return r.errors; });
  const armErr = sum(armRows, function (r) { return r.errors; });
  // Anchor check: every expected value is compared against EVERY
  // per-seed file's recorded field. A MISSING expectation is a
  // FAILED check (checked: true, pass: false) — never the vacuous
  // checked:false the 2115Z analyzer returned. anchorCommit is
  // compared on its first 12 chars (a full or short sha both work);
  // file-content shas are compared exactly.
  const anchorChecks = [];
  function checkAnchor(rows, field, expected, label, prefix) {
    if (expected == null) {
      anchorChecks.push({ label: label, checked: true, pass: false, reason: 'expected value not supplied' });
      return;
    }
    const bad = rows.filter(function (r) {
      const v = r[field];
      if (v == null) return true;
      return prefix ? String(v).slice(0, 12) !== String(expected).slice(0, 12) : v !== expected;
    });
    anchorChecks.push({ label: label, checked: true,
      pass: bad.length === 0, badSeeds: bad.map(function (r) { return r.seed; }) });
  }
  checkAnchor(ctlRows, 'anchorCommit', opts.ctlAnchor, 'ctl anchorCommit', true);
  checkAnchor(armRows, 'anchorCommit', opts.armAnchor, 'arm anchorCommit', true);
  checkAnchor(ctlRows, 'brainSha', opts.ctlBrain, 'ctl villager-brain.js', false);
  checkAnchor(armRows, 'brainSha', opts.armBrain, 'arm villager-brain.js', false);
  checkAnchor(ctlRows, 'winplanSha', opts.ctlWinplan, 'ctl win-plan.js', false);
  checkAnchor(armRows, 'winplanSha', opts.armWinplan, 'arm win-plan.js', false);
  const anchorPass = anchorChecks.every(function (c) { return c.checked && c.pass; });
  // Per-seed starvation excess (arm minus ctl).
  const starvExcess = [];
  for (let i = 0; i < ctlRows.length; i++) {
    starvExcess.push({ seed: ctlRows[i].seed,
      ctl: ctlRows[i].starvDeaths, arm: armRows[i].starvDeaths,
      excess: armRows[i].starvDeaths - ctlRows[i].starvDeaths });
  }
  const maxExcess = starvExcess.reduce(function (a, r) { return Math.max(a, r.excess); }, -Infinity);
  // Det-gate per seed.
  const det = [];
  for (let i = 0; i < ctlRows.length; i++) det.push(detGateForSeed(ctlRows[i], armRows[i]));
  const detPass = det.every(function (d) { return d.pass; });
  // Stuck plans: control-STUCK (seed, vid) that actually depart on arm.
  const ctlStuckKeys = {};
  for (const r of ctlRows) {
    for (const s of (r.stuck || [])) ctlStuckKeys[r.seed + '|' + s.vid] = s;
  }
  const stuckDeparted = [];
  for (const r of armRows) {
    for (const l of (r.launchDetail || [])) {
      const key = r.seed + '|' + l.vid;
      if (ctlStuckKeys[key] && stuckDeparted.indexOf(key) === -1) stuckDeparted.push(key);
    }
  }
  // Wall numbers.
  const wall = function (rows) {
    return { wins: sum(rows, function (r) { return r.won ? 1 : 0 }),
      national: sum(rows, function (r) { return r.scaleRank === 'national' ? 1 : 0 }),
      wave5: sum(rows, function (r) { return (r.maxWave | 0) >= 5 ? 1 : 0 }),
      wave4: sum(rows, function (r) { return (r.maxWave | 0) >= 4 ? 1 : 0 }),
      medianSurvival: median(rows.map(function (r) { return r.gameDays; })),
      maxSurvival: Math.max.apply(null, rows.map(function (r) { return r.gameDays; })),
      villagesLost: sum(rows, function (r) { return r.villageLost ? 1 : 0 }) };
  };
  const ctlDeaths = sum(ctlRows, function (r) { return r.deaths; });
  const armDeaths = sum(armRows, function (r) { return r.deaths; });
  const ctlMeanDeaths = ctlRows.length ? ctlDeaths / ctlRows.length : null;
  const armMeanDeaths = armRows.length ? armDeaths / armRows.length : null;
  const deathsPerExtraLaunch = (armLaunches > ctlLaunches)
    ? (armDeaths - ctlDeaths) / (armLaunches - ctlLaunches) : null;
  const bars = {};
  bars.instrument = (ctlErr === 0 && armErr === 0);
  bars.detGate = detPass;
  bars.anchor = anchorPass;
  const zeroAttempt = (ctlAttempts < 5 && armAttempts < 5);
  bars.primaryAttempts = (armAttempts >= ctlAttempts + 4);
  bars.primaryStuckDeparts = (stuckDeparted.length >= 1);
  bars.starvTotal = (armStarv <= ctlStarv + 2);
  bars.starvPerSeed = (maxExcess <= 2);
  bars.survival = (ctlMed != null && armMed != null) && (armMed >= 0.8 * ctlMed);
  // Total-deaths guardrail (re-judge bar 8): armed mean total
  // village deaths per run <= control mean + 5. The 2115Z panel
  // showed +10.75/run, so this bar is a real test.
  bars.totalDeaths = (ctlMeanDeaths != null && armMeanDeaths != null) &&
    (armMeanDeaths <= ctlMeanDeaths + 5);
  let verdict = 'NO-GO';
  if (zeroAttempt) verdict = 'INCONCLUSIVE';
  else if (bars.instrument && bars.detGate && bars.anchor && bars.primaryAttempts &&
    bars.primaryStuckDeparts && bars.starvTotal && bars.starvPerSeed && bars.survival &&
    bars.totalDeaths) verdict = 'GO';
  // Choke totals (control leg, the DIAG).
  function chokeTotals(rows) {
    const tot = { staged: 0, choke: 0, byOcc: {}, byShape: {}, byProfile: {}, subChoke: {} };
    for (const r of rows) {
      tot.staged += r.stagedDays; tot.choke += r.chokeDays;
      for (const k of Object.keys(r.byOcc || {})) {
        if (!tot.byOcc[k]) tot.byOcc[k] = { staged: 0, choke: 0 };
        tot.byOcc[k].staged += r.byOcc[k].staged; tot.byOcc[k].choke += r.byOcc[k].choke;
      }
      for (const k of Object.keys(r.byShape || {})) {
        if (!tot.byShape[k]) tot.byShape[k] = { staged: 0, choke: 0 };
        tot.byShape[k].staged += r.byShape[k].staged; tot.byShape[k].choke += r.byShape[k].choke;
      }
      for (const k of Object.keys(r.byProfile || {})) {
        if (!tot.byProfile[k]) tot.byProfile[k] = { staged: 0, choke: 0 };
        tot.byProfile[k].staged += r.byProfile[k].staged; tot.byProfile[k].choke += r.byProfile[k].choke;
      }
      for (const k of Object.keys(r.subChoke || {})) tot.subChoke[k] = (tot.subChoke[k] || 0) + r.subChoke[k];
    }
    tot.chokeRate = tot.staged ? tot.choke / tot.staged : null;
    return tot;
  }
  const ctlChoke = chokeTotals(ctlRows);
  const armChoke = chokeTotals(armRows);
  return {
    verdict: verdict, zeroAttempt: zeroAttempt,
    seeds: seeds,
    ctl: { attempts: ctlAttempts, launches: ctlLaunches,
      starvDeaths: ctlStarv, medianSurvival: ctlMed,
      instrumentErrors: ctlErr, wall: wall(ctlRows),
      totalDeaths: ctlDeaths, meanDeaths: ctlMeanDeaths,
      choke: ctlChoke,
      stuck: ctlRows.reduce(function (a, r) { return a.concat((r.stuck || []).map(function (s) { return { seed: r.seed, vid: s.vid, stagedDays: s.stagedDays, spanDays: s.spanDays, firstDay: s.firstDay, lastDay: s.lastDay }; })); }, []),
      perSeed: ctlRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        attempts: r.attempts, launches: r.launchesN, holds: r.holds, normals: r.normals,
        wpAttempts: r.wpAttempts, starvDeaths: r.starvDeaths, deaths: r.deaths,
        stagedDays: r.stagedDays, chokeDays: r.chokeDays, chokeRate: r.chokeRate,
        firstReleaseDay: r.firstReleaseDay, errors: r.errors }; }) },
    arm: { attempts: armAttempts, launches: armLaunches,
      starvDeaths: armStarv, medianSurvival: armMed,
      instrumentErrors: armErr, wall: wall(armRows),
      totalDeaths: armDeaths, meanDeaths: armMeanDeaths,
      choke: armChoke,
      perSeed: armRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        attempts: r.attempts, launches: r.launchesN, holds: r.holds, normals: r.normals,
        wpAttempts: r.wpAttempts, starvDeaths: r.starvDeaths, deaths: r.deaths,
        stagedDays: r.stagedDays, chokeDays: r.chokeDays, chokeRate: r.chokeRate,
        firstReleaseDay: r.firstReleaseDay, errors: r.errors }; }) },
    stuckDeparted: stuckDeparted,
    ctlStuckCount: Object.keys(ctlStuckKeys).length,
    deathsPerExtraLaunch: deathsPerExtraLaunch,
    starvExcess: starvExcess, maxStarvExcess: maxExcess,
    det: det, detPass: detPass, anchorChecks: anchorChecks,
    bars: bars,
    ctlLaunchDetail: ctlRows.reduce(function (a, r) { return a.concat(r.launchDetail); }, []),
    armLaunchDetail: armRows.reduce(function (a, r) { return a.concat(r.launchDetail); }, []),
    kindStrings: (function () {
      const k = {};
      for (const r of ctlRows.concat(armRows)) {
        for (const key of Object.keys(r.kindStrings || {})) k[key] = (k[key] || 0) + (r.kindStrings[key] || 0);
      }
      return k;
    })(),
    armBeatLines: armRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
    ctlBeatLines: ctlRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
  };
}

function diagOnly(ctlRows) {
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  const tot = { staged: 0, choke: 0, byOcc: {}, byShape: {}, byProfile: {}, subChoke: {} };
  for (const r of ctlRows) {
    tot.staged += r.stagedDays; tot.choke += r.chokeDays;
    for (const k of Object.keys(r.byOcc || {})) {
      if (!tot.byOcc[k]) tot.byOcc[k] = { staged: 0, choke: 0 };
      tot.byOcc[k].staged += r.byOcc[k].staged; tot.byOcc[k].choke += r.byOcc[k].choke;
    }
    for (const k of Object.keys(r.byShape || {})) {
      if (!tot.byShape[k]) tot.byShape[k] = { staged: 0, choke: 0 };
      tot.byShape[k].staged += r.byShape[k].staged; tot.byShape[k].choke += r.byShape[k].choke;
    }
    for (const k of Object.keys(r.byProfile || {})) {
      if (!tot.byProfile[k]) tot.byProfile[k] = { staged: 0, choke: 0 };
      tot.byProfile[k].staged += r.byProfile[k].staged; tot.byProfile[k].choke += r.byProfile[k].choke;
    }
    for (const k of Object.keys(r.subChoke || {})) tot.subChoke[k] = (tot.subChoke[k] || 0) + r.subChoke[k];
  }
  return {
    mode: 'diag-only',
    seeds: ctlRows.map(function (r) { return r.seed; }),
    attempts: sum(ctlRows, function (r) { return r.attempts; }),
    launches: sum(ctlRows, function (r) { return r.launchesN; }),
    holds: sum(ctlRows, function (r) { return r.holds; }),
    normals: sum(ctlRows, function (r) { return r.normals; }),
    wpAttempts: sum(ctlRows, function (r) { return r.wpAttempts; }),
    stagedDays: tot.staged, chokeDays: tot.choke,
    chokeRate: tot.staged ? tot.choke / tot.staged : null,
    byOcc: tot.byOcc, byShape: tot.byShape, byProfile: tot.byProfile,
    subChoke: tot.subChoke,
    stuck: ctlRows.reduce(function (a, r) { return a.concat((r.stuck || []).map(function (s) { return { seed: r.seed, vid: s.vid, stagedDays: s.stagedDays, spanDays: s.spanDays, firstDay: s.firstDay, lastDay: s.lastDay }; })); }, []),
    perSeed: ctlRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
      attempts: r.attempts, launches: r.launchesN, stagedDays: r.stagedDays,
      chokeDays: r.chokeDays, chokeRate: r.chokeRate, stuckN: (r.stuck || []).length,
      starvDeaths: r.starvDeaths, deaths: r.deaths, errors: r.errors }; }),
  };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name); }
  }
  function seedOut(o) {
    return Object.assign({ seed: 107423, mode: 'ctl', anchorCommit: 'abc',
      winplanSha: 'wp1', brainSha: 'br1', instrumentErrors: [],
      days: 150, gameDays: 150, endReason: 'survived', won: false,
      villageLost: false, maxWave: 5, unlockedWave: 5, standing: 300,
      scaleRank: 'regional', deaths: [], samples: null, v4gunLoc: [],
      contestEvents: [], prizeEvents: [], grantEvents: [],
      corpseTakeEvents: [], killLootEvents: [], volleyEvents: [],
      v4departs: [], v4fights: [], planSeeds: [], planCensus: [],
      needWaveCopies: [], departBeats: [], reseedBeats: [], beatLines: [],
      departCalls: [], scorePicks: [], dawnPool: [], departSafeCalls: [],
      sayWrap: true }, o || {});
  }
  function censusRow(day, vid, attrs) {
    return { day: day, vid: vid, attrs: Object.assign({ dead: false, atHaven: true, onExped: false,
      profile: 'forager', occupation: 'forager',
      plan: { stage: 'party', target: 'congregation', needWave: 4, party: [] } }, attrs || {}) };
  }
  function call(day, vid, o) {
    return Object.assign({ day: day, part: 0, vid: vid, source: 'brain',
      commitWinPlanAction: 'party_launch', commitKind: 'EXPEDITION', result: 'launch',
      planStage: 'party', planTarget: 'congregation', planNeedWave: 4,
      profile: 'forager', occupation: 'forager' }, o || {});
  }
  // 1. Attempt counting: brain-path wave-4+ calls count; winPlanDepart
  //    calls do not; non-wave-4 plans do not; 'normal'/'hold' count.
  let c1 = seedOut({ departCalls: [
    call(10, 'alice'),
    call(11, 'alice', { result: 'hold' }),
    call(12, 'alice', { result: 'normal' }),
    call(13, 'alice', { source: 'winPlanDepart' }),
    call(14, 'alice', { planTarget: 'spool', planNeedWave: 3 }),
  ] });
  let a1 = analyzeSeed(c1);
  check('attempts count 3 (brain w4 only)', a1.attempts === 3);
  check('launches count 1', a1.launchesN === 1);
  check('holds 1, normals 1', a1.holds === 1 && a1.normals === 1);
  check('winPlanDepart attempts counted separately', a1.wpAttempts === 1);
  // 2. Choke days: staged census day with no call = choke; with call = not.
  let c2 = seedOut({ planCensus: [
    censusRow(10, 'alice'), censusRow(11, 'alice'),
    censusRow(12, 'alice', { occupation: 'ranger', profile: 'wanderer' }),
    censusRow(13, 'alice', { plan: { stage: 'gear', target: 'congregation', needWave: 4, party: [] } }),
    censusRow(14, 'alice', { plan: { stage: 'hunt', target: null, needWave: null, party: [] } }),
  ], departCalls: [call(10, 'alice')] });
  let a2 = analyzeSeed(c2);
  check('staged days 4 (gear excluded)', a2.stagedDays === 4);
  check('choke days 3 (day 10 had a call)', a2.chokeDays === 3);
  check('choke rate 0.75', a2.chokeRate === 0.75);
  check('byOcc forager staged 3 choke 2', a2.byOcc.forager && a2.byOcc.forager.staged === 3 && a2.byOcc.forager.choke === 2);
  check('byOcc ranger staged 1 choke 1', a2.byOcc.ranger && a2.byOcc.ranger.staged === 1 && a2.byOcc.ranger.choke === 1);
  check('byShape targeted-w4 staged 3', a2.byShape['targeted-w4'] && a2.byShape['targeted-w4'].staged === 3);
  check('byShape targetless-hunt staged 1', a2.byShape['targetless-hunt'] && a2.byShape['targetless-hunt'].staged === 1);
  // 3. STUCK: >= 7 staged days, zero calls anywhere.
  const census7 = [];
  for (let d = 20; d < 27; d++) census7.push(censusRow(d, 'bob'));
  let c3 = seedOut({ planCensus: census7, departCalls: [] });
  let a3 = analyzeSeed(c3);
  check('stuck found (7 days, 0 calls)', a3.stuck.length === 1 && a3.stuck[0].vid === 'bob');
  let c3b = seedOut({ planCensus: census7, departCalls: [call(22, 'bob')] });
  check('not stuck when a call exists', analyzeSeed(c3b).stuck.length === 0);
  const census6 = [];
  for (let d = 20; d < 26; d++) census6.push(censusRow(d, 'bob'));
  check('not stuck at 6 days', analyzeSeed(seedOut({ planCensus: census6, departCalls: [] })).stuck.length === 0);
  // 4. Release row: forager profile, staged w4 plan, no party_launch commit.
  let c4 = seedOut({ departCalls: [
    call(30, 'alice', { commitWinPlanAction: null, result: 'normal' }),
    call(31, 'alice', { commitWinPlanAction: 'party_launch' }),
    call(32, 'alice', { commitWinPlanAction: null, profile: 'wanderer' }),
  ] });
  let a4 = analyzeSeed(c4);
  check('first release day 30', a4.firstReleaseDay === 30);
  check('release rows counted on ctl side', a4.ctlReleaseRows === 1);
  // 5. Sub-choke classes.
  let c5 = seedOut({ planCensus: [
    censusRow(10, 'alice'),
    censusRow(11, 'alice'),
    censusRow(12, 'alice'),
    censusRow(13, 'alice'),
  ], scorePicks: [
    { day: 10, part: 0, vid: 'alice', pickKind: 'EXPEDITION', winPlanAction: 'party_launch', override: 'win_plan:party_launch', deferred: 'party_launch:no-tick-exact', commitKind: null, commitWinPlanAction: null, commitDay: null },
    { day: 11, part: 0, vid: 'alice', pickKind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', override: 'win_plan:gear_hold', deferred: null, commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'gear_hold', commitDay: 11 },
    { day: 12, part: 0, vid: 'alice', pickKind: 'HAVEN_CHORE', winPlanAction: 'party_wait', override: 'win_plan:party_wait', deferred: null, commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'party_wait', commitDay: 12 },
  ], dawnPool: [{ day: 10, byProfileAtHaven: {}, eligibleCompanions: 0, rosterN: 10 }] });
  let a5 = analyzeSeed(c5);
  check('sub-choke part3-deferred counted', (a5.subChoke['commit-written-part3-deferred'] || 0) === 1);
  check('sub-choke gear-hold counted', (a5.subChoke['stage-gear-hold'] || 0) === 1);
  check('sub-choke party-wait counted', (a5.subChoke['party-wait-no-companion'] || 0) === 1);
  check('sub-choke never-scored counted', (a5.subChoke['never-scored'] || 0) === 1);
  check('sub-choke elig cross-tab', (a5.subChoke['commit-written-part3-deferred|elig=0'] || 0) === 1);
  // 6. Verdict math on staged legs.
  function legRows(mode, specs) {
    return specs.map(function (s, i) {
      return analyzeSeed(seedOut(Object.assign({ seed: 107423 + i, mode: mode }, s)));
    });
  }
  function attemptCall(day, vid) { return call(day, vid, { result: 'launch' }); }
  const ctlLeg = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), attemptCall(11, 'alice'), attemptCall(12, 'alice'), attemptCall(13, 'alice'),
        attemptCall(14, 'alice'), attemptCall(15, 'alice'), attemptCall(16, 'alice')],
      planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice'), attemptCall(11, 'alice'), attemptCall(12, 'alice')],
      planCensus: [censusRow(10, 'alice')] },
  ]);
  // NOTE: under the shape-agnostic bound (re-judge prereg §4a) the
  // staged arm legs' first divergence IS their first extra depart
  // call (day 11), so the det-gate PASSES here — the staged verdict
  // test now isolates the stuck-plan bar instead.
  const v = analyze(ctlLeg, armLeg, {});
  check('staged attempts arm 10 vs ctl 2', v.arm.attempts === 10 && v.ctl.attempts === 2);
  check('staged primaryAttempts passes', v.bars.primaryAttempts === true);
  check('staged det-gate passes under shape-agnostic bound (first divergence == first extra depart)', v.bars.detGate === true);
  check('staged verdict NO-GO via stuck bar (no control-stuck plans)', v.verdict === 'NO-GO' && v.bars.primaryStuckDeparts === false);
  // A passing det-gate REQUIRES the arm's pre-bound streams to equal
  // ctl's AND ctl release rows to be 0: the bound must be before any
  // divergence. Build that case: arm legs identical to ctl legs
  // except a release row on day 90.
  const ctlLeg3 = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg3 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')] },
  ]);
  const v3 = analyze(ctlLeg3, armLeg3, {});
  check('det-gate passes when pre-bound streams identical', v3.bars.detGate === true);
  check('attempts bar fails on +0 (needs +4)', v3.bars.primaryAttempts === false);
  // Zero-attempt rule.
  const v0 = analyze(legRows('ctl', [{ departCalls: [attemptCall(10, 'alice')] }]),
    legRows('arm', [{ departCalls: [attemptCall(10, 'alice')] }]), {});
  check('zero-attempt rule INCONCLUSIVE', v0.verdict === 'INCONCLUSIVE');
  // 7. Shape-agnostic bound: a stream diverging BEFORE any extra
  // depart call fails the det-gate (attribution, not just equality).
  function deathRow(day) { return { day: day, kind: 'starved', cause: 'hunger' }; }
  const ctlLeg7 = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg7 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')], deaths: [deathRow(20)] },
  ]);
  const v7 = analyze(ctlLeg7, armLeg7, {});
  check('det-gate fails when a stream diverges before the first extra depart call',
    v7.bars.detGate === false && v7.det[0].firstDivergenceDay === 20 && v7.det[0].firstExtraDepartDay === 90);
  // 8. Divergence with NO extra depart call at all also fails.
  const armLeg8 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')], deaths: [deathRow(20)] },
  ]);
  const v8 = analyze(ctlLeg7, armLeg8, {});
  check('det-gate fails when streams diverge with no extra depart call',
    v8.bars.detGate === false && v8.det[0].firstExtraDepartDay == null);
  // 9. Anchors: supplied + matching -> pass; missing -> FAIL (never
  // vacuous checked:false); mismatched -> fail.
  // 10. DEPARTSAFE bound (sim-departsafe-a): a non-skipped safety
  // call on day 40 is a lever effect, so the bound is 40 even
  // though the first extra depart call is day 90 — the gate
  // passes, and the staging isolates the bound rule (the safety
  // row is the only day-40 difference).
  function safetyCall(day, vid, o) {
    return Object.assign({ day: day, part: 0, members: [vid, 'diana'], needWave: 4, target: 'congregation',
      ok: false, skipped: false, fails: [{ vid: vid, reasons: ['hp<70'] }], checked: [vid, 'diana'] }, o || {});
  }
  const ctlLeg10 = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg10 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  const vs10 = analyze(ctlLeg10, armLeg10, {});
  check('safety-extended bound: first safety day 40 is the bound, gate passes',
    vs10.bars.detGate === true && vs10.det[0].firstSafetyDay === 40 && vs10.det[0].bound === 40 &&
    vs10.det[0].firstExtraDepartDay === 90 && vs10.det[0].firstDivergenceDay === 40);
  check('safety census counts the hold', analyzeSeed(seedOut({ departSafeCalls: [safetyCall(40, 'alice'), safetyCall(41, 'alice', { ok: true, fails: [] }), safetyCall(42, 'alice', { skipped: true })] })).safetyHolds === 1 &&
    analyzeSeed(seedOut({ departSafeCalls: [safetyCall(40, 'alice'), safetyCall(41, 'alice', { ok: true, fails: [] }), safetyCall(42, 'alice', { skipped: true })] })).safetyPasses === 1 &&
    analyzeSeed(seedOut({ departSafeCalls: [safetyCall(40, 'alice'), safetyCall(41, 'alice', { ok: true, fails: [] }), safetyCall(42, 'alice', { skipped: true })] })).safetySkips === 1);
  // 11. A stream diverging BEFORE the first safety effect still
  // fails the gate (attribution, not just equality).
  const armLeg11 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      deaths: [deathRow(20)], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  const vs11 = analyze(ctlLeg10, armLeg11, {});
  check('det-gate fails when a stream diverges before the first safety effect',
    vs11.bars.detGate === false && vs11.det[0].firstDivergenceDay === 20 && vs11.det[0].firstSafetyDay === 40);
  // 12. The ctl leg must record ZERO safety calls (old code has no
  // hook); a ctl safety row fails the gate even when the streams
  // are otherwise identical.
  const ctlLeg12 = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  const armLeg12 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')], departSafeCalls: [safetyCall(40, 'alice')] },
  ]);
  const vs12 = analyze(ctlLeg12, armLeg12, {});
  check('det-gate fails when the ctl leg records safety calls',
    vs12.bars.detGate === false && vs12.det[0].mismatches.some(function (m) { return m.indexOf('departSafeCalls') !== -1; }));
  // 12b. DEPARTSAFE (sim-departsafe-a): SKIPPED safety calls are
  // invisible to the gate — an arm leg whose only safety rows are
  // skips (non-wave-4+ departures) passes, with no safety effect
  // and no divergence. (Pilot band: seeds 107602-107604/107606-
  // 107608 diverged on day 5-11 on skipped rows alone.)
  const armLeg12b = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      departSafeCalls: [safetyCall(5, 'alice', { skipped: true }), safetyCall(6, 'alice', { skipped: true })] },
  ]);
  const v12b = analyze(ctlLeg10, armLeg12b, {});
  check('det-gate passes when the arm leg records only skipped safety calls',
    v12b.bars.detGate === true && v12b.det[0].firstSafetyDay == null && v12b.det[0].firstDivergenceDay == null);
  // 12c. A skipped row does not MASK a real divergence: skipped
  // rows day 5-6 plus a death day 20 still fails, on day 20.
  const armLeg12c = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      deaths: [deathRow(20)], departSafeCalls: [safetyCall(5, 'alice', { skipped: true })] },
  ]);
  const v12c = analyze(ctlLeg10, armLeg12c, {});
  check('skipped safety rows do not mask a real divergence',
    v12c.bars.detGate === false && v12c.det[0].firstDivergenceDay === 20);
  // 13. Bid-inclusive bound (sim-departsafe-rejudge-a §2): the
  // first party_launch BID for a staged wave-4+ plan is a lever
  // effect day, so the bound is the earliest of first extra depart
  // call / first safety effect / first bid divergence.
  function bidRow(day, vid, o) {
    return Object.assign({ day: day, part: 0, vid: vid, pickKind: 'EXPEDITION',
      winPlanAction: 'party_launch', override: 'win_plan:party_launch', deferred: null,
      commitKind: 'EXPEDITION', commitWinPlanAction: 'party_launch', commitDay: day }, o || {});
  }
  function waitBid(day, vid, o) {
    return Object.assign({ day: day, part: 3, vid: vid, pickKind: 'HAVEN_CHORE',
      winPlanAction: 'party_wait', override: 'win_plan:party_wait', deferred: null,
      commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'party_wait', commitDay: day }, o || {});
  }
  // 13a. The 107611 shape: deferred part-3 bid day 64, extra
  // depart call day 65, first safety effect day 66 — the bound
  // is 64 (the bid) and the gate passes.
  const ctlLeg13a = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      scorePicks: [waitBid(64, 'desmond')] },
  ]);
  const armLeg13a = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'),
        call(65, 'desmond', { planTarget: 'eulogy', part: 2, result: 'normal',
          commitWinPlanAction: null, commitKind: null })],
      planCensus: [censusRow(10, 'alice')],
      scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
        commitKind: null, commitWinPlanAction: null, commitDay: null })],
      departSafeCalls: [safetyCall(66, 'desmond')] },
  ]);
  const v13a = analyze(ctlLeg13a, armLeg13a, {});
  check('bid-inclusive bound: deferred bid day 64 is the bound (107611 shape), gate passes',
    v13a.bars.detGate === true && v13a.det[0].firstBidDivergenceDay === 64 &&
    v13a.det[0].bound === 64 && v13a.det[0].firstExtraDepartDay === 65 &&
    v13a.det[0].firstSafetyDay === 66 && v13a.det[0].firstDivergenceDay === 64);
  // 13b. Same-day bid: bid day = call day = bound, gate passes.
  const ctlLeg13b = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      scorePicks: [waitBid(79, 'zoltan')] },
  ]);
  const armLeg13b = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), call(79, 'zoltan', { planTarget: 'eater' })],
      planCensus: [censusRow(10, 'alice')], scorePicks: [bidRow(79, 'zoltan')] },
  ]);
  const v13b = analyze(ctlLeg13b, armLeg13b, {});
  check('bid-inclusive bound: same-day bid day 79 is the bound, gate passes',
    v13b.bars.detGate === true && v13b.det[0].firstBidDivergenceDay === 79 &&
    v13b.det[0].bound === 79 && v13b.det[0].firstExtraDepartDay === 79 &&
    v13b.det[0].firstDivergenceDay === 79);
  // 13c. A bid for a NON-wave-4+ plan does NOT count: the bid day
  // 30 is ignored, the bound stays at the first extra depart call
  // (90), and the day-20 divergence still fails the gate.
  const ctlLeg13c = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg13c = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'),
        call(30, 'bob', { planTarget: 'deer', planNeedWave: 3 }),
        call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')], deaths: [deathRow(20)],
      scorePicks: [bidRow(30, 'bob')] },
  ]);
  const v13c = analyze(ctlLeg13c, armLeg13c, {});
  check('bid-inclusive bound: non-wave-4+ bid does not count, pre-bid divergence fails',
    v13c.bars.detGate === false && v13c.det[0].firstBidDivergenceDay == null &&
    v13c.det[0].firstDivergenceDay === 20 && v13c.det[0].firstExtraDepartDay === 90);
  // 13d. A divergence BEFORE the first bid still fails the gate
  // (the bid does not mask it).
  const armLeg13d = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'),
        call(65, 'desmond', { planTarget: 'eulogy', part: 2, result: 'normal',
          commitWinPlanAction: null, commitKind: null })],
      planCensus: [censusRow(10, 'alice')], deaths: [deathRow(20)],
      scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
        commitKind: null, commitWinPlanAction: null, commitDay: null })] },
  ]);
  const v13d = analyze(ctlLeg13a, armLeg13d, {});
  check('bid-inclusive bound: divergence before the first bid still fails',
    v13d.bars.detGate === false && v13d.det[0].firstBidDivergenceDay === 64 &&
    v13d.det[0].firstDivergenceDay === 20 && v13d.det[0].bound === 64);
  // 13e. A bid with NO wave-4+ depart call on its execution day
  // does NOT count (the tight window): no lever-effect day exists,
  // so the day-20 divergence fails the gate.
  const armLeg13e = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')],
      deaths: [deathRow(20)],
      scorePicks: [bidRow(64, 'desmond', { part: 3, deferred: 'party_launch:no-tick-exact',
        commitKind: null, commitWinPlanAction: null, commitDay: null })] },
  ]);
  const v13e = analyze(ctlLeg13a, armLeg13e, {});
  check('bid-inclusive bound: bid with no wave-4+ call on its execution day does not count',
    v13e.bars.detGate === false && v13e.det[0].firstBidDivergenceDay == null &&
    v13e.det[0].firstDivergenceDay === 20);
  // 13. Anchors: supplied + matching -> pass; missing -> FAIL (never
  const anchorOk = { ctlAnchor: 'abc', armAnchor: 'abc', ctlBrain: 'br1', armBrain: 'br1',
    ctlWinplan: 'wp1', armWinplan: 'wp1' };
  const v9 = analyze(ctlLeg3, armLeg3, anchorOk);
  check('anchor checks pass when expected values match', v9.bars.anchor === true &&
    v9.anchorChecks.every(function (c) { return c.checked === true && c.pass === true; }));
  const v9b = analyze(ctlLeg3, armLeg3, {});
  check('anchor checks FAIL when expectations are missing (no vacuous checked:false)',
    v9b.bars.anchor === false &&
    v9b.anchorChecks.every(function (c) { return c.checked === true && c.pass === false; }));
  const v9c = analyze(ctlLeg3, armLeg3, Object.assign({}, anchorOk, { armBrain: 'WRONG' }));
  check('anchor checks fail on a mismatched sha', v9c.bars.anchor === false);
  // 10. Total-deaths guardrail (re-judge bar 8): armed mean <= ctl
  // mean + 5 passes; +6 fails. Deaths-per-extra-launch diagnostic.
  function deathLeg(mode, n) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(deathRow(5));
    return legRows(mode, [{ departCalls: [attemptCall(10, 'alice')], deaths: arr }]);
  }
  const v10 = analyze(deathLeg('ctl', 10), deathLeg('arm', 14), anchorOk);
  check('total-deaths bar passes at +4 mean', v10.bars.totalDeaths === true &&
    v10.ctl.meanDeaths === 10 && v10.arm.meanDeaths === 14);
  const v10b = analyze(deathLeg('ctl', 10), deathLeg('arm', 16), anchorOk);
  check('total-deaths bar fails at +6 mean', v10b.bars.totalDeaths === false);
  const v10c = analyze(deathLeg('ctl', 10), deathLeg('arm', 14), anchorOk);
  check('deaths-per-extra-launch is null when launches do not rise', v10c.deathsPerExtraLaunch == null);
  // 11. Order-insensitive det-gate (sim-detgate-order-a §4):
  // party/member/companion order, beat-text name order, and the
  // party plan-target multiset are NOT divergences; a multiset-
  // changing target difference and a non-party target difference ARE.
  function huntPlan(target, party) {
    return { stage: 'hunt', target: target, needWave: 4, party: (party || []).slice() };
  }
  function departRow(day, vid, party, targetByVid) {
    const members = [vid].concat(party).map(function (m) {
      return { vid: m, plan: { stage: 'hunt',
        target: (targetByVid && targetByVid[m] !== undefined) ? targetByVid[m] : 'herald',
        needWave: 4, party: [] } };
    });
    return { day: day, vid: vid, source: 'brain', result: 'launch',
      winPlanAction: 'party_launch',
      companion: party[0] || null, companion2: party[1] || null, companion3: party[2] || null,
      stage: 'hunt', target: 'herald', needWave: 4,
      party: party.slice(), partySize: party.length + 1, members: members };
  }
  function departRowNoPlans(day, vid, party) {
    return { day: day, vid: vid, source: 'brain', result: 'launch',
      winPlanAction: 'party_launch',
      companion: party[0] || null, companion2: party[1] || null, companion3: party[2] || null,
      stage: 'hunt', target: 'herald', needWave: 4,
      party: party.slice(), partySize: party.length + 1,
      members: [vid].concat(party).map(function (m) { return { vid: m }; }) };
  }
  function seedRow(day, vid, target) {
    return { day: day, vid: vid, mid: 'herald', wave: 4, outcome: 'fled', seeded: true,
      before: { stage: 'hunt', target: target, needWave: 4 },
      after: { stage: 'hunt', target: target, needWave: 4 } };
  }
  function pairVerdict(ctlSpec, armSpec) {
    return analyze([legRows('ctl', [ctlSpec])[0]], [legRows('arm', [armSpec])[0]], {});
  }
  function extraCall() { return call(90, 'alice', { commitWinPlanAction: null, result: 'normal' }); }
  // A. Party / member / companion order only.
  const vA = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      v4departs: [departRow(10, 'alice', ['bob', 'carol'], { alice: 'herald', bob: 'herald', carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(10, 'bob', { plan: huntPlan('herald', ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      v4departs: [departRow(10, 'alice', ['carol', 'bob'], { alice: 'herald', bob: 'herald', carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['carol', 'bob']) }),
        censusRow(10, 'bob', { plan: huntPlan('herald', ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ] });
  check('order-insensitive: party/member/companion order is not a divergence',
    vA.bars.detGate === true && vA.det[0].firstDivergenceDay === 90 && vA.det[0].firstExtraDepartDay === 90);
  // B. Party plan-target multiset swap (companion-1 keeps null).
  const vB = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      v4departs: [departRow(10, 'alice', ['bob', 'carol'], { alice: 'herald', bob: null, carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(10, 'bob', { plan: huntPlan(null, ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      v4departs: [departRow(10, 'alice', ['carol', 'bob'], { alice: 'herald', bob: 'herald', carol: null })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['carol', 'bob']) }),
        censusRow(10, 'bob', { plan: huntPlan('herald', ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan(null, ['alice', 'bob']) }) ] });
  check('order-insensitive: party plan-target multiset swap is not a divergence',
    vB.bars.detGate === true && vB.det[0].firstDivergenceDay === 90);
  // C. Beat-text name order.
  const vC = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      beatLines: [{ day: 10, text: '📺 SYSTEM: "Yara sets out with Ofelia, Thabo and Vasyl after The Herald — the fire marks the trail."' }] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      beatLines: [{ day: 10, text: '📺 SYSTEM: "Yara sets out with Thabo, Ofelia and Vasyl after The Herald — the fire marks the trail."' }] });
  check('order-insensitive: beat-text name order is not a divergence',
    vC.bars.detGate === true && vC.det[0].firstDivergenceDay === 90);
  // D. departBeats launched order.
  const vD = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      departBeats: [{ day: 10, vid: 'alice', launched: ['bob', 'carol'], target: 'herald', needWave: 4, ret: true, reseedSpoke: false, ordinarySpoke: true }] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      departBeats: [{ day: 10, vid: 'alice', launched: ['carol', 'bob'], target: 'herald', needWave: 4, ret: true, reseedSpoke: false, ordinarySpoke: true }] });
  check('order-insensitive: departBeats launched order is not a divergence',
    vD.bars.detGate === true && vD.det[0].firstDivergenceDay === 90);
  // E. Multiset-changing target difference still diverges.
  const vE = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      v4departs: [departRow(10, 'alice', ['bob', 'carol'], { alice: 'herald', bob: null, carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(10, 'bob', { plan: huntPlan(null, ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      v4departs: [departRow(10, 'alice', ['bob', 'carol'], { alice: 'herald', bob: 'eulogy', carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(10, 'bob', { plan: huntPlan('eulogy', ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ] });
  check('order-insensitive: multiset-changing target difference still diverges',
    vE.bars.detGate === false && vE.det[0].firstDivergenceDay === 10 && vE.det[0].firstExtraDepartDay === 90);
  // F. Non-party plan-target difference still diverges.
  const vF = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      planCensus: [censusRow(10, 'dave', { plan: huntPlan(null, []) })] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      planCensus: [censusRow(10, 'dave', { plan: huntPlan('herald', []) })] });
  check('order-insensitive: non-party plan-target difference still diverges',
    vF.bars.detGate === false && vF.det[0].firstDivergenceDay === 10);
  // G. planSeeds before/after target swap (no census rows: the
  // collection falls through to the planSeeds snapshots).
  const vG = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      v4departs: [departRowNoPlans(10, 'alice', ['bob', 'carol'])],
      planSeeds: [seedRow(10, 'bob', null), seedRow(10, 'carol', 'herald')] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      v4departs: [departRowNoPlans(10, 'alice', ['carol', 'bob'])],
      planSeeds: [seedRow(10, 'bob', 'herald'), seedRow(10, 'carol', null)] });
  check('order-insensitive: planSeeds target swap is not a divergence',
    vG.bars.detGate === true && vG.det[0].firstDivergenceDay === 90);
  // H. The party persists: the same party fights again the NEXT day
  // with the same swapped targets (seed 107423 d99 -> d100). The
  // multiset is tracked per party per day, not just on the
  // departure day.
  function fightRow(day, vid, targetByVid, party) {
    function planFor(m) {
      const others = party.filter(function (x) { return x !== m; });
      return { stage: 'hunt',
        target: (targetByVid && targetByVid[m] !== undefined) ? targetByVid[m] : 'herald',
        needWave: 4, party: others };
    }
    const allies = party.slice(1);
    return { day: day, vid: vid, mid: 'herald', wave: 4, alliesN: allies.length,
      allyVids: allies.slice(), allyFromStart: false, outcome: 'vFlee', rounds: 3,
      vTaken: 66, mDealt: 30, calledHelp: true, allyVid: 'bob', volley: null,
      planParty: party.slice(1),
      lead: { vid: vid, plan: planFor(vid) },
      allies: allies.map(function (m) { return { vid: m, plan: planFor(m) }; }) };
  }
  const vH = pairVerdict(
    { departCalls: [attemptCall(10, 'alice')],
      v4departs: [departRow(10, 'alice', ['bob', 'carol'], { alice: 'herald', bob: null, carol: 'herald' })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(10, 'bob', { plan: huntPlan(null, ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }),
        censusRow(11, 'alice', { plan: huntPlan('herald', ['bob', 'carol']) }),
        censusRow(11, 'bob', { plan: huntPlan(null, ['alice', 'carol']) }),
        censusRow(11, 'carol', { plan: huntPlan('herald', ['alice', 'bob']) }) ],
      v4fights: [fightRow(11, 'alice', { alice: 'herald', bob: null, carol: 'herald' }, ['alice', 'bob', 'carol'])] },
    { departCalls: [attemptCall(10, 'alice'), extraCall()],
      v4departs: [departRow(10, 'alice', ['carol', 'bob'], { alice: 'herald', bob: 'herald', carol: null })],
      planCensus: [
        censusRow(10, 'alice', { plan: huntPlan('herald', ['carol', 'bob']) }),
        censusRow(10, 'bob', { plan: huntPlan('herald', ['alice', 'carol']) }),
        censusRow(10, 'carol', { plan: huntPlan(null, ['alice', 'bob']) }),
        censusRow(11, 'alice', { plan: huntPlan('herald', ['carol', 'bob']) }),
        censusRow(11, 'bob', { plan: huntPlan('herald', ['alice', 'carol']) }),
        censusRow(11, 'carol', { plan: huntPlan(null, ['alice', 'bob']) }) ],
      v4fights: [fightRow(11, 'alice', { alice: 'herald', bob: 'herald', carol: null }, ['alice', 'carol', 'bob'])] });
  check('order-insensitive: next-day fight of the same party is not a divergence',
    vH.bars.detGate === true && vH.det[0].firstDivergenceDay === 90);
  console.log('dawnchoke analyzer selftest: ' + pass + ' pass, ' + fail + ' fail');
  return fail === 0;
}

if (require.main === module) (async function () {
  if (process.argv.includes('--selftest')) {
    process.exit(selftest() ? 0 : 1);
  }
  function arg(name, dflt) {
    const i = process.argv.indexOf('--' + name);
    return i === -1 ? dflt : process.argv[i + 1];
  }
  const diagOnlyFlag = process.argv.includes('--diag-only');
  const ctlDir = arg('ctl', null);
  const armDir = arg('arm', null);
  const outFile = arg('out', null);
  if (!ctlDir) {
    console.error('usage: node scripts/analyze-dawnchoke-a.js --ctl <dir> [--arm <dir> --out <file>] [--seeds ...] [--ctl-brain <sha> --arm-brain <sha>] [--diag-only]');
    process.exit(2);
  }
  const seeds = (arg('seeds', null) || '107423,107424,107425,107426,107427,107428,107429,107430')
    .split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  const ctlRows = loadLeg(ctlDir, 'ctl', seeds);
  if (diagOnlyFlag) {
    const d = diagOnly(ctlRows);
    console.log(JSON.stringify(d, null, 2));
    if (outFile) fs.writeFileSync(outFile, JSON.stringify(d, null, 2) + '\n');
    return;
  }
  if (!armDir || !outFile) {
    console.error('usage: node scripts/analyze-dawnchoke-a.js --ctl <dir> --arm <dir> --out <file> [--seeds ...]');
    process.exit(2);
  }
  const armRows = loadLeg(armDir, 'arm', seeds);
  const result = analyze(ctlRows, armRows, {
    ctlBrain: arg('ctl-brain', null), armBrain: arg('arm-brain', null),
    ctlWinplan: arg('ctl-winplan', null), armWinplan: arg('arm-winplan', null),
    ctlAnchor: arg('ctl-anchor', null), armAnchor: arg('arm-anchor', null),
  });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, zeroAttempt: result.zeroAttempt,
    ctlAttempts: result.ctl.attempts, armAttempts: result.arm.attempts,
    ctlLaunches: result.ctl.launches, armLaunches: result.arm.launches,
    ctlStuckCount: result.ctlStuckCount, stuckDeparted: result.stuckDeparted,
    ctlChokeRate: result.ctl.choke.chokeRate, armChokeRate: result.arm.choke.chokeRate,
    ctlStarv: result.ctl.starvDeaths, armStarv: result.arm.starvDeaths,
    maxStarvExcess: result.maxStarvExcess,
    ctlMeanDeaths: result.ctl.meanDeaths, armMeanDeaths: result.arm.meanDeaths,
    deathsPerExtraLaunch: result.deathsPerExtraLaunch,
    ctlMedian: result.ctl.medianSurvival, armMedian: result.arm.medianSurvival,
    detPass: result.detPass, anchorChecks: result.anchorChecks, bars: result.bars, out: outFile }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { analyze: analyze, analyzeSeed: analyzeSeed, selftest: selftest,
  detGateForSeed: detGateForSeed, diagOnly: diagOnly,
  isW4Plan: isW4Plan, isStagedW4: isStagedW4, isTargetlessHunt: isTargetlessHunt,
  isReleaseRow: isReleaseRow, isStarvationDeath: isStarvationDeath, median: median, W4P_SET: W4P_SET,
  firstExtraDepartDay: firstExtraDepartDay, firstDivergenceDay: firstDivergenceDay,
  firstSafetyDay: firstSafetyDay, firstBidDivergenceDay: firstBidDivergenceDay,
  firstSafetyDay: firstSafetyDay,
  canonicalMultisets: canonicalMultisets, canonicalizeRow: canonicalizeRow };
