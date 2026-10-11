#!/usr/bin/env node
// test-follower-haven-20261011.js — PROOF for the follower-haven fix.
//
// BUG (found by journey-deepening r3, probe seed 11): a monster with
// `follows:true` chased the player through travelTo() onto HAVEN tiles —
// the travelTo follower re-entry branch had no isSafeTile check, while every
// other spawn/movement path (checkEncounter, moveWanderer, pickWorldTile,
// wanderWorldMonsters) respects "HAVENS ARE SAFE" (Steve 2026-10-05).
// Result: 5 wave-3 horrors (spool/buffering/redactor/chorus_line) invaded
// the sanctuary and killed 5 consecutive bearers at Haven.
// Companion bug: "It followed you. The The Redactor is here." — monsterNoun
// already carries the article.
//
// FIX (src/js/game.js, travelTo follower branch): followers hold at the
// boundary when the arrival tile is safe ("The walls end the argument");
// article normalized (no "The The").
//
// Usage: node scripts/test-follower-haven-20261011.js
//   PRE_FIX=1: run against the pre-fix tree (revert the game.js hunk) —
//   expect RED. Post-fix — expect GREEN.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

async function main() {
  const { Game } = await loadGame({ seed: 424242, mode: 'test-follower-haven' });
  const lines = [];
  const _say = Game.say;
  Game.say = function (...a) { lines.push(String(a[0])); try { return _say.apply(this, a); } catch (e) {} };
  const saySince = (n) => lines.slice(n);
  await setupGame(Game);

  const hx = (Game.state.village.px ?? 4), hy = (Game.state.village.py ?? 4);
  console.log(`haven at ${hx},${hy}; player at ${Game.map.px},${Game.map.py}`);
  ok(Game.isSafeTile(hx, hy), 'haven tile is safe');

  // find a wild (non-safe), UNBLOCKED tile within travel range of haven
  const targets = Game.travelTargets() || [];
  const open = (x, y) => { try { return !Game.travelBlockage(x, y); } catch (e) { return true; } };
  const wild = targets.find(t => !Game.isSafeTile(t.x, t.y) && open(t.x, t.y));
  ok(!!wild, `found wild open travel target near haven (${wild && wild.x},${wild && wild.y})`);
  const wx = wild.x, wy = wild.y;
  const mv1 = Game.travelTo(wx, wy);
  ok(Game.map.px === wx && Game.map.py === wy, `player moved to wild tile (${wx},${wy})`);
  // clear any random encounter monster so monsterAt finds OUR spool
  for (const m of Game.worldMonsters().filter(m => m.tx === wx && m.ty === wy)) {
    try { Game.removeWorldMonster(m); } catch (e) {}
  }

  // --- TEST 1: wave-3 follower does NOT enter haven ---
  const spool = Game.spawnWorldMonster({ id: 'spool' }, wx, wy, { mx: 4, my: 4 });
  ok(!!spool && spool.tx === wx && spool.ty === wy, 'spool spawned on wild tile');
  ok(Game.monsterAt(wx, wy) && Game.monsterAt(wx, wy).id === 'spool', 'monsterAt sees spool on old tile');
  const n0 = lines.length;
  Game.travelTo(hx, hy);
  const spoolAfter = Game.worldMonsters().find(m => m.id === 'spool');
  const newLines = saySince(n0).join('\n');
  ok(spoolAfter && spoolAfter.tx === wx && spoolAfter.ty === wy,
    `spool HELD at boundary (tx,ty still ${wx},${wy}, got ${spoolAfter && spoolAfter.tx},${spoolAfter && spoolAfter.ty})`);
  ok(!Game.monsterAt(hx, hy) || Game.monsterAt(hx, hy).id !== 'spool', 'no spool on haven tile');
  ok(/treeline|walls end the argument/i.test(newLines), 'said the hold-at-boundary line');
  ok(!/followed you/i.test(newLines), 'did NOT say "followed you" into haven');

  // --- TEST 2: follower still follows onto WILD tiles (existing behavior) ---
  // go to the spool's tile, then pick a second wild target from THERE
  Game.travelTo(wx, wy);
  ok(Game.map.px === wx && Game.map.py === wy, `player moved to spool tile (${wx},${wy})`);
  // clear any random-encounter monster so monsterAt finds OUR spool,
  // then RE-PIN the spool to the player's tile (wanderWorldMonsters may have
  // drifted it during the arrival's worldTick — the living world moves)
  for (const m of Game.worldMonsters().filter(m => m.tx === wx && m.ty === wy && m.id !== 'spool')) {
    try { Game.removeWorldMonster(m); } catch (e) {}
  }
  const spoolRef = Game.worldMonsters().find(m => m.id === 'spool');
  if (spoolRef) { spoolRef.tx = Game.map.px; spoolRef.ty = Game.map.py; }
  const targets2 = (Game.travelTargets() || []).filter(t => !Game.isSafeTile(t.x, t.y) && open(t.x, t.y));
  const wild2 = targets2[0];
  ok(!!wild2, `found second wild travel target (${wild2 && wild2.x},${wild2 && wild2.y})`);
  const wx2 = wild2.x, wy2 = wild2.y;
  const n1 = lines.length;
  Game.travelTo(wx2, wy2);
  ok(Game.map.px === wx2 && Game.map.py === wy2, `player moved to second wild tile`);
  const spoolAfter2 = Game.worldMonsters().find(m => m.id === 'spool');
  const newLines2 = saySince(n1).join('\n');
  ok(spoolAfter2 && spoolAfter2.tx === wx2 && spoolAfter2.ty === wy2,
    `spool followed onto wild tile (${wx2},${wy2})`);
  ok(/followed you/i.test(newLines2), 'said "followed you" for wild arrival');

  // --- TEST 3: no double article ("The The Redactor") ---
  // The bug only shows on the NAMED path (monsterNoun returns "The Redactor"
  // once the village names it / System arrives) — so name it via the codex.
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  Game.state.codex.monsters['redactor'] = { villageName: 'The Redactor' };
  ok(Game.monsterNoun('redactor') === 'The Redactor', 'redactor noun is proper ("The Redactor")');
  // put a redactor on a wild tile with the player, then travel wild->wild
  const cur = { x: Game.map.px, y: Game.map.py };
  for (const m of Game.worldMonsters().filter(m => m.tx === cur.x && m.ty === cur.y)) {
    try { Game.removeWorldMonster(m); } catch (e) {}
  }
  const redRef = Game.spawnWorldMonster({ id: 'redactor' }, cur.x, cur.y, { mx: 4, my: 4 });
  const targets3 = (Game.travelTargets() || []).filter(t => !Game.isSafeTile(t.x, t.y) && open(t.x, t.y));
  ok(targets3.length > 0, 'wild target available for redactor follow test');
  const n2 = lines.length;
  Game.travelTo(targets3[0].x, targets3[0].y);
  const newLines3 = saySince(n2).join('\n');
  const redAfter = Game.worldMonsters().find(m => m.id === 'redactor');
  const redNear = redAfter && Math.abs(redAfter.tx - targets3[0].x) <= 1 && Math.abs(redAfter.ty - targets3[0].y) <= 1;
  ok(redNear, `redactor followed onto wild tile (at ${redAfter && redAfter.tx},${redAfter && redAfter.ty}, target ${targets3[0].x},${targets3[0].y} — one wander step allowed)`);
  ok(!/The The/i.test(newLines3), 'no "The The" in follow line');
  ok(/The Redactor is here/i.test(newLines3), 'redactor follow line reads "The Redactor is here"');

  // --- TEST 4: non-follower still stays behind (unchanged) ---
  const cur4 = { x: Game.map.px, y: Game.map.py };
  for (const m of Game.worldMonsters().filter(m => m.tx === cur4.x && m.ty === cur4.y)) {
    try { Game.removeWorldMonster(m); } catch (e) {}
  }
  Game.spawnWorldMonster({ id: 'ducks_in_a_row' }, cur4.x, cur4.y, { mx: 4, my: 4 });
  const targets4 = (Game.travelTargets() || []).filter(t => !(t.x === cur4.x && t.y === cur4.y));
  ok(targets4.length > 0, 'travel target available for non-follower test');
  Game.travelTo(targets4[0].x, targets4[0].y);
  const duck = Game.worldMonsters().find(m => m.id === 'ducks_in_a_row');
  ok(duck && duck.tx === cur4.x && duck.ty === cur4.y, 'non-follower stays on old tile');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
