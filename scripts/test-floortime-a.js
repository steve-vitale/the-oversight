#!/usr/bin/env node
// scripts/test-floortime-a.js — sim-floortime-a fixtures.
// Plain node (no jest). Proves the time-ordered floor-flag fix in
// scripts/analyze-blockedrestore-a.js and the re-judged measurement:
//   (a) RED pre-fix behavior on the anaconda fixture: the OLD
//       ever-floored rule (uid in a Set, no day check) returns true
//       for a d64 floor draft against a d61 block;
//   (b) GREEN post-fix: the fixed analyzer returns false there;
//   (c) positive time-ordered fixture (draft strictly before the
//       block) returns true, including a before+after pair;
//   (d) same-day draft returns false (strict <);
//   (e) a non-1 hpAfter draft never counts;
//   (f) re-judged counts on the real draftflag corpus: BLOCKED n=13,
//       1-HP k=4, pattern COMMON-BUT-NOT-THE-RULE, time-ordered
//       floor count 4 (not the old ever-floored 5), census stable,
//       anchor exact, wall numbers verified against the corpus.
// Determinism scratch goes to a worktree scratch dir and is removed
// afterwards (never into the corpus). Run: node scripts/test-floortime-a.js
// Exit non-zero on any failure; prints FIXTURES-PASS n/n on green.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { analyze } = require('./analyze-blockedrestore-a.js');
const REPO = path.join(__dirname, '..');
const DRAFT = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108,
  75109, 75110, 75111, 75112, 75113, 75114, 75115, 75116];

