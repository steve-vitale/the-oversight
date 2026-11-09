#!/usr/bin/env node
// test-journey-establishment-r117-invite-answer.js — proof test for the
// r117 Q2 finding (journey-establishment r117 2026-11-09).
//
// The panel finding: on the 4-seed pilot, exactly one NPC invitation was
// offered ("Walk my trap line with me? Extra hands, extra eyes.", seed
// 1803 Jada) and it went unanswered — the driver picked [silence] and the
// NPC moved on. The r116 note read that as a game defect ("villagers keep
// offering things and nothing comes of it").
//
// The mechanism (read from code, not assumed): the game DOES offer the
// answer. When a pending invite exists, betrayalChoices offers
// betrayal:accept ("All right. Let's go.") and betrayal:decline ("Not
// this time."), and convoMenuPage OWNS the invitation turn's menu to
// exactly [accept, decline, leave, silence] (conversation.js
// convoMenuPage, spokenBeat.tag === 'invitation'). The panel's 0-answered
// is a DRIVER artifact: the r109 driver hygiene rule ("betrayal:* is
// NEVER picked while sampling") refuses both answers, and the driver
// never picks leave — so it picks silence, the only remaining option.
// A real player sees the accept/decline menu and can answer.
//
// This test proves the answer channel end to end on the real menu:
//   menu   : with a pending micro-quest invite, startConvo offers
//            betrayal:accept + betrayal:decline (the answer is offered).
//   accept : picking betrayal:accept resolves the walk — accepted++,
//            pending cleared, an outcome recorded, a walk line spoken.
//   decline: picking betrayal:decline clears the pending, counts the
//            invite, and costs exactly 1 trust (break-it r10: penalties
//            land whole).
//   control: with NO pending invite, the menu offers NEITHER accept nor
//            decline (the r7 honesty invariant from the other side: the
//            player is never asked to answer an invitation never made).
//
// What this test does NOT prove: invite ISSUANCE (npcInviteTick) —
// issuance is proven by the panel itself (the invite WAS spoken on
// seed 1803, and 14 times on the r116 panel). The pending is set
// directly through the public inviteHistory() so the test is
// deterministic; the answer path it drives is the real convo menu.
//
// Usage: node scripts/test-journey-establishment-r117-invite-answer.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

function setupCalm(Game, vid) {
  const v = Game.state.village || {};
  v.health = v.health || {};
  v.health[vid] = 100;
  v.sick = v.sick || {};
  delete v.sick[vid];
  v.hunger = v.hunger || {};
  v.hunger[vid] = 0;
  v.energy = v.energy || {};
  v.energy[vid] = 100;
  v.fear = v.fear || {};
  v.fear[vid] = 0;
  v.trust = v.trust || {};
  v.trust[vid] = 90;
}

function setPending(Game, vid, defId) {
  const hist = Game.inviteHistory(vid);
  hist.pending = { defId, day: (Game.state.scholar || {}).day || 1 };
  return hist;
}

// Drive the convo until the invitation is spoken (its label appears in
// the transcript) or the menu offers betrayal:accept — at most 10 turns.
// Answers the opener question if one is hung, else goes on.
function driveToInvite(Game, vid) {
  for (let turn = 0; turn < 10; turn++) {
    const ch = Game.convoChoices(vid) || [];
    if (ch.some(x => x.id === 'betrayal:accept')) return true;
    const ans = ch.find(x => x.id && x.id.indexOf('ans:') === 0);
    if (ans) { Game.convoTurn(vid, ans.id); continue; }
    if (ch.some(x => x.id === 'goon')) { Game.convoTurn(vid, 'goon'); continue; }
    const more = ch.find(x => x.id === 'dlg:more');
    if (more) { Game.convoTurn(vid, 'dlg:more'); continue; }
    return false;
  }
  const ch = Game.convoChoices(vid) || [];
  return ch.some(x => x.id === 'betrayal:accept');
}

