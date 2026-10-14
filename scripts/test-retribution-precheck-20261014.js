#!/usr/bin/env node
// test-retribution-precheck-20261014.js — a refused Unleash costs nothing.
//
// Bug: useAbility paid the turn + 30 kcal, then the impl called BA.unleash
// (empties the battery, applies the 25% self-hit) and only THEN looked for an
// adjacent enemy. With nobody adjacent the stored fury, the HP and the turn
// were all lost on a known no-op (abilityActions precheck_before_payment).
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('retribution-precheck');

(async () => {
  const Game = await K.load({ seed: 1014 });
  K.newRun(Game);
  K.openSlots(Game, 6);
  K.giveAbility(Game, 'retribution');
  const s = Game.state.scholar;

  // Not adjacent: monster 4 tiles away.
  K.fight(Game, 'hushwolf', { px: 2, py: 4, mx: 6, my: 4 });
  const p = Game.tbFighter('p');
  s.kcal = 3000;
  s.buildaround = { retribution: 60 };
  const hp0 = p.hp, kcal0 = s.kcal;
  const r = Game.useAbility('retribution', 'unleash');
  T.ok('unleash refused with nobody adjacent', r === false);
  T.ok('battery kept', s.buildaround.retribution === 60, JSON.stringify(s.buildaround));
  T.ok('no self-damage', p.hp === hp0, `${hp0} -> ${p.hp}`);
  T.ok('no kcal spent', s.kcal === kcal0, `${kcal0} -> ${s.kcal}`);
  T.ok('turn not spent', !p.acted);

  // Adjacent: it fires.
  const mf = K.fight(Game, 'hushwolf', { px: 2, py: 4, mx: 3, my: 4 });
  mf.hp = mf.maxHp = 1000;
  s.buildaround = { retribution: 60 };
  const mhp0 = mf.hp;
  const r2 = Game.useAbility('retribution', 'unleash');
  T.ok('unleash fires with an adjacent enemy', r2 === true && mf.hp < mhp0, `r=${r2} hp ${mhp0} -> ${mf.hp}`);
  T.ok('battery spent on a real unleash', s.buildaround.retribution === 0);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 2; });
