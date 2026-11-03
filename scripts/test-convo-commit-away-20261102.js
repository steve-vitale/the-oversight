#!/usr/bin/env node
// test-convo-commit-away-20261102.js — PROOF for the journey-deepening R87
// M4 blank: the conversation COMMIT LOOP (seed 93004 day 80, Olivia).
//
// Caught live: an away villager's ask_favor (forage_help) answered with
// dlg:commit 8 times in a row, each time the identical away-refusal line:
// "Wait — I'm out on the road. I can't ask you to meet me at dawn when
// I'm miles away. Find me when I'm back, and we'll set it then."
//
// Mechanism (convo-dialogue.js dlg:commit + convo-wants.js convoWantEngage):
// a blocked favor commit (convoFavorCommit away guard -> ok:false) takes
// the 'engage' transition, which only moves stage to 2 — the want was
// ALREADY stage 2, so nothing moves, the want stays live, dlg:commit stays
// rank-1 offered, and the same refusal re-fires forever. Second bug in the
// same handler: resolveConsequence (+3 trust, +1 mood) fires BEFORE the
// commit outcome is known, so every refused commit farms trust.
//
// Fix contract (what this test asserts):
//  1. After ONE blocked (away) commit, the want resolves: stage 3,
//     resolution 'stated' (heard, not promised — the handler's own comment
//     already names 'stated' as the blocked-commit resolution).
//  2. A second dlg:commit does NOT repeat the away line (it hears the
//     decided-want line instead).
//  3. Blocked commits grant NO trust/mood (the +3/+1 fires only on a real
//     commitment).
//
// RED (unfixed): stage stays 2, second commit repeats the away line
// verbatim, trust climbs +3 per refused commit.
// GREEN (fixed): all three assertions pass.
//
// Usage: node scripts/test-convo-commit-away-20261102.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const themLines = (Game, vid) =>
  Game.convoGet(vid).transcript.filter(e => e.who === 'them').map(e => String(e.text));

(async () => {
  const { Game } = await loadGame({ seed: 93004, mode: 'test-commit-away' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const vid = vids[0];
  if (!vid) throw new Error('no villager in roster');

  // The R87 shape: villager out on the road, ask_favor at stage 2.
  const v = Game.state.village;
  v.away = v.away || {};
  v.away[vid] = { nx: 0, ny: 0, purpose: 'expedition', returnDay: 999 };
  v.trust = v.trust || {};
  if (v.trust[vid] === undefined) v.trust[vid] = 50;
  if (v.trust[vid] > 90) v.trust[vid] = 50; // leave headroom so a farm is visible

  Game.startConvo(vid);
  const c = Game.convoGet(vid);
  c.want = {
    id: 'ask_favor',
    stage: 2,
    favor: {
      id: 'fav-away-proof', vid: vid, kind: 'forage_help',
      state: 'asked', goal: 'forage together', task: 'forage together',
      deadline: 999,
    },
    def: {
      commitBeat: function () { return '"Thank you. Seriously — thank you."'; },
      menuOptions: function () { return []; },
    },
  };

  const trustBefore = v.trust[vid];
  let r1 = null, r2 = null;
  try { r1 = Game.convoTurn(vid, 'dlg:commit'); } catch (e) { console.log('  commit1 threw:', e.message); }
  const lines1 = themLines(Game, vid);
  const awayLine = lines1.slice(-1)[0] || '';
  const stageAfter1 = Game.convoGet(vid).want.stage;
  const resAfter1 = Game.convoGet(vid).want.resolution;
  try { r2 = Game.convoTurn(vid, 'dlg:commit'); } catch (e) { console.log('  commit2 threw:', e.message); }
  const lines2 = themLines(Game, vid);
  const secondLine = lines2.slice(-1)[0] || '';
  const trustAfter = v.trust[vid];
  Game.endConvo(vid, 'left');

  console.log('  away line fired:', JSON.stringify(awayLine));
  console.log('  stage after 1st commit:', stageAfter1, 'resolution:', resAfter1);
  console.log('  2nd commit line:', JSON.stringify(secondLine));
  console.log('  trust:', trustBefore, '->', trustAfter);
  ok(/out on the road/.test(awayLine), 'first commit speaks the away refusal', awayLine);
  ok(stageAfter1 === 3 && resAfter1 === 'stated', 'blocked commit resolves want to stage 3 / stated',
    `stage=${stageAfter1} resolution=${resAfter1}`);
  ok(secondLine !== awayLine, 'second commit does not repeat the away line', secondLine);
  ok(trustAfter === trustBefore, 'blocked commits grant no trust',
    `trust ${trustBefore} -> ${trustAfter}`);
  void r1; void r2;

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: commit loop / trust farm present'); process.exit(1); }
  console.log('GREEN: away commit resolves once, never loops, grants nothing');

  // T2 (happy path, same process): a REAL commitment still grants the
  // +3 trust and resolves — the moved reward must not have gone silent.
  console.log('\nT2: successful commit still rewards +3 trust and resolves');
  const vid2 = vids[1] || vids[0];
  // Below the talk cap (40): resolveConsequence grants talk-trust only
  // under 40 — setting 50 would (correctly) apply 0 and mask the reward.
  Game.state.village.trust[vid2] = 20;
  Game.startConvo(vid2);
  const c2 = Game.convoGet(vid2);
  c2.want = {
    id: 'curious', stage: 2,
    def: {
      commitBeat: function () { return '"Good. That means something."'; },
      menuOptions: function () { return []; },
    },
  };
  let r3 = null;
  try { r3 = Game.convoTurn(vid2, 'dlg:commit'); } catch (e) { console.log('  commit3 threw:', e.message); }
  const w2 = Game.convoGet(vid2).want;
  console.log('  happy-path line:', JSON.stringify(r3 && r3.line), 'stage:', w2.stage,
    'resolution:', w2.resolution, 'trust:', Game.state.village.trust[vid2]);
  ok(w2.stage === 3 && w2.resolution === 'engaged', 'real commit resolves stage 3 / engaged',
    `stage=${w2.stage} resolution=${w2.resolution}`);
  ok(Game.state.village.trust[vid2] > 20, 'real commit still grants trust (talk gain under cap 40)',
    `trust=${Game.state.village.trust[vid2]}`);
  Game.endConvo(vid2, 'left');

  console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED'); process.exit(1); }
  console.log('GREEN: blocked commit resolves + grants nothing; real commit rewards');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
