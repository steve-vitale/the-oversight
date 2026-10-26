#!/usr/bin/env node
// test-stockdoor-b.js — proof for sim-stockdoor-b.
//
// sim-stockdoor-b, 2026-10-26, oversight-flesh-out-loop-b.
// Asserts, against the NEW corpus (evidence/2026-10-26/
// sim-stockdoor-b-corpus/):
//  1. CONTROL: the pre-fourth-door view re-derives the original
//     verdict exactly (neutrality 327/289/38, lag 1x32/2x4/3x1/4x1,
//     median lag 1.0, coverage 36/38, residuals exactly (9750,83)
//     and (9750,84)).
//  2. INSTRUMENT: resid join zero misses, ctxKcalMatch zero
//     mismatches, no truncation flags, stockdoor clock invariant
//     (spoilDay = vDay + 3) on every record.
//  3. DETERMINISM: the new corpus matches the committed resid-b
//     corpus on all 8 seeds on every game-output field (dayTable
//     classes, attribution flags, days alive, deaths, death causes,
//     rank, waveReach, national/table/win, endReason) — the
//     stockdoor wrapper moved nothing.
//  4. FOURTH-DOOR FACTS: seed 9750 day-82 stockSurplus records
//     total exactly 2000 kcal stored, all spoilDay 85, all vDay 82.
//  5. PILE ACCOUNTING: day-83 bound piles exactly the 200x10@85
//     stack; day-84 bound piles exactly the 5-stack decomposition
//     totalling 3567; day-80 stock total 367; day-74 Winner's share
//     pantryAdd total 2400.
//  6. VERDICT FLAG: the analyzer's pre-registered judgment is GO.
// Exit 0 iff all checks pass; prints FAIL lines otherwise.
'use strict';
const fs = require('fs');
const path = require('path');
const { analyze } = require('./analyze-stockdoor-b');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stockdoor-b-corpus');
const failures = [];
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); failures.push(name); }
}

const out = analyze();
check('control neutrality 327/289/38', out.control.neutralityPass, JSON.stringify(out.control.neutrality));
check('control attrFlagMismatch 0', out.control.attrFlagMismatch === 0, String(out.control.attrFlagMismatch));
check('control lag distribution 1x32/2x4/3x1/4x1',
  out.control.lagPass, JSON.stringify(out.control.lagDistribution));
check('control median lag 1.0', out.control.medianLag === 1, String(out.control.medianLag));
check('control coverage 36/38', out.control.coveragePass, JSON.stringify(out.control.coverage));
check('control residuals exactly (9750,83),(9750,84)',
  out.control.residualsPass, JSON.stringify(out.control.residuals));
check('control overall pass', out.control.pass, JSON.stringify(out.control));
check('instrument ctxKcalMatch zero mismatches', out.instrument.ctxMismatch === 0 && out.instrument.ctxChecked > 0,
  JSON.stringify(out.instrument));
check('instrument resid join zero misses', out.instrument.residJoinMiss === 0, JSON.stringify(out.instrument));
check('instrument no truncation flags', out.instrument.truncBad.length === 0, JSON.stringify(out.instrument.truncBad));
check('corpus 8 files', out.files === 8, String(out.files));
check('fourth-door clock invariant spoilDay=vDay+3', out.fourth.clockOkAll === true, JSON.stringify(out.fourth.day82));
check('fourth-door day-82 stored total 2000', out.fourth.day82 && out.fourth.day82.storedTotal === 2000,
  JSON.stringify(out.fourth.day82));
check('fourth-door day-82 all spoilDay 85', !!(out.fourth.day82 && out.fourth.day82.allSpoil85),
  JSON.stringify(out.fourth.day82));
check('fourth-door day-82 all vDay 82', !!(out.fourth.day82 && out.fourth.day82.allVDay82),
  JSON.stringify(out.fourth.day82));
check('fourth-door day-82 all Foraged food', !!(out.fourth.day82 && out.fourth.day82.allForaged),
  JSON.stringify(out.fourth.day82));
check('day-83 bound piles exactly 200x10@85', out.checks.pile83ok === true,
  JSON.stringify(out.piles[83]));
check('day-84 bound piles exactly 5-stack 3567', out.checks.pile84ok === true,
  JSON.stringify(out.piles[84]));
check('day-84 sources: day-80 stock 367, day-74 Winner pantryAdd 2400',
  out.checks.day84SourcesPass === true,
  'stock80=' + out.fourth.stock80Total + ' add74Winner=' + out.fourth.add74WinnerTotal);
check('determinism vs resid-b corpus (8 seeds, game outputs only)',
  out.checks.detPass === true, JSON.stringify(out.checks.detMismatches));
check('wall national/table/wins 0/0/0', out.wall.national === 0 && out.wall.table === 0 && out.wall.win === 0,
  JSON.stringify(out.wall));
check('wall wave4/wave5 0/0', out.wall.wave4 === 0 && out.wall.wave5 === 0, JSON.stringify(out.wall));
check('wall median survival 100d', out.wall.medianDaysAlive === 100, JSON.stringify(out.wall.daysAlive));
check('wall deaths 43', out.wall.deaths === 43, String(out.wall.deaths));
check('verdict GO', out.verdict === 'GO', out.verdict);

// Corpus validity: every file carries stockdoorRecords (the new field).
let missingField = [];
for (const f of fs.readdirSync(CORPUS).filter(x => /^stockdoor-b-cap1-.*\.json$/.test(x))) {
  const d = JSON.parse(fs.readFileSync(path.join(CORPUS, f), 'utf8'));
  if (!Array.isArray(d.stockdoorRecords)) missingField.push(f);
}
check('all corpus files carry stockdoorRecords', missingField.length === 0, JSON.stringify(missingField));

if (failures.length) {
  console.log('FAILURES: ' + failures.length);
  process.exit(1);
}
console.log('ALL CHECKS PASS');
