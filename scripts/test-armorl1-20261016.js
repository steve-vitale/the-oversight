#!/usr/bin/env node
// test-armorl1-20261016.js — RED→GREEN proof for design call #5 (armor L1 channel).
// Claim: handling a hide teaches hide_armor L1 (the first honest rung toward
// armor crafting) on EVERY path a hide gets into the player's hands:
//   1. corpse loot (pre-existing, 2026-10-13)
//   2. butchering a carcass (the primary hide path — was broken)
//   3. taking rawhide from the village stash (was broken)
// Seeded RNG; loads via scripts/sim-harness.js. Never stubs Game.save.
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 20261016, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  let pass = true;
  const ok = (cond, label) => {
    console.log((cond ? 'PASS' : 'FAIL') + ' — ' + label);
    if (!cond) pass = false;
  };
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.recipes = Game.state.codex.recipes || {};
  const lvl = () => (Game.state.codex.recipes['hide_armor'] || {}).level || 0;
  const reset = (n) => { Game.state.codex.recipes['hide_armor'] = { level: n }; };

  // Capture narration without silencing the game.
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = (m) => { said.push(String(m)); try { return _say(m); } catch (e) { return m; } };

  ok(lvl() === 0, 'pre: hide_armor unknown at L0');

  // 1. BUTCHER PATH — the primary hide source. A deer carcass butchered by
  // carcassToMeat must leave hides in the pack AND teach hide_armor L1.
  const inv = Game.state.scholar.inventory;
  inv.push({
    plantId: 'meat_white_tailed_deer', name: 'Deer (carcass)',
    foodState: 'carcass', foodKind: 'meat', hiddenKcal: 12000,
    how: 'knife', units: 1, kg: 60, spoilDay: 9999,
  });
  Game.carcassToMeat(inv, inv.length - 1, true);
  const hides = inv.filter(i => i.material === 'hide').reduce((t, i) => t + (i.units || 1), 0);
  ok(hides >= 2, `butchering a deer yields hides (got ${hides})`);
  ok(lvl() === 1, 'butchering a carcass teaches hide_armor L1');
  ok(said.some(s => /shape of armor suggests itself/.test(s)),
    'the hide-handling beat narrates honestly');
  ok((Game.state.codex.recipes['hide_armor'] || {}).via === 'witnessed',
    'grant recorded as witnessed');

  // 2. Idempotent — repeated handling neither re-fires nor downgrades.
  const saidBefore = said.length;
  Game.noteHideHandled({ material: 'hide' });
  ok(lvl() === 1 && said.length === saidBefore, 'L1 stable on repeated handling');

  // 3. CRAFT GATE — at L1 the craft() gate must open past the L0 block into
  // the honest blind attempt (35%, materials at risk), per the one-system rule.
  inv.push({ material: 'hide', units: 2, name: 'Hides', kcalEach: 0, spoilDay: 9999, kg: 0.8 });
  inv.push({ material: 'vine', units: 1, name: 'Vine', kcalEach: 0, spoilDay: 9999, kg: 0.1 });
  said.length = 0;
  Game.craft('hide_armor');
  ok(!said.some(s => /don't know how to make/.test(s)),
    'craft gate opens at L1 (no "don\'t know how" block)');
  ok(said.some(s => /only SEEN|comes apart|You make a/.test(s)),
    'L1 craft is an honest blind attempt');
  ok(lvl() >= 1, `knowledge survives the attempt (now L${lvl()})`);

  // 4. STASH PATH — rawhide from the stash into your hands is handling it.
  reset(0);
  Game.noteHideHandled({ material: 'hide' });
  ok(lvl() === 1, 'stash-hide shape (material: hide) teaches L1');

  // 5. REGRESSION — the legacy corpse-loot shape still fires.
  reset(0);
  Game.noteHideHandled({ plantId: 'animal_hide', material: 'hide' });
  ok(lvl() === 1, 'corpse-loot hide (plantId animal_hide) still teaches L1');

  // 6. NEGATIVE — non-hides never fire.
  reset(0);
  Game.noteHideHandled({ plantId: 'some_berry', material: 'fiber' });
  Game.noteHideHandled(null);
  Game.noteHideHandled({});
  ok(lvl() === 0, 'non-hide items do not teach');

  console.log(pass ? 'ALL GREEN — hide→armor L1 path closed' : 'RED — hide→armor L1 path broken');
  process.exit(pass ? 0 : 1);
}

main().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
