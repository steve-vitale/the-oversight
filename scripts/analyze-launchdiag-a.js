// scripts/analyze-launchdiag-a.js — sub-arm (1a): pick-early-return
// delay-vs-wall (tracker blank #5, sim-musterask-a follow-up).
//
// Reads the FROZEN musterask replay corpora
// (evidence/2026-11-23/perseed-musterask-a-ctl/, anchor dbe748d46)
// read-only and classifies each of the 14 frozen pick-early-return
// holder-days by NEXT-DAY fate (DELAY vs WALL). The D+1 dawn cause is
// re-derived by the musterask analyzer's own classifier (required from
// scripts/analyze-musterask-a.js — same code that produced the frozen
// analysis) and cross-checked against the frozen analysis JSON.
//
//   node scripts/analyze-launchdiag-a.js [--dir <corpusDir>]
//       [--frozen <musterask-a-analysis.json>]
//       [--out <analysis.json>] [--selftest]
//
// Frozen prereg: evidence/2026-11-24/sim-launchdiag-a-prereg.md (§1–§4).
// No sims run here; no corpus is written. Determinism bar: run twice,
// byte-identical output.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const musterAsk = require(path.join(REPO, 'scripts', 'analyze-musterask-a'));

// ---- frozen judged set (prereg §1) ----
const JUDGED_14 = [
  { seed: 107617, day: 109, vid: 'visjoin_84', stage: 'party', target: 'congregation', kinds: ['EAT@p1', 'EAT@p3'] },
  { seed: 107617, day: 136, vid: 'visjoin_130', stage: 'party', target: 'herald', kinds: ['SEEK@p0'], refreshRefused: true },
  { seed: 107620, day: 141, vid: 'visjoin_135', stage: 'party', target: 'eulogy', kinds: ['SEEK@p1', 'EAT@p3'] },
  { seed: 107620, day: 144, vid: 'visjoin_135', stage: 'party', target: 'eulogy', kinds: ['EAT@p2'] },
  { seed: 107622, day: 120, vid: 'james_okonkwo', stage: 'standing', target: 'reunion', kinds: ['EAT@p0', 'EAT@p3'] },
  { seed: 107623, day: 124, vid: 'daniyar_askarov', stage: 'party', target: 'herald', kinds: ['EAT@p1', 'EAT@p3'], refreshRefused: true },
  { seed: 107623, day: 126, vid: 'daniyar_askarov', stage: 'party', target: 'herald', kinds: ['EAT@p1'] },
  { seed: 107624, day: 74, vid: 'sofia_chen', stage: 'hunt', target: 'congregation', kinds: ['EAT@p2', 'EAT@p3'] },
  { seed: 107624, day: 74, vid: 'tashi_sherpa', stage: 'hunt', target: 'congregation', kinds: ['EAT@p2', 'EAT@p3'] },
  { seed: 107624, day: 79, vid: 'gen_o96e0k3', stage: 'hunt', target: 'congregation', kinds: ['EAT@p1', 'EAT@p2'] },
  { seed: 107624, day: 116, vid: 'meera_reddy', stage: 'hunt', target: 'congregation', kinds: ['EAT@p2', 'EAT@p3'] },
  { seed: 107624, day: 116, vid: 'sofia_chen', stage: 'hunt', target: 'congregation', kinds: ['EAT@p2'] },
  { seed: 107624, day: 117, vid: 'meera_reddy', stage: 'hunt', target: 'congregation', kinds: ['EAT@p1', 'EAT@p2', 'EAT@p3'] },
  { seed: 107624, day: 120, vid: 'henry_zhang', stage: 'hunt', target: 'congregation', kinds: ['EAT@p2'] },
];

const DAWN_CAUSES = [
  'never-asked:holder-scholar-at-dawn', 'never-asked:holder-engaged-at-dawn',
  'never-asked:holder-away-at-dawn', 'never-asked:holder-on-expedition-at-dawn',
  'never-asked:holder-not-at-haven-at-dawn', 'never-asked:holder-off-roster-at-dawn',
  'never-asked:pick-early-return', 'never-asked:objective-live-all-day',
  'never-asked:plan-created-after-dawn',
];

