#!/usr/bin/env node
// test-armor-curve-r8-20261012.js — lever-1 r8: prove the armor model.
// Steve's armor law (AGENTS.md ARMOR MODEL 2026-10-09): pieces stay additive
// into P, then r = P/(P+20); absorbed = min(hit-1, round(hit*r)).
// Drives the REAL tbDamage (not a copy of the formula) with controlled P
// (armorBonus override = the measurement input; the curve is the code under
// test) and asserts the returned damage-taken matches the documented curve.
// Also: the hit-1 clamp (at least 1 always lands) and the pierce hook.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, actual, expected) {
  if (actual === expected) { pass++; }
  else { fail++; console.log(`FAIL ${name}: got ${actual}, expected ${expected}`); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'test' });
  await setupGame(Game);
  // Silence narration; keep it fast.
  const osay = Game.say; Game.say = function () {};

  Game.startCombat('hummice');
  if (!Game.tbfight) { console.log('FAIL setup: no fight'); process.exit(1); }
  const p = Game.tbFighter('p');
  const m = Game.tbfight.fighters.find(x => x.kind === 'monster');

  const expected = (P, hit, pierce) => {
    if (!(P > 0) || !(hit > 0)) return hit;
    const effP = P * (1 - Math.min(0.9, Math.max(0, pierce || 0)));
    const r = effP / (effP + 20);
    return hit - Math.min(hit - 1, Math.round(hit * r));
  };

  const cases = [
    // [P, hit, pierce, label]
    [0, 10, 0, 'naked'],
    [0, 32, 0, 'naked-big'],
    [10, 10, 0, 'bark-vs-10'],    // bark_armor P=10
    [10, 14, 0, 'bark-vs-14'],    // hushwolf-ish
    [10, 20, 0, 'bark-vs-20'],
    [10, 32, 0, 'bark-vs-32'],
    [10, 1, 0, 'bark-chip-1'],    // hit-1 clamp: at least 1 lands
    [10, 2, 0, 'bark-chip-2'],
    [20, 20, 0, 'hide-vs-20'],    // hide_armor P=20 halves
    [40, 60, 0, 'carapace-vs-60'], // alien_carapace P=40
    [40, 60, 0.25, 'carapace-vs-60-pierce25'], // wave-3 pierce hook
    [100, 50, 0, 'P100-vs-50'],   // ~83% curve, never immune
    [100, 3, 0, 'P100-chip-3'],   // clamp still lets 1 through
  ];
  for (const [P, hit, pierce, label] of cases) {
    Game.armorBonus = () => P;
    try { if (m && m.mdef) m.mdef.pierce = pierce; } catch (e) {}
    p.hp = 5000; p.maxHp = 5000; p.alive = true;
    const taken = Game.tbDamage('p', hit, 'test-blade', m ? m.key : null, { undodgeable: true, quiet: true });
    check(`armor ${label} P=${P} hit=${hit} pierce=${pierce}`, taken, expected(P, hit, pierce));
  }

  // Villager armor uses the same curve (varmor block).
  const v = Game.tbfight.fighters.find(x => x.kind === 'villager');
  if (v) {
    v.varmor = 10; v.hp = 5000; v.maxHp = 5000; v.alive = true;
    try { if (m && m.mdef) m.mdef.pierce = 0; } catch (e) {}
    const taken = Game.tbDamage(v.key, 20, 'test-blade', m ? m.key : null, { undodgeable: true, quiet: true });
    check('villager bark-vs-20', taken, expected(10, 20, 0));
  } else {
    console.log('(no villager fighter in test fight — villager block covered by probe data)');
  }

  Game.say = osay;
  console.log(`\narmor-curve: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
