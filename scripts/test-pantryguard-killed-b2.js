#!/usr/bin/env node
// scripts/test-pantryguard-killed-b2.js — post-kill verification for the
// PANTRY-GUARD lever (fleshout loop B, 2026-10-20, arm sim-pantryguard-b2).
//
// The lever was KILLED AT PILOT (NO-GO: primary 0.617 vs <=0.5x bar,
// scholar-starvation and rot guardrails violated). Per kill protocol the
// layer is deleted zero-trace; instruments + evidence are kept. This script
// verifies the kill: the layer is absent, nothing wires it, instruments are
// intact, and the verdict is documented.
//
// Usage: node scripts/test-pantryguard-killed-b2.js
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function grepLive(pattern, dirs) {
  // Search for live references, excluding the archival instruments and evidence.
  const out = [];
  for (const d of dirs) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const fp = path.join(dir, f);
      if (!fs.statSync(fp).isFile() || !/\.js$/.test(f)) continue;
      if (/pantryguard-b2|pantryguard-killed/.test(f)) continue; // archival instruments
      const text = fs.readFileSync(fp, 'utf8');
      if (pattern.test(text)) out.push(path.relative(ROOT, fp));
    }
  }
  return out;
}

console.log('KILL VERIFICATION — sim-pantryguard-b2:');

// 1. Layer absent zero-trace.
check('layer file absent', !fs.existsSync(path.join(ROOT, 'scripts/policies/pantryguard.js')));

// 2. No live wiring: no other policy or src/js file references the layer.
const liveRefs = grepLive(/pantryguard|PANTRYGUARD/i, ['scripts/policies', 'src/js']);
check('no live refs in scripts/policies or src/js', liveRefs.length === 0, liveRefs.join(', ') || 'none');

// 3. Instruments intact and parse clean.
const instruments = [
  'scripts/test-pantryguard-b2.js',
  'scripts/measure-pantryguard-b2.js',
  'scripts/sense-pantryguard-b2.js',
  'scripts/det-gate-pantryguard-b2.js',
];
for (const f of instruments) {
  const fp = path.join(ROOT, f);
  check(`instrument present ${f}`, fs.existsSync(fp));
  if (fs.existsSync(fp)) {
    try { cp.execFileSync(process.execPath, ['--check', fp], { stdio: 'ignore' }); check(`instrument parses ${f}`, true); }
    catch (e) { check(`instrument parses ${f}`, false, 'node --check failed'); }
  }
}

// 4. Evidence documents the NO-GO verdict.
const ev = path.join(ROOT, 'evidence/2026-10-20/sim-pantryguard-b2.md');
const evText = fs.existsSync(ev) ? fs.readFileSync(ev, 'utf8') : '';
check('evidence file present', fs.existsSync(ev));
check('verdict NO-GO documented', /NO-GO at pilot/i.test(evText));
check('kill protocol documented', /deleted zero-trace/i.test(evText));

// 5. Per-seed corpus kept (32 files, top-level wall keys).
const psDir = path.join(ROOT, 'evidence/2026-10-20/perseed-pantryguard-b2');
const psFiles = fs.existsSync(psDir) ? fs.readdirSync(psDir).filter(f => f.endsWith('.json')) : [];
check('per-seed corpus kept (32)', psFiles.length === 32, `${psFiles.length}`);
if (psFiles.length) {
  const sample = JSON.parse(fs.readFileSync(path.join(psDir, psFiles[0]), 'utf8'));
  check('top-level wall keys', ['national', 'table', 'won', 'exiled'].every(k => k in sample));
}

// 6. Bogus panel artifacts removed (recovery: the worker's panel build never
//    activated the layer; shipping it would be dishonest).
check('bogus pg-panel-before removed', !fs.existsSync(path.join(ROOT, 'evidence/2026-10-20/pg-panel-before')));
check('bogus pg-panel-after removed', !fs.existsSync(path.join(ROOT, 'evidence/2026-10-20/pg-panel-after')));

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
