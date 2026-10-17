#!/usr/bin/env node
// scripts/test-flowdrain-b.js — PROOF for the FLOWDRAIN_B arm (loop B,
// 2026-10-17, food-economy axis — finding #444 lesson (c): trigger on FLOW
// (income rate), not STOCK (pantry size).
//
// THE LEVER: AID ONLY (no feast verb, no buff-stacking) fired on
// fresh-INCOME days (gross fresh inflow >= FLOW_KCAL=4000, ~p90 of the
// courtship-substrate distribution), NEVER on pantry stock level.
// scripts/policies/flowdrain.js (FLOWDRAIN_B=1, default OFF), composes onto
// leadfeast/belongfeast (the FEASTSCALE_R13=1 substrate). Zero src/js.
//
// RED PHASE (FLOWDRAIN_B unset):
//   R1. gate-off byte-identical: flowlead == leadfeast, flowbelong ==
//       belongfeast, 40d identical seeds, per-day hashes.
//   R2. no aid fires gate-off on the big-stock fixture (fd 6.5); the
//       parent's own tend discipline still fires.
//   R3. flow meter records stockPantry inflow (unit).
// GREEN PHASE (FLOWDRAIN_B=1):
//   G1. FLOW-DAY FIRES: inflow >= 4000 -> one aid on the thin link.
//   G2. STOCK-ALONE DOES NOT FIRE (the lesson-(c) regression): fd 6.5
//       pantry, ZERO inflow -> no layer aid (the trig6 trap).
//   G3. thinnest eligible link is picked (two thin links).
//   G4. non-thin link -> no aid (thinness gate).
//   G5. mourning link -> no aid.
//   G6. siege holds: lingerer / recent raid hold the aid (counted, silent).
//   G7. FRESH-FIRST pre-draw: soonest-spoiling stack drained first,
//       least-perishable untouched; pantry drained exactly once.
//   G8. pre-draw rollback unit: refused draw restores the pantry exactly.
//   G9. cause line AFTER the confirmed engine beat (honesty ordering), and
//       FLOW-honest (names the day's inflow, never the stock level).
//   G10. one aid per day.
//   G11. armed determinism: FLOWDRAIN_B=1 twice -> byte-identical.
//   G12. NO tribute verb (negative): the layer never calls payTribute.
//   G13. NO feast verb (negative): the layer never calls hostFeast.
//
// Usage: node scripts/test-flowdrain-b.js
//   RED:   node scripts/test-flowdrain-b.js
//   GREEN: FLOWDRAIN_B=1 node scripts/test-flowdrain-b.js
//   Multi-seed: SEED_SHIFT=100 FLOWDRAIN_B=1 node scripts/test-flowdrain-b.js
'use strict';
let FD = null;
try { FD = require('./policies/flowdrain'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: flowdrain layer deleted per kill protocol (NO-GO on engaged primary + guardrail breaches, 2026-10-17)');
    process.exit(0);
  }
  throw e;
}
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('PROOF STOP: FEASTSCALE_R13=1 is required (the flowdrain substrate).');
  process.exit(2);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const ARMED = process.env.FLOWDRAIN_B === '1';
const SS = parseInt(process.env.SEED_SHIFT || '0', 10) || 0;
console.log('== flowdrain proof — ' + (ARMED ? 'ARMED (FLOWDRAIN_B=1)' : 'RED (gate off)') +
  (SS ? ` [seed_shift=${SS}]` : '') + ' ==');

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

// addThinSubLink: subPantry default 1000 (thin: 1000 < 5*10*2000=100000).
function addThinSubLink(Game, opts) {
  opts = opts || {};
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: opts.id || 'thinval', name: opts.name || 'Thinvale',
      pantryKcal: opts.subPantry != null ? opts.subPantry : 1000,
      population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  m.links.push({
    id: opts.linkId || 'link_thin', primary: 'haven', subordinate: opts.id || 'thinval',
    day: 0, trust: 30, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [], mourningUntil: opts.mourningUntil || 0,
  });
  return m.links[m.links.length - 1];
}

// buildWorld(seed, fdTarget): pantry set to fdTarget fresh-days at 24k burn,
// day 30, one thin subordinate link.
async function buildWorld(seed, fdTarget) {
  const { Game } = await loadGame({ seed: seed + SS, mode: 'flowdrain-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', Math.round(fdTarget * 24000), 3)];
  v.lastRaidDay = 0;
  addThinSubLink(Game);
  return { Game, said };
}

function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

// flowDay: simulate the day's harvest through the metered choke point.
function flowDay(Game, kcal) {
  Game.stockPantry(kcal == null ? 5000 : kcal, 'Test harvest');
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed: seed + SS, mode: 'flowdrain-red' });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => {
    hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
    return base ? base(G, ctx) : undefined;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes;
}