// isW4pPlan, mirroring analyze-musterask-a.js (not exported there).
const W4P_IDS = new Set(musterAsk.loadWave4pIds());
function isW4pPlan(p) {
  if (!p) return false;
  if ((p.needWave | 0) >= 4) return true;
  return !!(p.target && W4P_IDS.has(p.target));
}

function scoredOn(seedCorpus, vid, day) {
  for (const r of (seedCorpus.muster || [])) {
    if (r.vid === vid && r.day === day) return r;
  }
  return null;
}
function launchedOn(seedCorpus, vid, day) {
  for (const r of (seedCorpus.v4departs || [])) {
    if (r.vid === vid && r.day === day && r.result === 'launch') return r;
  }
  for (const r of (seedCorpus.dawnbidDeparts || [])) {
    if (r.vid === vid && r.day === day && r.result === 'launch') return r;
  }
  return null;
}
function diedOn(seedCorpus, vid, day) {
  for (const r of (seedCorpus.deaths || [])) {
    if (r.who === vid && r.day === day) return r;
  }
  return null;
}
function planOn(seedCorpus, vid, day) {
  for (const c of (seedCorpus.planCensus || [])) {
    if (c.vid === vid && c.day === day && isW4pPlan(c)) return c;
  }
  return null;
}

// classifyNextDay(seedCorpus, neverScoredForSeed, judged): the frozen
// §2 taxonomy, first match wins. neverScoredForSeed is the re-derived
// (musterask classifier) neverScored list for this seed.
function classifyNextDay(seedCorpus, neverScoredForSeed, judged) {
  const d1 = judged.day + 1;
  const vid = judged.vid;
  const scored = scoredOn(seedCorpus, vid, d1);
  if (scored) {
    return { cls: 'delay-scored-next-day', side: 'DELAY',
      detail: 'scored d' + d1 + ' ' + vid + ': muster row part ' + (scored.part | 0) +
        ' ask ' + (scored.askKind || '?') + ' — the ask happened the next day',
      proof: { musterDay: d1, part: scored.part | 0, askKind: scored.askKind || null } };
  }
  const launch = launchedOn(seedCorpus, vid, d1);
  if (launch) {
    return { cls: 'delay-launched-next-day', side: 'DELAY',
      detail: 'launched d' + d1 + ' ' + vid + ': v4departs result launch — the plan departed; the silence did not block the ask\'s outcome',
      proof: { departDay: d1, result: 'launch' } };
  }
  const ns = (neverScoredForSeed || []).filter(function (e) { return e.vid === vid && e.day === d1; })[0] || null;
  if (ns && ns.cause && ns.cause !== 'unclassified') {
    if (ns.cause === 'never-asked:pick-early-return') {
      return { cls: 'wall-early-return-again', side: 'WALL',
        detail: 'never scored d' + d1 + ' ' + vid + ': pick-early-return AGAIN — ' + (ns.detail || ''),
        proof: { cause: ns.cause, detail: ns.detail || null } };
    }
    if (DAWN_CAUSES.indexOf(ns.cause) !== -1) {
      return { cls: 'wall-other-dawn-cause', side: 'WALL',
        detail: 'never scored d' + d1 + ' ' + vid + ': ' + ns.cause + ' — ' + (ns.detail || ''),
        proof: { cause: ns.cause, detail: ns.detail || null } };
    }
    // Amendment 1 (prereg): the EOD holder-not-scored label is a
    // first pass, not a mechanism — run the dawn classifier
    // underneath it and name the dawn cause if one fires.
    if (ns.cause === 'never-asked:holder-not-scored') {
      const dawn = musterAsk.classifyNeverScoredDawn(seedCorpus,
        { day: d1, vid: vid, stage: ns.stage || null, target: ns.target || null, subcause: 'unknown' });
      if (dawn && dawn.cause) {
        if (dawn.cause === 'never-asked:pick-early-return') {
          return { cls: 'wall-early-return-again', side: 'WALL',
            detail: 'never scored d' + d1 + ' ' + vid + ': pick-early-return AGAIN (under EOD label holder-not-scored) — ' + (dawn.detail || ''),
            proof: { cause: dawn.cause, detail: dawn.detail || null, eodCause: ns.cause } };
        }
        if (DAWN_CAUSES.indexOf(dawn.cause) !== -1) {
          return { cls: 'wall-other-dawn-cause', side: 'WALL',
            detail: 'never scored d' + d1 + ' ' + vid + ': ' + dawn.cause + ' (under EOD label holder-not-scored) — ' + (dawn.detail || ''),
            proof: { cause: dawn.cause, detail: dawn.detail || null, eodCause: ns.cause } };
        }
      }
      return { cls: 'unclassified', side: null,
        detail: 'd' + d1 + ' ' + vid + ': EOD label holder-not-scored (' + (ns.subcause || '?') + ') and no dawn cause underneath it',
        proof: { cause: ns.cause, subcause: ns.subcause || null } };
    }
    return { cls: 'unclassified', side: null,
      detail: 'd' + d1 + ' ' + vid + ': neverScored cause ' + ns.cause + ' is not a dawn cause — taxonomy has no name for it',
      proof: { cause: ns.cause } };
  }
  const dead = diedOn(seedCorpus, vid, d1);
  if (dead) {
    return { cls: 'wall-holder-dead', side: 'WALL',
      detail: 'holder dead by end of d' + d1 + ' ' + vid + ': deaths row kind ' + (dead.kind || '?') + ' cause ' + (dead.cause || '?'),
      proof: { deathDay: d1, kind: dead.kind || null, cause: dead.cause || null } };
  }
  if (!planOn(seedCorpus, vid, d1)) {
    return { cls: 'wall-plan-gone', side: 'WALL',
      detail: 'no wave-4+ planCensus row for ' + vid + ' on d' + d1 + ' — the plan was dropped / completed / abandoned; the question dissolved, not deferred',
      proof: { planRow: null } };
  }
  if (seedCorpus.villageLost && (seedCorpus.days | 0) <= d1) {
    return { cls: 'wall-village-lost', side: 'WALL',
      detail: 'village lost d' + (seedCorpus.days | 0) + ' (endReason ' + (seedCorpus.endReason || '?') + ') on or before d' + d1,
      proof: { lostDay: seedCorpus.days | 0, endReason: seedCorpus.endReason || null } };
  }
  return { cls: 'unclassified', side: null,
    detail: 'd' + d1 + ' ' + vid + ': holder alive with a wave-4+ plan and no muster row, no launch, no dawn cause — no name in the taxonomy',
    proof: {} };
}

