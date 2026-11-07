// finishersize-analyze-20261106.js — finisher-size analyzer (arm
// sim-finishersize-a, run fleshout-20261107T0221Z). Pure functions over the
// FS corpus (evidence/2026-11-06/perseed-finishersize-a/*.json). No sims.
// Reuses the grind analyzer's wall/field distribution helpers so the two
// corpora stay comparable. Adds the finisher-size funnel:
//   below-break meetings -> committable -> committed -> killed,
// plus the negative control (above-tail meetings must never commit) and
// the death guards (field-fighter deaths, scholar deaths per kill).
// Usage:
//   node scripts/finishersize-analyze-20261106.js [dir-or-files...]
//     (default: evidence/2026-11-06/perseed-finishersize-a)
//   node scripts/finishersize-analyze-20261106.js --compare <baseline-glob...> -- <armed-glob...>
//     prints the before/after table for the prereg primary metric.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const GRIND = require(path.join(REPO, 'scripts', 'grind-analyze-20261106'));

function isBelowBreak(r) {
  if (!r || (r.wave | 0) < 4) return false;
  if (r.contactFinishAttempted) return true;
  if (r.entryFrac != null && r.entryFrac < 0.15) return true;
  if (r.fsMetBelowBreak) return true;
  return false;
}
// A meeting is committable when the engine evaluated the contact finish
// (fs fields present, armed leg) and recorded no blocking reason other
// than size — or, on the baseline leg where fs fields are absent, when
// the contact finish actually fired (the old code's own gate: wave>=3,
// instrument held, true contact). The baseline cannot see intent/HP, so
// its committable count is the contact-fired count; the armed leg refines
// it with fsNoCommitWhy. NOTE: an FS commit is counted by fsCommitMhp
// (set at commit time), never by the end-of-fight kind — twoblow can take
// a live FS commit over mid-fight (kind flips to 'two-blow'), and the
// commit still fired.
function isCommittable(r) {
  if (!isBelowBreak(r)) return false;
  if (r.fsCommitMhp != null) return true; // FS commit fired (either kind at end)
  if (r.fsNoCommitWhy) return r.fsNoCommitWhy === 'above-tail';
  return !!r.contactFinishAttempted;
}
function isAboveTail(r) {
  // Above the sized tail: the engine said so (armed leg), or the contact
  // strike left more than 3x the strike (derivable on both legs from the
  // recorded contact-finish HP + damage).
  if (r.fsNoCommitWhy === 'above-tail') return true;
  if (r.contactFinishAttempted && r.contactFinishBeastHp != null && r.contactFinishDmg != null) {
    const left = r.contactFinishBeastHp - r.contactFinishDmg;
    return left > 3 * r.contactFinishDmg;
  }
  return false;
}

function fsFunnel(rows) {
  const list = (rows || []).filter(function (r) { return r && (r.wave | 0) >= 4; });
  const below = list.filter(isBelowBreak);
  const committed = below.filter(function (r) { return r.fsCommitMhp != null; });
  const takeover = committed.filter(function (r) { return r.fsCommitKind === 'two-blow'; });
  const twoblow = below.filter(function (r) { return r.committedFinish && r.fsCommitMhp == null; });
  const aboveTail = below.filter(isAboveTail);
  const aboveTailCommitted = aboveTail.filter(function (r) { return r.fsCommitMhp != null; });
  const kills = below.filter(function (r) { return r.outcome === 'vKill'; });
  const committedKills = committed.filter(function (r) { return r.outcome === 'vKill'; });
  const lapsed = below.filter(function (r) { return r.fsLapsed; });
  return {
    w4field: list.length,
    belowBreakMeetings: below.length,
    belowBreakKills: kills.length,
    belowBreakOutcomes: (function () { const o = {}; below.forEach(function (r) { o[r.outcome] = (o[r.outcome] || 0) + 1; }); return o; })(),
    belowBreakEntries: below.map(function (r) {
      return { seed: r.seed, day: r.day, mid: r.mid, entryHp: r.entryHp, entryFrac: r.entryFrac,
        contactHp: r.contactFinishBeastHp, contactDmg: r.contactFinishDmg,
        fsKind: r.fsCommitKind, fsRounds: r.fsCommitRounds, fsLapsed: r.fsLapsed,
        outcome: r.outcome, rounds: r.rounds, mDealt: r.mDealt, vHpLeft: r.vHpLeft };
    }),
    committable: below.filter(isCommittable).length,
    committedMetBelowBreak: committed.length,
    committedTakeoverTwoBlow: takeover.length,
    committedTwoblow: twoblow.length,
    committedKills: committedKills.length,
    committedLapsed: lapsed.length,
    aboveTailMeetings: aboveTail.length,
    aboveTailCommitted: aboveTailCommitted.length,
    fieldFighterDeaths: list.filter(function (r) { return r.outcome === 'vDie'; }).length,
    noCommitReasons: (function () { const o = {}; below.forEach(function (r) { if (r.fsNoCommitWhy) o[r.fsNoCommitWhy] = (o[r.fsNoCommitWhy] || 0) + 1; }); return o; })(),
  };
}

