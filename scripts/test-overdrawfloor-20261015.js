#!/usr/bin/env node
// scripts/test-overdrawfloor-20261015.js — PROOF for the OVERDRAWFLOOR arm
// (loop B, 2026-10-15, food-economy axis — sim-findings #199 re-claim).
//
// THE NAMED NEXT of the KILLED overdraw4: the fresh-first aid+feast drawdown
// verb-for-verb, plus the two mitigations the overdraw4 autopsy named —
// (1) a 3-DAY FLOOR (maxDrawdownKcal = fresh - 3*burn), (2) a FRAGILITY GATE
// (no drawdown when the pantry is fragile: fresh-days < 5, trending down,
// or a hungry day in the trailing 7d).
//
// RED PHASE (OVERDRAWFLOOR unset):
//   R1. gate-off byte-identical: wrapped vs parent, identical seeds, 40d.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture.
//   R3. NAIVE RED (the foil): _removePantryKcal drains the least-perishable
//       end first — proves the G10 fixture discriminates.
// GREEN PHASE (OVERDRAWFLOOR=1):
//   G1.  AID fires on a thin untended subordinate (floor >= 3 respected).
//   G2/G3/G4. siege-gate holds all verbs off.
//   G5.  floor math: maxDrawdownKcal = fresh - 3*burn (unit).
//   G5b. pre-draw rollback restores the pantry on refusal (unit).
//   G6.  FEAST fires when no aid channel (floor >= 3 respected).
//   G7.  TRIBUTE UNTOUCHED (negative assertion).
//   G8.  priority aid > feast, both call orders.
//   G9.  armed determinism.
//   G10. FRESH-FIRST ORDERING (the mechanism).
//   G11. FRAGILITY GATE (this arm's named mechanism):
//     a. near-floor (4.5 fresh-days): NO aid, fragile-hold counted.
//     b. trending-down (trailing-5d mean exceeds today by >= 1d): NO aid.
//     c. recent-hunger (hungry day in trailing 7d): NO aid.
//     d. healthy pantry (steady, >= 5, no hunger): aid FIRES (gate is not
//        a kill switch).
//   G12. 3-day floor on the FEAST: a candidacy whose cost exceeds
//        fresh - 3*burn is held (why='floor3').
//
// Policy-side only: no src/js changes.
//
// Usage: node scripts/test-overdrawfloor-20261015.js
//   RED:   node scripts/test-overdrawfloor-20261015.js
//   GREEN: OVERDRAWFLOOR=1 node scripts/test-overdrawfloor-20261015.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let ODF = null;
try { ODF = require('./policies/overdrawfloor'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdrawfloor layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const ARMED = process.env.OVERDRAWFLOOR === '1';
console.log('== overdrawfloor proof — ' + (ARMED ? 'ARMED (OVERDRAWFLOOR=1)' : 'RED (gate off)') + ' ==');

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
    arrears: 0, history: [], mourningUntil: 0,
  });
  return m.links[m.links.length - 1];
}

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

