#!/usr/bin/env node
// test-m2c-adopted-refs-r198.js — r198 §M2c FIX proof.
// Runs the r198 probe in smoke mode on the two r188 double-count
// configurations (89705 pass A flags; 89701 pass C flags) and asserts
// the re-scoped M2c rule on each: census fights == DISTINCT opens
// (engineOpensDistinctW4 + policyOnlyOpensW4) with zero census errors.
// If the re-entrant startCombat scenario recurs on the new substrate,
// the legacy call count (engineOpensW4) exceeds the distinct count —
// the test asserts the distinct rule holds anyway (that IS the proof
// the guard works) and logs the recurrence. Writes only under
// /tmp/m2c-proof-r198/ (EVIDDIR override); never touches the pass corpus.
// Each smoke run is a full ~140-day seed; expect several minutes total.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROBE = path.join(__dirname, 'probe-endgame-r198-20261114.js');
const SCRATCH = '/tmp/m2c-proof-r198';
fs.mkdirSync(SCRATCH, { recursive: true });

const BASE_ENV = {
  FULLSEAT: '1', VETCOMMIT: '1', CAPABLE_GREEDY: '1',
  ARMORYDRIVE: '1', CAPABLE_VETGUARD: '1', SMOKE: '1',
};

function runSmoke(seed, extraEnv, tag) {
  const dir = path.join(SCRATCH, tag);
  fs.mkdirSync(dir, { recursive: true });
  const out = execFileSync(process.execPath, [PROBE], {
    env: { ...process.env, ...BASE_ENV, ...extraEnv, SEEDS: String(seed), EVIDDIR: dir },
    encoding: 'utf8', timeout: 0, maxBuffer: 64 * 1024 * 1024,
  });
  const line = out.split('\n').find((l) => l.startsWith('CENSUS '));
  if (!line) throw new Error(`no CENSUS line for seed ${seed} (${tag}); stdout tail:\n${out.slice(-2000)}`);
  return JSON.parse(line.slice('CENSUS '.length));
}

let fail = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
}

for (const [seed, extra, tag] of [
  [89705, {}, 'a-89705'],
  [89701, { CAPSTONE: '1', BUYOUT: '1', BUYOUT_EARLY: '1' }, 'c-89701'],
]) {
  const c = runSmoke(seed, extra, tag);
  const fights = (c.fights || []).length;
  const distinct = (c.engineOpensDistinct | 0) + (c.policyOnlyOpens | 0);
  const calls = (c.engineOpens | 0) + (c.policyOnlyOpens | 0);
  console.log(`seed ${seed} (${tag}): fights=${fights} distinctOpens=${distinct} callOpens=${calls} errs=${c.censusErrors}`);
  check(`${seed}: fights == distinct opens`, fights === distinct, `fights=${fights} distinct=${distinct}`);
  check(`${seed}: censusErrors == 0`, (c.censusErrors | 0) === 0, `errs=${c.censusErrors}`);
  check(`${seed}: distinct <= calls`, distinct <= calls, `distinct=${distinct} calls=${calls}`);
  if (calls > distinct) console.log(`NOTE ${seed}: re-entrant scenario RECURRED (calls ${calls} > distinct ${distinct}) — guard held`);
  else console.log(`NOTE ${seed}: no re-entrant double-count on this substrate (calls == distinct)`);
}

if (fail) { console.error(`test-m2c-adopted-refs-r198: ${fail} failure(s)`); process.exit(1); }
console.log('test-m2c-adopted-refs-r198: ALL PASS');
