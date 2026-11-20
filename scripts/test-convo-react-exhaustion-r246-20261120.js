#!/usr/bin/env node
// test-convo-react-exhaustion-r246-20261120.js — PROOF (journey-scale r246):
// The want-owned menu kept offering dlg:react after the thread went dry.
//
// BEFORE (wild evidence — journey-scale r246 pilot, seed 103881 day 90,
// Miguel, just_company want): the player tapped react 5 times; the
// 4-line dead-react pool cycled verbatim ("So." They look at the fire
// for a moment. — twice in one sitting) and the want advanced stage 1→2
// on nothing. Root cause: the reactDryCount >= 2 wind-down gate lives
// only in the generic topic-pool loop (convo-beats.js) — want options
// are pushed before that loop and the want-owned menu (convoWantMenu)
// never consulted the count, so dlg:react stayed offered forever.
//
// AFTER (the fix, convo-wants.js convoWantMenu): the want menu retires
// dlg:react once reactDryCount >= 2 — the same threshold the pool gate
// uses. A landed beat resets the count, so new content re-opens react;
// it retires only while dry. The conversation winds down to
// more/leave/silence instead of looping dead acknowledgments.
//
// FIXTURE NOTES (why these two sittings): a day-1 harness always draws
// curious/ask_favor — just_company surfaces only in longer play (the
// driver's d90 Miguel sitting is the just_company evidence). The filter
// is want-agnostic — it reads c.reactDryCount, not the want id — so
// Part A proves it on a real repay sitting (promise a favor, sit again:
// the repay want's menu offers dlg:react) and Part B proves the live
// invariant on a real curious sitting (answer the opening question and
// the full menu offers dlg:react). Part A is the fail-before/pass-after
// core: on unfixed code the want menu offers react at count 2; on fixed
// code it does not. Part B is supporting evidence that live play never
// offers react while dry. Seeds: 7, 42, 99 (re-run green on all three
// before calling it done).
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}

