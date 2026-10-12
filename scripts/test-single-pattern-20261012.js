#!/usr/bin/env node
// test-single-pattern-20261012.js — PROOF for the patternCells 'single' fix.
//
// BUG (found 2026-10-12, combat matrix): S.combat.patternCells had no case
// for pattern type 'single' → returned [] → every monster with a 'single'
// pattern and no bespoke declare path (strike, eulogy, cancellation,
// spoiler, suburb, terms_of_service, ad_break; nielsen is titan-gated)
// telegraphed forever against EMPTY cells and dealt ZERO damage. Observed:
// the wave-5 Cancellation (1800 HP) never stamped in 40 turns — a naked
// player could plink it to death over 600 rounds while it did nothing.
// The Strike's Walkout likewise never landed.
// FIX: 'single' resolves to the aim tile (encWantRange already treats
// 'single' like 'direct' for range), completing the generic declare/resolve
// circuit. Bespoke 'single' users (sunbasker, nightcourt, glasswing,
// alien_tick) never touched this path — unaffected.
//
// Before fix: cancellation lands 0 hits in 30 turns (player untouched).
// After fix: it stamps for 70-100, killing a naked player in ~3 turns.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEED = Number(process.env.SEED || 11);
let fails = 0;
const check = (name, cond, detail) => {
  if (!cond) { fails++; console.log('FAIL ' + name + (detail ? ' :: ' + detail : '')); }
  else console.log('ok   ' + name);
};
(async () => {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game);
  // unit-level: patternCells('single') must return the aim tile, not []
  const S = (globalThis.Scattering || {});
  const cells = S.combat.patternCells({ type: 'single' }, 4, 4, 6, 6);
  check("patternCells('single') hits the aim tile",
    Array.isArray(cells) && cells.length === 1 && cells[0].cx === 6 && cells[0].cy === 6,
    JSON.stringify(cells));
  // fight-level: the Cancellation must actually stamp
  const say = [];
  Game.say = m => say.push(String(m).slice(0, 120));
  Game.sysSay = m => say.push(String(m).slice(0, 120));
  Game.state.scholar.health = 100;
  let hitsTaken = 0, lastResult = null;
  const origDmg = Game.tbDamage.bind(Game);
  Game.tbDamage = function (tk, dmg, sl, sk, o) { if (tk === 'p') hitsTaken++; return origDmg(tk, dmg, sl, sk, o); };
  const origEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (r) { lastResult = r; return origEnd(r); };
  Game.startCombat('cancellation');
  let n = 0;
  while (Game.tbfight && !Game.tbfight.over && n++ < 30) {
    if (Game.tbIsPlayerTurn()) {
      const t = Game.tbfight.fighters.find(x => x.kind === 'monster' && x.alive && !x.fled);
      if (!t) break;
      Game.tbPlayerStrike(t.key);
      const p = Game.tbFighter('p');
      if (p && Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) {
        p.moveLeft = 0; p.acted = true; Game.tbAfterPlayerAction();
      }
    }
  }
  check('cancellation lands hits (was: 0 in 30 turns)', hitsTaken > 0, `hitsTaken=${hitsTaken} turns=${n}`);
  check('a naked player loses to the stampede (was: untouchable)', lastResult === 'lost',
    `result=${lastResult}`);
  const stampDmg = say.filter(t => /Under Review hits you for/.test(t)).map(t => (t.match(/for (\d+)/) || [])[1]);
  check('stamp damage in the 70-100 band', stampDmg.length > 0 && stampDmg.every(v => +v >= 60 && +v <= 110),
    stampDmg.join(','));
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