function analyzeFiles(files) {
  const jsons = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
  jsons.forEach(function (j) { (j.fieldFights || []).forEach(function (r) { r.seed = j.seed; }); });
  const allField = jsons.reduce(function (a, j) { return a.concat(j.fieldFights || []); }, []);
  const w4kills = jsons.reduce(function (s, j) { return s + ((j.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length); }, 0);
  const scholarDeaths = jsons.reduce(function (s, j) { return s + ((j.scholarDeaths || []).length); }, 0);
  return {
    wall: GRIND.wallSummary(jsons),
    field: { w4: GRIND.fieldDist(allField, 4) },
    fs: fsFunnel(allField),
    w4killsAllChannels: w4kills,
    scholarDeaths: scholarDeaths,
    perSeed: jsons.map(function (j) {
      return { seed: j.seed, days: j.days, end: j.endReason, maxWave: j.maxWave, standing: j.standing,
        scaleRank: j.scaleRank, w4kills: (j.waveKillLog || []).filter(function (e) { return (e.w | 0) >= 4; }).length,
        w4field: (j.fieldFights || []).filter(function (f) { return (f.wave | 0) >= 4; }).length,
        scholarDeaths: (j.scholarDeaths || []).length,
        instrumentErrors: (j.instrumentErrors || []).length };
    }),
  };
}

function collectInputs(args) {
  const out = [];
  args.forEach(function (a) {
    const st = fs.statSync(a);
    if (st.isDirectory()) {
      fs.readdirSync(a).filter(function (f) { return /\.json$/.test(f); }).sort().forEach(function (f) { out.push(path.join(a, f)); });
    } else out.push(a);
  });
  return out;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const ci = args.indexOf('--compare');
  if (ci >= 0) {
    const sep = args.indexOf('--', ci + 1);
    // FS-ANALYZE FIX (2026-11-07): the baseline side is ONLY the files
    // between --compare and --. The old code filtered '--' out of the
    // whole tail and counted the armed files on BOTH sides (16 seeds,
    // scholar deaths 132 = baseline+armed). Caught by the wall numbers
    // doubling; the armed side was always correct.
    const before = collectInputs(sep >= 0 ? args.slice(ci + 1, sep) : args.slice(ci + 1));
    const afterArgs = sep >= 0 ? args.slice(sep + 1) : [];
    const after = collectInputs(afterArgs);
    if (!before.length || !after.length) { console.error('FS-ANALYZE STOP: --compare needs baseline files and armed files after --'); process.exit(2); }
    const b = analyzeFiles(before), a = analyzeFiles(after);
    const d = function (x) { return x == null ? null : x; };
    console.log(JSON.stringify({
      primary: {
        belowBreakMeetings: { baseline: b.fs.belowBreakMeetings, armed: a.fs.belowBreakMeetings },
        belowBreakKills: { baseline: b.fs.belowBreakKills, armed: a.fs.belowBreakKills, delta: a.fs.belowBreakKills - b.fs.belowBreakKills },
        committable: { baseline: b.fs.committable, armed: a.fs.committable },
        committedMetBelowBreak: { baseline: b.fs.committedMetBelowBreak, armed: a.fs.committedMetBelowBreak },
        committedTakeoverTwoBlow: { baseline: b.fs.committedTakeoverTwoBlow, armed: a.fs.committedTakeoverTwoBlow },
        committedKills: { baseline: b.fs.committedKills, armed: a.fs.committedKills },
        committedLapsed: { baseline: b.fs.committedLapsed, armed: a.fs.committedLapsed },
        aboveTailMeetings: { baseline: b.fs.aboveTailMeetings, armed: a.fs.aboveTailMeetings },
        aboveTailCommitted: { baseline: b.fs.aboveTailCommitted, armed: a.fs.aboveTailCommitted },
        noCommitReasons: { baseline: b.fs.noCommitReasons, armed: a.fs.noCommitReasons },
      },
      guards: {
        fieldFighterDeaths: { baseline: b.fs.fieldFighterDeaths, armed: a.fs.fieldFighterDeaths },
        scholarDeaths: { baseline: b.scholarDeaths, armed: a.scholarDeaths },
        w4killsAllChannels: { baseline: b.w4killsAllChannels, armed: a.w4killsAllChannels },
      },
      wall: { baseline: b.wall, armed: a.wall },
      belowBreakEntries: { baseline: b.fs.belowBreakEntries, armed: a.fs.belowBreakEntries },
    }, null, 2));
  } else {
    const dir = args.length ? args : [path.join(REPO, 'evidence', '2026-11-06', 'perseed-finishersize-a')];
    const files = collectInputs(dir);
    if (!files.length) { console.error('FS-ANALYZE STOP: no JSON files found.'); process.exit(2); }
    console.log(JSON.stringify(analyzeFiles(files), null, 2));
  }
}

module.exports = { isBelowBreak: isBelowBreak, isCommittable: isCommittable,
  isAboveTail: isAboveTail, fsFunnel: fsFunnel, analyzeFiles: analyzeFiles };
