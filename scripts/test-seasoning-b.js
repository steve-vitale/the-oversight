// test-seasoning-b.js — proof for arm sim-seasoning-b (DIAG).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the seasoning definition anchors hold where the prereg
// says they do (hierarchy.js _linkSeasoned / _covenantPolity /
// _checkNational), the driver carries the seasoning-b dirFor branch
// WITHOUT touching the re-confirm mapping, classifySeasoningDay
// places one fixture per gate (staged, seasoning-blocked age-only /
// trust-only / both / multi, rung, shadow, pending, national-live,
// scale-refused, exiled, formed-short, qualified-unstaged),
// analyzeSeasoning computes verdicts + days-lost + decisive blockers
// on synthetic records (staged-after-wait, never-staged censored,
// never-staged other, rung, multi, unknown, staged-after-shadow),
// the analyzer is pure (D2: analyze twice identical, frozen input
// unmutated), determinism D1 (same seed twice, identical corpus),
// and — in --corpus mode, after the sweep — classification
// completeness on the real corpus (16/16 valid, unknown 0) plus D3
// engine-agreement (every blocked day candidate-null, every staged
// day candidate-seen).
// Usage:
//   node scripts/test-seasoning-b.js            (fixtures + D1 + D2)
//   node scripts/test-seasoning-b.js --corpus   (adds the corpus + D3 checks)
// Git checks use read-only plumbing only (ls-tree / hash-object /
// merge-base / log): the write flap blocks index.lock creation, so
// anything needing the index is SKIPPED, never faked green.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = process.argv.indexOf('--corpus') !== -1;
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

// ---------- 1. Static: seasoning anchors in code ---------- //
console.log('== static: seasoning anchors ==');
const hierJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'hierarchy.js'), 'utf8');
check('seasoned = 30+ days old (hierarchy.js _linkSeasoned)',
  hierJs.indexOf('_linkSeasoned(link, forConquest, forPolity)') !== -1 &&
  hierJs.indexOf('if ((day - (link.day || 0)) < 30) return false;') !== -1);
check('seasoned = trust 40+ (hierarchy.js _linkSeasoned)',
  hierJs.indexOf('return tr >= 40;') !== -1);
check('covenant polity needs >=3 seasoned links (_covenantPolity)',
  hierJs.indexOf("var ls = this._peerLinks('covenant').filter((l) => this._linkSeasoned(l, false, true));") !== -1 &&
  hierJs.indexOf('if (ls.length < 3) return null;') !== -1);
check('staging checks candidates in priority order lead/belong/covenant/trade (_checkNational)',
  hierJs.indexOf('var cands = [this.polityOf(HOME), this._belongPolity(), this._covenantPolity(), this._tradePolity()];') !== -1);
check('rung gate: national waits a full season of regional (_checkNational)',
  hierJs.indexOf("if (!this.state.networkLive || (day - _netDay) < 30) return;") !== -1);
check('staging returns early while a beat is pending (_checkNational)',
  hierJs.indexOf('if (this.state.nationalLive || this.state.pendingNational) return;') !== -1);
check('comment/code mismatch noted: _covenantPolity comment says 28+, code enforces 30+',
  hierJs.indexOf('28+ days old with trust 40+') !== -1 &&
  hierJs.indexOf('if ((day - (link.day || 0)) < 30) return false;') !== -1);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'onlylead-driver-20261115.js'), 'utf8');
check('driver carries the RUN=seasoning-b dirFor branch',
  driverSrc.indexOf("if (RUN === 'seasoning-b')") !== -1 &&
  driverSrc.indexOf("pol === 'competent-covenant-b' ? stem + '-control' : stem + '-on'") !== -1);
check('driver re-confirm mapping intact (RUN=courtship-reconfirm-b, evidence/2026-11-16)',
  driverSrc.indexOf("if (RUN === 'courtship-reconfirm-b')") !== -1);
check('driver records the fields the classifier reads (shapeCands, road, rungMet, linksRoll)',
  driverSrc.indexOf('shapeCands: shapeCands') !== -1 && driverSrc.indexOf('rungMet: day >= rungDay') !== -1 &&
  driverSrc.indexOf('linksRoll: links') !== -1);
