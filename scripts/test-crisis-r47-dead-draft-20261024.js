#!/usr/bin/env node
// test-crisis-r47-dead-draft-20261024.js — CRISIS LEG r47 proof: DEAD RAIDERS
// DON'T GET DRAFTED.
//
// Observed in natural play (seeds 9402 d18, 9403 d26): havenRaidTick drafts
// the nearest world monsters with NO hp check, so a 0-hp corpse is announced
// as a raider, gets the "Nobody met <name> — it's still out there at the
// treeline. It'll gorge every night" line, then never gorges (the dawn loop
// skips hp<=0) while the crisis resolves 'fought' for a threat that was never
// there — a phantom lingerer. r5 (2026-10-12) fixed the player-facing raider
// ("DEAD RAIDERS DON'T WALK") but not the draft itself.
//
// RED on pristine: the corpse is drafted (named in the raid line / lingering).
// GREEN after fix: the draft filters hp<=0; only the living are announced.
// Usage: node scripts/test-crisis-r47-dead-draft-20261024.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'crisis-r47-proof' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;

  // clear the board, then place 4 monsters: a corpse NEAREST haven + 3 living
  try {
    for (const m of (Game.worldMonsters() || []).slice()) {
      if (Game.removeWorldMonster) Game.removeWorldMonster(m);
    }
  } catch (e) {}
  const corpse = Game.spawnWorldMonster({ id: 'hushwolf' }, hx + 1, hy, { hp: 0, maxHp: 120 });
  Game.spawnWorldMonster({ id: 'bulldozer' }, hx + 2, hy, {});
  Game.spawnWorldMonster({ id: 'gallowdeer' }, hx, hy + 2, {});
  Game.spawnWorldMonster({ id: 'mirrormoth' }, hx + 2, hy + 2, {});
  let corpseName = 'hushwolf';
  try { corpseName = Game.monsterDisplayName('hushwolf') || 'hushwolf'; } catch (e) {}

  // rich-enough pantry to draw a raid, cooldown cleared
  try {
    v.pantry = v.pantry || [];
    v.pantry.push({ kcalEach: 500, units: 20, name: 'test stores' });
    v.lastRaidDay = -100;
  } catch (e) {}

  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return _say(t); };

  let fired = false;
  for (let i = 0; i < 60 && !fired; i++) {
    try { fired = !!Game.havenRaidTick(); } catch (e) { fired = false; }
  }

  const fails = [];
  function check(name, cond) {
    console.log((cond ? 'PASS' : 'FAIL') + ' — ' + name);
    if (!cond) fails.push(name);
  }
  check('raid fired', fired);
  const raidLine = said.find(l => /🐗 RAID —/.test(l)) || '';
  check('raid announced', !!raidLine);
  check('corpse NOT named in raid announcement', raidLine.indexOf(corpseName) === -1);
  check('corpse NOT marked lingering', !corpse.lingering);
  check('no "Nobody met <corpse>" line', !said.some(l => l.indexOf('Nobody met') !== -1 && l.indexOf(corpseName) !== -1));
  if (raidLine) console.log('   raid line: ' + raidLine.slice(0, 160));

  if (fails.length) { console.log(`\n${fails.length} FAILING — phantom draft present`); process.exit(1); }
  console.log('\nALL GREEN — draft excludes the dead');
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.message)); process.exit(2); });
