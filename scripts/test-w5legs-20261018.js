#!/usr/bin/env node
// test-w5legs-20261018.js — proof for the sim-w5legs wave-5 door bar-leg
// instrument (flesh-out loop arm sim-w5legs, 2026-10-18).
//
// (a) BAR-SHAPE FIXTURES: the demands the instrument measures are pinned
//     to standingCfg() — t5=200, plentyCapT5=100, wave-5 demand
//     {armored 4 @ P>=15, armed 6, tricks 3, veterans 2}. If the game bar
//     moves, these fixtures fail LOUD (the instrument would be measuring
//     the wrong bar).
// (b) ATTRIBUTION-LOGIC FIXTURES: synthetic leg histories with KNOWN
//     binding legs — veterans-bind, standing-bind, two-leg tie,
//     all-satisfied-but-never-jointly, unlocked-run-last-to-clear.
// (c) DET: instrument-on vs instrument-off byte-identical trajectories
//     (2 seeds x 60d) via the sweep's DET mode.
// (d) SMOKE: both policies drive with legs recorded (shape check).
// (e) ATTRIBUTION COMPLETENESS: after the full sweep, the analyzer's own
//     DIAG-GO self-check (>=95% attributed) — run separately.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 VETREL=1 REPOSITION=1 \
//     node scripts/test-w5legs-20261018.js
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame } = require('./sim-harness');
const { attribute, LEGS } = require('./w5legs-analyze-20261018');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// (b) helpers: build a synthetic per-seed run object from a leg-day map.
// spec: { legName: [satStartDay, satEndDay|null] } over days 1..endDay;
// demand 200 / 4 / 6 / 3 / 2; uw=4 (door in play), alive.
function synthRun(seed, policyId, spec, endDay, endReason, won, wave5Day) {
  const dem = { arm: 4, armP: 15, wpn: 6, trk: 3, vet: 2 };
  const legs = [];
  for (let d = 1; d <= endDay; d++) {
    const rec = { d, uw: 4, raw: 0, war: 0, dip: 0, plenty: 0, cap: 0, peak: 4, alive: true, dem, short: [], rdy: false, def5: false, w4k: 0, w4d: 0, w4killers: 0, deed: null };
    const val = { standing: 0, armor: 0, weapons: 0, tricks: 0, veterans: 0 };
    for (const leg of LEGS) {
      const s = spec[leg];
      if (s && d >= s[0] && (s[1] == null || d <= s[1])) {
        val[leg] = leg === 'standing' ? 210 : dem[{ armor: 'arm', weapons: 'wpn', tricks: 'trk', veterans: 'vet' }[leg]];
      }
    }
    rec.cap = val.standing; rec.arm = val.armor; rec.wpn = val.weapons; rec.trk = val.tricks; rec.vet = val.veterans;
    legs.push(rec);
  }
  const last = legs[legs.length - 1];
  return { seed, policyId, gameDays: endDay, endReason, won: !!won, maxWave: 4, wave45: 1, wave5: wave5Day != null ? 1 : 0, wave4Day: 40, wave5Day: wave5Day == null ? null : wave5Day, national: 0, table: 0, legs, endLegs: last };
}

