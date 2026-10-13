#!/usr/bin/env node
// Proof test: gossip-ask beat composition (journey landing r9, 2026-10-13).
//
// BLANK FOUND (r9 pilot, seed 414 day 1): asking "heard anything?" while the
// NPC shares identity-doubt gossip produced a mangled spoken line:
//
//   THEM: "Huh. Let me think about that." ❓ Piper just told you something
//   about the woman in her 40s, the hvac tech — says they're not really an
//   ER nurse. Worth remembering. Piper lowers their voice. "the woman in
//   her 40s, the hvac tech?" Piper lowers their voice.
//
// Root cause: convoAskTopic's 'gossip' branch (conversation.js) swaps
// this.say to capture askAbout's beats, then re-emits only /^\s*📓/ lines as
// asides and joins the rest into the NPC's spoken line. But
// checkGossipClaim (truth.js) emits its doubt beats as `❓ ...` directly via
// this.say — the ❓ glyph is not matched by the 📓-only asides filter, so the
// player-facing doubt beat gets voiced AS the NPC's dialogue, and the
// attribution strip then leaves duplicated fragments.
//
// FIX: treat ❓ like 📓 in the asides filter — doubt beats are re-emitted
// outside the spoken line, exactly as the filter's comment promises.
//
// Test 1 is RED on pristine HEAD (❓ leaks into the spoken line) and GREEN
// after the fix. Test 2 covers the sibling tellbeast render: the unknown
// descriptor opens lowercase inside the quote ("Lena goes still. \"a gold
// flash...\"") while identifyMonster capitalizes it on render (hunter
// playtest 2026-10-07: sentence openers must be capitalized) — the tellbeast
// branch must match.

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 414 });
  Game.genDetail = function () { return {}; };
  await setupGame(Game);

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  const target = roster[1];

  // ---- Test 1: ❓ doubt beat must not be voiced as NPC dialogue ----
  // Force the npcGossipAbout path deterministically: stub it to run the REAL
  // checkGossipClaim (which says the ❓ beat) and return a lie-contradiction.
  const realNpcGossipAbout = Game.npcGossipAbout;
  Game.npcGossipAbout = function (tellerVid, targetVid) {
    this.checkGossipClaim(targetVid, 'occupation', 'ER nurse', tellerVid);
    return { line: '"The broad one? An ER nurse, back before. Solid person."', target: targetVid, field: 'occupation', truth: 'ER nurse', contradictsLie: true };
  };
  const realRandom = Math.random;
  Math.random = () => 0; // force the Math.random() < 0.5 npcGossipAbout gate open
  const emitted = [];
  const realSay = Game.say;
  Game.say = function (x) { emitted.push(String(x)); };
  let spoken = null;
  try {
    Game.startConvo(vid);
    spoken = Game.convoAskTopic(vid, 'gossip');
  } catch (e) { console.log('convoAskTopic ERROR: ' + (e && e.message)); }
  Math.random = realRandom;
  Game.say = realSay;
  Game.npcGossipAbout = realNpcGossipAbout;
  try { Game.endConvo(vid, 'done'); } catch (e) {}

  const spokenStr = String(spoken || '');
  const doubtBeats = emitted.filter(s => /^\s*❓/.test(s));
  ok('gossip ask returns a spoken line', !!spokenStr, 'no line returned');
  ok('❓ doubt beat is NOT inside the NPC spoken line', !/❓/.test(spokenStr),
    'spoken line contains ❓: ' + spokenStr.slice(0, 200));
  ok('❓ doubt beat is still emitted (as its own line, not swallowed)', doubtBeats.length > 0,
    'no ❓ line was emitted at all');

  // ---- Test 2: tellbeast capitalizes the unknown descriptor ----
  Game.identifyMonster('hushwolf'); // seeds a reported, un-kicked entry
  const told = [];
  Game.say = function (x) { told.push(String(x)); };
  try { Game.askAbout(vid, 'tellbeast', { inConvo: true }); } catch (e) { console.log('tellbeast ERROR: ' + (e && e.message)); }
  Game.say = realSay;
  const tellLine = told.find(s => /goes still/.test(s)) || '';
  const m = tellLine.match(/"([^"]*)/);
  const quoted = m ? m[1] : '';
  ok('tellbeast says a line', !!tellLine, 'no tellbeast line captured');
  ok('tellbeast descriptor opens capitalized (matches identifyMonster)',
    quoted.length > 0 && /[A-Za-z]/.test(quoted[0]) && quoted[0] === quoted[0].toUpperCase(),
    'quoted opener: ' + JSON.stringify(quoted.slice(0, 40)));

  console.log(`\n${pass} pass / ${fail} fail`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
