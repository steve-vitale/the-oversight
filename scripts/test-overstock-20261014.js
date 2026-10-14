#!/usr/bin/env node
// scripts/test-overstock-20261014.js — PROOF for the OVERSTOCK arm (loop B,
// ARM 2, 2026-10-14, food-economy axis).
//
// THE LEVER: villages over-produce into pantries the preservation chain
// can't hold (OVERSTOCK-ROT, sim-findings #163). prodthrottle stops NEW
// production; overstock draws down the STOCK: when pantry fresh-days > 4
// (the throttle's own signal), the policy spends the surplus through real
// outflow verbs — AID (tend a thin subordinate link; the subaid mechanic),
// FEAST (hostFeast under the feastscale r13 gates, reused), TRIBUTE (pay
// the week's tribute early, in full). Hard-gated off during any
// lingerer/gorge threat or raid in the trailing 7d (loop A boundary).
// Floor: never push fresh-days below 2.
//
// RED PHASE (OVERSTOCK unset):
//   R1. gate-off byte-identical: overstock-wrapped policy vs parent policy,
//       identical seeds, 40 days — per-day state hashes identical.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture.
// GREEN PHASE (OVERSTOCK=1):
//   G1. AID fires on a thin untended subordinate (real 1500 aid credit,
//       trust gain, honest beats, floor respected).
//   G2. siege-gate: a lingering monster holds ALL verbs off.
//   G3. raid gate: lastRaidDay in trailing 7d holds all verbs off.
//   G4. gorge gate: a gorge night in the trailing 7d holds all verbs off.
//   G5. floor math: maxDrawdownKcal = fresh - 2*burn (unit).
//   G6. FEAST fires when no aid channel: real pantry draw, r13
//       contribution rule reused, cause line narrated.
//   G7. TRIBUTE fires when the week's tribute is unpaid: early, in full.
//   G8. priority: aid > feast > tribute (one verb per day).
//   G9. armed determinism: OVERSTOCK=1 twice, identical seeds -> identical
//       (det-gate before trusting before/after).
//
// Policy-side only: no src/js changes. All invariant assertions are
// identical on both phases where noted.
//
// Usage: node scripts/test-overstock-20261014.js
//   RED:  OVERSTOCK= node scripts/test-overstock-20261014.js   (R1/R2 must
//         FAIL on the *verbs-fire* assertions only if the layer is broken;
//         gate-off assertions must PASS)
//   GREEN: OVERSTOCK=1 node scripts/test-overstock-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const OVER = require('./policies/overstock');
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const ARMED = process.env.OVERSTOCK === '1';
console.log('== overstock proof — ' + (ARMED ? 'ARMED (OVERSTOCK=1)' : 'RED (gate off)') + ' ==');

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

// A thin subordinate link (lead road) — subaid buildWorld pattern.
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
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

