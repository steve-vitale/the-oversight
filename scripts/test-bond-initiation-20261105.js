// test-bond-initiation-20261105.js — proof for the bond-initiation build
// (Steve ruling 2026-11-04 22:32: villagers initiate bonds).
// Fixture tests for the analyzer + judge (bars as pre-registered),
// the proposal narration filter, plus live harness tests:
//   - proposeBond accepts (pinned roll) and marks the bond initiated,
//     refuses (pinned roll) with cooldown, refuses the unperceived,
//     refuses a scholar target (the scholar decides in conversation),
//   - pending scholar proposals: stage / accept / decline,
//   - link raises: stage / accept calls proposeLink / decline,
//   - instrument smoke (2-day competent run, 0 instrument errors).
// Determinism leg: BONDINIT_FINGERPRINT=1 prints a 2-day fingerprint;
// run twice in separate processes and diff — never two harnesses in
// one process.
// Usage: node scripts/test-bond-initiation-20261105.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'bond-initiation-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'bond-initiation-instrument-20261105'));

let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
function baseOut(over) {
  return Object.assign({
    seed: 84101, policy: 'competent', run: 'test', leg: 'armed', anchorCommit: 'test',
    days: 90, endReason: 'horizon', won: false, villageLost: false,
    scaleRank: 'village', maxWave: 1,
    daily: [], proposalEvents: [], decisionEvents: [], bondTeleEvents: [],
    linkEvents: [], convoEvents: [], sayLines: [], wrapCounts: {},
    instrumentErrors: [],
  }, over || {});
}
function snap(day, extra) {
  return Object.assign({ day: day, scholarId: 'player', bondsTotal: 0, bondsInitiated: 0,
    bondsInitiatedList: [], bondsAccumulated: 0, bondProposalPairs: 0,
    bondRequestsStaged: 0, linkRaisesStaged: 0, roster: [], livingCount: 10 }, extra || {});
}
function tele(day, initiator, target, kind, outcome, chance) {
  return { day: day, initiator: initiator, target: target, kind: kind, outcome: outcome, chance: chance, reason: null };
}

