#!/usr/bin/env node
// test-death-pack-bonded-20261014.js — the player's death pack follows the
// corpses.js rule: only SENTIMENTALS die with the body. A bonded but
// non-sentimental item (bond is non-transferable, but the object is still
// stuff — DECISIONS.md "loot exists") stays on the corpse, lootable.
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('death-pack-bonded');
(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  const s = Game.state.scholar;
  s.inventory = [
    { itemId: 'crowbar', name: 'Crowbar', units: 1, kg: 2, bonded: true, bond: 40, enhancements: [] },
    { itemId: 'knife_roll', name: 'Knife roll', units: 1, kg: 0.8, bonded: true, bond: 0, sentimental: true, enhancements: [] },
  ];
  s.equipped = {};
  let pack = null;
  const orig = Game.registerDeath;
  Game.registerDeath = function (opts) { if (opts && opts.player) pack = opts.items; return orig.apply(this, arguments); };
  try { Game.playerDeath('test'); } finally { Game.registerDeath = orig; }
  const ids = (pack || []).map(i => i.itemId);
  T.ok('death pack was registered', Array.isArray(pack), String(pack));
  T.ok('bonded non-sentimental crowbar stays with the corpse', ids.includes('crowbar'), JSON.stringify(ids));
  T.ok('sentimental knife roll dies with them', !ids.includes('knife_roll'), JSON.stringify(ids));
  const cb = (pack || []).find(i => i.itemId === 'crowbar') || {};
  T.ok('bond does not transfer (pack entry carries no bond)', !cb.bonded && !cb.bond && !(cb.enhancements || []).length);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
