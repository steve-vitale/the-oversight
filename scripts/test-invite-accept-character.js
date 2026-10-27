#!/usr/bin/env node
// PROOF (tackle-invite, 2026-10-27, Steve ruling: invitations sometimes
// taken — villagers decide like real people, by character, not never/not
// always, not a flat roll). Before/after proof for the character-driven
// invitation decision.
//
// BEFORE (no npcInviteDecision): party invites already weigh temperament /
// trust / goal / mood, but not relationship or stakes; NPC-to-NPC lure
// takes spring on a flat 0.45 roll in npcPlotTick regardless of character.
// AFTER: one shared npcInviteDecision(invitee, inviter, {kind, stakes})
// supplies temperament, trust, relationship, stakes, goal and mood, clamped
// 5-95, and both channels roll against it.
//
// Method: real-path sweeps with a pinned Math.random (inviteToParty and the
// new decision read Math.random at call time, so pinning controls the roll
// exactly). Lure real-path sweep stubs springAmbush so the sweep measures
// the DECISION gate, not the ambush outcome (ambush outcomes are covered by
// the existing betrayal tests). One unstubbed lure trial at the end shows
// the real narration. Three full conversation transcripts are printed for
// the sense read (NPC wants something, choice engages/deflects, ending
// resolves/plants/owes).
//
// Pre-registered bar (evidence/2026-10-27/tackle-invite-prereg.md):
//  no temperament band 0% or 100% (n>=20); warm/bold band >=15 points
//  above prickly/withdrawn; warm-bond lure takes >=15 points above
//  hostile-bond takes, neither 0/100; party overall 20-85%, lure overall
//  15-75%; sick lure targets never walk out.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('Invite accept character');

function person(G, vid) {
  return (G.data.villagers || []).find(x => x.id === vid) || {};
}
function setProfile(G, vid, prof) {
  const p = person(G, vid);
  p.personality = p.personality || {};
  p.personality.temperament = prof.temp;
  p.goal = prof.goal;
  const v = G.state.village;
  v.trust = v.trust || {};
  v.trust[vid] = prof.trust;
  Object.assign(G.npcNeeds(vid), { hunger: 30, fear: prof.fear, social: 40, energy: 70 });
  v.grief = 0; v.cheer = 0;
  if (prof.bond) {
    v.bonds = v.bonds || {};
    v.bonds[G.bondKey(G.villagerId, vid)] = { v: prof.bond.v, depth: prof.bond.depth, day: 1, dayGain: 0 };
  } else {
    if (v.bonds) delete v.bonds[G.bondKey(G.villagerId, vid)];
  }
  v.sick = v.sick || {};
  if (prof.sick) v.sick[vid] = { daysLeft: 4, severity: 2, id: 'cold' };
  else if (v.sick) delete v.sick[vid];
}
function setPairBond(G, a, b, bond) {
  const v = G.state.village;
  v.bonds = v.bonds || {};
  if (bond) v.bonds[G.bondKey(a, b)] = { v: bond.v, depth: bond.depth, day: 1, dayGain: 0 };
  else delete v.bonds[G.bondKey(a, b)];
}
// Sweep inviteToParty with pinned rolls 0.00..0.99; returns accept count.
function sweepParty(G, vid) {
  const v = G.state.village;
  let acc = 0;
  const real = Math.random;
  try {
    for (let i = 0; i < 100; i++) {
      v.party = []; v.followers = [];
      Math.random = () => i / 100;
      const r = G.inviteToParty(vid);
      if (r && r.ok) acc++;
    }
  } finally { Math.random = real; }
  v.party = []; v.followers = [];
  return acc;
}
// Sweep npcPlotTick with pinned rolls; springAmbush stubbed to a recorder.
function sweepLure(G, inviter, target) {
  const bs = G.betrayalState();
  const orig = G.springAmbush;
  let springs = 0;
  G.springAmbush = function (plot) { plot.sprung = true; plot.active = false; springs++; return { stubbed: true }; };
  const real = Math.random;
  try {
    for (let i = 0; i < 100; i++) {
      bs.plots = [{ id: 'test-plot', active: true, sprung: false, resolved: false,
        day: G.state.scholar.day, inviter, target, leader: inviter,
        accomplices: [inviter], tells: [] }];
      Math.random = () => i / 100;
      G.npcPlotTick();
    }
  } finally { Math.random = real; G.springAmbush = orig; }
  bs.plots = [];
  return springs;
}