async function buildOverstockWorld(seed) {
  const { Game } = await loadGame({ seed, mode: 'overdrawfloor-proof' });
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
  const { Game } = await loadGame({ seed, mode: 'overdrawfloor-red' });
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
    const hWrap = await runHashes(ODF.overleadfloor, 11, 40);
    const hBase = await runHashes(leadcourt, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: overleadfloor == leadcourt per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(ODF.overbelongfloor, 22, 40);
    const hBase2 = await runHashes(belongseek, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: overbelongfloor == belongseek per-day hashes',
      same2, `n=${hWrap2.length}/${hWrap2.length}`);
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
    const pol = ODF.overleadfloor;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: aid verb did not fire', ctx.osAid === undefined,
      `osAid=${ctx.osAid}`);
    check('R2 gate-off: no cause line said', !said.some(s => /not the rot|the mountain tonight/.test(s)),
      said.length + ' beats');
    check('R2 gate-off: parent tend discipline intact', link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: NAIVE RED — the foil ----------
  console.log('== R3. naive RED: _removePantryKcal drains the least-perishable end ==');
  if (!ARMED) {
    const { Game } = await buildOverstockWorld(42);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Grain A', kcalEach: 500, units: 10, safe: true, spoilDay: day + 2 },
      { name: 'Grain B', kcalEach: 500, units: 10, safe: true, spoilDay: day + 10 },
      { name: 'Grain C', kcalEach: 500, units: 10, safe: true, spoilDay: day + 30 },
    ];
    const removed = Game._removePantryKcal(1500);
    const units = {};
    for (const it of Game.state.village.pantry) units[it.name] = it.units;
    check('R3 naive: removed 1500', removed === 1500, 'removed=' + removed);
    check('R3 naive: least-perishable (+30d) stack drained first',
      (units['Grain C'] || 0) < 10 && (units['Grain A'] || 0) === 10,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
    console.log('  (this is the R2 failure mode — documented, not the layer)');
  } else {
    console.log('  (skipped — armed phase; R3 is a RED assertion)');
  }

  // ---------- G1: AID fires ----------
  console.log('== G1. AID fires on a thin untended subordinate (3-day floor) ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    const ctx = {};
    const pol = ODF.overleadfloor;
    pol.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('G1 aid verb fired', ctx.osAid === 1 && (ctx.osAidKcal || 0) > 0,
      `osAid=${ctx.osAid} kcal=${ctx.osAidKcal}`);
    check('G1 sub pantry credited (real food)',
      subAfter === subBefore + (ctx.osAidKcal || 0),
      `${subBefore} -> ${subAfter}`);
    check('G1 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('G1 haven pantry lighter', havenPantryKcal(Game) < pantryBefore,
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('G1 cause line narrated AFTER the confirmed verb',
      said.some(s => /not the rot/.test(s)),
      said.filter(s => /not the rot/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G1 tend beat still says the fiction (engine beat intact)',
      said.some(s => /Haven sends .* kcal of grain to Thinvale/.test(s)));
    check('G1 3-day floor respected (fresh-days still >= 3 after)',
      freshDaysOf(Game) >= 3, 'freshDays=' + freshDaysOf(Game).toFixed(1));
    check('G1 one verb per day marked', ctx._osFired === 30, '_osFired=' + ctx._osFired);
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('G1 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2/G3/G4: siege-gate holds ----------
  console.log('== G2/G3/G4. siege-gate holds all verbs off ==');
  if (ARMED) {
    {
      const { Game, said } = await buildOverstockWorld(43);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ODF.overleadfloor.daily(Game, ctx);
      check('G2 lingerer holds verbs off', ctx.osAid === undefined && !said.some(s => /not the rot/.test(s)),
        `osAid=${ctx.osAid}`);
      check('G2 gate-hold counted', (ctx.osGateHeld || 0) >= 1, 'osGateHeld=' + ctx.osGateHeld);
    }
    {
      const { Game } = await buildOverstockWorld(44);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ODF.overleadfloor.daily(Game, ctx);
      check('G3 recent raid holds verbs off', ctx.osAid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(45);
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      ODF.overleadfloor.daily(Game, ctx);
      check('G4 gorge night holds verbs off', ctx.osAid === undefined,
        'gorge day=29, day=30');
    }
  } else {
    console.log('  (skipped — RED phase; G2/G3/G4 are GREEN assertions)');
  }

  // ---------- G5: floor math (3-day) ----------
  console.log('== G5. floor math: maxDrawdownKcal = fresh - 3*burn (unit) ==');
  {
    const { Game } = await buildOverstockWorld(46);
    const v = Game.state.village;
    v.pantry = [freshItem(Game, 'Foraged food', 100000, 3)];
    const md = ODF.maxDrawdownKcal(Game);
    const burnMean = v.burnHistory.reduce((t, x) => t + x, 0) / v.burnHistory.length;
    check('G5 maxDraw = fresh - 3*burn', Math.abs(md - (100000 - 3 * burnMean)) < 200,
      'maxDraw=' + Math.round(md) + ' (100000 - 3*' + burnMean.toFixed(0) + ')');
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)]; // below the floor
    const md2 = ODF.maxDrawdownKcal(Game);
    check('G5 below the 3-day floor: maxDraw = 0', md2 === 0, 'maxDraw=' + Math.round(md2));
    v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 days
    const md3 = ODF.maxDrawdownKcal(Game);
    check('G5 aid affordable on real overstock', md3 >= 1500, 'maxDraw=' + Math.round(md3));
  }

  // ---------- G5b: pre-draw rollback (unit) ----------
  console.log('== G5b. pre-draw rollback restores the pantry on refusal ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(52);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Grain A', kcalEach: 500, units: 10, safe: true, spoilDay: day + 2 },
      { name: 'Grain B', kcalEach: 500, units: 10, safe: true, spoilDay: day + 10 },
    ];
    const before = havenPantryKcal(Game);
    const draw = ODF.preDraw(Game, 1500);
    check('G5b pre-draw took fresh-first (1500)', draw.taken === 1500,
      'taken=' + draw.taken);
    const mid = havenPantryKcal(Game);
    check('G5b pantry lighter mid-draw', mid === before - 1500,
      `${before} -> ${mid}`);
    draw.rollback();
    const after = havenPantryKcal(Game);
    const unitsA = Game.state.village.pantry.find(i => i.name === 'Grain A').units;
    check('G5b rollback restores every unit', after === before && unitsA === 10,
      `pantry ${before}->${after}, A.units=${unitsA}`);
  } else {
    console.log('  (skipped — RED phase; G5b is a GREEN assertion)');
  }

  // ---------- G6: FEAST fires ----------
  console.log('== G6. FEAST fires when no aid channel (3-day floor) ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(47);
    Game.mshipState().links = []; // no subordinate links -> no aid channel
    Game.dayPart = 2; // dusk
    const ctx = {};
    const pol = ODF.overleadfloor;
    pol.setup(Game, ctx);
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
    check('G6 3-day floor respected', freshDaysOf(Game) >= 3, 'freshDays=' + freshDaysOf(Game).toFixed(1));
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: TRIBUTE UNTOUCHED ----------
  console.log('== G7. tribute timing untouched — the layer never pays early ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(48);
    addOwedTributeLink(Game);
    const ctx = {};
    const pol = ODF.overbelongfloor;
    pol.setup(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_owed');
    pol.daily(Game, ctx);
    check('G7 no layer tribute verb exists (osTribute never set)', ctx.osTribute === undefined,
      `osTribute=${ctx.osTribute}`);
    check('G7 no early-tribute cause line (the R3 harm channel is gone)',
      !said.some(s => /while the grain is still good|Tribute paid early/.test(s)),
      said.length + ' beats');
    check('G7 the aid verb tends the thin link, not the owed one',
      (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal > 1000,
      `osAid=${ctx.osAid} thinval=${(Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal}`);
    check('G7 the layer left the owed link alone (base discipline may pay on its own rhythm)',
      !said.some(s => /Bigkeep/.test(s) && /tribute/i.test(s) && /early/i.test(s)),
      `tributePaidWeek=${link.tributePaidWeek} (base-discipline timing is allowed)`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: priority aid > feast, both call orders ----------
  console.log('== G8. priority: aid > feast (one verb/day), both call orders ==');
  if (ARMED) {
    {
      const { Game } = await buildOverstockWorld(49);
      Game.dayPart = 2;
      const ctx = {};
      const pol = ODF.overleadfloor;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      pol.daily(Game, ctx);
      pol.upkeep(Game, ctx);
      check('G8a daily->upkeep: aid wins the day', ctx.osAid === 1 && ctx.osFeasts === undefined,
        `osAid=${ctx.osAid} osFeasts=${ctx.osFeasts}`);
    }
    {
      const { Game } = await buildOverstockWorld(50);
      Game.dayPart = 2;
      const ctx = {};
      const pol = ODF.overleadfloor;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      pol.upkeep(Game, ctx);
      pol.daily(Game, ctx);
      check('G8b upkeep->daily: feast yields to the aid channel, aid fires',
        ctx.osAid === 1 && ctx.osFeasts === undefined,
        `osAid=${ctx.osAid} osFeasts=${ctx.osFeasts}`);
    }
    {
      const { Game } = await buildOverstockWorld(51);
      Game.mshipState().links = [];
      Game.dayPart = 2;
      const ctx = {};
      const pol = ODF.overleadfloor;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      pol.upkeep(Game, ctx);
      pol.daily(Game, ctx);
      check('G8c no aid channel: feast fires', ctx.osFeasts === 1,
        `osFeasts=${ctx.osFeasts} osAid=${ctx.osAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: armed determinism ----------
  console.log('== G9. armed determinism (40d x2) ==');
  if (ARMED) {
    const a = await runHashes(ODF.overleadfloor, 11, 40);
    const b = await runHashes(ODF.overleadfloor, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G9 armed overleadfloor bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  // ---------- G10: FRESH-FIRST ORDERING ----------
  console.log('== G10. fresh-first ordering: the drawdown eats the soonest-spoiling end ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(53);
    const day = Game.state.scholar.day;
    const A = { name: 'Grain A', kcalEach: 500, units: 96, safe: true, spoilDay: day + 2 };
    const B = { name: 'Grain B', kcalEach: 500, units: 96, safe: true, spoilDay: day + 10 };
    const C = { name: 'Grain C', kcalEach: 500, units: 96, safe: true, spoilDay: day + 30 };
    Game.state.village.pantry = [A, B, C];
    check('G10 fixture still overstock (trigger > 4)', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = ODF.overleadfloor;
    pol.setup(Game, ctx);
    pol.daily(Game, ctx);
    check('G10 aid verb fired', ctx.osAid === 1, `osAid=${ctx.osAid}`);
    check('G10 soonest-spoiling (+2d) stack drained first',
      A.units < 96 && B.units === 96 && C.units === 96,
      `A=${A.units} B=${B.units} C=${C.units}`);
    check('G10 least-perishable (+30d) stack untouched', C.units === 96,
      `C.units=${C.units}`);
    check('G10 pantry drained exactly once (no double-draw)',
      A.units === 93 && C.units === 96,
      `A.units=${A.units} C.units=${C.units} pantry=${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G10 is a GREEN assertion)');
  }

  // ---------- G11: FRAGILITY GATE (this arm's named mechanism) ----------
  console.log('== G11. fragility gate: no drawdown on a fragile pantry ==');
  if (ARMED) {
    { // G11a: near the floor — 4.5 fresh-days (trigger passes, floor is the exposure)
      const { Game } = await buildOverstockWorld(54);
      Game.state.village.pantry = [freshItem(Game, 'Foraged food', 108000, 3)]; // 4.5 fresh-days
      check('G11a fixture: overstock trigger live', freshDaysOf(Game) > 4,
        'freshDays=' + freshDaysOf(Game).toFixed(1));
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ODF.overleadfloor.daily(Game, ctx);
      check('G11a near-floor pantry: NO aid verb', ctx.osAid === undefined,
        `osAid=${ctx.osAid}`);
      check('G11a fragile hold counted', (ctx.osFragileHeld || 0) >= 1,
        'osFragileHeld=' + ctx.osFragileHeld);
    }
    { // G11b: trending down — trailing-5d mean exceeds today by >= 1 day
      const { Game } = await buildOverstockWorld(55);
      // 8.2 fresh-days today, >= 5 (not near-floor); trail falling fast
      Game.state.village.pantry = [freshItem(Game, 'Foraged food', 196800, 3)];
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ctx._odfTrail = [
        { day: 25, fd: 10.0, hungry: false },
        { day: 26, fd: 9.8, hungry: false },
        { day: 27, fd: 9.5, hungry: false },
        { day: 28, fd: 9.2, hungry: false },
        { day: 29, fd: 9.0, hungry: false },
      ];
      check('G11b fixture: 8.2 fresh-days, not near the floor', freshDaysOf(Game) >= 5,
        'freshDays=' + freshDaysOf(Game).toFixed(1));
      ODF.overleadfloor.daily(Game, ctx);
      check('G11b trending-down pantry: NO aid verb', ctx.osAid === undefined,
        `osAid=${ctx.osAid}`);
      check('G11b fragile hold counted', (ctx.osFragileHeld || 0) >= 1,
        'osFragileHeld=' + ctx.osFragileHeld);
    }
    { // G11c: recent hunger — a hungry day in the trailing 7d
      const { Game } = await buildOverstockWorld(56);
      Game.state.village.pantry = [freshItem(Game, 'Foraged food', 192000, 3)]; // 8.0 fresh-days
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ctx._odfTrail = [
        { day: 25, fd: 8.0, hungry: false },
        { day: 26, fd: 8.0, hungry: false },
        { day: 27, fd: 8.0, hungry: true },   // a hungry day, 3 days back
        { day: 28, fd: 8.0, hungry: false },
        { day: 29, fd: 8.0, hungry: false },
      ];
      ODF.overleadfloor.daily(Game, ctx);
      check('G11c post-hunger pantry: NO aid verb', ctx.osAid === undefined,
        `osAid=${ctx.osAid}`);
      check('G11c fragile hold counted', (ctx.osFragileHeld || 0) >= 1,
        'osFragileHeld=' + ctx.osFragileHeld);
    }
    { // G11d: healthy pantry — steady, >= 5, no hunger: the gate is not a kill switch
      const { Game } = await buildOverstockWorld(57);
      Game.state.village.pantry = [freshItem(Game, 'Foraged food', 192000, 3)]; // 8.0 fresh-days
      const ctx = {};
      ODF.overleadfloor.setup(Game, ctx);
      ctx._odfTrail = [
        { day: 25, fd: 8.1, hungry: false },
        { day: 26, fd: 8.0, hungry: false },
        { day: 27, fd: 8.0, hungry: false },
        { day: 28, fd: 8.0, hungry: false },
        { day: 29, fd: 8.0, hungry: false },
      ];
      ODF.overleadfloor.daily(Game, ctx);
      check('G11d healthy pantry: aid verb FIRES (gate is not a kill switch)',
        ctx.osAid === 1, `osAid=${ctx.osAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G11 is a GREEN assertion)');
  }

  // ---------- G12: 3-day floor holds a deep feast ----------
  console.log('== G12. the 3-day floor holds a feast that the old 2-day floor would allow ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(58);
    Game.mshipState().links = [];
    Game.dayPart = 2;
    const ctx = {};
    const pol = ODF.overleadfloor;
    pol.setup(Game, ctx);
    const day = Game.state.scholar.day;
    ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
    // a candidacy whose cost sits between fresh-3*burn and fresh-2*burn:
    // the old floor would have allowed it, the new floor must hold it.
    const realPlan = Game.feastPlan();
    const md3 = ODF.maxDrawdownKcal(Game);
    const fakeCost = Math.round(md3 + 20000); // > 3-day allowance, < 2-day allowance
    check('G12 fixture: fake cost inside the old 2-day window',
      fakeCost <= (havenPantryKcal(Game) - 2 * ODF.burnAt(Game)),
      `cost=${fakeCost} md3=${Math.round(md3)}`);
    Game.feastPlan = function () {
      return Object.assign({}, realPlan, { ok: true, cost: fakeCost, have: fakeCost * 2 });
    };
    pol.upkeep(Game, ctx);
    check('G12 deep feast held at the 3-day floor', ctx.osFeasts === undefined,
      `osFeasts=${ctx.osFeasts}`);
    // and a normal-cost feast on the same pantry fires (the floor is a ceiling, not a ban)
    const ctx2 = {};
    pol.setup(Game, ctx2);
    ctx2._tribHist = [{ day: day - 1, kcal: 2000 }];
    Game.feastPlan = function () { return realPlan; };
    pol.upkeep(Game, ctx2);
    check('G12 normal feast still fires on the healthy pantry', ctx2.osFeasts === 1,
      `osFeasts=${ctx2.osFeasts}`);
  } else {
    console.log('  (skipped — RED phase; G12 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
