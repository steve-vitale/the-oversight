#!/usr/bin/env node
// test-winddown-r18-20261016.js — journey-social r18: dry-line wind-down.
//
// A conversation that falls back 3+ times in a row has run dry. A real
// person winds down here ("I should get back to it") — not a 4th, 5th,
// 8th "lost my train of thought" (transcript-caught r17: 8 consecutive
// deflection turns, seed 1207/competent/day15).
//
// Desired behavior (asserted; RED pre-fix, GREEN post-fix):
//   1. Consecutive deflection speeches are tracked on the convo state
//      (c.fallbackStreak) — however produced (sayLine fallbacks AND the
//      dlg: handlers' direct pool draws). Any real beat resets it.
//   2. The 3rd consecutive deflection spends the energy budget
//      (c.budget <= c.exchanges) — the fix's contract. The PRE-EXISTING
//      convoMaybeWinddown machinery then closes the conversation
//      naturally (its pendingQ/heldAsk gates, queued goodbye, continuer
//      reveal, and spurn rules all still apply); that machinery is
//      covered by the existing convo suites.
//   3. Below the threshold (2 deflections) the budget is untouched.
//   4. startConvo resets the streak (fresh sitting, fresh count).
//
// Usage: node scripts/test-winddown-r18-20261016.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 1301, mode: 'winddown-r18-proof' });
  await setupGame(Game);

  const vv = Game.state.village || {};
  const sid = Game.villagerId;
  const vid = (vv.roster || []).find(id => id !== sid && !(Game.getPerson(id) || {}).dead);
  assert(vid, 'need a living villager');

  Game.startConvo(vid);
  let c = Game.convoGet(vid);
  assert(c && c.active, 'convo active');
  const budget0 = c.budget;
  assert(budget0 > 0, 'budget positive, got ' + budget0);

  const line = '"The creek is running high this week."';
  // Mirror the production turn tail (conversation.js ~5577): blocked base
  // beats fall back to the self-repeat pool.
  const sayOpts = () => ({ fallback: () => Game.convoSelfRepeatLine(vid) });
  const spoken = [];
  for (let i = 0; i < 5; i++) {
    const out = Game.sayLine(vid, line, sayOpts());
    c = Game.convoGet(vid);
    spoken.push({ i, out: String(out || '').slice(0, 60),
      isDefl: Game.convoIsDeflectionLine(out),
      streak: c.fallbackStreak === undefined ? null : c.fallbackStreak,
      budget: c.budget, exchanges: c.exchanges,
      winddownQueued: !!c.winddownQueued });
  }
  for (const s of spoken) console.log(JSON.stringify(s));

  // Calls 2..5 (index 1..4) must all be fallbacks — the repeat forces the
  // no-repeat block, which is the deterministic dry-line trigger.
  for (let i = 1; i < 5; i++) {
    assert(spoken[i].isDefl, `call ${i + 1} should speak a deflection line, got: ${spoken[i].out}`);
  }

  // 1. Streak tracked: after the 3rd consecutive fallback, streak === 3.
  assert.strictEqual(spoken[3].streak, 3,
    `fallbackStreak should be 3 after 3 consecutive fallbacks, got ${spoken[3].streak}`);

  // 2. The 3rd consecutive fallback spends the energy budget — the fix's
  //    contract. The PRE-EXISTING convoMaybeWinddown machinery (gated on
  //    pendingQ/heldAsk, with its queued-goodbye + spurn rules) then closes
  //    the conversation naturally; that machinery is covered by the existing
  //    convo suites, so this test pins the new input, not the old machine.
  assert(spoken[3].budget <= spoken[3].exchanges,
    `budget should be spent after 3 consecutive fallbacks (budget ${spoken[3].budget} > exchanges ${spoken[3].exchanges})`);
  assert(spoken[2].budget === budget0,
    `budget must be untouched below the 3-streak threshold (got ${spoken[2].budget}, started ${budget0})`);

  // 3. A real beat resets the streak. (Fresh convo: speak real, fallback,
  //    fallback, real, fallback -> streak back to 1, budget untouched.)
  Game.endConvo(vid, 'left');
  Game.startConvo(vid);
  c = Game.convoGet(vid);
  assert.strictEqual(c.fallbackStreak || 0, 0, 'streak resets in startConvo');
  const b1 = c.budget;
  Game.sayLine(vid, '"Fresh line one."', sayOpts());
  const line2 = '"The ridge trail is washed out."';  // never spoken before
  Game.sayLine(vid, line2, sayOpts());          // real (first time ever)
  Game.sayLine(vid, line2, sayOpts());          // fallback 1
  Game.sayLine(vid, line2, sayOpts());          // fallback 2
  c = Game.convoGet(vid);
  assert.strictEqual(c.fallbackStreak, 2, 'streak 2 after real+2 fallbacks, got ' + c.fallbackStreak);
  assert.strictEqual(c.budget, b1, 'budget untouched below the 3-streak threshold');
  Game.sayLine(vid, '"A genuinely new thought."', sayOpts());  // real beat resets
  c = Game.convoGet(vid);
  assert.strictEqual(c.fallbackStreak, 0, 'real beat resets the streak, got ' + c.fallbackStreak);
  Game.endConvo(vid, 'left');

  console.log('GREEN: dry-line wind-down behaves (streak tracked, budget spent at 3, reset by real beats)');
}

main().catch(e => { console.error('RED:', e.message); process.exit(1); });
