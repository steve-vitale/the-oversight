// approachbranch-screen-20261104.js — screen a per-seed corpus dir with
// the branch split (arm sim-approachbranch-a). Prints, per fight with
// any old APPROACH-STEP turn: old count -> flee / approach / other,
// max true-approach run, post-mark true-approach turns, and the
// old-vs-true loop verdicts. Totals at the end. Read-only: never
// writes into the repo.
// Usage: node scripts/approachbranch-screen-20261104.js <corpus-dir>
'use strict';
const path = require('path');
const B = require('./approachbranch-analyze-20261104');
const dir = process.argv[2];
if (!dir) { console.error('SCREEN STOP: corpus dir required'); process.exit(2); }
const res = B.summarizeCorpus(path.isAbsolute(dir) ? dir : path.join(__dirname, '..', dir));
for (const f of res.fights) {
  console.log(f.file + ' seq ' + f.seq + ' day ' + f.day + ' ' + f.mid +
    ' outcome=' + f.outcome + ' strikes=' + f.strikesLanded +
    ' old=' + f.old + ' flee=' + f.flee + ' approach=' + f.approach + ' other=' + f.other +
    ' oldMaxRun=' + f.oldMaxRun + ' maxTrueRun=' + f.maxTrueRun +
    ' oldLoop=' + f.oldIsLoop + ' trueLoop=' + f.isTrueLoop);
  for (const d of f.detail) {
    console.log('    turn ' + d.turnSeq + ' round ' + d.round + ' hp ' + d.hpPct.toFixed(3) +
      ' target ' + d.target + ' branch ' + d.branch);
  }
  if (f.postMark.length) {
    console.log('    postMark: ' + f.postMark.map(function (p) {
      return 'turn ' + p.turnSeq + ' round ' + p.round + ' hp ' + p.hpPct.toFixed(3) + ' target ' + p.target;
    }).join('; '));
  }
}
console.log('TOTALS files=' + res.totals.files + ' old=' + res.totals.old +
  ' flee=' + res.totals.flee + ' approach=' + res.totals.approach + ' other=' + res.totals.other +
  ' oldLoops=' + res.totals.oldLoops + ' trueLoops=' + res.totals.trueLoops);
