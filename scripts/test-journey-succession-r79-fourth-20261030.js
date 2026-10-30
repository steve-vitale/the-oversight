#!/usr/bin/env node
// test-journey-succession-r79-fourth-20261030.js — proof test for the r79
// instrument (FOURTH_KILL_DPLUS fourth handoff, on top of r72's third +
// r70's SAYTRACE + r64's second handoff). RED/GREEN.
// RED:  r72 driver on proof seed 24998 (short config, second + third kills forced)
//       must NOT emit fourthDeath / relPreDeath4 / relPost4 / inh4.
// GREEN: r79 driver on the same seed/config (second + third + fourth kills forced)
//       MUST emit all of them, with the chain entries tagged
//       scriptedSecond=true, scriptedThird=true and scriptedFourth=true respectively, and
//       tele fourthDeath=1 + relSnapshots4=2.
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24998 (tele + transcripts) are proof scratch and are deleted by this
// script after the run (r56 pattern).
// Usage: node scripts/test-journey-succession-r79-fourth-20261030.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-30');
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
  // ---- RED: r72 lacks every r79 fourth field ----
  const red = runDriver('journey-succession-r72-20261029.js', { SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3' });
  check('RED has a forced third handoff (sanity: probe seed exercises chains)',
    !!(red.thirdDeath && red.thirdDeath.scripted),
    'thirdDeath=' + JSON.stringify(red.thirdDeath && { scripted: red.thirdDeath.scripted, day: red.thirdDeath.day }));
  check('RED lacks rec.fourthDeath/relPreDeath4/relPost4/inh4',
    red.fourthDeath === undefined && red.relPreDeath4 === undefined && red.relPost4 === undefined && red.inh4 === undefined);

  // ---- GREEN: r79 emits every r79 fourth field ----
  const green = runDriver('journey-succession-r79-20261030.js', { SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3', FOURTH_KILL_DPLUS: '3' });
  check('GREEN fourthDeath present, scripted, passed',
    !!(green.fourthDeath && green.fourthDeath.scripted && green.fourthDeath.passed),
    'fourthDeath=' + JSON.stringify(green.fourthDeath));
  check('GREEN fourthDeath carries linOk + moOk booleans and three dplus bases',
    green.fourthDeath && typeof green.fourthDeath.linOk === 'boolean' && typeof green.fourthDeath.moOk === 'boolean'
      && typeof green.fourthDeath.dplus === 'number' && typeof green.fourthDeath.dplusSecond === 'number' && typeof green.fourthDeath.dplusFirst === 'number',
    'lin=' + (green.fourthDeath && green.fourthDeath.linOk) + ' mo=' + (green.fourthDeath && green.fourthDeath.moOk));
  check('GREEN relPreDeath4 + relPost4 present with distinct selfIds',
    !!(green.relPreDeath4 && green.relPost4 && green.relPreDeath4.selfId && green.relPost4.selfId && green.relPreDeath4.selfId !== green.relPost4.selfId),
    'pre4self=' + (green.relPreDeath4 && green.relPreDeath4.selfId) + ' post4self=' + (green.relPost4 && green.relPost4.selfId));
  check('GREEN inh4 readable with kept/inherited classes present',
    !!(green.inh4 && green.inh4.readable) && Array.isArray(green.inh4.keptPlants) && Array.isArray(green.inh4.inheritedSkills),
    'readable=' + (green.inh4 && green.inh4.readable));
  check('GREEN chainDeaths tags one scriptedSecond, one scriptedThird and one scriptedFourth entry',
    (green.chainDeaths || []).some(c => c.scriptedSecond === true) && (green.chainDeaths || []).some(c => c.scriptedThird === true) && (green.chainDeaths || []).some(c => c.scriptedFourth === true),
    'chains=' + JSON.stringify((green.chainDeaths || []).map(c => ({ d: c.deadFirst, n: c.newFirst, s2: !!c.scriptedSecond, s3: !!c.scriptedThird, s4: !!c.scriptedFourth }))));
  check('GREEN tele fourthDeath=1 and relSnapshots4=2',
    green.tele && green.tele['succession.fourthDeath'] === 1 && green.tele['succession.relSnapshots4'] === 2,
    'tele=' + JSON.stringify(green.tele && { fourth: green.tele['succession.fourthDeath'], snaps4: green.tele['succession.relSnapshots4'] }));
  check('GREEN third handoff still intact (no regression in r79 driver)',
    !!(green.thirdDeath && green.thirdDeath.scripted && green.thirdDeath.passed) && !!green.relPost3,
    'thirdDeath=' + JSON.stringify(green.thirdDeath && { passed: green.thirdDeath.passed }));
} finally {
  // Proof scratch cleanup (r56 pattern): tele + transcripts for seed 24998 only.
  // RED (r72 driver) writes into evidence/2026-10-29 (its hardcoded EVID_DIR);
  // GREEN (r79 driver) writes into evidence/2026-10-30 — scan BOTH, or the
  // RED scratch survives (r79 proof-test fix; r72's test never saw this
  // because both its drivers shared one EVID_DIR).
  for (const dir of [path.join(ROOT, 'evidence', '2026-10-29'), EVID]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if ((f.includes('-24998.') || f.includes('-24998-')) && (f.includes('journey-succession-r72-') || f.includes('journey-succession-r79-'))) {
        try { fs.unlinkSync(path.join(dir, f)); console.log('SCRATCH-DELETED ' + f); } catch (e) {}
      }
    }
  }
}
if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL PASS');
