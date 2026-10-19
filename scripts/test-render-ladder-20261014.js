#!/usr/bin/env node
// test-render-ladder-20261014.js — journey establishment r3.
// QUESTION (r3 pilot, 4 seeds x 40d, RENDER_LADDER knob ON): the render ->
// pemmican ladder NEVER fired (0 render batches, 0 pemmican bars, 0 raw-fat
// slabs seen). Is the ladder machinery broken, or is the bind upstream (no
// fat-bearing game reached the player's hands)?
// PROOF: drive the machinery directly with fixtures on 3 seeds. If every
// verb fires honestly with its documented yields/gates, the machinery is
// VERIFIED and the pilot's silence is an upstream reachability finding (fat
// supply), not a broken ladder.
// Canon: docs/PRESERVATION.md (ladder rungs, blind penalties teach),
// docs/BEAR.md (fat sources: bear 6 / boar 3 / javelina 2 slabs).
// Run: node scripts/test-render-ladder-20261014.js
//      SEED=61 node scripts/test-render-ladder-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [61, 82, 103]);

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function rawFat(n, kcal) {
  return {
    plantId: 'fat_wild_boar', foodKind: 'fat', foodState: 'raw',
    edible: false, units: n, unit: 'slab',
    kcalEach: 0, hiddenKcal: kcal,
    spoilDay: 999, kg: 0.5,
    name: 'Wild Boar fat (raw)',
    prep: 'Thick white slabs of fat.',
  };
}
function preservedMeat(n, kcalEach) {
  return {
    plantId: 'meat_deer', foodKind: 'meat', foodState: 'preserved',
    edible: true, units: n, unit: 'portion', kcalEach, hiddenKcal: kcalEach,
    spoilDay: 999, kg: 0.2, name: 'Smoked venison', safe: true,
  };
}
function berries(n) {
  return {
    plantId: 'berries_test', foodKind: 'plant', foodState: 'raw',
    edible: true, units: n, unit: 'handful', kcalEach: 30, hiddenKcal: 30,
    spoilDay: 999, kg: 0.05, name: 'Berries',
  };
}

async function runSeed(seed) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  ok(Game.nearFire(), 'spawn tile has a fire (render precondition)');
  ok(!Game.knowsTechnique('render'), 'render technique starts unlearned');

  // --- 1. BLIND RENDER: raw fat -> rendered tallow, 0.65x, teaches ---
  const inv = Game.state.scholar.inventory;
  inv.push(rawFat(3, 1400)); // 3 slabs x 1400 hidden kcal (boar: ~20% of gross)
  const say0 = [];
  const origSay = Game.say.bind(Game);
  Game.say = (s) => { say0.push(String(s)); return origSay(s); };
  Game.renderFat();
  const rendered = inv.filter(i => i && i.foodKind === 'fat' && i.foodState === 'rendered');
  ok(rendered.length === 1 && rendered[0].units === 3, 'blind render converts all raw fat to rendered', JSON.stringify(rendered.map(i => i.foodState)));
  const rk = rendered[0] ? rendered[0].kcalEach : 0;
  ok(rk === Math.round(1400 * 0.65), 'blind yield is 0.65x (canon sting)', `kcalEach=${rk}, want ${Math.round(1400 * 0.65)}`);
  ok(rendered[0] && rendered[0].spoilDay >= 89, 'rendered fat keeps ~90 days', `spoilDay=${rendered[0] && rendered[0].spoilDay}`);
  ok(Game.knowsTechnique('render'), 'blind attempt TEACHES render (self-trial canon)');
  ok(say0.some(s => /learned/i.test(s) && /render/i.test(s)), 'learn beat narrated honestly');

  // --- 2. KNOWING RENDER: 0.90x ---
  inv.push(rawFat(2, 1000));
  Game.renderFat();
  const r2 = inv.filter(i => i && i.foodKind === 'fat' && i.foodState === 'rendered' && i.kcalEach === Math.round(1000 * 0.9));
  ok(r2.length === 1, 'knowing render pays 0.90x', `kcalEach=${r2[0] && r2[0].kcalEach}`);

  // --- 3. PEMMICAN GATE: refused without render knowledge ---
  const { Game: G2 } = await loadGame({ seed });
  await setupGame(G2);
  const inv2 = G2.state.scholar.inventory;
  inv2.push(preservedMeat(4, 400), berries(4));
  // give rendered fat directly (as if rendered) but WITHOUT the technique
  const rf = rawFat(2, 900); rf.foodState = 'rendered'; rf.edible = true; rf.kcalEach = 810; rf.hiddenKcal = 810;
  inv2.push(rf);
  const nBefore = inv2.length;
  G2.makePemmican();
  ok(inv2.length === nBefore, 'pemmican REFUSED without render knowledge (gate holds)', `inv ${nBefore} -> ${inv2.length}`);
  ok(!inv2.some(i => i && i.foodState === 'pemmican'), 'no bars created behind the gate');

  // --- 4. PEMMICAN MAKE: full set -> honest bars ---
  G2.learnTechnique('render', 'trial');
  const sets = G2.pemmicanSets();
  // fixture: 4 meat / 2 fat / 4 berries = 2 full sets (test bug r1: expected 1)
  ok(sets === 2, 'pemmicanSets counts 2 full sets (4 meat + 2 fat + 4 berries)', `sets=${sets}`);
  const prev = G2.pemmicanPreview();
  G2.makePemmican();
  const bars = inv2.filter(i => i && i.foodState === 'pemmican');
  const totalBars = bars.reduce((a, b) => a + (b.units || 0), 0);
  ok(totalBars === prev.bars && totalBars > 0, 'bars made match preview', `bars=${totalBars} preview=${prev.bars}`);
  const inKcal = 2 * (2 * 400 + 810 + 2 * 30); // two sets: 2 meat + 1 fat + 2 berries each
  const barKcal = bars[0] ? bars[0].kcalEach : 0;
  const retention = (totalBars * barKcal) / inKcal;
  ok(retention > 0.9 && retention <= 1.0, '~97% retention, energy never created', `retention=${retention.toFixed(3)}`);
  ok(bars[0] && bars[0].spoilDay >= 119, 'pemmican keeps ~120 days', `spoilDay=${bars[0] && bars[0].spoilDay}`);
  ok(!inv2.some(i => i && i.foodKind === 'fat' && i.foodState === 'rendered'), 'rendered fat consumed by the make');

  // --- 5. STASH PATH: the village-stash counter wires too ---
  const stash = G2.prepStash();
  stash.push(rawFat(1, 1200));
  G2.renderFat(undefined, stash);
  ok(stash.some(i => i && i.foodKind === 'fat' && i.foodState === 'rendered'), 'render works on the prepStash container (BEAR.md gap resolved 2026-10-11)');

  // --- 6. SPOILED FAT: never rendered ---
  const { Game: G3 } = await loadGame({ seed });
  await setupGame(G3);
  // A spoil date of0 is not in the past on expedition day0.
  G3.state.scholar.day = 100;
  const inv3 = G3.state.scholar.inventory;
  const bad = rawFat(2, 1000); bad.spoilDay = 1; // long past every supported cold-storage extension
  inv3.push(bad);
  G3.renderFat();
  ok(inv3.some(i => i && i.foodState === 'raw'), 'spoiled fat is NOT rendered (rot honesty)');
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
