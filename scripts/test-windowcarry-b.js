// test-windowcarry-b.js — proof for sim-windowcarry-b.
// Pure unit tests (no game load): the window gate, the pantry ordering,
// and the depart-half behavior against a mocked Game/inner policy.
// Usage: node scripts/test-windowcarry-b.js
// Exit 0 = all green. No repo writes.
'use strict';
const assert = require('assert');
const {
  DAYWANT, WINDOW_LAST_LOOPDAY, newStore, packKnownKcal,
  sortPantryCandidates, windowGate, withWindowcarry,
} = require('./policies/windowcarry-diag');

let n = 0;
function ok(name, fn) { fn(); n++; console.log('ok ' + n + ' - ' + name); }

// --- window gate ---
ok('window open on loop-days 1-7 with no prior still', () => {
  for (let d = 1; d <= 7; d++) assert.strictEqual(windowGate({ dailyCount: d, seenStill: false }), null);
});
ok('window closed on loop-day 8+ even with no prior still', () => {
  assert.strictEqual(windowGate({ dailyCount: 8, seenStill: false }), 'window-closed-day');
  assert.strictEqual(windowGate({ dailyCount: 30, seenStill: false }), 'window-closed-day');
});
ok('window closed after a still evening even inside day 7', () => {
  assert.strictEqual(windowGate({ dailyCount: 3, seenStill: true }), 'window-closed-strand');
  assert.strictEqual(windowGate({ dailyCount: 7, seenStill: true }), 'window-closed-strand');
});
ok('WINDOW_LAST_LOOPDAY is 7 and DAYWANT is 2000', () => {
  assert.strictEqual(WINDOW_LAST_LOOPDAY, 7);
  assert.strictEqual(DAYWANT, 2000);
});

// --- pantry ordering: longest shelf first, then kcalEach ---
ok('sortPantryCandidates prefers spoilDay 366 staples over perishables', () => {
  const items = [
    { name: 'Berries', spoilDay: 5, kcalEach: 100 },
    { name: 'Canned soup', spoilDay: 366, kcalEach: 250 },
    { name: 'Rice', spoilDay: 366, kcalEach: 200 },
    { name: 'Fresh meat', spoilDay: 2, kcalEach: 400 },
  ];
  const sorted = sortPantryCandidates(items).map((x) => x.name);
  assert.deepStrictEqual(sorted, ['Canned soup', 'Rice', 'Berries', 'Fresh meat']);
});
ok('packKnownKcal counts only known, edible, unspoiled kcal', () => {
  const Game = {
    state: { scholar: { day: 10, inventory: [
      { name: 'Rice', units: 2, kcalEach: 200, edible: true, spoilDay: 366 },
      { name: 'Unknown shoots', units: 3, kcalEach: 0, edible: false, spoilDay: 12 },
      { name: 'Spoiled stew', units: 1, kcalEach: 300, edible: true, spoilDay: 9 },
    ] } },
    isSpoiled: (it) => it.spoilDay <= 10,
  };
  assert.strictEqual(packKnownKcal(Game), 400);
});

// --- depart half against a mocked Game ---
function mockGame() {
  return {
    over: false,
    state: {
      scholar: { day: 1, insideHaven: true, inventory: [] },
      village: { pantry: [
        { name: 'Canned soup', units: 30, kcalEach: 250, edible: true, spoilDay: 366 },
        { name: 'Rice', units: 65, kcalEach: 200, edible: true, spoilDay: 366 },
      ] },
    },
    playerTile: () => ({ type: 'haven' }),
    inCombat: () => false,
    havenStoresAccess: () => 'full',
    isSpoiled: () => false,
    sayLines: [],
    say(s) { this.sayLines.push(s); },
    takeFromPantry(idx) {
      const p = this.state.village.pantry[idx];
      p.units -= 1;
      const inv = this.state.scholar.inventory;
      let row = inv.find((x) => x.name === p.name);
      if (!row) { row = { name: p.name, units: 0, kcalEach: p.kcalEach, edible: true, spoilDay: p.spoilDay }; inv.push(row); }
      row.units += 1;
    },
  };
}
function mockInner() {
  return { dailyCalled: 0, daily() { this.dailyCalled++; } };
}

ok('depart carries toward DAYWANT on a loop-day 1 haven morning (WINDOWCARRY=1)', () => {
  process.env.WINDOWCARRY = '1';
  const Game = mockGame();
  const inner = mockInner();
  const st = newStore();
  const probe = withWindowcarry(inner, st);
  probe.daily(Game, {});
  const rec = st.departRecords[0];
  assert.strictEqual(rec.acted, true);
  assert.strictEqual(rec.loopDay, 1);
  assert.ok(rec.knownAfter >= DAYWANT || rec.knownAfter === rec.knownBefore + rec.kcalPacked);
  assert.ok(Game.sayLines.some((l) => /pack .* portions? from the pantry for the road/.test(l)));
  assert.strictEqual(inner.dailyCalled, 1);
});
ok('depart refuses on loop-day 8 (window-closed-day) and inner still runs', () => {
  process.env.WINDOWCARRY = '1';
  const Game = mockGame();
  const inner = mockInner();
  const st = newStore();
  const probe = withWindowcarry(inner, st);
  for (let i = 0; i < 8; i++) probe.daily(Game, {});
  const rec = st.departRecords[7];
  assert.strictEqual(rec.acted, false);
  assert.strictEqual(rec.skip, 'window-closed-day');
  assert.strictEqual(rec.loopDay, 8);
  assert.strictEqual(inner.dailyCalled, 8);
});
ok('depart refuses after a still-creek evening (window-closed-strand)', () => {
  process.env.WINDOWCARRY = '1';
  const Game = mockGame();
  const inner = mockInner();
  const st = newStore();
  const probe = withWindowcarry(inner, st);
  probe.daily(Game, {});
  // Next morning: previous evening was still-creek.
  probe.daily(Game, { _wcLast: { bucket: 'creek', rescued: false } });
  const rec = st.departRecords[1];
  assert.strictEqual(rec.acted, false);
  assert.strictEqual(rec.skip, 'window-closed-strand');
  assert.strictEqual(st.seenStill, true);
  // And it stays closed the morning after that.
  probe.daily(Game, { _wcLast: { bucket: 'creek', rescued: true } });
  assert.strictEqual(st.departRecords[2].skip, 'window-closed-strand');
});
ok('depart is inert when WINDOWCARRY=0 (lever-off, inner still runs)', () => {
  process.env.WINDOWCARRY = '0';
  const Game = mockGame();
  const inner = mockInner();
  const st = newStore();
  const probe = withWindowcarry(inner, st);
  probe.daily(Game, {});
  assert.strictEqual(st.departRecords[0].skip, 'lever-off');
  assert.strictEqual(Game.state.scholar.inventory.length, 0);
  assert.strictEqual(inner.dailyCalled, 1);
});
ok('depart skips when not at haven, without touching the pantry', () => {
  process.env.WINDOWCARRY = '1';
  const Game = mockGame();
  Game.state.scholar.insideHaven = false;
  Game.playerTile = () => ({ type: 'creek' });
  const inner = mockInner();
  const st = newStore();
  const probe = withWindowcarry(inner, st);
  probe.daily(Game, {});
  assert.strictEqual(st.departRecords[0].skip, 'not-at-haven');
  assert.strictEqual(Game.state.village.pantry[0].units, 30);
});
delete process.env.WINDOWCARRY;
console.log('test-windowcarry-b: ' + n + '/' + n + ' green');
