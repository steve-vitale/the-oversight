#!/usr/bin/env node
// test-villager-walk-home.js — proof for fixall-map slice 2 (design §D/Q8
// shape): a villager's RETURN walk may step through beyond coordinates;
// outbound movement never leaves the board.
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-prereg.md §2):
//   1. a villager standing beyond the edge with a finished objective walks
//      home one tile per objAwayStep call, reaching haven, with Chebyshev
//      distance strictly decreasing on every step (no meander on return)
//   2. each return step charges the same +3 hunger / -4 energy as any away
//      step (the away-step ledger, unchanged)
//   3. npcSetNode's default still clamps to 0..8; only the opt-in flag
//      places a villager beyond the edge
//   4. an outbound villager at the rim never steps past the edge (no
//      beyond-errand faucet): 20 away steps keep them inside 0..8
// HARNESS POSITIONING (documented, not a gameplay claim): the proof places
// the villager beyond the edge with the opt-in flag, as a lawful FOLLOW
// (saw-leave -> followed) would have — the follow verb itself belongs to
// the field-party slice, not this item, and is NOT claimed here. What is
// proven is the return only.
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
  else console.log('  ok: ' + msg);
};

function pickVillager(Game) {
  const roster = (Game.state.village && Game.state.village.roster) || [];
  const vid = roster.find(id => id !== Game.villagerId);
  return vid || null;
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: false });
  await setupGame(Game, 'Columbus, Ohio');
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  check(hx === 4 && hy === 4, `haven at (${hx},${hy})`);
  const vid = pickVillager(Game);
  check(!!vid, `a non-player villager exists (${vid})`);
  if (!vid) return;

  // BAR 3: default clamp vs opt-in flag.
  Game.npcSetNode(vid, 12, 4);
  let n = Game.npcNode(vid);
  check(n.nx === 8 && n.ny === 4, `npcSetNode default clamps (12,4) -> (${n.nx},${n.ny})`);
  Game.npcSetNode(vid, 12, 4, true);
  n = Game.npcNode(vid);
  check(n.nx === 12 && n.ny === 4, `npcSetNode opt-in places beyond the edge (${n.nx},${n.ny})`);

  // BAR 1+2: the return walk. Finished objective -> returning branch.
  v.objectives = v.objectives || {};
  v.objectives[vid] = { kind: 'FORAGE', state: 'done', tx: hx, ty: hy, partsLeft: 0 };
  v.away = v.away || {};
  const away = { nx: 12, ny: 4, purpose: 'forage', sinceDay: Game.state.scholar.day, sincePart: 0, duration: 400 };
  v.away[vid] = away;
  const needs = Game.npcNeeds(vid);
  needs.hunger = 0; needs.energy = 100;
  const trace = [{ x: 12, y: 4 }];
  let steps = 0, ok = true;
  while (steps < 30) {
    const before = Game.npcNode(vid);
    if (before.nx === hx && before.ny === hy) break;
    Game.objAwayStep(vid, Game.npcNode(vid), away, hx, hy);
    const after = Game.npcNode(vid);
    trace.push({ x: after.nx, y: after.ny });
    steps++;
    const dStep = Math.abs(after.nx - before.nx) + Math.abs(after.ny - before.ny);
    if (dStep !== 1) { ok = false; failures.push(`return step ${steps} moved ${dStep} tiles (${before.nx},${before.ny}) -> (${after.nx},${after.ny})`); break; }
    const cBefore = Math.max(Math.abs(hx - before.nx), Math.abs(hy - before.ny));
    const cAfter = Math.max(Math.abs(hx - after.nx), Math.abs(hy - after.ny));
    if (cAfter !== cBefore - 1) { ok = false; failures.push(`return step ${steps} Chebyshev ${cBefore} -> ${cAfter} (expected -1)`); break; }
  }
  const end = Game.npcNode(vid);
  check(ok, 'return trace: every step exactly 1 tile, Chebyshev strictly decreasing');
  check(end.nx === hx && end.ny === hy, `return walk reached haven in ${steps} steps (expected 8)`);
  check(steps === 8, `return took exactly the Chebyshev distance (8 steps, got ${steps})`);
  console.log(`  return trace: ${trace.map(p => `(${p.x},${p.y})`).join(' ')}`);
  const needsAfter = Game.npcNeeds(vid);
  check(needsAfter.hunger === 24, `hunger charged +3/step: 0 -> ${needsAfter.hunger} (expected 24)`);
  check(needsAfter.energy === 68, `energy charged -4/step: 100 -> ${needsAfter.energy} (expected 68)`);

  // BAR 4: outbound never leaves the board. A second villager (or the same
  // one, reset) at the rim with a live outbound objective aimed past the
  // edge must stay inside 0..8 across many steps.
  Game.npcSetNode(vid, 8, 4);
  v.objectives[vid] = { kind: 'FORAGE', state: 'out', tx: 12, ty: 4, partsLeft: 100, tightness: 99 };
  const away2 = { nx: 8, ny: 4, purpose: 'forage', sinceDay: Game.state.scholar.day, sincePart: 0, duration: 400 };
  v.away[vid] = away2;
  let escaped = false, minX = 8, maxX = 8;
  for (let i = 0; i < 20; i++) {
    Game.objAwayStep(vid, Game.npcNode(vid), away2, hx, hy);
    const nn = Game.npcNode(vid);
    minX = Math.min(minX, nn.nx); maxX = Math.max(maxX, nn.nx);
    if (nn.nx < 0 || nn.nx > 8 || nn.ny < 0 || nn.ny > 8) escaped = true;
  }
  check(!escaped, `outbound walker stayed inside 0..8 over 20 steps (x range ${minX}..${maxX})`);
  check(maxX <= 8, 'outbound walker never stepped past the rim');
}

async function main() {
  for (const seed of SEEDS) {
    try { await runSeed(seed); } catch (e) { failures.push(`seed ${seed} threw: ${e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : e}`); }
  }
  console.log(`\n${failures.length ? 'FAIL' : 'PASS'}: ${failures.length} failure(s)`);
  for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
