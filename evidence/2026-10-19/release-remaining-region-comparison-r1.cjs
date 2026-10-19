#!/usr/bin/env node
'use strict';
const { spawnSync } = require('child_process'), path = require('path');
const K = require('../../scripts/godpath/lib'), T = K.reporter('region-comparison');
function run(extra) {
  const p = spawnSync(process.execPath, [path.join(__dirname, '../../scripts/gear-usage-audit.js'), '--child', '--policy', 'maker', '--seed', '7', '--days', '3', ...extra], { encoding: 'utf8', timeout: 30000 });
  if (p.status !== 0) throw new Error(p.stderr || p.stdout);
  return JSON.parse(p.stdout.split('@@GEAR@@').pop());
}
const selected = ['--region', 'eu_temperate', '--origin', 'Berlin, Germany'];
const observed = run(selected), plain = run([...selected, '--observe', '0']);
T.ok('standard driver honors explicit region and origin', observed.region === 'eu_temperate' && observed.origin === 'Berlin, Germany');
T.ok('regional census observes real actions', Object.values(observed.calls).some(n => n > 0) && observed.days === 3);
T.ok('observer preserves all comparable gameplay state in selected region', observed.stateHash === plain.stateHash);
const defaultRun = run([]);
T.ok('omitted selection preserves ordinary woodland origin behavior', defaultRun.region === 'na_eastern_woodlands' && defaultRun.origin === 'Columbus, Ohio');
const invalid = spawnSync(process.execPath, [path.join(__dirname, '../../scripts/gear-usage-audit.js'), '--child', '--region', 'not_a_region', '--days', '1'], { encoding: 'utf8', timeout: 30000 });
T.ok('invalid requested region fails rather than silently falling back', invalid.status !== 0 && /not playable/.test(invalid.stderr));
T.done();
