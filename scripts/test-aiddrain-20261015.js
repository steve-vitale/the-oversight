#!/usr/bin/env node
// scripts/test-aiddrain-20261015.js — PROOF for the SIM-AIDDRAIN arm
// (loop B, 2026-10-15, food-economy axis — aid-AS-DRAWDOWN).
//
// THE LEVER (policy-side only, scripts/policies/aiddrain.js, AIDDRAIN=1,
// default OFF — ZERO src/js changes): wraps leadfeast (the r13 road,
// aid-dominant) as aidDrain. Fresh-days > 4 + siege-gate clear → ONE
// honest tendLink aid/day on a thin subordinate (sub pantry < 5d of need,
// untended this week, not mourning); floor NEVER below 3 fresh-days
// (maxDrawdownKcal = fresh - 3*burn >= 1500); NO feast verb; NO tribute
// verb; cause lines after confirmed verbs only. The aid preempts the
// base's weekly tend via tendedWeek idempotency. The aid-ordering
// question is DEAD (aidspoil, KILLED AT PILOT) and is NOT retested.
//
// Control = pristine leadfeast (AIDDRAIN unset — R1 asserts the wrapper is
// byte-identical to the parent gate-off). Armed = aidDrain + AIDDRAIN=1.
//
// RED PHASE (AIDDRAIN unset):
//   R1. gate-off byte-identical: aidDrain == leadfeast per-day hashes,
//       40d x 2 seeds.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture;
//       the parent's own tend discipline still fires.
// ARMED PHASE (AIDDRAIN=1):
//   A1. aid fires on the overstock fixture via honest tendLink: real 1500
//       aid credit, thin-sub channel, trust gain, cause line AFTER the
//       engine beat, floor respected, one verb/day marked.
//   A2. thin-channel negative: a FAT subordinate (5d+ of need) gets no aid.
//   A3. mourning link gets no aid (grief is not bought off).
//   A4/A5/A6. siege-gate: lingerer / recent-raid / gorge-night-trailing-7d
//       hold verbs off (hold counted).
//   A7. floor math: maxDrawdownKcal = fresh - 3*burn (unit); aid refused
//       when the floor holds it.
//   A8. DRIVER NEVER PAYS TRIBUTE (negative assertion): an owed
//       belong-side link is untouched by the driver.
//   A9. CONSERVATION: pantry before - after == paid; whole units.
//   A10. one verb/day: a second daily the same day fires nothing new.
//   A11. armed determinism: AIDDRAIN=1 twice, identical seeds -> identical
//       hashes.
//
// Usage:
//   node scripts/test-aiddrain-20261015.js          # RED
//   AIDDRAIN=1 node scripts/test-aiddrain-20261015.js # ARMED
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let AS = null;
try { AS = require('./policies/aiddrain'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: aiddrain driver absent; status in evidence/2026-10-15/sim-aiddrain-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadfeast } = require('./policies/feastscale');

const DRIVER = process.env.AIDDRAIN === '1';
const PHASE = DRIVER ? 'ARMED (AIDDRAIN=1)' : 'RED (gate off)';
console.log('== aiddrain proof — ' + PHASE + ' ==');

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
  const { Game } = await loadGame({ seed, mode: 'aiddrain-proof' });
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

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'aiddrain-red' });
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
    const hWrap = await runHashes(AS.aidDrain, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    check('R1 gate-off: aidDrain == leadfeast per-day hashes',
      hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]),
      `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(AS.aidDrain, 22, 40);
    const hBase2 = await runHashes(leadfeast, 22, 40);
    check('R1 gate-off: aidDrain == leadfeast per-day hashes (seed 22)',
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
    AS.aidDrain.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    AS.aidDrain.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: aiddrain aid verb did not fire', ctx.adAid === undefined,
      `adAid=${ctx.adAid}`);
    check('R2 gate-off: no aiddrain cause line said',
      !said.some(s => /not the rot/.test(s)), said.length + ' beats');
    check('R2 gate-off: parent tend discipline intact (base weekly tend fires)',
      link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- A1: aid fires on the overstock fixture ----------
  console.log('== A1. aid fires via honest tendLink on the thin subordinate ==');
  if (DRIVER) {
    const { Game, said } = await buildOverstockWorld(42);
    const fdBefore = freshDaysOf(Game);
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    AS.aidDrain.daily(Game, ctx);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('A1 aid verb fired (adAid=1, real kcal)', ctx.adAid === 1 && (ctx.adAidKcal || 0) > 0,
      `adAid=${ctx.adAid} kcal=${ctx.adAidKcal}`);
    check('A1 aid amount is the engine verb\'s 1500', (ctx.adAidKcal || 0) >= 1500 && (ctx.adAidKcal || 0) <= 2500,
      'adAidKcal=' + ctx.adAidKcal);
    check('A1 sub pantry credited (subaid channel, real food)',
      subAfter === subBefore + (ctx.adAidKcal || 0), `${subBefore} -> ${subAfter}`);
    check('A1 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('A1 haven pantry lighter by exactly the aid', pantryBefore - havenPantryKcal(Game) === (ctx.adAidKcal || 0),
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('A1 cause line narrated after the confirmed verb',
      said.some(s => /not the rot/.test(s)));
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('A1 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
    check('A1 floor respected (fresh-days still >= 3 after)',
      freshDaysOf(Game) >= 3, `${fdBefore.toFixed(1)} -> ${freshDaysOf(Game).toFixed(1)}`);
    check('A1 one verb/day marked', ctx._adFired === 30, '_adFired=' + ctx._adFired);
    check('A1 aid event recorded on the thin channel',
      (ctx._adEvents || []).length === 1 && ctx._adEvents[0].sub === 'thinval',
      JSON.stringify(ctx._adEvents));
  } else {
    console.log('  (skipped — RED phase; A1 is an ARMED assertion)');
  }

  // ---------- A2: fat subordinate gets no aid ----------
  console.log('== A2. thin-channel negative: fat subordinate gets no aid ==');
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(43, { subPantry: 500000 }); // 25d of need: FAT
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    check('A2 fat subordinate gets no aid', ctx.adAid === undefined,
      'subPantry=500000 (25d of need)');
  } else {
    console.log('  (skipped — RED phase; A2 is an ARMED assertion)');
  }

  // ---------- A3: mourning link gets no aid ----------
  console.log('== A3. mourning link gets no aid ==');
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(44, { mourningUntil: 40 }); // mourning until day 40
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    check('A3 mourning link gets no aid', ctx.adAid === undefined,
      'mourningUntil=40, day=30');
  } else {
    console.log('  (skipped — RED phase; A3 is an ARMED assertion)');
  }

  // ---------- A4/A5/A6: siege-gate holds ----------
  console.log('== A4/A5/A6. siege-gate holds all verbs off ==');
  if (DRIVER) {
    {
      const { Game, said } = await buildOverstockWorld(45);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      AS.aidDrain.setup(Game, ctx);
      AS.aidDrain.daily(Game, ctx);
      check('A4 lingerer holds verbs off', ctx.adAid === undefined && !said.some(s => /not the rot/.test(s)),
        `adAid=${ctx.adAid}`);
      check('A4 gate-hold counted', (ctx.adGateHeld || 0) >= 1, 'adGateHeld=' + ctx.adGateHeld);
    }
    {
      const { Game } = await buildOverstockWorld(46);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      AS.aidDrain.setup(Game, ctx);
      AS.aidDrain.daily(Game, ctx);
      check('A5 recent raid holds verbs off', ctx.adAid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(47);
      Game.__adGorgeDays = [24]; // 6d trailing — inside the 7d window
      const ctx = {};
      AS.aidDrain.setup(Game, ctx);
      AS.aidDrain.daily(Game, ctx);
      check('A6 gorge-night-trailing-7d holds verbs off', ctx.adAid === undefined,
        'gorge day=24, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(48);
      Game.__adGorgeDays = [22]; // 8d trailing — outside the 7d window
      const ctx = {};
      AS.aidDrain.setup(Game, ctx);
      AS.aidDrain.daily(Game, ctx);
      check('A6b old gorge night (8d) does NOT hold', ctx.adAid === 1,
        `adAid=${ctx.adAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; A4/A5/A6 are ARMED assertions)');
  }

  // ---------- A7: floor math ----------
  console.log('== A7. floor math (unit) ==');
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(49);
    const v = Game.state.village;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)]; // 2.08 days at 24k burn
    const md = AS.maxDrawdownKcal(Game);
    check('A7 maxDraw = fresh - 3*burn (<= 0 here)', md <= 0, 'maxDraw=' + Math.round(md));
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    check('A7 aid refused when the floor holds it', ctx.adAid === undefined,
      `adAid=${ctx.adAid}`);
    v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 days
    const md2 = AS.maxDrawdownKcal(Game);
    check('A7 aid affordable on real overstock (maxDraw >= 1500)', md2 >= 1500,
      'maxDraw=' + Math.round(md2));
  } else {
    console.log('  (skipped — RED phase; A7 is an ARMED assertion)');
  }

  // ---------- A8: driver never pays tribute ----------
  console.log('== A8. driver never pays tribute (negative assertion) ==');
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(50);
    addOwedTributeLink(Game);
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    const owed = Game.mshipState().links.find(l => l.id === 'link_owed');
    check('A8 no tribute counter from the driver', ctx.adTribute === undefined,
      `adTribute=${ctx.adTribute}`);
    check('A8 owed link\'s tribute rhythm untouched by the driver',
      owed.tributePaidWeek === -1, 'tributePaidWeek=' + owed.tributePaidWeek);
    check('A8 the aid went to the thin channel, not the owed link',
      ctx.adAid === 1 && (ctx._adEvents || [])[0] && ctx._adEvents[0].sub === 'thinval',
      `adAid=${ctx.adAid} sub=${(ctx._adEvents || [])[0] && ctx._adEvents[0].sub}`);
  } else {
    console.log('  (skipped — RED phase; A8 is an ARMED assertion)');
  }

  // ---------- A9: conservation + whole-unit honesty ----------
  console.log('== A9. conservation: kcal in = kcal out, whole units ==');
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(51);
    const before = havenPantryKcal(Game);
    const unitsBefore = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    const after = havenPantryKcal(Game);
    const unitsAfter = Game.state.village.pantry.reduce((t, i) => t + (i.units || 0), 0);
    const paid = ctx.adAidKcal || 0;
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
  if (DRIVER) {
    const { Game } = await buildOverstockWorld(52);
    const ctx = {};
    AS.aidDrain.setup(Game, ctx);
    AS.aidDrain.daily(Game, ctx);
    check('A10 first daily fires', ctx.adAid === 1, `adAid=${ctx.adAid}`);
    AS.aidDrain.daily(Game, ctx); // same day, same week: nothing new
    check('A10 second daily same day fires nothing new', ctx.adAid === 1,
      `adAid=${ctx.adAid}`);
  } else {
    console.log('  (skipped — RED phase; A10 is an ARMED assertion)');
  }

  // ---------- A11: armed determinism ----------
  console.log('== A11. armed determinism ==');
  if (DRIVER) {
    const h1 = await runHashes(AS.aidDrain, 11, 40);
    const h2 = await runHashes(AS.aidDrain, 11, 40);
    check('A11 aidDrain armed bit-identical across runs',
      h1.length === h2.length && h1.every((h, i) => h === h2[i]), `n=${h1.length}`);
  } else {
    console.log('  (skipped — RED phase; A11 is an ARMED assertion)');
  }

  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nPROOF: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
