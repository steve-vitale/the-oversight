// test-seasoning-g1-b.js — proof for arm sim-seasoning-g1-b (RE-JUDGMENT).
// Proves, on synthetic fixtures and the committed corpora (no new sims):
// the phase-corrected classifier (metric-review items 1–3 + 5 of
// sim-seasoning-b.md) — qualification-day precursor, two-snapshot
// unknown, daysLost measured to the qualification day, decisive flip
// window on the qualification day, raw-standing wall read — plus a
// determinism leg (corrected analysis re-run byte-identical) and the
// frozen-instrument preservation checks (frozen exports keep frozen
// semantics; frozen CLI output stays byte-identical to
// seasoning-b-analysis.json; the 900-line LINK_LINES_CAP is untouched
// and precursor status never depends on the capped channel alone).
// Synthetic fixtures stage no gear claim: they prove day-classification
// logic only (ENCOUNTER-GEAR rule — the analyzer re-reads the policies'
// own play; nothing is staged).
// Usage:
//   node scripts/test-seasoning-g1-b.js
// Git checks use read-only plumbing only (ls-tree / hash-object /
// merge-base / diff): the write flap blocks index.lock creation, so
// anything needing the index is SKIPPED, never faked green.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-seasoning-b.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'onlylead-driver-20261115.js'));

let pass = 0, fail = 0, skipped = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, detail) {
  skipped++; console.log('  SKIP: ' + name + (detail ? ' — ' + detail : ''));
}
function gitOut(args) {
  try { return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', timeout: 60000 }).toString(); }
  catch (e) { return null; }
}

// ---------- 1. Static: corrected exports exist, frozen preserved ---------- //
console.log('== static: corrected classifier + frozen preservation ==');
check('analyzer exports the corrected classifier (classifySeasoningDayCorrected + analyzeSeasoningCorrected + analyzeCorrected)',
  typeof ANALYZE.classifySeasoningDayCorrected === 'function' && typeof ANALYZE.analyzeSeasoningCorrected === 'function' &&
  typeof ANALYZE.analyzeCorrected === 'function');
check('analyzer still exports the frozen classifier (classifySeasoningDay + analyzeSeasoning + analyze)',
  typeof ANALYZE.classifySeasoningDay === 'function' && typeof ANALYZE.analyzeSeasoning === 'function' &&
  typeof ANALYZE.analyze === 'function');
// Frozen semantics preserved: a qualified-unstaged snapshot is STILL
// 'unclassified' under the frozen classifier (the correction lives in
// the new exports only — the frozen proof's numbers cannot drift).
(function () {
  const sn = {
    d: 50, rungMet: true, pendingNational: null, nationalLive: false,
    scaleRefused: false, exiled: false,
    shapeCands: { lead: null, conquest: null, belong: null, covenant: { shape: 'covenant', size: 4 }, trade: null },
    road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 3, nCovSeas: 3, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
    linksRoll: [],
  };
  const frozen = ANALYZE.classifySeasoningDay(sn, false);
  check('frozen classifier still calls a qualified-unstaged day unclassified (correction is additive)',
    frozen.cls === 'unclassified' && frozen.gate === 'qualified-unstaged', JSON.stringify(frozen));
  const corrected = ANALYZE.classifySeasoningDayCorrected(sn, false, { stagingFollows: function () { return true; }, prevShouldStage: false });
  check('corrected classifier calls the same day staged-precursor when staging follows within one boundary',
    corrected.cls === 'staged-precursor' && corrected.gate === 'precursor:qualified-unstaged', JSON.stringify(corrected));
})();
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'onlylead-driver-20261115.js'), 'utf8');
check('LINK_LINES_CAP left at 900 (item 4: cap NOT raised on the shared harness)',
  driverSrc.indexOf('const LINK_LINES_CAP = 900;') !== -1);
check('driver exports LINK_LINES_CAP (the cap is observable, not hidden)',
  DRIVER.LINK_LINES_CAP === 900);
