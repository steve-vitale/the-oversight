#!/usr/bin/env node
// scripts/test-driveoff-clean-a.js — sim-driveoff-clean-a proof tests
// (policy determinism + intercept proof + sweep comparison hooks).
//
// UNIT ONLY (fake Game objects, synthetic recorder stores) —
// no harness, no repo writes. The live det-gate lives in
// scripts/test-feastdraw-driveoff-clean-sweep.js --detgate (real
// game, one seed, policy-off == plain tableseat-nowait).
'use strict';
const { feastdrawDriveoffClean, cleanLayerOn, liveDraw, installFaceIntercept } = require('./policies/feastdraw-driveoff-clean');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function fakeGame(draw) {
  // draw: {monsterId, veteran, day} | null. faceFeastDraw mimics
  // the game's contract (starts combat, deletes the draw);
  // driveOffFeastDraw mimics the game's contract (deletes the
  // draw, clears pending, returns ok). The test's "combat" is a
  // flag — no real fight engine runs here.
  const s = { day: (draw && draw.day) || 10 };
  if (draw) s.feastDraw = { monsterId: draw.monsterId, veteran: !!draw.veteran, day: draw.day };
  const G = {
    state: { scholar: s },
    over: false, tbfight: null,
    pendingEncounter: !!draw, pendingMonsterId: draw ? draw.monsterId : null,
    faced: 0,
    faceFeastDraw() {
      if (!this.state.scholar.feastDraw || !this.pendingEncounter) return { ok: false };
      this.faced++;
      const mid = this.state.scholar.feastDraw.monsterId;
      delete this.state.scholar.feastDraw;
      this.pendingEncounter = false; this.pendingMonsterId = null;
      return { ok: true, monsterId: mid };
    },
    driveOffFeastDraw() {
      if (!this.state.scholar.feastDraw || !this.pendingEncounter) return { ok: false };
      delete this.state.scholar.feastDraw;
      this.pendingEncounter = false; this.pendingMonsterId = null;
      return { ok: true, drivenOff: true };
    },
  };
  return G;
}

// --- 1. Layer gate: default OFF, '1' ON, anything else OFF.
delete process.env.FEASTDRAWCLEAN;
check('layer off by default', cleanLayerOn() === false);
process.env.FEASTDRAWCLEAN = '1';
check('layer on at 1', cleanLayerOn() === true);
process.env.FEASTDRAWCLEAN = 'yes';
check('layer off at non-1', cleanLayerOn() === false);
delete process.env.FEASTDRAWCLEAN;

// --- 2. liveDraw: pure reads only (never deletes, never throws).
{
  const G = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  const d = liveDraw(G);
  check('liveDraw returns the pending draw', !!d && d.monsterId === 'strike');
  check('liveDraw leaves state untouched', !!G.state.scholar.feastDraw && G.pendingEncounter === true);
  const stale = fakeGame(null);
  stale.state.scholar.feastDraw = { monsterId: 'strike', veteran: false, day: 115 };
  stale.pendingEncounter = false; stale.pendingMonsterId = null;
  check('liveDraw null on stale marker', liveDraw(stale) === null);
  check('liveDraw does NOT delete the stale marker (pure read)', !!stale.state.scholar.feastDraw);
  check('liveDraw null with no draw', liveDraw(fakeGame(null)) === null);
}

// --- 3. Intercept: a face call with a live draw drives off instead.
{
  const G = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  const ctx = {};
  check('intercept installs', installFaceIntercept(G, ctx) === true);
  check('intercept flag set', G._fdCleanInterceptInstalled === true);
  const r = G.faceFeastDraw();
  check('intercept returns the driveoff result', !!(r && r.ok && r.drivenOff));
  check('intercept did NOT start the (fake) fight', G.faced === 0);
  check('intercept cleared the draw', !G.state.scholar.feastDraw && !G.pendingEncounter);
  check('intercept counted once', ctx.fdCleanIntercept === 1);
  check('intercept post-check recorded, phantom-free',
    Array.isArray(ctx.fdCleanChecks) && ctx.fdCleanChecks.length === 1 && ctx.fdCleanChecks[0].phantom === false
    && ctx.fdCleanChecks[0].where === 'intercept' && ctx.fdCleanChecks[0].monsterId === 'strike');
  check('second install is a no-op (same function kept)', (() => { const f = G.faceFeastDraw; return installFaceIntercept(G, ctx) === true && G.faceFeastDraw === f; })());
}

