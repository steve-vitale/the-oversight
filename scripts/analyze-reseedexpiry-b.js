// analyze-reseedexpiry-b.js — analyzer + judge, arm sim-reseedexpiry-b.
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
//   node scripts/analyze-reseedexpiry-b.js --dir evidence/2026-11-20/perseed-reseedexpiry-b-106301-armed [--dir evidence/2026-11-20/perseed-reseedexpiry-b-106401-armed] [--armed] [--out evidence/2026-11-20/reseedexpiry-b-armed-analysis.json]
//   node scripts/analyze-reseedexpiry-b.js --selftest
// RESEEDWIDE (sim-reseedwide-b): --min-expiries N freezes the
// pre-registered power floor in judgePooled — pooled expiries below
// N are reported, not judged (verdict REPORTED / LOW-N).
'use strict';
const path = require('path');
const fs = require('fs');
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));

// FROZEN BARS (prereg evidence/2026-11-20/sim-reseed-b-prereg.md).
const BARS = {
  poolLaunches: 4,      // launches on the band (floor; 6 scaled 12 -> 8 seeds)
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
  const seen = {};
  // (a) Brain path: the reseed rule, unchanged (dawnbidDeparts row
  // shape + prior-target evidence) — PLUS the stale-commit
  // correction (sim-reseedexpiry-b, 2026-11-20, found on the band-A
  // probe corpus): vbrainExecuteDepart returns 'normal' BEFORE the
  // commit check when the stored commit is stale (commit day !=
  // today), so a stale re-execution the day after an expiry writes
  // a row shaped exactly like a fresh expiry (same vid, same
  // companion, same part) — except the snapshot shows the plan
  // ALREADY targetless (the expiry dissolved it yesterday). A true
  // expiry's snapshot still holds the dead target. So when a
  // rumorPool is present, the row counts only when the snapshot's
  // target is non-null AND dead; rows without a snapshot keep the
  // old rule (reseed-era corpora).
  for (const r of (d.dawnbidDeparts || [])) {
    if (r.result !== 'normal' || r.winPlanAction !== 'party_launch') continue;
    if (r.stage !== 'party' || r.target != null) continue;
    if (r.vidExped !== false || r.companionExped !== false) continue;
    if (r.rumorPool && (r.rumorPool.target == null || r.rumorPool.deadTarget !== true)) continue;
    if (!hadTargetBefore(d, r.vid, r.day)) continue;
    const key = [r.vid, r.day].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, seq: r.seq != null ? r.seq : null, source: 'brain' });
  }
  // (b) winPlanDepart path (sim-reseedexpiry-b): an expiry here
  // returns 'normal' and appears in NO dawnbidDeparts row (those
  // are brain-only). The v4departs 'normal' rows are recorded by
  // the expiry driver only when the plan is wave-4 or the snapshot
  // says the target was dead; a true expiry additionally requires
  // the plan to have HAD a target (hadTargetBefore) and the
  // snapshot's deadTarget verdict. The planExpiries cross-check in
  // analyzeDir still arbitrates: a hurt-block row miscounted here
  // shows up as a rule mismatch, never a silent count.
  for (const r of (d.v4departs || [])) {
    if (r.source !== 'winPlanDepart' || r.result !== 'normal') continue;
    if (r.stage !== 'party' || r.target != null) continue;
    if (!r.rumorPool || r.rumorPool.deadTarget !== true) continue;
    if (!hadTargetBefore(d, r.vid, r.day)) continue;
    const key = [r.vid, r.day].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, seq: r.seq != null ? r.seq : null, source: 'winPlanDepart' });
  }
  return out;
}

// DEAD-TARGET COMMITS (sim-reseedexpiry-b, finding #2626): every
// departure commit where the holder's plan target was dead at gate
// time (the rumor-pool snapshot's deadTarget verdict) — the survey
// denominator for the pool floor. Read from v4departs rows (both
// wraps) and dawnbidDeparts rows (brain), wherever a rumorPool is
// present; deduped by (vid, day) keeping the first row, since the
// two wraps can double-fire for one departure. Each entry carries
// the pool at commit time and the outcome after the call, so the
// evidence can name the thinnest windows.
function deadCommitsOf(d) {
  const out = [];
  const seen = {};
  function pushRow(r, source) {
    if (!r.rumorPool || r.rumorPool.deadTarget !== true) return;
    const key = [r.vid, r.day].join('|');
    if (seen[key]) return;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, source: source,
      target: r.rumorPool.target || null, needWave: r.rumorPool.needWave != null ? r.rumorPool.needWave : null,
      poolN: r.rumorPool.poolN != null ? r.rumorPool.poolN : null,
      pool: (r.rumorPool.pool || []).slice(), firstPick: r.rumorPool.firstPick || null,
      result: r.result || null, targetAfter: r.target != null ? r.target : null });
  }
  for (const r of (d.v4departs || [])) pushRow(r, r.source || 'v4departs');
  for (const r of (d.dawnbidDeparts || [])) pushRow(r, 'brain');
  out.sort(function (a, b) { return a.day - b.day || String(a.vid).localeCompare(String(b.vid)); });
  return out;
}

