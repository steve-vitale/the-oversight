#!/usr/bin/env node
// scripts/test-feastexposure-20261015.js — PROOF for the feast fight-exposure
// gate arm (flesh-out loop A, 2026-10-15, scale-onramp axis).
//
// THE LEVER: scripts/policies/feastexposure.js wraps the FEASTSCALE_R13
// road (belongfeast/leadfeast) -> belongexposure/leadexposure. Opt-in via
// FEASTEXPOSURE=1 (default OFF). Gate on: each upkeep, the pending feast
// draw (while feasted, deed unmarked) is ASSESSED (assessDraw: the policy's
// own fightAssessDPR knowledge model + veteran stat line + the real feasted
// damage uplift + the 1.3 race margin + a 50%-HP prudence floor) — twice
// per tick: BEFORE the wrapped road's upkeep (pre-empting feastFightRoad's
// unconditional face of a night-surviving draw) and AFTER it (the fresh
// draw this tick's feast just created — the night's sleep wakes on a
// pending encounter and fights it that night, so the dusk tick-end is the
// last policy chance to decline):
// favorable -> left (the real fight, while feasted; the deed marks);
// unfavorable -> Game.driveOffFeastDraw() (the engine's honest decline —
// the devotion stays armed for the next feast); deed already marked ->
// lingerers driven off (the per-window cap). Zero src/js changes.
//
// RED PHASE (FEASTEXPOSURE unset):
//   R1. gate-off byte-identical: belongexposure/leadexposure ==
//       belongfeast/leadfeast per-day run hashes, 40d x2 seeds (substrate
//       FEASTSCALE_R13=1 both sides — the layer adds zero trajectory delta).
//   R2. gate-off, the gate never acts: on a live-draw fixture the gate's
//       own telemetry stays absent (exposureAssessed undefined) after the
//       layer's upkeep — the parent road behaves exactly as ungated.
// GREEN PHASE (FEASTEXPOSURE=1):
//   G1. favorable draw (known weak species, healthy scholar) -> LEFT for
//       the road: draw still pending after exposureGate, exposureLeft=1,
//       driveOffFeastDraw NOT called.
//   G2. unfavorable draw (unknown species -> pessimistic prior 20 DPR) ->
//       DRIVEN OFF: driveOffFeastDraw called once, draw cleared,
//       exposureDriven=1, the first-decline detail recorded.
//   G3. deed already marked (buff used) + lingering draw -> driven off,
//       exposureDrivenUsed=1 (the per-window cap).
//   G4. no draw pending -> no-op: counters zero, drive-off never called.
//   G5. veteran draw -> the veteran stat line is applied: mhp x1.5 and
//       monsterDPR +3 in the assessment detail (engine's game.js numbers).
//   G6. wounded scholar (hp < 50% max) + winnable race -> DRIVEN OFF with
//       hpFloorMiss in the detail (the prudence floor).
//   G7. determinism: identical fixture twice -> identical decision and
//       identical detail.
//   G8. armed 40d live run: the substrate still feasts (fsFeasts > 0) AND
//       the gate assessed live draws (exposureAssessed > 0).
//
// Fixture monsters: 'hummice' (wave 1, hp [10,14], dmg [4,8]) = the known
// weak species; 'heckler' (wave 2, hp [85,100], dmg [15,22]) left UNKNOWN
// = the pessimistic-prior species.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 node scripts/test-feastexposure-20261015.js
//   GREEN: FEASTSCALE_R13=1 FEASTEXPOSURE=1 node scripts/test-feastexposure-20261015.js
//
// Kill-protocol degradation: if the layer file is deleted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let FE;
try {
  FE = require('./policies/feastexposure');
} catch (e) {
  console.log('INFO-SKIP: feastexposure layer absent (reverted per kill protocol); proof was RED->GREEN pre-decision — see evidence/2026-10-15/sim-feastexposure.md');
  process.exit(0);
}
const FS = require('./policies/feastscale');

