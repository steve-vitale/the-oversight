// analyze-reseed-b.js — analyzer + judge, arm sim-reseed-b.
// The re-seed lever (finding #2626): for every wave-4+ launch on the
// designated band, classify the launch by the last FOUGHT encounter
// of its target type BEFORE the launch day — dead (last fight was a
// kill), live (last fight was not a kill), unknown (no fought
// encounter on record) — and cross-check the driver's at-departure
// gate snapshot against the recomputation. Plus the re-seed
// instrument: commit-time retargets (gate.targetBefore differs from
// the row target), expiries (the 'normal' row shape, cross-checked
// against winPlanStats.planExpiries), post-expiry targetless
// launches, re-seeds within 7 days of an expiry, and holders
// fighting again within 14 days.
// INSTRUMENT ONLY — no game code changes.
// Reads ONE per-seed corpus dir (the reseed driver recorder shape)
// and judges the frozen prereg bars (ARMED leg only — the control
// leg is analyzed for the comparison numbers, never judged).
// Usage:
//   node scripts/analyze-reseed-b.js --dir evidence/2026-11-20/perseed-reseed-b-armed [--out evidence/2026-11-20/reseed-b-armed-analysis.json]
//   node scripts/analyze-reseed-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));

// FROZEN BARS (prereg evidence/2026-11-20/sim-reseed-b-prereg.md).
const BARS = {
  poolLaunches: 6,      // launches on the band (floor; fewer = METRIC-BROKEN)
  classifiedShare: 1.0, // every launch in exactly one class by construction
  reseedLaunches: 1,    // rumor re-seed launches on the armed leg (floor)
  reseededShare: 2 / 3, // expired holders re-seeded within 7 days
  foughtAgainShare: 2 / 3, // expired holders fighting again within 14 days
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
// CORRECTION (2026-11-20, found by the gate cross-check on the
// judged corpus): same-day ties resolve to the LAST row in file
// order (the recorder appends chronologically, so the last row at
// the max day is the latest fight of that day). The first version
// used a strict `>` and kept the FIRST row at the max day — on
// seed 106084 d126 a flee and the kill share the day, and the
// first-version analyzer took the flee while the driver's
// at-departure snapshot (last write wins) took the kill: 2 gate
// mismatches, and both d136/d141 re-launches misclassified as
// live. The frozen rule ("the LAST pre-launch fought encounter")
// never changed; the implementation now matches it.
function lastFoughtBefore(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day >= launch.day) continue;
    if (!isFought(e)) continue;
    if (!best || e.day >= best.day) best = e;
  }
  return best;
}

// Latest encounter of the target type strictly before the launch
// day, fought or evaded (the monster was seen alive). Returns null
// when no such row exists. Same last-row-wins tie-break as
// lastFoughtBefore (see the correction note above).
function lastSightedBefore(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day >= launch.day) continue;
    if (!best || e.day >= best.day) best = e;
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
      // RE-SEED EXCEPTION (sim-reseed-b): the snapshot is taken
      // BEFORE the departure call, so for a re-seeded launch it
      // describes the OLD target (gate.targetBefore) while the row
      // carries the NEW target. The snapshot's last-fight fields
      // must be recomputed for targetBefore, not the row target —
      // comparing them against the new target flagged the 106081
      // herald->reunion re-seeds as mismatches on the armed leg.
      // The row's own class still uses the row (new) target: the
      // launch is on the new kind.
      const gateTarget = (gate.targetBefore != null && gate.targetBefore !== launch.target)
        ? gate.targetBefore : launch.target;
      const foughtForGate = (gateTarget === launch.target) ? lastFought
        : lastFoughtBefore(d, { target: gateTarget, day: launch.day });
      const snapDay = (gate.lastFightDay != null ? gate.lastFightDay : null);
      const recomDay = (foughtForGate ? foughtForGate.day : null);
      const snapKill = (gate.lastFightKill != null ? !!gate.lastFightKill : null);
      const recomKill = (foughtForGate ? !!foughtForGate.vKill : null);
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

