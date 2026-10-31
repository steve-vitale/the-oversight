// test-regtable-20261031.js — proof tests for the regtable-diag
// recorder (sim-regtable-a). Pure unit tests: no game load, no RNG,
// no file writes. Run: node scripts/test-regtable-20261031.js
//
// 1. REGTABLE unset: the layer delegates byte-identically (inner
//    daily called, its return passed through, zero rows recorded).
// 2. REGTABLE=1 with a stub Game: snapRegtable records the seat, the
//    full-gate breakdown, the rank, and the table flags exactly as the
//    engine reports them.
// 3. Say capture records only lines containing 'table'
//    (case-insensitive) and calls through with identical arguments.
// 4. A throwing stub is COUNTED (errs), not swallowed silently.
'use strict';
const assert = require('assert');

function freshEnv() {
  delete process.env.REGTABLE;
}

function load() {
  delete require.cache[require.resolve('./policies/regtable-diag')];
  return require('./policies/regtable-diag');
}

// --- 1. Delegation when the layer is off ---
freshEnv();
{
  const RT = load();
  assert.strictEqual(RT.layerOn(), false);
  let innerCalls = 0;
  const inner = { daily() { innerCalls += 1; return 'inner-result'; } };
  const wrapped = RT.withRegtableDiag(inner, 't', 't');
  const mockGame = { state: { scholar: { day: 5 } } };
  assert.strictEqual(wrapped.daily(mockGame, {}), 'inner-result');
  assert.strictEqual(innerCalls, 1);
  assert.strictEqual(wrapped.regtableStore.rows.length, 0);
  assert.strictEqual(wrapped.regtableStore.errs, 0);
  console.log('PASS delegation-off: inner called, result passed through, 0 rows');
}

// --- 2. Snapshot with the layer on ---
process.env.REGTABLE = '1';
{
  const RT = load();
  assert.strictEqual(RT.layerOn(), true);
  const mockGame = {
    state: { scholar: { day: 71 } },
    scaleRank: () => 'regional',
    tableSeat: () => ({
      seat: 'lesser',
      detail: { w1: 4, w2: 4, w3: 3, w4: 1, w5: 0, contestsN: 2, crisesN: 2, rank: 'regional', stage: 2, foodDeeds: true },
    }),
    deedGateReady: () => ({
      ok: false, waves: false, contests: true, crises: true, scale: false,
      stageOk: true, foodDeeds: true, w1: 4, w2: 4, w3: 3, w4: 1, w5: 0,
      contestsN: 2, crisesN: 2, stage: 2, rank: 'regional',
    }),
    progState: () => ({ arc: 4, tableWaiting: true, tableDone: false, tableAnnounced: false }),
    won: false, villageLost: false, winDayFloorOk: () => false,
  };
  const row = RT.snapRegtable(mockGame);
  assert.strictEqual(row.day, 71);
  assert.strictEqual(row.rank, 'regional');
  assert.strictEqual(row.seat, 'lesser');
  assert.strictEqual(row.seatDetail.w1, 4);
  assert.strictEqual(row.seatDetail.w3, 3);
  assert.strictEqual(row.fullOk, false);
  assert.strictEqual(row.full.scale, false);
  assert.strictEqual(row.full.waves, false);
  assert.strictEqual(row.arc, 4);
  assert.strictEqual(row.tableWaiting, true);
  assert.strictEqual(row.tableDone, false);
  assert.strictEqual(row.winFloorOk, false);
  assert.deepStrictEqual(row.errs, []);
  console.log('PASS snapshot-on: lesser seat at regional, full gate scale=false, tableWaiting=true');
}

// --- 3. Say capture: table lines only, identical call-through ---
{
  const RT = load();
  const seen = [];
  const mockGame = {
    state: { scholar: { day: 71 } },
    sysSay(line) { seen.push(line); return 'said'; },
  };
  const store = RT.newStore();
  RT.installSayCapture(mockGame, store);
  assert.strictEqual(mockGame.sysSay('The table is being set.'), 'said');
  mockGame.sysSay('A villager eats stew.');
  mockGame.sysSay('◈ THE TABLE RETURNS — choose your door.');
  assert.deepStrictEqual(seen, ['The table is being set.', 'A villager eats stew.', '◈ THE TABLE RETURNS — choose your door.']);
  assert.strictEqual(store.beats.length, 2);
  assert.strictEqual(store.beats[0].day, 71);
  RT.uninstallSayCapture(mockGame, store);
  assert.strictEqual(mockGame.sysSay, store.origSysSay);
  console.log('PASS say-capture: 2 table lines recorded, call-through identical, uninstall restores');
}

// --- 4. Throwing stubs are counted ---
{
  const RT = load();
  const mockGame = {
    state: { scholar: { day: 3 } },
    scaleRank: () => { throw new Error('boom'); },
    tableSeat: () => { throw new Error('boom'); },
    deedGateReady: () => { throw new Error('boom'); },
    progState: () => { throw new Error('boom'); },
    winDayFloorOk: () => { throw new Error('boom'); },
  };
  const row = RT.snapRegtable(mockGame);
  assert.ok(row.errs.length >= 4, 'expected >=4 counted errors, got ' + row.errs.length);
  assert.strictEqual(row.seat, 'none');
  assert.strictEqual(row.fullOk, false);
  console.log('PASS error-counting: ' + row.errs.length + ' errors counted, row still returned');
}

freshEnv();
console.log('ALL regtable-diag proof tests passed (4/4)');
