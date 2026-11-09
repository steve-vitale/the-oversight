// test-sitgap-winseek-b.js — proof for the SIT GAP WINSEEK classification
// (arm sim-sitgap-winseek-b). G1 det-gate (winseek classifier on synthetic
// fixtures for all five classes + the committed perseed-53007-a corpora +
// broken-classifier / broken-mechanism sensitivity), G2 recorder neutrality,
// G3 corpus integrity, plus the winseek zero-sit-drive legs (no seat-verb
// call is ever recorded; a corpus WITH one is flagged a contradiction).
// Fixture-based; no sim, no harness load — runs at any SHA. Real-corpus
// legs run when the committed corpora exist (perseed-sitgap-winseek-b +
// perseed-sitgap-winseek-b-unrec) and SKIP otherwise; the evidence run
// records the full count with corpora present.
// Run: node scripts/test-sitgap-winseek-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const AW = require('./analyze-sitgap-winseek-20261109');
const A = require('./analyze-sitgap-20261108');

const REPO = path.join(__dirname, '..');
let pass = 0, fail = 0, skip = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function checkSkip(name, cond, extra) {
  if (cond === null) { skip++; console.log('SKIP ' + name + (extra ? ' — ' + extra : '')); }
  else check(name, cond, extra);
}
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

// --- fixture builder: minimal corpora in instrument shape (winseek leg) ---
// Rows start d2; day 3 is never snapshot; the closing snapshot duplicates
// the final scholar day (53007-a Amendments 1–2). The winseek stub stats
// are ZERO on every row — no sit drive exists, so no skip ever fires.
function row(day, over) {
  return Object.assign({
    day: day, living: 12, raw: 175, arc: 4, seat: 'none', seatDetail: null,
    preview: null, entryBlock: '', gate: 'no-seat',
    tableWaiting: false, tableAnnounced: false, tableDone: false,
    winDayFloorOk: day >= 90, scholarAtHaven: true, scholarAlive: true,
    sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
  }, over || {});
}
function mkCorpus(seed, rows, opts) {
  const o = opts || {};
  return Object.assign({
    seed: seed, arm: 'sitgap-winseek-b', days: 150, gameDays: rows.length ? rows[rows.length - 1].day : 0,
    endReason: 'survived', won: false, over: false, villageLost: false,
    scaleRank: 'regional', maxWave: 4, standing: 175, instrumentOff: false,
    daily: rows, fallen: [], waveKillLog: [],
    takeseatStats: { seatAttempts: 0, seatTaken: 0, seatFailed: 0, seatDay: null, seatKind: null, skips: {}, errors: 0, events: [] },
    sitAttempts: [], doorVerbMsgs: [], instrumentErrors: [], finalSeat: null,
  }, o);
}
const LESSER = { w1: 4, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true };

// --- G1: all five classes on synthetic fixtures (winseek wrapper) ---
(function () {
  // sat: lesser from d90, tableDone d95, sit d95. (Impossible under
  // winseek — no sit drive — but the rule must still return sat if it
  // ever happened, or the wrapper would be hiding a contradiction.)
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    const sat = d >= 95;
    rows.push(row(d, {
      tableWaiting: d >= 85, tableAnnounced: d >= 90, tableDone: sat,
      seat: d >= 90 ? 'lesser' : 'none', seatDetail: d >= 90 ? LESSER : null,
      preview: d >= 90 ? { seat: 'lesser', doors: ['Defiant'], ready: !sat, why: sat ? '' : '', overtime: 0, fullReady: false } : null,
      gate: sat ? 'sat' : (d >= 90 ? 'offer-not-taken' : 'no-seat'),
      sitgap: { tsSkips: {}, tsAttempts: d >= 95 ? 1 : 0, tsTaken: d >= 95 ? 1 : 0, tsFailed: 0, tsSeatDay: d >= 95 ? 95 : null, tsSeatKind: d >= 95 ? 'lesser' : null },
    }));
  }
  rows.push(row(100, { tableWaiting: true, tableAnnounced: true, tableDone: true, seat: 'lesser', seatDetail: LESSER, preview: { seat: 'lesser', doors: [], ready: false, why: '', overtime: 0, fullReady: false }, gate: 'sat', sitgap: { tsSkips: {}, tsAttempts: 1, tsTaken: 1, tsFailed: 0, tsSeatDay: 95, tsSeatKind: 'lesser' } }));
  const c = mkCorpus(53007, rows, { gameDays: 100, days: 100, standing: 584, finalSeat: { seat: 'lesser', detail: LESSER }, takeseatStats: { seatAttempts: 1, seatTaken: 1, seatFailed: 0, seatDay: 95, seatKind: 'lesser', skips: {}, errors: 0, events: [] }, sitAttempts: [{ seq: 1, day: 95, call: 'tableTakeSeat', ok: true }] });
  const cl = AW.classifySitWinseek(c);
  check('G1: sat fixture classifies sat (lesser d95)', cl.cls === 'sat' && cl.mechanism.indexOf('d95') >= 0, 'got ' + cl.cls + ': ' + cl.mechanism);
  check('G1: sat fixture is flagged a contradiction (a sit under winseek contradicts the code verification)',
    cl.contradiction === true && cl.sitCallCount === 1, 'contradiction=' + cl.contradiction + ' sitCalls=' + cl.sitCallCount);
})();

