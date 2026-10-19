#!/usr/bin/env node
// test-namebeast-recency-20261019.js — PROOF for journey-landing r25:
// "what are we calling that thing?" must open the most recent debate.
//
// Transcript-caught (seed 95, day 14): the player did [tellbeast] about the
// mirrormoth ("a moth the size of a dinner plate") — the village started
// arguing about it — then asked [namebeast] "What are we calling that thing?"
// and Nino answered about the BELLTOAD ("a toad like a war drum"), an older
// debate that happened to sort first. The namebeast handler took cands[0] in
// object-insertion order, ignoring conversational recency.
//
// FIX (game.js): kickMonsterNaming stamps a monotonic namingKickSeq on the
// entry; the namebeast handler sorts candidates by namingKickSeq descending,
// so the most recently kicked debate opens first. Single-debate behavior is
// unchanged (sort of one element).
//
// RED: pre-fix tree -> namebeast opens the OLDER debate (belltoad).
// GREEN: fix -> namebeast opens the most recently kicked debate (mirrormoth).
'use strict';
const { loadGame, setupGame } = require('../sim-harness');

const SEED = parseInt(process.env.SEED || '9101', 10);
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.error('FAIL:', name); } }

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'namebeast-recency-proof' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0, 'roster non-empty');
  const vid = roster[0];

  // capture say output
  const said = [];
  const origSay = Game.say.bind(Game);
  Game.say = (line) => { said.push(String(line)); try { return origSay(line); } catch (e) { return null; } };

  // two beasts with active naming debates: belltoad kicked FIRST (older),
  // mirrormoth kicked SECOND (most recent — the one the player just told about)
  Game.kickMonsterNaming('belltoad');
  Game.kickMonsterNaming('mirrormoth');
  const entries = Game.state.codex.monsters || {};
  ok(entries.belltoad && entries.belltoad.namingKicked, 'belltoad naming kicked');
  ok(entries.mirrormoth && entries.mirrormoth.namingKicked, 'mirrormoth naming kicked');
  ok((entries.mirrormoth.namingKickSeq || 0) > (entries.belltoad.namingKickSeq || 0),
    'mirrormoth kick seq newer than belltoad');

  said.length = 0;
  const res = Game.askAbout(vid, 'namebeast');
  ok(res && res.ok && res.naming, 'namebeast returned a naming result');
  const line = said.join(' ');
  // the opened debate must be the mirrormoth's (most recent kick)
  ok(res.naming.mid === 'mirrormoth', 'namebeast opened the most-recent debate (mirrormoth), got ' + (res.naming && res.naming.mid));
  ok(/dinner plate/i.test(line), 'opened line describes the moth: ' + line.slice(0, 120));
  ok(!/war drum/i.test(line), 'opened line is NOT about the older toad debate');

  // control: single active debate still opens (no regression)
  entries.belltoad.villageName = 'Old Toad';
  said.length = 0;
  const res2 = Game.askAbout(vid, 'namebeast');
  ok(res2 && res2.naming && res2.naming.mid === 'mirrormoth', 'single-debate control opens mirrormoth');

  // control: no active debates -> honest shrug (no regression)
  entries.mirrormoth.villageName = 'Big Moth';
  said.length = 0;
  const res3 = Game.askAbout(vid, 'namebeast');
  ok(res3 && res3.ok && !res3.naming, 'no-debate control returns ok without naming');
  ok(/Name what\?/i.test(said.join(' ')), 'no-debate control says the honest shrug line');

  console.log(`\nnamebeast-recency: ${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
