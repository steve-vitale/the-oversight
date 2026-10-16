// sense-shelter-verb-20261016.js — narrative sense-read for the shelter verb.
// A wave-4 threat hunts near Haven; the muster fires; the village goes
// inside; the threat jumps the grounds and finds no one; all-clear.
// Run: node scripts/sense-shelter-verb-20261016.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 777, mode: 'sense-shelter-verb' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId).slice(0, 4);
  const names = roster.map(id => { try { return Game.displayName(id); } catch (e) { return id; } });
  console.log(`The village: ${names.join(', ')} (scholar: ${Game.displayName(Game.villagerId)})`);

  const lines = [];
  const realSay = Game.say;
  Game.say = (t) => { lines.push(String(t)); };

  // Scholar away; villagers on the Haven grounds (outside, working).
  Game.map.px = 0; Game.map.py = 0;
  for (const id of roster) { Game.npcSetNode(id, hx, hy); Game.npcSetInside(id, false); }

  // A wave-4 threat pads onto the Haven tile.
  const w4def = (Game.data.monsters || []).find(m => (m.wave || 1) === 4);
  const mName = w4def.name || w4def.id;
  Game.spawnWorldMonster(w4def, hx, hy, {});
  console.log(`\nDUSK — a ${mName} pads onto the Haven grounds.\n`);

  // The policy sees it.
  process.env.SHELTER = '1';
  const shelter = require('./policies/shelter');
  const ctx = {};
  shelter.musterCheck(Game, ctx);

  console.log('--- the village hears ---');
  for (const l of lines) console.log('  ' + l);
  lines.length = 0;

  console.log('\n--- state after the muster ---');
  for (let i = 0; i < roster.length; i++) {
    const id = roster[i];
    const n = Game.npcNode(id);
    console.log(`  ${names[i]}: node=(${n.nx},${n.ny}) inside=${Game.npcInside(id)} sheltered=${Game.isSheltered(id)}`);
  }

  // The threat hunts the grounds — wild ticks, real routing, fights stubbed
  // so we watch the ROUTING (who gets jumped), not the combat.
  const jumped = [];
  Game.resolveWildMonsterEncounter = (vid) => { jumped.push(vid); return { outcome: 'vFlee' }; };
  for (let i = 0; i < 30; i++) Game.villagerMonsterTick();
  const jumpedNames = jumped.map(id => names[roster.indexOf(id)] || id);
  console.log(`\n--- the ${mName} hunts (30 wild ticks) ---`);
  console.log(`  jumped: ${jumpedNames.length ? [...new Set(jumpedNames)].join(', ') : 'NO ONE — the grounds are empty'}`);

  // The threat moves off; stand down.
  Game.state.worldMonsters = [];
  shelter.musterCheck(Game, ctx);
  console.log('\n--- all clear ---');
  for (const l of lines) console.log('  ' + l);
  console.log(`  sheltered now: ${Game.shelteredVillagers().length} (released: ${!Game.isSheltered(roster[0])})`);

  Game.say = realSay;
  delete process.env.SHELTER;
  console.log('\nSENSE-READ COMPLETE');
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