(function () {
  // offered-not-taken, WINSEEK SHAPE: announced d90, ready d92–d100,
  // scholar at Haven on most ready days, EMPTY skip diffs (no sit drive).
  // The mechanism must be written from snapshot fields, never from skips.
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    const away = (d % 3 === 0);
    rows.push(row(d, {
      tableWaiting: d >= 85, tableAnnounced: d >= 90,
      seat: d >= 90 ? 'lesser' : 'none', seatDetail: d >= 90 ? LESSER : null,
      preview: d >= 92 ? { seat: 'lesser', doors: ['Defiant'], ready: true, why: '', overtime: 1, fullReady: false } : (d >= 90 ? { seat: 'lesser', doors: ['Defiant'], ready: false, why: 'Return to Haven to take your seat.', overtime: 0, fullReady: false } : null),
      entryBlock: (d >= 90 && d < 92) ? 'Return to Haven to take your seat.' : '',
      gate: d >= 92 ? 'offer-not-taken' : 'no-preview',
      scholarAtHaven: !away,
      sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
    }));
  }
  rows.push(row(100, { tableWaiting: true, tableAnnounced: true, seat: 'lesser', seatDetail: LESSER, preview: { seat: 'lesser', doors: ['Defiant'], ready: true, why: '', overtime: 1, fullReady: false }, gate: 'offer-not-taken', scholarAtHaven: true, sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null } }));
  const c = mkCorpus(53008, rows, { gameDays: 100, days: 100, standing: 175, finalSeat: { seat: 'lesser', detail: LESSER } });
  const cl = AW.classifySitWinseek(c);
  check('G1: offered-not-taken fixture classifies offered-not-taken', cl.cls === 'offered-not-taken', 'got ' + cl.cls);
  check('G1: winseek mechanism names the ready window (d92) with EMPTY skip diffs', cl.mechanism.indexOf('d92') >= 0, cl.mechanism);
  check('G1: winseek mechanism names the scholar location on ready days', /at Haven on \d+\/\d+ ready days/.test(cl.mechanism), cl.mechanism);
  check('G1: winseek mechanism states the no-sit-drive fact', cl.mechanism.indexOf('no sit drive runs under winseek') >= 0, cl.mechanism);
  check('G1: winseek mechanism cites NO skip reason (the word "skip" never appears)', cl.mechanism.indexOf('skip') === -1, cl.mechanism);
  check('G1: offered-not-taken fixture has no contradiction (zero sit calls)', cl.contradiction === false && cl.sitCallCount === 0, 'contradiction=' + cl.contradiction);
  // The reused base classifier would have written a skip-based mechanism
  // ("dominant sit-drive skip: none recorded") — the wrapper must differ.
  const base = A.classifySit(c);
  check('G1: winseek mechanism differs from the base skip-based mechanism', cl.mechanism !== base.mechanism && base.mechanism.indexOf('skip') >= 0, 'base: ' + base.mechanism);
})();