check('analyzer exports classifySeasoningDay + analyzeSeasoning + engineAgreement + analyze',
  typeof ANALYZE.classifySeasoningDay === 'function' && typeof ANALYZE.analyzeSeasoning === 'function' &&
  typeof ANALYZE.engineAgreement === 'function' && typeof ANALYZE.analyze === 'function');
check('driver exports oneRun (D1 live runs use the module, never the CLI)',
  typeof DRIVER.oneRun === 'function');

// Zero src/js changes: worktree files vs HEAD blobs, read-only
// plumbing (no index touch — the flap blocks index.lock creation).
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
// Branch commits vs fork-point touch no src/js (read-only plumbing).
const fork = gitOut(['merge-base', 'HEAD', 'master']);
if (fork === null) {
  skip('branch commits touch no src/js (merge-base unavailable)', 're-check after flap clears');
} else {
  const names = gitOut(['diff', '--name-only', fork.trim(), 'HEAD', '--', 'src']);
  if (names === null) skip('branch commits touch no src/js (diff unavailable)', 're-check after flap clears');
  else check('branch commits touch no src/js (fork ' + fork.trim().slice(0, 12) + ')', names.trim() === '', names.trim().slice(0, 200));
}

// ---------- 2. classifySeasoningDay fixtures ---------- //
console.log('== classifySeasoningDay fixtures ==');
function sn(o) {
  const base = {
    d: 50, rungMet: true, pendingNational: null, nationalLive: false,
    scaleRefused: false, exiled: false,
    shapeCands: { lead: null, conquest: null, belong: null, covenant: null, trade: null },
    road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 3, nCovSeas: 2, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
    linksRoll: [
      { id: 'l1', o: 'Stonebridge', k: 'covenant', st: 'active', t: 45, f: 10, age: 40, se: 1 },
      { id: 'l2', o: 'Thornfield', k: 'covenant', st: 'active', t: 45, f: 10, age: 40, se: 1 },
      { id: 'l3', o: 'Ashford', k: 'covenant', st: 'active', t: 30, f: 10, age: 40, se: 0 },
    ],
  };
  if (!o) return base;
  for (const k of Object.keys(o)) {
    if (k === 'shapeCands' || k === 'road') Object.assign(base[k], o[k]);
    else base[k] = o[k];
  }
  return base;
}
function clsIs(name, got, wantCls, wantGate) {
  check(name, got.cls === wantCls && (wantGate === undefined || got.gate === wantGate),
    'got ' + got.cls + '/' + got.gate + ', want ' + wantCls + '/' + wantGate);
}
clsIs('pending covenant beat -> staged', ANALYZE.classifySeasoningDay(sn({ pendingNational: { shape: 'covenant' } }), false), 'staged', null);
clsIs('covenant answer event today -> staged (snapshot already answered)', ANALYZE.classifySeasoningDay(sn({ nationalLive: true }), true), 'staged', null);
clsIs('2-of-3 seasoned, blocker trust-short -> seasoning-blocked (trust-only)', ANALYZE.classifySeasoningDay(sn(), false), 'seasoning-blocked', 'seasoned-short:2-of-3');
(function () {
  const got = ANALYZE.classifySeasoningDay(sn(), false);
  check('blocker link named (Ashford) with age-met + trust owed 10',
    got.blockers.length === 1 && got.blockers[0].other === 'Ashford' && got.blockers[0].ageShort === false &&
    got.blockers[0].trustShort === true && got.blockers[0].trustOwed === 10, JSON.stringify(got.blockers));
})();
clsIs('blocker age-short only -> seasoning-blocked (age-only)',
  ANALYZE.classifySeasoningDay(sn({ d: 25, linksRoll: [
    { id: 'l1', o: 'Stonebridge', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
    { id: 'l2', o: 'Thornfield', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
    { id: 'l3', o: 'Ashford', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
  ], road: { nCovFormed: 3, nCovSeas: 0 } }), false), 'seasoning-blocked', 'seasoned-short:0-of-3');
(function () {
  const got = ANALYZE.classifySeasoningDay(sn({ d: 25, linksRoll: [
    { id: 'l1', o: 'Stonebridge', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
    { id: 'l2', o: 'Thornfield', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
    { id: 'l3', o: 'Ashford', k: 'covenant', st: 'active', t: 45, f: 10, age: 15, se: 0 },
  ], road: { nCovFormed: 3, nCovSeas: 0 } }), false);
  check('multi-unseasoned day names all three blockers (ageShort, trust met)',
    got.blockers.length === 3 && got.blockers.every(function (b) { return b.ageShort && !b.trustShort && b.ageDaysOwed === 15; }),
    JSON.stringify(got.blockers));
})();
clsIs('rung not met -> other-blocked rung', ANALYZE.classifySeasoningDay(sn({ rungMet: false }), false), 'other-blocked', 'rung');
clsIs('lead candidate qualifies -> other-blocked shadowed:lead',
  ANALYZE.classifySeasoningDay(sn({ shapeCands: { lead: { shape: 'lead', size: 4 } } }), false), 'other-blocked', 'shadowed:lead');
clsIs('belong candidate qualifies -> other-blocked shadowed:belong',
  ANALYZE.classifySeasoningDay(sn({ shapeCands: { belong: { shape: 'belong', size: 4 } } }), false), 'other-blocked', 'shadowed:belong');
clsIs('another shape beat pending -> other-blocked pending:lead',
  ANALYZE.classifySeasoningDay(sn({ pendingNational: { shape: 'lead' } }), false), 'other-blocked', 'pending:lead');
clsIs('national already live -> other-blocked national-live',
  ANALYZE.classifySeasoningDay(sn({ nationalLive: true }), false), 'other-blocked', 'national-live');
clsIs('scale refused -> other-blocked scale-refused',
  ANALYZE.classifySeasoningDay(sn({ scaleRefused: true }), false), 'other-blocked', 'scale-refused');
clsIs('exiled -> other-blocked exiled',
  ANALYZE.classifySeasoningDay(sn({ exiled: true }), false), 'other-blocked', 'exiled');
clsIs('fewer than 3 formed -> other-blocked formed-short:2-of-3',
  ANALYZE.classifySeasoningDay(sn({ road: { nCovFormed: 2, nCovSeas: 2 }, linksRoll: [] }), false), 'other-blocked', 'formed-short:2-of-3');
clsIs('no peer links at all -> other-blocked no-peer-links',
  ANALYZE.classifySeasoningDay(sn({ road: { nCovFormed: 0, nCovSeas: 0 }, linksRoll: [] }), false), 'other-blocked', 'no-peer-links');
clsIs('covenant candidate present, rung met, nothing pending -> unclassified qualified-unstaged',
  ANALYZE.classifySeasoningDay(sn({ shapeCands: { covenant: { shape: 'covenant', size: 4 } }, road: { nCovFormed: 3, nCovSeas: 3 } }), false),
  'unclassified', 'qualified-unstaged');
clsIs('3 seasoned but candidate null -> unclassified seas-count-mismatch',
  ANALYZE.classifySeasoningDay(sn({ road: { nCovFormed: 3, nCovSeas: 3 } }), false), 'unclassified', 'seas-count-mismatch');

// ---------- 3. analyzeSeasoning fixtures ---------- //
console.log('== analyzeSeasoning fixtures ==');
function linkRow(day, id, other, trust, formed, se) {
  return { id: id, o: other, k: 'covenant', st: 'active', t: trust, f: formed, age: day - formed, se: se ? 1 : 0 };
}
function fakeSeries(spec) {
  // spec: { days: [d0..d1], rungFrom, formed, links: [{id, other, formed, trustAt(day), seAt(day)}], candFrom, pendingDay }
  const out = [];
  for (let d = spec.days[0]; d <= spec.days[1]; d++) {
    // A link exists in the roll only once formed (day >= formed day).
    const links = (spec.links || []).filter(function (L) { return d >= L.formed; }).map(function (L) {
      return linkRow(d, L.id, L.other, L.trustAt(d), L.formed, L.seAt(d));
    });
    const nCovSeas = links.filter(function (l) { return l.se; }).length;
    out.push({
      d: d, rungMet: d >= (spec.rungFrom || 0), pendingNational: (spec.pendingDay === d) ? { shape: 'covenant' } : null,
      nationalLive: spec.nationalLiveFrom !== undefined && d >= spec.nationalLiveFrom,
      scaleRefused: false, exiled: false,
      shapeCands: { lead: null, conquest: null, belong: null, covenant: (spec.candFrom !== undefined && d >= spec.candFrom) ? { shape: 'covenant', size: 4 } : null, trade: null },
      road: { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: links.length, nCovSeas: nCovSeas, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null },
      linksRoll: links, scale: (spec.nationalLiveFrom !== undefined && d >= spec.nationalLiveFrom) ? 'national' : 'regional',
    });
  }
  return out;
}
// Fixture A: staged after a 20-day seasoning wait (links formed d10,
// two season d40, third seasons d50 on trust 40; beat stages d50,
// answered d51).
(function () {
  const rec = {
    seed: 1, policy: 'fixture-a', endReason: 'survived',
    series: fakeSeries({
      days: [1, 60], rungFrom: 30, candFrom: 50, pendingDay: 50, nationalLiveFrom: 51,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        // Formed later (d20), so d40–d49 it is the SOLE unseasoned link
        // and is BOTH age-short (20–29d) and trust-short (30) — the
        // bothDays aggregation case. It seasons d50 (age 30, trust 40).
        { id: 'l3', other: 'Ashford', formed: 20, trustAt: function (d) { return d >= 50 ? 40 : 30; }, seAt: function (d) { return d >= 50; } },
      ],
    }),
    verbEvents: [{ day: 51, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('A staged: verdict staged, stagedDay d50, firstOpp d30, daysLost 20',
    r.verdict === 'staged' && r.stagedDay === 50 && r.firstOpportunityDay === 30 && r.daysLost === 20 && !r.censored,
    JSON.stringify({ verdict: r.verdict, stagedDay: r.stagedDay, firstOpportunityDay: r.firstOpportunityDay, daysLost: r.daysLost }));
  check('A blocked days 20 (d30–d49), multi 10 (d30–d39, three unseasoned) / both 10 (d40–d49, Ashford alone)',
    r.seasoningBlockedDays === 20 && r.multiDays === 10 && r.bothDays === 10 && r.trustOnlyDays === 0 && r.ageOnlyDays === 0,
    JSON.stringify({ blocked: r.seasoningBlockedDays, multi: r.multiDays, both: r.bothDays, trustOnly: r.trustOnlyDays, ageOnly: r.ageOnlyDays }));
  check('A decisive blocker is Ashford, seasoning day d50',
    r.decisive && r.decisive.other === 'Ashford' && r.decisive.seasonedDay === 50, JSON.stringify(r.decisive));
  check('A blocker-day count: Ashford 20 days',
    r.blockerDayCount.Ashford === 20, JSON.stringify(r.blockerDayCount));
  check('A unknown 0', r.unknown === 0);
})();
// Fixture B: never staged, seasoning-bound to the end (censored).
(function () {
  const rec = {
    seed: 2, policy: 'fixture-b', endReason: 'survived',
    series: fakeSeries({
      days: [1, 100], rungFrom: 30,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 30; }, seAt: function () { return false; } },
      ],
    }),
    verbEvents: [],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('B never-staged: verdict seasoning-blocked, blockedDays 71 (d30–d100 inclusive), daysLost 71 censored',
    r.verdict === 'seasoning-blocked' && r.seasoningBlockedDays === 71 && r.daysLost === 71 && r.censored,
    JSON.stringify({ verdict: r.verdict, blocked: r.seasoningBlockedDays, daysLost: r.daysLost, censored: r.censored }));
  check('B decisive: Ashford still unseasoned, age owed 0, trust owed 10',
    r.decisive && r.decisive.stillUnseasoned && r.decisive.stillUnseasoned.length === 1 &&
    r.decisive.stillUnseasoned[0].other === 'Ashford' &&
    r.decisive.stillUnseasoned[0].ageDaysOwed === 0 && r.decisive.stillUnseasoned[0].trustOwed === 10,
    JSON.stringify(r.decisive));
  check('B unknown 0', r.unknown === 0);
})();
// Fixture C: never staged, no peer links at all.
(function () {
  const rec = {
    seed: 3, policy: 'fixture-c', endReason: 'village-lost',
    series: fakeSeries({ days: [1, 80], rungFrom: 30, links: [] }),
    verbEvents: [],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('C no links: verdict other-blocked, no opportunity day, daysLost null',
    r.verdict === 'other-blocked' && r.firstOpportunityDay === null && r.daysLost === null && r.seasoningBlockedDays === 0,
    JSON.stringify({ verdict: r.verdict, firstOpp: r.firstOpportunityDay, daysLost: r.daysLost }));
  check('C unknown 0', r.unknown === 0);
})();
// Fixture D: links seasoned but the rung never comes (networkLive never).
(function () {
  const rec = {
    seed: 4, policy: 'fixture-d', endReason: 'village-lost',
    series: fakeSeries({
      days: [1, 80], rungFrom: 9999,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
      ],
    }),
    verbEvents: [],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('D rung never met: verdict other-blocked, gate rung',
    r.verdict === 'other-blocked' && r.verdictGate === 'rung' && r.firstOpportunityDay === null,
    JSON.stringify({ verdict: r.verdict, gate: r.verdictGate }));
  check('D unknown 0', r.unknown === 0);
})();
// Fixture E: multi-unseasoned blocked days (all three trust-short).
(function () {
  const rec = {
    seed: 5, policy: 'fixture-e', endReason: 'survived',
    series: fakeSeries({
      days: [1, 60], rungFrom: 30,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 30; }, seAt: function () { return false; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 30; }, seAt: function () { return false; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 30; }, seAt: function () { return false; } },
      ],
    }),
    verbEvents: [],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('E multi: verdict seasoning-blocked, blockedDays 31, multiDays 31',
    r.verdict === 'seasoning-blocked' && r.seasoningBlockedDays === 31 && r.multiDays === 31,
    JSON.stringify({ verdict: r.verdict, blocked: r.seasoningBlockedDays, multi: r.multiDays }));
  check('E decisive: three still unseasoned at end',
    r.decisive && r.decisive.stillUnseasoned && r.decisive.stillUnseasoned.length === 3, JSON.stringify(r.decisive));
  check('E unknown 0', r.unknown === 0);
})();
// Fixture F: qualified but never staged -> unknown (instrument mystery).
(function () {
  const rec = {
    seed: 6, policy: 'fixture-f', endReason: 'survived',
    series: fakeSeries({
      days: [1, 100], rungFrom: 30, candFrom: 50,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l3', other: 'Ashford', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
      ],
    }),
    verbEvents: [],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('F qualified-unstaged: verdict unknown, unknown 1, 61 unclassified days (10 seas-count-mismatch d40–d49 + 51 qualified-unstaged d50–d100)',
    r.verdict === 'unknown' && r.unknown === 1 && r.unclassifiedDays === 61,
    JSON.stringify({ verdict: r.verdict, unknown: r.unknown, unclassifiedDays: r.unclassifiedDays }));
})();
// Fixture G: staged after a lead shadow lifts. Seasoning binds
// d30–d39 (links season d40), the lead shadows d40–d45, covenant
// stages d46. The total wait is 16 days, of which 10 are seasoning's
// and 6 the shadow's — the decomposition is the measurement.
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
    // The real candidate roll reads ALL shapes independently: the
    // covenant candidate is present from d40 AND the lead candidate
    // shadows it d40–d45. The classifier must pick shadowed:lead
    // (priority order), not the covenant candidate.
    if (s.d >= 40 && s.d <= 45) s.shapeCands.lead = { shape: 'lead', size: 4 };
  }
  const rec = { seed: 7, policy: 'fixture-g', endReason: 'survived', series: series,
    verbEvents: [{ day: 47, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }] };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('G staged-after-shadow: verdict staged, stagedDay d46, firstOpp d30, daysLost 16 (10 seasoning + 6 shadow)',
    r.verdict === 'staged' && r.stagedDay === 46 && r.firstOpportunityDay === 30 && r.daysLost === 16 &&
    r.seasoningBlockedDays === 10 && r.otherBlockedWindowDays === 6,
    JSON.stringify({ verdict: r.verdict, stagedDay: r.stagedDay, firstOpportunityDay: r.firstOpportunityDay, daysLost: r.daysLost, blocked: r.seasoningBlockedDays, otherWindow: r.otherBlockedWindowDays }));
  check('G decisive null (seasoning met before the stage, no flip on d46)',
    r.decisive === null, JSON.stringify(r.decisive));
  check('G unknown 0', r.unknown === 0);
})();

// Fixture H: single link age-short only (formed late, trust met).
(function () {
  const rec = {
    seed: 8, policy: 'fixture-h', endReason: 'survived',
    series: fakeSeries({
      days: [1, 70], rungFrom: 30, candFrom: 65, pendingDay: 65, nationalLiveFrom: 66,
      links: [
        { id: 'l1', other: 'Stonebridge', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        { id: 'l2', other: 'Thornfield', formed: 10, trustAt: function () { return 45; }, seAt: function (d) { return d >= 40; } },
        // Formed d35, trust 45 from the start: age-short only until d65.
        { id: 'l3', other: 'Ashford', formed: 35, trustAt: function () { return 45; }, seAt: function (d) { return d >= 65; } },
      ],
    }),
    verbEvents: [{ day: 66, verb: 'answerNationalChoice', shape: 'covenant', result: 'sat' }],
  };
  const r = ANALYZE.analyzeSeasoning(rec);
  check('H staged: verdict staged, stagedDay d65, firstOpp d35 (C forms d35), daysLost 30',
    r.verdict === 'staged' && r.stagedDay === 65 && r.firstOpportunityDay === 35 && r.daysLost === 30 && !r.censored,
    JSON.stringify({ verdict: r.verdict, stagedDay: r.stagedDay, firstOpportunityDay: r.firstOpportunityDay, daysLost: r.daysLost }));
  check('H blocked days 30 (d35–d64), multi 5 (d35–d39) / age-only 25 (d40–d64, Ashford alone)',
    r.seasoningBlockedDays === 30 && r.multiDays === 5 && r.ageOnlyDays === 25 && r.trustOnlyDays === 0 && r.bothDays === 0,
    JSON.stringify({ blocked: r.seasoningBlockedDays, multi: r.multiDays, ageOnly: r.ageOnlyDays }));
  check('H decisive blocker is Ashford, seasoning day d65',
    r.decisive && r.decisive.other === 'Ashford' && r.decisive.seasonedDay === 65, JSON.stringify(r.decisive));
  check('H unknown 0', r.unknown === 0);
})();

// ---------- 4. D1 determinism (live, in-memory, no corpus file) ---------- //
console.log('== D1 determinism (live) ==');
(async function () {
  const t0 = process.hrtime.bigint();
  const r1 = await DRIVER.oneRun(102201, 'competent-courtship-b', { days: 150 });
  const r2 = await DRIVER.oneRun(102201, 'competent-courtship-b', { days: 150 });
  console.log('  D1 runs took ' + (Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1) + 's for 2x150d');
  const s1 = JSON.stringify(r1), s2 = JSON.stringify(r2);
  check('D1: same seed twice -> identical full record (seed 102201, courtship, 150d)',
    s1 === s2, 'lengths ' + s1.length + ' vs ' + s2.length);
  check('D1: the repeated run is itself valid (0 instrument errors, series present)',
    (r1.instrumentErrors || []).length === 0 && (r1.series || []).length > 100,
    'errors=' + (r1.instrumentErrors || []).length + ' series=' + (r1.series || []).length);

  // ---------- 5. D2 neutrality / analyzer purity ---------- //
  console.log('== D2 neutrality / analyzer purity ==');
  const frozen = JSON.parse(JSON.stringify(r1));
  deepFreeze(frozen);
  let a1 = null, a2 = null, frozeOk = true;
  try { a1 = ANALYZE.analyzeSeasoning(frozen); a2 = ANALYZE.analyzeSeasoning(frozen); }
  catch (e) { frozeOk = false; console.log('  FAIL: analyzer threw on frozen input — ' + String(e.message).slice(0, 120)); }
  check('D2: analyzer is pure on a frozen live record (no mutation, no throw)', frozeOk);
  check('D2: analyze twice on the same record -> identical output',
    frozeOk && JSON.stringify(a1) === JSON.stringify(a2));
  check('D2: the D1 record classifies cleanly (verdict known, unknown 0)',
    a1 && a1.verdict !== 'unknown' && a1.unknown === 0,
    a1 ? JSON.stringify({ verdict: a1.verdict, unknown: a1.unknown }) : 'no analysis');
  function deepFreeze(o) {
    if (o && typeof o === 'object' && !Object.isFrozen(o)) {
      Object.freeze(o);
      for (const k of Object.keys(o)) deepFreeze(o[k]);
    }
    return o;
  }

  // ---------- 6. Corpus completeness + D3 (only with --corpus) ---------- //
  if (CORPUS) {
    console.log('== corpus completeness + D3 engine-agreement ==');
    const controlDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-control');
    const onDir = path.join(REPO, 'evidence', '2026-11-16', 'perseed-seasoning-b-on');
    const files = [];
    for (const dir of [controlDir, onDir]) {
      if (!fs.existsSync(dir)) { check('corpus dir exists: ' + path.relative(REPO, dir), false, 'missing'); continue; }
      for (const f of fs.readdirSync(dir).filter(function (x) { return x.slice(-5) === '.json'; }).sort()) files.push(path.join(dir, f));
    }
    check('corpus is 16/16 files (8 seeds x 2 policies)', files.length === 16, 'found ' + files.length);
    const records = files.map(function (f) { return JSON.parse(fs.readFileSync(f, 'utf8')); });
    check('every record parses with a full series and 0 instrument errors',
      records.every(function (r) { return (r.series || []).length > 0 && (r.instrumentErrors || []).length === 0; }),
      records.map(function (r) { return r.seed + ':' + (r.series || []).length + 'd/' + (r.instrumentErrors || []).length + 'err'; }).join(' '));
    const out = ANALYZE.analyze(records);
    check('classification completeness: unknown 0 band-wide',
      out.unknown === 0, 'unknown=' + out.unknown);
    check('every seed carries a known verdict (staged / seasoning-blocked / other-blocked)',
      Object.keys(out.perSeed).every(function (k) { return ['staged', 'seasoning-blocked', 'other-blocked'].indexOf(out.perSeed[k].verdict) !== -1; }));
    check('D3: every seasoning-blocked day has the covenant candidate null',
      out.d3.blockedCandidateNull === out.d3.blockedDays,
      out.d3.blockedCandidateNull + '/' + out.d3.blockedDays);
    check('D3: every staged day has the covenant candidate seen (day or day before)',
      out.d3.stagedCandidateSeen === out.d3.stagedDays,
      out.d3.stagedCandidateSeen + '/' + out.d3.stagedDays);
    check('D3: zero agreement misses', out.d3.misses.length === 0, JSON.stringify(out.d3.misses.slice(0, 3)));
  } else {
    console.log('== corpus + D3 skipped (run with --corpus after the sweep) ==');
  }

  console.log('test-seasoning-b: ' + pass + ' passed, ' + fail + ' failed' + (skipped ? ', ' + skipped + ' skipped (git unavailable)' : '') + (CORPUS ? ' (corpus mode)' : ''));
  if (fail) { console.log('FAILURES:\n' + failures.join('\n')); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