// POOL FLOOR (sim-reseedexpiry-b): min / median / distribution of
// poolN across dead commits, plus the count of dead commits with a
// missing snapshot (a row whose rumorPool is absent cannot be a
// dead commit at all — deadCommitsOf only counts snapshotted rows —
// so a missing snapshot surfaces here as poolN null on a row the
// gate says was dead; the analyzer counts those separately via
// poolMissing below).
function poolFloorStats(commits) {
  const ns = commits.filter(function (c) { return c.poolN != null; }).map(function (c) { return c.poolN; });
  const dist = {};
  for (const n of ns) dist[n] = (dist[n] || 0) + 1;
  return { commits: commits.length, min: ns.length ? Math.min.apply(null, ns) : null,
    median: median(ns), dist: dist, table: commits };
}

// REPLICA-AGREEMENT (sim-reseedexpiry-b): on an ARMED leg a
// dead-target commit with an empty replica pool (poolN 0) that
// still LAUNCHES means the real pick found a rumor the replica
// missed — the replica and the game disagree, and the pool floor
// cannot be trusted. (On a CONTROL leg the check never runs and
// pool-0 launches are expected: the lever is off, so dead targets
// launch as before. A poolN >= 1 non-launch is NOT a disagreement:
// the check may not have run on a stale commit, or the launch may
// have been blocked downstream after the re-seed — the 106091
// range-0 shape.) Returns the disagreeing rows.
function poolDisagreements(d, deadCommits) {
  const out = [];
  for (const c of (deadCommits || [])) {
    if (c.poolN !== 0) continue;
    if (c.result !== 'launch') continue;
    out.push(c);
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
// CORRECTION 2 (sim-reseedexpiry-b, 2026-11-20, band-A probe): a
// re-seed of an ALREADY-EXPIRED (targetless) plan has targetBefore
// null — the reseed arm's rule (targetBefore non-null and differing)
// misses it entirely, so expired holders looked like they never
// re-seeded (0/3 within 7d on the probe band, while the game stats
// showed planReseeds 3 on 106307 and 1 on 106301). Counted when the
// snapshot carries the expiry stamp (expiredStamp true): the only
// code that puts a target on a targetless stamped plan at commit
// time is the commit check's targetless branch (a lived-fight
// retarget would show up as a non-null targetBefore instead).
// from is null for these rows — the plan had no target to name.
function reseedsOf(d) {
  const out = [];
  const seen = {};
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || !r.target || !r.gate) continue;
    let from = null, isReseed = false;
    if (r.gate.targetBefore) {
      if (r.gate.targetBefore === r.target) continue;
      from = r.gate.targetBefore; isReseed = true;
    } else if (r.rumorPool && r.rumorPool.expiredStamp === true) {
      from = null; isReseed = true;
    }
    if (!isReseed) continue;
    const key = [r.vid, r.day, r.target].join('|');
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, from: from, to: r.target,
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
  let deadCommitRows = [], poolDisagreementRows = [];
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
    const dc = deadCommitsOf(d);
    const pd = poolDisagreements(d, dc);
    expiryRows = expiryRows.concat(expiries);
    postExpiryRows = postExpiryRows.concat(pb);
    postExpiryHoldRows = postExpiryHoldRows.concat(ph);
    reseedRows = reseedRows.concat(rs);
    reseededRows = reseededRows.concat(rw);
    foughtAgainRows = foughtAgainRows.concat(fa);
    deadCommitRows = deadCommitRows.concat(dc);
    poolDisagreementRows = poolDisagreementRows.concat(pd);
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
      postExpiryTargetlessLaunches: pb.length, postExpiryHolds: ph.length,
      deadCommits: dc.length, poolMin: poolFloorStats(dc).min,
      poolDisagreements: pd.length });
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
    foughtAgainShare: foughtAgainRows.length ? (foughtAgainRows.filter(function (x) { return x.foughtAgain; }).length / foughtAgainRows.length) : null,
    deadCommits: deadCommitRows, deadCommitsCount: deadCommitRows.length,
    poolFloor: poolFloorStats(deadCommitRows),
    poolDisagreements: poolDisagreementRows, poolDisagreementsCount: poolDisagreementRows.length };
}

