#!/usr/bin/env node
// test-moot-exiled-accuser-20261015.js — PROOF TEST for the social-life
// blank: an exiled accuser's case still convened a moot IN THEIR NAME.
// Transcript-verified (r15 pilot, seed 1201 larceny-leaning): Deirdre was
// exiled at the day-12 moot, and hours later the narration read "Deirdre
// has gathered enough voices... Deirdre calls the moot."
// Root cause: playerCaseTick called callMoot(c.id, c.accuser) with no check
// that the accuser is still in the village.
// Fix: when the accuser is gone (exiled/dead), a living villager calls the
// moot instead — the victim if living, else the living villager closest to
// the victim (same rule as npcMootTick) — and the announcement names the
// handoff honestly ("<accuser> is gone, but the charge stands").
// RED: callMoot receives the exiled accuser. GREEN: it receives a living
// villager, never the exiled accuser.
// Usage: node scripts/test-moot-exiled-accuser-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra === undefined ? '' : extra); }
}

async function main() {
  const { Game } = await loadGame({ seed: 4242 });
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.sysSay = () => {}; Game.emit = () => {};
  await setupGame(Game);

  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  const A = npcs[0]; // the accuser — will be exiled
  const T = npcs[1]; // the victim/target — stays living
  if (!A || !T) { console.log('FAIL: not enough villagers'); process.exit(1); }

  // a player-accused theft case, ripe for its moot (mootIn default 2)
  const bs = Game.betrayalState();
  bs.cases = (bs.cases || []).filter(() => false);
  Game.state.scholar.day = 10;
  const c = {
    id: 'case_test_exiled', plotId: 'plot_test', charge: 'theft', day: 0,
    accused: [me], target: T, accuser: A,
    belief: {}, evidence: [], bribes: [], exposedBribes: [],
    inconsistencies: [], status: 'open', flipped: null,
    playerRole: 'accused',
  };
  bs.cases.push(c);

  // the accuser is exiled BEFORE the moot convenes
  Game.removeVillager(A, 'exiled');
  ok(!Game.npcIds().includes(A), 'accuser is gone from the roster', Game.npcIds().length);

  // capture who the moot is convened in the name of (not the full trial)
  const calls = [];
  const realCallMoot = Game.callMoot.bind(Game);
  Game.callMoot = (caseId, byId) => { calls.push({ caseId, byId }); return null; };

  Game.playerCaseTick();

  Game.callMoot = realCallMoot;
  ok(calls.length === 1 && calls[0].caseId === 'case_test_exiled', 'the moot was convened exactly once', JSON.stringify(calls));
  if (calls.length) {
    const byId = calls[0].byId;
    ok(byId !== A, 'the caller is NOT the exiled accuser', 'caller=' + byId + ' accuser=' + A);
    ok(Game.npcIds().includes(byId), 'the caller is a living villager', 'caller=' + byId);
    ok(byId === T, 'the living victim calls the moot in the charge\'s name', 'caller=' + byId + ' target=' + T);
  }
  const accuserNamed = said.some(t => t.indexOf('calls the moot') !== -1 && t.indexOf(Game.displayName(A).split(' ')[0]) !== -1);
  ok(!accuserNamed, 'no announcement has the exiled accuser calling the moot',
    said.filter(t => /moot/i.test(t)).map(t => t.slice(0, 90)).join(' | ') || '(no moot lines)');

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the blank is present'); process.exit(1); }
  console.log('GREEN: an exiled accuser never calls the moot — a living villager does');
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