// --- Analyzer fixtures ---
// 1. summarizeSeed counts person proposals, acceptance, initiated bonds.
eq('summarize person proposals', AN.summarizeSeed(baseOut({
  daily: [snap(90, { bondsTotal: 12, bondsInitiated: 3, bondsAccumulated: 9 })],
  bondTeleEvents: [tele(10, 'v1', 'v2', 'person', 'accepted', 60), tele(12, 'v3', 'v4', 'person', 'refused', 40),
    tele(15, 'v5', 'v6', 'person', 'accepted', 55)],
  proposalEvents: [{ day: 10, fn: 'proposeBond', initiator: 'v1', target: 'v2', kind: 'person', ret: { ok: true, accepted: true, gate: true } }],
})).proposalsPerson, 3);
eq('summarize accept rate', AN.summarizeSeed(baseOut({
  daily: [snap(90)],
  bondTeleEvents: [tele(10, 'v1', 'v2', 'person', 'accepted', 60), tele(12, 'v3', 'v4', 'person', 'refused', 40)],
})).acceptRate, 0.5);
eq('summarize gate fails', AN.summarizeSeed(baseOut({
  daily: [snap(90)],
  proposalEvents: [{ day: 10, fn: 'proposeBond', initiator: 'v1', target: 'v2', kind: 'person', ret: { ok: true, accepted: true, gate: false } }],
})).gateFails, 1);
eq('summarize guard rows are not gate fails', AN.summarizeSeed(baseOut({
  daily: [snap(90)],
  proposalEvents: [{ day: 10, fn: 'proposeBond', initiator: 'v1', target: 'v2', kind: 'person', ret: { ok: false, outcome: 'not-perceived', gate: false } }],
})).gateFails, 0);
eq('summarize link raises', AN.summarizeSeed(baseOut({
  daily: [snap(90)],
  bondTeleEvents: [tele(20, 'v1', null, 'link', 'staged', null), tele(22, 'v2', null, 'link', 'raised', null)],
})).linkRaises, 2);
eq('summarize expired are not proposals', AN.summarizeSeed(baseOut({
  daily: [snap(90, { bondsTotal: 12, bondsInitiated: 0, bondsAccumulated: 12 })],
  bondTeleEvents: [tele(10, 'v1', 'v2', 'person', 'staged', null), tele(12, 'v1', 'v2', 'person', 'expired', null),
    tele(20, 'v1', null, 'link', 'staged', null), tele(22, 'v1', null, 'link', 'expired', null)],
})).proposalsPerson, 1);
eq('summarize expired are not link raises', AN.summarizeSeed(baseOut({
  daily: [snap(90)],
  bondTeleEvents: [tele(20, 'v1', null, 'link', 'staged', null), tele(22, 'v1', null, 'link', 'expired', null)],
})).linkRaises, 1);
eq('summarize per-event scholar beats final scholar', AN.summarizeSeed(baseOut({
  daily: [snap(90, { scholarId: 'gen_new' })],
  bondTeleEvents: [{ day: 10, scholarId: 'gen_old', initiator: 'gen_new', target: 'v2', kind: 'person', outcome: 'staged', chance: null, reason: null }],
})).proposalsPersonNpc, 1);
// 2. judgePanel GO: all bars pass.
eq('judge GO', AN.judgePanel([
  { leg: 'armed', seed: 84101, proposalsPerson: 3, proposalsPersonNpc: 3, accepted: 2, refused: 1, bondsInitiated: 2, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 9 },
  { leg: 'armed', seed: 84102, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 1, refused: 1, bondsInitiated: 1, linkRaises: 1, gateFails: 0, errors: 0, days: 88, bondsAccumulated: 8 },
  { leg: 'armed', seed: 84103, proposalsPerson: 1, proposalsPersonNpc: 1, accepted: 1, refused: 0, bondsInitiated: 1, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 7 },
  { leg: 'armed', seed: 84104, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 0, refused: 2, bondsInitiated: 0, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 10 },
  { leg: 'baseline', seed: 84101, bondsAccumulated: 9, days: 90 },
  { leg: 'baseline', seed: 84102, bondsAccumulated: 8, days: 88 },
  { leg: 'baseline', seed: 84103, bondsAccumulated: 7, days: 90 },
  { leg: 'baseline', seed: 84104, bondsAccumulated: 10, days: 90 },
]).decision, 'GO');
// 3. judgePanel NO-GO: M1 fails (too few seeds with proposals).
eq('judge NO-GO M1', AN.judgePanel([
  { leg: 'armed', seed: 84101, proposalsPerson: 1, proposalsPersonNpc: 1, accepted: 1, refused: 0, bondsInitiated: 1, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 9 },
  { leg: 'armed', seed: 84102, proposalsPerson: 0, proposalsPersonNpc: 0, accepted: 0, refused: 0, bondsInitiated: 0, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 8 },
  { leg: 'armed', seed: 84103, proposalsPerson: 0, proposalsPersonNpc: 0, accepted: 0, refused: 0, bondsInitiated: 0, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 7 },
  { leg: 'armed', seed: 84104, proposalsPerson: 0, proposalsPersonNpc: 0, accepted: 0, refused: 0, bondsInitiated: 0, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 10 },
  { leg: 'baseline', seed: 84101, bondsAccumulated: 9, days: 90 },
  { leg: 'baseline', seed: 84102, bondsAccumulated: 8, days: 90 },
  { leg: 'baseline', seed: 84103, bondsAccumulated: 7, days: 90 },
  { leg: 'baseline', seed: 84104, bondsAccumulated: 10, days: 90 },
]).decision, 'NO-GO');
// 4. judgePanel NO-GO: M6 gate failure.
eq('judge NO-GO M6', AN.judgePanel([
  { leg: 'armed', seed: 84101, proposalsPerson: 3, proposalsPersonNpc: 3, accepted: 2, refused: 1, bondsInitiated: 2, linkRaises: 1, gateFails: 1, errors: 0, days: 90, bondsAccumulated: 9 },
  { leg: 'armed', seed: 84102, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 1, refused: 1, bondsInitiated: 1, linkRaises: 1, gateFails: 0, errors: 0, days: 88, bondsAccumulated: 8 },
  { leg: 'armed', seed: 84103, proposalsPerson: 1, proposalsPersonNpc: 1, accepted: 1, refused: 0, bondsInitiated: 1, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 7 },
  { leg: 'armed', seed: 84104, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 0, refused: 2, bondsInitiated: 0, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 10 },
  { leg: 'baseline', seed: 84101, bondsAccumulated: 9, days: 90 },
  { leg: 'baseline', seed: 84102, bondsAccumulated: 8, days: 88 },
  { leg: 'baseline', seed: 84103, bondsAccumulated: 7, days: 90 },
  { leg: 'baseline', seed: 84104, bondsAccumulated: 10, days: 90 },
]).decision, 'NO-GO');
// 5. judgePanel NO-GO: M5 accumulation regression.
eq('judge NO-GO M5', AN.judgePanel([
  { leg: 'armed', seed: 84101, proposalsPerson: 3, proposalsPersonNpc: 3, accepted: 2, refused: 1, bondsInitiated: 2, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 4 },
  { leg: 'armed', seed: 84102, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 1, refused: 1, bondsInitiated: 1, linkRaises: 1, gateFails: 0, errors: 0, days: 88, bondsAccumulated: 8 },
  { leg: 'armed', seed: 84103, proposalsPerson: 1, proposalsPersonNpc: 1, accepted: 1, refused: 0, bondsInitiated: 1, linkRaises: 0, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 7 },
  { leg: 'armed', seed: 84104, proposalsPerson: 2, proposalsPersonNpc: 2, accepted: 0, refused: 2, bondsInitiated: 0, linkRaises: 1, gateFails: 0, errors: 0, days: 90, bondsAccumulated: 10 },
  { leg: 'baseline', seed: 84101, bondsAccumulated: 9, days: 90 },
  { leg: 'baseline', seed: 84102, bondsAccumulated: 8, days: 88 },
  { leg: 'baseline', seed: 84103, bondsAccumulated: 7, days: 90 },
  { leg: 'baseline', seed: 84104, bondsAccumulated: 10, days: 90 },
]).decision, 'NO-GO');
// 6. SAY_RE: matches the proposal lines, rejects keepsake-bond noise.
eq('say matches stick together', INST.SAY_RE.test('Mara takes Daljit\'s hand. "Stick together, then — watch each other\'s backs."'), true);
eq('say matches stick with me', INST.SAY_RE.test('"Will you stick with me? Watch my back, and I\'ll watch yours?"'), true);
eq('say matches propose a bond', INST.SAY_RE.test('Jorge proposes a bond to Petra.'), true);
eq('say rejects keepsake bond', INST.SAY_RE.test('a keepsake bond with her brother'), false);
eq('say rejects pantry standing', INST.SAY_RE.test('Mara leaves the fish nets standing'), false);

