#!/usr/bin/env node
// test-ghost-trial-dedup.js — PROOF (journey-succession 2026-10-11):
// when the dead was accused in MULTIPLE open cases, the death sequence said
// "X is gone — the moot doesn't try the dead. The case dies with the accused"
// once PER CASE (seen twice back-to-back in journey-succession seeds 201/204).
// Now: the line fires once ("The cases die with the accused"), every case
// still resolves accused_died, every case still gets its journal note.
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-ghost-trial-dedup' });
  const says = [];
  Game.say = (t) => says.push(String(t));
  Game.sysSay = (t) => says.push(String(t));
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const oldFirst = Game.displayName(oldId).split(' ')[0];
  const npcs = (v.roster || []).filter(id => id !== oldId);
  v.trust[npcs[0]] = 90; // heir

  // two open cases both accusing the bearer
  const bs = Game.betrayalState();
  bs.cases.push({ id: 'case_dedup_1', accused: [oldId], status: 'open' });
  bs.cases.push({ id: 'case_dedup_2', accused: [oldId], status: 'dormant' });

  Game.playerDeath('the hunt');
  const mootLines = says.filter(t => t.includes("the moot doesn't try the dead"));
  console.log('  moot line: ' + JSON.stringify(mootLines[0] || null));
  check('moot-line-once', mootLines.length === 1, `said ${mootLines.length}x`);
  check('moot-line-plural', mootLines.length === 1 && /The cases die with the accused/.test(mootLines[0]),
    'plural copy for 2 cases');
  const c1 = bs.cases.find(c => c.id === 'case_dedup_1');
  const c2 = bs.cases.find(c => c.id === 'case_dedup_2');
  check('case1-resolved', c1 && c1.status === 'resolved' && c1.resolution === 'accused_died',
    `status=${c1 && c1.status}`);
  check('case2-resolved', c2 && c2.status === 'resolved' && c2.resolution === 'accused_died',
    `status=${c2 && c2.status}`);

  // single-case control: singular copy preserved
  const g2 = (await loadGame({ seed: 777, mode: 'test-ghost-trial-dedup-2' })).Game;
  const says2 = [];
  g2.say = (t) => says2.push(String(t)); g2.sysSay = () => {};
  await setupGame(g2);
  const v2 = g2.state.village;
  const old2 = g2.villagerId;
  v2.trust[(v2.roster || []).filter(id => id !== old2)[0]] = 90;
  g2.betrayalState().cases.push({ id: 'case_dedup_solo', accused: [old2], status: 'open' });
  g2.playerDeath('the hunt');
  const solo = says2.filter(t => t.includes("the moot doesn't try the dead"));
  check('single-case-once', solo.length === 1, `said ${solo.length}x`);
  check('single-case-singular', solo.length === 1 && /The case dies with the accused/.test(solo[0]),
    'singular copy for 1 case');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e.stack); process.exit(1); });
