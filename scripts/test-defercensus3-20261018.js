#!/usr/bin/env node
// test-defercensus3-20261018.js — proof for the sim-defercensus2b instrument
// (flesh-out loop arm sim-defercensus2, 2026-10-18, scale-onramp axis).
// READ-ONLY: proves the 3-substrate census instrument, never touches src/js
// or scripts/policies.
//
// (a) DEFERRAL-PREDICATE MIRROR: the sweep's deferral predicate
//     (raw>=t4 && !ready && peak<4) selects exactly attributeRun's deferral
//     days (scripts/wave4census-lib-20261017.js) on hand-built fixtures.
// (b) SMOKE (subprocess, per substrate): both composed policies drive with
//     the census live.
// (c) DET-GATE (subprocess, per substrate): instrument-on vs instrument-off
//     byte-identical trajectories, 4 fixed seeds, both-repeat.
// Usage: node scripts/test-defercensus3-20261018.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { attributeRun } = require('./wave4census-lib-20261017');

const T4 = 100;
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function snap(day, raw, peak, counts, short) {
  return { day, raw, peak, err: 0,
    armored: counts.armored | 0, armed: counts.armed | 0,
    tricks: counts.tricks | 0, veterans: counts.veterans | 0,
    ready: short.length === 0, short: short.slice(),
    demand: { armored: 4, armorP: 15, armed: 5, tricks: 3, veterans: 2 } };
}
const FULL = { armored: 4, armed: 5, tricks: 3, veterans: 2 };
function sweepDeferral(s) { return (s.raw | 0) >= T4 && !s.ready && (s.peak | 0) < 4; }

console.log('== (a) deferral-predicate mirror ==');
// 1. veterans single-bind over 5 deferral days; pre-door days excluded
{
  const snaps = [];
  for (let d = 1; d <= 12; d++) {
    const raw = d < 4 ? 40 + d * 10 : 100 + d * 5;
    const counts = d < 4 ? { armored: 1, armed: 5, tricks: 3, veterans: 0 }
                         : { armored: 4, armed: 5, tricks: 3, veterans: 1 };
    const short = d < 4 ? [] : ['veterans'];
    snaps.push(snap(d, raw, d < 4 ? 2 : 3, counts, d < 4 ? [] : short));
  }
  const a = attributeRun(snaps, { t4: T4 });
  const mine = snaps.filter(sweepDeferral).length;
  check('predicate selects exactly attributeRun deferral days', a.deferDays === mine && mine === 9, `attr=${a.deferDays} mine=${mine}`);
  check('veterans single-binds', a.binding === 'veterans', JSON.stringify(a.binding));
}
// 2. peak>=4 => unlocked even with deferral days
{
  const snaps = [];
  for (let d = 1; d <= 6; d++) snaps.push(snap(d, 120 + d, d < 6 ? 3 : 4, { armored: 4, armed: 5, tricks: 3, veterans: 1 }, d < 6 ? ['veterans'] : []));
  const a = attributeRun(snaps, { t4: T4 });
  check('peak>=4 attributes unlocked', a.binding === 'unlocked', JSON.stringify(a.binding));
}
// 3. zero deferral days => standing
{
  const snaps = [];
  for (let d = 1; d <= 5; d++) snaps.push(snap(d, 50 + d, 2, { armored: 1, armed: 2, tricks: 1, veterans: 0 }, ['armor', 'veterans']));
  const a = attributeRun(snaps, { t4: T4 });
  check('no deferral days attributes standing', a.binding === 'standing', JSON.stringify(a.binding));
  check('predicate agrees (0 deferral days)', snaps.filter(sweepDeferral).length === 0, '');
}
// 4. rotating short sets => none-single
{
  const snaps = [];
  const shorts = [['armor'], ['veterans'], ['armor'], ['veterans']];
  for (let d = 1; d <= 4; d++) snaps.push(snap(d, 100 + d * 10, 3, { armored: 3, armed: 5, tricks: 3, veterans: 1 }, shorts[d - 1]));
  const a = attributeRun(snaps, { t4: T4 });
  check('rotating bind attributes none-single', a.binding === 'none-single', JSON.stringify(a.binding));
}

const BASE_ENV = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1' };
const SUB_ENVS = {
  courtship: { SUBSTRATE: 'courtship', SEATDRIVE: '0' },
  readiness: { SUBSTRATE: 'readiness', SEATDRIVE: '0', VETREL: '1', REPOSITION: '1', NODEWITNESS: '1' },
  winseat:   { SUBSTRATE: 'winseat',   SEATDRIVE: '1', VETREL: '1', REPOSITION: '1', NODEWITNESS: '1' },
};

console.log('== (b) SMOKE (subprocess, per substrate) ==');
for (const [sub, senv] of Object.entries(SUB_ENVS)) {
  try {
    const env = Object.assign({}, process.env, BASE_ENV, senv, { SMOKE: '1' });
    execFileSync('node', [path.join(__dirname, 'defcensus3-sweep-20261018.js')], { env, stdio: 'pipe', timeout: 900000 });
    check(`SMOKE=1 [${sub}] exits 0 (both composed policies drive)`, true, '');
  } catch (e) {
    check(`SMOKE=1 [${sub}] exits 0 (both composed policies drive)`, false, String((e.stderr || e.message || e)).slice(0, 300));
  }
}

console.log('== (c) DET-GATE (subprocess, per substrate) ==');
for (const [sub, senv] of Object.entries(SUB_ENVS)) {
  try {
    const env = Object.assign({}, process.env, BASE_ENV, senv, { DET: '1' });
    execFileSync('node', [path.join(__dirname, 'defcensus3-sweep-20261018.js')], { env, stdio: 'pipe', timeout: 1800000 });
    check(`DET=1 [${sub}] exits 0 (instrument byte-identical, 4 seeds)`, true, '');
  } catch (e) {
    check(`DET=1 [${sub}] exits 0 (instrument byte-identical, 4 seeds)`, false, String((e.stderr || e.message || e)).slice(0, 300));
  }
}

console.log(`\nPROOF: ${pass} pass, ${fail} fail.`);
process.exit(fail ? 1 : 0);
