#!/usr/bin/env node
// test-crisis-r55-crumb-break-20261025.js — CRISIS LEG r55 proof probe.
// Proves the pantryDraw crumb-break: with round 'floor1' (the villagers'
// meal draw), once any piece has been drawn, a remaining need smaller
// than the next piece's kcalEach STOPS the draw instead of taking the
// piece whole — so a villager can draw a fraction of its dayWant from a
// pantry whose total kcal dwarfs the want, when the pantry's remainder
// is one indivisible slab. This is the mechanism behind 404 Mabel's
// d38 draw of 280 kcal from a 43,665-kcal dawn pantry (r55 analysis).
// No game change: this test only calls the existing pantryDraw.
// Usage: node scripts/test-crisis-r55-crumb-break-20261025.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failures++;
}

async function main() {
  const { Game } = await loadGame({ seed: 404, mode: 'crisis-r55-probe', fullTelemetry: true });
  await setupGame(Game);

  // Case 1: crumbs + slab. Two 100-kcal pieces, then a 30,000-kcal slab.
  // want 1500 -> draws 200, then stops at the slab (crumb-break).
  const v1 = { pantry: [
    { name: 'crumb-a', kcalEach: 100, units: 2 },
    { name: 'slab', kcalEach: 30000, units: 1 },
  ] };
  const r1 = Game.pantryDraw(v1, 1500, { cook: true, round: 'floor1' });
  check('crumbs-then-slab draws crumbs only', r1.taken === 200, `taken=${r1.taken}`);
  check('crumbs-then-slab is NOT shortOfFresh (crumb-break, not exhaustion)', r1.shortOfFresh === false, `shortOfFresh=${r1.shortOfFresh}`);
  check('slab survives untouched', v1.pantry.length === 1 && v1.pantry[0].kcalEach === 30000, `pantry=${JSON.stringify(v1.pantry.map(i => i.kcalEach))}`);

  // Case 2: nothing drawn yet -> the indivisible piece IS eaten whole.
  // (The first-piece rule: no fractionating, but no starving either.)
  const v2 = { pantry: [{ name: 'slab', kcalEach: 30000, units: 1 }] };
  const r2 = Game.pantryDraw(v2, 1500, { cook: true, round: 'floor1' });
  check('first-piece whole when nothing drawn yet', r2.taken === 30000, `taken=${r2.taken}`);

  // Case 3: ordinary granular pantry fills the want exactly.
  const v3 = { pantry: [{ name: 'staple', kcalEach: 500, units: 4 }] };
  const r3 = Game.pantryDraw(v3, 1500, { cook: true, round: 'floor1' });
  check('granular pantry fills want', r3.taken === 1500, `taken=${r3.taken}`);

  // Case 4: Mabel-shape: small pieces summing to 280, then slabs.
  const v4 = { pantry: [
    { name: 'crumb-a', kcalEach: 140, units: 2 },
    { name: 'slab-a', kcalEach: 20000, units: 1 },
    { name: 'slab-b', kcalEach: 23000, units: 1 },
  ] };
  const r4 = Game.pantryDraw(v4, 1522, { cook: true, round: 'floor1' });
  check('Mabel-shape draws crumbs only', r4.taken === 280, `taken=${r4.taken}`);
  check('Mabel-shape shortOfFresh false', r4.shortOfFresh === false, `shortOfFresh=${r4.shortOfFresh}`);

  console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
