#!/usr/bin/env node
// test-moot-convene-repeat-20261022.js — REPEAT-AWARE MOOT CONVENING proof
// (journey-social 2026-10-22 r41b, THE EMPTY MOOT follow-up).
//
// Finding: with the beloved-gate split, a feud can put the same crew on
// trial against the same target three times in five days — and npcMootTick
// announced all three with the byte-identical line "Roman has been talking
// at the fires..." (seed 3701, cases 4/6/8). The village reads as
// copy-pasting its own justice.
//
// Fix: betrayal.js npcMootTick counts convenings per accused-set + target
// (bs.mootConveneCounts) and escalates the announcement: the first moot
// keeps the original line, the second is "— again", the third+ names the
// return ("The third time answering...").
//
// Proves:
//   1. First convening keeps the original line verbatim.
//   2. Second convening of the same accused-set+target differs and says "again".
//   3. Third convening names the return ("third time") and differs again.
//   4. A DIFFERENT accused-set+target still gets the first-time line
//      (the counter keys per feud, not globally).
// Usage: node scripts/test-moot-convene-repeat-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

async function newCase(Game, leader, acc2, acc3, victim) {
  const plot = Game.armPlot(leader, [acc2, acc3], victim, { score: 60, reasons: ['grievance'] });
  if (!plot || !plot.active) throw new Error('armPlot failed');
  Game.springAmbush(plot);
  const bs = Game.betrayalState();
  const c = bs.cases[bs.cases.length - 1];
  if (!c) throw new Error('no case opened');
  c.day = Game.state.scholar.day - (c.mootIn || 3); // ripe for npcMootTick
  return c;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof' });
  await setupGame(Game);
  Game.state.scholar.day = 10;
  const npcs = Game.npcIds().filter(id => id !== Game.villagerId);
  const [leader, a2, a3, victim, other, other2] = npcs;

  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { said.push(String(t)); return origSay(t); };
  const conveneLines = () => said.filter(t => /answers? for what happened to|answering for what happened to/.test(t));

  // case 1: first convening — original line
  const c1 = await newCase(Game, leader, a2, a3, victim);
  Game.npcMootTick();
  let lines = conveneLines();
  ok(lines.length === 1, `first feud convenes once (got ${lines.length})`);
  ok(/has been talking at the fires\. Enough voices/.test(lines[0]),
    'first convening keeps the original line');

  // case 2: same crew, same target — "again"
  const c2 = await newCase(Game, leader, a2, a3, victim);
  Game.npcMootTick();
  lines = conveneLines();
  ok(lines.length === 2, `second feud convenes (got ${lines.length})`);
  ok(lines[1] !== lines[0], 'second convening line differs from the first');
  ok(/— again\./.test(lines[1]), `second convening says "again" (got: ${lines[1].slice(0, 80)}...)`);

  // case 3: same crew, same target — "third time"
  const c3 = await newCase(Game, leader, a2, a3, victim);
  Game.npcMootTick();
  lines = conveneLines();
  ok(lines.length === 3, `third feud convenes (got ${lines.length})`);
  ok(/third time answering/.test(lines[2]), `third convening names the return (got: ${lines[2].slice(0, 80)}...)`);

  // case 4: different crew + different target — counter is per-feud
  const c4 = await newCase(Game, other, a2, a3, other2);
  Game.npcMootTick();
  lines = conveneLines();
  ok(lines.length === 4, `fourth convening fires (got ${lines.length})`);
  ok(/has been talking at the fires\. Enough voices/.test(lines[3]),
    'a different feud still gets the first-time line');

  const counts = Game.betrayalState().mootConveneCounts || {};
  const keys = Object.keys(counts);
  ok(keys.length === 2 && counts[keys.find(k => k.includes(victim))] === 3,
    `counter persists per feud in betrayalState (${JSON.stringify(counts)})`);

  void c1; void c2; void c3; void c4;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
