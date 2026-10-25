#!/usr/bin/env node
// test-journey-succession-r45-instruments-20261025.js — proof test for the
// r45 instrument (vouch snapshot + office-move census), RED/GREEN by driver.
// RED:  r44 driver on proof seed 24999 (short config) must NOT emit the r45
//       fields (e4/vouch45, eligibleAtDeath, bucketed officeMoves).
// GREEN: r45 driver on the same seed/config MUST emit all of them, with
//       every officeMove carrying buckets + villageMeanDelta.
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24999 are proof scratch and are deleted after the run (see run note).
// Usage: node scripts/test-journey-succession-r45-instruments-20261025.js
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

// ---- RED: r44 must lack every r45 field ----
const red = runDriver('journey-succession-r44-20261024.js');
check('RED e4 absent', red.e4 === undefined, 'e4=' + JSON.stringify(red.e4));
check('RED vouch45 absent', red.vouch45 === undefined);
check('RED eligibleAtDeath absent', !red.death || red.death.eligibleAtDeath === undefined);
check('RED officeMoves unbucketed', (red.officeMoves || []).every(m => m.buckets === undefined),
  'moves=' + (red.officeMoves || []).length);
check('RED tele lacks vouchSnap', !red.tele || red.tele['succession.vouchSnap'] === undefined);

// ---- GREEN: r45 must carry every r45 field ----
const green = runDriver('journey-succession-r45-20261025.js');
check('GREEN e4 present', green.e4 !== undefined && green.e4 !== null, JSON.stringify(green.e4));
check('GREEN vouch45 present', green.vouch45 !== undefined && green.vouch45 !== null,
  'verdict=' + (green.vouch45 && green.vouch45.verdict));
check('GREEN eligibleAtDeath recorded or organic-n/a',
  green.death && (Array.isArray(green.death.eligibleAtDeath) || green.death.eligibleAtDeath === null),
  'eligibleAtDeath=' + JSON.stringify(green.death && green.death.eligibleAtDeath));
check('GREEN officeDaily carries villageMean',
  (green.officeDaily || []).length > 0 && (green.officeDaily || []).every(d => d.villageMean !== undefined),
  'days=' + (green.officeDaily || []).length);
check('GREEN every officeMove bucketed',
  (green.officeMoves || []).every(m => m.buckets && typeof m.buckets.bearerN === 'number'
    && typeof m.buckets.giftN === 'number' && typeof m.buckets.rumorN === 'number'
    && typeof m.buckets.crisisN === 'number' && typeof m.buckets.otherN === 'number'
    && m.villageMeanDelta !== undefined && m.delta !== undefined),
  'moves=' + (green.officeMoves || []).length);
check('GREEN at least one real move day exercised (non-vacuous buckets)',
  (green.officeMoves || []).length >= 1,
  'moves=' + (green.officeMoves || []).length);
check('GREEN move census sums to day totals where checkable',
  (green.officeMoves || []).every(m => {
    const b = m.buckets;
    const named = b.bearerN + b.giftN + b.rumorN + b.crisisN + b.otherN;
    return named === m.totalLines;
  }), 'moves=' + (green.officeMoves || []).length);
check('GREEN tele carries vouchSnap+moveCensus',
  green.tele && green.tele['succession.vouchSnap'] !== undefined
  && green.tele['succession.moveCensus'] !== undefined,
  JSON.stringify(green.tele && { v: green.tele['succession.vouchSnap'], c: green.tele['succession.moveCensus'] }));
check('GREEN e5 census counts moves', green.e5 !== undefined && green.e5 !== null,
  JSON.stringify(green.e5));
check('GREEN empty eligible set verdicts n/a, not OPEN',
  !(green.death && Array.isArray(green.death.eligibleAtDeath) && green.death.eligibleAtDeath.length === 0)
  || (green.vouch45 && green.vouch45.verdict === 'n/a-none-eligible'),
  'verdict=' + (green.vouch45 && green.vouch45.verdict));

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL GREEN');
