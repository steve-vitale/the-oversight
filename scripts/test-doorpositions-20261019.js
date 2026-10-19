#!/usr/bin/env node
// test-doorpositions-20261019.js — sim-doorpositions arm proof.
//
// Lineage: sim-compresence (2026-10-18) finding #2 — 14/90 same-node
// companion dispositions were companions OUTSIDE on the scholar's side with
// no positions[rid]: ensureVillagerPositions() runs on scholar movement /
// node arrival / init, but a villager arriving via npcNodeTravel (or a door
// transition that doesn't re-run assignment) is invisible to the TB join
// rule in startCombat ("party: villagers within 4 squares join the fight"),
// which reads state.village.positions[rid].
//
// The fix (game.js startCombat): call ensureVillagerPositions() at TB-fight
// start, before the join rule reads positions. Confined to position
// assignment — the join radius, nearest-4 cap, and the hall-door rule
// (inside villagers lose positions when the scholar is outside) are untouched.
//
// Fixture (per scenario):
//   - scholar at the haven node, OUTSIDE (insideHaven=false), grid (4,7)
//   - companion A: on the haven node, outside side (npcInside=false), but
//     with NO positions[rid] — the npcNodeTravel-arrival staleness
//   - companion B: on the haven node, INSIDE side, stale position within 4
//     of the scholar — must stay unjoined (door rule preserved)
// RED  (DOORPOS_RED=1): ensureVillagerPositions is patched to a no-op,
//        simulating pristine startCombat -> A does NOT join (bug reproduced)
// GREEN (default):     the real fix runs -> A joins within 4 squares,
//        B does not join (door semantics unchanged)
// DET-GATE: two identical seeded runs -> byte-identical positions + fighters
// SMOKE: a short 10d leadfeast run completes with the fix in place, no errors
//
// Usage:
//   node scripts/test-doorpositions-20261019.js            # GREEN + DET + SMOKE
//   DOORPOS_RED=1 node scripts/test-doorpositions-20261019.js  # RED (bug)
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

const SEED = 63411; // fresh; verified filename-unused in evidence/2026-10-18/perseed-*/
const RED = process.env.DOORPOS_RED === '1';
let failures = 0;
function check(name, cond, extra) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) failures++;
}

async function buildFixture() {
  const { Game } = await loadGame({ seed: SEED, mode: 'compresence', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  const s = Game.state.scholar;
  s.insideHaven = false; s.mx = 4; s.my = 7; s.health = 100;
  const roster = (v.roster || []).filter(r => r !== Game.villagerId);
  if (roster.length < 2) throw new Error('fixture needs 2+ roster villagers, got ' + roster.length);
  const [ridA, ridB] = roster;
  v.positions = {}; // isolate: drop every stale position
  v.nodePos = v.nodePos || {}; v.npcInside = v.npcInside || {};
  // A: outside on the scholar's side, haven node, NO grid position (stale)
  v.nodePos[ridA] = { nx: hx, ny: hy };
  v.npcInside[ridA] = false;
  // B: inside the hall, stale position within 4 of the scholar (door test)
  v.nodePos[ridB] = { nx: hx, ny: hy };
  v.npcInside[ridB] = true;
  v.positions[ridB] = { mx: 4, my: 5 };
  if (RED) Game.ensureVillagerPositions = function () {}; // pristine-equivalent
  return { Game, ridA, ridB };
}

function joinedIds(Game) {
  const tb = Game.tbfight;
  if (!tb || !tb.fighters) return [];
  return tb.fighters.filter(f => f.kind === 'villager').map(f => f.villagerId);
}

(async () => {
  // ---- RED / GREEN: the join fixture ----
  const { Game, ridA, ridB } = await buildFixture();
  await quietLog(async () => { Game.startCombat('bulldozer'); });
  const joined = joinedIds(Game);
  const posA = (Game.state.village.positions || {})[ridA] || null;
  const posB = (Game.state.village.positions || {})[ridB];
  const distA = posA ? Math.max(Math.abs(posA.mx - 4), Math.abs(posA.my - 7)) : 99;

  if (RED) {
    check('RED: stale companion A does NOT join on pristine-equivalent code', !joined.includes(ridA), `joined=[${joined.join(',')}]`);
    check('RED: A still has no grid position', posA === null);
  } else {
    check('GREEN: A has a grid position after fix', posA !== null, JSON.stringify(posA));
    check('GREEN: A joins the fight', joined.includes(ridA), `joined=[${joined.join(',')}]`);
    check('GREEN: A is within 4 squares of the scholar', distA <= 4, `dist=${distA}`);
    check('GREEN: B (inside hall) keeps no position — door rule intact', posB === undefined || posB === null);
    check('GREEN: B does NOT join — door semantics unchanged', !joined.includes(ridB));
    check('GREEN: fight is live and well-formed', !!Game.tbfight && !Game.tbfight.over);
  }
  try { Game.tbfight = null; } catch (e) {}

  // ---- DET-GATE: byte-identical across two identical seeded runs ----
  if (!RED) {
    const snap = [];
    for (let i = 0; i < 2; i++) {
      const f = await buildFixture();
      await quietLog(async () => { f.Game.startCombat('bulldozer'); });
      const tb = f.Game.tbfight;
      snap.push(JSON.stringify({
        pos: f.Game.state.village.positions,
        fighters: (tb.fighters || []).map(x => ({ k: x.key, mx: x.mx, my: x.my, hp: x.hp })),
      }));
      try { f.Game.tbfight = null; } catch (e) {}
    }
    check('DET-GATE: two seeded runs byte-identical', snap[0] === snap[1],
      snap[0] === snap[1] ? `${snap[0].length} bytes` : 'DIVERGED');
  }

  // ---- SMOKE: short live run with the fix ----
  if (!RED) {
    const { Game: G2 } = await loadGame({ seed: SEED + 1, mode: 'compresence', fullTelemetry: false });
    await setupGame(G2);
    let err = null, days = 0;
    try {
      await quietLog(async () => {
        const r = await runDays(G2, TF.leadfeast, { days: 10, manifest: undefined, sampleEvery: 30 });
        days = r.days;
      });
    } catch (e) { err = e; }
    check('SMOKE: 10d leadfeast run completes with fix', !err && days >= 10, err ? String(err && err.message) : `days=${days}`);
  }

  console.log(failures === 0 ? `\nALL GREEN (${RED ? 'RED-mode' : 'fix-mode'})` : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
