#!/usr/bin/env node
// test-convo-commit-residual-20261103.js -- PROOF for journey-deepening R88.
//
// R87 fixed the AWAY-commit verbatim loop (blocked commit resolves the want
// as 'stated'). Its residual, flagged not fixed: the dlg:commit handler's two
// EARLY returns -- the stay_close gate (convo-dialogue.js ~506) and the
// unsupported-favor return (~510) -- speak their reason and return WITHOUT
// resolving the want. A driver that keeps pressing commit there re-hears the
// reason verbatim forever, exactly the r87 loop shape.
//
// Fix contract (pre-registered in journey-deepening-r88-prereg.md):
//   F1 stay_close gate: with a stay_close want whose commit gate FAILS
//     (night over), dlg:commit is ABSENT from offered choices; pressing
//     commit raw 5x speaks the reason ONCE, resolves the want to stage 3,
//     grants 0 trust, and later presses give the decided-want line, never
//     the gate reason again.
//   F2 unsupported favor: same shape -- commit absent from choices; 5 raw
//     presses speak the reason once, resolve to stage 3, grant 0 trust.
//   F3 away-commit regression: covered by the EXISTING r87 test
//     (scripts/test-convo-commit-away-20261102.js), run alongside this one.
//
// NOTE on the fix shape: resolving alone is NOT enough for F1/F2 as bound.
// The gate/unsupported checks sit BEFORE the decided-want branch in the
// handler, so a resolved want re-pressed raw would still hit the early
// return and re-hear the reason. The fix must ALSO apply the early returns
// only while the want is still live, so later presses fall through to the
// decided-want line. Menu-visible behavior is unchanged: the menu already
// hides dlg:commit when either gate fails, so menu-faithful players never
// reach these branches at all.
//
// MEASUREMENT NOTE (r88, found while proving F2): "later presses give the
// decided-want line" is asserted on the TURN RESULT (r.line), not on the
// raw transcript. The transcript is subject to sayLine's designed
// no-repeat ledgers: a fixed line already spoken by another villager
// inside the 48-entry run window is run-blocked and rendered as a CYCLING
// dry line ("...Sorry, lost my train of thought.", "Hm. Never mind —
// go on.", ...), and a within-sitting repeat of the decided line adds no
// new transcript entry at all. Both are pre-existing engine behavior
// (defect-7 guard), not a commit loop: the reason is still spoken exactly
// once, the want still resolves, and no transcript line ever repeats 3+
// times in the sitting. The handler's answer -- what the press "gives" --
// is the decided line on every later press, and that is what is asserted.
// A menu-faithful player never reaches this path anyway (commit is not
// offered once the gate fails).
//
// Usage: node scripts/test-convo-commit-residual-20261103.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const themLines = (Game, vid) =>
  Game.convoGet(vid).transcript.filter(e => e.who === 'them').map(e => String(e.text));
const offeredIds = (Game, vid) => {
  try { return (Game.convoChoices(vid) || []).map(c => c.id); } catch (e) { return ['<err:' + e.message + '>']; }
};