// firstScoredWithin(seedCorpus, vid, fromDay, toDay): secondary, NOT
// judged — the first scored day in the window, or null.
function firstScoredWithin(seedCorpus, vid, fromDay, toDay) {
  for (let d = fromDay; d <= toDay; d++) {
    if (scoredOn(seedCorpus, vid, d)) return d;
  }
  return null;
}

function loadCorpora(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[c.seed] = c;
  }
  return out;
}

function analyzeDir(dir, frozenPath) {
  const corpora = loadCorpora(dir);
  const frozen = frozenPath ? JSON.parse(fs.readFileSync(frozenPath, 'utf8')) : null;
  const frozenBySeed = {};
  if (frozen) {
    for (const ps of (frozen.perSeed || [])) frozenBySeed[ps.seed] = ps;
  }
  // Re-derive the musterask analysis on the frozen corpora (same
  // classifier that produced the frozen analysis) and cross-check.
  const rederived = {};
  const crossCheck = { seedsCompared: 0, neverScoredMatch: 0, neverScoredMismatch: [], wallMatch: null };
  let wall = { wins: 0, national: 0, table: 0, wave5: 0, wave4: 0, medianSurvival: null, maxSurvival: null, villagesLost: 0, totalDeaths: 0 };
  const surv = [];
  for (const seed of Object.keys(corpora).map(Number).sort(function (a, b) { return a - b; })) {
    const c = corpora[seed];
    const s = musterAsk.analyzeSeed(c);
    rederived[seed] = s;
    surv.push(s.days);
    wall.wins += s.won ? 1 : 0;
    wall.national += (s.scaleRank === 'national' || s.scaleRank === 'global') ? 1 : 0;
    wall.wave5 += (s.maxWave | 0) >= 5 ? 1 : 0;
    wall.wave4 += (s.maxWave | 0) >= 4 ? 1 : 0;
    wall.villagesLost += s.villageLost ? 1 : 0;
    wall.totalDeaths += s.deaths;
    if (frozenBySeed[seed]) {
      crossCheck.seedsCompared++;
      const fns = (frozenBySeed[seed].neverScored || []).map(function (e) { return e.day + '|' + e.vid + '|' + e.cause; }).sort();
      const rns = (s.neverScored || []).map(function (e) { return e.day + '|' + e.vid + '|' + e.cause; }).sort();
      if (JSON.stringify(fns) === JSON.stringify(rns)) crossCheck.neverScoredMatch++;
      else crossCheck.neverScoredMismatch.push({ seed: seed, frozenOnly: fns.filter(function (x) { return rns.indexOf(x) === -1; }), rederivedOnly: rns.filter(function (x) { return fns.indexOf(x) === -1; }) });
    }
  }
  surv.sort(function (a, b) { return a - b; });
  wall.medianSurvival = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  wall.maxSurvival = surv.length ? surv[surv.length - 1] : null;
  if (frozen && frozen.wall) {
    crossCheck.wallMatch = JSON.stringify({
      wins: wall.wins, national: wall.national, wave5: wall.wave5, wave4: wall.wave4,
      medianSurvival: wall.medianSurvival, maxSurvival: wall.maxSurvival,
      villagesLost: wall.villagesLost, totalDeaths: wall.totalDeaths,
    }) === JSON.stringify({
      wins: frozen.wall.wins, national: frozen.wall.national, wave5: frozen.wall.wave5, wave4: frozen.wall.wave4,
      medianSurvival: frozen.wall.medianSurvival, maxSurvival: frozen.wall.maxSurvival,
      villagesLost: frozen.wall.villagesLost, totalDeaths: frozen.wall.totalDeaths,
    });
  }
  // Classify the 14 judged days.
  const judged = [];
  const classCounts = {};
  let delay = 0, wallN = 0, unclassified = 0;
  let instrumentErrors = 0;
  for (const j of JUDGED_14) {
    const c = corpora[j.seed];
    if (!c) { throw new Error('missing corpus for seed ' + j.seed); }
    instrumentErrors += (c.instrumentErrors || []).length;
    const r = classifyNextDay(c, rederived[j.seed].neverScored, j);
    const firstLater = firstScoredWithin(c, j.vid, j.day + 1, j.day + 3);
    classCounts[r.cls] = (classCounts[r.cls] || 0) + 1;
    if (r.side === 'DELAY') delay++;
    else if (r.side === 'WALL') wallN++;
    else unclassified++;
    judged.push({ seed: j.seed, day: j.day, vid: j.vid, stage: j.stage, target: j.target,
      kinds: j.kinds, refreshRefused: !!j.refreshRefused,
      nextDay: j.day + 1, cls: r.cls, side: r.side, detail: r.detail,
      proof: r.proof, firstScoredWithin3d: firstLater });
  }
  return {
    arm: 'launchdiag-a-1a', dir: dir,
    frozenAnalysis: frozenPath ? path.relative(REPO, frozenPath) : null,
    judgedSet: JUDGED_14.length,
    judged: judged,
    classCounts: classCounts,
    delay: delay, wall: wallN, unclassified: unclassified,
    crossCheck: crossCheck,
    wallNumbers: wall,
    instrumentErrors: instrumentErrors,
  };
}

