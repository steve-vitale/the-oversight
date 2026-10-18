#!/usr/bin/env node
// test-invite-bond-20261018.js -- journey-social r23 proof: the want/invite
// layer respects bond depth (r22 blank #1: "a -69 rival still invites you to
// 'walk my trap line' warmly").
//   - rival (depth <= -1) pending invites speak the businesslike
//     characterGen.convo.inviteCold[defId] line, not the warm INVITE_DEFS
//     label -- in the spoken beat AND the betrayal:accept menu (INVITATION
//     HONESTY: the menu quotes the label verbatim, so both must agree).
//   - plot lures from rivals travel the same cold branch (indistinguishable
//     by design).
//   - friends/strangers keep the warm label; unknown defIds fall back warm.
//   - rivals never get warm reopeners ("I'm glad it's you...") -- they fall
//     through to the honest exhausted line.
// RED pre-fix -> GREEN post-fix (verify via patch round-trip, never stash).
// Run from repo root: node scripts/test-invite-bond-20261018.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
const t = (name, cond) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name); }
};

async function main() {
  Math.random = mulberry32(4242);
  const { Game } = await loadGame({ seed: 4242, mode: 'test-invite-bond-20261018', fullTelemetry: false });
  await setupGame(Game, 'Chicago, Illinois', null);
  const v = Game.state.village;
  const sid = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== sid);
  t('roster has NPCs', roster.length >= 5);
  const friend = roster[0], rival = roster[1], stranger = roster[2];

  // --- build bonds through the real machinery (r22 pattern) ---
  for (let d = 0; d < 9; d++) {
    Game.state.scholar.day = 10 + d;
    Game.bondAdd(sid, friend, 6, 'test-friend');
  }
  const fb = Game.bondGet(sid, friend);
  t('friend depth banked at 2', fb && fb.depth >= 2);
  Game.state.scholar.day = 20;
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  Game.recordGrievance(rival, sid, 'stolen_from', 20);
  const rb = Game.bondGet(sid, rival);
  t('rival depth banked at -1 or worse', rb && rb.depth <= -1);

  // --- data: inviteCold pool ---
  const cg = (Game.data.characterGen || {}).convo || {};
  const cold = cg.inviteCold || {};
  const defIds = ['look', 'carry', 'air', 'show', 'traps'];
  t('inviteCold covers all 5 invite defs', defIds.every(id => typeof cold[id] === 'string' && cold[id].length > 10));
  const coldTexts = defIds.map(id => cold[id] || '').join(' ');
  t('cold lines are spoken (quoted)', defIds.every(id => /^"/.test(cold[id] || '') && /"$/.test(cold[id] || '')));
  t('no System references in cold lines', !/\bSystem\b/.test(coldTexts));
  const eventWords = /\bremember when\b|\blast summer\b|\bthe day we\b|\bwhen we (first|last)\b/i;
  t('cold lines invent no shared events', !eventWords.test(coldTexts));

  const warmTraps = '"Walk my trap line with me? Extra hands, extra eyes."';
  const coldTraps = cold.traps;
  const inner = (s) => String(s || '').replace(/^"|"$/g, '');

  // --- inviteLabelFor: the shared resolver ---
  t('inviteLabelFor exists', typeof Game.inviteLabelFor === 'function');
  const pendRival = { defId: 'traps', day: 20 };
  const pendFriend = { defId: 'traps', day: 20 };
  const pendStranger = { defId: 'traps', day: 20 };
  t('rival resolves to the cold line', Game.inviteLabelFor(rival, pendRival) === coldTraps);
  t('friend resolves to the warm label', Game.inviteLabelFor(friend, pendFriend) === warmTraps);
  t('stranger resolves to the warm label', Game.inviteLabelFor(stranger, pendStranger) === warmTraps);
  t('rival + unknown defId degrades gracefully (no beat, no crash)',
    Game.inviteLabelFor(rival, { defId: 'nope', day: 20 }) === null);
  const pendPlot = { defId: 'traps', day: 20, plotId: 'plot-1' };
  t('rival plot lure travels the same cold branch', Game.inviteLabelFor(rival, pendPlot) === coldTraps);

  // --- spoken beat: startConvo speaks the resolved label ---
  v.talkRequests = {}; v.grief = 0; v.cheer = 0;
  function startWithPending(vid, defId) {
    Game.inviteHistory(vid).pending = { defId, day: Game.state.scholar.day };
    Game.state.scholar.day = 30;
    const st = Game.startConvo(vid);
    const npcLines = ((st && st.transcript) || [])
      .filter(e => e && (e.who === 'them' || e.who === 'NPC'))
      .map(e => String(e.text || ''));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    return npcLines.join('\n');
  }
  const rivalSaid = startWithPending(rival, 'traps');
  t('rival speaks the cold invite beat', rivalSaid.indexOf(inner(coldTraps)) !== -1);
  t('rival does NOT speak the warm invite beat', rivalSaid.indexOf(inner(warmTraps)) === -1);
  const friendSaid = startWithPending(friend, 'traps');
  t('friend still speaks the warm invite beat', friendSaid.indexOf(inner(warmTraps)) !== -1);

  // --- menu: betrayal:accept quotes the spoken label verbatim ---
  function acceptLabel(vid, defId) {
    Game.inviteHistory(vid).pending = { defId, day: Game.state.scholar.day };
    Game.state.scholar.day = 31;
    Game.startConvo(vid);
    let choices = [];
    try { choices = Game.betrayalChoices(vid) || []; } catch (e) {}
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    const acc = choices.find(c => c && c.id === 'betrayal:accept');
    return acc ? String(acc.label || '') : '';
  }
  const rivalMenu = acceptLabel(rival, 'traps');
  t('rival menu quotes the cold line', rivalMenu.indexOf(inner(coldTraps)) !== -1);
  t('rival menu does NOT quote the warm line', rivalMenu.indexOf(inner(warmTraps)) === -1);
  const friendMenu = acceptLabel(friend, 'traps');
  t('friend menu still quotes the warm line', friendMenu.indexOf(inner(warmTraps)) !== -1);

  // --- reopeners: rivals never get the warm set ---
  // The reopener branch only fires once the small-talk well is dry, and the
  // well drains across sittings (said-ledgers persist past endConvo). Drive
  // many one-day-apart sittings and scan every NPC line.
  const reopeners = (cg.reopeners || []).map(String);
  t('reopeners pool non-empty', reopeners.length >= 5);
  Game.inviteHistory(rival).pending = null;
  Game.inviteHistory(friend).pending = null;
  const rivalAllNpc = [];
  let rivalSittings = 0;
  for (let i = 0; i < 70; i++) {
    try {
      Game.state.scholar.day = 100 + i;
      const st = Game.startConvo(rival);
      const npcLines = ((st && st.transcript) || [])
        .filter(e => e && (e.who === 'them' || e.who === 'NPC'))
        .map(e => String(e.text || ''));
      rivalAllNpc.push(...npcLines);
      rivalSittings++;
      try { Game.endConvo(rival, 'left'); } catch (e) {}
    } catch (e) { break; }
  }
  t('drove enough rival sittings to drain wells (' + rivalSittings + ')', rivalSittings >= 60);
  const warmReopenerHit = rivalAllNpc.filter(l =>
    reopeners.some(r => l.indexOf(String(r).slice(1, -1).slice(0, 24)) !== -1));
  t('rival never got a warm reopener (' + warmReopenerHit.length + ')', warmReopenerHit.length === 0);
  // ...while a stranger CAN (the pool isn't broken, just bond-gated)
  const strangerAllNpc = [];
  for (let i = 0; i < 70; i++) {
    try {
      Game.state.scholar.day = 200 + i;
      const st = Game.startConvo(stranger);
      const npcLines = ((st && st.transcript) || [])
        .filter(e => e && (e.who === 'them' || e.who === 'NPC'))
        .map(e => String(e.text || ''));
      strangerAllNpc.push(...npcLines);
      try { Game.endConvo(stranger, 'left'); } catch (e) {}
    } catch (e) { break; }
  }
  const strangerReopenerHit = strangerAllNpc.filter(l =>
    reopeners.some(r => l.indexOf(String(r).slice(1, -1).slice(0, 24)) !== -1));
  // Informational: strangers may or may not reach the reopener branch in 70
  // sittings (well depth varies); the binding assertion is the rival's zero.
  console.log('  info: stranger warm reopeners seen: ' + strangerReopenerHit.length);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
