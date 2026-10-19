// test-crisis-menu-cap-20261018.js — CRISIS LEG r22: THE MENU THAT WOULDN'T END.
//
// r21 found-not-fixed #1: the beat-matrix menu path produced 8 choices —
// pre(2).concat(beatMenu) has no cap; MAXC only gates the alive/pivot
// sections of the fallback assembly path. In a crisis (lately event active,
// crowded villager, stacked beat conditions: news beat + doubts + held
// beats + teach + invite) the beat path — the COMMON menu after an opener —
// grows unboundedly. Pilot staging (seed 7, pre-fix): 11 choices.
//
// The fix (this run): cap the beat-matrix concat at the assembly path's
// MAXC budget (7 content choices), keeping the alive/event lead (r21) and
// pinning the structural 'leave' exit. 'silence' rides after via
// finalizeMenu rule 4, as on every path.
//
// RED: on pre-fix code, the stacked crisis staging yields >8 menu items.
// GREEN: buildMenu returns <=8 total (<=7 content + silence), the event
//   choice leads (exactly one), no duplicate ids, 'leave' present.
// Run: SEED=7 node scripts/test-crisis-menu-cap-20261018.js (seeds 7/42/99)
'use strict';
const assert = require('assert');
const path=require('path');
const { loadGame, setupGame } = require(path.join(process.env.PROOF_ROOT || path.resolve(__dirname,'..'),'scripts/sim-harness'));

const SEED = parseInt(process.env.SEED || '7', 10);
const MAXC = 7; // the pipeline's content-choice budget (conversation.js buildMenu)
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-crisis-menu-cap' });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 1;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ non-scholar villagers');
  const V = roster[0], DEAD = roster[1];

  // ---- STAGE: crisis — fresh corpse -> 'mourning' lately event ----
  Game.state.corpses = Game.state.corpses || [];
  Game.state.corpses.push({ kind: 'villager', villagerId: DEAD, dayDied: day, cause: 'monster' });
  v.grief = (v.grief || 0) + 2;
  let ev = null;
  try { ev = Game.t2LatelyEvent(V); } catch (e) { ev = null; }
  ok('lately event fires (mourning) on a fresh corpse', ev && ev.kind === 'mourning', ev && ev.kind);

  // ---- STAGE: crowded villager — 2 open threads + 2 fresh memories ----
  try {
    Game.convoThreadOpen(V, 'goal', 'About what they want', 'unfinished business',
      '"I have been thinking about what I want from all this."');
    Game.convoThreadOpen(V, 'past', 'About their old life', 'unfinished business',
      '"Back home I used to keep bees, can you believe it."');
  } catch (e) {}
  v.memory = v.memory || {};
  v.memory[V] = v.memory[V] || [];
  v.memory[V].push({ t: 'gift', day });
  v.memory[V].push({ t: 'feast', day });

  // ---- STAGE: stack the beat path — news beat (theorize), a doubt,
  // held beats (goon), threadLog (recap) ----
  try {
    const c = Game.convoGet(V);
    c.lastBeat = { tag: 'news', topic: 'small', line: '"The System said something strange about the monsters. I don\'t understand it."' };
    (c.heldBeats = c.heldBeats || []).push({ text: '"And there\'s more — listen."' });
    (c.threadLog = c.threadLog || []).push({ t: 'x' }, { t: 'y' });
  } catch (e) {}
  try { Game.addDoubt(V, 'contradiction', '"They said the gate was barred at dusk. It wasn\'t."', null, {}); } catch (e) {}

  let bm = null;
  try { bm = Game.beatMenuResponses(V); } catch (e) {}
  ok('beat path taken (beatMenuResponses non-null)', Array.isArray(bm) && bm.length > 0, bm && bm.length);

  let menu = [];
  try { menu = Game.buildMenu(V) || []; } catch (e) { menu = []; }
  const ids = menu.map(c => c && c.id);
  console.log(`  menu: ${menu.length} items [${ids.join(', ')}]`);

  // THE CAP: <= MAXC content choices + the finalizeMenu 'silence'.
  const content = menu.filter(c => c && c.id !== 'silence');
  ok(`menu fits the one-screen budget (<=${MAXC + 1} total, <=${MAXC} content)`,
    menu.length <= MAXC + 1 && content.length <= MAXC,
    `total=${menu.length}, content=${content.length}`);

  // WRAPPER INJECTION (seed 3202 discovery): betrayal.js and
  // villager-agency.js wrap Game.convoChoices and PREPEND urgent items
  // after buildMenu/finalizeMenu ran — a live betrayal case pushed a
  // capped 8-choice beat menu to 10. The outermost wrapper
  // (villager-agency) now enforces the same budget. Prove it with a
  // stubbed live betrayal case (white-box: exercises the real wrapper
  // chain, not the betrayal staging machinery).
  const realBetrayalChoices = Game.betrayalChoices;
  try {
    Game.betrayalChoices = () => [
      { id: 'betrayal:accept', label: '"Sure."' },
      { id: 'betrayal:decline', label: '"No."' },
    ];
    let wrapped = [];
    try { wrapped = Game.convoChoices(V) || []; } catch (e) { wrapped = []; }
    const wids = wrapped.map(c => c && c.id);
    const wcontent = wrapped.filter(c => c && c.id !== 'silence');
    console.log(`  wrapped menu: ${wrapped.length} items [${wids.join(', ')}]`);
    ok('wrapper chain respects the budget (<=8 total, <=7 content)',
      wrapped.length <= MAXC + 1 && wcontent.length <= MAXC,
      `total=${wrapped.length}, content=${wcontent.length}`);
    ok('injected confrontation still leads', wids[0] === 'betrayal:accept' && wids[1] === 'betrayal:decline',
      `wids[0..1]=${wids.slice(0, 2).join(',')}`);
    ok("'leave' pinned on the wrapped menu", wids.indexOf('leave') >= 0);
    ok('subject navigation survives injected crisis choices', wids.includes('dlg:subject'));
    ok('no duplicate ids on the wrapped menu', new Set(wids).size === wids.length);
    // The event choice (r21's lead) must survive the wrapper trim.
    ok('event choice survives the wrapper trim', wids.some(id => id === 'alive:event:mourning'),
      'alive:event:mourning missing');
  } finally {
    Game.betrayalChoices = realBetrayalChoices;
  }

  // r21's lead order survives the cap.
  const eventChoices = menu.filter(c => c && c.kind === 'event');
  ok('event choice present exactly once', eventChoices.length === 1, `eventChoices=${eventChoices.length}`);
  if (eventChoices.length === 1) {
    ok('event choice leads the menu', menu[0] === eventChoices[0],
      `menu[0]=${menu[0] && menu[0].id}`);
  }

  // Structural exit: the player is never stranded in the dialogue box.
  ok("'leave' pinned on the menu", ids.indexOf('leave') >= 0);
  ok('subject navigation survives the beat menu cap', ids.includes('dlg:subject'));
  ok("'silence' present (finalizeMenu rule 4)", ids.indexOf('silence') >= 0);
  ok('no duplicate choice ids', new Set(ids).size === ids.length);

  console.log(`\n${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
