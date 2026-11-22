// test-tier4pool-a.js — proof test for arm sim-tier4pool-a
// (tier-4 POOL lever for holderless villages, findings #2647/#2648).
// Proves BEFORE any judged sim:
//   (1) the lever is OFF unless TIER4POOL=1 (no _t4pLast/_t4pStats);
//   (2) ON + holderless + tier 4: the pool weights to 14 searcaster
//       copies of 28 draws (50%) on top of GUNRATE's 4/18 (22.2%),
//       and ~50% of tier-4 rolls actually pay the gun;
//   (3) the gates each block it: a living searcaster holder (scholar
//       or villager) — pool stays at GUNRATE's 4/18; non-tier-4 rolls
//       are never boosted;
//   (4) a DEAD holder does not block it (corpses don't count);
//   (5) kill-loot rolls are never boosted and never write _t4pLast
//       (the diagnostic is contest-only);
//   (6) the diagnostics are transient: _t4pLast/_t4pStats never enter
//       Game.state (nothing serializes into a save);
//   (7) the analyzer's --selftest passes.
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// The substrate env is GUNRATE=1 (the tier-4 pool weight the lever
// builds on); the test sets it itself.
// Run: node scripts/test-tier4pool-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-tier4pool-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log('FAIL: ' + name); }
}

