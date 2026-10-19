#!/usr/bin/env node
// test-monster-math-premise-20261013.js — scale-wall r4 MONSTER-MATH lever.
// RED-verifies the DISPROOF of the combat-lever run's premise ("day-15
// machete players coin-flip vs wave-1 gallowdeer Ocular Discharge 20-30/ROUND").
// On pristine these tests PASS, proving the premise wrong:
//   - Ocular Discharge is a CYCLED beam (windup 2 / fire 6 / cooldown 2), not
//     20-30 every round.
//   - The original wave-1 metadata cohort and wave-2 authored coverage persist.
// Current missing-windup additions must also pass real shared-runtime checks;
// absent metadata alone does not establish instant damage or human readability.
//   - The gallowdeer benchmark (HP [150,170] ~ 160) is intact and untouched.
// If a future build ever flattens the beam to flat per-round damage, T1 goes
// RED — the test guards the cycled design.
'use strict';
const monsters = require('../src/data/monsters.json');
(async()=>{

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const gallowdeer = monsters.find(m => m.id === 'gallowdeer');
const od = gallowdeer.attacks.find(a => a.name === 'Ocular Discharge');

// T1: the beam is cycled, not flat per-round. (RED on the combat-lever premise:
// if Ocular Discharge were really 20-30/round, pattern would have no cycle.)
ok('T1 deer aims for one response round before its harmless ignition beat (Steve 2026-10-19)', od.pattern.windup === 1, JSON.stringify(od.pattern));
ok('T1 beam has fireTurns', (od.pattern.fireTurns || 0) >= 1, JSON.stringify(od.pattern));
ok('T1 beam has cooldownTurns', (od.pattern.cooldownTurns || 0) >= 1, JSON.stringify(od.pattern));
ok('T1 beam is sweepable (dodgeable by movement)', od.pattern.sweep === true);

// T2: wave-1 damage is telegraphed — count damage attacks with windup>=1.
// Designed-untelegraphed exceptions (documented): hushwolf Silent Rush
// (ambush; the LACK of telegraph is the design), glasswing Skyfall Dive,
// sunbasker Sun-Charged Bite, nightlight Lure and Grasp,
// lockpick_raccoon Disassemble (tinkerer trick — fast hands),
// speedbump_turtle Snap Decision (ambush pattern — it IS an ambush predator),
// nightcourt Adjournment (the silent double-dive — silence is its identity).
const KNOWN_UNTELEGRAPHED = new Set([
  'hushwolf|Silent Rush', 'glasswing|Skyfall Dive', 'sunbasker|Sun-Charged Bite',
  'nightlight_catfish|Lure and Grasp', 'lockpick_raccoon|Disassemble',
  'speedbump_turtle|Snap Decision', 'nightcourt|Adjournment',
]);
// Retain the original premise's exact historical cohort; roster growth must
// not change what this dated disproof claimed. Current additions get separate
// runtime coverage below instead of being silently added to an exception list.
const HISTORICAL = new Set('bulldozer,hushwolf,gallowdeer,mirrormoth,belltoad,lockpick_raccoon,white_noise_heron,hummice,speedbump_turtle,nightlight_catfish,ducks_in_a_row,glasswing,sunbasker,nevermore,nightcourt'.split(','));
let dmgAtks = 0, teleAtks = 0;
const untele = [];
for (const m of monsters.filter(x => x.wave === 1 && HISTORICAL.has(x.id))) {
  for (const a of (m.attacks || [])) {
    if (!a.damage) continue;
    dmgAtks++;
    const w = (a.pattern || {}).windup || 0;
    if (w >= 1) teleAtks++;
    else untele.push(m.id + '|' + a.name);
  }
}
const unexpected = untele.filter(k => !KNOWN_UNTELEGRAPHED.has(k));
ok('T2 historical wave-1 damage attacks counted', dmgAtks >= 20, 'got ' + dmgAtks);
ok('T2 historical authored windup share retained (16/23; 7 documented exceptions)',
  teleAtks === 16 && dmgAtks === 23,
  `${teleAtks}/${dmgAtks} telegraphed; untelegraphed: ${untele.join(', ')}`);
ok('T2 no unexpected untelegraphed attacks', unexpected.length === 0, unexpected.join(', '));

// Every current wave-one attack lacking explicit windup must either retain
// the original documented design or pass the shared production runtime proof.
const runtime=await require('./lib/monster-telegraph-proof').prove(ok);
const missing=monsters.filter(m=>m.wave===1).flatMap(m=>(m.attacks||[])
 .filter(a=>a.damage&&!((a.pattern||{}).windup>=1))
 .map(a=>m.id+'|'+a.name)).filter(k=>!KNOWN_UNTELEGRAPHED.has(k)&&!runtime.includes(k));
ok('T2 every expanded missing-windup attack has actual runtime proof',missing.length===0,missing.join(', '));

// T3: wave-2 damage is telegraphed too (same bar).
let d2 = 0, t2 = 0;
const untele2 = [];
for (const m of monsters.filter(x => x.wave === 2)) {
  for (const a of (m.attacks || [])) {
    if (!a.damage) continue;
    d2++;
    const w = (a.pattern || {}).windup || 0;
    if (w >= 1) t2++; else untele2.push(m.id + '|' + a.name);
  }
}
ok('T3 wave-2 telegraphed share >= 70%', t2 / d2 >= 0.7,
  `${t2}/${d2} telegraphed; untelegraphed: ${untele2.join(', ')}`);

// T4: the benchmark is intact — HP [150,170], and this script changed nothing.
ok('T4 gallowdeer HP is [150,170] (benchmark, untouched)',
  gallowdeer.hp[0] === 150 && gallowdeer.hp[1] === 170, JSON.stringify(gallowdeer.hp));
// T5: antler proximity tax is Steve-designed (monsterBehaviors antlerThrash hook
// cites Steve 2026-10-05) — r4 does not touch it. Guard the citation.
const fs = require('fs');
const mb = fs.readFileSync(__dirname + '/../src/js/monsterBehaviors.js', 'utf8');
ok('T5 antler-thrash Steve-design citation present',
  /Steve 2026-10-05/.test(mb) && /antlerThrash/.test(mb));

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode=fail?1:0;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
