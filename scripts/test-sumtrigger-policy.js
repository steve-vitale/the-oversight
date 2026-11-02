#!/usr/bin/env node
// test-sumtrigger-policy.js — unit proof for the sum-trigger rule
// (scripts/policies/sumtrigger.js) on stub Game objects. No game
// load, no sim, no RNG. Prereg:
// evidence/2026-11-02/sim-sumtrigger-a-prereg.md.
// Usage: node scripts/test-sumtrigger-policy.js
'use strict';
const assert = require('assert');
const { projectMusterCall } = require('./policies/sumtrigger');

function adult(id, name) { return { id: id, name: name, age: 30, alive: true }; }
function child(id, name) { return { id: id, name: name, age: 10, alive: true }; }

function stubGame(links, villages, volunteers, genMap) {
  return {
    data: { titans: { _coalition: { trustedAt: 70, trustedOpinion: 10, trustedBlades: 6, baseBlades: 2 },
      herald: { minAllies: 10 } } },
    state: { titans: { musters: {}, slain: {} }, village: { roster: [] } },
    villagerId: 'player',
    hierarchyState: () => links,
    _linkOther: (link) => (link.primary === 'haven' ? link.subordinate : link.primary),
    _otherVillage: (vid) => villages[vid] || null,
    genVillageRoster: (ov) => {
      if (genMap && genMap[ov.id]) ov.roster = genMap[ov.id];
      else ov.roster = [];
    },
    titanVolunteers: () => volunteers,
    titanHavenBlades: () => [],
  };
}
function link(vid, trust, opinion, arrears) {
  return { primary: 'haven', subordinate: vid, status: 'active', trust: trust, arrears: arrears || 0 };
}
let n = 0;
function check(name, cond, detail) {
  n++;
  assert.ok(cond, name + (detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''));
  console.log('ok ' + n + ' ' + name);
}

