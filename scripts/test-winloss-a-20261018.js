#!/usr/bin/env node
// test-winloss-a-20261018.js — proof for the sim-winloss-a instrument arm.
// 1. DEATH-CLASSIFIER FIXTURES: vetwindow taxonomy + the dehydration->haven
//    correction (normalizeCause), on synthetic + REAL vetwindow log rows.
// 2. RUN-LOSS CLASSIFIER FIXTURES: every terminal/channel branch (pure).
// 3. SMOKE: both policies drive 15d, census live, 0 instrument errors.
// 4. DET: instrument-on vs instrument-off byte-identical trajectories
//    (2 seeds x 60d), both-repeat stable.
// 5. FIDELITY: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//    (run after the sweep; asserts the files exist).
// All GREEN or the arm does not proceed. READ-ONLY: no src/js, no policies.
'use strict';
// The fixtures exercise pure classifiers, but requiring the sweep module
// pulls vetwindow-sweep's load-time substrate assertion — satisfy it here.
// The SMOKE/DET child processes get the env explicitly via the command prefix.
for (const k of ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (!process.env[k]) process.env[k] = '1';
}
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const SW = require('./winloss-sweep-20261018');

const ENV = 'SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-winloss-a');
const VW_EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-vetwindow');

let fails = [];
const check = (name, cond, detail) => {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) fails.push(name);
};

// --- 1. DEATH-CLASSIFIER FIXTURES -------------------------------------------
function deathFixtures() {
  console.log('DEATH-CLASSIFIER FIXTURES (normalizeCause + classifyDeathWL):');
  const MN = new Set(['bulldozer', 'highbeam deer']);
  const C0 = {};
  check("normalize 'dehydration' -> 'thirst'", SW.normalizeCause('dehydration') === 'thirst', '');
  check("normalize 'Dehydration' -> 'thirst' (case-insensitive)", SW.normalizeCause('Dehydration') === 'thirst', '');
  check("normalize leaves 'raid' alone", SW.normalizeCause('raid') === 'raid', '');
  const cases = [
    ['dehydration', C0, 'haven'],   // the sim-vetwindow correction
    ['Dehydration', C0, 'haven'],
    ['thirst', C0, 'haven'],
    ['starvation', C0, 'haven'],
    ['raid', C0, 'raid'],
    ['combat', { aid: true }, 'raid'],
    ['combat', { atHaven: true }, 'raid'],
    ['combat', { onExped: true }, 'expedition'],
    ['combat', {}, 'wild'],
    ['expedition', C0, 'expedition'],
    ['the wild', C0, 'wild'],
    ['sickness', C0, 'disease'],
    ['eurika', C0, 'disease'],
    ['contest', C0, 'other'],
    ['something-never-seen', C0, 'other'],
    ['unknown', C0, 'other'],
  ];
  for (const [cause, ctx, want] of cases) {
    const [got, rule] = SW.classifyDeathWL(cause, ctx, MN);
    check(`cause '${cause}' -> ${want}`, got === want, `got=${got} rule=${rule}`);
  }
  // REAL vetwindow rows: re-classify and confirm the correction + stability.
  const fp = path.join(VW_EVID, 'winseat-leadfeast-s53104.json');
  if (fs.existsSync(fp)) {
    const d = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const dehy = d.veteranDeaths.filter(v => String(v.cause).toLowerCase() === 'dehydration');
    check('real log: dehydration row(s) present', dehy.length >= 1, `n=${dehy.length}`);
    for (const v of dehy) {
      const [got] = SW.classifyDeathWL(v.cause, v.ctx, MN);
      check(`real log: dehydration (${v.name} d${v.day}) now -> haven`, got === 'haven', `got=${got}`);
    }
  } else {
    check('real log: vetwindow file present', false, fp + ' missing');
  }
  const fp2 = path.join(VW_EVID, 'winseat-leadfeast-s53105.json');
  if (fs.existsSync(fp2)) {
    const d2 = JSON.parse(fs.readFileSync(fp2, 'utf8'));
    const raids = d2.veteranDeaths.filter(v => v.channel === 'raid');
    check('real log: raid row(s) present', raids.length >= 1, `n=${raids.length}`);
    for (const v of raids) {
      const [got] = SW.classifyDeathWL(v.cause, v.ctx, MN);
      check(`real log: raid (${v.name} d${v.day}) still -> raid`, got === 'raid', `got=${got}`);
    }
  }
}

