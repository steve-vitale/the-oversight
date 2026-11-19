#!/usr/bin/env node
'use strict';
// Proof: counter-learned lines print a comma-clause descriptor as a name
// (journey-establishment r244 — found on the r244 panel: 111 COUNTER
// LEARNED lines, 7 prose-clause labels; 5 carry a comma-clause).
// RED: belltoad renders "COUNTER LEARNED — a toad like a war drum,
// throat swelling: ..." and dustboar "something heavy rooting in the
// grass, dust rising for no reason" and rut_king "something wearing a
// crown of bone, bellowing at the dusk" — sentence fragments where a
// name belongs. The r246 guard only fires when monsterNoun() falls
// back to 'something'; monsterNoun() TRUNCATES at the first comma
// (belltoad -> "toad like a war drum") but monsterCounterLabel()
// returns the RAW display name, clause tail included.
// ROOT CAUSE: monsterCounterLabel() consults monsterNoun() only for
// the 'something' fallback and otherwise returns monsterDisplayName()
// verbatim. The comma is exactly the boundary monsterNoun() itself
// draws ("COMMA = the descriptor continues into a clause").
// GREEN (post-fix): when the display name carries a comma, the label
// is the guarded noun (the truncated head); the 'something' fallback
// and proper/village names are untouched; long noun phrases without
// a comma (speedbump_turtle, nevermore) keep the display name, as
// monsterNoun() judges them noun phrases. All five render sites use
// monsterCounterLabel(), so one change covers them.
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

  // 1. The three comma-clause monsters print the truncated noun, never
  // the clause tail.
  for (const mid of ['belltoad', 'dustboar', 'rut_king']) {
    const label = Game.monsterCounterLabel(mid);
    const noun = Game.monsterNoun(mid);
    console.log(`monsterCounterLabel('${mid}') = ${JSON.stringify(label)} (noun ${JSON.stringify(noun)})`);
    check(`${mid} counter label has no comma-clause`, !label.includes(', '), 'got ' + JSON.stringify(label));
    check(`${mid} counter label is the guarded noun`, label === noun, 'label ' + JSON.stringify(label) + ' noun ' + JSON.stringify(noun));
  }

  // 2. The rendered discovery line carries the truncated noun.
  const lines = [];
  const origSay = Game.say;
  Game.say = (t) => { lines.push(String(t)); };
  const ok = Game.discoverMonsterCounter('belltoad', 'taught');
  Game.say = origSay;
  check('discoverMonsterCounter fires for belltoad', ok === true);
  const learned = lines.find((l) => l.includes('COUNTER LEARNED'));
  console.log('rendered: ' + JSON.stringify(learned));
  check('counter line exists', !!learned);
  check('counter line names the truncated noun', learned.includes('COUNTER LEARNED — toad like a war drum:'), learned);
  check('counter line never contains the clause tail', !learned.includes(', throat swelling'), learned);

  // 3. The r246 cases are untouched: living_wire still guards to
  // 'something', and the other seven 'something' defs still do.
  check('living_wire counter label is still something', Game.monsterCounterLabel('living_wire') === 'something', 'got ' + JSON.stringify(Game.monsterCounterLabel('living_wire')));
  const defs = Game.data.monsters || [];
  check('monster defs load', defs.length > 10, 'got ' + defs.length);
  const somethingDefs = defs.filter((m) => Game.monsterNoun(m.id) === 'something');
  check('eight something-fallback defs still guard', somethingDefs.length === 8, 'got ' + somethingDefs.map((m) => m.id).join(', '));
  check('all something-fallback labels are something', somethingDefs.every((m) => Game.monsterCounterLabel(m.id) === 'something'));

  // 4. Blast radius: no counter label anywhere carries a comma-clause.
  // A label is the display name, the guarded noun (comma case), or
  // 'something' — nothing else. The comma class is wide (38 of 72
  // defs carry a comma-clause descriptor with a non-'something'
  // noun) — the panel only fired 3 of them, but the fix corrects
  // the whole class the r246 comment names.
  const bad = [];
  const changed = [];
  const expectedChanged = [];
  for (const m of defs) {
    const label = Game.monsterCounterLabel(m.id);
    const disp = Game.monsterDisplayName(m.id);
    const noun = Game.monsterNoun(m.id);
    if (label.includes(', ')) bad.push(m.id + ' => ' + JSON.stringify(label));
    if (noun !== 'something' && label !== disp && label !== noun) bad.push(m.id + ' label ' + JSON.stringify(label) + ' not display/noun');
    if (noun !== 'something' && label !== disp) changed.push(m.id);
    if (noun !== 'something' && disp.includes(', ')) expectedChanged.push(m.id);
  }
  console.log('labels changed from display name (comma case): ' + changed.length + ' — ' + changed.join(', '));
  check('no counter label carries a comma-clause', bad.length === 0, bad.slice(0, 5).join('; '));
  check('exactly the comma-clause monsters change', changed.length === expectedChanged.length && changed.every((id) => expectedChanged.includes(id)), 'changed: ' + changed.join(', '));

  // 5. Long noun phrases without a comma keep the display name
  // (monsterNoun judges them noun phrases, not clauses).
  check('speedbump_turtle keeps its display name', Game.monsterCounterLabel('speedbump_turtle') === Game.monsterDisplayName('speedbump_turtle'));
  check('nevermore keeps its display name', Game.monsterCounterLabel('nevermore') === Game.monsterDisplayName('nevermore'));

  // 6. A village-named monster keeps its name in the counter line.
  Game.state.codex.monsters = { belltoad: { villageName: 'Choir Toad' } };
  check('named monster keeps its village name', Game.monsterCounterLabel('belltoad') === 'Choir Toad', 'got ' + JSON.stringify(Game.monsterCounterLabel('belltoad')));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
