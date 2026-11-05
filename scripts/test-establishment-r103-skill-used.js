#!/usr/bin/env node
// scripts/test-establishment-r103-skill-used.js — journey-establishment r103
// PROOF for the actor-attributed field-fight skill-use instrument:
//  (1) fieldFights.js ffFired completion: a held ability/skill that changes
//      a field fight lands on rec.ffFired;
//  (2) telemetry-hooks.js fieldFight wrap: each unique fired id emits one
//      skill_used telemetry row {vid, skill, context:'field_fight', outcome};
//  (3) ability_used rows carry actor:'player' (useAbility is the
//      player-facing entry point);
//  (4) control: a villager holding nothing emits no skill_used rows.
// Cases run on load seeds 7, 42, 99 (MEASUREMENT §5: ≥3 seeds). Each case
// loads a fresh game; fights use a fixed mulberry32 stream. Monster:
// hummice (wave 1, hp 10-14, damage 4-8) — weak enough that the leader
// always reaches their round-1 action, with no monster tricks.
// Usage: node scripts/test-establishment-r103-skill-used.js
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
const LOAD_SEEDS = [7, 42, 99];

async function fightCase(loadSeed, abils, hp, fightSeed, extraOpts) {
  const { Game: G, loadFails } = await loadGame({ seed: loadSeed, mode: 'establishment-r103-skill-used' });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no roster villagers on seed ' + loadSeed);
  const leader = roster[0];
  const v = G.state.village || (G.state.village = {});
  v.npcAbilities = v.npcAbilities || {};
  v.npcAbilities[leader] = abils.slice();
  v.health = v.health || {};
  v.health[leader] = hp;
  const def = (G.data.monsters || []).find(m => m && m.id === 'hummice');
  if (!def) throw new Error('monster def not found: hummice');
  const entity = { id: def.id, hp: 12, maxHp: 12, tx: 2, ty: 2 };
  const teleBefore = (G.state.telemetry || []).length;
  const rec = G.fieldFight(leader, def, entity, Object.assign({ rng: mulberry32(fightSeed) }, extraOpts || {}));
  const rows = (G.state.telemetry || []).slice(teleBefore).filter(t => t && t.type === 'skill_used');
  return { leader, rec, rows };
}

async function main() {
  let failures = 0;
  const check = (name, cond, detail) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
    if (!cond) failures++;
  };
  for (const seed of LOAD_SEEDS) {
    // 1. STALK: round-1 strike, +4. The strike else-branch is reached on
    // round 1 with a fresh monster and no competing ability branch held.
    let r = await fightCase(seed, ['stalk'], 100, 1000 + seed);
    check(`seed${seed} stalk fires (record)`, (r.rec.ffFired || []).includes('stalk'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome} rounds=${r.rec.rounds}`);
    check(`seed${seed} stalk fires (telemetry)`, r.rows.some(x => x.vid === r.leader && x.skill === 'stalk' && x.context === 'field_fight'),
      `skill_used=${JSON.stringify(r.rows.map(x => x.skill))}`);
    // 2. FIELD_MEDICINE: hurt leader (50/100 < 60% max) spends the turn
    // binding the wound instead of striking.
    r = await fightCase(seed, ['field_medicine'], 50, 2000 + seed);
    check(`seed${seed} field_medicine fires (record)`, (r.rec.ffFired || []).includes('field_medicine'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome} rounds=${r.rec.rounds}`);
    check(`seed${seed} field_medicine fires (telemetry)`, r.rows.some(x => x.vid === r.leader && x.skill === 'field_medicine'),
      `skill_used=${JSON.stringify(r.rows.map(x => x.skill))}`);
    // 3. GAME_SENSE: the awareness evade computation — held ability changes
    // the evade chance, so the firing is recorded before the roll, whatever
    // the outcome (evade or walk-in).
    r = await fightCase(seed, ['game_sense'], 100, 3000 + seed, { awareness: true });
    check(`seed${seed} game_sense fires (record)`, (r.rec.ffFired || []).includes('game_sense'),
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome}`);
    check(`seed${seed} game_sense fires (telemetry)`, r.rows.some(x => x.vid === r.leader && x.skill === 'game_sense'),
      `skill_used=${JSON.stringify(r.rows.map(x => x.skill))}`);
    // 4. CONTROL: nothing held, nothing recorded, nothing emitted.
    r = await fightCase(seed, [], 100, 4000 + seed);
    check(`seed${seed} control: no ffFired`, !(r.rec.ffFired || []).length,
      `ffFired=${JSON.stringify(r.rec.ffFired)} outcome=${r.rec.outcome}`);
    check(`seed${seed} control: no skill_used rows`, r.rows.length === 0,
      `skill_used=${JSON.stringify(r.rows.map(x => x.skill))}`);
    // 5. ABILITY_USED ACTOR: any useAbility call emits a row naming the
    // player. purify.cleanse refuses outside combat (ok:false) — the row
    // still fires, which is the point: the wrap is unconditional.
    const loaded = await loadGame({ seed, mode: 'establishment-r103-skill-used' });
    if (loaded.loadFails.length) throw new Error('loadFails: ' + loaded.loadFails.join('; '));
    const G2 = loaded.Game;
    await setupGame(G2);
    const n0 = (G2.state.telemetry || []).length;
    let threw = null;
    try { G2.activateAbility('purify.cleanse'); } catch (e) { threw = e; }
    const newRows = (G2.state.telemetry || []).slice(n0).filter(t => t && t.type === 'ability_used');
    check(`seed${seed} ability_used carries actor=player`, !threw && newRows.length > 0 && newRows.every(x => x.actor === 'player'),
      threw ? ('threw: ' + (threw && threw.message)) : `rows=${JSON.stringify(newRows.map(x => ({ id: x.id, action: x.action, actor: x.actor, ok: x.ok })))}`);
  }
  console.log(failures === 0 ? 'ALL-PASS' : `FAILURES=${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('PROOF-FAIL', e && e.stack || e); process.exit(1); });
