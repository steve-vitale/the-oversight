#!/usr/bin/env node
// Proof: inherited thread resume after a mantle pass reads coherently.
// RED (pre-fix): an 8+-day-old thread from a dead predecessor resumed as
//   "Colin and I never did finish talking about how you slept — that was 8
//   days back. You're not Colin. Still on your mind?" — addressed to the
//   third Bearer <redacted> never met Colin-in-that-conversation, reading as a fresh
//   realization (transcript-caught journey-landing r16 2026-10-15).
// GREEN (post-fix): names the dead, owns the gap, invites:
//   "...that was 8 days back. You weren't there for that one — Colin was.
//   Want to hear where it left off?"
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(7);
process.chdir('/home/hatch/workspace/worktrees/journey-landing2');
const { loadGame, setupGame } = require('/home/hatch/workspace/worktrees/journey-landing2/scripts/sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

(async () => {
  const lg = await loadGame({ seed: 49, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).slice();
  const vid = roster[1];
  // trust gate in convoResumeOpener is 15
  Game.state.village.trust[vid] = 20;
  // scholar day 9; thread planted day 1 by a dead predecessor (inh stamp,
  // as playerDeath writes it)
  Game.state.scholar.day = 9;
  const L = Game.convoTopicLedger(vid);
  L.open.length = 0;
  L.open.push({
    tid: 'sleep-talk', label: 'how you slept', day: 1,
    why: 'unfinished business',
    snippet: 'Did you sleep? I kept hearing things out past the treeline.',
    inh: 'Colin Pillai',
  });
  // LEDGER GATE: back the thread so the resume is allowed
  const _backed = Game.convoThreadBacked;
  Game.convoThreadBacked = () => true;
  // deterministic: pass the 0.65 roll gate
  const _rnd = Math.random;
  Math.random = () => 0.5;
  let opener = null;
  try { opener = Game.convoResumeOpener(vid); } catch (e) { console.log('OPENER ERROR: ' + (e && e.message)); }
  Math.random = _rnd;
  Game.convoThreadBacked = _backed;
  const line = (opener && opener.line) || '';
  console.log('RESUMED: ' + line.slice(0, 220));
  check('resume fires for an 8-day-old inherited thread', !!opener, 'got null');
  check('names the dead predecessor', /Colin/.test(line), line.slice(0, 120));
  check('does NOT say "You\'re not Colin. Still on your mind?"',
    !/You're not Colin\. Still on your mind\?/.test(line), line.slice(0, 160));
  check('owns the gap (new Bearer <redacted> there)', /weren't there for that one/i.test(line), line.slice(0, 160));
  check('invites instead of assuming', /want to hear where it left off/i.test(line), line.slice(0, 160));
  check('memory quote still attached', /Did you sleep\?/.test(line), line.slice(0, 220));
  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
