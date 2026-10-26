#!/usr/bin/env node
// scripts/test-freshtransient-a.js — proof for sim-freshtransient-a.
// Unit: snap ordering (rise inside daily => post catches it the
// same day, pre only the next day), class assignment for the
// transient shape, and the natpair type-bug preservation.
// Corpus (when evidence/2026-10-26/perseed-sim-freshtransient-a/
// exists): detgate MATCH recorded by the sweep's --detgate mode
// (plain driveoff-clean vs driveoff-clean + snaps on the
// non-transient seed 73671 — trajectories identical), the
// positive-control capture on seed 73673 (post-snap national
// present, pre-snap absent, day + rose-inside-daily direction
// located in the rank trace), fresh rows 8/8 classified, and
// band recomputation vs summary.json.
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
// Snap ordering: a rise inside base.daily is caught by the post
// snap that day and by the pre snap only the next day.
check('post-explained-transient class (ts present, snap absent, post national)',
  classifyPairing(row({ nationalEver: 0, maxRank: 'regional', postMaxRank: 'national', tsNationalDay: 86 })).cls === 'post-explained-transient');
check('transient-ts-only without post catch is still a mismatch, not paired',
  classifyPairing(row({ nationalEver: 0, maxRank: 'regional', postMaxRank: 'regional', tsNationalDay: 86 })).newPaired === false
  && classifyPairing(row({ nationalEver: 0, maxRank: 'regional', postMaxRank: 'regional', tsNationalDay: 86 })).cls === 'transient-ts-only');
check('agree reached (snap + ts + max all say national)',
  classifyPairing(row({ nationalEver: 1, maxRank: 'global', tsNationalDay: 77 })).cls === 'agree');
check('old literal paired still false on a transient (type bug preserved)',
  classifyPairing(row({ nationalEver: 0, maxRank: 'regional', postMaxRank: 'national', tsNationalDay: 86 })).oldPaired === false);
check('old literal paired still false on agreement (type bug preserved)',
  classifyPairing(row({ nationalEver: 1, maxRank: 'global', tsNationalDay: 77 })).oldPaired === false);

const evidDir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-sim-freshtransient-a');
const freshSeeds = [73901, 73902, 73903, 73904, 73905, 73906, 73907, 73908];
// Detgate artifact (written by the sweep's --detgate mode, per-seed
// filename so a second detgate seed never overwrites the first).
const detPath = path.join(evidDir, 'detgate-73671.json');
if (fs.existsSync(detPath)) {
  const det = JSON.parse(fs.readFileSync(detPath, 'utf8'));
  check('detgate recorded for non-transient seed 73671', det.seed === 73671, det);
  check('detgate neutrality: wrapped vs plain trajectories identical (days/gameDays/won/deaths/ts)',
    det.match === true, det);
} else {
  console.log('NOTE detgate.json not present yet — detgate checks skipped (run the sweep --detgate mode first).');
}
// Positive control: seed 73673, driveoff-clean + snaps.
const pcPath = path.join(evidDir, 's73673-freshtransient.json');
if (fs.existsSync(pcPath)) {
  const pc = JSON.parse(fs.readFileSync(pcPath, 'utf8'));
  check('positive control row is the driveoff-clean policy', pc.policy === 'freshtransient' && pc.seed === 73673);
  check('positive control: tsNationalDay present (seat leg saw national)', pc.tsNationalDay != null, pc.tsNationalDay);
  check('positive control: pre-daily snap MISSED national (nationalEver 0, maxRank below national)',
    pc.nationalEver === 0 && !(pc.maxRank === 'national' || pc.maxRank === 'global'), [pc.nationalEver, pc.maxRank]);
  check('positive control: post-daily snap CAUGHT national (postMaxRank national/global)',
    pc.postMaxRank === 'national' || pc.postMaxRank === 'global', pc.postMaxRank);
  check('positive control: postNationalDay equals tsNationalDay (caught the same day)',
    pc.postNationalDay === pc.tsNationalDay, [pc.postNationalDay, pc.tsNationalDay]);
  check('positive control: rank trace locates a rose-inside-daily day (pre<2, post>=2 on the ts day)',
    (pc.rankTrace || []).some(x => x.day === pc.tsNationalDay && x.pre < 2 && x.post >= 2),
    (pc.rankTrace || []).filter(x => x.day === pc.tsNationalDay));
  check('positive control: class is post-explained-transient',
    pc.pairing && pc.pairing.cls === 'post-explained-transient', pc.pairing);
  check('positive control: table invited (the transient mattered)',
    pc.table === 1, pc.table);
} else {
  console.log('NOTE positive-control row not present yet — positive-control checks skipped (run --one freshtransient 73673 first).');
}
// Fresh band corpus.
if (fs.existsSync(path.join(evidDir, 'summary.json'))) {
  const rows = [];
  for (const s of freshSeeds) {
    const p = path.join(evidDir, `s${s}-freshtransient.json`);
    check(`fresh row exists s${s}`, fs.existsSync(p));
    if (fs.existsSync(p)) rows.push(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
  check('fresh rows 8/8', rows.length === 8);
  check('fresh rows all classified', rows.every(r => r.pairing && r.pairing.cls !== 'unclassified'), rows.map(r => [r.seed, r.pairing && r.pairing.cls]));
  check('fresh stored pairing recomputes from row fields',
    rows.every(r => {
      const c = classifyPairing({ nationalEver: r.nationalEver, maxRank: r.maxRank, finalRank: r.finalRank, postMaxRank: r.postMaxRank, tsNationalDay: r.tsNationalDay });
      return c.cls === r.pairing.cls && c.newPaired === r.pairing.newPaired && c.oldPaired === r.pairing.oldPaired;
    }));
  const sum = JSON.parse(fs.readFileSync(path.join(evidDir, 'summary.json'), 'utf8'));
  check('band wins recompute', sum.band.won === rows.reduce((t, r) => t + r.won, 0));
  check('band deaths recompute', sum.band.deathTotal === rows.reduce((t, r) => t + r.deathTotal, 0));
  check('band nationalEver recomputes', sum.band.nationalEver === rows.reduce((t, r) => t + r.nationalEver, 0));
  check('band fresh transient count recomputes',
    sum.band.freshTransients === rows.filter(r => r.pairing.cls === 'transient-ts-only' || r.pairing.cls === 'post-explained-transient').length);
  check('summary pairing rows match per-seed rows', sum.pairing.length === 8 && sum.pairing.every(x => {
    const r = rows.find(y => y.seed === x.seed);
    return r && x.cls === r.pairing.cls && x.tsNationalDay === r.tsNationalDay && x.natEver === r.nationalEver;
  }));
  check('corpusOk true', sum.corpusOk === true);
} else {
  console.log('NOTE fresh corpus summary not present yet — fresh corpus checks skipped (run the fresh band + --summary first).');
}
console.log(`test-freshtransient-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
