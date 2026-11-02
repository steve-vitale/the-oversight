#!/usr/bin/env node
// audit-fixtures-20261101.js — fixture batteries for the loot/abilities
// efficacy audit (W2 fieldFight pattern). One battery-arm per process.
// Usage:
//   node scripts/audit-fixtures-20261101.js ability <abilityId> <with|without> [outdir]
//   node scripts/audit-fixtures-20261101.js tiers <weaponId|machete> <armorId|none> <mid> [outdir]
//   node scripts/audit-fixtures-20261101.js wave4 <weaponId> <armorId> [outdir]
//   node scripts/audit-fixtures-20261101.js synmods <synergyId> [outdir]
// Seeds 9201-9203 (prereg scored set). Zero src/js changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEEDS = [9201, 9202, 9203, 9204, 9205];
async function setupFightGame(seed) {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  try { Game.state.scholar.day = 120; } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  try { if (typeof Game.pantryAdd === 'function') Game.pantryAdd(200000, 'audit fixture top-up'); } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  return Game;
}
function prepFighter(Game, vid, opts) {
  const v = Game.state.village || (Game.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[vid] = (opts.abils || []).slice();
  const vp = (Game.data.villagers || []).find(x => x.id === vid) || {};
  vp.items = (opts.items || ['machete']).slice();
  vp.equipped = Object.assign({}, opts.equipped || { melee: { itemId: 'machete', name: 'machete' } });
  v.needs = v.needs || {};
  v.needs[vid] = Object.assign({}, v.needs[vid], { hunger: 0, fear: 0 });
  v.health = v.health || {};
  v.health[vid] = opts.hp || 100;
  return vp;
}
function metrics(rec) {
  const start = rec.mHpStart != null ? rec.mHpStart : null;
  return {
    outcome: rec.outcome, rounds: rec.rounds,
    mDealt: rec.mDealt, vTaken: rec.vTaken,
    vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft,
    mHpStart: start, mMaxHp: rec.mMaxHp || null,
    totalDamage: start != null ? start - Math.max(0, rec.mHpLeft || 0) : null,
    volley: rec.volley, strikes: rec.strikesThrown,
    ffFired: rec.ffFired || [],
    allyDealt: rec.allyDealt || 0,
    allyTaken: rec.allyTaken || 0,
    allyHpLeft: rec.allyHpLeft != null ? rec.allyHpLeft : null,
    log: (rec.log || []).join(' | '),
  };
}
async function runFight(Game, cfg, seed) {
  const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
  const leader = roster[0], ally = roster[1];
  prepFighter(Game, leader, cfg.leader);
  if (cfg.ally) prepFighter(Game, ally, cfg.allyCfg || {});
  const def = (Game.data.monsters || []).find(m => m && m.id === cfg.mid);
  if (!def) throw new Error('monster not found: ' + cfg.mid);
  const hp = cfg.hp || (Array.isArray(def.hp) ? def.hp[0] : def.hp) || 80;
  const entity = { id: def.id, hp, maxHp: hp, tx: 2, ty: 2 };
  const opts = { allies: cfg.ally ? 1 : 0, allyVids: cfg.ally ? [ally] : [], allyFromStart: !!cfg.ally, rng: mulberry32(seed), noFlee: cfg.noFlee !== false, awareness: !!cfg.awareness };
  const rec = Game.fieldFight(leader, def, entity, opts);
  try { Game.state.scholar.day = (Game.state.scholar.day || 120) + 1; } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  return metrics(rec);
}
async function batteryAbility(abilityId, arm, outdir) {
  const Game = await setupFightGame(9201);
  const out = [];
  for (const cfgName of ['solo', 'ally']) {
    for (const seed of SEEDS) {
      const abils = arm === 'with' ? [abilityId] : [];
      const r = await runFight(Game, {
        mid: 'bulldozer', hp: 80, ally: cfgName === 'ally',
        leader: { abils, items: ['machete'], equipped: { melee: { itemId: 'machete', name: 'machete' } } },
        allyCfg: { abils: [], items: ['machete'], equipped: { melee: { itemId: 'machete', name: 'machete' } } },
      }, seed);
      out.push(Object.assign({ ability: abilityId, arm, config: cfgName, seed }, r));
    }
  }
  return out;
}
async function batteryTiers(weaponId, armorId, mid, outdir) {
  const Game = await setupFightGame(9201);
  const out = [];
  const items = [weaponId];
  const equipped = { melee: { itemId: weaponId, name: weaponId } };
  if (armorId && armorId !== 'none') { items.push(armorId); equipped.torso = { itemId: armorId, name: armorId }; }
  for (const seed of SEEDS) {
    const r = await runFight(Game, {
      mid, hp: mid === 'bulldozer' ? 80 : undefined, ally: false,
      leader: { abils: [], items: items.slice(), equipped: Object.assign({}, equipped) },
    }, seed);
    out.push(Object.assign({ weapon: weaponId, armor: armorId, mid, seed }, r));
  }
  return out;
}
async function batteryWave4(weaponId, armorId) {
  const Game = await setupFightGame(9201);
  const out = [];
  const items = [weaponId, armorId];
  const equipped = { melee: { itemId: weaponId, name: weaponId }, torso: { itemId: armorId, name: armorId } };
  for (const seed of SEEDS) {
    const r = await runFight(Game, {
      mid: 'congregation', hp: 1000, ally: true,
      leader: { abils: [], items: items.slice(), equipped: Object.assign({}, equipped) },
      allyCfg: { abils: [], items: items.slice(), equipped: Object.assign({}, equipped) },
    }, seed);
    out.push(Object.assign({ weapon: weaponId, armor: armorId, mid: 'congregation', seed }, r));
  }
  return out;
}
async function batteryCustom(cfg) {
  const Game = await setupFightGame(9201);
  if (cfg.night) { try { Game.dayPart = 3; } catch (e) { console.warn('[audit] night set:', e && e.message); } }
  const out = [];
  const leaderItems = (cfg.items || ['machete']).slice();
  const leaderEq = cfg.equipped || { melee: { itemId: 'machete', name: 'machete' } };
  for (const seed of SEEDS) {
    const r = await runFight(Game, {
      mid: cfg.mid, hp: cfg.hp, ally: !!cfg.ally,
      noFlee: cfg.noFlee !== false, awareness: !!cfg.awareness,
      leader: { abils: cfg.abils || [], items: leaderItems.slice(), equipped: Object.assign({}, leaderEq), hp: cfg.leaderHp || 100 },
      allyCfg: { abils: cfg.allyAbils || [], items: ['machete'], equipped: { melee: { itemId: 'machete', name: 'machete' } }, hp: cfg.allyHp || 100 },
    }, seed);
    out.push(Object.assign({ tag: cfg.tag, seed }, r));
  }
  return out;
}
async function batterySynmods(synId) {
  const Game = await setupFightGame(9201);
  const syns = Game.data.synergies || [];
  const syn = syns.find(s => s.id === synId);
  if (!syn) throw new Error('synergy not found: ' + synId);
  const sch = Game.state.scholar;
  // Multi-path family (requires null): use the FIRST requires_any path.
  // Synergy-id legs must be marked DISCOVERED (scholar.synergies), not held.
  const reqPath = (syn.requires && syn.requires.length) ? syn.requires
    : ((syn.requires_any && syn.requires_any[0]) || []);
  const legAbilities = reqPath.filter(r => !r.includes(':') && !syns.some(s => s.id === r));
  const legSynergies = reqPath.filter(r => syns.some(s => s.id === r));
  const legTechs = reqPath.filter(r => r.startsWith('tech:')).map(r => r.slice(5));
  const legSkills = reqPath.filter(r => r.startsWith('skill:')).map(r => r.slice(6));
  const legItems = reqPath.filter(r => r.startsWith('item:')).map(r => r.slice(5));
  const applyLegs = () => {
    sch.abilities = legAbilities.map(id => ({ id, level: syn.minLevel || 1, xp: 0 }));
    Game.state.codex = Game.state.codex || {};
    Game.state.codex.techniques = Game.state.codex.techniques || {};
    for (const t of legTechs) Game.state.codex.techniques[t] = true;
    Game.state.codex.skills = Game.state.codex.skills || {};
    for (const s of legSkills) Game.state.codex.skills[s] = { level: syn.minLevel || 1 };
    sch.equipped = sch.equipped || {};
    for (const iid of legItems) sch.equipped.melee = { itemId: iid, name: iid };
    sch.synergies = (sch.synergies || []).concat(legSynergies);
  };
  const readMods = () => {
    let m = null;
    try { m = Game.mods ? Game.mods() : null; } catch (e) { m = { error: e.message }; }
    const targets = (syn.modifiers || []).map(x => x.target);
    const vals = {};
    try {
      const s = JSON.stringify(m || {});
      for (const t of targets) vals[t] = s.includes(t) ? 'present-in-mods-dump' : 'absent';
    } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
    return { modsType: m ? (Array.isArray(m) ? 'array' : typeof m) : 'null', modsKeys: m && typeof m === 'object' ? Object.keys(m).slice(0, 40) : [], targets: vals };
  };
  applyLegs();
  const baseDiscovered = (sch.synergies || []).slice();
  sch.synergies = baseDiscovered.filter(x => x !== synId);
  try { Game.recomputeActiveSynergies(); } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  const without = { active: (sch.activeSynergies || []).slice(), mods: readMods() };
  sch.synergies = baseDiscovered.concat([synId]);
  try { Game.recomputeActiveSynergies(); } catch (e) { console.warn("[audit] swallowed:", e && e.message); }
  const withSyn = { active: (sch.activeSynergies || []).slice(), mods: readMods() };
  return [{ synergy: synId, legs: { abilities: legAbilities, synergyLegs: legSynergies, techs: legTechs, skills: legSkills, items: legItems }, modifiers: syn.modifiers || [], without, with: withSyn }];
}
(async () => {
  const mode = process.argv[2];
  const DEFOUT = 'evidence/2026-11-01/audit-fixtures-20261101';
  let rows, tag, outdir = DEFOUT;
  if (mode === 'ability') {
    rows = await batteryAbility(process.argv[3], process.argv[4]);
    tag = `ability-${process.argv[3]}-${process.argv[4]}`;
    outdir = process.argv[5] || DEFOUT;
  } else if (mode === 'tiers') {
    rows = await batteryTiers(process.argv[3], process.argv[4], process.argv[5] || 'bulldozer');
    tag = `tiers-${process.argv[3]}-${process.argv[4]}-${process.argv[5] || 'bulldozer'}`;
    outdir = process.argv[6] || DEFOUT;
  } else if (mode === 'wave4') {
    rows = await batteryWave4(process.argv[3], process.argv[4]);
    tag = `wave4-${process.argv[3]}-${process.argv[4]}`;
    outdir = process.argv[5] || DEFOUT;
  } else if (mode === 'synmods') {
    rows = await batterySynmods(process.argv[3]);
    tag = `synmods-${process.argv[3]}`;
    outdir = process.argv[4] || DEFOUT;
  } else if (mode === 'custom') {
    // custom <tag> <leaderAbilsCSV|-> <allyAbilsCSV|-> <itemsCSV> <mid> <hp|auto>
    //   <leaderHp|100> <allyHp|100> <noFlee|true> <awareness|false> <night|false> <ally|true>
    const csv = s => (!s || s === '-') ? [] : s.split(',');
    const cfg = {
      tag: process.argv[3],
      abils: csv(process.argv[4]), allyAbils: csv(process.argv[5]),
      items: csv(process.argv[6]),
      mid: process.argv[7], hp: process.argv[8] === 'auto' ? undefined : parseInt(process.argv[8], 10),
      leaderHp: parseInt(process.argv[9] || '100', 10), allyHp: parseInt(process.argv[10] || '100', 10),
      noFlee: (process.argv[11] || 'true') === 'true',
      awareness: (process.argv[12] || 'false') === 'true',
      night: (process.argv[13] || 'false') === 'true',
      ally: (process.argv[14] || 'true') === 'true',
    };
    rows = await batteryCustom(cfg);
    tag = `custom-${process.argv[3]}`;
    outdir = process.argv[15] || DEFOUT;
  } else { console.error('unknown mode: ' + mode); process.exit(2); }
  fs.mkdirSync(path.join(__dirname, '..', outdir), { recursive: true });
  const fp = path.join(__dirname, '..', outdir, tag + '.json');
  fs.writeFileSync(fp, JSON.stringify(rows, null, 1));
  for (const r of rows) console.log(JSON.stringify(r));
  console.log(`WROTE ${fp} rows=${rows.length}`);
})().catch(e => { console.error('FIXTURE FAIL', e && e.stack || e); process.exit(1); });