// A belong-side link (we owe tribute).
function addOwedTributeLink(Game, opts) {
  opts = opts || {};
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

// Overstock fixture: 6.25 fresh-days at an honest 24k burn, thin sub,
// no threats.
async function buildOverstockWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'overstock-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 fresh-days
  v.lastRaidDay = 0;
  addThinSubLink(Game);
  return { Game, said };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'overstock-red' });
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
    const hWrap = await runHashes(OVER.overlead, 11, 40);
    const hBase = await runHashes(leadcourt, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: overlead == leadcourt per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(OVER.overbelong, 22, 40);
    const hBase2 = await runHashes(belongseek, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: overbelong == belongseek per-day hashes',
      same2, `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no verbs fire gate-off ----------
  console.log('== R2. no verbs fire gate-off on the overstock fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = OVER.overlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: overstock aid verb did not fire', ctx.osAid === undefined,
      `osAid=${ctx.osAid}`);
    check('R2 gate-off: no overstock cause line said', !said.some(s => /not the rot|the mountain tonight/.test(s)),
      said.length + ' beats');
    // NOTE: the 1500 draw below is the PARENT leadcourt's own tend
    // discipline (pantry > 20000), not the layer — R1 pins byte-identicality.
    check('R2 gate-off: parent tend discipline intact', link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- G1: AID fires ----------
  console.log('== G1. AID fires on a thin untended subordinate ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    const ctx = {};
    const pol = OVER.overlead;
    pol.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('G1 aid verb fired', ctx.osAid === 1 && (ctx.osAidKcal || 0) > 0,
      `osAid=${ctx.osAid} kcal=${ctx.osAidKcal}`);
    check('G1 sub pantry credited (subaid channel, real food)',
      subAfter === subBefore + (ctx.osAidKcal || 0),
      `${subBefore} -> ${subAfter}`);
    check('G1 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('G1 haven pantry lighter', havenPantryKcal(Game) < pantryBefore,
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('G1 cause line narrated (the WHY, not just the beat)',
      said.some(s => /not the rot/.test(s)),
      said.filter(s => /not the rot/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G1 tend beat still says the fiction (engine beat intact)',
      said.some(s => /Haven sends .* kcal of grain to Thinvale/.test(s)));
    check('G1 floor respected (fresh-days still >= 2 after)',
      freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
    check('G1 one verb per day marked', ctx._osFired === 30, '_osFired=' + ctx._osFired);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2/G3/G4: siege-gate holds ----------
  console.log('== G2/G3/G4. siege-gate holds all verbs off ==');
  if (ARMED) {
    // G2: lingering monster
    {
      const { Game, said } = await buildOverstockWorld(43);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      OVER.overlead.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      OVER.overlead.daily(Game, ctx);
      check('G2 lingerer holds verbs off', ctx.osAid === undefined && !said.some(s => /not the rot/.test(s)),
        `osAid=${ctx.osAid}`);
      check('G2 gate-hold counted', (ctx.osGateHeld || 0) >= 1, 'osGateHeld=' + ctx.osGateHeld);
    }
    // G3: raid raised in trailing 7d
    {
      const { Game } = await buildOverstockWorld(44);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      OVER.overlead.setup(Game, ctx);
      const before = havenPantryKcal(Game);
      OVER.overlead.daily(Game, ctx);
      check('G3 recent raid holds verbs off', ctx.osAid === undefined,
        'lastRaidDay=28, day=30');
    }
    // G4: gorge night in trailing 7d (predation-lib telemetry)
    {
      const { Game } = await buildOverstockWorld(45);
      const ctx = {};
      OVER.overlead.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      const before = havenPantryKcal(Game);
      OVER.overlead.daily(Game, ctx);
      check('G4 gorge night holds verbs off', ctx.osAid === undefined,
        'gorge day=29, day=30');
    }
  } else {
    console.log('  (skipped — RED phase; G2/G3/G4 are GREEN assertions)');
  }

  // ---------- G5: floor math ----------
  console.log('== G5. floor math (unit) ==');
  {
    const { Game } = await buildOverstockWorld(46);
    const v = Game.state.village;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)]; // 2.08 days at 24k burn
    const md = OVER.maxDrawdownKcal(Game);
    check('G5 maxDraw = fresh - 2*burn', Math.abs(md - 2000) < 600,
      'maxDraw=' + Math.round(md));
    v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 days
    const md2 = OVER.maxDrawdownKcal(Game);
    check('G5 aid affordable on real overstock', md2 >= 1500, 'maxDraw=' + Math.round(md2));
  }

  // ---------- G6: FEAST fires ----------
  console.log('== G6. FEAST fires when no aid channel ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(47);
    // no subordinate links at all -> no aid channel
    Game.mshipState().links = [];
    Game.dayPart = 2; // dusk
    const ctx = {};
    const pol = OVER.overlead;
    pol.setup(Game, ctx);
    // r13 contribution: the scholar paid tribute/tended this week (reused accounting)
    const day = Game.state.scholar.day;
    ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
    const before = havenPantryKcal(Game);
    pol.upkeep(Game, ctx);
    check('G6 feast verb fired', ctx.osFeasts === 1 && (ctx.osFeastKcal || 0) > 0,
      `osFeasts=${ctx.osFeasts} spent=${ctx.osFeastKcal}`);
    check('G6 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G6 feast cause line narrated',
      said.some(s => /eat the mountain tonight/.test(s)),
      said.filter(s => /mountain/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G6 floor respected', freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: TRIBUTE fires ----------
  console.log('== G7. TRIBUTE fires early, in full ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(48);
    // no aid channel here: strip the thin-sub link so the tribute verb is
    // the one under test (priority aid > tribute would otherwise win).
    Game.mshipState().links = Game.mshipState().links.filter(l => l.id !== 'link_thin');
    addOwedTributeLink(Game); // belong-side link, tribute unpaid
    const ctx = {};
    const pol = OVER.overbelong;
    pol.setup(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_owed');
    const before = havenPantryKcal(Game);
    // NOTE: overbelong's base daily (belongseek) may pay the tribute first
    // via its own discipline — the overstock verb runs BEFORE base.daily,
    // so the early-full payment is ours.
    OVER.tributeChannel(Game); // smoke: channel exists
    check('G7 tribute channel found', !!OVER.tributeChannel(Game), 'owed link present');
    pol.daily(Game, ctx);
    const wk = Game._week();
    check('G7 tribute paid early (week current)', link.tributePaidWeek === wk,
      `tributePaidWeek=${link.tributePaidWeek} week=${wk}`);
    check('G7 tribute verb counted (not just the base discipline)', ctx.osTribute === 1,
      `osTribute=${ctx.osTribute}`);
    check('G7 tribute cause line narrated',
      said.some(s => /while the grain is still good/.test(s)));
    check('G7 pantry lighter', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: priority ----------
  console.log('== G8. priority: aid > feast > tribute (one verb/day) ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(49);
    addOwedTributeLink(Game);
    Game.dayPart = 2;
    const ctx = {};
    const pol = OVER.overlead;
    pol.setup(Game, ctx);
    ctx._tribHist = [{ day: 29, kcal: 2000 }];
    pol.daily(Game, ctx);   // aid should fire (priority 1)
    pol.upkeep(Game, ctx);  // feast must NOT (already fired today)
    check('G8 aid wins the day', ctx.osAid === 1 && ctx.osFeasts === undefined,
      `osAid=${ctx.osAid} osFeasts=${ctx.osFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: armed determinism ----------
  console.log('== G9. armed determinism (det-gate, 40d x2) ==');
  if (ARMED) {
    const a = await runHashes(OVER.overlead, 11, 40);
    const b = await runHashes(OVER.overlead, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G9 armed overlead bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
