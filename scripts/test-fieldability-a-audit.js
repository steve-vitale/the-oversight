#!/usr/bin/env node
// scripts/test-fieldability-a-audit.js — sim-fieldability-a DAMAGE AUDIT.
// No judged sweep, no game change: measures, on BASE code, what each
// EXISTING damage source in wild field fights can contribute to a
// 2-fighter party's DPR vs fresh wave-4 beasts. The retreatdiag
// corpus needs 57-80/round for fresh-beast kills inside the 15-round
// cap (850-1200 HP); observed median is 15/round.
// Configs kit leader+ally identically (ally strike is gear-blind,
// lroll([3,6]) in fieldFights.js, so ally kit is moot — verified by
// the allyDealt column). Leader strikes use the tactical formula
// lroll([4+wb, 8+wb]), wb = round((melee+ranged)/2) from EQUIPPED gear.
// Fights use the corpus shape: shout-join (allies:1, allyVids, NOT
// allyFromStart), seeded rng, 5 rng seeds per cell, scholar day 120.
// Trick cells set state.villagerTricks (the villageKnowsTrick gate).
// Exit 0 always on a completed matrix (this is a measurement, not a
// pass/fail gate); prints a CEILING table for the prereg decision.
// Usage: node scripts/test-fieldability-a-audit.js [--out <path>]
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
const DMG_ABILS = ['patient_aim', 'haymaker', 'stalk', 'blood_trail', 'dead_aim', 'trade_of_blows'];
const CONFIGS = [
  { name: 'stick', weapons: ['sharpened_stick'] },
  { name: 'fire-spear', weapons: ['fire_hardened_spear'] },
  { name: 'hunting-spear', weapons: ['hunting_spear'] },
  { name: 'machete', weapons: ['machete'] },
  { name: 'machete+bow+arrows', weapons: ['machete', 'bow'], ammo: { itemId: 'arrow', units: 5 } },
  { name: 'hunting+bow+arrows', weapons: ['hunting_spear', 'bow'], ammo: { itemId: 'arrow', units: 5 } },
  { name: 'hardlight', weapons: ['hardlight_knife'] },
  { name: 'godslayer', weapons: ['godslayer_spear'] },
  { name: 'worldbreaker', weapons: ['worldbreaker_maul'] },
  { name: 'hunting+all-dmg-abils', weapons: ['hunting_spear'], abils: DMG_ABILS },
  { name: 'fire-spear+all-dmg-abils', weapons: ['fire_hardened_spear'], abils: DMG_ABILS },
  { name: 'machete+bow+all-dmg-abils', weapons: ['machete', 'bow'], ammo: { itemId: 'arrow', units: 5 }, abils: DMG_ABILS },
];
const BEASTS = [
  { mid: 'audit', hp: 1100 },
  { mid: 'influencer', hp: 850 },
];
const TRICK_CELLS = [
  { name: 'influencer-trick-known', mid: 'influencer', hp: 850, weapons: ['hunting_spear'], trick: 'influencer' },
  { name: 'eater-trick-known+spoiled', mid: 'eater', hp: 950, weapons: ['hunting_spear'], trick: 'eater', spoiled: true },
  { name: 'eater-trick-known+nospolied', mid: 'eater', hp: 950, weapons: ['hunting_spear'], trick: 'eater', spoiled: false },
  { name: 'audit-trick-known', mid: 'audit', hp: 1100, weapons: ['hunting_spear'], trick: 'audit' },
  { name: 'reunion-trick-known', mid: 'reunion', hp: 1200, weapons: ['hunting_spear'], trick: 'reunion' },
];