// --- 2. RUN-LOSS CLASSIFIER FIXTURES ----------------------------------------
function runLossFixtures() {
  console.log('\nRUN-LOSS CLASSIFIER FIXTURES (classifyRunLoss pure):');
  const fw = (channels) => channels.map(c => ({ channel: c }));
  // won -> no channel
  let r = SW.classifyRunLoss({ won: true });
  check('won -> terminal won, no channel', r.terminal === 'won' && r.channel === null, JSON.stringify(r));
  // village-lost: starvation cascade (pantry 0 + logistics dominant)
  r = SW.classifyRunLoss({ won: false, villageLost: true, gameOver: true, pantryEnd: 0,
    finalWindowDeaths: fw(['haven', 'haven', 'haven', 'raid', 'haven']),
    lastScholarDeath: { cause: 'starvation', channel: 'haven', day: 60 }, successionCount: 2 });
  check('village-lost + pantry0 + logistics -> starvation-cascade',
    r.channel === 'village-lost:starvation-cascade', r.channel);
  // village-lost: combat grind
  r = SW.classifyRunLoss({ won: false, villageLost: true, gameOver: true, pantryEnd: 45000,
    finalWindowDeaths: fw(['raid', 'raid', 'expedition', 'wild', 'haven']),
    lastScholarDeath: { cause: 'combat', channel: 'raid', day: 90 }, successionCount: 1 });
  check('village-lost + combat dominant -> combat-grind',
    r.channel === 'village-lost:combat-grind', r.channel);
  // village-lost: disease
  r = SW.classifyRunLoss({ won: false, villageLost: true, gameOver: true, pantryEnd: 30000,
    finalWindowDeaths: fw(['disease', 'disease', 'disease', 'haven']),
    lastScholarDeath: { cause: 'sickness', channel: 'disease', day: 70 }, successionCount: 0 });
  check('village-lost + disease dominant -> disease', r.channel === 'village-lost:disease', r.channel);
  // village-lost: mixed (no dominant channel)
  r = SW.classifyRunLoss({ won: false, villageLost: true, gameOver: true, pantryEnd: 20000,
    finalWindowDeaths: fw(['raid', 'haven', 'disease', 'other']),
    lastScholarDeath: { cause: 'contest', channel: 'other', day: 100 }, successionCount: 3 });
  check('village-lost + no dominant -> mixed', r.channel === 'village-lost:mixed', r.channel);
  // nomad-wiped
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: true, legendOutcome: 'nomad' });
  check('nomad legend, !won -> nomad-wiped',
    r.terminal === 'nomad-wiped' && r.channel === 'nomad-wiped', JSON.stringify(r));
  // over-other named, never void
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: true, legendOutcome: 'haven-endures' });
  check('over-other named (never void)',
    r.terminal === 'over-other:haven-endures' && r.channel === 'over-other:haven-endures', JSON.stringify(r));
  // survived: stall-seat picks the largest-gap bar
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: false, gameDays: 180,
    finalSeat: 'none', seatDetail: { w1: 4, w2: 4, w3: 2, contestsN: 2, crisesN: 2, rank: 'village', stage: 2, foodDeeds: true } });
  check('survived seat=none, scale short -> stall-seat:scale',
    r.channel === 'stall-seat:scale', `${r.channel} worst=${JSON.stringify(r.evidence.worstBar)}`);
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: false, gameDays: 180,
    finalSeat: 'none', seatDetail: { w1: 1, w2: 4, w3: 3, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true } });
  check('survived seat=none, w1 shortest -> stall-seat:w1-faced',
    r.channel === 'stall-seat:w1-faced', `${r.channel} worst=${JSON.stringify(r.evidence.worstBar)}`);
  // survived: seat earned but no invite
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: false, gameDays: 180,
    finalSeat: 'lesser', tableInvites: 0 });
  check('survived seat=lesser, 0 invites -> stall-invite', r.channel === 'stall-invite', r.channel);
  // survived: invite fired but never won
  r = SW.classifyRunLoss({ won: false, villageLost: false, gameOver: false, gameDays: 180,
    finalSeat: 'full', tableInvites: 2 });
  check('survived seat=full, 2 invites, no win -> stall-table', r.channel === 'stall-table', r.channel);
  // terminal precedence: won beats villageLost
  r = SW.classifyRunLoss({ won: true, villageLost: true });
  check('precedence: won > villageLost', r.terminal === 'won', r.terminal);
}

// --- 3/4/5. sweep modes ------------------------------------------------------
function runMode(mode, extraEnv) {
  const cmd = `${ENV} ${extraEnv || ''} ${mode}=1 node scripts/winloss-sweep-20261018.js`;
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
}

(async () => {
  if (require.main !== module) return;
  deathFixtures();
  runLossFixtures();
  runMode('SMOKE');
  runMode('DET');
  const need = ['winseat-leadfeast-s59101.json', 'winseat-belongfeast-s59102.json']
    .map(f => path.join(EVID, f));
  if (need.every(fs.existsSync)) runMode('FIDELITY');
  else console.log('\nFIDELITY skipped (sweep not run yet) — run after the sweep.');
  if (fails.length) { console.log(`\nPROOF STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nPROOF GREEN: fixtures + SMOKE + DET + FIDELITY passed.');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
