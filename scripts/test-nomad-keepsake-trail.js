#!/usr/bin/env node
// Proof: a worn L2+ keepsake of a scattered kin names their region pre-road
// (nomad-reachability 2026-10-15: WORLD-REGIONS.md §6 spec'd it, sharpenTrail
// implemented the 'keepsake' source, but nothing called it outside tests —
// the designed knowledge path to Leave eligibility was dead).
//
// Uses the player'S ACTUAL starting keepsakes (lifeseed guarantees exact
// kin-relation coverage), not synthetic items.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '99', 10);
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) { pass++; console.log('  PASS: ' + l); } else { fail++; console.log('  FAIL: ' + l); } };

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game);
  const st = Game.state, s = st.scholar;
  // Kin keepsakes of scattered kin in unknown regions.
  const all = [...(s.inventory || []), ...Object.values(s.equipped || {})].filter(i => Game.isKeepsake(i));
  const cands = [];
  for (const k of all) {
    const p = Game.keepsakeKinPerson ? Game.keepsakeKinPerson(k) : null;
    if (!p) continue;
    const e = Game.worldKinEntry ? Game.worldKinEntry(Game.villagerId, p) : null;
    if (e && e.fate === 'scattered' && e.region && !(st.world.regions[e.region] || {}).known) {
      cands.push({ item: k, person: p, entry: e });
    }
  }
  ok(cands.length > 0, 'the player holds a keepsake of a scattered kin in an unknown region');
  if (!cands.length) { console.log('\nkeepsake-trail: SKIP (no such keepsake this seed)'); process.exit(0); }

  const clearAcc = () => { for (const sl of ['acc1', 'acc2', 'acc3', 'acc4']) delete s.equipped[sl]; };
  const toInventory = (item) => {
    for (const sl of ['acc1', 'acc2', 'acc3', 'acc4']) if (s.equipped[sl] === item) delete s.equipped[sl];
    if (!s.inventory.includes(item)) s.inventory.push(item);
    return s.inventory.indexOf(item);
  };

  // Path 1: equip an already-L2 keepsake -> region known.
  clearAcc();
  const c1 = cands[0];
  c1.item.bond = 30;
  Game.equipAccessory(toInventory(c1.item));
  ok(st.world.regions[c1.entry.region].known === true,
    `wearing the L2 keepsake named ${c1.person.name}'s region (${c1.entry.region})`);

  // Path 2: bond growth crossing L2 while worn -> region known.
  if (cands[1]) {
    const c2 = cands[1];
    clearAcc();
    c2.item.bond = 20;
    Game.equipAccessory(toInventory(c2.item));
    ok(st.world.regions[c2.entry.region].known !== true, 'region still unknown while the keepsake is L1');
    const worn = Object.values(s.equipped).find(i => i && Game.isKeepsake(i));
    Game.keepsakeGrow(worn, 10, 'test');
    ok(Game.keepsakeLevel(worn) >= 2, 'bond crossed L2');
    ok(st.world.regions[c2.entry.region].known === true,
      `bond crossing L2 named ${c2.person.name}'s region (${c2.entry.region})`);
  } else {
    console.log('  SKIP: only one candidate keepsake this seed');
  }

  console.log(`\nkeepsake-trail: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
