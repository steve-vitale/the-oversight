#!/usr/bin/env node
// scripts/test-fieldfight-summary-20261013.js — proof test for the mFlee
// honesty fix (flesh-out r16 arm C, 2026-10-13).
//
// Before: every mFlee summarized as "stood down X and kept walking — N
// rounds, bloodied but breathing." — even with 0 rounds and 0 damage taken
// (237 such beats in the 8-run census). After: no-damage stand-downs say
// "not a scratch on them"; only real contact says "bloodied but breathing".
'use strict';
const { loadGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 11, mode: 'ffsummary-proof' });
  const s = Game.fieldFightSummary.bind(Game);
  let pass = 0, fail = 0;
  const check = (name, got, want) => {
    const ok = got === want;
    if (ok) pass++; else { fail++; console.log('FAIL ' + name + '\n  got:  ' + got + '\n  want: ' + want); }
  };
  // the fixed case: 0 rounds, 0 taken — must NOT claim blood
  check('mFlee clean',
    s({ outcome: 'mFlee', rounds: 0, vTaken: 0 }, 'Mara', 'a hushwolf'),
    'Mara stared down the hushwolf and it backed off — 0 rounds, not a scratch on them.');
  // the honest case: real contact — keeps the old line
  check('mFlee bloody',
    s({ outcome: 'mFlee', rounds: 3, vTaken: 18 }, 'Mara', 'a hushwolf'),
    'Mara stood down the hushwolf and kept walking — 3 rounds, bloodied but breathing.');
  // regressions: neighboring branches untouched
  check('vFlee clean',
    s({ outcome: 'vFlee', rounds: 2, vTaken: 0 }, 'Mara', 'a hushwolf'),
    'The hushwolf came for Mara and missed — they got clear over 2 rounds, unharmed. They\'re lucky to be breathing.');
  check('vDie',
    s({ outcome: 'vDie', rounds: 1, vTaken: 40 }, 'Mara', 'a hushwolf'),
    'The hushwolf killed Mara in 1 round. The village mourns.');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
