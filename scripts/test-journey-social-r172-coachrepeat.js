#!/usr/bin/env node
// PROOF (journey social r172, 2026-11-10): NARR coach line repeats verbatim
// WITHIN ONE SITTING after pool exhaustion.
// BLANK: r172 panel M10 FAILS — 2 verbatim coach repeats in one sitting
// each (Jesse 43402: coachDeflect "You've seen the smooth deflect
// before..." x2; Xavier 43401: coachAttack "You know the counter-attack
// now..." x2). r163's pool fix only defers the repeat: drawTruthLine's
// per-game no-repeat recycles a 2-variant pool after 2 draws (A,B,A), so
// a sitting that presses doubt 3+ times re-serves the same hint.
// FIX (truth.js confrontWindup): if the drawn coach line already appears
// as a narr beat in THIS sitting's transcript, suppress the coach beat
// instead of repeating the hint — vary while variants remain, say nothing
// once the sitting has heard them all.
// RED (pre-fix): 3 presses in one live sitting yield coach beats A,B,A —
//   the 3rd press re-serves press 1 verbatim, and the transcript holds a
//   verbatim repeat.
// GREEN (post-fix): 3 presses yield A,B,none — the 3rd press carries no
//   coach beat, and the transcript holds exactly 2 distinct coach beats.
// Usage: node scripts/test-journey-social-r172-coachrepeat.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(label, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' :: ' + detail : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 43402 });
  await setupGame(Game);

  // A roster villager who is not the scholar; open a REAL conversation
  // so confrontWindup lands its beats in a live transcript.
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  check('roster has a non-scholar villager to confront', roster.length >= 1, 'roster=' + roster.length);
  if (!roster.length) { console.log('1 FAILURES'); process.exit(1); }
  const vid = roster[0];
  const opened = Game.talkTo(vid);
  const c = Game.convoGet(vid);
  check('conversation is live (active, transcript present)', !!(c && c.active && Array.isArray(c.transcript)),
    'active=' + !!(c && c.active) + ' opened=' + JSON.stringify(opened && String(opened).slice(0, 40)));

  // Drive the coachDeflect branch (2-variant pool — the observed repeat):
  // ledger says the player has LIVED deflections twice; no prior-deflect
  // evidence on the doubt, so the priorDeflect branch does not fire.
  try {
    Game.state.codex = Game.state.codex || {};
    Game.state.codex.socialLessons = { confront: 0, confessed: 0, deflected: 2, attacked: 0, cleared: 0, pressed: 0 };
    Game.state.truthLineUsed = {};
  } catch (e) { /* test-only */ }
  const pool = (Game.truthLinePools || {}).coachDeflect || [];
  check('coachDeflect pool has exactly 2 variants (the exhaustible case)', pool.length === 2,
    'pool.length=' + pool.length);

  const doubt = {
    kind: 'behavior',
    text: 'Something has been bothering me.',
    evidence: ['they went quiet when asked'],
  };
  const perPress = [];
  for (let i = 0; i < 3; i++) {
    const beats = Game.confrontWindup(vid, doubt, null) || [];
    const coach = beats.filter(b => b.who === 'narr' && /^\*.+\*$/.test(String(b.text || '')))
      .map(b => String(b.text));
    perPress.push(coach);
    check('press ' + (i + 1) + ': at most one coach beat', coach.length <= 1, 'coach beats=' + coach.length);
  }
  const flat = perPress.flat();
  check('press 1 and press 2 carry distinct coach beats',
    perPress[0].length === 1 && perPress[1].length === 1 && perPress[0][0] !== perPress[1][0],
    'p1=' + JSON.stringify(perPress[0][0] && perPress[0][0].slice(0, 50)) + ' p2=' + JSON.stringify(perPress[1][0] && perPress[1][0].slice(0, 50)));
  check('press 3 carries NO coach beat (pool exhausted in this sitting — suppress, do not recycle)',
    perPress[2].length === 0, 'press 3 coach beats=' + perPress[2].length);
  check('transcript holds no verbatim coach repeat in this sitting',
    new Set(flat).size === flat.length, 'distinct=' + new Set(flat).size + ' / total=' + flat.length);
  const inTranscript = (c.transcript || []).filter(b => b.who === 'narr' && /^\*.+\*$/.test(String(b.text || '')))
    .map(b => String(b.text));
  check('transcript coach beats are exactly the 2 distinct pressed beats',
    inTranscript.length === 2 && new Set(inTranscript).size === 2,
    'inTranscript=' + inTranscript.length + ' distinct=' + new Set(inTranscript).size);

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('PROOF ERROR:', e && e.message); process.exit(2); });
