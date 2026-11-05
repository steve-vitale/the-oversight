// postblood-analyze-20261105.js — post-blood killer-death DIAG analyzer
// (arm sim-postblood-b, run fleshout-loop-b-20261105T0618Z). Pure function
// over corpus JSON; no game reads, no re-scoring. Reuses
// killerdeath-analyze-20261105 killerFates/classifySeed/analyzeDir for
// per-killer fates and wall numbers, and adds:
//  - the ROSTER death ledger: every fallen entry, deduped to one row per
//    villagerId (earliest day), classified with the SAME splitter the
//    killerdeath analyzer uses (monster-threaded > scholar-death ctx >
//    literal fallen cause; bare 'the wild' stays a residual bucket);
//  - cause BUCKETS: SHOW (contest / the arena), WILD-MONSTER (monster:*,
//    literal monster/combat, scholar-death wild/combat/injuries),
//    EXPEDITION, OTHER, WILD-RESIDUAL (bare 'the wild', never a cause);
//  - the show-take comparison in SHARE form (show share among fresh-killer
//    deaths vs among non-killer roster deaths) and RATE form (show deaths
//    per 100 fresh-killer-days vs per 100 non-killer roster-days);
//  - the pre-registered ranked verdict (a) show-preferential / (b) wild
//    dominant / (c) underpowered — see sim-postblood-b-prereg.md.
// Usage: node scripts/postblood-analyze-20261105.js <per-seed-dir>
//   (prints a JSON summary to stdout)
'use strict';
const fs = require('fs');
const path = require('path');
const AN = require(path.join(__dirname, 'killerdeath-analyze-20261105'));

const SHOW_CAUSES = { 'contest': true, 'the arena': true };

function bucketFromSplit(split) {
  if (!split) return 'OTHER';
  if (split === 'alive') return null;
  if (split.indexOf('monster:') === 0) return 'WILD-MONSTER';
  if (split.indexOf('scholar-death:') === 0) {
    const parts = split.split(':');
    const causeArg = parts[1] || '';
    if (SHOW_CAUSES[causeArg]) return 'SHOW';
    if (causeArg === 'the expedition') return 'EXPEDITION';
    if (causeArg === 'the wild' || causeArg === 'monster' || causeArg === 'combat' || causeArg === 'injuries') return 'WILD-MONSTER';
    return 'OTHER';
  }
  if (SHOW_CAUSES[split]) return 'SHOW';
  if (split === 'the expedition') return 'EXPEDITION';
  if (split === 'the wild (unsplit residual)') return 'WILD-RESIDUAL';
  if (split === 'monster' || split === 'combat') return 'WILD-MONSTER';
  if (split === 'unknown (no fallen entry)') return 'OTHER';
  return 'OTHER';
}

// Split a single roster death with the killerdeath precedence, for ANY
// villager (not just killers). entry: a fallen row; scholarCtx: the
// playerDeath-wrap row for the same villager+day, if any.
function splitRosterDeath(entry, scholarCtx) {
  if (!entry) return 'unknown (no fallen entry)';
  if (entry.monsterId || entry.monsterName) return 'monster:' + (entry.monsterName || entry.monsterId);
  if (scholarCtx) {
    const loc = scholarCtx.atHaven ? 'at-haven' : 'away';
    const comb = scholarCtx.inCombat ? 'in-combat' : (scholarCtx.pendingEncounter ? 'pending-encounter' : 'not-in-combat');
    return 'scholar-death:' + (scholarCtx.causeArg || entry.cause || '?') + ':' + loc + ':' + comb;
  }
  const raw = entry.cause || null;
  if (raw && raw !== 'the wild') return raw;
  if (raw === 'the wild') return 'the wild (unsplit residual)';
  return 'unknown (no fallen entry)';
}

function rosterLedger(row) {
  const fallen = row.fallen || [];
  const killerIds = {};
  (row.waveKillLog || []).forEach(function (e) { if (((e.w | 0) >= 4) && e.by) killerIds[e.by] = true; });
  const byVid = {};
  fallen.forEach(function (f) {
    if (!f || !f.villagerId) return;
    const cur = byVid[f.villagerId];
    if (!cur || (f.day | 0) < (cur.day | 0)) byVid[f.villagerId] = f;
  });
  return Object.keys(byVid).map(function (vid) {
    const entry = byVid[vid];
    const day = entry.day | 0;
    const ctx = (row.scholarDeaths || []).filter(function (s) { return s.scholarId === vid && (s.day | 0) === day; })[0] || null;
    const split = splitRosterDeath(entry, ctx);
    return {
      vid: vid, day: day, causeRaw: entry.cause || null, deathCauseSplit: split,
      bucket: bucketFromSplit(split), isKiller: !!killerIds[vid],
      isScholarDeath: !!ctx, scholarCtx: ctx,
    };
  }).sort(function (a, b) { return a.day - b.day; });
}

