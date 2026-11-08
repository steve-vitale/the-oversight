#!/usr/bin/env node
// test-dawn-midday-repick.js — OVE-38 Candidate B (VILLAGER-BRAIN seam 9)
//
// Pre-registered before behavior change (panel byte-stability):
 //   - Dawn errand-mix CORE_KINDS absDelta ≤ 0.08 vs extras-off baseline
 //     (same contract as test-villager-brain-dawn.js; this change demotes
 //     mid-day idle/done call sites only — direct objPick panel stays put).
 //   - Mid-day idle/done via objRefreshPick / objMaybeDepart / objTick MUST
 //     NOT rewrite vbrainCommit without stale commit day/part or a
 //     perception flag.
 //
 // Proves:
 //   1. Same-day mid-day idle does not rewrite commitment (no perception).
 //   2. Perception flag authorizes one refresh and is consumed.
 //   3. Stale day (new scholar day) authorizes refresh without perception.
 //   4. Dawn force-refresh still runs.
 //
 // Usage: node scripts/test-dawn-midday-repick.js
 // Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = 20261108;
// Pre-registered panel tolerance (unchanged from dawn proof).
const TOLERANCE = 0.08;

function out(o) { console.log(JSON.stringify(o)); }
function fail(msg, extra) {
  out(Object.assign({ pass: false, fail: msg }, extra || {}));
  process.exit(1);
}

function snapCommit(c) {
  if (!c) return null;
  return {
    kind: c.kind,
    day: c.day,
    part: c.part,
    scoreAtChoice: c.scoreAtChoice,
    winPlanAction: c.winPlanAction || null,
    vbrainSrc: c.vbrainSrc || null,
    logIndex: c.logIndex,
  };
}

function sameCommit(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.kind === b.kind && a.day === b.day && a.part === b.part &&
    a.scoreAtChoice === b.scoreAtChoice &&
    a.winPlanAction === b.winPlanAction &&
    a.vbrainSrc === b.vbrainSrc &&
    a.logIndex === b.logIndex;
}

