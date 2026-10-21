#!/usr/bin/env node
// Proof: scripts/lib/death-census.js kind-aware taxonomy (journey-establishment r22, 2026-10-21).
// RED: the r21 cause-only reading on r21's own seed-82 evidence reproduces the
// published misread ("villager combat" cause counted as villager-vs-villager).
// GREEN: the census returns 0 true v-vs-v, 9 villager monster-kills, 2 person
// deaths on that same corpus — and correctly classifies synthetic ground-truth
// records for every taxonomy cell (v-vs-v ambush, player kill, villager kill,
// died-to-monster, needs death).
// Seeded PRNG not needed (pure function); SEED env accepted for convention.
'use strict';
const fs = require('fs');
const path = require('path');
const { census, r21Misread } = require('./lib/death-census');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ---- RED: r21's cause-only reading on r21's own seed-82 evidence ----
const EV82 = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-20/journey-establishment-r21-seed82.json';
let corpus = [];
try {
  const d = JSON.parse(fs.readFileSync(EV82, 'utf8'));
  corpus = d.deaths || [];
} catch (e) { console.log('  SKIP corpus: ' + e.message); }
if (corpus.length) {
  const misread = r21Misread(corpus);
  check('RED: cause-only reading reproduces the r21 misread (>=8 "villager combat")', misread >= 8, 'got ' + misread);
  const dc = census(corpus, { roster: ['v1', 'v2'], playerId: 'p' });
  check('GREEN: census finds 0 true villager-vs-villager on seed 82', dc.villagerVsVillager === 0, 'got ' + dc.villagerVsVillager);
  check('GREEN: census finds 9 villager monster-kills on seed 82', dc.villagerKilledMonster === 9, 'got ' + dc.villagerKilledMonster);
  check('GREEN: census finds 2 person deaths on seed 82', dc.personDeaths === 2, 'got ' + dc.personDeaths);
  check('GREEN: census finds 13 total monster deaths on seed 82', dc.monsterDeaths === 13, 'got ' + dc.monsterDeaths);
}

// ---- GREEN: synthetic ground truth, every taxonomy cell ----
const synth = [
  // true v-vs-v combat: villager killer, person victim
  { day: 10, kind: 'villager', who: 'v_anna', cause: 'combat', killerId: 'v_bob' },
  // betrayal ambush: villager killer
  { day: 11, kind: 'person', who: 'v_carl', cause: 'ambush', killerId: 'v_dana' },
  // player killed a villager
  { day: 12, kind: 'villager', who: 'v_erin', cause: 'combat', killerId: 'p' },
  // villager killed a monster (the trap cell)
  { day: 13, kind: 'monster', who: 'v_bob', cause: 'villager combat', killerId: 'v_bob' },
  // villager killed a monster on patrol
  { day: 14, kind: 'monster', who: 'v_finn', cause: 'patrol combat', killerId: 'v_finn' },
  // player killed a monster
  { day: 15, kind: 'monster', who: 'p', cause: 'combat', killerId: 'p' },
  // monster died on expedition
  { day: 16, kind: 'monster', who: 'm_x', cause: 'expedition', killerId: null },
  // villager died to a monster
  { day: 17, kind: 'villager', who: 'v_gus', cause: 'monster', killerId: null },
  // needs death
  { day: 18, kind: 'villager', who: 'v_hal', cause: 'starvation', killerId: null },
  // self-kill edge: killerId == victim is not v-vs-v
  { day: 19, kind: 'villager', who: 'v_ivy', cause: 'combat', killerId: 'v_ivy' },
];
const roster = ['v_anna', 'v_bob', 'v_carl', 'v_dana', 'v_erin', 'v_finn', 'v_gus', 'v_hal', 'v_ivy'];
const s = census(synth, { roster, playerId: 'p' });
check('synth: 2 true v-vs-v (combat + ambush)', s.villagerVsVillager === 2, 'got ' + s.villagerVsVillager);
check('synth: 1 betrayal ambush', s.betrayalAmbush === 1, 'got ' + s.betrayalAmbush);
check('synth: 1 player-killed villager', s.playerKilledVillager === 1, 'got ' + s.playerKilledVillager);
check('synth: 2 villager monster-kills (villager + patrol combat)', s.villagerKilledMonster === 2, 'got ' + s.villagerKilledMonster);
check('synth: 1 player monster-kill', s.playerKilledMonster === 1, 'got ' + s.playerKilledMonster);
check('synth: 1 villager died to monster', s.villagerDiedToMonster === 1, 'got ' + s.villagerDiedToMonster);
check('synth: 6 person deaths total', s.personDeaths === 6, 'got ' + s.personDeaths);
check('synth: 4 monster deaths total', s.monsterDeaths === 4, 'got ' + s.monsterDeaths);
check('synth: self-kill not counted as v-vs-v', s.villagerVsVillagerRecs.every(r => r.who !== r.killerId));

// unknown killer (corpse killerId=null open thread) must not fabricate v-vs-v
const unk = census([{ day: 20, kind: 'villager', who: 'v_jay', cause: 'combat', killerId: null }], { roster, playerId: 'p' });
check('unknown killer never fabricates v-vs-v', unk.villagerVsVillager === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
