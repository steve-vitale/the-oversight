#!/usr/bin/env node
// test-spliteam-restore-20261013.js — restores Steve's 2026-10-05 split-team
// rebalance (043f320f), silently wiped by 0b0e252b's index sweep.
// resolveSplitTeam must use threat/3.5 (baseline-player units): a lone
// villager vs a gallowdeer LOSES; pairs are bloody but viable; weak threats
// (hushwolf) stay winnable solo.
// RED on pristine (/50: solo villager always "wins"), GREEN after.
'use strict';
const { loadGame } = require('./sim-harness');

const GALLOWDEER = { id: 'gallowdeer', hp: [95, 115], attack: { damage: [22, 32] } };
const WOLF = { id: 'hushwolf', hp: [25, 35], attack: { damage: [12, 18] } };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 424242, mode: 'mvc' });

  // Static: the divisor must be /3.5, not /50.
  const src = require('fs').readFileSync(
    require('path').join(__dirname, '..', 'src/js/party-formal.js'), 'utf8');
  ok('divisor is /3.5', /threatPower\(mdef\)\s*\/\s*3\.5/.test(src));
  ok('POWER SCALE comment present', src.includes('POWER SCALE (Steve 2026-10-05)'));

  // Build a minimal village with villagers to send.
  Game.newGame({ seed: 424242 });
  const vids = Object.keys(Game.state.village.villagers || {});
  if (vids.length < 3) { console.log('SKIP: need 3 villagers'); process.exit(2); }
  const [A, B, C] = vids;

  // Sweep the RNG across the roll space for each matchup.
  function outcomes(team, mdef, rolls) {
    const out = {};
    for (const r of rolls) {
      const real = Math.random;
      Math.random = () => r;
      try {
        const res = Game.resolveSplitTeam(team, mdef, mdef.id);
        out[res.result] = (out[res.result] || 0) + 1;
      } finally { Math.random = real; }
    }
    return out;
  }
  const ROLLS = [0.05, 0.3, 0.5, 0.7, 0.95];

  const soloDeer = outcomes([A], GALLOWDEER, ROLLS);
  ok('solo villager vs gallowdeer never wins outright',
    !soloDeer.won, JSON.stringify(soloDeer));
  ok('solo villager vs gallowdeer loses at least sometimes',
    (soloDeer.lost || 0) > 0, JSON.stringify(soloDeer));

  const pairDeer = outcomes([A, B], GALLOWDEER, ROLLS);
  ok('pair vs gallowdeer can win', (pairDeer.won || 0) + (pairDeer.costly || 0) > 0,
    JSON.stringify(pairDeer));

  const trioDeer = outcomes([A, B, C], GALLOWDEER, ROLLS);
  ok('trio vs gallowdeer usually wins',
    (trioDeer.won || 0) >= 3, JSON.stringify(trioDeer));

  const soloWolf = outcomes([A], WOLF, ROLLS);
  ok('solo villager vs hushwolf can win (weak threat stays winnable)',
    (soloWolf.won || 0) > 0, JSON.stringify(soloWolf));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(2); });