(async () => {
  const { Game } = await loadGame({ seed: 93101, mode: 'test-commit-residual' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const v = Game.state.village;
  const vids = v.roster.filter(id => id !== Game.villagerId);
  if (vids.length < 2) throw new Error('need 2 villagers in roster');
  const day = (Game.state.scholar && Game.state.scholar.day) || 1;
  console.log('  scholar day at setup:', day);

  // ---- F1: stay_close gate fails (night over) ----
  console.log('\nF1: stay_close gate-failed commit (night over)');
  const vid1 = vids[0];
  v.trust = v.trust || {};
  v.trust[vid1] = 50;
  Game.startConvo(vid1);
  const c1 = Game.convoGet(vid1);
  c1.want = {
    id: 'ask_favor',
    stage: 2,
    favor: {
      id: 'fav-stayclose-proof', vid: vid1, kind: 'stay_close',
      state: 'asked', companyVersion: 1, companyNight: day - 1,
      goal: 'stay close', task: 'stay close', deadline: 999,
    },
    def: {
      commitBeat: function () { return '"Thank you. Seriously — thank you."'; },
      menuOptions: function () { return []; },
    },
  };
  const gateBefore = Game.companyFavorCommitGate
    ? Game.companyFavorCommitGate(vid1, c1.want.favor) : null;
  console.log('  gate before presses:', JSON.stringify(gateBefore));
  ok(gateBefore && !gateBefore.ok, 'fixture: stay_close gate actually fails', JSON.stringify(gateBefore));
  const choicesBefore = offeredIds(Game, vid1);
  console.log('  offered choices before presses:', JSON.stringify(choicesBefore));
  ok(choicesBefore.indexOf('dlg:commit') === -1, 'dlg:commit absent from offered choices (gate failed)', JSON.stringify(choicesBefore));
  const lines = [], resultLines = [];
  for (let i = 0; i < 5; i++) {
    let r = null;
    try { r = Game.convoTurn(vid1, 'dlg:commit'); } catch (e) { console.log('  commit press threw:', e.message); }
    resultLines.push((r && r.line) || '');
    const tl = themLines(Game, vid1);
    lines.push(tl.slice(-1)[0] || '');
  }
  const w1 = Game.convoGet(vid1).want;
  const transcript1 = themLines(Game, vid1);
  const maxRep1 = Math.max(0, ...Object.values(transcript1.reduce((m, l) => { m[l] = (m[l] || 0) + 1; return m; }, {})));
  console.log('  press transcript lines:', JSON.stringify(lines));
  console.log('  press result lines:', JSON.stringify(resultLines));
  console.log('  want after presses: stage=' + w1.stage + ' resolution=' + w1.resolution);
  console.log('  trust after presses:', v.trust[vid1], 'max transcript repeat:', maxRep1);
  ok(lines[0] && /night is over/.test(lines[0]), 'first press speaks the night-over reason', lines[0]);
  ok(w1.stage === 3 && w1.resolution === 'stated', 'gate-failed commit resolves want to stage 3 / stated',
    'stage=' + w1.stage + ' resolution=' + w1.resolution);
  ok(transcript1.filter(l => /night is over/.test(l)).length === 1, 'gate reason spoken exactly once in transcript', JSON.stringify(transcript1));
  ok(maxRep1 < 3, 'no transcript line repeats 3+ times (no verbatim loop)', 'maxRep=' + maxRep1);
  ok(resultLines.slice(1).every(l => /already said/.test(l)), 'later presses give the decided-want line (turn result)', JSON.stringify(resultLines.slice(1)));
  ok(v.trust[vid1] === 50, 'gate-failed commits grant no trust', 'trust=' + v.trust[vid1]);
  Game.endConvo(vid1, 'left');

  // ---- F2: unsupported favor (snare_mend has no playable action) ----
  console.log('\nF2: unsupported-favor commit (snare_mend)');
  const vid2 = vids[1];
  v.trust[vid2] = 50;
  Game.startConvo(vid2);
  const c2 = Game.convoGet(vid2);
  c2.want = {
    id: 'ask_favor',
    stage: 2,
    favor: {
      id: 'fav-snare-proof', vid: vid2, kind: 'snare_mend',
      state: 'asked', goal: 'mend snares', task: 'mend snares', deadline: 999,
    },
    def: {
      commitBeat: function () { return '"Thank you. Seriously — thank you."'; },
      menuOptions: function () { return []; },
    },
  };
  let unsupportedBefore = null;
  try { unsupportedBefore = Game.convoFavorAction(vid2, c2.want.favor).unsupported; } catch (e) { console.log('  convoFavorAction threw:', e.message); }
  console.log('  unsupported before presses:', unsupportedBefore);
  ok(unsupportedBefore === true, 'fixture: snare_mend favor is actually unsupported');
  const choices2Before = offeredIds(Game, vid2);
  console.log('  offered choices before presses:', JSON.stringify(choices2Before));
  ok(choices2Before.indexOf('dlg:commit') === -1, 'dlg:commit absent from offered choices (unsupported)', JSON.stringify(choices2Before));
  const lines2 = [], resultLines2 = [];
  for (let i = 0; i < 5; i++) {
    let r = null;
    try { r = Game.convoTurn(vid2, 'dlg:commit'); } catch (e) { console.log('  commit press threw:', e.message); }
    resultLines2.push((r && r.line) || '');
    const tl = themLines(Game, vid2);
    lines2.push(tl.slice(-1)[0] || '');
  }
  const w2 = Game.convoGet(vid2).want;
  const transcript2 = themLines(Game, vid2);
  const maxRep2 = Math.max(0, ...Object.values(transcript2.reduce((m, l) => { m[l] = (m[l] || 0) + 1; return m; }, {})));
  console.log('  press transcript lines:', JSON.stringify(lines2));
  console.log('  press result lines:', JSON.stringify(resultLines2));
  console.log('  want after presses: stage=' + w2.stage + ' resolution=' + w2.resolution);
  console.log('  trust after presses:', v.trust[vid2], 'max transcript repeat:', maxRep2);
  ok(lines2[0] && /snare-repair/.test(lines2[0]), 'first press speaks the unsupported reason', lines2[0]);
  ok(w2.stage === 3 && w2.resolution === 'stated', 'unsupported commit resolves want to stage 3 / stated',
    'stage=' + w2.stage + ' resolution=' + w2.resolution);
  ok(transcript2.filter(l => /snare-repair/.test(l)).length === 1, 'unsupported reason spoken exactly once in transcript', JSON.stringify(transcript2));
  ok(maxRep2 < 3, 'no transcript line repeats 3+ times (no verbatim loop)', 'maxRep=' + maxRep2);
  ok(resultLines2.slice(1).every(l => /already said/.test(l)), 'later presses give the decided-want line (turn result)', JSON.stringify(resultLines2.slice(1)));
  ok(v.trust[vid2] === 50, 'unsupported commits grant no trust', 'trust=' + v.trust[vid2]);
  Game.endConvo(vid2, 'left');

  console.log(`\nTOTAL ${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: residual commit loop present'); process.exit(1); }
  console.log('GREEN: residual gates resolve once, never loop, grant nothing');
})().catch(e => { console.error('FATAL', e); process.exit(2); });
