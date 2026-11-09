#!/usr/bin/env node
// test-journey-establishment-r118-invite-answer.js — proof test for the
// r118 Q2 measurement fix (journey-establishment r118 2026-11-09).
//
// The r117 finding: the game offers accept/decline on an invitation-owned
// menu (proof-tested 17/17) but the sampling driver never picked either
// (r109 hygiene), so every NPC invitation went unanswered on the panel.
// The fix is a DRIVER rule (scripts/journey-invite-pick.js): on an
// invitation-owned menu, accept iff the villager's trust is >= 40, else
// decline. Trust is the live village trust map; no hidden plot state.
//
// This test proves the rule end to end on the real menu:
//   unit   : isInvitationMenu detects the [accept, decline, leave,
//            silence] menu and rejects ordinary menus; pickInviteAnswer
//            accepts at trust >= 40, declines below, declines on an
//            unrecorded trust (default 10).
//   live accept: pending 'traps' invite at trust 90 — the rule picks
//            betrayal:accept and the walk resolves (accepted++, pending
//            cleared, outcome recorded, walk line spoken).
//   live decline: pending 'show' invite at trust 10 — the rule picks
//            betrayal:decline, the invite is counted, trust costs
//            exactly 1.
//   control: with NO pending invite, the menu offers NEITHER accept nor
//            decline (the rule never fires off-menu).
//
// What this test does NOT prove: invite ISSUANCE (npcInviteTick) —
// issuance is proven by the panel itself (invites were spoken on the
// r116 panel 14 times and the r117 pilot twice). The pending is set
// directly through the public inviteHistory() so the test is
// deterministic; the answer path it drives is the real convo menu.
//
// Usage: node scripts/test-journey-establishment-r118-invite-answer.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { isInvitationMenu, pickInviteAnswer, TRUST_ACCEPT_AT, TRUST_DEFAULT } = require('./journey-invite-pick');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

// --- unit: the rule module, no game needed ---
check('unit: invitation menu detected', isInvitationMenu([
  { id: 'betrayal:accept' }, { id: 'betrayal:decline' }, { id: 'leave' }, { id: 'silence' }]));
check('unit: ordinary menu rejected', !isInvitationMenu([
  { id: 'goon' }, { id: 'ask:personal' }, { id: 'leave' }, { id: 'silence' }]));
check('unit: accept-only menu rejected', !isInvitationMenu([
  { id: 'betrayal:accept' }, { id: 'leave' }, { id: 'silence' }]));
check('unit: empty menu rejected', !isInvitationMenu([]));
const inviteMenu = [
  { id: 'betrayal:accept' }, { id: 'betrayal:decline' }, { id: 'leave' }, { id: 'silence' }];
check('unit: accept at trust 40 (the bar)', pickInviteAnswer(inviteMenu, 40) === 'betrayal:accept',
  `TRUST_ACCEPT_AT=${TRUST_ACCEPT_AT}`);
check('unit: decline at trust 39 (one below the bar)', pickInviteAnswer(inviteMenu, 39) === 'betrayal:decline');
check('unit: accept at trust 90', pickInviteAnswer(inviteMenu, 90) === 'betrayal:accept');
check('unit: decline on unrecorded trust (default 10)', pickInviteAnswer(inviteMenu, undefined) === 'betrayal:decline',
  `TRUST_DEFAULT=${TRUST_DEFAULT}`);
check('unit: decline at trust 0', pickInviteAnswer(inviteMenu, 0) === 'betrayal:decline');
check('unit: rule never returns an id off the menu',
  pickInviteAnswer([{ id: 'betrayal:decline' }], 90) === 'betrayal:decline');

function setupCalm(Game, vid, trust) {
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
  v.trust[vid] = trust;
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
  const { Game } = await loadGame({ seed: 1901, mode: 'establishment-r118-invite-answer-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => String(id) !== String(Game.villagerId));
  if (roster.length < 3) { check('roster has 3+ villagers for accept/decline/control', false, `roster=${roster.length}`); process.exit(1); }
  const [acceptVid, declineVid, controlVid] = roster;
  setupCalm(Game, acceptVid, 90);
  setupCalm(Game, declineVid, 10);
  setupCalm(Game, controlVid, 90);

  // --- control FIRST (no pending anywhere yet): no accept/decline offered.
  let r = Game.startConvo(controlVid);
  check('control: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (r && !r.refused) {
    const ch = Game.convoChoices(controlVid) || [];
    check('control: rule does not fire off-menu', !isInvitationMenu(ch),
      `choices=${ch.map(x => x.id).join(',')}`);
    try { Game.endConvo(controlVid, 'left'); } catch (e) {}
  }

  // --- live accept: pending 'traps' invite at trust 90 — the rule picks accept.
  const histA = setPending(Game, acceptVid, 'traps');
  r = Game.startConvo(acceptVid);
  check('accept: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (!r || r.refused) { process.exit(1); }
  const reached = driveToInvite(Game, acceptVid);
  check('accept: invitation-owned menu reached', reached,
    `choices=${(Game.convoChoices(acceptVid) || []).map(x => x.id).join(',')}`);
  if (reached) {
    const ch = Game.convoChoices(acceptVid) || [];
    check('accept: menu is invitation-owned', isInvitationMenu(ch),
      `choices=${ch.map(x => x.id).join(',')}`);
    const rulePick = pickInviteAnswer(ch, ((Game.state.village.trust || {})[acceptVid]));
    check('accept: rule picks betrayal:accept at trust 90', rulePick === 'betrayal:accept', `pick=${rulePick}`);
    const before = histA.accepted;
    const res = Game.convoTurn(acceptVid, rulePick);
    check('accept: accepted count +1', histA.accepted === before + 1, `accepted=${histA.accepted}`);
    check('accept: pending cleared', histA.pending === null, `pending=${JSON.stringify(histA.pending)}`);
    check('accept: outcome recorded for traps',
      (histA.outcomes || []).some(o => o.defId === 'traps' && ['small', 'reward', 'wild'].includes(o.outcome)),
      `outcomes=${JSON.stringify(histA.outcomes)}`);
    check('accept: a walk line was spoken', !!(res && res.line && res.line.length > 20),
      String(res && res.line || '').slice(0, 100));
  }
  try { Game.endConvo(acceptVid, 'done'); } catch (e) {}

  // --- live decline: pending 'show' invite at trust 10 — the rule picks decline.
  const trustBefore = ((Game.state.village.trust || {})[declineVid] || 0);
  const histD = setPending(Game, declineVid, 'show');
  r = Game.startConvo(declineVid);
  check('decline: convo opened', !!(r && !r.refused), `refused=${r && r.refused}`);
  if (r && !r.refused) {
    const reachedD = driveToInvite(Game, declineVid);
    check('decline: invitation-owned menu reached', reachedD,
      `choices=${(Game.convoChoices(declineVid) || []).map(x => x.id).join(',')}`);
    if (reachedD) {
      const chD = Game.convoChoices(declineVid) || [];
      check('decline: menu is invitation-owned', isInvitationMenu(chD),
        `choices=${chD.map(x => x.id).join(',')}`);
      const rulePickD = pickInviteAnswer(chD, ((Game.state.village.trust || {})[declineVid]));
      check('decline: rule picks betrayal:decline at trust 10', rulePickD === 'betrayal:decline', `pick=${rulePickD}`);
      const resD = Game.convoTurn(declineVid, rulePickD);
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
