#!/usr/bin/env node
// test-water-20261016.js — DESIGN CALL 7 proof test (RED -> GREEN).
// "When the village becomes thirsty, villagers should adapt duties (fetch
// water, ration, seek sources) without the player micromanaging each one."
//
// Asserts, all without any player intervention:
//   A. A thirsty cistern (10L = < half a day's supply for the village) shifts
//      dawn duties toward WATER. BEFORE: zero WATER picks (cliff was <3L).
//   B. Thirst beats hunger: dry-ish cistern + empty pantry -> more WATER than
//      FORAGE picks. BEFORE: FORAGE (w 4-5.5) beat WATER (w 3.5).
//   C. Rationing: when the cistern can't cover a full 2L ration for everyone,
//      villageDrinks draws 1L/head, flags waterRationed, and announces the
//      decision once (not silently). BEFORE: full 2L draws, no flag, no line.
//   D. Recovery: once supply covers demand again, rationing lifts with a line.
//   E. Guard: a full cistern (100L) produces no WATER errands (no false thirst).
//
// Seeded via SEED env (default 7). One loadGame per process (harness rule).
// Uses scripts/sim-harness.js shared kit; never stubs Game.save.
const path = require('path');
const ROOT = path.join(__dirname, '..');
process.chdir(ROOT);
const { loadGame, setupGame } = require('./sim-harness.js');

const SEED = parseInt(process.env.SEED || '7', 10);
let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' | ' + detail : ''));
  if (!cond) failures++;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'test-water-20261016' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  const me = Game.villagerId;

  const living = () => (v.roster || []).filter(id => id !== me && !(Game.vpOf(id) || {}).dead);
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (m) { said.push(String(m)); return _say(m); };

  function neutralNeeds(hunger) {
    for (const id of living()) {
      const n = Game.npcNeeds(id);
      n.hunger = hunger != null ? hunger : 30; n.energy = 80; n.fear = 10; n.social = 40;
    }
  }
  function dawnPicks() {
    const counts = {};
    for (const id of living()) {
      const o = Game.objPick(id, hx, hy);
      counts[o.kind] = (counts[o.kind] || 0) + 1;
    }
    return counts;
  }

  // ---- A. thirsty cistern (10L, demand ~2L/head/day) -> duties shift to water
  neutralNeeds();
  v.pantry = v.pantry || [];
  v.water = { clean: 10, dirty: 0 };
  said.length = 0;
  const A = dawnPicks();
  const nA = living().length;
  const aTop = Math.max(0, ...Object.keys(A).filter(k => k !== 'WATER').map(k => A[k]));
  check('A thirst: WATER is the village\'s most common duty at 10L',
    (A.WATER || 0) >= aTop && (A.WATER || 0) > 0,
    `seed=${SEED} living=${nA} picks=${JSON.stringify(A)}`);

  // ---- B. thirst beats hunger: 2L clean + empty pantry + hungry villagers
  neutralNeeds(70);
  v.pantry = [];
  v.water = { clean: 2, dirty: 0 };
  const B = dawnPicks();
  check('B crisis: WATER picks outnumber FORAGE picks',
    (B.WATER || 0) > (B.FORAGE || 0),
    `seed=${SEED} picks=${JSON.stringify(B)}`);

  // ---- C. rationing: 20L can't cover full rations for the village
  neutralNeeds();
  v.water = { clean: 20, dirty: 0 };
  v.waterRationed = false;
  v.health = {};
  said.length = 0;
  const nL = living().length;
  Game.villageDrinks();
  const drawn = 20 - Math.floor(v.water.clean);
  check('C ration: draws 1L/head, not 2L/head', drawn === nL,
    `seed=${SEED} living=${nL} drawn=${drawn}L`);
  check('C ration: waterRationed flag set', v.waterRationed === true);
  check('C ration: decision announced (not silent)',
    said.some(s => s.includes('half rations')),
    `lines=${said.length}`);

  // ---- D. recovery: full cistern lifts rationing with a line
  v.water = { clean: 60, dirty: 0 };
  said.length = 0;
  Game.villageDrinks();
  check('D recovery: waterRationed flag cleared', v.waterRationed === false);
  check('D recovery: recovery announced',
    said.some(s => s.includes('full cups again')),
    `lines=${said.length}`);

  // ---- E. guard: full cistern -> no water errands
  neutralNeeds();
  v.water = { clean: 100, dirty: 0 };
  const E = dawnPicks();
  check('E calm: no WATER picks at 100L', (E.WATER || 0) === 0,
    `seed=${SEED} picks=${JSON.stringify(E)}`);

  console.log(failures === 0 ? 'GREEN' : `RED (${failures} failures)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
