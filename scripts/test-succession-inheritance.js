#!/usr/bin/env node
// test-succession-inheritance.js -- PROOF for the journey-succession fixes
// (2026-10-11):
//   1. trust-discount: a DISTRUSTED office (explicit trust 0) transfers 0,
//      not 12 (the `|| 20` conflation bug).
//   2. mantle handoff record: v.mantleOf captures from/to/day.
//   3. inherited open promises are RELEASED at death (not kept, not broken,
//      not rotting); their favor reverts to a live 'asked'; the repay seed
//      is deleted.
//   4. inherited open threads / want-seeds / favors / memories NAME the
//      predecessor -- the new bearer never pretends they were there.
//   5. control: records made AFTER the handoff are not marked inherited
//      (stamp-based -- precise across same-day deaths); a handoff chain
//      keeps the earliest stamp on untouched records.
// Usage: node scripts/test-succession-inheritance.js
// Exit 0 = all green, 1 = failure (prints which).
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-succession-inheritance' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village, s = Game.state.scholar;
  const oldId = Game.villagerId;
  const oldName = (() => { try { return Game.displayName(oldId); } catch (e) { return oldId; } })();
  const oldFirst = oldName.split(' ')[0];
  const npcs = (v.roster || []).filter(id => id !== oldId);
  if (npcs.length < 3) { console.log('need 3 NPCs'); process.exit(1); }
  const heir = npcs[0], vid1 = npcs[1], vid2 = npcs[2];
  v.trust[heir] = 90; // heir takes the mantle; plant on the other two
  v.trust[vid1] = 50; v.trust[vid2] = 50;
  const day1 = s.day || 1;
  console.log(`old bearer: ${oldName} (day ${day1}), heir: ${heir}, npc1: ${vid1}, npc2: ${vid2}`);

  // ---- plant conversational state as the OLD bearer ----
  Game.convoThreadOpen(vid1, 'hardtime', 'a hard time', 'walked away mid-thread');
  Game.convoThreadOpen(vid2, 'deepthread', 'a deep matter', 'unfinished business');
  const favor1 = {
    id: 'favor-test-1', vid: vid1, kind: 'water_haul', short: 'the water run',
    task: 'haul water from the creek', goal: 'water',
    state: 'asked', askedDay: day1, deadline: day1 + 2,
  };
  Game.convoStoreFavor(favor1);
  const cr = Game.convoFavorCommit(vid1, favor1);
  Game.convoPlantSeed(vid1, { wantId: 'repay', note: 'the water run you promised', favorId: favor1.id });
  Game.remember(vid1, 'gift', 'gave them extra food');
  const favor2 = {
    id: 'favor-test-2', vid: vid2, kind: 'forage_help', short: 'the forage sweep',
    task: 'help sweep the north patch', goal: 'food',
    state: 'asked', askedDay: day1, deadline: day1 + 2,
  };
  Game.convoStoreFavor(favor2);
  Game.convoPlantSeed(vid2, { wantId: 'ask_favor', note: 'the help they asked you for', favorId: favor2.id });
  v.trust[oldId] = 0; // the office is DISTRUSTED -- the old `|| 20` gave 12
  check('commit-setup', cr.ok === true, JSON.stringify(cr));

  // ---- the death (same day as the plants -- the stamp must disambiguate) ----
  Game.playerDeath('the hunt');
  const newId = Game.villagerId;
  check('heir-took-mantle', newId === heir, `new=${newId} heir=${heir}`);
  const m = v.mantleOf || [];
  check('mantle-record', m.length === 1 && m[0].from === oldId && m[0].to === newId,
    JSON.stringify(m[0] || null));
  check('trust-zero-stays-zero', (v.trust || {})[newId] === 0,
    `new trust=${(v.trust || {})[newId]} (bug gave 12)`);
  const p = (v.promises || {})[vid1];
  check('promise-released', p && p.kept === 'released', `kept=${p && p.kept}`);
  check('favor-reverted-to-asked', favor1.state === 'asked', `state=${favor1.state}`);
  check('repay-seed-deleted', !(v.convoSeeds || {})[vid1],
    JSON.stringify((v.convoSeeds || {})[vid1] || null));
  check('ask-seed-survives', !!((v.convoSeeds || {})[vid2] || {}).wantId,
    JSON.stringify((v.convoSeeds || {})[vid2] || null));
  const open1 = Game.convoOpenThreads(vid1).find(o => o.tid === 'hardtime');
  check('thread-stamped', !!open1 && Game.inheritedName(open1) === oldFirst,
    `inh=${open1 && (open1.inh || '-')}`);
  check('favor-stamped', Game.inheritedName(favor1) === oldFirst, `inhFrom=${favor1.inhFrom}`);
  const mems = ((v.memory || {})[vid1] || []).filter(mm => mm.t === 'gift');
  check('memory-stamped', mems.length > 0 && Game.inheritedName(mems[mems.length - 1]) === oldFirst,
    `inh=${mems.length && mems[mems.length - 1].inh}`);

  // ---- the new bearer talks to npc1: the opening names the predecessor ----
  // (startConvo fires the resume opener internally and consumes the thread)
  Game.startConvo(vid1);
  const opening = ((Game.convoGet(vid1).transcript || [])[0] || {}).text || '';
  check('resume-opener-names-predecessor',
    opening.includes(oldFirst) && opening.indexOf('"We never finished') !== 0,
    opening.slice(0, 150));
  try { Game.endConvo(vid1, 'left'); } catch (e) {}
  // a second conversation surfaces the memory menu item
  Game.startConvo(vid1);
  const memChoice = (Game.convoChoices(vid1) || []).find(c => c.id === 'alive:memory:gift');
  let memResp = '(no memory choice offered)';
  if (memChoice) {
    const before = (Game.convoGet(vid1).transcript || []).length;
    Game.convoTurn(vid1, memChoice.id);
    const t = (Game.convoGet(vid1).transcript || []).slice(before);
    memResp = t.map(e => `${e.who}: ${e.text}`).join(' | ').slice(0, 200);
  }
  check('memory-names-predecessor', memResp.includes(oldFirst), memResp.slice(0, 150));
  try { Game.endConvo(vid1, 'left'); } catch (e) {}

  // ---- npc2: the favor follow-up names the predecessor, refreshes deadline ----
  const fline = Game.convoFavorFollowup(vid2, Game.convoGetFavor(vid2));
  check('favor-followup-names-predecessor',
    !!fline && fline.includes(oldFirst),
    (fline || 'null').slice(0, 150));
  check('favor-deadline-refreshed', (Game.convoGetFavor(vid2).deadline || 0) >= (Game.state.scholar.day || 0),
    `deadline=${Game.convoGetFavor(vid2).deadline} day=${Game.state.scholar.day}`);

  // ---- control: records planted AFTER the handoff are not inherited ----
  Game.convoThreadOpen(vid1, 'newthread', 'a new matter', 'unfinished business');
  const openNew = Game.convoOpenThreads(vid1).find(o => o.tid === 'newthread');
  check('control-not-inherited', !!openNew && Game.inheritedName(openNew) === null,
    `inh=${openNew && (openNew.inh || '-')}`);

  // ---- second death: an untouched thread keeps the earliest stamp ----
  const midId = Game.villagerId;
  Game.playerDeath('the wild');
  check('mantle-chain', (v.mantleOf || []).length === 2 && v.mantleOf[1].from === midId,
    `len=${(v.mantleOf || []).length}`);
  const deepStill = Game.convoOpenThreads(vid2).find(o => o.tid === 'deepthread');
  check('chain-keeps-first-stamp', !!deepStill && Game.inheritedName(deepStill) === oldFirst,
    `names ${oldFirst}: ${deepStill && Game.inheritedName(deepStill)}`);

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e.stack); process.exit(1); });