// 1. Trusted link, quota 6, capped by rostered free adults (4).
{
  const G = stubGame([link('v1', 80, 20, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), child('c1', 'C1')] } },
    ['h1', 'h2'], {});
  const p = projectMusterCall(G);
  check('trusted quota 6 capped at 4 free adults', p.links[0].quota === 6 && p.links[0].contribution === 4, p.links[0]);
  check('haven proj min(3, vols 2) = 2', p.havenProj === 2, p);
  check('total 6 < 10 not ready', p.total === 6 && p.ready === false, p);
}
// 2. Untrusted link, quota 2.
{
  const G = stubGame([link('v1', 46, 28, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 28, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3')] } },
    [], {});
  const p = projectMusterCall(G);
  check('untrusted quota 2', p.links[0].quota === 2 && p.links[0].contribution === 2, p.links[0]);
}
// 3. Refusals contribute 0: low trust, bad opinion, arrears (even trusted).
{
  const G = stubGame([link('v1', 20, 30, 0), link('v2', 80, -20, 0), link('v3', 90, 40, 3000)],
    { v1: { id: 'v1', name: 'A', opinion: 30, roster: [adult('a1', 'A1')] },
      v2: { id: 'v2', name: 'B', opinion: -20, roster: [adult('b1', 'B1')] },
      v3: { id: 'v3', name: 'C', opinion: 40, roster: [adult('c1', 'C1')] } },
    [], {});
  const p = projectMusterCall(G);
  check('refusing links all 0', p.links.every((l) => l.wouldRefuse && l.contribution === 0), p.links);
  check('naive counts them, faithful does not', p.naiveTotal === 3 && p.alliesProj === 0, p);
}
// 4. Rosterless link: generation counted (5 adults -> min(6,5)=5),
//    snapFree 0 shows the undercount, generatedNow recorded.
{
  const G = stubGame([link('v1', 90, 30, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 30, roster: null } },
    ['h1'], { v1: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), child('c1', 'C1')] });
  const p = projectMusterCall(G);
  check('rosterless generated, contribution 5', p.links[0].generatedHere && p.links[0].snapFree === 0 && p.links[0].freeAdults === 5 && p.links[0].contribution === 5, p.links[0]);
  check('generatedNow lists the village', p.generatedNow.length === 1 && p.generatedNow[0].villageId === 'v1', p.generatedNow);
}
// 5. Haven cap 3 with 5 volunteers; 0 volunteers -> 0.
{
  const G = stubGame([], {}, ['h1', 'h2', 'h3', 'h4', 'h5'], {});
  const p = projectMusterCall(G);
  check('haven capped at 3', p.havenProj === 3, p);
  const G2 = stubGame([], {}, [], {});
  check('haven 0 with no volunteers', projectMusterCall(G2).havenProj === 0);
}
// 6. No weakest-link veto: 6 + 6 + 2 all count, ready at exactly 10
//    with a 3-blade Haven commit... here 4+4+2=10 allies alone.
{
  const G = stubGame([link('v1', 80, 20, 0), link('v2', 75, 20, 0), link('v3', 46, 28, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4')] },
      v2: { id: 'v2', name: 'B', opinion: 20, roster: [adult('b1', 'B1'), adult('b2', 'B2'), adult('b3', 'B3'), adult('b4', 'B4')] },
      v3: { id: 'v3', name: 'C', opinion: 28, roster: [adult('c1', 'C1'), adult('c2', 'C2')] } },
    [], {});
  const p = projectMusterCall(G);
  check('untrusted link contributes its 2, total 10 ready', p.alliesProj === 10 && p.total === 10 && p.ready === true, p);
}
// 7. Boundary: 9 not ready, 10 ready (via Haven).
{
  const G = stubGame([link('v1', 80, 20, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6')] } },
    ['h1', 'h2'], {});
  const p = projectMusterCall(G);
  check('6 allies + 2 haven = 8 not ready', p.total === 8 && !p.ready, p);
  const G2 = stubGame([link('v1', 80, 20, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4'), adult('a5', 'A5'), adult('a6', 'A6'), adult('a7', 'A7')] } },
    ['h1', 'h2', 'h3'], {});
  const p2 = projectMusterCall(G2);
  check('6 allies + 3 haven... 9 not ready', p2.total === 9 && !p2.ready, p2);
}
// 8. 95423 fork, replayed as a stub: Emberhold arrears refuses, so
//    faithful 6 + haven 3 = 9 NOT ready, while naive hits 10.
{
  const G = stubGame([link('v1', 72, 20, 3000), link('v2', 70, 28, 0), link('v3', 46, 28, 0)],
    { v1: { id: 'v1', name: 'Emberhold', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2'), adult('a3', 'A3'), adult('a4', 'A4')] },
      v2: { id: 'v2', name: 'Stonebridge', opinion: 28, roster: [adult('b1', 'B1'), adult('b2', 'B2'), adult('b3', 'B3'), adult('b4', 'B4')] },
      v3: { id: 'v3', name: 'Hungry', opinion: 28, roster: [adult('c1', 'C1'), adult('c2', 'C2'), adult('c3', 'C3'), adult('c4', 'C4')] } },
    ['h1', 'h2', 'h3'], {});
  const p = projectMusterCall(G);
  check('95423 faithful 6+3=9 not ready', p.alliesProj === 6 && p.total === 9 && !p.ready, p);
  check('95423 naive 10+3=13 would fire', p.naiveTotal === 13, p);
}
// 9. Already-committed faces excluded from free adults.
{
  const G = stubGame([link('v1', 80, 20, 0)],
    { v1: { id: 'v1', name: 'A', opinion: 20, roster: [adult('a1', 'A1'), adult('a2', 'A2')] } },
    [], {});
  G.state.titans.musters = { herald: { allies: [] }, other: { allies: [{ villageId: 'v1', vid: 'a1' }] } };
  // Note: committed set only counts UNSLAIN musters; 'other' is unslain here.
  const p = projectMusterCall(G);
  check('committed face excluded (free 1, not 2)', p.links[0].freeAdults === 1, p.links[0]);
}
console.log('test-sumtrigger-policy: ' + n + ' checks PASS');
