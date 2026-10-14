#!/usr/bin/env node
// test-promise-maker-succession-20261014.js — PROOF (journey-succession r11).
// Canon: a broken promise dies with its maker ("it's not yours to carry —
// but I remember", conversation.js MEM_INH). The renounce path
// (convoFavorRenounce) stamped promise_broken with NO maker, so the maker
// gate (maker == null -> mine) treated it as the current bearer's word:
// the SUCCESSOR was refused ("You said that before...") and offered amends
// for a promise the PREDECESSOR renounced. And nothing stamped maker at
// promise creation, so rot-after-a-mantle-pass (hypothetical) would blame
// the successor. Fix: stamp maker at creation (both paths) and at renounce,
// rot reads p.maker || this.villagerId.
//
// Run: node scripts/test-promise-maker-succession-20261014.js
// Expect: all PASS (pre-fix: maker/trustAtBreak/amends/refusal all FAIL).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function lastMem(Game, vid, t) {
  const mems = (((Game.state.village || {}).memory || {})[vid] || []).filter(m => m && m.t === t);
  return mems[mems.length - 1] || null;
}
let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${id} — ${detail}`); }
  else { fail++; console.log(`FAIL ${id} — ${detail}`); }
}
(async () => {
  const { Game } = await loadGame({ seed: 611, mode: 'promise-maker-proof', fullTelemetry: false });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);

  // pick a villager whose goal takes a tracked promise (keep path)
  let vidA = null, vidB = null, vidC = null;
  for (const id of roster) {
    try { Game.promiseHelp(id); } catch (e) {}
    const open = (v.promises || {})[id];
    if (open && !open.kept) { if (!vidA) vidA = id; else if (!vidC) { vidC = id; } delete (v.promises || {})[id]; }
    if (vidA && vidC) break;
  }
  vidB = roster.find(id => id !== vidA && id !== vidC);
  check('setup', !!(vidA && vidB && vidC), `A=${vidA} B=${vidB} C=${vidC}`);

  // Lane A: promiseHelp creation stamps maker.
  Game.promiseHelp(vidA);
  const openA = (v.promises || {})[vidA];
  check('maker-at-creation-promiseHelp', openA && openA.maker === oldId,
    `maker=${(openA && openA.maker) || '(none)'}`);

  // Lane B: favor commit stamps maker; rot (no death) blames the maker.
  const favorB = { id: 'fxB', vid: vidB, goal: 'heal', task: 'the creek water run', short: 'the creek water run', deadline: 30, state: 'asked' };
  Game.convoStoreFavor(favorB);
  Game.convoFavorCommit(vidB, favorB);
  const openB = (v.promises || {})[vidB];
  check('maker-at-creation-favor', openB && openB.maker === oldId,
    `maker=${(openB && openB.maker) || '(none)'}`);
  openB.day = (Game.state.scholar.day || 0) - 10; openB.favorDeadline = openB.day + 3; // past deadline -> rots
  Game.checkPromises('zzz-no-match', vidB);
  const rotB = lastMem(Game, vidB, 'promise_broken');
  check('rot-stamps-maker', rotB && rotB.maker === oldId, `maker=${(rotB && rotB.maker) || '(none)'}`);
  check('rot-stamps-trustAtBreak', rotB && typeof rotB.trustAtBreak === 'number',
    `trustAtBreak=${rotB && rotB.trustAtBreak}`);

  // Lane C: renounce stamps maker + trustAtBreak.
  const favorC = { id: 'fxC', vid: vidC, goal: 'heal', task: 'mending the fence line', short: 'the fence line', deadline: 30, state: 'asked' };
  Game.convoStoreFavor(favorC);
  Game.convoFavorCommit(vidC, favorC);
  const ren = Game.convoFavorRenounce(vidC);
  const brokenC = lastMem(Game, vidC, 'promise_broken');
  check('renounce-ok', ren === true, `renounced=${ren}`);
  check('renounce-stamps-maker', brokenC && brokenC.maker === oldId,
    `maker=${(brokenC && brokenC.maker) || '(none)'}`);
  check('renounce-stamps-trustAtBreak', brokenC && typeof brokenC.trustAtBreak === 'number',
    `trustAtBreak=${brokenC && brokenC.trustAtBreak}`);
  check('amends-pre-death', Game.canMakeAmends(vidC) === true, 'the old bearer owns their word');

  // THE MANTLE PASSES.
  Game.playerDeath('a hushwolf');
  const newId = Game.villagerId;
  check('mantle', newId !== oldId && !Game.over, 'successor chosen');

  // The successor is not bound by the predecessor's broken word.
  check('amends-post-death', Game.canMakeAmends(vidC) === false,
    `canMakeAmends=${Game.canMakeAmends(vidC)} (expect false)`);
  const mark = says.length;
  Game.promiseHelp(vidC);
  const refused = says.slice(mark).some(t => /You said that before|Not again/.test(t));
  check('no-refusal-post-death', refused === false, `refused=${refused}`);
  const newOpen = (v.promises || {})[vidC];
  check('repromise-maker-is-successor', newOpen && !newOpen.kept && newOpen.maker === newId,
    `new promise maker=${(newOpen && newOpen.maker && newOpen.maker.slice(0, 12)) || '(none)'}`);

  // Open promise A is released at death, never rots against the successor.
  const pA = (v.promises || {})[vidA];
  check('release-at-death', pA && pA.kept === 'released' && pA.inherited === true,
    `kept=${pA && pA.kept}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('THREW:', e && e.stack || e); process.exit(2); });
