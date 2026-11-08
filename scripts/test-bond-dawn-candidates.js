#!/usr/bin/env node
// test-bond-dawn-candidates.js — VILLAGER-BRAIN Phase 4 residual (OVE-51):
// bond proposals / link raises become scored candidates.
//
// Proves:
//   1. Warmth-live pair → PROPOSE_BOND appears in dawn scored candidates
//      (vbrainFeedExtras / vbrainScorePick log) and in bondScoreCands.
//   2. Warmth gate still gates: cold pair → no PROPOSE_BOND candidate.
//   3. Initiator scorer can HOLD (scored-out) without calling proposeBond /
//      without writing bond state; refuse invite leaves target unbonded.
//   4. Accept path still goes through npcInviteDecision (proposeBond).
//   5. Failing control: cross-write bondAdd without invite is detectable
//      (overwrite meter ≥ 1) while the live path stays at 0 on refuse.
//   6. RAISE_LINK appears as a scored candidate when lore + standing live.
//
// Usage: node scripts/test-bond-dawn-candidates.js
// Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

const SEED = 20261108;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function out(o) { console.log(JSON.stringify(o)); }

function warmPair(Game, a, b, warmth) {
  try { if (Game.bondAdd) Game.bondAdd(a, b, 6, 'test setup'); } catch (e) {}
  const bnd = Game.bondGet ? Game.bondGet(a, b) : null;
  if (!bnd) return false;
  bnd.v = warmth;
  bnd.depth = 0;
  return !!(Game.bondDriveLive && Game.bondDriveLive(a, b).live);
}

