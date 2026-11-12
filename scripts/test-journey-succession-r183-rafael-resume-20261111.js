#!/usr/bin/env node
'use strict';
// Proof: Rafael resume-opener defect fix (journey-succession r183).
// RED (crisis r181, seed 14411 d57, Rafael Mendez): the inherited resume
// opener garbled a thread three ways at once:
//   (1) it attributed Rafael's own confession ("Before the scattering, I
//       froze when it mattered") to Theo ("what *they* confided");
//   (2) it falsely claimed "You weren't there for that one" when the
//       player was there in d43 (as Theo);
//   (3) it then declared the thread "settled" after two recap loops in
//       which nothing new was said.
// GREEN (post-fix):
//   (1) an inherited 'secret' resume names the confider first-person
//       ("what I confided in {pred}") and never renders "what they
//       confided" with the predecessor named;
//   (2) the stale inherited branch never renders "You weren't there for
//       that one";
//   (3) a recap-only sitting earns no "settled" close line, while a
//       sitting with a real new beat on the thread still earns it; the
//       resume opener itself never counts as the new content.
// Uses the shared harness (scripts/godpath/lib), one world, real
// playerDeath for the inherited arm. Exits nonzero on failure.
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
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const oldFirst = Game.displayName(oldId).split(' ')[0];
  const roster = (v.roster || []).filter(id => id !== oldId);
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  console.log(`bearer=${oldFirst} speaker=${Game.displayName(speaker)} day=${Game.state.scholar.day}`);

  // ---- Arm A: inherited 'secret' resume, stale (ago 8) ----
  // Plant the confession as an open 'secret' thread on day 1, then a real
  // mantle pass, then resume on day 9.
  Game.state.scholar.day = 1;
  const confession = 'Before the scattering, I froze when it mattered.';
  Game.convoThreadOpen(speaker, 'secret', 'what they confided', 'unfinished business', confession);
  check('secret thread plants with a real confession snippet',
    Game.convoOpenThreads(speaker).some(o => o.tid === 'secret'));
  const thread = Game.convoOpenThreads(speaker).find(o => o.tid === 'secret');
  Game.playerDeath('the hunt');
  check('real succession changes the bearer', Game.villagerId !== oldId);
  check('thread stamped with the actual predecessor',
    Game.inheritedName(thread) === oldFirst, 'got ' + Game.inheritedName(thread));
  Game.state.scholar.day = 9;
  const rnd = Math.random;
  Math.random = () => 0; // pass the 0.65 resume gate, pick the sole thread
  let opener = null;
  try { opener = Game.convoResumeOpener(speaker); } finally { Math.random = rnd; }
  const line = (opener && opener.line) || '';
  console.log('RESUMED: ' + line.slice(0, 260));
  check('resume fires for the stale inherited secret thread', !!opener);
  check('names the dead predecessor', line.includes(oldFirst), line.slice(0, 160));
  check('names the speaker as the confider (first-person)',
    new RegExp(`what I confided in ${oldFirst}`).test(line), line.slice(0, 200));
  check('never renders "what they confided" with the predecessor named',
    !/what they confided/i.test(line), line.slice(0, 200));
  check('never claims the player absent ("You weren\'t there")',
    !/weren't there for that one/i.test(line), line.slice(0, 200));
  check('still invites instead of assuming', /want to hear where it left off/i.test(line), line.slice(0, 160));
  check('memory quote still attached', /froze when it mattered/i.test(line), line.slice(0, 260));

  // ---- Arm B: recap scaffolding is not a real beat ----
  const recaps = [
    'Still on what they confided.',
    'As I said — we\'re still on what they confided.',
    'Like I said — we\'re still on what they confided.',
    'what they confided — that\'s still where we are.',
    'We\'re going in circles — still on what they confided. Ask me something else if you want.',
    'We started on what they confided, then got onto their past.',
    'We were talking about what they confided.',
  ];
  for (const r of recaps) {
    check('recap is grammar, not a real beat: ' + r.slice(0, 44),
      Game.convoSnippetIsRealBeat(r) === false, 'got true for: ' + r);
  }
  check('a real confession still counts as a real beat',
    Game.convoSnippetIsRealBeat(confession) === true);

  // ---- Arm C: recap-only sitting earns no "settled" ----
  // Each arm gets its own villager so ledger state never leaks across.
  function closeLineArm(vid, threadLogSnippets) {
    Game.convoThreadOpen(vid, 'secret', 'what they confided', 'walked away mid-thread', confession);
    const c = Game.convoGet(vid);
    c.count = (c.count || 0) + 1;
    Game.convoNoteTopic(vid, 'secret', 'what they confided');
    c.threadLog = threadLogSnippets.map(snippet => ({ thread: 'secret', snippet, ex: c.exchanges || 0 }));
    return Game.convoCloseLine(vid);
  }
  const armC = roster.find(id => id !== speaker && id !== oldId);
  const armD = roster.find(id => id !== speaker && id !== oldId && id !== armC);
  const armE = roster.find(id => id !== speaker && id !== oldId && id !== armC && id !== armD);
  const recapOnly = closeLineArm(armC, [
    'Still on what they confided.',
    'As I said — we\'re still on what they confided.',
  ]);
  check('recap-only sitting earns no "settled" close line', recapOnly === null, String(recapOnly));
  const withRealBeat = closeLineArm(armD, [
    'Still on what they confided.',
    confession,
  ]);
  check('sitting with a real new beat still earns "settled"',
    typeof withRealBeat === 'string' && /settled/.test(withRealBeat), String(withRealBeat));
  // The resume opener itself must not count as the new content: its line
  // carries the scaffolding phrase, so it fails the real-beat test.
  const openerOnly = closeLineArm(armE, [
    `${oldFirst} and I never did finish talking about what I confided in ${oldFirst} — that was 8 days back. Want to hear where it left off? '${confession}'`,
  ]);
  check('resume opener alone earns no "settled"', openerOnly === null, String(openerOnly));

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