(async () => {
  const G = await K.load({ seed: 20261027 });
  K.newRun(G);
  G.state.systemArrived = true;
  G.state.scholar.codexUnlocked = true;
  G.unlockPartySystem();
  const v = G.state.village;
  v.party = []; v.followers = [];
  // Non-backstabber villagers only: the backstabber always-yes branch is a
  // designed plot trap, not a character band (see pre-registration).
  const roster = (v.roster || []).filter(id => id !== G.villagerId);
  const plain = [];
  for (const id of roster) {
    try { if (!G.betrayalIntent(id)) plain.push(id); } catch (e) { plain.push(id); }
  }
  T.ok('at least 4 non-backstabber villagers', plain.length >= 4, 'got ' + plain.length);
  const [warmId, pricklyId, steadyId, cautiousId] = plain;
  const inviterId = plain[4] || plain[0];

  const hasDecision = typeof G.npcInviteDecision === 'function';
  console.log('npcInviteDecision present: ' + hasDecision + ' (false = BEFORE run)');

  // ---- Party profiles (trust held at 60, mood steady, fear low) ----
  const profiles = [
    { name: 'warm/belong+bond', id: warmId, prof: { temp: 'warm', goal: 'belong', trust: 60, fear: 20, bond: { v: 40, depth: 2 } } },
    { name: 'prickly/alone+hostile', id: pricklyId, prof: { temp: 'prickly', goal: 'alone', trust: 60, fear: 20, bond: { v: -40, depth: -2 } } },
    { name: 'steady/protect', id: steadyId, prof: { temp: 'steady', goal: 'protect', trust: 60, fear: 20, bond: null } },
    { name: 'cautious/escape', id: cautiousId, prof: { temp: 'cautious', goal: 'escape', trust: 60, fear: 20, bond: null } },
  ];
  const partyRates = {};
  for (const p of profiles) {
    setProfile(G, p.id, p.prof);
    partyRates[p.name] = sweepParty(G, p.id);
    console.log('PARTY ' + p.name + ': ' + partyRates[p.name] + '/100');
  }
  const partyOverall = Object.values(partyRates).reduce((a, b) => a + b, 0) / 4;
  console.log('PARTY overall: ' + partyOverall + '/100');
  for (const p of profiles) {
    T.ok('party band ' + p.name + ' neither 0 nor 100', partyRates[p.name] > 0 && partyRates[p.name] < 100, partyRates[p.name] + '/100');
  }
  T.ok('party warm/bold band >=15 points above prickly/withdrawn band',
    partyRates['warm/belong+bond'] - partyRates['prickly/alone+hostile'] >= 15,
    partyRates['warm/belong+bond'] + ' vs ' + partyRates['prickly/alone+hostile']);
  T.ok('party overall in 20-85', partyOverall >= 20 && partyOverall <= 85, '' + partyOverall);

  // Fixed-roll separation: same roll, different character -> different answer.
  if (hasDecision) {
    setProfile(G, warmId, profiles[0].prof);
    setProfile(G, pricklyId, profiles[1].prof);
    const dw = G.npcInviteDecision(warmId, G.villagerId, { kind: 'party' });
    const dp = G.npcInviteDecision(pricklyId, G.villagerId, { kind: 'party' });
    console.log('DECISION warm chance=' + dw.chance + ' reasons=' + (dw.reasons || []).join('; '));
    console.log('DECISION prickly chance=' + dp.chance + ' reasons=' + (dp.reasons || []).join('; '));
    T.ok('decision chance clamped 5-95', dw.chance >= 5 && dw.chance <= 95 && dp.chance >= 5 && dp.chance <= 95);
    T.ok('same-roll separation: warm accepts at 0.50, prickly refuses at 0.50',
      G.npcInviteDecision(warmId, G.villagerId, { kind: 'party', roll: 0.50 }).accept === true &&
      G.npcInviteDecision(pricklyId, G.villagerId, { kind: 'party', roll: 0.50 }).accept === false,
      'warm=' + dw.chance + ' prickly=' + dp.chance);
    T.ok('decision accept follows its own chance (roll 0.00 accepts, 0.99 refuses unless clamped)',
      G.npcInviteDecision(warmId, G.villagerId, { kind: 'party', roll: 0.00 }).accept === true &&
      G.npcInviteDecision(pricklyId, G.villagerId, { kind: 'party', roll: 0.99 }).accept === false);
  }

  // ---- Lure profiles (NPC inviter -> NPC target) ----
  // Target character set on the target; inviter is a neutral third villager.
  setProfile(G, warmId, { temp: 'warm', goal: 'belong', trust: 60, fear: 20, bond: null });
  setProfile(G, pricklyId, { temp: 'prickly', goal: 'alone', trust: 60, fear: 20, bond: null });
  setPairBond(G, inviterId, warmId, { v: 40, depth: 2 });
  const lureWarm = sweepLure(G, inviterId, warmId);
  console.log('LURE warm-bond target: ' + lureWarm + '/100');
  setPairBond(G, inviterId, pricklyId, { v: -40, depth: -2 });
  const lureHostile = sweepLure(G, inviterId, pricklyId);
  console.log('LURE hostile-bond target: ' + lureHostile + '/100');
  T.ok('lure warm-bond band neither 0 nor 100', lureWarm > 0 && lureWarm < 100, lureWarm + '/100');
  T.ok('lure hostile-bond band neither 0 nor 100', lureHostile > 0 && lureHostile < 100, lureHostile + '/100');
  T.ok('lure warm-bond >=15 points above hostile-bond', lureWarm - lureHostile >= 15, lureWarm + ' vs ' + lureHostile);
  const lureOverall = (lureWarm + lureHostile) / 2;
  T.ok('lure overall in 15-75', lureOverall >= 15 && lureOverall <= 75, '' + lureOverall);

  // Sick lure target stays home.
  setProfile(G, warmId, { temp: 'warm', goal: 'belong', trust: 60, fear: 20, bond: null, sick: true });
  setPairBond(G, inviterId, warmId, { v: 40, depth: 2 });
  const lureSick = sweepLure(G, inviterId, warmId);
  console.log('LURE sick warm-bond target: ' + lureSick + '/100');
  T.ok('sick lure target never walks out', lureSick === 0, lureSick + '/100');
  delete v.sick[warmId];

  // ---- Transcripts (sense read) ----
  function transcript(vid, choice) {
    G.startConvo(vid);
    const r = G.convoTurn(vid, choice);
    const t = ((r && r.transcript) || G.convoGet(vid).transcript || []).slice();
    try { G.endConvo(vid, 'left'); } catch (e) {}
    return t;
  }
  setProfile(G, warmId, profiles[0].prof);
  v.party = [];
  const realRandom = Math.random; Math.random = () => 0.0;
  const tAccept = transcript(warmId, 'invite_party');
  Math.random = realRandom;
  console.log('\n--- TRANSCRIPT party accept (warm/belong, roll 0.0) ---');
  for (const e of tAccept) console.log('[' + e.who + '] ' + e.text);
  console.log('joined party: ' + G.inParty(warmId));
  v.party = [];
  setProfile(G, pricklyId, profiles[1].prof);
  Math.random = () => 0.99;
  const tRefuse = transcript(pricklyId, 'invite_party');
  Math.random = realRandom;
  console.log('\n--- TRANSCRIPT party refuse (prickly/alone, roll 0.99) ---');
  for (const e of tRefuse) console.log('[' + e.who + '] ' + e.text);
  console.log('joined party: ' + G.inParty(pricklyId));

  // One unstubbed lure trial: forced low roll so the decision accepts, then
  // the real ambush narration runs.
  setProfile(G, warmId, { temp: 'warm', goal: 'belong', trust: 60, fear: 20, bond: null });
  setPairBond(G, inviterId, warmId, { v: 40, depth: 2 });
  const bs = G.betrayalState();
  bs.plots = [{ id: 'test-plot-real', active: true, sprung: false, resolved: false,
    day: G.state.scholar.day, inviter: inviterId, target: warmId, leader: inviterId,
    accomplices: [inviterId], tells: [] }];
  // The godpath harness silences narration (G.log stays empty), so record
  // say() directly for this one real trial.
  const said = [];
  const origSay = G.say;
  G.say = function (msg) { said.push(String(msg)); try { return origSay.call(G, msg); } catch (e) {} };
  Math.random = () => 0.0;
  try { G.npcPlotTick(); } finally { Math.random = realRandom; G.say = origSay; }
  console.log('\n--- LURE real trial (warm-bond target, roll 0.0) ---');
  console.log('plot: ' + JSON.stringify(bs.plots[0] && { sprung: bs.plots[0].sprung, resolved: bs.plots[0].resolved, active: bs.plots[0].active }));
  console.log('target alive on roster: ' + (v.roster || []).includes(warmId));
  for (const line of said) console.log('[say] ' + line);

  T.done();
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
