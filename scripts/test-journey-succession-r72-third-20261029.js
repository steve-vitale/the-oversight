#!/usr/bin/env node
// test-journey-succession-r72-third-20261029.js — proof test for the r72
// instrument (THIRD_KILL_DPLUS third handoff, on top of r70's SAYTRACE +
// r64's second handoff). RED/GREEN.
// RED:  r70 driver on proof seed 24998 (short config, second kill forced)
//       must NOT emit thirdDeath / relPreDeath3 / relPost3 / inh3.
// GREEN: r72 driver on the same seed/config (second + third kills forced)
//       MUST emit all of them, with the chain entries tagged
//       scriptedSecond=true and scriptedThird=true respectively, and
//       tele thirdDeath=1 + relSnapshots3=2.
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24998 (tele + transcripts) are proof scratch and are deleted by this
// script after the run (r56 pattern).
// Usage: node scripts/test-journey-succession-r72-third-20261029.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-29');
const ENV = Object.assign({}, process.env, { SEED: '24998', EARLY_KILL_DAY: '5', POST_DAYS: '30' });

function runDriver(script, extraEnv) {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', script)], {
    cwd: ROOT, env: Object.assign({}, ENV, extraEnv || {}), timeout: 600000, maxBuffer: 64 * 1024 * 1024,
  }).toString();
  const start = out.lastIndexOf('\n{');
  return JSON.parse(out.slice(start + 1));
}

let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

try {
  // ---- RED: r70 lacks every r72 third field ----
  const red = runDriver('journey-succession-r70-20261029.js', { SECOND_KILL_DPLUS: '3' });
  check('RED has a forced second handoff (sanity: probe seed exercises chains)',
    !!(red.secondDeath && red.secondDeath.scripted),
    'secondDeath=' + JSON.stringify(red.secondDeath && { scripted: red.secondDeath.scripted, day: red.secondDeath.day }));
  check('RED lacks rec.thirdDeath/relPreDeath3/relPost3/inh3',
    red.thirdDeath === undefined && red.relPreDeath3 === undefined && red.relPost3 === undefined && red.inh3 === undefined);

  // ---- GREEN: r72 emits every r72 third field ----
  const green = runDriver('journey-succession-r72-20261029.js', { SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3' });
  check('GREEN thirdDeath present, scripted, passed',
    !!(green.thirdDeath && green.thirdDeath.scripted && green.thirdDeath.passed),
    'thirdDeath=' + JSON.stringify(green.thirdDeath));
  check('GREEN thirdDeath carries linOk + moOk booleans',
    green.thirdDeath && typeof green.thirdDeath.linOk === 'boolean' && typeof green.thirdDeath.moOk === 'boolean',
    'lin=' + (green.thirdDeath && green.thirdDeath.linOk) + ' mo=' + (green.thirdDeath && green.thirdDeath.moOk));
  check('GREEN relPreDeath3 + relPost3 present with distinct selfIds',
    !!(green.relPreDeath3 && green.relPost3 && green.relPreDeath3.selfId && green.relPost3.selfId && green.relPreDeath3.selfId !== green.relPost3.selfId),
    'pre3self=' + (green.relPreDeath3 && green.relPreDeath3.selfId) + ' post3self=' + (green.relPost3 && green.relPost3.selfId));
  check('GREEN inh3 readable with kept/inherited classes present',
    !!(green.inh3 && green.inh3.readable) && Array.isArray(green.inh3.keptPlants) && Array.isArray(green.inh3.inheritedSkills),
    'readable=' + (green.inh3 && green.inh3.readable));
  check('GREEN chainDeaths tags one scriptedSecond and one scriptedThird entry',
    (green.chainDeaths || []).some(c => c.scriptedSecond === true) && (green.chainDeaths || []).some(c => c.scriptedThird === true),
    'chains=' + JSON.stringify((green.chainDeaths || []).map(c => ({ d: c.deadFirst, n: c.newFirst, s2: !!c.scriptedSecond, s3: !!c.scriptedThird }))));
  check('GREEN tele thirdDeath=1 and relSnapshots3=2',
    green.tele && green.tele['succession.thirdDeath'] === 1 && green.tele['succession.relSnapshots3'] === 2,
    'tele=' + JSON.stringify(green.tele && { third: green.tele['succession.thirdDeath'], snaps3: green.tele['succession.relSnapshots3'] }));
  check('GREEN second handoff still intact (no regression in r72 driver)',
    !!(green.secondDeath && green.secondDeath.scripted && green.secondDeath.passed) && !!green.relPost2,
    'secondDeath=' + JSON.stringify(green.secondDeath && { passed: green.secondDeath.passed }));
} finally {
  // Proof scratch cleanup (r56 pattern): tele + transcripts for seed 24998 only.
  for (const f of fs.readdirSync(EVID)) {
    if ((f.includes('-24998.') || f.includes('-24998-')) && (f.includes('journey-succession-r70-') || f.includes('journey-succession-r72-'))) {
      try { fs.unlinkSync(path.join(EVID, f)); console.log('SCRATCH-DELETED ' + f); } catch (e) {}
    }
  }
}
if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL PASS');
