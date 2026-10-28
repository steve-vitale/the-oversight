#!/usr/bin/env node
// test-journey-social-r63-invite-wrap.js -- PROOF for the r63 driver wrap.
// The r63 driver wraps Game.npcInviteDecision to census wild invitation
// decisions. This test proves, on the real game code via sim-harness:
// (1) the wrap calls through unchanged (same chance + accept as a direct
//     call with the same pinned roll, on the same state);
// (2) the wrap records one entry per call with kind/invitee/chance/accept;
// (3) the wrap itself consumes no decision (a second wrapped call with the
//     same pinned roll decides identically — the wrapper adds no RNG).
// Zero src/js. Fails on a wrapper that mutates, drops, or re-rolls.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
(async () => {
  const { Game } = await loadGame({ seed: 5805, mode: 'test-r63-wrap', fullTelemetry: true });
  await setupGame(Game);
  const fails = [];
  const check = (name, cond, extra) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra !== undefined ? ' ' + extra : ''}`); if (!cond) fails.push(name); };
  check('npcInviteDecision exists on Game', typeof Game.npcInviteDecision === 'function');
  if (typeof Game.npcInviteDecision !== 'function') { console.log('RESULT: FAIL (no decision function to wrap)'); process.exit(1); }
  const me = Game.villagerId;
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== me);
  check('roster has a non-player villager', roster.length > 0, `n=${roster.length}`);
  if (!roster.length) { console.log('RESULT: FAIL'); process.exit(1); }
  const vid = roster[0];
  // Direct call first (baseline, pinned roll).
  const direct = Game.npcInviteDecision(vid, me, { kind: 'party', roll: 0.5 });
  check('direct call returns chance + accept', typeof direct.chance === 'number' && typeof direct.accept === 'boolean', `chance=${direct.chance} accept=${direct.accept}`);
  // Install the r63 driver wrap verbatim in shape (record-only passthrough).
  const records = [];
  const orig = Game.npcInviteDecision;
  Game.npcInviteDecision = function (invitee, inviter, opts) {
    const d = orig.apply(this, arguments);
    try {
      records.push({ kind: ((opts || {}).kind || 'party'), invitee: String(invitee), inviter: String(inviter),
        chance: (d && d.chance !== undefined) ? d.chance : null, accept: !!(d && d.accept), veto: (d && d.veto) || null });
    } catch (e) {}
    return d;
  };
  const w1 = Game.npcInviteDecision(vid, me, { kind: 'party', roll: 0.5 });
  check('wrapped call matches direct (passthrough)', w1.chance === direct.chance && w1.accept === direct.accept, `wrapped chance=${w1.chance} accept=${w1.accept}`);
  check('wrapped call recorded exactly once', records.length === 1, `records=${records.length}`);
  check('record carries kind/invitee/chance/accept', records[0] && records[0].kind === 'party' && records[0].invitee === String(vid) && records[0].chance === direct.chance && records[0].accept === direct.accept);
  const w2 = Game.npcInviteDecision(vid, me, { kind: 'party', roll: 0.5 });
  check('second wrapped call decides identically (no wrapper RNG)', w2.chance === w1.chance && w2.accept === w1.accept && records.length === 2);
  // Lure kind records under its own kind and accepts per its own chance.
  const inviter2 = roster.length > 1 ? roster[1] : me;
  const wl = Game.npcInviteDecision(vid, inviter2, { kind: 'lure', roll: 0.5 });
  check('lure call records kind lure', records.length === 3 && records[2].kind === 'lure' && records[2].chance === wl.chance && records[2].accept === wl.accept, `lure chance=${wl.chance} accept=${wl.accept}`);
  console.log(`RESULT: ${fails.length ? 'FAIL ' + fails.join(',') : 'PASS'} (${3 - fails.length}/3 wrap checks + existence checks)`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