function exposureDays(row, fates) {
  const firstById = {};
  fates.forEach(function (f) { firstById[f.by] = f.firstDay; });
  let fresh = 0, killerTotal = 0;
  (row.killerTrack || []).forEach(function (tr) {
    if (!firstById.hasOwnProperty(tr.by)) return;
    if (tr.deadInFallen) return;
    killerTotal++;
    const d = tr.day | 0;
    if (d >= (firstById[tr.by] | 0) && d <= ((firstById[tr.by] | 0) + 7)) fresh++;
  });
  let rosterDays = 0;
  (row.daily || []).forEach(function (s) { if (s.living != null) rosterDays += (s.living | 0); });
  return { freshKillerDays: fresh, killerDaysTotal: killerTotal, rosterDays: rosterDays, nonKillerRosterDays: rosterDays - killerTotal };
}

function analyzeDir(dir, prefix) {
  prefix = prefix || 'postblood-s';
  const base = AN.analyzeDir(dir, prefix);
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf(prefix) === 0 && f.endsWith('.json'); }).sort();
  const rows = files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  const killers = base.killers.map(function (k) {
    const bucket = bucketFromSplit(k.deathCauseSplit);
    return Object.assign({}, k, {
      bucket: bucket,
      deathKnown: k.deathDay != null,
      freshDeath: (k.deathDay != null && k.killToDeathDays != null && k.killToDeathDays <= 7),
      censored: k.deathDay == null,
    });
  });
  const deadKillers = killers.filter(function (k) { return !k.aliveAtEnd && k.deathKnown; });
  const deadUnknownDay = killers.filter(function (k) { return !k.aliveAtEnd && !k.deathKnown; });
  const censoredKillers = killers.filter(function (k) { return k.censored; });
  const freshDeaths = deadKillers.filter(function (k) { return k.freshDeath; });
  const freshShow = freshDeaths.filter(function (k) { return k.bucket === 'SHOW'; });
  const causeSplitDead = {};
  deadKillers.forEach(function (k) { causeSplitDead[k.bucket] = (causeSplitDead[k.bucket] | 0) + 1; });
  const causeSplitFresh = {};
  freshDeaths.forEach(function (k) { causeSplitFresh[k.bucket] = (causeSplitFresh[k.bucket] | 0) + 1; });

  // Roster ledger + exposure, pooled over the band.
  let ledger = [];
  let freshKillerDays = 0, killerDaysTotal = 0, rosterDays = 0;
  rows.forEach(function (row) {
    const fates = AN.killerFates(row);
    ledger = ledger.concat(rosterLedger(row).map(function (r) { return Object.assign({ seed: row.seed }, r); }));
    const ex = exposureDays(row, fates);
    freshKillerDays += ex.freshKillerDays; killerDaysTotal += ex.killerDaysTotal; rosterDays += ex.rosterDays;
  });
  const nonKillerDeaths = ledger.filter(function (r) { return !r.isKiller; });
  const nonKillerShow = nonKillerDeaths.filter(function (r) { return r.bucket === 'SHOW'; });
  const nonKillerScholarDeaths = nonKillerDeaths.filter(function (r) { return r.isScholarDeath; });
  const nonKillerNpcDeaths = nonKillerDeaths.filter(function (r) { return !r.isScholarDeath; });
  const nonFreshRosterDays = rosterDays - killerDaysTotal;
  const shareFresh = freshDeaths.length ? (freshShow.length / freshDeaths.length) : null;
  const shareNonKiller = nonKillerDeaths.length ? (nonKillerShow.length / nonKillerDeaths.length) : null;
  const rateFresh = freshKillerDays ? (freshShow.length / freshKillerDays * 100) : null;
  const rateBase = nonFreshRosterDays ? (nonKillerShow.length / nonFreshRosterDays * 100) : null;
  const shareRatio = (shareFresh != null && shareNonKiller != null && shareNonKiller > 0) ? (shareFresh / shareNonKiller) : null;
  const rateRatio = (rateFresh != null && rateBase != null && rateBase > 0) ? (rateFresh / rateBase) : null;
  const shareScholarNonKiller = nonKillerScholarDeaths.length ? (nonKillerScholarDeaths.filter(function (r) { return r.bucket === 'SHOW'; }).length / nonKillerScholarDeaths.length) : null;
  const shareNpcNonKiller = nonKillerNpcDeaths.length ? (nonKillerNpcDeaths.filter(function (r) { return r.bucket === 'SHOW'; }).length / nonKillerNpcDeaths.length) : null;

  // Sensitivity cuts (reported, never re-scored): 3d and 14d windows.
  function windowCut(n) {
    const fd = deadKillers.filter(function (k) { return k.killToDeathDays <= n; });
    const fs = fd.filter(function (k) { return k.bucket === 'SHOW'; });
    return { windowDays: n, deaths: fd.length, showDeaths: fs.length, showShare: fd.length ? fs.length / fd.length : null };
  }

  // Pre-registered ranked verdict. A ratio against a zero base is
  // undefined, not a pass — the prereg's "≥2×" presupposes a nonzero
  // base rate (flagged, never silently treated as infinite).
  const wildLargestFresh = freshDeaths.length > 0 &&
    (causeSplitFresh['WILD-MONSTER'] | 0) >= (causeSplitFresh['SHOW'] | 0) &&
    (causeSplitFresh['WILD-MONSTER'] | 0) >= (causeSplitFresh['EXPEDITION'] | 0) &&
    (causeSplitFresh['WILD-MONSTER'] | 0) >= (causeSplitFresh['OTHER'] | 0) &&
    (causeSplitFresh['WILD-MONSTER'] | 0) >= (causeSplitFresh['WILD-RESIDUAL'] | 0) &&
    (causeSplitFresh['WILD-MONSTER'] | 0) > 0;
  const ruleA = {
    nPass: freshDeaths.length >= 4,
    sharePass: shareRatio != null && shareRatio >= 2,
    ratePass: rateRatio != null && rateRatio >= 2,
    shareRatio: shareRatio, rateRatio: rateRatio,
    degenerateBaseZero: (shareNonKiller === 0 || rateBase === 0),
  };
  ruleA.implicated = ruleA.nPass && ruleA.sharePass && ruleA.ratePass;
  const ruleB = {
    wildLargest: wildLargestFresh,
    shareNotElevated: shareRatio != null ? shareRatio < 1.5 : (shareFresh != null && shareNonKiller === 0 ? shareFresh < 0.5 : null),
    shareRatio: shareRatio,
  };
  ruleB.implicated = ruleB.wildLargest && ruleB.shareNotElevated === true;
  let verdict = 'c-underpowered';
  if (ruleA.implicated) verdict = 'a-show-preferential';
  else if (ruleB.implicated) verdict = 'b-wild-dominant';

  // Closest seed (prereg): highest maxSimultaneous, tie-broken by
  // longest killer survival (alive at end beats any death span).
  function seedScore(s) {
    let best = -1;
    s.killers.forEach(function (k) {
      const span = k.aliveAtEnd ? 10000 : (k.killToDeathDays != null ? k.killToDeathDays : -1);
      if (span > best) best = span;
    });
    return best;
  }
  let closest = null;
  base.seeds.forEach(function (s) {
    if (!closest || s.maxSimultaneous > closest.maxSimultaneous ||
      (s.maxSimultaneous === closest.maxSimultaneous && seedScore(s) > seedScore(closest))) closest = s;
  });

  return Object.assign({}, base, {
    killers: killers,
    deadKillers: deadKillers.length, deadUnknownDayKillers: deadUnknownDay.length,
    censoredKillers: censoredKillers.length,
    killToDeathMedian: AN.median(deadKillers.map(function (k) { return k.killToDeathDays; })),
    killToDeathRange: deadKillers.length ? [Math.min.apply(null, deadKillers.map(function (k) { return k.killToDeathDays; })), Math.max.apply(null, deadKillers.map(function (k) { return k.killToDeathDays; }))] : null,
    diedWithin7d: deadKillers.filter(function (k) { return k.killToDeathDays <= 7; }).length,
    diedWithin1d: deadKillers.filter(function (k) { return k.killToDeathDays <= 1; }).length,
    causeSplitDeadKillers: causeSplitDead, causeSplitFreshDeaths: causeSplitFresh,
    freshDeaths: freshDeaths.length, freshShowDeaths: freshShow.length,
    showShareFresh: shareFresh, showShareNonKiller: shareNonKiller,
    shareRatio: shareRatio, rateRatio: rateRatio,
    showRateFreshPer100: rateFresh, showRateBasePer100: rateBase,
    freshKillerDays: freshKillerDays, killerDaysTotal: killerDaysTotal,
    rosterDays: rosterDays, nonKillerRosterDays: nonFreshRosterDays,
    rosterDeaths: ledger.length,
    nonKillerDeaths: nonKillerDeaths.length, nonKillerShowDeaths: nonKillerShow.length,
    nonKillerScholarDeaths: nonKillerScholarDeaths.length,
    nonKillerNpcDeaths: nonKillerNpcDeaths.length,
    showShareNonKillerScholar: shareScholarNonKiller,
    showShareNonKillerNpc: shareNpcNonKiller,
    rosterLedger: ledger,
    windowSensitivity: [windowCut(3), windowCut(14)],
    ruleA: ruleA, ruleB: ruleB, verdict: verdict,
    closestSeed: closest ? closest.seed : null,
  });
}

if (require.main === module) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: postblood-analyze-20261105.js <per-seed-dir>'); process.exit(2); }
  console.log(JSON.stringify(analyzeDir(dir), null, 2));
}

module.exports = { bucketFromSplit: bucketFromSplit, splitRosterDeath: splitRosterDeath, rosterLedger: rosterLedger, exposureDays: exposureDays, analyzeDir: analyzeDir };
