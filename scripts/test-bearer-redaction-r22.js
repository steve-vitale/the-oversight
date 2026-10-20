// test-bearer-redaction-r22.js — journey-deepening r22 proof test (before/after).
//
// BLANK: the content pipeline redacts the word after "bearer"/"Bearer" on the
// write path ("bearer <X>" -> "bearer <redacted>"), and the 2026-10-16
// journey-succession r10 write shipped the corruption into PLAYER-VISIBLE
// copy: src/data/build-notes.json (title-screen "What's new") and docs/TABLE.md
// (canon). This test fails while any literal "<redacted>" survives in the
// player-facing surface, and pins the repaired sentences.
//
// RED: run before the fix -> FAIL (corruption present).
// GREEN: run after the fix -> PASS.
// Run: node scripts/test-bearer-redaction-r22.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// 1. No literal "<redacted>" in the player-facing surface.
const surface = [
  'src/data/build-notes.json',
  'docs/TABLE.md',
];
for (const rel of surface) {
  const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  check('no-literal-redacted:' + rel, txt.indexOf('<redacted>') < 0,
    'literal "<redacted>" still present');
}

// 2. The three repaired build-note sentences read correctly.
const notes = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/build-notes.json'), 'utf8'));
const entries = Array.isArray(notes) ? notes : (notes.entries || []);
const all = [];
for (const e of entries) for (const n of (e.notes || [])) all.push(n);
check('lineage-sentence',
  all.some(n => n.indexOf('every Bearer who bore the mantle in order') >= 0),
  'expected "every Bearer who bore the mantle in order"');
check('deathpack-sentence',
  all.some(n => n.indexOf('if your Bearer dies holding a stone knife in hand') >= 0),
  'expected "if your Bearer dies holding a stone knife in hand"');
check('burial-sentence',
  all.some(n => n.indexOf('When your Bearer dies, the village brings them home now') >= 0),
  'expected "When your Bearer dies, the village brings them home now"');

// 3. TABLE.md canon line repaired.
const table = fs.readFileSync(path.join(ROOT, 'docs/TABLE.md'), 'utf8');
check('table-teach-sentence',
  table.indexOf('the villager learns plants the Bearer knows via') >= 0,
  'expected "the villager learns plants the Bearer knows via"');

// 4. No literal "<redacted>" anywhere in live game code/data (src/).
// (scripts/ old diagnostics keep historical corruptions in comments/labels —
//  documented in the r22 run note, not live code. evidence/ is history.)
const liveHits = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (f.name !== 'node_modules') walk(p); continue; }
    if (!/\.(js|json)$/.test(f.name)) continue;
    const txt = fs.readFileSync(p, 'utf8');
    if (txt.indexOf('<redacted>') >= 0) liveHits.push(path.relative(ROOT, p));
  }
}
walk(path.join(ROOT, 'src'));
check('no-literal-redacted:src/**', liveHits.length === 0, liveHits.slice(0, 5).join(', '));

console.log(failures === 0 ? '\nALL GREEN' : '\n' + failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
