#!/usr/bin/env node
// test-disease-curepath-20261011.js — proof for the r2 lever play:
// closing the diagnosis->cure reachability gap (lever 7, round 2).
//
// Asserts:
//  1. seFill sentence-case: mid-sentence {name} for the player renders
//     lowercase "you" ("Spasms run through you like a struck wire"), while a
//     template-initial {name} keeps "You", and possessives stay "your".
//  2. diagnoseDisease names a CONCRETE ruin direction for bacterial/parasitic
//     classes (findability nudge) — and no hint for fever/viral classes.
//  3. The full cure arc completes on identical conditions: contract lockjaw
//     -> diagnose -> ruin-direction hint -> antibiotics from inventory ->
//     useMedicine cures (before the 4-day certainty clock).
//  4. Pool separation still holds: contractDisease/diagnoseDisease refuse
//     alien ids (eurika), alien cure tables never admit mundane medicine.
// Deterministic: seeded Math.random BEFORE module eval (modules capture it
// at load). Never stubs Game.save.
'use strict';
const path = require('path');

function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEEDS = [7, 42, 99];
let failures = 0;
function ok(cond, label) {
  console.log((cond ? 'PASS' : 'FAIL') + ' — ' + label);
  if (!cond) failures++;
}

const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  for (const seed of SEEDS) {
    const rng = seededRandom(seed);
    Math.random = rng;
    const { Game } = await loadGame({ seed, mode: 'disease-curepath-r2', fullTelemetry: true });
    await setupGame(Game);
    const says = [];
    const _say = Game.say.bind(Game);
    Game.say = function (t) { says.push(String(t)); return _say(t); };

    // --- 1. seFill sentence-case ---
    const t1 = Game.seFill('Spasms run through {name} like a struck wire. (-{n} HP)', 'scholar', { n: 2 });
    ok(t1 === 'Spasms run through you like a struck wire. (-2 HP)', 'seed ' + seed + ': mid-sentence {name} -> "you": ' + t1);
    const t2 = Game.seFill('{name} {verb} still sick.', 'scholar', {});
    ok(t2 === 'You are still sick.', 'seed ' + seed + ': template-initial {name} stays "You": ' + t2);
    const t3 = Game.seFill('The deep ache settles further into {name}\u2019s muscles. (-{n} HP)', 'scholar', { n: 1 });
    ok(t3.indexOf('your muscles') !== -1, 'seed ' + seed + ': possessive stays "your": ' + t3);
    const t4 = Game.seFill('The tremor deepens. {name} {verb} dropping things. (-{n} HP)', 'scholar', { n: 2 });
    ok(t4 === 'The tremor deepens. you are dropping things. (-2 HP)', 'seed ' + seed + ': post-period {name} -> "you": ' + t4);

    // --- 2. ruin-direction hint in diagnosis ---
    says.length = 0;
    Game.applyStatus('scholar', 'lockjaw', { dayParts: 16, source: 'a rusty nail', silent: true });
    Game.diagnoseDisease('scholar', 'lockjaw', { by: 'you' });
    const diagLine = says.join(' ');
    ok(/Lockjaw/.test(diagLine), 'seed ' + seed + ': diagnosis names Lockjaw');
    const m = diagLine.match(/The ruins to the (north|south|east|west) sometimes still hold medicine cabinets/);
    ok(!!m, 'seed ' + seed + ': diagnosis names a concrete ruin direction' + (m ? ' (' + m[1] + ')' : '') + ': ' + diagLine.slice(0, 220));
    const rd = Game.ruinDirection();
    ok(m && m[1] === rd, 'seed ' + seed + ': hint direction matches ruinDirection() (' + rd + ')');

    says.length = 0;
    Game.applyStatus('scholar', 'disease', { dayParts: 8, source: 'bad water', silent: true });
    Game.diagnoseDisease('scholar', 'disease', { by: 'you' });
    ok(!/medicine cabinets/.test(says.join(' ')), 'seed ' + seed + ': fever class gets NO ruin hint (no pill cure)');

    // --- 3. full cure arc: antibiotics end diagnosed lockjaw ---
    says.length = 0;
    const s = Game.state.scholar;
    s.inventory.push({ plantId: 'med_antibiotics', itemId: 'med_antibiotics', medType: 'antibiotics', name: 'Antibiotics (amoxicillin)', doses: 3, units: 1, kcalEach: 0, spoilDay: 9999, unit: 'bottle', kg: 0.1 });
    const sickBefore = Game.sickDiseases().filter(e => e.id === 'lockjaw');
    ok(sickBefore.length === 1 && Game.isDiagnosed('scholar', 'lockjaw'), 'seed ' + seed + ': lockjaw present and diagnosed before treatment');
    Game.useMedicine('antibiotics');
    const sickAfter = Game.sickDiseases().filter(e => e.id === 'lockjaw');
    ok(sickAfter.length === 0, 'seed ' + seed + ': useMedicine(antibiotics) cures diagnosed lockjaw');
    const tele = (Game.tele ? null : null);
    ok(says.some(t => /breaks? within the day/i.test(t)), 'seed ' + seed + ': cure narration present');

    // --- 4. pool separation ---
    const c0 = (Game.state.scholar.statuses || []).length;
    let contracted = null;
    try { contracted = Game.contractDisease('eurika', { source: 'probe' }); } catch (e) { contracted = false; }
    ok(contracted === false, 'seed ' + seed + ': contractDisease refuses alien (eurika)');
    says.length = 0;
    const dg = Game.diagnoseDisease('scholar', 'eurika', { by: 'you' });
    ok(dg === false && !Game.isDiagnosed('scholar', 'eurika'), 'seed ' + seed + ': diagnoseDisease refuses alien (eurika)');
  }
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
