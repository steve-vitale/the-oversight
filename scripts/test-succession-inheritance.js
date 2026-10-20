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
  // THREAD SNIPPETS (journey-social r19 2026-10-16): convoThreadOpen's
  // plant contract is no ghost threads — the 5th arg must be a real beat
  // (>=4 words, not a deflection), or the plant is silently rejected.
  Game.convoThreadOpen(vid1, 'hardtime', 'a hard time', 'walked away mid-thread',
    'They told me about the winter the roof caved in and they rebuilt it alone.');
  Game.convoThreadOpen(vid2, 'deepthread', 'a deep matter', 'unfinished business',
    'They keep a tin of seeds from home and will not say what they are for.');
  // FAVOR KIND (dedc46db7 2026-10-20): favor requests connect to real
  // playable actions now — water_haul has no playable action and
  // convoFavorCommit rejects it as unsupported. food_share commits.
  const favor1 = {
    id: 'favor-test-1', vid: vid1, kind: 'food_share', short: 'the food share',
    task: 'share food from your pack', goal: 'food',
    state: 'asked', askedDay: day1, deadline: day1 + 2,
  };
  Game.convoStoreFavor(favor1);
  const cr = Game.convoFavorCommit(vid1, favor1);
  Game.convoPlantSeed(vid1, { wantId: 'repay', note: 'the food share you promised', favorId: favor1.id });
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
  // TRUST FORMULA (blitz-succession 2026-10-13, Steve's call): the office's
  // standing is remembered through three channels — office residue (40%),
  // elders' vouching, and the successor's OWN record (40%). The old pin
  // ("explicit 0 stays 0") predates the own-record channel: with office 0
  // and the heir's own trust 90, the heir inherits round(0*0.4 + 90*0.4) =
  // 36 (floor 10). The office term is still 0 — no free trust from a
  // distrusted office; the 36 is the heir's own earned standing carrying.
  check('trust-office-zero-own-carries', (v.trust || {})[newId] === 36,
    `new trust=${(v.trust || {})[newId]} (want 36 = round(0*0.4 + 90*0.4))`);
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
  // RESUME DICE (convoResumeOpener, 65% no-fire gate): the resume is
  // probabilistic by design (anti-spam), so the test pins the LINE's
  // content, not the dice. Forcing Math.random -> 0 here is legitimate:
  // conversation.js reads the global at call time, and the gate is a
  // separate design concern from the naming honesty this check pins.
  const _mr = Math.random;
  Math.random = () => 0;
  let opening = '';
  try {
    Game.startConvo(vid1);
    opening = ((Game.convoGet(vid1).transcript || [])[0] || {}).text || '';
  } finally { Math.random = _mr; }
  check('resume-opener-names-predecessor',
    opening.includes(oldFirst) && opening.indexOf('"We never finished') !== 0,
    opening.slice(0, 150));
  try { Game.endConvo(vid1, 'left'); } catch (e) {}
  // a second conversation surfaces the memory menu item — memories are
  // deliberate topic choices (convo-scene.js): offered in the SUBJECT menu,
  // not the opener menu
  Game.startConvo(vid1);
  const subj = (Game.convoChoices(vid1) || []).find(c => c.id === 'dlg:subject');
  let memResp = '(no subject choice offered)';
  if (subj) {
    Game.convoTurn(vid1, 'dlg:subject');
    const memChoice = (Game.convoChoices(vid1) || []).find(c => c.id === 'alive:memory:gift');
    memResp = memChoice ? '' : '(no memory choice offered)';
    if (memChoice) {
      const before = (Game.convoGet(vid1).transcript || []).length;
      Game.convoTurn(vid1, memChoice.id);
      const t = (Game.convoGet(vid1).transcript || []).slice(before);
      memResp = t.map(e => `${e.who}: ${e.text}`).join(' | ').slice(0, 200);
    }
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
  Game.convoThreadOpen(vid1, 'newthread', 'a new matter', 'unfinished business',
    'They asked whether the north field will thaw before the seed rots.');
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
