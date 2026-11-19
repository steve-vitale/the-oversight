#!/usr/bin/env node
'use strict';
// Proof: counter-learned lines use the raw unknown descriptor as a name
// (journey-endgame r246, F-observation — found on the r246 C-wide panel:
// fresh seed 89817, day 6, Chloe teaches the living_wire counter).
// RED: Chloe says "Here's what we figured out about the creek went
// still, and your arm-hairs stood up." and the discovery line reads
// "COUNTER LEARNED — the creek went still, and your arm-hairs stood
// up: Get OUT of the water..." — a sentence fragment where a name
// belongs. living_wire's unknown descriptor is a prose clause, not a
// noun phrase.
// ROOT CAUSE: the five counter-learned render sites (game.js: the
// taught line, discoverMonsterCounter, and the two observation / one
// witness channels) compose monsterDisplayName() into a name slot.
// monsterDisplayName returns the RAW descriptor for unnamed monsters.
// The guarded monsterNoun() already falls back to 'something' for
// exactly this class (journey-crisis r192 extended its verb guard for
// this same monster's kill-composition site) — but the counter sites
// never consult it.
// GREEN (post-fix): monsterCounterLabel() returns the display name
// everywhere except where monsterNoun() falls back to 'something'
// (clause heads and long-prose descriptors — 8 defs in current
// content: living_wire plus memory_projector, ducks_in_a_row,
// understudy, landlord, heckler, paparazzo, chorus_line, whose
// descriptors are sentences the >50-char rule already rejects), and
// the counter lines render 'something' there. All other monsters
// render byte-identical labels. Proper/village names are untouched
// (monsterNoun returns them, so the label keeps them).
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  // Pre-naming state: no village name, System has not arrived — the
  // descriptor path is live.
  Game.state.systemArrived = false;
  if (Game.state.codex) Game.state.codex.monsters = {};

  // 1. The label for the clause monster is the guarded fallback.
  const lw = Game.monsterCounterLabel('living_wire');
  console.log(`monsterCounterLabel('living_wire') = ${JSON.stringify(lw)}`);
  check('living_wire counter label is not a clause fragment', lw === 'something', 'got ' + JSON.stringify(lw));

  // 2. The rendered discovery line carries the label, never the clause.
  const lines = [];
  const origSay = Game.say;
  Game.say = (t) => { lines.push(String(t)); };
  const ok = Game.discoverMonsterCounter('living_wire', 'taught');
  Game.say = origSay;
  check('discoverMonsterCounter fires for living_wire', ok === true);
  const learned = lines.find((l) => l.includes('COUNTER LEARNED'));
  console.log('rendered: ' + JSON.stringify(learned));
  check('counter line exists', !!learned);
  check('counter line names something, not the clause', learned.includes('COUNTER LEARNED — something:'), learned);
  check('counter line never contains the clause', !learned.includes('creek went still'), learned);

  // 3. Blast radius: every other monster's label is its display name.
  // Only monsters whose guarded noun falls back to 'something' change.
  const defs = Game.data.monsters || [];
  check('monster defs load', defs.length > 10, 'got ' + defs.length);
  const changed = [];
  const mismatched = [];
  for (const m of defs) {
    const label = Game.monsterCounterLabel(m.id);
    const disp = Game.monsterDisplayName(m.id);
    const noun = Game.monsterNoun(m.id);
    if (noun === 'something') {
      if (label !== 'something') mismatched.push(m.id + ' => ' + JSON.stringify(label));
      else changed.push(m.id);
    } else if (label !== disp) {
      mismatched.push(m.id + ' label ' + JSON.stringify(label) + ' != display ' + JSON.stringify(disp));
    }
  }
  console.log('labels changed to something: ' + (changed.length ? changed.join(', ') : 'none'));
  check('only clause/prose monsters change label', changed.length === 8, 'changed: ' + changed.join(', '));
  check('no other label differs from its display name', mismatched.length === 0, mismatched.slice(0, 5).join('; '));

  // 4. A village-named monster keeps its name in the counter line.
  Game.state.codex.monsters = { living_wire: { villageName: 'Spark-Eel' } };
  check('named monster keeps its village name', Game.monsterCounterLabel('living_wire') === 'Spark-Eel', 'got ' + JSON.stringify(Game.monsterCounterLabel('living_wire')));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
