#!/usr/bin/env node
// test-lingerer-empty-pantry-r143-20261105.js — journey-endgame r143.
// WART (r143 pilot, seed 89701, the scattering nights): "🌙 Night. The
// lingering The Influencer gorges at the treeline — 0 kcal gone from the
// stores." A raider that takes nothing cannot be said to gorge. The line
// is built in havenGrowthDaily from raidPillage's real draw, so when the
// pantry is empty the number is honestly 0 and the verb is the lie.
//   Fix (havenGrowth.js): got > 0 keeps the gorge line; got == 0 says the
//     raider circles empty stores with nothing left to take. The sortie
//     offer (lastLingererOffer) is recorded either way — the raider is
//     still there, and the answer still stands.
// Proof: a live game with a stubbed lingering monster, havenGrowthDaily
// called twice — once with a full pantry (control: gorge line, nonzero
// kcal), once drained (fixed: empty-stores line, no "0 kcal gone").
// RED on old code: the drained call says "gorges — 0 kcal gone".
// Usage: node scripts/test-lingerer-empty-pantry-r143-20261105.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const L = require('./godpath/lib.js');

(async () => {
  const { Game } = await loadGame({ seed: 777 });
  await setupGame(Game, 'Columbus, Ohio');
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 0;
  assert.ok(typeof Game.havenGrowthDaily === 'function', 'Game.havenGrowthDaily must exist');
  assert.ok(Game.pantryKcal(v) > 0, 'fresh game must start with food in the pantry');

  // One lingering raider at the treeline, stamped today (no drift).
  const raider = { id: 'influencer', lingering: true, hp: 100, lingerSince: day };
  Game.worldMonsters = () => [raider];

  // Control: full pantry — the gorge line with a real nonzero take.
  const lines = L.captureSays(Game);
  Game.havenGrowthDaily();
  const gorge = lines.filter(l => /gorges at the treeline/.test(l));
  console.log('control lines:', JSON.stringify(gorge));
  assert.ok(gorge.length >= 1, 'full pantry: the gorge line must fire');
  const m = gorge[0].match(/([\d,]+) kcal gone/);
  assert.ok(m && parseInt(m[1].replace(/,/g, ''), 10) > 0, 'full pantry: the gorge must take a nonzero amount, got: ' + (m && m[1]));

  // Fixed: drained pantry — no gorge, the empty-stores line instead.
  const drained = Game.pantryDraw(v, 1e9, {});
  assert.strictEqual(Game.pantryKcal(v), 0, 'pantry must drain to 0, took ' + (drained && drained.taken));
  lines.length = 0;
  Game.havenGrowthDaily();
  const empty = lines.filter(l => /nothing left to take/.test(l));
  const zeroGorge = lines.filter(l => /0 kcal gone/.test(l));
  console.log('empty lines:', JSON.stringify(empty));
  console.log('zero-gorge lines:', JSON.stringify(zeroGorge));
  assert.ok(empty.length >= 1, 'empty pantry: the empty-stores line must fire');
  assert.strictEqual(zeroGorge.length, 0, 'empty pantry: no line may say "0 kcal gone"');
  lines.restore();
  console.log('PASS test-lingerer-empty-pantry-r143');
  process.exit(0);
})().catch(e => { console.error('FAIL test-lingerer-empty-pantry-r143:', e && e.message); process.exit(1); });
