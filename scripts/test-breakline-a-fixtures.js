#!/usr/bin/env node
// scripts/test-breakline-a-fixtures.js — sim-breakline-a classifier proofs.
// DIAG ONLY: pure functions + read-only corpus reads, never game state.
// 1. Synthetic branch fixtures: one flag/line set per branch class plus
//    priority edges (cap beats drive-off; hopeless line beats learn
//    line; floor with hopeless=true lands FLOOR-BRANCH with sub
//    floor-hopeless-true, NOT HOPELESS-BRANCH — the exact confusion
//    the flag taxonomy cannot resolve).
// 2. Corpus equivalence: on every wave-3/4 fought fight in the w4dpr2
//    corpus (where the verbatim log exists), classifyFlags built from
//    the w4dpr record's flags + a capLine derived from its stored log
//    must EQUAL w4dpr2-lib classifyBreak on the same fight; and
//    classifyBranch must agree with classifyBreak on every NON-vFlee
//    class (KILL/CAP/DRIVE-OFF/PARTY-DEATH). The vFlee split is
//    reported as a matrix (branch x flag), never forced to agree.
// 3. Synthetic flag fixtures for classifyFlags priority (hopeless
//    flag beats learn flag; trick-exit only when neither flag set).
// Exit 1 on any failure. Prints FIXTURES-PASS on green.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyBranch, classifyFlags } = require('./breakline-lib');
const { classifyBreak } = require('./w4dpr2-lib');

let checks = 0, fails = 0;
function check(name, got, want) {
  checks++;
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g !== w) { fails++; console.log(`FAIL ${name}: got=${g} want=${w}`); }
}
function base(over) { return Object.assign({ outcome: 'vFlee', rounds: 2, capLine: false, hopelessLine: false, learnLine: false, fleeWise: false, fleeHopeless: false, fleeLearn: false, trickLog: [] }, over); }

// 1. Branch fixtures.
check('branch KILL', classifyBranch(base({ outcome: 'vKill' })).reason, 'KILL');
check('branch CAP-vFlee', classifyBranch(base({ outcome: 'vFlee', rounds: 15, capLine: true })).reason, 'CAP');
check('branch CAP-mFlee', classifyBranch(base({ outcome: 'mFlee', rounds: 15, capLine: true })).reason, 'CAP');
check('branch CAP-beats-driveoff', classifyBranch(base({ outcome: 'mFlee', rounds: 15, capLine: true })).reason, 'CAP');
check('branch DRIVE-OFF', classifyBranch(base({ outcome: 'mFlee' })).reason, 'DRIVE-OFF');
check('branch PARTY-DEATH', classifyBranch(base({ outcome: 'vDie' })).reason, 'PARTY-DEATH');
check('branch HOPELESS', classifyBranch(base({ hopelessLine: true })).reason, 'HOPELESS-BRANCH');
check('branch HOPELESS-beats-learn-line', classifyBranch(base({ hopelessLine: true, learnLine: true })).reason, 'HOPELESS-BRANCH');
check('branch HOPELESS-with-learn-flag', classifyBranch(base({ hopelessLine: true, fleeLearn: true })).reason, 'HOPELESS-BRANCH');
check('branch LEARN', classifyBranch(base({ learnLine: true })).reason, 'LEARN-BRANCH');
check('branch TRICK-EXIT', classifyBranch(base({ fleeWise: true })).reason, 'TRICK-EXIT');
check('branch FLOOR-false', classifyBranch(base({})).reason, 'FLOOR-BRANCH');
check('branch FLOOR-false-sub', classifyBranch(base({})).sub, 'floor-hopeless-false');
check('branch FLOOR-true', classifyBranch(base({ fleeHopeless: true })).reason, 'FLOOR-BRANCH');
check('branch FLOOR-true-sub', classifyBranch(base({ fleeHopeless: true })).sub, 'floor-hopeless-true');
check('branch OTHER-evade', classifyBranch(base({ outcome: 'evade', rounds: 0 })).reason, 'OTHER');
// 3. Flag fixtures (w4dpr priority).
check('flag HOPELESS-beats-learn', classifyFlags(base({ fleeHopeless: true, fleeLearn: true })).reason, 'HOPELESS');
check('flag LEARN', classifyFlags(base({ fleeLearn: true })).reason, 'LEARN-WITHDRAWAL');
check('flag TRICK-after-flags', classifyFlags(base({ fleeWise: true })).reason, 'TRICK-EXIT');
check('flag TRICK-blocked-by-hopeless', classifyFlags(base({ fleeWise: true, fleeHopeless: true })).reason, 'HOPELESS');
check('flag WOUND-FLOOR', classifyFlags(base({})).reason, 'WOUND-FLOOR');
check('flag CAP', classifyFlags(base({ outcome: 'vFlee', rounds: 15, capLine: true })).reason, 'CAP');

// 2. Corpus equivalence on the w4dpr2 corpus (read-only).
const w4dir = path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4dpr2');
let corpusFought = 0, flagEqual = 0, nonVFleeEqual = 0, nonVFleeTotal = 0;
const vFleeMatrix = {};
for (let s = 75101; s <= 75116; s++) {
  const row = JSON.parse(fs.readFileSync(path.join(w4dir, `s${s}-fresh.json`), 'utf8'));
  for (const f of (row.w4dpr.meetings || [])) {
    if (!((f.wave === 3 || f.wave === 4) && (f.rounds | 0) >= 1)) continue;
    corpusFought++;
    const log = Array.isArray(f.log) ? f.log : [];
    const capLine = log.some(l => String(l).indexOf('Neither gives after 15 rounds') >= 0);
    const flagInput = Object.assign({}, f, { capLine });
    const verbatim = classifyBreak(f).reason;
    const flags = classifyFlags(flagInput).reason;
    const branch = classifyBranch(Object.assign({}, f, {
      capLine,
      hopelessLine: log.some(l => String(l).indexOf('sees how this ends') >= 0),
      learnLine: log.some(l => String(l).indexOf('has seen enough') >= 0),
    })).reason;
    if (flags === verbatim) flagEqual++; else { fails++; console.log(`FAIL corpus flag mismatch s${s} day=${f.day} mid=${f.mid}: flags=${flags} verbatim=${verbatim}`); }
    if (f.outcome !== 'vFlee') {
      nonVFleeTotal++;
      if (branch === verbatim) nonVFleeEqual++; else { fails++; console.log(`FAIL corpus non-vFlee branch mismatch s${s} day=${f.day} mid=${f.mid}: branch=${branch} verbatim=${verbatim}`); }
    } else {
      const key = branch + '|' + verbatim;
      vFleeMatrix[key] = (vFleeMatrix[key] || 0) + 1;
    }
  }
}
checks += corpusFought; // each fought fight contributes a flag-equality check
console.log(`corpus: fought w3/w4 fights=${corpusFought} flagEqual=${flagEqual} nonVFlee=${nonVFleeEqual}/${nonVFleeTotal}`);
console.log(`vFlee branch|flag matrix: ${JSON.stringify(vFleeMatrix)}`);
if (flagEqual !== corpusFought) { fails++; console.log('FAIL corpus flag equality incomplete'); }
if (nonVFleeEqual !== nonVFleeTotal) { fails++; console.log('FAIL corpus non-vFlee branch equality incomplete'); }

console.log(`FIXTURES: checks=${checks} fails=${fails}`);
if (fails) { console.log('FIXTURES-FAIL'); process.exit(1); }
console.log('FIXTURES-PASS');
