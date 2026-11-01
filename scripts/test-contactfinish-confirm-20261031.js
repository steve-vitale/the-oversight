#!/usr/bin/env node
// test-contactfinish-confirm-20261031.js — sim-contactfinish-a CONFIRM leg
// proof: asserts the six preregistered bars on the 12-seed confirm band
// alone (never pooled into the pilot), plus the instrument-mismatch
// accounting (engine attempts vs analyzer spear-counts-as-melee universe).
// Reads only the confirm corpora; runs no sims. Exit 1 on any failure.
// Usage: node scripts/test-contactfinish-confirm-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-31');
const SEEDS = [87103, 87107, 87120, 87121, 87126, 87128, 87132, 87134, 87135, 87137, 87138, 87141];
const AN = require(path.join(REPO, 'scripts', 'contactfinish-analyze-20261031.js'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS: ' + name + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); }
  else { fail++; console.log('FAIL: ' + name + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); }
}

function loadLeg(leg) {
  const perSeed = [];
  for (const seed of SEEDS) {
    const f = path.join(EVID, 'perseed-contactfinish-' + leg + '-confirm', 'leadfeast', 's' + seed + '.json');
    const obj = JSON.parse(fs.readFileSync(f, 'utf8'));
    perSeed.push({ seed, obj, a: AN.analyzeSeed(obj) });
  }
  return perSeed;
}

const base = loadLeg('baseline');
const lever = loadLeg('lever');
const sum = (arr, fn) => arr.reduce((x, s) => x + (fn(s) || 0), 0);
const median = (xs) => { const s = xs.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const bBand = { national: sum(base, s => s.a.national), table: sum(base, s => s.a.table), won: sum(base, s => s.a.won),
  wave4: sum(base, s => s.a.wave4), wave5: sum(base, s => s.a.wave5), median: median(base.map(s => s.a.gameDays)),
  max: Math.max.apply(null, base.map(s => s.a.gameDays)), w3Deaths: sum(base, s => s.a.w3Deaths) };
const lBand = { national: sum(lever, s => s.a.national), table: sum(lever, s => s.a.table), won: sum(lever, s => s.a.won),
  wave4: sum(lever, s => s.a.wave4), wave5: sum(lever, s => s.a.wave5), median: median(lever.map(s => s.a.gameDays)),
  max: Math.max.apply(null, lever.map(s => s.a.gameDays)), w3Deaths: sum(lever, s => s.a.w3Deaths) };
const attempted = sum(lever, s => s.a.attemptedN);
const converted = sum(lever, s => s.a.convertedN);
const remainingFinishable = sum(lever, s => s.a.finishableMfleeN);
const universe = attempted + remainingFinishable;
const lies = sum(lever, s => s.a.driveOffLiesN);
const lines = sum(lever, s => s.a.driveOffLinesN);

// Row-level instrument accounting on the lever leg.
let attemptOutside = 0, unarmedConverted = 0, attemptDeaths = 0;
const attemptOutsideRows = [], unarmedConvertedRows = [], attemptDeathRows = [];
for (const s of lever) {
  for (const f of (s.obj.fieldFights || []).filter(r => r.wave === 3)) {
    if (f.contactFinishAttempted) {
      const u = AN.classifyUniverse(f);
      if (u.cls !== 'FINISHABLE') { attemptOutside++; attemptOutsideRows.push({ seed: s.seed, day: f.day, vid: f.vid, mid: f.mid, cls: u.cls }); }
      if (f.outcome === 'vDie') { attemptDeaths++; attemptDeathRows.push({ seed: s.seed, day: f.day, vid: f.vid, mid: f.mid }); }
    }
    if (f.contactFinishKill) {
      const u = AN.classifyUniverse(f);
      if (u.cls !== 'FINISHABLE') { unarmedConverted++; unarmedConvertedRows.push({ seed: s.seed, day: f.day, vid: f.vid, mid: f.mid, cls: u.cls }); }
    }
  }
}

console.log('confirm band: baseline ' + JSON.stringify(bBand));
console.log('confirm band: lever ' + JSON.stringify(lBand));
console.log('universe: attempted=' + attempted + ' remainingFinishable=' + remainingFinishable + ' universe=' + universe + ' converted=' + converted);

check('bar1: converted >= 50% of judged finishable meetings', universe > 0 && converted * 2 >= universe, { converted, universe, rate: universe ? converted / universe : null });
check('bar2: unarmed meetings converted = 0', unarmedConverted === 0, { unarmedConverted, rows: unarmedConvertedRows });
check('bar3: deaths attributable to contact-finish attempts = 0', attemptDeaths === 0, { attemptDeaths, rows: attemptDeathRows });
check('bar4: median survival >= baseline -10%', lBand.median >= bBand.median * 0.9, { leverMedian: lBand.median, baselineMedian: bBand.median, bar: bBand.median * 0.9 });
check('bar5: wave>=3 field deaths <= baseline + 2', lBand.w3Deaths <= bBand.w3Deaths + 2, { lever: lBand.w3Deaths, baseline: bBand.w3Deaths, bar: bBand.w3Deaths + 2 });
check('bar6: lie rate on remaining drive-off lines = 0', lies === 0, { lies, lines });
check('mismatch: no engine attempt outside analyzer universe', attemptOutside === 0, { attemptOutside, rows: attemptOutsideRows });
check('mismatch: no analyzer-universe row left unattempted (remaining finishable = 0)', remainingFinishable === 0, { remainingFinishable });
check('baseline leg: zero attempts (no rule on baseline)', sum(base, s => s.a.attemptedN) === 0, { baseAttempted: sum(base, s => s.a.attemptedN) });
console.log('win-dip (NOT a bar, reported): baseline table/won ' + bBand.table + '/' + bBand.won + ' lever table/won ' + lBand.table + '/' + lBand.won);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
