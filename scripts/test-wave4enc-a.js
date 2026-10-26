#!/usr/bin/env node
// scripts/test-wave4enc-a.js — proof test for sim-wave4enc-a.
//
// Re-derives the sweep's per-seed classification from the corpus rows
// on disk (via the sweep module's own classifySeed) and asserts the
// summary.json numbers equal the recomputation, the G2 neutrality
// identities hold, and the DIAG verdict follows the pre-registered
// rule (GO iff fully-traced seeds >= 6). Exit 1 on any mismatch.
// Usage: node scripts/test-wave4enc-a.js
//   (EVID env overrides the corpus dir; default
//   evidence/2026-10-26/perseed-wave4enc-a.)
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifySeed, bandOf, BAND1816, SEEDS } = require('./test-wave4enc-diag-sweep');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} :: ${detail || ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-26', 'perseed-wave4enc-a');
  const summary = JSON.parse(fs.readFileSync(path.join(evidDir, 'summary.json'), 'utf8'));
  const rows = [];
  for (const seed of SEEDS) {
    for (const pid of ['baseline', 'armed']) {
      rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-${pid}.json`), 'utf8')));
    }
  }
  check('corpus 16 rows', rows.length === 16, `got ${rows.length}`);
  check('all rows days > 0', rows.every(r => r.days > 0));
  check('armed rows carry all four recorders', rows.filter(r => r.policy === 'armed').every(r =>
    Array.isArray(r.wave4enc.fieldFights) && Array.isArray(r.spawnsrc.spawns)
    && Array.isArray(r.fieldfinish.fieldFights) && Array.isArray(r.nonworldkill.starts)));
  check('baseline rows snapshot-only', rows.filter(r => r.policy === 'baseline').every(r => !r.wave4enc && r.note));
  // Per-seed recomputation vs summary.
  for (const seed of SEEDS) {
    const armed = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const c = classifySeed(armed);
    const s = summary.perSeed.find(p => p.seed === seed);
    check(`seed ${seed} classes match summary`, !!s && eq(c.classes, s.classes),
      `recomputed ${JSON.stringify(c.classes)} vs summary ${s ? JSON.stringify(s.classes) : 'missing'}`);
    check(`seed ${seed} partition match summary`, !!s && c.partitionTotal === s.partitionTotal
      && c.spawns4 === s.spawns4 && c.field4 === s.field4 && c.tbInits4 === s.tbInits4 && c.neverFought === s.neverFought,
      `recomputed partition=${c.partitionTotal} spawns4=${c.spawns4} field4=${c.field4} tb=${c.tbInits4} never=${c.neverFought}`);
    check(`seed ${seed} dominant match summary`, !!s && c.dominant === s.dominant && c.dominantN === s.dominantN);
    check(`seed ${seed} fieldfinish match summary`, !!s && eq(c.fieldfinish, s.fieldfinish),
      `recomputed ${JSON.stringify(c.fieldfinish)}`);
    check(`seed ${seed} fullyTraced match summary`, !!s && c.fullyTraced === s.fullyTraced);
    check(`seed ${seed} checks all named`, !!s && ['killsMatched', 'facedCovered', 'fieldCountMatch', 'diagClean'].every(k => k in c.checks));
  }
  // G2 neutrality recomputation.
  for (const seed of SEEDS) {
    const c = rows.find(r => r.policy === 'baseline' && r.seed === seed);
    const a = rows.find(r => r.policy === 'armed' && r.seed === seed);
    const ok = c.days === a.days && c.gameDays === a.gameDays
      && JSON.stringify(c.ts) === JSON.stringify(a.ts) && c.starvationDeaths === a.starvationDeaths;
    check(`seed ${seed} G2 identity`, ok, `baseline ${c.days}/${c.gameDays} vs armed ${a.days}/${a.gameDays}`);
  }
  check('summary G2 pass flag', summary.gates.g2Pass === true);
  check('summary corpus flag', summary.gates.corpusOk === true);
  // Band + re-baseline recomputation.
  const baselineBand = bandOf(rows, 'baseline');
  check('baseline band matches summary', eq(baselineBand, summary.baselineBand));
  const diff = {
    wins: baselineBand.won - BAND1816.wins, nationalEver: baselineBand.nationalEver - BAND1816.nationalEver,
    nationalFinal: baselineBand.nationalFinal - BAND1816.nationalFinal, entered: baselineBand.entered - BAND1816.entered,
    wave4: baselineBand.wave4 - BAND1816.wave4, wave5: baselineBand.wave5 - BAND1816.wave5,
    medianDays: baselineBand.medianDays - BAND1816.medianDays, deaths: baselineBand.deathTotal - BAND1816.deaths,
    starvation: baselineBand.starvationTotal - BAND1816.starvation,
  };
  check('rebaseline diff matches summary', eq(diff, summary.gates.diffVs1816),
    `recomputed ${JSON.stringify(diff)}`);
  // Verdict rule recomputation.
  const fullyTraced = summary.perSeed.filter(p => p.fullyTraced).length;
  const expectedVerdict = (fullyTraced >= 6) ? 'DIAG-GO' : 'DIAG-NO-GO';
  check('verdict follows rule (>= 6 fully-traced)', summary.verdict === expectedVerdict,
    `fullyTraced=${fullyTraced} summary verdict=${summary.verdict}`);
  check('summary fullyTracedSeeds count', summary.fullyTracedSeeds === fullyTraced);
  // Band classes + dominant recomputation.
  const bandClasses = {};
  for (const p of summary.perSeed) for (const k of Object.keys(p.classes)) bandClasses[k] = (bandClasses[k] || 0) + p.classes[k];
  check('band classes match summary', eq(bandClasses, summary.bandClasses));
  let dom = null, domN = 0;
  for (const k of Object.keys(bandClasses)) if (bandClasses[k] > domN) { dom = k; domN = bandClasses[k]; }
  check('band dominant match summary', summary.bandDominant === dom && summary.bandDominantN === domN);
  // Fieldfinish totals recomputation.
  const ffTotals = {
    belowLineArrivals: summary.perSeed.reduce((t, p) => t + p.fieldfinish.belowLineArrivals, 0),
    zeroRoundFlights: summary.perSeed.reduce((t, p) => t + p.fieldfinish.zeroRoundFlights, 0),
    oneHpArrivals: summary.perSeed.reduce((t, p) => t + p.fieldfinish.oneHpArrivals, 0),
    oneHpZeroFlights: summary.perSeed.reduce((t, p) => t + p.fieldfinish.oneHpZeroFlights, 0),
    strictWoundedRepeats: summary.perSeed.reduce((t, p) => t + p.fieldfinish.strictWoundedRepeats, 0),
  };
  check('fieldfinish totals match summary', eq(ffTotals, summary.ffTotals));
  // Wave-4 kills are zero band-wide (the wave5gate finding under test).
  const kills4 = rows.filter(r => r.policy === 'armed').reduce((t, r) => t + (r.logEntries || []).filter(e => (e.w | 0) === 4).length, 0);
  console.log(`INFO wave-4 kill-log entries band-wide: ${kills4}`);
  console.log(`\nPROOF test-wave4enc-a: ${pass} PASS, ${fail} FAIL`);
  if (fail) process.exit(1);
}
if (require.main === module) main();
