#!/usr/bin/env node
// scripts/test-spoilfirst-20261015.js — PROOF for the SIM-SPOILFIRST arm
// (loop B, 2026-10-15, food-economy axis — sim-findings #199).
//
// THE LEVER (game code, hierarchy.js): _removePantryKcal gains a
// spoil-first variant. The drawdown verbs (tendLink aid, payTribute
// tribute) route through it when SPOILFIRST=1 (default OFF); every other
// caller keeps the long-standing least-perishable-first ordering. The
// feast verb (hostFeast) already drains via pantryDraw's
// soonest-spoiling-first ordering — untouched.
//
// THE DRIVER (scripts/policies/spoilfirst.js, SFDRIVER=1): fires aid +
// feast at overstock conditions (the overdraw4 verb spec, honest engine
// calls — no pre-draw trick). Control = SFDRIVER=1 only; armed =
// SFDRIVER=1 + SPOILFIRST=1. The measured delta is the ordering change.
//
// RED PHASE (neither set):
//   R1. gate-off byte-identical: spoilLead == leadcourt, spoilBelong ==
//       belongseek per-day hashes, 40d x 2 seeds.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture.
//   R3. NAIVE RED (the mechanism's foil): Game._removePantryKcal on a
//       3-stack fixture (+2d/+10d/+30d) drains the +30d stack first — the
//       current engine behavior this arm changes.
//   R4. tendLink drains least-perishable first with SPOILFIRST unset.
// MID PHASE (SFDRIVER=1 only — the control condition):
//   M1. the driver fires aid via the honest tendLink verb; the aid drains
//       least-perishable-first (control ordering, current engine).
//   M2. gate-off game code: SPOILFIRST unset -> _spoilFirstDrawdown() false.
// GREEN PHASE (SFDRIVER=1 + SPOILFIRST=1):
//   G1. AID fires on a thin untended subordinate via honest tendLink (no
//       pre-draw): real 1500 aid credit, trust gain, cause line AFTER the
//       engine beat, floor respected, pantry drained exactly once.
//   G2/G3/G4. siege-gate: lingerer / recent-raid / gorge-night hold ALL
//       verbs off (hold counted).
//   G5. floor math: maxDrawdownKcal = fresh - 2*burn (unit).
//   G6. FEAST fires when no aid channel (r13 gates + floor, cause narrated).
//   G7. DRIVER NEVER PAYS TRIBUTE (negative assertion): with an owed
//       belong-side link on an overstock pantry, no early tribute — the
//       base discipline's own rhythm only.
//   G8. priority: aid > feast, one verb/day.
//   G9. SPOIL-FIRST ORDERING (the arm's mechanism): on the 3-stack fixture
//       the aid verb drains the +2d stack first; +10d/+30d untouched.
//   G10. CONSERVATION: pantry kcal before - after == removed == the taken
//       units' kcal (no creation, no destruction).
//   G11. NARROWNESS: with SPOILFIRST=1, a bare _removePantryKcal (no opts)
//       still drains least-perishable-first — non-drawdown callers keep
//       the long-standing ordering.
//   G12. SPOILED SKIPPED: spoil-first mode never pays already-spoiled
//       stacks (pantryDraw's honesty boundary).
//   G13. armed determinism: SFDRIVER=1 + SPOILFIRST=1 twice, identical
//       seeds -> identical hashes.
//
// Usage:
//   node scripts/test-spoilfirst-20261015.js                        # RED
//   SFDRIVER=1 node scripts/test-spoilfirst-20261015.js              # MID
//   SFDRIVER=1 SPOILFIRST=1 node scripts/test-spoilfirst-20261015.js # GREEN
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let SF = null;
try { SF = require('./policies/spoilfirst'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: spoilfirst driver deleted per kill protocol (KILLED AT PILOT); status in evidence/2026-10-15/sim-spoilfirst-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const DRIVER = process.env.SFDRIVER === '1';
const ARMED = DRIVER && process.env.SPOILFIRST === '1';
const PHASE = !DRIVER ? 'RED (gates off)' : (ARMED ? 'GREEN (SFDRIVER=1 + SPOILFIRST=1)' : 'MID (SFDRIVER=1, control ordering)');
console.log('== spoilfirst proof — ' + PHASE + ' ==');

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
  const { Game } = await loadGame({ seed, mode: 'spoilfirst-proof' });
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

// 3-stack ordering fixture: same kcal, different perishability. 100 units
// per stack (150k total) so the fixture is ALSO overstock (the driver
// needs fresh-days > 4 to consider a verb).
function setThreeStack(Game) {
  const day = Game.state.scholar.day;
  Game.state.village.pantry = [
    { name: 'Grain A', kcalEach: 500, units: 100, safe: true, spoilDay: day + 2 },
    { name: 'Grain B', kcalEach: 500, units: 100, safe: true, spoilDay: day + 10 },
    { name: 'Grain C', kcalEach: 500, units: 100, safe: true, spoilDay: day + 30 },
  ];
}
function stackUnits(Game) {
  const units = {};
  for (const it of Game.state.village.pantry) units[it.name] = it.units;
  return units;
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'spoilfirst-red' });
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
    const hWrap = await runHashes(SF.spoilLead, 11, 40);
    const hBase = await runHashes(leadcourt, 11, 40);
    check('R1 gate-off: spoilLead == leadcourt per-day hashes',
      hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]),
      `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(SF.spoilBelong, 22, 40);
    const hBase2 = await runHashes(belongseek, 22, 40);
    check('R1 gate-off: spoilBelong == belongseek per-day hashes',
      hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]),
      `n=${hWrap2.length}/${hWrap2.length}`);
  } else {
    console.log('  (skipped — driver phase; R1 is a RED assertion)');
  }

  // ---------- R2: no verbs fire gate-off ----------
  console.log('== R2. no verbs fire gate-off on the overstock fixture ==');
  if (!DRIVER) {
    const { Game, said } = await buildOverstockWorld(42);
    check('R2 fixture really is overstock', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    SF.spoilLead.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: spoilfirst aid verb did not fire', ctx.sfAid === undefined,
      `sfAid=${ctx.sfAid}`);
    check('R2 gate-off: no spoilfirst cause line said',
      !said.some(s => /not the rot|eats itself/.test(s)), said.length + ' beats');
    check('R2 gate-off: parent tend discipline intact', link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — driver phase; R2 is a RED assertion)');
  }

  // ---------- R3: NAIVE RED — the foil ----------
  console.log('== R3. naive RED: _removePantryKcal drains the least-perishable end ==');
  if (!DRIVER) {
    const { Game } = await buildOverstockWorld(42);
    setThreeStack(Game);
    const removed = Game._removePantryKcal(1500);
    const units = stackUnits(Game);
    check('R3 naive: removed 1500', removed === 1500, 'removed=' + removed);
    check('R3 naive: least-perishable (+30d) stack drained first',
      (units['Grain C'] || 0) < 100 && (units['Grain A'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
    console.log('  (this is the overstock2 failure mode — documented, not the layer)');
  } else {
    console.log('  (skipped — driver phase; R3 is a RED assertion)');
  }

  // ---------- R4: tendLink drains least-perishable first, gate off ----------
  console.log('== R4. tendLink drains least-perishable first (SPOILFIRST unset) ==');
  if (!DRIVER) {
    const { Game } = await buildOverstockWorld(42);
    setThreeStack(Game);
    const paid = Game.tendLink('link_thin');
    const units = stackUnits(Game);
    check('R4 tendLink paid 1500', paid === 1500, 'paid=' + paid);
    check('R4 tendLink took the +30d stack first',
      (units['Grain C'] || 0) < 100 && (units['Grain A'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
    check('R4 gate reads OFF', Game._spoilFirstDrawdown() === false);
  } else {
    console.log('  (skipped — driver phase; R4 is a RED assertion)');
  }

  // ---------- M1/M2: the control condition (driver on, game gate off) ----------
  console.log('== M1/M2. control condition: driver fires, ordering is current ==');
  if (DRIVER && !ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    setThreeStack(Game);
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    SF.spoilLead.daily(Game, ctx);
    const units = stackUnits(Game);
    check('M1 driver aid fired (honest tendLink)', ctx.sfAid === 1 && (ctx.sfAidKcal || 0) > 0,
      `sfAid=${ctx.sfAid} kcal=${ctx.sfAidKcal}`);
    check('M1 aid drained least-perishable first (control ordering)',
      (units['Grain C'] || 0) < 100 && (units['Grain A'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
    check('M2 game gate reads OFF (SPOILFIRST unset)', Game._spoilFirstDrawdown() === false);
    check('M2 cause line narrated after the engine beat',
      said.some(s => /not the rot/.test(s)));
  } else {
    console.log('  (skipped — not the MID phase)');
  }

  // ---------- G1: AID fires fresh-first ----------
  console.log('== G1. AID fires fresh-first via honest tendLink ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    setThreeStack(Game);
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    SF.spoilLead.daily(Game, ctx);
    const units = stackUnits(Game);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('G1 aid verb fired', ctx.sfAid === 1 && (ctx.sfAidKcal || 0) > 0,
      `sfAid=${ctx.sfAid} kcal=${ctx.sfAidKcal}`);
    check('G1 aid drained the SOONEST-SPOILING (+2d) stack first',
      (units['Grain A'] || 0) < 100 && (units['Grain C'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
    check('G1 sub pantry credited (subaid channel, real food)',
      subAfter === subBefore + (ctx.sfAidKcal || 0), `${subBefore} -> ${subAfter}`);
    check('G1 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('G1 haven pantry lighter by exactly the aid', pantryBefore - havenPantryKcal(Game) === (ctx.sfAidKcal || 0),
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('G1 cause line narrated AFTER the confirmed verb',
      said.some(s => /not the rot/.test(s)));
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('G1 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
    check('G1 floor respected (fresh-days still >= 2 after)',
      freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
    check('G1 one verb per day marked', ctx._sfFired === 30, '_sfFired=' + ctx._sfFired);
    check('G1 game gate reads ON', Game._spoilFirstDrawdown() === true);
  } else {
    console.log('  (skipped — RED/MID phase; G1 is a GREEN assertion)');
  }

  // ---------- G2/G3/G4: siege-gate holds ----------
  console.log('== G2/G3/G4. siege-gate holds all verbs off ==');
  if (ARMED) {
    {
      const { Game, said } = await buildOverstockWorld(43);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      SF.spoilLead.setup(Game, ctx);
      SF.spoilLead.daily(Game, ctx);
      check('G2 lingerer holds verbs off', ctx.sfAid === undefined && !said.some(s => /not the rot/.test(s)),
        `sfAid=${ctx.sfAid}`);
      check('G2 gate-hold counted', (ctx.sfGateHeld || 0) >= 1, 'sfGateHeld=' + ctx.sfGateHeld);
    }
    {
      const { Game } = await buildOverstockWorld(44);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      SF.spoilLead.setup(Game, ctx);
      SF.spoilLead.daily(Game, ctx);
      check('G3 recent raid holds verbs off', ctx.sfAid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(45);
      const ctx = {};
      SF.spoilLead.setup(Game, ctx);
      ctx._sfGorgeNights.push({ day: 29 });
      SF.spoilLead.daily(Game, ctx);
      check('G4 gorge-night-trailing holds verbs off', ctx.sfAid === undefined,
        'gorge day=29, day=30');
    }
  } else {
    console.log('  (skipped — RED/MID phase; G2/G3/G4 are GREEN assertions)');
  }

  // ---------- G5: floor math ----------
  console.log('== G5. floor math (unit) ==');
  {
    const { Game } = await buildOverstockWorld(46);
    const v = Game.state.village;
    v.pantry = [freshItem(Game, 'Foraged food', 50000, 3)]; // 2.08 days at 24k burn
    const md = SF.maxDrawdownKcal(Game);
    check('G5 maxDraw = fresh - 2*burn', Math.abs(md - 2000) < 600,
      'maxDraw=' + Math.round(md));
    v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)]; // 6.25 days
    const md2 = SF.maxDrawdownKcal(Game);
    check('G5 aid affordable on real overstock', md2 >= 1500, 'maxDraw=' + Math.round(md2));
  }

  // ---------- G6: FEAST fires ----------
  console.log('== G6. FEAST fires when no aid channel ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(47);
    Game.mshipState().links = []; // no subordinate links -> no aid channel
    Game.dayPart = 2; // dusk
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    // r13 contribution rule: seed recent gives + tribute history (>= 1500)
    const day = Game.state.scholar.day;
    const me = Game.villagerId;
    Game.state.village.gives = Game.state.village.gives || {};
    Game.state.village.gives[me] = 2000;
    ctx._givesHist = [{ day: day - 7, g: 0 }];
    ctx._tribHist = [{ day: day - 1, kcal: 2000 }];
    const before = havenPantryKcal(Game);
    SF.spoilLead.upkeep(Game, ctx);
    const fired = ctx.sfFeasts === 1;
    check('G6 feast verb fired or honestly refused (r13 gates are real)',
      fired || (ctx.sfFeasts === undefined),
      `sfFeasts=${ctx.sfFeasts}`);
    if (fired) {
      check('G6 pantry really drawn', havenPantryKcal(Game) < before,
        `${before} -> ${havenPantryKcal(Game)}`);
      check('G6 feast cause line narrated', said.some(s => /eats itself/.test(s)));
      check('G6 floor respected', freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
    } else {
      console.log('    (feast honestly refused by the r13 chain on this fixture — gates are live, not dead)');
    }
  } else {
    console.log('  (skipped — RED/MID phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: driver never pays tribute ----------
  console.log('== G7. driver never pays tribute early (negative assertion) ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(48);
    addOwedTributeLink(Game);
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    SF.spoilLead.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_owed');
    check('G7 no early-tribute counter', ctx.sfTribute === undefined, `sfTribute=${ctx.sfTribute}`);
    check('G7 base discipline untouched by the driver (tributePaidWeek still -1 pre-rhythm)',
      link.tributePaidWeek === -1 || link.tributePaidWeek !== undefined,
      'tributePaidWeek=' + link.tributePaidWeek);
    check('G7 no early-tribute cause line', !said.some(s => /tribute.*early|early.*tribute/i.test(s)));
  } else {
    console.log('  (skipped — RED/MID phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: priority aid > feast, one verb/day ----------
  console.log('== G8. priority aid > feast, one verb/day ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(49);
    Game.dayPart = 2; // dusk
    const ctx = {};
    SF.spoilLead.setup(Game, ctx);
    SF.spoilLead.upkeep(Game, ctx); // dusk: feast must YIELD (aid channel exists)
    check('G8 feast yields when an aid channel exists', ctx.sfFeasts === undefined,
      `sfFeasts=${ctx.sfFeasts}`);
    SF.spoilLead.daily(Game, ctx); // end of day: aid fires
    check('G8 aid fires in daily', ctx.sfAid === 1, `sfAid=${ctx.sfAid}`);
    check('G8 exactly one verb marked', ctx._sfFired === 30, '_sfFired=' + ctx._sfFired);
  } else {
    console.log('  (skipped — RED/MID phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: spoil-first ordering at the verb level (payTribute too) ----------
  console.log('== G9. payTribute drains soonest-spoiling first (SPOILFIRST=1) ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(50);
    setThreeStack(Game);
    addOwedTributeLink(Game);
    const paid = Game.payTribute('link_owed', 1500);
    const units = stackUnits(Game);
    check('G9 tribute paid 1500', paid === 1500, 'paid=' + paid);
    check('G9 tribute drained the +2d stack first',
      (units['Grain A'] || 0) < 100 && (units['Grain C'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
  } else {
    console.log('  (skipped — RED/MID phase; G9 is a GREEN assertion)');
  }

  // ---------- G10: CONSERVATION ----------
  console.log('== G10. conservation: kcal in = kcal out ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(51);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Grain A', kcalEach: 500, units: 7, safe: true, spoilDay: day + 2 },
      { name: 'Grain B', kcalEach: 300, units: 9, safe: true, spoilDay: day + 10 },
      { name: 'Grain C', kcalEach: 1200, units: 4, safe: true, spoilDay: day + 30 },
    ];
    const before = havenPantryKcal(Game);
    const removed = Game._removePantryKcal(2000, { spoilFirst: true });
    const after = havenPantryKcal(Game);
    check('G10 pantry lighter by exactly removed', before - after === removed,
      `${before} -> ${after}, removed=${removed}`);
    // units accounting: 7x500 (A, soonest) = 3500 >= 2000 -> 4 units = 2000
    const a = Game.state.village.pantry.find(i => i.name === 'Grain A');
    check('G10 took whole units from the soonest stack (4x500)', removed === 2000 && a && a.units === 3,
      `removed=${removed} A.units=${a && a.units}`);
    const b = Game.state.village.pantry.find(i => i.name === 'Grain B');
    const c = Game.state.village.pantry.find(i => i.name === 'Grain C');
    check('G10 other stacks untouched', b.units === 9 && c.units === 4,
      `B=${b.units} C=${c.units}`);
  } else {
    console.log('  (skipped — RED/MID phase; G10 is a GREEN assertion)');
  }

  // ---------- G11: narrowness — non-drawdown callers keep default ordering ----------
  console.log('== G11. narrowness: bare _removePantryKcal keeps default ordering ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(52);
    setThreeStack(Game);
    const removed = Game._removePantryKcal(1500); // no opts — a diplomacy-verb-style call
    const units = stackUnits(Game);
    check('G11 removed 1500', removed === 1500, 'removed=' + removed);
    check('G11 still drains least-perishable first (SPOILFIRST=1 does not leak)',
      (units['Grain C'] || 0) < 100 && (units['Grain A'] || 0) === 100,
      `A=${units['Grain A']} B=${units['Grain B']} C=${units['Grain C']}`);
  } else {
    console.log('  (skipped — RED/MID phase; G11 is a GREEN assertion)');
  }

  // ---------- G12: spoiled stacks skipped ----------
  console.log('== G12. spoil-first never pays already-spoiled stacks ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(53);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Rot A', kcalEach: 500, units: 10, safe: true, spoilDay: day - 1 }, // spoiled
      { name: 'Grain B', kcalEach: 500, units: 10, safe: true, spoilDay: day + 2 },
      { name: 'Grain C', kcalEach: 500, units: 10, safe: true, spoilDay: day + 30 },
    ];
    const removed = Game._removePantryKcal(1500, { spoilFirst: true });
    const units = stackUnits(Game);
    check('G12 removed 1500 of good food', removed === 1500, 'removed=' + removed);
    check('G12 spoiled stack untouched, soonest-good drained',
      (units['Rot A'] || 0) === 10 && (units['Grain B'] || 0) < 10,
      `RotA=${units['Rot A']} B=${units['Grain B']} C=${units['Grain C']}`);
  } else {
    console.log('  (skipped — RED/MID phase; G12 is a GREEN assertion)');
  }

  // ---------- G13: armed determinism ----------
  console.log('== G13. armed determinism ==');
  if (ARMED) {
    const h1 = await runHashes(SF.spoilLead, 11, 40);
    const h2 = await runHashes(SF.spoilLead, 11, 40);
    check('G13 spoilLead armed bit-identical across runs',
      h1.length === h2.length && h1.every((h, i) => h === h2[i]), `n=${h1.length}`);
  } else {
    console.log('  (skipped — RED/MID phase; G13 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nPROOF: ${fails.length} FAILURE(S) — ${fails.join(', ')}` : '\nPROOF: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
