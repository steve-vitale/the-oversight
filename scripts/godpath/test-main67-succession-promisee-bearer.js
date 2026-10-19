#!/usr/bin/env node
// test-succession-promisee-bearer-20261019.js — PROOF (journey-succession r27).
// BUG: when the PROMISEE inherits the mantle, the death-revert turned their
// 'promised' favor back to 'asked' with an inhFrom stamp — a live ask the new
// bearer holds against THEMSELVES. No NPC can re-ask it (the creditor IS the
// bearer); the favor sits 'asked' forever, a zombie ledger entry, and the
// sim driver (or a self-convo) chases a debt that cannot resolve.
// FIX (src/js/ledger.js playerDeath): when the favor's vid is the successor,
// the favor goes 'moot' (stamped, honest — the debt died with the debtor),
// not 'asked'. The promise is still released + listed in the open book; the
// need itself persists in the world.
// Run: node scripts/test-succession-promisee-bearer-20261019.js
// Expect: all PASS (pre-fix: favor-state FAILs — 'asked' instead of 'moot').
'use strict';
const { loadGame, setupGame } = require('../sim-harness');
let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${id} — ${detail}`); }
  else { fail++; console.log(`FAIL ${id} — ${detail}`); }
}
(async () => {
  const { Game } = await loadGame({ seed: 8201, mode: 'promisee-bearer-proof', fullTelemetry: false });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  check('setup-roster', roster.length >= 3, `${roster.length} villagers to choose from`);
  const vidB = roster[0]; // will be forced as successor (highest trust)
  const vidC = roster[1]; // control: ordinary promisee, stays an NPC

  // Two identical promised favors: B's maker dies and B inherits; C's maker dies and C stays NPC.
  for (const [vid, label] of [[vidB, 'B'], [vidC, 'C']]) {
    const favor = {
      id: 'fx-' + label + '-' + vid.slice(0, 6), vid, kind: 'food_share',
      goal: 'feed', task: 'the pantry run', short: 'the pantry run',
      deadline: 30, state: 'asked',
    };
    Game.convoStoreFavor(favor);
    const r = Game.convoFavorCommit(vid, favor);
    check('commit-' + label, r && r.ok === true, `favor ${favor.id} committed`);
  }
  check('favor-B-promised', (v.favorLedger[vidB] || {}).state === 'promised', `state=${(v.favorLedger[vidB] || {}).state}`);
  check('favor-C-promised', (v.favorLedger[vidC] || {}).state === 'promised', `state=${(v.favorLedger[vidC] || {}).state}`);

  // Force B as successor: the village chooses by trust, highest first.
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 10;
  v.trust[vidB] = 100;

  Game.playerDeath('the expedition');
  check('successor-is-B', Game.villagerId === vidB, `new bearer=${String(Game.villagerId).slice(0, 12)}`);
  check('not-over', !Game.over, 'game continues');

  const favB = v.favorLedger[vidB] || {};
  const favC = v.favorLedger[vidC] || {};
  const proB = (v.promises || {})[vidB] || {};
  const proC = (v.promises || {})[vidC] || {};
  check('promise-B-released', proB.kept === 'released' && proB.inherited === true,
    `kept=${proB.kept} inherited=${proB.inherited}`);
  check('promise-C-released', proC.kept === 'released' && proC.inherited === true,
    `kept=${proC.kept} inherited=${proC.inherited}`);
  // THE FIX: B's favor moots (creditor is the bearer); C's reverts to a live ask.
  check('favor-B-moot', favB.state === 'moot',
    `B's favor state=${favB.state} (pre-fix: 'asked' — a self-ask zombie)`);
  check('favor-B-stamped', !!favB.inhFrom, `inhFrom=${favB.inhFrom || '(none)'} — still the dead bearer's thread`);
  check('favor-C-asked', favC.state === 'asked',
    `C's favor state=${favC.state} — ordinary promisees still re-ask`);
  check('favor-C-stamped', !!favC.inhFrom, `inhFrom=${favC.inhFrom || '(none)'}`);
  // The open book still names B's released promise (the debt existed; the maker died).
  const bookLine = says.find(t => /book stays open on the table/i.test(t));
  check('open-book-fired', !!bookLine, bookLine ? bookLine.slice(0, 120) : '(no open-book line)');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
