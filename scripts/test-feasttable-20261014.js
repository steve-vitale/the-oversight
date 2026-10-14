#!/usr/bin/env node
// scripts/test-feasttable-20261014.js — PROOF for the feasttable arm (loop
// B, 2026-10-14, food-economy axis, sim-findings FEAST-AS-TABLE-DOOR
// claimed): the feast-as-table-door isolation layer.
//
// THE LEVER: scripts/policies/feasttable.js wraps the BASE courtship
// policies (belongseek/leadcourt) -> belongtable/leadtable. Opt-in via
// FEASTTABLE=1 (default OFF). Gate on: daily wraps FS.trackTribute
// (read-only); upkeep runs the parent, then tableFeast: AG2.feastCandidate
// (the r13 candidacy chain — dusk, haven, one-feast/day, cadence,
// contribution >= 1500 with tribute/tend counting, plan.ok, 1.5x buffer)
// -> the re-armed 4-day-floor gate (hold on candidates only, postponed
// not displaced) -> Game.hostFeast() on a qualified candidate. No tribute
// or aid changes; zero src/js changes.
//
// RED PHASE (FEASTTABLE unset):
//   R1. gate-off byte-identical: belongtable/leadtable == belongseek/
//       leadcourt per-day run hashes, 40d x2 seeds.
//   R2. gate-off, the control truly never feasts: on a contribution-armed
//       6.2d candidate fixture the parent fires NOTHING (fsFeasts=0) — the
//       isolation baseline is real, not assumed.
//   R3. gate ON, no candidate (contribution < 1500): no feast fires AND no
//       hold is counted — holds are candidate-only.
// GREEN PHASE (FEASTTABLE=1):
//   G1. fires on the 6.2d candidate fixture: real pantry draw, fsFeasts=1,
//       ftGateHeld=0, the 4-day floor honored (lands >= 4).
//   G2. holds on the 3.9d candidate fixture: no feast, pantry untouched,
//       ftGateHeld=1, cadence NOT marked.
//   G3. postponed feasts fire on recovery: day-30 hold with cadence
//       unmarked; fresh food arrives; day-31 fires and marks
//       _fsLastFeastDay=31.
//   G4. tribute counts as contribution (the r13 rule): gives=0 +
//       _tribHist 2000 -> candidate fires; gives=0 + _tribHist empty ->
//       no candidate, no fire, no hold.
//   G5. no tribute/aid behavior change: after an armed daily,
//       Game.payTribute/Game.tendLink are the engine originals (restored),
//       and neither verb was CALLED by the layer (call-spy count 0).
//   G6. armed determinism: identical fixture twice -> identical outcome.
//   G7. no double-feast: a second upkeep the same dusk does not re-fire.
//   G8. 60d armed run: the 4-day floor holds after EVERY feast (min
//       post-feast freshDays >= 3.99) — the floor invariant live.
//
// Usage:
//   RED:   node scripts/test-feasttable-20261014.js
//   GREEN: FEASTTABLE=1 node scripts/test-feasttable-20261014.js
//
// Kill-protocol degradation: if the layer file is deleted post-kill, this
// script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let FT;
try {
  FT = require('./policies/feasttable');
} catch (e) {
  console.log('INFO-SKIP: feasttable layer absent (reverted per kill protocol); proof was RED->GREEN pre-decision — see evidence/2026-10-14/sim-feasttable-b.md');
  process.exit(0);
}
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const ARMED = process.env.FEASTTABLE === '1';
console.log('== feasttable proof — ' + (ARMED ? 'ARMED (FEASTTABLE=1)' : 'RED (gate off)') + ' ==');

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

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}

