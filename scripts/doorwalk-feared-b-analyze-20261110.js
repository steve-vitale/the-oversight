// doorwalk-feared-b-analyze-20261110.js — the feared/witness door analyzer
// (arm sim-doorwalk-feared-b, run oversight-playtest-loop-2, 2026-11-10,
// Lane B leg 4 endgame). Reuses the doorwalk-b analyzer's pure helpers
// (analyzeSeed, preEntryMatch, entriesFromVerbs, medianOf, starvation)
// via require and re-judges under THIS run's prereg
// (evidence/2026-11-10/sim-doorwalk-feared-b-prereg.md):
//   PRIMARY: doors entered >= 3/8 armed vs 0/8 baseline; every entered
//     door feared or witness; every entered door reaches a resolution
//     (win, or a finals answer after a downgrade — no stall, no
//     unanswered modal at run end).
//   SUBSTRATE SANITY: baseline lesser >= 3/8 AND sat >= 3/8.
//   SUBSTRATE GUARD: per-seed exact reproduction >= 6/8 (same clauses
//     as doorwalk-b).
//   COST (REVISED — doorwalk metric review): starvation <= baseline + 2
//     AND arm-only <= 2; per-seed survival non-inferiority — every
//     non-won armed seed's days >= its baseline pair's days (won seeds
//     count as success); 0 violations.
//   REACHABLE RULE: reachable = sat on the baseline leg; every reachable
//     seed must sit AND walk on the armed leg; offered-not-taken gate
//     days on the armed leg must be 0 (a ready preview the drive never
//     answers).
// Prints a JSON summary to stdout and writes it to
// /tmp/doorwalk-feared-b-analysis.json (working copy; the evidence file
// is the record). Usage:
//   node scripts/doorwalk-feared-b-analyze-20261110.js [baselineDir] [armedDir]
'use strict';
const fs = require('fs');
const path = require('path');
const OLD = require(path.join(__dirname, 'doorwalk-b-analyze-20261107'));
const analyzeSeed = OLD.analyzeSeed;
const preEntryMatch = OLD.preEntryMatch;
const medianOf = OLD.medianOf;
const starvation = OLD.starvation;

function loadDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const bySeed = {};
  files.forEach(function (f) {
    const o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[o.seed] = o;
  });
  return bySeed;
}
function w4kills(o) {
  return (o.waveKillLog || []).filter(function (e) { return ((e.w | 0) >= 4); }).length;
}
function wallOf(rows) {
  return {
    national: rows.filter(function (r) { return r.scaleRank === 'national' || r.scaleRank === 'global'; }).length,
    tableSat: rows.filter(function (r) { return r.tsTaken > 0; }).length,
    doorsEntered: rows.filter(function (r) { return r.doorsEntered > 0; }).length,
    wins: rows.filter(function (r) { return r.won; }).length,
    wave4unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 4; }).length,
    wave5unlock: rows.filter(function (r) { return (r.maxWave | 0) >= 5; }).length,
    lesserSeats: rows.filter(function (r) { return r.finalSeat === 'lesser'; }).length,
    fullSeats: rows.filter(function (r) { return r.finalSeat === 'full'; }).length,
    medianSurvival: medianOf(rows.map(function (r) { return r.days; })),
    survivals: rows.map(function (r) { return r.days; }),
  };
}

