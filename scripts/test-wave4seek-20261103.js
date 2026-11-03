// test-wave4seek-20261103.js — proof tests for the wave4seek arm.
// 1. Policy composes: withWave4Seek wraps a stub base, keeps id/desc,
//    calls base.daily, then patrols.
// 2. Seek triggers ONLY on a legitimate channel: patrol fires iff
//    unlockedWave >= 4 AND own deed record shows < 3 distinct w4 faced.
//    It never fires pre-unlock or once the bar is met.
// 3. Perception-law source ban: wave4seek.js never references a monster
//    roster/position API (worldMonsters, nearestWorldMonster, monsterAt,
//    worldMonsterCap, scholar.monster alias reads for targeting).
// 4. Patrol shape: farthest-first, undirected, bounded (<= 4 tiles), kcal
//    guard respected, once per day, no RNG consumed (deterministic
//    repeat: same stub state -> same travel order).
// Run: node scripts/test-wave4seek-20261103.js (no harness, no repo writes)
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const W4 = require('./policies/wave4seek');

let pass = 0;
function check(name, fn) { fn(); pass++; console.log('ok - ' + name); }

function stubGame(opts) {
  const o = opts || {};
  const traveled = [];
  return {
    game: {
      over: false, tbfight: false,
      state: { scholar: { day: o.day || 10, kcal: (o.kcal === undefined ? 5000 : o.kcal) } },
      kcalCap: () => 10000,
      unlockedWave: () => o.wave || 1,
      deedState: () => ({ wavesFaced: o.faced || {} }),
      travelTargets: () => (o.targets || [
        { x: 1, y: 1, d: 2 }, { x: 8, y: 8, d: 9 }, { x: 2, y: 2, d: 3 },
      ]),
      tileAt: (x, y) => ({ type: (x === 4 && y === 4) ? 'haven' : 'thicket' }),
      travelTo: (x, y) => { traveled.push([x, y]); },
      doAction: () => ({}),
    },
    traveled,
  };
}

check('composes: id/desc set, base.daily called, patrol runs when unlocked', () => {
  let baseDaily = 0;
  const base = { id: 'b', desc: 'b', daily: () => { baseDaily++; } };
  const wrapped = W4.withWave4Seek(base, 'lead-wave4seek', 'test');
  assert.strictEqual(wrapped.id, 'lead-wave4seek');
  const { game, traveled } = stubGame({ wave: 4, faced: {} });
  const ctx = {};
  wrapped.daily(game, ctx);
  assert.strictEqual(baseDaily, 1);
  assert.strictEqual(ctx.w4seek.patrols, 1);
  assert.deepStrictEqual(traveled, [[8, 8], [2, 2], [1, 1]]); // farthest-first
});

check('no patrol pre-unlock (wave 3)', () => {
  const base = { daily: () => {} };
  const wrapped = W4.withWave4Seek(base, 'x', 'x');
  const { game, traveled } = stubGame({ wave: 3, faced: {} });
  const ctx = {};
  wrapped.daily(game, ctx);
  assert.strictEqual(traveled.length, 0);
  assert.strictEqual(ctx.w4seek, undefined);
});

check('no patrol once w4 bar met (3 distinct w4 faced)', () => {
  const base = { daily: () => {} };
  const wrapped = W4.withWave4Seek(base, 'x', 'x');
  const { game, traveled } = stubGame({ wave: 4, faced: { a: 4, b: 4, c: 4, d: 1 } });
  const ctx = {};
  wrapped.daily(game, ctx);
  assert.strictEqual(traveled.length, 0);
});

check('patrol when 2 w4 faced (bar unmet)', () => {
  const base = { daily: () => {} };
  const wrapped = W4.withWave4Seek(base, 'x', 'x');
  const { game, traveled } = stubGame({ wave: 4, faced: { a: 4, b: 4 } });
  const ctx = {};
  wrapped.daily(game, ctx);
  assert.ok(traveled.length > 0);
});

check('kcal guard blocks patrol when starving', () => {
  const base = { daily: () => {} };
  const wrapped = W4.withWave4Seek(base, 'x', 'x');
  const { game, traveled } = stubGame({ wave: 4, faced: {}, kcal: 100 });
  wrapped.daily(game, {});
  assert.strictEqual(traveled.length, 0);
});

check('once per day; bounded to 4 tiles; deterministic repeat', () => {
  const base = { daily: () => {} };
  const wrapped = W4.withWave4Seek(base, 'x', 'x');
  const targets = [];
  for (let i = 0; i < 8; i++) targets.push({ x: i, y: 0, d: i });
  const { game, traveled } = stubGame({ wave: 4, faced: {}, targets });
  const ctx = {};
  wrapped.daily(game, ctx);
  wrapped.daily(game, ctx); // same day: second call is a no-op for patrol
  assert.strictEqual(traveled.length, 4);
  assert.strictEqual(ctx.w4seek.patrols, 1);
  const { game: g2, traveled: t2 } = stubGame({ wave: 4, faced: {}, targets });
  const ctx2 = {};
  wrapped.daily(g2, ctx2);
  assert.deepStrictEqual(t2, traveled); // same order, no RNG
});

check('w4FacedCount counts only wave-4 entries; unreadable fails closed', () => {
  const { game } = stubGame({ faced: { a: 4, b: 4, c: 3, d: 5 } });
  assert.strictEqual(W4.w4FacedCount(game), 2);
  assert.strictEqual(W4.w4FacedCount({ deedState: () => { throw new Error('x'); } }), -1);
});

check('perception-law source ban: no roster/position API in wave4seek.js', () => {
  const raw = fs.readFileSync(path.join(__dirname, 'policies', 'wave4seek.js'), 'utf8');
  // Strip comments: the header DOCUMENTS the ban by naming the APIs, so
  // only executable code is scanned.
  const src = raw.split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
  for (const banned of ['worldMonsters', 'nearestWorldMonster', 'monsterAt(', 'worldMonsterCap', 'scholar.monster']) {
    assert.ok(!src.includes(banned), 'banned reference present: ' + banned);
  }
  // And the only Game reads are the allowed ones.
  for (const allowed of ['unlockedWave()', 'deedState()', 'travelTargets()', 'tileAt(', 'travelTo(']) {
    assert.ok(src.includes(allowed), 'missing allowed read: ' + allowed);
  }
});

console.log(`PASS: ${pass}/8 wave4seek proof checks`);
