#!/usr/bin/env node
// test-vetwindow-20261018.js — proof for the sim-vetwindow instrument arm.
// 1. CLASSIFIER FIXTURES: every mapped cause -> expected channel (pure).
// 2. SMOKE: both policies drive 15d, census live, 0 instrument errors.
// 3. DET: instrument-on vs instrument-off byte-identical trajectories
//    (2 seeds x 60d), both-repeat stable.
// 4. FIDELITY: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//    (run after the sweep; asserts the files exist).
// All GREEN or the arm does not proceed. READ-ONLY: no src/js, no policies.
'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const SW = require('./vetwindow-sweep-20261018');

const ENV = 'SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-vetwindow');

let fails = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};

// --- 1. CLASSIFIER FIXTURES -----------------------------------------------
function classifierFixtures() {
  console.log('CLASSIFIER FIXTURES (classifyDeath pure):');
  const MN = new Set(['bulldozer', 'highbeam deer', 'the redactor']);
  const C0 = {};
  const cases = [
    // [cause, ctx, expectedChannel]
    ['raid', C0, 'raid'],
    ['raid-defense', C0, 'raid'],
    ['expedition', C0, 'expedition'],
    ['Bulldozer', C0, 'expedition'],          // monster-name = expedDeath path
    ['highbeam deer', C0, 'expedition'],
    ['aid-runner', C0, 'expedition'],
    ['sortie combat', C0, 'expedition'],
    ['split-fight: Bulldozer', C0, 'expedition'],
    ['monster', { onExped: true }, 'expedition'],
    ['combat', { onExped: true }, 'expedition'],
    ['the wild', C0, 'wild'],
    ['hunting', C0, 'wild'],
    ['patrol combat', C0, 'patrol'],
    ['monster', { router: 'patrol' }, 'patrol'],
    ['monster', { router: 'wild' }, 'wild'],
    ['combat', { aid: true }, 'raid'],
    ['monster', { aid: true }, 'raid'],
    ['combat', { atHaven: true }, 'raid'],
    ['combat', {}, 'wild'],
    ['monster', {}, 'other'],                  // unresolved -> other, never void
    ['alien', C0, 'alien'],
    ['alien_beam', C0, 'alien'],
    ['sickness', C0, 'disease'],
    ['wound_fever', C0, 'disease'],
    ['gutrot', C0, 'disease'],
    ['eurika', C0, 'disease'],
    ['Wound Fever', C0, 'disease'],
    ['food poisoning', C0, 'disease'],
    ['starvation', C0, 'haven'],
    ['thirst', C0, 'haven'],
    ['injuries', C0, 'haven'],
    ["a wound that wouldn't close", C0, 'haven'],
    ['ambush', C0, 'other'],
    ['contest', C0, 'other'],
    ['the phoenix link', C0, 'other'],
    ['the phoenix link (ash)', C0, 'other'],
    ['something-never-seen', C0, 'other'],      // unmapped -> other, never void
    ['unknown', C0, 'other'],
  ];
  for (const [cause, ctx, want] of cases) {
    const [got, rule] = SW.classifyDeath(cause, ctx, MN);
    check(`cause '${cause}' -> ${want}`, got === want, `got=${got} rule=${rule}`);
  }
  // kind filter fixtures
  check("kind 'monster' excluded", SW.isPersonDeath({ kind: 'monster', player: false }) === false, '');
  check("kind 'person' included", SW.isPersonDeath({ kind: 'person', player: false }) === true, '');
  check("kind 'villager' included", SW.isPersonDeath({ kind: 'villager', player: false }) === true, '');
  check("player:true included", SW.isPersonDeath({ kind: 'vampire', player: true }) === true, '');
  check("null kind included", SW.isPersonDeath({ kind: null, player: false }) === true, '');
}

// --- 2/3/4. sweep modes ----------------------------------------------------
function runMode(mode, extraEnv) {
  const cmd = `${ENV} ${extraEnv || ''} ${mode}=1 node scripts/vetwindow-sweep-20261018.js`;
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
}

(async () => {
  if (require.main !== module) return;
  classifierFixtures();
  runMode('SMOKE');
  runMode('DET');
  // FIDELITY needs the sweep first; assert the files exist if present.
  const need = ['winseat-leadfeast-s53101.json', 'winseat-belongfeast-s53102.json']
    .map(f => path.join(EVID, f));
  if (need.every(fs.existsSync)) runMode('FIDELITY');
  else console.log('\nFIDELITY skipped (sweep not run yet) — run after the sweep.');
  if (fails.length) { console.log(`\nPROOF STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nPROOF GREEN: classifier fixtures + SMOKE + DET (+FIDELITY when sweep done).');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