// judgeVerdict(bRows, aRows, seeds, base, armed): the prereg verdict over
// analyzeSeed rows plus the raw corpora (the guard needs daily rows).
// Exported so the proof can pin it on fixtures.
function judgeVerdict(bRows, aRows, seeds, base, armed) {
  // --- substrate guard: per-seed exact reproduction (doorwalk-b clauses) ---
  const guard = [];
  seeds.forEach(function (s, i) {
    const b = base[s], a = armed[s];
    const aRow = aRows[i];
    if (!aRow.doorsEntered) {
      const match = (a.days === b.days) && (a.endReason === b.endReason) &&
        (a.standing === b.standing) && (a.maxWave === b.maxWave) &&
        (w4kills(a) === w4kills(b)) &&
        (((a.finalSeat || {}).seat || null) === ((b.finalSeat || {}).seat || null)) &&
        (a.gameDays === b.gameDays);
      guard.push({ seed: s, clause: 'never-entered whole-run', match: match,
        firstDiff: match ? null : ('days ' + a.days + '/' + b.days + ' end ' + a.endReason + '/' + b.endReason + ' standing ' + a.standing + '/' + b.standing + ' maxWave ' + a.maxWave + '/' + b.maxWave + ' w4kills ' + w4kills(a) + '/' + w4kills(b) + ' seat ' + ((a.finalSeat || {}).seat) + '/' + ((b.finalSeat || {}).seat)) });
    } else {
      const pre = preEntryMatch(b, a, aRow.entryDay);
      guard.push({ seed: s, clause: 'entered pre-entry day<' + aRow.entryDay, match: pre.match, daysCompared: pre.daysCompared, firstDiff: pre.firstDiff });
    }
  });
  const guardPass = guard.filter(function (g) { return g.match; }).length;

  // --- primary / sanity / cost / reachable ---
  const enteredArmed = aRows.filter(function (r) { return r.doorsEntered > 0; }).length;
  const enteredBase = bRows.filter(function (r) { return r.doorsEntered > 0; }).length;
  const walkedPaths = {};
  aRows.forEach(function (r) { (r.walked || []).forEach(function (w) { walkedPaths[w.path] = (walkedPaths[w.path] | 0) + 1; }); });
  const enteredNonAssigned = aRows.filter(function (r) {
    return (r.walked || []).some(function (w) { return w.path !== 'feared' && w.path !== 'witness'; });
  }).length;
  // Assignment compliance (prereg primary clause): a walk is compliant
  // if it is the assigned door, OR a documented fallback (fellBack true
  // with the assigned door absent from that walk's offered list — the
  // door rule's own record). Anything else is a non-compliant walk.
  const ROT = ['feared', 'witness', 'feared', 'witness'];
  function assignedFor(seed) { return ROT[(((seed - 53001) % 4) + 4) % 4]; }
  const nonCompliant = [];
  aRows.forEach(function (r) {
    (r.walked || []).forEach(function (w) {
      const assigned = assignedFor(r.seed);
      if (w.path === assigned) return;
      const off = (r.offers || []).filter(function (o) { return o.day === w.day; })[0];
      const offered = off ? (off.offered || []) : [];
      if (w.fellBack && offered.indexOf(assigned) < 0) return; // legitimate fallback
      nonCompliant.push({ seed: r.seed, path: w.path, assigned: assigned, fellBack: !!w.fellBack });
    });
  });
  // Resolution: a walked door reaches a finals answer (win or downgrade
  // played through). A walk with no finals answer and no win is
  // unresolved — a stall or an unanswered modal at run end.
  const unresolved = aRows.filter(function (r) {
    return r.doorsEntered > 0 && !(r.won) && (r.finalsAnswers | 0) === 0;
  }).map(function (r) { return r.seed; });
  const baseSeats = bRows.filter(function (r) { return r.finalSeat === 'lesser' || r.finalSeat === 'full'; }).length;
  const baseSat = bRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const armedSat = aRows.filter(function (r) { return r.tsTaken > 0; }).length;
  const bStarv = bRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const aStarv = aRows.reduce(function (t, r) { return t + r.starvation; }, 0);
  const armOnlyStarv = aRows.reduce(function (t, r, i) { return t + (bRows[i].starvation === 0 ? r.starvation : 0); }, 0);
  // Per-seed survival non-inferiority (REVISED cost bar): every non-won
  // armed seed's days >= its baseline pair's days. Won seeds count as
  // success. Judged on the `days` field on both legs.
  const survViolations = [];
  seeds.forEach(function (s, i) {
    const b = bRows[i], a = aRows[i];
    if (!a.won && a.days < b.days) survViolations.push({ seed: s, armedDays: a.days, baselineDays: b.days });
  });
  // Reachable set: sat on the baseline leg. Every reachable seed must
  // sit AND walk on the armed leg.
  const reachable = bRows.filter(function (r) { return r.tsTaken > 0; }).map(function (r) { return r.seed; });
  const reachableMissed = reachable.filter(function (s) {
    const a = aRows[seeds.indexOf(s)];
    return !(a.tsTaken > 0 && a.doorsEntered > 0);
  });
  const offerNotTakenArmed = aRows.reduce(function (t, r) { return t + ((r.gates || {})['offer-not-taken'] | 0); }, 0);
  const branches = {};
  aRows.forEach(function (r) { (r.walked || []).forEach(function (w) { branches[w.branch || '?'] = (branches[w.branch || '?'] | 0) + 1; }); });

  const verdict = {
    primary: { enteredArmed: enteredArmed, enteredBaseline: enteredBase, bar: '>=3/8 armed vs 0/8 baseline',
      walkedPaths: walkedPaths, enteredNonAssigned: enteredNonAssigned,
      nonCompliantWalks: nonCompliant,
      unresolvedSeeds: unresolved,
      pass: enteredArmed >= 3 && enteredBase === 0 && nonCompliant.length === 0 && unresolved.length === 0 },
    substrateSanity: { baseSeatsEarned: baseSeats, baseSat: baseSat, armedSat: armedSat, bar: 'baseline lesser >=3/8 AND sat >=3/8', pass: baseSeats >= 3 && baseSat >= 3 },
    substrateGuard: { exactSeeds: guardPass, of: seeds.length, bar: '>=6/8 per-seed exact', pass: guardPass >= 6, detail: guard },
    reachable: { reachable: reachable, missed: reachableMissed, offerNotTakenArmedDays: offerNotTakenArmed,
      bar: 'every reachable seed sits AND walks; offered-not-taken empty on armed leg',
      pass: reachableMissed.length === 0 && offerNotTakenArmed === 0 },
    costBar: {
      starvationBase: bStarv, starvationArmed: aStarv, starvationCap: bStarv + 2,
      starvationArmOnly: armOnlyStarv, starvationArmOnlyCap: 2,
      starvationPass: aStarv <= bStarv + 2 && armOnlyStarv <= 2,
      survivalViolations: survViolations,
      survivalPass: survViolations.length === 0,
      branches: branches,
    },
  };
  verdict.costBar.pass = verdict.costBar.starvationPass && verdict.costBar.survivalPass;
  verdict.overall = verdict.primary.pass && verdict.substrateSanity.pass && verdict.substrateGuard.pass && verdict.reachable.pass && verdict.costBar.pass
    ? 'GO' : 'NO-GO';
  if (!verdict.substrateSanity.pass) verdict.overall = 'NO-GO (substrate — door drive unjudged)';

  return { verdict: verdict, guard: guard, wallBaseline: wallOf(bRows), wallArmed: wallOf(aRows) };
}