async function live() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 84101, mode: 'bondinit-test', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  const s0 = inst.snapshot();
  eq('smoke snapshot bonds shape', (typeof s0.bondsTotal === 'number' && typeof s0.bondsInitiated === 'number' && typeof s0.bondsAccumulated === 'number'), true);
  eq('smoke snapshot pendings shape', (typeof s0.bondRequestsStaged === 'number' && typeof s0.linkRaisesStaged === 'number'), true);
  await quietLog(async function () { await runDays(Game, competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  eq('smoke instrument errors zero', inst.t.instrumentErrors.length, 0);
  eq('smoke talkTo exercised', (inst.t.wrapCounts.talkTo || 0) >= 1, true);
  inst.uninstall();

  // --- Prepared scene: two villagers who share a fire-group. ---
  const v = Game.state.village;
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  eq('scene has roster', roster.length >= 4, true);
  // Find a same-fire-group pair (perception channel 1).
  let pair = null;
  const groups = v.groups || [];
  for (let gi = 0; gi < groups.length && !pair; gi++) {
    const mem = (groups[gi].members || []).filter(function (id) { return roster.indexOf(id) !== -1; });
    if (mem.length >= 2) pair = [mem[0], mem[1]];
  }
  eq('scene has a fire-group pair', !!pair, true);
  if (pair) {
    const a = pair[0], b = pair[1];
    eq('gate passes for fire-group pair', Game.bondProposalPerceived(a, b).perceived, true);
    // Pinned accept (roll 0.01 beats any chance >= 5).
    const before = (Game.bondGet(a, b) || {}).v || 0;
    const acc = Game.proposeBond(a, b, { roll: 0.01 });
    eq('proposeBond accept ok', acc.ok, true);
    eq('proposeBond accept outcome', acc.accepted, true);
    eq('proposeBond gate true', acc.gate, true);
    const bnd = Game.bondGet(a, b);
    eq('bond marked initiated', !!(bnd && bnd.proposed), true);
    eq('bond proposer recorded', bnd && bnd.proposer, a);
    eq('bond warmth not lower', (bnd && bnd.v) >= before, true);
    // Cooldown: an accepted bond is never re-proposed.
    const again = Game.proposeBond(a, b, { roll: 0.01 });
    eq('accepted bond never re-proposed', again.outcome, 'already-bonded');
  }
  // --- Refusal path on a second pair (pinned refuse, roll 0.99). ---
  let pair2 = null;
  for (let gi = 0; gi < groups.length && !pair2; gi++) {
    const mem = (groups[gi].members || []).filter(function (id) { return roster.indexOf(id) !== -1; });
    if (mem.length >= 2 && !(pair && mem[0] === pair[0] && mem[1] === pair[1])) pair2 = [mem[0], mem[1]];
  }
  if (pair2) {
    const a = pair2[0], b = pair2[1];
    if (Game.bondProposalPerceived(a, b).perceived) {
      const ref = Game.proposeBond(a, b, { roll: 0.99 });
      eq('proposeBond refuse ok', ref.ok, true);
      eq('proposeBond refuse outcome', ref.accepted, false);
      // Cooldown: immediate re-propose is refused as cooling down.
      const cool = Game.proposeBond(a, b, { roll: 0.01 });
      eq('refused pair cools down', cool.outcome, 'cooldown');
    } else {
      console.log('SKIP refusal pair: second fire-group pair not perceived (gate ' + JSON.stringify(Game.bondProposalPerceived(a, b)) + ')');
    }
  } else {
    console.log('SKIP refusal pair: only one fire-group pair on this seed');
  }
  // --- Tuning 3: an unpinned proposeBond decision draws no Math.random. ---
  // (The shared seeded stream feeds the whole sim; a draw per decision
  // swung identical-seed panels — 84102 bonds -29%, 84103 days -18% on
  // the full panel — with no game effect behind the swing.)
  let pair3 = null;
  outer3: for (let i = 0; i < roster.length; i++) {
    for (let j = 0; j < roster.length; j++) {
      if (i === j) continue;
      const x = roster[i], y = roster[j];
      if (pair && ((x === pair[0] && y === pair[1]) || (x === pair[1] && y === pair[0]))) continue;
      if (pair2 && ((x === pair2[0] && y === pair2[1]) || (x === pair2[1] && y === pair2[0]))) continue;
      if (Game.bondProposalPerceived(x, y).perceived) { pair3 = [x, y]; break outer3; }
    }
  }
  if (pair3) {
    const origRandom = Math.random;
    let draws = 0;
    Math.random = function () { draws++; return origRandom(); };
    let res3 = null;
    try { res3 = Game.proposeBond(pair3[0], pair3[1]); } finally { Math.random = origRandom; }
    eq('unpinned decision decides', res3 && res3.ok, true);
    eq('unpinned decision draws no Math.random', draws, 0);
    const res3b = Game.proposeBond(pair3[0], pair3[1]);
    eq('same-day re-propose is the record', res3b.outcome, res3.accepted ? 'already-bonded' : 'cooldown');
  } else {
    console.log('SKIP no-random pair: no third perceived pair on this seed');
  }
  // --- Unperceived pair: different groups, no bond, no gossip, no ally. ---
  let strangers = null;
  outer: for (let i = 0; i < roster.length; i++) {
    for (let j = 0; j < roster.length; j++) {
      if (i === j) continue;
      const g = Game.bondProposalPerceived(roster[i], roster[j]);
      if (!g.perceived) { strangers = [roster[i], roster[j], g]; break outer; }
    }
  }
  if (strangers) {
    const r = Game.proposeBond(strangers[0], strangers[1], { roll: 0.01 });
    eq('unperceived proposal refused', r.outcome, 'not-perceived');
    eq('unperceived proposal not ok', r.ok, false);
  } else {
    console.log('SKIP unperceived pair: every roster pair shares a channel on this seed');
  }
  // --- Scholar target: the scholar decides in conversation, never auto. ---
  if (pair) {
    const r = Game.proposeBond(pair[0], Game.villagerId, { roll: 0.01 });
    eq('scholar target not auto-decided', r.outcome, 'scholar-decides');
  }
  // --- Pending scholar proposal: stage / accept / decline. ---
  // Prepared-scene setup (debug-scenarios idiom: set the state a real
  // game would have built): staging needs the bonds drive live — the
  // villager's bond with the scholar must be warming (15 <= warmth < 50,
  // bondDriveLive). Village trust >= 12 is the staging bar.
  function findBondCand(excludeId) {
    for (let i = 0; i < roster.length; i++) {
      const id = roster[i];
      if (id === excludeId || id === Game.villagerId) continue;
      try {
        if (((Game.state.village.sick || {})[id])) continue;
        if ((((Game.state.village.trust || {})[id]) || 10) < 12) continue;
        // The 2-day smoke run ahead of this scene may already have
        // staged a proposal for this villager (the daily tick working)
        // — the direct stage path needs a clean candidate.
        if (Game.pendingBondProposal && Game.pendingBondProposal(id)) continue;
        const treq = ((Game.state.village.talkRequests || {})[id]);
        if (treq && !treq.delivered) continue;
        const already = Game.bondGet ? Game.bondGet(id, Game.villagerId) : null;
        if (already && ((already.depth || 0) >= 1 || (already.v || 0) >= 50)) continue;
        // Warm the pair's bond into the drive window (scene setup):
        // bondAdd creates the record through the game verb, then the
        // warmth is set to 25 — warming, not yet close.
        try { if (Game.bondAdd) Game.bondAdd(id, Game.villagerId, 6, 'test setup'); } catch (e) {}
        const bnd = Game.bondGet ? Game.bondGet(id, Game.villagerId) : null;
        if (!bnd) continue;
        bnd.v = 25;
        const drive = Game.bondDriveLive ? Game.bondDriveLive(id, Game.villagerId) : null;
        if (drive && drive.live) return id;
      } catch (e) {}
    }
    return null;
  }
  const cand = findBondCand(null);
  if (cand) {
    const staged = Game.stageBondProposal(cand);
    eq('stage bond proposal', !!(staged && staged.vid === cand), true);
    eq('pending bond proposal reads back', !!(Game.pendingBondProposal(cand)), true);
    const res = Game.acceptBondProposal(cand);
    eq('accept pending bond proposal', res.ok, true);
    eq('accepted pending marked initiated', !!((Game.bondGet(cand, Game.villagerId) || {}).proposed), true);
    eq('pending consumed on accept', Game.pendingBondProposal(cand), null);
    const cand2 = findBondCand(cand);
    if (cand2) {
      Game.stageBondProposal(cand2);
      const tBefore = ((Game.state.village.trust || {})[cand2]);
      const dec = Game.declineBondProposal(cand2);
      eq('decline pending bond proposal', dec.ok, true);
      eq('pending consumed on decline', Game.pendingBondProposal(cand2), null);
      const tAfter = ((Game.state.village.trust || {})[cand2]);
      eq('decline costs one trust', (tAfter == null ? null : tAfter), (tBefore == null ? null : Math.max(0, tBefore - 1)));
    } else { console.log('SKIP decline path: no second villager with the bonds drive live'); }
  } else { console.log('SKIP pending path: no villager with village trust >= 12 and the bonds drive live'); }
  // --- Link raise: stage / accept calls proposeLink. ---
  // Prepared-scene setup: the raiser must personally know the village
  // (lore recorded below), hold the build_standing drive (>= 1), and
  // carry village trust >= 20 (the staging bar, set as scene state).
  const ovs = ((Game.state || {}).otherVillages || []);
  if (ovs.length) {
    const target = ovs[0].id;
    let knower = null;
    for (let i = 0; i < roster.length && !knower; i++) {
      const id = roster[i];
      if (id === Game.villagerId) continue;
      try {
        if (((Game.state.village.sick || {})[id])) continue;
        // Same clean-candidate rule as the bond path: the smoke run's
        // daily tick may already have staged a raise for this villager.
        if (Game.pendingLinkRaise && Game.pendingLinkRaise(id)) continue;
        const treq = ((Game.state.village.talkRequests || {})[id]);
        if (treq && !treq.delivered) continue;
        if (Game.recordVillageLore) Game.recordVillageLore(id, target, { how: 'seen-nearby' });
        const w = Game.vgoalWeights ? Game.vgoalWeights(id) : null;
        if (w && (w.build_standing || 0) >= 1) knower = id;
      } catch (e) {}
    }
    if (!knower) { console.log('SKIP link raise: no villager with build_standing >= 1'); }
    else {
      try { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[knower] = 25; } catch (e) {}
      const raised = Game.stageLinkRaise(knower, target);
      eq('stage link raise', !!(raised && raised.vid === knower && raised.villageId === target), true);
      eq('pending link raise reads back', !!(Game.pendingLinkRaise(knower)), true);
      const beforeLinks = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState().length : null;
      const acc = Game.acceptLinkRaise(knower);
      eq('accept link raise resolves', acc.ok, true);
      eq('accept link raise consumes pending', Game.pendingLinkRaise(knower), null);
      if (beforeLinks != null) {
        // proposeLink may decline/counter (courtship) — the call itself is the proof.
        eq('accept link raise called proposeLink', acc.proposed, true);
      }
      // --- Link-raise cooldown: decline, re-stage refused, age, re-stage works. ---
      // Same knower, second village (the cooldown is per villager+village;
      // the accept above already recorded (knower, target) as decided).
      const target2 = (ovs.length > 1) ? ovs[1].id : null;
      if (target2) {
        try { if (Game.recordVillageLore) Game.recordVillageLore(knower, target2, { how: 'seen-nearby' }); } catch (e) {}
        const r2 = Game.stageLinkRaise(knower, target2);
        eq('cooldown stage second raise', !!(r2 && r2.vid === knower && r2.villageId === target2), true);
        const dec2 = Game.declineLinkRaise(knower);
        eq('cooldown decline second raise', dec2.ok, true);
        eq('cooldown re-stage refused', Game.stageLinkRaise(knower, target2), null);
        try {
          const st = Game.state.village.linkRaiseState || {};
          const key = [knower, target2].sort().join('|');
          if (st[key]) st[key].day = (st[key].day || 0) - 15;
        } catch (e) {}
        const r3 = Game.stageLinkRaise(knower, target2);
        eq('cooldown aged re-stage works', !!(r3 && r3.vid === knower && r3.villageId === target2), true);
        Game.declineLinkRaise(knower); // clean up the pending
      } else { console.log('SKIP link cooldown: only one other village on this seed'); }
    }
  } else { console.log('SKIP link raise: no other villages on this seed'); }
  // --- Lore tell: the scholar tells a villager about a village. ---
  if (ovs.length) {
    const tTarget = ovs[0].id;
    try { if (Game.recordVillageLore) Game.recordVillageLore(Game.villagerId, tTarget, { how: 'rumor' }); } catch (e) {}
    let tVid = null;
    for (let i = 0; i < roster.length && !tVid; i++) {
      const id = roster[i];
      if (id === Game.villagerId) continue;
      try {
        const lore = (Game.villageLoreOf ? Game.villageLoreOf(id) : {}) || {};
        if (!lore[tTarget]) tVid = id;
      } catch (e) {}
    }
    if (tVid) {
      const startDay = ((Game.state || {}).scholar || {}).day || 0;
      let told = false;
      for (let d = 0; d <= 40 && !told; d++) {
        try { Game.state.scholar.day = startDay + d; } catch (e) {}
        try {
          Game.maybeTellVillageLore(tVid);
          const lore = (Game.villageLoreOf ? Game.villageLoreOf(tVid) : {}) || {};
          if (lore[tTarget]) told = true;
        } catch (e) {}
      }
      try { Game.state.scholar.day = startDay; } catch (e) {}
      eq('scholar tells villager a village', told, true);
      const entry = (Game.villageLoreOf ? Game.villageLoreOf(tVid) : {})[tTarget] || {};
      eq('tell is secondhand from the scholar', entry.how, 'told');
    } else { console.log('SKIP lore tell: every villager already knows the village'); }
  } else { console.log('SKIP lore tell: no other villages on this seed'); }
  // --- Pair tick: villagers ask EACH OTHER in the wild (daily tick). ---
  let warmPair = null;
  outer2: for (let i = 0; i < roster.length; i++) {
    for (let j = 0; j < roster.length; j++) {
      if (i === j) continue;
      const a = roster[i], b = roster[j];
      if (pair && ((a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]))) continue;
      if (pair2 && ((a === pair2[0] && b === pair2[1]) || (a === pair2[1] && b === pair2[0]))) continue;
      warmPair = [a, b];
      break outer2;
    }
  }
  if (warmPair) {
    try { if (Game.bondAdd) Game.bondAdd(warmPair[0], warmPair[1], 6, 'test setup'); } catch (e) {}
    const wpb = Game.bondGet ? Game.bondGet(warmPair[0], warmPair[1]) : null;
    if (wpb) wpb.v = 25;
    // Direct call on a day the hash gate passes (deterministic per seed).
    const startDay = ((Game.state || {}).scholar || {}).day || 0;
    let passDay = null;
    for (let d = startDay; d <= startDay + 90; d++) {
      try { if (Game.bondRoll && Game.bondRoll('pairtick', d) < 0.08) { passDay = d; break; } } catch (e) {}
    }
    if (passDay == null) { console.log('SKIP pair tick direct: no passing day in 90'); }
    else {
      let directCalls = [];
      const _pb = Game.proposeBond.bind(Game);
      Game.proposeBond = function (a, b, o) { const r = _pb(a, b, o); directCalls.push({ a: a, b: b, ret: r }); return r; };
      try { Game.state.scholar.day = passDay; } catch (e) {}
      Game.npcPairBondTick();
      Game.proposeBond = _pb;
      try { Game.state.scholar.day = startDay; } catch (e) {}
      eq('pair tick proposes', directCalls.length >= 1, true);
      eq('pair tick proposal decides', directCalls.some(function (c) { return c.ret && c.ret.ok; }), true);
    }
    // The tick also runs daily from betrayalDaily — prove the hook by
    // running 60 days and counting tick calls + wild proposeBond rows.
    const inst2 = INST.install(Game);
    let tickCalls = 0;
    const _pt = Game.npcPairBondTick.bind(Game);
    Game.npcPairBondTick = function () { tickCalls++; return _pt(); };
    await quietLog(async function () { await runDays(Game, competent, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    Game.npcPairBondTick = _pt;
    const wildRows = inst2.t.proposalEvents.filter(function (e) { return e.fn === 'proposeBond'; });
    inst2.uninstall();
    eq('pair tick runs daily', tickCalls >= 50, true);
    eq('wild proposeBond calls happen', wildRows.length >= 1, true);
  } else { console.log('SKIP pair tick: no undecided pair to warm'); }
}

(async function () {
  try {
    if (process.env.BONDINIT_FINGERPRINT === '1') {
      const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
      const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
      const { Game } = await loadGame({ seed: 84101, mode: 'bondinit-fingerprint', fullTelemetry: false });
      await setupGame(Game);
      const inst = INST.install(Game);
      await quietLog(async function () { await runDays(Game, competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
      inst.snapshot();
      console.log(JSON.stringify({ seed: 84101, bondsTotal: inst.t.daily[inst.t.daily.length - 1].bondsTotal,
        bondsInitiated: inst.t.daily[inst.t.daily.length - 1].bondsInitiated,
        proposals: inst.t.proposalEvents.length, errors: inst.t.instrumentErrors.length }));
      inst.uninstall();
      return;
    }
    await live();
  } catch (e) {
    fail++;
    console.log('FAIL live: ' + (e && e.stack ? e.stack.slice(0, 800) : e));
  }
  console.log('TOTAL ' + pass + ' pass, ' + fail + ' fail');
  process.exitCode = fail ? 1 : 0;
})().catch(function (e) { console.log('FAIL harness: ' + e.stack); process.exitCode = 1; });