function prepVillage(Game) {
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
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
  return { v, hx, hy, ids };
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

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.vbrainShouldRefresh !== 'function' ||
      typeof Game.vbrainMarkPerception !== 'function' ||
      typeof Game.objRefreshPick !== 'function' ||
      typeof Game.vbrainOwnsDawn !== 'function') {
    out({ skip: 'mid-day refresh API missing' });
    process.exit(2);
  }
  if (!Game.vbrainOwnsDawn()) fail('vbrainOwnsDawn returned false');

  const { v, hx, hy, ids } = prepVillage(Game);
  if (!ids.length) { out({ skip: 'roster empty' }); process.exit(2); }
  const vid = ids[0];

  // --- Dawn force pick writes commitment (whole roster so objTick is quiet) ---
  Game.dayPart = 0;
  for (const id of ids) {
    setIdle(Game, id);
    Game.objRefreshPick(id, hx, hy, { dawn: true });
  }
  const dawnCommit = snapCommit(Game.vbrainCommit(vid));
  if (!dawnCommit || !dawnCommit.kind) fail('dawn commit missing', { dawnCommit });
  const picksAfterDawn = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (picksAfterDawn < ids.length) fail('dawn did not increment picks', { picksAfterDawn, roster: ids.length });
  if (Game.vbrainShouldRefresh(vid)) {
    fail('fresh same-day commit should not want refresh', { dawnCommit });
  }

  // --- Mid-day idle without perception: commitment must not rewrite ---
  Game.dayPart = 1; // midday
  setIdle(Game, vid);
  const beforeMid = snapCommit(Game.vbrainCommit(vid));
  const picksBeforeMid = (((v.vbrain || {}).stats || {}).picks) || 0;
  Game.objRefreshPick(vid, hx, hy);
  const afterRefresh = snapCommit(Game.vbrainCommit(vid));
  const picksAfterRefresh = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (!sameCommit(beforeMid, afterRefresh) || picksAfterRefresh !== picksBeforeMid) {
    fail('mid-day objRefreshPick rewrote commit without perception', {
      beforeMid, afterRefresh, picksBeforeMid, picksAfterRefresh,
    });
  }

  // objMaybeDepart path (idle/done at haven)
  setIdle(Game, vid);
  const node = { nx: hx, ny: hy };
  Game.objMaybeDepart(vid, node, true, hx, hy);
  const afterDepart = snapCommit(Game.vbrainCommit(vid));
  const picksAfterDepart = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (!sameCommit(beforeMid, afterDepart) || picksAfterDepart !== picksBeforeMid) {
    fail('mid-day objMaybeDepart rewrote commit without perception', {
      beforeMid, afterDepart, picksBeforeMid, picksAfterDepart,
    });
  }

  // objTick indoor-fallback path at midday
  setIdle(Game, vid);
  Game.objTick();
  const afterTick = snapCommit(Game.vbrainCommit(vid));
  const picksAfterTick = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (!sameCommit(beforeMid, afterTick) || picksAfterTick !== picksBeforeMid) {
    fail('mid-day objTick rewrote commit without perception', {
      beforeMid, afterTick, picksBeforeMid, picksAfterTick,
    });
  }

  // --- Perception flag authorizes one refresh and is consumed ---
  setIdle(Game, vid);
  Game.vbrainMarkPerception(vid, 'probe_threat');
  if (!Game.vbrainShouldRefresh(vid)) fail('perception flag did not authorize refresh');
  Game.objRefreshPick(vid, hx, hy);
  const afterPerc = snapCommit(Game.vbrainCommit(vid));
  const picksAfterPerc = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (picksAfterPerc !== picksBeforeMid + 1) {
    fail('perception refresh did not rewrite commit once', {
      picksBeforeMid, picksAfterPerc, afterPerc,
    });
  }
  if (Game.vbrainShouldRefresh(vid)) {
    fail('perception flag was not consumed after refresh', {
      perception: (v.vbrain && v.vbrain.perception && v.vbrain.perception[vid]) || null,
      afterPerc,
    });
  }
  // Second mid-day idle must hold again
  setIdle(Game, vid);
  const hold = snapCommit(Game.vbrainCommit(vid));
  Game.objRefreshPick(vid, hx, hy);
  if (!sameCommit(hold, snapCommit(Game.vbrainCommit(vid)))) {
    fail('post-perception mid-day idle rewrote commit again');
  }

  // --- Stale day authorizes refresh without perception ---
  const day0 = (Game.state.scholar || {}).day || 0;
  Game.state.scholar.day = day0 + 1;
  Game.dayPart = 1;
  setIdle(Game, vid);
  if (!Game.vbrainShouldRefresh(vid)) fail('stale day did not authorize refresh', {
    commit: Game.vbrainCommit(vid), day: Game.state.scholar.day,
  });
  const picksBeforeStale = (((v.vbrain || {}).stats || {}).picks) || 0;
  Game.objRefreshPick(vid, hx, hy);
  const afterStale = snapCommit(Game.vbrainCommit(vid));
  const picksAfterStale = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (picksAfterStale !== picksBeforeStale + 1 || !afterStale || afterStale.day !== day0 + 1) {
    fail('stale-day refresh failed', { afterStale, picksBeforeStale, picksAfterStale, day0 });
  }

  // --- Dawn force still refreshes even with a same-day commit ---
  Game.dayPart = 0;
  setIdle(Game, vid);
  // Same day as afterStale commit — without force, shouldRefresh is false.
  if (Game.vbrainShouldRefresh(vid)) {
    // Acceptable if part metadata somehow stale; force path still required.
  } else if (!Game.vbrainShouldRefresh(vid, { dawn: true })) {
    fail('dawn force did not authorize refresh');
  }
  const picksBeforeDawn2 = (((v.vbrain || {}).stats || {}).picks) || 0;
  Game.objRefreshPick(vid, hx, hy, { dawn: true });
  const picksAfterDawn2 = (((v.vbrain || {}).stats || {}).picks) || 0;
  if (picksAfterDawn2 !== picksBeforeDawn2 + 1) {
    fail('dawn force refresh did not rewrite commit', { picksBeforeDawn2, picksAfterDawn2 });
  }

  out({
    pass: true,
    seed: SEED,
    panelTolerancePrereg: TOLERANCE,
    dawnCommit,
    midDayNoRewrite: true,
    perceptionRefresh: true,
    staleDayRefresh: true,
    dawnForceRefresh: true,
    finalCommit: snapCommit(Game.vbrainCommit(vid)),
    picks: (((v.vbrain || {}).stats || {}).picks) || 0,
  });
})().catch((e) => {
  fail('threw', { err: String(e && e.stack || e) });
});