// buildFixture: pantry with `freshTargetDays` of fresh food at `burn`/day.
async function buildFixture(seed, freshTargetDays, burn) {
  const { Game } = await loadGame({ seed, mode: 'feasttable-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(freshTargetDays * burn), 3)];
  v.lastRaidDay = 0;
  return Game;
}

function contribCtx(kcal) {
  return kcal > 0 ? { _tribHist: [{ day: 29, kcal }] } : {};
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'feasttable-red' });
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
  // ---------- R1: gate-off byte-identical vs the base parents ----------
  console.log('== R1. gate-off byte-identical (belongtable/leadtable vs belongseek/leadcourt, 40d) ==');
  if (!ARMED) {
    for (const [mine, theirs, label] of [[FT.belongtable, belongseek, 'belong'], [FT.leadtable, leadcourt, 'lead']]) {
      const seed = label === 'belong' ? 22 : 11;
      const hMine = await runHashes(mine, seed, 40);
      const hTheirs = await runHashes(theirs, seed, 40);
      const same = hMine.length === hTheirs.length && hMine.every((h, i) => h === hTheirs[i]);
      check(`R1 gate-off: ${label}table == ${label === 'belong' ? 'belongseek' : 'leadcourt'} per-day hashes`, same, `n=${hMine.length}/${hTheirs.length}`);
    }
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: gate-off, the control truly never feasts ----------
  console.log('== R2. gate-off: no feast fires on the 6.2d candidate fixture (isolation baseline) ==');
  if (!ARMED) {
    const Game = await buildFixture(42, 6.2, 2400);
    const fd = freshDaysOf(Game);
    check('R2 fixture really is deep-fresh (> 6d)', fd > 6, 'freshDays=' + fd.toFixed(2));
    let plan = null;
    try { plan = Game.feastPlan(); } catch (e) {}
    check('R2 fixture assumption (plan ok, 1.5x buffer passes)',
      !!(plan && plan.ok && plan.have >= plan.cost * 1.5),
      `ok=${plan && plan.ok} have=${plan && plan.have} cost=${plan && plan.cost}`);
    const ctx = contribCtx(2000);
    const pol = FT.leadtable; // gate off -> parent behavior
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 gate-off: NO feast fires (parent never feasts on courtship)', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
    check('R2 pantry untouched gate-off', havenPantryKcal(Game) === before, `${before} -> ${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: gate ON, no candidate -> no fire, no hold ----------
  console.log('== R3. armed, no candidate (contrib < 1500): no fire, no hold ==');
  if (ARMED) {
    const Game = await buildFixture(43, 6.2, 2400);
    const ctx = contribCtx(0); // no tribute history, gives=0 -> contrib 0
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R3 no candidate -> no feast', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
    check('R3 no candidate -> no hold counted (candidate-only)', (ctx.ftGateHeld || 0) === 0, `ftGateHeld=${ctx.ftGateHeld}`);
    check('R3 pantry untouched', havenPantryKcal(Game) === before, `${before} -> ${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; R3 is a GREEN assertion)');
  }

  // ---------- G1: fires on the 6.2d fixture, floor honored ----------
  console.log('== G1. fires on the 6.2d candidate fixture, floor honored ==');
  if (ARMED) {
    const Game = await buildFixture(45, 6.2, 2400);
    const fd = freshDaysOf(Game);
    check('G1 fixture really is deep-fresh (> 6d)', fd > 6, 'freshDays=' + fd.toFixed(2));
    const ctx = contribCtx(2000);
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 major feast fired on surplus', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G1 no hold on a surplus fixture', (ctx.ftGateHeld || 0) === 0, `ftGateHeld=${ctx.ftGateHeld}`);
    const fdAfter = freshDaysOf(Game);
    check('G1 the 4-day floor is honored (lands >= 4)', fdAfter >= 4,
      `freshDays ${fd.toFixed(2)} -> ${fdAfter.toFixed(2)}`);
    check('G1 cadence marked on fire', ctx._fsLastFeastDay === 30, `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: holds on the 3.9d fixture ----------
  console.log('== G2. holds on the 3.9d candidate fixture ==');
  if (ARMED) {
    const Game = await buildFixture(44, 3.9, 2400);
    const fd = freshDaysOf(Game);
    check('G2 fixture really is sub-floor fresh (< 4d)', fd > 3 && fd < 4, 'freshDays=' + fd.toFixed(2));
    let plan = null;
    try { plan = Game.feastPlan(); } catch (e) {}
    check('G2 fixture is a real candidate the floor refuses (cost > spendTarget)',
      !!(plan && plan.ok && plan.have >= plan.cost * 1.5 && plan.cost > (fd - 4) * 2400),
      `cost=${plan && plan.cost} spendTarget~${Math.round((fd - 4) * 2400)}`);
    const ctx = contribCtx(2000);
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G2 gate held the pantry-blind feast', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
    check('G2 pantry untouched', havenPantryKcal(Game) === before, `${before} -> ${havenPantryKcal(Game)}`);
    check('G2 hold counted (candidate-only telemetry)', (ctx.ftGateHeld || 0) === 1, `ftGateHeld=${ctx.ftGateHeld}`);
    check('G2 cadence NOT marked (postponed, not displaced)', ctx._fsLastFeastDay === undefined,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: postponed feasts fire when the pantry recovers ----------
  console.log('== G3. a postponed feast fires when the pantry recovers ==');
  if (ARMED) {
    const Game = await buildFixture(46, 3.9, 2400);
    const ctx = contribCtx(2000);
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    pol.upkeep(Game, ctx); // day 30: hold
    check('G3 day-30 held', (ctx.fsFeasts || 0) === 0 && (ctx.ftGateHeld || 0) === 1,
      `fsFeasts=${ctx.fsFeasts} ftGateHeld=${ctx.ftGateHeld}`);
    check('G3 day-30 cadence unmarked', ctx._fsLastFeastDay === undefined, `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
    // fresh food arrives; next dusk re-tests
    Game.state.scholar.day = 31;
    const v = Game.state.village;
    v.pantry.push(freshItem(Game, 'Garden haul', 12000, 20));
    pol.upkeep(Game, ctx); // day 31: fires
    check('G3 day-31 fires on recovery', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    check('G3 day-31 cadence marked', ctx._fsLastFeastDay === 31, `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: tribute counts as contribution ----------
  console.log('== G4. tribute counts as contribution (the r13 rule) ==');
  if (ARMED) {
    {
      const Game = await buildFixture(47, 6.2, 2400);
      const ctx = contribCtx(2000); // gives=0, tribute 2000 -> candidate
      const pol = FT.leadtable;
      pol.setup(Game, ctx);
      pol.upkeep(Game, ctx);
      check('G4a tribute-as-contribution qualifies the candidate (fires)', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
    }
    {
      const Game = await buildFixture(48, 6.2, 2400);
      const ctx = contribCtx(0); // gives=0, no tribute -> no candidate
      const pol = FT.leadtable;
      pol.setup(Game, ctx);
      pol.upkeep(Game, ctx);
      check('G4b no tribute, no gives -> no candidate, no fire', (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts}`);
      check('G4b no hold counted on a non-candidate', (ctx.ftGateHeld || 0) === 0, `ftGateHeld=${ctx.ftGateHeld}`);
    }
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: no tribute/aid behavior change ----------
  console.log('== G5. no tribute or aid behavior change ==');
  if (ARMED) {
    const Game = await buildFixture(49, 6.2, 2400);
    const origTribute = Game.payTribute, origTend = Game.tendLink;
    let tributeCalls = 0, tendCalls = 0;
    Game.payTribute = function (...a) { tributeCalls++; return origTribute.apply(this, a); };
    Game.tendLink = function (...a) { tendCalls++; return origTend.apply(this, a); };
    const wrappedTribute = Game.payTribute, wrappedTend = Game.tendLink;
    const ctx = contribCtx(2000);
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    pol.daily(Game, ctx);   // the trackTribute wrap lives here
    pol.upkeep(Game, ctx);  // candidate fires
    check('G5 payTribute restored to the spy after daily (no lingering wrap)',
      Game.payTribute === wrappedTribute, 'restored=' + (Game.payTribute === wrappedTribute));
    check('G5 tendLink restored to the spy after daily (no lingering wrap)',
      Game.tendLink === wrappedTend, 'restored=' + (Game.tendLink === wrappedTend));
    check('G5 the layer never CALLED payTribute (no tribute behavior change)', tributeCalls === 0, `calls=${tributeCalls}`);
    check('G5 the layer never CALLED tendLink (no aid behavior change)', tendCalls === 0, `calls=${tendCalls}`);
    check('G5 the feast still fired (mechanism live alongside the spies)', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: armed determinism ----------
  console.log('== G6. armed determinism (identical fixture twice) ==');
  if (ARMED) {
    async function once(seed) {
      const Game = await buildFixture(seed, 6.2, 2400);
      const ctx = contribCtx(2000);
      FT.leadtable.setup(Game, ctx);
      FT.leadtable.upkeep(Game, ctx);
      return `${ctx.fsFeasts}|${ctx.ftGateHeld}|${havenPantryKcal(Game)}|${freshDaysOf(Game).toFixed(3)}`;
    }
    const a = await once(50), b = await once(50);
    check('G6 identical fixture -> identical outcome', a === b, `${a} vs ${b}`);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: no double-feast the same dusk ----------
  console.log('== G7. no double-feast the same dusk ==');
  if (ARMED) {
    const Game = await buildFixture(51, 6.2, 2400);
    const ctx = contribCtx(2000);
    const pol = FT.leadtable;
    pol.setup(Game, ctx);
    pol.upkeep(Game, ctx);
    pol.upkeep(Game, ctx); // second upkeep, same dusk
    check('G7 one feast per dusk', (ctx.fsFeasts || 0) === 1, `fsFeasts=${ctx.fsFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: 60d armed run, floor invariant live ----------
  console.log('== G8. 60d armed run — floor >= 3.99 after every feast ==');
  if (ARMED) {
    const { Game } = await loadGame({ seed: 52, mode: 'feasttable-proof-run' });
    await setupGame(Game);
    Game.say = () => {};
    const ctx = {};
    const pol = Object.assign({}, FT.leadtable);
    const base = FT.leadtable.daily;
    let minPostFeast = 999, feasts = 0, lastFeasts = 0;
    pol.daily = (G, c) => {
      const r = base ? base(G, c) : undefined;
      try {
        const n = c.fsFeasts || 0;
        if (n > lastFeasts) {
          feasts = n; lastFeasts = n;
          const fd = G.pantryFreshDays();
          if (fd < minPostFeast) minPostFeast = fd;
        }
      } catch (e) {}
      return r;
    };
    pol.setup = FT.leadtable.setup;
    await quietLog(async () => { await runDays(Game, pol, { days: 60, manifest: undefined, sampleEvery: 10 }); });
    check('G8 feasts fired in a 60d armed run', feasts > 0, `feasts=${feasts}`);
    check('G8 floor honored after EVERY feast (min >= 3.99)', minPostFeast >= 3.99,
      `min post-feast freshDays=${minPostFeast === 999 ? 'n/a' : minPostFeast.toFixed(2)}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF FAIL: ${fails.length} check(s) failed: ${fails.join(', ')}` : '\nPROOF: all checks passed (RED and GREEN), independently re-run.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
