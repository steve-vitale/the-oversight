// test-cx-gossip-player-loss-r18.js — ESTABLISHMENT r18: THE SILENT LOSS.
//
// Wild-surfacing probe (r18, 6 seeds x 42d, competent): 24 contests aired,
// 6 surfaced as named gossip (25.0% — exactly at the pre-registered GO
// boundary). The distribution was the tell: 20 player WINS -> 6 surfaced
// (30%), 4 player LOSSES -> 0 surfaced (0%). Root cause is not the gossip
// weighting — it is the seeding. In _contestEnd's loss branch:
//
//   isWatch (villager lost)  -> _cxGossip('survived', ac.participant, ...)  SEEDED
//   player lost (not watch)  -> nothing seeded. The entry never exists.
//
// The r16 fix closed the identical hole for player WINS
// ("previously only villager wins seeded gossip, so a run of player wins
// left the gossip stream silent about the show"). The loss side kept the
// hole: every player loss (The Blood Tithe x3, The Witness x1 across the
// r18 probe) left zero contest gossip behind, while the village watched.
//
// RED: on pre-fix code, _contestEnd(ac, 'lost') with a player participant
//   seeds NO contest_survived entry for 'player'; the villager path seeds.
// GREEN: post-fix, the player-loss seeds one entry:
//   action='contest_survived', dims.who='player', dims.contest=<name>.
//   The render for contest_survived with dims.who='player' already exists
//   (game.js, r16-era) and reads "You" via the wname special-case.
// Run: node scripts/test-cx-gossip-player-loss-r18.js (SEED env optional)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '61', 10);
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

function gossipEntries(Game, action, who) {
  const g = (Game.state.village || {}).gossip || [];
  return g.filter(e => e && e.action === action && e.dims && e.dims.who === who);
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-cx-gossip-loss' });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId && id !== 'player');
  assert(roster.length >= 1, 'need 1+ non-scholar villagers');
  const vid = roster[0];

  // ---- CONTROL: villager loss (isWatch) seeds contest_survived ----
  const acV = { contestId: 'tithe', participant: vid };
  try { Game._contestEnd(acV, 'lost', null); } catch (e) { console.log('  (villager _contestEnd threw: ' + e.message + ')'); }
  const vSeeded = gossipEntries(Game, 'contest_survived', vid);
  ok('villager loss seeds contest_survived (control)', vSeeded.length >= 1,
    `found ${vSeeded.length}`);
  ok('villager seed names the contest', vSeeded.some(e => e.dims.contest === 'The Blood Tithe'),
    JSON.stringify(vSeeded.map(e => e.dims.contest)));

  // ---- BUG: player loss seeds nothing (pre-fix) ----
  const before = gossipEntries(Game, 'contest_survived', 'player').length;
  const acP = { contestId: 'tithe', participant: undefined }; // isWatch false -> player path
  try { Game._contestEnd(acP, 'lost', null); } catch (e) { console.log('  (player _contestEnd threw: ' + e.message + ')'); }
  const after = gossipEntries(Game, 'contest_survived', 'player');
  ok('player loss seeds contest_survived', after.length > before,
    `before=${before} after=${after.length}`);
  const named = after.filter(e => e.dims.contest === 'The Blood Tithe');
  ok('player-loss seed names the contest', named.length >= 1,
    JSON.stringify(after.map(e => e.dims.contest)));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
