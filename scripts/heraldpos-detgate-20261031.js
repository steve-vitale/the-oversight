#!/usr/bin/env node
// heraldpos-detgate-20261031.js — sim-heraldpos-a trajectory det-gate.
//
// Compares seed 87127 recorder-ON (heraldpos sweep, stdout SUMMARY +
// HASHES) against recorder-OFF (heraldpos-detgate-run, stdout JSON)
// in memory. No file writes anywhere: both legs are child processes
// whose stdout is captured, so the gate runs cleanly during the
// EPERM flap. Prints DETGATE PASS (hashes byte-identical, outcomes
// equal) or FAIL with the first difference, and exits non-zero on
// FAIL. The recorder-ON leg's SUMMARY outcomes are also checked
// against the judged pilot values (201d, national, wave 4 day 152,
// omen stage 2 day 165) so the chain judged -> re-run -> off holds.
'use strict';
const { execSync } = require('child_process');
const path = require('path');
const REPO = path.join(__dirname, '..');
const BASE_ENV = Object.assign({}, process.env, {
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '1', FULLSEAT: '1', HERALD: '1', MUSTER: '1', HERALDPOS: '1',
  WRITE_RETRIES: '1', SEEDS: '87127',
});

function run(cmd, env) {
  return execSync(cmd, { cwd: REPO, env: env, maxBuffer: 64 * 1024 * 1024 }).toString();
}

const onOut = run('node scripts/heraldpos-sweep-20261031.js', BASE_ENV);
const sumLine = onOut.split('\n').find((l) => l.startsWith('SUMMARY '));
const hashLine = onOut.split('\n').find((l) => l.startsWith('HASHES '));
if (!sumLine || !hashLine) { console.log('DETGATE FAIL: recorder-ON leg produced no SUMMARY/HASHES'); process.exit(1); }
const sum = JSON.parse(sumLine.slice('SUMMARY '.length));
const onHashes = JSON.parse(hashLine.slice('HASHES '.length)).hashes;

const offEnv = Object.assign({}, BASE_ENV);
delete offEnv.HERALD; delete offEnv.MUSTER; delete offEnv.HERALDPOS; delete offEnv.WRITE_RETRIES;
const offOut = run('node scripts/heraldpos-detgate-run-20261031.js', offEnv);
const off = JSON.parse(offOut.trim().split('\n').pop());

const problems = [];
function eq(name, a, b) { if (a !== b) problems.push(name + ': on=' + JSON.stringify(a) + ' off=' + JSON.stringify(b)); }
eq('gameDays', sum.gameDays, off.gameDays);
eq('won', sum.won, off.won);
eq('national', sum.national, off.national);
eq('table', sum.table, off.table);
eq('maxWave', sum.maxWave, off.maxWave);
eq('w4Day', sum.w4Day, off.w4Day);
eq('endOmenStage', sum.endOmenStage, off.endOmenStage);
eq('endOmenDay', sum.endOmenDay, off.endOmenDay);
// Judged-pilot chain check for the recorder-ON re-run itself.
const judged = { gameDays: 201, won: 0, national: 1, table: 0, maxWave: 4, w4Day: 152, endOmenStage: 2, endOmenDay: 165 };
Object.keys(judged).forEach((k) => { if (sum[k] !== judged[k]) problems.push('judged-repro ' + k + ': pilot=' + judged[k] + ' rerun=' + JSON.stringify(sum[k])); });
if (!Array.isArray(onHashes) || !Array.isArray(off.hashes) || onHashes.length !== off.hashes.length) {
  problems.push('hash length: on=' + (onHashes && onHashes.length) + ' off=' + (off.hashes && off.hashes.length));
} else {
  for (let i = 0; i < onHashes.length; i++) {
    if (onHashes[i] !== off.hashes[i]) { problems.push('hash first diff at index ' + i + ': on=' + onHashes[i] + ' off=' + off.hashes[i]); break; }
  }
}
if (problems.length) {
  console.log('DETGATE FAIL');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log('DETGATE PASS: 87127 recorder-on == recorder-off, ' + onHashes.length + ' daily hashes identical; re-run reproduces judged pilot outcomes.');
