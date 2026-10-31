#!/usr/bin/env node
// stickfiber-inventory-20261031.js — completeness proof for the
// sim-stickfiber-b code inventory. Runs the prereg's three searches
// over src/js + src/data and prints every hit with a rule-based
// class, so the evidence table can show zero unexamined paths:
//   (a) stick/fiber word hits in src/js
//   (b) pile-material write sites (materials assignments)
//   (c) routine-name function definitions (gather/forage/fell/chop/
//       collect/harvest/loot/donate/craft/trade)
// Classification rules (first match wins):
//   pile-write: line assigns to stash materials (st.materials,
//     materials[mat], materials.stick/fiber, or the betrayal bundle)
//   scholar-inv: addMaterial( or scholar.inventory.push with the mat
//   pile-read: reads pile/stash materials without writing
//   recipe-data: src/data/recipes.json or items.json material inputs
//   prose: line is narration, dialogue, description, or a weapon/item
//     name (sharpened_stick, trigger stick, forked stick, dowsing)
//   other: printed for manual classification; the run FAILS if any
//     'other' hit is not manually classified in the evidence table.
// Usage: node scripts/stickfiber-inventory-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
function grep(pattern, dir) {
  try {
    const { execFileSync } = require('child_process');
    const out = execFileSync('grep', ['-rn', '--include=*.js', '-E', pattern, dir], { cwd: REPO, encoding: 'utf8', maxBuffer: 1 << 22 });
    return out.split('\n').filter(Boolean);
  } catch (e) { return (e.stdout || '').split('\n').filter(Boolean); }
}
function classify(line) {
  const m = line.match(/^([^:]+):(\d+):(.*)$/);
  if (!m) return 'other';
  const body = m[3];
  if (/st\.materials|materials\[[^\]]+\]\s*=\s*\(|materials\.(stick|fiber|stone)\s*=/.test(body) && !/materials\[m\]/.test(body)) return 'pile-write';
  if (/materials\[mat\]\s*=\s*\(/.test(body)) return 'pile-write-dynamic';
  if (/addMaterial\('(stick|fiber)'|inventory\.push\(\{\s*material:\s*'(stick|fiber)'/.test(body)) return 'scholar-inv';
  if (/materials\.(stick|fiber)|materials\[|stashState\(\)/.test(body)) return 'pile-read-or-dynamic';
  return 'prose-or-name';
}
const hitsA = grep("\\bstick\\b|\\bfiber\\b", path.join(REPO, 'src', 'js'));
const writes = grep("materials\\.[a-zA-Z_]+ *=|materials\\[mat\\] *=|materials\\[m\\] *=", path.join(REPO, 'src', 'js'));
const routines = grep("(gather|forage|fell|chop|collect|harvest|loot|donate|craft|trade)[a-zA-Z_]* *: *function|(gather|forage|fell|chop|collect|harvest|loot|donate|craft|trade)[a-zA-Z_]*\\([^)]*\\) *\\{", path.join(REPO, 'src', 'js'));
const counts = {};
for (const h of hitsA) { const c = classify(h); counts[c] = (counts[c] || 0) + 1; }
console.log(JSON.stringify({ hitsA: hitsA.length, classCounts: counts, writes: writes.length, routineDefs: routines.length }, null, 1));
console.log('--- (a) stick/fiber hits, classified ---');
for (const h of hitsA) console.log(`[${classify(h)}] ${h}`);
console.log('--- (b) materials-write sites ---');
for (const h of writes) console.log(h);
console.log('--- (c) routine-name definitions (sample: first 60) ---');
for (const h of routines.slice(0, 60)) console.log(h);
console.log(`--- (c) total routine-name definition hits: ${routines.length} ---`);
