#!/usr/bin/env node
// Proof: journey-landing r37 — the r30/r34 death-liturgy + theft counters
// bled across seeds (module-level MET, never reset). Seed 312's census
// reported griefBeats=3, but the game emitted the beat once; 2 of the 3
// were seed 311's beats carried over (309:0, 310:0, 311:2, 312:1 emitted;
// census showed 0,0,2,3 = cumulative).
//
// RED: the pre-fix reset block (flesh counters only) leaves griefBeats=2
//   in place — the bleed.
// GREEN: the fixed reset block (flesh + r34 counters) zeroes them, and the
//   driver's actual reset block in journey-landing-r37-20261022.js contains
//   the r34 keys.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const DRIVER = path.join(__dirname, 'journey-landing-r37-20261022.js');
const src = fs.readFileSync(DRIVER, 'utf8');

const R34_KEYS = ['griefBeats', 'headcountCodas', 'caughtRedHanded'];
const R34_BUFS = ['griefBeatLines', 'headcountCodaLines', 'caughtRedHandedLines', 'deathLineSamples'];

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name); }
}

// --- RED: the old reset block (flesh only) does not clear r34 counters ---
function oldReset(MET) {
  for (const k of ['fleshHaulsSeen', 'fleshDeposits', 'fleshExperiments',
    'fleshReveals', 'fleshPoisonVerdicts', 'fleshRotLines']) MET[k] = 0;
  MET.fleshExperimentLines = []; MET.fleshHaulSeenLines = [];
}
{
  const MET = { griefBeats: 2, griefBeatLines: ['a', 'b'], headcountCodas: 1, caughtRedHanded: 1 };
  oldReset(MET);
  ok('RED: old reset leaves griefBeats=2 (the bleed)', MET.griefBeats === 2);
  ok('RED: old reset leaves griefBeatLines intact', MET.griefBeatLines.length === 2);
}

// --- GREEN: the new reset block clears them ---
function newReset(MET) {
  for (const k of ['fleshHaulsSeen', 'fleshDeposits', 'fleshExperiments',
    'fleshReveals', 'fleshPoisonVerdicts', 'fleshRotLines']) MET[k] = 0;
  MET.fleshExperimentLines = []; MET.fleshHaulSeenLines = [];
  for (const k of ['griefBeats', 'headcountCodas', 'caughtRedHanded']) MET[k] = 0;
  MET.griefBeatLines = []; MET.headcountCodaLines = [];
  MET.caughtRedHandedLines = []; MET.deathLineSamples = [];
}
{
  const MET = { griefBeats: 2, griefBeatLines: ['a', 'b'], headcountCodas: 1,
    headcountCodaLines: ['c'], caughtRedHanded: 1, caughtRedHandedLines: ['d'],
    deathLineSamples: ['e'], fleshHaulsSeen: 5 };
  newReset(MET);
  ok('GREEN: new reset zeroes griefBeats', MET.griefBeats === 0);
  ok('GREEN: new reset clears griefBeatLines', MET.griefBeatLines.length === 0);
  ok('GREEN: new reset zeroes headcountCodas + clears buffer', MET.headcountCodas === 0 && MET.headcountCodaLines.length === 0);
  ok('GREEN: new reset zeroes caughtRedHanded + clears buffer', MET.caughtRedHanded === 0 && MET.caughtRedHandedLines.length === 0);
  ok('GREEN: new reset clears deathLineSamples', MET.deathLineSamples.length === 0);
  ok('GREEN: new reset keeps the flesh reset', MET.fleshHaulsSeen === 0);
}

// --- the driver's actual reset block contains the r34 keys (fix is live) ---
{
  const m = src.match(/\/\/ r37: the r30\/r34 death-liturgy[\s\S]*?MET\.deathLineSamples = \[\];/);
  ok('driver carries the r37 reset comment', !!m);
  for (const k of R34_KEYS.concat(R34_BUFS)) {
    ok('driver reset block mentions ' + k, m ? m[0].includes(k) : false);
  }
  // and it sits inside runSeed (per-seed), not module scope
  const runSeedIdx = src.indexOf('async function runSeed(seed)');
  ok('reset block is inside runSeed', m ? src.indexOf(m[0]) > runSeedIdx : false);
}

// --- the driver's verbatim check is quote-normalized (r37 second fix) ---
{
  const stripQuotes = (s) => String(s || '').trim().replace(/^"+|"+$/g, '').trim();
  const themT = [
    'I record the arguments too. Especially the arguments. That\'s the real history.',
    '"I record the arguments too. Especially the arguments. That\'s the real history."',
    'Something else entirely.',
  ];
  const oldDupes = themT.filter((x, i) => themT.indexOf(x) !== i);
  ok('RED: old verbatim check misses the quote-differentiated repeat', oldDupes.length === 0);
  const themNorm = themT.map(stripQuotes);
  const newDupes = themNorm.filter((x, i) => themNorm.indexOf(x) !== i);
  ok('GREEN: quote-normalized check catches it', newDupes.length === 1);
  const m2 = src.match(/const stripQuotes = \(s\) =>/);
  ok('driver carries the stripQuotes normalizer', !!m2);
}

console.log(fail === 0 ? `\nGREEN: ${pass} passed, 0 failed` : `\nRED: ${fail} failed, ${pass} passed`);
process.exit(fail === 0 ? 0 : 1);
