#!/usr/bin/env node
// scripts/test-feastdoor-20261014.js — PROOF for the FEASTDOOR arm
// (loop B, 2026-10-14, food-economy axis, sim-findings #187).
//
// THE LEVER: a surplus-only feast duty (FEASTDOOR=1, default OFF; requires
// FEASTSCALE_R13=1 — the duty rides the feastscale r13 machinery), wrapping
// leadfeast/belongfeast. The duty fires ONLY when pantry fresh-days > 6
// (strictly) AND the r13 gates clear (reused, never reimplemented: dusk,
// at haven, one feast/day, armed cadence 7d / unarmed 14d shared with the
// r13 allowance via _fsLastFeastDay, contribution >= 1500, affordability
// have >= cost*1.5, fusion-reactor ceiling, plan.ok) AND the siege-gate is
// clear (loop A boundary: no lingerer, no gorge night in trailing 7d via
// the predation instrument, no raid in trailing 7d). The floor is NEVER
// breached: the duty refuses when the engine's honest whole-village feast
// (feastPlan cost) would push fresh-days below 4 — a feast that spends only
// what would otherwise rot cannot starve anyone. #201 lesson: the duty's
// cause line fires only AFTER hostFeast confirms (rep.ok) — never promise
// the feast before the verb. The feastSurgeUsed/sentimentTaught path is
// untouched (the r13 devotion lane marks feastSurgeUsed on real combat use).
// Policy-side only; zero src/js changes.
//
// RED PHASE (FEASTDOOR unset, FEASTSCALE_R13 unset):
//   R1. gate-off byte-identical: doorlead == leadfeast, doorbelong ==
//       belongfeast per-day hashes, 40d x2 seeds.
//   R2. no duty fires gate-off, even on the 6.25 fresh-day fixture.
// GREEN PHASE (FEASTDOOR=1 + FEASTSCALE_R13=1):
//   G1. duty fires on the 6.25d fixture: real pantry draw, engine feast
//       beat fires, duty cause line narrated AFTER the verb confirms
//       (cause line index > beat index), floor >= 4 after.
//   G2. trigger: 5.9 fresh-days holds the duty off (fires ONLY on > 6).
//   G3. floor binds on a small-burn fixture: burn 2400, 6.1d -> spendTarget
//       5040 < plan cost 5200 -> no feast; 6.5d -> spendTarget 6000 ->
//       fires, lands at ~4.3d (>= 4, not below).
//   G4. siege-gate: lingerer / raid-7d / gorge-7d fixtures all hold the
//       duty off (hold counted per cause).
//   G5. contribution gate: <1500 kcal holds off; >=1500 fires.
//   G6. armed determinism: identical fixture twice -> identical outcome.
//   G7. feastSurgeUsed marks: armed prog.feastSurge rides the duty feast
//       into grantFeastBuff; a real combat use marks feastSurgeUsed.
//   G8. r13 requirement: FEASTSCALE_R13 unset mid-run -> duty does not fire
//       even with FEASTDOOR=1 (the duty rides the r13 machinery).
//   G9. no double feast: the duty claims the one-feast/day slot — the r13
//       allowance cannot fire on the same day.
//
// Kill-protocol degradation: if the layer file was deleted post-kill,
// this script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
//
// Usage: node scripts/test-feastdoor-20261014.js
//   RED:   (no env) node scripts/test-feastdoor-20261014.js
//   GREEN: FEASTDOOR=1 FEASTSCALE_R13=1 node scripts/test-feastdoor-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let FD = null;
try { FD = require('./policies/feastdoor'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: feastdoor layer deleted per kill protocol (NO-GO at pilot); proof was RED->GREEN pre-kill — see evidence/2026-10-14/sim-feastdoor-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast, belongfeast } = require('./policies/feastscale');

const ARMED = process.env.FEASTDOOR === '1' && process.env.FEASTSCALE_R13 === '1';
console.log('== feastdoor proof — ' + (ARMED ? 'ARMED (FEASTDOOR=1 + FEASTSCALE_R13=1)' : 'RED (gates off)') + ' ==');

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

// Overstock fixture: fresh-days = fk/burn at an honest burn, dusk,
// at haven, no threats. The r13 contribution bar is armed via tribHist.
async function buildFeastWorld(seed, burn, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'feastdoor-proof' });
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
  const { Game } = await loadGame({ seed, mode: 'feastdoor-red' });
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
    const hWrap = await runHashes(FD.doorlead, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: doorlead == leadfeast per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(FD.doorbelong, 22, 40);
    const hBase2 = await runHashes(belongfeast, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: doorbelong == belongfeast per-day hashes',
      same2, `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no duty fires gate-off ----------
  console.log('== R2. no duty fires gate-off on the 6.25d fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildFeastWorld(42, 24000, 6.25);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 6,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FD.doorlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('R2 no duty feast gate-off', ctx.fdFeasts === undefined,
      `fdFeasts=${ctx.fdFeasts}`);
    check('R2 pantry untouched gate-off', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('R2 no duty cause line gate-off',
      !said.some(s => /ate the mountain tonight/.test(s)));
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: duty fires on the 6.25d fixture ----------
  console.log('== G1. duty fires on the 6.25d fixture (verb first, cause line after) ==');
  if (ARMED) {
    const { Game, said } = await buildFeastWorld(43, 24000, 6.25);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    const pol = FD.doorlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G1 duty feast fired', ctx.fdFeasts === 1 && (ctx.fdFeastKcal || 0) > 0,
      `fdFeasts=${ctx.fdFeasts} spent=${ctx.fdFeastKcal}`);
    check('G1 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    const beatIdx = said.findIndex(s => /🍖 FEAST/.test(s));
    const causeIdx = said.findIndex(s => /ate the mountain tonight/.test(s));
    check('G1 engine feast beat fired', beatIdx >= 0);
    check('G1 duty cause line narrated', causeIdx >= 0,
      said[causeIdx] ? said[causeIdx].slice(0, 140) : '(none)');
    check('G1 cause line AFTER the verb confirms (#201)',
      beatIdx >= 0 && causeIdx > beatIdx,
      `beat@${beatIdx} cause@${causeIdx}`);
    check('G1 floor >= 4 after the feast (never below)',
      freshDaysOf(Game) >= 4, 'freshDays=' + freshDaysOf(Game).toFixed(2));
    check('G1 the duty spent real surplus (drawdown direction)',
      freshDaysOf(Game) < 6.25, 'freshDays=' + freshDaysOf(Game).toFixed(2));
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: trigger is strictly > 6 ----------
  console.log('== G2. trigger: 5.9 fresh-days holds the duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(44, 24000, 5.9);
    check('G2 fixture really is below trigger', freshDaysOf(Game) > 5.5 && freshDaysOf(Game) < 6,
      'freshDays=' + freshDaysOf(Game).toFixed(2));
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FD.doorlead.setup(Game, ctx);
    FD.doorlead.upkeep(Game, ctx);
    check('G2 no duty feast at 5.9d', ctx.fdFeasts === undefined,
      `fdFeasts=${ctx.fdFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: the floor is LIVE (binds on a small-burn village) ----------
  console.log('== G3. floor binds on a small-burn village (spend toward 4, never below) ==');
  if (ARMED) {
    // burn 2000/d, roster-sized feast cost 4800. The floor binds when the
    // honest feast would breach 4d: cost 4800 > spendTarget. At 6.2d the
    // surplus above 4d is 4400 < 4800 -> the floor must hold. At 6.5d the
    // surplus is 5000 > 4800 -> fires, landing at ~4.1d (>= 4, toward 4,
    // never below).
    const a = await buildFeastWorld(45, 2000, 6.2);
    const planA = a.Game.feastPlan();
    const spendA = a.Game.pantryFreshKcal() - 4 * 2000;
    const ctxA = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FD.doorlead.setup(a.Game, ctxA);
    FD.doorlead.upkeep(a.Game, ctxA);
    check('G3 floor holds when the honest feast would breach 4d',
      ctxA.fdFeasts === undefined,
      `cost=${planA.cost} spendTarget=${Math.round(spendA)} fdFeasts=${ctxA.fdFeasts}`);
    const b = await buildFeastWorld(46, 2000, 6.5);
    const ctxB = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FD.doorlead.setup(b.Game, ctxB);
    FD.doorlead.upkeep(b.Game, ctxB);
    const afterB = freshDaysOf(b.Game);
    check('G3 fires when the surplus covers the feast', ctxB.fdFeasts === 1,
      `fdFeasts=${ctxB.fdFeasts}`);
    check('G3 lands toward 4, never below', afterB >= 4 && afterB < 6.5,
      'freshDays=' + afterB.toFixed(2));
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: siege-gate holds ----------
  console.log('== G4. siege-gate holds the duty off ==');
  if (ARMED) {
    // G4a: lingering monster
    {
      const { Game, said } = await buildFeastWorld(47, 24000, 6.25);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FD.doorlead.setup(Game, ctx);
      FD.doorlead.upkeep(Game, ctx);
      check('G4a lingerer holds duty off', ctx.fdFeasts === undefined,
        `fdFeasts=${ctx.fdFeasts}`);
      check('G4a gate-hold counted (linger)', (ctx.fdGateHeld_linger || 0) >= 1,
        `linger=${ctx.fdGateHeld_linger}`);
      check('G4a duty cause line not narrated',
        !said.some(s => /ate the mountain tonight/.test(s)));
    }
    // G4b: raid raised in trailing 7d
    {
      const { Game } = await buildFeastWorld(48, 24000, 6.25);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FD.doorlead.setup(Game, ctx);
      FD.doorlead.upkeep(Game, ctx);
      check('G4b recent raid holds duty off', ctx.fdFeasts === undefined,
        'lastRaidDay=28, day=30');
      check('G4b gate-hold counted (raid)', (ctx.fdGateHeld_raid || 0) >= 1,
        `raid=${ctx.fdGateHeld_raid}`);
    }
    // G4c: gorge night in trailing 7d (predation telemetry)
    {
      const { Game } = await buildFeastWorld(49, 24000, 6.25);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FD.doorlead.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      FD.doorlead.upkeep(Game, ctx);
      check('G4c gorge night holds duty off', ctx.fdFeasts === undefined,
        'gorge day=29, day=30');
      check('G4c gate-hold counted (gorge)', (ctx.fdGateHeld_gorge || 0) >= 1,
        `gorge=${ctx.fdGateHeld_gorge}`);
    }
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: contribution gate ----------
  console.log('== G5. contribution gate: <1500 holds the duty off ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(50, 24000, 6.25);
    const ctx = { _tribHist: [{ day: 29, kcal: 400 }] }; // 400 < 1500
    FD.doorlead.setup(Game, ctx);
    FD.doorlead.upkeep(Game, ctx);
    check('G5 thin contribution holds duty off', ctx.fdFeasts === undefined,
      'contrib=400 < 1500');
    const { Game: Game2 } = await buildFeastWorld(51, 24000, 6.25);
    const ctx2 = { _tribHist: [{ day: 29, kcal: 1500 }] };
    FD.doorlead.setup(Game2, ctx2);
    FD.doorlead.upkeep(Game2, ctx2);
    check('G5 contribution >= 1500 lets the duty fire', ctx2.fdFeasts === 1,
      `fdFeasts=${ctx2.fdFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: armed determinism ----------
  console.log('== G6. armed determinism: identical fixture twice -> identical ==');
  if (ARMED) {
    const run = async (seed) => {
      const { Game } = await buildFeastWorld(seed, 24000, 6.25);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FD.doorlead.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      FD.doorlead.upkeep(Game, ctx);
      return `${ctx.fdFeasts}|${havenPantryKcal(Game) - before}|${freshDaysOf(Game).toFixed(3)}`;
    };
    const a = await run(52), b = await run(52);
    check('G6 identical outcomes', a === b, `${a} vs ${b}`);
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: feastSurgeUsed marks ----------
  console.log('== G7. the duty feast carries the armed surge; combat use marks feastSurgeUsed ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(53, 24000, 6.25);
    // arm the devotion lane directly (the r13 lane's channelDevotion owns
    // arming in live sims; the proof arms it to test the carry chain)
    Game.state.scholar.prog = Game.state.scholar.prog || {};
    Game.state.scholar.prog.feastSurge = 1.5;
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FD.doorlead.setup(Game, ctx);
    FD.doorlead.upkeep(Game, ctx);
    const buff = Game.state.scholar.feastBuff;
    check('G7 duty feast granted the buff (armed surge carried)', !!(buff && !buff.refused),
      `feastBuff=${buff ? 'granted' : 'none'}`);
    check('G7 arming NOT spent by the feast itself', !!Game.state.scholar.prog.feastSurge,
      `feastSurge=${Game.state.scholar.prog.feastSurge}`);
    // real combat use: a strike/ability while feasted and in combat
    const origInCombat = Game.inCombat;
    Game.inCombat = () => true;
    try { Game.noteFeastedCombatUse(); } finally { Game.inCombat = origInCombat; }
    check('G7 feastSurgeUsed marks on real combat use',
      Game.state.scholar.prog.feastSurgeUsed === true,
      `feastSurgeUsed=${Game.state.scholar.prog.feastSurgeUsed}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: the duty rides the r13 machinery ----------
  console.log('== G8. r13 requirement: FEASTSCALE_R13 unset -> no duty ==');
  if (ARMED) {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    try {
      const { Game } = await buildFeastWorld(54, 24000, 6.25);
      const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
      FD.doorlead.setup(Game, ctx);
      FD.doorlead.upkeep(Game, ctx);
      check('G8 duty inert without FEASTSCALE_R13', ctx.fdFeasts === undefined,
        `fdFeasts=${ctx.fdFeasts}`);
    } finally {
      process.env.FEASTSCALE_R13 = saved;
    }
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: no double feast ----------
  console.log('== G9. the duty claims the one-feast/day slot ==');
  if (ARMED) {
    const { Game } = await buildFeastWorld(55, 24000, 6.25);
    const ctx = { _tribHist: [{ day: 29, kcal: 2000 }] };
    FD.doorlead.setup(Game, ctx);
    FD.doorlead.upkeep(Game, ctx); // duty fires, then the r13 allowance runs
    check('G9 exactly one duty feast', ctx.fdFeasts === 1, `fdFeasts=${ctx.fdFeasts}`);
    check('G9 the day-slot is consumed (s.feastDay set)',
      Game.state.scholar.feastDay === 30, `feastDay=${Game.state.scholar.feastDay}`);
    check('G9 the r13 allowance did not double-fire',
      (ctx.fsFeasts || 0) === 0, `fsFeasts=${ctx.fsFeasts || 0}`);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF FAILED: ${fails.length} — ${fails.join('; ')}` : '\nPROOF GREEN: all checks passed.');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
