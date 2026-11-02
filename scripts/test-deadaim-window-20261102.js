#!/usr/bin/env node
// scripts/test-deadaim-window-20261102.js — DEAD-AIM window proof (DEAD-AIM arm).
// Claim: widening the field-fight dead_aim window from <25% to <35% HP
// (fieldFights.js) makes the executioner's shot land one round earlier on
// the gallowdeer ally battery: the round-4 leader strike starts at 49-55 HP
// (inside 35% = 56, outside 25% = 40), so it doubles and kills in round 4
// instead of round 5. FAILS on the <25% baseline (round-5 kill, round-5 fire).
// Fixture: gallowdeer 160 HP, machete, npcAbilities on leader, mulberry rng,
// pattern from proof-lootabilities-w2.js. Seeds 9201-9205 (audit convention).
// Solo + flee seeds are REPORTED, not asserted: solo never reaches the
// window (hopeless flight at 69-102 HP left) and 9202/9203 flee in round 2
// (monster at 89-95 HP) under either window — those are morale facts, not
// dead_aim facts. Blood-trail guard: a blood_trail-only holder must still
// show '(blood trail +2)' (the 56-80 HP band is preserved by a 35% window).
// Usage: node scripts/test-deadaim-window-20261102.js  (exit 1 on any FAIL)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
async function runFight(cfg) {
  const { Game: G, loadFails } = await loadGame({ seed: 424242, mode: 'deadaim-window-proof', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  try { if (G.pantryAdd && (G.villageFoodTier ? G.villageFoodTier() : '') !== 'secure') G.pantryAdd(200000, 'fixture top-up'); } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = ['machete'];
    vp.equipped = { melee: { itemId: 'machete', name: 'machete' } };
  }
  const v = G.state.village || (G.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[leader] = (cfg.abils || []).slice();
  v.npcAbilities[ally] = [];
  const needs = v.needs || {};
  needs[leader] = Object.assign({}, needs[leader], { hunger: 0, fear: 0 });
  needs[ally] = Object.assign({}, needs[ally], { hunger: 0, fear: 0 });
  v.needs = needs;
  v.health = v.health || {};
  v.health[leader] = 100; v.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === 'gallowdeer');
  if (!def) throw new Error('monster def not found');
  const entity = { id: def.id, hp: 160, maxHp: 160, tx: 2, ty: 2 };
  const opts = { allies: cfg.ally ? 1 : 0, allyVids: cfg.ally ? [ally] : [], allyFromStart: !!cfg.ally, rng: mulberry32(cfg.seed) };
  const rec = G.fieldFight(leader, def, entity, opts);
  const fires = (rec.log || []).filter(l => /dead aim x2/i.test(l));
  const fireRounds = fires.map(l => { const m = /^R(\d+):/.exec(l); return m ? +m[1] : null; });
  return { seed: cfg.seed, ally: !!cfg.ally, abils: cfg.abils || [], outcome: rec.outcome,
    rounds: rec.rounds, mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt,
    vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, fires: fires.length, fireRounds, log: rec.log };
}
let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}
(async () => {
  for (const seed of [9201, 9204, 9205]) {
    const w = await runFight({ seed, ally: true, abils: ['dead_aim'] });
    check('ally WITH seed=' + seed + ' kills in round 4 with round-4 dead_aim fire',
      w.outcome === 'vKill' && w.rounds === 4 && w.fires === 1 && w.fireRounds[0] === 4,
      'outcome=' + w.outcome + ' rounds=' + w.rounds + ' fires=' + w.fires + ' fireRounds=' + w.fireRounds.join(',') +
      ' mDealt=' + w.mDealt + ' vTaken=' + w.vTaken);
    const wo = await runFight({ seed, ally: true, abils: [] });
    check('ally WITHOUT seed=' + seed + ' unchanged (round-5 kill, no fire)',
      wo.outcome === 'vKill' && wo.rounds === 5 && wo.fires === 0,
      'outcome=' + wo.outcome + ' rounds=' + wo.rounds + ' fires=' + wo.fires + ' mDealt=' + wo.mDealt);
  }
  const bt = await runFight({ seed: 9201, ally: true, abils: ['blood_trail'] });
  check('blood_trail-only guard seed=9201 still shows (blood trail +2)',
    (bt.log || []).some(l => /blood trail \+2/i.test(l)),
    'outcome=' + bt.outcome + ' rounds=' + bt.rounds);
  for (const seed of [9201, 9202, 9203, 9204, 9205]) {
    const s = await runFight({ seed, ally: false, abils: ['dead_aim'] });
    console.log('REPORT solo WITH seed=' + seed + ' outcome=' + s.outcome + ' rounds=' + s.rounds +
      ' mDealt=' + s.mDealt + ' mHpLeft=' + s.mHpLeft + ' fires=' + s.fires);
  }
  for (const seed of [9202, 9203]) {
    const a = await runFight({ seed, ally: true, abils: ['dead_aim'] });
    console.log('REPORT ally WITH flee-seed=' + seed + ' outcome=' + a.outcome + ' rounds=' + a.rounds +
      ' mDealt=' + a.mDealt + ' mHpLeft=' + a.mHpLeft + ' fires=' + a.fires);
  }
  console.log(failures ? ('PROOF FAILED: ' + failures + ' check(s)') : 'PROOF PASSED');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