// Zero src/js changes: worktree files vs HEAD blobs, read-only plumbing.
const lsTree = gitOut(['ls-tree', '-r', 'HEAD', '--', 'src']);
if (lsTree === null) {
  skip('worktree src/ matches HEAD blobs (git plumbing unavailable)', 're-check after flap clears');
} else {
  const entries = lsTree.split('\n').filter(Boolean).map(function (line) {
    const m = line.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/);
    return m ? { blob: m[1], file: m[2] } : null;
  }).filter(Boolean);
  let hashOut = null;
  try {
    hashOut = execFileSync('git', ['hash-object'].concat(entries.map(function (e) { return e.file; })),
      { cwd: REPO, encoding: 'utf8', timeout: 60000 }).toString().split('\n').filter(Boolean);
  } catch (e) { hashOut = null; }
  if (hashOut === null || hashOut.length !== entries.length) {
    skip('worktree src/ matches HEAD blobs (hash-object unavailable)', 're-check after flap clears');
  } else {
    const diffs = entries.filter(function (e, i) { return hashOut[i] !== e.blob; }).map(function (e) { return e.file; });
    check('zero src/js changes in the worktree (' + entries.length + ' files hashed, ' + diffs.length + ' differ)', diffs.length === 0, JSON.stringify(diffs.slice(0, 5)));
  }
}
const fork = gitOut(['merge-base', 'HEAD', 'master']);
if (fork === null) {
  skip('branch commits touch no src/js (merge-base unavailable)', 're-check after flap clears');
} else {
  const names = gitOut(['diff', '--name-only', fork.trim(), 'HEAD', '--', 'src']);
  if (names === null) skip('branch commits touch no src/js (diff unavailable)', 're-check after flap clears');
  else check('branch commits touch no src/js (fork ' + fork.trim().slice(0, 12) + ')', names.trim() === '', names.trim().slice(0, 200));
}

// ---------- 2. classifySeasoningDayCorrected fixtures ---------- //
console.log('== classifySeasoningDayCorrected fixtures ==');
function sn(o) {
  const base = {
    d: 50, rungMet: true, pendingNational: null, nationalLive: false,
    scaleRefused: false, exiled: false,
    shapeCands: { lead: null, conquest: null, belong: null, covenant: { shape: 'covenant', size: 4 }, trade: null },
    road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 3, nCovSeas: 3, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
    linksRoll: [],
  };
  if (!o) return base;
  for (const k of Object.keys(o)) {
    if (k === 'shapeCands' || k === 'road') Object.assign(base[k], o[k]);
    else base[k] = o[k];
  }
  return base;
}
function ctx(o) {
  return { stagingFollows: (o && o.follows) || function () { return false; }, prevShouldStage: !!(o && o.prev) };
}
(function () {
  const got = ANALYZE.classifySeasoningDayCorrected(sn(), false, ctx({ follows: function () { return true; } }));
  check('qualified day + staging follows within one boundary -> staged-precursor',
    got.cls === 'staged-precursor' && got.gate === 'precursor:qualified-unstaged', JSON.stringify(got));
})();
(function () {
  const got = ANALYZE.classifySeasoningDayCorrected(sn(), false, ctx({ prev: true }));
  check('qualified day + previous day also qualified, no staging follows -> unknown (survived a boundary)',
    got.cls === 'unknown' && got.gate === 'survived-boundary:qualified-unstaged', JSON.stringify(got));
})();
(function () {
  const got = ANALYZE.classifySeasoningDayCorrected(sn(), false, ctx());
  check('qualified day, no staging follows, no previous qualified day -> qualified-first (not counted)',
    got.cls === 'qualified-first' && got.gate === 'qualified-first:qualified-unstaged', JSON.stringify(got));
})();
(function () {
  const mismatch = sn({ shapeCands: { covenant: null }, road: { nCovFormed: 3, nCovSeas: 3 } });
  const got = ANALYZE.classifySeasoningDayCorrected(mismatch, false, ctx({ follows: function () { return true; } }));
  check('seas-count-mismatch day + staging follows -> staged-precursor (same rule, other gate)',
    got.cls === 'staged-precursor' && got.gate === 'precursor:seas-count-mismatch', JSON.stringify(got));
  const got2 = ANALYZE.classifySeasoningDayCorrected(mismatch, false, ctx({ prev: true }));
  check('seas-count-mismatch day + previous should-stage day, no staging -> unknown',
    got2.cls === 'unknown' && got2.gate === 'survived-boundary:seas-count-mismatch', JSON.stringify(got2));
})();
(function () {
  // Non-should-stage days pass through the frozen classification
  // unchanged — the correction touches nothing else.
  const blocked = sn({ shapeCands: { covenant: null }, road: { nCovFormed: 3, nCovSeas: 2 }, linksRoll: [
    { id: 'l1', o: 'Stonebridge', k: 'covenant', st: 'active', t: 45, f: 10, age: 40, se: 1 },
    { id: 'l2', o: 'Thornfield', k: 'covenant', st: 'active', t: 45, f: 10, age: 40, se: 1 },
    { id: 'l3', o: 'Ashford', k: 'covenant', st: 'active', t: 30, f: 10, age: 40, se: 0 },
  ] });
  const got = ANALYZE.classifySeasoningDayCorrected(blocked, false, ctx({ follows: function () { return true; }, prev: true }));
  check('seasoning-blocked day passes through unchanged even with staging-follows/prev context',
    got.cls === 'seasoning-blocked' && got.gate === 'seasoned-short:2-of-3', JSON.stringify(got));
  const staged = ANALYZE.classifySeasoningDayCorrected(sn({ pendingNational: { shape: 'covenant' } }), false, ctx());
  check('staged day passes through unchanged', staged.cls === 'staged' && staged.gate === null, JSON.stringify(staged));
})();