(function () {
  // offered-declined: announced d90, seat lesser to d99, dips to none d100+, holding told, never ready.
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    const dipped = d >= 100;
    rows.push(row(d, {
      tableWaiting: d >= 85, tableAnnounced: d >= 90,
      seat: (d >= 90 && !dipped) ? 'lesser' : 'none',
      seatDetail: (d >= 90 && !dipped) ? LESSER : (dipped ? { w1: 4, w2: 4, w3: 2, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } : null),
      preview: null, gate: dipped ? 'no-seat' : 'no-preview',
      tableHoldingTold: dipped,
    }));
  }
  const c = mkCorpus(53001, rows, { gameDays: 100, days: 100, standing: 140, finalSeat: { seat: 'none', detail: { w1: 4, w2: 4, w3: 2, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } } });
  const cl = AW.classifySitWinseek(c);
  check('G1: offered-declined fixture classifies offered-declined', cl.cls === 'offered-declined', 'got ' + cl.cls);
  check('G1: offered-declined mechanism names the dipped bar', cl.mechanism.indexOf('wave-3 faced 2/3') >= 0, cl.mechanism);
})();

(function () {
  // reached-never-sat: tableWaiting from d85, seat none throughout, never announced, preview null.
  const rows = [];
  for (let d = 2; d <= 100; d++) {
    if (d === 3) continue;
    rows.push(row(d, {
      tableWaiting: d >= 85,
      seatDetail: { w1: 4, w2: 3, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true },
      preview: null, gate: 'no-seat',
    }));
  }
  const c = mkCorpus(53002, rows, { gameDays: 100, days: 100, standing: 160, finalSeat: { seat: 'none', detail: { w1: 4, w2: 3, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } } });
  const cl = AW.classifySitWinseek(c);
  check('G1: reached-never-sat fixture classifies reached-never-sat', cl.cls === 'reached-never-sat', 'got ' + cl.cls);
  check('G1: reached-never-sat mechanism names the missing bar', cl.mechanism.indexOf('wave-2 faced 3/4') >= 0, cl.mechanism);
})();

(function () {
  // never-offered: tableWaiting never true, arc 3, seat none.
  const rows = [];
  for (let d = 2; d <= 69; d++) {
    if (d === 3) continue;
    rows.push(row(d, {
      arc: 3, seatDetail: { w1: 3, w2: 2, w3: 1, contestsN: 1, crisesN: 1, rank: 'village', stage: 1, foodDeeds: false },
    }));
  }
  const c = mkCorpus(53005, rows, { gameDays: 69, days: 69, endReason: 'village-lost', standing: 150, finalSeat: { seat: 'none', detail: { w1: 3, w2: 2, w3: 1, contestsN: 1, crisesN: 1, rank: 'village', stage: 1, foodDeeds: false } } });
  const cl = AW.classifySitWinseek(c);
  check('G1: never-offered fixture classifies never-offered', cl.cls === 'never-offered', 'got ' + cl.cls);
  check('G1: never-offered mechanism names the missing bars', cl.mechanism.indexOf('scale village') >= 0, cl.mechanism);
})();

// Broken-classifier sensitivity: a mutated rule that demands ≥10 ready
// days for offered-not-taken must NOT return offered-not-taken for the
// 5-ready-day fixture — the gate can fail.
function brokenClassifySit(corpus) {
  const ev = A.seatEvents(corpus);
  if ((corpus.takeseatStats || {}).seatTaken > 0) return 'sat';
  if (ev.firstAnnouncedDay != null && ev.readyDays.length >= 10) return 'offered-not-taken';
  if (ev.firstWaitingDay != null) return 'reached-never-sat';
  return 'never-offered';
}
(function () {
  const rows = [];
  for (let d = 90; d <= 95; d++) rows.push(row(d, { tableWaiting: true, tableAnnounced: true, seat: 'lesser', seatDetail: LESSER, preview: { seat: 'lesser', doors: [], ready: true, why: '', overtime: 0, fullReady: false }, gate: 'offer-not-taken' }));
  const c = mkCorpus(53008, rows, { gameDays: 95, days: 95 });
  check('G1: broken classifier (≥10 ready days) does NOT return offered-not-taken on a 5-ready-day fixture',
    brokenClassifySit(c) !== 'offered-not-taken', 'broken rule returned ' + brokenClassifySit(c));
  check('G1: real classifier DOES return offered-not-taken on the same fixture',
    AW.classifySitWinseek(c).cls === 'offered-not-taken', 'real rule returned ' + AW.classifySitWinseek(c).cls);
})();