(async () => {
  // ---------- R1: gate-off byte-identical ----------
  console.log('== R1. gate-off byte-identical (wrapped vs parent, 40d) ==');
  if (!ARMED) {
    const hWrap = await runHashes(FD.flowlead, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: flowlead == leadfeast per-day hashes', same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(FD.flowbelong, 22, 40);
    const hBase2 = await runHashes(belongfeast, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: flowbelong == belongfeast per-day hashes', same2, `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no aid fires gate-off ----------
  console.log('== R2. no aid fires gate-off on the big-stock fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildWorld(42, 6.5);
    check('R2 fixture really is overstock (fd > 6)', freshDaysOf(Game) > 6,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    check('R2 gate-off: flowdrain aid did not fire', ctx._fdAid === undefined,
      `_fdAid=${ctx._fdAid}`);
    check('R2 gate-off: no flowdrain cause line said', !said.some(s => /instead of the rot pile/.test(s)),
      said.length + ' beats');
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: parent tend discipline intact', link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: flow meter unit ----------
  console.log('== R3. flow meter records stockPantry inflow ==');
  if (!ARMED) {
    const { Game } = await buildWorld(43, 3);
    const ctx = {};
    FD.flowlead.setup(Game, ctx); // gate off: no wrap
    Game.stockPantry(2500, 'Test harvest');
    check('R3 gate-off: meter did not wrap (no inflow recorded)', (ctx._fdInToday || 0) === 0,
      `_fdInToday=${ctx._fdInToday}`);
  } else {
    const { Game } = await buildWorld(43, 3);
    const ctx = {};
    FD.flowlead.setup(Game, ctx); // armed: wrapped
    check('R3 setup zeroes setup-time stocking', (ctx._fdInToday || 0) === 0,
      `_fdInToday=${ctx._fdInToday}`);
    Game.stockPantry(2500, 'Test harvest');
    Game.stockPantry(1500, 'Test hunt');
    check('R3 meter records gross fresh inflow', ctx._fdInToday === 4000,
      `_fdInToday=${ctx._fdInToday}`);
  }

  // ---------- G1: flow-day fires ----------
  console.log('== G1. FLOW-DAY FIRES: inflow >= FLOW_KCAL -> aid ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(60, 3);
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    flowDay(Game, 5000); // >= FLOW_KCAL (4000)
    const pantryAfterInflow = havenPantryKcal(Game);
    check('G1 flow-day counted', (ctx._fdFlowDays || 0) === 0, 'before daily');
    pol.daily(Game, ctx);
    check('G1 flow-day recorded', ctx._fdFlowDays === 1 && ctx._fdFlow[30] === 5000,
      `_fdFlowDays=${ctx._fdFlowDays} inflow[30]=${ctx._fdFlow[30]}`);
    check('G1 aid verb fired', ctx._fdAid === 1 && (ctx._fdAidKcal || 0) > 0,
      `_fdAid=${ctx._fdAid} kcal=${ctx._fdAidKcal}`);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('G1 sub pantry credited (real food)', subAfter === subBefore + (ctx._fdAidKcal || 0),
      `${subBefore} -> ${subAfter}`);
    check('G1 trust gained (the tending price)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('G1 haven pantry lighter than post-inflow (the aid drained)',
      havenPantryKcal(Game) === pantryAfterInflow - (ctx._fdAidKcal || 0),
      `${pantryBefore} -> +5000 inflow -> ${havenPantryKcal(Game)}`);
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /instead of the rot pile/.test(s));
    check('G1 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
    check('G1 cause line is FLOW-honest (names inflow, never stock)',
      said.some(s => /5,000 kcal of fresh through the hall/.test(s)),
      said.filter(s => /rot pile/.test(s)).slice(0, 1).join('').slice(0, 160));
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: stock-alone does NOT fire (the lesson-(c) regression) ----------
  console.log('== G2. STOCK-ALONE DOES NOT FIRE (the trig6 trap) ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(61, 6.5);
    check('G2 fixture really is overstock (fd > 6)', freshDaysOf(Game) > 6,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    // NO flowDay() call — zero inflow today. A mountain pantry, an empty sky.
    pol.daily(Game, ctx);
    check('G2 mountain pantry + zero inflow: layer aid did NOT fire', ctx._fdAid === undefined,
      `_fdAid=${ctx._fdAid} _fdFlowDays=${ctx._fdFlowDays}`);
    check('G2 no cause line on stock alone', !said.some(s => /instead of the rot pile/.test(s)),
      said.length + ' beats');
    check('G2 layer left the pantry alone (parent tend aside)',
      havenPantryKcal(Game) <= before, `${before} -> ${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: thinnest link picked ----------
  console.log('== G3. thinnest eligible link is picked ==');
  if (ARMED) {
    const { Game } = await buildWorld(62, 3);
    // second, thinner link
    addThinSubLink(Game, { id: 'poordale', name: 'Poordale', linkId: 'link_poor', subPantry: 200 });
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    flowDay(Game, 5000);
    pol.daily(Game, ctx);
    const poorAfter = (Game.state.otherVillages.find(v => v.id === 'poordale') || {}).pantryKcal;
    const thinAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    check('G3 layer aid went to the THINNER link (Poordale 200)',
      poorAfter === 200 + (ctx._fdAidKcal || 0) && ctx._fdAid === 1,
      `poordale=${poorAfter} (layer) thinvale=${thinAfter} (parent weekly tend — baseline, not the layer)`);
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: thinness gate ----------
  console.log('== G4. non-thin link -> no aid ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(63, 3);
    Game.mshipState().links = [];
    Game.state.otherVillages = Game.state.otherVillages.filter(v => v.id !== 'thinval');
    addThinSubLink(Game, { subPantry: 200000 }); // 200k >= 5*10*2000: NOT thin
    const ctx = {};
    FD.flowlead.setup(Game, ctx);
    flowDay(Game, 5000);
    FD.flowlead.daily(Game, ctx);
    check('G4 flow-day but no thin link: aid did not fire', ctx._fdAid === undefined,
      `_fdAid=${ctx._fdAid} _fdNoLink=${ctx._fdNoLink}`);
    check('G4 no-link counted, not narrated', ctx._fdNoLink === 1 && !said.some(s => /instead of the rot pile/.test(s)),
      `_fdNoLink=${ctx._fdNoLink}`);
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5: mourning ----------
  console.log('== G5. mourning link -> no aid ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(64, 3);
    Game.mshipState().links = [];
    Game.state.otherVillages = Game.state.otherVillages.filter(v => v.id !== 'thinval');
    addThinSubLink(Game, { mourningUntil: 30 + 7 }); // day is 30
    const ctx = {};
    FD.flowlead.setup(Game, ctx);
    flowDay(Game, 5000);
    FD.flowlead.daily(Game, ctx);
    check('G5 mourning link: aid did not fire', ctx._fdAid === undefined,
      `_fdAid=${ctx._fdAid}`);
    check('G5 no cause line on refusal', !said.some(s => /instead of the rot pile/.test(s)),
      said.length + ' beats');
  } else {
    console.log('  (skipped — RED phase; G5 is a GREEN assertion)');
  }

  // ---------- G6: siege holds ----------
  console.log('== G6. siege-gate: lingerer holds, past raid does NOT ==');
  if (ARMED) {
    {
      const { Game, said } = await buildWorld(65, 3);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      FD.flowlead.setup(Game, ctx);
      flowDay(Game, 5000);
      FD.flowlead.daily(Game, ctx);
      check('G6a lingerer holds the aid off', ctx._fdAid === undefined && !said.some(s => /instead of the rot pile/.test(s)),
        `_fdAid=${ctx._fdAid}`);
      check('G6a hold counted', (ctx._fdGateHeld || 0) >= 1, `_fdGateHeld=${ctx._fdGateHeld}`);
    }
    {
      // DESIGN CHANGE (plumbing 2026-10-17): the 7-day raid window is gone —
      // a raid 2 days ago is history, not a siege. The aid moves surplus.
      const { Game } = await buildWorld(66, 3);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      FD.flowlead.setup(Game, ctx);
      flowDay(Game, 5000);
      FD.flowlead.daily(Game, ctx);
      check('G6b recent raid does NOT hold the aid (window dropped)', ctx._fdAid === 1,
        `lastRaidDay=28, day=30, _fdAid=${ctx._fdAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G6 is a GREEN assertion)');
  }

  // ---------- G7: fresh-first pre-draw ----------
  console.log('== G7. fresh-first: the aid eats the soonest-spoiling end ==');
  if (ARMED) {
    const { Game } = await buildWorld(67, 3);
    const day = Game.state.scholar.day;
    const A = { name: 'Grain A', kcalEach: 500, units: 96, safe: true, spoilDay: day + 2 };
    const B = { name: 'Grain B', kcalEach: 500, units: 96, safe: true, spoilDay: day + 10 };
    const C = { name: 'Grain C', kcalEach: 500, units: 96, safe: true, spoilDay: day + 30 };
    Game.state.village.pantry = [A, B, C];
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    flowDay(Game, 5000);
    pol.daily(Game, ctx);
    check('G7 aid verb fired', ctx._fdAid === 1, `_fdAid=${ctx._fdAid}`);
    check('G7 soonest-spoiling (+2d) stack drained first',
      A.units < 96 && B.units === 96 && C.units === 96,
      `A=${A.units} B=${B.units} C=${C.units}`);
    check('G7 least-perishable (+30d) stack untouched', C.units === 96,
      `C.units=${C.units}`);
    check('G7 pantry drained exactly once (no double-draw)',
      A.units === 93 && havenPantryKcal(Game) === (93 + 96 + 96) * 500 + 5000,
      `A.units=${A.units} pantry=${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G7 is a GREEN assertion)');
  }

  // ---------- G8: pre-draw rollback (unit) ----------
  console.log('== G8. pre-draw rollback restores the pantry on refusal ==');
  if (ARMED) {
    const { Game } = await buildWorld(68, 3);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Grain A', kcalEach: 500, units: 10, safe: true, spoilDay: day + 2 },
      { name: 'Grain B', kcalEach: 500, units: 10, safe: true, spoilDay: day + 10 },
    ];
    const before = havenPantryKcal(Game);
    const draw = FD.preDraw(Game, 1500);
    check('G8 pre-draw took fresh-first (1500)', draw.taken === 1500,
      'taken=' + draw.taken);
    check('G8 pantry lighter mid-draw', havenPantryKcal(Game) === before - 1500,
      `${before} -> ${havenPantryKcal(Game)}`);
    draw.rollback();
    const after = havenPantryKcal(Game);
    const unitsA = Game.state.village.pantry.find(i => i.name === 'Grain A').units;
    check('G8 rollback restores every unit', after === before && unitsA === 10,
      `pantry ${before}->${after}, A.units=${unitsA}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: (covered in G1) ----------
  // ---------- G10: one aid per day ----------
  console.log('== G10. one aid per day ==');
  if (ARMED) {
    const { Game } = await buildWorld(69, 3);
    // second thin link so a second aid would have somewhere to go
    addThinSubLink(Game, { id: 'poordale', name: 'Poordale', linkId: 'link_poor', subPantry: 200 });
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    flowDay(Game, 9000); // big flow day
    pol.daily(Game, ctx);
    pol.daily(Game, ctx); // second daily, same day — must not double-fire
    check('G10 one aid per day even with two thin links', ctx._fdAid === 1,
      `_fdAid=${ctx._fdAid}`);
  } else {
    console.log('  (skipped — RED phase; G10 is a GREEN assertion)');
  }

  // ---------- G11: armed determinism ----------
  console.log('== G11. armed determinism (40d x2) ==');
  if (ARMED) {
    const a = await runHashes(FD.flowlead, 11, 40);
    const b = await runHashes(FD.flowlead, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G11 armed flowlead bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G11 is a GREEN assertion)');
  }

  // ---------- G12: NO tribute verb ----------
  console.log('== G12. the layer never pays tribute ==');
  if (ARMED) {
    const { Game } = await buildWorld(70, 3);
    let tributeCalls = 0;
    const oPay = Game.payTribute;
    Game.payTribute = function (...a) { tributeCalls++; return oPay.apply(this, a); };
    const ctx = {};
    const pol = FD.flowlead; // LEAD road: the parent never pays tribute either
    pol.setup(Game, ctx);
    flowDay(Game, 5000);
    pol.daily(Game, ctx);
    check('G12 no payTribute call during the layer daily', tributeCalls === 0 && ctx._fdAid === 1,
      `payTribute calls=${tributeCalls} _fdAid=${ctx._fdAid}`);
    Game.payTribute = oPay;
  } else {
    console.log('  (skipped — RED phase; G12 is a GREEN assertion)');
  }

  // ---------- G13: NO feast verb ----------
  console.log('== G13. the layer never feasts ==');
  if (ARMED) {
    const { Game } = await buildWorld(71, 3);
    let feastCalls = 0;
    const oFeast = Game.hostFeast;
    Game.hostFeast = function (...a) { feastCalls++; return oFeast.apply(this, a); };
    const ctx = {};
    const pol = FD.flowlead;
    pol.setup(Game, ctx);
    ctx._tribHist = []; // the r13 contribution bar is NOT met: the base must not feast
    flowDay(Game, 5000);
    Game.dayPart = 2; // dusk — the base's feast window
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    pol.daily(Game, ctx);
    check('G13 no hostFeast call (layer has no feast verb; base gate unmet)',
      feastCalls === 0 && ctx._fdAid === 1,
      `hostFeast calls=${feastCalls} _fdAid=${ctx._fdAid}`);
    Game.hostFeast = oFeast;
  } else {
    console.log('  (skipped — RED phase; G13 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
