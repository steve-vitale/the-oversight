#!/usr/bin/env node
// scripts/test-natpair-a.js — proof for sim-natpair-a.
// Unit: pairing math on every witness combination (old literal
// strict-equality vs revised like-for-like), class assignment,
// and the H-type proof (1 === true is false in JS).
// Corpus (when evidence/2026-10-26/perseed-sim-natpair-a/ exists):
// 8/8 rows, band recomputation vs summary.json, classification
// completeness, OLDPAIRED false on all rows, NEWPAIRED/class
// consistency, and leg-(c) national-ever vs the 0126Z 6/8.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyPairing } = require('./test-natpair-sweep');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function row(o) {
  return Object.assign({ nationalEver: 0, maxRank: 'regional', finalRank: 'regional', postMaxRank: 'regional', tsNationalDay: null }, o);
}
// H-type: JS strict equality number vs boolean is never true.
check('js 1===true is false', (1 === true) === false);
check('js 0===false is false', (0 === false) === false);
check('js 1===true literal in classify path', classifyPairing(row({ nationalEver: 1, tsNationalDay: 77 })).oldPaired === false);
check('js 0===false literal in classify path', classifyPairing(row({ nationalEver: 0, tsNationalDay: null })).oldPaired === false);
// Revised rule: like-for-like numbers.
check('new paired national reached', classifyPairing(row({ nationalEver: 1, maxRank: 'global', finalRank: 'regional', tsNationalDay: 77 })).newPaired === true);
check('new paired national not reached', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', tsNationalDay: null })).newPaired === true);
check('new mismatch transient', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', tsNationalDay: 86 })).newPaired === false);
check('new mismatch snap-only', classifyPairing(row({ nationalEver: 1, maxRank: 'national', tsNationalDay: null })).newPaired === false);
// Classes.
check('class agree reached', classifyPairing(row({ nationalEver: 1, maxRank: 'global', tsNationalDay: 77 })).cls === 'agree');
check('class agree not reached', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', tsNationalDay: null })).cls === 'agree');
check('class transient-ts-only', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', tsNationalDay: 86 })).cls === 'transient-ts-only');
check('class post-explained-transient', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', postMaxRank: 'national', tsNationalDay: 86 })).cls === 'post-explained-transient');
check('class snap-only', classifyPairing(row({ nationalEver: 1, maxRank: 'national', tsNationalDay: null })).cls === 'snap-only');
check('class final-only', classifyPairing(row({ nationalEver: 1, maxRank: 'regional', finalRank: 'national', tsNationalDay: 77 })).cls === 'final-only');
// MAXAGREE: maxRank agrees with snapNat, final-rank edge excluded.
check('maxAgree reached', classifyPairing(row({ nationalEver: 1, maxRank: 'national', tsNationalDay: 77 })).maxAgree === true);
check('maxAgree not reached', classifyPairing(row({ nationalEver: 0, maxRank: 'regional', tsNationalDay: null })).maxAgree === true);
check('maxAgree false on final-only', classifyPairing(row({ nationalEver: 1, maxRank: 'regional', finalRank: 'national', tsNationalDay: 77 })).maxAgree === false);
// Old corpus spot checks (read-only, context): devotiongate stored paired false even where witnesses agree.
const devSumPath = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-sim-devotiongate-a', 'summary.json');
if (fs.existsSync(devSumPath)) {
  const dev = JSON.parse(fs.readFileSync(devSumPath, 'utf8'));
  const all = dev.nationalPairing.map(x => x.control).concat(dev.nationalPairingDev.map(x => x.devotiongate));
  check('devotiongate stored paired false 16/16', all.length === 16 && all.every(v => v.paired === false), all.length);
  check('devotiongate substantive agreement 16/16 (snap boolean == ts present, max agrees)',
    all.every(x => {
      const v = x;
      return (v.nationalEver === 1) === (v.tsNationalDay != null)
        && ((v.maxRank === 'national' || v.maxRank === 'global') === (v.nationalEver === 1));
    }));
}
// Fresh corpus checks.
const evidDir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-sim-natpair-a');
const seeds = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
if (fs.existsSync(path.join(evidDir, 'summary.json'))) {
  const rows = [];
  for (const s of seeds) {
    const p = path.join(evidDir, `s${s}-natpair.json`);
    check(`fresh row exists s${s}`, fs.existsSync(p));
    if (fs.existsSync(p)) rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  check('fresh rows 8/8', rows.length === 8);
  check('fresh rows all classified', rows.every(r => r.pairing && r.pairing.cls !== 'unclassified'), rows.map(r => [r.seed, r.pairing && r.pairing.cls]));
  check('fresh OLDPAIRED false on all rows (H-type reproduces)', rows.every(r => r.pairing.oldPaired === false), rows.map(r => [r.seed, r.pairing.oldPaired]));
  check('fresh stored pairing recomputes from row fields',
    rows.every(r => {
      const c = classifyPairing({ nationalEver: r.nationalEver, maxRank: r.maxRank, finalRank: r.finalRank, postMaxRank: r.postMaxRank, tsNationalDay: r.tsNationalDay });
      return c.cls === r.pairing.cls && c.newPaired === r.pairing.newPaired && c.oldPaired === r.pairing.oldPaired;
    }));
  const sum = JSON.parse(fs.readFileSync(path.join(evidDir, 'summary.json'), 'utf8'));
  const bandNat = rows.reduce((t, r) => t + r.nationalEver, 0);
  check('band nationalEver recomputes', sum.band.nationalEver === bandNat, [sum.band.nationalEver, bandNat]);
  check('band deaths recompute', sum.band.deathTotal === rows.reduce((t, r) => t + r.deathTotal, 0));
  check('band wins recompute', sum.band.won === rows.reduce((t, r) => t + r.won, 0));
  check('summary pairing rows match per-seed rows', sum.pairing.length === 8 && sum.pairing.every(x => {
    const r = rows.find(y => y.seed === x.seed);
    return r && x.cls === r.pairing.cls && x.tsNationalDay === r.tsNationalDay && x.natEver === r.nationalEver;
  }));
  check('leg (c) nationalEver 6/8', bandNat === 6, bandNat);
  check('corpusOk true', sum.corpusOk === true);
} else {
  console.log('NOTE fresh corpus summary not present yet — corpus checks skipped (unit checks above still apply).');
}
console.log(`test-natpair-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
