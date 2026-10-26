#!/usr/bin/env node
// scripts/test-driveoff-a.js — sim-driveoff-a proof tests
// (policy determinism + drive-off proof + sweep comparison).
//
// UNIT ONLY (fake Game objects, synthetic recorder stores) —
// no harness, no repo writes. The live det-gate lives in
// scripts/test-feastdraw-driveoff-sweep.js --detgate (real game,
// one seed, policy-off == plain tableseat-nowait).
'use strict';
const { feastdrawDriveoff, driveoffLayerOn, liveDraw, driveOffNow } = require('./policies/feastdraw-driveoff');
const { analyzeFeastdraw } = require('./policies/feastdraw-diag');
const { classifyStart } = require('./policies/nonworldkill-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function fakeGame(draw) {
  // draw: {monsterId, veteran, day} | null. driveOffFeastDraw
  // mimics the game's contract: deletes the draw, clears the
  // pending encounter, returns {ok:true, drivenOff:true} — or
  // {ok:false} when nothing is pending.
  const s = { day: (draw && draw.day) || 10 };
  if (draw) s.feastDraw = { monsterId: draw.monsterId, veteran: !!draw.veteran, day: draw.day };
  const G = {
    state: { scholar: s },
    over: false, tbfight: null,
    pendingEncounter: !!draw, pendingMonsterId: draw ? draw.monsterId : null,
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
delete process.env.FEASTDRAWDRIVEOFF;
check('layer off by default', driveoffLayerOn() === false);
process.env.FEASTDRAWDRIVEOFF = '1';
check('layer on at 1', driveoffLayerOn() === true);
process.env.FEASTDRAWDRIVEOFF = 'yes';
check('layer off at non-1', driveoffLayerOn() === false);
delete process.env.FEASTDRAWDRIVEOFF;

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

// --- 3. driveOffNow: explicit drive-off + phantom post-check.
{
  const G = fakeGame({ monsterId: 'mirror_stag', veteran: true, day: 162 });
  const ctx = {};
  const ok = driveOffNow(G, ctx, 'pending');
  check('driveOffNow returns true on ok', ok === true);
  check('driveOffNow counts the attempt + ok', ctx.fdDriveoffAttempts === 1 && ctx.fdDriveoffOk === 1);
  check('driveOffNow post-check has no phantom', ctx.fdDriveoffChecks && ctx.fdDriveoffChecks.length === 1
    && ctx.fdDriveoffChecks[0].phantom === false
    && ctx.fdDriveoffChecks[0].post.pendingEncounter === false
    && ctx.fdDriveoffChecks[0].post.feastDraw === null);
  check('driveOffNow leaves no pending encounter', G.pendingEncounter === false && G.pendingMonsterId === null);
  const ctx2 = {};
  check('driveOffNow false with no draw', driveOffNow(fakeGame(null), ctx2, 'pending') === false);
  check('driveOffNow counts nothing with no draw', ctx2.fdDriveoffAttempts == null);
  const G3 = fakeGame({ monsterId: 'cliffhanger', veteran: false, day: 38 });
  G3.driveOffFeastDraw = function () { return { ok: false, why: 'game over' }; };
  const ctx3 = {};
  check('driveOffNow false on not-ok', driveOffNow(G3, ctx3, 'upkeep') === false);
  check('driveOffNow records the failed attempt', ctx3.fdDriveoffAttempts === 1 && ctx3.fdDriveoffOk == null
    && ctx3.fdDriveoffFailed && ctx3.fdDriveoffFailed.length === 1);
}

// --- 4. Policy pending(): OFF delegates to nothing, ON drives off.
{
  delete process.env.FEASTDRAWDRIVEOFF;
  const G = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  const ctx = {};
  check('pending() off returns false without touching game', feastdrawDriveoff.pending(G, ctx) === false
    && !!G.state.scholar.feastDraw && G.pendingEncounter === true && ctx.fdDriveoffAttempts == null);
  process.env.FEASTDRAWDRIVEOFF = '1';
  const G2 = fakeGame({ monsterId: 'strike', veteran: false, day: 115 });
  const ctx2 = {};
  check('pending() on drives off', feastdrawDriveoff.pending(G2, ctx2) === true
    && !G2.state.scholar.feastDraw && G2.pendingEncounter === false);
  delete process.env.FEASTDRAWDRIVEOFF;
}

// --- 5. Analyzer: a driven-off draw classifies driven-off, with
// no fight join when no feast-draw start exists (the phantom
// proof at the analyzer level).
function synthFdStore() {
  return {
    grants: [{ day: 115, granted: true, refreshed: false, mult: 2.03, quality: 1, why: null, drawMonsterId: 'strike', preDraw: null, preBuff: null, postDraw: { monsterId: 'strike', veteran: false, day: 115 }, threw: null }],
    draws: [{ day: 115, drawn: true, monsterId: 'strike', veteran: false, wave: 4, why: null, grantIdx: 0, threw: null }],
    faces: [],
    driveoffs: [{ day: 115, ok: true, drivenOff: true, monsterId: 'strike', preDraw: { monsterId: 'strike', veteran: false, day: 115 }, why: null, threw: null }],
    clears: [],
    errs: 0, errors: [], overflow: {},
  };
}
{
  const an = analyzeFeastdraw(synthFdStore(), { starts: [], ends: [] });
  check('analyzer: driven-off outcome', an.drawOutcomes.length === 1 && an.drawOutcomes[0].outcome === 'driven-off');
  check('analyzer: faced 0, driven 1', an.faced === 0 && an.drivenOff === 1);
  check('analyzer: no fight join on driven-off draw', an.drawOutcomes[0].fightId == null);
  check('analyzer: unclassified 0', an.unclassified === 0);
  check('analyzer: wave-4 draw counted, no wave-4 kill', an.wave4Draws === 1 && an.wave4Kills === 0);
}
// --- 6. Analyzer + fallback cross-check: a feast-draw start
// matching a driven-off draw IS visible (fight join present,
// initiator harness-fallback) — the summary's
// drivenOffWithFight / fallbackForDrivenOff detectors have input.
{
  const nwk = {
    starts: [{ day: 115, arg: 'strike', mid: 'strike', wave: 4, fightId: 'f_fallback', feastDraw: { monsterId: 'strike', veteran: false, day: 115 }, stack: 'driveContestsImpl', stackLines: [], origin: null }],
    ends: [{ day: 115, fightId: 'f_fallback', result: 'won', newLog: [] }],
  };
  const cls = classifyStart(nwk.starts[0]);
  check('classifyStart: fallback start is feast-draw/harness-fallback', cls.door === 'feast-draw' && cls.initiator === 'harness-fallback');
  const an = analyzeFeastdraw(synthFdStore(), nwk);
  check('analyzer: driven-off precedence beats the start row', an.drawOutcomes[0].outcome === 'driven-off');
  check('analyzer: driven-off draw WITH a fight join is visible', an.drawOutcomes[0].fightId === 'f_fallback');
}
// --- 7. Analyzer: faced-face still classifies (control sanity).
{
  const fd = synthFdStore();
  fd.driveoffs = [];
  fd.faces = [{ day: 115, ok: true, monsterId: 'strike', preDraw: { monsterId: 'strike', veteran: false, day: 115 }, why: null, threw: null }];
  const nwk = {
    starts: [{ day: 115, arg: 'strike', mid: 'strike', wave: 4, fightId: 'f_face', feastDraw: { monsterId: 'strike', veteran: false, day: 115 }, stack: 'at faceFeastDraw (feastBuff.js)', stackLines: [], origin: null }],
    ends: [{ day: 115, fightId: 'f_face', result: 'won', newLog: [{ d: 115, mid: 'strike', w: 4, by: 'elif_demir', via: 'player' }] }],
  };
  const an = analyzeFeastdraw(fd, nwk);
  check('analyzer: faced-face outcome + kill join', an.drawOutcomes[0].outcome === 'faced-face'
    && an.drawOutcomes[0].hasKill === true && an.wave4Kills === 1);
}

console.log(`\ntest-driveoff-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
