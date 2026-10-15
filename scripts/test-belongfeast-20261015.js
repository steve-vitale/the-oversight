#!/usr/bin/env node
// scripts/test-belongfeast-20261015.js — PROOF for SIM-BELONGFEAST (loop B,
// 2026-10-15, food-economy axis — sim-findings #259, instrument arm).
//
// This arm is INSTRUMENT-ONLY: it closes #259's named next ("instrument the
// belong-road feast verb directly, not add more gates to the drawdown").
// The instrument = the rebuilt overdrawfloor fresh-first drawdown layer
// (scripts/policies/overdrawfloor.js, OVERDRAWFLOOR=1, default OFF) run on
// belongseek, with per-villager meal census (scripts/sharcensus-20261014.js)
// and feast-drawdown event logging.
//
// RED PHASE (OVERDRAWFLOOR unset):
//   R1. gate-off inert: overbelongfloor == belongseek, 40d per-day hashes.
//   R2. gate-off: no verbs fire on the overstock fixture, no cause lines,
//       no feast events (the instrument is inert when the layer is off).
// GREEN PHASE (OVERDRAWFLOOR=1):
//   G1. the feast verb fires on the belong fixture (dusk, contribution
//       preset, no aid channel), logs its drawdown event (day, kcal,
//       fdBefore, fdAfter), narrates the cause line AFTER the engine beat.
//   G2. rigged feast-then-starve: after the feast drains the pantry, a real
//       villageEats on an emptied pantry starves a villager — the census +
//       attribution classifies that villager-day as feast-proximity (<=3d
//       after the feast drawdown). A starved day 10d after the feast is NOT.
//   G3. control parity: gate off on the same fixture fires no feast and
//       logs no event.
//   G4. determinism: armed 40d x2 bit-identical.
//
// INFO-SKIP: if the overdrawfloor layer is absent (killed lineage), exit 0
// with INFO-SKIP — never MODULE_NOT_FOUND.
//
// Usage: node scripts/test-belongfeast-20261015.js
//   RED:   node scripts/test-belongfeast-20261015.js
//   GREEN: OVERDRAWFLOOR=1 node scripts/test-belongfeast-20261015.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
let ODF = null;
try { ODF = require('./policies/overdrawfloor'); } catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: overdrawfloor layer absent (killed lineage); diagnostic cannot run');
    process.exit(0);
  }
  throw e;
}
const { belongseek } = require('./policies/belongseek');
const { installShareCensus, classify } = require('./sharcensus-20261014');

const ARMED = process.env.OVERDRAWFLOOR === '1';
console.log('== belongfeast proof — ' + (ARMED ? 'ARMED (OVERDRAWFLOOR=1)' : 'RED (gate off)') + ' ==');

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
function freshItem(Game, name, kcal, daysLeft) {
  const day = (Game.state.scholar || {}).day || 1;
  return { name, kcalEach: 500, units: Math.ceil(kcal / 500), safe: true, spoilDay: day + daysLeft };
}
function freshDaysOf(Game) { try { return Game.pantryFreshDays(); } catch (e) { return -1; } }

// belong-road fixture: deep fresh pantry, healthy burn history, dusk, no
// subordinate links (the belong road has no primary-haven links — the aid
// verb has no channel here, the feast is the only drawdown verb).
async function buildBelongFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'belongfeast-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30;
  Game.dayPart = 2; // dusk
  const v = Game.state.village;
  v.burnHistory = [24000, 23500, 24200, 23800, 24100, 23900, 24000];
  v.pantry = [freshItem(Game, 'Foraged food', 150000, 3)];
  v.lastRaidDay = 0;
  return { Game, said };
}

async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'belongfeast-red' });
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

// attribution: starved villager-days within 3d after a feast drawdown.
function attribute(rows, feastEvents) {
  const out = [];
  for (const row of rows) {
    const c = classify(row, {});
    let starveClass = c.starvePath;
    let feastProx = false;
    if (c.starved) {
      for (const ev of feastEvents) {
        const dt = row.day - ev.day;
        if (dt >= 0 && dt <= 3) { feastProx = true; break; }
      }
      if (feastProx) starveClass = 'feast-proximity';
    }
    out.push({ day: row.day, vid: row.vid, name: row.name, starved: c.starved,
               base: c.starvePath, starveClass, feastProx });
  }
  return out;
}