// ---------- 3. analyzeSeasoningCorrected fixtures ---------- //
console.log('== analyzeSeasoningCorrected fixtures ==');
function linkRow(day, id, other, trust, formed, se) {
  return { id: id, o: other, k: 'covenant', st: 'active', t: trust, f: formed, age: day - formed, se: se ? 1 : 0 };
}
function fakeSeries(spec) {
  // NOTE (fixture modeling, corrected during proof): the covenant
  // candidate must go null when fewer than 3 links are seasoned —
  // _covenantPolity returns null then, so the engine's own candidate
  // roll never shows a candidate over unseasoned links. Use candTo to
  // end the candidate when seasoning lapses; leaving it present
  // builds an unphysical record (candidate over unseasoned links) and
  // the corrected classifier rightly calls those days unknown.
  const out = [];
  for (let d = spec.days[0]; d <= spec.days[1]; d++) {
    const links = (spec.links || []).filter(function (L) { return d >= L.formed; }).map(function (L) {
      return linkRow(d, L.id, L.other, L.trustAt(d), L.formed, L.seAt(d));
    });
    const nCovSeas = links.filter(function (l) { return l.se; }).length;
    out.push({
      d: d, rungMet: d >= (spec.rungFrom || 0), pendingNational: (spec.pendingDay === d) ? { shape: 'covenant' } : null,
      nationalLive: spec.nationalLiveFrom !== undefined && d >= spec.nationalLiveFrom,
      scaleRefused: false, exiled: false,
      shapeCands: { lead: null, conquest: null, belong: null, covenant: (spec.candFrom !== undefined && d >= spec.candFrom && (spec.candTo === undefined || d <= spec.candTo)) ? { shape: 'covenant', size: 4 } : null, trade: null },
      road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: links.length, nCovSeas: nCovSeas, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
      linksRoll: links, scale: (spec.nationalLiveFrom !== undefined && d >= spec.nationalLiveFrom) ? 'national' : 'regional',
    });
  }
  return out;
}
// Fixture P: the corpus mirror — links season d50, candidate present
// d50, staging line d50, answer d51. Frozen reads d50 unclassified,
// stagedDay d51, daysLost 21, decisive null. Corrected reads d50 as
// the qualification day: daysLost 20, decisive Ashford d50.
(function () {
  const rec = {
    seed: 101, policy: 'fixture-p', endReason: 'survived',
    series: fakeSeries({
      days: [1, 60], rungFrom: 30, candFrom: 50, nationalLiveFrom: 51,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 20, trustAt: function (d) { return d >= 50 ? 40 : 30; }, seAt: function (d) { return d >= 50; } },
      ],
    }),
    verbEvents: [{ day: 51, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }],
    linkLines: [{ day: 50, line: '📓 Codex: National beat staged: covenant (4 villages).' }],
  };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('P staged: verdict staged, qualDay d50 (precursor), answerDay d51, firstOpp d30',
    r.verdict === 'staged' && r.qualificationDay === 50 && r.qualificationSource === 'precursor' &&
    r.answerDay === 51 && r.firstOpportunityDay === 30,
    JSON.stringify({ verdict: r.verdict, qualDay: r.qualificationDay, source: r.qualificationSource, answerDay: r.answerDay, firstOpp: r.firstOpportunityDay }));
  check('P daysLost corrected 20, frozen 21 (the qualification day is no longer counted lost)',
    r.daysLost === 20 && r.daysLostFrozen === 21, JSON.stringify({ corrected: r.daysLost, frozen: r.daysLostFrozen }));
  check('P decisive is Ashford, seasoning day d50 (corrected flip window); frozen decisive null (off-by-one)',
    r.decisive && r.decisive.other === 'Ashford' && r.decisive.seasonedDay === 50 && r.decisiveFrozen === null,
    JSON.stringify({ corrected: r.decisive, frozen: r.decisiveFrozen }));
  check('P precursorDays [50], unknown 0, blockedDays 20 unchanged',
    JSON.stringify(r.precursorDays) === '[50]' && r.unknown === 0 && r.unclassifiedDays === 0 && r.seasoningBlockedDays === 20,
    JSON.stringify({ precursors: r.precursorDays, unknown: r.unknown, blocked: r.seasoningBlockedDays }));
})();
// Fixture A: pending snapshot ON the staging day (no separate
// qualification snapshot) — answer-fallback; daysLost equals frozen.
(function () {
  const rec = {
    seed: 102, policy: 'fixture-a', endReason: 'survived',
    series: fakeSeries({
      days: [1, 60], rungFrom: 30, candFrom: 50, pendingDay: 50, nationalLiveFrom: 51,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 20, trustAt: function (d) { return d >= 50 ? 40 : 30; }, seAt: function (d) { return d >= 50; } },
      ],
    }),
    verbEvents: [{ day: 51, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }],
    linkLines: [],
  };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('A answer-fallback: qualDay d50 = answerDay d50, source answer-fallback, precursorDays []',
    r.qualificationDay === 50 && r.answerDay === 50 && r.qualificationSource === 'answer-fallback' && r.precursorDays.length === 0,
    JSON.stringify({ qualDay: r.qualificationDay, answerDay: r.answerDay, source: r.qualificationSource, precursors: r.precursorDays }));
  check('A daysLost corrected 20 = frozen 20 (no phase shift when staging is same-day visible)',
    r.daysLost === 20 && r.daysLostFrozen === 20, JSON.stringify({ corrected: r.daysLost, frozen: r.daysLostFrozen }));
  check('A decisive null under corrected (fallback) while frozen decisive is Ashford d50',
    r.decisive === null && r.decisiveFrozen && r.decisiveFrozen.other === 'Ashford' && r.decisiveFrozen.seasonedDay === 50,
    JSON.stringify({ corrected: r.decisive, frozen: r.decisiveFrozen }));
  check('A unknown 0', r.unknown === 0);
})();
// Fixture F: qualified d50–d100, never staged (the frozen test's
// fixture F) — a genuine mystery survives the correction.
(function () {
  const rec = {
    seed: 103, policy: 'fixture-f', endReason: 'survived',
    series: fakeSeries({
      days: [1, 100], rungFrom: 30, candFrom: 50,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
      ],
    }),
    verbEvents: [], linkLines: [],
  };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('F qualified-never-staged: verdict unknown, unknown 1 (correction does not whitewash a real mystery)',
    r.verdict === 'unknown' && r.unknown === 1, JSON.stringify({ verdict: r.verdict, unknown: r.unknown }));
  check('F corrected unclassifiedDays 60 (d40 qualified-first, d41–d100 survived boundaries); frozen 61',
    r.unclassifiedDays === 60 && r.unclassifiedDaysFrozen === 61 && JSON.stringify(r.qualifiedFirstDays) === '[40]',
    JSON.stringify({ corrected: r.unclassifiedDays, frozen: r.unclassifiedDaysFrozen, firsts: r.qualifiedFirstDays }));
  check('F precursorDays []', r.precursorDays.length === 0);
})();
// Fixture U: exactly two consecutive qualified days, then the
// qualification lapses (trust drops) — one unknown day, no more.
(function () {
  const rec = {
    seed: 104, policy: 'fixture-u', endReason: 'survived',
    series: fakeSeries({
      days: [1, 80], rungFrom: 30, candFrom: 50, candTo: 51,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 50; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 50; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function (d) { return d >= 52 ? 30 : 45; }, seAt: function (d) { return d >= 50 && d < 52; } },
      ],
    }),
    verbEvents: [], linkLines: [],
  };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('U two-snapshot run then lapse: unknownDays [51] only, qualifiedFirstDays [50], verdict unknown',
    JSON.stringify(r.unclassifiedList) === '[51]' && JSON.stringify(r.qualifiedFirstDays) === '[50]' && r.verdict === 'unknown' && r.unknown === 1,
    JSON.stringify({ unknownDays: r.unclassifiedList, firsts: r.qualifiedFirstDays, verdict: r.verdict }));
  check('U daysLost censored 51 (d30–d80), firstOpp d30',
    r.daysLost === 51 && r.censored === true && r.firstOpportunityDay === 30,
    JSON.stringify({ daysLost: r.daysLost, censored: r.censored, firstOpp: r.firstOpportunityDay }));
})();
// Fixture L: staging line only, no answer event (record truncated) —
// the line proves the staging at the boundary; the qualification then
// lapses. Precursor via the capped channel as supporting evidence,
// verdict recomputed from unknown to seasoning-blocked.
(function () {
  const rec = {
    seed: 105, policy: 'fixture-l', endReason: 'survived',
    series: fakeSeries({
      days: [1, 60], rungFrom: 30, candFrom: 50, candTo: 50,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 20, trustAt: function (d) { return d >= 51 ? 30 : (d >= 50 ? 40 : 30); }, seAt: function (d) { return d === 50; } },
      ],
    }),
    verbEvents: [],
    linkLines: [{ day: 50, line: '📓 Codex: National beat staged: covenant (4 villages).' }],
  };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('L line-only precursor: precursorDays [50], unknown 0, verdict seasoning-blocked (frozen verdict unknown)',
    JSON.stringify(r.precursorDays) === '[50]' && r.unknown === 0 && r.verdict === 'seasoning-blocked' && r.verdictFrozen === 'unknown',
    JSON.stringify({ precursors: r.precursorDays, unknown: r.unknown, verdict: r.verdict, verdictFrozen: r.verdictFrozen }));
  check('L daysLost censored 31 (never staged, firstOpp d30)',
    r.daysLost === 31 && r.censored === true, JSON.stringify({ daysLost: r.daysLost, censored: r.censored }));
})();
// Fixture G: staged after a lead shadow lifts — no false precursor
// while shadowed; fallback qualification, daysLost unchanged.
(function () {
  const series = fakeSeries({
    days: [1, 60], rungFrom: 30, candFrom: 40, pendingDay: 46, nationalLiveFrom: 47,
    links: [
      { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
      { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
      { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
    ],
  });
  for (const s of series) {
    if (s.d >= 40 && s.d <= 45) s.shapeCands.lead = { shape: 'lead', size: 4 };
  }
  const rec = { seed: 106, policy: 'fixture-g', endReason: 'survived', series: series,
    verbEvents: [{ day: 47, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }], linkLines: [] };
  const r = ANALYZE.analyzeSeasoningCorrected(rec);
  check('G staged-after-shadow: verdict staged, qualDay d46 (fallback), daysLost 16 = frozen 16, precursorDays []',
    r.verdict === 'staged' && r.qualificationDay === 46 && r.qualificationSource === 'answer-fallback' &&
    r.daysLost === 16 && r.daysLostFrozen === 16 && r.precursorDays.length === 0,
    JSON.stringify({ verdict: r.verdict, qualDay: r.qualificationDay, source: r.qualificationSource, daysLost: r.daysLost, frozen: r.daysLostFrozen, precursors: r.precursorDays }));
  check('G decisive null both (seasoning met before the stage)',
    r.decisive === null && r.decisiveFrozen === null, JSON.stringify({ corrected: r.decisive, frozen: r.decisiveFrozen }));
  check('G unknown 0', r.unknown === 0);
})();

// ---------- 4. Wall raw-standing read (item 5) ---------- //
console.log('== wall raw-standing read ==');
function minSnap(d) {
  return {
    d: d, rungMet: false, pendingNational: null, nationalLive: false,
    scaleRefused: false, exiled: false, scale: 'regional',
    shapeCands: { lead: null, conquest: null, belong: null, covenant: null, trade: null },
    road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
    linksRoll: [],
  };
}
(function () {
  const series = [];
  for (let d = 1; d <= 10; d++) series.push(minSnap(d));
  function wallRec(seed, standing, standingRaw) {
    return {
      seed: seed, policy: 'wall-a', endReason: 'survived', series: series,
      verbEvents: [], linkLines: [], standing: standing, standingRaw: standingRaw,
      scaleRank: 'regional', won: false, tableState: {}, maxWave: 4, waveKills: { '4': 1 },
      gameDays: 10, deaths: [],
    };
  }
  const out = ANALYZE.analyzeCorrected([wallRec(901, 199, 250), wallRec(902, 150, 150)]);
  const w = out.wall['wall-a'];
  check('wall raw read: nationalStandingRaw200 counts the capped 250 (1/2) while gated standing counts 0/2',
    w && w.nationalStandingRaw200 === 1 && w.nationalStanding200 === 0,
    JSON.stringify(w));
  check('wall keeps the scaleRank read alongside (0/2 national)',
    w && w.nationalScaleRank === 0, JSON.stringify(w));
})();

// ---------- 5. Determinism leg (corpora, no new sims) ---------- //
console.log('== determinism leg (committed corpora) ==');
const controlDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-control');
const onDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-on');
const corpusFiles = [];
for (const dir of [controlDir, onDir]) {
  if (!fs.existsSync(dir)) { check('corpus dir exists: ' + path.relative(REPO, dir), false, 'missing'); continue; }
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.slice(-5) === '.json'; }).sort()) corpusFiles.push(path.join(dir, f));
}
check('corpus is 16/16 files (8 seeds x 2 policies)', corpusFiles.length === 16, 'found ' + corpusFiles.length);
const corpusRecords = corpusFiles.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
check('every record parses with a full series and 0 instrument errors',
  corpusRecords.every(function (r) { return (r.series || []).length > 0 && (r.instrumentErrors || []).length === 0; }));