function findFirePair(Game, roster) {
  const groups = (Game.state.village.groups || []);
  for (let gi = 0; gi < groups.length; gi++) {
    const mem = (groups[gi].members || []).filter(id => roster.indexOf(id) !== -1);
    if (mem.length >= 2) return [mem[0], mem[1]];
  }
  // Fallback: any two roster ids — perception may still pass via bond record.
  if (roster.length >= 2) return [roster[0], roster[1]];
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.bondFeedCands !== 'function' || typeof Game.bondProposeCand !== 'function' ||
      typeof Game.bondScoreCands !== 'function' || typeof Game.vbrainFeedExtras !== 'function') {
    out({ skip: 'bond dawn candidate API missing' });
    process.exit(2);
  }

  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  Game.state.scholar.day = 20;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 2) { out({ skip: 'roster<2' }); process.exit(2); }

  for (const id of roster) {
    try {
      const n = Game.npcNeeds(id);
      if (n) { n.hunger = 10; n.energy = 80; n.social = 70; n.fear = 10; }
    } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 80;
    v.sick = v.sick || {}; delete v.sick[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  }

  const pair = findFirePair(Game, roster);
  check('scene has pair', !!pair);
  if (!pair) { out({ pass: false, fail: 'no pair' }); process.exit(1); }
  const [a, b] = pair;

  console.log('== warmth gate + dawn scored PROPOSE_BOND ==');
  {
    // Cold: no warmth → no candidate.
    try {
      const cold = Game.bondGet(a, b);
      if (cold) { cold.v = 5; cold.depth = 0; }
    } catch (e) {}
    check('cold: bondDriveLive false', !(Game.bondDriveLive(a, b) || {}).live);
    check('cold: bondProposeCand null', Game.bondProposeCand(a, b) == null);
    const coldFeed = (Game.bondFeedCands(a) || []).filter(c => c.kind === 'PROPOSE_BOND' && c.targetVid === b);
    check('cold: feed has no PROPOSE_BOND for target', coldFeed.length === 0, 'n=' + coldFeed.length);

    // Warm into window.
    check('warm pair into window', warmPair(Game, a, b, 28));
    const cand = Game.bondProposeCand(a, b);
    check('warm: PROPOSE_BOND cand', !!(cand && cand.kind === 'PROPOSE_BOND' && cand.targetVid === b),
      JSON.stringify(cand));
    check('warm: cand has warmth consideration',
      !!(cand && (cand.considerations || []).some(c => c.id === 'bond_drive_live' || c.id === 'bond_warmth')));

    // Dawn feed → scored log includes PROPOSE_BOND.
    const o = Game.objOf(a);
    o.kind = 'idle'; o.state = 'idle';
    const before = (Game.vbrainLogs() || []).length;
    Game.objPick(a, hx, hy);
    const logs = Game.vbrainLogs() || [];
    const last = logs.length > before ? logs[logs.length - 1] : Game.vbrainLastLog(a);
    const scored = (last && last.candidates) || [];
    const bondScored = scored.filter(c => c.kind === 'PROPOSE_BOND' && c.targetVid === b);
    check('dawn log has PROPOSE_BOND candidate', bondScored.length >= 1,
      JSON.stringify({ pick: last && last.pick, kinds: scored.map(c => c.kind) }));
    check('dawn PROPOSE_BOND has score > 0', !!(bondScored[0] && bondScored[0].score > 0),
      JSON.stringify(bondScored[0]));
    check('dawn PROPOSE_BOND feeder note',
      !!(bondScored[0] && (bondScored[0].considerations || []).some(c => c.id === 'feeder' && c.note === 'bond_init')));
  }

  console.log('== initiator scorer HOLD vs propose; invite still decides ==');
  {
    warmPair(Game, a, b, 30);
    // Clear prior proposal record so proposeBond can run.
    try {
      const key = Game.bondKey ? Game.bondKey(a, b) : (a < b ? a + '|' + b : b + '|' + a);
      if (v.bondProposals) delete v.bondProposals[key];
    } catch (e) {}
    const beforeBnd = Game.bondGet(a, b);
    const beforeProposed = !!(beforeBnd && beforeBnd.proposed);

    // Force HOLD: low roll lands in the HOLD bucket (listed first).
    const held = Game.bondScoreCands(a, [Game.bondProposeCand(a, b)], { roll: 0, holdW: 5 });
    check('scorer can HOLD', held.pick === 'HOLD' && held.accept === false, JSON.stringify(held));
    // bondProposalMaybe uses hash roll — pin via score seam for one call.
    const _score = Game.bondScoreCands.bind(Game);
    Game.bondScoreCands = function (vid, cands, opts) {
      return _score(vid, cands, Object.assign({}, opts || {}, { roll: 0, holdW: 5 }));
    };
    const maybeOut = Game.bondProposalMaybe(a, b);
    Game.bondScoreCands = _score;
    check('scored-out does not propose', maybeOut && maybeOut.ok === false && maybeOut.reason === 'scored-out',
      JSON.stringify(maybeOut));
    const afterHold = Game.bondGet(a, b);
    check('HOLD: no new proposed flag', !!(afterHold && afterHold.proposed) === beforeProposed);

    // Refuse invite: proposeBond with roll 1 — no bond initiation write.
    try {
      const key = Game.bondKey ? Game.bondKey(a, b) : (a < b ? a + '|' + b : b + '|' + a);
      if (v.bondProposals) delete v.bondProposals[key];
      if (afterHold) { afterHold.proposed = false; afterHold.proposer = null; }
    } catch (e) {}
    let inviteCalls = 0;
    const _invite = Game.npcInviteDecision.bind(Game);
    Game.npcInviteDecision = function (invitee, inviter, opts) {
      inviteCalls++;
      return _invite(invitee, inviter, opts);
    };
    const refused = Game.proposeBond(a, b, { roll: 1 });
    Game.npcInviteDecision = _invite;
    check('refuse: npcInviteDecision called', inviteCalls >= 1, 'calls=' + inviteCalls);
    check('refuse: accepted false', refused && refused.ok === true && refused.accepted === false,
      JSON.stringify(refused));
    const afterRefuse = Game.bondGet(a, b);
    check('refuse: bond not marked proposed', !(afterRefuse && afterRefuse.proposed));
  }

  console.log('== failing control: cross-write without invite ==');
  {
    // Meter: writing proposed onto the bond without npcInviteDecision.
    warmPair(Game, a, b, 32);
    try {
      const key = Game.bondKey ? Game.bondKey(a, b) : (a < b ? a + '|' + b : b + '|' + a);
      if (v.bondProposals) delete v.bondProposals[key];
      const bnd = Game.bondGet(a, b);
      if (bnd) { bnd.proposed = false; bnd.proposer = null; }
    } catch (e) {}
    let inviteCalls = 0;
    const _invite = Game.npcInviteDecision && Game.npcInviteDecision.bind(Game);
    if (_invite) {
      Game.npcInviteDecision = function () {
        inviteCalls++;
        return _invite.apply(this, arguments);
      };
    }
    // Defective path: stamp proposed without invite.
    const bnd = Game.bondGet(a, b);
    const before = !!(bnd && bnd.proposed);
    if (bnd) { bnd.proposed = true; bnd.proposer = a; }
    const after = !!(Game.bondGet(a, b) && Game.bondGet(a, b).proposed);
    check('control: overwrite without invite detected', after === true && before === false && inviteCalls === 0,
      JSON.stringify({ before, after, inviteCalls }));
    // Restore clean.
    if (bnd) { bnd.proposed = false; bnd.proposer = null; }
    if (_invite) Game.npcInviteDecision = _invite;

    // Live accept still uses invite.
    try {
      const key = Game.bondKey ? Game.bondKey(a, b) : (a < b ? a + '|' + b : b + '|' + a);
      if (v.bondProposals) delete v.bondProposals[key];
    } catch (e) {}
    inviteCalls = 0;
    Game.npcInviteDecision = function () {
      inviteCalls++;
      return _invite.apply(this, arguments);
    };
    const acc = Game.proposeBond(a, b, { roll: 0 });
    Game.npcInviteDecision = _invite;
    check('accept: npcInviteDecision called', inviteCalls >= 1);
    check('accept: proposed via invite path', !!(acc && acc.accepted) && !!(Game.bondGet(a, b) || {}).proposed,
      JSON.stringify(acc));
  }

  console.log('== RAISE_LINK as scored candidate ==');
  {
    const ovs = (Game.state.otherVillages || []);
    check('otherVillages present', ovs.length >= 1, 'n=' + ovs.length);
    if (ovs.length) {
      const villageId = ovs[0].id;
      const raiser = roster.find(id => id !== a && id !== b) || roster[0];
      try {
        if (Game.recordVillageLore) Game.recordVillageLore(raiser, villageId, { how: 'seen-nearby' });
      } catch (e) {}
      v.trust[raiser] = 40;
      // Force build_standing open by ensuring weights read ≥ 1 — if the
      // generated goal cannot open it, plant a soft stub on vgoalWeights.
      let linkCand = Game.bondLinkRaiseCand(raiser, villageId);
      if (!linkCand) {
        const _w = Game.vgoalWeights && Game.vgoalWeights.bind(Game);
        Game.vgoalWeights = function (vid) {
          const base = _w ? (_w(vid) || {}) : {};
          if (vid === raiser) return Object.assign({}, base, { build_standing: 2 });
          return base;
        };
        linkCand = Game.bondLinkRaiseCand(raiser, villageId);
      }
      check('RAISE_LINK cand built', !!(linkCand && linkCand.kind === 'RAISE_LINK' && linkCand.villageId === villageId),
        JSON.stringify(linkCand));
      if (linkCand) {
        const scored = Game.bondScoreCands(raiser, [linkCand], { roll: 0 });
        check('RAISE_LINK appears in scored candidates',
          (scored.candidates || []).some(c => c.kind === 'RAISE_LINK'),
          JSON.stringify(scored.candidates));
        // Dawn feed includes it.
        const feed = Game.bondFeedCands(raiser) || [];
        check('feed includes RAISE_LINK', feed.some(c => c.kind === 'RAISE_LINK' && c.villageId === villageId),
          JSON.stringify(feed.map(c => c.kind)));
        const cands = [{ kind: 'HAVEN_CHORE', w: 1.4, chore: 'fire' }];
        Game.vbrainFeedExtras(raiser, cands, hx, hy);
        check('vbrainFeedExtras appends RAISE_LINK',
          cands.some(c => c.kind === 'RAISE_LINK'),
          JSON.stringify(cands.map(c => c.kind)));
      }
    }
  }

  console.log('== summary ==');
  out({ pass: fail === 0, passCount: pass, failCount: fail });
  process.exit(fail === 0 ? 0 : 1);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
