#!/usr/bin/env node
// scripts/test-trajclose-20261016.js — PROOF for the SIM-TRAJCLOSE-B
// diagnostic (loop B, 2026-10-16, food-economy axis — aidspoil lineage
// closure).
//
// THE INSTRUMENT (policy-side only, scripts/policies/trajclose.js,
// TRAJCLOSE=1, default OFF, browser-safe typeof guard — ZERO src/js
// changes): rebuilds the killed sim-aidspoil driver verb-verbatim (the
// 799k configuration: default least-perishable-first ordering, NO
// spoil-first) as trajLead over leadfeast. Fresh-days > 4 + siege-gate
// clear → ONE verb/day, priority AID (honest tendLink on a thin
// subordinate: sub pantry < 5d of need, untended this week, not mourning)
// > FEAST (hostFeast under the r13 allowance chain via
// allowgate2.feastCandidate + floor cost ≤ fresh − 2×burn). NO tribute
// verb. Floor: never below 2 fresh-days (maxDrawdownKcal = fresh −
// 2×burn). Siege-gate: lingerer / gorge-night-trailing-7d / raid-7d hold
// all verbs off (count holds). Cause lines after CONFIRMED verbs only.
// The aid fires in daily BEFORE the parent's daily; the driver's feast
// fires in upkeep BEFORE the parent's upkeep (s.feastDay blocks the
// allowance after — no double-feast, no displacement).
//
// Control = pristine leadfeast (TRAJCLOSE unset — R1 asserts the wrapper
// is byte-identical to the parent gate-off). Armed = trajLead +
// TRAJCLOSE=1 (+ FEASTSCALE_R13=1 for the feast duty).
//
// RED PHASE (TRAJCLOSE unset):
//   R1. gate-off byte-identical: trajLead == leadfeast per-day hashes,
//       40d x 2 seeds.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture;
//       the parent's own tend discipline still fires.
// ARMED PHASE (TRAJCLOSE=1 + FEASTSCALE_R13=1):
//   A1. aid fires on the overstock fixture via honest tendLink: real aid
//       credit, thin-sub channel, trust gain, cause line AFTER the engine
//       beat, floor respected, one verb/day marked.
//   A2. thin-channel negative: a FAT subordinate (5d+ of need) gets no aid.
//   A3. mourning link gets no aid (grief is not bought off).
//   A4/A5/A6. siege-gate: lingerer / recent-raid / gorge-night-trailing-7d
//       hold the aid off (hold counted); an 8d-old gorge does NOT hold.
//   A7. floor math: maxDrawdownKcal = fresh - 2*burn (unit); aid refused
//       when the floor holds it.
//   A8. DRIVER NEVER PAYS TRIBUTE (negative assertion): an owed
//       belong-side link is untouched by the driver.
//   A9. CONSERVATION: pantry before - after == paid; whole units.
//   A10. one verb/day: a second daily the same day fires nothing new.
//   A11. feast fires on the overstock fixture via honest hostFeast:
//       tcFeasts=1, real pantry draw, engine beat fires, cause line AFTER
//       the beat, floor >= 2 after, one feast/day marked, own cadence
//       marked, shared cadence UNTOUCHED, engine feastDay set.
//   A12. trigger: 3.9 fresh-days holds both verbs off (fires ONLY on > 4).
//   A13. feast floor binds: plan.cost > fresh - 2*burn refuses; cost <=
//       floor fires (small-burn fixture).
//   A14. siege-gate holds the feast off (lingerer/raid/gorge-7d, counted);
//       an 8d-old gorge does NOT hold.
//   A15. no double-feast: s.feastDay === day → the driver stands down.
//   A16. priority aid > feast: upkeep yields the feast when an aid channel
//       exists (tcFeasts undefined); the aid fires in daily (tcAid=1);
//       exactly one verb/day.
//   A17. inert feast without FEASTSCALE_R13 (the duty rides the r13 road);
//       the aid verb still fires.
//   A18. armed determinism: TRAJCLOSE=1 twice → identical hashes.
//   A19. driver feast before parent upkeep: s.feastDay blocks the
//       allowance after — exactly one feast beat today, no displacement.
//
// Kill-protocol degradation: if the layer file was deleted post-measurement,
// this script degrades to INFO-SKIP (exit 0), never MODULE_NOT_FOUND.
//
// Usage:
//   node scripts/test-trajclose-20261016.js                                # RED
//   TRAJCLOSE=1 FEASTSCALE_R13=1 node scripts/test-trajclose-20261016.js    # ARMED
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let TC = null;
try { TC = require('./policies/trajclose'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trajclose driver absent (diagnostic layer deleted post-measurement); status in evidence/2026-10-16/sim-trajclose-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');

const DRIVER = process.env.TRAJCLOSE === '1';
const R13 = process.env.FEASTSCALE_R13 === '1';
const ARMED = DRIVER && R13;
const PHASE = ARMED ? 'ARMED (TRAJCLOSE=1 + FEASTSCALE_R13=1)' : (DRIVER ? 'PARTIAL (TRAJCLOSE=1, r13 off)' : 'RED (gate off)');
console.log('== trajclose proof — ' + PHASE + ' ==');

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

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

function addThinSubLink(Game, opts) {
  opts = opts || {};
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'thinval', name: 'Thinvale', pantryKcal: opts.subPantry != null ? opts.subPantry : 1000,
      population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_thin', primary: 'haven', subordinate: 'thinval',
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: opts.mourningUntil || 0,
  });
  return m.links[m.links.length - 1];
}

