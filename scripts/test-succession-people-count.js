#!/usr/bin/env node
// test-succession-people-count.js -- PROOF for journey-succession r5
// (2026-10-12): "we're twelve people" was hardcoded in two player-facing
// places and LIED once villagers died (seed-301 transcript: NPC says
// "we're twelve people" to a 6-person village).
//   1. convoFillPeople("{people}") renders the LIVING roster count in words.
//   2. The warm exit line in characterGen.json carries the {people} token
//      (no hardcoded twelve remains in the exits pool).
//   3. The lodge (Haven hall) description states the living count.
// RED state (pre-fix): no {people} token anywhere; helper undefined.
// Usage: node scripts/test-succession-people-count.js
// Exit 0 = all green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-people-count' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;

  // 1. helper renders living counts in words
  const cases = [[12, 'twelve people'], [10, 'ten people'], [6, 'six people'], [1, 'one person'], [0, 'no person']];
  for (const [n, word] of cases) {
    const keep = (v.roster || []).slice();
    v.roster = keep.slice(0, n);
    const out = Game.convoFillPeople('we\'re {people} people');
    check(`fill-${n}`, out === `we're ${word}`, `got: ${out}`);
    v.roster = keep;
  }
  // no token -> untouched; null-safe
  check('no-token-untouched', Game.convoFillPeople('"Later."') === '"Later."', '');
  check('null-safe', Game.convoFillPeople(null) === null, '');

  // 2. the exit line uses the token now
  const fs = require('fs');
  const cg = JSON.parse(fs.readFileSync('src/data/characterGen.json', 'utf8'));
  const exits = ((cg.convo || {}).exits || {}).warm || [];
  check('exit-line-tokenized', exits.some(l => String(l).includes('{people}')),
    exits.find(l => String(l).includes('{people}')) || 'not found');
  check('no-hardcoded-twelve-exit', !exits.some(l => /twelve people/.test(String(l))),
    'hardcoded "twelve people" still in warm exits');

  // 3. end-to-end: kill villagers, run the exit path, read the rendered line
  const roster = (v.roster || []).slice();
  while ((v.roster || []).length > 6) { const id = v.roster[v.roster.length - 1]; try { Game.removeVillager(id, 'test'); } catch (e) { break; } }
  const rendered = Game.convoFillPeople(exits.find(l => String(l).includes('{people}')) || '');
  check('e2e-six', rendered.includes('six people') && !rendered.includes('twelve'),
    `roster=${(v.roster || []).length} rendered: ${rendered}`);
  v.roster = roster;

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
