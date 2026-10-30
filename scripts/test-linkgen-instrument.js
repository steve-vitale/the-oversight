// test-linkgen-instrument.js — determinism/replay proof for sim-linkgen-a
// (pure measurement: no comparison leg, so the proof is replay identity).
// Runs seed 76201 leadcourt TWICE in separate child processes (never two
// harnesses in one process) into /tmp scratch and asserts the proposal,
// counter, catchUp, and generation event sequences are byte-identical,
// and that every end-generated village has a gen event. Exits non-zero
// on any mismatch. Usage: node scripts/test-linkgen-instrument.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function runOnce(dir) {
  fs.mkdirSync(dir, { recursive: true });
  execSync('node scripts/linkgen-sweep.js --seeds 76201 --policy leadcourt --outdir ' + dir,
    { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
  return JSON.parse(fs.readFileSync(path.join(dir, 's76201.json'), 'utf8'));
}

function sig(row) {
  return JSON.stringify({
    proposals: row.proposals,
    counters: row.counters,
    catchUps: row.catchUps,
    genEvents: row.genEvents,
    linksEnd: (row.final.links || []).filter(function (l) { return l.status === 'active'; }).map(function (l) { return l.villageId; }).sort(),
    gameDays: row.gameDays, endReason: row.endReason,
  });
}

function main() {
  const a = runOnce('/tmp/linkgen-det-a');
  const b = runOnce('/tmp/linkgen-det-b');
  const failures = [];
  if (sig(a) !== sig(b)) failures.push('replay event sequences differ between two identical runs');
  if ((a.instrumentErrors || []).length) failures.push('run A instrument errors: ' + a.instrumentErrors.join(' | '));
  if ((b.instrumentErrors || []).length) failures.push('run B instrument errors: ' + b.instrumentErrors.join(' | '));
  (a.villages || []).forEach(function (v) {
    if (v.finalGenerated && !v.generatedEver) failures.push('generated-at-end without gen event: ' + v.id);
  });
  if (failures.length) {
    console.error('FAIL linkgen instrument:');
    failures.forEach(function (f) { console.error(' - ' + f); });
    process.exit(1);
  }
  console.log('PASS linkgen instrument: replay-identical events on seed 76201 leadcourt ' +
    '(proposals=' + a.proposals.length + ', catchUps=' + a.catchUps.length +
    ', genEvents=' + a.genEvents.length + ', linksEnd=' +
    (a.final.links || []).filter(function (l) { return l.status === 'active'; }).length +
    ', days=' + a.gameDays + ')');
}

if (require.main === module) main();
