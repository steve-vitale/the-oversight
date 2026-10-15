#!/usr/bin/env node
// Separate child processes keep each seeded game in its own shared-global harness.
'use strict';
const cp = require('child_process'), path = require('path');
const K = require('./lib'), T = K.reporter('deed-observer');
function run(observe) {
  const raw = cp.execFileSync(process.execPath, [path.join(__dirname, 'deed-screen.js'), '--child', '--seed', '7', '--days', '150', '--observe', observe], { encoding: 'utf8', timeout: 120000, maxBuffer: 8 * 1024 * 1024 });
  return JSON.parse(raw.split('@@DEED@@').pop());
}
const on = run('1'), off = run('0');
T.ok('150-day observation preserves the full gameplay hash', on.stateHash === off.stateHash);
T.ok('150-day observation preserves the standard driver result and pacing counts', JSON.stringify(on.row) === JSON.stringify(off.row));
T.ok('observer sees real credited work by bearers and villagers', on.people.some(p => p.bearerDays.length && Object.keys(p.events).length) && on.people.some(p => !p.bearerDays.length && Object.keys(p.events).length));
T.ok('disabled observation records no people or intercepted ceremonies', off.people.length === 0 && off.ascensions.length === 0);
T.done();
