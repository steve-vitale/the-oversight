#!/usr/bin/env node
'use strict';
// Proof test for scripts/gateclassify-parse-20261112.js: the parser must
// recover the exact failure-name list from a check.js --quick log (the list
// the round-6 gate lost to tail buffering), including timeouts, failing legs,
// error lines, totals, and the slowest line.
const T = require('./godpath/lib').reporter('gateclassify-parse');
const { parseCheckLog } = require('./gateclassify-parse-20261112');

const SAMPLE = `check.js: 340 scripts, 4 parallel (quick)
....F.........FF......F..........F....

  FAIL scripts/godpath/test-living-garden-deed-attainment.js (exit null, 120.2s)
      seed 7...
      seed 42...

      [check.js] TIMEOUT after 120s

  FAIL scripts/godpath/test-measurement-proof-update.js (exit 1, 7.6s)
      Error: Proof source inputs are not current
          at Object.validate (/home/hatch/workspace/the-scattering/scripts/balance-proof-update.js:8:76)

      Node.js v24.22.1

  FAIL scripts/godpath/test-measurement-workflow.js (exit 1, 6.7s)
      ok   metric IDs are unique
        FAIL retained neutrality proof covers the current Game/controller/harness inputs
        ok   proof declares every collector

  slowest: scripts/godpath/test-one-person-army-deed-attainment.js 120s, scripts/godpath/test-living-garden-deed-attainment.js 120s, scripts/godpath/test-occupation-panels.js 113s

check.js: 334 passed, 6 failed in 990s
`;

const p = parseCheckLog(SAMPLE);
T.ok('header parsed (340 scripts, 4 parallel)', p.totalScripts === 340 && p.parallel === 4);
T.ok('totals parsed (334 passed, 6 failed, 990s)', p.passed === 334 && p.failed === 6 && p.seconds === 990);
T.ok('all three failure blocks found', p.failures.length === 3);
T.ok('failure names exact, in order',
  p.failures.map(f => f.path).join('|') ===
  'scripts/godpath/test-living-garden-deed-attainment.js|scripts/godpath/test-measurement-proof-update.js|scripts/godpath/test-measurement-workflow.js');
T.ok('timeout flagged only on the timeout block',
  p.failures[0].timeout === true && p.failures[1].timeout === false && p.failures[2].timeout === false);
T.ok('exit codes and times recorded',
  p.failures[0].exit === 'null' && p.failures[0].secs === 120.2 &&
  p.failures[1].exit === '1' && p.failures[1].secs === 7.6);
T.ok('error line captured from the proof-update block',
  p.failures[1].errorLine === 'Error: Proof source inputs are not current');
T.ok('failing leg captured from the workflow block',
  p.failures[2].failingLegs.length === 1 &&
  p.failures[2].failingLegs[0] === 'retained neutrality proof covers the current Game/controller/harness inputs');
T.ok('slowest list parsed (3 entries, times kept)',
  p.slowest.length === 3 && p.slowest[0].path === 'scripts/godpath/test-one-person-army-deed-attainment.js' &&
  p.slowest[0].secs === 120 && p.slowest[2].secs === 113);
T.ok('empty log parses to zero failures without throwing',
  (() => { const e = parseCheckLog(''); return e.failures.length === 0 && e.passed === null; })());
T.ok('log with no failures parses cleanly',
  (() => { const e = parseCheckLog('check.js: 340 scripts, 4 parallel (quick)\ncheck.js: 340 passed, 0 failed in 500s\n'); return e.failures.length === 0 && e.passed === 340 && e.failed === 0; })());
