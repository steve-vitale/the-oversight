#!/usr/bin/env node
'use strict';
// gateclassify-parse-20261112 — parse a `node scripts/check.js --quick` log
// and emit the failure-name list (the list the round-6 gate lost to tail
// buffering), the totals line, and the 3 slowest scripts.
// Usage: node scripts/gateclassify-parse-20261112.js <logfile>
// Prints JSON to stdout. Also requireable: { parseCheckLog }.
const fs = require('fs');

const FAIL_RE = /^\s*FAIL\s+(\S+)\s+\(exit\s+(\S+),\s+([\d.]+)s\)\s*$/;
const TOTAL_RE = /^\s*check\.js:\s+(\d+)\s+passed,\s+(\d+)\s+failed in (\d+)s\s*$/;
const HEADER_RE = /^\s*check\.js:\s+(\d+)\s+scripts,\s+(\d+)\s+parallel/;
const SLOWEST_RE = /^\s*slowest:\s*(.+)$/;
const INNER_FAIL_RE = /^\s*FAIL\s+(.+?)\s*$/;
const ERROR_RE = /^\s*(Error:\s.+?)\s*$/;

function parseCheckLog(text) {
  const lines = text.split('\n');
  const out = { totalScripts: null, parallel: null, passed: null, failed: null, seconds: null, failures: [], slowest: [] };
  let cur = null;
  const flush = () => { if (cur) { out.failures.push(cur); cur = null; } };
  for (const line of lines) {
    let m;
    if ((m = HEADER_RE.exec(line))) { out.totalScripts = +m[1]; out.parallel = +m[2]; continue; }
    if ((m = TOTAL_RE.exec(line))) { flush(); out.passed = +m[1]; out.failed = +m[2]; out.seconds = +m[3]; continue; }
    if ((m = SLOWEST_RE.exec(line))) {
      flush();
      out.slowest = m[1].split(/\s*,\s*/).map(s => {
        const mm = /^(\S+)\s+([\d.]+)s$/.exec(s.trim());
        return mm ? { path: mm[1], secs: +mm[2] } : { path: s.trim(), secs: null };
      });
      continue;
    }
    if ((m = FAIL_RE.exec(line))) {
      flush();
      cur = { path: m[1], exit: m[2], secs: +m[3], timeout: false, failingLegs: [], errorLine: null, detail: [] };
      continue;
    }
    if (cur) {
      cur.detail.push(line);
      if (line.includes('[check.js] TIMEOUT')) cur.timeout = true;
      const im = INNER_FAIL_RE.exec(line);
      if (im) cur.failingLegs.push(im[1]);
      if (!cur.errorLine) {
        const em = ERROR_RE.exec(line);
        if (em) cur.errorLine = em[1];
      }
    }
  }
  flush();
  for (const f of out.failures) {
    // Trim trailing blank detail lines.
    while (f.detail.length && f.detail[f.detail.length - 1].trim() === '') f.detail.pop();
    while (f.detail.length && f.detail[0].trim() === '') f.detail.shift();
  }
  return out;
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error('usage: node scripts/gateclassify-parse-20261112.js <check.js-log>'); process.exit(2); }
  const parsed = parseCheckLog(fs.readFileSync(file, 'utf8'));
  console.log(JSON.stringify(parsed, null, 2));
  console.log(`\nsummary: ${parsed.passed ?? '?'} passed, ${parsed.failed ?? '?'} failed in ${parsed.seconds ?? '?'}s (${parsed.failures.length} failure blocks parsed)`);
  for (const f of parsed.failures) {
    console.log(`  FAIL ${f.path} exit=${f.exit} ${f.secs}s${f.timeout ? ' TIMEOUT' : ''}${f.errorLine ? ' :: ' + f.errorLine : ''}`);
    for (const leg of f.failingLegs) console.log(`    leg: ${leg}`);
  }
}

module.exports = { parseCheckLog };