if (require.main === module) {
  const baseDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-10', 'perseed-doorwalk-feared-b-baseline');
  const armedDir = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-10', 'perseed-doorwalk-feared-b-armed');
  const base = loadDir(baseDir);
  const armed = loadDir(armedDir);
  const seeds = Object.keys(base).map(Number).sort(function (a, b) { return a - b; });
  if (!seeds.length) throw new Error('no baseline files in ' + baseDir);
  seeds.forEach(function (s) { if (!armed[s]) throw new Error('missing armed file for seed ' + s); });

  const bRows = seeds.map(function (s) { return analyzeSeed(base[s]); });
  const aRows = seeds.map(function (s) { return analyzeSeed(armed[s]); });
  const judged = judgeVerdict(bRows, aRows, seeds, base, armed);

  const out = {
    arm: 'doorwalk-feared-b', seeds: seeds,
    baseline: bRows, armed: aRows,
    guard: judged.guard, wallBaseline: judged.wallBaseline, wallArmed: judged.wallArmed,
    verdict: judged.verdict,
  };
  fs.writeFileSync('/tmp/doorwalk-feared-b-analysis.json', JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify(out, null, 2));
}
module.exports = { loadDir: loadDir, judgeVerdict: judgeVerdict, wallOf: wallOf };
