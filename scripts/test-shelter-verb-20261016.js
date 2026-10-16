// test-shelter-verb-20261016.js — proof for the shelter/evacuate verb.
//
// RED (the pre-verb gap, sim-siegeroster 2026-10-15): the engine had a door
//   sub-state (npcInside) and a muster beat that read well — but neither
//   moved villagers off a threatened tile. An INSIDE villager on the Haven
//   node is still in the wild-jump victim pool: the door doesn't protect.
//   The RED phase drives the real villagerMonsterTick against an inside
//   villager and shows the jump landing.
// GREEN (post-verb): shelterVillagers() moves villagers to Haven, inside,
//   behind the shelter flag — and the three threat channels (wild jump,
//   raid draft, duties) all exclude them. Release and the policy hook
//   (muster beat -> verb -> all-clear) are proven end to end.
// Run: node scripts/test-shelter-verb-20261016.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-shelter-verb' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ non-scholar villagers');
  const A = roster[0], B = roster[1];

  // Scholar AWAY from Haven so the Haven tile isn't skipped by the wild router.
  Game.map.px = 0; Game.map.py = 0;
  // Both villagers on the Haven node.
  Game.npcSetNode(A, hx, hy); Game.npcSetNode(B, hx, hy);

  // A wave-4 monster on the Haven tile.
  const w4def = (Game.data.monsters || []).find(m => (m.wave || 1) === 4);
  assert(w4def, 'need a wave-4 monster def');
  Game.spawnWorldMonster(w4def, hx, hy, {});

  // Spy: replace the fight with a recorder (we're proving ROUTING, not combat).
  const jumped = [];
  const realRWME = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = (vid, m, opts) => {
    jumped.push({ vid, raid: !!(opts && opts.raid) });
    return { outcome: 'vFlee' };
  };

  // ---- RED: the door doesn't protect ----
  console.log('RED phase (the pre-verb gap):');
  Game.npcSetInside(A, true); // A is "inside" — the old door sub-state
  ok('RED: no shelter flag without the verb', !Game.isSheltered(A));
  jumped.length = 0;
  for (let i = 0; i < 80; i++) Game.villagerMonsterTick();
  const redJumpedA = jumped.some(j => j.vid === A && !j.raid);
  ok('RED: wild channel is live (someone got jumped)', jumped.length > 0, `jumps=${jumped.length}`);
  ok('RED: an INSIDE villager is still jumped (the door protects nothing)', redJumpedA);

  // ---- GREEN: the verb ----
  console.log('GREEN phase (the verb):');
  ok('verb exists', typeof Game.shelterVillagers === 'function');
  ok('threat gate exists', typeof Game.shelterThreatNearHaven === 'function');

  // Threat detection.
  const threat = Game.shelterThreatNearHaven();
  ok('threat detected: wave-4 at Haven', !!threat && threat.wave >= 4 && threat.dist === 0,
    JSON.stringify(threat && { wave: threat.wave, dist: threat.dist }));
  Game.state.worldMonsters = [];
  ok('no threat when the treeline is clear', Game.shelterThreatNearHaven() === null);
  const w1def = (Game.data.monsters || []).find(m => (m.wave || 1) === 1);
  Game.spawnWorldMonster(w1def, hx, hy, {});
  ok('wave-1 ignored by the gate', Game.shelterThreatNearHaven() === null);
  Game.state.worldMonsters = [];
  Game.spawnWorldMonster(w4def, hx, hy, {});

  // Shelter A (B stays out as the control).
  const n = Game.shelterVillagers([A], { reason: 'test', threatName: w4def.name || w4def.id });
  ok('shelterVillagers shelters one', n === 1);
  ok('isSheltered(A)', Game.isSheltered(A) === true);
  ok('isSheltered(B) false', Game.isSheltered(B) === false);
  const nA = Game.npcNode(A);
  ok('A evacuated to the Haven node', nA.nx === hx && nA.ny === hy);
  ok('A is inside the hall', Game.npcInside(A) === true);
  ok('shelteredVillagers lists A', Game.shelteredVillagers().includes(A));
  ok('scholar never auto-sheltered', Game.shelterVillagers([Game.villagerId]) === 0);
  ok('double-shelter is a no-op', Game.shelterVillagers([A]) === 0);

  // Wild protection: the real tick, 80 rounds.
  jumped.length = 0;
  for (let i = 0; i < 80; i++) Game.villagerMonsterTick();
  const greenJumpedA = jumped.some(j => j.vid === A && !j.raid);
  const greenJumpedB = jumped.some(j => j.vid === B && !j.raid);
  ok('sheltered A never jumped', !greenJumpedA, `A-jumps=${jumped.filter(j => j.vid === A).length}`);
  ok('unsheltered B still jumped (channel live)', greenJumpedB);

  // Raid-draft protection: force a raid, watch the draft.
  v.lastRaidDay = (Game.state.scholar.day || 1) - 8;
  Game.state.worldMonsters = [];
  Game.spawnWorldMonster(w1def, 0, 1, {}); Game.spawnWorldMonster(w1def, 1, 0, {});
  Game.spawnWorldMonster(w1def, 2, 2, {});
  Game.stockPantry(5000, 'raid test', { pieceKcal: 500 });
  v.health = v.health || {}; v.health[A] = 100; v.health[B] = 100;
  const day = Game.state.scholar.day || 1;
  let fired = false;
  for (let i = 0; i < 60 && !fired; i++) {
    Game.havenRaidTick();
    if ((v.lastRaidDay || 0) === day) fired = true;
  }
  ok('raid fired under forced preconditions', fired);
  const raidDrafts = jumped.filter(j => j.raid).map(j => j.vid);
  ok('raid drafted the unsheltered villager', raidDrafts.includes(B), JSON.stringify(raidDrafts));
  ok('raid never drafted the sheltered villager', !raidDrafts.includes(A), JSON.stringify(raidDrafts));

  // Duty protection: sheltered keeps (not loses) the assignment; the control resolves.
  v.assignments = v.assignments || {};
  v.assignments[A] = { task: 'wood', assignedDay: day };
  v.assignments[B] = { task: 'wood', assignedDay: day };
  Game.resolveAssignments();
  ok('sheltered A kept the assignment (skipped, not stripped)', !!v.assignments[A]);
  ok('unsheltered B resolved the assignment', !v.assignments[B]);

  // Release.
  const rel = Game.shelterAllClear();
  ok('all-clear releases', rel === 1);
  ok('A no longer sheltered', !Game.isSheltered(A));
  ok('shelteredVillagers empty', Game.shelteredVillagers().length === 0);

  // Policy hook: the muster beat -> verb -> all-clear episode.
  console.log('POLICY phase (beat -> verb -> all-clear):');
  const shelter = require('./policies/shelter');
  delete process.env.SHELTER;
  ok('gate off when SHELTER unset', shelter.shelterOn() === false);
  process.env.SHELTER = '1';
  ok('gate on when SHELTER=1', shelter.shelterOn() === true);
  const said = [];
  const realSay = Game.say;
  Game.say = (t) => { said.push(String(t)); };
  try {
    Game.state.worldMonsters = [];
    Game.spawnWorldMonster(w4def, hx, hy, {});
    const ctx = {};
    shelter.musterCheck(Game, ctx);
    ok('muster episode opens on threat', ctx._shelterMustered === true);
    ok('muster beat fired (the proven text)', said.some(t => /📯 MUSTER/.test(t) && /Everyone inside/.test(t)));
    ok('verb moved the village inside', Game.isSheltered(A) && Game.isSheltered(B));
    // Threat gone -> stand down.
    Game.state.worldMonsters = [];
    said.length = 0;
    shelter.musterCheck(Game, ctx);
    ok('episode closes on all-clear', ctx._shelterMustered === false);
    ok('stand-down beat fired', said.some(t => /ALL CLEAR/.test(t)));
    ok('village released', !Game.isSheltered(A) && !Game.isSheltered(B));
    // Idempotent: no threat, no muster — nothing fires twice.
    said.length = 0;
    shelter.musterCheck(Game, ctx);
    ok('quiet when already stood down', said.length === 0 && ctx._shelterMustered === false);
  } finally {
    Game.say = realSay;
    Game.resolveWildMonsterEncounter = realRWME;
  }
  delete process.env.SHELTER;

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