// POST-EXPIRY TARGETLESS COUNT (sim-reseed-b, finding #2626):
// an expiry writes a dawnbidDeparts row (result 'normal',
// winPlanAction 'party_launch', stage 'party', target null,
// vidExped false, companionExped false). A stale commit also
// returns 'normal', but its companion has already departed
// (companionExped true) — the rule separates them. Validated on
// the deadsuppress corpora (16 files) by the targetless arm:
// rule-blocks == winPlanStats.deadTargetHolds on every seed;
// post-block count == 12 on the armed leg (the evidence's hand
// count). This arm's cross-check is rule-expiries ==
// winPlanStats.planExpiries on every seed.
// CORRECTION (2026-11-20, found on the reseed corpora): the row
// shape alone has TWO false positives on this base, both on the
// control leg where the lever is off and planExpiries is 0 —
// (1) a hurt-blocked holder (vidBlock 'hurt-no-medicine-no-healer',
// 106089 d107: the holder cannot depart, commit returns 'normal');
// (2) a mid-day no-depart commit for a NEVER-TARGETED plan
// (vidBlock 'unknown', 106091 d45: the holder launched targetless
// on d20/d29/d34/d37 and again on d51 — the plan never had a
// target, so nothing expired). A true expiry requires the plan to
// have HAD a target (the expiry branch only fires for a targeted
// plan, or a stamped expired one): the row counts only when the
// holder's plan is evidenced to have had a target before that day
// — a v4seeds row with a non-null target, or a v4departs row with
// a non-null gate.targetBefore / row target, both strictly before
// the row's day (the analyzer's frozen "before" rule). Validated:
// with this rule, rule-expiries == planExpiries (0) on all 24
// reseed corpora, both legs.
function hadTargetBefore(d, vid, day) {
  for (const s of (d.v4seeds || [])) {
    if (s.vid !== vid || s.day >= day) continue;
    if (s.target != null) return true;
  }
  for (const r of (d.v4departs || [])) {
    if (r.vid !== vid || r.day >= day) continue;
    if (r.target != null) return true;
    if (r.gate && r.gate.targetBefore != null) return true;
  }
  return false;
}

function expiriesOf(d) {
  const out = [];
  for (const r of (d.dawnbidDeparts || [])) {
    if (r.result !== 'normal' || r.winPlanAction !== 'party_launch') continue;
    if (r.stage !== 'party' || r.target != null) continue;
    if (r.vidExped !== false || r.companionExped !== false) continue;
    if (!hadTargetBefore(d, r.vid, r.day)) continue;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, seq: r.seq != null ? r.seq : null });
  }
  return out;
}

// Targetless launches strictly after an expiry day for the same vid,
// deduped by (vid, day): a villager already out returns 'launch'
// on later same-day execute calls without re-launching, so dedupe
// is the rule and the count is reported.
function postExpiryTargetlessLaunches(d, expiries) {
  const byVid = {};
  for (const b of (expiries || [])) {
    if (!byVid[b.vid]) byVid[b.vid] = [];
    byVid[b.vid].push(b.day);
  }
  const seen = {};
  const out = [];
  for (const r of (d.dawnbidDeparts || [])) {
    if (r.result !== 'launch' || r.target != null) continue;
    const days = byVid[r.vid];
    if (!days) continue;
    let after = false;
    for (let i = 0; i < days.length; i++) if (r.day > days[i]) { after = true; break; }
    if (!after) continue;
    const key = [r.vid, r.day].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, seq: r.seq != null ? r.seq : null,
      expiryDays: days.filter(function (x) { return x < r.day; }) });
  }
  return out;
}

// Hold rows after an expiry day for the same vid (reported, not a
// bar): evidence the lever fired on later days, not just expiry days.
function postExpiryHolds(d, expiries) {
  const byVid = {};
  for (const b of (expiries || [])) {
    if (!byVid[b.vid]) byVid[b.vid] = [];
    byVid[b.vid].push(b.day);
  }
  const out = [];
  for (const r of (d.dawnbidDeparts || [])) {
    if (r.result !== 'hold' || r.target != null || r.stage !== 'party') continue;
    const days = byVid[r.vid];
    if (!days) continue;
    let after = false;
    for (let i = 0; i < days.length; i++) if (r.day > days[i]) { after = true; break; }
    if (!after) continue;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, seq: r.seq != null ? r.seq : null,
      expiryDays: days.filter(function (x) { return x < r.day; }) });
  }
  return out;
}

// RE-SEEDS (sim-reseed-b, finding #2626): launch rows whose gate
// snapshot targetBefore differs from the row target — the commit
// point retargeted the plan onto a live rumor. Read from v4departs
// only (dawnbidDeparts rows carry no gate snapshot). Dedupe by
// (vid, day, target): the two departure wraps record the same launch
// twice when both fire, and the dedupe is the rule (same as
// launchesOf). A re-seed that launches is counted as a launch on the
// NEW target (its class is judged by the new target's last fight).
function reseedsOf(d) {
  const out = [];
  const seen = {};
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || !r.target || !r.gate || !r.gate.targetBefore) continue;
    if (r.gate.targetBefore === r.target) continue;
    const key = [r.vid, r.day, r.target].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, from: r.gate.targetBefore, to: r.target,
      source: r.source || null });
  }
  return out;
}