function addOwedTributeLink(Game) {
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'bigkeep', name: 'Bigkeep', pantryKcal: 50000, population: 20, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: 'link_owed', primary: 'bigkeep', subordinate: 'haven',
    day: 0, trust: 50, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

async function buildOverstockWorld(seed, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'trajclose-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', opts.pantryKcal || 150000, 3)]; // ~6.3 fresh-days
  v.lastRaidDay = 0;
  if (!opts.noLink) addThinSubLink(Game, opts);
  return { Game, said };
}

// Overstock fixture for the FEAST duty: dusk, at haven, no threats. The
// r13 contribution bar is armed via _tribHist (tribute/tend paid this week).
async function buildFeastWorld(seed, burn, freshDaysTarget, opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed, mode: 'trajclose-proof' });
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
  if (opts.thinLink) addThinSubLink(Game, {});
  return { Game, said, ctx: { _tribHist: [{ day: 29, kcal: 2000 }] } };
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'trajclose-red' });
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
  if (!DRIVER) {
    const hWrap = await runHashes(TC.trajLead, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    check('R1 gate-off: trajLead == leadfeast per-day hashes',
      hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]),
      `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(TC.trajLead, 22, 40);
    const hBase2 = await runHashes(leadfeast, 22, 40);
    check('R1 gate-off: trajLead == leadfeast per-day hashes (seed 22)',
      hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]),
      `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no verbs fire gate-off ----------
  console.log('== R2. no verbs fire gate-off on the overstock fixture ==');
  if (!DRIVER) {
    const { Game, said } = await buildOverstockWorld(42);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    TC.trajLead.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: driver aid did not fire', ctx.tcAid === undefined,
      `tcAid=${ctx.tcAid}`);
    check('R2 gate-off: no driver cause line said',
      !said.some(s => /not the rot/.test(s)), said.length + ' beats');
    check('R2 gate-off: parent tend discipline intact (base weekly tend fires)',
      link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- A1: aid fires on the overstock fixture ----------
  console.log('== A1. aid fires via honest tendLink on the thin subordinate ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    const fdBefore = freshDaysOf(Game);
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    TC.trajLead.daily(Game, ctx);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('A1 aid verb fired (tcAid=1, real kcal)', ctx.tcAid === 1 && (ctx.tcAidKcal || 0) > 0,
      `tcAid=${ctx.tcAid} kcal=${ctx.tcAidKcal}`);
    check('A1 aid amount is the engine verb\'s ~1500', (ctx.tcAidKcal || 0) >= 1500 && (ctx.tcAidKcal || 0) <= 2500,
      'tcAidKcal=' + ctx.tcAidKcal);
    check('A1 sub pantry credited (subaid channel, real food)',
      subAfter === subBefore + (ctx.tcAidKcal || 0), `${subBefore} -> ${subAfter}`);
    check('A1 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('A1 haven pantry lighter by exactly the aid', pantryBefore - havenPantryKcal(Game) === (ctx.tcAidKcal || 0),
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('A1 cause line narrated after the confirmed verb',
      said.some(s => /not the rot/.test(s)));
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('A1 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
    check('A1 floor respected (fresh-days still >= 2 after)',
      freshDaysOf(Game) >= 2, `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A1 one verb/day marked', ctx._tcFired === 30, '_tcFired=' + ctx._tcFired);
    check('A1 first-aid day recorded', ctx._tcFirstAidDay === 30, '_tcFirstAidDay=' + ctx._tcFirstAidDay);
  } else {
    console.log('  (skipped — RED phase; A1 is an ARMED assertion)');
  }

  // ---------- A2: fat subordinate gets no aid ----------
  console.log('== A2. thin-channel negative: fat subordinate gets no aid ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(43, { subPantry: 500000 }); // 25d of need: FAT
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.daily(Game, ctx);
    check('A2 fat subordinate gets no aid', ctx.tcAid === undefined,
      'subPantry=500000 (25d of need)');
  } else {
    console.log('  (skipped — RED phase; A2 is an ARMED assertion)');
  }

  // ---------- A3: mourning link gets no aid ----------
  console.log('== A3. mourning link gets no aid ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(44, { mourningUntil: 40 }); // mourning until day 40
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.daily(Game, ctx);
    check('A3 mourning link gets no aid', ctx.tcAid === undefined,
      'mourningUntil=40, day=30');
  } else {
    console.log('  (skipped — RED phase; A3 is an ARMED assertion)');
  }

  // ---------- A4/A5/A6: siege-gate holds the aid ----------
  console.log('== A4/A5/A6. siege-gate holds the aid off ==');
  if (ARMED) {
    {
      const { Game, said } = await buildOverstockWorld(45);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.daily(Game, ctx);
      check('A4 lingerer holds the aid off', ctx.tcAid === undefined && !said.some(s => /not the rot/.test(s)),
        `tcAid=${ctx.tcAid}`);
      check('A4 gate-hold counted', (ctx.tcGateHeld || 0) >= 1, 'tcGateHeld=' + ctx.tcGateHeld);
      check('A4 hold-day recorded', (ctx._tcHoldDays || []).indexOf(30) >= 0,
        '_tcHoldDays=' + JSON.stringify(ctx._tcHoldDays));
    }
    {
      const { Game } = await buildOverstockWorld(46);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.daily(Game, ctx);
      check('A5 recent raid holds the aid off', ctx.tcAid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(47);
      Game.__tcGorgeDays = [24]; // 6d trailing — inside the 7d window
      const ctx = {};
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.daily(Game, ctx);
      check('A6 gorge-night-trailing-7d holds the aid off', ctx.tcAid === undefined,
        'gorge day=24, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(48);
      Game.__tcGorgeDays = [22]; // 8d trailing — outside the 7d window
      const ctx = {};
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.daily(Game, ctx);
      check('A6b old gorge night (8d) does NOT hold', ctx.tcAid === 1,
        `tcAid=${ctx.tcAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; A4/A5/A6 are ARMED assertions)');
  }

  // ---------- A7: floor math (2-day) ----------
  console.log('== A7. floor math: maxDrawdownKcal = fresh - 2*burn (unit) ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(49);
    const v = Game.state.village;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)]; // 2.09 days at 23928.5 burn
    const md = TC.maxDrawdownKcal(Game);
    // The original G5 pinned this exact number: fresh − 2×burn = 2143.
    check('A7 maxDraw = fresh - 2*burn (unit: 2143)', Math.abs(md - 2143) < 100,
      'maxDraw=' + Math.round(md));
    // Floor-refusal needs a small burn: burn 550/d, pantry 2500 (4.55d):
    // trigger open (4.55 > 4) but maxDraw = 1400 < 1500 → the floor holds.
    // (kcalEach=500 forces whole-unit pantry sizes — 2500/3000 are exact.)
    {
      const w = await buildOverstockWorld(491);
      w.Game.state.village.burnHistory = [550, 550, 550, 550, 550, 550, 550];
      w.Game.state.village.pantry = [freshItem(w.Game, 'Foraged food', 2500, 3)];
      const mdW = TC.maxDrawdownKcal(w.Game);
      check('A7 small-burn fixture: trigger open, floor binds',
        freshDaysOf(w.Game) > 4 && mdW < 1500,
        `freshDays=${freshDaysOf(w.Game).toFixed(2)} maxDraw=${Math.round(mdW)}`);
      const ctx = {};
      TC.trajLead.setup(w.Game, ctx);
      TC.trajLead.daily(w.Game, ctx);
      check('A7 aid refused when the floor holds it', ctx.tcAid === undefined,
        `tcAid=${ctx.tcAid}`);
    }
    {
      const w = await buildOverstockWorld(492);
      w.Game.state.village.burnHistory = [550, 550, 550, 550, 550, 550, 550];
      w.Game.state.village.pantry = [freshItem(w.Game, 'Foraged food', 3000, 3)]; // 5.45d
      const mdW = TC.maxDrawdownKcal(w.Game);
      check('A7 small-burn fixture: floor allows at 5.45d', mdW >= 1500,
        'maxDraw=' + Math.round(mdW));
      const ctx = {};
      TC.trajLead.setup(w.Game, ctx);
      TC.trajLead.daily(w.Game, ctx);
      check('A7 aid fires when the floor allows it', ctx.tcAid === 1,
        `tcAid=${ctx.tcAid}`);
    }
    v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 days
    const md2 = TC.maxDrawdownKcal(Game);
    check('A7 aid affordable on real overstock (maxDraw >= 1500)', md2 >= 1500,
      'maxDraw=' + Math.round(md2));
  } else {
    console.log('  (skipped — RED phase; A7 is an ARMED assertion)');
  }

  // ---------- A8: driver never pays tribute ----------
  console.log('== A8. driver never pays tribute (negative assertion) ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(50);
    addOwedTributeLink(Game);
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.daily(Game, ctx);
    const owed = Game.mshipState().links.find(l => l.id === 'link_owed');
    check('A8 no tribute counter from the driver', ctx.tcTribute === undefined,
      `tcTribute=${ctx.tcTribute}`);
    check('A8 owed link\'s tribute rhythm untouched by the driver',
      owed.tributePaidWeek === -1, 'tributePaidWeek=' + owed.tributePaidWeek);
  } else {
    console.log('  (skipped — RED phase; A8 is an ARMED assertion)');
  }

  // ---------- A9: conservation + whole-unit honesty ----------
  console.log('== A9. conservation: kcal in = kcal out, whole units ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(51);
    const before = havenPantryKcal(Game);
    const unitsBefore = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.daily(Game, ctx);
    const after = havenPantryKcal(Game);
    const unitsAfter = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const paid = ctx.tcAidKcal || 0;
    check('A9 pantry lighter by exactly paid', before - after === paid,
      `${before} -> ${after}, paid=${paid}`);
    check('A9 whole units moved (units delta * 500 == paid)',
      (unitsBefore - unitsAfter) * 500 === paid,
      `units ${unitsBefore} -> ${unitsAfter}`);
    check('A9 no emptied stacks linger', !Game.state.village.pantry.some(i => (i.units || 0) <= 0),
      'emptied stacks swept');
  } else {
    console.log('  (skipped — RED phase; A9 is an ARMED assertion)');
  }

  // ---------- A10: one verb/day ----------
  console.log('== A10. one verb/day ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(52);
    const ctx = {};
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.daily(Game, ctx);
    check('A10 first daily fires', ctx.tcAid === 1, `tcAid=${ctx.tcAid}`);
    TC.trajLead.daily(Game, ctx); // same day, same week: nothing new
    check('A10 second daily same day fires nothing new', ctx.tcAid === 1,
      `tcAid=${ctx.tcAid}`);
  } else {
    console.log('  (skipped — RED phase; A10 is an ARMED assertion)');
  }

  // ---------- A11: feast fires on the overstock fixture ----------
  console.log('== A11. feast fires via honest hostFeast on the overstock fixture ==');
  if (ARMED) {
    const { Game, said, ctx } = await buildFeastWorld(43, 24000, 6.25);
    const fdBefore = freshDaysOf(Game);
    TC.trajLead.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    TC.trajLead.upkeep(Game, ctx);
    check('A11 driver feast fired (tcFeasts=1, real kcal)',
      ctx.tcFeasts === 1 && (ctx.tcFeastKcal || 0) > 0,
      `tcFeasts=${ctx.tcFeasts} kcal=${ctx.tcFeastKcal}`);
    check('A11 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    const beatIx = said.findIndex(s => /🍖 FEAST/.test(s));
    const causeIx = said.findIndex(s => /eats itself/.test(s));
    check('A11 engine feast beat fired', beatIx >= 0);
    check('A11 driver cause line narrated', causeIx >= 0,
      said[causeIx] ? said[causeIx].slice(0, 120) : '(none)');
    check('A11 cause line AFTER the verb confirms',
      beatIx >= 0 && causeIx > beatIx, `beat@${beatIx} cause@${causeIx}`);
    check('A11 floor respected (fresh-days >= 2 after)',
      freshDaysOf(Game) >= 2, `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A11 drawdown direction (fresh-days fell)', freshDaysOf(Game) < fdBefore,
      `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A11 one feast/day marked', ctx._tcFired === 30, '_tcFired=' + ctx._tcFired);
    check('A11 own cadence marked (_tcLastFeastDay=30)', ctx._tcLastFeastDay === 30,
      '_tcLastFeastDay=' + ctx._tcLastFeastDay);
    check('A11 shared cadence UNTOUCHED (no displacement)',
      ctx._fsLastFeastDay === undefined, '_fsLastFeastDay=' + ctx._fsLastFeastDay);
    check('A11 engine feastDay set (allowance stands down after)',
      (Game.state.scholar || {}).feastDay === 30,
      'feastDay=' + (Game.state.scholar || {}).feastDay);
    check('A11 first-feast day recorded', ctx._tcFirstFeastDay === 30,
      '_tcFirstFeastDay=' + ctx._tcFirstFeastDay);
    check('A11 feast event recorded', (ctx._tcFeastEvents || []).length === 1,
      JSON.stringify(ctx._tcFeastEvents));
  } else {
    console.log('  (skipped — RED phase; A11 is an ARMED assertion)');
  }

  // ---------- A12: trigger is strictly > 4 ----------
  console.log('== A12. trigger: 3.9 fresh-days holds both verbs off ==');
  if (ARMED) {
    {
      const { Game } = await buildOverstockWorld(44, { pantryKcal: Math.round(3.9 * 24000) });
      check('A12 aid fixture really is below trigger', freshDaysOf(Game) > 3.5 && freshDaysOf(Game) <= 4,
        'freshDays=' + freshDaysOf(Game).toFixed(2));
      const ctx = {};
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.daily(Game, ctx);
      check('A12 no driver aid at 3.9d', ctx.tcAid === undefined,
        `tcAid=${ctx.tcAid}`);
    }
    {
      const w = await buildFeastWorld(441, 24000, 3.9);
      check('A12 feast fixture really is below trigger', freshDaysOf(w.Game) > 3.5 && freshDaysOf(w.Game) <= 4,
        'freshDays=' + freshDaysOf(w.Game).toFixed(2));
      TC.trajLead.setup(w.Game, w.ctx);
      TC.trajLead.upkeep(w.Game, w.ctx);
      check('A12 no driver feast at 3.9d', w.ctx.tcFeasts === undefined,
        `tcFeasts=${w.ctx.tcFeasts}`);
    }
  } else {
    console.log('  (skipped — RED phase; A12 is an ARMED assertion)');
  }

  // ---------- A13: feast floor binds (2-day) ----------
  console.log('== A13. feast floor binds: cost > fresh - 2*burn refuses ==');
  if (ARMED) {
    {
      const w = await buildFeastWorld(451, 2000, 4.2);
      const plan = w.Game.feastPlan();
      const mdA = TC.maxDrawdownKcal(w.Game);
      check('A13 fixture: cost exceeds the 2-day allowance at 4.2d',
        plan && plan.ok && plan.cost > mdA,
        `cost=${plan && plan.cost} maxDraw=${Math.round(mdA)}`);
      TC.trajLead.setup(w.Game, w.ctx);
      TC.trajLead.upkeep(w.Game, w.ctx);
      check('A13 feast refused when the floor holds it', w.ctx.tcFeasts === undefined,
        `tcFeasts=${w.ctx.tcFeasts}`);
    }
    {
      const w = await buildFeastWorld(452, 2000, 5.0);
      const plan = w.Game.feastPlan();
      const mdB = TC.maxDrawdownKcal(w.Game);
      check('A13 fixture: cost fits the 2-day allowance at 5.0d',
        plan && plan.ok && plan.cost <= mdB,
        `cost=${plan && plan.cost} maxDraw=${Math.round(mdB)}`);
      TC.trajLead.setup(w.Game, w.ctx);
      TC.trajLead.upkeep(w.Game, w.ctx);
      check('A13 feast fires when the floor allows it', w.ctx.tcFeasts === 1,
        `tcFeasts=${w.ctx.tcFeasts}`);
    }
  } else {
    console.log('  (skipped — RED phase; A13 is an ARMED assertion)');
  }

  // ---------- A14: siege-gate holds the feast ----------
  console.log('== A14. siege-gate holds the feast off ==');
  if (ARMED) {
    {
      const { Game, said, ctx } = await buildFeastWorld(46, 24000, 6.25);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.upkeep(Game, ctx);
      check('A14 lingerer holds the feast off', ctx.tcFeasts === undefined,
        `tcFeasts=${ctx.tcFeasts}`);
      check('A14 gate-hold counted', (ctx.tcGateHeld || 0) >= 1, 'tcGateHeld=' + ctx.tcGateHeld);
      check('A14 no feast cause line said', !said.some(s => /eats itself/.test(s)));
    }
    {
      const { Game, ctx } = await buildFeastWorld(47, 24000, 6.25);
      Game.state.village.lastRaidDay = 28; // today is 30
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.upkeep(Game, ctx);
      check('A14b recent raid holds the feast off', ctx.tcFeasts === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game, ctx } = await buildFeastWorld(48, 24000, 6.25);
      Game.__tcGorgeDays = [24]; // 6d trailing — inside the 7d window
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.upkeep(Game, ctx);
      check('A14c gorge-night-trailing-7d holds the feast off', ctx.tcFeasts === undefined,
        'gorge day=24, day=30');
    }
    {
      const { Game, ctx } = await buildFeastWorld(49, 24000, 6.25);
      Game.__tcGorgeDays = [22]; // 8d trailing — outside the 7d window
      TC.trajLead.setup(Game, ctx);
      TC.trajLead.upkeep(Game, ctx);
      check('A14d old gorge night (8d) does NOT hold', ctx.tcFeasts === 1,
        `tcFeasts=${ctx.tcFeasts}`);
    }
  } else {
    console.log('  (skipped — RED phase; A14 is an ARMED assertion)');
  }

  // ---------- A15: no double-feast ----------
  console.log('== A15. no double-feast when a feast already fired today ==');
  if (ARMED) {
    const { Game, ctx } = await buildFeastWorld(50, 24000, 6.25);
    Game.state.scholar.feastDay = 30; // a feast (allowance or otherwise) already fired today
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.upkeep(Game, ctx);
    check('A15 driver stands down when a feast already fired today',
      ctx.tcFeasts === undefined, `tcFeasts=${ctx.tcFeasts}`);
  } else {
    console.log('  (skipped — RED phase; A15 is an ARMED assertion)');
  }

  // ---------- A16: priority aid > feast ----------
  console.log('== A16. priority aid > feast: upkeep yields, daily fires, one verb/day ==');
  if (ARMED) {
    const { Game, said, ctx } = await buildFeastWorld(53, 24000, 6.25, { thinLink: true });
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.upkeep(Game, ctx); // dusk FIRST: the feast must yield to the aid channel
    check('A16 dusk upkeep yields the feast when an aid channel exists', ctx.tcFeasts === undefined,
      `tcFeasts=${ctx.tcFeasts}`);
    TC.trajLead.daily(Game, ctx); // then the daily: the aid fires
    check('A16 the aid fires in daily', ctx.tcAid === 1, `tcAid=${ctx.tcAid}`);
    check('A16 exactly one verb/day', ctx.tcAid === 1 && ctx.tcFeasts === undefined,
      `tcAid=${ctx.tcAid} tcFeasts=${ctx.tcFeasts}`);
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('A16 aid cause line follows the engine beat', tendIx >= 0 && causeIx > tendIx,
      `tend@${tendIx} cause@${causeIx}`);
  } else {
    console.log('  (skipped — RED phase; A16 is an ARMED assertion)');
  }

  // ---------- A17: inert feast without FEASTSCALE_R13 ----------
  console.log('== A17. inert feast without FEASTSCALE_R13 (aid unaffected) ==');
  if (DRIVER && !R13) {
    // This phase only runs when TRAJCLOSE=1 is set WITHOUT FEASTSCALE_R13.
    const { Game, ctx } = await buildFeastWorld(54, 24000, 6.25);
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.upkeep(Game, ctx);
    check('A17 driver feast inert without the r13 road', ctx.tcFeasts === undefined,
      `tcFeasts=${ctx.tcFeasts}`);
    const w2 = await buildOverstockWorld(55);
    const ctx2 = {};
    TC.trajLead.setup(w2.Game, ctx2);
    TC.trajLead.daily(w2.Game, ctx2);
    check('A17 aid verb still fires without r13', ctx2.tcAid === 1,
      `tcAid=${ctx2.tcAid}`);
  } else {
    console.log('  (skipped — run with TRAJCLOSE=1 and FEASTSCALE_R13 unset for A17)');
  }

  // ---------- A18: armed determinism ----------
  console.log('== A18. armed determinism ==');
  if (ARMED) {
    const h1 = await runHashes(TC.trajLead, 11, 40);
    const h2 = await runHashes(TC.trajLead, 11, 40);
    check('A18 trajLead armed bit-identical across runs',
      h1.length === h2.length && h1.every((h, i) => h === h2[i]), `n=${h1.length}`);
  } else {
    console.log('  (skipped — RED phase; A18 is an ARMED assertion)');
  }

  // ---------- A19: driver feast before parent upkeep, no double-feast ----------
  console.log('== A19. driver feast first; s.feastDay blocks the allowance after ==');
  if (ARMED) {
    const { Game, said, ctx } = await buildFeastWorld(56, 24000, 6.25);
    TC.trajLead.setup(Game, ctx);
    TC.trajLead.upkeep(Game, ctx); // driver feast FIRST, then parent upkeep
    const feastBeats = said.filter(s => /🍖 FEAST/.test(s)).length;
    check('A19 driver feast fired', ctx.tcFeasts === 1, `tcFeasts=${ctx.tcFeasts}`);
    check('A19 exactly one engine feast beat today (no double-feast)',
      feastBeats === 1, `beats=${feastBeats}`);
    check('A19 shared cadence untouched by the driver',
      ctx._fsLastFeastDay === undefined, '_fsLastFeastDay=' + ctx._fsLastFeastDay);
  } else {
    console.log('  (skipped — RED phase; A19 is an ARMED assertion)');
  }

  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nPROOF: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
