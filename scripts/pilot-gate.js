#!/usr/bin/env node
// pilot-gate.js — mechanical pilot gate for sweep runners (gap line 888).
//
// The 1030Z pdvalue arm launched its confirm sweep 37s after the pilot
// NO-GO verdict and ran to 15/16 seeds of one cell before adoption stopped
// it; the partial corpus was deleted unanalyzed per §14. The gate is the
// mechanical fix: a runner MUST NOT start confirm seeds while a NO-GO
// analyzer report exists for the run.
//
// Usage:
//   node scripts/pilot-gate.js --report <dir-or-file> [--stage confirm]
//   node scripts/pilot-gate.js --report <dir-or-file> --json
//
// Exit codes: 0 = ALLOWED (no NO-GO found, or no report on file and the
//   caller explicitly passed --allow-missing); 3 = REFUSED (a NO-GO report
//   exists); 2 = REFUSED (no verdict on file at all — a confirm run with
//   no pilot verdict is not a gated run, it is an ungated one).
// Verdict detection: any JSON object in the report path (recursively for
// directories) whose verdict/result/decision/status field is NO-GO (or
// NO_GO / nogo, case-insensitive), or whose go/noGo fields say go=false /
// noGo=true, or whose filename contains 'no-go'/'nogo' and parses as a
// verdict report. GO verdicts never override a NO-GO: one NO-GO refuses.
// This is a GATE, not a verdict: it does not re-judge the pilot, it only
// refuses to proceed past a NO-GO (or past a missing verdict).
'use strict';
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const o = { report: null, json: false, allowMissing: false, stage: 'confirm' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--report') o.report = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--allow-missing') o.allowMissing = true;
    else if (a === '--stage') o.stage = argv[++i];
    else if (a.startsWith('--report=')) o.report = a.slice('--report='.length);
  }
  return o;
}

function collectJsonFiles(p) {
  const out = [];
  if (!fs.existsSync(p)) return out;
  const st = fs.statSync(p);
  if (st.isFile() && p.endsWith('.json')) { out.push(p); return out; }
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      const full = path.join(p, name);
      try {
        const s = fs.statSync(full);
        if (s.isFile() && name.endsWith('.json')) out.push(full);
        else if (s.isDirectory()) out.push(...collectJsonFiles(full));
      } catch (e) { /* unreadable entry: not a verdict */ }
    }
  }
  return out;
}

function verdictOf(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const fields = ['verdict', 'result', 'decision', 'status', 'pilotVerdict', 'analyzerVerdict'];
  for (const f of fields) {
    const v = obj[f];
    if (typeof v === 'string') {
      const n = v.trim().toLowerCase().replace(/[\s_]+/g, '-');
      if (n === 'no-go' || n === 'nogo') return 'NO-GO';
      if (n === 'go') return 'GO';
    }
  }
  if (obj.go === false || obj.noGo === true || obj.no_go === true) return 'NO-GO';
  if (obj.go === true) return 'GO';
  // Nested verdict objects: { pilot: { verdict: 'NO-GO' } }, { report: {...} }
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const inner = verdictOf(v);
      if (inner) return inner;
    }
  }
  return null;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.report) {
    console.error('pilot-gate: --report <dir-or-file> is required');
    process.exit(2);
  }
  const files = collectJsonFiles(opts.report);
  const noGoFiles = [];
  const goFiles = [];
  for (const f of files) {
    let obj = null;
    try { obj = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
    const v = verdictOf(obj);
    if (v === 'NO-GO') noGoFiles.push(f);
    else if (v === 'GO') goFiles.push(f);
    else if (/no-?go/i.test(path.basename(f))) noGoFiles.push(f);
  }
  if (noGoFiles.length) {
    const msg = 'pilot-gate: REFUSED stage=' + opts.stage + ' — NO-GO analyzer report exists: ' + noGoFiles.join(', ');
    if (opts.json) console.log(JSON.stringify({ allowed: false, reason: 'NO-GO', noGoFiles, goFiles }));
    else console.log(msg);
    process.exit(3);
  }
  if (!files.length || (!goFiles.length && !noGoFiles.length)) {
    if (opts.allowMissing) {
      if (opts.json) console.log(JSON.stringify({ allowed: true, reason: 'allow-missing', files }));
      else console.log('pilot-gate: ALLOWED stage=' + opts.stage + ' — no verdict on file, --allow-missing given');
      process.exit(0);
    }
    if (opts.json) console.log(JSON.stringify({ allowed: false, reason: 'no-verdict-on-file', files }));
    else console.log('pilot-gate: REFUSED stage=' + opts.stage + ' — no pilot verdict on file at ' + opts.report + ' (set the report path, or pass --allow-missing deliberately)');
    process.exit(2);
  }
  if (opts.json) console.log(JSON.stringify({ allowed: true, reason: 'no-NO-GO', goFiles }));
  else console.log('pilot-gate: ALLOWED stage=' + opts.stage + ' — no NO-GO report (' + goFiles.length + ' GO verdict(s))');
  process.exit(0);
}

if (require.main === module) main();
module.exports = { verdictOf, collectJsonFiles };