// RE-SEEDED WITHIN N DAYS (sim-reseed-b): for each expiry, whether
// the holder has a live target within `days` — a re-seed launch for
// that vid, or a v4seeds row for that vid (a lived-fight retarget
// via winPlanSeedFromFight; blocked seeds — wave < 3, suburb —
// never retarget and do not count). The window is (expiryDay,
// expiryDay + days]: the expiry day itself never counts (the holder
// was told at dawn that day).
function reseededWithin(d, expiries, reseeds, days) {
  const out = [];
  for (const b of (expiries || [])) {
    let via = null, day = null;
    for (const r of (reseeds || [])) {
      if (r.vid !== b.vid || r.day <= b.day || r.day > b.day + days) continue;
      if (day == null || r.day < day) { via = 'reseed-launch:' + r.from + '->' + r.to; day = r.day; }
    }
    if (!via) {
      for (const s of (d.v4seeds || [])) {
        if (s.vid !== b.vid || s.day <= b.day || s.day > b.day + days) continue;
        if (s.blocked) continue;
        if (day == null || s.day < day) { via = 'lived-fight:' + (s.mid || '?'); day = s.day; }
      }
    }
    out.push({ seed: d.seed, vid: b.vid, expiryDay: b.day,
      reseeded: via != null, withinDays: day != null ? (day - b.day) : null, via: via });
  }
  return out;
}

// HOLDERS FIGHT AGAIN (sim-reseed-b): for each expiry, whether the
// holder fights a wave-3+ beast within `days` — a v4encounters row
// (wave 4+) with vid == holder and a real fight (rounds/mDealt), a
// v4seeds row (wave 3+) with vid == holder, or a re-seed launch by
// the holder. NOTE: a holder fighting only as an ally on someone
// else's launch may be missed by the encounter source (the row's
// vid is the fight's leader); the re-seed-launch and lived-fight
// sources cover the leader cases. The window is (expiryDay,
// expiryDay + days].
function holdersFightAgain(d, expiries, reseeds, days) {
  const out = [];
  for (const b of (expiries || [])) {
    let via = null, day = null;
    for (const r of (reseeds || [])) {
      if (r.vid !== b.vid || r.day <= b.day || r.day > b.day + days) continue;
      if (day == null || r.day < day) { via = 'reseed-launch'; day = r.day; }
    }
    if (!via) {
      for (const s of (d.v4seeds || [])) {
        if (s.vid !== b.vid || s.day <= b.day || s.day > b.day + days || s.blocked) continue;
        if (day == null || s.day < day) { via = 'lived-fight-seed:' + (s.mid || '?'); day = s.day; }
      }
    }
    if (!via) {
      for (const e of (d.v4encounters || [])) {
        if (e.vid !== b.vid || e.day <= b.day || e.day > b.day + days) continue;
        if (!isFought(e)) continue;
        if (day == null || e.day < day) { via = 'encounter:' + (e.mid || '?'); day = e.day; }
      }
    }
    out.push({ seed: d.seed, vid: b.vid, expiryDay: b.day,
      foughtAgain: via != null, withinDays: day != null ? (day - b.day) : null, via: via });
  }
  return out;
}

