#!/usr/bin/env node
// test-wave4encounter-diag-20261103.js — proof test for the wave-4
// encounter instrument (scripts/wave4encounter-instrument-20261103.js).
// Loads the game once (seeded harness), installs the instrument, and
// proves: (1) spawnWaveTarget/castMonster rows are recorded with the
// pool-top wave and the def wave; (2) a synthetic wave-4 spawn is
// recorded with wave 4, tile, and caller attribution; (3) its removal
// is recorded (not fight-start, since no fight started); (4) uninstall
// restores the original methods. No game code is changed, no judged
// sim is run — this is the instrument's own proof, not a pilot seed.
// Usage: node scripts/test-wave4encounter-diag-20261103.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const INST = require(path.join(REPO, 'scripts', 'wave4encounter-instrument-20261103'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const origTarget = Game.spawnWaveTarget, origCast = Game.castMonster;
  const origSpawn = Game.spawnWorldMonster, origRemove = Game.removeWorldMonster;
  const inst = INST.install(Game);
  const t = inst.t;

  // (1) spawnWaveTarget: one call -> one row, target in 1..5, poolTop sane.
  const pool = Game.monsterWavePool ? Game.monsterWavePool() : Game.data.monsters;
  const target = Game.spawnWaveTarget(pool);
  check('target row recorded', t.targetRows.length === 1, t.targetRows);
  check('target in range', target >= 1 && target <= 5, target);
  check('target row target matches return', t.targetRows[0] && t.targetRows[0].target === target, t.targetRows[0]);
  let top = 1; for (const m of pool) top = Math.max(top, m.wave || 1);
  check('target row poolTop matches pool', t.targetRows[0] && t.targetRows[0].poolTop === top, t.targetRows[0]);

  // (2) castMonster: one call -> one row, wave matches the def.
  const cast = Game.castMonster();
  const castId = (cast && cast.id) || cast;
  const def = (Game.data.monsters || []).find(function (m) { return m.id === castId; });
  check('cast row recorded', t.castRows.length === 1, t.castRows);
  check('cast row wave matches def', t.castRows[0] && def && t.castRows[0].wave === (def.wave || 1), { row: t.castRows[0], defWave: def && def.wave });

  // (3) Synthetic wave-4 spawn + removal attribution.
  const before = t.spawnRows.length;
  const mon = Game.spawnWorldMonster({ id: 'eater' }, 3, 3, { mx: 4, my: 4 });
  check('spawn returns eater', !!(mon && mon.id === 'eater'), mon);
  const row = t.spawnRows[t.spawnRows.length - 1];
  check('spawn row recorded', t.spawnRows.length === before + 1, row);
  check('spawn row wave is 4', row && row.wave === 4, row);
  check('spawn row tile matches', row && row.tx === 3 && row.ty === 3, row);
  check('spawn row distances are numbers', row && typeof row.distPlayer === 'number' && typeof row.distHome === 'number', row);
  check('spawn row caller is a string', row && typeof row.caller === 'string' && row.caller.length > 0, row);
  const remBefore = t.removeRows.length;
  Game.removeWorldMonster(mon);
  const rrow = t.removeRows[t.removeRows.length - 1];
  check('remove row recorded', t.removeRows.length === remBefore + 1, rrow);
  check('remove row wave is 4', rrow && rrow.wave === 4, rrow);
  check('remove row is not fight-start', rrow && rrow.cls === 'other', rrow);
  check('remove row hp recorded', rrow && typeof rrow.hp === 'number', rrow);

  // (4) Daily snapshot runs without throwing and records unlock/pool.
  let snap = null;
  try { snap = inst.snapshot(); } catch (e) { snap = { error: String(e.message) }; }
  check('snapshot returns day + pool', !!(snap && typeof snap.day === 'number' && snap.poolByWave), snap);

  // (5) Uninstall restores originals exactly.
  inst.uninstall();
  check('uninstall restores spawnWaveTarget', Game.spawnWaveTarget === origTarget);
  check('uninstall restores castMonster', Game.castMonster === origCast);
  check('uninstall restores spawnWorldMonster', Game.spawnWorldMonster === origSpawn);
  check('uninstall restores removeWorldMonster', Game.removeWorldMonster === origRemove);

  console.log(`\n${checks - fails}/${checks} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF-FAILED', e && e.stack || e); process.exit(1); });
