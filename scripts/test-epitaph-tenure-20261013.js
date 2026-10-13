#!/usr/bin/env node
// test-epitaph-tenure-20261013.js — PROOF (journey-succession 2026-10-13).
// Blank: two bearers sharing a journal register wrote byte-identical epitaphs
// ("Combat. Journal's yours now. The notes hold." twice in one chain —
// seed 804: Ruby d0-106 and Felix d106-108, both laconic). The dying life's
// tenure as Bearer <redacted> distinguishing their epitaphs.
// Fix: writeEpitaph computes tenure (day - mantle currentStart) and passes it
// as c.days; all six register templates weave it in, in-voice.
// This test drives the REAL writeEpitaph path with two same-register
// villagers at different tenures and asserts the epitaphs differ.
// RED: on pristine journal.js both epitaphs are byte-identical (no tenure).
// Usage: node scripts/test-epitaph-tenure-20261013.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 20261013, mode: 'mvc' });
  check('modules load clean', (loadFails || []).length === 0, (loadFails || []).join(';'));
  await setupGame(Game);

  // two villagers sharing one register (laconic if available, else any pair)
  const regs = {};
  for (const v of (Game.data.villagers || [])) {
    let r = 'plainspoken';
    try { r = (Game.lifeseedVoice(v) || {}).register || 'plainspoken'; } catch (e) {}
    (regs[r] = regs[r] || []).push(v);
  }
  const pairReg = Object.keys(regs).find(r => regs[r].length >= 2);
  check('a shared register pair exists', !!pairReg, 'no register has 2+ villagers');
  if (!pairReg) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(1); }
  const [A, B] = regs[pairReg];
  console.log(`info   shared register: ${pairReg} (${A.name} / ${B.name})`);

  const mr = Game.mantleRecord();
  mr.marginalia.length = 0; mr.lives.length = 0;

  // life 1: Bearer <redacted> 60 days, dies of combat
  Game.state.scholar.day = 60;
  mr.currentStart = 0;
  Game.writeEpitaph({ vid: A.id, name: A.name, char: A }, 'combat');
  // life 2: Bearer <redacted> 1 day, dies of combat
  Game.state.scholar.day = 61;
  mr.currentStart = 60;
  Game.writeEpitaph({ vid: B.id, name: B.name, char: B }, 'combat');

  const eps = mr.marginalia.filter(m => m.kind === 'epitaph');
  check('two epitaphs recorded', eps.length === 2, `got ${eps.length}`);
  if (eps.length === 2) {
    const [t1, t2] = [eps[0].text, eps[1].text];
    console.log(`info   epitaph 1: ${t1}`);
    console.log(`info   epitaph 2: ${t2}`);
    check('epitaphs carry the register voice', eps[0].register === pairReg && eps[1].register === pairReg,
      `${eps[0].register}/${eps[1].register} vs ${pairReg}`);
    check('same-register epitaphs are NOT byte-identical (tenure distinguishes)',
      t1 !== t2, `both: "${t1}"`);
    check('long tenure appears in epitaph 1', /60 days/.test(t1) || /60d/.test(t1), t1);
    check('singular dayword for 1-day tenure', /1 day([^s]|$)/.test(t2) || /1d\./.test(t2) || /1d,/.test(t2), t2);
    check('no "1 days" solecism', !/1 days/.test(t2), t2);
    check('cause still present in both', /combat/i.test(t1) && /combat/i.test(t2), `${t1} || ${t2}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(2); });