// Aggregate one corpus dir.
function analyzeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let rows = [];
  let errors = 0, filesRead = 0, duplicates = 0, gateMissing = 0, gateMismatch = 0;
  let postExpiryRows = [], postExpiryHoldRows = [], expiryRows = [], expiryRuleMismatch = 0;
  let reseedRows = [], reseededRows = [], foughtAgainRows = [];
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
    const expiries = expiriesOf(d);
    const pb = postExpiryTargetlessLaunches(d, expiries);
    const ph = postExpiryHolds(d, expiries);
    const rs = reseedsOf(d);
    const rw = reseededWithin(d, expiries, rs, 7);
    const fa = holdersFightAgain(d, expiries, rs, 14);
    expiryRows = expiryRows.concat(expiries);
    postExpiryRows = postExpiryRows.concat(pb);
    postExpiryHoldRows = postExpiryHoldRows.concat(ph);
    reseedRows = reseedRows.concat(rs);
    reseededRows = reseededRows.concat(rw);
    foughtAgainRows = foughtAgainRows.concat(fa);
    const expiriesCount = (d.winPlanStats && d.winPlanStats.planExpiries != null) ? d.winPlanStats.planExpiries : null;
    if (expiriesCount != null && expiries.length !== expiriesCount) expiryRuleMismatch++;
    perSeed.push({ seed: d.seed, launches: a.launches,
      dead: a.rows.filter(function (r) { return r.cls === 'dead'; }).length,
      live: a.rows.filter(function (r) { return r.cls === 'live'; }).length,
      unknown: a.rows.filter(function (r) { return r.cls === 'unknown'; }).length,
      duplicates: a.duplicates, gateMissing: a.gateMissing, gateMismatch: a.gateMismatch,
      expiries: expiries.length, planExpiries: expiriesCount,
      reseeds: rs.length,
      reseededWithin7: rw.filter(function (x) { return x.reseeded; }).length,
      foughtAgain14: fa.filter(function (x) { return x.foughtAgain; }).length,
      postExpiryTargetlessLaunches: pb.length, postExpiryHolds: ph.length });
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
    medianDaysSinceLastFight: median(daysSince),
    expiries: expiryRows, postExpiryTargetlessLaunches: postExpiryRows.length,
    postExpiryTargetlessLaunchRows: postExpiryRows,
    postExpiryHolds: postExpiryHoldRows.length,
    postExpiryHoldRows: postExpiryHoldRows,
    expiryRuleMismatch: expiryRuleMismatch,
    reseeds: reseedRows, reseededWithin7: reseededRows, foughtAgain14: foughtAgainRows,
    reseedsCount: reseedRows.length, expiriesCount: expiryRows.length,
    reseededWithin7Count: reseededRows.filter(function (x) { return x.reseeded; }).length,
    foughtAgain14Count: foughtAgainRows.filter(function (x) { return x.foughtAgain; }).length,
    reseededShare: reseededRows.length ? (reseededRows.filter(function (x) { return x.reseeded; }).length / reseededRows.length) : null,
    foughtAgainShare: foughtAgainRows.length ? (foughtAgainRows.filter(function (x) { return x.foughtAgain; }).length / foughtAgainRows.length) : null };
}

