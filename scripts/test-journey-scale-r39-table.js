// scripts/test-journey-scale-r39-table.js — journey-scale r39 proof test:
// the table-approach instrument is wired into the r39 driver (and absent
// from the r38 driver), and every r39 seed JSON carries the table fields.
// Usage: node scripts/test-journey-scale-r39-table.js [EVIDIR]
//   With no EVIDIR: static-wiring checks only (pass on r39, RED on r38).
//   With EVIDIR: also checks each seed JSON + tablewatch txt file.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, label) { if (cond) { pass++; console.log('PASS ' + label); } else { fail++; console.log('FAIL ' + label); } }
const r39 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r39-20261026.js'), 'utf8');
const r38 = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r38-20261026.js'), 'utf8');
const hooks = [
  ['tableWatch declaration', 'let tableWatch = [];'],
  ['tableWatch per-seed reset', 'tableWatch = [];'],
  ['tableWatch daily push', 'tableWatch.push({ day: gd'],
  ['tableSeat read in tableWatch push', 'const _seat = (_G.tableSeat'],
  ['arc read', '_pg.arc || 0'],
  ['tableWaiting read', 'tableWaiting: !!_pg.tableWaiting'],
  ['overtimeTier read', '_G.overtimeTier ? _G.overtimeTier()'],
  ['census table field', 'tableWatch: tableWatch.slice()'],
  ['tablewatch file write', 'journey-scale-r39-tablewatch-'],
];
for (const [label, needle] of hooks) {
  ok(r39.indexOf(needle) !== -1, 'r39 driver has ' + label);
  ok(r38.indexOf(needle) === -1, 'r38 driver lacks ' + label + ' (RED on old driver)');
}
// Read-only claim: the instrument's push block only reads state/ctx and
// pushes to a driver-local array. Assert no assignment to Game state inside
// the table push block.
const pushBlock = (r39.match(/R39 table-approach instrument[\s\S]{0,1200}/) || [''])[0];
ok(pushBlock.length > 0, 'table instrument block found');
ok(!/state\.\w+\s*=/.test(pushBlock) && !/Game\.\w+\s*=/.test(pushBlock), 'table instrument performs no state writes');
// Analyzer carries the TABLE section.
const an = fs.readFileSync(path.join(ROOT, 'scripts', 'analyze-scale-r39-20261026.js'), 'utf8');
ok(an.indexOf('TABLE-AFTER-GLOBAL') !== -1, 'r39 analyzer has TABLE section');
ok(an.indexOf('TABLE-AT-GLOBAL') !== -1, 'r39 analyzer prints TABLE-AT-GLOBAL rows');
ok(an.indexOf('TABLE-VOICED') !== -1, 'r39 analyzer prints TABLE-VOICED rows');
const EVIDIR = process.argv[2];
if (EVIDIR) {
  const files = fs.readdirSync(EVIDIR).filter(f => /^journey-scale-r39-trust-\d+\.json$/.test(f)).sort();
  ok(files.length > 0, 'r39 seed JSONs present in ' + EVIDIR);
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8')).census;
    ok(Array.isArray(c.tableWatch) && c.tableWatch.length > 0, f + ' has nonempty tableWatch (' + (c.tableWatch || []).length + ' rows)');
    const seed = f.match(/(\d+)\.json$/)[1];
    ok(fs.existsSync(path.join(EVIDIR, 'journey-scale-r39-tablewatch-' + seed + '.txt')), f + ' tablewatch txt exists');
    const bad = (c.tableWatch || []).filter(t => t.day == null || t.seat == null || t.detail === undefined || t.arc == null || t.tableWaiting === undefined || t.tableAnnounced === undefined || t.scaleRank === undefined);
    ok(bad.length === 0, f + ' all tableWatch rows complete');
    const rows = c.tableWatch || [];
    const days = rows.map(t => t.day);
    const nondec = days.every((d, i) => i === 0 || d >= days[i - 1]);
    ok(nondec, f + ' tableWatch days non-decreasing');
    const maxDay = rows.length ? Math.max(...days) : null;
    ok(maxDay === c.day || maxDay === c.day - 1, f + ' tableWatch maxDay == census day or day before (' + maxDay + ' vs ' + c.day + ')');
    ok(rows.length >= maxDay, f + ' tableWatch rows >= maxDay (' + rows.length + ' rows, maxDay ' + maxDay + ')');
  }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
