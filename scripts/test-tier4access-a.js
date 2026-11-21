// test-tier4access-a.js — proof test for arm sim-tier4access-a
// (tier-4 access lever for holderless villages).
// Proves BEFORE any judged sim:
//   (1) the lever is OFF unless TIER4ACCESS=1 (no _t4aLast/_t4aStats);
//   (2) ON + holderless + extreme + wave 4 + input tier < 4: the second
//       25% draw fires (~25% of eligible rolls bump to tier 4);
//   (3) the gates each block it: wave < 4, non-extreme risk, input tier
//       already 4, a living searcaster holder (scholar or villager);
//   (4) a DEAD holder does not block it (corpses don't count);
//   (5) the diagnostics are transient: _t4aLast/_t4aStats never enter
//       Game.state (nothing serializes into a save);
//   (6) the analyzer's --selftest passes.
// Live-harness section uses seed 7 via scripts/sim-harness.js
// (Math.random seeded BEFORE eval, per the harness rules).
// Run: node scripts/test-tier4access-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const analyzer = require(path.join(REPO, 'scripts', 'analyze-tier4access-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond) {
  if (cond) { pass++; }
  else { fail++; failures.push(name); console.log('FAIL: ' + name); }
}

function contestRoll(Game, wave, tier, risk) {
  return Game.rollAlienLoot({ wave: wave, loot: { chance: 1, tier: tier, rewardSource: 'contest', risk: risk } }, null);
}

async function liveTests() {
  const { Game } = await loadGame({ seed: 7, mode: 'test-tier4access-a', fullTelemetry: false });
  await setupGame(Game);
  const st = Game.state || {};
  const roster = ((st.village || {}).roster) || [];
  const scholarVid = Game.villagerId;
  const npcVid = roster.filter(function (id) { return id !== scholarVid; })[0];
  check('live: roster has a non-scholar villager', !!npcVid);
  const methods = ['rollAlienLoot', '_cxItemPrize', '_gunRateFighter', 'getPerson', 'unlockedWave'];
  for (const m of methods) check('live: Game.' + m + ' is a function', typeof Game[m] === 'function');

  // (1) Env off: no diagnostics at all.
  delete process.env.TIER4ACCESS;
  for (let i = 0; i < 50; i++) contestRoll(Game, 4, 3, 'extreme');
  check('off: no _t4aLast when env unset', Game._t4aLast == null);
  check('off: no _t4aStats when env unset', Game._t4aStats == null);

  // (2) Env on, holderless: ~25% of eligible rolls bump.
  process.env.TIER4ACCESS = '1';
  try {
    let bumped = 0, evaluated = 0;
    for (let i = 0; i < 300; i++) {
      contestRoll(Game, 4, 3, 'extreme');
      if (Game._t4aLast) {
        evaluated++;
        if (Game._t4aLast.bumped) bumped++;
        if (Game._t4aLast.bumped && Game._t4aLast.outTier !== 4) check('on: every bump lands at tier 4', false);
      }
    }
    check('on: 300 eligible rolls evaluated (got ' + evaluated + ')', evaluated === 300);
    check('on: bumps ~25% (got ' + bumped + '/300)', bumped >= 40 && bumped <= 115);
    check('on: stats accumulate (evaluated=' + (Game._t4aStats || {}).evaluated + ', bumped=' + (Game._t4aStats || {}).bumped + ')',
      Game._t4aStats && Game._t4aStats.evaluated === 300 && Game._t4aStats.bumped === bumped);
    const last = Game._t4aLast || {};
    check('on: holderless recorded true on a holderless village', last.holderless === true);

    // (3a) wave < 4 blocks.
    let before = (Game._t4aStats || {}).bumped || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 3, 3, 'extreme');
    check('gate: wave 3 never bumps', (Game._t4aStats.bumped || 0) === before);
    // (3b) non-extreme risk blocks.
    before = Game._t4aStats.bumped || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 4, 3, 'high');
    check('gate: high-risk never bumps', (Game._t4aStats.bumped || 0) === before);
    // (3c) input tier already 4: no second chance needed, no bump counted.
    before = Game._t4aStats.bumped || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 4, 4, 'extreme');
    check('gate: input tier 4 never bumps', (Game._t4aStats.bumped || 0) === before);
    // (3d) scholar holds a searcaster: blocked, holderless false.
    const s = Game.state.scholar || {};
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: 'searcaster', units: 1 });
    before = Game._t4aStats.bumped || 0;
    for (let i = 0; i < 100; i++) contestRoll(Game, 4, 3, 'extreme');
    check('gate: scholar holder blocks the bump', (Game._t4aStats.bumped || 0) === before);
    check('gate: holderless reads false with a scholar holder', (Game._t4aLast || {}).holderless === false);
    s.inventory = s.inventory.filter(function (e) { return (e.itemId || e.id) !== 'searcaster'; });
    // (3e) living villager holds: blocked; dead holder: unblocked.
    const npc = Game.getPerson(npcVid);
    check('gate: test villager person exists', !!npc);
    if (npc) {
      npc.items = npc.items || [];
      npc.items.push({ itemId: 'searcaster', units: 1 });
      before = Game._t4aStats.bumped || 0;
      for (let i = 0; i < 100; i++) contestRoll(Game, 4, 3, 'extreme');
      check('gate: living villager holder blocks the bump', (Game._t4aStats.bumped || 0) === before);
      npc.dead = true;
      before = Game._t4aStats.bumped || 0;
      for (let i = 0; i < 50; i++) contestRoll(Game, 4, 3, 'extreme');
      check('gate: dead holder does NOT block (bumps resume)', (Game._t4aStats.bumped || 0) > before);
      npc.dead = false;
      npc.items = npc.items.filter(function (e) { return (e.itemId || e.id) !== 'searcaster'; });
    }
    // (5) transient diagnostics never enter Game.state.
    let stateJson = '';
    try { stateJson = JSON.stringify(Game.state || {}); } catch (e) { stateJson = 'STRINGIFY-FAILED'; }
    check('transient: _t4a never serializes into Game.state', stateJson.indexOf('_t4a') === -1);
  } finally {
    delete process.env.TIER4ACCESS;
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
  console.log('test-tier4access-a: ' + pass + ' passed, ' + fail + ' failed' + (fail ? ' — ' + failures.join('; ') : ''));
  process.exit(fail === 0 ? 0 : 1);
})();
