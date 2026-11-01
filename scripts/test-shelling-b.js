#!/usr/bin/env node
// test-shelling-b.js — proof test for sim-shelling-b (pure + live legs).
// Default: pure checks only (no sim). Flags:
//   --live-control : armed 51107 (NON-JUDGED positive control): habit must
//     fire, tick deltas must be exactly 4 per lot, fired events must show
//     dayTicksAfter - dayTicksBefore == 4 x lots (barring no other ticker
//     inside shellNuts — shellNuts only calls tickAction(4) per lot).
//   --live-det : armed 51107 twice; return counts + unload totals must be
//     byte-identical (seeded determinism).
// Live legs need DEPOSITGATE=0 etc.; this file sets them before requiring
// the driver (Game reads them at runtime; competent reads some at load).
'use strict';
let pass = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { failed++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
const shelling = require('./policies/shelling-b');

function fakeUnproc(it) { return it.foodState === 'in_shell' || it.foodState === 'unknown'; }

(function pure() {
  // summarizePack: finished excludes in-shell + unknown; shelledNet = 0.75x.
  const inv = [
    { name: 'Blackberries', units: 10, kcalEach: 100, foodState: 'fresh' },
    { name: 'White Oak Acorns (in shell)', units: 32, kcalEach: 0, hiddenKcal: 150, foodKind: 'nut', foodState: 'in_shell' },
    { name: 'Unknown nuts', units: 4, kcalEach: 0, hiddenKcal: 200, foodKind: 'nut', foodState: 'unknown' },
    { name: 'Sticks', units: 5, kcalEach: 0 },
  ];
  const s = shelling.summarizePack(inv, fakeUnproc);
  check('finished counts only finished food', s.finishedKcal === 1000, s);
  check('shelledNet = 32 x round(150 x 0.75) = 3616', s.shelledNet === 3616, s);
  check('combined = 4616, eligible (finished <= 2000, combined > 2000)', s.combined === 4616 && s.eligible === true, s);
  // Boundaries: finished exactly 2000 + shelled 1 -> eligible; finished 2001 -> not.
  const b1 = shelling.summarizePack([
    { name: 'F', units: 20, kcalEach: 100, foodState: 'fresh' },
    { name: 'N', units: 1, kcalEach: 0, hiddenKcal: 2, foodKind: 'nut', foodState: 'in_shell' },
  ], fakeUnproc);
  check('boundary: finished 2000 + shelled 2 = eligible', b1.eligible === true, b1);
  const b2 = shelling.summarizePack([
    { name: 'F', units: 2001, kcalEach: 1, foodState: 'fresh' },
    { name: 'N', units: 10, kcalEach: 0, hiddenKcal: 150, foodKind: 'nut', foodState: 'in_shell' },
  ], fakeUnproc);
  check('boundary: finished 2001 -> not eligible even with big shelled pack', b2.eligible === false, b2);
  const b3 = shelling.summarizePack([
    { name: 'N', units: 8, kcalEach: 0, hiddenKcal: 200, foodKind: 'nut', foodState: 'in_shell' },
  ], fakeUnproc);
  check('haul-size shape: 8 hickory shelled = 1200 < 2000, not eligible', b3.shelledNet === 1200 && b3.eligible === false, b3);
  check('constants: keep 2000, 4 ticks/lot, 512 ticks/day',
    shelling.KEEP_KCAL === 2000 && shelling.TICKS_PER_LOT === 4 && shelling.TICKS_PER_DAY === 512);

  // shellOnReturn on a fake Game: fires, shells each lot, charges 4/lot.
  function fakeGame(dayTicks, lots) {
    const inv = lots.map((l) => ({ name: l.name, units: l.units, hiddenKcal: l.gross, kcalEach: 0, foodKind: 'nut', foodState: 'in_shell' }));
    const G = { over: false, tbfight: null, state: { scholar: { inventory: inv, dayTicks }, activeContest: null },
      isUnprocessed: fakeUnproc,
      shellNuts(idx) {
        const it = this.state.scholar.inventory[idx];
        const net = Math.round((it.hiddenKcal || 0) * 0.75);
        it.kcalEach = net; it.hiddenKcal = null; it.foodState = 'shelled'; it.edible = true;
        this.state.scholar.dayTicks += 4;
      } };
    return G;
  }
  const g1 = fakeGame(100, [{ name: 'Acorns', units: 32, gross: 150 }, { name: 'Hickory', units: 8, gross: 200 }]);
  const e1 = shelling.shellOnReturn(g1);
  check('fake: fires on 2 lots', e1.fired === true && e1.lots === 2, e1);
  check('fake: ticks charged = 8', e1.ticksCharged === 8 && e1.dayTicksAfter - e1.dayTicksBefore === 8, e1);
  check('fake: tick deltas all exactly 4', (e1._tickDeltas || []).every((d) => d === 4), e1);
  check('fake: both lots shelled in place', g1.state.scholar.inventory.every((it) => it.foodState === 'shelled'));
  const g2 = fakeGame(508, [{ name: 'Acorns', units: 32, gross: 150 }]);
  const e2 = shelling.shellOnReturn(g2);
  check('fake: late-day guard skips (508 + 4 >= 512)', e2.fired === false && e2.reason === 'late-day', e2);
  const g2b = fakeGame(507, [{ name: 'Acorns', units: 32, gross: 150 }]);
  const e2b = shelling.shellOnReturn(g2b);
  check('fake: 507 + 4 = 511 < 512 still fires', e2b.fired === true, e2b);
  const g3 = fakeGame(100, []);
  const e3 = shelling.shellOnReturn(g3);
  check('fake: no lots -> no fire', e3.fired === false && e3.reason === 'no-in-shell-lots', e3);
  const g4 = fakeGame(100, [{ name: 'Acorns', units: 5, gross: 150 }]);
  g4.over = true;
  const e4 = shelling.shellOnReturn(g4);
  check('fake: game over -> no fire', e4.fired === false && e4.reason === 'game-over-at-entry', e4);
  const g5 = fakeGame(100, [{ name: 'Acorns', units: 5, gross: 150 }]);
  g5.tbfight = {};
  const e5 = shelling.shellOnReturn(g5);
  check('fake: combat -> no fire', e5.fired === false && e5.reason === 'combat-or-contest', e5);
})();

async function live() {
  process.env.POLICY = 'competent';
  process.env.COMPETENT_FEAST = '0';
  process.env.SEATDRIVE = '0';
  process.env.PLENTYDEPRI = '0';
  process.env.DEPOSITGATE = '0';
  const { oneInstance } = require('./shelling-b-driver');
  const args = process.argv.slice(2);
  if (args.includes('--live-control')) {
    const inst = await oneInstance(51107, 'armed');
    const live = inst.homecomings.filter((h) => !h.overAtEntry);
    const fired = live.filter((h) => h.habit && h.habit.fired);
    check('live-control 51107: habit fires at least once', fired.length >= 1, { live: live.length, fired: fired.length });
    const tickOk = fired.every((h) => (h.habit.dayTicksAfter - h.habit.dayTicksBefore) === 4 * h.habit.lots &&
      (h.habit._tickDeltas || []).every((d) => d === 4));
    check('live-control 51107: every fired event charges exactly 4 ticks/lot', tickOk,
      fired.slice(0, 3).map((h) => h.habit));
    const attributed = live.filter((h) => (h.unloadKcal || 0) > 0 && h.packBefore &&
      h.packBefore.finishedKcal <= 2000 && (h.packBefore.shelledNet || 0) > 0);
    console.log('live-control 51107: liveReturns=' + live.length + ' fired=' + fired.length +
      ' unloadTotal=' + live.reduce((t, h) => t + (h.unloadKcal || 0), 0) +
      ' shellingAttributedUnloads=' + attributed.length);
    if (!attributed.length) console.log('NOTE (not a failure): 51107 armed trajectory produced no finished<=2000 unloading return; firing + tick checks above are the control.');
  }
  if (args.includes('--live-det')) {
    const a = await oneInstance(51107, 'armed');
    const b = await oneInstance(51107, 'armed');
    const sum = (inst) => ({ returns: inst.homecomings.length,
      unload: inst.homecomings.filter((h) => !h.overAtEntry).reduce((t, h) => t + (h.unloadKcal || 0), 0),
      fired: inst.homecomings.filter((h) => h.habit && h.habit.fired).length,
      days: inst.daysAlive, end: inst.endReason });
    check('live-det 51107 armed x2 identical', JSON.stringify(sum(a)) === JSON.stringify(sum(b)), { a: sum(a), b: sum(b) });
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.includes('--live-control') || args.includes('--live-det')) await live();
  console.log('test-shelling-b: ' + pass + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH', e && (e.stack || e)); process.exit(2); });
