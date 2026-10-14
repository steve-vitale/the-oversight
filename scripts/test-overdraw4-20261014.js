#!/usr/bin/env node
// scripts/test-overdraw4-20261014.js — PROOF for the OVERDRAW4 arm (loop B,
// 2026-10-14, food-economy axis — sim-findings #199, re-claim).
//
// THE LEVER: fresh-first overstock drawdown, tribute timing UNTOUCHED.
// sim-overdraw3 proved the fresh-first mechanism (0.517 absolute / 0.567
// per-day-alive) but was KILLED because the tribute verb's early-payment
// timing starved 2 belong-road villages. This arm drops the tribute verb
// entirely: priority AID (thin subordinate, fresh-first pre-draw) > FEAST
// (hostFeast under the r13 allowance gates + the overdraw floor); tribute
// runs on the base discipline's own rhythm, never early, never from this
// layer.
//
// RED PHASE (OVERDRAW4 unset):
//   R1. gate-off byte-identical: overdraw4-wrapped policy vs parent policy,
//       identical seeds, 40 days — per-day state hashes identical.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture.
//   R3. NAIVE RED (the mechanism's foil): Game._removePantryKcal drains the
//       LEAST-perishable end first — proves the G10 fixture discriminates.
// GREEN PHASE (OVERDRAW4=1):
//   G1. AID fires on a thin untended subordinate (real 1500 aid credit,
//       trust gain, honest beats, floor respected, pantry drained once).
//   G2/G3/G4. siege-gate: lingerer / recent-raid / gorge-night hold ALL verbs off.
//   G5. floor math: maxDrawdownKcal = fresh - 2*burn (unit).
//   G5b. pre-draw rollback unit: a refused pre-draw restores the pantry.
//   G6. FEAST fires when no aid channel (r13 gates, overdraw floor, cause narrated).
//   G7. TRIBUTE UNTOUCHED (the arm's negative assertion): with an owed
//       belong-side link on an overstock pantry, the layer NEVER pays
//       tribute early — no osTribute counter, no early-tribute cause line,
//       the belong-side link is not an aid channel either.
//   G8. priority: aid > feast (one verb/day), in BOTH call orders (the
//       harness runs the dusk upkeep BEFORE the end-of-day daily, so the
//       feast must yield when an aid channel exists).
//   G9. armed determinism: OVERDRAW4=1 twice, identical seeds -> identical.
//   G10. FRESH-FIRST ORDERING (the arm's mechanism — RED failure if the
//       drawdown does not drain the soonest-spoiling end first): a 3-stack
//       fixture (spoilDay +2/+10/+30) loses units from the +2 stack, not the
//       +30 stack; the pantry is drained exactly once.
//
// Policy-side only: no src/js changes.
//
// Usage: node scripts/test-overdraw4-20261014.js
//   RED:   node scripts/test-overdraw4-20261014.js   (R1/R2/R3 must PASS;
//          G1-G10 skipped)
//   GREEN: OVERDRAW4=1 node scripts/test-overdraw4-20261014.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let OVER = null;
try { OVER = require('./policies/overdraw4'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdraw4 layer deleted per kill protocol');
    process.exit(0);
  }
  throw e;
}
const { leadcourt } = require('./policies/leadcourt');
const { belongseek } = require('./policies/belongseek');

