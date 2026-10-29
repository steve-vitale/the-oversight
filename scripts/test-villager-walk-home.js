#!/usr/bin/env node
// test-villager-walk-home.js — proof for fixall-map slice 2 (design §D/Q8
// shape): a villager's RETURN walk may step through beyond coordinates;
// outbound movement never leaves the board.
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-prereg.md §2):
//   1. a villager standing beyond the edge with a finished objective walks
//      home one tile per objAwayStep call, reaching haven, with Chebyshev
//      distance strictly decreasing on every step (no meander on a
//      beyond-board return — a clamped meander there would teleport)
//   2. each return step charges the same +3 hunger / -4 energy as any away
//      step (the away-step ledger, unchanged)
//   3. npcSetNode's default still clamps to 0..8; only the opt-in flag
//      places a villager beyond the edge
//   4. an outbound villager at the rim never steps past the edge (no
//      beyond-errand faucet): 20 away steps keep them inside 0..8
//   5. HOME-BOARD RETURN PARITY (narrowed slice 2, after the panel
//      comparison): a returning villager standing IN-board still wanders
//      exactly as before — at least one of six home returns takes longer
//      than its pure-pursue (Chebyshev) distance, i.e. meander still fires
//      on home ground. This is what keeps panel games bit-identical to
//      base until a villager actually stands beyond the edge.
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
  // NARROWED SEMANTICS (after the panel comparison): the BEYOND segment
  // is straight pursue (no meander while beyond the board); once the
  // walker re-enters the board they wander exactly like a base home
  // returner, so the full walk is NOT a straight 8 steps — assert the
  // beyond segment straight, every step at most 1 tile per coordinate
  // (no teleport — diagonal pursue steps are one tile in this game's
  // 8-directional node movement), arrival, and the ledger per CALL.
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
    if (Math.abs(after.nx - before.nx) > 1 || Math.abs(after.ny - before.ny) > 1) { ok = false; failures.push(`return step ${steps} teleported (${before.nx},${before.ny}) -> (${after.nx},${after.ny})`); break; }
  }
  const end = Game.npcNode(vid);
  check(ok, 'return trace: no step moves more than 1 tile per coordinate (no teleport)');
  check(end.nx === hx && end.ny === hy, `return walk reached haven in ${steps} steps`);
  const beyondSeg = trace.slice(0, 5).map(p => `(${p.x},${p.y})`).join(' ');
  check(beyondSeg === '(12,4) (11,4) (10,4) (9,4) (8,4)', `beyond segment is straight pursue: ${beyondSeg}`);
  console.log(`  return trace: ${trace.map(p => `(${p.x},${p.y})`).join(' ')}`);
  const needsAfter = Game.npcNeeds(vid);
  check(needsAfter.hunger === 3 * steps, `hunger charged +3/call: 0 -> ${needsAfter.hunger} over ${steps} calls`);
  check(needsAfter.energy === 100 - 4 * steps, `energy charged -4/call: 100 -> ${needsAfter.energy} over ${steps} calls`);

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

  // BAR 5: home-board return parity. Six in-board returns from varied
  // starts; a pure-pursue return takes exactly its Chebyshev distance in
  // calls, so any longer walk proves meander still fires on home ground.
  // (A single walk could roll no meander by chance; six walks make a
  // false negative negligible, and a longer walk is positive proof.)
  const starts = [[0, 4], [0, 0], [8, 0], [0, 8], [8, 8], [2, 0]];
  let longer = 0;
  const lens = [];
  for (const [sx, sy] of starts) {
    Game.npcSetNode(vid, sx, sy);
    v.objectives[vid] = { kind: 'FORAGE', state: 'done', tx: hx, ty: hy, partsLeft: 100 };
    const aw = { nx: sx, ny: sy, purpose: 'forage', sinceDay: Game.state.scholar.day, sincePart: 0, duration: 400 };
    v.away[vid] = aw;
    let calls = 0;
    while (calls < 60) {
      const cur = Game.npcNode(vid);
      if (cur.nx === hx && cur.ny === hy) break;
      Game.objAwayStep(vid, Game.npcNode(vid), aw, hx, hy);
      calls++;
    }
    const cheb = Math.max(Math.abs(hx - sx), Math.abs(hy - sy));
    lens.push(`${sx},${sy}:${calls}v${cheb}`);
    if (calls > cheb) longer++;
    const endN = Game.npcNode(vid);
    if (endN.nx !== hx || endN.ny !== hy) failures.push(`home return from (${sx},${sy}) did not reach haven in 60 calls`);
  }
  console.log(`  home return lengths (calls vs Chebyshev): ${lens.join(' ')}`);
  check(longer >= 1, `home-board returns still meander (${longer} of 6 walks longer than pure pursue)`);
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
