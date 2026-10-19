// Villager personality test. Usage: node scripts/test-villager-personality.js
// Tests: distinct personalities, personal topic wired up, trust effects.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
// Loader: scripts/godpath/lib.js — index.html script order, seeded
// Math.random, frozen Date.now (flake fix 2026-10-14; the old
// hand-rolled eval list was unseeded and missed modules).
const K = require('./godpath/lib');
let Game;

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}`); }
}

(async () => {
  Game = await K.load({ seed: Number(process.env.SEED || 20261005), narration: true });
  Game.debugScenario('mootAccused');
  const v = Game.state.village;
  const roster = v.roster || [];

  // 1. vpOf finds rosterChars (generated villagers)
  const vid = roster[0];
  const vp = Game.vpOf(vid);
  ok('vpOf finds generated villager', !!vp.id);
  ok('vpOf has personality', !!(vp.personality && vp.personality.temperament));
  ok('vpOf has talk lines', Array.isArray(vp.talk) && vp.talk.length > 0);

  // 2. Personal topic uses talk lines
  const personalLines = new Set();
  for (const testVid of roster.slice(0, 5)) {
    const testVp = Game.vpOf(testVid);
    if (testVp.talk && testVp.talk.length) {
      // Simulate convoAskTopic('personal')
      const c = Game.convoGet(testVid);
      c.askedTopics = [];
      try {
        const line = Game.convoAskTopic(testVid, 'personal');
        if (line && typeof line === 'string') {
          // Should be filled (no {an_occ} placeholders)
          ok(`personal topic for ${testVid}: no placeholders`, line.indexOf('{an_occ}') === -1 && line.indexOf('{occ}') === -1);
          personalLines.add(line.slice(0, 50));
        }
      } catch (e) { ok(`personal topic for ${testVid}: no crash`, false); }
    }
  }
  ok('personal lines distinct across villagers', personalLines.size >= 3);

  // 3. Personal topic appears in choices
  try {
    const testVid2 = roster[1];
    Game.startConvo(testVid2);
    // Pin the opening (flake fix 2026-10-14): startConvo may open with the
    // villager's own direct question or a want-thread, and a hanging question
    // owns the menu by contract (answers only — conversation.js convoChoices
    // "CONTRACT (Phase 2)"). Whether it does is an RNG roll; this check is
    // about the topic menu, so clear the opener and look at the topics.
    const c2 = Game.convoGet(testVid2);
    c2.genericQ = null; c2.reactiveQ = null; c2.pendingQ = null; c2.thread = null;
    let choices = Game.convoChoices(testVid2), hasPersonal = choices.some(ch => ch.id === 'ask:personal');
    const seenPages=new Set();
    while(!hasPersonal && choices.some(ch=>ch.id==='menu:more')) {
      const key=choices.map(ch=>ch.id).join(',');if(seenPages.has(key))break;seenPages.add(key);
      Game.convoTurn(testVid2,'menu:more');choices=Game.convoChoices(testVid2);
      hasPersonal=choices.some(ch=>ch.id==='ask:personal');
    }
    ok('personal topic reachable through offered conversation choices', hasPersonal);
    if(hasPersonal) {
      const response=Game.convoTurn(testVid2,'ask:personal');
      ok('offered personal topic responds after page navigation', !!response && !response.ended && typeof response.line==='string' && response.line.length>0);
      ok('personal topic selection enters its actual thread', Game.convoGet(testVid2).thread==='personal');
    }
    if (v.convos && v.convos[testVid2]) v.convos[testVid2].active = false;
  } catch (e) { ok('personal topic in choices: no crash', false); }

  // 4. Distinctness: 5 villagers have unique quirks/habits
  const chars = roster.slice(0, 5).map(id => Game.vpOf(id));
  const quirks = chars.map(c => (c.personality || {}).quirk).filter(Boolean);
  const habits = chars.map(c => (c.personality || {}).habit).filter(Boolean);
  ok('quirks distinct', new Set(quirks).size === quirks.length && quirks.length >= 4);
  ok('habits distinct', new Set(habits).size === habits.length && habits.length >= 4);

  console.log(`\n=== RESULTS: ${pass} pass, ${fail} fail ===`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.log('FATAL', e.message); process.exit(1); });
