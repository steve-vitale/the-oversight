// test-plentyb-standing.js — plenty-stand arm proof (2026-10-13).
//
// Extends test-feast-r13.js's RED/GREEN for the r13 layer with the STANDING
// link: feasts hosted through the layer must land in state.feastLog with
// quality>=1 so standing.js counts them, and villageStanding().plenty must
// move. This is the plenty feed the wave-4 Standing bar reads.
//
// Groups:
//   G7 RED: an empty feastLog contributes 0 plenty points (standing
//       reads the log honestly — no parallel counters).
//   G8 GREEN: an end-to-end r13 feast (gate ON, tribute paid) lands in
//       state.feastLog with quality>=1, and villageStanding() counts it
//       as +20 plenty per feast.
//   G9 math: villageStanding splits {war, diplomacy, plenty} are honest
//       against scripted inputs.
//
// Run: FEASTSCALE_R13=1 node scripts/test-plentyb-standing.js
// (groups set the gate themselves; unset it to watch G8 fail honestly.)
'use strict';
const assert = require('assert');
const { loadGame } = require('./sim-harness');
const { scaleFeast } = require('./policies/feastscale');

const SEED = parseInt(process.env.SEED || '20261013', 10);

let pass = 0, fail = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('  ok -', name); }
  catch (e) { fail++; console.log('  FAIL -', name, '::', e.message); }
}

function richPantry() {
  const base = [
    { name: 'Smoked turkey leg', kcalEach: 100, units: 12, foodKind: 'meat', foodState: 'smoked' },
    { name: 'Dried berries', kcalEach: 100, units: 12, foodKind: 'plant', foodState: 'dried' },
    { name: 'Stewed roots', kcalEach: 150, units: 8, foodKind: 'plant', foodState: 'cooked' },
    { name: 'Travel bread', kcalEach: 200, units: 6, foodKind: 'plant', foodState: 'baked' },
  ];
  return base.concat(base).concat(base);
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: SEED, mode: 'plentyb-proof' });
  check('all modules load', () => assert.ok(!loadFails.length, loadFails.join(';')));

  const said = [];
  Game.say = (m) => said.push(String(m));
  Game.sysSay = () => {};

  const freshGame = () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
    Game.depart();
    assert.ok(Game.playerAtHaven(), 'fresh game not at haven');
    const s = Game.state.scholar, v = Game.state.village;
    v.pantry = richPantry();
    s.prog = s.prog || {};
    Game.state.feastLog = [];
    Game.dayPart = 2; // dusk
    said.length = 0;
    try { Game.clearFeastBuff(false); } catch (e) {}
    Game.tbfight = null;
    return { s, v, ctx: {} };
  };

  // ============ G7: RED — empty log = 0 plenty ============
  console.log('\n[G7] RED: an empty feastLog contributes zero plenty');
  {
    delete process.env.FEASTSCALE_R13;
    freshGame();
    const st = Game.villageStanding();
    check('standing math exists and reads the log', () => {
      assert.ok(st && typeof st.plenty === 'number', 'no standing breakdown');
      assert.strictEqual(st.feasts, 0, 'feasts counted with an empty log');
      assert.strictEqual(st.plenty, 0, 'plenty nonzero with an empty feastLog');
    });
    check('no parallel counters: deleting the log zeroes plenty', () => {
      Game.state.feastLog.push({ day: 1, quality: 2 });
      assert.strictEqual(Game.villageStanding().plenty, 20, 'one legendary feast != +20');
      Game.state.feastLog = [];
      assert.strictEqual(Game.villageStanding().plenty, 0, 'plenty survived the log clear — a parallel counter is cheating');
    });
  }

  // ============ G8: GREEN — end-to-end r13 feast -> log -> plenty ============
  console.log('\n[G8] GREEN: r13 feast lands in feastLog with quality>=1 and moves plenty');
  {
    process.env.FEASTSCALE_R13 = '1';
    const { s, ctx } = freshGame();
    s.prog.feastSurge = 2.0; // armed
    ctx._tribHist = [{ day: s.day, kcal: 6000 }];
    const hostCalls = [];
    const realHost = Game.hostFeast.bind(Game);
    Game.hostFeast = function (...a) { const r = realHost(...a); hostCalls.push(r); return r; };
    scaleFeast(Game, ctx);
    Game.hostFeast = realHost;
    check('feast hosted end-to-end', () => {
      assert.ok(hostCalls.length === 1 && hostCalls[0].ok, 'feast not hosted: ' + (hostCalls[0] && hostCalls[0].why));
    });
    check('feast landed in state.feastLog', () => {
      const log = Game.state.feastLog || [];
      assert.strictEqual(log.length, 1, 'feastLog length=' + log.length);
      assert.ok(typeof log[0].day === 'number', 'log entry has no day');
    });
    check('logged feast quality>=1 (fine or legendary — standing counts it)', () => {
      const log = Game.state.feastLog || [];
      const q = (log[0] && log[0].quality) | 0;
      assert.ok(q >= 1, 'logged quality=' + q + ' — standing.js would not count this feast');
    });
    check('standing plenty = +20 per major feast', () => {
      const st = Game.villageStanding();
      assert.strictEqual(st.feasts, 1, 'feasts=' + st.feasts);
      assert.strictEqual(st.plenty, 20, 'plenty=' + st.plenty);
      assert.ok(st.total >= 20, 'total=' + st.total);
    });
    check('second logged feast stacks +20 honestly', () => {
      Game.state.feastLog.push({ day: s.day + 30, quality: 1 });
      const st = Game.villageStanding();
      assert.strictEqual(st.plenty, 40, 'plenty=' + st.plenty);
      Game.state.feastLog = []; // restore: leave no trace
      delete process.env.FEASTSCALE_R13;
    });
  }

  // ============ G9: split math honesty ============
  console.log('\n[G9] standing split math on scripted inputs');
  {
    freshGame();
    const st0 = Game.villageStanding();
    check('zero-state breakdown is zero', () => {
      assert.ok(st0.war >= 0 && st0.diplomacy >= 0 && st0.plenty >= 0, JSON.stringify(st0));
      assert.strictEqual(st0.total, st0.war + st0.diplomacy + st0.plenty, 'total != sum of splits');
    });
    Game.state.feastLog = [{ day: 3, quality: 2 }, { day: 9, quality: 0 }];
    const st1 = Game.villageStanding();
    check('quality-0 feasts do NOT count (thin meals are not major)', () => {
      assert.strictEqual(st1.feasts, 1, 'feasts=' + st1.feasts);
      assert.strictEqual(st1.plenty, 20, 'plenty=' + st1.plenty);
    });
    Game.state.feastLog = [];
  }

  console.log(`\n== ${pass} pass, ${fail} fail ==`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
