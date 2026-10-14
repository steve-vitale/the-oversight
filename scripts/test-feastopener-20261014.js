#!/usr/bin/env node
// scripts/test-feastopener-20261014.js — PROOF for the FEASTOPENER arm
// (loop B, ARM 2, 2026-10-14, food-economy axis, sim-findings #187).
//
// THE LEVER: a feast-FORWARDING policy layer (FEASTOPENER=1, default OFF;
// requires FEASTSCALE_R13=1 — the duty rides the feastscale r13 machinery)
// wrapping leadfeast/belongfeast. When pantry fresh-days > 4 (the landed
// prodthrottle's overproduction signal) AND the r13 gates clear (reused:
// dusk, at haven, one feast/day, contribution >= 1500, affordability
// 1.5x, fusion ceiling, plan.ok) AND the siege-gate is clear (loop A
// boundary: no lingerer, no gorge night in trailing 7d, no raid in
// trailing 7d), the duty throws a MAJOR village feast as the drawdown
// verb. Duty cadence: 3d (the rot clock, not the r13 allowance's 7d/14d —
// documented design call). Fresh floor: never below 2 fresh-days.
// Policy-side only; zero src/js changes.
//
// RED PHASE (FEASTOPENER unset, FEASTSCALE_R13 unset):
//   R1. gate-off byte-identical: openlead == leadcourt, openbelong ==
//       belongseek per-day hashes, 40d x2 seeds.
//   R2. no duty fires gate-off, even on an overstock fixture.
// GREEN PHASE (FEASTOPENER=1 + FEASTSCALE_R13=1):
//   G1. duty fires on the overstock fixture: real pantry draw, cause
//       line narrated, fresh-days floor respected.
//   G2. siege-gate: a lingering monster holds the duty off.
//   G3. raid gate: lastRaidDay in the trailing 7d holds the duty off.
//   G4. gorge gate: a gorge night in the trailing 7d holds the duty off.
//   G5. contribution gate: <1500 kcal recent contribution holds off.
//   G6. floor math: the floor gate is LIVE (binds on a synthetic
//       absurd-cost plan) and passes on the honest fixture.
//   G7. duty cadence: fires day 30, not day 31/32, fires again day 33+
//       (3d rot-clock cadence, not the r13 allowance's 7d).
//   G8. armed determinism: identical fixture twice -> identical outcome.
//
// Kill-protocol degradation: if the layer file was deleted post-kill,
// this script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
//
// Usage: node scripts/test-feastopener-20261014.js
//   RED:   (no env) node scripts/test-feastopener-20261014.js
//   GREEN: FEASTOPENER=1 FEASTSCALE_R13=1 node scripts/test-feastopener-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let FO = null;
try { FO = require('./policies/feastopener'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: feastopener layer deleted per kill protocol (NO-GO at pilot); proof was RED->GREEN pre-kill — see evidence/2026-10-14/sim-feastopener-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const ARMED = process.env.FEASTOPENER === '1' && process.env.FEASTSCALE_R13 === '1';
console.log('== feastopener proof — ' + (ARMED ? 'ARMED (FEASTOPENER=1 + FEASTSCALE_R13=1)' : 'RED (gates off)') + ' ==');

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

// fresh fixture item: 500-kcal units, spoilDay = day + daysLeft
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

// Overstock fixture: 6.25 fresh-days at an honest 24k burn, dusk,
// at haven, no threats. The r13 contribution bar is armed via tribHist.
async function buildFeastWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'feastopener-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 fresh-days
  v.lastRaidDay = 0;
  return { Game, said };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feastopener-red' });
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
    const hWrap = await runHashes(FO.openlead, 11, 40);
    const hBase = await runHashes(leadcourt, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: openlead == leadcourt per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(FO.openbelong, 22, 40);
    const hBase2 = await runHashes(belongseek, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: openbelong == belongseek per-day hashes',
      same2, `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no duty fires gate-off ----------
  console.log('== R2. no duty fires gate-off on the overstock fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildFeastWorld(42);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FO.openlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 no duty feast gate-off', ctx.foFeasts === undefined,
      `foFeasts=${ctx.foFeasts}`);
    check('R2 pantry untouched gate-off', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 no cause line gate-off',
      !said.some(s => /eat the mountain tonight/.test(s)));
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: duty fires ----------
  console.log('== G1. duty fires on the overstock fixture ==');
  if (ARMED) {
    const { Game, said } = await buildFeastWorld(43);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FO.openlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 duty feast fired', ctx.foFeasts === 1 && (ctx.foFeastKcal || 0) > 0,
      `foFeasts=${ctx.foFeasts} spent=${ctx.foFeastKcal}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 feast cause line narrated',
      said.some(s => /eat the mountain tonight/.test(s)),
      said.filter(s => /mountain/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G1 engine feast beat fired',
      said.some(s => /🍖 FEAST/.test(s)));
    check('G1 floor respected (fresh-days still >= 2 after)',
      freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2/G3/G4: siege-gate holds ----------
  console.log('== G2/G3/G4. siege-gate holds the duty off ==');
  if (ARMED) {
    // G2: lingering monster
    {
      const { Game, said } = await buildFeastWorld(44);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FO.openlead.setup(Game, ctx);
      FO.openlead.upkeep(Game, ctx);
      check('G2 lingerer holds duty off', ctx.foFeasts === undefined,
        `foFeasts=${ctx.foFeasts}`);
      check('G2 gate-hold counted', (ctx.foGateHeld || 0) >= 1 && (ctx.foGateHeld_linger || 0) >= 1,
        `foGateHeld=${ctx.foGateHeld} linger=${ctx.foGateHeld_linger}`);
      // the r13 ALLOWANCE (separate pre-existing layer, no siege gate of
      // its own) may still fire — the assertion is that the DUTY held:
      // no duty feast counted, no duty cause line narrated.
      check('G2 duty cause line not narrated',
        !said.some(s => /eat the mountain tonight/.test(s)));
    }
    // G3: raid raised in trailing 7d
    {
      const { Game } = await buildFeastWorld(45);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FO.openlead.setup(Game, ctx);
      FO.openlead.upkeep(Game, ctx);
      check('G3 recent raid holds duty off', ctx.foFeasts === undefined,
        'lastRaidDay=28, day=30');
      check('G3 gate-hold counted (raid)', (ctx.foGateHeld_raid || 0) >= 1,
        `raid=${ctx.foGateHeld_raid}`);
    }
    // G4: gorge night in trailing 7d (predation-lib telemetry)
    {
      const { Game } = await buildFeastWorld(46);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FO.openlead.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      FO.openlead.upkeep(Game, ctx);
      check('G4 gorge night holds duty off', ctx.foFeasts === undefined,
        'gorge day=29, day=30');
      check('G4 gate-hold counted (gorge)', (ctx.foGateHeld_gorge || 0) >= 1,
        `gorge=${ctx.foGateHeld_gorge}`);
    }
  } else {
    console.log('  (skipped — RED phase; G2/G3/G4 are GREEN assertions)');
  }

  // ---------- G5: contribution gate ----------
  console.log('== G5. contribution gate: <1500 holds the duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(47);
    const ctx = { _tribHist: [{ day: 29, kcal: 400 }] }; // 400 < 1500
    FO.openlead.setup(Game, ctx);
    FO.openlead.upkeep(Game, ctx);
    check('G5 thin contribution holds duty off', ctx.foFeasts === undefined,
      'contrib=400 < 1500');
    // and the counter-case: 1500+ fires (already proven in G1; pin the rule)
    const { Game: Game2 } = await buildFeastWorld(47);
    const ctx2 = { _tribHist: [{ day: 29, kcal: 1500 }] };
    FO.openlead.setup(Game2, ctx2);
    FO.openlead.upkeep(Game2, ctx2);
    check('G5 contribution >= 1500 lets the duty fire', ctx2.foFeasts === 1,
      `foFeasts=${ctx2.foFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: floor math ----------
  console.log('== G6. floor gate is LIVE (binds on absurd cost), passes honest ==');
  if (ARMED) {
    // synthetic: stub feastPlan to an absurd cost — the floor must hold.
    const { Game } = await buildFeastWorld(48);
    const realPlan = Game.feastPlan.bind(Game);
    Game.feastPlan = function () { const p = realPlan(); p.cost = 200000; return p; };
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FO.openlead.setup(Game, ctx);
    FO.openlead.upkeep(Game, ctx);
    check('G6 floor binds on absurd cost (no feast)', ctx.foFeasts === undefined,
      'cost=200000 on 150k pantry');
    // honest fixture: floor passes (proven in G1; pin the math directly)
    const { Game: Game2 } = await buildFeastWorld(48);
    const fk = Game2.pantryFreshKcal();
    const burn = FO.dailyBurnKcal(Game2);
    const plan = Game2.feastPlan();
    const after = (fk - plan.cost) / Math.max(1, burn);
    check('G6 floor math honest on fixture', after >= 2,
      `fk=${Math.round(fk)} cost=${plan.cost} burn=${Math.round(burn)} after=${after.toFixed(2)}d`);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: duty cadence ----------
  console.log('== G7. duty cadence: 3d rot-clock (fires d30, not d31/32, again d33+) ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(49);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }, { day: 30, kcal: 2000 }, { day: 31, kcal: 2000 }, { day: 32, kcal: 2000 }] };
    FO.openlead.setup(Game, ctx);
    FO.openlead.upkeep(Game, ctx); // day 30
    check('G7 fires day 30', ctx.foFeasts === 1, `foFeasts=${ctx.foFeasts}`);
    Game.state.scholar.day = 31;
    FO.openlead.upkeep(Game, ctx); // day 31
    check('G7 holds day 31', ctx.foFeasts === 1, `foFeasts=${ctx.foFeasts}`);
    Game.state.scholar.day = 32;
    FO.openlead.upkeep(Game, ctx); // day 32
    check('G7 holds day 32', ctx.foFeasts === 1, `foFeasts=${ctx.foFeasts}`);
    Game.state.scholar.day = 33;
    // re-stock the fixture so the feast still has something to draw
    Game.state.village.pantry = [freshItem(Game, 'Foraged food', 150000, 3)];
    FO.openlead.upkeep(Game, ctx); // day 33
    check('G7 fires again day 33 (3d cadence)', ctx.foFeasts === 2, `foFeasts=${ctx.foFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: armed determinism ----------
  console.log('== G8. armed determinism: identical fixture twice -> identical ==');
  if (ARMED) {
    const run = async (seed) => {
      const { Game } = await buildFeastWorld(seed);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FO.openlead.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      FO.openlead.upkeep(Game, ctx);
      return `${ctx.foFeasts}|${havenPantryKcal(Game) - before}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const a = await run(50), b = await run(50);
    check('G8 identical outcomes', a === b, `${a} vs ${b}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF FAILED: ${fails.length} — ${fails.join('; ')}` : '\nPROOF GREEN: all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