(async () => {
  // ---------- R1: gate-off byte-identical on the belong road ----------
  console.log('== R1. gate-off: overbelongfloor == belongseek (40d hashes) ==');
  if (!ARMED) {
    const a = await runHashes(ODF.overbelongfloor, 22, 40);
    const b = await runHashes(belongseek, 22, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('R1 gate-off byte-identical on belongseek', same, `n=${a.length}/${b.length}`);
  } else console.log('  (skipped — armed phase)');

  // ---------- R2: gate-off instrument inert ----------
  console.log('== R2. gate-off: no verbs, no cause lines, no feast events ==');
  if (!ARMED) {
    const { Game, said } = await buildBelongFixture(42);
    const ctx = {};
    const pol = ODF.overbelongfloor;
    pol.setup(Game, ctx);
    ctx._tribHist = [{ day: 29, kcal: 2000 }];
    pol.daily(Game, ctx);
    pol.upkeep(Game, ctx);
    check('R2 gate-off: no aid verb', ctx.osAid === undefined, `osAid=${ctx.osAid}`);
    check('R2 gate-off: no feast verb', ctx.osFeasts === undefined, `osFeasts=${ctx.osFeasts}`);
    check('R2 gate-off: no feast events', (ctx._odfFeastEvents || []).length === 0,
      `events=${(ctx._odfFeastEvents || []).length}`);
    check('R2 gate-off: no cause lines said',
      !said.some(s => /not the rot|eat the mountain tonight/.test(s)),
      said.length + ' beats');
  } else console.log('  (skipped — armed phase)');

  // ---------- G1: the feast verb fires on the belong fixture ----------
  console.log('== G1. feast fires on the belong road, event logged, cause after beat ==');
  if (ARMED) {
    const { Game, said } = await buildBelongFixture(47);
    const ctx = {};
    const pol = ODF.overbelongfloor;
    pol.setup(Game, ctx);
    ctx._tribHist = [{ day: 29, kcal: 2000 }];
    const fdBefore = freshDaysOf(Game);
    pol.upkeep(Game, ctx);
    check('G1 feast verb fired', ctx.osFeasts === 1 && (ctx.osFeastKcal || 0) > 0,
      `osFeasts=${ctx.osFeasts} kcal=${ctx.osFeastKcal}`);
    const evs = ctx._odfFeastEvents || [];
    check('G1 drawdown event logged', evs.length === 1 && evs[0].day === 30 &&
      evs[0].kcal > 0 && evs[0].fdBefore > evs[0].fdAfter,
      JSON.stringify(evs[0] || null));
    check('G1 event fdBefore honest', Math.abs((evs[0] || {}).fdBefore - fdBefore) < 0.5,
      `fdBefore=${fdBefore.toFixed(1)} logged=${(evs[0] || {}).fdBefore}`);
    const feastIx = said.findIndex(s => /FEAST/.test(s));
    const causeIx = said.findIndex(s => /eat the mountain tonight/.test(s));
    check('G1 cause line follows the engine feast beat', feastIx >= 0 && causeIx > feastIx,
      `feast@${feastIx} cause@${causeIx}`);
    check('G1 3-day floor respected', freshDaysOf(Game) >= 3,
      'freshDays=' + freshDaysOf(Game).toFixed(1));
  } else console.log('  (skipped — RED phase)');

  // ---------- G2: rigged feast-then-starve → feast-proximity attribution ----------
  console.log('== G2. rigged feast-then-starve: real villageEats starves, attribution fires ==');
  if (ARMED) {
    const { Game, said } = await buildBelongFixture(48);
    const ctx = {};
    const pol = ODF.overbelongfloor;
    pol.setup(Game, ctx);
    ctx._tribHist = [{ day: 29, kcal: 2000 }];
    pol.upkeep(Game, ctx);
    check('G2 feast fired (precondition)', ctx.osFeasts === 1, `osFeasts=${ctx.osFeasts}`);
    // the pantry is now drained of its fresh; empty it outright and run a
    // real villageEats the next day — the village must genuinely starve.
    Game.state.village.pantry = [];
    Game.state.scholar.day = 31;
    const cen = installShareCensus(Game);
    Game.villageEats();
    const attr = attribute(cen.rows, ctx._odfFeastEvents || []);
    const proxStarved = attr.filter(a => a.starved && a.starveClass === 'feast-proximity');
    check('G2 real starvation follows the drained pantry', attr.some(a => a.starved),
      `starved rows=${attr.filter(a => a.starved).length}/${attr.length}`);
    check('G2 starved villager-days attributed to feast-proximity',
      proxStarved.length > 0,
      `feast-proximity=${proxStarved.length} e.g. ${proxStarved.slice(0, 2).map(a => a.name + ' d' + a.day).join(', ')}`);
    // a starved day far from any feast is NOT feast-proximity
    const far = attribute(
      [{ day: 45, vid: 'x', name: 'Far Villager', starved: true, need: 2000, ate: 500,
         fasting: false, away: false, pantryDrawCalled: true, spoiledCalled: false,
         packMealCalled: false, pantryFreshBefore: 0, pantryFreshAfter: 0, drew: 500 }],
      ctx._odfFeastEvents || []);
    check('G2 far-from-feast starvation keeps its own class',
      far[0].starveClass === 'empty-pantry' && !far[0].feastProx,
      `class=${far[0].starveClass}`);
    cen.uninstall();
  } else console.log('  (skipped — RED phase)');

  // ---------- G3: control parity ----------
  console.log('== G3. control (gate off) on the same fixture: no feast, no events ==');
  if (!ARMED) {
    const { Game } = await buildBelongFixture(49);
    const ctx = {};
    const pol = ODF.overbelongfloor;
    pol.setup(Game, ctx);
    ctx._tribHist = [{ day: 29, kcal: 2000 }];
    pol.upkeep(Game, ctx);
    check('G3 gate-off: no feast verb', ctx.osFeasts === undefined, `osFeasts=${ctx.osFeasts}`);
    check('G3 gate-off: no feast events', (ctx._odfFeastEvents || []).length === 0,
      `events=${(ctx._odfFeastEvents || []).length}`);
  } else console.log('  (skipped — armed phase)');

  // ---------- G4: armed determinism ----------
  console.log('== G4. armed determinism (40d x2, belong road) ==');
  if (ARMED) {
    const a = await runHashes(ODF.overbelongfloor, 22, 40);
    const b = await runHashes(ODF.overbelongfloor, 22, 40);
    const same = a.length === b.length && a.every((h, i) => h === b[i]);
    check('G4 armed overbelongfloor bit-identical across runs', same, `n=${a.length}/${b.length}`);
  } else console.log('  (skipped — RED phase)');

  console.log(fails.length ? `\nRESULT: ${fails.length} FAILURES: ${fails.join(', ')}` : '\nRESULT: all checks passed');
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
