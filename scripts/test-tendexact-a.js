// test-tendexact-a.js — proof for arm sim-tendexact-a (finding #2072).
// Unit legs for the exact-split fix in Game._removePantryKcal
// (src/js/hierarchy.js) against the REAL loaded Game, plus a live
// harness smoke leg (150201 answermail, 150d, /tmp) proving per-tend
// payment on real sims. RED->GREEN: on pre-fix code the overpay legs
// fail (tend pays 1,600 for a 1,500 sticker; split cases over-take)
// and the smoke leg fails (a tend pays > 1,500); on fixed code all
// pass. The fix splits the final unit into a remainder piece — a whole
// unit (units=1) with reduced kcalEach and proportional kg, the same
// representation depositPantryPieces already mints — never a fractional
// unit (break-it food r3 doctrine). Usage: node scripts/test-tendexact-a.js
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let passed = 0;
function check(name, fn) {
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      return r.then(function () { passed += 1; console.log('ok ' + passed + ' - ' + name); },
        function (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; });
    }
    passed += 1; console.log('ok ' + passed + ' - ' + name);
  } catch (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; }
}
function checkAsync(name, fn) {
  return Promise.resolve().then(fn).then(function () { passed += 1; console.log('ok ' + passed + ' - ' + name); },
    function (e) { console.error('FAIL - ' + name + '\n  ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join('\n  ') : e)); process.exitCode = 1; });
}

function pantryTotal(pantry) {
  return (pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 0); }, 0);
}

(async function () {
  const { Game } = await loadGame({ seed: 150201, mode: 'tendexact-proof', fullTelemetry: false });
  await quietLog(async function () { await setupGame(Game); });
  assert.strictEqual(typeof Game._removePantryKcal, 'function', '_removePantryKcal exists');
  assert.strictEqual(typeof Game.stacksMatch, 'function', 'stacksMatch exists');

  function setPantry(items) {
    // Deep-copy the fixture so each leg starts from identical ground.
    Game.state.village.pantry = JSON.parse(JSON.stringify(items));
    return Game.state.village.pantry;
  }

  // --- The finding, reproduced -------------------------------------------
  // 99101's shape: 10 x 400-kcal pieces. A 1,500 tend paid 1,600
  // pre-fix (ceil(1500/400) = 4 units). Fixed: exactly 1,500, and the
  // fourth piece survives as a 100-kcal remainder.
  check('overpay case: 10x400, take 1500 pays exactly 1500', function () {
    const p = setPantry([{ name: 'Dried meat', kcalEach: 400, units: 10, spoilDay: 100, safe: true, kg: 0.5, unit: 'strip' }]);
    const before = pantryTotal(p);
    const paid = Game._removePantryKcal(1500);
    assert.strictEqual(paid, 1500, 'paid must be exactly 1500; got ' + paid);
    assert.strictEqual(pantryTotal(Game.state.village.pantry), before - 1500, 'pantry must lose exactly 1500');
  });
  check('overpay case: remainder piece is a 100-kcal whole unit', function () {
    const p = setPantry([{ name: 'Dried meat', kcalEach: 400, units: 10, spoilDay: 100, safe: true, kg: 0.5, unit: 'strip' }]);
    Game._removePantryKcal(1500);
    const pan = Game.state.village.pantry;
    assert.strictEqual(pan.length, 2, 'two stacks remain (6x400 + 1x100); got ' + JSON.stringify(pan));
    const rem = pan.find(function (i) { return i.kcalEach === 100; });
    assert.ok(rem, 'a 100-kcal remainder piece must exist; got ' + JSON.stringify(pan));
    assert.strictEqual(rem.units, 1, 'remainder is a whole unit, never a fraction');
    assert.strictEqual(rem.name, 'Dried meat', 'remainder keeps the food identity');
    assert.strictEqual(rem.spoilDay, 100, 'remainder keeps the spoil clock');
    // kg follows the calories proportionally, as depositPantryPieces does.
    assert.ok(Math.abs(rem.kg - 0.125) < 0.001, 'remainder kg scales 0.5 * 100/400; got ' + rem.kg);
  });
  check('remainder never merges with a full stack (no laundering)', function () {
    const p = setPantry([{ name: 'Dried meat', kcalEach: 400, units: 10, spoilDay: 100, safe: true, kg: 0.5, unit: 'strip' }]);
    Game._removePantryKcal(1500);
    const pan = Game.state.village.pantry;
    const full = pan.find(function (i) { return i.kcalEach === 400; });
    const rem = pan.find(function (i) { return i.kcalEach === 100; });
    assert.ok(full && rem, 'both stacks present');
    assert.strictEqual(Game.stacksMatch(full, rem), false, 'stacksMatch must refuse: kcalEach and kg differ');
    // And the remainder eaten at its true value, never a full bite:
    assert.strictEqual(rem.kcalEach, 100, 'a bite of the remainder grants 100, not 400');
  });

  // --- Edge cases ----------------------------------------------------------
  check('item smaller than amount: 5x100, take 1500 pays 500, pantry empties', function () {
    const p = setPantry([{ name: 'Dried beans', kcalEach: 100, units: 5, spoilDay: 200, safe: true, kg: 0.2, unit: 'scoop' }]);
    const paid = Game._removePantryKcal(1500);
    assert.strictEqual(paid, 500, 'honest underpay: everything there was; got ' + paid);
    assert.strictEqual(Game.state.village.pantry.length, 0, 'pantry empties');
  });
  check('exact item: 3x500, take 1500 pays 1500, no remainder minted', function () {
    const p = setPantry([{ name: 'Smoked fish', kcalEach: 500, units: 3, spoilDay: 60, safe: true, kg: 0.4, unit: 'fillet' }]);
    const paid = Game._removePantryKcal(1500);
    assert.strictEqual(paid, 1500);
    assert.strictEqual(Game.state.village.pantry.length, 0, 'no remainder when the take divides exactly');
  });
  check('multiple items, exact fit: takes latest-spoiling first, leaves the rest', function () {
    const p = setPantry([
      { name: 'Dried meat', kcalEach: 400, units: 2, spoilDay: 50, safe: true, kg: 0.5, unit: 'strip' },
      { name: 'Trail mix', kcalEach: 300, units: 10, spoilDay: 90, safe: true, kg: 0.3, unit: 'bag' },
    ]);
    const paid = Game._removePantryKcal(1500);
    assert.strictEqual(paid, 1500, '5x300 from the late stack; got ' + paid);
    const pan = Game.state.village.pantry;
    assert.strictEqual(pan.length, 2, 'both stacks survive');
    const meat = pan.find(function (i) { return i.name === 'Dried meat'; });
    const mix = pan.find(function (i) { return i.name === 'Trail mix'; });
    assert.strictEqual(meat.units, 2, 'early stack untouched');
    assert.strictEqual(mix.units, 5, 'late stack reduced 10 -> 5');
  });
  check('split across stacks: 3x200 + 5x700, take 1500 leaves 2600', function () {
    const p = setPantry([
      { name: 'Foraged food', kcalEach: 200, units: 3, spoilDay: 10, safe: true, kg: 0.2 },
      { name: 'Roast haunch', kcalEach: 700, units: 5, spoilDay: 90, safe: true, kg: 0.7 },
    ]);
    const before = pantryTotal(p);
    assert.strictEqual(before, 4100);
    const paid = Game._removePantryKcal(1500);
    assert.strictEqual(paid, 1500, '2x700 + 100 from a split unit; got ' + paid);
    assert.strictEqual(pantryTotal(Game.state.village.pantry), 2600, 'pantry conserves: 4100 - 1500');
    const pan = Game.state.village.pantry;
    const rem = pan.find(function (i) { return i.kcalEach === 600; });
    assert.ok(rem, '600-kcal remainder of the split haunch; got ' + JSON.stringify(pan));
    assert.strictEqual(rem.units, 1);
    assert.ok(Math.abs(rem.kg - 0.6) < 0.001, 'remainder kg 0.7 * 600/700; got ' + rem.kg);
    const early = pan.find(function (i) { return i.name === 'Foraged food'; });
    assert.strictEqual(early.units, 3, 'early stack untouched once the take is satisfied');
  });
  check('empty pantry pays 0; take larger than pantry pays the total', function () {
    setPantry([]);
    assert.strictEqual(Game._removePantryKcal(1500), 0, 'empty pantry pays nothing');
    setPantry([{ name: 'Dried beans', kcalEach: 150, units: 2, spoilDay: 200, safe: true, kg: 0.2 }]);
    assert.strictEqual(Game._removePantryKcal(5000), 300, 'pays everything there is, no more');
    assert.strictEqual(Game.state.village.pantry.length, 0);
  });
  check('conservation: a run of takes never over- or under-draws', function () {
    const p = setPantry([
      { name: 'Dried meat', kcalEach: 400, units: 7, spoilDay: 40, safe: true, kg: 0.5, unit: 'strip' },
      { name: 'Trail mix', kcalEach: 300, units: 6, spoilDay: 80, safe: true, kg: 0.3, unit: 'bag' },
      { name: 'Smoked fish', kcalEach: 500, units: 4, spoilDay: 120, safe: true, kg: 0.4, unit: 'fillet' },
      { name: 'Dried beans', kcalEach: 150, units: 9, spoilDay: 200, safe: true, kg: 0.2, unit: 'scoop' },
    ]);
    let total = pantryTotal(p);
    assert.strictEqual(total, 7 * 400 + 6 * 300 + 4 * 500 + 9 * 150);
    let paidSum = 0;
    [1500, 2000, 400, 5000, 700].forEach(function (want) {
      const before = pantryTotal(Game.state.village.pantry);
      const paid = Game._removePantryKcal(want);
      paidSum += paid;
      assert.ok(paid <= want, 'never pays more than asked: want ' + want + ' paid ' + paid);
      assert.strictEqual(pantryTotal(Game.state.village.pantry), before - paid,
        'pantry loses exactly what was paid (want ' + want + ', paid ' + paid + ')');
      Game.state.village.pantry.forEach(function (it) {
        assert.ok(Number.isInteger(it.units) && it.units >= 1, 'no fractional units: ' + JSON.stringify(it));
        assert.ok(it.kcalEach > 0, 'no dead pieces: ' + JSON.stringify(it));
      });
    });
    assert.strictEqual(pantryTotal(Game.state.village.pantry), total - paidSum,
      'series total conserves (short takes pay what is there)');
  });

  // --- Live sim leg --------------------------------------------------------
  await checkAsync('live smoke: 150201 answermail 150d, every tend pays exactly 1500', async function () {
    const outDir = fs.mkdtempSync(path.join('/tmp', 'tendexact-proof-'));
    const env = Object.assign({}, process.env, {
      SEEDS: '150201', DAYS: '150', RUN: 'tendexact-proof', POLICY: 'answermail', OUTDIR: outDir,
    });
    const out = execFileSync('node', [path.join(REPO, 'scripts', 'tendexact-driver-20261110.js')], { env: env, timeout: 900000 }).toString();
    const line = JSON.parse(out.trim().split('\n').pop());
    assert.strictEqual(line.seed, 150201);
    assert.strictEqual(line.errors, 0, 'instrument errors 0; got ' + line.errors);
    const file = path.join(outDir, 'tendexact-s150201-tendexact-proof.json');
    const run = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(run.tendPaid && run.tendPaid.length >= 1, 'at least one tend fired; stats=' + JSON.stringify(run.answermailStats));
    run.tendPaid.forEach(function (tp) {
      assert.strictEqual(tp.paid, 1500, 'tend day ' + tp.day + ' paid ' + tp.paid + ', not 1500');
    });
    console.log('    smoke: days=' + run.days + ' tends=' + run.tendPaid.length
      + ' paid=[' + run.tendPaid.map(function (x) { return x.paid; }).join(',') + ']'
      + ' cappedTends=' + run.cappedTends.length + ' capLost=' + run.cappedTends.reduce(function (s, c) { return s + c.lost; }, 0));
  });

  console.log(passed + ' checks passed');
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
