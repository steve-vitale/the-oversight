#!/usr/bin/env node
// scripts/test-dutyalone-20261014.js — PROOF for the DUTYALONE arm
// (loop B, 2026-10-14, food-economy axis, sim-findings #187).
//
// THE LEVER: a surplus-only feast duty (DUTYALONE=1, default OFF; requires
// FEASTSCALE_R13=1 — the duty rides the r13 machinery), wrapping
// leadfeast/belongfeast. The duty fires ONLY when the r13 allowance's own
// gate says NO today (allowanceWouldFire evaluated BEFORE the allowance
// runs), on its OWN cadence (ctx._dlLastFeastDay), and NEVER marks the
// shared ctx._fsLastFeastDay — zero displacement of the allowance's
// openings by construction. Fire condition: allowance gate no AND pantry
// fresh-days > 4 (surplus), spending only the above-4d floor (floor never
// breached). All r13 honesty gates kept (dusk, haven, one feast/day,
// contribution >= 1500, affordability have >= cost*1.5, fusion ceiling,
// plan.ok). Cause line only AFTER hostFeast confirms (#201). Policy-side
// only; zero src/js changes.
//
// REAL RED (gates off):
//   R1. gate-off byte-identical: dutylead == leadfeast, dutybelong ==
//       belongfeast per-day hashes, 40d x2 seeds.
//   R2. no duty fires gate-off, even on a surplus fixture.
//   R3. NAIVE RED: an inline naive duty (fires on surplus without deferring
//       to the allowance, marks the SHARED _fsLastFeastDay, runs BEFORE
//       the allowance) on an allowance-would-fire fixture — proves the
//       displacement mechanism the design removes: the naive duty fires on
//       the allowance's day, marks the shared cadence, and the allowance's
//       opening is GONE (fsFeasts stays 0).
// GREEN (DUTYALONE=1 + FEASTSCALE_R13=1):
//   G1. duty fires on a surplus fixture when the allowance's gate says no:
//       real pantry draw, engine feast beat, duty cause line AFTER the verb
//       (beatIdx < causeIdx), floor >= 4 after, _dlLastFeastDay marked,
//       _fsLastFeastDay NOT marked.
//   G2. fresh-days 3.9 holds the duty off (fires ONLY on > 4).
//   G3. floor binds on a small-burn fixture: 6.2d -> spendTarget < cost ->
//       no fire; 6.5d -> fires, lands >= 4, never below.
//   G4. ZERO DISPLACEMENT: on an allowance-would-fire fixture the duty does
//       NOT fire, the allowance DOES (fsFeasts advances), _dlLastFeastDay
//       unmarked, _fsLastFeastDay marked BY THE ALLOWANCE.
//   G5. mirror exactness: allowanceWouldFire's prediction == scaleFeast's
//       actual fire/no-fire on 7 fixtures (gate clears; cadence blocked;
//       contribution thin; not dusk; not at haven; feastDay set; plan not
//       ok). Any drift between the predicate and scaleFeast fails loudly.
//   G6. contribution gate: <1500 holds the duty off.
//   G7. armed determinism: identical fixture twice -> identical outcome.
//   G8. inert without FEASTSCALE_R13 (DUTYALONE=1 alone -> no fire).
//   G9. one feast/day: feastDay already set -> duty off.
//
// Kill-protocol degradation: if the layer file was deleted post-kill,
// this script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
//
// Usage: node scripts/test-dutyalone-20261014.js
//   RED:   (no env) node scripts/test-dutyalone-20261014.js
//   GREEN: DUTYALONE=1 FEASTSCALE_R13=1 node scripts/test-dutyalone-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let DL = null;
try { DL = require('./policies/dutyalone'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: dutyalone layer deleted per kill protocol (NO-GO at pilot); proof was RED->GREEN pre-kill — see evidence/2026-10-14/sim-dutyalone-r15.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast, scaleFeast } = require('./policies/feastscale');
const { recentGives } = require('./policies/competent');
const { recentTribute } = require('./policies/feastscale');

const ARMED = process.env.DUTYALONE === '1' && process.env.FEASTSCALE_R13 === '1';
console.log('== dutyalone proof — ' + (ARMED ? 'ARMED (DUTYALONE=1 + FEASTSCALE_R13=1)' : 'RED (gates off)') + ' ==');

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

// Overstock fixture: fresh-days = fk/burn at an honest burn, dusk,
// at haven. The r13 contribution bar is armed via _tribHist.
async function buildFeastWorld(seed, burn, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'dutyalone-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(freshDaysTarget * burn), 3)];
  v.lastRaidDay = 0;
  return { Game, said };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'dutyalone-red' });
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

