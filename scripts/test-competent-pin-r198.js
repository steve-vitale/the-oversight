#!/usr/bin/env node
// test-competent-pin-r198.js — r198 §PIN proof.
// Spawns two subprocesses (COMPETENT_PIN=r127 / unset), each requiring
// scripts/policies/capable.js, and asserts which competent module lands
// in require.cache. Exit 0 iff the pin loads competent-r127.js (and NOT
// the live competent.js) and the default loads competent.js (and NOT the
// frozen copy), with the composed capable policy loading in both cases.
// No game code runs; no files written. Any module in capable's transitive
// closure that requires './competent' unconditionally will show up here
// as the live module present under the pin — and fail the test.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');

const POLICIES = path.join(__dirname, 'policies');
const CHILD = `
const cap = require(${JSON.stringify(path.join(POLICIES, 'capable.js'))});
const keys = Object.keys(require.cache);
const has = (s) => keys.some((k) => k.endsWith(s));
console.log(JSON.stringify({ r127: has('competent-r127.js'), live: has('/competent.js'), capable: cap.capable != null }));
`;

function run(env) {
  const out = execFileSync(process.execPath, ['-e', CHILD], {
    env: { ...process.env, ...env }, encoding: 'utf8', timeout: 60000,
  });
  return JSON.parse(out.trim().split('\n').pop());
}

let fail = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fail++;
}

const pinned = run({ COMPETENT_PIN: 'r127' });
check('pin loads competent-r127.js', pinned.r127 === true, JSON.stringify(pinned));
check('pin does NOT load live competent.js', pinned.live === false, JSON.stringify(pinned));
check('pin composes capable', pinned.capable === true, JSON.stringify(pinned));

const live = run({});
check('default loads live competent.js', live.live === true, JSON.stringify(live));
check('default does NOT load competent-r127.js', live.r127 === false, JSON.stringify(live));
check('default composes capable', live.capable === true, JSON.stringify(live));

if (fail) { console.error(`test-competent-pin-r198: ${fail} failure(s)`); process.exit(1); }
console.log('test-competent-pin-r198: 6/6 PASS');