async function fightCell(cfg, beast, rngSeed) {
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'fieldability-a-audit', fullTelemetry: false });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  try { G.state.scholar.day = 120; } catch (e) {}
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (roster.length < 2) throw new Error('fewer than 2 roster villagers');
  const leader = roster[0], ally = roster[1];
  for (const vid of [leader, ally]) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (!vp) throw new Error('no villager record ' + vid);
    vp.items = cfg.weapons.slice().concat(KIT_ARMOR);
    if (cfg.ammo) vp.items.push({ itemId: cfg.ammo.itemId, units: cfg.ammo.units, name: cfg.ammo.itemId });
    if (cfg.spoiled) vp.items.push({ itemId: 'cooked_meat', name: 'spoiled meat', kcalEach: 200, units: 1, spoilDay: 0 });
    if (vid === leader && cfg.trick) { /* trick is village-wide, set below */ }
    vp.equipped = {};
    // Let villagerGearUp/autoEquip choose: fieldFight calls gearUp(false)
    // at entry, so pre-setting equipped is overwritten anyway; set the
    // obvious melee slot so a no-autoEquip path still strikes armed.
    vp.equipped.melee = { itemId: cfg.weapons[0], name: cfg.weapons[0] };
    if (cfg.weapons[1]) vp.equipped.ranged = { itemId: cfg.weapons[1], name: cfg.weapons[1] };
  }
  if (cfg.abils) {
    const v = G.state.village || (G.state.village = {});
    v.npcAbilities = v.npcAbilities || {};
    v.npcAbilities[leader] = cfg.abils.slice();
    v.npcAbilities[ally] = [];
  }
  if (cfg.trick) {
    G.state.villagerTricks = G.state.villagerTricks || {};
    G.state.villagerTricks[cfg.trick] = true;
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  vv.health[leader] = 100; vv.health[ally] = 100;
  const def = (G.data.monsters || []).find(m => m && m.id === beast.mid);
  if (!def) throw new Error('monster def not found: ' + beast.mid);
  const entity = { id: def.id, hp: beast.hp, maxHp: beast.hp, tx: 2, ty: 2 };
  const rec = G.fieldFight(leader, def, entity, { allies: 1, allyVids: [ally], rng: mulberry32(rngSeed) });
  return { cfg: cfg.name, mid: beast.mid, hp: beast.hp, outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken, allyDealt: rec.allyDealt,
    dpr: rec.rounds ? rec.mDealt / rec.rounds : 0,
    killRounds: rec.rounds && rec.mDealt > 0 ? beast.hp / (rec.mDealt / rec.rounds) : Infinity,
    trickLog: (rec.trickLog || []).join(',') || null, calledHelp: !!rec.calledHelp };
}
function mean(a) { return a.length ? a.reduce((t, x) => t + x, 0) / a.length : 0; }
function med(a) { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; }
async function main() {
  const out = [];
  for (const cfg of CONFIGS) {
    for (const beast of BEASTS) {
      const cells = [];
      for (let s = 0; s < 5; s++) cells.push(await fightCell(cfg, beast, 9000 + s * 131 + beast.hp));
      const dprs = cells.map(c => c.dpr), kills = cells.filter(c => c.outcome === 'vKill').length;
      const line = { config: cfg.name, beast: beast.mid, hp: beast.hp, n: 5, kills,
        outcomes: cells.map(c => c.outcome).join('/'),
        dprMean: +mean(dprs).toFixed(1), dprMed: +med(dprs).toFixed(1),
        killRoundsMed: +med(cells.map(c => c.killRounds)).toFixed(1),
        rounds: cells.map(c => c.rounds).join(',') };
      out.push(line);
      console.log(`${line.config} vs ${line.beast}(${line.hp}): kills=${kills}/5 outcomes=${line.outcomes} DPRmean=${line.dprMean} DPRmed=${line.dprMed} killRoundsMed=${line.killRoundsMed} rounds=${line.rounds}`);
    }
  }
  console.log('--- trick cells (hunting-spear baseline, trick known) ---');
  for (const cfg of TRICK_CELLS) {
    const cells = [];
    for (let s = 0; s < 5; s++) cells.push(await fightCell(cfg, { mid: cfg.mid, hp: cfg.hp }, 7000 + s * 97 + cfg.hp));
    const dprs = cells.map(c => c.dpr);
    console.log(`${cfg.name}: outcomes=${cells.map(c => c.outcome).join('/')} DPRmean=${mean(dprs).toFixed(1)} rounds=${cells.map(c => c.rounds).join(',')} trickLog=${cells.map(c => c.trickLog || '-').join(' | ')} mDealt=${cells.map(c => c.mDealt).join(',')}`);
    out.push({ config: cfg.name, beast: cfg.mid, hp: cfg.hp, n: 5, kills: cells.filter(c => c.outcome === 'vKill').length,
      outcomes: cells.map(c => c.outcome).join('/'), dprMean: +mean(dprs).toFixed(1), trickLogs: cells.map(c => c.trickLog) });
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify(out, null, 1) + '\n');
    console.log('wrote ' + process.argv[outIdx + 1]);
  }
  console.log('AUDIT-COMPLETE');
}
main().catch(e => { console.error('AUDIT-FAIL', e && e.stack || e); process.exit(1); });
