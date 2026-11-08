#!/usr/bin/env node
// PROOF (journey-endgame r156, 2026-11-07): party-invite refusal variety.
// FINDING (pilot seed 89701, pre-fix corpus perseed-endgame-r156/):
// six low-trust villagers refused a party invite with the IDENTICAL
// sentence — "I don't know you well enough for that. Ask me again when
// we've survived something together." — and three villager-initiated bond
// proposals refused with one stock line each. The party-join refusal in
// party.js inviteToParty was a single line per branch (the bond-initiation
// refusals already draw from a 3-variant pool via bondPick, so they are
// NOT the defect — 2/3 sharing one variant across different pairs is
// expected from a 3-pool).
//
// FIX (party.js only, SAY text): each refusal branch is a 3-line pool
// picked by _hashStr(vid:branch:day) — a pure function of villager,
// branch and day, never Math.random — so the pick consumes no
// seeded-stream draw and cannot swing identical-seed trajectories.
// No decision, trust, or mechanics change.
//
// BAR: for each of the four refusal branches, across (villager x day)
// samples with a forced-refusal roll, at least 2 distinct lines appear
// (the 3-pools make 3 the expectation), the original line still appears
// at least once, and the same (villager, day) repeats the same line
// (deterministic pick). RED check: run against pre-fix party.js — the
// variety assertions fail (1 distinct line per branch).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('Invite refusal variety r156');

const ORIG = {
  alone: `"I work alone. Nothing personal. ...It's a little personal."`,
  lowtrust: `"I don't know you well enough for that. Ask me again when we've survived something together."`,
  cautious: `"Out there? With YOU leading? ...Let me think about it."`,
  busy: `"Not right now. I've got my own things to handle."`,
};

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
  Object.assign(G.npcNeeds(vid), { hunger: 30, fear: 20, social: 40, energy: 70 });
  v.grief = 0; v.cheer = 0;
  if (v.bonds) delete v.bonds[G.bondKey(G.villagerId, vid)];
  v.sick = v.sick || {};
  delete v.sick[vid];
}

// One forced-refusal invite; returns the refusal line or null.
function refuseLine(G, vid) {
  const v = G.state.village;
  v.party = []; v.followers = [];
  const real = Math.random;
  Math.random = () => 0.99; // above the 95 clamp: the decision refuses
  let r;
  try { r = G.inviteToParty(vid); } finally { Math.random = real; }
  v.party = []; v.followers = [];
  if (!r || r.ok) return null;
  return r.msg;
}

(async () => {
  const G = await K.load({ seed: 20261107 });
  K.newRun(G);
  G.state.systemArrived = true;
  G.state.scholar.codexUnlocked = true;
  G.unlockPartySystem();
  const v = G.state.village;
  v.party = []; v.followers = [];
  const roster = (v.roster || []).filter(id => id !== G.villagerId);
  const plain = [];
  for (const id of roster) {
    try { if (!G.betrayalIntent(id)) plain.push(id); } catch (e) { plain.push(id); }
  }
  T.ok('at least 4 non-backstabber villagers', plain.length >= 4, 'got ' + plain.length);

  const branches = [
    { name: 'alone', prof: { temp: 'steady', goal: 'alone', trust: 60 } },
    { name: 'lowtrust', prof: { temp: 'steady', goal: 'protect', trust: 25 } },
    { name: 'cautious', prof: { temp: 'cautious', goal: 'protect', trust: 60 } },
    { name: 'busy', prof: { temp: 'steady', goal: 'protect', trust: 60 } },
  ];
  const days = [1, 2, 3];
  for (const b of branches) {
    const lines = new Set();
    let refusals = 0;
    for (const vid of plain) {
      setProfile(G, vid, b.prof);
      for (const d of days) {
        G.state.scholar.day = d;
        const line = refuseLine(G, vid);
        if (line == null) continue;
        refusals++;
        lines.add(line);
      }
    }
    console.log('BRANCH ' + b.name + ': refusals=' + refusals + ' distinct=' + lines.size + ' lines=' + JSON.stringify([...lines]));
    T.ok('branch ' + b.name + ' refuses (forced roll)', refusals >= plain.length, refusals + ' refusals');
    T.ok('branch ' + b.name + ' varies (>=2 distinct lines)', lines.size >= 2, lines.size + ' distinct');
    T.ok('branch ' + b.name + ' keeps the original line', lines.has(ORIG[b.name]), 'original ' + (lines.has(ORIG[b.name]) ? 'present' : 'MISSING'));
  }

  // Determinism: same (villager, day) repeats the same line.
  setProfile(G, plain[0], branches[1].prof);
  G.state.scholar.day = 2;
  const first = refuseLine(G, plain[0]);
  const second = refuseLine(G, plain[0]);
  T.ok('same villager+day repeats the same line', first !== null && first === second, JSON.stringify(first) + ' vs ' + JSON.stringify(second));

  // The spoken line is the returned line (the player hears the refusal).
  const said = [];
  const origSay = G.say;
  G.say = function (msg) { said.push(String(msg)); try { return origSay.call(G, msg); } catch (e) {} };
  setProfile(G, plain[1] || plain[0], branches[1].prof);
  G.state.scholar.day = 1;
  const spoken = refuseLine(G, plain[1] || plain[0]);
  G.say = origSay;
  T.ok('refusal is spoken aloud (say == returned msg)',
    spoken !== null && said.some(s => s.includes(spoken)), 'said=' + JSON.stringify(said.slice(-1)) + ' msg=' + JSON.stringify(spoken));

  T.done();
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
