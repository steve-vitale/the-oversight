#!/usr/bin/env node
// TEST (Steve 2026-10-07), SOCIALITE round 4 finding.
// BUG: invite_party is dropped by the subject-menu early return.
// The invite push (conversation.js ~2544) runs and succeeds, but when the
// player reaches the base menu via dlg:subject ("can I ask you something
// else?" — the dialogue layer fronts EVERY conversation), the subject-menu
// branch (~2602) builds a FRESH `sub` array and returns it, discarding the
// `choices` array that already holds invite_party. The invite only survives
// accidentally when gqActive/reactiveDef skips the early return.
// Design comment at the push site says the invite "must never be crowded
// out by small talk" — the early return violates it.
// DRAMA-TERRITORY: conversation.js is the drama sibling's file — this test
// documents the bug for them. Do NOT "fix" by editing conversation.js here.
const K = require('./godpath/lib');
const menu = require('./lib/conversation-playtest');
(async () => {
  const Game = await K.load({seed: Number(process.env.SEED || 20261007)});
  Game.genRoster('Columbus, Ohio');
  const pick = (Game.generatedRoster || [])[0];
  Game.newGame('Columbus, Ohio', null, pick.id);
  Game.depart();
  let g = 0;
  while (Game.state.scholar.day < 8 && g++ < 20 && !Game.over) { try { Game.endDay(); } catch (e) {} }

  const failures = [];
  const ok = (name, cond, extra) => {
    console.log(`   [${cond ? 'OK' : 'FAIL'}] ${name}${extra ? ' — ' + extra : ''}`);
    if (!cond) failures.push(name);
  };

  const v = Game.state.village;
  v.trust = v.trust || {};
  const villagers = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = villagers[0];
  v.trust[vid] = 60; // well above the 20 trust floor

  ok('party unlocked and discovered', Game.partyUnlocked() && Game.hasDiscovered('party'));

  // Honest player path: open conversation, then "can I ask you something else?"
  Game.startConvo(vid);
  // An existing personal invitation owns its answer menu. Resolve it through
  // an actually offered reply before testing a different subject menu.
  if (Game.pendingInvite(vid)) {
    const decline = menu.reach(Game, vid, ['betrayal:decline']);
    ok('pending invitation offers a real decline', !!decline);
    if (!decline) throw Error('Invitation could not be answered');
    menu.choose(Game, vid, decline.id);
    ok('declining resolves the pending invitation', !Game.pendingInvite(vid));
    Game.endConvo(vid, 'left');
    Game.startConvo(vid);
  }
  const subject = menu.reach(Game, vid, ['dlg:subject']);
  ok('subject navigation is actually offered', !!subject);
  if (subject) menu.choose(Game, vid, subject.id);
  const ids = menu.offers(Game,vid).map(x=>x.id);
  Game.endConvo(vid, 'left');

  // The invite must survive the subject menu — the design comment at the
  // push site says a trust-earned person-action must never be crowded out.
  ok('invite_party present after dlg:subject (trust 60, party unlocked)',
    ids.includes('invite_party'),
    'menu was: ' + ids.join(','));

  if (failures.length) { console.log(`\n${failures.length} FAILING (bug reproduced)`); process.exit(1); }
  console.log('\nALL GREEN');
})().catch(error => { console.error(error); process.exitCode = 1; });
