#!/usr/bin/env node
// PROOF (journey social r163, 2026-11-09): NARR coach-line repeat.
// BLANK: truth.js confrontWindup's priorDeflect branch served ONE
// hardcoded string, so it repeated verbatim every time the doubt probe
// was re-pressed in one sitting — r159 panel: 7x panel-wide, 3x in
// Leo's sitting, 2x in Heinrich's. Every other coach line draws from a
// pool via drawTruthLine (per-game no-repeat); this one did not.
// RED (pre-fix): no coachPriorDeflect pool exists; confrontWindup
//   serves the same hardcoded string on all 3 presses (behavioral
//   specimen: 3 calls -> 1 distinct coach beat).
// GREEN (post-fix): coachPriorDeflect pool has >=3 lines; 3 draws for
//   one villager are verbatim-distinct, and 3x confrontWindup with
//   deflection evidence yields 3 distinct coach beats (the observed
//   3x-in-one-sitting case). Meaning unchanged: every variant says
//   they've deflected you before, the evidence needs to be heavier,
//   one more thread before you speak. No {truth}/{told} placeholders
//   (the coach must never name the lie's truth).
// Usage: node scripts/test-journey-social-r163-coach.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(label, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' :: ' + detail : ''));
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 42801 });
  await setupGame(Game);

  // --- (1) pool shape ---
  const pool = (Game.truthLinePools || {}).coachPriorDeflect || [];
  check('coachPriorDeflect pool has >=3 lines (covers the observed 3x-in-one-sitting case)',
    pool.length >= 3, 'pool.length=' + pool.length);
  const leaks = pool.filter(l => /\{(truth|told|atruth|atold)\}/.test(l));
  check('no coachPriorDeflect line names the lie (no {truth}/{told}/{atruth}/{atold} placeholders)',
    leaks.length === 0, leaks.length ? 'leakers: ' + leaks.join(' || ') : '');
  const meaning = pool.filter(l => /deflect/i.test(l) && /one more thread/i.test(l));
  check('every variant keeps the meaning (deflect named + one more thread)',
    meaning.length === pool.length, 'matching=' + meaning.length + '/' + pool.length);

  // --- (2) draw-level: 3 draws, one villager, verbatim-distinct ---
  try { Game.state.truthLineUsed = {}; } catch (e) { /* test-only */ }
  const drawn = [];
  for (let i = 0; i < 3; i++) drawn.push(Game.drawTruthLine('coachPriorDeflect', 'testvid_r163', {}));
  check('3 coachPriorDeflect draws for one villager: 3 verbatim-distinct lines',
    new Set(drawn).size === 3, 'distinct=' + new Set(drawn).size + ' / 3');

  // --- (3) behavioral: 3x confrontWindup with deflection evidence ---
  // A roster villager who is not the scholar; no live convo needed
  // (confrontWindup tolerates a null convo — beats are still returned).
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  check('roster has a non-scholar villager to confront', roster.length >= 1, 'roster=' + roster.length);
  if (roster.length) {
    const vid = roster[0];
    const doubt = {
      kind: 'gossip',
      text: 'Someone said something about you that does not match what you told me.',
      evidence: ['deflected the question about Denver'],
    };
    try { Game.state.truthLineUsed = {}; } catch (e) {}
    const coaches = [];
    for (let i = 0; i < 3; i++) {
      const beats = Game.confrontWindup(vid, doubt, null) || [];
      const coach = beats.filter(b => b.who === 'narr' && /^\*.+\*$/.test(String(b.text || '')))
        .map(b => String(b.text));
      check('press ' + (i + 1) + ': exactly one coach beat', coach.length === 1,
        'coach beats=' + coach.length);
      if (coach.length) coaches.push(coach[0]);
    }
    check('3 confrontWindup presses: 3 distinct coach beats (no verbatim repeat in one sitting)',
      new Set(coaches).size === 3, 'distinct=' + new Set(coaches).size + ' / 3 :: ' + coaches.map(c => c.slice(0, 60)).join(' | '));
    // Defect specimen (documented, not executed against old code): the
    // pre-fix branch assigned the same hardcoded string on every press,
    // so the 3 presses above would yield 1 distinct coach beat.
  }

  console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('PROOF ERROR:', e && e.message); process.exit(2); });
