'use strict';
// Prepared offer/choice proof. Natural access and survival come from the panels.
const K = require('./lib'), T = K.reporter('undying-access');
(async () => {
  const G = await K.load({ seed: 17 });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  G.state.systemArrived = true;
  s.abilities = []; s.abilityChoices = null; s.levelUpQueue = [];
  const npc = v.roster.find(id => id !== G.villagerId);
  v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[npc] = [];
  const kit = G.trackData().kits.strange;
  const early = new Set(kit.slice(0, 6)), seen = { player: new Set(), npc: new Set() };
  const rng = Math.random; let calls = 0, first = null, legal = true, stable = true;
  Math.random = () => { calls++; return rng(); };
  try {
    for (let level = 1; level <= 200; level++) {
      const p = G.levelUpOffers('strange', level).map(x => x.id);
      const n = G.villagerLevelUpOffers(npc, 'strange', level);
      stable = stable && p.join() === G.levelUpOffers('strange', level).map(x => x.id).join() && n.join() === G.villagerLevelUpOffers(npc, 'strange', level).join();
      legal = legal && [p, n].every(o => o.length === 3 && new Set(o).size === 3 && o.every(id => early.has(id)));
      p.forEach(id => seen.player.add(id)); n.forEach(id => seen.npc.add(id));
      if (first == null && p.includes('second_wind')) first = level;
    }
  } finally { Math.random = rng; }
  T.ok('actual player and NPC sheets can offer Second Wind without prior magic', seen.player.has('second_wind') && seen.npc.has('second_wind'));
  T.ok('three distinct offers remain inside the initial six-entry window', legal);
  T.ok('offers remain deterministic and consume no shared random draws', stable && calls === 0, calls);
  T.ok('this lever does not pull Molt into a fresh holder\'s window', !seen.player.has('molt') && !seen.npc.has('molt'));
  if (first != null) {
    s.levelUpQueue = [{ track: 'strange', level: first, xp: 100 }];
    G.pumpLevelUps();
    const choice = (s.abilityChoices || []).find(x => x.id === 'second_wind');
    if (choice) G.chooseAbility(choice.id);
  }
  T.ok('the real level-up choice installs the offered passive in a magic slot', G.hasAbility('second_wind') && s.abilities.some(a => (a.id || a) === 'second_wind'));
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
