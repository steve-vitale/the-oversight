// test-transplant6b-refresh.js — targeted before/after proof for the
// narrowed family 6b hunks (arm sim-transplant6b-a).
//
// The 6b hunks (family-diff, src/js/villager-objectives.js, +63/-8)
// add objRefreshPick / objNeedsEmergencyPick and switch three mid-day
// call sites from direct objPick to objRefreshPick. On far-end
// substrate the objRefreshPick guard is DEAD: vbrainOwnsDawn /
// vbrainShouldRefresh / vbrainMarkPerception exist in NO src/js file
// at the far end, so the guard's first typeof test is false, the &&
// short-circuits, and objRefreshPick falls straight through to
// objPick. This script proves that equivalence live:
//
//   Mode pick: stage an idle/done villager at haven, call
//     Game.objPick(vid, hx, hy) once, print the resulting objective
//     JSON + next RNG draw. Runs on BOTH trees (the control).
//   Mode refresh: same staging, call Game.objRefreshPick(vid, hx, hy)
//     once, print the same JSON. EXPECTED: exit 1 on the far end
//     (the method does not exist — the pre-fix control) and exit 0
//     on the 6b subject, with output BYTE-IDENTICAL to mode pick on
//     the subject (same seed, same staging) — the live proof that
//     objRefreshPick === objPick on this substrate.
//
// The script also prints the substrate fact directly: on the subject,
// typeof Game.vbrainOwnsDawn / vbrainShouldRefresh /
// vbrainMarkPerception are all 'undefined', while typeof
// Game.objRefreshPick / objNeedsEmergencyPick are 'function'.
//
// Staging mirrors the family proof (scripts/test-dawn-midday-repick.js):
// seed 1, prepVillage (stocked pantry, settled needs, villagers at
// haven, inside), first non-player villager set idle/done.
//
// Usage: node scripts/test-transplant6b-refresh.js [--mode pick|refresh]
//   Exit 0 iff the selected mode runs and returns an objective.
//   EXPECTED: pick 0 on both trees; refresh 1 on the far end, 0 on
//   the 6b subject with JSON identical to pick on the subject. Run
//   from the tree under test (pathspec extract for old trees — never
//   a full-tree extract, /tmp tmpfs is 512M).
'use strict';
process.env.TRIBFLOOR = '1';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));

const SEED = 1;
const MODE = (process.argv.find(function (a) { return a.indexOf('--mode=') === 0; }) || '--mode=pick').slice('--mode='.length);

function out(o) { console.log(JSON.stringify(o)); }

function prepVillage(Game) {
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; }
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 50;
    try { if (v.away) delete v.away[id]; } catch (e) {}
  }
  return { v: v, hx: hx, hy: hy, ids: ids };
}

function setIdle(Game, vid) {
  const o = Game.objOf(vid);
  o.kind = 'idle';
  o.state = 'done';
  o.indoor = false;
  o.purpose = null;
  o.chore = null;
  o.partsLeft = 0;
  o.tx = null; o.ty = null;
  o.targetVid = null; o.companion = null;
  return o;
}

function snapObjective(Game, vid) {
  const o = Game.objOf(vid) || {};
  return {
    kind: o.kind || null,
    state: o.state || null,
    indoor: !!o.indoor,
    purpose: o.purpose || null,
    chore: o.chore || null,
    tx: (o.tx === undefined || o.tx === null) ? null : o.tx,
    ty: (o.ty === undefined || o.ty === null) ? null : o.ty,
    targetVid: o.targetVid || null,
    companion: o.companion || null,
    partsLeft: (o.partsLeft === undefined || o.partsLeft === null) ? null : o.partsLeft,
  };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'transplant6b-refresh' });
  await setupGame(Game);

  const substrate = {
    vbrainOwnsDawn: typeof Game.vbrainOwnsDawn,
    vbrainShouldRefresh: typeof Game.vbrainShouldRefresh,
    vbrainMarkPerception: typeof Game.vbrainMarkPerception,
    objRefreshPick: typeof Game.objRefreshPick,
    objNeedsEmergencyPick: typeof Game.objNeedsEmergencyPick,
    objPick: typeof Game.objPick,
  };

  if (MODE !== 'pick' && MODE !== 'refresh') {
    out({ pass: false, fail: 'unknown mode ' + MODE, substrate: substrate });
    process.exit(2);
  }
  if (MODE === 'refresh' && typeof Game.objRefreshPick !== 'function') {
    // Far-end control: the method does not exist there.
    out({ pass: false, fail: 'objRefreshPick missing (far-end control)', mode: MODE, substrate: substrate });
    process.exit(1);
  }
  if (typeof Game.objPick !== 'function') {
    out({ pass: false, fail: 'objPick missing', mode: MODE, substrate: substrate });
    process.exit(1);
  }

  const { hx, hy, ids } = prepVillage(Game);
  if (!ids.length) {
    out({ pass: false, fail: 'roster empty', mode: MODE, substrate: substrate });
    process.exit(2);
  }
  const vid = ids[0];
  Game.dayPart = 1; // midday
  setIdle(Game, vid);
  if (MODE === 'pick') Game.objPick(vid, hx, hy);
  else Game.objRefreshPick(vid, hx, hy);
  out({
    pass: true,
    mode: MODE,
    seed: SEED,
    objective: snapObjective(Game, vid),
    rngNext: Math.random(),
    substrate: substrate,
  });
  process.exit(0);
})().catch(function (e) {
  out({ pass: false, fail: 'threw', err: String((e && e.stack) || e) });
  process.exit(1);
});
