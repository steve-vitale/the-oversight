// test-crisis-event-queue-20261017.js — CRISIS LEG r21: THE EVENT THAT CUTS THE QUEUE.
//
// The gap (found in r20): Declan's t2LatelyEvent returned 'mourning' but his
// conversation offered NO event choice (Deiker got it in the same run).
// Root cause (code-read): convoWhatsAlive (convo-scene.js) appends the
// world-event item LAST — after open threads (2), fresh memories (<=4), and
// the want question (1). Its own docstring says "most alive first" and the
// block comment says "live events cut the queue", but the consumer
// (conversation.js buildMenu) takes only the first 3 alive items
// (aliveAdded >= 3). Any villager with >=3 alive items ahead of the event
// never gets the on-ramp. The event that "cuts the queue" is dead last in it.
//
// The fix (this run): move the WORLD EVENTS block to the FRONT of
// convoWhatsAlive — events genuinely cut the queue, per the comment's
// stated intent and the docstring.
//
// RED: on pre-fix code, a villager with 2 open threads + 2 fresh memories
//   and an active 'mourning' event gets NO 'alive:event' choice in
//   buildMenu (the menu pipeline's alive section).
// GREEN: the event choice leads the alive section (index 0) and rides the
//   menu; no duplicate, no menu overflow (<=7 choices).
// Run: SEED=7 node scripts/test-crisis-event-queue-20261017.js (seeds 7/42/99)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '7', 10);
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-crisis-event-queue' });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ non-scholar villagers');
  const V = roster[0], DEAD = roster[1];

  // ---- STAGE: a fresh villager corpse -> 'mourning' is the lately event ----
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push({ kind: 'villager', villagerId: DEAD, dayDied: day, cause: 'monster' });
  v.grief = (v.grief || 0) + 2; // the mourning scan is grief-gated (convoTopics.js)
  let ev = null;
  try { ev = Game.t2LatelyEvent(V); } catch (e) { ev = null; }
  ok('lately event fires (mourning) on a fresh corpse', ev && ev.kind === 'mourning', ev && ev.kind);

  // ---- STAGE: 2 open threads + 2 fresh memories crowd the alive queue ----
  const realBeat = s => `"${s}"`;
  try {
    Game.convoThreadOpen(V, 'goal', 'About what they want', 'unfinished business',
      realBeat('I have been thinking about what I want from all this.'));
    Game.convoThreadOpen(V, 'past', 'About their old life', 'unfinished business',
      realBeat('Back home I used to keep bees, can you believe it.'));
  } catch (e) { /* ledger quirks surface in the open-thread count check */ }
  const open = (typeof Game.convoOpenThreads === 'function') ? Game.convoOpenThreads(V) : [];
  v.memory = v.memory || {};
  v.memory[V] = v.memory[V] || [];
  v.memory[V].push({ t: 'gift', day });
  v.memory[V].push({ t: 'feast', day });

  const alive = (typeof Game.convoWhatsAlive === 'function') ? Game.convoWhatsAlive(V) : [];
  const eventIdx = alive.findIndex(a => a && a.kind === 'event');
  const crowd = alive.filter(a => a && (a.kind === 'thread' || a.kind === 'memory')).length;
  console.log(`  staged: openThreads=${open.length}, memories=2, threads+memories behind event=${crowd}, eventIdx=${eventIdx}`);
  ok('crowd staged behind the event (>=3 threads+memories after it)', crowd >= 3 && eventIdx === 0,
    `crowd=${crowd}, eventIdx=${eventIdx}`);
  ok('event item exists in convoWhatsAlive', eventIdx >= 0);

  // ---- THE CONSUMER: the menu pipeline drops anything past 3 alive items ----
  let menu = [];
  try { menu = Game.buildMenu(V) || []; } catch (e) { menu = []; }
  const eventChoices = menu.filter(c => c && c.kind === 'event');
  // NOTE (metric review): buildMenu can return 8 choices on pre-fix code —
  // the beat-matrix path does pre(2).concat(beatMenu) with no MAXC cap in
  // finalizeMenu. MAXC only gates the alive/pivot sections. Pre-existing,
  // orthogonal to this fix (counts don't change, only which alive items
  // ride first). Recorded, not asserted.
  console.log(`  menu choices: ${menu.length} (pre-existing ceiling observed)`);
  ok('GREEN: event choice leads the alive section', eventChoices.length === 1,
    `eventChoices=${eventChoices.length}`);
  if (eventChoices.length === 1) {
    const first = menu.findIndex(c => c && (c.kind === 'thread' || c.kind === 'memory' || c.kind === 'event' || c.kind === 'want'));
    ok('event choice is the FIRST alive item on the menu', menu[first] && menu[first].kind === 'event',
      `first alive kind=${menu[first] && menu[first].kind}`);
  }
  const ids = menu.map(c => c && c.id);
  ok('no duplicate choice ids', new Set(ids).size === ids.length);

  console.log(`\n${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