// Broken-mechanism sensitivity: a mechanism that cites a skip reason must
// fail the winseek no-skip check — the gate can fail on the rewrite too.
(function () {
  const fake = 'announced d90; dominant sit-drive skip across ready days: away (15); end: survived d100';
  check('G1: a skip-citing mechanism FAILS the winseek no-skip check', fake.indexOf('skip') >= 0, 'fake mechanism has no "skip"');
  const rows = [];
  for (let d = 90; d <= 95; d++) rows.push(row(d, { tableWaiting: true, tableAnnounced: true, seat: 'lesser', seatDetail: LESSER, preview: { seat: 'lesser', doors: [], ready: true, why: '', overtime: 0, fullReady: false }, gate: 'offer-not-taken' }));
  const c = mkCorpus(53008, rows, { gameDays: 95, days: 95 });
  const cl = AW.classifySitWinseek(c);
  check('G1: the real winseek rewrite PASSES the no-skip check on the same shape',
    cl.mechanism.indexOf('skip') === -1 && cl.mechanism.indexOf('no sit drive runs under winseek') >= 0, cl.mechanism);
})();

// Ready-day caveat flag: last daily row before the final game day.
(function () {
  const rows = [];
  for (let d = 2; d <= 90; d++) {
    if (d === 3) continue;
    rows.push(row(d, { tableWaiting: d >= 85, seat: d >= 90 ? 'lesser' : 'none', seatDetail: d >= 90 ? LESSER : null, preview: null, gate: 'no-preview' }));
  }
  const c = mkCorpus(53001, rows, { gameDays: 92, days: 92, endReason: 'village-lost' });
  const cl = AW.classifySitWinseek(c);
  check('G1: caveat flag fires when the last daily row precedes the final game day',
    cl.caveatFlag === true && (cl.caveatDetail || '').indexOf('d90') >= 0, 'caveatFlag=' + cl.caveatFlag + ' detail=' + cl.caveatDetail);
  const c2 = mkCorpus(53001, rows, { gameDays: 90, days: 90, endReason: 'village-lost' });
  check('G1: caveat flag is clear when the last row IS the final day',
    AW.classifySitWinseek(c2).caveatFlag === false, 'caveatFlag=' + AW.classifySitWinseek(c2).caveatFlag);
})();

// skipActivity attribution (reused function, still exercised through the wrapper).
(function () {
  const rows = [
    row(90, { sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null } }),
    row(91, { sitgap: { tsSkips: { away: 3 }, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null } }),
    row(92, { sitgap: { tsSkips: { away: 3 }, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null } }),
    row(93, { sitgap: { tsSkips: { away: 7, fight: 1 }, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null } }),
  ];
  const act = AW.skipActivity(rows);
  check('G1: skipActivity diffs cumulative counters to per-day increments (attributed to the later row\'s day)',
    act.length === 2 && act[0].day === 91 && act[0].skips.away === 3 && act[1].day === 93 && act[1].skips.away === 4 && act[1].skips.fight === 1,
    JSON.stringify(act));
})();

