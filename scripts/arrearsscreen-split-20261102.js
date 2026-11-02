#!/usr/bin/env node
// arrearsscreen-split-20261102.js — split the arrearsscreen stdout runner
// output into per-seed corpus files. Idle: no game load, no RNG.
// Usage: node scripts/arrearsscreen-split-20261102.js <sweep.stdout> <outdir>
'use strict';
const fs = require('fs');
const path = require('path');
const inp = process.argv[2];
const outdir = process.argv[3];
if (!inp || !outdir) { console.error('usage: arrearsscreen-split-20261102.js <sweep.stdout> <outdir>'); process.exit(2); }
fs.mkdirSync(outdir, { recursive: true });
const text = fs.readFileSync(inp, 'utf8');
let n = 0;
text.split('\n').forEach(function (line) {
  const t = line.trim();
  if (!t.startsWith('{"seed":')) return;
  let obj = null;
  try { obj = JSON.parse(t); } catch (e) { console.error('skip unparsable line: ' + String(e.message).slice(0, 100)); return; }
  if (!obj.screen || typeof obj.seed !== 'number') { console.error('skip line without screen payload'); return; }
  fs.writeFileSync(path.join(outdir, 'screen-s' + obj.seed + '.json'), JSON.stringify(obj.screen, null, 1) + '\n');
  n++;
});
console.log('split ' + n + ' seeds into ' + outdir);