// --- 4. Intercept fallback: a face call with NO live draw behaves as the original face.
{
  const G = fakeGame(null);
  const ctx = {};
  installFaceIntercept(G, ctx);
  const r = G.faceFeastDraw();
  check('fallback calls original face (ok:false, nothing pending)', r && r.ok === false);
  check('fallback counted', ctx.fdCleanFallback === 1);
  check('fallback drives off nothing', ctx.fdCleanIntercept == null);
}
{
  // Stale marker (draw present, pending dead): fallback path, marker untouched by liveDraw.
  const G = fakeGame(null);
  G.state.scholar.feastDraw = { monsterId: 'strike', veteran: false, day: 115 };
  const ctx = {};
  installFaceIntercept(G, ctx);
  G.faceFeastDraw();
  check('stale-marker face falls back and leaves marker to the original', ctx.fdCleanFallback === 1 && ctx.fdCleanIntercept == null);
}

// --- 5. Intercept failure path: driveOff throws -> counted, no fight, no crash.
{
  const G = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  G.driveOffFeastDraw = () => { throw new Error('boom'); };
  const ctx = {};
  installFaceIntercept(G, ctx);
  const r = G.faceFeastDraw();
  check('driveoff throw returns not-ok, no fight', r && r.ok === false && G.faced === 0);
  check('driveoff throw counted in ctx', typeof ctx.fdCleanErr === 'string' && ctx.fdCleanErr.indexOf('boom') >= 0);
}

// --- 6. Policy object shape: off delegates, on installs + prechecks without crashing on fakes.
// Off: upkeep must NOT install the intercept and must NOT touch ctx fd keys.
// (tableseatNowait.upkeep is competent.upkeep — too heavy for a fake
// Game, so this leg only asserts the layer gate + policy identity here;
// the live det-gate proves off-delegation on the real game.)
check('policy id is feastdraw-driveoff-clean', feastdrawDriveoffClean.id === 'feastdraw-driveoff-clean');
check('policy exposes upkeep/daily/pending',
  typeof feastdrawDriveoffClean.upkeep === 'function'
  && typeof feastdrawDriveoffClean.daily === 'function'
  && typeof feastdrawDriveoffClean.pending === 'function');
{
  const G = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  const ctx = {};
  delete process.env.FEASTDRAWCLEAN;
  check('pending returns false when layer off', feastdrawDriveoffClean.pending(G, ctx) === false);
  check('pending off touches no fd ctx keys', ctx.fdCleanIntercept == null && ctx.fdDriveoffAttempts == null);
  process.env.FEASTDRAWCLEAN = '1';
  check('pending drives off when layer on', feastdrawDriveoffClean.pending(G, ctx) === true);
  check('pending drive-off cleared the draw', !G.state.scholar.feastDraw && !G.pendingEncounter);
  delete process.env.FEASTDRAWCLEAN;
}

// --- 7. Patrol separation logic (sweep-side map rule, pure): per-day max, never summed across upkeeps.
function patrolMapAdd(map, day, sweeps) {
  if (sweeps > 0) map[day] = Math.max(map[day] || 0, sweeps);
}
{
  const m = {};
  patrolMapAdd(m, 60, 2); patrolMapAdd(m, 60, 3); patrolMapAdd(m, 60, 1); patrolMapAdd(m, 61, 0);
  const total = Object.values(m).reduce((t, v) => t + v, 0);
  check('patrol map takes per-day max (3, not 2+3+1)', total === 3 && Object.keys(m).length === 1);
}

console.log(`\ntest-driveoff-clean-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