// --- G1: the committed perseed-53007-a corpora (prior master) ---
const ROOTS = path.join(REPO, 'evidence', '2026-11-08', 'perseed-53007-a');
function rootJson(seed) { return readJson(path.join(ROOTS, 'doorwalk-53007-a-s' + seed + '-doorwalk-baseline.json')); }
[53003, 53004, 53006, 53007].forEach(function (seed) {
  const c = rootJson(seed);
  checkSkip('G1: root 53007-a seed ' + seed + ' classifies sat (lesser, per sim-53007-a)',
    c ? AW.classifySitWinseek(c).cls === 'sat' : null,
    c ? ('got ' + AW.classifySitWinseek(c).cls + ': ' + AW.classifySitWinseek(c).mechanism) : 'no committed root corpus');
});
(function () {
  const c = rootJson(53008);
  const cl = c ? AW.classifySitWinseek(c) : null;
  checkSkip('G1: root 53007-a seed 53008 classifies never-offered (max arc 3, wave-3 faced 2/3 — the only missing bar)',
    c ? cl.cls === 'never-offered' && cl.mechanism.indexOf('wave-3 faced 2/3') >= 0 : null,
    c ? ('got ' + cl.cls + ': ' + cl.mechanism) : 'no committed root corpus');
})();
[53001, 53002, 53005].forEach(function (seed) {
  const c = rootJson(seed);
  const cl = c ? AW.classifySitWinseek(c) : null;
  checkSkip('G1: root 53007-a seed ' + seed + ' classifies never-offered or reached-never-sat (died before sitting)',
    c ? (cl.cls === 'never-offered' || cl.cls === 'reached-never-sat') : null,
    c ? ('got ' + cl.cls) : 'no committed root corpus');
});

// --- G3: corpus integrity on synthetic corpora ---
function goodCorpus() {
  const daily = [];
  for (let d = 2; d <= 10; d++) {
    if (d === 3) continue;
    daily.push({ day: d, living: d < 5 ? 12 : 11,
      diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null },
      sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
      seat: 'none', seatDetail: null, preview: null, tableWaiting: false, tableAnnounced: false, tableDone: false });
  }
  daily.push({ day: 10, living: 11,
    diag: { pantryKcal: 9000, foodDays: 1.5, sickN: 0, sickList: [], woundedN: 0, woundedList: [], hungryN: 0, needsTracked: 12, pelletHolder: null, pelletPassDay: null },
    sitgap: { tsSkips: {}, tsAttempts: 0, tsTaken: 0, tsFailed: 0, tsSeatDay: null, tsSeatKind: null },
    seat: 'none', seatDetail: null, preview: null, tableWaiting: false, tableAnnounced: false, tableDone: false });
  return { seed: 53001, days: 10, gameDays: 10, endReason: 'survived', instrumentOff: false, daily: daily, fallen: [{ day: 5, name: 'Rafael', cause: 'sickness' }], instrumentErrors: [] };
}
check('G3: good synthetic corpus passes integrity', AW.checkCorpusSit(goodCorpus()).ok);
(function () {
  const bad = goodCorpus();
  bad.daily.forEach(function (r) { delete r.sitgap; });
  check('G3: broken recorder (sitgap dropped) FAILS integrity', !AW.checkCorpusSit(bad).ok,
    AW.checkCorpusSit(bad).problems.join('; '));
})();
(function () {
  const bad = goodCorpus();
  bad.daily[2].seat = null;
  check('G3: seat null on a row FAILS integrity', !AW.checkCorpusSit(bad).ok);
})();
(function () {
  const bad = goodCorpus();
  bad.instrumentErrors = ['seat: boom'];
  check('G3: instrument errors FAIL integrity', !AW.checkCorpusSit(bad).ok);
})();

