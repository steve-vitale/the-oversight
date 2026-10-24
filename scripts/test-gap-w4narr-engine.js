#!/usr/bin/env node
// test-gap-w4narr-engine.js — proof for gap phase2 W4-narration-rest engine fixes.
//   #161 spawnWorldMonster carries wave (def wave; opts override).
//   #107 arena loss reports cause 'the arena', not generic 'combat'.
//   #807 mantleBecome preserves each item's own units + kcalEach (no
//        units:1/kcalEach:0 collapse, duplicate ids stay distinct).
// Uses scripts/sim-harness.js. Writes nothing into the repo.
'use strict';
const fs = require('fs');
const { loadGame, quietLog } = require('./sim-harness');
let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '  -- ' + detail : '')); }
}
async function main() {
  const { Game } = await loadGame({ seed: 20261024, mode: 'gap-w4narr-engine' });
  await quietLog(async () => {
    Game.genRoster('Columbus, Ohio');
    Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  });
  // #161
  const m1 = Game.spawnWorldMonster({ id: 'hushwolf' }, 0, 0, {});
  ok(m1 && m1.wave === 1, 'world spawn carries def wave (hushwolf=1)', JSON.stringify(m1 && m1.wave));
  const m3 = Game.spawnWorldMonster({ id: 'redactor' }, 0, 0, {});
  ok(m3 && m3.wave === 3, 'world spawn carries def wave (redactor=3)', JSON.stringify(m3 && m3.wave));
  const mO = Game.spawnWorldMonster({ id: 'hushwolf' }, 0, 0, { wave: 5 });
  ok(mO && mO.wave === 5, 'opts wave overrides def wave', JSON.stringify(mO && mO.wave));
  // #107 (source-level: the arena-loss branch; driving a full arena loss
  // to playerDeath is a contest-fixture job, the branch identity is the fix)
  const gsrc = fs.readFileSync(__dirname + '/../src/js/game.js', 'utf8');
  ok(/arena loss path/.test(gsrc) && /playerDeath\('the arena'\)/.test(gsrc), 'arena loss branch reports the arena');
  const arenaIdx = gsrc.indexOf('playerDeath(\'the arena\')');
  ok(gsrc.indexOf('playerDeath(\'combat\')') === -1, 'no playerDeath(combat) remains in game.js');
  // #807
  const succ = Game.state.village.roster.find(id => id !== Game.villagerId);
  ok(!!succ, 'successor exists');
  const person = Game.getPerson(succ);
  const before = person.items;
  person.items = [
    { itemId: 'stone_knife', units: 4, kcalEach: 400, name: 'Stone knife' },
    { itemId: 'stone_knife', units: 2, kcalEach: 400, name: 'Stone knife' },
    { itemId: 'rope', units: 3, kcalEach: 0, name: 'Rope' },
  ];
  person.equipped = {};
  const res = Game.mantleBecome(Game.villagerId, succ);
  ok(res === true, 'mantleBecome succeeds');
  const inv = Game.state.scholar.inventory || [];
  const knives = inv.filter(i => i.itemId === 'stone_knife');
  ok(knives.length === 2, 'duplicate ids stay two entries', JSON.stringify(inv.map(i => i.itemId)));
  const units = knives.map(i => i.units).sort().join(',');
  ok(units === '2,4', 'each copy keeps its own units', units);
  ok(knives.every(i => i.kcalEach === 400), 'kcalEach preserved (not zeroed)');
  const rope = inv.find(i => i.itemId === 'rope');
  ok(rope && rope.units === 3, 'third item units preserved');
  person.items = before;
  console.log(fail ? `FAILURES: ${fail}` : `ALL PASS (${pass})`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
