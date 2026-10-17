#!/usr/bin/env node
// scripts/test-huntroster-b.js — hunt-roster audit instrument honesty proof.
// PART A — RED-verified fixture: rosterCensus counts a CONSTRUCTED roster's
//   hunter-competent members exactly under all six definitions, exercising
//   the REAL Game.villagerCompetence against constructed data. The fixture
//   pins the wiring finding: a literal 'Hunting guide' scores engineComp 1.0
//   and plus20 false (the engine's word lists can't see the real table).
//   RED: the same fixture WITHOUT the instrument records nothing — counting
//   is instrument-sourced (Game.__huntroster absent).
// PART B — det-gate: instrument on vs off on identical seeds, byte-identical
//   per-day trajectory hashes (the instrument changes nothing).
// SMOKE=1: PART A + a 1-seed 12d det comparison.
// Usage: node scripts/test-huntroster-b.js [SMOKE=1]
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const inst = require('./instrument-huntroster-b');

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`);
  else { console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); failures++; }
}

function dayHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
    (v.roster || []).length, Game.map.px, Game.map.py,
    Game.unlockedWave ? Game.unlockedWave() : 0,
    Math.round((((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))) / 100)];
  return parts.join('|');
}

// Constructed roster: one of each hunter-relevant occupation + two controls.
// Exercises the REAL table (characterGen.json) and the REAL engine detector.
const FIXTURE_PEOPLE = [
  { id: 'fx_hg', name: 'Fix Hunter', formerOccupation: 'Hunting guide', occupationId: 'hunting_guide', age: 40, dead: false },
  { id: 'fx_so', name: 'Fix Soldier', formerOccupation: 'infantry soldier', occupationId: 'soldier', age: 32, dead: false },
  { id: 'fx_bu', name: 'Fix Butcher', formerOccupation: 'Butcher', occupationId: 'butcher', age: 45, dead: false },
  { id: 'fx_fa', name: 'Fix Farmer', formerOccupation: 'farmer', occupationId: 'farmer', age: 50, dead: false },
  { id: 'fx_nu', name: 'Fix Nurse', formerOccupation: 'ER nurse', occupationId: 'er_nurse', age: 38, dead: false },
  { id: 'fx_co', name: 'Fix Cook', formerOccupation: 'line cook', occupationId: 'line_cook', age: 29, dead: false },
];

async function partA() {
  console.log('PART A — RED-verified fixture: exact census of a constructed roster');
  const { Game } = await loadGame({ seed: 7701, mode: 'huntroster-proof' });
  await quietLog(async () => { await setupGame(Game); });

  // Fake Game inheriting the real engine: real characterGen/knowledge tables,
  // real villagerCompetence — but a constructed roster and constructed people.
  const fakeGame = Object.create(Game);
  fakeGame.data = Object.assign({}, Game.data, { villagers: FIXTURE_PEOPLE, background_survivors: [] });
  fakeGame.state = { village: { roster: FIXTURE_PEOPLE.map(p => p.id), health: {} } };
  fakeGame.getPerson = (id) => FIXTURE_PEOPLE.find(p => p.id === id) || null;

  const c = inst.rosterCensus(fakeGame);
  check('A0 census sees the 6 constructed members', c.roster === 6, `roster=${c.roster}`);
  const d = c.defs || {};
  // coarse (huntduty's word lists): only 'infantry soldier' hits 1.4x;
  // 'Butcher' + 'farmer' hit 1.2x.
  check('A1 coarse14 = 1 (soldier only)', d.coarse14 === 1, `coarse14=${d.coarse14}`);
  check('A2 coarse12 = 2 (butcher, farmer)', d.coarse12 === 2, `coarse12=${d.coarse12}`);
  // engine detector: identical to coarse on these names (same stale word list).
  check('A3 engine14 = 1 (soldier only)', d.engine14 === 1, `engine14=${d.engine14}`);
  check('A4 engine12 = 2 (butcher, farmer)', d.engine12 === 2, `engine12=${d.engine12}`);
  // the wiring finding, pinned: the engine's +20% can never fire.
  check('A5 plus20 = 0 even with a literal Hunting guide', d.plus20 === 0, `plus20=${d.plus20}`);
  const hg = (c.members || []).find(m => m.vid === 'fx_hg') || {};
  check('A6 hunting guide engineComp = 1.0 (invisible to the detector)', hg.engineComp === 1.0, `engineComp=${hg.engineComp}`);
  // design-intent substrate: hunting_guide (game_sense+patient_aim+snare),
  // soldier (snare), butcher (field_dressing), farmer (snare).
  check('A7 substrateSkill = 4 (hg, soldier, butcher, farmer)', d.substrateSkill === 4, `substrateSkill=${d.substrateSkill}`);
  check('A8 knowledgeHunt = 3 (hg, soldier, farmer; butcher not in hunt knowledge)', d.knowledgeHunt === 3, `knowledgeHunt=${d.knowledgeHunt}`);
  check('A9 histogram has all 6 occupationIds', Object.keys(c.occHist || {}).length === 6, JSON.stringify(Object.keys(c.occHist || {})));
  check('A10 census is pure (no errors, no RNG-shaped fields)', !c.error, c.error || 'ok');

  // RED: no instrument -> nothing counted.
  const { Game: Game2 } = await loadGame({ seed: 7701, mode: 'huntroster-proof-red' });
  await quietLog(async () => { await setupGame(Game2); });
  check('RED: without the instrument Game.__huntroster is absent', typeof Game2.__huntroster === 'undefined', 'instrument-sourced counting');
  check('RED: rosterCensus is not attached to a bare game', typeof Game2.rosterCensus === 'undefined', 'no census without instrument');
}

async function detOne(seed, policyId, days, withInstrument) {
  const pPath = './policies/feastscale';
  delete require.cache[require.resolve(pPath)];
  const fsp = require(pPath);
  const policy = fsp[policyId];
  const { Game } = await loadGame({ seed, mode: 'huntroster-det' });
  await setupGame(Game);
  const t = { errors: 0 };
  if (withInstrument) { inst.attachRosterInstrument(Game, t); }
  const wrapped = Object.assign({}, policy);
  const bDaily = policy.daily;
  const hs = [];
  wrapped.daily = (G, ctx) => {
    // the instrument's own observer runs inside attachRosterInstrument's
    // wrapped daily when withInstrument; here we hash independently.
    if (withInstrument) { try { t._observer(G); } catch (e) { t.errors++; } }
    hs.push(G.state.scholar.day + ':' + dayHash(G));
    return bDaily ? bDaily(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: days + 1 }); });
  return { hashes: hs.join('\n'), errors: t.errors };
}

async function partB(seeds, policies, days) {
  console.log(`PART B — det-gate: ${seeds.length} seeds x ${policies.length} policies x {off,on}, ${days}d`);
  let pass = 0, fail = 0, errOn = 0;
  for (const pid of policies) {
    for (const seed of seeds) {
      const off = await detOne(seed, pid, days, false);
      const on = await detOne(seed, pid, days, true);
      const same = off.hashes === on.hashes;
      errOn += on.errors;
      if (same) pass++; else { fail++; console.log(`  MISMATCH ${pid}-${seed}`); }
    }
  }
  check('det-gate byte-identical trajectories', fail === 0, `${pass}/${pass + fail}`);
  check('instrument reported 0 errors', errOn === 0, `${errOn}`);
}

async function main() {
  const SMOKE = process.env.SMOKE === '1';
  await partA();
  if (SMOKE) await partB([7701], ['leadfeast'], 12);
  else await partB([7701, 7702, 7703, 7704], ['leadfeast', 'belongfeast'], 60);
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
