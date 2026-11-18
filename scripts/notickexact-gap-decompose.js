// notickexact-gap-decompose.js — READ-ONLY decomposition of the gap
// between the part-3-only deferral footprint and the diag's exact
// no-tick population, over any 8-seed baseline corpus (PROFILEGATE=1).
// Used pre-run to calibrate the sim-notickexact-a gate: it counts part-3
// party_launch PICK rows by plan (needWave/stage/target), collapses them
// to (vid,target,day) commit-days, and runs the FROZEN classifier
// (analyze-launchdef-a.js classifySeed) to count no-tick-after-commit
// selections, cross-checking each selection against its pick rows.
// Usage:
//   node scripts/notickexact-gap-decompose.js <corpusDir>
// No sims, no writes except stdout. Exits 0 on a clean parse.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifySeed } = require(path.join(REPO, 'scripts', 'analyze-launchdef-a.js'));

const dir = process.argv[2];
if (!dir) { console.error('usage: node scripts/notickexact-gap-decompose.js <corpusDir>'); process.exit(2); }
const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
let totP3 = 0;
const byKey = {};
let classifierNoTick = 0;
const classifierNoTickDetail = [];
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const seed = j.seed;
  const p3 = j.dawnbidScores.filter(function (r) { return r.part === 3 && r.pick && r.pick.winPlanAction === 'party_launch'; });
  totP3 += p3.length;
  for (const r of p3) {
    const p = r.plan || {};
    const k = 'needWave=' + (p.needWave == null ? 'null' : p.needWave) + '|stage=' + (p.stage || 'null') + '|target=' + (p.target == null ? 'null' : 'set');
    byKey[k] = (byKey[k] || 0) + 1;
  }
  const cls = classifySeed(j, {});
  let n = 0;
  for (const inst of (cls.instances || [])) {
    for (const res of (inst.resolved || [])) {
      if (res.reason === 'no-tick-after-commit') {
        n++;
        classifierNoTickDetail.push({ seed: seed, vid: inst.vid, target: inst.target, day: res.day, commitKind: res.commitKind });
      }
    }
  }
  classifierNoTick += n;
  console.log('seed', seed, 'p3PickRows=', p3.length, 'classifierNoTick=', n);
}
console.log('\nTOTAL p3 party_launch PICK rows:', totP3);
console.log('breakdown (needWave|stage|target):');
for (const k of Object.keys(byKey).sort()) console.log(' ', k, byKey[k]);
console.log('\nTOTAL classifier no-tick selections:', classifierNoTick);
console.log(JSON.stringify(classifierNoTickDetail, null, 1));
console.log('\n--- classifier no-tick selections vs p3 pick rows that (vid,target,day) ---');
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const nt of classifierNoTickDetail.filter(function (x) { return x.seed === j.seed; })) {
    const rows = j.dawnbidScores.filter(function (r) { return r.vid === nt.vid && r.day === nt.day && r.pick && r.pick.winPlanAction === 'party_launch'; });
    const p3rows = rows.filter(function (r) { return r.part === 3; });
    console.log('seed', nt.seed, nt.vid, '->', nt.target, 'd' + nt.day, 'p3pickRows=', p3rows.length, 'allPickRows=', rows.length, 'planStages=', JSON.stringify(p3rows.map(function (r) { return (r.plan || {}).stage + '/' + (r.plan || {}).needWave + '/' + ((r.plan || {}).target || 'null'); })));
  }
}