const ARMED = process.env.OVERDRAW4 === '1';
console.log('== overdraw4 proof — ' + (ARMED ? 'ARMED (OVERDRAW4=1)' : 'RED (gate off)') + ' ==');

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
  const { Game } = await loadGame({ seed, mode: 'overdraw4-proof' });
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
  const { Game } = await loadGame({ seed, mode: 'overdraw4-red' });
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
    const hWrap = await runHashes(OVER.overlead4, 11, 40);
    const hBase = await runHashes(leadcourt, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: overlead4 == leadcourt per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(OVER.overbelong4, 22, 40);
    const hBase2 = await runHashes(belongseek, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: overbelong4 == belongseek per-day hashes',
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
    const pol = OVER.overlead4;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: overdraw4 aid verb did not fire', ctx.osAid === undefined,
      `osAid=${ctx.osAid}`);
    check('R2 gate-off: no overdraw4 cause line said', !said.some(s => /not the rot|the mountain tonight/.test(s)),
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
    // 3 stacks, same kcal, different perishability: +2d (soonest), +10d, +30d
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
  console.log('== G1. AID fires on a thin untended subordinate ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(42);
    const ctx = {};
    const pol = OVER.overlead4;
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
    check('G1 cause line narrated AFTER the confirmed verb',
      said.some(s => /not the rot/.test(s)),
      said.filter(s => /not the rot/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G1 tend beat still says the fiction (engine beat intact)',
      said.some(s => /Haven sends .* kcal of grain to Thinvale/.test(s)));
    check('G1 floor respected (fresh-days still >= 2 after)',
      freshDaysOf(Game) >= 2, 'freshDays=' + freshDaysOf(Game).toFixed(1));
    check('G1 one verb per day marked', ctx._osFired === 30, '_osFired=' + ctx._osFired);
    // cause line must come AFTER the engine's tend beat, not before
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
      OVER.overlead4.setup(Game, ctx);
      OVER.overlead4.daily(Game, ctx);
      check('G2 lingerer holds verbs off', ctx.osAid === undefined && !said.some(s => /not the rot/.test(s)),
        `osAid=${ctx.osAid}`);
      check('G2 gate-hold counted', (ctx.osGateHeld || 0) >= 1, 'osGateHeld=' + ctx.osGateHeld);
    }
    {
      const { Game } = await buildOverstockWorld(44);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      OVER.overlead4.setup(Game, ctx);
      OVER.overlead4.daily(Game, ctx);
      check('G3 recent raid holds verbs off', ctx.osAid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildOverstockWorld(45);
      const ctx = {};
      OVER.overlead4.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      OVER.overlead4.daily(Game, ctx);
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
    const draw = OVER.preDraw(Game, 1500);
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
  console.log('== G6. FEAST fires when no aid channel ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(47);
    Game.mshipState().links = []; // no subordinate links -> no aid channel
    Game.dayPart = 2; // dusk
    const ctx = {};
    const pol = OVER.overlead4;
    pol.setup(Game, ctx);
    const day = Game.state.scholar.day;
    ctx._od4Hist = [{ day: day - 1, kcal: 2000 }];
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

  // ---------- G7: TRIBUTE UNTOUCHED (the arm's negative assertion) ----------
  console.log('== G7. tribute timing untouched — the layer never pays early ==');
  if (ARMED) {
    const { Game, said } = await buildOverstockWorld(48);
    // keep the thin link (aid channel exists) AND add the owed belong link
    addOwedTributeLink(Game);
    const ctx = {};
    const pol = OVER.overbelong4;
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
    { // order A: daily then upkeep (the proof order)
      const { Game } = await buildOverstockWorld(49);
      Game.dayPart = 2;
      const ctx = {};
      const pol = OVER.overlead4;
      pol.setup(Game, ctx);
      ctx._od4Hist = [{ day: 29, kcal: 2000 }];
      pol.daily(Game, ctx);   // aid should fire (priority 1)
      pol.upkeep(Game, ctx);  // feast must NOT (already fired today)
      check('G8a daily->upkeep: aid wins the day', ctx.osAid === 1 && ctx.osFeasts === undefined,
        `osAid=${ctx.osAid} osFeasts=${ctx.osFeasts}`);
    }
    { // order B: upkeep then daily (the harness's real order — dusk before end-of-day)
      const { Game } = await buildOverstockWorld(50);
      Game.dayPart = 2;
      const ctx = {};
      const pol = OVER.overlead4;
      pol.setup(Game, ctx);
      ctx._od4Hist = [{ day: 29, kcal: 2000 }];
      pol.upkeep(Game, ctx);  // feast must YIELD (aid channel exists)
      pol.daily(Game, ctx);   // aid fires
      check('G8b upkeep->daily: feast yields to the aid channel, aid fires',
        ctx.osAid === 1 && ctx.osFeasts === undefined,
        `osAid=${ctx.osAid} osFeasts=${ctx.osFeasts}`);
    }
    { // no aid channel -> feast still fires in real order
      const { Game } = await buildOverstockWorld(51);
      Game.mshipState().links = [];
      Game.dayPart = 2;
      const ctx = {};
      const pol = OVER.overlead4;
      pol.setup(Game, ctx);
      ctx._od4Hist = [{ day: 29, kcal: 2000 }];
      pol.upkeep(Game, ctx);
      pol.daily(Game, ctx);
      check('G8c no aid channel: feast fires', ctx.osFeasts === 1,
        `osFeasts=${ctx.osFeasts} osAid=${ctx.osAid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: armed determinism ----------
  console.log('== G9. armed determinism (det-gate, 40d x2) ==');
  if (ARMED) {
    const a = await runHashes(OVER.overlead4, 11, 40);
    const b = await runHashes(OVER.overlead4, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G9 armed overlead4 bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  // ---------- G10: FRESH-FIRST ORDERING ----------
  console.log('== G10. fresh-first ordering: the drawdown eats the soonest-spoiling end ==');
  if (ARMED) {
    const { Game } = await buildOverstockWorld(53);
    const day = Game.state.scholar.day;
    // 3 stacks, same kcal (48k each = 6 fresh-days at 24k burn, still overstock),
    // different perishability. Units big enough that the +2d stack alone covers
    // the 1500 aid draw.
    const A = { name: 'Grain A', kcalEach: 500, units: 96, safe: true, spoilDay: day + 2 };
    const B = { name: 'Grain B', kcalEach: 500, units: 96, safe: true, spoilDay: day + 10 };
    const C = { name: 'Grain C', kcalEach: 500, units: 96, safe: true, spoilDay: day + 30 };
    Game.state.village.pantry = [A, B, C];
    check('G10 fixture still overstock (trigger > 4)', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = OVER.overlead4;
    pol.setup(Game, ctx);
    pol.daily(Game, ctx);
    check('G10 aid verb fired', ctx.osAid === 1, `osAid=${ctx.osAid}`);
    check('G10 soonest-spoiling (+2d) stack drained first',
      A.units < 96 && B.units === 96 && C.units === 96,
      `A=${A.units} B=${B.units} C=${C.units}`);
    check('G10 least-perishable (+30d) stack untouched', C.units === 96,
      `C.units=${C.units}`);
    // Exact-draw check: 1500 kcal aid = exactly 3 x 500-kcal units from the
    // soonest stack (ceil, no fractionating). A second draw — or the old
    // _removePantryKcal routing — would show in C.units, which must be 96.
    check('G10 pantry drained exactly once (no double-draw)',
      A.units === 93 && C.units === 96,
      `A.units=${A.units} C.units=${C.units} pantry=${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G10 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
