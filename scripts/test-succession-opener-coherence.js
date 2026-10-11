#!/usr/bin/env node
// test-succession-opener-coherence.js — PROOF (journey-succession 2026-10-11):
// the resume-opener's whyLine for 'unfinished business' was "we never
// finished", which doubled with the template's "never finished talking
// about X" -> "Luis and I never finished talking about the water thing --
// we never finished." (seen live on seed 4242 pre-fix). The line now reads
// "we left it mid-thought". Checks the REAL convoResumeOpener path both
// inherited (predecessor named) and same-bearer (no predecessor).
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}
const doubled = (t) => /never finished talking about[^"]{0,200}?never finished/i.test(t);

async function openerLine(Game, vid) {
  Game.startConvo(vid);
  const t = (Game.convoGet(vid).transcript || [])[0] || {};
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return t.text || '';
}

(async () => {
  // ---- inherited case: thread planted as the OLD bearer ----
  const { Game } = await loadGame({ seed: 4242, mode: 'test-opener-coherence' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const oldFirst = Game.displayName(oldId).split(' ')[0];
  const npcs = (v.roster || []).filter(id => id !== oldId);
  const heir = npcs[0], vid1 = npcs[1];
  v.trust[heir] = 90; v.trust[vid1] = 50;
  Game.convoThreadOpen(vid1, 'waterthread', 'the water thing', 'unfinished business');
  Game.playerDeath('the hunt');
  const realRandom = Math.random;
  Math.random = () => 0; // opener gate passes; picks open thread index 0
  try {
    const line = await openerLine(Game, vid1);
    console.log('  inherited: ' + line.slice(0, 160));
    check('inherited-names-predecessor', line.includes(oldFirst), oldFirst);
    check('inherited-no-doubling', !doubled(line), 'no "never finished ... never finished"');
  } finally { Math.random = realRandom; }

  // ---- same-bearer control: no death, thread is the current bearer's ----
  const g2 = (await loadGame({ seed: 777, mode: 'test-opener-coherence-2' })).Game;
  g2.say = () => {}; g2.sysSay = () => {};
  await setupGame(g2);
  const v2 = g2.state.village;
  const vidB = (v2.roster || []).filter(id => id !== g2.villagerId)[1];
  v2.trust[vidB] = 50;
  g2.convoThreadOpen(vidB, 'waterthread', 'the water thing', 'unfinished business');
  Math.random = () => 0;
  try {
    const line = await openerLine(g2, vidB);
    console.log('  same-bearer: ' + line.slice(0, 160));
    check('same-bearer-no-doubling', !doubled(line), 'no "never finished ... never finished"');
  } finally { Math.random = realRandom; }

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e.stack); process.exit(1); });
