#!/usr/bin/env node
// Proof test: r221 analyzer Q1 want-raise scorer counts kinds PER SIT,
// not per pick (the r221 pilot catch: a sitting's want stays ask_favor
// across turns while only the commit-turn pick carries the favor kind,
// so per-pick counting counted one ask many times — and as '(no-kind)'
// on every non-commit turn).
// Runs the analyzer as a subprocess against synthetic seed JSONs in a
// temp EVID dir and asserts the Q1 lines. No game state is touched.
// Usage: node scripts/test-journey-establishment-r221-want-raise-20261116.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r221-wantraise-'));
function seedJson(seed, wedgeSits) {
  return {
    seed, endDay: 43, aliveAt40: 10, aliveEnd: 10, waveReached: 3,
    pantryKcalEnd: 20000, endLog: [], jamLog: [], strandedLog: [],
    travelOutLog: [], foodXpEnd: [{ spotter: 5 }], bumpLog: [],
    codexPlantsEnd: { total: 10 }, wedgeSits,
    sittingCloses: [], commitLog: [],
  };
}
function sit(day, name, mode, picks) {
  return { day, vid: 'v_' + name + '_' + day, name, mode, picks, result: 'no-offer' };
}
// Seed A: one sitting raises forage_help across 5 turns (kind only on
// the commit turn), one sitting raises heal_help across 3 turns, one
// sitting raises ask_favor for 4 turns with NO kind ever (the no-kind
// shape), one sitting with no want at all.
const seedA = seedJson(900001, [
  sit(5, 'Ana', 'accept', [
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'dlg:commit', wantId: 'ask_favor', wantFavorKind: 'forage_help' },
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'dlg:more', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
  ]),
  sit(6, 'Bo', 'accept', [
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'dlg:commit', wantId: 'ask_favor', wantFavorKind: 'heal_help' },
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
  ]),
  sit(7, 'Cy', 'accept', [
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'alive:want:ask_favor', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'goon', wantId: 'ask_favor', wantFavorKind: null },
    { id: 'dlg:subject', wantId: 'ask_favor', wantFavorKind: null },
  ]),
  sit(8, 'Dee', 'accept', [
    { id: 'goon', wantId: null, wantFavorKind: null },
    { id: 'dlg:more', wantId: 'curious', wantFavorKind: null },
  ]),
  sit(9, 'Eli', 'work', [
    { id: 'dlg:favor_action', wantId: 'ask_favor', wantFavorKind: 'forage_help' },
  ]),
]);
// Seed B: zero raises — every sit shows other wants only.
const seedB = seedJson(900002, [
  sit(5, 'Fay', 'accept', [{ id: 'goon', wantId: 'curious', wantFavorKind: null }]),
  sit(6, 'Gus', 'start', [{ id: 'goon', wantId: null, wantFavorKind: null }]),
]);
fs.writeFileSync(path.join(tmp, 'journey-establishment-r221-seed900001.json'), JSON.stringify(seedA));
fs.writeFileSync(path.join(tmp, 'journey-establishment-r221-seed900002.json'), JSON.stringify(seedB));

const out = execFileSync(process.execPath, [
  path.join(__dirname, 'analyze-journey-establishment-r221-20261116.js'), '900001', '900002',
], { env: { ...process.env, EVID: tmp }, encoding: 'utf8' });

let pass = 0;
function check(name, cond) { assert.ok(cond, name); pass++; console.log('PASS: ' + name); }

// Panel: 3 raised sits out of 6 social sits (seed A: 3/4; seed B: 0/2).
// The 'work'-mode sit is NOT in the denominator.
check('panel raise rate reads 3/6', /panel 3\/6 social sits raised ask_favor/.test(out));
check('zero-raise seeds reads 1/2', /zero-raise seeds 1\/2/.test(out));
check('zero-raise + no-want seeds reads 0/2 (seed B shows other wants)',
  /zero-raise \+ no-want seeds 0\/2/.test(out));
// Kinds are PER SIT: forage_help 1 (not 3 picks), heal_help 1, no-kind 1.
check('seed A kinds are per-sit {forage_help:1, heal_help:1, (no-kind):1}',
  /seed 900001: want-raise 3\/4[\s\S]*?kinds \{"forage_help":1,"heal_help":1,"\(no-kind\)":1\}/.test(out));
check('seed B line reads 0/2 with watch flag (any-want sits 1: Gus shows no want)',
  /seed 900002: want-raise 0\/2 social sits raised ask_favor \(any-want sits 1\); kinds \{\} — ZERO-RAISE \(watch\)/.test(out));
check('panel kinds total forage_help 1 heal_help 1 no-kind 1',
  /ask_favor kinds panel: \{"forage_help":1,"heal_help":1,"\(no-kind\)":1\}/.test(out));
// The any-want denominator: seed A 4/4 (every social sit showed a want),
// seed B 1/2 (Fay curious, Gus none) — so the no-want defect shape
// fires on neither (seed B still shows a want on one sit).
check('any-want sits read 5/6', /any-want sits 5\/6/.test(out));

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`test-journey-establishment-r221-want-raise: ${pass} pass, 0 fail`);
