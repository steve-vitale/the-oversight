#!/usr/bin/env node
'use strict';
const K = require('../../scripts/godpath/lib'), T = K.reporter('network-commit-lock');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  const st = G.state.titans = { omens: { the_network: { stage: 2 } }, musters: { the_network: { allies: [], haven: [], outfitted: {} } }, slain: {}, campaigns: { network: { summoned: true, started: false, idx: 0, cleared: [], tiles: {} } } };
  const m = st.musters.the_network, c = st.campaigns.network;
  T.ok('before marching the real commitment button is offered', G.titanSelfActions().some(a => a.id === 'titan:commit:the_network'));
  T.ok('pre-march first tap requests confirmation', G.titanCommitOwn('the_network') === 'confirm' && m.haven.length === 0);
  const pending = st.pendingCommit, volunteers = G.titanVolunteers().length;
  // Unit fixture for the boundary between the first and second tap.
  c.started = true; c.idx = 1; c.cleared = ['mast_nw'];
  T.ok('started march hides new Haven commitment', !G.titanSelfActions().some(a => a.id === 'titan:commit:the_network'));
  T.ok('starting the march invalidates the pending second tap', G.titanCommitOwn('the_network') === null && m.haven.length === 0);
  T.ok('stale Network confirmation is cleared', !!pending && st.pendingCommit === null);
  T.ok('rejected commitment leaves workforce and volunteers unchanged', !Object.keys(G.state.village.titanCommitted || {}).length && G.titanVolunteers().length === volunteers);
  T.ok('public self action cannot bypass the lock', G.titanSelfDo('titan:commit:the_network') == null && m.haven.length === 0);
  T.ok('started march also retains the foreign call lock', G.soundTitanCall('the_network') === null && m.allies.length === 0);
  st.pendingCommit = 'finale:another-confirmation'; G.titanCommitOwn('the_network');
  T.ok('Network refusal preserves a different campaign confirmation', st.pendingCommit === 'finale:another-confirmation');
  // Separate pre-start case in the same shared game: real two-tap commitment.
  c.started = false; st.pendingCommit = null;
  G.titanCommitOwn('the_network'); G.titanCommitOwn('the_network');
  T.ok('pre-march second tap still commits three actual people', m.haven.length === 3 && m.haven.every(h => G.state.village.titanCommitted[h.vid] === 'the_network'));
  c.started = true; G.titanCommitOwn('the_network'); G.titanCommitOwn('the_network');
  T.ok('repeated in-march taps never add replacements', m.haven.length === 3 && Object.keys(G.state.village.titanCommitted).length === 3);
  st.omens.finale = { stage: 2 }; st.campaigns.finale = { started: true, crew: true, opening: false };
  st.musters.finale = { allies: [], haven: [], outfitted: {} };
  G.titanCommitOwn('finale'); G.titanCommitOwn('finale');
  T.ok('Finale retains its allowed new Haven commitments', st.musters.finale.haven.length === 3);
  // Policy-only survivor/food fixtures: no played-node or natural-food claim.
  const P = require('../../scripts/policies/campaigner'), v = G.state.otherVillages[0];
  G.genVillageRoster(v);
  const faces = v.roster.filter(r => r.alive && r.age >= 18).slice(0, 6);
  st.musters.the_network = { allies: faces.map(r => ({ vid: r.id, villageId: v.id, name: r.name, hp: 100, outfitted: [] })), haven: [], outfitted: {} };
  G.state.scholar.inventory = [{ name: 'Prepared meals', units: 8, kcalEach: 1000, safe: true, edible: true, foodKind: 'plant', foodState: 'cooked', spoilDay: 9999 }];
  G.state.village.pantryKcal = 0;
  st.slain.finale = true; c.idx = 1;
  const road = { notes: [], _campaignCouncil: { the_network: true } }; P.road(G, road);
  T.ok('later-node policy uses survivor floor instead of initial twenty-person food gate', faces.length >= 5 && road.campaignMissingTarget === 1 && !road.campaignFoodBlocked);
  T.ok('later Network road never recruits fresh blades', !road.campaignCalls && !road.campaignOwnCommitments);
  c.idx = 8; G.state.scholar.inventory[0].units = 12;
  const heartRoad = { notes: [], _campaignCouncil: { the_network: true } }; P.road(G, heartRoad);
  T.ok('heart policy still enforces the ten-survivor floor', heartRoad.campaignStrengthBlocked === 1 && !heartRoad.campaignMissingTarget);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
