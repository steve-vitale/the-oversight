#!/usr/bin/env node
// scripts/test-w4tbkill-worldhp.js — unit proof for phase B.
// Calls the REAL Game.tbWorldHpFor (src/js/game.js) on a loaded
// game (shared sim-harness, NOT a stubbed method) and asserts the
// prereg's helper contract. Exit 0 only when every case passes.
// Cases:
//   1. non-veteran lifted world monster, id matches -> world hp/maxHp.
//   2. veteran -> null (roll as before; veteran hardening untouched).
//   3. bystander id mismatch -> null (roll as before).
//   4. missing world monster -> null (roll as before).
//   5. non-finite / non-positive HP -> null (roll as before).
//   6. table-trial-style null world monster -> null.
// This test proves the helper only; the sweep join (fighter start
// HP == tile HP on the phase-B band) is the end-to-end proof that
// startCombat actually uses it.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 42, mode: 'w4tbkill-worldhp', fullTelemetry: false });
  await setupGame(Game);
  if (typeof Game.tbWorldHpFor !== 'function') { console.error('FAIL: Game.tbWorldHpFor is not a function (phase-B change missing)'); process.exit(1); }
  const cases = [
    { name: 'lifted-nonveteran', args: ['eulogy', { id: 'eulogy', hp: 675, maxHp: 900 }, false], want: { hp: 675, maxHp: 900 } },
    { name: 'veteran-null', args: ['eulogy', { id: 'eulogy', hp: 675, maxHp: 900 }, true], want: null },
    { name: 'bystander-null', args: ['eulogy', { id: 'audit', hp: 825, maxHp: 1100 }, false], want: null },
    { name: 'missing-null', args: ['eulogy', null, false], want: null },
    { name: 'nan-null', args: ['eulogy', { id: 'eulogy', hp: NaN, maxHp: 900 }, false], want: null },
    { name: 'zero-null', args: ['eulogy', { id: 'eulogy', hp: 0, maxHp: 900 }, false], want: null },
    { name: 'fresh-world-full', args: ['suburb', { id: 'suburb', hp: 1300, maxHp: 1300 }, false], want: { hp: 1300, maxHp: 1300 } },
  ];
  let fails = 0;
  for (const c of cases) {
    const got = Game.tbWorldHpFor.apply(Game, c.args);
    const ok = JSON.stringify(got) === JSON.stringify(c.want);
    if (!ok) { console.error(`FAIL ${c.name}: want ${JSON.stringify(c.want)}, got ${JSON.stringify(got)}`); fails++; }
    else console.log(`PASS ${c.name}: ${JSON.stringify(got)}`);
  }
  if (fails) { console.error(`FAILURES: ${fails}`); process.exit(1); }
  console.log('ALL PASS: tbWorldHpFor');
}
if (require.main === module) main().catch(e => { console.error('FAILED:', (e && e.stack) || e); process.exit(1); });
