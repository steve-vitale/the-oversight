#!/usr/bin/env node
// test-sweeten-a-propose-detail.js — DIAG ONLY, sim-sweeten-a.
// Companion to test-sweeten-a-corpus.js: per-seed proposeLink outcomes
// (formed / counter / declined) and, for seed 9911, the pantry tail
// around its two counter answers (days 130-166).
// Pure corpus reader: no game code, no policy, no new sims.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'evidence', '2026-10-30', 'sim-tributecost-a-corpus-leanlink');
const rows = [];
for (const f of fs.readdirSync(dir).sort()) {
  if (!/^seed-\d+\.json$/.test(f)) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}
rows.sort((a, b) => a.seed - b.seed);
for (const r of rows) {
  const proposes = (r.courtCalls || []).filter(c => c.name === 'proposeLink');
  const outcomes = proposes.map(c => {
    let kind = 'unknown';
    if (c.ret === 'counter') kind = 'COUNTER-STAGED';
    else if (c.ret === null || c.ret === 'null') kind = 'DECLINED/null';
    else if (typeof c.ret === 'string' && c.ret.startsWith('{')) kind = 'FORMED(link object)';
    else kind = 'ret=' + JSON.stringify(c.ret);
    return { day: c.day, target: c.args && c.args[0], outcome: kind, pantryBefore: c.pantryBefore };
  });
  console.log('seed ' + r.seed + ' proposes=' + proposes.length);
  for (const o of outcomes) console.log('  ' + JSON.stringify(o));
}
const r9911 = rows.find(r => r.seed === 9911);
console.log('--- seed 9911 pantry tail (scholarDay:kcal), days 130-166 ---');
for (const p of (r9911.pantryDaily || []).filter(p => p.scholarDay >= 130)) {
  console.log('  day ' + p.scholarDay + ': ' + p.kcal + (p.kcal > 25000 ? ' OVER' : ''));
}
console.log('--- seed 9911 pantry deciles (every ~15d) ---');
for (const p of (r9911.pantryDaily || []).filter((_, i) => i % 15 === 0)) {
  console.log('  day ' + p.scholarDay + ': ' + p.kcal);
}