// ---- selftest ----
function synthCorpus(over) {
  const base = {
    seed: 1, days: 150, gameDays: 151, endReason: 'survived', villageLost: false,
    maxWave: 4, standing: 150, scaleRank: 'regional', won: false,
    muster: [], planCensus: [], v4departs: [], dawnbidDeparts: [], deaths: [],
    dawnState: [], objPickLog: [], objTickTrace: [], refreshLog: [], daily: [],
    v4creates: [], funnelStage: [], companionPool: [], dawnbidScores: [],
    instrumentErrors: [], tickGateChecks: [],
  };
  return Object.assign(base, over || {});
}
function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; }
    else { fail++; console.log('SELFTEST FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const J = { seed: 1, day: 10, vid: 'v1', stage: 'party', target: 'congregation', kinds: ['EAT@p1'] };
  // 1. delay-scored-next-day (any part, incl. mid-day refresh part 2).
  let c = synthCorpus({ muster: [{ day: 11, part: 2, vid: 'v1', askKind: 'party_wait' }],
    planCensus: [{ day: 11, vid: 'v1', needWave: 4, stage: 'party', target: 'congregation', holderAlive: true }] });
  check('delay-scored-next-day', classifyNextDay(c, [], J).cls === 'delay-scored-next-day');
  // 2. delay-launched-next-day.
  c = synthCorpus({ v4departs: [{ day: 11, vid: 'v1', result: 'launch' }],
    planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  check('delay-launched-next-day', classifyNextDay(c, [], J).cls === 'delay-launched-next-day');
  // 3. scored beats launch (frozen order: scored first).
  c = synthCorpus({ muster: [{ day: 11, part: 0, vid: 'v1', askKind: 'party_wait' }],
    v4departs: [{ day: 11, vid: 'v1', result: 'launch' }] });
  check('scored-beats-launch', classifyNextDay(c, [], J).cls === 'delay-scored-next-day');
  // 4. wall-early-return-again.
  c = synthCorpus({ planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  let ns = [{ day: 11, vid: 'v1', cause: 'never-asked:pick-early-return', detail: 'EAT@p2' }];
  check('wall-early-return-again', classifyNextDay(c, ns, J).cls === 'wall-early-return-again');
  // 5. wall-other-dawn-cause (scholar succession on D+1).
  ns = [{ day: 11, vid: 'v1', cause: 'never-asked:holder-scholar-at-dawn', detail: 'scholar' }];
  check('wall-other-dawn-cause', classifyNextDay(c, ns, J).cls === 'wall-other-dawn-cause');
  // 6. wall-holder-dead.
  c = synthCorpus({ deaths: [{ day: 11, who: 'v1', kind: 'villager', cause: 'the wild' }] });
  check('wall-holder-dead', classifyNextDay(c, [], J).cls === 'wall-holder-dead');
  // 7. wall-plan-gone (alive, no plan row on D+1).
  c = synthCorpus({ planCensus: [{ day: 10, vid: 'v1', needWave: 4, holderAlive: true }] });
  check('wall-plan-gone', classifyNextDay(c, [], J).cls === 'wall-plan-gone');
  // 8. wall-village-lost (plan row present, village lost on D+1).
  c = synthCorpus({ days: 11, endReason: 'village-lost', villageLost: true,
    planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  check('wall-village-lost', classifyNextDay(c, [], J).cls === 'wall-village-lost');
  // 9. unclassified (alive, plan held, no muster, no launch, no dawn cause).
  c = synthCorpus({ planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  check('unclassified', classifyNextDay(c, [], J).cls === 'unclassified');
  // 10. dawn cause that is not a dawn cause -> unclassified, never guessed.
  ns = [{ day: 11, vid: 'v1', cause: 'pool-empty:away', detail: 'x' }];
  check('non-dawn-cause-unclassified', classifyNextDay(c, ns, J).cls === 'unclassified');
  // 11. firstScoredWithin secondary.
  c = synthCorpus({ muster: [{ day: 13, part: 0, vid: 'v1', askKind: 'party_wait' }] });
  check('firstScoredWithin3d', firstScoredWithin(c, 'v1', 11, 13) === 13);
  check('firstScoredWithin3d-none', firstScoredWithin(c, 'v1', 11, 12) === null);
  // 12. Amendment 1: EOD holder-not-scored label with a dawn cause
  // underneath (away on guard at dawn) -> wall-other-dawn-cause,
  // EOD label recorded alongside.
  c = synthCorpus({ dawnState: [{ day: 11, vid: 'v1', scholarId: 's1', isScholar: false,
    onRoster: true, personExists: true, engaged: false, away: true,
    awayEntry: { purpose: 'guard', sinceDay: 11 }, onExped: false,
    node: { nx: 5, ny: 3 }, objective: { kind: 'GUARD', state: 'out', partsLeft: 2 } }],
    planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  ns = [{ day: 11, vid: 'v1', cause: 'never-asked:holder-not-scored', subcause: 'holder-not-at-haven', detail: 'x' }];
  let rA = classifyNextDay(c, ns, J);
  check('amend1-eod-underneath-away', rA.cls === 'wall-other-dawn-cause' && rA.proof && rA.proof.eodCause === 'never-asked:holder-not-scored', JSON.stringify(rA));
  // 13. Amendment 1: EOD label with NO dawn cause underneath stays
  // unclassified (at Haven, objective stale, no pick ran).
  c = synthCorpus({ dawnState: [{ day: 11, vid: 'v1', scholarId: 's1', isScholar: false,
    onRoster: true, personExists: true, engaged: false, away: false,
    awayEntry: null, onExped: false, node: { nx: 4, ny: 4 },
    objective: { kind: null, state: 'done', partsLeft: 0 } }],
    companionPool: [{ haven: { nx: 4, ny: 4 } }],
    planCensus: [{ day: 11, vid: 'v1', needWave: 4, holderAlive: true }] });
  check('amend1-eod-underneath-none', classifyNextDay(c, ns, J).cls === 'unclassified');
  // 14. judged set shape: 14 rows, all EAT/SEEK kinds, max day 144.
  check('judged-set-14', JUDGED_14.length === 14);
  check('judged-set-max-day', Math.max.apply(null, JUDGED_14.map(function (j) { return j.day; })) === 144);
  check('judged-set-kinds', JUDGED_14.every(function (j) { return j.kinds.every(function (k) { return k.indexOf('EAT@') === 0 || k.indexOf('SEEK@') === 0; }); }));
  console.log('launchdiag-a selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  let dir = path.join(REPO, 'evidence', '2026-11-23', 'perseed-musterask-a-ctl');
  let frozen = path.join(REPO, 'evidence', '2026-11-23', 'musterask-a-analysis.json');
  let out = null;
  const di = args.indexOf('--dir'); if (di !== -1 && args[di + 1]) dir = args[di + 1];
  const fi = args.indexOf('--frozen'); if (fi !== -1 && args[fi + 1]) frozen = args[fi + 1];
  const oi = args.indexOf('--out'); if (oi !== -1 && args[oi + 1]) out = args[oi + 1];
  const result = analyzeDir(dir, frozen);
  const text = JSON.stringify(result, null, 2) + '\n';
  if (out) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, text); }
  console.log(JSON.stringify({
    judgedSet: result.judgedSet, delay: result.delay, wall: result.wall,
    unclassified: result.unclassified, classCounts: result.classCounts,
    crossCheckSeeds: result.crossCheck.seedsCompared,
    neverScoredMatch: result.crossCheck.neverScoredMatch,
    neverScoredMismatch: result.crossCheck.neverScoredMismatch,
    wallMatch: result.crossCheck.wallMatch,
    wallNumbers: result.wallNumbers, instrumentErrors: result.instrumentErrors,
    out: out ? path.relative(REPO, out) : null,
  }, null, 2));
}

if (require.main === module) main();
module.exports = { analyzeDir: analyzeDir, classifyNextDay: classifyNextDay,
  firstScoredWithin: firstScoredWithin, selftest: selftest, JUDGED_14: JUDGED_14 };