let pass = 0, total = 0, failures = [];
function check(name, cond, extra) {
  total++;
  if (cond) pass++;
  else failures.push(name + (extra ? ' :: ' + extra : ''));
}
function origin(over) {
  return Object.assign({ uid: 27, id: 'paparazzo', hp: 1, maxHp: 100, wave: 2,
    tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false }, over);
}
function occ(over) {
  return Object.assign({ uid: 28, id: 'anaconda_empress', hp: 7, maxHp: 90, wave: 1,
    tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false }, over);
}
function tbend(day, org, blocker) {
  return { type: 'tbend', seq: 1, day, result: 'lost', restored: false,
    origin: org, occupantBefore: blocker, occupantSameAsOriginBefore: false,
    originInWorldBefore: -1, originInWorldAfter: -1, occupantAfter: blocker };
}
function raid(day, drafts) {
  return { type: 'raid', seq: 1, day, fired: true, drafts };
}
// The OLD (pre-fix) rule, verbatim in effect: a Set of uids with any
// hpAfter==1 draft row, no day comparison. Kept here ONLY to prove
// the RED behavior on the counterexample fixture.
function oldEverFloored(events, uid) {
  const s = new Set();
  for (const e of events) {
    if (e.type !== 'raid') continue;
    for (const d of (e.drafts || [])) if (d.hpAfter === 1) s.add(d.uid);
  }
  return s.has(uid);
}
function runOne(seed, events) {
  const dir = fs.mkdtempSync(path.join(REPO, 'scratch-floortime-'));
  try {
    const row = { seed, days: 100, won: 0, nationalEver: 0, nationalFinal: 0, table: 0,
      entered: 0, waveReach: 1, deathTotal: 0,
      draftflag: { events, diag: { errs: 0, errors: [], overflow: {},
        tbEndTotal: events.filter(e => e.type === 'tbend').length,
        tbEndWithOrigin: events.filter(e => e.type === 'tbend').length } },
      scholarmelt: { meetings: [] } };
    fs.writeFileSync(path.join(dir, `s${seed}-fresh.json`), JSON.stringify(row));
    fs.writeFileSync(path.join(dir, `census-s${seed}.json`),
      JSON.stringify({ seed, snapshots: [{ day: 100, monsters: [] }] }));
    const res = analyze(dir, [seed]);
    return res.blockedRows[0];
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// 1. Anaconda counterexample: block d61, floor draft d64 (AFTER).
(function anaconda() {
  const events = [
    raid(64, [{ uid: 28, hpAfter: 1 }]),
    tbend(61, origin(), occ()),
  ];
  check('RED pre-fix: ever-floored rule true for d64 draft vs d61 block',
    oldEverFloored(events, 28) === true);
  const row = runOne(75113, events);
  check('GREEN post-fix: time-ordered flag false for d64 draft vs d61 block',
    row && row.blocker.floorDraftRow === false, JSON.stringify(row && row.blocker));
  check('GREEN post-fix: floor draft days record the post-block day',
    row && row.blocker.floorDraftDays && row.blocker.floorDraftDays.includes(64),
    JSON.stringify(row && row.blocker.floorDraftDays));
  check('anaconda fixture still classified BLOCKED (flag only changed)',
    row && row.cls === 'BLOCKED');
})();

// 2. Positive time-ordered fixture: floor draft strictly before block.
(function positive() {
  const events = [
    raid(158, [{ uid: 33, hpAfter: 1 }]),
    tbend(159, origin({ uid: 29, id: 'suburb', hp: 960, maxHp: 1300, wave: 4 }),
      occ({ uid: 33, id: 'callback', hp: 1, maxHp: 260, wave: 3 })),
  ];
  const row = runOne(75116, events);
  check('positive time-ordered: d158 floor draft vs d159 block true',
    row && row.blocker.floorDraftRow === true, JSON.stringify(row && row.blocker));
})();

// 3. Before+after pair: an earlier floor draft still corroborates.
(function beforeAfter() {
  const events = [
    raid(50, [{ uid: 28, hpAfter: 1 }]),
    raid(70, [{ uid: 28, hpAfter: 1 }]),
    tbend(61, origin(), occ()),
  ];
  const row = runOne(75113, events);
  check('before+after pair: pre-block draft corroborates despite later draft',
    row && row.blocker.floorDraftRow === true, JSON.stringify(row && row.blocker));
})();

// 4. Same-day draft does NOT count (strict <).
(function sameDay() {
  const events = [
    raid(61, [{ uid: 28, hpAfter: 1 }]),
    tbend(61, origin(), occ()),
  ];
  check('RED pre-fix: ever-floored rule true for same-day draft',
    oldEverFloored(events, 28) === true);
  const row = runOne(75113, events);
  check('GREEN post-fix: same-day draft false under strict <',
    row && row.blocker.floorDraftRow === false, JSON.stringify(row && row.blocker));
})();

// 5. Non-1 hpAfter draft never counts.
(function nonFloor() {
  const events = [
    raid(50, [{ uid: 28, hpAfter: 5 }]),
    tbend(61, origin(), occ()),
  ];
  const row = runOne(75113, events);
  check('non-1 hpAfter draft does not set the flag',
    row && row.blocker.floorDraftRow === false);
})();

// 6. Re-judged counts on the real corpus (prereg prediction: 4, not 5).
(function realCorpus() {
  const res = analyze(DRAFT, SEEDS);
  check('real corpus BLOCKED n=13', res.blockerBreakdown.n === 13,
    String(res.blockerBreakdown.n));
  check('real corpus 1-HP k=4', res.blockerBreakdown.kHp1 === 4,
    String(res.blockerBreakdown.kHp1));
  check('real corpus pattern COMMON-BUT-NOT-THE-RULE',
    res.pattern === 'COMMON-BUT-NOT-THE-RULE', res.pattern);
  check('re-judged time-ordered floor count 4, not 5',
    res.blockerBreakdown.floorDraftCorroborated === 4,
    String(res.blockerBreakdown.floorDraftCorroborated));
  check('re-judged hp1 floor-corroborated 4',
    res.blockerBreakdown.hp1FloorCorroborated === 4,
    String(res.blockerBreakdown.hp1FloorCorroborated));
  check('census stable: tbend total 102', res.totals.tbendEvents === 102,
    String(res.totals.tbendEvents));
  check('census stable: lost 24, restored 11, blocked 13, unmeasured 0',
    res.totals.lostTotal === 24 && res.totals.lostByClass.RESTORED === 11
    && res.totals.lostByClass.BLOCKED === 13
    && res.totals.lostByClass['UNMEASURED-cause'] === 0,
    JSON.stringify(res.totals.lostByClass));
  check('anchor exact: s75116 d159 callback uid 33 hp 1 at (4,4)',
    res.anchorOk === true, JSON.stringify(res.anchor));
  const ana = res.blockedRows.find(r => r.seed === 75113 && r.day === 61
    && r.blocker.uid === 28);
  check('real anaconda row: floor flag false, draft day 64 recorded',
    ana && ana.blocker.floorDraftRow === false
    && ana.blocker.floorDraftDays.includes(64),
    JSON.stringify(ana && ana.blocker));
  check('real anchor row: floor flag true (d158 draft before d159 block)',
    (() => { const a = res.blockedRows.find(r => r.seed === 75116 && r.day === 159
      && r.origin.uid === 29); return a && a.blocker.floorDraftRow === true; })());
  check('reconciliation MATCH 16/16', res.reconciliation.every(r => r.match));
  check('valid seeds 16/16', res.validSeeds === 16, String(res.validSeeds));
  check('wall numbers verified: wins 9, natEver 13, natFinal 11, table 12, entered 9',
    res.wall.wins === 9 && res.wall.nationalEver === 13 && res.wall.nationalFinal === 11
    && res.wall.table === 12 && res.wall.entered === 9, JSON.stringify(res.wall));
  check('wall numbers verified: wave reach 16/16/14/9/0, median 118d, deaths 527',
    JSON.stringify(res.wall.waveReach) === JSON.stringify([16, 16, 14, 9, 0])
    && res.wall.medianDays === 118 && res.wall.deathTotal === 527,
    JSON.stringify(res.wall));
})();

// 7. Determinism: full-corpus analyzer run twice into worktree scratch, byte-identical.
(function determinism() {
  const d1 = fs.mkdtempSync(path.join(REPO, 'scratch-floortime-det1-'));
  const d2 = fs.mkdtempSync(path.join(REPO, 'scratch-floortime-det2-'));
  try {
    const o1 = path.join(d1, 'a.json'), o2 = path.join(d2, 'a.json');
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-blockedrestore-a.js'),
      '--dir', DRAFT, '--out', o1], { stdio: 'pipe' });
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-blockedrestore-a.js'),
      '--dir', DRAFT, '--out', o2], { stdio: 'pipe' });
    check('determinism full corpus byte-identical',
      fs.readFileSync(o1, 'utf8') === fs.readFileSync(o2, 'utf8'));
  } finally {
    fs.rmSync(d1, { recursive: true, force: true });
    fs.rmSync(d2, { recursive: true, force: true });
  }
  check('determinism scratch removed', !fs.existsSync(d1) && !fs.existsSync(d2));
})();

console.log(`FIXTURES-${failures.length ? 'FAIL' : 'PASS'} ${pass}/${total}`);
if (failures.length) { for (const f of failures) console.log('  FAIL: ' + f); process.exit(1); }