// --- G3 + G1: real winseek corpora (present after the sweep) ---
const DIR = path.join(REPO, 'evidence', '2026-11-08', 'perseed-sitgap-winseek-b');
const seeds = [53001, 53002, 53003, 53004, 53005, 53006, 53007, 53008];
seeds.forEach(function (seed) {
  const c = readJson(path.join(DIR, 'sitgap-winseek-b-s' + seed + '-winseek.json'));
  const ck = c ? AW.checkCorpusSit(c) : null;
  checkSkip('G3: winseek corpus seed ' + seed + ' passes integrity',
    c ? ck.ok : null,
    c ? ck.problems.join('; ') + (ck.gaps.length ? ' (gaps: ' + ck.gaps.join(', ') + ')' : '') : 'no committed winseek corpus yet');
});
(function () {
  const present = seeds.filter(function (s) { return !!readJson(path.join(DIR, 'sitgap-winseek-b-s' + s + '-winseek.json')); });
  checkSkip('G1: all 8 winseek corpora classify with a named mechanism',
    present.length === 8 ? seeds.every(function (s) {
      const c = readJson(path.join(DIR, 'sitgap-winseek-b-s' + s + '-winseek.json'));
      const cl = AW.classifySitWinseek(c);
      return cl.cls && cl.mechanism && cl.mechanism.length > 40;
    }) : null,
    present.length === 8 ? 'a seed classified without a mechanism' : 'only ' + present.length + '/8 corpora present');
  checkSkip('G1: zero sit-verb calls across all 8 winseek corpora (no sit drive runs)',
    present.length === 8 ? seeds.every(function (s) {
      const c = readJson(path.join(DIR, 'sitgap-winseek-b-s' + s + '-winseek.json'));
      const cl = AW.classifySitWinseek(c);
      return cl.sitCallCount === 0 && cl.tableChoiceCount === 0 && cl.contradiction === false;
    }) : null,
    present.length === 8 ? 'a seed recorded a seat-verb call' : 'only ' + present.length + '/8 corpora present');
  const c8 = readJson(path.join(DIR, 'sitgap-winseek-b-s53008-winseek.json'));
  checkSkip('G1: winseek 53008 blocker named with evidence',
    c8 ? (function () { const cl = AW.classifySitWinseek(c8); return cl.mechanism.length > 40 && cl.ev != null; })() : null,
    c8 ? AW.classifySitWinseek(c8).mechanism : 'no committed winseek 53008 corpus');
})();

// --- G2: neutrality (present after the control run) ---
const UNREC = path.join(REPO, 'evidence', '2026-11-08', 'perseed-sitgap-winseek-b-unrec');
[53008, 53004].forEach(function (seed) {
  const unrec = readJson(path.join(UNREC, 'sitgap-winseek-b-s' + seed + '-winseek.json'));
  const rec = readJson(path.join(DIR, 'sitgap-winseek-b-s' + seed + '-winseek.json'));
  const n = (unrec && rec) ? AW.neutralityCompareSit(unrec, rec) : null;
  checkSkip('G2: neutrality seed ' + seed + ' (armed == unrecorded)',
    (unrec && rec) ? n.ok : null,
    (unrec && rec) ? ('diffs: ' + n.diffs.join(', ')) : 'control corpus missing');
});

// --- Driver write-retry helper (flap robustness, success path) ---
(function () {
  const DRV = require('./sitgap-winseek-driver-20261109');
  const tmp = '/tmp/sitgap-winseek-proof-' + process.pid + '.json';
  const content = JSON.stringify({ seed: 53008, check: 'round-trip' }, null, 2) + '\n';
  let ok = false, errMsg = '';
  try {
    // Short retry here (3 × 5s): this check proves the round-trip works
    // when the filesystem cooperates; flap endurance is the sweep's job,
    // not the proof's — a flap must FAIL this one check, never crash the
    // proof with an uncaught throw.
    DRV.writeFileRetry(tmp, content, { attempts: 3, sleepS: 5 });
    ok = fs.readFileSync(tmp, 'utf8') === content;
  } catch (e) { ok = false; errMsg = String(e && e.message ? e.message : e).slice(0, 80); }
  try { fs.unlinkSync(tmp); } catch (e) {}
  check('G3: driver writeFileRetry round-trips a corpus file (and verifies by read-back)', ok === true, 'round-trip failed' + (errMsg ? ': ' + errMsg : ''));
  check('G3: driver zeroTakeseatStats returns fresh zero stats (no sit drive under winseek)',
    (function () { const a = DRV.zeroTakeseatStats(); const b = DRV.zeroTakeseatStats(); return a !== b && a.seatTaken === 0 && a.seatAttempts === 0 && JSON.stringify(a.skips) === '{}' && a.seatDay === null; })(),
    'stub is not a fresh zero object');
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed, ' + skip + ' skipped');
process.exit(fail ? 1 : 0);
