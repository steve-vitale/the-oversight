#!/usr/bin/env node
'use strict';
// Proof: a repeated identical nv: react gesture thins the sitting out
// (journey-landing r132, NOD LOOP — carried observation, third band:
// Herve 5x r196, Xue 3x, Mariko 4x r197).
// In a no-shared-words sitting with no mime shown, the player can only
// nod/smile/point/listen; the nv:nod handler spoke one of 3 rotating
// acknowledgment lines (+1 trust) with NO state change — no counter, no
// progression, no winddown arm — so nodding 4-5x produced 4-5 identical
// turns (pilot BEFORE: 1143/1144/1150 d2, streaks 4/5/5, winddown only
// via the budget at the last pick). Canon (docs/CONVERSATIONS.md):
// nonverbal = "gesture choices with varying outcomes"; "a 3-exchange
// conversation that feels real beats a 10-exchange loop."
// RED (unfixed): after 2 consecutive nv:nod, winddownQueued is false and
// the 3rd nod returns another nod acknowledgment; the sitting runs to the
// budget (4-5 identical nods).
// GREEN (post-fix): after the 2nd consecutive identical react gesture
// (nod/smile/pointself) the winddown is queued (nvRepeatThin); the 3rd
// gesture surfaces the thinning beat (windingDown armed, line is one of
// the nvwinddown pool lines); the menu then narrows to leave. Alternating
// gestures never arm it, and nv:listen never arms it (listen progresses:
// language exposure, caught words, speak_back unlock).
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const NV_WINDDOWN = [
  'Their gestures slow — the conversation thinning like light at dusk.',
  'They glance toward their own thoughts; the exchange is winding down.',
  'A final shared look — you both feel the talk running its course.',
];

async function main() {
  const Game = await K.load({ seed: 1143 });
  K.newRun(Game);
  const v = Game.state.village;
  const scholarId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== scholarId);
  assert(roster.length >= 3, 'need 3+ villagers besides the scholar, got ' + roster.length);
  // Find a no-shared-words villager (pure read — no probe sitting: a probe
  // would speak lines the ledger then blocks for the real sitting).
  const commNone = roster.filter(id => {
    try { return Game.commLevel && Game.commLevel(id).level === 'none'; } catch (e) { return false; }
  });
  assert(commNone.length >= 1, 'need a commNone villager on seed 1143, got 0');
  const vid = commNone[0];
  console.log(`commNone villager=${Game.displayName(vid)} (${vid}) of ${commNone.length} on this seed`);

  function menuIds() {
    return (Game.convoChoices(vid) || []).map(x => x && x.id).filter(Boolean);
  }
  function startNv() {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    assert(c.thread === 'nonverbal', 'sitting is nonverbal, got thread=' + c.thread);
    assert(menuIds().includes('nv:nod'), 'menu offers nv:nod: ' + menuIds().join(','));
    return c;
  }

  // 1. Repeat nod: 2nd identical nod arms the thin-out; 3rd surfaces it.
  let c = startNv();
  check('case1 budget is at least 3 (thin-out must beat it, not ride it)', (c.budget || 0) >= 3, 'budget=' + c.budget);
  let r = Game.convoTurn(vid, 'nv:nod');
  c = Game.convoGet(vid);
  check('case1 1st nod: no thin-out yet', c.nvRepeatThin !== true && !c.winddownQueued, 'nvRepeatThin=' + c.nvRepeatThin + ' queued=' + c.winddownQueued);
  r = Game.convoTurn(vid, 'nv:nod');
  c = Game.convoGet(vid);
  check('case1 2nd identical nod arms the thin-out', c.nvRepeatThin === true, 'nvRepeatThin=' + c.nvRepeatThin);
  check('case1 winddown queued after 2nd nod', c.winddownQueued === true, 'queued=' + c.winddownQueued);
  check('case1 winddown beat held (not yet spoken)', (c.heldBeats || []).some(h => h && h.winddown), 'held=' + JSON.stringify((c.heldBeats || []).map(h => h && h.winddown)));
  r = Game.convoTurn(vid, 'nv:nod');
  c = Game.convoGet(vid);
  check('case1 3rd gesture surfaces the thinning beat', c.windingDown === true, 'windingDown=' + c.windingDown);
  check('case1 surfaced line is a winddown line', NV_WINDDOWN.includes(r && r.line), 'line=' + JSON.stringify(r && r.line));
  const menu3 = menuIds();
  check('case1 menu narrows to leave/silence once thinning (no gestures)', menu3.length >= 1 && menu3.every(id => id === 'leave' || id === 'silence') && !menu3.some(id => id.indexOf('nv:') === 0), menu3.join(','));
  Game.endConvo(vid, 'left');
  check('case1 sitting ended', !Game.convoGet(vid).active, 'active=' + Game.convoGet(vid).active);

  // 2. Alternating gestures never arm the thin-out (guard).
  c = startNv();
  Game.convoTurn(vid, 'nv:nod');
  Game.convoTurn(vid, 'nv:smile');
  c = Game.convoGet(vid);
  check('case2 nod+smile: no thin-out', c.nvRepeatThin !== true && !c.winddownQueued, 'nvRepeatThin=' + c.nvRepeatThin + ' queued=' + c.winddownQueued);
  check('case2 streak reset by the variation', (c.nvSameStreak || 0) <= 1, 'streak=' + c.nvSameStreak);
  Game.endConvo(vid, 'left');

  // 3. Repeated nv:listen never arms the thin-out (guard: listen progresses).
  c = startNv();
  Game.convoTurn(vid, 'nv:listen');
  Game.convoTurn(vid, 'nv:listen');
  c = Game.convoGet(vid);
  check('case3 listen+listen: no thin-out', c.nvRepeatThin !== true && !c.winddownQueued, 'nvRepeatThin=' + c.nvRepeatThin + ' queued=' + c.winddownQueued);
  Game.endConvo(vid, 'left');

  // 4. A different react gesture repeats the same way (smile x2 arms it).
  c = startNv();
  Game.convoTurn(vid, 'nv:smile');
  Game.convoTurn(vid, 'nv:smile');
  c = Game.convoGet(vid);
  check('case4 2nd identical smile arms the thin-out', c.nvRepeatThin === true && c.winddownQueued === true, 'nvRepeatThin=' + c.nvRepeatThin + ' queued=' + c.winddownQueued);
  Game.endConvo(vid, 'left');

  console.log(`\nPASS ${pass} checks`);
}

main().catch(e => { console.error('FAIL: ' + (e && e.stack || e)); process.exit(1); });