async function main() {
  console.log('== (a) bar-shape fixtures ==');
  const { Game } = await loadGame({ seed: 7, mode: 'w5legs-proof', fullTelemetry: false });
  const cfg = Game.standingCfg();
  ok('t5=200', (cfg.t5 | 0) === 200, `t5=${cfg.t5}`);
  ok('plentyCapT5=100', (cfg.plentyCapT5 | 0) === 100, `plentyCapT5=${cfg.plentyCapT5}`);
  const d5 = (cfg.readyDemand || {})[5] || {};
  ok('w5 demand armored=4', (d5.armored | 0) === 4, JSON.stringify(d5));
  ok('w5 demand armorP=15', (d5.armorP | 0) === 15, JSON.stringify(d5));
  ok('w5 demand armed=6', (d5.armed | 0) === 6, JSON.stringify(d5));
  ok('w5 demand tricks=3', (d5.tricks | 0) === 3, JSON.stringify(d5));
  ok('w5 demand veterans=2', (d5.veterans | 0) === 2, JSON.stringify(d5));

  console.log('== (b) attribution-logic fixtures ==');
  // F1: veterans bind — everything else clears by d70, veterans never.
  let a = attribute(synthRun(1, 'leadfeast', { standing: [60], armor: [65], weapons: [62], tricks: [70] }, 150, 'village-lost', false, null));
  ok('F1 binding=veterans', a.bindingLeg === 'veterans' && !a.unlocked, `binding=${a.bindingLeg}`);
  ok('F1 other4FirstJointDay=70', a.other4FirstJointDay === 70, `got ${a.other4FirstJointDay}`);
  ok('F1 gap=80', a.gap === 80, `got ${a.gap}`);
  ok('F1 complete', a.complete === true);
  // F2: standing binds — capped never reaches 200.
  a = attribute(synthRun(2, 'belongfeast', { armor: [50], weapons: [55], tricks: [60], veterans: [65, 120] }, 150, 'village-lost', false, null));
  ok('F2 binding=standing', a.bindingLeg === 'standing' && !a.unlocked, `binding=${a.bindingLeg}`);
  ok('F2 other4joint=65', a.other4FirstJointDay === 65, `got ${a.other4FirstJointDay}`);
  // F3: tie — armor AND weapons never satisfied.
  a = attribute(synthRun(3, 'leadfeast', { standing: [60], tricks: [70], veterans: [75] }, 150, 'village-lost', false, null));
  ok('F3 bindingSet=armor+weapons', eq(a.bindingSet, ['armor', 'weapons']), `got ${JSON.stringify(a.bindingSet)}`);
  // F4: all satisfied at some point but the other-4 never jointly with the
  // binding leg's window (standing satisfied only d60-64, armor from d65 —
  // the other 4 never overlap).
  a = attribute(synthRun(4, 'belongfeast', { standing: [60, 64], armor: [65], weapons: [66], tricks: [67], veterans: [68, 71] }, 150, 'village-lost', false, null));
  ok('F4 binding=veterans (most short days)', a.bindingLeg === 'veterans' && !a.unlocked, `binding=${a.bindingLeg}`);
  ok('F4 other4joint=null (never jointly)', a.other4FirstJointDay === null, `got ${a.other4FirstJointDay}`);
  ok('F4 gap=null', a.gap === null, `got ${a.gap}`);
  ok('F4 complete despite null gap', a.complete === true);
  // F5: unlocked — armor clears last at d90, wave5Day=90, end 150.
  a = attribute(synthRun(5, 'leadfeast', { standing: [60], armor: [90], weapons: [62], tricks: [70], veterans: [80] }, 150, 'won', true, 90));
  ok('F5 unlocked binding=armor', a.unlocked && a.bindingLeg === 'armor', `binding=${a.bindingLeg} unlocked=${a.unlocked}`);
  ok('F5 couldClearDay=90 gap=60', a.couldClearDay === 90 && a.gap === 60, `got ${a.couldClearDay}/${a.gap}`);
  // F6: never in play (wave-4 never unlocked) — still attributed.
  const r6 = synthRun(6, 'belongfeast', { standing: [60] }, 80, 'village-lost', false, null);
  r6.legs.forEach(r => { r.uw = 3; });
  a = attribute(r6);
  ok('F6 neverInPlay flagged', a.neverInPlay === true, `got ${a.neverInPlay}`);
  ok('F6 complete', a.complete === true);

  console.log('== (c) DET (instrument-on vs bare, 2 seeds x 60d) ==');
  try {
    const out = execFileSync('node', [path.join(__dirname, 'w5legs-sweep-20261018.js')], {
      env: Object.assign({}, process.env, { DET: '1', SEEDS: '65101,65102' }),
      timeout: 1200000, maxBuffer: 64 * 1024 * 1024,
    }).toString();
    const lines = out.trim().split('\n');
    const detLines = lines.filter(l => l.includes('DET s'));
    ok('DET 4 configs compared', detLines.length === 4, `got ${detLines.length}`);
    ok('DET all PASS', detLines.every(l => l.includes('PASS')), lines.slice(-6).join(' | '));
  } catch (e) {
    ok('DET run', false, (e.stdout || e.message || '').toString().slice(-500));
  }

  console.log('== (d) SMOKE (both policies, legs recorded) ==');
  try {
    const out = execFileSync('node', [path.join(__dirname, 'w5legs-sweep-20261018.js')], {
      env: Object.assign({}, process.env, { SMOKE: '1', DAYS: '30', SEEDS: '65101', W5LEGS_NOWRITE: '1' }),
      timeout: 1200000, maxBuffer: 64 * 1024 * 1024,
    }).toString();
    const lines = out.split('\n').filter(l => l.startsWith('  SMOKE '));
    ok('SMOKE both policies', lines.length === 2, `got ${lines.length}`);
    ok('SMOKE legs recorded', lines.every(l => /legs=\d+/.test(l) && !/legs=0/.test(l)), lines.join(' | '));
    ok('SMOKE leg fields sane', lines.every(l => /"cap":-?\d+,"arm":-?\d+,"wpn":-?\d+,"trk":-?\d+,"vet":-?\d+/.test(l)), lines.join(' | '));
  } catch (e) {
    ok('SMOKE run', false, (e.stdout || e.message || '').toString().slice(-500));
  }

  console.log(`\nproof: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FATAL:', e && e.message); process.exit(1); });
