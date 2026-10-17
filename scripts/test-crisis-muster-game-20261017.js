// test-crisis-muster-game-20261017.js — CRISIS LEG r20: THE MUSTER THAT NEVER FIRES.
//
// The gap (found in audit): src/js/shelter.js shipped the shelter/evacuate
// verb (2026-10-16) but NOTHING in the game calls it — no auto-muster beat,
// no UI, no NPC initiative. The only caller was scripts/policies/shelter.js,
// a bot policy gated on SHELTER=1 (default OFF). In the game Steve plays, a
// wave-4+ monster near Haven triggers NO muster: the village never goes
// inside, villagers stay exposed.
//
// The fix (this run): the game owns the episode — shelterMusterCheck(),
// fired daily from progDaily ahead of the raid tick: scout-report beat
// (knowledge-gated noun) + shelterEveryoneBut + 'mustered' memories for the
// lately system; all-clear when the threat leaves; Haven-panel stand-down /
// re-muster buttons (the player's call, their risk); the bot policy
// delegates (no double beats).
//
// RED: on pre-fix code, Game.shelterMusterCheck does not exist — the muster
//   never fires in the game path. (Verified via patch-file round-trip:
//   git diff > patch, git checkout HEAD -- the 4 files, run, re-apply.)
// GREEN: the episode fires end to end in the game path.
// Run: SEED=7 node scripts/test-crisis-muster-game-20261017.js (seeds 7/42/99)
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '7', 10);
let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-crisis-muster-game' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 2, 'need 2+ non-scholar villagers');
  const A = roster[0], B = roster[1];

  // Scholar AWAY from Haven so the Haven tile isn't skipped by the router.
  Game.map.px = 0; Game.map.py = 0;

  const w4def = (Game.data.monsters || []).find(m => (m.wave || 1) === 4);
  assert(w4def, 'need a wave-4 monster def');
  const trueName = w4def.name || w4def.id;
  let gatedNoun = null;
  try { gatedNoun = Game.monsterNoun(w4def.id); } catch (e) { gatedNoun = trueName; }

  const said = [];
  const realSay = Game.say;
  Game.say = (t) => { said.push(String(t)); };

  // Spy: record wild jumps (routing, not combat).
  const jumped = [];
  const realRWME = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = (vid, m, opts) => {
    jumped.push({ vid, raid: !!(opts && opts.raid) });
    return { outcome: 'vFlee' };
  };

  try {
    // ---- THE GAME OWNS THE EPISODE ----
    console.log('game-side muster (RED on pre-fix: no such function):');
    ok('Game.shelterMusterCheck exists', typeof Game.shelterMusterCheck === 'function');
    ok('Game.shelterMuster exists (manual re-muster)', typeof Game.shelterMuster === 'function');
    ok('Game.shelterStandDown exists (manual stand-down)', typeof Game.shelterStandDown === 'function');

    // Stage the threat: wave-4 at Haven.
    Game.state.worldMonsters = [];
    Game.spawnWorldMonster(w4def, hx, hy, {});
    said.length = 0;
    const r1 = Game.shelterMusterCheck();
    ok('muster fires on wave-4 at Haven', r1 && r1.mustered === true);
    const beat = said.find(t => /MUSTER/.test(t)) || '';
    ok('muster beat fired (scout report)', /📯 MUSTER/.test(beat) && /Everyone inside/.test(beat), beat.slice(0, 80));
    if (gatedNoun && gatedNoun !== trueName) {
      ok('threat named via knowledge-gated noun, not the true name',
        beat.includes(gatedNoun) && !beat.includes(trueName),
        `noun=${gatedNoun} true=${trueName}`);
    } else {
      ok('threat named (noun==true name this seed — gate vacuous)', beat.includes(trueName));
    }
    const allIn = roster.every(id => Game.isSheltered(id));
    ok('every non-scholar villager sheltered', allIn, `sheltered=${Game.shelteredVillagers().length}/${roster.length}`);
    ok('scholar never auto-sheltered', !Game.isSheltered(Game.villagerId));
    const nA = Game.npcNode(A);
    ok('evacuated to the Haven node', nA.nx === hx && nA.ny === hy);
    ok('inside the hall', Game.npcInside(A) === true);
    ok('episode flag set', !!(v.shelterMustered && v.shelterMustered.threat));
    const memA = ((v.memory || {})[A] || []).find(m => m.t === 'mustered');
    ok("'mustered' memory booked (lately surface)", !!(memA && memA.threat), JSON.stringify(memA && { t: memA.t, threat: memA.threat }));

    // Idempotent: no double beat, no re-muster.
    said.length = 0;
    Game.shelterMusterCheck();
    ok('no second muster beat while mustered', !said.some(t => /MUSTER/.test(t)));

    // ---- PROTECTION IS MECHANICAL ----
    console.log('mechanical protection:');
    Game.releaseShelter([B]); // B is the unsheltered control
    jumped.length = 0;
    for (let i = 0; i < 80; i++) Game.villagerMonsterTick();
    ok('sheltered A never jumped', !jumped.some(j => j.vid === A && !j.raid),
      `A-jumps=${jumped.filter(j => j.vid === A).length}`);
    ok('unsheltered B still jumped (channel live)', jumped.some(j => j.vid === B && !j.raid),
      `jumps=${jumped.length}`);
    v.assignments = v.assignments || {};
    v.assignments[A] = { task: 'wood', assignedDay: Game.state.scholar.day || 1 };
    v.assignments[B] = { task: 'wood', assignedDay: Game.state.scholar.day || 1 };
    Game.resolveAssignments();
    ok('sheltered A kept the assignment (skipped, not stripped)', !!v.assignments[A]);
    ok('unsheltered B resolved the assignment', !v.assignments[B]);

    // ---- ALL-CLEAR ----
    console.log('all-clear:');
    Game.state.worldMonsters = [];
    said.length = 0;
    const r2 = Game.shelterMusterCheck();
    ok('all-clear fires when the threat leaves', r2 && r2.mustered === false);
    ok('single ALL CLEAR beat', said.filter(t => /ALL CLEAR/.test(t)).length === 1, said.join(' | ').slice(0, 120));
    ok('village released', Game.shelteredVillagers().length === 0);
    ok('episode flag cleared', !v.shelterMustered);
    said.length = 0;
    Game.shelterMusterCheck();
    ok('quiet when already stood down', said.length === 0);

    // ---- STAND-DOWN (the player's call) ----
    console.log('manual stand-down / re-muster:');
    Game.spawnWorldMonster(w4def, hx, hy, {});
    said.length = 0;
    Game.shelterMusterCheck();
    ok('re-muster on new threat', !!v.shelterMustered);
    const mon = (Game.worldMonsters() || [])[0];
    const nDown = Game.shelterStandDown();
    ok('stand-down releases', nDown > 0 && Game.shelteredVillagers().length === 0 && !v.shelterMustered);
    ok('threat stamped stood-down', !!(mon && mon.shelterStoodDown));
    said.length = 0;
    Game.shelterMusterCheck();
    ok('no re-muster behind the player\'s back', !v.shelterMustered && !said.some(t => /MUSTER/.test(t)));
    const nUp = Game.shelterMuster();
    ok('manual re-muster clears the stamp and musters', nUp > 0 && !!v.shelterMustered);
    Game.shelterStandDown();

    // ---- POLICY DELEGATION (no double beats) ----
    console.log('policy delegation:');
    const shelter = require('./policies/shelter');
    delete process.env.SHELTER;
    ok('gate off when SHELTER unset', shelter.shelterOn() === false);
    process.env.SHELTER = '1';
    Game.state.worldMonsters = [];
    Game.spawnWorldMonster(w4def, hx, hy, {});
    said.length = 0;
    const ctx = {};
    shelter.musterCheck(Game, ctx);
    ok('policy opens the episode', ctx._shelterMustered === true);
    ok('exactly one muster beat (no double)', said.filter(t => /📯 MUSTER/.test(t)).length === 1,
      `muster-beats=${said.filter(t => /MUSTER/.test(t)).length}`);
    said.length = 0;
    shelter.musterCheck(Game, ctx);
    ok('policy idempotent while mustered', !said.some(t => /MUSTER/.test(t)));
    Game.state.worldMonsters = [];
    said.length = 0;
    shelter.musterCheck(Game, ctx);
    ok('policy closes the episode', ctx._shelterMustered === false);
    ok('stand-down beat fired', said.some(t => /ALL CLEAR/.test(t)));
    delete process.env.SHELTER;

    // ---- THE DAILY HOOK (progDaily path) ----
    console.log('progDaily path:');
    Game.state.worldMonsters = [];
    Game.spawnWorldMonster(w4def, hx, hy, {});
    delete v.shelterMustered;
    said.length = 0;
    Game.progDaily();
    ok('muster fires from the daily tick', !!v.shelterMustered, `mustered=${!!v.shelterMustered}`);
    ok('muster beat via progDaily', said.some(t => /📯 MUSTER/.test(t)));
    Game.state.worldMonsters = [];
  } finally {
    Game.say = realSay;
    Game.resolveWildMonsterEncounter = realRWME;
    delete process.env.SHELTER;
  }

  console.log(`\nseed ${SEED}: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
