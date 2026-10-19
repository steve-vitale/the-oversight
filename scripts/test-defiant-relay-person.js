#!/usr/bin/env node
// test-defiant-relay-person.js — PROOF: the defiant path's "relay's person"
// (Price Two) must name a LIVING villager.
//
// Bug (journey-endgame r22, 2026-10-19): relayPerson() in src/js/table-defiant.js
// read the trust table and never consulted the roster. On seed 8993 the trust
// entry for Robin Wu (dead since day 22, first grave) outlived him, and the
// path named Robin as the living price: "You name Robin. They nod..." — a
// corpse can't nod. The relay "got its hands" on someone already buried; the
// village "lost" no one. RED names the dead; GREEN names a living villager.
process.env.TRIBFLOOR = '1';
process.env.WINDEFER = '1';
process.env.FEASTSCALE_R13 = '1';
process.env.BELONG_V3 = '1';

const { loadGame, setupGame } = require('./sim-harness');

const strip = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const firstName = (id, Game) => {
  try { return (((Game.getPerson(id) || {}).name) || id || '').split(' ')[0]; }
  catch (e) { return id; }
};

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-defiant-rp' });
  await setupGame(Game);

  const prompts = [];
  const origPrompt = Game.tablePrompt;
  Game.tablePrompt = function (html, options, frame) {
    try { prompts.push(strip(html)); } catch (e) {}
    return origPrompt.call(this, html, options, frame);
  };

  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId);
  if (roster.length < 2) { console.log('SKIP: need 2+ non-player villagers'); process.exit(2); }
  const deadId = roster[0], liveId = roster[1];
  // the r22 condition: the dead villager's trust entry outlives them
  v.trust = v.trust || {};
  v.trust[deadId] = 99;
  v.trust[liveId] = 10;
  // kill + drop from roster (the real death flow prunes the roster; the
  // trust entry persists — that is the bug's precondition)
  try { Game.getPerson(deadId).dead = true; } catch (e) {}
  v.roster = (v.roster || []).filter(id => id !== deadId);

  Game.tableStartPath('defiant');
  const T = Game.tableState();
  T.beat = 1;
  Game.tableRunBeat();

  const beat1 = prompts[prompts.length - 1] || '';
  const deadName = firstName(deadId, Game);
  // expected: the highest-trust LIVING roster member (excluding the player)
  const t = v.trust || {};
  const expectId = roster
    .filter(id => id !== deadId)
    .sort((a, b) => (t[b] | 0) - (t[a] | 0))[0];
  const expectName = firstName(expectId, Game);
  console.log('beat-1 prompt (tail):', beat1.slice(0, 260));
  console.log('dead villager:', deadName, '| expected living:', expectName + '(' + expectId + ')');
  if (beat1.indexOf(deadName) >= 0) {
    console.log('RED: the price names a DEAD villager (' + deadName + ')');
    process.exit(1);
  }
  if (beat1.indexOf(expectName) >= 0) {
    console.log('GREEN: the price names the highest-trust living villager (' + expectName + ')');
    process.exit(0);
  }
  console.log('UNCLEAR: neither name in the prompt');
  process.exit(2);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
