#!/usr/bin/env node
// split-reminder-b.js — short-lived splitter: reads a sweep stdout log,
// persists each PERSEED-CENSUS line to evidence/2026-10-26/
// sim-reminder-b-corpus/<filename>, validating parse + filename seed.
// Usage: node scripts/split-reminder-b.js <logfile>
'use strict';
const fs = require('fs');
const path = require('path');
const log = process.argv[2];
const outDir = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-reminder-b-corpus');
fs.mkdirSync(outDir, { recursive: true });
const lines = fs.readFileSync(log, 'utf8').split('\n');
let n = 0;
for (const line of lines) {
  if (!line.startsWith('PERSEED-CENSUS ')) continue;
  const sp = line.indexOf(' ', 'PERSEED-CENSUS '.length);
  const name = line.slice('PERSEED-CENSUS '.length, sp);
  const json = line.slice(sp + 1);
  const obj = JSON.parse(json);
  const m = name.match(/-s(\d+)\.json$/);
  if (!m || parseInt(m[1], 10) !== obj.seed) throw new Error('seed mismatch in ' + name);
  if (!name.startsWith('reminder-b-')) throw new Error('unexpected filename ' + name);
  fs.writeFileSync(path.join(outDir, name), json);
  const back = JSON.parse(fs.readFileSync(path.join(outDir, name), 'utf8'));
  if (back.seed !== obj.seed) throw new Error('readback mismatch ' + name);
  n += 1;
}
console.log('split ' + n + ' files into ' + outDir);
