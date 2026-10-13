#!/usr/bin/env node
// scripts/test-carcass-haul-r11.js — proof tests for the carcass-haul policy
// layer (longsim scale-wall r11, 2026-10-13).
// Proves:
//  (1) haulCorpses loots an in-range monster corpse (carcass -> pack)
//  (2) haulCorpses does NOT loot out-of-range corpses (other node)
//  (3) haulCorpses does NOT loot while a fight is live (mid-fight guard)
//  (4) haulCorpses skips person corpses and meat_human (trembles)
//  (5) withHaul delegates the base policy AND adds the r10 chain:
//      upkeep hauls, daily cautious-tests one flesh/day (meatseek pace)
//  (6) the baseline (no haul layer) does NOT haul at upkeep — the RED test:
//      on pristine code this is the behavior; it must FAIL if the haul
//      layer ever claims to be present but isn't wired
//  (7) runMeatAudit accepts an extended registry and the killer-split
//      census fields exist on rows (policy-addressable pool measurement)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { belongseek } = require('./policies/belongseek');
const { withHaul, haulCorpses, belongseekHaul } = require('./policies/haul');
const { runMeatAudit } = require('./meat-discovery-20261013');

function carcassItem(mid, kcal) {
  return { plantId: 'meat_' + mid, foodKind: 'meat', foodState: 'carcass',
    edible: false, units: 1, kcalEach: 0, hiddenKcal: kcal,
    spoilDay: 99, kg: 1.0, name: 'Carcass' };
}
function rigCorpse(Game, opts) {
  opts = opts || {};
  const s = Game.state.scholar;
  const node = opts.node || { x: Game.map.px, y: Game.map.py };
  const c = {
    id: 'probe-corpse-' + Math.floor(Math.random() * 1e9),
    kind: opts.kind || 'monster', monsterId: opts.mid || 'hushwolf',
    node, mx: opts.mx != null ? opts.mx : (s.mx != null ? s.mx : 4),
    my: opts.my != null ? opts.my : (s.my != null ? s.my : 4),
    buried: false, looted: false, items: opts.items || [carcassItem(opts.mid || 'hushwolf', 1400)],
  };
  Game.corpses().push(c);
  return c;
}

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'haul-proof' });
  await setupGame(Game);
  const s = Game.state.scholar;
  const packHas = (plantId) => (s.inventory || []).some(i => i && i.plantId === plantId && (i.units == null ? 1 : i.units) > 0);

  // --- (1) in-range monster corpse gets hauled
  let c1 = rigCorpse(Game);
  const ctx = {};
  const took1 = haulCorpses(Game, ctx);
  assert(took1 >= 1, 'haul must take the carcass item, took ' + took1);
  assert(packHas('meat_hushwolf'), 'carcass must be in the pack now');
  console.log('PASS 1: haulCorpses loots an in-range monster corpse');

  // --- (2) out-of-range corpse stays put
  const before = JSON.stringify(s.inventory.map(i => i.plantId));
  rigCorpse(Game, { node: { x: Game.map.px + 3, y: Game.map.py + 3 }, mid: 'gallowdeer',
    items: [carcassItem('gallowdeer', 2800)] });
  const took2 = haulCorpses(Game, {});
  assert(took2 === 0, 'out-of-range corpse must not be touched, took ' + took2);
  assert(JSON.stringify(s.inventory.map(i => i.plantId)) === before, 'pack unchanged');
  console.log('PASS 2: haulCorpses ignores out-of-range corpses');

  // --- (3) mid-fight guard
  rigCorpse(Game, { mid: 'hummice', items: [carcassItem('hummice', 150)] });
  Game.tbfight = { over: false, fighters: [] };
  const took3 = haulCorpses(Game, {});
  delete Game.tbfight;
  assert(took3 === 0, 'no looting while a fight is live, took ' + took3);
  assert(!packHas('meat_hummice'), 'hummice carcass must not be in the pack');
  console.log('PASS 3: haulCorpses refuses mid-fight (the dead can wait)');

  // --- (4) person corpses + human meat skipped
  rigCorpse(Game, { kind: 'villager', mid: 'x', items: [{ plantId: 'iron_knife', units: 1, name: 'Knife' }] });
  rigCorpse(Game, { mid: 'y', items: [{ plantId: 'meat_human', foodKind: 'meat', foodState: 'raw', units: 1, kcalEach: 500, name: 'Human meat' }] });
  const took4 = haulCorpses(Game, {});
  assert(!packHas('iron_knife') && !packHas('meat_human'), 'person corpse + human meat must stay');
  console.log('PASS 4: person corpses and meat_human skipped (meat lever only, trembles)');

  // --- (5) withHaul: upkeep hauls, daily adds the cautious test
  const { Game: G2 } = await loadGame({ seed: 7, mode: 'haul-proof-2' });
  await setupGame(G2);
  const s2 = G2.state.scholar;
  rigCorpse(G2);
  const ctx5 = {};
  belongseekHaul.upkeep(G2, ctx5);
  assert((s2.inventory || []).some(i => i && i.plantId === 'meat_hushwolf'),
    'belongseek-haul upkeep must haul the in-range carcass');
  // the r10 chain: one cautious test per day via daily
  s2.inventory.push({ plantId: 'meat_gallowdeer', foodKind: 'meat', foodState: 'cleaned',
    edible: false, units: 4, kcalEach: 0, hiddenKcal: 2800, spoilDay: 99, kg: 0.5,
    name: 'Unknown flesh (cleaned)', prep: 'Test it cautiously.' });
  belongseekHaul.daily(G2, ctx5);
  assert(ctx5.meatTests === 1, 'haul daily must run one cautious test, ran ' + (ctx5.meatTests || 0));
  belongseekHaul.daily(G2, ctx5);
  assert(ctx5.meatTests === 1, 'second daily same day must not test again');
  console.log('PASS 5: withHaul layers post-fight haul + 1/day cautious test onto the base');

  // --- (6) RED: the baseline does NOT haul at upkeep (feature absent = pack empty)
  const { Game: G3 } = await loadGame({ seed: 9, mode: 'haul-proof-red' });
  await setupGame(G3);
  rigCorpse(G3);
  belongseek.upkeep(G3, {});
  const redPack = (G3.state.scholar.inventory || []).some(i => i && i.plantId === 'meat_hushwolf');
  assert(!redPack, 'RED: belongseek (no haul layer) must NOT haul at upkeep');
  console.log('PASS 6 (RED): baseline upkeep leaves the carcass on the corpse — the feature is the delta');

  // --- (7) extended registry + killer-split census on rows
  const { belongseekHaul: bh, leadcourtHaul: lh } = require('./policies/haul');
  const { belongseek: bs } = require('./policies/belongseek');
  const { leadcourt: lc } = require('./policies/leadcourt');
  const rep = await runMeatAudit({ label: 'haul-proof-run', seeds: [11],
    policies: ['belongseek', 'belongseek-haul'], days: 8,
    registry: { belongseek: bs, 'belongseek-haul': bh, leadcourt: lc, 'leadcourt-haul': lh } });
  assert(rep.rows.length === 2, 'two rows expected');
  for (const r of rep.rows) {
    assert(typeof r.carcassPlayerK === 'number' && typeof r.carcassVillagerK === 'number',
      'killer-split census must be on every row');
    assert(typeof r.wins === 'number' && typeof r.exiled === 'number',
      'numeric wall aliases must be on every row');
  }
  console.log('PASS 7: runMeatAudit takes an extended registry; rows carry the killer split');

  console.log('\nAll carcass-haul proof tests passed.');
})().catch(e => { console.error('PROOF FAILED:', e); process.exit(1); });