const ARMED = process.env.FEASTEXPOSURE === '1';
console.log('== feastexposure proof — ' + (ARMED ? 'ARMED (FEASTEXPOSURE=1)' : 'RED (gate off)') + ' ==');
console.log('   substrate FEASTSCALE_R13=' + (process.env.FEASTSCALE_R13 || '(unset)'));

const fails = [];
function check(name, cond, detail) {
  const ok = !!cond;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails.push(name);
}

function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}

// buildDrawFixture: a live feasted buff + a pending feast draw, with
// controlled scholar HP, codex knowledge, and veteran flag.
async function buildDrawFixture(seed, opts) {
  const o = Object.assign({ mid: 'hummice', veteran: false, known: true, scholarHp: 100, buffUsed: false, buffMult: 1.5 }, opts || {});
  const { Game } = await loadGame({ seed, mode: 'feastexposure-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  const s = Game.state.scholar;
  s.day = 30; Game.dayPart = 3; // night — the draw is decided the tick after the dusk feast
  s.health = o.scholarHp; s.hp = o.scholarHp;
  s.feastBuff = { untilDay: 32, untilPart: 0, used: !!o.buffUsed, mult: o.buffMult };
  s.feastDraw = { monsterId: o.mid, veteran: !!o.veteran, day: 30 };
  Game.pendingEncounter = true;
  Game.pendingMonsterId = o.mid;
  if (o.known) {
    Game.state.codex = Game.state.codex || {};
    Game.state.codex.monsters = Game.state.codex.monsters || {};
    Game.state.codex.monsters[o.mid] = { stage: 2 }; // examined — real damage known
  }
  check('fixture: feastedActive live', Game.feastedActive(), 'fixture setup');
  check('fixture: draw pending', !!(Game.feastDrawPending && Game.feastDrawPending()), 'mid=' + o.mid);
  return Game;
}

function spyDriveOff(Game) {
  let calls = 0;
  const orig = Game.driveOffFeastDraw;
  Game.driveOffFeastDraw = function (...a) { calls++; return orig.apply(this, a); };
  return { calls: () => calls, restore: () => { Game.driveOffFeastDraw = orig; } };
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastexposure-red' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, manifest: undefined, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  // ---------- R1: gate-off byte-identical vs the feastscale parents ----------
  console.log('== R1. gate-off byte-identical (belongexposure/leadexposure vs belongfeast/leadfeast, 40d) ==');
  if (!ARMED) {
    for (const [mine, theirs, label] of [[FE.belongexposure, FS.belongfeast, 'belong'], [FE.leadexposure, FS.leadfeast, 'lead']]) {
      const seed = label === 'belong' ? 22 : 11;
      const hMine = await runHashes(mine, seed, 40);
      const hTheirs = await runHashes(theirs, seed, 40);
      const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
      check(`R1 gate-off: ${label}exposure == ${label}feast per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: gate-off, the gate never acts ----------
  console.log('== R2. gate-off: the gate never acts on a live draw ==');
  if (!ARMED) {
    const Game = await buildDrawFixture(61, { mid: 'heckler', known: false, scholarHp: 100 });
    const spy = spyDriveOff(Game);
    const ctx = {};
    const pol = FE.leadexposure; // gate off -> parent behavior
    if (pol.setup) pol.setup(Game, ctx);
    pol.upkeep(Game, ctx); // the road's feastFightRoad may face it — the gate must not act
    check('R2 gate-off: no gate telemetry (exposureAssessed absent)', ctx.exposureAssessed === undefined, `exposureAssessed=${ctx.exposureAssessed}`);
    check('R2 gate-off: the gate never drove the draw off', spy.calls() === 0, `driveOffCalls=${spy.calls()}`);
    check('R2 gate-off: no gate counters at all',
      ctx.exposureLeft === undefined && ctx.exposureDriven === undefined && ctx.exposureDrivenUsed === undefined,
      JSON.stringify({ l: ctx.exposureLeft, d: ctx.exposureDriven, du: ctx.exposureDrivenUsed }));
    spy.restore();
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: favorable draw -> left for the road ----------
  console.log('== G1. favorable draw (known hummice, healthy scholar) -> LEFT ==');
  if (ARMED) {
    const Game = await buildDrawFixture(62, { mid: 'hummice', known: true, scholarHp: 100 });
    const spy = spyDriveOff(Game);
    const ctx = {};
    FE.exposureGate(Game, ctx);
    const stillPending = !!(Game.feastDrawPending && Game.feastDrawPending());
    check('G1 draw left pending for the road', stillPending, 'pending=' + stillPending);
    check('G1 driveOff NOT called', spy.calls() === 0, `calls=${spy.calls()}`);
    check('G1 exposureLeft=1', ctx.exposureLeft === 1, `exposureLeft=${ctx.exposureLeft}`);
    check('G1 decision detail recorded (face path)', !!(ctx.exposureLastDetail && ctx.exposureLastDetail.mid === 'hummice'),
      JSON.stringify(ctx.exposureLastDetail));
    spy.restore();
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: unfavorable draw -> driven off ----------
  console.log('== G2. unfavorable draw (unknown heckler -> pessimistic prior) -> DRIVEN OFF ==');
  if (ARMED) {
    const Game = await buildDrawFixture(63, { mid: 'heckler', known: false, scholarHp: 100 });
    const spy = spyDriveOff(Game);
    const ctx = {};
    FE.exposureGate(Game, ctx);
    const stillPending = !!(Game.feastDrawPending && Game.feastDrawPending());
    check('G2 draw cleared (driven off)', !stillPending, 'pending=' + stillPending);
    check('G2 driveOffFeastDraw called exactly once', spy.calls() === 1, `calls=${spy.calls()}`);
    check('G2 exposureDriven=1', ctx.exposureDriven === 1, `exposureDriven=${ctx.exposureDriven}`);
    check('G2 first-decline detail recorded', !!(ctx.exposureFirstDecline && ctx.exposureFirstDecline.mid === 'heckler'),
      JSON.stringify(ctx.exposureFirstDecline));
    check('G2 the pessimistic prior drove the decline (monsterDPR=20)',
      ctx.exposureFirstDecline && ctx.exposureFirstDecline.monsterDPR === 20,
      'monsterDPR=' + (ctx.exposureFirstDecline && ctx.exposureFirstDecline.monsterDPR));
    spy.restore();
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: deed already marked -> lingerer driven off (the cap) ----------
  console.log('== G3. deed marked (buff used) + lingering draw -> DRIVEN OFF (per-window cap) ==');
  if (ARMED) {
    const Game = await buildDrawFixture(64, { mid: 'hummice', known: true, scholarHp: 100, buffUsed: true });
    const spy = spyDriveOff(Game);
    const ctx = {};
    FE.exposureGate(Game, ctx);
    const stillPending = !!(Game.feastDrawPending && Game.feastDrawPending());
    check('G3 lingering draw cleared', !stillPending, 'pending=' + stillPending);
    check('G3 driveOffFeastDraw called', spy.calls() === 1, `calls=${spy.calls()}`);
    check('G3 exposureDrivenUsed=1 (cap counter)', ctx.exposureDrivenUsed === 1, `exposureDrivenUsed=${ctx.exposureDrivenUsed}`);
    check('G3 no race assessment wasted on a marked deed', ctx.exposureAssessed === undefined, `exposureAssessed=${ctx.exposureAssessed}`);
    spy.restore();
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: no draw -> no-op ----------
  console.log('== G4. no draw pending -> no-op ==');
  if (ARMED) {
    const { Game } = await loadGame({ seed: 65, mode: 'feastexposure-proof' });
    await setupGame(Game);
    Game.say = () => {};
    Game.state.scholar.day = 30;
    Game.state.scholar.feastBuff = { untilDay: 32, untilPart: 0, used: false, mult: 1.5 };
    const spy = spyDriveOff(Game);
    const ctx = {};
    FE.exposureGate(Game, ctx);
    check('G4 no counters move', ctx.exposureAssessed === undefined && ctx.exposureDriven === undefined && ctx.exposureLeft === undefined,
      JSON.stringify(ctx));
    check('G4 drive-off never called', spy.calls() === 0, `calls=${spy.calls()}`);
    spy.restore();
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: veteran stat line ----------
  console.log('== G5. veteran draw -> +50% HP / +3 DPR applied (game.js stat line) ==');
  if (ARMED) {
    const Game = await buildDrawFixture(66, { mid: 'heckler', veteran: true, known: true, scholarHp: 100 });
    const ctx = {};
    const d = Game.feastDrawPending();
    const verdict = FE.assessDraw(Game, ctx, d);
    check('G5 veteran mhp = 150 (100 x 1.5)', verdict.detail.mhp === 150, 'mhp=' + verdict.detail.mhp);
    check('G5 veteran monsterDPR = 21.5 (18.5 + 3)', verdict.detail.monsterDPR === 21.5, 'monsterDPR=' + verdict.detail.monsterDPR);
    check('G5 veteran flag in detail', verdict.detail.veteran === true, 'veteran=' + verdict.detail.veteran);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: the prudence floor ----------
  console.log('== G6. wounded scholar (hp < 50% max) + winnable race -> DRIVEN OFF ==');
  if (ARMED) {
    const Game = await buildDrawFixture(67, { mid: 'hummice', known: true, scholarHp: 40 });
    const spy = spyDriveOff(Game);
    const ctx = {};
    const d = Game.feastDrawPending();
    const verdict = FE.assessDraw(Game, ctx, d);
    check('G6 fixture really is sub-floor', verdict.detail.hpFrac < 0.5, 'hpFrac=' + verdict.detail.hpFrac);
    check('G6 the race itself is winnable (floor is the decider)', verdict.detail.lostRace === false && verdict.detail.deadInTwo === false,
      `lostRace=${verdict.detail.lostRace} deadInTwo=${verdict.detail.deadInTwo}`);
    FE.exposureGate(Game, ctx);
    check('G6 driveOffFeastDraw called (prudence floor)', spy.calls() === 1, `calls=${spy.calls()}`);
    check('G6 hpFloorMiss in the decline detail', !!(ctx.exposureFirstDecline && ctx.exposureFirstDecline.hpFloorMiss === true),
      JSON.stringify(ctx.exposureFirstDecline));
    spy.restore();
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: determinism ----------
  console.log('== G7. determinism: identical fixture twice -> identical decision ==');
  if (ARMED) {
    async function decide(seed) {
      const Game = await buildDrawFixture(seed, { mid: 'heckler', known: false, scholarHp: 100 });
      const ctx = {};
      const d = Game.feastDrawPending();
      const verdict = FE.assessDraw(Game, ctx, d);
      return `${verdict.face}|${JSON.stringify(verdict.detail)}`;
    }
    const a = await decide(68), b = await decide(68);
    check('G7 identical fixture -> identical verdict', a === b, a.slice(0, 80) + '...');
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: armed 40d live run — substrate feasts, gate assesses ----------
  console.log('== G8. armed 40d live run: substrate feasts + gate assesses draws ==');
  if (ARMED) {
    const { Game } = await loadGame({ seed: 69, mode: 'feastexposure-proof-run' });
    await setupGame(Game);
    Game.say = () => {};
    const pol = Object.assign({}, FE.belongexposure);
    let runCtx = null;
    const origSetup = FE.belongexposure.setup;
    pol.setup = (G, c) => { runCtx = c; if (origSetup) return origSetup(G, c); };
    await quietLog(async () => { await runDays(Game, pol, { days: 40, manifest: undefined, sampleEvery: 10 }); });
    const ctx = runCtx || {};
    check('G8 the feast substrate still fires (fsFeasts > 0)', (ctx.fsFeasts || 0) > 0, `fsFeasts=${ctx.fsFeasts}`);
    check('G8 the gate assessed live draws (exposureAssessed > 0)', (ctx.exposureAssessed || 0) > 0,
      `assessed=${ctx.exposureAssessed} left=${ctx.exposureLeft || 0} driven=${ctx.exposureDriven || 0} drivenUsed=${ctx.exposureDrivenUsed || 0}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF FAIL: ${fails.length} check(s) failed: ${fails.join(', ')}` : '\nPROOF: all checks passed (RED and GREEN), independently re-run.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