(async () => {
  const { Game } = await loadGame({ seed: 1801, mode: 'establishment-r117-invite-answer-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => String(id) !== String(Game.villagerId));
  if (roster.length < 3) { check('roster has 3+ villagers for accept/decline/control', false, `roster=${roster.length}`); process.exit(1); }
  const [acceptVid, declineVid, controlVid] = roster;
  for (const vid of [acceptVid, declineVid, controlVid]) setupCalm(Game, vid);

  // --- control FIRST (no pending anywhere yet): no accept/decline offered.
  let r = Game.startConvo(controlVid);
  check('control: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (r && !r.refused) {
    const ch = Game.convoChoices(controlVid) || [];
    check('control: no betrayal:accept without a pending invite',
      !ch.some(x => x.id === 'betrayal:accept'), `choices=${ch.map(x => x.id).join(',')}`);
    check('control: no betrayal:decline without a pending invite',
      !ch.some(x => x.id === 'betrayal:decline'), `choices=${ch.map(x => x.id).join(',')}`);
    try { Game.endConvo(controlVid, 'left'); } catch (e) {}
  }

  // --- accept: pending 'traps' invite, menu offers the answer, accept resolves the walk.
  const histA = setPending(Game, acceptVid, 'traps');
  r = Game.startConvo(acceptVid);
  check('accept: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (!r || r.refused) { process.exit(1); }
  const reached = driveToInvite(Game, acceptVid);
  check('accept: invitation-owned menu offers betrayal:accept', reached,
    `choices=${(Game.convoChoices(acceptVid) || []).map(x => x.id).join(',')}`);
  if (reached) {
    const ch = Game.convoChoices(acceptVid) || [];
    check('accept: betrayal:decline offered alongside', ch.some(x => x.id === 'betrayal:decline'),
      `choices=${ch.map(x => x.id).join(',')}`);
    const before = histA.accepted;
    const res = Game.convoTurn(acceptVid, 'betrayal:accept');
    check('accept: accepted count +1', histA.accepted === before + 1, `accepted=${histA.accepted}`);
    check('accept: pending cleared', histA.pending === null, `pending=${JSON.stringify(histA.pending)}`);
    check('accept: outcome recorded for traps',
      (histA.outcomes || []).some(o => o.defId === 'traps' && ['small', 'reward', 'wild'].includes(o.outcome)),
      `outcomes=${JSON.stringify(histA.outcomes)}`);
    check('accept: a walk line was spoken', !!(res && res.line && res.line.length > 20),
      String(res && res.line || '').slice(0, 100));
    const ch2 = Game.convoChoices(acceptVid) || [];
    check('accept: accept NOT offered again after resolving',
      !ch2.some(x => x.id === 'betrayal:accept'), `choices=${ch2.map(x => x.id).join(',')}`);
  }
  try { Game.endConvo(acceptVid, 'done'); } catch (e) {}

  // --- decline: pending 'show' invite, decline counts it and costs 1 trust.
  const trustBefore = ((Game.state.village.trust || {})[declineVid] || 0);
  const histD = setPending(Game, declineVid, 'show');
  r = Game.startConvo(declineVid);
  check('decline: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (r && !r.refused) {
    const reachedD = driveToInvite(Game, declineVid);
    check('decline: invitation-owned menu offers betrayal:decline', reachedD,
      `choices=${(Game.convoChoices(declineVid) || []).map(x => x.id).join(',')}`);
    if (reachedD) {
      const resD = Game.convoTurn(declineVid, 'betrayal:decline');
      check('decline: pending cleared', histD.pending === null, `pending=${JSON.stringify(histD.pending)}`);
      check('decline: invite counted, not accepted',
        histD.count === 1 && histD.accepted === 0, `count=${histD.count} accepted=${histD.accepted}`);
      const trustAfter = ((Game.state.village.trust || {})[declineVid] || 0);
      check('decline: trust costs exactly 1', trustAfter === trustBefore - 1,
        `trust ${trustBefore} -> ${trustAfter}`);
      check('decline: a decline line was spoken', !!(resD && resD.line && resD.line.length > 5),
        String(resD && resD.line || '').slice(0, 100));
    }
    try { Game.endConvo(declineVid, 'done'); } catch (e) {}
  }

  console.log(fails === 0 ? '\nALL GREEN' : `\n${fails} FAILURES`);
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
