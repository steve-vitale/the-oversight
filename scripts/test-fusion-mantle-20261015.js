// PROOF TEST: the fusion singularity survives the mantle (2026-10-15).
//
// Steve 2026-10-12 (evidence/2026-10-12/fusion-reactor.md): "it's supposed
// to be rare and only affect a single one of the villagers" / "it's a
// permanent ability that can't be swapped out." The rule as built: one
// reactor per world; the flag is set on install and never cleared, death
// included ("the reactor goes with the body; the flag stays, so no second
// reactor ever rises").
//
// Diagnosis (evidence/2026-10-15/diagnosis-progression.md, issue 4): the
// 64-seed dashboard had the final bearer holding fusion_reactor in 35/64
// runs. Probes on seeds 7 and 42: the first bearer installs a pellet, dies,
// and the successor installs a SECOND reactor the next day. Two holes:
//   (a) villager-build.js mantleBecome cleared state.fusionReactorHolder
//       when the bearer died ("a dead bearer's reactor is free again"),
//       which reopened the offer. The old singularity test swapped the
//       scholar by hand and never ran the real mantle.
//   (b) alienPlayers.js apWackyGift (care packages, show prizes) drew
//       fusion_pellet with no singularity filter, unlike rollAlienLoot, so
//       new installable pellets kept arriving.
//
// RED on master: (a) and (b) fail. GREEN after the fix.
'use strict';
const K = require('./godpath/lib');

(async () => {
  const T = K.reporter('fusion-mantle');
  const G = await K.load({ seed: 20261015 });
  K.newRun(G);
  G.state.systemArrived = true;
  const s = G.state.scholar;
  s.abilities = [];
  const pellet = () => ({ itemId: 'fusion_pellet', name: 'Fusion pellet', units: 1, kg: 0.1 });
  s.inventory = (s.inventory || []).concat([pellet()]);
  s.abilities.push({ id: 'fusion_reactor', name: 'Fusion Reactor', desc: '', level: 1, xp: 0 });
  G.abilityOnAcquire('fusion_reactor');
  const firstBearer = G.villagerId;
  const h0 = G.state.fusionReactorHolder;
  T.ok('install sets the holder flag', !!(h0 && h0.who === 'player' && h0.vid === firstBearer), JSON.stringify(h0));

  // (a) the bearer dies through the real path (ledger.js playerDeath -> mantleBecome)
  G.playerDeath('a proof test');
  T.ok('a successor took the mantle', !G.over && G.villagerId && G.villagerId !== firstBearer, 'villagerId=' + G.villagerId + ' over=' + G.over);
  T.ok('successor holds no reactor (it went with the body)', !(G.state.scholar.abilities || []).some(a => ((a && a.id) || a) === 'fusion_reactor'));
  T.ok('the flag survives the real mantle (no second reactor)', !!G.state.fusionReactorHolder, JSON.stringify(G.state.fusionReactorHolder));
  G.state.scholar.inventory = (G.state.scholar.inventory || []).concat([pellet()]);
  G.state.scholar.abilityChoices = null;
  G.state.scholar.abilities = [];
  T.ok('successor with a pellet gets no reactor offer', G.maybeOfferFusionReactor() === false);
  T.ok('no pending reactor sheet', !((G.state.scholar.abilityChoices || []).some(c => ((c && c.id) || c) === 'fusion_reactor')));

  // a villager holder who becomes the bearer keeps their reactor as the bearer's
  {
    const vid = (G.state.village.roster || []).find(id => id !== G.villagerId);
    G.state.fusionReactorHolder = { who: 'villager', vid, day: 1 };
    G.mantleBecome(G.villagerId, vid);
    const h = G.state.fusionReactorHolder;
    T.ok('villager holder who takes the mantle: the reactor becomes the bearer\'s', !!(h && h.who === 'player' && h.vid === vid), JSON.stringify(h));
  }

  // (b) System gifts never hand out an installable pellet once the reactor is taken
  {
    let pellets = 0;
    for (let i = 0; i < 400; i++) { const g = G.apWackyGift(1); if (g && g.id === 'fusion_pellet') pellets++; }
    T.ok('apWackyGift draws no fusion_pellet while the reactor is taken', pellets === 0, pellets + '/400');
    const keep = G.state.fusionReactorHolder;
    G.state.fusionReactorHolder = null;
    let free = 0;
    for (let i = 0; i < 400; i++) { const g = G.apWackyGift(1); if (g && g.id === 'fusion_pellet') free++; }
    G.state.fusionReactorHolder = keep;
    T.ok('before anyone holds it, a gift can still be a pellet (the offer path stays reachable)', free > 0, free + '/400');
  }
  T.done();
})().catch(e => { console.error(e); process.exit(1); });
