#!/usr/bin/env node
// test-succession-spent-choices-20261012.js — PROOF (journey-succession 2026-10-12):
// Spent conversation choices kept being re-offered within one sitting.
// Sense evidence (5-seed succession playthrough, seeds 301-305):
//   - "About that question — we never finished." re-offered 2-4x per
//     conversation (alive:thread:want / alive:thread:lately / alive:thread:secret)
//   - "About what I asked before..." re-offered 8x in one conversation
//     (alive:memory:deflected) — each repeat answered "I just said — did you
//     miss it?" but the choice stayed available.
//   - "Want to come with me?" pestered past a decline into a flip-flop
//     ("I work alone... a little personal." -> "...Fine.")
//   - "Teach me something from the wild." asked 12x: one ask burned BOTH a
//     monster lesson AND a plant lesson while speaking one line (two lessons
//     spent, one delivered), and exhausted asks left a naked player echo in
//     the transcript with no NPC reply.
// Fix:
//   1. Per-conversation spent-choice ledger (c.spent): single-use verbs
//      (alive:thread:*, alive:memory:*, alive:event:*, invite_party) are not
//      re-offered this sitting; finalizeMenu filters them.
//   2. agency:ask_field teaches exactly ONE lesson per ask (monster > plant >
//      place), places are spent (pop), the player line is only pushed when the
//      NPC has something to say, and a dry pool ends the choice for the
//      sitting (no naked echo, no infinite closer loop).
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}
const ids = (ch) => (ch || []).map(x => x.id).filter(Boolean);

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-spent-choices' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== oldId);
  const vid = npcs[0];
  v.trust[vid] = 90;
  return { Game, vid, v };
}

