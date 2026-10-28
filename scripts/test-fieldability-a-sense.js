#!/usr/bin/env node
// scripts/test-fieldability-a-sense.js — sim-fieldability-a sense fixtures.
// SENSE-TESTING LAW: two full fight logs read for meaning, not counts.
// (1) The plausible wild best: machete + bow + pocketed arrows vs a
// fresh audit (1100 HP), shout-join shape. (2) Trick-known influencer
// (focus_followers) vs fresh influencer (850 HP): the trick costs
// strikes — does the fight read as a plan, or as giving up damage?
// Base code only; no game change. Exit 0 if both fights produce a
// readable log ending in vFlee (the corpus shape); exit 1 otherwise.
// Usage: node scripts/test-fieldability-a-sense.js [--out <path>]
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
const KIT_ARMOR = ['hide_armor', 'skull_helm', 'canvas_pants', 'work_gloves', 'good_boots'];
async function fixture(label, weapons, ammo, mid, hp, trick, rngSeed) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'fieldability-a-sense', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    vp.items = weapons.slice().concat(KIT_ARMOR);
    if (ammo) vp.items.push({ itemId: ammo, units: 5, name: ammo });
    vp.equipped = { melee: { itemId: weapons[0], name: weapons[0] } };
    if (weapons[1]) vp.equipped.ranged = { itemId: weapons[1], name: weapons[1] };
  }
  if (trick) { G.state.villagerTricks = G.state.villagerTricks || {}; G.state.villagerTricks[trick] = true; }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {}; vv.health[leader] = 100; vv.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === mid);
  const rec = G.fieldFight(leader, def, { id: def.id, hp, maxHp: hp, tx: 2, ty: 2 },
    { allies: 1, allyVids: [ally], rng: mulberry32(rngSeed) });
  return { label, mid, hp, leader, ally, outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt, mHpLeft: rec.mHpLeft,
    calledHelp: !!rec.calledHelp, trickLog: rec.trickLog || [], volley: rec.volley || null,
    log: rec.log || [] };
}
async function main() {
  const results = [];
  results.push(await fixture('machete+bow vs audit', ['machete', 'bow'], 'arrow', 'audit', 1100, null, 9000));
  results.push(await fixture('trick-known influencer', ['hunting_spear'], null, 'influencer', 850, 'influencer', 7000));
  for (const r of results) {
    console.log(`=== ${r.label}: ${r.mid} hp=${r.hp} leader=${r.leader} ally=${r.ally} ===`);
    console.log(`outcome=${r.outcome} rounds=${r.rounds} mDealt=${r.mDealt} vTaken=${r.vTaken} allyDealt=${r.allyDealt} mHpLeft=${r.mHpLeft} calledHelp=${r.calledHelp} trickLog=${r.trickLog.join(',') || '-'} volley=${r.volley ? JSON.stringify(r.volley) : '-'}`);
    console.log('--- log ---');
    for (const line of r.log) console.log('  ' + line);
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify(results, null, 1) + '\n');
    console.log('wrote ' + process.argv[outIdx + 1]);
  }
  let fail = null;
  for (const r of results) if (r.outcome !== 'vFlee') fail = `${r.label}: outcome ${r.outcome}, expected vFlee (corpus shape)`;
  if (fail) { console.log('SENSE-SHAPE: FAIL — ' + fail); process.exit(1); }
  console.log('SENSE-SHAPE: PASS — both fixtures end in the corpus retreat shape with readable beats');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
