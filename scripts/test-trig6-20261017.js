#!/usr/bin/env node
// scripts/test-trig6-20261017.js — PROOF for the TRIG6 arm (loop B,
// 2026-10-16/17, food-economy axis — sim-findings #200 named next).
//
// THE LEVER: the killed overdraw4 drawdown vehicle rebuilt with the
// sim-floorday3-b autopsy: NO floor (dead — provably near-vacuous), NO
// fragility gate, and the overstock TRIGGER LIFTED to pantry fresh-days > 6.
// The sibling sim-drawcap-b tests the volume-cap form; this arm tests the
// trigger form — no cap.
//
// RED PHASE (TRIG6 unset):
//   R1. gate-off byte-identical: trig6lead == leadfeast, trig6belong ==
//       belongfeast, 40d identical seeds, per-day hashes.
//   R2. no verbs fire gate-off, even on a constructed overstock fixture
//       (fd > 6); the parent's own tend discipline still fires.
//   R3. NAIVE RED (the mechanism's foil): Game._removePantryKcal drains the
//       LEAST-perishable end first — proves the G13 fixture discriminates.
// GREEN PHASE (TRIG6=1):
//   G1. TRIGGER DISCRIMINATION: aid does not fire at fd 5.x, fires at
//       fd 6.x and 7.x (the lifted trigger is the dial).
//   G2. AID fires on a thin untended subordinate (real 1500 aid credit,
//       trust gain, cause line AFTER the confirmed engine beat, one verb/day).
//   G3. AID refuses a NON-thin subordinate (sub pantry >= 5d of need) — the
//       thinness gate, no cause line, no draw.
//   G4. AID refuses a mourning link (no cause line, no draw).
//   G5/G6/G7. siege-gate: lingerer / recent-raid / gorge-night hold ALL
//       verbs off (holds counted, no cause lines).
//   G8. pre-draw rollback unit: a refused pre-draw restores the pantry.
//   G9. FEAST fires when no aid channel (r13 gates, lifted trigger, cause
//       narrated; the base's own feast suppressed so the layer's verb alone
//       is measured); drains natively fresh-first (soonest stack).
//   G9b. FEAST does not fire at fd 5.x (trigger discrimination, feast side).
//   G10. TRIBUTE UNTOUCHED (the arm's negative assertion): with an owed
//       belong-side link on an overstock pantry, the layer NEVER pays
//       tribute early — no t6Tribute counter, no early-tribute cause line.
//   G11. priority: aid > feast (one verb/day), in BOTH call orders.
//   G12. armed determinism: TRIG6=1 twice, identical seeds -> identical.
//   G13. FRESH-FIRST ORDERING (aid): a 3-stack fixture loses units from the
//       +2d stack, not the +30d stack; the pantry is drained exactly once.
//   G14. mechanism instrument: recordDay counts fd>6 and fd>4 days.
//
// Policy-side only: no src/js changes.
//
// Usage: node scripts/test-trig6-20261017.js
//   RED:   node scripts/test-trig6-20261017.js   (R1/R2/R3 must PASS;
//          G1-G14 skipped)
//   GREEN: TRIG6=1 node scripts/test-trig6-20261017.js
//   Multi-seed: SEED_SHIFT=100 TRIG6=1 node scripts/test-trig6-20261017.js
'use strict';
let T6 = null;
try { T6 = require('./policies/trig6'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: trig6 layer deleted per kill protocol (NO-GO on engaged co-primary, 2026-10-17)');
    process.exit(0);
  }
  throw e;
}
if (process.env.FEASTSCALE_R13 !== '1') {
  console.error('PROOF STOP: FEASTSCALE_R13=1 is required (the trig6 substrate).');
  process.exit(2);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const ARMED = process.env.TRIG6 === '1';
const SS = parseInt(process.env.SEED_SHIFT || '0', 10) || 0;
console.log('== trig6 proof — ' + (ARMED ? 'ARMED (TRIG6=1)' : 'RED (gate off)') +
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

// addThinSubLink: the lineage fixture. subPantry default 1000 (thin:
// 1000 < 5 * 10 * 2000 = 100000). Pass {subPantry: 200000} for non-thin.
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

// buildWorld(seed, fdTarget): pantry set to fdTarget fresh-days at 24k burn.
async function buildWorld(seed, fdTarget) {
  const { Game } = await loadGame({ seed: seed + SS, mode: 'trig6-proof' });
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

// feastFixture: the floorday3 convention — the base's own (r13) feast is
// suppressed via its cadence tracker so the LAYER's verb alone is measured.
function feastFixture(Game, ctx) {
  Game.mshipState().links = []; // no subordinate links -> no aid channel
  Game.dayPart = 2; // dusk
  const day = Game.state.scholar.day;
  ctx._fsLastFeastDay = day; // block the base's own feast
  ctx._tribHist = [{ day: day - 1, kcal: 2000 }]; // the r13 contribution bar
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed: seed + SS, mode: 'trig6-red' });
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
    const hWrap = await runHashes(T6.trig6lead, 11, 40);
    const hBase = await runHashes(leadfeast, 11, 40);
    const same = hWrap.length === hBase.length && hWrap.every((h, i) => h === hBase[i]);
    check('R1 gate-off: trig6lead == leadfeast per-day hashes',
      same, `n=${hWrap.length}/${hBase.length}`);
    const hWrap2 = await runHashes(T6.trig6belong, 22, 40);
    const hBase2 = await runHashes(belongfeast, 22, 40);
    const same2 = hWrap2.length === hBase2.length && hWrap2.every((h, i) => h === hBase2[i]);
    check('R1 gate-off: trig6belong == belongfeast per-day hashes',
      same2, `n=${hWrap2.length}/${hBase2.length}`);
  } else {
    console.log('  (skipped — armed phase; R1 is a RED assertion)');
  }

  // ---------- R2: no verbs fire gate-off ----------
  console.log('== R2. no verbs fire gate-off on the overstock fixture ==');
  if (!ARMED) {
    const { Game, said } = await buildWorld(42, 6.5);
    check('R2 fixture really is overstock (fd > 6)', freshDaysOf(Game) > 6,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('R2 gate-off: trig6 aid verb did not fire', ctx.t6Aid === undefined,
      `t6Aid=${ctx.t6Aid}`);
    check('R2 gate-off: no trig6 cause line said', !said.some(s => /not the rot|the mountain tonight/.test(s)),
      said.length + ' beats');
    check('R2 gate-off: parent tend discipline intact', link.tendedWeek === Game._week(),
      `pantry ${before}->${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — armed phase; R2 is a RED assertion)');
  }

  // ---------- R3: NAIVE RED — the foil ----------
  console.log('== R3. naive RED: _removePantryKcal drains the least-perishable end ==');
  if (!ARMED) {
    const { Game } = await buildWorld(42, 6.5);
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

  // ---------- G1: trigger discrimination ----------
  console.log('== G1. trigger discrimination: 5.x HOLDS, 6.x/7.x FIRE ==');
  if (ARMED) {
    for (const [fd, expect] of [[5.2, false], [6.5, true], [7.1, true]]) {
      const { Game } = await buildWorld(60 + Math.round(fd * 10), fd);
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      T6.trig6lead.daily(Game, ctx);
      const fired = ctx.t6Aid === 1;
      check(`G1 fd=${fd.toFixed(1)}: aid ${expect ? 'FIRES' : 'HELD'}`,
        fired === expect, `freshDays=${freshDaysOf(Game).toFixed(2)} t6Aid=${ctx.t6Aid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G1 is a GREEN assertion)');
  }

  // ---------- G2: AID fires ----------
  console.log('== G2. AID fires on a thin untended subordinate ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(42, 6.5);
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    const subBefore = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustBefore = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    const pantryBefore = havenPantryKcal(Game);
    pol.daily(Game, ctx);
    const subAfter = (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal;
    const trustAfter = Game.mshipState().links.find(l => l.id === 'link_thin').trust;
    check('G2 aid verb fired', ctx.t6Aid === 1 && (ctx.t6AidKcal || 0) > 0,
      `t6Aid=${ctx.t6Aid} kcal=${ctx.t6AidKcal}`);
    check('G2 sub pantry credited (subaid channel, real food)',
      subAfter === subBefore + (ctx.t6AidKcal || 0),
      `${subBefore} -> ${subAfter}`);
    check('G2 trust gained (tending, not free)', trustAfter > trustBefore,
      `${trustBefore} -> ${trustAfter}`);
    check('G2 haven pantry lighter', havenPantryKcal(Game) < pantryBefore,
      `${pantryBefore} -> ${havenPantryKcal(Game)}`);
    check('G2 cause line narrated AFTER the confirmed verb',
      said.some(s => /not the rot/.test(s)),
      said.filter(s => /not the rot/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G2 tend beat still says the fiction (engine beat intact)',
      said.some(s => /Haven sends .* kcal of grain to Thinvale/.test(s)));
    check('G2 one verb per day marked', ctx._t6Fired === 30, '_t6Fired=' + ctx._t6Fired);
    const tendIx = said.findIndex(s => /Haven sends .* kcal of grain to Thinvale/.test(s));
    const causeIx = said.findIndex(s => /not the rot/.test(s));
    check('G2 cause line follows the engine beat (honesty ordering)',
      tendIx >= 0 && causeIx >= 0 && causeIx > tendIx, `tend@${tendIx} cause@${causeIx}`);
  } else {
    console.log('  (skipped — RED phase; G2 is a GREEN assertion)');
  }

  // ---------- G3: thinness gate ----------
  console.log('== G3. AID refuses a NON-thin subordinate ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(43, 6.5);
    Game.mshipState().links = [];
    Game.state.otherVillages = Game.state.otherVillages.filter(v => v.id !== 'thinval');
    addThinSubLink(Game, { subPantry: 200000 }); // 200k >= 5*10*2000=100k: NOT thin
    const ctx = {};
    T6.trig6lead.setup(Game, ctx);
    const before = havenPantryKcal(Game);
    T6.trig6lead.daily(Game, ctx);
    check('G3 non-thin link: aid did not fire', ctx.t6Aid === undefined,
      `t6Aid=${ctx.t6Aid} subPantry=200000 (>= 5d of need)`);
    check('G3 no cause line on refusal', !said.some(s => /not the rot/.test(s)),
      said.length + ' beats');
    const link3 = Game.mshipState().links.find(l => l.id === 'link_thin');
    check('G3 the parent keeps its own rhythm (layer stayed out)',
      link3.tendedWeek === Game._week() && ctx.t6Aid === undefined,
      `tendedWeek=${link3.tendedWeek} pantry ${before}->${havenPantryKcal(Game)} (parent tend, not the layer)`);
  } else {
    console.log('  (skipped — RED phase; G3 is a GREEN assertion)');
  }

  // ---------- G4: mourning ----------
  console.log('== G4. AID refuses a mourning link ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(44, 6.5);
    Game.mshipState().links = [];
    Game.state.otherVillages = Game.state.otherVillages.filter(v => v.id !== 'thinval');
    addThinSubLink(Game, { mourningUntil: 30 + 7 }); // day is 30
    const ctx = {};
    T6.trig6lead.setup(Game, ctx);
    T6.trig6lead.daily(Game, ctx);
    check('G4 mourning link: aid did not fire', ctx.t6Aid === undefined,
      `t6Aid=${ctx.t6Aid}`);
    check('G4 no cause line on refusal', !said.some(s => /not the rot/.test(s)),
      said.length + ' beats');
  } else {
    console.log('  (skipped — RED phase; G4 is a GREEN assertion)');
  }

  // ---------- G5/G6/G7: siege-gate holds ----------
  console.log('== G5/G6/G7. siege-gate holds all verbs off ==');
  if (ARMED) {
    {
      const { Game, said } = await buildWorld(45, 6.5);
      Game.state.worldMonsters = Game.state.worldMonsters || [];
      Game.state.worldMonsters.push({ id: 'hushwolf', key: 'm_ling', tx: 4, ty: 4, hp: 20, maxHp: 20, lingering: true });
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      T6.trig6lead.daily(Game, ctx);
      check('G5 lingerer holds verbs off', ctx.t6Aid === undefined && !said.some(s => /not the rot/.test(s)),
        `t6Aid=${ctx.t6Aid}`);
      check('G5 gate-hold counted', (ctx.t6GateHeld || 0) >= 1, 't6GateHeld=' + ctx.t6GateHeld);
    }
    {
      const { Game } = await buildWorld(46, 6.5);
      Game.state.village.lastRaidDay = 28; // today is 30
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      T6.trig6lead.daily(Game, ctx);
      check('G6 recent raid holds verbs off', ctx.t6Aid === undefined,
        'lastRaidDay=28, day=30');
    }
    {
      const { Game } = await buildWorld(47, 6.5);
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      ctx._predTrack.gorgeNights.push({ day: 29, events: [], totalGorged: 1000, pantryBefore: 1, pantryAfter: 1 });
      T6.trig6lead.daily(Game, ctx);
      check('G7 gorge night holds verbs off', ctx.t6Aid === undefined,
        'gorge day=29, day=30');
    }
  } else {
    console.log('  (skipped — RED phase; G5/G6/G7 are GREEN assertions)');
  }

  // ---------- G8: pre-draw rollback (unit) ----------
  console.log('== G8. pre-draw rollback restores the pantry on refusal ==');
  if (ARMED) {
    const { Game } = await buildWorld(52, 6.5);
    const day = Game.state.scholar.day;
    Game.state.village.pantry = [
      { name: 'Grain A', kcalEach: 500, units: 10, safe: true, spoilDay: day + 2 },
      { name: 'Grain B', kcalEach: 500, units: 10, safe: true, spoilDay: day + 10 },
    ];
    const before = havenPantryKcal(Game);
    const draw = T6.preDraw(Game, 1500);
    check('G8 pre-draw took fresh-first (1500)', draw.taken === 1500,
      'taken=' + draw.taken);
    const mid = havenPantryKcal(Game);
    check('G8 pantry lighter mid-draw', mid === before - 1500,
      `${before} -> ${mid}`);
    draw.rollback();
    const after = havenPantryKcal(Game);
    const unitsA = Game.state.village.pantry.find(i => i.name === 'Grain A').units;
    check('G8 rollback restores every unit', after === before && unitsA === 10,
      `pantry ${before}->${after}, A.units=${unitsA}`);
  } else {
    console.log('  (skipped — RED phase; G8 is a GREEN assertion)');
  }

  // ---------- G9: FEAST fires ----------
  console.log('== G9. FEAST fires when no aid channel (fd > 6) ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(48, 6.5);
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    feastFixture(Game, ctx);
    const before = havenPantryKcal(Game);
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    check('G9 feast verb fired', ctx.t6Feasts === 1 && (ctx.t6FeastKcal || 0) > 0,
      `t6Feasts=${ctx.t6Feasts} spent=${ctx.t6FeastKcal}`);
    check('G9 pantry really drawn', havenPantryKcal(Game) < before,
      `${before} -> ${havenPantryKcal(Game)}`);
    check('G9 feast cause line narrated',
      said.some(s => /eat the mountain tonight/.test(s)),
      said.filter(s => /mountain/.test(s)).slice(0, 1).join('').slice(0, 160));
    check('G9 no trigger drain-below: fd still > 4 after', freshDaysOf(Game) > 4,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
  } else {
    console.log('  (skipped — RED phase; G9 is a GREEN assertion)');
  }

  // ---------- G9b: feast held below the lifted trigger ----------
  console.log('== G9b. FEAST does not fire at fd 5.x ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(49, 5.2);
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    feastFixture(Game, ctx);
    const before = havenPantryKcal(Game);
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    check('G9b feast held below the lifted trigger', ctx.t6Feasts === undefined,
      `freshDays=${freshDaysOf(Game).toFixed(2)} t6Feasts=${ctx.t6Feasts}`);
    check('G9b no cause line on refusal', !said.some(s => /eat the mountain tonight/.test(s)),
      said.length + ' beats');
    check('G9b pantry untouched', havenPantryKcal(Game) === before,
      `${before} -> ${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G9b is a GREEN assertion)');
  }

  // ---------- G10: TRIBUTE UNTOUCHED (the arm's negative assertion) ----------
  console.log('== G10. tribute timing untouched — the layer never pays early ==');
  if (ARMED) {
    const { Game, said } = await buildWorld(50, 6.5);
    addOwedTributeLink(Game);
    const ctx = {};
    const pol = T6.trig6belong;
    pol.setup(Game, ctx);
    const link = Game.mshipState().links.find(l => l.id === 'link_owed');
    pol.daily(Game, ctx);
    check('G10 no layer tribute verb exists (t6Tribute never set)', ctx.t6Tribute === undefined,
      `t6Tribute=${ctx.t6Tribute}`);
    check('G10 no early-tribute cause line (the overdraw3 harm channel is gone)',
      !said.some(s => /while the grain is still good|Tribute paid early/i.test(s)),
      said.length + ' beats');
    check('G10 the aid verb tends the thin link, not the owed one',
      (Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal > 1000,
      `t6Aid=${ctx.t6Aid} thinval=${(Game.state.otherVillages.find(v => v.id === 'thinval') || {}).pantryKcal}`);
    check('G10 the layer left the owed link alone',
      !said.some(s => /Bigkeep/.test(s) && /tribute/i.test(s) && /early/i.test(s)),
      `tributePaidWeek=${link.tributePaidWeek} (base-discipline timing is allowed)`);
  } else {
    console.log('  (skipped — RED phase; G10 is a GREEN assertion)');
  }

  // ---------- G11: priority aid > feast, both call orders ----------
  console.log('== G11. priority: aid > feast (one verb/day), both call orders ==');
  if (ARMED) {
    { // order A: daily then upkeep (the proof order)
      const { Game } = await buildWorld(53, 6.5);
      Game.dayPart = 2;
      const ctx = {};
      const pol = T6.trig6lead;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      ctx._fsLastFeastDay = 30; // suppress the base's own feast: priority alone is measured
      pol.daily(Game, ctx);   // aid should fire (priority 1)
      await quietLog(async () => { pol.upkeep(Game, ctx); }); // feast must NOT (already fired today)
      check('G11a daily->upkeep: aid wins the day', ctx.t6Aid === 1 && ctx.t6Feasts === undefined,
        `t6Aid=${ctx.t6Aid} t6Feasts=${ctx.t6Feasts}`);
    }
    { // order B: upkeep then daily (the harness's real order — dusk before end-of-day)
      const { Game } = await buildWorld(54, 6.5);
      Game.dayPart = 2;
      const ctx = {};
      const pol = T6.trig6lead;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      ctx._fsLastFeastDay = 30; // suppress the base's own feast
      await quietLog(async () => { pol.upkeep(Game, ctx); }); // feast must YIELD (aid channel exists)
      pol.daily(Game, ctx);   // aid fires
      check('G11b upkeep->daily: feast yields to the aid channel, aid fires',
        ctx.t6Aid === 1 && ctx.t6Feasts === undefined,
        `t6Aid=${ctx.t6Aid} t6Feasts=${ctx.t6Feasts}`);
    }
    { // no aid channel -> feast still fires in real order
      const { Game } = await buildWorld(55, 6.5);
      Game.mshipState().links = [];
      Game.dayPart = 2;
      const ctx = {};
      const pol = T6.trig6lead;
      pol.setup(Game, ctx);
      ctx._tribHist = [{ day: 29, kcal: 2000 }];
      ctx._fsLastFeastDay = 30; // suppress the base's own feast
      await quietLog(async () => { pol.upkeep(Game, ctx); });
      pol.daily(Game, ctx);
      check('G11c no aid channel: feast fires', ctx.t6Feasts === 1,
        `t6Feasts=${ctx.t6Feasts} t6Aid=${ctx.t6Aid}`);
    }
  } else {
    console.log('  (skipped — RED phase; G11 is a GREEN assertion)');
  }

  // ---------- G12: armed determinism ----------
  console.log('== G12. armed determinism (det-gate, 40d x2) ==');
  if (ARMED) {
    const a = await runHashes(T6.trig6lead, 11, 40);
    const b = await runHashes(T6.trig6lead, 11, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G12 armed trig6lead bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else {
    console.log('  (skipped — RED phase; G12 is a GREEN assertion)');
  }

  // ---------- G13: FRESH-FIRST ORDERING (aid) ----------
  console.log('== G13. fresh-first ordering: the aid eats the soonest-spoiling end ==');
  if (ARMED) {
    const { Game } = await buildWorld(56, 6.5);
    const day = Game.state.scholar.day;
    const A = { name: 'Grain A', kcalEach: 500, units: 96, safe: true, spoilDay: day + 2 };
    const B = { name: 'Grain B', kcalEach: 500, units: 96, safe: true, spoilDay: day + 10 };
    const C = { name: 'Grain C', kcalEach: 500, units: 96, safe: true, spoilDay: day + 30 };
    Game.state.village.pantry = [A, B, C];
    check('G13 fixture overstock under the LIFTED trigger (fd > 6)', freshDaysOf(Game) > 6,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    pol.daily(Game, ctx);
    check('G13 aid verb fired', ctx.t6Aid === 1, `t6Aid=${ctx.t6Aid}`);
    check('G13 soonest-spoiling (+2d) stack drained first',
      A.units < 96 && B.units === 96 && C.units === 96,
      `A=${A.units} B=${B.units} C=${C.units}`);
    check('G13 least-perishable (+30d) stack untouched', C.units === 96,
      `C.units=${C.units}`);
    check('G13 pantry drained exactly once (no double-draw)',
      A.units === 93 && C.units === 96,
      `A.units=${A.units} C.units=${C.units} pantry=${havenPantryKcal(Game)}`);
  } else {
    console.log('  (skipped — RED phase; G13 is a GREEN assertion)');
  }

  // ---------- G13b: FRESH-FIRST (feast, native) ----------
  console.log('== G13b. feast drains natively fresh-first ==');
  if (ARMED) {
    const { Game } = await buildWorld(57, 6.5);
    const day = Game.state.scholar.day;
    const A = { name: 'Grain A', kcalEach: 500, units: 96, safe: true, spoilDay: day + 2 };
    const B = { name: 'Grain B', kcalEach: 500, units: 96, safe: true, spoilDay: day + 10 };
    const C = { name: 'Grain C', kcalEach: 500, units: 96, safe: true, spoilDay: day + 30 };
    Game.state.village.pantry = [A, B, C];
    const ctx = {};
    const pol = T6.trig6lead;
    pol.setup(Game, ctx);
    feastFixture(Game, ctx);
    await quietLog(async () => { pol.upkeep(Game, ctx); });
    check('G13b feast fired', ctx.t6Feasts === 1, `t6Feasts=${ctx.t6Feasts}`);
    check('G13b feast ate the soonest-spoiling stack first',
      A.units < 96 && C.units === 96,
      `A=${A.units} B=${B.units} C=${C.units}`);
  } else {
    console.log('  (skipped — RED phase; G13b is a GREEN assertion)');
  }

  // ---------- G14: mechanism instrument ----------
  console.log('== G14. fd4/fd6 discrimination counters ==');
  if (ARMED) {
    {
      const { Game } = await buildWorld(58, 6.5);
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      T6.trig6lead.daily(Game, ctx);
      check('G14 fd 6.5 counts as BOTH fd6 and fd4 day',
        ctx.t6Fd6Days === 1 && ctx.t6Fd4Days === 1,
        `fd6=${ctx.t6Fd6Days} fd4=${ctx.t6Fd4Days}`);
    }
    {
      const { Game } = await buildWorld(59, 5.2);
      const ctx = {};
      T6.trig6lead.setup(Game, ctx);
      T6.trig6lead.daily(Game, ctx);
      check('G14 fd 5.2 counts as fd4 but NOT fd6 (the lift discriminates)',
        (ctx.t6Fd6Days || 0) === 0 && ctx.t6Fd4Days === 1,
        `fd6=${ctx.t6Fd6Days} fd4=${ctx.t6Fd4Days}`);
    }
  } else {
    console.log('  (skipped — RED phase; G14 is a GREEN assertion)');
  }

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
