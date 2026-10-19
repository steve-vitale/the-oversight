#!/usr/bin/env node
// scripts/test-fragilityfeast-b.js — PROOF for the FRAGILITYFEAST arm
// (loop B, 2026-10-19, food-economy axis — the named next of
// sim-overdraw4-b / sim-overdrawfloor-b).
//
// THE QUESTION: the fresh-first drawdown lineage proved the rot mechanism
// but was killed on the STARVATION guardrail twice; the autopsy suspects the
// FEAST verb draining fragile pantries TO the floor. This arm isolates the
// feast verb on the standard substrate (leadfeast/belongfeast +
// FEASTSCALE_R13=1, SEATDRIVE=0): the feast may not drain below a 3-day
// floor and may not fire at all on a fragile pantry.
//
// RED PHASE (FRAGFEAST unset; FEASTSCALE_R13=1 — the operational control):
//   R1. gate-off byte-identical: wrapped vs parent, identical seeds, 40d.
//   R2. no holds counted gate-off on a healthy feast fixture (the feast
//       fires normally; the layer is invisible).
//   R3. NAIVE RED (the foil): the native r13 feast FIRES on a raid-fragile
//       fixture — proves the fixture discriminates and the layer's raid
//       reason is what changes behavior.
// GREEN PHASE (FRAGFEAST=1, FEASTSCALE_R13=1):
//   G1. FEAST fires on a healthy overstock pantry (candidacy passes).
//   G2. near-floor (2.5 fresh-days): NO feast, ffFragileHeld counted,
//       reason 'near-floor'.
//   G3. raid in the trailing 7d: NO feast, ffFragileHeld, reason 'raid'.
//   G4. gorge in the trailing 7d: NO feast, ffFragileHeld, reason 'gorge'.
//   G5. hungry day in the trailing 7d: NO feast, ffFragileHeld, 'hunger';
//       the gorge say-text install is verified (engine beat -> tracked day).
//   G6. healthy pantry (steady trail, >= 3, no hunger): feast FIRES —
//       the gate is not a kill switch.
//   G7. 3-day floor holds a deep feast: mocked plan cost inside the old
//       2-day window is held (ffFloorHeld); a normal-cost feast fires.
//   G8. armed determinism (40d x2 bit-identical).
//   G9. candidate-only counting: a fragile pantry on a NON-candidate dusk
//       counts NO hold (the agGateHeld telemetry lesson).
//
// Policy-side only: no src/js changes.
//
// Usage:
//   RED:   FEASTSCALE_R13=1 node scripts/test-fragilityfeast-b.js
//   GREEN: FEASTSCALE_R13=1 FRAGFEAST=1 node scripts/test-fragilityfeast-b.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let FF = null;
try { FF = require('./policies/fragilityfeast'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: fragilityfeast layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const FS = require('./policies/feastscale');

const ARMED = process.env.FRAGFEAST === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
console.log('== fragilityfeast proof — ' + (ARMED ? 'ARMED (FRAGFEAST=1)' : 'RED (gate off)') +
  ' / FEASTSCALE_R13=' + (R13 ? '1' : 'unset') + ' ==');

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

function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

// A healthy overstock world: 6.25 fresh-days, no raids, no hunger.
async function buildFeastWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'fragilityfeast-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 fresh-days
  v.lastRaidDay = 0;
  return { Game, said };
}

// Seed a steady 5-day trail (no hunger) on a fresh setup ctx.
function steadyTrail(ctx, day, fd) {
  ctx._ffTrail = [
    { day: day - 4, fd: fd + 0.1, hungry: false },
    { day: day - 3, fd: fd, hungry: false },
    { day: day - 2, fd: fd, hungry: false },
    { day: day - 1, fd: fd, hungry: false },
  ];
  ctx._ffLastHungry = 0;
}

// Seed the r13 contribution so the candidacy passes (the layer never invents
// contribution — it only gates real candidates).
function seedContribution(Game, ctx) {
  const day = Game.state.scholar.day || 30;
  ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fragilityfeast-red' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await runDays(Game, wrapped, { days, sampleEvery: 1 });
  return hashes;
}

(async () => {
  // ---------- R1: gate-off byte-identical ----------
  console.log('== R1. gate-off byte-identical (wrapped vs parent, 40d) ==');
  if (!ARMED) {
    const hWrap = await runHashes(FF.fragleadfeast, 11, 40);
    const hBase = await runHashes(FS.leadfeast, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: fragleadfeast == leadfeast per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(FF.fragbelongfeast, 22, 40);
    const hBase2 = await runHashes(FS.belongfeast, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: fragbelongfeast == belongfeast per-day hashes',
      same2, `n=${hWrap2.length}/${hWrap2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no holds counted gate-off; the feast fires normally ----------
  console.log('== R2. gate-off: no holds counted on a healthy feast fixture ==');
  if (!ARMED) {
    const { Game } = await buildFeastWorld(42);
    Game.dayPart = 2;
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    pol.upkeep(Game, ctx);
    check('R2 gate-off: feast fired normally (layer invisible)',
      (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('R2 gate-off: no fragile-hold counted', ctx.ffFragileHeld === undefined,
      `ffFragileHeld=${ctx.ffFragileHeld}`);
    check('R2 gate-off: no floor-hold counted', ctx.ffFloorHeld === undefined,
      `ffFloorHeld=${ctx.ffFloorHeld}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: NAIVE RED — the foil ----------
  console.log('== R3. naive RED: the native r13 feast fires on a raid-fragile fixture ==');
  if (!ARMED) {
    const { Game } = await buildFeastWorld(43);
    Game.dayPart = 2;
    Game.state.village.lastRaidDay = 27; // raid 3 days back — FRAGILE by this arm's spec
    const ctx = {};
    const pol = FF.fragleadfeast; // gate OFF: pure delegation to the r13 substrate
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    pol.upkeep(Game, ctx);
    check('R3 foil: native feast fires into the raid-fragile pantry (no gate)',
      (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    console.log('  (the foil proves the fixture discriminates — the raid reason is what the layer adds)');
  } else {
    console.log('  (skipped — armed phase; R3 is a RED assertion)');
  }

  // ---------- G1: FEAST fires on a healthy pantry ----------
  console.log('== G1. feast fires on a healthy overstock pantry ==');
  if (ARMED) {
    const { Game, said } = await buildFeastWorld(42);
    Game.dayPart = 2;
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 feast fired', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 no fragile-hold counted', ctx.ffFragileHeld === undefined,
      `ffFragileHeld=${ctx.ffFragileHeld}`);
    check('G1 no floor-hold counted', ctx.ffFloorHeld === undefined,
      `ffFloorHeld=${ctx.ffFloorHeld}`);
    check('G1 engine feast beat narrated',
      said.some(s => /FEAST/.test(s)), said.length + ' beats');
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: near-floor holds ----------
  console.log('== G2. near-floor (2.5 fresh-days): no feast, hold counted ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(44);
    Game.dayPart = 2;
    Game.state.village.pantry = [freshItem(Game, 'Foraged food', 60000, 3)]; // 2.5 fresh-days
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 2.5);
    seedContribution(Game, ctx);
    check('G2 fixture: 2.5 fresh-days (< 3)', FF.freshDaysOf(Game) < 3,
      'freshDays=' + FF.freshDaysOf(Game).toFixed(2));
    check('G2 fragility reason is near-floor', FF.fragilityOf(Game, ctx) === 'near-floor',
      'reason=' + FF.fragilityOf(Game, ctx));
    pol.upkeep(Game, ctx);
    check('G2 NO feast on the near-floor pantry', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G2 fragile-hold counted', (ctx.ffFragileHeld || 0) >= 1,
      'ffFragileHeld=' + ctx.ffFragileHeld);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: raid-trailing holds ----------
  console.log('== G3. raid in the trailing 7d: no feast, hold counted ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(45);
    Game.dayPart = 2;
    Game.state.village.lastRaidDay = 27; // 3 days back
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    check('G3 fixture: pantry healthy (not near-floor)', FF.freshDaysOf(Game) >= 3,
      'freshDays=' + FF.freshDaysOf(Game).toFixed(2));
    check('G3 fragility reason is raid', FF.fragilityOf(Game, ctx) === 'raid',
      'reason=' + FF.fragilityOf(Game, ctx));
    pol.upkeep(Game, ctx);
    check('G3 NO feast after a recent raid', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G3 fragile-hold counted', (ctx.ffFragileHeld || 0) >= 1,
      'ffFragileHeld=' + ctx.ffFragileHeld);
    // an old raid (10 days back) is NOT fragile
    Game.state.village.lastRaidDay = 20;
    check('G3 old raid (10d back): not fragile', FF.fragilityOf(Game, ctx) === null,
      'reason=' + FF.fragilityOf(Game, ctx));
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: gorge-trailing holds ----------
  console.log('== G4. gorge night in the trailing 7d: no feast, hold counted ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(46);
    Game.dayPart = 2;
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    // the engine's honest gorge beat flows through the layer's say-wrap
    Game.say(`🌙 Night. The lingering hushwolf gorges at the treeline — 1,000 kcal gone from the stores.`);
    check('G4 gorge beat tracked by the layer', (Game.__ffGorgeDays || []).includes(30),
      '__ffGorgeDays=' + JSON.stringify(Game.__ffGorgeDays));
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    check('G4 fragility reason is gorge', FF.fragilityOf(Game, ctx) === 'gorge',
      'reason=' + FF.fragilityOf(Game, ctx));
    pol.upkeep(Game, ctx);
    check('G4 NO feast after a gorge night', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G4 fragile-hold counted', (ctx.ffFragileHeld || 0) >= 1,
      'ffFragileHeld=' + ctx.ffFragileHeld);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: hungry-trailing holds ----------
  console.log('== G5. hungry day in the trailing 7d: no feast, hold counted ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(47);
    Game.dayPart = 2;
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    ctx._ffTrail = [
      { day: 26, fd: 6.2, hungry: false },
      { day: 27, fd: 6.2, hungry: true }, // a hungry day, 3 days back
      { day: 28, fd: 6.2, hungry: false },
      { day: 29, fd: 6.2, hungry: false },
    ];
    ctx._ffLastHungry = 1;
    seedContribution(Game, ctx);
    check('G5 fragility reason is hunger', FF.fragilityOf(Game, ctx) === 'hunger',
      'reason=' + FF.fragilityOf(Game, ctx));
    pol.upkeep(Game, ctx);
    check('G5 NO feast after recent hunger', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G5 fragile-hold counted', (ctx.ffFragileHeld || 0) >= 1,
      'ffFragileHeld=' + ctx.ffFragileHeld);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: the gate is not a kill switch ----------
  console.log('== G6. healthy pantry (steady, >= 3, no hunger): feast fires ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(48);
    Game.dayPart = 2;
    Game.state.village.lastRaidDay = 0;
    const ctx = {};
    const pol = FF.fragbelongfeast; // the belong road too
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    pol.upkeep(Game, ctx);
    check('G6 belong-road feast fires on a sound pantry',
      (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G6 no holds on a sound pantry', ctx.ffFragileHeld === undefined && ctx.ffFloorHeld === undefined,
      `fragile=${ctx.ffFragileHeld} floor=${ctx.ffFloorHeld}`);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: the 3-day floor holds a deep feast ----------
  console.log('== G7. the 3-day floor holds a feast the old 2-day floor would allow ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(49);
    Game.dayPart = 2;
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 6.25);
    seedContribution(Game, ctx);
    const realPlan = Game.feastPlan();
    const floor3 = FF.maxFeastKcal(Game);
    const burn = FF.burnAt(Game);
    const fakeCost = Math.round(floor3 + 20000); // > 3-day allowance, < 2-day allowance
    check('G7 fixture: fake cost inside the old 2-day window',
      fakeCost > floor3 && fakeCost <= (havenPantryKcal(Game) - 2 * burn),
      `cost=${fakeCost} floor3=${Math.round(floor3)} floor2=${Math.round(havenPantryKcal(Game) - 2 * burn)}`);
    Game.feastPlan = function () {
      return Object.assign({}, realPlan, { ok: true, cost: fakeCost, have: fakeCost * 2 });
    };
    pol.upkeep(Game, ctx);
    check('G7 deep feast held at the 3-day floor', (ctx.fsFeasts || 0) === 0,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G7 floor-hold counted (not fragile-hold)', (ctx.ffFloorHeld || 0) >= 1 && ctx.ffFragileHeld === undefined,
      `floor=${ctx.ffFloorHeld} fragile=${ctx.ffFragileHeld}`);
    // and a normal-cost feast on the same pantry fires (the floor is a ceiling, not a ban)
    const ctx2 = {};
    pol.setup(Game, ctx2);
    steadyTrail(ctx2, 30, 6.25);
    seedContribution(Game, ctx2);
    Game.feastPlan = function () { return realPlan; };
    pol.upkeep(Game, ctx2);
    check('G7 normal feast still fires on the healthy pantry', (ctx2.fsFeasts || 0) === 1,
      `fsFeasts=${ctx2.fsFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: armed determinism ----------
  console.log('== G8. armed determinism (40d x2) ==');
  if (ARMED) {
    const a = await runHashes(FF.fragleadfeast, 11, 40);
    const b = await runHashes(FF.fragleadfeast, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G8 armed fragleadfeast bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: candidate-only counting ----------
  console.log('== G9. holds counted on feast candidates only (agGateHeld lesson) ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(50);
    Game.dayPart = 1; // NOT dusk — no feast candidate exists
    Game.state.village.pantry = [freshItem(Game, 'Foraged food', 60000, 3)]; // 2.5 fresh-days — fragile
    const ctx = {};
    const pol = FF.fragleadfeast;
    pol.setup(Game, ctx);
    steadyTrail(ctx, 30, 2.5);
    seedContribution(Game, ctx);
    pol.upkeep(Game, ctx);
    check('G9 non-candidate dusk: NO hold counted on a fragile pantry',
      ctx.ffFragileHeld === undefined && ctx.ffFloorHeld === undefined,
      `fragile=${ctx.ffFragileHeld} floor=${ctx.ffFloorHeld}`);
    // and with no contribution (candidacy fails), no hold either
    const { Game: Game2 } = await buildFeastWorld(51);
    Game2.dayPart = 2;
    Game2.state.village.pantry = [freshItem(Game2, 'Foraged food', 60000, 3)];
    const ctx2 = {};
    pol.setup(Game2, ctx2);
    steadyTrail(ctx2, 30, 2.5);
    // no contribution seeded — the r13 candidacy fails
    pol.upkeep(Game2, ctx2);
    check('G9 no-contribution dusk: NO hold counted on a fragile pantry',
      ctx2.ffFragileHeld === undefined && ctx2.ffFloorHeld === undefined,
      `fragile=${ctx2.ffFragileHeld} floor=${ctx2.ffFloorHeld}`);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
