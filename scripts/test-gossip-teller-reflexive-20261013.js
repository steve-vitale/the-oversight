#!/usr/bin/env node
// test-gossip-teller-reflexive-20261013.js — PLAYTEST social r9 2026-10-13.
// Blank from probe 1: the fire-fragment gossip renderer covered
// listener==subject (r4) and player==subject with reflexive pronouns, but
// teller==subject still rendered in third person:
//   "Nabila telling Gerald about Nabila."
// RED on pristine, GREEN after the reflexive fix in spreadGossip.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exitCode = 1; }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 424242, mode: 'test' });
  if (loadFails && loadFails.length) { fail('module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const v = Game.state.village;
  const player = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== player);
  if (npcs.length < 3) { fail('need 3+ NPCs, got ' + npcs.length); return; }
  const [A, B, C] = npcs;
  const nameA = Game.displayName(A), nameC = Game.displayName(C);

  const lines = [];
  Game.say = m => lines.push(String(m));

  // Deterministic retelling: every teller always retells to someone, every say-gate fires.
  const origRandom = Math.random;
  Math.random = () => 0;
  try {
    v.gossip = [
      // teller==subject: rumor about A, retold BY A
      { action: 'stingy', dims: { who: A }, heard: [A], distortion: 3, day: 1, partKey: 'pk-teller', noTrust: true },
      // control: subject C, told by B
      { action: 'brave', dims: { who: C }, heard: [B], distortion: 3, day: 1, partKey: 'pk-control', noTrust: true },
    ];
    // NOTE: no player-as-teller case — the say gate (`teller !== this.villagerId`)
    // deliberately never renders fragments of the player telling their own
    // story (you don't "catch fragments" of yourself talking). Sensible, not a gap.
    Game.spreadGossip();
  } finally { Math.random = origRandom; }

  const frags = lines.filter(l => l.indexOf('fragments by the fire') !== -1);
  if (frags.length < 2) { fail('expected 2 fragment lines, got ' + frags.length + ':\n' + frags.join('\n')); return; }

  // 1. teller==subject must be reflexive, never "Nabila telling Gerald about Nabila"
  const tellerLine = frags.find(l => l.indexOf('about ' + nameA) !== -1) ? null
    : frags.find(l => l.indexOf('telling') !== -1 && /about (herself|himself|themself)\b/.test(l));
  if (!tellerLine) fail('teller==subject not rendered reflexively. Lines:\n' + frags.join('\n'));
  else ok('teller==subject reflexive: ' + tellerLine.slice(0, 110));

  // 2. control: unrelated subject still named
  const controlLine = frags.find(l => l.indexOf('about ' + nameC) !== -1);
  if (!controlLine) fail('control (unrelated subject) lost the name. Lines:\n' + frags.join('\n'));
  else ok('control names unrelated subject: ' + controlLine.slice(0, 110));

  if (!process.exitCode) console.log('ALL GREEN');
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exitCode = 1; });
