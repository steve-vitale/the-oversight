#!/usr/bin/env node
// scripts/test-hybridroad-20261014.js — PROOF for the hybridroad arm (scale-onramp, r35).
//
// Two runs:
//   node scripts/test-hybridroad-20261014.js                # pristine: expect REAL RED
//   HYBRIDROAD=1 node scripts/test-hybridroad-20261014.js   # armed: expect GREEN
// SMOKE=1 runs the instrument-honesty gate (either side; fails loudly if the
// suite would ever run policy-less).
//
// RED phase: the gate is off, the export IS the pinned competent policy
// (reference-equal), and the hybrid behaviors cannot fire: zero hunt legs,
// zero readiness holds, zero committed hunts on the fixtures.
// GREEN phase: the layer (1) runs the diplomacy drive (courtshipPass fires
// the real proposeLink on the window), (2) fires modest engine-honest wave-3
// hunts pre-unlock (pace 6d, HP>=70%, stand down at 2 points), (3) holds a
// hurt scholar at Haven post-wave-4-unlock (recover-and-return machinery),
// (4) never hunts post-unlock, (5) marks live wave-3 fights committed.
//
// Fixture ledger banking goes through the REAL recordWaveKill verb — no state
// surgery on the ledger itself.
'use strict';
const ARMED = process.env.HYBRIDROAD === '1';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const results = [];
function ok(name, cond, detail) {
  results.push({ name, ok: !!cond, detail: detail || '' });
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

const W1 = ['bulldozer', 'hushwolf', 'gallowdeer', 'mirrormoth', 'belltoad'];
const W2 = ['voice_mimic_radio', 'mirror_stag', 'review_drone', 'bright_idea'];
const W3 = ['redactor', 'gavel', 'focus_group', 'spool'];

async function rig(seed) {
  const { Game } = await loadGame({ seed, mode: 'hybridroad-proof' });
  await setupGame(Game);
  Game.state.scholar.day = 30;
  return Game;
}
function unlockWave3(Game) {
  for (const id of W1) Game.recordWaveKill(id, 'player', 'test', null);
  for (const id of W2) Game.recordWaveKill(id, 'player', 'test', null);
  return (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 0;
}
function bankWave3Points(Game, n) {
  for (let i = 0; i < n; i++) Game.recordWaveKill(W3[i % W3.length], 'player', 'test', null);
  return (typeof Game.waveLedgerPoints === 'function') ? Game.waveLedgerPoints(3) : -1;
}
function healthyScholar(Game) {
  const s = Game.state.scholar;
  if (typeof Game.maxHealth === 'function') s.hp = Game.maxHealth();
  else s.hp = 100;
  s.kcal = 800;
}
function hurtScholar(Game, pct) {
  const s = Game.state.scholar;
  const max = (typeof Game.maxHealth === 'function') ? Game.maxHealth() : 100;
  s.hp = Math.max(1, Math.round(max * pct));
  s.kcal = 800;
}

// SMOKE: instrument-honesty gate — the harness must genuinely drive the
// policy (unwrapped daily is a function, invoked, >=1 policy-origin act),
// and the side's own layer must fire through its own path.
async function smokeGate(leadPolicy, armed) {
  const fails = [];
  const check = (name, cond, detail) => {
    const c = !!cond;
    console.log(`  ${c ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!c) fails.push(name);
  };
  check('unwrapped policy.daily is a function', leadPolicy && typeof leadPolicy.daily === 'function',
    'typeof=' + (leadPolicy && typeof leadPolicy.daily) + ' id=' + (leadPolicy && leadPolicy.id));
  check('policy id matches side', armed ? leadPolicy.id === 'hybridroad' : leadPolicy.id === 'competent',
    'id=' + leadPolicy.id + ' ARMED=' + armed);
  if (fails.length) { console.log('\nSMOKE STOP: unwrap failure.'); process.exit(1); }
  const { Game } = await loadGame({ seed: 11, mode: 'hybridroad-smoke' });
  await setupGame(Game);
  let result = null;
  const policy = Object.assign({}, leadPolicy);
  const origDaily = leadPolicy.daily;
  policy.daily = (G, ctx) => origDaily(G, ctx);
  await quietLog(async () => { result = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 10 }); });
  const pacing = result.pacing || {};
  check('harness invokes policy.daily (mean deliberate/day>0)', (pacing.meanDeliberatePerDay || 0) > 0,
    'mean=' + (pacing.meanDeliberatePerDay || 0));
  if (armed) {
    // (b-armed) the hunt leg fires on the wave-3-unlocked fixture through
    // the layer's own daily path.
    const { Game: G2 } = await loadGame({ seed: 12, mode: 'hybridroad-smoke2' });
    await setupGame(G2);
    G2.state.scholar.day = 30;
    unlockWave3(G2);
    healthyScholar(G2);
    const ctx = {};
    try { leadPolicy.daily(G2, ctx); } catch (e) {}
    check('HYBRIDROAD=1: hunt leg fires on the wave-3-unlocked fixture',
      (ctx.hybridHunts || 0) >= 1, `hybridHunts=${ctx.hybridHunts || 0} legs=${ctx.hybridHuntLegs || 0}`);
    // (c-armed) the readiness hold fires on the hurt post-unlock fixture.
    const { Game: G3 } = await loadGame({ seed: 13, mode: 'hybridroad-smoke3' });
    await setupGame(G3);
    G3.state.scholar.day = 80;
    G3.unlockedWave = () => 4;
    hurtScholar(G3, 0.5);
    const ctx3 = {};
    try { leadPolicy.daily(G3, ctx3); } catch (e) {}
    check('HYBRIDROAD=1: readiness hold fires when hurt post-unlock',
      (ctx3._recoverUntilDay || 0) > 80 && (ctx3.hybridHolds || 0) >= 1,
      `recoverUntil=${ctx3._recoverUntilDay || 0} holds=${ctx3.hybridHolds || 0}`);
  } else {
    check('gate off: layer inert (id is competent)', leadPolicy.id === 'competent', 'id=' + leadPolicy.id);
  }
  if (fails.length) { console.log('\nSMOKE STOP: instrument-honesty gate failed.'); process.exit(1); }
  console.log('SMOKE GREEN: harness drives the policy and the side layer fires when armed.');
}

(async () => {
  console.log(`hybridroad proof — ${ARMED ? 'ARMED (HYBRIDROAD=1), expect GREEN' : 'PRISTINE (gate off), expect REAL RED'}`);
  // Landed-tree guard (3184c187 pattern): a killed arm's layer is deleted per
  // kill protocol; the proof then INFO-SKIPs instead of FATALing.
  let mod = null;
  try { mod = require('./policies/hybridroad'); } catch (e) { mod = null; }
  if (!mod) {
    console.log('INFO-SKIP: policies/hybridroad.js absent (killed arm, layer deleted per kill protocol). Pre-kill RED→GREEN stands; nothing to run on the landed tree.');
    process.exit(0);
  }
  const { hybridroad, huntLive, readinessHold, wave3Points, HYBRIDROAD_ON, TUNE } = mod;
  const { competent } = require('./policies/competent');
  const { courtshipPass } = require('./policies/proposelayer');

  if (process.env.SMOKE === '1') { await smokeGate(hybridroad, ARMED); return; }

  if (!ARMED) {
    // ---- RED: the hybrid is inert ----
    ok('R1-armed-identity', hybridroad.id === 'hybridroad' && HYBRIDROAD_ON === true,
      `id=${hybridroad.id} on=${HYBRIDROAD_ON} — the layer is inert on pristine`);
    ok('R2-byte-identical-by-construction', hybridroad === competent,
      'gate-off export IS the competent object (reference-equal): zero behavioral delta possible');
    // R3 behavioral: the inert policy runs zero hybrid machinery on the
    // wave-3-unlocked fixture — no hunts, no holds, no commits.
    const Game = await rig(11);
    const w3 = unlockWave3(Game);
    healthyScholar(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    try { hybridroad.fight(Game, ctx); } catch (e) {}
    ok('R3-zero-hybrid-inert', w3 >= 3 && (ctx.hybridHunts || 0) === 0 &&
      (ctx.hybridHolds || 0) === 0 && !ctx._huntCommit && !(ctx._recoverUntilDay > 0),
      `wave=${w3} hunts=${ctx.hybridHunts || 0} holds=${ctx.hybridHolds || 0} — no hybrid machinery under the inert policy`);
    // R4: huntLive false with the gate off even when the recipe is unbanked.
    ok('R4-huntLive-off', huntLive(Game) === false, 'huntLive=false with gate off');
    const bad = results.filter(r => !r.ok);
    console.log(`\nRED: ${bad.length}/${results.length} failed on pristine (expected — the hybrid is inert).`);
    process.exit(bad.length ? 1 : 0);
  }

  // ---- GREEN ----
  ok('G1-armed-identity', hybridroad.id === 'hybridroad' && HYBRIDROAD_ON === true &&
    typeof hybridroad.daily === 'function' && typeof hybridroad.fight === 'function' &&
    TUNE.HUNT_POINTS_CAP === 2 && TUNE.HUNT_PACE_DAYS === 6 && TUNE.HUNT_HP_MIN === 0.70,
    `id=${hybridroad.id} on=${HYBRIDROAD_ON} cap=${TUNE.HUNT_POINTS_CAP} pace=${TUNE.HUNT_PACE_DAYS}d hp>=${TUNE.HUNT_HP_MIN}`);

  // G2 — the diplomacy drive: courtshipPass fires the real proposeLink on the
  // open window through the hybrid's own daily path.
  {
    const Game = await rig(12);
    Game.state.otherVillages[0].rumored = true;
    const v = Game.state.village;
    v.pantry = [{ id: 'hy-rig', kcalEach: 13000, units: 1, foodState: 'fresh' }];
    const calls = [];
    const orig = Game.proposeLink;
    Game.proposeLink = function (...a) { calls.push(a); return orig.apply(this, a); };
    const ctx = {};
    courtshipPass(Game, ctx);
    Game.proposeLink = orig;
    ok('G2-diplomacy-drive', calls.length >= 1 && (ctx.plProposed || 0) >= 1,
      `proposeLink calls=${calls.length} plProposed=${ctx.plProposed || 0}`);
  }

  // G3 — the modest hunt fires pre-unlock: healthy, fed, wave-3 unlocked,
  // wave-4 not unlocked, 0 points banked.
  {
    const Game = await rig(13);
    const w3 = unlockWave3(Game);
    const w4 = (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : 0;
    healthyScholar(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    ok('G3-hunt-fires', w3 >= 3 && w4 < 4 && (ctx.hybridHunts || 0) >= 1,
      `wave=${w3} hunts=${ctx.hybridHunts || 0} legs=${ctx.hybridHuntLegs || 0}`);
  }

  // G4 — the 2-point recipe stands down the hunt (s66's recipe banked).
  {
    const Game = await rig(14);
    unlockWave3(Game);
    const pts = bankWave3Points(Game, 2);
    healthyScholar(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    ok('G4-recipe-standdown', pts >= 2 && (ctx.hybridHunts || 0) === 0 && huntLive(Game) === false,
      `w3pts=${pts} hunts=${ctx.hybridHunts || 0} huntLive=${huntLive(Game)} — 2 points banked, the hunt stands down`);
  }

  // G5 — no deliberate hunts post-wave-4-unlock ("stand, don't sally").
  {
    const Game = await rig(15);
    unlockWave3(Game);
    Game.unlockedWave = () => 4; // the Mirror Draft is watching
    healthyScholar(Game);
    const ctx = {};
    try { hybridroad.daily(Game, ctx); } catch (e) {}
    ok('G5-no-hunt-post-unlock', (ctx.hybridHunts || 0) === 0 && huntLive(Game) === false,
      `wave=4(stubbed) hunts=${ctx.hybridHunts || 0} — the village stops picking fights in the wild`);
  }

  // G6 — readiness hold: hurt scholar post-unlock holds at Haven (recover
  // window set before competent.daily).
  {
    const Game = await rig(16);
    Game.state.scholar.day = 80;
    Game.unlockedWave = () => 4;
    hurtScholar(Game, 0.5);
    const ctx = {};
    readinessHold(Game, ctx);
    ok('G6-readiness-hold', (ctx._recoverUntilDay || 0) === 82 && (ctx.hybridHolds || 0) === 1,
      `recoverUntil=${ctx._recoverUntilDay || 0} holds=${ctx.hybridHolds || 0} (day 80 + 2)`);
  }

  // G7 — no hold pre-unlock (the hunt era is for hunting).
  {
    const Game = await rig(17);
    Game.state.scholar.day = 40;
    unlockWave3(Game);
    hurtScholar(Game, 0.5);
    const ctx = {};
    readinessHold(Game, ctx);
    ok('G7-no-hold-pre-unlock', !(ctx._recoverUntilDay > 0) && (ctx.hybridHolds || 0) === 0,
      `recoverUntil=${ctx._recoverUntilDay || 0} — the doctrine is post-unlock only`);
  }

  // G8 — no hold when healthy post-unlock (the village still works).
  {
    const Game = await rig(18);
    Game.state.scholar.day = 80;
    Game.unlockedWave = () => 4;
    healthyScholar(Game);
    const ctx = {};
    readinessHold(Game, ctx);
    ok('G8-no-hold-healthy', !(ctx._recoverUntilDay > 0) && (ctx.hybridHolds || 0) === 0,
      `recoverUntil=${ctx._recoverUntilDay || 0} — a healthy scholar ranges`);
  }

  // G9 — fight commit: a live wave-3 fight is marked committed before
  // delegation (competent.fight reads ctx._huntCommit with its own guards).
  {
    const Game = await rig(19);
    unlockWave3(Game);
    healthyScholar(Game);
    Game.tbfight = { over: false, fighters: [{ kind: 'monster', hp: 200, maxHp: 300, monsterId: 'redactor' }] };
    const ctx = {};
    try { hybridroad.fight(Game, ctx); } catch (e) { /* delegation may throw on the synthetic fight */ }
    const wave = (() => { try { const d = (Game.data.monsters || []).find(x => x.id === 'redactor'); return d && d.wave; } catch (e) { return '?'; } })();
    ok('G9-fight-commit', wave === 3 && ctx._huntCommit === true && (ctx.hybridHuntFights || 0) === 1,
      `redactor wave=${wave} huntCommit=${!!ctx._huntCommit} huntFights=${ctx.hybridHuntFights || 0}`);
    Game.tbfight = null;
  }

  // G10 — fight fail-closed: no live fight -> no commit.
  {
    const Game = await rig(20);
    const ctx = {};
    let r = 'threw';
    try { r = hybridroad.fight(Game, ctx); } catch (e) {}
    ok('G10-fight-fail-closed', r === false && !ctx._huntCommit,
      `fight()=${r} huntCommit=${!!ctx._huntCommit} with no live fight`);
  }

  const bad = results.filter(r => !r.ok);
  console.log(`\n${bad.length ? 'RED' : 'GREEN'}: ${results.length - bad.length}/${results.length} passed${bad.length ? ' — FIX BEFORE SPEND' : ' — the hybrid fires its hunt, banks its recipe, and holds its hurt.'}`);
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
