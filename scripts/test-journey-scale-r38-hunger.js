// scripts/test-journey-scale-r38-hunger.js — journey-scale r38 proof test:
// the hunger-window instrument is wired into the r38 driver (and absent from
// the r37 driver), and every r38 seed JSON carries the hunger fields.
// Usage: node scripts/test-journey-scale-r38-hunger.js [EVIDIR]
//   With no EVIDIR: static-wiring checks only (pass on r38, RED on r37).
//   With EVIDIR: also checks each seed JSON + hungerwatch txt file.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('PASS ' + label); } else { fail++; console.log('FAIL ' + label); } }
const r38 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r38-20261026.js'), 'utf8');
const r37 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r37-20261026.js'), 'utf8');
const hooks = [
  ['hungerWatch declaration', 'let hungerWatch = [];'],
  ['hungerWatch per-seed reset', 'hungerWatch = [];'],
  ['hungerWatch daily push', 'hungerWatch.push({ day: gd'],
  ['hungryDays read', 'hungryDays: ((_G.state.village || {}).hungryDays || 0)'],
  ['pilgrim state read', 'pilgrim: !!(ctx && ctx._pilgrim)'],
  ['league pool read', 'pool: (_G.leaguePool ? _G.leaguePool() : null)'],
  ['census hunger field', 'hungerWatch: hungerWatch.slice()'],
  ['hungerwatch file write', 'journey-scale-r38-hungerwatch-'],
];
for (const [label, needle] of hooks) {
  ok(r38.indexOf(needle) !== -1, 'r38 driver has ' + label);
  ok(r37.indexOf(needle) === -1, 'r37 driver lacks ' + label + ' (RED on old driver)');
}
// Read-only claim: the instrument's push block only reads state/ctx and
// pushes to a driver-local array. Assert no assignment to Game state inside
// the hunger push block.
const pushBlock = (r38.match(/R38 hunger-window instrument[\s\S]{0,900}/) || [''])[0];
ok(pushBlock.length > 0, 'hunger instrument block found');
ok(!/state\.\w+\s*=/.test(pushBlock) && !/Game\.\w+\s*=/.test(pushBlock), 'hunger instrument performs no state writes');
// Analyzer carries the HUNGER section.
const an = fs.readFileSync(path.join(ROOT, 'scripts', 'analyze-scale-r38-20261026.js'), 'utf8');
ok(an.indexOf('HUNGER-WINDOW') !== -1, 'r38 analyzer has HUNGER section');
ok(an.indexOf('HUNGER-DAY') !== -1, 'r38 analyzer prints HUNGER-DAY rows');
const EVIDIR = process.argv[2];
if (EVIDIR) {
  const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r38-trust-\d+\.json$/.test(f)).sort();
  ok(files.length > 0, 'r38 seed JSONs present in ' + EVIDIR);
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8')).census;
    ok(Array.isArray(c.hungerWatch) && c.hungerWatch.length > 0, f + ' has nonempty hungerWatch (' + (c.hungerWatch || []).length + ' rows)');
    const seed = f.match(/(\d+)\.json$/)[1];
    ok(fs.existsSync(path.join(EVIDIR, 'journey-scale-r38-hungerwatch-' + seed + '.txt')), f + ' hungerwatch txt exists');
    // Every row carries the fields the analyzer reads.
    const bad = (c.hungerWatch || []).filter(h => h.day == null || h.pantry == null || h.hungryDays == null || h.pool === undefined);
    ok(bad.length === 0, f + ' all hungerWatch rows complete');
    // Rows are in day order, non-decreasing: policy.daily can fire twice
    // on one game day (a return walk completes and a new pilgrimage starts
    // inside the same game day), so duplicate days are legal and later
    // rows carry later intra-day state (pantry/pilgrim move, hungryDays
    // does not — it only changes at endDay). Invariant: same-day rows
    // share hungryDays, and days never decrease.
    const rows = c.hungerWatch || [];
    const days = rows.map(h => h.day);
    const nondec = days.every((d, i) => i === 0 || d >= days[i - 1]);
    ok(nondec, f + ' hungerWatch days non-decreasing');
    let dupOk = true;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].day === rows[i - 1].day && rows[i].hungryDays !== rows[i - 1].hungryDays) dupOk = false;
    }
    ok(dupOk, f + ' same-day rows share hungryDays');
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
