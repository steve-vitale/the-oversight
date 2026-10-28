#!/usr/bin/env node
// scripts/test-chainkill-a-sense.js — sim-chainkill-a sense fixture.
// SENSE-TESTING LAW: a CHAIN replay, not a single fight. Kitted pair A
// fights a wave-4 influencer entity at 850 HP (maxHp 850); then kitted
// pair B fights the SAME entity object, whose HP the engine carried
// via the fieldFight writeback (m.hp = mHpLeft when not killed). The
// fixture asserts the carry (fight 2 starts exactly where fight 1
// left the beast) and quotes BOTH full fight logs, so the evidence
// can judge whether chained fights read as parties wearing one beast
// down. Any outcome is reported, none is failed on: a chain fixture
// that killed would be a finding, not a contradiction (unlike the
// retreatdiag shape check, whose corpus said retreat).
// Second fixture: a single kitted pair vs a herald at 294 HP — the
// near-cap wounded beast from the retreatdiag corpus (16.6 rounds at
// observed DPR) — quoted for the "one more party finishes it?" read.
// No game code is touched; the fixture calls the real fieldFight
// with explicit opts (allyVids, seeded rng).
// Usage: node scripts/test-chainkill-a-sense.js [--out <path>]
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
function kitVillagers(G, vids) {
  const KIT = [['torso', 'hide_armor', 'Hide Armor'], ['head', 'skull_helm', 'Skull Helm'],
    ['legs', 'canvas_pants', 'Canvas Pants'], ['hands', 'work_gloves', 'Work Gloves'],
    ['feet', 'good_boots', 'Good Boots']];
  for (const vid of vids) {
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
  for (const vid of vids) vv.health[vid] = 100;
}
function fightRec(rec) {
  return { outcome: rec.outcome, rounds: rec.rounds, mDealt: rec.mDealt,
    vTaken: rec.vTaken, allyDealt: rec.allyDealt, allyTaken: rec.allyTaken,
    mHpLeft: rec.mHpLeft, calledHelp: rec.calledHelp, allyVid: rec.allyVid,
    fleeHopeless: rec.fleeHopeless, everHopeless: rec.everHopeless, intent: rec.intent,
    log: rec.log || [] };
}
async function main() {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'chainkill-a-sense', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 4) throw new Error('fewer than 4 non-scholar roster villagers after setup');
  const [leadA, allyA, leadB, allyB] = roster;
  kitVillagers(G, [leadA, allyA, leadB, allyB]);
  const infDef = (G.data.monsters || []).find(m => m && m.id === 'influencer');
  if (!infDef) throw new Error('monster def not found: influencer');
  // CHAIN FIXTURE: same entity, two parties.
  const entity = { id: infDef.id, hp: 850, maxHp: 850, tx: 2, ty: 2 };
  const rec1 = G.fieldFight(leadA, infDef, entity, { allies: 1, allyVids: [allyA], rng: mulberry32(75106) });
  const carriedHp = entity.hp;
  const fight1 = Object.assign({ leader: leadA, ally: allyA, mHpStart: 850 }, fightRec(rec1));
  const fight2start = entity.hp;
  const rec2 = G.fieldFight(leadB, infDef, entity, { allies: 1, allyVids: [allyB], rng: mulberry32(75107) });
  const fight2 = Object.assign({ leader: leadB, ally: allyB, mHpStart: fight2start }, fightRec(rec2));
  const carryOk = (fight2start === fight1.mHpLeft) && (carriedHp === fight1.mHpLeft);
  // HERALD-294 FIXTURE: fresh entity at the near-cap wounded HP.
  const herDef = (G.data.monsters || []).find(m => m && m.id === 'herald');
  if (!herDef) throw new Error('monster def not found: herald');
  const herEntity = { id: herDef.id, hp: 294, maxHp: 900, tx: 3, ty: 3 };
  // leadA/allyA carry fight-1 wounds; re-heal to 100 so the herald
  // fixture tests the wounded beast, not the previous fight's wounds.
  G.state.village.health[leadA] = 100; G.state.village.health[allyA] = 100;
  const recH = G.fieldFight(leadA, herDef, herEntity, { allies: 1, allyVids: [allyA], rng: mulberry32(75108) });
  const herald = Object.assign({ leader: leadA, ally: allyA, mHpStart: 294, note: 'fighters re-healed to 100 after chain fight 1; beast is the fixture, not the fighters' }, fightRec(recH));
  const results = { chain: { fight1, fight2, carriedHp, carryOk }, herald };
  console.log('=== sense fixture: CHAIN influencer 850, pair A then pair B, same entity ===');
  console.log(`fight1: leader=${fight1.leader} ally=${fight1.ally} start=850 outcome=${fight1.outcome} rounds=${fight1.rounds} mDealt=${fight1.mDealt} vTaken=${fight1.vTaken} allyDealt=${fight1.allyDealt} mHpLeft=${fight1.mHpLeft} calledHelp=${fight1.calledHelp} fleeHopeless=${fight1.fleeHopeless}`);
  console.log('--- fight1 log ---');
  for (const line of fight1.log) console.log('  ' + line);
  console.log(`CARRY: entity.hp after fight1=${carriedHp} fight2 start=${fight2start} carryOk=${carryOk}`);
  console.log(`fight2: leader=${fight2.leader} ally=${fight2.ally} start=${fight2start} outcome=${fight2.outcome} rounds=${fight2.rounds} mDealt=${fight2.mDealt} vTaken=${fight2.vTaken} allyDealt=${fight2.allyDealt} mHpLeft=${fight2.mHpLeft} calledHelp=${fight2.calledHelp} fleeHopeless=${fight2.fleeHopeless}`);
  console.log('--- fight2 log ---');
  for (const line of fight2.log) console.log('  ' + line);
  const dpr1 = fight1.rounds > 0 ? fight1.mDealt / fight1.rounds : 0;
  const dpr2 = fight2.rounds > 0 ? fight2.mDealt / fight2.rounds : 0;
  console.log(`CHAIN MATH: fight1 DPR=${Math.round(dpr1 * 10) / 10} fight2 DPR=${Math.round(dpr2 * 10) / 10} total chain damage=${fight1.mDealt + fight2.mDealt} beast left=${fight2.mHpLeft}`);
  console.log('=== sense fixture: HERALD 294 (near-cap wounded beast) ===');
  console.log(`herald: leader=${herald.leader} ally=${herald.ally} start=294 outcome=${herald.outcome} rounds=${herald.rounds} mDealt=${herald.mDealt} vTaken=${herald.vTaken} allyDealt=${herald.allyDealt} mHpLeft=${herald.mHpLeft} calledHelp=${herald.calledHelp}`);
  console.log('--- herald log ---');
  for (const line of herald.log) console.log('  ' + line);
  const dprH = herald.rounds > 0 ? herald.mDealt / herald.rounds : 0;
  console.log(`HERALD MATH: DPR=${Math.round(dprH * 10) / 10} rounds-to-kill at fixture DPR=${dprH > 0 ? Math.round(294 / dprH * 10) / 10 : 'inf'} (cap 15)`);
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify(results, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  if (!carryOk) { console.log('CHAIN-CARRY: FAIL — fight 2 did not start at fight 1 mHpLeft'); process.exit(1); }
  if (!fight1.log.length || !fight2.log.length) { console.log('CHAIN-LOGS: FAIL — empty fight log'); process.exit(1); }
  console.log('CHAIN-SENSE: PASS — carry verified, both fight logs captured (outcomes reported, not judged)');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
