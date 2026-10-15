#!/usr/bin/env node
// Proof test: The Long Way Home — the village left behind (nomad-core 2026-10-15).
// Spec: docs/WORLD-REGIONS.md §6 — "The village stays and appoints a new
// leader from its own people, by the same rules as the mantle passing. Its
// fate is played out without you and told in the epilogue. Leaving a strong
// village is a quiet goodbye; leaving a starving one is abandonment, and the
// ledger remembers." endingData() feeds Worker C's ending scene.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '48', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

function prep(Game, pantryItems) {
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
  if (kin.length) Game.hearOfRegion(kin[0].region, 'test');
  Game.state.village.pantry = [];
  for (let i = 0; i < pantryItems; i++) Game.state.village.pantry.push({ kcalEach: 2000, units: 1, name: 'grain' });
}

async function main() {
  console.log('== strong village left behind ==');
  {
    const { Game } = await loadGame({ seed: SEED });
    await setupGame(Game, 'Columbus, Ohio');
    prep(Game, 400); // rich stores
    // Make one villager clearly the most trusted (mantle rule: trust decides).
    const v = Game.state.village;
    const npc = v.roster.find(id => id !== Game.villagerId);
    v.trust = v.trust || {};
    for (const id of v.roster) v.trust[id] = 10;
    v.trust[npc] = 99;
    const road = Game.nomad.start();
    // The leader is the highest-trust stayer (mantle-passing rule) — and a
    // stayer can never be in the road party (leader-draft fix 2026-10-15).
    const trust = v.trust;
    const partySet = new Set(road.partyIds || []);
    const stayers = v.roster.filter(id => !partySet.has(id));
    const expectLeader = stayers.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
    ok(road.villageLeft.leaderId === expectLeader, 'leader = highest-trust stayer (mantle rule)');
    ok(!partySet.has(road.villageLeft.leaderId), 'leader is not in the road party');
    ok(road.villageLeft.abandoned === false, 'a strong village is not abandonment');
    ok(road.villageLeft.strength > 0.5, `departure strength high (${road.villageLeft.strength.toFixed(2)})`);
    // Ledger remembers the leaving.
    const evs = ((Game.progState && Game.progState().ledgerEvents) || []);
    ok(evs.some(e => e.sys === 'nomad'), 'the leaving is in the ledger events');
    // End the road by settling; the village fate resolves for the epilogue.
    const ed = Game.nomad.endRoad('settled');
    ok(ed.reason === 'settled', 'ending reason settled');
    ok(['thrived', 'survived'].includes(ed.village.fate), `strong village fate: ${ed.village.fate}`);
    ok(typeof ed.village.fateLine === 'string' && ed.village.fateLine.length > 10, 'fate line for the epilogue');
    ok(ed.dark === false, 'leaving a strong village is not dark');
  }

  console.log('== starving village left behind ==');
  {
    const { Game } = await loadGame({ seed: SEED + 1 });
    await setupGame(Game, 'Columbus, Ohio');
    prep(Game, 0); // empty pantry
    const road = Game.nomad.start();
    ok(road.villageLeft.abandoned === true, 'leaving a starving village is abandonment');
    const ed = Game.nomad.endRoad('settled');
    ok(ed.dark === true, 'abandonment makes the ending dark');
    ok(ed.village.fate === 'fell' || ed.village.fate === 'survived', `weak village fate: ${ed.village.fate}`);
  }

  console.log('== markKinFound + endingData shape ==');
  {
    const { Game } = await loadGame({ seed: SEED + 2 });
    await setupGame(Game, 'Columbus, Ohio');
    prep(Game, 200);
    const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region);
    const road = Game.nomad.start();
    if (kin.length) {
      const e = Game.nomad.markKinFound(kin[0].name, kin[0].relation, 'alive');
      ok(!!e && e.name === kin[0].name, 'markKinFound records the reunion');
      const wk = Game.worldKinEntry(Game.villagerId, kin[0]);
      ok(wk && wk.found === true, 'the world kin entry is marked found');
    } else {
      ok(true, 'SKIP: no scattered kin in fixture (acceptable)');
    }
    const ed = Game.nomad.endRoad('all-found');
    ok(Array.isArray(ed.foundKin), 'endingData has foundKin');
    ok(Array.isArray(ed.partySurvivors), 'endingData has partySurvivors');
    ok(Array.isArray(ed.fallen), 'endingData has fallen');
    ok(ed.village && typeof ed.village.fateLine === 'string', 'endingData has village fate');
    ok(typeof ed.dark === 'boolean', 'endingData has dark flag');
    ok(typeof ed.daysOnRoad === 'number', 'endingData has daysOnRoad');
    ok(Array.isArray(ed.log), 'endingData has log');
  }

  console.log(`\ntest-nomad-village: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(2); });
