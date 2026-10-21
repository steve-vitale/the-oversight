#!/usr/bin/env node
// Proof: scripts/lib/death-census.js M1a/M1b split helpers
// (journey-establishment r23, 2026-10-21).
// RED: the unsplit census() union count conflates open-combat v-vs-v with
// betrayal-ambush killing — r22's M1 zero-prong failure mode, reproduced on
// synthetic ground truth (union = 2, undifferentiated).
// GREEN: openCombatVV() and betrayalAmbushRecs() separate the two cells;
// each excludes player kills, self-kills, unknown-killer combat deaths,
// monster records, and each other's cell.
// Seeded PRNG not needed (pure functions).
'use strict';
const { census, openCombatVV, betrayalAmbushRecs, r21Misread } = require('./lib/death-census');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

const ROSTER = ['gen_aaa', 'gen_bbb', 'gen_ccc', 'gen_ddd', 'gen_eee', 'gen_fff'];
const synth = [
  // open-combat v-vs-v: kind person, cause 'combat', villager killer
  { day: 20, who: 'gen_aaa', kind: 'person', cause: 'combat', killerId: 'gen_bbb' },
  // betrayal ambush: kind villager, cause 'ambush', villager killer
  { day: 10, who: 'gen_ccc', kind: 'villager', cause: 'ambush', killerId: 'gen_ddd' },
  // player kill: kind villager, cause 'combat', player killer — in NEITHER cell
  { day: 22, who: 'gen_eee', kind: 'villager', cause: 'combat', killerId: 'player' },
  // villager monster kill: kind monster — in NEITHER cell
  { day: 15, who: 'm1', kind: 'monster', cause: 'villager combat', killerId: 'gen_aaa' },
  // died to monster: kind villager, cause 'monster', no killer — in NEITHER cell
  { day: 17, who: 'gen_fff', kind: 'villager', cause: 'monster', killerId: null },
  // self-kill edge: killer == victim — in NEITHER cell
  { day: 19, who: 'gen_aaa', kind: 'villager', cause: 'combat', killerId: 'gen_aaa' },
  // unknown-killer combat death: kind villager, cause 'combat', no killer — in NEITHER cell
  { day: 24, who: 'gen_bbb', kind: 'villager', cause: 'combat', killerId: null },
  // needs death: kind villager, cause starvation — in NEITHER cell
  { day: 30, who: 'gen_ddd', kind: 'villager', cause: 'starvation', killerId: null },
];
const opts = { roster: ROSTER, playerId: 'p' };

// ---- RED: the union conflates the two mechanics ----
const dc = census(synth, opts);
check('RED: union villagerVsVillager conflates ambush+open-combat (=2, undifferentiated)',
  dc.villagerVsVillager === 2, 'got ' + dc.villagerVsVillager);

// ---- GREEN: the split separates them ----
const m1a = openCombatVV(synth, opts);
const m1b = betrayalAmbushRecs(synth, opts);
check('GREEN: openCombatVV finds exactly the 1 open-combat record',
  m1a.length === 1 && m1a[0].who === 'gen_aaa' && m1a[0].killerId === 'gen_bbb',
  JSON.stringify(m1a));
check('GREEN: betrayalAmbushRecs finds exactly the 1 ambush record',
  m1b.length === 1 && m1b[0].who === 'gen_ccc' && m1b[0].killerId === 'gen_ddd',
  JSON.stringify(m1b));
check('GREEN: split union equals census union (no double count, no loss)',
  m1a.length + m1b.length === dc.villagerVsVillager,
  `${m1a.length}+${m1b.length} vs ${dc.villagerVsVillager}`);
check('GREEN: openCombatVV excludes player kill, self-kill, unknown-killer, monster, needs',
  m1a.every(r => !['gen_eee', 'gen_fff', 'gen_bbb', 'gen_ddd', 'm1'].includes(r.who)),
  JSON.stringify(m1a.map(r => r.who)));
check('GREEN: betrayalAmbushRecs excludes the open-combat record',
  m1b.every(r => r.who !== 'gen_aaa')), 'got ' + JSON.stringify(m1b.map(r => r.who));
check('GREEN: r21Misread still only catches the monster-kill cause (=1), not real v-vs-v',
  r21Misread(synth) === 1, 'got ' + r21Misread(synth));
// real r23 corpus: seed 124's Nathan ambush must land in M1b and NOT M1a
const seed124 = require('/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-21/journey-establishment-r23-seed124.json');
const d124 = seed124.deaths || [];
const roster124 = (() => { try { return (seed124.deathCensus && seed124.deathCensus._roster) || null; } catch (e) { return null; } })();
check('GREEN: r23 seed-124 Nathan ambush in M1b', betrayalAmbushRecs(d124, { playerId: 'p' }).length === 1,
  'got ' + betrayalAmbushRecs(d124, { playerId: 'p' }).length);
check('GREEN: r23 seed-124 M1a empty', openCombatVV(d124, { playerId: 'p' }).length === 0,
  'got ' + openCombatVV(d124, { playerId: 'p' }).length);
const allSeeds = [61, 82, 103, 124].map(s =>
  require(`/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-21/journey-establishment-r23-seed${s}.json`));
const m1aAll = allSeeds.reduce((n, sj) => n + openCombatVV(sj.deaths || [], { playerId: 'p' }).length, 0);
const m1bAll = allSeeds.reduce((n, sj) => n + betrayalAmbushRecs(sj.deaths || [], { playerId: 'p' }).length, 0);
check('GREEN: r23 corpus M1a=0 across all 4 seeds', m1aAll === 0, 'got ' + m1aAll);
check('GREEN: r23 corpus M1b=1 across all 4 seeds (the Nathan ambush)', m1bAll === 1, 'got ' + m1bAll);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