function judge(a, leg) {
  const bars = [];
  bars.push({ id: 'pool-launches', pass: a.launches >= BARS.poolLaunches,
    detail: 'launches ' + a.launches + ' (floor ' + BARS.poolLaunches + '); dead ' + a.dead + ', live ' + a.live + ', unknown ' + a.unknown });
  bars.push({ id: 'classification', pass: a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare,
    detail: 'classified ' + a.classified + '/' + a.launches + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar 1.000); dead share ' + (a.deadShare == null ? 'n/a' : a.deadShare.toFixed(3)) });
  bars.push({ id: 'gate-snapshot', pass: a.gateMissing === 0 && a.gateMismatch === 0,
    detail: 'gate snapshots missing ' + a.gateMissing + ', mismatched vs recomputation ' + a.gateMismatch + ' (bar 0 / 0); duplicate depart rows ' + a.duplicates + ' (expect 0)' });
  bars.push({ id: 'instrument', pass: a.errors === 0 && a.files === 12,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/12' });
  const pb = (a.postExpiryTargetlessLaunches != null ? a.postExpiryTargetlessLaunches : 0);
  const br = (a.expiryRuleMismatch != null ? a.expiryRuleMismatch : 0);
  bars.push({ id: 'expiry-rule', pass: br === 0,
    detail: 'expiry-rule rows vs planExpiries mismatched on ' + br + ' seed(s) (bar 0)' });
  bars.push({ id: 'post-expiry', pass: pb === 0,
    detail: 'post-expiry targetless launches ' + pb + ' (bar 0); post-expiry holds ' + (a.postExpiryHolds != null ? a.postExpiryHolds : 0) });
  const ec = (a.expiriesCount != null ? a.expiriesCount : 0);
  const rc = (a.reseedsCount != null ? a.reseedsCount : 0);
  const rs = (a.reseededShare != null ? a.reseededShare : null);
  const fs = (a.foughtAgainShare != null ? a.foughtAgainShare : null);
  bars.push({ id: 'reseed', pass: ec > 0 && rc >= BARS.reseedLaunches && rs != null && rs >= BARS.reseededShare,
    detail: 'expiries ' + ec + '; re-seed launches ' + rc + ' (floor ' + BARS.reseedLaunches + '); re-seeded within 7d ' + (a.reseededWithin7Count != null ? a.reseededWithin7Count : 0) + '/' + ec + ' = ' + (rs == null ? 'n/a' : rs.toFixed(3)) + ' (bar ' + BARS.reseededShare.toFixed(3) + ')' });
  bars.push({ id: 'holders-fight-again', pass: ec > 0 && fs != null && fs >= BARS.foughtAgainShare,
    detail: 'holders fighting again within 14d ' + (a.foughtAgain14Count != null ? a.foughtAgain14Count : 0) + '/' + ec + ' = ' + (fs == null ? 'n/a' : fs.toFixed(3)) + ' (bar ' + BARS.foughtAgainShare.toFixed(3) + ')' });
  let verdict = 'DIAG-GO', kind = null;
  if (a.launches < BARS.poolLaunches || ec === 0) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (a.errors || a.files !== 12) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.gateMissing || a.gateMismatch) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.classifiedShare == null || a.classifiedShare < BARS.classifiedShare) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (br) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (pb > 0) { verdict = 'NO-GO'; kind = 'POST-BLOCK'; }
  else if (rc < BARS.reseedLaunches || rs == null || rs < BARS.reseededShare) { verdict = 'NO-GO'; kind = 'RESEED'; }
  else if (fs == null || fs < BARS.foughtAgainShare) { verdict = 'NO-GO'; kind = 'FIGHT-AGAIN'; }
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
      mkLaunch(90, 'h8', 'strike', 4, mkGate('hunt', 88, true, 1)),       // CORRECTION PIN: same-day flee-then-kill d88 -> dead (last row wins)
      mkLaunch(95, 'h9', 'congregation', 4, mkGate('hunt', 90, false, 1)), // CORRECTION PIN: same-day kill-then-flee d90 -> live (last row wins)
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
      mkEnc(88, 'x7', 'strike', 'world-tick', 'vFlee', 2, 40, false), // same day, FIRST: flee
      mkEnc(88, 'x8', 'strike', 'world-tick', 'vKill', 5, 300, true), // same day, LAST: kill -> h8 dead
      mkEnc(90, 'x9', 'congregation', 'world-tick', 'vKill', 5, 300, true), // same day, FIRST: kill
      mkEnc(90, 'y9', 'congregation', 'world-tick', 'vFlee', 2, 40, false), // same day, LAST: flee -> h9 live
    ],
  };
  const a = analyzeFile(d);
  check('§A nine launches counted', a.launches === 9, a.launches);
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
  check('§A h8 (correction pin): same-day flee-then-kill d88 -> dead, last row wins',
    byVid.h8.cls === 'dead' && byVid.h8.lastFought.day === 88 && byVid.h8.lastFought.outcome === 'vKill',
    byVid.h8);
  check('§A h9 (correction pin): same-day kill-then-flee d90 -> live, last row wins',
    byVid.h9.cls === 'live' && byVid.h9.lastFought.day === 90 && byVid.h9.lastFought.outcome === 'vFlee',
    byVid.h9);
  check('§A gate cross-check passes on all nine rows (snapshot == recomputation)',
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
    return Object.assign({ dir: 'x', files: 12, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 4, live: 3, unknown: 1, classified: 8, classifiedShare: 1.0, deadShare: 0.5,
      stageBefore: { standing: 4, party: 2, hunt: 2 }, deadStanding: 4, deadSlainKnown: 4,
      deadNeverRefought: 3, withFirstAfter: 5, sameDayFirstAfter: 1, medianDaysSinceLastFight: 6,
      expiriesCount: 2, reseedsCount: 2, reseededWithin7Count: 2, foughtAgain14Count: 2,
      reseededShare: 1.0, foughtAgainShare: 1.0,
      postExpiryTargetlessLaunches: 0, postExpiryHolds: 0, expiryRuleMismatch: 0 }, o);
  }
  let j = judge(mkA({}), null);
  check('§D judge DIAG-GO shape passes', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkA({ launches: 3, dead: 1, live: 1, unknown: 1, classified: 3, deadShare: 1 / 3 }), null);
  check('§D judge METRIC-BROKEN below the launch floor (3 < 6)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkA({ errors: 1 }), null);
  check('§D judge INSTRUMENT on instrument errors', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ files: 7 }), null);
  check('§D judge INSTRUMENT on files != 12', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ gateMismatch: 1 }), null);
  check('§D judge INSTRUMENT on gate mismatch', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT' && !j.bars[2].pass, JSON.stringify(j));
  j = judge(mkA({ gateMissing: 2 }), null);
  check('§D judge INSTRUMENT on missing gate snapshots', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  // §E POST-EXPIRY TARGETLESS COUNT (sim-reseed-b, finding #2626).
  function mkDep(day, vid, result, stage, target, vidExped, compExped, action) {
    return { seq: day * 10, day: day, vid: vid, source: 'brain', result: result,
      winPlanAction: action || 'party_launch', commitKind: 'dawn', commitPart: 0,
      companion: 'c1', companion2: null, companion3: null,
      vidExped: vidExped, companionExped: compExped,
      vidBlock: null, companionBlock: null, stage: stage, target: target, party: [] };
  }
  const de = { seed: 999005, instrumentErrors: [], winPlanStats: { planExpiries: 1 },
    v4departs: [], v4encounters: [],
    // Prior-target evidence: brian's plan HAD a herald target before
    // d69 (a lived-fight seed on d60) — without it the d69 row is a
    // never-targeted no-depart, not an expiry (106091 d45 shape).
    v4seeds: [{ day: 60, vid: 'brian', mid: 'herald', target: 'herald', blocked: false }],
    dawnbidDeparts: [
      mkDep(60, 'brian', 'launch', 'hunt', null, true, true),          // BEFORE the expiry: not counted
      mkDep(69, 'brian', 'normal', 'party', null, false, false),       // THE expiry
      mkDep(69, 'brian', 'hold', 'party', null, false, false),         // same-day hold: not an expiry, not a launch
      mkDep(70, 'brian', 'launch', 'hunt', null, true, true),          // post-expiry 1
      mkDep(71, 'brian', 'hold', 'party', null, false, false),         // post-expiry hold (reported)
      mkDep(74, 'brian', 'launch', 'hunt', null, true, true),          // post-expiry 2
      mkDep(74, 'brian', 'launch', 'hunt', null, true, true),          // same-day duplicate: deduped
      mkDep(76, 'brian', 'launch', 'hunt', null, true, true),          // post-expiry 3
      mkDep(80, 'brian', 'launch', 'hunt', 'spool', true, true),       // targeted launch after expiry: not counted
      mkDep(79, 'gen', 'normal', 'party', null, false, true),          // stale commit (companion out): NOT an expiry
      mkDep(82, 'gen', 'launch', 'hunt', null, true, true),            // gen never expired: not counted
    ] };
  const expiries = expiriesOf(de);
  check('§E expiry rule finds exactly the true expiry (brian d69); the stale gen d79 row is excluded',
    expiries.length === 1 && expiries[0].vid === 'brian' && expiries[0].day === 69, expiries);
  const pb = postExpiryTargetlessLaunches(de, expiries);
  check('§E post-expiry count is 3 (d70/d74/d76, deduped; pre-expiry, targeted, and unexpired launches excluded)',
    pb.length === 3 && pb.map(function (r) { return r.day; }).join(',') === '70,74,76', pb);
  const ph = postExpiryHolds(de, expiries);
  check('§E post-expiry holds counted (1: brian d71)',
    ph.length === 1 && ph[0].day === 71, ph);
  function mkB(o) {
    return Object.assign({ dir: 'x', files: 12, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 0, live: 8, unknown: 0, classified: 8, classifiedShare: 1.0, deadShare: 0,
      stageBefore: { standing: 4, party: 2, hunt: 2 }, deadStanding: 0, deadSlainKnown: 0,
      deadNeverRefought: 0, withFirstAfter: 5, sameDayFirstAfter: 1, medianDaysSinceLastFight: 6,
      expiriesCount: 1, reseedsCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
      reseededShare: 1.0, foughtAgainShare: 1.0,
      postExpiryTargetlessLaunches: 0, postExpiryHolds: 0, expiryRuleMismatch: 0 }, o);
  }
  j = judge(mkB({}), null);
  check('§E judge DIAG-GO with post-expiry 0 and expiry-rule 0',
    j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkB({ postExpiryTargetlessLaunches: 3 }), null);
  check('§E judge NO-GO POST-BLOCK on post-expiry launches > 0',
    j.verdict === 'NO-GO' && j.kind === 'POST-BLOCK', JSON.stringify(j));
  j = judge(mkB({ expiryRuleMismatch: 1 }), null);
  check('§E judge NO-GO INSTRUMENT on expiry-rule mismatch',
    j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  // §E FALSE POSITIVES (2026-11-20, reseed corpora): the row shape
  // alone is not an expiry — a hurt block and a never-targeted
  // mid-day no-depart both write the same row. Neither counts.
  const de2 = { seed: 999008, instrumentErrors: [], winPlanStats: { planExpiries: 0 },
    v4departs: [], v4encounters: [], v4seeds: [],
    dawnbidDeparts: [
      // 106089 shape: hurt holder, stage party, target null.
      { seq: 30, day: 107, vid: 'app1', source: 'brain', result: 'normal',
        winPlanAction: 'party_launch', commitKind: 'mid-day part-1', commitPart: 1,
        companion: 'c1', companion2: null, companion3: null,
        vidExped: false, companionExped: false,
        vidBlock: 'hurt-no-medicine-no-healer', companionBlock: 'unknown',
        stage: 'party', target: null, party: [] },
      // 106091 shape: never-targeted plan, mid-day no-depart, then a
      // targetless launch 6 days later (the village's normal wandering
      // shape — NOT a post-expiry leak).
      mkDep(45, 'gen', 'normal', 'party', null, false, false),
      mkDep(51, 'gen', 'launch', 'hunt', null, true, true),
    ] };
  // mkDep's d45 row has vidBlock null; the 106091 original carries
  // 'unknown' — either way it is not an expiry without prior target.
  const ex2 = expiriesOf(de2);
  check('§E false positives excluded: hurt block + never-targeted no-depart are not expiries',
    ex2.length === 0, ex2);
  const pb2 = postExpiryTargetlessLaunches(de2, ex2);
  check('§E false positives excluded: the d51 targetless launch is not post-expiry',
    pb2.length === 0, pb2);
  // §F RE-SEEDS, RE-SEEDED-WITHIN-7D, HOLDERS-FIGHT-AGAIN (sim-reseed-b).
  function mkReseedLaunch(day, vid, from, to, source) {
    return { day: day, vid: vid, result: 'launch', target: to, targetWave: 4,
      party: ['c1'], partySize: 2, source: source || 'brain',
      gate: mkGate('party', null, null, 0) };
  }
  // mkGate sets targetBefore null; set it per row below.
  const df = { seed: 999006, instrumentErrors: [], winPlanStats: { planExpiries: 2 },
    v4departs: [
      mkReseedLaunch(70, 'brian', 'herald', 'spool', 'brain'),
      mkReseedLaunch(70, 'brian', 'herald', 'spool', 'winPlanDepart'), // double-fire: deduped
      mkReseedLaunch(72, 'brian', 'herald', 'spool', 'brain'),         // same target, new day: kept
      mkReseedLaunch(80, 'gen', 'herald', 'herald', 'brain'),          // no retarget: not a re-seed
    ],
    v4encounters: [mkEnc(76, 'gen', 'spool', 'world-tick', 'vFlee', 3, 90, false)],
    v4seeds: [
      // Prior-target evidence for both expiries (plans HAD a herald
      // target before their expiry days).
      { day: 60, vid: 'brian', mid: 'herald', target: 'herald', blocked: false },
      { day: 70, vid: 'gen', mid: 'herald', target: 'herald', blocked: false },
      { day: 76, vid: 'gen', mid: 'spool', target: 'spool', blocked: false },
      { day: 78, vid: 'brian', mid: 'editor', target: 'editor', blocked: true }, // blocked seed: no retarget
    ],
    dawnbidDeparts: [
      mkDep(69, 'brian', 'normal', 'party', null, false, false),
      mkDep(75, 'gen', 'normal', 'party', null, false, false),
    ] };
  df.v4departs[0].gate.targetBefore = 'herald';
  df.v4departs[1].gate.targetBefore = 'herald';
  df.v4departs[2].gate.targetBefore = 'herald';
  df.v4departs[3].gate.targetBefore = 'herald';
  const exF = expiriesOf(df);
  check('§F expiry rule finds both expiries (brian d69, gen d75)',
    exF.length === 2 && exF[0].vid === 'brian' && exF[1].vid === 'gen', exF);
  const rsF = reseedsOf(df);
  check('§F reseedsOf finds 2 (brian d70 + d72; double-fire deduped; same-target gen d80 excluded)',
    rsF.length === 2 && rsF[0].from === 'herald' && rsF[0].to === 'spool' && rsF[1].day === 72, rsF);
  const rwF = reseededWithin(df, exF, rsF, 7);
  check('§F reseededWithin 7d: brian yes (d70 launch, 1d after expiry), gen yes (d76 lived-fight seed, 1d after)',
    rwF.length === 2 && rwF[0].reseeded === true && rwF[0].withinDays === 1 &&
    rwF[1].reseeded === true && rwF[1].withinDays === 1, rwF);
  const faF = holdersFightAgain(df, exF, rsF, 14);
  check('§F holdersFightAgain 14d: brian yes (d70 launch), gen yes (d76 encounter/seed)',
    faF.length === 2 && faF[0].foughtAgain === true && faF[1].foughtAgain === true, faF);
  const df2 = { seed: 999007, instrumentErrors: [], winPlanStats: { planExpiries: 1 },
    v4departs: [], v4encounters: [],
    // Prior-target evidence (brian's plan had a herald target on d60).
    v4seeds: [{ day: 60, vid: 'brian', mid: 'herald', target: 'herald', blocked: false },
      { day: 80, vid: 'brian', mid: 'editor', target: 'editor', blocked: true }],
    dawnbidDeparts: [mkDep(69, 'brian', 'normal', 'party', null, false, false)] };
  const exF2 = expiriesOf(df2);
  const rwF2 = reseededWithin(df2, exF2, reseedsOf(df2), 7);
  check('§F blocked lived-fight seed does NOT count as a re-seed (brian still targetless at 7d)',
    rwF2.length === 1 && rwF2[0].reseeded === false, rwF2);
  const faF2 = holdersFightAgain(df2, exF2, reseedsOf(df2), 14);
  check('§F blocked lived-fight seed does NOT count as fighting again either',
    faF2.length === 1 && faF2[0].foughtAgain === false, faF2);
  j = judge(mkB({ reseedsCount: 0, reseededShare: 0, reseededWithin7Count: 0 }), null);
  check('§F judge NO-GO RESEED on zero re-seed launches',
    j.verdict === 'NO-GO' && j.kind === 'RESEED', JSON.stringify(j));
  j = judge(mkB({ reseededShare: 0.5, reseededWithin7Count: 1, expiriesCount: 2 }), null);
  check('§F judge NO-GO RESEED when the 7-day share misses 2/3',
    j.verdict === 'NO-GO' && j.kind === 'RESEED', JSON.stringify(j));
  j = judge(mkB({ foughtAgainShare: 0.5, foughtAgain14Count: 1, expiriesCount: 2 }), null);
  check('§F judge NO-GO FIGHT-AGAIN when the 14-day share misses 2/3',
    j.verdict === 'NO-GO' && j.kind === 'FIGHT-AGAIN', JSON.stringify(j));
  j = judge(mkB({ expiriesCount: 0, reseedsCount: 0, reseededShare: null, foughtAgainShare: null }), null);
  check('§F judge METRIC-BROKEN on zero expiries (no evidence for the re-seed bar)',
    j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  console.log('analyze-reseed-b selftest: ' + passed + ' passed, ' + failed + ' failed');
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
  if (!dir) { console.error('usage: analyze-reseed-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
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
    postExpiryTargetlessLaunches: a.postExpiryTargetlessLaunches, postExpiryHolds: a.postExpiryHolds,
    expiryRuleMismatch: a.expiryRuleMismatch, expiries: a.expiries,
    reseeds: a.reseedsCount, expiriesCount: a.expiriesCount,
    reseededWithin7: a.reseededWithin7Count, foughtAgain14: a.foughtAgain14Count,
    reseededShare: a.reseededShare, foughtAgainShare: a.foughtAgainShare,
    perSeed: a.perSeed, wall: leg.wall, medianDays: leg.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { launchesOf: launchesOf, lastFoughtBefore: lastFoughtBefore,
  lastSightedBefore: lastSightedBefore, firstFightAfter: firstFightAfter,
  refoughtAfter: refoughtAfter, classify: classify, analyzeFile: analyzeFile,
  analyzeDir: analyzeDir, judge: judge, BARS: BARS, WINDOW_DAYS: WINDOW_DAYS,
  expiriesOf: expiriesOf, postExpiryTargetlessLaunches: postExpiryTargetlessLaunches,
  postExpiryHolds: postExpiryHolds, reseedsOf: reseedsOf,
  reseededWithin: reseededWithin, holdersFightAgain: holdersFightAgain,
  hadTargetBefore: hadTargetBefore, selftest: selftest };
