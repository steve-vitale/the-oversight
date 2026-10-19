// test-resume-hook-quote-20261018.js — proof for the journey-deepening r13
// resume-hook blank.
//
// FINDING (sense-testing, seed 8307 Ursula transcript): a 'show' thread
// planted with the NPC's invitation "Come see what I found. You won't
// believe it." resumed as:
//   "We never finished talking about that personal stuff — we wandered off
//    it. 'Come see what I found. You won't believe it.' ..."
// The UNFULFILLED INVITATION was quoted as if it were the memory of the
// thread's content. A hook names no proposition; quoting it fabricates
// shared content (Steve's conversation bar).
//
// FIX: convoSnippetIsHook — teaser/invitation phrasings are real beats (the
// unfinished business exists; the plant gate keeps them) but not quotable
// as content-memory. The resume opener still names the thread (label +
// whyLine); only the nested quote drops.
//
// This test: (a) unit — the transcript's hook snippet is a hook;
// substantive beats and the grief pool are not; (b) integration — a thread
// planted with a hook snippet resumes WITHOUT the quoted invitation but
// WITH the thread label.
// RED on pre-fix code: the opener contains the quoted hook.
// Usage: node scripts/test-resume-hook-quote-20261018.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const HOOK = '"Come see what I found. You won\'t believe it."';

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-resume-hook', fullTelemetry: false });
  await setupGame(Game);
  let pass = 0;
  const ok = (cond, msg) => { assert(cond, 'FAIL: ' + msg); pass++; console.log('  ok: ' + msg); };

  // ---- (a) unit: hook classification ----
  ok(Game.convoSnippetIsHook(HOOK), 'transcript hook snippet is a hook');
  ok(Game.convoSnippetIsHook('"Wait till you see what\'s in the hollow."'), '"wait till you see" is a hook');
  ok(Game.convoSnippetIsHook('"I found something. You have to see this."'), '"I found something" is a hook');
  ok(!Game.convoSnippetIsHook('"The cellar door was open. Something big went in."'),
    'substantive beat is not a hook');
  ok(!Game.convoSnippetIsHook('"Hm."'), 'micro-filler is not a hook (just not a real beat)');
  ok(!Game.convoSnippetIsHook(null), 'null is not a hook');
  const pool = Game.convoGriefOpenerPool();
  ok(pool.every(l => !Game.convoSnippetIsHook(l)), 'no grief pool line is a hook');
  // the hook is still a REAL beat (plant gate unchanged — the thread exists)
  ok(Game.convoSnippetIsRealBeat(HOOK), 'hook snippet still plants (real beat, unfinished business)');

  // ---- (b) integration: resume opener drops the hook quote, keeps the thread ----
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  ok(!!vid, 'found a villager');
  const realBacked = Game.convoThreadBacked;
  Game.convoThreadBacked = () => true;
  (Game.state.village.trust || {})[vid] = 90;
  Game.convoThreadOpen(vid, 'show', 'the thing I found', 'walked away mid-thread', HOOK);
  const open = Game.convoOpenThreads(vid);
  ok(open.some(o => o.tid === 'show'), 'hook-snippet thread IS planted (unfinished business is real)');
  const _rnd = Math.random;
  Math.random = () => 0; // force the opener path + first-thread pick
  let opener = null;
  try { opener = Game.convoResumeOpener(vid); } finally { Math.random = _rnd; }
  ok(!!opener && opener.line, 'resume opener fires for the planted thread');
  const line = String(opener.line);
  console.log('  opener: ' + line.slice(0, 160));
  ok(line.indexOf('Come see what I found') === -1,
    'opener does NOT quote the unfulfilled invitation');
  ok(line.indexOf('the thing I found') !== -1,
    'opener still names the thread (label survives)');
  Game.convoThreadBacked = realBacked;

  console.log(`GREEN: ${pass} assertions passed`);
}
main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
