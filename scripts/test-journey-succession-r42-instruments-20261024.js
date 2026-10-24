#!/usr/bin/env node
// test-journey-succession-r42-instruments-20261024.js — proof test for the
// r42 instrument (NOT a game test): runs journey-succession-r42-20261024.js
// on throwaway seed 23999 with a short window (5d phase A + 3d post-death)
// and asserts the record carries the r42 fields: a passed mantle, readable
// parity, machinery, and scholar-function signals. Evidence files the pilot
// writes for seed 23999 are deleted afterwards (throwaway seed, never a
// run seed). Usage: node scripts/test-journey-succession-r42-instruments-20261024.js
'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-24');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
function ok(msg) { console.log('ok: ' + msg); }

const r = spawnSync('node', [path.join(ROOT, 'scripts', 'journey-succession-r42-20261024.js')], {
  cwd: ROOT,
  env: Object.assign({}, process.env, { SEED: '23999', EARLY_KILL_DAY: '5', POST_DAYS: '3' }),
  encoding: 'utf8',
  timeout: 900000,
  maxBuffer: 64 * 1024 * 1024,
});
if (r.error) fail('spawn failed: ' + r.error.message);
if (r.status !== 0) {
  console.error((r.stderr || '').slice(-3000));
  fail('pilot exit status ' + r.status);
}
let rec;
try { rec = JSON.parse((r.stdout || '').trim()); } catch (e) { fail('stdout is not JSON: ' + e.message + ' :: ' + (r.stdout || '').slice(0, 300)); }
if (!rec.death) fail('no death record (village over before kill?)');
if (!rec.death.passed) fail('mantle did not pass on pilot seed');
ok('mantle passed: ' + rec.death.oldFirst + ' -> ' + rec.death.newFirst + ' d' + rec.death.day);
if (!rec.parity || !rec.parity.readable) fail('parity unreadable: ' + JSON.stringify(rec.parity));
ok('parity readable: equal=' + rec.parity.equal + ' inherited=' + JSON.stringify(rec.parity.inherited));
if (!rec.m4) fail('machinery m4 false: linOk=' + rec.death.linOk + ' moOk=' + rec.death.moOk);
ok('machinery m4 true');
if (!rec.functionSignals || typeof rec.functionSignals.any !== 'boolean') fail('functionSignals missing');
ok('functionSignals present: any=' + rec.functionSignals.any);
if (typeof rec.dayAdv !== 'number') fail('dayAdv missing');
ok('dayAdv=' + rec.dayAdv + ' s1=' + rec.s1 + ' s3=' + rec.s3 + ' s4=' + rec.s4);
if (!Array.isArray(rec.convoReads) || rec.convoReads.length === 0) fail('no convo reads (d+3 checkpoint should fire)');
ok('convo reads: ' + rec.convoReads.length);
// Cleanup: throwaway-seed evidence only (never touch run seeds).
let removed = 0;
if (fs.existsSync(EVID)) {
  for (const f of fs.readdirSync(EVID)) {
    if (f.includes('23999') || f.includes('r42-tele-23999')) {
      try { fs.unlinkSync(path.join(EVID, f)); removed++; } catch (e) {}
    }
  }
}
console.log('cleanup: removed ' + removed + ' throwaway-seed files');
console.log('ALL GREEN: r42 instrument proof (seed 23999, 5d+3d)');