const SEED = parseInt(process.env.SEED || '7', 10);

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-react-exhaustion-r246' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);

  // --- Part A fixture: promise a favor, sit again -> repay want, whose
  // menu offers dlg:react ("I haven't forgotten."). Some seeds draw only
  // curious on first sittings, so warm each NPC up: answer their opening
  // questions (exhausting curious) until ask_favor surfaces, commit the
  // favor, and the next sitting draws repay.
  let vid = null;
  outer:
  for (const n of npcs) {
    for (let attempt = 0; attempt < 8 && !vid; attempt++) {
      Game.startConvo(n);
      const c = Game.convoGet(n);
      const w = c && c.want && c.want.id;
      if (w === 'repay' && (Game.convoWantMenu(n) || []).some(o => o && o.id === 'dlg:react')) {
        vid = n;
        break;
      }
      if (w === 'ask_favor') {
        const ch = Game.convoChoices(n) || [];
        if (ch.some(x => x && x.id === 'dlg:commit')) {
          Game.convoTurn(n, 'dlg:commit');
          Game.endConvo(n, 'left');
          continue; // next sitting should draw repay
        }
      }
      // Advance the sitting: answer a pending question if one is offered.
      const ch = Game.convoChoices(n) || [];
      const qpick = ch.map(x => x && x.id).find(id => /^ans:[a-z_]+:[a-z_]+$/.test(id || '') && !/honest_pass$/.test(id || ''));
      if (qpick) Game.convoTurn(n, qpick);
      Game.endConvo(n, 'left');
    }
    if (vid) break outer;
  }
  check('Part A fixture: repay sitting offers dlg:react in the want menu', !!vid, vid || 'none found');
  if (!vid) { console.log(`${fails} failed`); process.exit(1); }
  const c = Game.convoGet(vid);
  console.log(`  sitting: ${vid} want=${c.want && c.want.id} stage=${(c.want && c.want.stage) || 0}`);

  // --- Part A (deterministic core): the menu filter at the threshold.
  const menuIds = () => (Game.convoWantMenu(vid) || []).map(o => o.id);
  c.reactDryCount = 0;
  check('A1 react offered at count 0', menuIds().includes('dlg:react'), menuIds().join(','));
  c.reactDryCount = 1;
  check('A2 react offered at count 1', menuIds().includes('dlg:react'), menuIds().join(','));
  c.reactDryCount = 2;
  check('A3 react RETIRED at count 2', !menuIds().includes('dlg:react'), menuIds().join(','));
  c.reactDryCount = 3;
  check('A4 react stays retired at count 3', !menuIds().includes('dlg:react'), menuIds().join(','));
  c.reactDryCount = 0; // a landed beat re-opens it
  check('A5 react re-opens when the count resets', menuIds().includes('dlg:react'), menuIds().join(','));
  Game.endConvo(vid, 'left');

  // --- Part B (live): a curious sitting whose full menu offers dlg:react.
  // Answer the opening question, then tap react until the thread goes dry
  // or a beat lands; assert the menu never offers react while dry, and
  // that dryness was actually reached (so the check is not vacuous).
  let bvid = null;
  outerB:
  for (const n of npcs) {
    if (n === vid) continue;
    for (let attempt = 0; attempt < 4 && !bvid; attempt++) {
      Game.startConvo(n);
      const cc = Game.convoGet(n);
      if (cc && cc.want && cc.want.id === 'curious') {
        // Answer the opening question (first non-pass answer).
        for (let i = 0; i < 4; i++) {
          const ch = Game.convoChoices(n) || [];
          if (ch.some(x => x && x.id === 'dlg:react')) break;
          const qpick = ch.map(x => x && x.id).find(id => /^ans:[a-z_]+:[a-z_]+$/.test(id || '') && !/honest_pass$/.test(id || ''));
          if (!qpick) break;
          Game.convoTurn(n, qpick);
        }
        if ((Game.convoChoices(n) || []).some(x => x && x.id === 'dlg:react')) { bvid = n; break; }
      }
      Game.endConvo(n, 'left');
    }
    if (bvid) break outerB;
  }
  check('Part B fixture: curious sitting offers dlg:react in the full menu', !!bvid, bvid || 'none found');
  if (bvid) {
    const bc = Game.convoGet(bvid);
    let dryReached = false, violations = 0, turns = 0, deadObserved = 0;
    const themLines = [];
    for (let t = 0; t < 8; t++) {
      const choices = Game.convoChoices(bvid) || [];
      if (!choices.some(x => x && x.id === 'dlg:react')) break; // wound down
      const before = Game.convoGet(bvid).reactDryCount || 0;
      const res = Game.convoTurn(bvid, 'dlg:react');
      turns++;
      const after = Game.convoGet(bvid).reactDryCount || 0;
      if (after >= 2) {
        dryReached = true;
        deadObserved++;
        const offeredAfter = ((res && res.choices) || []).some(x => x && x.id === 'dlg:react');
        if (offeredAfter) violations++;
      }
      if (res && res.ended) break;
    }
    check('B1 live: menu never offers react at count >= 2', violations === 0, 'violations=' + violations + ' turns=' + turns);
    check('B2 live: dryness actually reached (count hit 2)', dryReached, 'deadObserved=' + deadObserved + ' turns=' + turns);
    // No verbatim THEM repeat in the sitting (the Miguel defect shape).
    for (const e of (Game.convoGet(bvid).transcript || [])) if (e.who === 'them') themLines.push(e.text);
    const seen = {};
    let dup = null;
    for (const l of themLines) { if (seen[l]) { dup = l; break; } seen[l] = true; }
    check('B3 live: no verbatim THEM repeat in the sitting', !dup, dup ? 'dup: ' + dup : themLines.length + ' them-lines');
    Game.endConvo(bvid, 'left');
  }

  console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'}: ${fails} failed (seed ${SEED})`);
  process.exit(fails ? 1 : 0);
})();
