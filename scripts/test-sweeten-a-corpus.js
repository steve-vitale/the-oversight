#!/usr/bin/env node
// test-sweeten-a-corpus.js — DIAG ONLY, sim-sweeten-a.
// Reads the tributecost leanlink pilot corpus (seeds 9911-9918, 180d)
// and classifies each seed's zero sweeteners: trigger-never-reached
// (no counter staged) vs pantry-condition-fails (counters answered,
// pantry always <= 25000 at answer) vs OTHER.
// Pure corpus reader: no game code, no policy, no new sims.
// Usage: node scripts/test-sweeten-a-corpus.js [--dir <corpus-dir>]
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const arg = (n, fb) => { const i = process.argv.indexOf('--' + n); return i < 0 ? fb : process.argv[i + 1]; };
const dir = arg('dir', path.join(ROOT, 'evidence', '2026-10-30', 'sim-tributecost-a-corpus-leanlink'));

const rows = [];
for (const f of fs.readdirSync(dir).sort()) {
  if (!/^seed-\d+\.json$/.test(f)) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
rows.sort((a, b) => a.seed - b.seed);

let totStaged = 0, totAnswered = 0, totSweeten = 0, totAccept = 0;
for (const r of rows) {
  const calls = r.courtCalls || [];
  const proposes = calls.filter(c => c.name === 'proposeLink');
  const staged = proposes.filter(c => c.ret === 'counter');
  const answers = calls.filter(c => c.name === 'answerCounter');
  const sweeten = answers.filter(c => c.args && c.args[0] === 'sweeten');
  const accept = answers.filter(c => c.args && c.args[0] === 'accept');
  const otherArgs = answers.filter(c => !c.args || (c.args[0] !== 'sweeten' && c.args[0] !== 'accept'));
  const accords = calls.filter(c => c.name === 'answerAccord');
  const pantry = r.pantryDaily || [];
  const maxPantry = pantry.reduce((m, p) => Math.max(m, p.kcal || 0), 0);
  const maxDay = (pantry.find(p => p.kcal === maxPantry) || {}).scholarDay;
  const overDays = pantry.filter(p => (p.kcal || 0) > 25000);
  const overAtAnswer = answers.filter(c => (c.pantryBefore || 0) > 25000);
  const answerPantry = answers.map(c => ({ day: c.day, arg: c.args && c.args[0], before: c.pantryBefore, delta: c.pantryDelta, ret: c.ret }));
  // Pantry on staging days (post-daily snapshot nearest that scholar day).
  const stagePantry = staged.map(c => {
    const snap = pantry.find(p => p.scholarDay === c.day);
    return { day: c.day, postDailyKcal: snap ? snap.kcal : null, target: (c.args && c.args[0]) || null };
  });
  totStaged += staged.length; totAnswered += answers.length;
  totSweeten += sweeten.length; totAccept += accept.length;
  const verdict = staged.length === 0 ? 'T-NEVER (no counter staged)'
    : (sweeten.length === 0 && answers.length > 0 && overAtAnswer.length === 0 ? 'C-FAILS (answered, pantry never >25000 at answer)'
    : (sweeten.length > 0 ? 'SWEETENED (contradicts tributecost 0/0 — investigate)'
    : 'OTHER (staged ' + staged.length + ', answered ' + answers.length + ')'));
  console.log('=== seed ' + r.seed + ' days=' + r.days + ' end=' + r.endReason + ' ===');
  console.log('  proposes=' + proposes.length + ' stagedCounters=' + staged.length + ' answers=' + answers.length
    + ' sweeten=' + sweeten.length + ' accept=' + accept.length + ' otherArgs=' + otherArgs.length
    + ' accords=' + accords.length);
  console.log('  pantryDaily: n=' + pantry.length + ' max=' + maxPantry + ' on scholarDay=' + maxDay
    + ' daysOver25000=' + overDays.length + ' firstOver=' + (overDays[0] ? overDays[0].scholarDay : 'none'));
  console.log('  answersAtPantry>25000: ' + overAtAnswer.length);
  console.log('  answers: ' + JSON.stringify(answerPantry));
  console.log('  staged: ' + JSON.stringify(stagePantry));
  console.log('  VERDICT: ' + verdict);
}
console.log('TOTALS staged=' + totStaged + ' answered=' + totAnswered + ' sweeten=' + totSweeten + ' accept=' + totAccept);
