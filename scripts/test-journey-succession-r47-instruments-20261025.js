#!/usr/bin/env node
// test-journey-succession-r47-instruments-20261025.js — proof test for the
// r47 instrument (scripted day-5 regime + bearerDeltaExact + eventClass), RED/GREEN.
// RED:  r46 driver on proof seed 24999 (short config) must NOT emit the r47
//       fields (e7, bearerDeltaExact, soloOffice, eventClass).
// GREEN: r47 driver on the same seed/config MUST emit all of them, with
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
const red = runDriver('journey-succession-r46-20261025.js');
check('RED e7 absent', red.e7 === undefined, 'e7=' + JSON.stringify(red.e7));
check('RED bearerDeltaExact absent', !(red.officeCallMoves || []).some(m => m.bearerDeltaExact !== undefined));
check('RED soloOffice absent', !(red.officeCallMoves || []).some(m => m.soloOffice !== undefined));
check('RED eventClass absent', !(red.officeCallMoves || []).some(m => m.eventClass !== undefined));
check('RED tele lacks soloOffice', !red.tele || red.tele['succession.callMovesSoloOffice'] === undefined);

// ---- GREEN: r46 must carry every r46 field ----
const green = runDriver('journey-succession-r47-20261025.js');
check('GREEN e7 present', green.e7 !== undefined && green.e7 !== null, JSON.stringify(green.e7));
check('GREEN scripted kill staged on proof seed (5 phase-A calls from day 1 land the kill on day 6)',
  green.death && green.death.scripted === true && green.death.day === 6,
  'death=' + JSON.stringify(green.death && { scripted: green.death.scripted, day: green.death.day }));
check('GREEN every same-bearer callMove carries numeric bearerDeltaExact, chain handoffs null',
  (green.officeCallMoves || []).every(m => m.bearerChanged ? m.bearerDeltaExact === null : typeof m.bearerDeltaExact === 'number'),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN every callMove carries soloOffice + eventClass',
  (green.officeCallMoves || []).every(m => typeof m.soloOffice === 'boolean' && typeof m.eventClass === 'string'),
  'moves=' + (green.officeCallMoves || []).length);
check('GREEN solo-office deltas within +-2 (threshold artifact, not hidden mechanism)',
  (green.officeCallMoves || []).filter(m => m.soloOffice && !m.bearerChanged).every(m => Math.abs(m.delta) <= 2),
  'solo=' + JSON.stringify((green.officeCallMoves || []).filter(m => m.soloOffice).map(m => m.delta)));
check('GREEN e6/callCheck still present (no regression)', green.e6 !== undefined && green.callCheck !== undefined,
  JSON.stringify(green.callCheck));
check('GREEN m3v2b present', green.m3v2b !== undefined,
  'm3v2b=' + green.m3v2b + ' (' + (green.m3v2bDetail || '') + ')');
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
check('GREEN tele soloOffice/eventOnly match e7 (tele is written before finish, so it must not read rec.e7)',
  green.tele && green.tele['succession.callMovesSoloOffice'] === (green.e7 && green.e7.soloOffice)
  && green.tele['succession.callMovesEventOnly'] === (green.e7 && green.e7.eventClass && green.e7.eventClass['event-only']),
  'tele=' + JSON.stringify(green.tele && { solo: green.tele['succession.callMovesSoloOffice'], ev: green.tele['succession.callMovesEventOnly'] }) + ' e7=' + JSON.stringify(green.e7 && { solo: green.e7.soloOffice, ev: green.e7.eventClass }));
check('GREEN tele carries echoV2b+callMoves+callCensus',
  green.tele && green.tele['succession.echoV2b'] !== undefined
  && green.tele['succession.callMoves'] !== undefined
  && green.tele['succession.callCensus'] !== undefined,
  JSON.stringify(green.tele && { v2b: green.tele['succession.echoV2b'], cm: green.tele['succession.callMoves'], cc: green.tele['succession.callCensus'] }));
check('GREEN r46 fields still present (no regression)',
  green.e4 !== undefined && green.vouch45 !== undefined && Array.isArray(green.officeMoves) && green.e6 !== undefined,
  'e4=' + JSON.stringify(green.e4) + ' vouch45=' + JSON.stringify(green.vouch45 && green.vouch45.verdict));

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
