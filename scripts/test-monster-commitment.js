#!/usr/bin/env node
// test-monster-commitment.js — proof for monster commitment (Steve 2026-11-02).
// Audit fixture pattern (scripts/audit-fixtures-20261101.js): bulldozer
// 80 HP, machete, seeds 9201-9205, fieldFight with seeded opts.rng.
// FRESH Game per case-group: fieldFight settles deeds/XP onto the
// fighter, so reusing one Game across ~200 fights inflates later
// strikes (the x1.2/x1.3 field mult grows) and corrupts comparisons.
// The audit used one fresh Game per battery-arm; this script does the
// same per case-group.
// Post-fix invariants are asserted; on baseline the commitment cases
// FAIL (mFlee where the fix holds the beast) and the controls pass.
// Usage: node scripts/test-monster-commitment.js
'use strict';
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
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}
async function fresh() {
  const { Game } = await loadGame({ seed: 9201 });
  await setupGame(Game);
  try { Game.state.scholar.day = 120; } catch (e) {}
  try { if (typeof Game.pantryAdd === 'function') Game.pantryAdd(200000, 'commitment fixture top-up'); } catch (e) {}
  const roster = ((Game.state.village || {}).roster || []).filter(id => id && id !== Game.villagerId);
  const leader = roster[0], ally = roster[1];
  function prepFighter(vid, opts) {
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
  function runFight(def, cfg, seed) {
    prepFighter(leader, cfg.leader || {});
    if (cfg.ally) prepFighter(ally, cfg.allyCfg || {});
    const hp = cfg.hp || (Array.isArray(def.hp) ? def.hp[0] : def.hp) || 80;
    const entity = { id: def.id, hp, maxHp: hp, tx: 2, ty: 2 };
    const opts = { allies: cfg.ally ? 1 : 0, allyVids: cfg.ally ? [ally] : [], allyFromStart: !!cfg.ally, rng: mulberry32(seed), noFlee: cfg.noFlee };
    const rec = Game.fieldFight(leader, def, entity, opts);
    try { Game.state.scholar.day = (Game.state.scholar.day || 120) + 1; } catch (e) {}
    return rec;
  }
  return { Game, leader, ally, prepFighter, runFight,
    bulldozer: (Game.data.monsters || []).find(m => m && m.id === 'bulldozer'),
    raccoon: (Game.data.monsters || []).find(m => m && m.id === 'lockpick_raccoon') };
}
async function main() {
  // A: perverse abilities — never flip a control kill into a beast flee.
  const PERVERSE = ['stalk', 'cheese_wheel', 'freeze_tag', 'fear_aura', 'switcheroo', 'pack_hunt', 'static_toss', 'field_medicine'];
  for (const ab of PERVERSE) {
    const hpVariants = ab === 'field_medicine' ? [100, 55] : [100];
    for (const hp of hpVariants) for (const noFlee of [true, false]) {
      const { runFight, bulldozer } = await fresh();
      const table = [];
      for (const seed of SEEDS) {
        const without2 = runFight(bulldozer, { hp: 80, leader: { abils: [], hp }, noFlee }, seed);
        const withAb = runFight(bulldozer, { hp: 80, leader: { abils: [ab], hp }, noFlee }, seed);
        table.push({ seed, without: without2.outcome, with: withAb.outcome, fired: (withAb.ffFired || []).join(',') });
      }
      const bad = table.filter(r => r.without === 'vKill' && r.with === 'mFlee');
      check('perverse ' + ab + ' hp=' + hp + ' noFlee=' + noFlee, bad.length === 0,
        JSON.stringify(table) + (bad.length ? ' BAD=' + JSON.stringify(bad) : ''));
    }
  }
  // B: ally config, no ability — baseline mFlee becomes a continued fight.
  {
    const { runFight, bulldozer } = await fresh();
    const outs = SEEDS.map(seed => runFight(bulldozer, { hp: 80, ally: true, allyCfg: {}, noFlee: true }, seed).outcome);
    check('ally-break-check', outs.every(o => o !== 'mFlee'), 'outcomes=' + outs.join(','));
  }
  // C: solo no-ability control — 9203 stays a kill (no regression).
  {
    const { runFight, bulldozer } = await fresh();
    const rec = runFight(bulldozer, { hp: 80, leader: {}, noFlee: true }, 9203);
    check('control-9203-kill', rec.outcome === 'vKill', 'outcome=' + rec.outcome);
  }
  // D: T4 weapon — one huge strike no longer scares the beast off.
  // Bulldozer at 100 HP: a maul strike (~85) leaves it at ~15, below
  // the 25% break line, alive — baseline flees, fixed kills round 2.
  {
    const { runFight, bulldozer } = await fresh();
    const rows = SEEDS.map(seed => {
      const rec = runFight(bulldozer, { hp: 100, leader: { items: ['worldbreaker_maul'], equipped: { melee: { itemId: 'worldbreaker_maul', name: 'worldbreaker_maul' } } }, noFlee: true }, seed);
      return { seed, outcome: rec.outcome, mDealt: rec.mDealt };
    });
    check('t4-weapon-kills', rows.every(r => r.outcome === 'vKill' && r.mDealt >= 100), JSON.stringify(rows));
  }
  // E: volley drive-off — no seed ends at the volley with a drive-off.
  {
    const { runFight, bulldozer } = await fresh();
    const rows = [];
    for (let seed = 9201; seed <= 9230; seed++) {
      const rec = runFight(bulldozer, { hp: 40, leader: { items: ['machete', 'crude_bow', { itemId: 'arrow', units: 4 }], equipped: { melee: { itemId: 'machete', name: 'machete' }, ranged: { itemId: 'crude_bow', name: 'crude_bow' } } }, noFlee: false }, seed);
      const log = (rec.log || []).join(' | ');
      const driveOff = rec.outcome === 'mFlee' && rec.rounds === 0 && /drove|broke before it ever closed/.test(log);
      const held = /holds its ground|holds the field/.test(log);
      rows.push({ seed, outcome: rec.outcome, rounds: rec.rounds, driveOff, held });
    }
    const offs = rows.filter(r => r.driveOff);
    const helds = rows.filter(r => r.held);
    check('volley-no-driveoff', offs.length === 0, 'driveOff=' + JSON.stringify(offs) + ' held=' + helds.length);
    console.log('INFO volley holds-ground seeds: ' + helds.map(r => r.seed).join(','));
  }
  // F: raccoon keeps fleeing (flag preserved). Entity HP 110: strikes
  // ~31/round land it at ~17 (below the 25% line) alive on round 3.
  {
    const { runFight, raccoon } = await fresh();
    const outs = SEEDS.map(seed => runFight(raccoon, { hp: 110, leader: {}, noFlee: false }, seed).outcome);
    check('raccoon-keeps-flee', outs.some(o => o === 'mFlee'), 'outcomes=' + outs.join(','));
  }
  // F2: kin duels keep fleeing (a person can flee) — via Game.nomadDrive.
  // Bare-hands fighter: a machete one-shots the 50-HP kin before it can
  // ever cross its break line alive, so the flag is proven with fists.
  {
    const { Game, leader, prepFighter } = await fresh();
    const fightKinFn = (Game.nomadDrive && Game.nomadDrive.fightKin) ? Game.nomadDrive.fightKin.bind(Game.nomadDrive) : null;
    if (fightKinFn) {
      const outs = SEEDS.map(seed => {
        prepFighter(leader, { items: [], equipped: {} });
        try { return fightKinFn(leader, 'TestKin', { rng: mulberry32(seed) }); } catch (e) { return 'error:' + e.message; }
      });
      check('kin-keeps-flee', outs.some(o => o === 'mFlee'), 'outcomes=' + outs.join(','));
    } else {
      console.log('SKIP kin-fightKin: Game.nomadDrive.fightKin not wired in harness');
    }
  }
  // F3: synthetic flee-flagged def (the kin_fighter shape) proves the
  // flag mechanism itself; the unflagged twin proves the gate.
  {
    const { runFight } = await fresh();
    const flagged = { id: 'kin_probe', name: 'Kin Probe', flee: true, hp: [130, 130], speed: 3, wave: 1, attacks: [{ name: 'swing', damage: [7, 12] }, { name: 'slash', damage: [9, 14] }] };
    const plain = { id: 'kin_probe_plain', name: 'Kin Probe', hp: [130, 130], speed: 3, wave: 1, attacks: [{ name: 'swing', damage: [7, 12] }, { name: 'slash', damage: [9, 14] }] };
    const outsF = SEEDS.map(seed => runFight(flagged, { hp: 130, leader: {}, noFlee: false }, seed).outcome);
    const outsP = SEEDS.map(seed => runFight(plain, { hp: 130, leader: {}, noFlee: false }, seed).outcome);
    check('flag-mechanism', outsF.some(o => o === 'mFlee') && outsP.every(o => o !== 'mFlee'),
      'flagged=' + outsF.join(',') + ' plain=' + outsP.join(','));
  }
  // G: round cap — tank fight runs 15 rounds; beast holds, fighter walks.
  // Two 1-damage attacks so the multi-attack picker runs (a single
  // attack falls back to the legacy damage range). 2000 HP keeps the
  // beast above its break line for all 15 rounds at ~30/round.
  {
    const { runFight } = await fresh();
    const tank = { id: 'cap_tank', name: 'Cap Tank', hp: [2000, 2000], speed: 1, wave: 1, attacks: [{ name: 'prod', damage: [1, 1] }, { name: 'poke', damage: [1, 1] }] };
    const rows = [9201, 9202, 9203].map(seed => {
      const rec = runFight(tank, { hp: 2000, leader: {}, noFlee: false }, seed);
      return { seed, outcome: rec.outcome, rounds: rec.rounds };
    });
    check('cap-committed', rows.every(r => r.rounds === 15 && r.outcome === 'vFlee'), JSON.stringify(rows));
    const arena = [9201, 9202, 9203].map(seed => {
      const rec = runFight(tank, { hp: 2000, leader: {}, noFlee: true }, seed);
      return { seed, outcome: rec.outcome, rounds: rec.rounds, judges: !!rec.judges };
    });
    check('cap-arena-judges-untouched', arena.every(r => r.rounds === 15 && r.outcome === 'mFlee' && r.judges), JSON.stringify(arena));
  }
  // H: tb helper gate.
  {
    const { Game } = await fresh();
    if (typeof Game.monsterMayFlee === 'function') {
      check('tb-helper-raccoon', Game.monsterMayFlee({ mdef: { id: 'lockpick_raccoon', flee: true, fleeAt: 0.5 } }) === true);
      check('tb-helper-bulldozer', Game.monsterMayFlee({ mdef: { id: 'bulldozer', fleeAt: 0 } }) === false);
      check('tb-helper-hostile', Game.monsterMayFlee({ kind: 'hostile' }) === false);
      check('tb-helper-nomdef', Game.monsterMayFlee({}) === false);
    } else {
      check('tb-helper-exists', false, 'Game.monsterMayFlee missing');
    }
  }
  // I: deliberate exceptions still work — stare-down + walk-in.
  {
    const { runFight, bulldozer } = await fresh();
    const stare = [];
    for (let seed = 9201; seed <= 9210; seed++) {
      const rec = runFight(bulldozer, { hp: 80, leader: { abils: ['intimidating_presence'] }, noFlee: false }, seed);
      stare.push({ seed, outcome: rec.outcome, staredDown: !!rec.staredDown });
    }
    check('stare-down-preserved', stare.some(r => r.outcome === 'mFlee' && r.staredDown), JSON.stringify(stare));
    const peace = [];
    for (let seed = 9201; seed <= 9210; seed++) {
      const rec = runFight(bulldozer, { hp: 80, leader: { abils: ['peacemaker'] }, noFlee: false }, seed);
      peace.push({ seed, outcome: rec.outcome, peaceful: !!rec.peaceful });
    }
    check('walk-in-preserved', peace.some(r => r.outcome === 'mFlee' && r.peaceful), JSON.stringify(peace));
  }
  console.log(failures === 0 ? 'ALL COMMITMENT CHECKS PASSED' : failures + ' COMMITMENT CHECK(S) FAILED');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
