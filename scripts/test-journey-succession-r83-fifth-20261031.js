#!/usr/bin/env node
// test-journey-succession-r83-fifth-20261031.js — proof test for the r83
// instrument (FIFTH_KILL_DPLUS fifth handoff, on top of r79's fourth +
// r72's third + r70's SAYTRACE + r64's second handoff). RED/GREEN.
// RED:  r79 driver on proof seed 24998 (short config, second + third + fourth kills forced)
//       must NOT emit fifthDeath / relPreDeath5 / relPost5 / inh5.
// GREEN: r83 driver on the same seed/config (second + third + fourth + fifth kills forced)
//       MUST emit all of them, with the chain entries tagged
//       scriptedSecond=true, scriptedThird=true, scriptedFourth=true and
//       scriptedFifth=true respectively, and
//       tele fifthDeath=1 + relSnapshots5=2.
// The proof asserts on driver STDOUT JSON only; evidence files for seed
// 24998 (tele + transcripts) are proof scratch and are deleted by this
// script after the run (r56 pattern).
// Usage: node scripts/test-journey-succession-r83-fifth-20261031.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-31');
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
  // ---- RED: r79 lacks every r83 fifth field ----
  const red = runDriver('journey-succession-r79-20261030.js', { SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3', FOURTH_KILL_DPLUS: '3' });
  check('RED has a forced fourth handoff (sanity: probe seed exercises chains)',
    !!(red.fourthDeath && red.fourthDeath.scripted),
    'fourthDeath=' + JSON.stringify(red.fourthDeath && { scripted: red.fourthDeath.scripted, day: red.fourthDeath.day }));
  check('RED lacks rec.fifthDeath/relPreDeath5/relPost5/inh5',
    red.fifthDeath === undefined && red.relPreDeath5 === undefined && red.relPost5 === undefined && red.inh5 === undefined);

  // ---- GREEN: r83 emits every r83 fifth field ----
  const green = runDriver('journey-succession-r83-20261031.js', { SECOND_KILL_DPLUS: '3', THIRD_KILL_DPLUS: '3', FOURTH_KILL_DPLUS: '3', FIFTH_KILL_DPLUS: '3' });
  check('GREEN fifthDeath present, scripted, passed',
    !!(green.fifthDeath && green.fifthDeath.scripted && green.fifthDeath.passed),
    'fifthDeath=' + JSON.stringify(green.fifthDeath));
  check('GREEN fifthDeath carries linOk + moOk booleans and four dplus bases',
    green.fifthDeath && typeof green.fifthDeath.linOk === 'boolean' && typeof green.fifthDeath.moOk === 'boolean'
      && typeof green.fifthDeath.dplus === 'number' && typeof green.fifthDeath.dplusThird === 'number' && typeof green.fifthDeath.dplusSecond === 'number' && typeof green.fifthDeath.dplusFirst === 'number',
    'lin=' + (green.fifthDeath && green.fifthDeath.linOk) + ' mo=' + (green.fifthDeath && green.fifthDeath.moOk));
  check('GREEN relPreDeath5 + relPost5 present with distinct selfIds',
    !!(green.relPreDeath5 && green.relPost5 && green.relPreDeath5.selfId && green.relPost5.selfId && green.relPreDeath5.selfId !== green.relPost5.selfId),
    'pre5self=' + (green.relPreDeath5 && green.relPreDeath5.selfId) + ' post5self=' + (green.relPost5 && green.relPost5.selfId));
  check('GREEN inh5 readable with kept/inherited classes present',
    !!(green.inh5 && green.inh5.readable) && Array.isArray(green.inh5.keptPlants) && Array.isArray(green.inh5.inheritedSkills),
    'readable=' + (green.inh5 && green.inh5.readable));
  check('GREEN chainDeaths tags one scriptedSecond, one scriptedThird, one scriptedFourth and one scriptedFifth entry',
    (green.chainDeaths || []).some(c => c.scriptedSecond === true) && (green.chainDeaths || []).some(c => c.scriptedThird === true) && (green.chainDeaths || []).some(c => c.scriptedFourth === true) && (green.chainDeaths || []).some(c => c.scriptedFifth === true),
    'chains=' + JSON.stringify((green.chainDeaths || []).map(c => ({ d: c.deadFirst, n: c.newFirst, s2: !!c.scriptedSecond, s3: !!c.scriptedThird, s4: !!c.scriptedFourth, s5: !!c.scriptedFifth }))));
  check('GREEN tele fifthDeath=1 and relSnapshots5=2',
    green.tele && green.tele['succession.fifthDeath'] === 1 && green.tele['succession.relSnapshots5'] === 2,
    'tele=' + JSON.stringify(green.tele && { fifth: green.tele['succession.fifthDeath'], snaps5: green.tele['succession.relSnapshots5'] }));
  check('GREEN fourth handoff still intact (no regression in r83 driver)',
    !!(green.fourthDeath && green.fourthDeath.scripted && green.fourthDeath.passed) && !!green.relPost4,
    'fourthDeath=' + JSON.stringify(green.fourthDeath && { passed: green.fourthDeath.passed }));
} finally {
  // Proof scratch cleanup (r56 pattern): tele + transcripts for seed 24998 only.
  // RED (r79 driver) writes into evidence/2026-10-30 (its hardcoded EVID_DIR);
  // GREEN (r83 driver) writes into evidence/2026-10-31 — scan BOTH, or the
  // RED scratch survives (r79 proof-test fix; r72's test never saw this
  // because both its drivers shared one EVID_DIR).
  for (const dir of [path.join(ROOT, 'evidence', '2026-10-30'), EVID]) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if ((f.includes('-24998.') || f.includes('-24998-')) && (f.includes('journey-succession-r79-') || f.includes('journey-succession-r83-'))) {
        try { fs.unlinkSync(path.join(dir, f)); console.log('SCRATCH-DELETED ' + f); } catch (e) {}
      }
    }
  }
}
if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL PASS');
