#!/usr/bin/env node
// scripts/test-retreatdiag-a-sense.js — sim-retreatdiag-a sense fixture.
// SENSE-TESTING LAW: reads the fight log of a 2-fighter party vs a
// wave-4-HP beast on CURRENT base code (round-2 shout gate), in the
// observed corpus shape (leader + one shouted ally, ~15/round party
// damage vs 850-1100 HP). This is a SHAPE replay, not a band replay:
// it proves the retreat beats read as people judging a fight, on the
// code the diagnosis describes. No game code is touched; the fixture
// calls the real fieldFight with explicit opts (allyVids, seeded rng).
// Exit 1 if the retreat shape does NOT reproduce (no shout, or the
// party kills/drives off a fresh wave-4 beast — either would
// contradict the corpus and must be reported, not hidden).
// Usage: node scripts/test-retreatdiag-a-sense.js [--out <path>]
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
async function fixture(mid, hp, seed) {
  const { Game: G, loadFails } = await loadGame({ seed, mode: 'retreatdiag-a-sense-' + mid, fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  // Corpus shape, not day-1 shape: all 16 corpus leaders were ARMED.
  // A naked day-1 villager dies in round 2 before any shout can fire
  // (verified in an earlier un-kitted run: audit 42+75, influencer
  // 48+59 — both vDie round 2, calledHelp false). Kit both fighters
  // the standard way (hunting spear + hide armor kit, health 100)
  // so the fixture tests the shout/retreat beats, not nakedness.
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 non-scholar roster villagers after setup');
  const leader = roster[0], ally = roster[1];
  const KIT = [['torso', 'hide_armor', 'Hide Armor'], ['head', 'skull_helm', 'Skull Helm'],
    ['legs', 'canvas_pants', 'Canvas Pants'], ['hands', 'work_gloves', 'Work Gloves'],
    ['feet', 'good_boots', 'Good Boots']];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (vp) {
      vp.items = ['hunting_spear', 'skull_helm', 'hide_armor', 'canvas_pants', 'work_gloves', 'good_boots'];
      vp.equipped = { melee: { itemId: 'hunting_spear', name: 'Hunting Spear' } };
      for (const [slot, iid, name] of KIT) vp.equipped[slot] = { itemId: iid, name };
    }
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  vv.health[leader] = 100; vv.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === mid);
  if (!def) throw new Error('monster def not found: ' + mid);
  const entity = { id: def.id, hp, maxHp: hp, tx: 2, ty: 2 };
  const rng = mulberry32(seed);
  const rec = G.fieldFight(leader, def, entity, { allies: 1, allyVids: [ally], rng });
  return { mid, hp, leader, ally, outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt, allyTaken: rec.allyTaken,
    mHpLeft: rec.mHpLeft, calledHelp: rec.calledHelp, allyVid: rec.allyVid,
    fleeHopeless: rec.fleeHopeless, everHopeless: rec.everHopeless, intent: rec.intent,
    log: rec.log || [] };
}
async function main() {
  const results = [];
  results.push(await fixture('audit', 1100, 75106));
  results.push(await fixture('influencer', 850, 75107));
  for (const r of results) {
    console.log(`=== sense fixture: ${r.mid} hp=${r.hp} leader=${r.leader} ally=${r.ally} ===`);
    console.log(`outcome=${r.outcome} rounds=${r.rounds} mDealt=${r.mDealt} vTaken=${r.vTaken} allyDealt=${r.allyDealt} allyTaken=${r.allyTaken} mHpLeft=${r.mHpLeft} calledHelp=${r.calledHelp} fleeHopeless=${r.fleeHopeless} everHopeless=${r.everHopeless} intent=${r.intent}`);
    console.log('--- log ---');
    for (const line of r.log) console.log('  ' + line);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify(results, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  let fail = null;
  for (const r of results) {
    if (!r.calledHelp) fail = `${r.mid}: no shout fired in fixture`;
    else if (r.outcome !== 'vFlee' && r.outcome !== 'vDie') fail = `${r.mid}: unexpected outcome ${r.outcome} (corpus says retreat)`;
    else if (r.mHpLeft <= 0) fail = `${r.mid}: beast died in fixture (corpus says beast lives)`;
  }
  if (fail) { console.log('SENSE-SHAPE: FAIL — ' + fail); process.exit(1); }
  console.log('SENSE-SHAPE: PASS — both fixtures shout, join, and retreat with the beast alive (corpus shape reproduced)');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
