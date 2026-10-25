#!/usr/bin/env node
// test-journey-succession-r46-instruments-20261025.js — proof test for the
// r46 instrument (echo v2b + call-scoped office attribution), RED/GREEN.
// RED:  r45 driver on proof seed 24999 (short config) must NOT emit the r46
//       fields (e6/callCheck, m3v2b, echoV2b, officeCallMoves).
// GREEN: r46 driver on the same seed/config MUST emit all of them, with
//       every callMove bucketed and summing to its call line total, v2b <= v2,
//       and the C1 cross-check (every officeDaily move day has a callMove).
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24999 are proof scratch and are deleted after the run (see run note).
// Usage: node scripts/test-journey-succession-r46-instruments-20261025.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ENV = Object.assign({}, process.env, { SEED: '24999', EARLY_KILL_DAY: '5', POST_DAYS: '30' });

function runDriver(script) {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', script)], {
    cwd: ROOT, env: ENV, timeout: 600000, maxBuffer: 64 * 1024 * 1024,
  }).toString();
  const start = out.lastIndexOf('\n{');
  const json = JSON.parse(out.slice(start + 1));
  return json;
}

let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

// ---- RED: r45 must lack every r46 field ----
const red = runDriver('journey-succession-r45-20261025.js');
check('RED e6 absent', red.e6 === undefined, 'e6=' + JSON.stringify(red.e6));
check('RED callCheck absent', red.callCheck === undefined);
check('RED m3v2b absent', red.m3v2b === undefined);
check('RED echoV2b absent', !red.funeral || red.funeral.echoV2b === undefined);
check('RED officeCallMoves absent', red.officeCallMoves === undefined);
check('RED tele lacks echoV2b/callMoves', !red.tele || (red.tele['succession.echoV2b'] === undefined && red.tele['succession.callMoves'] === undefined));

// ---- GREEN: r46 must carry every r46 field ----
const green = runDriver('journey-succession-r46-20261025.js');
check('GREEN e6 present', green.e6 !== undefined && green.e6 !== null, JSON.stringify(green.e6));
check('GREEN callCheck present', green.callCheck !== undefined && green.callCheck !== null,
  JSON.stringify(green.callCheck));
check('GREEN m3v2b present', green.m3v2b !== undefined,
  'm3v2b=' + green.m3v2b + ' (' + (green.m3v2bDetail || '') + ')');
check('GREEN echoV2b recorded', green.funeral && typeof green.funeral.echoV2b === 'number',
  'v2=' + (green.funeral && green.funeral.echoV2) + ' v2b=' + (green.funeral && green.funeral.echoV2b)
  + ' excluded=' + (green.funeral && green.funeral.echoV2bExcluded));
check('GREEN v2b <= v2', (green.funeral.echoV2b || 0) <= (green.funeral.echoV2 || 0));
check('GREEN officeCallMoves is an array', Array.isArray(green.officeCallMoves),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN every callMove bucketed and summing to its call total',
  (green.officeCallMoves || []).every(m => m.buckets && typeof m.buckets.bearerN === 'number'
    && typeof m.buckets.giftN === 'number' && typeof m.buckets.rumorN === 'number'
    && typeof m.buckets.crisisN === 'number' && typeof m.buckets.otherN === 'number'
    && (m.buckets.bearerN + m.buckets.giftN + m.buckets.rumorN + m.buckets.crisisN + m.buckets.otherN) === m.totalLines
    && m.from !== undefined && m.to !== undefined && Array.isArray(m.movers)),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN C1 cross-check ok (every daily move day has a callMove)',
  green.callCheck && green.callCheck.ok === true,
  JSON.stringify(green.callCheck));
check('GREEN tele carries echoV2b+callMoves+callCensus',
  green.tele && green.tele['succession.echoV2b'] !== undefined
  && green.tele['succession.callMoves'] !== undefined
  && green.tele['succession.callCensus'] !== undefined,
  JSON.stringify(green.tele && { v2b: green.tele['succession.echoV2b'], cm: green.tele['succession.callMoves'], cc: green.tele['succession.callCensus'] }));
check('GREEN r45 fields still present (no regression)',
  green.e4 !== undefined && green.vouch45 !== undefined && Array.isArray(green.officeMoves),
  'e4=' + JSON.stringify(green.e4) + ' vouch45=' + JSON.stringify(green.vouch45 && green.vouch45.verdict));

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