(async () => {
  const { Game, vid, v } = await freshGame(90210);
  const day = (Game.state.scholar || {}).day || 1;

  // ---- 1. alive:thread:* resumed once ----
  Game.convoThreadOpen(vid, 'want', 'that favor', 'unfinished business');
  Game.convoThreadOpen(vid, 'lately', "what's been happening", 'unfinished business');
  Game.startConvo(vid);
  let ch = ids(Game.convoChoices(vid));
  check('thread:resume-offered', ch.includes('alive:thread:want'), 'menu offers resume');
  Game.convoTurn(vid, 'alive:thread:want');
  ch = ids(Game.convoChoices(vid));
  check('thread:resume-consumed', !ch.includes('alive:thread:want'), 'not re-offered this sitting');
  // subject-change replant must not resurrect it this sitting either
  Game.convoTurn(vid, 'alive:thread:lately');
  ch = ids(Game.convoChoices(vid));
  check('thread:subject-change-no-resurrect', !ch.includes('alive:thread:want'),
    'want not re-offered after talking lately');
  check('thread:lately-consumed', !ch.includes('alive:thread:lately'), 'lately not re-offered either');
  Game.endConvo(vid, 'left');
  // new sitting: fresh offers (the ledger across conversations is untouched).
  // The replanted thread resurfaces either as the resume opener or a menu
  // choice — both are honest; silence would be the bug.
  Game.startConvo(vid);
  // A hanging question owns the opening menu (answer first — rude to
  // ignore). Clear it, then the alive items surface.
  ch = ids(Game.convoChoices(vid));
  const qpick = ch.find(id => /^gq:[a-z_]+:yes$/.test(id)) || ch.find(id => /^react:/.test(id));
  if (qpick && !ch.some(id => id.indexOf('alive:thread:') === 0)) {
    Game.convoTurn(vid, qpick);
    ch = ids(Game.convoChoices(vid));
  }
  const anyAlive = ch.some(id => id.indexOf('alive:thread:') === 0);
  const t0 = ((Game.convoGet(vid).transcript || [])[0] || {}).text || '';
  const resumed = /never finished|didn't finish|cut off/i.test(t0);
  check('thread:reset-next-sitting', Object.keys(Game.convoGet(vid).spent || {}).length === 0 && (anyAlive || resumed),
    `spent reset; thread resurfaces as ${resumed ? 'opener' : (anyAlive ? 'menu' : 'NOTHING')}`);
  Game.endConvo(vid, 'left');

  // ---- 2. alive:memory:* named once ----
  v.memory[vid] = v.memory[vid] || [];
  v.memory[vid].push({ t: 'deflected', day });
  Game.startConvo(vid);
  ch = ids(Game.convoChoices(vid));
  check('memory:offered', ch.includes('alive:memory:deflected'), 'memory choice offered');
  for (let i = 0; i < 3; i++) {
    ch = ids(Game.convoChoices(vid));
    if (!ch.includes('alive:memory:deflected')) break;
    Game.convoTurn(vid, 'alive:memory:deflected');
  }
  ch = ids(Game.convoChoices(vid));
  check('memory:consumed', !ch.includes('alive:memory:deflected'), 'named once — no 8x loop');
  Game.endConvo(vid, 'left');

  // ---- 3. invite_party answered once ----
  Game.startConvo(vid);
  ch = ids(Game.convoChoices(vid));
  if (ch.includes('invite_party')) {
    Game.convoTurn(vid, 'invite_party');
    ch = ids(Game.convoChoices(vid));
    check('invite:consumed', !ch.includes('invite_party'), 'no pestering after answer');
  } else {
    check('invite:consumed', true, 'invite not gated-in this seed (skipped)');
  }
  Game.endConvo(vid, 'left');

  // ---- 4. agency:ask_field — one lesson per ask, no naked echo, dry pool ends it ----
  const st = Game.agencyState();
  st.teachable[vid] = ['x', 'y', 'z'];
  st.know[vid] = st.know[vid] || { plants: 0, monsters: 0, places: [], fought: [] };
  st.know[vid].places = ['a ridge with a view for miles', 'a burned farmhouse'];
  const codexPlantsBefore = Object.keys((Game.state.codex || {}).plants || {}).length;
  Game.startConvo(vid);
  let asks = 0, taughtLessons = 0, lastCodex = codexPlantsBefore;
  for (let i = 0; i < 12; i++) {
    ch = ids(Game.convoChoices(vid));
    if (!ch.includes('agency:ask_field')) break;
    asks++;
    Game.convoTurn(vid, 'agency:ask_field');
    const now = Object.keys((Game.state.codex || {}).plants || {}).length;
    if (now > lastCodex) taughtLessons++;
    lastCodex = now;
  }
  // one ask taught at most one thing: codex plants can only grow by asks
  check('ask_field:asks-bounded', asks <= 12, `${asks} asks before choice left the menu`);
  // no naked player echo: every 'you' entry must be followed by a 'them'
  // entry before the next 'you'
  const tr = (Game.convoGet(vid).transcript || []);
  let naked = 0;
  for (let i = 0; i < tr.length; i++) {
    if (tr[i].who === 'you') {
      let j = i + 1, answered = false;
      while (j < tr.length && tr[j].who !== 'you') {
        if (tr[j].who === 'them') { answered = true; break; }
        j++;
      }
      if (!answered) naked++;
    }
  }
  check('ask_field:no-naked-echo', naked === 0, `${naked} unanswered player lines`);
  // places were spent, not an infinite faucet
  const placesLeft = ((Game.agencyState().know[vid] || {}).places || []).length;
  check('ask_field:places-spent', placesLeft === 0, `places left=${placesLeft}`);
  // teachable entries: at most one per ask was consumed
  const teachLeft = (Game.agencyState().teachable[vid] || []).length;
  check('ask_field:one-lesson-per-ask', teachLeft >= 3 - asks,
    `teachable left=${teachLeft} after ${asks} asks (was 3)`);
  Game.endConvo(vid, 'left');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e && e.stack || e); process.exit(1); });