// NAIVE duty (RED phase only): the killed feastdoor mechanism — fires on
// surplus without deferring to the allowance, marks the SHARED
// _fsLastFeastDay, runs BEFORE the allowance.
function naiveDutyUpkeep(Game, ctx) {
  try {
    if (Game.dayPart !== 2) return;
    const s = Game.state.scholar || {}, day = s.day || 0;
    if (s.feastDay === day) return;
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const armed = !!((s.prog || {}).feastSurge);
    const cadence = armed ? 7 : 14;
    if (ctx._fsLastFeastDay && (day - ctx._fsLastFeastDay) < cadence) return;
    const contrib = recentGives(Game, ctx, 7) + recentTribute(Game, ctx, 7);
    if (contrib < 1500) return;
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) {}
    if (!plan || !plan.ok) return;
    if (plan.have < plan.cost * 1.5) return;
    let fd = 0;
    try { fd = Game.pantryFreshDays(); } catch (e) {}
    if (!(fd > 4)) return;
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) {}
    if (rep && rep.ok) {
      ctx._fsLastFeastDay = day; // SHARED cadence — the displacement
      ctx.naiveFeasts = (ctx.naiveFeasts || 0) + 1;
    }
  } catch (e) {}
}

(async () => {
  // ---------- R1: gate-off byte-identical ----------
  console.log('== R1. gate-off byte-identical (wrapped vs parent, 40d) ==');
  if (!ARMED) {
    const hWrap = await runHashes(DL.dutylead, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: dutylead == leadfeast per-day hashes', same,
      `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(DL.dutybelong, 22, 40);
    const hBase2 = await runHashes(belongfeast, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: dutybelong == belongfeast per-day hashes', same2,
      `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no duty fires gate-off ----------
  console.log('== R2. no duty fires gate-off on a surplus fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildFeastWorld(42, 24000, 5.5);
    check('R2 fixture really is surplus', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = DL.dutylead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 no duty feast gate-off', ctx.dlFeasts === undefined,
      `dlFeasts=${ctx.dlFeasts}`);
    check('R2 pantry untouched gate-off', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 no duty cause line gate-off',
      !said.some(s => /duty fire burns/.test(s)));
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: NAIVE RED — the displacement mechanism ----------
  console.log('== R3. NAIVE RED: an undeferring duty displaces the allowance ==');
  if (!ARMED) {
    // fixture: the allowance's gate CLEARS (cadence open, contrib 2000,
    // surplus 5.5d) — the allowance's opening.
    const { Game } = await buildFeastWorld(60, 24000, 5.5);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    leadfeast.setup(Game, ctx);
    // the naive duty runs BEFORE the allowance (feastdoor's ordering)
    naiveDutyUpkeep(Game, ctx);
    const naiveFired = (ctx.naiveFeasts || 0) === 1;
    check('R3 naive duty fires on the allowance\'s day', naiveFired,
      `naiveFeasts=${ctx.naiveFeasts}`);
    check('R3 naive duty marks the SHARED cadence', ctx._fsLastFeastDay === 30,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
    leadfeast.upkeep(Game, ctx); // now the allowance runs
    check('R3 the allowance\'s opening is GONE (displacement)',
      (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts || 0}`);
    // and the allowance's own cadence is now poisoned for 7/14 days
    check('R3 cadence poisoned: allowance would not fire tomorrow either',
      (30 + 1 - (ctx._fsLastFeastDay || 0)) < 7);
  } else {
    console.log('  (skipped — armed phase; R3 is a RED assertion)');
  }

  // ---------- G1: duty fires on surplus when the allowance's gate says no ----------
  console.log('== G1. duty fires on surplus when the allowance\'s gate says no ==');
  if (ARMED) {
    const { Game, said } = await buildFeastWorld(43, 24000, 5.5);
    // the allowance's gate says NO: its cadence is blocked (pre-set to
    // day 23, 7 days back — inside the 14d unarmed window) — but the
    // duty's own cadence is open. The pre-set 23 is a sentinel: if the
    // duty ever marked the shared cadence it would read 30 after.
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }], _fsLastFeastDay: 23 };
    const pol = DL.dutylead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 duty feast fired', ctx.dlFeasts === 1 && (ctx.dlFeastKcal || 0) > 0,
      `dlFeasts=${ctx.dlFeasts} spent=${ctx.dlFeastKcal}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    const beatIdx = said.findIndex(s => /🍖 FEAST/.test(s));
    const causeIdx = said.findIndex(s => /duty fire burns/.test(s));
    check('G1 engine feast beat fired', beatIdx >= 0);
    check('G1 duty cause line narrated', causeIdx >= 0,
      said[causeIdx] ? said[causeIdx].slice(0, 160) : '(none)');
    check('G1 cause line AFTER the verb confirms (#201)',
      beatIdx >= 0 && causeIdx > beatIdx, `beat@${beatIdx} cause@${causeIdx}`);
    check('G1 floor >= 4 after the feast (never below)',
      freshDaysOf(Game) >= 4, 'freshDays=' + freshDaysOf(Game).toFixed(2));
    check('G1 the duty spent real surplus (drawdown direction)',
      freshDaysOf(Game) < 5.5, 'freshDays=' + freshDaysOf(Game).toFixed(2));
    check('G1 own cadence marked', ctx._dlLastFeastDay === 30,
      `_dlLastFeastDay=${ctx._dlLastFeastDay}`);
    check('G1 SHARED cadence NOT marked by the duty (sentinel 23 intact)',
      ctx._fsLastFeastDay === 23,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: trigger is strictly > 4 ----------
  console.log('== G2. trigger: 3.9 fresh-days holds the duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(44, 24000, 3.9);
    check('G2 fixture really is below trigger', freshDaysOf(Game) > 3.5 && freshDaysOf(Game) <= 4,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    DL.dutylead.setup(Game, ctx);
    DL.dutylead.upkeep(Game, ctx);
    check('G2 no duty feast at 3.9d', ctx.dlFeasts === undefined,
      `dlFeasts=${ctx.dlFeasts} surplusNo=${ctx.dlSurplusNo}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: the floor is LIVE ----------
  console.log('== G3. floor binds on a small-burn village ==');
  if (ARMED) {
    // burn 2000/d, roster-sized feast cost ~4800. At 6.2d the above-4d
    // surplus is 4400 < 4800 -> the floor holds. At 6.5d the surplus is
    // 5000 >= 4800 -> fires, landing at ~4.1d (>= 4, toward 4, never below).
    const a = await buildFeastWorld(45, 2000, 6.2);
    const planA = a.Game.feastPlan();
    const spendA = a.Game.pantryFreshKcal() - 4 * 2000;
    // the allowance's gate says NO (its cadence blocked) so the duty is
    // the only candidate — the floor must hold it off
    const ctxA = { _tribHist: [{ day: 29, kcal: 2000 }], _fsLastFeastDay: 23 };
    DL.dutylead.setup(a.Game, ctxA);
    DL.dutylead.upkeep(a.Game, ctxA);
    check('G3 floor holds when the honest feast would breach 4d',
      ctxA.dlFeasts === undefined && (ctxA.dlFloorNo || 0) === 1,
      `cost=${planA.cost} spendTarget=${Math.round(spendA)} floorNo=${ctxA.dlFloorNo}`);
    const b = await buildFeastWorld(46, 2000, 6.5);
    const ctxB = { _tribHist: [{ day: 29, kcal: 2000 }], _fsLastFeastDay: 23 };
    DL.dutylead.setup(b.Game, ctxB);
    DL.dutylead.upkeep(b.Game, ctxB);
    const afterB = freshDaysOf(b.Game);
    check('G3 fires when the surplus covers the feast', ctxB.dlFeasts === 1,
      `dlFeasts=${ctxB.dlFeasts}`);
    check('G3 lands toward 4, never below', afterB >= 4 && afterB < 6.5,
      'freshDays=' + afterB.toFixed(2));
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: ZERO DISPLACEMENT ----------
  console.log('== G4. zero displacement: allowance\'s day stays the allowance\'s ==');
  if (ARMED) {
    // fixture: the allowance's gate CLEARS (cadence open, contrib 2000,
    // surplus 5.5d) — the allowance's opening, like R3.
    const { Game } = await buildFeastWorld(61, 24000, 5.5);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    DL.dutylead.setup(Game, ctx);
    DL.dutylead.upkeep(Game, ctx);
    check('G4 the allowance fired (its opening kept)', (ctx.fsFeasts || 0) === 1,
      `fsFeasts=${ctx.fsFeasts}`);
    check('G4 the duty did NOT fire on the allowance\'s day', ctx.dlFeasts === undefined,
      `dlFeasts=${ctx.dlFeasts} defer=${ctx.dlDefer}`);
    check('G4 duty deferred counted', (ctx.dlDefer || 0) === 1, `dlDefer=${ctx.dlDefer}`);
    check('G4 own cadence unmarked', ctx._dlLastFeastDay === undefined,
      `_dlLastFeastDay=${ctx._dlLastFeastDay}`);
    check('G4 shared cadence marked BY THE ALLOWANCE', ctx._fsLastFeastDay === 30,
      `_fsLastFeastDay=${ctx._fsLastFeastDay}`);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: mirror exactness ----------
  console.log('== G5. mirror exactness: predicate == scaleFeast\'s actual gate ==');
  if (ARMED) {
    const cases = [
      { name: 'gate clears', seed: 70, mod: null, expect: true },
      { name: 'cadence blocked', seed: 71, mod: (G, ctx) => { ctx._fsLastFeastDay = 30; }, expect: false },
      { name: 'contribution thin', seed: 72, mod: (G, ctx) => { ctx._tribHist = [{ day: 29, kcal: 400 }]; }, expect: false },
      { name: 'not dusk', seed: 73, mod: (G, ctx) => { G.dayPart = 0; }, expect: false },
      { name: 'not at haven', seed: 74, mod: (G, ctx) => { G.playerAtHaven = () => false; }, expect: false },
      { name: 'feastDay set', seed: 75, mod: (G, ctx) => { G.state.scholar.feastDay = 30; }, expect: false },
      { name: 'plan not ok (empty pantry)', seed: 76, mod: (G, ctx) => { G.state.village.pantry = []; }, expect: false },
    ];
    for (const c of cases) {
      const { Game } = await buildFeastWorld(c.seed, 24000, 5.5);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      if (c.mod) c.mod(Game, ctx);
      const predicted = DL.allowanceWouldFire(Game, ctx);
      const ctx2 = { _tribHist: (ctx._tribHist || []).slice(), _fsLastFeastDay: ctx._fsLastFeastDay };
      scaleFeast(Game, ctx2);
      const actual = (ctx2.fsFeasts || 0) === 1;
      check(`G5 [${c.name}] predicate=${predicted} actual=${actual} (expect ${c.expect})`,
        predicted === c.expect && actual === c.expect,
        predicted !== actual ? 'MIRROR DRIFT' : '');
    }
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: contribution gate ----------
  console.log('== G6. contribution gate: <1500 holds the duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(50, 24000, 5.5);
    const ctx = { _tribHist: [{ day: 29, kcal: 400 }] }; // 400 < 1500
    DL.dutylead.setup(Game, ctx);
    DL.dutylead.upkeep(Game, ctx);
    check('G6 thin contribution holds duty off', ctx.dlFeasts === undefined,
      `held=${ctx.dlHeld}`);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: armed determinism ----------
  console.log('== G7. armed determinism: identical fixture twice -> identical ==');
  if (ARMED) {
    const run = async (seed) => {
      const { Game } = await buildFeastWorld(seed, 24000, 5.5);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }], _fsLastFeastDay: 30 };
      DL.dutylead.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      DL.dutylead.upkeep(Game, ctx);
      return `${ctx.dlFeasts}|${havenPantryKcal(Game) - before}|${freshDaysOf(Game).toFixed(3)}|${ctx._dlLastFeastDay}|${ctx._fsLastFeastDay}`;
    };
    const a = await run(52), b = await run(52);
    check('G7 identical outcomes', a === b, `${a} vs ${b}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: the duty rides the r13 machinery ----------
  console.log('== G8. r13 requirement: FEASTSCALE_R13 unset -> no duty ==');
  if (ARMED) {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    try {
      const { Game } = await buildFeastWorld(54, 24000, 5.5);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      DL.dutylead.setup(Game, ctx);
      DL.dutylead.upkeep(Game, ctx);
      check('G8 duty inert without FEASTSCALE_R13', ctx.dlFeasts === undefined,
        `dlFeasts=${ctx.dlFeasts}`);
    } finally {
      process.env.FEASTSCALE_R13 = saved;
    }
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: one feast/day ----------
  console.log('== G9. the day-slot is sacred: feastDay set -> duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(55, 24000, 5.5);
    Game.state.scholar.feastDay = 30; // someone feasted already today
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    DL.dutylead.setup(Game, ctx);
    DL.dutylead.upkeep(Game, ctx);
    check('G9 duty holds when the day-slot is taken', ctx.dlFeasts === undefined,
      `dlFeasts=${ctx.dlFeasts}`);
    check('G9 predicate agrees (allowance would not fire either)',
      DL.allowanceWouldFire(Game, ctx) === false);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF FAILED: ${fails.length} — ${fails.join('; ')}` : '\nPROOF GREEN: all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