function judge(a, leg, opts) {
  const armed = !opts || opts.armed !== false;
  const bars = [];
  bars.push({ id: 'pool-launches', pass: a.launches >= BARS.poolLaunches,
    detail: 'launches ' + a.launches + ' (floor ' + BARS.poolLaunches + '); dead ' + a.dead + ', live ' + a.live + ', unknown ' + a.unknown });
  bars.push({ id: 'classification', pass: a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare,
    detail: 'classified ' + a.classified + '/' + a.launches + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar 1.000); dead share ' + (a.deadShare == null ? 'n/a' : a.deadShare.toFixed(3)) });
  bars.push({ id: 'gate-snapshot', pass: a.gateMissing === 0 && a.gateMismatch === 0,
    detail: 'gate snapshots missing ' + a.gateMissing + ', mismatched vs recomputation ' + a.gateMismatch + ' (bar 0 / 0); duplicate depart rows ' + a.duplicates + ' (expect 0)' });
  bars.push({ id: 'instrument', pass: a.errors === 0 && a.files === 8,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/8' });
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
  const dc = (a.deadCommitsCount != null ? a.deadCommitsCount : 0);
  const pd = (a.poolDisagreementsCount != null ? a.poolDisagreementsCount : 0);
  const pf = a.poolFloor || null;
  bars.push({ id: 'dead-commits', pass: dc > 0,
    detail: 'dead-target commits ' + dc + ' (the survey denominator); pool floor min ' +
      (pf && pf.min != null ? pf.min : 'n/a') + ', median ' + (pf && pf.median != null ? pf.median : 'n/a') +
      ', dist ' + JSON.stringify((pf && pf.dist) || {}) });
  bars.push({ id: 'pool-agreement', pass: !armed || pd === 0,
    detail: armed ? ('replica-vs-real disagreements (pool-0 dead commit that launched) ' + pd + ' (bar 0)')
      : 'control leg: pool-0 launches expected (lever off), agreement not judged' });
  // NOTE (sim-reseedexpiry-b): the re-seed bar here is the 7-day
  // FOLLOW share only. The reseed judge also floored re-seed
  // launches (rc >= 1), but this arm's frozen GO counts commit-time
  // rumor re-seeds AND lived-fight retargets — a holder re-seeded by
  // a lived fight passes the follow bar with rc 0, and the rc floor
  // would fail it. rc stays in the detail line.
  bars.push({ id: 'reseed', pass: ec > 0 && rs != null && rs >= BARS.reseededShare,
    detail: 'expiries ' + ec + '; re-seed launches ' + rc + '; re-seeded within 7d ' + (a.reseededWithin7Count != null ? a.reseededWithin7Count : 0) + '/' + ec + ' = ' + (rs == null ? 'n/a' : rs.toFixed(3)) + ' (bar ' + BARS.reseededShare.toFixed(3) + ')' });
  bars.push({ id: 'holders-fight-again', pass: ec > 0 && fs != null && fs >= BARS.foughtAgainShare,
    detail: 'holders fighting again within 14d ' + (a.foughtAgain14Count != null ? a.foughtAgain14Count : 0) + '/' + ec + ' = ' + (fs == null ? 'n/a' : fs.toFixed(3)) + ' (bar ' + BARS.foughtAgainShare.toFixed(3) + ')' });
  let verdict = 'DIAG-GO', kind = null;
  if (a.errors || a.files !== 8) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.gateMissing || a.gateMismatch) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.classifiedShare == null || a.classifiedShare < BARS.classifiedShare) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (br) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (armed && pd) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (dc === 0) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (ec === 0) { verdict = 'NO-GO'; kind = 'UNREACHABLE'; }
  else if (pb > 0) { verdict = 'NO-GO'; kind = 'POST-BLOCK'; }
  else if (rs == null || rs < BARS.reseededShare) { verdict = 'NO-GO'; kind = 'RESEED'; }
  else if (fs == null || fs < BARS.foughtAgainShare) { verdict = 'NO-GO'; kind = 'FIGHT-AGAIN'; }
  return { verdict: verdict, kind: kind, bars: bars, leg: leg,
    wall: leg ? leg.wall : null };
}

// POOLED JUDGE (sim-reseedexpiry-b): the survey verdict pools the
// two armed bands (A + B). Instrument bars must pass on EVERY band
// dir; the expiry occurrence + follow shares are judged on the
// pooled expiries; the pool floor is the min across bands. The
// guardrail is judged per band in the evidence (from the leg
// summaries), never here. Returns the pooled verdict + the pooled
// counts the evidence reports.
function judgePooled(analyses, opts) {
  const armed = !opts || opts.armed !== false;
  // RESEEDWIDE (sim-reseedwide-b, frozen prereg): opts.minExpiries
  // is the pre-registered power floor. When pooled expiries ec fall
  // below it, the follow-through bars (re-seed share, fight-again
  // share, post-expiry 0) are REPORTED, not judged — their bar
  // entries carry pass: null and the verdict is REPORTED / LOW-N
  // when every hard bar passes. The evidence then applies the
  // combined-fix judgment (dead-0 + guardrail). Unset (legacy):
  // the judge behaves exactly as before.
  const minExp = (opts && opts.minExpiries != null) ? opts.minExpiries : null;
  const dirs = analyses || [];
  let errors = 0, filesOk = true, gateMissing = 0, gateMismatch = 0;
  let classifiedOk = true, br = 0, pd = 0, pb = 0, dc = 0, ec = 0;
  let rw = 0, fa = 0, poolMin = null;
  const poolDist = {};
  for (const a of dirs) {
    errors += (a.errors || 0);
    if (a.files !== 8) filesOk = false;
    gateMissing += (a.gateMissing || 0);
    gateMismatch += (a.gateMismatch || 0);
    if (a.classifiedShare == null || a.classifiedShare < BARS.classifiedShare) classifiedOk = false;
    br += (a.expiryRuleMismatch || 0);
    pd += (a.poolDisagreementsCount || 0);
    pb += (a.postExpiryTargetlessLaunches || 0);
    dc += (a.deadCommitsCount || 0);
    ec += (a.expiriesCount || 0);
    rw += (a.reseededWithin7Count || 0);
    fa += (a.foughtAgain14Count || 0);
    if (a.poolFloor && a.poolFloor.min != null && (poolMin == null || a.poolFloor.min < poolMin)) poolMin = a.poolFloor.min;
    const dist = (a.poolFloor && a.poolFloor.dist) || {};
    for (const k of Object.keys(dist)) poolDist[k] = (poolDist[k] || 0) + dist[k];
  }
  const rs = ec ? (rw / ec) : null;
  const fs = ec ? (fa / ec) : null;
  const lowN = minExp != null && ec < minExp;
  const bars = [
    { id: 'instrument-pooled', pass: errors === 0 && filesOk,
      detail: 'instrument errors ' + errors + ' (bar 0); all band dirs 8 files: ' + filesOk },
    { id: 'gate-pooled', pass: gateMissing === 0 && gateMismatch === 0 && classifiedOk,
      detail: 'gate missing ' + gateMissing + ', mismatch ' + gateMismatch + ', classified ok ' + classifiedOk },
    { id: 'expiry-rule-pooled', pass: br === 0, detail: 'expiry-rule mismatches ' + br + ' (bar 0)' },
    { id: 'pool-agreement-pooled', pass: !armed || pd === 0,
      detail: 'replica-vs-real disagreements ' + pd + ' (bar 0)' },
    { id: 'dead-commits-pooled', pass: dc > 0,
      detail: 'dead-target commits ' + dc + ' pooled; pool floor min ' + (poolMin == null ? 'n/a' : poolMin) + ', dist ' + JSON.stringify(poolDist) },
    { id: 'post-expiry-pooled', pass: lowN ? null : pb === 0,
      detail: lowN ? ('post-expiry targetless launches ' + pb + ' — REPORTED, not judged (expiries ' + ec + ' < ' + minExp + ')')
        : ('post-expiry targetless launches ' + pb + ' (bar 0)') },
    { id: 'reseed-pooled', pass: lowN ? null : (ec > 0 && rs != null && rs >= BARS.reseededShare),
      detail: lowN ? ('expiries ' + ec + '; re-seeded within 7d ' + rw + '/' + ec + ' = ' + (rs == null ? 'n/a' : rs.toFixed(3)) + ' — REPORTED, not judged (expiries < ' + minExp + ')')
        : ('expiries ' + ec + '; re-seeded within 7d ' + rw + '/' + ec + ' = ' + (rs == null ? 'n/a' : rs.toFixed(3)) + ' (bar ' + BARS.reseededShare.toFixed(3) + ')') },
    { id: 'holders-fight-again-pooled', pass: lowN ? null : (ec > 0 && fs != null && fs >= BARS.foughtAgainShare),
      detail: lowN ? ('holders fighting again within 14d ' + fa + '/' + ec + ' = ' + (fs == null ? 'n/a' : fs.toFixed(3)) + ' — REPORTED, not judged (expiries < ' + minExp + ')')
        : ('holders fighting again within 14d ' + fa + '/' + ec + ' = ' + (fs == null ? 'n/a' : fs.toFixed(3)) + ' (bar ' + BARS.foughtAgainShare.toFixed(3) + ')') },
  ];
  let verdict = 'DIAG-GO', kind = null;
  if (errors || !filesOk) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (gateMissing || gateMismatch || !classifiedOk) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (br) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (armed && pd) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (dc === 0) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (lowN) { verdict = 'REPORTED'; kind = 'LOW-N'; }
  else if (ec === 0) { verdict = 'NO-GO'; kind = 'UNREACHABLE'; }
  else if (pb > 0) { verdict = 'NO-GO'; kind = 'POST-BLOCK'; }
  else if (rs == null || rs < BARS.reseededShare) { verdict = 'NO-GO'; kind = 'RESEED'; }
  else if (fs == null || fs < BARS.foughtAgainShare) { verdict = 'NO-GO'; kind = 'FIGHT-AGAIN'; }
  return { verdict: verdict, kind: kind, bars: bars,
    pooled: { dirs: dirs.length, deadCommits: dc, expiries: ec, poolFloorMin: poolMin,
      poolDist: poolDist, reseededWithin7: rw, foughtAgain14: fa,
      reseededShare: rs, foughtAgainShare: fs, postExpiryTargetlessLaunches: pb,
      poolDisagreements: pd, expiryRuleMismatch: br,
      minExpiries: minExp, lowN: lowN } };
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
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 4, live: 3, unknown: 1, classified: 8, classifiedShare: 1.0, deadShare: 0.5,
      stageBefore: { standing: 4, party: 2, hunt: 2 }, deadStanding: 4, deadSlainKnown: 4,
      deadNeverRefought: 3, withFirstAfter: 5, sameDayFirstAfter: 1, medianDaysSinceLastFight: 6,
      expiriesCount: 2, reseedsCount: 2, reseededWithin7Count: 2, foughtAgain14Count: 2,
      reseededShare: 1.0, foughtAgainShare: 1.0,
      deadCommitsCount: 3, poolDisagreementsCount: 0,
      poolFloor: { commits: 3, min: 1, median: 2, dist: { 1: 1, 2: 1, 3: 1 }, table: [] },
      postExpiryTargetlessLaunches: 0, postExpiryHolds: 0, expiryRuleMismatch: 0 }, o);
  }
  let j = judge(mkA({}), null);
  check('§D judge DIAG-GO shape passes', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkA({ launches: 3, dead: 1, live: 1, unknown: 1, classified: 3, deadShare: 1 / 3 }), null);
  // CHANGED (sim-reseedexpiry-b): the launch floor is a reported bar
  // now, not verdict-driving — the survey's power is the dead-commit
  // count (prereg metric review #6). Below-floor launches fail the
  // bar but the verdict still passes when every verdict-driving bar
  // passes.
  check('§D below the launch floor fails the bar only (verdict still DIAG-GO when the dead-commit survey is sound)',
    j.verdict === 'DIAG-GO' && j.bars[0].pass === false, JSON.stringify(j));
  j = judge(mkA({ deadCommitsCount: 0, poolFloor: { commits: 0, min: null, median: null, dist: {}, table: [] } }), null);
  check('§D judge METRIC-BROKEN on zero dead-target commits (nothing to measure)',
    j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkA({ poolDisagreementsCount: 1 }), null);
  check('§D judge INSTRUMENT on replica-vs-real disagreement (pool-0 dead commit that launched)',
    j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ errors: 1 }), null);
  check('§D judge INSTRUMENT on instrument errors', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkA({ files: 7 }), null);
  check('§D judge INSTRUMENT on files != 8', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
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
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 0, live: 8, unknown: 0, classified: 8, classifiedShare: 1.0, deadShare: 0,
      stageBefore: { standing: 4, party: 2, hunt: 2 }, deadStanding: 0, deadSlainKnown: 0,
      deadNeverRefought: 0, withFirstAfter: 5, sameDayFirstAfter: 1, medianDaysSinceLastFight: 6,
      expiriesCount: 1, reseedsCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
      reseededShare: 1.0, foughtAgainShare: 1.0,
      deadCommitsCount: 2, poolDisagreementsCount: 0,
      poolFloor: { commits: 2, min: 0, median: 1, dist: { 0: 1, 2: 1 }, table: [] },
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
  check('§F judge NO-GO RESEED on a 0/1 7-day share',
    j.verdict === 'NO-GO' && j.kind === 'RESEED', JSON.stringify(j));
  j = judge(mkB({ reseededShare: 0.5, reseededWithin7Count: 1, expiriesCount: 2 }), null);
  check('§F judge NO-GO RESEED when the 7-day share misses 2/3',
    j.verdict === 'NO-GO' && j.kind === 'RESEED', JSON.stringify(j));
  j = judge(mkB({ foughtAgainShare: 0.5, foughtAgain14Count: 1, expiriesCount: 2 }), null);
  check('§F judge NO-GO FIGHT-AGAIN when the 14-day share misses 2/3',
    j.verdict === 'NO-GO' && j.kind === 'FIGHT-AGAIN', JSON.stringify(j));
  // §G POOL FLOOR, DEAD COMMITS, WINPLANDEPART EXPIRIES, POOLED JUDGE
  // (sim-reseedexpiry-b).
  function mkPoolRow(day, vid, target, needWave, pool, result, targetAfter, source) {
    return { day: day, vid: vid, source: source || 'brain', result: result,
      winPlanAction: 'party_launch', stage: 'party', target: targetAfter != null ? targetAfter : null,
      party: [], gate: null,
      rumorPool: { target: target, needWave: needWave, deadTarget: true,
        pool: pool.slice(), poolN: pool.length, firstPick: pool.length ? pool[0] : null } };
  }
  const dg = { seed: 999009, instrumentErrors: [], winPlanStats: { planExpiries: 1 },
    v4departs: [
      // d70: dead herald commit, pool [reunion, spool] -> re-seeded, launched on reunion.
      mkPoolRow(70, 'brian', 'herald', 4, ['reunion', 'spool'], 'launch', 'reunion', 'brain'),
      // d71: the SAME launch recorded by the second wrap (double-fire): deduped.
      mkPoolRow(70, 'brian', 'herald', 4, ['reunion', 'spool'], 'launch', 'reunion', 'winPlanDepart'),
      // d80: dead herald commit, pool [] -> expired on the winPlanDepart path ('normal').
      mkPoolRow(80, 'brian', 'herald', 4, [], 'normal', null, 'winPlanDepart'),
      // d81: the same expiry ALSO written as a brain dawnbid row: deduped by (vid, day).
      // (Added to dawnbidDeparts below, not here.)
      // d90: dead editor commit, pool [audit] -> re-seeded, launched.
      mkPoolRow(90, 'gen', 'editor', 5, ['audit'], 'launch', 'audit', 'brain'),
      // A live-target commit (deadTarget false) is NOT a dead commit.
      { day: 95, vid: 'gen', source: 'brain', result: 'launch', winPlanAction: 'party_launch',
        stage: 'hunt', target: 'audit', party: [], gate: null,
        rumorPool: { target: 'audit', needWave: 5, deadTarget: false, pool: ['editor'], poolN: 1, firstPick: 'editor' } },
    ],
    v4encounters: [], v4seeds: [
      { day: 60, vid: 'brian', mid: 'herald', target: 'herald', blocked: false },
      { day: 85, vid: 'gen', mid: 'editor', target: 'editor', blocked: false },
    ],
    dawnbidDeparts: [
      mkDep(80, 'brian', 'normal', 'party', null, false, false),
    ] };
  // The d80 brain row carries no rumorPool (mkDep has none) — the
  // winPlanDepart v4departs row is the expiry's evidence; the
  // dedupe must still count ONE expiry for brian d80.
  const dcG = deadCommitsOf(dg);
  check('§G deadCommitsOf finds 3 dead commits (d70 deduped across wraps, d80, d90); the live d95 commit excluded',
    dcG.length === 3 && dcG[0].day === 70 && dcG[1].day === 80 && dcG[2].day === 90,
    dcG.map(function (c) { return c.day + ':' + c.poolN; }));
  const pfG = poolFloorStats(dcG);
  check('§G pool floor is min 0, median 1, dist {0:1, 1:1, 2:1}',
    pfG.min === 0 && pfG.median === 1 && pfG.dist[0] === 1 && pfG.dist[1] === 1 && pfG.dist[2] === 1, pfG);
  const exG = expiriesOf(dg);
  check('§G expiriesOf counts the winPlanDepart-path expiry (brian d80) once despite both-path rows',
    exG.length === 1 && exG[0].vid === 'brian' && exG[0].day === 80, exG);
  const pdG = poolDisagreements(dg, dcG);
  check('§G poolDisagreements is 0: the pool-0 d80 commit expired (normal), it did not launch',
    pdG.length === 0, pdG);
  const dgBad = JSON.parse(JSON.stringify(dg));
  dgBad.v4departs[2].result = 'launch'; // pool-0 dead commit that LAUNCHES: replica-vs-real disagreement
  const pdBad = poolDisagreements(dgBad, deadCommitsOf(dgBad));
  check('§G poolDisagreements catches a pool-0 dead commit that launches (1 row)',
    pdBad.length === 1 && pdBad[0].day === 80, pdBad);
  // CORRECTION 1 — STALE TWIN (2026-11-20, band-A probe seed 106307):
  // the day after a true expiry, the stale mid-day part-1 commit
  // re-executes and returns 'normal' WITHOUT the commit check
  // running (vbrainExecuteDepart returns 'normal' for a stale
  // commit first). The row is shaped like an expiry — but the
  // snapshot shows the plan ALREADY targetless. It must not count.
  const dgStale = { seed: 999010, instrumentErrors: [], winPlanStats: { planExpiries: 1 },
    v4departs: [], v4encounters: [],
    v4seeds: [{ day: 35, vid: 'emmett', mid: 'terms_of_service', target: 'terms_of_service', blocked: false }],
    dawnbidDeparts: [
      // d36: the TRUE expiry (snapshot still holds the dead target).
      { seq: 123, day: 36, vid: 'emmett', source: 'brain', result: 'normal',
        winPlanAction: 'party_launch', commitKind: 'mid-day part-1', commitPart: 1,
        companion: 'c1', companion2: null, companion3: null,
        vidExped: false, companionExped: false, vidBlock: 'unknown', companionBlock: 'unknown',
        stage: 'party', target: null, party: [],
        rumorPool: { target: 'terms_of_service', needWave: 3, deadTarget: true, pool: [], poolN: 0, firstPick: null } },
      // d37: the STALE twin (same commit re-executed; plan already targetless).
      { seq: 124, day: 37, vid: 'emmett', source: 'brain', result: 'normal',
        winPlanAction: 'party_launch', commitKind: 'mid-day part-1', commitPart: 1,
        companion: 'c1', companion2: null, companion3: null,
        vidExped: false, companionExped: false, vidBlock: 'unknown', companionBlock: 'unknown',
        stage: 'party', target: null, party: [],
        rumorPool: { target: null, needWave: 3, deadTarget: false, pool: [], poolN: 0, firstPick: null } },
      // d38: the expiry hold firing on a later commit ('hold', not an expiry).
      { seq: 125, day: 38, vid: 'emmett', source: 'brain', result: 'hold',
        winPlanAction: 'party_launch', commitKind: 'mid-day part-2', commitPart: 2,
        companion: 'c1', companion2: null, companion3: null,
        vidExped: false, companionExped: false, vidBlock: 'unknown', companionBlock: 'unknown',
        stage: 'party', target: null, party: [],
        rumorPool: { target: null, needWave: 3, deadTarget: false, pool: [], poolN: 0, firstPick: null } },
    ] };
  const exStale = expiriesOf(dgStale);
  check('§G stale-twin correction: the d37 stale re-execution is NOT a second expiry (1 expiry: d36 only)',
    exStale.length === 1 && exStale[0].day === 36, exStale);
  // CORRECTION 2 — EXPIRED-PLAN RE-SEED (2026-11-20, band-A probe):
  // a launch whose gate targetBefore is null but whose snapshot
  // carries the expiry stamp IS a re-seed (the commit check's
  // targetless branch retargeted the plan at commit time). The same
  // row without the stamp (a never-targeted plan) is not.
  const dgRe = { seed: 999011, instrumentErrors: [], winPlanStats: { planExpiries: 1, planReseeds: 1 },
    v4departs: [
      { day: 42, vid: 'emmett', result: 'launch', target: 'callback', targetWave: 3,
        party: ['c1'], partySize: 2, source: 'brain',
        gate: { stageBefore: 'hunt', targetBefore: null, node: null, sinceDay: 35,
          villageSlain: null, lastFightDay: null, lastFightKill: null, lastFightOutcome: null,
          daysSinceLastFight: null, lastSightingDay: null, daysSinceLastSighting: null },
        rumorPool: { target: null, needWave: 3, deadTarget: false, expiredStamp: true,
          pool: ['callback'], poolN: 1, firstPick: 'callback' } },
      // Never-targeted targetless launch (no stamp): NOT a re-seed.
      { day: 50, vid: 'gen', result: 'launch', target: 'spool', targetWave: 3,
        party: ['c1'], partySize: 2, source: 'brain',
        gate: { stageBefore: 'hunt', targetBefore: null, node: null, sinceDay: 35,
          villageSlain: null, lastFightDay: null, lastFightKill: null, lastFightOutcome: null,
          daysSinceLastFight: null, lastSightingDay: null, daysSinceLastSighting: null },
        rumorPool: { target: null, needWave: 3, deadTarget: false, expiredStamp: false,
          pool: ['spool'], poolN: 1, firstPick: 'spool' } },
    ],
    v4encounters: [], v4seeds: [],
    dawnbidDeparts: [] };
  const rsRe = reseedsOf(dgRe);
  check('§G expired-plan re-seed counted (from null -> callback); never-targeted launch not counted',
    rsRe.length === 1 && rsRe[0].from === null && rsRe[0].to === 'callback' && rsRe[0].day === 42, rsRe);
  // Pooled judge on two synthetic band analyses.
  function mkBand(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, duplicates: 0,
      gateMissing: 0, gateMismatch: 0, launches: 8, perSeed: [], rows: [],
      dead: 0, live: 8, unknown: 0, classified: 8, classifiedShare: 1.0, deadShare: 0,
      stageBefore: {}, deadStanding: 0, deadSlainKnown: 0, deadNeverRefought: 0,
      withFirstAfter: 0, sameDayFirstAfter: 0, medianDaysSinceLastFight: null,
      expiriesCount: 0, reseedsCount: 0, reseededWithin7Count: 0, foughtAgain14Count: 0,
      reseededShare: null, foughtAgainShare: null,
      deadCommitsCount: 3, poolDisagreementsCount: 0,
      poolFloor: { commits: 3, min: 1, median: 2, dist: { 1: 1, 2: 2 }, table: [] },
      postExpiryTargetlessLaunches: 0, postExpiryHolds: 0, expiryRuleMismatch: 0 }, o);
  }
  let jp = judgePooled([mkBand({}), mkBand({})], { armed: true });
  check('§G pooled judge NO-GO UNREACHABLE on 0 expiries across two clean bands (dead commits 6, floor min 1)',
    jp.verdict === 'NO-GO' && jp.kind === 'UNREACHABLE' && jp.pooled.deadCommits === 6 && jp.pooled.poolFloorMin === 1,
    JSON.stringify(jp.pooled));
  jp = judgePooled([mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1, reseededShare: 1.0, foughtAgainShare: 1.0,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }), mkBand({})], { armed: true });
  check('§G pooled judge DIAG-GO with 1 expiry (7d 1/1, 14d 1/1) pooled across two bands',
    jp.verdict === 'DIAG-GO' && jp.pooled.expiries === 1 && jp.pooled.reseededShare === 1.0, JSON.stringify(jp.pooled));
  jp = judgePooled([mkBand({}), mkBand({ errors: 1 })], { armed: true });
  check('§G pooled judge INSTRUMENT when one band has instrument errors',
    jp.verdict === 'NO-GO' && jp.kind === 'INSTRUMENT', JSON.stringify(jp));
  jp = judgePooled([mkBand({ deadCommitsCount: 0, poolFloor: { commits: 0, min: null, median: null, dist: {}, table: [] } }),
    mkBand({ deadCommitsCount: 0, poolFloor: { commits: 0, min: null, median: null, dist: {}, table: [] } })], { armed: true });
  check('§G pooled judge METRIC-BROKEN on zero dead commits across both bands',
    jp.verdict === 'NO-GO' && jp.kind === 'METRIC-BROKEN', JSON.stringify(jp));
  // §H MIN-EXPIRIES POWER FLOOR (sim-reseedwide-b, frozen prereg):
  // with --min-expiries 3, follow bars are REPORTED (pass null),
  // not judged, while ec < 3; at ec >= 3 the legacy path holds.
  jp = judgePooled([mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§H minExpiries 3: ec=2 (shares 1.0) -> REPORTED LOW-N, follow bars pass null (reported, not judged)',
    jp.verdict === 'REPORTED' && jp.kind === 'LOW-N' && jp.pooled.lowN === true &&
    jp.bars[5].pass === null && jp.bars[6].pass === null && jp.bars[7].pass === null &&
    jp.pooled.reseededShare === 1.0, JSON.stringify(jp));
  jp = judgePooled([mkBand({ expiriesCount: 2, reseededWithin7Count: 2, foughtAgain14Count: 2,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 1, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§H minExpiries 3: ec=3 shares 1.0 -> DIAG-GO (normal path)',
    jp.verdict === 'DIAG-GO' && jp.pooled.expiries === 3 && jp.pooled.reseededShare === 1.0, JSON.stringify(jp.pooled));
  jp = judgePooled([mkBand({ expiriesCount: 2, reseededWithin7Count: 1, foughtAgain14Count: 2,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } }),
    mkBand({ expiriesCount: 1, reseededWithin7Count: 0, foughtAgain14Count: 1,
    poolFloor: { commits: 3, min: 0, median: 1, dist: { 0: 1, 1: 1, 2: 1 }, table: [] } })], { armed: true, minExpiries: 3 });
  check('§H minExpiries 3: ec=3 re-seed 1/3 -> NO-GO RESEED',
    jp.verdict === 'NO-GO' && jp.kind === 'RESEED' && jp.pooled.reseededShare === 1 / 3, JSON.stringify(jp.pooled));
  jp = judgePooled([mkBand({}), mkBand({})], { armed: true, minExpiries: 3 });
  check('§H minExpiries 3: ec=0 -> REPORTED LOW-N (not UNREACHABLE; the combined-fix judgment decides)',
    jp.verdict === 'REPORTED' && jp.kind === 'LOW-N' && jp.pooled.expiries === 0, JSON.stringify(jp));
  jp = judgePooled([mkBand({ expiriesCount: 1, reseededWithin7Count: 0, foughtAgain14Count: 0 })], { armed: true });
  check('§H legacy (minExpiries unset): ec=1 re-seed 0/1 -> NO-GO RESEED (unchanged)',
    jp.verdict === 'NO-GO' && jp.kind === 'RESEED', JSON.stringify(jp));
  console.log('analyze-reseedexpiry-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dirs = [], outFile = null, armed = true, minExpiries = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dirs.push(args[++i]);
    else if (args[i] === '--dir2') dirs.push(args[++i]);
    else if (args[i] === '--out') outFile = args[++i];
    else if (args[i] === '--control') armed = false;
    else if (args[i] === '--min-expiries') minExpiries = parseInt(args[++i], 10);
  }
  if (!dirs.length) { console.error('usage: analyze-reseedexpiry-b.js --dir DIR [--dir2 DIR2] [--armed|--control] [--min-expiries N] [--out FILE] | --selftest'); process.exit(2); }
  const analyses = dirs.map(function (d) { return analyzeDir(d); });
  const legs = dirs.map(function (d) { return FCB.summarizeLeg(d); });
  const perDir = analyses.map(function (a, i) { return judge(a, legs[i], { armed: armed }); });
  const pooled = judgePooled(analyses, { armed: armed, minExpiries: minExpiries });
  const a0 = analyses[0], leg0 = legs[0], j0 = perDir[0];
  const result = { verdict: pooled.verdict, kind: pooled.kind, bars: pooled.bars, pooled: pooled.pooled,
    perDir: perDir.map(function (j, i) { return { dir: dirs[i], verdict: j.verdict, kind: j.kind, bars: j.bars }; }),
    analyses: analyses,
    wall: leg0.wall, medianDays: leg0.medianDays, launches: leg0.launches, errors: leg0.errors };
  console.log(JSON.stringify({ verdict: pooled.verdict, kind: pooled.kind, bars: pooled.bars,
    pooled: pooled.pooled,
    perDir: perDir.map(function (j, i) { return { dir: dirs[i], verdict: j.verdict, kind: j.kind }; }),
    launches: a0.launches, dead: a0.dead, live: a0.live, unknown: a0.unknown,
    deadShare: a0.deadShare, classifiedShare: a0.classifiedShare,
    duplicates: a0.duplicates, gateMissing: a0.gateMissing, gateMismatch: a0.gateMismatch,
    stageBefore: a0.stageBefore, deadStanding: a0.deadStanding,
    deadSlainKnown: a0.deadSlainKnown, deadNeverRefought: a0.deadNeverRefought,
    withFirstAfter: a0.withFirstAfter, sameDayFirstAfter: a0.sameDayFirstAfter,
    medianDaysSinceLastFight: a0.medianDaysSinceLastFight,
    postExpiryTargetlessLaunches: a0.postExpiryTargetlessLaunches, postExpiryHolds: a0.postExpiryHolds,
    expiryRuleMismatch: a0.expiryRuleMismatch, expiries: a0.expiries,
    reseeds: a0.reseedsCount, expiriesCount: a0.expiriesCount,
    reseededWithin7: a0.reseededWithin7Count, foughtAgain14: a0.foughtAgain14Count,
    reseededShare: a0.reseededShare, foughtAgainShare: a0.foughtAgainShare,
    deadCommits: a0.deadCommits, deadCommitsCount: a0.deadCommitsCount,
    poolFloor: a0.poolFloor, poolDisagreements: a0.poolDisagreements,
    poolDisagreementsCount: a0.poolDisagreementsCount,
    perSeed: a0.perSeed, wall: leg0.wall, medianDays: leg0.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { launchesOf: launchesOf, lastFoughtBefore: lastFoughtBefore,
  lastSightedBefore: lastSightedBefore, firstFightAfter: firstFightAfter,
  refoughtAfter: refoughtAfter, classify: classify, analyzeFile: analyzeFile,
  analyzeDir: analyzeDir, judge: judge, judgePooled: judgePooled, BARS: BARS, WINDOW_DAYS: WINDOW_DAYS,
  expiriesOf: expiriesOf, postExpiryTargetlessLaunches: postExpiryTargetlessLaunches,
  postExpiryHolds: postExpiryHolds, reseedsOf: reseedsOf,
  reseededWithin: reseededWithin, holdersFightAgain: holdersFightAgain,
  hadTargetBefore: hadTargetBefore, deadCommitsOf: deadCommitsOf,
  poolFloorStats: poolFloorStats, poolDisagreements: poolDisagreements, selftest: selftest };