function contestRoll(Game, wave, tier) {
  return Game.rollAlienLoot({ wave: wave, loot: { chance: 1, tier: tier, rewardSource: 'contest' } }, null);
}
function killRoll(Game, wave, tier) {
  return Game.rollAlienLoot({ wave: wave, loot: { chance: 1, tier: tier } }, null);
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-tier4pool-a', fullTelemetry: false });
  await setupGame(Game);
  const st = Game.state || {};
  const roster = ((st.village || {}).roster) || [];
  const scholarVid = Game.villagerId;
  const npcVid = roster.filter(function (id) { return id !== scholarVid; })[0];
  check('live: roster has a non-scholar villager', !!npcVid);
  const methods = ['rollAlienLoot', '_cxItemPrize', '_gunRateFighter', 'getPerson', 'unlockedWave'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');

  process.env.GUNRATE = '1';

  // (1) Env off: no diagnostics at all (GUNRATE alone writes none).
  delete process.env.TIER4POOL;
  for (let i = 0; i < 50; i++) contestRoll(Game, 4, 4);
  check('off: no _t4pLast when env unset', Game._t4pLast == null);
  check('off: no _t4pStats when env unset', Game._t4pStats == null);

  // (2) Env on, holderless, tier 4: pool 28 / searcaster 14, ~50% pay.
  process.env.TIER4POOL = '1';
  try {
    let boosted = 0, evaluated = 0, sears = 0;
    for (let i = 0; i < 300; i++) {
      const r = contestRoll(Game, 4, 4);
      if (r === 'searcaster') sears++;
      if (Game._t4pLast) {
        evaluated++;
        if (Game._t4pLast.boosted) boosted++;
        if (Game._t4pLast.boosted) {
          if (Game._t4pLast.poolSize !== 28) check('on: boosted pool is 28 (got ' + Game._t4pLast.poolSize + ')', false);
          if (Game._t4pLast.searCopies !== 14) check('on: boosted pool holds 14 searcasters (got ' + Game._t4pLast.searCopies + ')', false);
        }
      }
    }
    check('on: 300 tier-4 rolls evaluated (got ' + evaluated + ')', evaluated === 300);
    check('on: all 300 holderless tier-4 rolls boosted (got ' + boosted + ')', boosted === 300);
    check('on: searcaster pays ~50% (got ' + sears + '/300)', sears >= 120 && sears <= 180);
    check('on: stats accumulate (evaluated=' + (Game._t4pStats || {}).evaluated + ', boosted=' + (Game._t4pStats || {}).boosted + ')',
      Game._t4pStats && Game._t4pStats.evaluated === 300 && Game._t4pStats.boosted === 300);
    const last = Game._t4pLast || {};
    check('on: holderless recorded true on a holderless village', last.holderless === true);
    check('on: seq stamps increment (seq=' + (last.seq || 0) + ')', (last.seq || 0) === 300);

    // (3a) Non-tier-4 rolls are never boosted (holderless still recorded).
    const beforeBoosted = (Game._t4pStats || {}).boosted || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 4, 3);
    check('gate: tier-3 rolls never boost', (Game._t4pStats.boosted || 0) === beforeBoosted);
    check('gate: tier-3 roll still records holderless true', (Game._t4pLast || {}).holderless === true && (Game._t4pLast || {}).boosted === false);

    // (3b) Scholar holds a searcaster: blocked, holderless false, pool stays 4/18.
    const s = Game.state.scholar || {};
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: 'searcaster', units: 1 });
    const beforeB2 = Game._t4pStats.boosted || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 4, 4);
    check('gate: scholar holder blocks the boost', (Game._t4pStats.boosted || 0) === beforeB2);
    check('gate: holderless reads false with a scholar holder', (Game._t4pLast || {}).holderless === false);
    check('gate: held pool stays GUNRATE 18 / 4 searcasters', (Game._t4pLast || {}).poolSize === 18 && (Game._t4pLast || {}).searCopies === 4);
    s.inventory = s.inventory.filter(function (e) { return (e.itemId || e.id) !== 'searcaster'; });

    // (3c) Living villager holds: blocked; dead holder: unblocked.
    const npc = Game.getPerson(npcVid);
    check('gate: test villager person exists', !!npc);
    if (npc) {
      npc.items = npc.items || [];
      npc.items.push({ itemId: 'searcaster', units: 1 });
      const beforeB3 = Game._t4pStats.boosted || 0;
      for (let i = 0; i < 100; i++) contestRoll(Game, 4, 4);
      check('gate: living villager holder blocks the boost', (Game._t4pStats.boosted || 0) === beforeB3);
      npc.dead = true;
      const beforeB4 = Game._t4pStats.boosted || 0;
      for (let i = 0; i < 50; i++) contestRoll(Game, 4, 4);
      check('gate: dead holder does NOT block (boosts resume)', (Game._t4pStats.boosted || 0) > beforeB4);
      npc.dead = false;
      npc.items = npc.items.filter(function (e) { return (e.itemId || e.id) !== 'searcaster'; });
    }

    // (5) Kill-loot rolls never boost and never write _t4pLast.
    const seqBefore = Game._t4pSeq || 0;
    const boostedBefore = Game._t4pStats.boosted || 0;
    for (let i = 0; i < 50; i++) killRoll(Game, 4, 4);
    check('gate: kill-loot rolls never write _t4pLast (seq unchanged)', (Game._t4pSeq || 0) === seqBefore);
    check('gate: kill-loot rolls never boost', (Game._t4pStats.boosted || 0) === boostedBefore);

    // (6) Transient diagnostics never enter Game.state.
    let stateJson = '';
    try { stateJson = JSON.stringify(Game.state || {}); } catch (e) { stateJson = 'STRINGIFY-FAILED'; }
    check('transient: _t4p never serializes into Game.state', stateJson.indexOf('_t4p') === -1);
  } finally {
    delete process.env.TIER4POOL;
    delete process.env.GUNRATE;
  }
}

(async function () {
  try {
    await liveTests();
    let stOk = false;
    try { stOk = analyzer.selftest(); } catch (e) { console.log('analyzer selftest threw: ' + e.message); }
    check('analyzer --selftest passes', stOk === true);
  } catch (e) {
    fail++;
    failures.push('top-level throw: ' + e.message);
    console.log('TOP-LEVEL THROW: ' + (e.stack || e.message));
  }
  console.log('test-tier4pool-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail === 0 ? 0 : 1);
})();