(function () {
  const a1 = ANALYZE.analyzeCorrected(corpusRecords);
  const a2 = ANALYZE.analyzeCorrected(corpusRecords);
  check('determinism: corrected analysis twice on the same corpora -> identical output',
    JSON.stringify(a1) === JSON.stringify(a2));
  const frozenJson = JSON.stringify(ANALYZE.analyze(corpusRecords), null, 2) + '\n';
  const committed = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'seasoning-b-analysis.json'), 'utf8');
  check('frozen preservation: frozen analysis re-run is byte-identical to the committed seasoning-b-analysis.json',
    frozenJson === committed, 'lengths ' + frozenJson.length + ' vs ' + committed.length);
})();
(function () {
  // CLI determinism: --corrected twice to temp files -> byte-identical.
  const t1 = '/tmp/g1b-det1.json', t2 = '/tmp/g1b-det2.json';
  try {
    execFileSync('node', [path.join(REPO, 'scripts', 'analyze-seasoning-b.js'), '--corrected', controlDir, onDir, t1], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    execFileSync('node', [path.join(REPO, 'scripts', 'analyze-seasoning-b.js'), '--corrected', controlDir, onDir, t2], { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    const b1 = fs.readFileSync(t1, 'utf8'), b2 = fs.readFileSync(t2, 'utf8');
    check('determinism: corrected CLI twice -> byte-identical analysis files', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);
    const committed = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-16', 'seasoning-g1-b-analysis.json'), 'utf8');
    check('determinism: corrected CLI output is byte-identical to the committed seasoning-g1-b-analysis.json',
      b1 === committed, 'lengths ' + b1.length + ' vs ' + committed.length);
  } catch (e) {
    check('determinism: corrected CLI twice -> byte-identical analysis files', false, String((e && e.message) || e).slice(0, 120));
  }
})();

// ---------- 6. Corpus re-judgment (corrected G1) ---------- //
console.log('== corpus re-judgment (corrected G1) ==');
(function () {
  const out = ANALYZE.analyzeCorrected(corpusRecords);
  check('G1 corrected: unknown 0 band-wide',
    out.unknown === 0, 'unknown=' + out.unknown);
  check('G1 corrected: 0 unknown days band-wide (9 precursor days, 0 unclassified)',
    out.band.unknownDaysTotal === 0 && out.band.precursorDaysTotal === 9,
    'unknownDays=' + out.band.unknownDaysTotal + ' precursorDays=' + out.band.precursorDaysTotal);
  check('G1 corrected: every seed carries a known verdict (staged / seasoning-blocked / other-blocked)',
    Object.keys(out.perSeed).every(function (k) { return ['staged', 'seasoning-blocked', 'other-blocked'].indexOf(out.perSeed[k].verdict) !== -1; }));
  check('G1 corrected: frozen numbers reproduced alongside (band unknown=4, unclassifiedDays=9)',
    Object.keys(out.perSeed).reduce(function (t, k) { return t + out.perSeed[k].unclassifiedDaysFrozen; }, 0) === 9 &&
    Object.keys(out.perSeed).reduce(function (t, k) { return t + out.perSeed[k].unknownFrozen; }, 0) === 4,
    'frozen unclassifiedDays total / unknown total from per-seed records');
  const court = function (seed) { return out.perSeed[seed + '-competent-courtship-b']; };
  const expDaysLost = { 102201: 0, 102202: 11, 102203: 1, 102204: 0, 102205: 0, 102206: 0, 102207: 17, 102208: 30 };
  const expFirstOpp = { 102201: 61, 102202: 61, 102203: 72, 102204: 63, 102205: 66, 102206: 64, 102207: 61, 102208: 62 };
  const expQual = { 102201: 61, 102202: 72, 102203: 73, 102204: 63, 102205: 66, 102206: 64, 102207: 78, 102208: 92 };
  const expDecisive = { 102201: null, 102202: 'village_spl_26_60773', 102203: 'village_1', 102204: null, 102205: null, 102206: null, 102207: 'village_spl_38_6557', 102208: 'village_spl_31_32776' };
  check('courtship corrected daysLost [0,11,1,0,0,0,17,30] (frozen [0,12,2,0,0,0,18,31])',
    Object.keys(expDaysLost).every(function (s) { return court(s).daysLost === expDaysLost[s] && court(s).daysLostFrozen === expDaysLost[s] + (expDaysLost[s] > 0 && (s === '102202' || s === '102203' || s === '102207' || s === '102208') ? 1 : 0); }),
    JSON.stringify(Object.keys(expDaysLost).map(function (s) { return s + ':' + court(s).daysLost + '/' + court(s).daysLostFrozen; })));
  check('courtship corrected firstOpportunityDay [61,61,72,63,66,64,61,62]',
    Object.keys(expFirstOpp).every(function (s) { return court(s).firstOpportunityDay === expFirstOpp[s]; }),
    JSON.stringify(Object.keys(expFirstOpp).map(function (s) { return s + ':' + court(s).firstOpportunityDay; })));
  check('courtship qualificationDay [61,72,73,63,66,64,78,92], all precursor-sourced',
    Object.keys(expQual).every(function (s) { return court(s).qualificationDay === expQual[s] && court(s).qualificationSource === 'precursor'; }),
    JSON.stringify(Object.keys(expQual).map(function (s) { return s + ':' + court(s).qualificationDay + '/' + court(s).qualificationSource; })));
  check('courtship decisive: non-null exactly on the four link-seasoning seeds, null-by-design on the four rung seeds',
    Object.keys(expDecisive).every(function (s) {
      const d = court(s).decisive;
      return expDecisive[s] === null ? d === null : (d && d.other === expDecisive[s]);
    }),
    JSON.stringify(Object.keys(expDecisive).map(function (s) { return s + ':' + JSON.stringify(court(s).decisive); })));
  check('courtship frozen decisive null on all 8 (the off-by-one the correction fixes)',
    Object.keys(expDaysLost).every(function (s) { return court(s).decisiveFrozen === null; }));
  check('re-stage precursor: 102207 d142 (answer d143), the only post-first-staging precursor; its council line cut by the cap',
    JSON.stringify(court(102207).reStagePrecursors) === '[142]' &&
    Object.keys(expDaysLost).every(function (s) { return s === '102207' ? true : court(s).reStagePrecursors.length === 0; }),
    JSON.stringify(Object.keys(expDaysLost).map(function (s) { return s + ':' + JSON.stringify(court(s).reStagePrecursors); })));
  const cov = function (seed) { return out.perSeed[seed + '-competent-covenant-b']; };
  check('covenant 102204: seasoning-blocked, 44 blocked days, 44 censored days-lost, unchanged by the correction',
    cov(102204).verdict === 'seasoning-blocked' && cov(102204).seasoningBlockedDays === 44 && cov(102204).daysLost === 44 && cov(102204).censored === true &&
    cov(102204).daysLostFrozen === 44,
    JSON.stringify({ verdict: cov(102204).verdict, blocked: cov(102204).seasoningBlockedDays, daysLost: cov(102204).daysLost }));
  check('seasoning-blocked share unchanged: 1/8 (12.5%) band-wide under corrected verdicts',
    out.band.seasoningShareOfNonStages === 0.125, 'share=' + out.band.seasoningShareOfNonStages);
  check('wall raw read: covenant 6/8, courtship 7/8 (gated 2/8, 0/8; scaleRank 0/8, 7/8)',
    out.wall['competent-covenant-b'].nationalStandingRaw200 === 6 && out.wall['competent-courtship-b'].nationalStandingRaw200 === 7 &&
    out.wall['competent-covenant-b'].nationalStanding200 === 2 && out.wall['competent-courtship-b'].nationalStanding200 === 0 &&
    out.wall['competent-covenant-b'].nationalScaleRank === 0 && out.wall['competent-courtship-b'].nationalScaleRank === 7,
    JSON.stringify(out.wall));
  check('median daysLost (staged, corrected) 0.5d (frozen 1d)',
    out.byPolicy['competent-courtship-b'].medianDaysLostStaged === 0.5 && out.byPolicy['competent-courtship-b'].medianDaysLostStagedFrozen === 1,
    JSON.stringify({ corrected: out.byPolicy['competent-courtship-b'].medianDaysLostStaged, frozen: out.byPolicy['competent-courtship-b'].medianDaysLostStagedFrozen }));
  check('D3 engine-agreement unchanged: blocked 150/150 candidate-null, staged 11/11 candidate-seen, 0 misses',
    out.d3.blockedCandidateNull === 150 && out.d3.blockedDays === 150 && out.d3.stagedCandidateSeen === 11 && out.d3.stagedDays === 11 && out.d3.misses.length === 0,
    JSON.stringify(out.d3));
})();

console.log('test-seasoning-g1-b: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped (git unavailable)' : ''));
if (fail) { console.log('FAILURES:\n' + failures.join('\n')); process.exitCode = 1; }
