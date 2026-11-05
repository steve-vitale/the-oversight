// scripts/test-journey-scale-r102-narrow-gate-20261105.js — proof test for the
// r102 narrowed fill gate (journey-scale r102 prereg). Stub-Game cases for
// topUpBeforeWalk (exported from the fillnarrow policy clone):
//   1. study-day skip (dist <= 2): no fill, no unload, fillSkipStudy=1.
//   2. full-pack skip (water already 3): no fill, no unload, fillSkipFull=1.
//   3. walk-imminent fill (dist > 2, water 1, room): fills to 3, no unload.
//   4. unload-then-fill (room < 3): unload counted, fill stops at the real
//      pack-full refusal (1L only).
//   5. stale pilgrim (>14d): nothing.
//   6. returning: nothing. 7. no pilgrim: nothing.
//   8. cistern dry at fill time: fill refused, no top-up counted.
// The stub fillWater models the game's real refusals (pack-full, cistern-dry);
// donateHaul is competent's own (defensive on stubs) — the test asserts the
// policy's counters, not donateSurplus internals. Not on the green list.
'use strict';
const { topUpBeforeWalk } = require('./policies/scalecourt-nogate-morntrace3-fillnarrow');

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('ok - ' + name); }
  else { fail++; console.log('FAIL - ' + name); }
}

function mkGame(opts) {
  const o = Object.assign({ tx: 8, ty: 4, water: 1, baseKg: 10, cap: 24, cist: 5, day: 10 }, opts || {});
  const s = { day: o.day, water: Array.from({ length: o.water }, () => 'water'), inventory: [] };
  const st = {
    scholar: s,
    otherVillages: [{ id: 'village_2', x: o.tx, y: o.ty }],
    village: { pantry: [], water: { clean: o.cist, dirty: 0 }, gives: {} },
  };
  const G = {
    state: st, map: { px: 4, py: 4 }, villagerId: 'scholar',
    playerAtHaven: () => true,
    carryCapacity: () => o.cap,
    packWeight: () => o.baseKg + s.water.length * 1, // 1L = 1kg
    linkWith: () => null,
    // models the real fillWater refusals: pack-full or cistern-dry refuses.
    fillWater: () => {
      if (s.water.length >= 3) return null;
      if (st.village.water.clean < 1) return null;
      if (o.baseKg + s.water.length + 1 > o.cap) return null;
      s.water.push('water'); st.village.water.clean -= 1; return null;
    },
    havenStoresAccess: () => 'full',
    kcalCap: () => 2400,
    pantryCapKcal: () => 100000,
    pantryKcal: () => 0,
    donateToPantry: () => {},
  };
  return { G, s, st };
}
function mkCtx(pgDay, extra) {
  const ctx = { _pilgrim: { vid: 'village_2', day: (pgDay == null ? 10 : pgDay) } };
  return Object.assign(ctx, extra || {});
}

// 1. study day: target 2 away — courtship would study, not walk.
{
  const { G, s } = mkGame({ tx: 6, ty: 4, water: 1 });
  const ctx = mkCtx();
  topUpBeforeWalk(G, ctx);
  check('1 study-day skip: water stays 1', s.water.length === 1);
  check('1 study-day skip: no top-up counted', ctx.fillTopUps === undefined);
  check('1 study-day skip: no unload', ctx.fillUnloads === undefined);
  check('1 study-day skip: fillSkipStudy=1', ctx.fillSkipStudy === 1);
}
// 2. already carrying 3L: nothing to fill, no unload even when room < 3.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 3, baseKg: 23 });
  const ctx = mkCtx();
  topUpBeforeWalk(G, ctx);
  check('2 full-pack skip: water stays 3', s.water.length === 3);
  check('2 full-pack skip: no top-up counted', ctx.fillTopUps === undefined);
  check('2 full-pack skip: no unload', ctx.fillUnloads === undefined);
  check('2 full-pack skip: fillSkipFull=1', ctx.fillSkipFull === 1);
}
// 3. walk imminent, water 1, plenty of room: fills to 3, no unload.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 1, baseKg: 10 });
  const ctx = mkCtx();
  topUpBeforeWalk(G, ctx);
  check('3 walk-imminent fill: water reaches 3', s.water.length === 3);
  check('3 walk-imminent fill: fillTopUps=1', ctx.fillTopUps === 1);
  check('3 walk-imminent fill: fillTopUpLiters=2', ctx.fillTopUpLiters === 2);
  check('3 walk-imminent fill: no unload', ctx.fillUnloads === undefined);
}
// 4. walk imminent, water 0, room 1: unload counted, fill stops at pack-full.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 0, baseKg: 23, cap: 24 });
  const ctx = mkCtx();
  topUpBeforeWalk(G, ctx);
  check('4 unload-then-fill: unload counted', ctx.fillUnloads === 1);
  check('4 unload-then-fill: exactly 1L filled (pack-full refusal)', s.water.length === 1 && ctx.fillTopUpLiters === 1);
  check('4 unload-then-fill: fillTopUps=1', ctx.fillTopUps === 1);
}
// 5. stale pilgrim (day 25, started day 10): nothing.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 1, day: 25 });
  const ctx = mkCtx(10);
  topUpBeforeWalk(G, ctx);
  check('5 stale pilgrim: water stays 1', s.water.length === 1);
  check('5 stale pilgrim: no counters', ctx.fillTopUps === undefined && ctx.fillUnloads === undefined && ctx.fillSkipStudy === undefined && ctx.fillSkipFull === undefined);
}
// 6. returning: nothing.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 1 });
  const ctx = mkCtx(10, { _returning: true });
  topUpBeforeWalk(G, ctx);
  check('6 returning: water stays 1', s.water.length === 1);
  check('6 returning: no counters', ctx.fillTopUps === undefined && ctx.fillUnloads === undefined);
}
// 7. no pilgrim: nothing.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 1 });
  const ctx = {};
  topUpBeforeWalk(G, ctx);
  check('7 no pilgrim: water stays 1', s.water.length === 1);
  check('7 no pilgrim: no counters', ctx.fillTopUps === undefined && ctx.fillUnloads === undefined);
}
// 8. cistern dry at fill time: fill refused, no top-up counted.
{
  const { G, s } = mkGame({ tx: 8, ty: 4, water: 1, cist: 0 });
  const ctx = mkCtx();
  topUpBeforeWalk(G, ctx);
  check('8 cistern dry: water stays 1', s.water.length === 1);
  check('8 cistern dry: no top-up counted', ctx.fillTopUps === undefined);
  check('8 cistern dry: no unload', ctx.fillUnloads === undefined);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
