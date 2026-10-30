// test-journey-deepening-r71-instruments-20261030.js -- PROOF TEST for the
// r71 deepening instruments (driver-only, zero src/js).
// Asserts: (a) the r71 driver carries the r69 census wraps + instruments +
// r71 output filenames + SEED_PAGER day-gate consts; (a3) no r69 output
// filenames left; (b) pickChoice, subjectPivotPick and pagerPick are
// byte-identical to r70 (panel picker + hunt arms unchanged); (c) the
// runConversation turn loop uses pivotOn/pagerOn locals (day-gated) and
// never the bare SUBJECT_PIVOT/PAGER_PROBE globals; (d) the r71 analyzer
// reads r71 seed JSONs and reports PAGE-VISIBILITY + seededRepeat.
// Usage: node scripts/test-journey-deepening-r71-instruments-20261030.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r71-20261030.js');
const DRIVER70 = path.join(__dirname, 'journey-deepening-r70-20261030.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r71-20261030.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
const src69 = fs.readFileSync(DRIVER70, 'utf8');
const ana = fs.readFileSync(ANALYZER, 'utf8');
check('(a) driver contains census wraps + r71 outputs + SEED gate consts',
  src.includes('function wrapTeachCensus(G, ctx, dayFn)') && src.includes('function wrapDropCensus(G, ctx, dayFn)') &&
  src.includes('journey-deepening-r71-seed${seed}.json') && src.includes('journey-deepening-r71-transcript-') &&
  src.includes('offeredSkillTurns') && src.includes('offeredSkillSittings') && src.includes('gateWhy') &&
  src.includes('function subjectPivotPick(') && src.includes('pivotRecords') && src.includes('PIVOT65') &&
  src.includes('function pagerPick(') && src.includes('pagerRecords') && src.includes('PAGER66') &&
  src.includes("const SEED_PAGER = process.env.SEED_PAGER === '1'") &&
  src.includes("const SEED_PAGER_DAY = parseInt(process.env.SEED_PAGER_DAY || '45', 10)") &&
  src.includes('const pivotOn = SUBJECT_PIVOT && (!SEED_PAGER || day === SEED_PAGER_DAY)') &&
  src.includes('const pagerOn = PAGER_PROBE && (!SEED_PAGER || day === SEED_PAGER_DAY)') &&
  src.includes('journey-deepening-r71-prereg.md'));
check('(a3) no r70 output filenames left',
  !src.includes('journey-deepening-r70-seed') && !src.includes('journey-deepening-r70-transcript-'));
const slice = (s, from, to) => {
  const a = s.indexOf(from);
  if (a < 0) return null;
  const b = to ? s.indexOf(to, a + from.length) : s.length;
  if (b < 0) return null;
  return s.slice(a, b);
};
check('(b) pickChoice byte-identical to r70',
  slice(src, 'function pickChoice(', '\nconst CONVO_DAYS') === slice(src69, 'function pickChoice(', '\nconst CONVO_DAYS'));
check('(b) subjectPivotPick byte-identical to r70',
  slice(src, 'function subjectPivotPick(', 'function pagerPick(') === slice(src69, 'function subjectPivotPick(', 'function pagerPick('));
check('(b) pagerPick byte-identical to r70',
  slice(src, 'function pagerPick(', 'function pickChoice(') === slice(src69, 'function pagerPick(', 'function pickChoice('));
{
  const loop = slice(src, '    for (let turn = 0; turn < 8; turn++) {', "    // R66: flush a walk still open when the sitting ends");
  check('(c) turn loop uses pivotOn/pagerOn, never bare globals',
    loop !== null && loop.includes('pagerOn') && loop.includes('pivotOn') &&
    !loop.includes('PAGER_PROBE') && !loop.includes('SUBJECT_PIVOT'));
  check('(c) sitting-end flush uses pagerOn',
    src.includes("if (pagerOn) closePager('sitting-ended');"));
}
check('(d) analyzer reads r71 JSONs + page-visibility + seededRepeat',
  ana.includes('journey-deepening-r71-seed') && ana.includes('PAGE-VISIBILITY') &&
  ana.includes('seededRepeat') && ana.includes('SEEDED-REPEAT') && ana.includes('TOTAL r71:') && ana.includes('journey-deepening-r71-transcript-') && !ana.includes('journey-deepening-r69-transcript-') && !ana.includes('journey-deepening-r70-transcript-'));
check('(d) analyzer has no r70 seed filenames',
  !ana.includes('journey-deepening-r70-seed'));
if (fail) { console.log(`RESULT: ${fail} FAILURES`); process.exit(1); }
console.log('RESULT: ALL PASS');
